import { getApiBase } from '../utils/apiBase';

const DEFAULT_MODEL = 'tts-1';
const DEFAULT_VOICE = 'shimmer';
const SILENT_MP3_DATA_URL =
  'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjgzLjEwMAAAAAAAAAAAAAAA//NAxAAAAANIAAAAABhkbHIAAAAAAAAAAABMYXZmNTcuODMuMTAw//NAxAAAAANIAAAAABxkYXRhAAAAAA==';

export const globalTTSLock = { isSpeaking: false };

let activeAudio = null;
let activeAudioUrl = null;
let audioUnlocked = false;
let pendingUnlockPromise = null;
let audioCtx = null;

export async function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch (e) {
      console.warn("Could not resume AudioContext:", e);
    }
  }
  return audioCtx;
}

function stopOpenAITTSPlayback() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = "";
    } catch (e) {
      // Ignore
    }
    activeAudio = null;
  }

  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = null;
  }
}

export async function unlockAudio() {
  if (audioUnlocked && audioCtx) {
    return audioCtx;
  }

  if (pendingUnlockPromise) {
    return pendingUnlockPromise;
  }

  pendingUnlockPromise = (async () => {
    try {
      const ctx = await getAudioContext();
      await ctx.resume();
      audioUnlocked = true;
      return ctx;
    } catch (error) {
      console.warn('⚠️ AudioContext resume failed, attempting silent unlock fallback.', error);

      if (typeof Audio === 'undefined') {
        audioUnlocked = true;
        return audioCtx;
      }

      await new Promise((resolve, reject) => {
        const silentAudio = new Audio();
        silentAudio.preload = 'auto';
        silentAudio.muted = true;
        silentAudio.loop = false;
        silentAudio.src = SILENT_MP3_DATA_URL;

        const cleanup = () => {
          silentAudio.pause();
          silentAudio.src = '';
        };

        silentAudio
          .play()
          .then(resolve)
          .catch((silentError) => {
            console.warn('⚠️ Audio unlock failed (user gesture required):', silentError);
            reject(silentError);
          })
          .finally(cleanup);
      });

      try {
        const ctx = await getAudioContext();
        await ctx.resume();
        audioUnlocked = true;
        return ctx;
      } catch (resumeError) {
        console.warn('⚠️ AudioContext still suspended after silent unlock attempt.', resumeError);
        return audioCtx;
      }
    } finally {
      pendingUnlockPromise = null;
    }
  })();

  return pendingUnlockPromise;
}

export async function playVoiceResponseWithOpenAI(text, options = {}) {
  const trimmed = (text ?? '').toString().trim();
  if (!trimmed) throw new Error('Cannot synthesize empty text');

  const voice = options.voice || DEFAULT_VOICE;
  const model = options.model || DEFAULT_MODEL;

  // Ensure AudioContext is available and resumed
  const ctx = await getAudioContext();
  await ctx.resume();

  // Fetch TTS audio from backend
  let audioArrayBuffer;
  try {
    const response = await fetch(`${getApiBase()}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, voice, model })
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    audioArrayBuffer = await response.arrayBuffer();
  } catch (error) {
    throw new Error(`OpenAI TTS failed: ${error?.message || 'Connection error'}`);
  }
  if (!audioArrayBuffer || audioArrayBuffer.byteLength === 0) {
    throw new Error('OpenAI TTS returned empty audio buffer');
  }

  const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mpeg" });
  if (!audioBlob.size) {
    throw new Error("OpenAI TTS returned invalid audio blob");
  }

  // Stop any existing playback
  stopOpenAITTSPlayback();

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.preload = "auto";

  activeAudio = audio;
  activeAudioUrl = audioUrl;

  options.onLoadStart?.();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
    };

    audio.onplay = () => {
      globalTTSLock.isSpeaking = true;
      options.onAudioStart?.();
      options.onStart?.();
    };

    audio.onended = () => {
      globalTTSLock.isSpeaking = false;
      cleanup();
      stopOpenAITTSPlayback();
      options.onAudioComplete?.();
      options.onEnded?.();
      resolve();
    };

    audio.onerror = (event) => {
      globalTTSLock.isSpeaking = false;
      cleanup();
      stopOpenAITTSPlayback();
      const error =
        event?.error || new Error("Audio playback failed");
      options.onError?.(error);
      reject(error);
    };

    const startPlayback = () => {
      const playPromise = audio.play();
      if (playPromise?.catch) {
        playPromise.catch((err) => {
          cleanup();
          stopOpenAITTSPlayback();
          options.onError?.(err);
          reject(err);
        });
      }
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      startPlayback();
    } else {
      audio.addEventListener("canplaythrough", startPlayback, { once: true });
    }
  });
}

export { stopOpenAITTSPlayback };

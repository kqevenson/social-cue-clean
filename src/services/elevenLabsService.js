/**
 * ElevenLabs Text-to-Speech Service
 * 
 * Provides warm, teacher-like voices for voice practice conversations.
 * Includes caching, error handling, and fallback to browser TTS.
 * 
 * @module elevenLabsService
 */

// Voice IDs - Warm teacher voices
const VOICES = {
  FEMALE_WARM: 'EXAVITQu4vr4xnSDxMaL', // Sarah - warm, friendly
  MALE_WARM: 'TxGEqnHWrfWFTfGW9XjX',   // Josh - warm, conversational
};

// Default voice settings
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0,
  use_speaker_boost: true,
};

// API Configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const MODEL_ID = 'eleven_monolingual_v1';

// Audio cache using IndexedDB
let audioCache = null;
let dbInstance = null;

/**
 * Initialize IndexedDB for audio caching
 */
async function initCache() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('elevenlabs_audio_cache', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('audio')) {
        const store = db.createObjectStore('audio', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Cache audio data
 */
async function cacheAudio(key, audioBlob) {
  try {
    const db = await initCache();
    const transaction = db.transaction(['audio'], 'readwrite');
    const store = transaction.objectStore('audio');
    
    await store.put({
      key,
      audioBlob,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn('Failed to cache audio:', error);
  }
}

/**
 * Get cached audio
 */
async function getCachedAudio(key) {
  try {
    const db = await initCache();
    const transaction = db.transaction(['audio'], 'readonly');
    const store = transaction.objectStore('audio');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < 24 * 60 * 60 * 1000) {
          // Cache valid for 24 hours
          resolve(result.audioBlob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to get cached audio:', error);
    return null;
  }
}

/**
 * Generate cache key from text and voice
 */
function getCacheKey(text, voiceId) {
  return `${voiceId}_${text.substring(0, 50)}_${text.length}`;
}

/**
 * Select voice based on grade level
 * @param {string} gradeLevel - Grade level (k2, 3-5, 6-8, 9-12)
 * @param {string} preference - 'male' or 'female'
 * @returns {string} Voice ID
 */
export function selectVoiceForGrade(gradeLevel, preference = 'female') {
  const normalizedGrade = typeof gradeLevel === 'string' ? gradeLevel.toLowerCase() : '6-8';
  
  // K-2 and 3-5: Female voice by default
  if (normalizedGrade === 'k2' || normalizedGrade === '3-5') {
    return VOICES.FEMALE_WARM;
  }
  
  // 6-8: User preference
  if (normalizedGrade === '6-8') {
    return preference === 'male' ? VOICES.MALE_WARM : VOICES.FEMALE_WARM;
  }
  
  // 9-12: Male voice by default
  return VOICES.MALE_WARM;
}

/**
 * Get playback speed based on grade level
 * @param {string} gradeLevel - Grade level
 * @returns {number} Playback speed multiplier
 */
function getPlaybackSpeed(gradeLevel) {
  const normalizedGrade = typeof gradeLevel === 'string' ? gradeLevel.toLowerCase() : '6-8';
  
  switch (normalizedGrade) {
    case 'k2':
      return 0.85;
    case '3-5':
      return 0.9;
    case '6-8':
      return 1.0;
    case '9-12':
      return 1.0;
    default:
      return 1.0;
  }
}

/**
 * Generate speech using ElevenLabs API
 * @param {string} text - Text to speak
 * @param {Object} options - Options
 * @param {string} options.voiceId - Voice ID (auto-selected if not provided)
 * @param {string} options.gradeLevel - Grade level for voice selection
 * @param {string} options.preference - Voice preference ('male' or 'female')
 * @param {number} options.stability - Voice stability (0-1)
 * @param {number} options.similarity_boost - Similarity boost (0-1)
 * @param {boolean} options.useCache - Whether to use cache
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Blob>} Audio blob
 */
export async function generateSpeech(text, options = {}) {
  if (!text || !text.trim()) {
    throw new Error('Text is required');
  }

  const {
    voiceId,
    gradeLevel = '6-8',
    preference = 'female',
    stability = DEFAULT_VOICE_SETTINGS.stability,
    similarity_boost = DEFAULT_VOICE_SETTINGS.similarity_boost,
    useCache = true,
    onProgress,
  } = options;

  // Select voice if not provided
  const selectedVoiceId = voiceId || selectVoiceForGrade(gradeLevel, preference);

  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(text, selectedVoiceId);
    const cached = await getCachedAudio(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Check API key
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: MODEL_ID,
        voice_settings: {
          stability,
          similarity_boost,
          style: DEFAULT_VOICE_SETTINGS.style,
          use_speaker_boost: DEFAULT_VOICE_SETTINGS.use_speaker_boost,
        },
        optimize_streaming_latency: 2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      
      throw new Error(errorData.detail?.message || `API error: ${response.status}`);
    }

    const audioBlob = await response.blob();

    // Cache the audio
    if (useCache) {
      const cacheKey = getCacheKey(text, selectedVoiceId);
      await cacheAudio(cacheKey, audioBlob);
    }

    return audioBlob;
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
  }
}

/**
 * Play audio blob
 * @param {Blob} audioBlob - Audio blob to play
 * @param {Object} options - Playback options
 * @returns {Promise<HTMLAudioElement>} Audio element
 */
export function playAudioBlob(audioBlob, options = {}) {
  const {
    playbackRate = 1.0,
    onEnd,
    onError,
    onStart,
  } = options;

  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.playbackRate = playbackRate;
    audio.volume = 1.0;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
      resolve(audio);
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      if (onError) onError(error);
      reject(error);
    };

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.play().catch((error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    });
  });
}

/**
 * Main function to speak text with ElevenLabs
 * @param {string} text - Text to speak
 * @param {Object} options - Options
 * @param {Function} options.onComplete - Callback when speech completes
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onStart - Start callback
 * @param {Function} options.onGenerating - Callback while generating
 * @returns {Promise<Object>} Audio control object with stop, pause, resume methods
 */
export async function speakWithElevenLabs(text, options = {}) {
  const {
    voiceId,
    gradeLevel = '6-8',
    preference = 'female',
    stability = DEFAULT_VOICE_SETTINGS.stability,
    similarity_boost = DEFAULT_VOICE_SETTINGS.similarity_boost,
    playbackRate,
    useCache = true,
    onComplete,
    onError,
    onStart,
    onGenerating,
    fallbackToBrowser = true,
  } = options;

  // Calculate playback rate
  const speed = playbackRate || getPlaybackSpeed(gradeLevel);

  let audioElement = null;
  let audioBlob = null;

  try {
    // Call generating callback
    if (onGenerating) {
      onGenerating();
    }

    // Generate speech
    audioBlob = await generateSpeech(text, {
      voiceId,
      gradeLevel,
      preference,
      stability,
      similarity_boost,
      useCache,
    });

    // Play audio
    audioElement = await playAudioBlob(audioBlob, {
      playbackRate: speed,
      onStart,
      onEnd: onComplete,
      onError: (error) => {
        console.error('Audio playback error:', error);
        if (onError) {
          onError(error);
        }
      },
    });

    return {
      stop: () => {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      },
      pause: () => {
        if (audioElement) {
          audioElement.pause();
        }
      },
      resume: () => {
        if (audioElement) {
          audioElement.play();
        }
      },
      audio: audioElement,
    };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);

    // Fallback to browser TTS
    if (fallbackToBrowser && 'speechSynthesis' in window) {
      console.log('Falling back to browser TTS');
      return speakWithBrowserTTS(text, {
        gradeLevel,
        playbackRate: speed,
        onComplete,
        onError,
        onStart,
      });
    }

    if (onError) {
      onError(error);
    }

    throw error;
  }
}

/**
 * Fallback: Speak using browser TTS
 */
function speakWithBrowserTTS(text, options = {}) {
  const {
    gradeLevel = '6-8',
    playbackRate = 1.0,
    onComplete,
    onError,
    onStart,
  } = options;

  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      const error = new Error('Speech synthesis not supported');
      if (onError) onError(error);
      reject(error);
      return;
    }

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-US')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = playbackRate;
    utterance.pitch = gradeLevel === 'k2' ? 1.1 : 1.0;

    utterance.onend = () => {
      if (onComplete) onComplete();
      resolve({
        stop: () => window.speechSynthesis.cancel(),
        pause: () => window.speechSynthesis.pause(),
        resume: () => window.speechSynthesis.resume(),
      });
    };

    utterance.onerror = (error) => {
      if (onError) onError(error);
      reject(error);
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Preload common phrases
 */
export async function preloadCommonPhrases(gradeLevel = '6-8', preference = 'female') {
  const commonPhrases = [
    "Great job!",
    "That's excellent!",
    "You're doing well!",
    "Keep it up!",
    "Well done!",
    "That's a good point!",
    "I understand what you mean.",
    "Tell me more about that.",
    "You're on the right track!",
    "Excellent work!",
  ];

  const voiceId = selectVoiceForGrade(gradeLevel, preference);

  try {
    await Promise.all(
      commonPhrases.map(phrase =>
        generateSpeech(phrase, {
          voiceId,
          gradeLevel,
          preference,
          useCache: true,
        }).catch(err => console.warn(`Failed to preload: ${phrase}`, err))
      )
    );
  } catch (error) {
    console.warn('Failed to preload common phrases:', error);
  }
}

/**
 * Get character usage (for cost tracking)
 */
export async function getCharacterUsage() {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        charactersUsed: data.subscription?.character_count || 0,
        characterLimit: data.subscription?.character_limit || 0,
      };
    }
  } catch (error) {
    console.warn('Failed to get character usage:', error);
  }

  return null;
}

export default {
  speakWithElevenLabs,
  selectVoiceForGrade,
  generateSpeech,
  playAudioBlob,
  preloadCommonPhrases,
  getCharacterUsage,
  VOICES,
};


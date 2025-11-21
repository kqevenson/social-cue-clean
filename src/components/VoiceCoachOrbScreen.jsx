/**  ------------------------------
  FIXED VoiceCoachOrbScreen.jsx
  - Correct isSpeaking shutdown
  - Prevent mic from hearing AI
  - Stop after questions
  - Fix recognition restart loops
  - Stable turn-taking flow
--------------------------------*/

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import localforage from "localforage";
import { OpenAI } from "openai";
import useVoiceConversation from "../hooks/useVoiceConversation";
import { stopOpenAITTSPlayback, globalTTSLock, playVoiceResponseWithOpenAI } from "../services/openAITTSService";
import {
  setHandlers,
  startRecognition,
  stopRecognition
} from "../services/speechRecognitionService";
import { savePracticeHistory } from "../services/savePracticeHistory";

// ---- PROGRESS SUMMARY BUILDER ----
const buildProgressSummary = (messages, scenario, gradeLevel) => {
  const userTurns = messages.filter((m) => m.role === "user");
  const coachTurns = messages.filter((m) => m.role === "assistant");

  return {
    scenarioId: scenario?.id,
    // include emotion trail
    emotions: messages
      .filter((m) => m.role === "meta")
      .map((m) => ({
        emotion: m.emotion,
        intensity: m.intensity,
        raw: m.raw,
      })),
    scenarioTitle: scenario?.title,
    category: scenario?.category,
    gradeLevel,
    totalTurns: messages.length,
    userTurns: userTurns.length,
    coachTurns: coachTurns.length,
    userFirstMessage: userTurns[0]?.text || "",
    sessionCompletedAt: new Date().toISOString(),
    whatWentWell: null,
    tipForNextTime: null,
    aiSummary: null,
  };
};

const MAX_STORED_LINES = 40;
const PHASE_STORAGE_KEY = "voiceCoach:lastPhase";

const MISSING_SCENARIO_MESSAGE =
  "We could not load this scenario. Please go back and choose another practice activity.";

const VoiceCoachOrbScreen = ({
  scenario,
  gradeLevel = "6",
  learnerName: initialLearnerName = "",
  autoStart = false,
  onEndSession
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [aiLine, setAiLine] = useState("");
  const [phaseRestored, setPhaseRestored] = useState(false);
  const [userPrompt, setUserPrompt] = useState("Ready when you are");
  const [recognitionReady, setRecognitionReady] = useState(false);
  const [muted, setMuted] = useState(false); // UI-only mute state
  const [lastAudioBase64, setLastAudioBase64] = useState(null); // store last audio blob for Hume analysis

  const resolvedGradeLevel = scenario?.gradeLevel || gradeLevel || "6";

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const cancelledRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const listeningTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const shouldIgnoreInputRef = useRef(false);

  /** --------------------------------------
   * START LISTENING
   * ------------------------------------- */
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Ignore if already stopped
    }

    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (err) {
      console.warn("[VoiceCoach] startListening failed:", err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  /** --------------------------------------
   * STOP LISTENING
   * ------------------------------------- */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  /** --------------------------------------
   * RESUME LISTENING AFTER DELAY (default 800ms)
   * ------------------------------------- */
  const resumeListeningAfterDelay = useCallback((delay = 800) => {
    shouldIgnoreInputRef.current = true;

    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }

    listeningTimeoutRef.current = setTimeout(() => {
      if (!cancelledRef.current) {
        // Check if TTS is still playing - if so, wait
        if (globalTTSLock.isSpeaking) return; // TTS still playing — WAIT

        shouldIgnoreInputRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);

        try {
          startRecognition();
        } catch (e) {
          console.warn("Recognition restart failed:", e);
        }
      }

      listeningTimeoutRef.current = null;
    }, delay);
  }, []);

  // Get user data from localStorage
  const storedUser = (() => {
    try {
      const stored = localStorage.getItem("socialCueUserData");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  })();
  const learnerName =
    storedUser?.userName ||
    storedUser?.username ||
    storedUser?.name ||
    "";

  // Conversation hook
  const conversation = useVoiceConversation({
    scenario,
    autoStart: true,
    learnerName,
    // Pass emotion-ready audio data downstream
    onAudioBase64: (base64Audio) => {
      setLastAudioBase64(base64Audio);   // store audio for next request
    },
    onPhaseChange: (newPhase, oldPhase) => {
      console.log("[VoiceCoachOrbScreen] Phase changed:", {
        oldPhase,
        newPhase
      });

      // Reset mic between teaching phases to avoid duplicate triggers
      stopListening();
      shouldIgnoreInputRef.current = true;
      setTimeout(() => {
        shouldIgnoreInputRef.current = false;
        startListening();
      }, 1000);
    },
    onError: (err) => {
      console.error("[VoiceCoachOrbScreen] Conversation error:", err);
      setError("Sorry, something went wrong. Please try again.");
    },
    onAudioStart: () => {
      isSpeakingRef.current = true;
      shouldIgnoreInputRef.current = true;
      stopListening();
    },
    onAudioComplete: () => {
      isSpeakingRef.current = false;
      shouldIgnoreInputRef.current = false;
      // Extend delay to prevent capturing TTS
      resumeListeningAfterDelay(1500);
    }
  });

  const {
    messages,
    phase,
    isSpeaking,
    isLoading,
    sendUserMessage,
    startConversation
  } = conversation;

  /** --------------------------------------
   * HARD SUPPRESSION WHILE AI IS SPEAKING
   * ------------------------------------- */
  useEffect(() => {
    if (isSpeaking) {
      stopListening();
      shouldIgnoreInputRef.current = true;
      return;
    }
  }, [isSpeaking, stopListening]);

  /** --------------------------------------
   * UPDATE AI LINE WHEN MESSAGES COME IN
   * ------------------------------------- */
  useEffect(() => {
    // Only show FINAL messages (filter out partial streaming chunks)
    const finalMessages = messages.filter((m) => m.isFinal !== false);
    const aiMessages = finalMessages.filter((m) => m.role === "ai");
    if (aiMessages.length > 0) {
      const latestAI = aiMessages[aiMessages.length - 1];

      // show text while speaking
      setAiLine(latestAI.text || "");

      // Update transcript with ONLY AI responses (latest one)
      if (latestAI.text) {
        setTranscript([latestAI.text]);
      }
    }
  }, [messages, isSpeaking]);

  /** --------------------------------------
   * APPEND TRANSCRIPT
   * ------------------------------------- */
  const appendTranscript = useCallback((line) => {
    if (!line) return;
    setTranscript((prev) => {
      const next = [...prev, line.trim()].filter(Boolean);
      if (next.length > MAX_STORED_LINES) {
        return next.slice(next.length - MAX_STORED_LINES);
      }
      return next;
    });
  }, []);

  /** --------------------------------------
   * CLEANUP
   * ------------------------------------- */
  const cleanup = useCallback(() => {
    stopRecognition();
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    isListeningRef.current = false;
    isSpeakingRef.current = false;
    shouldIgnoreInputRef.current = false;
    setIsListening(false);
    stopOpenAITTSPlayback();
    localforage
      .removeItem(PHASE_STORAGE_KEY)
      .catch((storageError) => {
        console.warn(
          "[VoiceCoachOrbScreen] Unable to clear persisted phase:",
          storageError
        );
      });
  }, []);

  /** --------------------------------------
   * END SESSION
   * ------------------------------------- */
  const handleSessionEnd = useCallback(
    (details) => {
      cancelledRef.current = true;
      cleanup();
      onEndSession?.({
        ...details,
        messages
      });
    },
    [cleanup, onEndSession, messages]
  );

  /** --------------------------------------
   * HANDLE USER MESSAGE (KEY FIX)
   * stop ignoring input after scenario
   * ------------------------------------- */
  const handleUserMessage = useCallback(
    async (rawText) => {
      const cleaned = (rawText || "").trim();

      if (!cleaned || cleaned.length < 2) {
        console.warn("Ignoring empty/short transcript:", cleaned);
        return;
      }

      // BLOCK ANY INPUT DURING AI SPEECH
      if (isSpeaking) {
        console.debug("Ignoring input because AI is speaking");
        return;
      }

      if (isSpeakingRef.current || shouldIgnoreInputRef.current) {
        console.log(
          "[Speech] Ignoring transcript because AI is still speaking:",
          cleaned
        );
        return;
      }
      console.log("🔥 USER MESSAGE RECEIVED:", cleaned);

      appendTranscript(cleaned);

      await new Promise((r) => setTimeout(r, 1200));

      try {
        stopListening();
        console.log("🔥 SENDING TO AI:", cleaned);
        await sendUserMessage(cleaned, {
          audioBase64: lastAudioBase64  // pass Hume audio to backend
        });
      } catch (e) {
        console.error("Voice conversation error:", e);
        setError("Sorry, something went wrong. Please try again.");
      } finally {
        if (!cancelledRef.current) {
          resumeListeningAfterDelay(2000);
        }
      }
    },
      [appendTranscript, sendUserMessage, stopListening, resumeListeningAfterDelay, isSpeaking]
  );

  /** --------------------------------------
   * SPEECH RECOGNITION HANDLERS
   * ------------------------------------- */
  useEffect(() => {
    if (!scenario) {
      setError(MISSING_SCENARIO_MESSAGE);
      return;
    }

    setHandlers({
      onInterim: (interim) => {
        if (isSpeakingRef.current || shouldIgnoreInputRef.current) {
          return;
        }
        setAiLine("");
        setTranscript(interim);
      },
      onFinal: async (finalText) => {
        // Check shouldIgnoreInputRef BEFORE processing transcriptChunk
        if (shouldIgnoreInputRef.current) return;
        
        if (isSpeakingRef.current) {
          return;
        }

        const cleaned = (finalText || "").trim();
        if (!cleaned || cleaned.length < 2) return;
        stopRecognition();
        setTranscript(cleaned);

        await new Promise((r) => setTimeout(r, 1200));

        if (!isSpeakingRef.current && !isLoading) {
          console.log("🔥 SENDING TO AI (FINAL):", cleaned);
          await sendUserMessage(cleaned, {
            audioBase64: lastAudioBase64  // pass Hume audio to backend
          });
        }
      },
      onError: () => {},
      onEnd: () => {
        /** FIXED: prevent restart collisions with safety stop */
        if (isListeningRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            try {
              stopRecognition(); // ensure it's really stopped
              isListeningRef.current = false;
              setIsListening(false);
            } catch (e) {
              console.warn("stopRecognition error:", e);
            }

            try {
              startRecognition(); // restart cleanly
            } catch (e) {
              console.warn("startRecognition failed:", e);
              isListeningRef.current = false;
            }
          }, 300);
        }
      }
    });

    setRecognitionReady(true);

    // Initialize recognition - start listening after 1000ms timeout
    setTimeout(() => {
      if (!cancelledRef.current) {
        // Check if TTS is still playing - if so, wait
        if (globalTTSLock.isSpeaking) return; // TTS still playing — WAIT

        shouldIgnoreInputRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);

        try {
          startRecognition();
        } catch (e) {
          console.warn("Initial recognition start failed:", e);
        }
      }
    }, 1000);
  }, [scenario, sendUserMessage, isLoading]);

  /** --------------------------------------
   * RESTORE PHASE
   * ------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const savedPhase = await localforage.getItem(
          "voiceCoach:lastPhase"
        );
        if (!cancelled && typeof savedPhase === "string") {
          console.debug(
            "[VoiceCoachOrbScreen] Restoring persisted phase:",
            savedPhase
          );
        }
      } catch {
      } finally {
        if (!cancelled) {
          setPhaseRestored(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** --------------------------------------
   * AUTOSTART CONVERSATION
   * ------------------------------------- */
  useEffect(() => {
    if (!scenario) return;
    if (!recognitionReady) return;
    startConversation();
  }, [scenario, recognitionReady, startConversation]);

  /** --------------------------------------
   * PHASE COMPLETION
   * ------------------------------------- */
  useEffect(() => {
    // NEW JSON-BASED WRAP-UP
    const runWrapUp = async () => {
      try {
        const apiKey = import.meta?.env?.VITE_OPENAI_API_KEY;
        if (!apiKey) return;

        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
                You are Coach Cue.
                Return STRICT JSON with:
                {
                  "whatWentWell": "short sentence",
                  "tipForNextTime": "short sentence"
                }
                DO NOT include anything else. No intros. No prose. JSON only.
              `,
            },
            {
              role: "user",
              content: `
                Learner finished scenario: ${scenario?.title}
                Give a JSON reflection.
              `,
            },
          ],
          temperature: 0.7,
          max_tokens: 60,
        });

        const raw = response.choices[0]?.message?.content?.trim();
        let parsed = null;

        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          console.warn("JSON parse error:", e, raw);
          return;
        }

        // Build natural spoken version
        const spokenSummary = `
          ${parsed.whatWentWell}.
          And here's one gentle tip for next time:
          ${parsed.tipForNextTime}.
        `;

        // Speak natural version
        await playVoiceResponseWithOpenAI(spokenSummary, "shimmer");

        // Attach JSON to the end-session payload
        return parsed;
      } catch (err) {
        console.error("Wrap-up error:", err);
        return null;
      }
    };

    if (phase === "complete" || phase === "COMPLETE") {
      const progress = buildProgressSummary(messages, scenario, resolvedGradeLevel);
      runWrapUp().then(async (wrapupJSON) => {
        if (wrapupJSON) {
          progress.whatWentWell = wrapupJSON.whatWentWell;
          progress.tipForNextTime = wrapupJSON.tipForNextTime;
          progress.aiSummary = wrapupJSON;
        }

        // Save to Firestore before ending session
        try {
          const stored = localStorage.getItem("socialCueUserData");
          const userData = stored ? JSON.parse(stored) : {};
          const userId = userData?.userId || userData?.id || "guest";
          const sessionId = progress.sessionCompletedAt || new Date().toISOString();
          
          await savePracticeHistory(userId, sessionId, progress);
          console.log("✅ Session progress saved to Firestore");
        } catch (err) {
          console.error("❌ Error saving session progress:", err);
        }

        handleSessionEnd({
          phase: "complete",
          progress
        });
      });
    }
  }, [phase, handleSessionEnd, messages, scenario, resolvedGradeLevel, learnerName]);

  /** --------------------------------------
   * RENDER
   * ------------------------------------- */

  return (
    <div className="relative min-h-screen w-full bg-[#020412] text-white flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.22),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,246,0.12),_transparent_60%)]" />

      {/* EXIT BUTTON - Top Right */}
      <button
        onClick={() => onEndSession && onEndSession({ phase })}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-gray-800/60 border border-white/10 flex items-center justify-center hover:bg-gray-700/60 transition"
      >
        <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* LISTENING/SPEAKING TOGGLE - Top Center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isListening && !isSpeaking
            ? 'bg-purple-500/30 border border-purple-400/50 text-purple-100'
            : 'text-gray-400 bg-white/5 border border-white/10'
        }`}>
          Listening
        </div>

        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isSpeaking
            ? 'bg-purple-500/30 border border-purple-400/50 text-purple-100'
            : 'text-gray-400 bg-white/5 border border-white/10'
        }`}>
          Speaking
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-8 px-6">
        {/* ORB CONTAINER */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: '320px', height: '320px' }}
        >
          {/* Outer Glow */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${
              muted
                ? 'bg-gray-400/8 blur-[120px]'
                : isSpeaking
                ? 'bg-purple-400/25 blur-[120px] scale-110'
                : isListening
                ? 'bg-purple-400/20 blur-[120px] animate-pulse-slow'
                : 'bg-purple-400/15 blur-[120px]'
            }`}
            style={{ width: '320px', height: '320px' }}
          />

          {/* Mid Glow */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
              muted
                ? 'bg-gray-400/12 blur-[80px]'
                : isSpeaking
                ? 'bg-purple-400/30 blur-[80px] scale-105'
                : isListening
                ? 'bg-purple-400/25 blur-[80px]'
                : 'bg-purple-400/20 blur-[80px]'
            }`}
            style={{ width: '280px', height: '280px' }}
          />

          {/* Inner Core */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
              muted
                ? 'bg-gradient-to-br from-gray-500/25 to-gray-600/25 blur-[20px]'
                : isSpeaking
                ? 'bg-gradient-to-br from-purple-400/40 to-purple-600/40 blur-[20px] scale-105'
                : isListening
                ? 'bg-gradient-to-br from-purple-300/35 to-purple-500/35 blur-[20px]'
                : 'bg-gradient-to-br from-purple-200/25 to-purple-400/25 blur-[20px]'
            }`}
            style={{ width: '240px', height: '240px' }}
          />

          {/* Smiley Face */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 ${
              isSpeaking ? 'scale-105' : 'scale-100'
            }`}
            style={{ width: '240px', height: '240px' }}
          >
            <div
              className={`transition-all duration-500 ${
                muted ? '' : 'smiley-bounce'
              } ${isSpeaking ? 'scale-110' : 'scale-100'}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px',
                opacity: muted ? 0.5 : 1
              }}
            >
              {/* Eyes */}
              <div className={`flex ${muted ? '' : 'eyes-blink'}`} style={{ gap: '48px' }}>
                <div
                  className={muted ? 'rounded-full' : 'eye-left rounded-full'}
                  style={{
                    width: '21px',
                    height: '21px',
                    background: '#4A90E2',
                    boxShadow: '0 0 20px rgba(74, 144, 226, 0.8)',
                    transformOrigin: 'center'
                  }}
                />
                <div
                  className={muted ? 'rounded-full' : 'eye-right rounded-full'}
                  style={{
                    width: '21px',
                    height: '21px',
                    background: '#4A90E2',
                    boxShadow: '0 0 20px rgba(74, 144, 226, 0.8)',
                    transformOrigin: 'center'
                  }}
                />
              </div>

              {/* Smile */}
              <div
                style={{
                  width: '105px',
                  height: '66px',
                  borderLeft: '15px solid #34D399',
                  borderRight: '15px solid #34D399',
                  borderBottom: '15px solid #34D399',
                  borderTop: 'none',
                  borderRadius: '0 0 52px 52px',
                  filter: 'drop-shadow(0 0 25px rgba(52, 211, 153, 0.6))'
                }}
              />
            </div>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mt-4">
            <p className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 inline-block">
              {error}
            </p>
          </div>
        )}

        {/* TRANSCRIPT - Only AI responses, larger and centered */}
        {!muted && transcript && transcript.length > 0 && (
          <div className="flex justify-center w-full">
            <div className="max-w-xl mt-8 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-xl text-white/90 leading-relaxed shadow-lg backdrop-blur-md text-center">
              {Array.isArray(transcript) ? transcript[transcript.length - 1] : transcript}
            </div>
          </div>
        )}
        
        {/* Muted state */}
        {muted && (
          <div className="flex justify-center w-full mt-8">
            <div className="max-w-xl px-8 py-5 rounded-2xl bg-gray-500/10 border border-gray-500/30 text-lg text-gray-400 text-center">
              Microphone muted
            </div>
          </div>
        )}

        {/* MUTE / UNMUTE BUTTON */}
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className={`mt-4 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
            muted
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
              : 'bg-gray-800/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700/50'
          }`}
        >
          {muted ? (
            <>
              {/* Mic Muted Icon */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              Mic Muted
            </>
          ) : (
            <>
              {/* Mic Active Icon */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Mic Active
            </>
          )}
        </button>
      </div>

      {/* CUSTOM CSS ANIMATIONS */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        /* Bounce animation for entire smiley */
        @keyframes smileyBounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Synchronized blink for both eyes */
        @keyframes eyesBlink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          93% {
            transform: scaleY(0.2);
          }
          94%, 96% {
            transform: scaleY(0);
          }
          97% {
            transform: scaleY(0.2);
          }
        }

        /* Left eye wink */
        @keyframes leftEyeWink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          94%, 96% {
            transform: scaleY(0);
          }
        }

        /* Right eye wink */
        @keyframes rightEyeWink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          94%, 96% {
            transform: scaleY(0);
          }
        }

        /* Apply animations */
        .smiley-bounce {
          animation: smileyBounce 2.5s ease-in-out infinite;
        }

        .eyes-blink {
          animation: eyesBlink 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .eye-left {
          animation: leftEyeWink 7s ease-in-out infinite;
          animation-delay: 2s;
        }

        .eye-right {
          animation: rightEyeWink 8s ease-in-out infinite;
          animation-delay: 5s;
        }

        /* Prevent transitions from interfering */
        .smiley-bounce,
        .smiley-bounce *,
        .eyes-blink,
        .eye-left,
        .eye-right {
          transition: none !important;
        }
      `}</style>
    </div>
  );
};

export default VoiceCoachOrbScreen;

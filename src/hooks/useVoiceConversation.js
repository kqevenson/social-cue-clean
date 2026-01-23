// ---------------------------------------------------------------------------
// useVoiceConversation.js — AUTONOMY VOICE ENGINE v2025 FINAL
// ChatGPT-level natural autonomy with stable mic + TTS handling
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { OpenAI } from "openai";

import {
  unlockAudio,
  playVoiceResponseWithOpenAI,
  stopOpenAITTSPlayback
} from "../services/openAITTSService";

import {
  startRecognition,
  stopRecognition
} from "../services/speechRecognitionService";

import { PHASES } from "../content/training/aibehaviorconfig";
import { generateConversationResponse } from "../services/generateConversationResponse";
import { convertBlobToBase64 } from "../services/audioHelpers";
import { sendVoiceToAI } from "../services/voiceConversationApi";

// Constants for emotion-based turn limits
const MAX_SCENARIO_TURNS = 5;   // <--- LIMITS how long practice runs
const EMOTION_PHASE_WEIGHTS = {
  anxious: 0.6,
  nervous: 0.6,
  frustrated: 0.4,
  sad: 0.5,
  neutral: 1.0,
  calm: 1.0,
  happy: 1.2,
  excited: 1.3,
  confident: 1.4
};

// Helper
function createMsg(role, text, phase) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    phase,
    createdAt: new Date().toISOString()
  };
}


export default function useVoiceConversation({
  scenario,
  learnerName,
  gradeLevel,
  autoStart = true,
  onPhaseChange,
  onAudioStart,
  onAudioComplete,
  onFinishSession,
  onError,
  onAudioBase64,      // NEW callback from Orb
  useEmotion = true,  // enable emotion sensing
  disableTTS = false, // NEW: disable OpenAI TTS when using streaming avatar
  onAIResponse,       // NEW: callback when AI responds (for streaming avatar to speak)
  visualEmotionContext = null, // NEW: visual emotion from webcam (Hume face analysis)
  voiceEmotionContext = null, // NEW: voice emotion from Hume EVI (real-time voice analysis)
}) {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState(PHASES.INTRO_1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emotionContext, setEmotionContext] = useState(null);

  // ---------------------------------------------------------------------------
  // REFS (prevent stale closure bugs)
  // ---------------------------------------------------------------------------
  const openaiRef = useRef(null);
  const messagesRef = useRef([]);
  const phaseRef = useRef(phase);
  const scenarioRef = useRef(scenario);

  const startedRef = useRef(false);
  const allowMicInputRef = useRef(true);
  const ttsLockRef = useRef(false);
  const lastEmotionRef = useRef(null);
  const disableTTSRef = useRef(disableTTS);
  const onAIResponseRef = useRef(onAIResponse);

  // Sync refs
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { scenarioRef.current = scenario; }, [scenario]);
  useEffect(() => { disableTTSRef.current = disableTTS; }, [disableTTS]);
  useEffect(() => { onAIResponseRef.current = onAIResponse; }, [onAIResponse]);

  // ---------------------------------------------------------------------------
  // OPENAI CLIENT INIT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const KEY =
      import.meta.env.VITE_OPENAI_API_KEY ||
      globalThis?.process?.env?.OPENAI_API_KEY ||
      "";

    if (KEY) {
      openaiRef.current = new OpenAI({
        apiKey: KEY,
        dangerouslyAllowBrowser: true
      });
    }
  }, []);

  // ---------------------------------------------------------------------------
  // INTERNAL: AI SPEAK FUNCTION
  // ---------------------------------------------------------------------------
  const speakAI = useCallback(
    async (text, nextPhase = null) => {
      if (!text) return;

      try {
        // During TTS, block mic
        allowMicInputRef.current = false;
        ttsLockRef.current = true;

        // Update phase
        const previous = phaseRef.current;
        const newPhase = nextPhase || previous;

        if (newPhase !== previous) {
          setPhase(newPhase);
          phaseRef.current = newPhase;
          onPhaseChange?.(newPhase, previous);
        }

        // Save AI message
        const msg = createMsg("ai", text, newPhase);
        setMessages((m) => [...m, msg]);
        messagesRef.current.push(msg);

        stopRecognition(); // ALWAYS stop mic before TTS

        // If TTS is disabled (streaming avatar handles voice), just notify and return
        // Use ref to get current value, not closure value
        console.log("🔇 TTS check - disableTTSRef.current:", disableTTSRef.current);
        if (disableTTSRef.current) {
          console.log("🔇 TTS disabled - streaming avatar will speak");
          console.log("🔇 onAIResponseRef.current exists:", !!onAIResponseRef.current);
          setIsSpeaking(true);
          onAudioStart?.();
          onAIResponseRef.current?.(text); // Let streaming avatar handle it

          // We'll rely on the avatar's onSpeakEnd to call onAudioComplete
          // For now, set a reasonable timeout as fallback
          const estimatedDuration = Math.max(3000, text.length * 60); // ~60ms per char
          setTimeout(() => {
            if (ttsLockRef.current) {
              setIsSpeaking(false);
              allowMicInputRef.current = true;
              ttsLockRef.current = false;
              onAudioComplete?.();

              if (newPhase === PHASES.COMPLETE) {
                onFinishSession?.(messagesRef.current);
              }
            }
          }, estimatedDuration);
          return;
        }

        // TTS PLAY (OpenAI)
        await playVoiceResponseWithOpenAI(text, {
          onAudioStart: () => {
            setIsSpeaking(true);
            onAudioStart?.();
          },
          onAudioComplete: () => {
            setIsSpeaking(false);
            allowMicInputRef.current = true; // allow responses again
            ttsLockRef.current = false;
            onAudioComplete?.();

            // If we reached COMPLETE, hand off to results page
            if (newPhase === PHASES.COMPLETE) {
              onFinishSession?.(messagesRef.current);
            }
          }
        });
      } catch (err) {
        console.error("TTS Failure:", err);
        allowMicInputRef.current = true;
        ttsLockRef.current = false;
      }
    },
    [onAudioStart, onAudioComplete, onFinishSession, onPhaseChange]
  );

  // ---------------------------------------------------------------------------
  // START CONVERSATION
  // ---------------------------------------------------------------------------
  const startConversation = useCallback(async () => {
    if (startedRef.current) return;
    if (!scenarioRef.current) return;

    try {
      startedRef.current = true;
      await unlockAudio();

      setIsLoading(true);

      // Pull last 3 practice summaries for personalized guidance from Firestore
      let practiceHistory = [];
      try {
        const { loadPracticeHistory } = await import("../services/loadPracticeHistory");
        const stored = localStorage.getItem("socialCueUserData");
        const userData = stored ? JSON.parse(stored) : {};
        const userId = userData?.userId || userData?.id || "guest";
        const allSessions = await loadPracticeHistory(userId, 3);
        practiceHistory = allSessions.slice(0, 3);
      } catch (err) {
        console.warn("Could not load practice history from Firestore:", err);
      }

      const lastThree = practiceHistory.slice(0, 3);

      const memoryPrompt = lastThree.length > 0 ? lastThree
        .map((h, i) => `
          Session ${i + 1}:
          - Scenario: ${h.scenarioTitle}
          - WhatWentWell: ${h.whatWentWell}
          - TipForNextTime: ${h.tipForNextTime}
        `)
        .join("\n") : "";

      const enhancedSystemPrompt = lastThree.length > 0 ? `
        You are Coach Cue.
        Personalize your coaching based on learner history:
        ${memoryPrompt}
      ` : "";

      const intro = await generateConversationResponse({
        openai: openaiRef.current,
        currentPhase: PHASES.INTRO_1,
        history: [],
        learnerName,
        gradeLevel,
        difficulty: 1,
        scenario: scenarioRef.current,
        practiceHistory
      });

      await speakAI(intro.aiResponse, intro.nextPhase);
    } catch (err) {
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [learnerName, gradeLevel, onError, speakAI]);

  // ---------------------------------------------------------------------------
  // USER SENDS RESPONSE
  // ---------------------------------------------------------------------------
  const sendUserMessage = useCallback(
    async (userText, extra = {}) => {
      if (!userText) return;

      // Block input during TTS
      if (!allowMicInputRef.current || ttsLockRef.current) {
        console.log("Ignoring input — AI is speaking");
        return;
      }

      // store audio for emotion
      if (extra?.audioBase64 && onAudioBase64) {
        try { 
          onAudioBase64(extra.audioBase64); 
        } catch (err) { 
          console.warn("Emotion audio pass fail:", err); 
        }
      }

      try {
        setIsLoading(true);

        stopOpenAITTSPlayback();

        // Save user message
        const prevPhase = phaseRef.current;
        const userMsg = createMsg("user", userText, prevPhase);
        setMessages((m) => [...m, userMsg]);
        messagesRef.current.push(userMsg);

        // FIX 5: Phase completion detection - end scenario after VARIATION phase with 2+ user turns
        const userTurns = messagesRef.current.filter((m) => m.role === "user").length;
        if (
          prevPhase === "VARIATION" ||
          prevPhase === PHASES.VARIATION ||
          prevPhase === "variation"
        ) {
          if (userTurns >= 2) {
            setPhase(PHASES.COMPLETE);
            phaseRef.current = PHASES.COMPLETE;
            onPhaseChange?.(PHASES.COMPLETE, prevPhase);
            // Complete the session
            onFinishSession?.(messagesRef.current);
            return;
          }
        }

        // Build context
        const history = messagesRef.current.map((m) => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.text
        }));

        // Pull last 3 practice summaries for personalized guidance from Firestore
        let practiceHistory = [];
        try {
          const { loadPracticeHistory } = await import("../services/loadPracticeHistory");
          const stored = localStorage.getItem("socialCueUserData");
          const userData = stored ? JSON.parse(stored) : {};
          const userId = userData?.userId || userData?.id || "guest";
          const allSessions = await loadPracticeHistory(userId, 3);
          practiceHistory = allSessions.slice(0, 3);
        } catch (err) {
          console.warn("Could not load practice history from Firestore:", err);
        }

        const lastThree = practiceHistory.slice(0, 3);

        const memoryPrompt = lastThree.length > 0 ? lastThree
          .map((h, i) => `
            Session ${i + 1}:
            - Scenario: ${h.scenarioTitle}
            - WhatWentWell: ${h.whatWentWell}
            - TipForNextTime: ${h.tipForNextTime}
          `)
          .join("\n") : "";

        const enhancedSystemPrompt = lastThree.length > 0 ? `
          You are Coach Cue.
          Personalize your coaching based on learner history:
          ${memoryPrompt}
        ` : "";

        // OPTIONAL: Call backend API for emotion analysis
        const audioBase64 = extra?.audioBase64 || null;
        
        if (useEmotion && audioBase64) {
          try {
            // Pull userId from stored userData
            const raw = localStorage.getItem("socialCueUserData");
            const userData = raw ? JSON.parse(raw) : {};
            const userId = userData.userId || userData.uid || userData.id || "unknown";

            const response = await sendVoiceToAI({
              conversationHistory: history,
              scenario: scenarioRef.current,
              gradeLevel,
              userId,
              phase: prevPhase,
              curriculumScript: null,
              audioBase64: audioBase64
            });
            
            // Update emotion context state when receiving backend reply
            if (response?.emotion) {
              setEmotionContext(response.emotion);
              console.log('🎧 Emotion detected:', response.emotion);
              
              // Save emotion to Firebase session object
              lastEmotionRef.current = response.emotion;
              
              // NEW — Emotion-aware context - add to history
              setMessages((h) => [
                ...h,
                {
                  id: `emotion-${Date.now()}`,
                  role: "meta",
                  emotion: response.emotion?.emotion,
                  intensity: response.emotion?.intensity,
                  raw: response.emotion,
                  createdAt: new Date().toISOString()
                },
              ]);
            }
          } catch (err) {
            console.warn('Could not get emotion analysis:', err);
          }
        }

        // Emotion-based turn limit check for practice phase
        if (prevPhase === "practice" || prevPhase === PHASES.SCENARIO) {
          const humeEmotion = emotionContext || lastEmotionRef.current;
          const emotion = humeEmotion?.emotion?.toLowerCase() || "neutral";
          const weight = EMOTION_PHASE_WEIGHTS[emotion] || 1.0;
          
          // Count turns in practice/scenario phase
          const turnCount = messagesRef.current.filter((m) => 
            m.phase === "practice" || m.phase === PHASES.SCENARIO
          ).length;
          
          // Determine speed of progression based on emotion
          if (turnCount >= MAX_SCENARIO_TURNS * weight) {
            console.log("⏳ Emotion-based limit reached → ending session early");
            setPhase(PHASES.COMPLETE);
            phaseRef.current = PHASES.COMPLETE;
            onPhaseChange?.(PHASES.COMPLETE, prevPhase);
            onFinishSession?.(messagesRef.current);
            return;
          }
        }

        // AI RESPONSE
        // Combine Hume EVI voice emotion with any backend emotion analysis
        const combinedVoiceEmotion = voiceEmotionContext || emotionContext;

        const ai = await generateConversationResponse({
          openai: openaiRef.current,
          currentPhase: prevPhase,
          history,
          learnerName,
          gradeLevel,
          difficulty: 1,
          scenario: scenarioRef.current,
          practiceHistory,
          emotionContext: combinedVoiceEmotion, // Hume EVI voice emotion or backend emotion
          visualEmotionContext // Visual/face emotion context if available
        });

        await speakAI(ai.aiResponse, ai.nextPhase);
      } catch (err) {
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [gradeLevel, learnerName, speakAI, onError, useEmotion, onAudioBase64]
  );

  // ---------------------------------------------------------------------------
  // RESET
  // ---------------------------------------------------------------------------
  const resetConversation = useCallback(() => {
    stopRecognition();
    stopOpenAITTSPlayback();

    startedRef.current = false;
    allowMicInputRef.current = true;
    ttsLockRef.current = false;

    setMessages([]);
    messagesRef.current = [];

    setPhase(PHASES.INTRO_1);
    phaseRef.current = PHASES.INTRO_1;
  }, []);

  // ---------------------------------------------------------------------------
  // AUTO START
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (autoStart && scenarioRef.current) {
      startConversation();
    }
  }, [autoStart, startConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
      stopOpenAITTSPlayback();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // SIGNAL AVATAR SPEECH COMPLETION (for streaming avatar mode)
  // Call this when the external avatar (Tavus/streaming) finishes speaking
  // ---------------------------------------------------------------------------
  const signalSpeechComplete = useCallback(() => {
    console.log("🔊 signalSpeechComplete called - releasing TTS locks");
    if (ttsLockRef.current) {
      setIsSpeaking(false);
      allowMicInputRef.current = true;
      ttsLockRef.current = false;
      onAudioComplete?.();

      // Check if session is complete
      if (phaseRef.current === PHASES.COMPLETE) {
        onFinishSession?.(messagesRef.current);
      }
    }
  }, [onAudioComplete, onFinishSession]);

  // ---------------------------------------------------------------------------
  // RETURN HOOK API
  // ---------------------------------------------------------------------------
  return {
    messages,
    phase,
    isSpeaking,
    isLoading,
    startConversation,
    sendUserMessage,
    resetConversation,
    signalSpeechComplete  // NEW: Allow external components to signal speech completion
  };
}

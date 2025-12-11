// src/components/StreamingAvatar.jsx
// Real-time streaming avatar using HeyGen's official SDK
// Manages a SINGLE session carefully to stay within free tier limits
// Supports voice emotions: EXCITED, SERIOUS, FRIENDLY, SOOTHING, BROADCASTER

import React, { useEffect, useRef, useState, useCallback } from "react";
import StreamingAvatar, { VoiceEmotion, AvatarQuality } from "@heygen/streaming-avatar";
import { apiPath } from "../utils/apiBase";

// Global singleton to ensure only ONE session exists at a time
let globalAvatarInstance = null;
let globalSessionActive = false;

// Map emotion names to HeyGen VoiceEmotion enum
const EMOTION_TO_VOICE_EMOTION = {
  joy: VoiceEmotion.EXCITED,
  happiness: VoiceEmotion.FRIENDLY,
  excitement: VoiceEmotion.EXCITED,
  neutral: VoiceEmotion.FRIENDLY,
  calm: VoiceEmotion.SOOTHING,
  sadness: VoiceEmotion.SOOTHING,
  thinking: VoiceEmotion.SERIOUS,
  confusion: VoiceEmotion.SERIOUS,
  anger: VoiceEmotion.SERIOUS,
  fear: VoiceEmotion.SERIOUS,
  surprise: VoiceEmotion.EXCITED
};

/**
 * HeyGenStreamingAvatar Component
 * Displays a real-time HeyGen streaming avatar that can speak and show emotions
 * Carefully manages session to stay within 1 concurrent session limit
 */
const HeyGenStreamingAvatar = ({
  avatarId = "Abigail_expressive_2024112501",
  voiceId = "2d5b0e6cf36f460aa7fc47e3eee4ba54",
  quality = "medium",
  isSpeaking = false,
  speakingText = "",
  emotion = "neutral",
  onReady,
  onSpeakStart,
  onSpeakEnd,
  onError,
  className = "",
  style = {}
}) => {
  const videoRef = useRef(null);
  const avatarRef = useRef(null);
  const lastSpokenTextRef = useRef("");
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [debugInfo, setDebugInfo] = useState("");

  // Get access token from backend
  const getAccessToken = useCallback(async () => {
    const response = await fetch(apiPath("/api/heygen/streaming/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to get token" }));
      throw new Error(err.error || "Failed to get streaming token");
    }

    const data = await response.json();
    return data.token;
  }, []);

  // Initialize the streaming avatar
  const initializeAvatar = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log("🎭 Already initializing, skipping...");
      return;
    }

    // Check if there's already a global session
    if (globalSessionActive && globalAvatarInstance) {
      console.log("🎭 Reusing existing global session");
      avatarRef.current = globalAvatarInstance;
      setIsConnected(true);
      setIsLoading(false);
      setConnectionState("connected");
      onReady?.();
      return;
    }

    initializingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      setConnectionState("connecting");
      setDebugInfo("Getting access token...");

      console.log("🎭 Initializing HeyGen Streaming Avatar...");

      // Get access token from backend
      const token = await getAccessToken();
      console.log("✅ Got access token");
      setDebugInfo("Creating avatar session...");

      // Initialize the SDK with the token
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;
      globalAvatarInstance = avatar;

      // Set up event listeners
      avatar.on("stream_ready", (event) => {
        console.log("🎬 Stream ready!", event);
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
        if (mountedRef.current) {
          setIsConnected(true);
          setConnectionState("connected");
          setIsLoading(false);
          setDebugInfo("");
          globalSessionActive = true;
          onReady?.();
        }
      });

      avatar.on("stream_disconnected", () => {
        console.log("📡 Stream disconnected");
        if (mountedRef.current) {
          setIsConnected(false);
          setConnectionState("disconnected");
        }
        globalSessionActive = false;
        globalAvatarInstance = null;
      });

      avatar.on("avatar_start_talking", () => {
        console.log("🗣️ Avatar started talking");
        onSpeakStart?.();
      });

      avatar.on("avatar_stop_talking", () => {
        console.log("🗣️ Avatar stopped talking");
        onSpeakEnd?.();
      });

      // Create avatar session with emotion support
      console.log("🎭 Starting avatar:", avatarId);
      setDebugInfo(`Starting ${avatarId}...`);

      // Map quality string to enum
      const qualityMap = {
        low: AvatarQuality.Low,
        medium: AvatarQuality.Medium,
        high: AvatarQuality.High
      };

      const sessionInfo = await avatar.createStartAvatar({
        avatarName: avatarId,
        quality: qualityMap[quality] || AvatarQuality.Medium,
        voice: {
          voiceId,
          rate: 1.0, // Normal speech rate (0.5 - 1.5)
          emotion: VoiceEmotion.FRIENDLY // Start with friendly emotion
        },
      });

      console.log("✅ Avatar session created:", sessionInfo);
      globalSessionActive = true;

    } catch (err) {
      console.error("❌ Streaming avatar error:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));

      // Check for specific errors
      let errorMessage = err.message || "Failed to connect";
      if (errorMessage.includes("Concurrent limit") || errorMessage.includes("concurrent")) {
        errorMessage = "Session limit reached. Please wait 30 seconds and try again.";
        // Try to clean up any stale sessions
        console.log("🧹 Attempting to clean up stale sessions...");
      }

      if (mountedRef.current) {
        setError(errorMessage);
        setConnectionState("error");
        setIsLoading(false);
        setDebugInfo("");
      }

      globalSessionActive = false;
      globalAvatarInstance = null;
      onError?.(err);
    } finally {
      initializingRef.current = false;
    }
  }, [avatarId, voiceId, quality, getAccessToken, onReady, onSpeakStart, onSpeakEnd, onError]);

  // Track current emotion for speaking
  const currentEmotionRef = useRef(emotion);
  useEffect(() => {
    currentEmotionRef.current = emotion;
  }, [emotion]);

  // Make avatar speak with emotion
  const speak = useCallback(async (text, speakEmotion = null) => {
    const avatar = avatarRef.current || globalAvatarInstance;
    if (!avatar || !text || !isConnected) return;
    if (text === lastSpokenTextRef.current) return;

    try {
      // Get the voice emotion based on current emotion state
      const emotionKey = (speakEmotion || currentEmotionRef.current || "neutral").toLowerCase();
      const voiceEmotion = EMOTION_TO_VOICE_EMOTION[emotionKey] || VoiceEmotion.FRIENDLY;

      console.log("🗣️ Making avatar speak with emotion:", emotionKey, "->", voiceEmotion);
      console.log("🗣️ Text:", text.substring(0, 50) + "...");

      lastSpokenTextRef.current = text;

      // Use "repeat" task_type since we're providing our own AI response
      // HeyGen will speak exactly what we send
      await avatar.speak({
        text,
        task_type: "repeat" // Use repeat to say exactly what we provide
      });
    } catch (err) {
      console.error("❌ Speech error:", err);
    }
  }, [isConnected]);

  // Stop avatar session
  const stopAvatar = useCallback(async () => {
    const avatar = avatarRef.current || globalAvatarInstance;
    if (avatar) {
      try {
        console.log("🛑 Stopping avatar session...");
        await avatar.stopAvatar();
        console.log("✅ Avatar stopped");
      } catch (err) {
        console.error("Error stopping avatar:", err);
      }
    }

    avatarRef.current = null;
    globalAvatarInstance = null;
    globalSessionActive = false;

    if (mountedRef.current) {
      setIsConnected(false);
      setConnectionState("disconnected");
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;

    // Small delay to prevent rapid re-initialization
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        initializeAvatar();
      }
    }, 500);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      // Don't stop on unmount - let session persist for reuse
      // stopAvatar();
    };
  }, []);

  // Speak when text changes - pass current emotion
  useEffect(() => {
    if (isConnected && speakingText && isSpeaking) {
      speak(speakingText, emotion);
    }
  }, [isConnected, speakingText, isSpeaking, speak, emotion]);

  // Cleanup on page unload
  useEffect(() => {
    const handleUnload = () => {
      stopAvatar();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [stopAvatar]);

  return (
    <div
      className={`streaming-avatar relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 ${className}`}
      style={style}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/50 to-black/50 z-10">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-purple-200 text-sm">Connecting to live avatar...</p>
          <p className="text-purple-300/60 text-xs mt-1">{debugInfo || connectionState}</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 p-4">
          <div className="text-red-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-200 text-sm text-center mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeAvatar();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-500 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Video element for avatar stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{
          opacity: isConnected && !isLoading && !error ? 1 : 0,
          transition: "opacity 0.5s ease"
        }}
      />

      {/* Connected indicator */}
      {isConnected && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 text-xs">Live</span>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && isConnected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-purple-500/80 rounded-full">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDuration: "300ms" }} />
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDuration: "400ms" }} />
            <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: "350ms" }} />
          </div>
          <span className="text-white text-xs">Speaking</span>
        </div>
      )}
    </div>
  );
};

export default HeyGenStreamingAvatar;

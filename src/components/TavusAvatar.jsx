// src/components/TavusAvatar.jsx
// Real-time conversational avatar using Tavus CVI with Daily SDK
// Custom UI: Avatar fullscreen with greenscreen keying, user camera in corner
// Docs: https://docs.tavus.io, https://docs.daily.co

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import { createConversation, endConversation, generateAvatarPlaceholder } from "../services/tavusService";

/**
 * TavusAvatar Component
 * Displays a real-time Tavus conversational video avatar with custom UI
 * Avatar is fullscreen with greenscreen removed, user camera small in corner
 */
const TavusAvatar = forwardRef(({
  replicaId,
  personaId,
  coachName = "Coach",
  customGreeting,
  backgroundImageUrl, // DALL-E generated background to show behind avatar
  onReady,
  onSpeakStart,
  onSpeakEnd,
  onError,
  onConversationEnd,
  onUserSpeech,
  onEmotionDetected, // NEW: Callback for Tavus Perception emotion events
  className = "",
  style = {}
}, ref) => {
  const containerRef = useRef(null);
  const avatarVideoRef = useRef(null);
  const avatarAudioRef = useRef(null); // Separate audio element for avatar voice
  const userVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const callObjectRef = useRef(null);
  const conversationIdRef = useRef(null);
  const mountedRef = useRef(true);
  const animationFrameRef = useRef(null);
  const initializingRef = useRef(false); // Prevent double initialization

  // Use refs for callbacks to avoid stale closures
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const onSpeakStartRef = useRef(onSpeakStart);
  const onSpeakEndRef = useRef(onSpeakEnd);
  const onConversationEndRef = useRef(onConversationEnd);
  const onUserSpeechRef = useRef(onUserSpeech);
  const onEmotionDetectedRef = useRef(onEmotionDetected);

  // Keep refs updated
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onSpeakStartRef.current = onSpeakStart; }, [onSpeakStart]);
  useEffect(() => { onSpeakEndRef.current = onSpeakEnd; }, [onSpeakEnd]);
  useEffect(() => { onConversationEndRef.current = onConversationEnd; }, [onConversationEnd]);
  useEffect(() => { onUserSpeechRef.current = onUserSpeech; }, [onUserSpeech]);
  useEffect(() => { onEmotionDetectedRef.current = onEmotionDetected; }, [onEmotionDetected]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasAvatarVideo, setHasAvatarVideo] = useState(false);
  const [hasUserVideo, setHasUserVideo] = useState(false);

  // Track speech timeout for fallback onSpeakEnd trigger
  const speechTimeoutRef = useRef(null);
  const lastEchoTextRef = useRef(null);

  // Send Echo message to make avatar speak specific text
  // IMPORTANT: Must use correct Tavus Echo API format per docs.tavus.io/sections/event-schemas/conversation-echo
  const sendEcho = useCallback((text) => {
    if (!callObjectRef.current) {
      console.warn("❌ Cannot send echo - no active Daily call object");
      return;
    }
    if (!conversationIdRef.current) {
      console.warn("❌ Cannot send echo - no conversation ID yet");
      return;
    }
    if (!text || text.trim().length === 0) {
      console.warn("❌ Cannot send echo - empty text");
      return;
    }

    // Clear any existing speech timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    // Store the text for reference
    lastEchoTextRef.current = text;

    // Echo format per Tavus docs:
    // https://docs.tavus.io/sections/conversational-video-interface/interactions-protocols/overview
    // Only message_type, event_type, conversation_id, and properties.text are needed
    const interaction = {
      message_type: "conversation",
      event_type: "conversation.echo",
      conversation_id: conversationIdRef.current,
      properties: {
        text: text
      }
    };

    console.log("🗣️ SENDING ECHO TO TAVUS:");
    console.log("   Conversation ID:", conversationIdRef.current);
    console.log("   Text:", text.substring(0, 100) + (text.length > 100 ? "..." : ""));
    console.log("   Full payload:", JSON.stringify(interaction, null, 2));

    // Send via Daily's sendAppMessage to all participants (including Tavus bot)
    try {
      callObjectRef.current.sendAppMessage(interaction, "*");
      console.log("✅ Echo sent successfully via sendAppMessage to all participants");

      // Trigger onSpeakStart immediately
      setIsSpeaking(true);
      onSpeakStartRef.current?.();

      // FALLBACK: Set a timeout to trigger onSpeakEnd if Tavus doesn't send stopped_speaking event
      // Estimate ~80ms per character for speech (average speaking rate)
      const estimatedDuration = Math.max(3000, text.length * 80);
      console.log(`⏱️ Setting fallback onSpeakEnd timeout: ${estimatedDuration}ms`);

      speechTimeoutRef.current = setTimeout(() => {
        console.log("⏱️ FALLBACK: Triggering onSpeakEnd via timeout (Tavus event didn't fire)");
        setIsSpeaking(false);
        onSpeakEndRef.current?.();
        speechTimeoutRef.current = null;
      }, estimatedDuration);

    } catch (err) {
      console.error("❌ Failed to send Echo:", err);
    }
  }, []);

  // Send interrupt to stop avatar mid-speech
  const sendInterrupt = useCallback(() => {
    if (!callObjectRef.current || !conversationIdRef.current) return;

    const interaction = {
      message_type: "conversation",
      event_type: "conversation.interrupt",
      conversation_id: conversationIdRef.current
    };

    console.log("🛑 Sending interrupt to Tavus");
    callObjectRef.current.sendAppMessage(interaction, "*");
  }, []);

  // Greenscreen removal using canvas
  const startGreenscreenProcessing = useCallback(() => {
    if (animationFrameRef.current) return;

    const processFrame = () => {
      const video = avatarVideoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Match canvas to video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for greenscreen removal
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Process pixels - remove green background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect green pixels (the Tavus greenscreen is a bright green)
        // Green is high, red and blue are relatively low
        const isGreen = g > 100 && g > r * 1.2 && g > b * 1.2;

        if (isGreen) {
          // Make pixel transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  }, []);

  const stopGreenscreenProcessing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Start the Daily call and join
  const startConversation = useCallback(async () => {
    // Prevent double initialization (React StrictMode calls useEffect twice)
    if (initializingRef.current || callObjectRef.current) {
      console.log("🎭 Already initializing or connected, skipping...");
      return;
    }

    if (!replicaId && !personaId) {
      setError("No replica or persona ID provided");
      setIsLoading(false);
      return;
    }

    initializingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      setConnectionState("connecting");

      console.log("🎭 Starting Tavus conversation with Daily SDK...");
      console.log("   Replica ID:", replicaId || "(from persona)");
      console.log("   Persona ID:", personaId || "(none)");

      // Create conversation via our backend
      const result = await createConversation({
        replicaId,
        personaId,
        conversationName: `${coachName} Session`,
        customGreeting
      });

      if (!mountedRef.current) {
        initializingRef.current = false;
        return;
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to create conversation");
      }

      conversationIdRef.current = result.conversationId;
      const roomUrl = result.conversationUrl;

      console.log("✅ Tavus conversation created:", result.conversationId);
      console.log("   Room URL:", roomUrl);

      // Create Daily call object with allowMultipleCallInstances for dev mode
      const callObject = DailyIframe.createCallObject({
        subscribeToTracksAutomatically: true,
        allowMultipleCallInstances: true, // Allow multiple instances (for React StrictMode)
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true
        }
      });

      callObjectRef.current = callObject;

      // Track if we've already called onReady to prevent duplicate calls
      let onReadyCalled = false;

      // Set up event handlers
      callObject.on("joined-meeting", () => {
        console.log("✅ Joined Tavus meeting via Daily SDK");
        console.log("🎭 [DEBUG] joined-meeting event fired at:", new Date().toISOString());
        setConnectionState("connected");
        setIsLoading(false);
        // Note: onReady is now primarily triggered from participant-updated when video is playable
        // This is more reliable, but we keep the log here for debugging
        console.log("🎭 [DEBUG] joined-meeting fired, waiting for video track to become playable...");

        // FALLBACK: If video track doesn't trigger onReady within 3 seconds, call it anyway
        // This handles edge cases where participant-updated fires before our handler is set up
        setTimeout(() => {
          if (!onReadyCalled && onReadyRef.current) {
            console.log("🎭 [DEBUG] FALLBACK: Triggering onReady after 3s timeout (video should be ready)");
            onReadyCalled = true;
            onReadyRef.current();
          }
        }, 3000);
      });

      callObject.on("left-meeting", () => {
        console.log("👋 Left Tavus meeting");
        setConnectionState("disconnected");
        onConversationEndRef.current?.();
      });

      callObject.on("error", (e) => {
        console.error("❌ Daily error:", e);
        setError(e.errorMsg || "Connection error");
        setConnectionState("error");
        onErrorRef.current?.(e);
      });

      callObject.on("participant-joined", (event) => {
        console.log("👤 Participant joined:", event.participant.user_name || event.participant.session_id);
      });

      callObject.on("participant-updated", (event) => {
        const participant = event.participant;

        // Check if this is the avatar (remote participant, not local)
        if (!participant.local) {
          const videoTrack = participant.tracks?.video;
          const audioTrack = participant.tracks?.audio;

          // Handle video track
          if (videoTrack?.state === "playable" && videoTrack.track) {
            console.log("🎬 Avatar video track ready");

            // Get or create stream on the video element
            if (avatarVideoRef.current) {
              let stream = avatarVideoRef.current.srcObject;

              if (!stream) {
                stream = new MediaStream();
                avatarVideoRef.current.srcObject = stream;
              }

              // Add video track if not already present
              const existingVideoTracks = stream.getVideoTracks();
              if (existingVideoTracks.length === 0) {
                stream.addTrack(videoTrack.track);
                console.log("🎬 Added video track to stream");
              }

              avatarVideoRef.current.play().catch(console.error);
              setHasAvatarVideo(true);

              // Start greenscreen processing
              startGreenscreenProcessing();

              // IMPORTANT: Also trigger onReady here when avatar video becomes playable
              // This is more reliable than waiting for joined-meeting which may fire early
              if (!onReadyCalled && onReadyRef.current) {
                console.log("🎭 [DEBUG] Avatar video playable - triggering onReady from participant-updated");
                onReadyCalled = true;
                onReadyRef.current();
              }
            }
          }

          // Handle audio track - CRITICAL for hearing the avatar!
          // Use separate audio element for better reliability
          if (audioTrack?.state === "playable" && audioTrack.track) {
            console.log("🔊 Avatar audio track ready");

            // Use dedicated audio element for avatar voice
            if (avatarAudioRef.current) {
              let audioStream = avatarAudioRef.current.srcObject;

              if (!audioStream) {
                audioStream = new MediaStream();
                avatarAudioRef.current.srcObject = audioStream;
              }

              // Add audio track if not already present
              const existingAudioTracks = audioStream.getAudioTracks();
              if (existingAudioTracks.length === 0) {
                audioStream.addTrack(audioTrack.track);
                console.log("🔊 Added audio track to dedicated audio element");
              }

              // Play the audio - this is critical!
              avatarAudioRef.current.muted = false;
              avatarAudioRef.current.volume = 1.0;
              avatarAudioRef.current.play()
                .then(() => console.log("🔊 Avatar audio playback started"))
                .catch((err) => console.error("🔊 Avatar audio play error:", err));
            }
          }
        } else {
          // Local participant (user) video
          const videoTrack = participant.tracks?.video;

          if (videoTrack?.state === "playable" && videoTrack.track) {
            console.log("📹 User video track ready");

            if (userVideoRef.current && !userVideoRef.current.srcObject) {
              const stream = new MediaStream([videoTrack.track]);
              userVideoRef.current.srcObject = stream;
              userVideoRef.current.play().catch(console.error);
              setHasUserVideo(true);
            }
          }
        }
      });

      callObject.on("app-message", (event) => {
        const data = event.data;

        // Log ALL app-messages for debugging
        console.log("📨 Tavus app-message received:", JSON.stringify(data, null, 2));

        if (!data?.event_type) return;

        console.log("📨 Tavus event type:", data.event_type);

        if (data.event_type.includes("started_speaking")) {
          console.log("🎤 Tavus started_speaking event received");
          setIsSpeaking(true);
          onSpeakStartRef.current?.();
        } else if (data.event_type.includes("stopped_speaking")) {
          console.log("🎤 Tavus stopped_speaking event received - clearing fallback timeout");
          // Clear the fallback timeout since we got the real event
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
          }
          setIsSpeaking(false);
          onSpeakEndRef.current?.();
        } else if (data.event_type.includes("user_transcript")) {
          const transcript = data.properties?.text;
          if (transcript) onUserSpeechRef.current?.(transcript);
        } else if (
          data.event_type.includes("perception") ||
          data.event_type.includes("tool_call") ||
          data.event_type === "conversation.perception_tool_call" ||
          data.event_type === "conversation.perception_analysis"
        ) {
          // Handle Tavus Perception tool calls (emotion detection)
          console.log("🎭 Perception event received:", JSON.stringify(data, null, 2));

          // Extract perception data from different possible formats
          const properties = data.properties || {};
          const toolName = properties.tool_name || properties.name || "";
          const toolArgs = properties.arguments || properties.tool_arguments || properties;

          // Log all details for debugging
          console.log("🎭 Perception tool:", toolName);
          console.log("🎭 Perception args:", toolArgs);

          // Check for emotion detection (various tool name formats)
          const isEmotionTool = toolName.toLowerCase().includes("emotion") ||
                               toolName.toLowerCase().includes("detect") ||
                               data.event_type.includes("perception");

          if (isEmotionTool) {
            const emotion = toolArgs.emotion || toolArgs.detected_emotion || properties.emotion;
            const confidence = toolArgs.confidence || toolArgs.score || properties.confidence;
            const observation = toolArgs.observation || toolArgs.description || properties.observation || properties.summary;

            if (emotion) {
              console.log("👁️ Tavus Perception detected emotion:", emotion, "(confidence:", confidence, ")");
              onEmotionDetectedRef.current?.({
                emotion,
                confidence,
                observation,
                source: "tavus_perception",
                raw: data
              });
            } else if (observation) {
              // Even without a specific emotion, pass along any observation
              console.log("👁️ Tavus Perception observation:", observation);
              onEmotionDetectedRef.current?.({
                emotion: "observed",
                confidence: 0.5,
                observation,
                source: "tavus_perception",
                raw: data
              });
            }
          }
        }
      });

      // Join the call immediately (no prejoin UI!)
      await callObject.join({
        url: roomUrl,
        startVideoOff: false,
        startAudioOff: false
      });

    } catch (err) {
      console.error("❌ Tavus conversation error:", err);
      initializingRef.current = false;

      if (mountedRef.current) {
        setError(err.message || "Failed to connect");
        setConnectionState("error");
        setIsLoading(false);
      }

      onErrorRef.current?.(err);
    }
  }, [replicaId, personaId, coachName, customGreeting, startGreenscreenProcessing]);

  // End the current conversation
  const stopConversation = useCallback(async () => {
    stopGreenscreenProcessing();
    initializingRef.current = false;

    // Leave the Daily call
    if (callObjectRef.current) {
      try {
        await callObjectRef.current.leave();
        await callObjectRef.current.destroy();
      } catch (err) {
        console.error("Error leaving Daily call:", err);
      }
      callObjectRef.current = null;
    }

    // Clear video/audio refs
    if (avatarVideoRef.current) {
      avatarVideoRef.current.srcObject = null;
    }
    if (avatarAudioRef.current) {
      avatarAudioRef.current.srcObject = null;
    }
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }

    // End the Tavus conversation
    const conversationId = conversationIdRef.current;
    if (conversationId) {
      try {
        console.log("🛑 Ending Tavus conversation:", conversationId);
        await endConversation(conversationId);
        console.log("✅ Tavus conversation ended");
      } catch (err) {
        console.error("Error ending Tavus conversation:", err);
      }
      conversationIdRef.current = null;
    }

    if (mountedRef.current) {
      setConnectionState("disconnected");
      setHasAvatarVideo(false);
      setHasUserVideo(false);
    }

    onConversationEndRef.current?.();
  }, [stopGreenscreenProcessing]);

  // Expose methods via ref - must be after stopConversation is defined
  useImperativeHandle(ref, () => ({
    speak: sendEcho,
    interrupt: sendInterrupt,
    getConversationId: () => conversationIdRef.current,
    endConversation: stopConversation
  }), [sendEcho, sendInterrupt, stopConversation]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;
    startConversation();

    return () => {
      mountedRef.current = false;
      stopConversation();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tavus-avatar relative overflow-hidden ${className}`}
      style={{
        background: backgroundImageUrl
          ? `url(${backgroundImageUrl}) center/cover no-repeat`
          : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        ...style
      }}
    >
      {/* Hidden video element for avatar stream (video only) */}
      <video
        ref={avatarVideoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      {/* Dedicated audio element for avatar voice - CRITICAL for hearing the avatar */}
      <audio
        ref={avatarAudioRef}
        autoPlay
        playsInline
      />
      {/* Hidden video element for user stream (muted to prevent feedback) */}
      <video
        ref={userVideoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />

      {/* Canvas for greenscreen-removed avatar - FULLSCREEN */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          opacity: hasAvatarVideo ? 1 : 0,
          transition: "opacity 0.5s ease"
        }}
      />

      {/* User camera - small in corner */}
      {hasUserVideo && (
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl z-20">
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el && userVideoRef.current?.srcObject) {
                el.srcObject = userVideoRef.current.srcObject;
              }
            }}
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
            You
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-purple-200 text-lg">Connecting to {coachName}...</p>
          <p className="text-purple-300/60 text-sm mt-2">Setting up video call...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-black/50">
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 max-w-md text-center">
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                startConversation();
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-500 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Fallback when no video */}
      {!hasAvatarVideo && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={generateAvatarPlaceholder(coachName)}
            alt={coachName}
            className="w-48 h-48 object-contain opacity-50"
          />
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && hasAvatarVideo && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-purple-500/30 backdrop-blur-sm rounded-full z-20">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-purple-200 text-sm">Speaking...</span>
        </div>
      )}

      {/* Connected indicator */}
      {connectionState === "connected" && hasAvatarVideo && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full backdrop-blur-sm z-20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 text-xs font-medium">Live</span>
        </div>
      )}
    </div>
  );
});

TavusAvatar.displayName = "TavusAvatar";

export default TavusAvatar;

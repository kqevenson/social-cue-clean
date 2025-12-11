// src/components/AvatarCreator.jsx
// Ready Player Me Avatar Builder Component
// Embeds the RPM iframe and handles avatar export events

import React, { useEffect, useRef, useCallback } from "react";

/**
 * AvatarCreator Component
 * Embeds the Ready Player Me avatar builder in an iframe
 * and handles the avatar export workflow.
 *
 * @param {Object} props
 * @param {Function} props.onAvatarSaved - Callback when avatar is exported, receives GLB URL
 * @param {Function} [props.onClose] - Optional callback to close the creator
 * @param {string} [props.className] - Optional additional CSS classes
 */
const AvatarCreator = ({ onAvatarSaved, onClose, className = "" }) => {
  const iframeRef = useRef(null);
  const subscribedRef = useRef(false);

  /**
   * Handle messages from Ready Player Me iframe
   */
  const handleMessage = useCallback(
    (event) => {
      // Verify the message is from Ready Player Me
      if (
        event.origin !== "https://readyplayer.me" &&
        !event.origin.includes("readyplayer.me")
      ) {
        return;
      }

      // Parse the message data
      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (e) {
        // Not a JSON message, ignore
        return;
      }

      // Handle different event types
      const eventName = data?.eventName || data?.type;

      switch (eventName) {
        case "v1.frame.ready":
          console.log("🎭 Ready Player Me frame is ready");
          // Subscribe to all events once frame is ready
          if (!subscribedRef.current && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                target: "readyplayerme",
                type: "subscribe",
                eventName: "v1.**"
              }),
              "https://readyplayer.me"
            );
            subscribedRef.current = true;
            console.log("📡 Subscribed to Ready Player Me events");
          }
          break;

        case "v1.avatar.exported":
          // Avatar has been exported - extract the GLB URL
          const avatarUrl = data?.data?.url || data?.url;
          if (avatarUrl) {
            console.log("✅ Avatar exported:", avatarUrl);
            onAvatarSaved?.(avatarUrl);
          } else {
            console.warn("⚠️ Avatar exported but no URL found in event data:", data);
          }
          break;

        case "v1.user.set":
          console.log("👤 User session established");
          break;

        case "v1.user.logout":
          console.log("👋 User logged out from Ready Player Me");
          break;

        case "v1.avatar.created":
          console.log("🎨 New avatar created");
          break;

        default:
          // Log other events for debugging
          if (eventName && eventName.startsWith("v1.")) {
            console.log("📨 RPM Event:", eventName, data);
          }
          break;
      }
    },
    [onAvatarSaved]
  );

  /**
   * Set up message listener on mount, clean up on unmount
   */
  useEffect(() => {
    // Add message event listener
    window.addEventListener("message", handleMessage);
    console.log("🎭 AvatarCreator mounted - listening for RPM messages");

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
      subscribedRef.current = false;
      console.log("🎭 AvatarCreator unmounted - cleaned up listeners");
    };
  }, [handleMessage]);

  /**
   * Handle iframe load event
   */
  const handleIframeLoad = useCallback(() => {
    console.log("📦 Ready Player Me iframe loaded");

    // Send subscribe message after a short delay to ensure frame is ready
    setTimeout(() => {
      if (iframeRef.current?.contentWindow && !subscribedRef.current) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**"
          }),
          "https://readyplayer.me"
        );
        subscribedRef.current = true;
        console.log("📡 Subscribed to Ready Player Me events (on load)");
      }
    }, 500);
  }, []);

  return (
    <div className={`avatar-creator-container ${className}`}>
      {/* Header with close button */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Create Your Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close avatar creator"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Ready Player Me iframe */}
      {/*
        URL Parameters for morphTargets:
        - morphTargets=ARKit,Oculus Visemes - enables ARKit blendshapes (52) and Oculus lip-sync visemes (15)
        - textureAtlas=1024 - optimizes textures
        - lod=0 - highest quality mesh
        - useHands=true - includes hand mesh
      */}
      <iframe
        ref={iframeRef}
        src="https://readyplayer.me/avatar?frameApi&morphTargets=ARKit,Oculus%20Visemes&textureAtlas=1024"
        title="Ready Player Me Avatar Creator"
        onLoad={handleIframeLoad}
        allow="camera; microphone; clipboard-write"
        style={{
          width: "100%",
          height: "680px",
          border: "none",
          display: "block"
        }}
      />

      {/* Styles */}
      <style>{`
        .avatar-creator-container {
          width: 100%;
          max-width: 100%;
          background-color: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .avatar-creator-container iframe {
          background-color: #1a1a2e;
        }

        @media (max-width: 768px) {
          .avatar-creator-container iframe {
            height: 100vh;
            max-height: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default AvatarCreator;

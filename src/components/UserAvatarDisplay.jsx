// src/components/UserAvatarDisplay.jsx
// Displays a user's Ready Player Me avatar using model-viewer

import React from "react";

/**
 * UserAvatarDisplay Component
 * Renders a 3D avatar preview using Google's model-viewer
 *
 * @param {Object} props
 * @param {string} [props.avatarUrl] - The GLB URL of the avatar to display
 * @param {string} [props.size] - Size preset: "sm", "md", "lg", "xl", or "full"
 * @param {boolean} [props.autoRotate] - Whether to auto-rotate the model (default: true)
 * @param {boolean} [props.cameraControls] - Whether to enable camera controls (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.fallbackMessage] - Custom message when no avatar is set
 */
const UserAvatarDisplay = ({
  avatarUrl,
  size = "md",
  autoRotate = true,
  cameraControls = true,
  className = "",
  fallbackMessage = "No avatar set"
}) => {
  // Size presets
  const sizeStyles = {
    sm: { width: "120px", height: "120px" },
    md: { width: "200px", height: "200px" },
    lg: { width: "300px", height: "300px" },
    xl: { width: "400px", height: "400px" },
    full: { width: "100%", height: "100%" }
  };

  const dimensions = sizeStyles[size] || sizeStyles.md;

  // If no avatar URL, show fallback UI
  if (!avatarUrl) {
    return (
      <div
        className={`user-avatar-display user-avatar-fallback ${className}`}
        style={{
          ...dimensions,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Placeholder avatar icon */}
        <div
          style={{
            width: "40%",
            height: "40%",
            maxWidth: "80px",
            maxHeight: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}
        >
          <svg
            style={{
              width: "50%",
              height: "50%",
              color: "rgba(255, 255, 255, 0.3)"
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.4)",
            textAlign: "center",
            padding: "0 8px"
          }}
        >
          {fallbackMessage}
        </span>
      </div>
    );
  }

  // Render the 3D avatar
  return (
    <div
      className={`user-avatar-display ${className}`}
      style={{
        ...dimensions,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#1a1a2e",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      <model-viewer
        src={avatarUrl}
        alt="User Avatar"
        auto-rotate={autoRotate ? "" : undefined}
        camera-controls={cameraControls ? "" : undefined}
        shadow-intensity="1"
        environment-image="neutral"
        exposure="0.9"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          "--poster-color": "transparent"
        }}
      />

      <style>{`
        .user-avatar-display {
          position: relative;
          min-width: 80px;
          min-height: 80px;
        }

        .user-avatar-display model-viewer {
          --progress-bar-color: rgba(139, 92, 246, 0.8);
          --progress-bar-height: 3px;
        }

        .user-avatar-display model-viewer::part(default-progress-bar) {
          background-color: rgba(139, 92, 246, 0.3);
        }

        @media (max-width: 640px) {
          .user-avatar-display.responsive {
            width: 100% !important;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Compact avatar display for use in headers, cards, etc.
 */
export const UserAvatarCompact = ({ avatarUrl, size = 48, className = "" }) => {
  if (!avatarUrl) {
    return (
      <div
        className={`avatar-compact ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          border: "2px solid rgba(139, 92, 246, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg
          style={{
            width: size * 0.5,
            height: size * 0.5,
            color: "rgba(139, 92, 246, 0.6)"
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`avatar-compact ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(139, 92, 246, 0.4)",
        backgroundColor: "#1a1a2e"
      }}
    >
      <model-viewer
        src={avatarUrl}
        alt="User Avatar"
        camera-orbit="0deg 90deg 2m"
        field-of-view="30deg"
        disable-zoom
        interaction-prompt="none"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          pointerEvents: "none"
        }}
      />
    </div>
  );
};

export default UserAvatarDisplay;

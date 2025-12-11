// src/components/PracticeScreenAvatarRenderer.jsx
// Displays a Ready Player Me avatar with viseme and emotion control for practice sessions

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback
} from "react";

/**
 * Ready Player Me Viseme mapping
 * Maps viseme indices (0-14) to RPM blendshape names
 */
const VISEME_MAP = {
  0: "viseme_sil",    // Silence
  1: "viseme_PP",     // P, B, M
  2: "viseme_FF",     // F, V
  3: "viseme_TH",     // Th
  4: "viseme_DD",     // T, D
  5: "viseme_kk",     // K, G
  6: "viseme_CH",     // Ch, J, Sh
  7: "viseme_SS",     // S, Z
  8: "viseme_nn",     // N, L
  9: "viseme_RR",     // R
  10: "viseme_aa",    // A
  11: "viseme_E",     // E
  12: "viseme_I",     // I
  13: "viseme_O",     // O
  14: "viseme_U"      // U
};

/**
 * Hume emotion to RPM blendshape mapping
 * Maps Hume emotion names to facial expression blendshapes
 */
const EMOTION_BLENDSHAPE_MAP = {
  // Positive emotions
  joy: {
    mouthSmile: 0.8,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4
  },
  happiness: {
    mouthSmile: 0.7,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },
  amusement: {
    mouthSmile: 0.6,
    mouthOpen: 0.2,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },
  excitement: {
    mouthSmile: 0.5,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    browInnerUp: 0.3
  },

  // Negative emotions
  sadness: {
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
    browDownLeft: 0.3,
    browDownRight: 0.3,
    eyesClosed: 0.2
  },
  anger: {
    browDownLeft: 0.6,
    browDownRight: 0.6,
    mouthFrownLeft: 0.4,
    mouthFrownRight: 0.4,
    jawForward: 0.2
  },
  fear: {
    eyeWideLeft: 0.6,
    eyeWideRight: 0.6,
    browInnerUp: 0.5,
    mouthOpen: 0.3
  },
  anxiety: {
    browInnerUp: 0.4,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
    mouthFrownLeft: 0.2,
    mouthFrownRight: 0.2
  },

  // Surprise
  surprise: {
    eyeWideLeft: 0.7,
    eyeWideRight: 0.7,
    browInnerUp: 0.6,
    mouthOpen: 0.4,
    jawOpen: 0.3
  },

  // Confusion/thinking
  confusion: {
    browDownLeft: 0.4,
    browInnerUp: 0.3,
    mouthPucker: 0.2
  },
  concentration: {
    browDownLeft: 0.3,
    browDownRight: 0.3,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },

  // Neutral
  neutral: {
    // All blendshapes at 0 (reset)
  },
  calm: {
    eyesClosed: 0.1,
    mouthSmile: 0.1
  }
};

/**
 * All blendshape names used for resetting
 */
const ALL_BLENDSHAPES = [
  // Visemes
  ...Object.values(VISEME_MAP),
  // Expressions
  "mouthSmile",
  "mouthFrownLeft",
  "mouthFrownRight",
  "mouthOpen",
  "mouthPucker",
  "jawOpen",
  "jawForward",
  "eyeSquintLeft",
  "eyeSquintRight",
  "eyeWideLeft",
  "eyeWideRight",
  "eyesClosed",
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "cheekSquintLeft",
  "cheekSquintRight",
  "noseSneerLeft",
  "noseSneerRight"
];

/**
 * PracticeScreenAvatarRenderer Component
 * Renders a Ready Player Me avatar with viseme and emotion animation support
 *
 * @param {Object} props
 * @param {string} props.avatarUrl - GLB URL of the Ready Player Me avatar
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showWhenNoAvatar=false] - Show placeholder when no avatar
 * @param {ref} ref - Forwarded ref exposing applyViseme and applyEmotion methods
 */
const PracticeScreenAvatarRenderer = forwardRef(({
  avatarUrl,
  className = "",
  showWhenNoAvatar = false
}, ref) => {
  const modelViewerRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentViseme, setCurrentViseme] = useState(0);
  const currentEmotionRef = useRef(null);
  const visemeTimeoutRef = useRef(null);

  /**
   * Get the model's scene graph to access blendshapes
   */
  const getModelMesh = useCallback(() => {
    if (!modelViewerRef.current) return null;

    try {
      const model = modelViewerRef.current.model;
      if (!model) return null;

      // Find the mesh with morph targets (blendshapes)
      let targetMesh = null;
      model.traverse((node) => {
        if (node.isMesh && node.morphTargetDictionary) {
          targetMesh = node;
        }
      });

      return targetMesh;
    } catch (err) {
      console.warn("Error accessing model mesh:", err);
      return null;
    }
  }, []);

  /**
   * Set a specific blendshape value
   */
  const setBlendshapeValue = useCallback((blendshapeName, value) => {
    const mesh = getModelMesh();
    if (!mesh || !mesh.morphTargetDictionary) return false;

    const index = mesh.morphTargetDictionary[blendshapeName];
    if (index === undefined) return false;

    mesh.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
    return true;
  }, [getModelMesh]);

  /**
   * Reset all blendshapes to 0
   */
  const resetAllBlendshapes = useCallback(() => {
    const mesh = getModelMesh();
    if (!mesh || !mesh.morphTargetInfluences) return;

    for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
      mesh.morphTargetInfluences[i] = 0;
    }
  }, [getModelMesh]);

  /**
   * Apply a viseme to the avatar's mouth
   * @param {number} visemeIndex - Viseme index (0-14)
   * @param {number} [intensity=1] - Intensity of the viseme (0-1)
   * @param {number} [duration=100] - Duration in ms before auto-reset
   */
  const applyViseme = useCallback((visemeIndex, intensity = 1, duration = 100) => {
    if (!isModelLoaded) return;

    // Clear previous viseme timeout
    if (visemeTimeoutRef.current) {
      clearTimeout(visemeTimeoutRef.current);
    }

    // Reset previous viseme
    const prevVisemeName = VISEME_MAP[currentViseme];
    if (prevVisemeName) {
      setBlendshapeValue(prevVisemeName, 0);
    }

    // Apply new viseme
    const visemeName = VISEME_MAP[visemeIndex];
    if (visemeName) {
      setBlendshapeValue(visemeName, intensity);
      setCurrentViseme(visemeIndex);

      // Auto-reset to silence after duration
      if (duration > 0 && visemeIndex !== 0) {
        visemeTimeoutRef.current = setTimeout(() => {
          setBlendshapeValue(visemeName, 0);
          setBlendshapeValue(VISEME_MAP[0], 0.1); // Slight silence pose
          setCurrentViseme(0);
        }, duration);
      }
    }
  }, [isModelLoaded, currentViseme, setBlendshapeValue]);

  /**
   * Apply a sequence of visemes for lip-sync
   * @param {Array<{viseme: number, duration: number}>} sequence - Viseme sequence
   */
  const applyVisemeSequence = useCallback((sequence) => {
    if (!isModelLoaded || !sequence || sequence.length === 0) return;

    let delay = 0;
    sequence.forEach(({ viseme, duration }) => {
      setTimeout(() => {
        applyViseme(viseme, 1, duration);
      }, delay);
      delay += duration;
    });
  }, [isModelLoaded, applyViseme]);

  /**
   * Apply emotion-based facial expression
   * @param {Object} emotionData - Hume emotion data
   * @param {string} emotionData.emotion - Primary emotion name
   * @param {number} [emotionData.intensity=1] - Emotion intensity (0-1)
   * @param {Object} [emotionData.scores] - Raw emotion scores from Hume
   */
  const applyEmotion = useCallback((emotionData) => {
    if (!isModelLoaded || !emotionData) return;

    const emotion = emotionData.emotion?.toLowerCase() || "neutral";
    const intensity = emotionData.intensity || 1;

    // Get blendshape configuration for this emotion
    const blendshapes = EMOTION_BLENDSHAPE_MAP[emotion] || EMOTION_BLENDSHAPE_MAP.neutral;

    // Reset expression blendshapes (but not visemes)
    const expressionBlendshapes = ALL_BLENDSHAPES.filter(
      name => !name.startsWith("viseme_")
    );
    expressionBlendshapes.forEach(name => {
      setBlendshapeValue(name, 0);
    });

    // Apply new emotion blendshapes
    Object.entries(blendshapes).forEach(([name, value]) => {
      setBlendshapeValue(name, value * intensity);
    });

    currentEmotionRef.current = emotion;

    console.log(`🎭 Applied emotion: ${emotion} (intensity: ${intensity})`);
  }, [isModelLoaded, setBlendshapeValue]);

  /**
   * Apply blended emotions based on Hume scores
   * @param {Object} scores - Object with emotion names as keys and scores (0-1) as values
   */
  const applyBlendedEmotions = useCallback((scores) => {
    if (!isModelLoaded || !scores) return;

    // Reset all expression blendshapes
    const expressionBlendshapes = ALL_BLENDSHAPES.filter(
      name => !name.startsWith("viseme_")
    );
    expressionBlendshapes.forEach(name => {
      setBlendshapeValue(name, 0);
    });

    // Accumulate blendshape values from all emotions
    const blendshapeAccumulator = {};

    Object.entries(scores).forEach(([emotion, score]) => {
      if (score < 0.1) return; // Skip very low scores

      const emotionConfig = EMOTION_BLENDSHAPE_MAP[emotion.toLowerCase()];
      if (!emotionConfig) return;

      Object.entries(emotionConfig).forEach(([blendshape, value]) => {
        if (!blendshapeAccumulator[blendshape]) {
          blendshapeAccumulator[blendshape] = 0;
        }
        blendshapeAccumulator[blendshape] += value * score;
      });
    });

    // Apply accumulated values (clamped to 0-1)
    Object.entries(blendshapeAccumulator).forEach(([name, value]) => {
      setBlendshapeValue(name, Math.min(1, value));
    });
  }, [isModelLoaded, setBlendshapeValue]);

  /**
   * Reset avatar to neutral expression
   */
  const resetExpression = useCallback(() => {
    if (!isModelLoaded) return;
    resetAllBlendshapes();
    currentEmotionRef.current = "neutral";
    setCurrentViseme(0);
  }, [isModelLoaded, resetAllBlendshapes]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    applyViseme,
    applyVisemeSequence,
    applyEmotion,
    applyBlendedEmotions,
    resetExpression,
    getModelMesh,
    isLoaded: isModelLoaded
  }), [
    applyViseme,
    applyVisemeSequence,
    applyEmotion,
    applyBlendedEmotions,
    resetExpression,
    getModelMesh,
    isModelLoaded
  ]);

  // Handle model load
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleLoad = () => {
      console.log("🎭 Avatar model loaded");
      setIsModelLoaded(true);

      // Log available blendshapes for debugging
      const mesh = getModelMesh();
      if (mesh?.morphTargetDictionary) {
        console.log("Available blendshapes:", Object.keys(mesh.morphTargetDictionary));
      }
    };

    const handleError = (event) => {
      console.error("🎭 Avatar model load error:", event);
      setIsModelLoaded(false);
    };

    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("error", handleError);

    return () => {
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("error", handleError);

      if (visemeTimeoutRef.current) {
        clearTimeout(visemeTimeoutRef.current);
      }
    };
  }, [avatarUrl, getModelMesh]);

  // Don't render if no avatar URL and not showing placeholder
  if (!avatarUrl && !showWhenNoAvatar) {
    return null;
  }

  // Show placeholder when no avatar
  if (!avatarUrl) {
    return (
      <div
        className={`practice-avatar-renderer practice-avatar-placeholder ${className}`}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          width: "250px",
          height: "250px",
          borderRadius: "16px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}
        >
          <svg
            style={{ width: "40px", height: "40px", color: "rgba(139, 92, 246, 0.6)" }}
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
        <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)" }}>
          No Avatar
        </span>
      </div>
    );
  }

  return (
    <div
      className={`practice-avatar-renderer ${className}`}
      style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        width: "250px",
        height: "250px",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        zIndex: 40
      }}
    >
      <model-viewer
        ref={modelViewerRef}
        src={avatarUrl}
        alt="Practice Avatar"
        autoplay
        camera-controls
        disable-zoom
        shadow-intensity="1"
        camera-orbit="0deg 90deg 2m"
        field-of-view="30deg"
        min-camera-orbit="auto auto auto"
        max-camera-orbit="auto auto auto"
        environment-image="neutral"
        exposure="1"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent"
        }}
      />

      {/* Loading indicator */}
      {!isModelLoaded && avatarUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)"
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(139, 92, 246, 0.3)",
              borderTopColor: "rgba(139, 92, 246, 1)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .practice-avatar-renderer model-viewer {
          --poster-color: transparent;
          --progress-bar-color: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  );
});

PracticeScreenAvatarRenderer.displayName = "PracticeScreenAvatarRenderer";

export default PracticeScreenAvatarRenderer;

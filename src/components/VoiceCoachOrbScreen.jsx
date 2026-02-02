/**  ------------------------------
  VoiceCoachOrbScreen.jsx
  - Avatar-centric practice screen
  - Lip-sync, emotions, body language
  - Hume emotion integration
  - Falls back to orb if no avatar
--------------------------------*/

import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import localforage from "localforage";
import { getApiBase } from "../utils/apiBase";
import useVoiceConversation from "../hooks/useVoiceConversation";
import { stopOpenAITTSPlayback, globalTTSLock, playVoiceResponseWithOpenAI } from "../services/openAITTSService";
import {
  initRecognition,
  setHandlers,
  startRecognition,
  stopRecognition
} from "../services/speechRecognitionService";
import { savePracticeHistory } from "../services/savePracticeHistory";
import { getCurrentSceneContext } from "../services/sceneContextManager";
import { getAvatarWithFallback } from "../services/avatarService";
import { getCoachById, getDefaultCoach, isMockMode, generateAvatarPlaceholder, getConversationDetails } from "../services/tavusService";
import AvatarRenderer from "./AvatarRenderer";
import TavusAvatar from "./TavusAvatar";
import WebcamEmotionMonitor from "./WebcamEmotionMonitor";
import humeEviService from "../services/humeEviService";

// ---- RPM VISEME NAMES (Ready Player Me standard) ----
const RPM_VISEMES = [
  "viseme_sil",   // 0 - silence
  "viseme_PP",    // 1 - p, b, m
  "viseme_FF",    // 2 - f, v
  "viseme_TH",    // 3 - th
  "viseme_DD",    // 4 - t, d
  "viseme_kk",    // 5 - k, g
  "viseme_CH",    // 6 - ch, j, sh
  "viseme_SS",    // 7 - s, z
  "viseme_nn",    // 8 - n, l
  "viseme_RR",    // 9 - r
  "viseme_aa",    // 10 - a
  "viseme_E",     // 11 - e
  "viseme_I",     // 12 - i
  "viseme_O",     // 13 - o
  "viseme_U"      // 14 - u
];

// ---- CHARACTER TO VISEME INDEX ----
const CHAR_TO_VISEME = {
  'a': 10, 'e': 11, 'i': 12, 'o': 13, 'u': 14,
  'p': 1, 'b': 1, 'm': 1,
  'f': 2, 'v': 2,
  't': 4, 'd': 4,
  'n': 8, 'l': 8,
  'k': 5, 'g': 5, 'c': 5, 'q': 5,
  's': 7, 'z': 7, 'x': 7,
  'r': 9,
  'h': 0, 'w': 14, 'y': 12,
  ' ': 0, '.': 0, ',': 0, '!': 0, '?': 0, '-': 0
};

// ---- RPM EXPRESSION BLENDSHAPES ----
const RPM_EXPRESSIONS = {
  joy: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    cheekSquintLeft: 0.3,
    cheekSquintRight: 0.3
  },
  happiness: {
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.6,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },
  excitement: {
    mouthSmileLeft: 0.5,
    mouthSmileRight: 0.5,
    eyeWideLeft: 0.4,
    eyeWideRight: 0.4,
    browInnerUp: 0.4
  },
  sadness: {
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    browInnerUp: 0.3
  },
  anger: {
    browDownLeft: 0.7,
    browDownRight: 0.7,
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
    jawForward: 0.2,
    noseSneerLeft: 0.3,
    noseSneerRight: 0.3
  },
  fear: {
    eyeWideLeft: 0.7,
    eyeWideRight: 0.7,
    browInnerUp: 0.6,
    mouthOpen: 0.3,
    jawOpen: 0.2
  },
  surprise: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browInnerUp: 0.7,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
    mouthOpen: 0.4,
    jawOpen: 0.3
  },
  confusion: {
    browDownLeft: 0.5,
    browInnerUp: 0.4,
    mouthPucker: 0.2,
    eyeSquintLeft: 0.3
  },
  thinking: {
    eyeLookUpLeft: 0.4,
    eyeLookUpRight: 0.4,
    browInnerUp: 0.2,
    mouthPucker: 0.1
  },
  neutral: {}
};

// ---- BODY LANGUAGE POSES (rotation values in degrees) ----
const BODY_POSES = {
  listening: { headTilt: 5, shoulderRaise: 0, lean: 2 },
  speaking: { headTilt: 0, shoulderRaise: 0, lean: 0 },
  thinking: { headTilt: 8, shoulderRaise: 2, lean: -3 },
  excited: { headTilt: -3, shoulderRaise: 5, lean: 5 },
  sad: { headTilt: 10, shoulderRaise: -3, lean: -5 },
  neutral: { headTilt: 0, shoulderRaise: 0, lean: 0 }
};

// ---- PROGRESS SUMMARY BUILDER ----
const buildProgressSummary = (messages, scenario, gradeLevel, perceptionLog = [], voiceEmotionLog = []) => {
  const userTurns = messages.filter((m) => m.role === "user");
  const coachTurns = messages.filter((m) => m.role === "assistant");

  // Build perception insights from Tavus Perception data
  const perceptionInsights = buildPerceptionInsights(perceptionLog);

  // Build voice emotion insights from Hume EVI data
  const voiceEmotionInsights = buildVoiceEmotionInsights(voiceEmotionLog);

  return {
    scenarioId: scenario?.id,
    emotions: messages
      .filter((m) => m.role === "meta")
      .map((m) => ({ emotion: m.emotion, intensity: m.intensity, raw: m.raw })),
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
    // Tavus Perception data
    perceptionLog,
    perceptionInsights,
    // Hume EVI voice emotion data
    voiceEmotionLog,
    voiceEmotionInsights,
  };
};

// ---- VOICE EMOTION INSIGHTS BUILDER (Hume EVI) ----
const buildVoiceEmotionInsights = (voiceEmotionLog) => {
  if (!voiceEmotionLog || voiceEmotionLog.length === 0) {
    return null;
  }

  // Count emotions
  const emotionCounts = {};
  voiceEmotionLog.forEach(entry => {
    const emotion = entry.emotion?.toLowerCase() || 'unknown';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  // Find dominant emotion
  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1]);
  const dominantEmotion = sortedEmotions[0]?.[0] || null;

  // Calculate average intensity
  const avgIntensity = voiceEmotionLog.reduce((sum, e) => sum + (e.intensity || 0), 0) / voiceEmotionLog.length;

  // Get emotion variety
  const uniqueEmotions = Object.keys(emotionCounts);

  return {
    totalObservations: voiceEmotionLog.length,
    emotionCounts,
    dominantEmotion,
    averageIntensity: avgIntensity,
    uniqueEmotions,
    summary: generateVoiceEmotionSummary(emotionCounts, dominantEmotion, avgIntensity)
  };
};

// ---- VOICE EMOTION SUMMARY GENERATOR ----
const generateVoiceEmotionSummary = (emotionCounts, dominantEmotion, avgIntensity) => {
  const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const insights = [];

  // Dominant emotion insight
  if (dominantEmotion) {
    const count = emotionCounts[dominantEmotion];
    const pct = Math.round((count / total) * 100);
    insights.push(`Your voice sounded ${dominantEmotion} most often (${pct}% of the time).`);
  }

  // Intensity insight
  if (avgIntensity > 0.6) {
    insights.push("You spoke with strong emotional expression - great engagement!");
  } else if (avgIntensity < 0.3) {
    insights.push("Your voice was calm and measured throughout the session.");
  }

  // Variety insight
  const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 3) {
    insights.push(`You showed ${sorted.length} different emotions in your voice during the session.`);
  }

  return insights;
};

// ---- PERCEPTION INSIGHTS BUILDER ----
const buildPerceptionInsights = (perceptionLog) => {
  if (!perceptionLog || perceptionLog.length === 0) {
    return null;
  }

  // Count emotions
  const emotionCounts = {};
  const observations = [];

  perceptionLog.forEach(entry => {
    const emotion = entry.emotion?.toLowerCase() || 'unknown';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    if (entry.observation) {
      observations.push({
        emotion: entry.emotion,
        observation: entry.observation,
        confidence: entry.confidence,
        phase: entry.phase,
        timestamp: entry.timestamp
      });
    }
  });

  // Find dominant emotion
  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1]);
  const dominantEmotion = sortedEmotions[0]?.[0] || null;

  // Calculate emotion variety
  const uniqueEmotions = Object.keys(emotionCounts);

  return {
    totalObservations: perceptionLog.length,
    emotionCounts,
    dominantEmotion,
    uniqueEmotions,
    observations: observations.slice(0, 10), // Keep top 10 observations
    summary: generatePerceptionSummary(emotionCounts, observations)
  };
};

// ---- PERCEPTION SUMMARY GENERATOR ----
const generatePerceptionSummary = (emotionCounts, observations) => {
  const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const insights = [];

  // Dominant emotion insight
  const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [emotion, count] = sorted[0];
    const pct = Math.round((count / total) * 100);
    insights.push(`You appeared ${emotion} most often (${pct}% of the time).`);
  }

  // Emotion variety
  if (sorted.length > 2) {
    insights.push(`You showed ${sorted.length} different emotions during the session.`);
  }

  // Highlight key observations
  const keyObservations = observations.filter(o =>
    o.confidence > 0.7 ||
    ['nervous', 'anxious', 'confused', 'frustrated'].includes(o.emotion?.toLowerCase())
  );

  if (keyObservations.length > 0) {
    const firstKey = keyObservations[0];
    if (firstKey.observation) {
      insights.push(`Notable moment: "${firstKey.observation}"`);
    }
  }

  return insights;
};

const PHASE_STORAGE_KEY = "voiceCoach:lastPhase";
const MISSING_SCENARIO_MESSAGE = "We could not load this scenario. Please go back and choose another practice activity.";

const VoiceCoachOrbScreen = ({
  scenario,
  gradeLevel = "6",
  learnerName: initialLearnerName = "",
  autoStart = false,
  onEndSession,
  onNavigate,
  backgroundImageUrl: propBackgroundUrl = null,
  isLoadingBackground = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [phaseRestored, setPhaseRestored] = useState(false);
  const [recognitionReady, setRecognitionReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastAudioBase64, setLastAudioBase64] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [bodyPose, setBodyPose] = useState("neutral");
  const [speakingText, setSpeakingText] = useState("");

  // Tavus coach state
  const [tavusCoach, setTavusCoach] = useState(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState(true);
  // Enable streaming avatar (1 concurrent session allowed)
  const [useStreamingAvatar, setUseStreamingAvatar] = useState(true);
  const [streamingError, setStreamingError] = useState(false);
  // End conversation state
  const [isEndingConversation, setIsEndingConversation] = useState(false);
  // Visual emotion state from webcam (Hume face analysis)
  const [visualEmotion, setVisualEmotion] = useState(null);
  // Voice emotion state from Hume EVI (real-time voice analysis)
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [voiceEmotionLog, setVoiceEmotionLog] = useState([]);
  const voiceEmotionLogRef = useRef([]);
  const [humeEviConnected, setHumeEviConnected] = useState(false);
  // Tavus Perception log - collects all emotion observations during session
  const [perceptionLog, setPerceptionLog] = useState([]);
  const perceptionLogRef = useRef([]);

  const backgroundImageUrl = propBackgroundUrl || getCurrentSceneContext()?.backgroundImageUrl;
  const resolvedGradeLevel = scenario?.gradeLevel || gradeLevel || "6";

  // Refs
  const modelViewerRef = useRef(null);
  const meshesRef = useRef([]);
  const recognitionRef = useRef(null);
  const tavusAvatarRef = useRef(null); // Ref to TavusAvatar for Echo control
  const pendingEchoRef = useRef(null); // Queue for pending Echo messages while avatar loads
  const isListeningRef = useRef(false);
  const cancelledRef = useRef(false);
  const listeningTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const shouldIgnoreInputRef = useRef(false);
  const restartDebounceRef = useRef(null);
  const lipSyncIntervalRef = useRef(null);
  const blinkIntervalRef = useRef(null);
  const idleAnimationRef = useRef(null);
  const breathingRef = useRef(null);

  // Get user data
  const storedUser = (() => {
    try {
      const stored = localStorage.getItem("socialCueUserData");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  })();
  const learnerName = storedUser?.userName || storedUser?.username || storedUser?.name || "";
  const userId = storedUser?.userId || storedUser?.uid || storedUser?.id;

  // ---- GET ALL MESHES WITH MORPH TARGETS ----
  const findMorphTargetMeshes = useCallback(() => {
    if (!modelViewerRef.current) return [];
    try {
      const modelViewer = modelViewerRef.current;
      const meshes = [];

      // Debug: Log what's available on model-viewer
      console.log("🎭 Inspecting model-viewer element...");
      console.log("🎭 modelViewer.model:", modelViewer.model);

      // Method 1: Use model-viewer's official API to get the glTF scene
      // In model-viewer 3.x+, use `model` which wraps the Three.js representation
      if (modelViewer.model) {
        // Log model structure for debugging
        console.log("🎭 model keys:", Object.keys(modelViewer.model));

        // model-viewer's Model class has a `modelViewerModel` or similar property
        // Or we can try to get the underlying Three.js object

        // Try accessing via prototype chain
        const modelProto = Object.getPrototypeOf(modelViewer.model);
        if (modelProto) {
          console.log("🎭 model prototype methods:", Object.getOwnPropertyNames(modelProto));
        }
      }

      // Method 2: Access the Three.js scene via model-viewer internals
      // model-viewer stores scene data in Symbol-keyed properties
      const symbols = Object.getOwnPropertySymbols(modelViewer);
      console.log("🎭 Found", symbols.length, "symbol properties");

      for (const sym of symbols) {
        try {
          const symKey = sym.toString();
          const val = modelViewer[sym];

          // Log promising symbols
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const keys = Object.keys(val);
            if (keys.includes('scene') || keys.includes('children') || keys.includes('traverse')) {
              console.log("🎭 Promising symbol:", symKey, "keys:", keys.slice(0, 10));
            }

            // Check for scene property
            if (val.scene && typeof val.scene.traverse === 'function') {
              console.log("🎭 Found scene via symbol:", symKey);
              val.scene.traverse((node) => {
                if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
                  meshes.push(node);
                  console.log("🎭 Found mesh:", node.name, "morphs:", Object.keys(node.morphTargetDictionary).slice(0, 5));
                }
              });
              if (meshes.length > 0) break;
            }

            // Check if val itself is traversable (is a scene/group)
            if (typeof val.traverse === 'function') {
              console.log("🎭 Found traversable via symbol:", symKey);
              val.traverse((node) => {
                if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
                  meshes.push(node);
                  console.log("🎭 Found mesh:", node.name, "morphs:", Object.keys(node.morphTargetDictionary).slice(0, 5));
                }
              });
              if (meshes.length > 0) break;
            }

            // Dig one level deeper - check val's own symbol properties
            const nestedSymbols = Object.getOwnPropertySymbols(val);
            for (const nestedSym of nestedSymbols) {
              try {
                const nestedVal = val[nestedSym];
                if (nestedVal && typeof nestedVal.traverse === 'function') {
                  console.log("🎭 Found nested traversable:", symKey, "->", nestedSym.toString());
                  nestedVal.traverse((node) => {
                    if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
                      meshes.push(node);
                      console.log("🎭 Found mesh:", node.name);
                    }
                  });
                  if (meshes.length > 0) break;
                }
              } catch (e) { /* skip */ }
            }
            if (meshes.length > 0) break;
          }
        } catch (symError) {
          // Skip inaccessible symbols
        }
      }

      // Method 3: Check direct properties
      if (meshes.length === 0) {
        const propsToCheck = ['scene', '_scene', '__scene', 'threeScene', 'gltf'];
        for (const prop of propsToCheck) {
          const val = modelViewer[prop];
          if (val && typeof val.traverse === 'function') {
            console.log("🎭 Found scene via property:", prop);
            val.traverse((node) => {
              if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
                meshes.push(node);
                console.log("🎭 Found mesh:", node.name);
              }
            });
            if (meshes.length > 0) break;
          }
          // Check .scene sub-property
          if (val && val.scene && typeof val.scene.traverse === 'function') {
            console.log("🎭 Found scene via property:", prop + ".scene");
            val.scene.traverse((node) => {
              if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
                meshes.push(node);
                console.log("🎭 Found mesh:", node.name);
              }
            });
            if (meshes.length > 0) break;
          }
        }
      }

      if (meshes.length === 0) {
        console.warn("🎭 No meshes with morph targets found. The avatar may not have blendshapes enabled.");
        console.log("🎭 Tip: When creating RPM avatars, ensure 'visemes' and 'ARKit blendshapes' are enabled in the avatar configuration.");
      } else {
        console.log("🎭 Successfully found", meshes.length, "mesh(es) with morph targets");
      }

      return meshes;
    } catch (e) {
      console.warn("🎭 Error finding meshes:", e);
      return [];
    }
  }, []);

  // ---- SET BLENDSHAPE VALUE ----
  const setBlendshapeValue = useCallback((name, value) => {
    const meshes = meshesRef.current;
    if (!meshes || meshes.length === 0) return false;

    let found = false;
    meshes.forEach(mesh => {
      if (mesh.morphTargetDictionary && mesh.morphTargetDictionary[name] !== undefined) {
        const index = mesh.morphTargetDictionary[name];
        mesh.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
        found = true;
      }
    });

    // IMPORTANT: Tell model-viewer to re-render after changing morph targets
    if (found && modelViewerRef.current) {
      // model-viewer needs a render request to show updated morph targets
      if (typeof modelViewerRef.current.requestUpdate === 'function') {
        modelViewerRef.current.requestUpdate();
      }
      // Also try the scene's needsUpdate flag
      const mv = modelViewerRef.current;
      const symbols = Object.getOwnPropertySymbols(mv);
      for (const sym of symbols) {
        try {
          const val = mv[sym];
          if (val && val.scene && val.scene.traverse) {
            // Mark materials as needing update
            val.scene.traverse((node) => {
              if (node.isMesh && node.material) {
                node.material.needsUpdate = true;
              }
            });
            break;
          }
        } catch (e) { /* skip */ }
      }
    }

    return found;
  }, []);

  // ---- RESET ALL BLENDSHAPES ----
  const resetAllBlendshapes = useCallback(() => {
    const meshes = meshesRef.current;
    if (!meshes) return;

    meshes.forEach(mesh => {
      if (mesh.morphTargetInfluences) {
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          mesh.morphTargetInfluences[i] = 0;
        }
      }
    });
  }, []);

  // ---- APPLY VISEME (LIP SYNC) ----
  const applyViseme = useCallback((visemeIndex, intensity = 1) => {
    if (!isAvatarLoaded || visemeIndex < 0 || visemeIndex >= RPM_VISEMES.length) return;

    const meshes = meshesRef.current;
    if (!meshes || meshes.length === 0) return;

    // Apply viseme directly to meshes for better performance
    meshes.forEach(mesh => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

      // Reset all visemes first
      RPM_VISEMES.forEach(visemeName => {
        const idx = mesh.morphTargetDictionary[visemeName];
        if (idx !== undefined) {
          mesh.morphTargetInfluences[idx] = 0;
        }
      });

      // Apply the target viseme
      const visemeName = RPM_VISEMES[visemeIndex];
      if (visemeName && visemeIndex > 0) {
        const idx = mesh.morphTargetDictionary[visemeName];
        if (idx !== undefined) {
          mesh.morphTargetInfluences[idx] = intensity;
        }

        // Also open jaw for vowels (indices 10-14 are vowels)
        if (visemeIndex >= 10) {
          const jawIdx = mesh.morphTargetDictionary["jawOpen"];
          if (jawIdx !== undefined) {
            mesh.morphTargetInfluences[jawIdx] = intensity * 0.4;
          }
        }
      }
    });

    // Request render update
    if (modelViewerRef.current) {
      modelViewerRef.current.requestUpdate?.();
    }
  }, [isAvatarLoaded]);

  // ---- APPLY EMOTION ----
  const applyEmotion = useCallback((emotion, intensity = 1) => {
    if (!isAvatarLoaded) return;

    const emotionKey = (emotion || "neutral").toLowerCase();
    const blendshapes = RPM_EXPRESSIONS[emotionKey] || RPM_EXPRESSIONS.neutral;

    // Reset expression blendshapes (not visemes)
    Object.values(RPM_EXPRESSIONS).forEach(expr => {
      Object.keys(expr).forEach(name => setBlendshapeValue(name, 0));
    });

    // Apply new emotion blendshapes
    Object.entries(blendshapes).forEach(([name, value]) => {
      setBlendshapeValue(name, value * intensity);
    });

    setCurrentEmotion(emotionKey);
    console.log("🎭 Applied emotion:", emotionKey, "intensity:", intensity);

    // Update body pose based on emotion
    if (emotionKey === "joy" || emotionKey === "happiness" || emotionKey === "excitement") {
      setBodyPose("excited");
    } else if (emotionKey === "sadness") {
      setBodyPose("sad");
    } else if (emotionKey === "confusion" || emotionKey === "thinking") {
      setBodyPose("thinking");
    } else {
      setBodyPose("neutral");
    }
  }, [isAvatarLoaded, setBlendshapeValue]);

  // ---- BLINK ANIMATION ----
  const startBlinking = useCallback(() => {
    if (blinkIntervalRef.current) return;

    const blink = () => {
      if (!isAvatarLoaded) return;

      // Close eyes
      setBlendshapeValue("eyeBlinkLeft", 1);
      setBlendshapeValue("eyeBlinkRight", 1);

      // Open eyes after 150ms
      setTimeout(() => {
        setBlendshapeValue("eyeBlinkLeft", 0);
        setBlendshapeValue("eyeBlinkRight", 0);
      }, 150);
    };

    // Blink every 3-6 seconds randomly
    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      blinkIntervalRef.current = setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };

    scheduleNextBlink();
  }, [isAvatarLoaded, setBlendshapeValue]);

  const stopBlinking = useCallback(() => {
    if (blinkIntervalRef.current) {
      clearTimeout(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
  }, []);

  // ---- BREATHING ANIMATION ----
  const startBreathing = useCallback(() => {
    if (breathingRef.current || !modelViewerRef.current) return;

    let breathPhase = 0;
    breathingRef.current = setInterval(() => {
      breathPhase += 0.05;
      const breathValue = (Math.sin(breathPhase) + 1) / 2 * 0.1; // 0-0.1 range

      // Subtle chest movement simulation via camera target adjustment
      // This creates a gentle breathing effect
    }, 50);
  }, []);

  const stopBreathing = useCallback(() => {
    if (breathingRef.current) {
      clearInterval(breathingRef.current);
      breathingRef.current = null;
    }
  }, []);

  // ---- IDLE HEAD MOVEMENT ----
  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) return;

    let phase = 0;
    idleAnimationRef.current = setInterval(() => {
      if (!isAvatarLoaded) return;

      phase += 0.02;

      // Subtle head movement
      const headX = Math.sin(phase) * 0.02;
      const headY = Math.sin(phase * 0.7) * 0.015;

      // Apply subtle look direction changes
      setBlendshapeValue("eyeLookInLeft", Math.max(0, headX * 5));
      setBlendshapeValue("eyeLookOutLeft", Math.max(0, -headX * 5));
      setBlendshapeValue("eyeLookInRight", Math.max(0, -headX * 5));
      setBlendshapeValue("eyeLookOutRight", Math.max(0, headX * 5));
    }, 50);
  }, [isAvatarLoaded, setBlendshapeValue]);

  const stopIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      clearInterval(idleAnimationRef.current);
      idleAnimationRef.current = null;
    }
  }, []);

  // ---- LIP SYNC FROM TEXT ----
  const startLipSync = useCallback((text) => {
    if (!isAvatarLoaded || !text) {
      console.log("🎭 Lip sync skipped - avatar not loaded or no text");
      return;
    }

    console.log("🎭 Starting lip sync for:", text.substring(0, 50) + "...");

    // Stop any existing lip sync
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
    }

    const chars = text.toLowerCase().replace(/[^a-z\s]/g, '').split('');
    let charIndex = 0;
    let lastViseme = 0;

    lipSyncIntervalRef.current = setInterval(() => {
      if (charIndex >= chars.length) {
        clearInterval(lipSyncIntervalRef.current);
        lipSyncIntervalRef.current = null;
        applyViseme(0, 0); // Return to silence
        return;
      }

      const char = chars[charIndex];
      let visemeIndex = CHAR_TO_VISEME[char];

      if (visemeIndex === undefined) {
        visemeIndex = 0; // Default to silence
      }

      // Smooth transition - blend between visemes
      if (visemeIndex !== lastViseme) {
        applyViseme(visemeIndex, 0.7 + Math.random() * 0.3);
        lastViseme = visemeIndex;
      }

      charIndex++;
    }, 70); // ~14 phonemes per second for natural speech
  }, [isAvatarLoaded, applyViseme]);

  const stopLipSync = useCallback(() => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }
    // Reset mouth to neutral
    RPM_VISEMES.forEach(v => setBlendshapeValue(v, 0));
    setBlendshapeValue("jawOpen", 0);
  }, [setBlendshapeValue]);

  // ---- LISTENING CONTROLS ----
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
      setBodyPose("listening");
    } catch (err) {
      console.warn("[VoiceCoach] startListening failed:", err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const resumeListeningAfterDelay = useCallback((delay = 300) => {
    shouldIgnoreInputRef.current = true;
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);

    listeningTimeoutRef.current = setTimeout(() => {
      if (!cancelledRef.current && !globalTTSLock.isSpeaking) {
        shouldIgnoreInputRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        setBodyPose("listening");
        try { startRecognition(); } catch {}
      }
      listeningTimeoutRef.current = null;
    }, delay);
  }, []);

  // ---- ENSURE AVATAR URL HAS MORPH TARGETS ----
  const ensureMorphTargets = useCallback((url) => {
    if (!url) return null;

    // RPM avatar URLs look like: https://models.readyplayer.me/AVATAR_ID.glb
    // We need to add ?morphTargets=ARKit,Oculus Visemes to get blendshapes

    try {
      const urlObj = new URL(url);

      // Check if it's a Ready Player Me URL
      if (urlObj.hostname.includes('readyplayer.me') || urlObj.hostname.includes('models.readyplayer.me')) {
        // Check if morphTargets already specified
        if (!urlObj.searchParams.has('morphTargets')) {
          // Note: spaces need to be URL encoded
          urlObj.searchParams.set('morphTargets', 'ARKit,Oculus Visemes');
          const finalUrl = urlObj.toString();
          console.log("🎭 Added morphTargets to avatar URL:", finalUrl);
          return finalUrl;
        }
      }

      return url;
    } catch (e) {
      console.warn("🎭 Could not parse avatar URL:", url);
      return url;
    }
  }, []);

  // ---- LOAD HEYGEN COACH ----
  // Use a ref to track if we've already loaded to prevent double-loading
  const coachLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-loading
    if (coachLoadedRef.current) {
      console.log("🎭 Coach already loaded, skipping...");
      setIsLoadingCoach(false);
      return;
    }

    const loadCoach = async () => {
      try {
        // Try to get avatar from Firestore (if userId available) or localStorage fallback
        let savedAvatar = null;

        if (userId) {
          savedAvatar = await getAvatarWithFallback(userId);
        }

        // Always try localStorage as fallback (even if userId exists but returned nothing)
        if (!savedAvatar) {
          console.log("🎭 Trying localStorage directly...");
          try {
            const stored = localStorage.getItem("socialCueUserData");
            if (stored) {
              const userData = JSON.parse(stored);
              if (userData?.avatar?.provider) {
                savedAvatar = userData.avatar;
                console.log("🎭 Found avatar in localStorage:", savedAvatar);
              }
            }
          } catch (e) {
            console.warn("🎭 Error reading localStorage:", e);
          }
        }

        if ((savedAvatar?.provider === "simli" || savedAvatar?.provider === "tavus") && savedAvatar.avatarId) {
          // Get full coach details from Tavus service (local config, not API)
          // IMPORTANT: Always use the persona/replica IDs from the service config, NOT from localStorage
          // This ensures we use the Echo-mode persona, not any stale AI-enabled persona
          const coachDetails = getCoachById(savedAvatar.avatarId) || getDefaultCoach();
          console.log("🎭 Setting Tavus coach:", coachDetails.name);
          console.log("   personaId:", coachDetails.personaId, "(should be p82338dec61e for Echo mode)");
          console.log("   replicaId:", coachDetails.replicaId);
          setTavusCoach(coachDetails);
          coachLoadedRef.current = true;
        } else if (savedAvatar?.provider === "rpm" && savedAvatar.avatarId) {
          // Legacy RPM avatar - still use it for the 3D renderer
          setUserAvatarUrl(savedAvatar.avatarId);
          coachLoadedRef.current = true;
          console.log("🎭 Loaded legacy RPM avatar");
        } else {
          // Default to Cue coach when no avatar is saved
          console.log("🎭 No saved avatar found, defaulting to Cue coach");
          const defaultCoach = getDefaultCoach();
          if (defaultCoach) {
            setTavusCoach(defaultCoach);
            coachLoadedRef.current = true;
          }
        }
      } catch (err) {
        console.error("🎭 Error loading coach:", err);
      } finally {
        setIsLoadingCoach(false);
      }
    };

    loadCoach();
  }, []); // Empty deps - only run once on mount

  // Debug: Log coach state changes
  useEffect(() => {
    console.log("🎭 Coach state updated:", { isLoadingCoach, tavusCoach: tavusCoach?.name || null, userId });
  }, [isLoadingCoach, tavusCoach, userId]);

  // ---- HANDLE MODEL LOAD ----
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv || !userAvatarUrl) return;

    const handleLoad = () => {
      console.log("🎭 Model viewer loaded");

      // Wait a bit for the model to be fully ready
      setTimeout(() => {
        const meshes = findMorphTargetMeshes();
        meshesRef.current = meshes;

        if (meshes.length > 0) {
          console.log("🎭 Found", meshes.length, "meshes with morph targets");
          setIsAvatarLoaded(true);

          // Start idle animations
          startBlinking();
          startIdleAnimation();
          startBreathing();

          // Log available morph targets
          console.log("🎭 Available morph targets:");
          meshes.forEach(mesh => {
            if (mesh.morphTargetDictionary) {
              console.log("🎭 Mesh", mesh.name, "has", Object.keys(mesh.morphTargetDictionary).length, "morphs");
            }
          });

          applyEmotion("neutral");
        } else {
          console.warn("🎭 No meshes with morph targets found");
          setIsAvatarLoaded(true); // Still mark as loaded
        }
      }, 500);
    };

    mv.addEventListener("load", handleLoad);

    // Also try on scene-graph-ready
    mv.addEventListener("scene-graph-ready", handleLoad);

    return () => {
      mv.removeEventListener("load", handleLoad);
      mv.removeEventListener("scene-graph-ready", handleLoad);
      stopBlinking();
      stopIdleAnimation();
      stopBreathing();
    };
  }, [userAvatarUrl, findMorphTargetMeshes, startBlinking, startIdleAnimation, startBreathing, stopBlinking, stopIdleAnimation, stopBreathing, applyEmotion]);

  // State to track if streaming avatar is ready (use state so hook updates)
  const [streamingAvatarReady, setStreamingAvatarReady] = useState(false);

  // Fallback: if streaming avatar doesn't become ready within 30s, fall back to OpenAI TTS
  useEffect(() => {
    if (!tavusCoach || !useStreamingAvatar || streamingAvatarReady || streamingError) return;
    const timeout = setTimeout(() => {
      if (!streamingAvatarReady) {
        console.warn("⏰ Streaming avatar did not become ready in 30s — falling back to OpenAI TTS");
        setStreamingError(true);
      }
    }, 30000);
    return () => clearTimeout(timeout);
  }, [tavusCoach, useStreamingAvatar, streamingAvatarReady, streamingError]);

  // ---- CONVERSATION HOOK ----
  // ALWAYS disable OpenAI TTS when we have a Tavus coach - avatar speaks everything
  // Only use OpenAI TTS as fallback if streaming errors out
  const shouldDisableTTS = !!tavusCoach && !streamingError;

  console.log("🔊 TTS Status:", { isLoadingCoach, useStreamingAvatar, streamingError, streamingAvatarReady, shouldDisableTTS, hasCoach: !!tavusCoach });

  // Don't auto-start conversation until:
  // 1. Coach is loaded
  // 2. If using streaming avatar with a Tavus coach, WAIT for avatar to be ready
  // This ensures the intro greeting comes from the avatar, not OpenAI TTS
  const shouldAutoStart = !isLoadingCoach && (
    !tavusCoach || // No coach = start immediately (orb mode)
    !useStreamingAvatar || // Not using streaming = start immediately
    streamingAvatarReady || // Avatar is ready = start
    streamingError // Avatar errored = fallback and start
  );

  const conversation = useVoiceConversation({
    scenario,
    autoStart: shouldAutoStart,
    learnerName,
    gradeLevel: resolvedGradeLevel,
    disableTTS: shouldDisableTTS, // Disable OpenAI TTS when streaming avatar handles voice
    visualEmotionContext: visualEmotion, // Pass visual emotion for "you look shy/tired" feedback
    voiceEmotionContext: voiceEmotion, // Pass Hume EVI voice emotion for "you sound nervous" feedback
    onAIResponse: (text) => {
      // This is called when AI responds and TTS is disabled
      // Send to Tavus avatar via Echo API to make it speak
      console.log("🎭 onAIResponse called:", text?.substring(0, 50) + "...");
      console.log("🎭 streamingAvatarReady:", streamingAvatarReady);
      console.log("🎭 tavusAvatarRef.current:", !!tavusAvatarRef.current);
      console.log("🎭 tavusAvatarRef.current?.speak:", typeof tavusAvatarRef.current?.speak);

      if (!text) return;

      setSpeakingText(text);

      // Send Echo to Tavus avatar - this makes Luna speak the ChatGPT response
      if (tavusAvatarRef.current?.speak) {
        console.log("🗣️ Sending to Tavus Echo NOW:", text.substring(0, 50) + "...");
        tavusAvatarRef.current.speak(text);
      } else {
        // Queue message if ref not ready yet
        console.log("⏳ Queueing Echo message (ref not ready yet):", text.substring(0, 50) + "...");
        pendingEchoRef.current = text;
      }
    },
    onAudioBase64: (base64Audio) => setLastAudioBase64(base64Audio),
    onPhaseChange: (newPhase, oldPhase) => {
      console.log("[VoiceCoachOrbScreen] Phase changed:", { oldPhase, newPhase });
      if (newPhase === "complete" || newPhase === "COMPLETE") {
        console.log("🏁 Session complete");
        return;
      }
      stopListening();
      shouldIgnoreInputRef.current = true;
      setTimeout(() => {
        shouldIgnoreInputRef.current = false;
        startListening();
      }, 300);
    },
    onError: (err) => {
      console.error("[VoiceCoachOrbScreen] Conversation error:", err);
      setError("Sorry, something went wrong. Please try again.");
    },
    onAudioStart: () => {
      isSpeakingRef.current = true;
      shouldIgnoreInputRef.current = true;
      stopListening();
      setBodyPose("speaking");
    },
    onAudioComplete: () => {
      isSpeakingRef.current = false;
      shouldIgnoreInputRef.current = false;
      stopLipSync();
      setBodyPose("listening");
      resumeListeningAfterDelay(500);
    }
  });

  const { messages, phase, isSpeaking, isLoading, sendUserMessage, startConversation, signalSpeechComplete } = conversation;

  // Keep a ref to signalSpeechComplete so we always have the latest version in callbacks
  const signalSpeechCompleteRef = useRef(signalSpeechComplete);
  useEffect(() => {
    signalSpeechCompleteRef.current = signalSpeechComplete;
  }, [signalSpeechComplete]);

  // ---- HUME EVI CONNECTION FOR VOICE EMOTION ANALYSIS ----
  useEffect(() => {
    // Only connect Hume EVI when the conversation/session starts
    if (!scenario || !recognitionReady) return;

    const connectHumeEvi = async () => {
      try {
        console.log("🎙️ Connecting Hume EVI for voice emotion analysis...");

        // Set up Hume EVI callbacks
        humeEviService.onEmotion = (emotionData) => {
          if (emotionData?.dominant) {
            const dominantEmotion = emotionData.dominant.name;
            const score = emotionData.dominant.score;

            console.log(`🎧 Voice emotion detected: ${dominantEmotion} (${(score * 100).toFixed(1)}%)`);

            // Update voice emotion state for ChatGPT
            setVoiceEmotion({
              emotion: dominantEmotion,
              intensity: score,
              topEmotions: emotionData.top || [],
              allEmotions: emotionData.all || {}
            });

            // Log for session summary
            const logEntry = {
              emotion: dominantEmotion,
              intensity: score,
              topEmotions: emotionData.top,
              timestamp: Date.now(),
              phase: phaseRef?.current || 'unknown'
            };
            voiceEmotionLogRef.current = [...voiceEmotionLogRef.current, logEntry];
            setVoiceEmotionLog(prev => [...prev, logEntry]);
          }
        };

        humeEviService.onTranscript = (transcript) => {
          // We can optionally use Hume transcripts, but we're already using Web Speech API
          console.log("🗣️ Hume transcript (for reference):", transcript);
        };

        humeEviService.onError = (error) => {
          console.warn("⚠️ Hume EVI error:", error);
          // Don't fail the session, just log it
        };

        humeEviService.onConnectionChange = (connected) => {
          console.log("🔌 Hume EVI connection:", connected ? "connected" : "disconnected");
          setHumeEviConnected(connected);
        };

        // Connect to Hume EVI
        await humeEviService.connect();

      } catch (err) {
        console.warn("⚠️ Could not connect to Hume EVI (non-critical):", err);
        // Don't fail the session - voice emotion is supplementary
      }
    };

    connectHumeEvi();

    // Cleanup on unmount
    return () => {
      console.log("🛑 Disconnecting Hume EVI...");
      humeEviService.disconnect();
    };
  }, [scenario, recognitionReady]);

  // Reference to phase for voice emotion logging
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---- CLEANUP ----
  const cleanup = useCallback(async () => {
    stopRecognition();
    stopLipSync();
    stopBlinking();
    stopIdleAnimation();
    stopBreathing();
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    if (restartDebounceRef.current) clearTimeout(restartDebounceRef.current);
    isListeningRef.current = false;
    isSpeakingRef.current = false;
    shouldIgnoreInputRef.current = false;
    setIsListening(false);
    stopOpenAITTSPlayback();
    localforage.removeItem(PHASE_STORAGE_KEY).catch(() => {});

    // Disconnect Hume EVI
    humeEviService.disconnect();
    setHumeEviConnected(false);

    // CRITICAL: End the Tavus conversation to free up the slot
    if (tavusAvatarRef.current?.endConversation) {
      try {
        console.log("🛑 Cleanup: Ending Tavus conversation...");
        await tavusAvatarRef.current.endConversation();
        console.log("✅ Cleanup: Tavus conversation ended");
      } catch (err) {
        console.error("❌ Cleanup: Error ending Tavus conversation:", err);
      }
    }
  }, [stopLipSync, stopBlinking, stopIdleAnimation, stopBreathing]);

  const handleSessionEnd = useCallback(async (details) => {
    cancelledRef.current = true;
    await cleanup();
    onEndSession?.({ ...details, messages });
  }, [cleanup, onEndSession, messages]);

  // ---- UPDATE LIP SYNC WHEN AI SPEAKS ----
  useEffect(() => {
    if (isSpeaking) {
      stopListening();
      shouldIgnoreInputRef.current = true;
      setBodyPose("speaking");

      // Find latest AI message and set speaking text for AvatarRenderer
      const aiMessages = messages.filter((m) => m.role === "ai" || m.role === "assistant");
      if (aiMessages.length > 0) {
        const latestText = aiMessages[aiMessages.length - 1]?.text;
        if (latestText) {
          console.log("🎭 AI speaking, setting text for lip sync:", latestText.substring(0, 50) + "...");
          setSpeakingText(latestText);
          // Also run the old lip sync for model-viewer fallback
          startLipSync(latestText);
        }
      }
    } else {
      setSpeakingText("");
      stopLipSync();
    }
  }, [isSpeaking, messages, stopListening, startLipSync, stopLipSync]);

  // ---- UPDATE TRANSCRIPT AND EMOTION ----
  useEffect(() => {
    const finalMessages = messages.filter((m) => m.isFinal !== false);
    const aiMessages = finalMessages.filter((m) => m.role === "ai" || m.role === "assistant");

    if (aiMessages.length > 0) {
      const latestAI = aiMessages[aiMessages.length - 1];
      if (latestAI.text) setTranscript([latestAI.text]);
    }

    // Apply emotion from meta messages (Hume)
    const metaMessages = messages.filter((m) => m.role === "meta");
    if (metaMessages.length > 0) {
      const latestMeta = metaMessages[metaMessages.length - 1];
      if (latestMeta.emotion) {
        console.log("🎭 Applying Hume emotion:", latestMeta.emotion);
        applyEmotion(latestMeta.emotion, latestMeta.intensity || 0.8);
      }
    }

    // Safety stop
    const conversationLength = messages.filter((m) => m.role === "ai" || m.role === "assistant").length;
    if (conversationLength >= 10 && phase !== "complete" && phase !== "COMPLETE") {
      handleSessionEnd({ phase: "complete", progress: null });
    }
  }, [messages, phase, handleSessionEnd, applyEmotion]);

  // ---- SPEECH RECOGNITION ----
  useEffect(() => {
    if (!scenario) {
      setError(MISSING_SCENARIO_MESSAGE);
      return;
    }

    // Initialize speech recognition FIRST before setting handlers
    initRecognition();

    setHandlers({
      onInterim: (interim) => {
        if (isSpeakingRef.current || shouldIgnoreInputRef.current) return;
        setTranscript(interim);
      },
      onFinal: async (finalText) => {
        if (shouldIgnoreInputRef.current || isSpeakingRef.current) return;
        const cleaned = (finalText || "").trim();
        if (!cleaned || cleaned.length < 2) return;

        stopRecognition();
        setTranscript(cleaned);
        await new Promise((r) => setTimeout(r, 1200));

        if (!isSpeakingRef.current && !isLoading) {
          await sendUserMessage(cleaned, { audioBase64: lastAudioBase64 });
        }
      },
      onError: () => {},
      onEnd: () => {
        if (restartDebounceRef.current) clearTimeout(restartDebounceRef.current);
        restartDebounceRef.current = setTimeout(() => {
          if (cancelledRef.current || isSpeakingRef.current || globalTTSLock.isSpeaking) return;
          try {
            stopRecognition();
            isListeningRef.current = false;
            setIsListening(false);
          } catch {}
          if (!shouldIgnoreInputRef.current) {
            try {
              startRecognition();
              isListeningRef.current = true;
              setIsListening(true);
            } catch {}
          }
          restartDebounceRef.current = null;
        }, 500);
      }
    });

    setRecognitionReady(true);

    // Start listening immediately (reduced from 1000ms)
    setTimeout(() => {
      if (!cancelledRef.current && !globalTTSLock.isSpeaking) {
        shouldIgnoreInputRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        try { startRecognition(); } catch {}
      }
    }, 200);
  }, [scenario, sendUserMessage, isLoading, lastAudioBase64]);

  // ---- RESTORE PHASE ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { await localforage.getItem("voiceCoach:lastPhase"); }
      catch {} finally { if (!cancelled) setPhaseRestored(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- AUTOSTART ----
  // REMOVED: This was causing conversation to start before avatar was ready
  // The autoStart logic in useVoiceConversation handles this now via shouldAutoStart
  // useEffect(() => {
  //   if (!scenario || !recognitionReady) return;
  //   startConversation();
  // }, [scenario, recognitionReady, startConversation]);

  // ---- PHASE COMPLETION ----
  useEffect(() => {
    const runWrapUp = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: `You are Coach Cue. Return STRICT JSON with: { "whatWentWell": "short sentence", "tipForNextTime": "short sentence" }` },
              { role: "user", content: `Learner finished scenario: ${scenario?.title}. Give a JSON reflection.` }
            ],
            temperature: 0.7,
            max_tokens: 60
          })
        });
        if (!res.ok) return null;
        const response = await res.json();

        const raw = response.choices[0]?.message?.content?.trim();
        try {
          const parsed = JSON.parse(raw);
          await playVoiceResponseWithOpenAI(`${parsed.whatWentWell}. ${parsed.tipForNextTime}.`, "shimmer");
          return parsed;
        } catch { return null; }
      } catch { return null; }
    };

    if (phase === "complete" || phase === "COMPLETE") {
      applyEmotion("joy", 0.8); // Happy expression at end
      const progress = buildProgressSummary(messages, scenario, resolvedGradeLevel, perceptionLogRef.current, voiceEmotionLogRef.current);
      runWrapUp().then(async (wrapupJSON) => {
        if (wrapupJSON) {
          progress.whatWentWell = wrapupJSON.whatWentWell;
          progress.tipForNextTime = wrapupJSON.tipForNextTime;
          progress.aiSummary = wrapupJSON;
        }
        try {
          const userData = JSON.parse(localStorage.getItem("socialCueUserData") || "{}");
          await savePracticeHistory(userData?.userId || "guest", progress.sessionCompletedAt, progress);
        } catch {}
        handleSessionEnd({ phase: "complete", progress });
      });
    }
  }, [phase, handleSessionEnd, messages, scenario, resolvedGradeLevel, applyEmotion]);

  // ---- BODY POSE STYLES ----
  const getBodyPoseStyle = () => {
    const pose = BODY_POSES[bodyPose] || BODY_POSES.neutral;
    return {
      transform: `rotateZ(${pose.headTilt}deg) translateY(${pose.lean}px)`,
      transition: 'transform 0.5s ease-out'
    };
  };

  // ---- NAVIGATE TO CHOOSE COACH ----
  const handleChooseCoach = () => {
    if (onNavigate) {
      onNavigate("choose-coach");
    } else {
      window.dispatchEvent(new CustomEvent("navigate", {
        detail: { screen: "choose-coach" }
      }));
    }
  };

  // ---- END CONVERSATION AND GO TO SUMMARY ----
  const handleEndConversation = async () => {
    if (isEndingConversation) return;

    setIsEndingConversation(true);
    console.log("🛑 Ending conversation...");

    // Get the conversation ID before ending
    const conversationId = tavusAvatarRef.current?.getConversationId?.();
    console.log("   Conversation ID:", conversationId);

    // Stop listening and TTS
    stopListening();
    stopOpenAITTSPlayback();
    cleanup();

    // End the Tavus avatar conversation
    if (tavusAvatarRef.current?.endConversation) {
      try {
        await tavusAvatarRef.current.endConversation();
        console.log("✅ Tavus conversation ended");
      } catch (err) {
        console.error("Error ending Tavus conversation:", err);
      }
    }

    // Build progress summary
    const progress = buildProgressSummary(messages, scenario, resolvedGradeLevel, perceptionLogRef.current, voiceEmotionLogRef.current);

    // Navigate to summary screen with conversation data
    if (onEndSession) {
      onEndSession({
        phase: "complete",
        progress,
        conversationId,
        messages,
        navigateToSummary: true
      });
    } else if (onNavigate) {
      onNavigate("practice-summary", {
        conversationId,
        scenario,
        messages,
        progress
      });
    } else {
      // Fallback: dispatch custom event
      window.dispatchEvent(new CustomEvent("navigate", {
        detail: {
          screen: "practice-summary",
          conversationId,
          scenario,
          messages,
          progress
        }
      }));
    }
  };

  // ---- RENDER ----
  return (
    <div
      className="relative min-h-screen w-full text-white flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#020412',
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {backgroundImageUrl && <div className="absolute inset-0 bg-black/50 pointer-events-none" />}

      {/* Webcam emotion monitor - Detects learner's facial expressions via Hume API */}
      <WebcamEmotionMonitor
        onEmotion={(emotions) => {
          if (emotions && emotions.length > 0) {
            // Handle different response formats from Hume API
            // Format 1: [{ name: "joy", score: 0.8 }] - normalized format
            // Format 2: [{ emotions: { joy: 0.8, sadness: 0.1 } }] - raw Hume format
            let normalizedEmotions = [];

            if (emotions[0]?.emotions) {
              // Raw Hume format - convert to normalized
              const emotionObj = emotions[0].emotions;
              normalizedEmotions = Object.entries(emotionObj)
                .map(([name, score]) => ({ name, score }))
                .filter(e => !isNaN(e.score));
            } else if (emotions[0]?.name !== undefined) {
              // Already normalized format
              normalizedEmotions = emotions.filter(e => e.name && !isNaN(e.score));
            }

            if (normalizedEmotions.length > 0) {
              // Sort by score and take top 3
              const sorted = [...normalizedEmotions].sort((a, b) => b.score - a.score);
              const topEmotions = sorted.slice(0, 3);
              console.log("👁️ Visual emotions detected:", topEmotions.map(e => `${e.name}: ${(e.score * 100).toFixed(0)}%`).join(", "));
              setVisualEmotion({ topEmotions });
            }
          }
        }}
      />

      {isLoadingBackground && !backgroundImageUrl && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/70 animate-pulse">
          Generating scene...
        </div>
      )}

      <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15),_transparent_50%)]`} />

      {/* Top Bar — wraps on mobile */}
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-2 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        {/* End Conversation Button */}
        <button
          onClick={handleEndConversation}
          disabled={isEndingConversation}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm shrink-0 ${
            isEndingConversation
              ? 'bg-gray-600/60 border-gray-500/50 text-gray-400 cursor-not-allowed'
              : 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-400/60'
          }`}
        >
          {isEndingConversation ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Ending...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">End Session</span>
            </>
          )}
        </button>

        {/* Status Indicators */}
        <div className="flex gap-2 shrink-0">
        <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isListening && !isSpeaking
            ? 'bg-purple-500/30 border border-purple-400/50 text-purple-100 scale-105'
            : 'text-gray-400 bg-white/5 border border-white/10'
        }`}>
          Listening
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isSpeaking
            ? 'bg-purple-500/30 border border-purple-400/50 text-purple-100 scale-105'
            : 'text-gray-400 bg-white/5 border border-white/10'
        }`}>
          Speaking
        </div>
        {/* Hume EVI Voice Emotion Indicator */}
        {voiceEmotion?.emotion && (
          <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            humeEviConnected
              ? 'bg-emerald-500/30 border border-emerald-400/50 text-emerald-100'
              : 'bg-yellow-500/30 border border-yellow-400/50 text-yellow-100'
          }`}>
            <span className="flex items-center gap-2">
              <span className="text-xs opacity-70">Voice:</span>
              <span className="capitalize">{voiceEmotion.emotion}</span>
              <span className="text-xs opacity-50">
                ({Math.round((voiceEmotion.intensity || 0) * 100)}%)
              </span>
            </span>
          </div>
        )}
        {!voiceEmotion?.emotion && humeEviConnected && (
          <div className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Voice AI</span>
            </span>
          </div>
        )}
      </div>

      </div>{/* end top bar */}

      {/* Avatar or Orb */}
      <div className="relative z-10 flex flex-col items-center">
        {userAvatarUrl ? (
          // Legacy RPM 3D Avatar
          <div
            className="relative"
            style={{ width: '320px', height: '500px', ...getBodyPoseStyle() }}
          >
            {/* Glow - behind avatar */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
              isSpeaking ? 'bg-purple-500/30 blur-[60px] scale-110'
                : isListening ? 'bg-purple-400/20 blur-[50px]'
                : 'bg-purple-400/10 blur-[40px]'
            }`} style={{ zIndex: 0 }} />

            {/* Three.js Avatar Renderer with lip-sync support */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              <AvatarRenderer
                avatarUrl={userAvatarUrl}
                isSpeaking={isSpeaking}
                speakingText={speakingText}
                emotion={currentEmotion}
                emotionIntensity={0.8}
                width={320}
                height={500}
                onLoad={() => {
                  console.log("🎭 AvatarRenderer loaded");
                  setIsAvatarLoaded(true);
                }}
                onError={(err) => console.error("🎭 AvatarRenderer error:", err)}
              />
            </div>

            {/* Emotion Badge */}
            {currentEmotion && currentEmotion !== "neutral" && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-500/40 border border-purple-400/60 text-xs text-purple-100 capitalize">
                {currentEmotion}
              </div>
            )}
          </div>
        ) : tavusCoach ? (
          // Tavus Coach Avatar - FULLSCREEN with greenscreen removal
          // Avatar takes entire screen, user camera small in corner
          useStreamingAvatar && !streamingError ? (
            <TavusAvatar
              ref={tavusAvatarRef}
              replicaId={tavusCoach.replicaId}
              personaId={tavusCoach.personaId}
              coachName={tavusCoach.name}
              backgroundImageUrl={backgroundImageUrl} // DALL-E background behind avatar
              className="fixed inset-0 w-screen h-screen"
              style={{ zIndex: 5 }}
              onReady={() => {
                console.log("🎭 [DEBUG] onReady callback RECEIVED in VoiceCoachOrbScreen!");
                console.log("🎭 Tavus avatar ready (Echo mode) - will speak via Echo API");
                console.log("🎭 [DEBUG] Current streamingAvatarReady BEFORE setState:", streamingAvatarReady);
                stopOpenAITTSPlayback();
                setStreamingAvatarReady(true);
                console.log("🎭 [DEBUG] setStreamingAvatarReady(true) called!");

                // Process any pending Echo messages that were queued while avatar was loading
                if (pendingEchoRef.current && tavusAvatarRef.current?.speak) {
                  console.log("🗣️ Processing queued Echo message:", pendingEchoRef.current.substring(0, 50) + "...");
                  tavusAvatarRef.current.speak(pendingEchoRef.current);
                  pendingEchoRef.current = null;
                }
              }}
              onSpeakStart={() => {
                console.log("🗣️ Avatar started speaking");
                isSpeakingRef.current = true;
              }}
              onSpeakEnd={() => {
                console.log("🗣️ Avatar finished speaking - signaling speech complete");
                isSpeakingRef.current = false;
                // CRITICAL: Signal to the hook that speech is complete to release TTS locks
                // This allows user input to be processed again
                signalSpeechCompleteRef.current?.();
                resumeListeningAfterDelay(400);
              }}
              onError={(err) => {
                console.error("🎭 Tavus avatar error, falling back to static:", err);
                setStreamingAvatarReady(false);
                setStreamingError(true);
              }}
              onEmotionDetected={(emotionData) => {
                // Tavus Perception detected an emotion - log it for session summary
                console.log("👁️ Perception detected:", emotionData);
                const entry = {
                  ...emotionData,
                  timestamp: new Date().toISOString(),
                  phase: phase
                };
                perceptionLogRef.current = [...perceptionLogRef.current, entry];
                setPerceptionLog(prev => [...prev, entry]);
              }}
            />
          ) : (
            /* Static fallback - show when streaming fails */
            <div className="relative flex flex-col items-center w-full" style={{ height: '70vh', maxWidth: '800px' }}>
              <div className="relative flex items-center justify-center h-full">
                <img
                  src={tavusCoach.previewUrl}
                  alt={tavusCoach.name}
                  className={`w-64 h-64 object-contain transition-all duration-300 drop-shadow-2xl ${
                    isSpeaking ? 'scale-110 animate-bounce' : 'hover:scale-105'
                  }`}
                  style={{
                    filter: isSpeaking ? 'drop-shadow(0 0 30px rgba(168,85,247,0.5))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                  }}
                  onError={(e) => {
                    e.target.src = generateAvatarPlaceholder(tavusCoach.name, tavusCoach.fallbackColor);
                  }}
                />
              </div>

              {/* Coach name */}
              <div className="mt-4 text-center">
                <p className="text-white font-bold text-xl drop-shadow-lg">{tavusCoach.name}</p>
                <p className="text-purple-300 text-sm">Your AI Coach</p>
              </div>

              {/* Retry button */}
              <button
                onClick={() => setStreamingError(false)}
                className="mt-4 px-4 py-2 text-sm bg-purple-500/50 rounded-lg hover:bg-purple-500/70 transition"
              >
                Connect Live Avatar
              </button>
            </div>
          )
        ) : (
          // Fallback Orb - No coach selected
          <div className="relative flex items-center justify-center" style={{ width: '320px', height: '320px' }}>
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
              isSpeaking ? 'bg-purple-400/25 blur-[120px] scale-110'
                : isListening ? 'bg-purple-400/20 blur-[120px]'
                : 'bg-purple-400/15 blur-[120px]'
            }`} />
            <div className={`flex flex-col items-center gap-[30px] ${isSpeaking ? 'scale-110' : ''} transition-transform`}>
              <div className="flex gap-12">
                <div className="w-5 h-5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 20px rgba(74,144,226,0.8)' }} />
                <div className="w-5 h-5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 20px rgba(74,144,226,0.8)' }} />
              </div>
              <div style={{
                width: '105px', height: '66px',
                borderLeft: '15px solid #34D399', borderRight: '15px solid #34D399',
                borderBottom: '15px solid #34D399', borderTop: 'none',
                borderRadius: '0 0 52px 52px',
                filter: 'drop-shadow(0 0 25px rgba(52, 211, 153, 0.6))'
              }} />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2">
            {error}
          </p>
        )}

        {!muted && transcript && (
          <div className="max-w-xl mt-6 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-xl text-white/90 leading-relaxed backdrop-blur-md text-center">
            {Array.isArray(transcript) ? transcript[transcript.length - 1] : transcript}
          </div>
        )}

        {muted && (
          <div className="max-w-xl mt-6 px-8 py-5 rounded-2xl bg-gray-500/10 border border-gray-500/30 text-lg text-gray-400 text-center">
            Microphone muted
          </div>
        )}

        <button
          onClick={() => setMuted(prev => !prev)}
          className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
            muted
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
              : 'bg-gray-800/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {muted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
          {muted ? 'Mic Muted' : 'Mic Active'}
        </button>
      </div>

      <style>{`
        model-viewer {
          --poster-color: transparent;
          --progress-bar-color: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default VoiceCoachOrbScreen;

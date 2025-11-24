// ---------------------------------------------------------------------------
// AIBehaviorConfig.js — SOCIAL CUE AUTONOMY ENGINE (2025 natural edition)
// ---------------------------------------------------------------------------
// Purpose:
// • Give Cue personality + warmth
// • Provide soft conversational guidance (not rigid rules)
// • Allow full scenario autonomy
// • Keep grade-level tone awareness
// • Let Cue teach naturally, not with templates
// • Maintain smooth intro → preview → demonstrate → repeat → feedback flow
// • Support personaEngine + teachingEngine seamlessly
// ---------------------------------------------------------------------------

import { personaEngine } from "../../services/personaEngine.js";

// ---------------------------------------------------------------------------
// 1. MICRO TIPS (kept flexible — NOT force-applied)
// ---------------------------------------------------------------------------
export const MICRO_TIPS = {
  "small-talk-basics": [
    "Start with something small and friendly.",
    "Let it feel natural — no pressure.",
    "A simple question keeps things moving.",
    "Noticing something around you helps."
  ],

  "active-listening": [
    "Show you're tuned in by reacting to what they say.",
    "A small follow-up can show interest.",
    "A quick nod or comment keeps it real.",
    "Try repeating one little detail."
  ],

  "confidence-building": [
    "Start with one comfortable thought.",
    "Take your time — no rush.",
    "One brave sentence is enough.",
    "You can speak softly and still sound confident."
  ],

  "resolving-conflicts": [
    "Try naming what you noticed.",
    "A calm tone goes a long way.",
    "Look for common ground.",
    "Asking how they feel can help."
  ],

  "joining-groups": [
    "Start by connecting to what they're talking about.",
    "Standing nearby helps you warm into it.",
    "A small opener gets you included.",
    "Try reacting to what someone said."
  ]
};

// ---------------------------------------------------------------------------
// 2. GRADE-BASED STYLE PROFILES (soft, not limiting)
// ---------------------------------------------------------------------------
// Guides tone, pacing, and personality but DOES NOT restrict autonomy
export const GRADE_RULES = {
  "k-2":  { style: "very warm, simple, cheerful", maxWords: 12 },
  "3-5":  { style: "friendly, energetic, curious", maxWords: 16 },
  "6-8":  { style: "casual, upbeat, real", maxWords: 20 },
  "9-12": { style: "natural, confident, peer-like", maxWords: 26 }
};

// ---------------------------------------------------------------------------
// 3. NATURAL INTRO BUILDER — simple, warm, flexible
// ---------------------------------------------------------------------------
export function buildIntroFlow({ gradeLevel, topicName, learnerName }) {
  const persona = personaEngine.getPersona(gradeLevel);

  return {
    turn1: persona.greet(),

    turn2: learnerName
      ? `Nice to meet you, ${learnerName}. Today we'll practice ${topicName}.`
      : `Before we start practicing ${topicName}, what's your name?`,

    turn3: `Great. Let’s get into it.`
  };
}

// ---------------------------------------------------------------------------
// 4. NATURAL DEMONSTRATION BUILDER
// ---------------------------------------------------------------------------
// Cue uses this when giving an example of *exactly what she might say*
export function buildDemonstrationLine({ scenarioText }) {
  return `Here's how I might start: "${scenarioText}"`;
}

// ---------------------------------------------------------------------------
// 5. NATURAL FEEDBACK (light coaching, no rigid rules)
// ---------------------------------------------------------------------------
export function buildTeachingTurn({ gradeLevel, topicId, learnerMessage }) {
  const persona = personaEngine.getPersona(gradeLevel);
  const tips = MICRO_TIPS[topicId] || MICRO_TIPS["small-talk-basics"];

  const praise = persona.praise();
  const tip = tips[Math.floor(Math.random() * tips.length)];

  // Single warm, natural line.
  return `${praise} ${tip}`;
}

// ---------------------------------------------------------------------------
// 6. SOFT PHASE STRUCTURE — NO rigid templates
// ---------------------------------------------------------------------------
// Used only by useVoiceConversation to keep the UI predictable,
// NOT to restrict how Cue speaks.
export const PHASES = {
  INTRO_1: "INTRO_1",
  INTRO_2: "INTRO_2",
  INTRO_3: "INTRO_3",

  INTRO_PREVIEW: "INTRO_PREVIEW",  // scenario explanation
  DEMONSTRATE: "DEMONSTRATE",       // Cue gives example
  REPEAT: "REPEAT",                 // learner tries

  TEACHING: "TEACHING",             // Cue gives coaching
  VARIATION: "VARIATION",           // fresh scenario practice

  COMPLETE: "COMPLETE"
};

// Soft automatic next-phase helper:
export function getNextPhase(prev) {
  switch (prev) {
    case PHASES.INTRO_1: return PHASES.INTRO_2;
    case PHASES.INTRO_2: return PHASES.INTRO_3;
    case PHASES.INTRO_3: return PHASES.INTRO_PREVIEW;
    case PHASES.REPEAT:  return PHASES.TEACHING;
    case PHASES.TEACHING:return PHASES.VARIATION;
    default:             return PHASES.COMPLETE;
  }
}

// ---------------------------------------------------------------------------
// FINAL EXPORT
// ---------------------------------------------------------------------------
export const AI_BEHAVIOR_CONFIG = {
  MICRO_TIPS,
  GRADE_RULES,
  buildIntroFlow,
  buildTeachingTurn,
  buildDemonstrationLine,
  PHASES,
  getNextPhase
};

export default AI_BEHAVIOR_CONFIG;

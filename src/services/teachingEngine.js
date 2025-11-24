// ---------------------------------------------------------------------------
// teachingEngine.js — Natural, Autonomous Teaching Support for Social Cue (2025)
// ---------------------------------------------------------------------------
// PURPOSE:
// • Provide soft coaching suggestions (not rigid templates)
// • Offer tiny skill nudges based on learner response
// • Keep guidance warm, supportive, and natural
// • Allow GPT to embed teaching organically in conversation
// • Be grade-aware but NOT repetitive or restrictive
// ---------------------------------------------------------------------------

import { MICRO_TIPS } from "../content/training/AIBehaviorConfig";
import { personaEngine } from "./personaEngine";

// -------------------------------------------------------------
// 1. Analyze learner response for simple cues
// -------------------------------------------------------------
export function evaluateSkillQuality(userMessage) {
  if (!userMessage || userMessage.trim() === "") return "low";

  const msg = userMessage.toLowerCase();

  // Very basic heuristics — autonomy engine does the real work
  if (msg.includes("hi") || msg.includes("hey") || msg.includes("what's up"))
    return "good";

  if (msg.includes("?"))
    return "very-good";

  if (msg.length <= 3)
    return "low";

  return "medium";
}

// -------------------------------------------------------------
// 2. Build a natural coaching line (single sentence)
// -------------------------------------------------------------
export function teachingEngine({ userMessage, topicId, gradeLevel }) {
  const persona = personaEngine.getPersona(gradeLevel);
  const tips = MICRO_TIPS[topicId] || MICRO_TIPS["small-talk-basics"];

  const skillQuality = evaluateSkillQuality(userMessage);

  // Choose a teaching direction
  let selectedTip;
  if (skillQuality === "low") {
    selectedTip = tips[Math.floor(Math.random() * tips.length)];
  } else if (skillQuality === "medium") {
    selectedTip = tips[Math.floor(Math.random() * tips.length)];
  } else if (skillQuality === "good") {
    selectedTip = "That's a solid start. You can build on it naturally.";
  } else if (skillQuality === "very-good") {
    selectedTip = "Nice — that keeps the conversation moving smoothly.";
  }

  // Put it into a *single*, natural, friendly line
  const praise = persona.praise();
  const line = `${praise} ${selectedTip}`;

  // Do NOT trim autonomy — keep it natural
  return {
    text: line.trim(),
    skillQuality
  };
}

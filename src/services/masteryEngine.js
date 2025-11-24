// masteryEngine.js
// Phase 7 — Skill Mastery, Difficulty Progression, and Adaptive SEL Learning

import { determineSkillQuality } from "./teachingEngine.js";

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

export function initializeLearnerMastery() {
  return {
    overallMastery: 0,             // percentage
    topicMastery: {},              // { topicId: { score: number, level: "easy"/"medium"/"hard" } }
    streak: 0,                     // good responses in a row
    struggleCount: 0,              // consecutive low-quality responses
    lastUpdated: Date.now()
  };
}

export function evaluateTurn({ userMessage, topicId, masteryState }) {
  const quality = determineSkillQuality(userMessage);

  const topicData =
    masteryState.topicMastery[topicId] ||
    { score: 0, level: "easy" };

  // ⭐ 1. Convert quality → numeric score
  const delta = (() => {
    switch (quality) {
      case "very-good": return +6;
      case "good": return +4;
      case "medium": return +2;
      case "low": return -4;
      default: return 0;
    }
  })();

  let newScore = Math.max(0, Math.min(100, topicData.score + delta));

  // ⭐ 2. Streak & struggle tracking
  if (quality === "good" || quality === "very-good") {
    masteryState.streak += 1;
    masteryState.struggleCount = 0;
  } else {
    masteryState.struggleCount += 1;
    masteryState.streak = 0;
  }

  // ⭐ 3. Difficulty Promotion Thresholds
  let newLevel = topicData.level;

  if (masteryState.streak >= 3 && topicData.level === "easy") {
    newLevel = "medium";
  }
  if (masteryState.streak >= 5 && topicData.level === "medium") {
    newLevel = "hard";
  }

  // ⭐ 4. Difficulty Demotion (when struggling)
  if (masteryState.struggleCount >= 3 && topicData.level === "hard") {
    newLevel = "medium";
  }
  if (masteryState.struggleCount >= 4 && topicData.level === "medium") {
    newLevel = "easy";
  }

  masteryState.topicMastery[topicId] = {
    score: newScore,
    level: newLevel
  };

  masteryState.lastUpdated = Date.now();

  return {
    quality,
    newScore,
    newLevel,
    masteryState
  };
}

export function chooseNextScenario({ topicId, dynamicScenarios, masteryState }) {
  const topicData = masteryState.topicMastery[topicId] || { level: "easy" };

  const difficulty = topicData.level;

  // ⭐ Select scenario that matches the learner's skill level
  const filtered = dynamicScenarios.filter((s) => s.difficulty === difficulty);

  // fallback if nothing exists
  if (!filtered.length) return dynamicScenarios[Math.floor(Math.random() * dynamicScenarios.length)];

  return filtered[Math.floor(Math.random() * filtered.length)];
}





/**
 * Voice Conversation API Service
 * Handles communication with the backend /api/voice/conversation endpoint
 * Includes support for emotion analysis via Hume API
 */

// Use proxy path in development (via vite.config.js) or full URL in production
const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function sendVoiceToAI({
  conversationHistory,
  scenario,
  gradeLevel,
  userId,
  phase,
  curriculumScript,
  audioBase64
}) {
  try {
    const response = await fetch(`${API_URL}/voice/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationHistory,
        scenario,
        gradeLevel,
        phase,
        curriculumScript,
        userId,
        audioBase64
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Voice conversation API error:", error);
    throw error;
  }
}

/**
 * Helper to get userId from localStorage
 * @returns {string} User ID or "guest" if not found
 */
export function getUserId() {
  try {
    const stored = localStorage.getItem("socialCueUserData");
    if (stored) {
      const userData = JSON.parse(stored);
      return userData?.userId || userData?.id || "guest";
    }
  } catch (err) {
    console.warn("Could not parse user data from localStorage:", err);
  }
  return "guest";
}


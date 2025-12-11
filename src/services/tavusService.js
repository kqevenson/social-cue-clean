// src/services/tavusService.js
// Frontend service for Tavus avatar integration
// Docs: https://docs.tavus.io

import { apiPath } from "../utils/apiBase";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Set to true to use mock data for development without API
const USE_MOCK_DATA = false;

// ============================================================================
// AVATAR PLACEHOLDER GENERATOR
// ============================================================================

/**
 * Generate a simple data URI placeholder for avatars
 * @param {string} name - Name to generate initials from
 * @param {string} bgColor - Background color (hex without #)
 * @returns {string} Data URI for SVG placeholder
 */
export function generateAvatarPlaceholder(name, bgColor = "6366f1") {
  const initials = (name || "?").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect fill="#${bgColor}" width="400" height="600"/>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `)}`;
}

// ============================================================================
// TAVUS COACHES - Real Tavus replicas with personas
// ============================================================================

// Real Tavus coaches with actual replica and persona IDs
// Using Echo mode persona (pipeline_mode: "echo") - avatar only speaks what we tell it via Echo API
const TAVUS_COACHES = [
  {
    id: "coach-cue",
    replicaId: "rca8a38779a8", // New male Cue character
    personaId: "p10764085b44", // Echo mode persona for new Cue replica
    name: "Cue",
    description: "Your social practice partner",
    previewUrl: "https://cdn.replica.tavus.io/20258/7202eb45.mp4", // TODO: Update with new Cue preview
    thumbnailUrl: "https://cdn.replica.tavus.io/20258/7202eb45.mp4", // TODO: Update with new Cue thumbnail
    fallbackColor: "8b5cf6",
    style: "realistic"
  }
];

// ============================================================================
// CONVERSATION FUNCTIONS
// ============================================================================

/**
 * Create a new Tavus conversation
 * @param {Object} params - Conversation parameters
 * @param {string} params.replicaId - The Tavus replica ID
 * @param {string} params.personaId - The Tavus persona ID
 * @param {string} params.conversationName - Optional name for the conversation
 * @param {string} params.customGreeting - Optional custom greeting message
 * @returns {Promise<Object>} Conversation details including conversation_url
 */
export async function createConversation({ replicaId, personaId, conversationName, customGreeting }) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Creating conversation", { replicaId, personaId });
    return {
      success: true,
      conversationId: "mock-conv-" + Date.now(),
      conversationUrl: null,
      message: "Mock mode - real conversations not available"
    };
  }

  try {
    const response = await fetch(apiPath("/api/tavus/conversations"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replicaId, personaId, conversationName, customGreeting })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to create conversation" }));
      throw new Error(err.error || "Failed to create conversation");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Tavus conversation:", error);
    throw error;
  }
}

/**
 * End a Tavus conversation
 * @param {string} conversationId - The conversation ID to end
 * @returns {Promise<Object>} Success status
 */
export async function endConversation(conversationId) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Ending conversation", conversationId);
    return { success: true };
  }

  try {
    const response = await fetch(apiPath(`/api/tavus/conversations/${conversationId}`), {
      method: "DELETE"
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to end conversation" }));
      throw new Error(err.error || "Failed to end conversation");
    }

    return { success: true };
  } catch (error) {
    console.error("Error ending Tavus conversation:", error);
    throw error;
  }
}

/**
 * Get conversation details including transcript and perception analysis
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Conversation details with perception analysis
 */
export async function getConversationDetails(conversationId) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Getting conversation details", conversationId);
    return {
      success: true,
      conversationId,
      perceptionAnalysis: {
        appearance: "User appeared engaged and attentive",
        behavior: "User maintained eye contact and nodded appropriately",
        emotionalStates: ["curious", "happy", "engaged"],
        summary: "The user showed positive engagement throughout the conversation with appropriate social cues."
      },
      transcript: [],
      emotionalStates: []
    };
  }

  try {
    const response = await fetch(apiPath(`/api/tavus/conversations/${conversationId}`), {
      method: "GET"
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to get conversation details" }));
      throw new Error(err.error || "Failed to get conversation details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Tavus conversation details:", error);
    throw error;
  }
}

// ============================================================================
// REPLICA/AVATAR FUNCTIONS
// ============================================================================

/**
 * Get available replicas (avatars) from Tavus
 * @returns {Promise<Array>} List of available replicas
 */
export async function getReplicas() {
  if (USE_MOCK_DATA) {
    return TAVUS_COACHES;
  }

  try {
    const response = await fetch(apiPath("/api/tavus/replicas"));

    if (!response.ok) {
      console.warn("Tavus API error, falling back to mock data");
      return TAVUS_COACHES;
    }

    const data = await response.json();
    return data.replicas || TAVUS_COACHES;
  } catch (error) {
    console.error("Error fetching Tavus replicas:", error);
    return TAVUS_COACHES;
  }
}

/**
 * Get available personas from Tavus
 * @returns {Promise<Array>} List of available personas
 */
export async function getPersonas() {
  if (USE_MOCK_DATA) {
    return TAVUS_COACHES;
  }

  try {
    const response = await fetch(apiPath("/api/tavus/personas"));

    if (!response.ok) {
      console.warn("Tavus API error, falling back to mock data");
      return [];
    }

    const data = await response.json();
    return data.personas || [];
  } catch (error) {
    console.error("Error fetching Tavus personas:", error);
    return [];
  }
}

/**
 * Get available coaches (combines replicas with mock coach data)
 * @returns {Promise<Array>} List of available coaches
 */
export async function getAvailableCoaches() {
  if (USE_MOCK_DATA) {
    return TAVUS_COACHES;
  }

  try {
    const [replicas, personas] = await Promise.all([getReplicas(), getPersonas()]);

    // If we have real replicas/personas, map them
    if (replicas.length > 0 && !replicas[0].id?.startsWith("coach-")) {
      return replicas.map((replica, index) => ({
        id: replica.replica_id || replica.id,
        replicaId: replica.replica_id || replica.id,
        personaId: personas[index]?.persona_id || null,
        name: replica.replica_name || replica.name || `Coach ${index + 1}`,
        description: replica.description || "Your friendly coach",
        previewUrl: replica.thumbnail_url || generateAvatarPlaceholder(replica.replica_name || "Coach"),
        thumbnailUrl: replica.thumbnail_url || generateAvatarPlaceholder(replica.replica_name || "Coach"),
        fallbackColor: "6366f1",
        style: "realistic"
      }));
    }

    return TAVUS_COACHES;
  } catch (error) {
    console.error("Error getting coaches:", error);
    return TAVUS_COACHES;
  }
}

/**
 * Get a coach by ID
 * IMPORTANT: Always uses local TAVUS_COACHES config to ensure correct persona IDs (Echo mode)
 * @param {string} coachId - The coach ID
 * @returns {Object|null} Coach object or null
 */
export function getCoachById(coachId) {
  // Always use local config to ensure we get the correct Echo-mode persona
  // Don't fetch from API as it maps personas incorrectly
  const coach = TAVUS_COACHES.find(c => c.id === coachId || c.replicaId === coachId);
  if (coach) {
    console.log("🎭 getCoachById: Found coach in local config:", coach.name, "personaId:", coach.personaId);
    return coach;
  }
  // Fallback to default coach (Luna with Echo mode)
  console.log("🎭 getCoachById: Coach not found, using default");
  return TAVUS_COACHES[0];
}

/**
 * Get default coach
 * @returns {Object} Default coach object
 */
export function getDefaultCoach() {
  return TAVUS_COACHES[0];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Tavus service is available
 * @returns {Promise<boolean>} True if service is available
 */
export async function isServiceAvailable() {
  if (USE_MOCK_DATA) return true;

  try {
    const response = await fetch(apiPath("/api/tavus/health"), {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    return data.available === true;
  } catch {
    return false;
  }
}

/**
 * Check if we're using mock data
 * @returns {boolean}
 */
export function isMockMode() {
  return USE_MOCK_DATA;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Conversations
  createConversation,
  endConversation,
  getConversationDetails,

  // Coaches/Replicas
  getReplicas,
  getPersonas,
  getAvailableCoaches,
  getCoachById,
  getDefaultCoach,

  // Utilities
  isServiceAvailable,
  isMockMode,
  generateAvatarPlaceholder
};

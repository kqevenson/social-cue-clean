// src/services/heygenService.js
// Frontend service for HeyGen avatar integration
// Supports both mock mode (for development) and real API mode
// Automatically falls back to mock data if API is unavailable

import { apiPath } from "../utils/apiBase";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Set to false to attempt real API calls (will still fallback to mock if API fails)
const USE_MOCK_DATA = true;

// Track API availability status
let apiAvailable = null; // null = unknown, true = available, false = unavailable
let lastApiCheck = 0;
const API_CHECK_INTERVAL = 60000; // Re-check API availability every 60 seconds

// ============================================================================
// MOCK DATA - Preset HeyGen avatars for initial development
// ============================================================================

// ============================================================================
// AVATAR PLACEHOLDER GENERATOR
// ============================================================================

/**
 * Generate a simple data URI placeholder for avatars
 * This avoids CORS issues with external placeholder services
 * @param {string} name - Name to generate initials from
 * @param {string} bgColor - Background color (hex without #)
 * @returns {string} Data URI for SVG placeholder
 */
export function generateAvatarPlaceholder(name, bgColor) {
  // Look up the avatar's fallback color if not provided
  if (!bgColor) {
    const avatar = MOCK_AVATARS.find(a => a.name.toLowerCase() === name?.toLowerCase());
    bgColor = avatar?.fallbackColor || "6366f1";
  }
  const initials = (name || "?").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  // Return a simple colored placeholder - actual images will come from HeyGen API when connected
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect fill="#${bgColor}" width="400" height="600"/>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `)}`;
}

/**
 * Generate a circular avatar placeholder (for small thumbnails)
 * @param {string} name - Name to generate initials from
 * @param {string} bgColor - Background color (hex without #)
 * @returns {string} Data URI for SVG placeholder
 */
export function generateCircularPlaceholder(name, bgColor = "6366f1") {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#${bgColor}"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `)}`;
}

// Coach avatar images - using Unsplash for reliable CORS-friendly images
// These are professional headshots that represent diverse, friendly coaches
const MOCK_AVATARS = [
  {
    id: "Anna_public_3_20240108",
    name: "Anna",
    description: "Friendly and encouraging",
    previewUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "7c3aed",
    voiceId: "e0cc82c22f414c95b1f25696c732f058",
    voiceName: "Cassidy",
    gender: "female",
    style: "normal",
    isPublic: true
  },
  {
    id: "josh_lite3_20230714",
    name: "Josh",
    description: "Calm and supportive",
    previewUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "2563eb",
    voiceId: "131a436c47064f708210df6628ef8f32",
    voiceName: "Josh",
    gender: "male",
    style: "normal",
    isPublic: true
  },
  {
    id: "Kristin_public_2_20240108",
    name: "Kristin",
    description: "Warm and patient",
    previewUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "db2777",
    voiceId: "a0e99841e95046769c291cca2a6ce2b5",
    voiceName: "Kristin",
    gender: "female",
    style: "normal",
    isPublic: true
  },
  {
    id: "Tyler-incasualsuit-20220721",
    name: "Tyler",
    description: "Energetic and fun",
    previewUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "059669",
    voiceId: "0eb38bc974ea4f8db87a3808a59c4b52",
    voiceName: "Tyler",
    gender: "male",
    style: "casual",
    isPublic: true
  },
  {
    id: "Kayla-incasualsuit-20220818",
    name: "Kayla",
    description: "Kind and understanding",
    previewUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "ea580c",
    voiceId: "8c9f16b186e04a5f8c8f75b9dca8c52b",
    voiceName: "Kayla",
    gender: "female",
    style: "casual",
    isPublic: true
  },
  {
    id: "Wayne_20240711",
    name: "Wayne",
    description: "Cool and relaxed",
    previewUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces",
    thumbnailUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    fallbackColor: "0891b2",
    voiceId: "ab7c61f5e8bc40b5a12c8ef5e8e08f3b",
    voiceName: "Wayne",
    gender: "male",
    style: "casual",
    isPublic: true
  }
];

// Mock voices available
const MOCK_VOICES = [
  { id: "e0cc82c22f414c95b1f25696c732f058", name: "Cassidy", gender: "female", language: "en-US" },
  { id: "131a436c47064f708210df6628ef8f32", name: "Josh", gender: "male", language: "en-US" },
  { id: "a0e99841e95046769c291cca2a6ce2b5", name: "Kristin", gender: "female", language: "en-US" },
  { id: "0eb38bc974ea4f8db87a3808a59c4b52", name: "Tyler", gender: "male", language: "en-US" },
  { id: "8c9f16b186e04a5f8c8f75b9dca8c52b", name: "Kayla", gender: "female", language: "en-US" },
  { id: "ab7c61f5e8bc40b5a12c8ef5e8e08f3b", name: "Wayne", gender: "male", language: "en-US" }
];

// ============================================================================
// AVATAR FUNCTIONS
// ============================================================================

/**
 * Get all available avatars
 * @param {Object} options - Filter options
 * @param {string} options.gender - Filter by gender ("male", "female", or null for all)
 * @param {boolean} options.publicOnly - Only return public avatars
 * @returns {Promise<Array>} List of available avatars
 */
export async function getAvailableAvatars(options = {}) {
  if (USE_MOCK_DATA) {
    return getMockAvatars(options);
  }

  try {
    const response = await fetch(apiPath("/api/heygen/avatars"), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      console.warn("HeyGen API error, falling back to mock data");
      return getMockAvatars(options);
    }

    const data = await response.json();
    return data.avatars || [];
  } catch (error) {
    console.error("Error fetching HeyGen avatars:", error);
    return getMockAvatars(options);
  }
}

/**
 * Get mock avatars with optional filtering
 */
function getMockAvatars(options = {}) {
  let avatars = [...MOCK_AVATARS];

  if (options.gender) {
    avatars = avatars.filter(a => a.gender === options.gender);
  }

  if (options.publicOnly) {
    avatars = avatars.filter(a => a.isPublic);
  }

  return Promise.resolve(avatars);
}

/**
 * Get a single avatar by ID
 * @param {string} avatarId - The avatar ID
 * @returns {Promise<Object|null>} Avatar object or null if not found
 */
export async function getAvatarById(avatarId) {
  if (USE_MOCK_DATA) {
    const avatar = MOCK_AVATARS.find(a => a.id === avatarId);
    return Promise.resolve(avatar || null);
  }

  try {
    const response = await fetch(apiPath(`/api/heygen/avatars/${avatarId}`));
    if (!response.ok) {
      return MOCK_AVATARS.find(a => a.id === avatarId) || null;
    }
    const data = await response.json();
    return data.avatar || null;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return MOCK_AVATARS.find(a => a.id === avatarId) || null;
  }
}

/**
 * Get avatar preview image URL
 * @param {string} avatarId - The avatar ID
 * @param {string} type - "full_body" or "thumbnail"
 * @returns {Promise<string|null>} Image URL or null
 */
export async function getAvatarPreviewUrl(avatarId, type = "full_body") {
  const avatar = await getAvatarById(avatarId);
  if (!avatar) return null;

  return type === "thumbnail" ? avatar.thumbnailUrl : avatar.previewUrl;
}

// ============================================================================
// VOICE FUNCTIONS
// ============================================================================

/**
 * Get all available voices
 * @param {Object} options - Filter options
 * @param {string} options.gender - Filter by gender
 * @param {string} options.language - Filter by language code
 * @returns {Promise<Array>} List of available voices
 */
export async function getAvailableVoices(options = {}) {
  if (USE_MOCK_DATA) {
    let voices = [...MOCK_VOICES];

    if (options.gender) {
      voices = voices.filter(v => v.gender === options.gender);
    }
    if (options.language) {
      voices = voices.filter(v => v.language === options.language);
    }

    return Promise.resolve(voices);
  }

  try {
    const response = await fetch(apiPath("/api/heygen/voices"));
    if (!response.ok) {
      return MOCK_VOICES;
    }
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("Error fetching voices:", error);
    return MOCK_VOICES;
  }
}

/**
 * Get voice for a specific avatar
 * @param {string} avatarId - The avatar ID
 * @returns {Promise<Object|null>} Voice object or null
 */
export async function getVoiceForAvatar(avatarId) {
  const avatar = await getAvatarById(avatarId);
  if (!avatar?.voiceId) return null;

  const voices = await getAvailableVoices();
  return voices.find(v => v.id === avatar.voiceId) || null;
}

// ============================================================================
// VIDEO GENERATION FUNCTIONS (for future use)
// ============================================================================

/**
 * Generate a video with the specified avatar speaking text
 * @param {Object} params - Video generation parameters
 * @param {string} params.avatarId - The avatar ID to use
 * @param {string} params.script - The text for the avatar to speak
 * @param {string} params.voiceId - Optional voice ID (uses avatar's default if not specified)
 * @returns {Promise<Object>} Video generation result with videoId for polling
 */
export async function generateVideo({ avatarId, script, voiceId = null }) {
  if (USE_MOCK_DATA) {
    // Return mock video generation response
    console.log("MOCK: Video generation requested", { avatarId, script: script.substring(0, 50) });
    return Promise.resolve({
      success: true,
      videoId: `mock-video-${Date.now()}`,
      status: "processing",
      message: "Mock video generation started"
    });
  }

  try {
    const response = await fetch(apiPath("/api/heygen/generate-video"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId, script, voiceId })
    });

    if (!response.ok) {
      throw new Error("Video generation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating video:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check the status of a video generation request
 * @param {string} videoId - The video ID to check
 * @returns {Promise<Object>} Video status with URL if completed
 */
export async function getVideoStatus(videoId) {
  if (USE_MOCK_DATA) {
    // Mock completed video after "processing"
    return Promise.resolve({
      success: true,
      status: "completed",
      videoUrl: `https://example.com/mock-video-${videoId}.mp4`,
      message: "Mock video ready"
    });
  }

  try {
    const response = await fetch(apiPath(`/api/heygen/video-status/${videoId}`));
    if (!response.ok) {
      throw new Error("Failed to get video status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error checking video status:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STREAMING/INTERACTIVE AVATAR (for future real-time conversations)
// ============================================================================

/**
 * Create a streaming avatar session for real-time interaction
 * @param {Object} params - Session parameters
 * @param {string} params.avatarId - The avatar ID
 * @param {string} params.voiceId - The voice ID
 * @returns {Promise<Object>} Session info with session ID and ICE servers
 */
export async function createStreamingSession({ avatarId, voiceId }) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Streaming session requested", { avatarId, voiceId });
    return Promise.resolve({
      success: true,
      sessionId: `mock-session-${Date.now()}`,
      message: "Mock streaming session - not available in mock mode"
    });
  }

  try {
    const response = await fetch(apiPath("/api/heygen/streaming/create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId, voiceId })
    });

    if (!response.ok) {
      throw new Error("Failed to create streaming session");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating streaming session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send text to a streaming avatar session for the avatar to speak
 * @param {string} sessionId - The session ID
 * @param {string} text - Text for the avatar to speak
 * @returns {Promise<Object>} Response status
 */
export async function sendStreamingText(sessionId, text) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Streaming text sent", { sessionId, text: text.substring(0, 50) });
    return Promise.resolve({ success: true, message: "Mock text sent" });
  }

  try {
    const response = await fetch(apiPath("/api/heygen/streaming/speak"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, text })
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending streaming text:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Close a streaming avatar session
 * @param {string} sessionId - The session ID to close
 * @returns {Promise<Object>} Close status
 */
export async function closeStreamingSession(sessionId) {
  if (USE_MOCK_DATA) {
    console.log("MOCK: Streaming session closed", { sessionId });
    return Promise.resolve({ success: true, message: "Mock session closed" });
  }

  try {
    const response = await fetch(apiPath("/api/heygen/streaming/close"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });

    return await response.json();
  } catch (error) {
    console.error("Error closing streaming session:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if HeyGen API service is available
 * Caches result for API_CHECK_INTERVAL milliseconds
 * @param {boolean} forceCheck - Force a fresh check
 * @returns {Promise<boolean>} True if service is available
 */
export async function isServiceAvailable(forceCheck = false) {
  // In mock mode, service is always "available" (mock data works)
  if (USE_MOCK_DATA) {
    return true;
  }

  // Use cached result if recent
  const now = Date.now();
  if (!forceCheck && apiAvailable !== null && (now - lastApiCheck) < API_CHECK_INTERVAL) {
    return apiAvailable;
  }

  try {
    const response = await fetch(apiPath("/api/heygen/health"), {
      method: "GET",
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    apiAvailable = response.ok;
    lastApiCheck = now;
    return apiAvailable;
  } catch {
    apiAvailable = false;
    lastApiCheck = now;
    return false;
  }
}

/**
 * Check if we're using mock data
 * @returns {boolean} True if using mock data
 */
export function isMockMode() {
  return USE_MOCK_DATA || apiAvailable === false;
}

/**
 * Get the current service status
 * @returns {Object} Status object with mode and availability info
 */
export function getServiceStatus() {
  return {
    mode: USE_MOCK_DATA ? "mock" : (apiAvailable === false ? "fallback" : "live"),
    mockModeEnabled: USE_MOCK_DATA,
    apiAvailable: apiAvailable,
    lastChecked: lastApiCheck ? new Date(lastApiCheck).toISOString() : null,
    message: USE_MOCK_DATA
      ? "Using mock avatars (development mode)"
      : apiAvailable === false
        ? "API unavailable - using fallback avatars"
        : apiAvailable === true
          ? "Connected to HeyGen API"
          : "API status unknown"
  };
}

/**
 * Get a default/fallback avatar when none is selected
 * Useful for ensuring the app always has an avatar to display
 * @returns {Object} Default avatar object
 */
export function getDefaultAvatar() {
  return MOCK_AVATARS[0]; // Anna is the default
}

/**
 * Validate that an avatar ID exists (in mock or real data)
 * @param {string} avatarId - The avatar ID to validate
 * @returns {Promise<boolean>} True if avatar exists
 */
export async function isValidAvatarId(avatarId) {
  if (!avatarId) return false;
  const avatar = await getAvatarById(avatarId);
  return avatar !== null;
}

/**
 * Get avatar with fallback to default
 * Ensures an avatar is always returned even if the requested one doesn't exist
 * @param {string} avatarId - The avatar ID to fetch
 * @returns {Promise<Object>} Avatar object (requested or default)
 */
export async function getAvatarByIdWithFallback(avatarId) {
  if (!avatarId) {
    return getDefaultAvatar();
  }

  const avatar = await getAvatarById(avatarId);
  return avatar || getDefaultAvatar();
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Avatars
  getAvailableAvatars,
  getAvatarById,
  getAvatarByIdWithFallback,
  getAvatarPreviewUrl,
  getDefaultAvatar,
  isValidAvatarId,

  // Voices
  getAvailableVoices,
  getVoiceForAvatar,

  // Video generation
  generateVideo,
  getVideoStatus,

  // Streaming/Interactive
  createStreamingSession,
  sendStreamingText,
  closeStreamingSession,

  // Utilities
  isServiceAvailable,
  isMockMode,
  getServiceStatus,
  generateAvatarPlaceholder,
  generateCircularPlaceholder
};

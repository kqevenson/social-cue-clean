// src/services/avatarService.js
// Service for managing user avatar data in Firestore
// Supports Tavus avatars and legacy RPM avatars

import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Avatar data structure:
 * {
 *   provider: "tavus" | "simli" | "rpm",  // Avatar provider
 *   avatarId: string,                      // Provider-specific avatar ID
 *   replicaId: string,                     // Tavus replica ID (if Tavus)
 *   personaId: string,                     // Tavus persona ID (if Tavus)
 *   previewUrl: string                     // Thumbnail/preview image URL
 * }
 */

// ============================================================================
// TAVUS AVATAR FUNCTIONS
// ============================================================================

/**
 * Save a Tavus avatar to Firestore for a specific user
 *
 * @param {string} userId - The user's unique identifier
 * @param {Object} avatarData - Avatar data object
 * @param {string} avatarData.avatarId - The Tavus coach ID
 * @param {string} avatarData.replicaId - The Tavus replica ID
 * @param {string} avatarData.personaId - The Tavus persona ID
 * @param {string} avatarData.previewUrl - Preview/thumbnail image URL
 * @returns {Promise<boolean>} True if save was successful, false otherwise
 */
export async function saveTavusAvatar(userId, { avatarId, replicaId, personaId, previewUrl }) {
  if (!userId) {
    console.warn("avatarService: Cannot save avatar - no userId provided");
    return false;
  }

  if (!avatarId) {
    console.warn("avatarService: Cannot save avatar - no avatarId provided");
    return false;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    const avatarData = {
      avatar: {
        provider: "tavus",
        avatarId: avatarId,
        replicaId: replicaId || null,
        personaId: personaId || null,
        previewUrl: previewUrl || null
      },
      avatarUpdatedAt: new Date().toISOString()
    };

    if (userDoc.exists()) {
      await updateDoc(userDocRef, avatarData);
    } else {
      await setDoc(userDocRef, {
        ...avatarData,
        createdAt: new Date().toISOString()
      });
    }

    console.log("avatarService: Tavus avatar saved successfully for user:", userId);
    return true;
  } catch (error) {
    console.error("avatarService: Error saving Tavus avatar:", error);
    return false;
  }
}

// Aliases for backward compatibility
export const saveSimliAvatar = saveTavusAvatar;
export const saveHeyGenAvatar = saveTavusAvatar;

/**
 * Get avatar data from Firestore (supports Tavus, Simli, HeyGen legacy, and RPM)
 * Returns normalized avatar object or null if no avatar exists
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object|null>} Avatar object { provider, avatarId, replicaId, personaId, previewUrl } or null
 */
export async function getAvatar(userId) {
  if (!userId) {
    console.warn("avatarService: Cannot fetch avatar - no userId provided");
    return null;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("avatarService: User document not found for:", userId);
      return null;
    }

    const data = userDoc.data();

    // Check for new avatar structure first
    if (data?.avatar?.provider) {
      // Normalize heygen/simli providers to tavus for backward compatibility
      let provider = data.avatar.provider;
      if (provider === "heygen" || provider === "simli") {
        provider = "tavus";
      }
      console.log("avatarService: Found avatar with provider:", provider);
      return {
        provider: provider,
        avatarId: data.avatar.avatarId || null,
        replicaId: data.avatar.replicaId || null,
        personaId: data.avatar.personaId || null,
        previewUrl: data.avatar.previewUrl || null
      };
    }

    // Fallback to legacy avatarUrl field (RPM avatars)
    if (data?.avatarUrl) {
      console.log("avatarService: Found legacy RPM avatar, normalizing...");
      return {
        provider: "rpm",
        avatarId: data.avatarUrl, // For RPM, the URL is the ID
        previewUrl: null
      };
    }

    console.log("avatarService: No avatar found for user:", userId);
    return null;
  } catch (error) {
    console.error("avatarService: Error fetching avatar:", error);
    return null;
  }
}

/**
 * Delete avatar data from Firestore for a specific user
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 */
export async function deleteAvatar(userId) {
  if (!userId) {
    console.warn("avatarService: Cannot delete avatar - no userId provided");
    return false;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn("avatarService: User document not found for:", userId);
      return false;
    }

    await updateDoc(userDocRef, {
      avatar: null,
      avatarUrl: null, // Also clear legacy field
      avatarUpdatedAt: new Date().toISOString()
    });

    console.log("avatarService: Avatar deleted successfully for user:", userId);
    return true;
  } catch (error) {
    console.error("avatarService: Error deleting avatar:", error);
    return false;
  }
}

/**
 * Get avatar with localStorage fallback (supports Simli, HeyGen legacy, and RPM)
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object|null>} Avatar object or null
 */
export async function getAvatarWithFallback(userId) {
  // Try Firestore first
  const firestoreAvatar = await getAvatar(userId);
  if (firestoreAvatar) {
    return firestoreAvatar;
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem("socialCueUserData");
    if (stored) {
      const userData = JSON.parse(stored);

      // Check new format first
      if (userData?.avatar?.provider) {
        console.log("avatarService: Using avatar from localStorage fallback");
        // Normalize heygen to simli
        const provider = userData.avatar.provider === "heygen" ? "simli" : userData.avatar.provider;
        return {
          ...userData.avatar,
          provider
        };
      }

      // Legacy format
      if (userData?.avatarUrl) {
        console.log("avatarService: Using legacy avatar URL from localStorage fallback");
        return {
          provider: "rpm",
          avatarId: userData.avatarUrl,
          previewUrl: null
        };
      }
    }
  } catch (error) {
    console.warn("avatarService: Error reading from localStorage:", error);
  }

  return null;
}

/**
 * Save avatar to both Firestore and localStorage (backup)
 *
 * @param {string} userId - The user's unique identifier
 * @param {Object} avatarData - Avatar data { provider, avatarId, previewUrl }
 * @returns {Promise<boolean>} True if at least one save succeeded
 */
export async function saveAvatarWithBackup(userId, avatarData) {
  let firestoreSaved = false;
  let localSaved = false;

  // Normalize provider (heygen -> simli for backward compatibility)
  const provider = avatarData.provider === "heygen" ? "simli" : avatarData.provider;

  // Save to Firestore based on provider
  if (provider === "simli") {
    firestoreSaved = await saveSimliAvatar(userId, {
      avatarId: avatarData.avatarId,
      previewUrl: avatarData.previewUrl
    });
  } else {
    // Legacy RPM save
    firestoreSaved = await saveAvatarUrl(userId, avatarData.avatarId);
  }

  // Save to localStorage as backup
  try {
    const stored = localStorage.getItem("socialCueUserData");
    const userData = stored ? JSON.parse(stored) : {};
    userData.avatar = {
      provider: provider,
      avatarId: avatarData.avatarId,
      previewUrl: avatarData.previewUrl || null
    };
    localStorage.setItem("socialCueUserData", JSON.stringify(userData));
    localSaved = true;
    console.log("avatarService: Avatar saved to localStorage backup");
  } catch (error) {
    console.warn("avatarService: Error saving to localStorage:", error);
  }

  return firestoreSaved || localSaved;
}

// ============================================================================
// LEGACY RPM AVATAR FUNCTIONS (kept for backward compatibility)
// ============================================================================

/**
 * Save an avatar URL to Firestore for a specific user (LEGACY - use saveHeyGenAvatar for new avatars)
 *
 * @param {string} userId - The user's unique identifier
 * @param {string} url - The avatar GLB URL from Ready Player Me
 * @returns {Promise<boolean>} True if save was successful, false otherwise
 */
export async function saveAvatarUrl(userId, url) {
  if (!userId) {
    console.warn("avatarService: Cannot save avatar - no userId provided");
    return false;
  }

  if (!url) {
    console.warn("avatarService: Cannot save avatar - no URL provided");
    return false;
  }

  try {
    const userDocRef = doc(db, "users", userId);

    // Check if document exists first
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        avatarUrl: url,
        avatarUpdatedAt: new Date().toISOString()
      });
    } else {
      // Create new document if it doesn't exist
      await setDoc(userDocRef, {
        avatarUrl: url,
        avatarUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    console.log("avatarService: Avatar URL saved successfully for user:", userId);
    return true;
  } catch (error) {
    console.error("avatarService: Error saving avatar URL:", error);
    return false;
  }
}

/**
 * Fetch the avatar URL from Firestore for a specific user
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<string|null>} The avatar URL or null if not found/error
 */
export async function getAvatarUrl(userId) {
  if (!userId) {
    console.warn("avatarService: Cannot fetch avatar - no userId provided");
    return null;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn("avatarService: User document not found for:", userId);
      return null;
    }

    const avatarUrl = userDoc.data()?.avatarUrl;

    if (!avatarUrl) {
      console.log("avatarService: No avatar URL set for user:", userId);
      return null;
    }

    console.log("avatarService: Avatar URL fetched successfully for user:", userId);
    return avatarUrl;
  } catch (error) {
    console.error("avatarService: Error fetching avatar URL:", error);
    return null;
  }
}

/**
 * Delete the avatar URL from Firestore for a specific user
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 */
export async function deleteAvatarUrl(userId) {
  if (!userId) {
    console.warn("avatarService: Cannot delete avatar - no userId provided");
    return false;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn("avatarService: User document not found for:", userId);
      return false;
    }

    await updateDoc(userDocRef, {
      avatarUrl: null,
      avatarUpdatedAt: new Date().toISOString()
    });

    console.log("avatarService: Avatar URL deleted successfully for user:", userId);
    return true;
  } catch (error) {
    console.error("avatarService: Error deleting avatar URL:", error);
    return false;
  }
}

/**
 * Get avatar URL with localStorage fallback
 * Useful when Firestore might be unavailable
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<string|null>} The avatar URL or null if not found
 */
export async function getAvatarUrlWithFallback(userId) {
  // Try Firestore first
  const firestoreUrl = await getAvatarUrl(userId);
  if (firestoreUrl) {
    return firestoreUrl;
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem("socialCueUserData");
    if (stored) {
      const userData = JSON.parse(stored);
      if (userData?.avatarUrl) {
        console.log("avatarService: Using avatar URL from localStorage fallback");
        return userData.avatarUrl;
      }
    }
  } catch (error) {
    console.warn("avatarService: Error reading from localStorage:", error);
  }

  return null;
}

/**
 * Save avatar URL to both Firestore and localStorage
 *
 * @param {string} userId - The user's unique identifier
 * @param {string} url - The avatar GLB URL
 * @returns {Promise<boolean>} True if at least one save succeeded
 */
export async function saveAvatarUrlWithBackup(userId, url) {
  let firestoreSaved = false;
  let localSaved = false;

  // Save to Firestore
  firestoreSaved = await saveAvatarUrl(userId, url);

  // Save to localStorage as backup
  try {
    const stored = localStorage.getItem("socialCueUserData");
    const userData = stored ? JSON.parse(stored) : {};
    userData.avatarUrl = url;
    localStorage.setItem("socialCueUserData", JSON.stringify(userData));
    localSaved = true;
    console.log("avatarService: Avatar URL saved to localStorage backup");
  } catch (error) {
    console.warn("avatarService: Error saving to localStorage:", error);
  }

  return firestoreSaved || localSaved;
}

export default {
  // Tavus avatar functions
  saveTavusAvatar,
  saveSimliAvatar, // Alias for backward compatibility
  saveHeyGenAvatar, // Alias for backward compatibility
  getAvatar,
  deleteAvatar,
  getAvatarWithFallback,
  saveAvatarWithBackup,
  // Legacy RPM functions (backward compatibility)
  saveAvatarUrl,
  getAvatarUrl,
  deleteAvatarUrl,
  getAvatarUrlWithFallback,
  saveAvatarUrlWithBackup
};

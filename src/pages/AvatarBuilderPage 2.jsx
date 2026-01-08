// src/pages/AvatarBuilderPage.jsx
// Avatar Builder Page - Allows learners to create and save their Ready Player Me avatar

import React, { useState, useEffect, useCallback } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AvatarCreator from "../components/AvatarCreator";

/**
 * AvatarBuilderPage Component
 * Displays the Ready Player Me avatar builder and saves the avatar to Firestore
 *
 * @param {Object} props
 * @param {Function} [props.onClose] - Optional callback to navigate away from the page
 */
const AvatarBuilderPage = ({ onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  /**
   * Load user data and existing avatar on mount
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user ID from localStorage
        const stored = localStorage.getItem("socialCueUserData");
        const userData = stored ? JSON.parse(stored) : {};
        const uid = userData?.userId || userData?.uid || userData?.id;

        if (!uid) {
          console.warn("No user ID found - avatar will not be saved to Firestore");
          setIsLoading(false);
          return;
        }

        setUserId(uid);

        // Try to load existing avatar from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const existingAvatar = userDoc.data()?.avatarUrl;
          if (existingAvatar) {
            setAvatarUrl(existingAvatar);
            console.log("📦 Loaded existing avatar:", existingAvatar);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  /**
   * Handle avatar export from Ready Player Me
   */
  const handleAvatarSaved = useCallback(
    async (glbUrl) => {
      console.log("🎭 Avatar exported:", glbUrl);

      // Update local state immediately
      setAvatarUrl(glbUrl);
      setSaveError(null);
      setSaveSuccess(false);

      // Save to Firestore if we have a user ID
      if (!userId) {
        console.warn("No user ID - saving avatar to localStorage only");
        // Save to localStorage as fallback
        try {
          const stored = localStorage.getItem("socialCueUserData");
          const userData = stored ? JSON.parse(stored) : {};
          userData.avatarUrl = glbUrl;
          localStorage.setItem("socialCueUserData", JSON.stringify(userData));
          setSaveSuccess(true);
        } catch (err) {
          console.error("Error saving to localStorage:", err);
          setSaveError("Could not save avatar locally");
        }
        return;
      }

      // Save to Firestore
      setIsSaving(true);

      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          avatarUrl: glbUrl,
          avatarUpdatedAt: new Date().toISOString()
        });

        console.log("✅ Avatar saved to Firestore");
        setSaveSuccess(true);

        // Also update localStorage
        const stored = localStorage.getItem("socialCueUserData");
        const userData = stored ? JSON.parse(stored) : {};
        userData.avatarUrl = glbUrl;
        localStorage.setItem("socialCueUserData", JSON.stringify(userData));
      } catch (err) {
        console.error("❌ Error saving avatar to Firestore:", err);
        setSaveError("Could not save avatar. Please try again.");

        // Still save to localStorage as fallback
        try {
          const stored = localStorage.getItem("socialCueUserData");
          const userData = stored ? JSON.parse(stored) : {};
          userData.avatarUrl = glbUrl;
          localStorage.setItem("socialCueUserData", JSON.stringify(userData));
        } catch (localErr) {
          console.error("Error saving to localStorage:", localErr);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  /**
   * Clear current avatar
   */
  const handleClearAvatar = useCallback(async () => {
    setAvatarUrl(null);
    setSaveSuccess(false);
    setSaveError(null);

    if (userId) {
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          avatarUrl: null,
          avatarUpdatedAt: new Date().toISOString()
        });
        console.log("🗑️ Avatar cleared from Firestore");
      } catch (err) {
        console.error("Error clearing avatar:", err);
      }
    }

    // Clear from localStorage too
    try {
      const stored = localStorage.getItem("socialCueUserData");
      const userData = stored ? JSON.parse(stored) : {};
      delete userData.avatarUrl;
      localStorage.setItem("socialCueUserData", JSON.stringify(userData));
    } catch (err) {
      console.error("Error clearing from localStorage:", err);
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#020412] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[200px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Build Your Avatar
            </h1>
            <p className="text-gray-400 mt-2">
              Create a custom 3D avatar to represent you in practice sessions
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              Back
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Avatar Creator Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                {avatarUrl ? "Update Your Avatar" : "Create Your Avatar"}
              </h2>
              <p className="text-sm text-gray-400">
                Use the builder below to customize your avatar. When you're done, click "Next" to export it.
              </p>

              <div className="rounded-xl overflow-hidden border border-gray-700/50 shadow-xl">
                <AvatarCreator onAvatarSaved={handleAvatarSaved} />
              </div>
            </div>

            {/* Avatar Preview Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Your Avatar</h2>

              {/* Status messages */}
              {isSaving && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span className="text-blue-300">Saving avatar...</span>
                </div>
              )}

              {saveSuccess && !isSaving && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-300">Avatar saved successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-300">{saveError}</span>
                </div>
              )}

              {/* Avatar preview or placeholder */}
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden">
                {avatarUrl ? (
                  <div className="relative">
                    {/* Model Viewer for 3D preview */}
                    <model-viewer
                      src={avatarUrl}
                      alt="Your Avatar"
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      style={{
                        width: "100%",
                        height: "500px",
                        backgroundColor: "#1a1a2e"
                      }}
                    />

                    {/* Avatar actions */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <button
                        onClick={handleClearAvatar}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-colors text-sm"
                      >
                        Remove Avatar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                    {/* Placeholder avatar icon */}
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                      <svg
                        className="w-12 h-12 text-gray-600"
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
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No Avatar Yet
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Use the avatar builder on the left to create your custom 3D avatar.
                      It will appear here when you're done.
                    </p>
                  </div>
                )}
              </div>

              {/* Avatar URL display (for debugging/reference) */}
              {avatarUrl && (
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Avatar URL:</p>
                  <p className="text-xs text-gray-400 break-all font-mono">
                    {avatarUrl}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Model Viewer script (loaded from CDN) */}
      <script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
    </div>
  );
};

export default AvatarBuilderPage;

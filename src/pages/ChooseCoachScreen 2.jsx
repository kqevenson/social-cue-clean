// src/pages/ChooseCoachScreen.jsx
// "Choose Your Coach" screen - Tavus avatar selection for learners

import React, { useState, useEffect, useCallback } from "react";
import { Check, ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import { saveTavusAvatar, getAvatar } from "../services/avatarService";
import { getAvailableCoaches, getCoachById, isMockMode, generateAvatarPlaceholder } from "../services/tavusService";

/**
 * ChooseCoachScreen Component
 * Displays a grid of Tavus avatars for the learner to choose as their coach
 */
const ChooseCoachScreen = ({ onClose, onNavigate, darkMode = true }) => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [currentCoach, setCurrentCoach] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  // Load available coaches and current selection on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available avatars from TavusService
        const availableAvatars = await getAvailableCoaches();
        setCoaches(availableAvatars);

        // Get user ID and current coach selection
        const stored = localStorage.getItem("socialCueUserData");
        const userData = stored ? JSON.parse(stored) : {};
        const uid = userData?.userId || userData?.uid || userData?.id;

        if (uid) {
          setUserId(uid);
          const avatar = await getAvatar(uid);

          if ((avatar?.provider === "simli" || avatar?.provider === "tavus") && avatar.avatarId) {
            // Find the matching coach from loaded avatars
            const coach = availableAvatars.find(c => c.id === avatar.avatarId);
            if (coach) {
              setCurrentCoach(coach);
              setSelectedCoach(coach);
            } else {
              // Coach not in list, try to fetch directly
              const fetchedCoach = await getCoachById(avatar.avatarId);
              if (fetchedCoach) {
                setCurrentCoach(fetchedCoach);
                setSelectedCoach(fetchedCoach);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading coaches:", err);
        setLoadError("Could not load coaches. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle coach selection
  const handleSelectCoach = useCallback((coach) => {
    setSelectedCoach(coach);
    setSaveSuccess(false);
  }, []);

  // Handle save/confirm selection
  const handleConfirmSelection = useCallback(async () => {
    if (!selectedCoach) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save to Firestore
      if (userId) {
        await saveTavusAvatar(userId, {
          avatarId: selectedCoach.id,
          replicaId: selectedCoach.replicaId,
          personaId: selectedCoach.personaId,
          previewUrl: selectedCoach.previewUrl
        });
      }

      // Also save to localStorage
      const stored = localStorage.getItem("socialCueUserData");
      const userData = stored ? JSON.parse(stored) : {};
      userData.avatar = {
        provider: "tavus",
        avatarId: selectedCoach.id,
        replicaId: selectedCoach.replicaId,
        personaId: selectedCoach.personaId,
        previewUrl: selectedCoach.previewUrl,
        name: selectedCoach.name
      };
      localStorage.setItem("socialCueUserData", JSON.stringify(userData));

      setCurrentCoach(selectedCoach);
      setSaveSuccess(true);

      // Navigate back after a short delay
      setTimeout(() => {
        if (onNavigate) {
          onNavigate("home");
        } else if (onClose) {
          onClose();
        }
      }, 1500);

    } catch (err) {
      console.error("Error saving coach selection:", err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCoach, userId, onNavigate, onClose]);

  const bgClass = darkMode ? "bg-[#020412]" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const cardBgClass = darkMode ? "bg-gray-900/50" : "bg-white";
  const borderClass = darkMode ? "border-gray-700/50" : "border-gray-200";

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Background effects */}
      {darkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[200px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[200px] rounded-full" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate ? onNavigate("home") : onClose?.()}
            className={`p-2 rounded-xl ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Choose Your Coach
            </h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
              Pick a friendly coach to guide your practice sessions
            </p>
          </div>
        </div>

        {/* Current coach indicator */}
        {currentCoach && !saveSuccess && (
          <div className={`mb-6 p-4 rounded-xl ${darkMode ? "bg-purple-500/10 border-purple-500/30" : "bg-purple-50 border-purple-200"} border`}>
            <p className={`text-sm ${darkMode ? "text-purple-300" : "text-purple-700"}`}>
              Your current coach: <span className="font-semibold">{currentCoach.name}</span>
            </p>
          </div>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div className={`mb-6 p-4 rounded-xl ${darkMode ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"} border flex items-center gap-3`}>
            <Check className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            <p className={`${darkMode ? "text-green-300" : "text-green-700"}`}>
              {selectedCoach?.name} is now your coach!
            </p>
          </div>
        )}

        {/* Service status indicator */}
        {isMockMode() && (
          <div className={`mb-4 px-3 py-2 rounded-lg ${darkMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"} border flex items-center gap-2`}>
            <AlertCircle className={`w-4 h-4 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
            <span className={`text-xs ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
              {getServiceStatus().message}
            </span>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            <span className={`ml-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Loading coaches...</span>
          </div>
        ) : loadError ? (
          <div className={`flex flex-col items-center justify-center py-20 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
            <p className="text-center mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : coaches.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <Sparkles className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">No coaches available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Coach grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {coaches.map((coach) => {
                const isSelected = selectedCoach?.id === coach.id;
                const isCurrent = currentCoach?.id === coach.id;

                return (
                  <button
                    key={coach.id}
                    onClick={() => handleSelectCoach(coach)}
                    className={`
                      relative rounded-2xl overflow-hidden border-2 transition-all duration-200
                      ${isSelected
                        ? "border-purple-500 ring-2 ring-purple-500/30 scale-[1.02]"
                        : `${borderClass} hover:border-purple-400/50`
                      }
                      ${cardBgClass}
                    `}
                  >
                    {/* Avatar image */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
                      <img
                        src={coach.previewUrl}
                        alt={coach.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          // Fallback to generated placeholder if image fails to load
                          e.target.src = generateAvatarPlaceholder(coach.name);
                        }}
                      />

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}

                      {/* Current coach badge */}
                      {isCurrent && !isSelected && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-900/80 rounded-full">
                          <span className="text-xs text-gray-300">Current</span>
                        </div>
                      )}
                    </div>

                    {/* Coach info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{coach.name}</h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {coach.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm button */}
            <div className="fixed bottom-24 left-0 right-0 px-4 z-20">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={handleConfirmSelection}
                  disabled={!selectedCoach || isSaving || (selectedCoach?.id === currentCoach?.id)}
                  className={`
                    w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200
                    flex items-center justify-center gap-2
                    ${selectedCoach && selectedCoach?.id !== currentCoach?.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25"
                      : `${darkMode ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : selectedCoach?.id === currentCoach?.id ? (
                    "Already your coach"
                  ) : selectedCoach ? (
                    <>
                      <Check className="w-5 h-5" />
                      Choose {selectedCoach.name} as My Coach
                    </>
                  ) : (
                    "Select a coach"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChooseCoachScreen;

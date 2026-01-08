import React, { useState, useEffect } from 'react';
import { Home, RotateCcw, Info, Lightbulb, PartyPopper, Leaf } from 'lucide-react';
import { savePracticeHistory } from "../../services/savePracticeHistory";

const PracticeSessionResults = ({ progress, darkMode, onNavigate }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    [0, 1, 2].forEach((p, i) => {
      setTimeout(() => setPhase(p), i * 200);
    });

    // Save to Firestore using helper
    const saveToFirestore = async () => {
      try {
        // Get userId from localStorage or use "guest"
        const stored = localStorage.getItem("socialCueUserData");
        const userData = stored ? JSON.parse(stored) : {};
        const userId = userData?.userId || userData?.id || "guest";

        // Use sessionCompletedAt as sessionId
        const sessionId = progress?.sessionCompletedAt || new Date().toISOString();

        // Save complete progress object (already contains all required fields)
        await savePracticeHistory(userId, sessionId, progress);
        console.log("✅ Practice history saved to Firestore");
      } catch (error) {
        console.error("❌ Error saving practice history to Firestore:", error);
        // No localStorage fallback - Firestore is required
      }
    };

    saveToFirestore();
  }, [progress]);

  const wrap = (text) => text || "Great work today! You practiced with effort and clarity.";

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-emerald-400 animate-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pb-24">
        <div className="max-w-5xl w-full">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 ${
            darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-2xl'
          } transform transition-all duration-700 ${
            phase >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>

            {/* Header */}
            <div className="text-center mb-10">
              <PartyPopper className="w-20 h-20 text-blue-400 mb-4 mx-auto" />
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
                Session Complete!
              </h1>
              <p className="text-lg opacity-80">{progress?.scenarioTitle}</p>
            </div>

            {/* What You Did Well */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 transition-all duration-700 ${
              phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${darkMode ? 'bg-green-500/15 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Leaf className="w-6 h-6 text-green-400" />
                What You Did Well
              </h2>
              <p className="text-lg leading-relaxed">
                {progress?.whatWentWell || "You practiced with effort and clarity. You stayed present in the conversation and gave natural responses."}
              </p>
            </div>

            {/* What to Try Next Time */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 transition-all duration-700 ${
              phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${darkMode ? 'bg-yellow-500/15 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-amber-400" />
                A Gentle Tip for Next Time
              </h2>
              <p className="text-lg leading-relaxed">
                {progress?.tipForNextTime || "Try adding a follow-up question or one more detail to deepen the conversation."}
              </p>
            </div>

            {/* Session Stats */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-10 transition-all duration-700 ${
              phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Info className="w-6 h-6" /> Your Practice Summary
              </h3>
              <p className="text-lg mb-2"><strong>Turns:</strong> {progress?.totalTurns}</p>
              <p className="text-lg mb-2"><strong>Your Responses:</strong> {progress?.userTurns}</p>
              <p className="text-lg"><strong>Coach Guidance:</strong> {progress?.coachTurns}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('practice')}
                className="flex-1 font-bold py-4 px-6 rounded-full border-2 border-gray-300 dark:border-white/20 hover:bg-white/10 transition"
              >
                <RotateCcw className="w-5 h-5 inline-block mr-2" />
                Try Again
              </button>

              <button
                onClick={() => onNavigate('progress')}
                className="flex-1 font-bold py-4 px-6 rounded-full border-2 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition"
              >
                View Progress
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition"
              >
                <Home className="w-5 h-5 inline-block mr-2" />
                Home
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSessionResults;

import React, { useEffect, useMemo, useState } from "react";
import PracticeStartScreen from "./PracticeStartScreen";
import VoiceCoachOrbScreen from "../VoiceCoachOrbScreen";
import PracticeSessionResults from "./PracticeSessionResults";
import {
  topics as voicePracticeTopics,
  getScenariosForTopic,
  getGradeBandFromGrade,
} from "../../data/voicePracticeScenarios";
import { AI_BEHAVIOR_CONFIG } from "../../content/training/AIBehaviorConfig";
import { ArrowRight } from "lucide-react";
import { savePracticeHistory } from "../../services/savePracticeHistory";
import { generateSceneBackground } from "../../services/dalleImageService";
import {
  createSceneContext,
  setSceneBackgroundImage,
  clearSceneContext,
  getSceneDataForDallE
} from "../../services/sceneContextManager";

const PracticeScreen = ({ darkMode }) => {
  const [userGradeBand, setUserGradeBand] = useState("6-8");
  const [userGradeNumber, setUserGradeNumber] = useState(6);
  const [learnerName, setLearnerName] = useState("");
  const [pendingTopic, setPendingTopic] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSummary, setSessionSummary] = useState(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("socialCueUserData");
      if (stored) {
        const parsed = JSON.parse(stored);
        const rawGrade = parsed?.gradeLevel || parsed?.grade || "6";
        const numeric = parseInt(String(rawGrade).replace(/[^0-9]/g, "") || "6", 10);
        setUserGradeNumber(Number.isNaN(numeric) ? 6 : numeric);
        setUserGradeBand(getGradeBandFromGrade(numeric).toLowerCase());

        const possibleName =
          parsed?.firstName ||
          parsed?.profile?.firstName ||
          parsed?.displayName ||
          parsed?.username ||
          parsed?.name ||
          "";
        setLearnerName(possibleName);
      }
    } catch {}
  }, []);

  const topicPreviews = useMemo(() => {
    return voicePracticeTopics.map((topic) => {
      const scenarios = getScenariosForTopic(topic.id, userGradeNumber) || [];
      return {
        topic,
        scenarios,
      };
    });
  }, [userGradeNumber]);

  const filteredTopics = topicPreviews.filter(({ topic }) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (pendingTopic) {
    return (
      <PracticeStartScreen
        topicName={pendingTopic.title}
        gradeLevel={userGradeNumber}
        learnerName={learnerName}
        onStartSession={async (scenarioObject) => {
          // Clear any previous scene context
          clearSceneContext();

          // Create FIXED scene context for this entire session
          const sceneContext = createSceneContext(scenarioObject, userGradeBand);
          console.log("🎬 Scene context created:", sceneContext.fullScenarioPrompt);

          // Start generating background image (don't block session start)
          setIsGeneratingBackground(true);
          setBackgroundImageUrl(null);

          // Generate DALL-E background using scene context data
          const promptData = getSceneDataForDallE();
          generateSceneBackground(promptData)
            .then((imageUrl) => {
              if (imageUrl) {
                setBackgroundImageUrl(imageUrl);
                // Store in scene context manager for persistence
                setSceneBackgroundImage(imageUrl);
                console.log("🎨 Background image ready and stored in context");
              }
            })
            .catch((err) => {
              console.warn("Background generation failed (non-critical):", err);
            })
            .finally(() => {
              setIsGeneratingBackground(false);
            });

          // Start session immediately (don't wait for image)
          setSelectedSession({
            scenario: scenarioObject,
            learnerName: learnerName,
            gradeLevel: userGradeBand,
            sceneContext: sceneContext, // Pass scene context to session
          });
          setPendingTopic(null);
        }}
        darkMode={darkMode}
      />
    );
  }

  // ---- SHOW SUMMARY SCREEN ----
  if (sessionSummary) {
    return (
      <PracticeSessionResults
        progress={sessionSummary}
        darkMode={darkMode}
        onNavigate={(target) => {
          setSessionSummary(null);

          // Navigate to progress dashboard
          if (target === "progress") {
            window.dispatchEvent(new CustomEvent("navigate", { detail: { screen: "progress" }}));
            return;
          }

          // Navigate home
          if (target === "home") {
            window.dispatchEvent(new CustomEvent("navigate", { detail: { screen: "home" }}));
            return;
          }

          // Go back to Practice topic grid
          setSelectedSession(null);
          setPendingTopic(null);
        }}
      />
    );
  }

  // ---- SHOW ORB SCREEN ----
  if (selectedSession) {
    return (
      <VoiceCoachOrbScreen
        key={selectedSession.scenario?.id || `session-${Date.now()}`}
        scenario={selectedSession.scenario}
        gradeLevel={selectedSession.gradeLevel}
        learnerName={selectedSession.learnerName}
        behaviorConfig={AI_BEHAVIOR_CONFIG}
        autoStart={true}
        backgroundImageUrl={backgroundImageUrl}
        isLoadingBackground={isGeneratingBackground}
        onEndSession={async (data) => {
          console.log("📊 Practice session complete:", data);

          // Clear the scene context when session ends
          clearSceneContext();
          console.log("🧹 Scene context cleared");

          if (data?.progress) {
            try {
              // Get userId from localStorage
              const stored = localStorage.getItem("socialCueUserData");
              const userData = stored ? JSON.parse(stored) : {};
              const userId = userData?.userId || userData?.id || "guest";

              // Use sessionCompletedAt as sessionId
              const sessionId = data.progress.sessionCompletedAt || new Date().toISOString();

              // Save complete progress object to Firestore
              await savePracticeHistory(userId, sessionId, data.progress);
              console.log("✅ Progress saved to Firestore");
            } catch (err) {
              console.error("❌ Error saving progress:", err);
            }

            // 🚀 SHOW SUMMARY SCREEN
            setSessionSummary(data.progress);
          }

          setSelectedSession(null);
          setPendingTopic(null);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020412] text-white flex justify-center px-6 py-20 overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/25 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/25 blur-[200px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl">
        <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Practice
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl">
          Explore and practice real-world social communication skills.
        </p>

        {/* Search Bar */}
        <div className="w-full mb-12">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 backdrop-blur-xl"
          />
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {filteredTopics.map(({ topic }, index) => (
            <div
              key={topic.id}
              onClick={() => setPendingTopic(topic)}
              className="relative group cursor-pointer rounded-[2rem] p-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-lg transform transition-all duration-500 hover:scale-[1.04] active:scale-[0.97] hover:bg-white/10 hover:shadow-blue-500/20"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.4),transparent_70%)]" />

              <div className="relative z-10">
                <h2 className="text-3xl font-semibold mb-3 tracking-tight bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                  {topic.title}
                </h2>
                <p className="text-base text-gray-300 leading-relaxed mb-6">
                  {topic.description}
                </p>

                {/* Minimal bottom indicator instead of example */}
                <div className="flex items-center gap-2 text-blue-300 mt-4 opacity-80 group-hover:opacity-100 transition-all">
                  <ArrowRight className="w-5 h-5" />
                  <span className="font-medium tracking-wide">Open Topic</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default PracticeScreen;

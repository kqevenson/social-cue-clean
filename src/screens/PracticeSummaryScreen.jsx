// src/screens/PracticeSummaryScreen.jsx
// Summary screen shown after ending a practice session
// Displays Tavus perception analysis feedback and conversation summary

import React, { useEffect, useState } from "react";
import { getConversationDetails } from "../services/tavusService";

/**
 * PracticeSummaryScreen
 * Shows feedback from Tavus perception analysis after practice session
 */
const PracticeSummaryScreen = ({
  conversationId,
  scenario,
  messages = [],
  onNavigate,
  onClose,
  progress = null // NEW: includes perceptionLog and perceptionInsights from session
}) => {
  const [loading, setLoading] = useState(true);
  const [perceptionData, setPerceptionData] = useState(null);
  const [error, setError] = useState(null);

  // Use real-time perception data from progress if available
  const realtimePerceptionInsights = progress?.perceptionInsights;
  const realtimePerceptionLog = progress?.perceptionLog || [];

  // Fetch conversation details with perception analysis
  useEffect(() => {
    const fetchDetails = async () => {
      // If we have real-time perception data, use that instead of API call
      if (realtimePerceptionInsights && realtimePerceptionLog.length > 0) {
        console.log("Using real-time perception data from session");
        setLoading(false);
        return;
      }

      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching conversation details for:", conversationId);
        const details = await getConversationDetails(conversationId);
        console.log("Got conversation details:", details);

        setPerceptionData(details);
      } catch (err) {
        console.error("Error fetching perception analysis:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure conversation has ended on Tavus side
    const timer = setTimeout(fetchDetails, 2000);
    return () => clearTimeout(timer);
  }, [conversationId, realtimePerceptionInsights, realtimePerceptionLog.length]);

  // Calculate session stats
  const userMessages = messages.filter(m => m.role === "user");
  const aiMessages = messages.filter(m => m.role === "ai" || m.role === "assistant");
  const sessionDuration = messages.length > 0
    ? Math.round((Date.now() - new Date(messages[0]?.timestamp || Date.now()).getTime()) / 60000)
    : 0;

  // Extract feedback from perception analysis (prioritize real-time data)
  const getFeedback = () => {
    // First, check for real-time perception insights from the session
    if (realtimePerceptionInsights) {
      const insights = realtimePerceptionInsights;
      return {
        appearance: null,
        behavior: insights.observations?.[0]?.observation || null,
        emotionalStates: insights.uniqueEmotions || [],
        emotionCounts: insights.emotionCounts || {},
        dominantEmotion: insights.dominantEmotion,
        totalObservations: insights.totalObservations || 0,
        observations: insights.observations || [],
        summary: insights.summary?.join(" ") || "Great job completing this practice session!",
        isRealtime: true
      };
    }

    // Fall back to API perception data
    if (!perceptionData?.perceptionAnalysis) {
      return {
        appearance: null,
        behavior: null,
        emotionalStates: [],
        emotionCounts: {},
        dominantEmotion: null,
        totalObservations: 0,
        observations: [],
        summary: "Great job completing this practice session!",
        isRealtime: false
      };
    }

    const pa = perceptionData.perceptionAnalysis;
    return {
      appearance: pa.appearance || pa.visual_description,
      behavior: pa.behavior || pa.behavioral_observations,
      emotionalStates: pa.emotionalStates || pa.emotional_states || [],
      emotionCounts: {},
      dominantEmotion: null,
      totalObservations: 0,
      observations: [],
      summary: pa.summary || pa.overall_assessment || "Great job completing this practice session!",
      isRealtime: false
    };
  };

  const feedback = getFeedback();

  // Generate encouragement based on emotional states
  const getEncouragement = () => {
    const states = feedback.emotionalStates || [];
    const dominant = feedback.dominantEmotion?.toLowerCase();

    // Check dominant emotion first for real-time data
    if (dominant === "happy" || dominant === "joy" || dominant === "excited") {
      return "Your positive energy really shined through! Keep bringing that enthusiasm!";
    }
    if (dominant === "confident" || dominant === "calm") {
      return "You came across as confident and composed - that's exactly the energy to bring to real conversations!";
    }
    if (dominant === "nervous" || dominant === "anxious" || dominant === "worried") {
      return "It's totally normal to feel nervous - you're building real skills! Each practice makes the next one easier.";
    }
    if (dominant === "confused" || dominant === "uncertain") {
      return "Working through tricky situations is how we learn. You did great sticking with it!";
    }

    // Check for specific states
    if (states.includes("happy") || states.includes("engaged") || states.includes("curious")) {
      return "You showed great enthusiasm during this practice!";
    }
    if (states.includes("nervous") || states.includes("anxious")) {
      return "It's normal to feel nervous - each practice makes you stronger!";
    }
    if (states.includes("confident")) {
      return "Your confidence really showed through!";
    }
    return "You're making progress with every practice session!";
  };

  const handleTryAgain = () => {
    onNavigate?.("practice", { scenario });
  };

  const handleGoHome = () => {
    onNavigate?.("home");
  };

  const handleChooseNew = () => {
    onNavigate?.("lessons");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
          <p className="text-purple-200">{scenario?.title || "Great work on your practice session"}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-purple-200">Analyzing your session...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300">Unable to load detailed feedback: {error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">{userMessages.length}</p>
                <p className="text-sm text-gray-400">Your Turns</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{aiMessages.length}</p>
                <p className="text-sm text-gray-400">Coach Turns</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{sessionDuration || "~1"}</p>
                <p className="text-sm text-gray-400">Minutes</p>
              </div>
            </div>

            {/* Perception Analysis Feedback */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                What Coach Noticed
                {feedback.isRealtime && (
                  <span className="ml-2 text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                    Live Analysis
                  </span>
                )}
              </h2>

              {/* Summary */}
              <div className="mb-4">
                <p className="text-lg text-white/90">{feedback.summary}</p>
              </div>

              {/* Emotion Breakdown with Counts (for real-time data) */}
              {feedback.isRealtime && Object.keys(feedback.emotionCounts || {}).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-purple-300 mb-3">Your Expressions During Practice:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(feedback.emotionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion, count]) => {
                        const total = Object.values(feedback.emotionCounts).reduce((a, b) => a + b, 0);
                        const pct = Math.round((count / total) * 100);
                        const isDominant = emotion === feedback.dominantEmotion;
                        return (
                          <div
                            key={emotion}
                            className={`p-3 rounded-xl text-center ${
                              isDominant
                                ? "bg-purple-500/40 border border-purple-400/50"
                                : "bg-white/5 border border-white/10"
                            }`}
                          >
                            <p className={`text-2xl font-bold ${isDominant ? "text-purple-300" : "text-white/70"}`}>
                              {pct}%
                            </p>
                            <p className={`text-sm capitalize ${isDominant ? "text-purple-200" : "text-gray-400"}`}>
                              {emotion}
                            </p>
                            {isDominant && (
                              <span className="text-xs text-purple-400">Most common</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Emotional States (fallback for non-realtime) */}
              {!feedback.isRealtime && feedback.emotionalStates.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-purple-300 mb-2">Emotions Observed:</p>
                  <div className="flex flex-wrap gap-2">
                    {feedback.emotionalStates.map((emotion, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-purple-200 capitalize"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Observations (from real-time perception) */}
              {feedback.isRealtime && feedback.observations?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-purple-300 mb-2">Key Moments Coach Noticed:</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {feedback.observations.slice(0, 5).map((obs, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                      >
                        <span className="text-purple-400 mt-0.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-white/80">{obs.observation}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            Detected: {obs.emotion}
                            {obs.confidence && ` (${Math.round(obs.confidence * 100)}% confidence)`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Behavior Observation (fallback) */}
              {!feedback.isRealtime && feedback.behavior && (
                <div className="mb-4">
                  <p className="text-sm text-purple-300 mb-1">What I noticed:</p>
                  <p className="text-white/80">{feedback.behavior}</p>
                </div>
              )}

              {/* Encouragement */}
              <div className="mt-4 pt-4 border-t border-purple-500/30">
                <p className="text-purple-200 italic">{getEncouragement()}</p>
              </div>
            </div>

            {/* Transcript Preview */}
            {(perceptionData?.transcript?.length > 0 || messages.length > 0) && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Conversation Highlights
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {(perceptionData?.transcript || messages).slice(0, 6).map((msg, i) => (
                    <div
                      key={i}
                      className={`text-sm ${
                        msg.role === "user"
                          ? "text-blue-300 pl-4 border-l-2 border-blue-500/50"
                          : "text-purple-300 pl-4 border-l-2 border-purple-500/50"
                      }`}
                    >
                      <span className="text-xs text-gray-500 block mb-1">
                        {msg.role === "user" ? "You" : "Coach"}
                      </span>
                      {msg.text?.slice(0, 100)}{msg.text?.length > 100 ? "..." : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Practice Again
              </button>

              <button
                onClick={handleChooseNew}
                className="w-full py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Choose New Lesson
              </button>

              <button
                onClick={handleGoHome}
                className="w-full py-3 text-gray-400 font-medium hover:text-white transition-colors"
              >
                Return Home
              </button>
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h3 className="text-sm font-medium text-yellow-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Tip for Next Time
              </h3>
              <p className="text-yellow-200/80 text-sm">
                {scenario?.tip || "Try to maintain eye contact and speak clearly. Remember, practice makes perfect!"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeSummaryScreen;

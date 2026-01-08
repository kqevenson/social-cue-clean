import React, { useEffect, useState } from "react";
import { apiPath } from "../../utils/apiBase";

export default function LessonVideoScene({
  gradeLevel,
  topicId,
  videoUrl: propVideoUrl,
  onContinue,
  darkMode,
  onVideoAnalyzed
}) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(propVideoUrl || null);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // If videoUrl is provided via props, use it
    if (propVideoUrl) {
      setVideoUrl(propVideoUrl);
      return;
    }

    // If no video URL provided, skip video generation for now
    // Video generation requires Runway API which may not be configured
    console.log("📹 No video URL provided, skipping video generation");
    setError("Video not available");
  }, [propVideoUrl]);

  // Skip video and continue with lesson
  const handleContinue = () => {
    if (onVideoAnalyzed) {
      onVideoAnalyzed(null);
    }
    onContinue();
  };

  // If no video, show a friendly skip option
  if (error || !videoUrl) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold mb-2">Ready to Learn!</h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Let's jump into the lesson content.
        </p>
        <button
          onClick={handleContinue}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold hover:shadow-lg transition-all"
        >
          Start Learning
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full p-6 ${darkMode ? "text-white" : "text-black"}`}>
      <h2 className="text-xl font-semibold mb-4">Watch this scene carefully</h2>
      <p className="opacity-70 mb-6 text-center max-w-md">
        Notice how the characters look, move, and react.
      </p>

      <video
        src={videoUrl}
        controls
        className="w-full max-w-2xl rounded-xl shadow-lg mb-6"
      />

      <button
        onClick={handleContinue}
        disabled={analyzing}
        className={`px-6 py-3 rounded-lg text-white font-medium ${
          analyzing ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {analyzing ? "Loading..." : "Continue"}
      </button>
    </div>
  );
}

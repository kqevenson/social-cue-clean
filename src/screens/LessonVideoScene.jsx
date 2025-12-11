import React, { useEffect, useState } from "react";

export default function LessonVideoScene({
  url,
  videoUrl, // alternate prop name
  goBack,
  onContinue, // alternate prop name
  onVideoAnalyzed,
  darkMode = true,
  gradeLevel,
  topicId
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const videoSrc = url || videoUrl;
  const handleBack = goBack || onContinue;

  // Analyze video emotions with Hume when video loads
  useEffect(() => {
    if (!videoSrc || analyzed) return;

    const analyzeVideo = async () => {
      setAnalyzing(true);
      try {
        const response = await fetch("/api/hume/analyze-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: videoSrc })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && onVideoAnalyzed) {
            console.log("🎭 Video emotion analysis complete:", data.analysis);
            onVideoAnalyzed(data.analysis);
          }
        }
      } catch (err) {
        console.warn("Video emotion analysis failed (non-blocking):", err.message);
      } finally {
        setAnalyzing(false);
        setAnalyzed(true);
      }
    };

    analyzeVideo();
  }, [videoSrc, analyzed, onVideoAnalyzed]);

  if (!videoSrc) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
        <button
          onClick={handleBack}
          className={`mb-6 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          ← Back
        </button>
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Video Not Available</h1>
          <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Video generation is being set up. You can continue with the lesson.
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold rounded-xl hover:opacity-90"
          >
            Continue to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className={`mb-6 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6">Watch & Learn</h1>

        <div className={`rounded-2xl overflow-hidden mb-6 ${darkMode ? 'bg-white/5' : 'bg-white shadow-lg'}`}>
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full"
            onEnded={() => setAnalyzed(true)}
          />
        </div>

        {analyzing && (
          <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              🎭 Analyzing emotions in video...
            </p>
          </div>
        )}

        <button
          onClick={handleBack}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold rounded-xl hover:opacity-90 transition"
        >
          Continue to Practice →
        </button>
      </div>
    </div>
  );
}

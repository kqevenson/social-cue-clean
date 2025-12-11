import React, { useState } from "react";
import { generateVideo } from "../services/lessonApi.js";
import LessonVideoScene from "./LessonVideoScene.jsx";

export default function LessonWrapUpScreen({ lesson, goBack }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Prevent module crash when lesson.wrapup is missing
  if (!lesson?.wrapup) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Wrap-Up</h1>
        <p style={{ marginTop: 20 }}>
          No wrap-up data available for this lesson.
        </p>
        <button onClick={goBack} style={{ marginTop: 20 }}>
          Done
        </button>
      </div>
    );
  }

  async function handleVideo() {
    setLoading(true);
    try {
      const url = await generateVideo(lesson.videoScenes, "6");
      if (url) {
        setVideoUrl(url);
      } else {
        console.warn("⚠️ Video generation returned null - video not available");
        // Optionally show a message to the user
        alert("Video generation is not available at this time. Please continue without video.");
      }
    } catch (error) {
      console.error("❌ Video generation error:", error);
      alert("Unable to generate video. Please continue without video.");
    } finally {
      setLoading(false);
    }
  }

  if (videoUrl) {
    return <LessonVideoScene url={videoUrl} goBack={goBack} />;
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Wrap-Up</h1>
      {/* ✅ Safe access to wrap-up prompt */}
      <p style={{ marginTop: 20 }}>
        {lesson?.wrapup?.prompt ?? "No wrap-up prompt available."}
      </p>

      <button
        onClick={handleVideo}
        disabled={loading}
        style={{
          marginTop: 30,
          padding: "12px 18px",
          background: "#4A90E2",
          borderRadius: 8
        }}
      >
        {loading ? "Creating Video..." : "Generate Video"}
      </button>

      <button
        style={{ display: "block", marginTop: 20 }}
        onClick={goBack}
      >
        Done
      </button>
    </div>
  );
}

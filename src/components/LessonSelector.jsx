import React, { useState } from "react";
import LessonWarmupScreen from "../screens/LessonWarmupScreen.jsx";
import { startLesson } from "../services/lessonApi.js";

export default function LessonSelector() {
  const [currentLesson, setCurrentLesson] = useState(null);

  const topics = [
    { title: "Small Talk", gradeLevel: "6" },
    { title: "Confidence", gradeLevel: "6" },
    { title: "Joining Conversations", gradeLevel: "6" }
  ];

  async function handleStartLesson(topicObj) {
    try {
      const lesson = await startLesson(topicObj.title, topicObj.gradeLevel);
      setCurrentLesson(lesson);
    } catch (err) {
      console.error("❌ Lesson failed:", err);
    }
  }

  if (currentLesson) {
    return <LessonWarmupScreen lesson={currentLesson} goBack={() => setCurrentLesson(null)} />;
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Choose a Lesson</h1>

      {topics.map((t) => (
        <button
          key={t.title}
          onClick={() => handleStartLesson(t)}
          style={{
            marginTop: 10,
            padding: 14,
            width: "100%",
            background: "#1e1e1e",
            borderRadius: 8,
            color: "white",
            border: "1px solid #333"
          }}
        >
          {t.title}
        </button>
      ))}
    </div>
  );
}

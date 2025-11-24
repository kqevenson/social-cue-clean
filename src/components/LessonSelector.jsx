import React, { useState } from "react";
import { lessonApiService } from "../services/lessonApi.js";
import LessonViewScreen from "../screens/LessonViewScreen.jsx";

export default function LessonSelector() {
  const [currentLesson, setCurrentLesson] = useState(null);

  const topics = [
    { title: "Small Talk", gradeLevel: "6" },
    { title: "Confidence", gradeLevel: "6" },
    { title: "Joining Conversations", gradeLevel: "6" },
  ];

  async function handleStartLesson(topicObj) {
    try {
      const res = await lessonApiService.startLesson({
        title: topicObj.title,
        gradeLevel: topicObj.gradeLevel
      });
      setCurrentLesson(res.lesson);
    } catch (err) {
      console.error("❌ Lesson failed:", err);
    }
  }

  if (currentLesson) {
    return (
      <LessonViewScreen
        lesson={currentLesson}
        onBack={() => setCurrentLesson(null)}
      />
    );
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Choose a Lesson
      </h1>

      {topics.map((t) => (
        <button
          key={t.title}
          onClick={() => handleStartLesson(t)}
          style={{
            display: "block",
            padding: "15px 20px",
            marginTop: 10,
            background: "#1f1f1f",
            borderRadius: 8,
            color: "white",
            border: "1px solid #333",
            width: "100%",
            textAlign: "left",
          }}
        >
          {t.title} (Grade {t.gradeLevel})
        </button>
      ))}
    </div>
  );
}

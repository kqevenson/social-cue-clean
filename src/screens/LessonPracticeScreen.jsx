import React, { useState } from "react";
import LessonWrapUpScreen from "./LessonWrapUpScreen.jsx";

export default function LessonPracticeScreen({ lesson, goBack }) {
  const [index, setIndex] = useState(0);

  // Handle missing practice data gracefully
  const turns = lesson?.practice?.turns || lesson?.practice?.steps || [];
  
  if (turns.length === 0) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <button onClick={goBack}>← Back</button>
        <h1>No practice questions available</h1>
        <button onClick={goBack} style={{ marginTop: 20 }}>Return to Lessons</button>
      </div>
    );
  }

  const isLast = index >= turns.length;

  if (isLast) {
    return <LessonWrapUpScreen lesson={lesson} goBack={goBack} />;
  }

  const step = turns[index];

  return (
    <div style={{ padding: 20, color: "white" }}>
      <button onClick={goBack}>← Back</button>

      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>
        Practice Question {index + 1} / {turns.length}
      </h1>

      <h2 style={{ marginTop: 20, opacity: 0.8 }}>{step.situation}</h2>
      <p style={{ marginTop: 10 }}>{step.question}</p>

      <div style={{ marginTop: 20 }}>
        {step.options?.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setIndex(index + 1)}
            style={{
              display: "block",
              width: "100%",
              marginTop: 10,
              padding: 12,
              background: "#1f1f1f",
              border: "1px solid #333",
              color: "white",
              borderRadius: 6,
              textAlign: "left"
            }}
          >
            {opt.id}. {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import LessonPracticeScreen from "./LessonPracticeScreen.jsx";

function LessonWarmupScreen(props) {
  const { lesson, goBack } = props;
  const [start, setStart] = React.useState(false);

  if (start) {
    return (
      <LessonPracticeScreen
        lesson={lesson}
        goBack={goBack}
      />
    );
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <button onClick={goBack}>← Back</button>

      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Warm-Up</h1>
      <p style={{ marginTop: 20 }}>{lesson.warmup.prompt}</p>

      <button
        onClick={() => setStart(true)}
        style={{
          marginTop: 30,
          padding: "12px 18px",
          background: "#4A90E2",
          borderRadius: 8
        }}
      >
        Start Practice →
      </button>
    </div>
  );
}

export default LessonWarmupScreen;

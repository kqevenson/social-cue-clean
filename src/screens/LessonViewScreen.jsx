import React from "react";

export default function LessonViewScreen({ lesson, onBack }) {
  if (!lesson) {
    return <div>No lesson loaded.</div>;
  }

  const { introduction, explanation, practice } = lesson;
  // NEW: normalize practice data from backend (steps instead of scenarios)
  const steps = practice?.steps || [];

  return (
    <div style={{ padding: 20, color: "white" }}>
      <button onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        {lesson.title}
      </h1>

      {/* INTRO */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
          {introduction?.title}
        </h2>
        <p style={{ opacity: 0.9 }}>{introduction?.objective}</p>
      </section>

      {/* EXPLANATION */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Explanation</h2>
        <p style={{ opacity: 0.9 }}>{explanation?.text}</p>
      </section>

      {/* PRACTICE */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Practice</h2>

        {steps.length === 0 && (
          <p>No practice steps generated.</p>
        )}

        {steps.map((s, index) => (
          <div
            key={s.id}
            style={{
              marginTop: 20,
              padding: 15,
              border: "1px solid #333",
              borderRadius: 8,
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
              Step {index + 1}: {s.situation}
            </h3>

            <p style={{ marginTop: 10 }}>{s.question}</p>

            <div style={{ marginTop: 10 }}>
              {s.options.map((opt) => (
                <button
                  key={opt.id}
                  style={{
                    marginTop: 8,
                    display: "block",
                    padding: "10px 12px",
                    width: "100%",
                    background: "#1f1f1f",
                    border: "1px solid #444",
                    borderRadius: 6,
                    color: "white",
                    textAlign: "left",
                  }}
                >
                  {opt.id}. {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* AI VIDEO SCENES */}
      {lesson.video?.scenes?.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
            Storyboard Scenes
          </h2>

          {lesson.video.scenes.map((scene) => (
            <div
              key={scene.id}
              style={{
                marginTop: 20,
                padding: 15,
                border: "1px solid #444",
                borderRadius: 8,
                background: "#111",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                Scene: {scene.shotType}
              </h3>
              <p style={{ marginTop: 8 }}>{scene.description}</p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>
                Voiceover: {scene.voiceover}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

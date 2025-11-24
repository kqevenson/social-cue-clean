import React from "react";

export default function LessonViewScreen({ lesson, onBack }) {
  if (!lesson) {
    return <div>No lesson loaded.</div>;
  }

  const { introduction, explanation, practice } = lesson;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <button onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>{lesson.title}</h1>

      {/* INTRO */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
          {introduction.title}
        </h2>
        <p style={{ opacity: 0.9 }}>{introduction.objective}</p>
      </section>

      {/* EXPLANATION */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Explanation</h2>
        <p style={{ opacity: 0.9 }}>{explanation.text}</p>
      </section>

      {/* PRACTICE */}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Practice</h2>

        {practice.scenarios.length === 0 && (
          <p>No practice scenarios generated.</p>
        )}

        {practice.scenarios.map((s) => (
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
              {s.situation}
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
    </div>
  );
}

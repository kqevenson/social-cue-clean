// backend/routes/lesson.js — FULL NUCLEAR REBUILD

import express from "express";
import OpenAI from "openai";
import { runwayGenerate } from "../services/runwayService.js";
import { analyzeEmotion } from "../services/humeService.js";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ LESSON.JS ROUTE FILE LOADED");

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * POST /api/lessons/start
 * Generates a complete lesson package:
 * - Intro
 * - Explanation
 * - Multi-step MCQ practice
 * - OpenAI video storyboard scenes
 */
router.post("/start", async (req, res) => {
  console.log("========== LESSON.JS /START HIT ==========");
  console.log("📥 Raw body:", req.body);
  
  try {
    const { title, gradeLevel } = req.body;
    
    console.log("📥 Parsed - Title:", title, "| Grade:", gradeLevel);
    
    // Validate title exists
    if (!title) {
      console.log("❌ Missing title - returning 400");
      return res.status(400).json({ success: false, error: "Title is required" });
    }
    
    const topic = title; // Use title as topic for OpenAI prompt

    const gradeHints = {
      "K-2": "Use extremely simple words and friendly examples.",
      "3-5": "Use elementary-level clarity with examples.",
      "6-8": "Use middle-school level clarity, relatable situations.",
      "9-12": "Use teen-appropriate nuance, realistic social dynamics."
    };
    const gradeHint = gradeHints[gradeLevel] || "Use age-appropriate clarity.";

    console.log("🚀 Calling OpenAI...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON that matches the schema. No extra prose."
        },
        {
          role: "user",
          content: `
Generate a social-skills lesson about "${topic}" for grade ${gradeLevel}.
Use this guidance: ${gradeHint}

Return JSON in EXACT shape:

{
  "lesson": {
    "id": "string",
    "title": "string",
    "introduction": {
      "title": "string",
      "objective": "string"
    },
    "explanation": {
      "text": "string"
    },
    "practice": {
      "steps": [
        {
          "id": "string",
          "situation": "string",
          "question": "string",
          "options": [
            { "id": "A", "text": "string", "isCorrect": false },
            { "id": "B", "text": "string", "isCorrect": false },
            { "id": "C", "text": "string", "isCorrect": false }
          ],
          "correctAnswer": "A",
          "feedbackCorrect": "string",
          "feedbackIncorrect": "string"
        }
      ]
    },
    "video": {
      "scenes": [
        {
          "id": "string",
          "description": "string",
          "shotType": "string",
          "voiceover": "string"
        }
      ]
    }
  }
}
`
        }
      ]
    });

    console.log("✅ OpenAI response received");

    let generated;
    try {
      generated = JSON.parse(completion.choices[0].message.content);
      console.log("✅ JSON parsed successfully");
    } catch (parseErr) {
      console.error("❌ JSON parse failure:", parseErr);
      return res.status(200).json({
        success: true,
        lesson: {
          id: "fallback",
          title: topic,
          introduction: {
            title: `Learning About ${topic}`,
            objective: "Understand this skill and how to apply it."
          },
          explanation: { text: "Let's work through this lesson together." },
          practice: { steps: [] },
          video: { scenes: [] }
        }
      });
    }

    console.log("✅ Returning lesson to frontend");
    return res.json({
      success: true,
      lesson: generated.lesson
    });

  } catch (err) {
    console.error("❌ Lesson start error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Lesson generation failed."
    });
  }
});


/**
 * POST /api/lessons/submit
 * Checks the learner's answer, returns feedback.
 */
router.post("/submit", async (req, res) => {
  try {
    const { step, answer } = req.body;

    if (!step || !answer) {
      return res.status(400).json({
        success: false,
        error: "Missing step or answer."
      });
    }

    const correct = answer === step.correctAnswer;

    return res.json({
      success: true,
      correct,
      feedback: correct ? step.feedbackCorrect : step.feedbackIncorrect
    });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Submission failed."
    });
  }
});


/**
 * POST /api/lessons/video
 * Takes OpenAI scenes → sends them to Runway → returns MP4 URL.
 */
router.post("/video", async (req, res) => {
  try {
    const { scenes, topic, gradeLevel } = req.body;

    if (!scenes || scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing scene descriptions."
      });
    }

    // Build consolidated Runway prompt
    const promptText = scenes.map(
      (s, i) =>
        `Scene ${i + 1}: ${s.description} — Shot: ${s.shotType}. Voiceover: "${s.voiceover}"`
    ).join(" ");

    console.log("🎬 Runway prompt:", promptText);

    const videoUrl = await runwayGenerate(promptText, gradeLevel);

    return res.json({
      success: true,
      videoUrl
    });

  } catch (err) {
    console.error("Video generation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Video generation failed."
    });
  }
});


export default router;

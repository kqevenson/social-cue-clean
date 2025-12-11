// backend/routes/lesson.js — FULL REBUILD (Scenario Builder Engine)

import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env BEFORE creating OpenAI client
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { generateLesson } from "../services/lessonGenerator.js";
import { generateVideo } from "../services/heygenService.js";
import { analyzeEmotion } from "../services/humeService.js";

const router = express.Router();

console.log("🔑 lesson.js - OPENAI_KEY loaded:", process.env.OPENAI_KEY ? "Yes" : "No");

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

/**
 * POST /api/lessons/start
 * Generates:
 *  - warmup
 *  - 3-turn practice
 *  - wrap-up reflection prompt
 *  - (optionally) video scenes
 */
router.post("/start", async (req, res) => {
  try {
    const { topic, gradeLevel } = req.body;

    const lesson = await generateLesson(topic, gradeLevel);

    // Generate video from videoScenes using HeyGen (AI avatar)
    let videoUrl = null;
    if (lesson.videoScenes && lesson.videoScenes.length > 0) {
      try {
        console.log("🎬 Generating HeyGen avatar video from scenes...");
        // Create script from voiceovers for AI avatar to speak
        const script = lesson.videoScenes
          .map((s) => s.voiceover || s.narration || s.description || "")
          .filter(text => text.trim().length > 0)
          .join(" ");

        if (script) {
          videoUrl = await generateVideo(script, gradeLevel, {
            title: lesson.title || topic || "Social Skills Lesson"
          });
          console.log("✅ Video generated:", videoUrl ? "Success" : "No URL returned");
        }
      } catch (videoErr) {
        console.warn("⚠️ Video generation failed (non-critical):", videoErr.message);
        // Continue without video - don't fail the whole lesson
      }
    }

    return res.json({
      success: true,
      lesson,
      videoUrl,
    });
  } catch (err) {
    console.error("Lesson error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * POST /api/lessons/video
 * Generates an AI avatar video using HeyGen
 */
router.post("/video", async (req, res) => {
  try {
    const { scenes, script, gradeLevel, title } = req.body;

    let videoScript = script;

    // If scenes provided, extract voiceovers into script
    if (!videoScript && scenes && scenes.length > 0) {
      videoScript = scenes
        .map((s) => s.voiceover || s.narration || s.description || "")
        .filter(text => text.trim().length > 0)
        .join(" ");
    }

    if (!videoScript) {
      return res.status(400).json({
        success: false,
        error: "No script or scenes provided"
      });
    }

    const videoUrl = await generateVideo(videoScript, gradeLevel, { title });

    return res.json({
      success: true,
      videoUrl,
    });
  } catch (err) {
    console.error("Video error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * POST /api/lessons/emotion
 * Analyzes a 10–30 sec webcam clip
 */
router.post("/emotion", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const analysis = await analyzeEmotion(videoUrl);

    return res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error("Emotion error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;

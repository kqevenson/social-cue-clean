// backend/routes/video.js — NUCLEAR REBUILD

import express from "express";
import { runwayGenerate } from "../services/runwayService.js";
import { openaiClient } from "../services/openaiService.js";

console.log("✅ VIDEO ROUTES LOADED");

const router = express.Router();

/**
 * ORIGINAL ROUTE (KEEPING FOR COMPATIBILITY)
 * POST /api/video/generate-scene
 * OLD behavior: generate a video based on topicId + gradeLevel
 */
router.post("/generate-scene", async (req, res) => {
  try {
    const { topicId, gradeLevel } = req.body;

    const videoUrl = await runwayGenerate(topicId, gradeLevel);

    res.json({
      success: true,
      videoUrl
    });
  } catch (err) {
    console.error("Video error (generate-scene):", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * NEW ROUTE: Generate video from OpenAI scenes
 * POST /api/video/generate-from-scenes
 * Accepts:
 *  - scenes: [{ description, shotType, voiceover }]
 *  - gradeLevel
 *
 * Returns:
 *  - final RunwayML MP4 URL
 */
router.post("/generate-from-scenes", async (req, res) => {
  try {
    const { scenes, gradeLevel } = req.body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Scenes are required to generate video."
      });
    }

    // Convert scenes → Runway prompt text
    const storyboardPrompt = scenes
      .map(
        (scene, i) =>
          `Scene ${i + 1}: ${scene.description}. Shot: ${scene.shotType}. Voiceover: "${scene.voiceover}"`
      )
      .join(" ");

    const videoUrl = await runwayGenerate(storyboardPrompt, gradeLevel);

    res.json({
      success: true,
      videoUrl
    });
  } catch (err) {
    console.error("Video error (generate-from-scenes):", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;

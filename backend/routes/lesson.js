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
    const { topic, gradeLevel, learnerName } = req.body;

    const lesson = await generateLesson(topic, gradeLevel, learnerName);

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
 * POST /api/lessons/preview
 * Generates a quick practice scenario preview (title, context, tips)
 */
router.post("/preview", async (req, res) => {
  try {
    const { topicName, gradeLevel } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Cue, a K-12 social skills coach. Generate a practice scenario based on topicName and gradeLevel.

Use friendly, age-appropriate language. Keep the preview short.

Produce:
- scenarioTitle (string): A catchy, friendly title for this practice scenario
- shortPreview (1-2 sentences): A brief, engaging description that gets the learner excited
- fullContext (3-4 sentences): A detailed scenario description that sets the scene
- whatYouWillLearn: three short bullet points describing the key skills they'll practice
- tips: 2-3 grade-appropriate coaching tips to help them succeed
- estimatedTime: a short string like '5-8 minutes' or '10-12 minutes'

Return your response as a JSON object with these exact keys: scenarioTitle, shortPreview, fullContext, whatYouWillLearn (array), tips (array), estimatedTime.`
        },
        {
          role: "user",
          content: `Generate a practice scenario for:\nTopic: "${topicName}"\nGrade Level: "${gradeLevel}"\n\nMake it engaging, age-appropriate, and focused on real-world social skills practice.`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content?.trim();
    const parsed = JSON.parse(content);

    return res.json({
      success: true,
      scenario: {
        scenarioTitle: parsed.scenarioTitle || `${topicName} Practice`,
        shortPreview: parsed.shortPreview || `Let's practice ${topicName} together!`,
        fullContext: parsed.fullContext || `You'll practice ${topicName} in a safe, supportive environment.`,
        whatYouWillLearn: Array.isArray(parsed.whatYouWillLearn) ? parsed.whatYouWillLearn : [],
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
        estimatedTime: parsed.estimatedTime || "5-8 minutes"
      }
    });
  } catch (err) {
    console.error("Preview generation error:", err);
    return res.status(500).json({ success: false, error: err.message });
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

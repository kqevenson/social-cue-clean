// backend/services/runwayService.js — Runway API v1 (image_to_video)

import axios from "axios";
import { ENV } from "../config/env.js";

const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";
const POLL_INTERVAL_MS = 5000; // 5 seconds between polls
const MAX_POLL_ATTEMPTS = 60; // Max 5 minutes wait

/**
 * runwayGenerate(promptText, gradeLevel, imageUrl)
 *
 * NOTE: Runway API only supports image_to_video (not text_to_video)
 * If no imageUrl provided, we'll use OpenAI DALL-E to generate a starting image
 *
 * Returns: Final MP4 URL or null on failure
 */
export async function runwayGenerate(promptText, gradeLevel = "6", imageUrl = null) {
  try {
    // Check if Runway key exists
    if (!ENV.RUNWAY_KEY || ENV.RUNWAY_KEY === 'placeholder') {
      console.log("⚠️ No Runway API key - skipping video generation");
      return null;
    }

    // Grade-level styling
    const gradeStyles = {
      "K-2": "friendly, bright colors, soft edges, welcoming classroom",
      "3-5": "colorful classroom, simple interactions",
      "6-8": "middle school hallway or classroom, natural lighting",
      "9-12": "realistic high school scene, natural tone"
    };

    const style = gradeStyles[gradeLevel] || "natural school setting";
    const finalPrompt = `${promptText}. Visual style: ${style}. Natural cinematography, supportive and positive emotion.`.trim();

    console.log("🟣 Runway prompt:", finalPrompt.substring(0, 100) + "...");

    const headers = {
      Authorization: `Bearer ${ENV.RUNWAY_KEY}`,
      "Content-Type": "application/json",
      "X-Runway-Version": RUNWAY_API_VERSION
    };

    // If no image provided, generate one with DALL-E first
    let startingImage = imageUrl;
    if (!startingImage) {
      console.log("🎨 No starting image - generating with DALL-E...");
      startingImage = await generateStartingImage(promptText, style);
      if (!startingImage) {
        console.warn("⚠️ Could not generate starting image - skipping video");
        return null;
      }
    }

    // Use image_to_video endpoint with gen4_turbo model
    console.log("🟣 Starting Runway image_to_video generation...");
    const response = await axios.post(
      `${RUNWAY_API_BASE}/image_to_video`,
      {
        model: "gen4_turbo",
        promptImage: startingImage,
        promptText: finalPrompt,
        ratio: "1280:720",
        duration: 5
      },
      { headers }
    );

    const taskId = response.data?.id;
    if (!taskId) {
      console.warn("⚠️ Runway returned no task ID");
      return null;
    }

    console.log("🟣 Runway task created:", taskId);

    // Poll for completion
    const videoUrl = await pollRunwayTask(taskId, headers);
    return videoUrl;

  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error("❌ RunwayML Generation Error:", errorDetails);
    return null;
  }
}

/**
 * Generate a starting image using OpenAI DALL-E
 */
async function generateStartingImage(promptText, style) {
  try {
    if (!ENV.OPENAI_KEY) {
      console.warn("⚠️ No OpenAI key for DALL-E image generation");
      return null;
    }

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: ENV.OPENAI_KEY });

    // Create a scene description for the image
    const imagePrompt = `A photorealistic scene: ${promptText.substring(0, 200)}. Style: ${style}. High quality, natural lighting, suitable for video animation.`;

    console.log("🎨 DALL-E prompt:", imagePrompt.substring(0, 80) + "...");

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024", // Closest to 16:9
      quality: "standard"
    });

    const imageUrl = response.data?.[0]?.url;
    if (imageUrl) {
      console.log("✅ DALL-E image generated");
    }
    return imageUrl || null;

  } catch (err) {
    console.error("❌ DALL-E image generation failed:", err.message);
    return null;
  }
}

/**
 * Poll Runway task until completion
 */
async function pollRunwayTask(taskId, headers) {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    // Wait before polling
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const statusResponse = await axios.get(
        `${RUNWAY_API_BASE}/tasks/${taskId}`,
        { headers }
      );

      const status = statusResponse.data?.status;
      console.log(`🟣 Runway task ${taskId} status: ${status}`);

      if (status === "SUCCEEDED") {
        const videoUrl = statusResponse.data?.output?.[0] || null;
        console.log("✅ Runway video generated:", videoUrl);
        return videoUrl;
      }

      if (status === "FAILED") {
        console.error("❌ Runway task failed:", statusResponse.data?.error || statusResponse.data);
        return null;
      }

      // Continue polling if PENDING or RUNNING
    } catch (err) {
      console.error("❌ Error polling Runway task:", err.response?.data || err.message);
      return null;
    }
  }

  console.warn("⚠️ Runway task timed out after 5 minutes");
  return null;
}

// backend/services/heygenService.js
// HeyGen API for AI avatar educational videos
// Docs: https://docs.heygen.com

import axios from "axios";
import { ENV } from "../config/env.js";

const HEYGEN_API_BASE = "https://api.heygen.com";

/**
 * Generate an educational video with AI avatar using HeyGen
 * @param {string} script - The text for the avatar to speak
 * @param {string} gradeLevel - Grade level for avatar selection
 * @param {object} options - Additional options (title, avatar)
 * @returns {Promise<string|null>} Video URL or null on failure
 */
export async function generateVideo(script, gradeLevel = "6", options = {}) {
  if (!ENV.HEYGEN_KEY) {
    console.log("⚠️ No HeyGen API key - skipping video generation");
    return null;
  }

  if (!script || script.trim().length === 0) {
    console.log("⚠️ No script provided - skipping video generation");
    return null;
  }

  try {
    console.log("🎬 Starting HeyGen video generation...");
    console.log("   Script preview:", script.substring(0, 80) + "...");

    // Create video with HeyGen API v2
    const response = await axios.post(
      `${HEYGEN_API_BASE}/v2/video/generate`,
      {
        video_inputs: [{
          character: {
            type: "avatar",
            avatar_id: "Anna_public_3_20240108",  // Anna - friendly public avatar
            avatar_style: "normal"
          },
          voice: {
            type: "text",
            input_text: script,
            voice_id: "e0cc82c22f414c95b1f25696c732f058"  // Cassidy - friendly English voice
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: "16:9",
        test: true  // Set to false for production (test=true generates faster but watermarked)
      },
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const videoId = response.data.data?.video_id;
    if (!videoId) {
      console.error("❌ HeyGen: No video ID returned", response.data);
      return null;
    }

    console.log("⏳ HeyGen video ID:", videoId, "- polling for completion...");

    // Poll for completion (videos take 1-5 minutes)
    const videoUrl = await pollForCompletion(videoId);
    return videoUrl;

  } catch (err) {
    console.error("❌ HeyGen error:", err.response?.data || err.message);
    return null;
  }
}

/**
 * Poll HeyGen API until video is ready
 * @param {string} videoId - The video ID to poll
 * @returns {Promise<string|null>} Video URL or null on failure
 */
async function pollForCompletion(videoId) {
  const maxAttempts = 60;  // 5 minutes max (60 * 5 seconds)
  const pollInterval = 5000;  // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, pollInterval));

    try {
      const status = await axios.get(
        `${HEYGEN_API_BASE}/v1/video_status.get?video_id=${videoId}`,
        {
          headers: { "X-Api-Key": ENV.HEYGEN_KEY }
        }
      );

      const videoStatus = status.data.data?.status;
      console.log(`📊 HeyGen status: ${videoStatus}`);

      if (videoStatus === "completed") {
        const videoUrl = status.data.data?.video_url;
        console.log("✅ HeyGen video ready:", videoUrl);
        return videoUrl;
      } else if (videoStatus === "failed") {
        console.error("❌ HeyGen video failed:", status.data.data?.error);
        return null;
      }
      // Continue polling if pending/processing
    } catch (err) {
      console.error("❌ Error polling HeyGen:", err.response?.data || err.message);
    }
  }

  console.warn("⚠️ HeyGen video timed out after 5 minutes");
  return null;
}

/**
 * Generate video from lesson scenes
 * @param {Array} videoScenes - Array of scene objects with voiceover
 * @param {string} gradeLevel - Grade level
 * @returns {Promise<string|null>} Video URL or null
 */
export async function generateVideoFromScenes(videoScenes, gradeLevel = "6") {
  if (!videoScenes || videoScenes.length === 0) {
    console.log("⚠️ No video scenes provided");
    return null;
  }

  const script = videoScenes
    .map(scene => scene.voiceover || scene.narration || scene.text || "")
    .filter(text => text.trim().length > 0)
    .join(" ");

  if (!script) {
    console.log("⚠️ No voiceover content in scenes");
    return null;
  }

  return generateVideo(script, gradeLevel, {
    title: "Social Skills Video Lesson"
  });
}

/**
 * List available avatars from HeyGen
 * @returns {Promise<Array>} List of available avatars
 */
export async function listAvatars() {
  if (!ENV.HEYGEN_KEY) return [];

  try {
    const response = await axios.get(
      `${HEYGEN_API_BASE}/v2/avatars`,
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY
        }
      }
    );
    return response.data.data?.avatars || [];
  } catch (err) {
    console.error("❌ Error fetching HeyGen avatars:", err.message);
    return [];
  }
}

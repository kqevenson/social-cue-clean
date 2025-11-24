// backend/services/runwayService.js — NUCLEAR REWRITE

import axios from "axios";
import { ENV } from "../config/env.js";

/**
 * runwayGenerate(promptText, gradeLevel)
 *
 * Accepts:
 * - promptText → combined scenes / storyboard text
 * - gradeLevel → optional, shapes tone/vibe
 *
 * Returns:
 * - Final MP4 URL from RunwayML
 */

export async function runwayGenerate(promptText, gradeLevel = "6") {
  try {
    // Check if Runway key exists
    if (!ENV.RUNWAY_KEY || ENV.RUNWAY_KEY === 'placeholder') {
      console.log("⚠️ No Runway API key - skipping video generation");
      return null;
    }

    // Grade-level styling (better visuals for certain age groups)
    const gradeStyles = {
      "K-2": "friendly, bright colors, soft edges, welcoming classroom",
      "3-5": "colorful classroom, simple interactions",
      "6-8": "middle school hallway or classroom, natural lighting",
      "9-12": "realistic high school scene, natural tone"
    };

    const style = gradeStyles[gradeLevel] || "natural school setting";

    // 🔥 Build final RunwayML prompt
    const finalPrompt = `
      ${promptText}
      Visual style: ${style}.
      Medium: natural cinematography.
      Emotion: supportive, positive, empowering.
      Composition: clean framing, realistic skin tones, natural lighting.
      Output: 1280x720 classroom or school setting video.
    `.trim();

    console.log("🟣 Sending RunwayML Prompt:", finalPrompt);

    const response = await axios.post(
      "https://api.runwayml.com/v1/generations",
      {
        model: "gen-4-turbo",
        prompt: finalPrompt,
        size: "1280x720"
      },
      {
        headers: {
          Authorization: `Bearer ${ENV.RUNWAY_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const url =
      response?.data?.output?.[0]?.url ||
      response?.data?.image_url ||
      null;

    if (!url) {
      console.warn("⚠️ Runway returned no output URL:", response.data);
      return null;
    }

    return url;
  } catch (err) {
    console.error("❌ RunwayML Generation Error:", err.message);

    // Safe fallback
    return null;
  }
}

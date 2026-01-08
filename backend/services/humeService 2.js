// backend/services/humeService.js
// Using axios instead of SDK since the Hume SDK package has compatibility issues

import axios from "axios";
import { ENV } from "../config/env.js";

const HUME_API_BASE = "https://api.hume.ai/v0";

/**
 * Analyze emotions from a video URL using Hume's batch API
 * @param {string} videoUrl - URL of the video to analyze
 * @returns {Promise<object>} Emotion analysis results
 */
export async function analyzeEmotion(videoUrl) {
  if (!ENV.HUME_API_KEY) {
    throw new Error("HUME_API_KEY not configured");
  }

  try {
    // Start batch job
    const response = await axios.post(
      `${HUME_API_BASE}/batch/jobs`,
      {
        models: {
          face: {},
          prosody: {}
        },
        urls: [videoUrl]
      },
      {
        headers: {
          "X-Hume-Api-Key": ENV.HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const jobId = response.data?.job_id;
    if (!jobId) {
      return response.data;
    }

    // Poll for results
    const maxAttempts = 30;
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await axios.get(
        `${HUME_API_BASE}/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            "X-Hume-Api-Key": ENV.HUME_API_KEY
          }
        }
      );

      if (statusResponse.data && statusResponse.data.length > 0) {
        return statusResponse.data;
      }
    }

    throw new Error("Hume analysis timed out");
  } catch (err) {
    console.error("❌ Hume analyzeEmotion error:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * Analyze emotions from an image (base64)
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<object>} Emotion analysis results
 */
export async function analyzeImageEmotion(imageBase64) {
  if (!ENV.HUME_API_KEY) {
    throw new Error("HUME_API_KEY not configured");
  }

  try {
    const response = await axios.post(
      `${HUME_API_BASE}/batch/jobs`,
      {
        models: {
          face: {}
        },
        files: [
          {
            content_type: "image/jpeg",
            data: imageBase64
          }
        ]
      },
      {
        headers: {
          "X-Hume-Api-Key": ENV.HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const jobId = response.data?.job_id;
    if (!jobId) {
      return { predictions: response.data?.predictions || [] };
    }

    // Poll for results
    const maxAttempts = 10;
    const pollInterval = 500;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await axios.get(
        `${HUME_API_BASE}/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            "X-Hume-Api-Key": ENV.HUME_API_KEY
          }
        }
      );

      if (statusResponse.data && statusResponse.data.length > 0) {
        return statusResponse.data;
      }
    }

    return { predictions: [] };
  } catch (err) {
    console.error("❌ Hume analyzeImageEmotion error:", err.response?.data || err.message);
    return { predictions: [] };
  }
}

/**
 * Analyze emotions from audio (base64)
 * @param {string} audioBase64 - Base64 encoded audio data
 * @returns {Promise<object>} Emotion analysis results with dominant emotion
 */
export async function analyzeAudioEmotion(audioBase64) {
  if (!ENV.HUME_API_KEY) {
    throw new Error("HUME_API_KEY not configured");
  }

  try {
    const response = await axios.post(
      `${HUME_API_BASE}/batch/jobs`,
      {
        models: {
          prosody: {}
        },
        files: [
          {
            content_type: "audio/wav",
            data: audioBase64
          }
        ]
      },
      {
        headers: {
          "X-Hume-Api-Key": ENV.HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const jobId = response.data?.job_id;
    if (!jobId) {
      return null;
    }

    // Poll for results
    const maxAttempts = 15;
    const pollInterval = 500;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await axios.get(
        `${HUME_API_BASE}/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            "X-Hume-Api-Key": ENV.HUME_API_KEY
          }
        }
      );

      if (statusResponse.data && statusResponse.data.length > 0) {
        const prosodyResults = statusResponse.data[0]?.results?.predictions?.[0]?.models?.prosody?.grouped_predictions?.[0]?.predictions || [];

        if (prosodyResults.length > 0) {
          const emotions = prosodyResults[0].emotions || [];
          const sorted = emotions.sort((a, b) => b.score - a.score);
          const topEmotion = sorted[0];

          return {
            emotion: topEmotion?.name || "neutral",
            intensity: topEmotion?.score || 0.5,
            full: emotions
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("❌ Hume analyzeAudioEmotion error:", err.response?.data || err.message);
    return null;
  }
}


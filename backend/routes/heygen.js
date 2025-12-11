// backend/routes/heygen.js
// HeyGen Streaming Avatar API endpoints

import express from "express";
import axios from "axios";
import { ENV } from "../config/env.js";

const router = express.Router();
const HEYGEN_API_BASE = "https://api.heygen.com";

/**
 * Create a streaming avatar session token
 * POST /api/heygen/streaming/token
 */
router.post("/streaming/token", async (req, res) => {
  if (!ENV.HEYGEN_KEY) {
    return res.status(500).json({
      success: false,
      error: "HeyGen API key not configured"
    });
  }

  try {
    console.log("🎭 Creating HeyGen streaming session token...");

    // Create access token for streaming avatar
    const response = await axios.post(
      `${HEYGEN_API_BASE}/v1/streaming.create_token`,
      {},
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const token = response.data?.data?.token;
    if (!token) {
      console.error("❌ No token in HeyGen response:", response.data);
      return res.status(500).json({
        success: false,
        error: "Failed to create streaming token"
      });
    }

    console.log("✅ HeyGen streaming token created");
    return res.json({
      success: true,
      token
    });

  } catch (err) {
    console.error("❌ HeyGen streaming token error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message
    });
  }
});

/**
 * Start a streaming avatar session
 * POST /api/heygen/streaming/start
 */
router.post("/streaming/start", async (req, res) => {
  const { avatarId, voiceId, quality = "medium" } = req.body;

  if (!ENV.HEYGEN_KEY) {
    return res.status(500).json({
      success: false,
      error: "HeyGen API key not configured"
    });
  }

  try {
    console.log("🎭 Starting HeyGen streaming session...");
    console.log("   Avatar:", avatarId);
    console.log("   Voice:", voiceId);

    const response = await axios.post(
      `${HEYGEN_API_BASE}/v1/streaming.new`,
      {
        avatar_id: avatarId || "Anna_public_3_20240108",
        voice: {
          voice_id: voiceId || "e0cc82c22f414c95b1f25696c732f058"
        },
        quality,
        version: "v2"
      },
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const sessionData = response.data?.data;
    if (!sessionData) {
      console.error("❌ No session data in HeyGen response:", response.data);
      return res.status(500).json({
        success: false,
        error: "Failed to start streaming session"
      });
    }

    console.log("✅ HeyGen streaming session started:", sessionData.session_id);
    return res.json({
      success: true,
      session: sessionData
    });

  } catch (err) {
    console.error("❌ HeyGen streaming start error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message
    });
  }
});

/**
 * Send text to streaming avatar (make it speak)
 * POST /api/heygen/streaming/speak
 */
router.post("/streaming/speak", async (req, res) => {
  const { sessionId, text, taskType = "talk" } = req.body;

  if (!ENV.HEYGEN_KEY) {
    return res.status(500).json({
      success: false,
      error: "HeyGen API key not configured"
    });
  }

  if (!sessionId || !text) {
    return res.status(400).json({
      success: false,
      error: "sessionId and text are required"
    });
  }

  try {
    console.log("🗣️ Sending text to HeyGen avatar:", text.substring(0, 50) + "...");

    const response = await axios.post(
      `${HEYGEN_API_BASE}/v1/streaming.task`,
      {
        session_id: sessionId,
        text,
        task_type: taskType  // "talk" or "repeat"
      },
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      task: response.data?.data
    });

  } catch (err) {
    console.error("❌ HeyGen speak error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message
    });
  }
});

/**
 * Stop streaming session
 * POST /api/heygen/streaming/stop
 */
router.post("/streaming/stop", async (req, res) => {
  const { sessionId } = req.body;

  if (!ENV.HEYGEN_KEY || !sessionId) {
    return res.status(400).json({
      success: false,
      error: "sessionId required"
    });
  }

  try {
    console.log("🛑 Stopping HeyGen streaming session:", sessionId);

    await axios.post(
      `${HEYGEN_API_BASE}/v1/streaming.stop`,
      { session_id: sessionId },
      {
        headers: {
          "X-Api-Key": ENV.HEYGEN_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ HeyGen session stopped");
    return res.json({ success: true });

  } catch (err) {
    console.error("❌ HeyGen stop error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message
    });
  }
});

/**
 * List available streaming avatars
 * GET /api/heygen/avatars
 */
router.get("/avatars", async (req, res) => {
  if (!ENV.HEYGEN_KEY) {
    return res.status(500).json({
      success: false,
      error: "HeyGen API key not configured"
    });
  }

  try {
    const response = await axios.get(
      `${HEYGEN_API_BASE}/v2/avatars`,
      {
        headers: { "X-Api-Key": ENV.HEYGEN_KEY }
      }
    );

    const avatars = response.data?.data?.avatars || [];

    // Filter to only streaming-capable avatars
    const streamingAvatars = avatars.filter(a =>
      a.avatar_id && (a.avatar_name || a.avatar_id)
    );

    return res.json({
      success: true,
      avatars: streamingAvatars
    });

  } catch (err) {
    console.error("❌ HeyGen avatars error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message
    });
  }
});

export default router;

import express from "express";
import { analyzeEmotion } from "../services/humeService.js";
import { ENV } from "../config/env.js";

const router = express.Router();

/**
 * GET /api/hume/access-token
 * Returns a Hume access token for the EVI WebSocket connection.
 * Uses OAuth2 client credentials flow with HUME_API_KEY + HUME_SECRET.
 */
router.get("/access-token", async (req, res) => {
  if (!ENV.HUME_API_KEY || !ENV.HUME_SECRET) {
    return res.status(500).json({
      success: false,
      details: "Hume API key or client secret not configured"
    });
  }

  try {
    const response = await fetch("https://api.hume.ai/oauth2-cc/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        api_key: ENV.HUME_API_KEY,
        client_secret: ENV.HUME_SECRET
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Hume token error:", errText);
      return res.status(response.status).json({
        success: false,
        details: `Hume token request failed: ${errText}`
      });
    }

    const data = await response.json();
    console.log("✅ Hume access token obtained");
    return res.json({ accessToken: data.access_token });
  } catch (err) {
    console.error("❌ Hume access token error:", err.message);
    return res.status(500).json({
      success: false,
      details: err.message
    });
  }
});

router.post("/analyze-video", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const result = await analyzeEmotion(videoUrl);
    res.json({ success: true, analysis: result });
  } catch (err) {
    console.error("Hume error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



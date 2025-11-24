import express from "express";
import { analyzeEmotion } from "../services/humeService.js";

const router = express.Router();

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



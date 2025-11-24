import express from "express";
import { openaiClient } from "../services/openaiService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    });

    res.json({ success: true, reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



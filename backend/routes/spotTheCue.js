import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const TOPIC_CUE_FOCUS = {
  "Small Talk Mastery": {
    focus: "reading approachability signals",
    cues: "open vs closed body language, whether someone looks busy or available, friendly facial expressions, eye contact invitations"
  },
  "Active Listening": {
    focus: "spotting engaged vs distracted listeners",
    cues: "eye contact, nodding, leaning in, phone distractions, looking away, fidgeting, crossed arms"
  },
  "Body Language": {
    focus: "identifying emotions from nonverbal signals",
    cues: "posture, facial expressions, hand gestures, personal space, tension in shoulders, smile types"
  },
  "Building Confidence": {
    focus: "recognizing confident vs nervous body language",
    cues: "upright posture, voice steadiness, eye contact, fidgeting, shrinking posture, hand wringing"
  },
  "Conflict Resolution": {
    focus: "reading tension and de-escalation signals",
    cues: "crossed arms, raised voice signals, turning away, clenched jaw, open palms, softening expression"
  }
};

/**
 * POST /api/spot-the-cue/generate
 * Generates 3 cue cards with DALL-E images for the Spot the Cue game
 */
router.post("/generate", async (req, res) => {
  const { topic, gradeLevel } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, error: "topic is required" });
  }

  const topicInfo = TOPIC_CUE_FOCUS[topic] || TOPIC_CUE_FOCUS["Body Language"];

  try {
    // Step 1: Generate card scenarios with GPT
    const gptRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You create "Spot the Cue" quiz cards for a social skills app for ${gradeLevel || "6-8"} grade students. Focus: ${topicInfo.focus}. Relevant cues: ${topicInfo.cues}.

Each card shows a social scene image. The student must identify the correct social cue.

Generate exactly 3 cards. For each card provide:
- dallePrompt: A detailed prompt for DALL-E to generate a warm, friendly cartoon/illustration of kids in a school social situation. The image should clearly show the social cue in question. Use soft colors, diverse characters, school settings. Style: modern children's book illustration, warm lighting, expressive faces and body language. NO text in the image.
- question: A clear question about what social cue they can spot (age-appropriate for ${gradeLevel || "6-8"} graders)
- options: Exactly 4 answer choices (strings)
- correctIndex: Index (0-3) of the correct answer
- explanation: 1-2 sentences explaining why the correct answer is right and what the cue means (warm, supportive tone)

Return JSON: { "cards": [ { dallePrompt, question, options, correctIndex, explanation } ] }`
        },
        {
          role: "user",
          content: `Generate 3 "Spot the Cue" cards for the topic: "${topic}" at grade level ${gradeLevel || "6-8"}.`
        }
      ]
    });

    const parsed = JSON.parse(gptRes.choices[0].message.content);
    const cards = parsed.cards || [];

    if (cards.length === 0) {
      return res.status(500).json({ success: false, error: "No cards generated" });
    }

    // Step 2: Generate DALL-E images for each card (in parallel)
    const cardsWithImages = await Promise.all(
      cards.map(async (card) => {
        try {
          const imgRes = await client.images.generate({
            model: "dall-e-3",
            prompt: card.dallePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          return {
            imageUrl: imgRes.data[0]?.url || null,
            question: card.question,
            options: card.options,
            correctIndex: card.correctIndex,
            explanation: card.explanation
          };
        } catch (imgErr) {
          console.warn("DALL-E image generation failed for card:", imgErr.message);
          return {
            imageUrl: null,
            question: card.question,
            options: card.options,
            correctIndex: card.correctIndex,
            explanation: card.explanation
          };
        }
      })
    );

    return res.json({ success: true, cards: cardsWithImages });
  } catch (err) {
    console.error("Spot the Cue generation error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

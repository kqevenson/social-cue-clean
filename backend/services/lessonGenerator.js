// backend/services/lessonGenerator.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const gradeHints = {
  "K-2": "Use simple words, friendly warmth, gentle examples.",
  "3-5": "Use elementary clarity with concrete examples.",
  "6-8": "Use relatable, real-life scenarios.",
  "9-12": "Use teen-appropriate realism and everyday situations."
};

export async function generateLesson(topic, gradeLevel) {
  const hint = gradeHints[gradeLevel] || "Use age-appropriate clarity.";

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
Return ONLY JSON. No prose.

SCHEMA:
{
  "warmup": {
    "prompt": "string",
    "whyItMatters": "string"
  },
  "practice": {
    "turns": [
      {
        "id": "string",
        "situation": "string",
        "question": "string",
        "options": [
          { "id": "A", "text": "string" },
          { "id": "B", "text": "string" },
          { "id": "C", "text": "string" }
        ],
        "correctAnswer": "A"
      }
    ]
  },
  "wrapup": {
    "prompt": "string"
  },
  "explanation": {
    "mainConcept": "string",
    "keyPoints": ["string", "string", "string"],
    "commonMistakes": ["string", "string", "string"]
  },
  "videoScenes": [
    {
      "id": "string",
      "description": "string",
      "shot": "string",
      "voiceover": "string"
    }
  ]
}
        `
      },
      {
        role: "user",
        content: `
Create a warm friendly social-skills lesson for topic: "${topic}", grade ${gradeLevel}.
Use this tone: ${hint}.
3 practice turns only. Real-life AND school examples.

Requirements:
- Include a "whyItMatters" explanation in warmup that explains why this social skill is important
- Provide specific keyPoints relevant to "${topic}" (not generic)
- List common mistakes specific to "${topic}" (not generic)
- Make all content age-appropriate for grade ${gradeLevel}
`
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

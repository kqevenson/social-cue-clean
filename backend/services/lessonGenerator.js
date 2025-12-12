// backend/services/lessonGenerator.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const gradeHints = {
  "K-2": "Use simple words, friendly warmth, gentle examples. Address the child directly and warmly.",
  "3-5": "Use elementary clarity with concrete examples. Be encouraging and supportive.",
  "6-8": "Use relatable, real-life scenarios from middle school life. Be conversational and understanding.",
  "9-12": "Use teen-appropriate realism and everyday situations. Be respectful and treat them maturely."
};

const scenarioTypes = [
  "school hallway", "cafeteria", "classroom", "playground", "library",
  "sports practice", "club meeting", "group project", "bus ride", "lunch table",
  "birthday party", "family gathering", "neighborhood", "after-school activity",
  "video game session", "study group", "recess", "art class", "music practice"
];

export async function generateLesson(topic, gradeLevel, learnerName = null) {
  const hint = gradeHints[gradeLevel] || "Use age-appropriate clarity.";
  const nameInstruction = learnerName
    ? `The learner's name is "${learnerName}". Use their name occasionally (maybe 1-2 times in the warmup or one scenario) to make it feel personal - for example "Hey ${learnerName}, let's explore..." in the warmup or "Imagine you, ${learnerName}, are at..." in one scenario. Don't overuse it - most scenarios should just use "you".`
    : `Use "you" to address the learner directly and make scenarios feel personal.`;

  // Pick 3 random scenario locations for variety
  const shuffled = [...scenarioTypes].sort(() => Math.random() - 0.5);
  const selectedScenarios = shuffled.slice(0, 3);

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
          { "id": "A", "text": "string", "feedback": "string" },
          { "id": "B", "text": "string", "feedback": "string" },
          { "id": "C", "text": "string", "feedback": "string" }
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
Create a warm, friendly, and PERSONALIZED social-skills lesson for topic: "${topic}", grade ${gradeLevel}.
Use this tone: ${hint}

${nameInstruction}

IMPORTANT - Make this lesson DYNAMIC and UNIQUE:
- Use these specific settings for the 3 practice scenarios: ${selectedScenarios.join(", ")}
- Each scenario should feel like a mini-story with vivid details
- Include specific character names for other people in the scenarios (like "Maya", "Jordan", "Coach Taylor")
- Add sensory details to make scenarios immersive (sounds, feelings, atmosphere)
- Make the situations feel real and relatable, not generic

3 practice turns only. Each turn should have:
- A vivid, specific situation (not generic)
- A question that directly engages the learner
- 3 distinct answer choices with meaningful differences
- Randomize which option (A, B, or C) is correct - don't always make A correct!
- DETAILED FEEDBACK for EACH option (2-3 sentences each):
  * For correct answers: Explain WHY this is the best choice, what positive outcome it leads to, and reinforce the social skill being practiced
  * For incorrect answers: Kindly explain why this isn't the best choice, what might happen if they chose this, and gently redirect to better thinking WITHOUT being harsh or discouraging

Requirements:
- Warmup should directly address the learner and connect to their life
- Include a "whyItMatters" explanation that resonates with grade ${gradeLevel} students
- Provide specific keyPoints relevant to "${topic}" (not generic)
- List common mistakes specific to "${topic}" (not generic)
- Wrapup should celebrate their learning and encourage real-world practice
- Make all content age-appropriate for grade ${gradeLevel}
`
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

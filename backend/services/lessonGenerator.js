// backend/services/lessonGenerator.js
import OpenAI from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const gradeHints = {
  "K-2": "Use simple words, friendly warmth, gentle examples. Address the child directly and warmly.",
  "3-5": "Use elementary clarity with concrete examples. Be encouraging and supportive.",
  "6-8": "Use relatable, real-life scenarios from middle school life. Be conversational and understanding.",
  "9-12": "Use teen-appropriate realism and everyday situations. Be respectful and treat them maturely."
};

const dalleStyleByGrade = {
  "K-2": "Style: bright, colorful cartoon illustration like a picture book for young children (ages 5-7). Characters should look like small children (kindergarten/1st/2nd grade). Round friendly faces, big expressive eyes, simple backgrounds, warm pastel colors, NO text in image.",
  "3-5": "Style: warm, friendly children's book illustration for elementary students (ages 8-10). Characters should look like upper elementary kids. Expressive faces, colorful school settings, soft inviting colors, NO text in image.",
  "6-8": "Style: semi-realistic, modern illustration for middle schoolers (ages 11-14). Characters should look like tweens/young teens. Relatable school and social settings, natural expressions, contemporary clothing, NO text in image.",
  "9-12": "Style: realistic, contemporary digital illustration for high schoolers (ages 14-18). Characters should look like teenagers. Authentic everyday settings, nuanced facial expressions and body language, modern style, NO text in image."
};

// Normalize grade input (number or string) to a grade range key
function normalizeGradeLevel(grade) {
  if (typeof grade === 'string') {
    const upper = grade.toUpperCase();
    if (upper === 'K-2' || upper === '3-5' || upper === '6-8' || upper === '9-12') return upper;
  }
  const num = parseInt(grade) || 5;
  if (num <= 2) return 'K-2';
  if (num <= 5) return '3-5';
  if (num <= 8) return '6-8';
  return '9-12';
}

const scenarioTypes = [
  "school hallway", "cafeteria", "classroom", "playground", "library",
  "sports practice", "club meeting", "group project", "bus ride", "lunch table",
  "birthday party", "family gathering", "neighborhood", "after-school activity",
  "video game session", "study group", "recess", "art class", "music practice"
];

export async function generateLesson(topic, gradeLevel, learnerName = null) {
  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  const hint = gradeHints[normalizedGrade] || "Use age-appropriate clarity.";
  const artStyle = dalleStyleByGrade[normalizedGrade] || dalleStyleByGrade["6-8"];
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
        "correctAnswer": "A",
        "dallePrompt": "string — A detailed prompt for DALL-E to illustrate this exact scenario. Show the social situation described, with expressive characters showing clear body language and facial expressions relevant to the question. Characters MUST look age-appropriate for grade ${normalizedGrade} students. ${artStyle}"
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
Create a warm, friendly, and PERSONALIZED social-skills lesson for topic: "${topic}", grade ${normalizedGrade}.
Use this tone: ${hint}
The students are in grade ${normalizedGrade}. ALL content — vocabulary, scenarios, complexity, and illustrations — MUST be appropriate for this age group.

${nameInstruction}

IMPORTANT - Make this lesson DYNAMIC and UNIQUE:
- Use these specific settings for the 3 practice scenarios: ${selectedScenarios.join(", ")}
- Each scenario should feel like a mini-story with vivid details
- Give other characters in scenarios unique, varied names from diverse backgrounds. NEVER use the name "Maya" — pick from names like: Jordan, Priya, Marcus, Aisha, Leo, Camila, Deshawn, Hana, Elias, Fatima, Kenji, Sofia, Tariq, Mei, Carlos, Nia, Liam, Zara, Andre, Yuki. Use DIFFERENT names in each scenario — never repeat a name across turns.
- Add sensory details to make scenarios immersive (sounds, feelings, atmosphere)
- Make the situations feel real and relatable, not generic

3 practice turns only. Each turn is a "SPOT THE CUE" challenge where the learner looks at an illustration and reads social cues from it.

CRITICAL — Each turn MUST be designed around READING SOCIAL CUES IN THE IMAGE:

THE SITUATION TEXT MUST BE 100% EMOTIONALLY NEUTRAL — THIS IS THE MOST IMPORTANT RULE:
- The "situation" sets ONLY the physical scene: the location, who is present, and what activity is happening. NOTHING ELSE.
- The situation MUST NOT contain ANY word that describes feelings, emotions, expressions, body language, attitudes, or demeanor. The learner must figure these out ONLY from the image.
- BANNED WORDS/PHRASES in situation text (this list is NOT exhaustive — ban ALL similar words): looking excited, looking upset, looking nervous, looking happy, looking sad, looking bored, seems anxious, seems shy, seems eager, fidgeting, bouncing, slouching, smiling, frowning, grinning, giggling, whispering nervously, talking excitedly, laughing, crying, staring, glaring, rolling eyes, crossing arms, turning away, leaning in, pulling back, hesitating, enthusiastic, frustrated, confused, worried, uncomfortable, awkward, cheerful, annoyed, distracted, interested, uninterested, engaged, withdrawn, quiet, loud
- BAD: "You notice Hana sitting nearby talking to Deshawn, looking excited about something" ← "looking excited" gives away the answer!
- BAD: "Leo is sitting quietly, fidgeting with his pencil" ← "quietly" and "fidgeting" reveal his state!
- BAD: "Priya is chatting enthusiastically with her friend" ← "enthusiastically" reveals the cue!
- GOOD: "You're on the school bus. Hana and Deshawn are sitting in the row ahead of you."
- GOOD: "You're in the classroom during a group project. Leo is sitting across from you."
- GOOD: "You're at sports practice. Priya is standing near the bench with her friend."
- The situation should be 1-2 SHORT sentences. Just the setting and who is there. Period.

- The "question" asks the learner to observe the image and identify what a character is feeling or what social cue they notice — e.g. "Look at the image — how do you think Leo is feeling right now?", "What do you notice about Leo's body language?", "Based on what you see, what social cue is Leo showing?"
- The "dallePrompt" must depict characters with CLEAR, OBVIOUS social cues that directly relate to the question
- Answer options should describe different possible emotions or cues the learner might interpret from the image
- Make the correct cue clearly visible in the dallePrompt so the image matches the answer

Each turn should have:
- 3 distinct answer choices about what social cues they can observe
- Randomize which option (A, B, or C) is correct - don't always make A correct!
- DETAILED FEEDBACK for EACH option (2-3 sentences each):
  * For correct answers: Explain WHY this cue indicates that emotion/intention, what to look for in real life, and how recognizing this cue helps in social situations
  * For incorrect answers: Kindly explain why this cue doesn't match, what it might indicate instead, and guide them toward the right observation

Requirements:
- Warmup should directly address the learner and connect to their life
- Include a "whyItMatters" explanation that resonates with grade ${normalizedGrade} students
- Provide specific keyPoints relevant to "${topic}" (not generic)
- List common mistakes specific to "${topic}" (not generic)
- Wrapup should celebrate their learning and encourage real-world practice
- Make all content age-appropriate for grade ${gradeLevel}
`
      }
    ]
  });

  const lesson = JSON.parse(completion.choices[0].message.content);

  // Generate DALL-E images for each practice turn in parallel
  if (lesson.practice?.turns?.length > 0) {
    console.log(`🎨 Generating ${lesson.practice.turns.length} DALL-E images for scenarios...`);
    await Promise.all(
      lesson.practice.turns.map(async (turn) => {
        if (!turn.dallePrompt) return;
        try {
          const imgRes = await client.images.generate({
            model: "dall-e-3",
            prompt: turn.dallePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          turn.imageUrl = imgRes.data[0]?.url || null;
          console.log(`✅ Image generated for turn ${turn.id}`);
        } catch (err) {
          console.warn(`⚠️ DALL-E failed for turn ${turn.id}:`, err.message);
          turn.imageUrl = null;
        }
      })
    );
  }

  return lesson;
}

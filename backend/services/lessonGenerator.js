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

  // Randomize character names so they vary each lesson
  const allNames = ["Jayden", "Olivia", "Liam", "Ava", "Noah", "Sophia", "Aiden", "Isabella", "Mia", "Ethan", "Harper", "Mason", "Ella", "Logan", "Amara", "Lucas", "Riley", "Caleb", "Zoe", "Elijah", "Layla", "Kai", "Chloe", "Miles", "Aria", "Jaxon", "Luna", "Cameron", "Naomi", "Dylan"];
  const shuffledNames = allNames.sort(() => Math.random() - 0.5).slice(0, 6);

  // Pick a random emotion tone for this lesson to avoid always-positive bias
  const emotionSets = [
    ["anxious or nervous", "frustrated or overwhelmed", "feeling left out or excluded"],
    ["defensive or guarded", "embarrassed or self-conscious", "disappointed or let down"],
    ["jealous or envious", "guilty or ashamed", "confused or conflicted"],
    ["lonely or isolated", "insecure or seeking approval", "passive-aggressive or sarcastic"],
    ["masking sadness with a smile", "feeling peer pressure", "uncomfortable but pretending to be fine"],
    ["angry but holding it in", "bored and disengaged", "dismissive or condescending"]
  ];
  const selectedEmotions = emotionSets[Math.floor(Math.random() * emotionSets.length)];
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
        "hint": "string — A helpful hint that guides the learner on WHAT to focus on without giving away the answer. Examples: 'Pay attention to the character\\'s hands and posture', 'Look at where their eyes are focused', 'Notice the position of their arms and shoulders', 'Think about what it means when someone turns their body away from a group'. Also define any tricky vocabulary words used in the answer options — e.g. 'Withdrawn means pulling away or keeping to yourself.'",
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
Create a social-skills lesson for topic: "${topic}", grade ${normalizedGrade}.
Tone: ${hint}
Grade ${normalizedGrade} — ALL content MUST be age-appropriate.

${nameInstruction}

EVERY scenario, question, answer option, and piece of feedback MUST be DIRECTLY about "${topic}". Do NOT drift into generic social skills. Stay laser-focused on "${topic}" throughout.

TOPIC-SPECIFIC SCENARIO DESIGN for "${topic}":
- Each scenario must present a realistic "${topic}" situation that a grade ${normalizedGrade} student would actually encounter
- The social cues in the image must be specifically relevant to "${topic}" — not just any emotion
- Answer options must describe specific "${topic}"-related behaviors, not vague emotions like "happy" or "sad"
- For example, if the topic is "Active Listening", the cues should be about listening behaviors (eye contact, nodding, turning toward speaker, putting phone away vs. looking at phone, interrupting, fidgeting)
- If the topic is "Body Language", focus on interpreting specific postures, gestures, and spatial relationships
- If the topic is "Conflict Resolution", show tension, disagreement, de-escalation cues
- If the topic is "Building Confidence", show confident vs. insecure body language patterns

Use these settings for the 3 scenarios: ${selectedScenarios.join(", ")}
Use EXACTLY these character names (one per scenario, never repeat): ${shuffledNames.join(", ")}. NEVER use "Maya".

3 practice turns. Each is a "SPOT THE CUE" challenge — learner reads social cues from an illustration.

MANDATORY EMOTION TONES FOR THIS LESSON — you MUST use these specific emotions (one per turn):
- Turn 1 must feature a character who is: ${selectedEmotions[0]}
- Turn 2 must feature a character who is: ${selectedEmotions[1]}
- Turn 3 must feature a character who is: ${selectedEmotions[2]}
Do NOT substitute positive emotions like "happy", "excited", "engaged" unless the selected emotion above is positive. Most social cue learning happens with DIFFICULT emotions.

PROGRESSIVE DIFFICULTY:
- Turn 1: Clear "${topic}" cue showing the emotion above. One character with obvious signals. Wrong answers are clearly different.
- Turn 2: More nuanced "${topic}" situation with the emotion above. Mixed signals or less obvious cues. Wrong answers are plausible.
- Turn 3: Complex "${topic}" scenario with the emotion above. Multiple characters, subtle cues, or conflicting signals. All answers seem plausible.

ANSWER OPTIONS MUST BE DETAILED AND SPECIFIC (not vague):
- BAD options: "Happy and engaged", "Bored and uninterested", "Sad and lonely" ← TOO VAGUE
- GOOD options for Active Listening: "She's leaning forward with her chin resting on her hand, maintaining steady eye contact — signs she's fully engaged in the conversation", "She's glancing at her phone under the table while nodding — she's pretending to listen but is actually distracted", "She's facing the speaker but her eyes keep darting to the clock on the wall — she's eager for the conversation to end"
- GOOD options for Body Language: "His arms are crossed tightly against his chest and he's leaning back in his chair — he's creating a barrier and feels defensive about something", "He's mirroring the other person's posture and gestures — this is a sign of rapport and agreement", "His shoulders are raised up near his ears and his hands are gripping the desk — he's feeling tense and stressed"
- Each option should be 1-2 DETAILED sentences describing SPECIFIC body language/facial cues AND what they indicate

THE SITUATION TEXT MUST BE 100% EMOTIONALLY NEUTRAL:
- ONLY describe the physical scene: location, who is there, what activity is happening. NOTHING ELSE.
- NEVER describe emotions, body language, expressions, attitudes, or demeanor in the situation text.
- BANNED in situation text: any word describing how someone looks, feels, or acts emotionally.
- GOOD: "You're in the cafeteria. Leo is at the table with Fatima and Kenji."
- BAD: "Leo is sitting quietly, looking nervous" ← gives away the answer
- Keep it to 1-2 short sentences.

The "question" should ask the learner to observe the image and identify a "${topic}"-specific cue — e.g. "Look at the image — what does Leo's body language tell you about how he's participating in the conversation?", "What listening cue do you notice about Priya?", "Based on what you see, how is Deshawn handling this disagreement?"

The "dallePrompt" must show characters with CLEAR, OBVIOUS "${topic}"-relevant cues.

The "hint" should guide what to focus on without giving away the answer, and define any difficult vocabulary in the options.

RICH FEEDBACK for EACH option (4-6 sentences):
- Correct: Name the specific cue. Explain the psychology. Give a real-life example. Teach a concrete action step. Mention a related cue.
- Incorrect: Validate their thinking. Describe what that cue would actually look like. Point out the distinguishing detail. Give a tip. Encourage warmly.

Randomize which option (A, B, or C) is correct across turns.

Requirements:
- Warmup connects to the learner's life and specifically to "${topic}"
- "whyItMatters" resonates with grade ${normalizedGrade} and is about "${topic}"
- keyPoints are specific to "${topic}" (not generic social skills advice)
- commonMistakes are specific to "${topic}"
- Wrapup celebrates learning and gives a "${topic}"-specific real-world challenge
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

// ---------------------------------------------------------------------------
// generateConversationResponse.js — SOCIAL CUE AUTONOMY ENGINE v2025 FINAL
// Natural, warm, supportive conversational AI with soft phase logic.
// ---------------------------------------------------------------------------

import { personaEngine } from "./personaEngine";

function clean(text) {
  if (!text) return "";
  return String(text).trim();
}

// ---------------------------------------------------------
// Dynamic scenario generator — always fresh, never repeated
// ---------------------------------------------------------
function generateFreshScenario(topicName, gradeLevel) {
  const settings = [
    "the hallway before class",
    "the lunch tables",
    "the bus line",
    "your science group",
    "the library corner",
    "the gym before PE",
    "outside during break",
    "near the lockers",
    "waiting for pickup",
    "working on a class project"
  ];

  const actions = {
    "small-talk-basics": [
      "you notice someone you know and want to say something friendly",
      "someone is talking about their weekend plans",
      "a classmate is wearing something interesting and you want to comment",
      "a friend sits next to you and you want to start chatting"
    ],
    "active-listening": [
      "someone is telling a story and you want to show you're listening",
      "a friend shares something important",
      "a group is talking and you’re trying to follow along",
      "someone explains something and you need to respond naturally"
    ],
    "joining-groups": [
      "a group is already talking and you want to join",
      "your friends are chatting and you walk up",
      "a few kids are discussing a game and you want to join",
      "a group is laughing about something and you want to ask about it"
    ],
    "confidence-building": [
      "you want to speak but feel unsure",
      "you want to share an idea with the group",
      "you want to introduce yourself to someone new",
      "you want to ask a question but feel nervous"
    ],
    "resolving-conflicts": [
      "a misunderstanding pops up with a friend",
      "someone seems upset and you want to respond calmly",
      "you and a classmate disagree about something",
      "a small argument happened and you want to fix it"
    ]
  };

  const setting = settings[Math.floor(Math.random() * settings.length)];
  const list = actions[topicName] || actions["small-talk-basics"];
  const activity = list[Math.floor(Math.random() * list.length)];

  return `Imagine you're at ${setting}, and ${activity}.`;
}

// ---------------------------------------------------------
// MAIN RESPONSE ENGINE
// ---------------------------------------------------------
export async function generateConversationResponse({
  openai,
  currentPhase,
  history,
  learnerName,
  gradeLevel,
  difficulty,
  scenario
}) {
  const persona = personaEngine.getPersona(gradeLevel);

  const topicName =
    scenario?.topicName ||
    scenario?.title ||
    scenario?.topicId ||
    "this skill";

  const learner = learnerName || "friend";

  const freshScenario = generateFreshScenario(topicName, gradeLevel);

  // SYSTEM PROMPT — defines Cue's personality & behavior
  const system = `
You are CUE — a warm, friendly, supportive social coach.
Speak naturally, like ChatGPT voice: clear, calm, warm, and human.
NEVER use emojis. Avoid lists. Avoid robotic tones.
Use full sentences, but keep messages short and natural.
Always respond directly to the learner's last message.
Adjust tone to grade level: ${gradeLevel}.
Topic: ${topicName}.

GOALS:
- Keep the learner comfortable.
- Guide through natural back-and-forth dialogue.
- Demonstrate skills with a natural example.
- Encourage, respond, and adapt.
- Never cut yourself off or use fragments.
- Maintain autonomy — no rigid scripts.

PHASE GUIDANCE:
INTRO: Warm greeting + simple question.
PREVIEW: Briefly introduce what you’ll practice using a NEW scenario.
DEMONSTRATE: Give one natural example sentence.
REPEAT: Ask them to try it.
TEACHING: Respond to their attempt with guidance + praise.
VARIATION: Introduce a NEW variation or angle.
COMPLETE: Wrap up in a warm, confident tone.

Keep it conversational. Never lecture.
`;

  // USER PROMPT — includes all context for the next turn
  const user = `
Learner name: ${learner}
Current phase: ${currentPhase}

Fresh scenario you can use:
"${freshScenario}"

Recent conversation:
${history
  .slice(-8)
  .map(m => `${m.role === "assistant" ? "Cue" : "Learner"}: ${m.content}`)
  .join("\n")}

Respond as CUE.
Output ONLY valid JSON:

{
  "aiResponse": "your natural message here",
  "nextPhase": "PHASE_NAME"
}
`;

  // ---------------------------------------------------------------------------
  // API CALL
  // ---------------------------------------------------------------------------
  let raw;
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.95,
      max_tokens: 220,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    raw = res.choices[0]?.message?.content;
  } catch (err) {
    console.error("AutonomyEngine Error:", err);
    return {
      aiResponse: "I think my thoughts froze for a second. Want to continue?",
      nextPhase: "repeat"
    };
  }

  // ---------------------------------------------------------------------------
  // JSON PARSE
  // ---------------------------------------------------------------------------
  try {
    const parsed = JSON.parse(raw);
    return {
      aiResponse: clean(parsed.aiResponse),
      nextPhase: parsed.nextPhase || "repeat"
    };
  } catch (err) {
    console.warn("AI returned non-JSON, recovering…", raw);

    return {
      aiResponse: clean(raw),
      nextPhase: "repeat"
    };
  }
}

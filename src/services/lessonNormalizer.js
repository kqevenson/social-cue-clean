// src/services/lessonNormalizer.js

export function normalizeLesson(raw) {
  if (!raw) return createFallbackLesson("Social Skill", "5");

  const lesson = { ...raw };

  // ---------------- INTRODUCTION ----------------
  // Map warmup to introduction
  lesson.introduction = lesson.introduction || {};
  lesson.introduction.title = lesson.introduction.title || lesson.title || "Social Skills Lesson";
  lesson.introduction.objective = lesson.introduction.objective || lesson.warmup?.prompt || "";
  lesson.introduction.whyItMatters = lesson.introduction.whyItMatters || lesson.warmup?.whyItMatters || "";
  lesson.introduction.estimatedTime = lesson.introduction.estimatedTime || "5-10 minutes";

  // ---------------- EXPLANATION ----------------
  // Map content to explanation (use warmup as main concept if no explanation)
  const exp = lesson.explanation || {};

  lesson.explanation = {
    mainConcept: exp.mainConcept || exp.content || lesson.warmup?.prompt || "This skill helps us interact in positive ways.",
    keyPoints: Array.isArray(exp.keyPoints) ? exp.keyPoints : ["Be respectful", "Listen", "Think before responding"],
    commonMistakes: Array.isArray(exp.commonMistakes)
      ? exp.commonMistakes
      : ["Interrupting", "Not listening", "Responding too quickly"]
  };

  // ---------------- PRACTICE ----------------
  // Preserve practice.turns from OpenAI AND map to scenarios
  const practice = lesson.practice || {};
  const turns = practice.turns || [];
  const scenarios = practice.scenarios || practice.practiceScenarios || [];

  lesson.practice = {
    turns: Array.isArray(turns) ? turns : [],
    scenarios: Array.isArray(scenarios) ? scenarios : turns  // Use turns as scenarios if no scenarios
  };

  // ---------------- SUMMARY ----------------
  // Map wrapup to summary
  lesson.summary = lesson.summary || {};
  lesson.summary.whatYouLearned = lesson.summary.whatYouLearned || lesson.wrapup?.prompt || "Great work practicing!";
  lesson.summary.keyTakeaway = lesson.summary.keyTakeaway || "Small social skills make a big difference.";
  lesson.summary.realWorldChallenge = lesson.summary.realWorldChallenge || "Try this skill today.";
  lesson.summary.nextTopic = lesson.summary.nextTopic || "More practice coming soon.";

  return lesson;
}

// ---------------- FALLBACK LESSON ----------------
export function createFallbackLesson(topicName = "Social Skill", gradeLevel = "5") {
  return {
    introduction: {
      title: `${topicName} Practice`,
      objective: `Learn and practice basic ${topicName.toLowerCase()} skills.`,
      whyItMatters: "These skills help you interact confidently with others.",
      estimatedTime: "5 minutes"
    },
    explanation: {
      mainConcept: `${topicName} is an important social skill that helps us interact well with others.`,
      keyPoints: ["Be respectful", "Listen carefully", "Think before you act"],
      commonMistakes: ["Interrupting others", "Not listening", "Avoiding eye contact"]
    },
    practice: {
      scenarios: [
        {
          context: "You are at school and want to talk to someone new.",
          question: "What should you do?",
          options: [
            {
              text: "Walk up and introduce yourself",
              isGood: true,
              feedback: "Great job! Being friendly is a good way to start a conversation.",
              points: 10
            },
            {
              text: "Wait for them to talk first",
              isGood: false,
              feedback: "It's okay to wait sometimes, but trying first builds confidence.",
              points: 0
            }
          ]
        }
      ]
    },
    summary: {
      whatYouLearned: "You practiced new social skills!",
      keyTakeaway: "Being friendly helps build connections.",
      realWorldChallenge: "Try saying hi to someone new today!",
      nextTopic: "More confidence-building lessons soon."
    },
    isFallback: true
  };
}



// src/services/lessonNormalizer.js

export function normalizeLesson(raw) {
  if (!raw) return createFallbackLesson("Social Skill", "5");

  const lesson = { ...raw };

  // ---------------- INTRODUCTION ----------------
  lesson.introduction = lesson.introduction || {};
  lesson.introduction.title = lesson.introduction.title || "Social Skills Lesson";
  lesson.introduction.objective = lesson.introduction.objective || "";
  lesson.introduction.whyItMatters = lesson.introduction.whyItMatters || "";
  lesson.introduction.estimatedTime = lesson.introduction.estimatedTime || "5-10 minutes";

  // ---------------- EXPLANATION ----------------
  const exp = lesson.explanation || {};

  lesson.explanation = {
    mainConcept:
      exp.mainConcept ||
      exp.content ||
      "This skill helps us interact in positive ways.",
    keyPoints: Array.isArray(exp.keyPoints) ? exp.keyPoints : ["Be respectful", "Listen", "Think before responding"],
    commonMistakes: Array.isArray(exp.commonMistakes)
      ? exp.commonMistakes
      : ["Interrupting", "Not listening", "Responding too quickly"]
  };

  // ---------------- PRACTICE ----------------
  const practice = lesson.practice || lesson.practiceScenarios || {};
  const scenarios =
    practice.scenarios ||
    practice.practiceScenarios ||
    lesson.scenarios ||
    [];

  lesson.practice = {
    scenarios: Array.isArray(scenarios) ? scenarios : []
  };

  // ---------------- SUMMARY ----------------
  lesson.summary = lesson.summary || {};
  lesson.summary.whatYouLearned = lesson.summary.whatYouLearned || "Great work practicing!";
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



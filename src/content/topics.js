const practiceTopics = [
  {
    id: "small-talk-basics",
    title: "Small Talk Basics",
    description: "Learn friendly ways to start light conversations and keep them going.",
    icon: "💬",
    category: "conversation",
    sessionId: 1,
    scenarios: [
      {
        id: "small-talk-hallway",
        title: "Hallway Hello",
        description: "Greet a classmate before the bell rings.",
        contextLine: "You're grabbing books from your locker when you notice a classmate you recognize walking by.",
        prompt: "Try saying something friendly to start a quick chat before class begins.",
        warmupQuestion: "What's one friendly thing you can say when you see someone you know?",
        sessionId: 1
      },
      {
        id: "small-talk-lunch",
        title: "Joining Lunch Chat",
        description: "Join a table conversation in a relaxed way.",
        contextLine: "Several classmates are chatting about their weekend plans at lunch.",
        prompt: "Think of a curious question or fun comment that helps you join their conversation.",
        warmupQuestion: "Have you ever asked someone what they're doing this weekend? What did you say?",
        sessionId: 1
      },
      {
        id: "small-talk-bus",
        title: "Bus Ride Catch-Up",
        description: "Keep a conversation rolling during the ride home.",
        contextLine: "You're sitting next to a teammate on the bus after practice.",
        prompt: "Share something cool that happened today or ask about their day to keep the conversation flowing.",
        warmupQuestion: "What's an easy question you can ask when you want to keep talking?",
        sessionId: 1
      }
    ]
  },
  {
    id: "active-listening",
    title: "Active Listening",
    description: "Show others you care by reflecting, asking, and staying engaged.",
    icon: "👂",
    category: "listening",
    sessionId: 2,
    scenarios: [
      {
        id: "listening-project",
        title: "Group Project Update",
        description: "Listen carefully and respond to a teammate's idea.",
        contextLine: "Your teammate is explaining their plan for the science project.",
        prompt: "Reflect back what they said and ask a question that shows you're following along.",
        warmupQuestion: "How do you show someone you heard what they said?",
        sessionId: 2
      },
      {
        id: "listening-story",
        title: "Friend's Story",
        description: "Stay engaged while your friend tells a story.",
        contextLine: "A friend is excitedly sharing what happened at their game last night.",
        prompt: "Show you're listening by responding with a follow-up question or comment.",
        warmupQuestion: "What's a phrase you can use to let someone know you're paying attention?",
        sessionId: 2
      },
      {
        id: "listening-family",
        title: "Family Check-In",
        description: "Practice listening and responding during a family chat.",
        contextLine: "During dinner, a family member is talking about their day at work.",
        prompt: "Respond in a way that shows empathy and keeps the conversation warm.",
        warmupQuestion: "How can you show someone in your family that you care about what they're saying?",
        sessionId: 2
      }
    ]
  },
  {
    id: "confidence-building",
    title: "Confidence Building",
    description: "Practice positive self-talk and brave, kind responses.",
    icon: "⭐",
    category: "confidence",
    sessionId: 4,
    scenarios: [
      {
        id: "confidence-class",
        title: "Speaking Up in Class",
        description: "Share your idea even when you're nervous.",
        contextLine: "Your teacher asks for ideas during a class discussion.",
        prompt: "Use encouraging self-talk, then share your idea with the class.",
        warmupQuestion: "What can you tell yourself when you're nervous to speak up?",
        sessionId: 4
      },
      {
        id: "confidence-team",
        title: "Team Huddle Pep Talk",
        description: "Offer encouragement to your team before the game.",
        contextLine: "Your team looks nervous before the big match.",
        prompt: "Share a confident message that helps everyone feel ready.",
        warmupQuestion: "How can you cheer yourself on before you encourage others?",
        sessionId: 4
      },
      {
        id: "confidence-new",
        title: "Introducing Yourself",
        description: "Meet someone new with kindness and confidence.",
        contextLine: "You notice a new student studying alone in the library.",
        prompt: "Introduce yourself and invite them to join you for a study break.",
        warmupQuestion: "What's a friendly way to say hello to someone new?",
        sessionId: 4
      }
    ]
  },
  {
    id: "resolving-conflicts",
    title: "Resolving Conflicts",
    description: "Use calm, respectful language to solve social bumps.",
    icon: "🤝",
    category: "conflict",
    sessionId: 8,
    scenarios: [
      {
        id: "conflict-group",
        title: "Project Disagreement",
        description: "Handle a different opinion without arguing.",
        contextLine: "Two teammates have opposite ideas about the project design.",
        prompt: "Suggest a way to combine ideas or take turns while staying calm.",
        warmupQuestion: "What's something you can say when you disagree but still want to be respectful?",
        sessionId: 8
      },
      {
        id: "conflict-game",
        title: "Game Rule Mix-Up",
        description: "Solve a rule dispute during a game fairly.",
        contextLine: "Your friends can't agree on a rule change during a game.",
        prompt: "Calm everyone down and suggest a solution that feels fair.",
        warmupQuestion: "How can you help friends take a break when things get tense?",
        sessionId: 8
      },
      {
        id: "conflict-text",
        title: "Group Chat Tone Check",
        description: "Clear up a misunderstanding in a group chat.",
        contextLine: "Someone thinks a message sounded mean when you meant it as a joke.",
        prompt: "Explain what you meant and check how everyone is feeling so you can move forward.",
        warmupQuestion: "What's a calm way to say sorry if something you texted hurt feelings?",
        sessionId: 8
      }
    ]
  }
];

export const getPracticeTopicById = (topicId) =>
  practiceTopics.find((topic) => topic.id === topicId) || null;

export const flattenPracticeScenarios = () =>
  practiceTopics.flatMap((topic) =>
    topic.scenarios.map((scenario) => ({
      ...scenario,
      topicId: topic.id,
      topicTitle: topic.title,
      topicDescription: topic.description,
      topicIcon: topic.icon,
      category: topic.category
    }))
  );

export default practiceTopics;








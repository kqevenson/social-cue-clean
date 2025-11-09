// Social Cue Conversation Flow (STOP-TALK method)

export const conversationFlow = {
  // STOP-TALK phases
  stopTalk: {
    stop: {
      duration: 500, // ms to pause after student speaks
      purpose: 'Process response and prepare feedback'
    },
    talk: {
      maxWords: 15, // strict word limit
      structure: 'feedback + question + turn_signal',
      turnSignals: ['Your turn!', 'What would you say?', 'Now you try!', 'Go ahead!']
    }
  },

  // Turn-taking rules
  turnTaking: {
    oneQuestionPerTurn: true,
    explicitTurnSignals: true,
    waitForCompleteResponse: true,
    fastFeedback: true,
    wordLimits: {
      'K-2': 8,
      '3-5': 12,
      '6-8': 15,
      '9-12': 20
    }
  },

  // Response structure template
  responseStructure: {
    feedback: 'Short, specific praise or correction (3-5 words)',
    content: 'Main teaching point or question (5-8 words)',
    turnSignal: 'Explicit prompt for student to respond (2-3 words)',
    example: {
      feedback: 'Great eye contact!',
      content: 'Now ask about their hobby.',
      turnSignal: 'Your turn!'
    }
  },

  // Conversation pacing
  pacing: {
    minimumTurns: 5,
    maximumTurns: 12,
    idealTurns: 8,
    energyLevel: 'high', // fast-paced, energetic
    enthusiasm: 'consistent' // maintain throughout
  }
};

// Helper to format AI response with proper structure
export const formatAIResponse = (feedback, content, gradeLevel) => {
  const wordLimit =
    conversationFlow.turnTaking.wordLimits[gradeLevel] ??
    conversationFlow.stopTalk.talk.maxWords;

  const { turnSignals } = conversationFlow.stopTalk.talk;
  const turnSignal = turnSignals[Math.floor(Math.random() * turnSignals.length)];

  let response = `${feedback} ${content} ${turnSignal}`.trim();
  const words = response.split(/\s+/);

  if (words.length > wordLimit) {
    response = `${words.slice(0, wordLimit).join(' ')}!`;
  }

  return response;
};

export default conversationFlow;


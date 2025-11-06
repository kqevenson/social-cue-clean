/**
 * Mock Voice Conversation Engine
 * 
 * Intelligent mock conversation responses for voice practice.
 * Provides realistic, grade-appropriate responses until OpenAI integration is ready.
 * 
 * @module mockVoiceConversation
 */

/**
 * Get grade range from grade level
 * @param {string} gradeLevel - Grade level
 * @returns {string} Grade range
 */
function getGradeRange(gradeLevel) {
  const grade = typeof gradeLevel === 'string' ? parseInt(gradeLevel) || 6 : gradeLevel;
  if (grade <= 2) return 'k2';
  if (grade <= 5) return '3-5';
  if (grade <= 8) return '6-8';
  return '9-12';
}

/**
 * Generate mock AI response based on conversation context
 * @param {Object} context - Conversation context
 * @param {string} context.userMessage - User's message
 * @param {string} context.scenarioId - Scenario ID
 * @param {string} context.gradeLevel - Grade level
 * @param {string} context.phase - Current phase (intro, practice, feedback, complete)
 * @param {number} context.exchangeCount - Number of exchanges so far
 * @param {Array} context.conversationHistory - Previous messages
 * @returns {Object} AI response object
 */
export function generateMockResponse(context) {
  const {
    userMessage = '',
    scenarioId,
    gradeLevel = '6-8',
    phase = 'practice',
    exchangeCount = 0,
    conversationHistory = []
  } = context;

  const gradeRange = getGradeRange(gradeLevel);
  const userText = userMessage.toLowerCase().trim();

  // Get scenario-specific responses
  const scenarioResponses = getScenarioResponses(scenarioId, gradeRange);
  
  // Phase-specific responses
  if (phase === 'intro') {
    return {
      text: scenarioResponses.intro || getDefaultIntro(gradeRange),
      phase: 'practice',
      shouldContinue: true,
      metadata: {
        isMock: true,
        phase: 'intro'
      }
    };
  }

  if (phase === 'feedback') {
    return {
      text: generateFeedback(gradeRange, exchangeCount),
      phase: 'complete',
      shouldContinue: false,
      metadata: {
        isMock: true,
        phase: 'feedback'
      }
    };
  }

  if (phase === 'complete') {
    return {
      text: getCompletionMessage(gradeRange),
      phase: 'complete',
      shouldContinue: false,
      metadata: {
        isMock: true,
        phase: 'complete'
      }
    };
  }

  // Practice phase - generate contextual response
  const response = generatePracticeResponse(userText, scenarioResponses, gradeRange, exchangeCount);
  
  // Check if we should transition to feedback phase (after 5-8 exchanges)
  const shouldTransitionToFeedback = exchangeCount >= 5 && exchangeCount <= 8;

  return {
    text: response,
    phase: shouldTransitionToFeedback ? 'feedback' : 'practice',
    shouldContinue: !shouldTransitionToFeedback,
    metadata: {
      isMock: true,
      phase: 'practice',
      exchangeCount
    }
  };
}

/**
 * Generate practice phase response
 */
function generatePracticeResponse(userText, scenarioResponses, gradeRange, exchangeCount) {
  // Detect user intent
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(userText);
  const isQuestion = /\?/.test(userText) || /^(what|how|why|when|where|can|could|would|should)/.test(userText);
  const isShort = userText.split(/\s+/).length < 5;
  const isHesitant = /(um|uh|like|you know)/.test(userText);

  // Get scenario-specific responses
  const responses = scenarioResponses.practice || [];

  // Respond based on user input
  if (isGreeting && exchangeCount === 0) {
    return responses.greeting || getDefaultGreetingResponse(gradeRange);
  }

  if (isQuestion) {
    return responses.question || getDefaultQuestionResponse(gradeRange);
  }

  if (isShort) {
    return responses.encouragement || getDefaultEncouragement(gradeRange);
  }

  if (isHesitant) {
    return responses.support || getDefaultSupportResponse(gradeRange);
  }

  // Progressive responses based on exchange count
  if (exchangeCount === 1) {
    return responses.followUp1 || getDefaultFollowUp(gradeRange, 1);
  }

  if (exchangeCount === 2) {
    return responses.followUp2 || getDefaultFollowUp(gradeRange, 2);
  }

  if (exchangeCount >= 3) {
    return responses.followUp3 || getDefaultFollowUp(gradeRange, 3);
  }

  // Default response
  return responses.default || getDefaultResponse(gradeRange);
}

/**
 * Get scenario-specific responses
 */
function getScenarioResponses(scenarioId, gradeRange) {
  const responses = {
    'voice-starting-conversations': {
      intro: {
        k2: "Hi! I'm a new student in your class. I don't know anyone yet. Can you help me practice how to say hello?",
        '3-5': "I'm someone you see at school but haven't talked to before. Let's practice how you might start a conversation with me.",
        '6-8': "I'm a student from another grade who's at your lunch table. Let's practice how you'd introduce yourself.",
        '9-12': "I'm at a club fair, and you're interested in joining the same club I'm part of. Let's practice how you'd introduce yourself."
      },
      practice: {
        greeting: {
          k2: "Hi! Nice to meet you! What's your name?",
          '3-5': "Hello! I'm glad you said hi. Tell me a bit about yourself.",
          '6-8': "Hey! Thanks for introducing yourself. What brings you here?",
          '9-12': "Hello! Great to meet you. What interests you about this club?"
        },
        followUp1: {
          k2: "That's great! Do you like school?",
          '3-5': "I like that! What else would you like to share?",
          '6-8': "Nice! That's interesting. What else would you say?",
          '9-12': "Good point! Can you tell me more about that?"
        }
      }
    },
    'voice-active-listening': {
      intro: {
        k2: "I'm going to tell you about my weekend, and I want you to practice listening. Ready?",
        '3-5': "I'm about to share something exciting that happened to me. Let's practice how you listen and respond.",
        '6-8': "I'm going to tell you about a problem I'm having. Let's practice how you listen and show you understand.",
        '9-12': "I'm about to share a concern I have. Let's practice how you listen actively and respond thoughtfully."
      },
      practice: {
        default: {
          k2: "Good listening! Can you tell me what you heard?",
          '3-5': "Great job listening! What questions do you have?",
          '6-8': "You're listening well! What would you like to know more about?",
          '9-12': "I appreciate your attention. What are your thoughts on what I shared?"
        }
      }
    },
    'voice-joining-groups': {
      intro: {
        k2: "I'm playing a game with my friends at recess. You want to play too! How would you ask?",
        '3-5': "I'm working on a project with some classmates. You'd like to join our group. How would you ask?",
        '6-8': "I'm in a conversation with friends about a movie we saw. You saw it too and want to join. How would you enter?",
        '9-12': "I'm part of a study group discussing an upcoming test. You'd like to join. How would you approach us?"
      },
      practice: {
        default: {
          k2: "That's a nice way to ask! What would you say next?",
          '3-5': "Good approach! How would you contribute to the group?",
          '6-8': "That's a good way to join. What would you add to the conversation?",
          '9-12': "Good strategy! How would you introduce your perspective?"
        }
      }
    },
    'voice-showing-empathy': {
      intro: {
        k2: "I'm feeling sad because I dropped my snack. Can you help me practice being a good friend?",
        '3-5': "I'm upset about something that happened. Let's practice how you'd respond to help me feel better.",
        '6-8': "I'm going through a tough time. Let's practice how you'd show empathy and support.",
        '9-12': "I'm dealing with a challenging situation. Let's practice how you'd respond with emotional intelligence."
      },
      practice: {
        default: {
          k2: "That's very kind of you! You're being a good friend.",
          '3-5': "That's really thoughtful. How else could you help?",
          '6-8': "You're showing great empathy. What else could you say?",
          '9-12': "That demonstrates good emotional intelligence. How would you continue?"
        }
      }
    },
    'voice-making-plans': {
      intro: {
        k2: "I'm your friend, and we want to play together after school. Let's practice deciding what to do!",
        '3-5': "We're friends and want to hang out this weekend. Let's practice making plans together.",
        '6-8': "We're trying to organize a group activity with friends. Let's practice coordinating everyone.",
        '9-12': "We're planning a group event and need to coordinate everyone's schedules. Let's practice organizing it."
      },
      practice: {
        default: {
          k2: "Good idea! What else could we do?",
          '3-5': "That sounds fun! What time works for you?",
          '6-8': "Good suggestion! How do we make sure everyone can join?",
          '9-12': "That's a solid plan. How do we handle logistics?"
        }
      }
    }
  };

  return responses[scenarioId] || getDefaultScenarioResponses(gradeRange);
}

/**
 * Get default scenario responses
 */
function getDefaultScenarioResponses(gradeRange) {
  return {
    intro: {
      k2: "Hi! Let's practice together!",
      '3-5': "Hello! I'm here to help you practice. Ready to start?",
      '6-8': "Hey! Let's practice this scenario together. Are you ready?",
      '9-12': "Hello! I'm here to help you practice this scenario. Shall we begin?"
    }[gradeRange],
    practice: {
      default: {
        k2: "That's great! Tell me more!",
        '3-5': "Good job! What else would you say?",
        '6-8': "That's a good response. How would you continue?",
        '9-12': "That's thoughtful. What would you add to that?"
      }[gradeRange]
    }
  };
}

/**
 * Get default intro message
 */
function getDefaultIntro(gradeRange) {
  const intros = {
    k2: "Hi! I'm Cue, your practice friend. Let's practice talking together!",
    '3-5': "Hello! I'm Cue, your practice partner. I'm excited to help you practice!",
    '6-8': "Hey! I'm Cue, your practice coach. Let's work on this scenario together.",
    '9-12': "Hello! I'm Cue, your practice partner. I'm here to help you develop your skills."
  };
  return intros[gradeRange] || intros['6-8'];
}

/**
 * Get default greeting response
 */
function getDefaultGreetingResponse(gradeRange) {
  const responses = {
    k2: "Hi! Nice to meet you! What's your name?",
    '3-5': "Hello! I'm glad you said hi. Tell me about yourself.",
    '6-8': "Hey! Thanks for the greeting. How can I help you practice today?",
    '9-12': "Hello! Good to meet you. What would you like to work on?"
  };
  return responses[gradeRange] || responses['6-8'];
}

/**
 * Get default question response
 */
function getDefaultQuestionResponse(gradeRange) {
  const responses = {
    k2: "That's a good question! Let me think...",
    '3-5': "I like that you're asking questions! That's a great way to learn.",
    '6-8': "Good question! That shows you're thinking about this carefully.",
    '9-12': "That's an insightful question. It shows you're engaged in the conversation."
  };
  return responses[gradeRange] || responses['6-8'];
}

/**
 * Get default encouragement
 */
function getDefaultEncouragement(gradeRange) {
  const responses = {
    k2: "You're doing great! Try saying a bit more.",
    '3-5': "That's a good start! Can you tell me more?",
    '6-8': "You're on the right track! What else would you say?",
    '9-12': "Good foundation. How would you elaborate on that?"
  };
  return responses[gradeRange] || responses['6-8'];
}

/**
 * Get default support response
 */
function getDefaultSupportResponse(gradeRange) {
  const responses = {
    k2: "That's okay! Take your time. What do you want to say?",
    '3-5': "No worries! Everyone gets nervous sometimes. What were you thinking?",
    '6-8': "It's normal to hesitate. Think about what you want to communicate.",
    '9-12': "Take your time to formulate your thoughts. What would you like to express?"
  };
  return responses[gradeRange] || responses['6-8'];
}

/**
 * Get default follow-up response
 */
function getDefaultFollowUp(gradeRange, exchangeNum) {
  const responses = {
    1: {
      k2: "That's great! What else would you like to talk about?",
      '3-5': "Good! Let's keep the conversation going. What else can you share?",
      '6-8': "Nice! You're doing well. What would you like to explore next?",
      '9-12': "Good progress. What aspect would you like to discuss further?"
    },
    2: {
      k2: "You're doing awesome! Keep going!",
      '3-5': "You're getting better at this! What else would you say?",
      '6-8': "You're handling this well. How would you continue?",
      '9-12': "You're demonstrating good skills. How would you take this further?"
    },
    3: {
      k2: "You're such a good talker! Almost done!",
      '3-5': "Excellent work! You're almost finished with this practice.",
      '6-8': "You're doing great! We're wrapping up soon.",
      '9-12': "Strong performance! We're nearing the end of this practice session."
    }
  };

  return responses[exchangeNum]?.[gradeRange] || getDefaultResponse(gradeRange);
}

/**
 * Get default response
 */
function getDefaultResponse(gradeRange) {
  const responses = {
    k2: "That's interesting! Tell me more!",
    '3-5': "That's a good point! What else would you say?",
    '6-8': "That's thoughtful! How would you continue this conversation?",
    '9-12': "That's insightful. How would you build on that?"
  };
  return responses[gradeRange] || responses['6-8'];
}

/**
 * Generate feedback message
 */
function generateFeedback(gradeRange, exchangeCount) {
  const feedbacks = {
    k2: `Great job practicing! You did ${exchangeCount} exchanges and you're getting better at talking! Keep practicing and you'll become even better!`,
    '3-5': `Excellent work! You completed ${exchangeCount} exchanges and showed good conversation skills. One thing to try next time is asking more questions. Keep practicing!`,
    '6-8': `You did really well! You completed ${exchangeCount} exchanges and showed strong communication skills. One thing to practice more is listening actively before responding. Great job overall!`,
    '9-12': `Outstanding performance! You completed ${exchangeCount} exchanges and demonstrated excellent social skills. Consider working on reading subtle social cues. Overall, you're developing strong interpersonal skills!`
  };
  return feedbacks[gradeRange] || feedbacks['6-8'];
}

/**
 * Get completion message
 */
function getCompletionMessage(gradeRange) {
  const messages = {
    k2: "You finished! Great job practicing! Want to try another scenario?",
    '3-5': "Session complete! You did awesome! Ready to try another scenario?",
    '6-8': "Practice session complete! Excellent work! Would you like to try another scenario?",
    '9-12': "Session complete! Outstanding performance! Ready to challenge yourself with another scenario?"
  };
  return messages[gradeRange] || messages['6-8'];
}

export default {
  generateMockResponse,
  getGradeRange
};


// Voice Testing Configuration
// This file contains test configurations and scenarios for the voice practice feature

export const voiceTestConfig = {
  // Test scenarios for different use cases
  scenarios: [
    {
      id: 'happy-path',
      name: 'Happy Path',
      description: 'Smooth conversation flow with expected responses',
      script: [
        { role: 'user', text: 'Hi, I want to practice small talk' },
        { role: 'ai', text: 'Great! Let\'s start with a simple scenario. You\'re at a school event and someone approaches you.' },
        { role: 'user', text: 'Okay, I\'m ready' },
        { role: 'ai', text: 'They say "Hi, how are you doing?" How would you respond?' },
        { role: 'user', text: 'I\'m doing well, thanks for asking' },
        { role: 'ai', text: 'Good response! Now they ask about your favorite subject. What would you say?' }
      ],
      expectedOutcomes: [
        'AI provides clear instructions',
        'AI gives positive feedback',
        'AI continues the conversation naturally'
      ]
    },
    {
      id: 'user-confusion',
      name: 'User Confusion',
      description: 'User gets stuck or confused during conversation',
      script: [
        { role: 'user', text: 'I don\'t understand what to do' },
        { role: 'ai', text: 'Let me explain that differently. You\'re practicing how to start conversations.' },
        { role: 'user', text: 'Still confused' },
        { role: 'ai', text: 'Let\'s try a different approach. Imagine you\'re at lunch and want to talk to someone new.' },
        { role: 'user', text: 'Oh, I see now' },
        { role: 'ai', text: 'Perfect! Now what would you say to start a conversation?' }
      ],
      expectedOutcomes: [
        'AI provides alternative explanations',
        'AI uses simpler language',
        'AI offers different scenarios'
      ]
    },
    {
      id: 'speech-errors',
      name: 'Speech Recognition Errors',
      description: 'Test handling of speech recognition failures',
      script: [
        { role: 'user', text: 'mumbled speech' },
        { role: 'ai', text: 'I didn\'t catch that. Could you repeat what you said?' },
        { role: 'user', text: 'background noise' },
        { role: 'ai', text: 'I\'m having trouble hearing you clearly. Could you speak a bit louder?' },
        { role: 'user', text: 'clear speech now' },
        { role: 'ai', text: 'Much better! Now I can hear you clearly.' }
      ],
      expectedOutcomes: [
        'AI asks for clarification',
        'AI provides helpful suggestions',
        'AI acknowledges improved speech'
      ]
    },
    {
      id: 'api-failures',
      name: 'API Failures',
      description: 'Test API error handling and recovery',
      script: [
        { role: 'user', text: 'Test API failure' },
        { role: 'ai', text: 'Error: API timeout. Let me try again.' },
        { role: 'user', text: 'Try again' },
        { role: 'ai', text: 'Error: Rate limit exceeded. Please wait a moment.' },
        { role: 'user', text: 'Okay' },
        { role: 'ai', text: 'Great! The system is working again. Let\'s continue.' }
      ],
      expectedOutcomes: [
        'AI handles errors gracefully',
        'AI provides clear error messages',
        'AI recovers from failures'
      ]
    },
    {
      id: 'grade-level-3',
      name: 'Grade 3 Level',
      description: 'Test age-appropriate content for younger students',
      script: [
        { role: 'user', text: 'I\'m in third grade' },
        { role: 'ai', text: 'Great! Let\'s practice talking with friends at school.' },
        { role: 'user', text: 'Okay' },
        { role: 'ai', text: 'You\'re at recess and want to play with someone. What would you say?' },
        { role: 'user', text: 'Can I play too?' },
        { role: 'ai', text: 'Perfect! That\'s a great way to ask to join.' }
      ],
      expectedOutcomes: [
        'AI uses simple language',
        'AI provides age-appropriate scenarios',
        'AI gives positive reinforcement'
      ]
    },
    {
      id: 'grade-level-8',
      name: 'Grade 8 Level',
      description: 'Test more complex scenarios for older students',
      script: [
        { role: 'user', text: 'I\'m in eighth grade' },
        { role: 'ai', text: 'Excellent! Let\'s practice more advanced social situations.' },
        { role: 'user', text: 'Like what?' },
        { role: 'ai', text: 'How about handling group projects or dealing with peer pressure?' },
        { role: 'user', text: 'Group projects sound good' },
        { role: 'ai', text: 'Great choice! You\'re assigned to a group with people you don\'t know well. How do you start working together?' }
      ],
      expectedOutcomes: [
        'AI offers complex scenarios',
        'AI uses appropriate vocabulary',
        'AI challenges the user appropriately'
      ]
    }
  ],

  // Performance test configurations
  performanceTests: [
    {
      name: 'API Latency Test',
      description: 'Test response times for API calls',
      iterations: 10,
      endpoints: [
        '/api/health',
        '/api/voice/conversation',
        '/api/adaptive/mastery-dashboard'
      ],
      expectedMaxLatency: 2000, // 2 seconds
      expectedSuccessRate: 0.95 // 95%
    },
    {
      name: 'Speech Recognition Test',
      description: 'Test speech recognition accuracy and speed',
      iterations: 5,
      testPhrases: [
        'Hello, how are you?',
        'I want to practice social skills',
        'Can you help me with conversation?',
        'What should I say in this situation?',
        'Thank you for the help'
      ],
      expectedAccuracy: 0.8, // 80%
      expectedMaxLatency: 3000 // 3 seconds
    },
    {
      name: 'Voice Output Test',
      description: 'Test voice synthesis quality and speed',
      iterations: 5,
      testTexts: [
        'Welcome to voice practice!',
        'Let\'s start with a simple conversation.',
        'Great job! You\'re doing well.',
        'Try saying that again, but louder.',
        'Perfect! You\'ve completed this lesson.'
      ],
      expectedMaxLatency: 5000, // 5 seconds
      expectedSuccessRate: 0.9 // 90%
    }
  ],

  // Error simulation configurations
  errorSimulations: [
    {
      name: 'Network Timeout',
      description: 'Simulate network timeouts',
      delay: 10000, // 10 seconds
      probability: 0.1 // 10% chance
    },
    {
      name: 'API Rate Limit',
      description: 'Simulate API rate limiting',
      delay: 5000, // 5 seconds
      probability: 0.05 // 5% chance
    },
    {
      name: 'Speech Recognition Error',
      description: 'Simulate speech recognition failures',
      delay: 2000, // 2 seconds
      probability: 0.15 // 15% chance
    },
    {
      name: 'Voice Output Error',
      description: 'Simulate voice synthesis failures',
      delay: 3000, // 3 seconds
      probability: 0.08 // 8% chance
    }
  ],

  // Test data for different scenarios
  testData: {
    users: [
      {
        id: 'test-user-1',
        name: 'Test User 1',
        grade: 5,
        preferences: {
          voiceGender: 'female',
          difficulty: 'medium'
        }
      },
      {
        id: 'test-user-2',
        name: 'Test User 2',
        grade: 8,
        preferences: {
          voiceGender: 'male',
          difficulty: 'hard'
        }
      }
    ],
    conversations: [
      {
        id: 'test-conversation-1',
        topic: 'small-talk',
        difficulty: 'easy',
        messages: [
          { role: 'user', text: 'Hi there' },
          { role: 'ai', text: 'Hello! How are you today?' }
        ]
      }
    ]
  },

  // Test assertions and validations
  assertions: {
    conversationFlow: [
      'AI responds within 3 seconds',
      'AI provides helpful feedback',
      'AI maintains appropriate tone',
      'AI handles user confusion gracefully'
    ],
    speechRecognition: [
      'Recognizes speech within 2 seconds',
      'Achieves at least 80% accuracy',
      'Handles background noise',
      'Provides confidence scores'
    ],
    voiceOutput: [
      'Plays audio within 5 seconds',
      'Uses correct voice gender',
      'Maintains consistent quality',
      'Handles text length variations'
    ],
    errorHandling: [
      'Displays clear error messages',
      'Provides recovery options',
      'Maintains user experience',
      'Logs errors appropriately'
    ]
  }
};

// Test utility functions
export const testUtils = {
  // Generate random test data
  generateRandomText: (length = 50) => {
    const words = ['hello', 'world', 'test', 'voice', 'practice', 'social', 'skills', 'conversation', 'help', 'learn'];
    let result = '';
    for (let i = 0; i < length; i++) {
      result += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return result.trim();
  },

  // Simulate network delay
  simulateDelay: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Generate test user
  generateTestUser: (grade = 5) => {
    return {
      id: `test-user-${Date.now()}`,
      name: `Test User ${grade}`,
      grade: grade,
      preferences: {
        voiceGender: Math.random() > 0.5 ? 'female' : 'male',
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
      }
    };
  },

  // Validate test results
  validateTestResult: (result, expectedOutcomes) => {
    const validation = {
      passed: true,
      errors: [],
      warnings: []
    };

    expectedOutcomes.forEach(outcome => {
      if (!result.outcomes.includes(outcome)) {
        validation.passed = false;
        validation.errors.push(`Missing expected outcome: ${outcome}`);
      }
    });

    if (result.duration > 30000) { // 30 seconds
      validation.warnings.push('Test took longer than expected');
    }

    if (result.errors.length > 0) {
      validation.passed = false;
      validation.errors.push(`Test had ${result.errors.length} errors`);
    }

    return validation;
  }
};

export default voiceTestConfig;

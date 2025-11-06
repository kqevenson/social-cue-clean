/**
 * Voice Practice Scenarios Database
 * 
 * Comprehensive database of scenarios for voice-based social skills practice.
 * Each scenario includes grade-appropriate variations for K-12 students.
 * 
 * @module voicePracticeScenarios
 */

const scenarios = [
  // ============================================================================
  // 1. STARTING CONVERSATIONS
  // ============================================================================
  {
    id: 'voice-starting-conversations',
    title: {
      'k2': 'Saying Hello to a New Friend',
      '3-5': 'Starting a Conversation',
      '6-8': 'Initiating Social Interactions',
      '9-12': 'Networking and Introductions'
    },
    description: {
      'k2': 'Practice saying hello and starting to talk with someone new.',
      '3-5': 'Learn how to begin conversations with classmates and peers.',
      '6-8': 'Practice initiating conversations in different social settings.',
      '9-12': 'Develop skills for networking and making professional introductions.'
    },
    category: 'conversation-starters',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'beginner',
    estimatedDuration: 5,
    icon: '👋',
    learningObjectives: {
      'k2': ['Say hello in a friendly way', 'Introduce yourself', 'Ask a simple question'],
      '3-5': ['Start conversations with appropriate greetings', 'Find common interests', 'Ask open-ended questions'],
      '6-8': ['Initiate conversations confidently', 'Read social cues', 'Maintain conversation flow'],
      '9-12': ['Network effectively', 'Make professional introductions', 'Build rapport quickly']
    },
    setupPrompt: {
      'k2': "Hi! I'm a new student in your class. I don't know anyone yet. Can you help me practice how to say hello?",
      '3-5': "I'm someone you see at school but haven't talked to before. Let's practice how you might start a conversation with me.",
      '6-8': "I'm a student from another grade who's at your lunch table. Let's practice how you'd introduce yourself.",
      '9-12': "I'm at a club fair, and you're interested in joining the same club I'm part of. Let's practice how you'd introduce yourself."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 2. ACTIVE LISTENING
  // ============================================================================
  {
    id: 'voice-active-listening',
    title: {
      'k2': 'Listening to Your Friend',
      '3-5': 'Paying Attention',
      '6-8': 'Active Listening Skills',
      '9-12': 'Deep Listening and Understanding'
    },
    description: {
      'k2': 'Practice listening carefully when someone talks to you.',
      '3-5': 'Learn to show you\'re listening and ask good questions.',
      '6-8': 'Develop active listening skills for better conversations.',
      '9-12': 'Master listening techniques for meaningful connections.'
    },
    category: 'active-listening',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'beginner',
    estimatedDuration: 6,
    icon: '👂',
    learningObjectives: {
      'k2': ['Look at the speaker', 'Stay quiet when others talk', 'Remember what was said'],
      '3-5': ['Make eye contact', 'Ask follow-up questions', 'Show you understand'],
      '6-8': ['Paraphrase what you heard', 'Ask clarifying questions', 'Show empathy'],
      '9-12': ['Demonstrate understanding', 'Ask insightful questions', 'Validate emotions']
    },
    setupPrompt: {
      'k2': "I'm going to tell you about my weekend, and I want you to practice listening. Ready?",
      '3-5': "I'm about to share something exciting that happened to me. Let's practice how you listen and respond.",
      '6-8': "I'm going to tell you about a problem I'm having. Let's practice how you listen and show you understand.",
      '9-12': "I'm about to share a concern I have. Let's practice how you listen actively and respond thoughtfully."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 3. JOINING GROUPS
  // ============================================================================
  {
    id: 'voice-joining-groups',
    title: {
      'k2': 'Asking to Play',
      '3-5': 'Joining a Group',
      '6-8': 'Entering Group Conversations',
      '9-12': 'Integrating into Existing Groups'
    },
    description: {
      'k2': 'Practice asking nicely if you can join a game or activity.',
      '3-5': 'Learn how to ask to join a group without interrupting.',
      '6-8': 'Practice joining group conversations smoothly.',
      '9-12': 'Develop skills for entering established social groups.'
    },
    category: 'group-interaction',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'intermediate',
    estimatedDuration: 7,
    icon: '👥',
    learningObjectives: {
      'k2': ['Ask permission to join', 'Wait for your turn', 'Say thank you'],
      '3-5': ['Observe the group first', 'Ask to join politely', 'Find your place in the group'],
      '6-8': ['Read group dynamics', 'Timing your entry', 'Adding value to conversations'],
      '9-12': ['Assess group dynamics', 'Make natural introductions', 'Build connections within groups']
    },
    setupPrompt: {
      'k2': "I'm playing a game with my friends at recess. You want to play too! How would you ask?",
      '3-5': "I'm working on a project with some classmates. You'd like to join our group. How would you ask?",
      '6-8': "I'm in a conversation with friends about a movie we saw. You saw it too and want to join. How would you enter?",
      '9-12': "I'm part of a study group discussing an upcoming test. You'd like to join. How would you approach us?"
    },
    characterRole: 'peer-group'
  },

  // ============================================================================
  // 4. HANDLING DISAGREEMENT
  // ============================================================================
  {
    id: 'voice-handling-disagreement',
    title: {
      '3-5': 'Disagreeing Nicely',
      '6-8': 'Handling Disagreements',
      '9-12': 'Respectful Disagreement'
    },
    description: {
      '3-5': 'Learn how to disagree without being mean.',
      '6-8': 'Practice handling disagreements respectfully.',
      '9-12': 'Develop skills for productive disagreement and debate.'
    },
    category: 'conflict-resolution',
    gradeRanges: ['3-5', '6-8', '9-12'],
    difficulty: 'advanced',
    estimatedDuration: 8,
    icon: '🤝',
    learningObjectives: {
      '3-5': ['Say "I think differently" politely', 'Explain your idea', 'Listen to others'],
      '6-8': ['Respect others\' opinions', 'Express disagreement calmly', 'Find common ground'],
      '9-12': ['Disagree respectfully', 'Present counterarguments', 'Seek understanding']
    },
    setupPrompt: {
      '3-5': "I think the best way to solve this problem is one way, but you think it should be done differently. Let's practice how you'd tell me your idea.",
      '6-8': "We're discussing a group project approach, and I have a different idea than you. Let's practice how you'd express your disagreement.",
      '9-12': "We're debating a topic in class, and I have a different perspective. Let's practice how you'd respectfully present your counterargument."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 5. MAKING PLANS
  // ============================================================================
  {
    id: 'voice-making-plans',
    title: {
      'k2': 'Planning Playtime',
      '3-5': 'Making Plans Together',
      '6-8': 'Coordinating Activities',
      '9-12': 'Organizing Group Events'
    },
    description: {
      'k2': 'Practice deciding what to do together with a friend.',
      '3-5': 'Learn how to make plans that work for everyone.',
      '6-8': 'Practice coordinating activities with friends.',
      '9-12': 'Develop skills for organizing group events.'
    },
    category: 'social-planning',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'intermediate',
    estimatedDuration: 6,
    icon: '📅',
    learningObjectives: {
      'k2': ['Suggest activities', 'Listen to friend\'s ideas', 'Agree on what to do'],
      '3-5': ['Share ideas', 'Consider others\' preferences', 'Compromise'],
      '6-8': ['Propose options', 'Negotiate schedules', 'Confirm plans'],
      '9-12': ['Facilitate group decisions', 'Manage logistics', 'Ensure inclusion']
    },
    setupPrompt: {
      'k2': "I'm your friend, and we want to play together after school. Let's practice deciding what to do!",
      '3-5': "We're friends and want to hang out this weekend. Let's practice making plans together.",
      '6-8': "We're trying to organize a group activity with friends. Let's practice coordinating everyone.",
      '9-12': "We're planning a group event and need to coordinate everyone's schedules. Let's practice organizing it."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 6. SHOWING EMPATHY
  // ============================================================================
  {
    id: 'voice-showing-empathy',
    title: {
      'k2': 'Being a Good Friend',
      '3-5': 'Understanding Feelings',
      '6-8': 'Showing Empathy',
      '9-12': 'Emotional Intelligence'
    },
    description: {
      'k2': 'Practice noticing when someone feels sad and being kind.',
      '3-5': 'Learn how to understand and respond to others\' feelings.',
      '6-8': 'Practice showing empathy and emotional support.',
      '9-12': 'Develop emotional intelligence and supportive communication.'
    },
    category: 'empathy',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'intermediate',
    estimatedDuration: 7,
    icon: '❤️',
    learningObjectives: {
      'k2': ['Notice when someone is sad', 'Say kind words', 'Offer help'],
      '3-5': ['Recognize emotions', 'Ask how someone feels', 'Show you care'],
      '6-8': ['Identify emotions', 'Validate feelings', 'Offer support'],
      '9-12': ['Understand emotional states', 'Respond appropriately', 'Provide meaningful support']
    },
    setupPrompt: {
      'k2': "I'm feeling sad because I dropped my snack. Can you help me practice being a good friend?",
      '3-5': "I'm upset about something that happened. Let's practice how you'd respond to help me feel better.",
      '6-8': "I'm going through a tough time. Let's practice how you'd show empathy and support.",
      '9-12': "I'm dealing with a challenging situation. Let's practice how you'd respond with emotional intelligence."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 7. ASKING FOR HELP
  // ============================================================================
  {
    id: 'voice-asking-for-help',
    title: {
      'k2': 'Getting Help',
      '3-5': 'Asking for Help',
      '6-8': 'Requesting Assistance',
      '9-12': 'Seeking Support'
    },
    description: {
      'k2': 'Practice asking a grown-up or friend for help when you need it.',
      '3-5': 'Learn how to ask for help politely and clearly.',
      '6-8': 'Practice asking for help in different situations.',
      '9-12': 'Develop skills for seeking help appropriately.'
    },
    category: 'self-advocacy',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'beginner',
    estimatedDuration: 5,
    icon: '🙋',
    learningObjectives: {
      'k2': ['Know when to ask for help', 'Ask politely', 'Say thank you'],
      '3-5': ['Identify when help is needed', 'Explain what you need', 'Be specific'],
      '6-8': ['Assess when to ask for help', 'Communicate clearly', 'Express gratitude'],
      '9-12': ['Recognize when help is needed', 'Articulate needs clearly', 'Appreciate assistance']
    },
    setupPrompt: {
      'k2': "I'm your teacher. You're having trouble with something. Let's practice how you'd ask me for help.",
      '3-5': "I'm your teacher, and you need help with your work. Let's practice how you'd ask politely.",
      '6-8': "I'm your teacher, and you're struggling with an assignment. Let's practice how you'd request help.",
      '9-12': "I'm your teacher, and you need academic support. Let's practice how you'd seek help professionally."
    },
    characterRole: 'teacher'
  },

  // ============================================================================
  // 8. HANDLING TEASING
  // ============================================================================
  {
    id: 'voice-handling-teasing',
    title: {
      '3-5': 'Dealing with Teasing',
      '6-8': 'Responding to Teasing',
      '9-12': 'Handling Banter and Teasing'
    },
    description: {
      '3-5': 'Learn how to respond when someone teases you.',
      '6-8': 'Practice handling teasing in a confident way.',
      '9-12': 'Develop skills for managing banter and playful teasing.'
    },
    category: 'conflict-resolution',
    gradeRanges: ['3-5', '6-8', '9-12'],
    difficulty: 'advanced',
    estimatedDuration: 8,
    icon: '🛡️',
    learningObjectives: {
      '3-5': ['Stay calm', 'Ask them to stop', 'Get help if needed'],
      '6-8': ['Assess the situation', 'Respond confidently', 'Set boundaries'],
      '9-12': ['Distinguish playful vs harmful', 'Respond appropriately', 'Maintain self-respect']
    },
    setupPrompt: {
      '3-5': "I'm teasing you about something. Let's practice how you'd respond in a good way.",
      '6-8': "I'm making a teasing comment. Let's practice how you'd handle it confidently.",
      '9-12': "I'm engaging in playful banter. Let's practice how you'd respond appropriately."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 9. INTRODUCING YOURSELF
  // ============================================================================
  {
    id: 'voice-introducing-yourself',
    title: {
      'k2': 'Telling Someone Your Name',
      '3-5': 'Introducing Yourself',
      '6-8': 'Making Introductions',
      '9-12': 'Professional Introductions'
    },
    description: {
      'k2': 'Practice saying your name and learning someone else\'s name.',
      '3-5': 'Learn how to introduce yourself to new people.',
      '6-8': 'Practice making introductions in different settings.',
      '9-12': 'Develop professional introduction skills.'
    },
    category: 'conversation-starters',
    gradeRanges: ['k2', '3-5', '6-8', '9-12'],
    difficulty: 'beginner',
    estimatedDuration: 5,
    icon: '👤',
    learningObjectives: {
      'k2': ['Say your name clearly', 'Learn their name', 'Say nice to meet you'],
      '3-5': ['Share your name and grade', 'Ask their name', 'Remember names'],
      '6-8': ['Make confident introductions', 'Share relevant information', 'Remember details'],
      '9-12': ['Professional introductions', 'Share appropriate background', 'Build connections']
    },
    setupPrompt: {
      'k2': "Hi! I'm a new student. Let's practice introducing ourselves!",
      '3-5': "I'm someone you're meeting for the first time. Let's practice how you'd introduce yourself.",
      '6-8': "I'm a student from another school visiting. Let's practice how you'd introduce yourself.",
      '9-12': "I'm at a networking event, and you're introducing yourself. Let's practice a professional introduction."
    },
    characterRole: 'peer'
  },

  // ============================================================================
  // 10. SAYING NO / SETTING BOUNDARIES
  // ============================================================================
  {
    id: 'voice-setting-boundaries',
    title: {
      '6-8': 'Saying No Respectfully',
      '9-12': 'Setting Healthy Boundaries'
    },
    description: {
      '6-8': 'Practice saying no in a respectful way.',
      '9-12': 'Develop skills for setting healthy boundaries.'
    },
    category: 'self-advocacy',
    gradeRanges: ['6-8', '9-12'],
    difficulty: 'advanced',
    estimatedDuration: 8,
    icon: '🚫',
    learningObjectives: {
      '6-8': ['Say no politely', 'Explain why', 'Suggest alternatives'],
      '9-12': ['Set clear boundaries', 'Communicate assertively', 'Maintain relationships']
    },
    setupPrompt: {
      '6-8': "I'm asking you to do something you don't want to do. Let's practice how you'd say no respectfully.",
      '9-12': "I'm asking you to do something that crosses your boundaries. Let's practice how you'd set limits respectfully."
    },
    characterRole: 'peer'
  }
];

// ============================================================================
// EXPORT METHODS
// ============================================================================

/**
 * Get scenario by ID
 * @param {string} id - Scenario ID
 * @returns {Object|null} Scenario object or null if not found
 */
function getScenarioById(id) {
  return scenarios.find(scenario => scenario.id === id) || null;
}

/**
 * Get scenarios filtered by grade level
 * @param {string} gradeLevel - Grade level (k2, 3-5, 6-8, 9-12)
 * @returns {Array} Array of scenarios available for the grade level
 */
function getScenariosByGrade(gradeLevel) {
  // Normalize grade level input
  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  
  return scenarios.filter(scenario => 
    scenario.gradeRanges.includes(normalizedGrade)
  );
}

/**
 * Get scenarios filtered by category
 * @param {string} category - Category name
 * @returns {Array} Array of scenarios in the category
 */
function getScenariosByCategory(category) {
  return scenarios.filter(scenario => 
    scenario.category === category
  );
}

/**
 * Get a random scenario for a grade level
 * @param {string} gradeLevel - Grade level (k2, 3-5, 6-8, 9-12)
 * @returns {Object|null} Random scenario or null if none found
 */
function getRandomScenario(gradeLevel) {
  const gradeScenarios = getScenariosByGrade(gradeLevel);
  
  if (gradeScenarios.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * gradeScenarios.length);
  return gradeScenarios[randomIndex];
}

/**
 * Get all available categories
 * @returns {Array} Array of unique category names
 */
function getAllCategories() {
  const categories = [...new Set(scenarios.map(s => s.category))];
  return categories.sort();
}

/**
 * Get all scenarios
 * @returns {Array} Array of all scenarios
 */
function getAllScenarios() {
  return [...scenarios];
}

/**
 * Normalize grade level to standardized format
 * @param {string} gradeLevel - Grade level input
 * @returns {string} Normalized grade level (k2, 3-5, 6-8, 9-12)
 */
function normalizeGradeLevel(gradeLevel) {
  if (!gradeLevel) return '6-8';
  
  const GRADE_LEVEL_MAP = {
    'k': 'k2', 'K': 'k2', '1': 'k2', '2': 'k2', 'K-2': 'k2', 'k2': 'k2',
    '3': '3-5', '4': '3-5', '5': '3-5', '3-5': '3-5',
    '6': '6-8', '7': '6-8', '8': '6-8', '6-8': '6-8',
    '9': '9-12', '10': '9-12', '11': '9-12', '12': '9-12', '9-12': '9-12'
  };
  
  const normalized = String(gradeLevel).trim();
  return GRADE_LEVEL_MAP[normalized] || GRADE_LEVEL_MAP[normalized.toLowerCase()] || '6-8';
}

/**
 * Get scenario data formatted for a specific grade level
 * @param {string} scenarioId - Scenario ID
 * @param {string} gradeLevel - Grade level
 * @returns {Object|null} Grade-specific scenario data or null
 */
function getScenarioForGrade(scenarioId, gradeLevel) {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return null;
  
  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  
  if (!scenario.gradeRanges.includes(normalizedGrade)) {
    return null;
  }
  
  return {
    id: scenario.id,
    title: scenario.title[normalizedGrade],
    description: scenario.description[normalizedGrade],
    category: scenario.category,
    gradeLevel: normalizedGrade,
    difficulty: scenario.difficulty,
    estimatedDuration: scenario.estimatedDuration,
    icon: scenario.icon || '💬',
    learningObjectives: scenario.learningObjectives[normalizedGrade],
    setupPrompt: scenario.setupPrompt[normalizedGrade],
    characterRole: scenario.characterRole
  };
}

// Export default object with methods
export default {
  // Core methods
  getScenarioById,
  getScenariosByGrade,
  getScenariosByCategory,
  getRandomScenario,
  
  // Additional utility methods
  getAllScenarios,
  getAllCategories,
  getScenarioForGrade,
  normalizeGradeLevel,
  
  // Raw data access (for advanced use cases)
  scenarios
};

// Named exports for convenience
export {
  getScenarioById,
  getScenariosByGrade,
  getScenariosByCategory,
  getRandomScenario,
  getAllScenarios,
  getAllCategories,
  getScenarioForGrade,
  normalizeGradeLevel,
  scenarios
};


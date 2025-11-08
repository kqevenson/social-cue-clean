/**
 * STANDALONE Enhanced Content Service - FIXED INTRO REPEATING
 * NO EXTERNAL DEPENDENCIES - Everything built-in!
 */

import responseEvaluationService from './responseEvaluationService.js';

// ==================== BUILT-IN CURRICULUM DATA ====================

const INTRODUCTION_SCRIPTS = {
  'K-2': {
    greeting: "Hi! I'm Cue, and I'm so excited to practice with you today!",
    scenarios: {
      'starting-conversation': {
        intro: "Let's practice saying hello! Can you say hi to me?",
        afterResponse: "Yay! Great job! You said hi! That's so nice! Now let's pretend I'm a new friend at school."
      },
      'making-friends': {
        intro: "Let's practice making new friends! Can you say 'Hi, want to play?'",
        afterResponse: "Wow! That was so friendly! You're doing great! Now I'll be a kid on the playground."
      },
      'paying-attention': {
        intro: "Let's practice being a good listener! When I talk, you look at me and nod. Ready?",
        afterResponse: "Perfect! You looked right at me! That's how we show we're listening! Now let's try it for real."
      }
    }
  },
  '3-5': {
    greeting: "Hey there! I'm Cue, your practice coach!",
    scenarios: {
      'starting-conversation': {
        intro: "Okay! Imagine you see someone new at recess. What could you say to start talking with them?",
        afterResponse: "Nice! That's a friendly way to start. What else could you add to show you're interested? Let me be that new kid for a minute."
      },
      'making-friends': {
        intro: "Picture this: there's a new student in your class. How would you introduce yourself and try to be friends?",
        afterResponse: "Good thinking! You're being friendly and showing interest. Let's try this out - I'll be the new student."
      },
      'paying-attention': {
        intro: "Let's practice being a really good listener. I'm going to tell you about my weekend, and you show me you're paying attention. Ready?",
        afterResponse: "I could tell you were really listening! What did you do to show that? Great! Now let's practice with a real conversation."
      }
    }
  },
  '6-8': {
    greeting: "Hi, I'm Cue.",
    scenarios: {
      'starting-conversation': {
        intro: "Picture this: there's a new student sitting alone at lunch. How would you approach them and start a conversation?",
        afterResponse: "That's a solid opener. It's friendly without being too intense. How would you keep the conversation going? Alright, let's run through this - I'll be the new student."
      },
      'making-friends': {
        intro: "You've noticed someone in your class who seems cool and shares some of your interests. What's your approach for getting to know them better?",
        afterResponse: "Good strategy! You're balancing friendliness with respect for their space. Let's try it out - I'll be that person."
      },
      'paying-attention': {
        intro: "Imagine a friend is telling you about something important that happened to them. How do you show them you're really listening and you care?",
        afterResponse: "Those are great active listening techniques! Which one do you think is most important? Cool! Let's practice - I'll tell you about something that happened."
      }
    }
  },
  '9-12': {
    greeting: "Hi, I'm Cue.",
    scenarios: {
      'starting-conversation': {
        intro: "You notice someone in your class who seems to share your interests. What's your strategy for initiating a conversation?",
        afterResponse: "Thoughtful approach. You're balancing friendliness with respect for their space. What factors would influence your timing and tone? Let's try this - I'll be that person."
      },
      'making-friends': {
        intro: "You want to expand your social circle and there's someone you'd like to get to know better. How do you build that connection authentically?",
        afterResponse: "That shows social intelligence. You're being genuine rather than forced. How would you gauge their receptiveness? Let's run through this scenario."
      },
      'paying-attention': {
        intro: "In a serious conversation, someone is sharing something personal with you. How do you demonstrate empathy and engagement through your listening?",
        afterResponse: "Those are sophisticated listening skills. Which techniques do you find most effective in building trust? Let's practice this - I'll share something with you."
      }
    }
  }
};

const WORD_LIMITS = {
  'K-2': 8,
  '3-5': 12,
  '6-8': 15,
  '9-12': 20
};

const TIMING_RULES = {
  'K-2': {
    helpTimeout: 2000,
    afterResponse: 1000,
    maxTurnLength: 8,
    responseSpeed: 'slow',
    speechRate: 0.85
  },
  '3-5': {
    helpTimeout: 2000,
    afterResponse: 800,
    maxTurnLength: 12,
    responseSpeed: 'moderate',
    speechRate: 0.90
  },
  '6-8': {
    helpTimeout: 2500,
    afterResponse: 500,
    maxTurnLength: 15,
    responseSpeed: 'moderate',
    speechRate: 0.95
  },
  '9-12': {
    helpTimeout: 3000,
    afterResponse: 500,
    maxTurnLength: 20,
    responseSpeed: 'natural',
    speechRate: 1.00
  }
};

// ==================== MAIN SERVICE CLASS ====================

class StandaloneContentService {
  constructor() {
    this.introScripts = INTRODUCTION_SCRIPTS;
    this.wordLimits = WORD_LIMITS;
    this.timingRules = TIMING_RULES;
    this.evaluationService = responseEvaluationService;
  }

  getGradeKey(gradeLevel) {
    const grade = parseInt(gradeLevel) || 6;
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  getWordLimit(gradeLevel) {
    const gradeKey = this.getGradeKey(gradeLevel);
    return this.wordLimits[gradeKey];
  }

  getTimingForGrade(gradeLevel) {
    const gradeKey = this.getGradeKey(gradeLevel);
    return this.timingRules[gradeKey];
  }

  getScenarioKey(scenarioTitle) {
    const titleLower = (scenarioTitle || '').toLowerCase();
    
    if (titleLower.includes('start') && titleLower.includes('conversation')) {
      return 'starting-conversation';
    }
    if (titleLower.includes('making') && titleLower.includes('friend')) {
      return 'making-friends';
    }
    if (titleLower.includes('pay') && titleLower.includes('attention')) {
      return 'paying-attention';
    }
    if (titleLower.includes('ask') && titleLower.includes('help')) {
      return 'asking-help';
    }
    if (titleLower.includes('join') && titleLower.includes('group')) {
      return 'joining-group';
    }
    
    return 'starting-conversation';
  }

  determineNextPhase(currentPhase, exchangeCount) {
    if (currentPhase === 'intro' && exchangeCount >= 1) return 'practice';
    if (currentPhase === 'practice' && exchangeCount >= 5) return 'feedback';
    if (currentPhase === 'feedback') return 'complete';
    return currentPhase;
  }

  generateSystemPrompt(
    gradeLevel,
    scenario,
    elapsedTime,
    isInCharacterMode,
    characterRole,
    characterExchangeCount,
    lessonId,
    currentPhase,
    lastStudentResponse = null,
    conversationHistory = []
  ) {
    const wordLimit = this.getWordLimit(gradeLevel);
    const gradeKey = this.getGradeKey(gradeLevel);
    const scenarioContext = scenario?.context || scenario?.description || 'a social situation';
    const aiRole = characterRole || scenario?.aiRole || 'friend';

    console.log('🎯 Word limit for grade', gradeLevel, ':', wordLimit);
    console.log('📍 Current phase:', currentPhase);
    console.log('🎭 Character mode:', isInCharacterMode);

    // ===== INTRO PHASE - Use curriculum scripts =====
    if (currentPhase === 'intro') {
      console.log('📖 Generating INTRO prompt from curriculum');
      return this.generateIntroPrompt(gradeKey, scenario, aiRole, wordLimit, conversationHistory);
    }

    // ===== PRACTICE PHASE - Evaluate and adapt =====
    let evaluation = null;
    if (lastStudentResponse && currentPhase === 'practice') {
      evaluation = this.evaluationService.evaluateResponse(lastStudentResponse, {
        scenario,
        gradeLevel,
        conversationHistory,
        expectedSkills: scenario?.targetSkills || ['greeting', 'followUpQuestion'],
        previousPerformance: this.extractPreviousPerformance(conversationHistory)
      });
      
      console.log('📊 Student Evaluation:', {
        performance: evaluation.performanceLevel,
        contentScore: evaluation.contentQuality.score.toFixed(2),
        skillsScore: evaluation.socialSkills.score.toFixed(2),
        tone: evaluation.toneAnalysis.confidenceLevel
      });
    }

    if (currentPhase === 'practice') {
      console.log('🎓 Generating PRACTICE prompt with adaptive teaching');
      return this.generatePracticePrompt(
        aiRole,
        scenarioContext,
        gradeKey,
        wordLimit,
        evaluation,
        conversationHistory
      );
    }

    // ===== FEEDBACK PHASE =====
    if (currentPhase === 'feedback') {
      console.log('⭐ Generating FEEDBACK prompt');
      return this.generateFeedbackPrompt(gradeKey, wordLimit, conversationHistory);
    }

    return this.generateIntroPrompt(gradeKey, scenario, aiRole, wordLimit, conversationHistory);
  }

  /**
   * Generate INTRO prompt - FIXED to not repeat!
   */
  generateIntroPrompt(gradeKey, scenario, role, wordLimit, conversationHistory = []) {
    const gradeScripts = this.introScripts[gradeKey];
    
    if (!gradeScripts) {
      return `You're Cue, a friendly coach for ${gradeKey} students. Say: "Hi! Let's practice ${scenario?.title}. I'll be ${role}. Ready?" Keep it under ${wordLimit} words.`;
    }

    const scenarioKey = this.getScenarioKey(scenario?.title || scenario?.category);
    const scenarioScript = gradeScripts.scenarios?.[scenarioKey];
    
    if (scenarioScript) {
      // ✅ FIX: Check conversation history to determine which intro exchange
      const userMessages = conversationHistory.filter(m => m.role === 'user').length;
      
      if (userMessages === 0) {
        // FIRST exchange - use intro question
        console.log('✅ Using curriculum INTRO (1/2) for:', scenarioKey);
        
        return `You are Cue, the Social Cue coach for ${gradeKey} students.

INTRO EXCHANGE 1 of 2 - Ask the opening question:

Say EXACTLY: "${scenarioScript.intro}"

Keep it simple and warm. Wait for their response. Around ${wordLimit} words.`;
      } else {
        // SECOND exchange - use afterResponse
        console.log('✅ Using curriculum AFTER-RESPONSE (2/2) for:', scenarioKey);
        
        return `You are Cue, the Social Cue coach for ${gradeKey} students.

INTRO EXCHANGE 2 of 2 - Give the afterResponse and transition:

Say: "${scenarioScript.afterResponse}"

This prepares them for the practice where you'll become ${role}.

Keep it warm and encouraging. Around ${wordLimit} words.`;
      }
    }
    
    console.log('📝 Using general intro for:', gradeKey);
    return `You are Cue for ${gradeKey} students.

Say: "${gradeScripts.greeting} Let's practice ${scenario?.title}. I'll be ${role}. Ready?"

Keep it simple, warm, under ${wordLimit} words. When they're ready, start practice!`;
  }

  generatePracticePrompt(role, context, gradeKey, wordLimit, evaluation, history) {
    const ageGuidance = this.getAgeGuidance(gradeKey);
    
    let prompt = `You're ${role} teaching conversation skills naturally.

Scenario: ${context}

${ageGuidance}

`;

    if (evaluation) {
      prompt += this.generateTeachingStrategy(evaluation, gradeKey);
    } else {
      prompt += `TEACH THROUGH DIALOGUE:
- When they do well: continue naturally with enthusiasm
- When they struggle: model better responses through your dialogue
- Keep it natural, warm, supportive`;
    }

    prompt += `

Keep responses around ${wordLimit} words. Be encouraging and natural.

After 5-6 exchanges, wrap up: "Great job! You really showed [specific skill]!"`;

    return prompt;
  }

  generateTeachingStrategy(evaluation, gradeKey) {
    const performance = evaluation.performanceLevel;
    
    let strategy = `ADAPTIVE TEACHING (Performance: ${performance}):\n\n`;
    
    if (performance === 'excellent') {
      strategy += `🌟 EXCELLENT!\n`;
      strategy += `- Celebrate enthusiastically: "${evaluation.strengths[0]?.praise || 'Perfect!'}"\n`;
      strategy += `- Continue naturally\n`;
      strategy += `- Slight complexity increase\n`;
    } 
    else if (performance === 'good') {
      strategy += `👍 DOING WELL!\n`;
      strategy += `- Praise: "${evaluation.strengths[0]?.praise || 'Nice!'}"\n`;
      strategy += `- Continue naturally\n`;
      if (evaluation.improvements[0]) {
        strategy += `- Subtly model: ${evaluation.improvements[0].model}\n`;
      }
    }
    else if (performance === 'adequate') {
      strategy += `📚 LEARNING - needs support:\n`;
      strategy += `- Find positive: "${this.findPositive(evaluation)}"\n`;
      strategy += `- Model better version naturally\n`;
      if (evaluation.improvements[0]) {
        strategy += `- Help: ${evaluation.improvements[0].gentle_suggestion}\n`;
        strategy += `- Model: ${evaluation.improvements[0].model}\n`;
      }
    }
    else if (performance === 'needs_support') {
      strategy += `🤝 NEEDS EXTRA SUPPORT:\n`;
      strategy += `- Encourage: "You're doing great! Let me help!"\n`;
      strategy += `- Break into steps\n`;
      strategy += `- Give exact examples\n`;
      strategy += `- Simplify next prompt\n`;
    }
    else {
      strategy += `🆘 STRUGGLING - maximum help:\n`;
      strategy += `- Max encouragement: "It's okay! Everyone learns!"\n`;
      strategy += `- Fill-in-blanks: "Try saying: Hi, my name is ___"\n`;
      strategy += `- Celebrate ANY response\n`;
    }
    
    return strategy;
  }

  generateFeedbackPrompt(gradeKey, wordLimit, history) {
    const strengths = this.analyzeConversation(history);
    
    return `Give specific, warm feedback about what the student did well.

They showed:
${strengths.map(s => `  • ${s}`).join('\n')}

Be enthusiastic and specific. Around ${wordLimit} words. Make them proud!

Example: "You did great! I noticed you [specific thing]. That's exactly how good conversations work!"`;
  }

  getAgeGuidance(gradeKey) {
    const guidance = {
      'K-2': 'Teaching young kids: Simple language, LOTS of encouragement, model clearly, keep playful',
      '3-5': 'Teaching elementary: Clear examples, encourage details, be patient, make it fun',
      '6-8': 'Teaching middle schoolers: Keep cool, not preachy, model naturally, low-pressure',
      '9-12': 'Teaching high schoolers: Mature tone, realistic scenarios, subtle modeling, practical'
    };
    return guidance[gradeKey] || guidance['6-8'];
  }

  analyzeConversation(history) {
    const studentMessages = history.filter(m => m.role === 'user');
    const strengths = [];
    
    if (studentMessages.length >= 5) strengths.push('stayed engaged throughout');
    if (studentMessages.some(m => m.text?.includes('?') || m.content?.includes('?'))) strengths.push('asked questions');
    if (studentMessages.some(m => ((m.text || m.content || '').split(/\s+/).length) > 10)) strengths.push('gave detailed responses');
    if (studentMessages.some(m => /please|thank|sorry/i.test((m.text || m.content || '')))) strengths.push('used polite language');
    
    if (strengths.length === 0) strengths.push('practiced conversation skills');
    
    return strengths;
  }

  extractPreviousPerformance(history) {
    return history
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => ({
        wordCount: (m.text || m.content || '').split(/\s+/).length,
        skillsUsed: []
      }));
  }

  findPositive(evaluation) {
    if (evaluation.strengths.length > 0) return evaluation.strengths[0].praise;
    return "I can see you're trying!";
  }

  getConversationRules(gradeLevel) {
    return {
      maxResponseLength: this.getWordLimit(gradeLevel),
      timing: this.getTimingForGrade(gradeLevel)
    };
  }

  validateResponse(responseText, timing) {
    const wordCount = responseText.trim().split(/\s+/).length;
    const warnings = [];
    const limit = timing?.maxTurnLength || 15;

    if (wordCount > limit * 2) {
      warnings.push(`Response is long (${wordCount} words)`);
    }

    return {
      valid: warnings.length === 0,
      warnings,
      wordCount,
      methodology: 'Adaptive Teaching'
    };
  }

  getHelpPrompt(type = 'gentle') {
    const prompts = [
      "Take your time. What would you like to say?",
      "It's okay to pause and think. Your turn!",
      "Need a hint? Try starting with..."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
}

const standaloneContentService = new StandaloneContentService();
export default standaloneContentService;
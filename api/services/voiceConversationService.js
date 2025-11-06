/**
 * Voice Conversation Service
 * 
 * Backend service for managing AI-powered voice conversations for K-12 social skills practice.
 * Handles conversation initialization, continuation, difficulty assessment, and session management.
 * 
 * @module voiceConversationService
 * @requires openai
 * @requires dotenv
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Grade level mapping to standardized format
 * @type {Object<string, string>}
 */
const GRADE_LEVEL_MAP = {
  'k': 'k2',
  '1': 'k2',
  '2': 'k2',
  'K-2': 'k2',
  'k2': 'k2',
  '3': '3-5',
  '4': '3-5',
  '5': '3-5',
  '3-5': '3-5',
  '6': '6-8',
  '7': '6-8',
  '8': '6-8',
  '6-8': '6-8',
  '9': '9-12',
  '10': '9-12',
  '11': '9-12',
  '12': '9-12',
  '9-12': '9-12'
};

/**
 * Difficulty level descriptions
 * @type {Object<string, Object>}
 */
const DIFFICULTY_LEVELS = {
  easy: {
    level: 1,
    description: 'Simpler scenarios, more guidance, shorter responses',
    temperature: 0.7,
    maxTokens: 100
  },
  moderate: {
    level: 3,
    description: 'Standard scenarios, balanced guidance, normal responses',
    temperature: 0.8,
    maxTokens: 150
  },
  hard: {
    level: 5,
    description: 'Complex scenarios, minimal guidance, longer responses',
    temperature: 0.9,
    maxTokens: 200
  }
};

/**
 * In-memory session store (in production, use Redis or database)
 * @type {Map<string, Object>}
 */
const sessionStore = new Map();

/**
 * Normalize grade level to standardized format
 * @param {string} gradeLevel - Grade level input
 * @returns {string} Normalized grade level (k2, 3-5, 6-8, 9-12)
 */
function normalizeGradeLevel(gradeLevel) {
  if (!gradeLevel) return '6-8'; // Default to middle school
  
  const normalized = String(gradeLevel).trim();
  return GRADE_LEVEL_MAP[normalized] || GRADE_LEVEL_MAP[normalized.toLowerCase()] || '6-8';
}

/**
 * Build age-appropriate system prompt based on grade level and phase
 * @param {string} gradeLevel - Normalized grade level
 * @param {string} phase - Current conversation phase (intro, practice, feedback, complete)
 * @param {string} difficulty - Difficulty level (easy, moderate, hard)
 * @param {string} scenario - Scenario being practiced
 * @returns {string} System prompt for OpenAI
 */
function buildSystemPrompt(gradeLevel, phase, difficulty, scenario) {
  const ageGuidelines = {
    'k2': {
      language: 'Use very simple words and short sentences (3-8 words). Use words that 5-7 year olds understand.',
      tone: 'Warm, encouraging, playful',
      examples: 'Instead of "conversation", say "talking". Instead of "situation", say "what happens".',
      feedback: 'Use simple, positive phrases like "Great job!" or "You did it!"',
      maxSentenceLength: 8
    },
    '3-5': {
      language: 'Use clear, concrete language (5-12 words per sentence). Explain things simply.',
      tone: 'Friendly, supportive, clear',
      examples: 'Use everyday words. Explain feelings in simple terms.',
      feedback: 'Be specific: "I like how you asked about their favorite game!"',
      maxSentenceLength: 12
    },
    '6-8': {
      language: 'Use natural, conversational language (8-15 words per sentence).',
      tone: 'Respectful, encouraging, conversational',
      examples: 'Talk like a friendly teacher or coach. Use normal words.',
      feedback: 'Give detailed feedback: "You showed great listening skills by asking follow-up questions."',
      maxSentenceLength: 15
    },
    '9-12': {
      language: 'Use mature, sophisticated language (10-20 words per sentence).',
      tone: 'Respectful, professional, insightful',
      examples: 'Treat them like young adults. Use appropriate vocabulary.',
      feedback: 'Provide comprehensive feedback: "Your approach demonstrated strong emotional intelligence."',
      maxSentenceLength: 20
    }
  };

  const guidelines = ageGuidelines[gradeLevel] || ageGuidelines['6-8'];
  const difficultyConfig = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.moderate;

  const phaseInstructions = {
    intro: `You are introducing a social skills practice scenario. 
- Explain what the student will practice: "${scenario}"
- Keep it brief and encouraging
- Ask if they're ready to begin
- Use age-appropriate language`,
    
    practice: `You are practicing a social skills scenario with the student: "${scenario}"
- Have a natural back-and-forth conversation
- Respond to what they say
- Give gentle guidance if needed
- Keep responses short (2-3 sentences max)
- Make it feel like a real conversation
- Encourage them to keep practicing`,
    
    feedback: `You are giving feedback on the student's performance in: "${scenario}"
- Give specific, positive feedback
- Mention 2-3 things they did well
- Give one gentle suggestion for improvement
- End with encouragement
- Keep it encouraging and supportive`,
    
    complete: `You are wrapping up the practice session for: "${scenario}"
- Congratulate them on completing the session
- Summarize what they practiced
- Encourage them to try another scenario
- Keep it brief and positive`
  };

  return `You are "Cue", a friendly AI social skills coach helping a ${gradeLevel === 'k2' ? 'kindergarten to 2nd grade' : gradeLevel === '3-5' ? '3rd to 5th grade' : gradeLevel === '6-8' ? '6th to 8th grade' : '9th to 12th grade'} student practice social skills.

AGE-APPROPRIATE GUIDELINES:
- Language: ${guidelines.language}
- Tone: ${guidelines.tone}
- Examples: ${guidelines.examples}
- Feedback style: ${guidelines.feedback}
- Maximum sentence length: ${guidelines.maxSentenceLength} words

CURRENT PHASE: ${phase.toUpperCase()}
${phaseInstructions[phase] || phaseInstructions.practice}

DIFFICULTY LEVEL: ${difficulty} (${difficultyConfig.description})
- Respond at ${difficulty} difficulty level
- ${difficulty === 'easy' ? 'Provide more guidance and support' : difficulty === 'hard' ? 'Provide minimal guidance, let them think independently' : 'Provide balanced guidance'}

CRITICAL RULES:
1. Keep ALL responses to 2-3 sentences maximum (for voice playback)
2. Never use markdown formatting (no *, **, _, etc.)
3. Never use action text (no *smiles*, *nods*, etc.)
4. Use proper punctuation for text-to-speech (periods, exclamation marks, question marks)
5. Be encouraging and supportive
6. Stay focused on the scenario: "${scenario}"
7. Use natural, conversational language appropriate for ${gradeLevel} students
8. If the student seems stuck, offer gentle hints or encouragement
9. Never mention you're an AI - act like a friendly coach
10. Keep responses age-appropriate - no complex vocabulary for younger students

Remember: This is for voice playback, so responses must be concise, clear, and naturally spoken.`;
}

/**
 * Post-process AI response for voice playback
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned response ready for TTS
 */
function postProcessResponse(response) {
  if (!response || typeof response !== 'string') {
    return '';
  }

  let cleaned = response.trim();

  // Remove markdown formatting
  cleaned = cleaned
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/_(.*?)_/g, '$1') // Underline
    .replace(/`(.*?)`/g, '$1') // Code
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/^\s*[-*+]\s+/gm, '') // Bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
    .replace(/\n+/g, ' ') // Multiple newlines
    .replace(/\s+/g, ' '); // Multiple spaces

  // Remove action text (asterisks around actions)
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');

  // Split into sentences and limit to 2-3 sentences
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  const limitedSentences = sentences.slice(0, 3).join(' ').trim();

  // Ensure proper punctuation
  let final = limitedSentences;
  if (!final.match(/[.!?]$/)) {
    final += '.';
  }

  // Clean up any remaining artifacts
  final = final.replace(/\s+/g, ' ').trim();

  return final || "That's interesting! Can you tell me more?";
}

/**
 * Get fallback response based on phase and grade level
 * @param {string} phase - Current phase
 * @param {string} gradeLevel - Normalized grade level
 * @returns {string} Fallback response
 */
function getFallbackResponse(phase, gradeLevel) {
  const fallbacks = {
    intro: {
      k2: "Hi! Let's practice talking together. Are you ready?",
      '3-5': "Hello! I'm here to help you practice social skills. Ready to start?",
      '6-8': "Hi there! I'm excited to practice with you today. Ready to begin?",
      '9-12': "Hello! I'm here to help you practice your social skills. Are you ready to start?"
    },
    practice: {
      k2: "That's great! Can you tell me more?",
      '3-5': "That's interesting! What would you do next?",
      '6-8': "That's a good point! How do you think the other person might respond?",
      '9-12': "That's thoughtful! Can you elaborate on that?"
    },
    feedback: {
      k2: "You did a great job today! Keep practicing!",
      '3-5': "Excellent work! You're learning so much!",
      '6-8': "Great job! You showed good social skills today!",
      '9-12': "Outstanding work! You demonstrated strong social awareness!"
    },
    complete: {
      k2: "All done! Great job practicing!",
      '3-5': "Session complete! You did awesome!",
      '6-8': "Session complete! Excellent work today!",
      '9-12': "Session complete! Outstanding performance!"
    }
  };

  return fallbacks[phase]?.[gradeLevel] || fallbacks.practice['6-8'];
}

/**
 * Start a new conversation session
 * @param {string} userId - User ID
 * @param {string} gradeLevel - Grade level (K-12)
 * @param {string} scenario - Scenario name/topic
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.difficulty='moderate'] - Initial difficulty
 * @param {Object} [options.scenarioDetails={}] - Scenario details
 * @returns {Promise<Object>} Session data
 * 
 * @example
 * const session = await startConversation('user_123', '6', 'Making friends at lunch', {
 *   difficulty: 'moderate',
 *   scenarioDetails: { location: 'school cafeteria' }
 * });
 */
export async function startConversation(userId, gradeLevel, scenario, options = {}) {
  try {
    if (!userId || !gradeLevel || !scenario) {
      throw new Error('Missing required parameters: userId, gradeLevel, scenario');
    }

    const normalizedGrade = normalizeGradeLevel(gradeLevel);
    const difficulty = options.difficulty || 'moderate';
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial AI greeting based on phase
    const systemPrompt = buildSystemPrompt(normalizedGrade, 'intro', difficulty, scenario);
    
    const greetingPrompt = `Generate a brief, friendly greeting for the intro phase. 
Keep it to 2-3 sentences maximum. 
Be warm and encouraging. 
Ask if they're ready to begin practicing "${scenario}".`;

    const greetingResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: greetingPrompt }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    const rawGreeting = greetingResponse.choices[0].message.content;
    const greeting = postProcessResponse(rawGreeting);

    // Store session
    const session = {
      sessionId,
      userId,
      gradeLevel: normalizedGrade,
      scenario,
      scenarioDetails: options.scenarioDetails || {},
      difficulty,
      phase: 'intro',
      conversationHistory: [
        {
          role: 'assistant',
          content: greeting,
          timestamp: new Date().toISOString(),
          phase: 'intro'
        }
      ],
      metrics: {
        totalTokens: greetingResponse.usage?.total_tokens || 0,
        promptTokens: greetingResponse.usage?.prompt_tokens || 0,
        completionTokens: greetingResponse.usage?.completion_tokens || 0,
        cost: calculateCost(greetingResponse.usage, 'gpt-4-turbo-preview')
      },
      exchangeCount: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sessionStore.set(sessionId, session);

    return {
      success: true,
      sessionId,
      greeting,
      phase: 'intro',
      session: {
        sessionId,
        userId,
        gradeLevel: normalizedGrade,
        scenario,
        difficulty
      }
    };

  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    
    const normalizedGrade = normalizeGradeLevel(gradeLevel);
    const fallbackGreeting = getFallbackResponse('intro', normalizedGrade);

    return {
      success: true,
      sessionId: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      greeting: fallbackGreeting,
      phase: 'intro',
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Continue an existing conversation
 * @param {string} sessionId - Session ID
 * @param {string} userMessage - User's message
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.responseTime] - User's response time in ms
 * @param {Object} [options.performance] - Performance metrics
 * @returns {Promise<Object>} AI response and updated session
 * 
 * @example
 * const response = await continueConversation('session_123', 'Hi, can I sit here?', {
 *   responseTime: 2500,
 *   performance: { hesitations: 0, goodResponses: 1 }
 * });
 */
export async function continueConversation(sessionId, userMessage, options = {}) {
  try {
    if (!sessionId || !userMessage) {
      throw new Error('Missing required parameters: sessionId, userMessage');
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString(),
      phase: session.phase,
      responseTime: options.responseTime || null
    });

    session.exchangeCount++;
    session.updatedAt = new Date().toISOString();

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      session.gradeLevel,
      session.phase,
      session.difficulty,
      session.scenario
    );

    // Build conversation context (last 10 messages)
    const recentHistory = session.conversationHistory.slice(-10);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Determine if phase should transition
    const shouldTransition = shouldTransitionPhase(session);

    // Generate AI response
    const difficultyConfig = DIFFICULTY_LEVELS[session.difficulty] || DIFFICULTY_LEVELS.moderate;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      max_tokens: difficultyConfig.maxTokens,
      temperature: difficultyConfig.temperature
    });

    const rawResponse = aiResponse.choices[0].message.content;
    const processedResponse = postProcessResponse(rawResponse);

    // Determine next phase
    let nextPhase = session.phase;
    if (shouldTransition) {
      nextPhase = shouldTransition.nextPhase;
      session.phase = nextPhase;
    }

    // Add AI response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: processedResponse,
      timestamp: new Date().toISOString(),
      phase: session.phase
    });

    // Update metrics
    const tokens = aiResponse.usage?.total_tokens || 0;
    session.metrics.totalTokens += tokens;
    session.metrics.promptTokens += (aiResponse.usage?.prompt_tokens || 0);
    session.metrics.completionTokens += (aiResponse.usage?.completion_tokens || 0);
    session.metrics.cost += calculateCost(aiResponse.usage, 'gpt-4-turbo-preview');

    // Update session
    sessionStore.set(sessionId, session);

    return {
      success: true,
      response: processedResponse,
      phase: session.phase,
      nextPhase,
      shouldContinue: nextPhase !== 'complete',
      sessionId,
      metrics: {
        tokensUsed: tokens,
        totalTokens: session.metrics.totalTokens,
        cost: session.metrics.cost
      }
    };

  } catch (error) {
    console.error('❌ Error continuing conversation:', error);

    const session = sessionStore.get(sessionId);
    const normalizedGrade = session?.gradeLevel || '6-8';
    const fallbackResponse = getFallbackResponse(session?.phase || 'practice', normalizedGrade);

    return {
      success: true,
      response: fallbackResponse,
      phase: session?.phase || 'practice',
      nextPhase: session?.phase || 'practice',
      shouldContinue: true,
      sessionId,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Determine if conversation phase should transition
 * @param {Object} session - Session object
 * @returns {Object|null} Transition info or null
 */
function shouldTransitionPhase(session) {
  const phaseThresholds = {
    intro: {
      minExchanges: 1,
      maxExchanges: 2,
      nextPhase: 'practice'
    },
    practice: {
      minExchanges: 5,
      maxExchanges: 10,
      nextPhase: 'feedback'
    },
    feedback: {
      minExchanges: 1,
      maxExchanges: 2,
      nextPhase: 'complete'
    },
    complete: {
      minExchanges: 0,
      maxExchanges: 0,
      nextPhase: null
    }
  };

  const threshold = phaseThresholds[session.phase];
  if (!threshold || !threshold.nextPhase) {
    return null;
  }

  const exchangeCount = session.exchangeCount;

  if (session.phase === 'intro' && exchangeCount >= threshold.minExchanges) {
    return { shouldTransition: true, nextPhase: threshold.nextPhase };
  }

  if (session.phase === 'practice' && exchangeCount >= threshold.minExchanges) {
    return { shouldTransition: true, nextPhase: threshold.nextPhase };
  }

  if (session.phase === 'feedback') {
    const hasFeedback = session.conversationHistory.some(
      msg => msg.role === 'assistant' && msg.phase === 'feedback'
    );
    if (hasFeedback && exchangeCount >= threshold.minExchanges) {
      return { shouldTransition: true, nextPhase: threshold.nextPhase };
    }
  }

  return null;
}

/**
 * Assess and adjust difficulty level based on user performance
 * @param {string} userMessage - User's message
 * @param {Object} metrics - Performance metrics
 * @param {Object} session - Current session
 * @returns {string} Recommended difficulty level
 * 
 * @example
 * const newDifficulty = assessDifficulty('Hi', {
 *   responseTime: 5000,
 *   hesitations: 2,
 *   helpRequests: 1
 * }, session);
 */
export function assessDifficulty(userMessage, metrics, session) {
  if (!userMessage || !session) {
    return session?.difficulty || 'moderate';
  }

  let score = 50; // Base score

  // Analyze message length (longer = more confident)
  const wordCount = userMessage.trim().split(/\s+/).length;
  if (wordCount >= 10) score += 10;
  else if (wordCount < 5) score -= 10;

  // Analyze response time (faster = more confident)
  if (metrics.responseTime) {
    if (metrics.responseTime < 3000) score += 15;
    else if (metrics.responseTime > 8000) score -= 15;
  }

  // Analyze hesitations
  if (metrics.hesitations) {
    score -= metrics.hesitations * 10;
  }

  // Analyze help requests
  if (metrics.helpRequests) {
    score -= metrics.helpRequests * 15;
  }

  // Analyze good responses
  if (metrics.goodResponses) {
    score += metrics.goodResponses * 5;
  }

  // Determine difficulty
  let newDifficulty = session.difficulty;

  if (score >= 70 && session.difficulty !== 'hard') {
    newDifficulty = session.difficulty === 'easy' ? 'moderate' : 'hard';
  } else if (score <= 30 && session.difficulty !== 'easy') {
    newDifficulty = session.difficulty === 'hard' ? 'moderate' : 'easy';
  }

  // Update session difficulty if changed
  if (newDifficulty !== session.difficulty) {
    session.difficulty = newDifficulty;
    sessionStore.set(session.sessionId, session);
  }

  return newDifficulty;
}

/**
 * End a conversation session and calculate final points
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session summary and points
 * 
 * @example
 * const summary = await endConversation('session_123');
 */
export async function endConversation(sessionId) {
  try {
    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Generate final message if in feedback phase
    if (session.phase !== 'complete') {
      const systemPrompt = buildSystemPrompt(
        session.gradeLevel,
        'complete',
        session.difficulty,
        session.scenario
      );

      const completionPrompt = `Generate a brief completion message. 
Congratulate them on finishing the session. 
Keep it to 2-3 sentences maximum. 
Be encouraging and positive.`;

      const completionResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: completionPrompt }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      const rawCompletion = completionResponse.choices[0].message.content;
      const completion = postProcessResponse(rawCompletion);

      session.conversationHistory.push({
        role: 'assistant',
        content: completion,
        timestamp: new Date().toISOString(),
        phase: 'complete'
      });

      // Update metrics
      const tokens = completionResponse.usage?.total_tokens || 0;
      session.metrics.totalTokens += tokens;
      session.metrics.cost += calculateCost(completionResponse.usage, 'gpt-4-turbo-preview');
    }

    session.phase = 'complete';
    session.completedAt = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    // Calculate points
    const points = calculatePoints(session);

    sessionStore.set(sessionId, session);

    return {
      success: true,
      sessionId,
      summary: {
        sessionId,
        userId: session.userId,
        scenario: session.scenario,
        gradeLevel: session.gradeLevel,
        exchangeCount: session.exchangeCount,
        finalPhase: session.phase,
        pointsEarned: points,
        metrics: session.metrics,
        completedAt: session.completedAt
      },
      completionMessage: session.conversationHistory[session.conversationHistory.length - 1]?.content || ''
    };

  } catch (error) {
    console.error('❌ Error ending conversation:', error);
    return {
      success: false,
      error: error.message,
      sessionId
    };
  }
}

/**
 * Calculate points earned based on session performance
 * @param {Object} session - Session object
 * @returns {number} Points earned
 */
function calculatePoints(session) {
  let points = 0;

  // Base points per exchange
  points += session.exchangeCount * 10;

  // Bonus for completing session
  if (session.phase === 'complete') {
    points += 50;
  }

  // Bonus for difficulty level
  const difficultyBonus = {
    easy: 5,
    moderate: 10,
    hard: 15
  };
  points += difficultyBonus[session.difficulty] || 0;

  // Penalty for excessive tokens (inefficiency)
  const avgTokensPerExchange = session.metrics.totalTokens / Math.max(session.exchangeCount, 1);
  if (avgTokensPerExchange > 500) {
    points -= 10; // Penalty for inefficient responses
  }

  return Math.max(0, Math.round(points));
}

/**
 * Calculate cost based on token usage
 * @param {Object} usage - OpenAI usage object
 * @param {string} model - Model name
 * @returns {number} Cost in USD
 */
function calculateCost(usage, model) {
  if (!usage) return 0;

  // GPT-4 Turbo pricing (as of 2024)
  // These are approximate rates - adjust based on actual OpenAI pricing
  const pricing = {
    'gpt-4-turbo-preview': {
      input: 0.01 / 1000, // $0.01 per 1K tokens
      output: 0.03 / 1000  // $0.03 per 1K tokens
    },
    'gpt-4o-mini': {
      input: 0.00015 / 1000, // $0.00015 per 1K tokens
      output: 0.0006 / 1000   // $0.0006 per 1K tokens
    }
  };

  const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
  const inputCost = (usage.prompt_tokens || 0) * modelPricing.input;
  const outputCost = (usage.completion_tokens || 0) * modelPricing.output;

  return inputCost + outputCost;
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session object or null
 */
export function getSession(sessionId) {
  return sessionStore.get(sessionId) || null;
}

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of session summaries
 */
export function getUserSessions(userId) {
  const sessions = [];
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessions.push({
        sessionId,
        scenario: session.scenario,
        gradeLevel: session.gradeLevel,
        exchangeCount: session.exchangeCount,
        phase: session.phase,
        startedAt: session.startedAt,
        completedAt: session.completedAt
      });
    }
  }
  return sessions;
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @returns {boolean} Success status
 */
export function deleteSession(sessionId) {
  return sessionStore.delete(sessionId);
}

export default {
  startConversation,
  continueConversation,
  endConversation,
  assessDifficulty,
  getSession,
  getUserSessions,
  deleteSession
};


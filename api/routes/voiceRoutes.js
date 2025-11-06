/**
 * Voice Routes - Express API Routes for Voice Chatbot Feature
 * 
 * Handles all voice practice session endpoints including:
 * - Starting conversations
 * - Sending messages
 * - Getting session state
 * - Ending sessions
 * - Getting available scenarios
 * 
 * @module voiceRoutes
 * @requires express
 * @requires voiceConversationService
 * @requires ConversationSession
 */

import express from 'express';
import {
  startConversation,
  continueConversation,
  endConversation,
  assessDifficulty,
  getSession,
  getUserSessions
} from '../services/voiceConversationService.js';
import ConversationSession from '../models/ConversationSession.js';

const router = express.Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Authentication middleware placeholder
 * In production, verify JWT token or session
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const authenticate = (req, res, next) => {
  // TODO: Implement actual authentication
  // For now, we'll accept userId from request body/params
  // In production, verify JWT token from Authorization header
  
  const userId = req.body?.userId || req.params?.userId || req.query?.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide userId.'
    });
  }
  
  // Attach userId to request for use in routes
  req.userId = userId;
  next();
};

/**
 * Rate limiting middleware placeholder
 * In production, use express-rate-limit or Redis-based rate limiting
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const rateLimit = (req, res, next) => {
  // TODO: Implement actual rate limiting
  // Suggested: 100 requests per 15 minutes per userId
  // For now, just pass through
  next();
};

/**
 * Request validation middleware
 * Validates request body/params based on route
 */
const validateRequest = (req, res, next) => {
  const route = req.route?.path || req.path;
  
  // POST /api/voice/start validation
  if (route === '/start' && req.method === 'POST') {
    const { userId, gradeLevel, scenarioId } = req.body;
    
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId. Must be a non-empty string.'
      });
    }
    
    if (!gradeLevel || typeof gradeLevel !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid gradeLevel. Must be a string (e.g., "6", "K-2", "9-12").'
      });
    }
    
    if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scenarioId. Must be a non-empty string.'
      });
    }
    
    // Validate grade level format
    const validGrades = ['k', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
                         'K-2', 'k2', '3-5', '6-8', '9-12'];
    if (!validGrades.includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gradeLevel format. Must be K-12 format (e.g., "6", "K-2", "9-12").'
      });
    }
  }
  
  // POST /api/voice/message validation
  if (route === '/message' && req.method === 'POST') {
    const { sessionId, userMessage } = req.body;
    
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId. Must be a non-empty string.'
      });
    }
    
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid userMessage. Must be a non-empty string.'
      });
    }
    
    // Validate responseTime if provided
    if (req.body.responseTime !== undefined) {
      const responseTime = Number(req.body.responseTime);
      if (isNaN(responseTime) || responseTime < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid responseTime. Must be a non-negative number.'
        });
      }
    }
  }
  
  // GET /api/voice/session/:sessionId validation
  if (route === '/session/:sessionId' && req.method === 'GET') {
    const { sessionId } = req.params;
    
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId in URL parameter.'
      });
    }
  }
  
  // POST /api/voice/end/:sessionId validation
  if (route === '/end/:sessionId' && req.method === 'POST') {
    const { sessionId } = req.params;
    
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId in URL parameter.'
      });
    }
  }
  
  next();
};

// Apply middleware to all routes
router.use(authenticate);
router.use(rateLimit);
router.use(validateRequest);

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/voice/start
 * Start a new voice practice session
 * 
 * @route POST /api/voice/start
 * @body {string} userId - User ID
 * @body {string} gradeLevel - Grade level (K-12 format)
 * @body {string} scenarioId - Scenario ID/name
 * @body {string} [difficulty='moderate'] - Initial difficulty (easy/moderate/hard)
 * @body {Object} [scenarioDetails={}] - Additional scenario details
 * @returns {Object} Session data with sessionId, aiResponse, and phase
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, gradeLevel, scenarioId, difficulty, scenarioDetails } = req.body;
    
    console.log(`🎤 Starting voice session - User: ${userId}, Grade: ${gradeLevel}, Scenario: ${scenarioId}`);
    
    // Get scenario name from scenarioId (in production, fetch from database)
    const scenarioName = getScenarioName(scenarioId);
    
    // Start conversation using service
    const result = await startConversation(
      userId,
      gradeLevel,
      scenarioName,
      {
        difficulty: difficulty || 'moderate',
        scenarioDetails: scenarioDetails || {}
      }
    );
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to start conversation'
      });
    }
    
    // Optionally create ConversationSession instance for additional tracking
    try {
      const session = new ConversationSession({
        userId,
        gradeLevel,
        scenario: scenarioName,
        scenarioDetails: scenarioDetails || {},
        initialDifficulty: difficulty === 'easy' ? 1 : difficulty === 'hard' ? 5 : 3,
        maxTurns: 8
      });
      
      session.start();
      
      // Store session reference
      result.conversationSession = session.sessionId;
    } catch (sessionError) {
      console.warn('Failed to create ConversationSession instance:', sessionError);
      // Continue without ConversationSession - not critical
    }
    
    res.json({
      success: true,
      sessionId: result.sessionId,
      aiResponse: result.greeting,
      phase: result.phase,
      session: result.session
    });
    
  } catch (error) {
    console.error('❌ Error starting voice session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start voice session',
      details: error.message
    });
  }
});

/**
 * POST /api/voice/message
 * Send user message and get AI response
 * 
 * @route POST /api/voice/message
 * @body {string} sessionId - Session ID
 * @body {string} userMessage - User's message
 * @body {number} [responseTime] - User's response time in milliseconds
 * @body {Object} [performance] - Performance metrics
 * @returns {Object} AI response with phase, exchangeCount, difficultyLevel, etc.
 */
router.post('/message', async (req, res) => {
  try {
    const { sessionId, userMessage, responseTime, performance } = req.body;
    
    console.log(`💬 Processing message - Session: ${sessionId}, Message length: ${userMessage.length}`);
    
    // Get session from service
    const serviceSession = getSession(sessionId);
    if (!serviceSession) {
      return res.status(404).json({
        success: false,
        error: 'Session not found. Please start a new session.'
      });
    }
    
    // Continue conversation using service
    const result = await continueConversation(
      sessionId,
      userMessage,
      {
        responseTime,
        performance
      }
    );
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to process message'
      });
    }
    
    // Assess difficulty if performance metrics provided
    let difficultyLevel = serviceSession.difficulty;
    if (performance) {
      difficultyLevel = assessDifficulty(userMessage, performance, serviceSession);
    }
    
    // Calculate points (simplified - in production, use ConversationSession)
    const exchangeCount = serviceSession.exchangeCount || 0;
    const pointsEarned = exchangeCount * 10; // Base points calculation
    
    res.json({
      success: true,
      aiResponse: result.response,
      phase: result.phase,
      nextPhase: result.nextPhase,
      exchangeCount,
      difficultyLevel,
      shouldContinue: result.shouldContinue,
      pointsEarned,
      metrics: result.metrics || {}
    });
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * GET /api/voice/session/:sessionId
 * Get current session state
 * 
 * @route GET /api/voice/session/:sessionId
 * @param {string} sessionId - Session ID
 * @returns {Object} Full session object
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`📊 Getting session state - Session: ${sessionId}`);
    
    // Get session from service
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Optionally load from ConversationSession if available
    let conversationSession = null;
    try {
      conversationSession = ConversationSession.load(sessionId);
    } catch (error) {
      console.warn('ConversationSession not found in localStorage:', error);
    }
    
    // Combine service session data with ConversationSession if available
    const sessionData = {
      ...session,
      conversationSession: conversationSession?.getSummary() || null
    };
    
    res.json({
      success: true,
      session: sessionData
    });
    
  } catch (error) {
    console.error('❌ Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      details: error.message
    });
  }
});

/**
 * POST /api/voice/end/:sessionId
 * End session and save results
 * 
 * @route POST /api/voice/end/:sessionId
 * @param {string} sessionId - Session ID
 * @returns {Object} Session summary with points, performance score, and feedback
 */
router.post('/end/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`🏁 Ending session - Session: ${sessionId}`);
    
    // End conversation using service
    const result = await endConversation(sessionId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to end session'
      });
    }
    
    // Get ConversationSession if available
    let conversationSession = null;
    let performanceScore = 0;
    let feedback = '';
    
    try {
      conversationSession = ConversationSession.load(sessionId);
      if (conversationSession) {
        performanceScore = conversationSession.calculatePerformanceScore();
        feedback = conversationSession.getSummary();
      }
    } catch (error) {
      console.warn('ConversationSession not found:', error);
    }
    
    // Calculate performance score if ConversationSession not available
    if (!performanceScore && result.summary) {
      // Simple performance calculation based on exchange count
      performanceScore = Math.min(100, (result.summary.exchangeCount / 10) * 100);
    }
    
    // Generate feedback message
    if (!feedback && result.completionMessage) {
      feedback = result.completionMessage;
    } else if (!feedback) {
      feedback = 'Great job completing this practice session! Keep practicing to improve your social skills.';
    }
    
    res.json({
      success: true,
      pointsEarned: result.summary?.pointsEarned || 0,
      performanceScore: Math.round(performanceScore),
      feedback,
      summary: {
        ...result.summary,
        performanceScore: Math.round(performanceScore)
      }
    });
    
  } catch (error) {
    console.error('❌ Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session',
      details: error.message
    });
  }
});

/**
 * GET /api/voice/scenarios
 * Get available voice practice scenarios
 * 
 * @route GET /api/voice/scenarios
 * @query {string} [gradeLevel] - Filter by grade level
 * @returns {Array} Array of scenarios filtered by grade
 */
router.get('/scenarios', async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    
    console.log(`📋 Getting scenarios${gradeLevel ? ` for grade ${gradeLevel}` : ''}`);
    
    // Get scenarios (in production, fetch from database)
    const scenarios = getVoiceScenarios(gradeLevel);
    
    res.json({
      success: true,
      scenarios,
      count: scenarios.length
    });
    
  } catch (error) {
    console.error('❌ Error getting scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scenarios',
      details: error.message
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get scenario name from scenario ID
 * In production, fetch from database
 * @param {string} scenarioId - Scenario ID
 * @returns {string} Scenario name
 */
function getScenarioName(scenarioId) {
  // Map scenario IDs to names
  const scenarioMap = {
    '1': 'Making friends at lunch',
    '2': 'Starting a conversation',
    '3': 'Joining a group activity',
    '4': 'Asking for help',
    '5': 'Giving a compliment',
    '6': 'Resolving a conflict',
    '7': 'Working in a team',
    '8': 'Showing empathy',
    '9': 'Being assertive',
    '10': 'Active listening'
  };
  
  return scenarioMap[scenarioId] || scenarioId || 'Social skills practice';
}

/**
 * Get available voice practice scenarios
 * In production, fetch from database with proper filtering
 * @param {string} [gradeLevel] - Grade level filter
 * @returns {Array} Array of scenario objects
 */
function getVoiceScenarios(gradeLevel) {
  // Base scenarios available for voice practice
  const allScenarios = [
    {
      id: '1',
      name: 'Making friends at lunch',
      description: 'Practice starting conversations with classmates',
      gradeLevels: ['k2', '3-5', '6-8', '9-12'],
      difficulty: 'moderate',
      estimatedDuration: '5-8 minutes'
    },
    {
      id: '2',
      name: 'Starting a conversation',
      description: 'Learn how to begin talking with someone new',
      gradeLevels: ['k2', '3-5', '6-8', '9-12'],
      difficulty: 'easy',
      estimatedDuration: '5-8 minutes'
    },
    {
      id: '3',
      name: 'Joining a group activity',
      description: 'Practice asking to join a group',
      gradeLevels: ['3-5', '6-8', '9-12'],
      difficulty: 'moderate',
      estimatedDuration: '6-10 minutes'
    },
    {
      id: '4',
      name: 'Asking for help',
      description: 'Practice politely asking for assistance',
      gradeLevels: ['k2', '3-5', '6-8', '9-12'],
      difficulty: 'easy',
      estimatedDuration: '5-8 minutes'
    },
    {
      id: '5',
      name: 'Giving a compliment',
      description: 'Learn how to give genuine compliments',
      gradeLevels: ['k2', '3-5', '6-8', '9-12'],
      difficulty: 'moderate',
      estimatedDuration: '5-8 minutes'
    },
    {
      id: '6',
      name: 'Resolving a conflict',
      description: 'Practice handling disagreements calmly',
      gradeLevels: ['6-8', '9-12'],
      difficulty: 'hard',
      estimatedDuration: '8-12 minutes'
    },
    {
      id: '7',
      name: 'Working in a team',
      description: 'Practice collaborating with others',
      gradeLevels: ['3-5', '6-8', '9-12'],
      difficulty: 'moderate',
      estimatedDuration: '6-10 minutes'
    },
    {
      id: '8',
      name: 'Showing empathy',
      description: 'Practice understanding and responding to others\' feelings',
      gradeLevels: ['6-8', '9-12'],
      difficulty: 'hard',
      estimatedDuration: '8-12 minutes'
    },
    {
      id: '9',
      name: 'Being assertive',
      description: 'Practice standing up for yourself respectfully',
      gradeLevels: ['9-12'],
      difficulty: 'hard',
      estimatedDuration: '8-12 minutes'
    },
    {
      id: '10',
      name: 'Active listening',
      description: 'Practice listening and responding thoughtfully',
      gradeLevels: ['3-5', '6-8', '9-12'],
      difficulty: 'moderate',
      estimatedDuration: '6-10 minutes'
    }
  ];
  
  // Filter by grade level if provided
  if (gradeLevel) {
    const normalizedGrade = normalizeGradeLevel(gradeLevel);
    return allScenarios.filter(scenario => 
      scenario.gradeLevels.includes(normalizedGrade)
    );
  }
  
  return allScenarios;
}

/**
 * Normalize grade level to standardized format
 * @param {string} gradeLevel - Grade level input
 * @returns {string} Normalized grade level
 */
function normalizeGradeLevel(gradeLevel) {
  const GRADE_LEVEL_MAP = {
    'k': 'k2', '1': 'k2', '2': 'k2', 'K-2': 'k2', 'k2': 'k2',
    '3': '3-5', '4': '3-5', '5': '3-5', '3-5': '3-5',
    '6': '6-8', '7': '6-8', '8': '6-8', '6-8': '6-8',
    '9': '9-12', '10': '9-12', '11': '9-12', '12': '9-12', '9-12': '9-12'
  };
  
  const normalized = String(gradeLevel).trim();
  return GRADE_LEVEL_MAP[normalized] || GRADE_LEVEL_MAP[normalized.toLowerCase()] || '6-8';
}

export default router;


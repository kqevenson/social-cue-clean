/**
 * ConversationSession - State Manager for Voice Practice Sessions
 * 
 * Handles conversation state, performance tracking, phase transitions,
 * and persistence for Social Cue voice practice sessions.
 * 
 * @class ConversationSession
 */

export class ConversationSession {
  /**
   * Create a new conversation session
   * @param {Object} config - Session configuration
   * @param {string} config.userId - User ID
   * @param {string} config.gradeLevel - Grade level (K-12)
   * @param {string} config.scenario - Scenario name/topic
   * @param {Object} config.scenarioDetails - Detailed scenario information
   * @param {number} [config.initialDifficulty=3] - Initial difficulty (1-5)
   * @param {number} [config.maxTurns=8] - Maximum conversation turns
   */
  constructor(config) {
    if (!config.userId || !config.gradeLevel || !config.scenario) {
      throw new Error('ConversationSession requires userId, gradeLevel, and scenario');
    }

    // Session identification
    this.sessionId = this.generateSessionId();
    this.userId = config.userId;
    this.gradeLevel = config.gradeLevel;
    this.scenario = config.scenario;
    this.scenarioDetails = config.scenarioDetails || {};
    
    // Session state
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.startedAt = null;
    this.completedAt = null;
    this.isActive = false;
    
    // Conversation state
    this.currentPhase = 'intro'; // intro | practice | feedback | complete
    this.exchangeCount = 0;
    this.difficultyLevel = config.initialDifficulty || 3; // 1-5 scale
    this.conversationHistory = [];
    this.maxTurns = config.maxTurns || 8;
    
    // Performance metrics
    this.metrics = {
      responseSpeeds: [], // Array of response times in milliseconds
      wordCounts: [], // Array of word counts per user message
      helpRequestsCount: 0,
      goodResponsesCount: 0,
      hesitationCount: 0,
      hintsGiven: 0,
      totalExchanges: 0,
      averageResponseTime: null,
      averageWordCount: null
    };
    
    // Phase transition thresholds
    this.phaseThresholds = {
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
    
    // Points configuration
    this.pointsConfig = {
      basePointsPerExchange: 10,
      goodResponseBonus: 5,
      helpRequestPenalty: -2,
      speedBonus: { // Bonus for fast responses (< 3 seconds)
        threshold: 3000,
        bonus: 2
      },
      qualityBonus: { // Bonus for longer, thoughtful responses (> 10 words)
        threshold: 10,
        bonus: 3
      }
    };
  }

  /**
   * Generate a unique session ID
   * @returns {string} Unique session ID
   */
  generateSessionId() {
    return `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start the conversation session
   */
  start() {
    this.isActive = true;
    this.startedAt = new Date();
    this.updatedAt = new Date();
    this.autoSave();
  }

  /**
   * Add a user message to the conversation history
   * @param {string} content - Message content
   * @param {Object} [metadata={}] - Additional metadata
   */
  addUserMessage(content, metadata = {}) {
    if (!content || typeof content !== 'string') {
      throw new Error('User message content must be a non-empty string');
    }

    const message = {
      id: this.generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      phase: this.currentPhase,
      exchangeNumber: this.exchangeCount + 1,
      wordCount: content.trim().split(/\s+/).length,
      metadata: {
        ...metadata,
        difficultyLevel: this.difficultyLevel
      }
    };

    this.conversationHistory.push(message);
    this.exchangeCount++;
    this.metrics.totalExchanges++;
    this.updatedAt = new Date();
    
    // Track word count
    this.metrics.wordCounts.push(message.wordCount);
    this.updateAverageWordCount();
    
    this.autoSave();
    return message;
  }

  /**
   * Add an AI response to the conversation history
   * @param {string} content - AI response content
   * @param {Object} [metadata={}] - Additional metadata
   */
  addAIMessage(content, metadata = {}) {
    if (!content || typeof content !== 'string') {
      throw new Error('AI message content must be a non-empty string');
    }

    const message = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: content.trim(),
      timestamp: new Date(),
      phase: this.currentPhase,
      exchangeNumber: this.exchangeCount,
      metadata: {
        ...metadata,
        difficultyLevel: this.difficultyLevel
      }
    };

    this.conversationHistory.push(message);
    this.updatedAt = new Date();
    this.autoSave();
    return message;
  }

  /**
   * Update performance metrics based on user message and response time
   * @param {Object} userMessage - User message object
   * @param {number} responseTime - Response time in milliseconds
   * @param {Object} [additionalMetrics={}] - Additional metrics to track
   */
  updateMetrics(userMessage, responseTime, additionalMetrics = {}) {
    if (typeof responseTime !== 'number' || responseTime < 0) {
      console.warn('Invalid response time provided:', responseTime);
      return;
    }

    // Track response speed
    this.metrics.responseSpeeds.push(responseTime);
    this.updateAverageResponseTime();

    // Track word count (already tracked in addUserMessage, but ensure it's updated)
    if (userMessage.wordCount) {
      // Word count already tracked
    }

    // Track help requests
    if (additionalMetrics.isHelpRequest) {
      this.metrics.helpRequestsCount++;
    }

    // Track good responses (based on quality indicators)
    if (additionalMetrics.isGoodResponse) {
      this.metrics.goodResponsesCount++;
    }

    // Track hesitations (long pauses)
    if (responseTime > 5000) { // More than 5 seconds
      this.metrics.hesitationCount++;
    }

    // Track hints given
    if (additionalMetrics.hintGiven) {
      this.metrics.hintsGiven++;
    }

    this.updatedAt = new Date();
    this.autoSave();
  }

  /**
   * Calculate average response time
   */
  updateAverageResponseTime() {
    if (this.metrics.responseSpeeds.length === 0) {
      this.metrics.averageResponseTime = null;
      return;
    }

    const sum = this.metrics.responseSpeeds.reduce((acc, time) => acc + time, 0);
    this.metrics.averageResponseTime = Math.round(sum / this.metrics.responseSpeeds.length);
  }

  /**
   * Calculate average word count
   */
  updateAverageWordCount() {
    if (this.metrics.wordCounts.length === 0) {
      this.metrics.averageWordCount = null;
      return;
    }

    const sum = this.metrics.wordCounts.reduce((acc, count) => acc + count, 0);
    this.metrics.averageWordCount = Math.round(sum / this.metrics.wordCounts.length);
  }

  /**
   * Determine if the conversation should transition to the next phase
   * @returns {Object|null} Transition information or null if no transition
   */
  shouldTransitionPhase() {
    const currentThreshold = this.phaseThresholds[this.currentPhase];
    
    if (!currentThreshold || !currentThreshold.nextPhase) {
      return null; // Already in final phase
    }

    // Check if minimum exchanges reached
    const minExchangesReached = this.exchangeCount >= currentThreshold.minExchanges;
    
    // Check if maximum exchanges reached or exceeded
    const maxExchangesReached = this.exchangeCount >= currentThreshold.maxExchanges;
    
    // For intro phase, transition after 1-2 exchanges
    if (this.currentPhase === 'intro' && minExchangesReached) {
      return {
        shouldTransition: true,
        currentPhase: this.currentPhase,
        nextPhase: currentThreshold.nextPhase,
        reason: 'intro_complete'
      };
    }
    
    // For practice phase, transition after 5-10 exchanges or based on performance
    if (this.currentPhase === 'practice') {
      if (maxExchangesReached) {
        return {
          shouldTransition: true,
          currentPhase: this.currentPhase,
          nextPhase: currentThreshold.nextPhase,
          reason: 'max_exchanges_reached'
        };
      }
      
      // Transition early if performance is good (optional)
      if (minExchangesReached && this.calculatePerformanceScore() > 80) {
        return {
          shouldTransition: true,
          currentPhase: this.currentPhase,
          nextPhase: currentThreshold.nextPhase,
          reason: 'performance_based'
        };
      }
    }
    
    // For feedback phase, transition after feedback is given
    if (this.currentPhase === 'feedback') {
      // Check if feedback message has been added
      const hasFeedback = this.conversationHistory.some(
        msg => msg.role === 'assistant' && msg.phase === 'feedback'
      );
      
      if (hasFeedback && minExchangesReached) {
        return {
          shouldTransition: true,
          currentPhase: this.currentPhase,
          nextPhase: currentThreshold.nextPhase,
          reason: 'feedback_complete'
        };
      }
    }
    
    return null; // No transition needed
  }

  /**
   * Transition to the next phase
   * @returns {string} New phase name
   */
  transitionToNextPhase() {
    const transition = this.shouldTransitionPhase();
    
    if (!transition || !transition.shouldTransition) {
      return this.currentPhase; // No transition
    }
    
    const previousPhase = this.currentPhase;
    this.currentPhase = transition.nextPhase;
    this.updatedAt = new Date();
    
    // If transitioning to complete, mark session as completed
    if (this.currentPhase === 'complete') {
      this.complete();
    }
    
    this.autoSave();
    
    console.log(`Phase transition: ${previousPhase} → ${this.currentPhase} (${transition.reason})`);
    
    return this.currentPhase;
  }

  /**
   * Calculate overall performance score (0-100)
   * @returns {number} Performance score
   */
  calculatePerformanceScore() {
    if (this.metrics.totalExchanges === 0) {
      return 0;
    }

    let score = 50; // Base score

    // Positive factors
    const goodResponseRate = this.metrics.goodResponsesCount / this.metrics.totalExchanges;
    score += goodResponseRate * 30; // Up to +30 points for good responses

    // Speed bonus (faster responses are better, but not too fast)
    if (this.metrics.averageResponseTime) {
      if (this.metrics.averageResponseTime < 3000) {
        score += 10; // Fast responses
      } else if (this.metrics.averageResponseTime > 8000) {
        score -= 10; // Too slow
      }
    }

    // Quality bonus (thoughtful responses)
    if (this.metrics.averageWordCount && this.metrics.averageWordCount >= 8) {
      score += 10; // Thoughtful responses
    }

    // Negative factors
    const helpRequestRate = this.metrics.helpRequestsCount / this.metrics.totalExchanges;
    score -= helpRequestRate * 20; // Penalty for help requests

    const hesitationRate = this.metrics.hesitationCount / this.metrics.totalExchanges;
    score -= hesitationRate * 15; // Penalty for hesitations

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return Math.round(score);
  }

  /**
   * Calculate total points earned based on performance
   * @returns {number} Total points earned
   */
  getPointsEarned() {
    let points = 0;

    // Base points per exchange
    points += this.metrics.totalExchanges * this.pointsConfig.basePointsPerExchange;

    // Good response bonus
    points += this.metrics.goodResponsesCount * this.pointsConfig.goodResponseBonus;

    // Speed bonus
    this.metrics.responseSpeeds.forEach(time => {
      if (time < this.pointsConfig.speedBonus.threshold) {
        points += this.pointsConfig.speedBonus.bonus;
      }
    });

    // Quality bonus (longer responses)
    this.metrics.wordCounts.forEach(count => {
      if (count >= this.pointsConfig.qualityBonus.threshold) {
        points += this.pointsConfig.qualityBonus.bonus;
      }
    });

    // Help request penalty
    points += this.metrics.helpRequestsCount * this.pointsConfig.helpRequestPenalty;

    // Ensure points are not negative
    points = Math.max(0, points);

    return Math.round(points);
  }

  /**
   * Complete the session
   */
  complete() {
    this.isActive = false;
    this.completedAt = new Date();
    this.currentPhase = 'complete';
    this.updatedAt = new Date();
    this.autoSave();
  }

  /**
   * Generate a unique message ID
   * @returns {string} Unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serialize session to JSON for storage
   * @returns {Object} Serialized session data
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      gradeLevel: this.gradeLevel,
      scenario: this.scenario,
      scenarioDetails: this.scenarioDetails,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      startedAt: this.startedAt ? this.startedAt.toISOString() : null,
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      isActive: this.isActive,
      currentPhase: this.currentPhase,
      exchangeCount: this.exchangeCount,
      difficultyLevel: this.difficultyLevel,
      conversationHistory: this.conversationHistory.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      metrics: {
        ...this.metrics
      },
      maxTurns: this.maxTurns,
      performanceScore: this.calculatePerformanceScore(),
      pointsEarned: this.getPointsEarned()
    };
  }

  /**
   * Create a ConversationSession instance from JSON data
   * @param {Object} data - Serialized session data
   * @returns {ConversationSession} New ConversationSession instance
   */
  static fromJSON(data) {
    const session = new ConversationSession({
      userId: data.userId,
      gradeLevel: data.gradeLevel,
      scenario: data.scenario,
      scenarioDetails: data.scenarioDetails || {},
      initialDifficulty: data.difficultyLevel || 3,
      maxTurns: data.maxTurns || 8
    });

    // Restore session ID
    session.sessionId = data.sessionId || session.sessionId;

    // Restore timestamps
    session.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    session.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    session.startedAt = data.startedAt ? new Date(data.startedAt) : null;
    session.completedAt = data.completedAt ? new Date(data.completedAt) : null;

    // Restore state
    session.isActive = data.isActive || false;
    session.currentPhase = data.currentPhase || 'intro';
    session.exchangeCount = data.exchangeCount || 0;
    session.difficultyLevel = data.difficultyLevel || 3;

    // Restore conversation history
    if (data.conversationHistory && Array.isArray(data.conversationHistory)) {
      session.conversationHistory = data.conversationHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }

    // Restore metrics
    if (data.metrics) {
      session.metrics = {
        ...session.metrics,
        ...data.metrics
      };
    }

    return session;
  }

  /**
   * Auto-save session to localStorage
   */
  autoSave() {
    try {
      const storageKey = `voice_session_${this.sessionId}`;
      const userSessionsKey = `user_${this.userId}_voice_sessions`;
      
      // Save individual session
      localStorage.setItem(storageKey, JSON.stringify(this.toJSON()));
      
      // Update user's session list
      const userSessions = JSON.parse(localStorage.getItem(userSessionsKey) || '[]');
      const sessionIndex = userSessions.findIndex(s => s.sessionId === this.sessionId);
      
      const sessionSummary = {
        sessionId: this.sessionId,
        scenario: this.scenario,
        gradeLevel: this.gradeLevel,
        createdAt: this.createdAt.toISOString(),
        completedAt: this.completedAt ? this.completedAt.toISOString() : null,
        exchangeCount: this.exchangeCount,
        performanceScore: this.calculatePerformanceScore(),
        pointsEarned: this.getPointsEarned(),
        isActive: this.isActive
      };
      
      if (sessionIndex >= 0) {
        userSessions[sessionIndex] = sessionSummary;
      } else {
        userSessions.push(sessionSummary);
      }
      
      // Keep only last 50 sessions
      const maxSessions = 50;
      if (userSessions.length > maxSessions) {
        userSessions.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        userSessions.splice(maxSessions);
      }
      
      localStorage.setItem(userSessionsKey, JSON.stringify(userSessions));
      
    } catch (error) {
      console.error('Failed to auto-save conversation session:', error);
      // Don't throw - auto-save failures shouldn't break the app
    }
  }

  /**
   * Load session from localStorage
   * @param {string} sessionId - Session ID to load
   * @returns {ConversationSession|null} Loaded session or null
   */
  static load(sessionId) {
    try {
      const storageKey = `voice_session_${sessionId}`;
      const data = localStorage.getItem(storageKey);
      
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      return ConversationSession.fromJSON(parsed);
    } catch (error) {
      console.error('Failed to load conversation session:', error);
      return null;
    }
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of session summaries
   */
  static getUserSessions(userId) {
    try {
      const userSessionsKey = `user_${userId}_voice_sessions`;
      const data = localStorage.getItem(userSessionsKey);
      
      if (!data) {
        return [];
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load user sessions:', error);
      return [];
    }
  }

  /**
   * Delete a session from storage
   * @param {string} sessionId - Session ID to delete
   * @param {string} userId - User ID
   */
  static delete(sessionId, userId) {
    try {
      const storageKey = `voice_session_${sessionId}`;
      localStorage.removeItem(storageKey);
      
      // Remove from user's session list
      const userSessionsKey = `user_${userId}_voice_sessions`;
      const userSessions = ConversationSession.getUserSessions(userId);
      const filtered = userSessions.filter(s => s.sessionId !== sessionId);
      localStorage.setItem(userSessionsKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete conversation session:', error);
    }
  }

  /**
   * Get session summary for display
   * @returns {Object} Session summary
   */
  getSummary() {
    return {
      sessionId: this.sessionId,
      scenario: this.scenario,
      gradeLevel: this.gradeLevel,
      currentPhase: this.currentPhase,
      exchangeCount: this.exchangeCount,
      difficultyLevel: this.difficultyLevel,
      performanceScore: this.calculatePerformanceScore(),
      pointsEarned: this.getPointsEarned(),
      isActive: this.isActive,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      duration: this.completedAt && this.startedAt
        ? Math.round((this.completedAt - this.startedAt) / 1000) // Duration in seconds
        : null
    };
  }
}

export default ConversationSession;


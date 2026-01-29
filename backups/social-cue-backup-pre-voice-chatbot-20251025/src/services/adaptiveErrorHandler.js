// Adaptive Learning Error Handling Service
// Provides comprehensive error handling, fallbacks, and user feedback

class AdaptiveErrorHandler {
  constructor() {
    this.isOnline = navigator.onLine;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.fallbackMode = false;
    
    // Listen for network changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyNetworkChange(true);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyNetworkChange(false);
    });
  }

  // Network status management
  notifyNetworkChange(isOnline) {
    this.isOnline = isOnline;
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('networkStatusChange', { 
      detail: { isOnline } 
    }));
  }

  // Error classification and handling
  classifyError(error) {
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';
    
    // Network-related errors
    if (!this.isOnline || 
        message.includes('network') || 
        message.includes('fetch') || 
        message.includes('connection') ||
        code === 'NETWORK_ERROR') {
      return 'network';
    }
    
    // Timeout errors
    if (message.includes('timeout') || 
        message.includes('aborted') ||
        code === 'TIMEOUT') {
      return 'timeout';
    }
    
    // AI service errors
    if (message.includes('ai') || 
        message.includes('anthropic') ||
        message.includes('claude') ||
        code === 'AI_SERVICE_ERROR') {
      return 'ai_error';
    }
    
    // Authentication errors
    if (message.includes('auth') || 
        message.includes('unauthorized') ||
        code === 'AUTH_ERROR') {
      return 'auth';
    }
    
    // Rate limiting
    if (message.includes('rate') || 
        message.includes('limit') ||
        code === 'RATE_LIMIT') {
      return 'rate_limit';
    }
    
    return 'general';
  }

  // Retry logic with exponential backoff
  async retryOperation(operation, operationId = 'default', context = {}) {
    const attempts = this.retryAttempts.get(operationId) || 0;
    
    if (attempts >= this.maxRetries) {
      this.retryAttempts.delete(operationId);
      throw new Error('Max retry attempts exceeded');
    }
    
    try {
      const result = await operation();
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      const errorType = this.classifyError(error);
      
      // Don't retry certain error types
      if (['auth', 'rate_limit'].includes(errorType)) {
        throw error;
      }
      
      // Increment retry count
      this.retryAttempts.set(operationId, attempts + 1);
      
      // Wait before retrying (exponential backoff)
      const delay = this.retryDelay * Math.pow(2, attempts);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the operation
      return this.retryOperation(operation, operationId, context);
    }
  }

  // Fallback evaluation when AI is unavailable
  createFallbackEvaluation(responseData) {
    console.log('🔄 Using fallback evaluation');
    
    const isCorrect = responseData.selectedAnswer === responseData.correctAnswer;
    const responseTime = responseData.responseTime || 0;
    
    // Simple scoring based on correctness and response time
    let score = isCorrect ? 100 : 0;
    if (responseTime < 2 && isCorrect) {
      score = Math.min(100, score + 10); // Bonus for quick correct answers
    }
    
    return {
      isCorrect,
      accuracyScore: score,
      responseQuality: isCorrect ? 4 : 2,
      socialIntelligence: isCorrect ? 4 : 2,
      ageAppropriateness: 4,
      learningInsights: {
        strengths: isCorrect ? ['Good understanding'] : ['Willingness to try'],
        areasForImprovement: isCorrect ? ['Keep practicing'] : ['Understanding social cues'],
        specificFeedback: isCorrect ? 
          'Great job! You chose the right answer.' : 
          'Good try! Let\'s learn why this answer works better.',
        encouragement: 'You\'re doing great! Keep practicing to improve your social skills.',
        nextSteps: isCorrect ? 'Ready for more challenging questions' : 'Focus on understanding social situations'
      },
      difficultyRecommendation: {
        currentLevelAppropriate: true,
        suggestedAdjustment: isCorrect ? 'maintain' : 'maintain',
        reasoning: isCorrect ? 'Continue at current level' : 'Keep practicing at current level'
      },
      pointsEarned: isCorrect ? 10 : 5,
      badgeOpportunities: [],
      isFallback: true
    };
  }

  // Fallback session analysis
  createFallbackSessionAnalysis(sessionData) {
    console.log('🔄 Using fallback session analysis');
    
    const score = sessionData.score || 0;
    const totalQuestions = sessionData.totalQuestions || 1;
    const correctAnswers = sessionData.correctAnswers || 0;
    
    return {
      sessionAssessment: {
        overallPerformance: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement',
        scoreInterpretation: `You scored ${score}% on ${sessionData.topicName}`,
        timeEfficiency: 'Good time management',
        engagementLevel: 4,
        learningProgress: 'Showing steady progress'
      },
      difficultyAnalysis: {
        currentLevelAppropriate: true,
        performanceVsDifficulty: 'Performance matches difficulty level',
        recommendedNextLevel: score >= 80 ? Math.min(5, (sessionData.difficulty || 1) + 1) : sessionData.difficulty || 1,
        adjustmentReasoning: score >= 80 ? 'Ready for increased challenge' : 'Continue at current level'
      },
      learningInsights: {
        strengthsDemonstrated: ['Persistence', 'Effort'],
        weaknessesIdentified: ['Understanding complex scenarios'],
        skillDevelopment: 'Basic social skills improving',
        focusAreas: ['Complex social situations']
      },
      adaptiveRecommendations: {
        nextSessionDifficulty: score >= 80 ? Math.min(5, (sessionData.difficulty || 1) + 1) : sessionData.difficulty || 1,
        topicFocus: sessionData.topicName,
        learningStrategy: 'Continue practicing with varied scenarios',
        practiceSuggestions: ['Try different social situations', 'Practice with friends']
      },
      progressIndicators: {
        masteryLevel: Math.floor(score / 20),
        masteryProgress: `${score}% toward next level`,
        learningVelocity: 'Steady',
        retentionQuality: 'Good'
      },
      badgeRecommendations: [],
      challengeSuggestions: {
        realWorldChallenges: ['Practice with classmates', 'Try new social situations'],
        practiceFocus: 'Real-world application'
      },
      isFallback: true
    };
  }

  // Handle AI evaluation with fallback
  async handleAIEvaluation(responseData, aiEvaluationFunction) {
    try {
      // Check if we should use fallback mode
      if (this.fallbackMode || !this.isOnline) {
        return this.createFallbackEvaluation(responseData);
      }
      
      // Try AI evaluation with retry logic
      return await this.retryOperation(
        () => aiEvaluationFunction(responseData),
        'ai_evaluation',
        { responseData }
      );
      
    } catch (error) {
      console.warn('AI evaluation failed, using fallback:', error);
      
      // Enable fallback mode for subsequent requests
      this.fallbackMode = true;
      
      // Return fallback evaluation
      return this.createFallbackEvaluation(responseData);
    }
  }

  // Handle session analysis with fallback
  async handleSessionAnalysis(sessionData, analysisFunction) {
    try {
      // Check if we should use fallback mode
      if (this.fallbackMode || !this.isOnline) {
        return this.createFallbackSessionAnalysis(sessionData);
      }
      
      // Try AI analysis with retry logic
      return await this.retryOperation(
        () => analysisFunction(sessionData),
        'session_analysis',
        { sessionData }
      );
      
    } catch (error) {
      console.warn('Session analysis failed, using fallback:', error);
      
      // Enable fallback mode for subsequent requests
      this.fallbackMode = true;
      
      // Return fallback analysis
      return this.createFallbackSessionAnalysis(sessionData);
    }
  }

  // Handle edge cases
  handleEdgeCases(responseData) {
    const issues = [];
    
    // Very fast responses (might indicate guessing)
    if (responseData.responseTime < 1) {
      issues.push({
        type: 'fast_response',
        message: 'Response was very quick - make sure you\'re thinking through your answer',
        severity: 'warning'
      });
    }
    
    // No response
    if (!responseData.selectedAnswer) {
      issues.push({
        type: 'no_response',
        message: 'No answer selected - please choose an option',
        severity: 'error'
      });
    }
    
    // Very slow responses
    if (responseData.responseTime > 60) {
      issues.push({
        type: 'slow_response',
        message: 'You took a long time - that\'s okay! Take your time to think',
        severity: 'info'
      });
    }
    
    return issues;
  }

  // Session interruption handling
  handleSessionInterruption(sessionData) {
    // Save current progress to localStorage
    const interruptedSession = {
      ...sessionData,
      interruptedAt: new Date().toISOString(),
      isInterrupted: true
    };
    
    localStorage.setItem('interrupted_session', JSON.stringify(interruptedSession));
    
    return {
      message: 'Session interrupted - your progress has been saved',
      canResume: true,
      sessionData: interruptedSession
    };
  }

  // Resume interrupted session
  resumeInterruptedSession() {
    try {
      const interruptedSession = localStorage.getItem('interrupted_session');
      if (interruptedSession) {
        const sessionData = JSON.parse(interruptedSession);
        localStorage.removeItem('interrupted_session');
        return sessionData;
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    }
    return null;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error, errorType) {
    const messages = {
      network: 'We\'re having trouble connecting. Please check your internet connection and try again.',
      timeout: 'The request is taking longer than expected. Please try again.',
      ai_error: 'Our AI system is temporarily unavailable. You can still practice with basic feedback.',
      auth: 'There\'s an authentication issue. Please refresh the page and try again.',
      rate_limit: 'Too many requests. Please wait a moment before trying again.',
      general: 'Something went wrong. Please try again or contact support if this continues.'
    };
    
    return messages[errorType] || messages.general;
  }

  // Reset fallback mode (call when connection is restored)
  resetFallbackMode() {
    this.fallbackMode = false;
    this.retryAttempts.clear();
  }

  // Get system status
  getSystemStatus() {
    return {
      isOnline: this.isOnline,
      fallbackMode: this.fallbackMode,
      retryAttempts: Object.fromEntries(this.retryAttempts),
      maxRetries: this.maxRetries
    };
  }
}

// Create singleton instance
const adaptiveErrorHandler = new AdaptiveErrorHandler();

export default adaptiveErrorHandler;

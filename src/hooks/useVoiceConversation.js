import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { apiConfig } from '../config/env.js';
import voiceAnalytics from '../services/voiceAnalytics.js';

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {'user'|'ai'} role - Message role
 * @property {string} text - Message text content
 * @property {Date} timestamp - Message timestamp
 * @property {string} phase - Current conversation phase
 * @property {boolean} audioPlayed - Whether audio has been played
 * @property {Object} metadata - Additional message metadata
 */

/**
 * @typedef {Object} ConversationPhase
 * @property {'intro'|'practice'|'feedback'|'complete'} name - Phase name
 * @property {string} description - Phase description
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} totalTurns - Total conversation turns
 * @property {number} successfulExchanges - Number of successful exchanges
 * @property {number} hesitations - Number of hesitations detected
 * @property {number} hintsGiven - Number of hints provided
 * @property {number} score - Performance score (0-100)
 * @property {Date|null} startTime - Session start time
 * @property {Date|null} endTime - Session end time
 * @property {number} duration - Session duration in milliseconds
 * @property {number[]} responseTimes - Array of response times in milliseconds
 */

/**
 * @typedef {Object} UseVoiceConversationOptions
 * @property {string|Object} scenario - Scenario name or scenario object
 * @property {string} gradeLevel - Grade level (K-12 format)
 * @property {string} userId - User ID
 * @property {number} [maxTurns=8] - Maximum conversation turns
 * @property {string} [initialDifficulty='moderate'] - Initial difficulty level
 * @property {Function} [onComplete] - Callback when conversation completes
 * @property {Function} [onError] - Callback for errors
 * @property {boolean} [autoSave=true] - Whether to auto-save progress
 */

/**
 * @typedef {Object} UseVoiceConversationReturn
 * @property {string|null} sessionId - Current session ID
 * @property {Message[]} messages - Conversation messages
 * @property {string} currentPhase - Current conversation phase
 * @property {boolean} isAISpeaking - Whether AI is currently speaking
 * @property {boolean} isListening - Whether microphone is listening
 * @property {number} exchangeCount - Number of exchanges completed
 * @property {string} difficultyLevel - Current difficulty level
 * @property {boolean} isComplete - Whether conversation is complete
 * @property {Error|null} error - Current error, if any
 * @property {Function} startConversation - Start a new conversation
 * @property {Function} sendMessage - Send a user message
 * @property {Function} endConversation - End the conversation
 * @property {boolean} isLoading - Whether an operation is in progress
 * @property {boolean} canSpeak - Whether user can speak (mic enabled)
 */

/**
 * Custom React hook for managing voice conversation state and logic.
 * 
 * Encapsulates all conversation logic including:
 * - Session initialization and management
 * - Message history tracking
 * - Phase transitions
 * - API communication
 * - Voice input/output coordination
 * - Error handling and recovery
 * - Performance tracking
 * - Auto-save functionality
 * 
 * @param {UseVoiceConversationOptions} options - Hook configuration options
 * @returns {UseVoiceConversationReturn} Hook return value with state and actions
 * 
 * @example
 * ```jsx
 * const {
 *   sessionId,
 *   messages,
 *   currentPhase,
 *   isAISpeaking,
 *   isListening,
 *   startConversation,
 *   sendMessage,
 *   endConversation,
 *   isLoading,
 *   canSpeak
 * } = useVoiceConversation({
 *   scenario: "Making friends at lunch",
 *   gradeLevel: "6",
 *   userId: "user_123"
 * });
 * ```
 */
const useVoiceConversation = ({
  scenario,
  gradeLevel = '6',
  userId,
  maxTurns = 8,
  initialDifficulty = 'moderate',
  onComplete,
  onError,
  autoSave = true
}) => {
  // API Configuration
  const apiBaseUrl = apiConfig.baseUrl || 'http://localhost:3001';
  
  // Core State
  const [sessionId, setSessionId] = useState(/** @type {string|null} */ (null));
  const [messages, setMessages] = useState(/** @type {Message[]} */ ([]));
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(initialDifficulty);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(/** @type {Error|null} */ (null));
  const [isLoading, setIsLoading] = useState(false);
  
  // Performance Metrics
  const [performanceMetrics, setPerformanceMetrics] = useState(/** @type {PerformanceMetrics} */ ({
    totalTurns: 0,
    successfulExchanges: 0,
    hesitations: 0,
    hintsGiven: 0,
    score: 0,
    startTime: null,
    endTime: null,
    duration: 0,
    responseTimes: []
  }));
  
  // Refs for cleanup and tracking
  const abortControllerRef = useRef(/** @type {AbortController|null} */ (null));
  const sessionStartTimeRef = useRef(/** @type {number|null} */ (null));
  const lastUserMessageTimeRef = useRef(/** @type {number|null} */ (null));
  const retryCountRef = useRef(0);
  const debounceTimeoutRef = useRef(/** @type {NodeJS.Timeout|null} */ (null));
  const ttsCallbackRef = useRef(/** @type {Function|null} */ (null));
  
  // Maximum retry attempts
  const MAX_RETRIES = 3;
  const DEBOUNCE_DELAY = 500; // ms
  const API_TIMEOUT = 10000; // 10 seconds
  
  /**
   * Get scenario name from scenario object or string
   * @returns {string} Scenario name
   */
  const getScenarioName = useCallback(() => {
    if (typeof scenario === 'string') {
      return scenario;
    }
    if (scenario && typeof scenario === 'object') {
      return scenario.title || scenario.name || scenario.id || 'Social Skills Practice';
    }
    return 'Social Skills Practice';
  }, [scenario]);
  
  /**
   * Create a message object
   * @param {string} role - Message role ('user' or 'ai')
   * @param {string} text - Message text
   * @param {string} [phase] - Conversation phase
   * @param {Object} [metadata] - Additional metadata
   * @returns {Message} Message object
   */
  const createMessage = useCallback((role, text, phase = currentPhase, metadata = {}) => {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      text: text.trim(),
      timestamp: new Date(),
      phase,
      audioPlayed: false,
      metadata: {
        ...metadata,
        exchangeNumber: exchangeCount + (role === 'user' ? 1 : 0)
      }
    };
  }, [currentPhase, exchangeCount]);
  
  /**
   * Calculate performance score
   * @param {PerformanceMetrics} metrics - Performance metrics
   * @returns {number} Score from 0-100
   */
  const calculatePerformanceScore = useCallback((metrics) => {
    let score = 50; // Base score
    
    // Positive factors
    const successRate = metrics.totalTurns > 0 
      ? metrics.successfulExchanges / metrics.totalTurns 
      : 0;
    score += successRate * 30;
    
    // Response time bonus (faster = better, but not too fast)
    if (metrics.responseTimes.length > 0) {
      const avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
      if (avgResponseTime < 3000) score += 10;
      else if (avgResponseTime > 8000) score -= 10;
    }
    
    // Negative factors
    const hesitationRate = metrics.totalTurns > 0 
      ? metrics.hesitations / metrics.totalTurns 
      : 0;
    score -= hesitationRate * 15;
    
    const hintRate = metrics.totalTurns > 0 
      ? metrics.hintsGiven / metrics.totalTurns 
      : 0;
    score -= hintRate * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, []);
  
  /**
   * Update performance metrics
   * @param {Partial<PerformanceMetrics>} updates - Metrics updates
   */
  const updatePerformanceMetrics = useCallback((updates) => {
    setPerformanceMetrics(prev => {
      const updated = { ...prev, ...updates };
      updated.score = calculatePerformanceScore(updated);
      return updated;
    });
  }, [calculatePerformanceScore]);
  
  /**
   * Auto-save session to localStorage
   */
  const autoSaveSession = useCallback(() => {
    if (!autoSave || !sessionId) return;
    
    try {
      const sessionData = {
        sessionId,
        userId,
        scenario: getScenarioName(),
        gradeLevel,
        messages,
        currentPhase,
        exchangeCount,
        difficultyLevel,
        performanceMetrics,
        isComplete,
        timestamp: new Date().toISOString()
      };
      
      const storageKey = `voice_session_${sessionId}`;
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
      
      // Update user's session list
      const userSessionsKey = `user_${userId}_voice_sessions`;
      const userSessions = JSON.parse(localStorage.getItem(userSessionsKey) || '[]');
      const sessionIndex = userSessions.findIndex(s => s.sessionId === sessionId);
      
      const sessionSummary = {
        sessionId,
        scenario: getScenarioName(),
        gradeLevel,
        exchangeCount,
        currentPhase,
        performanceScore: performanceMetrics.score,
        timestamp: new Date().toISOString()
      };
      
      if (sessionIndex >= 0) {
        userSessions[sessionIndex] = sessionSummary;
      } else {
        userSessions.push(sessionSummary);
      }
      
      // Keep only last 50 sessions
      if (userSessions.length > 50) {
        userSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        userSessions.splice(50);
      }
      
      localStorage.setItem(userSessionsKey, JSON.stringify(userSessions));
    } catch (error) {
      console.error('Failed to auto-save session:', error);
    }
  }, [autoSave, sessionId, userId, getScenarioName, gradeLevel, messages, currentPhase, exchangeCount, difficultyLevel, performanceMetrics, isComplete]);
  
  /**
   * Make API request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {number} [retryAttempt=0] - Current retry attempt
   * @returns {Promise<Response>} Fetch response
   */
  const apiRequest = useCallback(async (endpoint, options = {}, retryAttempt = 0) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: abortControllerRef.current.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      retryCountRef.current = 0;
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic
      if (retryAttempt < MAX_RETRIES && error.name !== 'AbortError') {
        retryCountRef.current = retryAttempt + 1;
        const delay = Math.pow(2, retryAttempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(endpoint, options, retryAttempt + 1);
      }
      
      throw error;
    }
  }, [apiBaseUrl]);
  
  /**
   * Generate fallback response when API fails
   * @param {string} phase - Current phase
   * @returns {string} Fallback response text
   */
  const getFallbackResponse = useCallback((phase) => {
    const fallbacks = {
      intro: "Hi there! I'm excited to practice with you today. Are you ready to begin?",
      practice: "That's interesting! Can you tell me more about that?",
      feedback: "Great job! You're doing really well. Keep practicing!",
      complete: "Excellent work! You've completed this practice session. Well done!"
    };
    
    return fallbacks[phase] || fallbacks.practice;
  }, []);
  
  /**
   * Get error recovery suggestions
   * @param {Error} error - Error object
   * @returns {string[]} Array of recovery suggestions
   */
  const getRecoverySuggestions = useCallback((error) => {
    const suggestions = [];
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
    } else if (error.message?.includes('timeout')) {
      suggestions.push('The request took too long');
      suggestions.push('Try again with a shorter message');
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      suggestions.push('Authentication error');
      suggestions.push('Please refresh the page');
    } else if (error.message?.includes('500')) {
      suggestions.push('Server error occurred');
      suggestions.push('Please try again later');
    } else {
      suggestions.push('An unexpected error occurred');
      suggestions.push('Please try again');
    }
    
    return suggestions;
  }, []);
  
  /**
   * Start a new conversation session
   * @returns {Promise<{success: boolean, sessionId?: string, error?: string}>}
   */
  const startConversation = useCallback(async () => {
    if (isLoading) {
      return { success: false, error: 'Already initializing conversation' };
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setIsComplete(false);
      setMessages([]);
      setExchangeCount(0);
      setCurrentPhase('intro');
      setDifficultyLevel(initialDifficulty);
      
      // Reset performance metrics
      sessionStartTimeRef.current = Date.now();
      updatePerformanceMetrics({
        totalTurns: 0,
        successfulExchanges: 0,
        hesitations: 0,
        hintsGiven: 0,
        score: 0,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        responseTimes: []
      });
      
      // Get scenario name
      const scenarioName = getScenarioName();
      const scenarioId = typeof scenario === 'object' && scenario?.id ? scenario.id : scenarioName;
      
      // Track session start
      voiceAnalytics.trackVoicePracticeStarted(scenarioId, gradeLevel);
      
      // Call API to start conversation
      const response = await apiRequest('/api/voice/start', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          gradeLevel,
          scenarioId,
          difficulty: initialDifficulty,
          scenarioDetails: typeof scenario === 'object' ? scenario : {}
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start conversation');
      }
      
      // Set session ID
      const newSessionId = data.sessionId;
      setSessionId(newSessionId);
      
      // Create initial AI message
      const initialMessage = createMessage('ai', data.aiResponse || getFallbackResponse('intro'), 'intro', {
        sessionId: newSessionId,
        isInitial: true
      });
      
      setMessages([initialMessage]);
      setCurrentPhase(data.phase || 'intro');
      
      // Auto-save
      if (autoSave) {
        autoSaveSession();
      }
      
      return {
        success: true,
        sessionId: newSessionId,
        initialMessage
      };
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.message || 'Failed to start conversation';
      
      // Track error
      voiceAnalytics.trackError('conversation_start_error', errorMessage, {
        scenarioId: typeof scenario === 'object' && scenario?.id ? scenario.id : getScenarioName(),
        gradeLevel
      });
      
      const errorWithSuggestions = /** @type {Error & {suggestions?: string[]}} */ (
        new Error(errorMessage)
      );
      errorWithSuggestions.suggestions = getRecoverySuggestions(error);
      setError(errorWithSuggestions);
      
      if (onError) {
        onError(error);
      }
      
      // Return fallback response
      const fallbackMessage = createMessage('ai', getFallbackResponse('intro'), 'intro', {
        isFallback: true
      });
      setMessages([fallbackMessage]);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    getScenarioName,
    userId,
    gradeLevel,
    initialDifficulty,
    apiRequest,
    createMessage,
    getFallbackResponse,
    getRecoverySuggestions,
    updatePerformanceMetrics,
    autoSave,
    autoSaveSession,
    onError
  ]);
  
  /**
   * Send a user message and get AI response
   * @param {string} userText - User's message text
   * @returns {Promise<{success: boolean, aiMessage?: Message, error?: string}>}
   */
  const sendMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) {
      return { success: false, error: 'Empty message' };
    }
    
    if (!sessionId) {
      return { success: false, error: 'No active session. Please start a conversation first.' };
    }
    
    if (isComplete) {
      return { success: false, error: 'Conversation is already complete' };
    }
    
    if (isLoading) {
      return { success: false, error: 'Already processing a message' };
    }
    
    // Debounce rapid messages
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    return new Promise((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setIsListening(false);
          setError(null);
          
          // Track response time
          const responseStartTime = Date.now();
          if (lastUserMessageTimeRef.current) {
            const responseTime = responseStartTime - lastUserMessageTimeRef.current;
            updatePerformanceMetrics({
              responseTimes: [...performanceMetrics.responseTimes, responseTime]
            });
            
            // Track conversation length
            voiceAnalytics.trackConversationLength(exchangeCount + 1);
          }
          
          // Track message send (for latency tracking)
          const messageSendTime = Date.now();
          
          // Create user message
          const userMessage = createMessage('user', userText, currentPhase);
          lastUserMessageTimeRef.current = Date.now();
          
          // Detect hesitation
          const hasHesitation = userText.toLowerCase().includes('um') || 
                               userText.toLowerCase().includes('uh') ||
                               userText.toLowerCase().includes('like');
          
          if (hasHesitation) {
            updatePerformanceMetrics({
              hesitations: performanceMetrics.hesitations + 1
            });
          }
          
          // Add user message to conversation
          setMessages(prev => [...prev, userMessage]);
          
          // Update exchange count
          const newExchangeCount = exchangeCount + 1;
          setExchangeCount(newExchangeCount);
          
          updatePerformanceMetrics({
            totalTurns: newExchangeCount
          });
          
          // Call API to get AI response
          const response = await apiRequest('/api/voice/message', {
            method: 'POST',
            body: JSON.stringify({
              sessionId,
              userMessage: userText.trim(),
              responseTime: lastUserMessageTimeRef.current - (sessionStartTimeRef.current || Date.now()),
              performance: {
                totalTurns: newExchangeCount,
                hesitations: performanceMetrics.hesitations + (hasHesitation ? 1 : 0),
                hintsGiven: performanceMetrics.hintsGiven
              }
            })
          });
          
          const data = await response.json();
          
          // Track response latency
          const responseLatency = Date.now() - messageSendTime;
          voiceAnalytics.trackResponseLatency(responseLatency);
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to get AI response');
          }
          
          // Create AI message
          const aiMessage = createMessage('ai', data.aiResponse || getFallbackResponse(currentPhase), data.phase || currentPhase, {
            exchangeCount: data.exchangeCount,
            difficultyLevel: data.difficultyLevel,
            shouldContinue: data.shouldContinue
          });
          
          // Add AI message to conversation
          setMessages(prev => [...prev, aiMessage]);
          
          // Update phase if changed
          if (data.phase && data.phase !== currentPhase) {
            setCurrentPhase(data.phase);
          }
          
          // Update difficulty level
          if (data.difficultyLevel) {
            setDifficultyLevel(data.difficultyLevel);
          }
          
          // Update performance metrics
          updatePerformanceMetrics({
            successfulExchanges: performanceMetrics.successfulExchanges + 1
          });
          
          // Check if conversation should end
          if (!data.shouldContinue || newExchangeCount >= maxTurns || data.phase === 'complete') {
            setIsComplete(true);
            await endConversation();
          }
          
          // Auto-save
          if (autoSave) {
            autoSaveSession();
          }
          
          // Trigger TTS callback
          setIsAISpeaking(true);
          if (ttsCallbackRef.current) {
            ttsCallbackRef.current(aiMessage.text, () => {
              setIsAISpeaking(false);
              setIsListening(true); // Enable mic after TTS completes
            });
          } else {
            // Fallback: enable mic after delay
            setTimeout(() => {
              setIsAISpeaking(false);
              setIsListening(true);
            }, 1000);
          }
          
          resolve({
            success: true,
            userMessage,
            aiMessage
          });
          
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMessage = error.message || 'Failed to send message';
          
          // Track error
          voiceAnalytics.trackError('message_send_error', errorMessage, {
            scenarioId: typeof scenario === 'object' && scenario?.id ? scenario.id : getScenarioName(),
            exchangeCount,
            sessionId
          });
          
          const errorWithSuggestions = /** @type {Error & {suggestions?: string[]}} */ (
            new Error(errorMessage)
          );
          errorWithSuggestions.suggestions = getRecoverySuggestions(error);
          setError(errorWithSuggestions);
          
          if (onError) {
            onError(error);
          }
          
          // Fallback response
          const fallbackMessage = createMessage('ai', getFallbackResponse(currentPhase), currentPhase, {
            isFallback: true,
            error: errorMessage
          });
          
          setMessages(prev => [...prev, fallbackMessage]);
          
          setIsAISpeaking(true);
          if (ttsCallbackRef.current) {
            ttsCallbackRef.current(fallbackMessage.text, () => {
              setIsAISpeaking(false);
              setIsListening(true);
            });
          } else {
            setTimeout(() => {
              setIsAISpeaking(false);
              setIsListening(true);
            }, 1000);
          }
          
          resolve({
            success: false,
            error: errorMessage,
            aiMessage: fallbackMessage
          });
        } finally {
          setIsLoading(false);
        }
      }, DEBOUNCE_DELAY);
    });
  }, [
    sessionId,
    isComplete,
    isLoading,
    currentPhase,
    exchangeCount,
    performanceMetrics,
    maxTurns,
    apiRequest,
    createMessage,
    getFallbackResponse,
    getRecoverySuggestions,
    updatePerformanceMetrics,
    autoSave,
    autoSaveSession,
    onError
  ]);
  
  /**
   * End the conversation session
   * @returns {Promise<{success: boolean, summary?: Object, error?: string}>}
   */
  const endConversation = useCallback(async () => {
    if (!sessionId) {
      return { success: false, error: 'No active session' };
    }
    
    if (isComplete) {
      return { success: true, summary: performanceMetrics };
    }
    
    try {
      setIsLoading(true);
      setIsListening(false);
      setIsAISpeaking(false);
      setError(null);
      
      // Calculate final duration
      const duration = sessionStartTimeRef.current 
        ? Date.now() - sessionStartTimeRef.current 
        : 0;
      
      updatePerformanceMetrics({
        endTime: new Date(),
        duration
      });
      
      // Call API to end conversation
      try {
        const response = await apiRequest(`/api/voice/end/${sessionId}`, {
          method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
          updatePerformanceMetrics({
            score: data.performanceScore || performanceMetrics.score
          });
        }
      } catch (apiError) {
        console.warn('Failed to end conversation via API:', apiError);
        // Continue with local completion
      }
      
      setIsComplete(true);
      setCurrentPhase('complete');
      
      // Auto-save final state
      if (autoSave) {
        autoSaveSession();
      }
      
      const summary = {
        sessionId,
        scenario: getScenarioName(),
        gradeLevel,
        exchangeCount,
        currentPhase: 'complete',
        performanceScore: performanceMetrics.score,
        duration,
        completedAt: new Date()
      };
      
      // Track session completion
      const scenarioId = typeof scenario === 'object' && scenario?.id ? scenario.id : getScenarioName();
      const durationSeconds = Math.round(duration / 1000);
      voiceAnalytics.trackVoicePracticeCompleted(scenarioId, durationSeconds, exchangeCount);
      voiceAnalytics.trackCompletedPractice();
      
      // Call completion callback
      if (onComplete) {
        onComplete(summary);
      }
      
      return {
        success: true,
        summary
      };
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      const errorMessage = error.message || 'Failed to end conversation';
      const errorWithSuggestions = /** @type {Error & {suggestions?: string[]}} */ (
        new Error(errorMessage)
      );
      errorWithSuggestions.suggestions = getRecoverySuggestions(error);
      setError(errorWithSuggestions);
      
      if (onError) {
        onError(error);
      }
      
      setIsComplete(true);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [
    sessionId,
    isComplete,
    performanceMetrics,
    apiRequest,
    updatePerformanceMetrics,
    autoSave,
    autoSaveSession,
    getScenarioName,
    gradeLevel,
    exchangeCount,
    getRecoverySuggestions,
    onComplete,
    onError
  ]);
  
  /**
   * Register TTS callback for voice output coordination
   * @param {Function} callback - Callback function(text, onComplete)
   */
  const registerTTSCallback = useCallback((callback) => {
    ttsCallbackRef.current = callback;
  }, []);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Auto-save final state
      if (autoSave && sessionId) {
        autoSaveSession();
      }
    };
  }, [autoSave, sessionId, autoSaveSession]);
  
  // Memoized computed values
  const canSpeak = useMemo(() => {
    return !isAISpeaking && !isLoading && !isComplete && sessionId !== null;
  }, [isAISpeaking, isLoading, isComplete, sessionId]);
  
  // Auto-save when messages change
  useEffect(() => {
    if (autoSave && sessionId && messages.length > 0) {
      autoSaveSession();
    }
  }, [messages, autoSave, sessionId, autoSaveSession]);
  
  return {
    // State
    sessionId,
    messages,
    currentPhase,
    isAISpeaking,
    isListening,
    setIsListening, // Allow external control
    exchangeCount,
    difficultyLevel,
    isComplete,
    error,
    
    // Performance metrics
    performanceMetrics,
    
    // Actions
    startConversation,
    sendMessage,
    endConversation,
    
    // Status
    isLoading,
    canSpeak,
    
    // Utilities
    registerTTSCallback,
    clearError
  };
};

export default useVoiceConversation;

/**
 * Voice Practice Analytics Tracking
 * 
 * Comprehensive analytics system for tracking voice practice sessions,
 * performance metrics, and user engagement while maintaining privacy compliance.
 * 
 * @module voiceAnalytics
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Analytics backend endpoint (optional)
  analyticsEndpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || null,
  
  // Google Analytics tracking ID (optional)
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID || null,
  
  // Local storage keys
  storageKeys: {
    eventQueue: 'voice_analytics_queue',
    userPreferences: 'voice_analytics_preferences',
    sessionData: 'voice_analytics_session',
    reports: 'voice_analytics_reports'
  },
  
  // Batch settings
  batchSize: 10,
  batchInterval: 30000, // 30 seconds
  
  // Data retention (days)
  retentionDays: 90,
  
  // COPPA age threshold
  coppaAgeThreshold: 13,
  
  // Max queue size
  maxQueueSize: 100
};

// ============================================================================
// PRIVACY & COMPLIANCE
// ============================================================================

/**
 * Check if user is under COPPA age threshold
 */
function isUnderCOPPA(userData) {
  if (!userData || !userData.gradeLevel) return false;
  
  // Estimate age from grade level (approximate)
  const gradeAges = {
    'k2': 5,
    '3-5': 9,
    '6-8': 12,
    '9-12': 15
  };
  
  const estimatedAge = gradeAges[userData.gradeLevel] || 12;
  return estimatedAge < CONFIG.coppaAgeThreshold;
}

/**
 * Anonymize user ID for COPPA compliance
 */
function anonymizeUserId(userId, userData) {
  if (!userId) return null;
  
  if (isUnderCOPPA(userData)) {
    // Create deterministic hash for COPPA users
    const hash = simpleHash(userId);
    return `anon_${hash}`;
  }
  
  return userId;
}

/**
 * Simple hash function for anonymization
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get user analytics preferences
 */
function getUserPreferences() {
  try {
    const prefs = localStorage.getItem(CONFIG.storageKeys.userPreferences);
    return prefs ? JSON.parse(prefs) : {
      optedOut: false,
      allowTracking: true
    };
  } catch {
    return { optedOut: false, allowTracking: true };
  }
}

/**
 * Set user analytics preferences
 */
function setUserPreferences(preferences) {
  try {
    localStorage.setItem(CONFIG.storageKeys.userPreferences, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if analytics is allowed
 */
function isAnalyticsAllowed(userData) {
  const preferences = getUserPreferences();
  return !preferences.optedOut && preferences.allowTracking;
}

// ============================================================================
// EVENT QUEUE MANAGEMENT
// ============================================================================

/**
 * Get event queue from storage
 */
function getEventQueue() {
  try {
    const queue = localStorage.getItem(CONFIG.storageKeys.eventQueue);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

/**
 * Save event queue to storage
 */
function saveEventQueue(queue) {
  try {
    // Limit queue size
    const limitedQueue = queue.slice(-CONFIG.maxQueueSize);
    localStorage.setItem(CONFIG.storageKeys.eventQueue, JSON.stringify(limitedQueue));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add event to queue
 */
function queueEvent(event) {
  const queue = getEventQueue();
  queue.push({
    ...event,
    timestamp: new Date().toISOString(),
    queuedAt: Date.now()
  });
  saveEventQueue(queue);
}

/**
 * Process event queue
 */
async function processEventQueue() {
  const queue = getEventQueue();
  if (queue.length === 0) return;

  const batch = queue.splice(0, CONFIG.batchSize);
  saveEventQueue(queue);

  for (const event of batch) {
    try {
      await sendEvent(event);
    } catch (error) {
      // Re-queue failed events
      queueEvent(event);
      console.error('Failed to send event:', error);
    }
  }

  // Schedule next batch if queue is not empty
  if (queue.length > 0) {
    setTimeout(processEventQueue, CONFIG.batchInterval);
  }
}

// ============================================================================
// EVENT TRACKING FUNCTIONS
// ============================================================================

/**
 * Track a generic event
 * 
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Event data (privacy-safe)
 */
export function trackEvent(eventName, eventData = {}) {
  if (!isAnalyticsAllowed(eventData.userData)) {
    return;
  }

  const event = {
    eventName,
    eventData: sanitizeEventData(eventData),
    timestamp: new Date().toISOString(),
    sessionId: eventData.sessionId || getCurrentSessionId(),
    userId: anonymizeUserId(eventData.userId, eventData.userData),
    gradeLevel: eventData.gradeLevel || eventData.userData?.gradeLevel,
    userAgent: navigator.userAgent,
    platform: getPlatform()
  };

  // Try to send immediately
  sendEvent(event).catch(() => {
    // Queue for later if send fails
    queueEvent(event);
  });

  // Store locally for reporting
  storeEventLocally(event);
}

/**
 * Track session start
 * 
 * @param {Object} sessionData - Session data
 */
export function trackSessionStart(sessionData) {
  const sessionId = generateSessionId();
  setCurrentSessionId(sessionId);

  const eventData = {
    sessionId,
    scenarioId: sessionData.scenarioId,
    scenarioTitle: sessionData.scenarioTitle,
    category: sessionData.category,
    difficulty: sessionData.difficulty,
    gradeLevel: sessionData.gradeLevel,
    userId: sessionData.userId,
    userData: sessionData.userData || {},
    startedAt: new Date().toISOString()
  };

  // Store session data
  storeSessionData(sessionId, eventData);

  trackEvent('voice_practice_started', eventData);

  return sessionId;
}

/**
 * Track session completion
 * 
 * @param {Object} sessionData - Session data
 * @param {Object} results - Session results
 */
export function trackSessionComplete(sessionData, results) {
  const sessionId = sessionData.sessionId || getCurrentSessionId();
  
  const duration = results.duration || calculateDuration(sessionData.startedAt);
  
  const eventData = {
    sessionId,
    scenarioId: sessionData.scenarioId,
    scenarioTitle: sessionData.scenarioTitle,
    category: sessionData.category,
    difficulty: sessionData.difficulty,
    finalDifficulty: results.finalDifficulty || sessionData.difficulty,
    gradeLevel: sessionData.gradeLevel,
    userId: sessionData.userId,
    userData: sessionData.userData || {},
    duration,
    exchangeCount: results.exchangeCount || 0,
    performanceScore: results.performanceScore || 0,
    completedAt: new Date().toISOString(),
    completionStatus: 'completed'
  };

  trackEvent('voice_practice_completed', eventData);

  // Update session data
  updateSessionData(sessionId, {
    ...eventData,
    completed: true
  });

  clearCurrentSessionId();
}

/**
 * Track session abandonment
 * 
 * @param {Object} sessionData - Session data
 * @param {string} reason - Reason for abandonment
 */
export function trackSessionAbandoned(sessionData, reason = 'unknown') {
  const sessionId = sessionData.sessionId || getCurrentSessionId();
  
  const duration = calculateDuration(sessionData.startedAt);
  
  const eventData = {
    sessionId,
    scenarioId: sessionData.scenarioId,
    scenarioTitle: sessionData.scenarioTitle,
    category: sessionData.category,
    difficulty: sessionData.difficulty,
    gradeLevel: sessionData.gradeLevel,
    userId: sessionData.userId,
    userData: sessionData.userData || {},
    duration,
    exchangeCount: sessionData.exchangeCount || 0,
    abandonedAt: new Date().toISOString(),
    completionStatus: 'abandoned',
    reason
  };

  trackEvent('voice_practice_abandoned', eventData);

  // Update session data
  updateSessionData(sessionId, {
    ...eventData,
    completed: false
  });

  clearCurrentSessionId();
}

/**
 * Track scenario selection
 * 
 * @param {Object} scenarioData - Scenario data
 */
export function trackScenarioSelected(scenarioData) {
  trackEvent('scenario_selected', {
    scenarioId: scenarioData.id,
    scenarioTitle: scenarioData.title,
    category: scenarioData.category,
    difficulty: scenarioData.difficulty,
    gradeLevel: scenarioData.gradeLevel,
    userId: scenarioData.userId,
    userData: scenarioData.userData || {},
    selectedAt: new Date().toISOString()
  });
}

/**
 * Track difficulty adjustment
 * 
 * @param {Object} adjustmentData - Adjustment data
 */
export function trackDifficultyAdjusted(adjustmentData) {
  trackEvent('difficulty_adjusted', {
    sessionId: adjustmentData.sessionId,
    fromDifficulty: adjustmentData.from,
    toDifficulty: adjustmentData.to,
    reason: adjustmentData.reason,
    confidence: adjustmentData.confidence,
    indicators: adjustmentData.indicators,
    exchangeCount: adjustmentData.exchangeCount,
    adjustedAt: new Date().toISOString()
  });
}

/**
 * Track help request
 * 
 * @param {Object} helpData - Help request data
 */
export function trackHelpRequested(helpData) {
  trackEvent('help_requested', {
    sessionId: helpData.sessionId,
    scenarioId: helpData.scenarioId,
    helpType: helpData.helpType || 'general',
    context: helpData.context,
    requestedAt: new Date().toISOString()
  });
}

/**
 * Track excellent response
 * 
 * @param {Object} responseData - Response data
 */
export function trackExcellentResponse(responseData) {
  trackEvent('excellent_response', {
    sessionId: responseData.sessionId,
    scenarioId: responseData.scenarioId,
    responseLength: responseData.responseLength,
    qualityScore: responseData.qualityScore,
    indicators: responseData.indicators,
    detectedAt: new Date().toISOString()
  });
}

/**
 * Track phase transition
 * 
 * @param {Object} phaseData - Phase transition data
 */
export function trackPhaseTransition(phaseData) {
  trackEvent('phase_transition', {
    sessionId: phaseData.sessionId,
    fromPhase: phaseData.from,
    toPhase: phaseData.to,
    transitionTime: phaseData.transitionTime,
    transitionedAt: new Date().toISOString()
  });
}

/**
 * Track error
 * 
 * @param {string} errorType - Type of error
 * @param {Object} errorData - Error details
 */
export function trackError(errorType, errorData = {}) {
  const eventName = `${errorType}_error`;
  
  trackEvent(eventName, {
    sessionId: errorData.sessionId,
    errorType,
    errorMessage: errorData.message || errorData.error?.message,
    errorCode: errorData.code,
    errorStack: errorData.stack || errorData.error?.stack,
    context: errorData.context,
    occurredAt: new Date().toISOString()
  });
}

/**
 * Track technical errors
 */
export function trackMicrophoneError(errorData) {
  trackError('microphone', errorData);
}

export function trackSpeechRecognitionError(errorData) {
  trackError('speech_recognition', errorData);
}

export function trackApiError(errorData) {
  trackError('api', errorData);
}

export function trackTtsError(errorData) {
  trackError('tts', errorData);
}

/**
 * Track user engagement events
 */
export function trackPauseTaken(sessionData) {
  trackEvent('pause_taken', {
    sessionId: sessionData.sessionId,
    pauseDuration: sessionData.pauseDuration,
    pausedAt: new Date().toISOString()
  });
}

export function trackSessionRestarted(sessionData) {
  trackEvent('session_restarted', {
    sessionId: sessionData.sessionId,
    originalSessionId: sessionData.originalSessionId,
    restartedAt: new Date().toISOString()
  });
}

export function trackSettingsChanged(settingsData) {
  trackEvent('settings_changed', {
    userId: settingsData.userId,
    settingType: settingsData.settingType,
    oldValue: settingsData.oldValue,
    newValue: settingsData.newValue,
    changedAt: new Date().toISOString()
  });
}

/**
 * Track performance metrics
 * 
 * @param {Object} metrics - Performance metrics
 */
export function trackPerformance(metrics) {
  trackEvent('performance_metrics', {
    sessionId: metrics.sessionId,
    responseTime: metrics.responseTime,
    processingTime: metrics.processingTime,
    audioLatency: metrics.audioLatency,
    networkLatency: metrics.networkLatency,
    memoryUsage: metrics.memoryUsage,
    recordedAt: new Date().toISOString()
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize event data to remove PII
 */
function sanitizeEventData(eventData) {
  const sanitized = { ...eventData };
  
  // Remove potential PII
  delete sanitized.userData?.name;
  delete sanitized.userData?.email;
  delete sanitized.userData?.phone;
  delete sanitized.userData?.address;
  
  // Remove user message content (keep metadata only)
  if (sanitized.userMessage) {
    sanitized.messageLength = sanitized.userMessage.length;
    sanitized.wordCount = sanitized.userMessage.split(/\s+/).length;
    delete sanitized.userMessage;
  }
  
  return sanitized;
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current session ID
 */
function getCurrentSessionId() {
  try {
    const sessionData = localStorage.getItem(CONFIG.storageKeys.sessionData);
    return sessionData ? JSON.parse(sessionData).sessionId : null;
  } catch {
    return null;
  }
}

/**
 * Set current session ID
 */
function setCurrentSessionId(sessionId) {
  try {
    localStorage.setItem(CONFIG.storageKeys.sessionData, JSON.stringify({
      sessionId,
      startedAt: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear current session ID
 */
function clearCurrentSessionId() {
  try {
    localStorage.removeItem(CONFIG.storageKeys.sessionData);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Store session data
 */
function storeSessionData(sessionId, data) {
  try {
    const key = `${CONFIG.storageKeys.sessionData}_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Update session data
 */
function updateSessionData(sessionId, updates) {
  try {
    const key = `${CONFIG.storageKeys.sessionData}_${sessionId}`;
    const existing = localStorage.getItem(key);
    const data = existing ? JSON.parse(existing) : {};
    const updated = { ...data, ...updates };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Calculate duration in seconds
 */
function calculateDuration(startedAt) {
  if (!startedAt) return 0;
  
  const start = new Date(startedAt);
  const end = new Date();
  return Math.floor((end - start) / 1000);
}

/**
 * Get platform information
 */
function getPlatform() {
  const ua = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  
  return 'unknown';
}

/**
 * Store event locally for reporting
 */
function storeEventLocally(event) {
  try {
    const key = `${CONFIG.storageKeys.reports}_events`;
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.push(event);
    
    // Limit storage size
    const limitedEvents = events.slice(-1000);
    localStorage.setItem(key, JSON.stringify(limitedEvents));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Send event to analytics backend
 */
async function sendEvent(event) {
  // Send to custom analytics endpoint
  if (CONFIG.analyticsEndpoint) {
    try {
      await fetch(CONFIG.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      throw error;
    }
  }

  // Send to Google Analytics (if configured)
  if (CONFIG.gaTrackingId && window.gtag) {
    try {
      window.gtag('event', event.eventName, {
        event_category: 'voice_practice',
        event_label: event.eventData.scenarioId || 'unknown',
        value: event.eventData.duration || event.eventData.exchangeCount || 0,
        custom_map: {
          session_id: event.sessionId,
          grade_level: event.gradeLevel,
          difficulty: event.eventData.difficulty
        }
      });
    } catch (error) {
      console.warn('Google Analytics error:', error);
    }
  }
}

// ============================================================================
// REPORTING FUNCTIONS
// ============================================================================

/**
 * Generate session report
 * 
 * @param {string} sessionId - Session ID
 * @returns {Object} Session report
 */
export function generateSessionReport(sessionId) {
  try {
    const key = `${CONFIG.storageKeys.sessionData}_${sessionId}`;
    const sessionData = JSON.parse(localStorage.getItem(key) || '{}');
    
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const sessionEvents = allEvents.filter(e => e.sessionId === sessionId);
    
    return {
      sessionId,
      sessionData,
      events: sessionEvents,
      summary: {
        duration: sessionData.duration || 0,
        exchangeCount: sessionData.exchangeCount || 0,
        difficultyProgression: extractDifficultyProgression(sessionEvents),
        errorCount: sessionEvents.filter(e => e.eventName.includes('error')).length,
        helpRequests: sessionEvents.filter(e => e.eventName === 'help_requested').length,
        phaseTransitions: sessionEvents.filter(e => e.eventName === 'phase_transition').length
      }
    };
  } catch (error) {
    console.error('Error generating session report:', error);
    return null;
  }
}

/**
 * Generate user report
 * 
 * @param {string} userId - User ID
 * @param {Object} dateRange - Date range {start, end}
 * @returns {Object} User report
 */
export function generateUserReport(userId, dateRange = {}) {
  try {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    
    let userEvents = allEvents.filter(e => e.userId === userId);
    
    // Filter by date range if provided
    if (dateRange.start) {
      userEvents = userEvents.filter(e => new Date(e.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      userEvents = userEvents.filter(e => new Date(e.timestamp) <= new Date(dateRange.end));
    }
    
    const sessions = extractSessions(userEvents);
    
    return {
      userId,
      dateRange,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      abandonedSessions: sessions.filter(s => !s.completed).length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      averageDuration: calculateAverage(sessions.map(s => s.duration || 0)),
      totalExchanges: sessions.reduce((sum, s) => sum + (s.exchangeCount || 0), 0),
      averageExchanges: calculateAverage(sessions.map(s => s.exchangeCount || 0)),
      scenarioDistribution: calculateScenarioDistribution(sessions),
      difficultyDistribution: calculateDifficultyDistribution(sessions),
      errorFrequency: calculateErrorFrequency(userEvents),
      performanceTrend: calculatePerformanceTrend(sessions),
      sessions
    };
  } catch (error) {
    console.error('Error generating user report:', error);
    return null;
  }
}

/**
 * Dashboard queries
 */
export const DashboardQueries = {
  /**
   * Average session duration by grade
   */
  async averageSessionDurationByGrade() {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const completedEvents = allEvents.filter(e => e.eventName === 'voice_practice_completed');
    
    const byGrade = {};
    completedEvents.forEach(event => {
      const grade = event.gradeLevel || 'unknown';
      if (!byGrade[grade]) {
        byGrade[grade] = { total: 0, count: 0 };
      }
      byGrade[grade].total += event.eventData.duration || 0;
      byGrade[grade].count++;
    });
    
    const result = {};
    Object.keys(byGrade).forEach(grade => {
      result[grade] = byGrade[grade].count > 0 
        ? Math.round(byGrade[grade].total / byGrade[grade].count)
        : 0;
    });
    
    return result;
  },

  /**
   * Completion rate by scenario
   */
  async completionRateByScenario() {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    
    const scenarioStats = {};
    
    allEvents.forEach(event => {
      const scenarioId = event.eventData.scenarioId || 'unknown';
      if (!scenarioStats[scenarioId]) {
        scenarioStats[scenarioId] = {
          started: 0,
          completed: 0,
          abandoned: 0
        };
      }
      
      if (event.eventName === 'voice_practice_started') {
        scenarioStats[scenarioId].started++;
      } else if (event.eventName === 'voice_practice_completed') {
        scenarioStats[scenarioId].completed++;
      } else if (event.eventName === 'voice_practice_abandoned') {
        scenarioStats[scenarioId].abandoned++;
      }
    });
    
    const result = {};
    Object.keys(scenarioStats).forEach(scenarioId => {
      const stats = scenarioStats[scenarioId];
      const total = stats.started || 1;
      result[scenarioId] = {
        started: stats.started,
        completed: stats.completed,
        abandoned: stats.abandoned,
        completionRate: Math.round((stats.completed / total) * 100),
        abandonmentRate: Math.round((stats.abandoned / total) * 100)
      };
    });
    
    return result;
  },

  /**
   * Common errors/issues
   */
  async commonErrors() {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const errorEvents = allEvents.filter(e => e.eventName.includes('error'));
    
    const errorCounts = {};
    errorEvents.forEach(event => {
      const errorType = event.eventName.replace('_error', '');
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Difficulty distribution
   */
  async difficultyDistribution() {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const completedEvents = allEvents.filter(e => e.eventName === 'voice_practice_completed');
    
    const distribution = { easy: 0, moderate: 0, hard: 0 };
    completedEvents.forEach(event => {
      const difficulty = event.eventData.finalDifficulty || event.eventData.difficulty || 'moderate';
      if (distribution[difficulty] !== undefined) {
        distribution[difficulty]++;
      }
    });
    
    return distribution;
  },

  /**
   * Performance trends over time
   */
  async performanceTrends(days = 30) {
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEvents = allEvents.filter(e => new Date(e.timestamp) >= cutoffDate);
    const completedEvents = recentEvents.filter(e => e.eventName === 'voice_practice_completed');
    
    // Group by day
    const byDay = {};
    completedEvents.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = {
          sessions: 0,
          totalDuration: 0,
          totalExchanges: 0,
          averageScore: 0,
          scoreSum: 0
        };
      }
      byDay[date].sessions++;
      byDay[date].totalDuration += event.eventData.duration || 0;
      byDay[date].totalExchanges += event.eventData.exchangeCount || 0;
      byDay[date].scoreSum += event.eventData.performanceScore || 0;
    });
    
    // Calculate averages
    const result = Object.entries(byDay).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      averageDuration: Math.round(data.totalDuration / data.sessions),
      averageExchanges: Math.round(data.totalExchanges / data.sessions),
      averageScore: Math.round((data.scoreSum / data.sessions) * 100) / 100
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return result;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractDifficultyProgression(events) {
  const adjustments = events.filter(e => e.eventName === 'difficulty_adjusted');
  return adjustments.map(e => ({
    from: e.eventData.fromDifficulty,
    to: e.eventData.toDifficulty,
    at: e.timestamp,
    reason: e.eventData.reason
  }));
}

function extractSessions(events) {
  const sessions = {};
  
  events.forEach(event => {
    const sessionId = event.sessionId;
    if (!sessionId) return;
    
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        sessionId,
        started: null,
        completed: false,
        duration: 0,
        exchangeCount: 0,
        difficulty: null,
        scenarioId: null
      };
    }
    
    if (event.eventName === 'voice_practice_started') {
      sessions[sessionId].started = event.timestamp;
      sessions[sessionId].scenarioId = event.eventData.scenarioId;
      sessions[sessionId].difficulty = event.eventData.difficulty;
    } else if (event.eventName === 'voice_practice_completed') {
      sessions[sessionId].completed = true;
      sessions[sessionId].duration = event.eventData.duration || 0;
      sessions[sessionId].exchangeCount = event.eventData.exchangeCount || 0;
    } else if (event.eventName === 'voice_practice_abandoned') {
      sessions[sessionId].completed = false;
      sessions[sessionId].duration = event.eventData.duration || 0;
      sessions[sessionId].exchangeCount = event.eventData.exchangeCount || 0;
    }
  });
  
  return Object.values(sessions);
}

function calculateAverage(values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

function calculateScenarioDistribution(sessions) {
  const distribution = {};
  sessions.forEach(session => {
    const scenarioId = session.scenarioId || 'unknown';
    distribution[scenarioId] = (distribution[scenarioId] || 0) + 1;
  });
  return distribution;
}

function calculateDifficultyDistribution(sessions) {
  const distribution = { easy: 0, moderate: 0, hard: 0 };
  sessions.forEach(session => {
    const difficulty = session.difficulty || 'moderate';
    if (distribution[difficulty] !== undefined) {
      distribution[difficulty]++;
    }
  });
  return distribution;
}

function calculateErrorFrequency(events) {
  const errorCounts = {};
  events.filter(e => e.eventName.includes('error')).forEach(event => {
    const errorType = event.eventName.replace('_error', '');
    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
  });
  return errorCounts;
}

function calculatePerformanceTrend(sessions) {
  // Sort by start time
  const sorted = sessions
    .filter(s => s.started)
    .sort((a, b) => new Date(a.started) - new Date(b.started));
  
  if (sorted.length === 0) return [];
  
  // Calculate moving average of performance indicators
  const trend = [];
  const windowSize = Math.min(5, Math.floor(sorted.length / 3));
  
  for (let i = 0; i < sorted.length; i++) {
    const window = sorted.slice(Math.max(0, i - windowSize), i + 1);
    trend.push({
      index: i,
      sessionId: sorted[i].sessionId,
      duration: sorted[i].duration || 0,
      averageDuration: calculateAverage(window.map(s => s.duration || 0)),
      exchangeCount: sorted[i].exchangeCount || 0,
      averageExchanges: calculateAverage(window.map(s => s.exchangeCount || 0))
    });
  }
  
  return trend;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize analytics system
 */
export function initializeAnalytics(config = {}) {
  // Merge config
  Object.assign(CONFIG, config);
  
  // Start processing queue
  processEventQueue();
  
  // Set up periodic queue processing
  setInterval(processEventQueue, CONFIG.batchInterval);
  
  // Clean up old data
  cleanupOldData();
}

/**
 * Clean up old data beyond retention period
 */
function cleanupOldData() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.retentionDays);
    
    const eventsKey = `${CONFIG.storageKeys.reports}_events`;
    const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const recentEvents = allEvents.filter(e => new Date(e.timestamp) >= cutoffDate);
    localStorage.setItem(eventsKey, JSON.stringify(recentEvents));
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Opt out of analytics
 */
export function optOut() {
  setUserPreferences({ optedOut: true, allowTracking: false });
}

/**
 * Opt in to analytics
 */
export function optIn() {
  setUserPreferences({ optedOut: false, allowTracking: true });
}

// Default export
export default {
  trackEvent,
  trackSessionStart,
  trackSessionComplete,
  trackSessionAbandoned,
  trackScenarioSelected,
  trackDifficultyAdjusted,
  trackHelpRequested,
  trackExcellentResponse,
  trackPhaseTransition,
  trackError,
  trackMicrophoneError,
  trackSpeechRecognitionError,
  trackApiError,
  trackTtsError,
  trackPauseTaken,
  trackSessionRestarted,
  trackSettingsChanged,
  trackPerformance,
  generateSessionReport,
  generateUserReport,
  DashboardQueries,
  initializeAnalytics,
  optOut,
  optIn,
  getUserPreferences,
  setUserPreferences
};


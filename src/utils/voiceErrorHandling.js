/**
 * Voice Practice Error Handling Utilities
 * 
 * Comprehensive error handling functions for voice practice features.
 * Provides error categorization, user-friendly messages, recovery strategies,
 * and logging functionality.
 * 
 * @module voiceErrorHandling
 */

// ============================================================================
// ERROR TYPES AND CATEGORIES
// ============================================================================

/**
 * Error type categories
 * @enum {string}
 */
export const ErrorType = {
  MICROPHONE: 'microphone',
  SPEECH_RECOGNITION: 'speech-recognition',
  API: 'api',
  TEXT_TO_SPEECH: 'text-to-speech',
  NETWORK: 'network',
  BROWSER: 'browser',
  PERMISSION: 'permission',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 * @enum {string}
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

/**
 * Categorize an error based on its properties
 * @param {Error|Object} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Categorized error information
 */
export function categorizeError(error, context = {}) {
  const errorMessage = String(error?.message || '').toLowerCase();
  const errorName = String(error?.name || '').toLowerCase();
  const errorCode = error?.code || error?.status || '';
  
  let errorType = ErrorType.UNKNOWN;
  let severity = ErrorSeverity.MEDIUM;
  let recoverable = true;
  let requiresUserAction = false;

  // Microphone Errors
  if (
    errorMessage.includes('microphone') ||
    errorMessage.includes('mic') ||
    errorMessage.includes('audio-capture') ||
    errorMessage.includes('notallowederror') ||
    errorName.includes('notallowederror') ||
    errorCode === 'NotAllowedError' ||
    context.source === 'microphone'
  ) {
    errorType = ErrorType.MICROPHONE;
    severity = ErrorSeverity.HIGH;
    requiresUserAction = true;
  }
  
  // Permission Errors
  else if (
    errorMessage.includes('permission') ||
    errorMessage.includes('not-allowed') ||
    errorMessage.includes('denied') ||
    errorCode === 403 ||
    errorCode === 'PermissionDeniedError'
  ) {
    errorType = ErrorType.PERMISSION;
    severity = ErrorSeverity.HIGH;
    requiresUserAction = true;
  }
  
  // Speech Recognition Errors
  else if (
    errorMessage.includes('speech recognition') ||
    errorMessage.includes('recognition') ||
    errorMessage.includes('webkit') ||
    errorMessage.includes('speech api') ||
    errorMessage.includes('not supported') ||
    context.source === 'speech-recognition'
  ) {
    errorType = ErrorType.SPEECH_RECOGNITION;
    severity = ErrorSeverity.MEDIUM;
    recoverable = true;
  }
  
  // Network Errors
  else if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('failed to fetch') ||
    errorName.includes('networkerror') ||
    errorCode === 'NetworkError' ||
    navigator.onLine === false
  ) {
    errorType = ErrorType.NETWORK;
    severity = ErrorSeverity.HIGH;
    recoverable = true;
  }
  
  // API Errors
  else if (
    errorMessage.includes('api') ||
    errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('rate limit') ||
    errorCode >= 500 ||
    errorCode === 429 ||
    context.source === 'api'
  ) {
    errorType = ErrorType.API;
    severity = errorCode === 429 ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH;
    recoverable = true;
  }
  
  // Timeout Errors
  else if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorName.includes('timeout') ||
    errorCode === 'TimeoutError'
  ) {
    errorType = ErrorType.TIMEOUT;
    severity = ErrorSeverity.MEDIUM;
    recoverable = true;
  }
  
  // Text-to-Speech Errors
  else if (
    errorMessage.includes('speech synthesis') ||
    errorMessage.includes('tts') ||
    errorMessage.includes('audio playback') ||
    errorMessage.includes('elevenlabs') ||
    errorMessage.includes('voice') ||
    context.source === 'text-to-speech'
  ) {
    errorType = ErrorType.TEXT_TO_SPEECH;
    severity = ErrorSeverity.LOW;
    recoverable = true;
  }
  
  // Browser Compatibility Errors
  else if (
    errorMessage.includes('browser') ||
    errorMessage.includes('not supported') ||
    errorMessage.includes('compatibility') ||
    errorMessage.includes('not available')
  ) {
    errorType = ErrorType.BROWSER;
    severity = ErrorSeverity.HIGH;
    recoverable = false;
    requiresUserAction = true;
  }

  return {
    type: errorType,
    severity,
    recoverable,
    requiresUserAction,
    originalError: error,
    context
  };
}

// ============================================================================
// GRADE-LEVEL ERROR MESSAGES
// ============================================================================

/**
 * Get grade-level appropriate error message
 * @param {string} errorType - Error type
 * @param {string} gradeLevel - Grade level (K-12 format)
 * @returns {Object} User-friendly error message
 */
export function getErrorMessage(errorType, gradeLevel = '6') {
  const gradeRange = getGradeRange(gradeLevel);
  
  const messages = {
    [ErrorType.MICROPHONE]: {
      k2: {
        title: "Oops! The microphone isn't working.",
        message: "Let's ask a grown-up for help! They can check if the microphone is turned on.",
        icon: 'mic-off',
        color: 'red'
      },
      '3-5': {
        title: "Having trouble with the microphone.",
        message: "Try these steps: 1) Check if your microphone is plugged in. 2) Click the microphone button in your browser. 3) Ask an adult if you need help.",
        icon: 'mic-off',
        color: 'red'
      },
      '6-8': {
        title: "Microphone issue detected.",
        message: "Here's how to fix it: Click the lock icon in your browser's address bar, then allow microphone access. If that doesn't work, check your device settings.",
        icon: 'mic-off',
        color: 'red'
      },
      '9-12': {
        title: "Microphone access required.",
        message: "Please check your browser settings. Click the lock icon in the address bar and ensure microphone permissions are enabled. You may also need to check your device's privacy settings.",
        icon: 'mic-off',
        color: 'red'
      }
    },
    
    [ErrorType.SPEECH_RECOGNITION]: {
      k2: {
        title: "Can't hear you right now.",
        message: "Let's try again! Make sure you're speaking clearly and the microphone is working.",
        icon: 'mic',
        color: 'yellow'
      },
      '3-5': {
        title: "Speech recognition not working.",
        message: "Try speaking more clearly, or check if your microphone is working. You might need to try a different browser.",
        icon: 'mic',
        color: 'yellow'
      },
      '6-8': {
        title: "Speech recognition error.",
        message: "Your browser might not support voice recognition, or there's a connection issue. Try refreshing the page or using a different browser like Chrome or Edge.",
        icon: 'mic',
        color: 'yellow'
      },
      '9-12': {
        title: "Speech recognition unavailable.",
        message: "Your browser may not support speech recognition, or there's a technical issue. Try using Chrome or Edge, or switch to text-based mode.",
        icon: 'mic',
        color: 'yellow'
      }
    },
    
    [ErrorType.API]: {
      k2: {
        title: "Having trouble connecting.",
        message: "The app needs the internet to work. Ask a grown-up to check if you're connected to Wi-Fi.",
        icon: 'wifi-off',
        color: 'orange'
      },
      '3-5': {
        title: "Connection problem.",
        message: "Check if you're connected to the internet. If you are, try again in a few moments.",
        icon: 'wifi-off',
        color: 'orange'
      },
      '6-8': {
        title: "API connection error.",
        message: "There's a problem connecting to our servers. Check your internet connection and try again. If the problem persists, try refreshing the page.",
        icon: 'wifi-off',
        color: 'orange'
      },
      '9-12': {
        title: "Service connection error.",
        message: "Unable to connect to our servers. This could be due to network issues, server maintenance, or rate limiting. Please try again in a few moments.",
        icon: 'wifi-off',
        color: 'orange'
      }
    },
    
    [ErrorType.TEXT_TO_SPEECH]: {
      k2: {
        title: "Can't play sound right now.",
        message: "That's okay! You can still read what Cue says on the screen.",
        icon: 'volume-x',
        color: 'purple'
      },
      '3-5': {
        title: "Audio playback issue.",
        message: "The sound isn't working, but you can still read everything on the screen. Try checking your device's volume settings.",
        icon: 'volume-x',
        color: 'purple'
      },
      '6-8': {
        title: "Text-to-speech error.",
        message: "Audio playback isn't working. You can continue by reading the text on screen. Check your browser's audio settings or try refreshing.",
        icon: 'volume-x',
        color: 'purple'
      },
      '9-12': {
        title: "Audio playback unavailable.",
        message: "Text-to-speech is not functioning. You can continue by reading the conversation text. Check your browser's audio permissions and settings.",
        icon: 'volume-x',
        color: 'purple'
      }
    },
    
    [ErrorType.NETWORK]: {
      k2: {
        title: "No internet connection.",
        message: "You need the internet to play. Ask a grown-up to help you connect.",
        icon: 'wifi-off',
        color: 'blue'
      },
      '3-5': {
        title: "You're offline.",
        message: "Check if you're connected to Wi-Fi or the internet. Try refreshing the page once you're connected.",
        icon: 'wifi-off',
        color: 'blue'
      },
      '6-8': {
        title: "No internet connection detected.",
        message: "You appear to be offline. Check your internet connection and try again. Your progress will be saved.",
        icon: 'wifi-off',
        color: 'blue'
      },
      '9-12': {
        title: "Offline mode detected.",
        message: "No internet connection available. Your progress will be saved locally. Connect to the internet and refresh to continue.",
        icon: 'wifi-off',
        color: 'blue'
      }
    },
    
    [ErrorType.BROWSER]: {
      k2: {
        title: "This browser doesn't work.",
        message: "Ask a grown-up to help you use Chrome or Firefox.",
        icon: 'help-circle',
        color: 'indigo'
      },
      '3-5': {
        title: "Browser not supported.",
        message: "This browser doesn't work with voice practice. Try using Chrome, Firefox, or Edge instead.",
        icon: 'help-circle',
        color: 'indigo'
      },
      '6-8': {
        title: "Browser compatibility issue.",
        message: "Your browser doesn't fully support voice features. Please use Chrome, Firefox, or Edge for the best experience.",
        icon: 'help-circle',
        color: 'indigo'
      },
      '9-12': {
        title: "Browser not supported.",
        message: "Your current browser doesn't support all voice features. For the best experience, use Chrome, Firefox, or Edge. You can continue in text mode.",
        icon: 'help-circle',
        color: 'indigo'
      }
    },
    
    [ErrorType.TIMEOUT]: {
      k2: {
        title: "Taking too long.",
        message: "Let's try again! The internet might be slow right now.",
        icon: 'clock',
        color: 'yellow'
      },
      '3-5': {
        title: "Request timed out.",
        message: "The request took too long. Try again in a moment.",
        icon: 'clock',
        color: 'yellow'
      },
      '6-8': {
        title: "Request timeout.",
        message: "The request took too long to complete. Check your internet connection and try again.",
        icon: 'clock',
        color: 'yellow'
      },
      '9-12': {
        title: "Connection timeout.",
        message: "The request timed out. This could be due to slow network or server issues. Please try again.",
        icon: 'clock',
        color: 'yellow'
      }
    },
    
    [ErrorType.UNKNOWN]: {
      k2: {
        title: "Something went wrong.",
        message: "Don't worry! Try again or ask a grown-up for help.",
        icon: 'alert-circle',
        color: 'red'
      },
      '3-5': {
        title: "Something unexpected happened.",
        message: "Don't worry! Try refreshing the page or ask an adult for help.",
        icon: 'alert-circle',
        color: 'red'
      },
      '6-8': {
        title: "An error occurred.",
        message: "Something went wrong. Try refreshing the page. If the problem continues, you can save your progress and try again later.",
        icon: 'alert-circle',
        color: 'red'
      },
      '9-12': {
        title: "Unexpected error occurred.",
        message: "An error has occurred. Try refreshing the page. If the issue persists, save your progress and contact support.",
        icon: 'alert-circle',
        color: 'red'
      }
    }
  };

  return messages[errorType]?.[gradeRange] || messages[ErrorType.UNKNOWN][gradeRange];
}

/**
 * Get grade range from grade level
 * @param {string|number} gradeLevel - Grade level
 * @returns {string} Grade range ('k2', '3-5', '6-8', '9-12')
 */
function getGradeRange(gradeLevel) {
  const grade = typeof gradeLevel === 'string' ? parseInt(gradeLevel) || 6 : gradeLevel;
  if (grade <= 2) return 'k2';
  if (grade <= 5) return '3-5';
  if (grade <= 8) return '6-8';
  return '9-12';
}

// ============================================================================
// TROUBLESHOOTING STEPS
// ============================================================================

/**
 * Get troubleshooting steps for error type
 * @param {string} errorType - Error type
 * @returns {string[]} Array of troubleshooting steps
 */
export function getTroubleshootingSteps(errorType) {
  const steps = {
    [ErrorType.MICROPHONE]: [
      'Check if your microphone is connected',
      'Click the lock icon in your browser\'s address bar',
      'Allow microphone access',
      'Check your device\'s privacy settings',
      'Try refreshing the page'
    ],
    [ErrorType.SPEECH_RECOGNITION]: [
      'Make sure you\'re speaking clearly',
      'Check your microphone is working',
      'Try using Chrome or Edge browser',
      'Check your internet connection',
      'Refresh the page'
    ],
    [ErrorType.API]: [
      'Check your internet connection',
      'Wait a few moments and try again',
      'Refresh the page',
      'Check if the service is down',
      'Clear your browser cache'
    ],
    [ErrorType.TEXT_TO_SPEECH]: [
      'Check your device volume',
      'Check browser audio permissions',
      'Try refreshing the page',
      'Continue reading text instead',
      'Check if audio is muted'
    ],
    [ErrorType.NETWORK]: [
      'Check your Wi-Fi connection',
      'Check your internet connection',
      'Try refreshing the page',
      'Save your progress',
      'Try again when connected'
    ],
    [ErrorType.BROWSER]: [
      'Try using Chrome browser',
      'Try using Firefox browser',
      'Try using Edge browser',
      'Update your browser',
      'Continue without voice features'
    ],
    [ErrorType.TIMEOUT]: [
      'Check your internet connection speed',
      'Try again in a moment',
      'Refresh the page',
      'Check if the service is busy',
      'Try a different network'
    ]
  };

  return steps[errorType] || ['Try refreshing the page', 'Contact support if the problem persists'];
}

// ============================================================================
// RECOVERY STRATEGIES
// ============================================================================

/**
 * Determine recovery strategy for error
 * @param {Object} errorInfo - Categorized error information
 * @returns {Object} Recovery strategy options
 */
export function getRecoveryStrategy(errorInfo) {
  const { type, severity, recoverable, requiresUserAction } = errorInfo;
  
  const strategies = {
    automaticRetry: recoverable && !requiresUserAction,
    manualRetry: recoverable,
    fallbackToText: type === ErrorType.TEXT_TO_SPEECH || type === ErrorType.SPEECH_RECOGNITION,
    saveAndResume: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL,
    skipPhase: type === ErrorType.API && severity === ErrorSeverity.MEDIUM,
    contactSupport: severity === ErrorSeverity.CRITICAL || !recoverable
  };

  return strategies;
}

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attemptNumber - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} maxDelay - Maximum delay in milliseconds (default: 8000)
 * @returns {number} Delay in milliseconds
 */
export function calculateRetryDelay(attemptNumber, baseDelay = 1000, maxDelay = 8000) {
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  return delay;
}

/**
 * Create retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 8000)
 * @returns {Promise} Promise that resolves with function result or rejects after max retries
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 8000
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt, baseDelay, maxDelay);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error with context
 * @param {Error|Object} error - Error object
 * @param {Object} context - Additional context
 * @param {Object} options - Logging options
 */
export function logError(error, context = {}, options = {}) {
  const {
    sessionId,
    userId,
    gradeLevel,
    componentName,
    action,
    severity = ErrorSeverity.MEDIUM
  } = context;

  const errorInfo = categorizeError(error, context);
  
  const logData = {
    error: {
      message: error?.message || String(error),
      name: error?.name || 'Error',
      stack: error?.stack,
      type: errorInfo.type,
      severity: errorInfo.severity
    },
    context: {
      sessionId,
      userId,
      gradeLevel,
      componentName,
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      online: navigator.onLine
    },
    recovery: {
      recoverable: errorInfo.recoverable,
      requiresUserAction: errorInfo.requiresUserAction,
      strategy: getRecoveryStrategy(errorInfo)
    }
  };

  // Console logging (development)
  if (process.env.NODE_ENV === 'development' || options.forceConsole) {
    console.group(`🔴 Voice Practice Error [${errorInfo.type}]`);
    console.error('Error:', logData.error);
    console.error('Context:', logData.context);
    console.error('Recovery:', logData.recovery);
    if (error?.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }

  // Analytics logging
  if (window.analytics && typeof window.analytics.track === 'function') {
    try {
      window.analytics.track('Voice Practice Error', {
        errorType: errorInfo.type,
        errorMessage: error?.message,
        severity: errorInfo.severity,
        recoverable: errorInfo.recoverable,
        sessionId,
        userId,
        gradeLevel,
        componentName,
        action
      });
    } catch (analyticsError) {
      console.warn('Failed to send error to analytics:', analyticsError);
    }
  }

  // Error reporting service (if configured)
  if (options.reportToService && typeof options.reportToService === 'function') {
    try {
      options.reportToService(logData);
    } catch (reportError) {
      console.warn('Failed to report error to service:', reportError);
    }
  }

  return logData;
}

// ============================================================================
// FALLBACK HANDLERS
// ============================================================================

/**
 * Handle fallback to text mode
 * @param {Object} context - Current context
 * @returns {Object} Fallback configuration
 */
export function handleTextModeFallback(context = {}) {
  console.log('🔄 Falling back to text mode');
  
  return {
    mode: 'text',
    message: 'Voice features are unavailable. Continuing in text mode.',
    persist: true,
    context
  };
}

/**
 * Save progress for later resume
 * @param {Object} sessionData - Session data to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveProgressForResume(sessionData) {
  try {
    const storageKey = `voice_session_${sessionData.sessionId}_resume`;
    const resumeData = {
      ...sessionData,
      savedAt: new Date().toISOString(),
      resumeUrl: window.location.href
    };
    
    localStorage.setItem(storageKey, JSON.stringify(resumeData));
    
    // Also update user's session list
    const userSessionsKey = `user_${sessionData.userId}_voice_sessions`;
    const userSessions = JSON.parse(localStorage.getItem(userSessionsKey) || '[]');
    const sessionIndex = userSessions.findIndex(s => s.sessionId === sessionData.sessionId);
    
    if (sessionIndex >= 0) {
      userSessions[sessionIndex] = {
        ...userSessions[sessionIndex],
        ...resumeData,
        needsResume: true
      };
    } else {
      userSessions.push({
        sessionId: sessionData.sessionId,
        ...resumeData,
        needsResume: true
      });
    }
    
    localStorage.setItem(userSessionsKey, JSON.stringify(userSessions));
    
    return true;
  } catch (error) {
    console.error('Failed to save progress:', error);
    return false;
  }
}

// ============================================================================
// ERROR BOUNDARY HELPERS
// ============================================================================

/**
 * Create error boundary props handler
 * @param {Object} props - Component props
 * @returns {Object} Error boundary handler functions
 */
export function createErrorBoundaryHandlers(props = {}) {
  return {
    onError: (errorContext) => {
      if (props.onError) {
        props.onError(errorContext);
      }
    },
    onFallback: (fallbackType) => {
      if (props.onFallback) {
        props.onFallback(fallbackType);
      }
    },
    onSkipPhase: () => {
      if (props.onSkipPhase) {
        props.onSkipPhase();
      }
    },
    onSaveProgress: () => {
      if (props.onSaveProgress) {
        props.onSaveProgress();
      }
    },
    onGoHome: () => {
      if (props.onGoHome) {
        props.onGoHome();
      } else {
        window.location.href = '/';
      }
    },
    onContactSupport: (error) => {
      if (props.onContactSupport) {
        props.onContactSupport(error);
      }
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ErrorType,
  ErrorSeverity,
  categorizeError,
  getErrorMessage,
  getTroubleshootingSteps,
  getRecoveryStrategy,
  calculateRetryDelay,
  retryWithBackoff,
  logError,
  handleTextModeFallback,
  saveProgressForResume,
  createErrorBoundaryHandlers
};


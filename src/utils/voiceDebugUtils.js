/**
 * Debug Utility for Voice Practice
 * 
 * Centralized logging utility that respects environment flags and
 * provides structured logging for development and production.
 * 
 * @module voiceDebugUtils
 */

import { config } from '../config/appConfig.js';

/**
 * Debug flag - only log in development mode
 */
const DEBUG = config.features.devMode || import.meta.env.DEV;

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Current log level (can be overridden via env)
 */
const CURRENT_LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || (DEBUG ? LogLevel.DEBUG : LogLevel.ERROR);

/**
 * Structured logger
 */
class VoiceLogger {
  constructor(prefix = 'Voice Practice') {
    this.prefix = prefix;
  }

  /**
   * Check if should log at given level
   */
  shouldLog(level) {
    return level >= CURRENT_LOG_LEVEL;
  }

  /**
   * Debug log
   */
  debug(...args) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`🔍 [${this.prefix}]`, ...args);
    }
  }

  /**
   * Info log
   */
  info(...args) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`ℹ️ [${this.prefix}]`, ...args);
    }
  }

  /**
   * Warn log
   */
  warn(...args) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`⚠️ [${this.prefix}]`, ...args);
    }
  }

  /**
   * Error log
   */
  error(...args) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`❌ [${this.prefix}]`, ...args);
    }
  }

  /**
   * Group logs
   */
  group(label, fn) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(`📦 [${this.prefix}] ${label}`);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    } else {
      fn();
    }
  }

  /**
   * Performance log
   */
  performance(name, duration, context = {}) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`⚡ [${this.prefix}] ${name}: ${duration.toFixed(2)}ms`, context);
    }
  }

  /**
   * API call log
   */
  apiCall(endpoint, method, duration, success, error = null) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const icon = success ? '✅' : '❌';
      console.log(`${icon} [${this.prefix}] API ${method} ${endpoint}: ${duration.toFixed(2)}ms`, error || '');
    }
  }
}

/**
 * Create logger instance
 */
export function createLogger(prefix) {
  return new VoiceLogger(prefix);
}

/**
 * Default logger
 */
export const logger = createLogger('Voice Practice');

/**
 * Legacy console.log wrapper (for gradual migration)
 */
export function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

/**
 * Legacy console.error wrapper
 */
export function debugError(...args) {
  if (DEBUG) {
    console.error(...args);
  }
}

/**
 * Legacy console.warn wrapper
 */
export function debugWarn(...args) {
  if (DEBUG) {
    console.warn(...args);
  }
}

export default {
  logger,
  createLogger,
  debugLog,
  debugError,
  debugWarn,
  LogLevel
};


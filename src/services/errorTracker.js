/**
 * Error Tracking Service for Social Cue App
 * Provides centralized error logging and tracking
 */

import { config } from '../config/appConfig.js';

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors in memory
  }

  /**
   * Track an error with context
   */
  track(error, context = {}) {
    const errorData = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || error.toString(),
      stack: error.stack,
      type: error.name || 'Error',
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      },
      category: this.categorizeError(error, context)
    };

    // Add to local storage
    this.errors.push(errorData);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console in development
    if (config.features.devMode) {
      console.error('🚨 Error Tracked:', errorData);
    }

    // Send to external service in production
    if (config.features.errorTracking && config.features.devMode === false) {
      this.sendToExternalService(errorData);
    }

    return errorData.id;
  }

  /**
   * Track voice-specific errors
   */
  trackVoiceError(error, voiceContext = {}) {
    return this.track(error, {
      ...voiceContext,
      category: 'voice',
      voiceEnabled: config.features.voicePractice,
      browserSupport: this.checkVoiceSupport()
    });
  }

  /**
   * Track API errors
   */
  trackApiError(error, apiContext = {}) {
    return this.track(error, {
      ...apiContext,
      category: 'api',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track permission errors
   */
  trackPermissionError(error, permissionType) {
    return this.track(error, {
      permissionType,
      category: 'permission',
      userAgent: navigator.userAgent
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp) > last24Hours
    );

    const stats = {
      total: this.errors.length,
      last24Hours: recentErrors.length,
      byCategory: {},
      byType: {},
      recent: recentErrors.slice(-10) // Last 10 errors
    };

    // Categorize errors
    this.errors.forEach(error => {
      const category = error.category || 'unknown';
      const type = error.type || 'Error';
      
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors() {
    return {
      errors: this.errors,
      stats: this.getErrorStats(),
      config: {
        maxErrors: this.maxErrors,
        errorTracking: config.features.errorTracking,
        devMode: config.features.devMode
      }
    };
  }

  // Private methods

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  categorizeError(error, context) {
    if (context.category) return context.category;
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return config.errors.categories.NETWORK;
    }
    if (message.includes('audio') || message.includes('microphone')) {
      return config.errors.categories.AUDIO;
    }
    if (message.includes('speech') || message.includes('recognition')) {
      return config.errors.categories.SPEECH_RECOGNITION;
    }
    if (message.includes('tts') || message.includes('synthesis')) {
      return config.errors.categories.TTS;
    }
    if (message.includes('permission') || message.includes('denied')) {
      return config.errors.categories.PERMISSION;
    }
    if (message.includes('api') || message.includes('http')) {
      return config.errors.categories.API;
    }
    
    return 'unknown';
  }

  getUserId() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('voice_practice_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('voice_practice_session_id', sessionId);
    }
    return sessionId;
  }

  checkVoiceSupport() {
    return {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window,
      mediaDevices: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    };
  }

  sendToExternalService(errorData) {
    // In production, this would send to an external error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    // For now, we'll just log it
    console.log('📤 Sending error to external service:', errorData);
    
    // Example implementation:
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.error('Failed to send error to external service:', err);
    });
    */
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Export convenience functions
export const trackError = (error, context) => errorTracker.track(error, context);
export const trackVoiceError = (error, context) => errorTracker.trackVoiceError(error, context);
export const trackApiError = (error, context) => errorTracker.trackApiError(error, context);
export const trackPermissionError = (error, permissionType) => errorTracker.trackPermissionError(error, permissionType);
export const getErrorStats = () => errorTracker.getErrorStats();
export const clearErrors = () => errorTracker.clearErrors();
export const exportErrors = () => errorTracker.exportErrors();

export default errorTracker;

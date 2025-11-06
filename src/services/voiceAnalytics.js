/**
 * Voice Analytics Service
 * 
 * Comprehensive analytics tracking for voice practice feature.
 * Tracks user interactions, performance metrics, and conversion funnels.
 * 
 * @module VoiceAnalytics
 */

import { config } from '../config/appConfig.js';

/**
 * Voice Analytics Service Class
 */
class VoiceAnalytics {
  constructor() {
    this.isDevelopment = config.features.devMode || import.meta.env.DEV;
    this.conversionFunnel = {
      viewedCard: 0,
      clickedStart: 0,
      grantedPermission: 0,
      startedConversation: 0,
      completedPractice: 0
    };
    this.sessionStartTime = null;
    this.currentScenarioId = null;
  }

  /**
   * Get user ID from storage
   */
  getUserId() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.userId || userData.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get grade level from storage
   */
  getGradeLevel() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.grade || userData.gradeLevel || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Send event to analytics service
   */
  sendEvent(eventName, eventData) {
    const timestamp = new Date().toISOString();
    const fullEventData = {
      ...eventData,
      timestamp,
      userId: this.getUserId(),
      gradeLevel: this.getGradeLevel(),
      sessionId: this.sessionStartTime ? `session_${this.sessionStartTime}` : null
    };

    // Development: console.log
    if (this.isDevelopment) {
      console.log(`📊 Voice Analytics [${eventName}]:`, fullEventData);
    }

    // Production: Send to analytics service
    if (!this.isDevelopment) {
      // Google Analytics (gtag)
      if (typeof window !== 'undefined' && window.gtag) {
        try {
          window.gtag('event', eventName, {
            event_category: 'voice_practice',
            event_label: eventData.scenarioId || 'unknown',
            value: eventData.duration || eventData.exchangeCount || eventData.latencyMs || 0,
            ...fullEventData
          });
        } catch (error) {
          console.error('Error sending to Google Analytics:', error);
        }
      }

      // Generic analytics service (window.analytics)
      if (typeof window !== 'undefined' && window.analytics && typeof window.analytics.track === 'function') {
        try {
          window.analytics.track(eventName, fullEventData);
        } catch (error) {
          console.error('Error sending to analytics service:', error);
        }
      }

      // Amplitude
      if (typeof window !== 'undefined' && window.amplitude && typeof window.amplitude.getInstance === 'function') {
        try {
          const amplitudeInstance = window.amplitude.getInstance();
          amplitudeInstance.logEvent(eventName, fullEventData);
        } catch (error) {
          console.error('Error sending to Amplitude:', error);
        }
      }

      // Mixpanel
      if (typeof window !== 'undefined' && window.mixpanel && typeof window.mixpanel.track === 'function') {
        try {
          window.mixpanel.track(eventName, fullEventData);
        } catch (error) {
          console.error('Error sending to Mixpanel:', error);
        }
      }
    }

    return fullEventData;
  }

  /**
   * Track when voice practice session begins
   * @param {string} scenarioId - Scenario ID
   * @param {string} gradeLevel - User's grade level
   */
  trackVoicePracticeStarted(scenarioId, gradeLevel) {
    this.currentScenarioId = scenarioId;
    this.sessionStartTime = Date.now();
    
    // Update conversion funnel
    this.conversionFunnel.startedConversation++;

    return this.sendEvent('voice_practice_started', {
      scenarioId,
      gradeLevel: gradeLevel || this.getGradeLevel(),
      eventType: 'session_start'
    });
  }

  /**
   * Track when voice practice session completes successfully
   * @param {string} scenarioId - Scenario ID
   * @param {number} duration - Total duration in seconds
   * @param {number} exchangeCount - Number of exchanges
   */
  trackVoicePracticeCompleted(scenarioId, duration, exchangeCount) {
    const durationMs = duration * 1000; // Convert to milliseconds for consistency
    
    // Update conversion funnel
    this.conversionFunnel.completedPractice++;

    const eventData = this.sendEvent('voice_practice_completed', {
      scenarioId: scenarioId || this.currentScenarioId,
      duration,
      durationMs,
      exchangeCount,
      eventType: 'session_complete',
      success: true
    });

    // Reset session tracking
    this.sessionStartTime = null;
    this.currentScenarioId = null;

    return eventData;
  }

  /**
   * Track when user exits voice practice early
   * @param {string} scenarioId - Scenario ID
   * @param {string} reason - Reason for abandonment (user_cancelled, error, timeout)
   * @param {number} duration - Duration in seconds before abandonment
   */
  trackVoicePracticeAbandoned(scenarioId, reason, duration) {
    const durationMs = duration * 1000;

    const eventData = this.sendEvent('voice_practice_abandoned', {
      scenarioId: scenarioId || this.currentScenarioId,
      reason,
      duration,
      durationMs,
      eventType: 'session_abandoned',
      success: false
    });

    // Reset session tracking
    this.sessionStartTime = null;
    this.currentScenarioId = null;

    return eventData;
  }

  /**
   * Track microphone permission result
   * @param {boolean} granted - True if permission granted, false if denied
   */
  trackMicrophonePermission(granted) {
    // Update conversion funnel
    if (granted) {
      this.conversionFunnel.grantedPermission++;
    }

    return this.sendEvent('microphone_permission', {
      granted,
      eventType: 'permission',
      timestamp: Date.now()
    });
  }

  /**
   * Track when user toggles voice mode
   * @param {boolean} enabled - True if enabled, false if disabled
   */
  trackVoiceToggle(enabled) {
    return this.sendEvent('voice_toggle', {
      enabled,
      eventType: 'user_preference',
      timestamp: Date.now()
    });
  }

  /**
   * Track AI response latency
   * @param {number} latencyMs - Response time in milliseconds
   */
  trackResponseLatency(latencyMs) {
    return this.sendEvent('response_latency', {
      latencyMs,
      eventType: 'performance',
      scenarioId: this.currentScenarioId,
      timestamp: Date.now()
    });
  }

  /**
   * Track errors during voice practice
   * @param {string} errorType - Type of error (network, audio, api, etc.)
   * @param {string} errorMessage - Error message
   * @param {Object} context - Additional context object
   */
  trackError(errorType, errorMessage, context = {}) {
    return this.sendEvent('voice_practice_error', {
      errorType,
      errorMessage,
      ...context,
      eventType: 'error',
      scenarioId: this.currentScenarioId,
      timestamp: Date.now()
    });
  }

  /**
   * Track conversation length
   * @param {number} exchangeCount - Total number of exchanges
   */
  trackConversationLength(exchangeCount) {
    return this.sendEvent('conversation_length', {
      exchangeCount,
      eventType: 'engagement',
      scenarioId: this.currentScenarioId,
      timestamp: Date.now()
    });
  }

  /**
   * Track user satisfaction rating
   * @param {number} rating - Rating from 1-5 stars
   */
  trackUserSatisfaction(rating) {
    if (rating < 1 || rating > 5) {
      console.warn('Rating must be between 1 and 5');
      return;
    }

    return this.sendEvent('user_satisfaction', {
      rating,
      eventType: 'feedback',
      scenarioId: this.currentScenarioId,
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // CONVERSION FUNNEL TRACKING
  // ============================================================================

  /**
   * Track Step 1: User viewed Voice Practice card
   */
  trackViewedCard() {
    this.conversionFunnel.viewedCard++;
    return this.sendEvent('voice_practice_card_viewed', {
      eventType: 'funnel_step',
      funnelStep: 1,
      stepName: 'viewed_card'
    });
  }

  /**
   * Track Step 2: User clicked Start Voice Practice button
   */
  trackClickedStart() {
    this.conversionFunnel.clickedStart++;
    return this.sendEvent('voice_practice_clicked_start', {
      eventType: 'funnel_step',
      funnelStep: 2,
      stepName: 'clicked_start'
    });
  }

  /**
   * Track Step 3: User granted microphone permission
   */
  trackGrantedPermission() {
    this.conversionFunnel.grantedPermission++;
    return this.sendEvent('voice_practice_permission_granted', {
      eventType: 'funnel_step',
      funnelStep: 3,
      stepName: 'granted_permission'
    });
  }

  /**
   * Track Step 4: User started conversation
   */
  trackStartedConversation() {
    this.conversionFunnel.startedConversation++;
    return this.sendEvent('voice_practice_conversation_started', {
      eventType: 'funnel_step',
      funnelStep: 4,
      stepName: 'started_conversation'
    });
  }

  /**
   * Track Step 5: User completed practice
   */
  trackCompletedPractice() {
    this.conversionFunnel.completedPractice++;
    return this.sendEvent('voice_practice_completed', {
      eventType: 'funnel_step',
      funnelStep: 5,
      stepName: 'completed_practice'
    });
  }

  /**
   * Get conversion funnel statistics
   * @returns {Object} Conversion funnel stats with rates
   */
  getConversionFunnelStats() {
    const {
      viewedCard,
      clickedStart,
      grantedPermission,
      startedConversation,
      completedPractice
    } = this.conversionFunnel;

    return {
      steps: {
        viewedCard,
        clickedStart,
        grantedPermission,
        startedConversation,
        completedPractice
      },
      conversionRates: {
        cardToStart: viewedCard > 0 ? (clickedStart / viewedCard * 100).toFixed(2) : 0,
        startToPermission: clickedStart > 0 ? (grantedPermission / clickedStart * 100).toFixed(2) : 0,
        permissionToStart: grantedPermission > 0 ? (startedConversation / grantedPermission * 100).toFixed(2) : 0,
        startToComplete: startedConversation > 0 ? (completedPractice / startedConversation * 100).toFixed(2) : 0,
        overallConversion: viewedCard > 0 ? (completedPractice / viewedCard * 100).toFixed(2) : 0
      },
      dropOffPoints: {
        cardToStart: viewedCard - clickedStart,
        startToPermission: clickedStart - grantedPermission,
        permissionToStart: grantedPermission - startedConversation,
        startToComplete: startedConversation - completedPractice
      }
    };
  }

  /**
   * Reset conversion funnel (for testing or new period)
   */
  resetConversionFunnel() {
    this.conversionFunnel = {
      viewedCard: 0,
      clickedStart: 0,
      grantedPermission: 0,
      startedConversation: 0,
      completedPractice: 0
    };
  }

  /**
   * Get all analytics data
   */
  getAnalyticsData() {
    return {
      conversionFunnel: this.getConversionFunnelStats(),
      currentSession: {
        startTime: this.sessionStartTime,
        scenarioId: this.currentScenarioId,
        duration: this.sessionStartTime ? Date.now() - this.sessionStartTime : null
      },
      userId: this.getUserId(),
      gradeLevel: this.getGradeLevel(),
      isDevelopment: this.isDevelopment
    };
  }
}

// Create singleton instance
const voiceAnalytics = new VoiceAnalytics();

// Export singleton instance as default
export default voiceAnalytics;

// Export convenience functions
export const trackVoicePracticeStarted = (scenarioId, gradeLevel) => 
  voiceAnalytics.trackVoicePracticeStarted(scenarioId, gradeLevel);

export const trackVoicePracticeCompleted = (scenarioId, duration, exchangeCount) => 
  voiceAnalytics.trackVoicePracticeCompleted(scenarioId, duration, exchangeCount);

export const trackVoicePracticeAbandoned = (scenarioId, reason, duration) => 
  voiceAnalytics.trackVoicePracticeAbandoned(scenarioId, reason, duration);

export const trackMicrophonePermission = (granted) => 
  voiceAnalytics.trackMicrophonePermission(granted);

export const trackVoiceToggle = (enabled) => 
  voiceAnalytics.trackVoiceToggle(enabled);

export const trackResponseLatency = (latencyMs) => 
  voiceAnalytics.trackResponseLatency(latencyMs);

export const trackError = (errorType, errorMessage, context) => 
  voiceAnalytics.trackError(errorType, errorMessage, context);

export const trackConversationLength = (exchangeCount) => 
  voiceAnalytics.trackConversationLength(exchangeCount);

export const trackUserSatisfaction = (rating) => 
  voiceAnalytics.trackUserSatisfaction(rating);

export const trackViewedCard = () => 
  voiceAnalytics.trackViewedCard();

export const trackClickedStart = () => 
  voiceAnalytics.trackClickedStart();

export const trackGrantedPermission = () => 
  voiceAnalytics.trackGrantedPermission();

export const trackStartedConversation = () => 
  voiceAnalytics.trackStartedConversation();

export const trackCompletedPractice = () => 
  voiceAnalytics.trackCompletedPractice();

export const getConversionFunnelStats = () => 
  voiceAnalytics.getConversionFunnelStats();

export const getVoiceAnalyticsData = () => 
  voiceAnalytics.getAnalyticsData();


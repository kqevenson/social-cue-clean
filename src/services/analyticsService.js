/**
 * Analytics Service for Social Cue App
 * Provides centralized analytics tracking and reporting
 */

import { config } from '../config/appConfig.js';

class AnalyticsService {
  constructor() {
    this.events = [];
    this.maxEvents = 1000; // Keep last 1000 events in memory
    this.sessionStartTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track an analytics event
   */
  track(eventName, properties = {}) {
    const eventData = {
      id: this.generateEventId(),
      name: eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.getUserId(),
        userRole: this.getUserRole(),
        gradeLevel: this.getGradeLevel(),
        darkMode: this.getDarkMode(),
        browser: this.getBrowserInfo(),
        url: window.location.href
      }
    };

    // Add to local storage
    this.events.push(eventData);
    if (this.events.length > this.maxEvents) {
      this.events.shift(); // Remove oldest event
    }

    // Log to console in development
    if (config.features.devMode) {
      console.log('📊 Analytics Event:', eventData);
    }

    // Send to external service in production
    if (config.features.analytics && config.features.devMode === false) {
      this.sendToExternalService(eventData);
    }

    return eventData.id;
  }

  /**
   * Track voice practice specific events
   */
  trackVoicePracticeEvent(eventName, properties = {}) {
    return this.track(eventName, {
      ...properties,
      feature: 'voice_practice',
      voiceEnabled: config.features.voicePractice
    });
  }

  /**
   * Track user engagement events
   */
  trackEngagement(action, context = {}) {
    return this.track('user_engagement', {
      action,
      ...context,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName, value, context = {}) {
    return this.track('performance_metric', {
      metric: metricName,
      value,
      ...context,
      timestamp: Date.now()
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, action, context = {}) {
    return this.track('feature_usage', {
      feature: featureName,
      action,
      ...context
    });
  }

  /**
   * Get analytics statistics
   */
  getAnalyticsStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) > last24Hours
    );
    
    const weeklyEvents = this.events.filter(event => 
      new Date(event.timestamp) > last7Days
    );

    const stats = {
      total: this.events.length,
      last24Hours: recentEvents.length,
      last7Days: weeklyEvents.length,
      sessionDuration: Date.now() - this.sessionStartTime,
      byEvent: {},
      byFeature: {},
      recent: recentEvents.slice(-20) // Last 20 events
    };

    // Analyze events
    this.events.forEach(event => {
      const eventName = event.name;
      const feature = event.properties.feature || 'general';
      
      stats.byEvent[eventName] = (stats.byEvent[eventName] || 0) + 1;
      stats.byFeature[feature] = (stats.byFeature[feature] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get voice practice specific analytics
   */
  getVoicePracticeAnalytics() {
    const voiceEvents = this.events.filter(event => 
      event.properties.feature === 'voice_practice' || 
      event.name.includes('voice_practice')
    );

    const stats = {
      totalSessions: voiceEvents.filter(e => e.name === 'voice_practice_started').length,
      completedSessions: voiceEvents.filter(e => e.name === 'voice_practice_completed').length,
      averageSessionDuration: 0,
      errorRate: 0,
      byGradeLevel: {},
      byVoiceGender: {},
      recentSessions: voiceEvents.slice(-10)
    };

    // Calculate average session duration
    const completedSessions = voiceEvents.filter(e => e.name === 'voice_practice_completed');
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, event) => 
        sum + (event.properties.sessionDuration || 0), 0
      );
      stats.averageSessionDuration = totalDuration / completedSessions.length;
    }

    // Calculate error rate
    const errorEvents = voiceEvents.filter(e => e.name.includes('error'));
    stats.errorRate = voiceEvents.length > 0 ? (errorEvents.length / voiceEvents.length) * 100 : 0;

    // Analyze by grade level and voice gender
    voiceEvents.forEach(event => {
      const gradeLevel = event.properties.gradeLevel;
      const voiceGender = event.properties.voiceGender;
      
      if (gradeLevel) {
        stats.byGradeLevel[gradeLevel] = (stats.byGradeLevel[gradeLevel] || 0) + 1;
      }
      if (voiceGender) {
        stats.byVoiceGender[voiceGender] = (stats.byVoiceGender[voiceGender] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics() {
    this.events = [];
    this.sessionStartTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    return {
      events: this.events,
      stats: this.getAnalyticsStats(),
      voicePracticeStats: this.getVoicePracticeAnalytics(),
      config: {
        maxEvents: this.maxEvents,
        analytics: config.features.analytics,
        devMode: config.features.devMode
      }
    };
  }

  // Private methods

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  getUserRole() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.role || 'learner';
    } catch {
      return 'learner';
    }
  }

  getGradeLevel() {
    try {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      return userData.grade || userData.gradeLevel || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  getDarkMode() {
    return localStorage.getItem('darkMode') === 'true';
  }

  getBrowserInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edg')) return 'edge';
    return 'unknown';
  }

  sendToExternalService(eventData) {
    // In production, this would send to an external analytics service
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    
    // For now, we'll just log it
    console.log('📤 Sending analytics to external service:', eventData);
    
    // Example implementation:
    /*
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    }).catch(err => {
      console.error('Failed to send analytics to external service:', err);
    });
    */
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export convenience functions
export const trackEvent = (eventName, properties) => analyticsService.track(eventName, properties);
export const trackVoicePracticeEvent = (eventName, properties) => analyticsService.trackVoicePracticeEvent(eventName, properties);
export const trackEngagement = (action, context) => analyticsService.trackEngagement(action, context);
export const trackPerformance = (metricName, value, context) => analyticsService.trackPerformance(metricName, value, context);
export const trackFeatureUsage = (featureName, action, context) => analyticsService.trackFeatureUsage(featureName, action, context);
export const getAnalyticsStats = () => analyticsService.getAnalyticsStats();
export const getVoicePracticeAnalytics = () => analyticsService.getVoicePracticeAnalytics();
export const clearAnalytics = () => analyticsService.clearAnalytics();
export const exportAnalytics = () => analyticsService.exportAnalytics();

export default analyticsService;

/**
 * Mobile Compatibility Service for Social Cue App
 * Provides mobile device detection, compatibility checking, and optimization
 */

import { config } from '../config/appConfig.js';
import { trackError } from './errorTracker.js';
import { trackEvent } from './analyticsService.js';
import { safeAddClass } from '../utils/classUtils.js';

class MobileCompatibilityService {
  constructor() {
    try {
      this.deviceInfo = this.detectDevice();
      this.compatibility = this.checkCompatibility();
      this.isInitialized = false;
    } catch (error) {
      console.warn('MobileCompatibilityService initialization failed:', error);
      // Provide fallback values
      this.deviceInfo = {
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        hasTouch: false,
        userAgent: navigator.userAgent
      };
      this.compatibility = {
        speechRecognition: { supported: false, quality: 'poor', limitations: [] },
        speechSynthesis: { supported: false, quality: 'poor', limitations: [] },
        microphone: { supported: false, quality: 'poor', limitations: [] },
        audioPlayback: { supported: false, quality: 'poor', limitations: [] },
        overallScore: 0
      };
      this.isInitialized = false;
    }
  }

  /**
   * Initialize mobile compatibility service
   */
  initialize() {
    if (this.isInitialized) return;

    this.isInitialized = true;
    
    // Track device information
    trackEvent('device_detected', {
      device: this.deviceInfo,
      compatibility: this.compatibility
    });

    // Apply mobile optimizations
    this.applyMobileOptimizations();

    // Monitor mobile-specific events
    this.monitorMobileEvents();

    console.log('📱 Mobile compatibility service initialized:', {
      device: this.deviceInfo,
      compatibility: this.compatibility
    });
  }

  /**
   * Detect mobile device information
   */
  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    return {
      // Device type
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isTablet: /ipad|android(?!.*mobile)/i.test(userAgent),
      isPhone: /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) && !/ipad/i.test(userAgent),
      
      // Operating system
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isWindows: /windows/i.test(userAgent),
      isMacOS: /macintosh|mac os x/i.test(userAgent),
      
      // Browser
      isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
      isChrome: /chrome/i.test(userAgent) && !/edg/i.test(userAgent),
      isFirefox: /firefox/i.test(userAgent),
      isEdge: /edg/i.test(userAgent),
      
      // Screen information
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      
      // Touch support
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      
      // Orientation
      orientation: screen.orientation ? screen.orientation.type : 'unknown',
      
      // User agent
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }

  /**
   * Check mobile compatibility for voice features
   */
  checkCompatibility() {
    const device = this.deviceInfo;
    
    const compatibility = {
      // Speech recognition
      speechRecognition: {
        supported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        quality: this.getSpeechRecognitionQuality(),
        limitations: this.getSpeechRecognitionLimitations()
      },
      
      // Speech synthesis
      speechSynthesis: {
        supported: 'speechSynthesis' in window,
        quality: this.getSpeechSynthesisQuality(),
        limitations: this.getSpeechSynthesisLimitations()
      },
      
      // Microphone access
      microphone: {
        supported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        quality: this.getMicrophoneQuality(),
        limitations: this.getMicrophoneLimitations()
      },
      
      // Audio playback
      audioPlayback: {
        supported: 'Audio' in window,
        quality: this.getAudioPlaybackQuality(),
        limitations: this.getAudioPlaybackLimitations()
      }
    };
    
    // Calculate overall compatibility score after compatibility object is created
    compatibility.overallScore = this.calculateCompatibilityScore(compatibility);
    
    return compatibility;
  }

  /**
   * Apply mobile-specific optimizations
   */
  applyMobileOptimizations() {
    const device = this.deviceInfo;
    
    // Add mobile-specific CSS classes safely
    safeAddClass(document.body, device.isMobile ? 'mobile' : 'desktop');
    if (device.isIOS) {
      safeAddClass(document.body, 'ios');
    }
    if (device.isAndroid) {
      safeAddClass(document.body, 'android');
    }
    
    // Optimize touch interactions
    if (device.hasTouch) {
      this.optimizeTouchInteractions();
    }
    
    // Optimize for small screens
    if (device.isPhone) {
      this.optimizeForSmallScreens();
    }
    
    // Optimize for tablets
    if (device.isTablet) {
      this.optimizeForTablets();
    }
    
    // Handle orientation changes
    this.handleOrientationChanges();
  }

  /**
   * Monitor mobile-specific events
   */
  monitorMobileEvents() {
    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo.orientation = screen.orientation ? screen.orientation.type : 'unknown';
        this.deviceInfo.viewportWidth = window.innerWidth;
        this.deviceInfo.viewportHeight = window.innerHeight;
        
        trackEvent('orientation_changed', {
          orientation: this.deviceInfo.orientation,
          viewport: {
            width: this.deviceInfo.viewportWidth,
            height: this.deviceInfo.viewportHeight
          }
        });
      }, 100);
    });

    // Resize events
    window.addEventListener('resize', this.debounce(() => {
      this.deviceInfo.viewportWidth = window.innerWidth;
      this.deviceInfo.viewportHeight = window.innerHeight;
      
      trackEvent('viewport_resized', {
        viewport: {
          width: this.deviceInfo.viewportWidth,
          height: this.deviceInfo.viewportHeight
        }
      });
    }, 250));

    // Touch events
    if (this.deviceInfo.hasTouch) {
      document.addEventListener('touchstart', (e) => {
        trackEvent('touch_interaction', {
          touchPoints: e.touches.length,
          target: e.target.tagName
        });
      });
    }
  }

  /**
   * Get mobile-specific recommendations
   */
  getRecommendations() {
    const device = this.deviceInfo;
    const compatibility = this.compatibility;
    const recommendations = [];

    // Speech recognition recommendations
    if (!compatibility.speechRecognition.supported) {
      recommendations.push({
        type: 'error',
        category: 'speech_recognition',
        message: 'Speech recognition is not supported on this device',
        suggestion: 'Please use a supported browser like Chrome or Safari'
      });
    } else if (compatibility.speechRecognition.quality === 'poor') {
      recommendations.push({
        type: 'warning',
        category: 'speech_recognition',
        message: 'Speech recognition may have limited accuracy',
        suggestion: 'Speak clearly and slowly for best results'
      });
    }

    // Microphone recommendations
    if (!compatibility.microphone.supported) {
      recommendations.push({
        type: 'error',
        category: 'microphone',
        message: 'Microphone access is not supported',
        suggestion: 'Please use a device with microphone support'
      });
    }

    // Browser recommendations
    if (device.isIOS && !device.isSafari && !device.isChrome) {
      recommendations.push({
        type: 'warning',
        category: 'browser',
        message: 'For best experience on iOS, use Safari or Chrome',
        suggestion: 'Consider switching to Safari or Chrome browser'
      });
    }

    // Screen size recommendations
    if (device.isPhone && device.viewportWidth < 375) {
      recommendations.push({
        type: 'info',
        category: 'screen',
        message: 'Small screen detected',
        suggestion: 'Consider using landscape mode for better experience'
      });
    }

    return recommendations;
  }

  /**
   * Test voice features on mobile
   */
  async testVoiceFeatures() {
    const results = {
      speechRecognition: false,
      speechSynthesis: false,
      microphone: false,
      audioPlayback: false,
      errors: []
    };

    try {
      // Test speech recognition
      if (this.compatibility.speechRecognition.supported) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          results.speechRecognition = true;
        } catch (error) {
          results.errors.push({ feature: 'speechRecognition', error: error.message });
        }
      }

      // Test speech synthesis
      if (this.compatibility.speechSynthesis.supported) {
        try {
          const utterance = new SpeechSynthesisUtterance('test');
          results.speechSynthesis = true;
        } catch (error) {
          results.errors.push({ feature: 'speechSynthesis', error: error.message });
        }
      }

      // Test microphone
      if (this.compatibility.microphone.supported) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          results.microphone = true;
        } catch (error) {
          results.errors.push({ feature: 'microphone', error: error.message });
        }
      }

      // Test audio playback
      if (this.compatibility.audioPlayback.supported) {
        try {
          const audio = new Audio();
          results.audioPlayback = true;
        } catch (error) {
          results.errors.push({ feature: 'audioPlayback', error: error.message });
        }
      }

    } catch (error) {
      trackError(error, { context: 'mobile_voice_test' });
    }

    return results;
  }

  // Private methods

  getSpeechRecognitionQuality() {
    const device = this.deviceInfo;
    
    if (device.isIOS && device.isSafari) return 'excellent';
    if (device.isAndroid && device.isChrome) return 'excellent';
    if (device.isIOS && device.isChrome) return 'good';
    if (device.isAndroid && device.isFirefox) return 'good';
    return 'poor';
  }

  getSpeechSynthesisQuality() {
    const device = this.deviceInfo;
    
    if (device.isIOS) return 'excellent';
    if (device.isAndroid) return 'good';
    return 'fair';
  }

  getMicrophoneQuality() {
    const device = this.deviceInfo;
    
    if (device.isIOS) return 'excellent';
    if (device.isAndroid) return 'good';
    return 'fair';
  }

  getAudioPlaybackQuality() {
    const device = this.deviceInfo;
    
    if (device.isIOS) return 'excellent';
    if (device.isAndroid) return 'good';
    return 'fair';
  }

  getSpeechRecognitionLimitations() {
    const device = this.deviceInfo;
    const limitations = [];

    if (device.isIOS && !device.isSafari) {
      limitations.push('Limited support in non-Safari browsers on iOS');
    }
    if (device.isAndroid && !device.isChrome) {
      limitations.push('Best performance in Chrome on Android');
    }
    if (device.isPhone) {
      limitations.push('May have reduced accuracy on small screens');
    }

    return limitations;
  }

  getSpeechSynthesisLimitations() {
    const device = this.deviceInfo;
    const limitations = [];

    if (device.isAndroid) {
      limitations.push('Limited voice options on Android');
    }
    if (device.isPhone) {
      limitations.push('Audio quality may be reduced on phones');
    }

    return limitations;
  }

  getMicrophoneLimitations() {
    const device = this.deviceInfo;
    const limitations = [];

    if (device.isPhone) {
      limitations.push('Built-in microphone may pick up background noise');
    }
    if (device.isIOS) {
      limitations.push('Requires user permission for microphone access');
    }

    return limitations;
  }

  getAudioPlaybackLimitations() {
    const device = this.deviceInfo;
    const limitations = [];

    if (device.isIOS) {
      limitations.push('Audio may be muted until user interaction');
    }
    if (device.isPhone) {
      limitations.push('Speaker quality may be limited');
    }

    return limitations;
  }

  calculateCompatibilityScore(compatibility) {
    // Add null checks to prevent crashes
    if (!compatibility) {
      return 0;
    }
    
    let score = 0;
    let total = 0;

    // Speech recognition (40% weight)
    if (compatibility.speechRecognition?.supported) {
      score += 40;
      if (compatibility.speechRecognition.quality === 'excellent') score += 10;
      else if (compatibility.speechRecognition.quality === 'good') score += 5;
    }
    total += 50;

    // Speech synthesis (20% weight)
    if (compatibility.speechSynthesis?.supported) {
      score += 20;
      if (compatibility.speechSynthesis.quality === 'excellent') score += 5;
      else if (compatibility.speechSynthesis.quality === 'good') score += 2;
    }
    total += 25;

    // Microphone (20% weight)
    if (compatibility.microphone?.supported) {
      score += 20;
      if (compatibility.microphone.quality === 'excellent') score += 5;
      else if (compatibility.microphone.quality === 'good') score += 2;
    }
    total += 25;

    // Audio playback (20% weight)
    if (compatibility.audioPlayback?.supported) {
      score += 20;
      if (compatibility.audioPlayback.quality === 'excellent') score += 5;
      else if (compatibility.audioPlayback.quality === 'good') score += 2;
    }
    total += 25;

    return Math.round((score / total) * 100);
  }

  optimizeTouchInteractions() {
    // Add touch-friendly CSS
    const style = document.createElement('style');
    style.textContent = `
      .mobile .touch-target {
        min-height: 44px;
        min-width: 44px;
      }
      .mobile button, .mobile .clickable {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);
  }

  optimizeForSmallScreens() {
    // Add small screen optimizations
    const style = document.createElement('style');
    style.textContent = `
      .mobile.phone .voice-practice-container {
        padding: 8px;
      }
      .mobile.phone .voice-button {
        width: 60px;
        height: 60px;
      }
    `;
    document.head.appendChild(style);
  }

  optimizeForTablets() {
    // Add tablet optimizations
    const style = document.createElement('style');
    style.textContent = `
      .mobile.tablet .voice-practice-container {
        max-width: 800px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
  }

  handleOrientationChanges() {
    // Handle orientation-specific optimizations
    const updateOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      document.body.classList.toggle('landscape', isLandscape);
      document.body.classList.toggle('portrait', !isLandscape);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Create singleton instance
const mobileCompatibilityService = new MobileCompatibilityService();

// Export convenience functions
export const initializeMobileCompatibility = () => mobileCompatibilityService.initialize();
export const getDeviceInfo = () => mobileCompatibilityService.deviceInfo;
export const getCompatibility = () => mobileCompatibilityService.compatibility;
export const getRecommendations = () => mobileCompatibilityService.getRecommendations();
export const testVoiceFeatures = () => mobileCompatibilityService.testVoiceFeatures();
export const isMobile = () => mobileCompatibilityService.deviceInfo.isMobile;
export const isTablet = () => mobileCompatibilityService.deviceInfo.isTablet;
export const isPhone = () => mobileCompatibilityService.deviceInfo.isPhone;

export default mobileCompatibilityService;

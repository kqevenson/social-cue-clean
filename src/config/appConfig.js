/**
 * Configuration Service for Social Cue App
 * Manages feature flags, environment variables, and app settings
 */

export const config = {
  // Feature Flags
  features: {
    voicePractice: import.meta.env.VITE_VOICE_PRACTICE === 'true' || true,
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
    errorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true' || false,
    devMode: import.meta.env.DEV || false,
  },

  // API Configuration
  apis: {
    elevenlabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
      enabled: import.meta.env.VITE_USE_ELEVENLABS === 'true',
      model: 'eleven_monolingual_v1',
      voices: {
        charlotte: 'XB0fDUnXU5powFXDhCwa', // Female teacher voice
        callum: 'N2lVS1w4EtoT3dr4eOWO'    // Male teacher voice
      }
    },
    anthropic: {
      apiKey: import.meta.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 1000
    },
    backend: {
      baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
      timeout: 30000
    }
  },

  // Performance Settings
  performance: {
    lazyLoadThreshold: 200, // ms
    cacheTimeout: 300000,   // 5 minutes
    maxRetries: 3,
    retryDelay: 1000        // 1 second
  },

  // Voice Practice Settings
  voicePractice: {
    autoMicDelay: 1000,     // 1 second delay before auto-restarting mic
    silenceTimeout: 3000,   // 3 seconds of silence before stopping
    maxSessionDuration: 1800000, // 30 minutes max session
    minSessionDuration: 30000,   // 30 seconds min session
    maxMessagesPerSession: 50
  },

  // Analytics Events
  analytics: {
    events: {
      VOICE_PRACTICE_STARTED: 'voice_practice_started',
      VOICE_PRACTICE_COMPLETED: 'voice_practice_completed',
      VOICE_PRACTICE_EXITED: 'voice_practice_exited',
      VOICE_ERROR: 'voice_error',
      MICROPHONE_PERMISSION_DENIED: 'microphone_permission_denied',
      SPEECH_RECOGNITION_ERROR: 'speech_recognition_error',
      TTS_ERROR: 'tts_error'
    }
  },

  // Error Categories
  errors: {
    categories: {
      NETWORK: 'network',
      AUDIO: 'audio',
      SPEECH_RECOGNITION: 'speech_recognition',
      TTS: 'tts',
      API: 'api',
      PERMISSION: 'permission',
      BROWSER_COMPATIBILITY: 'browser_compatibility'
    }
  },

  // Browser Support
  browserSupport: {
    speechRecognition: {
      chrome: 25,
      firefox: 44,
      safari: 14.1,
      edge: 79
    },
    speechSynthesis: {
      chrome: 33,
      firefox: 49,
      safari: 7,
      edge: 79
    }
  }
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return config.features[featureName] || false;
};

/**
 * Get API configuration
 */
export const getApiConfig = (apiName) => {
  return config.apis[apiName] || {};
};

/**
 * Check browser compatibility
 */
export const checkBrowserSupport = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
  const isFirefox = userAgent.includes('firefox');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  const isEdge = userAgent.includes('edg');

  return {
    browser: isChrome ? 'chrome' : isFirefox ? 'firefox' : isSafari ? 'safari' : isEdge ? 'edge' : 'unknown',
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    mediaDevices: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  };
};

/**
 * Get voice ID based on gender preference
 */
export const getVoiceId = (gender = 'female') => {
  const voices = config.apis.elevenlabs.voices;
  return gender === 'male' ? voices.callum : voices.charlotte;
};

/**
 * Log configuration for debugging
 */
export const logConfig = () => {
  if (config.features.devMode) {
    console.log('🔧 Social Cue Configuration:', {
      features: config.features,
      browserSupport: checkBrowserSupport(),
      elevenlabs: {
        enabled: config.apis.elevenlabs.enabled,
        hasApiKey: !!config.apis.elevenlabs.apiKey
      }
    });
  }
};

export default config;

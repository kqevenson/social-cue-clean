// src/config/env.js

export const config = {
  // ElevenLabs Configuration
  elevenlabs: {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
    enabled: import.meta.env.VITE_USE_ELEVENLABS === 'true',
    model: import.meta.env.VITE_ELEVENLABS_MODEL || 'eleven_monolingual_v1'
  },
  
  // Voice Feature Configuration
  voice: {
    enabled: import.meta.env.VITE_VOICE_PRACTICE_ENABLED === 'true',
    provider: import.meta.env.VITE_VOICE_API_PROVIDER || 'elevenlabs'
  },
  
  // Backend API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    useApi: import.meta.env.VITE_USE_API === 'true'
  },
  
  // Firebase Configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID
  },
  
  // Anthropic Claude API Configuration
  anthropic: {
    apiKey: import.meta.env.ANTHROPIC_API_KEY
  }
};

// Validation
export const validateConfig = () => {
  const errors = [];
  
  if (config.elevenlabs.enabled && !config.elevenlabs.apiKey) {
    errors.push('VITE_ELEVENLABS_API_KEY is required when ElevenLabs is enabled');
  }
  
  if (config.elevenlabs.apiKey && !config.elevenlabs.apiKey.startsWith('sk_')) {
    errors.push('VITE_ELEVENLABS_API_KEY appears to be invalid (should start with sk_)');
  }
  
  if (config.api.useApi && !config.api.baseUrl) {
    errors.push('VITE_API_URL is required when API is enabled');
  }
  
  if (!config.firebase.projectId) {
    errors.push('Firebase project configuration is missing');
  }
  
  if (!config.anthropic.apiKey) {
    errors.push('ANTHROPIC_API_KEY is required for AI features');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Log configuration status (development only)
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    elevenlabs: config.elevenlabs.enabled ? '✅ Enabled' : '❌ Disabled',
    voice: config.voice.enabled ? '✅ Enabled' : '❌ Disabled',
    api: config.api.useApi ? '✅ Enabled' : '❌ Disabled',
    firebase: config.firebase.projectId ? '✅ Configured' : '❌ Missing',
    anthropic: config.anthropic.apiKey ? '✅ Configured' : '❌ Missing'
  });
  
  const validation = validateConfig();
  if (!validation.valid) {
    console.warn('⚠️ Configuration warnings:', validation.errors);
  }
}

// Export individual configs for convenience
export const elevenlabsConfig = config.elevenlabs;
export const voiceConfig = config.voice;
export const apiConfig = config.api;
export const firebaseConfig = config.firebase;
export const anthropicConfig = config.anthropic;

// src/config/test-env.js
// Simple test to verify environment variables are loaded correctly
import { config, validateConfig } from './env.js';

console.log('🧪 Testing environment configuration in React app...');

// Test configuration loading
console.log('ElevenLabs Config:', {
  enabled: config.elevenlabs.enabled,
  hasApiKey: !!config.elevenlabs.apiKey,
  model: config.elevenlabs.model
});

console.log('Voice Config:', {
  enabled: config.voice.enabled,
  provider: config.voice.provider
});

console.log('API Config:', {
  baseUrl: config.api.baseUrl,
  useApi: config.api.useApi
});

// Test validation
const validation = validateConfig();
console.log('Validation Result:', validation.valid ? '✅ Valid' : '❌ Invalid');
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

export { config, validateConfig };

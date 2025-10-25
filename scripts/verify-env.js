// scripts/verify-env.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file
const envPath = join(__dirname, '..', '.env');
let envVars = {};

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
  process.exit(1);
}

// Configuration object
const config = {
  elevenlabs: {
    apiKey: envVars.VITE_ELEVENLABS_API_KEY,
    enabled: envVars.VITE_USE_ELEVENLABS === 'true',
    model: envVars.VITE_ELEVENLABS_MODEL || 'eleven_monolingual_v1'
  },
  voice: {
    enabled: envVars.VITE_VOICE_PRACTICE_ENABLED === 'true',
    provider: envVars.VITE_VOICE_API_PROVIDER || 'elevenlabs'
  },
  api: {
    baseUrl: envVars.VITE_API_URL || 'http://localhost:3000',
    useApi: envVars.VITE_USE_API === 'true'
  },
  firebase: {
    projectId: envVars.VITE_FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID,
    apiKey: envVars.VITE_FIREBASE_API_KEY || envVars.FIREBASE_API_KEY
  },
  anthropic: {
    apiKey: envVars.ANTHROPIC_API_KEY
  }
};

// Validation function
const validateConfig = () => {
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

console.log('🔍 Verifying environment configuration...\n');

console.log('Environment Variables:');
console.log('✓ VITE_ELEVENLABS_API_KEY:', config.elevenlabs.apiKey ? '✅ Set' : '❌ Missing');
console.log('✓ VITE_USE_ELEVENLABS:', config.elevenlabs.enabled ? '✅ true' : '❌ false');
console.log('✓ VITE_VOICE_PRACTICE_ENABLED:', config.voice.enabled ? '✅ true' : '❌ false');
console.log('✓ VITE_VOICE_API_PROVIDER:', config.voice.provider);
console.log('✓ VITE_API_URL:', config.api.baseUrl);
console.log('✓ VITE_USE_API:', config.api.useApi ? '✅ true' : '❌ false');
console.log('✓ Firebase Project ID:', config.firebase.projectId ? '✅ Set' : '❌ Missing');
console.log('✓ Anthropic API Key:', config.anthropic.apiKey ? '✅ Set' : '❌ Missing');

console.log('\nFeature Status:');
console.log('✓ ElevenLabs Voice API:', config.elevenlabs.enabled ? '✅ Enabled' : '❌ Disabled');
console.log('✓ Voice Practice:', config.voice.enabled ? '✅ Enabled' : '❌ Disabled');
console.log('✓ Backend API:', config.api.useApi ? '✅ Enabled' : '❌ Disabled');
console.log('✓ Firebase:', config.firebase.projectId ? '✅ Configured' : '❌ Missing');
console.log('✓ Anthropic Claude:', config.anthropic.apiKey ? '✅ Configured' : '❌ Missing');

const validation = validateConfig();

if (validation.valid) {
  console.log('\n✅ Configuration is valid!');
  console.log('🚀 Ready to start development with voice features.');
  process.exit(0);
} else {
  console.log('\n❌ Configuration errors:');
  validation.errors.forEach(error => console.log('  -', error));
  console.log('\n💡 Fix these issues and run "npm run verify-env" again.');
  process.exit(1);
}
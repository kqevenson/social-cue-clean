# Environment Configuration Guide

## ElevenLabs API Setup

The Social Cue app now supports ElevenLabs voice synthesis for enhanced voice chatbot functionality.

### Environment Variables Added

```bash
# ElevenLabs Voice API Configuration
VITE_ELEVENLABS_API_KEY=sk_c64e6952a982eeeb1d81592ed82ddd78c798609614e783f2
VITE_USE_ELEVENLABS=true
VITE_ELEVENLABS_MODEL=eleven_monolingual_v1

# Voice Feature Flags
VITE_VOICE_PRACTICE_ENABLED=true
VITE_VOICE_API_PROVIDER=elevenlabs
```

### Files Created/Modified

1. **`.env`** - Contains actual API keys (ignored by git)
2. **`.env.example`** - Template with placeholder values (committed to git)
3. **`src/config/env.js`** - Environment configuration helper
4. **`scripts/verify-env.js`** - Verification script
5. **`package.json`** - Added `verify-env` script

### Usage

#### Verify Configuration
```bash
npm run verify-env
```

#### Use in React Components
```javascript
import { config, elevenlabsConfig } from './config/env.js';

// Check if ElevenLabs is enabled
if (config.elevenlabs.enabled) {
  // Use ElevenLabs API
  const apiKey = config.elevenlabs.apiKey;
  const model = config.elevenlabs.model;
}
```

### Security Checklist

- ✅ `.env` file created with API key
- ✅ `.env` added to `.gitignore`
- ✅ `.env.example` created with placeholder values
- ✅ API key starts with 'sk_'
- ✅ No API key committed to git
- ✅ Config helper created
- ✅ Validation working

### Next Steps

1. **Test ElevenLabs Integration**: Create voice components using the API
2. **Implement Voice Practice Screen**: Use the voice configuration
3. **Add Fallback Support**: Implement Web Speech API as fallback
4. **Error Handling**: Add proper error handling for API failures

### API Key Management

- **Development**: Use the provided API key
- **Production**: Use separate production API key
- **Team Members**: Each developer needs their own API key
- **Sharing**: Only share `.env.example`, never `.env`

### Troubleshooting

If you encounter issues:

1. Run `npm run verify-env` to check configuration
2. Ensure `.env` file exists and contains the API key
3. Check that API key starts with 'sk_'
4. Verify Vite is loading environment variables correctly

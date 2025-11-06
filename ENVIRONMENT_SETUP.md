# Environment Configuration Guide

## ElevenLabs API Setup

The Social Cue app now supports ElevenLabs voice synthesis for enhanced voice chatbot functionality.

### Environment Variables Required

```bash
# ElevenLabs Voice API Configuration
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
VITE_ELEVENLABS_API_KEY=sk_your_api_key_here

# ElevenLabs Conversational AI Agent ID (REQUIRED for voice practice)
# Get your Agent ID from: https://elevenlabs.io/app/conversational-ai
# Click on your agent and copy the ID from the URL or settings
# Agent ID format: agent_abc123def456...
VITE_ELEVENLABS_AGENT_ID=agent_your_agent_id_here

# Enable ElevenLabs integration
VITE_USE_ELEVENLABS=true

# ElevenLabs model to use
VITE_ELEVENLABS_MODEL=eleven_monolingual_v1

# Voice Feature Flags
VITE_VOICE_PRACTICE_ENABLED=true
VITE_VOICE_API_PROVIDER=elevenlabs
```

### Getting Your ElevenLabs Agent ID

The **Agent ID** is required for the voice practice feature. Here's how to get it:

1. **Go to ElevenLabs Conversational AI**: https://elevenlabs.io/app/conversational-ai
2. **Click on your agent** (or create a new one if you don't have one)
3. **Copy the Agent ID**:
   - Option 1: Check the URL - it will contain something like `agent_abc123def456...`
   - Option 2: Check the agent settings page - the Agent ID will be displayed there
   - Option 3: Look in the agent details/configuration section

4. **Add it to your `.env` file**:
   ```bash
   VITE_ELEVENLABS_AGENT_ID=agent_your_actual_agent_id_here
   ```

**Important**: 
- The Agent ID should start with `agent_`
- Replace `agent_your_actual_agent_id_here` with your real Agent ID
- Never commit your actual Agent ID to git (only commit `.env.example`)

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

- ✅ `.env` file created with API key and Agent ID
- ✅ `.env` added to `.gitignore`
- ✅ `.env.example` created with placeholder values
- ✅ API key starts with 'sk_'
- ✅ Agent ID starts with 'agent_'
- ✅ No API key or Agent ID committed to git
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

1. **Run verification**: `npm run verify-env` to check configuration
2. **Check `.env` file exists**: Ensure `.env` file exists and contains both API key and Agent ID
3. **Validate API key**: Check that API key starts with 'sk_'
4. **Validate Agent ID**: Check that Agent ID starts with 'agent_'
5. **Verify Vite**: Ensure Vite is loading environment variables correctly
6. **Check browser console**: Look for warnings about missing configuration
7. **Agent ID not found**: 
   - Make sure you've copied the Agent ID correctly
   - Verify it's from the Conversational AI section, not just the API settings
   - Agent ID format should be: `agent_` followed by alphanumeric characters

### Common Errors

**Error: "ElevenLabs Agent ID is not configured"**
- Solution: Add `VITE_ELEVENLABS_AGENT_ID` to your `.env` file with your Agent ID

**Error: "Invalid ElevenLabs Agent ID format"**
- Solution: Ensure your Agent ID starts with `agent_` (e.g., `agent_abc123def456`)

**Error: "Agent ID not found"**
- Solution: Verify you're using the correct Agent ID from https://elevenlabs.io/app/conversational-ai

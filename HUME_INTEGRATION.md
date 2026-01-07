# Hume Emotion Analysis Integration

This document describes the Hume emotion analysis integration in the Social Cue voice pipeline.

## Overview

Hume emotion analysis is integrated as an optional enhancement to the voice conversation system. When audio is available, it can be analyzed for emotional context, which is then used to adjust the AI coach's tone and teaching style.

## Setup

### 1. Environment Variable

Add your Hume API key to `.env`:

```
HUME_API_KEY=your_hume_api_key_here
```

### 2. Dependencies

The integration requires `axios`, which is already installed:

```bash
npm install axios
```

## How It Works

### Backend (`server.js`)

1. The `/api/voice/conversation` endpoint accepts an optional `audioBase64` parameter
2. If audio is provided, it's sent to Hume API for emotion analysis
3. The detected emotion (e.g., "joy", "sadness", "anxiety") is injected into the system prompt
4. OpenAI generates a response that's adjusted based on the learner's emotional state

### Frontend (`useVoiceConversation.js`)

1. When audio recording is implemented, audio blobs can be converted to base64 using `convertBlobToBase64()`
2. The base64 audio can be sent to the backend API for emotion analysis
3. The emotion context is then used to personalize the AI's response

## Audio Recording

**Note:** The current implementation uses `webkitSpeechRecognition` which provides text transcripts but not audio blobs. To enable emotion analysis, you need to:

1. Use `MediaRecorder` API to record audio separately
2. Convert the audio blob to base64 using `convertBlobToBase64()` helper
3. Pass the base64 string to `sendUserMessage()` or the backend API

Example:

```javascript
import { convertBlobToBase64, recordAudioFromStream } from '../services/audioHelpers';

// Record audio while user is speaking
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioBlob = await recordAudioFromStream(stream, 3000); // Record for 3 seconds
const audioBase64 = await convertBlobToBase64(audioBlob);

// Send to backend for emotion analysis
const response = await fetch('http://localhost:3001/api/voice/conversation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationHistory,
    scenario,
    gradeLevel,
    phase,
    audioBase64
  })
});
```

## Emotion Context in Prompts

When emotion is detected, the system prompt includes:

```
🎭 The learner currently sounds **{emotion}** with intensity **{intensity}**. 
Adjust your tone and teaching style accordingly.
```

The AI coach will then adjust its responses to be more supportive, encouraging, or gentle based on the detected emotion.

## Current Status

- ✅ Backend emotion analysis function implemented
- ✅ Backend API endpoint accepts `audioBase64`
- ✅ Emotion context injected into system prompts
- ✅ Frontend helper functions for audio conversion
- ⚠️ Audio recording not yet implemented (requires MediaRecorder setup)
- ⚠️ Frontend integration is optional and commented out

## Next Steps

To fully enable emotion analysis:

1. Implement audio recording using `MediaRecorder` API
2. Capture audio during user speech
3. Convert to base64 and send to backend
4. Use emotion-enhanced responses from backend





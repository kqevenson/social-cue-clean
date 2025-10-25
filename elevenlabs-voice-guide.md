# ElevenLabs Voice Components Usage Guide

## Overview

This guide covers the enhanced voice components for the Social Cue app with ElevenLabs integration:

1. **VoiceInput** - Enhanced Speech-to-Text with Web Speech API
2. **VoiceOutput** - Text-to-Speech using ElevenLabs API with Web Speech fallback
3. **VoiceChat** - Complete voice conversation interface

## ElevenLabs Integration

### API Configuration

The components use ElevenLabs API for premium text-to-speech with automatic fallback to Web Speech API.

#### Environment Variables

```bash
# .env file
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_USE_ELEVENLABS=true
```

#### Voice Selection by Grade Level

| Grade Level | ElevenLabs Voice | Description |
|-------------|------------------|-------------|
| K-2 | Rachel (21m00Tcm4TlvDq8ikWAM) | Warm, friendly female voice |
| K-2 | Bella (EXAVITQu4vr4xnSDxMaL) | Friendly female voice |
| 3-5 | Elli (MF3mGyEYCl7XYWbV9V6O) | Clear, engaging voice |
| 6-8 | Callum (N2lVS1w4EtoT3dr4eOWO) | Professional male voice |
| 6-8 | Charlotte (XB0fDUnXU5T1ppWg) | Professional female voice |
| 9-12 | Josh (flq6f7yk4E4fJM5XTYuZ) | Mature, natural voice |
| 9-12 | Nicole (piTKgcLEGmPE4e6mEKli) | Mature female voice |

## VoiceOutput Component

### Basic Usage

```jsx
import VoiceOutput from './VoiceOutput';

function MyComponent() {
  const [text, setText] = useState('Hello! This is a test of ElevenLabs voice synthesis.');

  const handleStart = () => {
    console.log('Started speaking with ElevenLabs');
  };

  const handleEnd = () => {
    console.log('Finished speaking');
  };

  const handleError = (error, message) => {
    console.error('TTS error:', error, message);
  };

  return (
    <VoiceOutput
      text={text}
      onStart={handleStart}
      onEnd={handleEnd}
      onError={handleError}
      gradeLevel="6"
      autoPlay={true}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | '' | Text to speak |
| `autoPlay` | boolean | true | Auto-play when text changes |
| `gradeLevel` | string | '6' | Grade level for voice selection |
| `onComplete` | function | - | Called when speaking completes |
| `onStart` | function | - | Called when speaking starts |
| `onError` | function | - | Called when an error occurs |
| `className` | string | '' | Additional CSS classes |

### Features

- ✅ **ElevenLabs Premium Voices** - High-quality, natural-sounding speech
- ✅ **Web Speech Fallback** - Automatic fallback if ElevenLabs fails
- ✅ **Audio Caching** - Caches audio responses for performance
- ✅ **Voice Selection** - Age-appropriate voices based on grade level
- ✅ **Playback Controls** - Play, pause, stop, replay
- ✅ **Progress Tracking** - Visual progress bar for audio playback
- ✅ **Volume Control** - Adjustable audio volume
- ✅ **Error Handling** - Graceful error handling with fallbacks
- ✅ **Mobile Support** - Touch-friendly controls

### ElevenLabs API Integration

#### Audio Generation

```javascript
const generateElevenLabsAudio = async (text, voiceId) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    }
  );

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
};
```

#### Voice Settings

- **Stability**: 0.5 (balanced between consistency and expressiveness)
- **Similarity Boost**: 0.5 (maintains voice characteristics)
- **Style**: 0.0 (neutral style)
- **Speaker Boost**: true (enhances voice clarity)

### Error Handling

#### Common Errors and Fallbacks

1. **API Key Missing**
   - Falls back to Web Speech API
   - Shows configuration warning

2. **API Rate Limiting**
   - Falls back to Web Speech API
   - Shows user-friendly message

3. **Network Errors**
   - Retries with Web Speech API
   - Shows connection error

4. **Audio Playback Failure**
   - Attempts to regenerate audio
   - Falls back to Web Speech API

### Caching System

#### Audio Caching

```javascript
// Cache key format: voiceId-textContent
const cacheKey = `${voiceId}-${textToSpeak}`;

// Check cache first
if (audioCacheRef.current.has(cacheKey)) {
  return audioCacheRef.current.get(cacheKey);
}

// Generate and cache new audio
const audioUrl = await generateElevenLabsAudio(text, voiceId);
audioCacheRef.current.set(cacheKey, audioUrl);
```

#### Cache Management

- **Memory Cache**: Stores audio URLs in component memory
- **Session Persistence**: Cache persists during component lifecycle
- **Cleanup**: Automatically cleans up URLs on unmount
- **Size Limit**: Prevents memory leaks with reasonable cache size

## VoiceInput Component

### Enhanced Features

The VoiceInput component now includes:

- ✅ **ElevenLabs Integration Ready** - Prepared for future STT features
- ✅ **Enhanced Settings Panel** - Voice provider selection
- ✅ **Improved Error Handling** - Better error messages and recovery
- ✅ **Visual Indicators** - Shows current voice provider
- ✅ **Grade Level Adaptation** - Language settings based on grade

### Usage

```jsx
import VoiceInput from './VoiceInput';

function MyComponent() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleTranscript = (text) => {
    setTranscript(text);
    console.log('User said:', text);
  };

  const handleError = (error, message) => {
    console.error('Speech error:', error, message);
  };

  return (
    <VoiceInput
      onTranscript={handleTranscript}
      onError={handleError}
      isListening={isListening}
      setIsListening={setIsListening}
      gradeLevel="6"
    />
  );
}
```

## VoiceChat Component

### Complete Integration

The VoiceChat component combines both enhanced components:

```jsx
import VoiceChat from './VoiceChat';

function PracticeSession() {
  const handleUserMessage = (message) => {
    console.log('User said:', message);
    // Process user message and generate AI response
    const aiResponse = generateAIResponse(message);
    // The AI response will be spoken with ElevenLabs
  };

  const handleSystemMessage = (message) => {
    console.log('System message:', message);
  };

  return (
    <VoiceChat
      onUserMessage={handleUserMessage}
      onSystemMessage={handleSystemMessage}
      initialMessage="Hi! I'm your social skills coach. What's your name?"
      gradeLevel="6"
    />
  );
}
```

### Voice Settings Panel

The VoiceChat component includes a settings panel with:

- **Voice Provider Selection** - ElevenLabs vs Web Speech API
- **Auto-play Toggle** - Enable/disable automatic response playback
- **Grade Level Display** - Shows current grade level settings
- **Provider Status** - Shows which voice provider is active

## Performance Optimization

### ElevenLabs API Optimization

1. **Audio Caching**
   - Reduces API calls for repeated text
   - Improves response time
   - Reduces API costs

2. **Error Handling**
   - Graceful fallback to Web Speech API
   - Prevents app crashes
   - Maintains user experience

3. **Loading States**
   - Shows loading indicators during API calls
   - Prevents multiple simultaneous requests
   - Provides user feedback

### Memory Management

```javascript
// Cleanup on unmount
useEffect(() => {
  return () => {
    // Clean up cached audio URLs
    audioCacheRef.current.forEach(url => URL.revokeObjectURL(url));
    audioCacheRef.current.clear();
  };
}, []);
```

## Browser Compatibility

### ElevenLabs Support

| Browser | ElevenLabs TTS | Web Speech Fallback |
|---------|----------------|-------------------|
| Chrome | ✅ Full Support | ✅ Full Support |
| Safari | ✅ Full Support | ✅ Full Support |
| Edge | ✅ Full Support | ✅ Full Support |
| Firefox | ✅ Full Support | ✅ Full Support |

### Feature Detection

```javascript
// Check ElevenLabs availability
const isElevenLabsAvailable = () => {
  return !!import.meta.env.VITE_ELEVENLABS_API_KEY;
};

// Check Web Speech availability
const isWebSpeechAvailable = () => {
  return 'speechSynthesis' in window;
};
```

## Error Handling Strategies

### ElevenLabs API Errors

1. **401 Unauthorized**
   - Check API key configuration
   - Fall back to Web Speech API

2. **429 Rate Limited**
   - Show user-friendly message
   - Fall back to Web Speech API

3. **500 Server Error**
   - Retry with exponential backoff
   - Fall back to Web Speech API

4. **Network Errors**
   - Check internet connection
   - Fall back to Web Speech API

### Web Speech API Errors

1. **No Speech Detected**
   - Show retry prompt
   - Provide speaking tips

2. **Microphone Permission Denied**
   - Show permission request
   - Provide instructions

3. **Language Not Supported**
   - Fall back to default language
   - Show language options

## Testing and Debugging

### Debug Mode

Enable debug logging:

```javascript
// Add to component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Voice components loaded');
    console.log('ElevenLabs API Key:', !!import.meta.env.VITE_ELEVENLABS_API_KEY);
    console.log('Web Speech Support:', !!window.speechSynthesis);
  }
}, []);
```

### Testing Checklist

- [ ] ElevenLabs API key configured
- [ ] Voice selection works for different grade levels
- [ ] Audio caching functions correctly
- [ ] Fallback to Web Speech API works
- [ ] Error handling displays appropriate messages
- [ ] Mobile controls work properly
- [ ] Accessibility features function
- [ ] Performance is acceptable

## Best Practices

### User Experience

1. **Always provide fallbacks** - Ensure app works even if ElevenLabs fails
2. **Show loading states** - Provide feedback during API calls
3. **Handle errors gracefully** - Don't break the user flow
4. **Test on real devices** - Verify mobile and desktop functionality

### Performance

1. **Cache audio responses** - Reduce API calls and improve speed
2. **Clean up resources** - Prevent memory leaks
3. **Optimize for mobile** - Consider data usage and battery life
4. **Monitor API usage** - Track costs and usage patterns

### Accessibility

1. **Provide text alternatives** - Always have text input options
2. **Use semantic HTML** - Proper button and form elements
3. **Test with screen readers** - Ensure proper navigation
4. **Include keyboard controls** - Full keyboard accessibility

## Future Enhancements

### Planned Features

- **ElevenLabs STT Integration** - Premium speech recognition
- **Voice Cloning** - Custom voice options
- **Emotion Detection** - Voice emotion analysis
- **Multi-language Support** - Multiple language options
- **Offline Mode** - Work without internet connection

### API Integrations

- **ElevenLabs Voice Cloning** - Custom voice creation
- **ElevenLabs STT** - Premium speech recognition
- **Google Cloud Speech** - Additional STT options
- **Azure Cognitive** - Emotion and sentiment analysis
- **AWS Polly** - Additional TTS options

## Troubleshooting

### Common Issues

1. **ElevenLabs API not working**
   - Check API key configuration
   - Verify internet connection
   - Check API usage limits

2. **Audio not playing**
   - Check browser audio permissions
   - Verify audio file format
   - Test with Web Speech fallback

3. **Performance issues**
   - Clear audio cache
   - Check memory usage
   - Optimize audio quality settings

4. **Mobile issues**
   - Test touch controls
   - Check audio permissions
   - Verify responsive design

### Support Resources

- **ElevenLabs Documentation**: https://docs.elevenlabs.io/
- **Web Speech API Guide**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Browser Compatibility**: https://caniuse.com/speech-synthesis
- **Audio API Support**: https://caniuse.com/audio

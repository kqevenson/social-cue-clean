# Voice Components Usage Guide

## Overview

This guide covers the three main voice components for the Social Cue app:

1. **VoiceInput** - Speech-to-Text using Web Speech API
2. **VoiceOutput** - Text-to-Speech using Web Speech API  
3. **VoiceChat** - Complete voice conversation interface

## VoiceInput Component

### Basic Usage

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onTranscript` | function | - | Called when speech is recognized |
| `onError` | function | - | Called when an error occurs |
| `isListening` | boolean | false | Current listening state |
| `setIsListening` | function | - | Function to update listening state |
| `gradeLevel` | string | '6' | Grade level for language settings |
| `autoStopDelay` | number | 3000 | Auto-stop after silence (ms) |
| `continuous` | boolean | true | Continuous recognition |
| `interimResults` | boolean | true | Show interim results |
| `maxAlternatives` | number | 1 | Max recognition alternatives |
| `className` | string | '' | Additional CSS classes |

### Features

- ✅ Real-time speech recognition
- ✅ Visual feedback with pulsing animation
- ✅ Browser compatibility checking
- ✅ Graceful error handling
- ✅ Auto-stop after silence
- ✅ Keyboard controls (Space/Esc)
- ✅ Accessibility support
- ✅ Mobile-friendly design

## VoiceOutput Component

### Basic Usage

```jsx
import VoiceOutput from './VoiceOutput';

function MyComponent() {
  const [text, setText] = useState('Hello, how are you today?');

  const handleStart = () => {
    console.log('Started speaking');
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
      autoPlay={false}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | '' | Text to speak |
| `onStart` | function | - | Called when speaking starts |
| `onEnd` | function | - | Called when speaking ends |
| `onError` | function | - | Called when an error occurs |
| `autoPlay` | boolean | false | Auto-play when text changes |
| `rate` | number | 1.0 | Speech rate (0.5-2.0) |
| `pitch` | number | 1.0 | Speech pitch (0.5-2.0) |
| `volume` | number | 1.0 | Speech volume (0-1) |
| `voice` | object | null | Specific voice to use |
| `gradeLevel` | string | '6' | Grade level for voice selection |
| `className` | string | '' | Additional CSS classes |

### Features

- ✅ Text-to-speech synthesis
- ✅ Play/pause/stop controls
- ✅ Speed and pitch adjustment
- ✅ Voice selection
- ✅ Visual feedback
- ✅ Keyboard controls (Space/Esc)
- ✅ Accessibility support
- ✅ Mobile-friendly design

## VoiceChat Component

### Basic Usage

```jsx
import VoiceChat from './VoiceChat';

function PracticeSession() {
  const handleUserMessage = (message) => {
    console.log('User said:', message);
    // Process user message and generate AI response
    const aiResponse = generateAIResponse(message);
    // The AI response will be spoken automatically
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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUserMessage` | function | - | Called when user speaks |
| `onSystemMessage` | function | - | Called for system messages |
| `initialMessage` | string | - | First message from coach |
| `gradeLevel` | string | '6' | Grade level for voice settings |
| `className` | string | '' | Additional CSS classes |

### Features

- ✅ Complete voice conversation interface
- ✅ Conversation history
- ✅ Visual feedback for listening/speaking
- ✅ Error handling
- ✅ Clear conversation option
- ✅ Accessibility support
- ✅ Mobile-friendly design

## Browser Compatibility

### Supported Browsers

- ✅ **Chrome** (Desktop & Mobile) - Full support
- ✅ **Safari** (Desktop & Mobile) - Full support  
- ✅ **Edge** (Desktop) - Full support
- ✅ **Firefox** (Desktop) - Limited support
- ❌ **Internet Explorer** - Not supported

### Feature Support

| Feature | Chrome | Safari | Edge | Firefox |
|---------|--------|--------|------|---------|
| Speech Recognition | ✅ | ✅ | ✅ | ❌ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Continuous Recognition | ✅ | ✅ | ✅ | ❌ |
| Interim Results | ✅ | ✅ | ✅ | ❌ |

## Error Handling

### Common Errors

1. **Browser Not Supported**
   - Shows fallback message
   - Suggests compatible browsers

2. **Microphone Permission Denied**
   - Shows permission request
   - Provides instructions to enable

3. **No Speech Detected**
   - Gentle retry prompt
   - Suggests speaking louder/clearer

4. **Network Errors**
   - Shows connection error
   - Suggests checking internet

5. **Voice Not Available**
   - Falls back to default voice
   - Shows voice selection options

## Accessibility Features

### Keyboard Controls

- **Space** - Start/stop listening or play/pause speaking
- **Escape** - Stop current operation
- **Tab** - Navigate between controls
- **Enter** - Activate buttons

### Screen Reader Support

- ARIA labels on all interactive elements
- Live regions for status updates
- Descriptive button labels
- Error announcements

### Visual Indicators

- Pulsing microphone when listening
- Progress bars during speech
- Color-coded status indicators
- Clear error messages

## Mobile Considerations

### Touch Targets

- Large, easy-to-tap buttons (48px minimum)
- Adequate spacing between controls
- Thumb-friendly layout

### Performance

- Optimized for mobile processors
- Efficient audio processing
- Minimal battery drain

### Network

- Graceful handling of poor connections
- Offline fallback options
- Data usage optimization

## Integration Examples

### With Practice Session

```jsx
import VoiceChat from './VoiceChat';

function PracticeSession() {
  const [scenario, setScenario] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  if (isVoiceMode) {
    return (
      <VoiceChat
        onUserMessage={handleVoiceResponse}
        initialMessage={`Let's practice: ${scenario.description}`}
        gradeLevel={user.gradeLevel}
      />
    );
  }

  return (
    <div>
      {/* Regular practice session */}
      <button onClick={() => setIsVoiceMode(true)}>
        Try Voice Practice
      </button>
    </div>
  );
}
```

### With Goals Screen

```jsx
import VoiceInput from './VoiceInput';

function GoalsScreen() {
  const [newGoal, setNewGoal] = useState('');

  const handleVoiceGoal = (transcript) => {
    setNewGoal(transcript);
    // Process the spoken goal
  };

  return (
    <div>
      <h2>Create New Goal</h2>
      <VoiceInput
        onTranscript={handleVoiceGoal}
        gradeLevel={user.gradeLevel}
      />
      <input 
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
        placeholder="Or type your goal here"
      />
    </div>
  );
}
```

## Best Practices

### User Experience

1. **Always provide fallback options** - Text input when voice fails
2. **Give clear feedback** - Visual and audio cues for all states
3. **Handle errors gracefully** - Don't break the user flow
4. **Test on real devices** - Mobile and desktop testing essential

### Performance

1. **Lazy load components** - Only load when needed
2. **Clean up resources** - Stop recognition/synthesis on unmount
3. **Optimize for mobile** - Consider battery and data usage
4. **Cache voice settings** - Remember user preferences

### Accessibility

1. **Test with screen readers** - Ensure proper navigation
2. **Provide alternatives** - Always have text options
3. **Use semantic HTML** - Proper button and form elements
4. **Test keyboard navigation** - Full keyboard accessibility

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Test microphone in other apps
   - Try different browser

2. **Speech not recognized**
   - Speak clearly and slowly
   - Check microphone quality
   - Try different language settings

3. **Voice sounds robotic**
   - Try different voice options
   - Adjust speed and pitch
   - Check browser voice support

4. **Performance issues**
   - Close other audio apps
   - Check internet connection
   - Restart browser

### Debug Mode

Enable debug logging:

```jsx
// Add to component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Voice components loaded');
  }
}, []);
```

## Future Enhancements

### Planned Features

- **Emotion Recognition** - Detect user's emotional state
- **Multi-language Support** - Support for multiple languages
- **Voice Cloning** - Custom voice options
- **Offline Mode** - Work without internet connection
- **Group Practice** - Multiple users in voice session

### API Integrations

- **ElevenLabs** - High-quality voice synthesis
- **Google Cloud** - Advanced speech recognition
- **Azure Cognitive** - Emotion and sentiment analysis
- **AWS Polly** - Additional voice options

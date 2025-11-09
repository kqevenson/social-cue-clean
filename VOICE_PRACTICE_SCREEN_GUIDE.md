# Voice Practice Screen Component Guide

## Overview

The `VoicePracticeScreen` component is a comprehensive, full-screen voice conversation interface that brings together all voice conversation features into a single, polished user experience. It provides a chat-like interface for practicing social skills through voice interaction with an AI coach.

## Features

### 🎯 Core Functionality
- **Full-screen conversation interface** with chat-style message display
- **Real-time voice input/output** using Web Speech API and ElevenLabs
- **Multi-phase conversation flow** (Intro → Practice → Feedback → Complete)
- **AI thinking indicators** and visual feedback
- **Message replay** functionality for AI responses
- **Progress tracking** and performance metrics

### 🎨 User Interface
- **Dark theme** matching Social Cue's design system
- **Smooth animations** for messages and interactions
- **Responsive layout** that works on all screen sizes
- **Accessibility features** including keyboard navigation
- **Phase indicators** showing conversation progress
- **Settings modal** for voice preferences

### 🔧 Controls & Settings
- **Large microphone button** with visual feedback
- **Audio playback controls** for AI messages
- **Voice speed adjustment** (0.5x to 2.0x)
- **Audio enable/disable** toggle
- **Help system** with usage tips
- **Exit confirmation** for incomplete sessions

## Usage

### Basic Implementation

```jsx
import VoicePracticeScreen from './components/socialcue/VoicePracticeScreen';

function App() {
  const handleComplete = (results) => {
    console.log('Practice completed:', results);
    // Handle completion (navigate to results, save progress, etc.)
  };

  const handleExit = () => {
    console.log('User exited practice');
    // Handle exit (navigate back, save partial progress, etc.)
  };

  return (
    <VoicePracticeScreen
      scenario={{
        title: "Making Friends",
        description: "Practice introducing yourself to new people",
        category: "Social Skills"
      }}
      gradeLevel="6"
      voiceGender="female"
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scenario` | Object | Required | Scenario object with title, description, category |
| `gradeLevel` | String | `'6'` | Grade level for age-appropriate responses |
| `voiceGender` | String | `'female'` | Voice gender ('female' or 'male') |
| `onComplete` | Function | - | Callback when conversation completes |
| `onExit` | Function | - | Callback when user exits practice |

### Scenario Object Structure

```javascript
const scenario = {
  title: "Making Friends",
  description: "Practice introducing yourself to new people",
  category: "Social Skills"
};
```

### Completion Callback Data

```javascript
const handleComplete = (results) => {
  console.log(results);
  // {
  //   totalTurns: 8,
  //   successfulExchanges: 6,
  //   hesitations: 2,
  //   hintsGiven: 3,
  //   score: 75,
  //   startTime: Date,
  //   endTime: Date,
  //   duration: 180, // seconds
  //   scenario: { title: "Making Friends", ... },
  //   gradeLevel: "6",
  //   conversationType: "voice"
  // }
};
```

## Component Architecture

### Dependencies

The component relies on several other components and hooks:

```javascript
import { VoiceInput, VoiceOutput } from '../voice';
import useVoiceConversation from '../../hooks/useVoiceConversation';
```

### State Management

The component uses the `useVoiceConversation` hook for all conversation state:

```javascript
const {
  messages,           // Array of conversation messages
  isAIThinking,       // Boolean - AI is processing
  isListening,        // Boolean - Microphone is active
  setIsListening,     // Function - Control microphone
  currentPhase,       // String - Current conversation phase
  startConversation,  // Function - Initialize conversation
  sendUserMessage,    // Function - Send user input
  endConversation,    // Function - End conversation
  performance,        // Object - Performance metrics
  updateMessageAudioPlayed // Function - Mark message as played
} = useVoiceConversation({ scenario, gradeLevel, onComplete });
```

### Message Structure

Each message in the conversation has this structure:

```javascript
{
  id: "unique-message-id",
  role: "ai" | "user",
  text: "Message content",
  timestamp: Date,
  audioPlayed: false,
  phase: "intro" | "practice" | "feedback" | "complete",
  metadata: {
    conversationId: "conv_123",
    confidence: 0.9,
    responseTime: 1500,
    tokensUsed: 100,
    feedback: "Specific feedback",
    encouragement: "Encouraging message",
    hints: ["hint1", "hint2"]
  }
}
```

## User Experience Flow

### 1. Initialization
- Component mounts and shows loading state
- Calls `startConversation()` to initialize AI
- AI sends welcome message and begins conversation

### 2. Conversation Phases

#### Intro Phase
- AI introduces the scenario
- Explains what will be practiced
- Asks if user is ready to begin
- Typically 1-2 exchanges

#### Practice Phase
- Main interactive conversation
- AI responds to user input
- Provides guidance and encouragement
- Continues until sufficient practice (8+ exchanges)

#### Feedback Phase
- AI provides specific feedback
- Highlights strengths and areas for improvement
- Offers encouragement and tips
- Typically 2-3 exchanges

#### Complete Phase
- AI summarizes the session
- Celebrates progress made
- Encourages continued practice
- Session ends automatically

### 3. User Interactions

#### Speaking
- User taps microphone button
- Visual feedback shows "listening" state
- User speaks naturally
- Speech is transcribed and sent to AI
- AI responds with voice and text

#### Replaying Messages
- User taps speaker icon on AI messages
- Message is played using TTS
- Visual feedback shows playback state

#### Settings
- User can adjust voice speed
- Enable/disable audio output
- Access help information

#### Exiting
- User can exit at any time
- Confirmation dialog for incomplete sessions
- Partial progress is saved

## Error Handling

### Speech Recognition Errors
- **Permission denied**: Shows helpful message to enable microphone
- **Not supported**: Falls back to text input
- **Network issues**: Retries automatically with exponential backoff
- **Timeout**: Continues listening or shows retry option

### API Errors
- **Connection failed**: Shows fallback response
- **Invalid response**: Uses cached or default response
- **Rate limiting**: Shows appropriate message and retry option

### Audio Playback Errors
- **ElevenLabs fails**: Falls back to Web Speech API
- **Web Speech fails**: Shows text-only mode
- **No audio**: Gracefully degrades to text interface

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for settings sliders

### Screen Reader Support
- Proper ARIA labels on all controls
- Live regions for dynamic content
- Semantic HTML structure
- Alt text for all icons

### Visual Accessibility
- High contrast mode support
- Adjustable text size
- Clear visual feedback for all states
- Color-blind friendly design

### Motor Accessibility
- Large touch targets (minimum 44px)
- Generous spacing between controls
- No time-based interactions
- Alternative input methods

## Performance Considerations

### Optimizations
- **Message virtualization** for long conversations
- **Audio caching** for repeated playback
- **Lazy loading** of voice components
- **Debounced input** for speech recognition

### Memory Management
- **Message cleanup** for old conversations
- **Audio blob disposal** after playback
- **Event listener cleanup** on unmount
- **Ref management** for DOM elements

### Network Efficiency
- **Request batching** for multiple API calls
- **Response caching** for repeated scenarios
- **Compression** for audio data
- **Fallback strategies** for offline use

## Integration Examples

### With React Router

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function VoicePracticeWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, gradeLevel } = location.state;

  const handleComplete = (results) => {
    navigate('/session-results', { 
      state: { results, type: 'voice' } 
    });
  };

  const handleExit = () => {
    navigate('/practice');
  };

  return (
    <VoicePracticeScreen
      scenario={scenario}
      gradeLevel={gradeLevel}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
```

### With State Management (Redux/Zustand)

```jsx
import { useStore } from './store';

function VoicePracticeWithState() {
  const { saveProgress, updateUserStats } = useStore();

  const handleComplete = (results) => {
    saveProgress({
      type: 'voice_practice',
      scenario: results.scenario.title,
      score: results.score,
      duration: results.duration,
      timestamp: new Date()
    });
    
    updateUserStats({
      totalVoiceSessions: 1,
      averageScore: results.score,
      totalPracticeTime: results.duration
    });
  };

  return (
    <VoicePracticeScreen
      scenario={scenario}
      onComplete={handleComplete}
      onExit={() => navigate('/practice')}
    />
  );
}
```

### With Analytics

```jsx
import { analytics } from './analytics';

function VoicePracticeWithAnalytics() {
  const handleComplete = (results) => {
    analytics.track('voice_practice_completed', {
      scenario: results.scenario.title,
      gradeLevel: results.gradeLevel,
      score: results.score,
      duration: results.duration,
      totalTurns: results.totalTurns,
      successfulExchanges: results.successfulExchanges
    });
  };

  const handleExit = () => {
    analytics.track('voice_practice_exited', {
      phase: currentPhase,
      messagesCount: messages.length
    });
  };

  return (
    <VoicePracticeScreen
      scenario={scenario}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
```

## Testing

### Unit Tests

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoicePracticeScreen from './VoicePracticeScreen';

describe('VoicePracticeScreen', () => {
  const mockScenario = {
    title: "Test Scenario",
    description: "Test description",
    category: "Test"
  };

  test('renders initial loading state', () => {
    render(
      <VoicePracticeScreen
        scenario={mockScenario}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );
    
    expect(screen.getByText('Starting voice practice...')).toBeInTheDocument();
  });

  test('shows microphone button when ready', async () => {
    render(
      <VoicePracticeScreen
        scenario={mockScenario}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /microphone/i })).toBeInTheDocument();
    });
  });

  test('opens settings modal when settings button clicked', async () => {
    render(
      <VoicePracticeScreen
        scenario={mockScenario}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('VoicePracticeScreen Integration', () => {
  test('complete conversation flow', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    
    render(
      <VoicePracticeScreen
        scenario={mockScenario}
        onComplete={onComplete}
        onExit={jest.fn()}
      />
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByText(/tap microphone to speak/i)).toBeInTheDocument();
    });
    
    // Simulate user speech
    const micButton = screen.getByRole('button', { name: /microphone/i });
    await user.click(micButton);
    
    // Simulate speech recognition result
    // (This would require mocking the VoiceInput component)
    
    // Verify completion callback
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          scenario: mockScenario,
          conversationType: 'voice'
        })
      );
    });
  });
});
```

## Troubleshooting

### Common Issues

#### Microphone Not Working
- Check browser permissions
- Verify microphone is not being used by another app
- Try refreshing the page
- Check browser compatibility

#### AI Not Responding
- Check internet connection
- Verify API key is configured
- Check browser console for errors
- Try refreshing the page

#### Audio Playback Issues
- Check browser audio permissions
- Verify system volume is up
- Try different voice settings
- Check for audio conflicts

#### Performance Issues
- Close other browser tabs
- Check available memory
- Disable browser extensions
- Try different browser

### Debug Mode

Enable debug logging by setting environment variable:

```bash
REACT_APP_DEBUG_VOICE=true
```

This will log detailed information about:
- Speech recognition events
- API requests and responses
- Audio playback events
- Component state changes

## Future Enhancements

### Planned Features
- **Multi-language support** for different languages
- **Voice emotion detection** for more nuanced responses
- **Conversation recording** for review and analysis
- **Custom voice training** for personalized AI coach
- **Group practice sessions** for multiple users
- **Advanced analytics** with detailed insights

### Technical Improvements
- **WebRTC integration** for better audio quality
- **Offline mode** with cached responses
- **Progressive Web App** support
- **Voice synthesis** with custom voices
- **Real-time collaboration** features
- **Advanced error recovery** mechanisms

## Support

For technical support or feature requests:
- Check the troubleshooting section above
- Review the error messages in browser console
- Test with different browsers and devices
- Verify all dependencies are properly installed
- Check network connectivity and API status

The VoicePracticeScreen component is designed to be robust, accessible, and user-friendly while providing a comprehensive voice conversation experience for social skills practice.

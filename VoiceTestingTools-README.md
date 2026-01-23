# Voice Testing Tools

A comprehensive testing and debugging suite for the Social Cue voice practice feature.

## Features

### 🔧 Developer Debug Panel
- **Real-time Speech Recognition Status**: Monitor microphone input, transcript accuracy, and confidence levels
- **Voice Output Monitoring**: Track ElevenLabs API calls, audio playback status, and voice ID usage
- **API Call Logging**: View recent API requests with latency and status information
- **Performance Metrics**: Monitor latency, token usage, and memory consumption

### 🎤 Voice Testing Interface
- **Microphone Testing**: Test speech recognition with real-time feedback
- **Voice Output Testing**: Test ElevenLabs and browser TTS with custom text
- **Voice Comparison**: Compare different voice providers and settings
- **Audio Recording**: Record and playback test audio for quality assessment

### 🤖 Conversation Simulator
- **Pre-written Test Scenarios**: 
  - Happy Path (smooth conversation flow)
  - User Confusion (user gets stuck)
  - Speech Recognition Errors (handling failures)
  - API Failures (error recovery)
- **Automated Testing**: Run complete conversation flows
- **Stress Testing**: Test system under various conditions
- **Error Simulation**: Test error handling and recovery

### 📊 Analytics Dashboard
- **Test Results Tracking**: View performance metrics from test runs
- **Success Rate Monitoring**: Track conversation completion rates
- **Latency Analysis**: Monitor response times and bottlenecks
- **Export Functionality**: Download test results as JSON

### 💬 Feedback Collection
- **Quick Feedback Buttons**: One-click feedback for conversation quality
- **Issue Reporting**: Detailed bug reporting with descriptions
- **User Satisfaction**: Track user experience metrics

## Installation

1. **Copy the component** to your project:
   ```bash
   cp VoiceTestingTools.jsx src/components/debug/
   ```

2. **Import and use** in your main app component:
   ```jsx
   import VoiceTestingTools from './components/debug/VoiceTestingTools';
   
   function App() {
     return (
       <div>
         {/* Your app content */}
         
         {/* Add testing tools (only in development) */}
         <VoiceTestingTools 
           isDevelopment={import.meta.env.DEV}
           onVoiceTest={(result) => console.log('Voice test result:', result)}
           onConversationTest={(result) => console.log('Conversation test result:', result)}
           onPerformanceTest={(result) => console.log('Performance test result:', result)}
         />
       </div>
     );
   }
   ```

3. **Environment Variables** (ensure these are set):
   ```env
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   VITE_USE_ELEVENLABS=true
   ```

## Usage

### Accessing the Debug Panel

1. **Development Mode Only**: The debug panel only appears when `isDevelopment={true}`
2. **Toggle Button**: Click the bug icon in the bottom-right corner
3. **Panel Tabs**: Switch between Debug, Testing, Analytics, and Feedback

### Debug Tab

Monitor real-time system status:
- **Speech Recognition**: Current status, transcript, confidence level
- **Voice Output**: Playback status, current text, voice ID
- **API Calls**: Recent requests with latency and status
- **Performance**: Current metrics and resource usage

### Testing Tab

Run various tests:
- **Microphone Test**: Click "Test Microphone" to verify speech recognition
- **Voice Output Test**: Test with default or custom text
- **Test Scenarios**: Run pre-defined conversation flows
- **Performance Test**: Stress test API endpoints

### Analytics Tab

View test results:
- **Recent Results**: Last 10 test runs with metrics
- **Export Data**: Download results as JSON
- **Clear Results**: Reset test history

### Feedback Tab

Collect user feedback:
- **Quick Feedback**: One-click satisfaction ratings
- **Issue Reports**: Detailed bug descriptions
- **Submit Reports**: Send feedback to development team

## Test Scenarios

### Happy Path
Tests smooth conversation flow with expected user responses.

### User Confusion
Simulates scenarios where users get stuck or confused, testing the AI's ability to provide clarification.

### Speech Recognition Errors
Tests handling of speech recognition failures, background noise, and unclear speech.

### API Failures
Simulates API timeouts, rate limits, and network errors to test error recovery.

## Integration with Voice Practice

The testing tools can be integrated with your existing voice practice components:

```jsx
// In VoicePracticeScreen.jsx
import VoiceTestingTools from '../debug/VoiceTestingTools';

const VoicePracticeScreen = () => {
  // Your existing voice practice logic
  
  return (
    <div>
      {/* Your voice practice UI */}
      
      {/* Testing tools */}
      <VoiceTestingTools 
        isDevelopment={import.meta.env.DEV}
        onVoiceTest={(result) => {
          // Handle voice test results
          console.log('Voice test completed:', result);
        }}
        onConversationTest={(result) => {
          // Handle conversation test results
          console.log('Conversation test completed:', result);
        }}
        onPerformanceTest={(result) => {
          // Handle performance test results
          console.log('Performance test completed:', result);
        }}
      />
    </div>
  );
};
```

## Customization

### Adding New Test Scenarios

```jsx
const customScenarios = [
  {
    id: 'custom-test',
    name: 'Custom Test',
    description: 'Your custom test description',
    script: [
      { role: 'user', text: 'User input' },
      { role: 'ai', text: 'AI response' }
    ]
  }
];

// Pass to component
<VoiceTestingTools 
  testScenarios={customScenarios}
  // ... other props
/>
```

### Custom Debug Data

```jsx
// Update debug data from your components
const updateDebugData = (section, data) => {
  // This function is exposed by the testing tools
  // Use it to update debug information
};
```

## API Integration

The testing tools automatically integrate with:
- **ElevenLabs API**: For voice output testing
- **Web Speech API**: For speech recognition testing
- **Your Backend API**: For performance testing

## Performance Considerations

- **Development Only**: Tools only load in development mode
- **Lazy Loading**: Debug panel loads only when opened
- **Memory Management**: Test results are limited to prevent memory leaks
- **API Rate Limiting**: Built-in delays prevent API abuse

## Troubleshooting

### Common Issues

1. **Microphone Not Working**:
   - Check browser permissions
   - Ensure HTTPS in production
   - Test in different browsers

2. **ElevenLabs API Errors**:
   - Verify API key is set
   - Check API quota limits
   - Test with fallback TTS

3. **Speech Recognition Issues**:
   - Check browser support
   - Test with different languages
   - Verify microphone quality

### Debug Information

The debug panel provides detailed information about:
- API response codes and errors
- Speech recognition confidence levels
- Audio playback status
- Network latency and performance

## Contributing

To add new features to the testing tools:

1. **Add new test scenarios** in the `scenarios` array
2. **Extend debug data** in the `debugData` state
3. **Add new tabs** by extending the tab navigation
4. **Implement new tests** following the existing pattern

## License

This testing tool is part of the Social Cue project and follows the same license terms.



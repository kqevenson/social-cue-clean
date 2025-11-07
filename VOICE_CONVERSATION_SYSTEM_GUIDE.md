# Voice Conversation System - Complete Implementation Guide

## 🎤 Overview

The Voice Conversation System provides a comprehensive state management solution for AI-powered voice chatbots in the Social Cue platform. It manages multi-phase conversations with performance tracking, error recovery, and seamless integration with the existing voice components.

## 📁 Files Created

### 1. **Frontend Hook**: `src/hooks/useVoiceConversation.js`
- Custom React hook for conversation state management
- Multi-phase conversation flow (intro, practice, feedback, complete)
- Performance tracking and analytics
- Error recovery with fallback responses
- Integration with VoiceInput and VoiceOutput components

### 2. **Backend API**: `server.js` (new endpoint)
- `POST /api/voice/conversation` - AI response generation
- Age-appropriate conversation guidelines
- Claude API integration with structured responses
- Comprehensive error handling and fallbacks

## 🚀 Quick Start

### Basic Usage

```javascript
import useVoiceConversation from '../hooks/useVoiceConversation';
import VoiceInput from '../components/voice/VoiceInput';
import VoiceOutput from '../components/voice/VoiceOutput';

const VoiceChatComponent = () => {
  const {
    messages,
    isAIThinking,
    isListening,
    setIsListening,
    currentPhase,
    startConversation,
    sendUserMessage,
    endConversation,
    performance
  } = useVoiceConversation({
    scenario: "Making friends at lunch",
    gradeLevel: "6",
    onComplete: (results) => {
      console.log('Conversation completed:', results);
    }
  });

  const handleStart = async () => {
    await startConversation();
  };

  const handleUserMessage = async (text) => {
    await sendUserMessage(text);
  };

  return (
    <div>
      <button onClick={handleStart}>Start Conversation</button>
      
      <VoiceInput
        onTranscript={handleUserMessage}
        isListening={isListening}
        setIsListening={setIsListening}
        gradeLevel="6"
      />
      
      <VoiceOutput
        text={messages[messages.length - 1]?.text || ''}
        voiceGender="female"
        autoPlay={true}
      />
      
      <div>
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔧 Hook API Reference

### Parameters

```javascript
const useVoiceConversation = ({
  scenario,        // Required: Social scenario to practice
  gradeLevel,      // Optional: Grade level (default: '6')
  onComplete,      // Optional: Callback when conversation ends
  maxTurns,        // Optional: Max conversation turns (default: 8)
  apiBaseUrl       // Optional: API base URL
}) => {
  // ... hook implementation
};
```

### Return Values

```javascript
return {
  // Core State
  messages,           // Array of conversation messages
  isAIThinking,       // Boolean: AI is generating response
  isListening,        // Boolean: Currently listening for user input
  setIsListening,     // Function: Set listening state
  currentPhase,       // String: Current conversation phase
  conversationId,     // String: Unique conversation identifier
  isActive,          // Boolean: Conversation is active
  error,             // String: Error message if any
  
  // Performance Tracking
  performance: {
    totalTurns,           // Number: Total conversation turns
    successfulExchanges,  // Number: Successful user-AI exchanges
    hesitations,         // Number: User hesitations detected
    hintsGiven,          // Number: Hints provided to user
    score,               // Number: Overall performance score (0-100)
    startTime,           // Date: Conversation start time
    endTime,             // Date: Conversation end time
    duration             // Number: Total duration in milliseconds
  },
  
  // Actions
  startConversation,  // Function: Start new conversation
  sendUserMessage,    // Function: Send user message and get AI response
  endConversation,    // Function: End current conversation
  resetConversation,  // Function: Reset all conversation state
  
  // Utilities
  getStats,          // Function: Get conversation statistics
  phases,            // Object: Available conversation phases
  maxTurns,          // Number: Maximum conversation turns
  apiBaseUrl         // String: API base URL
};
```

## 📊 Message Structure

```javascript
{
  id: "timestamp_randomId",           // Unique message identifier
  role: "ai" | "user",                // Message sender
  text: "Message content",            // Message text
  timestamp: Date,                    // Message timestamp
  audioPlayed: boolean,               // Whether audio was played
  phase: "intro" | "practice" | "feedback" | "complete", // Conversation phase
  metadata: {
    conversationId: "conv_123",       // Conversation identifier
    confidence: 0.8,                  // AI confidence level
    responseTime: 1500,               // Response generation time
    tokensUsed: 150,                  // Tokens consumed
    feedback: "Specific feedback",     // Performance feedback
    encouragement: "Encouraging message", // Encouragement
    hints: ["hint1", "hint2"],        // Helpful hints
    isFallback: false                 // Whether this is a fallback response
  }
}
```

## 🎯 Conversation Phases

### 1. **INTRO Phase**
- **Purpose**: Welcome student and explain scenario
- **Duration**: 1-2 turns
- **AI Behavior**: Warm introduction, scenario explanation, expectations
- **Next Phase**: `practice`

### 2. **PRACTICE Phase**
- **Purpose**: Interactive dialogue and skill practice
- **Duration**: 5-8 turns (configurable)
- **AI Behavior**: Ask questions, provide guidance, encourage participation
- **Next Phase**: `feedback`

### 3. **FEEDBACK Phase**
- **Purpose**: Provide specific performance feedback
- **Duration**: 1-2 turns
- **AI Behavior**: Highlight strengths, suggest improvements, encourage
- **Next Phase**: `complete`

### 4. **COMPLETE Phase**
- **Purpose**: Summarize learning and provide encouragement
- **Duration**: 1 turn
- **AI Behavior**: Final summary, celebration, wrap-up
- **Next Phase**: `null` (conversation ends)

## 🎨 Age-Appropriate Guidelines

The system automatically adjusts language and interaction style based on grade level:

### **K-2 (Kindergarten - 2nd Grade)**
- **Language**: Very simple words, short sentences (3-8 words)
- **Questions**: Simple yes/no or choice questions
- **Feedback**: Positive and encouraging
- **Avoid**: Complex explanations, abstract concepts

### **3-5 (3rd - 5th Grade)**
- **Language**: Clear, concrete language (5-12 words per sentence)
- **Questions**: Concrete, specific questions about feelings and actions
- **Feedback**: Specific and constructive
- **Avoid**: Abstract concepts, complex social dynamics

### **6-8 (6th - 8th Grade)**
- **Language**: Natural, conversational language (8-15 words per sentence)
- **Questions**: Thoughtful questions about social situations
- **Feedback**: Detailed and encouraging
- **Avoid**: Adult themes, complex relationships

### **9-12 (9th - 12th Grade)**
- **Language**: Mature, sophisticated language (10-20 words per sentence)
- **Questions**: Complex questions about social dynamics
- **Feedback**: Comprehensive and insightful
- **Avoid**: Inappropriate content

### **Adult**
- **Language**: Professional, clear language (12-25 words per sentence)
- **Questions**: Sophisticated questions about social interactions
- **Feedback**: Detailed and professional
- **Avoid**: Inappropriate content

## 🔄 Performance Tracking

### Metrics Tracked

```javascript
{
  totalTurns: 8,              // Total conversation turns
  successfulExchanges: 6,     // Successful user-AI exchanges
  hesitations: 2,             // User hesitations detected
  hintsGiven: 1,              // Hints provided to user
  score: 85,                  // Overall performance score (0-100)
  startTime: Date,            // Conversation start time
  endTime: Date,              // Conversation end time
  duration: 450000            // Total duration in milliseconds
}
```

### Score Calculation

```javascript
const calculateScore = (performance) => {
  const baseScore = 50;
  const successBonus = performance.successfulExchanges * 10;
  const hesitationPenalty = performance.hesitations * 5;
  const hintPenalty = performance.hintsGiven * 3;
  const completionBonus = performance.totalTurns >= 5 ? 20 : 0;
  
  return Math.max(0, Math.min(100, 
    baseScore + successBonus - hesitationPenalty - hintPenalty + completionBonus
  ));
};
```

## 🛡️ Error Recovery

### Retry Logic
- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential backoff (1s, 2s, 4s)
- **Fallback Responses**: Pre-defined responses for each phase

### Fallback Responses

```javascript
const fallbackResponses = {
  intro: [
    "Hi there! I'm here to help you practice social skills. Let's work on this scenario together.",
    "Welcome! I'm excited to practice with you today. Let's start with this situation."
  ],
  practice: [
    "That's interesting! Can you tell me more about what you're thinking?",
    "I see. How do you think the other person might feel in this situation?"
  ],
  feedback: [
    "You did a great job working through that scenario! You showed good thinking.",
    "I'm proud of how you handled that situation. You're learning and growing!"
  ],
  complete: [
    "Great job completing this practice session! You've learned a lot today.",
    "Congratulations on finishing this scenario! You should be proud of your progress."
  ]
};
```

## 🔌 Backend API Integration

### Request Format

```javascript
POST /api/voice/conversation
Content-Type: application/json

{
  "conversationHistory": [
    { "role": "ai", "text": "Hello! Let's practice..." },
    { "role": "user", "text": "I want to make friends" }
  ],
  "scenario": "Making friends at lunch",
  "gradeLevel": "6",
  "phase": "practice",
  "performance": {
    "totalTurns": 3,
    "successfulExchanges": 2,
    "hesitations": 1,
    "hintsGiven": 0
  },
  "conversationId": "conv_123456789",
  "timestamp": "2025-01-25T20:00:00.000Z"
}
```

### Response Format

```javascript
{
  "success": true,
  "response": "That's wonderful! How do you think you could start a conversation with someone new?",
  "nextPhase": "practice",
  "shouldContinue": true,
  "feedback": "You're showing great enthusiasm for making friends!",
  "encouragement": "I believe you can do this!",
  "hints": [
    "Try asking about something you both have in common",
    "A simple 'Hi, can I sit here?' is a great start"
  ],
  "confidence": 0.8,
  "responseTime": 1500,
  "tokensUsed": 150
}
```

## 🎮 Complete Integration Example

```javascript
import React, { useState, useEffect } from 'react';
import useVoiceConversation from '../hooks/useVoiceConversation';
import VoiceInput from '../components/voice/VoiceInput';
import VoiceOutput from '../components/voice/VoiceOutput';

const VoiceChatPractice = ({ scenario, gradeLevel }) => {
  const [currentAIMessage, setCurrentAIMessage] = useState('');
  
  const {
    messages,
    isAIThinking,
    isListening,
    setIsListening,
    currentPhase,
    startConversation,
    sendUserMessage,
    endConversation,
    performance,
    error
  } = useVoiceConversation({
    scenario,
    gradeLevel,
    onComplete: (results) => {
      console.log('Conversation completed:', results);
      // Handle completion (save to database, show results, etc.)
    }
  });

  // Update current AI message for VoiceOutput
  useEffect(() => {
    const lastAIMessage = messages.filter(m => m.role === 'ai').pop();
    if (lastAIMessage) {
      setCurrentAIMessage(lastAIMessage.text);
    }
  }, [messages]);

  const handleStartConversation = async () => {
    const result = await startConversation();
    if (result.success) {
      console.log('Conversation started:', result.conversationId);
    }
  };

  const handleUserMessage = async (text) => {
    const result = await sendUserMessage(text);
    if (result.success) {
      console.log('Message sent successfully');
    }
  };

  const handleEndConversation = async () => {
    const result = await endConversation();
    if (result.success) {
      console.log('Conversation ended:', result.performance);
    }
  };

  return (
    <div className="voice-chat-practice">
      <div className="conversation-header">
        <h2>Voice Practice: {scenario}</h2>
        <div className="phase-indicator">
          Phase: {currentPhase} | Turns: {performance.totalTurns}
        </div>
        <div className="performance-score">
          Score: {performance.score}/100
        </div>
      </div>

      <div className="conversation-controls">
        <button 
          onClick={handleStartConversation}
          disabled={isAIThinking}
        >
          Start Conversation
        </button>
        <button 
          onClick={handleEndConversation}
          disabled={!isActive}
        >
          End Conversation
        </button>
      </div>

      <div className="voice-components">
        <VoiceInput
          onTranscript={handleUserMessage}
          onError={(error) => console.error('Voice input error:', error)}
          isListening={isListening}
          setIsListening={setIsListening}
          gradeLevel={gradeLevel}
        />
        
        <VoiceOutput
          text={currentAIMessage}
          voiceGender="female"
          autoPlay={true}
          onComplete={() => console.log('AI finished speaking')}
          onError={(error) => console.error('Voice output error:', error)}
        />
      </div>

      <div className="conversation-log">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-header">
              <strong>{msg.role.toUpperCase()}</strong>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString()}
              </span>
              <span className="phase">{msg.phase}</span>
            </div>
            <div className="message-content">{msg.text}</div>
            {msg.metadata?.feedback && (
              <div className="feedback">
                <strong>Feedback:</strong> {msg.metadata.feedback}
              </div>
            )}
            {msg.metadata?.encouragement && (
              <div className="encouragement">
                <strong>Encouragement:</strong> {msg.metadata.encouragement}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {isAIThinking && (
        <div className="ai-thinking">
          AI is thinking...
        </div>
      )}
    </div>
  );
};

export default VoiceChatPractice;
```

## 🧪 Testing

### Test Scenarios

1. **Basic Conversation Flow**
   - Start conversation
   - Send user messages
   - Verify AI responses
   - Complete conversation

2. **Error Recovery**
   - Simulate API failures
   - Verify fallback responses
   - Test retry logic

3. **Performance Tracking**
   - Verify metrics collection
   - Test score calculation
   - Check duration tracking

4. **Phase Transitions**
   - Verify phase progression
   - Test phase-specific responses
   - Check completion logic

### Test Commands

```bash
# Test the hook
npm test -- --testNamePattern="useVoiceConversation"

# Test the API endpoint
curl -X POST http://localhost:3001/api/voice/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationHistory": [],
    "scenario": "Making friends at lunch",
    "gradeLevel": "6",
    "phase": "intro",
    "performance": {},
    "conversationId": "test_123",
    "timestamp": "2025-01-25T20:00:00.000Z"
  }'
```

## 🚀 Deployment Considerations

### Environment Variables

```bash
# Required
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_API_URL=http://localhost:3001

# Optional
VITE_MAX_CONVERSATION_TURNS=8
VITE_CONVERSATION_TIMEOUT=600000
```

### Performance Optimization

1. **Message History**: Only send last 10 messages to API
2. **Caching**: Cache AI responses for similar scenarios
3. **Debouncing**: Debounce user input to prevent rapid API calls
4. **Cleanup**: Proper cleanup on component unmount

### Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Content Filtering**: Filter inappropriate content
4. **Data Privacy**: Handle conversation data securely

## 📈 Future Enhancements

1. **Multi-language Support**: Support for different languages
2. **Voice Emotion Detection**: Analyze user's emotional state
3. **Adaptive Difficulty**: Adjust difficulty based on performance
4. **Conversation Templates**: Pre-defined conversation templates
5. **Analytics Dashboard**: Detailed performance analytics
6. **Integration with LMS**: Connect with learning management systems

## 🎯 Success Metrics

- **Engagement**: Average conversation duration
- **Completion Rate**: Percentage of completed conversations
- **Performance Scores**: Average performance scores
- **User Satisfaction**: User feedback and ratings
- **Error Rate**: API failure and retry rates

The Voice Conversation System provides a robust foundation for AI-powered voice interactions in the Social Cue platform, with comprehensive state management, error recovery, and performance tracking capabilities.

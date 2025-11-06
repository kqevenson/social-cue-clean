/**
 * VoiceInput Usage Examples
 * 
 * This file demonstrates how to use the VoiceInput component
 * in your Social Cue voice practice sessions.
 */

import React, { useState } from 'react';
import VoiceInput from './VoiceInput.jsx';

// Example 1: Basic Usage
function BasicVoiceInputExample() {
  const [transcript, setTranscript] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);

  const handleTranscript = (text) => {
    console.log('Transcript received:', text);
    setTranscript(text);
    
    // Process transcript (e.g., send to API)
    // await processUserMessage(text);
  };

  const handleStart = () => {
    console.log('Recording started');
  };

  const handleEnd = () => {
    console.log('Recording ended');
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <VoiceInput
        onTranscript={handleTranscript}
        onStart={handleStart}
        onEnd={handleEnd}
        isDisabled={isAIThinking}
        className="max-w-md mx-auto"
      />
      
      {transcript && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-white">{transcript}</p>
        </div>
      )}
    </div>
  );
}

// Example 2: Integration with Voice Practice Session
function VoicePracticeSessionExample() {
  const [userMessage, setUserMessage] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleTranscript = async (text) => {
    if (!text.trim()) return;

    // Add user message to history
    const newMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
    setUserMessage(text);
    
    // Disable input while AI is responding
    setIsAISpeaking(true);
    
    // Send to API
    try {
      const response = await fetch('/api/voice/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session_123',
          userMessage: text
        })
      });
      
      const data = await response.json();
      
      // Add AI response to history
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: data.aiResponse,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsAISpeaking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Conversation History */}
        <div className="space-y-4 mb-8">
          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-blue-500/20 ml-auto max-w-[80%]'
                  : 'bg-emerald-500/20 mr-auto max-w-[80%]'
              }`}
            >
              <p className="text-white">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Voice Input */}
        <VoiceInput
          onTranscript={handleTranscript}
          onStart={() => console.log('Recording started')}
          onEnd={() => console.log('Recording ended')}
          isDisabled={isAISpeaking}
          className="w-full"
        />
      </div>
    </div>
  );
}

// Example 3: With SpeechRecognitionProvider (Required for react-speech-recognition)
// Note: You need to wrap your app with SpeechRecognitionProvider at the root level

/*
import { SpeechRecognitionProvider } from 'react-speech-recognition';

function App() {
  return (
    <SpeechRecognitionProvider>
      <YourApp />
    </SpeechRecognitionProvider>
  );
}
*/

export { BasicVoiceInputExample, VoicePracticeSessionExample };


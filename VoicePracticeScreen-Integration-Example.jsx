// Example integration of VoiceTestingTools into VoicePracticeScreen
// Add this to your existing VoicePracticeScreen.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Bug } from 'lucide-react';
import VoiceTestingTools from '../debug/VoiceTestingTools'; // Add this import

const VoicePracticeScreen = () => {
  // Your existing state and logic...
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  
  // Add debug data state for testing tools
  const [debugData, setDebugData] = useState({
    speechRecognition: { status: 'idle', transcript: '', confidence: 0 },
    voiceOutput: { status: 'idle', currentText: '', voiceId: '' },
    apiCalls: [],
    performance: { latency: 0, tokenUsage: 0, memoryUsage: 0 },
    errors: []
  });

  // Update debug data function
  const updateDebugData = useCallback((section, data) => {
    setDebugData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  // Enhanced speech recognition with debug logging
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      updateDebugData('speechRecognition', { 
        status: 'error', 
        error: 'Speech recognition not supported' 
      });
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      updateDebugData('speechRecognition', { status: 'active' });
    };
    
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      updateDebugData('speechRecognition', { 
        transcript, 
        confidence 
      });
      
      if (result.isFinal) {
        // Handle final transcript
        handleUserInput(transcript);
      }
    };
    
    recognition.onerror = (error) => {
      updateDebugData('speechRecognition', { 
        status: 'error', 
        error: error.error 
      });
    };
    
    recognition.onend = () => {
      updateDebugData('speechRecognition', { status: 'idle' });
    };
    
    recognition.start();
    setIsListening(true);
  }, [updateDebugData]);

  // Enhanced voice output with debug logging
  const playAIResponse = useCallback(async (text) => {
    try {
      updateDebugData('voiceOutput', { status: 'testing' });
      
      if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
        const voiceId = voiceGender === 'female' ? 'XB0fDUnXU5powFXDhCwa' : 'N2lVS1w4EtoT3dr4eOWO';
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onplay = () => {
            updateDebugData('voiceOutput', { 
              status: 'playing', 
              currentText: text,
              voiceId: voiceId
            });
            setIsAISpeaking(true);
          };
          
          audio.onended = () => {
            updateDebugData('voiceOutput', { status: 'idle' });
            setIsAISpeaking(false);
          };
          
          await audio.play();
        } else {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
      } else {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
          updateDebugData('voiceOutput', { 
            status: 'playing', 
            currentText: text,
            voiceId: 'browser-tts'
          });
          setIsAISpeaking(true);
        };
        utterance.onend = () => {
          updateDebugData('voiceOutput', { status: 'idle' });
          setIsAISpeaking(false);
        };
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      updateDebugData('voiceOutput', { 
        status: 'error', 
        error: error.message 
      });
      setIsAISpeaking(false);
    }
  }, [voiceGender, updateDebugData]);

  // Enhanced API call with debug logging
  const makeAPICall = useCallback(async (endpoint, method = 'GET', data = null) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const apiCall = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        status: response.ok ? 'success' : 'error',
        latency,
        statusCode: response.status
      };
      
      setDebugData(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls.slice(-9), apiCall]
      }));
      
      return response;
      
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const apiCall = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        status: 'error',
        latency,
        error: error.message
      };
      
      setDebugData(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls.slice(-9), apiCall]
      }));
      
      throw error;
    }
  }, []);

  // Your existing component logic...
  const handleUserInput = async (transcript) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: transcript,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Make API call to get AI response
    try {
      const response = await makeAPICall('/api/voice/conversation', 'POST', {
        message: transcript,
        conversationHistory: messages
      });
      
      const aiResponse = await response.json();
      
      // Add AI message
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: aiResponse.text,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Play AI response
      await playAIResponse(aiResponse.text);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      updateDebugData('errors', { 
        message: error.message, 
        timestamp: new Date().toISOString() 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Your existing UI components */}
      
      {/* Voice Practice Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Voice Practice</h1>
          <p className="text-xl text-gray-300">Practice your social skills with AI</p>
        </div>
        
        {/* Messages */}
        <div className="max-w-2xl mx-auto mb-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 ml-8'
                  : 'bg-gray-700 mr-8'
              }`}
            >
              <div className="font-medium mb-2">
                {message.role === 'user' ? 'You' : 'AI Coach'}
              </div>
              <div>{message.text}</div>
            </div>
          ))}
        </div>
        
        {/* Microphone Button */}
        <div className="text-center">
          <button
            onClick={() => setIsListening(!isListening)}
            disabled={isAISpeaking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-emerald-500 hover:bg-emerald-600 animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
            } ${isAISpeaking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <MicOff className="w-8 h-8 text-white" />
            )}
          </button>
          
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping" />
          )}
        </div>
      </div>
      
      {/* Voice Testing Tools - Only in Development */}
      <VoiceTestingTools 
        isDevelopment={import.meta.env.DEV}
        debugData={debugData}
        onVoiceTest={(result) => {
          console.log('Voice test result:', result);
          // Handle voice test results
        }}
        onConversationTest={(result) => {
          console.log('Conversation test result:', result);
          // Handle conversation test results
        }}
        onPerformanceTest={(result) => {
          console.log('Performance test result:', result);
          // Handle performance test results
        }}
      />
    </div>
  );
};

export default VoicePracticeScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, Settings, AlertCircle } from 'lucide-react';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';

/**
 * VoiceChat Component - Complete voice conversation interface with ElevenLabs integration
 * 
 * Features:
 * - Enhanced Speech-to-Text input
 * - Premium ElevenLabs Text-to-Speech output
 * - Conversation history
 * - Visual feedback
 * - Error handling
 * - Accessibility support
 * - Mobile-friendly design
 */
const VoiceChat = ({
  onUserMessage,
  onSystemMessage,
  initialMessage = "Hi! I'm your social skills coach. What's your name?",
  gradeLevel = '6',
  className = ''
}) => {
  // State management
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    useElevenLabs: true,
    autoPlay: true,
    volume: 1.0
  });
  const [voiceGender, setVoiceGender] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
    return userData.voicePreference || 'female';
  });

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized && initialMessage) {
      addMessage('system', initialMessage);
      setIsInitialized(true);
    }
  }, [initialMessage, isInitialized]);

  // Add message to conversation
  const addMessage = useCallback((type, content, timestamp = new Date()) => {
    const message = {
      id: Date.now() + Math.random(),
      type, // 'user', 'system', 'ai'
      content,
      timestamp
    };
    
    setConversation(prev => [...prev, message]);
    
    // Scroll to bottom
    setTimeout(() => {
      const chatContainer = document.getElementById('voice-chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }, []);

  // Handle user transcript
  const handleTranscript = useCallback((transcript) => {
    setCurrentTranscript(transcript);
    
    if (transcript.trim()) {
      addMessage('user', transcript);
      
      // Call parent callback
      if (onUserMessage) {
        onUserMessage(transcript);
      }
    }
  }, [addMessage, onUserMessage]);

  // Handle speech recognition error
  const handleSpeechError = useCallback((error, message) => {
    setError(message);
    console.error('Speech recognition error:', error);
  }, []);

  // Handle speech synthesis start
  const handleSpeechStart = useCallback(() => {
    setIsSpeaking(true);
  }, []);

  // Handle speech synthesis end
  const handleSpeechEnd = useCallback(() => {
    setIsSpeaking(false);
  }, []);

  // Handle speech synthesis error
  const handleSpeechSynthesisError = useCallback((error, message) => {
    setError(message);
    console.error('Speech synthesis error:', error);
  }, []);

  // Send system message
  const sendSystemMessage = useCallback((message) => {
    addMessage('system', message);
    
    if (onSystemMessage) {
      onSystemMessage(message);
    }
  }, [addMessage, onSystemMessage]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setConversation([]);
    setCurrentTranscript('');
    setError(null);
    
    // Restart with initial message
    if (initialMessage) {
      addMessage('system', initialMessage);
    }
  }, [initialMessage, addMessage]);

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message icon
  const getMessageIcon = (type) => {
    switch (type) {
      case 'user':
        return <Mic className="w-4 h-4 text-blue-400" />;
      case 'system':
      case 'ai':
        return <MessageCircle className="w-4 h-4 text-green-400" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get message styling
  const getMessageStyle = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-100';
      case 'system':
      case 'ai':
        return 'bg-green-500/20 border-green-500/30 text-green-100';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-100';
    }
  };

  // Update voice settings
  const updateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className={`voice-chat ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-t-lg border border-gray-700 border-b-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium">Voice Practice</h3>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-1 ${isListening ? 'text-blue-400' : 'text-gray-400'}`}>
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Listening' : 'Ready'}</span>
            </div>
            <div className={`flex items-center gap-1 ${isSpeaking ? 'text-green-400' : 'text-gray-400'}`}>
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Speaking' : 'Silent'}</span>
            </div>
            {voiceSettings.useElevenLabs && (
              <div className="flex items-center gap-1 text-blue-400">
                <span className="text-xs bg-blue-900/20 px-2 py-0.5 rounded">ElevenLabs</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Voice settings"
            title="Voice settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Button */}
          <button
            onClick={clearConversation}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-900/50 border border-gray-700 border-t-0 border-b-0">
          <h3 className="text-sm font-medium text-white mb-3">Voice Chat Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Provider */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Voice Provider</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateVoiceSettings({ useElevenLabs: true })}
                  className={`px-3 py-1 text-xs rounded ${
                    voiceSettings.useElevenLabs 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  ElevenLabs
                </button>
                <button
                  onClick={() => updateVoiceSettings({ useElevenLabs: false })}
                  className={`px-3 py-1 text-xs rounded ${
                    !voiceSettings.useElevenLabs 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Web Speech
                </button>
              </div>
            </div>

            {/* Auto Play */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={voiceSettings.autoPlay}
                  onChange={(e) => updateVoiceSettings({ autoPlay: e.target.checked })}
                  className="rounded"
                />
                Auto-play responses
              </label>
            </div>
          </div>

          {/* Grade Level Info */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Grade Level: {gradeLevel}</p>
            <p>Voice Provider: {voiceSettings.useElevenLabs ? 'ElevenLabs Premium' : 'Web Speech API'}</p>
            <p>Auto-play: {voiceSettings.autoPlay ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div 
        id="voice-chat-container"
        className="h-96 overflow-y-auto p-4 bg-gray-900/50 border border-gray-700 border-t-0 border-b-0"
      >
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>Start a conversation by speaking or typing</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getMessageStyle(message.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium capitalize">
                      {message.type === 'system' ? 'Coach' : message.type}
                    </span>
                    <span className="text-xs opacity-60">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Input */}
      <div className="p-4 bg-gray-800/50 rounded-b-lg border border-gray-700 border-t-0">
        <VoiceInput
          onTranscript={handleTranscript}
          onError={handleSpeechError}
          isListening={isListening}
          setIsListening={setIsListening}
          gradeLevel={gradeLevel}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-red-400" />
            <span className="text-red-200 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice Output for System Messages */}
      {conversation.length > 0 && (
        <VoiceOutput
          text={conversation[conversation.length - 1]?.type === 'system' ? conversation[conversation.length - 1]?.content : ''}
          voiceGender={voiceGender}
          onStart={handleSpeechStart}
          onEnd={handleSpeechEnd}
          onError={handleSpeechSynthesisError}
          gradeLevel={gradeLevel}
          autoPlay={voiceSettings.autoPlay}
          className="mt-4"
        />
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-1">💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Speak clearly and at a normal pace</li>
          <li>Wait for the coach to finish speaking before responding</li>
          <li>Use the microphone button or press Space to start/stop listening</li>
          <li>Practice makes perfect - don't worry about mistakes!</li>
          {voiceSettings.useElevenLabs && (
            <li>Enjoy premium ElevenLabs voices for natural conversation</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default VoiceChat;
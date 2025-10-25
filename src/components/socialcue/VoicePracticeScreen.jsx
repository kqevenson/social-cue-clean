import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  RotateCcw, 
  Settings, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageCircle,
  User,
  Bot
} from 'lucide-react';
import { VoiceInput, VoiceOutput } from '../voice';
import useVoiceConversation from '../../hooks/useVoiceConversation';

const VoicePracticeScreen = ({ 
  scenario, 
  gradeLevel = '6', 
  onComplete,
  onExit,
  voiceGender = 'female'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [currentPlayingText, setCurrentPlayingText] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [autoMicEnabled, setAutoMicEnabled] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
    return userData.voiceSettings?.autoMic !== false; // Default to true
  });

  // Sync auto-mic setting with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      const newAutoMic = userData.voiceSettings?.autoMic !== false;
      if (newAutoMic !== autoMicEnabled) {
        setAutoMicEnabled(newAutoMic);
        console.log('🔄 Auto-mic setting updated:', newAutoMic);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [autoMicEnabled]);
  
  const messagesEndRef = useRef(null);
  const conversationRef = useRef(null);
  
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
    backendStatus,
    error
  } = useVoiceConversation({ 
    scenario, 
    gradeLevel, 
    onComplete: handleConversationComplete 
  });

  // Update message audio played status
  const updateMessageAudioPlayed = useCallback((messageId) => {
    // This function tracks which messages have been played
    // For now, we'll just log it since we don't have message state management
    console.log('Audio played for message:', messageId);
  }, []);

  // Auto-start microphone when conversation begins
  useEffect(() => {
    if (!isInitializing && messages.length > 0 && !isAISpeaking && !isAIThinking && autoMicEnabled) {
      console.log('🎤 Auto-starting microphone at conversation start');
      setIsListening(true);
    }
  }, [isInitializing, messages.length, isAISpeaking, isAIThinking, autoMicEnabled, setIsListening]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation on mount - FIXED: Prevent infinite loop
  useEffect(() => {
    let isMounted = true;
    
    const initializeConversation = async () => {
      try {
        setIsInitializing(true);
        if (isMounted) {
          await startConversation();
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        if (isMounted) {
          setErrorMessage('Failed to start conversation. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeConversation();
    
    return () => {
      isMounted = false;
    };
  }, []); // FIXED: Empty dependency array to run only once

  // Handle conversation completion
  function handleConversationComplete(finalPerformance) {
    console.log('Conversation completed:', finalPerformance);
    if (onComplete) {
      onComplete({
        ...finalPerformance,
        scenario: scenario,
        gradeLevel: gradeLevel,
        conversationType: 'voice'
      });
    }
  }

  // Handle user speech input
  const handleUserSpeech = useCallback(async (transcript) => {
    if (!transcript.trim()) return;
    
    try {
      setErrorMessage('');
      await sendUserMessage(transcript);
    } catch (error) {
      console.error('Error sending user message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    }
  }, [sendUserMessage]);

  // Handle speech recognition errors
  const handleSpeechError = useCallback((error) => {
    console.error('Speech recognition error:', error);
    
    let message = 'Voice input error. ';
    if (error.message.includes('permission')) {
      message += 'Please allow microphone access.';
    } else if (error.message.includes('not supported')) {
      message += 'Voice input not supported in this browser.';
    } else {
      message += 'Please try again.';
    }
    
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  }, []);

  // Handle AI message playback
  const handlePlayMessage = useCallback((messageId, text) => {
    if (!audioEnabled) return;
    
    console.log('🎤 Playing message:', messageId, text.substring(0, 50) + '...');
    console.log('📝 Full message text length:', text.length);
    console.log('🎵 Setting currentPlayingText to:', text.substring(0, 100) + '...');
    
    // Set the current playing message
    setPlayingMessageId(messageId);
    setCurrentPlayingText(text);
    
    // Mark message as played
    updateMessageAudioPlayed(messageId);
  }, [audioEnabled, updateMessageAudioPlayed]);

  // Handle AI audio start
  const handleAIAudioStart = useCallback(() => {
    console.log('🔊 AI started speaking');
    setIsAISpeaking(true);
    
    // Turn off mic while AI is speaking
    setIsListening(false);
  }, [setIsListening]);

  // Handle AI audio completion with auto-mic restart
  const handleAIAudioComplete = useCallback((messageId) => {
    console.log('✅ AI finished speaking');
    setIsAISpeaking(false);
    
    // Mark message as played
    updateMessageAudioPlayed(messageId);
    
    // Auto-restart mic if enabled
    if (autoMicEnabled) {
      setTimeout(() => {
        console.log('🎤 Auto-restarting microphone');
        setIsListening(true);
      }, 1000); // 1 second delay so user isn't startled
    } else {
      console.log('🎤 Auto-mic disabled, waiting for manual activation');
    }
  }, [autoMicEnabled, setIsListening, updateMessageAudioPlayed]);

  // Handle AI audio error
  const handleAIAudioError = useCallback((error) => {
    console.error('🎵 Audio error for message:', playingMessageId, error);
    setIsAISpeaking(false);
    setPlayingMessageId(null);
    setCurrentPlayingText('');
    
    // Still restart mic even on error if auto-mic is enabled
    if (autoMicEnabled) {
      setTimeout(() => {
        console.log('🎤 Auto-restarting microphone after error');
        setIsListening(true);
      }, 1000);
    }
  }, [autoMicEnabled, setIsListening, playingMessageId]);

  // Handle exit confirmation
  const handleExit = useCallback(() => {
    if (messages.length > 1) {
      setShowExitConfirm(true);
    } else {
      confirmExit();
    }
  }, [messages.length]);

  const confirmExit = useCallback(() => {
    endConversation();
    if (onExit) onExit();
  }, [endConversation, onExit]);

  // Phase indicators
  const getPhaseInfo = (phase) => {
    const phases = {
      intro: { label: 'Introduction', color: 'bg-blue-500', icon: MessageCircle },
      practice: { label: 'Practice', color: 'bg-green-500', icon: Mic },
      feedback: { label: 'Feedback', color: 'bg-yellow-500', icon: CheckCircle },
      complete: { label: 'Complete', color: 'bg-purple-500', icon: CheckCircle }
    };
    return phases[phase] || phases.practice;
  };

  const phaseInfo = getPhaseInfo(currentPhase);
  const PhaseIcon = phaseInfo.icon;

  // Render message component
  const renderMessage = (message, index) => {
    const isAI = message.role === 'ai';
    const isPlaying = playingMessageId === message.id;
    
    return (
      <div
        key={message.id}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}
      >
        <div className={`flex max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAI ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
          </div>
          
          {/* Message content */}
          <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
            <div className={`px-4 py-3 rounded-2xl ${
              isAI 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              
              {/* AI message controls */}
              {isAI && audioEnabled && (
                <button
                  onClick={() => handlePlayMessage(message.id, message.text)}
                  className="mt-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              )}
            </div>
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-400" />
          <p className="text-lg">Starting voice practice...</p>
          <p className="text-sm text-gray-400 mt-2">Preparing conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Status Indicator */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
        {isAISpeaking && (
          <div className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded-full flex items-center gap-2 animate-pulse">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-blue-400 rounded animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-400 rounded animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-blue-400 rounded animate-pulse delay-150"></div>
            </div>
            <span className="text-sm text-blue-200">AI is speaking...</span>
          </div>
        )}
        
        {isListening && !isAISpeaking && (
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-sm text-emerald-200">Listening... speak now</span>
          </div>
        )}
        
        {isAIThinking && (
          <div className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-sm text-purple-200">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${phaseInfo.color}`} />
          <div>
            <h1 className="text-lg font-bold">Voice Practice</h1>
            <p className="text-sm text-gray-400">{scenario?.title || 'Social Skills'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleExit}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Audio Test Button */}
      <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-200 font-medium">🔊 Audio Test</p>
            <p className="text-yellow-300/80 text-sm">
              Click to test if your browser can play audio
            </p>
          </div>
          <button
            onClick={() => {
              console.log('🧪 Testing browser audio capability...');
              const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiSL0e/Um0UMFl646Oma5hIGHI7b8b+YQwoWa7ns6pVXGAlHo+ryvXApBSKM1PDUnUYKE2G56+qdSg0FJZXh8MqJOg0RYL3s7KFXGQhGnerzvXQmBiV/zPLZjkgJE2S55OudWRIIRpzm7qxNEQwfYMHy47BIEgUjgM/03JRECSFs0PPZj0YLE2m+7+eZTRENDmK76/LZKS0FHH/L8Oaoa0AAAE2m5vC2djwFGnfE8OufQwgRX7Dm7qhVEgxDl+v0tGoiByVzyO/smk0LDV626OyqWBMEPpja8cWhQgwUYqLi8K5xOQYKhcn19pJFCw8ZZL3v7LFaFw0JQKTW8Lx6MgYJf8ny3I1JDRBft+jtsGkfBxljvO/wpmQVDw9hvOzyrXEiBgpmvvHnl0QLDFei5e+yanIeBxhUveHwrGscCQ5fqefnsWonCA1VoOPzu2EiBxJgp+XstGUYDAlbneXvsGUZDRBfp+TstWIaCQ9hn+LwsGQcDBdjo+PvsVwXDQ9eoeHvr2McBxhjqOfurVYWEA9gnN3wrFEXBhJeo9PwrFEXBhJfpNTwr1EXBhNfo9PwrFEXBhJfpNTwsE8VBhNfpdbwr1EXBhJepNPwr1AXBRVVZK3ur1kVBhJfpNPwr1EXBQ==');
              testAudio.volume = 1.0;
              testAudio.play()
                .then(() => {
                  console.log('✅ Test audio played successfully - browser audio works!');
                  alert('✅ Audio test successful! Your browser can play audio.');
                })
                .catch(err => {
                  console.error('❌ Test audio failed:', err);
                  alert(`❌ Audio test failed: ${err.message}\n\nThis means your browser is blocking audio. Please:\n1. Check browser address bar for 🔊 icon\n2. Click it and allow audio\n3. Refresh the page`);
                });
            }}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
          >
            🔊 Test Audio
          </button>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <PhaseIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{phaseInfo.label}</span>
          {performance.totalTurns > 0 && (
            <span className="text-xs text-gray-400 ml-auto">
              {performance.totalTurns} exchanges
            </span>
          )}
        </div>
        
        {/* Backend Status Indicator */}
        {backendStatus === 'offline' && (
          <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-yellow-200">
                🤖 Using practice mode (backend offline). Your practice will still work great!
              </span>
            </div>
          </div>
        )}
        
        {backendStatus === 'online' && (
          <div className="mt-2 p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-xs text-emerald-200">
                ✅ Connected to AI coach
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Starting conversation...</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        
        {/* AI thinking indicator */}
        {isAIThinking && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {errorMessage && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/20 border border-red-500/50 px-4 py-3 rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-200">{errorMessage}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice controls */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center space-x-4">
          {/* Microphone button */}
          <div className="relative">
            <button
              onClick={() => setIsListening(!isListening)}
              disabled={isAIThinking || isAISpeaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-emerald-500 hover:bg-emerald-600 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
              } ${(isAIThinking || isAISpeaking) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-white" />
              )}
            </button>
            
            {/* Listening indicator */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping" />
            )}
            
            {/* Auto-mic indicator */}
            {autoMicEnabled && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-emerald-400 bg-black/50 px-2 py-1 rounded">
                  Auto-mic
                </span>
              </div>
            )}
          </div>
          
          {/* End practice button */}
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">End Practice</span>
          </button>
        </div>
        
        {/* Status text */}
        <div className="text-center mt-3">
          <p className="text-sm text-gray-400">
            {isListening ? 'Listening... Speak now' : 
             isAIThinking ? 'AI is responding...' : 
             'Tap microphone to speak'}
          </p>
        </div>
      </div>

      {/* Voice Input Component */}
      <VoiceInput
        onTranscript={handleUserSpeech}
        onError={handleSpeechError}
        isListening={isListening}
        setIsListening={setIsListening}
        gradeLevel={gradeLevel}
        className="hidden" // Hidden since we have our own UI
      />

      {/* Voice Output Component */}
      <VoiceOutput
        text={currentPlayingText}
        voiceGender={voiceGender}
        autoPlay={true}
        onComplete={() => {
          console.log('🎵 Audio completed for message:', playingMessageId);
          handleAIAudioComplete(playingMessageId);
        }}
        onStart={() => {
          console.log('🎵 Audio started for message:', playingMessageId);
          handleAIAudioStart();
        }}
        onError={(error) => {
          console.error('🎵 Audio error for message:', playingMessageId, error);
          handleAIAudioError(error);
        }}
        className="hidden" // Hidden since we have our own UI
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Audio Output</label>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    audioEnabled ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {audioEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Voice Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">{voiceSpeed}x</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Voice Practice Help</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <strong>How to use:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Tap the microphone to start speaking</li>
                  <li>Speak clearly and at normal volume</li>
                  <li>Wait for AI response before speaking again</li>
                  <li>Tap the speaker icon to replay AI messages</li>
                </ul>
              </div>
              
              <div>
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Speak in complete sentences</li>
                  <li>Take your time - there's no rush</li>
                  <li>Be honest about your thoughts and feelings</li>
                  <li>Ask questions if you need clarification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 max-w-[90vw]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-bold mb-2">End Practice Session?</h3>
              <p className="text-gray-300 mb-6">
                You've made progress in this conversation. Are you sure you want to end the practice session?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePracticeScreen;

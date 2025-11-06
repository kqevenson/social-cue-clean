import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Mic, MicOff, Volume2, Loader, CheckCircle, Sparkles, Settings, User, UserCheck } from 'lucide-react';
import { generateMockResponse } from '../utils/mockVoiceConversation';
import { speakWithElevenLabs, selectVoiceForGrade } from '../services/elevenLabsService';
import { getUserData } from '../components/socialcue/utils/storage';

/**
 * VoicePracticeChatScreen - Main voice chatbot interface
 * 
 * Students interact with AI through voice conversations.
 * Features:
 * - Voice input (Web Speech API)
 * - Voice output (Text-to-Speech)
 * - Conversation phases (intro, practice, feedback, complete)
 * - Mock conversation engine (MVP)
 * 
 * @param {Object} props - Component props
 * @param {Object} props.scenario - Scenario data
 * @param {string} props.gradeLevel - User's grade level
 * @param {string} props.userId - User ID
 * @param {Function} props.onComplete - Callback when practice completes
 * @param {Function} props.onExit - Callback when user exits
 */
function VoicePracticeChatScreen({
  scenario,
  gradeLevel = '6-8',
  userId,
  onComplete,
  onExit
}) {
  // State
  const [messages, setMessages] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [voicePreference, setVoicePreference] = useState(() => {
    const userData = getUserData();
    return userData?.voicePreference || 'female';
  });
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  // Audio control ref
  const audioControlRef = useRef(null);

  // Refs
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const phaseStartTimeRef = useRef(Date.now());
  const handleUserMessageRef = useRef(null);

  // Normalize grade level
  const normalizedGrade = useMemo(() => {
    const grade = parseInt(gradeLevel) || 6;
    if (grade <= 2) return 'k2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }, [gradeLevel]);

  // Initialize scenario with safe defaults
  const scenarioData = useMemo(() => {
    if (!scenario) {
      return {
        id: 'default',
        title: 'Voice Practice',
        setupPrompt: "Hi! Let's practice together!"
      };
    }
    
    // Safely extract title - handle both string and object formats
    let title = 'Voice Practice';
    if (typeof scenario.title === 'string') {
      title = scenario.title;
    } else if (scenario.title && typeof scenario.title === 'object') {
      // If title is an object with grade keys, use the appropriate one
      title = scenario.title[normalizedGrade] || scenario.title['6-8'] || Object.values(scenario.title)[0] || 'Voice Practice';
    }
    
    // Safely extract setupPrompt
    let setupPrompt = "Hi! Let's practice together!";
    if (typeof scenario.setupPrompt === 'string') {
      setupPrompt = scenario.setupPrompt;
    } else if (scenario.setupPrompt && typeof scenario.setupPrompt === 'object') {
      setupPrompt = scenario.setupPrompt[normalizedGrade] || scenario.setupPrompt['6-8'] || Object.values(scenario.setupPrompt)[0] || setupPrompt;
    }
    
    return {
      id: scenario.id || 'default',
      title: String(title),
      setupPrompt: String(setupPrompt),
      category: scenario.category || 'general',
      difficulty: scenario.difficulty || 'beginner',
    };
  }, [scenario, normalizedGrade]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing audio
      if (audioControlRef.current) {
        audioControlRef.current.stop();
      }
      
      // Stop browser TTS if fallback was used
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // Stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map(result => result[0]?.transcript || '')
        .join('');
      
      setTranscript(interimTranscript);

      if (event.results[0]?.isFinal) {
        const finalTranscript = event.results[0][0]?.transcript || '';
        if (finalTranscript && handleUserMessageRef.current) {
          handleUserMessageRef.current(finalTranscript);
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else {
        setError('Speech recognition error. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isAISpeaking) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Could not start microphone. Please check permissions.');
    }
  }, [isListening, isAISpeaking]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  /**
   * Toggle listening (for button)
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Handle user message
   */
  const handleUserMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;

    setTranscript('');
    setIsListening(false);
    setIsGeneratingResponse(true);

    // Stop any ongoing audio
    if (audioControlRef.current) {
      audioControlRef.current.stop();
    }

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: String(userText).trim(),
      timestamp: new Date(),
      phase: currentPhase
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      conversationHistoryRef.current = [...conversationHistoryRef.current, userMessage];
      return updated;
    });

    // Increment exchange count
    const newExchangeCount = exchangeCount + 1;
    setExchangeCount(newExchangeCount);

    // Generate AI response using mock engine
    const aiResponse = generateMockResponse({
      userMessage: String(userText).trim(),
      scenarioId: scenarioData.id || 'default',
      gradeLevel: normalizedGrade,
      phase: currentPhase,
      exchangeCount: newExchangeCount,
      conversationHistory: conversationHistoryRef.current
    });

    // Ensure aiResponse.text is a string
    const aiResponseText = typeof aiResponse.text === 'string' ? aiResponse.text : String(aiResponse.text || '');

    // Add AI message
    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'ai',
      text: aiResponseText,
      timestamp: new Date(),
      phase: aiResponse.phase || 'practice'
    };

    setMessages(prev => {
      const finalMessages = [...prev, aiMessage];
      conversationHistoryRef.current = [...conversationHistoryRef.current, aiMessage];
      return finalMessages;
    });

    // Update phase
    if (aiResponse.phase && aiResponse.phase !== currentPhase) {
      setCurrentPhase(aiResponse.phase);
      
      if (aiResponse.phase === 'complete') {
        // Calculate points
        const points = calculatePoints(newExchangeCount);
        setPointsEarned(points);
        
        // Call completion callback after delay
        setTimeout(() => {
          if (onComplete) {
            setMessages(prev => {
              onComplete({
                exchangeCount: newExchangeCount,
                pointsEarned: points,
                duration: Date.now() - phaseStartTimeRef.current,
                messages: prev
              });
              return prev;
            });
          }
        }, 3000);
      }
    }

    setIsGeneratingResponse(false);

    // Speak AI response using ElevenLabs
    setIsGeneratingVoice(true);
    try {
      audioControlRef.current = await speakWithElevenLabs(aiResponseText, {
        gradeLevel: normalizedGrade,
        preference: voicePreference,
        onGenerating: () => {
          setIsGeneratingVoice(true);
        },
        onStart: () => {
          setIsGeneratingVoice(false);
          setIsAISpeaking(true);
        },
        onComplete: () => {
          setIsAISpeaking(false);
          
          // Re-enable mic if not complete
          if (aiResponse.phase !== 'complete' && aiResponse.shouldContinue !== false) {
            setTimeout(() => {
              if (!isAISpeaking && !isGeneratingResponse) {
                startListening();
              }
            }, 500);
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsGeneratingVoice(false);
          setIsAISpeaking(false);
          // Fallback handled automatically
        },
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsGeneratingVoice(false);
      setIsAISpeaking(false);
    }
  }, [currentPhase, exchangeCount, normalizedGrade, scenarioData, onComplete, isAISpeaking, isGeneratingResponse, voicePreference, startListening]);

  // Store handleUserMessage in ref for speech recognition callback
  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage;
  }, [handleUserMessage]);

  // Start conversation
  useEffect(() => {
    if (!sessionStarted && scenarioData?.setupPrompt) {
      const start = async () => {
        setSessionStarted(true);
        setCurrentPhase('intro');
        phaseStartTimeRef.current = Date.now();
        
        // Add intro message
        const introMessage = {
          id: `msg_${Date.now()}`,
          role: 'ai',
          text: String(scenarioData.setupPrompt),
          timestamp: new Date(),
          phase: 'intro'
        };

        setMessages([introMessage]);
        conversationHistoryRef.current = [introMessage];
        
        // Speak intro message using ElevenLabs
        setIsGeneratingVoice(true);
        try {
          audioControlRef.current = await speakWithElevenLabs(introMessage.text, {
            gradeLevel: normalizedGrade,
            preference: voicePreference,
            onStart: () => {
              setIsGeneratingVoice(false);
              setIsAISpeaking(true);
            },
            onComplete: () => {
              setIsAISpeaking(false);
              setCurrentPhase('practice');
              setTimeout(() => {
                if (recognitionRef.current && !isListening) {
                  try {
                    recognitionRef.current.start();
                    setIsListening(true);
                  } catch (e) {
                    console.error('Could not start listening:', e);
                  }
                }
              }, 500);
            },
            onError: (error) => {
              console.error('ElevenLabs TTS error:', error);
              setIsGeneratingVoice(false);
              setIsAISpeaking(false);
              setError('Voice generation failed. Using fallback.');
              // Fallback handled automatically by service
            },
          });
        } catch (error) {
          console.error('Failed to start speech:', error);
          setIsGeneratingVoice(false);
          setIsAISpeaking(false);
          setError('Could not start voice. Please try again.');
        }
      };
      
      start();
    }
  }, [scenarioData?.setupPrompt, sessionStarted, normalizedGrade, isListening, voicePreference]);

  /**
   * Toggle voice preference
   */
  const toggleVoicePreference = useCallback(() => {
    const newPreference = voicePreference === 'female' ? 'male' : 'female';
    setVoicePreference(newPreference);
    
    // Save preference
    const userData = getUserData();
    if (userData) {
      userData.voicePreference = newPreference;
      localStorage.setItem('socialCueUserData', JSON.stringify(userData));
    }
    
    // Stop current audio
    if (audioControlRef.current) {
      audioControlRef.current.stop();
    }
  }, [voicePreference]);

  /**
   * Calculate points earned
   */
  const calculatePoints = useCallback((exchanges) => {
    const basePoints = exchanges * 10;
    const completionBonus = 20;
    return basePoints + completionBonus;
  }, []);

  /**
   * Handle exit
   */
  const handleExit = useCallback(() => {
    // Stop any ongoing audio
    if (audioControlRef.current) {
      audioControlRef.current.stop();
    }
    
    // Stop browser TTS if fallback was used
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    // Stop recognition
    stopListening();

    if (onExit) {
      onExit();
    }
  }, [onExit, stopListening]);

  /**
   * Get phase label
   */
  const getPhaseLabel = () => {
    const labels = {
      intro: 'Getting Started',
      practice: 'Practice',
      feedback: 'Feedback',
      complete: 'Complete'
    };
    return labels[currentPhase] || 'Practice';
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg truncate">{String(scenarioData.title || 'Voice Practice')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-white/80">{getPhaseLabel()}</span>
            {exchangeCount > 0 && (
              <span className="text-xs text-white/60">• {exchangeCount} exchanges</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Selector */}
          <button
            onClick={toggleVoicePreference}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
            aria-label={`Switch to ${voicePreference === 'female' ? 'male' : 'female'} voice`}
            title={`Current: ${voicePreference === 'female' ? 'Female' : 'Male'} voice`}
          >
            {voicePreference === 'female' ? (
              <span className="text-xl">👩‍🏫</span>
            ) : (
              <span className="text-xl">👨‍🏫</span>
            )}
          </button>
          <button
            onClick={handleExit}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative z-10 bg-gray-900/50 border-b border-white/10 px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          {isGeneratingVoice && (
            <div className="flex items-center gap-2 text-purple-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating voice...</span>
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Listening...</span>
            </div>
          )}
          {isGeneratingResponse && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating response...</span>
            </div>
          )}
          {isAISpeaking && !isListening && !isGeneratingResponse && (
            <div className="flex items-center gap-2 text-blue-400">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-sm">AI is speaking...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 relative z-10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">Starting conversation...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white'
                      : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <p className="leading-relaxed">{String(message.text || '')}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp && typeof message.timestamp === 'object' && message.timestamp instanceof Date
                      ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : message.timestamp
                      ? String(message.timestamp)
                      : ''}
                  </p>
                </div>
              </div>
            ))}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] p-4 rounded-2xl bg-blue-500/50 text-white">
                  <p className="leading-relaxed italic">{String(transcript || '')}</p>
                  <p className="text-xs opacity-60 mt-2">Listening...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Completion Screen */}
      {currentPhase === 'complete' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Great Job!</h2>
            <p className="text-gray-300 mb-6">
              You completed {exchangeCount} exchanges and earned {pointsEarned} points!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExit}
                className="flex-1 px-6 py-3 rounded-full font-semibold bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={(e) => {
            e.preventDefault();
            startListening();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopListening();
          }}
          onClick={toggleListening}
          disabled={isAISpeaking || isGeneratingResponse || currentPhase === 'complete'}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-emerald-500 animate-pulse scale-110 shadow-lg shadow-emerald-500/50'
              : isAISpeaking || isGeneratingResponse || currentPhase === 'complete'
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-emerald-400 hover:scale-105 shadow-lg'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <Mic className="w-10 h-10 text-white" />
          ) : (
            <MicOff className="w-10 h-10 text-white" />
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          {isAISpeaking || isGeneratingResponse 
            ? 'AI is speaking...' 
            : isListening 
            ? 'Listening... Release to send' 
            : currentPhase === 'complete'
            ? 'Session complete'
            : 'Hold to speak'}
        </p>
      </div>
    </div>
  );
}

export default VoicePracticeChatScreen;


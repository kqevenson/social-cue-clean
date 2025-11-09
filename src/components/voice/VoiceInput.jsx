import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Loader2, Settings } from 'lucide-react';

/**
 * VoiceInput Component - Enhanced Speech-to-Text with ElevenLabs integration
 * 
 * Features:
 * - Web Speech API for real-time recognition
 * - ElevenLabs integration for improved accuracy (future)
 * - Visual feedback and animations
 * - Browser compatibility handling
 * - Graceful error handling
 * - Auto-stop after silence
 * - Accessibility support
 */
const VoiceInput = ({ 
  onTranscript, 
  onError, 
  isListening, 
  setIsListening,
  gradeLevel = '6',
  autoStopDelay = 3000,
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
  className = ''
}) => {
  // State management
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false); // Future feature
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastResultTimeRef = useRef(Date.now());
  const isListeningRef = useRef(false);

  // Configuration
  const config = {
    elevenlabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
      enabled: import.meta.env.VITE_USE_ELEVENLABS === 'true'
    }
  };

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          configureRecognition();
        } catch (err) {
          console.error('Error initializing speech recognition:', err);
          setError('Failed to initialize speech recognition');
          setIsSupported(false);
        }
      } else {
        setError('Speech recognition not supported in this browser');
        setIsSupported(false);
      }
    };

    checkSupport();
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore cleanup errors
        }
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onsoundstart = null;
        recognitionRef.current.onsoundend = null;
        recognitionRef.current.onnomatch = null;
        recognitionRef.current.onaudiostart = null;
        recognitionRef.current.onaudioend = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []); // FIXED: Added empty dependency array

  // Configure speech recognition settings
  const configureRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Basic configuration
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    
    // Language configuration based on grade level
    const languageMap = {
      'K': 'en-US',
      '1': 'en-US', 
      '2': 'en-US',
      '3': 'en-US',
      '4': 'en-US',
      '5': 'en-US',
      '6': 'en-US',
      '7': 'en-US',
      '8': 'en-US',
      '9': 'en-US',
      '10': 'en-US',
      '11': 'en-US',
      '12': 'en-US',
      'adult': 'en-US'
    };
    
    recognition.lang = languageMap[gradeLevel] || 'en-US';

    // Event handlers
    recognition.onstart = handleRecognitionStart;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    recognition.onspeechstart = handleSpeechStart;
    recognition.onspeechend = handleSpeechEnd;
    recognition.onsoundstart = handleSoundStart;
    recognition.onsoundend = handleSoundEnd;
    recognition.onnomatch = handleNoMatch;
    recognition.onaudiostart = handleAudioStart;
    recognition.onaudioend = handleAudioEnd;
  }, [continuous, interimResults, maxAlternatives, gradeLevel]);

  // Event handlers
  const handleRecognitionStart = () => {
    setIsListening(true);
    isListeningRef.current = true;
    setIsPaused(false);
    setError(null);
    lastResultTimeRef.current = Date.now();
  };

  const handleRecognitionResult = (event) => {
    const current = event.resultIndex;
    const transcriptResult = event.results[current];
    const transcriptText = transcriptResult[0].transcript;
    
    if (transcriptResult.isFinal) {
      setTranscript(prev => prev + ' ' + transcriptText);
      onTranscript?.(transcript + ' ' + transcriptText);
      lastResultTimeRef.current = Date.now();
      
      // Clear interim
      setInterimTranscript('');
      
      // Reset silence timer
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Auto-stop after 3 seconds of silence
      silenceTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListeningRef.current) {
          try {
            recognitionRef.current.stop();
            setIsListening(false);
            isListeningRef.current = false;
          } catch (err) {
            console.error('Error stopping recognition:', err);
          }
        }
      }, 3000);
      
    } else {
      // Show interim results
      setInterimTranscript(transcriptText);
    }
  };

  const handleRecognitionError = (event) => {
    let errorMessage = 'Speech recognition error';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not found or access denied.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone permission denied. Please allow microphone access.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted.';
        break;
      case 'language-not-supported':
        errorMessage = 'Language not supported.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Speech recognition service not allowed.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }
    
    setError(errorMessage);
    setIsListening(false);
    setIsPaused(false);
    
    if (onError) {
      onError(event.error, errorMessage);
    }
  };

  const handleRecognitionEnd = () => {
    // Only restart if still supposed to be listening
    if (isListening && isListeningRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error restarting recognition:', err);
        setIsListening(false);
        isListeningRef.current = false;
      }
    } else {
      setIsListening(false);
      isListeningRef.current = false;
      setIsPaused(false);
    }
    
    // Clear silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const handleSpeechStart = () => {
    lastResultTimeRef.current = Date.now();
    resetSilenceTimer();
  };

  const handleSpeechEnd = () => {
    // Start silence timer
    resetSilenceTimer();
  };

  const handleSoundStart = () => {
    lastResultTimeRef.current = Date.now();
  };

  const handleSoundEnd = () => {
    resetSilenceTimer();
  };

  const handleNoMatch = () => {
    setError('No speech detected. Please try speaking more clearly.');
  };

  const handleAudioStart = () => {
    // Audio capture started
  };

  const handleAudioEnd = () => {
    // Audio capture ended
  };

  // Main control functions - DEFINE stopListening FIRST
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Already stopped, ignore error
        console.log('Recognition already stopped');
      }
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    setIsListening(false);
    isListeningRef.current = false;
    setIsInitializing(false);
  }, [setIsListening]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    setIsInitializing(true);
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to start speech recognition');
      setIsInitializing(false);
    }
  }, [isSupported]);

  // Silence detection and auto-stop - NOW CAN USE stopListening
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    silenceTimeoutRef.current = setTimeout(() => {
      if (isListening && !isPaused) {
        stopListening();
      }
    }, autoStopDelay);
  }, [isListening, isPaused, autoStopDelay, stopListening]);

  const pauseListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsPaused(true);
      } catch (err) {
        console.error('Error pausing recognition:', err);
      }
    }
  }, [isListening]);

  const resumeListening = useCallback(() => {
    if (recognitionRef.current && isPaused) {
      try {
        recognitionRef.current.start();
        setIsPaused(false);
      } catch (err) {
        console.error('Error resuming recognition:', err);
      }
    }
  }, [isPaused]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Sync isListening prop with internal state - FIXED: Prevent infinite loop
  useEffect(() => {
    if (isListening !== isListeningRef.current) {
      if (isListening) {
        startListening();
      } else {
        stopListening();
      }
    }
  }, [isListening, startListening, stopListening]); // FIXED: Include dependencies but with guard

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Spacebar to start/stop (when not in input field)
      if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
      
      // Escape to stop
      if (event.code === 'Escape' && isListening) {
        event.preventDefault();
        stopListening();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, startListening, stopListening]);

  // Render error state
  if (!isSupported) {
    return (
      <div className={`voice-input-error ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-200 font-medium">Speech Recognition Not Supported</p>
            <p className="text-red-300/80 text-sm">
              Your browser doesn't support speech recognition. Please use Chrome, Safari, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-input ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        {/* Microphone Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isInitializing}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isInitializing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          title={isListening ? 'Stop listening (Space)' : 'Start listening (Space)'}
        >
          {isInitializing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Status Indicator */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className={`w-4 h-4 ${isListening ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
              {isInitializing ? 'Initializing...' : 
               isListening ? 'Listening...' : 
               isPaused ? 'Paused' : 
               'Ready to listen'}
            </span>
            {useElevenLabs && (
              <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
                ElevenLabs
              </span>
            )}
          </div>
          
          {/* Visual Waveform */}
          {isListening && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Clear Button */}
        {(transcript || interimTranscript) && (
          <button
            onClick={clearTranscript}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            aria-label="Clear transcript"
          >
            Clear
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Voice settings"
          title="Voice settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Voice Input Settings</h3>
          
          {/* Voice Provider */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Voice Provider</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseElevenLabs(false)}
                className={`px-3 py-1 text-xs rounded ${
                  !useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Web Speech API
              </button>
              <button
                onClick={() => setUseElevenLabs(true)}
                disabled={!config.elevenlabs.apiKey}
                className={`px-3 py-1 text-xs rounded ${
                  useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                } ${!config.elevenlabs.apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ElevenLabs (Coming Soon)
              </button>
            </div>
          </div>

          {/* Recognition Settings */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={continuous}
                onChange={() => {/* Toggle continuous */}}
                className="rounded"
                disabled
              />
              Continuous recognition
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={interimResults}
                onChange={() => {/* Toggle interim results */}}
                className="rounded"
                disabled
              />
              Show interim results
            </label>
          </div>

          {/* Grade Level Info */}
          <div className="text-xs text-gray-500">
            <p>Grade Level: {gradeLevel}</p>
            <p>Language: English (US)</p>
            <p>Provider: {useElevenLabs ? 'ElevenLabs' : 'Web Speech API'}</p>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Transcript:</div>
          <div className="text-white">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 italic">{interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || errorMessage) && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-200 text-sm">{error || errorMessage}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500">
        <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Space</kbd> to start/stop listening</p>
        <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> to stop listening</p>
      </div>
    </div>
  );
};

export default VoiceInput;
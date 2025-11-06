/**
 * VoiceInput Component - Speech-to-Text with Web Speech API
 * 
 * A React component for voice input using Web Speech API via react-speech-recognition.
 * Features hold-to-speak interaction, real-time transcript display, and accessibility support.
 * 
 * @component
 * @param {Function} onTranscript - Callback called with transcript text
 * @param {Function} onStart - Callback called when recording starts
 * @param {Function} onEnd - Callback called when recording ends
 * @param {boolean} isDisabled - Disable microphone when AI is speaking
 * @param {string} className - Additional CSS classes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import voiceAnalytics from '../services/voiceAnalytics.js';
import 'regenerator-runtime/runtime'; // Required for react-speech-recognition

const VoiceInput = ({
  onTranscript,
  onStart,
  onEnd,
  isDisabled = false,
  className = ''
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Refs for hold-to-speak functionality
  const buttonRef = useRef(null);
  const pressStartTimeRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Check browser support
  const isSupported = SpeechRecognition.browserSupportsSpeechRecognition();
  
  // Use react-speech-recognition hook
  // Note: Works best with SpeechRecognitionProvider, but can work without it
  const {
    transcript = '',
    interimTranscript = '',
    finalTranscript = '',
    listening = false,
    resetTranscript = () => {}
  } = useSpeechRecognition();

  // Check microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          setPermissionStatus(permission.state);
          
          // Track permission status
          if (permission.state === 'granted') {
            voiceAnalytics.trackMicrophonePermission(true);
            voiceAnalytics.trackGrantedPermission();
          } else if (permission.state === 'denied') {
            voiceAnalytics.trackMicrophonePermission(false);
          }
          
          permission.onchange = () => {
            setPermissionStatus(permission.state);
            
            // Track permission changes
            if (permission.state === 'granted') {
              voiceAnalytics.trackMicrophonePermission(true);
              voiceAnalytics.trackGrantedPermission();
            } else if (permission.state === 'denied') {
              voiceAnalytics.trackMicrophonePermission(false);
            }
          };
        }
      } catch (error) {
        // Permission API not supported or different browser
        if (import.meta.env.DEV) {
          console.log('Permission API not available');
        }
      }
    };
    
    checkPermission();
  }, []);

  // Handle transcript updates
  useEffect(() => {
    if (finalTranscript) {
      onTranscript?.(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, onTranscript, resetTranscript]);

  // Sync listening state
  useEffect(() => {
    if (listening !== isListening) {
      setIsListening(listening);
      
      if (listening) {
        onStart?.();
        lastSpeechTimeRef.current = Date.now();
      } else {
        onEnd?.();
      }
    }
  }, [listening, isListening, onStart, onEnd]);

  // Handle silence timeout (10 seconds)
  useEffect(() => {
    if (isListening && !isDisabled) {
      // Reset timer on speech activity
      if (transcript || interimTranscript) {
        lastSpeechTimeRef.current = Date.now();
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
          if (timeSinceLastSpeech >= 10000) {
            stopListening();
            setError('No speech detected for 10 seconds. Recording stopped.');
          }
        }, 10000);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, transcript, interimTranscript, isDisabled]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isDisabled) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: 'en-US'
      });
      setIsListening(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start speech recognition. Please try again.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isSupported, isDisabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      SpeechRecognition.stopListening();
      setIsListening(false);
      setIsPressed(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, []);

  // Handle mouse/touch press start
  const handlePressStart = useCallback((e) => {
    e.preventDefault();
    
    if (isDisabled || !isSupported) {
      return;
    }

    pressStartTimeRef.current = Date.now();
    setIsPressed(true);
    startListening();
  }, [isDisabled, isSupported, startListening]);

  // Handle mouse/touch press end
  const handlePressEnd = useCallback((e) => {
    e.preventDefault();
    
    if (isPressed) {
      stopListening();
    }
  }, [isPressed, stopListening]);

  // Handle keyboard press (Spacebar)
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !isDisabled && isSupported) {
      e.preventDefault();
      
      if (!isListening) {
        handlePressStart(e);
      }
    }
  }, [isDisabled, isSupported, isListening, handlePressStart]);

  // Handle keyboard release (Spacebar)
  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handlePressEnd(e);
    }
    
    // Escape to stop
    if (e.code === 'Escape' && isListening) {
      e.preventDefault();
      stopListening();
    }
  }, [isListening, handlePressEnd, stopListening]);

  // Keyboard event listeners
  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      
      button.addEventListener('keydown', handleKeyDown);
      button.addEventListener('keyup', handleKeyUp);
      
      return () => {
        button.removeEventListener('keydown', handleKeyDown);
        button.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [handleKeyDown, handleKeyUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, stopListening]);

  // Browser not supported
  if (!isSupported) {
    return (
      <div className={`voice-input-error ${className}`} role="alert">
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-red-200 font-medium mb-1">Speech Recognition Not Supported</p>
            <p className="text-red-300/80 text-sm">
              Your browser doesn't support speech recognition. Please use Chrome, Safari, or Edge for the best experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permissionStatus === 'denied') {
    return (
      <div className={`voice-input-error ${className}`} role="alert">
        <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-amber-200 font-medium mb-1">Microphone Access Required</p>
            <p className="text-amber-300/80 text-sm">
              Please allow microphone access in your browser settings to use voice input.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get current transcript display
  const displayTranscript = transcript || interimTranscript;
  const isActive = isListening && !isDisabled;

  return (
    <div className={`voice-input ${className}`} role="region" aria-label="Voice input">
      {/* Main Microphone Button - Hold to Speak */}
      <div className="flex flex-col items-center gap-4">
        <button
          ref={buttonRef}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          disabled={isDisabled || isInitializing}
          className={`
            relative flex items-center justify-center
            w-24 h-24 md:w-28 md:h-28
            rounded-full
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isActive
              ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50 scale-110'
              : 'bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 hover:scale-105'
            }
            ${isPressed ? 'scale-95' : ''}
          `}
          aria-label={isActive ? 'Recording - Release to stop' : 'Press and hold to speak'}
          aria-pressed={isListening}
          aria-disabled={isDisabled}
          role="button"
          tabIndex={isDisabled ? -1 : 0}
        >
          {/* Pulsing animation ring when active */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
            </>
          )}
          
          {/* Microphone Icon */}
          <div className="relative z-10">
            {isInitializing ? (
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-white animate-spin" />
            ) : isActive ? (
              <MicOff className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : (
              <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" />
            )}
          </div>
        </button>

        {/* Status Text */}
        <div className="text-center" aria-live="polite" aria-atomic="true">
          <p className={`text-sm font-medium transition-colors ${
            isActive
              ? 'text-red-400'
              : isDisabled
              ? 'text-gray-500'
              : 'text-gray-400'
          }`}>
            {isInitializing
              ? 'Initializing...'
              : isActive
              ? 'Listening... Release to stop'
              : isDisabled
              ? 'Microphone disabled'
              : 'Hold to speak'}
          </p>
          
          {/* Keyboard hint */}
          {!isDisabled && (
            <p className="text-xs text-gray-500 mt-1">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">Space</kbd> to activate
            </p>
          )}
        </div>
      </div>

      {/* Real-time Transcript Display */}
      {displayTranscript && (
        <div
          className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
          role="log"
          aria-label="Speech transcript"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {isActive ? 'Listening' : 'Transcript'}
            </span>
          </div>
          
          <div className="text-white text-lg leading-relaxed">
            {transcript && (
              <span className="text-white">{transcript}</span>
            )}
            {interimTranscript && (
              <span className="text-gray-400 italic">{interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-red-200 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isListening && 'Microphone is listening'}
        {!isListening && isPressed && 'Microphone stopped'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
};

export default VoiceInput;


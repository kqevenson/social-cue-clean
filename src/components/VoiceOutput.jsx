/**
 * useTextToSpeech - Custom Hook for Text-to-Speech
 * 
 * Encapsulates text-to-speech logic with voice selection, queue management,
 * and control functions.
 * 
 * @hook
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Select appropriate voice based on grade level
 * @param {string} gradeLevel - Grade level (k2, 3-5, 6-8, 9-12)
 * @returns {SpeechSynthesisVoice|null} Selected voice
 */
function selectVoiceForGrade(gradeLevel) {
  if (!window.speechSynthesis) return null;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  
  // Normalize grade level
  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  
  // Voice preferences by grade level
  const voicePreferences = {
    'k2': {
      keywords: ['friendly', 'child', 'kid', 'young', 'warm', 'clear'],
      avoid: ['adult', 'professional', 'serious']
    },
    '3-5': {
      keywords: ['friendly', 'clear', 'warm', 'natural'],
      avoid: ['robotic', 'monotone']
    },
    '6-8': {
      keywords: ['natural', 'conversational', 'friendly', 'clear'],
      avoid: ['child', 'cartoon']
    },
    '9-12': {
      keywords: ['natural', 'conversational', 'mature', 'professional'],
      avoid: ['child', 'cartoon', 'robotic']
    }
  };
  
  const preferences = voicePreferences[normalizedGrade] || voicePreferences['6-8'];
  
  // Score voices based on preferences
  const scoredVoices = voices.map(voice => {
    let score = 0;
    const voiceNameLower = voice.name.toLowerCase();
    const voiceLangLower = voice.lang.toLowerCase();
    
    // Prefer English voices
    if (voiceLangLower.startsWith('en')) {
      score += 10;
    }
    
    // Check for preferred keywords
    preferences.keywords.forEach(keyword => {
      if (voiceNameLower.includes(keyword)) {
        score += 5;
      }
    });
    
    // Penalize avoided keywords
    preferences.avoid.forEach(keyword => {
      if (voiceNameLower.includes(keyword)) {
        score -= 5;
      }
    });
    
    // Prefer local voices over remote
    if (voice.localService) {
      score += 3;
    }
    
    // Prefer default voice
    if (voice.default) {
      score += 2;
    }
    
    return { voice, score };
  });
  
  // Sort by score and return best match
  scoredVoices.sort((a, b) => b.score - a.score);
  
  return scoredVoices[0]?.voice || voices[0];
}

/**
 * Normalize grade level to standardized format
 * @param {string} gradeLevel - Grade level input
 * @returns {string} Normalized grade level
 */
function normalizeGradeLevel(gradeLevel) {
  if (!gradeLevel) return '6-8';
  
  const GRADE_LEVEL_MAP = {
    'k': 'k2', 'K': 'k2', '1': 'k2', '2': 'k2', 'K-2': 'k2', 'k2': 'k2',
    '3': '3-5', '4': '3-5', '5': '3-5', '3-5': '3-5',
    '6': '6-8', '7': '6-8', '8': '6-8', '6-8': '6-8',
    '9': '9-12', '10': '9-12', '11': '9-12', '12': '9-12', '9-12': '9-12'
  };
  
  const normalized = String(gradeLevel).trim();
  return GRADE_LEVEL_MAP[normalized] || GRADE_LEVEL_MAP[normalized.toLowerCase()] || '6-8';
}

/**
 * Custom hook for text-to-speech functionality
 * @param {Object} options - Configuration options
 * @param {string} [options.gradeLevel='6-8'] - Grade level for voice selection
 * @param {number} [options.rate=0.9] - Speech rate (0.1-10)
 * @param {number} [options.pitch=1.0] - Pitch (0-2)
 * @param {number} [options.volume=1.0] - Volume (0-1)
 * @returns {Object} TTS control functions and state
 */
export function useTextToSpeech({
  gradeLevel = '6-8',
  rate = 0.9,
  pitch = 1.0,
  volume = 1.0
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [queue, setQueue] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);
  
  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const voice = selectVoiceForGrade(gradeLevel);
          setSelectedVoice(voice);
          setVoicesLoaded(true);
        }
      }
    };
    
    // Voices may load asynchronously
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, [gradeLevel]);
  
  // Update queue ref when queue changes
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  
  // Speak text
  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) {
      throw new Error('Speech synthesis not supported in this browser');
    }
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.warn('Empty text provided to speak');
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text.trim());
    
    // Apply voice
    const voice = options.voice || selectedVoice;
    if (voice) {
      utterance.voice = voice;
    }
    
    // Apply settings
    utterance.rate = options.rate ?? rate;
    utterance.pitch = options.pitch ?? pitch;
    utterance.volume = options.volume ?? volume;
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentUtterance(utterance);
      options.onStart?.();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      options.onEnd?.();
      
      // Process queue
      if (queueRef.current.length > 0) {
        const nextText = queueRef.current.shift();
        setQueue(prev => prev.slice(1));
        setTimeout(() => speak(nextText), 100);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      options.onError?.(event.error);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    
    return utterance;
  }, [selectedVoice, rate, pitch, volume]);
  
  // Add text to queue
  const queueText = useCallback((text) => {
    setQueue(prev => [...prev, text]);
  }, []);
  
  // Pause speech
  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);
  
  // Resume speech
  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);
  
  // Stop speech
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      setQueue([]);
      queueRef.current = [];
    }
  }, []);
  
  // Check browser support
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  return {
    speak,
    queueText,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    currentUtterance,
    queue,
    selectedVoice,
    voicesLoaded,
    isSupported
  };
}

/**
 * VoiceOutput Component - Text-to-Speech Output
 * 
 * React component for text-to-speech output with visual indicators,
 * controls, and accessibility features.
 * 
 * @component
 * @param {string} text - Text to speak
 * @param {Function} onStart - Callback when speaking starts
 * @param {Function} onEnd - Callback when speaking finishes
 * @param {number} rate - Speech rate (default 0.9)
 * @param {number} pitch - Pitch (default 1.0)
 * @param {number} volume - Volume (default 1.0)
 * @param {boolean} autoPlay - Start speaking automatically (default true)
 * @param {string} gradeLevel - Grade level for voice selection (default '6-8')
 * @param {string} className - Additional CSS classes
 */

const VoiceOutput = ({
  text,
  onStart,
  onEnd,
  rate = 0.9,
  pitch = 1.0,
  volume = 1.0,
  autoPlay = true,
  gradeLevel = '6-8',
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [localRate, setLocalRate] = useState(rate);
  const [localPitch, setLocalPitch] = useState(pitch);
  const [localVolume, setLocalVolume] = useState(volume);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const hasPlayedRef = useRef(false);
  const textRef = useRef(text);
  const currentUtteranceRef = useRef(null);
  
  // Use custom hook
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    selectedVoice,
    voicesLoaded,
    isSupported,
    currentUtterance
  } = useTextToSpeech({
    gradeLevel,
    rate: localRate,
    pitch: localPitch,
    volume: localVolume
  });
  
  // Update utterance ref when it changes
  useEffect(() => {
    currentUtteranceRef.current = currentUtterance;
  }, [currentUtterance]);

  // Update text ref when text changes
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Auto-play when text changes
  useEffect(() => {
    if (autoPlay && text && text.trim() && voicesLoaded && !hasPlayedRef.current) {
      setIsInitializing(true);
      
      // Small delay to ensure voices are loaded
      const timer = setTimeout(() => {
        try {
          speak(text, {
            onStart: () => {
              setIsInitializing(false);
              onStart?.();
              hasPlayedRef.current = true;
            },
            onEnd: () => {
              setIsInitializing(false);
              onEnd?.();
              hasPlayedRef.current = false;
            },
            onError: (error) => {
              setIsInitializing(false);
              setError(`Speech error: ${error}`);
              hasPlayedRef.current = false;
            }
          });
        } catch (err) {
          setIsInitializing(false);
          setError(err.message);
          hasPlayedRef.current = false;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay, voicesLoaded, speak, onStart, onEnd]);

  // Reset hasPlayedRef when text changes significantly
  useEffect(() => {
    if (text !== textRef.current && textRef.current) {
      hasPlayedRef.current = false;
    }
  }, [text]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else if (text) {
      setIsInitializing(true);
      try {
        speak(text, {
          onStart: () => {
            setIsInitializing(false);
            onStart?.();
          },
          onEnd: () => {
            setIsInitializing(false);
            onEnd?.();
          },
          onError: (error) => {
            setIsInitializing(false);
            setError(`Speech error: ${error}`);
          }
        });
      } catch (err) {
        setIsInitializing(false);
        setError(err.message);
      }
    }
  }, [isSpeaking, isPaused, text, speak, pause, resume, onStart, onEnd]);

  // Handle replay
  const handleReplay = useCallback(() => {
    stop();
    setTimeout(() => {
      if (text) {
        handlePlayPause();
      }
    }, 100);
  }, [stop, text, handlePlayPause]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space' && text) {
        e.preventDefault();
        handlePlayPause();
      }
      
      if (e.code === 'Escape' && isSpeaking) {
        e.preventDefault();
        stop();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isSpeaking, isPaused, stop, handlePlayPause]);

  // Browser not supported
  if (!isSupported) {
    return (
      <div className={`voice-output-error ${className}`} role="alert">
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-red-200 font-medium mb-1">Text-to-Speech Not Supported</p>
            <p className="text-red-300/80 text-sm">
              Your browser doesn't support text-to-speech. Please use Chrome, Safari, or Edge for the best experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Voices not loaded yet
  if (!voicesLoaded) {
    return (
      <div className={`voice-output ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-gray-300 text-sm">Loading voices...</span>
        </div>
      </div>
    );
  }

  const isActive = isSpeaking && !isPaused;

  return (
    <div className={`voice-output ${className}`} role="region" aria-label="Voice output">
      {/* Main Controls */}
      <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={!text || !text.trim() || isInitializing}
          className={`
            relative flex items-center justify-center
            w-16 h-16 md:w-20 md:h-20
            rounded-full
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isActive
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50 scale-105'
              : 'bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 hover:scale-105'
            }
          `}
          aria-label={isActive ? (isPaused ? 'Resume speaking' : 'Pause speaking') : 'Start speaking'}
          aria-pressed={isSpeaking}
          role="button"
          tabIndex={0}
        >
          {/* Pulsing animation when speaking */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse" />
            </>
          )}
          
          {/* Icon */}
          <div className="relative z-10">
            {isInitializing ? (
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin" />
            ) : isActive ? (
              <Pause className="w-8 h-8 md:w-10 md:h-10 text-white" />
            ) : (
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Stop Button */}
        {isSpeaking && (
          <button
            onClick={stop}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Stop speaking"
            title="Stop speaking (Esc)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Replay Button */}
        {!isSpeaking && text && (
          <button
            onClick={handleReplay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Replay"
            title="Replay"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Status and Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isInitializing
                ? 'Preparing...'
                : isActive
                ? 'Speaking...'
                : isPaused
                ? 'Paused'
                : 'Ready'}
            </span>
          </div>
          
          {/* Text Preview (truncated) */}
          {text && (
            <p className="text-xs text-gray-500 truncate" title={text}>
              {text.length > 60 ? `${text.substring(0, 60)}...` : text}
            </p>
          )}
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Voice settings"
          aria-expanded={showSettings}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <h3 className="text-sm font-medium text-white mb-4">Voice Settings</h3>
          
          {/* Voice Info */}
          {selectedVoice && (
            <div className="mb-4 pb-4 border-b border-white/10">
              <p className="text-xs text-gray-400 mb-1">Selected Voice</p>
              <p className="text-sm text-white">{selectedVoice.name}</p>
              <p className="text-xs text-gray-500">{selectedVoice.lang}</p>
            </div>
          )}

          {/* Speed Control */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">
              Speed: {localRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localRate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setLocalRate(newRate);
                // Update current utterance if speaking
                if (window.speechSynthesis.speaking && currentUtteranceRef.current) {
                  currentUtteranceRef.current.rate = newRate;
                }
              }}
              className="w-full accent-blue-500"
              aria-label="Speech rate"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">
              Volume: {Math.round(localVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localVolume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setLocalVolume(newVolume);
                // Update current utterance if speaking
                if (window.speechSynthesis.speaking && currentUtteranceRef.current) {
                  currentUtteranceRef.current.volume = newVolume;
                }
              }}
              className="w-full accent-blue-500"
              aria-label="Volume"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mute</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">
              Pitch: {localPitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localPitch}
              onChange={(e) => {
                const newPitch = parseFloat(e.target.value);
                setLocalPitch(newPitch);
                // Update current utterance if speaking
                if (window.speechSynthesis.speaking && currentUtteranceRef.current) {
                  currentUtteranceRef.current.pitch = newPitch;
                }
              }}
              className="w-full accent-blue-500"
              aria-label="Pitch"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Grade Level Info */}
          <div className="text-xs text-gray-500 pt-4 border-t border-white/10">
            <p>Grade Level: {gradeLevel}</p>
            <p>Voice: {selectedVoice?.name || 'Default'}</p>
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
        {isActive && 'Speaking'}
        {isPaused && 'Paused'}
        {!isSpeaking && !isPaused && text && 'Ready to speak'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
};

export default VoiceOutput;

// Export the hook separately for use in other components
export { useTextToSpeech };


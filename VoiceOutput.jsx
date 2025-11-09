import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, Loader2, RotateCcw, Settings, AlertCircle } from 'lucide-react';

/**
 * VoiceOutput Component - Text-to-Speech using ElevenLabs API with Web Speech fallback
 * 
 * Features:
 * - Premium ElevenLabs voices with age-appropriate selection
 * - Web Speech API fallback for reliability
 * - Audio caching for performance
 * - Comprehensive error handling
 * - Visual feedback and controls
 * - Mobile-friendly design
 */
const VoiceOutput = ({ 
  text, 
  autoPlay = true,
  gradeLevel = '6',
  onComplete,
  onStart,
  onError,
  className = ''
}) => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [error, setError] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  
  // Refs
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const audioCacheRef = useRef(new Map());

  // Configuration
  const config = {
    elevenlabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
      enabled: import.meta.env.VITE_USE_ELEVENLABS === 'true',
      baseUrl: 'https://api.elevenlabs.io/v1/text-to-speech'
    }
  };

  // Voice selection based on grade level
  const getVoiceId = useCallback((grade) => {
    const gradeNum = parseInt(grade) || 6;
    
    // ElevenLabs voice IDs
    const voices = {
      // K-2: Warm, friendly female voices
      'rachel': '21m00Tcm4TlvDq8ikWAM', // Rachel - warm female
      'bella': 'EXAVITQu4vr4xnSDxMaL',   // Bella - friendly female
      
      // 3-5: Clear, engaging voice
      'elli': 'MF3mGyEYCl7XYWbV9V6O',   // Elli - clear engaging
      
      // 6-8: Professional, neutral
      'callum': 'N2lVS1w4EtoT3dr4eOWO', // Callum - professional male
      'charlotte': 'XB0fDUnXU5T1ppWg',   // Charlotte - professional female
      
      // 9-12: Mature, natural
      'josh': 'flq6f7yk4E4fJM5XTYuZ',   // Josh - mature natural
      'nicole': 'piTKgcLEGmPE4e6mEKli'   // Nicole - mature female
    };
    
    if (gradeNum <= 2) return voices.rachel;
    if (gradeNum <= 5) return voices.elli;
    if (gradeNum <= 8) return voices.callum;
    return voices.josh;
  }, []);

  // Get appropriate speech rate and pitch for grade level
  const getSpeechSettings = useCallback((grade) => {
    const gradeNum = parseInt(grade) || 6;
    
    if (gradeNum <= 2) return { rate: 0.8, pitch: 1.2 }; // Slower, higher pitch
    if (gradeNum <= 5) return { rate: 0.9, pitch: 1.1 }; // Slightly slower
    if (gradeNum <= 8) return { rate: 1.0, pitch: 1.0 }; // Normal
    return { rate: 1.1, pitch: 0.9 }; // Slightly faster, lower pitch
  }, []);

  // Generate audio using ElevenLabs API
  const generateElevenLabsAudio = useCallback(async (textToSpeak, voiceId) => {
    if (!config.elevenlabs.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const cacheKey = `${voiceId}-${textToSpeak}`;
    
    // Check cache first
    if (cacheEnabled && audioCacheRef.current.has(cacheKey)) {
      console.log('Using cached audio');
      return audioCacheRef.current.get(cacheKey);
    }

    console.log('Generating ElevenLabs audio...');
    
    const response = await fetch(
      `${config.elevenlabs.baseUrl}/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': config.elevenlabs.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Cache the audio URL
    if (cacheEnabled) {
      audioCacheRef.current.set(cacheKey, audioUrl);
    }
    
    return audioUrl;
  }, [config.elevenlabs, cacheEnabled]);

  // Fallback to Web Speech API
  const speakWithWebSpeech = useCallback((textToSpeak) => {
    if (!window.speechSynthesis) {
      throw new Error('Speech synthesis not supported');
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();
    const settings = getSpeechSettings(gradeLevel);
    
    // Select appropriate voice
    const preferredVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('google') || 
             name.includes('natural') || 
             name.includes('enhanced') ||
             (parseInt(gradeLevel) <= 5 && name.includes('female')) ||
             (parseInt(gradeLevel) > 5 && name.includes('male'));
    }) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = volume;
    
    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
      onStart?.();
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onComplete?.();
    };
    
    utterance.onerror = (event) => {
      console.error('Web Speech error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
      const errorMsg = `Speech synthesis error: ${event.error}`;
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    };
    
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    
    return true;
  }, [gradeLevel, volume, onStart, onComplete, onError, getSpeechSettings]);

  // Play audio with ElevenLabs
  const playElevenLabsAudio = useCallback(async (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      
      audio.onloadeddata = () => {
        setAudioDuration(audio.duration);
      };
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);
        onStart?.();
        
        // Start progress tracking
        progressIntervalRef.current = setInterval(() => {
          if (audio.duration) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }
        }, 100);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setAudioProgress(0);
        clearInterval(progressIntervalRef.current);
        onComplete?.();
        resolve();
      };
      
      audio.onerror = (event) => {
        console.error('Audio playback error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        clearInterval(progressIntervalRef.current);
        reject(new Error('Audio playback failed'));
      };
      
      audio.onpause = () => setIsPaused(true);
      audio.onresume = () => setIsPaused(false);
      
      audioRef.current = audio;
      
      audio.play().catch(reject);
    });
  }, [volume, onStart, onComplete]);

  // Main play function
  const playAudio = useCallback(async () => {
    if (!text.trim()) {
      setError('No text to speak');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (useElevenLabs && config.elevenlabs.enabled && config.elevenlabs.apiKey) {
        // Try ElevenLabs first
        const voiceId = getVoiceId(gradeLevel);
        const audioUrl = await generateElevenLabsAudio(text, voiceId);
        await playElevenLabsAudio(audioUrl);
      } else {
        // Use Web Speech API
        speakWithWebSpeech(text);
      }
    } catch (error) {
      console.error('TTS error:', error);
      
      if (useElevenLabs) {
        // Retry with Web Speech API
        console.log('Falling back to Web Speech API');
        setUseElevenLabs(false);
        speakWithWebSpeech(text);
      } else {
        const errorMsg = error.message || 'Text-to-speech failed';
        setError(errorMsg);
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [text, useElevenLabs, config.elevenlabs, gradeLevel, getVoiceId, generateElevenLabsAudio, playElevenLabsAudio, speakWithWebSpeech, onError]);

  // Control functions
  const pauseAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    } else if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setAudioProgress(0);
    clearInterval(progressIntervalRef.current);
  }, []);

  const replayAudio = useCallback(() => {
    stopAudio();
    setTimeout(() => playAudio(), 100);
  }, [stopAudio, playAudio]);

  // Auto-play when text changes
  useEffect(() => {
    if (autoPlay && text.trim() && !isPlaying) {
      playAudio();
    }
  }, [autoPlay, text, isPlaying, playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      // Clean up cached audio URLs
      audioCacheRef.current.forEach(url => URL.revokeObjectURL(url));
      audioCacheRef.current.clear();
    };
  }, [stopAudio]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      if (event.code === 'Space') {
        event.preventDefault();
        if (isPlaying) {
          if (isPaused) {
            resumeAudio();
          } else {
            pauseAudio();
          }
        } else {
          playAudio();
        }
      }
      
      if (event.code === 'Escape' && isPlaying) {
        event.preventDefault();
        stopAudio();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, playAudio, pauseAudio, resumeAudio, stopAudio]);

  // Check ElevenLabs availability
  useEffect(() => {
    if (!config.elevenlabs.apiKey) {
      setUseElevenLabs(false);
      setError('ElevenLabs API key not configured - using Web Speech API');
    }
  }, [config.elevenlabs.apiKey]);

  // Render error state
  if (!window.speechSynthesis && !config.elevenlabs.apiKey) {
    return (
      <div className={`voice-output-error ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <VolumeX className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-200 font-medium">Text-to-Speech Not Available</p>
            <p className="text-red-300/80 text-sm">
              Neither ElevenLabs nor Web Speech API is available. Please check your configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-output ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? (isPaused ? resumeAudio : pauseAudio) : playAudio}
          disabled={isLoading || !text.trim()}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
            ${isPlaying 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isLoading || !text.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          aria-label={isPlaying ? (isPaused ? 'Resume speaking' : 'Pause speaking') : 'Start speaking'}
          title={isPlaying ? (isPaused ? 'Resume (Space)' : 'Pause (Space)') : 'Start speaking (Space)'}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>

        {/* Stop Button */}
        {isPlaying && (
          <button
            onClick={stopAudio}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Stop speaking"
            title="Stop speaking (Esc)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Replay Button */}
        {!isPlaying && text.trim() && (
          <button
            onClick={replayAudio}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Replay"
            title="Replay"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Status and Progress */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
              {isLoading ? 'Loading...' : 
               isPlaying ? (isPaused ? 'Paused' : 'Speaking...') : 
               'Ready to speak'}
            </span>
            {useElevenLabs && (
              <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
                ElevenLabs
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          {isPlaying && audioDuration > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-green-400 h-1 rounded-full transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          )}
          
          {/* Waveform Animation */}
          {isPlaying && !isPaused && audioDuration === 0 && (
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
          <h3 className="text-sm font-medium text-white mb-3">Voice Settings</h3>
          
          {/* Voice Provider */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Voice Provider</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseElevenLabs(true)}
                className={`px-3 py-1 text-xs rounded ${
                  useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                ElevenLabs
              </button>
              <button
                onClick={() => setUseElevenLabs(false)}
                className={`px-3 py-1 text-xs rounded ${
                  !useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Web Speech
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Cache Setting */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="rounded"
              />
              Enable audio caching
            </label>
          </div>

          {/* Grade Level Info */}
          <div className="text-xs text-gray-500">
            <p>Grade Level: {gradeLevel}</p>
            <p>Voice: {useElevenLabs ? 'ElevenLabs Premium' : 'Web Speech API'}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
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

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500">
        <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Space</kbd> to play/pause</p>
        <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> to stop</p>
      </div>
    </div>
  );
};

export default VoiceOutput;
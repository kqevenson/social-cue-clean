import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, Loader2, RotateCcw, Settings, AlertCircle } from 'lucide-react';

/**
 * VoiceOutput Component - Text-to-Speech using ElevenLabs API with Web Speech fallback
 * 
 * Features:
 * - Premium ElevenLabs voices with consistent warm teacher voices
 * - Web Speech API fallback for reliability
 * - Audio caching for performance
 * - Comprehensive error handling
 * - Visual feedback and controls
 * - Mobile-friendly design
 * 
 * Usage example:
 * <VoiceOutput 
 *   text="Hello! Let's practice social skills together."
 *   voiceGender="female"  // or "male"
 *   autoPlay={true}
 *   onComplete={() => console.log('Finished speaking')}
 *   onError={(error) => console.error('TTS error:', error)}
 * />
 */
const VoiceOutput = ({ 
  text, 
  autoPlay = true,
  voiceGender = 'female',
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
  const [showPlayButton, setShowPlayButton] = useState(false);
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

  // Voice selection - consistent warm teacher voices for all ages
  const getVoiceId = useCallback((gender = 'female') => {
    console.log('🎵 Getting voice ID for gender:', gender);
    
    if (gender === 'female') {
      // Charlotte - Warm, professional, empathetic English female
      const voiceId = 'XB0fDUnXU5powFXDhCwa';
      console.log('→ Selected Charlotte (female):', voiceId);
      return voiceId;
    } else if (gender === 'male') {
      // Callum - Clear, encouraging English male  
      const voiceId = 'N2lVS1w4EtoT3dr4eOWO';
      console.log('→ Selected Callum (male):', voiceId);
      return voiceId;
    } else {
      // Default to Charlotte
      console.warn('⚠️ Unknown gender:', gender, '- defaulting to Charlotte');
      return 'XB0fDUnXU5powFXDhCwa';
    }
  }, []);

  // Voice selection with accent options
  const getVoiceIdWithAccent = useCallback((gender = 'female', accent = 'english') => {
    console.log('🎵 Getting voice ID for gender:', gender, 'accent:', accent);
    
    if (accent === 'american') {
      if (gender === 'female') {
        // Rachel - Calm, clear American female (great for teaching)
        const voiceId = '21m00Tcm4TlvDq8ikWAM';
        console.log('→ Selected Rachel (American female):', voiceId);
        return voiceId;
      } else {
        // Adam - Deep, clear American male (authoritative but friendly)
        const voiceId = 'pNInz6obpgDQGcFmaJgB';
        console.log('→ Selected Adam (American male):', voiceId);
        return voiceId;
      }
    } else {
      // Default to English voices
      if (gender === 'female') {
        // Charlotte - Warm, professional, empathetic English female
        const voiceId = 'XB0fDUnXU5powFXDhCwa';
        console.log('→ Selected Charlotte (English female):', voiceId);
        return voiceId;
      } else if (gender === 'male') {
        // Callum - Clear, encouraging English male  
        const voiceId = 'N2lVS1w4EtoT3dr4eOWO';
        console.log('→ Selected Callum (English male):', voiceId);
        return voiceId;
      } else {
        // Default to Charlotte
        console.warn('⚠️ Unknown gender:', gender, '- defaulting to Charlotte');
        return 'XB0fDUnXU5powFXDhCwa';
      }
    }
  }, []);
  const getVoiceName = useCallback((voiceId) => {
    const voices = {
      'XB0fDUnXU5powFXDhCwa': 'Charlotte (Female - English)',
      'N2lVS1w4EtoT3dr4eOWO': 'Callum (Male - Scottish)',
      '21m00Tcm4TlvDq8ikWAM': 'Rachel (Female - American)',
      'pNInz6obpgDQGcFmaJgB': 'Adam (Male - American)',
      'EXAVITQu4vr4xnSDxMaL': 'Sarah (Female - American)',
      'ErXwobaYiN019PkySvjV': 'Antoni (Male - American)'
    };
    return voices[voiceId] || 'Unknown voice';
  }, []);
  const alternativeVoices = {
    female: {
      charlotte: 'XB0fDUnXU5powFXDhCwa', // Warm professional (RECOMMENDED)
      rachel: '21m00Tcm4TlvDq8ikWAM',     // Very warm and nurturing
      bella: 'EXAVITQu4vr4xnSDxMaL',      // Sweet and encouraging
      elli: 'MF3mGyEYCl7XYWbV9V6O'        // Clear and engaging
    },
    male: {
      callum: 'N2lVS1w4EtoT3dr4eOWO',    // Warm professional (RECOMMENDED)
      josh: 'TxGEqnHWrfWFTfGW9XjX',       // Natural and mature
      adam: 'pNInz6obpgDQGcFmaJgB'        // Deep and reassuring
    }
  };

  // Consistent natural speech settings for all ages
  const getSpeechSettings = useCallback(() => {
    return { rate: 0.95, pitch: 1.0 }; // Slightly slower for clarity, natural pitch
  }, []);

  // Generate audio using ElevenLabs API
  const generateElevenLabsAudio = useCallback(async (textToSpeak, voiceId) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎙️ ELEVENLABS AUDIO GENERATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Text to speak:', textToSpeak.substring(0, 100) + '...');
    console.log('Voice ID:', voiceId);
    console.log('Voice name:', getVoiceName(voiceId));
    console.log('API Key exists:', !!config.elevenlabs.apiKey);
    console.log('API Key (first 10 chars):', config.elevenlabs.apiKey?.substring(0, 10));
    
    if (!config.elevenlabs.apiKey) {
      console.error('❌ NO API KEY FOUND!');
      throw new Error('ElevenLabs API key not configured');
    }

    const cacheKey = `${voiceId}-${textToSpeak}`;
    
    // Check cache first
    if (cacheEnabled && audioCacheRef.current.has(cacheKey)) {
      console.log('Using cached audio');
      return audioCacheRef.current.get(cacheKey);
    }

    try {
      console.log('📡 Making request to ElevenLabs...');
      
      const url = `${config.elevenlabs.baseUrl}/${voiceId}`;
      console.log('URL:', url);
      
      const requestBody = {
        text: textToSpeak,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.65,        // Slightly higher for consistency
          similarity_boost: 0.8,  // Higher to keep voice character
          style: 0.35,           // Add some expressiveness
          use_speaker_boost: true // Enhances voice clarity
        }
      };
      console.log('Request body:', JSON.stringify(requestBody).substring(0, 100) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': config.elevenlabs.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response received');
      console.log('Status:', response.status);
      console.log('Status text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }
      
      console.log('✅ Response OK, getting blob...');
      const audioBlob = await response.blob();
      
      console.log('📦 Blob received:');
      console.log('- Size:', audioBlob.size, 'bytes');
      console.log('- Type:', audioBlob.type);
      
      if (audioBlob.size === 0) {
        console.error('❌ Empty audio blob!');
        throw new Error('Received empty audio blob from ElevenLabs');
      }
      
      if (audioBlob.size < 1000) {
        console.warn('⚠️ Very small audio blob - might be an error');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('✅ Audio URL created:', audioUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Cache the audio URL
      if (cacheEnabled) {
        audioCacheRef.current.set(cacheKey, audioUrl);
      }
      
      return audioUrl;
      
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ELEVENLABS GENERATION FAILED');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw error;
    }
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
    const settings = getSpeechSettings();
    
    // Select warm, natural voice
    const voice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') ||
      v.name.includes('Enhanced')
    ) || voices[0];
    
    if (voice) utterance.voice = voice;
    
    // Consistent natural settings for all ages
    utterance.rate = settings.rate;   // Slightly slower for clarity
    utterance.pitch = settings.pitch; // Natural pitch
    utterance.volume = volume;        // Use volume setting
    
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
  }, [volume, onStart, onComplete, onError, getSpeechSettings]);

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

  // Main play function with enhanced audio debugging
  const playAudio = useCallback(async () => {
    console.log('▶️▶️▶️ PLAY AUDIO CALLED ▶️▶️▶️');
    console.log('Text:', text?.substring(0, 50));
    console.log('Voice gender:', voiceGender);
    console.log('Use ElevenLabs:', useElevenLabs);
    
    if (!text.trim()) {
      console.error('❌ No text to speak');
      setError('No text to speak');
      return;
    }

    console.log('━━━ VOICE OUTPUT DEBUG START ━━━');
    console.log('🔊 Starting audio playback');
    console.log('🎤 VoiceOutput playing:', {
      text: text.substring(0, 50) + '...',
      voiceGender,
      useElevenLabs,
      hasApiKey: !!config.elevenlabs.apiKey,
      apiKeyLength: config.elevenlabs.apiKey?.length || 0,
      enabled: config.elevenlabs.enabled,
      textLength: text.length
    });
    
    // Check browser audio context
    if (typeof AudioContext !== 'undefined') {
      const ctx = new AudioContext();
      console.log('🔊 Audio context state:', ctx.state);
      if (ctx.state === 'suspended') {
        console.warn('⚠️ Audio context suspended - need user interaction');
      }
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (useElevenLabs && config.elevenlabs.enabled && config.elevenlabs.apiKey) {
        console.log('✅ Using ElevenLabs path');
        
        // Check for accent preference in localStorage
        const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
        const accentPreference = userData.accentPreference || 'english'; // Default to English
        
        const voiceId = getVoiceIdWithAccent(voiceGender, accentPreference);
        console.log('Voice ID selected:', voiceId);
        console.log('Voice name:', getVoiceName(voiceId));
        
        console.log('Calling generateElevenLabsAudio...');
        const audioUrl = await generateElevenLabsAudio(text, voiceId);
        console.log('Got audio URL:', audioUrl);
        
        if (audioRef.current) {
          console.log('Cleaning up previous audio');
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        console.log('Creating new Audio element');
        audioRef.current = new Audio(audioUrl);
        audioRef.current.volume = 1.0;
        audioRef.current.muted = false;
        
        audioRef.current.onloadedmetadata = () => {
          console.log('🎵 Audio metadata loaded');
          console.log('Duration:', audioRef.current.duration, 'seconds');
        };
        
        audioRef.current.onloadeddata = () => {
          console.log('📦 Audio data loaded');
        };
        
        audioRef.current.oncanplay = () => {
          console.log('✅ Audio can play');
        };
        
        audioRef.current.onplay = () => {
          console.log('▶️ Audio PLAYING');
        };
        
        audioRef.current.onended = () => {
          console.log('⏹️ Audio ended');
          setIsPlaying(false);
          onComplete?.();
        };
        
        audioRef.current.onerror = (e) => {
          console.error('❌ Audio element error:', e);
          console.error('Error code:', audioRef.current?.error?.code);
          console.error('Error message:', audioRef.current?.error?.message);
          handleElevenLabsError();
        };
        
        console.log('🎬 Calling audio.play()...');
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅✅✅ AUDIO IS PLAYING! ✅✅✅');
              setIsPlaying(true);
              onStart?.();
            })
            .catch((error) => {
              console.error('❌ Play promise rejected:', error.name, error.message);
              if (error.name === 'NotAllowedError') {
                console.error('Autoplay blocked by browser');
                setShowPlayButton(true);
              } else if (error.name === 'NotSupportedError') {
                console.error('Audio format not supported');
              }
              handleElevenLabsError();
            });
        }
      } else {
        console.log('⚠️ NOT using ElevenLabs - falling back to Web Speech');
        console.log('Reasons:');
        console.log('- useElevenLabs:', useElevenLabs);
        console.log('- config.elevenlabs.enabled:', config.elevenlabs.enabled);
        console.log('- API Key exists:', !!config.elevenlabs.apiKey);
        const success = speakWithWebSpeech(text);
        if (!success) {
          throw new Error('Web Speech API not available');
        }
      }
    } catch (error) {
      console.error('❌ playAudio error:', error);
      
      // Check for specific error types
      if (error.name === 'NotAllowedError') {
        console.error('🔇 Autoplay blocked by browser - user interaction required');
        setError('Audio blocked. Please click to enable audio.');
        setShowPlayButton(true);
      } else if (error.message.includes('interrupted')) {
        console.error('⏸️ Audio play interrupted - likely autoplay policy');
        setError('Audio interrupted. Please try again.');
      } else if (useElevenLabs) {
        console.log('🔄 Falling back to Web Speech API');
        setUseElevenLabs(false);
        const success = speakWithWebSpeech(text);
        if (!success) {
          setError('Audio playback failed. Please check your browser settings.');
        }
      } else {
        setError('Audio playback failed. Please check your browser settings.');
      }
    } finally {
      setIsLoading(false);
      console.log('▶️▶️▶️ PLAY AUDIO FINISHED ▶️▶️▶️');
    }
  }, [text, useElevenLabs, config.elevenlabs, voiceGender, getVoiceIdWithAccent, getVoiceName, generateElevenLabsAudio, speakWithWebSpeech, onError, onStart, onComplete]);

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

  // Component mount/unmount debugging
  useEffect(() => {
    console.log('🎤 VoiceOutput MOUNTED');
    console.log('Props:', { 
      text: text?.substring(0, 50), 
      voiceGender, 
      autoPlay 
    });
    
    return () => {
      console.log('🎤 VoiceOutput UNMOUNTING');
    };
  }, []);

  // Auto-play when text changes
  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('- text:', text?.substring(0, 50));
    console.log('- autoPlay:', autoPlay);
    console.log('- isPlaying:', isPlaying);
    
    if (autoPlay && text.trim() && !isPlaying) {
      console.log('✅ Conditions met, calling playAudio');
      playAudio();
    } else {
      console.log('❌ Conditions NOT met:');
      console.log('   - Has text:', !!text);
      console.log('   - autoPlay:', autoPlay);
      console.log('   - NOT already playing:', !isPlaying);
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

  // Debug logging for props - TEMPORARILY DISABLED TO FIX INFINITE LOOP
  useEffect(() => {
    // Only log once per unique text to prevent spam
    if (text && text.length > 0) {
      const logKey = `${voiceGender}-${text.substring(0, 20)}`;
      if (!window.voiceLogCache) {
        window.voiceLogCache = new Set();
      }
      
      if (!window.voiceLogCache.has(logKey)) {
        window.voiceLogCache.add(logKey);
        console.log('VoiceOutput props:', { 
          voiceGender, 
          text: text.substring(0, 50) + '...',
          useElevenLabs,
          hasApiKey: !!config.elevenlabs.apiKey
        });
      }
    }
  }, [voiceGender, text, useElevenLabs, config.elevenlabs.apiKey]);

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

          {/* Voice Gender Info */}
          <div className="text-xs text-gray-500">
            <p>Voice Gender: {voiceGender}</p>
            <p>Voice: {useElevenLabs ? 'ElevenLabs Premium' : 'Web Speech API'}</p>
          </div>
        </div>
      )}

      {/* Manual Play Button for Autoplay Blocked */}
      {showPlayButton && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-200 font-medium">Audio Blocked</p>
              <p className="text-yellow-300/80 text-sm">
                Your browser blocked autoplay. Click below to enable audio.
              </p>
            </div>
            <button
              onClick={() => {
                setShowPlayButton(false);
                setError(null);
                
                // Try to play the existing audio element
                if (audioRef.current) {
                  console.log('🔓 User clicked to enable audio');
                  audioRef.current.play()
                    .then(() => {
                      console.log('✅ Audio playing after user click');
                      setIsPlaying(true);
                      onStart?.();
                    })
                    .catch(err => {
                      console.error('❌ Still cannot play after click:', err);
                      setError('Audio still blocked. Please check browser settings.');
                      setShowPlayButton(true);
                    });
                } else {
                  // If no audio element, try to generate and play
                  playAudio();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Click to Enable Audio
            </button>
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
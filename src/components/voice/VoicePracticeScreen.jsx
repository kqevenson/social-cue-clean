import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo 
} from 'react';
import { X, Mic, MicOff, Volume2, Loader } from 'lucide-react';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_IDS = {
  english: {
    female: 'EXAVITQu4vr4xnSDxMaL', // Rachel - American female
    male: 'VR6AewLTigWG4xSOukaG',   // Arnold - American male
  },
  spanish: {
    female: 'gD1IexrzCvsXPHUuT0s3', // Matilda - Spanish female
    male: 'g5CIjZEefAph4nQFvHAz',   // Alonso - Spanish male
  }
};

// Conversation settings
const MAX_EXCHANGES = 8; // 8 back-and-forth exchanges before natural ending

const VoicePracticeScreen = ({ scenario, gradeLevel = '6', onComplete, onExit, voiceGender: propVoiceGender = 'female' }) => {
  // Simple mount log
  useEffect(() => {
    console.log('✅ VoicePracticeScreen mounted');
    return () => console.log('🔚 VoicePracticeScreen unmounted');
  }, []);
  
  // Mount guard to detect duplicates
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const hasMounted = useRef(false);
  
  useEffect(() => {
    if (hasMounted.current) {
      console.error('⚠️⚠️⚠️ DUPLICATE MOUNT DETECTED!', instanceId.current);
      return;
    }
    
    hasMounted.current = true;
    console.log('✅ VoicePracticeScreen mounted ONCE', instanceId.current);
    
    return () => {
      console.log('🔚 VoicePracticeScreen unmounting', instanceId.current);
      hasMounted.current = false;
    };
  }, []);
  
  // Provide default scenario if not provided
  const defaultScenario = {
    id: 'general-practice',
    title: 'Social Skills Practice',
    category: 'General Practice',
    description: 'Practice your social skills with Cue',
    context: "Hi! I'm Cue, your social coach. I'm here to help you practice your social skills. Let's get started with a quick conversation!",
    difficulty: 'Beginner',
    icon: '💬'
  };
  
  const activeScenario = scenario || defaultScenario;
  
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [voiceGender, setVoiceGender] = useState(propVoiceGender);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null); // Track current audio
  const cleanupCalledRef = useRef(false); // Track cleanup state
  const hasSpokenRef = useRef(false); // Track if intro has been spoken
  
  // Load user preferences
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
    setVoiceGender(userData.voicePreference || 'female');
  }, []);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // CLEANUP - Only when user is exiting
  const cleanup = () => {
    // NEW: Don't cleanup if we haven't even started yet!
    if (!conversationStarted) {
      console.log('⚠️ Conversation not started yet, ignoring cleanup');
      return;
    }
    
    // Don't cleanup if we're actively speaking the intro
    if (isAISpeaking && messages.length <= 1) {
      console.log('⚠️ Still speaking intro, ignoring cleanup');
      return;
    }
    
    if (cleanupCalledRef.current) {
      console.log('⚠️ Cleanup already in progress');
      return;
    }
    
    cleanupCalledRef.current = true;
    console.log('🧹 CLEANUP - User is exiting');
    
    // 0. Cancel any active speech synthesis
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('✅ Speech synthesis KILLED');
      }
    } catch (e) {
      console.log('Speech synthesis cleanup error:', e);
    }
    
    // 1. KILL speech recognition IMMEDIATELY
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current = null;
        console.log('✅ Recognition KILLED');
      }
    } catch (e) {
      console.log('Recognition cleanup error:', e);
    }
    
    // 2. KILL Web Speech synthesis IMMEDIATELY (already done above)
    
    // 3. KILL ElevenLabs audio IMMEDIATELY
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.srcObject = null;
        audioRef.current.load();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
        console.log('✅ ElevenLabs audio KILLED');
      }
    } catch (e) {
      console.log('Audio cleanup error:', e);
    }
    
    // 4. KILL ALL audio elements on entire page
    try {
      const allAudio = document.querySelectorAll('audio');
      console.log(`Found ${allAudio.length} audio elements to kill`);
      allAudio.forEach((audio, index) => {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';
          audio.srcObject = null;
          audio.load();
          audio.remove();
          console.log(`✅ Killed audio element ${index + 1}`);
        } catch (e) {
          console.log(`Error killing audio ${index + 1}:`, e);
        }
      });
    } catch (e) {
      console.log('Error finding audio elements:', e);
    }
    
    // 5. Reset all states
    setIsListening(false);
    setIsAISpeaking(false);
    setIsGeneratingAudio(false);
    hasSpokenRef.current = false;
    
    console.log('✅✅✅ CLEANUP COMPLETE ✅✅✅');
    
    // Reset cleanup flag after delay
    setTimeout(() => {
      cleanupCalledRef.current = false;
    }, 1000);
  };
  
  // Cleanup on unmount only
  useEffect(() => {
    console.log('🎬 VoicePracticeScreen mounted');
    
    return () => {
      console.log('🔚 VoicePracticeScreen unmounting - cleanup now');
      
      // Force cleanup on unmount
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (e) {
          console.log('Recognition cleanup error:', e);
        }
      }
      
      if (window.speechSynthesis) {
        try { 
          window.speechSynthesis.cancel();
        } catch (e) {
          console.log('Speech cleanup error:', e);
        }
      }
      
      if (audioRef.current) {
        try { 
          audioRef.current.pause();
          audioRef.current = null;
        } catch (e) {
          console.log('Audio cleanup error:', e);
        }
      }
    };
  }, []); // Empty deps - only run on mount/unmount
  
  // NO automatic cleanup - only on unmount
  
  // Start conversation automatically - PREVENT DUPLICATES
  useEffect(() => {
    if (activeScenario && !conversationStarted && !hasSpokenRef.current) {
      console.log('🎬 Starting conversation for first time');
      hasSpokenRef.current = true;
      setConversationStarted(true);
      
      const introMessage = {
        id: Date.now(),
        role: 'ai',
        text: activeScenario.context || "Hi! I'm Cue, your social coach. Let's get started with a conversation!",
        timestamp: new Date(),
        audioPlayed: false,
        phase: 'intro'
      };
      
      console.log('📨 Intro message:', introMessage);
      setIsInitializing(false);
      setMessages([introMessage]);
      setCurrentPhase('practice');
      
      // AUTO-START SPEAKING IMMEDIATELY (ONLY ONCE)
      console.log('🎬 Auto-starting Cue speech');
      setIsAISpeaking(true);
      setIsGeneratingAudio(true);
      
      // Small delay to ensure component is mounted, with cleanup check
      const speakTimeout = setTimeout(() => {
        if (!cleanupCalledRef.current) {
          console.log('🔊 Speaking intro (ONCE ONLY)');
          speakText(introMessage.text, () => {
            setIsAISpeaking(false);
            setIsGeneratingAudio(false);
            // Auto-enable mic after Cue finishes intro
            setTimeout(() => {
              if (!cleanupCalledRef.current && !isListening && recognitionRef.current) {
                console.log('🎤 Auto-enabling microphone');
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (error) {
                  console.error('Error starting recognition:', error);
                }
              }
            }, 500);
          });
        } else {
          console.log('⚠️ Cleanup called, skipping intro');
        }
      }, 300);
      
      // Cleanup function to prevent duplicate
      return () => {
        clearTimeout(speakTimeout);
      };
    }
  }, [activeScenario]); // ONLY depend on scenario
  
  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        console.log('✅ Final transcript:', transcript);
        handleUserMessage(transcript);
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      console.log('Recognition ended');
      setIsListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };
  
  const handleUserMessage = (text) => {
    if (!text.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: text,
      timestamp: new Date(),
      phase: currentPhase
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      generateAIResponse(text);
    }, 1000);
  };
  
  const generateAIResponse = async (userText) => {
    console.log('🤖 Generating AI response for:', userText.substring(0, 50));
    
    // Count user messages
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const exchangeNumber = userMessageCount + 1;
    
    console.log(`📊 Exchange #${exchangeNumber} of ${MAX_EXCHANGES}`);
    
    // Check if we're near the end or at the end
    const isNearEnd = userMessageCount >= MAX_EXCHANGES - 2;
    const isEnd = userMessageCount >= MAX_EXCHANGES;
    
    // Temporarily pause mic while AI speaks
    if (isListening) {
      console.log('⏸️ Pausing mic while AI generates response');
      try {
        recognitionRef.current?.stop();
        setIsListening(false);
      } catch (e) {
        console.log('Could not pause recognition:', e);
      }
    }
    
    setIsAISpeaking(true);
    setIsGeneratingAudio(true);
    
    try {
      // Calculate performance metrics
      const performance = {
        totalTurns: messages.length,
        successfulExchanges: messages.filter(m => m.role === 'ai').length,
        averageResponseTime: 2000
      };
      
      let responseText;
      
      if (isEnd) {
        // Natural ending
        const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
        const language = userData.language || 'english';
        
        responseText = language === 'spanish'
          ? "¡Excelente práctica! Hiciste un gran trabajo hoy. ¿Listo para intentar otro escenario?"
          : "Great practice session! You did really well today. Ready to try another scenario?";
        
        console.log('🎉 Session complete!');
        
        // Navigate back after completion
        setTimeout(() => {
          console.log('🔄 Navigating back to scenarios');
          if (onComplete) onComplete();
        }, 5000);
        
      } else {
        // Call Claude API via backend
        console.log('📡 Calling Claude API...');
        const response = await fetch('http://localhost:3001/api/voice/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationHistory: messages,
            scenario: activeScenario,
            gradeLevel: gradeLevel,
            phase: currentPhase,
            performance: performance,
            conversationId: activeScenario.id,
            timestamp: new Date().toISOString(),
            isNearEnd: isNearEnd
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        responseText = data.response || "That's interesting! Tell me more about that.";
      }
      
      console.log('💬 AI response:', responseText);
      
      const aiMessage = {
        id: Date.now(),
        role: 'ai',
        text: responseText,
        timestamp: new Date(),
        audioPlayed: false,
        phase: data.nextPhase || currentPhase
      };
      
      setCurrentPhase(data.nextPhase || currentPhase);
      setMessages(prev => [...prev, aiMessage]);
      
      // Play audio
      speakText(responseText, () => {
        console.log('🔊 AI finished speaking');
        setIsAISpeaking(false);
        setIsGeneratingAudio(false);
        
        // Restart mic only if not at end
        if (!isEnd) {
          setTimeout(() => {
            if (!cleanupCalledRef.current && !isListening) {
              console.log('🔄 Auto-restarting mic for next turn');
              toggleListening();
            }
          }, 500);
        } else {
          console.log('✅ Practice session complete - not restarting mic');
        }
      });
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if API fails
      const fallbackResponses = [
        "That's interesting! Tell me more about that.",
        "I like how you're thinking about this. What would you do next?",
        "Great job expressing yourself! How did that make you feel?",
        "That's a really good point. What would you do in that situation?"
      ];
      
      const responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const aiMessage = {
        id: Date.now(),
        role: 'ai',
        text: responseText,
        timestamp: new Date(),
        audioPlayed: false,
        phase: currentPhase
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Count user messages for exchange tracking
      const userMessageCount = messages.filter(m => m.role === 'user').length;
      const isEnd = userMessageCount >= MAX_EXCHANGES;
      
      // Play audio
      speakText(responseText, () => {
        console.log('🎤 AI finished speaking (fallback)');
        setIsAISpeaking(false);
        setIsGeneratingAudio(false);
        
        // Restart mic only if not at end
        if (!isEnd) {
          setTimeout(() => {
            if (!cleanupCalledRef.current && !isListening) {
              console.log('🔄 Auto-restarting mic after fallback');
              toggleListening();
            }
          }, 500);
        } else {
          console.log('✅ Practice session complete (fallback) - not restarting mic');
        }
      });
    }
  };
  
  const speakText = async (text, onComplete) => {
    console.log('🎤 speakText called with:', text.substring(0, 50));
    console.log('🔑 API Key present:', !!ELEVENLABS_API_KEY);
    console.log('🔑 API Key starts with sk_:', ELEVENLABS_API_KEY?.startsWith('sk_'));
    
    // Check if we should abort immediately
    if (cleanupCalledRef.current) {
      console.log('⚠️ Cleanup was called, aborting speech immediately');
      if (onComplete) onComplete();
      return;
    }
    
    try {
      setIsGeneratingAudio(true);
      
      // Get user preferences
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      const voiceGenderPref = userData.voicePreference || 'female';
      const language = userData.language || 'english';
      
      console.log('🔊 Cue speaking:', { 
        text: text.substring(0, 50), 
        language, 
        voiceGenderPref 
      });
      
      console.log('👤 Voice settings:', { language, voiceGender: voiceGenderPref });
      
      // Check if ElevenLabs API key is available
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your-api-key-here') {
        console.warn('⚠️ No valid ElevenLabs API key! Falling back to Web Speech API');
        if (!cleanupCalledRef.current) {
          fallbackWebSpeech(text, onComplete, language);
        }
        return;
      }
      
      // Get voice ID
      const voiceId = ELEVENLABS_VOICE_IDS[language]?.[voiceGenderPref] || ELEVENLABS_VOICE_IDS.english.female;
      console.log('🎯 Selected voice ID:', voiceId);
      console.log('📡 Calling ElevenLabs API...');
      
      // Check again before fetch
      if (cleanupCalledRef.current) {
        console.log('⚠️ Cleanup called before fetch, aborting');
        if (onComplete) onComplete();
        return;
      }
      
      // Use multilingual model for Spanish
      const modelId = language === 'spanish' ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1';
      
      // Call ElevenLabs API
      console.log('📡 Making fetch request to ElevenLabs...');
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        }
      );
      
      console.log('📡 ElevenLabs response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      console.log('✅ Got audio from ElevenLabs, creating blob...');
      
      // Convert response to audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Audio generated, size:', audioBlob.size, 'bytes');
      
      // Check again before creating audio element
      if (cleanupCalledRef.current) {
        console.log('⚠️ Cleanup called after fetch, aborting');
        URL.revokeObjectURL(audioUrl);
        if (onComplete) onComplete();
        return;
      }
      
      setIsGeneratingAudio(false);
      
      // IMPORTANT: Store audio reference for cleanup
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        console.log('🎵 Audio metadata loaded, duration:', audio.duration, 'seconds');
      };
      
      audio.oncanplay = () => {
        console.log('✅ Audio ready to play');
      };
      
      audio.onplay = () => {
        console.log('▶️ Audio started playing');
      };
      
      audio.onended = () => {
        console.log('🔇 Audio finished playing');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null; // Clear reference
        if (onComplete) onComplete();
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null; // Clear reference
        if (onComplete) onComplete();
      };
      
      // Final check before playing
      if (cleanupCalledRef.current) {
        console.log('⚠️ Cleanup called before play, aborting');
        URL.revokeObjectURL(audioUrl);
        if (onComplete) onComplete();
        return;
      }
      
      console.log('▶️ Starting audio playback...');
      await audio.play();
      console.log('✅ Audio is playing!');
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      console.log('🔄 Falling back to Web Speech API...');
      setIsGeneratingAudio(false);
      
      // Get user language preference for fallback
      const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
      const language = userData.language || 'english';
      
      if (!cleanupCalledRef.current) {
        fallbackWebSpeech(text, onComplete, language);
      }
    }
  };
  
  const fallbackWebSpeech = (text, onComplete, language = 'english') => {
    console.log('🎤 Using Web Speech API fallback');
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on preference
      utterance.lang = language === 'spanish' ? 'es-US' : 'en-US';
      console.log('🌍 Setting language to:', utterance.lang);
      
      // Try to find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.includes(language === 'spanish' ? 'es-US' : 'en-US')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('🎤 Using voice:', preferredVoice.name);
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        if (onComplete) onComplete();
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      if (onComplete) onComplete();
    }
  };
  
  const handleExit = () => {
    console.log('🚪 Exit button clicked - FORCE CLEANUP');
    
    // FORCE cleanup multiple times to be sure
    cleanup();
    setTimeout(() => cleanup(), 50);
    setTimeout(() => cleanup(), 100);
    setTimeout(() => cleanup(), 200);
    
    // Clear hasSpokenRef so it can speak again if user comes back
    hasSpokenRef.current = false;
    
    // Navigate after cleanup
    if (onExit) {
      setTimeout(() => {
        onExit();
      }, 300);
    }
  };
  
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-lg">Starting conversation...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0">
        <div className="flex-1">
          <h2 className="font-bold text-lg">{activeScenario?.title || 'Voice Practice'}</h2>
          <p className="text-xs text-white/80">{activeScenario?.category || 'Practice'}</p>
        </div>
        <button
          onClick={handleExit}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Exchange Counter */}
      <div className="absolute top-4 right-4 z-50">
        <div className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
          Exchange {messages.filter(m => m.role === 'user').length}/{MAX_EXCHANGES}
        </div>
      </div>
      
      {/* Status Indicator */}
      {(isListening || isAISpeaking || isGeneratingAudio) && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-full border ${
            isListening 
              ? 'bg-emerald-500/90 border-emerald-400' 
              : isGeneratingAudio
              ? 'bg-yellow-500/90 border-yellow-400'
              : 'bg-blue-500/90 border-blue-400'
          }`}>
            <span className="text-sm text-white flex items-center gap-2">
              {isListening ? (
                <>
                  <Mic className="w-4 h-4 animate-pulse" />
                  Listening...
                </>
              ) : isGeneratingAudio ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating audio...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  AI Speaking...
                </>
              )}
            </span>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Waiting for conversation to start...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Mic Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
      <button
          onClick={toggleListening}
          disabled={isAISpeaking}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-emerald-500 animate-pulse scale-110'
              : isAISpeaking
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }`}
        >
          {isListening ? (
            <Mic className="w-10 h-10 text-white" />
          ) : (
            <MicOff className="w-10 h-10 text-white" />
          )}
      </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          {isAISpeaking ? 'AI speaking...' : isListening ? 'Listening...' : 'Tap to speak'}
      </p>
      </div>
    </div>
  );
};

// AGGRESSIVE memo - NEVER re-render
// Prevent re-renders when props haven't meaningfully changed
export default React.memo(VoicePracticeScreen, (prevProps, nextProps) => {
  // Return true if props are equal (don't re-render)
  // Return false if props changed (do re-render)
  
  const scenarioSame = prevProps.scenario?.id === nextProps.scenario?.id;
  const gradeSame = prevProps.gradeLevel === nextProps.gradeLevel;
  const voiceSame = prevProps.voiceGender === nextProps.voiceGender;
  const completeSame = prevProps.onComplete === nextProps.onComplete;
  const exitSame = prevProps.onExit === nextProps.onExit;
  
  const shouldSkipRender = scenarioSame && gradeSame && voiceSame && completeSame && exitSame;
  
  if (!shouldSkipRender) {
    console.log('🔄 Props changed, re-rendering VoicePracticeScreen:', {
      scenarioChanged: !scenarioSame,
      gradeChanged: !gradeSame,
      voiceChanged: !voiceSame,
      completeChanged: !completeSame,
      exitChanged: !exitSame
    });
  }
  
  return shouldSkipRender;
});

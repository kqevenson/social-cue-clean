import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, Mic, Loader } from 'lucide-react';
import CleanVoiceService from '../services/CleanVoiceService';
import { textToSpeechElevenLabs } from '../services/elevenLabsService';

const ElevenLabsVoiceOrb = ({
  scenario,
  gradeLevel = '6-8',
  onClose
}) => {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [introExchangeCount, setIntroExchangeCount] = useState(0);
  const [isInCharacterMode, setIsInCharacterMode] = useState(false);
  const [characterRole, setCharacterRole] = useState(null);
  const [characterExchangeCount, setCharacterExchangeCount] = useState(0);

  // Refs
  const recognitionRef = useRef(null);
  const hasSpokenIntroRef = useRef(false);
  const currentAudioRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);

  // Initialize once on mount
  useEffect(() => {
    initializeSpeechRecognition();

    setTimeout(() => {
      if (!hasSpokenIntroRef.current) {
        speakIntro();
        hasSpokenIntroRef.current = true;
      }
    }, 800);

    return cleanup;
  }, []);

  const cleanup = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Mic started - listening...');
      recognitionActiveRef.current = true;
      setIsListening(true);
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event) => {
      console.log('🎤 Got speech result');
      
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcriptPiece + ' ';
          console.log('✅ Final transcript so far:', finalTranscriptRef.current);
        } else {
          interimTranscript += transcriptPiece;
          console.log('⏳ Interim:', interimTranscript);
        }
      }
      
      // Show live transcript
      const displayText = finalTranscriptRef.current + interimTranscript;
      setTranscript(displayText.trim());
      
      // Reset silence timer on each result
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // Stop after 3 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        console.log('⏱️ 3 seconds of silence detected - stopping');
        if (recognitionRef.current && recognitionActiveRef.current) {
          recognitionRef.current.stop();
        }
      }, 3000);
    };

    recognition.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      
      // Don't stop on "no-speech" error
      if (event.error === 'no-speech') {
        console.log('ℹ️ No speech detected, but keeping mic open');
        return;
      }
      
      recognitionActiveRef.current = false;
      setIsListening(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      recognitionActiveRef.current = false;
      setIsListening(false);
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Send the final transcript
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        console.log('📤 Sending transcript:', finalText);
        handleUserMessage(finalText);
      }
      
      finalTranscriptRef.current = '';
      setTranscript('');
    };

    recognitionRef.current = recognition;
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current || recognitionActiveRef.current || isSpeaking || isThinking) {
      console.log('❌ Cannot start - already active or busy');
      return;
    }

    finalTranscriptRef.current = '';
    setTranscript('');

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        console.log('✅ Mic permission granted');
        try {
          recognitionRef.current.start();
          console.log('🎤 Started listening - speak now!');
        } catch (err) {
          console.error('❌ Mic start error:', err);
          recognitionActiveRef.current = false;
          setIsListening(false);
        }
      })
      .catch((err) => {
        console.error('❌ Mic permission denied:', err);
      });
  }, [isSpeaking, isThinking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && recognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping:', e);
      }
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const speakWithElevenLabs = async (text) => {
    const safeText = text.replace(/\s+/g, ' ').trim();
    if (!safeText) return;

    try {
      stopListening();
      setIsSpeaking(true);
      setAiText(safeText);

      console.log('🔊 Speaking:', safeText);
      const audioUrl = await textToSpeechElevenLabs(safeText, gradeLevel);
      
      if (!audioUrl) {
        setIsSpeaking(false);
        return;
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        console.log('✅ Finished speaking');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;

        setTimeout(() => {
          if (currentPhase !== 'complete') {
            startListening();
          }
        }, 500);
      };

      await audio.play();
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const speakIntro = async () => {
    console.log('📖 Getting curriculum intro...');
    
    try {
      const aiData = await CleanVoiceService.generateResponse({
        conversationHistory: [],
        scenario: scenario,
        gradeLevel: gradeLevel,
        phase: 'intro'
      });

      const intro = aiData?.aiResponse || aiData?.text || aiData?.response || 
                    `Let's practice ${scenario?.title}. Ready?`;
      
      console.log('✅ Got curriculum intro:', intro);
      
      setMessages([{ role: 'assistant', content: intro }]);
      setCurrentPhase('intro');
      setIntroExchangeCount(0);
      
      await speakWithElevenLabs(intro);
    } catch (error) {
      console.error('❌ Error getting intro:', error);
      const fallbackIntro = `Let's practice ${scenario?.title || 'conversation skills'}. Ready?`;
      setMessages([{ role: 'assistant', content: fallbackIntro }]);
      await speakWithElevenLabs(fallbackIntro);
    }
  };

  const handleUserMessage = async (text) => {
    if (!text?.trim() || isThinking || isSpeaking) return;

    console.log('\n═══════════════════════════════════════');
    console.log('📥 USER MESSAGE:', text);
    console.log('📍 Current phase:', currentPhase);
    console.log('📊 Intro exchanges:', introExchangeCount);
    console.log('💬 Total messages:', messages.length);
    console.log('═══════════════════════════════════════\n');

    setIsThinking(true);

    try {
      const userMessage = { role: 'user', content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      let phaseToUse = currentPhase;
      let characterModeActive = isInCharacterMode;
      let role = characterRole;

      if (currentPhase === 'intro') {
        const newIntroCount = introExchangeCount + 1;
        setIntroExchangeCount(newIntroCount);
        
        console.log('📊 Intro exchange:', newIntroCount, 'of 2');
        
        if (newIntroCount >= 2) {
          console.log('🚀 TRANSITIONING: intro → practice');
          
          phaseToUse = 'practice';
          role = scenario?.aiRole || 'friend';
          characterModeActive = true;
          
          setCurrentPhase('practice');
          setIsInCharacterMode(true);
          setCharacterRole(role);
          setCharacterExchangeCount(0);
        }
      }

      if (phaseToUse === 'practice' && characterModeActive) {
        setCharacterExchangeCount(prev => prev + 1);
      }

      const aiData = await CleanVoiceService.generateResponse({
        conversationHistory: updatedMessages,
        scenario,
        gradeLevel,
        phase: phaseToUse
      });

      const textToSpeak = aiData?.aiResponse || '';

      if (!textToSpeak) {
        console.error('❌ No AI response');
        setIsThinking(false);
        return;
      }

      console.log('💬 AI response:', textToSpeak);

      setMessages(prev => [...prev, { role: 'assistant', content: textToSpeak }]);
      
      if (aiData.phase && aiData.phase !== phaseToUse) {
        setCurrentPhase(aiData.phase);

        if (aiData.phase === 'feedback' || aiData.phase === 'complete') {
          setIsInCharacterMode(false);
          setCharacterRole(null);
        }
      }

      setTranscript('');
      setIsThinking(false);

      await speakWithElevenLabs(textToSpeak);

      if (aiData.phase === 'complete' || aiData.shouldContinue === false) {
        setTimeout(() => stopListening(), 2000);
      }

    } catch (error) {
      console.error('❌ Conversation error:', error);
      setIsThinking(false);
      
      const fallback = "I'm having trouble. Can you say that again?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      
      try {
        await speakWithElevenLabs(fallback);
      } catch (e) {
        setTimeout(startListening, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{scenario.title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              Grade {gradeLevel} • Phase: {currentPhase}
              {currentPhase === 'intro' && ` (${introExchangeCount}/2)`}
              {isInCharacterMode && ` • 🎭 ${characterRole}`}
            </p>
          </div>
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Orb */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {(isListening || isSpeaking || isThinking) && (
            <>
              <div className="absolute inset-0 -m-12 rounded-full bg-blue-500 opacity-10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 -m-8 rounded-full bg-emerald-500 opacity-15 animate-ping" style={{ animationDuration: '2.5s' }} />
            </>
          )}

          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isSpeaking ? 'bg-gradient-to-br from-blue-500 to-emerald-400 scale-110' :
            isThinking ? 'bg-gradient-to-br from-purple-600 to-blue-500 scale-105' :
            isListening ? 'bg-gradient-to-br from-blue-600 to-emerald-500 scale-105' :
            'bg-gradient-to-br from-gray-700 to-gray-800'
          }`}>
            <div className={`absolute inset-6 rounded-full ${
              (isSpeaking || isThinking || isListening) ? 'bg-white/30 animate-pulse' : 'bg-white/5'
            }`} />
            
            <div className="relative z-10">
              {isThinking ? <Loader className="w-20 h-20 text-white animate-spin" /> :
               isSpeaking ? <Volume2 className="w-20 h-20 text-white" /> :
               isListening ? <Mic className="w-20 h-20 text-white" /> :
               <Mic className="w-20 h-20 text-gray-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="absolute bottom-32 left-0 right-0 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          {aiText && !isThinking && (
            <div className="animate-fadeIn">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {currentPhase === 'intro' ? 'Cue (Coach)' : 
                 isInCharacterMode ? characterRole : 'AI Coach'}
              </p>
              <p className="text-base text-gray-300">{aiText}</p>
            </div>
          )}
          {transcript && (
            <div className="animate-fadeIn">
              <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">You're saying...</p>
              <p className="text-base text-blue-400">{transcript}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm font-medium">
            {isThinking ? <span className="text-purple-400">🧠 Thinking...</span> :
             isSpeaking ? <span className="text-blue-400">🎤 {
               currentPhase === 'intro' ? 'Cue speaking...' :
               isInCharacterMode ? `${characterRole} speaking...` : 
               'AI Coach speaking...'
             }</span> :
             isListening ? <span className="text-emerald-400">👂 Listening... (speak and pause when done)</span> :
             <span>⏳ Starting...</span>}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default ElevenLabsVoiceOrb;
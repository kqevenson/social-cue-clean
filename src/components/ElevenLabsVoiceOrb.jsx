import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Mic, Loader } from 'lucide-react';
import { generateConversationResponse } from '../services/openaiService';
import { textToSpeechElevenLabs } from '../services/elevenLabsService';

const ElevenLabsVoiceOrb = ({ scenario, gradeLevel = '6-8', onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('intro');

  const recognitionRef = useRef(null);
  const hasSpokenIntroRef = useRef(false);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    initializeSpeechRecognition();

    // Speak intro after short delay
    setTimeout(() => {
      if (!hasSpokenIntroRef.current) {
        speakIntro();
        hasSpokenIntroRef.current = true;
      }
    }, 800);

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;

      if (text.trim()) {
        console.log('🎤 User said:', text);
        setTranscript(text);
        handleUserMessage(text);
      }
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
        setError('Trouble hearing you. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if we should be listening
      if (isListening && !isSpeaking && !isThinking) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }, 100);
      }
    };
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log('👂 Started listening');
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Could not start microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    setIsListening(false);
  };

  const speakWithElevenLabs = async (text) => {
    try {
      // Stop listening while AI speaks
      stopListening();
      setIsSpeaking(true);
      setAiText(text);

      console.log('🔊 Generating speech with ElevenLabs...');
      const audioUrl = await textToSpeechElevenLabs(text, gradeLevel);

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        console.log('🎵 AI started speaking');
      };

      audio.onended = () => {
        console.log('✅ AI finished speaking');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        
        // Resume listening after a short delay
        setTimeout(() => {
          if (currentPhase !== 'complete') {
            startListening();
          }
        }, 600);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        setError('Audio playback failed. Please try again.');
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        
        // Still resume listening
        setTimeout(() => startListening(), 600);
      };

      await audio.play();

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      setError('Could not generate speech. Please try again.');
      
      // Resume listening even on error
      setTimeout(() => startListening(), 600);
    }
  };

  const speakIntro = async () => {
    const gradeIntros = {
      'k-2': `Hi! I'm your practice buddy. Today we're going to practice ${scenario.title}. Are you ready to try?`,
      '3-5': `Hey! Let's practice ${scenario.title} together. I'll help you along the way. Ready?`,
      '6-8': `Hi! Today we'll work on ${scenario.title}. We'll practice together. Ready to begin?`,
      '9-12': `Welcome! Let's practice ${scenario.title}. We'll simulate a realistic conversation. Shall we start?`
    };

    const intro = gradeIntros[gradeLevel] || gradeIntros['6-8'];
    
    const introMessage = {
      role: 'assistant',
      content: intro
    };
    setMessages([introMessage]);

    await speakWithElevenLabs(intro);
  };

  const handleUserMessage = async (text) => {
    if (!text?.trim() || isThinking || isSpeaking) return;

    // Stop listening while processing
    stopListening();
    setIsThinking(true);
    setError(null);

    try {
      // Add user message
      const userMessage = {
        role: 'user',
        content: text.trim()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      console.log('🤖 Calling OpenAI with', updatedMessages.length, 'messages');

      // Get AI response from OpenAI
      const aiData = await generateConversationResponse({
        conversationHistory: updatedMessages,
        scenario: scenario,
        gradeLevel: gradeLevel,
        currentPhase: currentPhase
      });

      console.log('✅ OpenAI response:', aiData.aiResponse);
      console.log('📍 Phase:', aiData.phase);

      // Add AI message
      const aiMessage = {
        role: 'assistant',
        content: aiData.aiResponse
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update phase if changed
      if (aiData.phase && aiData.phase !== currentPhase) {
        setCurrentPhase(aiData.phase);
      }

      setTranscript(''); // Clear transcript
      setIsThinking(false);

      // Speak AI response
      await speakWithElevenLabs(aiData.aiResponse);

      // Check if conversation is complete
      if (aiData.phase === 'complete') {
        setTimeout(() => {
          stopListening();
          // Could show completion screen here
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error in conversation:', error);
      setIsThinking(false);
      
      // Fallback response
      const fallbackMessage = {
        role: 'assistant',
        content: "I'm having a little trouble right now. Can you try saying that again?"
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      // Try to speak the fallback
      try {
        await speakWithElevenLabs(fallbackMessage.content);
      } catch (speakError) {
        console.error('Fallback speech failed:', speakError);
        setError('Connection issue. Please try again.');
        setTimeout(() => startListening(), 1000);
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
              Voice Practice • Grade {gradeLevel} • Phase: {currentPhase}
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
          {/* Outer pulsing rings */}
          {(isListening || isSpeaking || isThinking) && (
            <>
              <div
                className="absolute inset-0 -m-12 rounded-full bg-blue-500 opacity-10 animate-ping"
                style={{ animationDuration: '2s' }}
              />
              <div
                className="absolute inset-0 -m-8 rounded-full bg-emerald-500 opacity-15 animate-ping"
                style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
              />
            </>
          )}

          {/* Main orb */}
          <div
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              isSpeaking
                ? 'bg-gradient-to-br from-blue-500 via-blue-400 to-emerald-400 scale-110 shadow-blue-500/50'
                : isThinking
                ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 scale-105 shadow-purple-500/50'
                : isListening
                ? 'bg-gradient-to-br from-blue-600 via-emerald-600 to-emerald-500 scale-105 shadow-emerald-500/50'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 scale-100 shadow-gray-900/50'
            }`}
          >
            {/* Inner glow */}
            <div
              className={`absolute inset-6 rounded-full transition-all duration-500 ${
                isSpeaking
                  ? 'bg-white/30 animate-pulse'
                  : isThinking
                  ? 'bg-white/25 animate-pulse'
                  : isListening
                  ? 'bg-white/20 animate-pulse'
                  : 'bg-white/5'
              }`}
              style={{ animationDuration: isSpeaking ? '1s' : isThinking ? '1.5s' : '2s' }}
            />

            {/* Icon */}
            <div className="relative z-10">
              {isThinking ? (
                <Loader className="w-20 h-20 text-white drop-shadow-lg animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-20 h-20 text-white drop-shadow-lg" />
              ) : isListening ? (
                <Mic className="w-20 h-20 text-white drop-shadow-lg" />
              ) : (
                <Mic className="w-20 h-20 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="absolute bottom-32 left-0 right-0 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          {aiText && !isThinking && (
            <div className="animate-fadeIn">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Coach</p>
              <p className="text-base text-gray-300 leading-relaxed">{aiText}</p>
            </div>
          )}
          {transcript && (
            <div className="animate-fadeIn">
              <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">You said</p>
              <p className="text-base text-blue-400 leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-4xl mx-auto text-center">
          {error ? (
            <p className="text-red-400 text-sm font-medium">{error}</p>
          ) : (
            <p className="text-gray-400 text-sm font-medium">
              {isThinking ? (
                <span className="text-purple-400">🧠 Thinking...</span>
              ) : isSpeaking ? (
                <span className="text-blue-400">🎤 AI Coach is speaking...</span>
              ) : isListening ? (
                <span className="text-emerald-400">👂 Listening... speak naturally</span>
              ) : (
                <span>⏳ Starting...</span>
              )}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ElevenLabsVoiceOrb;
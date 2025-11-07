import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, Loader2 } from 'lucide-react';
import { generateConversationResponse } from '../services/openaiService';
import { textToSpeechElevenLabs } from '../services/elevenLabsService';

const ChatGPTVoiceChat = ({ scenario, gradeLevel = '6-8', onComplete, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('intro');
  
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    console.log('🎓 ChatGPT Voice Chat initialized with grade:', gradeLevel, 'scenario:', scenario?.title);
  }, [gradeLevel, scenario]);

  useEffect(() => {
    initializeSpeechRecognition();
    speakIntro();

    return () => {
      cleanup();
    };
  }, [scenario, gradeLevel]);

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Keep listening
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      
      if (text.trim()) {
        handleUserMessage(text);
      }
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Ignore no-speech errors, just keep listening
        return;
      }
      console.error('Speech error:', event.error);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };
  };

  const speakIntro = async () => {
    try {
      const introText = `Hi! I'm your practice buddy. Today we're going to practice ${scenario.title}. Are you ready to begin?`;
      const introMessage = { role: 'assistant', content: introText };
      setMessages([introMessage]);

      setIsSpeaking(true);
      const audioUrl = await textToSpeechElevenLabs(introText, gradeLevel);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        startListening();
      };

      audio.onerror = (audioError) => {
        console.error('Intro playback error:', audioError);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        startListening();
      };

      await audio.play();
    } catch (err) {
      console.error('Intro speech error:', err);
      setIsSpeaking(false);
      startListening();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recognition:', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleUserMessage = async (text) => {
    if (!text?.trim()) return;

    stopListening();

    console.log('📝 User said:', text.trim());

    const userMessage = {
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    console.log('🤖 Sending to OpenAI with history:', [...messages, userMessage].length, 'messages');
    console.log('📊 Current phase:', currentPhase);
    console.log('🎓 Grade level:', gradeLevel);

    try {
      const aiData = await generateConversationResponse({
        conversationHistory: [...messages, userMessage],
        scenario,
        gradeLevel,
        currentPhase,
      });

      const aiMessage = {
        role: 'assistant',
        content: aiData.aiResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (aiData.phase && aiData.phase !== currentPhase) {
        setCurrentPhase(aiData.phase);
      }

      console.log('✅ OpenAI response:', aiData.aiResponse);
      console.log('📍 New phase:', aiData.phase);

      setIsSpeaking(true);
      const audioUrl = await textToSpeechElevenLabs(aiData.aiResponse, gradeLevel);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);

        if (aiData.phase === 'complete') {
          setTimeout(() => {
            if (onComplete) {
              onComplete({
                messages: [...messages, userMessage, aiMessage],
                scenario,
                phase: 'complete',
              });
            }
          }, 1000);
        } else {
          startListening();
        }
      };

      audio.onerror = (audioError) => {
        console.error('Audio playback error:', audioError);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        startListening();
      };

      await audio.play();
    } catch (err) {
      console.error('Error in conversation:', err);
      setError('Sorry, I had trouble understanding. Can you try again?');

      const fallbackMessage = {
        role: 'assistant',
        content: "I'm having a little trouble right now. Can you try saying that again?",
      };

      setMessages((prev) => [...prev, fallbackMessage]);

      try {
        setIsSpeaking(true);
        const fallbackAudioUrl = await textToSpeechElevenLabs(fallbackMessage.content, gradeLevel);
        const fallbackAudio = new Audio(fallbackAudioUrl);
        audioRef.current = fallbackAudio;

        fallbackAudio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(fallbackAudioUrl);
          startListening();
        };

        fallbackAudio.onerror = (audioError) => {
          console.error('Fallback audio failed:', audioError);
          setIsSpeaking(false);
          URL.revokeObjectURL(fallbackAudioUrl);
          startListening();
        };

        await fallbackAudio.play();
      } catch (fallbackAudioError) {
        console.error('Fallback audio generation failed:', fallbackAudioError);
        setIsSpeaking(false);
        startListening();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{scenario.title}</h2>
            <p className="text-gray-400 text-sm mt-1">Voice Practice with AI Coach</p>
          </div>
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-gray-400 mb-1">COACH CUE</div>
                )}
                <p className="text-sm md:text-base">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pb-4">
          <div className="max-w-4xl mx-auto bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">
              {isSpeaking ? (
                <>🎤 AI Coach is speaking...</>
              ) : isListening ? (
                <>👂 Listening... speak naturally</>
              ) : isProcessing ? (
                <>⏳ Processing...</>
              ) : (
                <>🎤 Microphone ready</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 backdrop-blur-xl border-t border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6">
          {/* Always-on indicator */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-700'
            }`}>
              <Mic className="w-8 h-8 text-white" />
            </div>
            
            {isSpeaking && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-500 animate-pulse">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          Microphone is always on - just speak naturally!
        </p>
      </div>
    </div>
  );
};

export default ChatGPTVoiceChat;

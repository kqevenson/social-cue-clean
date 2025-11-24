import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
import useVoiceConversation from '../hooks/useVoiceConversation';
import { UserProfile } from '../utils/userProfile';
import { sendVoiceToAI, getUserId } from '../services/voiceConversationApi';

// Convert Blob to Base64 for Hume
async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

const ChatGPTVoiceChat = ({ scenario, onClose }) => {
  const gradeLevel = UserProfile.getGrade() || '6';
  const [userInput, setUserInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const normalizedScenario = useMemo(() => {
    if (!scenario) {
      return {
        title: 'Voice Practice',
        category: 'conversation-starters',
        description: 'Practice real conversations with your AI coach.'
      };
    }
    return scenario;
  }, [scenario]);

  const voiceConversation = useVoiceConversation({
    scenario: normalizedScenario,
    gradeLevel,
    onComplete: () => {
      console.log('✅ Session saved!');
    }
  });

  const {
    messages,
    isAIThinking,
    startConversation,
    sendUserMessage,
    endConversation,
    error,
    currentPhase
  } = voiceConversation || {};

  useEffect(() => {
    if (!hasStarted) {
      console.log('🔁 Triggering startConversation with:', { gradeLevel, normalizedScenario });

      startConversation()
        .then(() => {
          console.log('🎯 Starting practice for:', normalizedScenario.title);
        })
        .catch((err) => console.error('Failed to start conversation', err));
      setHasStarted(true);
    }
  }, [hasStarted, normalizedScenario.title, startConversation]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!userInput.trim()) return;
    
    // TODO: When audio recording is implemented, capture audioBlob here
    // Example: const audioBlob = await recordAudio();
    // const audioBase64 = await blobToBase64(audioBlob);
    
    // For now, send text-only message
    // When audio is available, uncomment below to send with emotion analysis
    /*
    let audioBase64 = null;
    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
      
      // Send to backend for emotion analysis
      try {
        const userId = getUserId();
        const conversationHistory = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text || m.content
        }));
        
        const response = await sendVoiceToAI({
          conversationHistory,
          scenario: normalizedScenario,
          gradeLevel,
          userId,
          phase: currentPhase || 'intro',
          curriculumScript: null,
          audioBase64 // NEW
        });
        
        if (response?.emotion) {
          console.log("🔥 Emotion detected:", response.emotion);
        }
      } catch (err) {
        console.error("Error sending audio to backend:", err);
      }
    }
    */
    
    await sendUserMessage(userInput.trim());
    setUserInput('');
  };

  const handleExit = async () => {
    try {
      await endConversation();
    } catch (err) {
      console.error('Error ending conversation', err);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white p-6">
      <div className="max-w-5xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-sm text-purple-200 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Practice
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <h2 className="text-lg font-semibold">{normalizedScenario.title}</h2>
              <p className="text-xs text-purple-200">
                Grade {gradeLevel} • {normalizedScenario.category?.replace('-', ' ')}
              </p>
            </div>
          </div>
          <div className="text-xs text-purple-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {currentPhase === 'intro' && 'Getting started'}
            {currentPhase === 'practice' && 'In practice mode'}
            {currentPhase === 'feedback' && 'Giving feedback'}
            {currentPhase === 'complete' && 'Session complete'}
          </div>
        </div>

        {/* Conversation */}
        <div className="h-[28rem] overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-purple-200/70">
              <MessageCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Getting things ready...</p>
              <p className="text-sm">Your AI coach is preparing the session.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${message.timestamp}-${index}`}
                className={`max-w-3xl rounded-2xl px-5 py-4 border bg-white/5 ${
                  message.role === 'user'
                    ? 'ml-auto border-purple-500/40 text-purple-50'
                    : 'border-white/10 text-white/90'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide text-purple-200/70">
                  <span>{message.role === 'user' ? 'You' : 'Coach'}</span>
                  <span>•</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
            ))
          )}

          {isAIThinking && (
            <div className="flex items-center gap-2 text-sm text-purple-200/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              Coach is thinking...
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 text-red-100 text-sm px-4 py-2 rounded-2xl">
              {error}
            </div>
          )}
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-white/10 px-6 py-4 bg-black/30 flex items-center gap-3">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Speak or type your response..."
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 transition px-5 py-3 rounded-xl font-semibold"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatGPTVoiceChat;

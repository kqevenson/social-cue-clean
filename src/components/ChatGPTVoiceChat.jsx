import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, ArrowLeft, Sparkles, UserCircle, ChevronRight } from 'lucide-react';
import useVoiceConversation from '../hooks/useVoiceConversation';
import { UserProfile } from '../utils/userProfile';
import { sendVoiceToAI, getUserId } from '../services/voiceConversationApi';
import { getAvatarWithFallback } from '../services/avatarService';
import { getAvatarByIdWithFallback, isMockMode, generateAvatarPlaceholder, generateCircularPlaceholder } from '../services/heygenService';

// Convert Blob to Base64 for Hume
async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

const ChatGPTVoiceChat = ({ scenario, onClose, onNavigate }) => {
  const gradeLevel = UserProfile.getGrade() || '6';
  const [userInput, setUserInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Coach avatar state
  const [coachAvatar, setCoachAvatar] = useState(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);

  // Load the learner's saved HeyGen avatar
  useEffect(() => {
    const loadCoachAvatar = async () => {
      try {
        const userId = getUserId();
        let savedAvatar = null;

        if (userId) {
          savedAvatar = await getAvatarWithFallback(userId);
        } else {
          // No userId - try localStorage directly
          console.log('🎭 No userId, trying localStorage directly...');
          try {
            const stored = localStorage.getItem('socialCueUserData');
            if (stored) {
              const userData = JSON.parse(stored);
              if (userData?.avatar?.provider) {
                savedAvatar = userData.avatar;
                console.log('🎭 Found avatar in localStorage:', savedAvatar);
              }
            }
          } catch (e) {
            console.warn('🎭 Error reading localStorage:', e);
          }
        }

        if (savedAvatar?.provider === 'heygen' && savedAvatar.avatarId) {
          // Get full avatar details from HeyGen service (with fallback to default)
          const avatarDetails = await getAvatarByIdWithFallback(savedAvatar.avatarId);
          // Always use fresh previewUrl from service
          setCoachAvatar({
            ...avatarDetails,
            previewUrl: avatarDetails.previewUrl
          });
          console.log('🎭 Loaded coach:', avatarDetails.name, 'previewUrl:', avatarDetails.previewUrl?.substring(0, 50));
        } else {
          console.log('🎭 No saved avatar found');
        }
      } catch (err) {
        console.error('Error loading coach avatar:', err);
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    loadCoachAvatar();
  }, []);

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

  // Handle navigation to choose coach screen
  const handleChooseCoach = () => {
    if (onNavigate) {
      onNavigate('choose-coach');
    } else if (onClose) {
      // Fallback: dispatch navigation event
      window.dispatchEvent(new CustomEvent('navigate', {
        detail: { screen: 'choose-coach' }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Coach Panel - Left Side */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl sticky top-6">
            {isLoadingAvatar ? (
              <div className="p-6 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                <p className="text-sm text-purple-200">Loading coach...</p>
              </div>
            ) : coachAvatar ? (
              <>
                {/* Avatar Image */}
                <div className="aspect-[3/4] bg-gradient-to-b from-purple-900/50 to-black/50 relative overflow-hidden">
                  <img
                    src={coachAvatar.previewUrl}
                    alt={coachAvatar.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.src = generateAvatarPlaceholder(coachAvatar.name);
                    }}
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Coach Info */}
                <div className="p-4 -mt-12 relative z-10">
                  <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Your AI Coach</p>
                  <h3 className="text-xl font-bold text-white">{coachAvatar.name}</h3>
                  {coachAvatar.description && (
                    <p className="text-sm text-purple-200 mt-1">{coachAvatar.description}</p>
                  )}
                </div>

                {/* Change Coach Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={handleChooseCoach}
                    className="w-full text-xs text-purple-300 hover:text-white transition flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-white/5"
                  >
                    Change Coach
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              /* No Coach Selected */
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <UserCircle className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Coach Selected</h3>
                <p className="text-sm text-purple-200 mb-4">
                  Choose a friendly AI coach to guide your practice sessions.
                </p>
                <button
                  onClick={handleChooseCoach}
                  className="w-full bg-purple-600 hover:bg-purple-500 transition px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  Choose Your Coach
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area - Right Side */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
        {/* End Main Chat Area */}
      </div>
      {/* End Flex Container */}
    </div>
  );
};

export default ChatGPTVoiceChat;

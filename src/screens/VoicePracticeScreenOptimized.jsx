/**
 * Optimized Voice Practice Screen Component
 * 
 * Performance-optimized version with:
 * - React.memo for components
 * - useMemo for expensive computations
 * - useCallback for stable function references
 * - Virtual scrolling for messages
 * - Optimized API calls with caching
 * - Performance monitoring
 * 
 * @module VoicePracticeScreenOptimized
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { X, HelpCircle, AlertCircle, Trophy, Sparkles } from 'lucide-react';
import VoiceInput from '../components/VoiceInput.jsx';
import VoiceOutput from '../components/VoiceOutput.jsx';
import VoiceMessageList from '../components/VoiceMessageList.jsx';
import {
  SessionInitializationLoader,
  AIThinkingLoader,
  SpeechRecognitionLoader,
  TTSPlayingLoader,
  ProcessingLoader,
  TypingIndicator,
  ConversationHistoryPlaceholder,
  PointsAnimation,
  CelebrationEffect,
  PhaseTransitionOverlay
} from '../components/VoicePracticeLoadingStates.jsx';
import useVoiceConversation from '../hooks/useVoiceConversation.js';
import useVoicePerformanceMonitor from '../hooks/useVoicePerformanceMonitor.js';
import {
  optimizedFetch,
  debounce,
  networkStatus,
  requestQueue,
  trackPerformanceMetric
} from '../utils/voicePerformanceUtils.js';
import '../styles/voiceAnimations.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Optimized Voice Practice Screen
 */
const VoicePracticeScreen = memo(({
  scenario,
  gradeLevel = '6-8',
  userId,
  onComplete,
  onExit
}) => {
  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  
  const { trackAPIResponse, trackRender, getMetrics } = useVoicePerformanceMonitor({
    enabled: true,
    onMetric: (name, value, context) => {
      if (import.meta.env.DEV) {
        console.log(`📊 Performance: ${name} = ${value}ms`, context);
      }
    }
  });

  // ============================================================================
  // VOICE CONVERSATION HOOK
  // ============================================================================
  
  const {
    sessionId,
    messages,
    currentPhase,
    isAISpeaking,
    isListening,
    setIsListening,
    exchangeCount,
    difficultyLevel,
    isComplete,
    error,
    isLoading,
    canSpeak,
    startConversation,
    sendMessage,
    endConversation,
    registerTTSCallback,
    clearError,
    performanceMetrics
  } = useVoiceConversation({
    scenario,
    gradeLevel,
    userId: userId || 'guest_user',
    maxTurns: 8,
    initialDifficulty: 'moderate',
    onComplete: useCallback((summary) => {
      trackPerformanceMetric('session_completed', summary.duration || 0);
      onComplete?.(summary);
    }, [onComplete]),
    onError: useCallback((err) => {
      console.error('Voice conversation error:', err);
      trackPerformanceMetric('session_error', 0, { error: err.message });
    }, []),
    autoSave: true
  });

  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionResults, setCompletionResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [phaseTransitioning, setPhaseTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isOnline, setIsOnline] = useState(networkStatus.getStatus());

  // Refs
  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const ttsEndCallbackRef = useRef(null);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  
  const phaseLabel = useMemo(() => {
    const labels = {
      intro: 'Introduction',
      practice: 'Practice',
      feedback: 'Feedback',
      complete: 'Complete'
    };
    return labels[currentPhase] || 'Practice';
  }, [currentPhase]);

  const progressPercent = useMemo(() => {
    if (currentPhase === 'complete') return 100;
    const maxExchanges = 8;
    return Math.min(100, (exchangeCount / maxExchanges) * 100);
  }, [currentPhase, exchangeCount]);

  const scenarioTitle = useMemo(() => {
    return scenario?.title?.[gradeLevel] || scenario?.title || 'Voice Practice';
  }, [scenario, gradeLevel]);

  // ============================================================================
  // OPTIMIZED API CALLS
  // ============================================================================
  
  /**
   * Optimized session start with caching
   */
  const startSessionOptimized = useCallback(async () => {
    if (hasInitializedRef.current) return;

    const cacheKey = `session_start_${scenario?.id}_${gradeLevel}`;
    const startTime = performance.now();
    hasInitializedRef.current = true;
    
    try {
      const result = await startConversation();
      const duration = performance.now() - startTime;
      trackPerformanceMetric('session_start', duration);
      
      if (result.success && result.initialMessage) {
        // Cache intro message
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(cacheKey, JSON.stringify({
            aiResponse: result.initialMessage.text,
            timestamp: Date.now()
          }));
        }
      }
      
      return result;
    } catch (error) {
      // Try cache on error
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 3600000) { // 1 hour
            return {
              success: true,
              initialMessage: {
                id: Date.now(),
                role: 'ai',
                text: cachedData.aiResponse,
                timestamp: new Date()
              }
            };
          }
        }
      }
      throw error;
    }
  }, [scenario, gradeLevel, startConversation]);

  /**
   * Optimized message send with debouncing
   */
  const sendMessageOptimized = useCallback(
    debounce(async (userMessageText) => {
      if (!userMessageText.trim() || !sessionId || isAISpeaking) return;

      const startTime = performance.now();
      setIsProcessing(true);
      setShowTypingIndicator(true);

      try {
        const result = await sendMessage(userMessageText);
        const duration = performance.now() - startTime;
        
        trackAPIResponse(duration, '/api/voice/message');

        if (result.success && result.aiMessage) {
          // Check for phase transition
          if (result.aiMessage.phase !== currentPhase) {
            setPhaseTransitioning(true);
            setTimeout(() => setPhaseTransitioning(false), 600);
          }

          // Check for completion
          if (result.aiMessage.phase === 'complete' || !result.shouldContinue) {
            setTimeout(() => {
              setShowCelebration(true);
              setTimeout(() => {
                setIsCompleting(true);
                endConversation().then((summary) => {
                  setCompletionResults({
                    pointsEarned: performanceMetrics.score || 0,
                    performanceScore: summary?.performanceScore || 0,
                    feedback: summary?.feedback || 'Great job!',
                    summary: summary || {}
                  });
                });
              }, 2000);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsProcessing(false);
        setShowTypingIndicator(false);
      }
    }, 300),
    [sessionId, isAISpeaking, sendMessage, currentPhase, endConversation, performanceMetrics, trackAPIResponse]
  );

  // ============================================================================
  // EVENT HANDLERS (OPTIMIZED WITH useCallback)
  // ============================================================================
  
  const handleTranscript = useCallback((transcriptText) => {
    if (transcriptText && transcriptText.trim() && canSpeak) {
      setTranscript(transcriptText);
      sendMessageOptimized(transcriptText);
    }
  }, [canSpeak, sendMessageOptimized]);

  const handleVoiceStart = useCallback(() => {
    setIsListening(true);
    setTranscript('');
  }, [setIsListening]);

  const handleVoiceEnd = useCallback(() => {
    setIsListening(false);
  }, [setIsListening]);

  const handleAISpeakStart = useCallback(() => {
    setShowTypingIndicator(false);
  }, []);

  const handleAISpeakEnd = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handleExit = useCallback(() => {
    if (showExitConfirm) {
      if (sessionId && !isCompleting) {
        endConversation();
      }
      onExit?.();
    } else {
      setShowExitConfirm(true);
      setTimeout(() => setShowExitConfirm(false), 5000);
    }
  }, [showExitConfirm, sessionId, isCompleting, endConversation, onExit]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initialize session
  useEffect(() => {
    if (scenario && !hasInitializedRef.current) {
      startSessionOptimized();
    }

    return () => {
      // Cleanup on unmount
      if (sessionId) {
        clearError();
      }
    };
  }, [scenario, startSessionOptimized, sessionId, clearError]);

  // Register TTS callback
  useEffect(() => {
    registerTTSCallback((text, onComplete) => {
      ttsEndCallbackRef.current = onComplete;
    });
  }, [registerTTSCallback]);

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = networkStatus.subscribe((online) => {
      setIsOnline(online);
      if (online) {
        requestQueue.processQueue();
      }
    });

    return unsubscribe;
  }, []);

  // Auto-scroll optimization (throttled)
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages.length]);

  // ============================================================================
  // RENDER HELPERS (MEMOIZED)
  // ============================================================================
  
  const renderMessage = useCallback((message, index) => {
    const isLast = index === messages.length - 1;
    const isUser = message.role === 'user';

    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} voice-message-bubble ${isUser ? 'voice-message-bubble-user' : 'voice-message-bubble-ai'}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div
          className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
              : message.isError
              ? 'bg-red-500/20 border border-red-500/30 text-white'
              : 'bg-white/10 backdrop-blur-sm border border-white/10 text-white'
          }`}
        >
          <p className="leading-relaxed">{message.text}</p>
          <p className="text-xs opacity-60 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!isUser && isLast && (
            <div className="mt-3">
              <VoiceOutput
                text={message.text}
                autoPlay={true}
                gradeLevel={gradeLevel}
                onStart={handleAISpeakStart}
                onEnd={handleAISpeakEnd}
              />
            </div>
          )}
        </div>
      </div>
    );
  }, [messages.length, gradeLevel, handleAISpeakStart, handleAISpeakEnd]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Loading state
  if (isLoading && !sessionId) {
    return <SessionInitializationLoader message="Starting your practice session..." />;
  }

  // Completion screen
  if (currentPhase === 'complete' && completionResults) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 text-white flex items-center justify-center z-50">
        <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2">Great Job!</h2>
          <p className="text-gray-300 mb-6">{completionResults.feedback}</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-300">Points Earned</span>
              <PointsAnimation points={completionResults.pointsEarned} showSparkle={true} />
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-300">Performance Score</span>
              <span className="text-2xl font-bold text-blue-400">{Math.round(completionResults.performanceScore)}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-300">Exchanges</span>
              <span className="text-xl font-semibold text-green-400">{exchangeCount}</span>
            </div>
          </div>
          
          <button
            onClick={handleExit}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Main screen
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* Header */}
      <Header
        scenarioTitle={scenarioTitle}
        scenarioCategory={scenario?.category}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        showExitConfirm={showExitConfirm}
        setShowExitConfirm={setShowExitConfirm}
        onExit={handleExit}
        sessionId={sessionId}
        isCompleting={isCompleting}
        endConversation={endConversation}
      />

      {/* Phase Indicator & Progress */}
      <PhaseIndicator
        currentPhase={currentPhase}
        phaseLabel={phaseLabel}
        progressPercent={progressPercent}
        pointsEarned={pointsEarned}
      />

      {/* Phase Transition Overlay */}
      {phaseTransitioning && (
        <PhaseTransitionOverlay
          fromPhase={currentPhase}
          toPhase={currentPhase}
          onComplete={() => setPhaseTransitioning(false)}
        />
      )}

      {/* Celebration Effect */}
      {showCelebration && (
        <CelebrationEffect onComplete={() => setShowCelebration(false)} />
      )}

      {/* Status Indicator */}
      <StatusIndicator
        isUserSpeaking={isListening}
        isAISpeaking={isAISpeaking}
        isLoading={isLoading}
        isProcessing={isProcessing}
        transcript={transcript}
      />

      {/* Messages Area - Virtual Scrolling for > 50 messages */}
      {messages.length > 50 ? (
        <VoiceMessageList
          messages={messages}
          renderMessage={renderMessage}
          itemHeight={120}
          overscan={5}
          className="flex-1 overflow-hidden p-4 pb-32"
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {messages.length === 0 ? (
            <ConversationHistoryPlaceholder />
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, index) => renderMessage(msg, index))}
              {showTypingIndicator && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Voice Input Area */}
      <VoiceInputArea
        onTranscript={handleTranscript}
        onStart={handleVoiceStart}
        onEnd={handleVoiceEnd}
        isDisabled={!canSpeak || currentPhase === 'complete'}
      />

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          isOnline={isOnline}
          onDismiss={clearError}
        />
      )}
    </div>
  );
});

VoicePracticeScreen.displayName = 'VoicePracticeScreen';

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

const Header = memo(({
  scenarioTitle,
  scenarioCategory,
  showHelp,
  setShowHelp,
  showExitConfirm,
  setShowExitConfirm,
  onExit,
  sessionId,
  isCompleting,
  endConversation
}) => (
  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0 relative">
    <div className="flex-1 min-w-0">
      <h2 className="font-bold text-lg truncate">{scenarioTitle}</h2>
      <p className="text-xs text-white/80 truncate">{scenarioCategory || 'Practice'}</p>
    </div>
    
    <button
      onClick={() => setShowHelp(!showHelp)}
      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors mr-2"
      aria-label="Help"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
    
    <button
      onClick={onExit}
      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
      aria-label="Exit"
    >
      <X className="w-5 h-5" />
    </button>
    
    {showExitConfirm && (
      <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-3 bg-red-900/90 border border-red-500 rounded-lg z-50">
        <p className="text-sm text-white mb-2">Exit practice session?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowExitConfirm(false);
              if (sessionId && !isCompleting) {
                endConversation();
              }
              onExit();
            }}
            className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
          >
            Yes, Exit
          </button>
          <button
            onClick={() => setShowExitConfirm(false)}
            className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
));

Header.displayName = 'Header';

const PhaseIndicator = memo(({ currentPhase, phaseLabel, progressPercent, pointsEarned }) => (
  <div className="bg-gray-900/50 px-4 py-2 flex items-center justify-between shrink-0 border-b border-gray-800">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${currentPhase === 'complete' ? 'text-yellow-400' : 'text-blue-400'}`} />
        <span className="text-xs font-medium text-gray-300">{phaseLabel}</span>
      </div>
      {pointsEarned > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">{pointsEarned}</span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 flex-1 max-w-xs">
      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 min-w-[3rem] text-right">{Math.round(progressPercent)}%</span>
    </div>
  </div>
));

PhaseIndicator.displayName = 'PhaseIndicator';

const StatusIndicator = memo(({ isUserSpeaking, isAISpeaking, isLoading, isProcessing, transcript }) => {
  if (!isUserSpeaking && !isAISpeaking && !isLoading && !isProcessing) return null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40">
      {isUserSpeaking ? (
        <SpeechRecognitionLoader transcript={transcript} isListening={isUserSpeaking} />
      ) : isAISpeaking ? (
        <TTSPlayingLoader message="Coach is speaking..." />
      ) : isProcessing ? (
        <ProcessingLoader message="Processing..." />
      ) : isLoading ? (
        <AIThinkingLoader message="Coach is thinking..." />
      ) : null}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

const VoiceInputArea = memo(({ onTranscript, onStart, onEnd, isDisabled }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-transparent p-6 pt-12 pb-6">
    <div className="max-w-3xl mx-auto">
      <VoiceInput
        onTranscript={onTranscript}
        onStart={onStart}
        onEnd={onEnd}
        isDisabled={isDisabled}
        className="w-full"
      />
    </div>
  </div>
));

VoiceInputArea.displayName = 'VoiceInputArea';

const HelpModal = memo(({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <HelpCircle className="w-6 h-6" />
        Tips for Speaking Clearly
      </h3>
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>Speak clearly and at a normal pace</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>Find a quiet place to practice</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>Hold the microphone button while speaking</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>Release the button when you're done</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>Try to express complete thoughts</span>
        </li>
      </ul>
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
      >
        Got it!
      </button>
    </div>
  </div>
));

HelpModal.displayName = 'HelpModal';

const ErrorDisplay = memo(({ error, isOnline, onDismiss }) => (
  <div className="fixed bottom-24 left-4 right-4 z-50">
    <div className="bg-red-900/90 border border-red-500 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-200 font-medium mb-1">Error</p>
        <p className="text-red-300 text-sm">{error?.message || String(error)}</p>
        {!isOnline && (
          <p className="text-yellow-300 text-xs mt-2">⚠️ You're offline. Changes will be saved when you reconnect.</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300"
        aria-label="Dismiss error"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

export default VoicePracticeScreen;


/**
 * VoicePracticeLoadingStates - Loading State Components for Voice Practice
 * 
 * Provides reusable loading state components for different phases of voice practice:
 * - Session initialization
 * - AI thinking/processing
 * - Speech recognition
 * - Text-to-speech playing
 * - Message processing
 * 
 * @module VoicePracticeLoadingStates
 */

import React from 'react';
import { Mic, Volume2, Loader2, Brain, Sparkles } from 'lucide-react';
import '../styles/voiceAnimations.css';

/**
 * Session Initialization Loading State
 * Shows when starting a new voice practice session
 */
export const SessionInitializationLoader = ({ message = 'Starting your practice session...' }) => {
  return (
    <div className="voice-loading-container" role="status" aria-live="polite">
      <div className="voice-loading-content">
        <div className="voice-coach-icon-wrapper">
          <div className="voice-coach-icon pulse-glow">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <div className="voice-loading-spinner">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
        <p className="voice-loading-message">{message}</p>
        <div className="voice-loading-progress">
          <div className="voice-loading-progress-bar" />
        </div>
      </div>
    </div>
  );
};

/**
 * AI Thinking Loading State
 * Shows when AI is processing/thinking (< 2 seconds)
 */
export const AIThinkingLoader = ({ message = 'Coach is thinking...' }) => {
  return (
    <div className="voice-loading-container voice-loading-compact" role="status" aria-live="polite">
      <div className="voice-loading-content">
        <div className="voice-thinking-dots">
          <Brain className="w-5 h-5 text-purple-400 pulse-animation" />
          <span className="voice-loading-message">{message}</span>
          <div className="voice-thinking-dots-container">
            <span className="voice-thinking-dot" />
            <span className="voice-thinking-dot" />
            <span className="voice-thinking-dot" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Speech Recognition Loading State
 * Shows when listening for user input
 */
export const SpeechRecognitionLoader = ({ transcript = '', isListening = false }) => {
  return (
    <div className="voice-loading-container voice-loading-speech" role="status" aria-live="polite">
      <div className="voice-loading-content">
        <div className="voice-microphone-wrapper">
          <div className={`voice-microphone-button ${isListening ? 'voice-microphone-active' : ''}`}>
            <Mic className="w-8 h-8 text-white" />
            {isListening && (
              <>
                <div className="voice-microphone-pulse-ring" />
                <div className="voice-microphone-pulse-ring voice-microphone-pulse-delay-1" />
                <div className="voice-microphone-pulse-ring voice-microphone-pulse-delay-2" />
              </>
            )}
          </div>
        </div>
        <p className="voice-loading-message">
          {isListening ? 'Listening...' : 'Ready to listen'}
        </p>
        {isListening && (
          <div className="voice-sound-wave">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="voice-sound-wave-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        {transcript && (
          <div className="voice-transcript-preview">
            <p className="voice-transcript-text">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TTS Playing Loading State
 * Shows when AI coach is speaking
 */
export const TTSPlayingLoader = ({ progress = 0, message = 'Coach is speaking...' }) => {
  return (
    <div className="voice-loading-container voice-loading-compact" role="status" aria-live="polite">
      <div className="voice-loading-content">
        <div className="voice-speaking-wrapper">
          <div className="voice-speaking-icon pulse-animation">
            <Volume2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="voice-loading-message">{message}</p>
        </div>
        {progress > 0 && (
          <div className="voice-tts-progress">
            <div
              className="voice-tts-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Processing Response Loading State
 * Brief loading state during message processing
 */
export const ProcessingLoader = ({ message = 'Processing...' }) => {
  return (
    <div className="voice-loading-container voice-loading-compact" role="status" aria-live="polite">
      <div className="voice-loading-content">
        <div className="voice-processing-spinner">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
        <p className="voice-loading-message">{message}</p>
      </div>
    </div>
  );
};

/**
 * Typing Indicator Component
 * Shows animated typing dots before AI message appears
 */
export const TypingIndicator = ({ message = 'Coach is typing...' }) => {
  return (
    <div className="voice-typing-indicator" role="status" aria-live="polite">
      <div className="voice-typing-dots">
        <span className="voice-typing-dot" />
        <span className="voice-typing-dot" />
        <span className="voice-typing-dot" />
      </div>
      <p className="voice-typing-message">{message}</p>
    </div>
  );
};

/**
 * Message Bubble Skeleton
 * Placeholder for message bubbles while loading
 */
export const MessageBubbleSkeleton = ({ isUser = false }) => {
  return (
    <div className={`voice-message-skeleton ${isUser ? 'voice-message-skeleton-user' : 'voice-message-skeleton-ai'}`}>
      <div className="voice-message-skeleton-content">
        <div className="voice-message-skeleton-line voice-message-skeleton-line-long" />
        <div className="voice-message-skeleton-line voice-message-skeleton-line-medium" />
        <div className="voice-message-skeleton-line voice-message-skeleton-line-short" />
      </div>
    </div>
  );
};

/**
 * Conversation History Placeholder
 * Shows when conversation history is loading
 */
export const ConversationHistoryPlaceholder = () => {
  return (
    <div className="voice-conversation-placeholder">
      {[...Array(3)].map((_, i) => (
        <MessageBubbleSkeleton key={i} isUser={i % 2 === 0} />
      ))}
    </div>
  );
};

/**
 * Points Animation Component
 * Animated counter for points earned
 */
export const PointsAnimation = ({ points, showSparkle = true }) => {
  return (
    <div className="voice-points-animation">
      {showSparkle && (
        <div className="voice-points-sparkles">
          {[...Array(5)].map((_, i) => (
            <Sparkles
              key={i}
              className="voice-points-sparkle"
              style={{
                animationDelay: `${i * 0.1}s`,
                left: `${20 + i * 15}%`
              }}
            />
          ))}
        </div>
      )}
      <div className="voice-points-counter">
        <span className="voice-points-value">{points}</span>
        <span className="voice-points-label">points</span>
      </div>
    </div>
  );
};

/**
 * Badge Reveal Animation
 * Animated badge reveal for achievements
 */
export const BadgeReveal = ({ badge, onComplete }) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="voice-badge-reveal">
      <div className="voice-badge-content">
        <div className="voice-badge-icon">{badge.icon}</div>
        <h3 className="voice-badge-title">{badge.title}</h3>
        <p className="voice-badge-description">{badge.description}</p>
      </div>
    </div>
  );
};

/**
 * Celebration Effect Component
 * Shows celebration animation on session completion
 */
export const CelebrationEffect = ({ onComplete }) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="voice-celebration">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="voice-celebration-particle"
          style={{
            '--particle-index': i,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Phase Transition Overlay
 * Shows smooth transition between phases
 */
export const PhaseTransitionOverlay = ({ fromPhase, toPhase, onComplete }) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="voice-phase-transition">
      <div className="voice-phase-transition-content">
        <div className="voice-phase-transition-progress" />
        <p className="voice-phase-transition-message">
          Moving to {toPhase}...
        </p>
      </div>
    </div>
  );
};

/**
 * Main Loading States Component
 * Combines all loading states with props-based switching
 */
export const VoicePracticeLoadingState = ({
  type = 'initialization',
  message,
  transcript,
  isListening,
  progress,
  points,
  ...props
}) => {
  switch (type) {
    case 'initialization':
      return <SessionInitializationLoader message={message} {...props} />;
    case 'thinking':
      return <AIThinkingLoader message={message} {...props} />;
    case 'listening':
      return (
        <SpeechRecognitionLoader
          transcript={transcript}
          isListening={isListening}
          {...props}
        />
      );
    case 'speaking':
      return (
        <TTSPlayingLoader
          message={message}
          progress={progress}
          {...props}
        />
      );
    case 'processing':
      return <ProcessingLoader message={message} {...props} />;
    case 'typing':
      return <TypingIndicator message={message} {...props} />;
    default:
      return <SessionInitializationLoader message={message} {...props} />;
  }
};

export default VoicePracticeLoadingState;


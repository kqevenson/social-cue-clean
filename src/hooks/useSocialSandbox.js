import { useState, useEffect, useCallback, useRef } from 'react';
import { apiPath } from '../utils/apiBase';
import humeEviService from '../services/humeEviService';

/**
 * Social Sandbox Hook
 * Manages sandbox session state, messaging, and voice integration
 */

// Sandbox modes configuration
export const SANDBOX_MODES = {
  vent: {
    id: 'vent',
    name: 'Vent Zone',
    icon: 'MessageSquare',
    color: '#F97316', // orange
    description: {
      'K-2': 'Tell me how you\'re feeling!',
      '3-5': 'Let it all out - I\'m here to listen',
      '6-8': 'Say what you really want to say',
      '9-12': 'Express yourself freely - no filter needed'
    }
  },
  whatif: {
    id: 'whatif',
    name: 'What Would Happen?',
    icon: 'Zap',
    color: '#8B5CF6', // purple
    description: {
      'K-2': 'Let\'s pretend and see what happens!',
      '3-5': 'Test out what might happen if you said it',
      '6-8': 'Play out your "bad" response - see the aftermath',
      '9-12': 'Simulate the consequences before you act'
    }
  },
  translate: {
    id: 'translate',
    name: 'Translation Station',
    icon: 'RefreshCw',
    color: '#3B82F6', // blue
    description: {
      'K-2': 'Find nicer words that still say how you feel!',
      '3-5': 'Turn your feelings into words that work',
      '6-8': 'Translate your raw feelings into something that lands',
      '9-12': 'Craft a message that\'s authentic AND strategic'
    }
  },
  reversal: {
    id: 'reversal',
    name: 'Walk in Their Shoes',
    icon: 'Users',
    color: '#10B981', // green
    description: {
      'K-2': 'Let\'s switch and play pretend!',
      '3-5': 'Be the other person - I\'ll show you how it feels',
      '6-8': 'Flip roles - see how your words land',
      '9-12': 'Role reversal for perspective'
    }
  }
};

// Mood check-in options
export const MOOD_OPTIONS = [
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'annoyed', label: 'Annoyed', emoji: '😒' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😫' },
  { id: 'hurt', label: 'Hurt', emoji: '😢' },
  { id: 'confused', label: 'Confused', emoji: '😕' },
  { id: 'weird', label: 'Just want to be weird', emoji: '🤪' }
];

export function useSocialSandbox({
  gradeLevel = '6-8',
  learnerId = null,
  onSessionEnd = null
}) {
  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'
  const [moodCheckIn, setMoodCheckIn] = useState(null);

  // Message state
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Voice state
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState(null);

  // Safety state
  const [safetyAlert, setSafetyAlert] = useState(null);

  // Session timing
  const [sessionTime, setSessionTime] = useState(0);
  const sessionTimerRef = useRef(null);
  const sessionStartRef = useRef(null);

  // Voice refs
  const transcriptBufferRef = useRef('');

  /**
   * Start a new sandbox session
   */
  const startSession = useCallback(async (selectedMode, selectedMood = null) => {
    if (!learnerId) {
      setError('No learner ID provided');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiPath('/api/sandbox/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          mode: selectedMode,
          gradeLevel,
          inputMode,
          moodCheckIn: selectedMood
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start session');
      }

      // Set session state
      setSessionId(data.sessionId);
      setMode(selectedMode);
      setMoodCheckIn(selectedMood);
      setIsActive(true);

      // Add entry message
      setMessages([{
        role: 'ai',
        text: data.entryMessage,
        timestamp: Date.now()
      }]);

      // Start session timer
      sessionStartRef.current = Date.now();
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);

      console.log(`🧪 Sandbox session started: ${data.sessionId}`);
      return true;

    } catch (err) {
      console.error('Failed to start sandbox session:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [learnerId, gradeLevel, inputMode]);

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (text) => {
    if (!sessionId || !text.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage = {
      role: 'student',
      text: text.trim(),
      timestamp: Date.now(),
      emotion: currentEmotion?.name || null
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(apiPath('/api/sandbox/message'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          emotionData: currentEmotion ? {
            dominant: currentEmotion
          } : null
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add AI response
      const aiMessage = {
        role: 'ai',
        text: data.response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Handle safety alerts
      if (data.safetyLevel === 'alert' && data.supportiveMessage) {
        setSafetyAlert({
          level: 'alert',
          message: data.supportiveMessage
        });
      }

      return data.response;

    } catch (err) {
      console.error('Failed to send sandbox message:', err);
      setError(err.message);

      // Remove failed user message
      setMessages(prev => prev.slice(0, -1));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentEmotion]);

  /**
   * End the current session
   */
  const endSession = useCallback(async () => {
    if (!sessionId) return null;

    // Stop timer
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // Disconnect voice if active
    if (isVoiceConnected) {
      await disconnectVoice();
    }

    try {
      const response = await fetch(apiPath('/api/sandbox/end'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      const sessionSummary = {
        sessionId,
        mode,
        duration: sessionTime,
        messageCount: messages.length,
        summary: data.summary
      };

      // Reset state
      setSessionId(null);
      setIsActive(false);
      setMode(null);
      setMessages([]);
      setSessionTime(0);
      setSafetyAlert(null);
      setMoodCheckIn(null);

      console.log('🧪 Sandbox session ended');

      // Call callback if provided
      if (onSessionEnd) {
        onSessionEnd(sessionSummary);
      }

      return sessionSummary;

    } catch (err) {
      console.error('Failed to end sandbox session:', err);
      return null;
    }
  }, [sessionId, mode, sessionTime, messages.length, isVoiceConnected, onSessionEnd]);

  /**
   * Connect to voice mode (Hume EVI)
   */
  const connectVoice = useCallback(async () => {
    try {
      // Set up Hume callbacks
      humeEviService.onTranscript = (transcript) => {
        setCurrentTranscript(transcript);
        transcriptBufferRef.current = transcript;
      };

      humeEviService.onEmotion = (emotionData) => {
        if (emotionData?.dominant) {
          setCurrentEmotion({
            name: emotionData.dominant.name,
            score: emotionData.dominant.score
          });
        }
      };

      humeEviService.onConnectionChange = (connected) => {
        setIsVoiceConnected(connected);
        if (connected) {
          setIsListening(true);
        }
      };

      humeEviService.onError = (error) => {
        console.error('Hume EVI error:', error);
        setError('Voice connection error. Try again or switch to text.');
      };

      // Connect
      const connected = await humeEviService.connect();
      if (!connected) {
        throw new Error('Failed to connect to voice service');
      }

      setInputMode('voice');
      console.log('🎤 Voice mode connected');
      return true;

    } catch (err) {
      console.error('Voice connection failed:', err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Disconnect from voice mode
   */
  const disconnectVoice = useCallback(async () => {
    try {
      await humeEviService.disconnect();
      setIsVoiceConnected(false);
      setIsListening(false);
      setCurrentTranscript('');
      setCurrentEmotion(null);
      setInputMode('text');
      console.log('🎤 Voice mode disconnected');
    } catch (err) {
      console.error('Voice disconnect error:', err);
    }
  }, []);

  /**
   * Submit voice transcript as message
   */
  const submitVoiceMessage = useCallback(async () => {
    const transcript = transcriptBufferRef.current.trim();
    if (transcript) {
      transcriptBufferRef.current = '';
      setCurrentTranscript('');
      await sendMessage(transcript);
    }
  }, [sendMessage]);

  /**
   * Toggle input mode between text and voice
   */
  const toggleInputMode = useCallback(async () => {
    if (inputMode === 'text') {
      await connectVoice();
    } else {
      await disconnectVoice();
    }
  }, [inputMode, connectVoice, disconnectVoice]);

  /**
   * Clear safety alert
   */
  const clearSafetyAlert = useCallback(() => {
    setSafetyAlert(null);
  }, []);

  /**
   * Share session with parent/teacher
   */
  const shareSession = useCallback(async (shareWith = 'parent') => {
    if (!sessionId) return false;

    try {
      const response = await fetch(apiPath('/api/sandbox/share'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, shareWith })
      });

      const data = await response.json();
      return data.success;

    } catch (err) {
      console.error('Failed to share session:', err);
      return false;
    }
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      if (isVoiceConnected) {
        humeEviService.disconnect();
      }
    };
  }, [isVoiceConnected]);

  return {
    // Session state
    sessionId,
    isActive,
    mode,
    inputMode,
    moodCheckIn,
    sessionTime,

    // Messages
    messages,
    isLoading,
    error,

    // Voice state
    isVoiceConnected,
    isListening,
    currentTranscript,
    currentEmotion,

    // Safety
    safetyAlert,
    clearSafetyAlert,

    // Actions
    startSession,
    sendMessage,
    endSession,
    connectVoice,
    disconnectVoice,
    toggleInputMode,
    submitVoiceMessage,
    shareSession,
    setMoodCheckIn,

    // Constants
    SANDBOX_MODES,
    MOOD_OPTIONS
  };
}

export default useSocialSandbox;

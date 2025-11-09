import { useState, useEffect, useCallback, useRef } from 'react';
import { getIntroductionSequence } from '../content/training/introduction-scripts';
import CleanVoiceService from '../services/CleanVoiceService';

const TIMING_MAP = {
  'K-2': { aiDelay: 2500, silenceTimeout: 8000 },
  '3-5': { aiDelay: 2000, silenceTimeout: 6000 },
  '6-8': { aiDelay: 1500, silenceTimeout: 5000 },
  '9-12': { aiDelay: 1200, silenceTimeout: 4000 }
};

const DEFAULT_TIMING = { aiDelay: 1500, silenceTimeout: 5000 };

function getFallbackIntroMessage(scenario, gradeLevel) {
  const gradeNum = parseInt(gradeLevel, 10) || 6;
  if (gradeNum <= 2) {
    return "Hi! I'm Cue! Let's practice talking together!";
  }
  if (gradeNum <= 5) {
    return "Hey! I'm Cue. Let's practice starting conversations together.";
  }
  if (gradeNum <= 8) {
    return "Hi, I'm Cue. Let's warm up before we dive into the practice.";
  }
  return "Hi, I'm Cue. Let's align on what we're practicing today.";
}

function getScenarioKey(scenario) {
  if (!scenario) return 'starting-conversation';
  const title = (scenario.title || scenario.name || '').toLowerCase();

  if (title.includes('start') || title.includes('conversation')) return 'starting-conversation';
  if (title.includes('friend')) return 'making-friends';
  if (title.includes('attention') || title.includes('listen')) return 'paying-attention';
  if (title.includes('help')) return 'asking-help';
  if (title.includes('join') || title.includes('group')) return 'joining-group';

  return 'starting-conversation';
}

function getIntroMessage(scenario, gradeLevel) {
  console.log('🎤 Getting intro message for:', {
    scenario: scenario?.title,
    gradeLevel
  });

  try {
    const introData = getIntroductionSequence(gradeLevel);
    console.log('📝 Intro data loaded:', {
      hasScenarios: !!introData.scenarios,
      gradeRange: introData.gradeRange
    });

    const scenarioKey = getScenarioKey(scenario);
    console.log('🔑 Scenario key:', scenarioKey);

    if (introData.scenarios && introData.scenarios[scenarioKey]) {
      const script = introData.scenarios[scenarioKey];
      console.log('✅ Using scenario-specific script:', script.intro);
      return `${introData.fullIntro.split('.')[0]}. ${script.intro}`;
    }

    console.log('⚠️  No scenario-specific script found, using general intro');
    return introData.fullIntro;
  } catch (error) {
    console.error('❌ Error getting introduction script:', error);
    return getFallbackIntroMessage(scenario, gradeLevel);
  }
}

function getTimingForGrade(gradeLevel) {
  const gradeNum = parseInt(gradeLevel, 10) || 6;
  if (gradeNum <= 2) return TIMING_MAP['K-2'];
  if (gradeNum <= 5) return TIMING_MAP['3-5'];
  if (gradeNum <= 8) return TIMING_MAP['6-8'];
  return TIMING_MAP['9-12'];
}

const FALLBACK_RESPONSES = {
  intro: "I'm ready to practice with you. Let's start when you're ready!",
  practice: "I'm here and listening. Try telling me what you would say.",
  feedback: "You're doing great. Let's talk about what went well.",
  complete: "That was a strong session. Thanks for practicing with me."
};

export default function useVoiceConversation({ scenario, gradeLevel = '6', onSessionComplete }) {
  const [messages, setMessages] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationTurns, setConversationTurns] = useState(0);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [timing, setTiming] = useState(DEFAULT_TIMING);

  const silenceTimerRef = useRef(null);
  const aiDelayTimerRef = useRef(null);
  const sessionActiveRef = useRef(false);
  const messagesRef = useRef([]);

  const resetTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (aiDelayTimerRef.current) {
      clearTimeout(aiDelayTimerRef.current);
      aiDelayTimerRef.current = null;
    }
  }, []);

  const scheduleSilenceTimeout = useCallback(() => {
    resetTimers();
    silenceTimerRef.current = setTimeout(() => {
      setIsListening(false);
      setIsWaitingForUser(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `timeout_${Date.now()}`,
          role: 'ai',
          text: "I'm still here. Take your time, and let me know when you're ready to try again.",
          phase: currentPhase
        }
      ]);
    }, timing.silenceTimeout);
  }, [currentPhase, resetTimers, timing.silenceTimeout]);

  const addMessage = useCallback((role, text, phaseOverride) => {
    const phase = phaseOverride || currentPhase;
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}_${Date.now()}`,
        role,
        text,
        phase
      }
    ]);
  }, [currentPhase]);

  const transitionPhaseIfNeeded = useCallback((turns) => {
    if (currentPhase === 'intro' && turns >= 1) {
      setCurrentPhase('practice');
    } else if (currentPhase === 'practice' && turns >= 6) {
      setCurrentPhase('feedback');
    } else if (currentPhase === 'feedback' && turns >= 8) {
      setCurrentPhase('complete');
      sessionActiveRef.current = false;
      if (onSessionComplete) {
        onSessionComplete();
      }
    }
  }, [currentPhase, onSessionComplete]);

  const handleAIResponse = useCallback((text, phase) => {
    addMessage('ai', text, phase);
    setIsAIThinking(false);
    if (phase !== 'complete') {
      setIsListening(true);
      setIsWaitingForUser(true);
      scheduleSilenceTimeout();
    } else {
      setIsListening(false);
      setIsWaitingForUser(false);
    }
  }, [addMessage, scheduleSilenceTimeout]);

  const startConversation = useCallback(async () => {
    console.log('🎬 Starting conversation with CleanVoiceService');
    resetTimers();
    sessionActiveRef.current = true;
    setIsAIThinking(true);
    setIsListening(false);
    setIsWaitingForUser(false);
    setConversationTurns(0);
    setCurrentPhase('intro');

    try {
      const response = await CleanVoiceService.generateResponse({
        conversationHistory: [],
        scenario,
        gradeLevel,
        phase: 'intro'
      });

      const introMessage = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: response.aiResponse,
        phase: response.phase || 'intro'
      };

      setMessages([introMessage]);
      setCurrentPhase(response.phase || 'intro');
      setIsAIThinking(false);
      setIsListening(true);
      setIsWaitingForUser(true);
      scheduleSilenceTimeout();

      if (!response.shouldContinue) {
        sessionActiveRef.current = false;
      }
    } catch (error) {
      console.error('❌ Failed to start conversation with CleanVoiceService:', error);
      const fallbackIntro = getIntroMessage(scenario, gradeLevel);
      setMessages([
        {
          id: 'intro_fallback',
          role: 'ai',
          text: fallbackIntro,
          phase: 'intro'
        }
      ]);
      setIsAIThinking(false);
      setIsListening(true);
      setIsWaitingForUser(true);
      scheduleSilenceTimeout();
    }
  }, [gradeLevel, resetTimers, scheduleSilenceTimeout, scenario]);

  const sendUserMessage = useCallback((userText) => {
    if (!sessionActiveRef.current) return;
    resetTimers();
    setIsListening(false);
    setIsWaitingForUser(false);
    addMessage('user', userText);
    setConversationTurns((prev) => {
      const next = prev + 1;
      transitionPhaseIfNeeded(next);
      return next;
    });
    setIsAIThinking(true);

    const phase = currentPhase;
    aiDelayTimerRef.current = setTimeout(async () => {
      try {
        console.log('🎯 Calling CleanVoiceService...');
        const conversationHistoryWithUser = [
          ...messagesRef.current,
          { role: 'user', text: userText, phase }
        ];

        const response = await CleanVoiceService.generateResponse({
          conversationHistory: conversationHistoryWithUser,
          scenario,
          gradeLevel,
          phase
        });

        if (response.phase && response.phase !== currentPhase) {
          setCurrentPhase(response.phase);
        }

        handleAIResponse(response.aiResponse, response.phase || phase);

        if (!response.shouldContinue) {
          sessionActiveRef.current = false;
          setIsListening(false);
          setIsWaitingForUser(false);
        }
      } catch (error) {
        console.error('❌ CleanVoiceService error:', error);
        handleAIResponse(FALLBACK_RESPONSES[phase] || FALLBACK_RESPONSES.practice, phase);
      }
    }, timing.aiDelay);
  }, [addMessage, currentPhase, gradeLevel, handleAIResponse, resetTimers, scenario, timing.aiDelay, transitionPhaseIfNeeded]);

  const endConversation = useCallback(() => {
    sessionActiveRef.current = false;
    resetTimers();
    setIsListening(false);
    setIsWaitingForUser(false);
    if (currentPhase !== 'complete') {
      addMessage('ai', FALLBACK_RESPONSES.complete, 'complete');
      setCurrentPhase('complete');
    }
    if (onSessionComplete) {
      onSessionComplete();
    }
  }, [addMessage, currentPhase, onSessionComplete, resetTimers]);

  const setListeningState = useCallback((listening) => {
    setIsListening(listening);
    if (listening) {
      setIsWaitingForUser(true);
      scheduleSilenceTimeout();
    } else {
      setIsWaitingForUser(false);
      resetTimers();
    }
  }, [resetTimers, scheduleSilenceTimeout]);

  useEffect(() => {
    const timingConfig = getTimingForGrade(gradeLevel);
    setTiming(timingConfig || DEFAULT_TIMING);
  }, [gradeLevel]);

  useEffect(() => {
    return () => {
      sessionActiveRef.current = false;
      resetTimers();
    };
  }, [resetTimers]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  return {
    messages,
    isAIThinking,
    isListening,
    currentPhase,
    conversationTurns,
    isWaitingForUser,
    timing,
    startConversation,
    sendUserMessage,
    endConversation,
    setListeningState
  };
}
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useVoiceConversation - Custom hook for managing voice chatbot conversations
 * 
 * Features:
 * - Multi-phase conversation flow (intro, practice, feedback, complete)
 * - AI response generation with Claude API integration
 * - Performance tracking and analytics
 * - Error recovery and fallback responses
 * - Context-aware conversation management
 * - Grade-level appropriate responses
 * 
 * Usage:
 * const {
 *   messages,
 *   isAIThinking,
 *   isListening,
 *   currentPhase,
 *   startConversation,
 *   sendUserMessage,
 *   endConversation,
 *   performance
 * } = useVoiceConversation({
 *   scenario: "Making friends at lunch",
 *   gradeLevel: "6",
 *   onComplete: (results) => console.log(results)
 * });
 */

const useVoiceConversation = ({
  scenario,
  gradeLevel = '6',
  onComplete,
  maxTurns = 8,
  apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
}) => {
  // Enable mock mode for testing when backend is unavailable
  const USE_MOCK = false; // Set to false when backend is stable
  
  // Core state
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [conversationId, setConversationId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // Performance tracking
  const [performance, setPerformance] = useState({
    totalTurns: 0,
    successfulExchanges: 0,
    hesitations: 0,
    hintsGiven: 0,
    score: 0,
    startTime: null,
    endTime: null,
    duration: 0
  });
  
  // Error handling
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2; // Reduced from 3 to prevent infinite loops
  
  // Refs for cleanup and tracking
  const conversationStartTime = useRef(null);
  const turnCount = useRef(0);
  const lastUserMessage = useRef(null);
  const lastRequestTime = useRef(0);
  const conversationContext = useRef({
    scenario,
    gradeLevel,
    userStrengths: [],
    areasForImprovement: [],
    practiceGoals: []
  });

  // Conversation phases configuration
  const phases = {
    intro: {
      name: 'Introduction',
      description: 'AI introduces scenario and explains what to practice',
      maxTurns: 2,
      nextPhase: 'practice'
    },
    practice: {
      name: 'Practice',
      description: 'Interactive back-and-forth dialogue',
      maxTurns: maxTurns,
      nextPhase: 'feedback'
    },
    feedback: {
      name: 'Feedback',
      description: 'AI provides specific feedback on performance',
      maxTurns: 2,
      nextPhase: 'complete'
    },
    complete: {
      name: 'Complete',
      description: 'Summary and encouragement',
      maxTurns: 1,
      nextPhase: null
    }
  };

  // Generate unique conversation ID
  const generateConversationId = useCallback(() => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create message object
  const createMessage = useCallback((role, text, phase = currentPhase, metadata = {}) => {
    return {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      text,
      timestamp: new Date(),
      audioPlayed: false,
      phase,
      metadata
    };
  }, [currentPhase]);

  // Generate mock responses for testing
  const generateMockResponse = useCallback((phase, turnCount) => {
    const mockResponses = {
      intro: [
        "Hi there! I'm so excited to practice with you today. We're going to work on making friends at school. Are you ready to begin?",
        "Welcome! I'm here to help you practice social skills. Let's work on this scenario together.",
        "Hello! I'm your practice partner. Let's explore this social situation step by step."
      ],
      practice: [
        "That's a really thoughtful response! I like how you're considering the other person's feelings. What would you say next?",
        "Nice work! That shows you're paying attention. Can you tell me more about why you chose that approach?",
        "That's interesting! How do you think the other person might respond to what you just said?",
        "Great job! You're doing really well. Let's take it a step further - what could you add to make it even better?",
        "I like where you're going with this! That's exactly the kind of thinking that helps in social situations.",
        "Excellent! You're showing good understanding. Let me ask you this - what else could you try?",
        "That's a good point! How might you handle this differently if you were feeling nervous?",
        "I can see you're really thinking about this. What would make you feel more confident in this situation?"
      ],
      feedback: [
        "You did such a wonderful job today! I noticed you were really thinking carefully about your responses and considering the other person's perspective. That's exactly what makes good conversations. Keep practicing these skills!",
        "I'm really impressed with your effort! You showed great listening skills and gave thoughtful responses throughout our practice.",
        "Fantastic work! You've made real progress today. The key things you did well were being respectful and asking good questions.",
        "Amazing job! You demonstrated some really good social skills there. I can see you're growing in confidence."
      ],
      complete: [
        "Amazing work today! You should be really proud of yourself. I can't wait to see you practice these skills with your friends. Keep it up!",
        "Congratulations on finishing this scenario! You've learned a lot today and should feel confident about your social skills.",
        "Well done! You've successfully worked through this social situation and I'm proud of your progress.",
        "Excellent work! You've completed this practice session with flying colors. Keep practicing and you'll keep getting better!"
      ]
    };
    
    const phaseResponses = mockResponses[phase] || mockResponses.practice;
    const index = Math.min(turnCount, phaseResponses.length - 1);
    const responseText = phaseResponses[index];
    
    return {
      text: responseText,
      phase: phase,
      shouldContinue: phase !== 'complete',
      feedback: phase === 'feedback' ? "You showed great social skills today!" : null,
      encouragement: "Keep up the great work!",
      hints: [],
      metadata: {
        confidence: 0.9,
        responseTime: 1000,
        tokensUsed: 0,
        isMock: true
      }
    };
  }, []);

  // Generate AI response using Claude API or mock responses
  const generateAIResponse = useCallback(async (conversationHistory, currentPhase, retryAttempt = 0) => {
    try {
      setIsAIThinking(true);
      setError(null);

      // Use mock responses if enabled
      if (USE_MOCK) {
        console.log('🤖 Using mock responses (backend unavailable)');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        return generateMockResponse(currentPhase, turnCount.current);
      }

      // Rate limiting - prevent too many requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      
      lastRequestTime.current = Date.now();

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${apiBaseUrl}/api/voice/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLAUDE_API_KEY || ''}`
        },
        body: JSON.stringify({
          conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
          scenario: conversationContext.current.scenario,
          gradeLevel: conversationContext.current.gradeLevel,
          phase: currentPhase,
          performance: {
            totalTurns: turnCount.current,
            successfulExchanges: performance.successfulExchanges,
            hesitations: performance.hesitations,
            hintsGiven: performance.hintsGiven
          },
          conversationId,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate AI response');
      }

      // Reset retry count on success
      setRetryCount(0);
      setBackendStatus('online');
      
      return {
        text: data.response,
        phase: data.nextPhase || currentPhase,
        shouldContinue: data.shouldContinue !== false,
        feedback: data.feedback || null,
        encouragement: data.encouragement || null,
        hints: data.hints || [],
        metadata: {
          confidence: data.confidence || 0.8,
          responseTime: data.responseTime || 0,
          tokensUsed: data.tokensUsed || 0
        }
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Set backend status to offline
      setBackendStatus('offline');
      
      // Better error logging
      if (error.name === 'AbortError') {
        console.log('⏱️ Request timeout - using fallback');
      } else if (error.message.includes('fetch') || error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
        console.log('🔌 Network error - backend may be down');
      } else {
        console.error('❌ Unexpected error:', error);
      }
      
      // Retry logic (reduced to prevent infinite loops)
      if (retryAttempt < maxRetries) {
        console.log(`Retrying AI response generation (attempt ${retryAttempt + 1}/${maxRetries})`);
        setRetryCount(retryAttempt + 1);
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000));
        return generateAIResponse(conversationHistory, currentPhase, retryAttempt + 1);
      }
      
      // Always return a valid response - use mock as fallback
      console.log('🔄 Using mock response as fallback');
      return generateMockResponse(currentPhase, turnCount.current);
    } finally {
      setIsAIThinking(false);
    }
  }, [apiBaseUrl, conversationId, performance, maxRetries, USE_MOCK, generateMockResponse]);

  // Generate fallback response when API fails
  const generateFallbackResponse = useCallback((phase, error) => {
    const fallbackResponses = {
      intro: [
        "Hi there! I'm here to help you practice social skills. Let's work on this scenario together.",
        "Welcome! I'm excited to practice with you today. Let's start with this situation.",
        "Hello! I'm your practice partner. Let's explore this social scenario step by step."
      ],
      practice: [
        "That's interesting! Can you tell me more about what you're thinking?",
        "I see. How do you think the other person might feel in this situation?",
        "Good point! What would you do next in this scenario?",
        "I understand. Let's think about this from a different angle.",
        "That's a thoughtful response. How might you handle this differently?"
      ],
      feedback: [
        "You did a great job working through that scenario! You showed good thinking.",
        "I'm proud of how you handled that situation. You're learning and growing!",
        "Excellent work! You demonstrated some really good social skills there.",
        "You're making great progress! Keep up the wonderful work."
      ],
      complete: [
        "Great job completing this practice session! You've learned a lot today.",
        "Congratulations on finishing this scenario! You should be proud of your progress.",
        "Well done! You've successfully worked through this social situation.",
        "Amazing work! You've completed this practice session with flying colors."
      ]
    };

    const responses = fallbackResponses[phase] || fallbackResponses.practice;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: randomResponse,
      phase: phase,
      shouldContinue: phase !== 'complete',
      feedback: null,
      encouragement: "Keep up the great work!",
      hints: [],
      metadata: {
        confidence: 0.5,
        responseTime: 0,
        tokensUsed: 0,
        isFallback: true,
        error: error.message
      }
    };
  }, []);

  // Update performance metrics
  const updatePerformance = useCallback((type, value = 1) => {
    setPerformance(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'turn':
          updated.totalTurns += value;
          turnCount.current += value;
          break;
        case 'successfulExchange':
          updated.successfulExchanges += value;
          break;
        case 'hesitation':
          updated.hesitations += value;
          break;
        case 'hint':
          updated.hintsGiven += value;
          break;
        case 'start':
          updated.startTime = new Date();
          conversationStartTime.current = Date.now();
          break;
        case 'end':
          updated.endTime = new Date();
          updated.duration = Date.now() - conversationStartTime.current;
          updated.score = calculateScore(updated);
          break;
        default:
          break;
      }
      
      return updated;
    });
  }, []);

  // Calculate performance score
  const calculateScore = useCallback((perf) => {
    const baseScore = 50;
    const successBonus = perf.successfulExchanges * 10;
    const hesitationPenalty = perf.hesitations * 5;
    const hintPenalty = perf.hintsGiven * 3;
    const completionBonus = perf.totalTurns >= 5 ? 20 : 0;
    
    return Math.max(0, Math.min(100, baseScore + successBonus - hesitationPenalty - hintPenalty + completionBonus));
  }, []);

  // Start a new conversation
  const startConversation = useCallback(async () => {
    try {
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      setIsActive(true);
      setCurrentPhase('intro');
      setMessages([]);
      setError(null);
      setRetryCount(0);
      
      // Reset performance tracking
      setPerformance({
        totalTurns: 0,
        successfulExchanges: 0,
        hesitations: 0,
        hintsGiven: 0,
        score: 0,
        startTime: null,
        endTime: null,
        duration: 0
      });
      
      turnCount.current = 0;
      conversationStartTime.current = Date.now();
      updatePerformance('start');
      
      // Generate initial AI message
      const aiResponse = await generateAIResponse([], 'intro');
      
      const initialMessage = createMessage('ai', aiResponse.text, 'intro', {
        conversationId: newConversationId,
        ...aiResponse.metadata
      });
      
      setMessages([initialMessage]);
      
      return {
        success: true,
        conversationId: newConversationId,
        initialMessage
      };
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }, [generateConversationId, generateAIResponse, createMessage, updatePerformance]);

  // Send user message and get AI response
  const sendUserMessage = useCallback(async (userText) => {
    if (!isActive || !userText.trim()) {
      return { success: false, error: 'No active conversation or empty message' };
    }

    try {
      setIsListening(false);
      updatePerformance('turn');
      
      // Create user message
      const userMessage = createMessage('user', userText.trim(), currentPhase);
      lastUserMessage.current = userMessage;
      
      // Add user message to conversation
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Detect hesitation or confusion
      if (userText.toLowerCase().includes('um') || userText.toLowerCase().includes('uh')) {
        updatePerformance('hesitation');
      }
      
      // Generate AI response
      const aiResponse = await generateAIResponse(updatedMessages, currentPhase);
      
      // Create AI message
      const aiMessage = createMessage('ai', aiResponse.text, aiResponse.phase, {
        ...aiResponse.metadata,
        feedback: aiResponse.feedback,
        encouragement: aiResponse.encouragement,
        hints: aiResponse.hints
      });
      
      // Add AI message to conversation
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Update phase if needed
      if (aiResponse.phase !== currentPhase) {
        setCurrentPhase(aiResponse.phase);
      }
      
      // Check if conversation should continue
      if (!aiResponse.shouldContinue || turnCount.current >= maxTurns) {
        await endConversation();
      }
      
      // Track successful exchange
      updatePerformance('successfulExchange');
      
      return {
        success: true,
        userMessage,
        aiMessage,
        shouldContinue: aiResponse.shouldContinue,
        phase: aiResponse.phase
      };
      
    } catch (error) {
      console.error('Error sending user message:', error);
      setError(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }, [isActive, messages, currentPhase, generateAIResponse, createMessage, updatePerformance, maxTurns]);

  // End the conversation
  const endConversation = useCallback(async () => {
    try {
      setIsActive(false);
      setIsListening(false);
      updatePerformance('end');
      
      // Generate final summary message if not already in complete phase
      if (currentPhase !== 'complete') {
        const finalResponse = await generateAIResponse(messages, 'complete');
        const finalMessage = createMessage('ai', finalResponse.text, 'complete', {
          ...finalResponse.metadata,
          isFinal: true
        });
        
        setMessages(prev => [...prev, finalMessage]);
        setCurrentPhase('complete');
      }
      
      // Prepare completion data
      const completionData = {
        conversationId,
        scenario: conversationContext.current.scenario,
        gradeLevel: conversationContext.current.gradeLevel,
        performance: {
          ...performance,
          totalTurns: turnCount.current,
          duration: Date.now() - conversationStartTime.current,
          score: calculateScore({ ...performance, totalTurns: turnCount.current })
        },
        messages: messages,
        completedAt: new Date(),
        success: true
      };
      
      // Call completion callback
      if (onComplete) {
        onComplete(completionData);
      }
      
      return completionData;
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }, [isActive, currentPhase, messages, generateAIResponse, createMessage, updatePerformance, conversationId, performance, calculateScore, onComplete]);

  // Handle conversation timeout
  const handleTimeout = useCallback(() => {
    if (isActive && turnCount.current > 0) {
      console.log('Conversation timeout - ending session');
      endConversation();
    }
  }, [isActive, endConversation]);

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${apiBaseUrl}/api/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        console.log('Backend health check failed:', error.message);
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();
  }, [apiBaseUrl]);

  // Auto-timeout after 10 minutes of inactivity
  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(handleTimeout, 10 * 60 * 1000); // 10 minutes
      return () => clearTimeout(timeout);
    }
  }, [isActive, handleTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        endConversation();
      }
    };
  }, []);

  // Reset conversation state
  const resetConversation = useCallback(() => {
    setMessages([]);
    setIsAIThinking(false);
    setIsListening(false);
    setCurrentPhase('intro');
    setConversationId(null);
    setIsActive(false);
    setError(null);
    setRetryCount(0);
    turnCount.current = 0;
    lastUserMessage.current = null;
    
    setPerformance({
      totalTurns: 0,
      successfulExchanges: 0,
      hesitations: 0,
      hintsGiven: 0,
      score: 0,
      startTime: null,
      endTime: null,
      duration: 0
    });
  }, []);

  // Get conversation statistics
  const getStats = useCallback(() => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      aiMessages: messages.filter(m => m.role === 'ai').length,
      currentPhase,
      isActive,
      performance: {
        ...performance,
        totalTurns: turnCount.current,
        duration: isActive ? Date.now() - conversationStartTime.current : performance.duration
      },
      error,
      retryCount
    };
  }, [messages, currentPhase, isActive, performance, error, retryCount]);

  return {
    // Core state
    messages,
    isAIThinking,
    isListening,
    setIsListening,
    currentPhase,
    conversationId,
    isActive,
    error,
    backendStatus,
    
    // Performance tracking
    performance: {
      ...performance,
      totalTurns: turnCount.current,
      duration: isActive ? Date.now() - conversationStartTime.current : performance.duration
    },
    
    // Actions
    startConversation,
    sendUserMessage,
    endConversation,
    resetConversation,
    
    // Utilities
    getStats,
    phases,
    
    // Configuration
    maxTurns,
    apiBaseUrl,
    USE_MOCK
  };
};

export default useVoiceConversation;

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

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiPath } from '../utils/apiBase';
import humeEviService from '../services/humeEviService';
import heartRateService, { HR_ZONES } from '../services/heartRateService';

/**
 * Incognito Mode Hook
 * Real-time speech analysis and coaching delivery using Hume EVI
 */

const COACHING_PROMPTS = {
  breathe: { cue: 'yellow', whisper: 'Take a breath', cooldown: 8000 },
  slowDown: { cue: 'yellow', whisper: 'Slow down', cooldown: 6000 },
  yourTurn: { cue: 'blue', whisper: 'Your turn', cooldown: 4000 },
  listen: { cue: 'blue', whisper: 'Listen', cooldown: 8000 },
  askQuestion: { cue: 'purple', whisper: 'Ask a question', cooldown: 10000 },
  goodJob: { cue: 'green', whisper: 'Nice!', cooldown: 8000 },
  confidence: { cue: 'green', whisper: "You've got this", cooldown: 12000 },
  fillerWords: { cue: 'yellow', whisper: 'Watch the ums', cooldown: 10000 },
  tooQuiet: { cue: 'blue', whisper: 'Speak up', cooldown: 8000 },
  greatPace: { cue: 'green', whisper: 'Great pace!', cooldown: 10000 },
  listening: { cue: 'blue', whisper: 'I hear you', cooldown: 15000 },
  // Emotion-based coaching
  nervous: { cue: 'yellow', whisper: 'Relax, you\'re doing great', cooldown: 15000 },
  excited: { cue: 'green', whisper: 'Great energy!', cooldown: 15000 },
  confused: { cue: 'purple', whisper: 'Take a moment', cooldown: 10000 },
  // Heart rate-based coaching
  hrElevated: { cue: 'yellow', whisper: 'Take a slow breath', cooldown: 20000 },
  hrHigh: { cue: 'yellow', whisper: 'Breathe in... and out', cooldown: 15000 },
  hrCalming: { cue: 'green', whisper: 'Heart rate coming down, good!', cooldown: 25000 },
  hrCalm: { cue: 'green', whisper: 'You\'re calm and focused', cooldown: 30000 }
};

// Haptic vibration patterns for different coaching types (in milliseconds)
// Pattern format: [vibrate, pause, vibrate, pause, ...] or single number for simple vibration
const HAPTIC_PATTERNS = {
  // Green (Positive): Gentle double-tap - encouraging
  green: [50, 80, 50],
  // Yellow (Pacing): Single longer pulse - attention/slow down
  yellow: [150],
  // Blue (Engagement): Quick triple-tap - call to action
  blue: [40, 60, 40, 60, 40],
  // Purple (Suggestion): Soft double with pause - thoughtful
  purple: [80, 120, 80]
};

const CUE_CONFIGS = {
  neutral: {
    color: '#6B7280',
    bg: 'rgba(30, 30, 30, 0.95)',
    glow: 'none',
    label: 'Listening',
    eyeColor: '#4A90E2',
    mouthColor: '#34D399'
  },
  green: {
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.12)',
    glow: '0 0 60px rgba(52, 211, 153, 0.3)',
    label: 'Great!',
    eyeColor: '#34D399',
    mouthColor: '#34D399'
  },
  yellow: {
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.12)',
    glow: '0 0 60px rgba(251, 191, 36, 0.3)',
    label: 'Breathe',
    eyeColor: '#FBBF24',
    mouthColor: '#FBBF24'
  },
  blue: {
    color: '#4A90E2',
    bg: 'rgba(74, 144, 226, 0.12)',
    glow: '0 0 60px rgba(74, 144, 226, 0.3)',
    label: 'Your Turn',
    eyeColor: '#4A90E2',
    mouthColor: '#4A90E2'
  },
  purple: {
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
    glow: '0 0 60px rgba(139, 92, 246, 0.3)',
    label: 'Ask',
    eyeColor: '#8B5CF6',
    mouthColor: '#8B5CF6'
  }
};

// Filler words to detect
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'er', 'ah'];

// Sentence-ending indicators
const SENTENCE_ENDERS = /[.!?]+$/;

// Emotion to coaching mapping
const EMOTION_COACHING_MAP = {
  'Anxiety': 'nervous',
  'Fear': 'nervous',
  'Nervousness': 'nervous',
  'Excitement': 'excited',
  'Joy': 'excited',
  'Enthusiasm': 'excited',
  'Confusion': 'confused',
  'Doubt': 'confused',
  'Contempt': 'breathe',
  'Anger': 'breathe',
  'Frustration': 'breathe'
};

const useIncognitoMode = ({
  gradeLevel = '6-8',
  enableWhisper = true,
  enableVisualCues = true,
  enableHaptics = true,  // NEW: Enable haptic vibration feedback
  enableHeartRate = false, // NEW: Enable heart rate monitoring
  heartRateMode = 'camera', // 'camera' or 'bluetooth'
  videoElement = null, // Required for camera-based HR detection
  onSessionUpdate
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentCue, setCurrentCue] = useState('neutral');
  const [sessionTime, setSessionTime] = useState(0);
  const [coachingLog, setCoachingLog] = useState([]);
  const [lastCoaching, setLastCoaching] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentEmotion, setCurrentEmotion] = useState(null);
  // Heart rate state
  const [heartRate, setHeartRate] = useState(null);
  const [heartRateZone, setHeartRateZone] = useState(null);
  const [heartRateStatus, setHeartRateStatus] = useState('disconnected');

  const timerRef = useRef(null);
  const lastCoachingTimeRef = useRef({});
  const transcriptBufferRef = useRef([]);
  const heartRateLogRef = useRef([]); // Track heart rate readings for analytics
  const lastHRZoneRef = useRef(null); // Track previous HR zone for coaching triggers
  const wordTimestampsRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const fillerCountRef = useRef(0);
  const lastSpeechTimeRef = useRef(Date.now());
  const hasGivenFirstFeedbackRef = useRef(false);
  const totalWordsSpokenRef = useRef(0);
  const sentenceCountRef = useRef(0);
  const goodSentencesRef = useRef(0);
  const emotionLogRef = useRef([]);
  const fillerWordsDetectedRef = useRef(0);
  const fillerWordBreakdownRef = useRef({}); // Track specific filler words
  const questionsAskedRef = useRef(0);
  const sessionStartTimeRef = useRef(null);
  const speakingPaceLogRef = useRef([]); // Track speaking pace over time
  const silenceDurationsRef = useRef([]); // Track silence periods

  // Get whisper config based on grade level
  const getWhisperConfig = useCallback(() => {
    const grade = parseInt(gradeLevel) || 6;
    if (grade <= 2) return { rate: 0.85, pitch: 1.1, volume: 0.25 };
    if (grade <= 5) return { rate: 0.9, pitch: 1.0, volume: 0.25 };
    if (grade <= 8) return { rate: 0.95, pitch: 0.95, volume: 0.3 };
    return { rate: 1.0, pitch: 0.9, volume: 0.3 };
  }, [gradeLevel]);

  // Deliver whispered coaching
  const deliverWhisper = useCallback((message) => {
    if (!enableWhisper || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const config = getWhisperConfig();
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    window.speechSynthesis.speak(utterance);
  }, [enableWhisper, getWhisperConfig]);

  // Deliver haptic vibration feedback
  const deliverHaptic = useCallback((cueType) => {
    if (!enableHaptics) return;

    // Check if Vibration API is supported
    if (!('vibrate' in navigator)) {
      console.log('📳 Vibration API not supported on this device');
      return;
    }

    const pattern = HAPTIC_PATTERNS[cueType];
    if (!pattern) {
      console.warn('📳 No haptic pattern for cue type:', cueType);
      return;
    }

    try {
      navigator.vibrate(pattern);
      console.log(`📳 Haptic delivered: ${cueType} pattern`, pattern);
    } catch (err) {
      console.warn('📳 Haptic vibration failed:', err);
    }
  }, [enableHaptics]);

  // Trigger coaching with cooldown check
  const triggerCoaching = useCallback((type) => {
    console.log('🎯 triggerCoaching called with:', type);
    const coaching = COACHING_PROMPTS[type];
    if (!coaching) {
      console.warn('❌ Unknown coaching type:', type);
      return;
    }

    const now = Date.now();
    const lastTime = lastCoachingTimeRef.current[type] || 0;
    if (now - lastTime < coaching.cooldown) {
      console.log('⏱️ Cooldown active for', type);
      return;
    }

    lastCoachingTimeRef.current[type] = now;
    console.log('✅ Triggering coaching:', type, '→', coaching.cue);

    if (enableVisualCues) {
      console.log('🎨 Setting cue to:', coaching.cue);
      setCurrentCue(coaching.cue);
      setTimeout(() => {
        console.log('🎨 Resetting cue to neutral');
        setCurrentCue('neutral');
      }, 3000);
    }

    // Deliver haptic feedback based on cue type
    deliverHaptic(coaching.cue);

    deliverWhisper(coaching.whisper);

    const logEntry = { type, message: coaching.whisper, timestamp: now };
    setCoachingLog(prev => [...prev, logEntry]);
    setLastCoaching(logEntry);

    if (onSessionUpdate) {
      onSessionUpdate({ type: 'coaching', prompt: type, message: coaching.whisper });
    }
  }, [enableVisualCues, deliverWhisper, deliverHaptic, onSessionUpdate]);

  // Analyze speech patterns - MORE RESPONSIVE
  const analyzeSpeechPatterns = useCallback((transcript) => {
    if (!transcript || transcript.length < 3) return;

    console.log('🔍 Analyzing speech:', transcript);
    const lowerTranscript = transcript.toLowerCase().trim();
    const words = lowerTranscript.split(/\s+/);
    const wordCount = words.length;

    // Check for filler words - trigger after just 1-2 in a phrase
    let fillerCount = 0;
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        fillerCount += matches.length;
        console.log(`📢 Found filler "${filler}": ${matches.length} times`);
      }
    });

    // Track total filler words and specific breakdown
    fillerWordsDetectedRef.current += fillerCount;
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        fillerWordBreakdownRef.current[filler] = (fillerWordBreakdownRef.current[filler] || 0) + matches.length;
      }
    });

    // Lower threshold - if 2+ filler words in one phrase, give gentle reminder
    if (fillerCount >= 2) {
      console.log('⚠️ Multiple filler words detected, triggering feedback');
      triggerCoaching('fillerWords');
      return; // Don't stack coaching
    }

    // Check if sentence ends with question mark - they're asking a question (good!)
    if (transcript.includes('?')) {
      questionsAskedRef.current++;
      console.log('❓ Question detected! Positive feedback');
      triggerCoaching('goodJob');
      return;
    }

    // Check speaking pace based on recent timestamps
    const timestamps = wordTimestampsRef.current;
    if (timestamps.length >= 2) {
      const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
      const wps = wordCount / Math.max(duration, 0.5);
      console.log(`📊 Speaking pace: ${wps.toFixed(2)} words/second`);

      if (wps > 3.0) {
        // Speaking too fast - lower threshold
        console.log('🏃 Speaking too fast!');
        triggerCoaching('slowDown');
        return;
      }
    }

    // Completed sentence detection - encourage after good complete thoughts
    if (SENTENCE_ENDERS.test(transcript.trim())) {
      sentenceCountRef.current++;
      console.log(`📝 Sentence completed (#${sentenceCountRef.current})`);

      // Every 2-3 complete sentences without issues = positive feedback
      if (sentenceCountRef.current >= 2 && fillerCount === 0) {
        goodSentencesRef.current++;
        if (goodSentencesRef.current >= 2) {
          console.log('🌟 Good progress! Positive reinforcement');
          // Rotate through positive feedback
          const positives = ['goodJob', 'greatPace', 'confidence'];
          const randomPositive = positives[Math.floor(Math.random() * positives.length)];
          triggerCoaching(randomPositive);
          goodSentencesRef.current = 0;
          sentenceCountRef.current = 0;
        }
      }
    }

    // If they mention words related to questions, suggest asking one
    const questionPrompts = ['think', 'wonder', 'curious', 'interesting', 'really'];
    if (questionPrompts.some(word => lowerTranscript.includes(word)) && !transcript.includes('?')) {
      console.log('💡 Opportunity to ask a question detected');
      // Only suggest occasionally
      if (Math.random() > 0.7) {
        triggerCoaching('askQuestion');
      }
    }
  }, [triggerCoaching]);

  // Process emotion data from Hume
  const processEmotion = useCallback((emotionData) => {
    if (!emotionData?.dominant) return;

    const dominantEmotion = emotionData.dominant.name;
    const score = emotionData.dominant.score;

    console.log(`😊 Dominant emotion: ${dominantEmotion} (${(score * 100).toFixed(1)}%)`);
    setCurrentEmotion({ name: dominantEmotion, score });

    // Log emotion for summary
    emotionLogRef.current.push({
      emotion: dominantEmotion,
      score,
      timestamp: Date.now()
    });

    // Only respond to strong emotions (score > 0.4)
    if (score > 0.4) {
      const coachingType = EMOTION_COACHING_MAP[dominantEmotion];
      if (coachingType) {
        console.log(`🎭 Emotion-based coaching: ${dominantEmotion} → ${coachingType}`);
        triggerCoaching(coachingType);
      }
    }
  }, [triggerCoaching]);

  // Handle transcript from Hume
  const handleTranscript = useCallback((transcript) => {
    console.log('🗣️ Hume transcript:', transcript);
    setCurrentTranscript(transcript);

    // First speech feedback
    if (transcript.length > 3 && !hasGivenFirstFeedbackRef.current) {
      console.log('🎉 First speech detected! Showing listening confirmation');
      hasGivenFirstFeedbackRef.current = true;
      triggerCoaching('listening');
    }

    // Count words
    const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
    totalWordsSpokenRef.current += wordCount;
    console.log(`📊 Total words spoken: ${totalWordsSpokenRef.current}`);

    // Store for analysis
    transcriptBufferRef.current.push(transcript);
    wordTimestampsRef.current.push(Date.now());

    // Keep buffer manageable
    if (transcriptBufferRef.current.length > 20) {
      transcriptBufferRef.current.shift();
    }
    if (wordTimestampsRef.current.length > 50) {
      wordTimestampsRef.current.shift();
    }

    // Analyze speech
    analyzeSpeechPatterns(transcript);

    // Periodic encouragement
    if (totalWordsSpokenRef.current > 0 && totalWordsSpokenRef.current % 25 === 0) {
      console.log('🌟 Periodic encouragement checkpoint!');
      triggerCoaching('goodJob');
    }

    // Update speaking state
    lastSpeechTimeRef.current = Date.now();
    setIsSpeaking(true);

    // Reset silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      setIsSpeaking(false);
      const silenceDuration = Date.now() - lastSpeechTimeRef.current;
      if (silenceDuration > 6000 && transcriptBufferRef.current.length > 0) {
        triggerCoaching('yourTurn');
      }
    }, 2000);
  }, [triggerCoaching, analyzeSpeechPatterns]);

  // Handle heart rate data and trigger appropriate coaching
  const handleHeartRate = useCallback((bpm, zone) => {
    console.log(`💓 Heart rate: ${bpm} BPM (${zone?.label || 'unknown'})`);
    setHeartRate(bpm);
    setHeartRateZone(zone);

    // Log for analytics
    heartRateLogRef.current.push({
      bpm,
      zone: zone?.key,
      timestamp: Date.now()
    });

    // Trigger coaching based on heart rate zone changes
    if (zone && zone.key !== lastHRZoneRef.current) {
      const prevZone = lastHRZoneRef.current;
      lastHRZoneRef.current = zone.key;

      // Going from HIGH/VERY_HIGH to lower = calming down
      if ((prevZone === 'HIGH' || prevZone === 'VERY_HIGH') &&
          (zone.key === 'ELEVATED' || zone.key === 'NORMAL' || zone.key === 'RESTING')) {
        triggerCoaching('hrCalming');
      }
      // Heart rate is elevated - give breathing reminder
      else if (zone.key === 'ELEVATED') {
        triggerCoaching('hrElevated');
      }
      // Heart rate is high/anxious
      else if (zone.key === 'HIGH' || zone.key === 'VERY_HIGH') {
        triggerCoaching('hrHigh');
      }
      // Heart rate is calm and steady
      else if (zone.key === 'RESTING' && prevZone !== 'RESTING') {
        triggerCoaching('hrCalm');
      }
    }

    // Notify session update
    if (onSessionUpdate) {
      onSessionUpdate({ type: 'heartRate', bpm, zone });
    }
  }, [triggerCoaching, onSessionUpdate]);

  // Handle heart rate zone change
  const handleHRZoneChange = useCallback((newZone, oldZone) => {
    console.log(`💓 Zone change: ${oldZone || 'none'} → ${newZone?.key}`);
    // Zone change coaching is handled in handleHeartRate
  }, []);

  // Start heart rate monitoring
  const startHeartRateMonitoring = useCallback(async () => {
    if (!enableHeartRate) return false;

    console.log(`💓 Starting heart rate monitoring (mode: ${heartRateMode})...`);
    setHeartRateStatus('connecting');
    heartRateLogRef.current = [];
    lastHRZoneRef.current = null;

    // Set up callbacks
    heartRateService.setCallbacks({
      onHeartRate: handleHeartRate,
      onZoneChange: handleHRZoneChange,
      onError: (error) => {
        console.error('💓 Heart rate error:', error);
        setHeartRateStatus('error');
      },
      onConnectionChange: (status) => {
        console.log('💓 HR connection status:', status);
        setHeartRateStatus(status);
      }
    });

    // Start based on mode
    if (heartRateMode === 'bluetooth') {
      return await heartRateService.startBluetoothMonitoring();
    } else if (heartRateMode === 'camera' && videoElement) {
      return await heartRateService.startCameraMonitoring(videoElement);
    } else {
      console.warn('💓 No valid heart rate mode or video element');
      return false;
    }
  }, [enableHeartRate, heartRateMode, videoElement, handleHeartRate, handleHRZoneChange]);

  // Start session with Hume EVI
  const startSession = useCallback(async () => {
    console.log('🚀 Starting Incognito Mode with Hume EVI...');
    setConnectionStatus('connecting');

    // Set up Hume EVI callbacks
    humeEviService.onTranscript = handleTranscript;
    humeEviService.onEmotion = processEmotion;
    humeEviService.onError = (error) => {
      console.error('❌ Hume EVI error:', error);
      setConnectionStatus('error');
    };
    humeEviService.onConnectionChange = (connected) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    };

    // Connect to Hume EVI
    const connected = await humeEviService.connect();
    if (!connected) {
      console.error('❌ Failed to connect to Hume EVI');
      setConnectionStatus('error');
      return false;
    }

    // Reset state
    setIsActive(true);
    setSessionTime(0);
    setCoachingLog([]);
    setCurrentCue('neutral');
    setCurrentTranscript('');
    lastCoachingTimeRef.current = {};
    transcriptBufferRef.current = [];
    wordTimestampsRef.current = [];
    fillerCountRef.current = 0;
    hasGivenFirstFeedbackRef.current = false;
    totalWordsSpokenRef.current = 0;
    sentenceCountRef.current = 0;
    goodSentencesRef.current = 0;
    emotionLogRef.current = [];
    fillerWordsDetectedRef.current = 0;
    fillerWordBreakdownRef.current = {};
    questionsAskedRef.current = 0;
    sessionStartTimeRef.current = Date.now();
    speakingPaceLogRef.current = [];
    silenceDurationsRef.current = [];

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Initial encouragement after 5 seconds
    setTimeout(() => {
      if (transcriptBufferRef.current.length === 0) {
        triggerCoaching('confidence');
      }
    }, 5000);

    // Start heart rate monitoring if enabled
    if (enableHeartRate) {
      startHeartRateMonitoring();
    }

    console.log('✅ Incognito Mode started successfully');
    return true;
  }, [handleTranscript, processEmotion, triggerCoaching, enableHeartRate, startHeartRateMonitoring]);

  // End session
  const endSession = useCallback(async () => {
    setIsActive(false);
    setConnectionStatus('disconnected');

    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    // Disconnect from Hume EVI
    humeEviService.disconnect();

    // Stop heart rate monitoring and get summary
    let heartRateSummary = null;
    if (enableHeartRate && heartRateService.isActive) {
      heartRateSummary = await heartRateService.stop();
      setHeartRateStatus('disconnected');
    }

    // Calculate emotion summary
    const emotionCounts = emotionLogRef.current.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Calculate coaching breakdown by category
    const coachingByCategory = {
      positive: 0,  // green cues
      pacing: 0,    // yellow cues (slow down, breathe)
      engagement: 0, // blue cues (your turn, listen)
      suggestions: 0 // purple cues (ask question)
    };

    coachingLog.forEach(log => {
      const coaching = COACHING_PROMPTS[log.type];
      if (coaching) {
        if (coaching.cue === 'green') coachingByCategory.positive++;
        else if (coaching.cue === 'yellow') coachingByCategory.pacing++;
        else if (coaching.cue === 'blue') coachingByCategory.engagement++;
        else if (coaching.cue === 'purple') coachingByCategory.suggestions++;
      }
    });

    const summary = {
      duration: sessionTime,
      startTime: sessionStartTimeRef.current,
      endTime: Date.now(),
      totalCoachingPrompts: coachingLog.length,
      promptBreakdown: coachingLog.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {}),
      coachingByCategory,
      totalWordsSpoken: totalWordsSpokenRef.current,
      fillerWordsDetected: fillerWordsDetectedRef.current,
      fillerWordBreakdown: { ...fillerWordBreakdownRef.current },
      questionsAsked: questionsAskedRef.current,
      emotionLog: emotionLogRef.current,
      topEmotions,
      coachingLog: coachingLog.map(log => ({
        ...log,
        relativeTime: log.timestamp - sessionStartTimeRef.current
      })),
      speakingPaceLog: speakingPaceLogRef.current,
      silenceDurations: silenceDurationsRef.current,
      // Heart rate data for teacher/parent dashboard
      heartRate: heartRateSummary ? {
        averageBPM: heartRateSummary.averageBPM,
        maxBPM: heartRateSummary.maxBPM,
        minBPM: heartRateSummary.minBPM,
        timeInZones: heartRateSummary.timeInZones,
        stressEvents: heartRateSummary.stressEvents,
        readings: heartRateLogRef.current,
        mode: heartRateSummary.mode
      } : null
    };

    if (onSessionUpdate) {
      onSessionUpdate({ type: 'sessionEnd', summary });
    }

    console.log('👋 Session ended:', summary);
    return summary;
  }, [sessionTime, coachingLog, onSessionUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      humeEviService.disconnect();
      // Stop heart rate monitoring on cleanup
      if (heartRateService.isActive) {
        heartRateService.stop();
      }
    };
  }, []);

  return {
    isActive,
    currentCue,
    cueConfig: CUE_CONFIGS[currentCue],
    sessionTime,
    coachingLog,
    lastCoaching,
    isSpeaking,
    currentTranscript,
    analysisStatus,
    connectionStatus,
    currentEmotion,
    // Heart rate data
    heartRate,
    heartRateZone,
    heartRateStatus,
    startHeartRateMonitoring,
    // Actions
    startSession,
    endSession,
    triggerCoaching,
    setIsSpeaking
  };
};

export { CUE_CONFIGS, COACHING_PROMPTS };
export default useIncognitoMode;

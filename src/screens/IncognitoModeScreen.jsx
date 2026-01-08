import React, { useState, useRef, useEffect } from 'react';
import useIncognitoMode from '../hooks/useIncognitoMode';
import heartRateService from '../services/heartRateService';

const IncognitoModeScreen = ({ gradeLevel = '6-8', onBack, onSessionComplete }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [enableWhisper, setEnableWhisper] = useState(true);
  const [enableVisual, setEnableVisual] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [enableHeartRate, setEnableHeartRate] = useState(false);
  const [heartRateMode, setHeartRateMode] = useState('camera'); // 'camera', 'bluetooth', or 'applewatch'
  const [appleWatchInfo, setAppleWatchInfo] = useState(null);
  const [enableWatchCues, setEnableWatchCues] = useState(false);
  const [watchSessionId, setWatchSessionId] = useState(null);

  // Video ref for camera-based HR detection
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  const {
    isActive,
    currentCue,
    cueConfig,
    sessionTime,
    coachingLog,
    lastCoaching,
    isSpeaking,
    currentTranscript,
    analysisStatus,
    connectionStatus,
    currentEmotion,
    heartRate,
    heartRateZone,
    heartRateStatus,
    startHeartRateMonitoring,
    startSession,
    endSession,
    triggerCoaching
  } = useIncognitoMode({
    gradeLevel,
    enableWhisper,
    enableVisualCues: enableVisual,
    enableHaptics,
    enableHeartRate,
    heartRateMode,
    videoElement: videoRef.current
  });

  // Load saved watch session ID on mount
  useEffect(() => {
    const savedWatchSessionId = localStorage.getItem('watchSessionId');
    if (savedWatchSessionId) {
      setWatchSessionId(savedWatchSessionId);
      setEnableWatchCues(true);
    }
  }, []);

  // Start camera for heart rate detection when enabled
  useEffect(() => {
    if (enableHeartRate && heartRateMode === 'camera' && isActive) {
      startCameraForHR();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enableHeartRate, heartRateMode, isActive]);

  const startCameraForHR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // Start heart rate monitoring after video is playing
        setTimeout(() => startHeartRateMonitoring?.(), 500);
      }
    } catch (err) {
      console.error('Failed to start camera for HR:', err);
    }
  };

  const connectBluetoothHR = async () => {
    if (!heartRateService.isBluetoothSupported()) {
      alert('Bluetooth is not supported in this browser. Try Chrome on desktop or Android.');
      return;
    }
    const success = await heartRateService.startBluetoothMonitoring();
    if (success) {
      setHeartRateMode('bluetooth');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    await startSession();
  };

  const handleEnd = () => {
    const summary = endSession();
    setSessionSummary(summary);
    setShowSummary(true);
    if (onSessionComplete) onSessionComplete(summary);
  };

  // Calculate performance score
  const calculateScore = (summary) => {
    if (!summary) return 0;
    let score = 50; // Base score

    // Positive coaching adds points
    score += (summary.coachingByCategory?.positive || 0) * 5;

    // Questions asked add points
    score += (summary.questionsAsked || 0) * 8;

    // Filler words reduce points slightly
    score -= Math.min((summary.fillerWordsDetected || 0) * 2, 20);

    // Duration bonus (up to 5 mins)
    const durationMins = (summary.duration || 0) / 60;
    score += Math.min(durationMins * 3, 15);

    // Word count bonus
    score += Math.min((summary.totalWordsSpoken || 0) / 10, 15);

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Great job!';
    if (score >= 40) return 'Good effort!';
    return 'Keep practicing!';
  };

  // Session Summary View
  if (showSummary && sessionSummary) {
    const score = calculateScore(sessionSummary);
    const coachingCategories = sessionSummary.coachingByCategory || { positive: 0, pacing: 0, engagement: 0, suggestions: 0 };
    const totalCategoryCoaching = coachingCategories.positive + coachingCategories.pacing + coachingCategories.engagement + coachingCategories.suggestions;
    const fillerBreakdown = sessionSummary.fillerWordBreakdown || {};
    const hasFillerWords = Object.keys(fillerBreakdown).length > 0;

    // Color guide data
    const colorGuide = [
      { color: 'emerald', hex: '#34D399', name: 'Green', meaning: 'Positive Feedback', description: 'You did something great! Keep it up.', examples: ['Nice!', 'Great pace!', "You've got this", 'Great energy!'] },
      { color: 'yellow', hex: '#FBBF24', name: 'Yellow', meaning: 'Pacing Reminder', description: 'Slow down or take a breath.', examples: ['Take a breath', 'Slow down', 'Watch the ums', 'Relax'] },
      { color: 'blue', hex: '#4A90E2', name: 'Blue', meaning: 'Engagement Cue', description: "It's your turn or time to listen.", examples: ['Your turn', 'Listen', 'Speak up', 'I hear you'] },
      { color: 'purple', hex: '#8B5CF6', name: 'Purple', meaning: 'Suggestion', description: 'Try asking a question or taking a moment.', examples: ['Ask a question', 'Take a moment'] }
    ];

    // Practice suggestions based on session
    const getPracticeSuggestions = () => {
      const suggestions = [];

      // Filler word specific suggestions
      if (hasFillerWords) {
        const topFiller = Object.entries(fillerBreakdown).sort((a, b) => b[1] - a[1])[0];
        if (topFiller) {
          suggestions.push({
            icon: '🎯',
            title: `Replace "${topFiller[0]}" with pauses`,
            description: `You said "${topFiller[0]}" ${topFiller[1]} time${topFiller[1] > 1 ? 's' : ''}. Practice pausing silently instead.`,
            exercise: `Try this: Say a sentence, then pause for 2 seconds before continuing. Silence is powerful!`
          });
        }
      }

      // Question asking
      if ((sessionSummary.questionsAsked || 0) === 0) {
        suggestions.push({
          icon: '❓',
          title: 'Practice asking questions',
          description: 'Questions show you\'re interested and keep conversations going.',
          exercise: 'Try the "What, How, Why" method: After someone speaks, ask a What, How, or Why question about what they said.'
        });
      }

      // Pacing issues
      if (coachingCategories.pacing > 2) {
        suggestions.push({
          icon: '🐢',
          title: 'Slow down your speech',
          description: 'Speaking too fast can make it hard for others to follow.',
          exercise: 'Practice the "Breathe-Speak-Breathe" pattern: Take a breath, say one sentence, take another breath.'
        });
      }

      // Engagement
      if (coachingCategories.engagement > coachingCategories.positive) {
        suggestions.push({
          icon: '👂',
          title: 'Practice active listening',
          description: 'Good conversations need both speaking and listening.',
          exercise: 'Try the "Mirror" technique: Repeat back a short summary of what the other person said before responding.'
        });
      }

      // Duration
      if ((sessionSummary.duration || 0) < 60) {
        suggestions.push({
          icon: '⏱️',
          title: 'Extend your conversations',
          description: 'Longer practice sessions help build confidence.',
          exercise: 'Set a goal: Try to keep your next conversation going for at least 2 minutes.'
        });
      }

      // Positive reinforcement
      if (score >= 70) {
        suggestions.push({
          icon: '⭐',
          title: 'Challenge yourself!',
          description: 'You\'re doing great! Try a more advanced challenge.',
          exercise: 'Next session: Try to ask at least 3 questions and use no filler words.'
        });
      }

      return suggestions.slice(0, 3); // Max 3 suggestions
    };

    const practiceSuggestions = getPracticeSuggestions();

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white overflow-y-auto">
        <div className="max-w-lg mx-auto p-6 pb-32">
          {/* Header with animated orb showing all colors */}
          <div className="text-center mb-6 pt-6">
            <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
              {/* Animated color rings */}
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border-4 border-yellow-400/40 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute inset-4 rounded-full border-4 border-blue-400/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
              <div className="absolute inset-6 rounded-full border-4 border-purple-400/40 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '1.5s' }} />
              {/* Face in center */}
              <div className="relative flex flex-col items-center justify-center" style={{ transform: 'scale(0.5)' }}>
                {/* Eyes */}
                <div className="flex gap-10 mb-5">
                  <div className="w-4 h-4 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 15px rgba(52, 211, 153, 0.8)' }} />
                  <div className="w-4 h-4 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 15px rgba(52, 211, 153, 0.8)' }} />
                </div>
                {/* Smile */}
                <div style={{
                  width: '70px',
                  height: '45px',
                  borderLeft: '10px solid #34D399',
                  borderRight: '10px solid #34D399',
                  borderBottom: '10px solid #34D399',
                  borderTop: 'none',
                  borderRadius: '0 0 35px 35px',
                  filter: 'drop-shadow(0 0 15px rgba(52, 211, 153, 0.6))'
                }} />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Session Complete!
            </h2>
            <p className="text-gray-400 mt-2">Your detailed conversation analysis</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle
                  cx="56" cy="56" r="48"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${score * 3.02} 302`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Score</span>
              </div>
            </div>
          </div>
          <p className={`text-center text-lg font-medium mb-6 ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-gray-900/60 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-white">{formatTime(sessionSummary.duration)}</p>
              <p className="text-[10px] text-gray-500 mt-1">Duration</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-white">{sessionSummary.totalWordsSpoken || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Words</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-emerald-400">{sessionSummary.questionsAsked || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Questions</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xl font-bold text-yellow-400">{sessionSummary.fillerWordsDetected || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Fillers</p>
            </div>
          </div>

          {/* COLOR GUIDE - What the colors mean */}
          <div className="bg-gray-900/60 rounded-2xl p-5 mb-6 border border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></span>
              What the Colors Mean
            </h3>
            <div className="space-y-4">
              {colorGuide.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.hex}20`, border: `2px solid ${item.hex}40` }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.hex }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{item.name} = {item.meaning}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.examples.slice(0, 2).map((ex, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                          "{ex}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Breakdown with colors */}
          <div className="bg-gray-900/60 rounded-2xl p-5 mb-6 border border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Your Coaching Moments</h3>
            <div className="space-y-3">
              {[
                { name: 'Positive (Green)', color: 'emerald', count: coachingCategories.positive },
                { name: 'Pacing (Yellow)', color: 'yellow', count: coachingCategories.pacing },
                { name: 'Engagement (Blue)', color: 'blue', count: coachingCategories.engagement },
                { name: 'Suggestions (Purple)', color: 'purple', count: coachingCategories.suggestions }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${item.color}-400`} />
                    <span className="text-gray-300 text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color}-400 rounded-full transition-all`}
                        style={{ width: `${totalCategoryCoaching ? (item.count / Math.max(totalCategoryCoaching, 1)) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-6 text-right text-${item.color}-400`}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
            {totalCategoryCoaching === 0 && (
              <p className="text-xs text-gray-500 text-center mt-3">No coaching moments - try speaking more!</p>
            )}
          </div>

          {/* FILLER WORDS BREAKDOWN */}
          {hasFillerWords && (
            <div className="bg-yellow-500/10 rounded-2xl p-5 mb-6 border border-yellow-500/20">
              <h3 className="text-sm font-semibold text-yellow-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span>🗣️</span> Filler Words Detected
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(fillerBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([word, count], idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                      <span className="text-yellow-200 font-medium">"{word}"</span>
                      <span className="text-yellow-400 font-bold">{count}x</span>
                    </div>
                  ))}
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs text-yellow-200/80">
                  <strong>Tip:</strong> Instead of saying "{Object.keys(fillerBreakdown)[0]}", try pausing silently.
                  A brief pause sounds confident and gives you time to think!
                </p>
              </div>
            </div>
          )}

          {/* Top Emotions */}
          {sessionSummary.topEmotions && sessionSummary.topEmotions.length > 0 && (
            <div className="bg-purple-500/10 rounded-2xl p-5 mb-6 border border-purple-500/20">
              <h3 className="text-sm font-semibold text-purple-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span>😊</span> Detected Emotions
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessionSummary.topEmotions.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200"
                  >
                    <span className="font-medium">{item.emotion}</span>
                    <span className="text-purple-400/60 ml-1 text-sm">({item.count}x)</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-200/60 mt-3">
                These emotions were detected in your voice during the session.
              </p>
            </div>
          )}

          {/* Heart Rate Summary - for teachers/parents */}
          {sessionSummary.heartRate && (
            <div className="bg-red-500/10 rounded-2xl p-5 mb-6 border border-red-500/20">
              <h3 className="text-sm font-semibold text-red-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span>💓</span> Heart Rate Analysis
              </h3>

              {/* Key HR Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{sessionSummary.heartRate.averageBPM}</p>
                  <p className="text-[10px] text-gray-500">Avg BPM</p>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-300">{sessionSummary.heartRate.minBPM}</p>
                  <p className="text-[10px] text-gray-500">Min BPM</p>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-500">{sessionSummary.heartRate.maxBPM}</p>
                  <p className="text-[10px] text-gray-500">Max BPM</p>
                </div>
              </div>

              {/* Time in Zones */}
              {sessionSummary.heartRate.timeInZones && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Time in Heart Rate Zones:</p>
                  <div className="space-y-2">
                    {[
                      { zone: 'RESTING', label: 'Calm', color: '#34D399' },
                      { zone: 'NORMAL', label: 'Normal', color: '#4A90E2' },
                      { zone: 'ELEVATED', label: 'Elevated', color: '#FBBF24' },
                      { zone: 'HIGH', label: 'Anxious', color: '#F97316' },
                      { zone: 'VERY_HIGH', label: 'Stressed', color: '#EF4444' }
                    ].filter(z => sessionSummary.heartRate.timeInZones[z.zone] > 0).map((zone, idx) => {
                      const seconds = sessionSummary.heartRate.timeInZones[zone.zone] || 0;
                      const totalSeconds = Object.values(sessionSummary.heartRate.timeInZones).reduce((a, b) => a + b, 0);
                      const percentage = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                          <span className="text-xs text-gray-300 w-16">{zone.label}</span>
                          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${percentage}%`, backgroundColor: zone.color }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{seconds}s</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stress Events */}
              {sessionSummary.heartRate.stressEvents && sessionSummary.heartRate.stressEvents.length > 0 && (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-300 font-medium mb-2">
                    {sessionSummary.heartRate.stressEvents.length} Stress Spike{sessionSummary.heartRate.stressEvents.length > 1 ? 's' : ''} Detected
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Moments when heart rate increased rapidly (15+ BPM in 10 seconds).
                    This can indicate moments of anxiety or excitement during the conversation.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-red-200/50 mt-3">
                Detection mode: {sessionSummary.heartRate.mode === 'camera' ? 'Camera (rPPG)' : 'Bluetooth HR Monitor'}
              </p>
            </div>
          )}

          {/* PRACTICE SUGGESTIONS */}
          {practiceSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-purple-500/10 rounded-2xl p-5 mb-6 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                <span>📚</span> What to Practice Next
              </h3>
              <div className="space-y-4">
                {practiceSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                        <div className="mt-2 p-2 bg-white/5 rounded-lg">
                          <p className="text-xs text-emerald-300">
                            <strong>Exercise:</strong> {suggestion.exercise}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coaching Timeline */}
          {sessionSummary.coachingLog && sessionSummary.coachingLog.length > 0 && (
            <div className="bg-gray-900/60 rounded-2xl p-5 mb-6 border border-white/5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span>📋</span> Session Timeline
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sessionSummary.coachingLog.slice(-10).map((log, idx) => {
                  const relativeSeconds = Math.floor((log.relativeTime || 0) / 1000);
                  const mins = Math.floor(relativeSeconds / 60);
                  const secs = relativeSeconds % 60;
                  const isGreen = log.type?.includes('good') || log.type?.includes('great') || log.type?.includes('confidence') || log.type?.includes('excited') || log.type?.includes('hrCalm');
                  const isYellow = log.type?.includes('breathe') || log.type?.includes('slow') || log.type?.includes('filler') || log.type?.includes('nervous') || log.type?.includes('hrElevated') || log.type?.includes('hrHigh');
                  const isBlue = log.type?.includes('turn') || log.type?.includes('listen') || log.type?.includes('quiet') || log.type?.includes('listening');
                  const dotColor = isGreen ? 'bg-emerald-400' : isYellow ? 'bg-yellow-400' : isBlue ? 'bg-blue-400' : 'bg-purple-400';
                  const textColor = isGreen ? 'text-emerald-300' : isYellow ? 'text-yellow-300' : isBlue ? 'text-blue-300' : 'text-purple-300';

                  return (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="text-gray-500 w-10 flex-shrink-0 pt-0.5">{mins}:{secs.toString().padStart(2, '0')}</span>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                      <p className={`${textColor} leading-relaxed`}>
                        {log.detailedMessage || log.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-6">
            <button
              onClick={() => { setShowSummary(false); if (onBack) onBack(); }}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-medium transition-colors"
            >
              Done
            </button>
            <button
              onClick={() => { setShowSummary(false); handleStart(); }}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Screen - use fallback for cueConfig in case it's undefined
  const safeCueConfig = cueConfig || {
    color: '#6B7280',
    bg: 'rgba(30, 30, 30, 0.95)',
    glow: 'none',
    label: 'Listening',
    eyeColor: '#4A90E2',
    mouthColor: '#34D399'
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-500"
      style={{ background: `linear-gradient(to bottom, ${safeCueConfig.bg}, rgba(10, 10, 10, 0.98))` }}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Incognito Mode</h1>
            <p className="text-xs text-gray-500">Real-time coaching</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Settings */}
      {showSettings && (
        <div className="mx-4 mb-4 p-4 bg-gray-900/80 backdrop-blur rounded-2xl">
          <h3 className="font-medium mb-4 text-white">Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-400">Whispered Coaching</span>
              <button
                onClick={() => setEnableWhisper(!enableWhisper)}
                className={`w-12 h-7 rounded-full transition-colors ${enableWhisper ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableWhisper ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-400">Visual Cues</span>
              <button
                onClick={() => setEnableVisual(!enableVisual)}
                className={`w-12 h-7 rounded-full transition-colors ${enableVisual ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableVisual ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-400">Haptic Vibration</span>
              <button
                onClick={() => setEnableHaptics(!enableHaptics)}
                className={`w-12 h-7 rounded-full transition-colors ${enableHaptics ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableHaptics ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <div className="border-t border-gray-700 pt-4 mt-2">
              <label className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-gray-400">Heart Rate Monitor</span>
                  <p className="text-xs text-gray-600 mt-0.5">Track stress & anxiety</p>
                </div>
                <button
                  onClick={() => setEnableHeartRate(!enableHeartRate)}
                  className={`w-12 h-7 rounded-full transition-colors ${enableHeartRate ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableHeartRate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
              {enableHeartRate && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-gray-500 mb-2">Detection Method:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHeartRateMode('camera')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        heartRateMode === 'camera'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      Camera
                    </button>
                    <button
                      onClick={connectBluetoothHR}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        heartRateMode === 'bluetooth'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      Bluetooth
                    </button>
                    <button
                      onClick={async () => {
                        setHeartRateMode('applewatch');
                        const result = await heartRateService.startAppleWatchMonitoring();
                        if (result.success) {
                          setAppleWatchInfo(heartRateService.getAppleWatchSessionInfo());
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        heartRateMode === 'applewatch'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      Apple Watch
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {heartRateMode === 'camera' && 'Uses webcam to detect pulse from face'}
                    {heartRateMode === 'bluetooth' && 'Connects to BLE heart rate monitors'}
                    {heartRateMode === 'applewatch' && 'Receives HR from Apple Watch via iOS Shortcut'}
                  </p>

                  {/* Apple Watch Setup Instructions */}
                  {heartRateMode === 'applewatch' && appleWatchInfo && (
                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-xs text-green-300 font-medium mb-2">Setup Instructions:</p>
                      <ol className="text-[10px] text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Download "Shortcuts" app if not installed</li>
                        <li>Create a new Shortcut with:
                          <ul className="ml-4 mt-1 space-y-0.5">
                            <li>- "Find Health Samples" (Heart Rate)</li>
                            <li>- "Get Contents of URL" (POST)</li>
                          </ul>
                        </li>
                        <li>Set URL to send heart rate data</li>
                        <li>Run shortcut during practice</li>
                      </ol>
                      <div className="mt-2 p-2 bg-black/30 rounded text-[10px] break-all text-green-400 font-mono">
                        POST: {appleWatchInfo.postUrl}
                        <br />
                        Body: {`{"bpm": <heart_rate>}`}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Apple Watch Cues Section */}
            <div className="border-t border-gray-700 pt-4 mt-2">
              <label className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-gray-400">Apple Watch Cues</span>
                  <p className="text-xs text-gray-600 mt-0.5">Visual & haptic coaching on watch</p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !enableWatchCues;
                    setEnableWatchCues(newValue);
                    if (newValue && !watchSessionId) {
                      // Generate a new session ID when enabled
                      const newSessionId = `watch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                      setWatchSessionId(newSessionId);
                      localStorage.setItem('watchSessionId', newSessionId);
                    } else if (!newValue) {
                      // Remove session ID when disabled
                      localStorage.removeItem('watchSessionId');
                      setWatchSessionId(null);
                    }
                  }}
                  className={`w-12 h-7 rounded-full transition-colors ${enableWatchCues ? 'bg-purple-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableWatchCues ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>

              {enableWatchCues && watchSessionId && (
                <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-medium mb-2">Watch Cue Setup:</p>
                  <p className="text-[10px] text-gray-400 mb-3">
                    Your Apple Watch can show colored cues and haptic taps during conversations.
                    Create an iOS Shortcut that polls the URL below every 2-3 seconds.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2 bg-black/30 rounded text-[10px] text-purple-400 font-mono break-all">
                      GET: [Your backend URL]/api/watch-cue/{watchSessionId}
                    </div>

                    <p className="text-[10px] text-gray-500">Response format:</p>
                    <div className="p-2 bg-black/30 rounded text-[10px] text-gray-400 font-mono">
                      {`{ "cue": "green|yellow|blue|purple", "message": "...", "haptic": "success|directionUp|click|notification" }`}
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-black/20 rounded">
                    <p className="text-[10px] text-purple-300 font-medium mb-1">Haptic Mapping:</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                      <span>🟢 Green → Success tap</span>
                      <span>🟡 Yellow → Direction Up</span>
                      <span>🔵 Blue → Click</span>
                      <span>🟣 Purple → Notification</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 mt-2">
                    Session ID: {watchSessionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {!isActive ? (
          // Start Screen
          <div className="text-center max-w-sm">
            <div className="w-64 h-64 mx-auto mb-8 relative flex items-center justify-center">
              {/* Large outer glow - expanded */}
              <div
                className="absolute"
                style={{
                  width: '300px',
                  height: '300px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(74, 144, 226, 0.2) 30%, rgba(52, 211, 153, 0.08) 50%, transparent 70%)',
                  filter: 'blur(60px)'
                }}
              />
              {/* Face - no container circle */}
              <div className="relative flex flex-col items-center justify-center z-10">
                {/* Eyes with blink animation */}
                <div className="smile-eyes flex gap-12 mb-6">
                  <div
                    className="w-5 h-5 rounded-full bg-blue-400"
                    style={{ boxShadow: '0 0 25px rgba(74, 144, 226, 0.9)' }}
                  />
                  <div
                    className="w-5 h-5 rounded-full bg-blue-400"
                    style={{ boxShadow: '0 0 25px rgba(74, 144, 226, 0.9)' }}
                  />
                </div>
                {/* Smile mouth */}
                <div className="smile-mouth" style={{
                  width: '90px',
                  height: '55px',
                  borderLeft: '12px solid #34D399',
                  borderRight: '12px solid #34D399',
                  borderBottom: '12px solid #34D399',
                  borderTop: 'none',
                  borderRadius: '0 0 45px 45px',
                  filter: 'drop-shadow(0 0 25px rgba(52, 211, 153, 0.7))'
                }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Ready to Coach</h2>
            <p className="text-gray-400 mb-8">Start a real conversation. I'll listen and give you quiet coaching through your earbuds.</p>
            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full font-semibold text-lg shadow-lg shadow-blue-500/20 text-white"
            >
              Start Listening
            </button>
            <p className="mt-4 text-xs text-gray-600">Your conversation is never recorded</p>
          </div>
        ) : (
          // Active Session
          <div className="text-center w-full max-w-sm">
            <div className="w-64 h-64 mx-auto mb-8 relative flex items-center justify-center">
              {/* Large outer glow - expanded */}
              <div
                className={`absolute transition-all duration-700 ${
                  isSpeaking ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  width: '300px',
                  height: '300px',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) ${isSpeaking ? 'scale(1.25)' : 'scale(1)'}`,
                  background: `radial-gradient(circle, ${safeCueConfig.color}40 0%, ${safeCueConfig.color}20 30%, ${safeCueConfig.color}08 50%, transparent 70%)`,
                  filter: 'blur(60px)'
                }}
              />
              {/* Face - no container circle */}
              <div className="relative flex flex-col items-center justify-center z-10">
                {/* Eyes with blink animation */}
                <div className="smile-eyes flex gap-12 mb-6">
                  <div
                    className="w-5 h-5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: safeCueConfig.eyeColor || '#4A90E2',
                      boxShadow: `0 0 25px ${safeCueConfig.eyeColor || '#4A90E2'}90`
                    }}
                  />
                  <div
                    className="w-5 h-5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: safeCueConfig.eyeColor || '#4A90E2',
                      boxShadow: `0 0 25px ${safeCueConfig.eyeColor || '#4A90E2'}90`
                    }}
                  />
                </div>
                {/* Smile mouth - matches Practice page */}
                <div className="smile-mouth" style={{
                  width: '90px',
                  height: '55px',
                  borderLeft: `12px solid ${safeCueConfig.mouthColor || '#34D399'}`,
                  borderRight: `12px solid ${safeCueConfig.mouthColor || '#34D399'}`,
                  borderBottom: `12px solid ${safeCueConfig.mouthColor || '#34D399'}`,
                  borderTop: 'none',
                  borderRadius: '0 0 45px 45px',
                  filter: `drop-shadow(0 0 25px ${safeCueConfig.mouthColor || '#34D399'}70)`,
                  transition: 'border-color 0.3s ease, filter 0.3s ease'
                }} />
                {/* Status label */}
                <span
                  className="text-xs font-semibold mt-4 uppercase tracking-wider transition-all duration-300"
                  style={{ color: safeCueConfig.color }}
                >
                  {safeCueConfig.label}
                </span>
              </div>
            </div>

            <div className="text-4xl font-mono font-light mb-2 text-white">{formatTime(sessionTime)}</div>

            {/* Connection & Speaking indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full transition-all ${
                connectionStatus === 'connected'
                  ? (isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-blue-400')
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-400 animate-pulse'
                  : connectionStatus === 'error'
                  ? 'bg-red-400'
                  : 'bg-gray-600'
              }`} />
              <p className="text-gray-500 text-sm">
                {connectionStatus === 'connecting' && 'Connecting to Hume AI...'}
                {connectionStatus === 'error' && 'Connection error - check console'}
                {connectionStatus === 'connected' && (isSpeaking ? 'Hearing you...' : 'Listening...')}
                {connectionStatus === 'disconnected' && 'Not connected'}
              </p>
            </div>

            {/* Current emotion display */}
            {currentEmotion && (
              <div className="mb-4 px-3 py-1.5 bg-purple-500/20 rounded-full inline-block">
                <p className="text-xs text-purple-300">
                  Detected: {currentEmotion.name} ({(currentEmotion.score * 100).toFixed(0)}%)
                </p>
              </div>
            )}

            {/* Heart rate display */}
            {enableHeartRate && (
              <div className="mb-4 flex items-center justify-center gap-3">
                {heartRate ? (
                  <div
                    className="px-4 py-2 rounded-xl flex items-center gap-2"
                    style={{
                      backgroundColor: `${heartRateZone?.color || '#EF4444'}20`,
                      borderColor: `${heartRateZone?.color || '#EF4444'}40`,
                      borderWidth: '1px'
                    }}
                  >
                    <span className="text-2xl animate-pulse">
                      {heartRateZone?.key === 'RESTING' || heartRateZone?.key === 'NORMAL' ? '💚' :
                       heartRateZone?.key === 'ELEVATED' ? '💛' : '❤️'}
                    </span>
                    <div>
                      <p className="text-lg font-bold" style={{ color: heartRateZone?.color || '#EF4444' }}>
                        {heartRate} <span className="text-xs font-normal">BPM</span>
                      </p>
                      <p className="text-[10px] text-gray-400">{heartRateZone?.label || 'Measuring...'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-gray-800/50 rounded-xl flex items-center gap-2">
                    <span className="text-lg opacity-50">💓</span>
                    <p className="text-xs text-gray-500">
                      {heartRateStatus === 'connecting' ? 'Connecting...' :
                       heartRateStatus === 'connected' ? 'Measuring HR...' :
                       heartRateStatus === 'error' ? 'HR Error' : 'HR Not active'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hidden video element for camera-based HR */}
            {enableHeartRate && heartRateMode === 'camera' && (
              <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
              />
            )}

            {/* Live transcript */}
            {currentTranscript && (
              <div className="mb-4 px-4 py-2 bg-gray-800/50 rounded-xl max-w-xs mx-auto">
                <p className="text-sm text-gray-300 italic truncate">"{currentTranscript}"</p>
              </div>
            )}

            {lastCoaching && (
              <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Last coaching</p>
                <p className="text-base font-medium text-white leading-relaxed">
                  {lastCoaching.detailedMessage || lastCoaching.message}
                </p>
              </div>
            )}

            {/* Color Key Legend */}
            <div className="mb-6 px-4">
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)' }} />
                  <span className="text-gray-400">Positive</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }} />
                  <span className="text-gray-400">Pacing</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px rgba(74, 144, 226, 0.6)' }} />
                  <span className="text-gray-400">Engagement</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-400" style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }} />
                  <span className="text-gray-400">Suggestion</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto hover:bg-red-500/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      {isActive && (
        <footer className="p-4 pb-8 flex justify-center gap-6 text-sm text-gray-500">
          <span>{coachingLog.length} coaching moments</span>
        </footer>
      )}

      <style>{`
        @keyframes smileBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes eyeBlink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes smileWiggle {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: translateY(-2px) scaleY(1.05);
          }
        }

        .smile-mouth {
          animation: smileWiggle 3s ease-in-out infinite;
          transform-origin: top center;
        }

        .smile-eyes > div {
          animation: eyeBlink 4s ease-in-out infinite;
        }

        .smile-eyes > div:nth-child(2) {
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  );
};

export default IncognitoModeScreen;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Star, 
  RotateCcw, 
  Home, 
  TrendingUp, 
  Award, 
  Share2, 
  Clock, 
  MessageCircle,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Target
} from 'lucide-react';

/**
 * VoicePracticeCompletion - Completion screen for voice practice sessions
 * 
 * Displays comprehensive session results with celebrations, feedback, and actions
 * 
 * @component
 * @param {Object} sessionResults - Session results data
 * @param {number} sessionResults.points - Points earned
 * @param {number} sessionResults.performanceScore - Performance score (0-100)
 * @param {string} sessionResults.feedback - AI coach feedback message
 * @param {Object} scenario - Scenario that was practiced
 * @param {Function} onRestart - Callback to retry same scenario
 * @param {Function} onContinue - Callback to pick new scenario
 * @param {Function} onHome - Callback to return to home
 * @param {Function} [onProgress] - Optional callback to view progress/stats
 * @param {Object} [options] - Additional options
 * @param {string} [options.gradeLevel='6-8'] - User's grade level
 * @param {number} [options.exchangeCount=0] - Number of exchanges
 * @param {number} [options.difficultyLevel=3] - Difficulty level achieved
 * @param {number} [options.timeSpent=0] - Time spent in seconds
 * @param {Array} [options.achievements=[]] - Achievement badges unlocked
 * @param {number} [options.scenariosCompleted=0] - Total scenarios completed
 * @param {boolean} [options.darkMode=true] - Dark mode toggle
 */
const VoicePracticeCompletion = ({
  sessionResults,
  scenario,
  onRestart,
  onContinue,
  onHome,
  onProgress,
  options = {}
}) => {
  const {
    gradeLevel = '6-8',
    exchangeCount = 0,
    difficultyLevel = 3,
    timeSpent = 0,
    achievements = [],
    scenariosCompleted = 0,
    darkMode = true
  } = options;

  const [animationPhase, setAnimationPhase] = useState(0);
  const [pointsDisplay, setPointsDisplay] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [countUpComplete, setCountUpComplete] = useState(false);
  const pointsRef = useRef(null);
  const confettiContainerRef = useRef(null);

  // Extract data from sessionResults
  const points = sessionResults?.points || sessionResults?.pointsEarned || 0;
  const performanceScore = sessionResults?.performanceScore || 0;
  const feedback = sessionResults?.feedback || 'Great job completing this practice session!';
  const scenarioTitle = scenario?.title?.[gradeLevel] || scenario?.title || 'Voice Practice';
  const scenarioCategory = scenario?.category || 'Practice';

  // Normalize grade level for messaging
  const normalizedGrade = normalizeGradeLevel(gradeLevel);

  // Staggered entrance animations
  useEffect(() => {
    const phases = [0, 1, 2, 3];
    phases.forEach((phase, index) => {
      setTimeout(() => setAnimationPhase(phase), index * 200);
    });
  }, []);

  // Points counting animation
  useEffect(() => {
    if (animationPhase >= 1) {
      const duration = 1500;
      const steps = 60;
      const increment = points / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(points, Math.floor(increment * step));
        setPointsDisplay(current);

        if (step >= steps) {
          setPointsDisplay(points);
          setCountUpComplete(true);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [animationPhase, points]);

  // Confetti animation for high scores
  useEffect(() => {
    if (performanceScore >= 80 && animationPhase >= 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [performanceScore, animationPhase]);

  // Create confetti particles
  useEffect(() => {
    if (showConfetti && confettiContainerRef.current) {
      const colors = ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'];
      const particles = Array.from({ length: 50 }, (_, i) => {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.cssText = `
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}%;
          top: -10px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        `;
        confettiContainerRef.current.appendChild(particle);

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 4000);
      });
    }
  }, [showConfetti]);

  // Grade-appropriate messaging
  const getGradeMessage = () => {
    const messages = {
      'k2': "You're a star! ⭐",
      '3-5': "Awesome work!",
      '6-8': "Great job!",
      '9-12': "Excellent performance!"
    };
    return messages[normalizedGrade] || messages['6-8'];
  };

  // Performance message based on score
  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You're mastering this! 🌟";
    if (score >= 80) return "Excellent work! You're doing great! 🎉";
    if (score >= 70) return "Good job! Keep practicing! 💪";
    if (score >= 60) return "Nice effort! Try reviewing! 📚";
    return "Keep practicing! Every attempt helps! 🌱";
  };

  // Extract key strengths from feedback
  const extractStrengths = () => {
    // Default strengths if not in feedback
    const defaultStrengths = [
      "Completed the practice session",
      "Engaged in conversation",
      "Showed improvement"
    ];

    // Try to extract from feedback (simplified version)
    if (feedback) {
      const lowerFeedback = feedback.toLowerCase();
      const strengths = [];

      if (lowerFeedback.includes('listening') || lowerFeedback.includes('heard')) {
        strengths.push("Great listening skills");
      }
      if (lowerFeedback.includes('question') || lowerFeedback.includes('asked')) {
        strengths.push("Asked thoughtful questions");
      }
      if (lowerFeedback.includes('clear') || lowerFeedback.includes('understood')) {
        strengths.push("Clear communication");
      }

      return strengths.length > 0 ? strengths.slice(0, 3) : defaultStrengths;
    }

    return defaultStrengths;
  };

  // Get area to work on
  const getAreaToWorkOn = () => {
    if (performanceScore >= 80) {
      return "Try more challenging scenarios next time!";
    } else if (performanceScore >= 60) {
      return "Practice more exchanges to build confidence";
    } else {
      return "Keep practicing to improve your responses";
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Get difficulty label
  const getDifficultyLabel = (level) => {
    if (level <= 2) return 'Easy';
    if (level <= 4) return 'Moderate';
    return 'Hard';
  };

  // Star rating calculation
  const getStarRating = () => {
    if (performanceScore >= 90) return 5;
    if (performanceScore >= 80) return 4;
    if (performanceScore >= 70) return 3;
    if (performanceScore >= 60) return 2;
    return 1;
  };

  // Generate share text
  const generateShareText = () => {
    const message = getGradeMessage();
    return `🎯 ${message}\n\nJust completed "${scenarioTitle}" voice practice!\n\n📊 Performance: ${performanceScore}%\n⭐ Rating: ${getStarRating()}/5\n🏆 Points: ${points}\n\n#SocialSkills #VoicePractice`;
  };

  // Copy to clipboard
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Voice Practice Complete!',
          text: generateShareText()
        });
      } else {
        await navigator.clipboard.writeText(generateShareText());
        setShowShareModal(true);
        setTimeout(() => setShowShareModal(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Screen reader announcement
  useEffect(() => {
    const announcement = `${getGradeMessage()} You earned ${points} points with a ${performanceScore}% performance score. ${feedback}`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('role', 'status');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);

    return () => {
      if (ariaLive.parentNode) {
        ariaLive.parentNode.removeChild(ariaLive);
      }
    };
  }, []);

  const strengths = extractStrengths();
  const starRating = getStarRating();

  return (
    <div 
      className={`fixed inset-0 z-50 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}
      role="dialog"
      aria-labelledby="completion-title"
      aria-describedby="completion-description"
    >
      {/* Confetti Container */}
      <div ref={confettiContainerRef} className="fixed inset-0 pointer-events-none overflow-hidden" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-emerald-400 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-yellow-400 to-blue-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 pb-24 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 lg:p-10 ${
            darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-2xl'
          } transform transition-all duration-1000 ${
            animationPhase >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            
            {/* Celebration Header */}
            <div className="text-center mb-8">
              <div className={`relative mb-6 transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
              }`}>
                <div className="inline-block relative">
                  <Trophy className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto ${
                    performanceScore >= 80 ? 'text-yellow-400 animate-bounce' : 'text-yellow-500'
                  }`} />
                  {showConfetti && (
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-pink-400 animate-pulse" />
                  )}
                </div>
              </div>
              
              <h1 
                id="completion-title"
                className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent transform transition-all duration-1000 ${
                  animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                {getGradeMessage()}
              </h1>
              
              <p className={`text-xl sm:text-2xl font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {scenarioTitle}
              </p>
              
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {getPerformanceMessage(performanceScore)}
              </p>
            </div>

            {/* Points Display - Large and Prominent */}
            <div className={`text-center mb-8 transform transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`inline-block p-6 sm:p-8 rounded-3xl ${
                darkMode ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
              } border-2`}>
                <div className={`text-sm sm:text-base font-medium mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Points Earned
                </div>
                <div 
                  ref={pointsRef}
                  className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                >
                  {pointsDisplay}
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className={`flex justify-center gap-2 mb-8 transform transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-500 ${
                    star <= starRating
                      ? 'text-yellow-400 fill-current'
                      : darkMode ? 'text-gray-600' : 'text-gray-300'
                  } ${
                    animationPhase >= 2 && star <= starRating ? 'animate-pulse' : ''
                  }`}
                  style={{ animationDelay: `${star * 100}ms` }}
                />
              ))}
            </div>

            {/* Performance Summary */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 transform transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`p-4 rounded-2xl text-center ${
                darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
              }`}>
                <MessageCircle className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  {exchangeCount}
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-blue-300/80' : 'text-blue-600/80'}`}>
                  Exchanges
                </div>
              </div>

              <div className={`p-4 rounded-2xl text-center ${
                darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
              }`}>
                <Target className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {getDifficultyLabel(difficultyLevel)}
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-purple-300/80' : 'text-purple-600/80'}`}>
                  Difficulty
                </div>
              </div>

              <div className={`p-4 rounded-2xl text-center ${
                darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
              }`}>
                <Clock className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {formatTime(timeSpent)}
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-emerald-300/80' : 'text-emerald-600/80'}`}>
                  Time Spent
                </div>
              </div>

              <div className={`p-4 rounded-2xl text-center ${
                darkMode ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'
              }`}>
                <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                  {performanceScore}%
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-pink-300/80' : 'text-pink-600/80'}`}>
                  Performance
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            <div className={`mb-8 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <CheckCircle className="w-6 h-6 text-green-400" />
                What You Did Well
              </h3>
              <div className={`space-y-3 ${
                darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
              } rounded-2xl p-4 sm:p-6`}>
                {strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Star className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} fill-current`} />
                    <p className={`${darkMode ? 'text-green-200' : 'text-green-700'}`}>{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Coach Feedback */}
            <div className={`mb-8 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`rounded-2xl p-4 sm:p-6 ${
                darkMode ? 'bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
              }`}>
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  <Sparkles className="w-6 h-6" />
                  AI Coach Feedback
                </h3>
                <p 
                  id="completion-description"
                  className={`text-base sm:text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {feedback}
                </p>
                <div className={`p-4 rounded-xl ${
                  darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm sm:text-base ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <strong>Next time:</strong> {getAreaToWorkOn()}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            {achievements && achievements.length > 0 && (
              <div className={`mb-8 transform transition-all duration-1000 ${
                animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <h3 className={`text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Award className="w-6 h-6 text-yellow-400" />
                  Achievements Unlocked
                </h3>
                <div className="flex flex-wrap gap-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                        darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <Award className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <span className={`text-sm font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {achievement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className={`mb-8 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`rounded-2xl p-4 sm:p-6 ${
                darkMode ? 'bg-gray-500/10 border border-gray-500/30' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Scenarios Completed
                  </h3>
                  <span className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {scenariosCompleted}
                  </span>
                </div>
                <div className={`w-full rounded-full h-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 h-3 rounded-full transition-all duration-2000"
                    style={{ width: `${Math.min(100, (scenariosCompleted / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <button
                onClick={onRestart}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? 'border-white/20 text-white hover:bg-white/10 focus:ring-white/50'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100 focus:ring-gray-400'
                }`}
                aria-label="Practice the same scenario again"
              >
                <RotateCcw className="w-5 h-5" />
                Practice Again
              </button>

              <button
                onClick={onContinue}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 focus:ring-blue-500/50'
                    : 'border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-400'
                }`}
                aria-label="Try another scenario"
              >
                <ArrowRight className="w-5 h-5" />
                Try Another
              </button>

              {onProgress && (
                <button
                  onClick={onProgress}
                  className={`flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode
                      ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 focus:ring-emerald-500/50'
                      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-400'
                  }`}
                  aria-label="View your progress and statistics"
                >
                  <TrendingUp className="w-5 h-5" />
                  See Progress
                </button>
              )}

              <button
                onClick={handleShare}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 focus:ring-yellow-500/50'
                    : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 focus:ring-yellow-400'
                }`}
                aria-label="Share your progress"
              >
                <Share2 className="w-5 h-5" />
                Share Progress
              </button>

              <button
                onClick={onHome}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Return to home screen"
              >
                <Home className="w-5 h-5" />
                Done
              </button>
            </div>

            {/* Share Modal Toast */}
            {showShareModal && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
                Copied to clipboard! ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confetti Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti-particle {
          animation: confetti-fall linear forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti-particle,
          * {
            animation: none !important;
            transition: none !important;
          }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}} />
    </div>
  );
};

/**
 * Normalize grade level to standardized format
 * @param {string} gradeLevel - Grade level input
 * @returns {string} Normalized grade level
 */
function normalizeGradeLevel(gradeLevel) {
  if (!gradeLevel) return '6-8';
  
  const GRADE_LEVEL_MAP = {
    'k': 'k2', 'K': 'k2', '1': 'k2', '2': 'k2', 'K-2': 'k2', 'k2': 'k2', 'k-2': 'k2',
    '3': '3-5', '4': '3-5', '5': '3-5', '3-5': '3-5',
    '6': '6-8', '7': '6-8', '8': '6-8', '6-8': '6-8',
    '9': '9-12', '10': '9-12', '11': '9-12', '12': '9-12', '9-12': '9-12'
  };
  
  const normalized = String(gradeLevel).trim();
  return GRADE_LEVEL_MAP[normalized] || GRADE_LEVEL_MAP[normalized.toLowerCase()] || '6-8';
}

export default VoicePracticeCompletion;

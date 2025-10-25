import React, { useState, useEffect } from 'react';
import { Home, RotateCcw, Info, Share2, TrendingUp, Target, Award, Lightbulb } from 'lucide-react';

const SessionResults = ({ 
  sessionResults, 
  scenarioTitle, 
  finalScore, 
  darkMode, 
  onNavigate, 
  onRestart 
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Staggered animation phases
    const phases = [0, 1, 2, 3];
    phases.forEach((phase, index) => {
      setTimeout(() => setAnimationPhase(phase), index * 200);
    });
  }, []);

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You're mastering this topic! 🌟";
    if (score >= 80) return "Excellent work! You're doing great! 🎉";
    if (score >= 70) return "Good job! Keep practicing to improve! 💪";
    if (score >= 60) return "Nice effort! Try reviewing the concepts! 📚";
    return "Keep practicing! Every attempt helps you learn! 🌱";
  };

  const getNextSteps = (score, masteryLevel) => {
    if (score >= 80 && masteryLevel >= 80) {
      return [
        "Try a more challenging topic",
        "Practice with real-world scenarios",
        "Help others learn this skill"
      ];
    } else if (score >= 70) {
      return [
        "Practice this topic again",
        "Focus on areas that need review",
        "Try similar topics to reinforce learning"
      ];
    } else {
      return [
        "Review the concepts you missed",
        "Practice with easier scenarios first",
        "Take your time with each question"
      ];
    }
  };

  const generateShareText = () => {
    const performance = getPerformanceMessage(finalScore);
    return `🎯 Just completed a ${scenarioTitle} practice session!\n\n📊 Score: ${finalScore}%\n🏆 Mastery: ${sessionResults.masteryLevel || 25}%\n\n${performance}\n\n#SocialSkills #Learning #Practice`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setShowShareModal(false);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-emerald-400 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-yellow-400 to-blue-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pb-24">
        <div className="max-w-5xl w-full">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 ${
            darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-2xl'
          } transform transition-all duration-1000 ${animationPhase >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Header with Celebration */}
            <div className="text-center mb-10">
              <div className={`text-8xl mb-6 transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
              }`}>
                {sessionResults.topicCompleted ? '🏆' : '🎯'}
              </div>
              <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {sessionResults.topicCompleted ? 'Topic Mastered!' : 'Session Complete!'}
              </h1>
              <p className={`text-2xl font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {scenarioTitle}
              </p>
              <div className={`mt-4 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} transform transition-all duration-1000 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {getPerformanceMessage(finalScore)}
              </div>
            </div>

            {/* Enhanced Progress Summary */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 transform transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                  {finalScore}%
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Overall Score</div>
              </div>
              
              <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {sessionResults.nextDifficulty || 1}
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Next Difficulty</div>
              </div>
              
              <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  {sessionResults.masteryLevel || 25}%
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Mastery Level</div>
              </div>
            </div>

            {/* Enhanced Mastery Progress */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-10 transform transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            } ${darkMode ? 'bg-gradient-to-r from-gray-500/10 to-gray-600/5 border-gray-500/30' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Mastery Progress
                </h3>
                <div className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {sessionResults.masteryLevel || 25}% Complete
                </div>
              </div>
              <div className={`w-full rounded-full h-6 mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 h-6 rounded-full transition-all duration-2000 ease-out relative overflow-hidden"
                  style={{ width: `${sessionResults.masteryLevel || 25}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Beginner</span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Expert</span>
              </div>
            </div>

            {/* AI Analysis */}
            {sessionResults.aiAnalysis && (
              <div className={`mb-10 transform transition-all duration-1000 ${
                animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 ${
                  darkMode ? 'bg-gradient-to-br from-purple-500/15 to-purple-600/5 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                }`}>
                  <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                    🤖 AI Analysis
                  </h2>
                  <p className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sessionResults.aiAnalysis.overallPerformance}
                  </p>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {sessionResults.aiAnalysis.personalizedEncouragement}
                  </p>
                </div>

                {/* Concepts Understood */}
                {sessionResults.aiAnalysis.conceptsUnderstood && sessionResults.aiAnalysis.conceptsUnderstood.length > 0 && (
                  <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 ${
                    darkMode ? 'bg-gradient-to-br from-green-500/15 to-green-600/5 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}>
                    <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                      ✅ Concepts You Understood
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessionResults.aiAnalysis.conceptsUnderstood.map((concept, index) => (
                        <div key={index} className={`flex items-start gap-3 p-4 rounded-2xl ${
                          darkMode ? 'bg-green-500/10' : 'bg-green-100/50'
                        }`}>
                          <span className="text-green-500 text-xl">✓</span>
                          <span className={`${darkMode ? 'text-green-200' : 'text-green-700'}`}>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas to Review */}
                {sessionResults.aiAnalysis.areasToReview && sessionResults.aiAnalysis.areasToReview.length > 0 && (
                  <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 ${
                    darkMode ? 'bg-gradient-to-br from-orange-500/15 to-orange-600/5 border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                  }`}>
                    <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                      📚 Areas to Review
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessionResults.aiAnalysis.areasToReview.map((area, index) => (
                        <div key={index} className={`flex items-start gap-3 p-4 rounded-2xl ${
                          darkMode ? 'bg-orange-500/10' : 'bg-orange-100/50'
                        }`}>
                          <span className="text-orange-500 text-xl">📖</span>
                          <span className={`${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-10 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            } ${darkMode ? 'bg-gradient-to-br from-blue-500/15 to-blue-600/5 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <Lightbulb className="w-6 h-6" />
                Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getNextSteps(finalScore, sessionResults.masteryLevel || 25).map((step, index) => (
                  <div key={index} className={`flex items-start gap-3 p-4 rounded-2xl ${
                    darkMode ? 'bg-blue-500/10' : 'bg-blue-100/50'
                  }`}>
                    <span className="text-blue-500 text-xl">{index + 1}.</span>
                    <span className={`${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <button 
                onClick={onRestart} 
                className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                  darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <button 
                onClick={() => setShowShareModal(true)} 
                className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                  darkMode ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                }`}
              >
                <Share2 className="w-5 h-5" />
                Share Progress
              </button>
              
              <button 
                onClick={() => onNavigate('progress')} 
                className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                  darkMode ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Info className="w-5 h-5" />
                View Progress
              </button>
              
              <button 
                onClick={() => onNavigate('home')} 
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 max-w-2xl w-full ${
            darkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Share Your Progress
            </h3>
            <div className={`p-4 rounded-2xl mb-6 ${
              darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <pre className={`whitespace-pre-wrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {generateShareText()}
              </pre>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={copyToClipboard}
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300"
              >
                Copy to Clipboard
              </button>
              <button 
                onClick={() => setShowShareModal(false)}
                className={`flex-1 font-bold py-3 px-6 rounded-full border-2 transition-all duration-300 ${
                  darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionResults;

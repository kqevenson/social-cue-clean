import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, XCircle, Eye, Clock, Target, TrendingUp, Lightbulb, Star } from 'lucide-react';
import { useToast } from './animations';

function SessionReplayModal({ sessionId, isOpen, onClose, darkMode }) {
  const [replayData, setReplayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedScenarios, setExpandedScenarios] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionReplay();
    }
  }, [isOpen, sessionId]);

  const fetchSessionReplay = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/replay/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReplayData(data.replayData);
        } else {
          showToast('Failed to load session data', 'error');
        }
      } else {
        showToast('Session not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching session replay:', error);
      showToast('Failed to load session replay', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScenarioExpansion = (scenarioNumber) => {
    setExpandedScenarios(prev => ({
      ...prev,
      [scenarioNumber]: !prev[scenarioNumber]
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl ${
        darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading session replay...
              </p>
            </div>
          </div>
        ) : replayData ? (
          <>
            {/* Header */}
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Play className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Session Replay
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(replayData.sessionInfo.difficulty)}`}>
                      {replayData.sessionInfo.difficulty}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Topic
                        </span>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {replayData.sessionInfo.topicName}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Accuracy
                        </span>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {replayData.sessionInfo.accuracy}%
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Duration
                        </span>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {replayData.sessionInfo.duration}m
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Score
                        </span>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {replayData.sessionInfo.correctAnswers}/{replayData.sessionInfo.totalScenarios}
                      </p>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed on {formatDate(replayData.sessionInfo.completedAt)}
                  </p>
                </div>
                
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {/* Scenarios */}
              <div className="space-y-4">
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Scenario Breakdown
                </h3>
                
                {replayData.scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Scenario Header */}
                    <div
                      className={`p-4 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleScenarioExpansion(scenario.scenarioNumber)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            scenario.isCorrect 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {scenario.isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Scenario {scenario.scenarioNumber} of {replayData.sessionInfo.totalScenarios}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {scenario.isCorrect ? 'Correct' : 'Incorrect'} • {scenario.pointsEarned} points
                            </p>
                          </div>
                        </div>
                        <Eye className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedScenarios[scenario.scenarioNumber] && (
                      <div className={`border-t p-4 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                        {/* Scenario Text */}
                        <div className="mb-4">
                          <h5 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Scenario:
                          </h5>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {scenario.scenarioText}
                          </p>
                        </div>

                        {/* Answer Options */}
                        <div className="mb-4">
                          <h5 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Answer Options:
                          </h5>
                          <div className="space-y-2">
                            {scenario.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-xl border-2 transition-colors ${
                                  option.text === scenario.studentAnswer
                                    ? scenario.isCorrect
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : option.text === scenario.correctAnswer
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : darkMode
                                    ? 'border-gray-600 bg-gray-800'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {option.text === scenario.studentAnswer && (
                                    <span className={`text-sm font-bold ${
                                      scenario.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      Your Answer
                                    </span>
                                  )}
                                  {option.text === scenario.correctAnswer && option.text !== scenario.studentAnswer && (
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                                <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {option.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Feedback */}
                        {scenario.aiFeedback && (
                          <div className="mb-4">
                            <h5 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              AI Feedback:
                            </h5>
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                              <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                                {scenario.aiFeedback}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pro Tip */}
                        {scenario.proTip && (
                          <div>
                            <h5 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              Pro Tip:
                            </h5>
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                              <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                {scenario.proTip}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className={`mt-8 p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Session Summary
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h4 className={`font-semibold mb-2 text-green-600 dark:text-green-400`}>
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {replayData.summary.strengths.map((strength, index) => (
                        <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <h4 className={`font-semibold mb-2 text-orange-600 dark:text-orange-400`}>
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {replayData.summary.areasForImprovement.map((area, index) => (
                        <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          • {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mt-4">
                  <h4 className={`font-semibold mb-2 text-blue-600 dark:text-blue-400`}>
                    Next Recommended Topic
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {replayData.summary.nextRecommendedTopic}
                  </p>
                </div>

                {/* Overall Feedback */}
                <div className="mt-4">
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Overall Feedback
                  </h4>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {replayData.summary.overallFeedback}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Failed to load session data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionReplayModal;

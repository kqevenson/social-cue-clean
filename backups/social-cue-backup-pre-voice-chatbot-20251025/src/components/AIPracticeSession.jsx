import React, { useState } from 'react';
import { Sparkles, Loader, ArrowRight, Lightbulb, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function AIPracticeSession({ category, gradeLevel, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const generateAllScenarios = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setFeedback(null);
    setCurrentQuestionIndex(0);
    
    try {
      console.log(`🎨 Creating fun questions just for you...`);
      const allScenarios = await apiService.generateScenarios(
        category,
        gradeLevel,
        'social interaction'
      );
      
      console.log(`📚 Loaded ${allScenarios.length} questions for practice session`);
      setScenarios(allScenarios);
    } catch (err) {
      setError('Failed to generate scenarios. Please try again.');
      console.error('❌ Error generating scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (index) => {
    setSelectedOption(index);
    
    // Get AI feedback for this choice
    try {
      const userHistory = {
        recentChoices: 'practiced scenarios today',
        confidenceLevel: 'building'
      };
      
      const aiFeedback = await apiService.generatePersonalizedFeedback({
        scenarioContext: scenarios[currentQuestionIndex].context,
        question: scenarios[currentQuestionIndex].question,
        studentChoice: scenarios[currentQuestionIndex].options[index].text,
        correctAnswer: scenarios[currentQuestionIndex].options.find(opt => opt.quality === 'excellent')?.text,
        choiceQuality: scenarios[currentQuestionIndex].options[index].quality,
        gradeLevel: gradeLevel,
        studentStrengths: [],
        studentWeaknesses: [],
        previousPerformance: userHistory
      });
      
      setFeedback(aiFeedback);
    } catch (err) {
      console.error('Failed to get AI feedback:', err);
      // Fall back to scenario feedback
      setFeedback(scenarios[currentQuestionIndex].options[index].feedback);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < scenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback(null);
      console.log(`📝 Displaying question ${currentQuestionIndex + 2} of ${scenarios.length}`);
    } else {
      // All questions completed
      console.log(`🎉 Practice session completed! All ${scenarios.length} questions finished.`);
      // Call onComplete to navigate back to home
      if (onComplete) {
        onComplete();
      } else {
        console.warn('onComplete prop not provided to AIPracticeSession');
      }
    }
  };

  const restartSession = () => {
    generateAllScenarios();
  };

  // Initial load
  React.useEffect(() => {
    generateAllScenarios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">🎨 Creating fun questions just for you...</h2>
          <p className="text-lg text-gray-400 mb-2">AI is crafting personalized scenarios</p>
          <p className="text-sm text-gray-500">This will only take a moment!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={restartSession}
            className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!scenarios.length || currentQuestionIndex >= scenarios.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">🎉 Great Job!</h2>
          <p className="text-lg text-gray-300 mb-6">You've completed all the practice questions!</p>
          <div className="space-y-3">
            <button
              onClick={restartSession}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Practice Again
            </button>
            <button
              onClick={() => {
                console.log('🏠 Back to Home button clicked!');
                if (onComplete) {
                  onComplete();
                } else {
                  console.warn('onComplete prop not provided');
                }
              }}
              className="w-full bg-white/10 text-white font-bold py-4 px-6 rounded-full hover:bg-white/20 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-bold">Practice Session</span>
          </div>
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {scenarios.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / scenarios.length) * 100}%` }}
          />
        </div>

        {/* Scenario Context */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">{category}</h2>
          <p className="text-lg text-gray-300">{currentScenario.context}</p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {currentScenario.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                selectedOption === index
                  ? option.isGood
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-orange-500/20 border-orange-500'
                  : selectedOption !== null
                  ? 'opacity-50 border-white/10'
                  : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
              }`}
            >
              <p className="text-lg">{option.text}</p>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {selectedOption !== null && feedback && (
          <div className={`p-6 rounded-2xl border-2 ${
            currentScenario.options[selectedOption].isGood
              ? 'bg-emerald-500/20 border-emerald-500'
              : 'bg-orange-500/20 border-orange-500'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {currentScenario.options[selectedOption].isGood ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-xl mb-2">
                  {currentScenario.options[selectedOption].isGood ? 'Great Choice!' : 'Let\'s Learn!'}
                </h3>
                <p className="text-gray-300">{feedback}</p>
              </div>
            </div>

            {currentScenario.options[selectedOption].proTip && (
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 mt-4">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-300">{currentScenario.options[selectedOption].proTip}</p>
              </div>
            )}

            <button
              onClick={() => {
                console.log('🎯 Finish Practice button clicked!', {
                  currentQuestionIndex,
                  totalScenarios: scenarios.length,
                  isLastQuestion: currentQuestionIndex >= scenarios.length - 1,
                  onComplete: !!onComplete
                });
                nextQuestion();
              }}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              {currentQuestionIndex < scenarios.length - 1 ? 'Next Question' : 'Finish Practice'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

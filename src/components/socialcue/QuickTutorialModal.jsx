import React, { useState } from 'react';
import { X, Target, TrendingUp, Award, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

const QuickTutorialModal = ({ isOpen, onClose, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Adaptive Learning! 🎯",
      content: "Social Cue adapts to your learning style and progress. Let's see how it works!",
      icon: <Target className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Difficulty Levels 📈",
      content: "Start at Level 1 (Beginner) and progress to Level 5 (Expert). The system adjusts based on your performance - get questions right and you'll advance, struggle and we'll provide extra support.",
      icon: <TrendingUp className="w-8 h-8 text-green-500" />
    },
    {
      title: "Mastery Tracking 🏆",
      content: "Each topic has a mastery percentage. Complete practice sessions to increase your mastery. Reach 80%+ to unlock advanced challenges and real-world practice opportunities.",
      icon: <Award className="w-8 h-8 text-yellow-500" />
    },
    {
      title: "Real-World Challenges 🌟",
      content: "After mastering topics, you'll get personalized challenges to try in real life - like starting conversations with classmates or practicing active listening with family.",
      icon: <BookOpen className="w-8 h-8 text-purple-500" />
    },
    {
      title: "Your Progress Dashboard 📊",
      content: "Check the Progress tab to see your mastery levels, difficulty progression, and personalized insights. The system learns from your practice to give you the best experience.",
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentTutorial = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-2xl border ${
        darkMode ? 'bg-black border-white/20' : 'bg-white border-gray-200'
      } shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
          <div className="flex items-center gap-3">
            {currentTutorial.icon}
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Tutorial
            </h2>
          </div>
          <button
            onClick={handleSkip}
            className={`p-2 rounded-full transition-all ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentTutorial.title}
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTutorial.content}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : darkMode 
                        ? 'bg-white/20' 
                        : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step Counter */}
          <div className="text-center mb-6">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200/20">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? `${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                : `${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {isLastStep && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <button
              onClick={handleNext}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isLastStep
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
              }`}
            >
              {isLastStep ? 'Get Started!' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTutorialModal;

import React from 'react';
import { PlayCircle, RotateCcw, BookOpen, Target, CheckCircle } from 'lucide-react';

function ResumePrompt({ 
  lessonProgress, 
  lessonData, 
  onContinue, 
  onReview, 
  onRestart,
  darkMode = true 
}) {
  if (!lessonProgress) return null;

  const { status, currentStep, stepsCompleted, questionsAnswered = [], pointsEarned = 0 } = lessonProgress;
  const { lesson } = lessonData || {};

  // Calculate progress
  const totalQuestions = lesson?.practiceScenarios?.length || 5;
  const answeredQuestions = questionsAnswered.length;
  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  const score = answeredQuestions > 0 ? Math.round((questionsAnswered.filter(q => q.wasCorrect).length / answeredQuestions) * 100) : 0;

  const getResumeContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Welcome back!",
          subtitle: "Let's review what we learned...",
          description: "You were learning about " + (lesson?.introduction?.title || "this topic"),
          icon: BookOpen,
          color: "blue",
          action: "Continue Learning",
          showReview: false
        };
      
      case 2:
        return {
          title: "Great progress!",
          subtitle: `You've completed ${answeredQuestions} of ${totalQuestions} questions`,
          description: `Your score so far: ${score}% • Points earned: ${pointsEarned}`,
          icon: Target,
          color: "purple",
          action: "Continue Practice",
          showReview: true
        };
      
      case 3:
        return {
          title: "Excellent work!",
          subtitle: `Practice complete! You scored ${score}%`,
          description: `Now let's apply what you learned in the real world...`,
          icon: CheckCircle,
          color: "green",
          action: "Start Challenge",
          showReview: true
        };
      
      default:
        return {
          title: "Welcome back!",
          subtitle: "Ready to continue your lesson?",
          description: "Pick up where you left off",
          icon: PlayCircle,
          color: "blue",
          action: "Continue",
          showReview: false
        };
    }
  };

  const content = getResumeContent();
  const Icon = content.icon;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className={`max-w-2xl w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-3xl p-8 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-xl`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            content.color === 'blue' ? 'bg-blue-500/20' :
            content.color === 'purple' ? 'bg-purple-500/20' :
            'bg-green-500/20'
          }`}>
            <Icon className={`w-10 h-10 ${
              content.color === 'blue' ? 'text-blue-400' :
              content.color === 'purple' ? 'text-purple-400' :
              'text-green-400'
            }`} />
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {content.title}
          </h1>
          
          <p className={`text-xl mb-4 ${
            content.color === 'blue' ? 'text-blue-400' :
            content.color === 'purple' ? 'text-purple-400' :
            'text-green-400'
          }`}>
            {content.subtitle}
          </p>
          
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {content.description}
          </p>
        </div>

        {/* Progress Summary */}
        {currentStep === 2 && (
          <div className={`mb-8 p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Practice Progress
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Questions Completed
                </span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {answeredQuestions} / {totalQuestions}
                </span>
              </div>
              
              <div className="w-full bg-gray-600/20 rounded-full h-2">
                <div 
                  className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current Score
                </span>
                <span className={`font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {score}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Points Earned
                </span>
                <span className={`font-bold text-yellow-400`}>
                  {pointsEarned}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Key Points Review */}
        {content.showReview && lesson?.explanation?.keyPoints && (
          <div className={`mb-8 p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Key Points to Remember
            </h3>
            
            <ul className="space-y-2">
              {lesson.explanation.keyPoints.slice(0, 3).map((point, index) => (
                <li key={index} className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    content.color === 'blue' ? 'bg-blue-400' :
                    content.color === 'purple' ? 'bg-purple-400' :
                    'bg-green-400'
                  }`}></div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onContinue}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${
              content.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
              content.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
              'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <PlayCircle className="w-6 h-6" />
            {content.action}
          </button>

          {content.showReview && (
            <button
              onClick={onReview}
              className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${
                darkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Quick Review
            </button>
          )}
        </div>

        {/* Restart Option */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onRestart}
            className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium transition-all hover:scale-105 ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Restart Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumePrompt;

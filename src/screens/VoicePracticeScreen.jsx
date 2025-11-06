import React from 'react';
import { ArrowLeft, Mic, Sparkles, MessageCircle } from 'lucide-react';

/**
 * VoicePracticeScreen - Placeholder Component
 * 
 * A placeholder component for the Voice Practice feature.
 * Matches the existing Social Cue app design and theme.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.scenario - Scenario data (optional)
 * @param {string} props.gradeLevel - User's grade level
 * @param {string} props.userId - User ID
 * @param {Function} props.onComplete - Callback when practice completes
 * @param {Function} props.onExit - Callback when user exits
 */
function VoicePracticeScreen({ 
  scenario, 
  gradeLevel = '6-8', 
  userId, 
  onComplete, 
  onExit 
}) {
  const handleBack = () => {
    if (onExit) {
      onExit();
    }
  };

  const handleReturnToPractice = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50 overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0 border-b border-white/10">
        <button
          onClick={handleBack}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-bold text-lg text-white">Voice Practice</h2>
          {scenario && (
            <p className="text-xs text-white/80 mt-1">{scenario.title || scenario.name || 'Practice Session'}</p>
          )}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Coming Soon Card */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-3xl overflow-hidden p-8 mb-6 animate-slideUp">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                <Mic className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">COMING SOON</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
              Voice Practice
            </h1>

            {/* Description */}
            <p className="text-lg text-center text-gray-300 mb-6 leading-relaxed">
              We're building an amazing voice practice feature that will help you practice social skills through natural conversation with our AI coach.
            </p>

            {/* Features Preview */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Natural Conversation</h3>
                  <p className="text-sm text-gray-400">Practice real conversations with our AI coach in a safe, supportive environment.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Real-Time Feedback</h3>
                  <p className="text-sm text-gray-400">Get instant feedback and tips to improve your social skills as you practice.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Voice-Enabled</h3>
                  <p className="text-sm text-gray-400">Speak naturally and have real conversations - no typing required!</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-300 text-center">
                <strong className="text-blue-400">What to expect:</strong> This feature will include scenarios like starting conversations, active listening, conflict resolution, and more. Stay tuned!
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleReturnToPractice}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-full border-2 border-transparent transition-all flex items-center justify-center gap-2 hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Practice
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Questions? Check out our <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer underline">help center</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoicePracticeScreen;

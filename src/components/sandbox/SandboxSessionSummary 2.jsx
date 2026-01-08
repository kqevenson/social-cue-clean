import React from 'react';
import { X, Clock, MessageCircle, Heart, Share2, Home } from 'lucide-react';

const SandboxSessionSummary = ({
  summary,
  darkMode = true,
  onClose,
  onShare,
  onGoHome
}) => {
  if (!summary) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} min ${secs} sec`;
  };

  const getModeLabel = (mode) => {
    const labels = {
      vent: 'Vent Zone',
      whatif: 'What Would Happen?',
      translate: 'Translation Station',
      reversal: 'Walk in Their Shoes'
    };
    return labels[mode] || mode;
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      frustrated: '😤',
      angry: '😠',
      annoyed: '😒',
      overwhelmed: '😫',
      hurt: '😢',
      confused: '😕',
      calm: '😌',
      relieved: '😮‍💨',
      understood: '🤝',
      hopeful: '🌟'
    };
    return emojis[emotion?.toLowerCase()] || '💭';
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      darkMode ? 'bg-black/80' : 'bg-gray-900/50'
    }`}>
      <div className={`w-full max-w-md rounded-3xl overflow-hidden ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <X className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-600'}`} />
          </button>

          <div className="text-center">
            <div className="text-4xl mb-3">🧘</div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Session Complete
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              Thanks for sharing - that took courage
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={`px-6 py-4 grid grid-cols-2 gap-4 border-t border-b ${
          darkMode ? 'border-white/10' : 'border-gray-100'
        }`}>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Duration</span>
            </div>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatDuration(summary.duration || 0)}
            </p>
          </div>

          <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Messages</span>
            </div>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {summary.messageCount || 0}
            </p>
          </div>
        </div>

        {/* Emotional journey */}
        {summary.summary?.emotionalJourney && (
          <div className="px-6 py-4">
            <h3 className={`text-xs font-semibold mb-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              YOUR EMOTIONAL JOURNEY
            </h3>
            <div className="flex items-center justify-between">
              {summary.summary.emotionalJourney.map((emotion, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{getEmotionEmoji(emotion)}</span>
                    <span className={`text-xs capitalize ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                      {emotion}
                    </span>
                  </div>
                  {index < summary.summary.emotionalJourney.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${darkMode ? 'bg-white/20' : 'bg-gray-200'}`}>
                      <div className="h-full w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-emerald-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Key insights */}
        {summary.summary?.insightsGenerated?.length > 0 && (
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <h3 className={`text-xs font-semibold mb-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              INSIGHTS FROM THIS SESSION
            </h3>
            <ul className="space-y-2">
              {summary.summary.insightsGenerated.slice(0, 3).map((insight, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}
                >
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className={`p-6 space-y-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
          {/* Optional: Share with trusted adult */}
          <button
            onClick={onShare}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              darkMode
                ? 'bg-white/5 hover:bg-white/10 text-white/80'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share with a trusted adult</span>
          </button>

          {/* Go home */}
          <button
            onClick={onGoHome}
            className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>

        {/* Privacy reminder */}
        <div className={`px-6 pb-6`}>
          <p className={`text-xs text-center ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            This session is private and won't appear in your progress reports
          </p>
        </div>
      </div>
    </div>
  );
};

export default SandboxSessionSummary;

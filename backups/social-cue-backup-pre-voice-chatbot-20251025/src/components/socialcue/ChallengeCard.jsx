import React, { useState } from 'react';
import { Target, MapPin, Lightbulb, Calendar, CheckCircle } from 'lucide-react';

function ChallengeCard({ challenge, onComplete, darkMode = false }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return {
          border: darkMode ? 'border-green-400' : 'border-green-500',
          accent: darkMode ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-800',
          badge: darkMode ? 'bg-green-500 text-white' : 'bg-green-500 text-white'
        };
      case 'moderate':
        return {
          border: darkMode ? 'border-amber-400' : 'border-amber-500',
          accent: darkMode ? 'bg-amber-400/20 text-amber-400' : 'bg-amber-100 text-amber-800',
          badge: darkMode ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'
        };
      case 'challenging':
        return {
          border: darkMode ? 'border-orange-400' : 'border-orange-500',
          accent: darkMode ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-100 text-orange-800',
          badge: darkMode ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'
        };
      default:
        return {
          border: darkMode ? 'border-blue-400' : 'border-blue-500',
          accent: darkMode ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-800',
          badge: darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
        };
    }
  };

  const colors = getDifficultyColor(challenge.difficulty);

  const handleComplete = async () => {
    if (!showNotes) {
      setShowNotes(true);
      return;
    }

    setIsCompleting(true);
    try {
      await onComplete(challenge.id, notes);
      setShowNotes(false);
      setNotes('');
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${colors.border} ${
      darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
    }`}>
      {/* Header with title and difficulty badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.accent}`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
              {challenge.difficulty || 'Medium'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <p className="text-sm leading-relaxed">{challenge.description}</p>
      </div>

      {/* Challenge Details */}
      <div className="space-y-3 mb-6">
        {/* Where to Try */}
        {challenge.whereToTry && (
          <div className="flex items-start gap-3">
            <MapPin className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Where to Try
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {challenge.whereToTry}
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        {challenge.tips && (
          <div className="flex items-start gap-3">
            <Lightbulb className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Tips
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {challenge.tips}
              </p>
            </div>
          </div>
        )}

        {/* Timeframe */}
        {challenge.timeframe && (
          <div className="flex items-start gap-3">
            <Calendar className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Timeframe
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {challenge.timeframe}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Input (when completing) */}
      {showNotes && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            How did it go? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share your experience or any insights..."
            className={`w-full p-3 rounded-lg border resize-none ${
              darkMode 
                ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            rows={3}
          />
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-3">
        {showNotes && (
          <button
            onClick={() => {
              setShowNotes(false);
              setNotes('');
            }}
            className={`px-4 py-2 rounded-lg border transition-all ${
              darkMode 
                ? 'border-white/20 text-white hover:bg-white/10' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            showNotes 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isCompleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {showNotes ? 'Mark as Complete' : 'Mark as Complete'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ChallengeCard;

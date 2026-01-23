import React from 'react';
import { Trophy, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import ProgressCircle from './ProgressCircle';

function ProgressStats({ 
  stats = null, 
  darkMode = true,
  animated = true 
}) {
  if (!stats) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600/20 rounded-full"></div>
            <div className="w-24 h-6 bg-gray-600/20 rounded"></div>
          </div>
          <div className="w-16 h-16 bg-gray-600/20 rounded-full mx-auto mb-2"></div>
          <div className="w-32 h-4 bg-gray-600/20 rounded mx-auto"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-full h-20 bg-gray-600/20 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-full h-20 bg-gray-600/20 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-full h-20 bg-gray-600/20 rounded"></div>
        </div>
      </div>
    );
  }

  const overallProgress = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
      {/* Overall Progress */}
      <div className="text-center">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Progress
          </h3>
        </div>
        <ProgressCircle 
          progress={overallProgress} 
          status={overallProgress === 100 ? 'completed' : overallProgress > 0 ? 'in_progress' : 'not_started'}
          size="lg"
          animated={animated}
        />
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {stats.completedLessons} of {stats.totalLessons} Lessons
        </p>
        {overallProgress > 0 && (
          <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {overallProgress}% Complete
          </p>
        )}
      </div>

      {/* In Progress */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <PlayCircle className="w-6 h-6 text-blue-400" />
          <h4 className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>In Progress</h4>
        </div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {animated ? (
            <span className="animate-count-up" data-target={stats.inProgressLessons}>
              {stats.inProgressLessons}
            </span>
          ) : (
            stats.inProgressLessons
          )}
        </p>
        <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          Active lessons
        </p>
      </div>

      {/* Completed */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h4 className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Completed</h4>
        </div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {animated ? (
            <span className="animate-count-up" data-target={stats.completedLessons}>
              {stats.completedLessons}
            </span>
          ) : (
            stats.completedLessons
          )}
        </p>
        <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
          Finished lessons
        </p>
      </div>

      {/* Not Started */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-gray-400" />
          <h4 className={`font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</h4>
        </div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {animated ? (
            <span className="animate-count-up" data-target={stats.notStartedLessons}>
              {stats.notStartedLessons}
            </span>
          ) : (
            stats.notStartedLessons
          )}
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Ready to start
        </p>
      </div>
    </div>
  );
}

export default ProgressStats;

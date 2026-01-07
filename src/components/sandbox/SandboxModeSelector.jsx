import React from 'react';
import { MessageSquare, Zap, RefreshCw, Users, ArrowLeft } from 'lucide-react';

const ICONS = {
  MessageSquare,
  Zap,
  RefreshCw,
  Users
};

const SandboxModeSelector = ({
  modes,
  gradeLevel,
  darkMode = true,
  onSelectMode,
  onBack
}) => {
  const getModeDescription = (mode) => {
    return mode.description[gradeLevel] || mode.description['6-8'];
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Social Sandbox
            </h1>
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              Your safe space to express yourself
            </p>
          </div>
        </div>

        {/* Intro message */}
        <div className={`p-4 rounded-2xl mb-6 ${darkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
            This is your space. Say whatever you want.
            I'm just here to listen and chat - no judgment, no grades, no one else will see this.
          </p>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="px-6 pb-8">
        <h2 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
          CHOOSE YOUR MODE
        </h2>

        <div className="space-y-4">
          {Object.values(modes).map((mode) => {
            const Icon = ICONS[mode.icon] || MessageSquare;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`w-full p-5 rounded-2xl text-left transition-all group ${
                  darkMode
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${mode.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: mode.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {mode.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                      {getModeDescription(mode)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'text-white/40' : 'text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy note */}
      <div className="px-6 pb-8">
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
        }`}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className={`text-xs ${darkMode ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
            What you say here stays here. This won't affect your scores or show up in any reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SandboxModeSelector;

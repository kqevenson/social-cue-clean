import React, { useState, useCallback } from 'react';
import { ArrowLeft, X, Clock, AlertTriangle, Heart } from 'lucide-react';
import useSocialSandbox, { SANDBOX_MODES, MOOD_OPTIONS } from '../hooks/useSocialSandbox';
import SandboxModeSelector from '../components/sandbox/SandboxModeSelector';
import SandboxChatInterface from '../components/sandbox/SandboxChatInterface';
import SandboxSessionSummary from '../components/sandbox/SandboxSessionSummary';

const SocialSandboxScreen = ({
  gradeLevel = '6-8',
  userData = null,
  darkMode = true,
  onBack,
  onNavigate
}) => {
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  const {
    sessionId,
    isActive,
    mode,
    inputMode,
    sessionTime,
    messages,
    isLoading,
    error,
    isVoiceConnected,
    isListening,
    currentTranscript,
    currentEmotion,
    safetyAlert,
    clearSafetyAlert,
    startSession,
    sendMessage,
    endSession,
    toggleInputMode,
    submitVoiceMessage,
    shareSession
  } = useSocialSandbox({
    gradeLevel,
    learnerId: userData?.userId || userData?.userName || 'anonymous',
    onSessionEnd: (summary) => {
      setSessionResult(summary);
      setShowSummary(true);
    }
  });

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle mode selection
  const handleSelectMode = (modeId) => {
    setSelectedMode(modeId);
    setShowMoodCheckIn(true);
    setShowModeSelector(false);
  };

  // Handle mood selection and start session
  const handleMoodSelect = async (moodId) => {
    const success = await startSession(selectedMode, moodId);
    if (success) {
      setShowMoodCheckIn(false);
    }
  };

  // Skip mood check and start
  const handleSkipMood = async () => {
    const success = await startSession(selectedMode, null);
    if (success) {
      setShowMoodCheckIn(false);
    }
  };

  // Handle end session
  const handleEndSession = async () => {
    const summary = await endSession();
    if (summary) {
      setSessionResult(summary);
      setShowSummary(true);
    }
  };

  // Handle share
  const handleShare = () => {
    setShowShareConfirm(true);
  };

  const confirmShare = async (shareWith) => {
    await shareSession(shareWith);
    setShowShareConfirm(false);
  };

  // Handle go home
  const handleGoHome = () => {
    setShowSummary(false);
    setSessionResult(null);
    setShowModeSelector(true);
    setSelectedMode(null);
    if (onBack) onBack();
  };

  // Handle close summary and return to mode selector
  const handleCloseSummary = () => {
    setShowSummary(false);
    setSessionResult(null);
    setShowModeSelector(true);
    setSelectedMode(null);
  };

  // Get current mode info
  const currentModeInfo = mode ? SANDBOX_MODES[mode] : null;

  // Mood Check-in Screen
  if (showMoodCheckIn) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => {
                setShowMoodCheckIn(false);
                setShowModeSelector(true);
                setSelectedMode(null);
              }}
              disabled={isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                How are you feeling?
              </h1>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                This helps me understand where you're coming from
              </p>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className={`mb-4 p-3 rounded-xl ${darkMode ? 'bg-red-500/20' : 'bg-red-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                {error}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-red-300/60' : 'text-red-500'}`}>
                Make sure the backend server is running on port 3001
              </p>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                Starting your session...
              </p>
            </div>
          )}

          {/* Mood options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                disabled={isLoading}
                className={`p-4 rounded-2xl text-left transition-all ${
                  darkMode
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 active:bg-white/20'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 active:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-2xl mb-2 block">{mood.emoji}</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkipMood}
            disabled={isLoading}
            className={`w-full py-3 text-sm ${darkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Starting...' : 'Skip - just let me talk'}
          </button>
        </div>
      </div>
    );
  }

  // Mode Selector Screen
  if (showModeSelector && !isActive) {
    return (
      <SandboxModeSelector
        modes={SANDBOX_MODES}
        gradeLevel={gradeLevel}
        darkMode={darkMode}
        onSelectMode={handleSelectMode}
        onBack={onBack}
      />
    );
  }

  // Active Session Screen
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`px-4 pt-12 pb-3 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mode indicator */}
            {currentModeInfo && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${currentModeInfo.color}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentModeInfo.color }}
                />
              </div>
            )}
            <div>
              <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentModeInfo?.name || 'Sandbox'}
              </h1>
              <div className="flex items-center gap-2">
                <Clock className={`w-3 h-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  {formatTime(sessionTime)}
                </span>
              </div>
            </div>
          </div>

          {/* End session button */}
          <button
            onClick={handleEndSession}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            End
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <SandboxChatInterface
          messages={messages}
          isLoading={isLoading}
          darkMode={darkMode}
          inputMode={inputMode}
          isVoiceConnected={isVoiceConnected}
          isListening={isListening}
          currentTranscript={currentTranscript}
          currentEmotion={currentEmotion}
          onSendMessage={sendMessage}
          onToggleVoice={toggleInputMode}
          onSubmitVoice={submitVoiceMessage}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className={`mx-4 mb-4 p-3 rounded-xl ${darkMode ? 'bg-red-500/20' : 'bg-red-50'}`}>
          <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {/* Safety Alert Modal */}
      {safetyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className={`w-full max-w-sm rounded-3xl p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                I'm here for you
              </h3>
            </div>
            <p className={`text-sm mb-4 ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
              {safetyAlert.message || 'It sounds like you might be going through something really hard. You don\'t have to face this alone.'}
            </p>
            <div className={`p-3 rounded-xl mb-4 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                If you're in crisis, please reach out:
              </p>
              <p className={`text-sm font-semibold mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Crisis Text Line: Text HOME to 741741
              </p>
            </div>
            <button
              onClick={clearSafetyAlert}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {showSummary && sessionResult && (
        <SandboxSessionSummary
          summary={sessionResult}
          darkMode={darkMode}
          onClose={handleCloseSummary}
          onShare={handleShare}
          onGoHome={handleGoHome}
        />
      )}

      {/* Share Confirmation Modal */}
      {showShareConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className={`w-full max-w-sm rounded-3xl p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Share with who?
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              They'll see a summary of this session - not everything you said.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => confirmShare('parent')}
                className={`w-full py-3 px-4 rounded-xl text-left transition-colors ${
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>Parent/Guardian</span>
              </button>
              <button
                onClick={() => confirmShare('teacher')}
                className={`w-full py-3 px-4 rounded-xl text-left transition-colors ${
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>Teacher/Counselor</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareConfirm(false)}
              className={`w-full mt-4 py-3 text-sm ${
                darkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSandboxScreen;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Mic, Square, Loader, Volume2, X } from 'lucide-react';
import { useVoicePractice } from '../hooks/useVoicePractice';

/**
 * Full-screen voice practice interface component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.scenario - Scenario object with title, context, etc.
 * @param {string} props.gradeLevel - Grade level (e.g., '6', 'k2', '3-5', '6-8', '9-12')
 * @param {Function} props.onBack - Callback when back button is clicked
 * @param {Function} props.onComplete - Callback when practice is completed with transcript data
 */
const VoicePracticeScreen = ({ scenario, gradeLevel = '6', onBack, onComplete }) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // Normalize scenario object for the hook (hook expects context or description)
  const normalizedScenario = useMemo(() => {
    if (!scenario) return null;
    if (typeof scenario === 'string') {
      return { title: scenario, context: 'Practice your social skills' };
    }
    
    // Get context value (prefer setupPrompt, then context, then description)
    let contextValue = null;
    if (scenario.setupPrompt) {
      if (typeof scenario.setupPrompt === 'object') {
        contextValue = scenario.setupPrompt[gradeLevel] || scenario.setupPrompt['6-8'] || Object.values(scenario.setupPrompt)[0];
      } else {
        contextValue = scenario.setupPrompt;
      }
    } else if (scenario.context) {
      if (typeof scenario.context === 'object') {
        contextValue = scenario.context[gradeLevel] || scenario.context['6-8'] || Object.values(scenario.context)[0];
      } else {
        contextValue = scenario.context;
      }
    } else if (scenario.description) {
      if (typeof scenario.description === 'object') {
        contextValue = scenario.description[gradeLevel] || scenario.description['6-8'] || Object.values(scenario.description)[0];
      } else {
        contextValue = scenario.description;
      }
    }
    
    // Return normalized scenario with context property
    return {
      ...scenario,
      context: contextValue || 'Practice your social skills'
    };
  }, [scenario, gradeLevel]);

  // Use the voice practice hook
  const {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    startVoicePractice,
    endVoicePractice
  } = useVoicePractice({
    scenario: normalizedScenario,
    gradeLevel
  });

  // Start voice practice on mount
  useEffect(() => {
    startVoicePractice();
    
    // Cleanup on unmount
    return () => {
      endVoicePractice();
    };
  }, [startVoicePractice, endVoicePractice]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Handle end practice
  const handleEndPractice = async () => {
    await endVoicePractice();
    if (onComplete) {
      onComplete({
        transcript,
        scenario,
        gradeLevel,
        completed: transcript.length > 0
      });
    }
  };

  // Handle close/back
  const handleClose = () => {
    if (transcript.length > 0) {
      setShowEndConfirm(true);
    } else {
      endVoicePractice();
      if (onBack) onBack();
    }
  };

  // Get scenario title (handle both string and object)
  const getScenarioTitle = () => {
    if (!scenario) return 'Voice Practice';
    if (typeof scenario === 'string') return scenario;
    if (typeof scenario.title === 'object') {
      return scenario.title[gradeLevel] || scenario.title['6-8'] || Object.values(scenario.title)[0];
    }
    return scenario.title || scenario.name || 'Voice Practice';
  };

  // Get scenario context (prefer setupPrompt, then context, then description)
  const getScenarioContext = () => {
    if (!scenario) return 'Welcome to voice practice!';
    if (typeof scenario === 'string') return 'Practice your social skills';
    
    // Try setupPrompt first (most specific for voice practice)
    if (scenario.setupPrompt) {
      if (typeof scenario.setupPrompt === 'object') {
        return scenario.setupPrompt[gradeLevel] || scenario.setupPrompt['6-8'] || Object.values(scenario.setupPrompt)[0];
      }
      return scenario.setupPrompt;
    }
    
    // Fall back to context
    if (scenario.context) {
      if (typeof scenario.context === 'object') {
        return scenario.context[gradeLevel] || scenario.context['6-8'] || Object.values(scenario.context)[0];
      }
      return scenario.context;
    }
    
    // Fall back to description
    if (scenario.description) {
      if (typeof scenario.description === 'object') {
        return scenario.description[gradeLevel] || scenario.description['6-8'] || Object.values(scenario.description)[0];
      }
      return scenario.description;
    }
    
    return 'Practice your social skills';
  };

  // Determine status text and color
  const getStatusInfo = () => {
    if (isListening) {
      return { text: 'Listening...', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    }
    if (isSpeaking) {
      return { text: 'AI is speaking...', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' };
    }
    if (isConnected) {
      return { text: 'Connected - Start speaking!', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' };
    }
    return { text: 'Connecting...', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/50' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col z-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg font-bold flex-1 text-center px-4">
          Voice Practice: {getScenarioTitle()}
        </h1>
        
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Scenario Context Card */}
      <div className="px-4 pt-4 shrink-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-sm text-white/90 leading-relaxed">
            {getScenarioContext()}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Conversation Display */}
      <div className="flex-1 overflow-y-auto px-4 py-6 h-96">
        <div className="space-y-4 max-w-4xl mx-auto">
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Starting conversation...</p>
              </div>
            </div>
          ) : (
            transcript.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-xl p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-80">
                    {message.role === 'user' ? 'You' : 'AI Coach'}
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  {message.timestamp && (
                    <div className="text-xs opacity-60 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-white/10 p-6 shrink-0 bg-black/20">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-full border text-sm font-medium ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
            {statusInfo.text}
          </div>

          {/* Microphone Button */}
          <button
            onClick={() => {
              // Microphone button behavior is handled by the hook
              // The button is mainly for visual feedback
            }}
            disabled={isSpeaking || !isConnected}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isListening
                ? 'bg-red-500 animate-pulse hover:bg-red-600'
                : isSpeaking
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : isConnected
                ? 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                : 'bg-gray-500 cursor-not-allowed opacity-50'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <Square className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {/* End Practice Button */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
          >
            End Practice
          </button>
        </div>
      </div>

      {/* End Practice Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold mb-4">End Practice Session?</h3>
            <p className="text-gray-300 mb-6">
              {transcript.length > 0
                ? 'Are you sure you want to end this practice session? Your progress will be saved.'
                : 'Are you sure you want to exit? No progress will be saved.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowEndConfirm(false);
                  await handleEndPractice();
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                End Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePracticeScreen;


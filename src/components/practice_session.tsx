import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader, ArrowRight, Lightbulb, CheckCircle, XCircle, RefreshCw, Volume2, VolumeX, Mic, X } from 'lucide-react';
import { apiService } from '../services/api';

interface ScenarioOption {
  text: string;
  quality?: string;
  isGood?: boolean;
  feedback?: string;
  proTip?: string;
}

interface Scenario {
  context: string;
  question?: string;
  options?: ScenarioOption[];
}

interface PracticeSessionProps {
  category: string;
  gradeLevel: string;
  onComplete?: (data?: any) => void;
  scenario?: Scenario;
}

export default function PracticeSession({ category, gradeLevel, onComplete, scenario: currentScenario }: PracticeSessionProps) {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [showVoiceTutorial, setShowVoiceTutorial] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (voiceMode) {
      console.log('Voice mode activated');
      console.log('Agent ID:', (import.meta as any).env.VITE_ELEVENLABS_AGENT_ID);
      console.log('Current scenario:', scenarios[currentQuestionIndex]);
    }
  }, [voiceMode, currentQuestionIndex]);

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

  const handleOptionSelect = async (index: number) => {
    setSelectedOption(index);
    
    const currentScenario = scenarios[currentQuestionIndex];
    if (!currentScenario || !currentScenario.options) return;
    
    // Get AI feedback for this choice
    try {
      const userHistory = {
        recentChoices: 'practiced scenarios today',
        confidenceLevel: 'building'
      };
      
      const selectedOption = currentScenario.options[index];
      const aiFeedback = await apiService.generatePersonalizedFeedback({
        scenarioContext: currentScenario.context,
        question: currentScenario.question || '',
        studentChoice: selectedOption.text,
        correctAnswer: currentScenario.options.find(opt => opt.quality === 'excellent')?.text || '',
        choiceQuality: selectedOption.quality || '',
        gradeLevel: gradeLevel,
        studentStrengths: [],
        studentWeaknesses: [],
        previousPerformance: userHistory
      });
      
      setFeedback(aiFeedback || selectedOption.feedback || null);
    } catch (err) {
      console.error('Failed to get AI feedback:', err);
      // Fall back to scenario feedback
      const selectedOption = currentScenario.options[index];
      setFeedback(selectedOption.feedback || null);
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
        console.warn('onComplete prop not provided to PracticeSession');
      }
    }
  };

  const restartSession = () => {
    generateAllScenarios();
  };

  const handleVoiceModeToggle = () => {
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceTutorial');
    
    if (!hasSeenTutorial || hasSeenTutorial === 'false') {
      // Show tutorial modal first
      setShowVoiceTutorial(true);
    } else {
      // Enable voice mode directly
      setVoiceMode(true);
    }
  };

  const handleAllowMicrophone = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Mark tutorial as seen
      localStorage.setItem('hasSeenVoiceTutorial', 'true');
      setShowVoiceTutorial(false);
      setVoiceMode(true);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      alert('Microphone permission is required for voice practice. Please enable it in your browser settings.');
    }
  };

  const handleCancelTutorial = () => {
    setShowVoiceTutorial(false);
  };

  // Initial load
  React.useEffect(() => {
    generateAllScenarios();
  }, []);

  // Load ElevenLabs script when voice mode is activated
  React.useEffect(() => {
    if (voiceMode) {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        
        script.onload = () => {
          // Create and inject the web component after script loads
          if (widgetContainerRef.current) {
            const widgetElement = document.createElement('elevenlabs-convai');
            const agentId = (import.meta as any).env.VITE_ELEVENLABS_AGENT_ID || '';
            widgetElement.setAttribute('agent-id', agentId);
            // Add grade level as data attribute
            widgetElement.setAttribute('data-grade-level', gradeLevel);
            const currentScenarioData = scenarios[currentQuestionIndex] || currentScenario;
            const scenarioContext = currentScenarioData?.context || category || '';
            widgetElement.setAttribute('data-scenario-context', scenarioContext);
            widgetContainerRef.current.innerHTML = '';
            widgetContainerRef.current.appendChild(widgetElement);
            console.log('ElevenLabs widget injected with gradeLevel:', gradeLevel);
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load ElevenLabs script');
        };
        
        document.head.appendChild(script);
        
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
          if (widgetContainerRef.current) {
            widgetContainerRef.current.innerHTML = '';
          }
        };
      } else {
        // Script already loaded, just inject the widget
        if (widgetContainerRef.current) {
          const widgetElement = document.createElement('elevenlabs-convai');
          const agentId = (import.meta as any).env.VITE_ELEVENLABS_AGENT_ID || '';
          widgetElement.setAttribute('agent-id', agentId);
          // Add grade level as data attribute
          widgetElement.setAttribute('data-grade-level', gradeLevel);
          const currentScenarioData = scenarios[currentQuestionIndex] || currentScenario;
          const scenarioContext = currentScenarioData?.context || category || '';
          widgetElement.setAttribute('data-scenario-context', scenarioContext);
          widgetContainerRef.current.innerHTML = '';
          widgetContainerRef.current.appendChild(widgetElement);
          console.log('ElevenLabs widget injected (script already loaded) with gradeLevel:', gradeLevel);
        }
      }
    } else {
      // Clean up when voice mode is disabled
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = '';
      }
    }
  }, [voiceMode, gradeLevel, scenarios, currentQuestionIndex, currentScenario, category]);

  // Voice mode - render ElevenLabs Widget directly
  if (voiceMode) {
    const currentScenarioData = scenarios[currentQuestionIndex] || currentScenario;
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-purple-600 z-10">
          <div className="text-white">
            <h2 className="text-xl font-bold">{currentScenarioData?.context || category}</h2>
          </div>
          <button
            onClick={() => setVoiceMode(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Widget will render here */}
        <div ref={widgetContainerRef} className="h-full w-full flex items-center justify-center pt-16"></div>
      </div>
    );
  }

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

  const activeScenario = scenarios[currentQuestionIndex] || currentScenario;
  if (!activeScenario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Voice Tutorial Modal */}
      {showVoiceTutorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Try Voice Practice!</h2>
              <p className="text-lg text-gray-300">
                Speak naturally with the AI coach. It will listen and respond just like a real conversation!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleAllowMicrophone}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all"
              >
                <Mic className="w-5 h-5" />
                Allow Microphone
              </button>
              <button
                onClick={handleCancelTutorial}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-bold">Practice Session</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Mode Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoiceModeToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition text-white"
              >
                {voiceMode ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>Switch to Text Mode</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Switch to Voice Mode</span>
                  </>
                )}
              </button>
              {!voiceMode && (
                <span className="px-2 py-1 bg-green-500 text-xs rounded-full ml-2">NEW</span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {scenarios.length}
            </div>
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
          <p className="text-lg text-gray-300">{activeScenario.context}</p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {activeScenario.options && activeScenario.options.map((option, index) => (
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
        {selectedOption !== null && feedback && activeScenario.options && (
          <div className={`p-6 rounded-2xl border-2 ${
            activeScenario.options[selectedOption]?.isGood
              ? 'bg-emerald-500/20 border-emerald-500'
              : 'bg-orange-500/20 border-orange-500'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {activeScenario.options[selectedOption]?.isGood ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-xl mb-2">
                  {activeScenario.options[selectedOption]?.isGood ? 'Great Choice!' : 'Let\'s Learn!'}
                </h3>
                <p className="text-gray-300">{feedback}</p>
              </div>
            </div>

            {activeScenario.options[selectedOption]?.proTip && (
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 mt-4">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-300">{activeScenario.options[selectedOption]?.proTip}</p>
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


import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RotateCcw, Lightbulb, Volume2, VolumeX, Home, Info } from 'lucide-react';
import { getUserData, STORAGE_KEY } from './utils/storage';
import { getGradeRange } from './utils/helpers';
import scenarios from './utils/scenarios';
import SuccessAnimation from './animations/SuccessAnimation';
import LoadingSpinner from './animations/LoadingSpinner';

function PracticeSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText }) {
  const [currentSituation, setCurrentSituation] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(autoReadText);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gradeRange = getGradeRange(gradeLevel);
  const scenario = scenarios[sessionId] || scenarios[1];
  const situation = scenario.situations[currentSituation];

  // Sound effect functions
  const playSound = (type) => {
    if (!soundEffects) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'incorrect') {
      oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'complete') {
      const playNote = (freq, startTime, duration) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      playNote(523.25, audioContext.currentTime, 0.2);
      playNote(659.25, audioContext.currentTime + 0.15, 0.2);
      playNote(783.99, audioContext.currentTime + 0.3, 0.2);
      playNote(1046.50, audioContext.currentTime + 0.45, 0.4);
    } else if (type === 'click') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  };

  const getVoiceSettings = (grade) => {
    const gradeNum = parseInt(grade) || 5;
    if (gradeNum <= 2) return { rate: 0.75, pitch: 1.08 };
    if (gradeNum <= 5) return { rate: 0.8, pitch: 1.03 };
    if (gradeNum <= 8) return { rate: 0.85, pitch: 1.0 };
    return { rate: 0.9, pitch: 0.98 };
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceSettings = getVoiceSettings(gradeLevel);
    
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    const selectVoice = (voices) => {
      const warmVoices = ['Samantha', 'Karen', 'Moira', 'Victoria', 'Google US English Female'];
      for (const voiceName of warmVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
          return;
        }
      }
      const anyFemale = voices.find(v => v.name.toLowerCase().includes('female'));
      if (anyFemale) utterance.voice = anyFemale;
    };

    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        selectVoice(voices);
      };
    } else {
      selectVoice(voices);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) stopSpeaking();
    else speak(text);
  };

  useEffect(() => {
    if (autoRead && situation) {
      const context = getContent(situation.context);
      const prompt = getContent(situation.prompt);
      const optionsText = situation.options.map((opt, idx) => {
        const text = getContent(opt.text);
        return `Option ${String.fromCharCode(65 + idx)}: ${text}`;
      }).join('. ');
      const fullText = `${context}. ${prompt}. Here are your options. ${optionsText}`;
      setTimeout(() => speak(fullText), 500);
    }
    return () => stopSpeaking();
  }, [currentSituation, autoRead]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const getContent = (content) => {
    return typeof content === 'object' ? content[gradeRange] : content;
  };

  const handleOptionSelect = (optionIndex) => {
    if (showFeedback) return;
    
    playSound('click');
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const option = situation.options[optionIndex];
    if (option.isGood) {
      setTotalPoints(prev => prev + option.points);
      playSound('correct');
      setShowCelebration(true);
    } else {
      playSound('incorrect');
    }
  };

  const handleNext = () => {
    stopSpeaking();
    playSound('click');
    
    if (currentSituation < scenario.situations.length - 1) {
      setCurrentSituation(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setSessionComplete(true);
      playSound('complete');
      const userData = getUserData();
      userData.totalSessions += 1;
      userData.confidenceScore = Math.min(100, userData.confidenceScore + 2);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  };

  const handleBack = () => {
    stopSpeaking();
    playSound('click');
    if (currentSituation > 0) {
      setCurrentSituation(prev => prev - 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentSituation(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setTotalPoints(0);
    setSessionComplete(false);
  };

  const progressPercentage = ((currentSituation + 1) / scenario.situations.length) * 100;
  const finalScore = Math.round((totalPoints / (scenario.situations.length * 10)) * 100);
  const scenarioTitle = getContent(scenario.title);
  const situationContext = getContent(situation.context);
  const situationPrompt = getContent(situation.prompt);

  if (sessionComplete) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="fixed inset-0 opacity-20" style={{ background: scenario.background }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pb-24">
          <div className="max-w-2xl w-full">
            <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center ${
              darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="mb-6">
                <div className="text-7xl mb-4">🎉</div>
                <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Practice Complete!
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{scenarioTitle}</p>
              </div>

              <div className="mb-8">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {finalScore}%
                </div>
                <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {totalPoints} out of {scenario.situations.length * 10} points earned
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleRestart} className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                  darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}>
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button onClick={() => onNavigate('home')} className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="fixed inset-0 opacity-10" style={{ background: scenario.background }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 pb-32">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => onNavigate('home')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
              darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scenarioTitle}</h1>
            <div className="w-32"></div>
          </div>
          
          <div className="mb-2">
            <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Situation {currentSituation + 1} of {scenario.situations.length}
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 rounded-xl flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                  {scenario.icon && React.createElement(scenario.icon, { className: "w-12 h-12 text-white" })}
                </div>
                <div className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {gradeRange === 'k2' ? 'STORY' : 'SCENARIO'}
                </div>
              </div>
              <button onClick={() => {
                const optionsText = situation.options.map((opt, idx) => {
                  const text = getContent(opt.text);
                  return `Option ${String.fromCharCode(65 + idx)}: ${text}`;
                }).join('. ');
                const fullText = `${situationContext}. ${situationPrompt}. Here are your options. ${optionsText}`;
                toggleSpeech(fullText);
              }} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                isSpeaking ? 'bg-emerald-500 text-white' : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {isSpeaking ? <><VolumeX className="w-5 h-5" /><span className="text-sm">Stop</span></> : 
                  <><Volume2 className="w-5 h-5" /><span className="text-sm">Read Aloud</span></>}
              </button>
            </div>

            <p className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{situationContext}</p>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{situationPrompt}</div>
          </div>

          <div className="space-y-3">
            {situation.options.map((option, index) => {
              const optionText = getContent(option.text);
              return (
                <button key={index} onClick={() => handleOptionSelect(index)} disabled={showFeedback} className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  selectedOption === index ? (option.isGood ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10') :
                  darkMode ? 'border-white/20 hover:border-white/40 hover:bg-white/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showFeedback && selectedOption !== index ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedOption === index ? (option.isGood ? 'bg-emerald-500' : 'bg-red-500') : darkMode ? 'bg-white/10' : 'bg-gray-100'
                    }`}>
                      {selectedOption === index ? (option.isGood ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />) : 
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{String.fromCharCode(65 + index)}</span>}
                    </div>
                    <span className={`flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className={`backdrop-blur-xl border rounded-3xl p-6 mb-6 animate-fadeIn ${
            situation.options[selectedOption].isGood ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200') :
            (darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
          }`}>
            <div className="flex items-center justify-end mb-4">
              <button onClick={() => {
                const feedback = getContent(situation.options[selectedOption].feedback);
                const proTip = situation.options[selectedOption].proTip ? getContent(situation.options[selectedOption].proTip) : '';
                const feedbackText = feedback + (proTip ? `. ${proTip}` : '');
                toggleSpeech(feedbackText);
              }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isSpeaking ? 'bg-blue-500 text-white' : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>Read Feedback</span>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                situation.options[selectedOption].isGood ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {situation.options[selectedOption].isGood ? <CheckCircle className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${
                  situation.options[selectedOption].isGood ? (darkMode ? 'text-emerald-400' : 'text-emerald-700') : (darkMode ? 'text-red-400' : 'text-red-700')
                }`}>
                  {situation.options[selectedOption].isGood ? 'Great Choice!' : "Let's Learn!"}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getContent(situation.options[selectedOption].feedback)}
                </p>
                
                {!situation.options[selectedOption].isGood && situation.options[selectedOption].proTip && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl mt-4 ${
                    darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      {getContent(situation.options[selectedOption].proTip)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="flex gap-4 mb-6">
            {currentSituation > 0 && (
              <button onClick={handleBack} className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}>
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            <button onClick={handleNext} className={`${currentSituation > 0 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2`}>
              {currentSituation < scenario.situations.length - 1 ? 'Next Situation' : 'Complete'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-sm font-semibold">Score</div>
            <button onClick={() => setAutoRead(!autoRead)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              autoRead ? (darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300') :
              (darkMode ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200')
            }`}>
              {autoRead ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              Auto-Read {autoRead ? 'On' : 'Off'}
            </button>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            {totalPoints} points
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
      
      {/* Celebration Animation */}
      {showCelebration && (
        <SuccessAnimation 
          points={situation.options[selectedOption]?.points || 10}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

export default PracticeSession;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Loader,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  ChevronLeft,
  Clock,
  BookOpen,
  Brain
} from 'lucide-react';
import WebcamEmotionMonitor from "./WebcamEmotionMonitor";
import EmotionOptInModal from "./EmotionOptInModal";
import {
  topics,
  getGradeBandFromGrade,
  generateScenarioForTopic
} from '../data/voicePracticeScenarios';
import { useLocation } from 'react-router-dom';

const LoadingView = ({ onBack }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
    {onBack && (
      <button
        onClick={onBack}
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
    )}
    <div className="text-center max-w-md mx-auto px-6">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          <Loader className="w-10 h-10 text-blue-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Creating a fresh scenario...</h2>
      <p className="text-lg text-gray-400 mb-2">AI is crafting a topic-specific practice flow.</p>
      <p className="text-sm text-gray-500">This will only take a moment!</p>
    </div>
  </div>
);

const ErrorView = ({ message, onBack, onRetry }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
    {onBack && (
      <button
        onClick={onBack}
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
    )}
    <div className="max-w-md text-center space-y-4">
      <h2 className="text-2xl font-bold">Oops!</h2>
      <p className="text-gray-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  </div>
);

export default function AIPracticeSession({
  gradeLevel = '6-8',
  selectedTopicId,
  onBack,
  onStartScenario,
  // NEW: Props from AILessonSession (lesson flow)
  aiLesson = null,
  onComplete = null,
  sessionId = null,
  onNavigate = null,
  darkMode = true,
  soundEffects = false,
  autoReadText = false,
  videoEmotionData = null,
  emotionMCQ = null
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [generatedScenario, setGeneratedScenario] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const location = useLocation();
  
  // Practice quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [inLessonPractice, setInLessonPractice] = useState(false);
  
  const [emotionEnabled, setEmotionEnabled] = useState(() => {
    return localStorage.getItem("emotionEnabled") === "true";
  });
  const [showEmotionOptIn, setShowEmotionOptIn] = useState(() => {
    return localStorage.getItem("emotionOptInAsked") !== "true";
  });
  const [emotionState, setEmotionState] = useState({ dominant: "neutral", raw: {} });
  const [coachMode, setCoachMode] = useState("normal");

  const numericGrade = useMemo(() => {
    const locationGrade = location?.state?.grade ?? location?.state?.gradeLevel ?? null;
    const source = locationGrade ?? gradeLevel;

    if (typeof source === 'number') {
      return source;
    }

    if (typeof source === 'string') {
      if (source.includes('-')) {
        const [start] = source.split('-');
        const parsedRangeGrade = parseInt(start, 10);
        if (!Number.isNaN(parsedRangeGrade)) return parsedRangeGrade;
      }

      const parsed = parseInt(source, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }

    return 6;
  }, [gradeLevel, location?.state]);

  const gradeBand = useMemo(() => getGradeBandFromGrade(numericGrade), [numericGrade]);
  const locationTopicId = location?.state?.topicId ?? null;
  const topicIdToUse = selectedTopicId ?? locationTopicId ?? null;

  useEffect(() => {
    // CASE 1: Lesson flow - aiLesson provided from AILessonSession
    if (aiLesson) {
      console.log("✅ Using AI lesson data from lesson flow:", aiLesson.title || aiLesson.id);
      
      // Extract practice scenarios from the lesson
      const scenarios = aiLesson.practice?.scenarios || aiLesson.practice?.steps || [];
      
      if (scenarios.length > 0) {
        setPracticeQuestions(scenarios);
        setInLessonPractice(true);
        setActiveTopic({
          id: aiLesson.id || sessionId,
          title: aiLesson.title || aiLesson.introduction?.title || 'Practice Session',
          description: aiLesson.introduction?.objective || ''
        });
        setError(null);
        setLoading(false);
        return;
      } else {
        // No practice questions - complete with default points
        if (onComplete) onComplete(50);
        return;
      }
    }

    // CASE 2: Practice tab flow - use selectedTopicId (existing behavior)
    if (!topicIdToUse) {
      setError('No topic selected. Please choose one.');
      setGeneratedScenario(null);
      setActiveTopic(null);
      setLoading(false);
      return;
    }

    const loadScenario = () => {
      setLoading(true);
      try {
        const topic = topics.find((t) => t.id === topicIdToUse);
        if (!topic) {
          setError('We could not find that practice topic.');
          setActiveTopic(null);
          setGeneratedScenario(null);
          return;
        }

        setActiveTopic(topic);
        const scenario = generateScenarioForTopic(topic.id, numericGrade);
        setGeneratedScenario(scenario);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to generate scenario:', err);
        setError('Unable to generate a scenario right now. Please try again.');
        setGeneratedScenario(null);
      } finally {
        setLoading(false);
      }
    };

    loadScenario();
  }, [topicIdToUse, numericGrade, aiLesson, sessionId]);

  const regenerateScenario = useCallback(() => {
    if (!activeTopic) return;
    setIsGenerating(true);
    setTimeout(() => {
      const scenario = generateScenarioForTopic(activeTopic.id, numericGrade);
      setGeneratedScenario(scenario);
      setIsGenerating(false);
    }, 150);
  }, [activeTopic, numericGrade]);

  // Handle emotion results coming from Hume
  const handleEmotion = (data) => {
    if (!data || !data[0]) return;

    const sorted = Object.entries(data[0].emotions || {})
      .sort((a, b) => b[1] - a[1]);

    const dominant = sorted[0]?.[0] || "neutral";

    setEmotionState({
      dominant,
      raw: data[0].emotions,
    });
  };

  // Adaptive coaching logic
  useEffect(() => {
    if (!emotionEnabled) return;

    if (emotionState.dominant === "confused") {
      setCoachMode("extra-help");
    } 
    else if (emotionState.dominant === "frustrated") {
      setCoachMode("slow-down");
    } 
    else if (emotionState.dominant === "excited") {
      setCoachMode("harder");
    } 
    else {
      setCoachMode("normal");
    }

  }, [emotionState, emotionEnabled]);

  // Practice quiz handlers
  const handleAnswerSelect = (answerId) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Practice complete - calculate points
      // Account for the current question's correctness
      const currentQuestion = practiceQuestions[currentQuestionIndex];
      const currentIsCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const finalCorrectCount = currentIsCorrect ? correctAnswers + 1 : correctAnswers;
      
      const pointsPerQuestion = 10;
      const earnedPoints = finalCorrectCount * pointsPerQuestion + 10; // bonus for completing
      if (onComplete) onComplete(earnedPoints);
    }
  };

  const handleStartPractice = () => {
    // If from lesson flow with onComplete callback
    if (aiLesson && onComplete) {
      // Simulate practice completion with points
      const earnedPoints = 50; // Or calculate based on performance
      onComplete(earnedPoints);
      return;
    }

    // Existing practice tab behavior
    if (!generatedScenario || typeof onStartScenario !== 'function') return;
    
    const introLine = generatedScenario.introLine ??
      generatedScenario.prompt ??
      generatedScenario.warmupQuestion ??
      generatedScenario.title ??
      'Let\'s get started!';
    
    onStartScenario({
      scenario: {
        ...generatedScenario,
        introLine
      },
      gradeLevel: String(numericGrade),
      gradeBand,
      coachMode // Pass coach mode to practice session
    });
  };

  // Lesson Practice Mode UI
  if (inLessonPractice && practiceQuestions.length > 0) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;
    
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {practiceQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className={`h-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className={`rounded-3xl p-8 mb-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
            {/* Situation */}
            {currentQuestion.situation && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Situation:</p>
                <p className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{currentQuestion.situation}</p>
              </div>
            )}

            {/* Question */}
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectAnswer = option.id === currentQuestion.correctAnswer;
                
                let optionStyle = darkMode ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-gray-50 border-gray-200 hover:border-blue-300';
                
                if (showFeedback) {
                  if (isCorrectAnswer) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                  } else if (isSelected && !isCorrectAnswer) {
                    optionStyle = 'bg-red-500/20 border-red-500 text-red-300';
                  }
                } else if (isSelected) {
                  optionStyle = darkMode ? 'bg-blue-500/20 border-blue-500' : 'bg-blue-50 border-blue-500';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionStyle}`}
                  >
                    <span className="font-bold mr-3">{option.id}.</span>
                    {option.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'bg-emerald-500/20 border border-emerald-500/30' 
                  : 'bg-orange-500/20 border border-orange-500/30'
              }`}>
                <p className={`font-medium ${
                  selectedAnswer === currentQuestion.correctAnswer ? 'text-emerald-300' : 'text-orange-300'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer 
                    ? currentQuestion.feedbackCorrect || '✓ Great job! That\'s correct!'
                    : currentQuestion.feedbackIncorrect || `The correct answer was ${currentQuestion.correctAnswer}.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  selectedAnswer 
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:shadow-lg' 
                    : `${darkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:shadow-lg transition-all"
              >
                {currentQuestionIndex < practiceQuestions.length - 1 ? 'Next Question →' : 'Complete Lesson 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingView onBack={onBack} />;
  if (error) return <ErrorView message={error} onBack={onBack} onRetry={regenerateScenario} />;
  if (!generatedScenario) {
    return (
      <ErrorView
        message="We couldn't generate a scenario for this topic."
        onBack={onBack}
        onRetry={regenerateScenario}
      />
    );
  }

  return (
    <>
      {/* Emotion opt-in modal */}
      {showEmotionOptIn && (
        <EmotionOptInModal
          onEnable={() => {
            localStorage.setItem("emotionEnabled", "true");
            localStorage.setItem("emotionOptInAsked", "true");
            setEmotionEnabled(true);
            setShowEmotionOptIn(false);
          }}
          onDisable={() => {
            localStorage.setItem("emotionEnabled", "false");
            localStorage.setItem("emotionOptInAsked", "true");
            setEmotionEnabled(false);
            setShowEmotionOptIn(false);
          }}
        />
      )}

      {/* Real-time emotion analyzer */}
      {emotionEnabled && (
        <WebcamEmotionMonitor onEmotion={handleEmotion} />
      )}

      <div className="min-h-screen bg-black text-white relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <div className="mb-4">
          <div className="inline-flex items-center gap-3 text-yellow-400 uppercase tracking-wide text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Voice Practice · Grade {gradeBand}
          </div>
          <h1 className="mt-2 text-4xl font-bold">
            {activeTopic?.title || 'Choose a topic to practice'}
          </h1>
          {activeTopic?.description && (
            <p className="mt-3 text-gray-400 max-w-2xl">{activeTopic.description}</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-blue-300">
            <Lightbulb className="w-4 h-4" />
            Topic-Specific Scenario
          </div>
          <h2 className="text-3xl font-bold text-white">{generatedScenario.title}</h2>
          <p className="text-gray-300 text-base">{generatedScenario.contextLine}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Clock className="w-4 h-4" />
                Estimated Time
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {generatedScenario.estimatedDuration || 5} minutes
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                <BookOpen className="w-4 h-4" />
                Practice Partner
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {generatedScenario.characterRole || 'Coach Cue'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-amber-300 mb-2">Warm-up Question</div>
            <p className="text-gray-200 leading-relaxed">
              {generatedScenario.warmupQuestion || generatedScenario.prompt}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-purple-300 mb-2">Coach Tip</div>
            <p className="text-gray-200 leading-relaxed">{generatedScenario.guidance}</p>
          </div>

          {generatedScenario.learningObjectives?.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-300 mb-3">
                <Brain className="w-4 h-4" />
                Learning Objectives
              </div>
              <ul className="space-y-2 text-sm text-gray-200">
                {generatedScenario.learningObjectives.map((objective, index) => (
                  <li key={`${generatedScenario.id}-objective-${index}`} className="flex gap-2">
                    <span className="text-blue-300">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={regenerateScenario}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate another scenario'}
            </button>
            <button
              onClick={handleStartPractice}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:opacity-90"
            >
              Start Practice
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  Lock, 
  Play, 
  Star, 
  TrendingUp, 
  X, 
  Mic, 
  Sparkles,
  ChevronRight,
  Info,
  Filter,
  Zap
} from 'lucide-react';
import { getScenarioForGrade, normalizeGradeLevel, getAllCategories } from '../../data/voicePracticeScenarios';
import voiceProgressService from '../../services/voiceProgressService';
import { getUserData } from '../socialcue/utils/storage';
import voiceAnalytics from '../../services/voiceAnalytics.js';
import ElevenLabsWidget from '../ElevenLabsWidget';

const VoicePracticeSelection = ({ 
  gradeLevel, 
  onSelectScenario, 
  onBack, 
  onNavigate, // Support legacy prop
  darkMode = true 
}) => {
  // Support both prop patterns
  const userData = getUserData();
  const finalGradeLevel = gradeLevel || userData?.grade || userData?.gradeLevel || '6-8';
  const handleBack = onBack || (() => onNavigate?.('home'));
  
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewScenario, setPreviewScenario] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [scenarioStats, setScenarioStats] = useState({});
  const [showWidget, setShowWidget] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const normalizedGrade = useMemo(() => normalizeGradeLevel(finalGradeLevel), [finalGradeLevel]);

  // Category colors mapping
  const categoryColors = {
    'conversation-starters': { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/50', text: 'text-blue-400' },
    'active-listening': { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-500/50', text: 'text-green-400' },
    'group-interaction': { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/50', text: 'text-purple-400' },
    'conflict-resolution': { bg: 'from-red-500/20 to-red-600/20', border: 'border-red-500/50', text: 'text-red-400' },
    'social-planning': { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/50', text: 'text-orange-400' },
    'empathy': { bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-500/50', text: 'text-pink-400' },
    'self-advocacy': { bg: 'from-teal-500/20 to-teal-600/20', border: 'border-teal-500/50', text: 'text-teal-400' }
  };

  // Difficulty colors
  const difficultyColors = {
    'beginner': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
    'intermediate': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    'advanced': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' }
  };

  // Scenario icons/emojis
  const scenarioIcons = {
    'voice-starting-conversations': '👋',
    'voice-active-listening': '👂',
    'voice-joining-groups': '👥',
    'voice-handling-disagreement': '🤝',
    'voice-making-plans': '📅',
    'voice-showing-empathy': '❤️',
    'voice-asking-for-help': '🙋',
    'voice-handling-teasing': '🛡️',
    'voice-introducing-yourself': '👤',
    'voice-setting-boundaries': '🚫'
  };

  // Load scenarios from local data
  useEffect(() => {
    const loadScenarios = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first (if available)
        try {
          const response = await fetch(`http://localhost:3001/api/voice/scenarios?gradeLevel=${normalizedGrade}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.scenarios && data.scenarios.length > 0) {
              // Use API data if available
              const formattedScenarios = data.scenarios.map(apiScenario => {
                const localScenario = getScenarioForGrade(apiScenario.id || apiScenario.name, normalizedGrade);
                return localScenario || {
                  id: apiScenario.id || `scenario-${apiScenario.name}`,
                  title: apiScenario.name || apiScenario.title,
                  description: apiScenario.description || '',
                  category: apiScenario.category || 'conversation-starters',
                  categoryLabel: formatCategoryLabel(apiScenario.category || 'conversation-starters'),
                  difficulty: apiScenario.difficulty || 'beginner',
                  estimatedDuration: parseInt(apiScenario.estimatedDuration) || 5,
                  gradeLevel: normalizedGrade,
                  icon: scenarioIcons[apiScenario.id] || '💬',
                  learningObjectives: [],
                  setupPrompt: ''
                };
              });
              setScenarios(formattedScenarios.map(s => ({
                ...s,
                icon: scenarioIcons[s.id] || s.icon || '💬',
                categoryLabel: formatCategoryLabel(s.category)
              })));
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API not available, using local data:', apiError);
        }
        
        // Fallback to local scenarios database
        const { getScenariosByGrade } = await import('../../data/voicePracticeScenarios');
        const localScenarios = getScenariosByGrade(normalizedGrade);
        
        if (localScenarios && localScenarios.length > 0) {
          const formattedScenarios = localScenarios.map(scenario => {
            const formatted = getScenarioForGrade(scenario.id, normalizedGrade);
            return {
              ...formatted,
              icon: scenarioIcons[scenario.id] || scenario.icon || '💬',
              categoryLabel: formatCategoryLabel(formatted.category)
            };
          });
          
          setScenarios(formattedScenarios);
          
          // Cache scenarios
          localStorage.setItem(`voice_scenarios_${normalizedGrade}`, JSON.stringify({
            scenarios: formattedScenarios,
            timestamp: Date.now()
          }));
        } else {
          throw new Error('No scenarios available for your grade level');
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
        
        // Try to load from cache as last resort
        const cached = localStorage.getItem(`voice_scenarios_${normalizedGrade}`);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            setScenarios(cachedData.scenarios || []);
            setError('Using cached data (offline mode)');
          } catch (cacheError) {
            setError('Failed to load scenarios. Please check your connection.');
          }
        } else {
          setError('Failed to load scenarios. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, [normalizedGrade]);

  // Load progress and stats
  useEffect(() => {
    const progress = voiceProgressService.getProgress();
    setCompletedScenarios(progress.scenariosCompleted || []);
    
    // Load scenario-specific stats
    const history = voiceProgressService.getSessionHistory(100);
    const stats = {};
    
    history.forEach(session => {
      if (session.scenarioId) {
        if (!stats[session.scenarioId]) {
          stats[session.scenarioId] = {
            timesCompleted: 0,
            highScore: 0,
            lastCompleted: null
          };
        }
        stats[session.scenarioId].timesCompleted++;
        if (session.points > stats[session.scenarioId].highScore) {
          stats[session.scenarioId].highScore = session.points;
        }
        if (!stats[session.scenarioId].lastCompleted || 
            new Date(session.completedAt) > new Date(stats[session.scenarioId].lastCompleted)) {
          stats[session.scenarioId].lastCompleted = session.completedAt;
        }
      }
    });
    
    setScenarioStats(stats);
  }, []);

  // Check if first time user
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('voice_practice_tutorial_seen');
    if (!hasSeenTutorial && scenarios.length > 0) {
      setShowTutorial(true);
    }
  }, [scenarios.length]);

  // Filter scenarios
  const filteredScenarios = useMemo(() => {
    let filtered = scenarios;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.categoryLabel?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [scenarios, selectedCategory, searchQuery]);

  // Get featured scenarios (completed ones or beginner level)
  const featuredScenarios = useMemo(() => {
    return scenarios
      .filter(s => s.difficulty === 'beginner' || completedScenarios.includes(s.id))
      .slice(0, 3);
  }, [scenarios, completedScenarios]);

  // Get all categories
  const categories = useMemo(() => {
    const cats = ['all', ...getAllCategories()];
    return cats.map(cat => ({
      id: cat,
      label: formatCategoryLabel(cat)
    }));
  }, []);

  // Format category label
  function formatCategoryLabel(category) {
    if (category === 'all') return 'All';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Handle scenario selection - launch widget
  const handleSelectScenario = useCallback((scenario) => {
    // Track analytics
    voiceAnalytics.trackStartedConversation();
    
    console.log('✅ Scenario clicked:', scenario.title || scenario.id);
    setSelectedScenario(scenario);
    setShowWidget(true);
    
    // Also call the original callback if provided (for compatibility)
    if (onSelectScenario) {
      onSelectScenario(scenario);
    }
  }, [onSelectScenario]);

  // Get scenario completion status
  const getScenarioStatus = (scenarioId) => {
    const stats = scenarioStats[scenarioId];
    const isCompleted = completedScenarios.includes(scenarioId);
    
    return {
      isCompleted,
      timesCompleted: stats?.timesCompleted || 0,
      highScore: stats?.highScore || 0,
      isLocked: false // Progressive unlock can be implemented here
    };
  };

  // Tutorial steps
  const tutorialSteps = [
    {
      title: 'Welcome to Voice Practice! 🎤',
      content: 'Practice your social skills through real conversations with AI. Each scenario helps you build confidence in different social situations.',
      icon: <Mic className="w-8 h-8 text-blue-500" />
    },
    {
      title: 'Choose Your Scenario',
      content: 'Browse scenarios by category or search for specific skills. Each scenario shows difficulty level and estimated time.',
      icon: <Filter className="w-8 h-8 text-purple-500" />
    },
    {
      title: 'Practice Makes Perfect',
      content: 'Complete scenarios multiple times to improve. Track your progress and see your high scores.',
      icon: <TrendingUp className="w-8 h-8 text-green-500" />
    },
    {
      title: 'Get Started',
      content: 'Click on any scenario card to preview it, then start practicing!',
      icon: <Play className="w-8 h-8 text-emerald-500" />
    }
  ];

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('voice_practice_tutorial_seen', 'true');
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('voice_practice_tutorial_seen', 'true');
  };

  // If widget is shown, render widget UI
  if (showWidget && selectedScenario) {
    return (
      <ElevenLabsWidget
        agentId={import.meta.env.VITE_ELEVENLABS_AGENT_ID}
        scenario={selectedScenario}
        gradeLevel={finalGradeLevel}
        onClose={() => {
          console.log('Closing widget');
          setShowWidget(false);
          setSelectedScenario(null);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Voice Practice</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose a scenario to practice your social skills
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-white/5 border-white/20 focus:border-blue-500/50' 
                  : 'bg-white border-gray-200 focus:border-blue-500'
              }`}
              aria-label="Search scenarios"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white'
                    : darkMode
                      ? 'bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Filter by ${category.label}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            darkMode 
              ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading scenarios...</p>
            </div>
          </div>
        )}

        {/* Featured section */}
        {!loading && featuredScenarios.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl font-bold">Featured & Recommended</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={handleSelectScenario}
                  onPreview={setPreviewScenario}
                  darkMode={darkMode}
                  status={getScenarioStatus(scenario.id)}
                  categoryColors={categoryColors}
                  difficultyColors={difficultyColors}
                />
              ))}
            </div>
          </section>
        )}

        {/* All scenarios */}
        {!loading && (
          <section>
            <h2 className="text-xl font-bold mb-4">All Scenarios</h2>
            {filteredScenarios.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
              }`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery ? 'No scenarios found matching your search.' : 'No scenarios available for your grade level.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onSelect={handleSelectScenario}
                    onPreview={setPreviewScenario}
                    darkMode={darkMode}
                    status={getScenarioStatus(scenario.id)}
                    categoryColors={categoryColors}
                    difficultyColors={difficultyColors}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* How it works section */}
        <section className="mt-12 mb-8">
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-blue-500/30' 
              : 'bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">How It Works</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Choose a Scenario</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a practice scenario that matches your learning goals
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Practice Conversation</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Have a real-time voice conversation with AI in a safe environment
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get Feedback</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive personalized feedback and tips to improve your skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Preview Modal */}
      {previewScenario && (
        <ScenarioPreviewModal
          scenario={previewScenario}
          onClose={() => setPreviewScenario(null)}
          onStart={() => {
            handleSelectScenario(previewScenario);
            setPreviewScenario(null);
          }}
          darkMode={darkMode}
          status={getScenarioStatus(previewScenario.id)}
          categoryColors={categoryColors}
          difficultyColors={difficultyColors}
        />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal
          steps={tutorialSteps}
          currentStep={tutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Scenario Card Component
const ScenarioCard = ({ scenario, onSelect, onPreview, darkMode, status, categoryColors, difficultyColors }) => {
  const categoryColor = categoryColors[scenario.category] || categoryColors['conversation-starters'];
  const difficultyColor = difficultyColors[scenario.difficulty] || difficultyColors['beginner'];

  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg animate-slideUp ${
        darkMode 
          ? 'bg-white/8 border-white/20 hover:border-white/30' 
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
      } ${status.isCompleted ? 'ring-2 ring-emerald-500/50' : ''}`}
      onClick={() => onPreview(scenario)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(scenario);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${scenario.title} - ${scenario.difficulty} difficulty. Click to preview.`}
    >
      {/* Header with icon and category */}
      <div className={`p-4 bg-gradient-to-r ${categoryColor.bg} border-b ${categoryColor.border}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="text-4xl">{scenario.icon}</div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryColor.text} bg-black/20`}>
            {scenario.categoryLabel}
          </div>
        </div>
        <h3 className="text-lg font-bold mb-1">{scenario.title}</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {scenario.description}
        </p>

        {/* Stats */}
        {status.timesCompleted > 0 && (
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Completed {status.timesCompleted}x
            </div>
            {status.highScore > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {status.highScore}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColor.bg} ${difficultyColor.text}`}>
              {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
            </span>
            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Clock className="w-3 h-3" />
              {scenario.estimatedDuration} min
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      </div>
    </div>
  );
};

// Scenario Preview Modal
const ScenarioPreviewModal = ({ scenario, onClose, onStart, darkMode, status, categoryColors, difficultyColors }) => {
  const categoryColor = categoryColors[scenario.category] || categoryColors['conversation-starters'];
  const difficultyColor = difficultyColors[scenario.difficulty] || difficultyColors['beginner'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${
        darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${categoryColor.bg} border-b ${categoryColor.border}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">{scenario.icon}</div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColor.text} bg-black/20`}>
              {scenario.categoryLabel}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColor.bg} ${difficultyColor.text}`}>
              {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{scenario.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {scenario.description}
            </p>
          </div>

          {scenario.learningObjectives && scenario.learningObjectives.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside space-y-1">
                {scenario.learningObjectives.map((objective, idx) => (
                  <li key={idx} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scenario.setupPrompt && (
            <div className={`mb-6 p-4 rounded-xl border ${
              darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Scenario Preview
              </h3>
              <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "{scenario.setupPrompt}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-4 h-4" />
                {scenario.estimatedDuration} minutes
              </div>
              {status.timesCompleted > 0 && (
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed {status.timesCompleted} time{status.timesCompleted !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/20 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'bg-white/5 border border-white/20 hover:bg-white/10' 
                : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" fill="white" />
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};

// Tutorial Modal
const TutorialModal = ({ steps, currentStep, onNext, onSkip, darkMode }) => {
  const currentTutorial = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm`} onClick={onSkip} aria-hidden="true" />
      
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl ${
        darkMode ? 'bg-black border-white/20' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
          <div className="flex items-center gap-3">
            {currentTutorial.icon}
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Tutorial
            </h2>
          </div>
          <button
            onClick={onSkip}
            className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentTutorial.title}
          </h3>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentTutorial.content}
          </p>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-6 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : darkMode 
                        ? 'bg-white/20' 
                        : 'bg-gray-300'
                }`}
                aria-label={`Step ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200/20">
          <button
            onClick={onSkip}
            className={`px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePracticeSelection;

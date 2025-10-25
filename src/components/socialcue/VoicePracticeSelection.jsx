import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  ArrowLeft, 
  Clock, 
  Star, 
  Filter, 
  Play, 
  Volume2,
  Users,
  MessageCircle,
  Ear,
  Zap,
  Sparkles
} from 'lucide-react';

const VoicePracticeSelection = ({ onNavigate, darkMode, userData }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [voiceScenarios, setVoiceScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', title: 'All Scenarios', icon: Sparkles },
    { id: 'conversation', title: 'Conversation Skills', icon: MessageCircle, color: '#4A90E2' },
    { id: 'listening', title: 'Active Listening', icon: Ear, color: '#34D399' },
    { id: 'body-language', title: 'Body Language', icon: Users, color: '#8B5CF6' },
    { id: 'confidence', title: 'Confidence Building', icon: Zap, color: '#14B8A6' }
  ];

  // Mock voice scenarios data - in production, this would come from an API
  const mockScenarios = [
    {
      id: 'voice-conversation-1',
      title: 'Making New Friends',
      description: 'Practice introducing yourself and starting conversations with new people',
      category: 'conversation',
      duration: '5-8 minutes',
      difficulty: 'beginner',
      estimatedExchanges: 6,
      gradeLevel: '6-8',
      tags: ['introduction', 'small talk', 'first impressions'],
      preview: 'Hi there! I\'m excited to help you practice making new friends. We\'ll work on introducing yourself and starting conversations...'
    },
    {
      id: 'voice-conversation-2',
      title: 'Handling Awkward Moments',
      description: 'Learn to navigate uncomfortable social situations with confidence',
      category: 'conversation',
      duration: '7-10 minutes',
      difficulty: 'intermediate',
      estimatedExchanges: 8,
      gradeLevel: '6-8',
      tags: ['awkward situations', 'recovery', 'confidence'],
      preview: 'Sometimes conversations don\'t go as planned. Let\'s practice how to handle those awkward moments gracefully...'
    },
    {
      id: 'voice-listening-1',
      title: 'Active Listening Practice',
      description: 'Master the art of truly hearing and responding to others',
      category: 'listening',
      duration: '6-9 minutes',
      difficulty: 'beginner',
      estimatedExchanges: 7,
      gradeLevel: '6-8',
      tags: ['listening', 'empathy', 'understanding'],
      preview: 'Great listeners make great friends! Let\'s practice how to really hear what others are saying...'
    },
    {
      id: 'voice-body-language-1',
      title: 'Confident Body Language',
      description: 'Learn to project confidence through your posture and gestures',
      category: 'body-language',
      duration: '5-7 minutes',
      difficulty: 'beginner',
      estimatedExchanges: 5,
      gradeLevel: '6-8',
      tags: ['posture', 'confidence', 'non-verbal'],
      preview: 'Your body speaks before you do! Let\'s practice confident body language that makes a great impression...'
    },
    {
      id: 'voice-confidence-1',
      title: 'Speaking Up in Groups',
      description: 'Build confidence to share your thoughts in group settings',
      category: 'confidence',
      duration: '8-12 minutes',
      difficulty: 'intermediate',
      estimatedExchanges: 10,
      gradeLevel: '6-8',
      tags: ['group dynamics', 'assertiveness', 'confidence'],
      preview: 'Group conversations can feel intimidating. Let\'s practice speaking up and sharing your ideas...'
    },
    {
      id: 'voice-conversation-3',
      title: 'Asking for Help',
      description: 'Practice requesting assistance in a confident and respectful way',
      category: 'conversation',
      duration: '4-6 minutes',
      difficulty: 'beginner',
      estimatedExchanges: 4,
      gradeLevel: '6-8',
      tags: ['help', 'respect', 'communication'],
      preview: 'Asking for help is a sign of strength, not weakness. Let\'s practice how to ask for assistance...'
    }
  ];

  useEffect(() => {
    // Simulate loading scenarios
    const loadScenarios = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVoiceScenarios(mockScenarios);
      setIsLoading(false);
    };

    loadScenarios();
  }, []);

  const filteredScenarios = selectedCategory === 'all' 
    ? voiceScenarios 
    : voiceScenarios.filter(scenario => scenario.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyStars = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      default: return 1;
    }
  };

  const handleStartVoicePractice = (scenario) => {
    // Navigate to voice practice screen with scenario data
    onNavigate('voice-practice', scenario);
  };

  const handleBack = () => {
    onNavigate('practiceHome');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Voice Practice
              </h1>
              <p className="text-gray-400 mt-2">Practice social skills through conversation with AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 rounded-full">
            <Mic className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">NEW</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Filter by Category</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded mb-4"></div>
                <div className="h-8 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario, index) => {
              const categoryInfo = categories.find(cat => cat.id === scenario.category);
              const difficultyStars = getDifficultyStars(scenario.difficulty);
              
              return (
                <div
                  key={scenario.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200 group animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {categoryInfo && (
                        <>
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${categoryInfo.color}30` }}
                          >
                            <categoryInfo.icon className="w-4 h-4" style={{ color: categoryInfo.color }} />
                          </div>
                          <span className="text-sm font-medium text-gray-400">{categoryInfo.title}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Difficulty Stars */}
                    <div className="flex items-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < difficultyStars ? 'text-yellow-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                    {scenario.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Preview */}
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">AI Preview</span>
                    </div>
                    <p className="text-xs text-gray-300 italic">
                      "{scenario.preview}"
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{scenario.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{scenario.estimatedExchanges} exchanges</span>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {scenario.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 text-xs text-gray-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => handleStartVoicePractice(scenario)}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group-hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Voice Practice</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <Mic className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2 text-gray-400">No scenarios found</h3>
            <p className="text-gray-500 mb-6">Try selecting a different category</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-emerald-600 transition-all"
            >
              Show All Scenarios
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>How Voice Practice Works</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-bold mb-2">1. Speak Naturally</h4>
              <p className="text-sm text-gray-400">Tap the microphone and speak as you would in real conversations</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold mb-2">2. AI Responds</h4>
              <p className="text-sm text-gray-400">Our AI coach provides personalized feedback and guidance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-bold mb-2">3. Improve Skills</h4>
              <p className="text-sm text-gray-400">Practice regularly to build confidence and social skills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePracticeSelection;

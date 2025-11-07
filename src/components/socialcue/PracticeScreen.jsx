import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageCircle, Ear, Users, Zap, Mic, Volume2 } from 'lucide-react';
import PracticeSelection from '../PracticeSelection';
import ElevenLabsVoiceOrb from '../ElevenLabsVoiceOrb';
import React from 'react';
import { ArrowRight, MessageCircle, Ear, Users, Zap, Mic, Sparkles } from 'lucide-react';

function PracticeScreen({ onNavigate, darkMode }) {
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [selectedVoiceTopic, setSelectedVoiceTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userGradeLevel, setUserGradeLevel] = useState('6-8');

  const normalizeGradeLevel = (gradeValue) => {
    if (typeof gradeValue === 'string' && gradeValue.includes('-')) {
      return gradeValue;
    }

    const numeric = parseInt(gradeValue, 10);
    if (Number.isNaN(numeric)) {
      return '6-8';
    }

    if (numeric <= 2) return 'k-2';
    if (numeric <= 5) return '3-5';
    if (numeric <= 8) return '6-8';
    return '9-12';
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('socialCueUserData');
      if (stored) {
        const parsed = JSON.parse(stored);
        const rawGrade = parsed?.gradeLevel || parsed?.grade || '6';
        const normalized = normalizeGradeLevel(rawGrade);
        setUserGradeLevel(normalized);
        return;
      }
    } catch (error) {
      console.warn('Unable to read stored user grade level:', error);
    }
    setUserGradeLevel('6-8');
  }, []);

  const categories = [
    { id: 'conversation', title: 'Conversation Skills', description: 'Learn to start and maintain engaging conversations', color: '#4A90E2', icon: <MessageCircle className="w-12 h-12" />, sessions: 3 },
    { id: 'listening', title: 'Active Listening', description: 'Master the art of truly hearing others', color: '#34D399', icon: <Ear className="w-12 h-12" />, sessions: 2 },
    { id: 'body-language', title: 'Body Language', description: 'Read and project confident non-verbal signals', color: '#8B5CF6', icon: <Users className="w-12 h-12" />, sessions: 4 },
    { id: 'confidence', title: 'Confidence Building', description: 'Transform your social presence and self-assurance', color: '#14B8A6', icon: <Zap className="w-12 h-12" />, sessions: 3 }
  ];

  const handleVoiceTopicSelect = (topic) => {
    setSelectedVoiceTopic(topic);
    setShowVoiceSelection(false);
    setShowVoiceChat(true);
  };

  const handleCloseVoiceChat = () => {
    setShowVoiceChat(false);
    setSelectedVoiceTopic(null);
    setShowVoiceSelection(true);
    setSelectedCategory(null);
  };

  const handleCloseVoiceSelection = () => {
    setShowVoiceSelection(false);
    setSelectedCategory(null);
  };

  if (showVoiceChat && selectedVoiceTopic) {
    console.log('🎓 Launching ElevenLabsVoiceOrb with grade:', userGradeLevel);
    return (
      <ElevenLabsVoiceOrb
        scenario={selectedVoiceTopic}
        gradeLevel={userGradeLevel}
        onClose={handleCloseVoiceChat}
      />
    );
  }

  if (showVoiceSelection) {
    return (
      <PracticeSelection
        onTopicSelect={handleVoiceTopicSelect}
        onClose={handleCloseVoiceSelection}
        categoryFilter={selectedCategory}
      />
    );
  }

  return (
    <div className="pb-24">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12 space-y-6">
          <h1 className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Practice</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a category to begin your learning journey</p>

          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 px-8 py-10 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setShowVoiceSelection(true)}
          >
            <div className="absolute -top-24 -right-32 w-96 h-96 bg-white/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl opacity-70" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-center">
              <div className="space-y-4">
                <div className="relative w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center animate-pulse-slow">
                  <Mic className="w-10 h-10 text-white" />
                  <span className="absolute -top-3 -right-3 bg-emerald-400 text-emerald-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                    NEW
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Voice Practice Sessions</h2>
                  <p className="text-white/90 text-sm md:text-base">
                    Practice real conversations with an AI coach. Speak naturally, get personalized feedback,
                    and build confidence through guided dialogue.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    'Real-time feedback',
                    'Age-appropriate voices',
                    'Warm teacher personality',
                    'Practice transcripts',
                  ].map((tag) => (
                    <span key={tag} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wide">
                  Start Voice Practice
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Practice Feature Card */}
        <div className={`backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-2xl animate-slideUp mb-8 ${
          darkMode ? 'bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-gradient-to-r hover:from-blue-500/15 hover:to-emerald-500/15' : 'bg-gradient-to-r from-blue-500/5 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-emerald-500/10 shadow-sm'
        }`}>
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-r from-blue-500/20 to-emerald-500/20">
                <Mic className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">NEW</span>
                </div>
                <div className="text-sm text-emerald-400 font-medium">Voice Practice</div>
              </div>
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🎤 Voice Practice
            </h3>
            <p className={`text-base mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Practice social skills through natural conversation with our AI coach. Speak naturally and get personalized feedback in real-time.
            </p>

            <button 
              onClick={() => onNavigate('voice-practice-selection')} 
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full border-2 border-transparent transition-all flex items-center justify-center gap-2 group-hover:scale-105"
            >
              Try Voice Practice
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div key={category.id} className={`backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-200 group hover:scale-105 hover:shadow-2xl animate-slideUp ${
              darkMode ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
            }`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${category.color}30` }}>
                    <div style={{ color: category.color }}>{category.icon}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: category.color }}>{category.sessions}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</div>
                  </div>
                </div>
                
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.title}</h3>
                <p className={`text-base mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => onNavigate('practice', 1)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      darkMode
                        ? 'bg-white/10 border-white/10 text-white hover:bg-white/15'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Text Practice
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowVoiceSelection(true);
                    }}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: category.color, color: 'white', borderColor: `${category.color}55` }}
                  >
                    <Volume2 className="w-4 h-4" />
                    Voice
                  </button>
                </div>

                <button
                  onClick={() => onNavigate('practice', 1)}
                  className="w-full text-white font-bold py-3 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-emerald-400 group-hover:border-transparent"
                  style={{ borderColor: `${category.color}50`, color: category.color }}
                >
                  Explore Sessions
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PracticeScreen;
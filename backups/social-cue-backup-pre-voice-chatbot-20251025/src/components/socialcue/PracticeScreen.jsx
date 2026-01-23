import React from 'react';
import { ArrowRight, MessageCircle, Ear, Users, Zap } from 'lucide-react';

function PracticeScreen({ onNavigate, darkMode }) {
  const categories = [
    { id: 'conversation', title: 'Conversation Skills', description: 'Learn to start and maintain engaging conversations', color: '#4A90E2', icon: <MessageCircle className="w-12 h-12" />, sessions: 3 },
    { id: 'listening', title: 'Active Listening', description: 'Master the art of truly hearing others', color: '#34D399', icon: <Ear className="w-12 h-12" />, sessions: 2 },
    { id: 'body-language', title: 'Body Language', description: 'Read and project confident non-verbal signals', color: '#8B5CF6', icon: <Users className="w-12 h-12" />, sessions: 4 },
    { id: 'confidence', title: 'Confidence Building', description: 'Transform your social presence and self-assurance', color: '#14B8A6', icon: <Zap className="w-12 h-12" />, sessions: 3 }
  ];

  return (
    <div className="pb-24">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <h1 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Practice</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a category to begin your learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div key={category.id} className={`backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-2xl animate-slideUp ${
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

                <button onClick={() => onNavigate('practice', 1)} className="w-full text-white font-bold py-3 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-emerald-400 group-hover:border-transparent"
                  style={{ borderColor: `${category.color}50`, color: category.color }}>
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
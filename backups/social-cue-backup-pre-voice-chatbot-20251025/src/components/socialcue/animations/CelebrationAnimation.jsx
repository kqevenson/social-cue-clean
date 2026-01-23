import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

const CelebrationAnimation = ({ show, onComplete, darkMode = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Create confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        delay: Math.random() * 1000,
        color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete?.(), 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Confetti particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: '1s',
            transform: `rotate(${particle.rotation}deg)`
          }}
        />
      ))}

      {/* Celebration overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 backdrop-blur-sm" />
      
      {/* Center celebration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="relative mb-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center animate-ping">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎉 Amazing Work! 🎉
          </div>
          
          <div className={`text-xl ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            You're making incredible progress!
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationAnimation;

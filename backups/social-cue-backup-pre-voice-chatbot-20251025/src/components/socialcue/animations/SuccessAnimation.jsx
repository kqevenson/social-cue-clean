import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const SuccessAnimation = ({ points = 10, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Sparkle particles */}
      <div className="relative">
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const distance = 80;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `sparkle-${i} 1.5s ease-out forwards`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          );
        })}
      </div>
      
      {/* +Points popup */}
      <div className="absolute animate-bounce text-4xl font-bold text-emerald-400">
        +{points} Points!
      </div>

      {/* Success checkmark */}
      <div className="absolute -top-16 animate-pulse">
        <CheckCircle className="w-16 h-16 text-emerald-400" />
      </div>

      <style jsx>{`
        @keyframes sparkle-0 { to { transform: translate(-50%, -50%) translate(0, -80px); opacity: 0; } }
        @keyframes sparkle-1 { to { transform: translate(-50%, -50%) translate(60px, -60px); opacity: 0; } }
        @keyframes sparkle-2 { to { transform: translate(-50%, -50%) translate(80px, 0); opacity: 0; } }
        @keyframes sparkle-3 { to { transform: translate(-50%, -50%) translate(60px, 60px); opacity: 0; } }
        @keyframes sparkle-4 { to { transform: translate(-50%, -50%) translate(0, 80px); opacity: 0; } }
        @keyframes sparkle-5 { to { transform: translate(-50%, -50%) translate(-60px, 60px); opacity: 0; } }
        @keyframes sparkle-6 { to { transform: translate(-50%, -50%) translate(-80px, 0); opacity: 0; } }
        @keyframes sparkle-7 { to { transform: translate(-50%, -50%) translate(-60px, -60px); opacity: 0; } }
        @keyframes sparkle-8 { to { transform: translate(-50%, -50%) translate(-40px, -70px); opacity: 0; } }
        @keyframes sparkle-9 { to { transform: translate(-50%, -50%) translate(40px, -70px); opacity: 0; } }
        @keyframes sparkle-10 { to { transform: translate(-50%, -50%) translate(40px, 70px); opacity: 0; } }
        @keyframes sparkle-11 { to { transform: translate(-50%, -50%) translate(-40px, 70px); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;

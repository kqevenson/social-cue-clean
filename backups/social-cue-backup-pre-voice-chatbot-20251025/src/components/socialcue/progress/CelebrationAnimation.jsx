import React, { useEffect, useState } from 'react';

function CelebrationAnimation({ show = false, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // Create confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      }));
      
      setParticles(newParticles);

      // Animate particles
      const interval = setInterval(() => {
        setParticles(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            rotation: particle.rotation + particle.rotationSpeed
          })).filter(particle => particle.y < 110)
        );
      }, 16);

      // Clean up after 3 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setParticles([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [show, onComplete]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
        />
      ))}
    </div>
  );
}

export default CelebrationAnimation;

import React from 'react';

function AnimatedLogo({ darkMode }) {
  // Inline keyframe animations - injected via style tag
  const keyframes = `
    @keyframes animatedLogoBounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes animatedLogoBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      92%, 96% { transform: scaleY(0.1); }
      94% { transform: scaleY(0); }
    }
    @keyframes animatedLogoWinkLeft {
      0%, 94%, 100% { transform: scaleY(1); }
      96% { transform: scaleY(0); }
      98% { transform: scaleY(1); }
    }
    @keyframes animatedLogoWinkRight {
      0%, 94%, 100% { transform: scaleY(1); }
      96% { transform: scaleY(0); }
      98% { transform: scaleY(1); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div className="flex items-end justify-center" style={{letterSpacing: '-2px'}}>
        <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Social</span>
        <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{marginRight: '6px'}}>C</span>
        <div 
          className="flex flex-col items-center justify-end" 
          style={{
            marginBottom: '7px', 
            height: '62px', 
            gap: '10px',
            animation: 'animatedLogoBounce 2.5s ease-in-out infinite'
          }}
        >
          <div 
            className="flex" 
            style={{
              gap: '16px',
              animation: 'animatedLogoBlink 3.5s ease-in-out infinite'
            }}
          >
            <div 
              className="rounded-full" 
              style={{
                width: '7px', 
                height: '7px', 
                background: '#4A90E2',
                transformOrigin: 'center',
                willChange: 'transform',
                animation: 'animatedLogoWinkLeft 7s ease-in-out infinite',
                animationDelay: '2s'
              }}
            ></div>
            <div 
              className="rounded-full" 
              style={{
                width: '7px', 
                height: '7px', 
                background: '#4A90E2',
                transformOrigin: 'center',
                willChange: 'transform',
                animation: 'animatedLogoWinkRight 8s ease-in-out infinite',
                animationDelay: '5s'
              }}
            ></div>
          </div>
          <div 
            style={{
              width: '35px',
              height: '22px',
              borderLeft: '5px solid #34D399',
              borderRight: '5px solid #34D399',
              borderBottom: '5px solid #34D399',
              borderTop: 'none',
              borderRadius: '0 0 17px 17px'
            }}
          ></div>
        </div>
        <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{marginLeft: '6px'}}>e</span>
      </div>
    </>
  );
}

export default AnimatedLogo;


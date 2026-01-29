import React from 'react';

/**
 * Social Cue Smile Face Component
 * Exact dimensions from landing page, with color customization
 * Base: Eyes 10px, gap 24px | Mouth 50px wide, 31px tall, 7px border, radius 25px | Gap 14px
 */
const SmileFace = ({
  scale = 1,
  animated = false,
  blink = false,
  eyeColor = '#4A90E2',
  mouthColor = '#34D399'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14 * scale,
        animation: animated ? 'smileBounce 2s ease-in-out infinite' : 'none'
      }}
    >
      {/* Eyes */}
      <div style={{
        display: 'flex',
        gap: 24 * scale,
        animation: blink ? 'smileBlink 3.5s ease-in-out infinite' : 'none',
        transformOrigin: 'center'
      }}>
        <div
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: eyeColor,
            boxShadow: `0 0 ${10 * scale}px ${eyeColor}80`,
            transition: 'all 0.3s ease'
          }}
        />
        <div
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: eyeColor,
            boxShadow: `0 0 ${10 * scale}px ${eyeColor}80`,
            transition: 'all 0.3s ease'
          }}
        />
      </div>

      {/* Smile */}
      <div
        style={{
          width: 50 * scale,
          height: 31 * scale,
          borderLeft: `${7 * scale}px solid ${mouthColor}`,
          borderRight: `${7 * scale}px solid ${mouthColor}`,
          borderBottom: `${7 * scale}px solid ${mouthColor}`,
          borderTop: 'none',
          borderRadius: `0 0 ${25 * scale}px ${25 * scale}px`,
          boxShadow: `0 0 ${12 * scale}px ${mouthColor}60`,
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
};

export default SmileFace;

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ElevenLabsWidget = ({ agentId, onClose, scenario, gradeLevel }) => {
  useEffect(() => {
    console.log('🎯 Loading Voice Practice');
    console.log('Scenario:', scenario?.title);
    console.log('Grade:', gradeLevel);

    // Load ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);

    // Add CSS to center and size the orb
    const style = document.createElement('style');
    style.innerHTML = `
      elevenlabs-convai {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 600px !important;
        height: 600px !important;
        max-width: 90vw !important;
        max-height: 90vh !important;
        z-index: 10000 !important;
      }
      elevenlabs-convai > * {
        background: transparent !important;
        background-color: transparent !important;
      }
      elevenlabs-convai iframe {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, [agentId]);

  // Format scenario title for display
  const getScenarioTitle = () => {
    if (!scenario) return 'Voice Practice';
    if (typeof scenario.title === 'string') return scenario.title;
    if (scenario.title && typeof scenario.title === 'object') {
      return Object.values(scenario.title)[0] || 'Voice Practice';
    }
    return scenario.category || 'Voice Practice';
  };

  const displayGrade = gradeLevel || '5';
  const scenarioTitle = getScenarioTitle();

  return (
    <div className="fixed inset-0 z-[9998] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-purple-600 flex justify-between items-center z-[9999]">
        <div className="text-white">
          <h2 className="text-xl font-bold">{scenarioTitle}</h2>
          <p className="text-sm opacity-90">Grade {displayGrade} • {scenario?.category || 'Practice'}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* ElevenLabs Widget - Centered */}
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>

      {/* Simple footer instruction */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-lg z-[9999]">
        Click "Start a call" to begin your practice session
      </div>
    </div>
  );
};

export default ElevenLabsWidget;

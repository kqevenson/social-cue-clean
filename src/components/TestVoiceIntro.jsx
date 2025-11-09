import React, { useState } from 'react';
import { getIntroductionSequence } from '../content/training/introduction-scripts';

const TestVoiceIntro = () => {
  const [selectedGrade, setSelectedGrade] = useState('6');
  const [selectedScenario, setSelectedScenario] = useState('starting-conversation');

  const testIntroMessage = () => {
    const introData = getIntroductionSequence(selectedGrade);

    return {
      fullIntro: introData.fullIntro,
      scenarioIntro: introData.scenarios?.[selectedScenario]?.intro || 'Not found',
      afterResponse: introData.scenarios?.[selectedScenario]?.afterResponse || 'Not found'
    };
  };

  const result = testIntroMessage();

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Voice Introduction Tester</h2>

      <div>
        <label>Grade Level: </label>
        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
          <option value="1">K-2</option>
          <option value="4">3-5</option>
          <option value="7">6-8</option>
          <option value="10">9-12</option>
        </select>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label>Scenario: </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
        >
          <option value="starting-conversation">Starting a Conversation</option>
          <option value="making-friends">Making Friends</option>
          <option value="paying-attention">Paying Attention</option>
          <option value="asking-help">Asking for Help</option>
          <option value="joining-group">Joining a Group</option>
        </select>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}
      >
        <h3>AI Would Say:</h3>
        <div style={{ marginBottom: '15px' }}>
          <strong>Full Intro:</strong>
          <p>{result.fullIntro}</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Scenario-Specific Intro:</strong>
          <p>{result.scenarioIntro}</p>
        </div>
        <div>
          <strong>After Student Response:</strong>
          <p>{result.afterResponse}</p>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.scenarioIntro !== 'Not found' ? '#d4edda' : '#f8d7da',
          borderRadius: '5px'
        }}
      >
        {result.scenarioIntro !== 'Not found' ? (
          <span>✅ Scripts are working correctly!</span>
        ) : (
          <span>❌ Scripts not found - check introduction-scripts.js structure</span>
        )}
      </div>
    </div>
  );
};

export default TestVoiceIntro;

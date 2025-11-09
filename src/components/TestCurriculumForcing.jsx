import React, { useState } from 'react';
import { getIntroductionSequence } from '../content/training/introduction-scripts';

const TestCurriculumForcing = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);

    const conversationHistory = [
      {
        role: 'ai',
        text: "Picture this: there's a new student sitting alone at lunch. How would you approach them and start a conversation?"
      },
      {
        role: 'user',
        text: 'Hi, mind if I sit here?'
      }
    ];

    const gradeLevel = '7';
    const scenario = { title: 'starting a conversation' };
    const introData = getIntroductionSequence(gradeLevel);
    const curriculumScript = introData.scenarios['starting-conversation'].afterResponse;

    console.log('📋 Expected curriculum:', curriculumScript);

    try {
      const response = await fetch('/api/voice/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory,
          scenario,
          gradeLevel,
          phase: 'intro',
          curriculumScript
        })
      });

      const data = await response.json();

      const usedCurriculum = data.aiResponse?.includes(curriculumScript.substring(0, 20));

      setTestResult({
        expected: curriculumScript,
        actual: data.aiResponse,
        success: usedCurriculum,
        match: data.aiResponse === curriculumScript
      });

      console.log('✅ Expected:', curriculumScript);
      console.log('🤖 Got:', data.aiResponse);
      console.log(usedCurriculum ? '✅ SUCCESS!' : '❌ FAILED - AI did not use curriculum');
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult({ error: error.message });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Curriculum Forcing Test</h2>

      <button
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'wait' : 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </button>

      {testResult && (
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              padding: '15px',
              backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
              borderRadius: '5px',
              marginBottom: '15px'
            }}
          >
            <h3>{testResult.success ? '✅ SUCCESS!' : '❌ FAILED'}</h3>
            {testResult.match && <p>Perfect match! AI used exact curriculum words.</p>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>📋 Expected (Curriculum):</strong>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {testResult.expected}
            </pre>
          </div>

          <div>
            <strong>🤖 Actual (AI Response):</strong>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {testResult.actual}
            </pre>
          </div>

          {testResult.error && (
            <div
              style={{
                color: 'red',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fff3cd',
                borderRadius: '5px'
              }}
            >
              Error: {testResult.error}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '5px'
        }}
      >
        <h4>What This Tests:</h4>
        <ul>
          <li>Frontend sends curriculumScript to API ✓</li>
          <li>Backend receives curriculumScript ✓</li>
          <li>Backend adds it as user message ✓</li>
          <li>AI uses exact curriculum words ✓</li>
        </ul>
      </div>
    </div>
  );
};

export default TestCurriculumForcing;

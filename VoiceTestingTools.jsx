import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Bug, 
  BarChart3, 
  TestTube, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const VoiceTestingTools = ({ 
  isDevelopment = false, 
  onVoiceTest, 
  onConversationTest,
  onPerformanceTest 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('debug');
  const [debugData, setDebugData] = useState({
    speechRecognition: { status: 'idle', transcript: '', confidence: 0 },
    voiceOutput: { status: 'idle', currentText: '', voiceId: '' },
    apiCalls: [],
    performance: { latency: 0, tokenUsage: 0, memoryUsage: 0 },
    errors: []
  });

  const [testResults, setTestResults] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [testScenarios, setTestScenarios] = useState([]);

  // Test scenarios data
  const scenarios = [
    {
      id: 'happy-path',
      name: 'Happy Path',
      description: 'Smooth conversation flow',
      script: [
        { role: 'user', text: 'Hi, I want to practice small talk' },
        { role: 'ai', text: 'Great! Let\'s start with a simple scenario...' },
        { role: 'user', text: 'Okay, I\'m ready' },
        { role: 'ai', text: 'You\'re at a school event. Someone approaches you...' }
      ]
    },
    {
      id: 'user-confusion',
      name: 'User Confusion',
      description: 'User gets stuck or confused',
      script: [
        { role: 'user', text: 'I don\'t understand' },
        { role: 'ai', text: 'Let me explain that differently...' },
        { role: 'user', text: 'Still confused' },
        { role: 'ai', text: 'Let\'s try a different approach...' }
      ]
    },
    {
      id: 'speech-errors',
      name: 'Speech Recognition Errors',
      description: 'Test speech recognition failures',
      script: [
        { role: 'user', text: 'mumbled speech' },
        { role: 'ai', text: 'I didn\'t catch that. Could you repeat?' },
        { role: 'user', text: 'background noise' },
        { role: 'ai', text: 'I\'m having trouble hearing you...' }
      ]
    },
    {
      id: 'api-failures',
      name: 'API Failures',
      description: 'Test API error handling',
      script: [
        { role: 'user', text: 'Test API failure' },
        { role: 'ai', text: 'Error: API timeout' },
        { role: 'user', text: 'Try again' },
        { role: 'ai', text: 'Error: Rate limit exceeded' }
      ]
    }
  ];

  // Performance monitoring
  const performanceMonitor = useRef({
    startTime: 0,
    endTime: 0,
    apiCalls: 0,
    errors: 0
  });

  // Debug panel toggle
  const toggleDebugPanel = () => {
    setIsVisible(!isVisible);
  };

  // Update debug data
  const updateDebugData = useCallback((section, data) => {
    setDebugData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  // Test microphone
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      updateDebugData('speechRecognition', { status: 'testing' });
      
      // Test speech recognition
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        updateDebugData('speechRecognition', { 
          status: 'active', 
          transcript, 
          confidence 
        });
      };
      
      recognition.onerror = (error) => {
        updateDebugData('speechRecognition', { 
          status: 'error', 
          error: error.error 
        });
      };
      
      recognition.start();
      
      // Stop after 5 seconds
      setTimeout(() => {
        recognition.stop();
        stream.getTracks().forEach(track => track.stop());
        updateDebugData('speechRecognition', { status: 'idle' });
      }, 5000);
      
    } catch (error) {
      updateDebugData('speechRecognition', { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  // Test voice output
  const testVoiceOutput = async (text = 'This is a test of the voice output system.') => {
    try {
      updateDebugData('voiceOutput', { status: 'testing' });
      
      // Test ElevenLabs
      if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/XB0fDUnXU5powFXDhCwa', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onplay = () => {
            updateDebugData('voiceOutput', { 
              status: 'playing', 
              currentText: text,
              voiceId: 'XB0fDUnXU5powFXDhCwa'
            });
          };
          
          audio.onended = () => {
            updateDebugData('voiceOutput', { status: 'idle' });
          };
          
          await audio.play();
        } else {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
      } else {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
          updateDebugData('voiceOutput', { 
            status: 'playing', 
            currentText: text,
            voiceId: 'browser-tts'
          });
        };
        utterance.onend = () => {
          updateDebugData('voiceOutput', { status: 'idle' });
        };
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      updateDebugData('voiceOutput', { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  // Run test scenario
  const runTestScenario = async (scenario) => {
    const startTime = Date.now();
    const results = [];
    
    for (const step of scenario.script) {
      const stepStart = Date.now();
      
      if (step.role === 'user') {
        // Simulate user input
        updateDebugData('speechRecognition', { 
          status: 'active', 
          transcript: step.text 
        });
      } else {
        // Simulate AI response
        updateDebugData('voiceOutput', { 
          status: 'playing', 
          currentText: step.text 
        });
        
        // Simulate API call
        const apiCall = {
          timestamp: new Date().toISOString(),
          endpoint: '/api/voice/conversation',
          method: 'POST',
          status: 'success',
          latency: Math.random() * 1000 + 200
        };
        
        setDebugData(prev => ({
          ...prev,
          apiCalls: [...prev.apiCalls.slice(-9), apiCall]
        }));
      }
      
      const stepEnd = Date.now();
      results.push({
        step: step.role,
        text: step.text,
        latency: stepEnd - stepStart,
        timestamp: new Date().toISOString()
      });
      
      // Wait between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const totalTime = Date.now() - startTime;
    const testResult = {
      scenario: scenario.name,
      duration: totalTime,
      steps: results.length,
      averageLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, testResult]);
    
    // Reset debug data
    updateDebugData('speechRecognition', { status: 'idle' });
    updateDebugData('voiceOutput', { status: 'idle' });
  };

  // Performance test
  const runPerformanceTest = async () => {
    const startTime = Date.now();
    const iterations = 10;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const testStart = Date.now();
      
      try {
        // Test API call
        const response = await fetch('/api/health');
        const testEnd = Date.now();
        
        results.push({
          iteration: i + 1,
          latency: testEnd - testStart,
          success: response.ok
        });
        
      } catch (error) {
        results.push({
          iteration: i + 1,
          latency: 0,
          success: false,
          error: error.message
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = Date.now() - startTime;
    const successRate = results.filter(r => r.success).length / results.length;
    const averageLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
    
    const performanceResult = {
      test: 'Performance Test',
      duration: totalTime,
      iterations,
      successRate,
      averageLatency,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, performanceResult]);
  };

  // Export test results
  const exportTestResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
  };

  // Don't render in production
  if (!isDevelopment) {
    return null;
  }

  return (
    <>
      {/* Debug Panel Toggle Button */}
      <button
        onClick={toggleDebugPanel}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Debug Panel"
      >
        <Bug className="w-6 h-6" />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed top-0 right-0 w-96 h-full bg-gray-900 text-white z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Voice Testing Tools</h2>
              <button
                onClick={toggleDebugPanel}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2">
              {['debug', 'testing', 'analytics', 'feedback'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded text-sm ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {/* Debug Tab */}
            {activeTab === 'debug' && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Speech Recognition</h3>
                  <div className="space-y-2 text-sm">
                    <div>Status: <span className={`px-2 py-1 rounded text-xs ${
                      debugData.speechRecognition.status === 'active' ? 'bg-green-600' :
                      debugData.speechRecognition.status === 'error' ? 'bg-red-600' :
                      'bg-gray-600'
                    }`}>{debugData.speechRecognition.status}</span></div>
                    <div>Transcript: {debugData.speechRecognition.transcript || 'None'}</div>
                    <div>Confidence: {debugData.speechRecognition.confidence}</div>
                    {debugData.speechRecognition.error && (
                      <div className="text-red-400">Error: {debugData.speechRecognition.error}</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Voice Output</h3>
                  <div className="space-y-2 text-sm">
                    <div>Status: <span className={`px-2 py-1 rounded text-xs ${
                      debugData.voiceOutput.status === 'playing' ? 'bg-green-600' :
                      debugData.voiceOutput.status === 'error' ? 'bg-red-600' :
                      'bg-gray-600'
                    }`}>{debugData.voiceOutput.status}</span></div>
                    <div>Current Text: {debugData.voiceOutput.currentText || 'None'}</div>
                    <div>Voice ID: {debugData.voiceOutput.voiceId || 'None'}</div>
                    {debugData.voiceOutput.error && (
                      <div className="text-red-400">Error: {debugData.voiceOutput.error}</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">API Calls</h3>
                  <div className="space-y-1 text-xs">
                    {debugData.apiCalls.slice(-5).map((call, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{call.method} {call.endpoint}</span>
                        <span className={`px-1 rounded ${
                          call.status === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {call.latency}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div>Latency: {debugData.performance.latency}ms</div>
                    <div>Token Usage: {debugData.performance.tokenUsage}</div>
                    <div>Memory: {debugData.performance.memoryUsage}MB</div>
                  </div>
                </div>
              </div>
            )}

            {/* Testing Tab */}
            {activeTab === 'testing' && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Microphone Test</h3>
                  <button
                    onClick={testMicrophone}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    Test Microphone
                  </button>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Voice Output Test</h3>
                  <button
                    onClick={() => testVoiceOutput()}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm mb-2"
                  >
                    Test Voice Output
                  </button>
                  <input
                    type="text"
                    placeholder="Custom test text..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        testVoiceOutput(e.target.value);
                      }
                    }}
                  />
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Test Scenarios</h3>
                  <div className="space-y-2">
                    {scenarios.map(scenario => (
                      <button
                        key={scenario.id}
                        onClick={() => runTestScenario(scenario)}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-left"
                      >
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs text-gray-300">{scenario.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Performance Test</h3>
                  <button
                    onClick={runPerformanceTest}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                  >
                    Run Performance Test
                  </button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Test Results</h3>
                  <div className="space-y-2 text-sm">
                    {testResults.slice(-10).map((result, index) => (
                      <div key={index} className="border-b border-gray-700 pb-2">
                        <div className="font-medium">{result.scenario || result.test}</div>
                        <div className="text-xs text-gray-300">
                          Duration: {result.duration}ms | 
                          {result.averageLatency && ` Avg Latency: ${result.averageLatency.toFixed(0)}ms`}
                          {result.successRate && ` Success Rate: ${(result.successRate * 100).toFixed(1)}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={exportTestResults}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      Export
                    </button>
                    <button
                      onClick={clearTestResults}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Quick Feedback</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Conversation went well
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      Had some issues
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm">
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Major problems
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h3 className="font-bold mb-2">Report Issue</h3>
                  <textarea
                    placeholder="Describe the issue..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm h-20"
                  />
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm mt-2">
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceTestingTools;

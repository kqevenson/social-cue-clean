import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bug, 
  Mic, 
  Volume2, 
  Activity, 
  Settings, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';

const VoiceTestingTools = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [apiCalls, setApiCalls] = useState([]);
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    avgLatency: 0,
    errors: 0,
    conversationLength: 0,
    speechRecognitionAccuracy: 0,
    voiceOutputSuccessRate: 0
  });
  const [performance, setPerformance] = useState({
    avgLatency: 0,
    maxLatency: 0,
    minLatency: Infinity,
    totalCalls: 0
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [testResults, setTestResults] = useState({});
  
  const originalConsoleLog = useRef(null);
  const originalConsoleError = useRef(null);
  const originalConsoleWarn = useRef(null);

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Capture console logs
  useEffect(() => {
    originalConsoleLog.current = console.log;
    originalConsoleError.current = console.error;
    originalConsoleWarn.current = console.warn;

    const addLog = (args, type) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-49), {
        time: new Date().toLocaleTimeString(),
        message,
        type,
        timestamp: Date.now()
      }]);
    };

    console.log = (...args) => {
      originalConsoleLog.current(...args);
      addLog(args, 'log');
    };

    console.error = (...args) => {
      originalConsoleError.current(...args);
      addLog(args, 'error');
      setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
    };

    console.warn = (...args) => {
      originalConsoleWarn.current(...args);
      addLog(args, 'warn');
    };

    return () => {
      console.log = originalConsoleLog.current;
      console.error = originalConsoleError.current;
      console.warn = originalConsoleWarn.current;
    };
  }, []);

  // Track API calls
  const trackAPICall = useCallback((endpoint, duration, success, error = null) => {
    const call = {
      endpoint,
      duration,
      success,
      error,
      timestamp: Date.now()
    };
    
    setApiCalls(prev => [...prev.slice(-19), call]);
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + 1,
      avgLatency: prev.apiCalls === 0 ? duration : (prev.avgLatency * prev.apiCalls + duration) / (prev.apiCalls + 1)
    }));

    // Update performance metrics
    setPerformance(prev => ({
      totalCalls: prev.totalCalls + 1,
      avgLatency: prev.totalCalls === 0 ? duration : (prev.avgLatency * prev.totalCalls + duration) / (prev.totalCalls + 1),
      maxLatency: Math.max(prev.maxLatency, duration),
      minLatency: Math.min(prev.minLatency, duration)
    }));
  }, []);

  // Browser compatibility check
  const checkCompatibility = useCallback(() => {
    return {
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speechSynthesis: 'speechSynthesis' in window,
      microphone: !!(navigator?.mediaDevices?.getUserMedia),
      elevenLabs: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices?.getUserMedia)
    };
  }, []);

  // Test microphone
  const testMicrophone = useCallback(async () => {
    try {
      console.log('🎤 Testing microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      setTestResults(prev => ({ ...prev, microphone: 'success' }));
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      setTestResults(prev => ({ ...prev, microphone: 'failed' }));
    }
  }, []);

  // Test voice output
  const testVoice = useCallback(async (gender) => {
    try {
      console.log(`🔊 Testing ${gender} voice output...`);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Hello! This is a test of the ${gender} voice.`);
        utterance.rate = 0.8;
        utterance.pitch = gender === 'female' ? 1.2 : 0.8;
        
        const startTime = Date.now();
        
        utterance.onend = () => {
          const duration = Date.now() - startTime;
          console.log(`✅ ${gender} voice test completed in ${duration}ms`);
          setTestResults(prev => ({ ...prev, [`voice_${gender}`]: 'success' }));
        };
        
        utterance.onerror = (error) => {
          console.error(`❌ ${gender} voice test failed:`, error);
          setTestResults(prev => ({ ...prev, [`voice_${gender}`]: 'failed' }));
        };
        
        speechSynthesis.speak(utterance);
      } else {
        console.error('❌ Speech synthesis not supported');
        setTestResults(prev => ({ ...prev, [`voice_${gender}`]: 'not_supported' }));
      }
    } catch (error) {
      console.error(`❌ Voice test error:`, error);
      setTestResults(prev => ({ ...prev, [`voice_${gender}`]: 'error' }));
    }
  }, []);

  // Test ElevenLabs API
  const testElevenLabs = useCallback(async () => {
    try {
      console.log('🎵 Testing ElevenLabs API...');
      const startTime = Date.now();
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ElevenLabs API test successful (${duration}ms) - ${data.voices?.length || 0} voices available`);
        trackAPICall('elevenlabs/voices', duration, true);
        setTestResults(prev => ({ ...prev, elevenLabs: 'success' }));
      } else {
        console.error(`❌ ElevenLabs API test failed: ${response.status}`);
        trackAPICall('elevenlabs/voices', duration, false, `HTTP ${response.status}`);
        setTestResults(prev => ({ ...prev, elevenLabs: 'failed' }));
      }
    } catch (error) {
      console.error('❌ ElevenLabs API test error:', error);
      setTestResults(prev => ({ ...prev, elevenLabs: 'error' }));
    }
  }, [trackAPICall]);

  // Simulate conversation
  const simulateConversation = useCallback(async () => {
    setIsSimulating(true);
    console.log('🎭 Starting conversation simulation...');
    
    try {
      // Simulate user speaking
      console.log('🎤 Simulating user speech...');
      await new Promise(r => setTimeout(r, 1000));
      
      // Simulate AI response
      console.log('🤖 Simulating AI response...');
      await new Promise(r => setTimeout(r, 2000));
      
      // Simulate voice output
      console.log('🔊 Simulating voice output...');
      await new Promise(r => setTimeout(r, 1500));
      
      console.log('✅ Conversation simulation complete');
      setTestResults(prev => ({ ...prev, simulation: 'success' }));
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      setTestResults(prev => ({ ...prev, simulation: 'failed' }));
    } finally {
      setIsSimulating(false);
    }
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    setApiCalls([]);
    setMetrics(prev => ({ ...prev, errors: 0 }));
    console.log('🧹 Debug logs cleared');
  }, []);

  // Export debug data
  const exportLogs = useCallback(() => {
    const data = {
      logs,
      metrics,
      apiCalls,
      performance,
      testResults,
      compatibility: checkCompatibility(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      environment: {
        mode: import.meta.env.MODE,
        hasElevenLabs: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
        hasAnthropic: !!import.meta.env.VITE_ANTHROPIC_API_KEY
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📁 Debug data exported');
  }, [logs, metrics, apiCalls, performance, testResults, checkCompatibility]);

  // Reset all data
  const resetAll = useCallback(() => {
    clearLogs();
    setTestResults({});
    setPerformance({
      avgLatency: 0,
      maxLatency: 0,
      minLatency: Infinity,
      totalCalls: 0
    });
    console.log('🔄 All debug data reset');
  }, [clearLogs]);

  const compatibility = checkCompatibility();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
        title="Voice Debug Tools"
      >
        <Bug className="w-5 h-5" />
      </button>
      
      {/* Debug panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-gray-900 text-white rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Voice Debug Tools
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Browser Compatibility */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Browser Compatibility
            </h4>
            <div className="space-y-1 text-sm">
              {Object.entries(compatibility).map(([feature, supported]) => (
                <div key={feature} className="flex justify-between">
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={supported ? 'text-green-400' : 'text-red-400'}>
                    {supported ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">API Calls</div>
                <div className="font-bold">{metrics.apiCalls}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Avg Latency</div>
                <div className="font-bold">{Math.round(metrics.avgLatency)}ms</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Errors</div>
                <div className="font-bold text-red-400">{metrics.errors}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Max Latency</div>
                <div className="font-bold">{performance.maxLatency}ms</div>
              </div>
            </div>
          </div>

          {/* Testing Tools */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Testing Tools
            </h4>
            <div className="space-y-2">
              <button
                onClick={testMicrophone}
                className="w-full px-3 py-2 bg-blue-500 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-600"
              >
                <Mic className="w-4 h-4" />
                Test Microphone
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testVoice('female')}
                  className="px-3 py-2 bg-pink-500 rounded-lg text-sm hover:bg-pink-600"
                >
                  Test Female Voice
                </button>
                <button
                  onClick={() => testVoice('male')}
                  className="px-3 py-2 bg-blue-500 rounded-lg text-sm hover:bg-blue-600"
                >
                  Test Male Voice
                </button>
              </div>
              
              <button
                onClick={testElevenLabs}
                className="w-full px-3 py-2 bg-purple-500 rounded-lg text-sm hover:bg-purple-600"
              >
                Test ElevenLabs API
              </button>
              
              <button
                onClick={simulateConversation}
                disabled={isSimulating}
                className="w-full px-3 py-2 bg-green-500 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin inline mr-2" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Simulate Conversation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent API Calls */}
          {apiCalls.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Recent API Calls
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {apiCalls.slice(-5).map((call, i) => (
                  <div key={i} className="text-xs p-2 bg-gray-800 rounded">
                    <div className="flex justify-between">
                      <span className={call.success ? 'text-green-400' : 'text-red-400'}>
                        {call.endpoint}
                      </span>
                      <span className="text-gray-400">{call.duration}ms</span>
                    </div>
                    {call.error && (
                      <div className="text-red-400 text-xs mt-1">{call.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console Logs */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Console Logs ({logs.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {logs.slice(-5).map((log, i) => (
                <div key={i} className={`text-xs p-2 rounded ${
                  log.type === 'error' ? 'bg-red-900/50 text-red-300' :
                  log.type === 'warn' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-gray-800 text-gray-300'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{log.time}</span>
                    <span className="text-gray-400">{log.type}</span>
                  </div>
                  <div className="mt-1 break-words">{log.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="flex-1 px-3 py-2 bg-red-500 rounded-lg text-sm hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Logs
            </button>
            <button
              onClick={resetAll}
              className="flex-1 px-3 py-2 bg-orange-500 rounded-lg text-sm hover:bg-orange-600 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
            <button
              onClick={exportLogs}
              className="flex-1 px-3 py-2 bg-green-500 rounded-lg text-sm hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Test Results</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="flex justify-between">
                    <span className="capitalize">{test.replace(/_/g, ' ')}</span>
                    <span className={
                      result === 'success' ? 'text-green-400' :
                      result === 'failed' ? 'text-red-400' :
                      result === 'not_supported' ? 'text-yellow-400' :
                      'text-gray-400'
                    }>
                      {result === 'success' ? '✓' :
                       result === 'failed' ? '✗' :
                       result === 'not_supported' ? '⚠' :
                       '?'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceTestingTools;

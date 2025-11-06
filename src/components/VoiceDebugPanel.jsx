import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  AlertTriangle,
  Activity,
  Clock,
  Wifi,
  WifiOff,
  Mic,
  Volume2,
  Zap,
  RefreshCw
} from 'lucide-react';

/**
 * Voice Debug Panel Component
 * 
 * Development-only debugging tool for voice practice sessions.
 * Only renders when NODE_ENV === 'development'.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isConnected - Connection status
 * @param {boolean} props.isListening - Whether microphone is listening
 * @param {boolean} props.isSpeaking - Whether AI is speaking
 * @param {Array} props.transcript - Array of transcript messages
 * @param {string|null} props.error - Current error message
 * @param {Function} props.onSimulateDisconnect - Callback to simulate disconnect
 * @param {Function} props.onTestError - Callback to test error handling
 * @param {Function} props.onClearSession - Callback to clear session data
 * @param {boolean} props.mockMode - Whether mock mode is enabled
 * @param {Function} props.setMockMode - Function to toggle mock mode
 */
const VoiceDebugPanel = ({
  isConnected = false,
  isListening = false,
  isSpeaking = false,
  transcript = [],
  error = null,
  onSimulateDisconnect,
  onTestError,
  onClearSession,
  mockMode = false,
  setMockMode
}) => {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('status'); // status, audio, transcript, api, performance, browser
  const [connectionTime, setConnectionTime] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
  const [apiCalls, setApiCalls] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    timeToFirstResponse: null,
    averageLatency: 0,
    errorCount: 0,
    sessionStartTime: Date.now(),
    exchangeCount: 0
  });
  const [micLevel, setMicLevel] = useState(0);
  const [speakerLevel, setSpeakerLevel] = useState(0);
  const transcriptEndRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Track connection time
  useEffect(() => {
    if (isConnected && !connectionTime) {
      setConnectionTime(Date.now());
    } else if (!isConnected) {
      setConnectionTime(null);
    }
  }, [isConnected, connectionTime]);

  // Track response times from transcript
  useEffect(() => {
    if (transcript.length > 0) {
      const lastMessage = transcript[transcript.length - 1];
      if (lastMessage.role === 'ai' && lastMessage.timestamp) {
        const prevUserMessage = transcript
          .slice(0, -1)
          .reverse()
          .find(m => m.role === 'user');
        
        if (prevUserMessage && prevUserMessage.timestamp) {
          const latency = new Date(lastMessage.timestamp) - new Date(prevUserMessage.timestamp);
          setResponseTimes(prev => [...prev, {
            timestamp: lastMessage.timestamp,
            latency,
            messageId: lastMessage.id || transcript.length
          }]);
          
          // Update performance metrics
          setPerformanceMetrics(prev => {
            const responseCount = (prev.responseCount || 0) + 1;
            const newAvg = prev.averageLatency === 0
              ? latency
              : (prev.averageLatency * (responseCount - 1) + latency) / responseCount;
            
            return {
              ...prev,
              averageLatency: newAvg,
              responseCount,
              timeToFirstResponse: prev.timeToFirstResponse || latency,
              exchangeCount: transcript.filter(m => m.role === 'user').length
            };
          });
        }
      }
    }
  }, [transcript]);

  // Track errors
  useEffect(() => {
    if (error) {
      setPerformanceMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    }
  }, [error]);

  // Monitor audio levels
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (isListening && !analyserRef.current) {
      startAudioMonitoring();
    } else if (!isListening && analyserRef.current) {
      stopAudioMonitoring();
    }
    
    return () => {
      stopAudioMonitoring();
    };
  }, [isListening]);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const updateLevels = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setMicLevel(normalizedLevel);
        
        // Simulate speaker level (since we don't have direct access to output)
        if (isSpeakingRef.current) {
          setSpeakerLevel(prev => Math.max(prev, normalizedLevel * 0.7));
        } else {
          setSpeakerLevel(prev => Math.max(0, prev - 0.05));
        }
        
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      
      updateLevels();
    } catch (err) {
      console.error('Error setting up audio monitoring:', err);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setMicLevel(0);
    setSpeakerLevel(0);
  };

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Listen for API call events
  useEffect(() => {
    const handleAPICall = (event) => {
      setApiCalls(prev => [...prev, event.detail]);
    };
    
    window.addEventListener('voice-debug-api-call', handleAPICall);
    
    return () => {
      window.removeEventListener('voice-debug-api-call', handleAPICall);
    };
  }, []);

  // Export transcript
  const exportTranscript = () => {
    const data = {
      transcript,
      responseTimes,
      performanceMetrics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-practice-debug-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Browser compatibility checks
  const browserChecks = {
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia),
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    return `${ms.toFixed(0)}ms`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConnectionDuration = () => {
    if (!connectionTime) return 'N/A';
    const duration = Date.now() - connectionTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl transition-all duration-300 ${
        isExpanded ? 'w-full max-w-[400px] h-[600px]' : 'w-auto h-auto'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-white">Voice Debug Panel</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-700 overflow-x-auto">
            {[
              { id: 'status', label: 'Status' },
              { id: 'audio', label: 'Audio' },
              { id: 'transcript', label: 'Transcript' },
              { id: 'api', label: 'API' },
              { id: 'performance', label: 'Metrics' },
              { id: 'browser', label: 'Browser' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(600px-120px)] p-4">
            {/* Connection Status Tab */}
            {activeTab === 'status' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">Connection Status</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {isConnected ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Disconnected</span>
                      </>
                    )}
                  </div>
                  {connectionTime && (
                    <div className="text-xs text-gray-400">
                      Duration: {getConnectionDuration()}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">States</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400' : 'bg-gray-600'}`} />
                      <span className="text-gray-400">Listening: {isListening ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-purple-400' : 'bg-gray-600'}`} />
                      <span className="text-gray-400">Speaking: {isSpeaking ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-2 bg-red-500/20 border border-red-500/50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-semibold text-red-400">Error</span>
                    </div>
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">Test Controls</h3>
                  <div className="space-y-2">
                    <button
                      onClick={onSimulateDisconnect}
                      className="w-full px-3 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                    >
                      Simulate Disconnect
                    </button>
                    <button
                      onClick={onTestError}
                      className="w-full px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded text-xs hover:bg-red-500/30 transition-colors"
                    >
                      Test Error
                    </button>
                    <button
                      onClick={exportTranscript}
                      className="w-full px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Export Transcript
                    </button>
                    <button
                      onClick={onClearSession}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Session
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={mockMode}
                        onChange={(e) => setMockMode?.(e.target.checked)}
                        className="w-3 h-3"
                      />
                      <span className="text-gray-300">Mock Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Levels Tab */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Microphone Input
                  </h3>
                  <div className="h-8 bg-gray-800 rounded flex items-center px-2">
                    <div
                      className="h-4 bg-green-400 rounded transition-all"
                      style={{ width: `${micLevel * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Level: {(micLevel * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Speaker Output
                  </h3>
                  <div className="h-8 bg-gray-800 rounded flex items-center px-2">
                    <div
                      className="h-4 bg-purple-400 rounded transition-all"
                      style={{ width: `${speakerLevel * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Level: {(speakerLevel * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* Transcript Log Tab */}
            {activeTab === 'transcript' && (
              <div className="space-y-2">
                {transcript.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No messages yet
                  </div>
                ) : (
                  transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border text-xs font-mono ${
                        message.role === 'user'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {message.role === 'user' ? 'USER' : 'AI'}
                        </span>
                        {message.timestamp && (
                          <span className="text-gray-500 text-[10px]">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <div className="break-words">{message.text}</div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            )}

            {/* API Call Log Tab */}
            {activeTab === 'api' && (
              <div className="space-y-2">
                {apiCalls.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No API calls logged yet
                  </div>
                ) : (
                  apiCalls.map((call) => (
                    <div
                      key={call.id}
                      className={`p-2 rounded border text-xs font-mono ${
                        call.status === 'error'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${
                          call.status === 'error' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {call.method} {call.endpoint}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                          {formatTime(call.timestamp)} ({formatDuration(call.latency)})
                        </span>
                      </div>
                      {call.requestData && (
                        <div className="mt-2 p-1 bg-gray-800 rounded text-[10px] text-gray-400 max-h-20 overflow-y-auto">
                          <div className="font-semibold mb-1">Request:</div>
                          <pre>{JSON.stringify(call.requestData, null, 2).substring(0, 200)}</pre>
                        </div>
                      )}
                      {call.responseData && (
                        <div className="mt-2 p-1 bg-gray-800 rounded text-[10px] text-gray-400 max-h-20 overflow-y-auto">
                          <div className="font-semibold mb-1">Response:</div>
                          <pre>{JSON.stringify(call.responseData, null, 2).substring(0, 200)}</pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Response Times Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-2">
                {responseTimes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No responses yet
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-2 bg-gray-800 rounded">
                      <div className="text-xs text-gray-400 mb-1">Average Latency</div>
                      <div className={`text-lg font-bold ${
                        performanceMetrics.averageLatency > 2000 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {formatDuration(performanceMetrics.averageLatency)}
                      </div>
                    </div>
                    {responseTimes.map((rt, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border text-xs font-mono ${
                          rt.latency > 2000
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Response #{rt.messageId}</span>
                          <span className={rt.latency > 2000 ? 'text-red-400' : 'text-green-400'}>
                            {formatDuration(rt.latency)}
                          </span>
                        </div>
                        <div className="text-gray-500 text-[10px] mt-1">
                          {formatTime(rt.timestamp)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Performance Metrics Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="text-xs text-gray-400">Time to First Response</div>
                    <div className="text-sm font-bold text-green-400">
                      {formatDuration(performanceMetrics.timeToFirstResponse)}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="text-xs text-gray-400">Avg Latency</div>
                    <div className="text-sm font-bold text-green-400">
                      {formatDuration(performanceMetrics.averageLatency)}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="text-xs text-gray-400">Error Count</div>
                    <div className={`text-sm font-bold ${
                      performanceMetrics.errorCount > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {performanceMetrics.errorCount}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="text-xs text-gray-400">Exchanges</div>
                    <div className="text-sm font-bold text-blue-400">
                      {performanceMetrics.exchangeCount}
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400 mb-1">Session Duration</div>
                  <div className="text-sm font-bold text-purple-400">
                    {formatDuration(Date.now() - performanceMetrics.sessionStartTime)}
                  </div>
                </div>
              </div>
            )}

            {/* Browser Compatibility Tab */}
            {activeTab === 'browser' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-300 mb-2">Browser Support</h3>
                {Object.entries(browserChecks).map(([feature, supported]) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded"
                  >
                    <span className="text-xs text-gray-300 font-mono">{feature}</span>
                    {supported ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                ))}
                <div className="mt-4 p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400 mb-1">User Agent</div>
                  <div className="text-xs text-gray-300 font-mono break-all">
                    {navigator.userAgent}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceDebugPanel;


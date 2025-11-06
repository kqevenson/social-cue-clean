/**
 * Test Helpers and Utilities
 * 
 * Common utilities for testing voice practice components
 */

// Helper to create mock recognition instance
export function createMockRecognition() {
  const recognition = {
    continuous: false,
    interimResults: false,
    maxAlternatives: 1,
    lang: 'en-US',
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null,
    onspeechstart: null,
    onspeechend: null,
    onsoundstart: null,
    onsoundend: null,
    onnomatch: null,
    onaudiostart: null,
    onaudioend: null,
    isRunning: false,
    start: jest.fn(function() {
      if (this.isRunning) {
        throw new DOMException('Recognition already started', 'InvalidStateError');
      }
      this.isRunning = true;
      setTimeout(() => {
        if (this.onstart) this.onstart();
      }, 0);
    }),
    stop: jest.fn(function() {
      this.isRunning = false;
      setTimeout(() => {
        if (this.onend) this.onend();
      }, 0);
    }),
    abort: jest.fn(function() {
      this.stop();
    }),
    simulateResult: jest.fn(function(transcript, isFinal = true) {
      if (!this.isRunning) return;
      const event = {
        resultIndex: 0,
        results: [{
          isFinal,
          0: { transcript, confidence: 0.9 }
        }]
      };
      setTimeout(() => {
        if (this.onresult) this.onresult(event);
      }, 0);
    }),
    simulateError: jest.fn(function(errorType = 'no-speech') {
      if (!this.isRunning) return;
      const event = { error: errorType };
      setTimeout(() => {
        if (this.onerror) this.onerror(event);
      }, 0);
    })
  };
  return recognition;
}

// Helper to create mock audio instance
export function createMockAudio() {
  const audio = {
    src: '',
    volume: 1,
    muted: false,
    currentTime: 0,
    duration: 10,
    paused: true,
    ended: false,
    onplay: null,
    onpause: null,
    onended: null,
    onerror: null,
    onloadeddata: null,
    onloadedmetadata: null,
    oncanplay: null,
    error: null,
    play: jest.fn(function() {
      if (this.error) {
        return Promise.reject(new DOMException('NotAllowedError'));
      }
      this.paused = false;
      this.ended = false;
      setTimeout(() => {
        if (this.onloadeddata) this.onloadeddata();
        if (this.onloadedmetadata) this.onloadedmetadata();
        if (this.oncanplay) this.oncanplay();
        if (this.onplay) this.onplay();
      }, 0);
      return Promise.resolve();
    }),
    pause: jest.fn(function() {
      this.paused = true;
      if (this.onpause) this.onpause();
    }),
    load: jest.fn(function() {
      setTimeout(() => {
        if (this.onloadeddata) this.onloadeddata();
      }, 0);
    })
  };
  return audio;
}

// Helper to wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to advance timers and wait
export async function advanceTimersAndWait(ms) {
  jest.advanceTimersByTime(ms);
  await waitForAsync();
}

// Helper to create mock API response
export function createMockApiResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)], { type: 'application/json' })
  };
}

// Helper to mock fetch with response
export function mockFetchWithResponse(responseData, status = 200) {
  global.fetch = jest.fn().mockResolvedValue(createMockApiResponse(responseData, status));
}

// Helper to mock fetch with error
export function mockFetchWithError(error) {
  global.fetch = jest.fn().mockRejectedValue(error);
}

// Helper to create mock session data
export function createMockSessionData(overrides = {}) {
  return {
    sessionId: 'test-session-123',
    userId: 'test-user-123',
    scenario: 'Starting a Conversation',
    gradeLevel: '6',
    difficulty: 'moderate',
    ...overrides
  };
}

// Helper to create mock scenario data
export function createMockScenarioData(overrides = {}) {
  return {
    id: 'voice-starting-conversations',
    title: 'Starting a Conversation',
    description: 'Practice starting conversations',
    category: 'conversation-starters',
    difficulty: 'beginner',
    estimatedDuration: 5,
    ...overrides
  };
}

// Helper to create mock message
export function createMockMessage(role = 'user', text = 'Test message', overrides = {}) {
  return {
    id: `msg_${Date.now()}`,
    role,
    text,
    timestamp: new Date(),
    phase: 'practice',
    audioPlayed: false,
    metadata: {},
    ...overrides
  };
}

// Helper to create mock performance metrics
export function createMockPerformanceMetrics(overrides = {}) {
  return {
    totalTurns: 0,
    successfulExchanges: 0,
    hesitations: 0,
    hintsGiven: 0,
    score: 0,
    startTime: null,
    endTime: null,
    duration: 0,
    responseTimes: [],
    ...overrides
  };
}

// Helper to assert accessibility
export function assertAccessibility(element) {
  expect(element).toHaveAttribute('aria-label');
  expect(element).not.toHaveAttribute('aria-hidden', 'true');
}

// Helper to simulate user interaction
export async function simulateUserInteraction(element, eventType = 'click') {
  fireEvent[eventType](element);
  await waitForAsync();
}

// Helper to flush promises
export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

// Helper to create blob URL
export function createBlobURL(content, type = 'audio/mpeg') {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
}

// Export all helpers
export default {
  createMockRecognition,
  createMockAudio,
  waitForAsync,
  advanceTimersAndWait,
  createMockApiResponse,
  mockFetchWithResponse,
  mockFetchWithError,
  createMockSessionData,
  createMockScenarioData,
  createMockMessage,
  createMockPerformanceMetrics,
  assertAccessibility,
  simulateUserInteraction,
  flushPromises,
  createBlobURL
};


/**
 * Test Setup and Mocks for Voice Practice Components
 * 
 * Provides mocks for Web Speech API, Audio APIs, and localStorage
 */

// Mock Web Speech API
global.SpeechRecognition = class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.lang = 'en-US';
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.onspeechstart = null;
    this.onspeechend = null;
    this.onsoundstart = null;
    this.onsoundend = null;
    this.onnomatch = null;
    this.onaudiostart = null;
    this.onaudioend = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      throw new DOMException('Recognition already started', 'InvalidStateError');
    }
    this.isRunning = true;
    setTimeout(() => {
      if (this.onstart) this.onstart();
    }, 0);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    setTimeout(() => {
      if (this.onend) this.onend();
    }, 0);
  }

  abort() {
    this.stop();
  }

  // Helper to simulate recognition result
  simulateResult(transcript, isFinal = true) {
    if (!this.isRunning) return;
    
    const event = {
      resultIndex: 0,
      results: [{
        isFinal,
        0: {
          transcript,
          confidence: 0.9
        }
      }]
    };
    
    setTimeout(() => {
      if (this.onresult) this.onresult(event);
    }, 0);
  }

  // Helper to simulate error
  simulateError(errorType = 'no-speech') {
    if (!this.isRunning) return;
    
    const event = { error: errorType };
    
    setTimeout(() => {
      if (this.onerror) this.onerror(event);
    }, 0);
  }
};

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock Speech Synthesis API
global.speechSynthesis = {
  speaking: false,
  pending: false,
  paused: false,
  voices: [
    { name: 'Google US English', lang: 'en-US', default: true },
    { name: 'Google UK English', lang: 'en-GB' }
  ],
  
  speak(utterance) {
    this.speaking = true;
    this.pending = false;
    setTimeout(() => {
      if (utterance.onstart) utterance.onstart();
      setTimeout(() => {
        if (utterance.onend) utterance.onend();
        this.speaking = false;
      }, 100);
    }, 0);
  },
  
  cancel() {
    this.speaking = false;
    this.pending = false;
  },
  
  pause() {
    this.paused = true;
  },
  
  resume() {
    this.paused = false;
  },
  
  getVoices() {
    return this.voices;
  }
};

global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.lang = 'en-US';
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
  }
};

// Mock Audio API
global.Audio = class MockAudio {
  constructor(src) {
    this.src = src;
    this.volume = 1;
    this.muted = false;
    this.currentTime = 0;
    this.duration = 10;
    this.paused = true;
    this.ended = false;
    this.onplay = null;
    this.onpause = null;
    this.onended = null;
    this.onerror = null;
    this.onloadeddata = null;
    this.onloadedmetadata = null;
    this.oncanplay = null;
    this.error = null;
  }

  play() {
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
  }

  pause() {
    this.paused = true;
    if (this.onpause) this.onpause();
  }

  load() {
    setTimeout(() => {
      if (this.onloadeddata) this.onloadeddata();
    }, 0);
  }
};

// Mock URL.createObjectURL
global.URL = {
  ...global.URL,
  createObjectURL: jest.fn((blob) => {
    return `blob:${Math.random().toString(36).substr(2, 9)}`;
  }),
  revokeObjectURL: jest.fn()
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
process.env.VITE_ELEVENLABS_API_KEY = 'test-api-key';
process.env.VITE_USE_ELEVENLABS = 'true';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  global.fetch.mockClear();
  global.URL.createObjectURL.mockClear();
  global.URL.revokeObjectURL.mockClear();
});

// Helper to wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export { localStorageMock };


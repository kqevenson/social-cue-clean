import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VoiceOutput from '../voice/VoiceOutput';
import { waitForAsync, localStorageMock } from '../../__tests__/setup';

// Mock fetch for ElevenLabs API calls
global.fetch = jest.fn();

// Mock the icons
jest.mock('lucide-react', () => ({
  Volume2: () => <div data-testid="volume-icon">Volume2</div>,
  VolumeX: () => <div data-testid="volume-x-icon">VolumeX</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
  RotateCcw: () => <div data-testid="rotate-icon">RotateCcw</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  AlertCircle: () => <div data-testid="alert-icon">AlertCircle</div>
}));

describe('VoiceOutput', () => {
  const defaultProps = {
    text: 'Hello, this is a test message',
    autoPlay: true,
    voiceGender: 'female',
    onComplete: jest.fn(),
    onStart: jest.fn(),
    onError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset Audio mock
    global.Audio = jest.fn().mockImplementation(() => ({
      src: '',
      volume: 1,
      muted: false,
      currentTime: 0,
      duration: 10,
      paused: true,
      ended: false,
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      load: jest.fn(),
      onplay: null,
      onpause: null,
      onended: null,
      onerror: null,
      onloadeddata: null,
      onloadedmetadata: null,
      oncanplay: null,
      error: null
    }));

    // Reset speechSynthesis
    global.speechSynthesis.speaking = false;
    global.speechSynthesis.paused = false;
  });

  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(<VoiceOutput {...defaultProps} />);
      
      expect(screen.getByLabelText(/start speaking/i)).toBeInTheDocument();
      expect(screen.getByText(/ready to speak/i)).toBeInTheDocument();
    });

    test('renders error state when browser not supported', () => {
      // Remove both APIs
      const originalSpeechSynthesis = global.speechSynthesis;
      delete global.speechSynthesis;
      
      // Mock process.env
      const originalEnv = process.env.VITE_ELEVENLABS_API_KEY;
      delete process.env.VITE_ELEVENLABS_API_KEY;

      render(<VoiceOutput {...defaultProps} />);
      
      expect(screen.getByText(/text-to-speech not available/i)).toBeInTheDocument();
      
      // Restore
      global.speechSynthesis = originalSpeechSynthesis;
      process.env.VITE_ELEVENLABS_API_KEY = originalEnv;
    });
  });

  describe('Auto-play', () => {
    test('speaks text on mount when autoPlay is true', async () => {
      const mockAudio = {
        src: '',
        volume: 1,
        paused: true,
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        onplay: null,
        onended: null,
        onloadeddata: null,
        onloadedmetadata: null,
        oncanplay: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} autoPlay={true} />);

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });
    });

    test('does not auto-play when autoPlay is false', () => {
      render(<VoiceOutput {...defaultProps} autoPlay={false} />);
      
      expect(screen.getByLabelText(/start speaking/i)).toBeInTheDocument();
      // Should not have started playing
      expect(global.speechSynthesis.speaking).toBe(false);
    });
  });

  describe('Playback Control', () => {
    test('pauses correctly', async () => {
      const mockAudio = {
        src: '',
        paused: false,
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        onplay: null,
        onpause: null,
        onended: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.speechSynthesis.speaking = true;

      render(<VoiceOutput {...defaultProps} />);
      
      // Start playing
      const playButton = screen.getByLabelText(/start speaking/i);
      fireEvent.click(playButton);

      await waitForAsync();

      // Pause
      const pauseButton = screen.getByLabelText(/pause speaking/i);
      fireEvent.click(pauseButton);

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    test('resumes correctly', async () => {
      const mockAudio = {
        src: '',
        paused: true,
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        onplay: null,
        onended: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.speechSynthesis.paused = true;

      render(<VoiceOutput {...defaultProps} />);
      
      const resumeButton = screen.getByLabelText(/resume speaking/i);
      fireEvent.click(resumeButton);

      await waitFor(() => {
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });

    test('stops on unmount', () => {
      const mockAudio = {
        src: '',
        pause: jest.fn(),
        currentTime: 0,
        onplay: null,
        onended: null
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);

      const { unmount } = render(<VoiceOutput {...defaultProps} />);
      
      unmount();

      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    test('calls onStart when audio starts', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.resolve()),
        onplay: null,
        onloadeddata: null,
        onloadedmetadata: null,
        oncanplay: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} onStart={defaultProps.onStart} />);
      
      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });

      act(() => {
        if (mockAudio.onplay) mockAudio.onplay();
      });

      await waitFor(() => {
        expect(defaultProps.onStart).toHaveBeenCalled();
      });
    });

    test('calls onComplete when audio ends', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.resolve()),
        onended: null,
        onloadeddata: null,
        onloadedmetadata: null,
        oncanplay: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} onComplete={defaultProps.onComplete} />);
      
      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });

      act(() => {
        if (mockAudio.onended) mockAudio.onended();
      });

      await waitFor(() => {
        expect(defaultProps.onComplete).toHaveBeenCalled();
      });
    });

    test('calls onError when error occurs', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.reject(new Error('Playback failed'))),
        onerror: null,
        error: { code: 4, message: 'MEDIA_ELEMENT_ERROR' }
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} onError={defaultProps.onError} />);
      
      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });

      act(() => {
        if (mockAudio.onerror) mockAudio.onerror();
      });

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });
  });

  describe('Browser Support', () => {
    test('handles browser not supported gracefully', () => {
      const originalSpeechSynthesis = global.speechSynthesis;
      delete global.speechSynthesis;
      
      const originalEnv = process.env.VITE_ELEVENLABS_API_KEY;
      delete process.env.VITE_ELEVENLABS_API_KEY;

      render(<VoiceOutput {...defaultProps} />);
      
      expect(screen.getByText(/text-to-speech not available/i)).toBeInTheDocument();
      
      global.speechSynthesis = originalSpeechSynthesis;
      process.env.VITE_ELEVENLABS_API_KEY = originalEnv;
    });
  });

  describe('Queue Management', () => {
    test('plays next in queue when current completes', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.resolve()),
        onended: null,
        onloadeddata: null,
        onloadedmetadata: null,
        oncanplay: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} />);
      
      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });

      // Simulate first audio ending
      act(() => {
        if (mockAudio.onended) mockAudio.onended();
      });

      await waitForAsync();
    });
  });

  describe('Volume and Rate', () => {
    test('applies volume changes', async () => {
      const mockAudio = {
        src: '',
        volume: 1,
        play: jest.fn(() => Promise.resolve()),
        onloadeddata: null,
        onloadedmetadata: null,
        oncanplay: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} />);
      
      // Open settings
      const settingsButton = screen.getByLabelText(/voice settings/i);
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/volume/i)).toBeInTheDocument();
      });

      const volumeSlider = screen.getByLabelText(/volume/i).nextSibling;
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });

      await waitFor(() => {
        expect(mockAudio.volume).toBe(0.5);
      });
    });
  });

  describe('Web Speech Fallback', () => {
    test('falls back to Web Speech API when ElevenLabs fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const speakSpy = jest.spyOn(global.speechSynthesis, 'speak');

      render(<VoiceOutput {...defaultProps} />);
      
      await waitFor(() => {
        expect(speakSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Support', () => {
    test('spacebar toggles play/pause', async () => {
      const mockAudio = {
        src: '',
        paused: false,
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        onplay: null,
        onpause: null,
        onended: null,
        duration: 10
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.speechSynthesis.speaking = true;

      render(<VoiceOutput {...defaultProps} />);
      
      fireEvent.keyDown(document, { code: 'Space', target: document.body });

      await waitFor(() => {
        expect(mockAudio.pause).toHaveBeenCalled();
      });
    });

    test('escape stops playback', async () => {
      const mockAudio = {
        src: '',
        paused: false,
        pause: jest.fn(),
        currentTime: 5,
        onplay: null,
        onended: null
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.speechSynthesis.speaking = true;

      render(<VoiceOutput {...defaultProps} />);
      
      fireEvent.keyDown(document, { code: 'Escape', target: document.body });

      await waitFor(() => {
        expect(mockAudio.pause).toHaveBeenCalled();
        expect(mockAudio.currentTime).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles autoplay blocked', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.reject(new DOMException('NotAllowedError'))),
        onerror: null
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/audio blocked/i)).toBeInTheDocument();
      });
    });

    test('shows manual play button when autoplay blocked', async () => {
      const mockAudio = {
        src: '',
        play: jest.fn(() => Promise.reject(new DOMException('NotAllowedError'))),
        onerror: null
      };

      global.Audio = jest.fn().mockImplementation(() => mockAudio);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }))
      });

      render(<VoiceOutput {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/click to enable audio/i)).toBeInTheDocument();
      });
    });
  });
});


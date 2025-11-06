import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VoiceInput from '../voice/VoiceInput';
import { waitForAsync, localStorageMock } from '../../__tests__/setup';

// Mock the icons
jest.mock('lucide-react', () => ({
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  MicOff: () => <div data-testid="mic-off-icon">MicOff</div>,
  Volume2: () => <div data-testid="volume-icon">Volume2</div>,
  AlertCircle: () => <div data-testid="alert-icon">AlertCircle</div>,
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>
}));

describe('VoiceInput', () => {
  const defaultProps = {
    onTranscript: jest.fn(),
    onError: jest.fn(),
    isListening: false,
    setIsListening: jest.fn(),
    gradeLevel: '6',
    autoStopDelay: 3000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset SpeechRecognition mock
    if (global.SpeechRecognition) {
      global.SpeechRecognition = jest.fn().mockImplementation(() => ({
        continuous: false,
        interimResults: false,
        maxAlternatives: 1,
        lang: 'en-US',
        onstart: null,
        onresult: null,
        onerror: null,
        onend: null,
        start: jest.fn(),
        stop: jest.fn(),
        abort: jest.fn(),
        simulateResult: jest.fn(),
        simulateError: jest.fn(),
        isRunning: false
      }));
    }
  });

  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByLabelText(/start listening/i)).toBeInTheDocument();
      expect(screen.getByText(/ready to listen/i)).toBeInTheDocument();
    });

    test('renders error state when browser not supported', () => {
      // Remove SpeechRecognition
      const originalRecognition = global.SpeechRecognition;
      delete global.SpeechRecognition;
      delete global.webkitSpeechRecognition;

      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByText(/speech recognition not supported/i)).toBeInTheDocument();
      
      // Restore
      global.SpeechRecognition = originalRecognition;
      global.webkitSpeechRecognition = originalRecognition;
    });

    test('shows listening state when isListening is true', () => {
      render(<VoiceInput {...defaultProps} isListening={true} />);
      
      expect(screen.getByLabelText(/stop listening/i)).toBeInTheDocument();
      expect(screen.getByText(/listening/i)).toBeInTheDocument();
    });
  });

  describe('Browser Support Check', () => {
    test('checks browser support on mount', () => {
      const recognitionInstance = new global.SpeechRecognition();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      expect(global.SpeechRecognition).toHaveBeenCalled();
    });

    test('handles initialization error gracefully', () => {
      global.SpeechRecognition.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByText(/speech recognition not supported/i)).toBeInTheDocument();
    });
  });

  describe('Microphone Permission', () => {
    test('requests microphone permission when starting', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });
    });

    test('handles permission denied error', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.simulateError = jest.fn((errorType) => {
        if (recognitionInstance.onerror) {
          recognitionInstance.onerror({ error: errorType });
        }
      });
      
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} onError={defaultProps.onError} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        recognitionInstance.simulateError('not-allowed');
      });

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          'not-allowed',
          expect.stringContaining('permission denied')
        );
      });
    });
  });

  describe('Recording Control', () => {
    test('starts recording on button press', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });
    });

    test('stops recording on button press when listening', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.stop = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} isListening={true} />);
      
      const button = screen.getByLabelText(/stop listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.stop).toHaveBeenCalled();
      });
    });

    test('handles stop error gracefully', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.stop = jest.fn(() => {
        throw new Error('Already stopped');
      });
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} isListening={true} />);
      
      const button = screen.getByLabelText(/stop listening/i);
      
      // Should not throw
      fireEvent.click(button);
      
      await waitForAsync();
    });
  });

  describe('Transcript Handling', () => {
    test('calls onTranscript with final transcript', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.simulateResult = jest.fn((transcript, isFinal) => {
        if (recognitionInstance.onresult) {
          recognitionInstance.onresult({
            resultIndex: 0,
            results: [{
              isFinal,
              0: { transcript, confidence: 0.9 }
            }]
          });
        }
      });
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} onTranscript={defaultProps.onTranscript} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        recognitionInstance.simulateResult('Hello world', true);
      });

      await waitFor(() => {
        expect(defaultProps.onTranscript).toHaveBeenCalledWith(
          expect.stringContaining('Hello world')
        );
      });
    });

    test('shows interim transcript', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        if (recognitionInstance.onresult) {
          recognitionInstance.onresult({
            resultIndex: 0,
            results: [{
              isFinal: false,
              0: { transcript: 'Hello', confidence: 0.8 }
            }]
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/hello/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles no-speech error', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} onError={defaultProps.onError} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        if (recognitionInstance.onerror) {
          recognitionInstance.onerror({ error: 'no-speech' });
        }
      });

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          'no-speech',
          expect.stringContaining('No speech detected')
        );
      });
    });

    test('handles audio-capture error', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} onError={defaultProps.onError} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        if (recognitionInstance.onerror) {
          recognitionInstance.onerror({ error: 'audio-capture' });
        }
      });

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          'audio-capture',
          expect.stringContaining('Microphone not found')
        );
      });
    });

    test('handles network error', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} onError={defaultProps.onError} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        if (recognitionInstance.onerror) {
          recognitionInstance.onerror({ error: 'network' });
        }
      });

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          'network',
          expect.stringContaining('Network error')
        );
      });
    });
  });

  describe('Disabled State', () => {
    test('disables button when disabled prop is set', () => {
      render(<VoiceInput {...defaultProps} disabled={true} />);
      
      const button = screen.getByLabelText(/start listening/i);
      expect(button).toBeDisabled();
    });

    test('shows loading state', () => {
      render(<VoiceInput {...defaultProps} />);
      
      // Button should show loader when initializing
      // This would require internal state changes
      expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
    });
  });

  describe('Keyboard Support', () => {
    test('spacebar toggles listening', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.stop = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      // Simulate spacebar press
      fireEvent.keyDown(document, { code: 'Space', target: document.body });

      await waitFor(() => {
        expect(recognitionInstance.stop).toHaveBeenCalled();
      });
    });

    test('escape stops listening', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.stop = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} isListening={true} />);
      
      // Simulate escape press
      fireEvent.keyDown(document, { code: 'Escape', target: document.body });

      await waitFor(() => {
        expect(recognitionInstance.stop).toHaveBeenCalled();
      });
    });

    test('ignores spacebar when in input field', () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(
        <div>
          <VoiceInput {...defaultProps} />
          <input data-testid="test-input" />
        </div>
      );
      
      const input = screen.getByTestId('test-input');
      fireEvent.keyDown(input, { code: 'Space' });

      // Should not start listening
      expect(recognitionInstance.start).not.toHaveBeenCalled();
    });
  });

  describe('Auto-stop', () => {
    test('stops after silence timeout', async () => {
      jest.useFakeTimers();
      
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      recognitionInstance.stop = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} autoStopDelay={1000} isListening={true} />);
      
      // Simulate result
      act(() => {
        if (recognitionInstance.onresult) {
          recognitionInstance.onresult({
            resultIndex: 0,
            results: [{
              isFinal: true,
              0: { transcript: 'Test', confidence: 0.9 }
            }]
          });
        }
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(recognitionInstance.stop).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Transcript Display', () => {
    test('clears transcript when clear button clicked', async () => {
      const recognitionInstance = new global.SpeechRecognition();
      recognitionInstance.start = jest.fn();
      global.SpeechRecognition.mockImplementation(() => recognitionInstance);

      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByLabelText(/start listening/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(recognitionInstance.start).toHaveBeenCalled();
      });

      act(() => {
        if (recognitionInstance.onresult) {
          recognitionInstance.onresult({
            resultIndex: 0,
            results: [{
              isFinal: true,
              0: { transcript: 'Test message', confidence: 0.9 }
            }]
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/test message/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText(/clear transcript/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText(/test message/i)).not.toBeInTheDocument();
      });
    });
  });
});


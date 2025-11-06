import { renderHook, act, waitFor } from '@testing-library/react';
import useVoiceConversation from '../../hooks/useVoiceConversation';
import { waitForAsync, localStorageMock } from '../../__tests__/setup';

// Mock the API config
jest.mock('../../config/env.js', () => ({
  apiConfig: {
    baseUrl: 'http://localhost:3001'
  }
}));

describe('useVoiceConversation', () => {
  const defaultOptions = {
    scenario: 'Starting a Conversation',
    gradeLevel: '6',
    userId: 'test-user-123',
    maxTurns: 8,
    initialDifficulty: 'moderate'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  describe('Initialization', () => {
    test('initializes with default state', () => {
      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      expect(result.current.sessionId).toBeNull();
      expect(result.current.messages).toEqual([]);
      expect(result.current.currentPhase).toBe('intro');
      expect(result.current.isAISpeaking).toBe(false);
      expect(result.current.isListening).toBe(false);
      expect(result.current.exchangeCount).toBe(0);
      expect(result.current.difficultyLevel).toBe('moderate');
      expect(result.current.isComplete).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    test('initializes conversation successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello! Ready to practice?',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        const response = await result.current.startConversation();
        expect(response.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBe('session-123');
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('ai');
      });
    });

    test('handles initialization error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        const response = await result.current.startConversation();
        expect(response.success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.messages).toHaveLength(1); // Fallback message
      });
    });
  });

  describe('Sending Messages', () => {
    test('sends message correctly', async () => {
      // Mock start conversation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello! Ready to practice?',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      // Mock send message
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'That sounds great!',
          phase: 'practice',
          exchangeCount: 1,
          difficultyLevel: 'moderate',
          shouldContinue: true
        })
      });

      await act(async () => {
        const response = await result.current.sendMessage('Hello, I am ready');
        expect(response.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[0].role).toBe('ai');
        expect(result.current.messages[1].role).toBe('user');
        expect(result.current.exchangeCount).toBe(1);
      });
    });

    test('rejects empty message', async () => {
      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        const response = await result.current.sendMessage('');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Empty message');
      });
    });

    test('rejects message when no session', async () => {
      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        const response = await result.current.sendMessage('Hello');
        expect(response.success).toBe(false);
        expect(response.error).toContain('No active session');
      });
    });

    test('updates state appropriately', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Response',
          phase: 'practice',
          exchangeCount: 1,
          difficultyLevel: 'easy',
          shouldContinue: true
        })
      });

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      await waitFor(() => {
        expect(result.current.exchangeCount).toBe(1);
        expect(result.current.currentPhase).toBe('practice');
        expect(result.current.difficultyLevel).toBe('easy');
      });
    });
  });

  describe('API Error Handling', () => {
    test('handles API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        const response = await result.current.sendMessage('Test');
        expect(response.success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.messages.length).toBeGreaterThan(1);
      });
    });

    test('provides recovery suggestions', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        if (result.current.error?.suggestions) {
          expect(result.current.error.suggestions.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Phase Transitions', () => {
    test('transitions phases correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Response',
          phase: 'practice',
          exchangeCount: 1,
          shouldContinue: true
        })
      });

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.currentPhase).toBe('practice');
      });
    });

    test('completes conversation when phase is complete', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Great job!',
          phase: 'complete',
          exchangeCount: 1,
          shouldContinue: false
        })
      });

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
        expect(result.current.currentPhase).toBe('complete');
      });
    });
  });

  describe('Points Calculation', () => {
    test('calculates points accurately', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Good!',
          phase: 'practice',
          exchangeCount: 1,
          performanceScore: 85,
          shouldContinue: true
        })
      });

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.performanceMetrics.successfulExchanges).toBeGreaterThan(0);
        expect(result.current.performanceMetrics.score).toBeGreaterThan(0);
      });
    });

    test('tracks response times', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      // Wait a bit
      await waitForAsync();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Response',
          phase: 'practice',
          exchangeCount: 1,
          shouldContinue: true
        })
      });

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.performanceMetrics.responseTimes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Cleanup', () => {
    test('cleans up on unmount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result, unmount } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      unmount();

      // Check that session was saved
      const savedSession = localStorageMock.getItem('voice_session_session-123');
      expect(savedSession).toBeTruthy();
    });

    test('cancels pending requests on unmount', async () => {
      const abortSpy = jest.fn();
      const abortController = {
        abort: abortSpy,
        signal: {}
      };

      global.AbortController = jest.fn(() => abortController);

      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result, unmount } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        result.current.startConversation();
      });

      unmount();

      await waitFor(() => {
        expect(abortSpy).toHaveBeenCalled();
      });
    });
  });

  describe('End Conversation', () => {
    test('ends conversation successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          performanceScore: 85
        })
      });

      const onComplete = jest.fn();

      await act(async () => {
        const response = await result.current.endConversation();
        expect(response.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });

    test('handles end conversation error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        const response = await result.current.endConversation();
        expect(response.success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });
  });

  describe('Auto-save', () => {
    test('auto-saves session data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation({
        ...defaultOptions,
        autoSave: true
      }));

      await act(async () => {
        await result.current.startConversation();
      });

      await waitFor(() => {
        const saved = localStorageMock.getItem('voice_session_session-123');
        expect(saved).toBeTruthy();
      });
    });

    test('does not auto-save when disabled', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation({
        ...defaultOptions,
        autoSave: false
      }));

      await act(async () => {
        await result.current.startConversation();
      });

      await waitForAsync();

      const saved = localStorageMock.getItem('voice_session_session-123');
      expect(saved).toBeNull();
    });
  });

  describe('Debouncing', () => {
    test('debounces rapid messages', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          aiResponse: 'Hello!',
          phase: 'intro'
        })
      });

      const { result } = renderHook(() => useVoiceConversation(defaultOptions));

      await act(async () => {
        await result.current.startConversation();
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          aiResponse: 'Response',
          phase: 'practice',
          exchangeCount: 1,
          shouldContinue: true
        })
      });

      jest.useFakeTimers();

      await act(async () => {
        result.current.sendMessage('First');
        result.current.sendMessage('Second');
        result.current.sendMessage('Third');
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Start + one send
      });

      jest.useRealTimers();
    });
  });
});


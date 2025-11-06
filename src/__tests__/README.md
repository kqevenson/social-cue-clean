# Voice Practice Testing Guide

This directory contains comprehensive unit tests for voice practice components and utilities.

## Test Files

- `src/components/__tests__/VoiceInput.test.jsx` - Tests for VoiceInput component
- `src/components/__tests__/VoiceOutput.test.jsx` - Tests for VoiceOutput component
- `src/hooks/__tests__/useVoiceConversation.test.js` - Tests for useVoiceConversation hook
- `src/utils/__tests__/difficultyAssessment.test.js` - Tests for difficulty assessment utility

## Setup Files

- `src/__tests__/setup.js` - Test setup and mocks for Web Speech API, Audio APIs, localStorage
- `src/__tests__/helpers.js` - Test helper utilities
- `jest.config.js` - Jest configuration

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run a specific test file
npm test -- VoiceInput.test.jsx

# Run tests matching a pattern
npm test -- --testNamePattern="renders correctly"
```

## Test Coverage

Target coverage: **80%+ line coverage** for all critical paths.

Current coverage includes:
- ✅ Component rendering
- ✅ User interactions
- ✅ API calls and error handling
- ✅ State management
- ✅ Edge cases
- ✅ Accessibility features

## Mock Strategy

### Web Speech API
- Mocked `SpeechRecognition` and `webkitSpeechRecognition`
- Simulated recognition results, errors, and events
- Test helpers for simulating recognition scenarios

### Audio API
- Mocked `Audio` constructor and instances
- Simulated playback events (play, pause, end, error)
- Mocked `URL.createObjectURL` and `revokeObjectURL`

### localStorage
- Mocked localStorage with jest.fn() for all methods
- Automatic cleanup between tests

### API Calls
- Mocked `fetch` with jest.fn()
- Test helpers for creating mock responses
- Error simulation helpers

## Writing New Tests

### Example Test Structure

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { waitForAsync } from '../../__tests__/setup';
import Component from '../Component';

describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', async () => {
    render(<Component />);
    
    // Interact with component
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for async updates
    await waitFor(() => {
      expect(screen.getByText('Expected')).toBeInTheDocument();
    });
  });
});
```

### Using Test Helpers

```javascript
import {
  createMockRecognition,
  createMockAudio,
  mockFetchWithResponse,
  waitForAsync
} from '../../__tests__/helpers';

// Create mock recognition instance
const recognition = createMockRecognition();
global.SpeechRecognition = jest.fn(() => recognition);

// Mock API response
mockFetchWithResponse({ success: true, data: {} });

// Wait for async operations
await waitForAsync();
```

## Common Test Patterns

### Testing Async Operations
```javascript
await act(async () => {
  await someAsyncFunction();
});

await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

### Testing Error Handling
```javascript
mockFetchWithError(new Error('Network error'));

await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

### Testing User Interactions
```javascript
const button = screen.getByRole('button');
fireEvent.click(button);

// Or with keyboard
fireEvent.keyDown(document, { code: 'Space' });
```

### Testing Callbacks
```javascript
const onComplete = jest.fn();
render(<Component onComplete={onComplete} />);

// Trigger completion
fireEvent.click(screen.getByRole('button'));

await waitFor(() => {
  expect(onComplete).toHaveBeenCalledWith(expectedData);
});
```

## Coverage Goals

- **80%+ line coverage** for all files
- **100% coverage** for critical paths (error handling, API calls)
- **All edge cases** covered
- **Accessibility** features tested

## Debugging Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests for a specific file
npm test -- VoiceInput.test.jsx

# Run tests matching a pattern
npm test -- --testNamePattern="renders"

# Debug mode (Node.js debugger)
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

Tests should be run in CI/CD pipeline:
- On every pull request
- Before merging to main
- On scheduled builds

## Test Maintenance

- Keep tests updated when components change
- Add tests for new features
- Refactor tests when code is refactored
- Remove obsolete tests
- Update mocks when APIs change


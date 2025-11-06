# Voice Practice E2E Tests - Documentation

## Overview

Comprehensive end-to-end integration tests for the Voice Practice feature using Playwright. These tests verify complete user flows, error handling, accessibility, and performance.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Chrome, Firefox, or Safari browser (for local testing)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run setup script:**
   ```bash
   chmod +x tests/setup.sh
   ./tests/setup.sh
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install --with-deps chromium
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run specific test suite
```bash
# Complete session flow
npm run test:e2e -- --grep "Complete Session Flow"

# Error recovery
npm run test:e2e -- --grep "Error Recovery"

# Difficulty adaptation
npm run test:e2e -- --grep "Difficulty Adaptation"

# Accessibility
npm run test:e2e -- --grep "Accessibility"

# Performance
npm run test:e2e -- --grep "Performance"
```

### Run tests in specific browser
```bash
# Chrome
npm run test:e2e -- --project=chromium

# Firefox
npm run test:e2e -- --project=firefox

# Safari/WebKit
npm run test:e2e -- --project=webkit

# Mobile Chrome
npm run test:e2e -- --project="Mobile Chrome"

# Mobile Safari
npm run test:e2e -- --project="Mobile Safari"
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e -- --headed
```

### Run tests in debug mode
```bash
npm run test:e2e -- --debug
```

### Run tests with UI mode
```bash
npm run test:e2e -- --ui
```

## Test Structure

### Test Suites

1. **Complete Session Flow (Happy Path)**
   - Full session completion
   - Phase transitions
   - Points and scoring

2. **Error Recovery**
   - API error handling
   - Microphone permission errors
   - Retry mechanisms

3. **Difficulty Adaptation**
   - Difficulty decreases on struggling
   - Difficulty increases on success

4. **Settings Persistence**
   - Voice settings saved
   - Settings restored on reload

5. **Mobile Flow**
   - Responsive design
   - Touch interactions
   - Mobile viewport testing

6. **Grade Level Flows**
   - K-2 grade level
   - 6th grade level
   - 12th grade level

7. **Performance Tests**
   - Load time measurement
   - API response time
   - Memory leak detection

8. **Accessibility Tests**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Color contrast

9. **Visual Regression**
   - Screen snapshots
   - Visual comparison

## Mocking Strategy

### API Mocks
- OpenAI API responses are mocked for consistent testing
- API endpoints are intercepted using Playwright route handling
- Response times can be simulated

### Web Speech API Mocks
- SpeechRecognition API is mocked
- Speech synthesis is mocked
- Transcripts can be simulated via `window.mockTranscript`

### Microphone Mocks
- Microphone permissions are granted via Playwright context
- No actual microphone access required

## Environment Variables

Create a `.env.test` file:

```env
E2E_BASE_URL=http://localhost:5173
E2E_API_URL=http://localhost:3001
NODE_ENV=test
VITE_API_URL=http://localhost:3001
VITE_ELEVENLABS_API_KEY=test_key_123
VITE_USE_ELEVENLABS=false
```

## CI/CD Integration

### GitHub Actions

The `.github/workflows/e2e-tests.yml` file defines CI/CD pipelines:

1. **E2E Tests** - Runs on push/PR to main/develop
2. **Visual Regression** - Screenshot comparison tests
3. **Accessibility Tests** - WCAG compliance checks
4. **Performance Tests** - Load time and performance metrics

### Local CI Simulation

```bash
# Run tests as CI would
CI=true npm run test:e2e
```

## Test Data Attributes

Add these data-testid attributes to your components:

```jsx
// Voice Practice Screen
data-testid="voice-practice-screen"
data-testid="mic-button"
data-testid="listening-indicator"
data-testid="current-phase"
data-testid="exchange-count"
data-testid="difficulty-level"
data-testid="completion-screen"
data-testid="points-earned"
data-testid="performance-score"

// Messages
data-testid="user-message"
data-testid="ai-message"

// Error Handling
data-testid="error-message"
data-testid="retry-button"

// Scenarios
data-testid="scenario-card"

// Settings
data-testid="settings-button"
data-testid="voice-rate-slider"
```

## Debugging Failed Tests

1. **View test report:**
   ```bash
   npx playwright show-report
   ```

2. **View trace:**
   ```bash
   npx playwright show-trace trace.zip
   ```

3. **Debug in browser:**
   ```bash
   npm run test:e2e -- --debug
   ```

4. **Check screenshots:**
   Screenshots are saved in `test-results/` on failure

## Best Practices

1. **Use data-testid attributes** instead of CSS selectors
2. **Wait for elements** before interacting
3. **Use meaningful test names** that describe the scenario
4. **Keep tests independent** - don't rely on test order
5. **Mock external dependencies** for consistent results
6. **Clean up** after tests (localStorage, state, etc.)

## Troubleshooting

### Tests fail with "Browser not found"
```bash
npx playwright install
```

### Tests timeout
- Increase timeout in `playwright.config.js`
- Check if servers are running
- Verify network connectivity

### Permission errors
- Ensure microphone permissions are granted in test context
- Check browser security settings

### Flaky tests
- Increase wait times
- Use `waitForSelector` instead of `sleep`
- Check for race conditions

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add appropriate data-testid attributes
3. Mock external dependencies
4. Include both happy path and error cases
5. Update this documentation

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Visual Regression Testing](https://playwright.dev/docs/test-screenshots)


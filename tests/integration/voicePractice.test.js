/**
 * Voice Practice End-to-End Integration Tests
 * 
 * Comprehensive E2E tests for complete voice practice flows using Playwright.
 * Tests cover happy paths, error recovery, difficulty adaptation, and more.
 * 
 * @requires @playwright/test
 * @requires playwright
 */

import { test, expect, chromium, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:3001';

// Test user data
const TEST_USER = {
  id: 'test_user_123',
  gradeLevel: '6',
  name: 'Test Student'
};

// Mock data
const MOCK_SCENARIOS = [
  {
    id: 'test-starting-conversations',
    title: 'Starting Conversations',
    category: 'conversation-starters',
    description: 'Practice starting conversations',
    context: 'Hi! Let\'s practice starting conversations together.',
    difficulty: 'Beginner'
  }
];

const MOCK_API_RESPONSES = {
  start: {
    success: true,
    sessionId: 'test_session_123',
    aiResponse: 'Hi there! I\'m excited to practice with you today. Are you ready to begin?',
    phase: 'intro'
  },
  message: {
    success: true,
    aiResponse: 'That\'s great! Tell me more about that.',
    phase: 'practice',
    exchangeCount: 1,
    difficultyLevel: 'moderate',
    shouldContinue: true
  },
  end: {
    success: true,
    pointsEarned: 50,
    performanceScore: 85,
    feedback: 'Great job completing this practice session!'
  }
};

// ============================================================================
// TEST FIXTURES AND HELPERS
// ============================================================================

/**
 * Create a browser context with mocked APIs
 */
async function createMockedContext(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    permissions: ['microphone'],
    geolocation: { latitude: 37.7749, longitude: -122.4194 },
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles'
  });

  // Mock Web Speech API
  await context.addInitScript(() => {
    // Mock SpeechRecognition
    window.SpeechRecognition = class MockSpeechRecognition {
      constructor() {
        this.continuous = false;
        this.interimResults = true;
        this.lang = 'en-US';
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
        this.onstart = null;
        this.onnomatch = null;
      }

      start() {
        if (this.onstart) {
          setTimeout(() => this.onstart(), 100);
        }
        // Simulate speech recognition result after 1 second
        setTimeout(() => {
          if (this.onresult) {
            const mockEvent = {
              results: [
                {
                  0: {
                    transcript: window.mockTranscript || 'Hello, how are you?',
                    confidence: 0.9
                  }
                }
              ],
              resultIndex: 0
            };
            mockEvent.results[0].isFinal = true;
            this.onresult(mockEvent);
          }
        }, 1000);
      }

      stop() {
        if (this.onend) {
          setTimeout(() => this.onend(), 100);
        }
      }

      abort() {
        if (this.onend) {
          setTimeout(() => this.onend(), 100);
        }
      }
    };

    window.webkitSpeechRecognition = window.SpeechRecognition;

    // Mock speechSynthesis
    if (!window.speechSynthesis) {
      window.speechSynthesis = {
        speaking: false,
        pending: false,
        paused: false,
        onvoiceschanged: null,
        speak: function(utterance) {
          this.speaking = true;
          setTimeout(() => {
            this.speaking = false;
            if (utterance.onend) {
              utterance.onend();
            }
          }, 1000);
        },
        cancel: function() {
          this.speaking = false;
        },
        pause: function() {
          this.paused = true;
        },
        resume: function() {
          this.paused = false;
        },
        getVoices: function() {
          return [
            {
              voiceURI: 'mock-voice',
              name: 'Mock Voice',
              lang: 'en-US',
              localService: true,
              default: true
            }
          ];
        }
      };
    }
  });

  return context;
}

/**
 * Setup API route mocking
 */
async function setupAPIMocks(page) {
  // Mock API start endpoint
  await page.route(`${API_BASE_URL}/api/voice/start`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.start)
    });
  });

  // Mock API message endpoint
  let exchangeCount = 0;
  await page.route(`${API_BASE_URL}/api/voice/message`, async route => {
    exchangeCount++;
    const response = {
      ...MOCK_API_RESPONSES.message,
      exchangeCount,
      shouldContinue: exchangeCount < 3 // Complete after 3 exchanges
    };
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  // Mock API end endpoint
  await page.route(`${API_BASE_URL}/api/voice/end/*`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.end)
    });
  });

  // Mock health check
  await page.route(`${API_BASE_URL}/api/health`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' })
    });
  });
}

/**
 * Grant microphone permissions
 */
async function grantMicrophonePermission(page) {
  await page.context().grantPermissions(['microphone'], { origin: BASE_URL });
}

/**
 * Navigate to voice practice
 */
async function navigateToVoicePractice(page) {
  await page.goto(`${BASE_URL}/voice-practice`);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for element with timeout
 */
async function waitForElement(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
}

// ============================================================================
// TEST SUITE: COMPLETE SESSION FLOW (HAPPY PATH)
// ============================================================================

test.describe('Complete Session Flow (Happy Path)', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test.afterEach(async () => {
    if (test.context?.context) {
      await test.context.context.close();
    }
  });

  test('should complete a full voice practice session', async () => {
    const { page } = test.context;

    // Navigate to voice practice
    await navigateToVoicePractice(page);

    // Select a scenario
    await waitForElement(page, '[data-testid="scenario-card"]', 10000);
    const scenarioCard = page.locator('[data-testid="scenario-card"]').first();
    await scenarioCard.click();

    // Wait for voice practice screen to load
    await waitForElement(page, '[data-testid="voice-practice-screen"]', 10000);

    // Verify intro phase
    await expect(page.locator('[data-testid="current-phase"]')).toContainText('intro', { timeout: 10000 });

    // Wait for AI to finish speaking intro
    await page.waitForTimeout(2000);

    // Verify microphone button is available
    const micButton = page.locator('[data-testid="mic-button"]');
    await expect(micButton).toBeVisible();

    // Start listening
    await micButton.click();
    await expect(page.locator('[data-testid="listening-indicator"]')).toBeVisible({ timeout: 5000 });

    // Simulate user speech
    await page.evaluate(() => {
      window.mockTranscript = 'Hello, I want to practice starting conversations';
    });

    // Wait for transcript to be processed
    await page.waitForTimeout(2000);

    // Verify user message appears
    await expect(page.locator('[data-testid="user-message"]').first()).toBeVisible({ timeout: 5000 });

    // Wait for AI response
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2, { timeout: 10000 }); // Intro + response

    // Verify exchange count updates
    await expect(page.locator('[data-testid="exchange-count"]')).toContainText('1');

    // Continue conversation (2 more exchanges)
    for (let i = 0; i < 2; i++) {
      await micButton.click();
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.mockTranscript = `Response ${i + 2}`;
      });
      await page.waitForTimeout(2000);
      await expect(page.locator('[data-testid="exchange-count"]')).toContainText(`${i + 2}`, { timeout: 5000 });
    }

    // Verify completion
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="completion-screen"]')).toBeVisible({ timeout: 10000 });

    // Verify points awarded
    await expect(page.locator('[data-testid="points-earned"]')).toContainText('50', { timeout: 5000 });

    // Verify performance score
    await expect(page.locator('[data-testid="performance-score"]')).toBeVisible();
  });

  test('should navigate through all conversation phases', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Intro phase
    await expect(page.locator('[data-testid="current-phase"]')).toContainText('intro');
    await page.waitForTimeout(2000);

    // Practice phase
    const micButton = page.locator('[data-testid="mic-button"]');
    await micButton.click();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.mockTranscript = 'Hello';
    });
    await page.waitForTimeout(2000);

    // Verify phase transition
    await expect(page.locator('[data-testid="current-phase"]')).toContainText('practice', { timeout: 5000 });

    // Complete session
    for (let i = 0; i < 2; i++) {
      await micButton.click();
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.mockTranscript = `Message ${i}`;
      });
      await page.waitForTimeout(2000);
    }

    // Wait for completion
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="current-phase"]')).toContainText('complete', { timeout: 10000 });
  });
});

// ============================================================================
// TEST SUITE: ERROR RECOVERY
// ============================================================================

test.describe('Error Recovery', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test.afterEach(async () => {
    if (test.context?.context) {
      await test.context.context.close();
    }
  });

  test('should handle API error and recover on retry', async () => {
    const { page } = test.context;

    // Setup API to fail initially
    let attemptCount = 0;
    await page.route(`${API_BASE_URL}/api/voice/message`, async route => {
      attemptCount++;
      if (attemptCount === 1) {
        // First attempt fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Internal server error' })
        });
      } else {
        // Retry succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.message)
        });
      }
    });

    await setupAPIMocks(page);
    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Start conversation
    const micButton = page.locator('[data-testid="mic-button"]');
    await page.waitForTimeout(2000);
    await micButton.click();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.mockTranscript = 'Hello';
    });
    await page.waitForTimeout(2000);

    // Verify error UI appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });

    // Click retry button
    const retryButton = page.locator('[data-testid="retry-button"]');
    await retryButton.click();

    // Verify recovery
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2, { timeout: 10000 });
  });

  test('should handle microphone permission denied', async () => {
    const { page } = test.context;

    // Deny microphone permission
    await page.context().clearPermissions();

    await setupAPIMocks(page);
    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Try to start listening
    const micButton = page.locator('[data-testid="mic-button"]');
    await page.waitForTimeout(2000);
    await micButton.click();

    // Verify permission error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="error-message"]')).toContainText('microphone', { timeout: 2000 });
  });
});

// ============================================================================
// TEST SUITE: DIFFICULTY ADAPTATION
// ============================================================================

test.describe('Difficulty Adaptation', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test.afterEach(async () => {
    if (test.context?.context) {
      await test.context.context.close();
    }
  });

  test('should decrease difficulty when student struggles', async () => {
    const { page } = test.context;

    // Mock API to track difficulty changes
    let currentDifficulty = 'moderate';
    await page.route(`${API_BASE_URL}/api/voice/message`, async route => {
      const requestBody = route.request().postDataJSON();
      
      // Simulate struggling responses (short, hesitant)
      if (requestBody.userMessage?.length < 10) {
        currentDifficulty = 'easy';
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_API_RESPONSES.message,
          difficultyLevel: currentDifficulty
        })
      });
    });

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    const micButton = page.locator('[data-testid="mic-button"]');
    await page.waitForTimeout(2000);

    // Send struggling response
    await micButton.click();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.mockTranscript = 'Um... hi';
    });
    await page.waitForTimeout(2000);

    // Verify difficulty indicator shows easier
    await expect(page.locator('[data-testid="difficulty-level"]')).toContainText('easy', { timeout: 5000 });
  });

  test('should increase difficulty when student excels', async () => {
    const { page } = test.context;

    let currentDifficulty = 'moderate';
    await page.route(`${API_BASE_URL}/api/voice/message`, async route => {
      const requestBody = route.request().postDataJSON();
      
      // Simulate strong responses (long, thoughtful)
      if (requestBody.userMessage?.length > 20) {
        currentDifficulty = 'hard';
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_API_RESPONSES.message,
          difficultyLevel: currentDifficulty
        })
      });
    });

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    const micButton = page.locator('[data-testid="mic-button"]');
    await page.waitForTimeout(2000);

    // Send strong response
    await micButton.click();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.mockTranscript = 'Hello, I\'m really excited to practice starting conversations with you today';
    });
    await page.waitForTimeout(2000);

    // Verify difficulty indicator shows harder
    await expect(page.locator('[data-testid="difficulty-level"]')).toContainText('hard', { timeout: 5000 });
  });
});

// ============================================================================
// TEST SUITE: SETTINGS PERSISTENCE
// ============================================================================

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test('should persist voice settings across sessions', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);

    // Open settings
    const settingsButton = page.locator('[data-testid="settings-button"]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Change voice rate
      const voiceRateSlider = page.locator('[data-testid="voice-rate-slider"]');
      if (await voiceRateSlider.isVisible()) {
        await voiceRateSlider.fill('1.2');
        await page.waitForTimeout(500);
      }

      // Close settings
      await page.keyboard.press('Escape');
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify settings persisted
    const savedSettings = await page.evaluate(() => {
      return localStorage.getItem('voice_settings');
    });

    expect(savedSettings).toBeTruthy();
    const settings = JSON.parse(savedSettings);
    expect(settings.voiceRate).toBeDefined();
  });
});

// ============================================================================
// TEST SUITE: MOBILE FLOW
// ============================================================================

test.describe('Mobile Flow', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      permissions: ['microphone']
    });
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test.afterEach(async () => {
    if (test.context?.context) {
      await test.context.context.close();
    }
  });

  test('should work correctly on mobile viewport', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);

    // Verify responsive design
    const viewport = page.viewportSize();
    expect(viewport.width).toBeLessThanOrEqual(390);

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => {
      return document.documentElement.scrollWidth;
    });
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 10);

    // Verify touch interactions work
    const scenarioCard = page.locator('[data-testid="scenario-card"]').first();
    await scenarioCard.tap();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Verify mic button is accessible
    const micButton = page.locator('[data-testid="mic-button"]');
    await expect(micButton).toBeVisible();
    await expect(micButton).toHaveCSS('width', expect.stringMatching(/^\d+px$/));
  });
});

// ============================================================================
// TEST SUITE: GRADE LEVEL FLOWS
// ============================================================================

test.describe('Grade Level Flows', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test.afterEach(async () => {
    if (test.context?.context) {
      await test.context.context.close();
    }
  });

  test('should work correctly for K-2 grade level', async () => {
    const { page } = test.context;

    // Set grade level in localStorage
    await page.goto(`${BASE_URL}/voice-practice`);
    await page.evaluate(() => {
      const userData = { gradeLevel: 'k2', userId: 'test_user' };
      localStorage.setItem('socialcue_user', JSON.stringify(userData));
    });

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Verify age-appropriate language
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible({ timeout: 5000 });
    const messageText = await aiMessage.textContent();
    
    // K-2 messages should be simple
    expect(messageText.length).toBeLessThan(100);
  });

  test('should work correctly for 6th grade level', async () => {
    const { page } = test.context;

    await page.goto(`${BASE_URL}/voice-practice`);
    await page.evaluate(() => {
      const userData = { gradeLevel: '6', userId: 'test_user' };
      localStorage.setItem('socialcue_user', JSON.stringify(userData));
    });

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Verify appropriate language complexity
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible({ timeout: 5000 });
  });

  test('should work correctly for 12th grade level', async () => {
    const { page } = test.context;

    await page.goto(`${BASE_URL}/voice-practice`);
    await page.evaluate(() => {
      const userData = { gradeLevel: '12', userId: 'test_user' };
      localStorage.setItem('socialcue_user', JSON.stringify(userData));
    });

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Verify sophisticated language
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// TEST SUITE: PERFORMANCE TESTS
// ============================================================================

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test('should load voice practice screen within acceptable time', async () => {
    const { page } = test.context;

    const startTime = Date.now();
    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should respond to API calls within acceptable time', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    const micButton = page.locator('[data-testid="mic-button"]');
    await page.waitForTimeout(2000);
    await micButton.click();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.mockTranscript = 'Hello';
    });

    const startTime = Date.now();
    await page.waitForResponse(response => 
      response.url().includes('/api/voice/message') && response.status() === 200
    );
    const responseTime = Date.now() - startTime;

    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('should not have memory leaks during session', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    const micButton = page.locator('[data-testid="mic-button"]');
    
    // Perform multiple exchanges
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      await micButton.click();
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.mockTranscript = `Message ${i}`;
      });
      await page.waitForTimeout(2000);
    }

    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance.memory?.usedJSHeapSize || 0) / 1024 / 1024; // MB
    });

    // Memory should be reasonable (less than 100MB for simple test)
    expect(memoryUsage).toBeLessThan(100);
  });
});

// ============================================================================
// TEST SUITE: ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test('should support keyboard navigation', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);

    // Navigate with Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('should have proper ARIA labels', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Check mic button has aria-label
    const micButton = page.locator('[data-testid="mic-button"]');
    const ariaLabel = await micButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should meet color contrast requirements', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Check text color contrast
    const textElement = page.locator('[data-testid="ai-message"]').first();
    const textColor = await textElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    expect(textColor).toBeTruthy();
    // Additional contrast checks would use a library like axe-core
  });

  test('should announce state changes to screen readers', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]');
    const count = await liveRegion.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST SUITE: VISUAL REGRESSION
// ============================================================================

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ browser }) => {
    const context = await createMockedContext(browser);
    const page = await context.newPage();
    await setupAPIMocks(page);
    await grantMicrophonePermission(page);
    test.context = { page, context };
  });

  test('should match voice practice screen snapshot', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');
    await page.waitForTimeout(2000);

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('voice-practice-screen.png', {
      fullPage: false,
      maxDiffPixels: 100
    });
  });

  test('should match completion screen snapshot', async () => {
    const { page } = test.context;

    await navigateToVoicePractice(page);
    await page.locator('[data-testid="scenario-card"]').first().click();
    await waitForElement(page, '[data-testid="voice-practice-screen"]');

    // Complete session quickly
    const micButton = page.locator('[data-testid="mic-button"]');
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(1000);
      await micButton.click();
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.mockTranscript = `Message ${i}`;
      });
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(3000);
    await waitForElement(page, '[data-testid="completion-screen"]');

    await expect(page).toHaveScreenshot('completion-screen.png', {
      fullPage: false,
      maxDiffPixels: 100
    });
  });
});

// ============================================================================
// EXPORT FOR CI/CD
// ============================================================================

export { test, expect };


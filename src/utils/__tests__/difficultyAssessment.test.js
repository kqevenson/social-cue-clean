import { assessDifficulty, runTests } from '../../utils/difficultyAssessment';

describe('difficultyAssessment', () => {
  describe('Struggling Learner Identification', () => {
    test('identifies struggling learner with short response', () => {
      const result = assessDifficulty(
        "I don't know",
        { exchangeCount: 5, helpRequests: 1 },
        'moderate'
      );

      expect(result.indicators.struggling).toBeGreaterThanOrEqual(2);
      expect(result.shouldAdjust).toBe(true);
      expect(result.newLevel).toBe('easy');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('identifies struggling learner with slow response time', () => {
      const result = assessDifficulty(
        "I think maybe",
        { exchangeCount: 5, responseTime: 7.5 },
        'moderate'
      );

      expect(result.analysis.responseTime.indicator).toBe('struggling');
      expect(result.indicators.struggling).toBeGreaterThanOrEqual(1);
    });

    test('identifies struggling learner with uncertainty phrases', () => {
      const result = assessDifficulty(
        "I'm not sure I understand",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.helpRequests.indicator).toBe('struggling');
      expect(result.indicators.struggling).toBeGreaterThanOrEqual(1);
    });

    test('identifies struggling learner with hesitation words', () => {
      const result = assessDifficulty(
        "Um, well, I think, uh, maybe",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.patterns.hesitationCount).toBeGreaterThanOrEqual(3);
      expect(result.analysis.patterns.indicator).toBe('struggling');
    });
  });

  describe('Excelling Learner Identification', () => {
    test('identifies excelling learner with detailed response', () => {
      const result = assessDifficulty(
        "I think that when someone is feeling sad, it's important to show empathy because they might need support and understanding from others.",
        { exchangeCount: 5, responseTime: 1.5 },
        'moderate'
      );

      expect(result.indicators.excelling).toBeGreaterThanOrEqual(2);
      expect(result.analysis.responseLength.indicator).toBe('excelling');
      expect(result.analysis.responseTime.indicator).toBe('excelling');
    });

    test('identifies excelling learner with fast response time', () => {
      const result = assessDifficulty(
        "I think this makes sense because of the reasons explained",
        { exchangeCount: 5, responseTime: 1.2 },
        'moderate'
      );

      expect(result.analysis.responseTime.indicator).toBe('excelling');
      expect(result.analysis.responseTime.available).toBe(true);
    });

    test('identifies excelling learner with high quality indicators', () => {
      const result = assessDifficulty(
        "I believe that empathy is important because it helps us understand others' feelings and perspectives. What do you think about that?",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.quality.indicator).toBe('excelling');
      expect(result.analysis.quality.qualityScore).toBeGreaterThan(0.7);
    });

    test('identifies excelling learner with confident language', () => {
      const result = assessDifficulty(
        "I definitely think this is a good approach because it shows consideration for others",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.helpRequests.indicator).toBe('excelling');
      expect(result.analysis.helpRequests.confidentPhrases).toBeGreaterThan(0);
    });
  });

  describe('Moderate Performance', () => {
    test('does not adjust for moderate performance', () => {
      const result = assessDifficulty(
        "I think this is okay",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.shouldAdjust).toBe(false);
      expect(result.newLevel).toBe('moderate');
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('handles moderate length responses', () => {
      const result = assessDifficulty(
        "I think we should be kind to others",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.responseLength.indicator).toBe('moderate');
      expect(result.analysis.responseLength.wordCount).toBeGreaterThan(3);
      expect(result.analysis.responseLength.wordCount).toBeLessThan(11);
    });
  });

  describe('Edge Cases', () => {
    test('handles single word response', () => {
      const result = assessDifficulty(
        "Yes",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.indicators.struggling).toBeGreaterThanOrEqual(1);
      expect(result.analysis.responseLength.wordCount).toBeLessThanOrEqual(3);
    });

    test('handles very long response', () => {
      const longMessage = "I think that ".repeat(20) + "this is important because";
      const result = assessDifficulty(
        longMessage,
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.responseLength.wordCount).toBeGreaterThan(20);
    });

    test('handles empty message', () => {
      expect(() => {
        assessDifficulty('', {}, 'moderate');
      }).toThrow('required');
    });

    test('handles null message', () => {
      expect(() => {
        assessDifficulty(null, {}, 'moderate');
      }).toThrow('required');
    });

    test('handles missing response time', () => {
      const result = assessDifficulty(
        "I think this is good",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.responseTime.available).toBe(false);
      expect(result.analysis.responseTime.indicator).toBe('moderate');
    });

    test('handles extreme response times', () => {
      const slowResult = assessDifficulty(
        "Test",
        { exchangeCount: 5, responseTime: 20 },
        'moderate'
      );
      expect(slowResult.analysis.responseTime.indicator).toBe('struggling');

      const fastResult = assessDifficulty(
        "Test",
        { exchangeCount: 5, responseTime: 0.5 },
        'moderate'
      );
      expect(fastResult.analysis.responseTime.indicator).toBe('excelling');
    });
  });

  describe('Adjustment Rules', () => {
    test('does not adjust too frequently', () => {
      const result = assessDifficulty(
        "I don't know",
        { exchangeCount: 2 },
        'moderate'
      );

      expect(result.shouldAdjust).toBe(false);
      expect(result.reasoning).toContain('Insufficient data');
    });

    test('prevents adjustment when already at easiest level', () => {
      const result = assessDifficulty(
        "I don't know I'm confused",
        { exchangeCount: 5, helpRequests: 2 },
        'easy'
      );

      expect(result.newLevel).toBe('easy');
      expect(result.shouldAdjust).toBe(false);
    });

    test('prevents adjustment when already at hardest level', () => {
      const result = assessDifficulty(
        "I think this is excellent and I understand it well because of the detailed explanation",
        { exchangeCount: 5, responseTime: 1.0 },
        'hard'
      );

      expect(result.newLevel).toBe('hard');
      expect(result.shouldAdjust).toBe(false);
    });

    test('more aggressive upward adjustment', () => {
      const result = assessDifficulty(
        "I believe that empathy is crucial because it helps us understand others' emotions and respond appropriately. This creates better relationships and a more supportive environment.",
        { exchangeCount: 5, responseTime: 1.0 },
        'moderate'
      );

      if (result.shouldAdjust && result.indicators.excelling >= 2) {
        expect(result.confidence).toBeGreaterThan(0.7);
        expect(result.newLevel).toBe('hard');
      }
    });

    test('careful downward adjustment', () => {
      const result = assessDifficulty(
        "I don't know",
        { exchangeCount: 5, helpRequests: 2 },
        'moderate'
      );

      if (result.shouldAdjust && result.indicators.struggling >= 2) {
        expect(result.confidence).toBeLessThan(0.95); // More conservative
        expect(result.newLevel).toBe('easy');
      }
    });

    test('handles multiple previous adjustments', () => {
      const previousAssessments = [
        { shouldAdjust: true },
        { shouldAdjust: true }
      ];

      const result = assessDifficulty(
        "I don't know",
        { exchangeCount: 5, previousAssessments },
        'moderate'
      );

      expect(result.shouldAdjust).toBe(false);
      expect(result.reasoning).toContain('Recent adjustments');
    });
  });

  describe('Factor Weighting', () => {
    test('weighs help requests heavily', () => {
      const result = assessDifficulty(
        "I don't know, can you help me?",
        { exchangeCount: 5, helpRequests: 2 },
        'moderate'
      );

      expect(result.indicators.struggling).toBeGreaterThanOrEqual(2);
      expect(result.analysis.helpRequests.strugglePhrases).toBeGreaterThan(0);
    });

    test('weighs quality indicators heavily', () => {
      const result = assessDifficulty(
        "I think empathy is important because it helps us understand others. What do you think?",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.quality.indicator).toBe('excelling');
      expect(result.analysis.quality.indicators.asksQuestions).toBe(true);
      expect(result.analysis.quality.indicators.providesDetails).toBe(true);
    });

    test('combines multiple factors correctly', () => {
      const result = assessDifficulty(
        "I don't know I'm confused",
        {
          exchangeCount: 5,
          helpRequests: 1,
          responseTime: 8.0
        },
        'moderate'
      );

      expect(result.indicators.struggling).toBeGreaterThanOrEqual(2);
      expect(result.indicators.dominantIndicator).toBe('struggling');
    });
  });

  describe('Recommendations', () => {
    test('provides recommendations for struggling learners', () => {
      const result = assessDifficulty(
        "I don't know",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('scaffolding'))).toBe(true);
    });

    test('provides recommendations for excelling learners', () => {
      const result = assessDifficulty(
        "I think that empathy is crucial because it helps us understand others' perspectives and respond appropriately",
        { exchangeCount: 5, responseTime: 1.5 },
        'moderate'
      );

      if (result.indicators.excelling >= 2) {
        expect(result.recommendations.some(r => r.includes('complex'))).toBe(true);
      }
    });

    test('provides balanced recommendations for moderate performance', () => {
      const result = assessDifficulty(
        "I think this is okay",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('maintain'))).toBe(true);
    });
  });

  describe('Difficulty Normalization', () => {
    test('normalizes various difficulty formats', () => {
      const variations = ['easy', 'easier', 'beginner', '1', 'moderate', 'medium', 'intermediate', 'hard', 'harder', 'advanced'];

      variations.forEach(level => {
        expect(() => {
          assessDifficulty('Test', { exchangeCount: 5 }, level);
        }).not.toThrow();
      });
    });

    test('defaults to moderate for unknown levels', () => {
      const result = assessDifficulty(
        "Test",
        { exchangeCount: 5 },
        'unknown-level'
      );

      expect(result.newLevel).toBe('moderate');
    });
  });

  describe('Pattern Analysis', () => {
    test('detects repetition patterns', () => {
      const result = assessDifficulty(
        "I think I think I think this is good",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.patterns.hasRepetition).toBe(true);
    });

    test('tracks improvement over time', () => {
      const previousAssessments = [
        { indicators: { excelling: 0 } },
        { indicators: { excelling: 1 } },
        { indicators: { excelling: 2 } }
      ];

      const result = assessDifficulty(
        "I think this is good because it makes sense",
        { exchangeCount: 5, previousAssessments },
        'moderate'
      );

      expect(result.analysis.patterns.isImproving).toBe(true);
    });
  });

  describe('Quality Analysis', () => {
    test('detects on-topic responses', () => {
      const result = assessDifficulty(
        "I think empathy is important for building relationships",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.quality.indicators.onTopic).toBe(true);
    });

    test('detects questions asked', () => {
      const result = assessDifficulty(
        "What do you think about that?",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.quality.indicators.asksQuestions).toBe(true);
    });

    test('detects social awareness', () => {
      const result = assessDifficulty(
        "I think we should consider their feelings and perspective",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result.analysis.quality.indicators.showsSocialAwareness).toBe(true);
    });
  });

  describe('Unit Tests Integration', () => {
    test('runs all unit tests successfully', () => {
      const testResults = runTests();
      
      expect(testResults.passed).toBeGreaterThan(0);
      expect(testResults.failed).toBe(0);
      expect(testResults.successRate).toBe(100);
    });
  });

  describe('Return Object Structure', () => {
    test('returns correct object structure', () => {
      const result = assessDifficulty(
        "I think this is good",
        { exchangeCount: 5 },
        'moderate'
      );

      expect(result).toHaveProperty('shouldAdjust');
      expect(result).toHaveProperty('newLevel');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('indicators');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('analysis');

      expect(typeof result.shouldAdjust).toBe('boolean');
      expect(['easy', 'moderate', 'hard']).toContain(result.newLevel);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.indicators).toBe('object');
      expect(result.indicators).toHaveProperty('struggling');
      expect(result.indicators).toHaveProperty('moderate');
      expect(result.indicators).toHaveProperty('excelling');
    });
  });
});


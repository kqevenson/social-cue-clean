/**
 * Difficulty Assessment Algorithm
 * 
 * Analyzes learner performance across multiple dimensions to determine
 * if difficulty should be adjusted in adaptive learning scenarios.
 * 
 * @module difficultyAssessment
 */

/**
 * Assess learner difficulty based on message and performance metrics
 * 
 * @param {string} userMessage - The user's message/response
 * @param {Object} performanceMetrics - Performance data
 * @param {Object} performanceMetrics.responseTime - Response time in seconds (optional)
 * @param {Object} performanceMetrics.exchangeCount - Number of exchanges in session
 * @param {Object} performanceMetrics.previousAssessments - Array of previous assessment results
 * @param {Object} performanceMetrics.helpRequests - Number of help requests
 * @param {string} currentDifficulty - Current difficulty level ('easy' | 'moderate' | 'hard')
 * @returns {Object} Assessment result with adjustment recommendations
 * @returns {boolean} returns.shouldAdjust - Whether difficulty should be adjusted
 * @returns {string} returns.newLevel - New difficulty level ('easy' | 'moderate' | 'hard')
 * @returns {number} returns.confidence - Confidence score (0-1)
 * @returns {Object} returns.indicators - Count of struggling/moderate/excelling indicators
 * @returns {string} returns.reasoning - Explanation for the assessment
 * @returns {string[]} returns.recommendations - Array of recommendations
 */
export function assessDifficulty(userMessage, performanceMetrics = {}, currentDifficulty = 'moderate') {
  if (!userMessage || typeof userMessage !== 'string') {
    throw new Error('userMessage is required and must be a string');
  }

  const message = userMessage.trim();
  
  // Normalize current difficulty
  const normalizedDifficulty = normalizeDifficulty(currentDifficulty);
  
  // Analyze different factors
  const responseLengthAnalysis = analyzeResponseLength(message);
  const responseTimeAnalysis = analyzeResponseTime(performanceMetrics.responseTime);
  const helpRequestAnalysis = analyzeHelpRequests(message, performanceMetrics.helpRequests || 0);
  const qualityAnalysis = analyzeQuality(message);
  const patternAnalysis = analyzePatterns(message, performanceMetrics.previousAssessments || []);

  // Calculate indicators
  const indicators = calculateIndicators({
    responseLength: responseLengthAnalysis,
    responseTime: responseTimeAnalysis,
    helpRequests: helpRequestAnalysis,
    quality: qualityAnalysis,
    patterns: patternAnalysis
  });

  // Determine if adjustment is needed
  const adjustmentResult = determineAdjustment(
    indicators,
    normalizedDifficulty,
    performanceMetrics.exchangeCount || 0,
    performanceMetrics.previousAssessments || []
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    indicators,
    adjustmentResult.newLevel,
    normalizedDifficulty
  );

  return {
    shouldAdjust: adjustmentResult.shouldAdjust,
    newLevel: adjustmentResult.newLevel,
    confidence: adjustmentResult.confidence,
    indicators: indicators,
    reasoning: adjustmentResult.reasoning,
    recommendations: recommendations,
    // Additional diagnostic info
    analysis: {
      responseLength: responseLengthAnalysis,
      responseTime: responseTimeAnalysis,
      helpRequests: helpRequestAnalysis,
      quality: qualityAnalysis,
      patterns: patternAnalysis
    }
  };
}

/**
 * Normalize difficulty level to standard format
 */
function normalizeDifficulty(difficulty) {
  if (!difficulty) return 'moderate';
  
  const normalized = String(difficulty).toLowerCase().trim();
  
  const difficultyMap = {
    'easy': 'easy',
    'easier': 'easy',
    'beginner': 'easy',
    '1': 'easy',
    'moderate': 'moderate',
    'medium': 'moderate',
    'intermediate': 'moderate',
    '2': 'moderate',
    '3': 'moderate',
    'hard': 'hard',
    'harder': 'hard',
    'advanced': 'hard',
    'expert': 'hard',
    '4': 'hard',
    '5': 'hard'
  };

  return difficultyMap[normalized] || 'moderate';
}

/**
 * Analyze response length
 */
function analyzeResponseLength(message) {
  const words = message.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const charCount = message.length;

  let indicator = 'moderate';
  let score = 0.5;
  let reasoning = '';

  if (wordCount <= 3) {
    indicator = 'struggling';
    score = 0.2;
    reasoning = 'Very short response (1-3 words) suggests difficulty expressing thoughts';
  } else if (wordCount >= 4 && wordCount <= 10) {
    indicator = 'moderate';
    score = 0.5;
    reasoning = 'Moderate length response (4-10 words) indicates adequate engagement';
  } else if (wordCount >= 11) {
    // Check for detail and quality, not just length
    const hasDetail = checkForDetail(message);
    if (hasDetail) {
      indicator = 'excelling';
      score = 0.9;
      reasoning = 'Detailed response (11+ words with elaboration) shows strong engagement';
    } else {
      indicator = 'moderate';
      score = 0.6;
      reasoning = 'Long response but may lack depth';
    }
  }

  return {
    indicator,
    score,
    wordCount,
    charCount,
    reasoning
  };
}

/**
 * Check if message contains detail indicators
 */
function checkForDetail(message) {
  const detailIndicators = [
    /\bbecause\b/i,
    /\bso\b/i,
    /\bwhen\b/i,
    /\bwhere\b/i,
    /\bwhat\b/i,
    /\bwhy\b/i,
    /\bhow\b/i,
    /\band\b/i,
    /\but\b/i,
    /\bfor\b/i,
    /\bexample\b/i,
    /\bsuch as\b/i,
    /\blike\b/i,
    /\bsuch\b/i
  ];

  return detailIndicators.some(pattern => pattern.test(message));
}

/**
 * Analyze response time
 */
function analyzeResponseTime(responseTime) {
  if (responseTime === null || responseTime === undefined) {
    return {
      indicator: 'moderate',
      score: 0.5,
      reasoning: 'Response time not available',
      available: false
    };
  }

  let indicator = 'moderate';
  let score = 0.5;
  let reasoning = '';

  if (responseTime > 5) {
    indicator = 'struggling';
    score = 0.2;
    reasoning = `Slow response time (${responseTime.toFixed(1)}s) suggests difficulty processing or formulating response`;
  } else if (responseTime >= 2 && responseTime <= 5) {
    indicator = 'moderate';
    score = 0.5;
    reasoning = `Moderate response time (${responseTime.toFixed(1)}s) indicates normal processing`;
  } else if (responseTime < 2) {
    indicator = 'excelling';
    score = 0.8;
    reasoning = `Quick response time (${responseTime.toFixed(1)}s) shows confident understanding`;
  }

  return {
    indicator,
    score,
    responseTime,
    reasoning,
    available: true
  };
}

/**
 * Analyze help requests and uncertainty indicators
 */
function analyzeHelpRequests(message, helpRequestCount) {
  const messageLower = message.toLowerCase();
  
  // Indicators of struggle
  const strugglePhrases = [
    /\bi don'?t know\b/i,
    /\bi'?m not sure\b/i,
    /\bi don'?t understand\b/i,
    /\bi can'?t\b/i,
    /\bhelp\b/i,
    /\bwhat\?/i,
    /\bhuh\?/i,
    /\bi'?m confused\b/i,
    /\bi'?m lost\b/i,
    /\bthis is hard\b/i,
    /\btoo hard\b/i,
    /\btoo difficult\b/i
  ];

  // Indicators of need for examples
  const examplePhrases = [
    /\bcan you give me an example\b/i,
    /\bshow me\b/i,
    /\bfor example\b/i,
    /\blike what\b/i,
    /\bsuch as\b/i,
    /\bhow do you\b/i
  ];

  // Indicators of confidence
  const confidentPhrases = [
    /\bi think\b/i,
    /\bi believe\b/i,
    /\bin my opinion\b/i,
    /\bi would\b/i,
    /\bi could\b/i,
    /\bi might\b/i,
    /\bprobably\b/i,
    /\bdefinitely\b/i
  ];

  const struggleMatches = strugglePhrases.filter(pattern => pattern.test(messageLower)).length;
  const exampleMatches = examplePhrases.filter(pattern => pattern.test(messageLower)).length;
  const confidentMatches = confidentPhrases.filter(pattern => pattern.test(messageLower)).length;

  let indicator = 'moderate';
  let score = 0.5;
  let reasoning = '';

  // Combine help request count with message analysis
  const totalStruggleIndicators = struggleMatches + helpRequestCount;

  if (totalStruggleIndicators >= 2) {
    indicator = 'struggling';
    score = 0.2;
    reasoning = 'Multiple indicators of difficulty (uncertainty phrases or help requests)';
  } else if (exampleMatches > 0) {
    indicator = 'moderate';
    score = 0.4;
    reasoning = 'Requesting examples suggests need for more support';
  } else if (confidentMatches > 0 && totalStruggleIndicators === 0) {
    indicator = 'excelling';
    score = 0.8;
    reasoning = 'Confident language suggests good understanding';
  } else {
    indicator = 'moderate';
    score = 0.5;
    reasoning = 'No clear indicators of struggle or excellence';
  }

  return {
    indicator,
    score,
    strugglePhrases: struggleMatches,
    examplePhrases: exampleMatches,
    confidentPhrases: confidentMatches,
    helpRequestCount,
    reasoning
  };
}

/**
 * Analyze message quality
 */
function analyzeQuality(message) {
  const messageLower = message.toLowerCase();
  
  // Quality indicators
  const qualityIndicators = {
    onTopic: checkOnTopic(message),
    asksQuestions: /[?]/.test(message) && /\b(what|how|why|when|where|who|can|could|would|should)\b/i.test(message),
    providesDetails: checkForDetail(message),
    showsSocialAwareness: checkSocialAwareness(message),
    usesCompleteSentences: /[.!?]\s*[A-Z]/.test(message) || message.split(/[.!?]/).length > 1,
    appropriateLength: message.split(/\s+/).length >= 4
  };

  // Count positive indicators
  const positiveCount = Object.values(qualityIndicators).filter(Boolean).length;
  const totalIndicators = Object.keys(qualityIndicators).length;

  const qualityScore = positiveCount / totalIndicators;

  let indicator = 'moderate';
  let score = 0.5;
  let reasoning = '';

  if (qualityScore >= 0.7) {
    indicator = 'excelling';
    score = 0.9;
    reasoning = `High quality response with ${positiveCount}/${totalIndicators} positive indicators`;
  } else if (qualityScore >= 0.4) {
    indicator = 'moderate';
    score = 0.5;
    reasoning = `Moderate quality response with ${positiveCount}/${totalIndicators} positive indicators`;
  } else {
    indicator = 'struggling';
    score = 0.2;
    reasoning = `Low quality response with only ${positiveCount}/${totalIndicators} positive indicators`;
  }

  return {
    indicator,
    score,
    qualityScore,
    indicators: qualityIndicators,
    reasoning
  };
}

/**
 * Check if message is on-topic
 */
function checkOnTopic(message) {
  // This is a simplified check - in production, this would compare against conversation context
  // For now, we check for very short responses or obvious off-topic words
  const offTopicIndicators = [
    /\brandom\b/i,
    /\bunrelated\b/i,
    /\bwhat\?/i,
    /\bhuh\?/i
  ];

  const wordCount = message.split(/\s+/).length;
  
  // Very short responses (< 3 words) might be off-topic
  if (wordCount < 3 && !/[?]/.test(message)) {
    return false;
  }

  // Check for obvious off-topic indicators
  if (offTopicIndicators.some(pattern => pattern.test(message))) {
    return false;
  }

  return true;
}

/**
 * Check for social awareness indicators
 */
function checkSocialAwareness(message) {
  const socialAwarenessIndicators = [
    /\bfeel\b/i,
    /\bthink\b/i,
    /\bunderstand\b/i,
    /\bempathy\b/i,
    /\bemotion\b/i,
    /\bperspective\b/i,
    /\bpoint of view\b/i,
    /\bopinion\b/i,
    /\brespect\b/i,
    /\bkind\b/i,
    /\bnice\b/i,
    /\bpolite\b/i,
    /\bconsiderate\b/i,
    /\bother\b/i,
    /\btheir\b/i,
    /\bthey\b/i,
    /\bthem\b/i
  ];

  return socialAwarenessIndicators.some(pattern => pattern.test(message));
}

/**
 * Analyze patterns in message
 */
function analyzePatterns(message, previousAssessments) {
  const messageLower = message.toLowerCase();
  
  // Check for hesitation words
  const hesitationWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'well'];
  const hesitationCount = hesitationWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = messageLower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  // Check for repetition
  const words = messageLower.split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / words.length;
  const hasRepetition = repetitionRatio < 0.7 && words.length > 5;

  // Check for improvement over time
  let isImproving = false;
  if (previousAssessments.length >= 3) {
    const recentScores = previousAssessments.slice(-3).map(a => a.indicators?.excelling || 0);
    isImproving = recentScores[recentScores.length - 1] > recentScores[0];
  }

  let indicator = 'moderate';
  let score = 0.5;
  let reasoning = '';

  if (hesitationCount >= 3 || hasRepetition) {
    indicator = 'struggling';
    score = 0.3;
    reasoning = `Pattern indicates difficulty: ${hesitationCount} hesitation words, ${hasRepetition ? 'repetitive' : 'no repetition'}`;
  } else if (hesitationCount === 0 && !hasRepetition && isImproving) {
    indicator = 'excelling';
    score = 0.8;
    reasoning = 'Clear patterns with improvement over time';
  } else {
    indicator = 'moderate';
    score = 0.5;
    reasoning = 'Normal patterns detected';
  }

  return {
    indicator,
    score,
    hesitationCount,
    hasRepetition,
    repetitionRatio,
    isImproving,
    reasoning
  };
}

/**
 * Calculate overall indicators from all analyses
 */
function calculateIndicators(analyses) {
  const indicators = {
    struggling: 0,
    moderate: 0,
    excelling: 0
  };

  // Count indicators from each analysis
  Object.values(analyses).forEach(analysis => {
    if (analysis.indicator) {
      indicators[analysis.indicator]++;
    }
  });

  // Weight different analyses
  const weights = {
    responseLength: 1.5,  // Important
    responseTime: 1.0,
    helpRequests: 2.0,   // Very important
    quality: 2.0,        // Very important
    patterns: 1.0
  };

  // Calculate weighted scores
  let strugglingScore = 0;
  let excellingScore = 0;
  let totalWeight = 0;

  Object.entries(analyses).forEach(([key, analysis]) => {
    const weight = weights[key] || 1.0;
    totalWeight += weight;

    if (analysis.indicator === 'struggling') {
      strugglingScore += analysis.score * weight;
    } else if (analysis.indicator === 'excelling') {
      excellingScore += analysis.score * weight;
    }
  });

  // Normalize scores
  const normalizedStruggling = strugglingScore / totalWeight;
  const normalizedExcelling = excellingScore / totalWeight;

  return {
    struggling: indicators.struggling,
    moderate: indicators.moderate,
    excelling: indicators.excelling,
    normalizedStruggling,
    normalizedExcelling,
    dominantIndicator: determineDominantIndicator(indicators, normalizedStruggling, normalizedExcelling)
  };
}

/**
 * Determine dominant indicator
 */
function determineDominantIndicator(indicators, normalizedStruggling, normalizedExcelling) {
  if (normalizedStruggling > 0.6 || indicators.struggling >= 3) {
    return 'struggling';
  } else if (normalizedExcelling > 0.7 || indicators.excelling >= 3) {
    return 'excelling';
  } else {
    return 'moderate';
  }
}

/**
 * Determine if adjustment is needed
 */
function determineAdjustment(indicators, currentDifficulty, exchangeCount, previousAssessments) {
  // Don't adjust too frequently - wait at least 3 exchanges
  if (exchangeCount < 3) {
    return {
      shouldAdjust: false,
      newLevel: currentDifficulty,
      confidence: 0.3,
      reasoning: 'Insufficient data - need at least 3 exchanges before adjusting difficulty'
    };
  }

  const dominantIndicator = indicators.dominantIndicator;
  const strugglingScore = indicators.normalizedStruggling;
  const excellingScore = indicators.normalizedExcelling;

  // Check if we have enough evidence
  const evidenceThreshold = 0.4;
  const hasStrongEvidence = strugglingScore > evidenceThreshold || excellingScore > evidenceThreshold;

  if (!hasStrongEvidence) {
    return {
      shouldAdjust: false,
      newLevel: currentDifficulty,
      confidence: 0.3,
      reasoning: 'Insufficient evidence for difficulty adjustment - performance is stable'
    };
  }

  // Check recent adjustment history
  const recentAdjustments = previousAssessments
    .filter(a => a.shouldAdjust)
    .slice(-2);
  
  if (recentAdjustments.length >= 2) {
    return {
      shouldAdjust: false,
      newLevel: currentDifficulty,
      confidence: 0.3,
      reasoning: 'Recent adjustments made - maintaining current difficulty to allow time for adaptation'
    };
  }

  // Determine new level
  let newLevel = currentDifficulty;
  let shouldAdjust = false;
  let confidence = 0.5;
  let reasoning = '';

  // Difficulty level mapping
  const difficultyLevels = { easy: 1, moderate: 2, hard: 3 };
  const currentLevel = difficultyLevels[currentDifficulty];

  if (dominantIndicator === 'struggling' && strugglingScore > 0.5) {
    // Make easier, but be careful
    if (currentLevel > 1) {
      newLevel = currentLevel === 3 ? 'moderate' : 'easy';
      shouldAdjust = true;
      confidence = Math.min(0.9, strugglingScore * 1.2);
      reasoning = `Strong indicators of struggle (score: ${strugglingScore.toFixed(2)}) - reducing difficulty to preserve confidence`;
    } else {
      shouldAdjust = false;
      newLevel = currentDifficulty; // Stay at easy
      confidence = 0.3;
      reasoning = 'Already at easiest level - maintaining with additional support';
    }
  } else if (dominantIndicator === 'excelling' && excellingScore > 0.6) {
    // Make harder, more aggressive
    if (currentLevel < 3) {
      newLevel = currentLevel === 1 ? 'moderate' : 'hard';
      shouldAdjust = true;
      confidence = Math.min(0.95, excellingScore * 1.1);
      reasoning = `Strong indicators of excellence (score: ${excellingScore.toFixed(2)}) - increasing difficulty to encourage growth`;
    } else {
      shouldAdjust = false;
      newLevel = currentDifficulty; // Stay at hard
      confidence = 0.3;
      reasoning = 'Already at hardest level - maintaining challenge';
    }
  } else {
    // Moderate performance - no adjustment needed
    shouldAdjust = false;
    newLevel = currentDifficulty;
    confidence = 0.5;
    reasoning = 'Moderate performance - maintaining current difficulty level';
  }

  return {
    shouldAdjust,
    newLevel,
    confidence,
    reasoning
  };
}

/**
 * Generate recommendations based on assessment
 */
function generateRecommendations(indicators, newLevel, currentDifficulty) {
  const recommendations = [];
  const dominantIndicator = indicators.dominantIndicator;

  if (newLevel === 'easy' || dominantIndicator === 'struggling') {
    recommendations.push('Provide more scaffolding and support');
    recommendations.push('Offer sentence starters or templates');
    recommendations.push('Break down complex questions into smaller parts');
    recommendations.push('Give more positive reinforcement');
    recommendations.push('Use simpler vocabulary and shorter sentences');
  } else if (newLevel === 'hard' || dominantIndicator === 'excelling') {
    recommendations.push('Introduce more complex scenarios');
    recommendations.push('Ask open-ended questions requiring deeper thought');
    recommendations.push('Encourage elaboration and detail');
    recommendations.push('Add follow-up questions to challenge thinking');
    recommendations.push('Introduce nuanced social situations');
  } else {
    recommendations.push('Maintain current support level');
    recommendations.push('Continue monitoring for patterns');
    recommendations.push('Provide balanced feedback');
  }

  // Add specific recommendations based on indicators
  if (indicators.struggling >= 2) {
    recommendations.push('Consider additional practice with similar scenarios');
  }

  if (indicators.excelling >= 2) {
    recommendations.push('Consider introducing advanced concepts');
  }

  return recommendations;
}

// ============================================================================
// UNIT TESTS
// ============================================================================

/**
 * Run unit tests for difficulty assessment
 */
export function runTests() {
  const tests = [];
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      const result = fn();
      if (result === true) {
        tests.push({ name, status: 'PASS', error: null });
        passed++;
      } else {
        tests.push({ name, status: 'FAIL', error: 'Test returned false' });
        failed++;
      }
    } catch (error) {
      tests.push({ name, status: 'FAIL', error: error.message });
      failed++;
    }
  }

  // Test 1: Struggling learner correctly identified
  test('Struggling learner - short response with uncertainty', () => {
    const result = assessDifficulty(
      "I don't know",
      { exchangeCount: 5, helpRequests: 1 },
      'moderate'
    );
    return result.indicators.struggling >= 2 && result.shouldAdjust === true;
  });

  // Test 2: Excelling learner correctly identified
  test('Excelling learner - detailed response', () => {
    const result = assessDifficulty(
      "I think that when someone is feeling sad, it's important to show empathy because they might need support and understanding from others.",
      { exchangeCount: 5, responseTime: 1.5 },
      'moderate'
    );
    return result.indicators.excelling >= 2;
  });

  // Test 3: Edge case - very short response
  test('Edge case - single word response', () => {
    const result = assessDifficulty(
      "Yes",
      { exchangeCount: 5 },
      'moderate'
    );
    return result.indicators.struggling >= 1;
  });

  // Test 4: Edge case - very long response
  test('Edge case - very long response', () => {
    const longMessage = "I think that ".repeat(20) + "this is important because";
    const result = assessDifficulty(
      longMessage,
      { exchangeCount: 5 },
      'moderate'
    );
    return result.analysis.responseLength.wordCount > 20;
  });

  // Test 5: No adjustment for stable performance
  test('No adjustment for stable performance', () => {
    const result = assessDifficulty(
      "I think this is okay",
      { exchangeCount: 5 },
      'moderate'
    );
    // Should not adjust if performance is moderate
    return result.shouldAdjust === false || result.newLevel === 'moderate';
  });

  // Test 6: Insufficient data (less than 3 exchanges)
  test('Insufficient data prevents adjustment', () => {
    const result = assessDifficulty(
      "I don't know",
      { exchangeCount: 2 },
      'moderate'
    );
    return result.shouldAdjust === false;
  });

  // Test 7: Already at easiest level
  test('Cannot make easier when already at easiest', () => {
    const result = assessDifficulty(
      "I don't know I'm confused",
      { exchangeCount: 5, helpRequests: 2 },
      'easy'
    );
    return result.newLevel === 'easy' || result.shouldAdjust === false;
  });

  // Test 8: Already at hardest level
  test('Cannot make harder when already at hardest', () => {
    const result = assessDifficulty(
      "I think this is excellent and I understand it well because of the detailed explanation",
      { exchangeCount: 5, responseTime: 1.0 },
      'hard'
    );
    return result.newLevel === 'hard' || result.shouldAdjust === false;
  });

  // Test 9: Response time analysis
  test('Slow response time identified', () => {
    const result = assessDifficulty(
      "I think this is okay",
      { exchangeCount: 5, responseTime: 7.5 },
      'moderate'
    );
    return result.analysis.responseTime.indicator === 'struggling';
  });

  // Test 10: Fast response time identified
  test('Fast response time identified', () => {
    const result = assessDifficulty(
      "I think this makes sense because of the reasons explained",
      { exchangeCount: 5, responseTime: 1.2 },
      'moderate'
    );
    return result.analysis.responseTime.indicator === 'excelling';
  });

  // Test 11: Help requests counted
  test('Help requests increase struggle indicator', () => {
    const result = assessDifficulty(
      "Can you help me? I don't understand",
      { exchangeCount: 5, helpRequests: 2 },
      'moderate'
    );
    return result.analysis.helpRequests.strugglePhrases >= 1 || result.analysis.helpRequests.helpRequestCount >= 1;
  });

  // Test 12: Confidence and recommendations
  test('Confidence score and recommendations provided', () => {
    const result = assessDifficulty(
      "I don't know",
      { exchangeCount: 5 },
      'moderate'
    );
    return (
      typeof result.confidence === 'number' &&
      result.confidence >= 0 &&
      result.confidence <= 1 &&
      Array.isArray(result.recommendations) &&
      result.recommendations.length > 0
    );
  });

  // Test 13: Empty message handling
  test('Empty message throws error', () => {
    try {
      assessDifficulty('', {}, 'moderate');
      return false;
    } catch (error) {
      return error.message.includes('required');
    }
  });

  // Test 14: Normalize difficulty levels
  test('Difficulty level normalization works', () => {
    const result1 = assessDifficulty("test", { exchangeCount: 5 }, 'beginner');
    const result2 = assessDifficulty("test", { exchangeCount: 5 }, 'easy');
    // Both should work without errors
    return result1 && result2;
  });

  // Test 15: Pattern analysis with hesitation
  test('Hesitation words detected', () => {
    const result = assessDifficulty(
      "Um, well, I think, uh, maybe",
      { exchangeCount: 5 },
      'moderate'
    );
    return result.analysis.patterns.hesitationCount >= 3;
  });

  return {
    total: tests.length,
    passed,
    failed,
    tests,
    successRate: (passed / tests.length) * 100
  };
}

/**
 * Export test runner for use in development
 */
if (typeof window !== 'undefined') {
  window.difficultyAssessmentTests = runTests;
}

// Default export
export default {
  assessDifficulty,
  runTests
};


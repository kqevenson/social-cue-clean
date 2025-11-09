/**
 * Response Evaluation Service
 * Analyzes student responses and determines teaching strategy
 * Based on Social Cue research: Zone of Proximal Development, Growth Mindset, Dignity-Preserving Feedback
 */
class ResponseEvaluationService {
  /**
   * Evaluate a student's response comprehensively
   * Returns detailed analysis for AI coaching decisions
   */
  evaluateResponse(studentResponse, context) {
    const {
      scenario,
      gradeLevel,
      conversationHistory,
      expectedSkills,
      previousPerformance
    } = context;

    // Multi-dimensional evaluation
    const evaluation = {
      // Content Analysis
      contentQuality: this.evaluateContent(studentResponse, scenario, gradeLevel),

      // Social Skills Analysis
      socialSkills: this.evaluateSocialSkills(studentResponse, expectedSkills, gradeLevel),

      // Tone & Confidence Analysis
      toneAnalysis: this.analyzeTone(studentResponse, gradeLevel),

      // Completeness & Depth
      responseDepth: this.evaluateDepth(studentResponse, gradeLevel),

      // Progress Indicators
      progressMarkers: this.identifyProgress(studentResponse, previousPerformance),

      // Overall Performance Level
      performanceLevel: null,

      // Teaching Strategy Recommendation
      teachingStrategy: null,

      // Specific Feedback Points
      strengths: [],
      improvements: [],

      // Difficulty Adjustment
      difficultyRecommendation: null
    };

    // Calculate overall performance
    evaluation.performanceLevel = this.calculatePerformanceLevel(evaluation);

    // Determine teaching strategy
    evaluation.teachingStrategy = this.determineTeachingStrategy(evaluation, gradeLevel);

    // Identify specific strengths and improvements
    evaluation.strengths = this.identifyStrengths(evaluation);
    evaluation.improvements = this.identifyImprovements(evaluation);

    // Recommend difficulty adjustment
    evaluation.difficultyRecommendation = this.recommendDifficultyAdjustment(
      evaluation,
      conversationHistory
    );

    return evaluation;
  }

  /**
   * Evaluate content quality - Did they answer appropriately?
   */
  evaluateContent(response, scenario, gradeLevel) {
    const text = response.toLowerCase().trim();
    const wordCount = text.split(/\s+/).length;

    // Check if response is relevant to scenario
    const scenarioKeywords = this.extractKeywords(scenario?.context || scenario?.description || '');
    const relevanceScore = this.calculateRelevance(text, scenarioKeywords);

    // Check for appropriate response length
    const lengthScore = this.evaluateLength(wordCount, gradeLevel);

    // Check if response makes logical sense
    const coherenceScore = this.evaluateCoherence(text, gradeLevel);

    return {
      score: (relevanceScore + lengthScore + coherenceScore) / 3,
      relevanceScore,
      lengthScore,
      coherenceScore,
      wordCount,
      isEmpty: wordCount === 0,
      isTooShort: wordCount < this.getMinWords(gradeLevel),
      isTooLong: wordCount > this.getMaxWords(gradeLevel)
    };
  }

  /**
   * Evaluate social skills demonstrated
   */
  evaluateSocialSkills(response, expectedSkills, gradeLevel) {
    const text = response.toLowerCase();
    const skills = {
      greeting: false,
      politeness: false,
      followUpQuestion: false,
      activeListening: false,
      empathy: false,
      selfIntroduction: false,
      sharing: false,
      clarity: false
    };

    // Detect greeting
    if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
      skills.greeting = true;
    }

    // Detect politeness
    if (/\b(please|thank you|thanks|excuse me|sorry)\b/.test(text)) {
      skills.politeness = true;
    }

    // Detect follow-up questions
    if (text.includes('?') || /\b(what|how|why|when|where|do you|can you|would you)\b/.test(text)) {
      skills.followUpQuestion = true;
    }

    // Detect active listening cues
    if (/\b(i see|i understand|that's interesting|really|oh|wow|cool)\b/.test(text)) {
      skills.activeListening = true;
    }

    // Detect empathy expressions
    if (/\b(i feel|that sounds|i'm sorry|i understand how|must be)\b/.test(text)) {
      skills.empathy = true;
    }

    // Detect self-introduction
    if (/\b(i'm|my name is|i am|i like|i love)\b/.test(text)) {
      skills.selfIntroduction = true;
    }

    // Detect sharing personal info
    if (/\b(i|my|me)\b/.test(text) && response.split(/\s+/).length > 5) {
      skills.sharing = true;
    }

    // Detect clarity (complete sentences for older grades)
    const grade = parseInt(gradeLevel, 10) || 6;
    if (grade >= 3) {
      skills.clarity = this.hasCompleteSentences(response);
    } else {
      skills.clarity = response.split(/\s+/).length >= 3;
    }

    // Calculate skill score
    const demonstratedSkills = Object.values(skills).filter(Boolean).length;
    const expectedSkillCount = this.getExpectedSkillCount(gradeLevel, expectedSkills);
    const skillScore = Math.min(demonstratedSkills / expectedSkillCount, 1);

    return {
      score: skillScore,
      demonstratedSkills: skills,
      skillCount: demonstratedSkills,
      expectedSkillCount,
      strongSkills: this.identifyStrongSkills(skills),
      missingSkills: this.identifyMissingSkills(skills, expectedSkills)
    };
  }

  /**
   * Analyze tone and confidence level
   */
  analyzeTone(response, gradeLevel) {
    const text = response.toLowerCase();
    const indicators = {
      confident: 0,
      tentative: 0,
      enthusiastic: 0,
      nervous: 0,
      friendly: 0
    };

    // Confident indicators
    if (/\b(definitely|absolutely|sure|certainly|i think|i believe)\b/.test(text)) {
      indicators.confident += 1;
    }

    // Tentative indicators
    if (/\b(maybe|perhaps|i guess|i don't know|um|uh|kinda|sorta)\b/.test(text)) {
      indicators.tentative += 1;
    }

    // Enthusiastic indicators
    if (/!/.test(response) || /\b(love|great|amazing|awesome|excited)\b/.test(text)) {
      indicators.enthusiastic += 1;
    }

    // Nervous indicators
    if (/\.\.\./.test(response) || /\b(nervous|worried|scared|anxious)\b/.test(text)) {
      indicators.nervous += 1;
    }

    // Friendly indicators
    if (/\b(friend|like you|with you|love to|sounds fun)\b/.test(text)) {
      indicators.friendly += 1;
    }

    // Determine dominant tone
    const dominantTone = Object.keys(indicators).reduce((a, b) =>
      indicators[a] > indicators[b] ? a : b
    );

    // Calculate confidence score
    const confidenceScore = (indicators.confident + indicators.enthusiastic) /
      Math.max(1, indicators.tentative + indicators.nervous + 1);

    return {
      dominantTone,
      indicators,
      confidenceLevel:
        confidenceScore > 1 ? 'high' : confidenceScore > 0.5 ? 'moderate' : 'low',
      confidenceScore: Math.min(confidenceScore / 2, 1),
      needsEncouragement: indicators.tentative > 0 || indicators.nervous > 0
    };
  }

  /**
   * Evaluate response depth and completeness
   */
  evaluateDepth(response, gradeLevel) {
    const text = response.trim();
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim()).length;

    const grade = parseInt(gradeLevel, 10) || 6;

    // Grade-specific depth expectations
    const expectations = {
      'K-2': { minWords: 3, minSentences: 1, elaborationExpected: false },
      '3-5': { minWords: 5, minSentences: 1, elaborationExpected: true },
      '6-8': { minWords: 8, minSentences: 2, elaborationExpected: true },
      '9-12': { minWords: 12, minSentences: 2, elaborationExpected: true }
    };

    const gradeKey = this.getGradeKey(grade);
    const expected = expectations[gradeKey];

    // Check for elaboration
    const hasElaboration = this.detectElaboration(text, grade);

    // Check for connection to previous conversation
    const hasConnection = this.detectConnection(text);

    return {
      score: this.calculateDepthScore(wordCount, sentenceCount, hasElaboration, expected),
      wordCount,
      sentenceCount,
      meetsMinimum: wordCount >= expected.minWords && sentenceCount >= expected.minSentences,
      hasElaboration,
      hasConnection,
      depthLevel:
        wordCount < expected.minWords ? 'minimal' : hasElaboration ? 'detailed' : 'adequate'
    };
  }

  /**
   * Identify progress indicators
   */
  identifyProgress(currentResponse, previousPerformance) {
    if (!previousPerformance || previousPerformance.length === 0) {
      return {
        isFirstResponse: true,
        improvements: [],
        patterns: []
      };
    }

    const improvements = [];
    const patterns = [];

    const avgPreviousWords =
      previousPerformance.reduce((sum, p) => sum + (p.wordCount || 0), 0) /
      previousPerformance.length;
    const currentWords = currentResponse.split(/\s+/).length;

    if (currentWords > avgPreviousWords * 1.2) {
      improvements.push('more_elaborate');
    }

    return {
      isFirstResponse: false,
      improvements,
      patterns,
      showingProgress: improvements.length > 0
    };
  }

  /**
   * Calculate overall performance level
   */
  calculatePerformanceLevel(evaluation) {
    const weights = {
      content: 0.3,
      socialSkills: 0.3,
      tone: 0.2,
      depth: 0.2
    };

    const overallScore =
      evaluation.contentQuality.score * weights.content +
      evaluation.socialSkills.score * weights.socialSkills +
      evaluation.toneAnalysis.confidenceScore * weights.tone +
      evaluation.responseDepth.score * weights.depth;

    if (overallScore >= 0.85) return 'excellent';
    if (overallScore >= 0.7) return 'good';
    if (overallScore >= 0.5) return 'adequate';
    if (overallScore >= 0.3) return 'needs_support';
    return 'struggling';
  }

  /**
   * Determine teaching strategy
   */
  determineTeachingStrategy(evaluation, gradeLevel) {
    const performance = evaluation.performanceLevel;
    const grade = parseInt(gradeLevel, 10) || 6;

    const strategies = {
      excellent: {
        approach: 'celebrate_and_challenge',
        feedback: 'enthusiastic_praise',
        nextStep: 'increase_complexity',
        support: 'minimal'
      },
      good: {
        approach: 'praise_and_refine',
        feedback: 'specific_praise_plus_one_tip',
        nextStep: 'maintain_or_slightly_increase',
        support: 'light'
      },
      adequate: {
        approach: 'encourage_and_model',
        feedback: 'find_positives_then_demonstrate',
        nextStep: 'maintain_difficulty',
        support: 'moderate'
      },
      needs_support: {
        approach: 'scaffold_heavily',
        feedback: 'gentle_guidance_with_examples',
        nextStep: 'simplify_slightly',
        support: 'heavy'
      },
      struggling: {
        approach: 'maximum_scaffolding',
        feedback: 'break_down_into_steps',
        nextStep: 'significantly_simplify',
        support: 'maximum'
      }
    };

    const strategy = { ...strategies[performance] };
    if (!strategy) {
      return {
        approach: 'encourage_and_model',
        feedback: 'find_positives_then_demonstrate',
        nextStep: 'maintain_difficulty',
        support: 'moderate'
      };
    }

    strategy.languageLevel = this.getGradeKey(grade);
    strategy.examplesNeeded = performance !== 'excellent';
    strategy.encouragementLevel = performance === 'struggling' ? 'high' : 'moderate';

    return strategy;
  }

  /**
   * Identify specific strengths
   */
  identifyStrengths(evaluation) {
    const strengths = [];

    if (evaluation.contentQuality.score >= 0.7) {
      strengths.push({
        type: 'content',
        description: 'Gave a relevant, on-topic response',
        praise: 'Your answer really fit the situation!'
      });
    }

    if (evaluation.socialSkills.strongSkills.length > 0) {
      evaluation.socialSkills.strongSkills.forEach((skill) => {
        strengths.push({
          type: 'social_skill',
          skill,
          description: this.getSkillDescription(skill),
          praise: this.getSkillPraise(skill)
        });
      });
    }

    if (evaluation.toneAnalysis.confidenceLevel !== 'low') {
      strengths.push({
        type: 'confidence',
        description: 'Spoke with confidence',
        praise: 'I can tell you felt comfortable saying that!'
      });
    }

    if (evaluation.responseDepth.hasElaboration) {
      strengths.push({
        type: 'elaboration',
        description: 'Provided details and elaboration',
        praise: 'Great job adding details to your answer!'
      });
    }

    return strengths.slice(0, 3);
  }

  /**
   * Identify areas for improvement
   */
  identifyImprovements(evaluation) {
    const improvements = [];

    if (evaluation.contentQuality.isTooShort) {
      improvements.push({
        type: 'elaboration',
        gentle_suggestion: 'Try adding a bit more detail',
        model: 'Let me show you how you could say more...',
        priority: 'high'
      });
    }

    if (evaluation.socialSkills.missingSkills.length > 0) {
      const topMissing = evaluation.socialSkills.missingSkills[0];
      improvements.push({
        type: 'social_skill',
        skill: topMissing,
        gentle_suggestion: this.getSuggestionForSkill(topMissing),
        model: this.getModelForSkill(topMissing),
        priority: 'medium'
      });
    }

    if (evaluation.toneAnalysis.needsEncouragement) {
      improvements.push({
        type: 'confidence',
        gentle_suggestion: 'Keep your head up! Try saying it with confidence.',
        model: 'Try saying it with certainty like this...',
        priority: 'low'
      });
    }

    return improvements.slice(0, 1);
  }

  /**
   * Recommend difficulty adjustment
   */
  recommendDifficultyAdjustment(evaluation, conversationHistory) {
    const recentPerformance = conversationHistory.slice(-3);
    const avgPerformance =
      recentPerformance.reduce((sum, msg) => sum + (msg.performanceScore || 0.5), 0) /
      Math.max(recentPerformance.length, 1);

    if (avgPerformance >= 0.85) {
      return {
        action: 'increase',
        reason: 'Consistently performing well',
        adjustment: 'add_complexity'
      };
    }

    if (avgPerformance < 0.4) {
      return {
        action: 'decrease',
        reason: 'Struggling with current level',
        adjustment: 'simplify_scenarios'
      };
    }

    return {
      action: 'maintain',
      reason: 'Appropriate challenge level',
      adjustment: 'none'
    };
  }

  // Helper methods
  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.includes(word));
  }

  calculateRelevance(response, keywords) {
    if (!keywords.length) return 0.5;
    const responseWords = response.split(/\s+/);
    const matches = keywords.filter((kw) => responseWords.some((rw) => rw.includes(kw)));
    return Math.min(matches.length / Math.max(keywords.length, 3), 1);
  }

  evaluateLength(wordCount, gradeLevel) {
    const grade = parseInt(gradeLevel, 10) || 6;
    const ideal = this.getIdealWords(grade);
    const min = this.getMinWords(grade);
    const max = this.getMaxWords(grade);

    if (wordCount < min) return 0.3;
    if (wordCount > max) return 0.7;
    if (wordCount >= ideal) return 1;
    return wordCount / ideal;
  }

  evaluateCoherence(text, gradeLevel) {
    const grade = parseInt(gradeLevel, 10) || 6;
    if (grade <= 2) {
      return text.length > 0 ? 1 : 0;
    }

    const hasProperStructure = /^[A-Z].*[.!?]$/.test(text.trim());
    return hasProperStructure ? 1 : 0.6;
  }

  getMinWords(grade) {
    if (grade <= 2) return 2;
    if (grade <= 5) return 4;
    if (grade <= 8) return 6;
    return 8;
  }

  getIdealWords(grade) {
    if (grade <= 2) return 5;
    if (grade <= 5) return 10;
    if (grade <= 8) return 15;
    return 20;
  }

  getMaxWords(grade) {
    if (grade <= 2) return 10;
    if (grade <= 5) return 20;
    if (grade <= 8) return 30;
    return 40;
  }

  getGradeKey(grade) {
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  hasCompleteSentences(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    return sentences.length > 0 && sentences.every((s) => s.split(/\s+/).length >= 3);
  }

  getExpectedSkillCount(gradeLevel, expectedSkills) {
    const grade = parseInt(gradeLevel, 10) || 6;
    if (grade <= 2) return 2;
    if (grade <= 5) return 3;
    if (grade <= 8) return 4;
    return 5;
  }

  identifyStrongSkills(skills) {
    return Object.keys(skills).filter((key) => skills[key]);
  }

  identifyMissingSkills(skills, expectedSkills) {
    return Object.keys(skills).filter(
      (key) => !skills[key] && (expectedSkills ? expectedSkills.includes(key) : true)
    );
  }

  detectElaboration(text, grade) {
    return (
      /\b(because|so|when|like|such as|for example|i think)\b/i.test(text) ||
      text.split(/\s+/).length > this.getIdealWords(grade)
    );
  }

  detectConnection(text) {
    return /\b(also|too|and|that|this|it|yeah|right)\b/i.test(text);
  }

  calculateDepthScore(wordCount, sentenceCount, hasElaboration, expected) {
    let score = 0;
    score += Math.min(wordCount / expected.minWords, 1) * 0.5;
    score += Math.min(sentenceCount / expected.minSentences, 1) * 0.25;
    if (expected.elaborationExpected) {
      score += hasElaboration ? 0.25 : 0;
    } else {
      score += 0.25;
    }
    return Math.min(score, 1);
  }

  getSkillDescription(skill) {
    const descriptions = {
      greeting: 'Used a friendly greeting',
      politeness: 'Was polite and respectful',
      followUpQuestion: 'Asked a follow-up question',
      activeListening: 'Showed active listening',
      empathy: 'Expressed empathy',
      selfIntroduction: 'Introduced yourself clearly',
      sharing: 'Shared personal information',
      clarity: 'Spoke clearly and completely'
    };
    return descriptions[skill] || skill;
  }

  getSkillPraise(skill) {
    const praise = {
      greeting: 'Nice friendly greeting!',
      politeness: 'So polite - great manners!',
      followUpQuestion: 'Awesome follow-up question!',
      activeListening: "I can tell you're really listening!",
      empathy: 'That shows you care about others!',
      selfIntroduction: 'Perfect way to introduce yourself!',
      sharing: 'Great job sharing about yourself!',
      clarity: 'Very clear communication!'
    };
    return praise[skill] || 'Well done!';
  }

  getSuggestionForSkill(skill) {
    const suggestions = {
      greeting: 'Try starting with a friendly greeting',
      politeness: 'Remember to use polite words like please and thank you',
      followUpQuestion: 'Try asking a question to keep the conversation going',
      activeListening: "Show you're listening with words like \"I see\" or \"That's interesting\"",
      empathy: 'Try sharing how you feel or understanding how they feel',
      selfIntroduction: 'Share a bit about yourself',
      sharing: 'Tell them something about yourself or what you like',
      clarity: 'Try using complete sentences'
    };
    return suggestions[skill] || 'Keep practicing!';
  }

  getModelForSkill(skill) {
    const models = {
      greeting: 'Like this: "Hi! How are you doing today?"',
      politeness: 'You could say: "Excuse me, can you please help me?"',
      followUpQuestion: 'Try: "That\'s cool! What else do you like about it?"',
      activeListening: 'Like: "Really? That sounds interesting! Tell me more."',
      empathy: 'You might say: "I understand how that feels. I\'ve felt that way too."',
      selfIntroduction: 'Try: "Hi, I\'m [name]. I really like [hobby]."',
      sharing: 'Like: "I love playing soccer. What about you - what do you like to do?"',
      clarity: 'Instead of just "Good," try: "I\'m doing great! I had a fun weekend."'
    };
    return models[skill] || '';
  }
}

const responseEvaluationService = new ResponseEvaluationService();
export default responseEvaluationService;

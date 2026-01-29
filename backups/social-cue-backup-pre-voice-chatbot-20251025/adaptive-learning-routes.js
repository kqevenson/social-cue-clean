// Adaptive Learning Routes - Express API Endpoints
// This file contains all Express API endpoints for the adaptive learning system

import express from 'express';
import {
  evaluateLearnerResponse,
  analyzeSession,
  determineNextDifficultyLevel,
  generateProgressInsights,
  createRealWorldChallenge as createChallenge,
  generateLearningRecommendations,
  checkBadgeEligibility
} from './adaptive-learning-engine.js';
import {
  createLearnerProfile,
  getLearnerProfile,
  updateLearnerProfile,
  updateLearnerProgress,
  upsertTopicMastery,
  getTopicMastery,
  saveSessionHistory,
  getSessionHistory,
  getSessionStats,
  createRealWorldChallenge,
  getActiveChallenges,
  updateChallenge,
  logChallengeAttempt,
  completeChallenge,
  getAdaptiveSettings,
  updateAdaptiveSettings,
  saveProgressInsight,
  getProgressInsights,
  generateAnalytics,
  getAnalytics
} from './firebase-adaptive-service.js';
import {
  DIFFICULTY_LEVELS,
  MASTERY_LEVELS,
  BADGE_DEFINITIONS,
  DEFAULT_VALUES
} from './adaptive-learning-schema.js';

const router = express.Router();

// ============================================================================
// RESPONSE EVALUATION ENDPOINTS
// ============================================================================

/**
 * POST /api/adaptive/evaluate-response
 * Evaluates a single learner response using AI
 */
router.post('/evaluate-response', async (req, res) => {
  try {
    console.log('🤖 Evaluating learner response via API...');
    
    const {
      learnerId,
      question,
      selectedAnswer,
      correctAnswer,
      responseTime,
      difficulty,
      gradeLevel,
      learnerProfile
    } = req.body;
    
    // Validate required fields
    if (!learnerId || !question || !selectedAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: learnerId, question, selectedAnswer, correctAnswer'
      });
    }
    
    const responseData = {
      question,
      selectedAnswer,
      correctAnswer,
      responseTime: responseTime || 0,
      difficulty: difficulty || DIFFICULTY_LEVELS.BEGINNER,
      gradeLevel: gradeLevel || 'K-2',
      learnerProfile: learnerProfile || {}
    };
    
    // Evaluate response using AI
    const evaluation = await evaluateLearnerResponse(responseData);
    
    // Update learner progress if response was correct
    if (evaluation.isCorrect) {
      await updateLearnerProgress(learnerId, {
        pointsEarned: evaluation.pointsEarned || 10,
        incrementSessions: false // Don't increment sessions for individual responses
      });
    }
    
    // Check for badge opportunities
    const badgeOpportunities = [];
    if (evaluation.badgeOpportunities) {
      for (const badgeId of evaluation.badgeOpportunities) {
        const learnerData = await getLearnerProfile(learnerId);
        if (checkBadgeEligibility(badgeId, learnerData)) {
          badgeOpportunities.push(badgeId);
          // Award badge
          await updateLearnerProgress(learnerId, {
            addBadge: badgeId
          });
        }
      }
    }
    
    console.log('✅ Response evaluation completed successfully');
    
    res.json({
      success: true,
      evaluation: {
        ...evaluation,
        badgeOpportunities
      }
    });
    
  } catch (error) {
    console.error('❌ Error evaluating response:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate learner response',
      details: error.message,
      stack: error.stack
    });
  }
});

/**
 * POST /api/adaptive/complete-session
 * Analyzes a complete session and provides adaptive recommendations
 */
router.post('/complete-session', async (req, res) => {
  try {
    console.log('📈 Completing session analysis via API...');
    
    const {
      sessionId,
      learnerId,
      topicId,
      topicName,
      sessionType,
      difficulty,
      questionsAnswered,
      totalQuestions,
      correctAnswers,
      score,
      timeSpent,
      pointsEarned,
      gradeLevel,
      learnerProfile
    } = req.body;
    
    // Validate required fields
    if (!sessionId || !learnerId || !topicId || !topicName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, learnerId, topicId, topicName'
      });
    }
    
    const sessionData = {
      sessionId,
      learnerId,
      topicId,
      topicName,
      sessionType: sessionType || 'practice',
      difficulty: difficulty || DIFFICULTY_LEVELS.BEGINNER,
      questionsAnswered: questionsAnswered || [],
      totalQuestions: totalQuestions || 0,
      correctAnswers: correctAnswers || 0,
      score: score || 0,
      timeSpent: timeSpent || 0,
      pointsEarned: pointsEarned || 0,
      gradeLevel: gradeLevel || 'K-2',
      learnerProfile: learnerProfile || {}
    };
    
    // Save session to history
    await saveSessionHistory(sessionData);
    
    // Analyze session using AI
    const analysis = await analyzeSession(sessionData);
    
    // Update learner progress
    await updateLearnerProgress(learnerId, {
      pointsEarned: pointsEarned || 0,
      incrementSessions: true,
      updateStreak: true,
      newStreak: (learnerProfile?.streak || 0) + 1
    });
    
    // Update topic mastery
    const currentMastery = await getTopicMastery(learnerId, topicId);
    const masteryUpdate = {
      learnerId,
      topicId,
      topicName,
      totalSessions: (currentMastery?.totalSessions || 0) + 1,
      averageScore: calculateNewAverageScore(currentMastery?.averageScore || 0, currentMastery?.totalSessions || 0, score),
      bestScore: Math.max(currentMastery?.bestScore || 0, score),
      timeSpent: (currentMastery?.timeSpent || 0) + timeSpent,
      lastPracticed: new Date(),
      currentLevel: analysis.progressIndicators?.masteryLevel || MASTERY_LEVELS.NOT_STARTED,
      percentComplete: analysis.progressIndicators?.masteryProgress || 0,
      strengths: analysis.learningInsights?.strengthsDemonstrated || [],
      weaknesses: analysis.learningInsights?.weaknessesIdentified || [],
      nextRecommendedLevel: analysis.adaptiveRecommendations?.nextSessionDifficulty || difficulty
    };
    
    await upsertTopicMastery(masteryUpdate);
    
    // Generate progress insights
    const learnerData = await getLearnerProfile(learnerId);
    const topicMastery = await getTopicMastery(learnerId);
    const recentSessions = await getSessionHistory(learnerId, 10);
    
    const insights = await generateProgressInsights({
      ...learnerData,
      topicMastery,
      recentSessions
    });
    
    // Save insights
    await saveProgressInsight({
      learnerId,
      insightType: 'session_completion',
      title: `Great work on ${topicName}!`,
      description: insights.overview?.learningJourney || 'You completed another practice session.',
      data: analysis,
      recommendations: insights.recommendations?.nextSteps || [],
      priority: 'medium'
    });
    
    console.log('✅ Session analysis completed successfully');
    
    res.json({
      success: true,
      analysis,
      insights,
      masteryUpdate,
      recommendations: analysis.adaptiveRecommendations
    });
    
  } catch (error) {
    console.error('❌ Error completing session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete session analysis',
      details: error.message
    });
  }
});

// ============================================================================
// SESSION RECOMMENDATION ENDPOINTS
// ============================================================================

/**
 * GET /api/adaptive/next-session/:userId/:topicId
 * Gets recommendations for the next session
 */
router.get('/next-session/:userId/:topicId', async (req, res) => {
  try {
    console.log('🎯 Getting next session recommendations...');
    
    const { userId, topicId } = req.params;
    const { difficulty } = req.query;
    
    // Get learner profile
    const learnerProfile = await getLearnerProfile(userId);
    if (!learnerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Learner profile not found'
      });
    }
    
    // Get topic mastery
    const topicMastery = await getTopicMastery(userId, topicId);
    
    // Get recent sessions
    const recentSessions = await getSessionHistory(userId, 10);
    
    // Determine next difficulty level
    const difficultyRecommendation = determineNextDifficultyLevel({
      recentSessions,
      currentLevel: difficulty ? parseInt(difficulty) : learnerProfile.currentLevel,
      topicMastery
    });
    
    // Generate learning recommendations
    const recommendations = generateLearningRecommendations({
      ...learnerProfile,
      topicMastery,
      recentSessions
    });
    
    console.log('✅ Next session recommendations generated');
    
    res.json({
      success: true,
      recommendations: {
        difficulty: difficultyRecommendation.recommendedLevel,
        topicFocus: recommendations.nextTopics,
        practiceFocus: recommendations.practiceFocus,
        learningStrategy: recommendations.learningStrategy,
        confidence: difficultyRecommendation.confidence
      },
      learnerProfile,
      topicMastery,
      recentPerformance: recentSessions.slice(0, 5)
    });
    
  } catch (error) {
    console.error('❌ Error getting next session recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get next session recommendations',
      details: error.message
    });
  }
});

// ============================================================================
// PROGRESS INSIGHTS ENDPOINTS
// ============================================================================

/**
 * GET /api/adaptive/progress-insights/:userId
 * Gets progress insights for a learner
 */
router.get('/progress-insights/:userId', async (req, res) => {
  try {
    console.log('💡 Getting progress insights...');
    
    const { userId } = req.params;
    const { unreadOnly } = req.query;
    
    // Get learner profile
    const learnerProfile = await getLearnerProfile(userId);
    if (!learnerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Learner profile not found'
      });
    }
    
    // Get topic mastery
    const topicMastery = await getTopicMastery(userId);
    
    // Get recent sessions
    const recentSessions = await getSessionHistory(userId, 20);
    
    // Get saved insights
    const savedInsights = await getProgressInsights(userId, unreadOnly === 'true');
    
    // Generate fresh insights
    const freshInsights = await generateProgressInsights({
      ...learnerProfile,
      topicMastery,
      recentSessions
    });
    
    console.log('✅ Progress insights retrieved successfully');
    
    res.json({
      success: true,
      insights: {
        saved: savedInsights,
        fresh: freshInsights
      },
      learnerProfile,
      topicMastery,
      recentSessions: recentSessions.slice(0, 10)
    });
    
  } catch (error) {
    console.error('❌ Error getting progress insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress insights',
      details: error.message
    });
  }
});

/**
 * GET /api/adaptive/mastery-dashboard/:userId
 * Gets mastery dashboard data for a learner
 */
router.get('/mastery-dashboard/:userId', async (req, res) => {
  try {
    console.log('📊 Getting mastery dashboard...');
    
    const { userId } = req.params;
    
    // Get learner profile
    const learnerProfile = await getLearnerProfile(userId);
    if (!learnerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Learner profile not found'
      });
    }
    
    // Get all topic mastery
    const topicMastery = await getTopicMastery(userId);
    
    // Get session statistics
    const sessionStats = await getSessionStats(userId);
    
    // Get recent sessions
    const recentSessions = await getSessionHistory(userId, 20);
    
    // Calculate mastery summary
    const masterySummary = {
      totalTopics: topicMastery.length,
      masteredTopics: topicMastery.filter(t => t.currentLevel >= MASTERY_LEVELS.MASTER).length,
      inProgressTopics: topicMastery.filter(t => t.currentLevel > MASTERY_LEVELS.NOT_STARTED && t.currentLevel < MASTERY_LEVELS.MASTER).length,
      averageMastery: topicMastery.length > 0 ? 
        topicMastery.reduce((sum, t) => sum + t.currentLevel, 0) / topicMastery.length : 0,
      strongestTopic: topicMastery.reduce((max, t) => t.currentLevel > max.currentLevel ? t : max, { currentLevel: 0 }),
      weakestTopic: topicMastery.reduce((min, t) => t.currentLevel < min.currentLevel ? t : min, { currentLevel: 5 })
    };
    
    console.log('✅ Mastery dashboard generated successfully');
    
    res.json({
      success: true,
      dashboard: {
        masterySummary,
        topicMastery,
        sessionStats,
        recentSessions: recentSessions.slice(0, 10),
        learnerProfile
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting mastery dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get mastery dashboard',
      details: error.message
    });
  }
});

// ============================================================================
// REAL-WORLD CHALLENGE ENDPOINTS
// ============================================================================

/**
 * POST /api/adaptive/generate-challenge
 * Generates a new real-world challenge
 */
router.post('/generate-challenge', async (req, res) => {
  try {
    console.log('🎪 Generating real-world challenge...');
    
    const {
      learnerId,
      topicName,
      gradeLevel,
      currentLevel,
      strengths,
      needsWork,
      recentPerformance
    } = req.body;
    
    // Validate required fields
    if (!learnerId || !topicName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: learnerId, topicName'
      });
    }
    
    const challengeData = {
      topicName,
      gradeLevel: gradeLevel || 'K-2',
      currentLevel: currentLevel || DIFFICULTY_LEVELS.BEGINNER,
      strengths: strengths || [],
      needsWork: needsWork || [],
      recentPerformance: recentPerformance || 'No recent data'
    };
    
    // Generate challenge using AI
    const challengeContent = await createChallenge(challengeData);
    
    // Create challenge record
    const challengeRecord = {
      learnerId,
      topicName,
      lessonTopic: topicName,
      challengeText: challengeContent.challengeText,
      timeframe: challengeContent.timeframe,
      tips: challengeContent.tips,
      successCriteria: challengeContent.successCriteria,
      difficulty: challengeContent.difficulty,
      estimatedTime: challengeContent.estimatedTime,
      materialsNeeded: challengeContent.materialsNeeded,
      safetyNotes: challengeContent.safetyNotes,
      followUpQuestions: challengeContent.followUpQuestions,
      encouragement: challengeContent.encouragement
    };
    
    const challengeId = await createRealWorldChallenge(challengeRecord);
    
    console.log('✅ Real-world challenge generated successfully');
    
    res.json({
      success: true,
      challenge: {
        id: challengeId,
        ...challengeRecord
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate real-world challenge',
      details: error.message
    });
  }
});

/**
 * POST /api/adaptive/complete-challenge
 * Marks a challenge as complete
 */
router.post('/complete-challenge', async (req, res) => {
  try {
    console.log('🎉 Completing challenge...');
    
    const {
      challengeId,
      learnerId,
      notes,
      pointsAwarded
    } = req.body;
    
    // Validate required fields
    if (!challengeId || !learnerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: challengeId, learnerId'
      });
    }
    
    // Complete the challenge
    await completeChallenge(challengeId, {
      notes,
      pointsAwarded: pointsAwarded || 50
    });
    
    // Update learner progress
    await updateLearnerProgress(learnerId, {
      pointsEarned: pointsAwarded || 50
    });
    
    // Check for badge opportunities
    const learnerData = await getLearnerProfile(learnerId);
    if (checkBadgeEligibility('challenge_completer', learnerData)) {
      await updateLearnerProgress(learnerId, {
        addBadge: 'challenge_completer'
      });
    }
    
    console.log('✅ Challenge completed successfully');
    
    res.json({
      success: true,
      message: 'Challenge completed successfully',
      pointsAwarded: pointsAwarded || 50
    });
    
  } catch (error) {
    console.error('❌ Error completing challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete challenge',
      details: error.message
    });
  }
});

/**
 * GET /api/adaptive/active-challenges/:userId
 * Gets active challenges for a learner
 */
router.get('/active-challenges/:userId', async (req, res) => {
  try {
    console.log('🎪 Getting active challenges...');
    
    const { userId } = req.params;
    
    // Get active challenges
    const activeChallenges = await getActiveChallenges(userId);
    
    console.log('✅ Active challenges retrieved successfully');
    
    res.json({
      success: true,
      challenges: activeChallenges
    });
    
  } catch (error) {
    console.error('❌ Error getting active challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active challenges',
      details: error.message
    });
  }
});

// ============================================================================
// PREFERENCES AND SETTINGS ENDPOINTS
// ============================================================================

/**
 * PUT /api/adaptive/preferences/:userId
 * Updates adaptive learning preferences
 */
router.put('/preferences/:userId', async (req, res) => {
  try {
    console.log('⚙️ Updating adaptive preferences...');
    
    const { userId } = req.params;
    const preferences = req.body;
    
    // Map frontend field names to backend field names
    const mappedPreferences = {
      learningPace: preferences.learningPace,
      feedbackStyle: preferences.feedbackStyle,
      challengeLevel: preferences.challengeLevel,
      practiceFrequency: preferences.practiceFrequencyGoal || preferences.practiceFrequency,
      autoAdjustDifficulty: preferences.autoAdjustDifficulty !== undefined ? preferences.autoAdjustDifficulty : true,
      preferredDifficulty: preferences.preferredDifficulty || 'beginner'
    };
    
    // Update adaptive settings
    await updateAdaptiveSettings(userId, mappedPreferences);
    
    console.log('✅ Adaptive preferences updated successfully');
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: mappedPreferences
    });
    
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      details: error.message
    });
  }
});

/**
 * GET /api/adaptive/preferences/:userId
 * Gets adaptive learning preferences for a learner
 */
router.get('/preferences/:userId', async (req, res) => {
  try {
    console.log('⚙️ Getting adaptive preferences...');
    
    const { userId } = req.params;
    
    // Get adaptive settings
    const preferences = await getAdaptiveSettings(userId);
    
    // Map backend field names to frontend field names
    const mappedPreferences = {
      learningPace: preferences.learningPace || 'self-paced',
      feedbackStyle: preferences.feedbackStyle || 'encouraging',
      challengeLevel: preferences.challengeLevel || 'moderate',
      practiceFrequencyGoal: preferences.practiceFrequency || 'few-times-week',
      autoAdjustDifficulty: preferences.autoAdjustDifficulty !== undefined ? preferences.autoAdjustDifficulty : true,
      preferredDifficulty: preferences.preferredDifficulty || 'beginner'
    };
    
    console.log('✅ Adaptive preferences retrieved successfully');
    
    res.json({
      success: true,
      preferences: mappedPreferences
    });
    
  } catch (error) {
    console.error('❌ Error getting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      details: error.message
    });
  }
});

/**
 * GET /api/adaptive/session-history/:userId
 * Gets session history for a learner
 */
router.get('/session-history/:userId', async (req, res) => {
  try {
    console.log('📚 Getting session history...');
    
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    console.log('📚 Fetching session history for user:', userId);
    console.log('📚 Limit:', limit);
    
    // Get session history using existing function
    const sessions = await getSessionHistory(userId, parseInt(limit));
    
    console.log('✅ Session history retrieved successfully:', sessions.length, 'sessions');
    
    res.json({
      success: true,
      sessions: sessions
    });
    
  } catch (error) {
    console.error('❌ Error getting session history:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get session history',
      details: error.message
    });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/adaptive/analytics/:userId
 * Gets analytics for a learner
 */
router.get('/analytics/:userId', async (req, res) => {
  try {
    console.log('📊 Getting analytics...');
    
    const { userId } = req.params;
    const { period } = req.query;
    
    // Get analytics
    const analytics = await getAnalytics(userId, period);
    
    // If no analytics exist, generate them
    if (analytics.length === 0) {
      console.log('📊 No analytics found, generating new ones...');
      await generateAnalytics(userId, period || 'weekly');
      const newAnalytics = await getAnalytics(userId, period);
      
      res.json({
        success: true,
        analytics: newAnalytics
      });
    } else {
      res.json({
        success: true,
        analytics
      });
    }
    
    console.log('✅ Analytics retrieved successfully');
    
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      details: error.message
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates new average score
 * @param {number} currentAverage - Current average score
 * @param {number} currentCount - Current number of sessions
 * @param {number} newScore - New score to add
 * @returns {number} - New average score
 */
const calculateNewAverageScore = (currentAverage, currentCount, newScore) => {
  if (currentCount === 0) return newScore;
  
  const totalScore = currentAverage * currentCount + newScore;
  return totalScore / (currentCount + 1);
};

export default router;

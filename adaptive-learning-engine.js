// Adaptive Learning Engine - AI-Powered Learning Intelligence
// This file contains AI-powered functions for evaluating learner performance and adapting difficulty

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import {
  DIFFICULTY_LEVELS,
  MASTERY_LEVELS,
  PERFORMANCE_METRICS,
  BADGE_DEFINITIONS,
  DEFAULT_VALUES
} from './adaptive-learning-schema.js';

dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Evaluates a single learner response using Claude AI
 * @param {Object} responseData - The response data to evaluate
 * @param {string} responseData.question - The question text
 * @param {string} responseData.selectedAnswer - The learner's selected answer
 * @param {string} responseData.correctAnswer - The correct answer
 * @param {number} responseData.responseTime - Time taken to respond (seconds)
 * @param {number} responseData.difficulty - Current difficulty level (1-5)
 * @param {string} responseData.gradeLevel - Learner's grade level
 * @param {Object} responseData.learnerProfile - Learner's profile data
 * @returns {Promise<Object>} - Evaluation results with insights
 */
export const evaluateLearnerResponse = async (responseData) => {
  try {
    console.log('🤖 Evaluating learner response with AI...');
    
    const prompt = `You are an expert educational AI analyzing a learner's response to a social skills question.

LEARNER CONTEXT:
- Grade Level: ${responseData.gradeLevel}
- Current Difficulty: ${responseData.difficulty}/5
- Response Time: ${responseData.responseTime} seconds
- Learner Strengths: ${responseData.learnerProfile?.strengths?.join(', ') || 'None identified'}
- Areas for Improvement: ${responseData.learnerProfile?.needsWork?.join(', ') || 'None identified'}

QUESTION: ${responseData.question}

CORRECT ANSWER: ${responseData.correctAnswer}
LEARNER'S ANSWER: ${responseData.selectedAnswer}

EVALUATION CRITERIA:
1. Accuracy: Is the answer correct?
2. Appropriateness: Is the answer age-appropriate for ${responseData.gradeLevel}?
3. Social Intelligence: Does it show good social awareness?
4. Response Quality: Is it thoughtful and considerate?
5. Learning Potential: What can the learner improve?

Provide a comprehensive evaluation in this JSON format:
{
  "isCorrect": true/false,
  "accuracyScore": 0-100,
  "responseQuality": 1-5,
  "socialIntelligence": 1-5,
  "ageAppropriateness": 1-5,
  "learningInsights": {
    "strengths": ["strength1", "strength2"],
    "areasForImprovement": ["area1", "area2"],
    "specificFeedback": "Detailed feedback for the learner",
    "encouragement": "Encouraging message",
    "nextSteps": "What to focus on next"
  },
  "difficultyRecommendation": {
    "currentLevelAppropriate": true/false,
    "suggestedAdjustment": "increase/decrease/maintain",
    "reasoning": "Why this adjustment is recommended"
  },
  "pointsEarned": 0-20,
  "badgeOpportunities": ["badge_id1", "badge_id2"]
}

Be encouraging, specific, and age-appropriate in your feedback.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    console.log('📊 AI evaluation response received');

    // Parse JSON response
    let evaluation;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      evaluation = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse AI evaluation:', parseError);
      // Fallback evaluation
      evaluation = {
        isCorrect: responseData.selectedAnswer === responseData.correctAnswer,
        accuracyScore: responseData.selectedAnswer === responseData.correctAnswer ? 100 : 0,
        responseQuality: 3,
        socialIntelligence: 3,
        ageAppropriateness: 4,
        learningInsights: {
          strengths: ['Attempted the question'],
          areasForImprovement: ['Understanding social cues'],
          specificFeedback: 'Good effort! Keep practicing to improve your social skills.',
          encouragement: 'You\'re doing great! Every practice session helps you learn.',
          nextSteps: 'Focus on understanding social situations better'
        },
        difficultyRecommendation: {
          currentLevelAppropriate: true,
          suggestedAdjustment: 'maintain',
          reasoning: 'Continue at current level'
        },
        pointsEarned: responseData.selectedAnswer === responseData.correctAnswer ? 10 : 5,
        badgeOpportunities: []
      };
    }

    console.log('✅ Learner response evaluated successfully');
    return evaluation;

  } catch (error) {
    console.error('❌ Error evaluating learner response:', error);
    throw new Error('Failed to evaluate learner response');
  }
};

/**
 * Analyzes a complete session and provides adaptive insights
 * @param {Object} sessionData - Complete session data
 * @returns {Promise<Object>} - Session analysis with adaptive recommendations
 */
export const analyzeSession = async (sessionData) => {
  try {
    console.log('📈 Analyzing complete session with AI...');
    
    const prompt = `You are an expert educational AI analyzing a complete learning session.

SESSION DATA:
- Topic: ${sessionData.topicName}
- Difficulty Level: ${sessionData.difficulty}/5
- Total Questions: ${sessionData.totalQuestions}
- Correct Answers: ${sessionData.correctAnswers}
- Score: ${sessionData.score}%
- Time Spent: ${sessionData.timeSpent} seconds
- Grade Level: ${sessionData.gradeLevel}

LEARNER PROFILE:
- Current Level: ${sessionData.learnerProfile?.currentLevel || 1}/5
- Strengths: ${sessionData.learnerProfile?.strengths?.join(', ') || 'None'}
- Areas for Improvement: ${sessionData.learnerProfile?.needsWork?.join(', ') || 'None'}
- Total Sessions: ${sessionData.learnerProfile?.totalSessions || 0}

PERFORMANCE ANALYSIS NEEDED:
1. Overall performance assessment
2. Difficulty level appropriateness
3. Learning progress indicators
4. Areas of strength and weakness
5. Recommendations for next steps
6. Adaptive adjustments needed

Provide comprehensive analysis in this JSON format:
{
  "sessionAssessment": {
    "overallPerformance": "excellent/good/fair/needs_improvement",
    "scoreInterpretation": "Detailed interpretation of the score",
    "timeEfficiency": "Assessment of time spent vs performance",
    "engagementLevel": 1-5,
    "learningProgress": "Description of learning progress shown"
  },
  "difficultyAnalysis": {
    "currentLevelAppropriate": true/false,
    "performanceVsDifficulty": "How performance relates to difficulty",
    "recommendedNextLevel": 1-5,
    "adjustmentReasoning": "Why this adjustment is recommended"
  },
  "learningInsights": {
    "strengthsDemonstrated": ["strength1", "strength2"],
    "weaknessesIdentified": ["weakness1", "weakness2"],
    "skillDevelopment": "Areas showing improvement",
    "focusAreas": ["area1", "area2"]
  },
  "adaptiveRecommendations": {
    "nextSessionDifficulty": 1-5,
    "topicFocus": "Specific topics to focus on",
    "learningStrategy": "Recommended learning approach",
    "practiceSuggestions": ["suggestion1", "suggestion2"]
  },
  "progressIndicators": {
    "masteryLevel": 0-5,
    "masteryProgress": "Percentage progress toward next level",
    "learningVelocity": "Rate of learning progress",
    "retentionQuality": "How well concepts are being retained"
  },
  "badgeRecommendations": ["badge_id1", "badge_id2"],
  "challengeSuggestions": {
    "realWorldChallenges": ["challenge1", "challenge2"],
    "practiceFocus": "Areas needing real-world practice"
  }
}

Be encouraging, specific, and actionable in your analysis.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    console.log('📊 Session analysis response received');

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      analysis = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse session analysis:', parseError);
      // Fallback analysis
      analysis = {
        sessionAssessment: {
          overallPerformance: sessionData.score >= 80 ? 'excellent' : sessionData.score >= 60 ? 'good' : 'needs_improvement',
          scoreInterpretation: `Scored ${sessionData.score}% on ${sessionData.topicName}`,
          timeEfficiency: 'Good time management',
          engagementLevel: 4,
          learningProgress: 'Showing steady progress'
        },
        difficultyAnalysis: {
          currentLevelAppropriate: true,
          performanceVsDifficulty: 'Performance matches difficulty level',
          recommendedNextLevel: sessionData.score >= 80 ? Math.min(5, sessionData.difficulty + 1) : sessionData.difficulty,
          adjustmentReasoning: sessionData.score >= 80 ? 'Ready for increased challenge' : 'Continue at current level'
        },
        learningInsights: {
          strengthsDemonstrated: ['Persistence', 'Effort'],
          weaknessesIdentified: ['Understanding complex scenarios'],
          skillDevelopment: 'Basic social skills improving',
          focusAreas: ['Complex social situations']
        },
        adaptiveRecommendations: {
          nextSessionDifficulty: sessionData.score >= 80 ? Math.min(5, sessionData.difficulty + 1) : sessionData.difficulty,
          topicFocus: sessionData.topicName,
          learningStrategy: 'Continue practicing with varied scenarios',
          practiceSuggestions: ['Try different social situations', 'Practice with friends']
        },
        progressIndicators: {
          masteryLevel: Math.floor(sessionData.score / 20),
          masteryProgress: `${sessionData.score}% toward next level`,
          learningVelocity: 'Steady',
          retentionQuality: 'Good'
        },
        badgeRecommendations: [],
        challengeSuggestions: {
          realWorldChallenges: ['Practice with classmates', 'Try new social situations'],
          practiceFocus: 'Real-world application'
        }
      };
    }

    console.log('✅ Session analysis completed successfully');
    return analysis;

  } catch (error) {
    console.error('❌ Error analyzing session:', error);
    throw new Error('Failed to analyze session');
  }
};

/**
 * Determines the next difficulty level based on performance history
 * @param {Object} performanceData - Performance data for analysis
 * @returns {Object} - Difficulty recommendation
 */
export const determineNextDifficultyLevel = (performanceData) => {
  try {
    console.log('🎯 Determining next difficulty level...');
    
    const { recentSessions, currentLevel, topicMastery } = performanceData;
    
    // Calculate performance metrics
    const averageScore = recentSessions.reduce((sum, session) => sum + session.score, 0) / recentSessions.length;
    const consistencyScore = calculateConsistencyScore(recentSessions);
    const masteryProgress = topicMastery?.percentComplete || 0;
    
    let recommendedLevel = currentLevel;
    let adjustmentReason = 'Maintain current level';
    
    // Difficulty adjustment logic
    if (averageScore >= 85 && consistencyScore >= 0.8 && masteryProgress >= 75) {
      // High performance, consistent, high mastery - increase difficulty
      recommendedLevel = Math.min(5, currentLevel + 1);
      adjustmentReason = 'High performance and mastery - ready for increased challenge';
    } else if (averageScore <= 60 && consistencyScore <= 0.6) {
      // Low performance, inconsistent - decrease difficulty
      recommendedLevel = Math.max(1, currentLevel - 1);
      adjustmentReason = 'Low performance - reducing difficulty for better success';
    } else if (averageScore >= 70 && masteryProgress >= 50) {
      // Good performance, decent mastery - slight increase
      if (currentLevel < 5) {
        recommendedLevel = currentLevel + 0.5; // Half-step increase
        adjustmentReason = 'Good performance - slight difficulty increase';
      }
    }
    
    const recommendation = {
      currentLevel,
      recommendedLevel: Math.round(recommendedLevel),
      adjustmentReason,
      confidence: calculateConfidenceScore(averageScore, consistencyScore, masteryProgress),
      performanceMetrics: {
        averageScore,
        consistencyScore,
        masteryProgress,
        sessionCount: recentSessions.length
      }
    };
    
    console.log('✅ Difficulty level determined:', recommendation);
    return recommendation;
    
  } catch (error) {
    console.error('❌ Error determining difficulty level:', error);
    return {
      currentLevel: performanceData.currentLevel,
      recommendedLevel: performanceData.currentLevel,
      adjustmentReason: 'Unable to determine - maintaining current level',
      confidence: 0.5,
      performanceMetrics: {}
    };
  }
};

/**
 * Generates progress insights for the learner
 * @param {Object} learnerData - Learner's complete data
 * @returns {Promise<Object>} - Generated insights
 */
export const generateProgressInsights = async (learnerData) => {
  try {
    console.log('💡 Generating progress insights with AI...');
    
    const prompt = `You are an expert educational AI generating personalized progress insights for a learner.

LEARNER DATA:
- Total Sessions: ${learnerData.totalSessions}
- Current Level: ${learnerData.currentLevel}/5
- Total Points: ${learnerData.totalPoints}
- Learning Streak: ${learnerData.streak} days
- Strengths: ${learnerData.strengths?.join(', ') || 'None identified'}
- Areas for Improvement: ${learnerData.needsWork?.join(', ') || 'None identified'}
- Recent Performance: ${learnerData.recentSessions?.map(s => `${s.topicName}: ${s.score}%`).join(', ') || 'No recent sessions'}

TOPIC MASTERY:
${learnerData.topicMastery?.map(topic => 
  `- ${topic.topicName}: Level ${topic.currentLevel}/5 (${topic.percentComplete}% complete)`
).join('\n') || 'No topic mastery data'}

Generate personalized insights in this JSON format:
{
  "overview": {
    "learningJourney": "Summary of learning progress",
    "achievements": ["achievement1", "achievement2"],
    "growthAreas": ["area1", "area2"],
    "overallAssessment": "Overall learning assessment"
  },
  "insights": [
    {
      "type": "strength",
      "title": "Insight Title",
      "description": "Detailed insight description",
      "actionable": "What the learner can do with this insight",
      "priority": "high/medium/low"
    }
  ],
  "recommendations": {
    "nextSteps": ["step1", "step2"],
    "focusAreas": ["area1", "area2"],
    "learningStrategy": "Recommended approach",
    "challenges": ["challenge1", "challenge2"]
  },
  "motivation": {
    "encouragement": "Encouraging message",
    "milestones": ["milestone1", "milestone2"],
    "celebration": "What to celebrate"
  }
}

Be encouraging, specific, and actionable. Focus on growth and positive reinforcement.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    console.log('📊 Progress insights response received');

    // Parse JSON response
    let insights;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      insights = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse progress insights:', parseError);
      // Fallback insights
      insights = {
        overview: {
          learningJourney: 'Making steady progress in social skills development',
          achievements: ['Completed practice sessions', 'Maintained learning streak'],
          growthAreas: ['Complex social situations', 'Advanced communication'],
          overallAssessment: 'Good progress with room for continued growth'
        },
        insights: [
          {
            type: 'strength',
            title: 'Consistent Learning',
            description: 'You\'ve been practicing regularly and building good habits.',
            actionable: 'Keep up the great work and try new challenges',
            priority: 'high'
          }
        ],
        recommendations: {
          nextSteps: ['Continue practicing', 'Try new topics'],
          focusAreas: ['Social awareness', 'Communication skills'],
          learningStrategy: 'Regular practice with varied scenarios',
          challenges: ['Practice with friends', 'Try new social situations']
        },
        motivation: {
          encouragement: 'You\'re doing great! Keep learning and growing.',
          milestones: ['Complete more sessions', 'Master new topics'],
          celebration: 'Your dedication to learning social skills'
        }
      };
    }

    console.log('✅ Progress insights generated successfully');
    return insights;

  } catch (error) {
    console.error('❌ Error generating progress insights:', error);
    throw new Error('Failed to generate progress insights');
  }
};

/**
 * Creates real-world challenges based on learner's needs
 * @param {Object} challengeData - Data for challenge generation
 * @returns {Promise<Object>} - Generated challenge
 */
export const createRealWorldChallenge = async (challengeData) => {
  try {
    console.log('🎪 Creating real-world challenge with AI...');
    
    const prompt = `You are an expert educational AI creating personalized real-world challenges for social skills practice.

LEARNER CONTEXT:
- Grade Level: ${challengeData.gradeLevel}
- Current Level: ${challengeData.currentLevel}/5
- Topic: ${challengeData.topicName}
- Strengths: ${challengeData.strengths?.join(', ') || 'None identified'}
- Areas for Improvement: ${challengeData.needsWork?.join(', ') || 'None identified'}
- Recent Performance: ${challengeData.recentPerformance || 'No recent data'}

Create a personalized real-world challenge in this JSON format:
{
  "challengeText": "Specific, actionable challenge description",
  "timeframe": "When to complete (e.g., 'this week', 'today', 'within 3 days')",
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2",
    "Helpful tip 3"
  ],
  "successCriteria": "How to know the challenge was successful",
  "difficulty": 1-5,
  "estimatedTime": "How long it should take",
  "materialsNeeded": ["item1", "item2"],
  "safetyNotes": "Any safety considerations",
  "followUpQuestions": [
    "Question to reflect on after completion",
    "Another reflection question"
  ],
  "encouragement": "Encouraging message to motivate the learner"
}

Make the challenge:
- Age-appropriate for ${challengeData.gradeLevel}
- Specific and actionable
- Safe and appropriate
- Connected to the topic: ${challengeData.topicName}
- Focused on areas needing improvement
- Encouraging and motivating

Avoid workplace scenarios - focus on school, home, and social situations.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    console.log('📊 Challenge creation response received');

    // Parse JSON response
    let challenge;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      challenge = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse challenge creation:', parseError);
      // Fallback challenge
      challenge = {
        challengeText: `Practice ${challengeData.topicName} with a friend or family member this week.`,
        timeframe: 'this week',
        tips: [
          'Start with someone you feel comfortable with',
          'Be patient with yourself',
          'Remember that practice makes perfect'
        ],
        successCriteria: 'You tried the skill and learned something new',
        difficulty: challengeData.currentLevel,
        estimatedTime: '15-30 minutes',
        materialsNeeded: [],
        safetyNotes: 'Make sure you\'re in a safe, comfortable environment',
        followUpQuestions: [
          'How did it go?',
          'What did you learn?'
        ],
        encouragement: 'You\'ve got this! Every practice helps you improve.'
      };
    }

    console.log('✅ Real-world challenge created successfully');
    return challenge;

  } catch (error) {
    console.error('❌ Error creating real-world challenge:', error);
    throw new Error('Failed to create real-world challenge');
  }
};

/**
 * Helper function to calculate consistency score
 * @param {Array} sessions - Array of recent sessions
 * @returns {number} - Consistency score (0-1)
 */
const calculateConsistencyScore = (sessions) => {
  if (sessions.length < 2) return 0.5;
  
  const scores = sessions.map(s => s.score);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  return Math.max(0, 1 - (standardDeviation / 50));
};

/**
 * Helper function to calculate confidence score
 * @param {number} averageScore - Average score
 * @param {number} consistencyScore - Consistency score
 * @param {number} masteryProgress - Mastery progress percentage
 * @returns {number} - Confidence score (0-1)
 */
const calculateConfidenceScore = (averageScore, consistencyScore, masteryProgress) => {
  const scoreWeight = averageScore / 100;
  const consistencyWeight = consistencyScore;
  const masteryWeight = masteryProgress / 100;
  
  return (scoreWeight * 0.4 + consistencyWeight * 0.3 + masteryWeight * 0.3);
};

/**
 * Determines if a learner is eligible for a badge
 * @param {string} badgeId - Badge identifier
 * @param {Object} learnerData - Learner's data
 * @returns {boolean} - Whether learner is eligible
 */
export const checkBadgeEligibility = (badgeId, learnerData) => {
  const badge = BADGE_DEFINITIONS[badgeId.toUpperCase()];
  if (!badge) return false;
  
  switch (badgeId) {
    case 'first_session':
      return learnerData.totalSessions >= 1;
    case 'streak_master':
      return learnerData.streak >= 7;
    case 'high_score_master':
      return learnerData.recentSessions?.some(s => s.score >= 90);
    case 'practice_champion':
      return learnerData.totalSessions >= 10;
    case 'topic_expert':
      return learnerData.topicMastery?.some(t => t.currentLevel >= 5);
    case 'challenge_completer':
      return learnerData.completedChallenges >= 1;
    default:
      return false;
  }
};

/**
 * Generates personalized learning recommendations
 * @param {Object} learnerData - Learner's complete data
 * @returns {Object} - Learning recommendations
 */
export const generateLearningRecommendations = (learnerData) => {
  const recommendations = {
    nextTopics: [],
    practiceFocus: [],
    learningStrategy: 'Continue regular practice',
    difficultyAdjustment: 'maintain',
    challenges: []
  };
  
  // Analyze topic mastery to recommend next topics
  if (learnerData.topicMastery) {
    const lowMasteryTopics = learnerData.topicMastery
      .filter(topic => topic.percentComplete < 50)
      .sort((a, b) => a.percentComplete - b.percentComplete)
      .slice(0, 3)
      .map(topic => topic.topicName);
    
    recommendations.nextTopics = lowMasteryTopics;
  }
  
  // Analyze weaknesses for practice focus
  if (learnerData.needsWork && learnerData.needsWork.length > 0) {
    recommendations.practiceFocus = learnerData.needsWork.slice(0, 3);
  }
  
  // Determine learning strategy based on performance
  const averageScore = learnerData.recentSessions?.reduce((sum, s) => sum + s.score, 0) / learnerData.recentSessions.length || 0;
  
  if (averageScore >= 85) {
    recommendations.learningStrategy = 'Ready for advanced challenges';
    recommendations.difficultyAdjustment = 'increase';
  } else if (averageScore <= 60) {
    recommendations.learningStrategy = 'Focus on fundamentals and practice';
    recommendations.difficultyAdjustment = 'decrease';
  }
  
  return recommendations;
};

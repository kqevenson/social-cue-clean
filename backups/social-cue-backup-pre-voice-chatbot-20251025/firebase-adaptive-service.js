// Firebase Adaptive Service - Firestore Operations for Adaptive Learning
// This file contains all Firebase Firestore operations for the adaptive learning system

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';
import {
  LEARNER_PROFILE_SCHEMA,
  TOPIC_MASTERY_SCHEMA,
  SESSION_HISTORY_SCHEMA,
  REAL_WORLD_CHALLENGE_SCHEMA,
  ADAPTIVE_SETTINGS_SCHEMA,
  PROGRESS_INSIGHTS_SCHEMA,
  ANALYTICS_SCHEMA,
  DEFAULT_VALUES,
  validateLearnerProfile,
  validateTopicMastery,
  validateSessionHistory,
  validateChallenge
} from './adaptive-learning-schema.js';

dotenv.config();

// Get existing Firebase app or create new one
let db;
try {
  // Try to get existing Firebase app
  const existingApp = getApp();
  db = getFirestore(existingApp);
} catch (error) {
  // If no existing app, create new one
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  
  const adaptiveFirebaseApp = initializeApp(firebaseConfig, 'AdaptiveLearning');
  db = getFirestore(adaptiveFirebaseApp);
}

/**
 * Cleans data for Firebase by removing undefined values
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object without undefined values
 */
const cleanFirebaseData = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// ============================================================================
// LEARNER PROFILE OPERATIONS
// ============================================================================

/**
 * Creates a new learner profile
 * @param {Object} profileData - Learner profile data
 * @returns {Promise<string>} - The ID of the created profile
 */
export const createLearnerProfile = async (profileData) => {
  try {
    console.log('👤 Creating learner profile:', profileData.learnerId);
    
    const profile = {
      ...DEFAULT_VALUES.LEARNER_PROFILE,
      ...profileData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const cleanedProfile = cleanFirebaseData(profile);
    
    if (!validateLearnerProfile(cleanedProfile)) {
      throw new Error('Invalid learner profile data');
    }
    
    const profileRef = doc(db, 'LEARNER_PROFILES', profileData.learnerId);
    await setDoc(profileRef, cleanedProfile);
    
    console.log('✅ Learner profile created successfully');
    return profileData.learnerId;
    
  } catch (error) {
    console.error('❌ Error creating learner profile:', error);
    throw error;
  }
};

/**
 * Gets a learner profile by ID
 * @param {string} learnerId - Learner ID
 * @returns {Promise<Object|null>} - Learner profile or null if not found
 */
export const getLearnerProfile = async (learnerId) => {
  try {
    console.log('👤 Getting learner profile:', learnerId);
    
    const profileRef = doc(db, 'LEARNER_PROFILES', learnerId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const profile = profileSnap.data();
      console.log('✅ Learner profile retrieved successfully');
      return profile;
    } else {
      console.log('ℹ️ Learner profile not found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error getting learner profile:', error);
    throw error;
  }
};

/**
 * Updates a learner profile
 * @param {string} learnerId - Learner ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateLearnerProfile = async (learnerId, updateData) => {
  try {
    console.log('👤 Updating learner profile:', learnerId);
    
    const profileRef = doc(db, 'LEARNER_PROFILES', learnerId);
    const cleanedData = cleanFirebaseData({
      ...updateData,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(profileRef, cleanedData);
    console.log('✅ Learner profile updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating learner profile:', error);
    throw error;
  }
};

/**
 * Updates learner progress (points, streak, sessions)
 * @param {string} learnerId - Learner ID
 * @param {Object} progressData - Progress data to update
 * @returns {Promise<void>}
 */
export const updateLearnerProgress = async (learnerId, progressData) => {
  try {
    console.log('📈 Updating learner progress:', learnerId);
    
    // Check if profile exists, create if not
    let profile = await getLearnerProfile(learnerId);
    if (!profile) {
      console.log('👤 Profile not found, creating new one');
      await createLearnerProfile({
        learnerId,
        userId: progressData.userId || learnerId,
        ...progressData
      });
      return;
    }
    
    const profileRef = doc(db, 'LEARNER_PROFILES', learnerId);
    const updateData = {
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add progress fields if provided
    if (progressData.pointsEarned) {
      updateData.totalPoints = increment(progressData.pointsEarned);
    }
    if (progressData.incrementSessions) {
      updateData.totalSessions = increment(1);
    }
    if (progressData.updateStreak) {
      updateData.streak = progressData.newStreak || 0;
    }
    if (progressData.newLevel) {
      updateData.currentLevel = progressData.newLevel;
    }
    if (progressData.addBadge) {
      updateData.badges = [...(profile.badges || []), progressData.addBadge];
    }
    if (progressData.updateStrengths) {
      updateData.strengths = progressData.updateStrengths;
    }
    if (progressData.updateNeedsWork) {
      updateData.needsWork = progressData.updateNeedsWork;
    }
    
    await updateDoc(profileRef, updateData);
    console.log('✅ Learner progress updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating learner progress:', error);
    throw error;
  }
};

// ============================================================================
// TOPIC MASTERY OPERATIONS
// ============================================================================

/**
 * Creates or updates topic mastery
 * @param {Object} masteryData - Topic mastery data
 * @returns {Promise<string>} - Mastery record ID
 */
export const upsertTopicMastery = async (masteryData) => {
  try {
    console.log('📚 Upserting topic mastery:', masteryData.topicName);
    
    const masteryId = `${masteryData.learnerId}_${masteryData.topicId}`;
    const masteryRef = doc(db, 'TOPIC_MASTERY', masteryId);
    
    const masterySnap = await getDoc(masteryRef);
    
    if (masterySnap.exists()) {
      // Update existing mastery
      const updateData = cleanFirebaseData({
        ...masteryData,
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(masteryRef, updateData);
      console.log('✅ Topic mastery updated successfully');
    } else {
      // Create new mastery record
      const newMastery = {
        ...DEFAULT_VALUES.TOPIC_MASTERY,
        ...masteryData,
        masteryId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const cleanedMastery = cleanFirebaseData(newMastery);
      
      if (!validateTopicMastery(cleanedMastery)) {
        throw new Error('Invalid topic mastery data');
      }
      
      await setDoc(masteryRef, cleanedMastery);
      console.log('✅ Topic mastery created successfully');
    }
    
    return masteryId;
    
  } catch (error) {
    console.error('❌ Error upserting topic mastery:', error);
    throw error;
  }
};

/**
 * Gets topic mastery for a learner
 * @param {string} learnerId - Learner ID
 * @param {string} topicId - Topic ID (optional)
 * @returns {Promise<Array|Object>} - Topic mastery data
 */
export const getTopicMastery = async (learnerId, topicId = null) => {
  try {
    console.log('📚 Getting topic mastery:', learnerId, topicId ? `for topic ${topicId}` : 'all topics');
    
    if (topicId) {
      const masteryId = `${learnerId}_${topicId}`;
      const masteryRef = doc(db, 'TOPIC_MASTERY', masteryId);
      const masterySnap = await getDoc(masteryRef);
      
      if (masterySnap.exists()) {
        console.log('✅ Topic mastery retrieved successfully');
        return masterySnap.data();
      } else {
        console.log('ℹ️ Topic mastery not found');
        return null;
      }
    } else {
      const masteryQuery = query(
        collection(db, 'TOPIC_MASTERY'),
        where('learnerId', '==', learnerId),
        orderBy('updatedAt', 'desc')
      );
      
      const masterySnap = await getDocs(masteryQuery);
      const masteryData = masterySnap.docs.map(doc => doc.data());
      
      console.log('✅ All topic mastery retrieved successfully');
      return masteryData;
    }
    
  } catch (error) {
    console.error('❌ Error getting topic mastery:', error);
    throw error;
  }
};

// ============================================================================
// SESSION HISTORY OPERATIONS
// ============================================================================

/**
 * Saves a session to history
 * @param {Object} sessionData - Session data
 * @returns {Promise<string>} - Session ID
 */
export const saveSessionHistory = async (sessionData) => {
  try {
    console.log('📝 Saving session history:', sessionData.sessionId);
    
    const session = {
      ...sessionData,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp()
    };
    
    const cleanedSession = cleanFirebaseData(session);
    
    if (!validateSessionHistory(cleanedSession)) {
      throw new Error('Invalid session data');
    }
    
    const sessionRef = doc(db, 'SESSION_HISTORY', sessionData.sessionId);
    await setDoc(sessionRef, cleanedSession);
    
    console.log('✅ Session history saved successfully');
    return sessionData.sessionId;
    
  } catch (error) {
    console.error('❌ Error saving session history:', error);
    throw error;
  }
};

/**
 * Gets session history for a learner
 * @param {string} learnerId - Learner ID
 * @param {number} limitCount - Number of sessions to retrieve (default: 50)
 * @returns {Promise<Array>} - Session history
 */
export const getSessionHistory = async (learnerId, limitCount = 50) => {
  try {
    console.log('📝 Getting session history:', learnerId);
    
    // Query without orderBy to avoid index requirement
    const sessionQuery = query(
      collection(db, 'SESSION_HISTORY'),
      where('learnerId', '==', learnerId),
      limit(limitCount)
    );
    
    const sessionSnap = await getDocs(sessionQuery);
    const sessions = sessionSnap.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));
    
    // Sort by completedAt in JavaScript instead of Firestore
    sessions.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.date || 0);
      const dateB = new Date(b.completedAt || b.date || 0);
      return dateB - dateA; // Most recent first
    });
    
    console.log('✅ Session history retrieved successfully:', sessions.length, 'sessions');
    return sessions;
    
  } catch (error) {
    console.error('❌ Error getting session history:', error);
    throw error;
  }
};

/**
 * Gets session statistics for a learner
 * @param {string} learnerId - Learner ID
 * @returns {Promise<Object>} - Session statistics
 */
export const getSessionStats = async (learnerId) => {
  try {
    console.log('📊 Getting session statistics:', learnerId);
    
    const sessions = await getSessionHistory(learnerId, 100);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalPoints: 0,
        bestScore: 0,
        recentPerformance: []
      };
    }
    
    const stats = {
      totalSessions: sessions.length,
      averageScore: sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length,
      totalTimeSpent: sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
      totalPoints: sessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0),
      bestScore: Math.max(...sessions.map(s => s.score)),
      recentPerformance: sessions.slice(0, 10).map(s => ({
        topicName: s.topicName,
        score: s.score,
        completedAt: s.completedAt
      }))
    };
    
    console.log('✅ Session statistics calculated successfully');
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting session statistics:', error);
    throw error;
  }
};

// ============================================================================
// REAL-WORLD CHALLENGE OPERATIONS
// ============================================================================

/**
 * Creates a new real-world challenge
 * @param {Object} challengeData - Challenge data
 * @returns {Promise<string>} - Challenge ID
 */
export const createRealWorldChallenge = async (challengeData) => {
  try {
    console.log('🎪 Creating real-world challenge:', challengeData.topicName);
    
    const challenge = {
      ...challengeData,
      status: 'active',
      attempts: [],
      attemptCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const cleanedChallenge = cleanFirebaseData(challenge);
    
    if (!validateChallenge(cleanedChallenge)) {
      throw new Error('Invalid challenge data');
    }
    
    const challengeRef = await addDoc(collection(db, 'real_world_challenges'), cleanedChallenge);
    
    console.log('✅ Real-world challenge created successfully');
    return challengeRef.id;
    
  } catch (error) {
    console.error('❌ Error creating real-world challenge:', error);
    throw error;
  }
};

/**
 * Gets active challenges for a learner
 * @param {string} learnerId - Learner ID
 * @returns {Promise<Array>} - Active challenges
 */
export const getActiveChallenges = async (learnerId) => {
  try {
    console.log('🎪 Getting active challenges:', learnerId);
    
    const challengeQuery = query(
      collection(db, 'real_world_challenges'),
      where('learnerId', '==', learnerId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const challengeSnap = await getDocs(challengeQuery);
    const challenges = challengeSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Active challenges retrieved successfully');
    return challenges;
    
  } catch (error) {
    console.error('❌ Error getting active challenges:', error);
    throw error;
  }
};

/**
 * Updates a challenge (logs attempt or marks complete)
 * @param {string} challengeId - Challenge ID
 * @param {Object} updateData - Update data
 * @returns {Promise<void>}
 */
export const updateChallenge = async (challengeId, updateData) => {
  try {
    console.log('🎪 Updating challenge:', challengeId);
    
    const challengeRef = doc(db, 'real_world_challenges', challengeId);
    const cleanedData = cleanFirebaseData({
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(challengeRef, cleanedData);
    console.log('✅ Challenge updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating challenge:', error);
    throw error;
  }
};

/**
 * Logs an attempt for a challenge
 * @param {string} challengeId - Challenge ID
 * @param {Object} attemptData - Attempt data
 * @returns {Promise<void>}
 */
export const logChallengeAttempt = async (challengeId, attemptData) => {
  try {
    console.log('🎯 Logging challenge attempt:', challengeId);
    
    const challengeRef = doc(db, 'real_world_challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    
    if (!challengeSnap.exists()) {
      throw new Error('Challenge not found');
    }
    
    const challenge = challengeSnap.data();
    const currentAttempts = challenge.attempts || [];
    
    const newAttempt = {
      timestamp: serverTimestamp(),
      notes: attemptData.notes || null,
      attemptNumber: currentAttempts.length + 1
    };
    
    await updateDoc(challengeRef, {
      attempts: [...currentAttempts, newAttempt],
      attemptCount: currentAttempts.length + 1,
      lastAttemptAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Challenge attempt logged successfully');
    
  } catch (error) {
    console.error('❌ Error logging challenge attempt:', error);
    throw error;
  }
};

/**
 * Marks a challenge as complete
 * @param {string} challengeId - Challenge ID
 * @param {Object} completionData - Completion data
 * @returns {Promise<void>}
 */
export const completeChallenge = async (challengeId, completionData) => {
  try {
    console.log('🎉 Completing challenge:', challengeId);
    
    const challengeRef = doc(db, 'real_world_challenges', challengeId);
    
    await updateDoc(challengeRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      completionNotes: completionData.notes || null,
      pointsAwarded: completionData.pointsAwarded || 0,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Challenge completed successfully');
    
  } catch (error) {
    console.error('❌ Error completing challenge:', error);
    throw error;
  }
};

// ============================================================================
// ADAPTIVE SETTINGS OPERATIONS
// ============================================================================

/**
 * Gets adaptive settings for a learner
 * @param {string} learnerId - Learner ID
 * @returns {Promise<Object>} - Adaptive settings
 */
export const getAdaptiveSettings = async (learnerId) => {
  try {
    console.log('⚙️ Getting adaptive settings:', learnerId);
    
    const settingsRef = doc(db, 'ADAPTIVE_SETTINGS', learnerId);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      console.log('✅ Adaptive settings retrieved successfully');
      return settingsSnap.data();
    } else {
      // Return default settings
      console.log('ℹ️ Using default adaptive settings');
      return DEFAULT_VALUES.ADAPTIVE_SETTINGS;
    }
    
  } catch (error) {
    console.error('❌ Error getting adaptive settings:', error);
    throw error;
  }
};

/**
 * Updates adaptive settings for a learner
 * @param {string} learnerId - Learner ID
 * @param {Object} settingsData - Settings data
 * @returns {Promise<void>}
 */
export const updateAdaptiveSettings = async (learnerId, settingsData) => {
  try {
    console.log('⚙️ Updating adaptive settings:', learnerId);
    
    const settingsRef = doc(db, 'ADAPTIVE_SETTINGS', learnerId);
    const cleanedData = cleanFirebaseData({
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    
    await setDoc(settingsRef, cleanedData, { merge: true });
    console.log('✅ Adaptive settings updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating adaptive settings:', error);
    throw error;
  }
};

// ============================================================================
// PROGRESS INSIGHTS OPERATIONS
// ============================================================================

/**
 * Saves progress insights
 * @param {Object} insightData - Insight data
 * @returns {Promise<string>} - Insight ID
 */
export const saveProgressInsight = async (insightData) => {
  try {
    console.log('💡 Saving progress insight:', insightData.insightType);
    
    const insight = {
      ...insightData,
      isRead: false,
      createdAt: serverTimestamp(),
      expiresAt: insightData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    const cleanedInsight = cleanFirebaseData(insight);
    
    const insightRef = await addDoc(collection(db, 'PROGRESS_INSIGHTS'), cleanedInsight);
    
    console.log('✅ Progress insight saved successfully');
    return insightRef.id;
    
  } catch (error) {
    console.error('❌ Error saving progress insight:', error);
    throw error;
  }
};

/**
 * Gets progress insights for a learner
 * @param {string} learnerId - Learner ID
 * @param {boolean} unreadOnly - Whether to get only unread insights
 * @returns {Promise<Array>} - Progress insights
 */
export const getProgressInsights = async (learnerId, unreadOnly = false) => {
  try {
    console.log('💡 Getting progress insights:', learnerId);
    
    let insightQuery = query(
      collection(db, 'PROGRESS_INSIGHTS'),
      where('learnerId', '==', learnerId),
      orderBy('createdAt', 'desc')
    );
    
    if (unreadOnly) {
      insightQuery = query(
        collection(db, 'PROGRESS_INSIGHTS'),
        where('learnerId', '==', learnerId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
    }
    
    const insightSnap = await getDocs(insightQuery);
    const insights = insightSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Progress insights retrieved successfully');
    return insights;
    
  } catch (error) {
    console.error('❌ Error getting progress insights:', error);
    throw error;
  }
};

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

/**
 * Generates and saves analytics for a learner
 * @param {string} learnerId - Learner ID
 * @param {string} period - Time period (daily, weekly, monthly)
 * @returns {Promise<string>} - Analytics ID
 */
export const generateAnalytics = async (learnerId, period = 'weekly') => {
  try {
    console.log('📊 Generating analytics:', learnerId, period);
    
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    // Get session data for the period
    const sessions = await getSessionHistory(learnerId, 1000);
    const periodSessions = sessions.filter(session => {
      const sessionDate = session.completedAt?.toDate() || new Date(session.completedAt);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    // Get topic mastery data
    const topicMastery = await getTopicMastery(learnerId);
    
    // Calculate analytics
    const analytics = {
      learnerId,
      period,
      startDate: startDate,
      endDate: endDate,
      totalSessions: periodSessions.length,
      totalTimeSpent: periodSessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
      averageScore: periodSessions.length > 0 ? 
        periodSessions.reduce((sum, s) => sum + s.score, 0) / periodSessions.length : 0,
      topicsPracticed: [...new Set(periodSessions.map(s => s.topicName))],
      difficultyProgression: periodSessions.map(s => ({
        date: s.completedAt,
        difficulty: s.difficulty,
        score: s.score
      })),
      strengths: topicMastery.flatMap(t => t.strengths || []),
      weaknesses: topicMastery.flatMap(t => t.needsWork || []),
      achievements: [], // TODO: Calculate achievements
      challengesCompleted: 0, // TODO: Get from challenges
      engagementScore: calculateEngagementScore(periodSessions),
      learningVelocity: calculateLearningVelocity(periodSessions),
      createdAt: serverTimestamp()
    };
    
    const analyticsRef = await addDoc(collection(db, 'ANALYTICS'), analytics);
    
    console.log('✅ Analytics generated successfully');
    return analyticsRef.id;
    
  } catch (error) {
    console.error('❌ Error generating analytics:', error);
    throw error;
  }
};

/**
 * Gets analytics for a learner
 * @param {string} learnerId - Learner ID
 * @param {string} period - Time period (optional)
 * @returns {Promise<Array>} - Analytics data
 */
export const getAnalytics = async (learnerId, period = null) => {
  try {
    console.log('📊 Getting analytics:', learnerId, period ? `for ${period}` : 'all periods');
    
    let analyticsQuery = query(
      collection(db, 'ANALYTICS'),
      where('learnerId', '==', learnerId),
      orderBy('createdAt', 'desc')
    );
    
    if (period) {
      analyticsQuery = query(
        collection(db, 'ANALYTICS'),
        where('learnerId', '==', learnerId),
        where('period', '==', period),
        orderBy('createdAt', 'desc')
      );
    }
    
    const analyticsSnap = await getDocs(analyticsQuery);
    const analytics = analyticsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Analytics retrieved successfully');
    return analytics;
    
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates engagement score based on session data
 * @param {Array} sessions - Session data
 * @returns {number} - Engagement score (0-100)
 */
const calculateEngagementScore = (sessions) => {
  if (sessions.length === 0) return 0;
  
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const avgTime = sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / sessions.length;
  const consistency = calculateConsistency(sessions.map(s => s.score));
  
  // Weighted engagement score
  return Math.round((avgScore * 0.5 + consistency * 0.3 + Math.min(avgTime / 300, 1) * 0.2) * 100);
};

/**
 * Calculates learning velocity
 * @param {Array} sessions - Session data
 * @returns {number} - Learning velocity score
 */
const calculateLearningVelocity = (sessions) => {
  if (sessions.length < 2) return 0;
  
  const scores = sessions.map(s => s.score);
  const improvement = scores[scores.length - 1] - scores[0];
  const timeSpan = sessions.length; // sessions as time units
  
  return Math.round((improvement / timeSpan) * 100);
};

/**
 * Calculates consistency score
 * @param {Array} values - Array of values
 * @returns {number} - Consistency score (0-1)
 */
const calculateConsistency = (values) => {
  if (values.length < 2) return 0.5;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  return Math.max(0, 1 - (standardDeviation / 50));
};

/**
 * Batch operations for multiple updates
 * @param {Array} operations - Array of operations to perform
 * @returns {Promise<void>}
 */
export const performBatchOperations = async (operations) => {
  try {
    console.log('🔄 Performing batch operations:', operations.length);
    
    const batch = writeBatch(db);
    
    operations.forEach(operation => {
      const { type, ref, data } = operation;
      
      switch (type) {
        case 'set':
          batch.set(ref, data);
          break;
        case 'update':
          batch.update(ref, data);
          break;
        case 'delete':
          batch.delete(ref);
          break;
        default:
          throw new Error(`Unknown batch operation type: ${type}`);
      }
    });
    
    await batch.commit();
    console.log('✅ Batch operations completed successfully');
    
  } catch (error) {
    console.error('❌ Error performing batch operations:', error);
    throw error;
  }
};

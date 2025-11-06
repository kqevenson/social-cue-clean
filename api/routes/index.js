/**
 * Routes Index - Centralized Route Exports
 * 
 * Exports all API routes for the Social Cue application
 * 
 * @module routes
 */

import express from 'express';
import voiceRoutes from './voiceRoutes.js';
import adaptiveLearningRoutes from '../../adaptive-learning-routes.js';

const router = express.Router();

/**
 * Mount all route modules
 */

// Voice chatbot routes
router.use('/voice', voiceRoutes);

// Adaptive learning routes (existing)
router.use('/adaptive', adaptiveLearningRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'Server is running!',
    timestamp: new Date().toISOString(),
    routes: {
      voice: '/api/voice',
      adaptive: '/api/adaptive'
    }
  });
});

export default router;


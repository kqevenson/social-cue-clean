// ---------------------------------------------------------------------------
// adaptive-learning-routes.js
// Social Cue — Adaptive Learning API Routes (Modular Architecture)
// ---------------------------------------------------------------------------

import express from "express";
import {
  validateEvaluationInput,
  validateSessionCompletionInput
} from "./adaptive-learning-schema.js";

import {
  evaluateSingleResponse,
  analyzeCompletedSession,
  recommendNextSession,
  generateProgressInsights,
  getMasteryDashboard,
  generateRealWorldChallenge,
  completeRealWorldChallenge
} from "./adaptive-learning-engine.js";

import {
  saveSessionToHistory,
  saveChallenge,
  updateChallengeStatus,
  getActiveChallenges,
  getUserMastery,
  saveSessionAdaptiveAnalytics
} from "./firebase-adaptive-service.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Adaptive learning routes OK" });
});

// ---------------------------------------------------------------------------
// 1. EVALUATE A SINGLE RESPONSE
// ---------------------------------------------------------------------------
router.post("/evaluate-response", async (req, res) => {
  try {
    const validation = validateEvaluationInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const evaluation = await evaluateSingleResponse(req.body);

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("❌ evaluate-response error:", error);
    res.status(500).json({
      success: false,
      error: "Error evaluating response",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 2. COMPLETE SESSION (FULL ANALYSIS)
// ---------------------------------------------------------------------------
router.post("/complete-session", async (req, res) => {
  try {
    const validation = validateSessionCompletionInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Run AI-powered analysis
    const analysis = await analyzeCompletedSession(req.body);

    // Save to session_history
    await saveSessionToHistory({
      ...req.body,
      aiAnalysis: analysis,
    });

    // Save adaptive analytics (mastery, difficulty changes, etc.)
    await saveSessionAdaptiveAnalytics(req.body.learnerId, analysis);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("❌ complete-session error:", error);
    res.status(500).json({
      success: false,
      error: "Error completing session",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 3. NEXT SESSION RECOMMENDATION
// ---------------------------------------------------------------------------
router.get("/next-session/:userId/:topicId", async (req, res) => {
  try {
    const { userId, topicId } = req.params;

    const recommendation = await recommendNextSession(userId, topicId);

    res.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("❌ next-session error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching next session recommendations",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 4. PROGRESS INSIGHTS (AI + FIREBASE)
// ---------------------------------------------------------------------------
router.get("/progress-insights/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const insights = await generateProgressInsights(userId);

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("❌ progress-insights error:", error);
    res.status(500).json({
      success: false,
      error: "Error generating progress insights",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 5. MASTERY DASHBOARD
// ---------------------------------------------------------------------------
router.get("/mastery-dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const dashboard = await getMasteryDashboard(userId);

    res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("❌ mastery-dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching mastery dashboard",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 6. GENERATE REAL-WORLD CHALLENGE
// ---------------------------------------------------------------------------
router.post("/generate-challenge", async (req, res) => {
  try {
    const challenge = await generateRealWorldChallenge(req.body);

    // Save challenge in Firebase
    await saveChallenge(challenge);

    res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("❌ generate-challenge error:", error);
    res.status(500).json({
      success: false,
      error: "Error generating challenge",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 7. GET ACTIVE CHALLENGES
// ---------------------------------------------------------------------------
router.get("/active-challenges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const active = await getActiveChallenges(userId);

    res.json({
      success: true,
      challenges: active,
    });
  } catch (error) {
    console.error("❌ active-challenges error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching active challenges",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 8. COMPLETE A REAL-WORLD CHALLENGE
// ---------------------------------------------------------------------------
router.post("/complete-challenge", async (req, res) => {
  try {
    const { challengeId, learnerId } = req.body;

    const result = await completeRealWorldChallenge(challengeId, learnerId);

    // Update Firebase
    await updateChallengeStatus(challengeId, learnerId);

    res.json({
      success: true,
      completion: result,
    });
  } catch (error) {
    console.error("❌ complete-challenge error:", error);
    res.status(500).json({
      success: false,
      error: "Error completing challenge",
      details: error.message,
    });
  }
});

export default router;

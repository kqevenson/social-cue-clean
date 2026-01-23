// backend/routes/sandbox.js
// Social Sandbox API endpoints

import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import {
  buildMessagePrompt,
  getSafetyCheckPrompt,
  getSessionSummaryPrompt,
  getModeEntryMessage
} from "../services/sandboxPromptService.js";

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Firebase config (reuse if already initialized)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Get or create Firebase app
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig, 'sandbox');
} else {
  firebaseApp = getApps()[0];
}
const db = getFirestore(firebaseApp);

console.log("🧪 Sandbox routes loaded");

/**
 * POST /api/sandbox/start
 * Start a new sandbox session
 */
router.post("/start", async (req, res) => {
  try {
    const { learnerId, mode, gradeLevel, inputMode = 'text', moodCheckIn = null } = req.body;

    if (!learnerId || !mode || !gradeLevel) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: learnerId, mode, gradeLevel"
      });
    }

    // Generate session ID
    const sessionId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get entry message for the mode
    const entryMessage = getModeEntryMessage(mode, gradeLevel, moodCheckIn);

    // Create session document
    const sessionData = {
      sessionId,
      learnerId,
      mode,
      gradeLevel,
      inputMode,
      moodCheckIn,
      startedAt: serverTimestamp(),
      endedAt: null,
      duration: 0,
      messages: [
        {
          role: 'ai',
          text: entryMessage,
          timestamp: Date.now()
        }
      ],
      safetyFlags: [],
      summary: null,
      accessControl: {
        learnerCanView: true,
        parentCanView: false,
        teacherCanView: false,
        shareWithAdult: false
      }
    };

    // Save to Firestore
    await setDoc(doc(db, "sandbox_sessions", sessionId), sessionData);

    console.log(`🧪 Sandbox session started: ${sessionId} (${mode} mode, ${gradeLevel})`);

    res.json({
      success: true,
      sessionId,
      entryMessage,
      mode,
      gradeLevel
    });

  } catch (error) {
    console.error("❌ Sandbox start error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sandbox/message
 * Send a message and get AI response with bidirectional framing
 */
router.post("/message", async (req, res) => {
  try {
    const { sessionId, message, emotionData = null } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sessionId, message"
      });
    }

    // Get session from Firestore
    const sessionRef = doc(db, "sandbox_sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    const session = sessionSnap.data();

    // Run safety check first
    const safetyResult = await checkMessageSafety(message, session.messages);

    // Add user message to history
    const userMessage = {
      role: 'student',
      text: message,
      timestamp: Date.now(),
      emotion: emotionData?.dominant?.name || null,
      safetyLevel: safetyResult.level
    };

    // Build prompt for Claude
    const { systemPrompt, messages: formattedMessages } = buildMessagePrompt(
      session.mode,
      session.gradeLevel,
      session.messages,
      message,
      emotionData
    );

    // Get AI response
    let aiResponseText;
    try {
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: formattedMessages
      });
      aiResponseText = claudeResponse.content[0].text;
    } catch (apiError) {
      console.error("❌ Claude API error:", apiError.message);

      // Check if it's an authentication error
      if (apiError.status === 401 || apiError.message?.includes('authentication') || apiError.message?.includes('api-key')) {
        return res.status(500).json({
          success: false,
          error: "AI service configuration error. Please check your API key.",
          details: "The Anthropic API key may be invalid or expired."
        });
      }

      // For other API errors, provide a fallback response
      aiResponseText = "I hear you. Tell me more about what's going on.";
    }

    // Create AI message
    const aiMessage = {
      role: 'ai',
      text: aiResponseText,
      timestamp: Date.now()
    };

    // Update session with new messages
    const updatedMessages = [...session.messages, userMessage, aiMessage];

    // Handle safety alerts
    let safetyFlags = session.safetyFlags || [];
    if (safetyResult.level === 'alert' || safetyResult.level === 'monitor') {
      safetyFlags.push({
        level: safetyResult.level,
        reason: safetyResult.reason,
        messageIndex: updatedMessages.length - 2, // Index of user message
        timestamp: Date.now()
      });
    }

    // Update Firestore
    await updateDoc(sessionRef, {
      messages: updatedMessages,
      safetyFlags
    });

    // If alert level, trigger parent/teacher notification
    if (safetyResult.level === 'alert') {
      await triggerSafetyAlert(session, message, safetyResult);
    }

    console.log(`🧪 Sandbox message processed: ${sessionId} (safety: ${safetyResult.level})`);

    res.json({
      success: true,
      response: aiResponseText,
      safetyLevel: safetyResult.level,
      supportiveMessage: safetyResult.level === 'alert' ? safetyResult.supportiveResponse : null
    });

  } catch (error) {
    console.error("❌ Sandbox message error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sandbox/end
 * End session and generate summary
 */
router.post("/end", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId"
      });
    }

    // Get session
    const sessionRef = doc(db, "sandbox_sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    const session = sessionSnap.data();

    // Calculate duration
    const startTime = session.startedAt?.toDate?.() || new Date(session.startedAt);
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);

    // Generate summary using Claude
    let summary = null;
    if (session.messages.length > 2) {
      summary = await generateSessionSummary(session);
    }

    // Update session
    await updateDoc(sessionRef, {
      endedAt: serverTimestamp(),
      duration,
      summary
    });

    console.log(`🧪 Sandbox session ended: ${sessionId} (${duration}s)`);

    res.json({
      success: true,
      duration,
      summary,
      messageCount: session.messages.length
    });

  } catch (error) {
    console.error("❌ Sandbox end error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sandbox/sessions/:learnerId
 * Get sessions for a learner (with access control)
 */
router.get("/sessions/:learnerId", async (req, res) => {
  try {
    const { learnerId } = req.params;
    const { role = 'learner' } = req.query; // learner, parent, or teacher

    const sessionsRef = collection(db, "sandbox_sessions");
    const q = query(sessionsRef, where("learnerId", "==", learnerId));
    const snapshot = await getDocs(q);

    const sessions = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Apply access control
      if (role === 'learner' && data.accessControl?.learnerCanView) {
        sessions.push({
          sessionId: data.sessionId,
          mode: data.mode,
          startedAt: data.startedAt,
          duration: data.duration,
          summary: data.summary,
          messageCount: data.messages?.length || 0
        });
      } else if (role === 'parent') {
        // Parents only see sessions with alerts OR if student shared
        if (data.safetyFlags?.some(f => f.level === 'alert') || data.accessControl?.shareWithAdult) {
          sessions.push({
            sessionId: data.sessionId,
            mode: data.mode,
            startedAt: data.startedAt,
            hasAlert: data.safetyFlags?.some(f => f.level === 'alert'),
            summary: data.accessControl?.shareWithAdult ? data.summary : null
          });
        }
      }
    });

    res.json({
      success: true,
      sessions: sessions.sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0))
    });

  } catch (error) {
    console.error("❌ Sandbox sessions fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sandbox/share
 * Student opts to share a session with parent/teacher
 */
router.post("/share", async (req, res) => {
  try {
    const { sessionId, shareWith = 'parent' } = req.body;

    const sessionRef = doc(db, "sandbox_sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    // Update access control
    const updates = {
      'accessControl.shareWithAdult': true
    };

    if (shareWith === 'parent') {
      updates['accessControl.parentCanView'] = true;
    } else if (shareWith === 'teacher') {
      updates['accessControl.teacherCanView'] = true;
    }

    await updateDoc(sessionRef, updates);

    res.json({
      success: true,
      message: `Session shared with ${shareWith}`
    });

  } catch (error) {
    console.error("❌ Sandbox share error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// Helper Functions
// ============================================

/**
 * Check message safety using Claude
 */
async function checkMessageSafety(message, conversationHistory = []) {
  try {
    // Build context from recent messages
    const recentContext = conversationHistory
      .slice(-6)
      .map(m => `${m.role}: ${m.text}`)
      .join('\n');

    const prompt = getSafetyCheckPrompt(message, recentContext);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Default to safe if parsing fails
    return { level: 'safe', reason: 'Unable to parse safety check' };

  } catch (error) {
    console.error("Safety check error:", error);
    // Default to safe on error - don't block the user
    return { level: 'safe', reason: 'Safety check error - defaulting to safe' };
  }
}

/**
 * Generate session summary using Claude
 */
async function generateSessionSummary(session) {
  try {
    const prompt = getSessionSummaryPrompt(session.messages, session.mode, session.gradeLevel);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;

  } catch (error) {
    console.error("Summary generation error:", error);
    return null;
  }
}

/**
 * Trigger safety alert to parent/teacher
 */
async function triggerSafetyAlert(session, message, safetyResult) {
  try {
    // Create alert document
    const alertId = `alert_${Date.now()}`;
    const alertData = {
      alertId,
      sessionId: session.sessionId,
      learnerId: session.learnerId,
      level: safetyResult.level,
      reason: safetyResult.reason,
      triggerMessage: message,
      timestamp: serverTimestamp(),
      acknowledged: false,
      notificationSent: false
    };

    await setDoc(doc(db, "sandbox_alerts", alertId), alertData);

    // Update session access control to allow parent view
    await updateDoc(doc(db, "sandbox_sessions", session.sessionId), {
      'accessControl.parentCanView': true,
      'accessControl.teacherCanView': true
    });

    console.log(`🚨 Safety alert triggered: ${alertId} for learner ${session.learnerId}`);

    // TODO: Implement push notification/email to parent/teacher
    // This would integrate with your existing notification system

  } catch (error) {
    console.error("Safety alert error:", error);
  }
}

export default router;

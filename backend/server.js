import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ✅ ADD THIS IMPORT
import lessonRouter from "./routes/lesson.js";
import tavusRouter from "./routes/tavus.js";
import sandboxRouter from "./routes/sandbox.js";


process.env.NODE_ENV = process.env.NODE_ENV || "development";
// import { HumeClient } from "hume"; // Package doesn't exist - using axios for Hume API calls instead
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs, serverTimestamp, writeBatch, deleteDoc } from "firebase/firestore";
import OpenAI from "openai";
// Removed old routers that no longer exist
// (chat.js and hume.js were deleted)
// import chatRouter from './server/routes/chat.js';
// import humeRouter from './server/routes/hume.js';
// PATCH 2 — Hume Video Emotion Analysis
import FormData from "form-data";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic backend base URL
const BASE = process.env.SERVER_URL || `http://localhost:${PORT}`;
console.log("🔥 BACKEND BASE URL:", BASE);

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware - CORS must be first
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      if (origin.includes("railway.app")) return callback(null, true);
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
      if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(bodyParser.json());

// Removed old routers that no longer exist
// (chat.js and hume.js were deleted)
// app.use('/api/chat', chatRouter);
// app.use('/api/hume', humeRouter);

// ✅ REGISTER THE LESSON ROUTER
// This creates the real route: POST /api/lessons/start
app.use("/api/lessons", lessonRouter);

// ✅ REGISTER TAVUS ROUTER for conversational video avatars
app.use("/api/tavus", tavusRouter);

// ✅ REGISTER SANDBOX ROUTER for Social Sandbox feature
app.use("/api/sandbox", sandboxRouter);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Hume client - using axios for API calls since SDK package doesn't exist
// const hume = new HumeClient({ apiKey: process.env.HUME_API_KEY });
const HUME_API_KEY = process.env.HUME_API_KEY;

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
console.log("🔑 OpenAI API Key configured:", OPENAI_API_KEY ? "Yes" : "No");
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "Server is running!" });
});

// ============================================
// TTS (Text-to-Speech) ENDPOINT
// ============================================
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'shimmer', model = 'tts-1' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const openaiKey = process.env.OPENAI_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      { model, voice, input: text.trim() },
      {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('TTS error:', err?.response?.data ? Buffer.from(err.response.data).toString() : err.message);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// ============================================
// CHAT COMPLETIONS PROXY ENDPOINT
// ============================================
app.post('/api/chat/completions', async (req, res) => {
  try {
    const { messages, model = 'gpt-4o-mini', temperature = 0.95, max_tokens = 220, response_format } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const openaiKey = process.env.OPENAI_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const payload = { model, temperature, max_tokens, messages };
    if (response_format) payload.response_format = response_format;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Chat completions error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Chat completion failed' });
  }
});

// ============================================
// HUME EVI ACCESS TOKEN ENDPOINT
// ============================================
// Generates a short-lived access token for Hume EVI WebSocket connection
app.get('/api/hume/access-token', async (req, res) => {
  const humeApiKey = process.env.HUME_API_KEY;
  const humeSecret = process.env.HUME_CLIENT_SECRET;

  if (!humeApiKey || !humeSecret) {
    console.error('❌ Hume API credentials not configured');
    return res.status(500).json({
      error: 'Hume API credentials not configured',
      details: 'Missing HUME_API_KEY or HUME_CLIENT_SECRET'
    });
  }

  try {
    // Get access token from Hume API
    const response = await axios.post(
      'https://api.hume.ai/oauth2-cc/token',
      new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: humeApiKey,
          password: humeSecret
        }
      }
    );

    const accessToken = response.data.access_token;
    console.log('✅ Hume EVI access token generated');

    res.json({
      accessToken,
      expiresIn: response.data.expires_in || 3600
    });
  } catch (error) {
    console.error('❌ Failed to get Hume access token:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get Hume access token',
      details: error.response?.data?.error_description || error.message
    });
  }
});

// ============================================
// APPLE WATCH HEART RATE ENDPOINT
// ============================================
// Simple in-memory store for heart rate data from Apple Watch
// Data expires after 60 seconds
const heartRateStore = new Map();

// ============================================
// APPLE WATCH CUE/HAPTIC ENDPOINT
// ============================================
// Stores current cue state for Apple Watch to poll
// This allows the watch to display visual cues and trigger haptics
const watchCueStore = new Map();

// POST: Send a cue to the Apple Watch
app.post('/api/watch-cue/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { cue, message, hapticType } = req.body;

  // Map cue colors to Apple Watch haptic types
  // WatchOS haptic types: notification, directionUp, directionDown, success, failure, retry, start, stop, click
  const hapticMap = {
    green: 'success',      // Positive - gentle success tap
    yellow: 'directionUp', // Pacing - attention-getting
    blue: 'click',         // Engagement - subtle click
    purple: 'notification', // Suggestion - notification tap
    neutral: null
  };

  const data = {
    cue: cue || 'neutral',
    message: message || '',
    hapticType: hapticType || hapticMap[cue] || null,
    timestamp: Date.now(),
    sessionId,
    read: false
  };

  watchCueStore.set(sessionId, data);
  console.log(`⌚ Watch cue sent: ${data.cue} - "${data.message}" (haptic: ${data.hapticType})`);

  res.json({ success: true, sent: data });
});

// GET: Apple Watch polls this to get current cue
app.get('/api/watch-cue/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = watchCueStore.get(sessionId);

  if (!data) {
    return res.json({ cue: 'neutral', message: '', hapticType: null, hasNewCue: false });
  }

  // Check if cue is stale (older than 10 seconds)
  const isStale = Date.now() - data.timestamp > 10000;

  // Mark as read and return
  const response = {
    ...data,
    hasNewCue: !data.read && !isStale
  };

  // Mark as read
  data.read = true;
  watchCueStore.set(sessionId, data);

  res.json(response);
});

// GET: Get session info for watch setup
app.get('/api/watch-session/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.json({
    sessionId,
    pollUrl: `/api/watch-cue/${sessionId}`,
    heartRatePostUrl: `/api/heartrate/${sessionId}`,
    instructions: {
      watchApp: 'Poll the cue endpoint every 1-2 seconds to receive visual cues and haptic commands',
      hapticTypes: {
        success: 'Green cue - positive feedback',
        directionUp: 'Yellow cue - pacing reminder',
        click: 'Blue cue - engagement prompt',
        notification: 'Purple cue - suggestion'
      }
    }
  });
});

// POST: Receive heart rate data from iOS Shortcut
app.post('/api/heartrate/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { bpm, heartRate } = req.body;

  const heartRateValue = bpm || heartRate;

  if (!heartRateValue || isNaN(heartRateValue)) {
    return res.status(400).json({ error: 'Invalid heart rate value' });
  }

  const data = {
    bpm: parseInt(heartRateValue),
    timestamp: Date.now(),
    sessionId
  };

  heartRateStore.set(sessionId, data);
  console.log(`⌚ Received Apple Watch HR: ${data.bpm} BPM for session ${sessionId}`);

  // Clean up old entries (older than 60 seconds)
  const now = Date.now();
  for (const [key, value] of heartRateStore.entries()) {
    if (now - value.timestamp > 60000) {
      heartRateStore.delete(key);
    }
  }

  res.json({ success: true, received: data });
});

// GET: Retrieve latest heart rate data for a session
app.get('/api/heartrate/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = heartRateStore.get(sessionId);

  if (!data) {
    return res.status(404).json({ error: 'No heart rate data found for this session' });
  }

  // Check if data is stale (older than 30 seconds)
  if (Date.now() - data.timestamp > 30000) {
    return res.status(404).json({ error: 'Heart rate data is stale', lastUpdate: data.timestamp });
  }

  res.json(data);
});

// Diagnostic endpoint to test API keys
app.get('/api/test-keys', (req, res) => {
  const colossyanKey = process.env.COLOSSYAN_API_KEY;
  const humeKey = process.env.HUME_API_KEY;
  const humeSecret = process.env.HUME_CLIENT_SECRET;

  console.log("🔑 Testing API Keys...");
  console.log("   COLOSSYAN_API_KEY:", colossyanKey ? `${colossyanKey.substring(0, 10)}...` : "NOT SET");
  console.log("   HUME_API_KEY:", humeKey ? `${humeKey.substring(0, 10)}...` : "NOT SET");
  console.log("   HUME_CLIENT_SECRET:", humeSecret ? `${humeSecret.substring(0, 10)}...` : "NOT SET");

  res.json({
    colossyan: {
      loaded: !!colossyanKey,
      prefix: colossyanKey ? colossyanKey.substring(0, 10) + "..." : null
    },
    hume: {
      apiKeyLoaded: !!humeKey,
      secretLoaded: !!humeSecret,
      apiKeyPrefix: humeKey ? humeKey.substring(0, 10) + "..." : null
    }
  });
});

// Test Colossyan API connection
app.get('/api/test-colossyan', async (req, res) => {
  const colossyanKey = process.env.COLOSSYAN_API_KEY;

  if (!colossyanKey) {
    return res.status(500).json({ success: false, error: "COLOSSYAN_API_KEY not configured" });
  }

  const keyInfo = {
    prefix: colossyanKey.substring(0, 10) + "...",
    length: colossyanKey.length
  };

  try {
    // Test by listing generated videos (correct endpoint)
    const response = await axios.get(
      "https://app.colossyan.com/api/v1/generated-videos?limit=1",
      {
        headers: {
          "Authorization": `Bearer ${colossyanKey}`
        }
      }
    );

    console.log("✅ Colossyan API connection successful");
    res.json({
      success: true,
      message: "Colossyan API connected",
      keyInfo,
      note: "Ready to generate AI avatar educational videos"
    });
  } catch (err) {
    console.error("❌ Colossyan API test failed:", err.response?.data || err.message);
    res.json({
      success: false,
      error: err.response?.data?.error || err.response?.data?.message || err.message,
      status: err.response?.status,
      keyInfo,
      hint: "Check your API key at colossyan.com"
    });
  }
});

// Test Hume API connection
app.get('/api/test-hume', async (req, res) => {
  const humeKey = process.env.HUME_API_KEY;
  const humeSecret = process.env.HUME_CLIENT_SECRET;

  if (!humeKey) {
    return res.status(500).json({ success: false, error: "HUME_API_KEY not configured" });
  }

  const keyInfo = {
    apiKeyLength: humeKey.length,
    apiKeyPrefix: humeKey.substring(0, 10),
    secretConfigured: !!humeSecret
  };

  try {
    // Test by listing jobs (doesn't create anything)
    const response = await axios.get(
      "https://api.hume.ai/v0/batch/jobs",
      {
        headers: {
          "X-Hume-Api-Key": humeKey
        }
      }
    );

    console.log("✅ Hume API connection successful");
    res.json({
      success: true,
      message: "Hume API connected",
      jobsFound: response.data?.length || 0,
      keyInfo
    });
  } catch (err) {
    console.error("❌ Hume API test failed:", err.response?.data || err.message);

    // Check for specific error types
    const errorData = err.response?.data;
    const isInvalidKey = errorData?.fault?.faultstring === "Invalid ApiKey" ||
                         errorData?.fault?.detail?.errorcode === "oauth.v2.InvalidApiKey";

    res.json({
      success: false,
      error: isInvalidKey ? "Invalid API Key" : (errorData?.fault?.faultstring || err.message),
      status: err.response?.status,
      keyInfo,
      hint: isInvalidKey
        ? "Your Hume API key is invalid or expired. Get a new one from https://platform.hume.ai/settings/keys"
        : "Check your API key at https://platform.hume.ai/settings/keys",
      emotionDetectionStatus: "disabled - will skip emotion detection gracefully"
    });
  }
});

// Firebase connection test endpoint
app.get('/api/test-firebase', async (req, res) => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test basic Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: serverTimestamp(),
      message: 'Firebase connection test',
      status: 'success'
    });
    
    console.log('✅ Firebase write test successful');
    
    // Test reading the document
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firebase read test successful');
      res.json({ 
        success: true, 
        message: 'Firebase connection successful',
        data: docSnap.data()
      });
    } else {
      throw new Error('Document not found after write');
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Firebase connection failed',
      details: error.message
    });
  }
});

// Lesson caching functions
const generateLessonCacheKey = (topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses) => {
  const strengths = learnerStrengths?.sort().join(',') || '';
  const weaknesses = learnerWeaknesses?.sort().join(',') || '';
  return `${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeLevel}-${currentSkillLevel}-${strengths}-${weaknesses}`;
};

const getCachedLesson = async (cacheKey) => {
  try {
    console.log(`🔍 Checking cache for lesson: ${cacheKey}`);
    const lessonRef = doc(db, 'ai_lessons', cacheKey);
    const lessonSnap = await getDoc(lessonRef);
    
    if (lessonSnap.exists()) {
      const cachedLesson = lessonSnap.data();
      console.log(`✅ Found cached lesson: "${cachedLesson.lesson?.introduction?.title || 'Unknown Title'}"`);
      return cachedLesson;
    } else {
      console.log(`❌ No cached lesson found for: ${cacheKey}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking lesson cache:', error);
    return null;
  }
};

const cacheLesson = async (cacheKey, lessonData, usage, costEstimate) => {
  try {
    console.log(`💾 Caching lesson: ${cacheKey}`);
    const lessonRef = doc(db, 'ai_lessons', cacheKey);
    await setDoc(lessonRef, {
      lesson: lessonData,
      usage,
      costEstimate,
      cachedAt: serverTimestamp(),
      cacheKey
    });
    console.log(`✅ Lesson cached successfully`);
  } catch (error) {
    console.error('❌ Error caching lesson:', error);
    // Don't throw error - caching failure shouldn't break the response
  }
};

// Generate complete AI lesson endpoint
app.post('/api/generate-lesson', async (req, res) => {
  // Ensure CORS headers are set before any response
  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5175';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses } = req.body;
    
    // Validate required fields
    if (!topicName || !gradeLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: topicName and gradeLevel are required'
      });
    }
    
    console.log(`📚 Generating AI lesson for: ${topicName}, Grade: ${gradeLevel}, Skill Level: ${currentSkillLevel}`);
    console.log(`🎯 Strengths: ${learnerStrengths?.join(', ') || 'None specified'}`);
    console.log(`🔧 Weaknesses: ${learnerWeaknesses?.join(', ') || 'None specified'}`);
    
    // Generate cache key and check for existing lesson (skip caching for now)
    const cacheKey = generateLessonCacheKey(topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses);
    console.log(`🔄 Generating new lesson (cache key: ${cacheKey})...`);
    
    // Age-appropriate guidelines for exact grades
    const getGradeGuidelines = (grade) => {
      const gradeNum = parseInt(grade);
      
      // Kindergarten
      if (grade === 'K' || grade === '0') {
        return {
          language: 'Very simple words, short sentences (3-6 words per sentence)',
          topics: 'sharing toys, taking turns, saying sorry, making friends, asking to play',
          settings: 'playground, lunch table, classroom, recess, story time',
          avoid: 'dating, complex emotions, abstract concepts, adult situations',
          timeEstimate: '5-6 minutes',
          exampleTitle: 'Making Friends at Recess',
          ageContext: 'kindergartener (5-6 years old)'
        };
      }
      
      // Grades 1-2 (Early Elementary)
      if (gradeNum >= 1 && gradeNum <= 2) {
        return {
          language: 'Simple words, short sentences (4-8 words per sentence)',
          topics: 'sharing, taking turns, saying sorry, making friends, following rules',
          settings: 'playground, lunch table, classroom, recess, reading time',
          avoid: 'dating, complex emotions, abstract concepts, adult situations',
          timeEstimate: '6-8 minutes',
          exampleTitle: 'Sharing and Taking Turns',
          ageContext: `${gradeNum === 1 ? '1st grader' : '2nd grader'} (${gradeNum === 1 ? '6-7' : '7-8'} years old)`
        };
      }
      
      // Grades 3-5 (Elementary)
      if (gradeNum >= 3 && gradeNum <= 5) {
        return {
          language: 'Clear, concrete language (5-12 words per sentence)',
          topics: 'group work, handling disagreements, including others, following rules',
          settings: 'school projects, recess, clubs, art class, science lab',
          avoid: 'romantic relationships, mature themes, complex social dynamics',
          timeEstimate: '8-12 minutes',
          exampleTitle: 'Working Together in Groups',
          ageContext: `${gradeNum}${gradeNum === 3 ? 'rd' : gradeNum === 4 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Grades 6-8 (Middle School)
      if (gradeNum >= 6 && gradeNum <= 8) {
        return {
          language: 'Age-appropriate teen language (8-15 words per sentence)',
          topics: 'peer pressure, social media etiquette, conflict resolution, teamwork',
          settings: 'middle school, group chats, lunch tables, sports teams, clubs',
          avoid: 'adult relationships, workplace scenarios, inappropriate content',
          timeEstimate: '10-15 minutes',
          exampleTitle: 'Handling Peer Pressure',
          ageContext: `${gradeNum}${gradeNum === 6 ? 'th' : gradeNum === 7 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Grades 9-12 (High School)
      if (gradeNum >= 9 && gradeNum <= 12) {
        return {
          language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
          topics: 'leadership, conflict resolution, college prep, part-time jobs, relationships',
          settings: 'extracurriculars, part-time jobs, college prep, clubs, school events',
          avoid: 'inappropriate content for high schoolers, adult-only situations',
          timeEstimate: '12-15 minutes',
          exampleTitle: 'Building Leadership Skills',
          ageContext: `${gradeNum}${gradeNum === 9 ? 'th' : gradeNum === 10 ? 'th' : gradeNum === 11 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Default fallback
      return {
        language: 'Age-appropriate language (8-15 words per sentence)',
        topics: 'general social skills, friendship, communication, teamwork',
        settings: 'school, classroom, playground, lunch table, recess',
        avoid: 'inappropriate content, adult situations',
        timeEstimate: '10-12 minutes',
        exampleTitle: 'Social Skills Practice',
        ageContext: `student in grade ${grade}`
      };
    };
    
    const guidelines = getGradeGuidelines(gradeLevel);
    
    // Skill level adaptations
    const skillLevelAdaptations = {
      1: { difficulty: 'beginner', explanation: 'very simple', examples: 'basic', complexity: 'low' },
      2: { difficulty: 'beginner-intermediate', explanation: 'simple', examples: 'common', complexity: 'low-medium' },
      3: { difficulty: 'intermediate', explanation: 'clear', examples: 'varied', complexity: 'medium' },
      4: { difficulty: 'intermediate-advanced', explanation: 'detailed', examples: 'complex', complexity: 'medium-high' },
      5: { difficulty: 'advanced', explanation: 'comprehensive', examples: 'sophisticated', complexity: 'high' }
    };
    
    const skillAdaptation = skillLevelAdaptations[currentSkillLevel] || skillLevelAdaptations[3];
    
    // Build enhanced prompt using generic template
    const templateInfo = `
LEARNING OBJECTIVES FOR ${gradeLevel}:
Learn important social skills for ${gradeLevel}

KEY SKILLS TO TEACH:
General social skills, communication, friendship

COMMON MISTAKES TO ADDRESS:
Common social mistakes, inappropriate behavior

SCENARIO CONTEXTS (use these settings):
school, classroom, playground, lunch table

REAL-WORLD CHALLENGE:
Practice this skill in your daily life

TOPIC-SPECIFIC INSTRUCTIONS:
Focus on building social skills appropriate for this age group`;

    const prompt = `You are creating a complete social skills lesson for a CHILD who is a ${guidelines.ageContext}.

ABSOLUTE RESTRICTIONS - YOU MUST FOLLOW THESE:
❌ NEVER use these words: coworkers, colleagues, workplace, office, professional, networking, business, corporate, supervisor, employee, HR, management, career, resume, interview, meeting, client, customer, boss, manager
❌ NEVER include: job interviews, work meetings, workplace conflicts, career advice, business situations, professional relationships
❌ ONLY use these settings: school, classroom, playground, lunch table, recess, sports practice, after-school clubs, birthday parties, sleepovers, family events, neighborhood park, school bus, library, cafeteria, gym class, art class, music class
❌ ONLY use these relationships: classmates, friends, siblings, parents, teachers, coaches, teammates, neighbors, cousins

Use language and concepts appropriate for a ${guidelines.ageContext}. Every scenario, example, and explanation must be developmentally appropriate for this specific age.

EVERY part of the lesson must pass this test: 'Would this happen at school or with friends?'
If NO, do not include it.

LESSON REQUIREMENTS:
Topic: ${topicName}
Grade Level: ${gradeLevel} (${guidelines.ageContext})
Current Skill Level: ${currentSkillLevel} (${skillAdaptation.difficulty})
Learner Strengths: ${learnerStrengths?.join(', ') || 'General social skills'}
Learner Weaknesses: ${learnerWeaknesses?.join(', ') || 'General social skills'}

${templateInfo}

AGE-SPECIFIC GUIDELINES FOR ${guidelines.ageContext}:
- Language: ${guidelines.language}
- Topics: ${guidelines.topics}
- Settings: ${guidelines.settings}
- AVOID: ${guidelines.avoid}
- Time Estimate: ${guidelines.timeEstimate}

SKILL LEVEL ADAPTATION (Level ${currentSkillLevel}):
- Difficulty: ${skillAdaptation.difficulty}
- Explanation Style: ${skillAdaptation.explanation}
- Example Complexity: ${skillAdaptation.examples}
- Overall Complexity: ${skillAdaptation.complexity}

PERSONALIZATION:
- Build on these strengths: ${learnerStrengths?.join(', ') || 'general social skills'}
- Focus on improving: ${learnerWeaknesses?.join(', ') || 'general social skills'}
- Adapt difficulty to skill level ${currentSkillLevel}

LESSON STRUCTURE:
Create a complete lesson with these sections:

1. INTRODUCTION:
   - Title: Age-appropriate and engaging
   - Learning Objective: What they'll learn (1-2 sentences)
   - Why It Matters: Real-world relevance for their age
   - Estimated Time: ${guidelines.timeEstimate}

2. EXPLANATION:
   - Main Concept: Simple explanation of ${topicName}
   - Key Points: 2-3 important things to remember
   - Common Mistakes: 2-3 things to avoid

3. PRACTICE SCENARIOS (5 questions):
   Each scenario should have:
   - Situation: Real-world context for ${gradeLevel}
   - Question: What should they do?
   - 4 Options: 1 excellent, 2 good attempts, 1 poor choice
   - Feedback: Encouraging explanation for each choice
   - Tips: Specific improvement suggestions

4. SUMMARY:
   - What You Learned: Recap of main points
   - Key Takeaway: 1 sentence they should remember
   - Real-World Challenge: Specific action they can try today
   - Next Topic: Recommended follow-up lesson

VALIDATION STEP:
Before returning your response, check:
- Does it use age-appropriate vocabulary throughout?
- Would all scenarios happen to a kid this age?
- Are all relationships school/family/friend-based?
- Are there NO adult workplace words anywhere?
- Is the difficulty appropriate for skill level ${currentSkillLevel}?
- Does it build on strengths and address weaknesses?
- Does it follow the topic-specific instructions?

If any part fails these checks, regenerate it.

Return as JSON:
{
  "lesson": {
    "id": "lesson-${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeLevel}-${currentSkillLevel}",
    "topic": "${topicName}",
    "gradeLevel": "${gradeLevel}",
    "skillLevel": ${currentSkillLevel},
    "introduction": {
      "title": "...",
      "objective": "...",
      "whyItMatters": "...",
      "estimatedTime": "${guidelines.timeEstimate}"
    },
    "explanation": {
      "mainConcept": "...",
      "keyPoints": ["...", "...", "..."],
      "commonMistakes": ["...", "..."]
    },
    "practiceScenarios": [
      {
        "id": 1,
        "situation": "...",
        "question": "...",
        "options": [
          {
            "text": "...",
            "quality": "excellent",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "good",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "good",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "poor",
            "feedback": "...",
            "tip": "..."
          }
        ]
      }
    ],
    "summary": {
      "whatYouLearned": "...",
      "keyTakeaway": "...",
      "realWorldChallenge": "...",
      "nextTopic": "..."
    }
  }
}`;

    console.log(`📝 Making API call to Claude for lesson generation...`);
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received, validating for age-appropriateness...`);
    
    // Validate response for banned words (same validation as scenarios)
    const validateLessonForAge = (responseText, gradeLevel) => {
      const bannedWords = [
        'coworker', 'colleague', 'workplace', 'office', 'professional', 'business', 
        'corporate', 'employee', 'supervisor', 'HR', 'networking', 'resume', 
        'interview', 'client', 'customer', 'boss', 'manager',
        'colleagues', 'workplace', 'professional', 'business', 'corporate',
        'employee', 'supervisor', 'HR', 'management', 'resume',
        'interview', 'client', 'customer', 'boss', 'manager',
        'work meeting', 'business meeting', 'staff meeting', 'team meeting',
        'career advice', 'career counseling', 'career development', 'career path'
      ];
      
      const lowerResponse = (responseText || '').toLowerCase();
      
      for (const word of bannedWords) {
        // Use word boundaries to avoid false positives
        const wordRegex = new RegExp(`\\b${(word || '').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        if (wordRegex.test(lowerResponse)) {
          console.log(`❌ BANNED WORD DETECTED: "${word}" in lesson response for ${gradeLevel}`);
          return { isValid: false, bannedWord: word };
        }
      }
      
      return { isValid: true };
    };
    
    const validation = validateLessonForAge(responseText, gradeLevel);
    if (!validation.isValid) {
      console.log(`🚫 Lesson response rejected due to banned word: "${validation.bannedWord}"`);
      console.log(`🔄 Making retry API call with stricter prompt...`);
      
      // Retry with even stricter prompt
      const retryPrompt = `Your previous response contained inappropriate workplace language ("${validation.bannedWord}"). Remember: this is for a CHILD in SCHOOL, not an adult at work.

${prompt}

CRITICAL: Do not use ANY workplace, business, or professional language anywhere in the lesson. This is for a child in grade ${gradeLevel}.`;

      const retryMessage = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: retryPrompt
          }
        ],
      });
      
      const retryResponseText = retryMessage.content[0].text;
      console.log(`📊 Retry response received, validating again...`);
      
      const retryValidation = validateLessonForAge(retryResponseText, gradeLevel);
      if (!retryValidation.isValid) {
        console.error(`❌ Retry also failed with banned word: "${retryValidation.bannedWord}"`);
        throw new Error(`Unable to generate age-appropriate lesson. Banned word detected: ${retryValidation.bannedWord}`);
      }
      
      console.log(`✅ Retry response validated successfully`);
      responseText = retryResponseText;
    } else {
      console.log(`✅ Response validated successfully - no banned words detected`);
    }
    
    console.log(`📊 Parsing JSON from validated response...`);
    
    // Try to parse JSON from response
    let lessonData;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, responseText];
      
      const jsonText = jsonMatch[1] || responseText;
      
      // Try to find JSON object in the text
      const objectMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        lessonData = JSON.parse(objectMatch[0]);
      } else {
        lessonData = JSON.parse(jsonText);
      }
      
      console.log(`✅ Successfully parsed lesson: "${lessonData.lesson?.introduction?.title || 'Unknown Title'}"`);
      console.log(`📊 Lesson contains ${lessonData.lesson?.practiceScenarios?.length || 0} practice scenarios`);
      
    } catch (parseError) {
      console.error('❌ Failed to parse lesson JSON:', parseError);
      console.error('Raw response:', responseText.substring(0, 300) + '...');
      throw new Error('Failed to parse lesson response from AI');
    }
    
    // Log cost tracking
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    const estimatedCost = (tokensUsed / 1000) * 0.00025; // Rough estimate for Claude Haiku
    console.log(`💰 Token usage: ${tokensUsed} tokens (~$${estimatedCost.toFixed(4)})`);
    
    // Cache the lesson for future use (skip caching for now)
    // await cacheLesson(cacheKey, lessonData.lesson, message.usage, estimatedCost);
    
    res.json({ 
      success: true, 
      lesson: lessonData.lesson,
      usage: message.usage,
      costEstimate: estimatedCost,
      cached: false
    });
    
  } catch (error) {
    console.error('❌ Error generating lesson:', error);
    // Ensure CORS headers are included in error response
    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5175';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// REMOVED: /api/generate-lesson-simple endpoint (replaced by /api/lessons/start)

// REMOVED: /api/generate-scenario endpoint (replaced by /api/lessons/start)
// Get personalized feedback endpoint
app.post('/api/get-feedback', async (req, res) => {
  try {
    const { userChoice, scenario, userHistory } = req.body;
    
    const prompt = `A student just made this choice in a social skills practice scenario:
    
Scenario: ${scenario}
Their choice: ${userChoice}
Their history: ${userHistory?.recentChoices || 'First attempt'}

Provide encouraging, personalized feedback (2-3 sentences) that:
- Acknowledges their choice
- Explains why it works or doesn't
- Offers a specific tip for improvement (if needed)
- Encourages them to keep practicing

Keep it age-appropriate and positive.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    res.json({ 
      success: true, 
      feedback: message.content[0].text 
    });
    
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate personalized feedback endpoint
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { 
      scenarioContext, 
      question, 
      studentChoice, 
      correctAnswer, 
      choiceQuality,
      gradeLevel, 
      studentStrengths, 
      studentWeaknesses, 
      previousPerformance 
    } = req.body;
    
    console.log(`🎯 Generating personalized feedback for grade ${gradeLevel}`);
    console.log(`📝 Scenario: ${scenarioContext?.substring(0, 50)}...`);
    console.log(`💭 Student choice: ${studentChoice?.substring(0, 30)}...`);
    
    // Get grade-specific guidelines for feedback language
    const getGradeGuidelines = (grade) => {
      const gradeNum = parseInt(grade);
      
      if (grade === 'K' || grade === '0') {
        return {
          language: 'Very simple words, short sentences (3-6 words per sentence)',
          examples: 'playground, sharing toys, taking turns, saying hi',
          tone: 'warm and simple',
          ageContext: 'kindergartener (5-6 years old)'
        };
      }
      
      if (gradeNum >= 1 && gradeNum <= 2) {
        return {
          language: 'Simple words, short sentences (4-8 words per sentence)',
          examples: 'making friends, sharing, following rules',
          tone: 'encouraging and clear',
          ageContext: `${gradeNum === 1 ? '1st grader' : '2nd grader'} (${gradeNum === 1 ? '6-7' : '7-8'} years old)`
        };
      }
      
      if (gradeNum >= 3 && gradeNum <= 5) {
        return {
          language: 'Clear, concrete language (5-12 words per sentence)',
          examples: 'group work, handling disagreements, including others',
          tone: 'supportive and educational',
          ageContext: `${gradeNum}${gradeNum === 3 ? 'rd' : gradeNum === 4 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      if (gradeNum >= 6 && gradeNum <= 8) {
        return {
          language: 'Age-appropriate teen language (8-15 words per sentence)',
          examples: 'peer pressure, social media, teamwork, conflict resolution',
          tone: 'respectful and understanding',
          ageContext: `${gradeNum}${gradeNum === 6 ? 'th' : gradeNum === 7 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      if (gradeNum >= 9 && gradeNum <= 12) {
        return {
          language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
          examples: 'leadership, relationships, college prep, part-time jobs',
          tone: 'professional but warm',
          ageContext: `${gradeNum}${gradeNum === 9 ? 'th' : gradeNum === 10 ? 'th' : gradeNum === 11 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      return {
        language: 'Age-appropriate language',
        examples: 'general social skills',
        tone: 'encouraging',
        ageContext: `student in grade ${grade}`
      };
    };
    
    const guidelines = getGradeGuidelines(gradeLevel);
    
    const prompt = `You are a supportive social skills coach for a ${guidelines.ageContext}.

FEEDBACK REQUIREMENTS:
- Language: ${guidelines.language}
- Examples: Use ${guidelines.examples}
- Tone: ${guidelines.tone}
- NEVER use words like "wrong," "bad," "incorrect," or "failed"
- Use phrases like "Let's think about this..." or "Here's a better way..."
- Focus on growth mindset and learning
- Be warm, encouraging, and supportive

STUDENT PROFILE:
- Grade Level: ${gradeLevel} (${guidelines.ageContext})
- Strengths: ${studentStrengths?.join(', ') || 'general social skills'}
- Areas to improve: ${studentWeaknesses?.join(', ') || 'general social skills'}
- Recent performance: ${previousPerformance || 'new learner'}

SCENARIO ANALYSIS:
Situation: ${scenarioContext}
Question: ${question}
Student's choice: ${studentChoice}
Best answer: ${correctAnswer}
Choice quality: ${choiceQuality}

FEEDBACK GUIDELINES BASED ON CHOICE QUALITY:

EXCELLENT choice:
- Give specific praise for what they did right
- Explain WHY this is effective in this situation
- Connect to real-world benefits
- Reference their strengths when relevant
- 2-3 sentences, encouraging tone

GOOD choice:
- Acknowledge what they did right
- Gently explain what could be even better
- Provide specific actionable tip
- Stay positive and encouraging
- 2-3 sentences

POOR choice:
- Stay supportive (use "Let's think about this..." or "Here's a better way...")
- Explain why this might not work well
- Teach the missing social skill
- Suggest what to try instead with specific example
- End with encouragement
- Reference their weaknesses to help improve
- 3-4 sentences

RESPONSE FORMAT (JSON):
{
  "feedback": "Main personalized feedback text here...",
  "skillHighlight": "The specific social skill demonstrated or needed",
  "realWorldTip": "Concrete thing to try in real life",
  "encouragement": "Brief motivational message"
}

Make the feedback feel natural, personalized, and encouraging for a ${guidelines.ageContext}.`;

    console.log(`📝 Making API call to Claude for feedback generation...`);
    
    // Add 3-second timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Feedback generation timeout')), 3000);
    });
    
    const apiPromise = anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    const message = await Promise.race([apiPromise, timeoutPromise]);
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received for feedback generation...`);
    
    // Parse JSON from response
    let feedbackData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      feedbackData = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse feedback JSON:', parseError);
      throw new Error('Failed to parse feedback response from AI');
    }
    
    // Log cost tracking
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    const estimatedCost = (tokensUsed / 1000) * 0.00025;
    console.log(`💰 Feedback generation cost: ${tokensUsed} tokens (~$${estimatedCost.toFixed(4)})`);
    
    console.log(`✅ Personalized feedback generated successfully`);
    
    res.json({ 
      success: true, 
      feedback: feedbackData,
      usage: message.usage,
      costEstimate: estimatedCost
    });
    
  } catch (error) {
    console.error('❌ Error generating feedback:', error);
    
    // Return fallback feedback instead of error
    const fallbackFeedback = {
      feedback: "Great thinking! Keep practicing this skill.",
      skillHighlight: "Social skills practice",
      realWorldTip: "Try applying this in real life situations.",
      encouragement: "You're doing great! Keep learning and growing."
    };
    
    res.json({ 
      success: true, 
      feedback: fallbackFeedback,
      fallback: true,
      error: error.message 
    });
  }
});

// Adaptive Learning Initialization API
app.post('/api/adaptive/init', async (req, res) => {
  try {
    const { userId, userData, onboardingAnswers } = req.body;
    
    console.log(`🚀 Initializing adaptive learning for user: ${userId}`);
    console.log('👤 User data:', userData);
    console.log('📝 Onboarding answers:', onboardingAnswers);
    
    // Validate required fields
    if (!userId || !userData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and userData'
      });
    }
    
    const { name, gradeLevel } = userData;
    if (!name || !gradeLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required user data: name and gradeLevel'
      });
    }
    
    // Initialize learner profile
    const learnerProfile = {
      userId: userId,
      name: name,
      gradeLevel: gradeLevel,
      totalPoints: 0,
      streak: 0,
      totalSessions: 0,
      currentLevel: 1,
      badges: [],
      strengths: [],
      needsWork: [],
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isInitialized: true
    };
    
    // Set default learning preferences based on onboarding answers
    const defaultPreferences = {
      learningPace: onboardingAnswers?.pace || 'self-paced',
      feedbackStyle: onboardingAnswers?.feedbackStyle || 'encouraging',
      challengeLevel: onboardingAnswers?.challengeLevel || 'moderate',
      practiceFrequency: onboardingAnswers?.practiceFrequency || 'few-times-week'
    };
    
    // Initialize all topics with difficulty level 1
    const topics = [
      'Small Talk Basics',
      'Active Listening', 
      'Reading Body Language',
      'Building Confidence',
      'Conflict Resolution',
      'Teamwork',
      'Empathy',
      'Assertiveness'
    ];
    
    const topicMastery = topics.map(topic => ({
      userId: userId,
      topicId: topic.toLowerCase().replace(/\s+/g, '-'),
      topicName: topic,
      difficultyLevel: 1,
      masteryLevel: 0,
      accuracy: 0,
      timeSpent: 0,
      sessionsCompleted: 0,
      lastPracticed: null,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    
    // Save to Firebase
    const batch = writeBatch(db);
    
    // Save learner profile
    const learnerRef = doc(db, 'learner_profiles', userId);
    batch.set(learnerRef, learnerProfile);
    
    // Save learning preferences
    const preferencesRef = doc(db, 'learner_preferences', userId);
    batch.set(preferencesRef, {
      ...defaultPreferences,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Save topic mastery for each topic
    topicMastery.forEach(topic => {
      const topicRef = doc(db, 'topic_mastery', `${userId}_${topic.topicId}`);
      batch.set(topicRef, topic);
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Adaptive learning initialized successfully for user: ${userId}`);
    console.log(`📊 Created profile, preferences, and ${topics.length} topic mastery records`);
    
    res.json({
      success: true,
      message: 'Adaptive learning system initialized successfully',
      data: {
        learnerProfile: learnerProfile,
        preferences: defaultPreferences,
        topicsInitialized: topics.length,
        topics: topics
      }
    });
    
  } catch (error) {
    console.error('❌ Error initializing adaptive learning:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize adaptive learning system',
      details: error.message
    });
  }
});

// Check if user needs initialization
app.get('/api/adaptive/check-init/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔍 Checking initialization status for user: ${userId}`);
    
    // Check if learner profile exists
    const learnerRef = doc(db, 'learner_profiles', userId);
    const learnerSnap = await getDoc(learnerRef);
    
    if (learnerSnap.exists()) {
      const learnerData = learnerSnap.data();
      console.log(`✅ User ${userId} is already initialized`);
      
      res.json({
        success: true,
        isInitialized: true,
        learnerProfile: learnerData
      });
    } else {
      console.log(`⚠️ User ${userId} needs initialization`);
      
      res.json({
        success: true,
        isInitialized: false,
        message: 'User needs adaptive learning initialization'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking initialization status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check initialization status',
      details: error.message
    });
  }
});

// Parent Analytics API
app.get('/api/adaptive/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📊 Getting analytics for child: ${userId}`);
    
    // Get learner profile
    const learnerRef = doc(db, 'learner_profiles', userId);
    const learnerSnap = await getDoc(learnerRef);
    
    if (!learnerSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Child profile not found'
      });
    }
    
    const learnerProfile = learnerSnap.data();
    
    // Get topic mastery data
    const topicMasteryQuery = query(
      collection(db, 'topic_mastery'),
      where('userId', '==', userId)
    );
    const topicMasterySnap = await getDocs(topicMasteryQuery);
    
    const topicMastery = topicMasterySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get session history (last 30 days) - simplified query
    const sessionQuery = query(
      collection(db, 'session_history'),
      where('learnerId', '==', userId)
    );
    const sessionSnap = await getDocs(sessionQuery);
    
    const allSessions = sessionSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter sessions from last 30 days in JavaScript
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = allSessions.filter(session => {
      if (!session.completedAt) return false;
      const sessionDate = new Date(session.completedAt.seconds * 1000);
      return sessionDate >= thirtyDaysAgo;
    });
    
    // Get real-world challenges
    const challengesQuery = query(
      collection(db, 'real_world_challenges'),
      where('userId', '==', userId)
    );
    const challengesSnap = await getDocs(challengesQuery);
    
    const challenges = challengesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics
    const totalTopics = topicMastery.length;
    const masteredTopics = topicMastery.filter(topic => topic.masteryLevel >= 80).length;
    const inProgressTopics = topicMastery.filter(topic => topic.masteryLevel > 0 && topic.masteryLevel < 80).length;
    const notStartedTopics = topicMastery.filter(topic => topic.masteryLevel === 0).length;
    
    const totalTimeSpent = topicMastery.reduce((sum, topic) => sum + (topic.timeSpent || 0), 0);
    const totalSessions = recentSessions.length;
    const averageAccuracy = recentSessions.length > 0 
      ? recentSessions.reduce((sum, session) => sum + (session.score || 0), 0) / recentSessions.length
      : 0;
    
    const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
    const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;
    
    // Calculate practice frequency
    const practiceDays = new Set(recentSessions.map(session => 
      new Date(session.completedAt?.seconds * 1000).toDateString()
    )).size;
    
    const practiceFrequency = practiceDays > 0 ? Math.round((practiceDays / 30) * 100) : 0;
    
    // Get strengths and growth areas
    const strengths = topicMastery
      .filter(topic => topic.masteryLevel >= 70)
      .map(topic => topic.topicName)
      .slice(0, 3);
    
    const growthAreas = topicMastery
      .filter(topic => topic.masteryLevel < 50 && topic.masteryLevel > 0)
      .map(topic => topic.topicName)
      .slice(0, 3);
    
    // Recent activity timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = recentSessions
      .filter(session => session.completedAt?.seconds * 1000 >= sevenDaysAgo.getTime())
      .map(session => ({
        date: new Date(session.completedAt?.seconds * 1000).toISOString().split('T')[0],
        topic: session.topicName,
        score: session.score,
        timeSpent: session.timeSpent,
        type: 'practice_session'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    // Add challenge completions to timeline
    const recentChallengeCompletions = challenges
      .filter(challenge => 
        challenge.status === 'completed' && 
        challenge.completedAt?.seconds * 1000 >= sevenDaysAgo.getTime()
      )
      .map(challenge => ({
        date: new Date(challenge.completedAt?.seconds * 1000).toISOString().split('T')[0],
        topic: challenge.topicName,
        title: challenge.title,
        type: 'challenge_completed'
      }));
    
    recentActivity.push(...recentChallengeCompletions);
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const analytics = {
      learnerProfile: {
        name: learnerProfile.name,
        gradeLevel: learnerProfile.gradeLevel,
        totalPoints: learnerProfile.totalPoints,
        streak: learnerProfile.streak,
        currentLevel: learnerProfile.currentLevel,
        badges: learnerProfile.badges || []
      },
      progressSummary: {
        totalTopics,
        masteredTopics,
        inProgressTopics,
        notStartedTopics,
        masteryPercentage: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0
      },
      learningStats: {
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
        totalSessions,
        averageAccuracy: Math.round(averageAccuracy),
        practiceFrequency,
        completedChallenges,
        activeChallenges
      },
      strengths,
      growthAreas,
      recentActivity: recentActivity.slice(0, 10),
      topicMastery: topicMastery.map(topic => ({
        topicName: topic.topicName,
        masteryLevel: topic.masteryLevel,
        difficultyLevel: topic.difficultyLevel,
        accuracy: topic.accuracy,
        timeSpent: topic.timeSpent,
        sessionsCompleted: topic.sessionsCompleted,
        lastPracticed: topic.lastPracticed,
        isCompleted: topic.isCompleted
      }))
    };
    
    console.log(`✅ Analytics generated for child: ${userId}`);
    console.log(`📈 Progress: ${masteredTopics}/${totalTopics} topics mastered`);
    console.log(`⏱️ Time spent: ${analytics.learningStats.totalTimeSpent} hours`);
    console.log(`🎯 Average accuracy: ${analytics.learningStats.averageAccuracy}%`);
    
    res.json({
      success: true,
      analytics: analytics
    });
    
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      details: error.message
    });
  }
});

// Learning Preferences API
app.put('/api/adaptive/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    console.log(`⚙️ Saving preferences for user: ${userId}`);
    console.log('📋 Preferences:', preferences);
    
    // Validate preferences
    const validLearningPaces = ['self-paced', 'guided', 'accelerated'];
    const validFeedbackStyles = ['encouraging', 'direct', 'detailed'];
    const validChallengeLevels = ['gradual', 'moderate', 'aggressive'];
    const validFrequencies = ['daily', 'few-times-week', 'weekly'];
    
    if (!validLearningPaces.includes(preferences.learningPace)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid learning pace'
      });
    }
    
    if (!validFeedbackStyles.includes(preferences.feedbackStyle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback style'
      });
    }
    
    if (!validChallengeLevels.includes(preferences.challengeLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid challenge level'
      });
    }
    
    if (!validFrequencies.includes(preferences.practiceFrequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid practice frequency'
      });
    }
    
    // Save to Firebase
    const preferencesRef = doc(db, 'learner_preferences', userId);
    await setDoc(preferencesRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
      userId: userId
    }, { merge: true });
    
    console.log(`✅ Preferences saved successfully for user: ${userId}`);
    
    res.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: preferences
    });
    
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences',
      details: error.message
    });
  }
});

// Get Learning Preferences API
app.get('/api/adaptive/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📋 Getting preferences for user: ${userId}`);
    
    const preferencesRef = doc(db, 'learner_preferences', userId);
    const preferencesSnap = await getDoc(preferencesRef);
    
    if (preferencesSnap.exists()) {
      const preferences = preferencesSnap.data();
      console.log(`✅ Preferences found for user: ${userId}`);
      
      res.json({
        success: true,
        preferences: preferences
      });
    } else {
      console.log(`ℹ️ No preferences found for user: ${userId}, returning defaults`);
      
      // Return default preferences
      const defaultPreferences = {
        learningPace: 'self-paced',
        feedbackStyle: 'encouraging',
        challengeLevel: 'moderate',
        practiceFrequency: 'few-times-week'
      };
      
      res.json({
        success: true,
        preferences: defaultPreferences,
        isDefault: true
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      details: error.message
    });
  }
});

// Real-world challenge generation endpoint
app.post('/api/adaptive/generate-challenge', async (req, res) => {
  try {
    const { learnerId, topicName, gradeLevel, currentLevel, strengths, needsWork, recentPerformance } = req.body;

    console.log('🎯 Generating real-world challenge for:', {
      learnerId,
      topicName,
      gradeLevel,
      currentLevel
    });

    // Validate required fields
    if (!learnerId || !topicName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: learnerId and topicName'
      });
    }

    // Create the prompt for challenge generation
    const prompt = `You are an expert social skills educator creating personalized real-world challenges for students.

STUDENT PROFILE:
- Grade Level: ${gradeLevel || 'K-2'}
- Current Skill Level: ${currentLevel || 1}
- Topic Focus: ${topicName}
- Strengths: ${strengths?.join(', ') || 'General social skills'}
- Areas for Improvement: ${needsWork?.join(', ') || 'Building confidence'}
- Recent Performance: ${recentPerformance || 'New to social skills practice'}

Create a personalized real-world challenge that:
1. Is age-appropriate for ${gradeLevel || 'K-2'} students
2. Builds on the topic: ${topicName}
3. Is achievable but slightly challenging
4. Can be practiced in real social situations
5. Has clear success indicators
6. Includes helpful tips

Respond with a JSON object containing:
{
  "title": "Clear, engaging challenge title",
  "description": "Brief description of what to do",
  "specificGoal": "Specific, measurable goal",
  "whereToTry": ["Location 1", "Location 2", "Location 3"],
  "successIndicators": ["Indicator 1", "Indicator 2", "Indicator 3"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "timeframe": "This week" or "Today" or "This month",
  "estimatedDifficulty": "Easy" or "Moderate" or "Challenging"
}

Make it encouraging, specific, and practical for real-world practice.`;

    // Generate challenge using Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const challengeText = response.content[0].text;
    
    // Parse the JSON response
    let challenge;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = challengeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        challenge = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing challenge JSON:', parseError);
      console.log('Raw response:', challengeText);
      
      // Fallback challenge
      challenge = {
        title: `Practice ${topicName}`,
        description: `Try applying what you learned about ${topicName} in a real situation today.`,
        specificGoal: `Use your ${topicName} skills in a conversation or interaction.`,
        whereToTry: ['At school', 'At home', 'With friends'],
        successIndicators: ['You tried the skill', 'You felt more confident', 'The other person responded positively'],
        tips: ['Start small', 'Be yourself', 'Practice makes perfect'],
        timeframe: 'This week',
        estimatedDifficulty: 'Easy'
      };
    }

    // Add metadata
    challenge.learnerId = learnerId;
    challenge.topicName = topicName;
    challenge.gradeLevel = gradeLevel;
    challenge.generatedAt = new Date().toISOString();

    console.log('✅ Challenge generated successfully:', challenge.title);

    res.json({
      success: true,
      challenge: challenge
    });

  } catch (error) {
    console.error('❌ Error generating challenge:', error);
    
    // Return fallback challenge on error
    const fallbackChallenge = {
      title: `Practice ${req.body.topicName || 'Social Skills'}`,
      description: `Try applying what you learned in a real situation today.`,
      specificGoal: `Use your social skills in a conversation or interaction.`,
      whereToTry: ['At school', 'At home', 'With friends'],
      successIndicators: ['You tried the skill', 'You felt more confident', 'The other person responded positively'],
      tips: ['Start small', 'Be yourself', 'Practice makes perfect'],
      timeframe: 'This week',
      estimatedDifficulty: 'Easy',
      learnerId: req.body.learnerId,
      topicName: req.body.topicName,
      gradeLevel: req.body.gradeLevel,
      generatedAt: new Date().toISOString(),
      isFallback: true
    };

    res.json({
      success: true,
      challenge: fallbackChallenge,
      warning: 'Using fallback challenge due to AI generation error'
    });
  }
});

// AI Response Evaluation Endpoint
// ===============================

// POST /api/adaptive/evaluate-response - AI evaluates student responses
app.post('/api/adaptive/evaluate-response', async (req, res) => {
  const { learnerId, question, selectedAnswer, correctAnswer, isCorrectAnswer } = req.body;
  
  console.log('🤖 Evaluating response for:', learnerId);
  
  try {
    // Call Claude API for feedback
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `A student answered a social skills question.

Question: ${question}
Their answer: ${selectedAnswer}
Correct answer: ${correctAnswer}
Was correct: ${isCorrectAnswer}

Provide brief, encouraging feedback (2-3 sentences). If incorrect, gently explain why the correct answer is better.`
      }]
    });
    
    const feedback = response.content[0].text;
    
    console.log('✅ AI feedback generated for learner:', learnerId);
    
    res.json({
      success: true,
      feedback: feedback,
      isCorrect: isCorrectAnswer
    });
    
  } catch (error) {
    console.error('❌ Error evaluating response:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      feedback: 'Great effort! Keep practicing.'
    });
  }
});

// Privacy & Data Management Endpoints
// =====================================

// GET /api/user/privacy/:userId - fetch privacy settings
app.get('/api/user/privacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔒 Fetching privacy settings for user: ${userId}`);

    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    const privacySnap = await getDoc(privacyDoc);

    if (privacySnap.exists()) {
      res.json({
        success: true,
        privacy: privacySnap.data()
      });
    } else {
      // Return default privacy settings
      const defaultPrivacy = {
        shareProgressWithEducators: true,
        allowAnonymousDataCollection: true,
        showProgressToParents: true,
        includeDetailedSessionData: true,
        lastUpdated: new Date().toISOString()
      };
      
      res.json({
        success: true,
        privacy: defaultPrivacy
      });
    }
  } catch (error) {
    console.error('❌ Error fetching privacy settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch privacy settings'
    });
  }
});

// PUT /api/user/privacy/:userId - update privacy settings
app.put('/api/user/privacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const privacySettings = req.body;
    console.log(`🔒 Updating privacy settings for user: ${userId}`, privacySettings);

    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    await setDoc(privacyDoc, {
      ...privacySettings,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update privacy settings'
    });
  }
});

// GET /api/user/export-data/:userId - export all user data as JSON
app.get('/api/user/export-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📥 Exporting data for user: ${userId}`);

    // Collect all user data
    const userData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      profile: {},
      sessions: [],
      progress: {},
      challenges: [],
      preferences: {},
      privacy: {}
    };

    // Get user profile
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      userData.profile = userSnap.data();
    }

    // Get session history
    const sessionsQuery = query(
      collection(db, 'users', userId, 'sessions'),
      orderBy('completedAt', 'desc')
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    sessionsSnap.forEach(doc => {
      userData.sessions.push({ id: doc.id, ...doc.data() });
    });

    // Get progress data
    const progressDoc = doc(db, 'users', userId, 'progress', 'overview');
    const progressSnap = await getDoc(progressDoc);
    if (progressSnap.exists()) {
      userData.progress = progressSnap.data();
    }

    // Get challenges
    const challengesQuery = query(
      collection(db, 'users', userId, 'challenges')
    );
    const challengesSnap = await getDocs(challengesQuery);
    challengesSnap.forEach(doc => {
      userData.challenges.push({ id: doc.id, ...doc.data() });
    });

    // Get preferences
    const preferencesDoc = doc(db, 'users', userId, 'preferences', 'learning');
    const preferencesSnap = await getDoc(preferencesDoc);
    if (preferencesSnap.exists()) {
      userData.preferences = preferencesSnap.data();
    }

    // Get privacy settings
    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    const privacySnap = await getDoc(privacyDoc);
    if (privacySnap.exists()) {
      userData.privacy = privacySnap.data();
    }

    // Set headers for file download
    const username = userData.profile.username || 'user';
    const date = new Date().toISOString().split('T')[0];
    const filename = `social-cue-data-${username}-${date}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(userData);

  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export user data'
    });
  }
});

// DELETE /api/user/delete-account/:userId - delete user and all data
app.delete('/api/user/delete-account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🗑️ Deleting account for user: ${userId}`);

    // Delete all user subcollections
    const collections = ['sessions', 'progress', 'challenges', 'preferences', 'privacy'];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete main user document
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

// Parental Controls Endpoints
// ===========================

// GET /api/user/parental-controls/:userId - fetch parental controls
app.get('/api/user/parental-controls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👨‍👩‍👧‍👦 Fetching parental controls for user: ${userId}`);

    const controlsDoc = doc(db, 'users', userId, 'parentalControls', 'settings');
    const controlsSnap = await getDoc(controlsDoc);

    if (controlsSnap.exists()) {
      res.json({
        success: true,
        controls: controlsSnap.data()
      });
    } else {
      // Return default parental controls
      const defaultControls = {
        dailyTimeLimit: 30, // minutes
        sessionsPerDay: 3,
        availableTopics: ['small-talk', 'making-friends', 'conflict-resolution', 'empathy', 'active-listening'],
        blockedDifficultyLevels: [],
        ageAppropriateContentOnly: true,
        requireApprovalForChallenges: false,
        notifyOnSessionCompletion: true,
        lastUpdated: new Date().toISOString()
      };
      
      res.json({
        success: true,
        controls: defaultControls
      });
    }
  } catch (error) {
    console.error('❌ Error fetching parental controls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parental controls'
    });
  }
});

// PUT /api/user/parental-controls/:userId - update parental controls
app.put('/api/user/parental-controls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const controls = req.body;
    console.log(`👨‍👩‍👧‍👦 Updating parental controls for user: ${userId}`, controls);

    const controlsDoc = doc(db, 'users', userId, 'parentalControls', 'settings');
    await setDoc(controlsDoc, {
      ...controls,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Parental controls updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating parental controls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update parental controls'
    });
  }
});

// Session Replay Endpoint
// ======================

// GET /api/sessions/replay/:sessionId - fetch complete session data for replay
app.get('/api/sessions/replay/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🎬 Fetching session replay data for: ${sessionId}`);

    // First, try to find the session in any user's sessions
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let sessionData = null;
    let userId = null;

    // Search through all users to find the session
    for (const userDoc of usersSnapshot.docs) {
      const sessionsRef = collection(db, 'users', userDoc.id, 'sessions');
      const sessionDoc = doc(sessionsRef, sessionId);
      const sessionSnap = await getDoc(sessionDoc);
      
      if (sessionSnap.exists()) {
        sessionData = sessionSnap.data();
        userId = userDoc.id;
        break;
      }
    }

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get user profile for additional context
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    const userProfile = userSnap.exists() ? userSnap.data() : {};

    // Calculate session statistics
    const scenarios = sessionData.scenarios || [];
    const totalScenarios = scenarios.length;
    const correctAnswers = scenarios.filter(s => s.isCorrect).length;
    const accuracy = totalScenarios > 0 ? Math.round((correctAnswers / totalScenarios) * 100) : 0;
    
    // Calculate total time spent
    const startTime = sessionData.startedAt?.toDate?.() || new Date(sessionData.startedAt);
    const endTime = sessionData.completedAt?.toDate?.() || new Date(sessionData.completedAt);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);

    // Prepare replay data
    const replayData = {
      sessionId: sessionId,
      userId: userId,
      userProfile: {
        userName: userProfile.userName || 'Student',
        grade: userProfile.grade || '5',
        role: userProfile.role || 'student'
      },
      sessionInfo: {
        topicName: sessionData.topicName || 'Social Skills',
        difficulty: sessionData.difficulty || 'beginner',
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt,
        duration: durationMinutes,
        totalScenarios: totalScenarios,
        correctAnswers: correctAnswers,
        accuracy: accuracy
      },
      scenarios: scenarios.map((scenario, index) => ({
        scenarioNumber: index + 1,
        scenarioText: scenario.scenario || scenario.question || '',
        options: scenario.options || [],
        studentAnswer: scenario.selectedOption || scenario.studentAnswer,
        correctAnswer: scenario.correctAnswer || scenario.options?.find(opt => opt.isGood)?.text,
        isCorrect: scenario.isCorrect || false,
        aiFeedback: scenario.aiFeedback || scenario.feedback || '',
        proTip: scenario.proTip || '',
        timeSpent: scenario.timeSpent || 0,
        pointsEarned: scenario.pointsEarned || (scenario.isCorrect ? 10 : 0)
      })),
      summary: {
        strengths: sessionData.strengths || [],
        areasForImprovement: sessionData.areasForImprovement || [],
        nextRecommendedTopic: sessionData.nextRecommendedTopic || 'Continue practicing current topic',
        overallFeedback: sessionData.overallFeedback || 'Great job completing this session!'
      }
    };

    console.log(`✅ Session replay data prepared: ${totalScenarios} scenarios, ${accuracy}% accuracy`);

    res.json({
      success: true,
      replayData: replayData
    });

  } catch (error) {
    console.error('❌ Error fetching session replay data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session replay data'
    });
  }
});

// Goal Management Endpoints
// =========================

// POST /api/goals/generate-recommendations/:userId - AI generates personalized goal recommendations
app.post('/api/goals/generate-recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🎯 Generating AI goal recommendations for user: ${userId}`);

    // Get user profile and progress data
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    
    // If user doesn't exist, create minimal user data for testing
    let userData;
    if (!userSnap.exists()) {
      console.log(`⚠️ User ${userId} not found, creating minimal profile for testing`);
      userData = {
        userName: 'Test User',
        grade: '5',
        currentLevel: 1
      };
    } else {
      userData = userSnap.data();
    }

    // For now, use mock data to test the endpoint
    console.log('Using mock data for testing');

    // Prepare simple data for AI analysis
    const analysisData = {
      userProfile: {
        name: userData.userName || 'Student',
        gradeLevel: userData.grade || '5',
        currentLevel: userData.currentLevel || 1
      },
      progress: {
        totalSessions: 0,
        averageAccuracy: 0,
        currentStreak: 0
      }
    };

    // Generate AI recommendations
    const prompt = `You are a JSON API. Generate 3-5 personalized learning goals for a grade ${analysisData.userProfile.gradeLevel} student.

Student Profile:
- Name: ${analysisData.userProfile.name}
- Grade Level: ${analysisData.userProfile.gradeLevel}
- Current Level: ${analysisData.userProfile.currentLevel}

Progress Summary:
- Total Sessions: ${analysisData.progress.totalSessions}
- Average Accuracy: ${analysisData.progress.averageAccuracy}%
- Current Streak: ${analysisData.progress.currentStreak} days

CRITICAL: Return ONLY valid JSON. No explanations, no text, no markdown. Just the JSON array.

[
  {
    "title": "Master Small Talk Basics",
    "description": "Practice small talk scenarios until you reach 80% mastery",
    "targetTopic": "small-talk",
    "targetMetric": "mastery",
    "targetValue": 80,
    "suggestedDeadline": "2 weeks",
    "reason": "Small talk is a foundational social skill",
    "difficulty": "Medium"
  }
]`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const recommendations = JSON.parse(response.content[0].text);
    
    console.log(`✅ Generated ${recommendations.length} goal recommendations for ${userId}`);

    res.json({
      success: true,
      recommendations: recommendations
    });

  } catch (error) {
    console.error('❌ Error generating goal recommendations:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate goal recommendations',
      details: error.message
    });
  }
});

// POST /api/goals/create - Create a new goal
app.post('/api/goals/create', async (req, res) => {
  try {
    const goalData = req.body;
    console.log(`🎯 Creating new goal for user: ${goalData.userId}`);

    const goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: goalData.userId,
      title: goalData.title,
      description: goalData.description,
      targetTopic: goalData.targetTopic || '',
      targetMetric: goalData.targetMetric,
      targetValue: goalData.targetValue,
      currentValue: 0,
      deadline: goalData.deadline,
      status: 'active',
      aiRecommended: goalData.aiRecommended || false,
      createdAt: serverTimestamp(),
      completedAt: null
    };

    const goalDoc = doc(db, 'users', goalData.userId, 'goals', goal.id);
    await setDoc(goalDoc, goal);

    console.log(`✅ Goal created: ${goal.title}`);

    res.json({
      success: true,
      goal: goal
    });

  } catch (error) {
    console.error('❌ Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal'
    });
  }
});

// GET /api/goals/:userId - Fetch all goals
app.get('/api/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    console.log(`🎯 Fetching goals for user: ${userId}, status: ${status || 'all'}`);

    const goalsRef = collection(db, 'users', userId, 'goals');
    const goalsSnap = await getDocs(goalsRef);
    
    let goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by status if specified
    if (status && status !== 'all') {
      goals = goals.filter(goal => goal.status === status);
    }

    console.log(`✅ Found ${goals.length} goals for ${userId}`);

    res.json({
      success: true,
      goals: goals
    });

  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals'
    });
  }
});

// PUT /api/goals/:goalId/progress - Update goal progress
app.put('/api/goals/:goalId/progress', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId, newValue } = req.body;
    console.log(`🎯 Updating progress for goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalDoc);

    if (!goalSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goalData = goalSnap.data();
    const updatedGoal = {
      ...goalData,
      currentValue: newValue,
      lastUpdated: serverTimestamp()
    };

    await setDoc(goalDoc, updatedGoal);

    console.log(`✅ Goal progress updated: ${goalData.title} - ${newValue}/${goalData.targetValue}`);

    res.json({
      success: true,
      goal: updatedGoal
    });

  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal progress'
    });
  }
});

// PUT /api/goals/:goalId/complete - Mark goal as complete
app.put('/api/goals/:goalId/complete', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId } = req.body;
    console.log(`🎯 Completing goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalDoc);

    if (!goalSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goalData = goalSnap.data();
    const completedGoal = {
      ...goalData,
      status: 'completed',
      completedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    await setDoc(goalDoc, completedGoal);

    console.log(`✅ Goal completed: ${goalData.title}`);

    res.json({
      success: true,
      goal: completedGoal
    });

  } catch (error) {
    console.error('❌ Error completing goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete goal'
    });
  }
});

// DELETE /api/goals/:goalId - Delete/archive goal
app.delete('/api/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId } = req.body;
    console.log(`🎯 Deleting goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDoc);

    console.log(`✅ Goal deleted: ${goalId}`);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal'
    });
  }
});

// Adaptive learning routes removed — frontend-only functionality

// =========================
// FIXED: Classroom Video Route
// =========================

app.post("/api/classroom/video", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!openai) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.",
      });
    }

    // TEMPORARY VALID IMPLEMENTATION
    // Replace with real video generation once the correct API exists
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Generate a structured classroom-video script based on: ${prompt}`,
        },
      ],
    });

    return res.json({
      success: true,
      type: "text-fallback",
      message:
        "Note: Video generation API was deprecated. Returning script instead.",
      script: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("❌ OpenAI classroom video error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating classroom content",
    });
  }
});

// ============================
// COLOSSYAN AI AVATAR VIDEO GENERATION
// ============================
const COLOSSYAN_API_BASE = "https://app.colossyan.com/api/v1";

app.post("/api/video/generate-realworld", async (req, res) => {
  try {
    const { gradeLevel, topicId, script } = req.body;

    if (!process.env.COLOSSYAN_API_KEY) {
      return res.json({
        success: false,
        error: "Colossyan API key not configured",
        videoUrl: null
      });
    }

    // Generate a script if not provided
    const videoScript = script || `Hello! Let's practice a social skill today. We're going to learn about ${topicId || 'social interaction'}. Watch carefully and think about how the people in this scenario are feeling and communicating.`;

    console.log("🎬 Creating Colossyan avatar video...");

    // Avatar selection based on grade level
    const avatarConfig = ["K-2", "3-5"].includes(gradeLevel)
      ? { name: "nina1", voice: "Mnp10f391U8qfaHTmj81" }  // Friendly female for younger
      : { name: "lisa1", voice: "English_witty_female_1" }; // Professional for older

    // Build the video creative payload per Colossyan API docs
    const payload = {
      videoCreative: {
        settings: {
          name: `Social Skills: ${topicId || 'Lesson'}`,
          videoSize: {
            width: 1920,
            height: 1080
          },
          alphaChannel: false
        },
        scenes: [
          {
            name: "main",
            duration: Math.max(10, Math.ceil(videoScript.length / 15)),
            tracks: [
              {
                type: "actor",
                variant: "full_body",
                view: "front",
                actor: avatarConfig.name,
                text: videoScript,
                speakerId: avatarConfig.voice,
                position: { x: 420, y: 0 },
                size: { width: 1080, height: 1080 },
                rotation: 0
              }
            ]
          }
        ]
      }
    };

    const response = await axios.post(
      `${COLOSSYAN_API_BASE}/video-generation-jobs`,
      payload,
      {
        headers: {
          "Authorization": `Bearer ${process.env.COLOSSYAN_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const jobId = response.data?.id;
    const videoId = response.data?.videoId;

    if (!jobId && !videoId) {
      console.log("Colossyan response:", response.data);
      return res.status(500).json({ success: false, error: "Failed to start video generation" });
    }

    console.log("🎬 Colossyan job created:", jobId, "videoId:", videoId);

    // Poll for video completion
    const videoUrl = await pollColossyanVideo(jobId || videoId, videoId);
    if (!videoUrl) {
      return res.status(500).json({ success: false, error: "Video generation timed out or failed" });
    }

    res.json({ success: true, videoUrl, provider: "colossyan" });

  } catch (err) {
    console.error("❌ Colossyan video error:", err.response?.data || err);
    res.status(500).json({ success: false, error: err.response?.data?.error || err.message });
  }
});

// Helper function to poll Colossyan video status
async function pollColossyanVideo(jobId, videoId) {
  const maxAttempts = 60; // Max 5 minutes
  const pollInterval = 5000; // 5 seconds between polls

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      // Check job status
      const jobResponse = await axios.get(
        `${COLOSSYAN_API_BASE}/video-generation-jobs/${jobId}`,
        {
          headers: {
            "Authorization": `Bearer ${process.env.COLOSSYAN_API_KEY}`
          }
        }
      );

      const status = jobResponse.data?.status;
      console.log(`🎬 Colossyan job ${jobId} status: ${status}`);

      if (status === "finished" || status === "completed" || status === "ready") {
        // Get the actual video URL
        const vid = jobResponse.data?.videoId || videoId;
        if (vid) {
          const videoResponse = await axios.get(
            `${COLOSSYAN_API_BASE}/generated-videos/${vid}`,
            {
              headers: {
                "Authorization": `Bearer ${process.env.COLOSSYAN_API_KEY}`
              }
            }
          );
          const videoUrl = videoResponse.data?.publicUrl || videoResponse.data?.url;
          console.log("✅ Colossyan video ready:", videoUrl);
          return videoUrl;
        }
      }

      if (status === "failed" || status === "error") {
        console.error("❌ Colossyan video failed:", jobResponse.data?.error);
        return null;
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("❌ Error polling Colossyan:", err.response?.data || err.message);
      }
    }
  }

  console.warn("⚠️ Colossyan video timed out after 5 minutes");
  return null;
}


// =======================================================
// HUME EMOTION DETECTION ENDPOINTS
// =======================================================

// -------------------------
// REAL-TIME IMAGE EMOTION DETECTION (for webcam frames)
// -------------------------
app.post("/api/hume/emotion", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing imageBase64"
      });
    }

    // Return neutral emotions gracefully if API key not configured
    if (!HUME_API_KEY) {
      return res.json({
        success: true,
        emotions: [{ emotions: { neutral: 0.5 } }],
        note: "Hume API not configured - returning default"
      });
    }

    // Use Hume's batch API with base64 image data
    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        models: {
          face: {}
        },
        files: [
          {
            content_type: "image/jpeg",
            data: imageBase64
          }
        ]
      },
      {
        headers: {
          "X-Hume-Api-Key": HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // Batch jobs are async - get job ID and poll for results
    const jobId = response.data?.job_id;
    if (!jobId) {
      // Try to get immediate results if available
      return res.json({
        success: true,
        emotions: response.data?.predictions || []
      });
    }

    // Poll for job completion (with timeout)
    const maxAttempts = 10;
    const pollInterval = 500;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await axios.get(
        `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            "X-Hume-Api-Key": HUME_API_KEY
          }
        }
      );

      if (statusResponse.data && statusResponse.data.length > 0) {
        // Extract emotions from face predictions
        const predictions = statusResponse.data[0]?.results?.predictions?.[0]?.models?.face?.grouped_predictions?.[0]?.predictions || [];

        const emotions = predictions.map(pred => ({
          emotions: pred.emotions?.reduce((acc, e) => {
            acc[e.name] = e.score;
            return acc;
          }, {}) || {}
        }));

        return res.json({
          success: true,
          emotions: emotions.length > 0 ? emotions : [{ emotions: { neutral: 0.5 } }]
        });
      }
    }

    // Timeout - return neutral
    return res.json({
      success: true,
      emotions: [{ emotions: { neutral: 0.5 } }]
    });

  } catch (err) {
    console.error("❌ Hume emotion detection error:", err.response?.data || err.message);
    // Return neutral emotions on error to not break the UI
    return res.json({
      success: true,
      emotions: [{ emotions: { neutral: 0.5 } }]
    });
  }
});

// -------------------------
// REAL-TIME AUDIO EMOTION DETECTION (WebSocket streaming)
// -------------------------
// For real-time audio analysis during practice sessions
app.post("/api/hume/analyze-audio", async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing audioBase64"
      });
    }

    if (!HUME_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Hume API key not configured"
      });
    }

    // Use Hume's batch API for prosody analysis
    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        models: {
          prosody: {}
        },
        files: [
          {
            content_type: "audio/wav",
            data: audioBase64
          }
        ]
      },
      {
        headers: {
          "X-Hume-Api-Key": HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const jobId = response.data?.job_id;
    if (!jobId) {
      return res.json({
        success: true,
        emotions: null
      });
    }

    // Poll for completion
    const maxAttempts = 15;
    const pollInterval = 500;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await axios.get(
        `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            "X-Hume-Api-Key": HUME_API_KEY
          }
        }
      );

      if (statusResponse.data && statusResponse.data.length > 0) {
        const prosodyResults = statusResponse.data[0]?.results?.predictions?.[0]?.models?.prosody?.grouped_predictions?.[0]?.predictions || [];

        if (prosodyResults.length > 0) {
          const emotions = prosodyResults[0].emotions || [];
          const sorted = emotions.sort((a, b) => b.score - a.score);
          const topEmotion = sorted[0];

          return res.json({
            success: true,
            emotions: {
              dominant: topEmotion?.name || "neutral",
              intensity: topEmotion?.score || 0.5,
              all: emotions
            }
          });
        }
      }
    }

    return res.json({
      success: true,
      emotions: null
    });

  } catch (err) {
    console.error("❌ Hume audio analysis error:", err.response?.data || err.message);
    return res.json({
      success: true,
      emotions: null
    });
  }
});

// =======================================================
// PATCH 2 — Hume Video Emotion Analysis
// =======================================================

// Extract still frames from video using ffmpeg
function extractFrames(videoPath) {
  return new Promise((resolve, reject) => {
    const outDir = `/tmp/frames_${Date.now()}`;
    fs.mkdirSync(outDir, { recursive: true });

    const cmd = `ffmpeg -i ${videoPath} -vf fps=1 ${outDir}/frame_%03d.jpg`;

    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve(outDir);
    });
  });
}

// -------------------------
// HUME VIDEO ANALYSIS ROUTE (SDK-BASED)
// -------------------------
// Note: This endpoint uses Hume SDK for cleaner video analysis without frame extraction
// Install SDK: npm install @humeai/sdk

app.post("/api/hume/analyze-video", async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing videoUrl"
      });
    }

    console.log("🔍 Analyzing video with Hume:", videoUrl);

    // Send URL to Hume's multimodal model using axios (SDK package doesn't exist)
    if (!HUME_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Hume API key not configured. Please set HUME_API_KEY in your .env file."
      });
    }

    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        models: {
          face: {},
          prosody: {}
        },
        urls: [videoUrl]
      },
      {
        headers: {
          "X-Hume-Api-Key": HUME_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("🧠 Hume analysis complete");

    return res.json({
      success: true,
      analysis: response,   // full emotion data
    });

  } catch (err) {
    console.error("❌ Hume analysis error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Hume video analysis failed",
    });
  }
});

// -------------------------
// VIDEO GENERATION ROUTE (FINAL IMPLEMENTATION)
// -------------------------
// NOTE: This is the ONLY valid /api/video/generate-scene route.
// REMOVED: /api/video/generate-scene endpoint (replaced by /api/lessons/start)
// REMOVED: /api/lesson/load endpoint (replaced by /api/lessons/start)

// -------------------------------
// ADD NEW UNIFIED LESSON ENDPOINT
// -------------------------------
// DISABLED: app.post('/api/lessons/start', async (req, res) => {
// DISABLED:   try {
// DISABLED:     console.log("🔥 /api/lessons/start called");
// DISABLED: 
// DISABLED:     const { title, lessonId, gradeLevel } = req.body;
// DISABLED: 
// DISABLED:     // Validate input
// DISABLED:     if (!title || !gradeLevel) {
// DISABLED:       return res.status(400).json({
// DISABLED:         success: false,
// DISABLED:         error: "Missing required fields: title, gradeLevel"
// DISABLED:       });
// DISABLED:     }
// DISABLED: 
// DISABLED:     // -------------------------------------
// DISABLED:     // 1. CALL EXISTING LESSON GENERATOR API
// DISABLED:     // -------------------------------------
// DISABLED:     // ✅ CALL THE NEW OPENAI LESSON GENERATOR
// DISABLED:     const lessonResponse = await axios.post(
// DISABLED:       `${BASE}/api/lessons/start`,
// DISABLED:       {
// DISABLED:         topic: title,
// DISABLED:         gradeLevel
// DISABLED:       }
// DISABLED:     );
// DISABLED: 
// DISABLED:     const lesson = lessonResponse.data.lesson;
// DISABLED: 
// DISABLED:     // -------------------------------------
// DISABLED:     // 2. RETURN LESSON + OPTIONAL VIDEO URL
// DISABLED:     // -------------------------------------
// DISABLED:     return res.json({
// DISABLED:       success: true,
// DISABLED:       lesson,
// DISABLED:       videoUrl: null // placeholder for future video integration
// DISABLED:     });
// DISABLED: 
// DISABLED:   } catch (error) {
// DISABLED:     console.error("❌ Error in /api/lessons/start:", error);
// DISABLED:     res.status(500).json({
// DISABLED:       success: false,
// DISABLED:       error: error.message
// DISABLED:     });
// DISABLED:   }
// DISABLED: });
// DISABLED: 
// Serve static files from the React build folder
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Handle React routing - serve index.html for all non-API routes
  // Express 5 requires named parameter for wildcards
  app.get("/{*splat}", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log("📁 Serving static files from:", distPath);
} else {
  console.log("⚠️  No dist folder found - run 'npm run build' to create it");
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 Adaptive Learning API: http://localhost:${PORT}/api/adaptive`);
});

// Hume Emotion API (Option C integration)
async function analyzeEmotionWithHume(audioBase64) {
  try {
    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        models: { prosody: {} },
        raw_text: null,
        files: [{ type: "audio", data: audioBase64 }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Hume-Api-Key": process.env.HUME_API_KEY
        }
      }
    );

    const emotions =
      response.data?.results?.[0]?.models?.prosody?.predictions?.[0]
        ?.emotions || [];

    if (!emotions.length) return null;

    const topEmotion = emotions.sort(
      (a, b) => b.score - a.score
    )[0];

    return {
      emotion: topEmotion.name,
      intensity: topEmotion.score,
      full: emotions
    };
  } catch (err) {
    console.error("❌ Hume Emotion API error:", err.message);
    return null;
  }
}

function getAgeAppropriateContext(gradeLevel) {
  const grade = parseInt(gradeLevel, 10);

  if (Number.isNaN(grade)) {
    return 'You are coaching a student. Keep language age-appropriate and encouraging.';
  }

  if (grade <= 2) {
    return 'You are talking to a K-2 student (ages 5-8). Use simple, encouraging language with short sentences.';
  }
  if (grade <= 5) {
    return 'You are talking to a grades 3-5 student (ages 8-11). Use clear, friendly language.';
  }
  if (grade <= 8) {
    return 'You are talking to a middle school student (ages 11-14). Use conversational, supportive language.';
  }
  return 'You are talking to a high school student (ages 14-18). Use mature, thoughtful language.';
}

app.post('/api/voice/conversation', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured on server.' });
  }

  const {
    conversationHistory = [],
    scenario = {},
    gradeLevel = "6",
    phase = "intro",
    curriculumScript = null,
    audioBase64 = null,
    userId = null
  } = req.body || {};

  // NEW — run emotion analysis
  let humeEmotion = null;
  if (audioBase64) {
    humeEmotion = await analyzeEmotionWithHume(audioBase64);
    console.log("🎧 Emotion:", humeEmotion);
  }

  // Save emotion to Firestore per turn
  if (userId && humeEmotion) {
    try {
      const emotionRef = doc(
        db,
        "session_history",
        userId,
        "emotion_turns",
        `${Date.now()}`
      );

      await setDoc(emotionRef, {
        userId,
        scenarioTitle: scenario?.title || null,
        emotion: humeEmotion.emotion,
        intensity: humeEmotion.intensity,
        full: humeEmotion.full,
        timestamp: new Date().toISOString()
      });

      console.log("💾 Saved emotion turn to Firestore");
    } catch (error) {
      console.error("❌ Error saving emotion to Firestore:", error);
      // Don't fail the request if emotion save fails
    }
  }

  try {
    const emotionInstruction = humeEmotion
      ? `

The learner sounds **${humeEmotion.emotion}** with intensity **${humeEmotion.intensity.toFixed(
        2
      )}**.



Adjust your coaching:

- If they sound frustrated → slow down, simplify, reassure.

- If they sound confused → give clearer explanations and examples.

- If they sound bored → increase energy and engagement.

- If they sound excited → encourage them to elaborate and continue.

- If they sound sad → use a softer tone and check in.

- ALWAYS remain supportive.

`
      : "";

    const systemPrompt = `You are Cue, a social skills coach for students in grade ${gradeLevel}.

${getAgeAppropriateContext(gradeLevel)}

${emotionInstruction}

Current scenario: ${scenario?.title || 'conversation practice'}
Current phase: ${phase}

CRITICAL INSTRUCTION: When you receive a message that says "RESPOND WITH EXACTLY:", you MUST repeat that exact text word-for-word. Do not paraphrase, add to it, or change it in any way. Just say those exact words.`;

    const messages = (conversationHistory || [])
      .map((msg) => {
        const content = String(msg?.text || msg?.content || '').trim();
        if (!content) return null;
        return {
          role: msg?.role === 'user' ? 'user' : 'assistant',
          content
        };
      })
      .filter(Boolean);

    if (curriculumScript) {
      messages.push({
        role: 'user',
        content: `RESPOND WITH EXACTLY: "${curriculumScript}"`
      });
      console.log('💪 FORCING AI to say:', curriculumScript);
    } else if (phase === 'intro' && conversationHistory.length === 2) {
      // getVoiceIntro removed — frontend utility, not available in backend
      // Using generic intro instead
      try {
        const topicDescriptor =
          scenario?.topicId || scenario?.topic || scenario?.topicTitle || scenario?.title || 'this skill';
        const script = `Hi! I'm Coach Cue. Ready to practice ${topicDescriptor}?`;
        messages.push({
          role: 'user',
          content: `RESPOND WITH EXACTLY: "${script}"`
        });
        console.log('💪 FORCING AI to say (generic intro):', script);
      } catch (err) {
        console.warn('⚠️ Unable to create generic intro:', err.message);
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_tokens: 200
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    console.log('🤖 AI responded:', aiResponse);

    return res.json({
      aiResponse,
      shouldContinue: phase !== 'complete',
      phase,
      emotion: humeEmotion // Return emotion data for frontend use
    });
  } catch (error) {
    console.error('❌ Voice conversation error:', error);
    return res.status(500).json({ error: error.message || 'Voice conversation failed' });
  }
});

// ============================================
// AI Conversation Analysis for Incognito Mode
// ============================================
app.post('/api/ai/analyze-conversation', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { transcript, gradeLevel = '6', sessionDuration = 0 } = req.body || {};

  if (!transcript || transcript.length < 10) {
    return res.json({ suggestion: null, reason: 'Transcript too short' });
  }

  try {
    const systemPrompt = `You are an AI coach analyzing a student's conversation in real-time.
Your job is to provide ONE brief coaching suggestion based on their speech patterns.

Grade level: ${gradeLevel}
Session duration: ${sessionDuration} seconds

Analyze the transcript and return ONLY ONE of these suggestion codes (or null if no suggestion needed):
- "ask_question" - if they should ask the other person a question
- "slow_down" - if they seem to be speaking too fast or rambling
- "take_breath" - if they seem nervous or overwhelmed
- "your_turn" - if there's been a long pause and they should speak
- "good_job" - if they're doing well and deserve encouragement
- "be_confident" - if they seem unsure of themselves
- "listen_more" - if they're dominating the conversation

Return JSON format: { "suggestion": "code_here" or null, "confidence": 0.0-1.0 }

Only suggest if confidence > 0.6. Don't over-coach.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this transcript:\n\n"${transcript}"` }
      ],
      max_tokens: 100,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Only return suggestion if confidence is high enough
    if (result.confidence && result.confidence < 0.6) {
      return res.json({ suggestion: null, reason: 'Low confidence' });
    }

    return res.json({ suggestion: result.suggestion || null });
  } catch (error) {
    console.error('❌ AI conversation analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
});

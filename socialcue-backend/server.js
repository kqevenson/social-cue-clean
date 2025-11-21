// Simple Social Cue backend for saving session progress

// Run with: node server.js

import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBo836PZY5YBmv6e0xjrsPH0wg-5c7yCXQ",
  authDomain: "social-cue-2025.firebaseapp.com",
  projectId: "social-cue-2025",
  storageBucket: "social-cue-2025.appspot.com",
  messagingSenderId: "828360561679",
  appId: "1:828360561679:web:68b42b0b9e806d17d03f7a",
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const DATA_DIR = path.resolve("./data");
const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Ensure progress file exists
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ users: {} }, null, 2));
}

function readProgress() {
  const raw = fs.readFileSync(PROGRESS_FILE);
  return JSON.parse(raw);
}

function writeProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

// -------------------------
// SAVE PROGRESS ENDPOINT
// -------------------------
app.post("/api/progress/save", async (req, res) => {
  try {
    const progress = req.body;

    const ref = collection(db, "sessionHistory");
    await addDoc(ref, {
      ...progress,
      userId: progress.userId || "guest",
      date: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Save progress error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------
// GET USER PROGRESS
// -------------------------
app.get("/api/progress/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    const store = readProgress();
    const records = store.users[userId] || [];

    return res.json({ success: true, progress: records });
  } catch (err) {
    console.error("❌ Error loading progress:", err);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

// ---------- NEW ENDPOINT: Fetch session history ----------
app.get('/api/adaptive/session-history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("📘 Fetching session history for:", userId);

    // Use the existing Firestore instance (db) instead of creating a new one
    const sessionsRef = collection(db, 'sessionHistory');
    const q = query(sessionsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);

    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      sessions
    });

  } catch (err) {
    console.error("🔥 Error loading session history:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Social Cue backend running on http://localhost:${PORT}`);
});


// Simple Social Cue backend for saving session progress

// Run with: node server.js

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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
app.post("/api/progress/save", (req, res) => {
  try {
    const progress = req.body;

    if (!progress) {
      return res.status(400).json({ error: "Missing progress payload" });
    }

    const {
      userId = "guest",
      scenarioId,
      scenarioTitle,
      category,
      gradeLevel,
      totalTurns,
      userTurns,
      coachTurns,
      userFirstMessage,
      sessionCompletedAt
    } = progress;

    const store = readProgress();

    if (!store.users[userId]) {
      store.users[userId] = [];
    }

    const record = {
      scenarioId,
      scenarioTitle,
      category,
      gradeLevel,
      totalTurns,
      userTurns,
      coachTurns,
      userFirstMessage,
      sessionCompletedAt
    };

    store.users[userId].push(record);
    writeProgress(store);

    console.log("💾 Progress saved:", record);

    return res.json({ success: true, saved: record });
  } catch (err) {
    console.error("❌ Error saving progress:", err);
    res.status(500).json({ error: "Failed to save progress" });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Social Cue backend running on http://localhost:${PORT}`);
});


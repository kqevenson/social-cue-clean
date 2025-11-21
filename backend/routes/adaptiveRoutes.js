import express from "express";

const router = express.Router();

// TEMP in-memory store until Firestore integration
let sessionHistoryStore = {};

router.get("/session-history/:userId", (req, res) => {
  const { userId } = req.params;
  const sessions = sessionHistoryStore[userId] || [];
  res.json({ success: true, sessions });
});

router.post("/session-history/save", (req, res) => {
  const { userId, session } = req.body;

  if (!userId || !session) {
    return res.status(400).json({ success: false, error: "Missing userId or session" });
  }

  if (!sessionHistoryStore[userId]) {
    sessionHistoryStore[userId] = [];
  }

  sessionHistoryStore[userId].push(session);

  res.json({ success: true });
});

export default router;


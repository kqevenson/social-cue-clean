import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { configureFirebase } from "./config/firebase.js";

import chatRouter from "./routes/chat.js";
import lessonRouter from "./routes/lesson.js";
import videoRouter from "./routes/video.js";
import humeRouter from "./routes/hume.js";

const app = express();

// ---------------------------------
// CORS
// ---------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true
  })
);

// ---------------------------------
// Body Parsing
// ---------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------------------
// Initialize Firebase
// ---------------------------------
configureFirebase();

// ---------------------------------
// Routes
// ---------------------------------
app.use("/api/chat", chatRouter);

// IMPORTANT FIX:
// Must be plural "lessons" because your frontend
// calls /api/lessons/start, /api/lessons/submit, etc.
app.use("/api/lessons", lessonRouter);

app.use("/api/video", videoRouter);
app.use("/api/hume", humeRouter);

export default app;

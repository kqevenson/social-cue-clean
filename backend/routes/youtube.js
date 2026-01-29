import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();

const gradeToAgeLabel = {
  "K-2": "kids ages 5-7",
  "3-5": "kids ages 8-10",
  "6-8": "middle school",
  "9-12": "high school teens",
};

/**
 * GET /api/youtube/search?topic=...&gradeLevel=...
 * Returns up to 3 relevant YouTube videos for the given topic and grade level.
 */
router.get("/search", async (req, res) => {
  try {
    const { topic, gradeLevel } = req.query;

    if (!topic) {
      return res.status(400).json({ success: false, error: "topic is required" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ No YOUTUBE_API_KEY — skipping video search");
      return res.json({ success: true, videos: [] });
    }

    const ageLabel = gradeToAgeLabel[gradeLevel] || "kids";
    const query = `${topic} social skills ${ageLabel} body language emotions`;

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "6");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("relevanceLanguage", "en");
    url.searchParams.set("videoCategoryId", "27"); // Education category
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const err = await response.text();
      console.error("YouTube API error:", err);
      return res.json({ success: true, videos: [] });
    }

    const data = await response.json();

    // Filter to only include videos whose title or description mentions social-skill-related words
    const relevantKeywords = ['social', 'skill', 'cue', 'body language', 'emotion', 'feeling', 'listen', 'communicat', 'conflict', 'confidence', 'empathy', 'conversation', 'friend', 'bully', 'anxiety', 'nervous', topic.toLowerCase()];
    const allVideos = (data.items || []).map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description,
    }));

    const filtered = allVideos.filter((v) => {
      const text = `${v.title} ${v.description}`.toLowerCase();
      return relevantKeywords.some((kw) => text.includes(kw));
    });

    // Use filtered results, fall back to all if filtering removed everything
    const videos = (filtered.length > 0 ? filtered : allVideos).slice(0, 3).map(({ description, ...rest }) => rest);

    return res.json({ success: true, videos });
  } catch (err) {
    console.error("YouTube search error:", err);
    return res.json({ success: true, videos: [] });
  }
});

export default router;

// src/services/lessonApi.js
import { apiPath } from "../utils/apiBase.js";

export async function startLesson(topic, gradeLevel) {
  const response = await fetch(apiPath("/api/lessons/start"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, gradeLevel })
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Lesson failed");

  return data.lesson;
}

export async function generateVideo(scenes, gradeLevel) {
  try {
    const response = await fetch(apiPath("/api/lessons/video"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes, gradeLevel })
    });

    const data = await response.json();
    if (!data.success) {
      console.warn("⚠️ Video generation failed:", data.error || "Video failed");
      return null; // Return null instead of throwing to allow graceful degradation
    }

    return data.videoUrl;
  } catch (error) {
    console.error("❌ Video generation error:", error);
    // Return null instead of throwing to prevent breaking the lesson flow
    return null;
  }
}

export async function analyzeEmotion(videoUrl) {
  const response = await fetch(apiPath("/api/lessons/emotion"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl })
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Hume failed");

  return data.analysis;
}

// Helper to convert grade number to range
const getGradeRange = (grade) => {
  const g = parseInt(grade);
  if (isNaN(g) || g <= 2) return "K-2";
  if (g <= 5) return "3-5";
  if (g <= 8) return "6-8";
  return "9-12";
};

// Service object used by AILessonSession and LessonsScreen
export const lessonApiService = {
  async startLesson({ title, lessonId, gradeLevel }) {
    try {
      console.log(`📘 API: Starting lesson "${title}" for grade ${gradeLevel}`);
      
      const response = await fetch(apiPath("/api/lessons/start"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: title,
          gradeLevel: getGradeRange(gradeLevel)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("📦 API Response structure:", {
        hasSuccess: !!data.success,
        hasLesson: !!data.lesson,
        lessonKeys: data.lesson ? Object.keys(data.lesson) : null,
        videoUrl: data.videoUrl
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate lesson');
      }
      
      console.log(`✅ API: Lesson generated successfully`);
      const result = {
        lesson: data.lesson,
        videoUrl: data.videoUrl || null
      };
      console.log("📦 Returning from lessonApiService:", {
        hasLesson: !!result.lesson,
        lessonType: typeof result.lesson,
        videoUrl: result.videoUrl
      });
      return result;
    } catch (error) {
      console.error('❌ API: Error starting lesson:', error);
      throw error;
    }
  }
};

// Also export apiService for other components that may use it
export const apiService = {
  async healthCheck() {
    try {
      const response = await fetch(apiPath("/api/health"));
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }
};

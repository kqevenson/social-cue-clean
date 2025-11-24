import { apiPath } from "../utils/apiBase.js";

// Removed old startLesson() — backend does NOT support /lesson/generate

// Export service object for compatibility with existing code
export const lessonApiService = {
  async startLesson({ title, lessonId, gradeLevel }) {
    try {
      console.log(`📘 API: Starting lesson "${title}" for grade ${gradeLevel}`);
      
      // Convert single grade number to range format
      const getGradeRange = (grade) => {
        const g = parseInt(grade);
        if (isNaN(g) || g <= 2) return "K-2";
        if (g <= 5) return "3-5";
        if (g <= 8) return "6-8";
        return "9-12";
      };
      
      const response = await fetch(apiPath("/api/lessons/start"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          gradeLevel: getGradeRange(gradeLevel)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate lesson');
      }
      
      console.log(`✅ API: Lesson generated successfully`);
      return {
        lesson: data.lesson,
        videoUrl: data.videoUrl || null
      };
    } catch (error) {
      console.error('❌ API: Error starting lesson:', error);
      throw error;
    }
  }
};

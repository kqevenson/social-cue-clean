// API service for AI lesson generation
const API_BASE_URL = 'http://localhost:3001/api';

export const lessonApiService = {
  // Generate a new AI-powered lesson
  async generateLesson(topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses) {
    try {
      console.log('🎯 Generating AI lesson with params:', {
        topicName,
        gradeLevel,
        currentSkillLevel,
        learnerStrengths,
        learnerWeaknesses
      });

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection available');
      }

      // Set timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          gradeLevel,
          currentSkillLevel,
          learnerStrengths,
          learnerWeaknesses
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Authentication error. Please refresh the page.');
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate lesson');
      }

      console.log('✅ AI lesson generated successfully:', data.lesson.introduction.title);
      return data.lesson;
    } catch (error) {
      console.error('❌ Error generating AI lesson:', error);
      
      // Classify error for better handling
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.');
      } else if (error.message.includes('No internet')) {
        throw new Error('No internet connection available.');
      }
      
      throw error;
    }
  },

  // Cache lesson in localStorage
  cacheLesson(lesson, cacheKey) {
    try {
      const cachedData = {
        lesson,
        cachedAt: new Date().toISOString(),
        cacheKey
      };
      localStorage.setItem(`ai_lesson_${cacheKey}`, JSON.stringify(cachedData));
      console.log('💾 Lesson cached:', cacheKey);
    } catch (error) {
      console.error('❌ Error caching lesson:', error);
    }
  },

  // Get cached lesson from localStorage
  getCachedLesson(cacheKey) {
    try {
      const cached = localStorage.getItem(`ai_lesson_${cacheKey}`);
      if (cached) {
        const data = JSON.parse(cached);
        console.log('📦 Retrieved cached lesson:', data.lesson.introduction.title);
        return data.lesson;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving cached lesson:', error);
      return null;
    }
  },

  // Generate cache key for lesson
  generateCacheKey(topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses) {
    const strengths = learnerStrengths?.sort().join(',') || '';
    const weaknesses = learnerWeaknesses?.sort().join(',') || '';
    return `${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeLevel}-${currentSkillLevel}-${strengths}-${weaknesses}`;
  },

  // Check if AI lessons are enabled
  isAILessonsEnabled() {
    try {
      const setting = localStorage.getItem('ai_lessons_enabled');
      return setting === 'true';
    } catch (error) {
      console.error('❌ Error checking AI lessons setting:', error);
      return false;
    }
  },

  // Enable/disable AI lessons
  setAILessonsEnabled(enabled) {
    try {
      localStorage.setItem('ai_lessons_enabled', enabled.toString());
      console.log('⚙️ AI lessons setting updated:', enabled);
    } catch (error) {
      console.error('❌ Error updating AI lessons setting:', error);
    }
  }
};


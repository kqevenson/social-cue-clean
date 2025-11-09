/**
 * * Curriculum Index - Social Cue Practice
 * Central export for all grade-level curricula
 */

import { k2Curriculum } from './k-2-curriculum.js';
import { grade35Curriculum } from './3-5-curriculum.js';
import { grade68Curriculum } from './6-8-curriculum.js';
import { grade912Curriculum } from './9-12-curriculum.js';

/**
 * Get curriculum for specific grade level
 */
export const getCurriculumForGrade = (gradeLevel) => {
  const grade = typeof gradeLevel === 'string' ? gradeLevel : String(gradeLevel);
  
  // Handle various grade level formats
  if (grade.match(/^[kK0-2]$/i) || grade === 'K-2' || grade === 'k-2') {
    return k2Curriculum;
  }
  
  if (grade.match(/^[3-5]$/) || grade === '3-5') {
    return grade35Curriculum;
  }
  
  if (grade.match(/^[6-8]$/) || grade === '6-8') {
    return grade68Curriculum;
  }
  
  if (grade.match(/^[9]$|^1[0-2]$/) || grade === '9-12') {
    return grade912Curriculum;
  }
  
  // Default to middle school if unclear
  console.warn(`Unknown grade level: ${grade}, defaulting to 6-8`);
  return grade68Curriculum;
};

/**
 * Get lesson by ID across all curricula
 */
export const getLessonById = (lessonId, gradeLevel) => {
  const curriculum = getCurriculumForGrade(gradeLevel);
  
  for (const theme of curriculum.themes) {
    for (const lesson of theme.lessons) {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          theme: theme.title,
          gradeRange: curriculum.gradeRange
        };
      }
    }
  }
  
  return null;
};

/**
 * Get scenario by ID
 */
export const getScenarioById = (scenarioId, lessonId, gradeLevel) => {
  const lesson = getLessonById(lessonId, gradeLevel);
  
  if (!lesson) return null;
  
  return lesson.scenarios.find(s => s.id === scenarioId) || null;
};

/**
 * Get all themes for a grade level
 */
export const getThemesForGrade = (gradeLevel) => {
  const curriculum = getCurriculumForGrade(gradeLevel);
  return curriculum.themes;
};

/**
 * Get character mode settings
 */
export const getCharacterMode = (role, gradeLevel) => {
  const curriculum = getCurriculumForGrade(gradeLevel);
  return curriculum.characterModes[role] || null;
};

/**
 * Get all lessons for a theme
 */
export const getLessonsForTheme = (themeId, gradeLevel) => {
  const curriculum = getCurriculumForGrade(gradeLevel);
  const theme = curriculum.themes.find(t => t.id === themeId);
  
  return theme ? theme.lessons : [];
};

/**
 * Get lesson progress suggestions
 */
export const getNextLesson = (currentLessonId, gradeLevel) => {
  const curriculum = getCurriculumForGrade(gradeLevel);
  let foundCurrent = false;
  
  for (const theme of curriculum.themes) {
    for (const lesson of theme.lessons) {
      if (foundCurrent) {
        return lesson;
      }
      if (lesson.id === currentLessonId) {
        foundCurrent = true;
      }
    }
  }
  
  // If at end, suggest first lesson of next grade level
  return null;
};

/**
 * Search lessons by keyword
 */
export const searchLessons = (keyword, gradeLevel = null) => {
  const curricula = gradeLevel 
    ? [getCurriculumForGrade(gradeLevel)]
    : [k2Curriculum, grade35Curriculum, grade68Curriculum, grade912Curriculum];
  
  const results = [];
  const searchTerm = keyword.toLowerCase();
  
  for (const curriculum of curricula) {
    for (const theme of curriculum.themes) {
      for (const lesson of theme.lessons) {
        if (
          lesson.title.toLowerCase().includes(searchTerm) ||
          lesson.description?.toLowerCase().includes(searchTerm) ||
          theme.title.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            ...lesson,
            theme: theme.title,
            gradeRange: curriculum.gradeRange
          });
        }
      }
    }
  }
  
  return results;
};

/**
 * Export all curricula
 */
export const allCurricula = {
  'K-2': k2Curriculum,
  '3-5': grade35Curriculum,
  '6-8': grade68Curriculum,
  '9-12': grade912Curriculum
};

export default {
  getCurriculumForGrade,
  getLessonById,
  getScenarioById,
  getThemesForGrade,
  getCharacterMode,
  getLessonsForTheme,
  getNextLesson,
  searchLessons,
  allCurricula
};
// Utility to get grade-specific coaching prompt
export function getCurriculumPromptForGrade(gradeLevel) {
  const grade = parseInt(gradeLevel);
  if (grade >= 0 && grade <= 2) {
    return "Use very simple words and short sentences. Focus on emotions, kindness, and sharing.";
  } else if (grade >= 3 && grade <= 5) {
    return "Speak clearly. Use examples from the playground, lunch, or group work. Focus on friendships and respectful behavior.";
  } else if (grade >= 6 && grade <= 8) {
    return "Be relatable and casual. Include examples from class projects, texting, or peer pressure. Encourage positive responses.";
  } else if (grade >= 9 && grade <= 12) {
    return "Use mature, respectful tone. Reflect real-world and social dynamics. Help them build confidence in self-expression.";
  } else {
    return "Speak clearly and kindly. Use school-related examples. Support the student's social development.";
  }
}

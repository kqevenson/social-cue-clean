import React from 'react';
import curriculumIndex from '../content/curriculum/curriculum-index';

const LessonSelector = ({ gradeLevel = '6', onLessonSelect }) => {
  // Normalize input to match curriculum keys
  const getGradeKey = (level) => {
    const n = parseInt(level);
    if (n <= 2 || level === 'k') return 'k-2';
    if (n <= 5) return '3-5';
    if (n <= 8) return '6-8';
    return '9-12';
  };

  const gradeKey = getGradeKey(gradeLevel);
  const lessons = curriculumIndex[gradeKey] || [];

  return (
    <div className="lesson-selector">
      <h3>Pick a lesson to practice</h3>
      <ul>
        {lessons.map((lesson, i) => (
          <li key={i}>
            <button onClick={() => onLessonSelect(lesson)}>
              {lesson.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LessonSelector;







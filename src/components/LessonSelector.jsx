import React, { useState, useEffect } from 'react';
import curriculum from '../content/curriculum/curriculum-index.js';

export const LessonSelector = ({ gradeLevel, onSelectLesson }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const availableTopics = curriculum.getTopicsForGrade(gradeLevel) || [];
    setTopics(availableTopics);
  }, [gradeLevel]);

  const topicsByUnit = topics.reduce((acc, topic) => {
    if (!acc[topic.unit]) acc[topic.unit] = [];
    acc[topic.unit].push(topic);
    return acc;
  }, {});

  return (
    <div className="lesson-selector">
      <h2>What do you want to practice?</h2>

      {Object.entries(topicsByUnit).map(([unitName, unitTopics]) => (
        <div key={unitName} className="unit-section">
          <h3>{unitName}</h3>

          <div className="topic-grid">
            {unitTopics.map((topic) => (
              <button
                key={topic.id}
                className="topic-card"
                onClick={() => onSelectLesson(topic.id)}
              >
                <h4>{topic.title}</h4>
                <p className="skills">{(topic.skills || []).slice(0, 2).join(', ')}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonSelector;


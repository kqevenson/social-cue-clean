import curriculum from "../content/curriculum/curriculum-index.js";
import {
  determineSceneType,
  determineSettingPhrase
} from "./curriculumSceneMapper.js";

function normalizeGrade(gradeLevel) {
  if (gradeLevel === "K") return "K";
  const g = parseInt(gradeLevel);
  return isNaN(g) ? "6" : g;
}

/**
 * Final AI Prompt Composer
 * Uses:
 *  - curriculum data
 *  - scene type (from mapper)
 *  - setting phrasing (grade-adjusted)
 *  - emotion clarity for Hume analysis
 */
export function buildScenePrompt(gradeLevel, topicId) {
  const grade = normalizeGrade(gradeLevel);
  const topic = curriculum[topicId];

  const sceneType = determineSceneType(topicId, gradeLevel);
  const settingPhrase = determineSettingPhrase(gradeLevel, sceneType);

  if (!topic) {
    return `
Create a short ${sceneType} video for a grade ${grade} student.
Use ${settingPhrase}. Make emotional cues clear and easy to understand.
`;
  }

  const title =
    topic.title?.[grade] || topic.title?.["K"] || "Social Skills Scene";

  const description =
    topic.description?.[grade] ||
    topic.description?.["K"] ||
    "A social scenario appropriate for this grade.";

  return `
Create a short ${sceneType} video (3–6 seconds) illustrating the social skill:

"${title}" (Topic: ${topicId})
Grade: ${grade}
Description: ${description}

Scene Requirements:
• Setting: ${settingPhrase}
• Show 2–4 characters interacting naturally
• Clear emotional expressions (easy for Hume emotion recognition)
• Age-appropriate behavior and visuals
• No unsafe or stressful content
• Camera should show faces + body language clearly
• Natural movement, not exaggerated
• Friendly, safe atmosphere

Purpose:
Students will watch this video, then answer questions about the emotions and social cues they observe.

Make sure facial expressions are clear and readable for a grade ${grade} learner.
`;
}

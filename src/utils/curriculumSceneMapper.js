import curriculum from "../content/curriculum/curriculum-index.js";

/**
 * Determines the best-fitting video scene type based on curriculum category
 * and grade level.
 *
 * sceneType:
 *    "classroom" → OpenAI Video
 *    "realworld" → Runway Gen-4 Turbo
 *
 * Categories:
 *  - initiating-connections  → classroom (low-stress)
 *  - managing-emotions       → realworld (higher realism)
 *  - perspective-taking      → classroom
 *  - conflict-resolution     → realworld
 *  - communication-skills    → classroom
 */
export function determineSceneType(topicId, gradeLevel) {
  const topic = curriculum[topicId];

  if (!topic) return "classroom";

  const category = topic.category;

  // Category-based mapping (expandable)
  const categoryMap = {
    "initiating-connections": "classroom",
    "communication-skills": "classroom",
    "perspective-taking": "classroom",

    "managing-emotions": "realworld",
    "conflict-resolution": "realworld"
  };

  // Override: High school uses more real-world contexts
  const grade = gradeLevel === "K" ? 0 : parseInt(gradeLevel);
  if (grade >= 9) return "realworld";

  return categoryMap[category] || "classroom";
}

/**
 * Creates a contextual setting phrase for prompt building.
 * K–5: Simplified, safe settings
 * 6–12: More varied and realistic
 */
export function determineSettingPhrase(gradeLevel, sceneType) {
  const grade = gradeLevel === "K" ? 0 : parseInt(gradeLevel);

  if (sceneType === "classroom") {
    if (grade <= 2)
      return "a simple school setting like a brightly lit classroom or friendly hallway";
    if (grade <= 5)
      return "a school setting such as a classroom, recess area, or lunch tables";
    if (grade <= 8)
      return "a middle school environment like a hallway, group table, or classroom discussion";
    return "a high school setting with realistic peer interactions, classrooms, or group work";
  }

  // Real-world settings
  if (grade <= 2)
    return "a simple real-life location like a playground or neighborhood park";
  if (grade <= 5)
    return "a real-life setting such as a park, after-school area, or community space";
  if (grade <= 8)
    return "a realistic environment like a café, sports practice, or outdoor hangout";
  return "a mature setting appropriate for teens, such as a group meetup or casual public space";
}



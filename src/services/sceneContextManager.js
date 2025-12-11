// src/services/sceneContextManager.js
// Manages scene context to ensure consistency throughout a practice session

/**
 * Scene context that remains constant throughout a practice session
 * @typedef {Object} SceneContext
 * @property {string} setting - The physical location/environment
 * @property {string} activity - What's happening in the scene
 * @property {string} context - The context type (classroom, lunch, playground, social)
 * @property {string} gradeLevel - The grade level for age-appropriate details
 * @property {string} topic - The lesson topic
 * @property {string} fullScenarioPrompt - The complete scenario description
 * @property {string|null} backgroundImageUrl - DALL-E generated background
 * @property {string} createdAt - Timestamp when scene was created
 */

// Storage key for persisting scene context
const SCENE_CONTEXT_KEY = 'socialCue:currentSceneContext';

// Setting options by context type
const SETTINGS_BY_CONTEXT = {
  classroom: [
    "at your desk during group work",
    "near the whiteboard during a presentation",
    "at the science table during an experiment",
    "in the reading corner during quiet time",
    "at the art station during creative time"
  ],
  lunch: [
    "at the lunch table with classmates",
    "in line at the cafeteria",
    "at a table near the window",
    "finding a seat in the crowded cafeteria",
    "at the snack table during lunch"
  ],
  playground: [
    "near the swings at recess",
    "on the basketball court",
    "at the benches during break",
    "near the playground equipment",
    "on the field during free time"
  ],
  social: [
    "at a class party",
    "during a school event",
    "at a birthday celebration",
    "during a group activity",
    "at an after-school gathering"
  ]
};

// Activity templates by topic
const ACTIVITIES_BY_TOPIC = {
  "small-talk-basics": [
    "and you want to start a friendly conversation",
    "and someone is talking about their weekend",
    "and you notice something interesting to comment on",
    "and a friend sits next to you"
  ],
  "active-listening": [
    "and someone is telling you a story",
    "and a friend is sharing something important",
    "and you're trying to follow a group conversation",
    "and someone is explaining something to you"
  ],
  "joining-groups": [
    "and a group is already chatting",
    "and your friends are in the middle of a conversation",
    "and some kids are discussing something fun",
    "and a group is laughing together"
  ],
  "confidence-building": [
    "and you want to share your thoughts",
    "and you want to introduce yourself",
    "and you want to ask a question",
    "and you want to join the conversation"
  ],
  "resolving-conflicts": [
    "and there's a small misunderstanding",
    "and someone seems upset",
    "and you disagree with a classmate",
    "and you want to fix a small argument"
  ]
};

/**
 * Creates a new scene context for a practice session
 * This should be called ONCE when the learner selects a topic
 *
 * @param {Object} scenario - The selected scenario
 * @param {string} gradeLevel - The learner's grade level
 * @returns {SceneContext} The generated scene context
 */
export function createSceneContext(scenario, gradeLevel) {
  // Detect context type from scenario
  const contextType = detectContextType(scenario);

  // Get topic name for activity selection
  const topicName = scenario?.topicName || scenario?.title || scenario?.topicId || "small-talk-basics";
  const normalizedTopic = normalizeTopicName(topicName);

  // Select random but FIXED setting and activity for this session
  const settings = SETTINGS_BY_CONTEXT[contextType] || SETTINGS_BY_CONTEXT.classroom;
  const activities = ACTIVITIES_BY_TOPIC[normalizedTopic] || ACTIVITIES_BY_TOPIC["small-talk-basics"];

  const setting = settings[Math.floor(Math.random() * settings.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];

  // Build the full scenario prompt
  const fullScenarioPrompt = `Imagine you're ${setting}, ${activity}.`;

  const sceneContext = {
    setting,
    activity,
    context: contextType,
    gradeLevel: gradeLevel || "6-8",
    topic: scenario?.title || topicName,
    topicId: scenario?.topicId || normalizedTopic,
    fullScenarioPrompt,
    backgroundImageUrl: null,
    createdAt: new Date().toISOString()
  };

  // Persist to sessionStorage for recovery
  try {
    sessionStorage.setItem(SCENE_CONTEXT_KEY, JSON.stringify(sceneContext));
  } catch (err) {
    console.warn("Could not persist scene context:", err);
  }

  return sceneContext;
}

/**
 * Updates the background image URL in the scene context
 *
 * @param {string} imageUrl - The DALL-E generated image URL
 * @returns {SceneContext|null} Updated scene context or null if none exists
 */
export function setSceneBackgroundImage(imageUrl) {
  const context = getCurrentSceneContext();
  if (!context) return null;

  context.backgroundImageUrl = imageUrl;

  try {
    sessionStorage.setItem(SCENE_CONTEXT_KEY, JSON.stringify(context));
  } catch (err) {
    console.warn("Could not update scene background:", err);
  }

  return context;
}

/**
 * Gets the current scene context for the active session
 *
 * @returns {SceneContext|null} The current scene context or null
 */
export function getCurrentSceneContext() {
  try {
    const stored = sessionStorage.getItem(SCENE_CONTEXT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn("Could not load scene context:", err);
    return null;
  }
}

/**
 * Clears the scene context (call when session ends)
 */
export function clearSceneContext() {
  try {
    sessionStorage.removeItem(SCENE_CONTEXT_KEY);
  } catch (err) {
    console.warn("Could not clear scene context:", err);
  }
}

/**
 * Gets the scenario prompt from the current scene context
 * This should be used by the AI conversation engine instead of generating new scenarios
 *
 * @returns {string} The fixed scenario prompt for this session
 */
export function getScenarioPrompt() {
  const context = getCurrentSceneContext();
  return context?.fullScenarioPrompt || "Imagine you're practicing this social skill.";
}

/**
 * Gets scene context formatted for DALL-E prompt generation
 *
 * @returns {Object} Scene data for DALL-E prompt
 */
export function getSceneDataForDallE() {
  const context = getCurrentSceneContext();
  if (!context) return null;

  return {
    topic: context.topic,
    context: context.context,
    gradeLevel: context.gradeLevel,
    setting: context.setting,
    description: context.fullScenarioPrompt
  };
}

// Helper: Detect context type from scenario data
function detectContextType(scenario) {
  const text = [
    scenario?.title,
    scenario?.category,
    scenario?.prompt,
    scenario?.contextLine,
    scenario?.setting
  ].filter(Boolean).join(' ').toLowerCase();

  if (text.includes('lunch') || text.includes('cafeteria') || text.includes('eating')) {
    return 'lunch';
  }
  if (text.includes('playground') || text.includes('recess') || text.includes('outside') || text.includes('outdoor')) {
    return 'playground';
  }
  if (text.includes('party') || text.includes('event') || text.includes('social') || text.includes('gathering')) {
    return 'social';
  }
  return 'classroom';
}

// Helper: Normalize topic name to match our keys
function normalizeTopicName(topicName) {
  const normalized = topicName.toLowerCase().replace(/\s+/g, '-');

  const mapping = {
    'starting a conversation': 'small-talk-basics',
    'small talk': 'small-talk-basics',
    'conversation starters': 'small-talk-basics',
    'listening': 'active-listening',
    'active listening': 'active-listening',
    'joining a group': 'joining-groups',
    'joining groups': 'joining-groups',
    'group conversations': 'joining-groups',
    'confidence': 'confidence-building',
    'building confidence': 'confidence-building',
    'speaking up': 'confidence-building',
    'conflict': 'resolving-conflicts',
    'resolving conflicts': 'resolving-conflicts',
    'disagreements': 'resolving-conflicts'
  };

  // Check for partial matches
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key.replace(/\s+/g, '-')) || topicName.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'small-talk-basics';
}

export default {
  createSceneContext,
  setSceneBackgroundImage,
  getCurrentSceneContext,
  clearSceneContext,
  getScenarioPrompt,
  getSceneDataForDallE
};

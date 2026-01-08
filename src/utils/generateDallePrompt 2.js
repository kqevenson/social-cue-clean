// src/utils/generateDallePrompt.js
// Utility function to generate DALL-E prompts for social skills scenario backgrounds

/**
 * Context-specific environment details for each setting type
 */
const CONTEXT_DETAILS = {
  classroom: {
    elements: "student desks arranged in rows, whiteboard with educational content, colorful learning posters on walls, bookshelves, natural light from windows",
    atmosphere: "organized, studious, welcoming learning environment"
  },
  lunch: {
    elements: "cafeteria tables with attached seating, food service counter in background, large windows, tray return station, menu board",
    atmosphere: "bright, social, clean dining environment"
  },
  playground: {
    elements: "playground equipment, grassy field, basketball court in distance, trees providing shade, clear blue sky, school building visible",
    atmosphere: "sunny, active, outdoor recreational space"
  },
  social: {
    elements: "casual seating areas, decorative string lights, snack table, colorful decorations, open floor space for mingling",
    atmosphere: "festive, relaxed, celebratory gathering space"
  }
};

/**
 * Grade level adjustments for age-appropriate imagery
 */
const GRADE_LEVEL_STYLES = {
  "k2": {
    ageDescription: "elementary school",
    colorScheme: "bright primary colors, playful decorations",
    designStyle: "simple, cheerful, cartoon-friendly elements",
    furniture: "small child-sized furniture"
  },
  "3-5": {
    ageDescription: "upper elementary school",
    colorScheme: "warm, inviting colors with educational themes",
    designStyle: "balanced, organized, colorful but not overwhelming",
    furniture: "standard classroom furniture"
  },
  "6-8": {
    ageDescription: "middle school",
    colorScheme: "modern cool tones, blues and greens",
    designStyle: "contemporary, clean lines, age-appropriate maturity",
    furniture: "modern institutional furniture"
  },
  "9-12": {
    ageDescription: "high school",
    colorScheme: "neutral tones with accent colors",
    designStyle: "realistic, professional, mature atmosphere",
    furniture: "standard high school furniture"
  }
};

/**
 * Perspective options for varied scene composition
 */
const PERSPECTIVES = [
  "wide-angle",
  "eye-level",
  "slightly elevated",
  "panoramic"
];

/**
 * Safety keywords that must be included in every prompt
 */
const SAFETY_KEYWORDS = [
  "no people",
  "no faces",
  "safe for children",
  "educational setting",
  "empty scene"
];

/**
 * Style keywords for consistent image quality
 */
const STYLE_KEYWORDS = [
  "photorealistic",
  "high detail",
  "professional photography",
  "soft natural lighting",
  "4K quality"
];

/**
 * Generates a DALL-E prompt for creating appropriate background scene images
 * based on social skills scenario details.
 *
 * @param {Object} scenarioData - The scenario details
 * @param {string} scenarioData.topic - The lesson topic (e.g., "Starting a Conversation")
 * @param {string} scenarioData.context - Setting type: "classroom" | "lunch" | "playground" | "social"
 * @param {string} scenarioData.gradeLevel - Grade level: "k2" | "3-5" | "6-8" | "9-12"
 * @param {string} [scenarioData.description] - Full scenario description (optional)
 * @param {string} [scenarioData.setting] - Specific location details (optional)
 *
 * @returns {Object} Result object containing:
 *   - dallePrompt: The generated DALL-E prompt string
 *   - metadata: Original scenario data for reference
 *   - imageSpecs: Image specifications (size, quality)
 *
 * @example
 * const result = generateScenePrompt({
 *   topic: "Joining a Group",
 *   context: "lunch",
 *   gradeLevel: "6-8"
 * });
 * // Returns: { dallePrompt: "A wide-angle view of...", metadata: {...}, imageSpecs: {...} }
 */
export function generateScenePrompt(scenarioData) {
  // Validate required inputs
  if (!scenarioData) {
    throw new Error("scenarioData is required");
  }

  const {
    topic = "Social Skills Practice",
    context = "classroom",
    gradeLevel = "6-8",
    description = "",
    setting = ""
  } = scenarioData;

  // Get context-specific details (default to classroom if unknown)
  const contextInfo = CONTEXT_DETAILS[context.toLowerCase()] || CONTEXT_DETAILS.classroom;

  // Get grade-level style adjustments (default to 6-8 if unknown)
  const gradeStyle = GRADE_LEVEL_STYLES[gradeLevel.toLowerCase()] || GRADE_LEVEL_STYLES["6-8"];

  // Select a perspective (use consistent one based on context for reproducibility)
  const perspectiveIndex = context.length % PERSPECTIVES.length;
  const perspective = PERSPECTIVES[perspectiveIndex];

  // Build the prompt components
  const promptParts = [];

  // 1. Opening with perspective and age-appropriate setting
  promptParts.push(
    `A ${perspective} view of a ${gradeStyle.ageDescription} ${context}`
  );

  // 2. Add specific environmental details from context
  promptParts.push(contextInfo.elements);

  // 3. Add color scheme and design style from grade level
  promptParts.push(`${gradeStyle.colorScheme}, ${gradeStyle.designStyle}`);

  // 4. Add atmosphere description
  promptParts.push(contextInfo.atmosphere);

  // 5. Add custom setting details if provided
  if (setting && setting.trim()) {
    promptParts.push(setting.trim());
  }

  // 6. Add lighting description based on context
  const lightingDescription = context === "playground"
    ? "bright natural sunlight, clear day"
    : "soft natural lighting from windows, well-lit interior";
  promptParts.push(lightingDescription);

  // 7. Add all safety keywords
  promptParts.push(SAFETY_KEYWORDS.join(", "));

  // 8. Add style keywords for quality
  promptParts.push(STYLE_KEYWORDS.slice(0, 3).join(", "));

  // Combine all parts into final prompt
  const dallePrompt = promptParts.join(", ");

  // Build metadata object for reference
  const metadata = {
    topic,
    context: context.toLowerCase(),
    gradeLevel: gradeLevel.toLowerCase(),
    description: description || null,
    setting: setting || null,
    generatedAt: new Date().toISOString()
  };

  // Image specifications for DALL-E API
  const imageSpecs = {
    size: "1024x1024",
    quality: "standard",
    style: "natural" // DALL-E 3 style parameter
  };

  return {
    dallePrompt,
    metadata,
    imageSpecs
  };
}

/**
 * Generates multiple scene prompts for a complete lesson with variations
 *
 * @param {Object} lessonData - Base lesson data
 * @param {number} [count=3] - Number of scene variations to generate
 * @returns {Array<Object>} Array of prompt results
 */
export function generateMultipleScenePrompts(lessonData, count = 3) {
  const results = [];
  const contexts = Object.keys(CONTEXT_DETAILS);

  for (let i = 0; i < count; i++) {
    // Vary the context for each scene if not specified
    const contextVariation = lessonData.context || contexts[i % contexts.length];

    const sceneData = {
      ...lessonData,
      context: contextVariation,
      setting: `scene ${i + 1} of ${count}`
    };

    results.push(generateScenePrompt(sceneData));
  }

  return results;
}

/**
 * Validates that a context string is supported
 *
 * @param {string} context - The context to validate
 * @returns {boolean} True if context is supported
 */
export function isValidContext(context) {
  return Object.keys(CONTEXT_DETAILS).includes(context?.toLowerCase());
}

/**
 * Validates that a grade level string is supported
 *
 * @param {string} gradeLevel - The grade level to validate
 * @returns {boolean} True if grade level is supported
 */
export function isValidGradeLevel(gradeLevel) {
  return Object.keys(GRADE_LEVEL_STYLES).includes(gradeLevel?.toLowerCase());
}

/**
 * Returns list of supported contexts
 * @returns {string[]} Array of supported context strings
 */
export function getSupportedContexts() {
  return Object.keys(CONTEXT_DETAILS);
}

/**
 * Returns list of supported grade levels
 * @returns {string[]} Array of supported grade level strings
 */
export function getSupportedGradeLevels() {
  return Object.keys(GRADE_LEVEL_STYLES);
}

// Default export for convenience
export default generateScenePrompt;

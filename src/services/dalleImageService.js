// src/services/dalleImageService.js
// Service for generating DALL-E background images for practice scenarios

import { generateScenePrompt } from '../utils/generateDallePrompt';

/**
 * Generate a background image for a practice scenario using DALL-E
 *
 * @param {Object} scenarioData - Scenario details for prompt generation
 * @param {string} scenarioData.topic - The lesson topic
 * @param {string} scenarioData.context - Setting type (classroom, lunch, playground, social)
 * @param {string} scenarioData.gradeLevel - Grade level (k2, 3-5, 6-8, 9-12)
 * @param {string} [scenarioData.description] - Additional description
 * @param {string} [scenarioData.setting] - Specific setting details
 * @returns {Promise<string|null>} Generated image URL or null on failure
 */
export async function generateSceneBackground(scenarioData) {
  // Try multiple ways to get the API key (Vite uses import.meta.env)
  const apiKey = import.meta?.env?.VITE_OPENAI_API_KEY
    || localStorage.getItem('openai_api_key')
    || localStorage.getItem('OPENAI_API_KEY');

  if (!apiKey) {
    console.warn('⚠️ No OpenAI API key found - skipping DALL-E image generation');
    console.warn('   Restart dev server after adding VITE_OPENAI_API_KEY to .env');
    console.warn('   Or quick fix: localStorage.setItem("openai_api_key", "sk-...")');
    return null;
  }

  console.log('🔑 Using OpenAI API key:', apiKey.substring(0, 12) + '...' + apiKey.slice(-4));

  try {
    // Generate the DALL-E prompt using our utility
    const { dallePrompt, imageSpecs } = generateScenePrompt(scenarioData);

    console.log('🎨 Generating DALL-E background image...');
    console.log('   Prompt preview:', dallePrompt.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        n: 1,
        size: imageSpecs.size,
        quality: imageSpecs.quality,
        style: imageSpecs.style || 'natural'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ DALL-E API error:', response.status, response.statusText);
      console.error('   Error details:', JSON.stringify(errorData, null, 2));

      // Check for common errors
      if (response.status === 401) {
        console.error('   💡 API key may be invalid or expired');
      } else if (response.status === 429) {
        console.error('   💡 Rate limit exceeded - try again later');
      } else if (response.status === 400) {
        console.error('   💡 Bad request - check prompt content');
      }

      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;

    if (imageUrl) {
      console.log('✅ DALL-E image generated successfully');
      return imageUrl;
    }

    console.warn('⚠️ No image URL in DALL-E response');
    return null;

  } catch (err) {
    console.error('❌ DALL-E generation error:', err.message);
    return null;
  }
}

/**
 * Map scenario object to the format expected by generateScenePrompt
 *
 * @param {Object} scenario - The scenario from voice practice
 * @param {string|number} gradeLevel - The learner's grade level
 * @returns {Object} Formatted scenario data for prompt generation
 */
export function mapScenarioToPromptData(scenario, gradeLevel) {
  // Detect context from scenario title/category
  const context = detectContext(scenario);

  // Normalize grade level to our format
  const normalizedGrade = normalizeGradeLevel(gradeLevel);

  return {
    topic: scenario?.title || scenario?.category || 'Social Skills Practice',
    context,
    gradeLevel: normalizedGrade,
    description: scenario?.prompt || scenario?.contextLine || '',
    setting: scenario?.setting || ''
  };
}

/**
 * Detect the context (classroom, lunch, playground, social) from scenario data
 */
function detectContext(scenario) {
  const text = [
    scenario?.title,
    scenario?.category,
    scenario?.prompt,
    scenario?.contextLine
  ].join(' ').toLowerCase();

  if (text.includes('lunch') || text.includes('cafeteria') || text.includes('eating')) {
    return 'lunch';
  }
  if (text.includes('playground') || text.includes('recess') || text.includes('outside') || text.includes('outdoor')) {
    return 'playground';
  }
  if (text.includes('party') || text.includes('event') || text.includes('social') || text.includes('gathering')) {
    return 'social';
  }
  // Default to classroom
  return 'classroom';
}

/**
 * Normalize grade level to our supported format
 */
function normalizeGradeLevel(grade) {
  const num = parseInt(String(grade).replace(/[^0-9]/g, ''), 10);

  if (isNaN(num) || num <= 2) return 'k2';
  if (num <= 5) return '3-5';
  if (num <= 8) return '6-8';
  return '9-12';
}

export default generateSceneBackground;

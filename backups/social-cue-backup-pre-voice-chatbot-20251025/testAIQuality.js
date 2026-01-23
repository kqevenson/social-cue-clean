/**
 * AI QUALITY TESTING SYSTEM
 * 
 * This system evaluates AI-generated lesson quality and provides tools for prompt improvement.
 * 
 * HOW TO USE:
 * 
 * 1. Run full test suite:
 *    node testAIQuality.js --full
 * 
 * 2. Test specific topic:
 *    node testAIQuality.js --topic "Small Talk Basics"
 * 
 * 3. Test specific grade:
 *    node testAIQuality.js --grade 7
 * 
 * 4. Quick test (3 random):
 *    node testAIQuality.js --quick
 * 
 * 5. Test and compare:
 *    node testAIQuality.js --compare "Active Listening" 5
 * 
 * 6. Test single lesson:
 *    node testAIQuality.js --single "Small Talk Basics" 4 2
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our template system
import { getAllTemplateKeys, getTemplate } from './promptTemplates.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:3001',
  DELAY_BETWEEN_CALLS: 2000, // 2 seconds
  MAX_RETRIES: 3,
  TIMEOUT: 30000, // 30 seconds
  LOG_FILE_PREFIX: 'ai-quality-tests'
};

// Test results storage
let testResults = [];
let currentTestSession = null;

/**
 * Utility functions
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '📊';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const saveResults = async (results) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${CONFIG.LOG_FILE_PREFIX}-${timestamp}.json`;
  const filepath = path.join(__dirname, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    log(`Results saved to ${filename}`, 'success');
  } catch (error) {
    log(`Failed to save results: ${error.message}`, 'error');
  }
};

/**
 * API Helper Functions
 */
const makeAPICall = async (endpoint, data) => {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    log(`API call failed: ${error.message}`, 'error');
    throw error;
  }
};

const generateLesson = async (topicName, gradeLevel, skillLevel, strengths, weaknesses) => {
  const data = {
    topicName,
    gradeLevel: gradeLevel.toString(),
    currentSkillLevel: skillLevel,
    learnerStrengths: strengths || ['general social skills'],
    learnerWeaknesses: weaknesses || ['general social skills']
  };

  log(`Generating lesson: ${topicName} (Grade ${gradeLevel}, Skill ${skillLevel})`);
  return await makeAPICall('/api/generate-lesson', data);
};

const generateFeedback = async (scenarioContext, question, studentChoice, correctAnswer, choiceQuality, gradeLevel) => {
  const data = {
    scenarioContext,
    question,
    studentChoice,
    correctAnswer,
    choiceQuality,
    gradeLevel: gradeLevel.toString(),
    studentStrengths: ['general social skills'],
    studentWeaknesses: ['general social skills'],
    previousPerformance: 'First attempt'
  };

  return await makeAPICall('/api/generate-feedback', data);
};

/**
 * Quality Evaluation Functions
 */
const evaluateContentQuality = (lesson, gradeLevel, skillLevel) => {
  const results = {
    objectivesClear: false,
    scenariosAppropriate: false,
    vocabularyMatch: false,
    examplesRelatable: false,
    optionsVary: false,
    feedbackConstructive: false
  };

  const flags = [];

  // Check learning objectives
  if (lesson.introduction?.objective && lesson.introduction.objective.length > 10) {
    results.objectivesClear = true;
  } else {
    flags.push('Learning objective unclear or too short');
  }

  // Check scenarios appropriateness
  if (lesson.practiceScenarios && lesson.practiceScenarios.length > 0) {
    const scenarios = lesson.practiceScenarios;
    const appropriateCount = scenarios.filter(scenario => {
      const situation = scenario.situation?.toLowerCase() || '';
      const schoolSettings = ['school', 'classroom', 'playground', 'lunch', 'recess', 'class', 'teacher', 'student'];
      return schoolSettings.some(setting => situation.includes(setting));
    }).length;
    
    results.scenariosAppropriate = appropriateCount >= scenarios.length * 0.8;
    if (!results.scenariosAppropriate) {
      flags.push('Scenarios not appropriate for school setting');
    }
  }

  // Check vocabulary appropriateness
  const gradeNum = parseInt(gradeLevel);
  const text = JSON.stringify(lesson).toLowerCase();
  
  // Check for age-inappropriate vocabulary
  const advancedWords = ['sophisticated', 'complex', 'intricate', 'comprehensive', 'strategic'];
  const simpleWords = ['fun', 'nice', 'good', 'help', 'play', 'friend'];
  
  if (gradeNum <= 2) {
    results.vocabularyMatch = !advancedWords.some(word => text.includes(word));
    if (!results.vocabularyMatch) {
      flags.push('Vocabulary too advanced for grade level');
    }
  } else if (gradeNum >= 9) {
    results.vocabularyMatch = !simpleWords.some(word => text.includes(word)) || advancedWords.some(word => text.includes(word));
    if (!results.vocabularyMatch) {
      flags.push('Vocabulary too simple for grade level');
    }
  } else {
    results.vocabularyMatch = true; // Middle grades are flexible
  }

  // Check examples relatability
  if (lesson.explanation?.keyPoints && lesson.explanation.keyPoints.length > 0) {
    const examples = lesson.explanation.keyPoints.join(' ').toLowerCase();
    const relatableTerms = ['friend', 'classmate', 'teacher', 'school', 'playground', 'home', 'family'];
    results.examplesRelatable = relatableTerms.some(term => examples.includes(term));
    if (!results.examplesRelatable) {
      flags.push('Examples not relatable to student life');
    }
  }

  // Check option variety
  if (lesson.practiceScenarios && lesson.practiceScenarios.length > 0) {
    const scenarios = lesson.practiceScenarios;
    const variedScenarios = scenarios.filter(scenario => {
      const options = scenario.options || [];
      const qualities = options.map(opt => opt.quality).filter(Boolean);
      return new Set(qualities).size >= 2; // At least 2 different quality levels
    }).length;
    
    results.optionsVary = variedScenarios >= scenarios.length * 0.8;
    if (!results.optionsVary) {
      flags.push('Answer options lack variety in quality');
    }
  }

  // Check feedback constructiveness
  if (lesson.practiceScenarios && lesson.practiceScenarios.length > 0) {
    const scenarios = lesson.practiceScenarios;
    const constructiveFeedback = scenarios.filter(scenario => {
      const options = scenario.options || [];
      return options.every(opt => {
        const feedback = opt.feedback?.toLowerCase() || '';
        const constructive = feedback.includes('good') || feedback.includes('try') || feedback.includes('help') || feedback.includes('better');
        const notNegative = !feedback.includes('wrong') && !feedback.includes('bad') && !feedback.includes('terrible');
        return constructive && notNegative;
      });
    }).length;
    
    results.feedbackConstructive = constructiveFeedback >= scenarios.length * 0.8;
    if (!results.feedbackConstructive) {
      flags.push('Feedback not constructive or encouraging');
    }
  }

  return { results, flags };
};

const evaluateTechnicalQuality = (lesson) => {
  const results = {
    allFieldsPresent: false,
    jsonValid: false,
    scenarioCount: 0,
    optionsPerScenario: [],
    challengePresent: false
  };

  const flags = [];

  // Check required fields
  const requiredFields = ['introduction', 'explanation', 'practiceScenarios', 'summary'];
  const hasAllFields = requiredFields.every(field => lesson[field]);
  results.allFieldsPresent = hasAllFields;
  if (!hasAllFields) {
    flags.push('Missing required lesson fields');
  }

  // Check JSON validity (already parsed, so this is true if we got here)
  results.jsonValid = true;

  // Check scenario count
  const scenarioCount = lesson.practiceScenarios?.length || 0;
  results.scenarioCount = scenarioCount;
  if (scenarioCount !== 5) {
    flags.push(`Expected 5 scenarios, got ${scenarioCount}`);
  }

  // Check options per scenario
  if (lesson.practiceScenarios) {
    results.optionsPerScenario = lesson.practiceScenarios.map(scenario => {
      const count = scenario.options?.length || 0;
      if (count < 3 || count > 4) {
        flags.push(`Scenario has ${count} options (expected 3-4)`);
      }
      return count;
    });
  }

  // Check real-world challenge
  results.challengePresent = !!lesson.summary?.realWorldChallenge;
  if (!results.challengePresent) {
    flags.push('Missing real-world challenge');
  }

  return { results, flags };
};

const evaluateAgeAppropriateness = (lesson, gradeLevel) => {
  const results = {
    noWorkplaceTerms: false,
    appropriateTopics: false,
    correctSettings: false,
    appropriateRelationships: false
  };

  const flags = [];
  const text = JSON.stringify(lesson).toLowerCase();

  // Check for workplace terms
  const workplaceTerms = ['coworker', 'colleague', 'workplace', 'office', 'professional', 'business', 'corporate', 'employee', 'supervisor', 'hr', 'management', 'career', 'resume', 'interview', 'meeting', 'client', 'customer', 'boss', 'manager'];
  const foundWorkplaceTerms = workplaceTerms.filter(term => text.includes(term));
  
  results.noWorkplaceTerms = foundWorkplaceTerms.length === 0;
  if (!results.noWorkplaceTerms) {
    flags.push(`Found workplace terms: ${foundWorkplaceTerms.join(', ')}`);
  }

  // Check appropriate topics
  const inappropriateTopics = ['dating', 'romance', 'adult', 'mature', 'inappropriate'];
  const foundInappropriateTopics = inappropriateTopics.filter(topic => text.includes(topic));
  
  results.appropriateTopics = foundInappropriateTopics.length === 0;
  if (!results.appropriateTopics) {
    flags.push(`Found inappropriate topics: ${foundInappropriateTopics.join(', ')}`);
  }

  // Check settings
  const appropriateSettings = ['school', 'classroom', 'playground', 'lunch', 'recess', 'home', 'family', 'friend', 'classmate', 'teacher'];
  const foundAppropriateSettings = appropriateSettings.filter(setting => text.includes(setting));
  
  results.correctSettings = foundAppropriateSettings.length > 0;
  if (!results.correctSettings) {
    flags.push('No appropriate school/home settings found');
  }

  // Check relationships
  const appropriateRelationships = ['classmate', 'friend', 'teacher', 'parent', 'family', 'sibling', 'teammate', 'neighbor'];
  const foundAppropriateRelationships = appropriateRelationships.filter(relationship => text.includes(relationship));
  
  results.appropriateRelationships = foundAppropriateRelationships.length > 0;
  if (!results.appropriateRelationships) {
    flags.push('No appropriate relationships found');
  }

  return { results, flags };
};

const evaluateConsistency = (lesson, topicName, gradeLevel, skillLevel) => {
  const results = {
    difficultyMatches: false,
    alignsWithTopic: false,
    toneConsistent: false,
    addressesKeySkills: false
  };

  const flags = [];
  const text = JSON.stringify(lesson).toLowerCase();
  const topicKey = topicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const template = getTemplate(topicKey);

  // Check difficulty matches skill level
  const gradeNum = parseInt(gradeLevel);
  if (skillLevel <= 2 && gradeNum <= 5) {
    // Should be simple
    const complexTerms = ['advanced', 'sophisticated', 'complex', 'intricate'];
    results.difficultyMatches = !complexTerms.some(term => text.includes(term));
  } else if (skillLevel >= 4 && gradeNum >= 9) {
    // Should be more advanced
    const simpleTerms = ['very simple', 'basic', 'easy'];
    results.difficultyMatches = !simpleTerms.some(term => text.includes(term));
  } else {
    results.difficultyMatches = true; // Middle range is flexible
  }

  if (!results.difficultyMatches) {
    flags.push('Difficulty level does not match skill level');
  }

  // Check topic alignment
  if (template) {
    const keySkills = template.keySkills || [];
    const foundSkills = keySkills.filter(skill => text.includes(skill.toLowerCase()));
    results.addressesKeySkills = foundSkills.length >= keySkills.length * 0.5;
    if (!results.addressesKeySkills) {
      flags.push(`Missing key skills: ${keySkills.filter(skill => !text.includes(skill.toLowerCase())).join(', ')}`);
    }
  }

  results.alignsWithTopic = text.includes(topicName.toLowerCase()) || (template && text.includes(template.displayName.toLowerCase()));
  if (!results.alignsWithTopic) {
    flags.push('Content does not align with topic');
  }

  // Check tone consistency
  const encouragingTerms = ['good', 'great', 'helpful', 'friendly', 'kind', 'supportive'];
  const negativeTerms = ['bad', 'wrong', 'terrible', 'awful', 'horrible'];
  
  const encouragingCount = encouragingTerms.filter(term => text.includes(term)).length;
  const negativeCount = negativeTerms.filter(term => text.includes(term)).length;
  
  results.toneConsistent = encouragingCount > negativeCount;
  if (!results.toneConsistent) {
    flags.push('Tone not consistently positive and encouraging');
  }

  return { results, flags };
};

/**
 * Main Testing Functions
 */
const testSingleLesson = async (topicName, gradeLevel, skillLevel, strengths, weaknesses) => {
  log(`Testing single lesson: ${topicName} (Grade ${gradeLevel}, Skill ${skillLevel})`);
  
  try {
    const response = await generateLesson(topicName, gradeLevel, skillLevel, strengths, weaknesses);
    
    if (!response.success || !response.lesson) {
      throw new Error('Failed to generate lesson');
    }

    const lesson = response.lesson;
    
    // Run all evaluations
    const contentQuality = evaluateContentQuality(lesson, gradeLevel, skillLevel);
    const technicalQuality = evaluateTechnicalQuality(lesson);
    const ageAppropriateness = evaluateAgeAppropriateness(lesson, gradeLevel);
    const consistency = evaluateConsistency(lesson, topicName, gradeLevel, skillLevel);

    // Combine all flags
    const allFlags = [
      ...contentQuality.flags,
      ...technicalQuality.flags,
      ...ageAppropriateness.flags,
      ...consistency.flags
    ];

    // Calculate overall score
    const totalChecks = 20; // Total number of checks across all categories
    const passedChecks = [
      ...Object.values(contentQuality.results),
      ...Object.values(technicalQuality.results),
      ...Object.values(ageAppropriateness.results),
      ...Object.values(consistency.results)
    ].filter(Boolean).length;

    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    const testResult = {
      topic: topicName,
      gradeLevel: gradeLevel.toString(),
      skillLevel,
      timestamp: new Date().toISOString(),
      results: {
        contentQuality: contentQuality.results,
        technicalQuality: technicalQuality.results,
        ageAppropriateness: ageAppropriateness.results,
        consistency: consistency.results
      },
      flags: allFlags,
      overallScore,
      recommendation: overallScore >= 90 ? 'PASS' : overallScore >= 70 ? 'REVIEW' : 'ADJUST_PROMPT',
      lesson: lesson // Include full lesson for inspection
    };

    return testResult;

  } catch (error) {
    log(`Test failed: ${error.message}`, 'error');
    return {
      topic: topicName,
      gradeLevel: gradeLevel.toString(),
      skillLevel,
      timestamp: new Date().toISOString(),
      error: error.message,
      overallScore: 0,
      recommendation: 'FAILED'
    };
  }
};

const runQualityTests = async (options = {}) => {
  const {
    topics = getAllTemplateKeys(),
    grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    skillLevels = [1, 2, 3, 4, 5],
    maxTests = 50
  } = options;

  log(`Starting quality tests: ${topics.length} topics, ${grades.length} grades, ${skillLevels.length} skill levels`);
  
  currentTestSession = {
    startTime: new Date().toISOString(),
    totalTests: 0,
    completedTests: 0,
    failedTests: 0
  };

  const results = [];

  for (let i = 0; i < maxTests && i < topics.length * grades.length * skillLevels.length; i++) {
    const topicIndex = i % topics.length;
    const gradeIndex = Math.floor(i / topics.length) % grades.length;
    const skillIndex = Math.floor(i / (topics.length * grades.length)) % skillLevels.length;

    const topic = topics[topicIndex];
    const grade = grades[gradeIndex];
    const skillLevel = skillLevels[skillIndex];

    currentTestSession.totalTests++;
    
    try {
      const result = await testSingleLesson(topic, grade, skillLevel);
      results.push(result);
      currentTestSession.completedTests++;
      
      log(`Test ${i + 1}/${maxTests}: ${topic} (Grade ${grade}, Skill ${skillLevel}) - Score: ${result.overallScore}%`);
      
      // Add delay to avoid rate limiting
      await delay(CONFIG.DELAY_BETWEEN_CALLS);
      
    } catch (error) {
      currentTestSession.failedTests++;
      log(`Test ${i + 1} failed: ${error.message}`, 'error');
    }
  }

  currentTestSession.endTime = new Date().toISOString();
  testResults = results;
  
  return results;
};

const generateQualityReport = (results) => {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.overallScore >= 90).length;
  const flaggedTests = results.filter(r => r.overallScore >= 70 && r.overallScore < 90).length;
  const failedTests = results.filter(r => r.overallScore < 70).length;

  // Group by topic
  const topicStats = {};
  results.forEach(result => {
    if (!topicStats[result.topic]) {
      topicStats[result.topic] = { total: 0, scores: [] };
    }
    topicStats[result.topic].total++;
    topicStats[result.topic].scores.push(result.overallScore);
  });

  // Group by grade level
  const gradeStats = {};
  results.forEach(result => {
    if (!gradeStats[result.gradeLevel]) {
      gradeStats[result.gradeLevel] = { total: 0, scores: [] };
    }
    gradeStats[result.gradeLevel].total++;
    gradeStats[result.gradeLevel].scores.push(result.overallScore);
  });

  // Find common issues
  const allFlags = results.flatMap(r => r.flags || []);
  const flagCounts = {};
  allFlags.forEach(flag => {
    flagCounts[flag] = (flagCounts[flag] || 0) + 1;
  });

  const commonIssues = Object.entries(flagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Generate report
  const report = `
========================================
AI QUALITY TEST REPORT
Generated: ${new Date().toLocaleDateString()}
========================================

OVERALL RESULTS:
✅ ${passedTests} tests passed (${Math.round(passedTests/totalTests*100)}%)
⚠️  ${flaggedTests} tests flagged for review (${Math.round(flaggedTests/totalTests*100)}%)
❌ ${failedTests} tests failed critically (${Math.round(failedTests/totalTests*100)}%)

BY TOPIC:
${Object.entries(topicStats).map(([topic, stats]) => {
  const avgScore = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length);
  const status = avgScore >= 90 ? '✅' : avgScore >= 70 ? '⚠️' : '❌';
  return `${status} ${topic}: ${avgScore}% (${stats.total} tests)`;
}).join('\n')}

BY GRADE LEVEL:
${Object.entries(gradeStats).map(([grade, stats]) => {
  const avgScore = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length);
  const status = avgScore >= 90 ? '✅' : avgScore >= 70 ? '⚠️' : '❌';
  return `${status} Grade ${grade}: ${avgScore}% (${stats.total} tests)`;
}).join('\n')}

COMMON ISSUES:
${commonIssues.map(([issue, count], i) => `${i + 1}. ${issue} (${count} occurrences)`).join('\n')}

RECOMMENDATIONS:
${commonIssues.length > 0 ? '📝 Review and adjust prompt templates for topics with low scores\n📝 Address common issues in prompt instructions\n📝 Consider grade-specific vocabulary guidelines' : '🎉 All tests passing! No immediate action needed.'}

========================================
`;

  return report;
};

const suggestPromptImprovements = (testResults) => {
  const suggestions = [];
  
  // Analyze failing tests
  const failingTests = testResults.filter(r => r.overallScore < 70);
  const flaggedTests = testResults.filter(r => r.overallScore >= 70 && r.overallScore < 90);
  
  if (failingTests.length > 0) {
    suggestions.push('🚨 CRITICAL: Multiple tests failing - review prompt templates immediately');
  }
  
  if (flaggedTests.length > 0) {
    suggestions.push('⚠️ REVIEW: Several tests flagged - consider prompt adjustments');
  }
  
  // Analyze common flags
  const allFlags = testResults.flatMap(r => r.flags || []);
  const flagCounts = {};
  allFlags.forEach(flag => {
    flagCounts[flag] = (flagCounts[flag] || 0) + 1;
  });
  
  const topFlags = Object.entries(flagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  topFlags.forEach(([flag, count]) => {
    if (flag.includes('workplace')) {
      suggestions.push('📝 Strengthen workplace term restrictions in prompt');
    } else if (flag.includes('vocabulary')) {
      suggestions.push('📝 Add grade-specific vocabulary guidelines to templates');
    } else if (flag.includes('scenario')) {
      suggestions.push('📝 Improve scenario context instructions in templates');
    } else if (flag.includes('skill')) {
      suggestions.push('📝 Ensure all key skills are addressed in prompt instructions');
    }
  });
  
  return suggestions;
};

const compareBeforeAfter = async (topicName, gradeLevel, skillLevel = 3) => {
  log(`Comparing before/after for ${topicName} (Grade ${gradeLevel})`);
  
  const beforeResult = await testSingleLesson(topicName, gradeLevel, skillLevel);
  
  log(`BEFORE: Score ${beforeResult.overallScore}%`);
  if (beforeResult.flags && beforeResult.flags.length > 0) {
    log(`Issues: ${beforeResult.flags.join(', ')}`);
  }
  
  log('Make your prompt changes now, then press Enter to test again...');
  
  // In a real implementation, you'd wait for user input
  // For now, we'll just return the before result
  return beforeResult;
};

/**
 * Command Line Interface
 */
const runCommand = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
AI Quality Testing System

Usage:
  node testAIQuality.js --full                    # Run full test suite
  node testAIQuality.js --quick                   # Quick test (3 random)
  node testAIQuality.js --topic "Topic Name"     # Test specific topic
  node testAIQuality.js --grade 7                # Test specific grade
  node testAIQuality.js --single "Topic" 4 2     # Test single lesson
  node testAIQuality.js --compare "Topic" 5      # Compare before/after
    `);
    return;
  }
  
  let results = [];
  
  if (args.includes('--full')) {
    log('Running full test suite...');
    results = await runQualityTests({ maxTests: 100 });
  } else if (args.includes('--quick')) {
    log('Running quick test...');
    results = await runQualityTests({ maxTests: 3 });
  } else if (args.includes('--topic')) {
    const topicIndex = args.indexOf('--topic');
    const topic = args[topicIndex + 1];
    log(`Testing topic: ${topic}`);
    results = await runQualityTests({ topics: [topic], maxTests: 20 });
  } else if (args.includes('--grade')) {
    const gradeIndex = args.indexOf('--grade');
    const grade = args[gradeIndex + 1];
    log(`Testing grade: ${grade}`);
    results = await runQualityTests({ grades: [grade], maxTests: 20 });
  } else if (args.includes('--single')) {
    const singleIndex = args.indexOf('--single');
    const topic = args[singleIndex + 1];
    const grade = args[singleIndex + 2];
    const skill = args[singleIndex + 3] || 3;
    log(`Testing single lesson: ${topic} (Grade ${grade}, Skill ${skill})`);
    const result = await testSingleLesson(topic, grade, skill);
    results = [result];
  } else if (args.includes('--compare')) {
    const compareIndex = args.indexOf('--compare');
    const topic = args[compareIndex + 1];
    const grade = args[compareIndex + 2];
    const result = await compareBeforeAfter(topic, grade);
    results = [result];
  }
  
  if (results.length > 0) {
    const report = generateQualityReport(results);
    console.log(report);
    
    const suggestions = suggestPromptImprovements(results);
    if (suggestions.length > 0) {
      console.log('\nSUGGESTIONS:');
      suggestions.forEach(suggestion => console.log(suggestion));
    }
    
    await saveResults({
      session: currentTestSession,
      results: results,
      report: report,
      suggestions: suggestions,
      generatedAt: new Date().toISOString()
    });
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCommand().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

export {
  testSingleLesson,
  runQualityTests,
  generateQualityReport,
  suggestPromptImprovements,
  compareBeforeAfter,
  evaluateContentQuality,
  evaluateTechnicalQuality,
  evaluateAgeAppropriateness,
  evaluateConsistency
};

# AI Quality Testing System

This system evaluates AI-generated lesson quality and provides tools for prompt improvement.

## Overview

The AI Quality Testing System helps ensure that AI-generated social skills lessons are:
- **Age-appropriate** for the target grade level
- **Technically complete** with all required fields
- **Content-rich** with clear objectives and constructive feedback
- **Consistent** in tone and difficulty
- **Free of inappropriate content** (workplace terms, mature topics)

## Quick Start

### 1. Run a Quick Test
```bash
node testAIQuality.js --quick
```
Tests 3 random lessons and shows results.

### 2. Test a Specific Topic
```bash
node testAIQuality.js --topic "Small Talk Basics"
```
Tests the specified topic across multiple grades and skill levels.

### 3. Test a Specific Grade
```bash
node testAIQuality.js --grade 7
```
Tests grade 7 across multiple topics and skill levels.

### 4. Test a Single Lesson
```bash
node testAIQuality.js --single "Active Listening" 4 2
```
Tests one specific lesson (topic, grade, skill level).

### 5. Run Full Test Suite
```bash
node testAIQuality.js --full
```
Tests all topics, grades, and skill levels (up to 100 tests).

## Understanding Results

### Overall Score
- **90-100%**: ✅ **PASS** - Lesson meets all quality standards
- **70-89%**: ⚠️ **REVIEW** - Minor issues, consider adjustments
- **0-69%**: ❌ **ADJUST_PROMPT** - Significant issues, prompt needs work

### Quality Categories

#### Content Quality
- **objectivesClear**: Learning objectives are clear and specific
- **scenariosAppropriate**: Scenarios happen in school/friend settings
- **vocabularyMatch**: Vocabulary appropriate for grade level
- **examplesRelatable**: Examples relate to student life
- **optionsVary**: Answer options have different quality levels
- **feedbackConstructive**: Feedback is encouraging and helpful

#### Technical Quality
- **allFieldsPresent**: All required lesson fields included
- **jsonValid**: Response is valid JSON
- **scenarioCount**: Exactly 5 practice scenarios
- **optionsPerScenario**: Each scenario has 3-4 options
- **challengePresent**: Real-world challenge included

#### Age Appropriateness
- **noWorkplaceTerms**: No adult workplace language
- **appropriateTopics**: No inappropriate topics for age
- **correctSettings**: Settings are school/home/friend-based
- **appropriateRelationships**: Relationships are age-appropriate

#### Consistency
- **difficultyMatches**: Difficulty matches requested skill level
- **alignsWithTopic**: Content aligns with the topic
- **toneConsistent**: Tone is consistently positive
- **addressesKeySkills**: Key skills from template are addressed

### Flags
Flags highlight specific issues found:
- `"Vocabulary too advanced for grade level"`
- `"Missing key skills: asking questions, active listening"`
- `"Found workplace terms: professional, career"`
- `"Scenarios not appropriate for school setting"`

## Interpreting Test Reports

### Sample Report
```
========================================
AI QUALITY TEST REPORT
Generated: October 21, 2025
========================================

OVERALL RESULTS:
✅ 34 tests passed (85%)
⚠️  6 tests flagged for review (15%)
❌ 0 tests failed critically (0%)

BY TOPIC:
✅ Small Talk Basics: 92% (needs minor tweaks)
⚠️  Active Listening: 78% (prompt adjustment needed)
✅ Starting Conversations: 88%
⚠️  Joining Groups: 75% (scenarios too complex)
...

BY GRADE LEVEL:
✅ K-2: 90%
✅ 3-5: 88%
⚠️  6-8: 72% (vocabulary issues)
✅ 9-12: 85%

COMMON ISSUES:
1. Active Listening scenarios for grade 6-8 use vocabulary too advanced (4 occurrences)
2. Joining Groups challenges not specific enough (3 occurrences)
3. Grade 7 content occasionally too mature (2 occurrences)

RECOMMENDATIONS:
📝 Adjust prompt template for Active Listening
📝 Add more specificity to Joining Groups challenges
📝 Review grade 6-8 vocabulary guidelines
========================================
```

### What This Tells You

1. **Overall Health**: 85% pass rate is good, but 15% need attention
2. **Problem Topics**: Active Listening and Joining Groups need work
3. **Problem Grades**: Grade 6-8 has vocabulary issues
4. **Common Patterns**: Multiple issues with the same problems
5. **Action Items**: Specific recommendations for improvement

## Adjusting Prompts Based on Results

### 1. Identify the Problem
Look at the flags and common issues:
- Vocabulary problems → Update grade-specific language guidelines
- Missing skills → Add skill requirements to prompt instructions
- Workplace terms → Strengthen banned word restrictions
- Scenario issues → Improve context instructions

### 2. Update Prompt Templates
Edit `promptTemplates.js`:

```javascript
'active-listening': {
  // ... existing template ...
  promptInstructions: `When generating lessons about active listening, focus on:
- Teaching both verbal and non-verbal listening cues
- Emphasizing empathy and understanding
- Showing the difference between hearing and truly listening
- Building skills for asking meaningful follow-up questions
- Demonstrating how listening strengthens relationships
- Use simple vocabulary for grades 6-8 (avoid "sophisticated", "intricate")`
}
```

### 3. Test Your Changes
```bash
node testAIQuality.js --topic "Active Listening"
```

### 4. Compare Before/After
```bash
node testAIQuality.js --compare "Active Listening" 7
```

## Common Issues and Solutions

### Issue: "Vocabulary too advanced for grade level"
**Solution**: Add grade-specific vocabulary guidelines to templates
```javascript
// In template promptInstructions
- Use simple words for grades K-2: "good", "nice", "help"
- Use clear words for grades 3-5: "friendly", "kind", "supportive"  
- Avoid complex words for grades 6-8: "sophisticated", "intricate"
```

### Issue: "Missing key skills: asking questions"
**Solution**: Ensure all key skills are mentioned in prompt
```javascript
// In template promptInstructions
- Make sure scenarios practice: asking questions, active listening, empathy
- Include examples of each key skill in practice scenarios
```

### Issue: "Found workplace terms: professional, career"
**Solution**: Strengthen banned word restrictions
```javascript
// In server.js prompt
❌ NEVER use these words: coworkers, colleagues, workplace, office, professional, networking, business, corporate, supervisor, employee, HR, management, career, resume, interview, meeting, client, customer, boss, manager
```

### Issue: "Scenarios not appropriate for school setting"
**Solution**: Add specific setting requirements
```javascript
// In template scenarioContexts
'6-8': ['between classes', 'lunch period', 'clubs', 'social events', 'online chats']
// In promptInstructions
- All scenarios must happen at school, home, or with friends
- Use these specific settings: [list from scenarioContexts]
```

## Adding New Topics

### 1. Add Template
Add new topic to `promptTemplates.js`:
```javascript
'new-topic': {
  displayName: 'New Topic',
  learningObjectives: {
    'K-2': 'Simple objective for young kids',
    '3-5': 'Clear objective for elementary',
    '6-8': 'Appropriate objective for middle school',
    '9-12': 'Sophisticated objective for high school'
  },
  keySkills: ['skill1', 'skill2', 'skill3'],
  commonMistakes: ['mistake1', 'mistake2'],
  scenarioContexts: {
    'K-2': ['playground', 'classroom'],
    '3-5': ['school', 'home'],
    '6-8': ['school', 'clubs'],
    '9-12': ['school', 'activities']
  },
  realWorldChallenges: {
    'K-2': 'Simple challenge',
    '3-5': 'Clear challenge',
    '6-8': 'Appropriate challenge',
    '9-12': 'Sophisticated challenge'
  },
  promptInstructions: 'Specific instructions for this topic...'
}
```

### 2. Test New Topic
```bash
node testAIQuality.js --topic "New Topic"
```

### 3. Iterate Based on Results
Use flags and scores to refine the template until it passes tests.

## Best Practices

### 1. Test Regularly
- Run quick tests after any prompt changes
- Run full tests weekly
- Test new topics thoroughly before deploying

### 2. Focus on Patterns
- Don't fix individual failures, fix patterns
- If multiple topics have the same issue, fix the root cause
- Look for grade-level patterns across topics

### 3. Use Specific Examples
- Include specific examples in prompt instructions
- Show what good vs bad looks like
- Use age-appropriate language examples

### 4. Validate Changes
- Always test after making changes
- Compare before/after results
- Document what changes improved scores

### 5. Monitor Trends
- Track scores over time
- Watch for regressions
- Celebrate improvements

## Troubleshooting

### Tests Taking Too Long
- Reduce `maxTests` in `runQualityTests()`
- Increase `DELAY_BETWEEN_CALLS` if hitting rate limits
- Use `--quick` for faster testing

### API Errors
- Check server is running: `curl http://localhost:3001/api/health`
- Verify API key is set in `.env`
- Check server logs for errors

### Inconsistent Results
- This is normal - AI responses vary
- Focus on patterns, not individual results
- Run multiple tests to see trends

### Low Scores
- Don't panic - scores improve with iteration
- Focus on the most common flags first
- Make small changes and test frequently

## File Structure

```
backend/
├── testAIQuality.js          # Main testing system
├── promptTemplates.js        # Template definitions
├── server.js                 # API endpoints
└── ai-quality-tests-*.json   # Test result logs
```

## Contributing

When adding new features:
1. Add tests for new functionality
2. Update documentation
3. Test with multiple topics/grades
4. Ensure backward compatibility

## Support

For issues or questions:
1. Check the test logs in `ai-quality-tests-*.json`
2. Run with `--single` to isolate problems
3. Review the flags for specific issues
4. Test individual components separately

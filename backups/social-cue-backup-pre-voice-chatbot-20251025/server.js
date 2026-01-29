import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Anthropic from '@anthropic-ai/sdk';
import { getTemplate, getDisplayName } from './promptTemplates.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs, serverTimestamp, writeBatch, deleteDoc } from 'firebase/firestore';
import adaptiveLearningRoutes from './adaptive-learning-routes.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date() });
});

// Firebase connection test endpoint
app.get('/api/test-firebase', async (req, res) => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test basic Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: serverTimestamp(),
      message: 'Firebase connection test',
      status: 'success'
    });
    
    console.log('✅ Firebase write test successful');
    
    // Test reading the document
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firebase read test successful');
      res.json({ 
        success: true, 
        message: 'Firebase connection successful',
        data: docSnap.data()
      });
    } else {
      throw new Error('Document not found after write');
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Firebase connection failed',
      details: error.message
    });
  }
});

// Lesson caching functions
const generateLessonCacheKey = (topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses) => {
  const strengths = learnerStrengths?.sort().join(',') || '';
  const weaknesses = learnerWeaknesses?.sort().join(',') || '';
  return `${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeLevel}-${currentSkillLevel}-${strengths}-${weaknesses}`;
};

const getCachedLesson = async (cacheKey) => {
  try {
    console.log(`🔍 Checking cache for lesson: ${cacheKey}`);
    const lessonRef = doc(db, 'ai_lessons', cacheKey);
    const lessonSnap = await getDoc(lessonRef);
    
    if (lessonSnap.exists()) {
      const cachedLesson = lessonSnap.data();
      console.log(`✅ Found cached lesson: "${cachedLesson.lesson?.introduction?.title || 'Unknown Title'}"`);
      return cachedLesson;
    } else {
      console.log(`❌ No cached lesson found for: ${cacheKey}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking lesson cache:', error);
    return null;
  }
};

const cacheLesson = async (cacheKey, lessonData, usage, costEstimate) => {
  try {
    console.log(`💾 Caching lesson: ${cacheKey}`);
    const lessonRef = doc(db, 'ai_lessons', cacheKey);
    await setDoc(lessonRef, {
      lesson: lessonData,
      usage,
      costEstimate,
      cachedAt: serverTimestamp(),
      cacheKey
    });
    console.log(`✅ Lesson cached successfully`);
  } catch (error) {
    console.error('❌ Error caching lesson:', error);
    // Don't throw error - caching failure shouldn't break the response
  }
};

// Generate complete AI lesson endpoint
app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses } = req.body;
    
    console.log(`📚 Generating AI lesson for: ${topicName}, Grade: ${gradeLevel}, Skill Level: ${currentSkillLevel}`);
    console.log(`🎯 Strengths: ${learnerStrengths?.join(', ') || 'None specified'}`);
    console.log(`🔧 Weaknesses: ${learnerWeaknesses?.join(', ') || 'None specified'}`);
    
    // Generate cache key and check for existing lesson (skip caching for now)
    const cacheKey = generateLessonCacheKey(topicName, gradeLevel, currentSkillLevel, learnerStrengths, learnerWeaknesses);
    console.log(`🔄 Generating new lesson (cache key: ${cacheKey})...`);
    
    // Age-appropriate guidelines for exact grades
    const getGradeGuidelines = (grade) => {
      const gradeNum = parseInt(grade);
      
      // Kindergarten
      if (grade === 'K' || grade === '0') {
        return {
          language: 'Very simple words, short sentences (3-6 words per sentence)',
          topics: 'sharing toys, taking turns, saying sorry, making friends, asking to play',
          settings: 'playground, lunch table, classroom, recess, story time',
          avoid: 'dating, complex emotions, abstract concepts, adult situations',
          timeEstimate: '5-6 minutes',
          exampleTitle: 'Making Friends at Recess',
          ageContext: 'kindergartener (5-6 years old)'
        };
      }
      
      // Grades 1-2 (Early Elementary)
      if (gradeNum >= 1 && gradeNum <= 2) {
        return {
          language: 'Simple words, short sentences (4-8 words per sentence)',
          topics: 'sharing, taking turns, saying sorry, making friends, following rules',
          settings: 'playground, lunch table, classroom, recess, reading time',
          avoid: 'dating, complex emotions, abstract concepts, adult situations',
          timeEstimate: '6-8 minutes',
          exampleTitle: 'Sharing and Taking Turns',
          ageContext: `${gradeNum === 1 ? '1st grader' : '2nd grader'} (${gradeNum === 1 ? '6-7' : '7-8'} years old)`
        };
      }
      
      // Grades 3-5 (Elementary)
      if (gradeNum >= 3 && gradeNum <= 5) {
        return {
          language: 'Clear, concrete language (5-12 words per sentence)',
          topics: 'group work, handling disagreements, including others, following rules',
          settings: 'school projects, recess, clubs, art class, science lab',
          avoid: 'romantic relationships, mature themes, complex social dynamics',
          timeEstimate: '8-12 minutes',
          exampleTitle: 'Working Together in Groups',
          ageContext: `${gradeNum}${gradeNum === 3 ? 'rd' : gradeNum === 4 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Grades 6-8 (Middle School)
      if (gradeNum >= 6 && gradeNum <= 8) {
        return {
          language: 'Age-appropriate teen language (8-15 words per sentence)',
          topics: 'peer pressure, social media etiquette, conflict resolution, teamwork',
          settings: 'middle school, group chats, lunch tables, sports teams, clubs',
          avoid: 'adult relationships, workplace scenarios, inappropriate content',
          timeEstimate: '10-15 minutes',
          exampleTitle: 'Handling Peer Pressure',
          ageContext: `${gradeNum}${gradeNum === 6 ? 'th' : gradeNum === 7 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Grades 9-12 (High School)
      if (gradeNum >= 9 && gradeNum <= 12) {
        return {
          language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
          topics: 'leadership, conflict resolution, college prep, part-time jobs, relationships',
          settings: 'extracurriculars, part-time jobs, college prep, clubs, school events',
          avoid: 'inappropriate content for high schoolers, adult-only situations',
          timeEstimate: '12-15 minutes',
          exampleTitle: 'Building Leadership Skills',
          ageContext: `${gradeNum}${gradeNum === 9 ? 'th' : gradeNum === 10 ? 'th' : gradeNum === 11 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      // Default fallback
      return {
        language: 'Age-appropriate language (8-15 words per sentence)',
        topics: 'general social skills, friendship, communication, teamwork',
        settings: 'school, classroom, playground, lunch table, recess',
        avoid: 'inappropriate content, adult situations',
        timeEstimate: '10-12 minutes',
        exampleTitle: 'Social Skills Practice',
        ageContext: `student in grade ${grade}`
      };
    };
    
    const guidelines = getGradeGuidelines(gradeLevel);
    
    // Skill level adaptations
    const skillLevelAdaptations = {
      1: { difficulty: 'beginner', explanation: 'very simple', examples: 'basic', complexity: 'low' },
      2: { difficulty: 'beginner-intermediate', explanation: 'simple', examples: 'common', complexity: 'low-medium' },
      3: { difficulty: 'intermediate', explanation: 'clear', examples: 'varied', complexity: 'medium' },
      4: { difficulty: 'intermediate-advanced', explanation: 'detailed', examples: 'complex', complexity: 'medium-high' },
      5: { difficulty: 'advanced', explanation: 'comprehensive', examples: 'sophisticated', complexity: 'high' }
    };
    
    const skillAdaptation = skillLevelAdaptations[currentSkillLevel] || skillLevelAdaptations[3];
    
    // Get template for this topic
    const topicKey = (topicName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const template = getTemplate(topicKey);
    
    if (!template) {
      console.log(`⚠️ No template found for topic: ${topicName}, using generic template`);
    }
    
    // Build enhanced prompt using template
    const templateInfo = template ? `
LEARNING OBJECTIVES FOR ${gradeLevel}:
${template.learningObjectives[gradeLevel] || template.learningObjectives['3-5']}

KEY SKILLS TO TEACH:
${template.keySkills?.join(', ') || 'General social skills'}

COMMON MISTAKES TO ADDRESS:
${template.commonMistakes?.join(', ') || 'General social mistakes'}

SCENARIO CONTEXTS (use these settings):
${template.scenarioContexts?.[gradeLevel]?.join(', ') || 'school, classroom, playground'}

REAL-WORLD CHALLENGE:
${template.realWorldChallenges?.[gradeLevel] || 'Practice this skill in your daily life'}

TOPIC-SPECIFIC INSTRUCTIONS:
${template.promptInstructions || 'Focus on building social skills appropriate for this age group'}` : `
LEARNING OBJECTIVES FOR ${gradeLevel}:
Learn important social skills for ${gradeLevel}

KEY SKILLS TO TEACH:
General social skills, communication, friendship

COMMON MISTAKES TO ADDRESS:
Common social mistakes, inappropriate behavior

SCENARIO CONTEXTS (use these settings):
school, classroom, playground, lunch table

REAL-WORLD CHALLENGE:
Practice this skill in your daily life

TOPIC-SPECIFIC INSTRUCTIONS:
Focus on building social skills appropriate for this age group`;

    const prompt = `You are creating a complete social skills lesson for a CHILD who is a ${guidelines.ageContext}.

ABSOLUTE RESTRICTIONS - YOU MUST FOLLOW THESE:
❌ NEVER use these words: coworkers, colleagues, workplace, office, professional, networking, business, corporate, supervisor, employee, HR, management, career, resume, interview, meeting, client, customer, boss, manager
❌ NEVER include: job interviews, work meetings, workplace conflicts, career advice, business situations, professional relationships
❌ ONLY use these settings: school, classroom, playground, lunch table, recess, sports practice, after-school clubs, birthday parties, sleepovers, family events, neighborhood park, school bus, library, cafeteria, gym class, art class, music class
❌ ONLY use these relationships: classmates, friends, siblings, parents, teachers, coaches, teammates, neighbors, cousins

Use language and concepts appropriate for a ${guidelines.ageContext}. Every scenario, example, and explanation must be developmentally appropriate for this specific age.

EVERY part of the lesson must pass this test: 'Would this happen at school or with friends?'
If NO, do not include it.

LESSON REQUIREMENTS:
Topic: ${topicName}
Grade Level: ${gradeLevel} (${guidelines.ageContext})
Current Skill Level: ${currentSkillLevel} (${skillAdaptation.difficulty})
Learner Strengths: ${learnerStrengths?.join(', ') || 'General social skills'}
Learner Weaknesses: ${learnerWeaknesses?.join(', ') || 'General social skills'}

${templateInfo}

AGE-SPECIFIC GUIDELINES FOR ${guidelines.ageContext}:
- Language: ${guidelines.language}
- Topics: ${guidelines.topics}
- Settings: ${guidelines.settings}
- AVOID: ${guidelines.avoid}
- Time Estimate: ${guidelines.timeEstimate}

SKILL LEVEL ADAPTATION (Level ${currentSkillLevel}):
- Difficulty: ${skillAdaptation.difficulty}
- Explanation Style: ${skillAdaptation.explanation}
- Example Complexity: ${skillAdaptation.examples}
- Overall Complexity: ${skillAdaptation.complexity}

PERSONALIZATION:
- Build on these strengths: ${learnerStrengths?.join(', ') || 'general social skills'}
- Focus on improving: ${learnerWeaknesses?.join(', ') || 'general social skills'}
- Adapt difficulty to skill level ${currentSkillLevel}

LESSON STRUCTURE:
Create a complete lesson with these sections:

1. INTRODUCTION:
   - Title: Age-appropriate and engaging
   - Learning Objective: What they'll learn (1-2 sentences)
   - Why It Matters: Real-world relevance for their age
   - Estimated Time: ${guidelines.timeEstimate}

2. EXPLANATION:
   - Main Concept: Simple explanation of ${topicName}
   - Key Points: 2-3 important things to remember
   - Common Mistakes: 2-3 things to avoid

3. PRACTICE SCENARIOS (5 questions):
   Each scenario should have:
   - Situation: Real-world context for ${gradeLevel}
   - Question: What should they do?
   - 4 Options: 1 excellent, 2 good attempts, 1 poor choice
   - Feedback: Encouraging explanation for each choice
   - Tips: Specific improvement suggestions

4. SUMMARY:
   - What You Learned: Recap of main points
   - Key Takeaway: 1 sentence they should remember
   - Real-World Challenge: Specific action they can try today
   - Next Topic: Recommended follow-up lesson

VALIDATION STEP:
Before returning your response, check:
- Does it use age-appropriate vocabulary throughout?
- Would all scenarios happen to a kid this age?
- Are all relationships school/family/friend-based?
- Are there NO adult workplace words anywhere?
- Is the difficulty appropriate for skill level ${currentSkillLevel}?
- Does it build on strengths and address weaknesses?
- Does it follow the topic-specific instructions?

If any part fails these checks, regenerate it.

Return as JSON:
{
  "lesson": {
    "id": "lesson-${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeLevel}-${currentSkillLevel}",
    "topic": "${topicName}",
    "gradeLevel": "${gradeLevel}",
    "skillLevel": ${currentSkillLevel},
    "introduction": {
      "title": "...",
      "objective": "...",
      "whyItMatters": "...",
      "estimatedTime": "${guidelines.timeEstimate}"
    },
    "explanation": {
      "mainConcept": "...",
      "keyPoints": ["...", "...", "..."],
      "commonMistakes": ["...", "..."]
    },
    "practiceScenarios": [
      {
        "id": 1,
        "situation": "...",
        "question": "...",
        "options": [
          {
            "text": "...",
            "quality": "excellent",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "good",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "good",
            "feedback": "...",
            "tip": "..."
          },
          {
            "text": "...",
            "quality": "poor",
            "feedback": "...",
            "tip": "..."
          }
        ]
      }
    ],
    "summary": {
      "whatYouLearned": "...",
      "keyTakeaway": "...",
      "realWorldChallenge": "...",
      "nextTopic": "..."
    }
  }
}`;

    console.log(`📝 Making API call to Claude for lesson generation...`);
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received, validating for age-appropriateness...`);
    
    // Validate response for banned words (same validation as scenarios)
    const validateLessonForAge = (responseText, gradeLevel) => {
      const bannedWords = [
        'coworker', 'colleague', 'workplace', 'office', 'professional', 'business', 
        'corporate', 'employee', 'supervisor', 'HR', 'networking', 'resume', 
        'interview', 'client', 'customer', 'boss', 'manager',
        'colleagues', 'workplace', 'professional', 'business', 'corporate',
        'employee', 'supervisor', 'HR', 'management', 'resume',
        'interview', 'client', 'customer', 'boss', 'manager',
        'work meeting', 'business meeting', 'staff meeting', 'team meeting',
        'career advice', 'career counseling', 'career development', 'career path'
      ];
      
      const lowerResponse = (responseText || '').toLowerCase();
      
      for (const word of bannedWords) {
        // Use word boundaries to avoid false positives
        const wordRegex = new RegExp(`\\b${(word || '').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        if (wordRegex.test(lowerResponse)) {
          console.log(`❌ BANNED WORD DETECTED: "${word}" in lesson response for ${gradeLevel}`);
          return { isValid: false, bannedWord: word };
        }
      }
      
      return { isValid: true };
    };
    
    const validation = validateLessonForAge(responseText, gradeLevel);
    if (!validation.isValid) {
      console.log(`🚫 Lesson response rejected due to banned word: "${validation.bannedWord}"`);
      console.log(`🔄 Making retry API call with stricter prompt...`);
      
      // Retry with even stricter prompt
      const retryPrompt = `Your previous response contained inappropriate workplace language ("${validation.bannedWord}"). Remember: this is for a CHILD in SCHOOL, not an adult at work.

${prompt}

CRITICAL: Do not use ANY workplace, business, or professional language anywhere in the lesson. This is for a child in grade ${gradeLevel}.`;

      const retryMessage = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: retryPrompt
          }
        ],
      });
      
      const retryResponseText = retryMessage.content[0].text;
      console.log(`📊 Retry response received, validating again...`);
      
      const retryValidation = validateLessonForAge(retryResponseText, gradeLevel);
      if (!retryValidation.isValid) {
        console.error(`❌ Retry also failed with banned word: "${retryValidation.bannedWord}"`);
        throw new Error(`Unable to generate age-appropriate lesson. Banned word detected: ${retryValidation.bannedWord}`);
      }
      
      console.log(`✅ Retry response validated successfully`);
      responseText = retryResponseText;
    } else {
      console.log(`✅ Response validated successfully - no banned words detected`);
    }
    
    console.log(`📊 Parsing JSON from validated response...`);
    
    // Try to parse JSON from response
    let lessonData;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, responseText];
      
      const jsonText = jsonMatch[1] || responseText;
      
      // Try to find JSON object in the text
      const objectMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        lessonData = JSON.parse(objectMatch[0]);
      } else {
        lessonData = JSON.parse(jsonText);
      }
      
      console.log(`✅ Successfully parsed lesson: "${lessonData.lesson?.introduction?.title || 'Unknown Title'}"`);
      console.log(`📊 Lesson contains ${lessonData.lesson?.practiceScenarios?.length || 0} practice scenarios`);
      
    } catch (parseError) {
      console.error('❌ Failed to parse lesson JSON:', parseError);
      console.error('Raw response:', responseText.substring(0, 300) + '...');
      throw new Error('Failed to parse lesson response from AI');
    }
    
    // Log cost tracking
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    const estimatedCost = (tokensUsed / 1000) * 0.00025; // Rough estimate for Claude Haiku
    console.log(`💰 Token usage: ${tokensUsed} tokens (~$${estimatedCost.toFixed(4)})`);
    
    // Cache the lesson for future use (skip caching for now)
    // await cacheLesson(cacheKey, lessonData.lesson, message.usage, estimatedCost);
    
    res.json({ 
      success: true, 
      lesson: lessonData.lesson,
      usage: message.usage,
      costEstimate: estimatedCost,
      cached: false
    });
    
  } catch (error) {
    console.error('❌ Error generating lesson:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// NEW: Simplified AI lesson generation endpoint
app.post('/api/generate-lesson-simple', async (req, res) => {
  try {
    const { topic, gradeLevel, numScenarios, timestamp, requestId } = req.body;
    
    console.log(`📚 Generating AI lesson for: ${topic}, Grade: ${gradeLevel}, Scenarios: ${numScenarios || 5}`);
    console.log(`🔄 Request ID: ${requestId}, Timestamp: ${timestamp}`);

    // Topic-specific examples for better scenarios
    const topicExamples = {
      'starting-conversations': 'introducing yourself, asking questions, finding common interests',
      'reading-body-language': 'noticing facial expressions, understanding personal space, reading tone',
      'small-talk': 'talking about weekend plans, commenting on the weather, casual classroom chat',
      'making-friends': 'joining activities, showing interest, being a good listener',
      'small-talk-basics': 'casual conversations, asking about interests, sharing simple stories',
      'active-listening': 'paying attention, asking follow-up questions, showing you care',
      'body-language': 'reading facial expressions, understanding personal space, noticing gestures',
      'confidence-building': 'speaking up, trying new things, believing in yourself'
    };

    const topicContext = topicExamples[String(topic)?.toLowerCase()] || 'general social situations';
    const age = parseInt(gradeLevel) + 5; // Approximate age

    const prompt = `Generate 5 DIFFERENT social skills scenarios for grade ${gradeLevel} students.

RANDOM SEED: ${topic}-${timestamp}-${Math.random()}

Topic: ${topic} (age ${age})
Focus: ${topicContext}

Create 5 unique school situations. Use names: Alex, Sam, Jordan, Casey, Taylor, Morgan.
Settings: cafeteria, playground, classroom, hallway, library, gym, art room, bus stop.

IMPORTANT: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks.

{
  "title": "${topic}",
  "scenarios": [
    {
      "scenario": "situation description",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "feedback"
        },
        {
          "text": "response option", 
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false, 
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        }
      ]
    },
    {
      "scenario": "another situation",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "feedback"
        },
        {
          "text": "response option", 
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false, 
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        }
      ]
    },
    {
      "scenario": "third situation",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "feedback"
        },
        {
          "text": "response option", 
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false, 
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        }
      ]
    },
    {
      "scenario": "fourth situation",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "feedback"
        },
        {
          "text": "response option", 
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false, 
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        }
      ]
    },
    {
      "scenario": "fifth situation",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "feedback"
        },
        {
          "text": "response option", 
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false, 
          "points": 0,
          "feedback": "feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 0,
          "feedback": "feedback"
        }
      ]
    }
  ]
}`;

    console.log(`📝 Making API call to Claude for lesson generation...`);
    const startTime = Date.now();
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000, // Increased to handle full 5 scenarios
      temperature: 0.7, // Reduced from 0.9 for faster generation
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    const apiTime = Date.now() - startTime;
    console.log(`⚡ Claude API call completed in ${apiTime}ms`);
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received, validating for age-appropriateness...`);
    
    // Simple validation for banned words
    const bannedWords = ['coworker', 'colleague', 'workplace', 'office', 'professional', 'business', 'corporate', 'employee', 'supervisor', 'HR', 'networking', 'resume', 'interview', 'client', 'customer', 'boss', 'manager'];
    const lowerText = responseText.toLowerCase();
    
    for (const word of bannedWords) {
      if (lowerText.includes(word)) {
        console.log(`🚫 Response rejected due to banned word: "${word}"`);
        throw new Error(`Unable to generate age-appropriate scenarios. Banned word detected: ${word}`);
      }
    }
    
    console.log(`✅ Response validated successfully - no banned words detected`);
    console.log(`📊 Parsing JSON from validated response...`);
    
    // Parse JSON from response
    let lessonData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        console.error('Raw response:', responseText.substring(0, 500));
        throw new Error('No JSON found in response');
      }
      
      lessonData = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed lesson: "${lessonData.title || 'Unknown'}"`);
      console.log(`📊 Lesson contains ${lessonData.scenarios?.length || 0} practice scenarios`);
      
      // Detailed scenario logging
      if (lessonData.scenarios && lessonData.scenarios.length > 0) {
        console.log(`🔵 Scenarios generated: ${lessonData.scenarios.length}`);
        console.log(`🔵 First scenario: ${lessonData.scenarios[0]?.scenario?.substring(0, 50)}...`);
        console.log(`🔵 Last scenario: ${lessonData.scenarios[lessonData.scenarios.length - 1]?.scenario?.substring(0, 50)}...`);
        console.log(`🔵 All scenario previews:`, lessonData.scenarios.map((s, i) => `${i + 1}. ${s.scenario?.substring(0, 30)}...`));
      }
      
      console.log(`📊 Generated scenarios details:`, lessonData.scenarios?.map(s => ({
        scenario: s.scenario?.substring(0, 50) + '...',
        optionsCount: s.options?.length || 0
      })));
      
    } catch (parseError) {
      console.error(`❌ Failed to parse lesson JSON:`, parseError);
      console.log(`Raw response:`, responseText.substring(0, 500) + '...');
      throw new Error('Failed to parse lesson response from AI');
    }
    
    // Calculate token usage and cost
    const inputTokens = prompt.length / 4; // Rough estimate
    const outputTokens = responseText.length / 4; // Rough estimate
    const totalTokens = inputTokens + outputTokens;
    const cost = totalTokens * 0.00000025; // Rough cost estimate
    
    console.log(`💰 Token usage: ${Math.round(totalTokens)} tokens (~$${cost.toFixed(4)})`);
    
    res.json(lessonData);
    
  } catch (error) {
    console.error('❌ Error generating lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate dynamic scenario endpoint
app.post('/api/generate-scenario', async (req, res) => {
  try {
    const { category, gradeLevel, topic } = req.body;
    
    console.log(`🎯 Generating 5 scenarios for: ${category}, Grade: ${gradeLevel}, Topic: ${topic}`);
    
    // Age-appropriate guidelines
    const ageGuidelines = {
      'K-2': {
        language: 'Very simple words, short sentences (3-8 words per sentence)',
        topics: 'sharing toys, taking turns, saying sorry, making friends, asking to play',
        settings: 'playground, lunch table, classroom, recess',
        avoid: 'dating, complex emotions, abstract concepts, adult situations',
        example: 'You are playing with blocks and another kid wants to play too. What do you do?'
      },
      '3-5': {
        language: 'Clear, concrete language (5-12 words per sentence)',
        topics: 'group work, handling disagreements, including others, following rules',
        settings: 'school projects, recess, clubs, art class',
        avoid: 'romantic relationships, mature themes, complex social dynamics',
        example: 'Your group is working on a project but one person keeps interrupting. What do you do?'
      },
      '6-8': {
        language: 'Age-appropriate teen language (8-15 words per sentence)',
        topics: 'peer pressure, social media etiquette, conflict resolution, teamwork',
        settings: 'middle school, group chats, lunch tables, sports teams',
        avoid: 'adult relationships, workplace scenarios, inappropriate content',
        example: 'Someone posts something mean about your friend in the group chat. What do you do?'
      },
      '9-12': {
        language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
        topics: 'networking, leadership, conflict resolution, college prep, part-time jobs',
        settings: 'extracurriculars, part-time jobs, college prep, clubs',
        avoid: 'inappropriate content for high schoolers, adult-only situations',
        example: 'You disagree with your team leader about how to approach a project. What do you do?'
      }
    };
    
    const guidelines = ageGuidelines[gradeLevel] || ageGuidelines['6-8'];
    
    const prompt = `You are creating practice scenarios for a CHILD in grade ${gradeLevel}.

ABSOLUTE RESTRICTIONS - YOU MUST FOLLOW THESE:
❌ NEVER use these words: coworkers, colleagues, workplace, office, professional, networking, business, corporate, supervisor, employee, HR, management, career, resume, interview, meeting, client, customer, boss, manager, colleague, peer pressure (use "friends pressuring you" instead)
❌ NEVER include: job interviews, work meetings, workplace conflicts, career advice, business situations, professional relationships
❌ ONLY use these settings: school, classroom, playground, lunch table, recess, sports practice, after-school clubs, birthday parties, sleepovers, family events, neighborhood park, school bus, library, cafeteria, gym class, art class, music class
❌ ONLY use these relationships: classmates, friends, siblings, parents, teachers, coaches, teammates, neighbors, cousins

For K-2: Use words a 5-7 year old would know. Example: 'friend' not 'peer', 'play' not 'socialize'
For 3-5: Use words an 8-10 year old would know. School and home are their world.
For 6-8: Use words a 11-13 year old middle schooler would know. School social dynamics only.
For 9-12: High school appropriate only. NO workplace or adult situations.

EVERY scenario must pass this test: 'Would this happen at school or with friends?'
If NO, do not generate it.

SPECIFIC EXAMPLES FOR ${gradeLevel}:
${gradeLevel === 'K-2' ? 'Example: "You want to play with a toy that another kid is using. What do you do?"' : ''}
${gradeLevel === '3-5' ? 'Example: "Your friend is upset because they lost their game. What do you say?"' : ''}
${gradeLevel === '6-8' ? 'Example: "Someone in your group project isn\'t doing their part. How do you handle it?"' : ''}
${gradeLevel === '9-12' ? 'Example: "A friend posts something embarrassing about themselves on social media. Do you say something?"' : ''}

AGE GUIDELINES FOR ${gradeLevel}:
- Language: ${guidelines.language}
- Topics: ${guidelines.topics}
- Settings: ${guidelines.settings}
- AVOID: ${guidelines.avoid}

REQUIREMENTS:
1. Create exactly 5 different scenarios
2. Each scenario should have:
   - A realistic context/situation for ${gradeLevel} students
   - 3 response options (1 good choice, 2 that need improvement)
   - Brief, encouraging feedback for each option (1-2 sentences)
   - A helpful pro tip

3. Make scenarios diverse - different settings, different social skills
4. Use age-appropriate language and situations
5. Keep feedback positive and educational

VALIDATION STEP:
Before returning your response, check each scenario:
- Does it use age-appropriate vocabulary?
- Would this actually happen to a kid this age?
- Are all relationships school/family/friend-based?
- Are there NO adult workplace words?

If any scenario fails these checks, regenerate it.

Return as JSON array:
[
  {
    "context": "scenario description",
    "options": [
      {
        "text": "response option",
        "feedback": "encouraging explanation",
        "proTip": "helpful tip",
        "isGood": true/false,
        "points": 10 or 0
      }
    ]
  }
]`;

    // Response validation function
    const validateScenarioForAge = (responseText, gradeLevel) => {
      const bannedWords = [
        'coworker', 'colleague', 'workplace', 'office', 'professional', 'business', 
        'corporate', 'employee', 'supervisor', 'HR', 'networking', 'career', 
        'resume', 'interview', 'meeting', 'client', 'customer', 'boss', 'manager',
        'colleagues', 'workplace', 'professional', 'business', 'corporate',
        'employee', 'supervisor', 'HR', 'management', 'career', 'resume',
        'interview', 'meeting', 'client', 'customer', 'boss', 'manager'
      ];
      
      const lowerResponse = (responseText || '').toLowerCase();
      
      for (const word of bannedWords) {
        if (lowerResponse.includes((word || '').toLowerCase())) {
          console.log(`❌ BANNED WORD DETECTED: "${word}" in response for ${gradeLevel}`);
          return { isValid: false, bannedWord: word };
        }
      }
      
      return { isValid: true };
    };

    console.log(`📝 Making API call to Claude for ${gradeLevel} scenarios...`);
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received, validating for age-appropriateness...`);
    
    // Validate response for banned words
    const validation = validateScenarioForAge(responseText, gradeLevel);
    if (!validation.isValid) {
      console.log(`🚫 Response rejected due to banned word: "${validation.bannedWord}"`);
      console.log(`🔄 Making retry API call with stricter prompt...`);
      
      // Retry with even stricter prompt
      const retryPrompt = `Your previous response contained inappropriate workplace language ("${validation.bannedWord}"). Remember: this is for a CHILD in SCHOOL, not an adult at work.

${prompt}

CRITICAL: Do not use ANY workplace, business, or professional language. This is for a child in grade ${gradeLevel}.`;

      const retryMessage = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: retryPrompt
          }
        ],
      });
      
      const retryResponseText = retryMessage.content[0].text;
      console.log(`📊 Retry response received, validating again...`);
      
      const retryValidation = validateScenarioForAge(retryResponseText, gradeLevel);
      if (!retryValidation.isValid) {
        console.error(`❌ Retry also failed with banned word: "${retryValidation.bannedWord}"`);
        throw new Error(`Unable to generate age-appropriate scenarios. Banned word detected: ${retryValidation.bannedWord}`);
      }
      
      console.log(`✅ Retry response validated successfully`);
      responseText = retryResponseText;
    } else {
      console.log(`✅ Response validated successfully - no banned words detected`);
    }
    
    console.log(`📊 Parsing JSON from validated response...`);
    
    // Try to parse JSON from response
    let scenarios;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, responseText];
      
      const jsonText = jsonMatch[1] || responseText;
      
      // Try to find JSON array in the text
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        scenarios = JSON.parse(arrayMatch[0]);
      } else {
        scenarios = JSON.parse(jsonText);
      }
      
      console.log(`✅ Successfully parsed ${scenarios.length} scenarios`);
      if (scenarios.length > 0) {
        console.log(`📋 First scenario context: "${scenarios[0].context?.substring(0, 100)}..."`);
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('Raw response:', responseText.substring(0, 200) + '...');
      scenarios = [{ raw: responseText }]; // Return raw if parsing fails
    }
    
    res.json({ 
      success: true, 
      scenarios,
      usage: message.usage 
    });
    
  } catch (error) {
    console.error('❌ Error generating scenarios:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get personalized feedback endpoint
app.post('/api/get-feedback', async (req, res) => {
  try {
    const { userChoice, scenario, userHistory } = req.body;
    
    const prompt = `A student just made this choice in a social skills practice scenario:
    
Scenario: ${scenario}
Their choice: ${userChoice}
Their history: ${userHistory?.recentChoices || 'First attempt'}

Provide encouraging, personalized feedback (2-3 sentences) that:
- Acknowledges their choice
- Explains why it works or doesn't
- Offers a specific tip for improvement (if needed)
- Encourages them to keep practicing

Keep it age-appropriate and positive.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    res.json({ 
      success: true, 
      feedback: message.content[0].text 
    });
    
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate personalized feedback endpoint
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { 
      scenarioContext, 
      question, 
      studentChoice, 
      correctAnswer, 
      choiceQuality,
      gradeLevel, 
      studentStrengths, 
      studentWeaknesses, 
      previousPerformance 
    } = req.body;
    
    console.log(`🎯 Generating personalized feedback for grade ${gradeLevel}`);
    console.log(`📝 Scenario: ${scenarioContext?.substring(0, 50)}...`);
    console.log(`💭 Student choice: ${studentChoice?.substring(0, 30)}...`);
    
    // Get grade-specific guidelines for feedback language
    const getGradeGuidelines = (grade) => {
      const gradeNum = parseInt(grade);
      
      if (grade === 'K' || grade === '0') {
        return {
          language: 'Very simple words, short sentences (3-6 words per sentence)',
          examples: 'playground, sharing toys, taking turns, saying hi',
          tone: 'warm and simple',
          ageContext: 'kindergartener (5-6 years old)'
        };
      }
      
      if (gradeNum >= 1 && gradeNum <= 2) {
        return {
          language: 'Simple words, short sentences (4-8 words per sentence)',
          examples: 'making friends, sharing, following rules',
          tone: 'encouraging and clear',
          ageContext: `${gradeNum === 1 ? '1st grader' : '2nd grader'} (${gradeNum === 1 ? '6-7' : '7-8'} years old)`
        };
      }
      
      if (gradeNum >= 3 && gradeNum <= 5) {
        return {
          language: 'Clear, concrete language (5-12 words per sentence)',
          examples: 'group work, handling disagreements, including others',
          tone: 'supportive and educational',
          ageContext: `${gradeNum}${gradeNum === 3 ? 'rd' : gradeNum === 4 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      if (gradeNum >= 6 && gradeNum <= 8) {
        return {
          language: 'Age-appropriate teen language (8-15 words per sentence)',
          examples: 'peer pressure, social media, teamwork, conflict resolution',
          tone: 'respectful and understanding',
          ageContext: `${gradeNum}${gradeNum === 6 ? 'th' : gradeNum === 7 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      if (gradeNum >= 9 && gradeNum <= 12) {
        return {
          language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
          examples: 'leadership, relationships, college prep, part-time jobs',
          tone: 'professional but warm',
          ageContext: `${gradeNum}${gradeNum === 9 ? 'th' : gradeNum === 10 ? 'th' : gradeNum === 11 ? 'th' : 'th'} grader (${gradeNum + 5}-${gradeNum + 6} years old)`
        };
      }
      
      return {
        language: 'Age-appropriate language',
        examples: 'general social skills',
        tone: 'encouraging',
        ageContext: `student in grade ${grade}`
      };
    };
    
    const guidelines = getGradeGuidelines(gradeLevel);
    
    const prompt = `You are a supportive social skills coach for a ${guidelines.ageContext}.

FEEDBACK REQUIREMENTS:
- Language: ${guidelines.language}
- Examples: Use ${guidelines.examples}
- Tone: ${guidelines.tone}
- NEVER use words like "wrong," "bad," "incorrect," or "failed"
- Use phrases like "Let's think about this..." or "Here's a better way..."
- Focus on growth mindset and learning
- Be warm, encouraging, and supportive

STUDENT PROFILE:
- Grade Level: ${gradeLevel} (${guidelines.ageContext})
- Strengths: ${studentStrengths?.join(', ') || 'general social skills'}
- Areas to improve: ${studentWeaknesses?.join(', ') || 'general social skills'}
- Recent performance: ${previousPerformance || 'new learner'}

SCENARIO ANALYSIS:
Situation: ${scenarioContext}
Question: ${question}
Student's choice: ${studentChoice}
Best answer: ${correctAnswer}
Choice quality: ${choiceQuality}

FEEDBACK GUIDELINES BASED ON CHOICE QUALITY:

EXCELLENT choice:
- Give specific praise for what they did right
- Explain WHY this is effective in this situation
- Connect to real-world benefits
- Reference their strengths when relevant
- 2-3 sentences, encouraging tone

GOOD choice:
- Acknowledge what they did right
- Gently explain what could be even better
- Provide specific actionable tip
- Stay positive and encouraging
- 2-3 sentences

POOR choice:
- Stay supportive (use "Let's think about this..." or "Here's a better way...")
- Explain why this might not work well
- Teach the missing social skill
- Suggest what to try instead with specific example
- End with encouragement
- Reference their weaknesses to help improve
- 3-4 sentences

RESPONSE FORMAT (JSON):
{
  "feedback": "Main personalized feedback text here...",
  "skillHighlight": "The specific social skill demonstrated or needed",
  "realWorldTip": "Concrete thing to try in real life",
  "encouragement": "Brief motivational message"
}

Make the feedback feel natural, personalized, and encouraging for a ${guidelines.ageContext}.`;

    console.log(`📝 Making API call to Claude for feedback generation...`);
    
    // Add 3-second timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Feedback generation timeout')), 3000);
    });
    
    const apiPromise = anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    const message = await Promise.race([apiPromise, timeoutPromise]);
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received for feedback generation...`);
    
    // Parse JSON from response
    let feedbackData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                       [null, responseText];
      feedbackData = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse feedback JSON:', parseError);
      throw new Error('Failed to parse feedback response from AI');
    }
    
    // Log cost tracking
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    const estimatedCost = (tokensUsed / 1000) * 0.00025;
    console.log(`💰 Feedback generation cost: ${tokensUsed} tokens (~$${estimatedCost.toFixed(4)})`);
    
    console.log(`✅ Personalized feedback generated successfully`);
    
    res.json({ 
      success: true, 
      feedback: feedbackData,
      usage: message.usage,
      costEstimate: estimatedCost
    });
    
  } catch (error) {
    console.error('❌ Error generating feedback:', error);
    
    // Return fallback feedback instead of error
    const fallbackFeedback = {
      feedback: "Great thinking! Keep practicing this skill.",
      skillHighlight: "Social skills practice",
      realWorldTip: "Try applying this in real life situations.",
      encouragement: "You're doing great! Keep learning and growing."
    };
    
    res.json({ 
      success: true, 
      feedback: fallbackFeedback,
      fallback: true,
      error: error.message 
    });
  }
});

// Adaptive Learning Initialization API
app.post('/api/adaptive/init', async (req, res) => {
  try {
    const { userId, userData, onboardingAnswers } = req.body;
    
    console.log(`🚀 Initializing adaptive learning for user: ${userId}`);
    console.log('👤 User data:', userData);
    console.log('📝 Onboarding answers:', onboardingAnswers);
    
    // Validate required fields
    if (!userId || !userData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and userData'
      });
    }
    
    const { name, gradeLevel } = userData;
    if (!name || !gradeLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required user data: name and gradeLevel'
      });
    }
    
    // Initialize learner profile
    const learnerProfile = {
      userId: userId,
      name: name,
      gradeLevel: gradeLevel,
      totalPoints: 0,
      streak: 0,
      totalSessions: 0,
      currentLevel: 1,
      badges: [],
      strengths: [],
      needsWork: [],
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isInitialized: true
    };
    
    // Set default learning preferences based on onboarding answers
    const defaultPreferences = {
      learningPace: onboardingAnswers?.pace || 'self-paced',
      feedbackStyle: onboardingAnswers?.feedbackStyle || 'encouraging',
      challengeLevel: onboardingAnswers?.challengeLevel || 'moderate',
      practiceFrequency: onboardingAnswers?.practiceFrequency || 'few-times-week'
    };
    
    // Initialize all topics with difficulty level 1
    const topics = [
      'Small Talk Basics',
      'Active Listening', 
      'Reading Body Language',
      'Building Confidence',
      'Conflict Resolution',
      'Teamwork',
      'Empathy',
      'Assertiveness'
    ];
    
    const topicMastery = topics.map(topic => ({
      userId: userId,
      topicId: topic.toLowerCase().replace(/\s+/g, '-'),
      topicName: topic,
      difficultyLevel: 1,
      masteryLevel: 0,
      accuracy: 0,
      timeSpent: 0,
      sessionsCompleted: 0,
      lastPracticed: null,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    
    // Save to Firebase
    const batch = writeBatch(db);
    
    // Save learner profile
    const learnerRef = doc(db, 'learner_profiles', userId);
    batch.set(learnerRef, learnerProfile);
    
    // Save learning preferences
    const preferencesRef = doc(db, 'learner_preferences', userId);
    batch.set(preferencesRef, {
      ...defaultPreferences,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Save topic mastery for each topic
    topicMastery.forEach(topic => {
      const topicRef = doc(db, 'topic_mastery', `${userId}_${topic.topicId}`);
      batch.set(topicRef, topic);
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Adaptive learning initialized successfully for user: ${userId}`);
    console.log(`📊 Created profile, preferences, and ${topics.length} topic mastery records`);
    
    res.json({
      success: true,
      message: 'Adaptive learning system initialized successfully',
      data: {
        learnerProfile: learnerProfile,
        preferences: defaultPreferences,
        topicsInitialized: topics.length,
        topics: topics
      }
    });
    
  } catch (error) {
    console.error('❌ Error initializing adaptive learning:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize adaptive learning system',
      details: error.message
    });
  }
});

// Check if user needs initialization
app.get('/api/adaptive/check-init/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔍 Checking initialization status for user: ${userId}`);
    
    // Check if learner profile exists
    const learnerRef = doc(db, 'learner_profiles', userId);
    const learnerSnap = await getDoc(learnerRef);
    
    if (learnerSnap.exists()) {
      const learnerData = learnerSnap.data();
      console.log(`✅ User ${userId} is already initialized`);
      
      res.json({
        success: true,
        isInitialized: true,
        learnerProfile: learnerData
      });
    } else {
      console.log(`⚠️ User ${userId} needs initialization`);
      
      res.json({
        success: true,
        isInitialized: false,
        message: 'User needs adaptive learning initialization'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking initialization status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check initialization status',
      details: error.message
    });
  }
});

// Parent Analytics API
app.get('/api/adaptive/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📊 Getting analytics for child: ${userId}`);
    
    // Get learner profile
    const learnerRef = doc(db, 'learner_profiles', userId);
    const learnerSnap = await getDoc(learnerRef);
    
    if (!learnerSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Child profile not found'
      });
    }
    
    const learnerProfile = learnerSnap.data();
    
    // Get topic mastery data
    const topicMasteryQuery = query(
      collection(db, 'topic_mastery'),
      where('userId', '==', userId)
    );
    const topicMasterySnap = await getDocs(topicMasteryQuery);
    
    const topicMastery = topicMasterySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get session history (last 30 days) - simplified query
    const sessionQuery = query(
      collection(db, 'session_history'),
      where('learnerId', '==', userId)
    );
    const sessionSnap = await getDocs(sessionQuery);
    
    const allSessions = sessionSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter sessions from last 30 days in JavaScript
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = allSessions.filter(session => {
      if (!session.completedAt) return false;
      const sessionDate = new Date(session.completedAt.seconds * 1000);
      return sessionDate >= thirtyDaysAgo;
    });
    
    // Get real-world challenges
    const challengesQuery = query(
      collection(db, 'real_world_challenges'),
      where('userId', '==', userId)
    );
    const challengesSnap = await getDocs(challengesQuery);
    
    const challenges = challengesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics
    const totalTopics = topicMastery.length;
    const masteredTopics = topicMastery.filter(topic => topic.masteryLevel >= 80).length;
    const inProgressTopics = topicMastery.filter(topic => topic.masteryLevel > 0 && topic.masteryLevel < 80).length;
    const notStartedTopics = topicMastery.filter(topic => topic.masteryLevel === 0).length;
    
    const totalTimeSpent = topicMastery.reduce((sum, topic) => sum + (topic.timeSpent || 0), 0);
    const totalSessions = recentSessions.length;
    const averageAccuracy = recentSessions.length > 0 
      ? recentSessions.reduce((sum, session) => sum + (session.score || 0), 0) / recentSessions.length
      : 0;
    
    const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
    const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;
    
    // Calculate practice frequency
    const practiceDays = new Set(recentSessions.map(session => 
      new Date(session.completedAt?.seconds * 1000).toDateString()
    )).size;
    
    const practiceFrequency = practiceDays > 0 ? Math.round((practiceDays / 30) * 100) : 0;
    
    // Get strengths and growth areas
    const strengths = topicMastery
      .filter(topic => topic.masteryLevel >= 70)
      .map(topic => topic.topicName)
      .slice(0, 3);
    
    const growthAreas = topicMastery
      .filter(topic => topic.masteryLevel < 50 && topic.masteryLevel > 0)
      .map(topic => topic.topicName)
      .slice(0, 3);
    
    // Recent activity timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = recentSessions
      .filter(session => session.completedAt?.seconds * 1000 >= sevenDaysAgo.getTime())
      .map(session => ({
        date: new Date(session.completedAt?.seconds * 1000).toISOString().split('T')[0],
        topic: session.topicName,
        score: session.score,
        timeSpent: session.timeSpent,
        type: 'practice_session'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    // Add challenge completions to timeline
    const recentChallengeCompletions = challenges
      .filter(challenge => 
        challenge.status === 'completed' && 
        challenge.completedAt?.seconds * 1000 >= sevenDaysAgo.getTime()
      )
      .map(challenge => ({
        date: new Date(challenge.completedAt?.seconds * 1000).toISOString().split('T')[0],
        topic: challenge.topicName,
        title: challenge.title,
        type: 'challenge_completed'
      }));
    
    recentActivity.push(...recentChallengeCompletions);
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const analytics = {
      learnerProfile: {
        name: learnerProfile.name,
        gradeLevel: learnerProfile.gradeLevel,
        totalPoints: learnerProfile.totalPoints,
        streak: learnerProfile.streak,
        currentLevel: learnerProfile.currentLevel,
        badges: learnerProfile.badges || []
      },
      progressSummary: {
        totalTopics,
        masteredTopics,
        inProgressTopics,
        notStartedTopics,
        masteryPercentage: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0
      },
      learningStats: {
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
        totalSessions,
        averageAccuracy: Math.round(averageAccuracy),
        practiceFrequency,
        completedChallenges,
        activeChallenges
      },
      strengths,
      growthAreas,
      recentActivity: recentActivity.slice(0, 10),
      topicMastery: topicMastery.map(topic => ({
        topicName: topic.topicName,
        masteryLevel: topic.masteryLevel,
        difficultyLevel: topic.difficultyLevel,
        accuracy: topic.accuracy,
        timeSpent: topic.timeSpent,
        sessionsCompleted: topic.sessionsCompleted,
        lastPracticed: topic.lastPracticed,
        isCompleted: topic.isCompleted
      }))
    };
    
    console.log(`✅ Analytics generated for child: ${userId}`);
    console.log(`📈 Progress: ${masteredTopics}/${totalTopics} topics mastered`);
    console.log(`⏱️ Time spent: ${analytics.learningStats.totalTimeSpent} hours`);
    console.log(`🎯 Average accuracy: ${analytics.learningStats.averageAccuracy}%`);
    
    res.json({
      success: true,
      analytics: analytics
    });
    
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      details: error.message
    });
  }
});

// Learning Preferences API
app.put('/api/adaptive/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    console.log(`⚙️ Saving preferences for user: ${userId}`);
    console.log('📋 Preferences:', preferences);
    
    // Validate preferences
    const validLearningPaces = ['self-paced', 'guided', 'accelerated'];
    const validFeedbackStyles = ['encouraging', 'direct', 'detailed'];
    const validChallengeLevels = ['gradual', 'moderate', 'aggressive'];
    const validFrequencies = ['daily', 'few-times-week', 'weekly'];
    
    if (!validLearningPaces.includes(preferences.learningPace)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid learning pace'
      });
    }
    
    if (!validFeedbackStyles.includes(preferences.feedbackStyle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback style'
      });
    }
    
    if (!validChallengeLevels.includes(preferences.challengeLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid challenge level'
      });
    }
    
    if (!validFrequencies.includes(preferences.practiceFrequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid practice frequency'
      });
    }
    
    // Save to Firebase
    const preferencesRef = doc(db, 'learner_preferences', userId);
    await setDoc(preferencesRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
      userId: userId
    }, { merge: true });
    
    console.log(`✅ Preferences saved successfully for user: ${userId}`);
    
    res.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: preferences
    });
    
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences',
      details: error.message
    });
  }
});

// Get Learning Preferences API
app.get('/api/adaptive/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📋 Getting preferences for user: ${userId}`);
    
    const preferencesRef = doc(db, 'learner_preferences', userId);
    const preferencesSnap = await getDoc(preferencesRef);
    
    if (preferencesSnap.exists()) {
      const preferences = preferencesSnap.data();
      console.log(`✅ Preferences found for user: ${userId}`);
      
      res.json({
        success: true,
        preferences: preferences
      });
    } else {
      console.log(`ℹ️ No preferences found for user: ${userId}, returning defaults`);
      
      // Return default preferences
      const defaultPreferences = {
        learningPace: 'self-paced',
        feedbackStyle: 'encouraging',
        challengeLevel: 'moderate',
        practiceFrequency: 'few-times-week'
      };
      
      res.json({
        success: true,
        preferences: defaultPreferences,
        isDefault: true
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      details: error.message
    });
  }
});

// Real-world challenge generation endpoint
app.post('/api/adaptive/generate-challenge', async (req, res) => {
  try {
    const { learnerId, topicName, gradeLevel, currentLevel, strengths, needsWork, recentPerformance } = req.body;

    console.log('🎯 Generating real-world challenge for:', {
      learnerId,
      topicName,
      gradeLevel,
      currentLevel
    });

    // Validate required fields
    if (!learnerId || !topicName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: learnerId and topicName'
      });
    }

    // Create the prompt for challenge generation
    const prompt = `You are an expert social skills educator creating personalized real-world challenges for students.

STUDENT PROFILE:
- Grade Level: ${gradeLevel || 'K-2'}
- Current Skill Level: ${currentLevel || 1}
- Topic Focus: ${topicName}
- Strengths: ${strengths?.join(', ') || 'General social skills'}
- Areas for Improvement: ${needsWork?.join(', ') || 'Building confidence'}
- Recent Performance: ${recentPerformance || 'New to social skills practice'}

Create a personalized real-world challenge that:
1. Is age-appropriate for ${gradeLevel || 'K-2'} students
2. Builds on the topic: ${topicName}
3. Is achievable but slightly challenging
4. Can be practiced in real social situations
5. Has clear success indicators
6. Includes helpful tips

Respond with a JSON object containing:
{
  "title": "Clear, engaging challenge title",
  "description": "Brief description of what to do",
  "specificGoal": "Specific, measurable goal",
  "whereToTry": ["Location 1", "Location 2", "Location 3"],
  "successIndicators": ["Indicator 1", "Indicator 2", "Indicator 3"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "timeframe": "This week" or "Today" or "This month",
  "estimatedDifficulty": "Easy" or "Moderate" or "Challenging"
}

Make it encouraging, specific, and practical for real-world practice.`;

    // Generate challenge using Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const challengeText = response.content[0].text;
    
    // Parse the JSON response
    let challenge;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = challengeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        challenge = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing challenge JSON:', parseError);
      console.log('Raw response:', challengeText);
      
      // Fallback challenge
      challenge = {
        title: `Practice ${topicName}`,
        description: `Try applying what you learned about ${topicName} in a real situation today.`,
        specificGoal: `Use your ${topicName} skills in a conversation or interaction.`,
        whereToTry: ['At school', 'At home', 'With friends'],
        successIndicators: ['You tried the skill', 'You felt more confident', 'The other person responded positively'],
        tips: ['Start small', 'Be yourself', 'Practice makes perfect'],
        timeframe: 'This week',
        estimatedDifficulty: 'Easy'
      };
    }

    // Add metadata
    challenge.learnerId = learnerId;
    challenge.topicName = topicName;
    challenge.gradeLevel = gradeLevel;
    challenge.generatedAt = new Date().toISOString();

    console.log('✅ Challenge generated successfully:', challenge.title);

    res.json({
      success: true,
      challenge: challenge
    });

  } catch (error) {
    console.error('❌ Error generating challenge:', error);
    
    // Return fallback challenge on error
    const fallbackChallenge = {
      title: `Practice ${req.body.topicName || 'Social Skills'}`,
      description: `Try applying what you learned in a real situation today.`,
      specificGoal: `Use your social skills in a conversation or interaction.`,
      whereToTry: ['At school', 'At home', 'With friends'],
      successIndicators: ['You tried the skill', 'You felt more confident', 'The other person responded positively'],
      tips: ['Start small', 'Be yourself', 'Practice makes perfect'],
      timeframe: 'This week',
      estimatedDifficulty: 'Easy',
      learnerId: req.body.learnerId,
      topicName: req.body.topicName,
      gradeLevel: req.body.gradeLevel,
      generatedAt: new Date().toISOString(),
      isFallback: true
    };

    res.json({
      success: true,
      challenge: fallbackChallenge,
      warning: 'Using fallback challenge due to AI generation error'
    });
  }
});

// AI Response Evaluation Endpoint
// ===============================

// POST /api/adaptive/evaluate-response - AI evaluates student responses
app.post('/api/adaptive/evaluate-response', async (req, res) => {
  const { learnerId, question, selectedAnswer, correctAnswer, isCorrectAnswer } = req.body;
  
  console.log('🤖 Evaluating response for:', learnerId);
  
  try {
    // Call Claude API for feedback
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `A student answered a social skills question.

Question: ${question}
Their answer: ${selectedAnswer}
Correct answer: ${correctAnswer}
Was correct: ${isCorrectAnswer}

Provide brief, encouraging feedback (2-3 sentences). If incorrect, gently explain why the correct answer is better.`
      }]
    });
    
    const feedback = response.content[0].text;
    
    console.log('✅ AI feedback generated for learner:', learnerId);
    
    res.json({
      success: true,
      feedback: feedback,
      isCorrect: isCorrectAnswer
    });
    
  } catch (error) {
    console.error('❌ Error evaluating response:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      feedback: 'Great effort! Keep practicing.'
    });
  }
});

// Privacy & Data Management Endpoints
// =====================================

// GET /api/user/privacy/:userId - fetch privacy settings
app.get('/api/user/privacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔒 Fetching privacy settings for user: ${userId}`);

    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    const privacySnap = await getDoc(privacyDoc);

    if (privacySnap.exists()) {
      res.json({
        success: true,
        privacy: privacySnap.data()
      });
    } else {
      // Return default privacy settings
      const defaultPrivacy = {
        shareProgressWithEducators: true,
        allowAnonymousDataCollection: true,
        showProgressToParents: true,
        includeDetailedSessionData: true,
        lastUpdated: new Date().toISOString()
      };
      
      res.json({
        success: true,
        privacy: defaultPrivacy
      });
    }
  } catch (error) {
    console.error('❌ Error fetching privacy settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch privacy settings'
    });
  }
});

// PUT /api/user/privacy/:userId - update privacy settings
app.put('/api/user/privacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const privacySettings = req.body;
    console.log(`🔒 Updating privacy settings for user: ${userId}`, privacySettings);

    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    await setDoc(privacyDoc, {
      ...privacySettings,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update privacy settings'
    });
  }
});

// GET /api/user/export-data/:userId - export all user data as JSON
app.get('/api/user/export-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📥 Exporting data for user: ${userId}`);

    // Collect all user data
    const userData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      profile: {},
      sessions: [],
      progress: {},
      challenges: [],
      preferences: {},
      privacy: {}
    };

    // Get user profile
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      userData.profile = userSnap.data();
    }

    // Get session history
    const sessionsQuery = query(
      collection(db, 'users', userId, 'sessions'),
      orderBy('completedAt', 'desc')
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    sessionsSnap.forEach(doc => {
      userData.sessions.push({ id: doc.id, ...doc.data() });
    });

    // Get progress data
    const progressDoc = doc(db, 'users', userId, 'progress', 'overview');
    const progressSnap = await getDoc(progressDoc);
    if (progressSnap.exists()) {
      userData.progress = progressSnap.data();
    }

    // Get challenges
    const challengesQuery = query(
      collection(db, 'users', userId, 'challenges')
    );
    const challengesSnap = await getDocs(challengesQuery);
    challengesSnap.forEach(doc => {
      userData.challenges.push({ id: doc.id, ...doc.data() });
    });

    // Get preferences
    const preferencesDoc = doc(db, 'users', userId, 'preferences', 'learning');
    const preferencesSnap = await getDoc(preferencesDoc);
    if (preferencesSnap.exists()) {
      userData.preferences = preferencesSnap.data();
    }

    // Get privacy settings
    const privacyDoc = doc(db, 'users', userId, 'privacy', 'settings');
    const privacySnap = await getDoc(privacyDoc);
    if (privacySnap.exists()) {
      userData.privacy = privacySnap.data();
    }

    // Set headers for file download
    const username = userData.profile.username || 'user';
    const date = new Date().toISOString().split('T')[0];
    const filename = `social-cue-data-${username}-${date}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(userData);

  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export user data'
    });
  }
});

// DELETE /api/user/delete-account/:userId - delete user and all data
app.delete('/api/user/delete-account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🗑️ Deleting account for user: ${userId}`);

    // Delete all user subcollections
    const collections = ['sessions', 'progress', 'challenges', 'preferences', 'privacy'];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete main user document
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

// Parental Controls Endpoints
// ===========================

// GET /api/user/parental-controls/:userId - fetch parental controls
app.get('/api/user/parental-controls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👨‍👩‍👧‍👦 Fetching parental controls for user: ${userId}`);

    const controlsDoc = doc(db, 'users', userId, 'parentalControls', 'settings');
    const controlsSnap = await getDoc(controlsDoc);

    if (controlsSnap.exists()) {
      res.json({
        success: true,
        controls: controlsSnap.data()
      });
    } else {
      // Return default parental controls
      const defaultControls = {
        dailyTimeLimit: 30, // minutes
        sessionsPerDay: 3,
        availableTopics: ['small-talk', 'making-friends', 'conflict-resolution', 'empathy', 'active-listening'],
        blockedDifficultyLevels: [],
        ageAppropriateContentOnly: true,
        requireApprovalForChallenges: false,
        notifyOnSessionCompletion: true,
        lastUpdated: new Date().toISOString()
      };
      
      res.json({
        success: true,
        controls: defaultControls
      });
    }
  } catch (error) {
    console.error('❌ Error fetching parental controls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parental controls'
    });
  }
});

// PUT /api/user/parental-controls/:userId - update parental controls
app.put('/api/user/parental-controls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const controls = req.body;
    console.log(`👨‍👩‍👧‍👦 Updating parental controls for user: ${userId}`, controls);

    const controlsDoc = doc(db, 'users', userId, 'parentalControls', 'settings');
    await setDoc(controlsDoc, {
      ...controls,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Parental controls updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating parental controls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update parental controls'
    });
  }
});

// Session Replay Endpoint
// ======================

// GET /api/sessions/replay/:sessionId - fetch complete session data for replay
app.get('/api/sessions/replay/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🎬 Fetching session replay data for: ${sessionId}`);

    // First, try to find the session in any user's sessions
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let sessionData = null;
    let userId = null;

    // Search through all users to find the session
    for (const userDoc of usersSnapshot.docs) {
      const sessionsRef = collection(db, 'users', userDoc.id, 'sessions');
      const sessionDoc = doc(sessionsRef, sessionId);
      const sessionSnap = await getDoc(sessionDoc);
      
      if (sessionSnap.exists()) {
        sessionData = sessionSnap.data();
        userId = userDoc.id;
        break;
      }
    }

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get user profile for additional context
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    const userProfile = userSnap.exists() ? userSnap.data() : {};

    // Calculate session statistics
    const scenarios = sessionData.scenarios || [];
    const totalScenarios = scenarios.length;
    const correctAnswers = scenarios.filter(s => s.isCorrect).length;
    const accuracy = totalScenarios > 0 ? Math.round((correctAnswers / totalScenarios) * 100) : 0;
    
    // Calculate total time spent
    const startTime = sessionData.startedAt?.toDate?.() || new Date(sessionData.startedAt);
    const endTime = sessionData.completedAt?.toDate?.() || new Date(sessionData.completedAt);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);

    // Prepare replay data
    const replayData = {
      sessionId: sessionId,
      userId: userId,
      userProfile: {
        userName: userProfile.userName || 'Student',
        grade: userProfile.grade || '5',
        role: userProfile.role || 'student'
      },
      sessionInfo: {
        topicName: sessionData.topicName || 'Social Skills',
        difficulty: sessionData.difficulty || 'beginner',
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt,
        duration: durationMinutes,
        totalScenarios: totalScenarios,
        correctAnswers: correctAnswers,
        accuracy: accuracy
      },
      scenarios: scenarios.map((scenario, index) => ({
        scenarioNumber: index + 1,
        scenarioText: scenario.scenario || scenario.question || '',
        options: scenario.options || [],
        studentAnswer: scenario.selectedOption || scenario.studentAnswer,
        correctAnswer: scenario.correctAnswer || scenario.options?.find(opt => opt.isGood)?.text,
        isCorrect: scenario.isCorrect || false,
        aiFeedback: scenario.aiFeedback || scenario.feedback || '',
        proTip: scenario.proTip || '',
        timeSpent: scenario.timeSpent || 0,
        pointsEarned: scenario.pointsEarned || (scenario.isCorrect ? 10 : 0)
      })),
      summary: {
        strengths: sessionData.strengths || [],
        areasForImprovement: sessionData.areasForImprovement || [],
        nextRecommendedTopic: sessionData.nextRecommendedTopic || 'Continue practicing current topic',
        overallFeedback: sessionData.overallFeedback || 'Great job completing this session!'
      }
    };

    console.log(`✅ Session replay data prepared: ${totalScenarios} scenarios, ${accuracy}% accuracy`);

    res.json({
      success: true,
      replayData: replayData
    });

  } catch (error) {
    console.error('❌ Error fetching session replay data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session replay data'
    });
  }
});

// Goal Management Endpoints
// =========================

// POST /api/goals/generate-recommendations/:userId - AI generates personalized goal recommendations
app.post('/api/goals/generate-recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🎯 Generating AI goal recommendations for user: ${userId}`);

    // Get user profile and progress data
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    
    // If user doesn't exist, create minimal user data for testing
    let userData;
    if (!userSnap.exists()) {
      console.log(`⚠️ User ${userId} not found, creating minimal profile for testing`);
      userData = {
        userName: 'Test User',
        grade: '5',
        currentLevel: 1
      };
    } else {
      userData = userSnap.data();
    }

    // For now, use mock data to test the endpoint
    console.log('Using mock data for testing');

    // Prepare simple data for AI analysis
    const analysisData = {
      userProfile: {
        name: userData.userName || 'Student',
        gradeLevel: userData.grade || '5',
        currentLevel: userData.currentLevel || 1
      },
      progress: {
        totalSessions: 0,
        averageAccuracy: 0,
        currentStreak: 0
      }
    };

    // Generate AI recommendations
    const prompt = `You are a JSON API. Generate 3-5 personalized learning goals for a grade ${analysisData.userProfile.gradeLevel} student.

Student Profile:
- Name: ${analysisData.userProfile.name}
- Grade Level: ${analysisData.userProfile.gradeLevel}
- Current Level: ${analysisData.userProfile.currentLevel}

Progress Summary:
- Total Sessions: ${analysisData.progress.totalSessions}
- Average Accuracy: ${analysisData.progress.averageAccuracy}%
- Current Streak: ${analysisData.progress.currentStreak} days

CRITICAL: Return ONLY valid JSON. No explanations, no text, no markdown. Just the JSON array.

[
  {
    "title": "Master Small Talk Basics",
    "description": "Practice small talk scenarios until you reach 80% mastery",
    "targetTopic": "small-talk",
    "targetMetric": "mastery",
    "targetValue": 80,
    "suggestedDeadline": "2 weeks",
    "reason": "Small talk is a foundational social skill",
    "difficulty": "Medium"
  }
]`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const recommendations = JSON.parse(response.content[0].text);
    
    console.log(`✅ Generated ${recommendations.length} goal recommendations for ${userId}`);

    res.json({
      success: true,
      recommendations: recommendations
    });

  } catch (error) {
    console.error('❌ Error generating goal recommendations:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate goal recommendations',
      details: error.message
    });
  }
});

// POST /api/goals/create - Create a new goal
app.post('/api/goals/create', async (req, res) => {
  try {
    const goalData = req.body;
    console.log(`🎯 Creating new goal for user: ${goalData.userId}`);

    const goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: goalData.userId,
      title: goalData.title,
      description: goalData.description,
      targetTopic: goalData.targetTopic || '',
      targetMetric: goalData.targetMetric,
      targetValue: goalData.targetValue,
      currentValue: 0,
      deadline: goalData.deadline,
      status: 'active',
      aiRecommended: goalData.aiRecommended || false,
      createdAt: serverTimestamp(),
      completedAt: null
    };

    const goalDoc = doc(db, 'users', goalData.userId, 'goals', goal.id);
    await setDoc(goalDoc, goal);

    console.log(`✅ Goal created: ${goal.title}`);

    res.json({
      success: true,
      goal: goal
    });

  } catch (error) {
    console.error('❌ Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal'
    });
  }
});

// GET /api/goals/:userId - Fetch all goals
app.get('/api/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    console.log(`🎯 Fetching goals for user: ${userId}, status: ${status || 'all'}`);

    const goalsRef = collection(db, 'users', userId, 'goals');
    const goalsSnap = await getDocs(goalsRef);
    
    let goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by status if specified
    if (status && status !== 'all') {
      goals = goals.filter(goal => goal.status === status);
    }

    console.log(`✅ Found ${goals.length} goals for ${userId}`);

    res.json({
      success: true,
      goals: goals
    });

  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals'
    });
  }
});

// PUT /api/goals/:goalId/progress - Update goal progress
app.put('/api/goals/:goalId/progress', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId, newValue } = req.body;
    console.log(`🎯 Updating progress for goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalDoc);

    if (!goalSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goalData = goalSnap.data();
    const updatedGoal = {
      ...goalData,
      currentValue: newValue,
      lastUpdated: serverTimestamp()
    };

    await setDoc(goalDoc, updatedGoal);

    console.log(`✅ Goal progress updated: ${goalData.title} - ${newValue}/${goalData.targetValue}`);

    res.json({
      success: true,
      goal: updatedGoal
    });

  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal progress'
    });
  }
});

// PUT /api/goals/:goalId/complete - Mark goal as complete
app.put('/api/goals/:goalId/complete', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId } = req.body;
    console.log(`🎯 Completing goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalDoc);

    if (!goalSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goalData = goalSnap.data();
    const completedGoal = {
      ...goalData,
      status: 'completed',
      completedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    await setDoc(goalDoc, completedGoal);

    console.log(`✅ Goal completed: ${goalData.title}`);

    res.json({
      success: true,
      goal: completedGoal
    });

  } catch (error) {
    console.error('❌ Error completing goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete goal'
    });
  }
});

// DELETE /api/goals/:goalId - Delete/archive goal
app.delete('/api/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { userId } = req.body;
    console.log(`🎯 Deleting goal: ${goalId}`);

    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDoc);

    console.log(`✅ Goal deleted: ${goalId}`);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal'
    });
  }
});

// Mount adaptive learning routes
app.use('/api/adaptive', adaptiveLearningRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 Adaptive Learning API: http://localhost:${PORT}/api/adaptive`);
});

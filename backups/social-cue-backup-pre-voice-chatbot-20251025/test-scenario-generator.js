import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Test scenario generator is running!', timestamp: new Date() });
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
        example: 'Your group is working on a project but one person is not helping. What do you do?'
      },
      '6-8': {
        language: 'Age-appropriate teen language (8-15 words per sentence)',
        topics: 'peer pressure, social media etiquette, conflict resolution, teamwork',
        settings: 'middle school, group chats, lunch tables, sports teams, clubs',
        avoid: 'adult relationships, workplace scenarios, inappropriate content',
        example: 'Someone is being mean to your friend online. What do you do?'
      },
      '9-12': {
        language: 'Mature but appropriate vocabulary (10-20 words per sentence)',
        topics: 'leadership, peer relationships, academic pressure, future planning',
        settings: 'high school, clubs, sports, social events',
        avoid: 'adult-only situations, inappropriate content',
        example: 'Your friend is stressed about college applications. What do you do?'
      }
    };

    const guidelines = ageGuidelines[gradeLevel] || ageGuidelines['3-5'];
    const age = parseInt(gradeLevel) + 5; // Approximate age

    const requestId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

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

    const prompt = `Generate 5 DIFFERENT social skills practice scenarios for grade ${gradeLevel} students.

RANDOM SEED: ${topic}-${timestamp}-${Math.random()}
REQUEST ID: ${requestId}
TIMESTAMP: ${timestamp}

Topic: ${topic}
Grade: ${gradeLevel} (age ${age})
Focus: ${topicContext}

Create 5 COMPLETELY DIFFERENT realistic school situations. Each scenario must be unique and different from the others. Use names like Alex, Sam, Jordan, Casey, Taylor, Morgan.

Vary the settings: cafeteria, playground, classroom, hallway, library, gym, art room, music room, bus stop, after-school club.

Vary the situations: meeting new people, helping someone, dealing with conflict, working together, sharing, taking turns, being inclusive.

Return ONLY this JSON format:
{
  "title": "${topic}",
  "scenarios": [
    {
      "scenario": "unique situation description",
      "options": [
        {
          "text": "response option",
          "isGood": true,
          "points": 10,
          "feedback": "specific feedback"
        },
        {
          "text": "response option",
          "isGood": true,
          "points": 8,
          "feedback": "specific feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 3,
          "feedback": "specific feedback"
        },
        {
          "text": "response option",
          "isGood": false,
          "points": 1,
          "feedback": "specific feedback"
        }
      ]
    }
  ]
}

IMPORTANT: Make each scenario completely different from the others. Use different names, settings, and situations.`;

    console.log(`🤖 Calling Anthropic API for scenario generation...`);
    
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.9, // Higher temperature for more variety
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    let responseText = message.content[0].text;
    console.log(`📊 API response received, validating for age-appropriateness...`);
    
    // Validate response for banned words
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
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       responseText.match(/(\{[\s\S]*\})/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      lessonData = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed lesson: "${lessonData.title || 'Unknown'}"`);
      console.log(`📊 Lesson contains ${lessonData.scenarios?.length || 0} practice scenarios`);
      
      // Log scenario quality for debugging
      if (lessonData.scenarios) {
        console.log(`📝 Generated scenarios:`, lessonData.scenarios.map(s => ({
          scenario: s.scenario.substring(0, 50) + '...',
          numOptions: s.options?.length || 0
        })));
      }
      
    } catch (parseError) {
      console.error(`❌ Failed to parse lesson JSON:`, parseError);
      console.log(`Raw response:`, responseText.substring(0, 500) + '...');
      throw new Error('Failed to parse lesson response from AI');
    }
    
    // Log cost tracking
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    const estimatedCost = (tokensUsed / 1000) * 0.00025; // Rough estimate for Claude Haiku
    console.log(`💰 Tokens used: ${tokensUsed}, Estimated cost: $${estimatedCost.toFixed(4)}`);
    
    res.json({
      success: true,
      data: lessonData,
      requestId,
      timestamp,
      tokensUsed,
      estimatedCost
    });
    
  } catch (error) {
    console.error('❌ Error generating scenarios:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Simple HTML page for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Scenario Generator Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            select, input { padding: 8px; margin-right: 10px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .scenario { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .scenario h3 { margin-top: 0; color: #333; }
            .options { margin: 10px 0; }
            .option { margin: 5px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
            .option.good { background: #d4edda; }
            .option.bad { background: #f8d7da; }
            .loading { color: #666; font-style: italic; }
            .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 4px; }
            .success { color: #155724; background: #d4edda; padding: 10px; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Scenario Generator Test</h1>
            <p>This page tests scenario generation with variety. Refresh multiple times to see different scenarios.</p>
            
            <div class="form-group">
                <label for="category">Category:</label>
                <select id="category">
                    <option value="social-skills">Social Skills</option>
                </select>
                
                <label for="gradeLevel">Grade Level:</label>
                <select id="gradeLevel">
                    <option value="3-5">3-5</option>
                    <option value="6-8">6-8</option>
                    <option value="9-12">9-12</option>
                </select>
                
                <label for="topic">Topic:</label>
                <select id="topic">
                    <option value="small-talk">Small Talk</option>
                    <option value="making-friends">Making Friends</option>
                    <option value="active-listening">Active Listening</option>
                    <option value="body-language">Body Language</option>
                    <option value="confidence-building">Confidence Building</option>
                </select>
                
                <button onclick="generateScenarios()">Generate Scenarios</button>
            </div>
            
            <div id="results"></div>
        </div>

        <script>
            async function generateScenarios() {
                const category = document.getElementById('category').value;
                const gradeLevel = document.getElementById('gradeLevel').value;
                const topic = document.getElementById('topic').value;
                
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<div class="loading">🔄 Generating scenarios...</div>';
                
                try {
                    const response = await fetch('/api/generate-scenario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ category, gradeLevel, topic })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        displayScenarios(data.data);
                    } else {
                        resultsDiv.innerHTML = '<div class="error">❌ Error: ' + data.error + '</div>';
                    }
                } catch (error) {
                    resultsDiv.innerHTML = '<div class="error">❌ Network error: ' + error.message + '</div>';
                }
            }
            
            function displayScenarios(lessonData) {
                const resultsDiv = document.getElementById('results');
                let html = '<div class="success">✅ Generated ' + lessonData.scenarios.length + ' scenarios</div>';
                
                lessonData.scenarios.forEach((scenario, index) => {
                    html += '<div class="scenario">';
                    html += '<h3>Scenario ' + (index + 1) + '</h3>';
                    html += '<p><strong>Situation:</strong> ' + scenario.scenario + '</p>';
                    html += '<div class="options">';
                    html += '<strong>Options:</strong>';
                    
                    scenario.options.forEach((option, optIndex) => {
                        const className = option.isGood ? 'good' : 'bad';
                        html += '<div class="option ' + className + '">';
                        html += '<strong>' + String.fromCharCode(65 + optIndex) + '.</strong> ' + option.text;
                        html += ' <em>(' + option.points + ' points)</em>';
                        html += '</div>';
                    });
                    
                    html += '</div></div>';
                });
                
                resultsDiv.innerHTML = html;
            }
            
            // Auto-generate on page load
            window.onload = function() {
                generateScenarios();
            };
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Test scenario generator running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Test page: http://localhost:${PORT}`);
});

import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testAPI() {
  console.log('Testing Claude API...');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env file');
    return;
  }
  
  console.log('✅ API Key found in environment variables');
  console.log('Key starts with:', process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Say hello and confirm the API is working!'
        }
      ],
    });
    
    console.log('✅ SUCCESS! API is working!');
    console.log('Claude says:', message.content[0].text);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.message.includes('authentication')) {
      console.error('Check that your API key is correct in the .env file');
    }
  }
}

testAPI();
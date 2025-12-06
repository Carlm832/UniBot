require('dotenv').config();
const { OpenAI } = require('openai');

async function testConnections() {
  console.log('🔍 Testing connections...\n');

  // Test OpenAI
  console.log('1. Testing OpenAI connection...');
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY not found in .env file');
      console.log('Please add your API key to the .env file');
      return;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Connection successful!"' }],
      max_tokens: 10,
    });

    console.log('✅ OpenAI connected successfully!');
    console.log(`   Response: ${response.choices[0].message.content}\n`);
  } catch (error) {
    console.log('❌ OpenAI connection failed:', error.message, '\n');
    
    if (error.message.includes('Incorrect API key')) {
      console.log('   Fix: Check your OPENAI_API_KEY in .env file');
      console.log('   Get your key from: https://platform.openai.com/api-keys\n');
    }
  }

  console.log('✅ Test complete!');
}

testConnections();
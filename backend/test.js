const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
  try {
    console.log('Testing Groq API with prompt: "hello Brave knight"');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a creative fiction writer. Generate a compelling short story based on the user\'s prompt in very short.' },
        { role: 'user', content: 'hello Brave knight' }
      ],
      model: 'gemma2-9b-it',
      temperature: 0.7,
      max_tokens: 100,
      stream: false
    });
    console.log('Groq API response:', chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Groq API error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : 'No response data'
    });
  }
}

testGroq();
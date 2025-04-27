const express = require('express');
const Groq = require('groq-sdk');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5001;

// Token limit configuration
const MAX_TOKENS = 1500; // Total token limit per request
const MAX_STORY_TOKENS = 1000; // Max tokens for story generation
const MAX_AUDIO_TOKENS = 500; // Max tokens for audio conversion (including overhead)

console.log('Environment Variables:', {
  GROQ_API_KEY: process.env.GROQ_API_KEY ? 'exists' : 'missing',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? 'exists' : 'missing'
});

// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested from:', req.ip);
  res.status(200).json({ status: 'OK', message: 'Backend service is running' });
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post('/api/generate-story', async (req, res) => {
  console.log('Received request to /api/generate-story from:', req.ip);
  console.log('Request body:', req.body);

  const { prompt } = req.body;

  if (!prompt) {
    console.log('Error: Prompt is required');
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      console.log('Error: GROQ_API_KEY is not defined');
      throw new Error('GROQ_API_KEY is not defined in the environment variables');
    }

    console.log('Attempting Groq API call with prompt:', prompt);

    const chatCompletion = await Promise.race([
      groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a creative fiction writer Stephen King. Generate a very short story (under 1000 characters) based on the user\'s prompt and very appealing and exciting to user .' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: MAX_STORY_TOKENS,
        stream: false
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 7 seconds')), 7000)
      )
    ]);

    const story = chatCompletion.choices[0]?.message?.content || '';
    if (!story) {
      console.log('Error: No story generated from API response');
      throw new Error('No story generated from API response');
    }

    if (story.length > MAX_STORY_TOKENS) {
      console.log('Warning: Story exceeds token limit, truncating to', MAX_STORY_TOKENS, 'characters');
      story = story.substring(0, MAX_STORY_TOKENS);
    }

    console.log('Successfully generated story (length:', story.length, 'chars):', story);
    res.json({ story });
  } catch (error) {
    console.error('Groq API error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : 'No response data',
      status: error.response ? error.response.status : 'No status'
    });
    res.status(500).json({ error: 'Failed to generate story. Please try again.', details: error.message });
  }
});

app.post('/api/convert-to-audio', async (req, res) => {
  console.log('Received request to /api/convert-to-audio from:', req.ip);
  console.log('Request body:', req.body);

  const { text } = req.body;

  if (!text) {
    console.log('Error: Text is required');
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('Error: ELEVENLABS_API_KEY is not defined');
      throw new Error('ELEVENLABS_API_KEY is not defined in the environment variables');
    }

    if (text.length > MAX_AUDIO_TOKENS) {
      console.log('Warning: Text exceeds token limit, truncating to', MAX_AUDIO_TOKENS, 'characters');
      text = text.substring(0, MAX_AUDIO_TOKENS);
    }

    console.log('Attempting ElevenLabs API call with text (length:', text.length, 'chars):', text);

    const elevenLabsResponse = await Promise.race([
      axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb/stream?optimize_streaming_latency=3&output_format=mp3_44100_128',
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.9,
            similarity_boost: 0.50,
            style: 0.1,
            speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('ElevenLabs API request timed out after 7 seconds')), 7000)
      )
    ]);

    const audioBase64 = Buffer.from(elevenLabsResponse.data).toString('base64');
    console.log('Successfully generated audio (text length:', text.length, 'chars)');
    res.json({
      audio: `data:audio/mp3;base64,${audioBase64}`
    });
  } catch (error) {
    console.error('ElevenLabs API error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : 'No response data',
      status: error.response ? error.response.status : 'No status'
    });
    res.status(500).json({ error: 'Failed to generate audio. Please try again.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
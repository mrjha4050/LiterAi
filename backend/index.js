const express = require('express');
const Groq = require('groq-sdk');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

// Initialize Firebase Admin
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./serviceAccountKey.json'); // Fallback to local file
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5001;

// In-memory cache for common phrases
const audioCache = new Map();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader:", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

console.log('Environment Variables:', {
  GROQ_API_KEY: process.env.GROQ_API_KEY ? 'exists' : 'missing',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? 'exists' : 'missing',
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'exists' : 'missing'
});

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://liter-ai.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS error: Origin not allowed:', origin);
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

app.get('/api/health', (req, res) => {
  console.log('Health check requested from:', req.ip);
  res.status(200).json({ status: 'OK', message: 'Backend service is running' });
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const commonPhrases = [
  'Once upon a time',
  'The end.',
  'They lived happily ever after.',
  'I couldn’t help but smile',
  'My name is Emily'
];

const cacheCommonPhrases = async () => {
  for (const phrase of commonPhrases) {
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0/stream?optimize_streaming_latency=3&output_format=mp3_44100_128',
        {
          text: phrase,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.9,
            similarity_boost: 0.75,
            style: 0.2,
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
      );
      const audioBase64 = Buffer.from(response.data).toString('base64');
      audioCache.set(phrase, audioBase64);
      console.log(`Cached audio for phrase: "${phrase}"`);
    } catch (error) {
      console.error(`Failed to cache phrase "${phrase}":`, error.message);
    }
  }
};

cacheCommonPhrases();

const shortenText = (text) => {
  const fillerWords = /\b(very|really|just|quite|so|basically|actually)\b/gi;
  return text.replace(fillerWords, '').replace(/\s+/g, ' ').trim();
};

// Apply authentication middleware to protected routes
app.post('/api/generate-story', authenticateToken, async (req, res) => {
  console.log('Received request to /api/generate-story from:', req.ip, 'User:', req.user.email);
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
          { role: 'system', content: 'As a writer of fiction and realism in the vein of William Shakespeare, craft a brief tale (under 2000 characters) inspired by the user\'s prompt...' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 9 seconds')), 7000)
      )
    ]);

    const story = chatCompletion.choices[0]?.message?.content || '';
    if (!story) {
      console.log('Error: No story generated from API response');
      throw new Error('No story generated from API response');
    }

    let truncatedStory = story;
    if (truncatedStory.length > 1000) {
      console.log('Warning: Story exceeds token limit, truncating to 1000 characters');
      truncatedStory = truncatedStory.substring(0, 1000);
    }

    console.log('Successfully generated story (length:', truncatedStory.length, 'chars):', truncatedStory);
    res.json({ story: truncatedStory });
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

app.post('/api/convert-to-audio', authenticateToken, async (req, res) => {
  console.log('Received request to /api/convert-to-audio from:', req.ip, 'User:', req.user.email);
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

    let optimizedText = shortenText(text);
    console.log('Optimized text (length:', optimizedText.length, 'chars):', optimizedText);

    let finalText = optimizedText;

    // For now, skip caching to isolate the issue
    console.log('Attempting ElevenLabs API call with full text (length:', finalText.length, 'chars):', finalText);

    const elevenLabsResponse = await Promise.race([
      axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0/stream?optimize_streaming_latency=3&output_format=mp3_44100_128',
        {
          text: finalText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.9,
            similarity_boost: 0.75,
            style: 0.2,
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
        setTimeout(() => reject(new Error('ElevenLabs API request timed out after 15 seconds')), 15000)
      )
    ]);

    const audioBuffer = Buffer.from(elevenLabsResponse.data);
    console.log('Raw audio buffer length:', audioBuffer.length);
    
    // Save the audio to a file for debugging
    fs.writeFileSync('debug-audio.mp3', audioBuffer);
    console.log('Audio saved to debug-audio.mp3 for debugging');

    const audioBase64 = audioBuffer.toString('base64');
    console.log('Audio base64 length:', audioBase64.length);

    res.json({
      audio: `data:audio/mp3;base64,${audioBase64}`
    });
  } catch (error) {
    console.error('ElevenLabs API error:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data ? error.response.data.toString() : 'No data',
        headers: error.response.headers
      } : 'No response data',
      status: error.response ? error.response.status : 'No status'
    });
    res.status(500).json({ error: 'Failed to generate audio. Please try again.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

const express = require('express');
const Groq = require('groq-sdk');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Token limit configuration
const MAX_TOKENS = 1700;
const MAX_STORY_TOKENS = 1000;
const MAX_AUDIO_TOKENS = 700;  

const audioCache = new Map(); 

console.log('Environment Variables:', {
  GROQ_API_KEY: process.env.GROQ_API_KEY ? 'exists' : 'missing',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? 'exists' : 'missing'
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
  'They lived happily ever after.'
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
  // Remove common filler words and extra spaces
  const fillerWords = /\b(very|really|just|quite|so|basically|actually)\b/gi;
  return text.replace(fillerWords, '').replace(/\s+/g, ' ').trim();
};

const chunkText = (text, maxLength) => {
  const chunks = [];
  let remainingText = text;
  while (remainingText.length > 0) {
    if (remainingText.length <= maxLength) {
      chunks.push(remainingText);
      break;
    }
    let chunk = remainingText.substring(0, maxLength);
    const lastSpace = chunk.lastIndexOf(' ');
    if (lastSpace !== -1 && lastSpace < maxLength - 1) {
      chunk = chunk.substring(0, lastSpace);
    }
    chunks.push(chunk);
    remainingText = remainingText.substring(chunk.length).trim();
  }
  return chunks;
};

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
          { role: 'system', content: 'You are a creative fiction writer. Generate a very short story (under 1000 characters) based on the user\'s prompt.' },
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

    let truncatedStory = story;
    if (truncatedStory.length > MAX_STORY_TOKENS) {
      console.log('Warning: Story exceeds token limit, truncating to', MAX_STORY_TOKENS, 'characters');
      truncatedStory = truncatedStory.substring(0, MAX_STORY_TOKENS);
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

    let optimizedText = shortenText(text);
    console.log('Optimized text (length:', optimizedText.length, 'chars):', optimizedText);

    let finalText = optimizedText;
    const cachedAudioSegments = [];

    for (const phrase of commonPhrases) {
      if (finalText.startsWith(phrase)) {
        cachedAudioSegments.push(audioCache.get(phrase));
        finalText = finalText.substring(phrase.length).trim();
      } else if (finalText.endsWith(phrase)) {
        cachedAudioSegments.push(audioCache.get(phrase));
        finalText = finalText.substring(0, finalText.length - phrase.length).trim();
      }
    }

    const textChunks = chunkText(finalText, MAX_AUDIO_TOKENS);
    console.log('Text chunks:', textChunks);

    // Step 4: Generate audio for each chunk
    const audioSegments = [...cachedAudioSegments];
    for (const chunk of textChunks) {
      console.log('Attempting ElevenLabs API call with chunk (length:', chunk.length, 'chars):', chunk);

      const elevenLabsResponse = await Promise.race([
        axios.post(
          'https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0/stream?optimize_streaming_latency=3&output_format=mp3_44100_128',
          {
            text: chunk,
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
          setTimeout(() => reject(new Error('ElevenLabs API request timed out after 7 seconds')), 7000)
        )
      ]);

      const audioBase64 = Buffer.from(elevenLabsResponse.data).toString('base64');
      audioSegments.push(audioBase64);
    }

    console.log('Successfully generated audio with', audioSegments.length, 'segments');
    res.json({
      audio: `data:audio/mp3;base64,${audioSegments[0]}` // Return the first segment for now
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
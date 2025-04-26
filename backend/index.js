const express = require('express');
const Groq = require('groq-sdk');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.VITE_GROQ_API_KEY
});

const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Endpoint to generate a story
app.post('/api/generate-story', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a creative fiction writer. Generate a compelling short story based on the user\'s prompt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    });

    const story = chatCompletion.choices[0]?.message?.content || '';
    if (!story) {
      return res.status(500).json({ error: 'Failed to generate story text.' });
    }

    res.json({ story });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to generate story. Please try again.' });
  }
});

// Endpoint to convert story to audio
app.post('/api/convert-to-audio', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const elevenLabsResponse = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          speaker_boost: true
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBase64 = Buffer.from(elevenLabsResponse.data).toString('base64');
    res.json({
      audio: `data:audio/mp3;base64,${audioBase64}`
    });
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    res.status(500).json({ error: 'Failed to generate audio. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
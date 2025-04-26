// services/elevenLabsService.js
import axios from 'axios';


const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

export const textToSpeechWithTimestamps = async (text, voiceId = '21m00Tcm4TlvDq8ikWAM') => {
  try {
    const response = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
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
        responseType: 'blob'
      }
    );

    return {
      audioBlob: response.data,
      timestamps: await getWordTimestamps(text, voiceId)
    };
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
};

const getWordTimestamps = async (text, voiceId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}/stream-timestamps`,
      {
        text: text,
        model_id: "eleven_monolingual_v1"
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.timestamps;
  } catch (error) {
    console.error('Error getting timestamps:', error);
    return [];
  }
};
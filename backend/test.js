const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const testElevenLabs = async () => {
  const text = "hello world";
  const payload = {
    text: text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.9,
      similarity_boost: 0.75,
      style: 0.2,
      speaker_boost: true
    }
  };

  console.log('Sending payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM?output_format=mp3_44100_128',
      payload,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('Raw audio buffer length:', response.data.length);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Character cost:', response.headers['character-cost']);
    fs.writeFileSync('test-audio-nonstream.mp3', Buffer.from(response.data));
    console.log('Audio saved to test-audio-nonstream.mp3');
  } catch (error) {
    console.error('ElevenLabs API error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data ? error.response.data.toString() : 'No data',
        headers: error.response.headers
      } : 'No response data'
    });
  }
};

testElevenLabs().catch(console.error);
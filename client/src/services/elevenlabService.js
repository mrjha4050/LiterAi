// const BASE_URL = 'https://literai-ce6r.onrender.com';
const BASE_URL = 'http://localhost:5001'; // Use local backend for testing

export const convertToAudio = async (text, idToken) => {
  try {
    const response = await fetch(`${BASE_URL}/api/convert-to-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ text }),
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Received audio data:', data); 

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate audio');
    }

    return data.audio;
  } catch (error) {
    console.error('Error calling backend for audio:', error);
    throw new Error(error.message || 'Failed to generate audio. Please try again.');
  }
};
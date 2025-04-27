// client/src/services/elevenlabService.js
export const convertToAudio = async (text) => {
  try {
    const response = await fetch('http://localhost:5001/api/convert-to-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      credentials: 'include', 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate audio');
    }

    return data.audio;
  } catch (error) {
    console.error('Error calling backend for audio:', error);
    throw new Error(error.message || 'Failed to generate audio. Please try again.');
  }
};
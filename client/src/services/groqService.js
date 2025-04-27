const BASE_URL = 'https://literai-ce6r.onrender.com';

export const generateStory = async (prompt) => {
  console.log('Starting generate-story request with prompt:', prompt);

  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    console.log('Health check response status:', healthResponse.status);

    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }

    const response = await Promise.race([
      fetch(`${BASE_URL}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        credentials: 'include',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Generate story request timed out after 7 seconds')), 7000)
      ),
    ]);

    console.log('Received response with status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate story');
    }

    return data.story;
  } catch (error) {
    console.error('Full API error:', error);
    throw new Error(error.message || 'Failed to generate story. Please try again.');
  }
};
const BASE_URL = 'https://literai-ce6r.onrender.com';
// const BASE_URL = 'http://localhost:5001';

export const generateStory = async (prompt, idToken) => {
  try {
    const response = await fetch(`${BASE_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ prompt }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate story');
    }

    return data.story;  
  } catch (error) {
    console.error('Error calling backend:', error);
    throw new Error(error.message || 'Failed to generate story. Please try again.');
  }
};
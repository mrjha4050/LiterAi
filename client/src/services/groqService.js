export const generateStory = async (prompt) => {
  try {
    console.log('Health check starting...');
    let healthCheck;
    try {
      healthCheck = await Promise.race([
        fetch('http://127.0.0.1:5001/api/health'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timed out after 7 seconds')), 7000)
        )
      ]);
      console.log('Health check response status:', healthCheck.status);
    } catch (healthError) {
      console.warn('Health check failed:', healthError.message);
    }

    console.log('Starting generate-story request with prompt:', prompt);
    const response = await Promise.race([
      fetch('http://127.0.0.1:5001/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt }),
        credentials: 'include'
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Generate story request timed out after 7 seconds')), 7000)
      )
    ]);

    console.log('Received response with status:', response.status);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    console.log('Successfully received story:', data.story);
    return data.story;
  } catch (error) {
    console.error('Full API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const userMessage = error.message.includes('prompt') 
      ? 'Please provide a better story prompt'
      : error.message.includes('timed out')
        ? 'Server is taking too long to respond. Please try again later.'
        : 'Story generation failed. Please try again.';
    
    throw new Error(userMessage);
  }
};
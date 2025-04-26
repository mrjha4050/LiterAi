import { useState } from 'react';

const StoryForm = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ prompt, email });
  };

  return (
    <form onSubmit={handleSubmit} className="story-form">
      <div className="form-group">
        <label htmlFor="prompt">Story Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          rows="5"
          placeholder="Enter your story prompt (e.g., 'A detective in 1920s Paris solves a mysterious murder')"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email to receive the audio"
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Story'}
      </button>
    </form>
  );
};

export default StoryForm;
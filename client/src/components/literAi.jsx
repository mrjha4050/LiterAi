import React, { useState, useEffect } from 'react';
import { generateStory } from '../services/groqService';
import { textToSpeechWithTimestamps } from '../services/elevenlabService';

const genres = [
  { name: 'Fantasy', description: 'Dive into magical realms with dragons, wizards, and epic quests.' },
  { name: 'Sci-Fi', description: 'Explore futuristic worlds, alien encounters, and advanced tech.' },
  { name: 'Romance', description: 'Experience heartfelt stories of love, passion, and connection.' },
  { name: 'Mystery', description: 'Unravel secrets, solve crimes, and uncover hidden truths.' },
  { name: 'Horror', description: 'Face your fears with chilling tales of the unknown.' },
];

const sampleStories = {
  Fantasy: 'In the enchanted forest of Eldoria, a young mage named Lyra discovered a glowing amulet that whispered ancient prophecies...',
  'Sci-Fi': 'On the barren planet of Zorath-9, Captain Elara detected a strange signal from a derelict ship, leading her crew into a web of cosmic intrigue...',
  Romance: 'Under the starlit sky of Paris, Clara and Julien shared a dance that sparked a love they never expected...',
  Mystery: 'Detective Harris found a cryptic note at the scene of the crime, pointing to a secret society that had been hidden for centuries...',
  Horror: 'In the abandoned mansion on Blackwood Hill, Sarah heard whispers in the dark, drawing her closer to a terrifying truth...',
};

const LiterAI = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateStory = async () => {
    if (!selectedGenre) {
      setError('Please select a genre!');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt!');
      return;
    }

    setError('');
    setIsLoading(true);

    const fullPrompt = `Write a short ${selectedGenre} story about: ${prompt}`;

    try {
      const generatedStory = await generateStory(fullPrompt);
      setStory(generatedStory);
      setAudioSrc(''); // Clear previous audio when generating a new story
    } catch (err) {
      setError(err.message || 'Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!story) {
      setError('Please generate a story first!');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { audioBlob } = await textToSpeechWithTimestamps(story);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setError('');
  };

  // Cleanup the audio URL when the component unmounts
  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 sidebar-gradient p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Explore Genres</h2>
        {genres.map((genre) => (
          <div
            key={genre.name}
            className={`p-4 mb-2 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedGenre === genre.name ? 'bg-purple-200 glow' : 'bg-white'
            }`}
            onClick={() => handleGenreClick(genre.name)}
          >
            <h3 className="text-lg font-medium text-purple-600">{genre.name}</h3>
            <p className="text-sm text-gray-600">{genre.description}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          LiterAI
        </h1>
        <p className="text-center text-gray-600 mb-8">Unleash your imagination and craft a story in any genre!</p>

        <div className="max-w-2xl mx-auto">
          <textarea
            className="w-full p-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-gray-500"
            rows="3"
            placeholder="Enter your story prompt here... (e.g., A brave knight in a magical forest)"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError('');
            }}
          ></textarea>

          <div className="flex justify-center space-x-4 mb-6">
            {genres.map((genre) => (
              <button
                key={genre.name}
                className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
                  selectedGenre === genre.name
                    ? 'bg-purple-500 text-white glow'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                onClick={() => handleGenreClick(genre.name)}
              >
                {genre.name}
              </button>
            ))}
          </div>

          <button
            className="w-full gradient-button text-white py-3 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center"
            onClick={handleGenerateStory}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Generating...
              </>
            ) : (
              '✍ Generate Story'
            )}
          </button>

          {error && (
            <div className="mt-4 text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="mt-6">
            <textarea
              className="w-full p-4 rounded-lg shadow-md text-gray-700"
              rows="8"
              placeholder="Your generated story will appear here..."
              value={story}
              readOnly
            ></textarea>
          </div>

          {/* Generate Audio Button */}
          {story && !audioSrc && (
            <button
              className="w-full mt-4 gradient-button text-white py-3 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center"
              onClick={handleGenerateAudio}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                '🎙️ Generate Audio'
              )}
            </button>
          )}

          {/* Audio Playback and Download */}
          {audioSrc && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-purple-600 mb-2">Listen to Your Story</h3>
              <audio controls className="w-full mb-2">
                <source src={audioSrc} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <a
                href={audioSrc}
                download="generated-story.mp3"
                className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600"
              >
                Download Audio
              </a>
            </div>
          )}
        </div>

        {/* Sample Stories Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4 text-center">Sample Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(sampleStories).map(([genre, snippet]) => (
              <div key={genre} className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-purple-600">{genre}</h3>
                <p className="text-gray-600">{snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiterAI;
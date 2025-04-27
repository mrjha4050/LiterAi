import React, { useState, useEffect } from 'react';
import { generateStory } from '../services/groqService';
import { convertToAudio } from '../services/elevenlabService';
import Logo from './logo';
import Footer from './footer';

const genres = [
  { name: 'Fantasy', description: 'Dive into magical realms with dragons, wizards, and epic quests.', color: 'from-purple-200 to-pink-300' },
  { name: 'Sci-Fi', description: 'Explore futuristic worlds, alien encounters, and advanced tech.', color: 'from-blue-200 to-indigo-300' },
  { name: 'Romance', description: 'Experience heartfelt stories of love, passion, and connection.', color: 'from-pink-200 to-red-300' },
  { name: 'Mystery', description: 'Unravel secrets, solve crimes, and uncover hidden truths.', color: 'from-gray-200 to-teal-300' },
  { name: 'Horror', description: 'Face your fears with chilling tales of the unknown.', color: 'from-red-200 to-purple-300' },
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
      setAudioSrc('');
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
      const audio = await convertToAudio(story);
      setAudioSrc(audio);
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

  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
      {/* Improved Header */}
      <header className="w-full bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm py-3 md:py-4 flex justify-center items-center border-b border-purple-200">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Logo className="h-7 w-7 md:h-9 md:w-9 text-purple-600" />
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-1/4 p-4 md:p-6 bg-gradient-to-b from-purple-200 to-pink-200 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4">Explore Genres</h2>
          <div className="grid grid-cols-1 gap-3">
            {genres.map((genre) => (
              <div
                key={genre.name}
                className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-300 shadow-md ${
                  selectedGenre === genre.name
                  ? `bg-gradient-to-r ${genre.color} text-white glow`
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}
                onClick={() => handleGenreClick(genre.name)}
              >
                <h3 className="text-base md:text-lg font-medium">{genre.name}</h3>
                <p className="text-xs md:text-sm">{genre.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 md:p-5">
          <p className="text-center text-gray-600 text-xs md:text-sm mb-2 md:mb-4">
            Unleash your imagination and craft a story in any genre!
          </p>

          <div className="max-w-full md:max-w-2xl mx-auto">
            <textarea
              className="w-full p-2 md:p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 mb-2 md:mb-4 text-gray-600 text-sm md:text-base bg-white bg-opacity-80"
              rows="3"
              placeholder="Enter your story prompt here... (e.g., A brave knight in a magical forest)"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
            ></textarea>

            <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-2 md:mb-4">
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-sm transition-all duration-300 text-xs md:text-sm ${
                    selectedGenre === genre.name
                    ? `bg-gradient-to-r ${genre.color} text-white glow`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  onClick={() => handleGenreClick(genre.name)}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <button
              className="w-full bg-gradient-to-r from-purple-400 to-pink-600 text-white py-1.5 md:py-2 rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-800 flex items-center justify-center text-sm md:text-base"
              onClick={handleGenerateStory}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3 md:h-4 md:w-4 mr-1 text-white"
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
              <div className="mt-2 md:mt-3 text-red-500 text-center text-xs md:text-sm">
                {error}
              </div>
            )}

            <div className="mt-2 md:mt-4">
              <textarea
                className="w-full p-2 md:p-3 rounded-lg shadow-sm text-gray-700 text-sm md:text-base bg-white bg-opacity-80"
                rows="6"
                placeholder="Your generated story will appear here..."
                value={story}
                readOnly
              ></textarea>
            </div>

            {story && !audioSrc && (
              <button
                className="w-full mt-2 md:mt-3 bg-gradient-to-r from-indigo-300 to-purple-300 text-white py-1.5 md:py-2 rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center justify-center text-sm md:text-base"
                onClick={handleGenerateAudio}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 md:h-4 md:w-4 mr-1 text-white"
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

            {audioSrc && (
              <div className="mt-2 md:mt-3">
                <h3 className="text-sm md:text-base font-medium text-purple-600 mb-1 md:mb-2">Listen to Your Story</h3>
                <audio controls className="w-full mb-1 md:mb-2">
                  <source src={audioSrc} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
                <a
                  href={audioSrc}
                  download="generated-story.mp3"
                  className="inline-block px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-purple-300 to-indigo-300 text-white rounded-lg shadow-sm hover:opacity-90 text-xs md:text-sm"
                >
                  Download Audio
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-8 max-w-full md:max-w-4xl mx-auto">
            <h2 className="text-lg md:text-xl font-medium text-purple-700 mb-2 md:mb-4 text-center">Sample Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {Object.entries(sampleStories).map(([genre, snippet]) => (
                <div
                  key={genre}
                  className="p-2 md:p-3 bg-white bg-opacity-80 rounded-lg shadow-sm border-l-2 border-purple-300"
                >
                  <h3 className="text-sm md:text-base font-medium text-purple-600">{genre}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">{snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default LiterAI;
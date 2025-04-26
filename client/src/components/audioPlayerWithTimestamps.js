// components/AudioPlayerWithTimestamps.js
import { useState, useRef, useEffect } from 'react';

const AudioPlayerWithTimestamps = ({ audioBlob, timestamps }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime * 1000); // Convert to ms

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  useEffect(() => {
    if (!timestamps || timestamps.length === 0) return;

    const currentTimestamp = timestamps.find(ts => 
      currentTime >= ts.start && currentTime <= ts.end
    );

    setHighlightedWord(currentTimestamp?.text || null);
  }, [currentTime, timestamps]);

  return (
    <div className="audio-player-container">
      <audio 
        ref={audioRef}
        controls 
        src={URL.createObjectURL(audioBlob)}
        className="audio-element"
      />
      
      {timestamps && timestamps.length > 0 && (
        <div className="transcript-container">
          <h3>Transcript with Timestamps</h3>
          <div className="transcript-text">
            {timestamps.map((timestamp, index) => (
              <span 
                key={index}
                className={`word ${highlightedWord === timestamp.text ? 'highlight' : ''}`}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = timestamp.start / 1000;
                  }
                }}
              >
                {timestamp.text}{' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerWithTimestamps;
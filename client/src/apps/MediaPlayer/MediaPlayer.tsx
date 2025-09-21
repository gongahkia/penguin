import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import './MediaPlayer.css';

interface MediaPlayerProps {
  windowId: string;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ windowId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Demo playlist
  const playlist = [
    { id: 1, title: 'Sample Track 1', artist: 'Demo Artist', duration: '3:45' },
    { id: 2, title: 'Sample Track 2', artist: 'Demo Artist', duration: '4:12' },
    { id: 3, title: 'Sample Track 3', artist: 'Demo Artist', duration: '2:58' },
  ];

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentTrack(prev => prev > 0 ? prev - 1 : playlist.length - 1);
  };

  const handleNext = () => {
    setCurrentTrack(prev => prev < playlist.length - 1 ? prev + 1 : 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSong = playlist[currentTrack];

  return (
    <div className="media-player">
      <div className="player-header">
        <h3>Penguin Media Player</h3>
        <div className="format-info">Demo Mode - No actual audio</div>
      </div>

      <div className="now-playing">
        <div className="album-art">
          <div className="album-placeholder">
            🎵
          </div>
        </div>
        
        <div className="track-info">
          <div className="track-title">{currentSong.title}</div>
          <div className="track-artist">{currentSong.artist}</div>
        </div>
      </div>

      <div className="progress-section">
        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="duration">{currentSong.duration}</span>
        </div>
        
        <div className="progress-bar">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentTime / 180) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={handlePrevious}>
          <SkipBack size={20} />
        </button>
        
        <button className="control-btn play-pause" onClick={togglePlayPause}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button className="control-btn" onClick={handleNext}>
          <SkipForward size={20} />
        </button>
      </div>

      <div className="volume-section">
        <button className="volume-btn" onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      <div className="playlist">
        <div className="playlist-header">Playlist</div>
        <div className="playlist-items">
          {playlist.map((track, index) => (
            <div 
              key={track.id}
              className={`playlist-item ${index === currentTrack ? 'active' : ''}`}
              onClick={() => setCurrentTrack(index)}
            >
              <div className="track-number">{index + 1}</div>
              <div className="track-details">
                <div className="track-name">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <div className="track-duration">{track.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
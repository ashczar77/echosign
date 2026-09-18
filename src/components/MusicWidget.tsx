import React from 'react';
import './MusicWidget.css';

interface MusicWidgetProps {
  isPlaying: boolean;
}

const MusicWidget: React.FC<MusicWidgetProps> = ({ isPlaying }) => {
  return (
    <div className={`glass-panel widget music-widget ${isPlaying ? 'playing' : 'paused'}`}>
      <div className="album-art">
        <div className="art-placeholder"></div>
        {isPlaying && (
          <div className="equalizer">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>
      
      <div className="widget-info music-info">
        <h3>Midnight City</h3>
        <p>M83</p>
      </div>
      
      <div className="playback-controls">
        <svg viewBox="0 0 24 24" fill={isPlaying ? "#00ffcc" : "#f0f0f5"} width="32" height="32">
          {isPlaying ? (
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> // Pause Icon
          ) : (
            <path d="M8 5v14l11-7z" /> // Play Icon
          )}
        </svg>
      </div>
    </div>
  );
};

export default MusicWidget;

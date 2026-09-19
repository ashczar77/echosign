import React, { useEffect, useState } from 'react';
import HandTracker from './components/HandTracker';
import { VoiceEngine } from './utils/VoiceEngine';

// Mapping raw gesture strings to their English meaning
const SIGN_DICTIONARY: Record<string, string> = {
  'ILoveYou': 'I love you',
  'Thumb_Up': 'Yes',
  'Thumb_Down': 'No',
  'Victory': 'Peace',
  'Closed_Fist': 'Stop',
  'Open_Palm': 'Hello',
  'Pointing_Up': 'Alexa, what is the weather?'
};

function App() {
  const [subtitle, setSubtitle] = useState<string>('Raise your hand to sign...');

  // Initialize the Voice Engine on mount and add Fire TV Remote listeners
  useEffect(() => {
    VoiceEngine.init();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Fire TV Remote D-Pad mapping
      switch (e.key) {
        case 'ArrowUp':
          console.log('[Fire TV Remote] D-Pad UP');
          break;
        case 'ArrowDown':
          console.log('[Fire TV Remote] D-Pad DOWN');
          break;
        case 'ArrowLeft':
          console.log('[Fire TV Remote] D-Pad LEFT');
          break;
        case 'ArrowRight':
          console.log('[Fire TV Remote] D-Pad RIGHT');
          break;
        case 'Enter':
          console.log('[Fire TV Remote] D-Pad SELECT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGesture = (gesture: string) => {
    if (gesture !== 'None') {
      const translation = SIGN_DICTIONARY[gesture];
      if (translation && translation !== subtitle) {
        setSubtitle(translation);
        // Speak the translation aloud!
        VoiceEngine.speak(translation);
      }
    }
  };

  return (
    <div className="tv-container">
      {/* Background Camera */}
      <div className="camera-layer">
        <HandTracker onGesture={handleGesture} />
      </div>

      {/* Cinematic Gradient Overlay */}
      <div className="gradient-overlay"></div>

      {/* 10-foot UI Content */}
      <div className="ui-layer">
        <header className="tv-header">
          <h1>EchoSign</h1>
          <div className="live-badge">
            <span className="dot"></span> LIVE TRANSLATION
          </div>
        </header>

        <div className="subtitle-container">
          <p className={`subtitle-text ${subtitle === 'Raise your hand to sign...' ? 'dim' : ''}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

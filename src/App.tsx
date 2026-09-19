import { useEffect, useState, useRef } from 'react';
import HandTracker, { type HandTrackerHandle } from './components/HandTracker';
import SettingsPanel from './components/SettingsPanel';
import { VoiceEngine } from './utils/VoiceEngine';

function App() {
  const [subtitle, setSubtitle] = useState<string>('Raise your hand to sign...');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const handTrackerRef = useRef<HandTrackerHandle>(null);

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
          // For now, Enter opens settings
          setIsSettingsOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGesture = (phrase: string) => {
    if (phrase !== 'None') {
      if (phrase && phrase !== subtitle) {
        setSubtitle(phrase);
        // Speak the translation aloud!
        VoiceEngine.speak(phrase);
      }
    }
  };

  const handleTeachSign = (phrase: string) => {
    if (handTrackerRef.current) {
      handTrackerRef.current.teachSign(phrase);
    }
  };

  return (
    <div className="tv-container">
      {/* Background Camera */}
      <div className="camera-layer">
        <HandTracker ref={handTrackerRef} onGesture={handleGesture} />
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

      <button className="settings-toggle" onClick={() => setIsSettingsOpen(true)}>
        ⚙️ Settings
      </button>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onTeachSign={handleTeachSign}
      />
    </div>
  );
}

export default App;

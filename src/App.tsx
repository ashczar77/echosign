import { useEffect, useState, useRef } from 'react';
import HandTracker, { type HandTrackerHandle } from './components/HandTracker';
import SettingsPanel from './components/SettingsPanel';
import { CustomGestureEngine } from './utils/CustomGestureEngine';
import { VoiceEngine } from './utils/VoiceEngine';

function App() {
  const [comboBuffer, setComboBuffer] = useState<string[]>([]);
  const [spokenText, setSpokenText] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const handTrackerRef = useRef<HandTrackerHandle>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the Voice Engine
  useEffect(() => {
    VoiceEngine.init();
  }, []);

  // Auto-evaluate combo when idle
  useEffect(() => {
    if (comboBuffer.length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        // Evaluate the combo sequence against our dictionary
        const combos = CustomGestureEngine.getSavedCombos();
        const match = combos.find(c => JSON.stringify(c.sequence) === JSON.stringify(comboBuffer));
        
        if (match) {
          VoiceEngine.speak(match.label);
          setSpokenText(match.label);
          
          // Clear text after a few seconds
          if (clearTextTimeoutRef.current) clearTimeout(clearTextTimeoutRef.current);
          clearTextTimeoutRef.current = setTimeout(() => setSpokenText(''), 4000);
        }
        
        // Clear the combo buffer regardless
        setComboBuffer([]); 
      }, 2000); // 2 seconds of inactivity triggers evaluation
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [comboBuffer]);

  const handleGesture = (poseId: string) => {
    if (poseId === 'None') return;

    setComboBuffer(prev => {
      // Prevent consecutive duplicate poses from noise
      if (prev.length > 0 && prev[prev.length - 1] === poseId) {
        return prev;
      }
      return [...prev, poseId];
    });
  };

  return (
    <div className="tv-container">
      <div className="camera-layer">
        <HandTracker ref={handTrackerRef} onGesture={handleGesture} />
      </div>

      <div className="gradient-overlay"></div>

      <div className="ui-layer">
        <header className="tv-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/logo.jpg" alt="EchoSign Logo" style={{ height: '60px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,255,204,0.3)' }} />
            <h1>EchoSign</h1>
          </div>
          <div className="live-badge">
            <span className="dot"></span> LIVE TRANSLATION
          </div>
        </header>

        <div className="subtitle-container">
          <div className="sentence-mode-ui">
            {comboBuffer.length > 0 ? (
              <div className="combo-indicators">
                {comboBuffer.map((_, i) => (
                  <span key={i} className="combo-dot" style={{ fontSize: '3rem', color: '#00ffcc', marginRight: '10px' }}>•</span>
                ))}
              </div>
            ) : (
              <p className={`subtitle-text ${!spokenText ? 'dim' : ''}`}>
                {spokenText || 'Perform a combo to speak...'}
              </p>
            )}
          </div>
        </div>
      </div>

      <button className="settings-toggle" onClick={() => setIsSettingsOpen(true)}>
        ⚙️ Settings
      </button>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        getFeatureVector={() => handTrackerRef.current?.getFeatureVector() || null}
      />
    </div>
  );
}

export default App;

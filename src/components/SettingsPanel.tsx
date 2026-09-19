import { useState, useEffect } from 'react';
import { CustomGestureEngine, type SavedCombo } from '../utils/CustomGestureEngine';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  getFeatureVector: () => number[] | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, getFeatureVector }) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([]);
  const [pendingVectors, setPendingVectors] = useState<number[][]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshCombos();
    }
  }, [isOpen]);

  const refreshCombos = () => {
    setSavedCombos(CustomGestureEngine.getSavedCombos());
  };

  const handleRecordStep = () => {
    if (!newPhrase.trim()) return;
    
    setIsRecording(true);
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        
        // Take the snapshot NOW
        const vec = getFeatureVector();
        if (vec) {
          setPendingVectors(prev => [...prev, vec]);
        } else {
          console.error("No hand detected during snapshot");
        }
        
        setTimeout(() => {
          setIsRecording(false);
        }, 500);
      }
    }, 1000);
  };

  const handleSaveCombo = () => {
    if (newPhrase.trim() && pendingVectors.length > 0) {
      CustomGestureEngine.saveCombo(newPhrase.trim(), pendingVectors);
      setNewPhrase('');
      setPendingVectors([]);
      refreshCombos();
    }
  };

  const handleDelete = (label: string) => {
    CustomGestureEngine.deleteCombo(label);
    refreshCombos();
  };

  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
      <div className="settings-header">
        <h2>Dictionary</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="settings-content">
        <div className="teach-section">
          <h3>Add Custom Combo</h3>
          <p>
            Type a sentence, then record a sequence of gestures. Take your time between steps!
          </p>
          <input 
            type="text" 
            placeholder="e.g. Alexa, turn on the lights" 
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            disabled={isRecording || pendingVectors.length > 0}
          />
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleRecordStep}
              disabled={isRecording || !newPhrase.trim()}
            >
              {countdown !== null ? `Recording in ${countdown}...` : `Record Gesture ${pendingVectors.length + 1}`}
            </button>

            {pendingVectors.length > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="save-combo-btn"
                  onClick={handleSaveCombo}
                  style={{ flex: 2, padding: '10px', background: '#00ffcc', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Combo ({pendingVectors.length} steps)
                </button>
                <button 
                  onClick={() => setPendingVectors([])}
                  style={{ flex: 1, padding: '10px', background: 'transparent', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="dictionary-section">
          <h3>Saved Combos ({savedCombos.length})</h3>
          {savedCombos.length === 0 ? (
            <p className="empty-text">No custom combos yet. Add one above!</p>
          ) : (
            <ul className="gesture-list">
              {savedCombos.map(c => (
                <li key={c.label}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="gesture-label">{c.label}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{c.sequence.length} gestures</span>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(c.label)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

import { useState, useEffect } from 'react';
import { CustomGestureEngine, type SavedCombo } from '../utils/CustomGestureEngine';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  getFeatureVector: () => number[] | null;
  onSwitchProfile: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, getFeatureVector, onSwitchProfile }) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [newWebhook, setNewWebhook] = useState('');
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([]);
  const [pendingVectors, setPendingVectors] = useState<number[][]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
    setErrorMessage(null);
    if (newPhrase.trim() && pendingVectors.length > 0) {
      const collisionLabel = CustomGestureEngine.checkCollision(pendingVectors, newPhrase.trim());
      if (collisionLabel) {
        setErrorMessage(`Collision! This exact gesture sequence is already used for: "${collisionLabel}"`);
        return;
      }
      
      try {
        CustomGestureEngine.saveCombo(newPhrase.trim(), pendingVectors, newWebhook);
        setNewPhrase('');
        setNewWebhook('');
        setPendingVectors([]);
        refreshCombos();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save combo.");
      }
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
        <div>
          <button 
            onClick={onSwitchProfile}
            style={{ background: 'transparent', color: '#00ffcc', border: '1px solid #00ffcc', borderRadius: '12px', padding: '6px 12px', marginRight: '15px', cursor: 'pointer' }}
          >
            Switch Profile
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
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
            style={{ marginBottom: '10px' }}
          />
          <input 
            type="text" 
            placeholder="Optional Webhook URL (e.g. IFTTT, Home Assistant)" 
            value={newWebhook}
            onChange={(e) => setNewWebhook(e.target.value)}
            disabled={isRecording || pendingVectors.length > 0}
            style={{ fontSize: '12px', padding: '8px' }}
          />
          
          {errorMessage && (
            <div style={{ padding: '10px', background: 'rgba(255, 71, 87, 0.2)', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '8px', fontSize: '14px', marginBottom: '10px' }}>
              ⚠️ {errorMessage}
            </div>
          )}

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
                  onClick={() => {
                    setPendingVectors([]);
                    setErrorMessage(null);
                  }}
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
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {c.sequence.length} gestures {c.webhookUrl && ' • 🔗 Webhook'}
                    </span>
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

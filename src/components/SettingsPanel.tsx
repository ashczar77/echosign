import { useState, useEffect } from 'react';
import { CustomGestureEngine, type SavedGesture } from '../utils/CustomGestureEngine';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTeachSign: (phrase: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onTeachSign }) => {
  const [newPhrase, setNewPhrase] = useState('');
  const [savedGestures, setSavedGestures] = useState<SavedGesture[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Load gestures when panel opens
  useEffect(() => {
    if (isOpen) {
      refreshGestures();
    }
  }, [isOpen]);

  const refreshGestures = () => {
    setSavedGestures(CustomGestureEngine.getSavedGestures());
  };

  const handleRecord = () => {
    if (!newPhrase.trim()) return;
    
    setIsRecording(true);
    // Tell parent to wait for the next gesture frame
    onTeachSign(newPhrase.trim());
    
    // Simulate a countdown or short delay to allow the user to get their hand in position
    setTimeout(() => {
      setIsRecording(false);
      setNewPhrase('');
      refreshGestures();
    }, 1500); // 1.5 seconds to hold the sign
  };

  const handleDelete = (label: string) => {
    const updated = savedGestures.filter(g => g.label !== label);
    localStorage.setItem('echosign_custom_gestures', JSON.stringify(updated));
    refreshGestures();
  };

  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
      <div className="settings-header">
        <h2>Dictionary</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="settings-content">
        <div className="teach-section">
          <h3>Add Custom Sign</h3>
          <p>Type a phrase, click Record, and hold your hand up to the camera.</p>
          <input 
            type="text" 
            placeholder="e.g. Alexa, turn on the lights" 
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            disabled={isRecording}
          />
          <button 
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleRecord}
            disabled={isRecording || !newPhrase.trim()}
          >
            {isRecording ? 'Recording (Hold Sign)...' : 'Record Sign'}
          </button>
        </div>

        <div className="dictionary-section">
          <h3>Saved Signs ({savedGestures.length})</h3>
          {savedGestures.length === 0 ? (
            <p className="empty-text">No custom signs yet. Add one above!</p>
          ) : (
            <ul className="gesture-list">
              {savedGestures.map(g => (
                <li key={g.label}>
                  <span className="gesture-label">{g.label}</span>
                  <button className="delete-btn" onClick={() => handleDelete(g.label)}>Delete</button>
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

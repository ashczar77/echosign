import React, { useState } from 'react';
import { ProfileEngine, type UserProfile } from '../utils/ProfileEngine';
import './ProfileSelector.css';

interface ProfileSelectorProps {
  onProfileSelect: (profileId: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(ProfileEngine.getProfiles());
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSelect = (id: string) => {
    ProfileEngine.setActiveProfileId(id);
    onProfileSelect(id);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const newProfile = ProfileEngine.addProfile(newName.trim());
      setProfiles(ProfileEngine.getProfiles());
      setIsAdding(false);
      setNewName('');
      handleSelect(newProfile.id);
    }
  };

  return (
    <div className="profile-selector-overlay">
      <div className="profile-selector-content">
        <h1>Who's signing?</h1>
        
        <div className="profiles-container">
          {profiles.map(p => (
            <div key={p.id} className="profile-card" onClick={() => handleSelect(p.id)}>
              <div className="profile-avatar" style={{ backgroundColor: p.avatarColor }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <p className="profile-name">{p.name}</p>
            </div>
          ))}
          
          <div className="profile-card add-profile" onClick={() => setIsAdding(true)}>
            <div className="profile-avatar add-avatar">+</div>
            <p className="profile-name">Add Profile</p>
          </div>
        </div>

        {isAdding && (
          <div className="add-profile-modal">
            <h2>New Profile</h2>
            <form onSubmit={handleAdd}>
              <input 
                type="text" 
                placeholder="Name" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;

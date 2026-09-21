export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
}

export class ProfileEngine {
  private static PROFILES_KEY = 'echosign_profiles';
  private static ACTIVE_KEY = 'echosign_active_profile';

  static getProfiles(): UserProfile[] {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Error loading profiles", e);
    }
    return [];
  }

  static addProfile(name: string): UserProfile {
    const profiles = this.getProfiles();
    const colors = ['#00ffcc', '#ff3366', '#00b3ff', '#ffb300', '#9c27b0'];
    const newProfile = {
      id: `user_${Date.now()}`,
      name,
      avatarColor: colors[profiles.length % colors.length]
    };
    profiles.push(newProfile);
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    return newProfile;
  }
  
  static deleteProfile(id: string) {
    const profiles = this.getProfiles().filter(p => p.id !== id);
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    if (this.getActiveProfileId() === id) {
      localStorage.removeItem(this.ACTIVE_KEY);
    }
  }

  static getActiveProfileId(): string | null {
    return localStorage.getItem(this.ACTIVE_KEY);
  }

  static setActiveProfileId(id: string) {
    localStorage.setItem(this.ACTIVE_KEY, id);
  }

  static exportActiveProfileData() {
    const id = this.getActiveProfileId();
    if (!id) return;
    
    const poses = localStorage.getItem(`echosign_poses_${id}`);
    const combos = localStorage.getItem(`echosign_combos_${id}`);
    
    const data = {
      poses: poses ? JSON.parse(poses) : [],
      combos: combos ? JSON.parse(combos) : []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echosign_backup_${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static importActiveProfileData(jsonString: string) {
    const id = this.getActiveProfileId();
    if (!id) throw new Error("No active profile");
    
    const data = JSON.parse(jsonString);
    
    // Support both older string formats and the newer array format
    const posesString = typeof data.poses === 'string' ? data.poses : JSON.stringify(data.poses || []);
    const combosString = typeof data.combos === 'string' ? data.combos : JSON.stringify(data.combos || []);
    
    localStorage.setItem(`echosign_poses_${id}`, posesString);
    localStorage.setItem(`echosign_combos_${id}`, combosString);
  }
}

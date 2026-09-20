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
}

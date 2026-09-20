import type { Landmark } from '@mediapipe/tasks-vision';
import { ProfileEngine } from './ProfileEngine';

export interface KnownPose {
  id: string;
  featureVector: number[];
}

export interface SavedCombo {
  label: string;
  sequence: string[]; // array of pose IDs
  webhookUrl?: string; // Optional webhook to trigger
}

export class CustomGestureEngine {
  private static getPosesKey(): string {
    const profileId = ProfileEngine.getActiveProfileId();
    return profileId ? `echosign_poses_${profileId}` : 'echosign_known_poses';
  }

  private static getCombosKey(): string {
    const profileId = ProfileEngine.getActiveProfileId();
    return profileId ? `echosign_combos_${profileId}` : 'echosign_custom_combos';
  }
  
  // Load alphabet of poses
  static getKnownPoses(): KnownPose[] {
    try {
      const data = localStorage.getItem(this.getPosesKey());
      if (data) return JSON.parse(data) as KnownPose[];
    } catch (e) {
      console.error("Error reading poses", e);
    }
    return [];
  }

  // Load saved combos
  static getSavedCombos(): SavedCombo[] {
    try {
      const data = localStorage.getItem(this.getCombosKey());
      if (data) return JSON.parse(data) as SavedCombo[];
    } catch (e) {
      console.error("Error reading combos", e);
    }
    return [];
  }

  static deleteCombo(label: string) {
    const combos = this.getSavedCombos().filter(c => c.label !== label);
    localStorage.setItem(this.getCombosKey(), JSON.stringify(combos));
  }

  // Checks if a sequence of vectors already matches an existing combo.
  // Returns the label of the colliding combo, or null if it's safe.
  static checkCollision(rawVectors: number[][], currentLabel: string): string | null {
    const poses = this.getKnownPoses();
    const sequence: string[] = [];

    for (const vector of rawVectors) {
      let matchedId = null;
      let minDistance = Infinity;

      for (const pose of poses) {
        const distance = this.calculateDistance(vector, pose.featureVector);
        if (distance < minDistance) {
          minDistance = distance;
          matchedId = pose.id;
        }
      }
      
      // If we don't have a tight match, it's a new pose, so it can't possibly collide with an existing combo yet.
      if (matchedId && minDistance < 0.8) {
        sequence.push(matchedId);
      } else {
        return null; // A brand new pose means this sequence is unique.
      }
    }

    const combos = this.getSavedCombos();
    const match = combos.find(c => c.label !== currentLabel && JSON.stringify(c.sequence) === JSON.stringify(sequence));
    return match ? match.label : null;
  }

  // Save a new combo, automatically quantizing vectors into KnownPoses
  static saveCombo(label: string, rawVectors: number[][], webhookUrl?: string) {
    const combos = this.getSavedCombos();
    const existingIndex = combos.findIndex(c => c.label === label);
    
    // Hard Cap of 50 Combos to prevent LocalStorage Quota Exceeded crashes
    if (existingIndex < 0 && combos.length >= 50) {
      throw new Error("Profile full! (50/50). Please delete some old combos to add more.");
    }
    
    if (webhookUrl && webhookUrl.trim() !== '') {
      const url = webhookUrl.trim();
      // Basic URL validation to prevent malformed fetches. (Allows localhost/IPs).
      if (!/^https?:\/\/.+/.test(url) && !url.includes('.')) {
        throw new Error("Invalid Webhook URL format.");
      }
    }

    const poses = this.getKnownPoses();
    const sequence: string[] = [];

    for (const vector of rawVectors) {
      // Find if this vector already matches an existing pose in our alphabet
      let matchedId = null;
      let minDistance = Infinity;

      for (const pose of poses) {
        const distance = this.calculateDistance(vector, pose.featureVector);
        if (distance < minDistance) {
          minDistance = distance;
          matchedId = pose.id;
        }
      }

      // If it's a tight match (< 0.8), reuse the existing pose ID
      if (matchedId && minDistance < 0.8) {
        sequence.push(matchedId);
      } else {
        // Otherwise, it's a brand new pose! Add it to the alphabet.
        const newId = `pose_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        poses.push({ id: newId, featureVector: vector });
        sequence.push(newId);
      }
    }

    // Save updated alphabet
    localStorage.setItem(this.getPosesKey(), JSON.stringify(poses));

    // Save the combo
    
    const newCombo: SavedCombo = { label, sequence };
    if (webhookUrl && webhookUrl.trim() !== '') {
      newCombo.webhookUrl = webhookUrl.trim();
    }
    
    if (existingIndex >= 0) {
      combos[existingIndex] = newCombo;
    } else {
      combos.push(newCombo);
    }
    localStorage.setItem(this.getCombosKey(), JSON.stringify(combos));
  }

  static normalizeLandmarks(landmarks: Landmark[]): number[] {
    if (!landmarks || landmarks.length !== 21) return [];
    const wrist = landmarks[0];
    const translated = landmarks.map(lm => ({
      x: lm.x - wrist.x,
      y: lm.y - wrist.y,
      z: lm.z - wrist.z
    }));

    let maxVal = 0;
    for (const lm of translated) {
      maxVal = Math.max(maxVal, Math.abs(lm.x), Math.abs(lm.y), Math.abs(lm.z));
    }

    const featureVector: number[] = [];
    const scale = maxVal > 0 ? maxVal : 1; 

    for (const lm of translated) {
      featureVector.push(lm.x / scale, lm.y / scale, lm.z / scale);
    }
    return featureVector;
  }

  static calculateDistance(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Matches the current hand to a KnownPose ID. Returns 'None' if unrecognized.
   */
  static matchPose(landmarks: Landmark[]): string {
    const featureVector = this.normalizeLandmarks(landmarks);
    if (featureVector.length === 0) return 'None';

    const poses = this.getKnownPoses();
    if (poses.length === 0) return 'None';

    let bestMatch = 'None';
    let minDistance = Infinity;

    for (const pose of poses) {
      const distance = this.calculateDistance(featureVector, pose.featureVector);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = pose.id;
      }
    }

    // Stricter threshold of 0.8 ensures we don't accidentally match transitional messy shapes
    if (minDistance < 0.8) {
      return bestMatch;
    }

    return 'None';
  }
}

import type { Landmark } from '@mediapipe/tasks-vision';

export interface KnownPose {
  id: string;
  featureVector: number[];
}

export interface SavedCombo {
  label: string;
  sequence: string[]; // array of pose IDs
}

export class CustomGestureEngine {
  private static POSES_KEY = 'echosign_known_poses';
  private static COMBOS_KEY = 'echosign_custom_combos';
  
  // Load alphabet of poses
  static getKnownPoses(): KnownPose[] {
    try {
      const data = localStorage.getItem(this.POSES_KEY);
      if (data) return JSON.parse(data) as KnownPose[];
    } catch (e) {
      console.error("Error reading poses", e);
    }
    return [];
  }

  // Load saved combos
  static getSavedCombos(): SavedCombo[] {
    try {
      const data = localStorage.getItem(this.COMBOS_KEY);
      if (data) return JSON.parse(data) as SavedCombo[];
    } catch (e) {
      console.error("Error reading combos", e);
    }
    return [];
  }

  static deleteCombo(label: string) {
    const combos = this.getSavedCombos().filter(c => c.label !== label);
    localStorage.setItem(this.COMBOS_KEY, JSON.stringify(combos));
  }

  // Save a new combo, automatically quantizing vectors into KnownPoses
  static saveCombo(label: string, rawVectors: number[][]) {
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
    localStorage.setItem(this.POSES_KEY, JSON.stringify(poses));

    // Save the combo
    const combos = this.getSavedCombos();
    const existingIndex = combos.findIndex(c => c.label === label);
    if (existingIndex >= 0) {
      combos[existingIndex].sequence = sequence;
    } else {
      combos.push({ label, sequence });
    }
    localStorage.setItem(this.COMBOS_KEY, JSON.stringify(combos));
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

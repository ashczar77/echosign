import type { Landmark } from '@mediapipe/tasks-vision';

export interface SavedGesture {
  label: string;
  featureVector: number[];
}

export class CustomGestureEngine {
  // Storage key for custom gestures
  private static STORAGE_KEY = 'echosign_custom_gestures';
  
  // Load gestures from localStorage
  static getSavedGestures(): SavedGesture[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as SavedGesture[];
      }
    } catch (e) {
      console.error("Error reading from localStorage", e);
    }
    return [];
  }

  // Save a gesture to localStorage
  static saveGesture(label: string, featureVector: number[]) {
    const gestures = this.getSavedGestures();
    
    // Check if label already exists and overwrite, otherwise append
    const existingIndex = gestures.findIndex(g => g.label === label);
    if (existingIndex >= 0) {
      gestures[existingIndex].featureVector = featureVector;
    } else {
      gestures.push({ label, featureVector });
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gestures));
  }

  /**
   * Normalizes the 3D hand landmarks into a scale/translation invariant 1D array of 63 features.
   */
  static normalizeLandmarks(landmarks: Landmark[]): number[] {
    if (!landmarks || landmarks.length !== 21) return [];

    // 1. Translation: Make the wrist (landmark 0) the origin (0, 0, 0)
    const wrist = landmarks[0];
    const translated = landmarks.map(lm => ({
      x: lm.x - wrist.x,
      y: lm.y - wrist.y,
      z: lm.z - wrist.z
    }));

    // 2. Scaling: Find the maximum absolute value across all coordinates
    let maxVal = 0;
    for (const lm of translated) {
      maxVal = Math.max(maxVal, Math.abs(lm.x), Math.abs(lm.y), Math.abs(lm.z));
    }

    // 3. Normalize to [-1, 1] and flatten into a 1D array of 63 numbers
    const featureVector: number[] = [];
    // Protect against divide by zero if hand is a single point (glitch)
    const scale = maxVal > 0 ? maxVal : 1; 

    for (const lm of translated) {
      featureVector.push(lm.x / scale, lm.y / scale, lm.z / scale);
    }

    return featureVector;
  }

  /**
   * Calculates the Euclidean distance between two feature vectors.
   */
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
   * Compares the current landmarks against all saved gestures and returns the closest match.
   */
  static matchGesture(landmarks: Landmark[]): string {
    const featureVector = this.normalizeLandmarks(landmarks);
    if (featureVector.length === 0) return 'None';

    const gestures = this.getSavedGestures();
    if (gestures.length === 0) return 'None';

    let bestMatch = 'None';
    let minDistance = Infinity;

    for (const gesture of gestures) {
      const distance = this.calculateDistance(featureVector, gesture.featureVector);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = gesture.label;
      }
    }

    // Threshold: If the closest match is still too far away, reject it.
    // A threshold of 1.5 is a reasonable starting point for normalized coordinates.
    // This may need tuning based on testing.
    if (minDistance < 1.5) {
      return bestMatch;
    }

    return 'None';
  }
}

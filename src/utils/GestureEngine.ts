export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type GestureState = 'OPEN_PALM' | 'FIST' | 'PINCH' | 'NONE';

export class GestureEngine {
  /**
   * Calculates the 3D Euclidean distance between two landmarks.
   */
  public static calculateDistance(lm1: Landmark, lm2: Landmark): number {
    return Math.sqrt(
      Math.pow(lm1.x - lm2.x, 2) +
      Math.pow(lm1.y - lm2.y, 2) +
      Math.pow(lm1.z - lm2.z, 2)
    );
  }

  /**
   * Evaluates the hand landmarks to determine the current gesture.
   */
  public static detectGesture(landmarks: Landmark[]): GestureState {
    if (!landmarks || landmarks.length < 21) return 'NONE';

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // 1. PINCH DETECTION
    const pinchDist = this.calculateDistance(thumbTip, indexTip);
    if (pinchDist < 0.05) {
      return 'PINCH';
    }

    // 2. EXTENSION DISTANCES
    const indexDist = this.calculateDistance(wrist, indexTip);
    const middleDist = this.calculateDistance(wrist, middleTip);
    const ringDist = this.calculateDistance(wrist, ringTip);
    const pinkyDist = this.calculateDistance(wrist, pinkyTip);

    // 3. FIST DETECTION (Fingertips curled close to wrist)
    if (indexDist < 0.25 && middleDist < 0.25 && ringDist < 0.25 && pinkyDist < 0.25) {
      return 'FIST';
    }

    // 4. OPEN PALM DETECTION (Fingertips extended far from wrist)
    if (indexDist > 0.35 && middleDist > 0.35 && ringDist > 0.35 && pinkyDist > 0.35) {
      return 'OPEN_PALM';
    }

    return 'NONE';
  }

  /**
   * Helper to log both distances and the classified gesture.
   */
  public static debugDistances(landmarks: Landmark[]) {
    if (!landmarks || landmarks.length < 21) return;

    const gesture = this.detectGesture(landmarks);
    console.log(`[GestureEngine] Detected: ${gesture}`);
  }
}

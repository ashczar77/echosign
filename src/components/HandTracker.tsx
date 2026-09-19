import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { CustomGestureEngine } from '../utils/CustomGestureEngine';
import './HandTracker.css';

interface HandTrackerProps {
  onGesture?: (gesture: string) => void;
}

export interface HandTrackerHandle {
  teachSign: (label: string) => void;
}

const HandTracker = forwardRef<HandTrackerHandle, HandTrackerProps>(({ onGesture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Pending teach request
  const teachRequestRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    teachSign: (label: string) => {
      teachRequestRef.current = label;
      console.log(`[Teach Mode] Waiting for next frame to save as: ${label}`);
    }
  }));

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      setIsLoaded(true);
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startDetection();
          };
        }
      } catch (err) {
        console.error("Error accessing the webcam: ", err);
      }
    };

    const startDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");
      const landmarker = landmarkerRef.current;

      if (!landmarker || !video || !canvas || !canvasCtx) return;

      const drawingUtils = new DrawingUtils(canvasCtx);
      let lastVideoTime = -1;
      
      // Debounce State
      let currentGesture: string = 'None';
      let gestureFrames = 0;
      let lastEmittedGesture: string = 'None';

      const predict = () => {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const results = landmarker.detectForVideo(video, performance.now());
          
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0]; // numHands is 1
            
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
              color: "#00ffcc",
              lineWidth: 4
            });
            drawingUtils.drawLandmarks(landmarks, {
              color: "#ffffff",
              fillColor: "#00ffcc",
              lineWidth: 2,
              radius: 4
            });
            
            // 1. Process Teach Mode if requested
            if (teachRequestRef.current) {
              const label = teachRequestRef.current;
              const featureVector = CustomGestureEngine.normalizeLandmarks(landmarks);
              CustomGestureEngine.saveGesture(label, featureVector);
              console.log(`[Teach Mode] Saved custom gesture: ${label}`);
              // Flash green to indicate success
              canvasCtx.fillStyle = 'rgba(0, 255, 0, 0.5)';
              canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
              teachRequestRef.current = null;
            }
            
            // 2. Recognize raw gesture using Custom Engine
            const rawGesture = CustomGestureEngine.matchGesture(landmarks);
            
            // 3. Debounce logic
            if (rawGesture === currentGesture) {
              gestureFrames++;
              // A flat threshold for custom gestures
              const threshold = 10; 
              
              if (gestureFrames >= threshold && rawGesture !== lastEmittedGesture) {
                lastEmittedGesture = rawGesture;
                if (onGesture) {
                  onGesture(rawGesture);
                }
              }
            } else {
              currentGesture = rawGesture;
              gestureFrames = 0;
            }
          } else {
            // No hand detected
            if (lastEmittedGesture !== 'None') {
               lastEmittedGesture = 'None';
               currentGesture = 'None';
               gestureFrames = 0;
            }
          }
          canvasCtx.restore();
        }
        animationRef.current = requestAnimationFrame(predict);
      };
      
      predict();
    };

    initializeMediaPipe().then(() => {
      startCamera();
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []);

  return (
    <div className="hand-tracker-container glass-panel">
      {!isLoaded && (
        <div className="tracker-overlay">
          <h2>Initializing Custom AI Engine...</h2>
        </div>
      )}
      <video 
        ref={videoRef} 
        className="webcam-feed" 
        autoPlay 
        playsInline 
        muted 
      ></video>
      <canvas 
        ref={canvasRef} 
        className="tracking-canvas"
      ></canvas>
    </div>
  );
});

export default HandTracker;

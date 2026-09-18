import React, { useEffect, useRef, useState } from 'react';
import { GestureRecognizer, FilesetResolver, DrawingUtils, HandLandmarker } from '@mediapipe/tasks-vision';
import './HandTracker.css';

interface HandTrackerProps {
  onGesture?: (gesture: string) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGesture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/gesture_recognizer.task",
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
            // Start detection loop
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
      const recognizer = recognizerRef.current;

      if (!recognizer || !video || !canvas || !canvasCtx) return;

      const drawingUtils = new DrawingUtils(canvasCtx);
      let lastVideoTime = -1;
      
      // Debounce State
      let currentGesture: string = 'None';
      let gestureFrames = 0;
      let lastEmittedGesture: string = 'None';
      
      // Dynamic debounce thresholds based on the type of gesture
      const DEBOUNCE_THRESHOLDS: Record<string, number> = {
        'None': 2,
        'Closed_Fist': 12,
        'Open_Palm': 10,
        'Pointing_Up': 5,
        'Thumb_Down': 5,
        'Thumb_Up': 5,
        'Victory': 5,
        'ILoveYou': 5
      };

      const predict = () => {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          // Match canvas resolution to video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const results = recognizer.recognizeForVideo(video, performance.now());
          
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.landmarks && results.landmarks.length > 0) {
            for (let i = 0; i < results.landmarks.length; i++) {
              const landmarks = results.landmarks[i];
              // Note: Using HandLandmarker.HAND_CONNECTIONS to safely avoid undefined errors
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
              
              // 1. Get raw gesture from MediaPipe
              let rawGesture = 'None';
              if (results.gestures && results.gestures[i] && results.gestures[i].length > 0) {
                // MediaPipe returns an array of recognized gestures for the hand, sorted by confidence.
                // We take the top one.
                const topGesture = results.gestures[i][0];
                // Only accept if confidence is above 60%
                if (topGesture.score > 0.6) {
                  rawGesture = topGesture.categoryName;
                }
              }
              
              // 2. Debounce logic
              if (rawGesture === currentGesture) {
                gestureFrames++;
                const threshold = DEBOUNCE_THRESHOLDS[rawGesture] || 10;
                
                if (gestureFrames >= threshold && rawGesture !== lastEmittedGesture) {
                  // We have a stable new gesture!
                  lastEmittedGesture = rawGesture;
                  if (onGesture) {
                    onGesture(rawGesture);
                  }
                  console.log(`[Debounced Trigger] Fired: ${rawGesture}`);
                }
              } else {
                // Gesture changed, reset counter
                currentGesture = rawGesture;
                gestureFrames = 0;
              }
            }
          } else {
            // No hand detected, reset everything to None
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

    // Initialize in sequence
    initializeMediaPipe().then(() => {
      startCamera();
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (recognizerRef.current) recognizerRef.current.close();
    };
  }, []);

  return (
    <div className="hand-tracker-container glass-panel">
      {!isLoaded && (
        <div className="tracker-overlay">
          <h2>Initializing AI Engine...</h2>
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
};

export default HandTracker;

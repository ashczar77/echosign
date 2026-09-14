import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { GestureEngine } from '../utils/GestureEngine';
import './HandTracker.css';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/hand_landmarker.task",
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
      const landmarker = handLandmarkerRef.current;

      if (!video || !canvas || !landmarker) return;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const drawingUtils = new DrawingUtils(canvasCtx);
      let lastVideoTime = -1;

      const predict = () => {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          // Match canvas resolution to video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const results = landmarker.detectForVideo(video, performance.now());
          
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.landmarks) {
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                color: "#00ffcc",
                lineWidth: 4
              });
              drawingUtils.drawLandmarks(landmarks, {
                color: "#ffffff",
                fillColor: "#00ffcc",
                lineWidth: 2,
                radius: (data: any) => {
                  return drawingUtils.lerp(data.from?.z || 0, -0.15, 0.1, 5, 1);
                }
              });
              
              // Run our math utilities for Step 3.1
              GestureEngine.debugDistances(landmarks);
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
      if (handLandmarkerRef.current) handLandmarkerRef.current.close();
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

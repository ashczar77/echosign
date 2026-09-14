# EchoSign: Hackathon Prototype Plan

This plan outlines the architecture and execution strategy for building the **EchoSign** prototype (Sign Language Smart Home) for the Amazon Developer Hackathon.

## User Review Required

> [!IMPORTANT]
> **Project Location & Stack**
> You are currently inside the `evenplate` Flutter project. I propose we create a completely new project folder outside of `evenplate` (e.g., `../echosign`).
> 
> For the tech stack, while we could use Flutter, **Google MediaPipe's Hand Tracking** works best and fastest using standard Web Technologies (HTML/JS/React) for a weekend hackathon. 
> 
> Do you approve of initializing a new **React (Vite)** project for this, or would you prefer a different stack?

## Proposed Architecture

To build this fast and make it look incredible for a demo video, we will use a purely client-side architecture that mocks the Amazon backend.

1. **Frontend UI:** A React dashboard simulating a Fire TV or Echo Show screen. It will have a clean, dark-mode aesthetic with "Smart Home Widgets" (Lights, Music, Thermostat).
2. **Computer Vision:** `MediaPipe Tasks Vision` (via npm). It streams the laptop webcam, processes the frames locally, and extracts 21 3D hand landmarks in real-time.
3. **Gesture Engine:** A lightweight logic class that calculates the distance between specific fingertips (e.g., thumb tip to index tip) to classify 3-4 distinct states:
   - 🖐️ **Open Palm:** Turn Lights On
   - ✊ **Fist:** Turn Lights Off
   - 🤏 **Pinch (Index + Thumb):** Play/Pause Music
4. **Mocked Amazon Integration:** When a gesture is recognized, the UI updates instantly. (For a hackathon demo, this visual feedback is all you need, though we can add fake HTTP POST requests to simulate sending events to an Alexa backend).

## Execution Steps

### 1. Project Initialization
- Create a new Vite/React project (`npx create-vite@latest ../echosign --template react-ts`).
- Install dependencies (TailwindCSS for rapid styling, `@mediapipe/tasks-vision` for AI).

### 2. MediaPipe Integration
- Create a `HandTracker` component that hooks into `navigator.mediaDevices.getUserMedia`.
- Load the MediaPipe Hand Landmarker model.
- Render the raw camera feed on an HTML `<video>` element, and use an HTML `<canvas>` to draw the glowing skeleton over the user's hand (crucial for the hackathon video!).

### 3. Gesture Logic Engine
- Implement a `detectGesture(landmarks)` function.
- Measure distances between the wrist (landmark 0) and fingertips (landmarks 8, 12, 16, 20).
- Emit events (`ON_GESTURE_FIST`, `ON_GESTURE_PALM`) with a simple debounce mechanism so it doesn't flicker.

### 4. Smart Home UI Dashboard
- Build the "Echo Show" UI interface.
- Map the gesture events to state changes (e.g., turning a lightbulb icon yellow when the Palm gesture fires).

## Verification Plan

### Automated / Manual Testing
- Run the Vite dev server (`npm run dev`).
- Grant camera permissions in the browser.
- Verify the 21-point hand skeleton tracks smoothly.
- Perform the 3 core gestures and verify the UI updates correctly without false positives.
- Prepare the setup for recording the final hackathon demo video.

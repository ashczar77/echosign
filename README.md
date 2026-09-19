# EchoSign

Voice assistants revolutionized the smart home, but they left millions of non-verbal individuals behind. EchoSign is a Fire TV application that bridges this gap. By translating sign language into spoken words using a connected webcam, EchoSign empowers non-verbal users to communicate freely with their families and seamlessly interact with Alexa.

## The Vision

The living room is a shared space where families gather, yet smart home technology often assumes everyone communicates in the same way. EchoSign transforms any Fire TV equipped with a standard USB webcam into an adaptive accessibility hub. 

Our goal is simple: give everyone a voice in the living room.

## Features

* **Adaptive Voice Proxy:** EchoSign translates gestures into spoken words in real time. Because the app speaks the translations out loud through your TV speakers, it acts as a voice proxy. This allows users to trigger nearby Echo devices naturally (for example, signing a gesture that speaks "Alexa, turn on the lights") without needing complex cloud integrations.
* **Combo-Based Macro System:** Instead of forcing users to invent and memorize 50 unique hand poses for 50 different sentences, EchoSign uses a Combo System. Users can reuse a small handful of comfortable signs and string them together into sequences (e.g., ✌️ + 👍 = "Alexa, play jazz", but ✌️ + ✊ = "Alexa, turn off the TV").
* **Vector Quantization AI:** EchoSign doesn't require pre-programmed alphabets. When you record a combo, the local AI extracts the 3D feature vectors of your hand. If it recognizes a shape you've used in a previous combo, it perfectly reuses it to save memory and increase tracking stability.
* **Cinematic 10-foot UI:** Designed specifically for the Fire TV ecosystem, the interface is built to be viewed from across the room, featuring high-contrast live subtitles, combo-tracking indicators, and D-Pad remote navigation.
* **100% Private and Serverless:** All 3D hand tracking and gesture matching runs locally on the TV processor. Custom gesture profiles are saved directly to the device, ensuring total privacy and zero cloud latency.

## How It Works

1. **Build a Combo:** Open the Settings menu and type a full sentence you want to speak. Click "Record Gesture", perform your first sign, and take a breath. Click "Record Gesture" again to perform your second sign. Save the combo.
2. **Perform:** In front of the live camera, simply perform your custom sequence of gestures. The app silently buffers your combo.
3. **Hands-Free Translation:** Drop your hand. After 2 seconds of inactivity, the app evaluates your buffered sequence, instantly speaks the matching sentence out loud, and clears the screen!

## Getting Started

EchoSign is built as a lightweight HTML5 Web Application optimized for the Amazon Web App Runtime.

To run the app locally for development:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. For testing the Fire TV remote experience, you can use your keyboard arrow keys and the Enter key to navigate the settings menu.

## Built With

* React & TypeScript
* MediaPipe Hand Landmarker
* Browser SpeechSynthesis API
* Vite

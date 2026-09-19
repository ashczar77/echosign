# EchoSign

Voice assistants revolutionized the smart home, but they left millions of non-verbal individuals behind. EchoSign is a Fire TV application that bridges this gap. By translating sign language into spoken words using a connected webcam, EchoSign empowers non-verbal users to communicate freely with their families and seamlessly interact with Alexa.

## The Vision

The living room is a shared space where families gather, yet smart home technology often assumes everyone communicates in the same way. EchoSign transforms any Fire TV equipped with a standard USB webcam into an adaptive accessibility hub. 

Our goal is simple: give everyone a voice in the living room.

## Features

* **Adaptive Voice Proxy:** EchoSign translates gestures into spoken words in real time. Because the app speaks the translations out loud through your TV speakers, it acts as a voice proxy. This allows users to trigger nearby Echo devices naturally (for example, signing a gesture that speaks "Alexa, turn on the lights") without needing complex cloud integrations.
* **Custom Sign Training:** We understand that accessibility is highly personal. Instead of forcing users to learn a rigid dictionary of signs, EchoSign features a Zero-Shot Learning engine. Users can literally teach the app their own comfortable shortcuts or regional signs in seconds.
* **Cinematic 10-foot UI:** Designed specifically for the Fire TV ecosystem, the interface is built to be viewed from across the room, featuring high-contrast live subtitles and D-Pad remote navigation.
* **100% Private and Serverless:** All 3D hand tracking and gesture matching runs locally on the TV processor. Custom gesture profiles are saved directly to the device, ensuring total privacy and zero cloud latency.

## How It Works

1. **Teach a Sign:** Open the Settings menu, type a phrase, and hold up your hand to the camera. EchoSign maps your unique 3D hand skeleton to the phrase.
2. **Sign:** Make the gesture in front of your Fire TV webcam.
3. **Speak:** The app instantly recognizes your custom gesture, flashes the text on the screen, and speaks it aloud.

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

# EchoSign

Voice assistants revolutionized the smart home, but they left millions of non-verbal individuals behind. EchoSign is a Fire TV application that bridges this gap. By translating sign language into spoken words using a connected webcam, EchoSign empowers non-verbal users to communicate freely with their families and seamlessly interact with Alexa.

## The Vision

The living room is a shared space where families gather, yet smart home technology often assumes everyone communicates in the same way. EchoSign transforms any Fire TV equipped with a standard USB webcam into an adaptive accessibility hub. 

Our goal is simple: give everyone a voice in the living room.

## Features

* **Adaptive Voice Proxy:** EchoSign translates gestures into spoken words in real time. Because the app speaks the translations out loud through your TV speakers, it acts as a voice proxy. This allows users to trigger nearby Echo devices naturally (for example, signing a gesture that speaks "Alexa, turn on the lights") without needing complex cloud integrations.
* **Universal Smart Home Webhooks:** For smart home devices in other rooms (or for a completely silent experience), EchoSign acts as a universal remote. Users can attach a Webhook URL to any gesture combo. When the combo is performed, the app silently fires an HTTP request across the internet to trigger actions via IFTTT, Voice Monkey, or Home Assistant.
* **Combo-Based Macro System:** Instead of forcing users to invent and memorize 50 unique hand poses for 50 different sentences, EchoSign uses a Combo System. Users can reuse a small handful of comfortable signs and string them together into sequences (e.g., ✌️ + 👍 = "Alexa, play jazz", but ✌️ + ✊ = "Alexa, turn off the TV").
* **Vector Quantization AI:** EchoSign doesn't require pre-programmed alphabets. When you record a combo, the local AI extracts the 3D feature vectors of your hand. If it recognizes a shape you've used in a previous combo, it perfectly reuses it to save memory and increase tracking stability.
* **Multi-User Profiles & Portability:** EchoSign supports multiple family members with a Netflix-style profile selector. Users can export their entire gesture dictionary as a JSON backup and import it onto a new TV, ensuring their accessibility data is fully portable.
* **100% Private and Serverless:** All 3D hand tracking and gesture matching runs locally on the TV processor. Custom gesture profiles are saved directly to the device, ensuring total privacy and zero cloud latency.

## How It Works

1. **Build a Combo:** Open the Settings menu and type a full sentence you want to speak. You can optionally paste a Webhook URL.
2. **Record:** Click "Record", perform your first sign, and look at the visual thumbnail to ensure it was captured correctly. Take a breath, and record your next step. Save the combo.
3. **Perform:** In front of the live camera, simply perform your custom sequence of gestures. The app silently buffers your combo.
4. **Action:** Drop your hand. After a brief pause, the app evaluates your buffered sequence, instantly speaks the matching sentence out loud, triggers your Webhook (if provided), and clears the screen!

## The Webhook Architecture (Smart Home Integration)

While EchoSign's acoustic proxy is great for devices in the living room, the **Webhook Integration** makes it a universal remote for the entire house.

EchoSign deliberately avoids hardcoded OAuth integrations to remain universally compatible, secure, and privacy-focused. Instead, it utilizes an elegant "Virtual Button" architecture:

1. **The Setup:** The user logs into a free automation service like **[Voice Monkey](https://voicemonkey.io/)** or **[IFTTT](https://ifttt.com/)** and creates a "Virtual Button". The service provides a simple Webhook URL.
2. **The App:** The user pastes this URL into EchoSign when creating a gesture combo. 
3. **The Execution:** When the user performs the sign language combo, EchoSign silently fires an HTTP POST request to that URL. It acts as an invisible finger pressing the button over the internet.
4. **The Action:** The user opens their standard Alexa app or Google Home app and creates a routine: *If Virtual Button is pressed -> Turn on the bedroom lights.*

**Why this matters:** EchoSign never handles your Amazon passwords, requires zero OAuth maintenance, and doesn't need to know what smart devices you own. It acts as a modular, secure trigger for *any* smart home ecosystem.

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

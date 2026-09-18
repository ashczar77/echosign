/**
 * VoiceEngine: A wrapper around the browser's native SpeechSynthesis API.
 * 
 * For the hackathon, this acts as our local simulation of Amazon Polly. 
 * Because this runs locally in the browser, it requires zero latency, 
 * zero cost, and zero AWS credentials in the client code!
 */
export class VoiceEngine {
  private static synth = window.speechSynthesis;
  private static voices: SpeechSynthesisVoice[] = [];

  // Initialize voices (can be async on some browsers)
  static init() {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  static speak(text: string) {
    if (!this.synth) return;

    // Cancel any currently speaking text to keep it snappy
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a premium-sounding voice (like Google UK Female or Siri)
    // If not found, it defaults to the system default voice.
    const preferredVoice = this.voices.find(v => 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Samantha') || // macOS premium voice
      v.name.includes('Siri')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher pitch for clarity
    
    this.synth.speak(utterance);
  }
}

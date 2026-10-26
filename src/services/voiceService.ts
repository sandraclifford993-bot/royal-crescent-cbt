/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class VoiceService {
  private isMuted: boolean = false;
  private lastSpokenKey: string = '';
  private audioCtx: AudioContext | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('rc_cbt_voice_muted');
      this.isMuted = storedMute === 'true';

      if ('speechSynthesis' in window) {
        this.initVoice();
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoice();
        };
      }
    }
  }

  private initVoice() {
    try {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high quality English voices (offline if marked, or en-GB, en-US, en-NG)
      const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
      const offlineVoice = englishVoices.find((v) => (v as unknown as { localService?: boolean }).localService === true);
      const enGbVoice = englishVoices.find((v) => v.lang.includes('GB') || v.name.includes('British') || v.name.includes('English'));
      const anyEnglish = englishVoices[0];

      this.selectedVoice = offlineVoice || enGbVoice || anyEnglish || voices[0] || null;
    } catch {
      // Graceful fallback
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_cbt_voice_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.cancelSpeech();
    } else {
      // Play brief test beep when unmuting
      this.playChime('correct');
    }
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_cbt_voice_muted', String(muted));
    }
    if (muted) {
      this.cancelSpeech();
    }
  }

  public cancelSpeech() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Synthesize pleasant musical audio chimes using Web Audio API oscillators.
   * Works 100% offline with zero external audio assets required.
   */
  public playChime(type: 'welcome' | 'correct' | 'wrong' | 'click' | 'submit') {
    if (this.isMuted) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'correct') {
        // Joyful ascending arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.36);
        });
      } else if (type === 'wrong') {
        // Gentle descending soft tone
        const notes = [329.63, 293.66]; // E4 -> D4
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.32);
        });
      } else if (type === 'welcome') {
        // Royal Cresent fanfare
        const chords = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.52);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'submit') {
        // Grand finish chime
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0, now + idx * 0.09);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.46);
        });
      }
    } catch {
      // AudioContext failure recovery
    }
  }

  /**
   * Speak a text string using Web Speech API with fallback to audio chime.
   */
  public speakText(text: string, force: boolean = false) {
    if (this.isMuted && !force) return;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.cancelSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // clear and measured for students
        utterance.pitch = 1.05;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Safe fallback - app does not crash
    }
  }

  /**
   * Required: Welcome message
   * "Welcome to Royal Cresent CBT Centre!"
   */
  public speakWelcome() {
    this.playChime('welcome');
    this.speakText('Welcome to Royal Cresent CBT Centre!');
  }

  /**
   * Required: Practice Mode Correct answer feedback
   * "Correct! Well done. Keep it up!"
   */
  public speakCorrectFeedback(questionId: string, option: string) {
    const key = `${questionId}-${option}-correct`;
    if (this.lastSpokenKey === key) return;
    this.lastSpokenKey = key;

    this.playChime('correct');
    this.speakText('Correct! Well done. Keep it up!');
  }

  /**
   * Required: Practice Mode Wrong answer feedback
   * "Sorry, that is incorrect. Try your best on the next question."
   */
  public speakWrongFeedback(questionId: string, option: string) {
    const key = `${questionId}-${option}-wrong`;
    if (this.lastSpokenKey === key) return;
    this.lastSpokenKey = key;

    this.playChime('wrong');
    this.speakText('Sorry, that is incorrect. Try your best on the next question.');
  }

  /**
   * Clear the last spoken key when moving between questions
   */
  public resetSpokenKey() {
    this.lastSpokenKey = '';
  }
}

export const voiceService = new VoiceService();

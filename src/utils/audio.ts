/**
 * Vibrant Indian Festive Audio Engine for "THE LIGHT WITHIN – A Diwali Experience"
 * Features 4 Vibrant Indian Festive Tunes:
 *   1. "Royal Keherwa Celebration" (Shehnai, Dhol & Tabla in Raag Bilawal - 118 BPM)
 *   2. "Dandiya Garba Beats" (Sitar, Manjira & Upbeat Garba in Raag Desh - 128 BPM)
 *   3. "Lakshmi Puja Harmonium" (Serene Temple Flute & Chimes in Raag Yaman - 98 BPM)
 *   4. "Explosive Dhol Parade" (Punjabi Dhol, Ghungroo & Fanfare in Raag Bhairavi - 134 BPM)
 * - Session storage persistence for mute/unmute and tune selection
 * - Smooth crossfades with zero sudden volume jumps
 * 100% Procedural Web Audio API — Zero external MP3/CORS dependencies!
 */

export type AudioScene = 'opening' | 'lighting' | 'reveal' | 'main';
export type FestiveTuneId = 'tune-keherwa' | 'tune-garba' | 'tune-yaman' | 'tune-bhangra';

export interface FestiveTuneConfig {
  id: FestiveTuneId;
  name: string;
  hindiName: string;
  icon: string;
  description: string;
  bpm: number;
}

export const FESTIVE_TUNES: FestiveTuneConfig[] = [
  {
    id: 'tune-keherwa',
    name: 'Royal Keherwa Celebration',
    hindiName: 'राजसी कहरवा उत्सव',
    icon: '🎺',
    description: 'Joyful Dhol, Tabla & Shehnai in Raag Bilawal (118 BPM)',
    bpm: 118,
  },
  {
    id: 'tune-garba',
    name: 'Dandiya Garba Beats',
    hindiName: 'डांडिया गरबा ताल',
    icon: '🪘',
    description: 'Upbeat Garba rhythms with Sitar & Manjira (128 BPM)',
    bpm: 128,
  },
  {
    id: 'tune-yaman',
    name: 'Lakshmi Puja Harmonium',
    hindiName: 'लक्ष्मी पूजा बाँसुरी',
    icon: '🪈',
    description: 'Serene Temple Flute & Harmonium in Raag Yaman (98 BPM)',
    bpm: 98,
  },
  {
    id: 'tune-bhangra',
    name: 'Explosive Dhol Parade',
    hindiName: 'धमाकेदार ढोल गर्जना',
    icon: '🎆',
    description: 'High-octane Punjabi Dhol & Shehnai fanfare (134 BPM)',
    bpm: 134,
  },
];

type AudioStateListener = (isMuted: boolean, scene: AudioScene, tuneId: FestiveTuneId) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public currentScene: AudioScene = 'opening';
  public currentTuneId: FestiveTuneId = 'tune-keherwa';
  public isEngineRunning: boolean = false;

  public get isBgMusicPlaying(): boolean {
    return this.isEngineRunning && !this.isMuted;
  }

  // Master Gain Busses
  private masterMusicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private percussionGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private droneGain: GainNode | null = null;

  // Rhythm & Melody Timers
  private rhythmTimer: number | null = null;
  private melodyTimer: number | null = null;
  private stepCount: number = 0;
  private melodyStep: number = 0;

  // Continuous drone oscillators
  private droneOscs: OscillatorNode[] = [];

  private listeners: Set<AudioStateListener> = new Set();

  constructor() {
    // Restore user mute preference & tune selection from current session
    try {
      const savedMuted = sessionStorage.getItem('diwali_festive_audio_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }

      const savedTune = sessionStorage.getItem('diwali_festive_tune_id') as FestiveTuneId;
      if (savedTune && FESTIVE_TUNES.some((t) => t.id === savedTune)) {
        this.currentTuneId = savedTune;
      }
    } catch {
      this.isMuted = false;
      this.currentTuneId = 'tune-keherwa';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();

        // 1. Master Music Bus
        this.masterMusicGain = this.ctx.createGain();
        this.masterMusicGain.gain.setValueAtTime(this.isMuted ? 0 : 0.38, this.ctx.currentTime);
        this.masterMusicGain.connect(this.ctx.destination);

        // 2. Sub-busses
        this.percussionGain = this.ctx.createGain();
        this.percussionGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.percussionGain.connect(this.masterMusicGain);

        this.melodyGain = this.ctx.createGain();
        this.melodyGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
        this.melodyGain.connect(this.masterMusicGain);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.droneGain.connect(this.masterMusicGain);

        // 3. SFX Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.55, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: AudioStateListener) {
    this.listeners.add(listener);
    listener(this.isMuted, this.currentScene, this.currentTuneId);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isMuted, this.currentScene, this.currentTuneId));
  }

  public setMute(muted: boolean): boolean {
    this.initCtx();
    this.isMuted = muted;

    try {
      sessionStorage.setItem('diwali_festive_audio_muted', muted ? 'true' : 'false');
    } catch {
      // safe
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.masterMusicGain) {
        this.masterMusicGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.38, now, 0.08);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.55, now, 0.05);
      }
    }

    if (!this.isMuted && !this.isEngineRunning) {
      this.startFestiveMusic();
    }

    this.notify();
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMute(!this.isMuted);
  }

  /**
   * Select a new Festive Tune and restart audio loops dynamically
   */
  public setTune(tuneId: FestiveTuneId) {
    if (this.currentTuneId === tuneId && this.isEngineRunning) return;
    this.currentTuneId = tuneId;

    try {
      sessionStorage.setItem('diwali_festive_tune_id', tuneId);
    } catch {
      // safe
    }

    if (this.isEngineRunning) {
      this.restartMusicLoops();
    }

    this.notify();
  }

  /**
   * Set active scene with smooth musical transitions
   */
  public setScene(scene: AudioScene) {
    this.currentScene = scene;
    this.initCtx();

    if (!this.isEngineRunning) {
      this.startFestiveMusic();
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.percussionGain && this.melodyGain && this.droneGain) {
      switch (scene) {
        case 'opening':
          this.percussionGain.gain.setTargetAtTime(0.2, now, 0.4);
          this.melodyGain.gain.setTargetAtTime(0.28, now, 0.4);
          this.droneGain.gain.setTargetAtTime(0.25, now, 0.4);
          break;
        case 'lighting':
          this.percussionGain.gain.setTargetAtTime(0.35, now, 0.2);
          this.melodyGain.gain.setTargetAtTime(0.45, now, 0.2);
          this.droneGain.gain.setTargetAtTime(0.3, now, 0.2);
          break;
        case 'reveal':
        case 'main':
          this.percussionGain.gain.setTargetAtTime(0.55, now, 0.3);
          this.melodyGain.gain.setTargetAtTime(0.5, now, 0.3);
          this.droneGain.gain.setTargetAtTime(0.2, now, 0.3);
          break;
      }
    }

    this.notify();
  }

  public startFestiveMusic() {
    this.initCtx();
    if (!this.ctx || !this.masterMusicGain) return;
    if (this.isEngineRunning) return;

    this.isEngineRunning = true;
    this.initTanpuraAndBrassBed();
    this.startPercussionLoop();
    this.startMelodyLoop();
    this.notify();
  }

  private restartMusicLoops() {
    if (this.rhythmTimer) window.clearInterval(this.rhythmTimer);
    if (this.melodyTimer) window.clearInterval(this.melodyTimer);
    this.startPercussionLoop();
    this.startMelodyLoop();
  }

  private initTanpuraAndBrassBed() {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;

    const freqs = [146.83, 220.0, 293.66, 369.99];
    this.droneOscs = [];

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.droneGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + i * 90, now);

      gain.gain.setValueAtTime(0.06 / (i + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain);

      osc.start(now);
      this.droneOscs.push(osc);
    });
  }

  /**
   * Multi-Tune Percussion Engine (Dynamic BPM & Patterns)
   */
  private startPercussionLoop() {
    if (this.rhythmTimer) window.clearInterval(this.rhythmTimer);

    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    const bpm = activeTune.bpm;
    const stepInterval = (60 / bpm) / 2 * 1000;

    this.stepCount = 0;
    this.rhythmTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.percussionGain) return;

      const step = this.stepCount % 8;
      const isFullFestive = this.currentScene === 'main' || this.currentScene === 'reveal';

      switch (this.currentTuneId) {
        case 'tune-garba': {
          // Garba 6/8 Fast Rhythm
          if (step === 0 || step === 3) this.triggerManjira(0.4);
          if (step === 1 || step === 4) this.triggerGhungroo(0.22);
          if (isFullFestive) {
            if (step === 0) this.triggerDholBass(0.7);
            if (step === 2 || step === 5) this.triggerDholSlap(0.45);
            if (step === 1 || step === 3) this.triggerTablaBayan(0.35);
          }
          break;
        }
        case 'tune-yaman': {
          // Yaman Gentle Temple Groove
          if (step === 0 || step === 4) this.triggerManjira(0.3);
          if (isFullFestive) {
            if (step === 0) this.triggerDholBass(0.45);
            if (step === 2 || step === 6) this.triggerTablaDayan(0.28);
          }
          break;
        }
        case 'tune-bhangra': {
          // Bhangra 12/8 High-Octane Dhol Bounce
          if (step % 2 === 0) this.triggerManjira(0.38);
          this.triggerGhungroo(0.18);
          if (isFullFestive) {
            if (step === 0 || step === 4) this.triggerDholBass(0.8);
            if (step === 2 || step === 6) this.triggerDholSlap(0.5);
            if (step % 2 === 1) this.triggerTablaBayan(0.4);
          }
          break;
        }
        case 'tune-keherwa':
        default: {
          // Classic Keherwa
          if (step === 0 || step === 2 || step === 4 || step === 6) this.triggerManjira(step === 0 ? 0.35 : 0.22);
          if (isFullFestive && (step === 1 || step === 3 || step === 5 || step === 7)) this.triggerGhungroo(0.18);
          if (isFullFestive) {
            if (step === 0) this.triggerDholBass(0.7);
            else if (step === 4) this.triggerDholBass(0.55);
            else if (step === 2 || step === 6) this.triggerDholSlap(0.4);
            if (step === 1 || step === 5) this.triggerTablaBayan(0.35);
            if (step === 3 || step === 7) this.triggerTablaDayan(0.28);
          }
          break;
        }
      }

      this.stepCount++;
    }, stepInterval);
  }

  /**
   * Multi-Tune Melodic Engine (Dynamic Raag Scales & Instrument Synthesizers)
   */
  private startMelodyLoop() {
    if (this.melodyTimer) window.clearInterval(this.melodyTimer);

    // 1. Tune Scales
    const scales: Record<FestiveTuneId, number[]> = {
      'tune-keherwa': [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 493.88, 440.0, 369.99, 440.0, 587.33, 659.25], // Raag Bilawal
      'tune-garba': [293.66, 369.99, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0, 369.99, 329.63, 293.66, 440.0], // Raag Desh
      'tune-yaman': [329.63, 415.3, 440.0, 493.88, 554.37, 622.25, 659.25, 493.88, 415.3, 329.63], // Raag Yaman
      'tune-bhangra': [293.66, 349.23, 392.0, 415.3, 466.16, 523.25, 587.33, 622.25, 587.33, 523.25, 466.16, 415.3], // Raag Bhairavi
    };

    const currentScale = scales[this.currentTuneId] || scales['tune-keherwa'];
    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    const melodyInterval = Math.round((60 / activeTune.bpm) * 1000);

    this.melodyStep = 0;
    this.melodyTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.melodyGain) return;

      const isMain = this.currentScene === 'main' || this.currentScene === 'reveal';
      const noteFreq = currentScale[this.melodyStep % currentScale.length];

      switch (this.currentTuneId) {
        case 'tune-garba': {
          if (isMain) {
            this.playSitarNote(noteFreq, 0.35);
            if (this.melodyStep % 2 === 0) this.playBansuriNote(noteFreq * 1.5, 0.2);
          } else {
            if (this.melodyStep % 3 === 0) this.playSitarNote(noteFreq, 0.25);
          }
          break;
        }
        case 'tune-yaman': {
          if (isMain) {
            this.playBansuriNote(noteFreq, 0.32);
            if (this.melodyStep % 2 === 0) this.playBansuriNote(noteFreq * 0.75, 0.2);
          } else {
            if (this.melodyStep % 3 === 0) this.playBansuriNote(noteFreq, 0.22);
          }
          break;
        }
        case 'tune-bhangra': {
          if (isMain) {
            this.playShehnaiNote(noteFreq, 0.36);
            if (this.melodyStep % 2 === 0) this.playSitarNote(noteFreq * 1.25, 0.28);
          } else {
            if (this.melodyStep % 3 === 0) this.playShehnaiNote(noteFreq, 0.24);
          }
          break;
        }
        case 'tune-keherwa':
        default: {
          if (isMain) {
            this.playShehnaiNote(noteFreq, 0.32);
            if (this.melodyStep % 2 === 0) this.playBansuriNote(noteFreq * 1.5, 0.22);
          } else {
            if (this.melodyStep % 3 === 0) this.playBansuriNote(noteFreq, 0.25);
          }
          break;
        }
      }

      this.melodyStep++;
    }, melodyInterval);
  }

  /**
   * Sitar Synthesizer:
   * Bright metallic string pluck with pitch glide
   */
  private playSitarNote(freq: number, vol: number) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 1.04, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(vol * 0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Dhol Bass Drum
   */
  private triggerDholBass(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Dhol Tilli / Slap
   */
  private triggerDholSlap(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    noise.start(now);
  }

  /**
   * Tabla Bayan
   */
  private triggerTablaBayan(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Tabla Dayan
   */
  private triggerTablaDayan(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(330, now);
    filter.Q.setValueAtTime(6.0, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Manjira
   */
  private triggerManjira(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    [2850, 4200].forEach((f) => {
      if (!this.ctx || !this.percussionGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.percussionGain);

      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  /**
   * Ghungroo
   */
  private triggerGhungroo(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    noise.start(now);
  }

  /**
   * Shehnai Synthesizer
   */
  private playShehnaiNote(freq: number, vol: number) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(freq * 0.98, now);
    osc1.frequency.linearRampToValueAtTime(freq, now + 0.08);
    osc2.frequency.setValueAtTime(freq * 1.006, now);

    const vibrato = this.ctx.createOscillator();
    const vibGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(6.0, now);
    vibGain.gain.setValueAtTime(freq * 0.015, now);
    vibrato.connect(vibGain);
    vibGain.connect(osc1.frequency);
    vibGain.connect(osc2.frequency);
    vibrato.start(now);
    vibrato.stop(now + 0.42);

    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(freq * 1.6, now);
    formant.Q.setValueAtTime(3.8, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc1.connect(formant);
    osc2.connect(formant);
    formant.connect(gain);
    gain.connect(this.melodyGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  /**
   * Bansuri Flute
   */
  private playBansuriNote(freq: number, vol: number) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const vib = this.ctx.createOscillator();
    const vibG = this.ctx.createGain();
    vib.frequency.setValueAtTime(5.2, now);
    vibG.gain.setValueAtTime(freq * 0.01, now);
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    vib.start(now);
    vib.stop(now + 0.6);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // ==========================================
  // SCENE-SPECIFIC MUSICAL MOMENTS & SOUND FX
  // ==========================================

  public playLightingFlourish() {
    this.setScene('lighting');
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const bellNotes = [587.33, 739.99, 880.0, 1174.66];
    bellNotes.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.1);

      gain.gain.setValueAtTime(0.01, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.24, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 1.2);
    });

    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(220, now);
    sweep.frequency.exponentialRampToValueAtTime(880, now + 0.7);

    const sweepFilter = this.ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(300, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.7);

    sweepGain.gain.setValueAtTime(0.01, now);
    sweepGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    sweep.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.sfxGain);

    sweep.start(now);
    sweep.stop(now + 0.85);
  }

  public playRevealCelebration() {
    this.setScene('reveal');
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.triggerDholBass(0.35 + i * 0.08);
        this.triggerDholSlap(0.25 + i * 0.05);
      }, i * 65);
    }

    const fanfareNotes = [293.66, 440.0, 587.33, 739.99];
    fanfareNotes.forEach((f) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + 0.4);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(f * 1.5, now + 0.4);
      filter.Q.setValueAtTime(3.0, now + 0.4);

      gain.gain.setValueAtTime(0.01, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + 0.4);
      osc.stop(now + 1.8);
    });

    setTimeout(() => {
      this.triggerManjira(0.4);
    }, 400);
  }

  public playFirework() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(450, now);
    whistle.frequency.exponentialRampToValueAtTime(1400, now + 0.25);

    whistleGain.gain.setValueAtTime(0.12, now);
    whistleGain.gain.linearRampToValueAtTime(0.16, now + 0.2);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    whistle.connect(whistleGain);
    whistleGain.connect(this.sfxGain);
    whistle.start(now);
    whistle.stop(now + 0.26);

    const burstTime = now + 0.22;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, burstTime);
    filter.frequency.exponentialRampToValueAtTime(80, burstTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, burstTime);
    gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(burstTime);

    const sizzleBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
    const sData = sizzleBuffer.getChannelData(0);
    for (let i = 0; i < sData.length; i++) {
      sData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.65 ? 1 : 0.05);
    }
    const sizzle = this.ctx.createBufferSource();
    sizzle.buffer = sizzleBuffer;

    const sizzleFilter = this.ctx.createBiquadFilter();
    sizzleFilter.type = 'highpass';
    sizzleFilter.frequency.setValueAtTime(3000, burstTime + 0.05);

    const sizzleGain = this.ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.16, burstTime + 0.05);
    sizzleGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.38);

    sizzle.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(this.sfxGain);
    sizzle.start(burstTime + 0.05);
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [587.33, 739.99, 880.0, 1174.66];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.01, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.7);
    });

    setTimeout(() => {
      this.triggerManjira(0.3);
    }, 200);
  }

  public playIgnite() {
    this.playLightingFlourish();
  }

  public playAnarSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.9;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * (i / bufferSize));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + 0.85);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playFuljhuriSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.4 ? 1 : 0.05);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playBombSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playChakriSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  public playRocketSound() {
    this.playFirework();
  }
}

export const soundManager = new SoundManager();

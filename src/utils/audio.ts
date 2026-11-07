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
export type FestiveTuneId = 'tune-palace-fusion' | 'tune-keherwa' | 'tune-garba' | 'tune-yaman' | 'tune-bhangra' | 'tune-ambient';

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
    id: 'tune-palace-fusion',
    name: 'Royal Palace Folk Fusion',
    hindiName: 'राजसी महल लोक संगम',
    icon: '🪕',
    description: 'Authentic Shehnai, Bansuri, Santoor, Dholak, Tabla, Khartal & Sarangi folk instrumental (124 BPM)',
    bpm: 124,
  },
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
    name: 'Peaceful Temple Flute',
    hindiName: 'लक्ष्मी पूजा बाँसुरी',
    icon: '🪈',
    description: 'Serene Temple Flute & Harmonium in Raag Yaman (98 BPM)',
    bpm: 98,
  },
  {
    id: 'tune-bhangra',
    name: 'Festive Celebration Dhol',
    hindiName: 'धमाकेदार ढोल गर्जना',
    icon: '🎆',
    description: 'High-octane Punjabi Dhol & Shehnai fanfare (134 BPM)',
    bpm: 134,
  },
  {
    id: 'tune-ambient',
    name: 'Ambient Night Sounds',
    hindiName: 'शांत रात्रि वातावरण',
    icon: '🌌',
    description: 'Tranquil night breeze and serene cricket chirps under the starlit sky',
    bpm: 60,
  },
];

type AudioStateListener = (isMuted: boolean, scene: AudioScene, tuneId: FestiveTuneId) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public currentScene: AudioScene = 'opening';
  public currentTuneId: FestiveTuneId = 'tune-palace-fusion';
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
      this.currentTuneId = 'tune-palace-fusion';
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
  /**
   * Multi-Tune Percussion Engine (Dynamic BPM & Patterns)
   */
  private startPercussionLoop() {
    if (this.rhythmTimer) window.clearInterval(this.rhythmTimer);

    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    const bpm = activeTune.bpm;
    const isPalaceFusion = this.currentTuneId === 'tune-palace-fusion';
    // 16th-note resolution for authentic Indian folk syncopation in Palace Fusion
    const stepInterval = isPalaceFusion
      ? ((60 / bpm) / 4) * 1000
      : ((60 / bpm) / 2) * 1000;

    this.stepCount = 0;
    this.rhythmTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.percussionGain) return;

      const isFullFestive = this.currentScene === 'main' || this.currentScene === 'reveal';

      if (this.currentTuneId === 'tune-palace-fusion') {
        const step = this.stepCount % 64; // 4-measure cycle at 16 sixteenths per bar
        const phrase = Math.floor(step / 16); // 0: intro/soft, 1: groove, 2: syncopated folk, 3: grand crescendo

        // Humanized dynamic micro-fluctuation for live acoustic feel
        const velJitter = 0.94 + Math.random() * 0.12;

        if (phrase === 0) {
          // Movement 1: Playful Shehnai opening with soft Dholak & gentle Manjira
          if (step === 0) {
            this.triggerDholakBayan(0.55 * velJitter, true);
            this.triggerManjira(0.24);
          } else if (step === 8) {
            this.triggerDholakBayan(0.46 * velJitter, true);
          } else if (step === 4 || step === 12) {
            this.triggerDholakChaati(0.32 * velJitter);
          }
        } else if (phrase === 1) {
          // Movement 2: Lively Folk Rhythm introduces Tabla, Manjira & Khartal
          const subStep = step % 16;
          if (subStep === 0) {
            this.triggerDholakBayan(0.72 * velJitter, true);
            this.triggerManjira(0.35);
          } else if (subStep === 2) {
            this.triggerTablaBayan(0.35 * velJitter);
          } else if (subStep === 4) {
            this.triggerKhartal(0.44 * velJitter);
            this.triggerDholakChaati(0.42 * velJitter);
          } else if (subStep === 6) {
            this.triggerTablaDayan(0.32 * velJitter);
          } else if (subStep === 8) {
            this.triggerDholakBayan(0.65 * velJitter, false);
            this.triggerManjira(0.28);
          } else if (subStep === 10) {
            this.triggerTablaBayan(0.38 * velJitter);
          } else if (subStep === 12) {
            this.triggerKhartal(0.48 * velJitter);
            this.triggerDholakChaati(0.46 * velJitter);
          } else if (subStep === 14) {
            this.triggerTablaDayan(0.34 * velJitter);
          }
        } else if (phrase === 2) {
          // Movement 3: Intricate Folk Syncopations with Bansuri & Santoor dialogue
          const subStep = step % 16;
          if (subStep === 0) {
            this.triggerDholakBayan(0.78 * velJitter, true);
            this.triggerManjira(0.38);
          } else if (subStep === 2) {
            this.triggerTablaBayan(0.42 * velJitter);
          } else if (subStep === 4) {
            this.triggerKhartal(0.5 * velJitter);
            this.triggerDholakChaati(0.45 * velJitter);
          } else if (subStep === 6) {
            // Bengali folk syncopated clap
            this.triggerKhartal(0.4 * velJitter);
            this.triggerTablaDayan(0.34 * velJitter);
          } else if (subStep === 8) {
            this.triggerDholakBayan(0.74 * velJitter, true);
            this.triggerManjira(0.32);
          } else if (subStep === 10) {
            this.triggerTablaBayan(0.44 * velJitter);
          } else if (subStep === 12) {
            this.triggerKhartal(0.54 * velJitter);
            this.triggerDholakChaati(0.5 * velJitter);
          } else if (subStep === 14) {
            this.triggerKhartal(0.46 * velJitter);
            this.triggerTablaDayan(0.38 * velJitter);
          }
        } else {
          // Movement 4: Full Ensemble Festive Energy, High-Spirit Folk Celebration!
          const subStep = step % 16;
          if (subStep === 0 || subStep === 8) {
            this.triggerDholakBayan(0.86 * velJitter, true);
            this.triggerManjira(0.42);
          } else if (subStep === 4 || subStep === 12) {
            this.triggerDholakChaati(0.56 * velJitter);
            this.triggerKhartal(0.6 * velJitter);
          }
          if (subStep === 2 || subStep === 6 || subStep === 10 || subStep === 14) {
            this.triggerTablaBayan(0.42 * velJitter);
            this.triggerTablaDayan(0.36 * velJitter);
          }
          if (subStep === 3 || subStep === 7 || subStep === 11 || subStep === 15) {
            this.triggerKhartal(0.48 * velJitter);
            this.triggerGhungroo(0.2);
          }
        }

        this.stepCount++;
        return;
      }

      const step = this.stepCount % 8;

      switch (this.currentTuneId) {
        case 'tune-ambient': {
          // Night Crickets & Serene Breeze
          if (step % 2 === 0 && Math.random() > 0.3) {
            this.playNightCricketChirp();
          }
          break;
        }
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
      'tune-palace-fusion': [293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 554.37, 587.33, 659.25, 739.99], // Raag Khamaj / Bilawal Folk Fusion (Sa=D4)
      'tune-keherwa': [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 493.88, 440.0, 369.99, 440.0, 587.33, 659.25], // Raag Bilawal
      'tune-garba': [293.66, 369.99, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0, 369.99, 329.63, 293.66, 440.0], // Raag Desh
      'tune-yaman': [329.63, 415.3, 440.0, 493.88, 554.37, 622.25, 659.25, 493.88, 415.3, 329.63], // Raag Yaman
      'tune-bhangra': [293.66, 349.23, 392.0, 415.3, 466.16, 523.25, 587.33, 622.25, 587.33, 523.25, 466.16, 415.3], // Raag Bhairavi
      'tune-ambient': [293.66, 369.99, 440.0, 587.33, 659.25], // Pentatonic
    };

    const isPalaceFusion = this.currentTuneId === 'tune-palace-fusion';
    const currentScale = scales[this.currentTuneId] || scales['tune-palace-fusion'];
    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    // Eighth-note interval for palace fusion (approx 242ms at 124 BPM)
    const melodyInterval = isPalaceFusion
      ? Math.round(((60 / activeTune.bpm) / 2) * 1000)
      : Math.round((60 / activeTune.bpm) * 1000);

    this.melodyStep = 0;
    this.melodyTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.melodyGain) return;

      const isMain = this.currentScene === 'main' || this.currentScene === 'reveal';

      if (this.currentTuneId === 'tune-palace-fusion') {
        const step = this.melodyStep % 32; // 32 eighth notes across 4 distinct palace movements

        // Movement 1: Playful Shehnai Opening with Harmonium Drone (Steps 0-7)
        if (step === 0) {
          this.triggerHarmoniumChord([146.83, 220.0, 293.66, 440.0], 0.28, 1.9);
          this.playShehnaiNote(293.66, 0.36); // Sa (D4)
        } else if (step === 2) {
          this.playShehnaiNote(369.99, 0.38); // Ga (F#4)
        } else if (step === 4) {
          this.playShehnaiNote(440.0, 0.4); // Pa (A4)
        } else if (step === 6) {
          this.playShehnaiNote(493.88, 0.38); // Dha (B4)
        }

        // Movement 2: Soaring Shehnai & Lively Groove (Steps 8-15)
        else if (step === 8) {
          this.triggerHarmoniumChord([220.0, 293.66, 369.99, 440.0], 0.25, 1.9);
          this.playShehnaiNote(587.33, 0.44); // Tar Sa (D5) soaring!
        } else if (step === 10) {
          this.playShehnaiNote(554.37, 0.38); // Ni (C#5)
        } else if (step === 12) {
          this.playShehnaiNote(493.88, 0.36); // Dha (B4)
        } else if (step === 14) {
          this.playShehnaiNote(440.0, 0.34); // Pa (A4)
          if (isMain) this.playSantoorNote(587.33, 0.25);
        }

        // Movement 3: Bansuri & Santoor Melodic Counterpoint Exchange (Steps 16-23)
        else if (step === 16) {
          this.triggerHarmoniumChord([196.0, 246.94, 293.66, 392.0], 0.24, 1.9);
          this.playBansuriNote(440.0, 0.36); // Bansuri counterpoint entry (Pa)
        } else if (step === 18) {
          this.playBansuriNote(587.33, 0.4); // Bansuri (Tar Sa)
        } else if (step === 20) {
          this.playBansuriNote(659.25, 0.36); // Bansuri (Tar Re)
        } else if (step === 21) {
          // Santoor answers with a sparkling rapid jhala cascade!
          this.playSantoorJhala(293.66, 0.38);
        } else if (step === 22) {
          this.playBansuriNote(587.33, 0.34);
          // Sarangi emotional bowed meend response
          this.playSarangiNote(369.99, 0.34, 440.0);
        }

        // Movement 4: Full Ensemble Festive Energy & Grand Celebration (Steps 24-31)
        else if (step === 24) {
          this.triggerHarmoniumChord([146.83, 220.0, 293.66, 440.0], 0.3, 1.9);
          this.playShehnaiNote(587.33, 0.42); // Shehnai triumphant
          this.playSantoorNote(739.99, 0.32); // Santoor sparkling high shimmer
        } else if (step === 26) {
          this.playBansuriNote(440.0, 0.32);
          this.playShehnaiNote(493.88, 0.36);
        } else if (step === 28) {
          this.playSantoorJhala(440.0, 0.38); // Santoor jhala flourish
          this.playSarangiNote(440.0, 0.32, 369.99); // Sarangi descending meend
        } else if (step === 30) {
          this.playShehnaiNote(369.99, 0.34);
        } else if (step === 31) {
          this.playShehnaiNote(293.66, 0.36); // Playful resolution to Sa
          this.playSantoorNote(587.33, 0.34); // Final celebratory sparkle
        }

        this.melodyStep++;
        return;
      }

      const noteFreq = currentScale[this.melodyStep % currentScale.length];

      switch (this.currentTuneId) {
        case 'tune-ambient': {
          if (this.melodyStep % 4 === 0 && Math.random() > 0.3) {
            this.playBansuriNote(noteFreq, 0.16);
          }
          break;
        }
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

  /**
   * Night Cricket Chirp Synthesizer for Ambient Night Mode
   */
  private playNightCricketChirp() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4600 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.setValueAtTime(0.025, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Traditional Wooden Khartal Clapper
   * Sharp, woody transient clap with natural high-frequency wooden ring
   */
  private triggerKhartal(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    // 1. High-frequency impulse click
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass tuned to wooden strike resonance (2200 Hz & Q=3.8)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);
    noise.start(now);

    // 2. Wooden body resonance tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.04);

    oscGain.gain.setValueAtTime(vol * 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(oscGain);
    oscGain.connect(this.percussionGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Dholak Bayan (Deep Pitch-Bending Bass Membrane)
   */
  private triggerDholakBayan(vol: number, pitchDrop: boolean = true) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    if (pitchDrop) {
      osc.frequency.setValueAtTime(105, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.16);
    } else {
      osc.frequency.setValueAtTime(78, now);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(190, now);

    gain.gain.setValueAtTime(vol * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Dholak Chaati (Crisp High Treble Head Slap)
   */
  private triggerDholakChaati(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.Q.setValueAtTime(3.2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    noise.start(now);
  }

  /**
   * Traditional Indian Harmonium (Reeds with Bellows Air Flow)
   */
  private triggerHarmoniumChord(freqs: number[], vol: number, duration: number = 1.2) {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq) => {
      if (!this.ctx || !this.droneGain) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, now);
      // Subtle natural chorus / reed beating (0.25% detune)
      osc2.frequency.setValueAtTime(freq * 1.0025, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      // Bellows swelling envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol / (freqs.length * 0.8), now + 0.12);
      gain.gain.setValueAtTime(vol / (freqs.length * 0.8), now + duration - 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    });
  }

  /**
   * Santoor (Hammered Dulcimer - Sparkling, Metallic Strings)
   */
  private playSantoorNote(freq: number, vol: number, delayMs: number = 0) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime + delayMs / 1000;

    // Double struck string simulation
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';

    // Hammer strike transient pitch dive
    osc1.frequency.setValueAtTime(freq * 1.05, now);
    osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.015);

    osc2.frequency.setValueAtTime(freq * 1.002, now); // Metallic shimmer detune

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.75, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  }

  /**
   * Santoor Jhala (Rapid Sparkling 4-Note Ornamental Arpeggio)
   */
  private playSantoorJhala(baseFreq: number, vol: number) {
    const intervals = [1, 1.25, 1.5, 2]; // Sa, Ga, Pa, Tar Sa
    intervals.forEach((ratio, i) => {
      this.playSantoorNote(baseFreq * ratio, vol * 0.7, i * 45);
    });
  }

  /**
   * Sarangi (Expressive Bowed Folk Instrument with Sympathetic Resonance & Soulful Meend)
   */
  private playSarangiNote(freq: number, vol: number, slideToFreq?: number) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.75;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const formant = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    if (slideToFreq) {
      osc.frequency.setValueAtTime(freq, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + 0.45);
    }

    // Vibrato LFO for emotional Indian classical touch
    const vib = this.ctx.createOscillator();
    const vibG = this.ctx.createGain();
    vib.frequency.setValueAtTime(5.4, now);
    vibG.gain.setValueAtTime(freq * 0.016, now);
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    vib.start(now + 0.1);
    vib.stop(now + duration);

    // Resonant wooden body formant filter
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(1100, now);
    formant.Q.setValueAtTime(2.8, now);

    // Bowing pressure envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.09);
    gain.gain.setValueAtTime(vol * 0.7, now + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + duration);
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

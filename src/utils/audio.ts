/**
 * Authentic Indian Classical & Traditional Festive Audio Engine
 * "THE LIGHT WITHIN – A Diwali Experience"
 *
 * FEATURING 4 DISTINCT INDIAN INSTRUMENTAL COMPOSITIONS:
 *   1. Track 1 — The Grand Entrance (Raag Yaman Classical: Bansuri, Santoor, Sitar, Tanpura & Pakhawaj - 96 BPM)
 *   2. Track 2 — The Palace Journey (Royal Folk-Classical Fusion: Shehnai, Bansuri, Santoor, Sarangi, Dholak & Harmonium - 122 BPM)
 *   3. Track 3 — The Festival of Lights (Grand Festive Ensemble: Dhol, Dholak, Nagada, Tasha, Shehnai & Manjira - 132 BPM)
 *   4. Track 4 — The Final Thank You (Soulful Classical Cinematic Finale: Bansuri, Sarangi, Santoor, Sitar & Tanpura - 88 BPM)
 *
 * DYNAMIC INTERACTION LAYER:
 *   Subtle rhythmic percussion layer using authentic Tabla and Manjira tracks that trigger during intense interactions,
 *   complementing the primary compositions without overriding the melodies.
 *
 * Zero EDM beats, zero synthetic electronic kick drums, zero generic bell loops.
 * 100% Procedural Physical Acoustic Web Audio API — Zero external MP3/CORS dependencies!
 */

export type AudioScene = 'opening' | 'lighting' | 'reveal' | 'main' | 'corridor' | 'festive-games' | 'final-thankyou';
export type FestiveTuneId = 'tune-yaman' | 'tune-palace-fusion' | 'tune-garba' | 'tune-finale' | 'tune-keherwa' | 'tune-bhangra';

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
    id: 'tune-yaman',
    name: 'Track 1 — The Grand Entrance',
    hindiName: 'दिव्य आगमन (राग यमन)',
    icon: '🪈',
    description: 'Majestic & serene Raag Yaman classical introduction with Bansuri, Santoor, Sitar, Tanpura & Pakhawaj (96 BPM)',
    bpm: 96,
  },
  {
    id: 'tune-palace-fusion',
    name: 'Track 2 — The Palace Journey',
    hindiName: 'राजसी महल यात्रा (लोक संगम)',
    icon: '🪕',
    description: 'Sophisticated & joyful folk-classical fusion with Shehnai, Bansuri, Santoor, Sarangi, Dholak & Harmonium (122 BPM)',
    bpm: 122,
  },
  {
    id: 'tune-garba',
    name: 'Track 3 — The Festival of Lights',
    hindiName: 'उत्सव की तरंग (महा ढोल व शहनाई)',
    icon: '🎆',
    description: 'Grand traditional festive ensemble with Dhol, Dholak, Nagada, Tasha, Shehnai & Manjira (132 BPM)',
    bpm: 132,
  },
  {
    id: 'tune-finale',
    name: 'Track 4 — The Final Thank You',
    hindiName: 'कृतज्ञता का उजाला (समापन)',
    icon: '🪔',
    description: 'Soulful & emotional cinematic classical finale with Bansuri lead, Sarangi meend, Santoor jhala & Tanpura (88 BPM)',
    bpm: 88,
  },
];

type AudioStateListener = (isMuted: boolean, scene: AudioScene, tuneId: FestiveTuneId) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public currentScene: AudioScene = 'opening';
  public currentTuneId: FestiveTuneId = 'tune-yaman';
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

  // Dynamic Interaction Percussion Layer State
  private interactionIntensity: number = 0;
  private intensityDecayTimer: number | null = null;

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
      this.currentTuneId = 'tune-yaman';
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
        this.percussionGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
        this.percussionGain.connect(this.masterMusicGain);

        this.melodyGain = this.ctx.createGain();
        this.melodyGain.gain.setValueAtTime(0.48, this.ctx.currentTime);
        this.melodyGain.connect(this.masterMusicGain);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
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
   * Set active scene with smooth musical transitions and scene-to-track auto mapping
   */
  public setScene(scene: AudioScene) {
    this.currentScene = scene;
    this.initCtx();

    // Map user journey scenes directly to the 4 requested compositions:
    // Track 1 — The Grand Entrance: opening, lighting
    // Track 2 — The Palace Journey: main, corridor
    // Track 3 — The Festival of Lights: festive-games
    // Track 4 — The Final Thank You: final-thankyou, reveal (Door 6)
    let mappedTune: FestiveTuneId = this.currentTuneId;
    if (scene === 'opening' || scene === 'lighting') {
      mappedTune = 'tune-yaman';
    } else if (scene === 'main' || scene === 'corridor') {
      mappedTune = 'tune-palace-fusion';
    } else if (scene === 'festive-games') {
      mappedTune = 'tune-garba';
    } else if (scene === 'final-thankyou' || scene === 'reveal') {
      mappedTune = 'tune-finale';
    }

    if (mappedTune !== this.currentTuneId) {
      this.setTune(mappedTune);
    }

    if (!this.isEngineRunning) {
      this.startFestiveMusic();
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.percussionGain && this.melodyGain && this.droneGain) {
      switch (scene) {
        case 'opening':
          this.percussionGain.gain.setTargetAtTime(0.25, now, 0.4);
          this.melodyGain.gain.setTargetAtTime(0.42, now, 0.4);
          this.droneGain.gain.setTargetAtTime(0.28, now, 0.4);
          break;
        case 'lighting':
          this.percussionGain.gain.setTargetAtTime(0.35, now, 0.2);
          this.melodyGain.gain.setTargetAtTime(0.48, now, 0.2);
          this.droneGain.gain.setTargetAtTime(0.3, now, 0.2);
          break;
        case 'corridor':
        case 'main':
          this.percussionGain.gain.setTargetAtTime(0.5, now, 0.3);
          this.melodyGain.gain.setTargetAtTime(0.52, now, 0.3);
          this.droneGain.gain.setTargetAtTime(0.22, now, 0.3);
          break;
        case 'festive-games':
          this.percussionGain.gain.setTargetAtTime(0.58, now, 0.3);
          this.melodyGain.gain.setTargetAtTime(0.5, now, 0.3);
          this.droneGain.gain.setTargetAtTime(0.18, now, 0.3);
          break;
        case 'final-thankyou':
        case 'reveal':
          this.percussionGain.gain.setTargetAtTime(0.22, now, 0.5);
          this.melodyGain.gain.setTargetAtTime(0.54, now, 0.5);
          this.droneGain.gain.setTargetAtTime(0.32, now, 0.5);
          break;
      }
    }

    this.notify();
  }

  /**
   * Trigger intense interaction state (e.g. lighting diyas, launching fireworks, matching memory cards).
   * Elevates the rhythmic percussion sub-layer with subtle Tabla & Manjira syncopations
   * that smoothly decay back to baseline without overriding the primary melody.
   */
  public triggerInteraction(intensity: number = 0.65, durationMs: number = 3000) {
    if (this.isMuted) return;
    this.initCtx();

    // Elevate interaction intensity
    this.interactionIntensity = Math.min(1.0, Math.max(this.interactionIntensity, intensity));

    // Immediate subtle Tabla-Manjira fill flourish
    this.triggerTablaManjiraFlourish(intensity * 0.45);

    // Smooth decay back to zero
    if (this.intensityDecayTimer) window.clearInterval(this.intensityDecayTimer);
    const stepDuration = 200;
    const decayPerStep = (intensity / (durationMs / stepDuration));

    this.intensityDecayTimer = window.setInterval(() => {
      this.interactionIntensity = Math.max(0, this.interactionIntensity - decayPerStep);
      if (this.interactionIntensity <= 0) {
        if (this.intensityDecayTimer) window.clearInterval(this.intensityDecayTimer);
        this.intensityDecayTimer = null;
      }
    }, stepDuration);
  }

  /**
   * Play an elegant, subtle Tabla Bol & bronze Manjira flourish burst
   * (Dhage-Te-Te + Silver Ring chime) to accent interactive events.
   */
  public triggerTablaManjiraFlourish(volMultiplier: number = 0.4) {
    if (this.isMuted || !this.ctx) return;

    // 1. Tabla Bayan pitch-bend stroke
    this.triggerTablaBayan(0.28 * volMultiplier);

    // 2. Tabla Dayan tuned stroke after 75ms
    setTimeout(() => {
      if (!this.isMuted) this.triggerTablaDayan(0.22 * volMultiplier);
    }, 75);

    // 3. Bronze Manjira ring after 150ms
    setTimeout(() => {
      if (!this.isMuted) this.triggerManjira(0.25 * volMultiplier);
    }, 150);
  }

  public startFestiveMusic() {
    this.initCtx();
    if (!this.ctx || !this.masterMusicGain) return;
    if (this.isEngineRunning) return;

    this.isEngineRunning = true;
    this.initTanpuraAndHarmoniumDrone();
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

  /**
   * Continuous Tanpura Drone (Sa-Pa-Sa: D4, A3, D4, D3) with harmonic overtones
   */
  private initTanpuraAndHarmoniumDrone() {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;

    // Clear old drone nodes
    this.droneOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // safe
      }
    });
    this.droneOscs = [];

    const freqs = [146.83, 220.0, 293.66, 369.99]; // D3, A3, D4, F#4 (Raag Yaman Sa-Pa-Sa-Ga)
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.droneGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + i * 85, now);

      gain.gain.setValueAtTime(0.05 / (i + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain);

      osc.start(now);
      this.droneOscs.push(osc);
    });
  }

  /**
   * Authentic Percussion Engine for the 4 Compositions + Interactive Tabla & Manjira Sub-layer
   */
  private startPercussionLoop() {
    if (this.rhythmTimer) window.clearInterval(this.rhythmTimer);

    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    const bpm = activeTune.bpm;

    // Sixteenth-note resolution for authentic Indian folk and classical syncopation
    const stepInterval = ((60 / bpm) / 4) * 1000;

    this.stepCount = 0;
    this.rhythmTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.percussionGain) return;

      const velJitter = 0.94 + Math.random() * 0.12; // Acoustic velocity humanization
      const intenseLevel = this.interactionIntensity; // Current interaction intensity (0.0 to 1.0)

      switch (this.currentTuneId) {
        // ==========================================
        // TRACK 1 — THE GRAND ENTRANCE (Keherwa / Teentaal Soft Tabla & Pakhawaj)
        // ==========================================
        case 'tune-yaman': {
          const step = this.stepCount % 32; // 32 sixteenth notes (2 bars)
          if (step === 0) {
            this.triggerPakhawajBass(0.55 * velJitter);
            this.triggerManjira(0.26);
          } else if (step === 4) {
            this.triggerTablaDayan(0.28 * velJitter);
          } else if (step === 8) {
            this.triggerTablaBayan(0.38 * velJitter);
          } else if (step === 12) {
            this.triggerTablaDayan(0.32 * velJitter);
          } else if (step === 16) {
            this.triggerPakhawajBass(0.48 * velJitter);
            this.triggerManjira(0.22);
          } else if (step === 20) {
            this.triggerKhartal(0.28 * velJitter);
          } else if (step === 24) {
            this.triggerTablaBayan(0.42 * velJitter);
          } else if (step === 28) {
            this.triggerTablaDayan(0.3 * velJitter);
          }

          // SUBTLE RHYTHMIC PERCUSSION SUB-LAYER DURING INTENSE INTERACTIONS:
          if (intenseLevel > 0.08) {
            if (step % 4 === 2) {
              // Off-beat Tabla Dayan subtle stroke
              this.triggerTablaDayan(0.18 * intenseLevel * velJitter);
            } else if (step % 4 === 3) {
              // Off-beat Tabla Bayan micro-glide
              this.triggerTablaBayan(0.22 * intenseLevel * velJitter);
              if (step % 8 === 7) {
                this.triggerManjira(0.15 * intenseLevel);
              }
            }
          }
          break;
        }

        // ==========================================
        // TRACK 2 — THE PALACE JOURNEY (Lively Indian Folk-Classical Dholak & Tabla)
        // ==========================================
        case 'tune-palace-fusion':
        case 'tune-keherwa': {
          const step = this.stepCount % 64; // 4-measure folk cycle
          const phrase = Math.floor(step / 16);

          if (phrase === 0) {
            // Intro: Soft Dholak Bayan & gentle Manjira ring
            if (step % 16 === 0) {
              this.triggerDholakBayan(0.58 * velJitter, true);
              this.triggerManjira(0.28);
            } else if (step % 16 === 8) {
              this.triggerDholakBayan(0.46 * velJitter, true);
            } else if (step % 16 === 4 || step % 16 === 12) {
              this.triggerDholakChaati(0.35 * velJitter);
            }
          } else if (phrase === 1 || phrase === 2) {
            // Folk Syncopation: Tabla, Manjira & Khartal clapper exchange
            const subStep = step % 16;
            if (subStep === 0) {
              this.triggerDholakBayan(0.72 * velJitter, true);
              this.triggerManjira(0.35);
            } else if (subStep === 2) {
              this.triggerTablaBayan(0.38 * velJitter);
            } else if (subStep === 4) {
              this.triggerKhartal(0.44 * velJitter);
              this.triggerDholakChaati(0.42 * velJitter);
            } else if (subStep === 6) {
              this.triggerTablaDayan(0.32 * velJitter);
            } else if (subStep === 8) {
              this.triggerDholakBayan(0.65 * velJitter, false);
              this.triggerManjira(0.28);
            } else if (subStep === 10) {
              this.triggerTablaBayan(0.4 * velJitter);
            } else if (subStep === 12) {
              this.triggerKhartal(0.48 * velJitter);
              this.triggerDholakChaati(0.46 * velJitter);
            } else if (subStep === 14) {
              this.triggerTablaDayan(0.34 * velJitter);
            }
          } else {
            // Full Folk Ensemble Energy
            const subStep = step % 16;
            if (subStep === 0 || subStep === 8) {
              this.triggerDholakBayan(0.82 * velJitter, true);
              this.triggerManjira(0.4);
            } else if (subStep === 4 || subStep === 12) {
              this.triggerDholakChaati(0.52 * velJitter);
              this.triggerKhartal(0.55 * velJitter);
            }
            if (subStep === 2 || subStep === 6 || subStep === 10 || subStep === 14) {
              this.triggerTablaBayan(0.4 * velJitter);
              this.triggerTablaDayan(0.34 * velJitter);
            }
          }

          // SUBTLE RHYTHMIC PERCUSSION SUB-LAYER DURING INTENSE INTERACTIONS:
          if (intenseLevel > 0.08) {
            const subStep = step % 16;
            if (subStep === 1 || subStep === 5 || subStep === 9 || subStep === 13) {
              this.triggerTablaDayan(0.2 * intenseLevel * velJitter);
            } else if (subStep === 3 || subStep === 7 || subStep === 11 || subStep === 15) {
              this.triggerTablaBayan(0.22 * intenseLevel * velJitter);
              this.triggerManjira(0.16 * intenseLevel);
            }
          }
          break;
        }

        // ==========================================
        // TRACK 3 — THE FESTIVAL OF LIGHTS (Grand Ensemble: Dhol, Nagada & Tasha)
        // ==========================================
        case 'tune-garba':
        case 'tune-bhangra': {
          const step = this.stepCount % 32;
          const subStep = step % 8;

          if (subStep === 0) {
            this.triggerNagadaBass(0.78 * velJitter);
            this.triggerManjira(0.38);
          } else if (subStep === 4) {
            this.triggerDholBass(0.72 * velJitter);
          }
          if (subStep === 2 || subStep === 6) {
            this.triggerDholSlap(0.48 * velJitter);
            this.triggerTashaRim(0.42 * velJitter);
          }
          if (subStep === 1 || subStep === 3 || subStep === 5 || subStep === 7) {
            this.triggerGhungroo(0.18);
          }

          // SUBTLE RHYTHMIC PERCUSSION SUB-LAYER DURING INTENSE INTERACTIONS:
          if (intenseLevel > 0.08) {
            if (subStep === 1 || subStep === 5) {
              this.triggerTablaBayan(0.25 * intenseLevel * velJitter);
            } else if (subStep === 3 || subStep === 7) {
              this.triggerTablaDayan(0.22 * intenseLevel * velJitter);
              this.triggerManjira(0.18 * intenseLevel);
            }
          }
          break;
        }

        // ==========================================
        // TRACK 4 — THE FINAL THANK YOU (Soulful Classical Serene Pulse)
        // ==========================================
        case 'tune-finale':
        default: {
          const step = this.stepCount % 32; // Floating 32-step cycle
          if (step === 0) {
            this.triggerTablaBayan(0.32 * velJitter);
            this.triggerManjira(0.24);
          } else if (step === 8) {
            this.triggerTablaDayan(0.22 * velJitter);
          } else if (step === 16) {
            this.triggerPakhawajBass(0.28 * velJitter);
            this.triggerManjira(0.2);
          } else if (step === 24) {
            this.triggerTablaDayan(0.24 * velJitter);
          }

          // SUBTLE RHYTHMIC PERCUSSION SUB-LAYER DURING INTENSE INTERACTIONS:
          if (intenseLevel > 0.08) {
            if (step % 8 === 4) {
              this.triggerTablaBayan(0.16 * intenseLevel * velJitter);
            } else if (step % 8 === 6) {
              this.triggerTablaDayan(0.14 * intenseLevel * velJitter);
              this.triggerManjira(0.12 * intenseLevel);
            }
          }
          break;
        }
      }

      this.stepCount++;
    }, stepInterval);
  }

  /**
   * Multi-Track Melodic Engine for the 4 Compositions
   */
  private startMelodyLoop() {
    if (this.melodyTimer) window.clearInterval(this.melodyTimer);

    const activeTune = FESTIVE_TUNES.find((t) => t.id === this.currentTuneId) || FESTIVE_TUNES[0];
    const bpm = activeTune.bpm;
    // Eighth-note melody resolution
    const melodyInterval = Math.round(((60 / bpm) / 2) * 1000);

    this.melodyStep = 0;
    this.melodyTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.melodyGain) return;

      switch (this.currentTuneId) {
        // ==========================================
        // TRACK 1 — THE GRAND ENTRANCE (Raag Yaman Classical Instrumental)
        // ==========================================
        case 'tune-yaman': {
          const step = this.melodyStep % 32; // 32 eighth notes across Yaman alap/gat

          if (step === 0) {
            this.triggerHarmoniumChord([146.83, 220.0, 293.66, 369.99], 0.25, 2.4); // Sa-Pa-Sa-Ga
            this.playBansuriNote(293.66, 0.38); // Sa
          } else if (step === 2) {
            this.playBansuriNote(329.63, 0.36); // Re
          } else if (step === 4) {
            this.playBansuriNote(369.99, 0.4); // Ga
          } else if (step === 6) {
            this.playBansuriNote(415.3, 0.38); // Tivra Ma (#4)
          } else if (step === 8) {
            this.playBansuriNote(440.0, 0.42); // Pa
            this.playSantoorNote(587.33, 0.28); // Santoor response
          } else if (step === 10) {
            this.playBansuriNote(493.88, 0.38); // Dha
          } else if (step === 12) {
            this.playBansuriNote(554.37, 0.4); // Ni
          } else if (step === 14) {
            this.playBansuriNote(587.33, 0.44); // Tar Sa
            this.playSitarNote(587.33, 0.32);
          } else if (step === 16) {
            this.triggerHarmoniumChord([220.0, 293.66, 369.99, 440.0], 0.22, 2.4);
            this.playSantoorJhala(293.66, 0.35); // Sparkling Santoor sweep
          } else if (step === 18) {
            this.playBansuriNote(554.37, 0.36);
          } else if (step === 20) {
            this.playBansuriNote(493.88, 0.38);
          } else if (step === 22) {
            this.playSitarNote(440.0, 0.35);
          } else if (step === 24) {
            this.playBansuriNote(415.3, 0.36); // Tivra Ma
          } else if (step === 26) {
            this.playBansuriNote(369.99, 0.38); // Ga
          } else if (step === 28) {
            this.playBansuriNote(329.63, 0.36); // Re
          } else if (step === 30) {
            this.playBansuriNote(293.66, 0.4); // Sa resolution
            this.playSantoorNote(587.33, 0.3);
          }
          break;
        }

        // ==========================================
        // TRACK 2 — THE PALACE JOURNEY (Royal Folk-Classical Fusion)
        // ==========================================
        case 'tune-palace-fusion':
        case 'tune-keherwa': {
          const step = this.melodyStep % 32;

          if (step === 0) {
            this.triggerHarmoniumChord([146.83, 220.0, 293.66, 440.0], 0.28, 1.9);
            this.playShehnaiNote(293.66, 0.38); // Shehnai opening call
          } else if (step === 2) {
            this.playShehnaiNote(369.99, 0.4);
          } else if (step === 4) {
            this.playShehnaiNote(440.0, 0.42);
          } else if (step === 6) {
            this.playShehnaiNote(493.88, 0.38);
          } else if (step === 8) {
            this.triggerHarmoniumChord([220.0, 293.66, 369.99, 440.0], 0.25, 1.9);
            this.playShehnaiNote(587.33, 0.46); // High Shehnai soaring
          } else if (step === 10) {
            this.playShehnaiNote(554.37, 0.38);
          } else if (step === 12) {
            this.playShehnaiNote(493.88, 0.36);
          } else if (step === 14) {
            this.playShehnaiNote(440.0, 0.34);
            this.playSantoorNote(587.33, 0.28);
          } else if (step === 16) {
            this.triggerHarmoniumChord([196.0, 246.94, 293.66, 392.0], 0.24, 1.9);
            this.playBansuriNote(440.0, 0.38); // Bansuri counterpoint
          } else if (step === 18) {
            this.playBansuriNote(587.33, 0.42);
          } else if (step === 20) {
            this.playBansuriNote(659.25, 0.38);
          } else if (step === 21) {
            this.playSantoorJhala(293.66, 0.38); // Santoor jhala
          } else if (step === 22) {
            this.playSarangiNote(369.99, 0.36, 440.0); // Sarangi bowed meend
          } else if (step === 24) {
            this.triggerHarmoniumChord([146.83, 220.0, 293.66, 440.0], 0.3, 1.9);
            this.playShehnaiNote(587.33, 0.44);
            this.playSantoorNote(739.99, 0.34);
          } else if (step === 26) {
            this.playBansuriNote(440.0, 0.34);
            this.playShehnaiNote(493.88, 0.38);
          } else if (step === 28) {
            this.playSantoorJhala(440.0, 0.38);
            this.playSarangiNote(440.0, 0.34, 369.99);
          } else if (step === 30) {
            this.playShehnaiNote(293.66, 0.38);
            this.playSantoorNote(587.33, 0.35);
          }
          break;
        }

        // ==========================================
        // TRACK 3 — THE FESTIVAL OF LIGHTS (Grand Festive Ensemble)
        // ==========================================
        case 'tune-garba':
        case 'tune-bhangra': {
          const scale = [293.66, 369.99, 440.0, 523.25, 587.33, 659.25, 739.99]; // Raag Desh / Festive
          const noteFreq = scale[this.melodyStep % scale.length];

          if (this.melodyStep % 2 === 0) {
            this.playShehnaiNote(noteFreq, 0.38);
          } else {
            this.playSitarNote(noteFreq * 1.25, 0.32);
          }
          if (this.melodyStep % 4 === 0) {
            this.playBansuriNote(noteFreq * 1.5, 0.3);
          }
          break;
        }

        // ==========================================
        // TRACK 4 — THE FINAL THANK YOU (Soulful Cinematic Closing)
        // ==========================================
        case 'tune-finale':
        default: {
          const step = this.melodyStep % 32;

          if (step === 0) {
            this.triggerHarmoniumChord([146.83, 220.0, 293.66, 440.0], 0.22, 2.6);
            this.playBansuriNote(293.66, 0.42); // Soulful Bansuri solo
          } else if (step === 4) {
            this.playBansuriNote(369.99, 0.4); // Ga
          } else if (step === 8) {
            this.playSarangiNote(369.99, 0.38, 440.0); // Sarangi meend to Pa
          } else if (step === 12) {
            this.playBansuriNote(493.88, 0.44); // Dha
          } else if (step === 16) {
            this.triggerHarmoniumChord([220.0, 293.66, 369.99, 440.0], 0.2, 2.6);
            this.playSantoorJhala(293.66, 0.36); // Sparkling Santoor sweep
          } else if (step === 20) {
            this.playBansuriNote(440.0, 0.4);
          } else if (step === 24) {
            this.playSarangiNote(440.0, 0.36, 369.99); // Descending meend
          } else if (step === 28) {
            this.playBansuriNote(293.66, 0.42); // Peaceful Sa resolution
            this.playSitarNote(587.33, 0.32);
          }
          break;
        }
      }

      this.melodyStep++;
    }, melodyInterval);
  }

  // ==========================================
  // INSTRUMENT PHYSICAL SYNTHESIZERS
  // ==========================================

  /** Bansuri Flute: Pure sine with breath turbulence & natural throat vibrato */
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
    vibG.gain.setValueAtTime(freq * 0.012, now);
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    vib.start(now);
    vib.stop(now + 0.65);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  /** Santoor (Hammered Dulcimer): Dual struck strings with metallic hammer strike transient */
  private playSantoorNote(freq: number, vol: number, delayMs: number = 0) {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime + delayMs / 1000;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(freq * 1.05, now);
    osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.015);
    osc2.frequency.setValueAtTime(freq * 1.0025, now);

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

  /** Santoor Jhala: Rapid 4-note sparkling arpeggio sweep */
  private playSantoorJhala(baseFreq: number, vol: number) {
    const intervals = [1, 1.25, 1.5, 2];
    intervals.forEach((ratio, i) => {
      this.playSantoorNote(baseFreq * ratio, vol * 0.7, i * 45);
    });
  }

  /** Sitar: Plucked metallic string with pitch glide & Chikari sizzle */
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
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /** Shehnai: Double reed oboe with resonant formant filter & 6Hz vibrato */
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
    vibrato.stop(now + 0.45);

    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(freq * 1.6, now);
    formant.Q.setValueAtTime(3.8, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(formant);
    osc2.connect(formant);
    formant.connect(gain);
    gain.connect(this.melodyGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  /** Sarangi: Bowed folk fiddle with wood body formant & expressive meend glissando */
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

    const vib = this.ctx.createOscillator();
    const vibG = this.ctx.createGain();
    vib.frequency.setValueAtTime(5.4, now);
    vibG.gain.setValueAtTime(freq * 0.016, now);
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    vib.start(now + 0.1);
    vib.stop(now + duration);

    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(1100, now);
    formant.Q.setValueAtTime(2.8, now);

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

  /** Harmonium: Reeds with bellows air flow envelope */
  private triggerHarmoniumChord(freqs: number[], vol: number, duration: number = 1.6) {
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
      osc2.frequency.setValueAtTime(freq * 1.0025, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol / (freqs.length * 0.8), now + 0.15);
      gain.gain.setValueAtTime(vol / (freqs.length * 0.8), now + duration - 0.2);
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

  // ==========================================
  // PERCUSSION INSTRUMENT SYNTHESIZERS
  // ==========================================

  /** Pakhawaj / Tabla Bass Head (Resonant pitch-bending bass) */
  private triggerPakhawajBass(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /** Tabla Bayan (Bass head) */
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

  /** Tabla Dayan (Tuned treble head) */
  private triggerTablaDayan(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(293.66, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(294, now);
    filter.Q.setValueAtTime(6.0, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Dhol Bass (Dagga) */
  private triggerDholBass(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

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

  /** Dhol Slap (Tilli stick strike) */
  private triggerDholSlap(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
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

  /** Dholak Bayan (Pitch drop folk bass) */
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

  /** Dholak Chaati (Crisp folk treble slap) */
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

  /** Nagada Kettle Drum Bass */
  private triggerNagadaBass(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.32);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /** Tasha Drum High Rim Strike */
  private triggerTashaRim(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    noise.start(now);
  }

  /** Khartal Wooden Clapper */
  private triggerKhartal(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

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

  /** Manjira Bronze Cymbals */
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
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.percussionGain);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  /** Ghungroo Ankle Bells */
  private triggerGhungroo(vol: number) {
    if (!this.ctx || !this.percussionGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
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

  // ==========================================
  // SCENE-SPECIFIC MUSICAL MOMENTS & SOUND FX
  // ==========================================

  public playLightingFlourish() {
    this.triggerInteraction(0.7, 3200);
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
    this.triggerInteraction(0.85, 4000);
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
    this.triggerInteraction(0.65, 2500);
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
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
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

    const sizzleBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.4), this.ctx.sampleRate);
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
    this.triggerInteraction(0.8, 3500);
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
    this.triggerInteraction(0.7, 3000);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
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
    this.triggerInteraction(0.5, 2000);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
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
    this.triggerInteraction(0.85, 3500);
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

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
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
    this.triggerInteraction(0.75, 3000);
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

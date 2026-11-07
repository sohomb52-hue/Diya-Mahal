import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Flame,
  Trophy,
  Play,
  Pause,
  Square,
  Music,
  Palette,
  Grid,
} from 'lucide-react';
import { soundManager, FestiveTuneId } from '../utils/audio';
import {
  calculateFirecrackerScore,
  generateFireworkPatternPoints,
  FireworkShape,
} from '../utils/gameLogic';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from './MadhubaniCard';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  sparkle?: boolean;
}

interface RocketItem {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  shape: FireworkShape;
}

interface ActiveAnar {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ActiveChakri {
  x: number;
  y: number;
  angle: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ActiveBomb {
  x: number;
  y: number;
  countdown: number; // 3, 2, 1, 0
  timer: number;
}

type FirecrackerType = 'fuljhuri' | 'anar' | 'chakri' | 'bomb' | 'rocket';

// Customisation Options
export interface ColorOption {
  id: string;
  name: string;
  colors: string[];
  swatchGradient: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'gold', name: 'Gold', colors: ['#FFD166', '#FFB000', '#FFF1D6', '#E8B947'], swatchGradient: 'from-[#FFE082] via-[#FFB000] to-[#B87A04]' },
  { id: 'royal-blue', name: 'Royal Blue', colors: ['#3478F6', '#236C79', '#60A5FA', '#1E40AF'], swatchGradient: 'from-[#60A5FA] via-[#3478F6] to-[#1E3A8A]' },
  { id: 'crimson-red', name: 'Crimson Red', colors: ['#E63946', '#A82420', '#F87171', '#DC2626'], swatchGradient: 'from-[#F87171] via-[#E63946] to-[#991B1B]' },
  { id: 'purple', name: 'Purple', colors: ['#A855F7', '#8B5CF6', '#C084FC', '#7E22CE'], swatchGradient: 'from-[#C084FC] via-[#A855F7] to-[#6B21A8]' },
  { id: 'emerald-green', name: 'Emerald Green', colors: ['#2E9D50', '#10B981', '#34D399', '#059669'], swatchGradient: 'from-[#34D399] via-[#10B981] to-[#047857]' },
  { id: 'rose-pink', name: 'Rose Pink', colors: ['#FF2E88', '#E91E63', '#F472B6', '#F43F5E'], swatchGradient: 'from-[#F472B6] via-[#FF2E88] to-[#BE185D]' },
  { id: 'multicolour', name: 'Multicolour', colors: ['#FF2E88', '#E63946', '#FF5722', '#FFB000', '#20C9C3', '#3478F6', '#2E9D50', '#A855F7'], swatchGradient: 'from-[#FF2E88] via-[#FFB000] to-[#20C9C3]' },
];

export interface PatternOption {
  id: FireworkShape;
  name: string;
  hindiName: string;
  icon: string;
}

export const PATTERN_OPTIONS: PatternOption[] = [
  { id: 'chrysanthemum', name: 'Classic Burst', hindiName: 'क्लासिक बर्स्ट', icon: '🎆' },
  { id: 'star', name: 'Starburst', hindiName: 'तारा पुंज', icon: '⭐' },
  { id: 'ring', name: 'Ring Explosion', hindiName: 'रिंग धमाका', icon: '⭕' },
  { id: 'spiral', name: 'Spiral', hindiName: 'सर्पिल', icon: '🌀' },
  { id: 'heart', name: 'Heart Burst', hindiName: 'हृदय चक्र', icon: '❤️' },
  { id: 'shower', name: 'Sparkling Rain', hindiName: 'झरना', icon: '✨' },
];

export interface MusicOption {
  id: string; // 'no-music' or FestiveTuneId
  name: string;
  hindiName: string;
  icon: string;
}

export const MUSIC_OPTIONS: MusicOption[] = [
  { id: 'tune-palace-fusion', name: 'Traditional Instrumental', hindiName: 'राजसी लोक संगम', icon: '🪕' },
  { id: 'tune-yaman', name: 'Peaceful Flute', hindiName: 'शांतिपूर्ण बाँसुरी', icon: '🪈' },
  { id: 'tune-bhangra', name: 'Festive Celebration', hindiName: 'उत्सव ढोल गर्जना', icon: '🥁' },
  { id: 'tune-ambient', name: 'Ambient Night Sounds', hindiName: 'शांत रात्रि वातावरण', icon: '🌌' },
  { id: 'no-music', name: 'No Music', hindiName: 'संगीत बंद', icon: '🔇' },
];

const FIRECRACKER_TYPES: Array<{
  id: FirecrackerType;
  name: string;
  hindi: string;
  icon: string;
  description: string;
  points: number;
  color: string;
}> = [
  {
    id: 'anar',
    name: 'Anar',
    hindi: 'अनार (Fountain)',
    icon: '🪔',
    description: 'Shoots golden sparks high into the night sky.',
    points: 25,
    color: '#FFB000',
  },
  {
    id: 'fuljhuri',
    name: 'Fuljhuri',
    hindi: 'फुलझड़ी (Sparkler)',
    icon: '✨',
    description: 'Move your cursor/finger to draw sparkling light patterns.',
    points: 10,
    color: '#20C9C3',
  },
  {
    id: 'bomb',
    name: 'Visual Bomb',
    hindi: 'बम (Safe Visual Burst)',
    icon: '💥',
    description: '3-2-1 visual countdown with comic BOOM shockwave!',
    points: 75,
    color: '#E63946',
  },
  {
    id: 'chakri',
    name: 'Chakri',
    hindi: 'चकरी (Ground Spinner)',
    icon: '🌀',
    description: 'Spins dynamically emitting spiral trails of colorful sparks.',
    points: 35,
    color: '#FF2E88',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    hindi: 'रॉकेट (Aerial Burst)',
    icon: '🚀',
    description: 'Launches skyward and explodes into custom fireworks patterns.',
    points: 50,
    color: '#3478F6',
  },
];

export const FirecrackerSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedType, setSelectedType] = useState<FirecrackerType>('rocket');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Customisation States
  const [selectedColorId, setSelectedColorId] = useState<string>('gold');
  const [selectedPatternId, setSelectedPatternId] = useState<FireworkShape>('chrysanthemum');
  const [selectedMusicId, setSelectedMusicId] = useState<string>('tune-palace-fusion');

  // Display Controls States
  const [isAutoDisplayRunning, setIsAutoDisplayRunning] = useState<boolean>(false);
  const [isAutoDisplayPaused, setIsAutoDisplayPaused] = useState<boolean>(false);

  // Score & Combo HUD State
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [rankTitle, setRankTitle] = useState('Spark Artisan');
  const [comboMultiplier, setComboMultiplier] = useState(1);

  // Simulation Refs
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<RocketItem[]>([]);
  const activeAnarsRef = useRef<ActiveAnar[]>([]);
  const activeChakrisRef = useRef<ActiveChakri[]>([]);
  const activeBombsRef = useRef<ActiveBomb[]>([]);
  const fuljhuriActiveRef = useRef(false);
  const fuljhuriPosRef = useRef<{ x: number; y: number } | null>(null);
  const comboResetTimerRef = useRef<number | null>(null);

  // Sync sound state with soundManager
  useEffect(() => {
    const unsubscribe = soundManager.subscribe((isMuted, _scene, tuneId) => {
      setSoundEnabled(!isMuted);
      if (isMuted) {
        setSelectedMusicId('no-music');
      } else {
        setSelectedMusicId(tuneId);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Music Option Change
  const handleMusicChange = (musicId: string) => {
    setSelectedMusicId(musicId);
    if (musicId === 'no-music') {
      soundManager.setMute(true);
    } else {
      soundManager.setMute(false);
      soundManager.setTune(musicId as FestiveTuneId);
      soundManager.startFestiveMusic();
    }
  };

  // Color Helper function
  const getRandomColorForOption = useCallback((colorId: string): string => {
    const opt = COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
    return opt.colors[Math.floor(Math.random() * opt.colors.length)];
  }, []);

  // Add score & update combo helper
  const triggerScore = useCallback((type: 'anar' | 'fuljhuri' | 'bomb' | 'chakri' | 'rocket' | 'grand_finale') => {
    setComboCount((prevCombo) => {
      const nextCombo = prevCombo + 1;
      setScore((currScore) => {
        const { newScore, comboMultiplier: mult, rankTitle: rank } = calculateFirecrackerScore(
          type,
          nextCombo,
          currScore
        );
        setComboMultiplier(mult);
        setRankTitle(rank);
        return newScore;
      });

      // Reset combo timer after 2.2 seconds of inactivity
      if (comboResetTimerRef.current) window.clearTimeout(comboResetTimerRef.current);
      comboResetTimerRef.current = window.setTimeout(() => {
        setComboCount(0);
        setComboMultiplier(1);
      }, 2200);

      return nextCombo;
    });
  }, []);

  // Automatic Display Loop Timer Effect
  useEffect(() => {
    if (!isAutoDisplayRunning || isAutoDisplayPaused) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const countToLaunch = Math.random() > 0.65 ? 2 : 1;
      for (let k = 0; k < countToLaunch; k++) {
        const x = Math.random() * (canvas.width - 160) + 80;
        const targetY = Math.random() * 180 + 50;
        const color = getRandomColorForOption(selectedColorId);
        const shape = selectedPatternId;

        rocketsRef.current.push({
          x,
          y: canvas.height - 30,
          targetY,
          vy: -11 - Math.random() * 3.5,
          color,
          shape,
        });
      }

      if (soundEnabled) {
        soundManager.playRocketSound();
      }
      triggerScore('rocket');
    }, 850);

    return () => {
      clearInterval(interval);
    };
  }, [isAutoDisplayRunning, isAutoDisplayPaused, selectedColorId, selectedPatternId, soundEnabled, getRandomColorForOption, triggerScore]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = isFullscreen ? window.innerHeight - 100 : 480;
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;

    const drawSkyline = (w: number, h: number) => {
      // Dark city silhouette base
      ctx.fillStyle = '#090B18';
      ctx.beginPath();
      // Silhouettes of buildings and temples
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 40);
      ctx.lineTo(40, h - 40);
      ctx.lineTo(40, h - 70);
      ctx.lineTo(60, h - 90); // Temple dome peak
      ctx.lineTo(80, h - 70);
      ctx.lineTo(80, h - 45);
      ctx.lineTo(140, h - 45);
      ctx.lineTo(140, h - 80);
      ctx.lineTo(180, h - 80);
      ctx.lineTo(180, h - 35);
      ctx.lineTo(240, h - 35);
      ctx.lineTo(260, h - 65);
      ctx.lineTo(280, h - 35);
      ctx.lineTo(340, h - 35);
      ctx.lineTo(340, h - 100); // Tower
      ctx.lineTo(370, h - 100);
      ctx.lineTo(370, h - 30);
      ctx.lineTo(430, h - 30);
      ctx.lineTo(450, h - 75); // Minaret
      ctx.lineTo(470, h - 30);
      ctx.lineTo(550, h - 30);
      ctx.lineTo(550, h - 85);
      ctx.lineTo(600, h - 85);
      ctx.lineTo(600, h - 40);
      ctx.lineTo(w, h - 40);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Glowing warm window lights
      ctx.fillStyle = 'rgba(255, 209, 102, 0.45)';
      for (let bx = 15; bx < w; bx += 35) {
        if (Math.sin(bx) > 0) {
          ctx.fillRect(bx, h - 30, 4, 6);
          ctx.fillRect(bx + 12, h - 50, 4, 6);
        }
      }
    };

    const render = () => {
      // Fade sky background with slight trail
      ctx.fillStyle = 'rgba(15, 17, 38, 0.26)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw skyline silhouette
      drawSkyline(canvas.width, canvas.height);

      // 1. Fuljhuri (Sparkler Cursor Effect)
      if (fuljhuriActiveRef.current && fuljhuriPosRef.current) {
        const { x, y } = fuljhuriPosRef.current;
        const color = getRandomColorForOption(selectedColorId);
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = Math.random() * 4 + 1;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color,
            alpha: 1,
            decay: Math.random() * 0.04 + 0.03,
            size: Math.random() * 2.5 + 1,
            sparkle: true,
          });
        }
      }

      // 2. Active Anar Fountains
      for (let i = activeAnarsRef.current.length - 1; i >= 0; i--) {
        const anar = activeAnarsRef.current[i];
        anar.life++;

        // Shoot upward spark fountain
        const intensity = Math.sin((anar.life / anar.maxLife) * Math.PI);
        const sparkCount = Math.floor(6 * intensity) + 2;

        for (let k = 0; k < sparkCount; k++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.55;
          const speed = (Math.random() * 9 + 4) * intensity;
          particlesRef.current.push({
            x: anar.x + (Math.random() - 0.5) * 6,
            y: anar.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: Math.random() > 0.25 ? anar.color : '#FFF1D6',
            alpha: 1,
            decay: Math.random() * 0.025 + 0.02,
            size: Math.random() * 3 + 1.2,
            sparkle: true,
          });
        }

        if (anar.life >= anar.maxLife) {
          activeAnarsRef.current.splice(i, 1);
        }
      }

      // 3. Active Chakri Ground Spinners
      for (let i = activeChakrisRef.current.length - 1; i >= 0; i--) {
        const chakri = activeChakrisRef.current[i];
        chakri.life++;
        chakri.angle += 0.35;

        // Draw spinner core
        ctx.save();
        ctx.translate(chakri.x, chakri.y);
        ctx.rotate(chakri.angle);
        ctx.fillStyle = chakri.color;
        ctx.fillRect(-10, -10, 20, 20);
        ctx.restore();

        // Emit spiral sparks
        for (let arm = 0; arm < 3; arm++) {
          const a = chakri.angle + (arm * Math.PI * 2) / 3;
          const speed = 4 + Math.random() * 3;
          particlesRef.current.push({
            x: chakri.x,
            y: chakri.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            color: Math.random() > 0.3 ? chakri.color : '#FFB000',
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02,
            size: Math.random() * 2.5 + 1.2,
          });
        }

        if (chakri.life >= chakri.maxLife) {
          activeChakrisRef.current.splice(i, 1);
        }
      }

      // 4. Active Visual Bombs (3-2-1 Countdown)
      for (let i = activeBombsRef.current.length - 1; i >= 0; i--) {
        const bomb = activeBombsRef.current[i];
        bomb.timer++;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FF5722';
        ctx.font = '900 24px sans-serif';

        if (bomb.timer < 30) {
          ctx.fillText('3', bomb.x, bomb.y);
        } else if (bomb.timer < 60) {
          ctx.fillText('2', bomb.x, bomb.y);
        } else if (bomb.timer < 90) {
          ctx.fillText('1', bomb.x, bomb.y);
        } else {
          // BOOM visual burst!
          triggerBombExplosion(bomb.x, bomb.y);
          activeBombsRef.current.splice(i, 1);
        }
        ctx.restore();
      }

      // 5. Rockets Ascending
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.y += r.vy;

        // Smoke & spark trail behind rocket
        particlesRef.current.push({
          x: r.x + (Math.random() - 0.5) * 3,
          y: r.y + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 1 + 0.5,
          color: '#FFF1D6',
          alpha: 0.8,
          decay: 0.05,
          size: 2,
        });

        // Check if reached apex
        if (r.y <= r.targetY) {
          triggerShapeExplosion(r.x, r.y, r.color, r.shape);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 6. Particles Physics & Render
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045; // Gravity
        p.vx *= 0.98; // Air resistance drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.sparkle ? 10 : 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isFullscreen, getRandomColorForOption, selectedColorId]);

  // Shape Explosion Trigger
  const triggerShapeExplosion = (x: number, y: number, color: string, shape: FireworkShape) => {
    if (soundEnabled) {
      soundManager.playFirework();
    }
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 100);

    const patternPoints = generateFireworkPatternPoints(shape, 85, 5.5);
    patternPoints.forEach((pt) => {
      particlesRef.current.push({
        x,
        y,
        vx: pt.vx,
        vy: pt.vy,
        color: pt.colorOffset === 1 ? '#FFD166' : pt.colorOffset === 2 ? '#FFF1D6' : color,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 3 + 1.5,
        sparkle: true,
      });
    });
  };

  // Bomb BOOM Explosion Trigger
  const triggerBombExplosion = (x: number, y: number) => {
    if (soundEnabled) {
      soundManager.playBombSound();
    }
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 180);

    const burstColor = getRandomColorForOption(selectedColorId);

    // Shockwave particles ring
    for (let i = 0; i < 90; i++) {
      const angle = (i * Math.PI * 2) / 90;
      const speed = Math.random() * 8 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? burstColor : '#FFB000',
        alpha: 1,
        decay: 0.025,
        size: 3.5,
        sparkle: true,
      });
    }

    triggerScore('bomb');
  };

  // Handle Canvas Interaction depending on selected firecracker
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const activeColor = getRandomColorForOption(selectedColorId);

    if (selectedType === 'fuljhuri') {
      fuljhuriActiveRef.current = true;
      fuljhuriPosRef.current = { x, y };
      if (soundEnabled) soundManager.playFuljhuriSound();
      triggerScore('fuljhuri');
      return;
    }

    if (selectedType === 'anar') {
      activeAnarsRef.current.push({
        x,
        y: Math.min(y, canvas.height - 35),
        life: 0,
        maxLife: 100,
        color: activeColor,
      });
      if (soundEnabled) soundManager.playAnarSound();
      triggerScore('anar');
      return;
    }

    if (selectedType === 'chakri') {
      activeChakrisRef.current.push({
        x,
        y: Math.min(y, canvas.height - 35),
        angle: 0,
        life: 0,
        maxLife: 90,
        color: activeColor,
      });
      if (soundEnabled) soundManager.playChakriSound();
      triggerScore('chakri');
      return;
    }

    if (selectedType === 'bomb') {
      activeBombsRef.current.push({
        x,
        y,
        countdown: 3,
        timer: 0,
      });
      if (soundEnabled) soundManager.playClick();
      return;
    }

    if (selectedType === 'rocket') {
      rocketsRef.current.push({
        x,
        y: canvas.height - 30,
        targetY: Math.max(50, y),
        vy: -11 - Math.random() * 4,
        color: activeColor,
        shape: selectedPatternId,
      });
      if (soundEnabled) soundManager.playRocketSound();
      triggerScore('rocket');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fuljhuriActiveRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    fuljhuriPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCanvasMouseUp = () => {
    fuljhuriActiveRef.current = false;
    fuljhuriPosRef.current = null;
  };

  // Display Controls Handlers
  const handleStartDisplay = () => {
    setIsAutoDisplayRunning(true);
    setIsAutoDisplayPaused(false);
  };

  const handlePauseResumeDisplay = () => {
    setIsAutoDisplayPaused((prev) => !prev);
  };

  const handleStopDisplay = () => {
    setIsAutoDisplayRunning(false);
    setIsAutoDisplayPaused(false);
    handleClearCanvas();
  };

  // Grand Finale Launcher
  const handleGrandFinale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (soundEnabled) {
      soundManager.playRevealCelebration();
    }

    const shapes = PATTERN_OPTIONS.map((p) => p.id);

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const x = Math.random() * (canvas.width - 200) + 100;
        const targetY = Math.random() * 180 + 60;
        const color = getRandomColorForOption(selectedColorId);
        const shape = shapes[i % shapes.length];

        rocketsRef.current.push({
          x,
          y: canvas.height - 30,
          targetY,
          vy: -12 - Math.random() * 3,
          color,
          shape,
        });
      }, i * 150);
    }

    triggerScore('grand_finale');
  };

  const handleClearCanvas = () => {
    particlesRef.current = [];
    rocketsRef.current = [];
    activeAnarsRef.current = [];
    activeChakrisRef.current = [];
    activeBombsRef.current = [];
  };

  return (
    <section id="fireworks" className="relative w-full py-20 px-4 bg-gradient-to-b from-[#0B1021] via-[#141C38] to-[#0B1021] overflow-hidden">
      {/* Background Atmosphere Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-[#004D54]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Screen Flash Overlay */}
      {screenFlash && (
        <div className="absolute inset-0 bg-[#E5C158]/15 pointer-events-none transition-opacity duration-100 z-20" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141C38]/90 border border-[#D4AF37]/35 text-[#E5C158] text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-4 h-4 text-[#E5C158]" />
            <span>Interactive Pyrotechnics & Digital Display Stage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-royal-gold-gradient glow-royal-gold mb-3">
            Digital Fireworks Display
          </h2>

          <p className="text-sm sm:text-base text-[#FFF8E7]/80 max-w-2xl mx-auto font-light">
            Customise your fireworks colours, explosion patterns, and background music, then launch or start a continuous digital light show!
          </p>
        </div>

        {/* Score & Rank HUD Bar with Madhubani Framing */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#240A10]/95 via-[#1B070B]/95 to-[#120508]/95 border-[3px] border-[#211A17] shadow-folk-3d backdrop-blur-sm text-[#FFF8E7] overflow-hidden">
          <div className="absolute inset-1.5 rounded-[12px] border border-[#E8B947]/50 pointer-events-none" />
          <MadhubaniCorner position="top-left" size={26} />
          <MadhubaniCorner position="top-right" size={26} />
          <MadhubaniCorner position="bottom-left" size={26} />
          <MadhubaniCorner position="bottom-right" size={26} />

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#A82420] to-[#E8B947] border border-[#FFF8E7]/50 text-[#211A17] shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#E8B947] uppercase tracking-wider font-bold font-serif">Mithila Rank & Title</div>
              <div className="text-base sm:text-lg font-extrabold text-royal-gold-gradient font-serif">{rankTitle}</div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] text-[#E8B947] uppercase tracking-wider font-bold font-serif">Creativity Score</div>
              <div className="text-xl sm:text-2xl font-black text-[#E8B947] font-mono">{score.toLocaleString()}</div>
            </div>

            {comboMultiplier > 1 && (
              <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#A82420] to-[#E8B947] text-[#211A17] font-black text-xs animate-bounce shadow-lg border border-[#FFF8E7]/60">
                {comboMultiplier}x COMBO!
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMISATION PANELS CONTAINER */}
        <MadhubaniBox variant="maroon" className="p-5 sm:p-7 space-y-6" cornerSize={36}>
          {/* 1. FIREWORK COLOUR SELECTION */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#E8B947]" />
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-[#E8B947]">
                1. Firework Colour Selection
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_OPTIONS.map((col) => {
                const isSelected = selectedColorId === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      setSelectedColorId(col.id);
                      if (soundEnabled) soundManager.playClick();
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-2 ${
                      isSelected
                        ? 'border-[#E8B947] bg-[#140609] text-[#FFF8E7] shadow-[0_0_15px_rgba(232,185,71,0.4)] scale-105'
                        : 'border-[#211A17] bg-[#140609]/60 text-[#FFF8E7]/75 hover:border-[#E8B947]/50'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm bg-gradient-to-r ${col.swatchGradient}`}
                    />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <MadhubaniDivider className="my-2" />

          {/* 2. FIREWORK PATTERN SELECTION */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Grid className="w-4 h-4 text-[#E8B947]" />
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-[#E8B947]">
                2. Firework Pattern Selection
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PATTERN_OPTIONS.map((pat) => {
                const isSelected = selectedPatternId === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatternId(pat.id);
                      setSelectedType('rocket'); // Set active cracker mode to Rocket when choosing custom pattern
                      if (soundEnabled) soundManager.playClick();
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E8B947] bg-gradient-to-br from-[#3D140C] to-[#1F070A] text-[#FFF8E7] shadow-[0_0_15px_rgba(232,185,71,0.4)] scale-[1.02]'
                        : 'border-[#211A17] bg-[#140609]/70 text-[#FFF8E7]/75 hover:border-[#E8B947]/50'
                    }`}
                  >
                    <div className="text-xl mb-1">{pat.icon}</div>
                    <div>
                      <div className="font-serif font-bold text-xs text-[#FFF8E7]">{pat.name}</div>
                      <div className="text-[10px] text-[#E8B947] font-serif">{pat.hindiName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <MadhubaniDivider className="my-2" />

          {/* 3. BACKGROUND MUSIC SELECTION */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-[#E8B947]" />
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-[#E8B947]">
                3. Background Music Selection
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {MUSIC_OPTIONS.map((mus) => {
                const isSelected = selectedMusicId === mus.id;
                return (
                  <button
                    key={mus.id}
                    onClick={() => handleMusicChange(mus.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-[#E8B947] bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] text-[#211A17] font-bold shadow-[0_0_15px_rgba(232,185,71,0.4)]'
                        : 'border-[#211A17] bg-[#140609]/70 text-[#FFF8E7]/80 hover:border-[#E8B947]/50'
                    }`}
                  >
                    <span className="text-lg shrink-0">{mus.icon}</span>
                    <div className="overflow-hidden">
                      <div className="font-serif text-xs truncate leading-tight">{mus.name}</div>
                      <div className={`text-[10px] font-serif truncate ${isSelected ? 'text-[#211A17]/80' : 'text-[#E8B947]'}`}>
                        {mus.hindiName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </MadhubaniBox>

        {/* 5 Traditional Cracker Types Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {FIRECRACKER_TYPES.map((fc) => {
            const isSelected = selectedType === fc.id;
            return (
              <button
                key={fc.id}
                onClick={() => {
                  setSelectedType(fc.id);
                  if (soundEnabled) soundManager.playClick();
                }}
                className={`group relative p-3.5 rounded-2xl border-[2.5px] text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#3D140C] to-[#1F070A] border-[#E8B947] shadow-[0_0_20px_rgba(232,185,71,0.45)] scale-102 z-10'
                    : 'bg-[#140609]/85 border-[#211A17] hover:border-[#E8B947]/70 hover:bg-[#1A0A0E]'
                }`}
              >
                {isSelected && (
                  <div className="absolute inset-1 rounded-xl border border-[#E8B947]/40 pointer-events-none" />
                )}
                <div>
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow">{fc.icon}</div>
                  <div className="font-bold font-serif text-xs sm:text-sm text-[#FFF8E7]">{fc.name}</div>
                  <div className="text-[10px] font-medium text-[#E8B947] font-serif">{fc.hindi}</div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#FFF8E7]/75 border-t border-[#E8B947]/20 pt-1.5 font-mono">
                  <span>+{fc.points} Pts</span>
                  <Flame className="w-3.5 h-3.5 text-[#A82420]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Sky Interactive Stage with Madhubani Double Border */}
        <div
          className={`relative rounded-3xl overflow-hidden border-[3.5px] border-[#211A17] bg-[#0A0305] shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] ${
            isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[480px]'
          }`}
        >
          {/* Inner Double Gold Hairline */}
          <div className="absolute inset-2 rounded-[20px] border border-[#E8B947]/40 pointer-events-none z-20" />
          <MadhubaniCorner position="top-left" size={28} className="z-30" />
          <MadhubaniCorner position="top-right" size={28} className="z-30" />
          <MadhubaniCorner position="bottom-left" size={28} className="z-30" />
          <MadhubaniCorner position="bottom-right" size={28} className="z-30" />

          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full h-full block cursor-crosshair"
          />

          {/* Active Mode Banner Top Left */}
          <div className="absolute top-4 left-4 pointer-events-none z-30">
            <div className="flex items-center gap-2 bg-[#140609]/90 px-3.5 py-1.5 rounded-xl border border-[#E8B947]/50 text-xs text-[#FFF8E7] backdrop-blur-md shadow-md">
              <span className="text-base">
                {FIRECRACKER_TYPES.find((t) => t.id === selectedType)?.icon}
              </span>
              <span className="font-bold font-serif text-[#E8B947]">
                Mode: {FIRECRACKER_TYPES.find((t) => t.id === selectedType)?.name}
              </span>
            </div>
          </div>

          {/* DISPLAY CONTROLS TOOLBAR OVERLAY TOP RIGHT */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-30">
            {/* Start Fireworks Display Button */}
            {!isAutoDisplayRunning ? (
              <button
                onClick={handleStartDisplay}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] text-[#211A17] font-bold text-xs hover:scale-105 transition-all cursor-pointer shadow-md flex items-center gap-1.5 border border-[#FFF8E7]/40"
                title="Start Continuous Fireworks Display"
              >
                <Play className="w-3.5 h-3.5 fill-[#211A17]" />
                <span className="hidden sm:inline">Start Display</span>
              </button>
            ) : (
              <>
                {/* Pause / Resume Button */}
                <button
                  onClick={handlePauseResumeDisplay}
                  className="px-3.5 py-2 rounded-xl bg-[#140609]/90 border-2 border-[#E8B947] text-[#E8B947] font-bold text-xs hover:scale-105 transition-all cursor-pointer backdrop-blur-md shadow-md flex items-center gap-1.5"
                  title={isAutoDisplayPaused ? 'Resume Display' : 'Pause Display'}
                >
                  {isAutoDisplayPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-[#E8B947]" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-[#E8B947]" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                {/* Stop Button */}
                <button
                  onClick={handleStopDisplay}
                  className="px-3 py-2 rounded-xl bg-[#A82420] border border-[#FFF8E7]/40 text-[#FFF8E7] font-bold text-xs hover:scale-105 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  title="Stop Display"
                >
                  <Square className="w-3.5 h-3.5 fill-[#FFF8E7]" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              </>
            )}

            {/* Clear Canvas */}
            <button
              onClick={handleClearCanvas}
              className="p-2 rounded-xl bg-[#140609]/90 border border-[#E8B947]/50 text-[#FFF8E7] hover:border-[#E8B947] hover:text-[#E8B947] transition-all cursor-pointer backdrop-blur-md shadow-md"
              title="Clear Canvas Sparks"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Music / Audio Toggle */}
            <button
              onClick={() => soundManager.toggleMute()}
              className="p-2 rounded-xl bg-[#140609]/90 border border-[#E8B947]/50 text-[#FFF8E7] hover:border-[#E8B947] transition-all cursor-pointer backdrop-blur-md shadow-md"
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#E8B947]" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-[#140609]/90 border border-[#E8B947]/50 text-[#FFF8E7] hover:border-[#E8B947] transition-all cursor-pointer backdrop-blur-md shadow-md"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#E8B947]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#E8B947]" />
              )}
            </button>
          </div>
        </div>

        {/* Action Controls & Spectacle CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleGrandFinale}
            className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] text-[#211A17] font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(232,185,71,0.5)] hover:shadow-[0_0_50px_rgba(232,185,71,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-2 border-[#211A17]"
          >
            <Sparkles className="w-5 h-5 text-[#211A17] group-hover:rotate-45 transition-transform" />
            <span className="font-serif">GRAND FINALE SPECTACLE 🎆</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-[#FFF8E7]/60 mt-4 italic font-serif">
          *Safe, digital-only festive pyrotechnic simulation designed exclusively for joyful online Diwali celebration.
        </p>
      </div>
    </section>
  );
};


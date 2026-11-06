import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Rocket as RocketIcon, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, Flame, Trophy, Play } from 'lucide-react';
import { soundManager } from '../utils/audio';
import {
  calculateFirecrackerScore,
  generateFireworkPatternPoints,
  FireworkShape,
} from '../utils/gameLogic';

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

const FIREWORK_COLORS = [
  '#FF2E88', // Hot Pink
  '#E63946', // Sindoor Red
  '#FF5722', // Vermilion Orange
  '#FFB000', // Marigold Yellow
  '#20C9C3', // Turquoise
  '#3478F6', // Electric Blue
  '#2E9D50', // Leaf Green
  '#E91E63', // Rani Pink
  '#FFF1D6', // Warm Gold
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
    description: 'Launches skyward and explodes into chrysanthemums, stars & spirals.',
    points: 50,
    color: '#3478F6',
  },
];

export const FirecrackerSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedType, setSelectedType] = useState<FirecrackerType>('anar');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = isFullscreen ? window.innerHeight - 100 : 500;
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
        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
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
  }, [isFullscreen]);

  // Shape Explosion Trigger
  const triggerShapeExplosion = (x: number, y: number, color: string, shape: FireworkShape) => {
    if (soundEnabled) {
      soundManager.playFirework();
    }
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 100);

    const patternPoints = generateFireworkPatternPoints(shape, 80, 5.5);
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

    // Shockwave particles ring
    for (let i = 0; i < 90; i++) {
      const angle = (i * Math.PI * 2) / 90;
      const speed = Math.random() * 8 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#E63946' : '#FFB000',
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
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
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
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
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
      const shapes: FireworkShape[] = ['chrysanthemum', 'ring', 'star', 'spiral', 'shower'];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      rocketsRef.current.push({
        x,
        y: canvas.height - 30,
        targetY: Math.max(50, y),
        vy: -11 - Math.random() * 4,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        shape: randomShape,
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

  // Grand Finale Launcher
  const handleGrandFinale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (soundEnabled) {
      soundManager.playRevealCelebration();
    }

    const shapes: FireworkShape[] = ['chrysanthemum', 'ring', 'star', 'spiral', 'shower'];

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = Math.random() * (canvas.width - 200) + 100;
        const targetY = Math.random() * 180 + 60;
        const color = FIREWORK_COLORS[i % FIREWORK_COLORS.length];
        const shape = shapes[i % shapes.length];

        rocketsRef.current.push({
          x,
          y: canvas.height - 30,
          targetY,
          vy: -12 - Math.random() * 3,
          color,
          shape,
        });
      }, i * 160);
    }

    triggerScore('grand_finale');
  };

  // Surprise Show Randomizer
  const handleSurpriseShow = () => {
    const randomItem = FIRECRACKER_TYPES[Math.floor(Math.random() * FIRECRACKER_TYPES.length)];
    setSelectedType(randomItem.id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Trigger mock interaction at center
    const x = canvas.width / 2 + (Math.random() - 0.5) * 200;

    if (randomItem.id === 'anar') {
      activeAnarsRef.current.push({
        x,
        y: canvas.height - 40,
        life: 0,
        maxLife: 100,
        color: randomItem.color,
      });
      if (soundEnabled) soundManager.playAnarSound();
      triggerScore('anar');
    } else if (randomItem.id === 'rocket') {
      rocketsRef.current.push({
        x,
        y: canvas.height - 30,
        targetY: 100,
        vy: -12,
        color: randomItem.color,
        shape: 'star',
      });
      if (soundEnabled) soundManager.playRocketSound();
      triggerScore('rocket');
    } else if (randomItem.id === 'chakri') {
      activeChakrisRef.current.push({
        x,
        y: canvas.height - 40,
        angle: 0,
        life: 0,
        maxLife: 90,
        color: randomItem.color,
      });
      if (soundEnabled) soundManager.playChakriSound();
      triggerScore('chakri');
    } else {
      handleGrandFinale();
    }
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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141C38]/90 border border-[#D4AF37]/35 text-[#E5C158] text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-4 h-4 text-[#E5C158]" />
            <span>Interactive Pyrotechnics Stage</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold font-serif text-royal-gold-gradient glow-royal-gold mb-3">
            Diwali Firecracker Simulator
          </h2>

          <p className="text-sm sm:text-base text-[#FFF8E7]/80 max-w-2xl mx-auto">
            Choose your traditional Diwali firecracker below, then tap or draw anywhere on the dark night sky to launch eco-friendly digital light shows!
          </p>
        </div>

        {/* Score & Rank HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-6 rounded-2xl bg-[#0B1021]/90 border border-[#D4AF37]/30 shadow-md backdrop-blur-sm text-[#FFF8E7]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#FFF1D6]/70 uppercase tracking-wider font-semibold">Rank & Title</div>
              <div className="text-sm sm:text-base font-extrabold text-[#FFB000]">{rankTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-[#FFF1D6]/70 uppercase tracking-wider font-semibold">Creativity Score</div>
              <div className="text-xl sm:text-2xl font-black text-[#20C9C3]">{score.toLocaleString()}</div>
            </div>

            {comboMultiplier > 1 && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2E88] to-[#FF5722] text-[#0F1126] font-black text-xs animate-bounce shadow-lg">
                {comboMultiplier}x COMBO!
              </div>
            )}
          </div>
        </div>

        {/* 5 Firecracker Selection Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {FIRECRACKER_TYPES.map((fc) => {
            const isSelected = selectedType === fc.id;
            return (
              <button
                key={fc.id}
                onClick={() => {
                  setSelectedType(fc.id);
                  if (soundEnabled) soundManager.playClick();
                }}
                className={`group relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1B254B] to-[#0F1126] border-[#FFB000] shadow-[0_0_25px_rgba(255,176,0,0.4)] scale-105 z-10'
                    : 'bg-[#160B2B]/70 border-[#008C95]/30 hover:border-[#20C9C3]/60 hover:bg-[#160B2B]'
                }`}
              >
                <div>
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{fc.icon}</div>
                  <div className="font-extrabold text-sm text-[#FFF1D6]">{fc.name}</div>
                  <div className="text-[11px] font-medium text-[#20C9C3]">{fc.hindi}</div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-[#FFF1D6]/60 border-t border-white/10 pt-2">
                  <span>+{fc.points} Pts</span>
                  <Flame className="w-3 h-3 text-[#FF5722]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Sky Interactive Stage */}
        <div
          className={`relative rounded-3xl overflow-hidden border-2 border-[#008C95]/60 bg-[#0F1126] shadow-[0_0_50px_rgba(0,140,149,0.35)] ${
            isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[460px]'
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full h-full block cursor-crosshair"
          />

          {/* Controls Bar Overlay Top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 bg-[#0F1126]/90 px-3.5 py-1.5 rounded-full border border-[#008C95]/40 text-xs text-[#FFF1D6] backdrop-blur-md shadow-md">
              <span className="text-base">
                {FIRECRACKER_TYPES.find((t) => t.id === selectedType)?.icon}
              </span>
              <span className="font-bold text-[#FFB000]">
                Active Mode: {FIRECRACKER_TYPES.find((t) => t.id === selectedType)?.name}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleClearCanvas}
                className="p-2 rounded-full bg-[#0F1126]/90 border border-[#008C95]/50 text-[#FFF1D6] hover:border-[#FFB000] hover:text-[#FFB000] transition-all cursor-pointer backdrop-blur-md shadow-md"
                title="Clear Canvas Sparks"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full bg-[#0F1126]/90 border border-[#008C95]/50 text-[#FFF1D6] hover:border-[#FFB000] transition-all cursor-pointer backdrop-blur-md shadow-md"
                title={soundEnabled ? 'Mute Pyrotechnic Sounds' : 'Enable Pyrotechnic Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FFB000]" /> : <VolumeX className="w-4 h-4 text-red-400" />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full bg-[#0F1126]/90 border border-[#008C95]/50 text-[#FFF1D6] hover:border-[#20C9C3] transition-all cursor-pointer backdrop-blur-md shadow-md"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#20C9C3]" /> : <Maximize2 className="w-4 h-4 text-[#20C9C3]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls & Spectacle CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleGrandFinale}
            className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF2E88] via-[#FF5722] to-[#FFB000] text-[#0F1126] font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(255,46,136,0.5)] hover:shadow-[0_0_50px_rgba(255,176,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#0F1126] group-hover:rotate-45 transition-transform" />
            <span>GRAND FINALE SPECTACLE 🎆</span>
          </button>

          <button
            onClick={handleSurpriseShow}
            className="px-6 py-3.5 rounded-full bg-[#160B2B] border border-[#20C9C3]/50 text-[#20C9C3] font-bold text-sm hover:border-[#FFB000] hover:text-[#FFB000] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4" />
            <span>Surprise Show Randomizer</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-[#FFF1D6]/50 mt-4 italic">
          *Safe, digital-only festive pyrotechnic simulation designed exclusively for joyful online Diwali celebration.
        </p>
      </div>
    </section>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Rocket } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

interface RocketItem {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
}

const FIREWORK_COLORS = [
  '#FFD166', // Gold
  '#FF5A1F', // Orange
  '#A51C69', // Magenta
  '#7209B7', // Violet
  '#00B4D8', // Electric Blue
  '#F72585', // Pink
  '#06D6A0', // Emerald Green
];

export const FirecrackerSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenFlash, setScreenFlash] = useState(false);
  const [fireworkCount, setFireworkCount] = useState(0);

  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<RocketItem[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = 480;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const render = () => {
      // Dark sky trail background effect
      ctx.fillStyle = 'rgba(22, 11, 43, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & draw rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.y += r.vy;

        // Draw rocket trail spark
        ctx.fillStyle = '#FFF1D6';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Check if rocket reached target burst height
        if (r.y <= r.targetY) {
          // Explode into particles!
          createExplosion(r.x, r.y, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // Update & draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.98; // Drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    if (soundEnabled) {
      soundManager.playFirework();
    }

    // Trigger subtle screen glow
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 120);

    const count = 70 + Math.floor(Math.random() * 50);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? color : '#FFD166',
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 3 + 1.5,
      });
    }

    setFireworkCount((prev) => prev + 1);
  };

  const launchRocket = (targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = targetX !== undefined ? targetX : Math.random() * (canvas.width - 200) + 100;
    const finalY = targetY !== undefined ? targetY : Math.random() * 180 + 80;
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      targetY: finalY,
      vy: -11 - Math.random() * 4,
      color,
    });
  };

  const handleBurstMultiple = () => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => launchRocket(), i * 180);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    launchRocket(x, y);
  };

  return (
    <section id="fireworks" className="relative w-full py-24 px-4 bg-[#160B2B] overflow-hidden">
      {/* Screen Flash Glow Effect */}
      {screenFlash && (
        <div className="absolute inset-0 bg-[#FFD166]/15 pointer-events-none transition-opacity duration-100 z-20" />
      )}

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Section Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#38145E] border border-[#FFD166]/30 text-[#FFD166] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span>Digital Firecracker Simulator</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold font-serif text-gold-gradient glow-gold-text mb-3">
            Light Up The Night!
          </h2>

          <p className="text-sm sm:text-base text-[#FFF1D6]/80 max-w-xl mx-auto">
            Click anywhere on the dark sky below or press the burst button to launch brilliant, eco-friendly digital fireworks!
          </p>
        </div>

        {/* Sky Canvas Container */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#A51C69]/40 bg-[#160B2B] shadow-[0_0_40px_rgba(165,28,105,0.25)] mb-8 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-[400px] sm:h-[480px] block"
          />

          {/* Helper Instruction Overlay */}
          <div className="absolute top-4 left-4 text-xs font-medium text-[#FFF1D6]/60 pointer-events-none flex items-center gap-1.5 bg-[#160B2B]/80 px-3 py-1.5 rounded-full border border-[#A51C69]/30">
            <Rocket className="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span>Click on sky to target firework launch</span>
          </div>

          {/* Firework Audio Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#38145E]/80 border border-[#A51C69]/50 text-[#FFF1D6] hover:border-[#FFD166] transition-all z-20"
            title={soundEnabled ? "Mute Firework Sounds" : "Enable Firework Sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FFD166]" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>

        {/* Main Action Launch CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleBurstMultiple}
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#FF5A1F] via-[#FF9F1C] to-[#FFD166] text-[#160B2B] font-extrabold text-lg sm:text-xl shadow-[0_0_30px_rgba(255,90,31,0.6)] hover:shadow-[0_0_50px_rgba(255,159,28,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-[#160B2B] group-hover:rotate-45 transition-transform" />
            <span>LIGHT UP THE SKY 🎆</span>
          </button>

          {fireworkCount > 0 && (
            <div className="text-xs text-[#FFD166] font-semibold px-4 py-2 rounded-full bg-[#38145E]/60 border border-[#A51C69]/30">
              Total Sky Bursts: <span className="text-white font-bold">{fireworkCount}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#FFF1D6]/50 mt-4 italic">
          *Eco-friendly digital fireworks simulation celebrating Diwali safely and sustainably.
        </p>
      </div>
    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Compass, Heart, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MadhubaniCorner, MadhubaniDivider } from './MadhubaniCard';

interface FinalSectionProps {
  onRestartExperience: () => void;
  onBackToCorridor?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  type: 'petal' | 'ember' | 'spark';
}

interface FireworkBurst {
  x: number;
  y: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    decay: number;
    size: number;
  }>;
}

export const FinalSection: React.FC<FinalSectionProps> = ({
  onRestartExperience,
  onBackToCorridor,
}) => {
  const [revealPhase, setRevealPhase] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play celebration audio and initiate progressive cinematic staged reveal
  useEffect(() => {
    soundManager.setScene('final-thankyou');
    soundManager.playRevealCelebration();

    const t1 = setTimeout(() => setRevealPhase(1), 300);
    const t2 = setTimeout(() => setRevealPhase(2), 900);
    const t3 = setTimeout(() => setRevealPhase(3), 1700);
    const t4 = setTimeout(() => setRevealPhase(4), 2500);
    const t5 = setTimeout(() => setRevealPhase(5), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Subtle canvas for distant celebratory fireworks, drifting marigold petals and warm dust
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const fireworks: FireworkBurst[] = [];

    const petalColors = ['#FF9800', '#FFB74D', '#E91E63', '#E63946', '#D4AF37', '#FF5722'];
    const fireworkColors = ['#E5C158', '#FFB74D', '#008C95', '#E91E63', '#20C9C3', '#FF5722'];

    // Spawn falling petals and rising glowing embers
    const spawnDriftParticles = () => {
      if (particles.length < 55) {
        const isPetal = Math.random() > 0.45;
        particles.push({
          x: Math.random() * width,
          y: isPetal ? -20 : height + 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: isPetal ? 0.6 + Math.random() * 1.2 : -(0.4 + Math.random() * 0.8),
          size: isPetal ? 6 + Math.random() * 8 : 1.5 + Math.random() * 2.5,
          color: isPetal ? petalColors[Math.floor(Math.random() * petalColors.length)] : '#FFB74D',
          alpha: isPetal ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 0.4,
          decay: isPetal ? 0.001 : 0.004,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          type: isPetal ? 'petal' : 'ember',
        });
      }
    };

    // Occasional distant fireworks blossoming softly in the deep night sky
    let lastFireworkTime = Date.now();
    const spawnSubtleFirework = () => {
      const now = Date.now();
      if (now - lastFireworkTime > 2400) {
        lastFireworkTime = now;
        const fx = width * (0.15 + Math.random() * 0.7);
        const fy = height * (0.12 + Math.random() * 0.35);
        const count = 36 + Math.floor(Math.random() * 24);
        const burstColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        const burstParticles = [];

        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.2;
          const speed = 1.2 + Math.random() * 2.8;
          burstParticles.push({
            x: fx,
            y: fy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: burstColor,
            alpha: 0.9,
            decay: 0.012 + Math.random() * 0.01,
            size: 2 + Math.random() * 2.5,
          });
        }
        fireworks.push({ x: fx, y: fy, particles: burstParticles });
      }
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      spawnDriftParticles();
      spawnSubtleFirework();

      // Render & update subtle fireworks
      for (let f = fireworks.length - 1; f >= 0; f--) {
        const fw = fireworks[f];
        for (let p = fw.particles.length - 1; p >= 0; p--) {
          const pt = fw.particles[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.025; // soft gravity
          pt.vx *= 0.985;
          pt.vy *= 0.985;
          pt.alpha -= pt.decay;

          if (pt.alpha <= 0) {
            fw.particles.splice(p, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (fw.particles.length === 0) {
          fireworks.splice(f, 1);
        }
      }

      // Render & update petals and embers
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(tick * 0.02 + p.y * 0.01) * 0.4;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y > height + 30 || p.y < -30 || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'petal') {
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#FF9800';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRevisit = () => {
    soundManager.playClick();
    onRestartExperience();
  };

  const handleExploreAgain = () => {
    soundManager.playClick();
    if (onBackToCorridor) {
      onBackToCorridor();
    } else {
      window.location.hash = '#corridor';
    }
  };

  // 12 Courtyard Step Diyas surrounding the scene
  const diyas = [
    { label: 'Courtyard Diya 1', delay: '100ms' },
    { label: 'Courtyard Diya 2', delay: '300ms' },
    { label: 'Courtyard Diya 3', delay: '500ms' },
    { label: 'Courtyard Diya 4', delay: '200ms' },
    { label: 'Courtyard Diya 5', delay: '400ms' },
    { label: 'Courtyard Diya 6', delay: '600ms' },
  ];

  return (
    <section className="relative w-full min-h-[85vh] py-10 px-3 sm:px-6 bg-gradient-to-b from-[#070A14] via-[#0B1021] to-[#050811] overflow-hidden flex flex-col justify-between items-center text-center rounded-3xl border-2 border-[#D4AF37]/45 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)]">
      
      {/* 1. Dynamic Canvas for Night Sky Fireworks, Flower Petals & Golden Embers */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 2. Traditional Rajasthani Toran Arch & Mango Leaf Floral Swag */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-2 pointer-events-none">
        <div className="flex items-center justify-between text-[#E5C158] opacity-90 px-4 mb-2">
          <div className="flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.6s' }}>
            <span className="text-xl">🔔</span>
            <span className="text-xs text-[#E5C158] font-serif hidden sm:inline">शुभ</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🪔</span>
            <span className="text-sm font-serif font-bold text-[#FFF8E7] tracking-widest hidden md:inline">
              दीपावली महोत्सवे
            </span>
            <span className="text-2xl animate-pulse">🪔</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
          <div className="flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.2s' }}>
            <span className="text-xs text-[#E5C158] font-serif hidden sm:inline">लाभ</span>
            <span className="text-xl">🔔</span>
          </div>
        </div>

        {/* Decorative Scalloped Arch SVG Garland with Marigold Dots */}
        <div className="w-full h-10 overflow-hidden flex justify-center opacity-85">
          <svg viewBox="0 0 800 40" className="w-full max-w-3xl h-full text-[#D4AF37]">
            <path
              d="M0,5 Q100,32 200,10 Q300,32 400,10 Q500,32 600,10 Q700,32 800,5"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2.5"
            />
            {/* Hanging Marigolds & Mango Leaves */}
            {[50, 150, 250, 350, 450, 550, 650, 750].map((cx, idx) => (
              <g key={idx}>
                <circle cx={cx} cy="22" r="5" fill={idx % 2 === 0 ? '#FF9800' : '#E63946'} />
                <path d={`M${cx},26 Q${cx + 3},34 ${cx},38`} stroke="#2E7D32" strokeWidth="2" fill="none" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 3. Central Staged Message & Folk-Art Plaque */}
      <div className="relative z-10 max-w-4xl mx-auto my-auto w-full py-6 flex flex-col items-center">
        
        {/* Subtle Decorative Kicker */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#004D54]/55 border border-[#D4AF37]/50 text-[#E5C158] text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-700 ${
            revealPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E5C158] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-widest uppercase text-[11px] font-bold">The Eternal Flame of Diwali</span>
          <Sparkles className="w-3.5 h-3.5 text-[#E5C158] animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* PRIMARY THANK YOU MESSAGE */}
        <div
          className={`transition-all duration-1000 ease-out transform ${
            revealPhase >= 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
          }`}
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-royal-gold-gradient glow-royal-gold leading-tight tracking-wide max-w-3xl mx-auto">
            THANK YOU FOR BEING PART OF OUR CELEBRATION
          </h2>

          {/* Decorative Divider with Central Golden Lotus Motif */}
          <div className="flex items-center justify-center gap-4 my-5 w-full max-w-md mx-auto opacity-90">
            <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#E5C158]" />
            <span className="text-2xl text-[#E5C158] filter drop-shadow(0 0 10px rgba(229,193,88,0.7))">🪷</span>
            <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#E5C158]" />
          </div>
        </div>

        {/* HEARTFELT CLOSING WISH */}
        <div
          className={`transition-all duration-1000 delay-150 ease-out ${
            revealPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-base sm:text-xl md:text-2xl font-serif italic text-[#FFF8E7]/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-4 font-light">
            “May the lights of Diwali bring happiness, warmth and countless beautiful memories into your life. Until we celebrate again!”
          </p>
        </div>

        {/* 4. TEAM CREDIT: BUILT WITH PASSION BY BROKEN REPO */}
        <div
          className={`w-full max-w-xl mx-auto mt-10 transition-all duration-1000 ease-out transform ${
            revealPhase >= 4 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
          }`}
        >
          {/* Ornate Madhubani Folk-Art Emblem Box */}
          <div className="relative p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#240A10]/95 via-[#1A060A]/95 to-[#0F0305]/98 border-[3.5px] border-[#211A17] shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(232,185,71,0.35)] overflow-hidden">
            {/* Inner Double Gold Hairline Border */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-[22px] border-2 border-[#E8B947]/70 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-madhubani-katchni opacity-20 pointer-events-none" />

            {/* Corner Madhubani Lotus Spandrels */}
            <MadhubaniCorner position="top-left" size={32} />
            <MadhubaniCorner position="top-right" size={32} />
            <MadhubaniCorner position="bottom-left" size={32} />
            <MadhubaniCorner position="bottom-right" size={32} />

            {/* Team Kicker Heading */}
            <div className="relative z-10 flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#E8B947]" />
              <p className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.28em] text-[#E8B947]">
                BUILT WITH PASSION BY
              </p>
              <span className="w-6 h-[1.5px] bg-[#E8B947]" />
            </div>

            {/* Main Visual Highlight: BROKEN REPO */}
            <div className="relative z-10 my-2 py-1">
              <div className="absolute inset-0 blur-xl bg-[#E8B947]/25 rounded-full pointer-events-none" />
              <h1 className="relative text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-widest text-royal-gold-gradient glow-royal-gold uppercase select-none drop-shadow-[0_0_25px_rgba(232,185,71,0.8)]">
                BROKEN REPO
              </h1>
            </div>

            {/* Subtle Indian Ornamental Detailing (Sahasrara & Tilak Accent) */}
            <div className="relative z-10 flex items-center justify-center gap-3 text-xs text-[#FFF8E7]/85 mt-3 pt-3 border-t-2 border-[#E8B947]/30 font-serif">
              <span className="text-[#A82420]">🪔</span>
              <span>A celebration created with passion & shared with everyone</span>
              <span className="text-[#A82420]">🪔</span>
            </div>
          </div>
        </div>

        {/* 5. Glowing Row of Courtyard Terracotta Diyas */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-6 mt-8 transition-all duration-1000 ${
            revealPhase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {diyas.map((d, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-110"
              style={{ transitionDelay: d.delay }}
            >
              {/* Flickering Golden Flame */}
              <div className="relative w-5 h-7 flex items-center justify-center mb-0.5 animate-flame">
                <div className="absolute inset-0 bg-[#FF9800]/70 rounded-full blur-sm" />
                <div className="w-3 h-5 bg-gradient-to-t from-[#FF5722] via-[#FFB74D] to-[#FFF8E7] rounded-full shadow-[0_0_12px_#E5C158]" />
              </div>
              {/* Terracotta Clay Base */}
              <div className="w-8 h-3.5 rounded-b-full bg-gradient-to-r from-[#A8422B] via-[#C64E22] to-[#6E2008] border-t border-[#D4AF37]/60 shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            </div>
          ))}
        </div>

        {/* 6. ACTION INTERACTIONS: REVISIT THE CELEBRATION & EXPLORE AGAIN */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full max-w-md mx-auto transition-all duration-700 ease-out ${
            revealPhase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          {/* Button 1: Revisit The Celebration */}
          <button
            onClick={handleRevisit}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-xs sm:text-sm tracking-wider uppercase border border-[#FFF8E7]/40 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(229,193,88,0.7)] hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4 text-[#0B1021] group-hover:-rotate-180 transition-transform duration-500" />
            <span>REVISIT THE CELEBRATION</span>
          </button>

          {/* Button 2: Explore Again (Return to Palace Corridor) */}
          <button
            onClick={handleExploreAgain}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-[#0B1021]/90 hover:bg-[#141C38] text-[#FFF8E7] font-bold text-xs sm:text-sm tracking-wider uppercase border border-[#D4AF37]/60 hover:border-[#E5C158] shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Compass className="w-4 h-4 text-[#E5C158] group-hover:rotate-45 transition-transform duration-300" />
            <span>EXPLORE AGAIN</span>
          </button>
        </div>

      </div>

      {/* 7. Bottom Footnote & Aesthetic Border */}
      <div className="relative z-10 w-full pt-6 mt-4 border-t border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FFF8E7]/60 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
          <span className="font-serif font-bold text-[#E5C158]">THE LIGHT WITHIN</span>
          <span>· A Diwali Experience</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#FFF8E7]/70">
          <span>Remembered through a thousand lights</span>
          <Flame className="w-3.5 h-3.5 text-[#FFB74D]" />
        </div>
      </div>

    </section>
  );
};

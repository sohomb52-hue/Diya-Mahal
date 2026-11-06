import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const BigRevealSection: React.FC = () => {
  const [celebratedCount, setCelebratedCount] = useState(0);

  const handleCelebrate = () => {
    soundManager.playRevealCelebration();
    soundManager.playFirework();
    setCelebratedCount((prev) => prev + 1);

    // Trigger spectacular royal festive confetti explosion of antique gold, amber, peacock teal, and terracotta
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#E5C158', '#FFB74D', '#A8422B', '#004D54', '#008C95', '#FFF8E7'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#D4AF37', '#E5C158', '#FFB74D', '#FFF8E7'],
      });
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#004D54', '#008C95', '#A8422B', '#E5C158'],
      });
    }, 200);
  };

  return (
    <section id="reveal" className="relative w-full min-h-[85vh] py-12 md:py-16 px-4 bg-gradient-to-b from-[#0B1021] via-[#141C38] to-[#0A1D26] overflow-hidden flex items-center justify-center">
      {/* 1. Subtle Traditional Courtyard Jaali & Bandhani Overlay */}
      <div className="absolute inset-0 bg-bandhani-pattern opacity-25 pointer-events-none" />

      {/* 2. Indian Palace at Twilight Architectural Silhouettes in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full text-[#D4AF37]">
          {/* Palace Scalloped Cusped Archway Framing */}
          <path
            d="M0,0 L0,800 L120,800 L120,380 C120,240 240,140 380,140 C520,140 640,240 720,320 C800,240 920,140 1060,140 C1200,140 1320,240 1320,380 L1320,800 L1440,800 L1440,0 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          {/* Distant Palace Chhatri Domes */}
          <path
            d="M200,500 L200,320 Q250,230 300,320 L300,500 Z M1140,500 L1140,320 Q1190,230 1240,320 L1240,500 Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Hanging Brass Courtyard Lanterns */}
          <line x1="250" y1="0" x2="250" y2="240" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
          <polygon points="240,240 260,240 255,270 245,270" fill="currentColor" fillOpacity="0.3" />
          <line x1="1190" y1="0" x2="1190" y2="240" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
          <polygon points="1180,240 1200,240 1195,270 1185,270" fill="currentColor" fillOpacity="0.3" />
        </svg>
      </div>

      {/* 3. Subtle Twinkling Twilight Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-[15%] w-1.5 h-1.5 rounded-full bg-[#FFF8E7] animate-twilight-star" />
        <div className="absolute top-28 right-[18%] w-2 h-2 rounded-full bg-[#E5C158] animate-twilight-star" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-44 left-[32%] w-1.5 h-1.5 rounded-full bg-[#FFB74D] animate-twilight-star" style={{ animationDelay: '2.1s' }} />
        <div className="absolute top-36 right-[35%] w-1.5 h-1.5 rounded-full bg-[#FFF8E7] animate-twilight-star" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-20 left-[68%] w-2 h-2 rounded-full bg-[#E5C158] animate-twilight-star" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* 4. Elegant Rotating Antique Gold Rangoli Mandala (Delicate, Non-Overcrowded) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          className="w-[680px] h-[680px] text-[#D4AF37] animate-spin-slow"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="250" cy="250" r="230" stroke="#E5C158" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="185" stroke="#A8422B" strokeWidth="1.2" />
            <circle cx="250" cy="250" r="130" stroke="#D4AF37" />
            <circle cx="250" cy="250" r="65" stroke="#FFF8E7" strokeWidth="1.5" />
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 250 250)`}>
                <path d="M250,20 Q280,105 250,185 Q220,105 250,20" stroke="#E5C158" />
                <circle cx="250" cy="72" r="6" fill="#D4AF37" />
                <path d="M250,185 Q285,215 250,250 Q215,215 250,185" stroke="#A8422B" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* 5. Floating Soft Ambient Amber & Teal Lighting Spheres */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-12 w-64 h-64 rounded-full bg-[#D4AF37]/15 blur-3xl animate-amber-pulse" />
        <div className="absolute top-1/3 right-16 w-72 h-72 rounded-full bg-[#004D54]/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-60 h-60 rounded-full bg-[#A8422B]/18 blur-3xl" />
      </div>

      {/* 6. Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Festive Greeting Header Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#004D54]/45 border border-[#D4AF37]/45 text-[#E5C158] text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md shadow-[0_0_22px_rgba(212,175,55,0.22)]">
          <Sparkles className="w-4 h-4 text-[#E5C158] animate-pulse" />
          <span className="tracking-wide">The Festival of Lights & Royal Blessings</span>
        </div>

        {/* HAPPY DIWALI Heading with Royal Antique Gold Gradient */}
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-serif tracking-wider text-royal-gold-gradient glow-royal-gold mb-6 uppercase leading-none">
          HAPPY DIWALI
        </h2>

        {/* Subtitle Wish */}
        <p className="text-xl sm:text-2xl md:text-3xl font-cormorant text-[#FFF8E7] max-w-2xl mx-auto italic mb-10 leading-relaxed drop-shadow-md">
          "May your world always shine with happiness, colours, and prosperity."
        </p>

        {/* Rajasthani Scallop & Antique Gold Ornament Divider */}
        <div className="flex items-center justify-center gap-4 mb-10 text-[#D4AF37]">
          <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#E5C158]" />
          <div className="w-3.5 h-3.5 rotate-45 border-2 border-[#E5C158] bg-[#A8422B] shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
          <Sparkles className="w-5 h-5 text-[#E5C158]" />
          <div className="w-3.5 h-3.5 rotate-45 border-2 border-[#E5C158] bg-[#A8422B] shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
          <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#E5C158]" />
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleCelebrate}
            className="group relative px-9 py-4 rounded-full bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-lg sm:text-xl border border-[#FFF8E7]/40 shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:shadow-[0_0_50px_rgba(229,193,88,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-[#0B1021] group-hover:rotate-45 transition-transform" />
            <span>Celebrate the Light ✨</span>
          </button>

          {celebratedCount > 0 && (
            <p className="text-xs text-[#E5C158] flex items-center gap-1.5 font-semibold animate-pulse mt-1">
              <Heart className="w-3.5 h-3.5 text-[#A8422B] fill-[#A8422B]" />
              <span>Celebrated {celebratedCount} {celebratedCount === 1 ? 'time' : 'times'}!</span>
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

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

    // Trigger spectacular multi-coloured explosion of pink, saffron, orange, turquoise and red
    confetti({
      particleCount: 140,
      spread: 95,
      origin: { y: 0.6 },
      colors: ['#E91E63', '#FF2E88', '#FFB000', '#FF5722', '#20C9C3', '#E63946', '#FFF1D6'],
      shapes: ['star', 'circle'],
      scalar: 1.25,
    });

    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#E91E63', '#FF2E88', '#FFB000', '#20C9C3'],
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#008C95', '#20C9C3', '#FF5722', '#E63946'],
      });
    }, 200);
  };

  return (
    <section id="reveal" className="relative w-full min-h-screen py-24 px-4 bg-gradient-to-b from-[#0F1126] via-[#1B254B] to-[#004D54] overflow-hidden flex items-center justify-center">
      {/* Traditional Bandhani Textile Texture Overlay */}
      <div className="absolute inset-0 bg-bandhani-pattern opacity-40 pointer-events-none" />

      {/* Decorative Rotating Mandala Background (Turquoise & Marigold) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          className="w-[700px] h-[700px] text-[#20C9C3] animate-spin-slow"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="250" cy="250" r="230" stroke="#FFB000" />
            <circle cx="250" cy="250" r="180" />
            <circle cx="250" cy="250" r="120" stroke="#E91E63" />
            <circle cx="250" cy="250" r="60" />
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 250 250)`}>
                <path d="M250,20 Q280,100 250,180 Q220,100 250,20" />
                <circle cx="250" cy="70" r="8" fill="#FFB000" />
                <path d="M250,180 Q290,210 250,250 Q210,210 250,180" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Floating Lights / Festive Glow Spheres (Rani Pink, Peacock Teal, Marigold) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-10 w-44 h-44 rounded-full bg-[#E91E63]/25 blur-3xl" />
        <div className="absolute top-1/3 right-12 w-56 h-56 rounded-full bg-[#008C95]/30 blur-3xl" />
        <div className="absolute bottom-16 left-1/4 w-48 h-48 rounded-full bg-[#FFB000]/25 blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Festive Greeting Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008C95]/35 border border-[#20C9C3]/50 text-[#FFB000] text-sm font-semibold mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(32,201,195,0.3)]">
          <Sparkles className="w-4 h-4 text-[#20C9C3]" />
          <span>The Festival of Lights & Joy</span>
        </div>

        {/* HAPPY DIWALI Heading with Festival of Colours Gradient */}
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-serif tracking-wider text-festive-gradient glow-festive-text mb-6 uppercase leading-none">
          HAPPY DIWALI
        </h2>

        {/* Subtitle Wish */}
        <p className="text-xl sm:text-2xl md:text-3xl font-cormorant text-[#FFF1D6] max-w-2xl mx-auto italic mb-10 leading-relaxed drop-shadow-md">
          "May your world always shine with happiness, colours, and prosperity."
        </p>

        {/* Rangoli Ornament Divider with Turquoise & Rani Pink accents */}
        <div className="flex items-center justify-center gap-4 mb-10 text-[#FFB000]">
          <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#20C9C3] to-[#FFB000]" />
          <div className="w-4 h-4 rotate-45 border-2 border-[#FFB000] bg-[#E91E63] shadow-[0_0_10px_#E91E63]" />
          <Sparkles className="w-6 h-6 text-[#20C9C3]" />
          <div className="w-4 h-4 rotate-45 border-2 border-[#FFB000] bg-[#E91E63] shadow-[0_0_10px_#E91E63]" />
          <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#20C9C3] to-[#FFB000]" />
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleCelebrate}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-[#0F1126] font-extrabold text-lg sm:text-xl shadow-[0_0_35px_rgba(233,30,99,0.5)] hover:shadow-[0_0_55px_rgba(255,176,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-[#0F1126] group-hover:rotate-45 transition-transform" />
            <span>Celebrate the Light ✨</span>
          </button>

          {celebratedCount > 0 && (
            <p className="text-xs text-[#20C9C3] flex items-center gap-1.5 font-semibold animate-pulse">
              <Heart className="w-3.5 h-3.5 text-[#FF2E88] fill-[#FF2E88]" />
              <span>Celebrated {celebratedCount} {celebratedCount === 1 ? 'time' : 'times'}!</span>
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

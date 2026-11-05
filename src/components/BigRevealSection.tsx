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

    // Trigger golden and magenta particle fireworks
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FFD166', '#FF9F1C', '#FF5A1F', '#A51C69', '#FFF1D6'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD166', '#FF5A1F', '#FFCB69'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#A51C69', '#FFD166', '#FF9F1C'],
      });
    }, 200);
  };

  return (
    <section id="reveal" className="relative w-full min-h-screen py-24 px-4 bg-gradient-to-b from-[#160B2B] via-[#38145E] to-[#160B2B] overflow-hidden flex items-center justify-center">
      
      {/* Decorative Rotating Mandala Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          className="w-[700px] h-[700px] text-[#FFD166] animate-spin-slow"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="250" cy="250" r="230" />
            <circle cx="250" cy="250" r="180" />
            <circle cx="250" cy="250" r="120" />
            <circle cx="250" cy="250" r="60" />
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 250 250)`}>
                <path d="M250,20 Q280,100 250,180 Q220,100 250,20" />
                <circle cx="250" cy="70" r="8" fill="currentColor" />
                <path d="M250,180 Q290,210 250,250 Q210,210 250,180" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Floating Lights / Fairy Light Glow Spheres */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-10 w-32 h-32 rounded-full bg-[#FF9F1C]/20 blur-3xl" />
        <div className="absolute top-1/3 right-12 w-48 h-48 rounded-full bg-[#A51C69]/25 blur-3xl" />
        <div className="absolute bottom-16 left-1/4 w-40 h-40 rounded-full bg-[#FFD166]/20 blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Festive Greeting Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A51C69]/30 border border-[#FFD166]/40 text-[#FFD166] text-sm font-medium mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,209,102,0.2)]">
          <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
          <span>The Sacred Festival of Lights</span>
        </div>

        {/* HAPPY DIWALI Heading */}
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-serif tracking-wider text-gold-gradient glow-gold-text mb-6 uppercase leading-none">
          HAPPY DIWALI
        </h2>

        {/* Subtitle Wish */}
        <p className="text-xl sm:text-2xl md:text-3xl font-cormorant text-[#FFF1D6] max-w-2xl mx-auto italic mb-10 leading-relaxed">
          "May your world always shine with happiness."
        </p>

        {/* Rangoli Ornament Divider */}
        <div className="flex items-center justify-center gap-4 mb-10 text-[#FFD166]">
          <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent to-[#FFD166]" />
          <div className="w-4 h-4 rotate-45 border-2 border-[#FFD166] bg-[#FF5A1F]" />
          <Sparkles className="w-6 h-6 text-[#FF9F1C]" />
          <div className="w-4 h-4 rotate-45 border-2 border-[#FFD166] bg-[#FF5A1F]" />
          <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent to-[#FFD166]" />
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleCelebrate}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#FF5A1F] via-[#FF9F1C] to-[#FFD166] text-[#160B2B] font-bold text-lg sm:text-xl shadow-[0_0_30px_rgba(255,159,28,0.6)] hover:shadow-[0_0_45px_rgba(255,90,31,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-[#160B2B] group-hover:rotate-45 transition-transform" />
            <span>Celebrate the Light ✨</span>
          </button>

          {celebratedCount > 0 && (
            <p className="text-xs text-[#FFD166] flex items-center gap-1 font-medium animate-pulse">
              <Heart className="w-3.5 h-3.5 text-[#FF5A1F] fill-[#FF5A1F]" />
              <span>Celebrated {celebratedCount} {celebratedCount === 1 ? 'time' : 'times'}!</span>
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

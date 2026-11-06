import React from 'react';
import { Sparkles, Moon, Heart, RotateCcw } from 'lucide-react';

interface FinalSectionProps {
  onRestartExperience: () => void;
}

export const FinalSection: React.FC<FinalSectionProps> = ({ onRestartExperience }) => {
  return (
    <section className="relative w-full min-h-screen py-28 px-4 bg-gradient-to-b from-[#0B1021] via-[#004D54]/70 to-[#0B1021] overflow-hidden flex flex-col justify-between items-center text-center">
      
      {/* Background Moon & Sky Canvas Graphics */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
      
      {/* Crescent Moon */}
      <div className="absolute top-16 right-12 text-[#E5C158]/30 pointer-events-none">
        <Moon className="w-24 h-24 stroke-[1.2]" />
      </div>

      {/* Floating Kandils (Sky Lanterns) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 text-2xl animate-float">🏮</div>
        <div className="absolute top-1/3 right-16 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🏮</div>
        <div className="absolute bottom-1/3 left-1/4 text-xl animate-float" style={{ animationDelay: '2.5s' }}>🪔</div>
        <div className="absolute bottom-1/4 right-1/3 text-2xl animate-float" style={{ animationDelay: '0.8s' }}>🏮</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto my-auto">
        {/* Subtle Decorative Kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#004D54]/50 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-semibold mb-6 shadow-[0_0_18px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
          <span>The Light Within Never Fades</span>
        </div>

        {/* Main Emotional Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-royal-gold-gradient glow-royal-gold mb-6 leading-tight">
          May the light you create today stay with you throughout the year.
        </h2>

        {/* Closing Wish */}
        <p className="text-xl sm:text-2xl font-cormorant text-[#FFF8E7]/90 max-w-xl mx-auto italic mb-10 drop-shadow-md">
          Wishing You And Your Family A Very Happy Diwali!
        </p>

        {/* Replay CTA Button */}
        <button
          onClick={onRestartExperience}
          className="group relative px-9 py-4 rounded-full bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-lg border border-[#FFF8E7]/40 shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:shadow-[0_0_50px_rgba(229,193,88,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-3 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500 text-[#0B1021]" />
          <span>Reignite The Spark ✨</span>
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full pt-16 border-t border-[#D4AF37]/25 text-xs text-[#FFF8E7]/70 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E5C158]" />
          <span className="font-serif font-bold text-[#E5C158]">THE LIGHT WITHIN</span>
          <span>— A Diwali Experience</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Crafted with joy, colours & devotion</span>
          <Heart className="w-3.5 h-3.5 text-[#FF2E88] fill-[#FF2E88]" />
        </div>
      </footer>
    </section>
  );
};

import React from 'react';
import { Sparkles, Moon, Heart, RotateCcw } from 'lucide-react';

interface FinalSectionProps {
  onRestartExperience: () => void;
}

export const FinalSection: React.FC<FinalSectionProps> = ({ onRestartExperience }) => {
  return (
    <section className="relative w-full min-h-screen py-28 px-4 bg-gradient-to-b from-[#0F1126] via-[#004D54] to-[#0F1126] overflow-hidden flex flex-col justify-between items-center text-center">
      
      {/* Background Moon & Sky Canvas Graphics */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#FFB000]/20 blur-3xl pointer-events-none" />
      
      {/* Crescent Moon */}
      <div className="absolute top-16 right-12 text-[#FFB000]/40 pointer-events-none">
        <Moon className="w-24 h-24 stroke-[1.5]" />
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008C95]/35 border border-[#20C9C3]/40 text-[#FFB000] text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(32,201,195,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-[#20C9C3]" />
          <span>The Light Within Never Fades</span>
        </div>

        {/* Main Emotional Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-festive-gradient glow-festive-text mb-6 leading-tight">
          May the light you create today stay with you throughout the year.
        </h2>

        {/* Closing Wish */}
        <p className="text-xl sm:text-2xl font-cormorant text-[#FFF1D6]/90 max-w-xl mx-auto italic mb-10 drop-shadow-md">
          Wishing You And Your Family A Very Happy Diwali!
        </p>

        {/* Replay CTA Button */}
        <button
          onClick={onRestartExperience}
          className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-white font-extrabold text-lg shadow-[0_0_35px_rgba(233,30,99,0.5)] hover:shadow-[0_0_55px_rgba(255,176,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-3 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500 text-[#FFB000]" />
          <span>Reignite The Spark ✨</span>
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full pt-16 border-t border-[#008C95]/30 text-xs text-[#FFF1D6]/70 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFB000]" />
          <span className="font-serif font-bold text-[#FFB000]">THE LIGHT WITHIN</span>
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

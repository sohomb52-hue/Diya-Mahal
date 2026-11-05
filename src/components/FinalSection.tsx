import React from 'react';
import { Sparkles, Moon, Heart, RotateCcw } from 'lucide-react';

interface FinalSectionProps {
  onRestartExperience: () => void;
}

export const FinalSection: React.FC<FinalSectionProps> = ({ onRestartExperience }) => {
  return (
    <section className="relative w-full min-h-screen py-28 px-4 bg-gradient-to-b from-[#160B2B] via-[#38145E] to-[#160B2B] overflow-hidden flex flex-col justify-between items-center text-center">
      
      {/* Background Moon & Sky Canvas Graphics */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#FFD166]/20 blur-3xl pointer-events-none" />
      
      {/* Crescent Moon */}
      <div className="absolute top-16 right-12 text-[#FFD166]/30 pointer-events-none">
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A51C69]/30 border border-[#FFD166]/30 text-[#FFD166] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
          <span>The Light Within Never Fades</span>
        </div>

        {/* Main Emotional Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-gold-gradient glow-gold-text mb-6 leading-tight">
          May the light you create today stay with you throughout the year.
        </h2>

        {/* Closing Wish */}
        <p className="text-xl sm:text-2xl font-cormorant text-[#FFF1D6]/90 max-w-xl mx-auto italic mb-10">
          Wishing You And Your Family A Very Happy Diwali!
        </p>

        {/* Replay CTA Button */}
        <button
          onClick={onRestartExperience}
          className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#A51C69] via-[#FF5A1F] to-[#FFD166] text-white font-extrabold text-lg shadow-[0_0_30px_rgba(255,90,31,0.5)] hover:shadow-[0_0_45px_rgba(255,209,102,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-3 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500 text-[#FFD166]" />
          <span>Reignite The Spark ✨</span>
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full pt-16 border-t border-[#A51C69]/20 text-xs text-[#FFF1D6]/60 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
          <span className="font-serif font-bold text-[#FFD166]">THE LIGHT WITHIN</span>
          <span>— A Diwali Experience</span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span>Crafted with joy, light & devotion</span>
          <Heart className="w-3 h-3 text-[#FF5A1F] fill-[#FF5A1F]" />
        </div>
      </footer>
    </section>
  );
};

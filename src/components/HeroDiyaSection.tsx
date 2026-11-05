import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { DiyaCanvas } from './3d/DiyaCanvas';

interface HeroDiyaSectionProps {
  scrollProgress: number;
  onLitComplete?: () => void;
}

export const HeroDiyaSection: React.FC<HeroDiyaSectionProps> = ({ scrollProgress, onLitComplete }) => {
  // Determine lighting state message
  const getLightingStatusText = () => {
    if (scrollProgress < 0.15) {
      return "Scroll down to awaken the light";
    } else if (scrollProgress < 0.38) {
      return "A spark descends towards the sacred wick...";
    } else if (scrollProgress < 0.65) {
      return "The flame catches fire! Warmth illuminates the darkness.";
    } else {
      return "The light radiates within. Continue scrolling into the celebration!";
    }
  };

  return (
    <section id="hero" className="relative w-full h-[180vh] bg-[#160B2B]">
      {/* Sticky 3D Viewport Viewport Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between items-center z-10">
        
        {/* Title Overlay */}
        <div className="pt-24 md:pt-28 px-4 text-center z-20 pointer-events-none max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38145E]/60 border border-[#A51C69]/30 backdrop-blur-sm text-[#FFD166] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span>Interactive 3D Diwali Celebration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-gold-gradient glow-gold-text mb-3 leading-tight">
            Every light begins with a spark.
          </h1>

          <p className="text-base sm:text-lg text-[#FFF1D6]/80 font-light max-w-xl mx-auto">
            Step into an immersive journey from darkness into radiant joy.
          </p>
        </div>

        {/* Center 3D Diya Viewport */}
        <div className="absolute inset-0 z-10 w-full h-full">
          <DiyaCanvas scrollProgress={scrollProgress} onLitComplete={onLitComplete} />
        </div>

        {/* Bottom Interactive Instruction & Scroll Guidance */}
        <div className="pb-10 px-4 text-center z-20 pointer-events-none max-w-xl mx-auto">
          <div className="bg-[#160B2B]/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#FF5A1F]/30 shadow-[0_0_20px_rgba(255,90,31,0.2)] flex flex-col items-center gap-2">
            <p className="text-sm sm:text-base font-medium text-[#FFD166] transition-all duration-300">
              {getLightingStatusText()}
            </p>

            {/* Scroll Indicator Arrow */}
            <div className="flex items-center gap-2 text-xs text-[#FFF1D6]/60 animate-bounce mt-1">
              <span>Scroll down</span>
              <ChevronDown className="w-4 h-4 text-[#FF5A1F]" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

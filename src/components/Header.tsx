import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  onRestartExperience: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRestartExperience }) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const unsub = soundManager.subscribe((muted, playing) => {
      setIsMuted(muted);
      setIsMusicPlaying(playing && !muted);
    });
    return unsub;
  }, []);

  const handleToggleAudio = () => {
    soundManager.toggleMute();
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-40 px-4 md:px-8 transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-[#0B1021]/92 backdrop-blur-md border border-[#D4AF37]/35 shadow-[0_4px_30px_rgba(0,0,0,0.7),0_0_18px_rgba(212,175,55,0.15)]">
        
        {/* Brand Lockup */}
        <a
          href="#reveal"
          className="text-sm sm:text-base font-bold tracking-wider font-serif text-[#FFF8E7] hover:text-[#E5C158] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-[#E5C158] group-hover:rotate-45 transition-transform" />
          <span className="text-royal-gold-gradient font-extrabold tracking-widest">THE LIGHT WITHIN</span>
        </a>

        {/* Minimal Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-[#FFF8E7]/80">
          <a
            href="#games"
            className="hover:text-[#E5C158] transition-colors whitespace-nowrap shrink-0"
          >
            Play & Celebrate
          </a>
          <a
            href="#fireworks"
            className="hover:text-[#FFB74D] transition-colors whitespace-nowrap shrink-0"
          >
            Fireworks
          </a>
          <a
            href="#wishes"
            className="hover:text-[#B85338] transition-colors whitespace-nowrap shrink-0"
          >
            Spread The Light
          </a>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Ambient Music Toggle */}
          <button
            onClick={handleToggleAudio}
            title={!isMuted ? 'Mute Festive Indian Celebration Music' : 'Play Festive Indian Celebration Music'}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
              !isMuted
                ? 'bg-[#004D54]/80 text-[#FFF8E7] border-[#D4AF37]/60 shadow-[0_0_14px_rgba(212,175,55,0.35)]'
                : 'bg-[#0B1021] text-[#FFF8E7]/70 border-[#D4AF37]/25 hover:border-[#D4AF37]/60'
            }`}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#E5C158]" />
                <span className="hidden sm:inline text-[11px] font-semibold text-[#FFF8E7]">Festive Music</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#B85338]" />
                <span className="hidden sm:inline text-[11px] font-semibold">Muted</span>
              </>
            )}
          </button>

          {/* Replay Diya Lighting Experience Button */}
          <button
            onClick={onRestartExperience}
            className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] hover:brightness-110 shadow-[0_0_16px_rgba(212,175,55,0.35)] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Return to the 3D Diya opening screen"
          >
            <RotateCcw className="w-3 h-3 text-[#0B1021]" />
            <span className="hidden sm:inline">Relight Diya</span>
          </button>
        </div>

      </div>
    </header>
  );
};

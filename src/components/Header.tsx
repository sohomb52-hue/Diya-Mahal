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
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-[#160B2B]/85 backdrop-blur-md border border-[#FFD166]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        
        {/* Brand Lockup */}
        <a
          href="#reveal"
          className="text-sm sm:text-base font-bold tracking-wider font-serif text-[#FFF1D6] hover:text-[#FFD166] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
          <span>THE LIGHT WITHIN</span>
        </a>

        {/* Minimal Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-[#FFF1D6]/80">
          <a
            href="#games"
            className="hover:text-[#FFD166] transition-colors whitespace-nowrap shrink-0"
          >
            Play & Celebrate
          </a>
          <a
            href="#fireworks"
            className="hover:text-[#FFD166] transition-colors whitespace-nowrap shrink-0"
          >
            Fireworks
          </a>
          <a
            href="#wishes"
            className="hover:text-[#FFD166] transition-colors whitespace-nowrap shrink-0"
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
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
              !isMuted
                ? 'bg-[#FF5A1F] text-white border-[#FFD166] shadow-[0_0_10px_rgba(255,90,31,0.5)]'
                : 'bg-[#38145E]/70 text-[#FFF1D6] border-[#A51C69]/40 hover:border-[#FFD166]'
            }`}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#FFD166]" />
                <span className="hidden sm:inline text-[11px] font-semibold">Festive Music</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">Muted</span>
              </>
            )}
          </button>

          {/* Replay Diya Lighting Experience Button */}
          <button
            onClick={onRestartExperience}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#A51C69] to-[#FF5A1F] text-white hover:from-[#FF5A1F] hover:to-[#FF9F1C] transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Return to the 3D Diya opening screen"
          >
            <RotateCcw className="w-3 h-3 text-[#FFD166]" />
            <span className="hidden sm:inline">Relight Diya</span>
          </button>
        </div>

      </div>
    </header>
  );
};

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
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-[#0F1126]/90 backdrop-blur-md border border-[#008C95]/40 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        
        {/* Brand Lockup */}
        <a
          href="#reveal"
          className="text-sm sm:text-base font-bold tracking-wider font-serif text-[#FFF1D6] hover:text-[#FFB000] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#FFB000]" />
          <span>THE LIGHT WITHIN</span>
        </a>

        {/* Minimal Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-[#FFF1D6]/80">
          <a
            href="#games"
            className="hover:text-[#FFB000] transition-colors whitespace-nowrap shrink-0"
          >
            Play & Celebrate
          </a>
          <a
            href="#fireworks"
            className="hover:text-[#20C9C3] transition-colors whitespace-nowrap shrink-0"
          >
            Fireworks
          </a>
          <a
            href="#wishes"
            className="hover:text-[#E91E63] transition-colors whitespace-nowrap shrink-0"
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
                ? 'bg-[#008C95] text-white border-[#20C9C3] shadow-[0_0_12px_rgba(32,201,195,0.4)]'
                : 'bg-[#0F1126] text-[#FFF1D6] border-[#008C95]/40 hover:border-[#FFB000]'
            }`}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#FFB000]" />
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
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF5722] text-white hover:from-[#FF5722] hover:to-[#FFB000] transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Return to the 3D Diya opening screen"
          >
            <RotateCcw className="w-3 h-3 text-[#FFB000]" />
            <span className="hidden sm:inline">Relight Diya</span>
          </button>
        </div>

      </div>
    </header>
  );
};

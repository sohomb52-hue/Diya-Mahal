import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Rocket, Heart, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomNavBarProps {
  isUnlocked: boolean;
  onRestartExperience?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ isUnlocked, onRestartExperience }) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isPlaying, setIsPlaying] = useState(soundManager.isBgMusicPlaying);

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted) => {
      setIsMuted(muted);
      setIsPlaying(!muted && soundManager.isEngineRunning);
    });
    return unsubscribe;
  }, []);

  const handleToggleAudio = () => {
    soundManager.toggleMute();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[94vw] transition-all duration-300">
      <nav
        aria-label="Global Festive Navigation and Audio Bar"
        className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-[#160B2B]/90 backdrop-blur-md border border-[#FFD166]/35 shadow-[0_8px_32px_rgba(0,0,0,0.65)] text-[#FFF1D6]"
      >
        {/* Global Ambient Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            !isMuted && isPlaying
              ? 'bg-[#FF5A1F]/20 border-[#FFD166] text-[#FFD166] shadow-[0_0_15px_rgba(255,209,102,0.35)]'
              : 'bg-[#38145E]/50 border-[#A51C69]/40 text-[#FFF1D6]/75 hover:border-[#FFD166]'
          }`}
          title={!isMuted ? 'Mute ambient Indian festive music' : 'Unmute ambient Indian festive music'}
        >
          {/* Animated Equalizer Waves when active */}
          {!isMuted && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <span className="w-0.5 bg-[#FFD166] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.1s] h-3" />
              <span className="w-0.5 bg-[#FF9F1C] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.3s] h-2" />
              <span className="w-0.5 bg-[#FF5A1F] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.2s] h-3.5" />
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}

          {/* Audio Status Label */}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
              {!isMuted ? 'Festive Music: Playing' : 'Festive Music: Muted'}
            </span>
            <span className="text-[9px] text-[#FFD166]/80 hidden md:inline font-medium">
              {!isMuted ? 'Dhol, Tabla & Shehnai' : 'Click to Unmute'}
            </span>
          </div>
        </button>

        {/* Unlocked Navigation Controls */}
        {isUnlocked && (
          <>
            <div className="h-5 w-[1px] bg-[#A51C69]/40 shrink-0 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <a
                href="#reveal"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFD166] hover:bg-[#38145E]/40 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#FF9F1C]" />
                <span>Celebrate</span>
              </a>

              <a
                href="#games"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFD166] hover:bg-[#38145E]/40 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-[#FF5A1F]" />
                <span>Games</span>
              </a>

              <a
                href="#fireworks"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFD166] hover:bg-[#38145E]/40 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Rocket className="w-3 h-3 text-[#FFD166]" />
                <span>Sky</span>
              </a>

              <a
                href="#wishes"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFD166] hover:bg-[#38145E]/40 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Heart className="w-3 h-3 text-[#A51C69]" />
                <span>Wishes</span>
              </a>
            </div>

            {onRestartExperience && (
              <>
                <div className="h-5 w-[1px] bg-[#A51C69]/40 shrink-0" />
                <button
                  onClick={onRestartExperience}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-[#A51C69] to-[#FF5A1F] text-white hover:from-[#FF5A1F] hover:to-[#FF9F1C] text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap shadow-sm"
                  title="Relight 3D Opening Diya"
                >
                  <RotateCcw className="w-3 h-3 text-[#FFD166]" />
                  <span className="hidden md:inline">Relight</span>
                </button>
              </>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

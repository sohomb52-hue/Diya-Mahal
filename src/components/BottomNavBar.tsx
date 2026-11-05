import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Rocket, Heart, RotateCcw, Palette, ChevronUp } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { AMBIENT_THEMES, AmbientThemeId } from '../utils/gameLogic';

interface BottomNavBarProps {
  isUnlocked: boolean;
  onRestartExperience?: () => void;
  currentTheme?: AmbientThemeId;
  onThemeChange?: (themeId: AmbientThemeId) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  isUnlocked,
  onRestartExperience,
  currentTheme = 'midnight',
  onThemeChange,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isPlaying, setIsPlaying] = useState(soundManager.isBgMusicPlaying);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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

  const activeThemeConfig = AMBIENT_THEMES.find((t) => t.id === currentTheme) || AMBIENT_THEMES[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] transition-all duration-300">
      {/* Theme Selector Popover Menu */}
      {showThemeMenu && onThemeChange && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 mb-2 p-2 rounded-2xl bg-[#0F1126]/95 border border-[#008C95]/50 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col gap-1 z-50 min-w-[200px] text-[#FFF1D6] animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] uppercase font-bold text-[#FFB000] px-3 py-1 border-b border-white/10 flex items-center justify-between">
            <span>Ambient Atmosphere</span>
            <Palette className="w-3 h-3" />
          </div>
          {AMBIENT_THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setShowThemeMenu(false);
                  soundManager.playClick();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#008C95]/40 text-[#FFB000] border border-[#20C9C3]/40 font-bold'
                    : 'hover:bg-white/10 text-[#FFF1D6]/80'
                }`}
              >
                <span className="text-base">{theme.icon}</span>
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <nav
        aria-label="Global Festive Navigation and Audio Bar"
        className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[#0F1126]/95 backdrop-blur-md border border-[#008C95]/40 shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-[#FFF1D6]"
      >
        {/* Global Ambient Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            !isMuted && isPlaying
              ? 'bg-[#008C95]/30 border-[#20C9C3] text-[#20C9C3] shadow-[0_0_15px_rgba(32,201,195,0.35)]'
              : 'bg-[#0F1126] border-[#008C95]/40 text-[#FFF1D6]/75 hover:border-[#FFB000]'
          }`}
          title={!isMuted ? 'Mute ambient Indian festive music' : 'Unmute ambient Indian festive music'}
        >
          {!isMuted && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <span className="w-0.5 bg-[#20C9C3] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.1s] h-3" />
              <span className="w-0.5 bg-[#FFB000] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.3s] h-2" />
              <span className="w-0.5 bg-[#E91E63] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.2s] h-3.5" />
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}

          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
              {!isMuted ? 'Festive Music' : 'Muted'}
            </span>
          </div>
        </button>

        {/* Ambient Atmosphere Theme Button */}
        {onThemeChange && (
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#160B2B] border border-[#008C95]/40 text-xs font-medium text-[#FFF1D6]/90 hover:border-[#FFB000] hover:text-[#FFB000] transition-all cursor-pointer"
            title="Switch Ambient Atmosphere Lighting Theme"
          >
            <span className="text-sm">{activeThemeConfig.icon}</span>
            <span className="hidden md:inline font-bold">{activeThemeConfig.name}</span>
            <ChevronUp className={`w-3 h-3 text-[#20C9C3] transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Unlocked Navigation Controls */}
        {isUnlocked && (
          <>
            <div className="h-5 w-[1px] bg-[#008C95]/40 shrink-0 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <a
                href="#reveal"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFB000] hover:bg-[#008C95]/20 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#FFB000]" />
                <span>Celebrate</span>
              </a>

              <a
                href="#games"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#FFB000] hover:bg-[#008C95]/20 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-[#FF5722]" />
                <span>Games</span>
              </a>

              <a
                href="#fireworks"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#20C9C3] hover:bg-[#008C95]/20 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Rocket className="w-3 h-3 text-[#20C9C3]" />
                <span>Sky</span>
              </a>

              <a
                href="#wishes"
                className="px-2.5 py-1 rounded-full text-[#FFF1D6]/80 hover:text-[#E91E63] hover:bg-[#008C95]/20 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Heart className="w-3 h-3 text-[#E91E63]" />
                <span>Wishes</span>
              </a>
            </div>

            {onRestartExperience && (
              <>
                <div className="h-5 w-[1px] bg-[#008C95]/40 shrink-0" />
                <button
                  onClick={onRestartExperience}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF5722] text-white hover:from-[#FF5722] hover:to-[#FFB000] text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap shadow-sm cursor-pointer"
                  title="Relight 3D Opening Diya"
                >
                  <RotateCcw className="w-3 h-3 text-[#FFB000]" />
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

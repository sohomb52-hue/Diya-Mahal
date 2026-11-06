import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Rocket, Heart, RotateCcw, Palette, ChevronUp, Music } from 'lucide-react';
import { soundManager, FESTIVE_TUNES, FestiveTuneId } from '../utils/audio';
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
  const [currentTuneId, setCurrentTuneId] = useState<FestiveTuneId>(soundManager.currentTuneId);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted, _scene, tuneId) => {
      setIsMuted(muted);
      setIsPlaying(!muted && soundManager.isEngineRunning);
      setCurrentTuneId(tuneId);
    });
    return unsubscribe;
  }, []);

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.toggleMute();
  };

  const activeThemeConfig = AMBIENT_THEMES.find((t) => t.id === currentTheme) || AMBIENT_THEMES[0];
  const activeTuneConfig = FESTIVE_TUNES.find((t) => t.id === currentTuneId) || FESTIVE_TUNES[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] transition-all duration-300">
      {/* 1. Festive Audio Tune Selector Popover */}
      {showMusicMenu && (
        <div className="absolute bottom-16 left-2 sm:left-4 mb-2 p-3 rounded-2xl bg-[#0B1021]/96 border border-[#D4AF37]/45 shadow-[0_8px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.15)] backdrop-blur-md flex flex-col gap-2 z-50 w-[280px] sm:w-[320px] text-[#FFF8E7] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#E5C158]" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#E5C158]">
                Select Festive Tune
              </span>
            </div>
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                !isMuted
                  ? 'bg-[#004D54]/50 text-[#E5C158] border border-[#D4AF37]/50'
                  : 'bg-[#A8422B]/30 text-[#FFF8E7] border border-[#A8422B]/40'
              }`}
            >
              {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{!isMuted ? 'Mute' : 'Unmute'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
            {FESTIVE_TUNES.map((tune) => {
              const isSelected = tune.id === currentTuneId;
              return (
                <button
                  key={tune.id}
                  onClick={() => {
                    soundManager.setTune(tune.id);
                    if (isMuted) {
                      soundManager.setMute(false);
                    }
                    soundManager.playClick();
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#A8422B]/40 to-[#C59B27]/30 text-[#FFF8E7] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#FFF8E7]/80 hover:border-[#D4AF37]/30'
                  }`}
                >
                  <span className="text-xl p-1 rounded-lg bg-black/40 shrink-0">{tune.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate text-[#FFF8E7]">{tune.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#D4AF37] text-[#0B1021] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 animate-pulse">
                          Playing
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#E5C158] font-medium block truncate">
                      {tune.hindiName}
                    </span>
                    <p className="text-[10px] text-[#FFF8E7]/60 leading-tight mt-0.5 line-clamp-2">
                      {tune.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Theme Selector Popover Menu */}
      {showThemeMenu && onThemeChange && (
        <div className="absolute bottom-16 right-2 sm:right-4 mb-2 p-2.5 rounded-2xl bg-[#0B1021]/96 border border-[#D4AF37]/45 shadow-[0_8px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.15)] backdrop-blur-md flex flex-col gap-1 z-50 min-w-[220px] text-[#FFF8E7] animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] uppercase font-bold text-[#E5C158] px-3 py-1 border-b border-[#D4AF37]/20 flex items-center justify-between">
            <span>Ambient Atmosphere</span>
            <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
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
                    ? 'bg-[#004D54]/50 text-[#E5C158] border border-[#D4AF37]/50 font-bold'
                    : 'hover:bg-white/10 text-[#FFF8E7]/80'
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
        className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[#0B1021]/94 backdrop-blur-md border border-[#D4AF37]/35 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(212,175,55,0.12)] text-[#FFF8E7]"
      >
        {/* Global Ambient Audio Button & Tune Popover Toggle */}
        <div className="flex items-center rounded-full bg-[#070B17] border border-[#D4AF37]/30 overflow-hidden">
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isMuted && isPlaying
                ? 'bg-[#004D54]/50 text-[#E5C158]'
                : 'text-[#FFF8E7]/75 hover:text-[#E5C158]'
            }`}
            title={!isMuted ? 'Mute audio' : 'Unmute audio'}
          >
            {!isMuted && isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <span className="w-0.5 bg-[#E5C158] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.1s] h-3" />
                <span className="w-0.5 bg-[#FFB74D] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.3s] h-2" />
                <span className="w-0.5 bg-[#A8422B] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.2s] h-3.5" />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#B85338] shrink-0" />
            )}

            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
              {!isMuted ? activeTuneConfig.icon : 'Muted'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowMusicMenu(!showMusicMenu);
              setShowThemeMenu(false);
            }}
            className="px-2 py-1.5 hover:bg-white/10 text-[#E5C158] transition-colors border-l border-[#D4AF37]/20 flex items-center gap-0.5 cursor-pointer text-xs font-bold"
            title="Change Indian Festive Audio Tune (4 Available)"
          >
            <span className="hidden sm:inline text-[11px] font-semibold text-[#FFF8E7]/90 truncate max-w-[90px]">
              {activeTuneConfig.name.split(' ')[0]}
            </span>
            <ChevronUp className={`w-3 h-3 text-[#E5C158] transition-transform ${showMusicMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Ambient Atmosphere Theme Button */}
        {onThemeChange && (
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowMusicMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#070B17] border border-[#D4AF37]/30 text-xs font-medium text-[#FFF8E7]/90 hover:border-[#D4AF37] hover:text-[#E5C158] transition-all cursor-pointer"
            title="Switch Ambient Atmosphere Lighting Theme"
          >
            <span className="text-sm">{activeThemeConfig.icon}</span>
            <span className="hidden md:inline font-bold">{activeThemeConfig.name}</span>
            <ChevronUp className={`w-3 h-3 text-[#D4AF37] transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Unlocked Navigation Controls */}
        {isUnlocked && (
          <>
            <div className="h-5 w-[1px] bg-[#D4AF37]/30 shrink-0 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <a
                href="#reveal"
                className="px-2.5 py-1 rounded-full text-[#FFF8E7]/80 hover:text-[#E5C158] hover:bg-[#D4AF37]/15 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#E5C158]" />
                <span>Celebrate</span>
              </a>

              <a
                href="#games"
                className="px-2.5 py-1 rounded-full text-[#FFF8E7]/80 hover:text-[#E5C158] hover:bg-[#D4AF37]/15 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-[#FFB74D]" />
                <span>Games</span>
              </a>

              <a
                href="#fireworks"
                className="px-2.5 py-1 rounded-full text-[#FFF8E7]/80 hover:text-[#E5C158] hover:bg-[#D4AF37]/15 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Rocket className="w-3 h-3 text-[#008C95]" />
                <span>Sky</span>
              </a>

              <a
                href="#wishes"
                className="px-2.5 py-1 rounded-full text-[#FFF8E7]/80 hover:text-[#E5C158] hover:bg-[#D4AF37]/15 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <Heart className="w-3 h-3 text-[#B85338]" />
                <span>Wishes</span>
              </a>
            </div>

            {onRestartExperience && (
              <>
                <div className="h-5 w-[1px] bg-[#D4AF37]/30 shrink-0" />
                <button
                  onClick={onRestartExperience}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] hover:brightness-110 text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shadow-sm cursor-pointer"
                  title="Relight 3D Opening Diya"
                >
                  <RotateCcw className="w-3 h-3 text-[#0B1021]" />
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


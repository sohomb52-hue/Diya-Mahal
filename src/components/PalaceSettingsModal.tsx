import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  X,
  Music,
  Palette,
  Check,
} from 'lucide-react';
import { soundManager, FESTIVE_TUNES, FestiveTuneId } from '../utils/audio';
import { AmbientThemeId, AMBIENT_THEMES } from '../utils/gameLogic';

interface PalaceSettingsModalProps {
  currentTheme: AmbientThemeId;
  onThemeChange: (theme: AmbientThemeId) => void;
  onRestartExperience: () => void;
}

export const PalaceSettingsModal: React.FC<PalaceSettingsModalProps> = ({
  currentTheme,
  onThemeChange,
  onRestartExperience,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [currentTuneId, setCurrentTuneId] = useState<FestiveTuneId>(soundManager.currentTuneId);
  const [isPlaying, setIsPlaying] = useState(soundManager.isBgMusicPlaying);

  useEffect(() => {
    const unsub = soundManager.subscribe((muted, _scene, tuneId) => {
      setIsMuted(muted);
      setCurrentTuneId(tuneId);
      setIsPlaying(soundManager.isBgMusicPlaying);
    });
    return unsub;
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggleMute = () => {
    soundManager.toggleMute();
  };

  const handleSelectTune = (tuneId: FestiveTuneId) => {
    soundManager.setTune(tuneId);
    soundManager.playClick();
  };

  const handleSelectTheme = (themeId: AmbientThemeId) => {
    onThemeChange(themeId);
    soundManager.playClick();
  };

  const activeTune = FESTIVE_TUNES.find((t) => t.id === currentTuneId) || FESTIVE_TUNES[0];

  return (
    <>
      {/* 1. Discrete, Ornate Floating Indian Settings Button (Top-Right) */}
      <button
        onClick={() => {
          soundManager.playClick();
          setIsOpen(!isOpen);
        }}
        aria-label="Open Palace Ambience and Settings"
        aria-expanded={isOpen}
        className="fixed top-4 right-4 z-50 p-2.5 sm:p-3 rounded-full bg-[#0B1021]/88 hover:bg-[#0B1021] text-[#E5C158] border border-[#D4AF37]/50 hover:border-[#E5C158] shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_18px_rgba(212,175,55,0.22)] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center gap-2 group"
        title="Palace Settings: Music, Atmosphere & Sacred Diya"
      >
        <div className="relative flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#E5C158] group-hover:rotate-90 transition-transform duration-500" />
          
          {/* Subtle audio playing wave indicator dot */}
          {!isMuted && isPlaying && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#008C95] border border-[#FFF8E7] animate-ping" />
          )}
        </div>

        <span className="text-[11px] font-bold tracking-wider uppercase font-serif text-[#FFF8E7]/90 hidden md:inline pr-1">
          Settings
        </span>
      </button>

      {/* 2. Floating Settings Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          
          {/* Background backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Panel Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Palace Settings and Atmosphere"
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl bg-[#0B1021]/96 border-2 border-[#D4AF37]/45 shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.25)] text-[#FFF8E7] backdrop-blur-xl animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/25">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8422B] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full rounded-full bg-[#0B1021] flex items-center justify-center text-[#E5C158]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-royal-gold-gradient">
                    Palace Ambience & Audio
                  </h3>
                  <p className="text-[11px] text-[#FFF8E7]/65">
                    Customize your festive exploration experience
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-[#FFF8E7]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-5">
              
              {/* Section 1: Audio Soundscape */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E5C158]">
                    <Music className="w-4 h-4 text-[#D4AF37]" />
                    <span>Indian Festive Soundscape</span>
                  </div>

                  {/* Quick Mute / Unmute Toggle */}
                  <button
                    onClick={handleToggleMute}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      !isMuted
                        ? 'bg-[#004D54]/70 border-[#D4AF37]/50 text-[#FFF8E7] shadow-[0_0_12px_rgba(0,140,149,0.3)]'
                        : 'bg-[#141C38] border-[#A8422B]/40 text-[#A8422B]'
                    }`}
                  >
                    {!isMuted ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#E5C158]" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-[#A8422B]" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tune Selection List */}
                <div className="space-y-2">
                  {FESTIVE_TUNES.map((tune) => {
                    const isSelected = tune.id === currentTuneId;
                    return (
                      <button
                        key={tune.id}
                        onClick={() => handleSelectTune(tune.id)}
                        className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#141C38] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                            : 'bg-[#0B1021]/60 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xl p-1 shrink-0">{tune.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#FFF8E7] truncate">
                              {tune.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-[#D4AF37] text-[#0B1021] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#E5C158] block font-medium">
                            {tune.hindiName}
                          </span>
                          <p className="text-[10px] text-[#FFF8E7]/65 line-clamp-1 mt-0.5">
                            {tune.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Ambient Atmosphere Lighting Theme */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-3">
                  <Palette className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ambient Palace Lighting</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {AMBIENT_THEMES.map((theme) => {
                    const isSelected = theme.id === currentTheme;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#141C38] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                            : 'bg-[#0B1021]/60 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-lg">{theme.icon}</span>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold block text-[#FFF8E7] truncate">
                            {theme.name}
                          </span>
                          <span className="text-[10px] text-[#E5C158]/80 block">
                            {isSelected ? 'Applied' : 'Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Replay Opening Gateway & Diya */}
              <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FFF8E7] block">
                    Sacred Gateway
                  </span>
                  <span className="text-[10px] text-[#FFF8E7]/65 block">
                    Return to the 3D Diya threshold
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onRestartExperience();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#0B1021]" />
                  <span>Relight Diya</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

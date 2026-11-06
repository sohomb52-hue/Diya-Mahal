import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, ArrowRight, X, Key, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

import { RangoliMaster } from './ExperienceZone/RangoliMaster';
import { LightUpDiyas } from './ExperienceZone/LightUpDiyas';
import { DiwaliMemoryMatch } from './ExperienceZone/DiwaliMemoryMatch';
import { FirecrackerSimulator } from './FirecrackerSimulator';
import { FestivalPassport } from './FestivalPassport';
import { FinalSection } from './FinalSection';

export interface PalaceDoor2DItem {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  doorBg: string;
  frameBorder: string;
  patternIcon: string;
  description: string;
}

export const PALACE_DOORS_2D: PalaceDoor2DItem[] = [
  {
    id: 1,
    key: 'rangoli',
    title: 'The Rangoli Garden',
    subtitle: 'Draw Symmetrical Sacred Lotus Mandalas',
    badge: 'DOOR 1 — SACRED ART',
    accentColor: '#D4AF37',
    doorBg: 'from-[#3A141A] via-[#521D25] to-[#240C10]',
    frameBorder: 'border-[#D4AF37]',
    patternIcon: '🌸',
    description: 'Enter the courtyard of vibrant colors and sacred geometry.',
  },
  {
    id: 2,
    key: 'diyas',
    title: 'The Courtyard of Lights',
    subtitle: 'Light Up Hundreds of Sacred Courtyard Lamps',
    badge: 'DOOR 2 — SACRED LAMPS',
    accentColor: '#E5C158',
    doorBg: 'from-[#2E180A] via-[#482510] to-[#1C0E06]',
    frameBorder: 'border-[#E5C158]',
    patternIcon: '🪔',
    description: 'Step into the sea of glowing terracotta oil lamps.',
  },
  {
    id: 3,
    key: 'memory',
    title: 'The Memory Chamber',
    subtitle: 'Match Sacred Festive Symbols & Test Memory',
    badge: 'DOOR 3 — MEMORY CHAMBER',
    accentColor: '#C59B27',
    doorBg: 'from-[#141A33] via-[#1E274D] to-[#0D1226]',
    frameBorder: 'border-[#D4AF37]',
    patternIcon: '✨',
    description: 'Uncover illuminated festive symbols hidden in the mystical chamber.',
  },
  {
    id: 4,
    key: 'fireworks',
    title: 'The Sky of Celebrations',
    subtitle: 'Ignite Rockets, Anars & Fuljhuris in Night Sky',
    badge: 'DOOR 4 — FIREWORKS SKY',
    accentColor: '#A8422B',
    doorBg: 'from-[#3A1107] via-[#541B0D] to-[#210904]',
    frameBorder: 'border-[#A8422B]',
    patternIcon: '🎆',
    description: 'Watch the night sky burst into brilliant celebration sparks.',
  },
  {
    id: 5,
    key: 'wishes',
    title: 'The Greeting Card Studio',
    subtitle: 'Craft Custom Diwali Wish Cards & Download PNG',
    badge: 'DOOR 5 — GREETING CARD STUDIO',
    accentColor: '#008C95',
    doorBg: 'from-[#082226] via-[#0E353B] to-[#05171A]',
    frameBorder: 'border-[#008C95]',
    patternIcon: '💌',
    description: 'Craft personalized golden Diwali wishes with festive borders and download PNG cards.',
  },
  {
    id: 6,
    key: 'finale',
    title: 'The Grand Finale',
    subtitle: 'A Heartfelt Thank You & Celebratory Tribute',
    badge: 'DOOR 6 — THE GRAND FINALE',
    accentColor: '#D4AF37',
    doorBg: 'from-[#2B1F08] via-[#45320D] to-[#1A1304]',
    frameBorder: 'border-[#D4AF37]',
    patternIcon: '✨',
    description: 'Step into the starlit courtyard of gratitude and celebration.',
  },
];

interface PalaceDoorWorldProps {
  onRestartExperience: () => void;
}

export const PalaceDoorWorld: React.FC<PalaceDoorWorldProps> = ({ onRestartExperience }) => {
  const [activeDoorIndex, setActiveDoorIndex] = useState(0);
  const [doorState, setDoorState] = useState<'corridor' | 'opening' | 'inside'>('corridor');
  const [handleRotated, setHandleRotated] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#wishes' || hash === '#cards' || hash === '#passport') {
        setActiveDoorIndex(4);
        setDoorState('inside');
      } else if (hash === '#games' || hash === '#rangoli') {
        setActiveDoorIndex(0);
        setDoorState('inside');
      } else if (hash === '#diyas' || hash === '#lights') {
        setActiveDoorIndex(1);
        setDoorState('inside');
      } else if (hash === '#memory') {
        setActiveDoorIndex(2);
        setDoorState('inside');
      } else if (hash === '#fireworks') {
        setActiveDoorIndex(3);
        setDoorState('inside');
      } else if (hash === '#finale') {
        setActiveDoorIndex(5);
        setDoorState('inside');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const currentDoor = PALACE_DOORS_2D[activeDoorIndex];

  const handleOpenDoor = (index: number) => {
    if (doorState !== 'corridor') return;

    soundManager.playClick();
    soundManager.playRevealCelebration();
    setActiveDoorIndex(index);
    setDoorState('opening');
    setHandleRotated(true);

    // Track achievement in passport
    try {
      const saved = localStorage.getItem('diwali_festival_passport_stamps');
      let stamps = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(stamps)) stamps = [];
      const updated = stamps.map((s: any) =>
        s.id === 'palace_explorer' ? { ...s, unlocked: true, dateUnlocked: 'Diwali Night' } : s
      );
      localStorage.setItem('diwali_festival_passport_stamps', JSON.stringify(updated));
    } catch {
      // safe fallback
    }

    // Enter chamber after 2D physical door swing completes (900ms)
    setTimeout(() => {
      setDoorState('inside');
      setHandleRotated(false);
    }, 900);
  };

  const handleStepBackToCorridor = () => {
    soundManager.playClick();
    setDoorState('corridor');
  };

  const handleNextDoor = () => {
    soundManager.playClick();
    if (activeDoorIndex < PALACE_DOORS_2D.length - 1) {
      const nextIdx = activeDoorIndex + 1;
      setDoorState('corridor');
      setActiveDoorIndex(nextIdx);
      setTimeout(() => {
        handleOpenDoor(nextIdx);
      }, 200);
    } else {
      setDoorState('corridor');
      setActiveDoorIndex(0);
      setTimeout(() => {
        handleOpenDoor(0);
      }, 200);
    }
  };

  const handleSelectDoorFromNav = (index: number) => {
    soundManager.playClick();
    setActiveDoorIndex(index);
    setDoorState('corridor');
  };

  return (
    <div className="relative w-full min-h-screen py-8 px-4 flex flex-col justify-center">
      {/* Corridor Active Door Presentation (Visible in 'corridor' & 'opening' modes) */}
      {doorState !== 'inside' && (
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center my-auto min-h-[75vh]">
          
          {/* Ornate 2D Illustrated Indian Archway & Physical Swing Door Frame */}
          <div className="relative w-full max-w-md aspect-[3/4] my-6 rounded-t-full p-4 bg-[#090C18] border-4 border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col justify-between items-center overflow-hidden">
            
            {/* Top Rajasthani Scalloped Arch Trim & Marigold Garland */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#D4AF37]/25 to-transparent flex items-center justify-center pointer-events-none z-20">
              <svg viewBox="0 0 400 60" className="w-full h-full text-[#D4AF37]">
                {/* Traditional Scalloped Arch */}
                <path
                  d="M0,0 Q100,50 200,30 Q300,50 400,0 L400,20 Q300,60 200,45 Q100,60 0,20 Z"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
                {/* Strung Marigold Garland */}
                <path
                  d="M20,10 Q110,40 200,25 Q290,40 380,10"
                  fill="none"
                  stroke="#FF9800"
                  strokeWidth="3.5"
                  strokeDasharray="8,6"
                />
              </svg>
            </div>

            {/* Hanging Brass Temple Bells on Left & Right with Chain */}
            <div className="absolute top-3 left-4 text-[#E5C158] z-20 flex flex-col items-center animate-bounce" style={{ animationDuration: '3.4s' }}>
              <div className="w-[1.5px] h-4 bg-[#D4AF37]" />
              <div className="text-lg">🔔</div>
            </div>
            <div className="absolute top-3 right-4 text-[#E5C158] z-20 flex flex-col items-center animate-bounce" style={{ animationDuration: '2.8s' }}>
              <div className="w-[1.5px] h-4 bg-[#D4AF37]" />
              <div className="text-lg">🔔</div>
            </div>

            {/* Glowing Golden Portal Light Beam (Revealed behind the opening doors) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-[#E5C158] via-[#FFB74D] to-[#A8422B] flex flex-col items-center justify-center transition-opacity duration-700 z-0 ${
                doorState === 'opening' ? 'opacity-100 scale-105' : 'opacity-35'
              }`}
            >
              <div className="w-36 h-36 rounded-full bg-[#FFF8E7]/80 blur-2xl animate-pulse" />
              <div className="text-4xl text-[#0B1021] animate-spin" style={{ animationDuration: '10s' }}>✨</div>
            </div>

            {/* 2D PHYSICAL DOOR SWING CONTAINER (CSS 3D Perspective Hinge Rotation) */}
            <div
              className="relative w-full h-full z-10 flex cursor-pointer group"
              style={{ perspective: '1200px' }}
              onClick={() => handleOpenDoor(activeDoorIndex)}
            >
              {/* LEFT 2D DOOR LEAF (Hinge on Left) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-br ${currentDoor.doorBg} border-r border-[#D4AF37]/50 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-left ${
                  doorState === 'opening' ? '-rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:-rotate-y-6'
                }`}
              >
                {/* Carved Door Pattern Panels */}
                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-3xl shadow-inner">
                  {currentDoor.patternIcon}
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-xl text-[#E5C158] font-serif font-bold">
                  🪔
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-2xl text-[#E5C158]">
                  🌸
                </div>
              </div>

              {/* RIGHT 2D DOOR LEAF (Hinge on Right) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-bl ${currentDoor.doorBg} border-l border-[#D4AF37]/50 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-right relative ${
                  doorState === 'opening' ? 'rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:rotate-y-6'
                }`}
              >
                {/* Carved Door Pattern Panels */}
                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-3xl shadow-inner">
                  {currentDoor.patternIcon}
                </div>

                {/* Ornate Antique Brass Handle Ring */}
                <div
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8422B] border-2 border-[#FFF8E7] shadow-[0_0_15px_rgba(212,175,55,0.7)] flex items-center justify-center transition-transform duration-300 ${
                    handleRotated ? '-rotate-45 scale-110' : 'group-hover:rotate-12'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#0B1021]" />
                </div>

                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-xl text-[#E5C158] font-serif font-bold">
                  🪔
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#D4AF37]/40 bg-black/30 flex items-center justify-center text-2xl text-[#E5C158]">
                  🌸
                </div>
              </div>

            </div>

            {/* Bottom Door Step Threshold */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#D4AF37] via-[#A8422B] to-[#D4AF37] z-20" />
          </div>

          {/* Active Door Information & Action Box */}
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B1021]/92 border-2 border-[#D4AF37]/45 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#004D54]/45 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-extrabold tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>{currentDoor.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-royal-gold-gradient mb-2">
              {currentDoor.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#FFF8E7]/80 font-light mb-5">
              {currentDoor.subtitle}
            </p>

            <button
              onClick={() => handleOpenDoor(activeDoorIndex)}
              disabled={doorState === 'opening'}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-base border border-[#FFF8E7]/40 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(229,193,88,0.7)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>{doorState === 'opening' ? 'Opening Door...' : `Open Door ${currentDoor.id} & Enter`}</span>
              <ArrowRight className="w-5 h-5 text-[#0B1021] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Prev / Next Door Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#D4AF37]/20 text-xs font-semibold text-[#FFF8E7]/70">
              <button
                onClick={() => handleSelectDoorFromNav(Math.max(0, activeDoorIndex - 1))}
                disabled={activeDoorIndex === 0}
                className="flex items-center gap-1 hover:text-[#E5C158] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Door</span>
              </button>

              <span className="text-xs font-mono text-[#E5C158]">
                {activeDoorIndex + 1} of {PALACE_DOORS_2D.length}
              </span>

              <button
                onClick={() => handleSelectDoorFromNav(Math.min(PALACE_DOORS_2D.length - 1, activeDoorIndex + 1))}
                disabled={activeDoorIndex === PALACE_DOORS_2D.length - 1}
                className="flex items-center gap-1 hover:text-[#E5C158] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
              >
                <span>Next Door</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. Chamber Feature Mount Overlay (Revealed when doorState === 'inside') */}
      {doorState === 'inside' && (
        <div className="relative z-30 min-h-screen bg-[#0B1021]/96 py-8 px-3 sm:px-6 animate-fade-in flex flex-col justify-between">
          
          {/* Chamber Header Control Bar */}
          <div className="max-w-6xl mx-auto w-full mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#004D54]/60 border border-[#D4AF37]/40 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-[#0B1021] text-xs font-extrabold uppercase">
                Chamber {currentDoor.id} of 6
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#FFF8E7]">
                  {currentDoor.title}
                </h3>
                <p className="text-xs text-[#FFF8E7]/70 font-light hidden sm:block">
                  {currentDoor.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStepBackToCorridor}
                className="px-4 py-2 rounded-xl bg-[#0B1021] border border-[#D4AF37]/40 text-xs font-bold text-[#FFF8E7] hover:border-[#E5C158] flex items-center gap-2 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-[#A8422B]" />
                <span>Exit Chamber</span>
              </button>

              <button
                onClick={handleNextDoor}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A8422B] via-[#C59B27] to-[#E5C158] text-[#0B1021] text-xs font-extrabold shadow-md hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next Door</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chamber Core Feature Mount */}
          <div className="w-full max-w-6xl mx-auto my-auto">
            {activeDoorIndex === 0 && <RangoliMaster />}
            {activeDoorIndex === 1 && <LightUpDiyas />}
            {activeDoorIndex === 2 && <DiwaliMemoryMatch />}
            {activeDoorIndex === 3 && <FirecrackerSimulator />}
            {activeDoorIndex === 4 && <FestivalPassport />}
            {activeDoorIndex === 5 && (
              <FinalSection
                onRestartExperience={onRestartExperience}
                onBackToCorridor={handleStepBackToCorridor}
              />
            )}
          </div>

          {/* Chamber Footer */}
          <div className="max-w-6xl mx-auto w-full mt-10 pt-4 border-t border-[#008C95]/30 flex items-center justify-between text-xs text-[#FFF1D6]/60">
            <span>🪔 Diwali Palace Chamber Navigation</span>
            <button
              onClick={handleStepBackToCorridor}
              className="hover:text-[#FFB000] underline cursor-pointer"
            >
              Return to Palace Corridor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

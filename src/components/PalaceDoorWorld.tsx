import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Compass, ArrowRight, X, Key, Flame } from 'lucide-react';
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
    accentColor: '#E91E63',
    doorBg: 'from-[#801438] via-[#A51C69] to-[#4A0E2E]',
    frameBorder: 'border-[#FFB000]',
    patternIcon: '🌸',
    description: 'Enter the courtyard of vibrant colors and sacred geometry.',
  },
  {
    id: 2,
    key: 'diyas',
    title: 'The Courtyard of Lights',
    subtitle: 'Light Up Hundreds of Sacred Courtyard Lamps',
    badge: 'DOOR 2 — SACRED LAMPS',
    accentColor: '#20C9C3',
    doorBg: 'from-[#3D2314] via-[#5A351E] to-[#26150B]',
    frameBorder: 'border-[#20C9C3]',
    patternIcon: '🪔',
    description: 'Step into the sea of glowing terracotta oil lamps.',
  },
  {
    id: 3,
    key: 'memory',
    title: 'The Memory Chamber',
    subtitle: 'Match Sacred Festive Symbols & Test Memory',
    badge: 'DOOR 3 — MEMORY CHAMBER',
    accentColor: '#FFB000',
    doorBg: 'from-[#1F143D] via-[#352166] to-[#110A24]',
    frameBorder: 'border-[#FFB000]',
    patternIcon: '🧠',
    description: 'Uncover illuminated festive symbols hidden in the mystical chamber.',
  },
  {
    id: 4,
    key: 'fireworks',
    title: 'The Sky of Celebrations',
    subtitle: 'Ignite Rockets, Anars & Fuljhuris in Night Sky',
    badge: 'DOOR 4 — FIREWORKS SKY',
    accentColor: '#FF5722',
    doorBg: 'from-[#6E1B00] via-[#992900] to-[#3D0F00]',
    frameBorder: 'border-[#FF5722]',
    patternIcon: '🎆',
    description: 'Watch the night sky burst into brilliant celebration sparks.',
  },
  {
    id: 5,
    key: 'passport',
    title: 'The Festival Passport',
    subtitle: 'Collect Royal Stamps & Craft Diwali Cards',
    badge: 'DOOR 5 — PASSPORT & WISHES',
    accentColor: '#A51C69',
    doorBg: 'from-[#4A0E36] via-[#6B184F] to-[#2B081F]',
    frameBorder: 'border-[#FFD166]',
    patternIcon: '📜',
    description: 'View your official festival achievement stamps and craft greeting cards.',
  },
  {
    id: 6,
    key: 'finale',
    title: 'The Grand Finale',
    subtitle: 'Receive Royal Blessings & Celebratory Finale',
    badge: 'DOOR 6 — ROYAL BLESSINGS',
    accentColor: '#FFD166',
    doorBg: 'from-[#8A6D0B] via-[#B89414] to-[#4A3A05]',
    frameBorder: 'border-[#FFB000]',
    patternIcon: '👑',
    description: 'Conclude your journey with virtual blessings and celebratory light.',
  },
];

interface PalaceDoorWorldProps {
  onRestartExperience: () => void;
}

export const PalaceDoorWorld: React.FC<PalaceDoorWorldProps> = ({ onRestartExperience }) => {
  const [activeDoorIndex, setActiveDoorIndex] = useState(0);
  const [doorState, setDoorState] = useState<'corridor' | 'opening' | 'inside'>('corridor');
  const [handleRotated, setHandleRotated] = useState(false);

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
    <div className="relative w-full min-h-screen pt-20 pb-16 px-4">
      {/* 1. Top Persistent 2D Palace Door Quick Navigator Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 px-3 sm:px-6">
        <div className="max-w-4xl mx-auto py-2 px-3 sm:px-4 rounded-full bg-[#0F1126]/90 border border-[#008C95]/40 backdrop-blur-md shadow-2xl flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFB000] shrink-0 hidden sm:flex items-center gap-1.5 mr-1">
            <Compass className="w-4 h-4 text-[#20C9C3]" />
            <span>Palace Doors</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
            {PALACE_DOORS_2D.map((door, idx) => (
              <button
                key={door.key}
                onClick={() => handleSelectDoorFromNav(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeDoorIndex === idx
                    ? 'bg-gradient-to-r from-[#FFB000] to-[#FF5722] text-[#0F1126] shadow-[0_0_15px_rgba(255,176,0,0.6)] font-extrabold scale-105'
                    : 'bg-[#002B30]/60 text-[#FFF1D6]/70 hover:text-white hover:bg-[#008C95]/30'
                }`}
              >
                <span>Door {door.id}</span>
                <span className="hidden md:inline font-normal text-[11px]">{door.title.split(' ')[1] || ''}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Corridor Active Door Presentation (Visible in 'corridor' & 'opening' modes) */}
      {doorState !== 'inside' && (
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center my-auto min-h-[75vh]">
          
          {/* Ornate 2D Illustrated Indian Archway & Physical Swing Door Frame */}
          <div className="relative w-full max-w-md aspect-[3/4] my-6 rounded-t-full p-4 bg-[#090B18] border-4 border-[#FFB000] shadow-[0_0_50px_rgba(255,176,0,0.35)] flex flex-col justify-between items-center overflow-hidden">
            
            {/* Top Rajasthani Decorative Arch Trim & Marigold Toran Garland */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#FFB000]/30 to-transparent flex items-center justify-center pointer-events-none z-20">
              <div className="flex items-center gap-2 text-2xl">
                <span>🏵️</span>
                <span>🌼</span>
                <span>🪔</span>
                <span>🌼</span>
                <span>🏵️</span>
              </div>
            </div>

            {/* Brass Hanging Bells on Left & Right */}
            <div className="absolute top-4 left-3 text-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>🔔</div>
            <div className="absolute top-4 right-3 text-xl z-20 animate-bounce" style={{ animationDuration: '2.6s' }}>🔔</div>

            {/* Glowing Golden Portal Light Beam (Revealed behind the opening doors) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-[#FFB000] via-[#FF5722] to-[#E91E63] flex flex-col items-center justify-center transition-opacity duration-700 z-0 ${
                doorState === 'opening' ? 'opacity-100 scale-105' : 'opacity-40'
              }`}
            >
              <div className="w-32 h-32 rounded-full bg-[#FFF1D6]/80 blur-2xl animate-pulse" />
              <div className="text-4xl animate-spin" style={{ animationDuration: '8s' }}>✨</div>
            </div>

            {/* 2D PHYSICAL DOOR SWING CONTAINER (CSS 3D Perspective Hinge Rotation) */}
            <div
              className="relative w-full h-full z-10 flex cursor-pointer group"
              style={{ perspective: '1200px' }}
              onClick={() => handleOpenDoor(activeDoorIndex)}
            >
              {/* LEFT 2D DOOR LEAF (Hinge on Left) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-br ${currentDoor.doorBg} border-r border-[#FFB000]/40 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-left ${
                  doorState === 'opening' ? '-rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:-rotate-y-6'
                }`}
              >
                {/* Carved Door Pattern Panels */}
                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-3xl shadow-inner">
                  {currentDoor.patternIcon}
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-xl text-[#FFB000] font-serif font-bold">
                  🪔
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-2xl">
                  🌸
                </div>
              </div>

              {/* RIGHT 2D DOOR LEAF (Hinge on Right) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-bl ${currentDoor.doorBg} border-l border-[#FFB000]/40 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-right relative ${
                  doorState === 'opening' ? 'rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:rotate-y-6'
                }`}
              >
                {/* Carved Door Pattern Panels */}
                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-3xl shadow-inner">
                  {currentDoor.patternIcon}
                </div>

                {/* Ornate Brass Handle Ring */}
                <div
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB000] to-[#FF5722] border-2 border-[#FFF1D6] shadow-[0_0_15px_rgba(255,176,0,0.8)] flex items-center justify-center transition-transform duration-300 ${
                    handleRotated ? '-rotate-45 scale-110' : 'group-hover:rotate-12'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#0F1126]" />
                </div>

                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-xl text-[#FFB000] font-serif font-bold">
                  🪔
                </div>
                <div className="w-full h-24 rounded-2xl border-2 border-[#FFB000]/40 bg-black/20 flex items-center justify-center text-2xl">
                  🌸
                </div>
              </div>

            </div>

            {/* Bottom Door Step Threshold */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#FFB000] via-[#FF5722] to-[#FFB000] z-20" />
          </div>

          {/* Active Door Information & Action Box */}
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0F1126]/90 border-2 border-[#FFB000]/50 backdrop-blur-md shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFB000]/20 border border-[#FFB000]/40 text-[#FFB000] text-xs font-extrabold tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#20C9C3]" />
              <span>{currentDoor.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-festive-gradient mb-2">
              {currentDoor.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#FFF1D6]/80 font-light mb-5">
              {currentDoor.subtitle}
            </p>

            <button
              onClick={() => handleOpenDoor(activeDoorIndex)}
              disabled={doorState === 'opening'}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-white font-extrabold text-base shadow-[0_0_25px_rgba(233,30,99,0.5)] hover:shadow-[0_0_40px_rgba(255,176,0,0.8)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>{doorState === 'opening' ? 'Opening Door...' : `Open Door ${currentDoor.id} & Enter`}</span>
              <ArrowRight className="w-5 h-5 text-[#FFB000] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Prev / Next Door Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#008C95]/30 text-xs font-semibold text-[#FFF1D6]/70">
              <button
                onClick={() => handleSelectDoorFromNav(Math.max(0, activeDoorIndex - 1))}
                disabled={activeDoorIndex === 0}
                className="flex items-center gap-1 hover:text-[#FFB000] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Door</span>
              </button>

              <span className="text-xs font-mono text-[#FFB000]">
                {activeDoorIndex + 1} of {PALACE_DOORS_2D.length}
              </span>

              <button
                onClick={() => handleSelectDoorFromNav(Math.min(PALACE_DOORS_2D.length - 1, activeDoorIndex + 1))}
                disabled={activeDoorIndex === PALACE_DOORS_2D.length - 1}
                className="flex items-center gap-1 hover:text-[#FFB000] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer"
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
        <div className="relative z-30 min-h-screen bg-[#0F1126]/95 pt-20 pb-16 px-3 sm:px-6 animate-fade-in flex flex-col justify-between">
          
          {/* Chamber Header Control Bar */}
          <div className="max-w-6xl mx-auto w-full mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#002B30]/80 border border-[#008C95]/50 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-[#FFB000] text-[#0F1126] text-xs font-extrabold uppercase">
                Chamber {currentDoor.id} of 6
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#FFF1D6]">
                  {currentDoor.title}
                </h3>
                <p className="text-xs text-[#FFF1D6]/70 font-light hidden sm:block">
                  {currentDoor.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStepBackToCorridor}
                className="px-4 py-2 rounded-xl bg-[#0F1126] border border-[#008C95]/50 text-xs font-bold text-[#FFF1D6] hover:border-[#FFB000] flex items-center gap-2 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>Exit Chamber</span>
              </button>

              <button
                onClick={handleNextDoor}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFB000] to-[#FF5722] text-[#0F1126] text-xs font-extrabold shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
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
            {activeDoorIndex === 5 && <FinalSection onRestartExperience={onRestartExperience} />}
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

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, ArrowRight, X, Key, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

import { RangoliMaster } from './ExperienceZone/RangoliMaster';
import { LightUpDiyas } from './ExperienceZone/LightUpDiyas';
import { DiwaliMemoryMatch } from './ExperienceZone/DiwaliMemoryMatch';
import { FirecrackerSimulator } from './FirecrackerSimulator';
import { FestivalPassport } from './FestivalPassport';
import { FinalSection } from './FinalSection';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from './MadhubaniCard';

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
      {/* Background Warli Motif & Subtle Ambient Lighting */}
      <div className="absolute inset-0 bg-warli-pattern opacity-10 pointer-events-none" />

      {/* Corridor Active Door Presentation (Visible in 'corridor' & 'opening' modes) */}
      {doorState !== 'inside' && (
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center my-auto min-h-[75vh]">
          
          {/* Handcrafted Indian Folk Art Haveli Rectangular Palace Door Frame */}
          <div className="relative w-full max-w-md aspect-[3/4.2] my-6 rounded-2xl p-4 bg-gradient-to-b from-[#1E090D] via-[#140609] to-[#0A0305] border-[4px] border-[#211A17] shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.3)] flex flex-col justify-between items-center overflow-hidden">
            
            {/* Inner Double Gold Hairline Border & Madhubani Corner Spandrels on Frame */}
            <div className="absolute inset-1.5 rounded-[12px] border-2 border-[#E8B947]/70 pointer-events-none z-30" />
            <MadhubaniCorner position="top-left" size={32} className="z-30" />
            <MadhubaniCorner position="top-right" size={32} className="z-30" />
            <MadhubaniCorner position="bottom-left" size={32} className="z-30" />
            <MadhubaniCorner position="bottom-right" size={32} className="z-30" />

            {/* Top Rectangular Carved Lintel Pediment with Sahasrara Solar Wheel & Toran Garland */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#2C0D12] via-[#1F070A] to-transparent border-b-2 border-[#E8B947]/60 flex items-center justify-between px-6 pointer-events-none z-20">
              <svg viewBox="0 0 400 50" className="w-full h-full text-[#E8B947]">
                {/* Carved Lintel Double-Line Frieze */}
                <rect x="0" y="2" width="400" height="30" fill="#140609" stroke="#211A17" strokeWidth="2" />
                <rect x="4" y="6" width="392" height="22" fill="#2A0B10" stroke="#E8B947" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Central Sahasrara Solar Wheel */}
                <circle cx="200" cy="17" r="10" fill="#A82420" stroke="#211A17" strokeWidth="1.5" />
                <circle cx="200" cy="17" r="5" fill="#E8B947" />
                <path d="M185,17 L215,17 M200,2 L200,32 M190,7 L210,27 M190,27 L210,7" stroke="#E8B947" strokeWidth="1" />
                
                {/* Hanging Marigold Toran Garland */}
                <path
                  d="M10,32 Q100,48 200,38 Q300,48 390,32"
                  fill="none"
                  stroke="#FF9800"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                />
              </svg>
            </div>

            {/* Swaying Brass Temple Bells on Left & Right with Dynamic Physical Motion */}
            <div className="absolute top-2 left-4 text-[#E8B947] z-20 flex flex-col items-center animate-bounce" style={{ animationDuration: '3.4s' }}>
              <div className="w-[1.5px] h-5 bg-[#E8B947]" />
              <div className="text-xl drop-shadow-[0_0_10px_rgba(232,185,71,0.8)]">🔔</div>
            </div>
            <div className="absolute top-2 right-4 text-[#E8B947] z-20 flex flex-col items-center animate-bounce" style={{ animationDuration: '2.8s' }}>
              <div className="w-[1.5px] h-5 bg-[#E8B947]" />
              <div className="text-xl drop-shadow-[0_0_10px_rgba(232,185,71,0.8)]">🔔</div>
            </div>

            {/* Glowing Golden Portal Light Beam (Revealed behind the opening doors) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-[#E5C158] via-[#FFB74D] to-[#A8422B] flex flex-col items-center justify-center transition-opacity duration-700 z-0 ${
                doorState === 'opening' ? 'opacity-100 scale-105' : 'opacity-35'
              }`}
            >
              <div className="w-40 h-40 rounded-full bg-[#FFF8E7]/80 blur-2xl animate-pulse" />
              <div className="text-5xl text-[#0B1021] animate-spin" style={{ animationDuration: '10s' }}>✨</div>
            </div>

            {/* 3D PHYSICAL PERSPECTIVE RECTANGULAR DOOR SWING CONTAINER */}
            <div
              className="relative w-full h-full z-10 flex cursor-pointer group mt-10 mb-2"
              style={{ perspective: '1200px' }}
              onClick={() => handleOpenDoor(activeDoorIndex)}
            >
              {/* LEFT DOOR LEAF (Hinge on Left) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-br ${currentDoor.doorBg} border-r-2 border-[#211A17] p-2.5 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-left relative ${
                  doorState === 'opening' ? '-rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:-rotate-y-6'
                }`}
              >
                {/* Left Leaf Inner Brass Hairline */}
                <div className="absolute inset-1 rounded-lg border border-[#E8B947]/50 pointer-events-none" />

                {/* Vertical Brass Rivet Studs */}
                <div className="absolute right-1 top-2 bottom-2 flex flex-col justify-between text-[8px] text-[#E8B947] pointer-events-none opacity-80">
                  <span>♦</span><span>♦</span><span>♦</span><span>♦</span><span>♦</span>
                </div>

                {/* Panel 1: Top Carved Icon & Madhubani Katchni Panel */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-madhubani-katchni opacity-30" />
                  <span className="relative z-10 text-2xl drop-shadow-md">{currentDoor.patternIcon}</span>
                </div>

                {/* Panel 2: Upper Middle Chamber Badge Niche */}
                <div className="w-full h-16 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex items-center justify-center text-lg text-[#E8B947] relative shadow-inner">
                  <span className="drop-shadow-md">🦚</span>
                </div>

                {/* Panel 3: Center Carved Illuminated Diya Motif */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex flex-col items-center justify-center text-2xl text-[#E8B947] font-serif font-bold relative shadow-inner">
                  <span className="drop-shadow-[0_0_12px_rgba(232,185,71,0.8)]">🪔</span>
                </div>

                {/* Panel 4: Bottom Sacred Lotus Rosette */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex items-center justify-center text-xl text-[#E8B947] relative shadow-inner">
                  <span className="drop-shadow-md">🌸</span>
                </div>
              </div>

              {/* RIGHT DOOR LEAF (Hinge on Right) */}
              <div
                className={`w-1/2 h-full bg-gradient-to-bl ${currentDoor.doorBg} border-l-2 border-[#211A17] p-2.5 flex flex-col justify-between shadow-2xl transition-transform duration-900 ease-out origin-right relative ${
                  doorState === 'opening' ? 'rotate-y-[105deg] opacity-20' : 'rotate-y-0 group-hover:rotate-y-6'
                }`}
              >
                {/* Right Leaf Inner Brass Hairline */}
                <div className="absolute inset-1 rounded-lg border border-[#E8B947]/50 pointer-events-none" />

                {/* Vertical Brass Rivet Studs */}
                <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-between text-[8px] text-[#E8B947] pointer-events-none opacity-80">
                  <span>♦</span><span>♦</span><span>♦</span><span>♦</span><span>♦</span>
                </div>

                {/* Panel 1: Top Carved Icon */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-madhubani-katchni opacity-30" />
                  <span className="relative z-10 text-2xl drop-shadow-md">{currentDoor.patternIcon}</span>
                </div>

                {/* 3D Ornate Antique Lion-Head Escutcheon & Brass Handle Ring */}
                <div
                  className={`absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#E8B947] via-[#C59B27] to-[#8C3214] border-2 border-[#FFF8E7] shadow-[0_6px_20px_rgba(0,0,0,0.9),0_0_20px_rgba(232,185,71,0.8)] flex items-center justify-center transition-transform duration-300 z-20 ${
                    handleRotated ? '-rotate-45 scale-110' : 'group-hover:rotate-12'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full border-2 border-[#1A0B0E] bg-[#C59B27]/40 shadow-inner flex items-center justify-center text-xs text-[#FFF8E7]">
                    🦁
                  </div>
                </div>

                {/* Panel 2: Upper Middle Chamber Badge Niche */}
                <div className="w-full h-16 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex items-center justify-center text-lg text-[#E8B947] relative shadow-inner">
                  <span className="drop-shadow-md">🦚</span>
                </div>

                {/* Panel 3: Center Carved Diya Motif */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex flex-col items-center justify-center text-2xl text-[#E8B947] font-serif font-bold relative shadow-inner">
                  <span className="drop-shadow-[0_0_12px_rgba(232,185,71,0.8)]">🪔</span>
                </div>

                {/* Panel 4: Bottom Sacred Lotus Rosette */}
                <div className="w-full h-20 rounded-xl border-2 border-[#E8B947]/60 bg-[#16060A]/80 flex items-center justify-center text-xl text-[#E8B947] relative shadow-inner">
                  <span className="drop-shadow-md">🌸</span>
                </div>
              </div>

            </div>

            {/* Bottom Door Step Threshold with Terracotta & Brass Inlay */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#E8B947] via-[#8C3214] to-[#E8B947] z-20 shadow-md border-t border-[#211A17]" />
          </div>

          {/* Active Door Information & Action Box with Authentic Madhubani Double-Line Framing */}
          <MadhubaniBox
            variant="maroon"
            className="w-full max-w-lg text-center"
            cornerSize={42}
          >
            {/* Clean Madhubani Metadata Ribbon Badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#E8B947] tracking-widest uppercase mb-2">
              <span className="text-[#A82420]">🪔</span>
              <span>{currentDoor.badge}</span>
              <span className="text-[#A82420]">🪔</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-royal-gold-gradient mb-2 drop-shadow-md">
              {currentDoor.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#FFF8E7]/85 font-light mb-4">
              {currentDoor.subtitle}
            </p>

            <MadhubaniDivider className="my-3 max-w-xs mx-auto" />

            <button
              onClick={() => handleOpenDoor(activeDoorIndex)}
              disabled={doorState === 'opening'}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8C3214] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-base border border-[#FFF8E7]/50 shadow-[0_8px_25px_rgba(212,175,55,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_35px_rgba(229,193,88,0.7)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>{doorState === 'opening' ? 'Opening Door...' : `Open Door ${currentDoor.id} & Enter`}</span>
              <ArrowRight className="w-5 h-5 text-[#0B1021] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Prev / Next Door Navigation Buttons */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#E8B947]/30 text-xs font-semibold text-[#FFF8E7]/80">
              <button
                onClick={() => handleSelectDoorFromNav(Math.max(0, activeDoorIndex - 1))}
                disabled={activeDoorIndex === 0}
                className="flex items-center gap-1 hover:text-[#E8B947] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#E8B947]" />
                <span>Prev Door</span>
              </button>

              <span className="text-xs font-mono font-bold text-[#E8B947] px-2 py-0.5 rounded-md bg-[#120508] border border-[#E8B947]/40">
                {activeDoorIndex + 1} of {PALACE_DOORS_2D.length}
              </span>

              <button
                onClick={() => handleSelectDoorFromNav(Math.min(PALACE_DOORS_2D.length - 1, activeDoorIndex + 1))}
                disabled={activeDoorIndex === PALACE_DOORS_2D.length - 1}
                className="flex items-center gap-1 hover:text-[#E8B947] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
              >
                <span>Next Door</span>
                <ChevronRight className="w-4 h-4 text-[#E8B947]" />
              </button>
            </div>
          </MadhubaniBox>

        </div>
      )}

      {/* 3. Chamber Feature Mount Overlay (Revealed when doorState === 'inside') */}
      {doorState === 'inside' && (
        <div className="relative z-30 min-h-screen bg-[#120508]/96 py-8 px-3 sm:px-6 animate-fade-in flex flex-col justify-between">
          
          {/* Chamber Header Control Bar with Authentic Madhubani Double Border */}
          <div className="max-w-6xl mx-auto w-full mb-6 relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#240A10]/95 via-[#1B070B]/95 to-[#120508]/95 border-[3px] border-[#211A17] shadow-folk-3d overflow-hidden">
            {/* Inner Double Gold Hairline */}
            <div className="absolute inset-1.5 rounded-[12px] border border-[#E8B947]/60 pointer-events-none" />
            <MadhubaniCorner position="top-left" size={28} />
            <MadhubaniCorner position="top-right" size={28} />
            <MadhubaniCorner position="bottom-left" size={28} />
            <MadhubaniCorner position="bottom-right" size={28} />

            <div className="relative z-10 flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A82420] to-[#C59B27] text-[#FFF8E7] text-xs font-extrabold uppercase border border-[#E8B947]/60 shadow-md">
                Chamber {currentDoor.id} of 6
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-royal-gold-gradient">
                  {currentDoor.title}
                </h3>
                <p className="text-xs text-[#FFF8E7]/75 font-light hidden sm:block">
                  {currentDoor.subtitle}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <button
                onClick={handleStepBackToCorridor}
                className="px-4 py-2 rounded-xl bg-[#140609] border-2 border-[#E8B947]/50 text-xs font-bold text-[#FFF8E7] hover:border-[#E8B947] flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <X className="w-4 h-4 text-[#A82420]" />
                <span>Exit Chamber</span>
              </button>

              <button
                onClick={handleNextDoor}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8C3214] via-[#C59B27] to-[#E5C158] text-[#0B1021] text-xs font-extrabold shadow-md hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
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
          <div className="max-w-6xl mx-auto w-full mt-10 pt-4 border-t border-[#D4AF37]/25 flex items-center justify-between text-xs text-[#FFF8E7]/65">
            <span>🪔 Diwali Palace Chamber Navigation</span>
            <button
              onClick={handleStepBackToCorridor}
              className="hover:text-[#E5C158] underline cursor-pointer transition-colors"
            >
              Return to Palace Corridor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

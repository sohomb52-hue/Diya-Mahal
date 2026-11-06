import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Lock, Sparkles, Heart, Share2, Compass } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { DiwaliWishes } from './DiwaliWishes';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from './MadhubaniCard';

export interface AchievementStamp {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
}

const INITIAL_STAMPS: AchievementStamp[] = [
  {
    id: 'diya_lit',
    title: 'Spark of Devotion',
    category: 'Sacred Flame',
    description: 'Lit the sacred 3D terracotta diya at the palace threshold.',
    icon: '🪔',
    unlocked: true,
    dateUnlocked: 'Diwali Night',
  },
  {
    id: 'rangoli_created',
    title: 'Rangoli Virtuoso',
    category: 'Sacred Geometry',
    description: 'Painted a symmetrical lotus mandala in the Rangoli Garden.',
    icon: '🌸',
    unlocked: false,
  },
  {
    id: 'diyas_illuminated',
    title: 'Courtyard Illuminator',
    category: 'Festival of Lights',
    description: 'Lit every oil lamp in the Courtyard of Lights.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'memory_won',
    title: 'Memory Virtuoso',
    category: 'Mind & Harmony',
    description: 'Matched all festive symbol pairs in the Memory Chamber.',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'fireworks_launched',
    title: 'Pyrotechnic Master',
    category: 'Sky of Lights',
    description: 'Ignited a spectacular fireworks show over the city sky.',
    icon: '🎆',
    unlocked: false,
  },
  {
    id: 'palace_explorer',
    title: 'Royal Explorer',
    category: 'Palace Journey',
    description: 'Explored all 6 festive chambers of the Diwali Palace.',
    icon: '👑',
    unlocked: false,
  },
];

interface FestivalPassportProps {
  initialTab?: 'stamps' | 'wishes';
}

export const FestivalPassport: React.FC<FestivalPassportProps> = ({ initialTab = 'wishes' }) => {
  const [stamps, setStamps] = useState<AchievementStamp[]>(() => {
    try {
      const saved = localStorage.getItem('diwali_festival_passport_stamps');
      if (saved) {
        const parsed = JSON.parse(saved);
        return INITIAL_STAMPS.map((init) => {
          const found = parsed.find((p: AchievementStamp) => p.id === init.id);
          return found ? { ...init, unlocked: found.unlocked, dateUnlocked: found.dateUnlocked } : init;
        });
      }
    } catch {
      // safe fallback
    }
    return INITIAL_STAMPS;
  });

  const [activeSubTab, setActiveSubTab] = useState<'stamps' | 'wishes'>(initialTab);

  useEffect(() => {
    try {
      localStorage.setItem('diwali_festival_passport_stamps', JSON.stringify(stamps));
    } catch {
      // safe fallback
    }
  }, [stamps]);

  const unlockedCount = stamps.filter((s) => s.unlocked).length;
  const progressPercent = Math.round((unlockedCount / stamps.length) * 100);

  const handleTabChange = (tab: 'stamps' | 'wishes') => {
    soundManager.playClick();
    setActiveSubTab(tab);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 text-[#FFF1D6]">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFB000]/20 border border-[#FFB000]/40 text-[#FFB000] text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5 text-[#FFB000]" />
          <span>OFFICIAL DIWALI CELEBRATION PASSPORT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-serif text-festive-gradient mb-2">
          Your Festival Passport
        </h2>
        <p className="text-sm sm:text-base text-[#FFF1D6]/80 max-w-lg mx-auto">
          Collect golden royal seals as you explore the palace chambers, play games, light diyas, and craft wishes.
        </p>
      </div>

      {/* Segmented Control Bar */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => handleTabChange('stamps')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'stamps'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B1021] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              : 'bg-[#0B1021]/80 border border-[#D4AF37]/30 text-[#FFF8E7]/80 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Passport Stamps ({unlockedCount}/{stamps.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('wishes')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'wishes'
              ? 'bg-gradient-to-r from-[#A8422B] to-[#C59B27] text-white shadow-[0_0_20px_rgba(168,66,43,0.4)]'
              : 'bg-[#0B1021]/80 border border-[#D4AF37]/30 text-[#FFF8E7]/80 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-[#E5C158]" />
          <span>Greeting Card Studio</span>
        </button>
      </div>

      {activeSubTab === 'stamps' ? (
        <div className="space-y-8">
          {/* Progress Bar Card with Authentic Madhubani Double Border */}
          <MadhubaniBox
            variant="maroon"
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            cornerSize={36}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8B947] via-[#C65D38] to-[#A82420] p-1 flex items-center justify-center border-2 border-[#211A17] shadow-lg">
                <div className="w-full h-full rounded-[10px] bg-[#140609] flex items-center justify-center text-3xl border border-[#E8B947]/50 shadow-inner">
                  📜
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-royal-gold-gradient">
                  Royal Celebration Level: {progressPercent === 100 ? 'Grand Festival Master 👑' : 'Palace Pilgrim ✨'}
                </h3>
                <p className="text-xs text-[#FFF8E7]/75 font-light">
                  {unlockedCount} of {stamps.length} Royal Seals Claimed in the Palace
                </p>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold font-serif text-[#E8B947]">
                <span>Mithila Passport Progress</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-[#120508] overflow-hidden border-2 border-[#E8B947]/50 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] transition-all duration-700 shadow-md"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </MadhubaniBox>

          {/* Grid of Passport Stamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stamps.map((stamp) => (
              <div
                key={stamp.id}
                className={`relative p-6 sm:p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  stamp.unlocked
                    ? 'bg-gradient-to-br from-[#2D0D14]/95 via-[#1A070B]/95 to-[#120407]/98 border-[3.5px] border-[#211A17] shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(232,185,71,0.25)]'
                    : 'bg-[#120508]/75 border-[3px] border-[#211A17]/80 opacity-70'
                }`}
              >
                {/* Inner Double Hairline */}
                <div className="absolute inset-2 rounded-[20px] border border-[#E8B947]/50 pointer-events-none" />
                <div className="absolute inset-0 bg-madhubani-katchni opacity-15 pointer-events-none" />

                {/* Madhubani Corner Spandrels on Stamp */}
                <MadhubaniCorner position="top-left" size={26} />
                <MadhubaniCorner position="top-right" size={26} />
                <MadhubaniCorner position="bottom-left" size={26} />
                <MadhubaniCorner position="bottom-right" size={26} />

                {/* Stamp Seal Graphic */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 shadow-md ${
                      stamp.unlocked
                        ? 'bg-gradient-to-br from-[#E8B947] via-[#C65D38] to-[#A82420] border-[#FFF8E7] text-white shadow-[0_0_15px_rgba(232,185,71,0.5)]'
                        : 'bg-[#1A0A0E] border-[#E8B947]/30 text-[#FFF8E7]/40'
                    }`}
                  >
                    {stamp.icon}
                  </div>

                  <div className="flex items-center gap-1">
                    {stamp.unlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold font-serif">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300/60 text-[10px] font-bold font-serif">
                        <Lock className="w-3 h-3 text-amber-400/60" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] font-bold font-serif uppercase tracking-wider text-[#E8B947] block mb-1">
                    {stamp.category}
                  </span>
                  <h4 className="text-lg font-bold font-serif text-[#FFF8E7] mb-1.5">
                    {stamp.title}
                  </h4>
                  <p className="text-xs text-[#FFF8E7]/75 leading-relaxed font-light">
                    {stamp.description}
                  </p>
                </div>

                {stamp.unlocked && stamp.dateUnlocked && (
                  <div className="relative z-10 mt-4 pt-3 border-t-2 border-[#E8B947]/30 flex items-center justify-between text-[10px] text-[#E8B947]/90 font-serif">
                    <span className="font-mono font-bold">SEAL #MITHILA-2026</span>
                    <span>{stamp.dateUnlocked}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DiwaliWishes />
      )}
    </div>
  );
};

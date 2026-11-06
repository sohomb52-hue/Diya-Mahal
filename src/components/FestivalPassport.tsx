import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Lock, Sparkles, Heart, Share2, Compass } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { DiwaliWishes } from './DiwaliWishes';

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
          {/* Progress Bar Card */}
          <div className="bg-[#0B1021]/90 border border-[#D4AF37]/35 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A8422B] p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-[#0B1021] flex items-center justify-center text-3xl">
                  📜
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#E5C158]">
                  Royal Celebration Level: {progressPercent === 100 ? 'Grand Festival Master 👑' : 'Palace Pilgrim ✨'}
                </h3>
                <p className="text-xs text-[#FFF8E7]/70">
                  {unlockedCount} of {stamps.length} Royal Seals Claimed
                </p>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-[#E5C158]">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#141C38] overflow-hidden border border-[#D4AF37]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#A8422B] via-[#D4AF37] to-[#E5C158] transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grid of Passport Stamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stamps.map((stamp) => (
              <div
                key={stamp.id}
                className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  stamp.unlocked
                    ? 'bg-gradient-to-br from-[#141C38]/95 via-[#0B1021]/95 to-[#004D54]/60 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)]'
                    : 'bg-[#0B1021]/60 border-[#D4AF37]/20 opacity-75'
                }`}
              >
                {/* Stamp Seal Graphic */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 shadow-md ${
                      stamp.unlocked
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#A8422B] border-[#FFF8E7] text-white shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                        : 'bg-[#141C38]/50 border-[#D4AF37]/30 text-[#FFF8E7]/40'
                    }`}
                  >
                    {stamp.icon}
                  </div>

                  <div className="flex items-center gap-1">
                    {stamp.unlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300/60 text-[10px] font-bold">
                        <Lock className="w-3 h-3 text-amber-400/60" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C158] block mb-1">
                    {stamp.category}
                  </span>
                  <h4 className="text-lg font-bold font-serif text-[#FFF8E7] mb-1.5">
                    {stamp.title}
                  </h4>
                  <p className="text-xs text-[#FFF8E7]/70 leading-relaxed font-light">
                    {stamp.description}
                  </p>
                </div>

                {stamp.unlocked && stamp.dateUnlocked && (
                  <div className="mt-4 pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between text-[10px] text-[#E5C158]/80">
                    <span className="font-mono">SEAL #DIWALI-2026</span>
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

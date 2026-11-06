import React, { useState } from 'react';
import { Paintbrush, Flame, Eye, Sparkles } from 'lucide-react';
import { RangoliMaster } from './RangoliMaster';
import { LightUpDiyas } from './LightUpDiyas';
import { DiwaliMemoryMatch } from './DiwaliMemoryMatch';
import { soundManager } from '../../utils/audio';

type GameTab = 'rangoli' | 'diyas' | 'memory';

export const ExperienceZone: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>('rangoli');

  const handleTabChange = (tab: GameTab) => {
    soundManager.playClick();
    setActiveTab(tab);
  };

  return (
    <section id="games" className="relative w-full min-h-screen py-24 px-4 bg-gradient-to-b from-[#0B1021] via-[#141C38] to-[#0B1021] overflow-hidden">
      {/* Background Glow Spheres (Twilight Palace Teal & Soft Amber) */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-[#004D54]/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141C38]/90 border border-[#D4AF37]/35 text-[#E5C158] text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
            <span>PLAY & CELEBRATE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-royal-gold-gradient glow-royal-gold mb-3">
            Festival of Games & Art
          </h2>
        </div>

        {/* Game Segmented Tab Bar with Twilight Palace & Courtyard Palette */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 overflow-x-auto p-1.5 bg-[#0B1021]/85 border border-[#D4AF37]/30 rounded-2xl max-w-2xl mx-auto backdrop-blur-md shadow-xl">
          <button
            onClick={() => handleTabChange('rangoli')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'rangoli'
                ? 'bg-gradient-to-r from-[#A8422B] to-[#D4AF37] text-[#0B1021] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'text-[#FFF8E7]/70 hover:text-white hover:bg-[#D4AF37]/10'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>1. Rangoli Studio</span>
          </button>

          <button
            onClick={() => handleTabChange('diyas')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'diyas'
                ? 'bg-gradient-to-r from-[#004D54] to-[#008C95] text-[#FFF8E7] shadow-[0_0_20px_rgba(0,140,149,0.4)]'
                : 'text-[#FFF8E7]/70 hover:text-white hover:bg-[#D4AF37]/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>2. Courtyard Diyas</span>
          </button>

          <button
            onClick={() => handleTabChange('memory')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B1021] shadow-[0_0_20px_rgba(229,193,88,0.4)]'
                : 'text-[#FFF8E7]/70 hover:text-white hover:bg-[#D4AF37]/10'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>3. Memory Match</span>
          </button>
        </div>

        {/* Active Game Viewport */}
        <div className="w-full">
          {activeTab === 'rangoli' && <RangoliMaster />}
          {activeTab === 'diyas' && <LightUpDiyas />}
          {activeTab === 'memory' && <DiwaliMemoryMatch />}
        </div>
      </div>
    </section>
  );
};

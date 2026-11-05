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
    <section id="games" className="relative w-full min-h-screen py-24 px-4 bg-gradient-to-b from-[#004D54] via-[#0F1126] to-[#0F1126] overflow-hidden">
      {/* Background Glow Spheres (Peacock Teal & Hot Magenta) */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-[#008C95]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF2E88]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#008C95]/30 border border-[#20C9C3]/40 text-[#FFB000] text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(32,201,195,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#20C9C3]" />
            <span>PLAY & CELEBRATE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-festive-gradient glow-festive-text mb-3">
            Festival of Games & Art
          </h2>
        </div>

        {/* Game Segmented Tab Bar with Distinct Color Identities */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 overflow-x-auto p-1.5 bg-[#0F1126]/85 border border-[#008C95]/40 rounded-2xl max-w-2xl mx-auto backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleTabChange('rangoli')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'rangoli'
                ? 'bg-gradient-to-r from-[#E91E63] to-[#FF8F00] text-white shadow-[0_0_20px_rgba(233,30,99,0.6)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#008C95]/20'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>1. Rangoli Studio</span>
          </button>

          <button
            onClick={() => handleTabChange('diyas')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'diyas'
                ? 'bg-gradient-to-r from-[#008C95] to-[#20C9C3] text-[#0F1126] shadow-[0_0_20px_rgba(32,201,195,0.6)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#008C95]/20'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>2. Courtyard Diyas</span>
          </button>

          <button
            onClick={() => handleTabChange('memory')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-[#FF5722] to-[#FFB000] text-[#0F1126] shadow-[0_0_20px_rgba(255,176,0,0.6)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#008C95]/20'
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

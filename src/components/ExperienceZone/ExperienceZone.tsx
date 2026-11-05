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
    <section id="games" className="relative w-full min-h-screen py-24 px-4 bg-[#160B2B] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#A51C69]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#38145E] border border-[#FFD166]/30 text-[#FFD166] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span>PLAY & CELEBRATE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-gold-gradient glow-gold-text mb-3">
            Let The Festivities Begin
          </h2>
        </div>

        {/* Game Segmented Tab Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 overflow-x-auto p-1.5 bg-[#38145E]/60 border border-[#A51C69]/30 rounded-2xl max-w-2xl mx-auto backdrop-blur-md">
          <button
            onClick={() => handleTabChange('rangoli')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'rangoli'
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] shadow-[0_0_15px_rgba(255,90,31,0.5)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#160B2B]/40'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>1. Rangoli Master</span>
          </button>

          <button
            onClick={() => handleTabChange('diyas')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'diyas'
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] shadow-[0_0_15px_rgba(255,90,31,0.5)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#160B2B]/40'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>2. Light Up The Diyas</span>
          </button>

          <button
            onClick={() => handleTabChange('memory')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] shadow-[0_0_15px_rgba(255,90,31,0.5)]'
                : 'text-[#FFF1D6]/70 hover:text-white hover:bg-[#160B2B]/40'
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

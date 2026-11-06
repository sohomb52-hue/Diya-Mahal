import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, Flame, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { isCourtyardFullyLit } from '../../utils/gameLogic';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from '../MadhubaniCard';

interface DiyaItem {
  id: number;
  x: number; // percentage
  y: number; // percentage
  isLit: boolean;
  color: string;
}

const INITIAL_DIYAS: DiyaItem[] = [
  { id: 1, x: 50, y: 18, isLit: false, color: '#FFB000' }, // Marigold
  { id: 2, x: 74, y: 30, isLit: false, color: '#E91E63' }, // Rani Pink
  { id: 3, x: 84, y: 52, isLit: false, color: '#20C9C3' }, // Turquoise
  { id: 4, x: 74, y: 74, isLit: false, color: '#FF5722' }, // Vermilion
  { id: 5, x: 50, y: 84, isLit: false, color: '#FF8F00' }, // Saffron
  { id: 6, x: 26, y: 74, isLit: false, color: '#E63946' }, // Sindoor Red
  { id: 7, x: 16, y: 52, isLit: false, color: '#20C9C3' }, // Turquoise
  { id: 8, x: 26, y: 30, isLit: false, color: '#E91E63' }, // Rani Pink
  { id: 9, x: 50, y: 52, isLit: false, color: '#FFB000' }, // Center Diya (Marigold)
];

export const LightUpDiyas: React.FC = () => {
  const [diyas, setDiyas] = useState<DiyaItem[]>(INITIAL_DIYAS);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);

  // Timer Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimedMode && isGameActive && timeLeft > 0 && !isVictorious) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimedMode, isGameActive, timeLeft, isVictorious]);

  const litCount = diyas.filter((d) => d.isLit).length;

  const handleDiyaClick = (id: number) => {
    const diya = diyas.find((d) => d.id === id);
    if (!diya || diya.isLit) return;

    if (isTimedMode && !isGameActive && litCount === 0) {
      setIsGameActive(true);
    }

    soundManager.playIgnite();

    const updated = diyas.map((d) => (d.id === id ? { ...d, isLit: true } : d));
    setDiyas(updated);

    // Check if all lit
    if (isCourtyardFullyLit(updated)) {
      setIsVictorious(true);
      setIsGameActive(false);
      soundManager.playVictory();

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#E91E63', '#FF2E88', '#FFB000', '#20C9C3', '#FF5722'],
      });
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setDiyas(INITIAL_DIYAS);
    setTimeLeft(30);
    setIsGameActive(false);
    setIsVictorious(false);
  };

  return (
    <MadhubaniBox
      variant="maroon"
      className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto"
      cornerSize={42}
    >
      {/* HUD Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-[#E8B947]/30 pb-4 z-10">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-royal-gold-gradient flex items-center gap-2 drop-shadow-sm">
            <Flame className="w-5 h-5 text-[#A82420]" />
            <span>Courtyard of Lights</span>
          </h3>
          <p className="text-xs text-[#FFF8E7]/75 mt-1 font-light">
            Touch every terracotta diya to awaken the sacred festive glow!
          </p>
        </div>

        {/* Status Counters with Madhubani Double Border Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#140609] border-2 border-[#E8B947]/60 flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E8B947]" />
            <span className="text-xs font-semibold text-[#FFF8E7]">
              Lit: <strong className="text-[#E8B947] font-mono">{litCount} / {diyas.length}</strong>
            </span>
          </div>

          {isTimedMode && (
            <div className={`px-3.5 py-1.5 rounded-xl border-2 flex items-center gap-2 shadow-sm ${
              timeLeft < 8 ? 'bg-[#58111A]/90 border-red-500 text-red-200 animate-pulse' : 'bg-[#140609] border-[#A82420]/70 text-[#FFF8E7]'
            }`}>
              <Timer className="w-4 h-4 text-[#E8B947]" />
              <span className="text-xs font-bold tabular-nums font-mono text-[#E8B947]">{timeLeft}s</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#140609] border-2 border-[#E8B947]/60 text-[#FFF8E7] hover:border-[#FFF8E7] hover:scale-105 transition-all cursor-pointer shadow-sm"
            title="Reset Diyas"
          >
            <RefreshCw className="w-4 h-4 text-[#E8B947]" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#140609] border-2 border-[#E8B947]/40 z-10 shadow-sm">
        <button
          onClick={() => {
            setIsTimedMode(false);
            handleReset();
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            !isTimedMode
              ? 'bg-gradient-to-r from-[#8C3214] to-[#C59B27] text-white shadow-sm font-bold'
              : 'text-[#FFF8E7]/70 hover:text-white'
          }`}
        >
          Relaxed Mode
        </button>
        <button
          onClick={() => {
            setIsTimedMode(true);
            handleReset();
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            isTimedMode
              ? 'bg-gradient-to-r from-[#8C3214] to-[#C59B27] text-white shadow-sm font-bold'
              : 'text-[#FFF8E7]/70 hover:text-white'
          }`}
        >
          30s Challenge
        </button>
      </div>

      {/* Courtyard Interactive Diya Canvas Area with Terracotta Pavers & Rangoli Floor */}
      <div className="relative w-full aspect-[4/3] max-w-lg bg-gradient-to-b from-[#2D0D14] via-[#1D070C] to-[#120407] rounded-2xl border-[3px] border-[#211A17] overflow-hidden shadow-[inner_0_0_40px_rgba(0,0,0,0.85)] z-10">
        {/* Inner double border and corner ornaments */}
        <div className="absolute inset-1.5 rounded-[12px] border border-[#E8B947]/40 pointer-events-none z-10" />
        <MadhubaniCorner position="top-left" size={24} className="z-10" />
        <MadhubaniCorner position="top-right" size={24} className="z-10" />
        <MadhubaniCorner position="bottom-left" size={24} className="z-10" />
        <MadhubaniCorner position="bottom-right" size={24} className="z-10" />
        {/* Floor Mandala Geometry Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-dashed border-[#D4AF37] animate-spin-slow" />
          <div className="absolute w-44 h-44 rounded-full border border-[#FF9800]" />
          <div className="absolute w-24 h-24 rounded-full border border-[#E63946]" />
        </div>

        {/* Diyas Positioned in Sacred Mandala Pattern */}
        {diyas.map((d) => (
          <button
            key={d.id}
            onClick={() => handleDiyaClick(d.id)}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 cursor-pointer focus:outline-none ${
              d.isLit ? 'scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
            }`}
          >
            {/* Diya Graphics with Multi-coloured Flame */}
            <div className="relative flex flex-col items-center">
              {/* Flame (Visible when lit) */}
              {d.isLit && (
                <div className="absolute -top-7 animate-flame z-10 flex flex-col items-center">
                  {/* Glowing Flame Core with Diya's Distinctive Color */}
                  <div
                    className="w-4 h-7 shadow-lg"
                    style={{
                      background: `linear-gradient(to top, ${d.color}, #FFF8E7)`,
                      boxShadow: `0 0 20px ${d.color}`,
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    }}
                  />
                  {/* Ambient Light Ring */}
                  <div
                    className="absolute -inset-2 rounded-full blur-md"
                    style={{ backgroundColor: `${d.color}50` }}
                  />
                </div>
              )}

              {/* Clay Diya Bowl with Handcrafted Terracotta Finish */}
              <svg viewBox="0 0 60 30" className="w-12 h-6 sm:w-14 sm:h-7 drop-shadow-md">
                <path
                  d="M5,5 Q30,32 55,5 Q45,28 30,28 Q15,28 5,5 Z"
                  fill={d.isLit ? '#A8422B' : '#6E2008'}
                  stroke={d.isLit ? '#E5C158' : '#3E1005'}
                  strokeWidth="2"
                />
                <ellipse cx="30" cy="5" rx="25" ry="4" fill={d.isLit ? '#C59B27' : '#361008'} />
                {/* Hand-painted Alpana Rim Dots */}
                <circle cx="16" cy="14" r="1.2" fill="#FFF8E7" opacity="0.8" />
                <circle cx="23" cy="20" r="1.2" fill="#FFF8E7" opacity="0.8" />
                <circle cx="30" cy="22" r="1.5" fill="#FFF8E7" opacity="0.9" />
                <circle cx="37" cy="20" r="1.2" fill="#FFF8E7" opacity="0.8" />
                <circle cx="44" cy="14" r="1.2" fill="#FFF8E7" opacity="0.8" />
              </svg>
            </div>
          </button>
        ))}

        {/* Victory Overlay Modal */}
        {isVictorious && (
          <div className="absolute inset-0 bg-[#140609]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20 border-2 border-[#D4AF37]/60">
            <Trophy className="w-16 h-16 text-[#E5C158] mb-3 animate-bounce" />
            <h4 className="text-3xl font-bold font-serif text-royal-gold-gradient mb-2">
              Courtyard Illuminated!
            </h4>
            <p className="text-sm text-[#FFF8E7]/85 max-w-xs mb-6">
              You lit all {diyas.length} festive diyas and brought warmth and radiance to the royal courtyard!
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8C3214] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer border border-[#FFF8E7]/40"
            >
              Play Again ✨
            </button>
          </div>
        )}

        {/* Time Over Overlay Modal */}
        {!isGameActive && isTimedMode && timeLeft === 0 && !isVictorious && (
          <div className="absolute inset-0 bg-[#140609]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20 border-2 border-[#D4AF37]/60">
            <Timer className="w-12 h-12 text-red-400 mb-3" />
            <h4 className="text-2xl font-bold font-serif text-red-300 mb-2">Time Expired!</h4>
            <p className="text-sm text-[#FFF8E7]/80 max-w-xs mb-4">
              You lit {litCount} out of {diyas.length} diyas in 30 seconds.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-full bg-[#8C3214] text-white font-bold text-xs hover:scale-105 transition-all cursor-pointer border border-[#E5C158]/50"
            >
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    </MadhubaniBox>
  );
};

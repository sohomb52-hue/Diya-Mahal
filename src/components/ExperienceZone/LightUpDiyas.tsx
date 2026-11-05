import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, Flame, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { isCourtyardFullyLit } from '../../utils/gameLogic';

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
    <div className="flex flex-col items-center gap-6 bg-[#0F1126]/90 p-6 rounded-3xl border border-[#008C95]/40 backdrop-blur-md shadow-2xl w-full max-w-3xl mx-auto">
      {/* HUD Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#008C95]/30 pb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-[#FFB000] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#20C9C3]" />
            <span>Light Up The Courtyard</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Click on every unlit diya to awaken the colourful festive lights!
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#002B30]/80 border border-[#008C95]/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFB000]" />
            <span className="text-xs font-semibold text-[#FFF1D6]">
              Lit: <strong className="text-[#FFB000]">{litCount} / {diyas.length}</strong>
            </span>
          </div>

          {isTimedMode && (
            <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              timeLeft < 8 ? 'bg-red-900/60 border-red-500 text-red-200 animate-pulse' : 'bg-[#002B30]/80 border-[#FF5722]/40 text-[#FFF1D6]'
            }`}>
              <Timer className="w-4 h-4 text-[#FF5722]" />
              <span className="text-xs font-bold tabular-nums">{timeLeft}s</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#002B30] border border-[#008C95]/40 text-[#FFF1D6] hover:border-[#20C9C3] transition-colors"
            title="Reset Diyas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#002B30]/80 border border-[#008C95]/40">
        <button
          onClick={() => {
            setIsTimedMode(false);
            handleReset();
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            !isTimedMode ? 'bg-[#008C95] text-white shadow-sm' : 'text-[#FFF1D6]/70 hover:text-white'
          }`}
        >
          Relaxed Mode
        </button>
        <button
          onClick={() => {
            setIsTimedMode(true);
            handleReset();
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            isTimedMode ? 'bg-[#008C95] text-white shadow-sm' : 'text-[#FFF1D6]/70 hover:text-white'
          }`}
        >
          30s Challenge
        </button>
      </div>

      {/* Courtyard Interactive Diya Canvas Area with Peacock Teal and Marigold Mandalas */}
      <div className="relative w-full aspect-[4/3] max-w-lg bg-gradient-to-b from-[#002B30] to-[#0F1126] rounded-2xl border-2 border-[#20C9C3]/40 overflow-hidden shadow-[inner_0_0_40px_rgba(0,0,0,0.8)]">
        {/* Floor Mandala Geometry Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-dashed border-[#20C9C3] animate-spin-slow" />
          <div className="absolute w-40 h-40 rounded-full border border-[#FFB000]" />
          <div className="absolute w-20 h-20 rounded-full border border-[#E91E63]" />
        </div>

        {/* Diyas Positioned in Mandala Pattern */}
        {diyas.map((d) => (
          <button
            key={d.id}
            onClick={() => handleDiyaClick(d.id)}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 cursor-pointer focus:outline-none ${
              d.isLit ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Diya Graphics with Multi-coloured Flame */}
            <div className="relative flex flex-col items-center">
              {/* Flame (Visible when lit) */}
              {d.isLit && (
                <div className="absolute -top-6 animate-flame z-10 flex flex-col items-center">
                  {/* Glowing Flame Core with Diya's Distinctive Color */}
                  <div
                    className="w-4 h-7 shadow-lg"
                    style={{
                      background: `linear-gradient(to top, ${d.color}, #FFF1D6)`,
                      boxShadow: `0 0 18px ${d.color}`,
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

              {/* Clay Diya Bowl */}
              <svg viewBox="0 0 60 30" className="w-12 h-6 sm:w-14 sm:h-7 drop-shadow-md">
                <path
                  d="M5,5 Q30,32 55,5 Q45,28 30,28 Q15,28 5,5 Z"
                  fill={d.isLit ? '#A8431D' : '#6E2A12'}
                  stroke={d.isLit ? d.color : '#3D1508'}
                  strokeWidth="2"
                />
                <ellipse cx="30" cy="5" rx="25" ry="4" fill={d.isLit ? '#D48817' : '#3A180C'} />
              </svg>
            </div>
          </button>
        ))}

        {/* Victory Overlay Modal */}
        {isVictorious && (
          <div className="absolute inset-0 bg-[#0F1126]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Trophy className="w-16 h-16 text-[#FFB000] mb-3 animate-bounce" />
            <h4 className="text-3xl font-bold font-serif text-festive-gradient mb-2">
              Courtyard Illuminated!
            </h4>
            <p className="text-sm text-[#FFF1D6]/80 max-w-xs mb-6">
              You lit all {diyas.length} festive diyas and brought warmth and radiance to the courtyard!
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#008C95] via-[#20C9C3] to-[#FFB000] text-[#0F1126] font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              Play Again ✨
            </button>
          </div>
        )}

        {/* Time Over Overlay Modal */}
        {!isGameActive && isTimedMode && timeLeft === 0 && !isVictorious && (
          <div className="absolute inset-0 bg-[#0F1126]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Timer className="w-12 h-12 text-red-400 mb-3" />
            <h4 className="text-2xl font-bold font-serif text-red-300 mb-2">Time Expired!</h4>
            <p className="text-sm text-[#FFF1D6]/80 max-w-xs mb-4">
              You lit {litCount} out of {diyas.length} diyas in 30 seconds.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-full bg-[#E63946] text-white font-bold text-xs hover:scale-105 transition-all"
            >
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

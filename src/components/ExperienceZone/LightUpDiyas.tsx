import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, Flame, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';

interface DiyaItem {
  id: number;
  x: number; // percentage
  y: number; // percentage
  isLit: boolean;
  color: string;
}

const INITIAL_DIYAS: DiyaItem[] = [
  { id: 1, x: 50, y: 18, isLit: false, color: '#FFD166' },
  { id: 2, x: 74, y: 30, isLit: false, color: '#FF9F1C' },
  { id: 3, x: 84, y: 52, isLit: false, color: '#FF5A1F' },
  { id: 4, x: 74, y: 74, isLit: false, color: '#A51C69' },
  { id: 5, x: 50, y: 84, isLit: false, color: '#FFD166' },
  { id: 6, x: 26, y: 74, isLit: false, color: '#FF9F1C' },
  { id: 7, x: 16, y: 52, isLit: false, color: '#FF5A1F' },
  { id: 8, x: 26, y: 30, isLit: false, color: '#A51C69' },
  { id: 9, x: 50, y: 52, isLit: false, color: '#FFF1D6' }, // Center Diya
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
    if (updated.every((d) => d.isLit)) {
      setIsVictorious(true);
      setIsGameActive(false);
      soundManager.playVictory();

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD166', '#FF9F1C', '#FF5A1F', '#A51C69'],
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
    <div className="flex flex-col items-center gap-6 bg-[#38145E]/40 p-6 rounded-3xl border border-[#A51C69]/30 backdrop-blur-md shadow-2xl w-full max-w-3xl mx-auto">
      {/* HUD Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#A51C69]/30 pb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-[#FFD166] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF5A1F]" />
            <span>Light Up The Courtyard</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Click on every unlit diya to awaken the festive lights!
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#160B2B]/70 border border-[#FFD166]/30 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            <span className="text-xs font-semibold text-[#FFF1D6]">
              Lit: <strong className="text-[#FFD166]">{litCount} / {diyas.length}</strong>
            </span>
          </div>

          {isTimedMode && (
            <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              timeLeft < 8 ? 'bg-red-900/60 border-red-500 text-red-200 animate-pulse' : 'bg-[#160B2B]/70 border-[#FF5A1F]/40 text-[#FFF1D6]'
            }`}>
              <Timer className="w-4 h-4 text-[#FF5A1F]" />
              <span className="text-xs font-bold tabular-nums">{timeLeft}s</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-[#FFF1D6] hover:border-[#FFD166] transition-colors"
            title="Reset Diyas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#160B2B]/60 border border-[#A51C69]/30">
        <button
          onClick={() => {
            setIsTimedMode(false);
            handleReset();
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            !isTimedMode ? 'bg-[#FF5A1F] text-white' : 'text-[#FFF1D6]/70 hover:text-white'
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
            isTimedMode ? 'bg-[#FF5A1F] text-white' : 'text-[#FFF1D6]/70 hover:text-white'
          }`}
        >
          30s Challenge
        </button>
      </div>

      {/* Courtyard Interactive Diya Canvas Area */}
      <div className="relative w-full aspect-[4/3] max-w-lg bg-[#160B2B] rounded-2xl border-2 border-[#FFD166]/30 overflow-hidden shadow-[inner_0_0_40px_rgba(0,0,0,0.8)]">
        {/* Floor Mandala Geometry Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-dashed border-[#FFD166] animate-spin-slow" />
          <div className="absolute w-40 h-40 rounded-full border border-[#FF5A1F]" />
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
            {/* Diya SVG Graphics */}
            <div className="relative flex flex-col items-center">
              {/* Flame (Visible when lit) */}
              {d.isLit && (
                <div className="absolute -top-6 animate-flame z-10 flex flex-col items-center">
                  {/* Glowing Flame Core */}
                  <div
                    className="w-4 h-7 rounded-full bg-gradient-to-t from-[#FF5A1F] via-[#FFD166] to-white shadow-[0_0_20px_#FFD166]"
                    style={{
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    }}
                  />
                  {/* Ambient Light Ring */}
                  <div className="absolute -inset-2 bg-[#FFD166]/30 rounded-full blur-md" />
                </div>
              )}

              {/* Clay Diya Bowl */}
              <svg viewBox="0 0 60 30" className="w-12 h-6 sm:w-14 sm:h-7 drop-shadow-md">
                <path
                  d="M5,5 Q30,32 55,5 Q45,28 30,28 Q15,28 5,5 Z"
                  fill={d.isLit ? '#A8431D' : '#6E2A12'}
                  stroke={d.isLit ? '#FFD166' : '#3D1508'}
                  strokeWidth="2"
                />
                <ellipse cx="30" cy="5" rx="25" ry="4" fill={d.isLit ? '#D48817' : '#3A180C'} />
              </svg>
            </div>
          </button>
        ))}

        {/* Victory Overlay Modal */}
        {isVictorious && (
          <div className="absolute inset-0 bg-[#160B2B]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Trophy className="w-16 h-16 text-[#FFD166] mb-3 animate-bounce" />
            <h4 className="text-3xl font-bold font-serif text-gold-gradient mb-2">
              Courtyard Illuminated!
            </h4>
            <p className="text-sm text-[#FFF1D6]/80 max-w-xs mb-6">
              You lit all {diyas.length} diyas and brought warmth and radiance to the darkness!
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              Play Again ✨
            </button>
          </div>
        )}

        {/* Time Over Overlay Modal */}
        {!isGameActive && isTimedMode && timeLeft === 0 && !isVictorious && (
          <div className="absolute inset-0 bg-[#160B2B]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Timer className="w-12 h-12 text-red-400 mb-3" />
            <h4 className="text-2xl font-bold font-serif text-red-300 mb-2">Time Expired!</h4>
            <p className="text-sm text-[#FFF1D6]/80 max-w-xs mb-4">
              You lit {litCount} out of {diyas.length} diyas in 30 seconds.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-full bg-[#FF5A1F] text-white font-bold text-xs hover:scale-105 transition-all"
            >
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Download, Sparkles, Paintbrush, Undo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';

const RANGOLI_COLORS = [
  { name: 'Vermilion Red', hex: '#FF5A1F' },
  { name: 'Saffron Orange', hex: '#FF9F1C' },
  { name: 'Golden Yellow', hex: '#FFD166' },
  { name: 'Festive Magenta', hex: '#A51C69' },
  { name: 'Peacock Turquoise', hex: '#00B4D8' },
  { name: 'Emerald Green', hex: '#06D6A0' },
  { name: 'Royal Violet', hex: '#7209B7' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

type SymmetryMode = 4 | 8 | 12 | 1;

export const RangoliMaster: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFD166');
  const [brushSize, setBrushSize] = useState(8);
  const [symmetry, setSymmetry] = useState<SymmetryMode>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution canvas
    canvas.width = 600;
    canvas.height = 600;

    // Draw initial dark background with subtle guide circle
    drawBackground(ctx, canvas.width, canvas.height);
    saveState();
  }, []);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#160B2B';
    ctx.fillRect(0, 0, width, height);

    // Subtle guide mandala circles
    const cx = width / 2;
    const cy = height / 2;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.12)';
    ctx.lineWidth = 1;

    [50, 100, 160, 220, 270].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    soundManager.playClick();
    const newHist = [...history];
    newHist.pop(); // Remove current
    const prevData = newHist[newHist.length - 1];
    setHistory(newHist);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx && prevData) {
      ctx.putImageData(prevData, 0, 0);
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBackground(ctx, canvas.width, canvas.height);
    setHistory([]);
    saveState();
    setIsCompleted(false);
  };

  // Draw Line with Symmetry
  const drawSymmetricalPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dx = x - cx;
    const dy = y - cy;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.fillStyle = selectedColor;
    ctx.shadowColor = selectedColor;
    ctx.shadowBlur = 6;

    for (let i = 0; i < symmetry; i++) {
      const symAngle = angle + (i * 2 * Math.PI) / symmetry;
      const px = cx + radius * Math.cos(symAngle);
      const py = cy + radius * Math.sin(symAngle);

      ctx.beginPath();
      ctx.arc(px, py, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    drawSymmetricalPoint(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    drawSymmetricalPoint(pos.x, pos.y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleFinishRangoli = () => {
    soundManager.playVictory();
    setIsCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD166', '#FF5A1F', '#A51C69'],
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'My_Diwali_Rangoli.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 bg-[#38145E]/40 p-6 rounded-3xl border border-[#A51C69]/30 backdrop-blur-md shadow-2xl">
      {/* Canvas Viewport */}
      <div className="relative flex flex-col items-center">
        <div className="relative rounded-full overflow-hidden border-4 border-[#FFD166]/60 shadow-[0_0_30px_rgba(255,209,102,0.3)] touch-none cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] bg-[#160B2B]"
          />
        </div>

        {/* Completion Message Modal Overlay */}
        {isCompleted && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#A51C69] to-[#FF5A1F] text-white text-center shadow-lg animate-fade-in flex items-center justify-between gap-4 w-full max-w-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD166]" />
              <span className="font-semibold text-sm">Rangoli Masterpiece Complete!</span>
            </div>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#FFD166] text-[#160B2B] text-xs font-bold hover:bg-white transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-6 w-full max-w-xs text-[#FFF1D6]">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold font-serif text-[#FFD166] flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-[#FF5A1F]" />
            <span>Rangoli Studio</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Draw symmetrical patterns by dragging across the circular canvas.
          </p>
        </div>

        {/* Color Swatches */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] block mb-2">
            Color Palette
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {RANGOLI_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedColor(c.hex);
                }}
                className={`w-9 h-9 rounded-full border-2 transition-transform ${
                  selectedColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Symmetry Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] block mb-2">
            Mandala Symmetry
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([1, 4, 8, 12] as SymmetryMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  soundManager.playClick();
                  setSymmetry(m);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  symmetry === m
                    ? 'bg-[#FF5A1F] text-white border-[#FFD166]'
                    : 'bg-[#160B2B]/60 text-[#FFF1D6]/80 border-[#A51C69]/30 hover:border-[#FFD166]'
                }`}
              >
                {m === 1 ? 'Free' : `${m}-Fold`}
              </button>
            ))}
          </div>
        </div>

        {/* Brush Thickness Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#FFD166] mb-1">
            <span>Brush Size</span>
            <span>{brushSize}px</span>
          </div>
          <input
            type="range"
            min="3"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-[#FF5A1F] cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex-1 py-2 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-xs font-medium hover:border-[#FFD166] disabled:opacity-40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClear}
            className="flex-1 py-2 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-xs font-medium hover:border-[#FFD166] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Complete CTA */}
        <button
          onClick={handleFinishRangoli}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] font-bold text-sm shadow-md hover:shadow-[0_0_20px_rgba(255,90,31,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Complete Rangoli ✨</span>
        </button>
      </div>
    </div>
  );
};

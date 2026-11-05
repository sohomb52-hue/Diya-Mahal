import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Download, Sparkles, Paintbrush, Undo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { calculateSymmetryPoints } from '../../utils/gameLogic';

const RANGOLI_COLORS = [
  { name: 'Rani Pink', hex: '#E91E63' },
  { name: 'Hot Magenta', hex: '#FF2E88' },
  { name: 'Sindoor Red', hex: '#E63946' },
  { name: 'Vermilion Orange', hex: '#FF5722' },
  { name: 'Marigold Yellow', hex: '#FFB000' },
  { name: 'Peacock Teal', hex: '#008C95' },
  { name: 'Turquoise Blue', hex: '#20C9C3' },
  { name: 'Leaf Green', hex: '#2E9D50' },
];

type SymmetryMode = 4 | 8 | 12 | 1;

export const RangoliMaster: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFB000');
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
    ctx.fillStyle = '#0F1126';
    ctx.fillRect(0, 0, width, height);

    // Subtle guide mandala circles in Peacock & Marigold
    const cx = width / 2;
    const cy = height / 2;
    ctx.strokeStyle = 'rgba(32, 201, 195, 0.16)';
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

    const points = calculateSymmetryPoints(cx, cy, x, y, symmetry);

    ctx.fillStyle = selectedColor;
    ctx.shadowColor = selectedColor;
    ctx.shadowBlur = 6;

    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
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
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 bg-[#0F1126]/90 p-6 rounded-3xl border border-[#008C95]/40 backdrop-blur-md shadow-2xl">
      {/* Canvas Viewport */}
      <div className="relative flex flex-col items-center">
        <div className="relative rounded-full overflow-hidden border-4 border-[#20C9C3]/70 shadow-[0_0_35px_rgba(32,201,195,0.35)] touch-none cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] bg-[#0F1126]"
          />
        </div>

        {/* Completion Message Modal Overlay */}
        {isCompleted && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-white text-center shadow-lg animate-fade-in flex items-center justify-between gap-4 w-full max-w-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFF1D6]" />
              <span className="font-semibold text-sm">Rangoli Masterpiece Complete!</span>
            </div>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#0F1126] text-[#FFB000] text-xs font-bold hover:bg-white hover:text-[#0F1126] transition-colors flex items-center gap-1"
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
          <h3 className="text-xl font-bold font-serif text-[#FFB000] flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-[#E91E63]" />
            <span>Rangoli Studio</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Draw symmetrical patterns by dragging across the circular canvas.
          </p>
        </div>

        {/* Color Swatches */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#FFB000] block mb-2">
            Festival Palette
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
                  selectedColor === c.hex ? 'border-white scale-110 shadow-[0_0_12px_white]' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Symmetry Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#FFB000] block mb-2">
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
                    ? 'bg-[#E91E63] text-white border-[#FFB000]'
                    : 'bg-[#0F1126]/80 text-[#FFF1D6]/80 border-[#008C95]/40 hover:border-[#20C9C3]'
                }`}
              >
                {m === 1 ? 'Free' : `${m}-Fold`}
              </button>
            ))}
          </div>
        </div>

        {/* Brush Thickness Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#FFB000] mb-1">
            <span>Brush Size</span>
            <span>{brushSize}px</span>
          </div>
          <input
            type="range"
            min="3"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-[#E91E63] cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex-1 py-2 rounded-xl bg-[#0F1126] border border-[#008C95]/40 text-xs font-medium hover:border-[#FFB000] disabled:opacity-40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClear}
            className="flex-1 py-2 rounded-xl bg-[#0F1126] border border-[#008C95]/40 text-xs font-medium hover:border-[#FFB000] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Complete CTA */}
        <button
          onClick={handleFinishRangoli}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-white font-bold text-sm shadow-md hover:shadow-[0_0_20px_rgba(233,30,99,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Complete Rangoli ✨</span>
        </button>
      </div>
    </div>
  );
};

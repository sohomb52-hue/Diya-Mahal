import React, { useState, useRef } from 'react';
import { Copy, Download, Share2, Sparkles, Check, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';

const WISH_TEMPLATES = [
  {
    id: 'blessings',
    title: 'Traditional Blessings',
    text: 'May Goddess Lakshmi bless you with health, wealth, peace, and endless prosperity. Wishing you and your loved ones a very Happy Diwali!',
  },
  {
    id: 'light',
    title: 'Radiance & Joy',
    text: 'May the glowing light of a thousand diyas illuminate your path toward happiness, success, and contentment. Happy Diwali!',
  },
  {
    id: 'family',
    title: 'Warm Family Wishes',
    text: 'Sending warmth, laughter, and sweet festive moments to you and your family. May this Diwali mark the start of your brightest year yet!',
  },
  {
    id: 'prosperity',
    title: 'Prosperity & Growth',
    text: 'As we light the holy lamps, may all darkness vanish and your home be filled with harmony, wisdom, and joy. Have a blessed Diwali!',
  },
];

export const DiwaliWishes: React.FC = () => {
  const [recipient, setRecipient] = useState('Dear Loved One');
  const [sender, setSender] = useState('With Love & Light');
  const [selectedWish, setSelectedWish] = useState(WISH_TEMPLATES[0].text);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopy = () => {
    soundManager.playClick();
    const fullText = `🪔 HAPPY DIWALI 🪔\n\nTo: ${recipient}\n\n"${selectedWish}"\n\nFrom: ${sender}\n\n✨ Sent via THE LIGHT WITHIN - A Diwali Experience ✨`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = () => {
    soundManager.playClick();
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Render card to Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Deep purple royal gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 550);
    grad.addColorStop(0, '#160B2B');
    grad.addColorStop(0.5, '#38145E');
    grad.addColorStop(1, '#A51C69');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 550);

    // Gold border
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 510);

    ctx.strokeStyle = '#FF5A1F';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 744, 494);

    // Title
    ctx.fillStyle = '#FFD166';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪔  HAPPY DIWALI  🪔', 400, 90);

    // Recipient
    ctx.fillStyle = '#FFF1D6';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`To: ${recipient}`, 400, 150);

    // Wish body wrapped
    ctx.fillStyle = '#FFF1D6';
    ctx.font = '20px serif';
    const words = selectedWish.split(' ');
    let line = '';
    let y = 220;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 650 && i > 0) {
        ctx.fillText(line, 400, y);
        line = words[i] + ' ';
        y += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // Sender
    ctx.fillStyle = '#FFD166';
    ctx.font = 'italic bold 24px sans-serif';
    ctx.fillText(`From: ${sender}`, 400, y + 80);

    // Footer branding
    ctx.fillStyle = 'rgba(255, 241, 214, 0.6)';
    ctx.font = '14px sans-serif';
    ctx.fillText('✨ THE LIGHT WITHIN – A Diwali Experience ✨', 400, 505);

    const link = document.createElement('a');
    link.download = `Diwali_Greeting_${recipient.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <section id="wishes" className="relative w-full py-24 px-4 bg-gradient-to-b from-[#160B2B] via-[#38145E] to-[#160B2B] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#38145E] border border-[#FFD166]/30 text-[#FFD166] text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 text-[#FF5A1F] fill-[#FF5A1F]" />
            <span>Digital Diwali Greeting Studio</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold font-serif text-gold-gradient glow-gold-text mb-3">
            Spread A Little Light
          </h2>

          <p className="text-base sm:text-lg text-[#FFF1D6]/80 max-w-xl mx-auto font-light">
            Craft a personalized Diwali greeting card to share warm wishes, peace, and festive joy with friends and family.
          </p>
        </div>

        {/* Editor Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Controls (5 cols) */}
          <div className="lg:col-span-5 bg-[#38145E]/50 p-6 rounded-3xl border border-[#A51C69]/30 backdrop-blur-md flex flex-col gap-5 text-[#FFF1D6]">
            
            {/* Recipient Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#FFD166] block mb-1.5">
                Recipient Name (To)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., Dear Sharma Family"
                className="w-full px-4 py-2.5 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-[#FFF1D6] focus:border-[#FFD166] focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Sender Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#FFD166] block mb-1.5">
                Your Name (From)
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g., Rohan & Family"
                className="w-full px-4 py-2.5 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-[#FFF1D6] focus:border-[#FFD166] focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Wish Template Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#FFD166] block mb-2">
                Select Festive Wish
              </label>
              <div className="flex flex-col gap-2">
                {WISH_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedWish(tmpl.text);
                    }}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedWish === tmpl.text
                        ? 'bg-[#A51C69]/40 border-[#FFD166] text-white shadow-[0_0_10px_rgba(255,209,102,0.2)]'
                        : 'bg-[#160B2B]/60 border-[#A51C69]/30 text-[#FFF1D6]/70 hover:border-[#FF5A1F]'
                    }`}
                  >
                    <span className="font-semibold text-[#FFD166] block mb-0.5">{tmpl.title}</span>
                    <span className="line-clamp-2 text-[11px] font-light">{tmpl.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Override */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#FFD166] block mb-1.5">
                Custom Message
              </label>
              <textarea
                value={selectedWish}
                onChange={(e) => setSelectedWish(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-[#FFF1D6] focus:border-[#FFD166] focus:outline-none text-xs leading-relaxed transition-colors resize-none"
              />
            </div>

          </div>

          {/* Right Preview Card & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center gap-6">
            
            {/* Card Graphic Viewport */}
            <div
              ref={cardRef}
              className="relative w-full aspect-[16/10] max-w-lg rounded-3xl bg-gradient-to-br from-[#160B2B] via-[#38145E] to-[#A51C69] p-8 border-4 border-[#FFD166] shadow-[0_0_40px_rgba(255,209,102,0.25)] flex flex-col justify-between text-center overflow-hidden"
            >
              {/* Inner Decorative Hairline Border */}
              <div className="absolute inset-3 border border-[#FF5A1F]/50 rounded-2xl pointer-events-none" />

              {/* Top Diya Icon Header */}
              <div className="flex items-center justify-between text-[#FFD166]">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest font-serif uppercase">
                  🪔 Happy Diwali 🪔
                </span>
                <Sparkles className="w-5 h-5" />
              </div>

              {/* Card Body Copy */}
              <div className="my-auto py-2">
                <p className="text-sm sm:text-base font-bold text-[#FFD166] mb-3">
                  To: {recipient || 'Dear Friend'}
                </p>

                <p className="text-sm sm:text-lg font-serif italic text-[#FFF1D6] leading-relaxed max-w-md mx-auto">
                  "{selectedWish}"
                </p>

                <p className="text-sm font-semibold text-[#FFD166] mt-4">
                  From: {sender || 'With Warmth'}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="text-[10px] text-[#FFF1D6]/60 font-medium tracking-wider">
                THE LIGHT WITHIN · A DIWALI EXPERIENCE
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={handleCopy}
                className="flex-1 min-w-[140px] py-3 rounded-2xl bg-[#38145E] border border-[#A51C69] text-xs font-bold text-[#FFF1D6] hover:border-[#FFD166] flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FFD166]" />}
                <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadCard}
                className="flex-1 min-w-[160px] py-3 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] font-extrabold text-xs shadow-md hover:shadow-[0_0_20px_rgba(255,90,31,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save Image Card</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

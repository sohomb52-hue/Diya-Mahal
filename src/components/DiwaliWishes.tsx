import React, { useState, useRef } from 'react';
import { Copy, Download, Share2, Sparkles, Check, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from './MadhubaniCard';

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

    // Royal Sindoor Red to Deep Midnight Indigo gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 550);
    grad.addColorStop(0, '#E63946');
    grad.addColorStop(0.4, '#A51C69');
    grad.addColorStop(1, '#0F1126');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 550);

    // Marigold gold outer border
    ctx.strokeStyle = '#FFB000';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 510);

    // Turquoise inner hairline border
    ctx.strokeStyle = '#20C9C3';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 744, 494);

    // Title
    ctx.fillStyle = '#FFB000';
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
    ctx.fillStyle = '#FFB000';
    ctx.font = 'italic bold 24px sans-serif';
    ctx.fillText(`From: ${sender}`, 400, y + 80);

    // Footer branding
    ctx.fillStyle = 'rgba(255, 241, 214, 0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText('✨ THE LIGHT WITHIN – A Diwali Experience ✨', 400, 505);

    const link = document.createElement('a');
    link.download = `Diwali_Greeting_${recipient.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <section id="wishes" className="relative w-full py-4 sm:py-6 px-2 sm:px-4 bg-gradient-to-b from-[#0B1021] via-[#141C38] to-[#0B1021] overflow-hidden rounded-3xl">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141C38]/90 border border-[#D4AF37]/35 text-[#E5C158] text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Heart className="w-3.5 h-3.5 text-[#E5C158] fill-[#E5C158]" />
            <span>Digital Diwali Greeting Studio</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold font-serif text-royal-gold-gradient glow-royal-gold mb-3">
            Spread A Little Light
          </h2>

          <p className="text-base sm:text-lg text-[#FFF8E7]/80 max-w-xl mx-auto font-light">
            Craft a personalized Diwali greeting card to share warm wishes, peace, and festive joy with friends and family.
          </p>
        </div>

        {/* Editor Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Controls (5 cols) wrapped in authentic MadhubaniBox */}
          <MadhubaniBox
            variant="maroon"
            className="lg:col-span-5 flex flex-col gap-5 text-[#FFF8E7]"
            cornerSize={36}
          >
            {/* Box Header */}
            <div className="border-b-2 border-[#E8B947]/30 pb-3 flex items-center justify-between">
              <span className="text-sm font-bold font-serif text-[#E8B947] uppercase tracking-wider flex items-center gap-2">
                <span>🪔</span> Greeting Details
              </span>
              <span className="text-[11px] font-mono text-[#E8B947]/75">Mithila Studio</span>
            </div>

            {/* Recipient Input */}
            <div>
              <label className="text-xs font-bold font-serif uppercase tracking-wider text-[#E8B947] block mb-1.5">
                Recipient Name (To)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Dear Sharma Family"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#140609] border-2 border-[#E8B947]/40 text-[#FFF8E7] focus:border-[#E8B947] focus:ring-1 focus:ring-[#E8B947] focus:outline-none text-sm transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Sender Input */}
            <div>
              <label className="text-xs font-bold font-serif uppercase tracking-wider text-[#E8B947] block mb-1.5">
                Your Name (From)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g., Rohan & Family"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#140609] border-2 border-[#E8B947]/40 text-[#FFF8E7] focus:border-[#E8B947] focus:ring-1 focus:ring-[#E8B947] focus:outline-none text-sm transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Wish Template Selection */}
            <div>
              <label className="text-xs font-bold font-serif uppercase tracking-wider text-[#E8B947] block mb-2">
                Select Festive Wish
              </label>
              <div className="flex flex-col gap-2.5">
                {WISH_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedWish(tmpl.text);
                    }}
                    className={`p-3 text-left rounded-xl border-2 text-xs transition-all cursor-pointer relative overflow-hidden ${
                      selectedWish === tmpl.text
                        ? 'bg-gradient-to-r from-[#8C3214] via-[#A82420] to-[#C59B27] border-[#E8B947] text-[#FFF8E7] shadow-[0_0_15px_rgba(232,185,71,0.35)] scale-[1.01]'
                        : 'bg-[#140609] border-[#E8B947]/25 text-[#FFF8E7]/75 hover:border-[#E8B947]/60'
                    }`}
                  >
                    <span className="font-bold font-serif text-[#E8B947] block mb-0.5">{tmpl.title}</span>
                    <span className="line-clamp-2 text-[11px] font-light leading-relaxed">{tmpl.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Override */}
            <div>
              <label className="text-xs font-bold font-serif uppercase tracking-wider text-[#E8B947] block mb-1.5">
                Custom Message
              </label>
              <textarea
                value={selectedWish}
                onChange={(e) => setSelectedWish(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#140609] border-2 border-[#E8B947]/40 text-[#FFF8E7] focus:border-[#E8B947] focus:ring-1 focus:ring-[#E8B947] focus:outline-none text-xs leading-relaxed transition-colors resize-none shadow-inner"
              />
            </div>

          </MadhubaniBox>

          {/* Right Preview Card & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center gap-6">
            
            {/* Card Graphic Viewport with Madhubani Framing */}
            <div
              ref={cardRef}
              className="relative w-full aspect-[16/10] max-w-lg rounded-3xl bg-gradient-to-br from-[#2D0A12] via-[#521510] to-[#1F070A] p-7 sm:p-9 border-[3.5px] border-[#211A17] shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(212,175,55,0.3)] flex flex-col justify-between text-center overflow-hidden"
            >
              {/* Inner Double Gold Hairline Border */}
              <div className="absolute inset-2.5 sm:inset-3 border-2 border-[#E8B947]/70 rounded-[20px] pointer-events-none z-10" />
              
              {/* Madhubani Corner Spandrels on Greeting Card */}
              <MadhubaniCorner position="top-left" size={34} />
              <MadhubaniCorner position="top-right" size={34} />
              <MadhubaniCorner position="bottom-left" size={34} />
              <MadhubaniCorner position="bottom-right" size={34} />

              {/* Katchni Texture Overlay */}
              <div className="absolute inset-0 bg-madhubani-katchni opacity-15 pointer-events-none" />

              {/* Top Diya Icon Header */}
              <div className="relative z-10 flex items-center justify-between text-[#E8B947] px-4 pt-1">
                <Sparkles className="w-4 h-4 text-[#E8B947]" />
                <span className="text-xs sm:text-sm font-bold tracking-widest font-serif uppercase text-royal-gold-gradient">
                  🪔 Happy Diwali 🪔
                </span>
                <Sparkles className="w-4 h-4 text-[#E8B947]" />
              </div>

              {/* Card Body Copy */}
              <div className="relative z-10 my-auto py-2 px-3">
                <p className="text-sm sm:text-base font-bold font-serif text-[#E8B947] mb-2 drop-shadow">
                  To: {recipient || 'Dear Loved One'}
                </p>

                <p className="text-sm sm:text-base font-serif italic text-[#FFF8E7] leading-relaxed max-w-md mx-auto drop-shadow-md">
                  "{selectedWish}"
                </p>

                <p className="text-xs sm:text-sm font-semibold font-serif text-[#E8B947] mt-3 drop-shadow">
                  From: {sender || 'With Warmth'}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="relative z-10 text-[10px] text-[#FFF8E7]/70 font-medium tracking-widest uppercase pb-1 font-serif">
                THE LIGHT WITHIN · A DIWALI CELEBRATION
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
              <button
                onClick={handleCopy}
                className="flex-1 min-w-[140px] py-3 rounded-2xl bg-[#140609] border-2 border-[#E8B947]/50 text-xs font-bold text-[#FFF8E7] hover:border-[#E8B947] hover:scale-105 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E8B947]" />}
                <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadCard}
                className="flex-1 min-w-[160px] py-3 rounded-2xl bg-gradient-to-r from-[#8C3214] via-[#C59B27] to-[#E5C158] text-[#0B1021] font-extrabold text-xs shadow-md hover:shadow-[0_0_25px_rgba(232,185,71,0.5)] hover:scale-105 flex items-center justify-center gap-2 transition-all cursor-pointer"
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

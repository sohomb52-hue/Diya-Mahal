import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Trophy, Timer, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { createShuffledDeck, checkCardsMatch, isMemoryGameWon } from '../../utils/gameLogic';
import { MadhubaniBox, MadhubaniCorner, MadhubaniDivider } from '../MadhubaniCard';

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_PAIRS = [
  { symbol: '🪔', name: 'Clay Diya' },
  { symbol: '🏮', name: 'Paper Kandil' },
  { symbol: '🍬', name: 'Diwali Sweets' },
  { symbol: '🪷', name: 'Sacred Lotus' },
  { symbol: '🎆', name: 'Sky Fireworks' },
  { symbol: '🎨', name: 'Rangoli Art' },
  { symbol: '🌸', name: 'Flower Toran' },
  { symbol: '🪙', name: 'Laxmi Coin' },
];

export const DiwaliMemoryMatch: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);

  // Initialize and shuffle deck
  const initializeGame = () => {
    soundManager.playClick();
    const deck = createShuffledDeck(CARD_PAIRS);
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsGameActive(false);
    setIsVictorious(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && !isVictorious) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, isVictorious]);

  const handleCardClick = (id: number) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    if (!isGameActive && moves === 0) {
      setIsGameActive(true);
    }

    soundManager.playClick();

    // Flip card
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));

    // If 2 cards flipped, check match
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards.find((c) => c.id === newFlipped[0]);
      const card2 = cards.find((c) => c.id === id);

      if (card1 && card2 && checkCardsMatch(card1, card2)) {
        // Match found!
        soundManager.playIgnite();
        setCards((prev) =>
          prev.map((c) => (c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c))
        );
        setFlippedCards([]);
        setMatches((m) => {
          const newM = m + 1;
          if (isMemoryGameWon(newM, CARD_PAIRS.length)) {
            setIsVictorious(true);
            setIsGameActive(false);
            soundManager.playVictory();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#E91E63', '#FF2E88', '#FFB000', '#20C9C3', '#FF5722'],
            });
          }
          return newM;
        });
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === newFlipped[0] || c.id === id ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <MadhubaniBox
      variant="maroon"
      className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto"
      cornerSize={42}
    >
      {/* Header HUD with Madhubani Double Border */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-[#E8B947]/30 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-royal-gold-gradient flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#A82420]" />
            <span>Diwali Memory Match</span>
          </h3>
          <p className="text-xs text-[#FFF8E7]/75 mt-1 font-light">
            Flip cards and match sacred folk symbols of celebration!
          </p>
        </div>

        {/* Moves & Timer with Madhubani Badge Styling */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#140609] border-2 border-[#E8B947]/60 text-xs font-bold text-[#FFF8E7] shadow-sm">
            Moves: <span className="text-[#E8B947] font-mono">{moves}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#140609] border-2 border-[#A82420]/70 text-xs font-bold text-[#FFF8E7] flex items-center gap-1.5 shadow-sm">
            <Timer className="w-3.5 h-3.5 text-[#E8B947]" />
            <span className="tabular-nums font-mono text-[#E8B947]">{seconds}s</span>
          </div>

          <button
            onClick={initializeGame}
            className="p-2 rounded-xl bg-[#140609] border-2 border-[#E8B947]/60 text-[#FFF8E7] hover:border-[#FFF8E7] hover:scale-105 transition-all cursor-pointer shadow-sm"
            title="Restart Game"
          >
            <RefreshCw className="w-4 h-4 text-[#E8B947]" />
          </button>
        </div>
      </div>

      {/* Grid of 16 Cards */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md my-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched}
            className="aspect-square rounded-2xl relative w-full h-full cursor-pointer [perspective:1000px] focus:outline-none"
            aria-label={card.isFlipped || card.isMatched ? card.name : "Flipped card hidden"}
          >
            <div
              className={`w-full h-full rounded-2xl border-2 transition-transform duration-500 [transform-style:preserve-3d] relative ${
                card.isFlipped || card.isMatched
                  ? '[transform:rotateY(180deg)] border-[#E8B947] shadow-[0_0_20px_rgba(232,185,71,0.5)]'
                  : 'border-[#A82420]/70 hover:border-[#E8B947] hover:scale-105 shadow-md'
              }`}
            >
              {/* Card Back (Unflipped Face) with Traditional Mithila Motif */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#240A10] to-[#120508] border border-[#211A17] flex items-center justify-center p-2 [backface-visibility:hidden]">
                <div className="w-full h-full rounded-xl border border-dashed border-[#E8B947]/40 flex items-center justify-center bg-[#19070B]/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-madhubani-katchni opacity-25" />
                  <span className="text-xl text-[#E8B947] relative z-10 filter drop-shadow">🪔</span>
                </div>
              </div>

              {/* Card Front (Flipped Face - rotated 180deg so when container flips 180deg, text is perfectly upright and unmirrored) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#3D140C] via-[#A82420] to-[#236C79] border-2 border-[#E8B947] flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-inner">
                <span className="text-2xl sm:text-3xl select-none filter drop-shadow-md">{card.symbol}</span>
                <span className="text-[10px] sm:text-xs text-[#FFF8E7] font-serif font-bold mt-1 truncate max-w-full text-center select-none drop-shadow">
                  {card.name}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Victory Overlay Modal with Madhubani Frame */}
      {isVictorious && (
        <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] text-[#211A17] w-full max-w-md text-center shadow-2xl border-[3px] border-[#211A17] animate-fade-in overflow-hidden">
          <div className="absolute inset-1 rounded-xl border border-[#FFF8E7]/60 pointer-events-none" />
          <Trophy className="w-12 h-12 text-[#211A17] mx-auto mb-2 animate-bounce drop-shadow" />
          <h4 className="text-2xl font-bold font-serif mb-1">Pairs Matched!</h4>
          <p className="text-xs font-semibold mb-4 text-[#211A17]/90">
            Completed in <strong className="underline">{moves} moves</strong> and <strong className="underline">{seconds} seconds</strong>!
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-2.5 rounded-full bg-[#211A17] text-[#E8B947] font-bold text-xs hover:bg-[#120508] transition-colors cursor-pointer border border-[#FFF8E7]/40 shadow-md"
          >
            Play Again 🔄
          </button>
        </div>
      )}
    </MadhubaniBox>
  );
};

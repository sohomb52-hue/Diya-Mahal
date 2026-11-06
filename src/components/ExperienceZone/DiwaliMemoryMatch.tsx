import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Trophy, Timer, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { createShuffledDeck, checkCardsMatch, isMemoryGameWon } from '../../utils/gameLogic';

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
    <div className="flex flex-col items-center gap-6 bg-[#0F1126]/90 p-6 rounded-3xl border border-[#008C95]/40 backdrop-blur-md shadow-2xl w-full max-w-3xl mx-auto">
      {/* Header HUD */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#008C95]/30 pb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-[#FFB000] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#E91E63]" />
            <span>Diwali Memory Match</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Flip cards and match festive symbols of celebration!
          </p>
        </div>

        {/* Moves & Timer */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-xl bg-[#0F1126] border border-[#008C95]/40 text-xs font-semibold text-[#FFF1D6]">
            Moves: <span className="text-[#FFB000]">{moves}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0F1126] border border-[#FF5722]/40 text-xs font-semibold text-[#FFF1D6] flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[#FF5722]" />
            <span className="tabular-nums">{seconds}s</span>
          </div>

          <button
            onClick={initializeGame}
            className="p-2 rounded-xl bg-[#0F1126] border border-[#008C95]/40 text-[#FFF1D6] hover:border-[#FFB000] transition-colors"
            title="Restart Game"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 16 Cards */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
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
                  ? '[transform:rotateY(180deg)] border-[#FFB000] shadow-[0_0_20px_rgba(255,176,0,0.4)]'
                  : 'border-[#E91E63]/50 hover:border-[#FFB000] hover:scale-105 shadow-md'
              }`}
            >
              {/* Card Back (Unflipped Face) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-[#14183B] flex items-center justify-center p-2 [backface-visibility:hidden]">
                <div className="w-full h-full rounded-xl border border-dashed border-[#FFB000]/25 flex items-center justify-center bg-[#0F1126]/60">
                  <Sparkles className="w-5 h-5 text-[#FFB000]/60" />
                </div>
              </div>

              {/* Card Front (Flipped Face - rotated 180deg so when container flips 180deg, text is perfectly upright and unmirrored) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#283593] via-[#E91E63] to-[#FF5722] flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-2xl sm:text-3xl select-none">{card.symbol}</span>
                <span className="text-[10px] sm:text-xs text-[#FFF1D6] font-semibold mt-1 truncate max-w-full text-center select-none">
                  {card.name}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Victory Overlay Modal */}
      {isVictorious && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] text-[#0F1126] w-full max-w-md text-center shadow-2xl animate-fade-in">
          <Trophy className="w-12 h-12 text-[#0F1126] mx-auto mb-2 animate-bounce" />
          <h4 className="text-2xl font-bold font-serif mb-1">Pairs Matched!</h4>
          <p className="text-xs font-semibold mb-4">
            Completed in <strong className="underline">{moves} moves</strong> and <strong className="underline">{seconds} seconds</strong>!
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-2.5 rounded-full bg-[#0F1126] text-[#FFB000] font-bold text-xs hover:bg-[#1B254B] transition-colors cursor-pointer"
          >
            Play Again 🔄
          </button>
        </div>
      )}
    </div>
  );
};

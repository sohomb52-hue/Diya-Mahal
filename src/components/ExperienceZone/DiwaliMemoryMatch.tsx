import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Trophy, Timer, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';

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
    const deck: CardItem[] = [];
    let idCounter = 1;

    CARD_PAIRS.forEach((pair) => {
      deck.push({ id: idCounter++, symbol: pair.symbol, name: pair.name, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, symbol: pair.symbol, name: pair.name, isFlipped: false, isMatched: false });
    });

    // Shuffle deck (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

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

      if (card1 && card2 && card1.symbol === card2.symbol) {
        // Match found!
        soundManager.playIgnite();
        setCards((prev) =>
          prev.map((c) => (c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c))
        );
        setFlippedCards([]);
        setMatches((m) => {
          const newM = m + 1;
          if (newM === CARD_PAIRS.length) {
            setIsVictorious(true);
            setIsGameActive(false);
            soundManager.playVictory();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#FFD166', '#FF9F1C', '#FF5A1F', '#A51C69'],
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
    <div className="flex flex-col items-center gap-6 bg-[#38145E]/40 p-6 rounded-3xl border border-[#A51C69]/30 backdrop-blur-md shadow-2xl w-full max-w-3xl mx-auto">
      {/* Header HUD */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#A51C69]/30 pb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-[#FFD166] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#FF9F1C]" />
            <span>Diwali Memory Match</span>
          </h3>
          <p className="text-xs text-[#FFF1D6]/70 mt-1">
            Flip cards and match festive symbols of celebration!
          </p>
        </div>

        {/* Moves & Timer */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-xl bg-[#160B2B]/70 border border-[#FFD166]/30 text-xs font-semibold text-[#FFF1D6]">
            Moves: <span className="text-[#FFD166]">{moves}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#160B2B]/70 border border-[#FF5A1F]/30 text-xs font-semibold text-[#FFF1D6] flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span className="tabular-nums">{seconds}s</span>
          </div>

          <button
            onClick={initializeGame}
            className="p-2 rounded-xl bg-[#160B2B] border border-[#A51C69]/40 text-[#FFF1D6] hover:border-[#FFD166] transition-colors"
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
            className={`aspect-square rounded-2xl border-2 transition-all duration-300 transform perspective-1000 flex flex-col items-center justify-center p-2 cursor-pointer ${
              card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-[#38145E] to-[#A51C69] border-[#FFD166] rotate-y-180 shadow-[0_0_15px_rgba(255,209,102,0.4)]'
                : 'bg-[#160B2B] border-[#A51C69]/40 hover:border-[#FF5A1F] hover:scale-105'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <span className="text-2xl sm:text-3xl">{card.symbol}</span>
                <span className="text-[10px] text-[#FFD166] font-medium mt-1 truncate max-w-full">
                  {card.name}
                </span>
              </div>
            ) : (
              <div className="w-full h-full rounded-xl border border-dashed border-[#FFD166]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FFD166]/40" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Victory Overlay Modal */}
      {isVictorious && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#A51C69] via-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] w-full max-w-md text-center shadow-2xl animate-fade-in">
          <Trophy className="w-12 h-12 text-[#160B2B] mx-auto mb-2 animate-bounce" />
          <h4 className="text-2xl font-bold font-serif mb-1">Pairs Matched!</h4>
          <p className="text-xs font-medium mb-4">
            Completed in <strong className="underline">{moves} moves</strong> and <strong className="underline">{seconds} seconds</strong>!
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-2.5 rounded-full bg-[#160B2B] text-[#FFD166] font-bold text-xs hover:bg-[#38145E] transition-colors"
          >
            Play Again 🔄
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Pure Game Rules, Math & Logic for Diwali Experiences
 * Fully decoupled for unit testing and deterministic verification.
 */

export interface CardItemData {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface DiyaStatus {
  id: number;
  isLit: boolean;
}

/**
 * Creates and shuffles a paired deck for the Memory Match game.
 * Uses deterministic or random swapping.
 */
export function createShuffledDeck(
  pairs: Array<{ symbol: string; name: string }>,
  shuffleFn?: (len: number) => number
): CardItemData[] {
  const deck: CardItemData[] = [];
  let idCounter = 1;

  pairs.forEach((pair) => {
    deck.push({ id: idCounter++, symbol: pair.symbol, name: pair.name, isFlipped: false, isMatched: false });
    deck.push({ id: idCounter++, symbol: pair.symbol, name: pair.name, isFlipped: false, isMatched: false });
  });

  // Fisher-Yates shuffle
  const rng = shuffleFn || ((max) => Math.floor(Math.random() * max));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

/**
 * Checks if two flipped cards match by symbol.
 */
export function checkCardsMatch(
  card1: { symbol: string },
  card2: { symbol: string }
): boolean {
  return card1.symbol === card2.symbol;
}

/**
 * Checks whether the memory game is won.
 */
export function isMemoryGameWon(matchesCount: number, totalPairs: number): boolean {
  return totalPairs > 0 && matchesCount >= totalPairs;
}

/**
 * Calculates coordinates for n-fold symmetry points in Rangoli drawing.
 */
export function calculateSymmetryPoints(
  cx: number,
  cy: number,
  x: number,
  y: number,
  symmetry: 1 | 4 | 8 | 12
): Array<{ x: number; y: number }> {
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.sqrt(dx * dx + dy * dy);
  const baseAngle = Math.atan2(dy, dx);

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < symmetry; i++) {
    const symAngle = baseAngle + (i * 2 * Math.PI) / symmetry;
    points.push({
      x: cx + radius * Math.cos(symAngle),
      y: cy + radius * Math.sin(symAngle),
    });
  }
  return points;
}

/**
 * Checks if all courtyard diyas are lit.
 */
export function isCourtyardFullyLit(diyas: DiyaStatus[]): boolean {
  if (diyas.length === 0) return false;
  return diyas.every((d) => d.isLit);
}

/**
 * Spider-Verse halftone dot radius calculation based on distance from center.
 */
export function calculateHalftoneDotRadius(
  dist: number,
  maxDist: number,
  minRadius: number = 1.5,
  maxRadius: number = 5.5
): number {
  if (maxDist <= 0) return minRadius;
  const ratio = Math.max(0, Math.min(dist / maxDist, 1));
  return minRadius + ratio * (maxRadius - minRadius);
}

/**
 * Calculates score, multiplier and rank title for the Firecracker Simulator.
 */
export function calculateFirecrackerScore(
  type: 'anar' | 'fuljhuri' | 'bomb' | 'chakri' | 'rocket' | 'grand_finale',
  comboCount: number,
  currentScore: number
): { newScore: number; comboMultiplier: number; rankTitle: string } {
  const basePoints: Record<string, number> = {
    fuljhuri: 10,
    anar: 25,
    chakri: 35,
    rocket: 50,
    bomb: 75,
    grand_finale: 250,
  };

  const pts = basePoints[type] || 15;
  const multiplier = Math.min(Math.floor(comboCount / 3) + 1, 5);
  const addedScore = pts * multiplier;
  const newScore = currentScore + addedScore;

  let rankTitle = 'Spark Artisan';
  if (newScore >= 2000) {
    rankTitle = 'Celebratory Mastermind 👑';
  } else if (newScore >= 1000) {
    rankTitle = 'Fireworks Virtuoso 🎆';
  } else if (newScore >= 400) {
    rankTitle = 'Diwali Illuminator ✨';
  } else if (newScore >= 150) {
    rankTitle = 'Pyrotechnic Enthusiast 🪔';
  }

  return { newScore, comboMultiplier: multiplier, rankTitle };
}

export type FireworkShape = 'chrysanthemum' | 'ring' | 'star' | 'spiral' | 'shower';

/**
 * Generates initial particle velocity vectors for custom firework shapes.
 */
export function generateFireworkPatternPoints(
  shape: FireworkShape,
  count: number,
  speedFactor: number = 4
): Array<{ vx: number; vy: number; extraSize?: number; colorOffset?: number }> {
  const points: Array<{ vx: number; vy: number; extraSize?: number; colorOffset?: number }> = [];

  for (let i = 0; i < count; i++) {
    let vx = 0;
    let vy = 0;

    switch (shape) {
      case 'ring': {
        const angle = (i * Math.PI * 2) / count;
        const spd = speedFactor * (0.9 + Math.random() * 0.2);
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd;
        break;
      }
      case 'star': {
        // 5-pointed star polar formula
        const angle = (i * Math.PI * 2) / count;
        const n = 5;
        const starRatio = Math.abs(Math.cos((n * angle) / 2));
        const spd = speedFactor * (0.35 + 0.65 * starRatio);
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd;
        break;
      }
      case 'spiral': {
        const angle = (i * Math.PI * 8) / count; // 4 turns
        const radiusRatio = i / count;
        const spd = speedFactor * (0.2 + 0.8 * radiusRatio);
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd;
        break;
      }
      case 'shower': {
        // Upward burst that quickly cascades down
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const spd = speedFactor * (0.6 + Math.random() * 0.9);
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd * 1.2;
        break;
      }
      case 'chrysanthemum':
      default: {
        const angle = Math.random() * Math.PI * 2;
        const spd = (0.2 + Math.random() * 0.8) * speedFactor;
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd;
        break;
      }
    }

    points.push({ vx, vy, colorOffset: i % 3 });
  }

  return points;
}

export type AmbientThemeId = 'midnight' | 'sunset' | 'festive-gold' | 'peacock';

export interface AmbientThemeConfig {
  id: AmbientThemeId;
  name: string;
  icon: string;
  gradient: string;
  accent: string;
  textColor: string;
}

export const AMBIENT_THEMES: AmbientThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight Indigo',
    icon: '🌙',
    gradient: 'from-[#0F1126] via-[#1B254B] to-[#0F1126]',
    accent: '#008C95',
    textColor: '#FFF1D6',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    icon: '🌅',
    gradient: 'from-[#2B0E18] via-[#E63946] to-[#0F1126]',
    accent: '#FF5722',
    textColor: '#FFF1D6',
  },
  {
    id: 'festive-gold',
    name: 'Festive Gold',
    icon: '🪔',
    gradient: 'from-[#1A1202] via-[#FFB000]/30 to-[#0F1126]',
    accent: '#FFB000',
    textColor: '#FFF1D6',
  },
  {
    id: 'peacock',
    name: 'Peacock Royal',
    icon: '🦚',
    gradient: 'from-[#002B30] via-[#008C95]/40 to-[#0F1126]',
    accent: '#20C9C3',
    textColor: '#FFF1D6',
  },
];

export function getAmbientThemeConfig(id: string): AmbientThemeConfig {
  return AMBIENT_THEMES.find((t) => t.id === id) || AMBIENT_THEMES[0];
}


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

export type FireworkShape = 'chrysanthemum' | 'ring' | 'star' | 'spiral' | 'shower' | 'heart';

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
      case 'heart': {
        // Parametric heart burst
        const t = (i * Math.PI * 2) / count;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const scale = speedFactor * 0.26;
        vx = hx * scale;
        vy = hy * scale;
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
    name: 'Twilight Palace Midnight',
    icon: '🌙',
    gradient: 'from-[#0B1021] via-[#141C38] to-[#0A1224]',
    accent: '#D4AF37',
    textColor: '#FFF8E7',
  },
  {
    id: 'sunset',
    name: 'Vintage Courtyard Terracotta',
    icon: '🏺',
    gradient: 'from-[#1A0B0E] via-[#3B191B] to-[#12070A]',
    accent: '#A8422B',
    textColor: '#FFF8E7',
  },
  {
    id: 'festive-gold',
    name: 'Royal Durbar Gold',
    icon: '🪔',
    gradient: 'from-[#120D04] via-[#2A1D07] to-[#0D0903]',
    accent: '#D4AF37',
    textColor: '#FFF8E7',
  },
  {
    id: 'peacock',
    name: 'Peacock Royal Twilight',
    icon: '🦚',
    gradient: 'from-[#051417] via-[#092B30] to-[#06161A]',
    accent: '#008C95',
    textColor: '#FFF8E7',
  },
];

export function getAmbientThemeConfig(id: string): AmbientThemeConfig {
  return AMBIENT_THEMES.find((t) => t.id === id) || AMBIENT_THEMES[0];
}

export interface WorldSceneInfo {
  sceneId: 'courtyard' | 'street' | 'garden' | 'city' | 'sky' | 'finale';
  sceneName: string;
  cameraY: number;
  cameraZ: number;
  cameraRotX: number;
  lightIntensity: number;
  bgGlowColor: string;
}

/**
 * Calculates continuous 3D world scene parameters from scroll progress.
 */
export function getLivingWorldScene(scrollProgress: number): WorldSceneInfo {
  const p = Math.max(0, Math.min(1, scrollProgress));

  if (p < 0.15) {
    return {
      sceneId: 'courtyard',
      sceneName: 'The Diya Courtyard 🪔',
      cameraY: 3.0,
      cameraZ: 6.2,
      cameraRotX: 0.32,
      lightIntensity: 2.3,
      bgGlowColor: '#FFB000',
    };
  } else if (p < 0.38) {
    return {
      sceneId: 'street',
      sceneName: 'The Festive Street 🏮',
      cameraY: 4.5,
      cameraZ: 7.5,
      cameraRotX: 0.25,
      lightIntensity: 2.6,
      bgGlowColor: '#E63946',
    };
  } else if (p < 0.60) {
    return {
      sceneId: 'garden',
      sceneName: 'The Rangoli Garden 🌸',
      cameraY: 6.0,
      cameraZ: 8.5,
      cameraRotX: 0.45,
      lightIntensity: 2.8,
      bgGlowColor: '#E91E63',
    };
  } else if (p < 0.80) {
    return {
      sceneId: 'city',
      sceneName: 'The City of Lights 🌃',
      cameraY: 8.5,
      cameraZ: 10.0,
      cameraRotX: 0.35,
      lightIntensity: 3.0,
      bgGlowColor: '#008C95',
    };
  } else if (p < 0.94) {
    return {
      sceneId: 'sky',
      sceneName: 'The Festival Night Sky 🎆',
      cameraY: 12.0,
      cameraZ: 12.0,
      cameraRotX: 0.20,
      lightIntensity: 3.2,
      bgGlowColor: '#3478F6',
    };
  } else {
    return {
      sceneId: 'finale',
      sceneName: 'The Celebration Finale ✨',
      cameraY: 7.0,
      cameraZ: 7.8,
      cameraRotX: 0.30,
      lightIntensity: 3.5,
      bgGlowColor: '#FFD166',
    };
  }
}



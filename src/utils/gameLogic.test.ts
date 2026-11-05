import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createShuffledDeck,
  checkCardsMatch,
  isMemoryGameWon,
  calculateSymmetryPoints,
  isCourtyardFullyLit,
  calculateHalftoneDotRadius,
  calculateFirecrackerScore,
  generateFireworkPatternPoints,
  getAmbientThemeConfig,
} from './gameLogic';

test('createShuffledDeck produces expected count and pairs', () => {
  const samplePairs = [
    { symbol: '🪔', name: 'Diya' },
    { symbol: '🏮', name: 'Kandil' },
  ];
  // Deterministic shuffle function (swap with same index)
  const deck = createShuffledDeck(samplePairs, (max) => max - 1);
  assert.equal(deck.length, 4);

  const diyaCards = deck.filter((c) => c.symbol === '🪔');
  const kandilCards = deck.filter((c) => c.symbol === '🏮');
  assert.equal(diyaCards.length, 2);
  assert.equal(kandilCards.length, 2);
});

test('checkCardsMatch detects matching and mismatching symbols', () => {
  assert.equal(checkCardsMatch({ symbol: '🪔' }, { symbol: '🪔' }), true);
  assert.equal(checkCardsMatch({ symbol: '🪔' }, { symbol: '🏮' }), false);
});

test('isMemoryGameWon returns true only when matched count reaches total pairs', () => {
  assert.equal(isMemoryGameWon(8, 8), true);
  assert.equal(isMemoryGameWon(7, 8), false);
  assert.equal(isMemoryGameWon(0, 8), false);
  assert.equal(isMemoryGameWon(0, 0), false);
});

test('calculateSymmetryPoints returns exact count of symmetrical points', () => {
  const cx = 300;
  const cy = 300;
  const points8 = calculateSymmetryPoints(cx, cy, 350, 300, 8);
  assert.equal(points8.length, 8);

  // Each point should be roughly radius 50 away from center
  points8.forEach((p) => {
    const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    assert.ok(Math.abs(dist - 50) < 0.001);
  });

  const points1 = calculateSymmetryPoints(cx, cy, 350, 300, 1);
  assert.equal(points1.length, 1);
  assert.equal(Math.round(points1[0].x), 350);
  assert.equal(Math.round(points1[0].y), 300);
});

test('isCourtyardFullyLit checks completion correctly', () => {
  assert.equal(isCourtyardFullyLit([]), false);
  assert.equal(
    isCourtyardFullyLit([
      { id: 1, isLit: true },
      { id: 2, isLit: true },
    ]),
    true
  );
  assert.equal(
    isCourtyardFullyLit([
      { id: 1, isLit: true },
      { id: 2, isLit: false },
    ]),
    false
  );
});

test('calculateHalftoneDotRadius clamps between min and max radius', () => {
  const min = 1.5;
  const max = 5.5;
  assert.equal(calculateHalftoneDotRadius(0, 500, min, max), min);
  assert.equal(calculateHalftoneDotRadius(500, 500, min, max), max);
  assert.equal(calculateHalftoneDotRadius(250, 500, min, max), (min + max) / 2);
  // Boundary tests
  assert.equal(calculateHalftoneDotRadius(-10, 500, min, max), min);
  assert.equal(calculateHalftoneDotRadius(1000, 500, min, max), max);
});

test('calculateFirecrackerScore computes correct multiplier and rank title', () => {
  const r1 = calculateFirecrackerScore('fuljhuri', 0, 0);
  assert.equal(r1.newScore, 10);
  assert.equal(r1.comboMultiplier, 1);
  assert.equal(r1.rankTitle, 'Spark Artisan');

  const r2 = calculateFirecrackerScore('bomb', 6, 100);
  // multiplier = min(floor(6/3) + 1, 5) = 3 -> added = 75 * 3 = 225 -> total = 325
  assert.equal(r2.newScore, 325);
  assert.equal(r2.comboMultiplier, 3);
  assert.equal(r2.rankTitle, 'Pyrotechnic Enthusiast 🪔');

  const r3 = calculateFirecrackerScore('grand_finale', 15, 1800);
  // multiplier = min(floor(15/3) + 1, 5) = 5 -> added = 250 * 5 = 1250 -> total = 3050
  assert.equal(r3.newScore, 3050);
  assert.equal(r3.comboMultiplier, 5);
  assert.equal(r3.rankTitle, 'Celebratory Mastermind 👑');
});

test('generateFireworkPatternPoints generates correct point count for shapes', () => {
  const shapes: Array<'chrysanthemum' | 'ring' | 'star' | 'spiral' | 'shower'> = [
    'chrysanthemum',
    'ring',
    'star',
    'spiral',
    'shower',
  ];
  shapes.forEach((shape) => {
    const pts = generateFireworkPatternPoints(shape, 30, 5);
    assert.equal(pts.length, 30);
    pts.forEach((p) => {
      assert.equal(typeof p.vx, 'number');
      assert.equal(typeof p.vy, 'number');
    });
  });
});

test('getAmbientThemeConfig returns default theme for unknown id', () => {
  const t1 = getAmbientThemeConfig('sunset');
  assert.equal(t1.name, 'Sunset Glow');
  const fallback = getAmbientThemeConfig('nonexistent');
  assert.equal(fallback.id, 'midnight');
});


/**
 * High-Resolution Indian Folk-Art Procedural Texture Generators
 * Authentic Madhubani, Pattachitra, and Indian Miniature Painting styles.
 * 2048x2048 high-DPI procedural graphics with crisp vector-quality math,
 * natural pigment color palettes, and rich ornamental linework.
 */

/* Traditional Folk-Art Pigment Palette */
export const FOLK_PALETTE = {
  peacockTeal: '#004D54',
  tealBright: '#008C95',
  turquoise: '#20C9C3',
  vermilion: '#E63946',
  sindoor: '#D83025',
  burntOrange: '#FF5722',
  brightSaffron: '#FF8F00',
  marigoldYellow: '#FFB000',
  goldFoil: '#E5C158',
  antiqueGold: '#D4AF37',
  raniPink: '#E91E63',
  lotusPink: '#F06292',
  leafGreen: '#2E9D50',
  forestGreen: '#1B5E20',
  indigo: '#141C38',
  midnightBlue: '#0B1021',
  terracottaDark: '#6E2008',
  terracottaWarm: '#A8422B',
  terracottaLight: '#C64E22',
  warmIvory: '#FFF8E7',
  charcoalInk: '#1A0C06',
};

/**
 * 1. HAVELI GATE ARCH PORTAL (2048x2048)
 * Carved red sandstone portal with Pattachitra floral running creepers,
 * gold-leaf edging, and Madhubani peacocks on the arch spandrels.
 */
export function createHaveliGatePortalCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Rich Rajasthani Sandstone Base with warm earthy undertones
  const stoneGrad = ctx.createLinearGradient(0, 0, 0, 2048);
  stoneGrad.addColorStop(0, '#4A1D13');
  stoneGrad.addColorStop(0.5, '#3D150D');
  stoneGrad.addColorStop(1, '#2B0E08');
  ctx.fillStyle = stoneGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Sandstone texture striations
  ctx.save();
  for (let y = 0; y < 2048; y += 12) {
    ctx.strokeStyle = y % 36 === 0 ? 'rgba(229, 193, 88, 0.08)' : 'rgba(20, 5, 2, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y + Math.sin(y * 0.01) * 20);
    ctx.stroke();
  }
  ctx.restore();

  // Multi-tiered Pattachitra Ornamental Border
  const drawBorderFrame = (inset: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(inset, inset, 2048 - inset * 2, 2048 - inset * 2);
  };

  drawBorderFrame(24, 20, FOLK_PALETTE.charcoalInk);
  drawBorderFrame(48, 14, FOLK_PALETTE.antiqueGold);
  drawBorderFrame(70, 8, FOLK_PALETTE.vermilion);

  // Running Lotus Bud Border (Pattachitra Bel)
  ctx.save();
  ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 3;

  for (let x = 110; x < 1940; x += 55) {
    // Top border lotus buds
    ctx.beginPath();
    ctx.ellipse(x, 90, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bottom border lotus buds
    ctx.beginPath();
    ctx.ellipse(x, 1958, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  for (let y = 110; y < 1940; y += 55) {
    // Left border lotus buds
    ctx.beginPath();
    ctx.ellipse(90, y, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right border lotus buds
    ctx.beginPath();
    ctx.ellipse(1958, y, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Ornate Inner Arch Cavity Cutout Marking & Spandrels
  ctx.save();
  ctx.fillStyle = '#220A05';
  ctx.fillRect(160, 160, 1728, 1728);

  // Madhubani Peacocks on Arch Spandrels (Top-Left & Top-Right)
  const drawMadhubaniPeacock = (cx: number, cy: number, flip: boolean) => {
    ctx.save();
    ctx.translate(cx, cy);
    if (flip) ctx.scale(-1, 1);

    // Peacock Crest
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 4;
    for (let c = -20; c <= 20; c += 10) {
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(c, -85);
      ctx.stroke();
      ctx.fillStyle = FOLK_PALETTE.turquoise;
      ctx.beginPath();
      ctx.arc(c, -88, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Peacock Graceful S-Curved Neck & Head
    ctx.fillStyle = FOLK_PALETTE.tealBright;
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.bezierCurveTo(40, -45, 50, 10, 20, 40);
    ctx.bezierCurveTo(-10, 20, -15, -30, 0, -50);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Beak & Expressive Madhubani Eye
    ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
    ctx.beginPath();
    ctx.moveTo(25, -45);
    ctx.lineTo(48, -42);
    ctx.lineTo(25, -35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = FOLK_PALETTE.warmIvory;
    ctx.beginPath();
    ctx.ellipse(10, -42, 9, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FOLK_PALETTE.charcoalInk;
    ctx.beginPath();
    ctx.arc(12, -42, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Fan of Intricate Feathers with Eye Spots
    for (let i = 0; i < 7; i++) {
      const angle = 0.2 + (i * Math.PI) / 8;
      const fx = Math.cos(angle) * -90 + 10;
      const fy = Math.sin(angle) * -60 + 20;

      ctx.fillStyle = i % 2 === 0 ? FOLK_PALETTE.peacockTeal : FOLK_PALETTE.brightSaffron;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 22, 12, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Feather Eye Spot
      ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawMadhubaniPeacock(380, 360, false);
  drawMadhubaniPeacock(1668, 360, true);

  // Keystone Central Sacred Kalash & Lotus (Top Center)
  ctx.save();
  ctx.translate(1024, 280);
  // Gold Kalash vessel
  ctx.fillStyle = FOLK_PALETTE.antiqueGold;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Sprouting Mango Leaves on Kalash
  ctx.fillStyle = FOLK_PALETTE.leafGreen;
  for (let l = -30; l <= 30; l += 15) {
    ctx.beginPath();
    ctx.ellipse(l, -55, 10, 24, (l * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Coconut Finial
  ctx.fillStyle = FOLK_PALETTE.brightSaffron;
  ctx.beginPath();
  ctx.arc(0, -68, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
  return canvas;
}

/**
 * 2. HAVELI DOUBLE DOOR PANELS (1024x2048 each)
 * Rich Sheesham/Teakwood grain with hand-painted Madhubani & Pattachitra panels:
 * Left Door: Sacred Surya (Sun) + Mayura (Peacock)
 * Right Door: Sacred Gaja (Royal Elephant) + Sahasrara Kamal (Lotus)
 */
export function createHaveliDoorPanelCanvas(side: 'left' | 'right'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Dark Seasoned Sheesham Wood Base with Rich Warm Undertones
  const woodGrad = ctx.createLinearGradient(0, 0, 1024, 2048);
  woodGrad.addColorStop(0, '#260F07');
  woodGrad.addColorStop(0.35, '#38160B');
  woodGrad.addColorStop(0.7, '#2A1007');
  woodGrad.addColorStop(1, '#1A0A04');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, 0, 1024, 2048);

  // Organic Hand-Plained Wood Grain Streaks
  ctx.save();
  for (let y = 0; y < 2048; y += 10) {
    const alpha = 0.07 + Math.sin(y * 0.015) * 0.04;
    ctx.strokeStyle = y % 30 === 0 ? `rgba(229, 193, 88, ${alpha * 0.7})` : `rgba(10, 3, 1, ${alpha * 1.8})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(300, y + 25, 700, y - 20, 1024, y + 15);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Heavy Carved Moldings with Gold Foil Edging
  ctx.save();
  ctx.strokeStyle = '#120502';
  ctx.lineWidth = 32;
  ctx.strokeRect(20, 20, 984, 2008);

  ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
  ctx.lineWidth = 14;
  ctx.strokeRect(44, 44, 936, 1960);

  ctx.strokeStyle = FOLK_PALETTE.vermilion;
  ctx.lineWidth = 6;
  ctx.strokeRect(62, 62, 900, 1924);
  ctx.restore();

  // 3. Two Large Hand-Painted Folk-Art Panels
  const panelW = 860;
  const panelH = 880;
  const panel1Y = 90;
  const panel2Y = 1050;

  const drawPanelRecess = (y: number) => {
    ctx.save();
    ctx.fillStyle = '#180703';
    ctx.fillRect(82, y, panelW, panelH);

    // Subtle vermilion-washed background
    const pGrad = ctx.createRadialGradient(82 + panelW / 2, y + panelH / 2, 40, 82 + panelW / 2, y + panelH / 2, panelW / 2);
    pGrad.addColorStop(0, '#381408');
    pGrad.addColorStop(0.75, '#220B04');
    pGrad.addColorStop(1, '#150602');
    ctx.fillStyle = pGrad;
    ctx.fillRect(96, y + 14, panelW - 28, panelH - 28);

    // Double frame
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 8;
    ctx.strokeRect(104, y + 22, panelW - 44, panelH - 44);

    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 3;
    ctx.strokeRect(116, y + 34, panelW - 68, panelH - 68);
    ctx.restore();
  };

  drawPanelRecess(panel1Y);
  drawPanelRecess(panel2Y);

  // 4. Panel Illustrations based on Door Side
  if (side === 'left') {
    // ----------------------------------------------------
    // TOP PANEL (LEFT): SACRED SURYA MANDALA (MADHUBANI SUN)
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel1Y + panelH / 2);

    // Radiant Flame Sunburst Rays
    const numRays = 24;
    for (let r = 0; r < numRays; r++) {
      const angle = (r * Math.PI * 2) / numRays;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = r % 2 === 0 ? FOLK_PALETTE.brightSaffron : FOLK_PALETTE.vermilion;
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(24, 280);
      ctx.lineTo(0, 340);
      ctx.lineTo(-24, 280);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Sacred Solar Disk
    ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.charcoalInk;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Sacred Madhubani Facial Features (Surya Face)
    // Prominent Almond Eyes with Double Linework
    ctx.fillStyle = FOLK_PALETTE.warmIvory;
    ctx.strokeStyle = FOLK_PALETTE.charcoalInk;
    ctx.lineWidth = 4;

    [-60, 60].forEach((ex) => {
      ctx.beginPath();
      ctx.ellipse(ex, -25, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil with sacred white dot
      ctx.fillStyle = FOLK_PALETTE.charcoalInk;
      ctx.beginPath();
      ctx.arc(ex, -25, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FOLK_PALETTE.warmIvory;
      ctx.beginPath();
      ctx.arc(ex - 3, -27, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Traditional Tilak & Chandra-Bindu on Forehead
    ctx.fillStyle = FOLK_PALETTE.vermilion;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(16, -45);
    ctx.lineTo(-16, -45);
    ctx.closePath();
    ctx.fill();

    // Auspicious Smile & Radiant Cheeks
    ctx.strokeStyle = FOLK_PALETTE.charcoalInk;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 25, 42, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = FOLK_PALETTE.vermilion;
    ctx.beginPath();
    ctx.arc(-70, 25, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(70, 25, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ----------------------------------------------------
    // BOTTOM PANEL (LEFT): ROYAL MAYURA (PEACOCK AMIDST LOTUSES)
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel2Y + panelH / 2);

    // Peacock Body
    ctx.fillStyle = FOLK_PALETTE.peacockTeal;
    ctx.beginPath();
    ctx.moveTo(-50, 140);
    ctx.bezierCurveTo(-110, 40, -90, -80, -20, -120);
    ctx.bezierCurveTo(20, -140, 60, -90, 40, 20);
    ctx.bezierCurveTo(20, 100, 10, 140, -50, 140);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 5;
    ctx.stroke();

    // S-Neck & Crest
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 4;
    for (let c = -25; c <= 15; c += 10) {
      ctx.beginPath();
      ctx.moveTo(-20, -135);
      ctx.lineTo(-20 + c, -180);
      ctx.stroke();
      ctx.fillStyle = FOLK_PALETTE.turquoise;
      ctx.beginPath();
      ctx.arc(-20 + c, -185, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grand Fan-Tail Feathers Spreading Outwards
    for (let f = 0; f < 12; f++) {
      const fa = -0.4 + (f * Math.PI) / 10;
      const dist = 240;
      const fx = Math.cos(fa) * dist - 30;
      const fy = Math.sin(fa) * dist - 40;

      ctx.fillStyle = f % 2 === 0 ? FOLK_PALETTE.brightSaffron : FOLK_PALETTE.tealBright;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 40, 22, fa, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Eye of peacock feather
      ctx.fillStyle = FOLK_PALETTE.indigo;
      ctx.beginPath();
      ctx.arc(fx, fy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FOLK_PALETTE.turquoise;
      ctx.beginPath();
      ctx.arc(fx, fy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

  } else {
    // ----------------------------------------------------
    // TOP PANEL (RIGHT): SACRED GAJA (ROYAL CEREMONIAL ELEPHANT)
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel1Y + panelH / 2);

    // Elephant Massive Rounded Body
    ctx.fillStyle = FOLK_PALETTE.indigo;
    ctx.beginPath();
    ctx.arc(40, 30, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Head and Trunk curling gracefully upward with lotus
    ctx.fillStyle = FOLK_PALETTE.indigo;
    ctx.beginPath();
    ctx.moveTo(-60, -40);
    ctx.bezierCurveTo(-140, -100, -220, -30, -200, 70);
    ctx.bezierCurveTo(-180, 170, -120, 200, -90, 140);
    ctx.bezierCurveTo(-70, 90, -120, 70, -130, 20);
    ctx.bezierCurveTo(-140, -30, -100, -30, -60, -40);
    ctx.fill();
    ctx.stroke();

    // Royal Jhool (Embroidered Ceremonial Saddle Cloth)
    ctx.fillStyle = FOLK_PALETTE.vermilion;
    ctx.beginPath();
    ctx.rect(-20, -60, 150, 120);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Jhool Gold Fringe & Lotus Motif
    ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
    ctx.beginPath();
    ctx.arc(55, 0, 30, 0, Math.PI * 2);
    ctx.fill();

    // Tusk with Gold Cap
    ctx.fillStyle = FOLK_PALETTE.warmIvory;
    ctx.beginPath();
    ctx.moveTo(-120, 20);
    ctx.quadraticCurveTo(-180, 40, -190, 0);
    ctx.quadraticCurveTo(-160, 0, -120, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Sacred Lotus Held in Trunk
    ctx.fillStyle = FOLK_PALETTE.lotusPink;
    ctx.beginPath();
    ctx.ellipse(-90, 130, 32, 20, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // ----------------------------------------------------
    // BOTTOM PANEL (RIGHT): SAHASRARA KAMAL (SACRED LOTUS MANDALA)
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel2Y + panelH / 2);

    // Concentric Circular Pattachitra Rings
    [290, 220, 150, 80].forEach((r, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? FOLK_PALETTE.antiqueGold : FOLK_PALETTE.vermilion;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Outer 16 Lotus Petals (Rani Pink)
    for (let p = 0; p < 16; p++) {
      const pa = (p * Math.PI * 2) / 16;
      ctx.save();
      ctx.rotate(pa);
      ctx.fillStyle = p % 2 === 0 ? FOLK_PALETTE.raniPink : FOLK_PALETTE.lotusPink;
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.quadraticCurveTo(45, 220, 0, 290);
      ctx.quadraticCurveTo(-45, 220, 0, 140);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Inner 8 Saffron Petals
    for (let p = 0; p < 8; p++) {
      const pa = (p * Math.PI * 2) / 8 + Math.PI / 8;
      ctx.save();
      ctx.rotate(pa);
      ctx.fillStyle = FOLK_PALETTE.brightSaffron;
      ctx.beginPath();
      ctx.moveTo(0, 70);
      ctx.quadraticCurveTo(30, 110, 0, 150);
      ctx.quadraticCurveTo(-30, 110, 0, 70);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.marigoldYellow;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Central Golden Seed Head (Karnika)
    ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Alpana Dots
    ctx.fillStyle = FOLK_PALETTE.charcoalInk;
    for (let d = 0; d < 8; d++) {
      const da = (d * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.arc(Math.cos(da) * 28, Math.sin(da) * 28, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Brass Gul-Meekh Pyramid Studs (Hand-Plated Metalwork)
  ctx.save();
  const studRows = [70, 520, 1030, 1500, 1980];
  const studCols = [60, 290, 512, 734, 964];

  studRows.forEach((sy) => {
    studCols.forEach((sx) => {
      // Brass base rosette
      ctx.fillStyle = FOLK_PALETTE.antiqueGold;
      ctx.beginPath();
      ctx.arc(sx, sy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#260F07';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shiny center stud highlight
      ctx.fillStyle = FOLK_PALETTE.warmIvory;
      ctx.beginPath();
      ctx.arc(sx - 3, sy - 3, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  ctx.restore();

  return canvas;
}

/**
 * 3. COURTYARD MURAL WALLS (2048x1024)
 * Traditional Indian Miniature & Madhubani Mural:
 * Sprawling Tree of Life (Kalpavriksha), perched songbirds, flowering lotuses,
 * running deer, and carved jharokha niches holding lit oil lamps.
 */
export function createCourtyardMuralWallCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Deep Indigo & Twilight Palace Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  bgGrad.addColorStop(0, '#141C38');
  bgGrad.addColorStop(0.6, '#0B1021');
  bgGrad.addColorStop(1, '#070A14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Traditional Ornamental Top & Bottom Pattachitra Cornice
  ctx.fillStyle = FOLK_PALETTE.antiqueGold;
  ctx.fillRect(0, 0, 2048, 40);
  ctx.fillRect(0, 984, 2048, 40);

  ctx.fillStyle = FOLK_PALETTE.vermilion;
  ctx.fillRect(0, 40, 2048, 14);
  ctx.fillRect(0, 970, 2048, 14);

  // Chevron Band on Cornice
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 3;
  for (let x = 0; x < 2048; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 15, 40);
    ctx.lineTo(x + 30, 0);
    ctx.stroke();
  }

  // Two Majestic Trees of Life (Kalpavriksha) in Madhubani Style
  const drawTreeOfLife = (rootX: number) => {
    ctx.save();
    ctx.translate(rootX, 960);

    // Tree Trunk
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -180, 0, -380);
    ctx.stroke();

    // Sprawling Symmetrical Branches
    const branches = [
      { sx: 0, sy: -180, c1x: -120, c1y: -240, ex: -240, ey: -320 },
      { sx: 0, sy: -180, c1x: 120, c1y: -240, ex: 240, ey: -320 },
      { sx: 0, sy: -280, c1x: -160, c1y: -380, ex: -320, ey: -460 },
      { sx: 0, sy: -280, c1x: 160, c1y: -380, ex: 320, ey: -460 },
      { sx: 0, sy: -380, c1x: -90, c1y: -500, ex: -180, ey: -620 },
      { sx: 0, sy: -380, c1x: 90, c1y: -500, ex: 180, ey: -620 },
    ];

    branches.forEach((b) => {
      ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(b.sx, b.sy);
      ctx.quadraticCurveTo(b.c1x, b.c1y, b.ex, b.ey);
      ctx.stroke();

      // Blooming Lotus & Mango Leaf Clusters at branch tips
      ctx.fillStyle = FOLK_PALETTE.raniPink;
      ctx.beginPath();
      ctx.ellipse(b.ex, b.ey, 26, 16, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Perched Songbirds
      ctx.fillStyle = FOLK_PALETTE.turquoise;
      ctx.beginPath();
      ctx.ellipse(b.c1x, b.c1y - 12, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
      ctx.beginPath();
      ctx.arc(b.c1x + 14, b.c1y - 14, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Flanking Auspicious Deer (Mriga) at the base
    [-110, 110].forEach((dx) => {
      ctx.fillStyle = FOLK_PALETTE.terracottaLight;
      ctx.beginPath();
      ctx.ellipse(dx, -40, 32, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = FOLK_PALETTE.warmIvory;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Antlers
      ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dx + (dx < 0 ? 15 : -15), -60);
      ctx.lineTo(dx + (dx < 0 ? 25 : -25), -85);
      ctx.stroke();
    });

    ctx.restore();
  };

  drawTreeOfLife(512);
  drawTreeOfLife(1536);

  // Alternating Carved Jharokha Niches with Glowing Oil Lamps
  const niches = [180, 850, 1198, 1868];
  niches.forEach((nx) => {
    ctx.save();
    ctx.translate(nx, 480);

    // Sandstone Scalloped Niche Frame
    ctx.fillStyle = '#220803';
    ctx.beginPath();
    ctx.arc(0, -60, 75, Math.PI, 0);
    ctx.lineTo(75, 120);
    ctx.lineTo(-75, 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 7;
    ctx.stroke();

    // Terracotta Diya inside Niche
    ctx.fillStyle = FOLK_PALETTE.terracottaWarm;
    ctx.beginPath();
    ctx.arc(0, 95, 28, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Golden Flame
    ctx.fillStyle = FOLK_PALETTE.brightSaffron;
    ctx.beginPath();
    ctx.moveTo(0, 95);
    ctx.quadraticCurveTo(12, 60, 0, 45);
    ctx.quadraticCurveTo(-12, 60, 0, 95);
    ctx.fill();

    // Flame Radiance Halo
    const nHalo = ctx.createRadialGradient(0, 65, 5, 0, 65, 80);
    nHalo.addColorStop(0, 'rgba(255, 176, 0, 0.45)');
    nHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nHalo;
    ctx.beginPath();
    ctx.arc(0, 65, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  return canvas;
}

/**
 * 4. COURTYARD FLOOR MANDALA (2048x2048)
 * Massive concentric Rangoli (Alpana) in vibrant folk pigments:
 * 16 giant lotus petals in rani pink, turquoise, vermilion & saffron,
 * concentric geometric bands, and sacred rice-flour filigree dots.
 */
export function createCourtyardFloorCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Deep Terracotta & Indigo Polished Stone Terrace Ground
  const floorGrad = ctx.createRadialGradient(1024, 1024, 200, 1024, 1024, 1100);
  floorGrad.addColorStop(0, '#2A0D08');
  floorGrad.addColorStop(0.5, '#1B0805');
  floorGrad.addColorStop(1, '#0B0402');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Concentric Pattachitra Circular Rings
  ctx.save();
  ctx.translate(1024, 1024);

  const ringStyles = [
    { r: 960, col: FOLK_PALETTE.antiqueGold, w: 14 },
    { r: 920, col: FOLK_PALETTE.warmIvory, w: 6 },
    { r: 850, col: FOLK_PALETTE.vermilion, w: 12 },
    { r: 760, col: FOLK_PALETTE.turquoise, w: 8 },
    { r: 640, col: FOLK_PALETTE.brightSaffron, w: 10 },
    { r: 500, col: FOLK_PALETTE.peacockTeal, w: 8 },
    { r: 360, col: FOLK_PALETTE.raniPink, w: 8 },
    { r: 220, col: FOLK_PALETTE.marigoldYellow, w: 6 },
  ];

  ringStyles.forEach((ring) => {
    ctx.strokeStyle = ring.col;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Layer 1: 16 Giant Outer Lotus Petals (Rani Pink & Bright Saffron)
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? FOLK_PALETTE.raniPink : FOLK_PALETTE.brightSaffron;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.quadraticCurveTo(120, 640, 0, 920);
    ctx.quadraticCurveTo(-120, 640, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner petal filigree spine
    ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(0, 890);
    ctx.stroke();
    ctx.restore();
  }

  // Layer 2: 16 Peacock Teal & Turquoise Secondary Petals
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16 + Math.PI / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? FOLK_PALETTE.tealBright : FOLK_PALETTE.turquoise;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.quadraticCurveTo(80, 440, 0, 720);
    ctx.quadraticCurveTo(-80, 440, 0, 220);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // Layer 3: Central Golden Star Mandir Platform
  ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 7;
  ctx.stroke();

  // Fine Sacred Alpana Dots
  ctx.fillStyle = FOLK_PALETTE.warmIvory;
  for (let p = 0; p < 32; p++) {
    const pa = (p * Math.PI * 2) / 32;
    ctx.beginPath();
    ctx.arc(Math.cos(pa) * 195, Math.sin(pa) * 195, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  return canvas;
}

/**
 * 5. PALACE PAVILION HORIZON BACKDROP (2048x1024)
 * Indian Miniature Palace Horizon:
 * Layered chhatris, illuminated jharokhas with warm candle glow,
 * cypress trees (Sarv), kadamba trees, and celestial twilight sky.
 */
export function createPalaceBackdropCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Celestial Twilight Sky Gradient (Deep Indigo to Peacock Teal)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  skyGrad.addColorStop(0, '#0B0F24');
  skyGrad.addColorStop(0.4, '#141C38');
  skyGrad.addColorStop(0.8, '#08252C');
  skyGrad.addColorStop(1, '#03171B');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Twinkling Golden Stars & Radiant Crescent Moon
  ctx.save();
  ctx.fillStyle = FOLK_PALETTE.warmIvory;
  for (let s = 0; s < 120; s++) {
    const sx = Math.random() * 2048;
    const sy = Math.random() * 500;
    const size = Math.random() * 3 + 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Crescent Moon (Dvitiya Chandra)
  ctx.fillStyle = FOLK_PALETTE.marigoldYellow;
  ctx.beginPath();
  ctx.arc(1720, 180, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F1530';
  ctx.beginPath();
  ctx.arc(1735, 170, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Layered Indian Miniature Palace Pavilions & Chhatris
  const drawChhatri = (cx: number, cy: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Onion Dome / Lotus Cupola
    ctx.fillStyle = FOLK_PALETTE.antiqueGold;
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.quadraticCurveTo(-90, -80, 0, -140);
    ctx.quadraticCurveTo(90, -80, 70, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Kalash Spire
    ctx.fillStyle = FOLK_PALETTE.brightSaffron;
    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.lineTo(8, -170);
    ctx.lineTo(0, -195);
    ctx.lineTo(-8, -170);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Slender Pillars supporting dome
    ctx.fillStyle = FOLK_PALETTE.terracottaWarm;
    [-55, -20, 20, 55].forEach((px) => {
      ctx.fillRect(px - 4, 0, 8, 110);
      ctx.strokeRect(px - 4, 0, 8, 110);
    });

    // Balcony Plinth
    ctx.fillStyle = FOLK_PALETTE.vermilion;
    ctx.fillRect(-75, 110, 150, 20);
    ctx.strokeRect(-75, 110, 150, 20);
    ctx.restore();
  };

  // Center Grand Chhatri and flanking pavilions
  drawChhatri(1024, 480, 1.4);
  drawChhatri(640, 540, 1.0);
  drawChhatri(1408, 540, 1.0);
  drawChhatri(300, 600, 0.8);
  drawChhatri(1748, 600, 0.8);

  // Stippled Miniature Cypress Trees (Sarv) between pavilions
  const drawCypressTree = (tx: number, ty: number, height: number) => {
    ctx.save();
    ctx.translate(tx, ty);

    // Slender flame-shaped cypress foliage
    ctx.fillStyle = FOLK_PALETTE.forestGreen;
    ctx.beginPath();
    ctx.moveTo(0, -height);
    ctx.quadraticCurveTo(35, -height * 0.4, 18, 0);
    ctx.lineTo(-18, 0);
    ctx.quadraticCurveTo(-35, -height * 0.4, 0, -height);
    ctx.closePath();
    ctx.fill();

    // Leaf cluster stippling in gold and lime
    ctx.fillStyle = FOLK_PALETTE.leafGreen;
    for (let l = 0; l < 45; l++) {
      const lx = (Math.random() - 0.5) * 36;
      const ly = -Math.random() * height * 0.9;
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawCypressTree(480, 780, 240);
  drawCypressTree(820, 760, 260);
  drawCypressTree(1228, 760, 260);
  drawCypressTree(1580, 780, 240);

  return canvas;
}

/**
 * 6. HANDCRAFTED TERRACOTTA DIYA TEXTURE (2048x2048)
 * Burnished earthen clay with hand-painted Madhubani floral motifs,
 * white rice-flour alpana dot rims, and subtle natural clay variation.
 */
export function createTerracottaDiyaCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Rich Baked Clay Gradation (Deep burnt umber to warm terracotta-saffron)
  const clayGrad = ctx.createRadialGradient(1024, 1024, 180, 1024, 1024, 1024);
  clayGrad.addColorStop(0, '#E66838');
  clayGrad.addColorStop(0.35, '#C64E22');
  clayGrad.addColorStop(0.75, '#9E3816');
  clayGrad.addColorStop(1, '#631B06');
  ctx.fillStyle = clayGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Ceramic hand-burnished clay rings
  ctx.save();
  for (let i = 0; i < 50; i++) {
    const radius = 220 + i * 36;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 176, 0, 0.14)' : 'rgba(70, 20, 6, 0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(1024, 1024, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Hand-Engraved Madhubani Border along Diya Rim
  ctx.save();
  ctx.translate(1024, 1024);

  // Outer gold inlay band
  ctx.strokeStyle = FOLK_PALETTE.antiqueGold;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(0, 0, 880, 0, Math.PI * 2);
  ctx.stroke();

  // White rice-flour engraved rim trim
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 855, 0, Math.PI * 2);
  ctx.stroke();

  // 32 Sacred Rice-Flour Alpana Dots along Rim
  ctx.fillStyle = FOLK_PALETTE.warmIvory;
  for (let i = 0; i < 32; i++) {
    const angle = (i * Math.PI * 2) / 32;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 855, Math.sin(angle) * 855, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radiating Madhubani Kamal (Lotus) Petals on Clay Surface
  for (let p = 0; p < 16; p++) {
    const pa = (p * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(pa);

    ctx.fillStyle = p % 2 === 0 ? FOLK_PALETTE.vermilion : FOLK_PALETTE.brightSaffron;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.quadraticCurveTo(60, 560, 0, 800);
    ctx.quadraticCurveTo(-60, 560, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = FOLK_PALETTE.warmIvory;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // Inner Golden Oil Reservoir Ring
  ctx.fillStyle = FOLK_PALETTE.brightSaffron;
  ctx.beginPath();
  ctx.arc(0, 0, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = FOLK_PALETTE.warmIvory;
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.restore();
  return canvas;
}

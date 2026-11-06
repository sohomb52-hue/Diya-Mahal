/**
 * High-Resolution Authentic Madhubani (Mithila) Folk-Art Procedural Texture Generators
 * Implements traditional Mithila painting techniques:
 * - Authentic 8-pigment palette (Vermilion, Terracotta, Mustard, Turmeric, Leaf Green, Peacock Blue, Ivory Parchment, Ink Black)
 * - Double-line black ink outlines (Suhani / Katchni linework)
 * - Fine parallel hatching (Katchni) and bold color fills (Bharni)
 * - Auspicious folk motifs: Surya (Sun God), Mayura (Peacock), Matsya (Sacred Fish), Gaja (Elephant), Kamal (Lotus), Kalpavriksha (Tree of Life)
 * - Handcrafted fibrous parchment & natural rice paste textures
 */

/* User-Specified Authentic Madhubani Palette */
export const MADHUBANI_PALETTE = {
  vermilionRed: '#A82420',
  terracotta: '#C65D38',
  mustardYellow: '#E8B947',
  naturalTurmeric: '#D99A32',
  leafGreen: '#47764B',
  peacockBlue: '#236C79',
  ivoryParchment: '#F4E6C8',
  inkBlack: '#211A17',
  warmWhite: '#FCF8EE',
  earthBrown: '#3D2418',
};

/**
 * Applies authentic handmade Mithila parchment texture with organic paper fibers
 */
function applyParchmentGround(ctx: CanvasRenderingContext2D, width: number, height: number, baseColor = MADHUBANI_PALETTE.ivoryParchment) {
  // 1. Warm parchment wash
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.1,
    width / 2, height / 2, width * 0.75
  );
  grad.addColorStop(0, '#FAF3E3');
  grad.addColorStop(0.5, baseColor);
  grad.addColorStop(0.85, '#E8D4B0');
  grad.addColorStop(1, '#D9C29A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle fibrous striations
  ctx.save();
  ctx.strokeStyle = 'rgba(61, 36, 24, 0.04)';
  ctx.lineWidth = 1.2;
  for (let y = 0; y < height; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.sin(y * 0.02) * 8));
    ctx.bezierCurveTo(
      width * 0.33, y - 6,
      width * 0.66, y + 6,
      width, y + (Math.cos(y * 0.03) * 8)
    );
    ctx.stroke();
  }

  // 3. Very subtle speckling (handmade cotton fiber flecks)
  ctx.fillStyle = 'rgba(33, 26, 23, 0.03)';
  for (let i = 0; i < 350; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }
  ctx.restore();
}

/**
 * Traditional Madhubani double-line stroke with optional hatching
 */
function strokeMadhubaniDouble(ctx: CanvasRenderingContext2D, lineWidth = 4, gap = 4) {
  ctx.save();
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = lineWidth + gap * 2;
  ctx.stroke();
  ctx.strokeStyle = MADHUBANI_PALETTE.ivoryParchment;
  ctx.lineWidth = gap;
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws Madhubani fish-scale or diagonal Katchni hatching in a region
 */
function fillKatchniHatching(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, spacing = 8) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(33, 26, 23, 0.35)';
  ctx.lineWidth = 1.5;
  for (let i = -h; i < w + h; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a running Madhubani border of alternating lotus buds, leaves, and geometric chevrons
 */
function drawMadhubaniBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, thickness = 40) {
  ctx.save();
  // Outer frame
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);

  // Inner frame
  ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 18, y + 18, w - 36, h - 36);

  // Chevron border filling
  ctx.strokeStyle = MADHUBANI_PALETTE.terracotta;
  ctx.lineWidth = 2.5;
  const step = 28;

  // Top & bottom horizontal border vines
  for (let bx = x + 30; bx < x + w - 40; bx += step) {
    // Top floral bud
    ctx.fillStyle = (bx / step) % 2 === 0 ? MADHUBANI_PALETTE.mustardYellow : MADHUBANI_PALETTE.peacockBlue;
    ctx.beginPath();
    ctx.ellipse(bx, y + 28, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bottom floral bud
    ctx.fillStyle = (bx / step) % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.leafGreen;
    ctx.beginPath();
    ctx.ellipse(bx, y + h - 28, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Left & right vertical border vines
  for (let by = y + 30; by < y + h - 40; by += step) {
    ctx.fillStyle = (by / step) % 2 === 0 ? MADHUBANI_PALETTE.leafGreen : MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.ellipse(x + 28, by, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = (by / step) % 2 === 0 ? MADHUBANI_PALETTE.peacockBlue : MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.ellipse(x + w - 28, by, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 1. HAVELI GATE ARCH PORTAL (2048x2048)
 * Decorated with traditional Madhubani village entrance murals:
 * Symmetrical sacred peacocks, Kalash with sprouting mango leaves,
 * running floral creeper vines (lata-patra), and double-ink borders.
 */
export function createHaveliGatePortalCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Natural warm terracotta & ivory Mithila wall ground
  applyParchmentGround(ctx, 2048, 2048, '#F0DEC0');

  // Terracotta base pilaster wash on edges
  ctx.fillStyle = 'rgba(198, 93, 56, 0.25)';
  ctx.fillRect(0, 0, 160, 2048);
  ctx.fillRect(2048 - 160, 0, 160, 2048);
  ctx.fillRect(0, 0, 2048, 160);

  // 2. Dense Madhubani outer ornamental borders
  drawMadhubaniBorder(ctx, 30, 30, 2048 - 60, 2048 - 60, 48);

  // 3. Central Arch Cavity (Intricate double-line cusped arch with floral finials)
  ctx.save();
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 8;
  ctx.strokeRect(170, 170, 1708, 1708);

  ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
  ctx.lineWidth = 4;
  ctx.strokeRect(185, 185, 1678, 1678);

  // 4. Sacred Kalash (Auspicious Brass Pot) at Arch Keystone with Sprouting Mango Leaves & Coconut
  const drawSacredKalash = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Pot Base
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Fine Katchni hatching on pot
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2;
    for (let l = -35; l <= 35; l += 8) {
      ctx.beginPath();
      ctx.moveTo(l, -20);
      ctx.lineTo(l, 35);
      ctx.stroke();
    }

    // Sacred Swastika / Shubh symbol in vermilion
    ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(0, -18);
    ctx.lineTo(12, -18);
    ctx.moveTo(0, 18);
    ctx.lineTo(-12, 18);
    ctx.moveTo(-18, 0);
    ctx.lineTo(-18, -12);
    ctx.moveTo(18, 0);
    ctx.lineTo(18, 12);
    ctx.stroke();

    // Sprouting Mango Leaves (Amra-Patra)
    const leafAngles = [-0.65, -0.38, -0.15, 0.15, 0.38, 0.65];
    leafAngles.forEach((ang) => {
      ctx.save();
      ctx.rotate(ang);
      ctx.fillStyle = MADHUBANI_PALETTE.leafGreen;
      ctx.beginPath();
      ctx.ellipse(0, -85, 14, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Leaf midrib and parallel veins
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(0, -128);
      ctx.stroke();
      ctx.restore();
    });

    // Coconut Finial (Nariyal)
    ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
    ctx.beginPath();
    ctx.arc(0, -70, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.restore();
  };

  drawSacredKalash(1024, 280);

  // 5. Flanking Royal Peacocks (Madhubani Mayura) facing inwards on Arch Spandrels
  const drawMadhubaniSpandrelPeacock = (cx: number, cy: number, flip: boolean) => {
    ctx.save();
    ctx.translate(cx, cy);
    if (flip) ctx.scale(-1, 1);

    // Peacock Crest
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    for (let c = -18; c <= 18; c += 9) {
      ctx.beginPath();
      ctx.moveTo(0, -75);
      ctx.lineTo(c * 1.5, -110);
      ctx.stroke();
      ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
      ctx.beginPath();
      ctx.arc(c * 1.5, -112, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Graceful Head & Neck
    ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.bezierCurveTo(45, -60, 60, 5, 25, 45);
    ctx.bezierCurveTo(-15, 25, -20, -40, 0, -65);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Characteristic Madhubani fish-eye with double ring
    ctx.fillStyle = MADHUBANI_PALETTE.ivoryParchment;
    ctx.beginPath();
    ctx.ellipse(14, -50, 11, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.beginPath();
    ctx.arc(16, -50, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sharp beak holding a string of pearl beads
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.moveTo(28, -54);
    ctx.lineTo(54, -50);
    ctx.lineTo(28, -42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fan of 8 Ornate Tail Feathers
    for (let i = 0; i < 8; i++) {
      const angle = 0.25 + (i * Math.PI) / 8.5;
      const fx = Math.cos(angle) * -110 + 10;
      const fy = Math.sin(angle) * -80 + 35;

      ctx.fillStyle = i % 2 === 0 ? MADHUBANI_PALETTE.naturalTurmeric : MADHUBANI_PALETTE.vermilionRed;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 32, 16, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner Eye Feather
      ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  };

  drawMadhubaniSpandrelPeacock(400, 380, false);
  drawMadhubaniSpandrelPeacock(1648, 380, true);

  // 6. Running Auspicious Fish Pair (Matsya) at Arch Base
  const drawMadhubaniFish = (fx: number, fy: number, rot: number) => {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rot);

    // Fish Body
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.quadraticCurveTo(0, -28, 45, 0);
    ctx.quadraticCurveTo(0, 28, -50, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Fish Tail
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(75, -24);
    ctx.lineTo(60, 0);
    ctx.lineTo(75, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scale Hatching
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2;
    for (let s = -25; s <= 25; s += 10) {
      ctx.beginPath();
      ctx.arc(s, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }

    // Fish Eye
    ctx.fillStyle = MADHUBANI_PALETTE.ivoryParchment;
    ctx.beginPath();
    ctx.arc(-30, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.beginPath();
    ctx.arc(-30, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawMadhubaniFish(420, 1850, 0);
  drawMadhubaniFish(560, 1850, 0.2);
  drawMadhubaniFish(1628, 1850, Math.PI);
  drawMadhubaniFish(1488, 1850, Math.PI - 0.2);

  ctx.restore();
  return canvas;
}

/**
 * 2. HAVELI DOUBLE DOOR PANELS (1024x2048 each)
 * Hand-painted Sheesham wood doors with 2 massive traditional Madhubani panels each:
 * Left Door: Sacred Surya (Sun God) with double-line fish eyes & Mayura (Peacock)
 * Right Door: Sacred Gaja (Festive Elephant) with lotus & Sahasrara Kamal (Lotus Mandala)
 */
export function createHaveliDoorPanelCanvas(side: 'left' | 'right'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Natural Teakwood / Seasoned Terracotta Base with fine parchment grain
  applyParchmentGround(ctx, 1024, 2048, '#EBD5AF');

  // Sheesham Wood Grain & Plank Dividers
  ctx.save();
  ctx.strokeStyle = 'rgba(61, 36, 24, 0.12)';
  ctx.lineWidth = 3;
  for (let y = 0; y < 2048; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y + Math.sin(y * 0.02) * 12);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Heavy Carved Outer Molding with Traditional Double-line Borders
  drawMadhubaniBorder(ctx, 24, 24, 976, 2000, 36);

  // 3. Two Recessed Hand-Painted Mithila Folk Art Panels
  const panelW = 860;
  const panelH = 880;
  const panel1Y = 85;
  const panel2Y = 1050;

  const drawPanelFrame = (py: number) => {
    ctx.save();
    // Inner parchment ground with warm saffron tint
    const pGrad = ctx.createLinearGradient(82, py, 82 + panelW, py + panelH);
    pGrad.addColorStop(0, '#FFF6E5');
    pGrad.addColorStop(0.5, '#F7E7CD');
    pGrad.addColorStop(1, '#ECD3B0');
    ctx.fillStyle = pGrad;
    ctx.fillRect(82, py, panelW, panelH);

    // Madhubani Double-Line Frame
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 6;
    ctx.strokeRect(82, py, panelW, panelH);

    ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.lineWidth = 4;
    ctx.strokeRect(96, py + 14, panelW - 28, panelH - 28);

    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(108, py + 26, panelW - 52, panelH - 52);

    // Running leaf border inside panel rim
    ctx.fillStyle = MADHUBANI_PALETTE.leafGreen;
    for (let lx = 130; lx < 82 + panelW - 50; lx += 32) {
      ctx.beginPath();
      ctx.ellipse(lx, py + 20, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lx, py + panelH - 20, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawPanelFrame(panel1Y);
  drawPanelFrame(panel2Y);

  if (side === 'left') {
    // -------------------------------------------------------------------------
    // LEFT TOP PANEL: SACRED MADHUBANI SURYA (THE SUN GOD)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel1Y + panelH / 2);

    // 24 Radiating Saffron & Vermilion Flame Rays
    for (let r = 0; r < 24; r++) {
      const angle = (r * Math.PI * 2) / 24;
      ctx.save();
      ctx.rotate(angle);

      ctx.fillStyle = r % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.mustardYellow;
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(26, 275);
      ctx.lineTo(0, 340);
      ctx.lineTo(-26, 275);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Fine parallel Katchni lines inside every flame ray
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 1.5;
      for (let f = 190; f <= 300; f += 20) {
        ctx.beginPath();
        ctx.moveTo(-12, f);
        ctx.lineTo(12, f);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Solar Face Disc
    ctx.fillStyle = MADHUBANI_PALETTE.naturalTurmeric;
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 148, 0, Math.PI * 2);
    ctx.stroke();

    // Characteristic Madhubani Double-Lined Fish Eyes
    [-60, 60].forEach((ex) => {
      ctx.fillStyle = MADHUBANI_PALETTE.warmWhite;
      ctx.beginPath();
      ctx.ellipse(ex, -25, 36, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Pupil with sacred white dot
      ctx.fillStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.beginPath();
      ctx.arc(ex, -25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = MADHUBANI_PALETTE.warmWhite;
      ctx.beginPath();
      ctx.arc(ex - 3, -28, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Auspicious Vermilion Tilak & Chandrabindu
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(18, -45);
    ctx.lineTo(-18, -45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Serene Divine Smiling Lips
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 26, 44, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Rosy Vermilion Cheeks
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.arc(-70, 26, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(70, 26, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // -------------------------------------------------------------------------
    // LEFT BOTTOM PANEL: ROYAL MADHUBANI MAYURA (PEACOCK)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel2Y + panelH / 2);

    // Peacock Body with dense Katchni striations
    ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
    ctx.beginPath();
    ctx.moveTo(-50, 140);
    ctx.bezierCurveTo(-115, 40, -95, -80, -20, -120);
    ctx.bezierCurveTo(20, -140, 60, -90, 40, 20);
    ctx.bezierCurveTo(20, 100, 10, 140, -50, 140);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 5;
    ctx.stroke();

    // S-Neck Crest with triple Kalgi plumes
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4;
    for (let c = -25; c <= 15; c += 10) {
      ctx.beginPath();
      ctx.moveTo(-20, -135);
      ctx.lineTo(-20 + c, -185);
      ctx.stroke();
      ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
      ctx.beginPath();
      ctx.arc(-20 + c, -190, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Magnificent Outstretched Peacock Fan Tail
    for (let f = 0; f < 13; f++) {
      const fa = -0.45 + (f * Math.PI) / 10.5;
      const dist = 250;
      const fx = Math.cos(fa) * dist - 30;
      const fy = Math.sin(fa) * dist - 40;

      ctx.fillStyle = f % 2 === 0 ? MADHUBANI_PALETTE.naturalTurmeric : MADHUBANI_PALETTE.leafGreen;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 42, 22, fa, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Eye Feather
      ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
      ctx.beginPath();
      ctx.arc(fx, fy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
      ctx.beginPath();
      ctx.arc(fx, fy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

  } else {
    // -------------------------------------------------------------------------
    // RIGHT TOP PANEL: SACRED GAJA (FESTIVE ELEPHANT)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel1Y + panelH / 2);

    // Elephant Rounded Body
    ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
    ctx.beginPath();
    ctx.arc(40, 30, 165, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Upraised Auspicious Trunk
    ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
    ctx.beginPath();
    ctx.moveTo(-60, -40);
    ctx.bezierCurveTo(-140, -100, -220, -30, -200, 70);
    ctx.bezierCurveTo(-180, 170, -120, 200, -90, 140);
    ctx.bezierCurveTo(-70, 90, -120, 70, -130, 20);
    ctx.bezierCurveTo(-140, -30, -100, -30, -60, -40);
    ctx.fill();
    ctx.stroke();

    // Royal Jhool (Embroidered Saddle Cloth) with Lotus Motifs
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.rect(-25, -60, 155, 125);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    ctx.strokeRect(-25, -60, 155, 125);

    // Tusk with Vermilion Tip
    ctx.fillStyle = MADHUBANI_PALETTE.ivoryParchment;
    ctx.beginPath();
    ctx.moveTo(-120, 20);
    ctx.quadraticCurveTo(-180, 40, -190, 0);
    ctx.quadraticCurveTo(-160, 0, -120, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Sacred Lotus in Trunk
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.ellipse(-90, 130, 34, 22, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // -------------------------------------------------------------------------
    // RIGHT BOTTOM PANEL: SAHASRARA KAMAL (SACRED LOTUS MANDALA)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.translate(82 + panelW / 2, panel2Y + panelH / 2);

    // Concentric Circular Borders with Katchni lines
    [300, 230, 160, 85].forEach((r, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.peacockBlue;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    // 16 Lotus Petals (Vermilion & Mustard)
    for (let p = 0; p < 16; p++) {
      const pa = (p * Math.PI * 2) / 16;
      ctx.save();
      ctx.rotate(pa);
      ctx.fillStyle = p % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.naturalTurmeric;
      ctx.beginPath();
      ctx.moveTo(0, 145);
      ctx.quadraticCurveTo(48, 225, 0, 300);
      ctx.quadraticCurveTo(-48, 225, 0, 145);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Central Seed Head (Karnika)
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // 4. Brass Door Hardware: Spiked Gul-Meekh Studs & Medallions
  const studRows = [70, 520, 1030, 1500, 1980];
  const studCols = [60, 290, 512, 734, 964];

  studRows.forEach((sy) => {
    studCols.forEach((sx) => {
      ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
      ctx.beginPath();
      ctx.arc(sx, sy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
      ctx.beginPath();
      ctx.arc(sx - 3, sy - 3, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  return canvas;
}

/**
 * 3. COURTYARD MURAL WALLS (2048x1024)
 * Authentic Mithila Village Mural:
 * - Handcrafted village houses with decorated Madhubani painted walls
 * - Sprawling Tree of Life (Kalpavriksha) with dense patterned leaves
 * - Perched singing birds, peacocks, running deer (Mriga)
 * - Lotus ponds with detailed auspicious fish pair (Matsya)
 * - Carved jharokhas holding softly glowing earthen oil lamps
 */
export function createCourtyardMuralWallCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Warm parchment ground (authentic handmade paper tone)
  applyParchmentGround(ctx, 2048, 1024, '#F4E6C8');

  // 2. Traditional top & bottom Madhubani border bands
  ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
  ctx.fillRect(0, 0, 2048, 38);
  ctx.fillRect(0, 1024 - 38, 2048, 38);

  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 2048, 38);
  ctx.strokeRect(0, 1024 - 38, 2048, 38);

  // Chevron running vine on borders
  ctx.strokeStyle = MADHUBANI_PALETTE.mustardYellow;
  ctx.lineWidth = 3;
  for (let x = 0; x < 2048; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 16, 38);
    ctx.lineTo(x + 32, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 1024 - 38);
    ctx.lineTo(x + 16, 1024);
    ctx.lineTo(x + 32, 1024 - 38);
    ctx.stroke();
  }

  // 3. Two Majestic Kalpavriksha (Trees of Life)
  const drawTreeOfLife = (rootX: number) => {
    ctx.save();
    ctx.translate(rootX, 980);

    // Thick Double-Lined Trunk with fine bark hatching
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -180, 0, -380);
    ctx.stroke();

    ctx.strokeStyle = MADHUBANI_PALETTE.terracotta;
    ctx.lineWidth = 18;
    ctx.stroke();

    // Sprawling Symmetrical Branches
    const branches = [
      { sx: 0, sy: -180, c1x: -120, c1y: -240, ex: -250, ey: -320 },
      { sx: 0, sy: -180, c1x: 120, c1y: -240, ex: 250, ey: -320 },
      { sx: 0, sy: -280, c1x: -160, c1y: -380, ex: -330, ey: -460 },
      { sx: 0, sy: -280, c1x: 160, c1y: -380, ex: 330, ey: -460 },
      { sx: 0, sy: -380, c1x: -90, c1y: -500, ex: -190, ey: -620 },
      { sx: 0, sy: -380, c1x: 90, c1y: -500, ex: 190, ey: -620 },
    ];

    branches.forEach((b) => {
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(b.sx, b.sy);
      ctx.quadraticCurveTo(b.c1x, b.c1y, b.ex, b.ey);
      ctx.stroke();

      ctx.strokeStyle = MADHUBANI_PALETTE.terracotta;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Clusters of patterned Madhubani leaves & blooming lotus buds
      ctx.fillStyle = MADHUBANI_PALETTE.leafGreen;
      ctx.beginPath();
      ctx.ellipse(b.ex, b.ey, 28, 16, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Perched Songbirds (Suga / Parrots)
      ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
      ctx.beginPath();
      ctx.ellipse(b.c1x, b.c1y - 14, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
      ctx.beginPath();
      ctx.arc(b.c1x + 16, b.c1y - 15, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  drawTreeOfLife(512);
  drawTreeOfLife(1536);

  // 4. Mithila Village Courtyard Wall Niches (Jharokha) with Glowing Terracotta Diyas
  const niches = [180, 850, 1198, 1868];
  niches.forEach((nx) => {
    ctx.save();
    ctx.translate(nx, 480);

    // Decorated Arch Niche
    ctx.fillStyle = '#EBD3AD';
    ctx.beginPath();
    ctx.arc(0, -60, 78, Math.PI, 0);
    ctx.lineTo(78, 120);
    ctx.lineTo(-78, 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Terracotta Diya inside Niche
    ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
    ctx.beginPath();
    ctx.arc(0, 95, 30, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Auspicious Flame with Warm Glow
    ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.moveTo(0, 95);
    ctx.quadraticCurveTo(14, 60, 0, 42);
    ctx.quadraticCurveTo(-14, 60, 0, 95);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  });

  return canvas;
}

/**
 * 4. COURTYARD FLOOR MANDALA (ARIPANA / ALAPANA) (2048x2048)
 * Authentic Mithila Aripana:
 * - Concentric geometric circles with double ink lines
 * - 16-Petal Lotus in vermilion red, mustard yellow, leaf green & peacock blue
 * - Auspicious Matsya (fish pair) swimming in sacred circle
 * - Natural white rice-flour dots and fine katchni hatching
 */
export function createCourtyardFloorCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Warm terracotta clay & ivory ground
  applyParchmentGround(ctx, 2048, 2048, '#F0DEC0');

  ctx.save();
  ctx.translate(1024, 1024);

  // Concentric Rings with Double Ink Strokes
  const rings = [
    { r: 960, col: MADHUBANI_PALETTE.vermilionRed, w: 12 },
    { r: 920, col: MADHUBANI_PALETTE.inkBlack, w: 5 },
    { r: 850, col: MADHUBANI_PALETTE.mustardYellow, w: 10 },
    { r: 760, col: MADHUBANI_PALETTE.peacockBlue, w: 8 },
    { r: 640, col: MADHUBANI_PALETTE.leafGreen, w: 9 },
    { r: 500, col: MADHUBANI_PALETTE.terracotta, w: 8 },
    { r: 360, col: MADHUBANI_PALETTE.vermilionRed, w: 8 },
    { r: 220, col: MADHUBANI_PALETTE.mustardYellow, w: 6 },
  ];

  rings.forEach((ring) => {
    ctx.strokeStyle = ring.col;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Layer 1: 16 Giant Outer Lotus Petals (Vermilion & Mustard)
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.quadraticCurveTo(120, 640, 0, 920);
    ctx.quadraticCurveTo(-120, 640, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // Internal Katchni spine
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(0, 890);
    ctx.stroke();
    ctx.restore();
  }

  // Layer 2: 16 Secondary Petals (Peacock Blue & Leaf Green)
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16 + Math.PI / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? MADHUBANI_PALETTE.peacockBlue : MADHUBANI_PALETTE.leafGreen;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.quadraticCurveTo(80, 440, 0, 720);
    ctx.quadraticCurveTo(-80, 440, 0, 220);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // Central Auspicious Sacred Fish Circle (Matsya - Quintessential Mithila Motif)
  ctx.fillStyle = MADHUBANI_PALETTE.naturalTurmeric;
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Fine Sacred Rice-Flour Alpana Dots
  ctx.fillStyle = MADHUBANI_PALETTE.warmWhite;
  for (let p = 0; p < 32; p++) {
    const pa = (p * Math.PI * 2) / 32;
    ctx.beginPath();
    ctx.arc(Math.cos(pa) * 195, Math.sin(pa) * 195, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
  return canvas;
}

/**
 * 5. PALACE & VILLAGE HORIZON BACKDROP (2048x1024)
 * Authentic Mithila Panorama:
 * - Traditional Indian houses with Madhubani decorated walls
 * - Flying birds (Suga) across warm parchment sky
 * - Sacred Surya (Sun) & Chandra (Moon) motifs
 * - Blooming lotus ponds and village trees
 */
export function createPalaceBackdropCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Warm ivory parchment sky
  applyParchmentGround(ctx, 2048, 1024, '#FBF0DC');

  // Radiant Madhubani Sun in Upper Sky
  ctx.save();
  ctx.translate(1720, 200);
  ctx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Sun Rays
  for (let r = 0; r < 16; r++) {
    const ra = (r * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(ra);
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.moveTo(-10, 65);
    ctx.lineTo(0, 105);
    ctx.lineTo(10, 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Flying Birds (Suga / Parrots) with outstretched patterned wings
  const drawFlyingBird = (bx: number, by: number, scale: number) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(scale, scale);

    ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -35, 45, -30);
    ctx.quadraticCurveTo(25, -15, 10, -5);
    ctx.quadraticCurveTo(20, 35, 45, 30);
    ctx.quadraticCurveTo(20, 15, 0, 0);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  };

  drawFlyingBird(340, 140, 0.9);
  drawFlyingBird(440, 180, 0.7);
  drawFlyingBird(680, 110, 0.85);
  drawFlyingBird(1280, 160, 0.95);

  // Village Houses & Haveli Pavilions along Horizon
  const drawMadhubaniHouse = (hx: number, hy: number, width: number, height: number) => {
    ctx.save();
    ctx.translate(hx, hy);

    // Sloped Thatched / Terracotta Roof with patterned tiles
    ctx.fillStyle = MADHUBANI_PALETTE.terracotta;
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, 0);
    ctx.lineTo(width * 0.5, -height * 0.65);
    ctx.lineTo(width * 1.1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Wall Base (Ivory with Vermilion Border)
    ctx.fillStyle = '#F5E6CC';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeRect(0, 0, width, height);

    // Decorated Mural on House Wall (Sacred Lotus & Fish)
    ctx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.45, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  };

  drawMadhubaniHouse(180, 620, 220, 260);
  drawMadhubaniHouse(640, 580, 260, 300);
  drawMadhubaniHouse(1140, 590, 240, 290);
  drawMadhubaniHouse(1620, 630, 220, 250);

  return canvas;
}

/**
 * 6. HANDCRAFTED TERRACOTTA DIYA TEXTURE (2048x2048)
 * Authentic Mithila Hand-Burnished Earthen Clay Diya:
 * - Baked terracotta clay with natural mineral variations
 * - Double-line black ink motifs with fine katchni hatching
 * - Hand-painted white rice-flour alpana dots along rim
 * - Concentric sacred lotus petals in vermilion & mustard yellow
 */
export function createTerracottaDiyaCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Natural baked terracotta clay ground
  const clayGrad = ctx.createRadialGradient(1024, 1024, 150, 1024, 1024, 1024);
  clayGrad.addColorStop(0, '#D9734E');
  clayGrad.addColorStop(0.35, MADHUBANI_PALETTE.terracotta);
  clayGrad.addColorStop(0.7, '#A33C1A');
  clayGrad.addColorStop(1, '#66220E');
  ctx.fillStyle = clayGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Hand-burnished ceramic potter's wheel rings
  ctx.save();
  for (let i = 0; i < 48; i++) {
    const radius = 220 + i * 36;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(232, 185, 71, 0.16)' : 'rgba(33, 26, 23, 0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(1024, 1024, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Hand-Engraved Madhubani Border along Diya Rim
  ctx.save();
  ctx.translate(1024, 1024);

  // Outer Mustard band
  ctx.strokeStyle = MADHUBANI_PALETTE.mustardYellow;
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(0, 0, 880, 0, Math.PI * 2);
  ctx.stroke();

  // Double-line Ink border
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 892, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 868, 0, Math.PI * 2);
  ctx.stroke();

  // White rice-flour alpana dots along rim
  ctx.fillStyle = MADHUBANI_PALETTE.warmWhite;
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 880, Math.sin(angle) * 880, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 16 Radiating Madhubani Lotus Petals (Vermilion & Mustard with Katchni lines)
  for (let p = 0; p < 16; p++) {
    const pa = (p * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(pa);

    ctx.fillStyle = p % 2 === 0 ? MADHUBANI_PALETTE.vermilionRed : MADHUBANI_PALETTE.mustardYellow;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.quadraticCurveTo(65, 560, 0, 820);
    ctx.quadraticCurveTo(-65, 560, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner petal spine
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(0, 790);
    ctx.stroke();
    ctx.restore();
  }

  // Inner Golden Ghee Basin with Peacock Blue Ring
  ctx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
  ctx.beginPath();
  ctx.arc(0, 0, 330, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = MADHUBANI_PALETTE.naturalTurmeric;
  ctx.beginPath();
  ctx.arc(0, 0, 310, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return canvas;
}

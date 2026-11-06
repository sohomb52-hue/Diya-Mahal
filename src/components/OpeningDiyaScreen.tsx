import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../utils/audio';
import { FastForward, ArrowDown, Sparkles } from 'lucide-react';

interface OpeningDiyaScreenProps {
  onUnlocked: () => void;
}

interface BgFireworkParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  colorHex: number;
  alpha: number;
  decay: number;
  size: number;
}

interface FloatingEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

const FESTIVE_PALETTE_HEX = [
  0xffb000, // Marigold Yellow
  0xff5722, // Vermilion Red
  0xe91e63, // Rani Pink
  0x20c9c3, // Turquoise
  0x008c95, // Peacock Teal
  0xff8f00, // Bright Saffron
  0xfff1d6, // Warm Ivory
];

/* =========================================================================
   HIGH-RESOLUTION PROCEDURAL TEXTURE GENERATORS (INDIAN FOLK ART & HAVELI)
   ========================================================================= */

/**
 * Creates an ultra-detailed 2048x2048 Indian Haveli Wooden Double Door Texture
 * with rich seasoned rosewood grain, carved moldings, brass gul-meekh studs,
 * and intricate Madhubani-painted panels (Surya, Mayura, Kamal, Gaja).
 */
function createHaveliDoorCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Rich Seasoned Rosewood & Teak Base with Warm Amber Undertones
  const woodGrad = ctx.createLinearGradient(0, 0, 2048, 2048);
  woodGrad.addColorStop(0, '#260F07');
  woodGrad.addColorStop(0.3, '#3D180A');
  woodGrad.addColorStop(0.7, '#2D1107');
  woodGrad.addColorStop(1, '#1A0A04');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Smooth Wood Grain Ribbons (Subtle organic variation, anti-aliased)
  ctx.save();
  for (let y = 0; y < 2048; y += 8) {
    const alpha = 0.08 + Math.sin(y * 0.02) * 0.04;
    ctx.strokeStyle = y % 24 === 0 ? `rgba(255, 176, 0, ${alpha * 0.5})` : `rgba(15, 5, 2, ${alpha * 1.5})`;
    ctx.lineWidth = 2 + Math.sin(y * 0.05) * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      600,
      y + Math.sin(y * 0.015) * 45,
      1400,
      y - Math.sin(y * 0.012) * 40,
      2048,
      y + Math.cos(y * 0.018) * 30
    );
    ctx.stroke();
  }
  ctx.restore();

  // 2. Heavy Carved Outer Border with Gold Leaf & Vermilion Trim
  ctx.save();
  // Outer bevel
  ctx.lineWidth = 36;
  ctx.strokeStyle = '#150602';
  ctx.strokeRect(30, 30, 1988, 1988);

  // Gold metallic border with Pattachitra chevron tooling
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#FFB000';
  ctx.strokeRect(60, 60, 1928, 1928);

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#E63946';
  ctx.strokeRect(84, 84, 1880, 1880);

  // Running Pattachitra vine border around door perimeter
  ctx.strokeStyle = '#FF8F00';
  ctx.lineWidth = 4;
  for (let x = 110; x < 1938; x += 40) {
    ctx.beginPath();
    ctx.arc(x, 105, 12, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 20, 1943, 12, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Four Ornate Recessed Panels (Madhubani Folk-Art Masterpieces)
  const panelWidth = 840;
  const panelHeight = 840;
  const panels = [
    { x: 140, y: 140, type: 'surya' }, // Top-Left: Sacred Sun (Surya)
    { x: 1068, y: 140, type: 'mayura' }, // Top-Right: Royal Peacock (Mayura)
    { x: 140, y: 1068, type: 'kamal' }, // Bottom-Left: Sacred Lotus (Kamal)
    { x: 1068, y: 1068, type: 'gaja' }, // Bottom-Right: Auspicious Elephant (Gaja)
  ];

  panels.forEach(({ x, y, type }) => {
    ctx.save();
    ctx.translate(x, y);

    // Deep recessed carved panel frame
    ctx.fillStyle = '#1D0904';
    ctx.fillRect(0, 0, panelWidth, panelHeight);

    // Inner gold-bordered background with subtle vermilion wash
    const pGrad = ctx.createRadialGradient(panelWidth / 2, panelHeight / 2, 40, panelWidth / 2, panelHeight / 2, panelWidth / 2);
    pGrad.addColorStop(0, '#3A1509');
    pGrad.addColorStop(0.7, '#250C05');
    pGrad.addColorStop(1, '#150602');
    ctx.fillStyle = pGrad;
    ctx.fillRect(24, 24, panelWidth - 48, panelHeight - 48);

    // Multi-line gold and ivory frame
    ctx.strokeStyle = '#FFB000';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, panelWidth - 60, panelHeight - 60);

    ctx.strokeStyle = '#FFF1D6';
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 44, panelWidth - 88, panelHeight - 88);

    // Corner ornate brass spandrels
    const drawCornerBracket = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(70, 0);
      ctx.quadraticCurveTo(45, 25, 25, 45);
      ctx.quadraticCurveTo(25, 45, 0, 70);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawCornerBracket(44, 44, 0);
    drawCornerBracket(panelWidth - 44, 44, Math.PI / 2);
    drawCornerBracket(panelWidth - 44, panelHeight - 44, Math.PI);
    drawCornerBracket(44, panelHeight - 44, (Math.PI * 3) / 2);

    const pcx = panelWidth / 2;
    const pcy = panelHeight / 2;

    if (type === 'surya') {
      // --- MADHUBANI SURYA (Sacred Sun God) ---
      // Outer flame rays
      ctx.save();
      ctx.translate(pcx, pcy);
      for (let r = 0; r < 24; r++) {
        const angle = (r * Math.PI * 2) / 24;
        ctx.rotate(angle);
        ctx.fillStyle = r % 2 === 0 ? '#FF5722' : '#FFB000';
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.lineTo(25, 260);
        ctx.lineTo(0, 300);
        ctx.lineTo(-25, 260);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFF1D6';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.rotate(-angle);
      }

      // Sun Face Disc
      ctx.fillStyle = '#FF8F00';
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF1D6';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 145, 0, Math.PI * 2);
      ctx.stroke();

      // Madhubani double-line fish eyes & auspicious Tilak
      ctx.fillStyle = '#FFF1D6';
      ctx.beginPath();
      ctx.ellipse(-50, -25, 32, 16, -0.1, 0, Math.PI * 2);
      ctx.ellipse(50, -25, 32, 16, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F1126';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#0F1126';
      ctx.beginPath();
      ctx.arc(-45, -25, 10, 0, Math.PI * 2);
      ctx.arc(45, -25, 10, 0, Math.PI * 2);
      ctx.fill();

      // Tilak
      ctx.fillStyle = '#E63946';
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.quadraticCurveTo(16, -50, 0, -20);
      ctx.quadraticCurveTo(-16, -50, 0, -90);
      ctx.fill();

      // Serene Smiling Lips
      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 35, 45, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.restore();
    } else if (type === 'mayura') {
      // --- MADHUBANI MAYURA (Royal Peacock) ---
      ctx.save();
      ctx.translate(pcx, pcy);

      // Magnificent fan of peacock feathers
      for (let f = 0; f < 14; f++) {
        const fAngle = -Math.PI * 0.8 + (f * Math.PI * 0.9) / 13;
        ctx.save();
        ctx.rotate(fAngle);
        // Feather Stem
        ctx.strokeStyle = '#20C9C3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(0, 250);
        ctx.stroke();

        // Eye Feather
        ctx.fillStyle = '#008C95';
        ctx.beginPath();
        ctx.ellipse(0, 260, 35, 55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFB000';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#3478F6';
        ctx.beginPath();
        ctx.ellipse(0, 265, 22, 34, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFB000';
        ctx.beginPath();
        ctx.arc(0, 272, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Graceful Peacock Body & Crown
      ctx.fillStyle = '#008C95';
      ctx.beginPath();
      ctx.moveTo(-40, 100);
      ctx.bezierCurveTo(-70, 0, -50, -80, -10, -120);
      ctx.bezierCurveTo(30, -90, 40, -40, 20, 20);
      ctx.bezierCurveTo(40, 60, 20, 120, -40, 100);
      ctx.fill();
      ctx.strokeStyle = '#FFF1D6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Peacock Head & Crest
      ctx.fillStyle = '#20C9C3';
      ctx.beginPath();
      ctx.arc(-10, -135, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF1D6';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Golden Beak
      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.moveTo(10, -140);
      ctx.lineTo(38, -135);
      ctx.lineTo(10, -125);
      ctx.closePath();
      ctx.fill();

      // 3 Crown Crest Plumes (Kalgi)
      for (let c = -1; c <= 1; c++) {
        ctx.strokeStyle = '#FFB000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, -160);
        ctx.lineTo(-10 + c * 22, -195);
        ctx.stroke();
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.arc(-10 + c * 22, -200, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (type === 'kamal') {
      // --- SACRED LOTUS (Kamal Mandala) ---
      ctx.save();
      ctx.translate(pcx, pcy);

      // Concentric rippling waters
      ctx.strokeStyle = '#20C9C3';
      ctx.lineWidth = 3;
      for (let w = 180; w <= 260; w += 28) {
        ctx.beginPath();
        ctx.arc(0, 0, w, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer Layer of Lotus Petals (Rani Pink & Gold Outlines)
      for (let l = 0; l < 12; l++) {
        const lAngle = (l * Math.PI * 2) / 12;
        ctx.save();
        ctx.rotate(lAngle);
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.quadraticCurveTo(65, 140, 0, 220);
        ctx.quadraticCurveTo(-65, 140, 0, 50);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFF1D6';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        // Inner petal vein
        ctx.strokeStyle = '#FFB000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(0, 205);
        ctx.stroke();
        ctx.restore();
      }

      // Inner Layer of Saffron Petals
      for (let l = 0; l < 12; l++) {
        const lAngle = (l * Math.PI * 2) / 12 + Math.PI / 12;
        ctx.save();
        ctx.rotate(lAngle);
        ctx.fillStyle = '#FF8F00';
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.quadraticCurveTo(45, 100, 0, 160);
        ctx.quadraticCurveTo(-45, 100, 0, 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFF1D6';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Center Seed Head (Karnika)
      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#E63946';
      for (let s = 0; s < 8; s++) {
        const sa = (s * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.arc(Math.cos(sa) * 26, Math.sin(sa) * 26, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // --- GAJA (Auspicious Festive Elephant) ---
      ctx.save();
      ctx.translate(pcx, pcy + 30);

      // Body & Legs
      ctx.fillStyle = '#3A1E14';
      ctx.beginPath();
      ctx.moveTo(-180, 80);
      ctx.bezierCurveTo(-220, -40, -140, -130, 40, -110);
      ctx.bezierCurveTo(140, -100, 180, -30, 170, 70);
      ctx.lineTo(130, 130);
      ctx.lineTo(90, 130);
      ctx.lineTo(80, 60);
      ctx.lineTo(-30, 60);
      ctx.lineTo(-40, 130);
      ctx.lineTo(-80, 130);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFF1D6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Raised Auspicious Trunk holding Lotus
      ctx.fillStyle = '#3A1E14';
      ctx.beginPath();
      ctx.moveTo(150, -40);
      ctx.bezierCurveTo(230, -50, 240, -160, 170, -180);
      ctx.bezierCurveTo(140, -170, 180, -120, 130, -70);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFF1D6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Tusk
      ctx.fillStyle = '#FFF1D6';
      ctx.beginPath();
      ctx.moveTo(140, -20);
      ctx.quadraticCurveTo(190, -40, 180, -80);
      ctx.quadraticCurveTo(160, -40, 135, -5);
      ctx.fill();

      // Royal Jhool (Embroidered Saddle Cloth)
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.rect(-90, -90, 160, 110);
      ctx.fill();
      ctx.strokeStyle = '#FFB000';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Gold tassels on saddle cloth
      ctx.fillStyle = '#FFB000';
      for (let t = -80; t <= 60; t += 20) {
        ctx.beginPath();
        ctx.arc(t, 25, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eye
      ctx.fillStyle = '#FFF1D6';
      ctx.beginPath();
      ctx.ellipse(90, -70, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F1126';
      ctx.beginPath();
      ctx.arc(92, -70, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  });

  // 4. Brass Hardware: Rows of Conical Brass Studs (Gul-Meekh)
  ctx.save();
  const studPositions: Array<[number, number]> = [];
  // Vertical stiles
  for (const sx of [110, 1024, 1938]) {
    for (let sy = 120; sy <= 1928; sy += 180) {
      studPositions.push([sx, sy]);
    }
  }
  // Horizontal rails
  for (const sy of [110, 1024, 1938]) {
    for (let sx = 260; sx <= 1788; sx += 220) {
      if (Math.abs(sx - 1024) > 100) studPositions.push([sx, sy]);
    }
  }

  studPositions.forEach(([x, y]) => {
    // Cast shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(x + 5, y + 6, 24, 0, Math.PI * 2);
    ctx.fill();

    // Spiked brass stud base ring
    ctx.fillStyle = '#8B6508';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Gleaming conical brass cap
    const sGrad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, 20);
    sGrad.addColorStop(0, '#FFF1D6');
    sGrad.addColorStop(0.3, '#FFB000');
    sGrad.addColorStop(0.8, '#D48806');
    sGrad.addColorStop(1, '#664200');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 5. Central Vertical Meeting Stile (Interlocking Brass Astragal Bar)
  ctx.save();
  ctx.fillStyle = '#0F0402';
  ctx.fillRect(1008, 0, 32, 2048);

  const astGrad = ctx.createLinearGradient(1000, 0, 1048, 0);
  astGrad.addColorStop(0, '#5A3D06');
  astGrad.addColorStop(0.3, '#FFB000');
  astGrad.addColorStop(0.6, '#FFF1D6');
  astGrad.addColorStop(0.9, '#B87A04');
  astGrad.addColorStop(1, '#3D2502');
  ctx.fillStyle = astGrad;
  ctx.fillRect(1014, 0, 20, 2048);
  ctx.restore();

  return canvas;
}

/**
 * Creates an ultra-detailed 2048x2048 Royal Courtyard Sandstone & Central Rangoli Floor Texture
 */
function createCourtyardFloorCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Warm Rajasthan Sandstone Flagstone Floor
  const baseGrad = ctx.createLinearGradient(0, 0, 2048, 2048);
  baseGrad.addColorStop(0, '#150A20');
  baseGrad.addColorStop(0.5, '#1B0D2A');
  baseGrad.addColorStop(1, '#0E0616');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Flagstone paving grid with soft illuminated mortar lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 241, 214, 0.08)';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2048);
    ctx.stroke();
  }
  for (let y = 0; y <= 2048; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Central Breathtaking Royal Rangoli Mandala
  const cx = 1024;
  const cy = 1024;
  ctx.save();
  ctx.translate(cx, cy);

  // Soft radiant colored powder glow behind rangoli
  const glow = ctx.createRadialGradient(0, 0, 200, 0, 0, 950);
  glow.addColorStop(0, 'rgba(255, 87, 34, 0.45)');
  glow.addColorStop(0.4, 'rgba(233, 30, 99, 0.35)');
  glow.addColorStop(0.7, 'rgba(32, 201, 195, 0.2)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 950, 0, Math.PI * 2);
  ctx.fill();

  // Outermost Ring of 24 Diya Motifs & Petals
  for (let d = 0; d < 24; d++) {
    const angle = (d * Math.PI * 2) / 24;
    ctx.save();
    ctx.rotate(angle);
    // Outer scallop
    ctx.fillStyle = d % 2 === 0 ? '#FF5722' : '#FFB000';
    ctx.beginPath();
    ctx.arc(0, 860, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF1D6';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Tiny flame tip
    ctx.fillStyle = '#FFF1D6';
    ctx.beginPath();
    ctx.moveTo(0, 920);
    ctx.quadraticCurveTo(14, 890, 0, 870);
    ctx.quadraticCurveTo(-14, 890, 0, 920);
    ctx.fill();
    ctx.restore();
  }

  // Concentric Mandala Circles with Pattachitra Trims
  const rings = [
    { r: 820, col: '#FFB000', w: 12 },
    { r: 790, col: '#FFF1D6', w: 5 },
    { r: 730, col: '#E91E63', w: 10 },
    { r: 660, col: '#20C9C3', w: 8 },
    { r: 540, col: '#FF8F00', w: 9 },
    { r: 420, col: '#008C95', w: 7 },
    { r: 300, col: '#FF5722', w: 6 },
    { r: 180, col: '#FFB000', w: 5 },
  ];

  rings.forEach((ring) => {
    ctx.strokeStyle = ring.col;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Layer 1: 16 Giant Lotus Petals (Rani Pink & Bright Saffron)
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? '#E91E63' : '#FF5722';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.quadraticCurveTo(110, 520, 0, 780);
    ctx.quadraticCurveTo(-110, 520, 0, 300);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFF1D6';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // Inner petal filigree
    ctx.strokeStyle = '#FFB000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(0, 750);
    ctx.stroke();
    ctx.restore();
  }

  // Layer 2: 16 Peacock Teal & Turquoise Secondary Petals
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16 + Math.PI / 16;
    ctx.save();
    ctx.rotate(a);

    ctx.fillStyle = i % 2 === 0 ? '#008C95' : '#20C9C3';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.quadraticCurveTo(80, 380, 0, 600);
    ctx.quadraticCurveTo(-80, 380, 0, 200);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFF1D6';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // Layer 3: Central Golden Star Mandir Platform
  ctx.fillStyle = '#FFB000';
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFF1D6';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Fine Sacred Alpana Dots
  ctx.fillStyle = '#FFF1D6';
  for (let p = 0; p < 32; p++) {
    const pa = (p * Math.PI * 2) / 32;
    ctx.beginPath();
    ctx.arc(Math.cos(pa) * 160, Math.sin(pa) * 160, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  return canvas;
}

/**
 * Creates an ultra-detailed 2048x2048 Handcrafted Terracotta Diya Texture
 * with rich baked earthen clay gradients, burnished rim highlights,
 * and engraved Madhubani floral motifs.
 */
function createTerracottaDiyaCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Rich Baked Earthen Terracotta Gradation
  const clayGrad = ctx.createRadialGradient(1024, 1024, 200, 1024, 1024, 1024);
  clayGrad.addColorStop(0, '#E66838');
  clayGrad.addColorStop(0.4, '#C64E22');
  clayGrad.addColorStop(0.8, '#9E3816');
  clayGrad.addColorStop(1, '#6E2008');
  ctx.fillStyle = clayGrad;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Subtle Ceramic Hand-Burnished Clay Striations (Smooth, Non-Pixelated)
  ctx.save();
  for (let i = 0; i < 48; i++) {
    const radius = 250 + i * 36;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 176, 0, 0.12)' : 'rgba(70, 20, 6, 0.2)';
    ctx.lineWidth = 4 + (i % 3) * 2;
    ctx.beginPath();
    ctx.arc(1024, 1024, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Hand-Engraved Madhubani Border along Diya Rim
  ctx.save();
  ctx.translate(1024, 1024);

  // Outer gold inlay band
  ctx.strokeStyle = '#FFB000';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(0, 0, 880, 0, Math.PI * 2);
  ctx.stroke();

  // White rice-flour engraved rim trim
  ctx.strokeStyle = '#FFF1D6';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 840, 0, Math.PI * 2);
  ctx.stroke();

  // 36 Engraved Lotus Petals along Diya Lip
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    ctx.save();
    ctx.rotate(angle);

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(0, 720);
    ctx.quadraticCurveTo(24, 800, 0, 880);
    ctx.quadraticCurveTo(-24, 800, 0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFB000';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // Auspicious Inner Ring of Chevron Engravings
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI * 2) / 72;
    ctx.save();
    ctx.rotate(angle);
    ctx.strokeStyle = '#FFF1D6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-10, 650);
    ctx.lineTo(0, 675);
    ctx.lineTo(10, 650);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  return canvas;
}

/* =========================================================================
   MAIN OPENING DIYA SCREEN COMPONENT
   ========================================================================= */

export const OpeningDiyaScreen: React.FC<OpeningDiyaScreenProps> = ({ onUnlocked }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'gate' | 'opening_gate' | 'courtyard_walk' | 'at_diya' | 'igniting' | 'emerging'>('gate');
  const [instructionText, setInstructionText] = useState('ENTER THE CELEBRATION — Touch the Haveli Gate');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [impactBurst, setImpactBurst] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const stateRef = useRef({
    phase: 'gate' as 'gate' | 'opening_gate' | 'courtyard_walk' | 'at_diya' | 'igniting' | 'emerging',
    gateOpenProgress: 0,
    scrollProgress: 0,
    targetScrollProgress: 0,
    isLit: false,
    lightingProgress: 0,
    wickScreenPos: { x: 0, y: 0, visible: false },
    sparkProgress: -1,
    sparkCoords: { startX: 0, startY: 0, targetX: 0, targetY: 0 },
    touchStartY: 0,
    lastFlameTime: 0,
  });

  useEffect(() => {
    stateRef.current.phase = phase;
  }, [phase]);

  useEffect(() => {
    soundManager.setScene('opening');
    const container = mountRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !overlayCanvas) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Three.js Scene Setup (Atmospheric Midnight Indigo & Peacock Glow)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x130a24, 0.014);

    const aspect = container.clientWidth / container.clientHeight;
    const baseFov = aspect < 1 ? 46 + (1 - aspect) * 24 : 45;

    const camera = new THREE.PerspectiveCamera(baseFov, aspect, 0.1, 100);
    camera.position.set(0, 2.2, 8.6);
    camera.lookAt(0, 2.0, 3.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // High-DPI 2D Overlay Canvas Setup
    const oCtx = overlayCanvas.getContext('2d');
    const resizeOverlay = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      overlayCanvas.width = width * dpr;
      overlayCanvas.height = height * dpr;
      overlayCanvas.style.width = `${width}px`;
      overlayCanvas.style.height = `${height}px`;
      if (oCtx) {
        oCtx.resetTransform();
        oCtx.scale(dpr, dpr);
      }
    };
    resizeOverlay();

    // 2. Artistic Lighting Rig (Warm Festive Illumination with Soft Bounce Light)
    const ambientLight = new THREE.AmbientLight(0x4a235a, 2.4);
    scene.add(ambientLight);

    const moonKeyLight = new THREE.DirectionalLight(0xfff1d6, 2.6);
    moonKeyLight.position.set(5, 12, 7);
    if (!isSoftwareGl) {
      moonKeyLight.castShadow = true;
      moonKeyLight.shadow.mapSize.width = 1024;
      moonKeyLight.shadow.mapSize.height = 1024;
      moonKeyLight.shadow.bias = -0.0004;
      moonKeyLight.shadow.normalBias = 0.02;
    }
    scene.add(moonKeyLight);

    const festiveRimLight = new THREE.DirectionalLight(0xe91e63, 1.8);
    festiveRimLight.position.set(-6, 6, -4);
    scene.add(festiveRimLight);

    const courtyardFillLight = new THREE.DirectionalLight(0x20c9c3, 1.2);
    courtyardFillLight.position.set(0, 3, 14);
    scene.add(courtyardFillLight);

    // Sacred Flame Point Lights (Warm Diya Illumination)
    const flamePointLight = new THREE.PointLight(0xff5722, 0, 18, 1.8);
    flamePointLight.position.set(0, 1.15, -2.1);
    scene.add(flamePointLight);

    const flameGlowLight = new THREE.PointLight(0xffb000, 0, 14, 1.6);
    flameGlowLight.position.set(0, 1.5, -2.1);
    scene.add(flameGlowLight);

    // 3. CELESTIAL STARRY NIGHT SKY PARTICLES
    const starCount = isSoftwareGl ? 150 : 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 1] = Math.random() * 20 - 2;
      starPositions[i * 3 + 2] = -12 - Math.random() * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfff1d6,
      size: 0.09,
      transparent: true,
      opacity: 0.9,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 4. DISTANT CELEBRATORY FIREWORKS
    const bgFireworksParticles: BgFireworkParticle[] = [];
    const spawnBgFirework = (x: number, y: number, z: number) => {
      const colorHex = FESTIVE_PALETTE_HEX[Math.floor(Math.random() * FESTIVE_PALETTE_HEX.length)];
      const count = isSoftwareGl ? 22 : 42;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        const speed = Math.random() * 3.2 + 1.2;

        bgFireworksParticles.push({
          x,
          y,
          z,
          vx: Math.cos(angle) * Math.cos(phi) * speed,
          vy: Math.sin(phi) * speed,
          vz: Math.sin(angle) * Math.cos(phi) * speed,
          colorHex,
          alpha: 1.0,
          decay: Math.random() * 0.018 + 0.014,
          size: Math.random() * 0.12 + 0.05,
        });
      }
    };

    const bgFireworkInterval = window.setInterval(() => {
      const fx = (Math.random() - 0.5) * 24;
      const fy = Math.random() * 6 + 5;
      const fz = -8 - Math.random() * 14;
      spawnBgFirework(fx, fy, fz);
    }, 1800);

    const bgFireworksGroup = new THREE.Group();
    scene.add(bgFireworksGroup);

    // Materials
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      roughness: 0.18,
      metalness: 0.88,
    });

    // 5. HIGH RESOLUTION PROCEDURAL TEXTURES
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const doorCanvas = createHaveliDoorCanvas();
    const doorTex = new THREE.CanvasTexture(doorCanvas);
    doorTex.colorSpace = THREE.SRGBColorSpace;
    doorTex.anisotropy = maxAnisotropy;

    const floorCanvas = createCourtyardFloorCanvas();
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.anisotropy = maxAnisotropy;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;

    const clayCanvas = createTerracottaDiyaCanvas();
    const clayTex = new THREE.CanvasTexture(clayCanvas);
    clayTex.colorSpace = THREE.SRGBColorSpace;
    clayTex.anisotropy = maxAnisotropy;

    // 6. TRADITIONAL INDIAN HAVELI GATE ARCHITECTURE
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 3.4);
    scene.add(gateGroup);

    const woodMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      roughness: 0.38,
      metalness: 0.15,
    });

    const sandstoneArchMat = new THREE.MeshStandardMaterial({
      color: 0x3d1b28,
      roughness: 0.65,
      metalness: 0.1,
    });

    // Carved Sandstone Flanking Pillars with Decorative Capitals & Bases
    const pillarGeo = new THREE.BoxGeometry(0.85, 5.4, 0.85);
    const leftFramePillar = new THREE.Mesh(pillarGeo, sandstoneArchMat);
    leftFramePillar.position.set(-2.65, 2.7, 0);
    gateGroup.add(leftFramePillar);

    const rightFramePillar = new THREE.Mesh(pillarGeo, sandstoneArchMat);
    rightFramePillar.position.set(2.65, 2.7, 0);
    gateGroup.add(rightFramePillar);

    // Carved Pillar Base Plinths
    const plinthGeo = new THREE.BoxGeometry(1.15, 0.5, 1.15);
    const leftPlinth = new THREE.Mesh(plinthGeo, sandstoneArchMat);
    leftPlinth.position.set(-2.65, 0.25, 0);
    gateGroup.add(leftPlinth);

    const rightPlinth = new THREE.Mesh(plinthGeo, sandstoneArchMat);
    rightPlinth.position.set(2.65, 0.25, 0);
    gateGroup.add(rightPlinth);

    // Overhanging Haveli Lintel Beam (Chhajja Eaves)
    const archTopBeamGeo = new THREE.BoxGeometry(6.4, 0.85, 1.1);
    const archTopBeam = new THREE.Mesh(archTopBeamGeo, sandstoneArchMat);
    archTopBeam.position.set(0, 5.3, 0.05);
    gateGroup.add(archTopBeam);

    // Sculpted Multi-Foil Scalloped Brass Arch Medallion
    const archOrnamentGeo = new THREE.TorusGeometry(2.25, 0.24, 16, 48, Math.PI);
    const archOrnament = new THREE.Mesh(archOrnamentGeo, brassMat);
    archOrnament.position.set(0, 4.3, 0.12);
    gateGroup.add(archOrnament);

    // Swaying Brass Temple Bells (Ghantis) with Dynamic Physics
    const bellObjects: Array<{ mesh: THREE.Group; phase: number; baseRotZ: number }> = [];
    const bellPositions = [-1.9, -1.0, 0, 1.0, 1.9];
    bellPositions.forEach((bx, idx) => {
      const singleBellGroup = new THREE.Group();
      singleBellGroup.position.set(bx, 4.75, 0.45);

      // Delicate brass suspension chain
      const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8);
      const chainMesh = new THREE.Mesh(chainGeo, brassMat);
      chainMesh.position.y = -0.22;
      singleBellGroup.add(chainMesh);

      // Flared temple bell body
      const bellGeo = new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.12, 0.05),
          new THREE.Vector2(0.2, 0.25),
          new THREE.Vector2(0.24, 0.35),
          new THREE.Vector2(0.08, 0.4),
        ],
        20
      );
      const bellMesh = new THREE.Mesh(bellGeo, brassMat);
      bellMesh.position.y = -0.55;
      singleBellGroup.add(bellMesh);

      // Bell clapper
      const clapperGeo = new THREE.SphereGeometry(0.05, 10, 10);
      const clapperMesh = new THREE.Mesh(clapperGeo, brassMat);
      clapperMesh.position.y = -0.58;
      singleBellGroup.add(clapperMesh);

      gateGroup.add(singleBellGroup);
      bellObjects.push({
        mesh: singleBellGroup,
        phase: idx * 0.7,
        baseRotZ: 0,
      });
    });

    // Traditional Toran: Mango Leaves & Marigold Flower Garland
    const toranGroup = new THREE.Group();
    const toranCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.3, 4.9, 0.48),
      new THREE.Vector3(-1.2, 4.35, 0.48),
      new THREE.Vector3(0, 4.6, 0.48),
      new THREE.Vector3(1.2, 4.35, 0.48),
      new THREE.Vector3(2.3, 4.9, 0.48),
    ]);
    const toranPoints = toranCurve.getPoints(36);

    toranPoints.forEach((pt, i) => {
      // Mango leaf pendant
      const leafGeo = new THREE.ConeGeometry(0.07, 0.28, 6);
      leafGeo.rotateX(Math.PI);
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x2e9d50,
        roughness: 0.6,
      });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.copy(pt);
      leafMesh.position.y -= 0.12;
      toranGroup.add(leafMesh);

      // Fluffy marigold flower (Genda Phool)
      const isOrange = i % 2 === 0;
      const flowerMat = new THREE.MeshStandardMaterial({
        color: isOrange ? 0xff5722 : 0xffb000,
        roughness: 0.7,
      });
      const fGeo = new THREE.DodecahedronGeometry(0.13, 1);
      const fMesh = new THREE.Mesh(fGeo, flowerMat);
      fMesh.position.copy(pt);
      toranGroup.add(fMesh);
    });
    gateGroup.add(toranGroup);

    // Flanking Carved Stone Niches with Hanging Brass Lanterns (Farshi Kandils)
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 12);
    const lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
    const leftLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    leftLantern.position.set(-2.65, 3.2, 0.58);
    gateGroup.add(leftLantern);

    const rightLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    rightLantern.position.set(2.65, 3.2, 0.58);
    gateGroup.add(rightLantern);

    const leftLanternLight = new THREE.PointLight(0xffb000, 2.6, 6);
    leftLanternLight.position.set(-2.65, 3.2, 0.65);
    gateGroup.add(leftLanternLight);

    const rightLanternLight = new THREE.PointLight(0xffb000, 2.6, 6);
    rightLanternLight.position.set(2.65, 3.2, 0.65);
    gateGroup.add(rightLanternLight);

    // 3D DOUBLE DOORS WITH CARVED PANELS & BRASS HARDWARE
    const doorWidth = 2.18;
    const doorHeight = 4.85;

    const leftDoorPivot = new THREE.Group();
    leftDoorPivot.position.set(-2.22, 0, 0);
    gateGroup.add(leftDoorPivot);

    const doorPanelGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.18);
    const leftDoorMesh = new THREE.Mesh(doorPanelGeo, woodMat);
    leftDoorMesh.position.set(doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      leftDoorMesh.castShadow = true;
      leftDoorMesh.receiveShadow = true;
    }
    leftDoorPivot.add(leftDoorMesh);

    // Heavy Brass Lion-Head Knockers & Rings
    const handleRingGeo = new THREE.TorusGeometry(0.22, 0.045, 12, 24);
    const leftHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    leftHandleRing.position.set(doorWidth - 0.38, doorHeight / 2, 0.14);
    leftDoorMesh.add(leftHandleRing);

    const rightDoorPivot = new THREE.Group();
    rightDoorPivot.position.set(2.22, 0, 0);
    gateGroup.add(rightDoorPivot);

    const rightDoorMesh = new THREE.Mesh(doorPanelGeo, woodMat);
    rightDoorMesh.position.set(-doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      rightDoorMesh.castShadow = true;
      rightDoorMesh.receiveShadow = true;
    }
    rightDoorPivot.add(rightDoorMesh);

    const rightHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    rightHandleRing.position.set(-doorWidth + 0.38, doorHeight / 2, 0.14);
    rightDoorMesh.add(rightHandleRing);

    // 7. THE COURTYARD ENVIRONMENT (A LIVING FOLK-ART PAINTING)
    const courtyardGroup = new THREE.Group();
    scene.add(courtyardGroup);

    // Polished Courtyard Terrace Floor with Central Rangoli
    const floorGeo = new THREE.PlaneGeometry(16, 42);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -10);
    if (!isSoftwareGl) floorMesh.receiveShadow = true;
    courtyardGroup.add(floorMesh);

    // Rajasthani Sandstone Colonnade Pillars with Scalloped Arches
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x3d1a33,
      roughness: 0.55,
      metalness: 0.1,
    });
    const courtyardPillarGeo = new THREE.CylinderGeometry(0.38, 0.48, 4.6, 16);
    const pathwayDiyasLights: THREE.PointLight[] = [];

    for (let z = 18; z >= -6; z -= 5) {
      // Left and right walkway pillars
      const pLeft = new THREE.Mesh(courtyardPillarGeo, pillarMat);
      pLeft.position.set(-4.2, 2.3, z);
      courtyardGroup.add(pLeft);

      const pRight = new THREE.Mesh(courtyardPillarGeo, pillarMat);
      pRight.position.set(4.2, 2.3, z);
      courtyardGroup.add(pRight);

      // Pathway Terracotta Diyas along the royal walk
      for (const side of [-1, 1]) {
        const pDiyaGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.12, 16);
        const pDiyaMat = new THREE.MeshStandardMaterial({
          color: 0xbd4b24,
          roughness: 0.6,
        });
        const pDiyaMesh = new THREE.Mesh(pDiyaGeo, pDiyaMat);
        pDiyaMesh.position.set(side * 2.8, 0.06, z);
        courtyardGroup.add(pDiyaMesh);

        // Fluid glowing flame on each pathway diya
        const pFlameGeo = new THREE.ConeGeometry(0.06, 0.22, 10);
        const pFlameMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
        const pFlameMesh = new THREE.Mesh(pFlameGeo, pFlameMat);
        pFlameMesh.position.set(side * 2.8, 0.22, z);
        courtyardGroup.add(pFlameMesh);

        const pLight = new THREE.PointLight(0xffb000, 0.7, 4.5);
        pLight.position.set(side * 2.8, 0.32, z);
        courtyardGroup.add(pLight);
        pathwayDiyasLights.push(pLight);
      }
    }

    // 8. THE SACRED DIYA: A TRUE WORK OF ART
    const centralDiyaGroup = new THREE.Group();
    centralDiyaGroup.position.set(0, 0.22, -2.4);
    centralDiyaGroup.scale.set(0.72, 0.72, 0.72);
    courtyardGroup.add(centralDiyaGroup);

    // Ornate Carved Brass Thali Base Platform
    const platformGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.25, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.4,
      metalness: 0.2,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.12;
    if (!isSoftwareGl) platformMesh.receiveShadow = true;
    centralDiyaGroup.add(platformMesh);

    // Terracotta Material for Handcrafted Diya
    const terracottaMat = new THREE.MeshStandardMaterial({
      map: clayTex,
      roughness: 0.48,
      metalness: 0.08,
      color: 0xbd4b24,
    });

    // Handcrafted Asymmetrical Terracotta Diya Bowl (Lathe Geometry with Authentic Organic Curvature)
    const lathePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.24),
      new THREE.Vector2(0.96, 0.28),
      new THREE.Vector2(1.65, 0.52),
      new THREE.Vector2(2.05, 0.94),
      new THREE.Vector2(1.92, 1.18),
      new THREE.Vector2(1.6, 1.06),
      new THREE.Vector2(0.95, 0.74),
      new THREE.Vector2(0, 0.64),
    ];
    const bowlGeo = new THREE.LatheGeometry(lathePoints, 64);
    const bowlMesh = new THREE.Mesh(bowlGeo, terracottaMat);
    if (!isSoftwareGl) {
      bowlMesh.castShadow = true;
      bowlMesh.receiveShadow = true;
    }
    centralDiyaGroup.add(bowlMesh);

    // Pinched Beak (Pouring Spout for Wick)
    const beakGeo = new THREE.ConeGeometry(0.42, 0.78, 24);
    beakGeo.scale(1.3, 0.88, 1.5);
    const beakMesh = new THREE.Mesh(beakGeo, terracottaMat);
    beakMesh.rotation.x = -Math.PI / 3;
    beakMesh.position.set(0, 1.06, 1.76);
    centralDiyaGroup.add(beakMesh);

    // Hand-Twisted Cotton Wick (Rui Batti with Visible Natural Fibers)
    const wickCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.8, 0.45),
      new THREE.Vector3(0, 0.96, 1.15),
      new THREE.Vector3(0, 1.16, 1.62),
    ]);
    const wickGeo = new THREE.TubeGeometry(wickCurve, 28, 0.08, 12, false);
    const wickMat = new THREE.MeshStandardMaterial({
      color: 0x22170f,
      roughness: 0.96,
      metalness: 0.02,
    });
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    centralDiyaGroup.add(wickMesh);

    // Golden Ghee Reservoir inside Diya
    const gheeGeo = new THREE.CylinderGeometry(1.2, 0.8, 0.1, 32);
    const gheeMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75,
    });
    const gheeMesh = new THREE.Mesh(gheeGeo, gheeMat);
    gheeMesh.position.set(0, 0.68, 0.4);
    centralDiyaGroup.add(gheeMesh);

    const wickTipNode = new THREE.Object3D();
    wickTipNode.position.set(0, 1.22, 1.66);
    centralDiyaGroup.add(wickTipNode);

    // 9. MULTI-PLANE FLOATING MARIGOLD & LOTUS PETALS
    const petalCount = isSoftwareGl ? 20 : 45;
    const floatingPetalsGroup = new THREE.Group();
    scene.add(floatingPetalsGroup);

    const singlePetalGeo = new THREE.SphereGeometry(0.1, 14, 10);
    singlePetalGeo.scale(1.2, 0.22, 1.8);
    const petalColors = [0xffb000, 0xff8f00, 0xff5722, 0xe91e63, 0x20c9c3];
    const petalData: Array<{
      mesh: THREE.Mesh;
      speedY: number;
      rotSpeedX: number;
      rotSpeedY: number;
      swayFreq: number;
      initialX: number;
    }> = [];

    for (let i = 0; i < petalCount; i++) {
      const color = petalColors[i % petalColors.length];
      const pMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const pMesh = new THREE.Mesh(singlePetalGeo, pMat);
      const x = (Math.random() - 0.5) * 15;
      const y = Math.random() * 8.5;
      const z = Math.random() * 26 - 5;
      pMesh.position.set(x, y, z);
      floatingPetalsGroup.add(pMesh);

      petalData.push({
        mesh: pMesh,
        speedY: 0.16 + Math.random() * 0.24,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.8,
        swayFreq: 0.8 + Math.random() * 1.2,
        initialX: x,
      });
    }

    // 10. SACRED FLAME EMBERS PARTICLE SYSTEM (2D Canvas Overlay)
    const floatingEmbers: FloatingEmber[] = [];
    const spawnEmber = (originX: number, originY: number) => {
      const colors = ['#FFF1D6', '#FFB000', '#FF5722', '#E91E63'];
      floatingEmbers.push({
        x: originX + (Math.random() - 0.5) * 14,
        y: originY,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -Math.random() * 2.8 - 1.5,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        maxLife: 40 + Math.random() * 40,
        life: 0,
      });
    };

    // 11. EVENT HANDLERS
    const handleGateClick = () => {
      if (stateRef.current.phase !== 'gate') return;

      soundManager.playClick();
      soundManager.playLightingFlourish();
      setPhase('opening_gate');
      setInstructionText('COURTYARD REVEALED — Scroll to approach the Sacred Diya');

      // Clink brass door rings
      leftHandleRing.rotation.z = Math.PI * 0.45;
      rightHandleRing.rotation.z = -Math.PI * 0.45;

      // Animate bells swinging
      bellObjects.forEach((b) => {
        b.baseRotZ = (Math.random() - 0.5) * 0.4;
      });
    };

    const triggerLightingSequence = () => {
      if (stateRef.current.isLit || stateRef.current.phase === 'igniting' || stateRef.current.phase === 'emerging') return;

      setPhase('igniting');
      setInstructionText('Igniting the sacred flame...');
      soundManager.playClick();

      const width = container.clientWidth;
      const height = container.clientHeight;

      stateRef.current.sparkProgress = 0;
      stateRef.current.sparkCoords = {
        startX: width * 0.65,
        startY: height * 0.22,
        targetX: stateRef.current.wickScreenPos.x,
        targetY: stateRef.current.wickScreenPos.y,
      };

      const startTime = performance.now();
      const sparkDuration = 900;

      const runSparkTravel = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / sparkDuration, 1);
        stateRef.current.sparkProgress = progress;

        stateRef.current.sparkCoords.targetX = stateRef.current.wickScreenPos.x;
        stateRef.current.sparkCoords.targetY = stateRef.current.wickScreenPos.y;

        if (progress < 1) {
          requestAnimationFrame(runSparkTravel);
        } else {
          stateRef.current.sparkProgress = -1;
          stateRef.current.isLit = true;

          setImpactBurst({
            active: true,
            x: stateRef.current.wickScreenPos.x,
            y: stateRef.current.wickScreenPos.y,
          });
          soundManager.playLightingFlourish();

          const flameStart = performance.now();
          const expandFlame = () => {
            const fElapsed = (performance.now() - flameStart) / 1000;
            const p = Math.min(fElapsed / 1.5, 1);
            stateRef.current.lightingProgress = p;

            flamePointLight.intensity = p * 12.0;
            flameGlowLight.intensity = p * 8.0;
            ambientLight.color.setHSL(0.08, 0.88, 0.22 + p * 0.38);

            if (fElapsed > 1.2 && stateRef.current.phase !== 'emerging') {
              setPhase('emerging');

              const flashStart = performance.now();
              const runFlash = () => {
                const flashElapsed = (performance.now() - flashStart) / 1000;
                if (flashElapsed < 0.7) {
                  setFlashOpacity(Math.min(flashElapsed / 0.7, 1));
                  requestAnimationFrame(runFlash);
                } else {
                  soundManager.playRevealCelebration();
                  onUnlocked();
                }
              };
              runFlash();
            }

            if (p < 1) {
              requestAnimationFrame(expandFlame);
            }
          };

          expandFlame();
        }
      };

      runSparkTravel();
    };

    const handleWheel = (e: WheelEvent) => {
      if (stateRef.current.phase === 'courtyard_walk' || stateRef.current.phase === 'at_diya') {
        const delta = e.deltaY * 0.0016;
        stateRef.current.targetScrollProgress = THREE.MathUtils.clamp(
          stateRef.current.targetScrollProgress + delta,
          0,
          1
        );
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      stateRef.current.touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (stateRef.current.phase === 'courtyard_walk' || stateRef.current.phase === 'at_diya') {
        const deltaY = stateRef.current.touchStartY - e.touches[0].clientY;
        stateRef.current.touchStartY = e.touches[0].clientY;

        const delta = deltaY * 0.0042;
        stateRef.current.targetScrollProgress = THREE.MathUtils.clamp(
          stateRef.current.targetScrollProgress + delta,
          0,
          1
        );
      }
    };

    const handleContainerClick = () => {
      const currentP = stateRef.current.phase;
      if (currentP === 'gate') {
        handleGateClick();
      } else if (currentP === 'at_diya') {
        triggerLightingSequence();
      }
    };

    container.addEventListener('click', handleContainerClick);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const currentAspect = width / height;

      camera.aspect = currentAspect;
      camera.fov = currentAspect < 1 ? 46 + (1 - currentAspect) * 24 : 45;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      resizeOverlay();
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let frameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Animate Swaying Temple Bells
      bellObjects.forEach((b) => {
        b.baseRotZ = THREE.MathUtils.damp(b.baseRotZ, 0, 1.5, delta);
        b.mesh.rotation.z = Math.sin(time * 2.2 + b.phase) * 0.08 + b.baseRotZ;
      });

      // Phase 1: Gate Opening (Realistic 3D Perspective Door Rotation)
      if (stateRef.current.phase === 'opening_gate') {
        stateRef.current.gateOpenProgress = THREE.MathUtils.damp(
          stateRef.current.gateOpenProgress,
          1,
          2.0,
          delta
        );

        const openAngle = stateRef.current.gateOpenProgress * (Math.PI * 0.58);
        leftDoorPivot.rotation.y = -openAngle;
        rightDoorPivot.rotation.y = openAngle;

        camera.position.z = THREE.MathUtils.damp(camera.position.z, 18, 1.8, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.4, 1.8, delta);
        camera.lookAt(0, 1.2, -2.4);

        if (stateRef.current.gateOpenProgress > 0.93) {
          setPhase('courtyard_walk');
        }
      }

      // Phase 2: Courtyard Travel (Smooth Parallax Glide toward Sacred Diya)
      if (stateRef.current.phase === 'courtyard_walk' || stateRef.current.phase === 'at_diya') {
        stateRef.current.scrollProgress = THREE.MathUtils.damp(
          stateRef.current.scrollProgress,
          stateRef.current.targetScrollProgress,
          4.5,
          delta
        );

        setScrollProgress(stateRef.current.scrollProgress);

        const sp = stateRef.current.scrollProgress;
        const camZ = THREE.MathUtils.lerp(18, 1.75, sp);
        const camY = THREE.MathUtils.lerp(2.4, 1.35, sp);

        camera.position.x = Math.sin(time * 0.5) * 0.12;
        camera.position.y = camY + Math.cos(time * 0.4) * 0.06;
        camera.position.z = camZ;
        camera.lookAt(0, 0.78, -2.4);

        pathwayDiyasLights.forEach((light) => {
          light.intensity = 0.6 + sp * 1.6;
        });

        if (sp >= 0.94 && stateRef.current.phase === 'courtyard_walk') {
          setPhase('at_diya');
          setInstructionText('LIGHT THE SACRED DIYA — Touch the wick to ignite');
        } else if (sp < 0.9 && stateRef.current.phase === 'at_diya') {
          setPhase('courtyard_walk');
          setInstructionText('COURTYARD — Scroll or drag down to approach the Diya');
        }
      }

      // Phase 3: Emergence Transition
      if (stateRef.current.phase === 'emerging') {
        camera.position.z = THREE.MathUtils.damp(camera.position.z, -1.8, 2.4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.88, 2.4, delta);
      }

      // Gentle rotation of central Diya base
      centralDiyaGroup.rotation.y += 0.004;

      // Animate Distant Fireworks
      for (let i = bgFireworksParticles.length - 1; i >= 0; i--) {
        const p = bgFireworksParticles[i];
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 0.8 * delta;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          bgFireworksParticles.splice(i, 1);
        }
      }

      bgFireworksGroup.clear();
      if (bgFireworksParticles.length > 0) {
        const bgGeo = new THREE.BufferGeometry();
        const posArr = new Float32Array(bgFireworksParticles.length * 3);
        const colArr = new Float32Array(bgFireworksParticles.length * 3);

        bgFireworksParticles.forEach((p, idx) => {
          posArr[idx * 3] = p.x;
          posArr[idx * 3 + 1] = p.y;
          posArr[idx * 3 + 2] = p.z;

          const c = new THREE.Color(p.colorHex);
          colArr[idx * 3] = c.r * p.alpha;
          colArr[idx * 3 + 1] = c.g * p.alpha;
          colArr[idx * 3 + 2] = c.b * p.alpha;
        });

        bgGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        bgGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

        const bgMat = new THREE.PointsMaterial({
          size: 0.15,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
        bgFireworksGroup.add(new THREE.Points(bgGeo, bgMat));
      }

      // Animate Floating Petals Across Depth Layers
      petalData.forEach((pd) => {
        pd.mesh.position.y -= pd.speedY * delta;
        pd.mesh.position.x = pd.initialX + Math.sin(time * pd.swayFreq) * 0.35;
        pd.mesh.rotation.x += pd.rotSpeedX * delta;
        pd.mesh.rotation.y += pd.rotSpeedY * delta;

        if (pd.mesh.position.y < -1) {
          pd.mesh.position.y = 8.5;
        }
      });

      // Project wick tip to 2D screen coordinates
      wickTipNode.getWorldPosition(tempVec);
      tempVec.project(camera);
      const width = container.clientWidth;
      const height = container.clientHeight;
      const screenX = (tempVec.x * 0.5 + 0.5) * width;
      const screenY = (-(tempVec.y * 0.5) + 0.5) * height;
      stateRef.current.wickScreenPos = {
        x: screenX,
        y: screenY,
        visible: tempVec.z < 1,
      };

      // Direct crisp WebGL rendering
      renderer.render(scene, camera);

      // =========================================================================
      // 2D HIGH-DPI CANVAS OVERLAY: ORGANIC FLAME, SPARKS & SACRED GLOW
      // =========================================================================
      if (oCtx) {
        oCtx.clearRect(0, 0, width, height);

        // 1. Golden Sacred Spark Flight
        const sp = stateRef.current.sparkProgress;
        if (sp >= 0 && sp <= 1) {
          const { startX, startY, targetX, targetY } = stateRef.current.sparkCoords;
          const currX = THREE.MathUtils.lerp(startX, targetX, sp);
          const currY = THREE.MathUtils.lerp(startY, targetY, sp);

          oCtx.save();
          oCtx.strokeStyle = '#FFB000';
          oCtx.lineWidth = 4;
          oCtx.shadowColor = '#FF5722';
          oCtx.shadowBlur = 18;

          oCtx.beginPath();
          oCtx.moveTo(startX, startY);
          const segments = 8;
          for (let s = 1; s <= segments; s++) {
            const segP = (s / segments) * sp;
            const px = THREE.MathUtils.lerp(startX, targetX, segP);
            const py = THREE.MathUtils.lerp(startY, targetY, segP);
            const wave = Math.sin(time * 12 + s) * 16 * (1 - segP);
            oCtx.lineTo(px + wave, py + wave * 0.5);
          }
          oCtx.stroke();

          // Golden Sacred Star Finial
          oCtx.fillStyle = '#FFF1D6';
          oCtx.font = '26px sans-serif';
          oCtx.textAlign = 'center';
          oCtx.textBaseline = 'middle';
          oCtx.fillText('✦', currX, currY);
          oCtx.restore();
        }

        // 2. Beautiful Organic 2D Diya Flame Animation (Fluid 60FPS Bezier Curves)
        if (stateRef.current.isLit && stateRef.current.wickScreenPos.visible) {
          const wx = stateRef.current.wickScreenPos.x;
          const wy = stateRef.current.wickScreenPos.y;
          const progress = stateRef.current.lightingProgress;

          // Spawn floating firefly embers
          if (Math.random() < 0.35) {
            spawnEmber(wx, wy - 30);
          }

          // Smooth multi-frequency harmonic flame flicker
          const fWave1 = Math.sin(time * 7.5) * 4.5;
          const fWave2 = Math.cos(time * 11.2) * 3.0;
          const fHeightMod = Math.sin(time * 5.0) * 6.0;

          const baseW = 30 * progress;
          const baseH = (88 + fHeightMod) * progress;

          oCtx.save();
          oCtx.translate(wx, wy);

          // Outer Radiant Divine Halo (Translucent Radial Glow)
          const haloGrad = oCtx.createRadialGradient(0, -baseH * 0.45, 10, 0, -baseH * 0.45, baseH * 1.5);
          haloGrad.addColorStop(0, 'rgba(255, 176, 0, 0.45)');
          haloGrad.addColorStop(0.5, 'rgba(230, 57, 70, 0.25)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          oCtx.fillStyle = haloGrad;
          oCtx.beginPath();
          oCtx.arc(0, -baseH * 0.45, baseH * 1.5, 0, Math.PI * 2);
          oCtx.fill();

          // Layer 1: Delicate Golden-Yellow Outer Flame
          oCtx.fillStyle = '#FF5722';
          oCtx.strokeStyle = '#FFF1D6';
          oCtx.lineWidth = 2.5;
          oCtx.shadowColor = '#FF8F00';
          oCtx.shadowBlur = 24;

          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(
            -baseW + fWave1,
            -baseH * 0.35,
            -baseW * 0.7 + fWave2,
            -baseH * 0.8,
            fWave1 * 0.6,
            -baseH
          );
          oCtx.bezierCurveTo(
            baseW * 0.7 + fWave2,
            -baseH * 0.8,
            baseW + fWave1,
            -baseH * 0.35,
            0,
            0
          );
          oCtx.closePath();
          oCtx.fill();
          oCtx.stroke();

          // Layer 2: Warm Saffron & Vermilion Mid-Flame
          oCtx.fillStyle = '#FFB000';
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(
            -baseW * 0.65 + fWave2,
            -baseH * 0.3,
            -baseW * 0.45,
            -baseH * 0.72,
            fWave2 * 0.4,
            -baseH * 0.86
          );
          oCtx.bezierCurveTo(
            baseW * 0.45,
            -baseH * 0.72,
            baseW * 0.65 + fWave2,
            -baseH * 0.3,
            0,
            0
          );
          oCtx.closePath();
          oCtx.fill();

          // Layer 3: Warm Ivory Core
          oCtx.fillStyle = '#FFF1D6';
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-baseW * 0.35, -baseH * 0.25, -baseW * 0.25, -baseH * 0.5, 0, -baseH * 0.65);
          oCtx.bezierCurveTo(baseW * 0.25, -baseH * 0.5, baseW * 0.35, -baseH * 0.25, 0, 0);
          oCtx.closePath();
          oCtx.fill();

          // Layer 4: Sapphire Blue Flame Base around Wick
          const blueGrad = oCtx.createRadialGradient(0, -6, 2, 0, -6, 22 * progress);
          blueGrad.addColorStop(0, 'rgba(52, 120, 246, 0.95)');
          blueGrad.addColorStop(0.6, 'rgba(32, 201, 195, 0.85)');
          blueGrad.addColorStop(1, 'rgba(32, 201, 195, 0)');
          oCtx.fillStyle = blueGrad;
          oCtx.beginPath();
          oCtx.ellipse(0, -4, 16 * progress, 10 * progress, 0, 0, Math.PI * 2);
          oCtx.fill();

          oCtx.restore();
        }

        // 3. Render Floating Luminous Sparks & Embers
        for (let e = floatingEmbers.length - 1; e >= 0; e--) {
          const emb = floatingEmbers[e];
          emb.x += emb.vx;
          emb.y += emb.vy;
          emb.life++;
          emb.alpha = Math.max(0, 1 - emb.life / emb.maxLife);

          if (emb.life >= emb.maxLife) {
            floatingEmbers.splice(e, 1);
            continue;
          }

          oCtx.save();
          oCtx.globalAlpha = emb.alpha;
          oCtx.fillStyle = emb.color;
          oCtx.shadowColor = emb.color;
          oCtx.shadowBlur = 10;
          oCtx.beginPath();
          oCtx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          oCtx.fill();
          oCtx.restore();
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      window.clearInterval(bgFireworkInterval);
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('click', handleContainerClick);

      renderer.dispose();
      doorTex.dispose();
      floorTex.dispose();
      clayTex.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onUnlocked]);

  const handleFastSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playRevealCelebration();
    onUnlocked();
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#130722] via-[#240F38] to-[#0D0518] select-none touch-none z-50">
      {/* 1. Indian Miniature-Painting Palace Pavilion Silhouettes in Celestial Twilight */}
      <div className="absolute top-0 left-0 right-0 h-[65vh] pointer-events-none z-0 overflow-hidden opacity-90">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMin slice" className="w-full h-full">
          <defs>
            <linearGradient id="palaceSandstoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF1D6" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FFD180" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#B34A26" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="festiveGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8F00" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
            <filter id="folkGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Intricate Rajasthani Haveli Chhatris & Scalloped Jharokhas */}
          <g fill="url(#palaceSandstoneGrad)" stroke="#FFB000" strokeWidth="2.5">
            {/* Left Chhatris & Multi-foil Arches */}
            <path d="M0,600 L0,230 L75,230 L75,175 Q115,115 150,175 L150,230 L220,230 L220,150 Q260,80 300,150 L300,230 L380,230 L380,600 Z" />
            {/* Right Chhatris & Multi-foil Arches */}
            <path d="M1200,600 L1200,230 L1125,230 L1125,175 Q1085,115 1050,175 L1050,230 L980,230 L980,150 Q940,80 900,150 L900,230 L820,230 L820,600 Z" />
            {/* Royal Central Pavilion & Onion Dome (Gumbad) */}
            <path d="M400,600 L400,250 L460,250 L460,190 C460,120 530,40 600,20 C670,40 740,120 740,190 L740,250 L800,250 L800,600 Z" />
          </g>

          {/* Gold Kalash Finials with Radiance */}
          <g fill="#FFB000" filter="url(#folkGoldGlow)">
            <polygon points="595,20 600,-8 605,20" />
            <polygon points="146,115 150,88 154,115" />
            <polygon points="296,80 300,52 304,80" />
            <polygon points="1046,115 1050,88 1054,115" />
            <polygon points="896,80 900,52 904,80" />
          </g>

          {/* Illuminated Jharokha Windows with Warm Golden Lantern Light */}
          <g fill="#FFB000">
            <rect x="138" y="195" width="24" height="42" rx="12" stroke="#FFF1D6" strokeWidth="2.5" />
            <rect x="288" y="170" width="24" height="45" rx="12" stroke="#FFF1D6" strokeWidth="2.5" />
            <rect x="1038" y="195" width="24" height="42" rx="12" stroke="#FFF1D6" strokeWidth="2.5" />
            <rect x="888" y="170" width="24" height="45" rx="12" stroke="#FFF1D6" strokeWidth="2.5" />
            {/* Center Royal Arched Balconies */}
            <rect x="525" y="200" width="30" height="52" rx="15" stroke="#FFF1D6" strokeWidth="3" />
            <rect x="645" y="200" width="30" height="52" rx="15" stroke="#FFF1D6" strokeWidth="3" />
            <rect x="585" y="115" width="30" height="54" rx="15" fill="#FF5722" stroke="#FFF1D6" strokeWidth="3" />
          </g>

          {/* Festive Draped Marigold Garlands on Palace Cornice */}
          <path d="M460,250 Q530,278 600,250 Q670,278 740,250" fill="none" stroke="#FF5722" strokeWidth="6" strokeDasharray="10,6" />
        </svg>
      </div>

      {/* 2. Atmospheric Festive Lighting Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[900px] h-[600px] bg-[#FFB000]/22 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[700px] h-[700px] bg-[#E91E63]/22 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 3. 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-pointer w-full h-full z-10"
        title="Touch or click to interact with the Indian Haveli Gateway"
      />

      {/* 4. High-DPI 2D Canvas Overlay (Organic Flame & Sparks) */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full z-20"
      />

      {/* 5. Divine Radiance Burst upon Diya Ignition */}
      {impactBurst.active && (
        <div
          className="absolute pointer-events-none z-30 animate-divine-burst"
          style={{
            left: `${impactBurst.x}px`,
            top: `${impactBurst.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-48 h-48 sm:w-80 sm:h-80 rounded-full bg-radial from-[#FFF1D6] via-[#FFB000] to-transparent blur-md" />
        </div>
      )}

      {/* 6. Sacred Light Expansion Flash */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FFF1D6] via-[#FFB000] to-[#E91E63] pointer-events-none transition-opacity duration-350 z-50"
        style={{ opacity: flashOpacity }}
      />

      {/* 7. Top Title Bar & Quick Skip */}
      <div className="absolute top-4 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB000] animate-pulse shrink-0" />
          <h1 className="text-[11px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] font-serif text-[#FFB000] drop-shadow-[0_0_14px_rgba(255,176,0,0.85)] font-bold truncate">
            THE LIGHT WITHIN
          </h1>
        </div>

        <button
          onClick={handleFastSkip}
          className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#130722]/90 border border-[#FFB000]/50 text-[11px] sm:text-xs font-semibold text-[#FFF1D6] hover:text-[#FFB000] hover:border-[#FFB000] transition-all cursor-pointer shadow-md backdrop-blur-md shrink-0"
          title="Skip intro journey straight to celebration"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5 text-[#FFB000]" />
        </button>
      </div>

      {/* 8. Bottom Progress Journey & Instruction Banner */}
      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-30 px-3 text-center">
        {(phase === 'courtyard_walk' || phase === 'at_diya') && (
          <div className="w-44 sm:w-72 h-2.5 bg-black/40 rounded-full overflow-hidden border border-[#FFB000]/30 mb-2.5 backdrop-blur-sm shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] transition-all duration-150 rounded-full"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        )}

        <div className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-full bg-[#0E0616]/92 border-2 border-[#FFB000]/60 backdrop-blur-md shadow-[0_0_35px_rgba(255,176,0,0.35)] flex items-center justify-center gap-2.5 max-w-[92vw]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFB000] shadow-[0_0_12px_#FF5722] animate-pulse shrink-0" />
          <p className="text-[11px] sm:text-sm font-semibold tracking-wide text-[#FFF1D6] font-sans truncate">
            {instructionText}
          </p>
        </div>

        {phase === 'courtyard_walk' && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#20C9C3] mt-2.5 tracking-widest uppercase font-semibold drop-shadow-sm animate-bounce">
            <ArrowDown className="w-3.5 h-3.5 text-[#FFB000]" />
            <span>Scroll or drag down to walk forward</span>
          </div>
        )}
      </div>
    </div>
  );
};

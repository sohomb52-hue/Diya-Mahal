import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../utils/audio';
import { FastForward, ArrowDown, Sparkles } from 'lucide-react';
import {
  createHaveliGatePortalCanvas,
  createHaveliDoorPanelCanvas,
  createCourtyardMuralWallCanvas,
  createPalaceBackdropCanvas,
  createCourtyardFloorCanvas,
  createTerracottaDiyaCanvas,
  MADHUBANI_PALETTE,
} from './3d/folkArtTextures';
import madhubaniCastleImg from '../assets/images/madhubani_palace_castle_1793991171920.jpg';
import madhubaniCityImg from '../assets/images/madhubani_city_painting_1794029794946.jpg';

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

/* User-Specified Authentic Madhubani Palette Hex for 3D Particles */
const MADHUBANI_PALETTE_HEX = [
  0xA82420, // Deep Vermilion Red
  0xC65D38, // Terracotta
  0xE8B947, // Mustard Yellow
  0xD99A32, // Natural Turmeric
  0x47764B, // Leaf Green
  0x236C79, // Peacock Blue
  0xF4E6C8, // Ivory Parchment
];

/* =========================================================================
   MAIN OPENING DIYA SCREEN COMPONENT (MADHUBANI FOLK-ART ART DIRECTION)
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

    // 1. Three.js Scene Setup (Atmospheric Warm Ivory Parchment Mist)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF4E6C8, 0.012);

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
    renderer.toneMappingExposure = 1.6;
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

    // 2. Artistic Lighting Rig in Warm Madhubani Earth & Sun Tones
    const ambientLight = new THREE.AmbientLight(0xE8B947, 2.3);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xF4E6C8, 2.5);
    sunKeyLight.position.set(5, 12, 7);
    if (!isSoftwareGl) {
      sunKeyLight.castShadow = true;
      sunKeyLight.shadow.mapSize.width = 1024;
      sunKeyLight.shadow.mapSize.height = 1024;
      sunKeyLight.shadow.bias = -0.0004;
      sunKeyLight.shadow.normalBias = 0.02;
    }
    scene.add(sunKeyLight);

    const vermilionRimLight = new THREE.DirectionalLight(0xA82420, 1.8);
    vermilionRimLight.position.set(-6, 6, -4);
    scene.add(vermilionRimLight);

    const peacockFillLight = new THREE.DirectionalLight(0x236C79, 1.3);
    peacockFillLight.position.set(0, 3, 14);
    scene.add(peacockFillLight);

    // Sacred Flame Point Lights (Warm Diya Illumination in Natural Turmeric & Mustard)
    const flamePointLight = new THREE.PointLight(0xD99A32, 0, 18, 1.8);
    flamePointLight.position.set(0, 1.15, -2.1);
    scene.add(flamePointLight);

    const flameGlowLight = new THREE.PointLight(0xE8B947, 0, 14, 1.6);
    flameGlowLight.position.set(0, 1.5, -2.1);
    scene.add(flameGlowLight);

    // 3. CELESTIAL STARRY PARCHMENT PARTICLES
    const starCount = isSoftwareGl ? 120 : 280;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 1] = Math.random() * 20 - 2;
      starPositions[i * 3 + 2] = -12 - Math.random() * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xE8B947,
      size: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 4. DISTANT CELEBRATORY FIREWORKS IN FOLK PIGMENT TONES
    const bgFireworksParticles: BgFireworkParticle[] = [];
    const spawnBgFirework = (x: number, y: number, z: number) => {
      const colorHex = MADHUBANI_PALETTE_HEX[Math.floor(Math.random() * MADHUBANI_PALETTE_HEX.length)];
      const count = isSoftwareGl ? 22 : 40;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        const speed = Math.random() * 3.0 + 1.2;

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
      color: 0xE8B947, // Mustard / Antique Brass
      roughness: 0.25,
      metalness: 0.85,
    });

    // 5. HIGH RESOLUTION PROCEDURAL TEXTURES (AUTHENTIC MADHUBANI)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // Portal Archway with Kalash, Peacocks & Floral Creepers
    const portalCanvas = createHaveliGatePortalCanvas();
    const portalTex = new THREE.CanvasTexture(portalCanvas);
    portalTex.colorSpace = THREE.SRGBColorSpace;
    portalTex.anisotropy = maxAnisotropy;

    // Left Door Panel (Madhubani Surya & Mayura)
    const leftDoorCanvas = createHaveliDoorPanelCanvas('left');
    const leftDoorTex = new THREE.CanvasTexture(leftDoorCanvas);
    leftDoorTex.colorSpace = THREE.SRGBColorSpace;
    leftDoorTex.anisotropy = maxAnisotropy;

    // Right Door Panel (Madhubani Gaja & Sahasrara Kamal)
    const rightDoorCanvas = createHaveliDoorPanelCanvas('right');
    const rightDoorTex = new THREE.CanvasTexture(rightDoorCanvas);
    rightDoorTex.colorSpace = THREE.SRGBColorSpace;
    rightDoorTex.anisotropy = maxAnisotropy;

    // Flanking 2.5D Courtyard Mural Walls (Village Houses, Tree of Life, Peacocks, Lit Jharokhas)
    const wallCanvas = createCourtyardMuralWallCanvas();
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    wallTex.anisotropy = maxAnisotropy;
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;

    // Deep Horizon Indian Madhubani City Painting Panorama
    const texLoader = new THREE.TextureLoader();
    const backdropTex = texLoader.load(madhubaniCityImg);
    backdropTex.colorSpace = THREE.SRGBColorSpace;
    backdropTex.anisotropy = maxAnisotropy;

    // Courtyard Floor with 16-Petal Lotus Aripana / Mandala
    const floorCanvas = createCourtyardFloorCanvas();
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.anisotropy = maxAnisotropy;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;

    // Handcrafted Terracotta Diya with Double-Line Ink & Alpana Trim
    const clayCanvas = createTerracottaDiyaCanvas();
    const clayTex = new THREE.CanvasTexture(clayCanvas);
    clayTex.colorSpace = THREE.SRGBColorSpace;
    clayTex.anisotropy = maxAnisotropy;

    // 6. TRADITIONAL INDIAN HAVELI GATE ARCHITECTURE (MADHUBANI PAINTED)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 3.4);
    scene.add(gateGroup);

    const leftDoorMat = new THREE.MeshStandardMaterial({
      map: leftDoorTex,
      roughness: 0.42,
      metalness: 0.1,
    });

    const rightDoorMat = new THREE.MeshStandardMaterial({
      map: rightDoorTex,
      roughness: 0.42,
      metalness: 0.1,
    });

    const sandstoneArchMat = new THREE.MeshStandardMaterial({
      map: portalTex,
      roughness: 0.58,
      metalness: 0.05,
    });

    // Flanking Pillars
    const pillarGeo = new THREE.BoxGeometry(0.85, 5.4, 0.85);
    const leftFramePillar = new THREE.Mesh(pillarGeo, sandstoneArchMat);
    leftFramePillar.position.set(-2.65, 2.7, 0);
    gateGroup.add(leftFramePillar);

    const rightFramePillar = new THREE.Mesh(pillarGeo, sandstoneArchMat);
    rightFramePillar.position.set(2.65, 2.7, 0);
    gateGroup.add(rightFramePillar);

    // Pillar Base Plinths
    const plinthGeo = new THREE.BoxGeometry(1.15, 0.5, 1.15);
    const leftPlinth = new THREE.Mesh(plinthGeo, sandstoneArchMat);
    leftPlinth.position.set(-2.65, 0.25, 0);
    gateGroup.add(leftPlinth);

    const rightPlinth = new THREE.Mesh(plinthGeo, sandstoneArchMat);
    rightPlinth.position.set(2.65, 0.25, 0);
    gateGroup.add(rightPlinth);

    // Lintel Beam
    const archTopBeamGeo = new THREE.BoxGeometry(6.4, 0.85, 1.1);
    const archTopBeam = new THREE.Mesh(archTopBeamGeo, sandstoneArchMat);
    archTopBeam.position.set(0, 5.3, 0.05);
    gateGroup.add(archTopBeam);

    // Brass Arch Medallion
    const archOrnamentGeo = new THREE.TorusGeometry(2.25, 0.24, 16, 48, Math.PI);
    const archOrnament = new THREE.Mesh(archOrnamentGeo, brassMat);
    archOrnament.position.set(0, 4.3, 0.12);
    gateGroup.add(archOrnament);

    // Swaying Brass Temple Bells (Ghantis)
    const bellObjects: Array<{ mesh: THREE.Group; phase: number; baseRotZ: number }> = [];
    const bellPositions = [-1.9, -1.0, 0, 1.0, 1.9];
    bellPositions.forEach((bx, idx) => {
      const singleBellGroup = new THREE.Group();
      singleBellGroup.position.set(bx, 4.75, 0.45);

      const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8);
      const chainMesh = new THREE.Mesh(chainGeo, brassMat);
      chainMesh.position.y = -0.22;
      singleBellGroup.add(chainMesh);

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
      const leafGeo = new THREE.ConeGeometry(0.07, 0.28, 6);
      leafGeo.rotateX(Math.PI);
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x47764B, // Madhubani Leaf Green
        roughness: 0.6,
      });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.copy(pt);
      leafMesh.position.y -= 0.12;
      toranGroup.add(leafMesh);

      const isOrange = i % 2 === 0;
      const flowerMat = new THREE.MeshStandardMaterial({
        color: isOrange ? 0xA82420 : 0xE8B947, // Vermilion & Mustard
        roughness: 0.7,
      });
      const fGeo = new THREE.DodecahedronGeometry(0.13, 1);
      const fMesh = new THREE.Mesh(fGeo, flowerMat);
      fMesh.position.copy(pt);
      toranGroup.add(fMesh);
    });
    gateGroup.add(toranGroup);

    // Flanking Carved Stone Niches with Hanging Brass Lanterns
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 12);
    const lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xE8B947 });
    const leftLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    leftLantern.position.set(-2.65, 3.2, 0.58);
    gateGroup.add(leftLantern);

    const rightLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    rightLantern.position.set(2.65, 3.2, 0.58);
    gateGroup.add(rightLantern);

    const leftLanternLight = new THREE.PointLight(0xE8B947, 2.5, 6);
    leftLanternLight.position.set(-2.65, 3.2, 0.65);
    gateGroup.add(leftLanternLight);

    const rightLanternLight = new THREE.PointLight(0xE8B947, 2.5, 6);
    rightLanternLight.position.set(2.65, 3.2, 0.65);
    gateGroup.add(rightLanternLight);

    // 3D DOUBLE DOORS WITH AUTHENTIC MADHUBANI ARTWORK
    const doorWidth = 2.18;
    const doorHeight = 4.85;

    const leftDoorPivot = new THREE.Group();
    leftDoorPivot.position.set(-2.22, 0, 0);
    gateGroup.add(leftDoorPivot);

    const doorPanelGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.18);
    const leftDoorMesh = new THREE.Mesh(doorPanelGeo, leftDoorMat);
    leftDoorMesh.position.set(doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      leftDoorMesh.castShadow = true;
      leftDoorMesh.receiveShadow = true;
    }
    leftDoorPivot.add(leftDoorMesh);

    // 3D Pyramid Brass Studs (Gul-Meekh) along Left Door
    const studGeo = new THREE.ConeGeometry(0.048, 0.055, 4);
    studGeo.rotateX(Math.PI / 2);
    const studOffsetsX = [-0.85, -0.4, 0.4, 0.85];
    const studOffsetsY = [-2.0, -1.0, 0.0, 1.0, 2.0];
    studOffsetsX.forEach((sox) => {
      studOffsetsY.forEach((soy) => {
        const stud = new THREE.Mesh(studGeo, brassMat);
        stud.position.set(sox, soy, 0.1);
        leftDoorMesh.add(stud);
      });
    });

    // Lion-Head Knocker Medallion Backplate & Ring (Left Door)
    const backplateGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8);
    backplateGeo.rotateX(Math.PI / 2);
    const leftBackplate = new THREE.Mesh(backplateGeo, brassMat);
    leftBackplate.position.set(doorWidth - 0.38, 0, 0.1);
    leftDoorMesh.add(leftBackplate);

    const handleRingGeo = new THREE.TorusGeometry(0.22, 0.045, 12, 24);
    const leftHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    leftHandleRing.position.set(doorWidth - 0.38, 0, 0.14);
    leftDoorMesh.add(leftHandleRing);

    const rightDoorPivot = new THREE.Group();
    rightDoorPivot.position.set(2.22, 0, 0);
    gateGroup.add(rightDoorPivot);

    const rightDoorMesh = new THREE.Mesh(doorPanelGeo, rightDoorMat);
    rightDoorMesh.position.set(-doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      rightDoorMesh.castShadow = true;
      rightDoorMesh.receiveShadow = true;
    }
    rightDoorPivot.add(rightDoorMesh);

    // 3D Pyramid Brass Studs (Gul-Meekh) along Right Door
    studOffsetsX.forEach((sox) => {
      studOffsetsY.forEach((soy) => {
        const stud = new THREE.Mesh(studGeo, brassMat);
        stud.position.set(sox, soy, 0.1);
        rightDoorMesh.add(stud);
      });
    });

    // Lion-Head Knocker Medallion Backplate & Ring (Right Door)
    const rightBackplate = new THREE.Mesh(backplateGeo, brassMat);
    rightBackplate.position.set(-doorWidth + 0.38, 0, 0.1);
    rightDoorMesh.add(rightBackplate);

    const rightHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    rightHandleRing.position.set(-doorWidth + 0.38, 0, 0.14);
    rightDoorMesh.add(rightHandleRing);

    // 7. THE COURTYARD ENVIRONMENT (A LIVING MADHUBANI PAINTING)
    const courtyardGroup = new THREE.Group();
    scene.add(courtyardGroup);

    // Polished Courtyard Terrace Floor with 16-Petal Lotus Aripana
    const floorGeo = new THREE.PlaneGeometry(18, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.42,
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -8);
    if (!isSoftwareGl) floorMesh.receiveShadow = true;
    courtyardGroup.add(floorMesh);

    // Flanking 2.5D Courtyard Mural Walls
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const leftWallGeo = new THREE.PlaneGeometry(38, 8.5);
    const leftWallMesh = new THREE.Mesh(leftWallGeo, wallMat);
    leftWallMesh.position.set(-5.4, 4.0, 3.5);
    leftWallMesh.rotation.y = Math.PI / 2;
    courtyardGroup.add(leftWallMesh);

    const rightWallMesh = new THREE.Mesh(leftWallGeo, wallMat);
    rightWallMesh.position.set(5.4, 4.0, 3.5);
    rightWallMesh.rotation.y = -Math.PI / 2;
    courtyardGroup.add(rightWallMesh);

    // Deep Horizon Indian Village & Miniature Panorama
    const backdropMat = new THREE.MeshBasicMaterial({
      map: backdropTex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const backdropGeo = new THREE.PlaneGeometry(38, 16);
    const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
    backdropMesh.position.set(0, 7.5, -19.5);
    courtyardGroup.add(backdropMesh);

    // Terracotta Colonnade Pillars with Scalloped Arches
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xC65D38, // Terracotta
      roughness: 0.6,
      metalness: 0.05,
    });
    const courtyardPillarGeo = new THREE.CylinderGeometry(0.38, 0.48, 4.6, 16);
    const pathwayDiyasLights: THREE.PointLight[] = [];

    for (let z = 18; z >= -6; z -= 5) {
      const pLeft = new THREE.Mesh(courtyardPillarGeo, pillarMat);
      pLeft.position.set(-4.2, 2.3, z);
      courtyardGroup.add(pLeft);

      const pRight = new THREE.Mesh(courtyardPillarGeo, pillarMat);
      pRight.position.set(4.2, 2.3, z);
      courtyardGroup.add(pRight);

      // Pathway Terracotta Diyas
      for (const side of [-1, 1]) {
        const pDiyaGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.12, 16);
        const pDiyaMat = new THREE.MeshStandardMaterial({
          color: 0xC65D38,
          roughness: 0.6,
        });
        const pDiyaMesh = new THREE.Mesh(pDiyaGeo, pDiyaMat);
        pDiyaMesh.position.set(side * 2.8, 0.06, z);
        courtyardGroup.add(pDiyaMesh);

        // Flame on each pathway diya
        const pFlameGeo = new THREE.ConeGeometry(0.06, 0.22, 10);
        const pFlameMat = new THREE.MeshBasicMaterial({ color: 0xE8B947 });
        const pFlameMesh = new THREE.Mesh(pFlameGeo, pFlameMat);
        pFlameMesh.position.set(side * 2.8, 0.22, z);
        courtyardGroup.add(pFlameMesh);

        const pLight = new THREE.PointLight(0xE8B947, 0.8, 4.5);
        pLight.position.set(side * 2.8, 0.32, z);
        courtyardGroup.add(pLight);
        pathwayDiyasLights.push(pLight);
      }
    }

    // 8. THE SACRED HERO DIYA (HANDCRAFTED MADHUBANI TERRACOTTA)
    const centralDiyaGroup = new THREE.Group();
    centralDiyaGroup.position.set(0, 0.22, -2.4);
    centralDiyaGroup.scale.set(0.72, 0.72, 0.72);
    courtyardGroup.add(centralDiyaGroup);

    // Carved Terracotta & Brass Thali Base Platform
    const platformGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.25, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.45,
      metalness: 0.15,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.12;
    if (!isSoftwareGl) platformMesh.receiveShadow = true;
    centralDiyaGroup.add(platformMesh);

    // Handcrafted Terracotta Diya Material
    const terracottaMat = new THREE.MeshStandardMaterial({
      map: clayTex,
      roughness: 0.52,
      metalness: 0.06,
      color: 0xC65D38,
    });

    // Handcrafted Asymmetrical Terracotta Diya Bowl
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

    // Pouring Spout for Cotton Wick
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
      color: 0x211A17, // Madhubani Ink Black
      roughness: 0.96,
      metalness: 0.02,
    });
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    centralDiyaGroup.add(wickMesh);

    // Golden Mustard Ghee Reservoir inside Diya
    const gheeGeo = new THREE.CylinderGeometry(1.2, 0.8, 0.1, 32);
    const gheeMat = new THREE.MeshStandardMaterial({
      color: 0xE8B947,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const gheeMesh = new THREE.Mesh(gheeGeo, gheeMat);
    gheeMesh.position.set(0, 0.68, 0.4);
    centralDiyaGroup.add(gheeMesh);

    const wickTipNode = new THREE.Object3D();
    wickTipNode.position.set(0, 1.22, 1.66);
    centralDiyaGroup.add(wickTipNode);

    // 9. FLOATING MARIGOLD & LOTUS PETALS IN MADHUBANI PIGMENTS
    const petalCount = isSoftwareGl ? 20 : 45;
    const floatingPetalsGroup = new THREE.Group();
    scene.add(floatingPetalsGroup);

    const singlePetalGeo = new THREE.SphereGeometry(0.1, 14, 10);
    singlePetalGeo.scale(1.2, 0.22, 1.8);
    const petalColors = [0xA82420, 0xE8B947, 0xD99A32, 0x47764B, 0x236C79];
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
        metalness: 0.08,
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

    // 10. SACRED FLAME EMBERS (2D Canvas Overlay)
    const floatingEmbers: FloatingEmber[] = [];
    const spawnEmber = (originX: number, originY: number) => {
      const colors = ['#F4E6C8', '#E8B947', '#D99A32', '#A82420', '#C65D38'];
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

      leftHandleRing.rotation.z = Math.PI * 0.45;
      rightHandleRing.rotation.z = -Math.PI * 0.45;

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
            ambientLight.color.setHSL(0.12, 0.85, 0.45 + p * 0.25);

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
          light.intensity = 0.8 + sp * 1.8;
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
      // 2D HIGH-DPI CANVAS OVERLAY: MADHUBANI INK BORDERS, BIRDS & FLAME
      // =========================================================================
      if (oCtx) {
        oCtx.clearRect(0, 0, width, height);

        // 1. Dynamic Animated Madhubani Scroll-Drawn Borders
        const spProg = stateRef.current.scrollProgress;
        if (spProg > 0.05) {
          oCtx.save();
          const borderProgress = Math.min(spProg * 1.25, 1);
          const maxBorderW = Math.min(width * 0.35, 260) * borderProgress;

          // Top-Left Madhubani Corner Vine
          oCtx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
          oCtx.lineWidth = 3;
          oCtx.beginPath();
          oCtx.moveTo(0, 16);
          oCtx.lineTo(maxBorderW, 16);
          oCtx.stroke();

          oCtx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
          oCtx.lineWidth = 2;
          oCtx.beginPath();
          oCtx.moveTo(0, 24);
          oCtx.lineTo(maxBorderW * 0.9, 24);
          oCtx.stroke();

          // Sprouting Lotus Buds along border
          for (let lx = 30; lx < maxBorderW; lx += 36) {
            oCtx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
            oCtx.beginPath();
            oCtx.ellipse(lx, 20, 6, 4, 0, 0, Math.PI * 2);
            oCtx.fill();
            oCtx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
            oCtx.lineWidth = 1.5;
            oCtx.stroke();
          }

          // Top-Right Corner Vine
          oCtx.beginPath();
          oCtx.moveTo(width, 16);
          oCtx.lineTo(width - maxBorderW, 16);
          oCtx.stroke();

          oCtx.strokeStyle = MADHUBANI_PALETTE.vermilionRed;
          oCtx.beginPath();
          oCtx.moveTo(width, 24);
          oCtx.lineTo(width - maxBorderW * 0.9, 24);
          oCtx.stroke();

          for (let rx = width - 30; rx > width - maxBorderW; rx -= 36) {
            oCtx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
            oCtx.beginPath();
            oCtx.ellipse(rx, 20, 6, 4, 0, 0, Math.PI * 2);
            oCtx.fill();
            oCtx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
            oCtx.lineWidth = 1.5;
            oCtx.stroke();
          }
          oCtx.restore();
        }

        // 2. Subtle Hand-Drawn Madhubani Bird (Suga) Gliding Gently across Sky
        oCtx.save();
        const birdX = (width * 0.2 + (time * 24)) % (width + 120) - 60;
        const birdY = height * 0.18 + Math.sin(time * 1.5) * 14;
        oCtx.translate(birdX, birdY);
        oCtx.fillStyle = MADHUBANI_PALETTE.peacockBlue;
        oCtx.beginPath();
        oCtx.moveTo(0, 0);
        oCtx.quadraticCurveTo(16, -22, 34, -18);
        oCtx.quadraticCurveTo(20, -8, 8, -2);
        oCtx.quadraticCurveTo(16, 22, 34, 18);
        oCtx.quadraticCurveTo(16, 8, 0, 0);
        oCtx.fill();
        oCtx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
        oCtx.lineWidth = 2;
        oCtx.stroke();
        oCtx.restore();

        // 3. Golden Sacred Spark Flight
        const sp = stateRef.current.sparkProgress;
        if (sp >= 0 && sp <= 1) {
          const { startX, startY, targetX, targetY } = stateRef.current.sparkCoords;
          const currX = THREE.MathUtils.lerp(startX, targetX, sp);
          const currY = THREE.MathUtils.lerp(startY, targetY, sp);

          oCtx.save();
          oCtx.strokeStyle = MADHUBANI_PALETTE.mustardYellow;
          oCtx.lineWidth = 4;
          oCtx.shadowColor = MADHUBANI_PALETTE.vermilionRed;
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
          oCtx.fillStyle = MADHUBANI_PALETTE.ivoryParchment;
          oCtx.font = '26px sans-serif';
          oCtx.textAlign = 'center';
          oCtx.textBaseline = 'middle';
          oCtx.fillText('✦', currX, currY);
          oCtx.restore();
        }

        // 4. Beautiful Organic 2D Diya Flame Animation in Madhubani Colors
        if (stateRef.current.isLit && stateRef.current.wickScreenPos.visible) {
          const wx = stateRef.current.wickScreenPos.x;
          const wy = stateRef.current.wickScreenPos.y;
          const progress = stateRef.current.lightingProgress;

          // Progressive Warm Radiant Illumination spreading across surrounding painting
          oCtx.save();
          const spreadGrad = oCtx.createRadialGradient(wx, wy, 20, wx, wy, Math.max(width, height) * 0.85);
          spreadGrad.addColorStop(0, `rgba(232, 185, 71, ${0.45 * progress})`);
          spreadGrad.addColorStop(0.35, `rgba(217, 154, 50, ${0.28 * progress})`);
          spreadGrad.addColorStop(0.7, `rgba(168, 36, 32, ${0.12 * progress})`);
          spreadGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          oCtx.fillStyle = spreadGrad;
          oCtx.fillRect(0, 0, width, height);
          oCtx.restore();

          // Spawn floating firefly embers
          if (Math.random() < 0.35) {
            spawnEmber(wx, wy - 30);
          }

          // Smooth multi-frequency harmonic flame flicker
          const fWave1 = Math.sin(time * 7.5) * 4.5;
          const fWave2 = Math.cos(time * 11.2) * 3.0;
          const fHeightMod = Math.sin(time * 5.0) * 6.0;

          const baseW = 32 * progress;
          const baseH = (92 + fHeightMod) * progress;

          oCtx.save();
          oCtx.translate(wx, wy);

          // Outer Radiant Divine Halo
          const haloGrad = oCtx.createRadialGradient(0, -baseH * 0.45, 10, 0, -baseH * 0.45, baseH * 1.6);
          haloGrad.addColorStop(0, 'rgba(232, 185, 71, 0.55)');
          haloGrad.addColorStop(0.5, 'rgba(168, 36, 32, 0.3)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          oCtx.fillStyle = haloGrad;
          oCtx.beginPath();
          oCtx.arc(0, -baseH * 0.45, baseH * 1.6, 0, Math.PI * 2);
          oCtx.fill();

          // Layer 1: Madhubani Deep Vermilion Outer Flame Envelope with Fine Ink Stroke
          oCtx.fillStyle = MADHUBANI_PALETTE.vermilionRed;
          oCtx.strokeStyle = MADHUBANI_PALETTE.inkBlack;
          oCtx.lineWidth = 3;
          oCtx.shadowColor = MADHUBANI_PALETTE.naturalTurmeric;
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

          // Layer 2: Mustard Yellow & Turmeric Mid-Flame
          oCtx.fillStyle = MADHUBANI_PALETTE.mustardYellow;
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
          oCtx.fillStyle = MADHUBANI_PALETTE.ivoryParchment;
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-baseW * 0.35, -baseH * 0.25, -baseW * 0.25, -baseH * 0.5, 0, -baseH * 0.65);
          oCtx.bezierCurveTo(baseW * 0.25, -baseH * 0.5, baseW * 0.35, -baseH * 0.25, 0, 0);
          oCtx.closePath();
          oCtx.fill();

          // Layer 4: Peacock Blue Flame Base around Wick
          const blueGrad = oCtx.createRadialGradient(0, -6, 2, 0, -6, 24 * progress);
          blueGrad.addColorStop(0, 'rgba(35, 108, 121, 0.95)');
          blueGrad.addColorStop(0.6, 'rgba(35, 108, 121, 0.8)');
          blueGrad.addColorStop(1, 'rgba(35, 108, 121, 0)');
          oCtx.fillStyle = blueGrad;
          oCtx.beginPath();
          oCtx.ellipse(0, -4, 18 * progress, 11 * progress, 0, 0, Math.PI * 2);
          oCtx.fill();

          oCtx.restore();
        }

        // 5. Render Floating Luminous Sparks & Embers
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
      portalTex.dispose();
      leftDoorTex.dispose();
      rightDoorTex.dispose();
      wallTex.dispose();
      backdropTex.dispose();
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
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#FAF3E3] via-[#F4E6C8] to-[#EBD5AF] select-none touch-none z-50">
      
      {/* 1. Authentic Masterwork Madhubani Royal Palace Castle with Glowing Lights */}
      <div className="absolute top-0 left-0 right-0 h-[68vh] pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src={madhubaniCityImg}
            alt="Royal Madhubani City Painting Illuminated with Lights for Diwali"
            className="w-full h-full object-cover object-top opacity-95 filter contrast-[1.04] brightness-105"
          />
          {/* Subtle bottom fade into parchment ground so it integrates seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F4E6C8]" />

          {/* Animated Festive Lights & Glowing Diyas on the Castle */}
          <div className="absolute top-[32%] left-[26%] w-3 h-3 rounded-full bg-[#E8B947] shadow-[0_0_12px_#E8B947] animate-pulse" />
          <div className="absolute top-[36%] left-[48%] w-3.5 h-3.5 rounded-full bg-[#E8B947] shadow-[0_0_15px_#E8B947] animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[32%] left-[74%] w-3 h-3 rounded-full bg-[#E8B947] shadow-[0_0_12px_#E8B947] animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-[50%] left-[34%] w-2.5 h-2.5 rounded-full bg-[#D99A32] shadow-[0_0_10px_#D99A32] animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-[50%] left-[66%] w-2.5 h-2.5 rounded-full bg-[#D99A32] shadow-[0_0_10px_#D99A32] animate-pulse" style={{ animationDelay: '1.0s' }} />

          {/* Warm Golden Glow accents over palace windows and lanterns */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4/5 h-1/2 bg-gradient-radial from-[#E8B947]/25 via-[#D99A32]/10 to-transparent blur-2xl pointer-events-none animate-pulse" />
        </div>
      </div>

      {/* 2. Warm Earth & Turmeric Ambient Lighting Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[900px] h-[600px] bg-[#E8B947]/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[700px] h-[700px] bg-[#C65D38]/18 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 3. 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-pointer w-full h-full z-10"
        title="Touch or click to interact with the Indian Haveli Gateway"
      />

      {/* 4. High-DPI 2D Canvas Overlay (Organic Flame & Madhubani Art Accents) */}
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
          <div className="w-48 h-48 sm:w-80 sm:h-80 rounded-full bg-radial from-[#F4E6C8] via-[#E8B947] to-transparent blur-md" />
        </div>
      )}

      {/* 6. Sacred Light Expansion Flash */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#F4E6C8] via-[#E8B947] to-[#A82420] pointer-events-none transition-opacity duration-350 z-50"
        style={{ opacity: flashOpacity }}
      />

      {/* 7. Top Title Bar & Ornamental Farman Skip Button */}
      <div className="absolute top-4 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        
        {/* Madhubani Display Heading: HAPPY DIWALI */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#F4E6C8]/90 border-2 border-[#211A17] px-4 py-1.5 sm:px-5 sm:py-2 rounded-2xl shadow-md backdrop-blur-sm">
          <span className="text-base sm:text-xl text-[#A82420]">🪷</span>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg uppercase tracking-[0.2em] font-serif font-black text-[#A82420] leading-none">
              HAPPY DIWALI
            </h1>
            <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-widest text-[#211A17]/80 uppercase mt-0.5">
              Mithila Celebration
            </span>
          </div>
          <span className="text-base sm:text-xl text-[#E8B947]">🪔</span>
        </div>

        {/* Traditional Ornamental Invitation Plaque (Skip Button) */}
        <button
          onClick={handleFastSkip}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[#F4E6C8] border-2 border-[#211A17] text-[11px] sm:text-xs font-serif font-bold text-[#211A17] hover:bg-[#E8B947] hover:text-[#211A17] transition-all cursor-pointer shadow-[2px_2px_0px_#211A17] hover:shadow-[3px_3px_0px_#211A17] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          title="Enter celebration immediately"
        >
          <span>Enter</span>
          <FastForward className="w-3.5 h-3.5 text-[#A82420]" />
        </button>
      </div>

      {/* 8. Bottom Progress Journey & Instruction Banner */}
      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-30 px-3 text-center">
        {(phase === 'courtyard_walk' || phase === 'at_diya') && (
          <div className="w-44 sm:w-72 h-3 bg-[#F4E6C8] rounded-full overflow-hidden border-2 border-[#211A17] mb-2.5 shadow-sm">
            <div
              className="h-full bg-gradient-to-r from-[#A82420] via-[#C65D38] to-[#E8B947] transition-all duration-150 rounded-full"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        )}

        <div className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-2xl bg-[#F4E6C8]/96 border-2 border-[#211A17] shadow-[3px_3px_0px_#211A17] flex items-center justify-center gap-2.5 max-w-[92vw]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A82420] border border-[#211A17] animate-pulse shrink-0" />
          <p className="text-[11px] sm:text-sm font-bold tracking-wide text-[#211A17] font-serif truncate">
            {instructionText}
          </p>
        </div>

        {phase === 'courtyard_walk' && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#236C79] mt-2.5 tracking-widest uppercase font-bold drop-shadow-sm animate-bounce">
            <ArrowDown className="w-3.5 h-3.5 text-[#A82420]" />
            <span>Scroll or drag down to walk forward</span>
          </div>
        )}
      </div>

    </div>
  );
};

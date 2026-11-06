import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../utils/audio';
import { calculateHalftoneDotRadius } from '../utils/gameLogic';
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

const FIREWORK_COLORS = [
  0xff2e88, // Hot Pink
  0xff5722, // Vermilion Orange
  0xffb000, // Marigold
  0x20c9c3, // Turquoise
  0x3478f6, // Electric Blue
  0x2e9d50, // Leaf Green
  0xfff1d6, // Warm Gold
];

export const OpeningDiyaScreen: React.FC<OpeningDiyaScreenProps> = ({ onUnlocked }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'gate' | 'opening_gate' | 'courtyard_walk' | 'at_diya' | 'igniting' | 'emerging'>('gate');
  const [instructionText, setInstructionText] = useState('ENTER THE CELEBRATION — Touch the Gate');
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

    // 1. Three.js Scene Setup (Vibrant Ambient Sky & Courtyard Atmosphere)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0f30, 0.015);

    const aspect = container.clientWidth / container.clientHeight;
    const baseFov = aspect < 1 ? 45 + (1 - aspect) * 26 : 45;

    const camera = new THREE.PerspectiveCamera(baseFov, aspect, 0.1, 100);
    camera.position.set(0, 2.3, 8.8);
    camera.lookAt(0, 2.1, 3.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.75;
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

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x6b3a88, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 3.0);
    keyLight.position.set(6, 12, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff2e88, 2.0);
    rimLight.position.set(-6, 6, -5);
    scene.add(rimLight);

    const courtyardFillLight = new THREE.DirectionalLight(0x20c9c3, 1.4);
    courtyardFillLight.position.set(0, 4, 15);
    scene.add(courtyardFillLight);

    // Flame Point Lights
    const flamePointLight = new THREE.PointLight(0xff5722, 0, 16, 1.8);
    flamePointLight.position.set(0, 1.2, 0.4);
    scene.add(flamePointLight);

    const flameGlowLight = new THREE.PointLight(0xffb000, 0, 12, 1.5);
    flameGlowLight.position.set(0, 1.6, 0.4);
    scene.add(flameGlowLight);

    // 3. STARRY NIGHT SKY BACKGROUND PARTICLES
    const starCount = isSoftwareGl ? 140 : 320;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 35;
      starPositions[i * 3 + 1] = Math.random() * 18 - 2;
      starPositions[i * 3 + 2] = -10 - Math.random() * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfff1d6,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 4. BACKGROUND FIREWORKS SYSTEM
    const bgFireworksParticles: BgFireworkParticle[] = [];
    const spawnBgFirework = (x: number, y: number, z: number) => {
      const colorHex = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const count = isSoftwareGl ? 20 : 38;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        const speed = Math.random() * 3.5 + 1.2;

        bgFireworksParticles.push({
          x,
          y,
          z,
          vx: Math.cos(angle) * Math.cos(phi) * speed,
          vy: Math.sin(phi) * speed,
          vz: Math.sin(angle) * Math.cos(phi) * speed,
          colorHex,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          size: Math.random() * 0.12 + 0.05,
        });
      }
    };

    const bgFireworkInterval = window.setInterval(() => {
      const fx = (Math.random() - 0.5) * 22;
      const fy = Math.random() * 6 + 4;
      const fz = -6 - Math.random() * 12;
      spawnBgFirework(fx, fy, fz);
    }, 1700);

    const bgFireworksGroup = new THREE.Group();
    scene.add(bgFireworksGroup);

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      roughness: 0.15,
      metalness: 0.9,
    });

    // 5. BACKGROUND 3D BRIGHT WHITE & GOLD INDIAN PALACE STRUCTURES
    const castleGroup = new THREE.Group();
    castleGroup.position.set(0, 1.5, -14);
    scene.add(castleGroup);

    // Pure White Rajasthani Marble Material
    const castleMat = new THREE.MeshStandardMaterial({
      color: 0xfff8ee, // Pure White Marble
      roughness: 0.25,
      metalness: 0.15,
    });
    const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });

    // Central Grand White Palace Tower
    const mainTowerGeo = new THREE.CylinderGeometry(2.2, 2.5, 7, 16);
    const mainTower = new THREE.Mesh(mainTowerGeo, castleMat);
    mainTower.position.set(0, 3.5, 0);
    castleGroup.add(mainTower);

    // Central White Onion Dome (Gumbad)
    const domeLathePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(2.2, 0.4),
      new THREE.Vector2(2.6, 1.2),
      new THREE.Vector2(2.1, 2.2),
      new THREE.Vector2(1.2, 3.0),
      new THREE.Vector2(0.3, 3.6),
      new THREE.Vector2(0, 4.0),
    ];
    const domeGeo = new THREE.LatheGeometry(domeLathePoints, 32);
    const mainDome = new THREE.Mesh(domeGeo, castleMat);
    mainDome.position.set(0, 7.0, 0);
    castleGroup.add(mainDome);

    // Gold Kalash Finial
    const kalashGeo = new THREE.ConeGeometry(0.25, 1.2, 12);
    const kalashMesh = new THREE.Mesh(kalashGeo, brassMat);
    kalashMesh.position.set(0, 11.4, 0);
    castleGroup.add(kalashMesh);

    // Illuminated Palace Windows
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const winGeo = new THREE.BoxGeometry(0.35, 0.8, 0.1);
      const winMesh = new THREE.Mesh(winGeo, windowGlowMat);
      winMesh.position.set(Math.cos(angle) * 2.25, 4.2, Math.sin(angle) * 2.25);
      winMesh.rotation.y = -angle;
      castleGroup.add(winMesh);
    }

    // Side White Palace Wings & Chhatris
    for (const side of [-1, 1]) {
      const wingGeo = new THREE.BoxGeometry(5.5, 5.0, 3.0);
      const wingMesh = new THREE.Mesh(wingGeo, castleMat);
      wingMesh.position.set(side * 5.2, 2.5, -0.5);
      castleGroup.add(wingMesh);

      const chhatriDomeGeo = new THREE.ConeGeometry(1.2, 1.8, 16);
      const chhatriDome = new THREE.Mesh(chhatriDomeGeo, castleMat);
      chhatriDome.position.set(side * 6.5, 6.0, -0.5);
      castleGroup.add(chhatriDome);

      const cFinial = new THREE.Mesh(kalashGeo, brassMat);
      cFinial.position.set(side * 6.5, 7.4, -0.5);
      castleGroup.add(cFinial);

      for (let w = 0; w < 3; w++) {
        const jWinGeo = new THREE.BoxGeometry(0.4, 0.9, 0.1);
        const jWinMesh = new THREE.Mesh(jWinGeo, windowGlowMat);
        jWinMesh.position.set(side * (3.5 + w * 1.4), 3.2, 1.05);
        castleGroup.add(jWinMesh);
      }
    }

    // 6. HIGH RESOLUTION PROCEDURAL CANVAS TEXTURES
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // Door Wood Texture
    const doorCanvas = document.createElement('canvas');
    doorCanvas.width = 1024;
    doorCanvas.height = 1024;
    const dCtx = doorCanvas.getContext('2d');
    if (dCtx) {
      dCtx.fillStyle = '#4A1D0D';
      dCtx.fillRect(0, 0, 1024, 1024);

      dCtx.strokeStyle = 'rgba(25, 8, 3, 0.4)';
      dCtx.lineWidth = 2;
      for (let y = 0; y < 1024; y += 4) {
        dCtx.beginPath();
        dCtx.moveTo(0, y);
        dCtx.bezierCurveTo(340, y + Math.sin(y * 0.05) * 15, 680, y - Math.sin(y * 0.03) * 12, 1024, y);
        dCtx.stroke();
      }

      dCtx.strokeStyle = '#FFB000';
      dCtx.lineWidth = 12;
      dCtx.strokeRect(40, 40, 944, 944);

      dCtx.strokeStyle = '#E91E63';
      dCtx.lineWidth = 6;
      dCtx.strokeRect(80, 80, 864, 864);

      const cx = 512;
      const cy = 512;
      dCtx.fillStyle = '#FF5722';
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        dCtx.save();
        dCtx.translate(cx, cy);
        dCtx.rotate(angle);
        dCtx.beginPath();
        dCtx.ellipse(0, 180, 40, 100, 0, 0, Math.PI * 2);
        dCtx.fill();
        dCtx.strokeStyle = '#FFF1D6';
        dCtx.lineWidth = 3;
        dCtx.stroke();
        dCtx.restore();
      }
    }
    const doorTex = new THREE.CanvasTexture(doorCanvas);
    doorTex.colorSpace = THREE.SRGBColorSpace;
    doorTex.anisotropy = maxAnisotropy;

    // Floor Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 2048;
    const fCtx = floorCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#0F1126';
      fCtx.fillRect(0, 0, 1024, 2048);

      fCtx.strokeStyle = 'rgba(255, 241, 214, 0.14)';
      fCtx.lineWidth = 4;
      for (let x = 0; x <= 1024; x += 128) {
        fCtx.beginPath();
        fCtx.moveTo(x, 0);
        fCtx.lineTo(x, 2048);
        fCtx.stroke();
      }
      for (let y = 0; y <= 2048; y += 128) {
        fCtx.beginPath();
        fCtx.moveTo(0, y);
        fCtx.lineTo(1024, y);
        fCtx.stroke();
      }

      const cx = 512;
      for (let y = 200; y < 2048; y += 450) {
        fCtx.save();
        fCtx.translate(cx, y);

        const rings = [
          { r: 180, col: '#E91E63', w: 10 },
          { r: 140, col: '#FFB000', w: 8 },
          { r: 100, col: '#20C9C3', w: 6 },
          { r: 60, col: '#FF5722', w: 5 },
        ];
        rings.forEach((ring) => {
          fCtx.strokeStyle = ring.col;
          fCtx.lineWidth = ring.w;
          fCtx.beginPath();
          fCtx.arc(0, 0, ring.r, 0, Math.PI * 2);
          fCtx.stroke();
        });

        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          fCtx.rotate(a);
          fCtx.fillStyle = i % 2 === 0 ? '#FF2E88' : '#FF8F00';
          fCtx.beginPath();
          fCtx.arc(0, 110, 25, 0, Math.PI * 2);
          fCtx.fill();
        }

        fCtx.restore();
      }
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.anisotropy = maxAnisotropy;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;

    // 7. GATE ARCHITECTURE
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 3.5);
    scene.add(gateGroup);

    const woodMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      roughness: 0.45,
      metalness: 0.15,
    });
    const stoneArchMat = new THREE.MeshStandardMaterial({
      color: 0x2d1738,
      roughness: 0.7,
      metalness: 0.1,
    });

    const pillarGeo = new THREE.BoxGeometry(0.8, 5.2, 0.8);
    const leftFramePillar = new THREE.Mesh(pillarGeo, stoneArchMat);
    leftFramePillar.position.set(-2.6, 2.6, 0);
    gateGroup.add(leftFramePillar);

    const rightFramePillar = new THREE.Mesh(pillarGeo, stoneArchMat);
    rightFramePillar.position.set(2.6, 2.6, 0);
    gateGroup.add(rightFramePillar);

    const archTopBeamGeo = new THREE.BoxGeometry(6.0, 0.8, 0.9);
    const archTopBeam = new THREE.Mesh(archTopBeamGeo, stoneArchMat);
    archTopBeam.position.set(0, 5.2, 0);
    gateGroup.add(archTopBeam);

    const archOrnamentGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 32, Math.PI);
    const archOrnament = new THREE.Mesh(archOrnamentGeo, brassMat);
    archOrnament.position.set(0, 4.2, 0.1);
    gateGroup.add(archOrnament);

    const bellGroup = new THREE.Group();
    for (const bx of [-1.8, -0.9, 0, 0.9, 1.8]) {
      const bellGeo = new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.12, 0.05),
          new THREE.Vector2(0.2, 0.25),
          new THREE.Vector2(0.24, 0.35),
          new THREE.Vector2(0.08, 0.4),
        ],
        16
      );
      const bellMesh = new THREE.Mesh(bellGeo, brassMat);
      bellMesh.position.set(bx, 4.6, 0.4);
      bellGroup.add(bellMesh);
    }
    gateGroup.add(bellGroup);

    const toranGroup = new THREE.Group();
    const toranCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 4.8, 0.45),
      new THREE.Vector3(-1.1, 4.4, 0.45),
      new THREE.Vector3(0, 4.6, 0.45),
      new THREE.Vector3(1.1, 4.4, 0.45),
      new THREE.Vector3(2.2, 4.8, 0.45),
    ]);
    const toranPoints = toranCurve.getPoints(40);
    toranPoints.forEach((pt, i) => {
      const isPink = i % 3 === 0;
      const flowerMat = new THREE.MeshStandardMaterial({
        color: isPink ? 0xe91e63 : 0xffb000,
        roughness: 0.5,
      });
      const fGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const fMesh = new THREE.Mesh(fGeo, flowerMat);
      fMesh.position.copy(pt);
      toranGroup.add(fMesh);
    });
    gateGroup.add(toranGroup);

    const lanternGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12);
    const lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
    const leftLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    leftLantern.position.set(-2.6, 3.2, 0.55);
    gateGroup.add(leftLantern);

    const rightLantern = new THREE.Mesh(lanternGeo, lanternGlassMat);
    rightLantern.position.set(2.6, 3.2, 0.55);
    gateGroup.add(rightLantern);

    const leftLanternLight = new THREE.PointLight(0xffb000, 2.5, 6);
    leftLanternLight.position.set(-2.6, 3.2, 0.6);
    gateGroup.add(leftLanternLight);

    const rightLanternLight = new THREE.PointLight(0xffb000, 2.5, 6);
    rightLanternLight.position.set(2.6, 3.2, 0.6);
    gateGroup.add(rightLanternLight);

    // 3D DOUBLE DOORS
    const doorWidth = 2.15;
    const doorHeight = 4.8;

    const leftDoorPivot = new THREE.Group();
    leftDoorPivot.position.set(-2.2, 0, 0);
    gateGroup.add(leftDoorPivot);

    const doorPanelGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.16);
    const leftDoorMesh = new THREE.Mesh(doorPanelGeo, woodMat);
    leftDoorMesh.position.set(doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      leftDoorMesh.castShadow = true;
      leftDoorMesh.receiveShadow = true;
    }
    leftDoorPivot.add(leftDoorMesh);

    const handleRingGeo = new THREE.TorusGeometry(0.22, 0.04, 12, 24);
    const leftHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    leftHandleRing.position.set(doorWidth - 0.35, doorHeight / 2, 0.12);
    leftDoorMesh.add(leftHandleRing);

    const rightDoorPivot = new THREE.Group();
    rightDoorPivot.position.set(2.2, 0, 0);
    gateGroup.add(rightDoorPivot);

    const rightDoorMesh = new THREE.Mesh(doorPanelGeo, woodMat);
    rightDoorMesh.position.set(-doorWidth / 2, doorHeight / 2, 0);
    if (!isSoftwareGl) {
      rightDoorMesh.castShadow = true;
      rightDoorMesh.receiveShadow = true;
    }
    rightDoorPivot.add(rightDoorMesh);

    const rightHandleRing = new THREE.Mesh(handleRingGeo, brassMat);
    rightHandleRing.position.set(-doorWidth + 0.35, doorHeight / 2, 0.12);
    rightDoorMesh.add(rightHandleRing);

    // 8. COURTYARD ENVIRONMENT
    const courtyardGroup = new THREE.Group();
    scene.add(courtyardGroup);

    const floorGeo = new THREE.PlaneGeometry(16, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.3,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -10);
    if (!isSoftwareGl) floorMesh.receiveShadow = true;
    courtyardGroup.add(floorMesh);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x3a1945,
      roughness: 0.5,
    });
    const pillarShapeGeo = new THREE.CylinderGeometry(0.35, 0.45, 4.5, 16);
    const pathwayDiyasLights: THREE.PointLight[] = [];

    for (let z = 18; z >= -6; z -= 5) {
      const pLeft = new THREE.Mesh(pillarShapeGeo, pillarMat);
      pLeft.position.set(-4.2, 2.25, z);
      courtyardGroup.add(pLeft);

      const pRight = new THREE.Mesh(pillarShapeGeo, pillarMat);
      pRight.position.set(4.2, 2.25, z);
      courtyardGroup.add(pRight);

      for (const side of [-1, 1]) {
        const pDiyaGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.12, 12);
        const pDiyaMat = new THREE.MeshStandardMaterial({ color: 0xbd4b24 });
        const pDiyaMesh = new THREE.Mesh(pDiyaGeo, pDiyaMat);
        pDiyaMesh.position.set(side * 2.8, 0.06, z);
        courtyardGroup.add(pDiyaMesh);

        const pFlameGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
        const pFlameMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
        const pFlameMesh = new THREE.Mesh(pFlameGeo, pFlameMat);
        pFlameMesh.position.set(side * 2.8, 0.2, z);
        courtyardGroup.add(pFlameMesh);

        const pLight = new THREE.PointLight(0xffb000, 0.6, 4);
        pLight.position.set(side * 2.8, 0.3, z);
        courtyardGroup.add(pLight);
        pathwayDiyasLights.push(pLight);
      }
    }

    // 9. CENTRAL DIYA & BASE PLATFORM
    const centralDiyaGroup = new THREE.Group();
    centralDiyaGroup.position.set(0, 0.18, -2.5);
    centralDiyaGroup.scale.set(0.65, 0.65, 0.65);
    courtyardGroup.add(centralDiyaGroup);

    const platformRangoliCanvas = document.createElement('canvas');
    platformRangoliCanvas.width = 1024;
    platformRangoliCanvas.height = 1024;
    const rCtx = platformRangoliCanvas.getContext('2d');
    if (rCtx) {
      rCtx.fillStyle = '#4A154B';
      rCtx.fillRect(0, 0, 1024, 1024);

      const cx = 512;
      const cy = 512;

      const rings = [
        { r: 490, col: '#FFB000', w: 12 },
        { r: 450, col: '#FFF1D6', w: 6 },
        { r: 390, col: '#E91E63', w: 10 },
        { r: 310, col: '#20C9C3', w: 8 },
        { r: 210, col: '#FF8F00', w: 6 },
      ];
      rings.forEach((ring) => {
        rCtx.strokeStyle = ring.col;
        rCtx.lineWidth = ring.w;
        rCtx.beginPath();
        rCtx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        rCtx.stroke();
      });

      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        rCtx.save();
        rCtx.translate(cx, cy);
        rCtx.rotate(a);

        rCtx.fillStyle = i % 2 === 0 ? '#E91E63' : '#008C95';
        rCtx.beginPath();
        rCtx.moveTo(0, 120);
        rCtx.quadraticCurveTo(60, 260, 0, 440);
        rCtx.quadraticCurveTo(-60, 260, 0, 120);
        rCtx.fill();

        rCtx.strokeStyle = '#FFF1D6';
        rCtx.lineWidth = 3;
        rCtx.stroke();

        rCtx.restore();
      }
    }
    const platformRangoliTex = new THREE.CanvasTexture(platformRangoliCanvas);
    platformRangoliTex.colorSpace = THREE.SRGBColorSpace;
    platformRangoliTex.anisotropy = maxAnisotropy;

    const platformGeo = new THREE.CylinderGeometry(3.1, 3.3, 0.28, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      map: platformRangoliTex,
      roughness: 0.45,
      metalness: 0.25,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.14;
    if (!isSoftwareGl) platformMesh.receiveShadow = true;
    centralDiyaGroup.add(platformMesh);

    const clayCanvas = document.createElement('canvas');
    clayCanvas.width = 1024;
    clayCanvas.height = 1024;
    const cCtx = clayCanvas.getContext('2d');
    if (cCtx) {
      cCtx.fillStyle = '#B84522';
      cCtx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        cCtx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 20, 10, 0.25)' : 'rgba(240, 160, 100, 0.25)';
        cCtx.fillRect(x, y, 2, 2);
      }

      cCtx.strokeStyle = '#FFB000';
      cCtx.lineWidth = 14;
      cCtx.beginPath();
      cCtx.arc(512, 512, 420, 0, Math.PI * 2);
      cCtx.stroke();
    }
    const clayTex = new THREE.CanvasTexture(clayCanvas);
    clayTex.colorSpace = THREE.SRGBColorSpace;
    clayTex.anisotropy = maxAnisotropy;

    const terracottaMat = new THREE.MeshStandardMaterial({
      map: clayTex,
      roughness: 0.52,
      metalness: 0.1,
      color: 0xbd4b24,
    });

    const lathePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.22),
      new THREE.Vector2(0.95, 0.26),
      new THREE.Vector2(1.58, 0.48),
      new THREE.Vector2(1.98, 0.88),
      new THREE.Vector2(1.85, 1.12),
      new THREE.Vector2(1.55, 1.02),
      new THREE.Vector2(0.9, 0.7),
      new THREE.Vector2(0, 0.6),
    ];
    const bowlGeo = new THREE.LatheGeometry(lathePoints, 64);
    const bowlMesh = new THREE.Mesh(bowlGeo, terracottaMat);
    if (!isSoftwareGl) {
      bowlMesh.castShadow = true;
      bowlMesh.receiveShadow = true;
    }
    centralDiyaGroup.add(bowlMesh);

    const beakGeo = new THREE.ConeGeometry(0.38, 0.72, 16);
    beakGeo.scale(1.25, 0.85, 1.45);
    const beakMesh = new THREE.Mesh(beakGeo, terracottaMat);
    beakMesh.rotation.x = -Math.PI / 3;
    beakMesh.position.set(0, 1.02, 1.72);
    centralDiyaGroup.add(beakMesh);

    const wickCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.78, 0.45),
      new THREE.Vector3(0, 0.92, 1.1),
      new THREE.Vector3(0, 1.1, 1.55),
    ]);
    const wickGeo = new THREE.TubeGeometry(wickCurve, 24, 0.07, 10, false);
    const wickMat = new THREE.MeshStandardMaterial({
      color: 0x2e2016,
      roughness: 0.95,
      metalness: 0.05,
    });
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    centralDiyaGroup.add(wickMesh);

    const wickTipNode = new THREE.Object3D();
    wickTipNode.position.set(0, 1.18, 1.58);
    centralDiyaGroup.add(wickTipNode);

    // 3D Flame Assembly
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 1.2, 1.56);
    centralDiyaGroup.add(flameGroup);

    const blueBaseGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blueBaseGeo.scale(1, 1.5, 0.8);
    const blueBaseMesh = new THREE.Mesh(
      blueBaseGeo,
      new THREE.MeshBasicMaterial({ color: 0x20c9c3, transparent: true, opacity: 0.85 })
    );
    blueBaseMesh.position.y = 0.08;
    flameGroup.add(blueBaseMesh);

    const outerFlameGeo = new THREE.ConeGeometry(0.34, 1.15, 24);
    outerFlameGeo.translate(0, 0.58, 0);
    const outerFlameMesh = new THREE.Mesh(
      outerFlameGeo,
      new THREE.MeshBasicMaterial({ color: 0xe63946, transparent: true, opacity: 0.82 })
    );
    flameGroup.add(outerFlameMesh);

    const midFlameGeo = new THREE.ConeGeometry(0.24, 0.9, 20);
    midFlameGeo.translate(0, 0.45, 0);
    const midFlameMesh = new THREE.Mesh(
      midFlameGeo,
      new THREE.MeshBasicMaterial({ color: 0xffb000, transparent: true, opacity: 0.92 })
    );
    flameGroup.add(midFlameMesh);

    const innerFlameGeo = new THREE.ConeGeometry(0.14, 0.6, 16);
    innerFlameGeo.translate(0, 0.3, 0);
    const innerFlameMesh = new THREE.Mesh(
      innerFlameGeo,
      new THREE.MeshBasicMaterial({ color: 0xfff1d6 })
    );
    flameGroup.add(innerFlameMesh);

    flameGroup.scale.set(0.001, 0.001, 0.001);

    // Floating Petals
    const petalCount = isSoftwareGl ? 18 : 40;
    const floatingPetalsGroup = new THREE.Group();
    scene.add(floatingPetalsGroup);

    const singlePetalGeo = new THREE.SphereGeometry(0.09, 12, 8);
    singlePetalGeo.scale(1.2, 0.25, 1.8);
    const petalColors = [0xffb000, 0xff8f00, 0xff5722, 0xe91e63];
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
      const x = (Math.random() - 0.5) * 14;
      const y = Math.random() * 8;
      const z = Math.random() * 25 - 5;
      pMesh.position.set(x, y, z);
      floatingPetalsGroup.add(pMesh);

      petalData.push({
        mesh: pMesh,
        speedY: 0.15 + Math.random() * 0.25,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.8,
        swayFreq: 0.8 + Math.random() * 1.2,
        initialX: x,
      });
    }

    // 10. EVENT HANDLERS
    const handleGateClick = () => {
      if (stateRef.current.phase !== 'gate') return;

      soundManager.playClick();
      soundManager.playLightingFlourish();
      setPhase('opening_gate');
      setInstructionText('COURTYARD REVEALED — Scroll to approach the Diya');

      leftHandleRing.rotation.z = Math.PI * 0.4;
      rightHandleRing.rotation.z = -Math.PI * 0.4;
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
        startY: height * 0.2,
        targetX: stateRef.current.wickScreenPos.x,
        targetY: stateRef.current.wickScreenPos.y,
      };

      const startTime = performance.now();
      const sparkDuration = 850;

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
            const p = Math.min(fElapsed / 1.4, 1);
            stateRef.current.lightingProgress = p;

            flamePointLight.intensity = p * 10.0;
            flameGlowLight.intensity = p * 6.0;
            ambientLight.color.setHSL(0.08, 0.85, 0.25 + p * 0.35);

            if (fElapsed > 1.1 && stateRef.current.phase !== 'emerging') {
              setPhase('emerging');

              const flashStart = performance.now();
              const runFlash = () => {
                const flashElapsed = (performance.now() - flashStart) / 1000;
                if (flashElapsed < 0.6) {
                  setFlashOpacity(Math.min(flashElapsed / 0.6, 1));
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
        const delta = e.deltaY * 0.0018;
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

        const delta = deltaY * 0.0045;
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
      camera.fov = currentAspect < 1 ? 45 + (1 - currentAspect) * 26 : 45;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      resizeOverlay();
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let frameId: number;
    const tempVec = new THREE.Vector3();

    let steppedTick = 0;
    let flameFrame = 0;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Phase 1: Gate Opening
      if (stateRef.current.phase === 'opening_gate') {
        stateRef.current.gateOpenProgress = THREE.MathUtils.damp(
          stateRef.current.gateOpenProgress,
          1,
          2.2,
          delta
        );

        const openAngle = stateRef.current.gateOpenProgress * (Math.PI * 0.55);
        leftDoorPivot.rotation.y = -openAngle;
        rightDoorPivot.rotation.y = openAngle;

        camera.position.z = THREE.MathUtils.damp(camera.position.z, 18, 1.8, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.5, 1.8, delta);
        camera.lookAt(0, 1.2, -2.5);

        if (stateRef.current.gateOpenProgress > 0.92) {
          setPhase('courtyard_walk');
        }
      }

      // Phase 2: Courtyard Travel
      if (stateRef.current.phase === 'courtyard_walk' || stateRef.current.phase === 'at_diya') {
        stateRef.current.scrollProgress = THREE.MathUtils.damp(
          stateRef.current.scrollProgress,
          stateRef.current.targetScrollProgress,
          4.5,
          delta
        );

        setScrollProgress(stateRef.current.scrollProgress);

        const sp = stateRef.current.scrollProgress;
        const camZ = THREE.MathUtils.lerp(18, 1.8, sp);
        const camY = THREE.MathUtils.lerp(2.5, 1.35, sp);

        camera.position.x = Math.sin(time * 0.5) * 0.15;
        camera.position.y = camY + Math.cos(time * 0.4) * 0.08;
        camera.position.z = camZ;
        camera.lookAt(0, 0.8, -2.5);

        pathwayDiyasLights.forEach((light) => {
          light.intensity = 0.5 + sp * 1.5;
        });

        if (sp >= 0.94 && stateRef.current.phase === 'courtyard_walk') {
          setPhase('at_diya');
          setInstructionText('LIGHT THE DIYA — Touch the wick to ignite');
        } else if (sp < 0.9 && stateRef.current.phase === 'at_diya') {
          setPhase('courtyard_walk');
          setInstructionText('COURTYARD — Scroll to approach the Diya');
        }
      }

      // Phase 3: Emergence
      if (stateRef.current.phase === 'emerging') {
        camera.position.z = THREE.MathUtils.damp(camera.position.z, -1.8, 2.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.9, 2.5, delta);
      }

      centralDiyaGroup.rotation.y += 0.005;

      // Animate Castle & Fireworks
      castleGroup.rotation.y = Math.sin(time * 0.15) * 0.02;

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
          size: 0.14,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
        bgFireworksGroup.add(new THREE.Points(bgGeo, bgMat));
      }

      // Animate Petals
      petalData.forEach((pd) => {
        pd.mesh.position.y -= pd.speedY * delta;
        pd.mesh.position.x = pd.initialX + Math.sin(time * pd.swayFreq) * 0.4;
        pd.mesh.rotation.x += pd.rotSpeedX * delta;

        if (pd.mesh.position.y < -1) {
          pd.mesh.position.y = 8;
        }
      });

      // Project wick tip to screen coords
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

      if (stateRef.current.isLit) {
        const growth = stateRef.current.lightingProgress;
        const flick = 1 + Math.sin(time * 16) * 0.06 + Math.cos(time * 24) * 0.04;
        flameGroup.scale.set(growth * flick, growth * flick * 1.15, growth * flick);
        flamePointLight.intensity = growth * 10.0 * flick;
      }

      // Direct crisp WebGL rendering without ink outlines
      renderer.render(scene, camera);

      // Crisp 2D Canvas Overlay Drawing
      if (oCtx) {
        oCtx.clearRect(0, 0, width, height);

        const sp = stateRef.current.sparkProgress;
        if (sp >= 0 && sp <= 1) {
          const { startX, startY, targetX, targetY } = stateRef.current.sparkCoords;
          const currX = THREE.MathUtils.lerp(startX, targetX, sp);
          const currY = THREE.MathUtils.lerp(startY, targetY, sp);

          oCtx.save();
          oCtx.strokeStyle = '#FFB000';
          oCtx.lineWidth = 4;
          oCtx.shadowColor = '#FF5722';
          oCtx.shadowBlur = 16;

          oCtx.beginPath();
          oCtx.moveTo(startX, startY);
          const segments = 6;
          for (let s = 1; s <= segments; s++) {
            const segP = (s / segments) * sp;
            const px = THREE.MathUtils.lerp(startX, targetX, segP);
            const py = THREE.MathUtils.lerp(startY, targetY, segP);
            const jitter = (Math.random() - 0.5) * 14 * (1 - segP);
            oCtx.lineTo(px + jitter, py + jitter);
          }
          oCtx.stroke();

          oCtx.fillStyle = '#FFF1D6';
          oCtx.font = '24px sans-serif';
          oCtx.textAlign = 'center';
          oCtx.textBaseline = 'middle';
          oCtx.fillText('✦', currX, currY);
          oCtx.restore();
        }

        if (stateRef.current.isLit && stateRef.current.wickScreenPos.visible) {
          const wx = stateRef.current.wickScreenPos.x;
          const wy = stateRef.current.wickScreenPos.y;
          const progress = stateRef.current.lightingProgress;

          steppedTick++;
          if (steppedTick % 5 === 0) {
            flameFrame = (flameFrame + 1) % 4;
          }

          oCtx.save();
          oCtx.translate(wx, wy);
          oCtx.scale(progress, progress);

          const flameWidths = [24, 28, 22, 26];
          const flameHeights = [65, 75, 60, 70];
          const fw = flameWidths[flameFrame];
          const fh = flameHeights[flameFrame];

          oCtx.fillStyle = '#E63946';
          oCtx.strokeStyle = '#FFF1D6';
          oCtx.lineWidth = 2;
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-fw, -fh * 0.4, -fw * 0.7, -fh * 0.8, 0, -fh);
          oCtx.bezierCurveTo(fw * 0.7, -fh * 0.8, fw, -fh * 0.4, 0, 0);
          oCtx.fill();
          oCtx.stroke();

          oCtx.fillStyle = '#FF5722';
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-fw * 0.75, -fh * 0.35, -fw * 0.5, -fh * 0.7, 0, -fh * 0.88);
          oCtx.bezierCurveTo(fw * 0.5, -fh * 0.7, fw * 0.75, -fh * 0.35, 0, 0);
          oCtx.fill();

          oCtx.fillStyle = '#FFB000';
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-fw * 0.5, -fh * 0.28, -fw * 0.35, -fh * 0.55, 0, -fh * 0.72);
          oCtx.bezierCurveTo(fw * 0.35, -fh * 0.55, fw * 0.5, -fh * 0.28, 0, 0);
          oCtx.fill();

          for (let spk = 0; spk < 3; spk++) {
            const spkAngle = time * 4 + (spk * Math.PI * 2) / 3;
            const spkDist = 45 + Math.sin(time * 6 + spk) * 15;
            const sx = Math.cos(spkAngle) * spkDist * 0.6;
            const sy = -fh * 0.7 + Math.sin(spkAngle) * spkDist * 0.8;

            oCtx.fillStyle = spk === 0 ? '#FFB000' : (spk === 1 ? '#FF2E88' : '#20C9C3');
            oCtx.font = '14px sans-serif';
            oCtx.fillText('✧', sx, sy);
          }

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
      platformRangoliTex.dispose();
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
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#160A2A] via-[#2B1448] to-[#110B22] select-none touch-none z-50">
      {/* 1. Bright White & Gold Rajasthani Palace (Taj Lake Palace Style 2D Vector Picture) in Background Sky */}
      <div className="absolute top-0 left-0 right-0 h-[68vh] pointer-events-none z-0 overflow-hidden opacity-95">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMin slice" className="w-full h-full">
          <defs>
            <linearGradient id="whitePalaceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF1D6" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#FFE0B2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFB000" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="palaceAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Elegant White Rajasthani Marble Fort & Palace Facade */}
          <g fill="url(#whitePalaceGrad)" stroke="#FFB000" strokeWidth="2.5">
            {/* Left Palace Turrets & Chhatri Domes */}
            <path d="M0,600 L0,240 L70,240 L70,180 Q105,120 140,180 L140,240 L210,240 L210,160 Q245,90 280,160 L280,240 L360,240 L360,600 Z" />
            {/* Right Palace Turrets & Chhatri Domes */}
            <path d="M1200,600 L1200,240 L1130,240 L1130,180 Q1095,120 1060,180 L1060,240 L990,240 L990,160 Q955,90 920,160 L920,240 L840,240 L840,600 Z" />
            {/* Center Royal Grand Onion Dome (Gumbad) */}
            <path d="M410,600 L410,260 L470,260 L470,200 C470,130 535,50 600,30 C665,50 730,130 730,200 L730,260 L790,260 L790,600 Z" />
          </g>

          {/* Central Dome & Chhatri Gold Kalash Finials */}
          <g fill="#FFB000" filter="url(#goldGlow)">
            <polygon points="595,30 600,-5 605,30" />
            <polygon points="102,120 105,95 108,120" />
            <polygon points="242,90 245,65 248,90" />
            <polygon points="1092,120 1095,95 1098,120" />
            <polygon points="952,90 955,65 958,90" />
          </g>

          {/* Decorative Rani Pink & Gold Jaali Arches & Illuminated Windows */}
          <g fill="#FFB000">
            {/* Left Windows */}
            <rect x="95" y="200" width="20" height="35" rx="10" stroke="#FFF1D6" strokeWidth="2" />
            <rect x="235" y="180" width="20" height="38" rx="10" stroke="#FFF1D6" strokeWidth="2" />
            {/* Right Windows */}
            <rect x="1085" y="200" width="20" height="35" rx="10" stroke="#FFF1D6" strokeWidth="2" />
            <rect x="945" y="180" width="20" height="38" rx="10" stroke="#FFF1D6" strokeWidth="2" />
            {/* Center Palace Windows */}
            <rect x="535" y="210" width="26" height="48" rx="13" stroke="#FFF1D6" strokeWidth="2" />
            <rect x="639" y="210" width="26" height="48" rx="13" stroke="#FFF1D6" strokeWidth="2" />
            <rect x="587" y="130" width="26" height="48" rx="13" fill="#FF5722" stroke="#FFF1D6" strokeWidth="2" />
          </g>

          {/* Festive Marigold Garland Decor on Palace Facade */}
          <path d="M470,260 Q535,285 600,260 Q665,285 730,260" fill="none" stroke="#FF5722" strokeWidth="6" strokeDasharray="10,6" />
        </svg>
      </div>

      {/* 2. Ambient Warm Golden & Pink Glow Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[900px] h-[600px] bg-[#FFB000]/25 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[700px] h-[700px] bg-[#E91E63]/25 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 3. 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-pointer w-full h-full z-10"
        title="Touch or click to interact with the Diwali Gateway"
      />

      {/* 4. 2D Canvas Overlay */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full z-20"
      />

      {/* 5. Comic Impact Burst Overlay */}
      {impactBurst.active && (
        <div
          className="absolute pointer-events-none z-30 animate-comic-burst"
          style={{
            left: `${impactBurst.x}px`,
            top: `${impactBurst.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-36 h-36 sm:w-64 sm:h-64 text-[#FFB000] drop-shadow-[0_0_25px_#FF2E88]">
            <polygon
              points="100,10 115,75 180,30 135,88 190,100 135,112 180,170 115,125 100,190 85,125 20,170 65,112 10,100 65,88 20,30 85,75"
              fill="#FFB000"
              stroke="#FFF1D6"
              strokeWidth="4"
            />
          </svg>
        </div>
      )}

      {/* 6. Flash Transition Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FFF1D6] via-[#FFB000] to-[#E91E63] pointer-events-none transition-opacity duration-300 z-50"
        style={{ opacity: flashOpacity }}
      />

      {/* 7. Top Title Header & Quick Skip Button */}
      <div className="absolute top-4 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB000] animate-pulse shrink-0" />
          <h1 className="text-[11px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] font-serif text-[#FFB000] drop-shadow-[0_0_12px_rgba(255,176,0,0.85)] font-extrabold truncate">
            THE LIGHT WITHIN
          </h1>
        </div>

        <button
          onClick={handleFastSkip}
          className="pointer-events-auto flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#0F1126]/90 border border-[#20C9C3]/50 text-[11px] sm:text-xs font-bold text-[#FFF1D6] hover:text-[#FFB000] hover:border-[#FFB000] transition-all cursor-pointer shadow-md backdrop-blur-md shrink-0"
          title="Skip intro journey straight to celebration"
        >
          <span>Skip</span>
          <FastForward className="w-3 h-3 text-[#20C9C3]" />
        </button>
      </div>

      {/* 8. Bottom Interactive Progress Bar & Instructions */}
      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-30 px-3 text-center">
        {(phase === 'courtyard_walk' || phase === 'at_diya') && (
          <div className="w-40 sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20 mb-2.5 backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-[#E91E63] via-[#FF5722] to-[#FFB000] transition-all duration-150 rounded-full"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        )}

        <div className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#0D0F22]/90 border-2 border-[#FFB000]/60 backdrop-blur-md shadow-[0_0_35px_rgba(32,201,195,0.35)] flex items-center justify-center gap-2.5 max-w-[92vw]">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFB000] shadow-[0_0_12px_#FF2E88] animate-pulse shrink-0" />
          <p className="text-[11px] sm:text-sm font-semibold tracking-wide text-[#FFF1D6] font-sans truncate">
            {instructionText}
          </p>
        </div>

        {phase === 'courtyard_walk' && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#20C9C3] mt-2 tracking-widest uppercase font-semibold drop-shadow-sm animate-bounce">
            <ArrowDown className="w-3 h-3 text-[#FFB000]" />
            <span>Scroll or drag down to walk forward</span>
          </div>
        )}
      </div>
    </div>
  );
};

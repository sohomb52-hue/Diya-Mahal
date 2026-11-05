import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { soundManager } from '../utils/audio';
import { calculateHalftoneDotRadius } from '../utils/gameLogic';

interface OpeningDiyaScreenProps {
  onUnlocked: () => void;
}

// Subtle Spider-Verse Hand-Drawn Ink Outline Shader
const SpiderVerseInkOutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1000, 800) },
    time: { value: 0 },
    inkColor: { value: new THREE.Color(0x12041a) },
    outlineThickness: { value: 0.75 }, // Softer, thinner ink outline
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform vec3 inkColor;
    uniform float outlineThickness;
    varying vec2 vUv;

    void main() {
      vec2 texel = outlineThickness / resolution;
      vec4 center = texture2D(tDiffuse, vUv);

      // Sobel edge detection kernel
      vec4 n  = texture2D(tDiffuse, vUv + vec2(0.0, texel.y));
      vec4 s  = texture2D(tDiffuse, vUv - vec2(0.0, texel.y));
      vec4 e  = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0));
      vec4 w  = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0));
      vec4 nw = texture2D(tDiffuse, vUv + vec2(-texel.x, texel.y));
      vec4 ne = texture2D(tDiffuse, vUv + vec2(texel.x, texel.y));
      vec4 sw = texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y));
      vec4 se = texture2D(tDiffuse, vUv + vec2(texel.x, -texel.y));

      vec4 gx = (se + 2.0 * e + ne) - (sw + 2.0 * w + nw);
      vec4 gy = (nw + 2.0 * n + ne) - (sw + 2.0 * s + se);
      float edge = length(gx.rgb) + length(gy.rgb);

      // Subtle comic jitter
      float jitter = sin(vUv.y * 140.0 + time * 3.0) * 0.03 + cos(vUv.x * 140.0) * 0.03;
      float threshold = 0.42 + jitter; // Higher threshold = delicate, subtle outline

      if (edge > threshold) {
        gl_FragColor = vec4(mix(center.rgb, inkColor, 0.55), center.a);
      } else {
        gl_FragColor = center;
      }
    }
  `,
};

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
  const [isIgniting, setIsIgniting] = useState(false);
  const [instructionText, setInstructionText] = useState('Touch the diya to awaken the light.');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [impactBurst, setImpactBurst] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const stateRef = useRef({
    isLit: false,
    lightingProgress: 0,
    isTransitioning: false,
    pointerDown: false,
    prevPointer: { x: 0, y: 0 },
    rotVelocity: { x: 0, y: 0.005 },
    rotation: { x: 0.32, y: 0 },
    wickScreenPos: { x: 0, y: 0, visible: false },
    sparkProgress: -1,
    sparkCoords: { startX: 0, startY: 0, targetX: 0, targetY: 0 },
  });

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

    // 1. Three.js Scene Setup (Deep Night Sky Atmosphere)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0e20, 0.032);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      80
    );
    camera.position.set(0, 3.0, 6.2);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Set up EffectComposer with Subtle Spider-Verse Ink Outline Shader Pass
    let composer: EffectComposer | null = null;
    let inkPass: ShaderPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      inkPass = new ShaderPass(SpiderVerseInkOutlineShader);
      inkPass.uniforms.resolution.value.set(
        container.clientWidth * renderer.getPixelRatio(),
        container.clientHeight * renderer.getPixelRatio()
      );
      composer.addPass(inkPass);
    }

    // Overlay 2D Canvas setup
    const oCtx = overlayCanvas.getContext('2d');
    const resizeOverlay = () => {
      overlayCanvas.width = container.clientWidth;
      overlayCanvas.height = container.clientHeight;
    };
    resizeOverlay();

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x4a2a6b, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd166, 2.3);
    keyLight.position.set(4.5, 8.5, 4.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff2e88, 1.8);
    rimLight.position.set(-4.5, 4.0, -3.5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x20c9c3, 1.2);
    fillLight.position.set(0, -2.5, 4);
    scene.add(fillLight);

    // Flame Point Lights
    const flamePointLight = new THREE.PointLight(0xff5722, 0, 14, 1.8);
    flamePointLight.position.set(0, 1.2, 0.4);
    scene.add(flamePointLight);

    const flameGlowLight = new THREE.PointLight(0xffb000, 0, 10, 1.5);
    flameGlowLight.position.set(0, 1.6, 0.4);
    scene.add(flameGlowLight);

    // Ink Outline Material for inverted hull meshes (Thinner outline)
    const inkOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x14051a,
      side: THREE.BackSide,
    });

    // 3. STARRY NIGHT SKY BACKGROUND PARTICLES
    const starCount = isSoftwareGl ? 120 : 320;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 1] = Math.random() * 12 - 1;
      starPositions[i * 3 + 2] = -5 - Math.random() * 15;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfff1d6,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 4. BACKGROUND NIGHT SKY FIREWORKS SYSTEM
    const bgFireworksParticles: BgFireworkParticle[] = [];

    const spawnBgFirework = (x: number, y: number, z: number) => {
      const colorHex = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const count = isSoftwareGl ? 25 : 45;

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

    // Auto launch periodic ambient fireworks in night sky
    const bgFireworkInterval = window.setInterval(() => {
      const fx = (Math.random() - 0.5) * 16;
      const fy = Math.random() * 4 + 2.5;
      const fz = -4 - Math.random() * 8;
      spawnBgFirework(fx, fy, fz);
    }, 1800);

    // Render group for dynamic bg fireworks
    const bgFireworksGroup = new THREE.Group();
    scene.add(bgFireworksGroup);

    // 5. ORNATE 3D SPINNING PLATFORM BASE
    const spinningPlatformGroup = new THREE.Group();
    scene.add(spinningPlatformGroup);

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

      rCtx.fillStyle = '#FFF1D6';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
        rCtx.beginPath();
        rCtx.arc(cx + Math.cos(a) * 470, cy + Math.sin(a) * 470, 7, 0, Math.PI * 2);
        rCtx.fill();
      }
    }
    const platformRangoliTex = new THREE.CanvasTexture(platformRangoliCanvas);
    platformRangoliTex.colorSpace = THREE.SRGBColorSpace;

    const platformGeo = new THREE.CylinderGeometry(3.1, 3.3, 0.28, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      map: platformRangoliTex,
      roughness: 0.45,
      metalness: 0.25,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.14;
    if (!isSoftwareGl) platformMesh.receiveShadow = true;
    spinningPlatformGroup.add(platformMesh);

    const platformOutline = new THREE.Mesh(platformGeo, inkOutlineMat);
    platformOutline.scale.set(1.008, 1.04, 1.008);
    platformMesh.add(platformOutline);

    const polishedGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      roughness: 0.15,
      metalness: 0.9,
    });
    const platformGoldRimGeo = new THREE.TorusGeometry(3.18, 0.08, 16, 64);
    const platformGoldRimMesh = new THREE.Mesh(platformGoldRimGeo, polishedGoldMat);
    platformGoldRimMesh.rotation.x = Math.PI / 2;
    platformGoldRimMesh.position.y = 0.02;
    spinningPlatformGroup.add(platformGoldRimMesh);

    const petalRingGroup = new THREE.Group();
    const platformPetalGeo = new THREE.SphereGeometry(0.18, 12, 12);
    platformPetalGeo.scale(1.2, 0.3, 2.2);

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const isPink = i % 2 === 0;
      const petalMat = new THREE.MeshStandardMaterial({
        color: isPink ? 0xe91e63 : 0xffb000,
        roughness: 0.4,
        metalness: 0.3,
      });
      const petal = new THREE.Mesh(platformPetalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 3.25, 0.01, Math.sin(angle) * 3.25);
      petal.rotation.y = -angle;
      petalRingGroup.add(petal);
    }
    spinningPlatformGroup.add(petalRingGroup);

    // 6. CENTRAL HANDCRAFTED DIYA
    const diyaRootGroup = new THREE.Group();
    diyaRootGroup.scale.set(0.68, 0.68, 0.68);
    diyaRootGroup.position.y = 0.18;
    scene.add(diyaRootGroup);

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

      for (let y = 0; y < 1024; y += 24) {
        for (let x = 0; x < 1024; x += 24) {
          const distFromCenter = Math.sqrt((x - 512) ** 2 + (y - 512) ** 2);
          const dotRadius = calculateHalftoneDotRadius(distFromCenter, 512, 1.5, 5.0);
          cCtx.fillStyle = 'rgba(50, 15, 25, 0.2)';
          cCtx.beginPath();
          cCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
          cCtx.fill();
        }
      }

      cCtx.strokeStyle = '#FFB000';
      cCtx.lineWidth = 14;
      cCtx.beginPath();
      cCtx.arc(512, 512, 420, 0, Math.PI * 2);
      cCtx.stroke();

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
        const isPink = Math.round((a / (Math.PI / 16))) % 2 === 0;
        cCtx.fillStyle = isPink ? '#E91E63' : '#20C9C3';
        cCtx.beginPath();
        cCtx.arc(512 + Math.cos(a) * 390, 512 + Math.sin(a) * 390, 18, 0, Math.PI * 2);
        cCtx.fill();
        cCtx.strokeStyle = '#0F1126';
        cCtx.lineWidth = 3;
        cCtx.stroke();
      }

      cCtx.fillStyle = '#FFF1D6';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
        cCtx.beginPath();
        cCtx.arc(512 + Math.cos(a) * 350, 512 + Math.sin(a) * 350, 6, 0, Math.PI * 2);
        cCtx.fill();
      }
    }

    const clayTex = new THREE.CanvasTexture(clayCanvas);
    clayTex.colorSpace = THREE.SRGBColorSpace;
    clayTex.wrapS = THREE.RepeatWrapping;
    clayTex.wrapT = THREE.RepeatWrapping;
    clayTex.repeat.set(2, 1);

    const terracottaMat = new THREE.MeshStandardMaterial({
      map: clayTex,
      roughness: 0.52,
      metalness: 0.1,
      color: 0xbd4b24,
    });

    const pedestalGeo = new THREE.CylinderGeometry(1.25, 1.55, 0.22, 48);
    const pedPos = pedestalGeo.attributes.position;
    for (let i = 0; i < pedPos.count; i++) {
      const vx = pedPos.getX(i);
      const vy = pedPos.getY(i);
      const vz = pedPos.getZ(i);
      const noise = Math.sin(vx * 10 + vz * 10) * 0.025;
      pedPos.setXYZ(i, vx + noise, vy, vz + noise);
    }
    pedestalGeo.computeVertexNormals();

    const pedestalMesh = new THREE.Mesh(pedestalGeo, terracottaMat);
    pedestalMesh.position.y = 0.11;
    if (!isSoftwareGl) pedestalMesh.receiveShadow = true;
    diyaRootGroup.add(pedestalMesh);

    const pedestalOutline = new THREE.Mesh(pedestalGeo, inkOutlineMat);
    pedestalOutline.scale.set(1.012, 1.03, 1.012);
    pedestalMesh.add(pedestalOutline);

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
    const bowlPos = bowlGeo.attributes.position;
    for (let i = 0; i < bowlPos.count; i++) {
      const vx = bowlPos.getX(i);
      const vy = bowlPos.getY(i);
      const vz = bowlPos.getZ(i);
      const bump = Math.sin(vx * 8) * Math.cos(vz * 8) * 0.035;
      bowlPos.setXYZ(i, vx + bump, vy + bump * 0.5, vz + bump);
    }
    bowlGeo.computeVertexNormals();

    const bowlMesh = new THREE.Mesh(bowlGeo, terracottaMat);
    if (!isSoftwareGl) {
      bowlMesh.castShadow = true;
      bowlMesh.receiveShadow = true;
    }
    diyaRootGroup.add(bowlMesh);

    const bowlOutline = new THREE.Mesh(bowlGeo, inkOutlineMat);
    bowlOutline.scale.set(1.01, 1.01, 1.01);
    bowlMesh.add(bowlOutline);

    const beakGeo = new THREE.ConeGeometry(0.38, 0.72, 16);
    beakGeo.scale(1.25, 0.85, 1.45);
    const beakMesh = new THREE.Mesh(beakGeo, terracottaMat);
    beakMesh.rotation.x = -Math.PI / 3;
    beakMesh.position.set(0, 1.02, 1.72);
    if (!isSoftwareGl) beakMesh.castShadow = true;
    diyaRootGroup.add(beakMesh);

    const beakOutline = new THREE.Mesh(beakGeo, inkOutlineMat);
    beakOutline.scale.set(1.02, 1.02, 1.02);
    beakMesh.add(beakOutline);

    const handleGroup = new THREE.Group();
    for (const side of [-1, 1]) {
      const handleGeo = new THREE.TorusGeometry(0.28, 0.08, 12, 24, Math.PI * 1.2);
      const handleMesh = new THREE.Mesh(handleGeo, terracottaMat);
      handleMesh.position.set(side * 1.95, 0.75, 0);
      handleMesh.rotation.z = side * Math.PI * 0.35;
      handleMesh.rotation.y = Math.PI / 2;
      handleGroup.add(handleMesh);
    }
    diyaRootGroup.add(handleGroup);

    const goldRimGeo = new THREE.TorusGeometry(1.88, 0.08, 16, 64);
    const goldRimMesh = new THREE.Mesh(goldRimGeo, polishedGoldMat);
    goldRimMesh.rotation.x = Math.PI / 2;
    goldRimMesh.position.y = 1.08;
    diyaRootGroup.add(goldRimMesh);

    const oilGeo = new THREE.CylinderGeometry(1.5, 1.2, 0.08, 36);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xdb851a,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92,
    });
    const oilMesh = new THREE.Mesh(oilGeo, oilMat);
    oilMesh.position.set(0, 0.82, 0.22);
    diyaRootGroup.add(oilMesh);

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
    diyaRootGroup.add(wickMesh);

    const fiberGroup = new THREE.Group();
    const fiberMat = new THREE.LineBasicMaterial({
      color: 0xfff1d6,
      transparent: true,
      opacity: 0.7,
    });
    for (let f = 0; f < 12; f++) {
      const fPoints: THREE.Vector3[] = [];
      const angleOffset = (f * Math.PI * 2) / 12;
      for (let t = 0; t <= 1; t += 0.1) {
        const p = wickCurve.getPoint(t);
        const radius = 0.075 + Math.sin(t * 15 + f) * 0.015;
        const a = angleOffset + t * Math.PI * 4;
        fPoints.push(new THREE.Vector3(p.x + Math.cos(a) * radius, p.y, p.z + Math.sin(a) * radius));
      }
      const fGeo = new THREE.BufferGeometry().setFromPoints(fPoints);
      fiberGroup.add(new THREE.Line(fGeo, fiberMat));
    }
    diyaRootGroup.add(fiberGroup);

    const wickTipNode = new THREE.Object3D();
    wickTipNode.position.set(0, 1.18, 1.58);
    diyaRootGroup.add(wickTipNode);

    // 3D Flame Assembly
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 1.2, 1.56);
    diyaRootGroup.add(flameGroup);

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

    // Floating Marigold Petals
    const petalCount = isSoftwareGl ? 25 : 55;
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

      const x = (Math.random() - 0.5) * 12;
      const y = Math.random() * 7 - 1;
      const z = (Math.random() - 0.5) * 8;

      pMesh.position.set(x, y, z);
      pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
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

    // Pointer Controls for Manual Rotation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      stateRef.current.pointerDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.prevPointer = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current.pointerDown) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - stateRef.current.prevPointer.x;
      const deltaY = clientY - stateRef.current.prevPointer.y;

      stateRef.current.rotVelocity.y = deltaX * 0.005;
      stateRef.current.rotVelocity.x = deltaY * 0.003;

      stateRef.current.prevPointer = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      stateRef.current.pointerDown = false;
    };

    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    // Ignition Sequence
    const triggerLightingSequence = () => {
      if (stateRef.current.isLit || isIgniting) return;
      setIsIgniting(true);
      setInstructionText('Igniting the sacred spark...');
      soundManager.playClick();

      stateRef.current.sparkProgress = 0;
      stateRef.current.sparkCoords = {
        startX: overlayCanvas.width * 0.65,
        startY: overlayCanvas.height * 0.15,
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

            flamePointLight.intensity = p * 9.0;
            flameGlowLight.intensity = p * 5.0;
            ambientLight.color.setHSL(0.08, 0.85, 0.25 + p * 0.3);

            if (fElapsed > 1.1 && !stateRef.current.isTransitioning) {
              stateRef.current.isTransitioning = true;

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

    const handleCanvasClick = () => {
      if (Math.abs(stateRef.current.rotVelocity.y) > 0.02) return;
      triggerLightingSequence();
    };

    container.addEventListener('click', handleCanvasClick);

    // Resize Handling
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
        if (inkPass) {
          inkPass.uniforms.resolution.value.set(
            width * renderer.getPixelRatio(),
            height * renderer.getPixelRatio()
          );
        }
      }

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

      // Dynamic Camera Movement
      if (!stateRef.current.isTransitioning) {
        camera.position.x = Math.sin(time * 0.4) * 0.35;
        camera.position.y = 3.0 + Math.cos(time * 0.3) * 0.22;
        camera.position.z = 6.2 + Math.sin(time * 0.2) * 0.28;
        camera.lookAt(0, 0.3, 0);
      }

      // Continuous 3D Diya Rotation
      const organicSpeed = 0.005 + 0.0018 * Math.sin(time * 1.4);
      if (!stateRef.current.pointerDown) {
        stateRef.current.rotVelocity.y = THREE.MathUtils.damp(
          stateRef.current.rotVelocity.y,
          organicSpeed,
          1.8,
          delta
        );
        stateRef.current.rotVelocity.x = THREE.MathUtils.damp(
          stateRef.current.rotVelocity.x,
          0,
          3,
          delta
        );
      }

      stateRef.current.rotation.y += stateRef.current.rotVelocity.y;
      stateRef.current.rotation.x = THREE.MathUtils.clamp(
        stateRef.current.rotation.x + stateRef.current.rotVelocity.x,
        0.1,
        0.75
      );

      // Rotate 3D Diya and Platform
      diyaRootGroup.rotation.y = stateRef.current.rotation.y;
      diyaRootGroup.rotation.x = stateRef.current.rotation.x;

      spinningPlatformGroup.rotation.y += 0.006;
      spinningPlatformGroup.rotation.x = stateRef.current.rotation.x * 0.4;

      // Animate Background Sky Fireworks Particles
      for (let i = bgFireworksParticles.length - 1; i >= 0; i--) {
        const p = bgFireworksParticles[i];
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 0.8 * delta; // Gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          bgFireworksParticles.splice(i, 1);
        }
      }

      // Rebuild background fireworks particle group
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

      // Animate Floating Marigold Petals
      petalData.forEach((pd) => {
        pd.mesh.position.y -= pd.speedY * delta;
        pd.mesh.position.x = pd.initialX + Math.sin(time * pd.swayFreq) * 0.4;
        pd.mesh.rotation.x += pd.rotSpeedX * delta;
        pd.mesh.rotation.y += pd.rotSpeedY * delta;

        if (pd.mesh.position.y < -1.5) {
          pd.mesh.position.y = 6;
        }
      });

      // Project wick tip to 2D screen coordinates
      wickTipNode.getWorldPosition(tempVec);
      tempVec.project(camera);
      const screenX = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
      const screenY = (-(tempVec.y * 0.5) + 0.5) * container.clientHeight;
      stateRef.current.wickScreenPos = {
        x: screenX,
        y: screenY,
        visible: tempVec.z < 1,
      };

      // 3D Flame Flicker
      if (stateRef.current.isLit) {
        const growth = stateRef.current.lightingProgress;
        const flick = 1 + Math.sin(time * 16) * 0.06 + Math.cos(time * 24) * 0.04;
        flameGroup.scale.set(growth * flick, growth * flick * 1.15, growth * flick);
        flamePointLight.intensity = growth * 9.0 * flick;
      }

      // Camera transition
      if (stateRef.current.isTransitioning) {
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 2.2, 2.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.4, 2.5, delta);
      }

      if (inkPass) {
        inkPass.uniforms.time.value = time;
      }

      if (composer && !isSoftwareGl) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      // 2D CANVAS OVERLAY
      if (oCtx) {
        oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        const sp = stateRef.current.sparkProgress;
        if (sp >= 0 && sp <= 1) {
          const { startX, startY, targetX, targetY } = stateRef.current.sparkCoords;
          const currX = THREE.MathUtils.lerp(startX, targetX, sp);
          const currY = THREE.MathUtils.lerp(startY, targetY, sp);

          oCtx.save();
          oCtx.strokeStyle = '#FFB000';
          oCtx.lineWidth = 4;
          oCtx.shadowColor = '#FF5722';
          oCtx.shadowBlur = 15;

          oCtx.beginPath();
          oCtx.moveTo(startX, startY);
          const segments = 6;
          for (let s = 1; s <= segments; s++) {
            const segP = (s / segments) * sp;
            const px = THREE.MathUtils.lerp(startX, targetX, segP);
            const py = THREE.MathUtils.lerp(startY, targetY, segP);
            const jitter = (Math.random() - 0.5) * 16 * (1 - segP);
            oCtx.lineTo(px + jitter, py + jitter);
          }
          oCtx.stroke();

          oCtx.fillStyle = '#FFF1D6';
          oCtx.font = '28px sans-serif';
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
          oCtx.strokeStyle = '#0F1126';
          oCtx.lineWidth = 3;
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

          oCtx.fillStyle = '#FFF1D6';
          oCtx.beginPath();
          oCtx.moveTo(0, 0);
          oCtx.bezierCurveTo(-fw * 0.25, -fh * 0.18, -fw * 0.18, -fh * 0.35, 0, -fh * 0.48);
          oCtx.bezierCurveTo(fw * 0.18, -fh * 0.35, fw * 0.25, -fh * 0.18, 0, 0);
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
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      container.removeEventListener('click', handleCanvasClick);

      if (composer) composer.dispose();
      renderer.dispose();
      clayTex.dispose();
      platformRangoliTex.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onUnlocked, isIgniting]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#0B0D1E] via-[#1B1D3D] to-[#0D0F22] select-none">
      {/* 1. Starry Night Sky Ambient Glows & City Skyline Base */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#3478F6]/20 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#E91E63]/20 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse" />

      {/* City Skyline Silhouette along horizon bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060712] to-transparent pointer-events-none z-0 opacity-80" />

      {/* 2. Comic Halftone Screen Vignette */}
      <div className="absolute inset-0 bg-comic-halftone-teal opacity-20 pointer-events-none z-0" />

      {/* 3. 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-pointer active:cursor-grabbing w-full h-full z-10"
        title="Touch or drag to interact with the 3D Diya"
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
          <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 text-[#FFB000] drop-shadow-[0_0_25px_#FF2E88]">
            <polygon
              points="100,10 115,75 180,30 135,88 190,100 135,112 180,170 115,125 100,190 85,125 20,170 65,112 10,100 65,88 20,30 85,75"
              fill="#FFB000"
              stroke="#0F1126"
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

      {/* 7. Title Header */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-30 px-4">
        <h1 className="text-xs sm:text-sm uppercase tracking-[0.45em] font-serif text-[#FFB000] drop-shadow-[0_0_16px_rgba(255,176,0,0.85)] chromatic-comic-glitch font-extrabold">
          THE FESTIVAL OF LIGHTS
        </h1>
      </div>

      {/* 8. Bottom Minimalist Lighting Instruction */}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-30 px-4">
        <div className="px-6 py-3 rounded-full bg-[#0D0F22]/90 border-2 border-[#FFB000]/60 backdrop-blur-md shadow-[0_0_35px_rgba(32,201,195,0.35)] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFB000] shadow-[0_0_12px_#FF2E88] animate-pulse" />
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#FFF1D6] font-sans">
            {instructionText}
          </p>
        </div>
        <p className="text-[10px] text-[#20C9C3] mt-2 tracking-widest uppercase font-semibold drop-shadow-sm">
          Drag to orbit · Touch the diya to awaken the light
        </p>
      </div>
    </div>
  );
};

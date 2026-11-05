import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../utils/audio';

interface OpeningDiyaScreenProps {
  onUnlocked: () => void;
}

export const OpeningDiyaScreen: React.FC<OpeningDiyaScreenProps> = ({ onUnlocked }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isIgniting, setIsIgniting] = useState(false);
  const [instructionText, setInstructionText] = useState('Touch the diya to awaken the light.');
  const [flashOpacity, setFlashOpacity] = useState(0);

  // References to keep animation loop decoupled from React renders
  const stateRef = useRef({
    isLit: false,
    lightingProgress: 0, // 0 to 1
    isTransitioning: false,
    pointerDown: false,
    prevPointer: { x: 0, y: 0 },
    rotVelocity: { x: 0, y: 0.005 },
    rotation: { x: 0.35, y: 0 },
  });

  useEffect(() => {
    soundManager.setScene('opening');
    const container = mountRef.current;
    if (!container) return;

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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x160b2b, 0.09);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 2.6, 5.8);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x280e46, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xff9f1c, 0x160b2b, 0.45);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffcb69, 1.2);
    keyLight.position.set(4, 7, 4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa51c69, 0.8);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Flame Point Light
    const flamePointLight = new THREE.PointLight(0xff5a1f, 0, 12, 1.8);
    flamePointLight.position.set(0, 1.35, 0.45);
    scene.add(flamePointLight);

    // Warm Flame Secondary Fill Light
    const flameGlowLight = new THREE.PointLight(0xffd166, 0, 8, 1.5);
    flameGlowLight.position.set(0, 1.8, 0.45);
    scene.add(flameGlowLight);

    // 3. Central Diya Assembly (Composite 3D Model: 8 distinct parts)
    const diyaRootGroup = new THREE.Group();
    scene.add(diyaRootGroup);

    // Procedural Clay Bump & Texture
    const clayCanvas = document.createElement('canvas');
    clayCanvas.width = 512;
    clayCanvas.height = 512;
    const cCtx = clayCanvas.getContext('2d');
    if (cCtx) {
      cCtx.fillStyle = '#9C411E';
      cCtx.fillRect(0, 0, 512, 512);

      // Fine terracotta grain
      for (let i = 0; i < 8000; i++) {
        cCtx.fillStyle = Math.random() > 0.5 ? 'rgba(60, 20, 10, 0.08)' : 'rgba(255, 170, 120, 0.08)';
        cCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      // Traditional Indian geometric band carving
      cCtx.strokeStyle = '#D97736';
      cCtx.lineWidth = 6;
      cCtx.beginPath();
      cCtx.arc(256, 256, 200, 0, Math.PI * 2);
      cCtx.stroke();

      // Traditional scalloped floral petals
      cCtx.fillStyle = '#E08544';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
        cCtx.beginPath();
        cCtx.arc(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190, 12, 0, Math.PI * 2);
        cCtx.fill();
      }
    }
    const clayTex = new THREE.CanvasTexture(clayCanvas);
    clayTex.colorSpace = THREE.SRGBColorSpace;
    clayTex.wrapS = THREE.RepeatWrapping;
    clayTex.wrapT = THREE.RepeatWrapping;
    clayTex.repeat.set(2, 1);

    const clayMat = new THREE.MeshStandardMaterial({
      map: clayTex,
      roughness: 0.6,
      metalness: 0.1,
      color: 0xb54d24,
    });

    const polishedGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.22,
      metalness: 0.88,
    });

    // Part 1: Lotus Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.45, 0.18, 48);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, clayMat);
    pedestalMesh.position.y = 0.09;
    pedestalMesh.castShadow = !isSoftwareGl;
    pedestalMesh.receiveShadow = !isSoftwareGl;
    diyaRootGroup.add(pedestalMesh);

    // Part 2: Terracotta Diya Main Body (Lathe Geometry authentic deep curve)
    const lathePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.18),
      new THREE.Vector2(0.9, 0.22),
      new THREE.Vector2(1.5, 0.45),
      new THREE.Vector2(1.9, 0.85),
      new THREE.Vector2(1.75, 1.08),
      new THREE.Vector2(1.5, 0.95),
      new THREE.Vector2(0.85, 0.65),
      new THREE.Vector2(0, 0.55),
    ];
    const bowlGeo = new THREE.LatheGeometry(lathePoints, 64);
    const bowlMesh = new THREE.Mesh(bowlGeo, clayMat);
    bowlMesh.castShadow = !isSoftwareGl;
    bowlMesh.receiveShadow = !isSoftwareGl;
    diyaRootGroup.add(bowlMesh);

    // Part 3: Spout Lip Extension (Pinched beak for the flame)
    const beakGeo = new THREE.ConeGeometry(0.35, 0.65, 16);
    const beakMesh = new THREE.Mesh(beakGeo, clayMat);
    beakMesh.rotation.x = -Math.PI / 3;
    beakMesh.position.set(0, 0.98, 1.62);
    beakMesh.scale.set(1.2, 0.8, 1.4);
    diyaRootGroup.add(beakMesh);

    // Part 4: Embossed Gold Filigree Outer Rim
    const goldRimGeo = new THREE.TorusGeometry(1.78, 0.07, 16, 64);
    const goldRimMesh = new THREE.Mesh(goldRimGeo, polishedGoldMat);
    goldRimMesh.rotation.x = Math.PI / 2;
    goldRimMesh.position.y = 1.05;
    diyaRootGroup.add(goldRimMesh);

    // Part 5: Lotus Petal Accents around Rim (12 gold florets)
    const petalGroup = new THREE.Group();
    const petalGeo = new THREE.SphereGeometry(0.08, 12, 12);
    petalGeo.scale(1, 0.4, 2);
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const floret = new THREE.Mesh(petalGeo, polishedGoldMat);
      floret.position.set(Math.cos(angle) * 1.82, 1.04, Math.sin(angle) * 1.82);
      floret.rotation.y = -angle;
      petalGroup.add(floret);
    }
    diyaRootGroup.add(petalGroup);

    // Part 6: Ghee / Liquid Oil Surface
    const oilGeo = new THREE.CylinderGeometry(1.42, 1.15, 0.08, 36);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xd98218,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    const oilMesh = new THREE.Mesh(oilGeo, oilMat);
    oilMesh.position.set(0, 0.78, 0.2);
    diyaRootGroup.add(oilMesh);

    // Part 7: Braided Cotton Wick (with charred burnt tip resting toward beak)
    const wickCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.74, 0.4),
      new THREE.Vector3(0, 0.88, 1.0),
      new THREE.Vector3(0, 1.05, 1.45),
    ]);
    const wickGeo = new THREE.TubeGeometry(wickCurve, 20, 0.065, 10, false);
    const wickMat = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.95,
      metalness: 0.05,
    });
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    diyaRootGroup.add(wickMesh);

    // Wick Charred Tip Indicator Mesh (for raycasting target)
    const wickTipGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const wickTipMat = new THREE.MeshStandardMaterial({
      color: 0x1f140d,
      roughness: 0.9,
    });
    const wickTipMesh = new THREE.Mesh(wickTipGeo, wickTipMat);
    wickTipMesh.position.set(0, 1.06, 1.46);
    diyaRootGroup.add(wickTipMesh);

    // Part 8: 3D Rangoli Platform Base Disc
    const rangoliCanvas = document.createElement('canvas');
    rangoliCanvas.width = 1024;
    rangoliCanvas.height = 1024;
    const rCtx = rangoliCanvas.getContext('2d');
    if (rCtx) {
      rCtx.fillStyle = '#1A0C30';
      rCtx.fillRect(0, 0, 1024, 1024);

      const cx = 512;
      const cy = 512;

      // Concentric sacred geometry rings
      const rings = [
        { r: 480, col: '#FF5A1F', w: 8 },
        { r: 440, col: '#FFD166', w: 5 },
        { r: 380, col: '#A51C69', w: 10 },
        { r: 320, col: '#FF9F1C', w: 6 },
        { r: 240, col: '#FFD166', w: 8 },
        { r: 160, col: '#FF5A1F', w: 5 },
      ];
      rings.forEach((ring) => {
        rCtx.strokeStyle = ring.col;
        rCtx.lineWidth = ring.w;
        rCtx.beginPath();
        rCtx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        rCtx.stroke();
      });

      // 16-petal lotus mandala
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        rCtx.save();
        rCtx.translate(cx, cy);
        rCtx.rotate(a);

        // Petal shape
        rCtx.fillStyle = i % 2 === 0 ? '#A51C69' : '#FF5A1F';
        rCtx.beginPath();
        rCtx.moveTo(0, 160);
        rCtx.quadraticCurveTo(50, 280, 0, 420);
        rCtx.quadraticCurveTo(-50, 280, 0, 160);
        rCtx.fill();

        // Golden outline
        rCtx.strokeStyle = '#FFD166';
        rCtx.lineWidth = 3;
        rCtx.stroke();

        // Inner jewel dot
        rCtx.fillStyle = '#FFD166';
        rCtx.beginPath();
        rCtx.arc(0, 310, 8, 0, Math.PI * 2);
        rCtx.fill();

        rCtx.restore();
      }
    }
    const rangoliTex = new THREE.CanvasTexture(rangoliCanvas);
    rangoliTex.colorSpace = THREE.SRGBColorSpace;

    const rangoliGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.08, 64);
    const rangoliMat = new THREE.MeshStandardMaterial({
      map: rangoliTex,
      roughness: 0.55,
      metalness: 0.25,
    });
    const rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
    rangoliMesh.position.y = -0.04;
    rangoliMesh.receiveShadow = !isSoftwareGl;
    scene.add(rangoliMesh);

    // Ground Contact Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(10, 3, 20, 0.95)');
      grad.addColorStop(0.5, 'rgba(10, 3, 20, 0.5)');
      grad.addColorStop(1, 'rgba(10, 3, 20, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.09;
    scene.add(shadowPlane);

    // 4. Spark Mesh (Travels to wick when triggered)
    const sparkGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sparkMesh.visible = false;
    scene.add(sparkMesh);

    const sparkHalo = new THREE.PointLight(0xffd166, 2, 4);
    sparkMesh.add(sparkHalo);

    // 5. Realistic Multi-Layer 3D Flame Assembly
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 1.15, 1.46); // Centered at the wick tip
    diyaRootGroup.add(flameGroup);

    // Layer 5A: Subtle Blue Base Core
    const blueBaseGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blueBaseGeo.scale(1, 1.5, 0.8);
    const blueBaseMat = new THREE.MeshBasicMaterial({
      color: 0x0099ff,
      transparent: true,
      opacity: 0.85,
    });
    const blueBaseMesh = new THREE.Mesh(blueBaseGeo, blueBaseMat);
    blueBaseMesh.position.y = 0.08;
    flameGroup.add(blueBaseMesh);

    // Layer 5B: Saffron/Orange Outer Tear-drop Flame
    const outerFlameGeo = new THREE.ConeGeometry(0.32, 1.1, 24);
    outerFlameGeo.translate(0, 0.55, 0); // Pivot at wick base
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.82,
    });
    const outerFlameMesh = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameGroup.add(outerFlameMesh);

    // Layer 5C: Bright Golden Yellow Mid Flame
    const midFlameGeo = new THREE.ConeGeometry(0.22, 0.85, 20);
    midFlameGeo.translate(0, 0.42, 0);
    const midFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.92,
    });
    const midFlameMesh = new THREE.Mesh(midFlameGeo, midFlameMat);
    flameGroup.add(midFlameMesh);

    // Layer 5D: Pure White-Hot Inner Core
    const innerFlameGeo = new THREE.ConeGeometry(0.12, 0.55, 16);
    innerFlameGeo.translate(0, 0.28, 0);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const innerFlameMesh = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    flameGroup.add(innerFlameMesh);

    // Layer 5E: Radial Corona Light Aura Sprite
    const coronaGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const coronaCanvas = document.createElement('canvas');
    coronaCanvas.width = 128;
    coronaCanvas.height = 128;
    const crCtx = coronaCanvas.getContext('2d');
    if (crCtx) {
      const grad = crCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 241, 214, 0.95)');
      grad.addColorStop(0.3, 'rgba(255, 159, 28, 0.6)');
      grad.addColorStop(0.7, 'rgba(165, 28, 105, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      crCtx.fillStyle = grad;
      crCtx.fillRect(0, 0, 128, 128);
    }
    const coronaTex = new THREE.CanvasTexture(coronaCanvas);
    const coronaMat = new THREE.MeshBasicMaterial({
      map: coronaTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    coronaMesh.position.y = 0.45;
    flameGroup.add(coronaMesh);

    // Flame starts completely invisible/unlit
    flameGroup.scale.set(0.001, 0.001, 0.001);

    // 6. Floating Golden Firefly Particles
    const fireflyCount = isSoftwareGl ? 80 : 200;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflySpeeds = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 10;
      fireflyPositions[i * 3 + 1] = Math.random() * 5 - 0.2;
      fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      fireflySpeeds[i] = Math.random() * 0.4 + 0.2;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));

    const fireflyMat = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const fireflySystem = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflySystem);

    // 7. Interactive Mouse / Touch Orbital Dragging
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

    // 8. Lighting Activation Function
    const triggerLightingSequence = () => {
      if (stateRef.current.isLit || isIgniting) return;
      setIsIgniting(true);
      setInstructionText('Awakening the sacred flame...');

      soundManager.playClick();

      // Setup spark starting position
      sparkMesh.visible = true;
      sparkMesh.position.set(0.6, 2.8, 1.8);

      let startTime = performance.now();

      // Spark descent and ignition sequence
      const runIgnition = () => {
        const elapsed = (performance.now() - startTime) / 1000;

        if (elapsed < 0.9) {
          // Spark swoops toward wick tip (0, 1.06, 1.46)
          const t = elapsed / 0.9;
          const easeT = t * t * (3 - 2 * t);

          sparkMesh.position.x = THREE.MathUtils.lerp(0.6, 0, easeT);
          sparkMesh.position.y = THREE.MathUtils.lerp(2.8, 1.12, easeT);
          sparkMesh.position.z = THREE.MathUtils.lerp(1.8, 1.46, easeT);
          sparkHalo.intensity = 2.5 + Math.sin(elapsed * 20) * 1;

          requestAnimationFrame(runIgnition);
        } else {
          // Wick catches fire!
          sparkMesh.visible = false;
          stateRef.current.isLit = true;
          soundManager.playLightingFlourish();

          // Camera zooms gently closer into the flame
          let flameStartTime = performance.now();

          const expandFlame = () => {
            const fElapsed = (performance.now() - flameStartTime) / 1000;
            const progress = Math.min(fElapsed / 1.5, 1);
            stateRef.current.lightingProgress = progress;

            // Environmental illumination expansion
            flamePointLight.intensity = progress * 7.5;
            flameGlowLight.intensity = progress * 4.0;
            coronaMat.opacity = progress * 0.9;
            ambientLight.color.setHSL(0.08, 0.85, 0.15 + progress * 0.3);

            // Camera moves closer
            if (fElapsed > 1.2 && !stateRef.current.isTransitioning) {
              stateRef.current.isTransitioning = true;

              // Golden flash expansion
              let flashStart = performance.now();
              const runFlash = () => {
                const flashElapsed = (performance.now() - flashStart) / 1000;
                if (flashElapsed < 0.6) {
                  setFlashOpacity(Math.min(flashElapsed / 0.6, 1));
                  requestAnimationFrame(runFlash);
                } else {
                  // Transition to main celebration with grand fanfare
                  soundManager.playRevealCelebration();
                  onUnlocked();
                }
              };
              runFlash();
            }

            if (progress < 1) {
              requestAnimationFrame(expandFlame);
            }
          };

          expandFlame();
        }
      };

      runIgnition();
    };

    // Click handler on canvas directly
    const handleCanvasClick = (e: MouseEvent) => {
      // Don't trigger if user was dragging
      if (Math.abs(stateRef.current.rotVelocity.y) > 0.02) return;
      triggerLightingSequence();
    };

    container.addEventListener('click', handleCanvasClick);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Master Animation Loop
    let clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Damped Rotation
      if (!stateRef.current.pointerDown) {
        stateRef.current.rotVelocity.y = THREE.MathUtils.damp(
          stateRef.current.rotVelocity.y,
          0.004,
          1.5,
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

      diyaRootGroup.rotation.y = stateRef.current.rotation.y;
      diyaRootGroup.rotation.x = stateRef.current.rotation.x;

      // Keep Rangoli disc aligned horizontally
      rangoliMesh.rotation.y = stateRef.current.rotation.y * 0.5;

      // Dynamic Flame Flicker
      if (stateRef.current.isLit) {
        const growth = stateRef.current.lightingProgress;
        const flick = 1 + Math.sin(time * 16) * 0.06 + Math.cos(time * 24) * 0.04;
        const swayX = Math.sin(time * 12) * 0.05;
        const swayZ = Math.cos(time * 10) * 0.05;

        flameGroup.scale.set(growth * flick, growth * flick * 1.15, growth * flick);
        flameGroup.rotation.x = swayX;
        flameGroup.rotation.z = swayZ;

        flamePointLight.intensity = growth * 7.5 * flick;
        flameGlowLight.intensity = growth * 4.0 * flick;
      }

      // Fireflies rising
      const posArray = fireflyGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        posArray[i * 3 + 1] += delta * fireflySpeeds[i];
        if (posArray[i * 3 + 1] > 5) {
          posArray[i * 3 + 1] = -0.2;
        }
      }
      fireflyGeo.attributes.position.needsUpdate = true;

      // If transitioning, camera zooms smoothly into the flame
      if (stateRef.current.isTransitioning) {
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 2.2, 2.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.4, 2.5, delta);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      container.removeEventListener('click', handleCanvasClick);

      renderer.dispose();
      clayTex.dispose();
      rangoliTex.dispose();
      shadowTex.dispose();
      coronaTex.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onUnlocked, isIgniting]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#160B2B] select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-pointer active:cursor-grabbing w-full h-full"
        title="Click or drag to interact with the 3D Diya"
      />

      {/* Golden Flash Transition Overlay */}
      <div
        className="absolute inset-0 bg-[#FFD166] pointer-events-none transition-opacity duration-300 z-50"
        style={{ opacity: flashOpacity }}
      />

      {/* Top Minimalist Brand Header */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-20">
        <h1 className="text-xs sm:text-sm uppercase tracking-[0.4em] font-serif text-[#FFD166]/90 drop-shadow-[0_0_12px_rgba(255,209,102,0.4)]">
          THE FESTIVAL OF LIGHTS
        </h1>
      </div>

      {/* Bottom Minimalist Lighting Instruction */}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-20 px-4">
        <div className="px-6 py-3 rounded-full bg-[#160B2B]/75 border border-[#FFD166]/30 backdrop-blur-md shadow-[0_0_25px_rgba(255,90,31,0.25)] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF9F1C] shadow-[0_0_10px_#FFD166] animate-pulse" />
          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#FFF1D6] font-sans">
            {instructionText}
          </p>
        </div>
        <p className="text-[10px] text-[#FFF1D6]/40 mt-2 tracking-wider uppercase font-light">
          Drag to rotate · Touch to ignite
        </p>
      </div>
    </div>
  );
};

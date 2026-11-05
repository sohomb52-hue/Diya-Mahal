import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../utils/audio';

interface DiyaCanvasProps {
  scrollProgress: number; // 0 to 1
  onLitComplete?: () => void;
}

export const DiyaCanvas: React.FC<DiyaCanvasProps> = ({ scrollProgress, onLitComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const litTriggeredRef = useRef(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as required by Three.js skill
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

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x160b2b, 0.08);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.8, 6.5);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x38145e, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd166, 0.8);
    keyLight.position.set(4, 8, 5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xa51c69, 0x160b2b, 0.5);
    scene.add(fillLight);

    // Diya Flame Dynamic Point Light
    const flameLight = new THREE.PointLight(0xff5a1f, 0, 10);
    flameLight.position.set(0, 0.95, 0.3);
    if (!isSoftwareGl) {
      flameLight.castShadow = true;
      flameLight.shadow.bias = -0.001;
    }
    scene.add(flameLight);

    // Diya Group Construction
    const diyaGroup = new THREE.Group();
    scene.add(diyaGroup);

    // 1. Procedural Clay Material (Terracotta Gold/Brown with warm bump texture)
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 256;
    canvasTex.height = 256;
    const ctx = canvasTex.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#8B3A1C';
      ctx.fillRect(0, 0, 256, 256);
      // Traditional mandala pattern engravings on clay
      ctx.strokeStyle = '#D47A3E';
      ctx.lineWidth = 3;
      for (let i = 0; i < 256; i += 32) {
        ctx.beginPath();
        ctx.arc(128, 128, i, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 + Math.cos(angle) * 128, 128 + Math.sin(angle) * 128);
        ctx.stroke();
      }
    }
    const clayTexture = new THREE.CanvasTexture(canvasTex);
    clayTexture.colorSpace = THREE.SRGBColorSpace;
    clayTexture.wrapS = THREE.RepeatWrapping;
    clayTexture.wrapT = THREE.RepeatWrapping;
    clayTexture.repeat.set(2, 1);

    const clayMaterial = new THREE.MeshStandardMaterial({
      map: clayTexture,
      roughness: 0.65,
      metalness: 0.15,
      color: 0xb85228,
    });

    // Clay Bowl Body using Lathe Geometry for authentic curved Diya shape
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 0));       // Center base
    points.push(new THREE.Vector2(0.8, 0.05));  // Base edge
    points.push(new THREE.Vector2(1.5, 0.3));   // Lower flare
    points.push(new THREE.Vector2(1.8, 0.7));   // Mid rim belly
    points.push(new THREE.Vector2(1.6, 0.85));  // Upper lip inner curve
    points.push(new THREE.Vector2(1.4, 0.75));  // Inner bowl dip
    points.push(new THREE.Vector2(0.8, 0.45));  // Bowl center depth
    points.push(new THREE.Vector2(0, 0.4));     // Inner center bottom

    const bowlGeo = new THREE.LatheGeometry(points, 48);
    const bowlMesh = new THREE.Mesh(bowlGeo, clayMaterial);
    bowlMesh.castShadow = !isSoftwareGl;
    bowlMesh.receiveShadow = !isSoftwareGl;
    diyaGroup.add(bowlMesh);

    // Decorative Gold Rim Ring
    const goldRimGeo = new THREE.TorusGeometry(1.65, 0.06, 16, 64);
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.25,
      metalness: 0.85,
    });
    const goldRimMesh = new THREE.Mesh(goldRimGeo, goldMaterial);
    goldRimMesh.rotation.x = Math.PI / 2;
    goldRimMesh.position.y = 0.78;
    diyaGroup.add(goldRimMesh);

    // Diya Oil Surface (Liquid Ghee reflection inside bowl)
    const oilGeo = new THREE.CylinderGeometry(1.35, 1.1, 0.08, 32);
    const oilMaterial = new THREE.MeshStandardMaterial({
      color: 0xd48817,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const oilMesh = new THREE.Mesh(oilGeo, oilMaterial);
    oilMesh.position.set(0, 0.58, 0);
    diyaGroup.add(oilMesh);

    // Cotton Wick sticking out towards nozzle
    const wickGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 16);
    const wickMaterial = new THREE.MeshStandardMaterial({
      color: 0x332211,
      roughness: 0.9,
    });
    const wickMesh = new THREE.Mesh(wickGeo, wickMaterial);
    wickMesh.rotation.z = -Math.PI / 6;
    wickMesh.position.set(0, 0.75, 0.3);
    diyaGroup.add(wickMesh);

    // 2. Spark Mesh (Floating spark moving toward wick)
    const sparkGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xfff1d6,
    });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sparkMesh.position.set(0, 3.5, 0.3);
    scene.add(sparkMesh);

    // Spark aura glow
    const sparkLight = new THREE.PointLight(0xffd166, 0, 4);
    sparkMesh.add(sparkLight);

    // 3. Flame Group (Inner Core + Outer Tear-Drop Flame)
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.92, 0.3);
    diyaGroup.add(flameGroup);

    // Inner Flame Core
    const innerFlameGeo = new THREE.ConeGeometry(0.12, 0.45, 16);
    innerFlameGeo.translate(0, 0.225, 0); // Pivot at base
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const innerFlameMesh = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    flameGroup.add(innerFlameMesh);

    // Outer Golden Flame
    const outerFlameGeo = new THREE.ConeGeometry(0.24, 0.7, 16);
    outerFlameGeo.translate(0, 0.35, 0);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.85,
    });
    const outerFlameMesh = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameGroup.add(outerFlameMesh);

    // Halo Glow Sprite Mesh
    const haloGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const haloCtx = haloCanvas.getContext('2d');
    if (haloCtx) {
      const grad = haloCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 209, 102, 1)');
      grad.addColorStop(0.3, 'rgba(255, 90, 31, 0.6)');
      grad.addColorStop(0.7, 'rgba(165, 28, 105, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      haloCtx.fillStyle = grad;
      haloCtx.fillRect(0, 0, 128, 128);
    }
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.3, 0);
    flameGroup.add(haloMesh);

    flameGroup.scale.set(0.001, 0.001, 0.001); // Unlit initially!

    // 4. Floating Golden Particles (Background Sparkles)
    const particleCount = isSoftwareGl ? 80 : 250;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 1] = Math.random() * 6 - 1;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      particleScales[i] = Math.random() * 0.05 + 0.01;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      sGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      sGrad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      sGrad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    scene.add(shadowPlane);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop Variables
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      const p = scrollRef.current; // Scroll 0 to 1

      // 1. Camera Movement: Zoom closer as user scrolls down
      const targetCamY = THREE.MathUtils.lerp(2.8, 1.8, Math.min(p * 1.5, 1));
      const targetCamZ = THREE.MathUtils.lerp(6.5, 3.8, Math.min(p * 1.5, 1));
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4, delta);
      camera.lookAt(0, 0.4, 0);

      // 2. Diya Slow Idle Rotation
      diyaGroup.rotation.y = time * 0.12;

      // 3. Spark Movement
      // Spark starts high (y=3.5) and descends to wick (y=0.92) between scroll 0.10 and 0.40
      const sparkFactor = THREE.MathUtils.clamp((p - 0.08) / 0.32, 0, 1);
      sparkMesh.position.y = THREE.MathUtils.lerp(3.5, 0.95, sparkFactor);
      sparkMesh.position.x = Math.sin(time * 3) * 0.05 * (1 - sparkFactor);
      sparkLight.intensity = sparkFactor > 0 && sparkFactor < 1 ? 1.5 : 0;
      sparkMesh.visible = sparkFactor < 0.95;

      // 4. Flame Ignition & Growth
      // Flame starts catching fire at scroll >= 0.35, fully lit by 0.65
      const flameGrowth = THREE.MathUtils.clamp((p - 0.30) / 0.35, 0, 1);

      if (flameGrowth > 0.05) {
        // Trigger sound once when lit!
        if (!litTriggeredRef.current) {
          litTriggeredRef.current = true;
          soundManager.playIgnite();
          if (onLitComplete) onLitComplete();
        }

        // Flame Flicker & Scaling
        const flicker = 1 + Math.sin(time * 18) * 0.06 + Math.cos(time * 24) * 0.04;
        const currentScale = flameGrowth * flicker;
        flameGroup.scale.set(currentScale, currentScale * 1.15, currentScale);

        // Light Intensity & Warm Halo
        flameLight.intensity = flameGrowth * 6.5 * flicker;
        haloMat.opacity = flameGrowth * 0.85;

        // Ambient environment glow brightens
        ambientLight.color.setHSL(0.08, 0.8, 0.2 + flameGrowth * 0.25);
      } else {
        flameGroup.scale.set(0.001, 0.001, 0.001);
        flameLight.intensity = 0;
        haloMat.opacity = 0;
        litTriggeredRef.current = false;
      }

      // 5. Particle System floating drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += delta * (0.2 + flameGrowth * 0.3); // Rise faster when lit!
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -1;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      clayTexture.dispose();
      haloTex.dispose();
      shadowTex.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      aria-label="3D Interactive Diya Viewport"
    />
  );
};

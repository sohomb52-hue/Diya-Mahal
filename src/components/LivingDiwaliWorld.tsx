import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getLivingWorldScene, calculateHalftoneDotRadius } from '../utils/gameLogic';
import madhubaniCityImg from '../assets/images/madhubani_city_painting_1794029794946.jpg';

interface LivingDiwaliWorldProps {
  isUnlocked: boolean;
}

interface SwayingKandil {
  group: THREE.Group;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
}

interface FloatingPetal {
  mesh: THREE.Mesh;
  speedY: number;
  rotSpeedX: number;
  rotSpeedY: number;
  swayFreq: number;
  initialX: number;
}

export const LivingDiwaliWorld: React.FC<LivingDiwaliWorldProps> = ({ isUnlocked }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentSceneName, setCurrentSceneName] = useState('The Diya Courtyard 🪔');
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    if (!isUnlocked) return;
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

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1021, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.0, 6.2);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;

    container.appendChild(renderer.domElement);

    // 2. World Lighting Setup (Royal Twilight Palace & Vintage Courtyard)
    const ambientLight = new THREE.AmbientLight(0x161c38, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd166, 2.2);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x008c95, 1.2);
    fillLight.position.set(0, -2, 4);
    scene.add(fillLight);

    // 3. SCENE 1 & 3: RANGOLI GARDEN MANDALA BASE DISCS
    const rangoliCanvas = document.createElement('canvas');
    rangoliCanvas.width = 1024;
    rangoliCanvas.height = 1024;
    const rCtx = rangoliCanvas.getContext('2d');
    if (rCtx) {
      rCtx.fillStyle = '#160B2B';
      rCtx.fillRect(0, 0, 1024, 1024);

      const cx = 512;
      const cy = 512;

      // Concentric Rings
      const rings = [
        { r: 480, col: '#FFB000', w: 10 },
        { r: 420, col: '#E91E63', w: 8 },
        { r: 340, col: '#20C9C3', w: 6 },
        { r: 240, col: '#FF5722', w: 6 },
      ];
      rings.forEach((ring) => {
        rCtx.strokeStyle = ring.col;
        rCtx.lineWidth = ring.w;
        rCtx.beginPath();
        rCtx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        rCtx.stroke();
      });

      // 16 Petals
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        rCtx.save();
        rCtx.translate(cx, cy);
        rCtx.rotate(a);

        rCtx.fillStyle = i % 2 === 0 ? '#E91E63' : '#008C95';
        rCtx.beginPath();
        rCtx.moveTo(0, 140);
        rCtx.quadraticCurveTo(50, 260, 0, 420);
        rCtx.quadraticCurveTo(-50, 260, 0, 140);
        rCtx.fill();

        rCtx.strokeStyle = '#FFF1D6';
        rCtx.lineWidth = 3;
        rCtx.stroke();

        rCtx.restore();
      }
    }
    const rangoliTex = new THREE.CanvasTexture(rangoliCanvas);
    rangoliTex.colorSpace = THREE.SRGBColorSpace;

    const rangoliGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.1, 64);
    const rangoliMat = new THREE.MeshStandardMaterial({
      map: rangoliTex,
      roughness: 0.5,
      metalness: 0.2,
    });
    const floorRangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
    floorRangoliMesh.position.set(0, -0.05, 0);
    scene.add(floorRangoliMesh);

    // 4. SCENE 2: FESTIVE STREET & SWAYING KANDILS (STAR LANTERNS)
    const kandilGroup = new THREE.Group();
    scene.add(kandilGroup);

    const swayingKandils: SwayingKandil[] = [];
    const kandilColors = [0xd4af37, 0xa8422b, 0x008c95, 0xffb74d];

    for (let i = 0; i < (isSoftwareGl ? 6 : 14); i++) {
      const kGroup = new THREE.Group();
      const col = kandilColors[i % kandilColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.3,
        metalness: 0.7,
      });

      // Octahedron lantern body
      const bodyGeo = new THREE.OctahedronGeometry(0.35, 0);
      const bodyMesh = new THREE.Mesh(bodyGeo, mat);
      kGroup.add(bodyMesh);

      // Hanging tassel streamers
      const tasselGeo = new THREE.ConeGeometry(0.18, 0.45, 8);
      tasselGeo.rotateX(Math.PI);
      tasselGeo.translate(0, -0.35, 0);
      const tasselMesh = new THREE.Mesh(tasselGeo, mat);
      kGroup.add(tasselMesh);

      // Inner glow light
      const pLight = new THREE.PointLight(col, 0.6, 3);
      kGroup.add(pLight);

      // Position along festive street columns
      const bx = (i % 2 === 0 ? 1 : -1) * (3.5 + Math.random() * 1.5);
      const by = 2.5 + Math.random() * 2.0;
      const bz = -i * 1.8 + 2;

      kGroup.position.set(bx, by, bz);
      kandilGroup.add(kGroup);

      swayingKandils.push({
        group: kGroup,
        baseX: bx,
        baseY: by,
        baseZ: bz,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 5. SCENE 4: CITY OF LIGHTS (3D DETAILED MADHUBANI CITY PAINTING BACKDROP)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const texLoader = new THREE.TextureLoader();
    const madhubaniCityTex = texLoader.load(madhubaniCityImg);
    madhubaniCityTex.colorSpace = THREE.SRGBColorSpace;

    // 3D Panoramic Backdrop Wall featuring the Detailed Madhubani City Painting
    const cityBackdropGeo = new THREE.PlaneGeometry(32, 18);
    const cityBackdropMat = new THREE.MeshStandardMaterial({
      map: madhubaniCityTex,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const cityBackdropMesh = new THREE.Mesh(cityBackdropGeo, cityBackdropMat);
    cityBackdropMesh.position.set(0, 4.5, -11.5);
    cityGroup.add(cityBackdropMesh);

    // Flanking 3D Haveli Facades textured with Madhubani artwork for stereoscopic depth
    const windowLights: THREE.Mesh[] = [];
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });

    for (let b = 0; b < (isSoftwareGl ? 6 : 12); b++) {
      const bw = 1.4 + Math.random() * 0.8;
      const bh = 3.0 + Math.random() * 3.5;
      const bd = 1.2 + Math.random() * 0.8;

      const bGeo = new THREE.BoxGeometry(bw, bh, bd);
      const bMat = new THREE.MeshStandardMaterial({
        map: madhubaniCityTex,
        roughness: 0.6,
        metalness: 0.1,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);

      const bx = (b % 2 === 0 ? 1 : -1) * (4.5 + Math.random() * 2);
      const by = bh / 2 - 2;
      const bz = -b * 2.0 - 1;

      bMesh.position.set(bx, by, bz);
      cityGroup.add(bMesh);

      // Add glowing windows on buildings
      for (let wy = 0.5; wy < bh - 0.5; wy += 0.9) {
        const wGeo = new THREE.PlaneGeometry(0.24, 0.35);
        const wMesh = new THREE.Mesh(wGeo, windowMat);
        wMesh.position.set(bx > 0 ? bx - bw / 2 - 0.01 : bx + bw / 2 + 0.01, by - bh / 2 + wy, bz);
        wMesh.rotation.y = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
        cityGroup.add(wMesh);
        windowLights.push(wMesh);
      }
    }

    // 6. SCENE 5: FESTIVAL NIGHT SKY & SKY LANTERNS
    const skyLanternsGroup = new THREE.Group();
    scene.add(skyLanternsGroup);

    const skyLanterns: Array<{ mesh: THREE.Group; speedY: number; phase: number }> = [];
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0xff8f00,
      emissiveIntensity: 0.5,
    });

    for (let l = 0; l < (isSoftwareGl ? 10 : 25); l++) {
      const lGroup = new THREE.Group();
      const lGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.5, 12);
      const lMesh = new THREE.Mesh(lGeo, lanternMat);
      lGroup.add(lMesh);

      const lx = (Math.random() - 0.5) * 16;
      const ly = Math.random() * 12 + 2;
      const lz = -Math.random() * 15 - 2;

      lGroup.position.set(lx, ly, lz);
      skyLanternsGroup.add(lGroup);

      skyLanterns.push({
        mesh: lGroup,
        speedY: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 7. FLOATING MARIGOLD & LOTUS PETALS DEPTH LAYER
    const petalGroup = new THREE.Group();
    scene.add(petalGroup);

    const petalCount = isSoftwareGl ? 20 : 50;
    const floatingPetals: FloatingPetal[] = [];
    const petalGeo = new THREE.SphereGeometry(0.1, 10, 8);
    petalGeo.scale(1.2, 0.22, 1.8);

    const petalColors = [0xd4af37, 0xffb74d, 0xa8422b, 0xe5c158, 0x008c95];

    for (let p = 0; p < petalCount; p++) {
      const col = petalColors[p % petalColors.length];
      const pMat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const pMesh = new THREE.Mesh(petalGeo, pMat);

      const px = (Math.random() - 0.5) * 14;
      const py = Math.random() * 10 - 1;
      const pz = (Math.random() - 0.5) * 10;

      pMesh.position.set(px, py, pz);
      pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      petalGroup.add(pMesh);

      floatingPetals.push({
        mesh: pMesh,
        speedY: 0.15 + Math.random() * 0.25,
        rotSpeedX: (Math.random() - 0.5) * 1.4,
        rotSpeedY: (Math.random() - 0.5) * 1.6,
        swayFreq: 0.8 + Math.random() * 1.2,
        initialX: px,
      });
    }

    // 8. FOREGROUND MARIGOLD GARLANDS (High-Speed Parallax Foreground Layer)
    const garlandGroup = new THREE.Group();
    scene.add(garlandGroup);
    const baseGarlandY = 3.6;
    garlandGroup.position.set(0, baseGarlandY, 4.5);

    const marigoldColors = [0xffb000, 0xff8f00, 0xe63946, 0xffb000, 0x2e9d50];
    const flowerGeo = new THREE.DodecahedronGeometry(0.14, 1);

    // Draped top arch garland
    const garlandFlowerCount = isSoftwareGl ? 20 : 36;
    for (let i = 0; i <= garlandFlowerCount; i++) {
      const t = i / garlandFlowerCount;
      const x = (t - 0.5) * 14;
      const y = Math.pow(t - 0.5, 2) * 2.5 - 0.4;
      const z = Math.sin(t * Math.PI) * 0.5;

      const col = marigoldColors[i % marigoldColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.5,
        metalness: 0.1,
      });
      const fMesh = new THREE.Mesh(flowerGeo, mat);
      fMesh.position.set(x, y, z);
      fMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      garlandGroup.add(fMesh);
    }

    // Left and Right hanging vertical garland strings
    for (const side of [-5.8, 5.8]) {
      const stringLength = isSoftwareGl ? 10 : 18;
      for (let j = 0; j < stringLength; j++) {
        const y = -j * 0.32;
        const x = side + Math.sin(j * 0.5) * 0.1;
        const z = Math.cos(j * 0.4) * 0.15;
        const col = marigoldColors[j % marigoldColors.length];
        const mat = new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.5,
          metalness: 0.1,
        });
        const fMesh = new THREE.Mesh(flowerGeo, mat);
        fMesh.position.set(x, y, z);
        garlandGroup.add(fMesh);
      }
    }

    const baseCityY = 0;
    const baseSkyY = 0;

    // 9. SCROLL POSITION EVENT TRACKER
    const updateScrollProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = progress;

      const sceneInfo = getLivingWorldScene(progress);
      setCurrentSceneName(sceneInfo.sceneName);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 10. RESIZE HANDLING
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 11. ANIMATION LOOP: SCROLL-DRIVEN 3D CAMERA & PARALLAX TRANSFORMATION
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();
      const progress = scrollProgressRef.current;

      const sceneInfo = getLivingWorldScene(progress);

      // Smoothly Damp Camera Position & Orientation based on Scroll Scene
      const targetCamY = sceneInfo.cameraY + Math.sin(time * 0.5) * 0.2;
      const targetCamZ = sceneInfo.cameraZ + Math.cos(time * 0.3) * 0.2;
      const targetCamX = Math.sin(time * 0.4) * 0.35;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 2.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 2.5, delta);
      camera.lookAt(0, 0.5 + progress * 2.5, 0);

      // --- MULTI-TIER PARALLAX SCROLL LOGIC ---
      // 1. Foreground Marigold Garlands move fast relative to scroll
      const fgParallaxY = -progress * 8.5;
      garlandGroup.position.y = THREE.MathUtils.damp(
        garlandGroup.position.y,
        baseGarlandY + fgParallaxY + Math.sin(time * 0.8) * 0.06,
        3.0,
        delta
      );
      garlandGroup.position.x = THREE.MathUtils.damp(
        garlandGroup.position.x,
        Math.sin(time * 0.5) * 0.15,
        3.0,
        delta
      );

      // 2. Background City Silhouettes move at a slower, distant rate
      const bgParallaxY = progress * 2.8;
      cityGroup.position.y = THREE.MathUtils.damp(
        cityGroup.position.y,
        baseCityY + bgParallaxY,
        3.0,
        delta
      );

      // 3. Distant Night Sky Lanterns move at subtle horizon speed
      const skyParallaxY = progress * 1.2;
      skyLanternsGroup.position.y = THREE.MathUtils.damp(
        skyLanternsGroup.position.y,
        baseSkyY + skyParallaxY,
        3.0,
        delta
      );

      // Smooth Light Intensity Transformation
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, sceneInfo.lightIntensity, 2.0, delta);
      ambientLight.color.set(sceneInfo.bgGlowColor);

      // Rotate Floor Rangoli
      floorRangoliMesh.rotation.y += 0.004;

      // Animate Swaying Kandil Star Lanterns
      swayingKandils.forEach((k) => {
        k.group.position.x = k.baseX + Math.sin(time * 1.5 + k.phase) * 0.25;
        k.group.position.y = k.baseY + Math.cos(time * 1.2 + k.phase) * 0.15;
        k.group.rotation.z = Math.sin(time * 1.8 + k.phase) * 0.15;
      });

      // Animate Ascending Sky Lanterns
      skyLanterns.forEach((sl) => {
        sl.mesh.position.y += sl.speedY * delta;
        sl.mesh.position.x += Math.sin(time * 0.8 + sl.phase) * 0.015;
        if (sl.mesh.position.y > 15) {
          sl.mesh.position.y = -1;
        }
      });

      // Animate Floating Petals with parallax depth drift
      floatingPetals.forEach((fp) => {
        fp.mesh.position.y -= fp.speedY * delta;
        fp.mesh.position.x = fp.initialX + Math.sin(time * fp.swayFreq) * 0.4;
        fp.mesh.rotation.x += fp.rotSpeedX * delta;
        fp.mesh.rotation.y += fp.rotSpeedY * delta;

        if (fp.mesh.position.y < -2) {
          fp.mesh.position.y = 10;
        }
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      rangoliTex.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isUnlocked]);

  if (!isUnlocked) return null;

  return (
    <>
      {/* Fixed 3D World Canvas in Background */}
      <div
        ref={mountRef}
        className="fixed inset-0 pointer-events-none w-full h-full z-0 opacity-85 transition-opacity duration-1000"
      />

      {/* Floating Scene Location Badge (Top-Left under Header) */}
      <div className="fixed top-20 left-4 z-40 pointer-events-none transition-all duration-300">
        <div className="px-3.5 py-1.5 rounded-full bg-[#0B1021]/92 border border-[#D4AF37]/35 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center gap-2 text-xs font-bold text-[#E5C158]">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span>{currentSceneName}</span>
        </div>
      </div>
    </>
  );
};

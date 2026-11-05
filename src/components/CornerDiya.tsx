import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CornerDiyaProps {
  onReplayOpening: () => void;
}

export const CornerDiya: React.FC<CornerDiyaProps> = ({ onReplayOpening }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 110;
    const height = 110;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Warm Lights
    const ambientLight = new THREE.AmbientLight(0x38145e, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd166, 1.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const flameLight = new THREE.PointLight(0xff5a1f, 3.5, 5);
    flameLight.position.set(0, 0.85, 0.5);
    scene.add(flameLight);

    // Miniature Diya Model
    const diyaGroup = new THREE.Group();
    scene.add(diyaGroup);

    const clayMat = new THREE.MeshStandardMaterial({
      color: 0xb54d24,
      roughness: 0.5,
      metalness: 0.2,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.2,
      metalness: 0.85,
    });

    // Bowl
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.05),
      new THREE.Vector2(0.5, 0.1),
      new THREE.Vector2(0.9, 0.35),
      new THREE.Vector2(1.1, 0.65),
      new THREE.Vector2(0.95, 0.75),
      new THREE.Vector2(0, 0.45),
    ];
    const bowlMesh = new THREE.Mesh(new THREE.LatheGeometry(points, 28), clayMat);
    diyaGroup.add(bowlMesh);

    // Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.05, 12, 32), goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.72;
    diyaGroup.add(rim);

    // Flame
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.78, 0.6);
    diyaGroup.add(flameGroup);

    const flameOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.65, 16),
      new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.85 })
    );
    flameOuter.geometry.translate(0, 0.32, 0);
    flameGroup.add(flameOuter);

    const flameInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.4, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    flameInner.geometry.translate(0, 0.2, 0);
    flameGroup.add(flameInner);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      diyaGroup.rotation.y = time * 0.4;

      const flick = 1 + Math.sin(time * 15) * 0.08;
      flameGroup.scale.set(flick, flick * 1.1, flick);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleClick = () => {
    soundManager.playIgnite();
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip options when clicked */}
      {showTooltip && (
        <div className="mb-2 p-3 rounded-2xl bg-[#160B2B]/95 border border-[#FFD166]/40 backdrop-blur-md shadow-2xl text-xs text-[#FFF1D6] animate-fade-in flex flex-col gap-2 max-w-[190px]">
          <div className="flex items-center gap-1.5 text-[#FFD166] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
            <span>The Sacred Diya</span>
          </div>
          <p className="text-[11px] text-[#FFF1D6]/75 leading-tight">
            The light within continues to glow bright.
          </p>
          <button
            onClick={() => {
              setShowTooltip(false);
              onReplayOpening();
            }}
            className="mt-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#FF9F1C] text-[#160B2B] font-bold text-[11px] flex items-center justify-center gap-1.5 hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay Opening</span>
          </button>
        </div>
      )}

      {/* 3D Diya Button Badge */}
      <div
        onClick={handleClick}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#160B2B]/85 border-2 border-[#FFD166]/50 shadow-[0_0_25px_rgba(255,209,102,0.35)] hover:shadow-[0_0_35px_rgba(255,90,31,0.6)] hover:scale-105 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center group"
        title="Interactive 3D Diya · Click for options"
      >
        <div ref={mountRef} className="w-full h-full pointer-events-none" />
      </div>
    </div>
  );
};

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
    const ambientLight = new THREE.AmbientLight(0x0f1b2b, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffb000, 1.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const flameLight = new THREE.PointLight(0xff5722, 3.5, 5);
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
      color: 0xffb000,
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
    const bowlGeo = new THREE.LatheGeometry(points, 28);
    const bowlMesh = new THREE.Mesh(bowlGeo, clayMat);
    diyaGroup.add(bowlMesh);

    // Ink outline for miniature Diya
    const inkMat = new THREE.MeshBasicMaterial({ color: 0x0f1126, side: THREE.BackSide });
    const bowlOutline = new THREE.Mesh(bowlGeo, inkMat);
    bowlOutline.scale.set(1.05, 1.05, 1.05);
    bowlMesh.add(bowlOutline);

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
      new THREE.MeshBasicMaterial({ color: 0xe63946, transparent: true, opacity: 0.85 })
    );
    flameOuter.geometry.translate(0, 0.32, 0);
    flameGroup.add(flameOuter);

    const flameInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.4, 12),
      new THREE.MeshBasicMaterial({ color: 0xffb000 })
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
        <div className="mb-2 p-3 rounded-2xl bg-[#0F1126]/95 border border-[#008C95]/50 backdrop-blur-md shadow-2xl text-xs text-[#FFF1D6] animate-fade-in flex flex-col gap-2 max-w-[190px]">
          <div className="flex items-center gap-1.5 text-[#FFB000] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#20C9C3]" />
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
            className="mt-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E91E63] to-[#FF5722] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay Opening</span>
          </button>
        </div>
      )}

      {/* 3D Diya Button Badge */}
      <div
        onClick={handleClick}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0F1126]/90 border-2 border-[#008C95]/50 shadow-[0_0_25px_rgba(32,201,195,0.35)] hover:shadow-[0_0_35px_rgba(233,30,99,0.6)] hover:scale-105 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center group"
        title="Interactive 3D Diya · Click for options"
      >
        <div ref={mountRef} className="w-full h-full pointer-events-none" />
      </div>
    </div>
  );
};

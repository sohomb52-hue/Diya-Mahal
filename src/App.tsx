import React, { useState, useEffect } from 'react';
import { OpeningDiyaScreen } from './components/OpeningDiyaScreen';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { SparkCursor } from './components/SparkCursor';
import { BigRevealSection } from './components/BigRevealSection';
import { PalaceDoorWorld } from './components/PalaceDoorWorld';
import { CornerDiya } from './components/CornerDiya';
import { LivingDiwaliWorld } from './components/LivingDiwaliWorld';
import { soundManager } from './utils/audio';
import { AmbientThemeId, getAmbientThemeConfig } from './utils/gameLogic';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  });

  const [ambientTheme, setAmbientTheme] = useState<AmbientThemeId>(() => {
    try {
      const saved = sessionStorage.getItem('diwali_ambient_theme');
      if (saved) return saved as AmbientThemeId;
    } catch {
      // safe fallback
    }
    return 'midnight';
  });

  const handleThemeChange = (newTheme: AmbientThemeId) => {
    setAmbientTheme(newTheme);
    try {
      sessionStorage.setItem('diwali_ambient_theme', newTheme);
    } catch {
      // safe fallback
    }
  };

  // Auto-initiate ambient soundscape on first user touch/click
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!soundManager.isMuted) {
        soundManager.startFestiveMusic();
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleUnlocked = () => {
    setIsUnlocked(true);
    soundManager.setScene('main');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleRestartExperience = () => {
    setIsUnlocked(false);
    soundManager.setScene('opening');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const themeConfig = getAmbientThemeConfig(ambientTheme);

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-b ${themeConfig.gradient} text-[#FFF1D6] selection:bg-[#E91E63] selection:text-white pb-20 transition-colors duration-700`}
    >
      {/* Custom Glowing Spark Cursor on Desktop */}
      <SparkCursor />

      {/* Living 3D Diwali World Background Canvas */}
      <LivingDiwaliWorld isUnlocked={isUnlocked} />

      {!isUnlocked ? (
        /* 1. The Opening Gateway Screen — 3D Clay Diya & Physical Gate Sequence */
        <OpeningDiyaScreen onUnlocked={handleUnlocked} />
      ) : (
        /* 2. The Main 3D Diwali Palace World — Explorable 6 Door Corridor */
        <main className="relative animate-fade-in z-10">
          {/* Floating Navigation Header */}
          <Header onRestartExperience={handleRestartExperience} />

          {/* Reveal Welcome Banner */}
          <BigRevealSection />

          {/* Continuous 3D Diwali Palace Door Journey */}
          <PalaceDoorWorld onRestartExperience={handleRestartExperience} />

          {/* Interactive Corner Diya */}
          <CornerDiya onReplayOpening={handleRestartExperience} />
        </main>
      )}

      {/* Persistent Bottom Navigation Bar with Audio & Ambient Theme Selector */}
      <BottomNavBar
        isUnlocked={isUnlocked}
        onRestartExperience={isUnlocked ? handleRestartExperience : undefined}
        currentTheme={ambientTheme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}

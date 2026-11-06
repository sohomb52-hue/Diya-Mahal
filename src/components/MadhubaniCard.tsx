import React from 'react';

/**
 * Authentic Madhubani (Mithila) Corner Spandrel SVG
 * Traditional double-line ink drawing with sacred lotus petal,
 * katchni hatching, and vermilion/turmeric accents.
 */
export const MadhubaniCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position, className = '', size = 38 }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-1 left-1';
      case 'top-right':
        return 'top-1 right-1';
      case 'bottom-left':
        return 'bottom-1 left-1';
      case 'bottom-right':
        return 'bottom-1 right-1';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} pointer-events-none z-10 ${className}`}
      style={{ width: size, height: size, transform: getTransform() }}
    >
      <svg
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
      >
        {/* Outer Corner Double-Line Ink Border */}
        <path
          d="M2,46 L2,8 C2,4.68 4.68,2 8,2 L46,2"
          stroke="#211A17"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M2,46 L2,8 C2,4.68 4.68,2 8,2 L46,2"
          stroke="#E8B947"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M6,40 L6,12 C6,8.68 8.68,6 12,6 L40,6"
          stroke="#A82420"
          strokeWidth="1.5"
          strokeDasharray="2,2"
        />

        {/* Traditional Mithila Corner Lotus Petal & Eye (Kamal) */}
        <path
          d="M7,7 Q24,9 28,28 Q9,24 7,7 Z"
          fill="#A82420"
          stroke="#211A17"
          strokeWidth="1.5"
        />
        <path
          d="M10,10 Q20,12 23,23 Q12,20 10,10 Z"
          fill="#E8B947"
          stroke="#211A17"
          strokeWidth="1"
        />

        {/* Central Lotus Seed / Bindi */}
        <circle cx="15" cy="15" r="3.5" fill="#FFF8E7" stroke="#211A17" strokeWidth="1" />
        <circle cx="15" cy="15" r="1.5" fill="#A82420" />

        {/* Fine Katchni Hatching Lines radiating from corner */}
        <line x1="12" y1="2" x2="2" y2="12" stroke="#211A17" strokeWidth="1" />
        <line x1="18" y1="2" x2="2" y2="18" stroke="#211A17" strokeWidth="1" />
        <line x1="24" y1="2" x2="2" y2="24" stroke="#211A17" strokeWidth="1" />
        <line x1="30" y1="2" x2="2" y2="30" stroke="#E8B947" strokeWidth="1" />

        {/* Decorative Flower Petal Tips */}
        <circle cx="34" cy="5" r="2" fill="#E8B947" stroke="#211A17" strokeWidth="0.8" />
        <circle cx="5" cy="34" r="2" fill="#E8B947" stroke="#211A17" strokeWidth="0.8" />
        <circle cx="28" cy="28" r="2.5" fill="#47764B" stroke="#211A17" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

/**
 * Traditional Madhubani Horizontal Border Pattern (Daant / Fish Scale / Triangular teeth)
 */
export const MadhubaniBorderBand: React.FC<{
  className?: string;
  position?: 'top' | 'bottom';
}> = ({ className = '', position = 'top' }) => {
  return (
    <div
      className={`absolute left-8 right-8 h-2.5 overflow-hidden pointer-events-none z-10 opacity-75 ${
        position === 'top' ? 'top-1' : 'bottom-1'
      } ${className}`}
    >
      <svg
        width="100%"
        height="10"
        viewBox="0 0 400 10"
        preserveAspectRatio="repeat-x"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id={`madhubani-band-${position}`} width="20" height="10" patternUnits="userSpaceOnUse">
          {/* Double line baseline */}
          <line x1="0" y1="1" x2="20" y2="1" stroke="#211A17" strokeWidth="1.5" />
          <line x1="0" y1="2.5" x2="20" y2="2.5" stroke="#E8B947" strokeWidth="1" />
          {/* Triangular alternating teeth */}
          <polygon points="0,3 5,9 10,3" fill="#A82420" stroke="#211A17" strokeWidth="0.8" />
          <polygon points="10,3 15,9 20,3" fill="#47764B" stroke="#211A17" strokeWidth="0.8" />
          <circle cx="5" cy="5" r="0.8" fill="#FFF8E7" />
          <circle cx="15" cy="5" r="0.8" fill="#FFF8E7" />
          {/* Base bottom border */}
          <line x1="0" y1="9.5" x2="20" y2="9.5" stroke="#E8B947" strokeWidth="0.8" />
        </pattern>
        <rect width="100%" height="10" fill={`url(#madhubani-band-${position})`} />
      </svg>
    </div>
  );
};

/**
 * Authentic Madhubani Lotus & Double-Line Divider
 */
export const MadhubaniDivider: React.FC<{
  className?: string;
  variant?: 'gold' | 'terracotta' | 'peacock';
}> = ({ className = '', variant = 'gold' }) => {
  const getColors = () => {
    switch (variant) {
      case 'terracotta':
        return { line: '#A82420', accent: '#E8B947', center: '#C65D38' };
      case 'peacock':
        return { line: '#236C79', accent: '#E8B947', center: '#47764B' };
      default:
        return { line: '#D4AF37', accent: '#A82420', center: '#E8B947' };
    }
  };

  const c = getColors();

  return (
    <div className={`flex items-center justify-center gap-3 my-4 w-full select-none ${className}`}>
      {/* Left Double Line with Hatching */}
      <div className="flex-1 flex flex-col justify-center gap-[2px]">
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#211A17] to-[#211A17]" />
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#E8B947] to-[#E8B947]" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#A82420] to-[#A82420] opacity-80" />
      </div>

      {/* Central Sacred Madhubani Rosette */}
      <div className="relative flex items-center justify-center px-1">
        <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
          {/* Lotus Petals */}
          <path d="M22,2 C27,8 36,12 42,12 C36,12 28,16 22,22 C16,16 8,12 2,12 C8,12 17,8 22,2 Z" fill={c.accent} stroke="#211A17" strokeWidth="1.5" />
          <path d="M22,5 C25,9 31,12 36,12 C31,12 26,15 22,19 C18,15 13,12 8,12 C13,12 19,9 22,5 Z" fill={c.center} stroke="#211A17" strokeWidth="1" />
          {/* Inner Bindu */}
          <circle cx="22" cy="12" r="3.5" fill="#FFF8E7" stroke="#211A17" strokeWidth="1" />
          <circle cx="22" cy="12" r="1.5" fill="#A82420" />
        </svg>
      </div>

      {/* Right Double Line with Hatching */}
      <div className="flex-1 flex flex-col justify-center gap-[2px]">
        <div className="h-[1.5px] bg-gradient-to-l from-transparent via-[#211A17] to-[#211A17]" />
        <div className="h-[2px] bg-gradient-to-l from-transparent via-[#E8B947] to-[#E8B947]" />
        <div className="h-[1px] bg-gradient-to-l from-transparent via-[#A82420] to-[#A82420] opacity-80" />
      </div>
    </div>
  );
};

export interface MadhubaniBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'terracotta' | 'maroon' | 'parchment' | 'dark' | 'peacock';
  cornerSize?: number;
  showBands?: boolean;
  elevation?: 'flat' | 'subtle' | 'deep';
  headerTitle?: string;
  badge?: string;
}

/**
 * Reusable Madhubani Folk Art Box / Card Container
 * Eliminates plain/flat boxes with authentic double-line borders,
 * Mithila lotus corner ornaments, katchni texture, and traditional palette.
 */
export const MadhubaniBox: React.FC<MadhubaniBoxProps> = ({
  children,
  className = '',
  variant = 'maroon',
  cornerSize = 38,
  showBands = true,
  elevation = 'deep',
  headerTitle,
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'terracotta':
        return {
          bg: 'bg-gradient-to-br from-[#3D140C]/96 via-[#290E08]/96 to-[#1B0805]/98 text-[#FFF8E7]',
          innerBorder: 'border-[#E8B947]/70',
          outerBorder: 'border-[#211A17]',
          accentGlow: 'shadow-[0_16px_40px_rgba(20,5,3,0.9),0_0_20px_rgba(198,93,56,0.25)]',
        };
      case 'parchment':
        return {
          bg: 'bg-gradient-to-br from-[#FBF5E8] via-[#F4E6C8] to-[#E9D5AA] text-[#211A17]',
          innerBorder: 'border-[#A82420]/70',
          outerBorder: 'border-[#211A17]',
          accentGlow: 'shadow-[0_14px_35px_rgba(0,0,0,0.4),0_0_15px_rgba(232,185,71,0.3)]',
        };
      case 'peacock':
        return {
          bg: 'bg-gradient-to-br from-[#0B252C]/96 via-[#07191E]/96 to-[#030D10]/98 text-[#FFF8E7]',
          innerBorder: 'border-[#E8B947]/65',
          outerBorder: 'border-[#211A17]',
          accentGlow: 'shadow-[0_16px_40px_rgba(3,13,16,0.9),0_0_20px_rgba(35,108,121,0.3)]',
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-br from-[#120508]/96 via-[#0D0305]/96 to-[#070102]/98 text-[#FFF8E7]',
          innerBorder: 'border-[#E8B947]/60',
          outerBorder: 'border-[#211A17]',
          accentGlow: 'shadow-[0_16px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(232,185,71,0.2)]',
        };
      case 'maroon':
      default:
        return {
          bg: 'bg-gradient-to-br from-[#240A10]/96 via-[#19060A]/96 to-[#0F0305]/98 text-[#FFF8E7]',
          innerBorder: 'border-[#E8B947]/65',
          outerBorder: 'border-[#211A17]',
          accentGlow: 'shadow-[0_18px_45px_rgba(15,3,5,0.9),0_0_25px_rgba(212,175,55,0.25)]',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 ${v.bg} ${v.outerBorder} ${v.accentGlow} ${className}`}
      style={{
        borderWidth: '3.5px',
        borderStyle: 'solid',
      }}
    >
      {/* 1. Fine Inner Double Hairline with Gold / Vermilion Stroke */}
      <div
        className={`absolute inset-2 sm:inset-2.5 rounded-[22px] border-2 ${v.innerBorder} pointer-events-none z-10 opacity-90`}
      />

      {/* 2. Madhubani Katchni Delicate Fine Line Hatching Pattern Overlay */}
      <div className="absolute inset-0 rounded-3xl bg-madhubani-katchni opacity-20 pointer-events-none" />

      {/* 3. Four Handcrafted Madhubani Corner Spandrels (Lotus & Eye Motifs) */}
      <MadhubaniCorner position="top-left" size={cornerSize} />
      <MadhubaniCorner position="top-right" size={cornerSize} />
      <MadhubaniCorner position="bottom-left" size={cornerSize} />
      <MadhubaniCorner position="bottom-right" size={cornerSize} />

      {/* 4. Traditional Geometric Teeth/Sawtooth Border Bands */}
      {showBands && (
        <>
          <MadhubaniBorderBand position="top" />
          <MadhubaniBorderBand position="bottom" />
        </>
      )}

      {/* 5. Optional Traditional Folk Header Ribbon / Badge */}
      {(headerTitle || badge) && (
        <div className="relative z-20 mb-4 text-center">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1A0A0E] border border-[#E8B947]/60 text-[#E8B947] text-[11px] font-bold tracking-widest uppercase mb-1 shadow-sm">
              <span className="text-[#A82420]">🪔</span>
              <span>{badge}</span>
              <span className="text-[#A82420]">🪔</span>
            </div>
          )}
          {headerTitle && (
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-royal-gold-gradient drop-shadow-md">
              {headerTitle}
            </h3>
          )}
          <MadhubaniDivider className="my-2 max-w-xs mx-auto" />
        </div>
      )}

      {/* 6. Children Content Container */}
      <div className="relative z-20 w-full">{children}</div>
    </div>
  );
};

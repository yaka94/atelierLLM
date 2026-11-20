import { useEffect, useState } from 'react';
import type { LumiMood } from '../game/types';

interface LumiMascotSvgProps {
  mood?: LumiMood;
  size?: number;
  className?: string;
  interactive?: boolean;
  onPoke?: () => void;
}

/**
 * Animated friendly brass-and-porcelain storybook robot mascot ("Lumi")
 * matching the atelier illustration palette, with live eye-blink, expressive faces,
 * and joyful hover/click animations for children 5+.
 */
export function LumiMascotSvg({
  mood = 'happy',
  size = 156,
  className = '',
  interactive = false,
  onPoke,
}: LumiMascotSvgProps) {
  const [blinking, setBlinking] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 160);
    }, 3400);
    return () => window.clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    setBouncing(true);
    window.setTimeout(() => setBouncing(false), 320);
    onPoke?.();
  };

  const antennaGlow =
    mood === 'celebrating'
      ? '#F59E0B'
      : mood === 'curious'
      ? '#38BDF8'
      : mood === 'thinking'
      ? '#A78BFA'
      : mood === 'story'
      ? '#34D399'
      : '#FBBF24';

  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-200 ${
        bouncing ? 'scale-110 -translate-y-2' : 'scale-100'
      } ${className}`}
      aria-hidden={interactive ? undefined : true}
    >
      {/* Soft warm shadow */}
      <ellipse cx="90" cy="176" rx="44" ry="8" fill="#131D38" fillOpacity="0.14" />

      {/* Antenna */}
      <line x1="90" y1="36" x2="90" y2="18" stroke="#8C5D23" strokeWidth="4" strokeLinecap="round" />
      <circle cx="90" cy="14" r="9" fill={antennaGlow} stroke="#784B14" strokeWidth="2.5" />
      <circle cx="87" cy="11" r="2.5" fill="#FFFBEB" />

      {/* Ears / brass dials */}
      <rect x="30" y="64" width="12" height="24" rx="5" fill="#D99B38" stroke="#6B4212" strokeWidth="2.5" />
      <rect x="138" y="64" width="12" height="24" rx="5" fill="#D99B38" stroke="#6B4212" strokeWidth="2.5" />

      {/* Head (Porcelain cream + brass rim) */}
      <rect
        x="40"
        y="36"
        width="100"
        height="72"
        rx="30"
        fill="#FDF6E7"
        stroke="#6B4212"
        strokeWidth="3.5"
      />
      <rect
        x="49"
        y="46"
        width="82"
        height="52"
        rx="21"
        fill="#1B2A4A"
        stroke="#C98A2E"
        strokeWidth="2.5"
      />

      {/* Eyes */}
      {blinking ? (
        <>
          <line x1="65" y1="70" x2="80" y2="70" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="100" y1="70" x2="115" y2="70" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : mood === 'celebrating' ? (
        <>
          <path d="M65 73 Q72.5 62 80 73" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M100 73 Q107.5 62 115 73" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="72" cy="68" r="7" fill="#FDE68A" />
          <circle cx="74" cy="65" r="2.2" fill="#FFFBEB" />
          <circle cx="108" cy="70" r="5.5" fill="#FDE68A" />
          <circle cx="110" cy="68" r="1.8" fill="#FFFBEB" />
        </>
      ) : (
        <>
          <circle cx="72" cy="69" r="7.5" fill="#FDE68A" />
          <circle cx="69.5" cy="66.5" r="2.5" fill="#FFFBEB" />
          <circle cx="108" cy="69" r="7.5" fill="#FDE68A" />
          <circle cx="105.5" cy="66.5" r="2.5" fill="#FFFBEB" />
        </>
      )}

      {/* Rosy cheeks */}
      <ellipse cx="60" cy="80" rx="5" ry="3" fill="#F97316" fillOpacity="0.45" />
      <ellipse cx="120" cy="80" rx="5" ry="3" fill="#F97316" fillOpacity="0.45" />

      {/* Mouth */}
      {mood === 'curious' ? (
        <circle cx="90" cy="84" r="4.5" stroke="#FDE68A" strokeWidth="3" />
      ) : mood === 'thinking' ? (
        <path d="M82 85 Q90 82 98 85" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M78 82 Q90 92 102 82" stroke="#FDE68A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      )}

      {/* Neck */}
      <rect x="78" y="108" width="24" height="8" rx="3" fill="#C98A2E" stroke="#6B4212" strokeWidth="2.5" />

      {/* Torso */}
      <rect
        x="56"
        y="116"
        width="68"
        height="46"
        rx="18"
        fill="#FDF6E7"
        stroke="#6B4212"
        strokeWidth="3.5"
      />
      {/* Glowing Heart Lantern Core */}
      <circle cx="90" cy="139" r="13" fill={antennaGlow} fillOpacity="0.28" stroke="#C98A2E" strokeWidth="2.5" />
      <circle cx="90" cy="139" r="7" fill={antennaGlow} />

      {/* Arms (raised when celebrating!) */}
      {mood === 'celebrating' ? (
        <>
          <path d="M56 128 C38 118, 32 102, 36 92" stroke="#D99B38" strokeWidth="9" strokeLinecap="round" />
          <path d="M124 128 C142 118, 148 102, 144 92" stroke="#D99B38" strokeWidth="9" strokeLinecap="round" />
          <circle cx="36" cy="90" r="6" fill="#FDF6E7" stroke="#6B4212" strokeWidth="2.5" />
          <circle cx="144" cy="90" r="6" fill="#FDF6E7" stroke="#6B4212" strokeWidth="2.5" />
        </>
      ) : (
        <>
          <path d="M56 128 C42 134, 38 144, 42 152" stroke="#D99B38" strokeWidth="9" strokeLinecap="round" />
          <path d="M124 128 C138 134, 142 144, 138 152" stroke="#D99B38" strokeWidth="9" strokeLinecap="round" />
          <circle cx="42" cy="153" r="6" fill="#FDF6E7" stroke="#6B4212" strokeWidth="2.5" />
          <circle cx="138" cy="153" r="6" fill="#FDF6E7" stroke="#6B4212" strokeWidth="2.5" />
        </>
      )}

      {/* Feet */}
      <rect x="66" y="160" width="18" height="12" rx="6" fill="#D99B38" stroke="#6B4212" strokeWidth="2.5" />
      <rect x="96" y="160" width="18" height="12" rx="6" fill="#D99B38" stroke="#6B4212" strokeWidth="2.5" />
    </svg>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Faire coucou à Lumi le robot"
        className="group relative inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 cursor-pointer"
      >
        {svgContent}
      </button>
    );
  }

  return svgContent;
}

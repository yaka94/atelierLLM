import { useEffect, useRef } from 'react';
import { ART_ASSETS } from '../game/content';
import type { AgeMode } from '../game/types';
import { AmbientCanvas } from './AmbientCanvas';
import { ArtImage } from './ArtImage';

interface TitleScreenProps {
  ageMode: AgeMode;
  kidScore: number;
  adultScore: number;
  achievementsUnlockedCount: number;
  achievementsTotalCount: number;
  onSelectAgeMode: (mode: AgeMode) => void;
  onStart: () => void;
  onOpenAchievements: () => void;
}

export function TitleScreen({
  ageMode,
  kidScore,
  adultScore,
  achievementsUnlockedCount,
  achievementsTotalCount,
  onSelectAgeMode,
  onStart,
  onOpenAchievements,
}: TitleScreenProps) {
  // Multi-layer Z-depth mouse parallax refs (zero React re-renders per mousemove!)
  const farLayerRef = useRef<HTMLDivElement | null>(null);
  const midAstrolabeRef = useRef<HTMLDivElement | null>(null);
  const nearTokensRef = useRef<HTMLDivElement | null>(null);
  const foregroundUiRef = useRef<HTMLDivElement | null>(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const smooth = 1 - Math.exp(-7.5 * dt);
      const cur = currentRef.current;
      const tgt = targetRef.current;

      cur.x += (tgt.x - cur.x) * smooth;
      cur.y += (tgt.y - cur.y) * smooth;

      if (!reduceMotion) {
        if (farLayerRef.current) {
          farLayerRef.current.style.transform = `translate3d(${(cur.x * -14).toFixed(2)}px, ${(cur.y * -9).toFixed(2)}px, -70px) scale(1.13) rotateY(${(cur.x * 2.4).toFixed(2)}deg) rotateX(${(cur.y * -1.8).toFixed(2)}deg)`;
        }
        if (midAstrolabeRef.current) {
          midAstrolabeRef.current.style.transform = `translate3d(${(cur.x * -28).toFixed(2)}px, ${(cur.y * -18).toFixed(2)}px, -18px) rotateY(${(cur.x * 3.2).toFixed(2)}deg) rotateX(${(cur.y * -2.2).toFixed(2)}deg)`;
        }
        if (nearTokensRef.current) {
          nearTokensRef.current.style.transform = `translate3d(${(cur.x * -52).toFixed(2)}px, ${(cur.y * -32).toFixed(2)}px, 36px) rotateY(${(cur.x * 4.2).toFixed(2)}deg) rotateX(${(cur.y * -2.8).toFixed(2)}deg)`;
        }
        if (foregroundUiRef.current) {
          foregroundUiRef.current.style.transform = `translate3d(${(cur.x * 7).toFixed(2)}px, ${(cur.y * 4).toFixed(2)}px, 14px)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetRef.current.x = Math.max(-1, Math.min(1, nx));
    targetRef.current.y = Math.max(-1, Math.min(1, ny));
  };

  const handleMouseLeave = () => {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-screen w-screen overflow-hidden bg-[#131D38] text-[#FBF7EF] select-none"
      style={{ perspective: '1100px' }}
    >
      {/* DEPTH LAYER 0 (Far Plane): Observatory Key-Art with 3D Z-depth perspective tilt */}
      <div
        ref={farLayerRef}
        className="absolute -inset-8 will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translate3d(0px, 0px, -70px) scale(1.13)',
        }}
      >
        <ArtImage
          src={ART_ASSETS.titleBg}
          alt="L'Atelier des LLM : Lumi le robot tient une lanterne dorée dans un observatoire étoilé"
          className="h-full w-full object-cover object-right"
          fallbackTitle="L'Atelier des LLM"
        />
      </div>

      {/* DEPTH LAYER 1 (Midground Plane): Gilded Celestial Astrolabe Rings & Constellation Arcs */}
      <div
        ref={midAstrolabeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0px, 0px, -18px)' }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <radialGradient id="astrolabe-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6C453" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#131D38" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Observatory Celestial Brass Rings centered on right-mid */}
          <circle cx="1040" cy="360" r="340" fill="url(#astrolabe-glow)" />
          <circle
            cx="1040"
            cy="360"
            r="295"
            stroke="#F6C453"
            strokeOpacity="0.26"
            strokeWidth="1.5"
            strokeDasharray="8 10"
          />
          <circle
            cx="1040"
            cy="360"
            r="228"
            stroke="#93C5FD"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
          <ellipse
            cx="1040"
            cy="360"
            rx="340"
            ry="120"
            transform="rotate(-18 1040 360)"
            stroke="#F6C453"
            strokeOpacity="0.32"
            strokeWidth="1.5"
          />
          <ellipse
            cx="1040"
            cy="360"
            rx="275"
            ry="96"
            transform="rotate(24 1040 360)"
            stroke="#38BDF8"
            strokeOpacity="0.24"
            strokeWidth="1.2"
          />
          {/* Attention Constellation Beam Nodes */}
          <path
            d="M680 180 L835 235 L985 155 L1170 215 L1290 130"
            stroke="#F6D58E"
            strokeOpacity="0.35"
            strokeWidth="1.4"
          />
          <circle cx="680" cy="180" r="4" fill="#F6C453" fillOpacity="0.7" />
          <circle cx="835" cy="235" r="5" fill="#FDE68A" fillOpacity="0.85" />
          <circle cx="985" cy="155" r="4.5" fill="#7DD3FC" fillOpacity="0.8" />
          <circle cx="1170" cy="215" r="5.5" fill="#F6C453" fillOpacity="0.85" />
          <circle cx="1290" cy="130" r="4" fill="#FDE68A" fillOpacity="0.75" />
        </svg>
      </div>

      {/* DEPTH LAYER 2 (Near-Foreground Depth Plane): Floating Crystal Tokens & Brass Gears */}
      <div
        ref={nearTokensRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0px, 0px, 36px)' }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <linearGradient id="token-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="token-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
            </linearGradient>
            <filter id="near-depth-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Upper-Center Floating Token Bead */}
          <g transform="translate(715 110) rotate(-7)" filter="url(#near-depth-glow)">
            <rect
              x="0"
              y="0"
              width="132"
              height="38"
              rx="12"
              fill="#152242"
              fillOpacity="0.82"
              stroke="url(#token-amber)"
              strokeWidth="2"
            />
            <circle cx="20" cy="19" r="5.5" fill="#F6C453" />
            <text
              x="34"
              y="24"
              fill="#FBF7EF"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="12.5"
              fontWeight="700"
            >
              Mots → Tokens
            </text>
          </g>

          {/* Upper-Right Floating Attention Crystal */}
          <g transform="translate(1140 118) rotate(6)" filter="url(#near-depth-glow)">
            <rect
              x="0"
              y="0"
              width="136"
              height="38"
              rx="12"
              fill="#112445"
              fillOpacity="0.8"
              stroke="url(#token-cyan)"
              strokeWidth="2"
            />
            <polygon points="18,10 26,19 18,28 10,19" fill="#38BDF8" />
            <text
              x="34"
              y="24"
              fill="#E0F2FE"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="12.5"
              fontWeight="700"
            >
              Liens · Attention
            </text>
          </g>

          {/* Mid-Right Floating Layer Chip */}
          <g transform="translate(1210 380) rotate(-5)" filter="url(#near-depth-glow)">
            <rect
              x="0"
              y="0"
              width="126"
              height="36"
              rx="11"
              fill="#172447"
              fillOpacity="0.82"
              stroke="url(#token-amber)"
              strokeWidth="1.8"
            />
            <text
              x="16"
              y="23"
              fill="#FDE68A"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="12.5"
              fontWeight="700"
            >
              Couches · LFM3
            </text>
          </g>

          {/* Floating Luminous Crystal Shards for Depth Parallax */}
          <polygon
            points="655,610 672,584 689,610 672,646"
            fill="url(#token-amber)"
            fillOpacity="0.72"
          />
          <polygon
            points="1075,260 1087,240 1099,260 1087,286"
            fill="url(#token-cyan)"
            fillOpacity="0.75"
          />
          <polygon
            points="895,740 908,718 921,740 908,768"
            fill="url(#token-amber)"
            fillOpacity="0.58"
          />
        </svg>
      </div>

      {/* Measured contrast scrim strictly over the left negative space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(14, 22, 46, 0.90) 0%, rgba(14, 22, 46, 0.72) 38%, rgba(14, 22, 46, 0.14) 68%, rgba(14, 22, 46, 0.04) 100%)',
        }}
      />

      {/* Isolated Canvas2D golden dust motes */}
      <AmbientCanvas active={true} />

      {/* DEPTH LAYER 3 (Foreground UI Plane): Left-third Title Lockup & Controls */}
      <div
        ref={foregroundUiRef}
        className="relative z-10 flex h-full flex-col justify-between px-8 py-8 md:px-14 md:py-12 will-change-transform"
      >
        <div className="h-2" />

        <div className="max-w-lg space-y-6">
          {/* Custom Inline SVG Title Lockup */}
          <div className="space-y-3">
            <svg
              viewBox="0 0 460 132"
              className="w-full max-w-[440px] h-auto overflow-visible"
              role="img"
              aria-label="L'Atelier des LLM"
            >
              <defs>
                <filter id="title-shadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="6"
                    floodColor="#090F22"
                    floodOpacity="0.65"
                  />
                </filter>
              </defs>
              {/* Small brass compass emblem */}
              <g transform="translate(0, 6)">
                <circle cx="22" cy="22" r="18" fill="#1E2D55" stroke="#E8A62E" strokeWidth="2.5" />
                <path
                  d="M22 8 L25.5 18.5 L36 22 L25.5 25.5 L22 36 L18.5 25.5 L8 22 L18.5 18.5 Z"
                  fill="#F6C453"
                />
                <circle cx="22" cy="22" r="3.5" fill="#131D38" />
                <line
                  x1="50"
                  y1="22"
                  x2="272"
                  y2="22"
                  stroke="#E8A62E"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                />
                <text
                  x="56"
                  y="15"
                  fill="#F3D695"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontSize="12"
                  fontWeight="600"
                  letterSpacing="1.6"
                >
                  VOYAGE INTERACTIF DANS L’IA
                </text>
              </g>

              {/* Main Display Title */}
              <text
                x="0"
                y="92"
                fill="#FBF7EF"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontSize="52"
                fontWeight="800"
                letterSpacing="-1"
                filter="url(#title-shadow)"
              >
                L’Atelier des
              </text>
              <text
                x="0"
                y="130"
                fill="#F6C453"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontSize="48"
                fontWeight="800"
                letterSpacing="1"
                filter="url(#title-shadow)"
              >
                LLM
              </text>
              <line
                x1="116"
                y1="116"
                x2="290"
                y2="116"
                stroke="#F6C453"
                strokeOpacity="0.45"
                strokeWidth="2"
              />
              <circle cx="298" cy="116" r="4" fill="#F6C453" />
            </svg>

            <p className="text-base leading-relaxed text-[#E3E9F5] max-w-md">
              Comprenez en jouant à la souris comment une IA lit vos mots, relie les idées, apprend, consulte des sources et réfléchit — sans aucun prérequis.
            </p>
          </div>

          {/* Mode Selector (Enfant 5+ vs Adulte) with Separate Score Indicators */}
          <div className="space-y-2.5">
            <span className="block text-xs font-medium text-[#C9D4EA]">
              Choisis ton parcours (deux compteurs séparés)
            </span>
            <div
              role="group"
              aria-label="Choix du mode de difficulté"
              className="inline-flex rounded-xl bg-[#0D152B]/90 p-1.5 border border-[#E8A62E]/35"
            >
              <button
                type="button"
                onClick={() => onSelectAgeMode('kid')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 ${
                  ageMode === 'kid'
                    ? 'bg-[#E8A62E] text-[#131D38] shadow-sm'
                    : 'text-[#DCE4F5] hover:text-white'
                }`}
              >
                <span>Enfant · dès 5 ans</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    ageMode === 'kid'
                      ? 'bg-[#131D38]/15 text-[#131D38]'
                      : 'bg-white/10 text-[#F6D58E]'
                  }`}
                >
                  {Math.round(kidScore)} pts
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSelectAgeMode('adult')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 ${
                  ageMode === 'adult'
                    ? 'bg-[#E8A62E] text-[#131D38] shadow-sm'
                    : 'text-[#DCE4F5] hover:text-white'
                }`}
              >
                <span>Adulte · Complet</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    ageMode === 'adult'
                      ? 'bg-[#131D38]/15 text-[#131D38]'
                      : 'bg-white/10 text-[#F6D58E]'
                  }`}
                >
                  {Math.round(adultScore)} pts
                </span>
              </button>
            </div>
            <p className="text-xs text-[#C6D2E8] max-w-md">
              {ageMode === 'kid'
                ? 'Avec Lumi le robot : perles de mots, histoires interactives, quiz visuels et lecture vocale.'
                : 'Accessible aux débutants comme aux curieux techniques : explications en clair, glossaire intégré et laboratoires interactifs.'}
            </p>
          </div>

          {/* Primary Start CTA + Secondary Succès Dashboard Button */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onStart}
              className="inline-flex items-center gap-3 rounded-xl bg-[#E8A62E] px-7 py-4 text-base font-bold text-[#131D38] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:bg-[#F3B946] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              <span>Commencer l’aventure</span>
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" aria-hidden="true">
                <path
                  d="M4 10h12m0 0l-5-5m5 5l-5 5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={onOpenAchievements}
              className="inline-flex items-center gap-2.5 rounded-xl border border-[#E8A62E]/50 bg-[#131D38]/85 px-5 py-4 text-sm font-bold text-[#F6D58E] shadow-[0_6px_18px_rgba(0,0,0,0.28)] transition-all duration-150 hover:border-[#F6C453] hover:bg-[#1C2A4D] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" aria-hidden="true">
                <path
                  d="M8 4h8v4a4 4 0 0 1-8 0V4zM6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3M12 12v5M8.5 20h7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="tabular-nums">
                Succès ({achievementsUnlockedCount}/{achievementsTotalCount})
              </span>
            </button>
          </div>
        </div>

        {/* Single flat borderless bottom control hint line */}
        <div className="text-xs font-medium text-[#C5D1E8]/85 tracking-wide">
          Souris : Bouger pour la profondeur 3D &amp; Cliquer · Entrée / Espace : Commencer · M : Son
        </div>
      </div>
    </div>
  );
}

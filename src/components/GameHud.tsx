import { STATIONS } from '../game/content';
import type { AgeMode, PlayView, ProgressState, StationId } from '../game/types';

interface GameHudProps {
  ageMode: AgeMode;
  playView: PlayView;
  activeStation: StationId | null;
  progress: ProgressState;
  kidScore: number;
  adultScore: number;
  muted: boolean;
  voiceOn: boolean;
  onChangeAgeMode: (mode: AgeMode) => void;
  onBackToMap: () => void;
  onToggleVoice: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenGlossary: () => void;
}

export function GameHud({
  ageMode,
  playView,
  activeStation,
  progress,
  kidScore,
  adultScore,
  muted,
  voiceOn,
  onChangeAgeMode,
  onBackToMap,
  onToggleVoice,
  onToggleMute,
  onPause,
  onOpenGlossary,
}: GameHudProps) {
  const currentMeta = activeStation ? STATIONS.find((s) => s.id === activeStation) : null;
  const viewLabel =
    playView === 'map'
      ? ageMode === 'kid'
        ? 'Carte de l’Atelier'
        : 'Carte des Modules LLM'
      : playView === 'quiz'
      ? ageMode === 'kid'
        ? 'Quiz Magique Adaptatif'
        : 'Quiz Technique Adaptatif'
      : playView === 'lumi'
      ? 'Parler avec Lumi'
      : playView === 'achievements'
      ? 'Tableau des Succès'
      : currentMeta
      ? `${currentMeta.order}. ${ageMode === 'kid' ? currentMeta.titleKid : currentMeta.titleAdult}`
      : 'Atelier';

  return (
    <div className="relative z-20 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#D8CEB9] bg-[#131D38] px-3 py-2.5 text-[#FBF7EF] md:px-6">
      {/* Left: Back button + Current location */}
      <div className="flex items-center gap-2.5 min-w-0">
        {playView !== 'map' ? (
          <button
            type="button"
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8A62E]/40 bg-[#1D2B4F] px-3 py-1.5 text-sm font-semibold text-[#F6D58E] transition-colors hover:bg-[#273864] cursor-pointer whitespace-nowrap shrink-0"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" aria-hidden="true">
              <path
                d="M12.5 5L7.5 10l5 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Carte</span>
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8A62E]/15 border border-[#E8A62E]/40 shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3z"
                fill="#F6C453"
              />
            </svg>
          </span>
        )}
        <div className="min-w-0">
          <div className="font-display text-sm md:text-base font-bold tracking-tight text-[#FBF7EF] truncate max-w-[200px] sm:max-w-[280px]">
            {viewLabel}
          </div>
        </div>
      </div>

      {/* Center: 8 Custom SVG Crystal Sockets + Always-Visible Dual Clickable Score Counters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-1"
          aria-label={`Cristaux gagnés (${ageMode === 'kid' ? 'Enfant' : 'Adulte'}) : ${progress.unlockedCrystals.length} sur ${STATIONS.length}`}
        >
          {STATIONS.map((station) => {
            const filled = progress.unlockedCrystals.includes(station.id);
            return (
              <svg
                key={station.id}
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: filled ? 'scale(1.08)' : 'scale(1)' }}
                aria-hidden="true"
              >
                <polygon
                  points="12,2 20,9 16,21 8,21 4,9"
                  fill={filled ? '#F6C453' : '#1E2C50'}
                  stroke={filled ? '#FFF2C6' : '#536792'}
                  strokeWidth="1.8"
                />
                {filled && (
                  <polygon points="12,5 16,10 12,17 8,10" fill="#FFF8DC" fillOpacity="0.65" />
                )}
              </svg>
            );
          })}
          <span className="ml-1 text-xs md:text-sm font-bold text-[#F6D58E] hud-numeral">
            {progress.unlockedCrystals.length}/{STATIONS.length}
          </span>
        </div>

        {/* Two Strictly Separate Score Counters (visible on all viewports & clickable to switch mode) */}
        <div
          role="group"
          aria-label={`Compteurs séparés — Enfant : ${Math.round(kidScore)} points, Adulte : ${Math.round(adultScore)} points`}
          className="flex items-center gap-1.5 border-l border-white/15 pl-3"
        >
          <button
            type="button"
            data-testid="score-kid"
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeAgeMode('kid');
            }}
            className={`inline-flex items-baseline gap-1.5 rounded-lg border px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              ageMode === 'kid'
                ? 'border-[#E8A62E] bg-[#E8A62E]/20 text-[#F6C453]'
                : 'border-white/15 bg-[#0D152B]/70 text-[#A7B8D6] hover:text-white'
            }`}
            title="Basculer sur le parcours Enfant (dès 5 ans)"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase">ENFANT</span>
            <span className="text-sm md:text-base font-extrabold hud-numeral">
              {Math.round(kidScore)}
            </span>
          </button>
          <button
            type="button"
            data-testid="score-adult"
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeAgeMode('adult');
            }}
            className={`inline-flex items-baseline gap-1.5 rounded-lg border px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              ageMode === 'adult'
                ? 'border-[#E8A62E] bg-[#E8A62E]/20 text-[#F6C453]'
                : 'border-white/15 bg-[#0D152B]/70 text-[#A7B8D6] hover:text-white'
            }`}
            title="Basculer sur le parcours Adulte (Avancé)"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase">ADULTE</span>
            <span className="text-sm md:text-base font-extrabold hud-numeral">
              {Math.round(adultScore)}
            </span>
          </button>
        </div>
      </div>

      {/* Right: Explicitly Labeled Controls (Glossary, Voice, Sound, Pause) for Beginner & Senior Clarity */}
      <div className="flex items-center gap-1.5 shrink-0">
        {ageMode === 'adult' && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenGlossary();
            }}
            aria-label="Ouvrir le glossaire en clair des termes IA"
            title="Décodeur des termes IA (En clair)"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#38BDF8]/45 bg-[#123052] px-2.5 text-xs font-bold text-[#BAE6FD] hover:bg-[#19406C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M8 7h8M8 11h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Glossaire</span>
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleVoice();
          }}
          aria-label={voiceOn ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}
          title={voiceOn ? 'Voix activée' : 'Lire à voix haute'}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            voiceOn
              ? 'border-[#E8A62E] bg-[#E8A62E]/20 text-[#F6C453]'
              : 'border-white/20 bg-[#1B294A] text-[#D7E1F4] hover:bg-[#24365F]'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
            <path
              d="M12 4a3 3 0 0 0-3 3v5a3 3 0 1 0 6 0V7a3 3 0 0 0-3-3z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19 11a7 7 0 0 1-14 0m7 7v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden xl:inline">{voiceOn ? 'Voix ON' : 'Voix'}</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={muted ? 'Activer le son (M)' : 'Couper le son (M)'}
          title="Effets sonores [M]"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-[#1B294A] px-2.5 text-xs font-semibold text-[#D7E1F4] hover:bg-[#24365F] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6m0-6l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M11 5L6 9H3v6h3l5 4V5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          <span className="hidden xl:inline">{muted ? 'Muet' : 'Son'}</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onPause();
          }}
          aria-label="Pause (P ou Échap)"
          title="Menu Pause [P]"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-[#1B294A] px-2.5 text-xs font-semibold text-[#D7E1F4] hover:bg-[#24365F] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
          <span className="hidden xl:inline">Pause</span>
        </button>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  evaluateAchievements,
  type AchievementArtKey,
  type EvaluatedAchievement,
} from '../game/achievements';
import { ART_ASSETS, REWARD_ASSETS } from '../game/content';
import { playClick } from '../game/sound';
import type { AgeMode, ProgressState, StationId } from '../game/types';
import { ArtImage } from './ArtImage';

interface AchievementsDashboardProps {
  ageMode: AgeMode;
  progress: ProgressState;
  asModal?: boolean;
  onClose?: () => void;
  onSwitchAgeMode?: (mode: AgeMode) => void;
  onGoToStation: (id: StationId) => void;
  onOpenQuiz: () => void;
  onOpenLumi: () => void;
}

type FilterTab = 'all' | 'station' | 'milestones';

function resolveBadgeImage(artKey: AchievementArtKey): string {
  switch (artKey) {
    case 'tokens':
      return ART_ASSETS.tokens;
    case 'attention':
      return ART_ASSETS.attention;
    case 'layers':
      return ART_ASSETS.layers;
    case 'omni':
      return ART_ASSETS.omni;
    case 'prediction':
      return ART_ASSETS.titleBg;
    case 'training':
      return ART_ASSETS.training;
    case 'contextRag':
      return ART_ASSETS.contextRag;
    case 'reasoning':
      return ART_ASSETS.reasoning;
    case 'stationsMedallion':
      return REWARD_ASSETS.stationsMedallion;
    case 'scoreTrophy':
      return REWARD_ASSETS.scoreTrophy;
    case 'quizPrism':
      return REWARD_ASSETS.quizPrism;
  }
}

export function AchievementsDashboard({
  ageMode,
  progress,
  asModal = false,
  onClose,
  onSwitchAgeMode,
  onGoToStation,
  onOpenQuiz,
  onOpenLumi,
}: AchievementsDashboardProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const summary = useMemo(() => evaluateAchievements(progress), [progress]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return summary.items;
    if (filter === 'station') {
      return summary.items.filter((i) => i.category === 'station');
    }
    return summary.items.filter((i) => i.category !== 'station');
  }, [summary.items, filter]);

  const handleActionForBadge = (item: EvaluatedAchievement) => {
    playClick();
    if (item.stationId) {
      onGoToStation(item.stationId);
    } else if (item.id === 'mastery-quiz-ace') {
      onOpenQuiz();
    } else if (item.id === 'mastery-lumi-story') {
      onOpenLumi();
    } else {
      // Score or all-stations milestone -> jump to first uncompleted station or quiz
      const nextStation = summary.items.find(
        (i) => i.category === 'station' && !i.unlocked && i.stationId
      );
      if (nextStation?.stationId) {
        onGoToStation(nextStation.stationId);
      } else {
        onOpenQuiz();
      }
    }
  };

  const grandTrophies = [
    {
      id: 'mastery-all-stations',
      image: REWARD_ASSETS.stationsMedallion,
      label: ageMode === 'kid' ? 'Médaillon des 8 Cristaux' : 'Maîtrise des 8 Modules',
      stat: `${summary.stationsUnlocked}/${summary.stationsTotal}`,
      unlocked: summary.stationsUnlocked === summary.stationsTotal,
    },
    {
      id: 'score-800',
      image: REWARD_ASSETS.scoreTrophy,
      label: ageMode === 'kid' ? 'Coupe des Points' : 'Trophée de Score',
      stat: `${Math.round(Math.max(progress.score, progress.bestScore))} pts`,
      unlocked: Math.max(progress.score, progress.bestScore) >= 800,
    },
    {
      id: 'mastery-quiz-ace',
      image: REWARD_ASSETS.quizPrism,
      label: ageMode === 'kid' ? 'Prisme du Grand Quiz' : 'Prisme d’Excellence Quiz',
      stat: `${progress.quizBestAccuracy}%`,
      unlocked: progress.quizBestAccuracy >= 80,
    },
  ];

  const content = (
    <div className="flex flex-col gap-5">
      {/* Header + Progress Bar + Profile Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[260px]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8C530A]">
            <span>
              Tableau de bord Succès · {ageMode === 'kid' ? 'Profil Enfant' : 'Profil Adulte'}
            </span>
            {onSwitchAgeMode && (
              <div className="inline-flex rounded-lg bg-[#EFE8DA] p-0.5">
                <button
                  type="button"
                  onClick={() => onSwitchAgeMode('kid')}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                    ageMode === 'kid' ? 'bg-[#131D38] text-[#F6C453]' : 'text-[#53607A]'
                  }`}
                >
                  Enfant
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchAgeMode('adult')}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                    ageMode === 'adult' ? 'bg-[#131D38] text-[#F6C453]' : 'text-[#53607A]'
                  }`}
                >
                  Adulte
                </button>
              </div>
            )}
          </div>
          <h1
            id="achievements-title"
            className="font-display text-2xl font-extrabold text-[#172033]"
          >
            {ageMode === 'kid'
              ? 'Tes Badges et Trophées de l’Atelier'
              : 'Succès, Badges de Station & Jalons de Score'}
          </h1>
          <p className="text-sm text-[#46536E]">
            {summary.nextScoreMilestone
              ? `Prochain jalon de score : ${
                  ageMode === 'kid'
                    ? summary.nextScoreMilestone.titleKid
                    : summary.nextScoreMilestone.titleAdult
                } (${summary.nextScoreMilestone.currentValue}/${summary.nextScoreMilestone.targetValue} pts)`
              : 'Tous les jalons de score sont atteints ! Bravo pour votre progression.'}
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right tabular-nums">
            <div className="text-[11px] font-semibold text-[#53607A]">DÉBLOQUÉS</div>
            <div className="font-display text-2xl font-extrabold text-[#C97714]">
              {summary.unlockedCount}/{summary.totalCount}
            </div>
            <div className="text-xs font-semibold text-[#0E7A5F]">
              {summary.completionPercent}% complété
            </div>
          </div>

          {asModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le tableau des succès"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4C7AE] bg-[#FBF7EF] text-[#172033] hover:bg-[#F3ECDD] transition-colors cursor-pointer shrink-0"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Full-width overall completion track */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFE8DA]">
            <div
              className="h-full rounded-full bg-[#E8A62E] transition-all duration-300"
              style={{ width: `${Math.max(3, summary.completionPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Grand Reward Illustrations Showcase */}
      <section aria-label="Trophées majeurs illustrés" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {grandTrophies.map((trophy) => (
          <div
            key={trophy.id}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
              trophy.unlocked
                ? 'border-[#E8A62E] bg-[#FFFBEB] shadow-sm'
                : 'border-[#DDD3BE] bg-[#F3ECDD]/70'
            }`}
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#D4A449] bg-[#FBF7EF]">
              <ArtImage
                src={trophy.image}
                alt={trophy.label}
                fallbackTitle={trophy.label}
                className={`h-full w-full object-cover transition-all duration-300 ${
                  trophy.unlocked ? 'grayscale-0 opacity-100' : 'grayscale opacity-65'
                }`}
              />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-xs font-bold text-[#8C530A]">
                {trophy.unlocked ? 'Trophée débloqué ★' : 'Trophée à débloquer'}
              </div>
              <div className="font-display text-base font-bold text-[#172033] leading-tight">
                {trophy.label}
              </div>
              <div className="font-mono text-xs font-semibold text-[#0F769E] tabular-nums">
                Progression : {trophy.stat}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Filter Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filtrer les succès"
          className="inline-flex rounded-xl bg-[#EAE1CF] p-1"
        >
          {[
            { id: 'all' as const, label: `Tous (${summary.totalCount})` },
            { id: 'station' as const, label: `Stations (${summary.stationsTotal})` },
            {
              id: 'milestones' as const,
              label: `Jalons & Score (${summary.totalCount - summary.stationsTotal})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => {
                playClick();
                setFilter(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-[#172033] shadow-xs'
                  : 'text-[#53607A] hover:text-[#172033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#53607A]">
          Clique sur un badge verrouillé pour accéder directement à son activité
        </span>
      </div>

      {/* Achievements Grid */}
      <section
        aria-label="Liste des badges et jalons"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredItems.map((item) => {
          const title = ageMode === 'kid' ? item.titleKid : item.titleAdult;
          const desc = ageMode === 'kid' ? item.descriptionKid : item.descriptionAdult;
          const artSrc = resolveBadgeImage(item.artKey);

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-all ${
                item.unlocked
                  ? 'border-[#C97714] bg-white shadow-sm'
                  : 'border-[#E2D8C4] bg-[#FBF7EF]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Illustrated Badge Medallion */}
                <div
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 ${
                    item.unlocked ? 'border-[#E8A62E]' : 'border-[#CFC3AB]'
                  }`}
                >
                  <ArtImage
                    src={artSrc}
                    alt={`Illustration de récompense : ${title}`}
                    fallbackTitle={title}
                    className={`h-full w-full object-cover ${
                      item.unlocked ? '' : 'grayscale opacity-60'
                    }`}
                  />
                  {item.unlocked && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0E7A5F] text-[11px] font-bold text-white"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className={item.unlocked ? 'text-[#0E7A5F]' : 'text-[#6B768E]'}>
                      {item.unlocked ? 'Obtenu ★' : 'En cours'}
                    </span>
                    <span className="font-mono text-[#53607A] tabular-nums">
                      {item.currentValue}/{item.targetValue} {item.unit}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-bold text-[#172033] leading-snug">
                    {title}
                  </h2>
                  <p className="text-xs leading-relaxed text-[#46536E]">{desc}</p>
                </div>
              </div>

              {/* Progress Bar + Direct Navigation CTA when locked */}
              <div className="space-y-2 pt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8DFCE]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.unlocked ? 'bg-[#0E7A5F]' : 'bg-[#E8A62E]'
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>

                {!item.unlocked && (
                  <button
                    type="button"
                    onClick={() => handleActionForBadge(item)}
                    className="w-full rounded-xl border border-[#D4C7AE] bg-white px-3 py-2 text-xs font-bold text-[#0F769E] hover:border-[#0F769E] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
                  >
                    {item.stationId
                      ? 'Explorer cette station →'
                      : item.id === 'mastery-quiz-ace'
                      ? 'Lancer le Quiz Adaptatif →'
                      : item.id === 'mastery-lumi-story'
                      ? 'Ouvrir le Coin de Lumi →'
                      : 'Continuer à gagner des points →'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );

  if (asModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievements-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1328]/82 p-4 md:p-6"
      >
        <div className="max-h-[90vh] w-full max-w-[1120px] overflow-y-auto rounded-2xl border border-[#DDD3BE] bg-[#FBF7EF] p-5 md:p-7 text-[#172033] shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-6 pb-28 md:px-8">
      {content}
    </main>
  );
}

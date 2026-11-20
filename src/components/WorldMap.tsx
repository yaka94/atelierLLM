import { evaluateAchievements } from '../game/achievements';
import { STATIONS, type StationMeta } from '../game/content';
import { calculateMasteryPercent } from '../game/llmEngine';
import { playClick, speakFrench } from '../game/sound';
import type { AgeMode, ProgressState, StationId } from '../game/types';
import { ArtImage } from './ArtImage';
import { LumiMascotSvg } from './LumiMascotSvg';

interface WorldMapProps {
  ageMode: AgeMode;
  progress: ProgressState;
  onSelectStation: (id: StationId) => void;
  onOpenQuiz: () => void;
  onOpenLumi: () => void;
  onOpenAchievements: () => void;
  onOpenGlossary: () => void;
}

export function WorldMap({
  ageMode,
  progress,
  onSelectStation,
  onOpenQuiz,
  onOpenLumi,
  onOpenAchievements,
  onOpenGlossary,
}: WorldMapProps) {
  const mastery = calculateMasteryPercent(progress);
  const allCrystals = progress.unlockedCrystals.length === STATIONS.length;
  const achSummary = evaluateAchievements(progress);

  const coreStations = STATIONS.filter((s) => s.chapter === 'core');
  const advancedStations = STATIONS.filter((s) => s.chapter === 'advanced');
  const nextRecommended =
    STATIONS.find((s) => !progress.unlockedCrystals.includes(s.id)) ?? null;

  const coreUnlocked = coreStations.filter((s) => progress.unlockedCrystals.includes(s.id)).length;
  const advUnlocked = advancedStations.filter((s) =>
    progress.unlockedCrystals.includes(s.id)
  ).length;

  const renderStationCard = (station: StationMeta) => {
    const unlocked = progress.unlockedCrystals.includes(station.id);
    const isNext = nextRecommended?.id === station.id;
    const title = ageMode === 'kid' ? station.titleKid : station.titleAdult;
    const subtitle = ageMode === 'kid' ? station.subtitleKid : station.subtitleAdult;

    return (
      <button
        key={station.id}
        type="button"
        onClick={() => onSelectStation(station.id)}
        className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-[#C97714] hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C97714] ${
          isNext ? 'border-[#E8A62E] ring-2 ring-[#E8A62E]/35' : 'border-[#DDD3BE]'
        }`}
      >
        <div className="relative h-32 w-full overflow-hidden bg-[#131D38]">
          <ArtImage
            src={station.image}
            alt={station.imageAlt}
            fallbackTitle={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#131D38]/80 to-transparent"
          />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs font-semibold text-[#FBF7EF]">
            <span className="tabular-nums">Station {station.order}</span>
            <span className={unlocked ? 'text-[#F6C453]' : isNext ? 'text-[#7DD3FC]' : ''}>
              {unlocked ? 'Cristal gagné ★' : isNext ? 'Étape conseillée' : 'À explorer'}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2">
          <div className="space-y-0.5">
            <h3 className="font-display text-base font-bold text-[#172033] group-hover:text-[#9E5B08] transition-colors">
              {station.order}. {title}
            </h3>
            <p className="text-xs md:text-sm text-[#46536E] leading-snug">{subtitle}</p>
          </div>

          <div className="flex items-center justify-between border-t border-[#EFE8DA] pt-2 text-xs text-[#5B6882]">
            <span className="truncate pr-2">{station.neurosciencePillar}</span>
            <span className="font-bold text-[#0F769E] whitespace-nowrap shrink-0">
              Explorer →
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-5 px-4 py-4 pb-28 md:px-8 md:py-5">
      {/* Top Guided Welcome Strip — Kid features Voice Read-Aloud & Next Step; Adult features Plain-French Onboarding & Glossary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#53607A]">
                {ageMode === 'kid'
                  ? 'Mode Enfant (dès 5 ans) · 8 stations illustrées'
                  : 'Mode Adulte (Complet) · Sans prérequis · 8 modules progressifs'}
              </span>
              {ageMode === 'kid' ? (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    speakFrench(
                      nextRecommended
                        ? `Bienvenue dans l'Atelier de Lumi ! Clique sur le bouton doré pour ouvrir la station ${nextRecommended.order} : ${nextRecommended.titleKid}.`
                        : `Bravo ! Tu as récolté les 8 cristaux de l'Atelier ! Tu peux maintenant jouer au Grand Quiz.`
                    );
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4A449] bg-[#FEF6E6] px-2.5 py-1 text-xs font-bold text-[#8C530A] hover:bg-[#FDECC8] cursor-pointer whitespace-nowrap"
                >
                  <span>Écouter la consigne</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onOpenGlossary();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F769E]/40 bg-[#E0F2FE] px-2.5 py-1 text-xs font-bold text-[#0C4A6E] hover:bg-[#BAE6FD] cursor-pointer whitespace-nowrap"
                >
                  <span>Décodeur · Termes en clair</span>
                </button>
              )}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#172033]">
              {ageMode === 'kid'
                ? 'Bienvenue dans l’Atelier de Lumi !'
                : 'Comprendre une IA pas à pas, sans jargon bloquant'}
            </h1>
            <p className="text-sm leading-relaxed text-[#46536E] max-w-2xl">
              {ageMode === 'kid'
                ? 'Récolte les 8 Cristaux de Savoir : des perles de mots jusqu’à l’école de Lumi, son sac à dos mémoire et son carnet de brouillon magique !'
                : 'Chaque module commence par une idée simple et visuelle, puis vous laisse manipuler les vrais mécanismes (tokens, attention, couches, mémoire et raisonnement).'}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {nextRecommended ? (
              <button
                type="button"
                onClick={() => onSelectStation(nextRecommended.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E8A62E] px-4 py-2 text-sm font-bold text-[#131D38] shadow-xs transition-transform duration-150 hover:bg-[#F3B946] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>
                  Étape {nextRecommended.order} :{' '}
                  {ageMode === 'kid' ? nextRecommended.titleKid : nextRecommended.titleAdult} →
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenQuiz}
                className="inline-flex items-center gap-2 rounded-xl bg-[#131D38] px-4 py-2 text-sm font-bold text-[#FBF7EF] transition-transform duration-150 hover:bg-[#1E2D55] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>Passer le Grand Quiz Final →</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAchievements}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4A449] bg-[#FEF6E6] px-3.5 py-2 text-sm font-bold text-[#8C530A] transition-transform duration-150 hover:bg-[#FDECC8] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span className="tabular-nums">
                Succès ({achSummary.unlockedCount}/{achSummary.totalCount})
              </span>
            </button>

            <div className="text-xs font-medium text-[#53607A] tabular-nums ml-auto">
              Maîtrise : <strong className="text-[#172033]">{mastery}%</strong>
            </div>
          </div>
        </div>

        {/* Right Companion Card */}
        <div className="lg:col-span-5 flex items-center justify-between gap-4 rounded-2xl border border-[#DDD3BE] bg-[#F3ECDD] px-5 py-4">
          <div className="space-y-2 flex-1">
            <div className="text-xs font-semibold text-[#8C530A]">
              {ageMode === 'kid' ? 'Ton ami interactif' : 'Envie d’une analogie très simple ?'}
            </div>
            <h2 className="font-display text-lg font-bold text-[#172033]">
              {ageMode === 'kid' ? 'Parler & inventer avec Lumi' : 'Atelier de Lumi (Vulgarisation)'}
            </h2>
            <p className="text-xs md:text-sm text-[#46536E] leading-snug">
              {ageMode === 'kid'
                ? 'Pose des questions simples à Lumi ou crée une histoire magique ensemble !'
                : 'Des comparaisons concrètes (collier de perles, puzzle, lampe) pour tout saisir en 2 minutes — ou l’expliquer à un enfant.'}
            </p>
            <button
              type="button"
              onClick={onOpenLumi}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C97714] px-4 py-2 text-xs font-bold text-white transition-transform duration-150 hover:bg-[#B2670D] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>Ouvrir le coin de Lumi</span>
            </button>
          </div>
          <div className="shrink-0">
            <LumiMascotSvg
              mood={allCrystals ? 'celebrating' : 'happy'}
              size={94}
              interactive
              onPoke={onOpenLumi}
            />
          </div>
        </div>
      </section>

      {/* CHAPTER I: Core Inference (Stations 1–5) */}
      <section aria-label="Chapitre 1 : Comment le LLM lit et génère">
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-[#172033]">
            Chapitre I ·{' '}
            {ageMode === 'kid'
              ? 'Comment Lumi lit, regarde et invente'
              : 'Comment l’IA lit, comprend et répond (Stations 1 à 5)'}
          </h2>
          <span className="text-xs font-semibold text-[#53607A] tabular-nums">
            {coreUnlocked}/{coreStations.length} cristaux
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coreStations.map(renderStationCard)}
        </div>
      </section>

      {/* CHAPTER II: Modern LLM Pillars (Stations 6–8 + Adaptive Quiz Portal) */}
      <section aria-label="Chapitre 2 : Entraînement, Mémoire RAG et Raisonnement">
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-[#172033]">
            Chapitre II ·{' '}
            {ageMode === 'kid'
              ? 'Comment Lumi apprend, retient et réfléchit'
              : 'Apprentissage, Mémoire, Sources & Raisonnement (Stations 6 à 8)'}
          </h2>
          <span className="text-xs font-semibold text-[#53607A] tabular-nums">
            {advUnlocked}/{advancedStations.length} cristaux
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {advancedStations.map(renderStationCard)}

          {/* 4th Card in Chapter II row: Adaptive Mastery Quiz Portal */}
          <button
            type="button"
            onClick={onOpenQuiz}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1E2D55] bg-[#131D38] p-5 text-left text-[#FBF7EF] shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-[#E8A62E] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A62E]"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F6D58E]">
                <span>Défi Final · Adaptatif</span>
                <span className="tabular-nums">3 niveaux</span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-white">
                {ageMode === 'kid' ? 'Le Grand Quiz des Cristaux' : 'Quiz Adaptatif en Clair'}
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-[#CBD6EC]">
                {ageMode === 'kid'
                  ? 'Questions illustrées sur les 8 stations : la difficulté s’ajuste toute seule !'
                  : 'Testez vos acquis en douceur sur les 8 modules : le quiz s’adapte automatiquement à votre niveau.'}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3.5">
              <span className="text-[11px] text-[#AFC0DF]">Récupération active</span>
              <span className="rounded-lg bg-[#E8A62E] px-3 py-1.5 text-xs font-bold text-[#131D38] whitespace-nowrap shrink-0">
                Démarrer →
              </span>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}

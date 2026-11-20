import { NEUROSCIENCE_PILLARS, STATIONS } from '../game/content';
import { calculateMasteryPercent } from '../game/llmEngine';
import type { AgeMode, ProgressState } from '../game/types';
import { LumiMascotSvg } from './LumiMascotSvg';

interface StatusModalProps {
  kind: 'paused' | 'victory';
  ageMode: AgeMode;
  progress: ProgressState;
  lastQuizSummary?: {
    correctCount: number;
    totalAnswered: number;
    accuracyPercent: number;
    highestDifficultyReached: number;
  } | null;
  onResume: () => void;
  onBackToMap: () => void;
  onReturnTitle: () => void;
  onReplay: () => void;
  onSwitchMode: () => void;
}

export function StatusModal({
  kind,
  ageMode,
  progress,
  lastQuizSummary,
  onResume,
  onBackToMap,
  onReturnTitle,
  onReplay,
  onSwitchMode,
}: StatusModalProps) {
  const mastery = calculateMasteryPercent(progress);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1328]/78 p-4"
    >
      <div className="w-full max-w-xl rounded-2xl border border-[#DDD3BE] bg-[#FBF7EF] p-6 md:p-8 text-[#172033] shadow-2xl space-y-6">
        {kind === 'paused' ? (
          <>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#8C530A]">
                Atelier en pause · Méthode Neurosciences
              </div>
              <h2 id="status-modal-title" className="font-display text-2xl font-extrabold">
                Pause dans l’Atelier des LLM
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3 text-center">
                <div className="text-xs text-[#53607A]">Cristaux</div>
                <div className="font-display text-2xl font-extrabold text-[#C97714] tabular-nums">
                  {progress.unlockedCrystals.length}/{STATIONS.length}
                </div>
              </div>
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3 text-center">
                <div className="text-xs text-[#53607A]">Score</div>
                <div className="font-display text-2xl font-extrabold text-[#172033] tabular-nums">
                  {Math.round(progress.score)}
                </div>
              </div>
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3 text-center">
                <div className="text-xs text-[#53607A]">Maîtrise</div>
                <div className="font-display text-2xl font-extrabold text-[#0E7A5F] tabular-nums">
                  {mastery}%
                </div>
              </div>
            </div>

            {/* Neuroscience pedagogy summary */}
            <div className="space-y-2.5 rounded-xl border border-[#E2D8C4] bg-[#F3ECDD] p-4">
              <div className="text-xs font-bold text-[#172033]">
                Les 4 piliers des neurosciences intégrés dans cette application
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {NEUROSCIENCE_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="text-xs leading-relaxed text-[#42506B]">
                    <strong className="block text-[#172033]">{pillar.title}</strong>
                    {pillar.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onResume}
                className="flex-1 rounded-xl bg-[#131D38] px-5 py-3 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer whitespace-nowrap"
              >
                Reprendre
              </button>
              <button
                type="button"
                onClick={onBackToMap}
                className="rounded-xl border border-[#CFC3AB] bg-white px-4 py-3 text-sm font-semibold text-[#172033] hover:bg-[#F3ECDD] transition-colors cursor-pointer whitespace-nowrap"
              >
                Carte
              </button>
              <button
                type="button"
                onClick={onReturnTitle}
                className="rounded-xl border border-[#CFC3AB] bg-white px-4 py-3 text-sm font-semibold text-[#172033] hover:bg-[#F3ECDD] transition-colors cursor-pointer whitespace-nowrap"
              >
                Écran titre
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <LumiMascotSvg mood="celebrating" size={96} />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#0E7A5F]">
                  {ageMode === 'kid' ? 'Diplôme d’Apprenti Robot' : 'Parcours LLM Complété'}
                </div>
                <h2 id="status-modal-title" className="font-display text-2xl md:text-3xl font-extrabold">
                  {ageMode === 'kid' ? 'Bravo, champion des LLM !' : 'Maîtrise validée !'}
                </h2>
                <p className="text-sm text-[#46536E]">
                  {ageMode === 'kid'
                    ? 'Tu as percé les secrets des perles de mots, des lampes magiques et de Lumi !'
                    : 'Vous avez complété le quiz adaptatif et exploré l’architecture interne des LLM modernes.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3.5 text-center">
                <div className="text-xs text-[#53607A]">Précision Quiz</div>
                <div className="font-display text-2xl font-extrabold text-[#0E7A5F] tabular-nums">
                  {lastQuizSummary ? `${lastQuizSummary.accuracyPercent}%` : `${progress.quizBestAccuracy}%`}
                </div>
              </div>
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3.5 text-center">
                <div className="text-xs text-[#53607A]">Niveau atteint</div>
                <div className="font-display text-2xl font-extrabold text-[#C97714] tabular-nums">
                  {lastQuizSummary ? `Niv. ${lastQuizSummary.highestDifficultyReached}/3` : `${progress.unlockedCrystals.length}/${STATIONS.length}`}
                </div>
              </div>
              <div className="rounded-xl border border-[#E2D8C4] bg-white p-3.5 text-center">
                <div className="text-xs text-[#53607A]">Score total</div>
                <div className="font-display text-2xl font-extrabold text-[#172033] tabular-nums">
                  {Math.round(progress.score)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={onReplay}
                className="flex-1 rounded-xl bg-[#E8A62E] px-5 py-3 text-sm font-bold text-[#131D38] hover:bg-[#F3B946] transition-colors cursor-pointer whitespace-nowrap"
              >
                Rejouer le Quiz
              </button>
              <button
                type="button"
                onClick={onSwitchMode}
                className="rounded-xl bg-[#131D38] px-4 py-3 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer whitespace-nowrap"
              >
                {ageMode === 'kid' ? 'Essayer le mode Adulte' : 'Voir le mode Enfant'}
              </button>
              <button
                type="button"
                onClick={onBackToMap}
                className="rounded-xl border border-[#CFC3AB] bg-white px-4 py-3 text-sm font-semibold text-[#172033] hover:bg-[#F3ECDD] transition-colors cursor-pointer whitespace-nowrap"
              >
                Carte
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

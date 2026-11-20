import { useMemo, useState } from 'react';
import { ART_ASSETS } from '../../game/content';
import { simulateReasoningBudget } from '../../game/llmEngine';
import { playBeadPop, playClick, speakFrench } from '../../game/sound';
import type { AgeMode, ReasoningMode } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface ReasoningStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onGoToQuiz: () => void;
}

const MODES: {
  id: ReasoningMode;
  titleKid: string;
  titleAdult: string;
  badge: string;
}[] = [
  {
    id: 'direct',
    titleKid: 'Réponse Express (sans brouillon)',
    titleAdult: 'Génération Directe (System 1)',
    badge: 'Rapide · Risqué',
  },
  {
    id: 'cot',
    titleKid: 'Carnet de Brouillon (pas à pas)',
    titleAdult: 'Chain-of-Thought (CoT)',
    badge: 'Étape par étape',
  },
  {
    id: 'verify',
    titleKid: 'Brouillon + Double Vérification',
    titleAdult: 'Test-Time Compute + Auto-Vérification',
    badge: 'Fiabilité maximale',
  },
];

export function ReasoningStation({
  ageMode,
  unlocked,
  onUnlock,
  onGoToQuiz,
}: ReasoningStationProps) {
  const [mode, setMode] = useState<ReasoningMode>('direct');
  const [steps, setSteps] = useState<number>(3);

  const sim = useMemo(() => simulateReasoningBudget(mode, steps), [mode, steps]);

  const handleListen = () => {
    playClick();
    speakFrench(
      ageMode === 'kid'
        ? 'Énigme : Lumi a 3 paniers de 4 pommes et en offre 5. Sans carnet de brouillon il répond trop vite et se trompe. Avec son carnet étape par étape, il trouve 7 pommes !'
        : 'Les modèles de raisonnement génèrent des tokens de pensée intermédiaires avant de répondre : chaque étape augmente le budget de calcul et permet l’auto-vérification.'
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      {/* Header */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
        <div className="lg:col-span-5 h-48 overflow-hidden rounded-xl border border-[#E5DAC5] bg-[#131D38]">
          <ArtImage
            src={ART_ASSETS.reasoning}
            alt="Carnet illuminé projetant des marches dorées vers un cristal vert résolu"
            fallbackTitle="Raisonnement & Brouillon"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#047857]">
              Station 8 · Chapitre II · Réfléchir avant de répondre
            </span>
            <button
              type="button"
              onClick={handleListen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#047857]/40 bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857] hover:bg-[#D1FAE5] cursor-pointer whitespace-nowrap"
            >
              <span>Écouter l’énigme</span>
            </button>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#172033]">
            {ageMode === 'kid'
              ? 'Le Carnet de Brouillon Magique'
              : 'Raisonnement : Chain-of-Thought & Test-Time Compute'}
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[#46536E]">
            {ageMode === 'kid'
              ? 'Teste cette énigme : « Lumi a 3 paniers avec 4 pommes chacun, puis il offre 5 pommes. Combien en reste-t-il ? » Compare la réponse trop rapide et le Carnet de Brouillon !'
              : 'Un Transformer dispose d’un nombre fixe de couches par token généré. Découvrez comment les tokens de pensée (<think>) débloquent le raisonnement multi-étapes.'}
          </p>
        </div>
      </section>

      {/* Interactive Reasoning Comparison */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
          <div className="rounded-xl border border-[#E5DAC5] bg-[#FBF7EF] p-3.5 text-sm font-semibold text-[#172033]">
            Énigme testée : « 3 paniers × 4 pommes, moins 5 pommes offertes = ? »
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MODES.map((item) => {
              const selected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playBeadPop();
                    setMode(item.id);
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-[#047857] bg-[#ECFDF5] shadow-xs'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] hover:border-[#047857]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#047857]">{item.badge}</div>
                  <div className="mt-1 font-display text-sm font-extrabold text-[#172033]">
                    {ageMode === 'kid' ? item.titleKid : item.titleAdult}
                  </div>
                </button>
              );
            })}
          </div>

          {mode !== 'direct' && (
            <div className="rounded-xl border border-[#E5DAC5] bg-[#FBF7EF] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                <label htmlFor="reasoning-steps-slider">
                  {ageMode === 'kid' ? 'Nombre d’étapes dans le carnet' : 'Budget Test-Time (étapes de pensée)'}
                </label>
                <span className="font-mono text-[#047857] tabular-nums">
                  {steps} étapes · {sim.thinkingTokens} tokens
                </span>
              </div>
              <input
                id="reasoning-steps-slider"
                type="range"
                min={1}
                max={5}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full accent-[#047857] cursor-pointer"
              />
            </div>
          )}

          {/* Step-by-Step Trace */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#53607A]">
              {ageMode === 'kid' ? 'Dans le carnet de Lumi :' : 'Trace de réflexion (<think> tokens) :'}
            </div>
            <ol className="space-y-2">
              {(ageMode === 'kid' ? sim.stepsKid : sim.stepsAdult).map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-[#E6DCC8] bg-[#FBF7EF] p-3 text-xs md:text-sm text-[#1E2B42]"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#131D38] text-[11px] font-bold text-[#F6C453]">
                    {idx + 1}
                  </span>
                  <span className={ageMode === 'adult' ? 'font-mono text-xs leading-relaxed' : ''}>
                    {line}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right Telemetry & Verdict */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#1E2D55] bg-[#131D38] p-5 text-[#FBF7EF] shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-[#1B294A] p-3">
                <div className="text-[11px] text-[#AFC0DF]">Fiabilité</div>
                <div className="font-display text-2xl font-extrabold text-[#34D399] tabular-nums">
                  {sim.accuracyPercent}%
                </div>
              </div>
              <div className="rounded-xl bg-[#1B294A] p-3">
                <div className="text-[11px] text-[#AFC0DF]">Tokens</div>
                <div className="font-display text-2xl font-extrabold text-[#F6C453] tabular-nums">
                  {sim.thinkingTokens}
                </div>
              </div>
              <div className="rounded-xl bg-[#1B294A] p-3">
                <div className="text-[11px] text-[#AFC0DF]">Temps</div>
                <div className="font-display text-2xl font-extrabold text-[#7DD3FC] tabular-nums">
                  {sim.latencySec}s
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl border-2 p-4 space-y-1.5 ${
                sim.isCorrect
                  ? 'border-[#34D399] bg-[#064E3B]/45'
                  : 'border-[#FB7185] bg-[#881337]/40'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">
                {sim.isCorrect ? 'Réponse validée ✓' : 'Erreur impulsive ✗'}
              </div>
              <p className="text-sm leading-relaxed">
                {ageMode === 'kid' ? sim.finalAnswerKid : sim.finalAnswerAdult}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0D152B] p-3.5 text-xs text-[#BFD0EC] leading-relaxed">
            <strong className="text-[#F6C453]">Pourquoi ça marche : </strong>
            {ageMode === 'kid'
              ? 'Écrire chaque calcul sur le brouillon permet de ne pas tout mélanger dans sa tête !'
              : 'En générant des tokens intermédiaires, le LLM transforme un problème trop profond en une chaîne de petits pas vérifiables par Self-Attention.'}
          </div>
        </div>
      </section>

      <QuickChallenge
        unlocked={unlocked}
        question={
          ageMode === 'kid'
            ? 'Que fait Lumi pour éviter de se tromper sur une énigme de maths difficile ?'
            : 'Pourquoi allouer des tokens de réflexion (Chain-of-Thought) améliore-t-il drastiquement le raisonnement ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'Il écrit les étapes une par une dans son Carnet de Brouillon et vérifie' },
                { id: 'b', label: 'Il répond le premier nombre qui lui passe par la tête' },
                { id: 'c', label: 'Il éteint toutes ses lampes magiques' },
              ]
            : [
                {
                  id: 'a',
                  label: 'Chaque étape écrite ajoute du calcul à l’inférence et devient une mémoire de travail vérifiable par l’attention',
                },
                {
                  id: 'b',
                  label: 'Parce que le Chain-of-Thought supprime totalement les poids du réseau',
                },
                {
                  id: 'c',
                  label: 'Uniquement parce que la réponse est affichée en police plus grande',
                },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! Tu viens de remporter le 8e et dernier Cristal de l’Atelier !'
            : 'Excellent ! Vous maîtrisez désormais le cycle complet des LLM modernes jusqu’au Test-Time Compute.'
        }
        retryNote="Indice : compare le mode « Réponse Express » et le mode « Carnet de Brouillon » ci-dessus !"
        onUnlock={onUnlock}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGoToQuiz}
          className="inline-flex items-center gap-2 rounded-xl bg-[#E8A62E] px-5 py-3 text-sm font-bold text-[#131D38] hover:bg-[#F3B946] transition-colors cursor-pointer"
        >
          <span>Lancer le Grand Quiz Adaptatif →</span>
        </button>
      </div>
    </main>
  );
}

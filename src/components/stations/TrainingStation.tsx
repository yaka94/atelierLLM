import { useMemo, useState } from 'react';
import { ART_ASSETS } from '../../game/content';
import { simulateTrainingStage } from '../../game/llmEngine';
import { playBeadPop, playClick, speakFrench } from '../../game/sound';
import type { AgeMode, TrainingStageKind } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface TrainingStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

const STAGES: {
  id: TrainingStageKind;
  titleKid: string;
  titleAdult: string;
  tagKid: string;
  tagAdult: string;
  descKid: string;
  descAdult: string;
}[] = [
  {
    id: 'pretrain',
    titleKid: '1. Lire des Millions de Livres',
    titleAdult: '1. Pré-entraînement (Base Model)',
    tagKid: 'Deviner le mot caché',
    tagAdult: 'Next-Token Prediction · Corpus massif',
    descKid:
      'Lumi lit des montagnes de livres en essayant de deviner chaque mot caché. Il devient super savant, mais il ne sait pas encore faire la conversation !',
    descAdult:
      'Descente de gradient auto-supervisée (Cross-Entropy) sur des billions de tokens. Le modèle compresse la connaissance du monde, mais se comporte comme un pur compléteur de texte.',
  },
  {
    id: 'sft',
    titleKid: '2. L’École des Questions-Réponses',
    titleAdult: '2. Fine-Tuning Supervisé (SFT)',
    tagKid: 'Imiter de bons exemples',
    tagAdult: 'Dialogues annotés · Format Assistant',
    descKid:
      'Des professeurs montrent à Lumi des milliers de vraies conversations polies. Maintenant, quand tu poses une question, il te répond directement !',
    descAdult:
      'Affinage sur des paires (instruction → réponse idéale) rédigées par des experts. Le modèle adopte le format dialogue et apprend à suivre des consignes structurées.',
  },
  {
    id: 'rlhf',
    titleKid: '3. La Boussole aux Étoiles',
    titleAdult: '3. Alignement (RLHF / DPO)',
    tagKid: 'Utile, gentil et prudent',
    tagAdult: 'Préférences humaines · Modèle de récompense',
    descKid:
      'Des humains comparent deux réponses de Lumi et mettent une étoile dorée sur la plus claire et la plus sûre. Sa boussole apprend à dire « je ne sais pas » plutôt qu’inventer !',
    descAdult:
      'Optimisation par préférences humaines (RLHF / Direct Preference Optimization) : calibre utilité, sécurité, honnêteté épistémique et style de réponse.',
  },
];

export function TrainingStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: TrainingStationProps) {
  const [stage, setStage] = useState<TrainingStageKind>('pretrain');
  const [dataScale, setDataScale] = useState<number>(6);
  const [pickedPreference, setPickedPreference] = useState<'a' | 'b' | null>(null);

  const sim = useMemo(() => simulateTrainingStage(stage, dataScale), [stage, dataScale]);
  const activeMeta = STAGES.find((s) => s.id === stage) ?? STAGES[0];

  const handleListen = () => {
    playClick();
    speakFrench(
      ageMode === 'kid'
        ? `${activeMeta.titleKid}. ${activeMeta.descKid}`
        : `${activeMeta.titleAdult}. ${activeMeta.descAdult}`
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      {/* Header Banner */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
        <div className="lg:col-span-5 h-48 overflow-hidden rounded-xl border border-[#E5DAC5] bg-[#131D38]">
          <ArtImage
            src={ART_ASSETS.training}
            alt="Bibliothèque dorée et balance d'étoiles illustrant l'entraînement et l'alignement d'un LLM"
            fallbackTitle="Entraînement & Alignement"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#B45309]">
              Station 6 · Chapitre II · Apprendre avant de parler
            </span>
            <button
              type="button"
              onClick={handleListen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4A449] bg-[#FEF6E6] px-3 py-1 text-xs font-bold text-[#8C530A] hover:bg-[#FDECC8] cursor-pointer whitespace-nowrap"
            >
              <span>Écouter l’explication</span>
            </button>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#172033]">
            {ageMode === 'kid'
              ? 'L’École des Livres et la Boussole'
              : 'Cycle de vie : Pré-entraînement, SFT & Alignement RLHF'}
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[#46536E]">
            {ageMode === 'kid'
              ? 'Avant de discuter avec toi, Lumi passe par 3 grandes classes à l’école ! Clique sur chaque étape pour voir comment ses réponses s’améliorent.'
              : 'Un LLM ne naît pas assistant : explorez la différence entre un modèle de base (pré-entraîné), un modèle instruit (SFT) et un modèle aligné par préférences humaines (RLHF/DPO).'}
          </p>
        </div>
      </section>

      {/* Interactive 3-Stage Training Lab */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[#172033]">
              {ageMode === 'kid' ? 'Choisis la classe de Lumi' : 'Pipeline d’entraînement en 3 phases'}
            </h2>
            <p className="text-xs text-[#53607A]">
              {ageMode === 'kid'
                ? 'Regarde comment la même question donne une réponse différente à chaque étape !'
                : 'Observez l’impact de chaque phase et de l’échelle de données sur la perte (Loss) et l’alignement.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STAGES.map((item) => {
              const selected = stage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playBeadPop();
                    setStage(item.id);
                  }}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-[#B45309] bg-[#FFFBEB] shadow-xs'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] hover:border-[#C97714]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-[#B45309]">
                      {ageMode === 'kid' ? item.tagKid : item.tagAdult}
                    </div>
                    <div className="font-display text-sm font-extrabold text-[#172033]">
                      {ageMode === 'kid' ? item.titleKid : item.titleAdult}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Data / Compute Scale Slider */}
          <div className="rounded-xl border border-[#E6DCC8] bg-[#FBF7EF] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
              <label htmlFor="training-scale-slider">
                {ageMode === 'kid'
                  ? 'Quantité de livres & d’exercices'
                  : 'Échelle de données & calcul (Scaling Law)'}
              </label>
              <span className="font-mono text-[#B45309] tabular-nums">
                Niveau {dataScale}/10 · Loss {sim.lossValue}
              </span>
            </div>
            <input
              id="training-scale-slider"
              type="range"
              min={1}
              max={10}
              value={dataScale}
              onChange={(e) => setDataScale(Number(e.target.value))}
              className="w-full accent-[#C97714] cursor-pointer"
            />
            <p className="text-xs text-[#46536E] leading-relaxed">
              {ageMode === 'kid' ? activeMeta.descKid : activeMeta.descAdult}
            </p>
          </div>

          {/* Simulated Live Prompt Response Box */}
          <div className="rounded-xl border-2 border-[#131D38] bg-[#131D38] p-4 text-[#FBF7EF] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#F6C453]">
              <span>Sortie observée à cette étape</span>
              <span className="font-mono uppercase">{stage}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#E6ECF8]">
              {ageMode === 'kid' ? sim.sampleOutputKid : sim.sampleOutputAdult}
            </p>
          </div>
        </div>

        {/* Right Column: Live Gauges + Interactive Mini-RLHF Preference Vote */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm space-y-3.5">
            <h3 className="font-display text-base font-bold text-[#172033]">
              {ageMode === 'kid' ? 'Bulletin de Lumi' : 'Métriques de comportement'}
            </h3>

            {[
              {
                label: ageMode === 'kid' ? 'Comprend ta question' : 'Suivi d’instructions (SFT)',
                value: sim.instructionFollowing,
                color: '#0F769E',
              },
              {
                label: ageMode === 'kid' ? 'Boussole gentille & prudente' : 'Alignement & sécurité (RLHF)',
                value: sim.safetyAlignment,
                color: '#0E7A5F',
              },
              {
                label: ageMode === 'kid' ? 'Richesse du vocabulaire' : 'Connaissance générale (Base)',
                value: sim.creativityBalance,
                color: '#C97714',
              },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2E3B55]">
                  <span>{bar.label}</span>
                  <span className="font-mono tabular-nums">{bar.value}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFE8DA]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive RLHF Mini-Judge */}
          <div className="rounded-2xl border border-[#DDD3BE] bg-[#F3ECDD] p-5 space-y-3">
            <div className="text-xs font-bold text-[#8C530A]">
              {ageMode === 'kid' ? 'À toi de jouer le professeur (RLHF) !' : 'Mini-atelier RLHF / DPO : donnez votre préférence'}
            </div>
            <p className="text-xs text-[#46536E]">
              {ageMode === 'kid'
                ? 'Quelle réponse mérite l’étoile dorée pour « Est-ce que les chats volent ? »'
                : 'Quelle complétion doit recevoir la récompense positive pour calibrated honesty ?'}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  playBeadPop();
                  setPickedPreference('a');
                  setStage('rlhf');
                }}
                className={`rounded-xl border p-3 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  pickedPreference === 'a'
                    ? 'border-[#0E7A5F] bg-[#ECFDF5] text-[#065F46]'
                    : 'border-[#D4C7AE] bg-white text-[#172033] hover:border-[#0E7A5F]'
                }`}
              >
                A. « Non, les chats ne volent pas ! Ils sautent très haut grâce à leurs pattes souples. »
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setPickedPreference('b');
                }}
                className={`rounded-xl border p-3 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  pickedPreference === 'b'
                    ? 'border-[#C2412D] bg-[#FEF2F2] text-[#991B1B]'
                    : 'border-[#D4C7AE] bg-white text-[#172033] hover:border-[#C2412D]'
                }`}
              >
                B. « Bien sûr, les chats déploient des ailes secrètes tous les mardis ! »
              </button>
            </div>
            {pickedPreference && (
              <p className="text-xs font-medium text-[#172033]">
                {pickedPreference === 'a'
                  ? 'Étoile attribuée ★ ! Le modèle de récompense renforce les réponses exactes et claires.'
                  : 'Oups ! Récompenser une invention fausse apprendrait au modèle à halluciner avec assurance.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Station QuickChallenge */}
      <QuickChallenge
        unlocked={unlocked}
        question={
          ageMode === 'kid'
            ? 'Pourquoi le robot passe-t-il par l’étape « Boussole aux Étoiles » après avoir lu tous ses livres ?'
            : 'Pourquoi un modèle pré-entraîné (Base) a-t-il besoin des étapes SFT puis RLHF/DPO ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'Pour apprendre à répondre gentiment, clairement et sans inventer' },
                { id: 'b', label: 'Pour oublier tous les mots qu’il vient de lire' },
                { id: 'c', label: 'Pour transformer ses perles en bonbons' },
              ]
            : [
                {
                  id: 'a',
                  label: 'Pour passer d’un simple compléteur de texte à un assistant aligné qui suit les consignes avec discernement',
                },
                {
                  id: 'b',
                  label: 'Pour remplacer le tokenizer BPE par un algorithme JPEG',
                },
                {
                  id: 'c',
                  label: 'Pour augmenter volontairement la perte Cross-Entropy en inférence',
                },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! Tu viens de gagner le Cristal de l’École & la Boussole !'
            : 'Exact ! Pré-entraînement (savoir), SFT (dialogue) et RLHF/DPO (alignement) forment le triptyque moderne.'
        }
        retryNote="Indice : lire des millions de livres ne suffit pas à savoir dialoguer de façon utile et fiable !"
        onUnlock={onUnlock}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNextStation}
          className="inline-flex items-center gap-2 rounded-xl bg-[#131D38] px-5 py-3 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
        >
          <span>Station 7 : Contexte, RAG &amp; Outils →</span>
        </button>
      </div>
    </main>
  );
}

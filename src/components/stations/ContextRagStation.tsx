import { useMemo, useState } from 'react';
import { ART_ASSETS } from '../../game/content';
import { simulateContextAndRag } from '../../game/llmEngine';
import { playBeadPop, playClick, speakFrench } from '../../game/sound';
import type { AgeMode } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface ContextRagStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

const MEMORY_BLOCKS = [
  { id: 1, zone: 'start', labelKid: 'Prénom du héros', labelAdult: 'System Prompt & règles' },
  { id: 2, zone: 'middle', labelKid: 'Couleur du dragon', labelAdult: 'Extrait PDF page 14' },
  { id: 3, zone: 'middle', labelKid: 'Clé cachée', labelAdult: 'Tableau financier Q2' },
  { id: 4, zone: 'end', labelKid: 'Dernière question', labelAdult: 'Requête utilisateur active' },
];

export function ContextRagStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: ContextRagStationProps) {
  const [windowCapK, setWindowCapK] = useState<number>(32);
  const [usedContextK, setUsedContextK] = useState<number>(28);
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [toolsEnabled, setToolsEnabled] = useState<boolean>(false);

  const sim = useMemo(
    () => simulateContextAndRag(windowCapK, usedContextK, ragEnabled, toolsEnabled),
    [windowCapK, usedContextK, ragEnabled, toolsEnabled]
  );

  const handleListen = () => {
    playClick();
    speakFrench(
      ageMode === 'kid'
        ? 'Le sac à dos mémoire a une taille limitée. S’il déborde, Lumi oublie le début ! Mais avec un livre-bibliothèque et une calculatrice, il retrouve tout juste.'
        : 'La fenêtre de contexte est la mémoire de travail du LLM. Le RAG injecte des documents externes à jour et le Tool Calling délègue les calculs exacts à des outils.'
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      {/* Header */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
        <div className="lg:col-span-5 h-48 overflow-hidden rounded-xl border border-[#E5DAC5] bg-[#131D38]">
          <ArtImage
            src={ART_ASSETS.contextRag}
            alt="Sacoche mémoire lumineuse reliée à un fichier de bibliothèque, une loupe et une calculatrice"
            fallbackTitle="Contexte, RAG & Outils"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0369A1]">
              Station 7 · Chapitre II · Mémoire de travail & Outils externes
            </span>
            <button
              type="button"
              onClick={handleListen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0369A1]/40 bg-[#F0F9FF] px-3 py-1 text-xs font-bold text-[#0369A1] hover:bg-[#E0F2FE] cursor-pointer whitespace-nowrap"
            >
              <span>Écouter l’explication</span>
            </button>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#172033]">
            {ageMode === 'kid'
              ? 'Le Sac à Dos Mémoire & les Loupes Magiques'
              : 'Fenêtre de Contexte, RAG & Agents (Tool Calling)'}
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[#46536E]">
            {ageMode === 'kid'
              ? 'Un robot n’a pas une mémoire infinie ! Remplis son sac à dos pour voir ce qui tombe dehors, puis prête-lui sa bibliothèque (RAG) et sa calculatrice.'
              : 'Explorez l’éviction de la fenêtre de contexte, l’effet « Lost in the Middle » et comment le RAG + l’appel d’outils transforment un LLM en véritable agent fiable.'}
          </p>
        </div>
      </section>

      {/* Interactive Context + RAG/Tools Lab */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#DDD3BE] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5DAC5] bg-[#FBF7EF] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                <label htmlFor="ctx-cap-slider">
                  {ageMode === 'kid' ? 'Taille du sac à dos' : 'Fenêtre max (Context Window)'}
                </label>
                <span className="font-mono text-[#0369A1] tabular-nums">{windowCapK}k tokens</span>
              </div>
              <input
                id="ctx-cap-slider"
                type="range"
                min={8}
                max={128}
                step={8}
                value={windowCapK}
                onChange={(e) => setWindowCapK(Number(e.target.value))}
                className="w-full accent-[#0369A1] cursor-pointer"
              />
            </div>

            <div className="rounded-xl border border-[#E5DAC5] bg-[#FBF7EF] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                <label htmlFor="ctx-used-slider">
                  {ageMode === 'kid' ? 'Longueur de la discussion' : 'Tokens injectés dans le prompt'}
                </label>
                <span className="font-mono text-[#C2412D] tabular-nums">{usedContextK}k tokens</span>
              </div>
              <input
                id="ctx-used-slider"
                type="range"
                min={4}
                max={140}
                step={4}
                value={usedContextK}
                onChange={(e) => setUsedContextK(Number(e.target.value))}
                className="w-full accent-[#C2412D] cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Memory Strip showing Eviction + Lost-in-the-Middle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#46536E]">
              <span>
                {ageMode === 'kid'
                  ? 'Ce qui reste dans la tête de Lumi'
                  : 'Courbe de rappel attentionnel (Lost in the Middle)'}
              </span>
              <span className="font-mono tabular-nums">
                {sim.evictedPercent > 0
                  ? `Débordement : ${sim.evictedPercent}% oublié !`
                  : `Rempli à ${sim.fillPercent}%`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {MEMORY_BLOCKS.map((blk) => {
                const recall =
                  blk.zone === 'start'
                    ? sim.beginningRecall
                    : blk.zone === 'middle'
                    ? sim.middleRecall
                    : sim.endRecall;
                const evicted = blk.zone === 'start' && sim.evictedPercent > 20;
                return (
                  <div
                    key={blk.id}
                    className={`rounded-xl border p-3 transition-all ${
                      evicted
                        ? 'border-[#F5B7B1] bg-[#FEF2F2] opacity-75'
                        : recall < 55
                        ? 'border-[#F3D08B] bg-[#FFFBEB]'
                        : 'border-[#BAE6FD] bg-[#F0F9FF]'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#172033]">
                      {ageMode === 'kid' ? blk.labelKid : blk.labelAdult}
                    </div>
                    <div className="mt-1.5 font-mono text-xs font-extrabold tabular-nums text-[#0369A1]">
                      {evicted ? 'Évincé !' : `Rappel ${recall}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RAG & Tool Calling Switches */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playBeadPop();
                setRagEnabled((v) => !v);
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                ragEnabled
                  ? 'border-[#0E7A5F] bg-[#ECFDF5]'
                  : 'border-[#DDD3BE] bg-[#FBF7EF] hover:border-[#0369A1]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#172033]">
                  {ageMode === 'kid' ? '📚 Bibliothèque (RAG)' : 'RAG · Base vectorielle'}
                </span>
                <span className={ragEnabled ? 'text-[#0E7A5F]' : 'text-[#64748B]'}>
                  {ragEnabled ? 'ACTIF ✓' : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Cherche la bonne page dans les livres à jour !'
                  : 'Récupère les chunks pertinents et les injecte dans le prompt.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                playBeadPop();
                setToolsEnabled((v) => !v);
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                toolsEnabled
                  ? 'border-[#0E7A5F] bg-[#ECFDF5]'
                  : 'border-[#DDD3BE] bg-[#FBF7EF] hover:border-[#0369A1]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#172033]">
                  {ageMode === 'kid' ? '🧮 Calculatrice & Outils' : 'Agents · Tool Calling'}
                </span>
                <span className={toolsEnabled ? 'text-[#0E7A5F]' : 'text-[#64748B]'}>
                  {toolsEnabled ? 'ACTIF ✓' : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Calcule juste au lieu de deviner les chiffres !'
                  : 'Appelle une fonction déterministe (`calc()`, API web, code).'}
              </p>
            </button>
          </div>
        </div>

        {/* Right Result Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#1E2D55] bg-[#131D38] p-5 text-[#FBF7EF] shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7DD3FC]">Fiabilité factuelle estimée</span>
              <span className="font-display text-3xl font-extrabold text-[#F6C453] tabular-nums">
                {sim.factualAccuracy}%
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#1E2D55]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sim.factualAccuracy}%`,
                  backgroundColor: sim.factualAccuracy >= 80 ? '#34D399' : '#F6C453',
                }}
              />
            </div>

            <div className="rounded-xl border border-white/15 bg-[#1B294A] p-4 space-y-2">
              <div className="text-xs font-bold text-[#F6D58E]">
                {ageMode === 'kid' ? 'Ce que répond Lumi :' : 'Comportement du système :'}
              </div>
              <p className="text-sm leading-relaxed text-[#E3EBF9]">
                {ageMode === 'kid' ? sim.answerPreviewKid : sim.answerPreviewAdult}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0D152B] p-3.5 text-xs text-[#BFD0EC] leading-relaxed">
            <strong className="text-[#F6C453]">Point clé Neurosciences : </strong>
            {ageMode === 'kid'
              ? 'Comme ton cerveau utilise un cahier pour ne pas tout retenir par cœur, un LLM s’aide du RAG et de ses outils !'
              : 'La mémoire paramétrique (poids figés) ne suffit pas : le RAG apporte la fraîcheur, les outils apportent le déterminisme.'}
          </div>
        </div>
      </section>

      <QuickChallenge
        unlocked={unlocked}
        question={
          ageMode === 'kid'
            ? 'Lumi veut calculer 24 × 17 et connaître le score du match d’hier. De quoi a-t-il besoin ?'
            : 'Quel duo permet à un LLM d’accéder à des documents récents ET d’exécuter un calcul arithmétique sans erreur ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'Sa bibliothèque (RAG) et sa calculatrice-outil' },
                { id: 'b', label: 'De fermer les yeux et deviner très fort' },
                { id: 'c', label: 'De jeter son sac à dos par la fenêtre' },
              ]
            : [
                { id: 'a', label: 'RAG (recherche documentaire externe) + Tool Calling (appel d’outils déterministes)' },
                { id: 'b', label: 'Augmenter la température Softmax à 2.0' },
                { id: 'c', label: 'Supprimer le KV-Cache de toutes les couches' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! Tu as gagné le Cristal du Sac à Dos & des Loupes !'
            : 'Parfait ! RAG + Tool Calling sont les fondations des systèmes agentiques modernes.'
        }
        retryNote="Indice : active les deux boutons (Bibliothèque RAG + Calculatrice/Outils) pour voir la fiabilité bondir !"
        onUnlock={onUnlock}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNextStation}
          className="inline-flex items-center gap-2 rounded-xl bg-[#131D38] px-5 py-3 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
        >
          <span>Station 8 : Raisonnement CoT →</span>
        </button>
      </div>
    </main>
  );
}

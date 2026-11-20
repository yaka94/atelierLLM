import { useEffect, useMemo, useState } from 'react';
import { ART_ASSETS } from '../../game/content';
import { simulateArchitectureMetrics } from '../../game/llmEngine';
import { playClick, playLayerPulse } from '../../game/sound';
import type { AgeMode, ArchitectureKind } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface LayersStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

const ARCH_OPTIONS: { id: ArchitectureKind; labelKid: string; labelAdult: string; summary: string }[] = [
  {
    id: 'transformer',
    labelKid: 'Tour Classique (Loupes partout)',
    labelAdult: 'Transformer classique',
    summary: 'Relit toute la phrase à chaque étage (mémoire coûteuse sur longs textes)',
  },
  {
    id: 'moe',
    labelKid: 'Tour des Experts (MoE)',
    labelAdult: 'Équipe d’Experts (MoE)',
    summary: 'N’active que 2 spécialistes sur 8 par mot pour aller plus vite',
  },
  {
    id: 'lfm3',
    labelKid: 'Tour Liquide Rapide (LFM3)',
    labelAdult: 'Hybride LFM3 (Liquide + Attention)',
    summary: 'Résume en continu (mémoire légère) + attention ciblée là où il faut',
  },
];

export function LayersStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: LayersStationProps) {
  const [arch, setArch] = useState<ArchitectureKind>('lfm3');
  const [contextK, setContextK] = useState(32);
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [animatingFloor, setAnimatingFloor] = useState<number | null>(null);

  const sim = useMemo(
    () => simulateArchitectureMetrics(arch, contextK),
    [arch, contextK]
  );

  // Step-by-step light packet animation climbing floors 1 -> 6
  useEffect(() => {
    if (animatingFloor === null) return;
    playLayerPulse(animatingFloor);
    setSelectedFloor(animatingFloor);

    const timer = window.setTimeout(() => {
      if (animatingFloor < 6) {
        setAnimatingFloor(animatingFloor + 1);
      } else {
        setAnimatingFloor(null);
      }
    }, 480);

    return () => window.clearTimeout(timer);
  }, [animatingFloor]);

  const activeFloorSpec =
    sim.floors.find((f) => f.floor === selectedFloor) ?? sim.floors[0];

  const floorBadgeStyle = (kind: string) => {
    switch (kind) {
      case 'liquid':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]';
      case 'attention':
        return 'bg-[#E0F2FE] text-[#075985] border-[#0284C7]';
      case 'moe':
        return 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]';
      case 'output':
        return 'bg-[#FCE7F3] text-[#9D174D] border-[#EC4899]';
      default:
        return 'bg-[#F3ECDD] text-[#37435A] border-[#CFC3AB]';
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Interactive 6-Floor Architecture Tower & Telemetry */}
        <section className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#0E7A5F]">
                Station 3 · {ageMode === 'kid' ? 'Les Étages de la Tour Magique' : 'Empiler des couches d’analyse (Transformer, MoE & LFM3)'}
              </div>
              <h1 className="font-display text-2xl font-extrabold text-[#172033]">
                {ageMode === 'kid'
                  ? 'Comment les perles voyagent d’étage en étage ?'
                  : 'Comment une phrase se transforme d’étage en étage'}
              </h1>
              {ageMode === 'adult' && (
                <p className="text-xs md:text-sm text-[#46536E] max-w-2xl">
                  <strong className="text-[#0E7A5F]">En clair :</strong> un LLM est un immeuble d’étages (couches). Les premiers étages repèrent la grammaire, ceux du milieu saisissent les idées, et les derniers préparent la réponse. Comparez 3 façons de bâtir cet immeuble :
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAnimatingFloor(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0E7A5F] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0A614B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{animatingFloor !== null ? `Étage ${animatingFloor}/6…` : 'Lancer un flux de token ▲'}</span>
            </button>
          </div>

          {/* Architecture Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="group" aria-label="Choix de l'architecture">
            {ARCH_OPTIONS.map((opt) => {
              const active = arch === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setArch(opt.id);
                  }}
                  className={`rounded-xl border-2 p-3 text-left transition-all duration-150 cursor-pointer ${
                    active
                      ? 'border-[#0E7A5F] bg-[#ECFDF5] text-[#064E3B] shadow-xs'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#37435A] hover:border-[#0E7A5F]/50'
                  }`}
                >
                  <div className="text-sm font-extrabold">
                    {ageMode === 'kid' ? opt.labelKid : opt.labelAdult}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">{opt.summary}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Context Length Slider */}
          <div className="rounded-xl border border-[#E6DEC9] bg-[#FBF7EF] p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
              <label htmlFor="context-slider" className="text-[#172033]">
                {ageMode === 'kid'
                  ? 'Taille de l’histoire lue en même temps'
                  : 'Longueur de la fenêtre de contexte (N tokens)'}
              </label>
              <span className="font-mono text-sm font-bold text-[#0F769E] tabular-nums">
                {contextK}k tokens ({contextK <= 8 ? 'court' : contextK <= 32 ? 'un livre entier' : 'une bibliothèque !'})
              </span>
            </div>
            <input
              id="context-slider"
              type="range"
              min={1}
              max={128}
              step={1}
              value={contextK}
              onChange={(e) => setContextK(Number(e.target.value))}
              className="w-full accent-[#0E7A5F] cursor-pointer"
            />

            {/* Live Performance Gauges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg border border-[#E2D8C4] bg-white p-2.5">
                <div className="text-[11px] font-semibold text-[#53607A]">
                  {ageMode === 'kid' ? 'Vitesse' : 'Débit (tok/s)'}
                </div>
                <div className="font-display text-xl font-extrabold text-[#0E7A5F] tabular-nums">
                  {sim.tokensPerSec} <span className="text-xs font-normal">t/s</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-[#EFE8DA] overflow-hidden">
                  <div
                    className="h-full bg-[#0E7A5F] transition-all duration-200"
                    style={{ width: `${Math.min(100, (sim.tokensPerSec / 195) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#E2D8C4] bg-white p-2.5">
                <div className="text-[11px] font-semibold text-[#53607A]">
                  {ageMode === 'kid' ? 'Sac à dos mémoire' : 'Mémoire KV-Cache'}
                </div>
                <div
                  className={`font-display text-xl font-extrabold tabular-nums ${
                    sim.kvCacheGb > 60 ? 'text-[#C2412D]' : 'text-[#0F769E]'
                  }`}
                >
                  {sim.kvCacheGb.toFixed(1)} <span className="text-xs font-normal">Go</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-[#EFE8DA] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      sim.kvCacheGb > 60 ? 'bg-[#C2412D]' : 'bg-[#0F769E]'
                    }`}
                    style={{ width: `${Math.min(100, (sim.kvCacheGb / 185) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#E2D8C4] bg-white p-2.5">
                <div className="text-[11px] font-semibold text-[#53607A]">
                  {ageMode === 'kid' ? 'Économie d’énergie' : 'Efficacité / Param. actifs'}
                </div>
                <div className="font-display text-xl font-extrabold text-[#C97714] tabular-nums">
                  {sim.energyEfficiency}%
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#53607A] tabular-nums">
                  Actifs : {sim.activeParamRatio}%
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 6-Floor Tower (Bottom floor 1 -> Top floor 6) */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#53607A]">
              <span>Clique sur un étage pour inspecter la transformation du token (du bas vers le haut) :</span>
              <span className="font-mono text-[#0E7A5F]">Entrée → Étage {selectedFloor}/6 → Sortie</span>
            </div>
            <div className="flex flex-col-reverse gap-1.5">
              {sim.floors.map((floor) => {
                const isSelected = floor.floor === selectedFloor;
                const isPulsing = floor.floor === animatingFloor;

                return (
                  <button
                    key={floor.floor}
                    type="button"
                    onClick={() => {
                      playLayerPulse(floor.floor);
                      setSelectedFloor(floor.floor);
                    }}
                    className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2 text-left transition-all duration-150 cursor-pointer ${
                      isPulsing
                        ? 'border-[#E8A62E] bg-[#FEF3C7] scale-[1.01] shadow-md'
                        : isSelected
                        ? 'border-[#131D38] bg-[#F3ECDD]'
                        : 'border-[#E6DEC9] bg-white hover:border-[#0E7A5F]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-extrabold tabular-nums ${floorBadgeStyle(
                          floor.kind
                        )}`}
                      >
                        {floor.floor}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#172033] truncate">
                          {ageMode === 'kid' ? floor.titleKid : floor.titleAdult}
                        </div>
                        <div className="text-xs text-[#53607A] truncate">
                          {ageMode === 'kid' ? floor.transformNoteKid : floor.transformNoteAdult}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {floor.activeExperts && (
                        <div className="hidden sm:flex items-center gap-1" aria-label="2 experts actifs sur 8">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((exp) => (
                            <span
                              key={exp}
                              className={`h-2.5 w-2.5 rounded-sm ${
                                floor.activeExperts?.includes(exp)
                                  ? 'bg-[#0E7A5F]'
                                  : 'bg-[#DDD3BE]'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="font-mono text-xs font-semibold text-[#0F769E] whitespace-nowrap">
                        {floor.complexity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Active Floor Inspector + Architectural Cutaway Artwork */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Floor Transformation Inspector */}
          <div className="rounded-2xl bg-[#131D38] p-4 text-[#FBF7EF] space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F6D58E]">
              <span>Étage {activeFloorSpec.floor} inspecté</span>
              <span className="font-mono text-[#93C5FD]">{activeFloorSpec.complexity}</span>
            </div>
            <div className="font-display text-base font-bold text-white">
              {ageMode === 'kid' ? activeFloorSpec.titleKid : activeFloorSpec.titleAdult}
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-[#E3E9F5]">
              {ageMode === 'kid' ? activeFloorSpec.roleKid : activeFloorSpec.roleAdult}
            </p>
            <div className="rounded-lg bg-[#1D2B4F] px-3 py-2 text-xs font-mono text-[#FDE68A]">
              {ageMode === 'kid'
                ? activeFloorSpec.transformNoteKid
                : activeFloorSpec.transformNoteAdult}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#DDD3BE] bg-white shadow-sm">
            <div className="h-44 w-full overflow-hidden">
              <ArtImage
                src={ART_ASSETS.layers}
                alt="Tour architecturale en coupe montrant conduits liquides dorés, lentilles d’attention et ateliers d’experts"
                fallbackTitle="La Tour des Étages"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h2 className="font-display text-base font-bold text-[#172033]">
                {ageMode === 'kid'
                  ? 'Pourquoi les toboggans liquides LFM3 vont si vite ?'
                  : 'Pourquoi les hybrides LFM3 changent la donne'}
              </h2>
              <p className="text-xs md:text-sm leading-relaxed text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Dans une tour classique, chaque mot doit relire tous les autres à chaque étage. La Tour Liquide (LFM3) utilise des toboggans fluides ultra rapides et garde seulement quelques grandes loupes au bon endroit.'
                  : 'Un Transformer dense stocke un KV-Cache sur chaque couche (coût O(N²)). Les hybrides LFM2/LFM3 remplacent la majorité des couches par des opérateurs liquides O(N) et n’intercalent l’attention GQA qu’à quelques étages stratégiques.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStation}
            className="rounded-xl bg-[#131D38] px-5 py-3 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
          >
            Station suivante : Vision &amp; Omni →
          </button>
        </aside>
      </div>

      <QuickChallenge
        question={
          ageMode === 'kid'
            ? 'Tu veux mettre une IA très rapide dans un petit robot de poche pour lire un très gros livre. Quelle tour choisis-tu ?'
            : 'À 128k tokens de contexte, pourquoi l’architecture hybride LFM3 consomme-t-elle bien moins de mémoire que le Transformer dense ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'La Tour Liquide (LFM3) : mémoire légère et super rapide' },
                { id: 'b', label: 'Une tour qui allume 100 loupes géantes à chaque étage' },
                { id: 'c', label: 'Une tour sans aucun toboggan' },
              ]
            : [
                { id: 'a', label: 'Ses blocs liquides maintiennent un état compressé O(N), limitant le KV-Cache aux rares couches d’attention' },
                { id: 'b', label: 'Elle supprime les tokens au-delà de 50 mots' },
                { id: 'c', label: 'Elle ne réalise aucune multiplication matricielle' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! La Tour Liquide LFM3 est rapide et légère même sur de très longues histoires. Cristal gagné !'
            : 'Exact ! L’hybridation couches liquides O(N) + attention ciblée réduit drastiquement le KV-Cache. Cristal gagné !'
        }
        retryNote={
          ageMode === 'kid'
            ? 'Glisse le curseur « Taille de l’histoire » à droite et compare les 3 tours : regarde laquelle reste la plus rapide !'
            : 'Testez 128k tokens ci-dessus et comparez la jauge KV-Cache entre Transformer Dense et Hybride LFM3.'
        }
        unlocked={unlocked}
        onUnlock={onUnlock}
      />
    </main>
  );
}

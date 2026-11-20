import { useMemo, useState } from 'react';
import { ART_ASSETS, VISION_PATCHES } from '../../game/content';
import { computeMultimodalStream } from '../../game/llmEngine';
import { playBeadPop, playClick } from '../../game/sound';
import type { AgeMode, ModalityMode } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface OmniStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

const MODALITY_MODES: { id: ModalityMode; kid: string; adult: string }[] = [
  { id: 'text', kid: 'Mots seuls', adult: 'LLM Texte seul' },
  { id: 'vision', kid: 'Yeux (Vision)', adult: 'Vision (VLM · ViT)' },
  { id: 'audio', kid: 'Oreilles (Cascade)', adult: 'Audio Cascadé (ASR→LLM)' },
  { id: 'omni', kid: 'Super Prisme OMNI', adult: 'Modèle OMNI Natif' },
];

export function OmniStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: OmniStationProps) {
  const [mode, setMode] = useState<ModalityMode>('omni');
  const [selectedPatches, setSelectedPatches] = useState<number[]>([2, 6, 9, 12]);
  const [activeAudio, setActiveAudio] = useState<string>('voice');

  const promptText =
    ageMode === 'kid' ? 'Que fait le chat ?' : 'Décris la scène et le ton de la voix';

  const result = useMemo(
    () => computeMultimodalStream(mode, selectedPatches, activeAudio, promptText),
    [mode, selectedPatches, activeAudio, promptText]
  );

  const togglePatch = (id: number) => {
    playBeadPop(id);
    setSelectedPatches((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((p) => p !== id)
          : prev
        : [...prev, id].slice(-6)
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Interactive Omni Prism Laboratory */}
        <section className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#7C4D9E]">
                Station 4 · {ageMode === 'kid' ? 'Yeux, Oreilles & Mots ensemble' : 'Architectures Vision (ViT) & Omni Natives'}
              </div>
              <h1 className="font-display text-2xl font-extrabold text-[#172033]">
                {ageMode === 'kid'
                  ? 'Le Prisme des 5 Sens (Vision & Omni)'
                  : 'Comment un modèle Omni unifie Vision, Audio et Texte'}
              </h1>
            </div>
            <div className="text-right tabular-nums">
              <div className="text-[11px] font-semibold text-[#53607A]">LATENCE ESTIMÉE</div>
              <div
                className={`font-display text-2xl font-extrabold ${
                  result.latencyMs <= 260 ? 'text-[#0E7A5F]' : 'text-[#C97714]'
                }`}
              >
                {result.latencyMs} ms
              </div>
            </div>
          </div>

          {/* Modality Mode Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Mode multimodal">
            {MODALITY_MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setMode(m.id);
                  }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-[#7C4D9E] bg-[#F3E8FF] text-[#4C1D95]'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#46536E] hover:border-[#7C4D9E]/50'
                  }`}
                >
                  {ageMode === 'kid' ? m.kid : m.adult}
                </button>
              );
            })}
          </div>

          {/* Interactive Inputs: 4x4 Vision Patch Mosaic + Audio Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 4x4 ViT Image Patch Grid */}
            <div
              className={`rounded-2xl border p-4 space-y-2.5 transition-opacity ${
                mode === 'vision' || mode === 'omni'
                  ? 'border-[#DDD3BE] bg-[#FBF7EF] opacity-100'
                  : 'border-[#E8E2D4] bg-[#F8F5EE] opacity-55'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                <span>
                  {ageMode === 'kid' ? '1. Clique sur les carrés de l’image' : '1. Grille de Patchs ViT (4×4)'}
                </span>
                <span className="font-mono text-[#0F769E] tabular-nums">
                  {selectedPatches.length} patchs
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {VISION_PATCHES.map((tile) => {
                  const active = selectedPatches.includes(tile.id);
                  const disabled = mode !== 'vision' && mode !== 'omni';
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => togglePatch(tile.id)}
                      aria-label={`Sélectionner le carré ${tile.label}`}
                      className={`flex h-14 flex-col items-center justify-center rounded-lg border-2 text-center transition-transform duration-150 ${
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                      } ${
                        active
                          ? 'border-[#131D38] shadow-sm scale-[1.02]'
                          : 'border-white/70 opacity-75'
                      }`}
                      style={{ backgroundColor: tile.color }}
                    >
                      <span className="text-lg leading-none" aria-hidden="true">
                        {tile.emoji}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold text-[#131D38] leading-tight truncate max-w-full px-0.5">
                        {tile.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio + Pipeline Steps */}
            <div className="flex flex-col justify-between gap-4">
              <div
                className={`rounded-2xl border p-4 space-y-2.5 transition-opacity ${
                  mode === 'audio' || mode === 'omni'
                    ? 'border-[#DDD3BE] bg-[#FBF7EF] opacity-100'
                    : 'border-[#E8E2D4] bg-[#F8F5EE] opacity-55'
                }`}
              >
                <div className="text-xs font-bold text-[#172033]">
                  {ageMode === 'kid' ? '2. Choisis un son à écouter' : '2. Flux Audio (Frames spectrogramme)'}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'voice', label: '🗣️ Voix' },
                    { id: 'music', label: '🎵 Musique' },
                    { id: 'laugh', label: '😄 Rire' },
                  ].map((clip) => (
                    <button
                      key={clip.id}
                      type="button"
                      disabled={mode !== 'audio' && mode !== 'omni'}
                      onClick={() => {
                        playBeadPop(2);
                        setActiveAudio(clip.id);
                      }}
                      className={`min-h-[44px] rounded-xl border text-xs font-bold transition-colors ${
                        mode !== 'audio' && mode !== 'omni'
                          ? 'cursor-not-allowed opacity-60 border-[#E2D8C4] bg-white'
                          : activeAudio === clip.id
                          ? 'border-[#0F769E] bg-[#E0F2FE] text-[#0C4A6E] cursor-pointer'
                          : 'border-[#E2D8C4] bg-white text-[#46536E] cursor-pointer hover:border-[#0F769E]'
                      }`}
                    >
                      {clip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pipeline Comparison Strip */}
              <div className="rounded-2xl border border-[#DDD3BE] bg-[#F3ECDD] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                  <span>Chaîne de traitement active</span>
                  <span className={result.isNativeUnified ? 'text-[#0E7A5F]' : 'text-[#8C530A]'}>
                    {result.isNativeUnified ? 'Fusion native unifiée' : 'Pipeline séquentiel'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  {result.pipelineSteps.map((step, i) => (
                    <span key={step} className="inline-flex items-center gap-1.5">
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[#172033] border border-[#DDD3BE]">
                        {step}
                      </span>
                      {i < result.pipelineSteps.length - 1 && (
                        <span aria-hidden="true" className="text-[#8C530A]">
                          →
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Latent Token Stream Output */}
          <div className="rounded-2xl bg-[#131D38] p-4 text-[#FBF7EF] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#F6D58E]">
                {ageMode === 'kid'
                  ? 'Dans le cerveau du robot, tout devient la même suite de perles :'
                  : `Séquence latente unifiée envoyée au backbone (${result.totalTokens} tokens) :`}
              </span>
              <span className="text-[#B6C5E2]">
                Bleu = Vision · Vert = Audio · Or = Texte
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.stream.map((item) => {
                const style =
                  item.modality === 'vision'
                    ? 'bg-[#0C4A6E] border-[#38BDF8] text-[#E0F2FE]'
                    : item.modality === 'audio'
                    ? 'bg-[#064E3B] border-[#34D399] text-[#D1FAE5]'
                    : 'bg-[#78350F] border-[#FBBF24] text-[#FEF3C7]';
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${style}`}
                  >
                    <div>{item.label}</div>
                    {ageMode === 'adult' && (
                      <div className="font-mono text-[10px] opacity-80">{item.tokenCode}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Omni Crystal Prism Illustration */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-[#DDD3BE] bg-white shadow-sm">
            <div className="h-56 w-full overflow-hidden">
              <ArtImage
                src={ART_ASSETS.omni}
                alt="Prisme de cristal fusionnant des carrés d’image, des ondes musicales et des perles dorées"
                fallbackTitle="Le Prisme Omni"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#172033]">
                {ageMode === 'kid' ? 'Un seul cristal pour tous les sens' : 'Pipeline cascadé vs Omni natif'}
              </h2>
              <p className="text-sm leading-relaxed text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Avant, il fallait 3 robots séparés : un pour écouter, un pour lire, un pour parler ! Avec un modèle Omni, les images en puzzle, les sons et les mots entrent tous dans le même prisme en une seule fois.'
                  : 'Dans un système audio cascadé (ASR → LLM → TTS), la transcription texte détruit l’intonation, l’émotion et multiplie la latence (~820 ms). Un modèle Omni projette nativement patchs visuels, trames audio et tokens texte dans le même espace latent : l’attention croisée relie instantanément un sourire sur l’image et un rire dans la voix.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStation}
            className="rounded-xl bg-[#131D38] px-5 py-3.5 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
          >
            Station suivante : Température &amp; Prédiction →
          </button>
        </aside>
      </div>

      <QuickChallenge
        question={
          ageMode === 'kid'
            ? 'Pour voir le dessin du chat roux et du soleil, comment le robot lit-il l’image ?'
            : 'Pourquoi un modèle Omni natif détecte-t-il mieux l’ironie dans une voix qu’un pipeline ASR → LLM ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'Il la découpe en petits carrés de puzzle transformés en perles' },
                { id: 'b', label: 'Il demande au chat de lui écrire une lettre' },
                { id: 'c', label: 'Il efface toutes les couleurs' },
              ]
            : [
                { id: 'a', label: 'Les trames audio entrent directement dans l’espace latent sans perdre prosodie ni intonation lors d’une transcription texte' },
                { id: 'b', label: 'Parce qu’il utilise uniquement des tokens texte' },
                { id: 'c', label: 'Parce qu’il augmente volontairement la latence à 2 secondes' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Super ! Chaque carré de l’image devient une perle lumineuse dans le Prisme Omni. Cristal gagné !'
            : 'Exact ! La fusion native préserve les indices prosodiques et visuels en réduisant la latence. Cristal gagné !'
        }
        retryNote={
          ageMode === 'kid'
            ? 'Clique sur plusieurs carrés de la grille 4×4 ci-dessus : regarde comment ils apparaissent en perles bleues !'
            : 'Comparez la chaîne « Audio Cascadé » et « Modèle OMNI Natif » dans le laboratoire ci-dessus.'
        }
        unlocked={unlocked}
        onUnlock={onUnlock}
      />
    </main>
  );
}

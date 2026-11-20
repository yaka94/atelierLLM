import { useMemo, useState } from 'react';
import { ART_ASSETS, TOKEN_PRESETS_ADULT, TOKEN_PRESETS_KID } from '../../game/content';
import { tokenizeText } from '../../game/llmEngine';
import { playBeadPop, playClick } from '../../game/sound';
import type { AgeMode } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface TokensStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

const BEAD_COLORS = [
  'bg-[#FEF3C7] border-[#D97706] text-[#78350F]',
  'bg-[#E0F2FE] border-[#0284C7] text-[#0C4A6E]',
  'bg-[#D1FAE5] border-[#059669] text-[#064E3B]',
  'bg-[#F3E8FF] border-[#7C3AED] text-[#4C1D95]',
  'bg-[#FFE4E6] border-[#E11D48] text-[#881337]',
];

export function TokensStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: TokensStationProps) {
  const presets = ageMode === 'kid' ? TOKEN_PRESETS_KID : TOKEN_PRESETS_ADULT;
  const [text, setText] = useState(presets[0]);
  const [bpeLevel, setBpeLevel] = useState(3);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);

  const result = useMemo(
    () => tokenizeText(text, ageMode, bpeLevel),
    [text, ageMode, bpeLevel]
  );

  const selectedToken = result.tokens[selectedTokenIdx] ?? result.tokens[0] ?? null;

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Illustration + Interactive Bead/BPE Stage */}
        <section className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#C97714]">
                Station 1 · {ageMode === 'kid' ? 'Découper les mots en perles' : 'Découper le texte en morceaux (Tokens & BPE)'}
              </div>
              <h1 className="font-display text-2xl font-extrabold text-[#172033]">
                {ageMode === 'kid'
                  ? 'L’Atelier des Perles de Mots (Les Tokens)'
                  : 'Comment une IA découpe vos phrases en Tokens'}
              </h1>
              {ageMode === 'adult' && (
                <p className="text-sm text-[#46536E] max-w-2xl">
                  <strong className="text-[#0E7A5F]">En clair :</strong> un ordinateur ne lit pas des lettres comme nous. Il découpe chaque phrase en morceaux fréquents appelés <em>tokens</em> (mots entiers ou syllabes) associés à un numéro.
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-right tabular-nums">
              <div>
                <div className="text-[11px] font-semibold text-[#53607A]">TOKENS</div>
                <div className="font-display text-2xl font-extrabold text-[#C97714]">
                  {result.tokens.length}
                </div>
              </div>
              {ageMode === 'adult' && (
                <div className="border-l border-[#E6DEC9] pl-4">
                  <div className="text-[11px] font-semibold text-[#53607A]">CAR / TOKEN</div>
                  <div className="font-display text-2xl font-extrabold text-[#0F769E]">
                    {result.compressionRatio.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preset Phrase Clickables */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#53607A]">
              {ageMode === 'kid'
                ? 'Clique sur une phrase rigolote ou écris la tienne :'
                : 'Testez une phrase d’exemple ou saisissez votre propre texte :'}
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    playClick();
                    setText(preset);
                    setSelectedTokenIdx(0);
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    text === preset
                      ? 'border-[#C97714] bg-[#FEF6E6] text-[#172033]'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#46536E] hover:border-[#C97714]/60'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Input */}
          <div>
            <label htmlFor="token-input" className="sr-only">
              Phrase à découper en tokens
            </label>
            <input
              id="token-input"
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSelectedTokenIdx(0);
              }}
              placeholder="Écris une phrase ici..."
              className="w-full rounded-xl border border-[#D4C7AE] bg-[#FBF7EF] px-4 py-3 text-base font-medium text-[#172033] focus:border-[#C97714] focus:outline-none"
            />
          </div>

          {/* Adult BPE Merge Depth Slider */}
          {ageMode === 'adult' && (
            <div className="rounded-xl border border-[#E6DEC9] bg-[#FBF7EF] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label htmlFor="bpe-slider" className="text-[#172033]">
                  Niveau de fusion BPE (Byte-Pair Encoding)
                </label>
                <span className="font-mono text-[#0F769E] tabular-nums">
                  {bpeLevel === 0
                    ? '0 · Caractères isolés'
                    : bpeLevel === 1
                    ? '1 · Bigrammes'
                    : bpeLevel === 2
                    ? '2 · Racines & suffixes'
                    : '3 · Vocabulaire BPE complet'}
                </span>
              </div>
              <input
                id="bpe-slider"
                type="range"
                min={0}
                max={3}
                step={1}
                value={bpeLevel}
                onChange={(e) => {
                  playClick();
                  setBpeLevel(Number(e.target.value));
                  setSelectedTokenIdx(0);
                }}
                className="w-full accent-[#0F769E] cursor-pointer"
              />
            </div>
          )}

          {/* Interactive Token Beads Tray */}
          <div className="rounded-2xl border border-[#E2D8C4] bg-[#FBF7EF] p-5 space-y-3">
            <div className="text-xs font-semibold text-[#53607A]">
              {ageMode === 'kid'
                ? 'Clique sur une perle pour découvrir son numéro secret :'
                : 'Cliquez sur un token pour inspecter son ID lexical et son vecteur d’embedding initial :'}
            </div>

            {result.tokens.length === 0 ? (
              <p className="text-sm text-[#6B768E]">Saisissez un mot pour voir apparaître les tokens.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {result.tokens.map((tok, idx) => {
                  const active = idx === selectedTokenIdx;
                  return (
                    <button
                      key={`${tok.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        playBeadPop(idx);
                        setSelectedTokenIdx(idx);
                      }}
                      className={`group flex flex-col items-start rounded-xl border-2 px-3.5 py-2 transition-all duration-150 cursor-pointer ${
                        BEAD_COLORS[tok.colorIndex]
                      } ${active ? 'scale-105 shadow-md ring-2 ring-[#131D38]' : 'hover:-translate-y-0.5'}`}
                    >
                      <span className="text-base font-extrabold leading-tight">
                        {tok.isSubword ? `##${tok.text}` : tok.text}
                      </span>
                      <span className="font-mono text-[11px] opacity-80 tabular-nums">
                        #{tok.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Token Inspector Box */}
          {selectedToken && (
            <div className="rounded-xl border border-[#DDD3BE] bg-[#131D38] p-4 text-[#FBF7EF] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-[#F6D58E] font-semibold">
                  {ageMode === 'kid' ? 'Perle inspectée' : 'Représentation interne du token'}
                </div>
                <div className="text-base font-bold">
                  « {selectedToken.text} »{' '}
                  <span className="font-mono text-sm text-[#93C5FD] tabular-nums">
                    → ID #{selectedToken.id}
                  </span>
                </div>
                <div className="text-xs text-[#C6D2E8]">
                  {ageMode === 'kid'
                    ? 'Le robot ne lit pas les lettres comme toi : il reconnaît aussitôt le numéro secret de cette perle !'
                    : `Taille UTF-8 : ${selectedToken.byteLength} octet(s) · Projeté en vecteur d’embedding avant la Couche 1.`}
                </div>
              </div>

              {ageMode === 'adult' && (
                <div className="rounded-lg bg-[#1D2B4F] px-3.5 py-2 font-mono text-xs text-[#FDE68A] tabular-nums">
                  x₀ = [{selectedToken.vectorPreview.map((v) => v.toFixed(2)).join(', ')}, …]
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right: Illustrated Storyboard & Pedagogical Concept Card */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-[#DDD3BE] bg-white shadow-sm">
            <div className="h-52 w-full overflow-hidden">
              <ArtImage
                src={ART_ASSETS.tokens}
                alt="Établi d’artisan avec perles et blocs de bois illustrant les tokens"
                fallbackTitle="L'Atelier des Perles"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#172033]">
                {ageMode === 'kid' ? 'Le secret des perles' : 'Pourquoi la tokenisation change tout'}
              </h2>
              <p className="text-sm leading-relaxed text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Un robot ne sait pas lire les lettres directement. Il découpe chaque phrase en perles numérotées : les mots courants forment 1 seule perle, les mots très longs sont coupés en plusieurs morceaux !'
                  : 'Un LLM opère sur un vocabulaire fini (souvent 50k à 128k tokens BPE). Les mots fréquents occupent 1 token entier, tandis que les mots rares ou longs se fragmentent en sous-mots. C’est pourquoi compter les lettres d’un mot reste contre-intuitif pour le modèle.'}
              </p>
              <div className="border-t border-[#EFE8DA] pt-3 text-xs text-[#53607A]">
                Méthode Neurosciences : manipuler des fragments colorés active la mémoire visuelle et motrice.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStation}
            className="rounded-xl bg-[#131D38] px-5 py-3.5 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
          >
            Station suivante : L’Attention →
          </button>
        </aside>
      </div>

      {/* Retrieval Practice Micro-Challenge */}
      <QuickChallenge
        question={
          ageMode === 'kid'
            ? 'Un mot très court comme « chat » devient combien de perles pour Lumi ?'
            : 'Pourquoi un LLM échoue-t-il parfois à compter le nombre de « r » dans « strawberry » ou « fraise » ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: '1 seule jolie perle entière' },
                { id: 'b', label: '100 perles géantes' },
                { id: 'c', label: 'Zéro perle, il le saute' },
              ]
            : [
                { id: 'a', label: 'Il reçoit des IDs de tokens sous-mots, pas des caractères isolés' },
                { id: 'b', label: 'Les voyelles effacent les consonnes en BPE' },
                { id: 'c', label: 'Le modèle ne connaît pas l’alphabet latin' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! Les mots courts et connus forment 1 seule perle entière. Tu gagnes le Cristal des Tokens !'
            : 'Exact ! Le tokenizer fusionne les blocs fréquents en un entier unique : le Cristal des Tokens est débloqué !'
        }
        retryNote={
          ageMode === 'kid'
            ? 'Regarde les perles au-dessus : « chat » est un mot très connu, il tient dans une seule perle !'
            : 'Indice : regardez le niveau BPE 3 ci-dessus, un mot courant n’est plus découpé lettre par lettre.'
        }
        unlocked={unlocked}
        onUnlock={onUnlock}
      />
    </main>
  );
}

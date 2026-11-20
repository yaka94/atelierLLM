import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ART_ASSETS, ATTENTION_SENTENCES } from '../../game/content';
import { computeAttentionScores } from '../../game/llmEngine';
import { playBeamChime, playClick } from '../../game/sound';
import type { AgeMode } from '../../game/types';
import { ArtImage } from '../ArtImage';
import { QuickChallenge } from '../QuickChallenge';

interface AttentionStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onNextStation: () => void;
}

export function AttentionStation({
  ageMode,
  unlocked,
  onUnlock,
  onNextStation,
}: AttentionStationProps) {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const sentence = ATTENTION_SENTENCES[sentenceIdx];
  const [focusIdx, setFocusIdx] = useState(sentence.defaultFocusIndex);
  const [headIdx, setHeadIdx] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [layoutMetrics, setLayoutMetrics] = useState<{ width: number; centers: number[] }>({
    width: 640,
    centers: [],
  });

  const result = useMemo(
    () => computeAttentionScores(sentence, focusIdx, headIdx),
    [sentence, focusIdx, headIdx]
  );

  const measureCenters = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const row = stage.lastElementChild as HTMLElement | null;
    const width = Math.max(row?.scrollWidth ?? 0, stage.clientWidth, 320);
    const centers = sentence.tokens.map((_, idx) => {
      const btn = buttonRefs.current[idx];
      if (!btn) return ((idx + 0.5) / sentence.tokens.length) * width;
      return btn.offsetLeft + btn.offsetWidth / 2;
    });
    setLayoutMetrics({ width, centers });
  }, [sentence.tokens]);

  useLayoutEffect(() => {
    measureCenters();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => measureCenters());
    ro.observe(stage);
    window.addEventListener('resize', measureCenters);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureCenters);
    };
  }, [measureCenters, ageMode, sentenceIdx]);

  const handleSelectSentence = (idx: number) => {
    playClick();
    setSentenceIdx(idx);
    setFocusIdx(ATTENTION_SENTENCES[idx].defaultFocusIndex);
    setHeadIdx(0);
  };

  const tokenCount = sentence.tokens.length;
  const svgWidth = layoutMetrics.width;
  const svgHeight = 148;
  const xForIdx = (i: number) =>
    layoutMetrics.centers[i] ?? ((i + 0.5) / tokenCount) * svgWidth;

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Interactive Attention Beam Observatory */}
        <section className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#0F769E]">
              Station 2 · {ageMode === 'kid' ? 'La Lampe Magique des Mots Amis' : 'Relier les mots entre eux (Mécanisme d’Attention)'}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#172033]">
              {ageMode === 'kid'
                ? 'Comment le robot comprend qui fait quoi ?'
                : 'Comment l’IA relie les mots pour saisir le contexte'}
            </h1>
            {ageMode === 'adult' && (
              <p className="text-xs md:text-sm rounded-xl bg-[#F4F9FC] border border-[#CBE7F5] px-3 py-2 text-[#23435A]">
                <strong className="text-[#0F769E]">En clair :</strong> pour savoir de qui parle un pronom comme « elle », chaque mot envoie un signal aux autres mots de la phrase (en technique : <em>Self-Attention Q·K·V</em>). Cliquez sur un mot ci-dessous pour voir les liens s’illuminer.
              </p>
            )}
            <p className="text-sm text-[#46536E]">
              {ageMode === 'kid' ? sentence.kidPrompt : sentence.adultPrompt}
            </p>
          </div>

          {/* Sentence Selector */}
          <div className="flex flex-wrap gap-2">
            {ATTENTION_SENTENCES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSentence(idx)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  idx === sentenceIdx
                    ? 'border-[#0F769E] bg-[#E0F2FE] text-[#0C4A6E]'
                    : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#46536E] hover:border-[#0F769E]/60'
                }`}
              >
                {ageMode === 'kid' ? s.labelKid : s.labelAdult}
              </button>
            ))}
          </div>

          {/* Attention Heads Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#53607A]">
              {ageMode === 'kid' ? 'Choisis ta lampe :' : 'Tête d’attention active :'}
            </span>
            {sentence.heads.map((h, idx) => (
              <button
                key={h.name}
                type="button"
                onClick={() => {
                  playBeamChime();
                  setHeadIdx(idx);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  idx === headIdx
                    ? 'bg-[#131D38] text-[#F6C453]'
                    : 'bg-[#F3ECDD] text-[#37435A] hover:bg-[#E7DCC4]'
                }`}
              >
                {ageMode === 'kid' ? h.kidName : h.name}
              </button>
            ))}
          </div>

          {/* Interactive Luminous SVG Attention Arcs (Unified Stage: exact button-center alignment) */}
          <div className="rounded-2xl border border-[#24345C] bg-[#131D38] p-5 text-[#FBF7EF] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#F6D58E] font-semibold">
                {ageMode === 'kid'
                  ? `Lampe pointée depuis « ${result.queryToken} » → éclaire surtout « ${result.topTargetToken} »`
                  : `Mot observé (« ${result.queryToken} ») → lien principal : « ${result.topTargetToken} » (${Math.round(result.topWeight * 100)} %)`}
              </span>
              {ageMode === 'adult' && (
                <span className="font-mono text-[#93C5FD]">
                  Attention(Q,K,V) = softmax(QKᵀ/√d)V
                </span>
              )}
            </div>

            <div className="w-full overflow-x-auto pb-1">
              <div ref={stageRef} className="relative inline-flex flex-col min-w-full">
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="block overflow-visible"
                  role="img"
                  aria-label={`Faisceaux d’attention reliant ${result.queryToken} aux autres mots de la phrase`}
                >
                  {/* Attention arcs from focusIdx to every key */}
                  {sentence.tokens.map((_, keyIdx) => {
                    const weight = result.weights[keyIdx];
                    if (weight < 0.04 || keyIdx === focusIdx) return null;
                    const x1 = xForIdx(focusIdx);
                    const x2 = xForIdx(keyIdx);
                    const midX = (x1 + x2) / 2;
                    const arcHeight = Math.min(112, 30 + Math.abs(x2 - x1) * 0.28);
                    const cy = svgHeight - 24 - arcHeight;
                    const isStrongest = keyIdx === result.topTargetIndex;

                    return (
                      <g key={keyIdx}>
                        <path
                          d={`M ${x1} ${svgHeight - 22} Q ${midX} ${cy} ${x2} ${svgHeight - 22}`}
                          fill="none"
                          stroke={isStrongest ? '#F6C453' : '#7DD3FC'}
                          strokeWidth={Math.max(1.6, weight * 11)}
                          strokeOpacity={Math.min(1, 0.28 + weight * 1.1)}
                          strokeLinecap="round"
                        />
                        {isStrongest && (
                          <text
                            x={midX}
                            y={Math.max(16, (svgHeight - 22 + cy) / 2 - 12)}
                            textAnchor="middle"
                            fill="#FDE68A"
                            fontSize="12"
                            fontWeight="700"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {Math.round(weight * 100)}%
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Baseline stems & nodes locked directly above each word center */}
                  {sentence.tokens.map((_, i) => {
                    const cx = xForIdx(i);
                    const isFocus = i === focusIdx;
                    const isTop = i === result.topTargetIndex;
                    return (
                      <g key={i}>
                        <line
                          x1={cx}
                          y1={svgHeight - 20}
                          x2={cx}
                          y2={svgHeight}
                          stroke={isFocus ? '#F6C453' : isTop ? '#38BDF8' : '#32456E'}
                          strokeWidth={isFocus || isTop ? 2 : 1.2}
                          strokeDasharray={isFocus || isTop ? undefined : '2 3'}
                        />
                        <circle
                          cx={cx}
                          cy={svgHeight - 22}
                          r={isFocus ? 7 : isTop ? 6 : 3.5}
                          fill={isFocus ? '#F6C453' : isTop ? '#38BDF8' : '#536792'}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Clickable Word Buttons on a single aligned row directly beneath their nodes */}
                <div className="flex items-stretch justify-between gap-1 pt-1 w-full">
                  {sentence.tokens.map((word, idx) => {
                    const weight = result.weights[idx];
                    const pct = Math.round(weight * 100);
                    const isFocus = idx === focusIdx;
                    const isTop = idx === result.topTargetIndex;

                    return (
                      <button
                        key={`${sentence.id}-${idx}`}
                        ref={(el) => {
                          buttonRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => {
                          playBeamChime();
                          setFocusIdx(idx);
                        }}
                        className={`flex flex-1 flex-col items-center justify-center rounded-lg border px-1.5 py-1.5 text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                          isFocus
                            ? 'border-[#F6C453] bg-[#F6C453] text-[#131D38] shadow-[0_0_16px_rgba(246,196,83,0.35)]'
                            : isTop
                            ? 'border-[#38BDF8] bg-[#1E3A5F] text-white'
                            : 'border-white/15 bg-[#1C2A4D] text-[#D7E2F7] hover:border-[#F6C453]/60'
                        }`}
                      >
                        <span>{word}</span>
                        <span className="font-mono text-[10px] opacity-85 tabular-nums">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Observatory Art + Dual Mode Explanation */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-[#DDD3BE] bg-white shadow-sm">
            <div className="h-52 w-full overflow-hidden">
              <ArtImage
                src={ART_ASSETS.attention}
                alt="Observatoire aux lampes magiques reliant un chat, un coussin et une couronne"
                fallbackTitle="L'Observatoire de l'Attention"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#172033]">
                {ageMode === 'kid' ? 'Pourquoi la lampe est magique ?' : 'Des têtes spécialisées en parallèle'}
              </h2>
              <p className="text-sm leading-relaxed text-[#46536E]">
                {ageMode === 'kid'
                  ? 'Certains mots tout seuls sont mystérieux (comme « elle » ou « avocat »). Grâce à ses lampes de poche, le robot regarde les autres mots de la phrase pour deviner aussitôt le vrai sens !'
                  : 'Chaque tête d’attention projette les tokens en vecteurs Query, Key et Value. En parallèle, une tête suit la coréférence, une autre la syntaxe et une troisième la sémantique, enrichissant le vecteur de chaque token selon son contexte.'}
              </p>
              <div className="border-t border-[#EFE8DA] pt-3 text-xs text-[#53607A]">
                {sentence.heads[headIdx].description}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStation}
            className="rounded-xl bg-[#131D38] px-5 py-3.5 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer"
          >
            Station suivante : La Tour LFM3 &amp; Couches →
          </button>
        </aside>
      </div>

      <QuickChallenge
        question={
          ageMode === 'kid'
            ? 'Dans « Le robot pose la pomme sur la table car elle est lourde », quel mot explique « elle » ?'
            : 'Dans « L’avocat en robe noire mange un avocat bien mûr », comment le modèle différencie-t-il les deux occurrences de « avocat » ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'la table (car c’est elle qui est lourde !)' },
                { id: 'b', label: 'le robot' },
                { id: 'c', label: 'pose' },
              ]
            : [
                { id: 'a', label: 'La Self-Attention pondère chaque occurrence par son voisinage (« robe noire » vs « mange / mûr »)' },
                { id: 'b', label: 'Le tokenizer supprime automatiquement le second mot identique' },
                { id: 'c', label: 'La température choisit le sens au hasard' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Bravo ! La lampe de l’Attention a repéré « la table » grâce à l’indice « lourde ». Cristal débloqué !'
            : 'Exact ! Les vecteurs contextualisés divergent fortement dès les premières couches d’attention. Cristal débloqué !'
        }
        retryNote={
          ageMode === 'kid'
            ? 'Essaie de cliquer sur « La table lourde » puis sur le mot « elle » pour voir le rayon doré !'
            : 'Essayez la 3e phrase ci-dessus et comparez les faisceaux partant du premier et du second « avocat ».'
        }
        unlocked={unlocked}
        onUnlock={onUnlock}
      />
    </main>
  );
}

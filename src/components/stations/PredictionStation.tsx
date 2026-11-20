import { useMemo, useState } from 'react';
import { PREDICTION_STEPS } from '../../game/content';
import { computeSoftmaxDistribution, sampleNextCandidate } from '../../game/llmEngine';
import { playBeadPop, playClick, playSuccess } from '../../game/sound';
import type { AgeMode } from '../../game/types';
import { LumiMascotSvg } from '../LumiMascotSvg';
import { QuickChallenge } from '../QuickChallenge';

interface PredictionStationProps {
  ageMode: AgeMode;
  unlocked: boolean;
  onUnlock: () => void;
  onGoToQuiz: () => void;
}

export function PredictionStation({
  ageMode,
  unlocked,
  onUnlock,
  onGoToQuiz,
}: PredictionStationProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [drawnToken, setDrawnToken] = useState<{ token: string; isFactual: boolean } | null>(
    null
  );

  const step = PREDICTION_STEPS[stepIdx];
  const dist = useMemo(
    () => computeSoftmaxDistribution(step.candidates, temperature, ageMode === 'kid' ? 1.0 : topP),
    [step, temperature, topP, ageMode]
  );

  const handleDraw = () => {
    const picked = sampleNextCandidate(dist, Math.random());
    if (picked) {
      playSuccess();
      setDrawnToken({ token: picked.token, isFactual: picked.isFactual });
    }
  };

  const tempMoodLabel =
    temperature <= 0.35
      ? ageMode === 'kid'
        ? 'Glacé · Très sage et précis'
        : 'Bas (T ≤ 0.35) · Quasi déterministe'
      : temperature <= 0.95
      ? ageMode === 'kid'
        ? 'Tiède · Équilibré et créatif'
        : 'Modéré · Équilibre précision / diversité'
      : ageMode === 'kid'
      ? 'Volcan · Très foufou et imprévisible !'
      : 'Élevé · Forte entropie, risque d’hallucination';

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Softmax Probability & Temperature Lab */}
        <section className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#C2412D]">
                Station 5 · {ageMode === 'kid' ? 'La Roue du Mot Suivant' : 'Décodage Softmax, Température T & Top-p'}
              </div>
              <h1 className="font-display text-2xl font-extrabold text-[#172033]">
                {ageMode === 'kid'
                  ? 'Le Thermomètre de l’Imagination'
                  : 'Probabilités du prochain token & Hallucinations'}
              </h1>
            </div>

            <div className="flex gap-2">
              {PREDICTION_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setStepIdx(idx);
                    setDrawnToken(null);
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap ${
                    idx === stepIdx
                      ? 'border-[#C2412D] bg-[#FEF2F2] text-[#7F1D1D]'
                      : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#46536E]'
                  }`}
                >
                  {idx === 0
                    ? ageMode === 'kid'
                      ? 'Histoire du chat'
                      : 'Exemple créatif'
                    : ageMode === 'kid'
                    ? 'Question de science'
                    : 'Tâche factuelle'}
                </button>
              ))}
            </div>
          </div>

          {/* Live Sentence Preview */}
          <div className="rounded-2xl border border-[#E2D8C4] bg-[#FBF7EF] p-5 flex flex-wrap items-center justify-between gap-4">
            <p className="font-display text-lg md:text-xl font-bold text-[#172033] leading-snug">
              {ageMode === 'kid' ? step.prefixKid : step.prefixAdult}{' '}
              <span
                className={`inline-block rounded-lg px-3 py-0.5 border-2 ${
                  drawnToken
                    ? drawnToken.isFactual
                      ? 'border-[#0E7A5F] bg-[#ECFDF5] text-[#065F46]'
                      : 'border-[#C2412D] bg-[#FEF2F2] text-[#991B1B]'
                    : 'border-dashed border-[#C97714] bg-[#FEF6E6] text-[#8C530A]'
                }`}
              >
                {drawnToken ? drawnToken.token : '_____ ?'}
              </span>
            </p>

            <button
              type="button"
              onClick={handleDraw}
              className="rounded-xl bg-[#C2412D] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#A63322] transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              Tirer le mot suivant
            </button>
          </div>

          {/* Temperature & Top-p Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E6DEC9] bg-[#FBF7EF] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <label htmlFor="temp-slider" className="text-[#172033]">
                  {ageMode === 'kid' ? 'Thermomètre d’imagination' : 'Température (T)'}
                </label>
                <span className="font-mono text-[#C2412D] tabular-nums">
                  T = {temperature.toFixed(1)}
                </span>
              </div>
              <input
                id="temp-slider"
                type="range"
                min={0.1}
                max={1.8}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-[#C2412D] cursor-pointer"
              />
              <div className="text-xs text-[#53607A]">{tempMoodLabel}</div>
            </div>

            {ageMode === 'adult' ? (
              <div className="rounded-xl border border-[#E6DEC9] bg-[#FBF7EF] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <label htmlFor="topp-slider" className="text-[#172033]">
                    Nucleus Sampling (Top-p)
                  </label>
                  <span className="font-mono text-[#0F769E] tabular-nums">
                    p = {topP.toFixed(2)} · Entropie H = {dist.entropyBits.toFixed(2)} bits
                  </span>
                </div>
                <input
                  id="topp-slider"
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={topP}
                  onChange={(e) => setTopP(Number(e.target.value))}
                  className="w-full accent-[#0F769E] cursor-pointer"
                />
                <div className="text-xs text-[#53607A]">
                  Les tokens hors du noyau cumulatif p sont masqués (probabilité 0 %).
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E6DEC9] bg-[#F3ECDD] p-4 flex items-center gap-3">
                <LumiMascotSvg
                  mood={temperature > 1.2 ? 'celebrating' : temperature < 0.4 ? 'thinking' : 'happy'}
                  size={68}
                />
                <div className="text-xs leading-relaxed text-[#37435A]">
                  <strong>Astuce de Lumi :</strong> clique sur une barre de couleur ou sur « Tirer le mot suivant » pour voir la probabilité en direct !
                </div>
              </div>
            )}
          </div>

          {/* Probability Bars */}
          <div className="rounded-2xl bg-[#131D38] p-5 text-[#FBF7EF] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#F6D58E]">
                {ageMode === 'kid'
                  ? 'Chances de chaque mot sur la roue (Total = 100 %) :'
                  : 'Distribution Softmax renormalisée : p_i = exp(z_i / T) / Σ exp(z_j / T)'}
              </span>
              {ageMode === 'adult' && (
                <span className="font-mono text-[#93C5FD] tabular-nums">
                  H = {dist.entropyBits.toFixed(2)} bits
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {dist.candidates.map((cand, idx) => {
                const pct = Math.round(cand.renormalizedProb * 100);
                return (
                  <button
                    key={cand.token}
                    type="button"
                    disabled={!cand.includedInTopP}
                    onClick={() => {
                      playBeadPop(idx);
                      setDrawnToken({ token: cand.token, isFactual: cand.isFactual });
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all duration-150 ${
                      cand.includedInTopP
                        ? 'border-white/15 bg-[#1B294C] hover:border-[#F6C453] cursor-pointer'
                        : 'border-white/5 bg-[#16203A] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm font-bold mb-1.5">
                      <span className="flex items-center gap-2">
                        <span>« {cand.token} »</span>
                        <span className="text-xs font-normal text-[#B6C5E2]">
                          {cand.kidHint}
                        </span>
                      </span>
                      <span className="font-mono text-[#F6C453] tabular-nums">
                        {cand.includedInTopP ? `${pct}%` : 'Filtré (Top-p)'}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#0D152B] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${Math.max(2, pct)}%`,
                          backgroundColor: cand.isFactual ? '#34D399' : '#F59E0B',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {drawnToken && !drawnToken.isFactual && (
            <div className="rounded-xl border border-[#C2412D]/40 bg-[#FEF2F2] p-4 text-sm text-[#7F1D1D]">
              <strong>Attention, hallucination !</strong>{' '}
              {ageMode === 'kid' ? step.hallucinationWarningKid : step.hallucinationWarningAdult}
            </div>
          )}
        </section>

        {/* Right: Pedagogical Card + Launch Final Adaptive Quiz */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm space-y-4">
            <div className="text-xs font-bold text-[#C2412D]">
              Comprendre l’essentiel
            </div>
            <h2 className="font-display text-xl font-bold text-[#172033]">
              {ageMode === 'kid'
                ? 'Un LLM devine un mot après l’autre'
                : 'Autorégression : probabilité ≠ vérité'}
            </h2>
            <p className="text-sm leading-relaxed text-[#46536E]">
              {ageMode === 'kid'
                ? 'À la fin de la Tour des Étages, le robot fait tourner sa roue des chances pour choisir le prochain mot, puis recommence ! Si le thermomètre est chaud, il invente des histoires rigolotes ; s’il est froid, il reste très sérieux.'
                : 'Un LLM génère sa réponse de manière autorégressive, un token à la fois. Les scores bruts (logits) passent dans un Softmax modulé par la Température T et tronqué par Top-p. Parce qu’il optimise la plausibilité linguistique et non la vérification factuelle, un modèle peut affirmer une erreur avec aplomb.'}
            </p>
            <div className="border-t border-[#EFE8DA] pt-3 text-xs text-[#53607A]">
              Règle d’or : T ≈ 0.1–0.3 pour le code et les faits ; T ≈ 0.7–1.0 pour l’écriture créative.
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToQuiz}
            className="rounded-xl bg-[#E8A62E] px-5 py-4 text-sm font-extrabold text-[#131D38] shadow-sm hover:bg-[#F3B946] transition-colors cursor-pointer"
          >
            Passer au Grand Quiz Adaptatif ★
          </button>
        </aside>
      </div>

      <QuickChallenge
        question={
          ageMode === 'kid'
            ? 'Tu poses une question sérieuse de calcul au robot. Comment régler le thermomètre ?'
            : 'Pour une tâche de diagnostic ou de génération de code rigoureuse, quel réglage privilégier ?'
        }
        options={
          ageMode === 'kid'
            ? [
                { id: 'a', label: 'Froid (très sage, pour ne pas inventer)' },
                { id: 'b', label: 'Volcan géant (tout au hasard)' },
                { id: 'c', label: 'Éteindre le robot' },
              ]
            : [
                { id: 'a', label: 'Température basse (T ≈ 0,1 à 0,3) pour concentrer la masse sur le token le plus fiable' },
                { id: 'b', label: 'Température maximale (T = 1,8) pour maximiser l’entropie' },
                { id: 'c', label: 'Supprimer le Softmax et choisir le logit minimal' },
              ]
        }
        correctId="a"
        successNote={
          ageMode === 'kid'
            ? 'Génial ! Avec un thermomètre froid, le robot choisit la réponse la plus sage. Dernier Cristal débloqué !'
            : 'Exact ! Une température basse réduit l’entropie de Shannon et stabilise le décodage. Cristal débloqué !'
        }
        retryNote={
          ageMode === 'kid'
            ? 'Fais glisser le thermomètre tout à gauche (T = 0.1) et regarde la barre du bon mot monter près de 100 % !'
            : 'Testez T = 0.2 ci-dessus sur la tâche factuelle et observez la chute de l’entropie H.'
        }
        unlocked={unlocked}
        onUnlock={onUnlock}
      />
    </main>
  );
}

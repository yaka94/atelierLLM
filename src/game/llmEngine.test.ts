import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMasteryPercent,
  computeAttentionScores,
  computeMultimodalStream,
  computeSoftmaxDistribution,
  createInitialProgress,
  sampleNextCandidate,
  simulateArchitectureMetrics,
  tokenizeText,
  unlockCrystal,
} from './llmEngine';
import {
  computeQuizSummary,
  createAdaptiveQuiz,
  selectNextQuestion,
  submitQuizAnswer,
} from './adaptiveQuiz';
import type { AttentionSentence } from './types';

test('tokenizeText handles empty string and splits French BPE levels properly', () => {
  const empty = tokenizeText('   ', 'adult', 3);
  assert.equal(empty.tokens.length, 0);

  const charLevel = tokenizeText('chat', 'adult', 0);
  assert.equal(charLevel.tokens.length, 4);

  const wordLevel = tokenizeText('Le petit chat', 'kid', 3);
  assert.equal(wordLevel.tokens.length, 3);

  const rareWord = tokenizeText('anticonstitutionnellement', 'adult', 3);
  assert.ok(rareWord.tokens.length >= 3, 'Rare long French word should split into multiple BPE subwords');
  assert.ok(rareWord.tokens.some((t) => t.isSubword));
});

test('computeAttentionScores normalizes weights to 1 and highlights strongest target', () => {
  const sentence: AttentionSentence = {
    id: 'test-sent',
    labelKid: 'Test',
    labelAdult: 'Test',
    tokens: ['Le', 'robot', 'tient', 'la', 'pomme', 'car', 'elle', 'est', 'rouge'],
    defaultFocusIndex: 6,
    kidPrompt: '',
    adultPrompt: '',
    heads: [
      {
        name: 'Coréférence',
        kidName: 'Amis',
        description: 'Relie pronom et nom',
        affinities: {
          6: { 4: 4.5, 3: 1.5, 8: 2.0 },
        },
      },
    ],
  };

  const result = computeAttentionScores(sentence, 6, 0);
  const sum = result.weights.reduce((acc, w) => acc + w, 0);
  assert.ok(Math.abs(sum - 1) < 1e-6, `Expected sum 1, got ${sum}`);
  assert.equal(result.topTargetIndex, 4);
  assert.equal(result.topTargetToken, 'pomme');
});

test('simulateArchitectureMetrics reflects LFM3 linear memory advantage at long context', () => {
  const transformer128 = simulateArchitectureMetrics('transformer', 128);
  const moe128 = simulateArchitectureMetrics('moe', 128);
  const lfm128 = simulateArchitectureMetrics('lfm3', 128);

  assert.equal(transformer128.floors.length, 6);
  assert.equal(moe128.floors.length, 6);
  assert.equal(lfm128.floors.length, 6);

  assert.ok(
    lfm128.kvCacheGb < transformer128.kvCacheGb,
    'Hybrid LFM3 must use substantially less KV-cache at 128k context than dense Transformer'
  );
  assert.ok(
    lfm128.tokensPerSec > transformer128.tokensPerSec,
    'Hybrid LFM3 must maintain higher throughput at long context'
  );
  assert.ok(
    moe128.activeParamRatio < transformer128.activeParamRatio,
    'MoE must activate fewer parameters per token than dense Transformer'
  );
});

test('computeMultimodalStream unifies vision, audio, and text in Native Omni mode with lower latency than audio cascade', () => {
  const audioOnly = computeMultimodalStream('audio', [], 'voice', 'Bonjour Lumi');
  const omni = computeMultimodalStream('omni', [2, 9], 'voice', 'Bonjour Lumi');

  assert.equal(omni.isNativeUnified, true);
  assert.equal(audioOnly.isNativeUnified, false);
  assert.ok(omni.stream.some((t) => t.modality === 'vision'));
  assert.ok(omni.stream.some((t) => t.modality === 'audio'));
  assert.ok(omni.stream.some((t) => t.modality === 'text'));
  assert.ok(omni.latencyMs < audioOnly.latencyMs, 'Native Omni avoids cascaded ASR+LLM+TTS latency');
});

test('computeSoftmaxDistribution respects temperature scaling, Top-p renormalization, and sampling', () => {
  const candidates = [
    { token: 'lait', logit: 4.0, kidHint: 'très logique', isFactual: true },
    { token: 'jus', logit: 2.0, kidHint: 'possible', isFactual: true },
    { token: 'nuage', logit: 0.2, kidHint: 'rigolo', isFactual: false },
  ];

  const cold = computeSoftmaxDistribution(candidates, 0.2, 1.0);
  const hot = computeSoftmaxDistribution(candidates, 1.6, 1.0);

  const sumCold = cold.candidates.reduce((s, c) => s + c.renormalizedProb, 0);
  assert.ok(Math.abs(sumCold - 1) < 1e-6);
  assert.ok(cold.candidates[0].probability > hot.candidates[0].probability);
  assert.ok(hot.entropyBits > cold.entropyBits, 'Higher temperature must raise Shannon entropy');

  const tightTopP = computeSoftmaxDistribution(candidates, 1.0, 0.5);
  assert.equal(tightTopP.candidates[0].includedInTopP, true);
  const sampled = sampleNextCandidate(tightTopP, 0.2);
  assert.equal(sampled?.token, 'lait');
});

test('progress state unlocks crystals uniquely and computes mastery percentage', () => {
  let progress = createInitialProgress();
  progress = unlockCrystal(progress, 'tokens', 100);
  progress = unlockCrystal(progress, 'tokens', 100);
  assert.equal(progress.unlockedCrystals.length, 1);
  assert.equal(progress.score, 125);

  progress = unlockCrystal(progress, 'layers', 100);
  assert.equal(progress.unlockedCrystals.length, 2);
  assert.ok(calculateMasteryPercent(progress) >= 15);
});

test('adaptive quiz engine escalates difficulty on streaks and steps down on errors for both kid and adult modes', () => {
  let state = createAdaptiveQuiz('adult', 4);
  assert.equal(state.currentDifficulty, 1);

  const q1 = selectNextQuestion(state);
  assert.ok(q1);
  assert.equal(q1.difficulty, 1);

  // Correct at level 1 -> promotes to level 2
  const r1 = submitQuizAnswer(state, q1, q1.correctOptionId);
  assert.equal(r1.isCorrect, true);
  assert.equal(r1.difficultyDelta, 1);
  state = r1.nextState;
  assert.equal(state.currentDifficulty, 2);

  // Wrong at level 2 -> steps back to level 1 to consolidate
  const q2 = selectNextQuestion(state);
  assert.ok(q2);
  assert.equal(q2.difficulty, 2);
  const wrongId = q2.options.find((o) => o.id !== q2.correctOptionId)!.id;
  const r2 = submitQuizAnswer(state, q2, wrongId);
  assert.equal(r2.isCorrect, false);
  assert.equal(r2.difficultyDelta, -1);
  state = r2.nextState;
  assert.equal(state.currentDifficulty, 1);

  // Kid mode also selects visual level 1 questions cleanly
  const kidState = createAdaptiveQuiz('kid', 4);
  const kidQ1 = selectNextQuestion(kidState);
  assert.ok(kidQ1);
  assert.equal(kidQ1.mode, 'kid');
  assert.ok(kidQ1.options.every((o) => Boolean(o.visualIcon)));

  const summary = computeQuizSummary(state);
  assert.equal(summary.totalAnswered, 2);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.accuracyPercent, 50);
});

test('evaluateAchievements tracks 8 station badges, score milestones, and full mastery accurately', async () => {
  const { evaluateAchievements } = await import('./achievements');

  const initial = evaluateAchievements(createInitialProgress());
  assert.equal(initial.unlockedCount, 0);
  assert.equal(initial.stationsTotal, 8);
  assert.equal(initial.nextScoreMilestone?.id, 'score-100');

  // Unlock 1 station with 120 pts -> unlocks badge-tokens + score-100, next milestone is score-400
  const afterS1 = unlockCrystal(createInitialProgress(), 'tokens', 120);
  const mid = evaluateAchievements(afterS1);
  assert.equal(mid.stationsUnlocked, 1);
  assert.equal(mid.unlockedCount, 2);
  assert.equal(mid.nextScoreMilestone?.id, 'score-400');

  // Full mastery across all 8 stations
  const full = evaluateAchievements({
    unlockedCrystals: [
      'tokens',
      'attention',
      'layers',
      'omni',
      'prediction',
      'training',
      'context_rag',
      'reasoning',
    ],
    score: 960,
    bestScore: 960,
    challengesCompleted: 8,
    quizBestAccuracy: 100,
    lumiStoriesFinished: 2,
  });
  assert.equal(full.unlockedCount, full.totalCount);
  assert.equal(full.completionPercent, 100);
  assert.equal(full.nextScoreMilestone, null);
});

test('dual progress strictly separates Kid and Adult scores, crystals, and achievements', async () => {
  const { createInitialDualProgress, updateProgressForMode } = await import('./llmEngine');
  const { evaluateAchievements } = await import('./achievements');

  let dual = createInitialDualProgress();
  dual = updateProgressForMode(dual, 'kid', (s) => unlockCrystal(s, 'tokens', 120));

  assert.equal(dual.kid.score, 120);
  assert.equal(dual.kid.unlockedCrystals.length, 1);
  assert.equal(dual.adult.score, 0);
  assert.equal(dual.adult.unlockedCrystals.length, 0);

  dual = updateProgressForMode(dual, 'adult', (s) => unlockCrystal(s, 'layers', 180));
  assert.equal(dual.kid.score, 120);
  assert.equal(dual.adult.score, 180);
  assert.deepEqual(dual.kid.unlockedCrystals, ['tokens']);
  assert.deepEqual(dual.adult.unlockedCrystals, ['layers']);

  assert.equal(evaluateAchievements(dual.kid).unlockedCount, 2);
  assert.equal(evaluateAchievements(dual.adult).unlockedCount, 2);
});

test('simulateTrainingStage progresses from Pre-training to SFT to RLHF alignment', async () => {
  const { simulateTrainingStage } = await import('./llmEngine');

  const pre = simulateTrainingStage('pretrain', 5);
  const sft = simulateTrainingStage('sft', 5);
  const rlhf = simulateTrainingStage('rlhf', 5);

  assert.ok(sft.instructionFollowing > pre.instructionFollowing);
  assert.ok(rlhf.safetyAlignment > sft.safetyAlignment);
  assert.ok(rlhf.lossValue < pre.lossValue);
});

test('simulateContextAndRag models overflow eviction and RAG/Tools factual accuracy recovery', async () => {
  const { simulateContextAndRag } = await import('./llmEngine');

  const overflow = simulateContextAndRag(32, 64, false, false);
  const withRagTools = simulateContextAndRag(32, 64, true, true);

  assert.ok(overflow.evictedPercent > 0);
  assert.ok(overflow.middleRecall < overflow.endRecall);
  assert.ok(withRagTools.factualAccuracy > overflow.factualAccuracy + 25);
});

test('simulateReasoningBudget shows CoT and Verification dramatically outperform Direct mode', async () => {
  const { simulateReasoningBudget } = await import('./llmEngine');

  const direct = simulateReasoningBudget('direct', 3);
  const cot = simulateReasoningBudget('cot', 3);
  const verify = simulateReasoningBudget('verify', 3);

  assert.equal(direct.isCorrect, false);
  assert.equal(cot.isCorrect, true);
  assert.equal(verify.isCorrect, true);
  assert.ok(verify.accuracyPercent > cot.accuracyPercent);
  assert.ok(cot.accuracyPercent > direct.accuracyPercent);
});

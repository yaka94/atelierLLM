export type AgeMode = 'kid' | 'adult';

export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type PlayView = 'map' | 'station' | 'quiz' | 'lumi' | 'achievements';

export type StationId =
  | 'tokens'
  | 'attention'
  | 'layers'
  | 'omni'
  | 'prediction'
  | 'training'
  | 'context_rag'
  | 'reasoning';

export type StationChapter = 'core' | 'advanced';

export type TrainingStageKind = 'pretrain' | 'sft' | 'rlhf';

export interface TrainingStageSimulation {
  stage: TrainingStageKind;
  dataScale: number;
  lossValue: number;
  instructionFollowing: number;
  safetyAlignment: number;
  creativityBalance: number;
  sampleOutputKid: string;
  sampleOutputAdult: string;
}

export interface ContextWindowSimulation {
  windowCapacityK: number;
  usedContextK: number;
  fillPercent: number;
  evictedPercent: number;
  beginningRecall: number;
  middleRecall: number;
  endRecall: number;
  factualAccuracy: number;
  ragActive: boolean;
  toolsActive: boolean;
  answerPreviewKid: string;
  answerPreviewAdult: string;
}

export type ReasoningMode = 'direct' | 'cot' | 'verify';

export interface ReasoningSimulation {
  mode: ReasoningMode;
  thinkingSteps: number;
  thinkingTokens: number;
  accuracyPercent: number;
  latencySec: number;
  stepsKid: string[];
  stepsAdult: string[];
  finalAnswerKid: string;
  finalAnswerAdult: string;
  isCorrect: boolean;
}

export type ArchitectureKind = 'transformer' | 'moe' | 'lfm3';

export type ModalityMode = 'text' | 'vision' | 'audio' | 'omni';

export type QuizDifficulty = 1 | 2 | 3;

export type LumiMood = 'happy' | 'curious' | 'thinking' | 'celebrating' | 'story';

export type RobotEmotion =
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'idea'
  | 'celebrating'
  | 'surprised';

export interface DualProgressState {
  kid: ProgressState;
  adult: ProgressState;
}

export interface TokenPiece {
  id: number;
  text: string;
  byteLength: number;
  isSubword: boolean;
  colorIndex: number;
  vectorPreview: [number, number, number];
}

export interface TokenizationResult {
  tokens: TokenPiece[];
  charCount: number;
  byteCount: number;
  compressionRatio: number;
}

export interface AttentionSentence {
  id: string;
  labelKid: string;
  labelAdult: string;
  tokens: string[];
  defaultFocusIndex: number;
  kidPrompt: string;
  adultPrompt: string;
  /** Attention weights per head (head 0: coreference, head 1: syntax, head 2: semantics) */
  heads: {
    name: string;
    kidName: string;
    description: string;
    /** matrix[queryIdx][keyIdx] raw affinity logits */
    affinities: Record<number, Record<number, number>>;
  }[];
}

export interface AttentionHeadResult {
  headName: string;
  queryToken: string;
  weights: number[];
  topTargetIndex: number;
  topTargetToken: string;
  topWeight: number;
}

export interface LayerFloorSpec {
  floor: number;
  kind: 'embed' | 'liquid' | 'attention' | 'moe' | 'ffn' | 'output';
  titleKid: string;
  titleAdult: string;
  roleKid: string;
  roleAdult: string;
  complexity: string;
  activeExperts?: number[];
  transformNoteKid: string;
  transformNoteAdult: string;
}

export interface ArchitectureSimulation {
  arch: ArchitectureKind;
  contextTokensK: number;
  kvCacheGb: number;
  tokensPerSec: number;
  longContextScore: number;
  energyEfficiency: number;
  activeParamRatio: number;
  floors: LayerFloorSpec[];
}

export interface MultimodalTokenItem {
  id: string;
  modality: 'text' | 'vision' | 'audio';
  label: string;
  tokenCode: string;
}

export interface MultimodalStreamResult {
  mode: ModalityMode;
  stream: MultimodalTokenItem[];
  totalTokens: number;
  latencyMs: number;
  pipelineSteps: string[];
  isNativeUnified: boolean;
}

export interface CandidateLogit {
  token: string;
  logit: number;
  kidHint: string;
  isFactual: boolean;
}

export interface SoftmaxCandidate extends CandidateLogit {
  probability: number;
  includedInTopP: boolean;
  renormalizedProb: number;
}

export interface SoftmaxDistributionResult {
  candidates: SoftmaxCandidate[];
  entropyBits: number;
  temperature: number;
  topP: number;
}

export interface ProgressState {
  unlockedCrystals: StationId[];
  score: number;
  bestScore: number;
  challengesCompleted: number;
  quizBestAccuracy: number;
  lumiStoriesFinished: number;
}

export interface AdaptiveQuizQuestion {
  id: string;
  mode: AgeMode;
  difficulty: QuizDifficulty;
  topic: StationId;
  prompt: string;
  visualCue?: 'beads' | 'flashlight' | 'tower' | 'prism' | 'wheel' | 'cat' | 'robot' | 'book';
  options: {
    id: string;
    label: string;
    visualIcon?: 'beads' | 'scissors' | 'flashlight' | 'tower' | 'prism' | 'wheel' | 'eye' | 'ear' | 'book' | 'spark' | 'thermometer' | 'puzzle';
  }[];
  correctOptionId: string;
  explanationSuccess: string;
  explanationError: string;
  neuroscienceTip: string;
}

export interface AdaptiveQuizState {
  mode: AgeMode;
  currentDifficulty: QuizDifficulty;
  askedIds: string[];
  answers: {
    questionId: string;
    difficulty: QuizDifficulty;
    correct: boolean;
    topic: StationId;
  }[];
  streak: number;
  consecutiveErrors: number;
  totalQuestions: number;
  completed: boolean;
}

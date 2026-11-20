import type {
  AgeMode,
  ArchitectureKind,
  ArchitectureSimulation,
  AttentionHeadResult,
  AttentionSentence,
  CandidateLogit,
  ContextWindowSimulation,
  LayerFloorSpec,
  ModalityMode,
  MultimodalStreamResult,
  MultimodalTokenItem,
  ProgressState,
  ReasoningMode,
  ReasoningSimulation,
  SoftmaxCandidate,
  SoftmaxDistributionResult,
  StationId,
  TokenizationResult,
  TokenPiece,
  TrainingStageKind,
  TrainingStageSimulation,
} from './types';

export const TOTAL_STATIONS = 8;

function deterministicHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function vectorFromToken(piece: string): [number, number, number] {
  const h = deterministicHash(piece.toLowerCase());
  const x = (((h % 200) - 100) / 100);
  const y = ((((h >> 8) % 200) - 100) / 100);
  const z = ((((h >> 16) % 200) - 100) / 100);
  return [
    Math.round(x * 100) / 100,
    Math.round(y * 100) / 100,
    Math.round(z * 100) / 100,
  ];
}

const COMMON_FRENCH_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'est', 'sont',
  'chat', 'chien', 'robot', 'lumi', 'mange', 'dort', 'joue', 'petit', 'grand',
  'bonjour', 'soleil', 'lune', 'pomme', 'fraise', 'fraises', 'table', 'sur',
  'dans', 'avec', 'pour', 'car', 'elle', 'il', 'mon', 'ton', 'son', 'qui',
  'que', 'rouge', 'bleu', 'vert', 'lourde', 'doux', 'coussin', 'roi', 'reine',
  'modele', 'modèle', 'langage', 'token', 'vision', 'audio', 'texte', 'couche',
  'image', 'voix', 'monde', 'livre', 'fusée', 'dragon', 'étoile', 'magicien',
]);

const FRENCH_SUFFIXES = [
  'tionnellement',
  'nellement',
  'ation',
  'ement',
  'ment',
  'ique',
  'tion',
  'able',
  'ette',
  'eur',
  'euse',
  'aire',
  'isme',
  'iste',
  'aux',
  'ent',
  'ant',
  'es',
];

const FRENCH_PREFIXES = ['anti', 'extra', 'super', 'inter', 'trans', 'multi', 'auto', 'pré', 're', 'dé'];

function splitWordByBpe(word: string, bpeLevel: number): string[] {
  if (bpeLevel <= 0) {
    return Array.from(word);
  }
  const lower = word.toLowerCase();
  if (bpeLevel >= 3 && (word.length <= 5 || COMMON_FRENCH_WORDS.has(lower))) {
    return [word];
  }
  if (bpeLevel === 1) {
    // Bi-gram / 2-3 char merges
    const chunks: string[] = [];
    for (let i = 0; i < word.length; i += 2) {
      chunks.push(word.slice(i, i + 2));
    }
    return chunks;
  }

  // BPE level 2 or 3: realistic morphological & frequent subword splits
  if (word.length <= 4) {
    return [word];
  }

  const pieces: string[] = [];
  let remaining = word;

  for (const prefix of FRENCH_PREFIXES) {
    if (remaining.toLowerCase().startsWith(prefix) && remaining.length > prefix.length + 3) {
      pieces.push(remaining.slice(0, prefix.length));
      remaining = remaining.slice(prefix.length);
      break;
    }
  }

  let matchedSuffix = '';
  for (const suffix of FRENCH_SUFFIXES) {
    if (remaining.toLowerCase().endsWith(suffix) && remaining.length > suffix.length + 2) {
      matchedSuffix = remaining.slice(remaining.length - suffix.length);
      remaining = remaining.slice(0, remaining.length - suffix.length);
      break;
    }
  }

  const maxChunk = bpeLevel >= 3 ? 6 : 4;
  while (remaining.length > maxChunk) {
    const cut = Math.min(maxChunk, Math.ceil(remaining.length / 2));
    pieces.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  if (remaining.length > 0) {
    pieces.push(remaining);
  }
  if (matchedSuffix) {
    if (matchedSuffix.length > 6 && bpeLevel <= 2) {
      const half = Math.ceil(matchedSuffix.length / 2);
      pieces.push(matchedSuffix.slice(0, half));
      pieces.push(matchedSuffix.slice(half));
    } else {
      pieces.push(matchedSuffix);
    }
  }

  return pieces;
}

/**
 * Deterministic French tokenizer supporting Kid mode (friendly word/syllable beads)
 * and Adult mode (BPE merge stages 0..3 with vocabulary IDs and embedding previews).
 */
export function tokenizeText(
  text: string,
  mode: AgeMode,
  bpeLevel: number = 3
): TokenizationResult {
  const cleaned = text.trim();
  if (!cleaned) {
    return {
      tokens: [],
      charCount: 0,
      byteCount: 0,
      compressionRatio: 0,
    };
  }

  const encoder = new TextEncoder();
  const byteCount = encoder.encode(cleaned).length;
  const rawParts = cleaned.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+|[^\sA-Za-zÀ-ÖØ-öø-ÿ0-9]/g) ?? [];
  const effectiveBpe = mode === 'kid' ? 3 : Math.max(0, Math.min(3, Math.round(bpeLevel)));

  const tokens: TokenPiece[] = [];
  let paletteIdx = 0;

  for (const part of rawParts) {
    const isWord = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+$/.test(part);
    const subParts = isWord ? splitWordByBpe(part, effectiveBpe) : [part];

    subParts.forEach((piece, idx) => {
      const id = 1000 + (deterministicHash(piece.toLowerCase()) % 49000);
      tokens.push({
        id,
        text: piece,
        byteLength: encoder.encode(piece).length,
        isSubword: idx > 0,
        colorIndex: paletteIdx % 5,
        vectorPreview: vectorFromToken(piece),
      });
      paletteIdx += 1;
    });
  }

  const compressionRatio =
    tokens.length > 0 ? Math.round((cleaned.length / tokens.length) * 100) / 100 : 0;

  return {
    tokens,
    charCount: cleaned.length,
    byteCount,
    compressionRatio,
  };
}

/**
 * Computes normalized scaled dot-product attention distribution for a selected query token.
 */
export function computeAttentionScores(
  sentence: AttentionSentence,
  queryIndex: number,
  headIndex: number
): AttentionHeadResult {
  const safeHeadIndex = Math.max(0, Math.min(sentence.heads.length - 1, headIndex));
  const safeQueryIndex = Math.max(0, Math.min(sentence.tokens.length - 1, queryIndex));
  const head = sentence.heads[safeHeadIndex];
  const affinityMap = head.affinities[safeQueryIndex] ?? {};

  const rawScores = sentence.tokens.map((_, keyIdx) => {
    if (affinityMap[keyIdx] !== undefined) {
      return affinityMap[keyIdx];
    }
    // Slight recency / self bias for unspecified tokens
    if (keyIdx === safeQueryIndex) return 0.6;
    const distance = Math.abs(queryIndex - keyIdx);
    return Math.max(-1.2, 0.2 - distance * 0.22);
  });

  const maxScore = Math.max(...rawScores);
  const exps = rawScores.map((s) => Math.exp(s - maxScore));
  const sumExp = exps.reduce((acc, v) => acc + v, 0);
  const weights = exps.map((e) => e / sumExp);

  let topTargetIndex = 0;
  let topWeight = -1;
  weights.forEach((w, idx) => {
    if (w > topWeight) {
      topWeight = w;
      topTargetIndex = idx;
    }
  });

  return {
    headName: head.name,
    queryToken: sentence.tokens[safeQueryIndex],
    weights,
    topTargetIndex,
    topTargetToken: sentence.tokens[topTargetIndex],
    topWeight,
  };
}

/**
 * Models architectural throughput, KV-cache memory growth, and 6-layer internal flow
 * comparing Dense Transformer, Mixture of Experts (MoE), and Hybrid LFM3 (Liquid/SSM + Attention).
 */
export function simulateArchitectureMetrics(
  arch: ArchitectureKind,
  contextTokensK: number
): ArchitectureSimulation {
  const ctx = Math.max(1, Math.min(128, contextTokensK));

  if (arch === 'transformer') {
    // Classic Dense Transformer: O(N^2) attention compute & full KV-cache on every layer
    const kvCacheGb = Math.round((0.45 * ctx + 0.008 * ctx * ctx) * 10) / 10;
    const tokensPerSec = Math.max(8, Math.round(92 / (1 + ctx * 0.045)));
    const longContextScore = Math.max(42, Math.round(96 - ctx * 0.34));
    const energyEfficiency = Math.max(20, Math.round(68 - ctx * 0.36));

    const floors: LayerFloorSpec[] = [
      {
        floor: 1,
        kind: 'embed',
        titleKid: '1. La Boîte à Couleurs',
        titleAdult: 'Couche 1 · Token Embedding + RoPE',
        roleKid: 'Chaque perle reçoit sa couleur et sa place dans la file.',
        roleAdult: 'Projette chaque ID de token en vecteur dense d_model avec encodage positionnel rotatif.',
        complexity: 'O(N)',
        transformNoteKid: 'Le mot « chat » devient une carte colorée [0.8, 0.2, 0.5].',
        transformNoteAdult: 'ID #4821 → vecteur x₀ ∈ ℝ⁴⁰⁹⁶ + phase RoPE(pos).',
      },
      {
        floor: 2,
        kind: 'attention',
        titleKid: '2. Grande Loupe Globale A',
        titleAdult: 'Couche 2 · Multi-Head Self-Attention (Dense)',
        roleKid: 'Chaque mot regarde TOUS les autres mots en même temps !',
        roleAdult: 'Calcule softmax(QKᵀ/√d)V sur tout le contexte. Stocke K et V dans le KV-Cache.',
        complexity: 'O(N²)',
        transformNoteKid: '« il » repère le mot « chat » au début de la phrase.',
        transformNoteAdult: 'Matrice N×N complète : excellente mémoire globale mais coût quadratique.',
      },
      {
        floor: 3,
        kind: 'ffn',
        titleKid: '3. Atelier de Mémoire Géant',
        titleAdult: 'Couche 3 · Feed-Forward Network (SwiGLU Dense)',
        roleKid: 'Tout l’atelier travaille en même temps sur chaque perle.',
        roleAdult: 'Active 100 % des poids MLP pour enrichir la représentation sémantique.',
        complexity: 'O(N · d²)',
        transformNoteKid: 'Ajoute les souvenirs : un chat a des moustaches et ronronne.',
        transformNoteAdult: 'Projection non-linéaire dense : 100 % des paramètres sollicités.',
      },
      {
        floor: 4,
        kind: 'attention',
        titleKid: '4. Grande Loupe Globale B',
        titleAdult: 'Couche 4 · Multi-Head Self-Attention (Dense)',
        roleKid: 'On vérifie encore une fois tous les liens entre les mots.',
        roleAdult: 'Deuxième passe d’attention globale : le KV-Cache double en mémoire.',
        complexity: 'O(N²)',
        transformNoteKid: 'Relie l’action « dort » au lieu « sur le coussin ».',
        transformNoteAdult: 'Accumulation du KV-Cache : facteur limitant sur mobile ou très long contexte.',
      },
      {
        floor: 5,
        kind: 'ffn',
        titleKid: '5. Finition des Idées',
        titleAdult: 'Couche 5 · FFN Dense + RMSNorm',
        roleKid: 'Polissage final de l’idée complète de la phrase.',
        roleAdult: 'Normalisation résiduelle et raffinement conceptuel avant décodage.',
        complexity: 'O(N · d²)',
        transformNoteKid: 'L’histoire est presque prête à continuer !',
        transformNoteAdult: 'Vecteur résiduel x₅ aligné avec l’espace lexical de sortie.',
      },
      {
        floor: 6,
        kind: 'output',
        titleKid: '6. La Roue du Mot Suivant',
        titleAdult: 'Couche 6 · LM Head & Softmax',
        roleKid: 'Choisit le prochain mot le plus logique.',
        roleAdult: 'Projection vers la taille du vocabulaire |V| puis distribution Softmax.',
        complexity: 'O(|V|)',
        transformNoteKid: 'Mot proposé : « doux » !',
        transformNoteAdult: 'Logits ∈ ℝ¹²⁸⁰⁰⁰ → p(w_t | w_<t).',
      },
    ];

    return {
      arch,
      contextTokensK: ctx,
      kvCacheGb,
      tokensPerSec,
      longContextScore,
      energyEfficiency,
      activeParamRatio: 100,
      floors,
    };
  }

  if (arch === 'moe') {
    // Mixture of Experts: sparse FFN activation (e.g. 2 of 8 experts) -> fast, huge knowledge, still full attention KV
    const kvCacheGb = Math.round((0.38 * ctx + 0.005 * ctx * ctx) * 10) / 10;
    const tokensPerSec = Math.max(24, Math.round(145 / (1 + ctx * 0.028)));
    const longContextScore = Math.max(58, Math.round(95 - ctx * 0.22));
    const energyEfficiency = Math.max(46, Math.round(86 - ctx * 0.22));

    const floors: LayerFloorSpec[] = [
      {
        floor: 1,
        kind: 'embed',
        titleKid: '1. La Boîte à Couleurs',
        titleAdult: 'Couche 1 · Token Embedding',
        roleKid: 'Transforme chaque mot en perle prête à voyager.',
        roleAdult: 'Représentation vectorielle initiale des tokens entrants.',
        complexity: 'O(N)',
        transformNoteKid: 'Le mot « fusée » entre dans la tour.',
        transformNoteAdult: 'x₀ préparé pour l’attention et le routage parcimonieux.',
      },
      {
        floor: 2,
        kind: 'attention',
        titleKid: '2. Loupe de Contexte',
        titleAdult: 'Couche 2 · Grouped-Query Attention (GQA)',
        roleKid: 'Regarde les mots voisins pour comprendre le sujet.',
        roleAdult: 'GQA partage les têtes K/V pour réduire la mémoire KV-Cache.',
        complexity: 'O(N² / g)',
        transformNoteKid: 'Comprend qu’on parle d’espace et de sciences.',
        transformNoteAdult: 'Contexte capturé avec 4× moins de têtes Key/Value.',
      },
      {
        floor: 3,
        kind: 'moe',
        titleKid: '3. Aiguillage des Experts (2 sur 8)',
        titleAdult: 'Couche 3 · Routeur MoE (Top-2 / 8 Experts)',
        roleKid: 'Un chef aiguille la perle seulement vers les 2 ateliers utiles !',
        roleAdult: 'Un réseau de gating sélectionne uniquement 2 experts spécialisés (ex. Sciences + Syntaxe) sur 8.',
        complexity: '25 % actifs',
        activeExperts: [2, 6],
        transformNoteKid: 'Seuls l’Expert Espace et l’Expert Contes s’allument !',
        transformNoteAdult: 'G(x) = Softmax(TopK(x·W_g)) : immense capacité, FLOPs réduits.',
      },
      {
        floor: 4,
        kind: 'attention',
        titleKid: '4. Loupe d’Harmonie',
        titleAdult: 'Couche 4 · Grouped-Query Attention (GQA)',
        roleKid: 'Rassemble les idées des experts avec le reste de l’histoire.',
        roleAdult: 'Fusionne les sorties spécialisées sur toute la fenêtre de contexte.',
        complexity: 'O(N² / g)',
        transformNoteKid: 'Accorde les genres et les temps de la phrase.',
        transformNoteAdult: 'Cohérence syntaxique et factuelle inter-tokens.',
      },
      {
        floor: 5,
        kind: 'moe',
        titleKid: '5. Deuxième Aiguillage (2 sur 8)',
        titleAdult: 'Couche 5 · Routeur MoE Profond (Top-2 / 8)',
        roleKid: 'Choisit 2 autres spécialistes pour peaufiner le style.',
        roleAdult: 'Affinage thématique (code, poésie, logique) sans activer les 6 autres experts.',
        complexity: '25 % actifs',
        activeExperts: [1, 4],
        transformNoteKid: 'L’Expert Poésie ajoute une jolie image !',
        transformNoteAdult: 'Spécialisation fine par domaine avec faible latence d’inférence.',
      },
      {
        floor: 6,
        kind: 'output',
        titleKid: '6. La Roue du Mot Suivant',
        titleAdult: 'Couche 6 · LM Head & Softmax',
        roleKid: 'Propose le meilleur mot suivant.',
        roleAdult: 'Projection finale vers la distribution de probabilité lexicale.',
        complexity: 'O(|V|)',
        transformNoteKid: 'Mot proposé : « décolle » !',
        transformNoteAdult: 'Décodage rapide grâce aux paramètres actifs réduits.',
      },
    ];

    return {
      arch,
      contextTokensK: ctx,
      kvCacheGb,
      tokensPerSec,
      longContextScore,
      energyEfficiency,
      activeParamRatio: 25,
      floors,
    };
  }

  // Hybrid LFM / LFM3 (Liquid Foundation Models): Interleaved Liquid/Conv State-Space layers O(N) + targeted Attention checkpoints
  const kvCacheGb = Math.round((0.12 * ctx + 0.35) * 10) / 10;
  const tokensPerSec = Math.max(68, Math.round(195 / (1 + ctx * 0.008)));
  const longContextScore = Math.max(82, Math.round(97 - ctx * 0.08));
  const energyEfficiency = Math.max(76, Math.round(96 - ctx * 0.1));

  const floors: LayerFloorSpec[] = [
    {
      floor: 1,
      kind: 'embed',
      titleKid: '1. Entrée des Perles',
      titleAdult: 'Couche 1 · Token Embedding Unifié',
      roleKid: 'Prépare chaque perle (texte, image ou son) pour la tour liquide.',
      roleAdult: 'Encode tokens texte ou multimodaux en séquence continue x₀.',
      complexity: 'O(N)',
      transformNoteKid: 'Les perles glissent dans le premier toboggan doré.',
      transformNoteAdult: 'Représentation compacte prête pour les blocs opérateurs liquides.',
    },
    {
      floor: 2,
      kind: 'liquid',
      titleKid: '2. Toboggan Liquide Rapide A',
      titleAdult: 'Couche 2 · Bloc Liquide / Convolution Gated (O(N))',
      roleKid: 'Un flux d’eau magique mémorise le rythme de la phrase sans ralentir !',
      roleAdult: 'Opérateur linéaire récurrent / convolutif à état adaptatif dépendant de l’entrée : pas de KV-Cache quadratique.',
      complexity: 'O(N) · État fixe',
      transformNoteKid: 'Garde l’essentiel en mémoire à la vitesse de l’éclair.',
      transformNoteAdult: 'h_t = A(x_t)·h_{t-1} + B(x_t)·x_t : mémoire dynamique constante.',
    },
    {
      floor: 3,
      kind: 'liquid',
      titleKid: '3. Toboggan Liquide Rapide B',
      titleAdult: 'Couche 3 · Bloc Liquide Adaptatif Profond (O(N))',
      roleKid: 'Le fluide change de forme selon la difficulté de l’histoire !',
      roleAdult: 'Filtre dynamique adaptatif qui compresse les longues séquences sans saturer la RAM.',
      complexity: 'O(N) · État fixe',
      transformNoteKid: 'Même pour un très gros livre, la tour reste ultra légère.',
      transformNoteAdult: 'Empreinte mémoire linéaire idéale sur edge, laptop et contextes longs.',
    },
    {
      floor: 4,
      kind: 'attention',
      titleKid: '4. Loupe Ciblée (Point de Contrôle)',
      titleAdult: 'Couche 4 · Couche d’Attention GQA Ciblée',
      roleKid: 'Une seule grande loupe placée au bon étage pour retrouver un détail très loin !',
      roleAdult: 'Seule couche à stocker un KV-Cache : offre le rappel exact sur aiguille-dans-une-botte-de-foin.',
      complexity: 'Attention ciblée',
      transformNoteKid: 'Retrouve instantanément le prénom du héros de la page 1 !',
      transformNoteAdult: 'Hybride LFM : ~75 % blocs liquides O(N) + ~25 % attention GQA.',
    },
    {
      floor: 5,
      kind: 'liquid',
      titleKid: '5. Toboggan Liquide + Mini-Experts',
      titleAdult: 'Couche 5 · Bloc Liquide + FFN / MoE Compact',
      roleKid: 'Assemble la mémoire fluide et le détail de la loupe.',
      roleAdult: 'Combine le flux récurrent à état continu avec la transformation sémantique rapide.',
      complexity: 'O(N)',
      transformNoteKid: 'L’idée est limpide, rapide et économe en énergie !',
      transformNoteAdult: 'Débit élevé et faible latence Time-To-First-Token sur matériel léger.',
    },
    {
      floor: 6,
      kind: 'output',
      titleKid: '6. Sortie Ultra-Rapide',
      titleAdult: 'Couche 6 · LM Head & Softmax',
      roleKid: 'Annonce le mot suivant instantanément !',
      roleAdult: 'Projection lexicale haute efficacité avec empreinte KV-Cache réduite jusqu’à 4×.',
      complexity: 'O(|V|)',
      transformNoteKid: 'Mot proposé sans attendre : « brille » !',
      transformNoteAdult: 'Optimal pour IA embarquée, agents temps réel et longs contextes.',
    },
  ];

  return {
    arch,
    contextTokensK: ctx,
    kvCacheGb,
    tokensPerSec,
    longContextScore,
    energyEfficiency,
    activeParamRatio: 45,
    floors,
  };
}

const PATCH_LABELS: Record<number, string> = {
  0: 'Ciel bleu', 1: 'Nuage', 2: 'Soleil', 3: 'Rayons',
  4: 'Montagne', 5: 'Sapin', 6: 'Toit rouge', 7: 'Cheminée',
  8: 'Prairie', 9: 'Chat roux', 10: 'Fenêtre', 11: 'Porte',
  12: 'Fleurs', 13: 'Sentier', 14: 'Rivière', 15: 'Pont',
};

/**
 * Computes the multimodal token stream and latency profile for Text, Vision (VLM), Audio, and Native Omni modes.
 */
export function computeMultimodalStream(
  mode: ModalityMode,
  selectedPatchIds: number[],
  activeAudioId: string | null,
  promptText: string
): MultimodalStreamResult {
  const stream: MultimodalTokenItem[] = [];
  const words = promptText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);

  if (mode === 'vision' || mode === 'omni') {
    const patches = selectedPatchIds.length > 0 ? selectedPatchIds.slice(0, 8) : [2, 9, 6];
    patches.forEach((patchId) => {
      const label = PATCH_LABELS[patchId] ?? `Tuile #${patchId + 1}`;
      stream.push({
        id: `vis-${patchId}`,
        modality: 'vision',
        label,
        tokenCode: `<img_p${String(patchId + 1).padStart(2, '0')}>`,
      });
    });
  }

  if (mode === 'audio' || mode === 'omni') {
    const audioName =
      activeAudioId === 'music'
        ? 'Mélodie joyeuse'
        : activeAudioId === 'laugh'
        ? 'Rire malicieux'
        : 'Voix : « Regarde ! »';
    stream.push(
      { id: 'aud-1', modality: 'audio', label: `${audioName} (0-0.5s)`, tokenCode: '<aud_f01>' },
      { id: 'aud-2', modality: 'audio', label: `Ton & rythme (0.5-1s)`, tokenCode: '<aud_f02>' }
    );
  }

  words.forEach((w, i) => {
    stream.push({
      id: `txt-${i}`,
      modality: 'text',
      label: w,
      tokenCode: `<txt_${100 + (deterministicHash(w) % 899)}>`,
    });
  });

  if (mode === 'text') {
    return {
      mode,
      stream,
      totalTokens: stream.length,
      latencyMs: 140,
      isNativeUnified: false,
      pipelineSteps: ['Texte', 'Tokenizer BPE', 'Cœur LLM', 'Réponse Texte'],
    };
  }

  if (mode === 'vision') {
    return {
      mode,
      stream,
      totalTokens: stream.length,
      latencyMs: 360,
      isNativeUnified: false,
      pipelineSteps: ['Image 4×4', 'Encodeur ViT (Patchs)', 'Projecteur', 'Cœur LLM'],
    };
  }

  if (mode === 'audio') {
    return {
      mode,
      stream,
      totalTokens: stream.length,
      latencyMs: 820,
      isNativeUnified: false,
      pipelineSteps: ['Audio', 'Transcription ASR', 'Cœur LLM', 'Synthèse TTS'],
    };
  }

  // Native Omni: single unified transformer/hybrid backbone across vision, audio, and text!
  return {
    mode,
    stream,
    totalTokens: stream.length,
    latencyMs: 240,
    isNativeUnified: true,
    pipelineSteps: ['Vision + Audio + Texte', 'Prisme Omni Unifié', 'Attention Croisée', 'Sortie Directe'],
  };
}

/**
 * Exact temperature-scaled Softmax with Top-p (nucleus) filtering and Shannon entropy in bits.
 */
export function computeSoftmaxDistribution(
  candidates: CandidateLogit[],
  temperature: number,
  topP: number = 1.0
): SoftmaxDistributionResult {
  const safeTemp = Math.max(0.1, Math.min(2.0, temperature));
  const safeTopP = Math.max(0.2, Math.min(1.0, topP));

  if (candidates.length === 0) {
    return {
      candidates: [],
      entropyBits: 0,
      temperature: safeTemp,
      topP: safeTopP,
    };
  }

  const scaled = candidates.map((c) => c.logit / safeTemp);
  const maxScaled = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - maxScaled));
  const sumExp = exps.reduce((a, b) => a + b, 0);

  const withProb = candidates
    .map((c, idx) => ({
      ...c,
      probability: exps[idx] / sumExp,
    }))
    .sort((a, b) => b.probability - a.probability);

  let cumulative = 0;
  const tagged = withProb.map((item, idx) => {
    const includedInTopP = idx === 0 || cumulative < safeTopP;
    cumulative += item.probability;
    return {
      ...item,
      includedInTopP,
      renormalizedProb: 0,
    };
  });

  const keptSum = tagged
    .filter((t) => t.includedInTopP)
    .reduce((acc, t) => acc + t.probability, 0);

  const finalCandidates: SoftmaxCandidate[] = tagged.map((t) => ({
    ...t,
    renormalizedProb: t.includedInTopP && keptSum > 0 ? t.probability / keptSum : 0,
  }));

  const entropyBits = finalCandidates.reduce((acc, c) => {
    if (c.renormalizedProb <= 1e-9) return acc;
    return acc - c.renormalizedProb * Math.log2(c.renormalizedProb);
  }, 0);

  return {
    candidates: finalCandidates,
    entropyBits: Math.round(entropyBits * 100) / 100,
    temperature: safeTemp,
    topP: safeTopP,
  };
}

/**
 * Weighted draw from a SoftmaxDistributionResult using a uniform random value in [0, 1).
 */
export function sampleNextCandidate(
  distribution: SoftmaxDistributionResult,
  randomUnit: number
): SoftmaxCandidate | null {
  const active = distribution.candidates.filter((c) => c.renormalizedProb > 0);
  if (active.length === 0) return null;
  const r = Math.max(0, Math.min(0.999999, randomUnit));
  let acc = 0;
  for (const item of active) {
    acc += item.renormalizedProb;
    if (r <= acc) {
      return item;
    }
  }
  return active[active.length - 1];
}

export function createInitialProgress(): ProgressState {
  return {
    unlockedCrystals: [],
    score: 0,
    bestScore: 0,
    challengesCompleted: 0,
    quizBestAccuracy: 0,
    lumiStoriesFinished: 0,
  };
}

export function createInitialDualProgress(): { kid: ProgressState; adult: ProgressState } {
  return {
    kid: createInitialProgress(),
    adult: createInitialProgress(),
  };
}

export function updateProgressForMode(
  dual: { kid: ProgressState; adult: ProgressState },
  mode: AgeMode,
  updater: (current: ProgressState) => ProgressState
): { kid: ProgressState; adult: ProgressState } {
  if (mode === 'kid') {
    return {
      ...dual,
      kid: updater(dual.kid),
    };
  }
  return {
    ...dual,
    adult: updater(dual.adult),
  };
}

export function unlockCrystal(
  state: ProgressState,
  stationId: StationId,
  bonusPoints: number
): ProgressState {
  const alreadyHas = state.unlockedCrystals.includes(stationId);
  const unlockedCrystals = alreadyHas
    ? state.unlockedCrystals
    : [...state.unlockedCrystals, stationId];
  const added = alreadyHas ? Math.round(bonusPoints * 0.25) : bonusPoints;
  const nextScore = state.score + added;

  return {
    ...state,
    unlockedCrystals,
    score: nextScore,
    bestScore: Math.max(state.bestScore, nextScore),
    challengesCompleted: state.challengesCompleted + 1,
  };
}

export function calculateMasteryPercent(state: ProgressState): number {
  const crystalPart = (Math.min(TOTAL_STATIONS, state.unlockedCrystals.length) / TOTAL_STATIONS) * 70;
  const quizPart = (state.quizBestAccuracy / 100) * 30;
  return Math.min(100, Math.round(crystalPart + quizPart));
}

/**
 * Simulates the 3 core lifecycle stages of LLM creation:
 * 1. Pre-training (Next-token prediction on trillions of tokens)
 * 2. SFT (Supervised Fine-Tuning on curated Q&A dialogues)
 * 3. RLHF / DPO (Alignment using human preference feedback)
 */
export function simulateTrainingStage(
  stage: TrainingStageKind,
  dataScale: number
): TrainingStageSimulation {
  const scale = Math.max(1, Math.min(10, Math.round(dataScale)));

  if (stage === 'pretrain') {
    const lossValue = Math.round((4.2 - scale * 0.24) * 100) / 100;
    return {
      stage,
      dataScale: scale,
      lossValue,
      instructionFollowing: Math.min(45, 18 + scale * 2),
      safetyAlignment: Math.min(40, 15 + scale * 2),
      creativityBalance: Math.min(92, 50 + scale * 4),
      sampleOutputKid:
        '« Explique la lune ? » → « ...la lune tourne autour de la Terre. Chapitre 4 : Les marées et les bateaux... » (Il continue le livre sans te répondre vraiment !)',
      sampleOutputAdult:
        'Prompt : « Explique la photosynthèse en 2 lignes. » → Modèle brut (Base) : « Explique la photosynthèse en 2 lignes. Exercice 2 : Définissez la mitose... » (Auto-complétion pure, pas encore assistant).',
    };
  }

  if (stage === 'sft') {
    const lossValue = Math.round((2.1 - scale * 0.09) * 100) / 100;
    return {
      stage,
      dataScale: scale,
      lossValue,
      instructionFollowing: Math.min(86, 56 + scale * 3),
      safetyAlignment: Math.min(68, 42 + scale * 2),
      creativityBalance: Math.min(84, 58 + scale * 2),
      sampleOutputKid:
        '« Explique la lune ? » → « La Lune est une grosse boule de roche qui tourne autour de la Terre et reflète la lumière du Soleil ! » (Super, il répond à ta question !)',
      sampleOutputAdult:
        'SFT (Dialogues humains) : « Les plantes captent l’énergie solaire pour convertir CO₂ et eau en glucose et dioxygène. » — Suit bien les consignes, mais peut rester trop docile ou peu calibré sur les cas ambigus.',
    };
  }

  // RLHF / DPO Alignment
  const lossValue = Math.round((1.45 - scale * 0.05) * 100) / 100;
  return {
    stage,
    dataScale: scale,
    lossValue,
    instructionFollowing: Math.min(96, 76 + scale * 2),
    safetyAlignment: Math.min(97, 75 + scale * 2),
    creativityBalance: Math.min(90, 72 + scale * 2),
    sampleOutputKid:
      '« Explique la lune ? » → « La Lune est notre voisine dans le ciel ! Elle brille grâce au Soleil. Veux-tu savoir pourquoi elle change de forme ? » (Gentil, clair et prudent !)',
    sampleOutputAdult:
      'RLHF / DPO (Alignement) : « Les plantes transforment CO₂ + H₂O en glucose et O₂ grâce à la chlorophylle. (Note : en cas de doute sur un chiffre, le modèle préfère l’indiquer plutôt que d’halluciner.) »',
  };
}

/**
 * Simulates Context Window capacity, "Lost in the Middle" recall degradation,
 * eviction of early tokens, and accuracy boost from RAG + Tool Calling (Agents).
 */
export function simulateContextAndRag(
  windowCapacityK: number,
  usedContextK: number,
  ragEnabled: boolean,
  toolsEnabled: boolean
): ContextWindowSimulation {
  const cap = Math.max(4, Math.min(128, windowCapacityK));
  const used = Math.max(1, Math.min(160, usedContextK));
  const fillPercent = Math.min(100, Math.round((used / cap) * 100));
  const evictedPercent = used > cap ? Math.min(95, Math.round(((used - cap) / used) * 100)) : 0;

  // Classic "Lost in the Middle" U-shaped attention curve as fill rises
  const beginningRecall = evictedPercent > 0 ? Math.max(8, 72 - evictedPercent) : Math.max(78, 96 - Math.round(fillPercent * 0.14));
  const middleRecall = Math.max(24, Math.round(92 - fillPercent * 0.56 - evictedPercent * 0.3));
  const endRecall = Math.max(84, 98 - Math.round(fillPercent * 0.08));

  let factualAccuracy = Math.round((beginningRecall * 0.25 + middleRecall * 0.45 + endRecall * 0.3));
  if (ragEnabled) factualAccuracy = Math.min(97, factualAccuracy + 24);
  if (toolsEnabled) factualAccuracy = Math.min(99, factualAccuracy + 14);

  const answerPreviewKid =
    ragEnabled && toolsEnabled
      ? 'Super ! Lumi ouvre son livre-bibliothèque (RAG) pour lire la météo d’aujourd’hui ET utilise sa calculatrice magique : 24 × 17 = 408 sans erreur !'
      : ragEnabled
      ? 'Malin ! Grâce au livre-bibliothèque (RAG), Lumi retrouve le secret perdu même si son sac à dos mémoire est plein !'
      : toolsEnabled
      ? 'Chouette ! Lumi a pris sa calculatrice-outil pour compter juste, mais sans la bibliothèque il ne connaît pas les nouvelles d’aujourd’hui.'
      : evictedPercent > 0
      ? 'Oups ! Le sac à dos déborde : Lumi a oublié le prénom du héros raconté au tout début !'
      : 'Lumi se souvient de ce qu’il a dans son sac, mais il ne peut pas encore vérifier un calcul difficile ni les infos du jour.';

  const answerPreviewAdult =
    ragEnabled && toolsEnabled
      ? 'Agent complet (RAG + Tool Calling) : recherche vectorielle Top-k injectée en fin de prompt + appel déterministe `calc(24 * 17) → 408`. Précision factuelle maximale.'
      : ragEnabled
      ? 'RAG actif : les passages pertinents sont extraits d’une base vectorielle externe et placés dans le contexte actif, contournant la date de coupure d’entraînement.'
      : toolsEnabled
      ? 'Tool Calling actif : le LLM délègue le calcul exact et l’API externe à un outil déterministe plutôt que de deviner les chiffres token par token.'
      : evictedPercent > 0
      ? `Dépassement de fenêtre (${used}k > ${cap}k) : ${evictedPercent}% des premiers tokens sont évincés du KV-Cache ; phénomène « Lost in the Middle » prononcé.`
      : `Contexte pur (${fillPercent}% rempli) : aucun accès aux faits post-entraînement ni aux outils exacts ; le rappel au milieu du prompt chute à ${middleRecall}%.`;

  return {
    windowCapacityK: cap,
    usedContextK: used,
    fillPercent,
    evictedPercent,
    beginningRecall,
    middleRecall,
    endRecall,
    factualAccuracy,
    ragActive: ragEnabled,
    toolsActive: toolsEnabled,
    answerPreviewKid,
    answerPreviewAdult,
  };
}

/**
 * Simulates Direct Generation vs Chain-of-Thought (CoT) vs Test-Time Verification
 * on a multi-step logical riddle ("3 paniers de 4 pommes, on en donne 5...").
 */
export function simulateReasoningBudget(
  mode: ReasoningMode,
  thinkingSteps: number
): ReasoningSimulation {
  const steps = Math.max(1, Math.min(5, Math.round(thinkingSteps)));

  if (mode === 'direct') {
    return {
      mode,
      thinkingSteps: 0,
      thinkingTokens: 12,
      accuracyPercent: 42,
      latencySec: 0.4,
      stepsKid: ['Lumi répond tout de suite sans réfléchir dans son carnet de brouillon !'],
      stepsAdult: ['Génération directe en 1 passe avant (System 1) : aucun token de raisonnement intermédiaire.'],
      finalAnswerKid: '« Euh... 9 pommes ? » (Oups ! Il est allé trop vite et a mélangé les nombres !)',
      finalAnswerAdult: 'Réponse impulsive : « 9 » (Erreur fréquente de calcul mental en une seule passe autorégressive).',
      isCorrect: false,
    };
  }

  if (mode === 'cot') {
    const accuracy = Math.min(91, 68 + steps * 6);
    const tokens = 48 + steps * 26;
    const latency = Math.round((0.8 + steps * 0.35) * 10) / 10;
    return {
      mode,
      thinkingSteps: steps,
      thinkingTokens: tokens,
      accuracyPercent: accuracy,
      latencySec: latency,
      stepsKid: [
        'Étape 1 : 3 paniers avec 4 pommes chacun → 4 + 4 + 4 = 12 pommes.',
        'Étape 2 : Lumi offre 5 pommes à ses amis → 12 − 5 = 7 pommes.',
        ...(steps >= 3 ? ['Étape 3 : Je relis la question pour être sûr que c’est bien 7 !'] : []),
      ],
      stepsAdult: [
        '<think> Décomposition : 3 paniers × 4 = 12 unités initiales. </think>',
        '<think> Soustraction : 12 − 5 données = 7 unités restantes. </think>',
        ...(steps >= 3
          ? ['<think> Chaque token généré devient un état de mémoire de travail visible par l’Attention. </think>']
          : []),
      ],
      finalAnswerKid: '« Il reste exactement 7 pommes ! » (Bravo, le carnet de brouillon a tout changé !)',
      finalAnswerAdult: 'Réponse exacte : « 7 pommes » — Le Chain-of-Thought externalise le calcul dans le flux de tokens.',
      isCorrect: true,
    };
  }

  // Test-Time Compute + Self-Verification
  const accuracy = Math.min(98, 84 + steps * 3);
  const tokens = 95 + steps * 42;
  const latency = Math.round((1.5 + steps * 0.55) * 10) / 10;
  return {
    mode,
    thinkingSteps: steps,
    thinkingTokens: tokens,
    accuracyPercent: accuracy,
    latencySec: latency,
    stepsKid: [
      'Étape 1 : 3 paniers × 4 pommes = 12 pommes au départ.',
      'Étape 2 : 12 − 5 pommes offertes = 7 pommes.',
      'Étape 3 (Vérification inverse) : 7 + 5 = 12 pommes ! Tout est juste !',
    ],
    stepsAdult: [
      '<think> Hypothèse A : 3 × 4 = 12 ; 12 − 5 = 7. </think>',
      '<think> Auto-vérification (backtracking) : 7 + 5 = 12 = 3 × 4 → cohérence vérifiée. </think>',
      '<think> Test-Time Compute : échanger un peu de latence contre une fiabilité logique élevée. </think>',
    ],
    finalAnswerKid: '« 7 pommes, vérifié deux fois ! » (Champion de logique !)',
    finalAnswerAdult: 'Réponse vérifiée : « 7 pommes » — Loi d’échelle au temps d’inférence (Test-Time Scaling).',
    isCorrect: true,
  };
}

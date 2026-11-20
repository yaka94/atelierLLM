import type { ProgressState, StationId } from './types';

export type AchievementCategory = 'station' | 'score' | 'mastery';

export type AchievementArtKey =
  | 'tokens'
  | 'attention'
  | 'layers'
  | 'omni'
  | 'prediction'
  | 'training'
  | 'contextRag'
  | 'reasoning'
  | 'stationsMedallion'
  | 'scoreTrophy'
  | 'quizPrism';

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  stationId?: StationId;
  artKey: AchievementArtKey;
  titleKid: string;
  titleAdult: string;
  descriptionKid: string;
  descriptionAdult: string;
  targetValue: number;
  unit: string;
  evaluate: (progress: ProgressState) => number;
}

export interface EvaluatedAchievement {
  id: string;
  category: AchievementCategory;
  stationId?: StationId;
  artKey: AchievementArtKey;
  titleKid: string;
  titleAdult: string;
  descriptionKid: string;
  descriptionAdult: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  unlocked: boolean;
}

export interface AchievementsSummary {
  items: EvaluatedAchievement[];
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
  stationsUnlocked: number;
  stationsTotal: number;
  nextScoreMilestone: EvaluatedAchievement | null;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 8 Station Completion Badges
  {
    id: 'badge-tokens',
    category: 'station',
    stationId: 'tokens',
    artKey: 'tokens',
    titleKid: 'Artisan des Perles',
    titleAdult: 'Maître Tokeniseur BPE',
    descriptionKid: 'Gagne le Cristal de la station Les Perles de Mots.',
    descriptionAdult: 'Validez le Défi Éclair de la station Tokens & Encodage BPE.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('tokens') ? 1 : 0),
  },
  {
    id: 'badge-attention',
    category: 'station',
    stationId: 'attention',
    artKey: 'attention',
    titleKid: 'Éclaireur de la Lampe',
    titleAdult: 'Architecte Self-Attention',
    descriptionKid: 'Gagne le Cristal de la station La Lampe Magique.',
    descriptionAdult: 'Validez le Défi Éclair de la station Self-Attention & Q·K·V.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('attention') ? 1 : 0),
  },
  {
    id: 'badge-layers',
    category: 'station',
    stationId: 'layers',
    artKey: 'layers',
    titleKid: 'Pilote de la Tour Liquide',
    titleAdult: 'Ingénieur Hybride LFM3',
    descriptionKid: 'Gagne le Cristal de la station La Tour des Étages.',
    descriptionAdult: 'Validez le Défi Éclair sur Transformer, MoE et Hybride LFM3.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('layers') ? 1 : 0),
  },
  {
    id: 'badge-omni',
    category: 'station',
    stationId: 'omni',
    artKey: 'omni',
    titleKid: 'Gardien du Prisme',
    titleAdult: 'Spécialiste Omni-Vision',
    descriptionKid: 'Gagne le Cristal de la station Le Prisme des 5 Sens.',
    descriptionAdult: 'Validez le Défi Éclair sur la patchification ViT et la fusion Omni.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('omni') ? 1 : 0),
  },
  {
    id: 'badge-prediction',
    category: 'station',
    stationId: 'prediction',
    artKey: 'prediction',
    titleKid: 'Dompteur de la Roue',
    titleAdult: 'Stratège Softmax & Top-p',
    descriptionKid: 'Gagne le Cristal de la station La Roue du Mot Suivant.',
    descriptionAdult: 'Validez le Défi Éclair sur Température, Top-p et hallucinations.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('prediction') ? 1 : 0),
  },
  {
    id: 'badge-training',
    category: 'station',
    stationId: 'training',
    artKey: 'training',
    titleKid: 'Professeur de Lumi',
    titleAdult: 'Spécialiste Pré-train & RLHF',
    descriptionKid: 'Gagne le Cristal de la station L’École & la Boussole.',
    descriptionAdult: 'Validez le Défi Éclair sur Pré-entraînement, SFT et alignement RLHF.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('training') ? 1 : 0),
  },
  {
    id: 'badge-context-rag',
    category: 'station',
    stationId: 'context_rag',
    artKey: 'contextRag',
    titleKid: 'Explorateur à Loupes',
    titleAdult: 'Architecte Contexte & RAG',
    descriptionKid: 'Gagne le Cristal de la station Le Sac à Dos & les Loupes.',
    descriptionAdult: 'Validez le Défi Éclair sur Fenêtre de Contexte, RAG et Agents/Outils.',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('context_rag') ? 1 : 0),
  },
  {
    id: 'badge-reasoning',
    category: 'station',
    stationId: 'reasoning',
    artKey: 'reasoning',
    titleKid: 'As du Carnet Magique',
    titleAdult: 'Expert Chain-of-Thought',
    descriptionKid: 'Gagne le Cristal de la station Le Carnet de Brouillon.',
    descriptionAdult: 'Validez le Défi Éclair sur le raisonnement étape par étape (CoT).',
    targetValue: 1,
    unit: 'cristal',
    evaluate: (p) => (p.unlockedCrystals.includes('reasoning') ? 1 : 0),
  },

  // 3 Score Milestones
  {
    id: 'score-100',
    category: 'score',
    artKey: 'scoreTrophy',
    titleKid: 'Première Étincelle',
    titleAdult: 'Jalon · 100 points',
    descriptionKid: 'Atteins 100 points dans l’Atelier de Lumi.',
    descriptionAdult: 'Cumulez 100 points via les défis de station ou le quiz.',
    targetValue: 100,
    unit: 'pts',
    evaluate: (p) => Math.min(100, Math.round(Math.max(p.score, p.bestScore))),
  },
  {
    id: 'score-400',
    category: 'score',
    artKey: 'scoreTrophy',
    titleKid: 'Apprenti Lumineux',
    titleAdult: 'Jalon · 400 points',
    descriptionKid: 'Atteins 400 points en explorant plusieurs stations.',
    descriptionAdult: 'Atteignez 400 points de maîtrise cumulée dans l’Atelier.',
    targetValue: 400,
    unit: 'pts',
    evaluate: (p) => Math.min(400, Math.round(Math.max(p.score, p.bestScore))),
  },
  {
    id: 'score-800',
    category: 'score',
    artKey: 'scoreTrophy',
    titleKid: 'Grand Savant de l’Atelier',
    titleAdult: 'Jalon · 800 points',
    descriptionKid: 'Atteins 800 points en relevant les défis et le Grand Quiz !',
    descriptionAdult: 'Franchissez les 800 points en combinant stations et Quiz Adaptatif.',
    targetValue: 800,
    unit: 'pts',
    evaluate: (p) => Math.min(800, Math.round(Math.max(p.score, p.bestScore))),
  },

  // 3 Grand Mastery Awards
  {
    id: 'mastery-all-stations',
    category: 'mastery',
    artKey: 'stationsMedallion',
    titleKid: 'Collectionneur des 8 Cristaux',
    titleAdult: 'Maîtrise Complète des 8 Modules',
    descriptionKid: 'Récolte les 8 Cristaux de Savoir dans toutes les stations.',
    descriptionAdult: 'Complétez les 8 modules fondamentaux et avancés de l’Atelier.',
    targetValue: 8,
    unit: 'cristaux',
    evaluate: (p) => Math.min(8, p.unlockedCrystals.length),
  },
  {
    id: 'mastery-quiz-ace',
    category: 'mastery',
    artKey: 'quizPrism',
    titleKid: 'Étoile du Grand Quiz',
    titleAdult: 'Précision Adaptative ≥ 80 %',
    descriptionKid: 'Réussis au moins 80 % de bonnes réponses au Quiz Adaptatif.',
    descriptionAdult: 'Atteignez au moins 80 % de précision sur le Quiz Technique Adaptatif.',
    targetValue: 80,
    unit: '%',
    evaluate: (p) => Math.min(80, Math.round(p.quizBestAccuracy)),
  },
  {
    id: 'mastery-lumi-story',
    category: 'mastery',
    artKey: 'quizPrism',
    titleKid: 'Conteur Ami de Lumi',
    titleAdult: 'Vulgarisateur Créatif',
    descriptionKid: 'Invente et termine au moins 1 histoire avec Lumi le robot.',
    descriptionAdult: 'Complétez une histoire interactive dans le Coin de Lumi.',
    targetValue: 1,
    unit: 'histoire',
    evaluate: (p) => Math.min(1, p.lumiStoriesFinished),
  },
];

export function evaluateAchievements(progress: ProgressState): AchievementsSummary {
  const items: EvaluatedAchievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const raw = def.evaluate(progress);
    const currentValue = Math.max(0, Math.min(def.targetValue, raw));
    const unlocked = currentValue >= def.targetValue;
    const progressPercent =
      def.targetValue > 0 ? Math.round((currentValue / def.targetValue) * 100) : 0;

    return {
      id: def.id,
      category: def.category,
      stationId: def.stationId,
      artKey: def.artKey,
      titleKid: def.titleKid,
      titleAdult: def.titleAdult,
      descriptionKid: def.descriptionKid,
      descriptionAdult: def.descriptionAdult,
      currentValue,
      targetValue: def.targetValue,
      unit: def.unit,
      progressPercent,
      unlocked,
    };
  });

  const unlockedCount = items.filter((i) => i.unlocked).length;
  const totalCount = items.length;
  const completionPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const stationItems = items.filter((i) => i.category === 'station');
  const stationsUnlocked = stationItems.filter((i) => i.unlocked).length;

  const nextScoreMilestone =
    items.find((i) => i.category === 'score' && !i.unlocked) ?? null;

  return {
    items,
    unlockedCount,
    totalCount,
    completionPercent,
    stationsUnlocked,
    stationsTotal: stationItems.length,
    nextScoreMilestone,
  };
}

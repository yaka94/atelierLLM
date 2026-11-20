import titleBgArt from '../assets/images/title_bg_1795174387115.jpg';
import stationTokensArt from '../assets/images/station_tokens_1795174386993.jpg';
import stationAttentionArt from '../assets/images/station_attention_1795174386741.jpg';
import stationLayersArt from '../assets/images/station_layers_lfm_1795174385307.jpg';
import stationOmniArt from '../assets/images/station_omni_vision_1795174385226.jpg';
import stationTrainingArt from '../assets/images/station_training_rlhf_1795181143537.jpg';
import stationContextRagArt from '../assets/images/station_context_rag_1795181141934.jpg';
import stationReasoningArt from '../assets/images/station_reasoning_cot_1795181142943.jpg';
import rewardStationsMedallionArt from '../assets/images/reward_stations_medallion_1795180565887.jpg';
import rewardScoreTrophyArt from '../assets/images/reward_score_trophy_1795180565773.jpg';
import rewardQuizPrismArt from '../assets/images/reward_quiz_prism_1795180566468.jpg';

import type {
  AttentionSentence,
  CandidateLogit,
  LumiMood,
  StationChapter,
  StationId,
} from './types';

export const ART_ASSETS = {
  titleBg: titleBgArt,
  tokens: stationTokensArt,
  attention: stationAttentionArt,
  layers: stationLayersArt,
  omni: stationOmniArt,
  training: stationTrainingArt,
  contextRag: stationContextRagArt,
  reasoning: stationReasoningArt,
} as const;

export const REWARD_ASSETS = {
  stationsMedallion: rewardStationsMedallionArt,
  scoreTrophy: rewardScoreTrophyArt,
  quizPrism: rewardQuizPrismArt,
} as const;

export interface StationMeta {
  id: StationId;
  order: number;
  chapter: StationChapter;
  titleKid: string;
  titleAdult: string;
  subtitleKid: string;
  subtitleAdult: string;
  neurosciencePillar: string;
  image: string;
  imageAlt: string;
  accentHex: string;
}

export const STATIONS: StationMeta[] = [
  {
    id: 'tokens',
    order: 1,
    chapter: 'core',
    titleKid: 'Les Perles de Mots',
    titleAdult: 'Découper le texte (Tokens)',
    subtitleKid: 'Découpe les phrases en petites perles colorées',
    subtitleAdult: 'Comment l’IA transforme vos phrases en morceaux numérotés (encodage BPE)',
    neurosciencePillar: 'Double codage · Manipulation tactile',
    image: ART_ASSETS.tokens,
    imageAlt: 'Établi en bois ensoleillé garni de perles colorées et blocs de bois représentant les tokens',
    accentHex: '#C97714',
  },
  {
    id: 'attention',
    order: 2,
    chapter: 'core',
    titleKid: 'La Lampe Magique',
    titleAdult: 'Relier les mots (Attention)',
    subtitleKid: 'Éclaire les mots amis qui expliquent le secret',
    subtitleAdult: 'Comment le modèle comprend le contexte et de qui parle une phrase (Q·K·V)',
    neurosciencePillar: 'Attention focalisée · Liens visuels',
    image: ART_ASSETS.attention,
    imageAlt: 'Coupole d’observatoire illuminant un chat, un coussin et une couronne par des faisceaux dorés',
    accentHex: '#0F769E',
  },
  {
    id: 'layers',
    order: 3,
    chapter: 'core',
    titleKid: 'La Tour des Étages',
    titleAdult: 'Les Couches : Transformer, MoE & LFM3',
    subtitleKid: 'Envoie les perles monter dans les toboggans liquides',
    subtitleAdult: 'Comment le sens s’affine d’étage en étage, des modèles classiques aux architectures hybrides',
    neurosciencePillar: 'Échafaudage progressif · Modèle mental',
    image: ART_ASSETS.layers,
    imageAlt: 'Tour en coupe avec conduits liquides dorés, lentilles d’attention et ateliers d’experts',
    accentHex: '#0E7A5F',
  },
  {
    id: 'omni',
    order: 4,
    chapter: 'core',
    titleKid: 'Le Prisme des 5 Sens',
    titleAdult: 'Lire texte, images & sons (Omni-Vision)',
    subtitleKid: 'Mélange images, musique et mots dans le cristal',
    subtitleAdult: 'Comment l’IA découpe une photo en vignettes et unifie vue, audio et langage',
    neurosciencePillar: 'Intégration multisensorielle · Analogie',
    image: ART_ASSETS.omni,
    imageAlt: 'Prisme de cristal fusionnant mosaïque visuelle, ondes sonores et perles de texte',
    accentHex: '#7C4D9E',
  },
  {
    id: 'prediction',
    order: 5,
    chapter: 'core',
    titleKid: 'La Roue du Mot Suivant',
    titleAdult: 'Choisir le mot suivant & Hallucinations',
    subtitleKid: 'Tourne le thermomètre de l’imagination et crée une histoire',
    subtitleAdult: 'Probabilités (Softmax), créativité (température) et pourquoi une IA peut inventer',
    neurosciencePillar: 'Erreur de prédiction · Retour immédiat',
    image: ART_ASSETS.titleBg,
    imageAlt: 'Lumi le robot dans son observatoire étoilé observant des constellations lumineuses',
    accentHex: '#C2412D',
  },
  {
    id: 'training',
    order: 6,
    chapter: 'advanced',
    titleKid: 'L’École & la Boussole',
    titleAdult: 'Comment une IA s’entraîne (RLHF)',
    subtitleKid: 'Comment Lumi apprend à lire, puis à répondre gentiment',
    subtitleAdult: 'De la lecture de milliards de textes jusqu’aux réglages humains (SFT & alignement)',
    neurosciencePillar: 'Apprentissage par essais-erreurs · Renforcement',
    image: ART_ASSETS.training,
    imageAlt: 'Bibliothèque dorée où des livres volent vers un cristal équilibré par une balance d’étoiles',
    accentHex: '#B45309',
  },
  {
    id: 'context_rag',
    order: 7,
    chapter: 'advanced',
    titleKid: 'Le Sac à Dos & les Loupes',
    titleAdult: 'Mémoire, Sources & Outils (RAG)',
    subtitleKid: 'Pourquoi le sac mémoire déborde et comment les outils aident Lumi',
    subtitleAdult: 'Pourquoi l’IA oublie sur de longs textes, et comment elle consulte des documents ou outils',
    neurosciencePillar: 'Mémoire de travail vs mémoire externe',
    image: ART_ASSETS.contextRag,
    imageAlt: 'Sacoche lumineuse reliée par des faisceaux bleus à un fichier de bibliothèque, une loupe et une calculatrice',
    accentHex: '#0369A1',
  },
  {
    id: 'reasoning',
    order: 8,
    chapter: 'advanced',
    titleKid: 'Le Carnet de Brouillon',
    titleAdult: 'Réfléchir étape par étape (Raisonnement)',
    subtitleKid: 'Réfléchir pas à pas dans un brouillon pour réussir les énigmes',
    subtitleAdult: 'Comment un brouillon interne (Chain-of-Thought) évite les erreurs de précipitation',
    neurosciencePillar: 'Métacognition · Décomposition étape par étape',
    image: ART_ASSETS.reasoning,
    imageAlt: 'Carnet illuminé projetant des marches dorées vers un cristal vert résolu sous un ciel étoilé',
    accentHex: '#047857',
  },
];

export const NEUROSCIENCE_PILLARS = [
  {
    title: 'Engagement actif',
    description:
      'Un cerveau apprend en agissant et en testant des hypothèses : chaque notion est manipulable à la souris en temps réel.',
  },
  {
    title: 'Double codage (Paivio)',
    description:
      'Associer une illustration riche, un schéma interactif et une voix douce crée deux chemins de mémorisation parallèles.',
  },
  {
    title: 'Retour sur erreur bienveillant (Dehaene)',
    description:
      'L’erreur n’est pas une faute : c’est un signal d’ajustement immédiat qui renforce les connexions neuronales.',
  },
  {
    title: 'Récupération active & adaptative',
    description:
      'Se tester régulièrement avec une difficulté qui s’ajuste à son niveau consolide la mémoire à long terme.',
  },
];

export const TOKEN_PRESETS_KID = [
  'Le petit dinosaure mange des fraises !',
  'Bonjour Lumi le robot magicien !',
  'Un chat roux dort sur un coussin doux.',
  'La fusée vole vers la lune dorée.',
];

export const TOKEN_PRESETS_ADULT = [
  'Les modèles hybrides LFM3 combinent couches liquides et attention.',
  'Anticonstitutionnellement, un token BPE fragmente les mots rares !',
  'Un modèle Omni fusionne vision, audio et texte nativement.',
  'Combien de lettres r contient le mot fraise ?',
];

export const ATTENTION_SENTENCES: AttentionSentence[] = [
  {
    id: 'apple-red',
    labelKid: 'La pomme rouge',
    labelAdult: 'Coréférence : « elle » → « pomme »',
    tokens: ['Le', 'robot', 'pose', 'la', 'pomme', 'sur', 'la', 'table', 'car', 'elle', 'est', 'rouge'],
    defaultFocusIndex: 9,
    kidPrompt: 'Clique sur « elle » pour voir quel mot la lampe magique éclaire !',
    adultPrompt: 'Observez comment la tête de coréférence relie le pronom « elle » à « pomme » grâce à l’attribut « rouge ».',
    heads: [
      {
        name: 'Tête 1 · Coréférence',
        kidName: 'Lampe des Amis',
        description: 'Résout les pronoms (« elle », « il ») vers le nom correspondant.',
        affinities: {
          9: { 4: 4.8, 11: 3.1, 7: 1.1, 1: -0.4 },
          11: { 4: 4.2, 9: 3.3, 10: 1.4 },
          4: { 3: 2.2, 11: 3.2, 2: 2.4 },
          1: { 0: 2.4, 2: 3.4 },
        },
      },
      {
        name: 'Tête 2 · Syntaxe',
        kidName: 'Lampe des Actions',
        description: 'Relie les verbes à leurs sujets et compléments directs.',
        affinities: {
          2: { 1: 4.5, 4: 3.9, 7: 2.0 },
          9: { 10: 3.8, 11: 3.0, 8: 2.2 },
          10: { 9: 4.1, 11: 3.6 },
        },
      },
      {
        name: 'Tête 3 · Sémantique',
        kidName: 'Lampe des Couleurs',
        description: 'Associe objets et propriétés physiques cohérentes.',
        affinities: {
          11: { 4: 5.0, 7: 0.4, 1: -0.3 },
          7: { 5: 3.2, 2: 2.8, 4: 2.1 },
          9: { 4: 4.2, 11: 3.9 },
        },
      },
    ],
  },
  {
    id: 'table-heavy',
    labelKid: 'La table lourde',
    labelAdult: 'Désambiguïsation : « lourde »',
    tokens: ['Le', 'robot', 'pose', 'la', 'pomme', 'sur', 'la', 'table', 'car', 'elle', 'est', 'lourde'],
    defaultFocusIndex: 9,
    kidPrompt: 'Un seul mot a changé (« lourde ») ! Regarde où la lampe brille maintenant !',
    adultPrompt: 'Remplacer « rouge » par « lourde » bascule le vecteur de requête : l’attention déplace son pic vers « table ».',
    heads: [
      {
        name: 'Tête 1 · Coréférence',
        kidName: 'Lampe des Amis',
        description: 'Bascule le pronom « elle » vers l’objet le plus cohérent physiquement.',
        affinities: {
          9: { 7: 4.7, 11: 3.4, 4: 1.4, 1: -0.3 },
          11: { 7: 4.5, 9: 3.1, 4: 0.8 },
          7: { 6: 2.0, 11: 3.4, 5: 2.5 },
        },
      },
      {
        name: 'Tête 2 · Syntaxe',
        kidName: 'Lampe des Actions',
        description: 'Connecte prédicats et compléments circonstanciels.',
        affinities: {
          2: { 1: 4.4, 4: 3.8, 7: 2.4 },
          9: { 10: 3.9, 11: 3.2 },
        },
      },
      {
        name: 'Tête 3 · Sémantique',
        kidName: 'Lampe des Poids',
        description: 'Compare la masse attendue d’une table vs une pomme.',
        affinities: {
          11: { 7: 4.9, 4: 0.9, 1: 1.3 },
          9: { 7: 4.3, 11: 3.7 },
        },
      },
    ],
  },
  {
    id: 'avocat-homonym',
    labelKid: 'Le mot mystère « avocat »',
    labelAdult: 'Polysémie : « avocat » (métier vs fruit)',
    tokens: ['L’avocat', 'en', 'robe', 'noire', 'mange', 'un', 'avocat', 'bien', 'mûr'],
    defaultFocusIndex: 6,
    kidPrompt: 'Il y a deux fois le mot « avocat » ! Clique sur chacun pour voir la différence.',
    adultPrompt: 'Même token lexical, représentations contextuelles opposées selon le voisinage (« robe noire » vs « mange / mûr »).',
    heads: [
      {
        name: 'Tête 1 · Contexte lexical',
        kidName: 'Lampe du Sens',
        description: 'Désambiguïse un homonyme à partir des indices voisins.',
        affinities: {
          0: { 2: 4.6, 3: 3.8, 4: 2.2, 6: -0.5 },
          6: { 4: 4.5, 8: 4.9, 7: 2.3, 0: -0.4 },
          8: { 6: 4.8, 4: 2.5 },
        },
      },
      {
        name: 'Tête 2 · Syntaxe',
        kidName: 'Lampe des Actions',
        description: 'Identifie le sujet (personne) et l’objet mangé (fruit).',
        affinities: {
          4: { 0: 4.6, 6: 4.2 },
          0: { 4: 4.1, 2: 2.6 },
          6: { 4: 4.4, 5: 2.4 },
        },
      },
      {
        name: 'Tête 3 · Sémantique',
        kidName: 'Lampe des Images',
        description: 'Sépare le concept juridique du concept culinaire.',
        affinities: {
          0: { 2: 4.8, 3: 4.0 },
          6: { 8: 5.0, 4: 4.0 },
        },
      },
    ],
  },
];

export interface VisionPatchTile {
  id: number;
  label: string;
  color: string;
  emoji: string;
  category: 'sky' | 'nature' | 'house' | 'cat';
}

export const VISION_PATCHES: VisionPatchTile[] = [
  { id: 0, label: 'Ciel bleu', color: '#7DD3FC', emoji: '☁️', category: 'sky' },
  { id: 1, label: 'Nuage doux', color: '#BAE6FD', emoji: '⛅', category: 'sky' },
  { id: 2, label: 'Soleil doré', color: '#FDE047', emoji: '☀️', category: 'sky' },
  { id: 3, label: 'Rayons', color: '#FEF08A', emoji: '✨', category: 'sky' },
  { id: 4, label: 'Montagne', color: '#94A3B8', emoji: '⛰️', category: 'nature' },
  { id: 5, label: 'Grand sapin', color: '#4ADE80', emoji: '🌲', category: 'nature' },
  { id: 6, label: 'Toit rouge', color: '#F87171', emoji: '🔺', category: 'house' },
  { id: 7, label: 'Cheminée', color: '#FB923C', emoji: '🏠', category: 'house' },
  { id: 8, label: 'Prairie', color: '#86EFAC', emoji: '🌿', category: 'nature' },
  { id: 9, label: 'Chat roux', color: '#FDBA74', emoji: '🐱', category: 'cat' },
  { id: 10, label: 'Fenêtre', color: '#FDE68A', emoji: '🪟', category: 'house' },
  { id: 11, label: 'Porte bois', color: '#D6A46F', emoji: '🚪', category: 'house' },
  { id: 12, label: 'Fleurs', color: '#F9A8D4', emoji: '🌸', category: 'nature' },
  { id: 13, label: 'Sentier', color: '#E5D3B3', emoji: '🪨', category: 'nature' },
  { id: 14, label: 'Rivière', color: '#38BDF8', emoji: '💧', category: 'nature' },
  { id: 15, label: 'Petit pont', color: '#C29B61', emoji: '🌉', category: 'nature' },
];

export interface PredictionStep {
  id: string;
  prefixKid: string;
  prefixAdult: string;
  candidates: CandidateLogit[];
  hallucinationWarningKid: string;
  hallucinationWarningAdult: string;
}

export const PREDICTION_STEPS: PredictionStep[] = [
  {
    id: 'cat-bowl',
    prefixKid: 'Dans le jardin magique, le petit chat boit son bol de',
    prefixAdult: 'Contexte créatif : « Dans le conte, le chat curieux s’approche de son bol de »',
    candidates: [
      { token: 'lait', logit: 4.3, kidHint: 'Très logique !', isFactual: true },
      { token: 'crème', logit: 2.9, kidHint: 'Possible et gourmand', isFactual: true },
      { token: 'soupe', logit: 1.5, kidHint: 'Un peu drôle', isFactual: false },
      { token: 'nuages', logit: 0.7, kidHint: 'Très poétique !', isFactual: false },
      { token: 'trompettes', logit: 0.1, kidHint: 'Complètement foufou !', isFactual: false },
    ],
    hallucinationWarningKid:
      'Si tu choisis « trompettes », c’est rigolo dans un conte, mais faux dans la vraie vie ! Un robot appelle ça une hallucination.',
    hallucinationWarningAdult:
      'Même si un token improbable est tiré (T élevé), le modèle continue de façon fluide : probabilité de séquence ≠ vérité vérifiée.',
  },
  {
    id: 'adult-paris',
    prefixKid: 'La fusée brillante décolle très haut vers la',
    prefixAdult: 'Complétion factuelle : « Le théorème de Pythagore relie les côtés d’un triangle »',
    candidates: [
      { token: 'rectangle', logit: 4.8, kidHint: 'Réponse exacte', isFactual: true },
      { token: 'isocèle', logit: 1.8, kidHint: 'Imprécis', isFactual: false },
      { token: 'équilatéral', logit: 1.2, kidHint: 'Erreur mathématique', isFactual: false },
      { token: 'sphérique', logit: 0.5, kidHint: 'Hors contexte euclidien', isFactual: false },
      { token: 'musical', logit: -0.2, kidHint: 'Hallucination pure', isFactual: false },
    ],
    hallucinationWarningKid:
      'Pour une question de maths ou de science, il faut un thermomètre FROID (sage) pour ne pas inventer n’importe quoi !',
    hallucinationWarningAdult:
      'En tâche factuelle ou code, on baisse T (0.1–0.3) pour réduire l’entropie et éviter les dérives hors vérité.',
  },
];

// ===================== LUMI INTERACTIVE COMPANION (KID 5+ MODE) =====================
export interface LumiQaItem {
  id: string;
  question: string;
  mood: LumiMood;
  answer: string;
  visualAnalogyTitle: string;
  visualPieces: string[];
  visualCaption: string;
}

export const LUMI_QA_ITEMS: LumiQaItem[] = [
  {
    id: 'what-is-word',
    question: 'C’est quoi un mot pour un robot ?',
    mood: 'happy',
    answer:
      'Pour toi, « chat » est un mot avec 4 lettres. Pour moi, c’est une petite perle magique avec un numéro secret ! Quand je vois la perle « chat », j’allume aussitôt mes souvenirs de moustaches et de ronrons.',
    visualAnalogyTitle: 'Un mot = une perle colorée',
    visualPieces: ['🐱 chat (#482)', '🥛 lait (#193)', '☀️ soleil (#705)'],
    visualCaption: 'Chaque perle a une couleur et un numéro secret.',
  },
  {
    id: 'what-is-sentence',
    question: 'C’est quoi une phrase ?',
    mood: 'curious',
    answer:
      'Une phrase, c’est un collier de perles mises dans le bon ordre ! Si on mélange les perles (« mange chat le »), le collier est tout emmêlé. Quand elles sont bien rangées, l’histoire s’éclaire !',
    visualAnalogyTitle: 'Une phrase = un collier de perles',
    visualPieces: ['Le', 'petit', 'chat', 'boit', 'du', 'lait'],
    visualCaption: 'Les perles se donnent la main pour raconter une idée.',
  },
  {
    id: 'how-see-image',
    question: 'Comment tu fais pour voir une image ?',
    mood: 'celebrating',
    answer:
      'Je n’ai pas des yeux comme toi, alors je découpe la photo en petits carrés comme un puzzle ! Chaque carré devient une perle d’image que je lis exactement comme un mot.',
    visualAnalogyTitle: 'Une image = un puzzle de petits carrés',
    visualPieces: ['☀️ Carré 1', '☁️ Carré 2', '🐱 Carré 3', '🌸 Carré 4'],
    visualCaption: 'Avec mon prisme Omni, mes yeux et mes oreilles parlent la même langue !',
  },
  {
    id: 'why-mistakes',
    question: 'Pourquoi tu te trompes parfois ?',
    mood: 'thinking',
    answer:
      'Je suis très fort au jeu du mot suivant, mais je ne vais pas dans le jardin vérifier si c’est vrai ! Parfois j’invente une jolie réponse fausse : on appelle ça une hallucination. Heureusement, toi tu peux vérifier !',
    visualAnalogyTitle: 'Deviner ≠ Vérifier dans le monde réel',
    visualPieces: ['🎲 Je devine', '➡️', '🔍 Tu vérifies !'],
    visualCaption: 'Le meilleur duo, c’est un robot curieux + un enfant malin !',
  },
  {
    id: 'do-you-think',
    question: 'Est-ce que tu penses comme un humain ?',
    mood: 'happy',
    answer:
      'Non ! Moi je n’ai ni cœur qui bat, ni faim de fraises, ni vrais rêves. Je fais des milliards de petits calculs très rapides dans ma tour d’étages pour t’aider à apprendre et inventer des histoires !',
    visualAnalogyTitle: 'Un super outil de calcul, pas un humain',
    visualPieces: ['⚡ Calculs rapides', '📚 Histoires', '❤️ Cœur humain = Toi !'],
    visualCaption: 'Lumi est ton assistant malin, jamais un vrai être vivant.',
  },
  {
    id: 'how-learn',
    question: 'Comment as-tu appris autant de mots ?',
    mood: 'story',
    answer:
      'En lisant des millions de livres ! À chaque phrase, je cachais le dernier mot et j’essayais de le deviner. Quand je me trompais, on réglait un petit bouton dans ma tour pour faire mieux la fois suivante !',
    visualAnalogyTitle: 'S’entraîner = Essayer, se tromper, s’améliorer',
    visualPieces: ['📖 Lire', '🎯 Deviner', '🔧 Ajuster'],
    visualCaption: 'Ton cerveau apprend aussi très bien grâce aux essais et aux erreurs !',
  },
];

export interface LumiInteractiveStory {
  id: string;
  title: string;
  icon: string;
  intro: string;
  steps: {
    prompt: string;
    choices: {
      word: string;
      emoji: string;
      continuation: string;
      mood: LumiMood;
    }[];
  }[];
  endingNote: string;
}

export const LUMI_STORIES: LumiInteractiveStory[] = [
  {
    id: 'dragon-strawberries',
    title: 'Le Dragon et les Fraises',
    icon: '🐉',
    intro: 'Il était une fois un tout petit dragon vert qui vivait dans un jardin secret.',
    steps: [
      {
        prompt: 'Un matin, le dragon a très faim. Choisis le mot suivant :',
        choices: [
          {
            word: 'fraises',
            emoji: '🍓',
            continuation: 'Il cueille un grand panier de fraises sucrées !',
            mood: 'happy',
          },
          {
            word: 'nuages',
            emoji: '☁️',
            continuation: 'Il croque dans un gros nuage tout mou qui a le goût de barbe à papa !',
            mood: 'celebrating',
          },
          {
            word: 'étoiles',
            emoji: '⭐',
            continuation: 'Il attrape trois petites étoiles dorées qui chatouillent son nez !',
            mood: 'curious',
          },
        ],
      },
      {
        prompt: 'Soudain, son ami Lumi arrive avec un cadeau. Que lui offre-t-il ?',
        choices: [
          {
            word: 'une guitare',
            emoji: '🎸',
            continuation: 'Ensemble, ils jouent une chanson si joyeuse que toutes les fleurs dansent !',
            mood: 'celebrating',
          },
          {
            word: 'une fusée',
            emoji: '🚀',
            continuation: 'Ils décollent faire un pique-nique sur la lune avant le goûter !',
            mood: 'story',
          },
        ],
      },
    ],
    endingNote:
      'Tu viens de jouer au LLM ! À chaque étape, tu as choisi la prochaine perle-mot pour fabriquer l’histoire.',
  },
  {
    id: 'cat-detective',
    title: 'Le Chat Détective',
    icon: '🐱',
    intro: 'Dans l’atelier, quelqu’un a caché la clé en or de la tour aux perles !',
    steps: [
      {
        prompt: 'Le chat détective allume sa lampe magique et regarde sous...',
        choices: [
          {
            word: 'le coussin',
            emoji: '🛋️',
            continuation: 'Sous le coussin rouge, il trouve une petite plume brillante !',
            mood: 'curious',
          },
          {
            word: 'le chapeau',
            emoji: '🎩',
            continuation: 'Sous le grand chapeau, un oiseau mécanique lui fait un clin d’œil !',
            mood: 'happy',
          },
        ],
      },
      {
        prompt: 'La lampe éclaire enfin le secret ! La clé était accrochée à...',
        choices: [
          {
            word: 'un ballon',
            emoji: '🎈',
            continuation: 'Le chat saute doucement, attrape la ficelle du ballon et rapporte la clé !',
            mood: 'celebrating',
          },
          {
            word: 'la lune',
            emoji: '🌙',
            continuation: 'Grâce au télescope de Lumi, ils font glisser la clé sur un rayon d’or !',
            mood: 'story',
          },
        ],
      },
    ],
    endingNote:
      'Bravo ! Comme la Lampe de l’Attention, le chat détective a relié les indices pour comprendre le mystère !',
  },
];

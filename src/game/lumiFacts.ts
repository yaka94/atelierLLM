import type { AgeMode, RobotEmotion, StationId } from './types';

export interface LumiFact {
  id: string;
  tag: string;
  stationId?: StationId;
  emotion: RobotEmotion;
  text: string;
}

export const LUMI_FACTS_KID: LumiFact[] = [
  {
    id: 'kid-tokens-puzzle',
    tag: 'Le saviez-vous ? · Tokens',
    stationId: 'tokens',
    emotion: 'idea',
    text: 'Une IA ne lit pas lettre par lettre comme toi ! Elle découpe les mots en petits morceaux de puzzle appelés « tokens », puis les transforme en numéros.',
  },
  {
    id: 'kid-tokens-strawberry',
    tag: 'Secret rigolo · Fraise',
    stationId: 'tokens',
    emotion: 'surprised',
    text: 'Savais-tu que même des IA géantes se trompent parfois pour compter les lettres « r » dans un mot ? C’est parce qu’elles voient des morceaux entiers, pas chaque lettre séparée !',
  },
  {
    id: 'kid-attention-pronouns',
    tag: 'Le saviez-vous ? · Attention',
    stationId: 'attention',
    emotion: 'thinking',
    text: 'Dans « Le chat poursuit la souris car elle court vite », l’IA allume un fil lumineux invisible entre « elle » et « souris » pour savoir de qui on parle !',
  },
  {
    id: 'kid-attention-avocat',
    tag: 'Double sens · Contexte',
    stationId: 'attention',
    emotion: 'curious',
    text: 'Le mot « avocat » peut être un fruit vert ou un métier ! Grâce à l’attention, l’IA regarde les mots voisins (« salade » ou « tribunal ») pour deviner le bon sens.',
  },
  {
    id: 'kid-layers-tower',
    tag: 'Le saviez-vous ? · Couches',
    stationId: 'layers',
    emotion: 'idea',
    text: 'Un grand modèle d’IA ressemble à un immeuble géant de 80 à 120 étages ! En bas il reconnaît les mots simples, et tout en haut il comprend l’humour et les histoires.',
  },
  {
    id: 'kid-layers-experts',
    tag: 'Équipe d’experts',
    stationId: 'layers',
    emotion: 'happy',
    text: 'Certaines IA modernes sont comme une école pleine de professeurs : pour une question de maths, elles ne réveillent que les experts en calcul, ce qui économise beaucoup d’énergie !',
  },
  {
    id: 'kid-omni-senses',
    tag: 'Le saviez-vous ? · Images',
    stationId: 'omni',
    emotion: 'surprised',
    text: 'Pour regarder une photo de chat, une IA découpe l’image en petits carrés comme un damier et lit chaque carré presque de la même façon qu’un mot !',
  },
  {
    id: 'kid-omni-sound',
    tag: 'Son & Voix',
    stationId: 'omni',
    emotion: 'happy',
    text: 'Les modèles « Omni » transforment les sons de ta voix en petites vagues numériques : ils peuvent ainsi entendre si tu es joyeux ou surpris !',
  },
  {
    id: 'kid-prediction-next',
    tag: 'Le saviez-vous ? · Mot suivant',
    stationId: 'prediction',
    emotion: 'idea',
    text: 'Quand une IA t’écrit une histoire, elle n’a pas tout prévu à l’avance : elle devine un seul petit morceau de mot à la fois, très très vite !',
  },
  {
    id: 'kid-prediction-dream',
    tag: 'Imagination vs Réalité',
    stationId: 'prediction',
    emotion: 'curious',
    text: 'Si on monte trop sa « température » de créativité, l’IA peut inventer des faits rigolos mais faux : les chercheurs appellent ça une hallucination.',
  },
  {
    id: 'kid-training-books',
    tag: 'Le saviez-vous ? · Apprentissage',
    stationId: 'training',
    emotion: 'surprised',
    text: 'Pour apprendre à parler, une grande IA lit l’équivalent de millions de livres — bien plus que tout ce qu’un humain pourrait lire en mille vies !',
  },
  {
    id: 'kid-training-compass',
    tag: 'Politesse & Sécurité',
    stationId: 'training',
    emotion: 'celebrating',
    text: 'Après avoir lu plein de textes, des humains donnent des étoiles aux réponses utiles et gentilles : c’est comme ça que l’IA apprend à bien aider.',
  },
  {
    id: 'kid-rag-backpack',
    tag: 'Le saviez-vous ? · Mémoire',
    stationId: 'context_rag',
    emotion: 'thinking',
    text: 'Une IA n’a pas une mémoire infinie : sa conversation ressemble à un sac à dos. Quand il est plein, elle a besoin d’ouvrir une bibliothèque (le RAG) pour vérifier ses infos !',
  },
  {
    id: 'kid-reasoning-scratchpad',
    tag: 'Le saviez-vous ? · Brouillon',
    stationId: 'reasoning',
    emotion: 'idea',
    text: 'Tout comme toi en maths, une IA réussit beaucoup mieux les énigmes difficiles quand on la laisse écrire ses étapes sur un carnet de brouillon avant de répondre !',
  },
];

export const LUMI_FACTS_ADULT: LumiFact[] = [
  {
    id: 'adult-tokens-strawberry',
    tag: 'Fait LLM · Pourquoi « strawberry » piège l’IA',
    stationId: 'tokens',
    emotion: 'surprised',
    text: 'Un LLM ne voit pas les caractères individuels mais des tokens BPE (« straw » + « berry »). Sans décomposition explicite, compter les « r » revient à deviner l’orthographe interne d’un identifiant numérique.',
  },
  {
    id: 'adult-tokens-multilingual',
    tag: 'Fait LLM · Coût des langues',
    stationId: 'tokens',
    emotion: 'curious',
    text: 'Un texte en français consomme environ 20 à 35 % de tokens de plus que son équivalent anglais (accents, apostrophes), ce qui influence directement la latence et le coût de génération.',
  },
  {
    id: 'adult-attention-2017',
    tag: 'Histoire · 2017',
    stationId: 'attention',
    emotion: 'idea',
    text: 'L’article fondateur « Attention Is All You Need » (2017) a été conçu à l’origine pour la traduction automatique — avant de devenir l’architecture universelle de presque tous les LLM modernes.',
  },
  {
    id: 'adult-attention-geometry',
    tag: 'Fait LLM · Géométrie du sens',
    stationId: 'attention',
    emotion: 'thinking',
    text: 'Dans l’espace des embeddings (souvent 4 096 à 12 288 dimensions), les relations sémantiques deviennent des vecteurs : « Roi − Homme + Femme » pointe très près de « Reine ».',
  },
  {
    id: 'adult-layers-moe',
    tag: 'Architecture · Mixture of Experts',
    stationId: 'layers',
    emotion: 'idea',
    text: 'Dans un modèle MoE (Mixture of Experts), un modèle de plusieurs centaines de milliards de paramètres n’active souvent que 10 à 20 % de ses neurones par token — divisant drastiquement le coût de calcul.',
  },
  {
    id: 'adult-layers-hybrid',
    tag: 'Architecture · Modèles hybrides',
    stationId: 'layers',
    emotion: 'curious',
    text: 'L’attention classique coûte O(N²) en longueur de texte. Les architectures hybrides (LFM, Mamba, convolutions courtes) combinent mémoire linéaire O(N) et quelques couches d’attention ciblées.',
  },
  {
    id: 'adult-omni-vit',
    tag: 'Multimodal · Patchs visuels',
    stationId: 'omni',
    emotion: 'surprised',
    text: 'Un Vision Transformer (ViT) découpe une image en grille de patchs (ex. 16×16 pixels) puis les projette dans le même espace vectoriel que les mots : pour le modèle, une photo est une phrase visuelle.',
  },
  {
    id: 'adult-omni-native',
    tag: 'Multimodal · Natif vs Assemblé',
    stationId: 'omni',
    emotion: 'thinking',
    text: 'Les anciens assistants transcrivaient d’abord l’audio en texte (perdant ton et émotions). Les modèles Omni natifs traitent directement les tokens audio, préservant l’intonation et réduisant la latence.',
  },
  {
    id: 'adult-prediction-hallucination',
    tag: 'Fait LLM · Pourquoi une IA hallucine',
    stationId: 'prediction',
    emotion: 'curious',
    text: 'Un LLM n’interroge pas une base de faits : il échantillonne le prochain token le plus vraisemblable statistiquement. Une phrase fausse mais fluide peut donc avoir une probabilité très élevée.',
  },
  {
    id: 'adult-prediction-temp',
    tag: 'Fait LLM · Température & Top-p',
    stationId: 'prediction',
    emotion: 'idea',
    text: 'À température 0, le modèle choisit toujours le token le plus probable (idéal pour du code ou de l’extraction). Monter la température aplatit la courbe Softmax et libère des associations plus créatives.',
  },
  {
    id: 'adult-training-chinchilla',
    tag: 'Fait LLM · Échelle d’entraînement',
    stationId: 'training',
    emotion: 'surprised',
    text: 'Les grands LLM actuels sont pré-entraînés sur plus de 10 000 milliards de tokens — l’équivalent de dizaines de millions de livres — avant le fine-tuning (SFT) et l’alignement par préférences (RLHF / DPO).',
  },
  {
    id: 'adult-training-frozen',
    tag: 'Idée reçue · Mémoire figée',
    stationId: 'training',
    emotion: 'thinking',
    text: 'Une fois entraîné, les poids d’un LLM sont figés : il n’apprend pas en temps réel de vos conversations. Ce qui ressemble à de la mémoire vient uniquement du texte réinjecté dans sa fenêtre de contexte.',
  },
  {
    id: 'adult-rag-middle',
    tag: 'Fait LLM · Lost in the Middle',
    stationId: 'context_rag',
    emotion: 'curious',
    text: 'Même avec une fenêtre de 100 000+ tokens, les LLM retiennent mieux le tout début et la toute fin d’un long document que le milieu : c’est le phénomène documenté « Lost in the Middle ».',
  },
  {
    id: 'adult-reasoning-ttc',
    tag: 'Fait LLM · Test-Time Compute',
    stationId: 'reasoning',
    emotion: 'celebrating',
    text: 'Générer une chaîne de pensée (Chain-of-Thought) offre littéralement au modèle davantage de cycles de calcul par question : chaque token de brouillon sert de mémoire de travail pour l’étape suivante.',
  },
];

export function getFactsForContext(ageMode: AgeMode, activeStation: StationId | null): LumiFact[] {
  const bank = ageMode === 'kid' ? LUMI_FACTS_KID : LUMI_FACTS_ADULT;
  if (!activeStation) return bank;
  const matching = bank.filter((fact) => fact.stationId === activeStation);
  const rest = bank.filter((fact) => fact.stationId !== activeStation);
  return [...matching, ...rest];
}

export function getNextFactIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

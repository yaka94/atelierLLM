import type {
  AdaptiveQuizQuestion,
  AdaptiveQuizState,
  AgeMode,
  QuizDifficulty,
} from './types';

export const ADAPTIVE_QUIZ_BANK: AdaptiveQuizQuestion[] = [
  // ===================== MODE ENFANT (5+ ans) =====================
  // Niveau 1 : Découverte
  {
    id: 'kid-1-tokens',
    mode: 'kid',
    difficulty: 1,
    topic: 'tokens',
    prompt: 'Comment Lumi le robot lit-il une longue phrase ?',
    visualCue: 'beads',
    options: [
      { id: 'a', label: 'Il la découpe en perles de mots', visualIcon: 'beads' },
      { id: 'b', label: 'Il mange le livre entier', visualIcon: 'book' },
      { id: 'c', label: 'Il ferme les yeux et devine au hasard', visualIcon: 'wheel' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Bravo ! Pour un robot, chaque morceau de mot devient une jolie perle appelée un token.',
    explanationError: 'Presque ! Lumi découpe d’abord la phrase en petites perles (les tokens) pour pouvoir la compter et la comprendre.',
    neuroscienceTip: 'Analogie concrète : relier un concept abstrait (token) à un objet familier (perle).',
  },
  {
    id: 'kid-1-omni',
    mode: 'kid',
    difficulty: 1,
    topic: 'omni',
    prompt: 'Pour voir un dessin de chat, que fait le robot Omni ?',
    visualCue: 'cat',
    options: [
      { id: 'a', label: 'Il découpe l’image en petits carrés', visualIcon: 'puzzle' },
      { id: 'b', label: 'Il écoute la musique seulement', visualIcon: 'ear' },
      { id: 'c', label: 'Il éteint la lumière', visualIcon: 'flashlight' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Oui ! Ses yeux découpent l’image comme un puzzle de petits carrés pour tout reconnaître.',
    explanationError: 'Regarde bien : pour voir une image, le robot la découpe en petits carrés de puzzle, appelés patchs !',
    neuroscienceTip: 'Double codage : associer l’image du puzzle au fonctionnement de la vision artificielle.',
  },
  {
    id: 'kid-1-pred',
    mode: 'kid',
    difficulty: 1,
    topic: 'prediction',
    prompt: '« Le petit chat boit son bol de... » Quel mot a le plus de chances de gagner sur la roue ?',
    visualCue: 'wheel',
    options: [
      { id: 'a', label: 'lait', visualIcon: 'spark' },
      { id: 'b', label: 'parapluie', visualIcon: 'puzzle' },
      { id: 'c', label: 'camion', visualIcon: 'tower' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Super ! « lait » est le mot le plus probable après « Le petit chat boit son bol de... ».',
    explanationError: 'Pense à ce que boit un petit chat : « lait » revient très souvent dans les histoires, donc sa part sur la roue est énorme !',
    neuroscienceTip: 'Prédiction active : le cerveau mémorise mieux lorsqu’il anticipe la suite.',
  },
  // Niveau 2 : Explorateur
  {
    id: 'kid-2-attention',
    mode: 'kid',
    difficulty: 2,
    topic: 'attention',
    prompt: '« Le robot tient la pomme car elle est rouge. » Sur quel mot brille la lampe magique pour comprendre « elle » ?',
    visualCue: 'flashlight',
    options: [
      { id: 'a', label: 'la pomme', visualIcon: 'flashlight' },
      { id: 'b', label: 'le robot', visualIcon: 'tower' },
      { id: 'c', label: 'tient', visualIcon: 'scissors' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Génial ! La lampe de l’Attention éclaire « la pomme » parce que c’est la pomme qui est rouge.',
    explanationError: 'Regarde l’indice « rouge » et « elle » : c’est « la pomme » qui est éclairée par la lampe magique !',
    neuroscienceTip: 'Attention sélective : l’enfant expérimente lui-même le lien entre deux mots éloignés.',
  },
  {
    id: 'kid-2-temp',
    mode: 'kid',
    difficulty: 2,
    topic: 'prediction',
    prompt: 'Si tu tournes le thermomètre de l’imagination tout en haut (très chaud), que fait Lumi ?',
    visualCue: 'wheel',
    options: [
      { id: 'a', label: 'Il invente des mots très rigolos et surprenants', visualIcon: 'thermometer' },
      { id: 'b', label: 'Il s’endort immédiatement', visualIcon: 'book' },
      { id: 'c', label: 'Il répète toujours le même mot', visualIcon: 'beads' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exactement ! Quand le thermomètre est chaud, Lumi ose choisir des mots plus fous et créatifs.',
    explanationError: 'Quand il fait froid, Lumi reste très sage. Quand il fait chaud, son imagination s’envole avec des mots surprenants !',
    neuroscienceTip: 'Apprentissage par contraste : comparer froid/sage et chaud/créatif ancre la notion de température.',
  },
  {
    id: 'kid-2-layers',
    mode: 'kid',
    difficulty: 2,
    topic: 'layers',
    prompt: 'Dans la Tour des Étages, pourquoi les perles montent-elles plusieurs étages ?',
    visualCue: 'tower',
    options: [
      { id: 'a', label: 'Pour devenir plus malignes à chaque étage', visualIcon: 'tower' },
      { id: 'b', label: 'Pour faire la sieste en haut', visualIcon: 'book' },
      { id: 'c', label: 'Pour effacer toute la phrase', visualIcon: 'scissors' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Bravo ! Chaque étage ajoute un peu plus de compréhension avant de choisir le mot suivant.',
    explanationError: 'À chaque étage de la tour, l’idée se précise un peu plus, comme un dessin qu’on complète étape par étape !',
    neuroscienceTip: 'Échafaudage visuel : comprendre la profondeur par l’image d’étages empilés.',
  },
  // Niveau 3 : Maître Junior
  {
    id: 'kid-3-lfm',
    mode: 'kid',
    difficulty: 3,
    topic: 'layers',
    prompt: 'Quelle tour magique est la plus légère et rapide pour fonctionner dans un tout petit robot de poche ?',
    visualCue: 'tower',
    options: [
      { id: 'a', label: 'La Tour Liquide (LFM) avec ses toboggans rapides', visualIcon: 'spark' },
      { id: 'b', label: 'Une tour géante qui allume toutes les lampes à la fois', visualIcon: 'tower' },
      { id: 'c', label: 'Une tour sans aucun étage', visualIcon: 'scissors' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Champion ! La Tour Liquide (LFM) garde une mémoire légère comme l’eau et va super vite !',
    explanationError: 'Indice : la Tour Liquide (LFM) utilise des toboggans fluides très légers pour tenir même dans un petit robot.',
    neuroscienceTip: 'Transfert de connaissance : appliquer une métaphore à un choix concret.',
  },
  {
    id: 'kid-3-omni',
    mode: 'kid',
    difficulty: 3,
    topic: 'omni',
    prompt: 'Pourquoi appelle-t-on le Prisme magique « Omni » ?',
    visualCue: 'prism',
    options: [
      { id: 'a', label: 'Il mélange texte, image et voix en même temps', visualIcon: 'prism' },
      { id: 'b', label: 'Il ne lit que les chiffres', visualIcon: 'beads' },
      { id: 'c', label: 'Il sert uniquement à dessiner des ronds', visualIcon: 'eye' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Incroyable ! « Omni » veut dire « tout » : yeux, oreilles et mots parlent ensemble dans le même prisme.',
    explanationError: '« Omni » veut dire « tout » ! Le prisme Omni réunit les images, les sons et les mots en un seul rayon.',
    neuroscienceTip: 'Consolidation sémantique : relier l’étymologie simple (« tout ») à la démonstration visuelle.',
  },
  {
    id: 'kid-3-hallucination',
    mode: 'kid',
    difficulty: 3,
    topic: 'prediction',
    prompt: 'Pourquoi un robot LLM peut-il parfois inventer une histoire fausse (une hallucination) ?',
    visualCue: 'robot',
    options: [
      { id: 'a', label: 'Parce qu’il choisit le mot probable, pas toujours la vérité', visualIcon: 'wheel' },
      { id: 'b', label: 'Parce qu’il fait exprès de faire une blague', visualIcon: 'spark' },
      { id: 'c', label: 'Parce que son écran est sale', visualIcon: 'eye' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Tu es un vrai savant ! Le robot devine le mot qui sonne le mieux, donc il faut toujours vérifier ses réponses.',
    explanationError: 'Souviens-toi de la roue : le robot choisit des mots qui vont bien ensemble, même s’il ne sait pas toujours si c’est vrai !',
    neuroscienceTip: 'Esprit critique dès 5 ans : comprendre que probabilité ≠ vérité.',
  },

  // ===================== MODE ADULTE (Technique) =====================
  // Niveau 1 : Fondamentaux
  {
    id: 'adult-1-tokens',
    mode: 'adult',
    difficulty: 1,
    topic: 'tokens',
    prompt: 'Pourquoi un LLM peine-t-il parfois à compter le nombre exact de lettres « r » dans un mot ?',
    visualCue: 'beads',
    options: [
      { id: 'a', label: 'Il manipule des tokens BPE (sous-mots/IDs), pas des caractères isolés' },
      { id: 'b', label: 'La lettre « r » est retirée lors de la normalisation RMSNorm' },
      { id: 'c', label: 'La fonction Softmax supprime les consonnes doublées' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exact ! Le tokenizer BPE fusionne les séquences fréquentes en un seul ID entier : le modèle « voit » un bloc entier, pas l’orthographe lettre par lettre.',
    explanationError: 'En amont du réseau, le texte est segmenté en tokens BPE (souvent des mots ou sous-mots entiers), ce qui masque la granularité caractère.',
    neuroscienceTip: 'Prédiction d’erreur : expliquer un paradoxe célèbre crée une trace mnésique durable.',
  },
  {
    id: 'adult-1-attention',
    mode: 'adult',
    difficulty: 1,
    topic: 'attention',
    prompt: 'Dans la formule Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V, quel est le rôle du produit scalaire QKᵀ ?',
    visualCue: 'flashlight',
    options: [
      { id: 'a', label: 'Mesurer la pertinence entre le token courant (Query) et chaque autre token (Key)' },
      { id: 'b', label: 'Découper une image RGB en patchs 16×16 pixels' },
      { id: 'c', label: 'Réduire le nombre de couches du modèle pendant l’inférence' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Parfait ! QKᵀ mesure la compatibilité entre la requête (Query) et les clés (Keys) avant normalisation Softmax pour pondérer les valeurs (Values).',
    explanationError: 'Le produit QKᵀ calcule les scores d’affinité entre chaque requête Q et les clés K ; √d_k évite la saturation du Softmax.',
    neuroscienceTip: 'Double codage : relier l’équation QKᵀ aux arcs lumineux manipulés dans la Station 2.',
  },
  {
    id: 'adult-1-softmax',
    mode: 'adult',
    difficulty: 1,
    topic: 'prediction',
    prompt: 'Quel est l’effet mathématique d’une Température T très basse (ex. T = 0,1) dans Softmax(z_i / T) ?',
    visualCue: 'wheel',
    options: [
      { id: 'a', label: 'Elle accentue les écarts de logits et concentre presque toute la probabilité sur le token #1' },
      { id: 'b', label: 'Elle rend tous les mots du vocabulaire strictement équiprobables' },
      { id: 'c', label: 'Elle augmente la taille du KV-Cache de façon quadratique' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exact ! Diviser z_i par un petit T amplifie l’écart relatif entre le meilleur logit et les autres, faisant chuter l’entropie de Shannon.',
    explanationError: 'Quand T → 0, z_i / T explose les différences de logits : la distribution devient quasi déterministe (argmax).',
    neuroscienceTip: 'Vérification active : relier un paramètre numérique (T) à une forme de distribution.',
  },
  // Niveau 2 : Intermédiaire
  {
    id: 'adult-2-moe',
    mode: 'adult',
    difficulty: 2,
    topic: 'layers',
    prompt: 'Quel est l’avantage clé d’une architecture Mixture of Experts (MoE) par rapport à un Transformer dense de même taille totale ?',
    visualCue: 'tower',
    options: [
      { id: 'a', label: 'Un routeur n’active qu’une fraction des experts (ex. Top-2/8) par token, réduisant les FLOPs d’inférence' },
      { id: 'b', label: 'Elle supprime totalement le besoin de tokenisation en entrée' },
      { id: 'c', label: 'Elle remplace le Softmax final par une convolution 2D' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Très juste ! Un MoE découple la capacité de connaissance (paramètres totaux) du coût de calcul par token (paramètres actifs).',
    explanationError: 'Dans un MoE, seul un petit sous-ensemble d’experts FFN est activé pour chaque token par un réseau routeur (gating).',
    neuroscienceTip: 'Comparaison structurée : opposer activation dense (100 %) et activation parcimonieuse (~25 %).',
  },
  {
    id: 'adult-2-vision',
    mode: 'adult',
    difficulty: 2,
    topic: 'omni',
    prompt: 'Comment un Vision-Language Model (VLM) classique intègre-t-il une image dans un Transformer de langage ?',
    visualCue: 'prism',
    options: [
      { id: 'a', label: 'Un Vision Transformer (ViT) découpe l’image en patchs encodés puis projetés dans l’espace d’embedding texte' },
      { id: 'b', label: 'Il convertit chaque pixel en code hexadécimal lu comme une phrase' },
      { id: 'c', label: 'Il applique uniquement un filtre audio spectrogramme sur les pixels' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exact ! Les patchs visuels (ex. 14×14 ou 16×16) sont linéairement projetés en vecteurs compatibles avec les tokens textuels.',
    explanationError: 'Un VLM découpe l’image en patchs via un ViT, puis un projecteur aligne ces tokens visuels dans l’espace latent du LLM.',
    neuroscienceTip: 'Ancrage visuel : la grille 4×4 manipulée en Station 4 illustre directement cette patchification.',
  },
  {
    id: 'adult-2-topp',
    mode: 'adult',
    difficulty: 2,
    topic: 'prediction',
    prompt: 'Que garantit le Nucleus Sampling (Top-p = 0,85) lors du décodage autorégressif ?',
    visualCue: 'wheel',
    options: [
      { id: 'a', label: 'Il ne conserve que le plus petit ensemble de tokens dont la masse de probabilité cumulée atteint 85 %' },
      { id: 'b', label: 'Il force le modèle à toujours générer exactement 85 tokens' },
      { id: 'c', label: 'Il garantit à 85 % l’absence d’hallucinations factuelles' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Parfait ! Top-p adapte dynamiquement la taille du vivier de candidats selon la confiance du modèle, coupant la longue traîne incohérente.',
    explanationError: 'Top-p tronque la distribution dès que la somme cumulée des meilleurs tokens dépasse le seuil p, puis renormalise.',
    neuroscienceTip: 'Précision conceptuelle : distinguer diversité contrôlée (Top-p) et véracité factuelle.',
  },
  // Niveau 3 : Avancé (LFM3, Hybrides, Omni natif)
  {
    id: 'adult-3-lfm3',
    mode: 'adult',
    difficulty: 3,
    topic: 'layers',
    prompt: 'Pourquoi une architecture hybride de type Liquid Foundation Model (LFM / LFM3) intercale-t-elle des couches liquides/SSM O(N) avec quelques couches d’Attention GQA ?',
    visualCue: 'tower',
    options: [
      { id: 'a', label: 'Pour combiner mémoire fluide à coût linéaire O(N) et rappel précis longue distance sans exploser le KV-Cache' },
      { id: 'b', label: 'Parce que les couches liquides ne peuvent traiter que des nombres entiers négatifs' },
      { id: 'c', label: 'Uniquement pour augmenter la taille du fichier modèle sur disque' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Magistral ! Les opérateurs liquides adaptatifs gèrent efficacement le flux séquentiel en O(N) et état fixe, tandis que les rares couches d’attention assurent le rappel exact.',
    explanationError: 'L’hybridation LFM marie l’efficacité mémoire O(N) des blocs liquides/convolutifs adaptatifs avec la précision de rappel de quelques couches d’attention.',
    neuroscienceTip: 'Synthèse architecturale : comprendre le compromis fondamental mémoire vs rappel exact.',
  },
  {
    id: 'adult-3-omni-native',
    mode: 'adult',
    difficulty: 3,
    topic: 'omni',
    prompt: 'En quoi un modèle Omni natif diffère-t-il d’un pipeline classique « ASR (voix→texte) + LLM + TTS (texte→voix) » ?',
    visualCue: 'prism',
    options: [
      { id: 'a', label: 'Il traite tokens audio, visuels et textuels dans un même espace latent, préservant intonation, latence faible et indices visuels' },
      { id: 'b', label: 'Il supprime la couche d’attention au profit d’une base de données SQL' },
      { id: 'c', label: 'Il fonctionne uniquement hors ligne sans poids neuronaux' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Brillant ! En évitant la perte d’information d’une transcription intermédiaire, un modèle Omni capte le sarcasme, l’émotion vocale et les gestes visuels avec une latence réduite.',
    explanationError: 'Un pipeline cascadé perd le ton de voix lors de la transcription texte et ajoute 3 latences ; un modèle Omni fusionne nativement toutes les modalités.',
    neuroscienceTip: 'Transfert expert : relier latence, perte d’information et espace latent partagé.',
  },
  {
    id: 'kid-2-training',
    mode: 'kid',
    difficulty: 2,
    topic: 'training',
    prompt: 'Comment Lumi apprend-il à devenir un robot poli et utile après avoir lu plein de livres ?',
    visualCue: 'book',
    options: [
      { id: 'a', label: 'Des humains lui donnent des étoiles quand il répond bien', visualIcon: 'spark' },
      { id: 'b', label: 'On le laisse tout seul dans le noir', visualIcon: 'flashlight' },
      { id: 'c', label: 'Il arrache les pages du dictionnaire', visualIcon: 'scissors' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Bravo ! Grâce aux étoiles et aux conseils humains (l’alignement), Lumi apprend à répondre clairement et gentiment.',
    explanationError: 'Après la lecture des livres, des professeurs humains guident Lumi avec des exemples et des étoiles : c’est l’alignement !',
    neuroscienceTip: 'Renforcement positif : le cerveau retient vite les règles apprises par retour bienveillant.',
  },
  {
    id: 'kid-2-rag',
    mode: 'kid',
    difficulty: 2,
    topic: 'context_rag',
    prompt: 'Si le sac à dos mémoire de Lumi est trop petit ou s’il veut connaître la météo d’aujourd’hui, que doit-il faire ?',
    visualCue: 'book',
    options: [
      { id: 'a', label: 'Ouvrir un livre-bibliothèque (RAG) ou une loupe-outil', visualIcon: 'book' },
      { id: 'b', label: 'Inventer la météo au hasard', visualIcon: 'wheel' },
      { id: 'c', label: 'Éteindre son antenne dorée', visualIcon: 'flashlight' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Super malin ! En utilisant une bibliothèque (RAG) ou une calculatrice-outil, Lumi trouve de vraies réponses à jour.',
    explanationError: 'Sans outil ni bibliothèque externe (RAG), le robot ne connaît pas les nouvelles d’aujourd’hui !',
    neuroscienceTip: 'Mémoire externe : même les humains utilisent des carnets et des bibliothèques pour soulager leur mémoire.',
  },
  {
    id: 'kid-3-reasoning',
    mode: 'kid',
    difficulty: 3,
    topic: 'reasoning',
    prompt: 'Pourquoi Lumi réussit-il beaucoup mieux une énigme de maths quand il utilise son Carnet de Brouillon ?',
    visualCue: 'robot',
    options: [
      { id: 'a', label: 'Parce qu’il découpe le problème étape par étape au lieu de répondre trop vite', visualIcon: 'spark' },
      { id: 'b', label: 'Parce que le carnet change la couleur de ses yeux', visualIcon: 'eye' },
      { id: 'c', label: 'Parce qu’il saute la moitié de la question', visualIcon: 'scissors' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Champion de logique ! Écrire les étapes dans le brouillon (Chain-of-Thought) aide Lumi à réfléchir et se vérifier.',
    explanationError: 'Quand on répond trop vite sans brouillon, on se trompe facilement. Découper en petites étapes évite les pièges !',
    neuroscienceTip: 'Métacognition : ralentir et écrire ses étapes réduit les erreurs impulsives.',
  },
  {
    id: 'adult-3-kvcache',
    mode: 'adult',
    difficulty: 3,
    topic: 'attention',
    prompt: 'Lorsqu’on passe d’un contexte de 4k à 128k tokens dans un Transformer dense standard, quel goulot d’étranglement explose en premier en inférence ?',
    visualCue: 'tower',
    options: [
      { id: 'a', label: 'L’empreinte mémoire du KV-Cache et la bande passante mémoire nécessaire à sa lecture à chaque token généré' },
      { id: 'b', label: 'La taille de la table de vocabulaire BPE' },
      { id: 'c', label: 'Le nombre de boutons dans l’interface utilisateur' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exact ! Chaque couche d’attention stocke ses tenseurs K et V pour tous les tokens précédents, rendant la bande passante mémoire critique — d’où l’essor de GQA et des hybrides LFM.',
    explanationError: 'La génération autorégressive relit le KV-Cache de chaque couche d’attention à chaque nouveau token : la mémoire et sa bande passante deviennent le goulot majeur.',
    neuroscienceTip: 'Lien causal : comprendre le problème matériel explique l’évolution moderne des architectures.',
  },
  {
    id: 'adult-2-training',
    mode: 'adult',
    difficulty: 2,
    topic: 'training',
    prompt: 'Quelle différence essentielle distingue le Pré-entraînement (Base Model) des étapes SFT + RLHF/DPO ?',
    visualCue: 'book',
    options: [
      { id: 'a', label: 'Le pré-entraînement apprend à compléter du texte brut ; SFT et RLHF alignent le modèle pour suivre des consignes avec discernement' },
      { id: 'b', label: 'Le pré-entraînement supprime les poids neuronaux tandis que RLHF ajoute des pixels' },
      { id: 'c', label: 'Il n’y a aucune différence, ce sont trois noms pour le tokenizer BPE' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Exact ! Un modèle brut ne sait que continuer un document ; le SFT lui enseigne le format dialogue et RLHF/DPO calibre préférences, sécurité et refus d’halluciner.',
    explanationError: 'Le pré-entraînement optimise la prédiction du token suivant sur un corpus massif ; SFT puis RLHF/DPO le transforment en véritable assistant aligné.',
    neuroscienceTip: 'Distinction de phases : séparer acquisition des connaissances et alignement comportemental.',
  },
  {
    id: 'adult-2-rag',
    mode: 'adult',
    difficulty: 2,
    topic: 'context_rag',
    prompt: 'Pourquoi associe-t-on le RAG (Retrieval-Augmented Generation) et le Tool Calling à un LLM en production ?',
    visualCue: 'book',
    options: [
      { id: 'a', label: 'Pour injecter des sources à jour dans le contexte et déléguer calculs exacts ou actions à des outils déterministes' },
      { id: 'b', label: 'Pour ré-entraîner tous les milliards de paramètres à chaque nouvelle question' },
      { id: 'c', label: 'Pour forcer la température Softmax à 2.0 en permanence' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Parfait ! Le RAG ancre les réponses sur des documents externes frais sans ré-entraînement, et les outils garantissent la fiabilité arithmétique ou API.',
    explanationError: 'Le RAG récupère des passages pertinents externes et le Tool Calling délègue les tâches déterministes (calcul, requête API) hors du réseau probabiliste.',
    neuroscienceTip: 'Architecture système : combiner mémoire paramétrique (poids) et mémoire non-paramétrique (RAG).',
  },
  {
    id: 'adult-3-reasoning',
    mode: 'adult',
    difficulty: 3,
    topic: 'reasoning',
    prompt: 'Pourquoi la génération de tokens de réflexion (Chain-of-Thought / Test-Time Compute) améliore-t-elle nettement la logique d’un LLM ?',
    visualCue: 'robot',
    options: [
      { id: 'a', label: 'Chaque token intermédiaire alloue du calcul supplémentaire et sert de mémoire de travail explicite relue par l’attention' },
      { id: 'b', label: 'Parce que le modèle télécharge automatiquement le corrigé sur Internet' },
      { id: 'c', label: 'Parce que les tokens de pensée réduisent le nombre de couches du Transformer à une seule' },
    ],
    correctOptionId: 'a',
    explanationSuccess: 'Brillant ! Un Transformer ayant une profondeur fixe par token, générer des étapes intermédiaires multiplie le budget de calcul effectif et permet l’auto-vérification.',
    explanationError: 'En externalisant les étapes intermédiaires dans la séquence, le modèle contourne sa profondeur fixe par token et peut relire et vérifier ses propres calculs.',
    neuroscienceTip: 'Test-Time Scaling : troquer du temps de calcul à l’inférence contre un gain majeur de fiabilité.',
  },
];

export function createAdaptiveQuiz(mode: AgeMode, totalQuestions: number = 5): AdaptiveQuizState {
  return {
    mode,
    currentDifficulty: 1,
    askedIds: [],
    answers: [],
    streak: 0,
    consecutiveErrors: 0,
    totalQuestions,
    completed: false,
  };
}

/**
 * Selects the next unanswered question closest to the user's current adaptive difficulty.
 */
export function selectNextQuestion(state: AdaptiveQuizState): AdaptiveQuizQuestion | null {
  if (state.completed || state.answers.length >= state.totalQuestions) {
    return null;
  }

  const pool = ADAPTIVE_QUIZ_BANK.filter(
    (q) => q.mode === state.mode && !state.askedIds.includes(q.id)
  );
  if (pool.length === 0) return null;

  // Prefer exact difficulty match first, then closest difficulty
  const exact = pool.filter((q) => q.difficulty === state.currentDifficulty);
  if (exact.length > 0) {
    return exact[0];
  }

  const sorted = [...pool].sort(
    (a, b) =>
      Math.abs(a.difficulty - state.currentDifficulty) -
      Math.abs(b.difficulty - state.currentDifficulty)
  );
  return sorted[0];
}

/**
 * Pure adaptive difficulty update:
 * - Correct answer: increments streak; promotes difficulty (1 -> 2 -> 3) immediately on streak >= 1 at level 1, or streak >= 2 at level 2.
 * - Incorrect answer: resets streak; drops difficulty by 1 if above level 1 to consolidate fundamentals.
 */
export function submitQuizAnswer(
  state: AdaptiveQuizState,
  question: AdaptiveQuizQuestion,
  selectedOptionId: string
): {
  nextState: AdaptiveQuizState;
  isCorrect: boolean;
  difficultyDelta: -1 | 0 | 1;
} {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const nextStreak = isCorrect ? state.streak + 1 : 0;
  const nextConsecutiveErrors = isCorrect ? 0 : state.consecutiveErrors + 1;

  let nextDifficulty: QuizDifficulty = state.currentDifficulty;
  let difficultyDelta: -1 | 0 | 1 = 0;

  if (isCorrect) {
    if (state.currentDifficulty === 1 && nextStreak >= 1) {
      nextDifficulty = 2;
      difficultyDelta = 1;
    } else if (state.currentDifficulty === 2 && nextStreak >= 2) {
      nextDifficulty = 3;
      difficultyDelta = 1;
    }
  } else {
    if (state.currentDifficulty > 1) {
      nextDifficulty = (state.currentDifficulty - 1) as QuizDifficulty;
      difficultyDelta = -1;
    }
  }

  const answers = [
    ...state.answers,
    {
      questionId: question.id,
      difficulty: question.difficulty,
      correct: isCorrect,
      topic: question.topic,
    },
  ];

  const askedIds = state.askedIds.includes(question.id)
    ? state.askedIds
    : [...state.askedIds, question.id];

  const completed = answers.length >= state.totalQuestions;

  return {
    nextState: {
      ...state,
      currentDifficulty: nextDifficulty,
      askedIds,
      answers,
      streak: nextStreak,
      consecutiveErrors: nextConsecutiveErrors,
      completed,
    },
    isCorrect,
    difficultyDelta,
  };
}

export function computeQuizSummary(state: AdaptiveQuizState): {
  correctCount: number;
  totalAnswered: number;
  accuracyPercent: number;
  highestDifficultyReached: QuizDifficulty;
  bonusPoints: number;
} {
  const totalAnswered = state.answers.length;
  const correctCount = state.answers.filter((a) => a.correct).length;
  const accuracyPercent =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  const highestDifficultyReached = state.answers.reduce<QuizDifficulty>(
    (max, a) => (a.difficulty > max ? a.difficulty : max),
    state.currentDifficulty
  );

  const bonusPoints = state.answers.reduce(
    (sum, a) => sum + (a.correct ? a.difficulty * 60 : 10),
    0
  );

  return {
    correctCount,
    totalAnswered,
    accuracyPercent,
    highestDifficultyReached,
    bonusPoints,
  };
}

# L’Atelier des LLM

> **Voyage interactif, illustré et 100 % navigable à la souris pour comprendre comment fonctionnent les grands modèles de langage (LLM) — sans aucun prérequis.**

L’Atelier des LLM est une application web statique (sans serveur ni clé API) conçue pour **deux publics aux scores séparés** :
- **Enfant (dès 5 ans)** : analogies ludiques (perles de mots, fils lumineux, sac à dos mémoire, carnet de brouillon), lecture vocale en français et histoires interactives avec **Lumi le robot**.
- **Adulte (Complet)** : vulgarisation progressive en clair, **Glossaire intégré** et simulateurs interactifs des vrais mécanismes internes des LLM modernes.

---

## Les 8 stations interactives

### Chapitre I · Comment l’IA lit, comprend et répond
1. **Découper le texte (Tokens & BPE)** — Visualisez comment une phrase est découpée en tokens numérotés et pourquoi les mots rares ou longs coûtent plusieurs sous-unités.
2. **Relier les mots (Mécanisme d’Attention)** — Allumez les arcs d’attention (`Q·K·V`) pour observer comment le modèle résout les pronoms et les mots à double sens (*avocat*, *elle*…).
3. **Les Couches : Transformer Dense, MoE & Hybride LFM3** — Comparez étage par étage la mémoire KV-cache, la vitesse et l’activation sélective des experts selon la longueur du contexte.
4. **Lire texte, images & sons (Omni-Vision)** — Sélectionnez des patchs visuels (ViT) et un flux audio pour comparer une chaîne cascadée (`ASR → LLM → TTS`) face à un modèle **Omni natif**.
5. **Choisir le mot suivant & Hallucinations** — Réglez la **température** et le **Top-p** pour observer en direct la courbe Softmax, la créativité et l’apparition des hallucinations.

### Chapitre II · Apprentissage, Mémoire & Raisonnement
6. **Comment une IA s’entraîne (Pré-entraînement, SFT & RLHF)** — Comparez les réponses d’un même modèle aux trois grandes étapes de sa formation.
7. **Mémoire, Sources & Outils (Fenêtre de contexte & RAG)** — Expérimentez la saturation de la fenêtre de contexte (*Lost in the Middle*), la recherche documentaire (**RAG**) et l’appel d’outils.
8. **Réfléchir étape par étape (Raisonnement & Chain-of-Thought)** — Comparez une réponse intuitive directe face à une décomposition sur brouillon interne avec auto-vérification.

### Et aussi
- **Grand Quiz Adaptatif** (3 niveaux de difficulté qui s’ajustent automatiquement aux réponses).
- **Lumi 3D · Faits IA** : robot compagnon Three.js rangé dans la barre du haut (pour ne jamais gêner la lecture), riche de **28 anecdotes réelles sur les LLM** (14 Enfant + 14 Adulte) avec lecture vocale.
- **Atelier de Lumi** : fables et vulgarisation douce.
- **Tableau des Succès** : 14 badges suivis indépendamment en mode Enfant et en mode Adulte (`localStorage`).

---

## Lancer en local

Prérequis : **Node.js 20+** (Node 22 LTS recommandé).

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Démarrer le serveur de développement (http://localhost:3000)
npm run dev

# Compiler la version statique de production (dossier dist/)
npm run build

# Lancer les tests unitaires du moteur LLM & quiz
npx tsx --test src/game/llmEngine.test.ts
```

---

## Déployer sur GitHub Pages

Le projet est déjà configuré pour **GitHub Pages** (`base: './'` dans `vite.config.ts` + workflow automatique dans `.github/workflows/deploy.yml`).

### Activation (une seule fois sur GitHub)
1. Ouvrez votre dépôt GitHub puis allez dans **Settings → Pages**.
2. Dans la section **Build and deployment → Source**, sélectionnez **GitHub Actions** (et non *Deploy from a branch*).
3. À chaque push sur la branche `main`, GitHub compile automatiquement le dossier `dist/` et publie le site en ligne.

---

## Stack technique
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **Three.js** (compagnon 3D Lumi avec rendu optimisé et gestion WebGL logicielle)
- **Web Audio API** & **Web Speech API** (effets sonores doux et lecture vocale française sans dépendances externes)
- **100 % statique** : aucune clé API, aucun backend requis.

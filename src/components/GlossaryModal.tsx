import { useState } from 'react';
import { playClick } from '../game/sound';
import type { StationId } from '../game/types';

export interface GlossaryEntry {
  term: string;
  plainFrench: string;
  technicalNote: string;
  stationId: StationId;
  stationOrder: number;
  category: 'bases' | 'architecture' | 'vie';
}

const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: 'Token (et découpage BPE)',
    plainFrench:
      'Un morceau de texte (un mot courant ou une syllabe) transformé en numéro pour que l’ordinateur puisse le calculer.',
    technicalNote: 'BPE (Byte Pair Encoding) fusionne les paires de caractères fréquentes en un vocabulaire fixe.',
    stationId: 'tokens',
    stationOrder: 1,
    category: 'bases',
  },
  {
    term: 'Embedding (vecteur de sens)',
    plainFrench:
      'Une série de coordonnées qui place les mots aux sens proches au même endroit sur une carte invisible.',
    technicalNote: 'Projection d’un ID de token vers un vecteur dense de haute dimension.',
    stationId: 'tokens',
    stationOrder: 1,
    category: 'bases',
  },
  {
    term: 'Attention (et Q · K · V)',
    plainFrench:
      'Le mécanisme qui permet à chaque mot de regarder les autres mots de la phrase pour comprendre le contexte (ex. à qui renvoie « elle »).',
    technicalNote: 'Chaque token émet une Requête (Q), une Clé (K) et une Valeur (V) pour pondérer ses voisins.',
    stationId: 'attention',
    stationOrder: 2,
    category: 'bases',
  },
  {
    term: 'Couches, MoE & Hybride LFM3',
    plainFrench:
      'Des étages successifs qui affinent le sens : certains modèles consultent tout partout (Transformer), d’autres activent des spécialistes (MoE) ou un résumé fluide rapide (LFM3).',
    technicalNote: 'Compromis entre mémoire quadratique O(N²) et couches liquides linéaires O(N).',
    stationId: 'layers',
    stationOrder: 3,
    category: 'architecture',
  },
  {
    term: 'Omni-Vision (Multimodalité)',
    plainFrench:
      'La capacité de lire à la fois du texte, des images (découpées en petites vignettes) et du son dans un seul cerveau commun.',
    technicalNote: 'Patchification ViT et espace latent unifié natif vs pipelines cascadés.',
    stationId: 'omni',
    stationOrder: 4,
    category: 'architecture',
  },
  {
    term: 'Softmax & Température',
    plainFrench:
      'La façon dont l’IA transforme ses préférences en pourcentages pour choisir le mot suivant : température basse = sage et précis, température haute = créatif.',
    technicalNote: 'Conversion des logits en distribution de probabilité (avec filtrage Top-p).',
    stationId: 'prediction',
    stationOrder: 5,
    category: 'bases',
  },
  {
    term: 'Hallucination',
    plainFrench:
      'Quand l’IA invente une réponse très bien écrite mais fausse, parce qu’elle prédit un texte vraisemblable plutôt que de vérifier un fait.',
    technicalNote: 'Écart entre vraisemblance statistique d’une séquence et exactitude factuelle.',
    stationId: 'prediction',
    stationOrder: 5,
    category: 'bases',
  },
  {
    term: 'Pré-entraînement, SFT & RLHF',
    plainFrench:
      'Les 3 étapes d’école du modèle : lire des milliards de textes, apprendre à dialoguer sur des exemples, puis s’aligner sur les préférences humaines.',
    technicalNote: 'Next-token prediction, Supervised Fine-Tuning et alignement RLHF / DPO.',
    stationId: 'training',
    stationOrder: 6,
    category: 'vie',
  },
  {
    term: 'Fenêtre de contexte',
    plainFrench:
      'La taille du « bureau de travail » de l’IA : tout ce qu’elle peut garder sous les yeux en même temps avant d’oublier le début.',
    technicalNote: 'Capacité maximale en tokens (KV-Cache) et effet « Lost in the Middle ».',
    stationId: 'context_rag',
    stationOrder: 7,
    category: 'vie',
  },
  {
    term: 'RAG (Recherche augmentée)',
    plainFrench:
      'Aller chercher un passage fiable dans vos documents ou sur le web avant de rédiger la réponse, comme ouvrir un manuel à la bonne page.',
    technicalNote: 'Retrieval-Augmented Generation par recherche sémantique vectorielle.',
    stationId: 'context_rag',
    stationOrder: 7,
    category: 'vie',
  },
  {
    term: 'Agent & Outils (Tool Calling)',
    plainFrench:
      'Donner au modèle le droit d’appeler une calculatrice, un calendrier ou une recherche plutôt que de tout faire de tête.',
    technicalNote: 'Appels structurés de fonctions externes intégrés dans la boucle de génération.',
    stationId: 'context_rag',
    stationOrder: 7,
    category: 'vie',
  },
  {
    term: 'Raisonnement étape par étape (CoT)',
    plainFrench:
      'Laisser l’IA écrire ses calculs intermédiaires dans un brouillon caché avant de donner sa réponse finale.',
    technicalNote: 'Chain-of-Thought et calcul au moment de la réponse (Test-Time Compute).',
    stationId: 'reasoning',
    stationOrder: 8,
    category: 'vie',
  },
];

interface GlossaryModalProps {
  onClose: () => void;
  onGoToStation: (id: StationId) => void;
}

export function GlossaryModal({ onClose, onGoToStation }: GlossaryModalProps) {
  const [filter, setFilter] = useState<'all' | 'bases' | 'architecture' | 'vie'>('all');

  const visibleEntries =
    filter === 'all'
      ? GLOSSARY_ENTRIES
      : GLOSSARY_ENTRIES.filter((entry) => entry.category === filter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C142B]/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Glossaire en clair des termes IA"
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#D8CEB9] bg-[#FBF7EF] text-[#172033] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4D9C4] bg-[#131D38] px-6 py-4 text-[#FBF7EF]">
          <div>
            <div className="text-xs font-semibold text-[#F6D58E]">
              Zéro jargon bloquant · Traduction immédiate
            </div>
            <h2 className="font-display text-xl font-extrabold">
              Décodeur des termes IA (En clair)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-bold text-[#FBF7EF] hover:bg-white/20 cursor-pointer whitespace-nowrap"
          >
            <span>Fermer</span>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E9DFCD] bg-[#F4EDE0] px-6 py-3">
          {[
            { id: 'all' as const, label: 'Tous (12)' },
            { id: 'bases' as const, label: 'Les bases essentielles' },
            { id: 'architecture' as const, label: 'Architectures & Vision' },
            { id: 'vie' as const, label: 'Apprentissage, Mémoire & Outils' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClick();
                setFilter(tab.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#131D38] text-[#F6C453]'
                  : 'bg-white text-[#46536E] border border-[#DDD3BE] hover:border-[#C97714]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {visibleEntries.map((entry) => (
              <div
                key={entry.term}
                className="flex flex-col justify-between rounded-2xl border border-[#DDD3BE] bg-white p-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-extrabold text-[#172033]">
                      {entry.term}
                    </h3>
                    <span className="shrink-0 rounded-md bg-[#FEF6E6] px-2 py-0.5 text-[11px] font-bold text-[#8C530A]">
                      Station {entry.stationOrder}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[#25324B]">
                    <strong className="text-[#0E7A5F]">En clair :</strong> {entry.plainFrench}
                  </p>

                  <p className="rounded-lg bg-[#F7F2E7] px-2.5 py-1.5 text-xs text-[#53607A]">
                    <strong className="text-[#172033]">Côté ingénieur :</strong> {entry.technicalNote}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F0E8D7] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onClose();
                      onGoToStation(entry.stationId);
                    }}
                    className="text-xs font-bold text-[#0F769E] hover:text-[#0A5775] cursor-pointer"
                  >
                    Tester dans la station {entry.stationOrder} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

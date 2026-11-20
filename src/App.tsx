import { useCallback, useEffect, useMemo, useState } from 'react';
import { AchievementsDashboard } from './components/AchievementsDashboard';
import { AdaptiveQuizView } from './components/AdaptiveQuizView';
import { ClippyRobot3D } from './components/ClippyRobot3D';
import { GameHud } from './components/GameHud';
import { GlossaryModal } from './components/GlossaryModal';
import { LumiWorkshop } from './components/LumiWorkshop';
import { StatusModal } from './components/StatusModal';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { AttentionStation } from './components/stations/AttentionStation';
import { ContextRagStation } from './components/stations/ContextRagStation';
import { LayersStation } from './components/stations/LayersStation';
import { OmniStation } from './components/stations/OmniStation';
import { PredictionStation } from './components/stations/PredictionStation';
import { ReasoningStation } from './components/stations/ReasoningStation';
import { TokensStation } from './components/stations/TokensStation';
import { TrainingStation } from './components/stations/TrainingStation';
import { evaluateAchievements } from './game/achievements';
import { STATIONS } from './game/content';
import {
  createInitialDualProgress,
  createInitialProgress,
  unlockCrystal,
  updateProgressForMode,
} from './game/llmEngine';
import {
  isMuted,
  isVoiceEnabled,
  playClick,
  playFanfare,
  setMuted,
  setVoiceEnabled,
  stopSpeaking,
} from './game/sound';
import type {
  AgeMode,
  DualProgressState,
  GamePhase,
  PlayView,
  ProgressState,
  QuizDifficulty,
  RobotEmotion,
  StationId,
} from './game/types';

const DUAL_STORAGE_KEY = 'atelier_llm_dual_progress_v2';

function sanitizeProgress(raw: Partial<ProgressState> | undefined): ProgressState {
  const base = createInitialProgress();
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    unlockedCrystals: Array.isArray(raw.unlockedCrystals) ? raw.unlockedCrystals : [],
  };
}

function loadSavedDualProgress(): DualProgressState {
  try {
    const raw = window.localStorage.getItem(DUAL_STORAGE_KEY);
    if (!raw) return createInitialDualProgress();
    const parsed = JSON.parse(raw) as Partial<DualProgressState>;
    return {
      kid: sanitizeProgress(parsed.kid),
      adult: sanitizeProgress(parsed.adult),
    };
  } catch {
    return createInitialDualProgress();
  }
}

function getInitialBootParams(): { autostart: boolean; mode: AgeMode } {
  if (typeof window === 'undefined') return { autostart: false, mode: 'kid' };
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart') === '1';
  const modeParam = params.get('mode');
  const mode: AgeMode = modeParam === 'adult' ? 'adult' : 'kid';
  return { autostart, mode };
}

const POKE_TIPS_KID: { emotion: RobotEmotion; text: string }[] = [
  {
    emotion: 'idea',
    text: 'Un token, c’est comme une petite perle de syllabe que je lis une par une !',
  },
  {
    emotion: 'curious',
    text: 'Essaie de bouger la souris doucement sur l’observatoire pour voir la profondeur 3D !',
  },
  {
    emotion: 'happy',
    text: 'Tes points Enfant et Adulte sont rangés dans deux bocaux séparés !',
  },
  {
    emotion: 'celebrating',
    text: 'Chaque cristal débloqué ajoute un beau badge dans ton tableau Succès !',
  },
];

const POKE_TIPS_ADULT: { emotion: RobotEmotion; text: string }[] = [
  {
    emotion: 'idea',
    text: 'BPE découpe les mots fréquents en un seul token et les mots rares en sous-unités.',
  },
  {
    emotion: 'thinking',
    text: 'Dans LFM3, des couches convolutives courtes remplacent une partie de l’attention quadratique.',
  },
  {
    emotion: 'curious',
    text: 'Les scores Enfant et Adulte restent strictement isolés quand vous basculez de mode.',
  },
  {
    emotion: 'surprised',
    text: 'Un modèle Omni projette patchs ViT, audio et texte dans le même espace latent !',
  },
];

function getContextualRobotState(
  phase: GamePhase,
  playView: PlayView,
  activeStation: StationId | null,
  ageMode: AgeMode
): { emotion: RobotEmotion; message: string } {
  if (phase === 'title') {
    return ageMode === 'kid'
      ? {
          emotion: 'happy',
          message:
            'Coucou ! Je suis Lumi en 3D ! Bouge ta souris pour voir la profondeur et choisis ton parcours !',
        }
      : {
          emotion: 'curious',
          message:
            'Bonjour ! Déplacez la souris pour explorer la parallaxe 3D, ou lancez le parcours Adulte.',
        };
  }

  if (playView === 'map') {
    return ageMode === 'kid'
      ? {
          emotion: 'curious',
          message:
            'Quelle station veux-tu ouvrir ? Clique sur une carte illustrée pour gagner un cristal !',
        }
      : {
          emotion: 'curious',
          message:
            'Sélectionnez un module (Tokens, Attention, LFM3, Omni-Vision) ou testez le Quiz adaptatif.',
        };
  }

  if (playView === 'quiz') {
    return {
      emotion: 'thinking',
      message:
        ageMode === 'kid'
          ? 'Prends ton temps ! Le quiz s’adapte tout seul à tes réponses.'
          : 'Quiz adaptatif actif : la difficulté s’ajuste dynamiquement selon votre série.',
    };
  }

  if (playView === 'lumi') {
    return {
      emotion: 'happy',
      message:
        'Youpi, tu es dans mon coin histoires ! Pose-moi une question ou écoute une fable.',
    };
  }

  if (playView === 'achievements') {
    return {
      emotion: 'celebrating',
      message:
        ageMode === 'kid'
          ? 'Voici tous tes badges du mode Enfant ! Change de mode pour voir ceux des Adultes.'
          : 'Tableau des Succès isolé pour ce parcours : stations, score et quiz.',
    };
  }

  switch (activeStation) {
    case 'tokens':
      return {
        emotion: 'idea',
        message:
          ageMode === 'kid'
            ? 'Clique sur les perles de mots pour voir comment je découpe les phrases !'
            : 'Observez la segmentation BPE et les IDs numériques injectés dans la table d’embeddings.',
      };
    case 'attention':
      return {
        emotion: 'thinking',
        message:
          ageMode === 'kid'
            ? 'Allume les fils dorés pour relier le pronom au bon mot !'
            : 'Survolez un token Query pour inspecter les poids d’attention Softmax(Q·Kᵀ/√d).',
      };
    case 'layers':
      return {
        emotion: 'thinking',
        message:
          ageMode === 'kid'
            ? 'Grimpe les étages de la grande tour : chaque étage comprend un peu mieux !'
            : 'Comparez le flux couche par couche : Transformer Dense, MoE sparse et hybride LFM3.',
      };
    case 'omni':
      return {
        emotion: 'surprised',
        message:
          ageMode === 'kid'
            ? 'Regarde ! Je peux voir des images, écouter des sons et lire des mots ensemble !'
            : 'Omni-Vision : les patchs d’image (ViT) rejoignent directement les tokens texte.',
      };
    case 'prediction':
      return {
        emotion: 'idea',
        message:
          ageMode === 'kid'
            ? 'Tourne la roue magique de créativité pour voir quel mot arrive ensuite !'
            : 'Ajustez la température τ pour observer la redistribution Softmax et les hallucinations.',
      };
    case 'training':
      return {
        emotion: 'curious',
        message:
          ageMode === 'kid'
            ? 'Clique sur les 3 classes de mon école : livres, questions et boussole aux étoiles !'
            : 'Comparez Pré-entraînement brut, SFT et alignement RLHF/DPO sur le même prompt.',
      };
    case 'context_rag':
      return {
        emotion: 'thinking',
        message:
          ageMode === 'kid'
            ? 'Remplis mon sac à dos mémoire et allume la bibliothèque RAG + la calculatrice !'
            : 'Observez l’éviction du contexte, Lost in the Middle et le gain du RAG + Tool Calling.',
      };
    case 'reasoning':
      return {
        emotion: 'idea',
        message:
          ageMode === 'kid'
            ? 'Ouvre le Carnet de Brouillon pour voir comment je résous l’énigme des pommes sans erreur !'
            : 'Comparez génération directe (System 1) vs Chain-of-Thought et auto-vérification.',
      };
    default:
      return {
        emotion: 'happy',
        message: 'Clique sur moi à tout moment pour une astuce sur les LLM !',
      };
  }
}

export default function App() {
  const boot = getInitialBootParams();
  const [phase, setPhase] = useState<GamePhase>(boot.autostart ? 'playing' : 'title');
  const [ageMode, setAgeMode] = useState<AgeMode>(boot.mode);
  const [playView, setPlayView] = useState<PlayView>('map');
  const [activeStation, setActiveStation] = useState<StationId | null>(null);
  const [dualProgress, setDualProgress] = useState<DualProgressState>(loadSavedDualProgress);
  const [mutedState, setMutedState] = useState<boolean>(isMuted());
  const [voiceState, setVoiceState] = useState<boolean>(isVoiceEnabled());
  const [quizSessionKey, setQuizSessionKey] = useState(0);
  const [showTitleAchievements, setShowTitleAchievements] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [pokeIndex, setPokeIndex] = useState(0);
  const [robotOverride, setRobotOverride] = useState<{
    emotion: RobotEmotion;
    message: string;
  } | null>(null);
  const [lastQuizSummary, setLastQuizSummary] = useState<{
    correctCount: number;
    totalAnswered: number;
    accuracyPercent: number;
    highestDifficultyReached: QuizDifficulty;
  } | null>(null);

  // Active mode's isolated progress (never mixed between Enfant & Adulte!)
  const activeProgress = dualProgress[ageMode];
  const achievementsSummary = useMemo(
    () => evaluateAchievements(activeProgress),
    [activeProgress]
  );

  const defaultRobot = useMemo(
    () => getContextualRobotState(phase, playView, activeStation, ageMode),
    [phase, playView, activeStation, ageMode]
  );

  const robotEmotion = robotOverride?.emotion ?? defaultRobot.emotion;
  const robotMessage = robotOverride?.message ?? defaultRobot.message;

  // Sync game state to document.body.dataset.state immediately
  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  // Persist dual progress safely for GitHub Pages returning visitors
  useEffect(() => {
    try {
      window.localStorage.setItem(DUAL_STORAGE_KEY, JSON.stringify(dualProgress));
    } catch {
      // Ignore storage restrictions
    }
  }, [dualProgress]);

  const switchAgeMode = useCallback((nextMode: AgeMode) => {
    stopSpeaking();
    playClick();
    setAgeMode(nextMode);
    setRobotOverride({
      emotion: 'surprised',
      message:
        nextMode === 'kid'
          ? 'Mode Enfant activé ! Ton compteur Enfant est prêt, séparé de celui des Adultes.'
          : 'Mode Adulte activé ! Votre compteur Adulte reste indépendant du mode Enfant.',
    });
  }, []);

  const handleStartGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    playClick();
    document.body.dataset.state = 'playing';
    setRobotOverride(null);
    setPhase('playing');
    setPlayView('map');
    setActiveStation(null);
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !mutedState;
    setMuted(next);
    setMutedState(next);
  }, [mutedState]);

  const handleToggleVoice = useCallback(() => {
    const next = !voiceState;
    setVoiceEnabled(next);
    setVoiceState(next);
    playClick();
  }, [voiceState]);

  const handleTogglePause = useCallback(() => {
    stopSpeaking();
    playClick();
    setPhase((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  // Global keyboard shortcuts (Enter/Space on Title, Escape/P Pause, M Mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (phase === 'title') {
        if (showTitleAchievements) {
          if (e.key === 'Escape') {
            e.preventDefault();
            setShowTitleAchievements(false);
          }
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (isTyping) return;

      if (showGlossary && e.key === 'Escape') {
        e.preventDefault();
        setShowGlossary(false);
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (phase === 'playing' || phase === 'paused') {
          e.preventDefault();
          handleTogglePause();
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, showTitleAchievements, showGlossary, handleStartGame, handleTogglePause, handleToggleMute]);

  const openStation = (id: StationId) => {
    stopSpeaking();
    playClick();
    setShowTitleAchievements(false);
    setRobotOverride(null);
    setPhase('playing');
    setActiveStation(id);
    setPlayView('station');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuiz = () => {
    stopSpeaking();
    playClick();
    setShowTitleAchievements(false);
    setRobotOverride(null);
    setQuizSessionKey((k) => k + 1);
    setActiveStation(null);
    setPlayView('quiz');
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLumi = () => {
    stopSpeaking();
    playClick();
    setShowTitleAchievements(false);
    setRobotOverride(null);
    setPhase('playing');
    setActiveStation(null);
    setPlayView('lumi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAchievements = () => {
    stopSpeaking();
    playClick();
    setRobotOverride(null);
    setActiveStation(null);
    setPlayView('achievements');
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToMap = () => {
    stopSpeaking();
    playClick();
    setRobotOverride(null);
    setActiveStation(null);
    setPlayView('map');
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnlockCrystal = (id: StationId) => {
    setDualProgress((prev) =>
      updateProgressForMode(prev, ageMode, (modeProgress) => unlockCrystal(modeProgress, id, 120))
    );
    setRobotOverride({
      emotion: 'celebrating',
      message:
        ageMode === 'kid'
          ? 'Hourra ! +120 points sur ton compteur Enfant et un nouveau cristal doré !'
          : 'Cristal validé ! +120 points crédités sur votre compteur Adulte.',
    });
  };

  const handleQuizComplete = (summary: {
    correctCount: number;
    totalAnswered: number;
    accuracyPercent: number;
    highestDifficultyReached: QuizDifficulty;
    bonusPoints: number;
  }) => {
    setLastQuizSummary(summary);
    setDualProgress((prev) =>
      updateProgressForMode(prev, ageMode, (modeProgress) => {
        const nextScore = modeProgress.score + summary.bonusPoints;
        return {
          ...modeProgress,
          score: nextScore,
          bestScore: Math.max(modeProgress.bestScore, nextScore),
          quizBestAccuracy: Math.max(modeProgress.quizBestAccuracy, summary.accuracyPercent),
        };
      })
    );
    setRobotOverride({
      emotion: 'celebrating',
      message: `Bravo ! +${summary.bonusPoints} points sur le compteur ${
        ageMode === 'kid' ? 'Enfant' : 'Adulte'
      } !`,
    });
    playFanfare();
    setPhase('gameover');
  };

  const handleRobotPoke = () => {
    const pool = ageMode === 'kid' ? POKE_TIPS_KID : POKE_TIPS_ADULT;
    const picked = pool[pokeIndex % pool.length];
    setPokeIndex((i) => i + 1);
    setRobotOverride({ emotion: picked.emotion, message: picked.text });
  };

  // Only float the 3D Clippy assistant inside the Atelier (never on TitleScreen where the painted robot stands!)
  const showFloatingRobot =
    phase === 'playing' && !showTitleAchievements && !showGlossary;

  if (phase === 'title') {
    return (
      <>
        <TitleScreen
          ageMode={ageMode}
          kidScore={dualProgress.kid.score}
          adultScore={dualProgress.adult.score}
          achievementsUnlockedCount={achievementsSummary.unlockedCount}
          achievementsTotalCount={achievementsSummary.totalCount}
          onSelectAgeMode={switchAgeMode}
          onStart={() => {
            setShowTitleAchievements(false);
            handleStartGame();
          }}
          onOpenAchievements={() => {
            playClick();
            setShowTitleAchievements(true);
          }}
        />
        {showTitleAchievements && (
          <AchievementsDashboard
            ageMode={ageMode}
            progress={activeProgress}
            asModal
            onSwitchAgeMode={switchAgeMode}
            onClose={() => {
              playClick();
              setShowTitleAchievements(false);
            }}
            onGoToStation={openStation}
            onOpenQuiz={openQuiz}
            onOpenLumi={openLumi}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF7EF] text-[#172033]">
      <GameHud
        ageMode={ageMode}
        playView={playView}
        activeStation={activeStation}
        progress={activeProgress}
        kidScore={dualProgress.kid.score}
        adultScore={dualProgress.adult.score}
        muted={mutedState}
        voiceOn={voiceState}
        onChangeAgeMode={switchAgeMode}
        onBackToMap={backToMap}
        onToggleVoice={handleToggleVoice}
        onToggleMute={handleToggleMute}
        onPause={handleTogglePause}
        onOpenGlossary={() => {
          playClick();
          setShowGlossary(true);
        }}
      />

      {playView === 'map' && (
        <WorldMap
          ageMode={ageMode}
          progress={activeProgress}
          onSelectStation={openStation}
          onOpenQuiz={openQuiz}
          onOpenLumi={openLumi}
          onOpenAchievements={openAchievements}
          onOpenGlossary={() => setShowGlossary(true)}
        />
      )}

      {playView === 'achievements' && (
        <AchievementsDashboard
          ageMode={ageMode}
          progress={activeProgress}
          onSwitchAgeMode={switchAgeMode}
          onGoToStation={openStation}
          onOpenQuiz={openQuiz}
          onOpenLumi={openLumi}
        />
      )}

      {/* Inter-Station Direct Stepper Bar (UX Fix: Navigate seamlessly across all 8 modules) */}
      {playView === 'station' && activeStation && (() => {
        const idx = STATIONS.findIndex((s) => s.id === activeStation);
        const prevStation = idx > 0 ? STATIONS[idx - 1] : null;
        const nextStation = idx >= 0 && idx < STATIONS.length - 1 ? STATIONS[idx + 1] : null;
        return (
          <nav
            aria-label="Navigation entre les stations"
            className="border-b border-[#E5DAC5] bg-[#F3ECDD] px-4 py-2 md:px-8"
          >
            <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-2 text-xs">
              {prevStation ? (
                <button
                  type="button"
                  onClick={() => openStation(prevStation.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D4C7AE] bg-white px-2.5 py-1 font-semibold text-[#172033] hover:border-[#C97714] cursor-pointer whitespace-nowrap"
                >
                  <span>← {prevStation.order}. {ageMode === 'kid' ? prevStation.titleKid : prevStation.titleAdult}</span>
                </button>
              ) : (
                <span className="text-[#6B768E] font-medium">Début du parcours</span>
              )}

              <span className="hidden sm:inline font-mono font-bold text-[#8C530A] tabular-nums">
                Station {idx + 1} / {STATIONS.length}
              </span>

              {nextStation ? (
                <button
                  type="button"
                  onClick={() => openStation(nextStation.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D4C7AE] bg-white px-2.5 py-1 font-semibold text-[#0F769E] hover:border-[#0F769E] cursor-pointer whitespace-nowrap"
                >
                  <span>{nextStation.order}. {ageMode === 'kid' ? nextStation.titleKid : nextStation.titleAdult} →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openQuiz}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#131D38] px-3 py-1 font-bold text-[#F6C453] hover:bg-[#1E2D55] cursor-pointer whitespace-nowrap"
                >
                  <span>Grand Quiz Adaptatif →</span>
                </button>
              )}
            </div>
          </nav>
        );
      })()}

      {playView === 'lumi' && (
        <LumiWorkshop
          onStoryFinished={() =>
            setDualProgress((prev) =>
              updateProgressForMode(prev, ageMode, (modeProgress) => ({
                ...modeProgress,
                score: modeProgress.score + 50,
                bestScore: Math.max(modeProgress.bestScore, modeProgress.score + 50),
                lumiStoriesFinished: modeProgress.lumiStoriesFinished + 1,
              }))
            )
          }
          onGoToStation={(id) => openStation(id)}
        />
      )}

      {playView === 'quiz' && (
        <AdaptiveQuizView
          key={`${ageMode}-${quizSessionKey}`}
          ageMode={ageMode}
          onComplete={handleQuizComplete}
        />
      )}

      {playView === 'station' && activeStation === 'tokens' && (
        <TokensStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('tokens')}
          onUnlock={() => handleUnlockCrystal('tokens')}
          onNextStation={() => openStation('attention')}
        />
      )}

      {playView === 'station' && activeStation === 'attention' && (
        <AttentionStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('attention')}
          onUnlock={() => handleUnlockCrystal('attention')}
          onNextStation={() => openStation('layers')}
        />
      )}

      {playView === 'station' && activeStation === 'layers' && (
        <LayersStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('layers')}
          onUnlock={() => handleUnlockCrystal('layers')}
          onNextStation={() => openStation('omni')}
        />
      )}

      {playView === 'station' && activeStation === 'omni' && (
        <OmniStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('omni')}
          onUnlock={() => handleUnlockCrystal('omni')}
          onNextStation={() => openStation('prediction')}
        />
      )}

      {playView === 'station' && activeStation === 'prediction' && (
        <PredictionStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('prediction')}
          onUnlock={() => handleUnlockCrystal('prediction')}
          onGoToQuiz={() => openStation('training')}
        />
      )}

      {playView === 'station' && activeStation === 'training' && (
        <TrainingStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('training')}
          onUnlock={() => handleUnlockCrystal('training')}
          onNextStation={() => openStation('context_rag')}
        />
      )}

      {playView === 'station' && activeStation === 'context_rag' && (
        <ContextRagStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('context_rag')}
          onUnlock={() => handleUnlockCrystal('context_rag')}
          onNextStation={() => openStation('reasoning')}
        />
      )}

      {playView === 'station' && activeStation === 'reasoning' && (
        <ReasoningStation
          ageMode={ageMode}
          unlocked={activeProgress.unlockedCrystals.includes('reasoning')}
          onUnlock={() => handleUnlockCrystal('reasoning')}
          onGoToQuiz={openQuiz}
        />
      )}

      {showFloatingRobot && (
        <ClippyRobot3D
          ageMode={ageMode}
          emotion={robotEmotion}
          message={robotMessage}
          autoOpenBubble={robotOverride !== null}
          onSelectEmotion={(em, tip) =>
            setRobotOverride({ emotion: em, message: tip ?? robotMessage })
          }
          onPokeTip={handleRobotPoke}
        />
      )}

      {phase === 'paused' && (
        <StatusModal
          kind="paused"
          ageMode={ageMode}
          progress={activeProgress}
          onResume={() => {
            playClick();
            setPhase('playing');
          }}
          onBackToMap={backToMap}
          onReturnTitle={() => {
            stopSpeaking();
            playClick();
            setRobotOverride(null);
            setPhase('title');
          }}
          onReplay={openQuiz}
          onSwitchMode={() => {
            switchAgeMode(ageMode === 'kid' ? 'adult' : 'kid');
            setPhase('playing');
          }}
        />
      )}

      {phase === 'gameover' && (
        <StatusModal
          kind="victory"
          ageMode={ageMode}
          progress={activeProgress}
          lastQuizSummary={lastQuizSummary}
          onResume={backToMap}
          onBackToMap={backToMap}
          onReturnTitle={() => {
            stopSpeaking();
            playClick();
            setRobotOverride(null);
            setPhase('title');
          }}
          onReplay={openQuiz}
          onSwitchMode={() => {
            switchAgeMode(ageMode === 'kid' ? 'adult' : 'kid');
            setPlayView('map');
            setPhase('playing');
          }}
        />
      )}
      {showGlossary && (
        <GlossaryModal
          onClose={() => setShowGlossary(false)}
          onGoToStation={(id) => openStation(id)}
        />
      )}
    </div>
  );
}

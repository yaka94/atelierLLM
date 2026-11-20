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
import { getFactsForContext, getNextFactIndex } from './game/lumiFacts';
import {
  isMuted,
  isVoiceEnabled,
  playClick,
  playFanfare,
  setMuted,
  setVoiceEnabled,
  speakFrench,
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
  const [lumiOpen, setLumiOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [robotOverride, setRobotOverride] = useState<{
    emotion: RobotEmotion;
    tag: string;
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

  // Contextual LLM facts bank ordered with active station facts first
  const contextualFacts = useMemo(
    () => getFactsForContext(ageMode, activeStation),
    [ageMode, activeStation]
  );
  const currentFact = contextualFacts[factIndex % contextualFacts.length] ?? contextualFacts[0];

  const robotEmotion = robotOverride?.emotion ?? currentFact.emotion;
  const robotTag = robotOverride?.tag ?? currentFact.tag;
  const robotMessage = robotOverride?.message ?? currentFact.text;

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
    setFactIndex(0);
    setRobotOverride(null);
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
    setFactIndex(0);
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
      tag: 'Cristal débloqué !',
      message:
        ageMode === 'kid'
          ? 'Hourra ! +120 points sur ton compteur Enfant ! Clique sur « Autre secret IA » pour découvrir une anecdote étonnante.'
          : 'Cristal validé ! +120 points crédités. Cliquez sur « Autre fait LLM » pour explorer une anecdote technique.',
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
      tag: 'Grand Quiz réussi !',
      message: `Bravo ! +${summary.bonusPoints} points sur le compteur ${
        ageMode === 'kid' ? 'Enfant' : 'Adulte'
      } !`,
    });
    playFanfare();
    setPhase('gameover');
  };

  const handleNextLumiFact = () => {
    stopSpeaking();
    if (robotOverride) {
      setRobotOverride(null);
      return;
    }
    setFactIndex((prev) => getNextFactIndex(prev, contextualFacts.length));
  };

  const handleToggleLumi = () => {
    stopSpeaking();
    playClick();
    setLumiOpen((prev) => !prev);
  };

  // Only float the 3D assistant inside the Atelier when explicitly toggled open from the top HUD
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
        lumiOpen={lumiOpen}
        onChangeAgeMode={switchAgeMode}
        onBackToMap={backToMap}
        onToggleVoice={handleToggleVoice}
        onToggleMute={handleToggleMute}
        onPause={handleTogglePause}
        onOpenGlossary={() => {
          playClick();
          setShowGlossary(true);
        }}
        onToggleLumi={handleToggleLumi}
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
                  className="inline-flex max-w-[46%] items-center gap-1 rounded-lg border border-[#D4C7AE] bg-white px-2.5 py-1 font-semibold text-[#172033] hover:border-[#C97714] cursor-pointer"
                >
                  <span className="truncate">← {prevStation.order}. {ageMode === 'kid' ? prevStation.titleKid : prevStation.titleAdult}</span>
                </button>
              ) : (
                <span className="text-[#6B768E] font-medium truncate">Début du parcours</span>
              )}

              <span className="hidden md:inline font-mono font-bold text-[#8C530A] tabular-nums shrink-0">
                Station {idx + 1} / {STATIONS.length}
              </span>

              {nextStation ? (
                <button
                  type="button"
                  onClick={() => openStation(nextStation.id)}
                  className="inline-flex max-w-[46%] items-center gap-1 rounded-lg border border-[#D4C7AE] bg-white px-2.5 py-1 font-semibold text-[#0F769E] hover:border-[#0F769E] cursor-pointer"
                >
                  <span className="truncate">{nextStation.order}. {ageMode === 'kid' ? nextStation.titleKid : nextStation.titleAdult} →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openQuiz}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#131D38] px-3 py-1 font-bold text-[#F6C453] hover:bg-[#1E2D55] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Grand Quiz →</span>
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
          open={lumiOpen}
          ageMode={ageMode}
          emotion={robotEmotion}
          tag={robotTag}
          message={robotMessage}
          factNumber={(factIndex % contextualFacts.length) + 1}
          factTotal={contextualFacts.length}
          onNextFact={handleNextLumiFact}
          onSpeakMessage={() => speakFrench(robotMessage)}
          onClose={() => {
            stopSpeaking();
            setLumiOpen(false);
          }}
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

import { useMemo, useState } from 'react';
import {
  computeQuizSummary,
  createAdaptiveQuiz,
  selectNextQuestion,
  submitQuizAnswer,
} from '../game/adaptiveQuiz';
import { playClick, playFanfare, playGentleError, playSuccess, speakFrench } from '../game/sound';
import type { AgeMode, QuizDifficulty } from '../game/types';
import { LumiMascotSvg } from './LumiMascotSvg';

interface AdaptiveQuizViewProps {
  ageMode: AgeMode;
  onComplete: (summary: {
    correctCount: number;
    totalAnswered: number;
    accuracyPercent: number;
    highestDifficultyReached: QuizDifficulty;
    bonusPoints: number;
  }) => void;
}

function OptionVisualIcon({ kind }: { kind?: string }) {
  switch (kind) {
    case 'beads':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <circle cx="9" cy="18" r="6" fill="#E8A62E" stroke="#6B4212" strokeWidth="2" />
          <circle cx="19" cy="18" r="6" fill="#0F769E" stroke="#083B50" strokeWidth="2" />
          <circle cx="29" cy="18" r="5" fill="#0E7A5F" stroke="#064031" strokeWidth="2" />
        </svg>
      );
    case 'flashlight':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <path d="M18 6l12 22H6L18 6z" fill="#FDE68A" stroke="#C97714" strokeWidth="2" />
          <circle cx="18" cy="15" r="3.5" fill="#C97714" />
        </svg>
      );
    case 'tower':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <rect x="10" y="6" width="16" height="6" rx="2" fill="#0E7A5F" />
          <rect x="8" y="15" width="20" height="6" rx="2" fill="#0F769E" />
          <rect x="6" y="24" width="24" height="6" rx="2" fill="#E8A62E" />
        </svg>
      );
    case 'prism':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <polygon points="18,4 32,29 4,29" fill="#E0F2FE" stroke="#0F769E" strokeWidth="2.2" />
          <line x1="2" y1="20" x2="14" y2="20" stroke="#C97714" strokeWidth="2.5" />
          <line x1="22" y1="20" x2="34" y2="16" stroke="#0E7A5F" strokeWidth="2.5" />
        </svg>
      );
    case 'wheel':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="13" fill="#FEF3C7" stroke="#C97714" strokeWidth="2.2" />
          <path d="M18 5v13l10 6" stroke="#131D38" strokeWidth="2" />
          <circle cx="18" cy="18" r="3" fill="#C2412D" />
        </svg>
      );
    case 'puzzle':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <rect x="6" y="6" width="11" height="11" rx="2" fill="#38BDF8" />
          <rect x="19" y="6" width="11" height="11" rx="2" fill="#FBBF24" />
          <rect x="6" y="19" width="11" height="11" rx="2" fill="#34D399" />
          <rect x="19" y="19" width="11" height="11" rx="2" fill="#F87171" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <rect x="14" y="5" width="8" height="20" rx="4" fill="#FEE2E2" stroke="#C2412D" strokeWidth="2" />
          <circle cx="18" cy="26" r="5" fill="#C2412D" />
          <rect x="16.5" y="11" width="3" height="14" fill="#C2412D" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
          <path
            d="M18 5l3.2 8.8L30 17l-8.8 3.2L18 29l-3.2-8.8L6 17l8.8-3.2L18 5z"
            fill="#F6C453"
            stroke="#8C530A"
            strokeWidth="1.8"
          />
        </svg>
      );
  }
}

export function AdaptiveQuizView({ ageMode, onComplete }: AdaptiveQuizViewProps) {
  const [quizState, setQuizState] = useState(() => createAdaptiveQuiz(ageMode, 5));
  const [lastFeedback, setLastFeedback] = useState<{
    selectedId: string;
    isCorrect: boolean;
    message: string;
    neuroTip: string;
    delta: -1 | 0 | 1;
  } | null>(null);
  const [modeKey, setModeKey] = useState(ageMode);

  // Reset quiz cleanly if user flips between Kid and Adult mode mid-quiz
  if (modeKey !== ageMode) {
    setModeKey(ageMode);
    setQuizState(createAdaptiveQuiz(ageMode, 5));
    setLastFeedback(null);
  }

  const currentQuestion = useMemo(() => {
    if (lastFeedback) {
      // Keep showing the question just answered until the user clicks "Question suivante"
      const lastAnswer = quizState.answers[quizState.answers.length - 1];
      if (!lastAnswer) return selectNextQuestion(quizState);
      return (
        selectNextQuestion({
          ...quizState,
          askedIds: quizState.askedIds.filter((id) => id !== lastAnswer.questionId),
          answers: quizState.answers.slice(0, -1),
          completed: false,
          currentDifficulty: lastAnswer.difficulty,
        }) ?? selectNextQuestion(quizState)
      );
    }
    return selectNextQuestion(quizState);
  }, [quizState, lastFeedback]);

  const difficultyLabel =
    quizState.currentDifficulty === 1
      ? ageMode === 'kid'
        ? 'Niveau 1 · Découverte'
        : 'Niveau 1 · Fondamentaux'
      : quizState.currentDifficulty === 2
      ? ageMode === 'kid'
        ? 'Niveau 2 · Explorateur'
        : 'Niveau 2 · Intermédiaire'
      : ageMode === 'kid'
      ? 'Niveau 3 · Maître Junior'
      : 'Niveau 3 · Architecture Avancée';

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || lastFeedback) return;
    const { nextState, isCorrect, difficultyDelta } = submitQuizAnswer(
      quizState,
      currentQuestion,
      optionId
    );
    setQuizState(nextState);

    const feedbackMessage = isCorrect
      ? currentQuestion.explanationSuccess
      : currentQuestion.explanationError;

    setLastFeedback({
      selectedId: optionId,
      isCorrect,
      message: feedbackMessage,
      neuroTip: currentQuestion.neuroscienceTip,
      delta: difficultyDelta,
    });

    if (isCorrect) {
      playSuccess();
    } else {
      playGentleError();
    }
    speakFrench(feedbackMessage);
  };

  const handleContinue = () => {
    playClick();
    if (quizState.completed) {
      playFanfare();
      onComplete(computeQuizSummary(quizState));
      return;
    }
    setLastFeedback(null);
  };

  if (!currentQuestion) {
    return null;
  }

  const questionNumber = lastFeedback
    ? quizState.answers.length
    : Math.min(quizState.totalQuestions, quizState.answers.length + 1);

  return (
    <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col gap-5 px-4 py-6 md:px-8">
      {/* Progress & Adaptive Difficulty Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DDD3BE] bg-white px-5 py-4 shadow-sm">
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-[#53607A]">
            Quiz Adaptatif · {ageMode === 'kid' ? 'Mode Enfant (5+)' : 'Mode Adulte'}
          </div>
          <div className="font-display text-lg font-extrabold text-[#172033] tabular-nums">
            Question {questionNumber} sur {quizState.totalQuestions}
          </div>
        </div>

        {/* Visual 3-level adaptive ladder */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-[#0F769E]">{difficultyLabel}</div>
            <div className="text-[11px] text-[#53607A]">
              La difficulté s’ajuste automatiquement à tes réponses
            </div>
          </div>
          <div className="flex items-end gap-1" aria-hidden="true">
            {[1, 2, 3].map((lvl) => (
              <span
                key={lvl}
                className="w-3 rounded-sm transition-all duration-200"
                style={{
                  height: `${10 + lvl * 7}px`,
                  backgroundColor:
                    lvl <= quizState.currentDifficulty ? '#E8A62E' : '#E2D8C4',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <section className="rounded-2xl border border-[#DDD3BE] bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-[#172033] leading-snug">
              {currentQuestion.prompt}
            </h1>
            {ageMode === 'kid' && (
              <button
                type="button"
                onClick={() => speakFrench(currentQuestion.prompt, true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3ECDD] px-3 py-1.5 text-xs font-bold text-[#172033] hover:bg-[#E7DCC4] cursor-pointer"
              >
                <span>Écouter la question</span>
              </button>
            )}
          </div>
          {ageMode === 'kid' && (
            <div className="shrink-0 self-center sm:self-start">
              <LumiMascotSvg
                mood={
                  !lastFeedback
                    ? 'curious'
                    : lastFeedback.isCorrect
                    ? 'celebrating'
                    : 'thinking'
                }
                size={88}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = lastFeedback?.selectedId === opt.id;
            const isCorrectOpt = opt.id === currentQuestion.correctOptionId;

            let cardStyle =
              'border-[#DDD3BE] bg-[#FBF7EF] text-[#172033] hover:border-[#C97714] hover:bg-[#FEF6E6]';
            if (lastFeedback) {
              if (isCorrectOpt) {
                cardStyle = 'border-[#0E7A5F] bg-[#ECFDF5] text-[#064E3B]';
              } else if (isSelected && !isCorrectOpt) {
                cardStyle = 'border-[#C2412D] bg-[#FEF2F2] text-[#7F1D1D]';
              } else {
                cardStyle = 'border-[#E6DEC9] bg-[#FAF7F0] text-[#7A8499] opacity-70';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={Boolean(lastFeedback)}
                onClick={() => handleSelectOption(opt.id)}
                className={`flex min-h-[60px] items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-150 ${
                  lastFeedback ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
                } ${cardStyle}`}
              >
                {ageMode === 'kid' ? (
                  <OptionVisualIcon kind={opt.visualIcon} />
                ) : (
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/25 text-xs font-bold uppercase">
                    {opt.id}
                  </span>
                )}
                <span className="text-sm md:text-base font-semibold leading-snug">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Immediate Benevolent Error/Success Feedback (Dehaene pillar) */}
        {lastFeedback && (
          <div
            className={`rounded-2xl border p-5 space-y-3 ${
              lastFeedback.isCorrect
                ? 'border-[#0E7A5F]/40 bg-[#ECFDF5]'
                : 'border-[#C97714]/45 bg-[#FFFBEB]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-sm font-extrabold ${
                  lastFeedback.isCorrect ? 'text-[#0E7A5F]' : 'text-[#9A5207]'
                }`}
              >
                {lastFeedback.isCorrect
                  ? 'Excellente réponse !'
                  : 'C’est en essayant qu’on apprend !'}
              </span>
              {lastFeedback.delta !== 0 && (
                <span className="text-xs font-semibold text-[#46536E]">
                  {lastFeedback.delta > 0
                    ? 'Difficulté ajustée : niveau supérieur ↑'
                    : 'Difficulté ajustée : consolidation du niveau ↓'}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[#172033]">{lastFeedback.message}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-black/10">
              <span className="text-xs text-[#53607A]">
                Neurosciences · {lastFeedback.neuroTip}
              </span>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-[#131D38] px-5 py-2.5 text-sm font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer whitespace-nowrap"
              >
                {quizState.completed ? 'Voir mes résultats' : 'Question suivante →'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

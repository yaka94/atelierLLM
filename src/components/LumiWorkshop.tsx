import { useState } from 'react';
import { LUMI_QA_ITEMS, LUMI_STORIES } from '../game/content';
import { playBeadPop, playClick, playFanfare, playSuccess, speakFrench } from '../game/sound';
import type { LumiMood } from '../game/types';
import { LumiMascotSvg } from './LumiMascotSvg';

interface LumiWorkshopProps {
  onStoryFinished: () => void;
  onGoToStation: (stationId: 'tokens' | 'attention' | 'omni') => void;
}

export function LumiWorkshop({ onStoryFinished, onGoToStation }: LumiWorkshopProps) {
  const [tab, setTab] = useState<'qa' | 'story'>('qa');
  const [selectedQaId, setSelectedQaId] = useState(LUMI_QA_ITEMS[0].id);
  const [pokeCount, setPokeCount] = useState(0);

  // Story state
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyStep, setStoryStep] = useState(0);
  const [storyLines, setStoryLines] = useState<string[]>([LUMI_STORIES[0].intro]);
  const [storyFinished, setStoryFinished] = useState(false);
  const [storyMood, setStoryMood] = useState<LumiMood>('story');

  const activeQa = LUMI_QA_ITEMS.find((q) => q.id === selectedQaId) ?? LUMI_QA_ITEMS[0];
  const activeStory = LUMI_STORIES[storyIndex];

  const activeMood: LumiMood =
    tab === 'story' ? (storyFinished ? 'celebrating' : storyMood) : activeQa.mood;

  const handleSelectQa = (id: string) => {
    playBeadPop(LUMI_QA_ITEMS.findIndex((i) => i.id === id));
    setSelectedQaId(id);
    const found = LUMI_QA_ITEMS.find((i) => i.id === id);
    if (found) {
      speakFrench(found.answer);
    }
  };

  const handleStartStory = (idx: number) => {
    playClick();
    setStoryIndex(idx);
    setStoryStep(0);
    setStoryLines([LUMI_STORIES[idx].intro]);
    setStoryFinished(false);
    setStoryMood('story');
    speakFrench(LUMI_STORIES[idx].intro);
  };

  const handleChooseStoryWord = (choice: {
    word: string;
    continuation: string;
    mood: LumiMood;
  }) => {
    const nextLines = [...storyLines, choice.continuation];
    setStoryLines(nextLines);
    setStoryMood(choice.mood);
    speakFrench(choice.continuation);

    if (storyStep + 1 >= activeStory.steps.length) {
      playFanfare();
      setStoryFinished(true);
      onStoryFinished();
    } else {
      playSuccess();
      setStoryStep((s) => s + 1);
    }
  };

  const handlePokeLumi = () => {
    playBeadPop(pokeCount);
    setPokeCount((c) => c + 1);
    const greetings = [
      'Coucou ! Je suis Lumi, ton ami robot curieux !',
      'Hi hi ! Mon antenne chatouille quand tu cliques dessus !',
      'Prêt à fabriquer un collier de perles de mots ?',
    ];
    speakFrench(greetings[pokeCount % greetings.length], true);
  };

  return (
    <main className="mx-auto flex w-full max-w-[1260px] flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#8C530A]">
            Compagnon interactif · Dès 5 ans
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#172033]">
            Le Coin de Lumi le Petit Robot
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Activités avec Lumi"
          className="inline-flex rounded-xl bg-[#EAE1CF] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'qa'}
            onClick={() => {
              playClick();
              setTab('qa');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'qa' ? 'bg-white text-[#172033] shadow-sm' : 'text-[#53607A] hover:text-[#172033]'
            }`}
          >
            Poser une question
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'story'}
            onClick={() => {
              playClick();
              setTab('story');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
              tab === 'story' ? 'bg-white text-[#172033] shadow-sm' : 'text-[#53607A] hover:text-[#172033]'
            }`}
          >
            Inventer une histoire
          </button>
        </div>
      </div>

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Animated Lumi Stage */}
        <section className="lg:col-span-5 flex flex-col items-center rounded-2xl border border-[#DDD3BE] bg-white p-6 text-center shadow-sm space-y-4">
          <div className="relative flex w-full flex-col items-center rounded-2xl bg-[#F3ECDD] py-6 px-4">
            <LumiMascotSvg mood={activeMood} size={184} interactive onPoke={handlePokeLumi} />
            <span className="mt-1 text-xs font-medium text-[#6C5430]">
              Clique sur Lumi pour lui faire coucou !
            </span>
          </div>

          {/* Speech Bubble */}
          <div className="w-full rounded-2xl border border-[#E5DAC4] bg-[#FBF7EF] p-4 text-left space-y-3">
            <p className="text-base leading-relaxed font-medium text-[#172033]">
              {tab === 'qa'
                ? activeQa.answer
                : storyFinished
                ? activeStory.endingNote
                : storyLines[storyLines.length - 1]}
            </p>
            <button
              type="button"
              onClick={() =>
                speakFrench(
                  tab === 'qa'
                    ? activeQa.answer
                    : storyFinished
                    ? activeStory.endingNote
                    : storyLines[storyLines.length - 1],
                  true
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#131D38] px-3.5 py-2 text-xs font-bold text-[#FBF7EF] hover:bg-[#1E2D55] transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" aria-hidden="true">
                <path
                  d="M9 5L5 8.5H2.5v3H5L9 15V5zM13 7.5a3.5 3.5 0 0 1 0 5M15.5 5.5a6 6 0 0 1 0 9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Écouter Lumi lire à voix haute</span>
            </button>
          </div>
        </section>

        {/* Right: Interactive Questions OR Interactive Story Builder */}
        <section className="lg:col-span-7 rounded-2xl border border-[#DDD3BE] bg-white p-6 shadow-sm space-y-5">
          {tab === 'qa' ? (
            <>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-[#172033]">
                  Clique sur une question pour Lumi
                </h2>
                <p className="text-sm text-[#53607A]">
                  Des explications très simples avec une image mentale à retenir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LUMI_QA_ITEMS.map((item) => {
                  const active = item.id === activeQa.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectQa(item.id)}
                      className={`min-h-[52px] rounded-xl border p-3.5 text-left text-sm font-bold transition-all duration-150 cursor-pointer ${
                        active
                          ? 'border-[#C97714] bg-[#FEF6E6] text-[#172033] shadow-sm'
                          : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#37435A] hover:border-[#C97714]/60'
                      }`}
                    >
                      {item.question}
                    </button>
                  );
                })}
              </div>

              {/* Visual Analogy Display */}
              <div className="rounded-2xl border border-[#E2D8C4] bg-[#F3ECDD] p-5 space-y-3">
                <div className="text-xs font-bold text-[#8C530A]">
                  Image magique à retenir · {activeQa.visualAnalogyTitle}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {activeQa.visualPieces.map((piece, idx) => (
                    <span
                      key={piece}
                      className="rounded-xl border border-[#D4C4A5] bg-white px-4 py-2.5 text-base font-bold text-[#172033] shadow-xs"
                      style={{
                        borderBottomWidth: '3px',
                        borderBottomColor: ['#C97714', '#0F769E', '#0E7A5F', '#7C4D9E'][idx % 4],
                      }}
                    >
                      {piece}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#4B5872]">{activeQa.visualCaption}</p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onGoToStation('tokens')}
                  className="rounded-xl bg-[#0F769E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0B6082] cursor-pointer whitespace-nowrap"
                >
                  Jouer avec les Perles (Tokens) →
                </button>
                <button
                  type="button"
                  onClick={() => onGoToStation('omni')}
                  className="rounded-xl border border-[#CFC3AB] bg-[#FBF7EF] px-4 py-2.5 text-xs font-bold text-[#172033] hover:bg-[#F3ECDD] cursor-pointer whitespace-nowrap"
                >
                  Essayer le Prisme des 5 Sens →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#172033]">
                    Choisis une mini-histoire avec Lumi
                  </h2>
                  <p className="text-sm text-[#53607A]">
                    Comme un vrai LLM, tu vas choisir le mot suivant pour construire l’aventure !
                  </p>
                </div>
                <div className="flex gap-2">
                  {LUMI_STORIES.map((story, idx) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => handleStartStory(idx)}
                      className={`rounded-xl border px-3.5 py-2 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        idx === storyIndex
                          ? 'border-[#C97714] bg-[#FEF6E6] text-[#172033]'
                          : 'border-[#E2D8C4] bg-[#FBF7EF] text-[#53607A] hover:text-[#172033]'
                      }`}
                    >
                      {story.icon} {story.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story parchment */}
              <div className="rounded-2xl border border-[#E2D8C4] bg-[#FBF7EF] p-5 space-y-3 min-h-[160px]">
                {storyLines.map((line, i) => (
                  <p
                    key={i}
                    className={`text-base leading-relaxed ${
                      i === storyLines.length - 1
                        ? 'font-bold text-[#172033]'
                        : 'text-[#4B5872]'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Next choice buttons */}
              {!storyFinished ? (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-[#8C530A]">
                    {activeStory.steps[storyStep].prompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeStory.steps[storyStep].choices.map((choice) => (
                      <button
                        key={choice.word}
                        type="button"
                        onClick={() => handleChooseStoryWord(choice)}
                        className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-[#E2D8C4] bg-white p-3 text-center transition-all duration-150 hover:border-[#C97714] hover:bg-[#FEF6E6] hover:-translate-y-0.5 cursor-pointer"
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {choice.emoji}
                        </span>
                        <span className="text-sm font-extrabold text-[#172033]">
                          {choice.word}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0E7A5F]/35 bg-[#ECFDF5] p-4">
                  <div className="text-sm font-bold text-[#0E7A5F]">
                    Histoire terminée ! Tu as inventé une aventure complète avec Lumi !
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartStory(storyIndex)}
                    className="rounded-xl bg-[#0E7A5F] px-4 py-2 text-xs font-bold text-white hover:bg-[#0A614B] cursor-pointer whitespace-nowrap"
                  >
                    Rejouer cette histoire
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

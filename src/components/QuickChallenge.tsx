import { useState } from 'react';
import { playGentleError, playSuccess, speakFrench } from '../game/sound';

interface QuickChallengeProps {
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  successNote: string;
  retryNote: string;
  unlocked: boolean;
  onUnlock: () => void;
}

export function QuickChallenge({
  question,
  options,
  correctId,
  successNote,
  retryNote,
  unlocked,
  onUnlock,
}: QuickChallengeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(unlocked);

  const handlePick = (id: string) => {
    setSelected(id);
    if (id === correctId) {
      playSuccess();
      setSolved(true);
      onUnlock();
      speakFrench(successNote);
    } else {
      playGentleError();
      speakFrench(retryNote);
    }
  };

  return (
    <section className="rounded-2xl border border-[#DDD3BE] bg-[#F3ECDD] p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-[#8C530A]">
          Défi Éclair · Récupération active
        </div>
        <div className="text-xs font-bold text-[#0E7A5F]">
          {solved ? 'Cristal de cette station gagné ★' : 'Réponds pour gagner le Cristal'}
        </div>
      </div>

      <p className="font-display text-base font-bold text-[#172033]">{question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isPicked = selected === opt.id;
          const isRight = opt.id === correctId;
          let style =
            'border-[#D4C7AE] bg-white text-[#172033] hover:border-[#C97714] hover:bg-[#FEF6E6]';
          if (solved && isRight) {
            style = 'border-[#0E7A5F] bg-[#ECFDF5] text-[#064E3B]';
          } else if (isPicked && !isRight) {
            style = 'border-[#C2412D] bg-[#FEF2F2] text-[#7F1D1D]';
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              className={`min-h-[46px] rounded-xl border-2 px-3.5 py-2.5 text-left text-xs md:text-sm font-semibold transition-colors cursor-pointer ${style}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <p
          className={`text-xs md:text-sm leading-relaxed font-medium ${
            selected === correctId ? 'text-[#0E7A5F]' : 'text-[#9A5207]'
          }`}
        >
          {selected === correctId ? successNote : retryNote}
        </p>
      )}
    </section>
  );
}

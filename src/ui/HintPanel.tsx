import { useState } from "react";
import { hintFor } from "../content/hints";
import type { Game } from "../game/model";
export function HintPanel({ game }: { game: Game }) {
  const [step, setStep] = useState(0),
    hint = hintFor(game);
  return (
    <>
      <span className="eyebrow">A LITTLE HELP</span>
      <h2>{hint.title}</h2>
      <p className="hint-step">{hint.steps[step]}</p>
      <div
        className="hint-progress"
        aria-label={`手がかり ${step + 1} / ${hint.steps.length}`}
      >
        {hint.steps.map((_, i) => (
          <span key={i} className={i <= step ? "on" : ""} />
        ))}
      </div>
      <div className="hint-buttons">
        <button
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
        >
          前の手がかり
        </button>
        <button
          disabled={step === hint.steps.length - 1}
          onClick={() => setStep(Math.min(hint.steps.length - 1, step + 1))}
        >
          もう少し詳しく
        </button>
      </div>
    </>
  );
}

"use client";

import { COMPONENTS } from "@/lib/components";
import type { ComponentId, Interaction, Positions } from "@/lib/types";
import { ComponentSlider } from "./ComponentSlider";
import { InteractionBadges } from "./InteractionBadges";

export function SliderPanel({
  positions,
  userIsIndemnitee,
  interactions,
  onChange,
  onRevise,
  loading,
  disabled,
}: {
  positions: Positions;
  userIsIndemnitee: boolean;
  interactions: Interaction[];
  onChange: (id: ComponentId, value: number) => void;
  onRevise: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const byComponent = (id: ComponentId) =>
    interactions.filter((i) => i.relatedComponentIds.includes(id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Indemnity levers</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Sliders show the current drafting. Green marks the end that favors your side.
            Adjust toward your target, then generate redlines.
          </p>
        </div>
        <button
          type="button"
          onClick={onRevise}
          disabled={loading || disabled}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Revising…" : "Revise clause"}
        </button>
      </div>

      <InteractionBadges interactions={interactions} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {COMPONENTS.map((c) => (
          <ComponentSlider
            key={c.id}
            component={c}
            value={positions[c.id]}
            userIsIndemnitee={userIsIndemnitee}
            onChange={(v) => onChange(c.id, v)}
            interactions={byComponent(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

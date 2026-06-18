"use client";

import type { Interaction } from "@/lib/types";

const STYLE = {
  danger: { box: "bg-risk-danger text-risk-dangerText", icon: "🛑" },
  warn: { box: "bg-risk-warn text-risk-warnText", icon: "⚠" },
  info: { box: "bg-risk-info text-risk-infoText", icon: "ℹ" },
} as const;

export function InteractionBadges({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <div className="rounded-2xl bg-favor-soft px-4 py-3 text-sm text-emerald-700">
        ✓ No cross-component risks detected at the current settings.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {interactions.map((i) => {
        const s = STYLE[i.severity];
        return (
          <div key={i.id} className={`rounded-2xl px-4 py-3 text-sm ${s.box}`}>
            <p className="font-semibold">
              {s.icon} {i.title}
            </p>
            <p className="mt-0.5 opacity-90">{i.message}</p>
          </div>
        );
      })}
    </div>
  );
}

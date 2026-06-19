"use client";

import { CATEGORY_CHIP, favorablePole } from "@/lib/components";
import type { ComponentConfig, Interaction } from "@/lib/types";
import { InfoDot, Tooltip } from "./Tooltip";

export function ComponentSlider({
  component,
  value,
  userIsIndemnitee,
  onChange,
  interactions,
}: {
  component: ComponentConfig;
  value: number;
  userIsIndemnitee: boolean;
  onChange: (v: number) => void;
  interactions: Interaction[];
}) {
  const favPole = favorablePole(component, userIsIndemnitee);
  const chip = CATEGORY_CHIP[component.category];

  // Tint the favorable end green, the other end neutral. The thumb sits over a
  // gradient track; favorable end is whichever pole helps the represented party.
  const greenStop = favPole === "narrow" ? "to right" : "to left";
  const trackBg = `linear-gradient(${greenStop}, rgba(16,185,129,0.35), rgba(148,163,184,0.18))`;

  const worstSeverity = interactions.reduce<"info" | "warn" | "danger" | null>(
    (acc, i) => {
      const rank = { info: 1, warn: 2, danger: 3 } as const;
      if (!acc || rank[i.severity] > rank[acc]) return i.severity;
      return acc;
    },
    null,
  );

  const sevDot =
    worstSeverity === "danger"
      ? "bg-risk-dangerText"
      : worstSeverity === "warn"
        ? "bg-risk-warnText"
        : worstSeverity === "info"
          ? "bg-risk-infoText"
          : "";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.bg} ${chip.text}`}>
            {chip.label}
          </span>
          <span className="text-sm font-semibold text-slate-700">{component.label}</span>
          {worstSeverity && (
            <span className={`h-2 w-2 rounded-full ${sevDot}`} title="Risk flag — see tooltip" />
          )}
        </div>
        <Tooltip trigger={<InfoDot />} width={340}>
          <div className="space-y-2">
            <p className="font-semibold text-slate-700">{component.label}</p>
            <p>{component.tooltip.what}</p>
            <p>
              <span className="font-medium text-slate-600">Narrow:</span>{" "}
              {component.tooltip.narrow}
            </p>
            <p>
              <span className="font-medium text-slate-600">Broad:</span>{" "}
              {component.tooltip.broad}
            </p>
            <p className="text-slate-500">{component.tooltip.favors}</p>
            {component.tooltip.interactions?.map((t, i) => (
              <p key={i} className="rounded-lg bg-risk-warn px-2 py-1 text-xs text-risk-warnText">
                ⚠ {t}
              </p>
            ))}
            {interactions.map((i) => (
              <p
                key={i.id}
                className={`rounded-lg px-2 py-1 text-xs ${
                  i.severity === "danger"
                    ? "bg-risk-danger text-risk-dangerText"
                    : i.severity === "warn"
                      ? "bg-risk-warn text-risk-warnText"
                      : "bg-risk-info text-risk-infoText"
                }`}
              >
                {i.severity === "danger" ? "🛑" : i.severity === "warn" ? "⚠" : "ℹ"}{" "}
                <span className="font-medium">{i.title}:</span> {i.message}
              </p>
            ))}
          </div>
        </Tooltip>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          step={25}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: trackBg, width: "100%" }}
          aria-label={component.label}
        />
        <div className="mt-2 flex justify-between gap-3 text-[11px] leading-tight">
          <PoleLabel text={component.narrowLabel} favorable={favPole === "narrow"} align="left" />
          <PoleLabel text={component.broadLabel} favorable={favPole === "broad"} align="right" />
        </div>
      </div>
    </div>
  );
}

function PoleLabel({
  text,
  favorable,
  align,
}: {
  text: string;
  favorable: boolean;
  align: "left" | "right";
}) {
  return (
    <span
      className={`max-w-[46%] ${align === "right" ? "text-right" : "text-left"} ${
        favorable ? "font-semibold text-favor" : "text-slate-400"
      }`}
    >
      {favorable && <span className="mr-0.5">✓</span>}
      {text}
    </span>
  );
}

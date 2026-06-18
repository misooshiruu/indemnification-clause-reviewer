"use client";

import { CATEGORY_CHIP, COMPONENT_MAP } from "@/lib/components";
import type { EditState, EditStatus, SuggestedEdit } from "@/lib/types";

export function SuggestionPanel({
  edits,
  states,
  onSetStatus,
  onEditReplacement,
}: {
  edits: SuggestedEdit[];
  states: Record<string, EditState>;
  onSetStatus: (editId: string, status: EditStatus) => void;
  onEditReplacement: (editId: string, replacement: string) => void;
}) {
  if (edits.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
        No suggestions yet. Adjust the levers and click “Revise clause”.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {edits.map((edit) => {
        const state = states[edit.id];
        const status = state?.status ?? "pending";
        const replacement = state?.replacement ?? edit.replacement;
        const comp = COMPONENT_MAP[edit.componentId];
        const chip = comp ? CATEGORY_CHIP[comp.category] : null;

        return (
          <div
            key={edit.id}
            className={`rounded-2xl bg-white p-4 shadow-soft ring-1 transition ${
              status === "accepted"
                ? "ring-emerald-200"
                : status === "rejected"
                  ? "ring-rose-200 opacity-70"
                  : "ring-slate-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {chip && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.bg} ${chip.text}`}>
                    {comp?.label}
                  </span>
                )}
                <StatusBadge status={status} />
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">{edit.rationale}</p>

            <div className="mt-3 space-y-1 text-sm">
              <p className="rounded-lg bg-rose-50 px-2 py-1 text-rose-700 line-through decoration-rose-400">
                {edit.original}
              </p>
              <textarea
                value={replacement}
                onChange={(e) => onEditReplacement(edit.id, e.target.value)}
                rows={2}
                className="w-full resize-y rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800 outline-none ring-1 ring-transparent focus:ring-emerald-300"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onSetStatus(edit.id, "accepted")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  status === "accepted"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(edit.id, "rejected")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  status === "rejected"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                }`}
              >
                Reject
              </button>
              {status !== "pending" && (
                <button
                  type="button"
                  onClick={() => onSetStatus(edit.id, "pending")}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Tip: edit the green text above before accepting for “accept with edits”.
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: EditStatus }) {
  const map = {
    pending: { t: "Pending", c: "bg-amber-100 text-amber-700" },
    accepted: { t: "Accepted", c: "bg-emerald-100 text-emerald-700" },
    rejected: { t: "Rejected", c: "bg-rose-100 text-rose-700" },
  } as const;
  const s = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.c}`}>{s.t}</span>;
}

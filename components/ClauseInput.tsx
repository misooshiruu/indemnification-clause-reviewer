"use client";

import { SAMPLE_CLAUSE } from "@/lib/sample";

export function ClauseInput({
  clause,
  onChange,
  onReview,
  loading,
  disabled,
}: {
  clause: string;
  onChange: (v: string) => void;
  onReview: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Indemnification clause</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Paste the clause text. The reviewer maps it onto the levers below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_CLAUSE)}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-700"
        >
          Load sample
        </button>
      </div>

      <textarea
        value={clause}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder="Paste an indemnification clause here…"
        className="w-full resize-y rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-body outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
      />

      <button
        type="button"
        onClick={onReview}
        disabled={loading || disabled || !clause.trim()}
        className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Reviewing…" : "Review clause"}
      </button>
    </div>
  );
}

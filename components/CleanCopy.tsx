"use client";

import { useState } from "react";

export function CleanCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Clean copy</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Live result with accepted edits applied. Rejected and pending edits keep the
            original text.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-2xl bg-white p-4 text-sm leading-7 text-slate-body shadow-soft ring-1 ring-slate-100 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

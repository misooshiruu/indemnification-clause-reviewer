"use client";

import type { Segment } from "@/lib/redline";
import type { EditStatus } from "@/lib/types";

export function RedlineView({
  segments,
  onSetStatus,
}: {
  segments: Segment[];
  onSetStatus: (editId: string, status: EditStatus) => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-body">
      {segments.map((seg, i) => {
        if (seg.kind === "plain") {
          return <span key={i}>{seg.text}</span>;
        }

        const { edit, status, parts } = seg;

        // Resolved edits render their result inline (no strikethrough noise).
        if (status === "accepted") {
          return (
            <span key={i} className="redline-ins" title="Accepted">
              {seg.replacement}
            </span>
          );
        }
        if (status === "rejected") {
          return (
            <span key={i} title="Rejected">
              {seg.original}
            </span>
          );
        }

        // Pending: show word-level diff with inline accept/reject controls.
        return (
          <span key={i} className="relative inline">
            <span className="rounded bg-amber-50 px-0.5 ring-1 ring-amber-200">
              {parts.map((p, j) =>
                p.type === "del" ? (
                  <span key={j} className="redline-del">
                    {p.value}
                  </span>
                ) : p.type === "ins" ? (
                  <span key={j} className="redline-ins">
                    {p.value}
                  </span>
                ) : (
                  <span key={j}>{p.value}</span>
                ),
              )}
              <span className="ml-1 inline-flex gap-1 align-middle">
                <button
                  type="button"
                  onClick={() => onSetStatus(edit.id, "accepted")}
                  className="rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200"
                  title="Accept this edit"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => onSetStatus(edit.id, "rejected")}
                  className="rounded-full bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-200"
                  title="Reject this edit"
                >
                  ✕
                </button>
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";

// Lightweight hover/focus popover. Renders an info trigger; the panel appears on
// hover or keyboard focus and is positioned below the trigger.
export function Tooltip({
  trigger,
  children,
  width = 320,
}: {
  trigger: ReactNode;
  children: ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="More information"
        className="inline-flex items-center justify-center outline-none"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <span
          role="tooltip"
          style={{ width }}
          className="absolute left-0 top-full z-30 mt-2 rounded-2xl border border-slate-100 bg-white p-4 text-left text-sm leading-relaxed text-slate-body shadow-card"
        >
          {children}
        </span>
      )}
    </span>
  );
}

export function InfoDot() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 transition hover:bg-brand hover:text-white">
      i
    </span>
  );
}

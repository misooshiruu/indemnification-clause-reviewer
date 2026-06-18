"use client";

import type { PartyConfig, PartyId } from "@/lib/types";

export function PartySetup({
  party,
  onChange,
}: {
  party: PartyConfig;
  onChange: (p: PartyConfig) => void;
}) {
  const set = (patch: Partial<PartyConfig>) => onChange({ ...party, ...patch });
  const indemnitorId: PartyId = party.indemnitee === "A" ? "B" : "A";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Parties</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Name both parties, mark who gives indemnity, and pick the side you represent.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Party A</span>
          <input
            type="text"
            value={party.nameA}
            onChange={(e) => set({ nameA: e.target.value })}
            placeholder="e.g. Acme Corp"
            className="mt-1 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-brand"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Party B</span>
          <input
            type="text"
            value={party.nameB}
            onChange={(e) => set({ nameB: e.target.value })}
            placeholder="e.g. Vendor LLC"
            className="mt-1 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-brand"
          />
        </label>
      </div>

      <div>
        <span className="text-xs font-medium text-slate-500">
          Indemnitee (buyer / customer — the protected party)
        </span>
        <div className="mt-1 inline-flex w-full rounded-full bg-slate-100 p-1">
          {(["A", "B"] as PartyId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => set({ indemnitee: id })}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                party.indemnitee === id
                  ? "bg-white text-brand-600 shadow-soft"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {(id === "A" ? party.nameA : party.nameB) || `Party ${id}`}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          The other party (
          {(indemnitorId === "A" ? party.nameA : party.nameB) || `Party ${indemnitorId}`}) is
          the indemnitor / supplier.
        </p>
      </div>

      <div>
        <span className="text-xs font-medium text-slate-500">I represent</span>
        <div className="mt-1 inline-flex w-full rounded-full bg-slate-100 p-1">
          {(["A", "B"] as PartyId[]).map((id) => {
            const isIndemnitee = party.indemnitee === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => set({ side: id })}
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  party.side === id
                    ? "bg-brand text-white shadow-soft"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {(id === "A" ? party.nameA : party.nameB) || `Party ${id}`}
                <span className="ml-1 text-[10px] opacity-70">
                  ({isIndemnitee ? "indemnitee" : "indemnitor"})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

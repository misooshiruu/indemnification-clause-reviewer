import { diffWords } from "diff";
import type { EditState, SuggestedEdit } from "./types";

export interface Placement {
  edit: SuggestedEdit;
  start: number;
  end: number; // exclusive
}

// Locate each edit's `original` substring in the clause, using contextBefore to
// disambiguate duplicates. Returns non-overlapping placements in document order.
// Edits whose text cannot be found (or that overlap an earlier placement) are
// dropped so rendering stays consistent.
export function placeEdits(clause: string, edits: SuggestedEdit[]): Placement[] {
  const placements: Placement[] = [];

  for (const edit of edits) {
    const start = locate(clause, edit, placements);
    if (start === -1) continue;
    const end = start + edit.original.length;
    if (placements.some((p) => start < p.end && end > p.start)) continue; // overlap
    placements.push({ edit, start, end });
  }

  return placements.sort((a, b) => a.start - b.start);
}

function locate(clause: string, edit: SuggestedEdit, taken: Placement[]): number {
  const isFree = (idx: number) =>
    idx !== -1 &&
    !taken.some((p) => idx < p.end && idx + edit.original.length > p.start);

  // Prefer an occurrence that follows the provided context.
  if (edit.contextBefore) {
    const combined = edit.contextBefore + edit.original;
    let from = 0;
    while (true) {
      const ctxIdx = clause.indexOf(combined, from);
      if (ctxIdx === -1) break;
      const origIdx = ctxIdx + edit.contextBefore.length;
      if (isFree(origIdx)) return origIdx;
      from = ctxIdx + 1;
    }
  }

  // Fall back to the first free plain occurrence.
  let from = 0;
  while (true) {
    const idx = clause.indexOf(edit.original, from);
    if (idx === -1) return -1;
    if (isFree(idx)) return idx;
    from = idx + 1;
  }
}

// ---- Inline rendering segments ----

export type DiffPart = { value: string; type: "same" | "del" | "ins" };

export type Segment =
  | { kind: "plain"; text: string }
  | {
      kind: "edit";
      edit: SuggestedEdit;
      status: EditState["status"];
      // word-level diff between original and the (possibly edited) replacement
      parts: DiffPart[];
      original: string;
      replacement: string;
    };

export function buildSegments(
  clause: string,
  placements: Placement[],
  states: Record<string, EditState>,
): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  for (const p of placements) {
    if (p.start > cursor) {
      segments.push({ kind: "plain", text: clause.slice(cursor, p.start) });
    }
    const state = states[p.edit.id];
    const replacement = state?.replacement ?? p.edit.replacement;
    const status = state?.status ?? "pending";
    const parts: DiffPart[] = diffWords(p.edit.original, replacement).map((d) => ({
      value: d.value,
      type: d.added ? "ins" : d.removed ? "del" : "same",
    }));
    segments.push({
      kind: "edit",
      edit: p.edit,
      status,
      parts,
      original: p.edit.original,
      replacement,
    });
    cursor = p.end;
  }

  if (cursor < clause.length) {
    segments.push({ kind: "plain", text: clause.slice(cursor) });
  }

  return segments;
}

// The current clean clause: apply accepted replacements, keep original text for
// rejected and still-pending edits.
export function buildCleanText(
  clause: string,
  placements: Placement[],
  states: Record<string, EditState>,
): string {
  let out = "";
  let cursor = 0;
  for (const p of placements) {
    out += clause.slice(cursor, p.start);
    const state = states[p.edit.id];
    if (state?.status === "accepted") {
      out += state.replacement ?? p.edit.replacement;
    } else {
      out += p.edit.original;
    }
    cursor = p.end;
  }
  out += clause.slice(cursor);
  return out;
}

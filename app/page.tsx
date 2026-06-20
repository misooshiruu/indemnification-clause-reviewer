"use client";

import { useMemo, useState } from "react";
import { BackendToggle } from "@/components/BackendToggle";
import { ClauseInput } from "@/components/ClauseInput";
import { CleanCopy } from "@/components/CleanCopy";
import { PartySetup } from "@/components/PartySetup";
import { RedlineView } from "@/components/RedlineView";
import { SliderPanel } from "@/components/SliderPanel";
import { SuggestionPanel } from "@/components/SuggestionPanel";
import { COMPONENTS } from "@/lib/components";
import { computeInteractions } from "@/lib/interactions";
import { buildCleanText, buildSegments, placeEdits } from "@/lib/redline";
import type {
  AnalyzeResult,
  BackendConfig,
  ComponentId,
  EditState,
  EditStatus,
  PartyConfig,
  Positions,
  SuggestedEdit,
} from "@/lib/types";

const DEFAULT_POSITIONS = COMPONENTS.reduce((acc, c) => {
  acc[c.id] = 50;
  return acc;
}, {} as Positions);

export default function Home() {
  const [backend, setBackend] = useState<BackendConfig>({
    mode: "cloud",
    provider: "anthropic",
  });
  const [party, setParty] = useState<PartyConfig>({
    nameA: "",
    nameB: "",
    indemnitee: "A",
    side: "A",
  });

  const [clause, setClause] = useState("");
  const [reviewedClause, setReviewedClause] = useState("");

  const [positions, setPositions] = useState<Positions>(DEFAULT_POSITIONS);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);

  const [edits, setEdits] = useState<SuggestedEdit[]>([]);
  const [editStates, setEditStates] = useState<Record<string, EditState>>({});

  // The positions revise should diff against. Starts at the analyzed baseline
  // and advances to the slider positions after each Revise, so a second pass
  // only redlines the levers moved SINCE the last pass (not every lever that
  // still differs from the original analysis).
  const [reviseBaseline, setReviseBaseline] = useState<Positions>(DEFAULT_POSITIONS);

  const [analyzing, setAnalyzing] = useState(false);
  const [revising, setRevising] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIsIndemnitee = party.side === party.indemnitee;

  // Risk flags describe the clause AS REVIEWED, so they are computed from the
  // analyzed positions — not the editable target sliders. Adjusting a lever
  // sets a redline target; it must not invent or clear a conflict.
  const interactions = useMemo(() => {
    if (!analysis) return [];
    // A risk only surfaces for the side it actually threatens. Showing the
    // indemnitor's risks to the indemnitee (and vice versa) is noise — from the
    // other side the same fact is leverage, not a warning.
    return computeInteractions(analysis.positions, analysis.riskFactors).filter(
      (i) =>
        i.audience === "both" ||
        (i.audience === "indemnitee") === userIsIndemnitee,
    );
  }, [analysis, userIsIndemnitee]);

  // Redline derivations use the clause that was reviewed (so later textarea
  // edits don't desync from generated edits).
  const placements = useMemo(
    () => placeEdits(reviewedClause, edits),
    [reviewedClause, edits],
  );
  const segments = useMemo(
    () => buildSegments(reviewedClause, placements, editStates),
    [reviewedClause, placements, editStates],
  );
  const cleanText = useMemo(
    () => buildCleanText(reviewedClause, placements, editStates),
    [reviewedClause, placements, editStates],
  );

  async function handleReview() {
    setError(null);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clause, party, backend }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      const result = data as AnalyzeResult;
      setAnalysis(result);
      setPositions(result.positions);
      setReviewedClause(clause);
      // Reset any prior revision.
      setEdits([]);
      setEditStates({});
      setReviseBaseline(result.positions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRevise() {
    if (!analysis) return;
    // Revise acts on the DELTA between the last-revised baseline and the slider
    // targets, so a repeat pass only redlines the levers moved since the prior
    // pass. If nothing was moved, there is no redline to make.
    const moved = COMPONENTS.some((c) => positions[c.id] !== reviseBaseline[c.id]);
    if (!moved) {
      setError("Adjust at least one lever away from its current position, then generate redlines.");
      return;
    }
    setError(null);
    setRevising(true);
    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clause: reviewedClause,
          party,
          baseline: reviseBaseline,
          positions,
          backend,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revision failed.");
      const result = data as { edits: SuggestedEdit[] };
      // Merge onto the existing edits so a repeat pass builds on the prior one
      // instead of discarding it. Re-key incoming edits to stay unique.
      const offset = edits.length;
      const incoming = result.edits.map((e, i) => ({ ...e, id: `edit-${offset + i}` }));
      setEdits((prev) => [...prev, ...incoming]);
      setEditStates((prev) => {
        const next = { ...prev };
        for (const e of incoming) {
          next[e.id] = { status: "pending", replacement: e.replacement };
        }
        return next;
      });
      setReviseBaseline({ ...positions });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revision failed.");
    } finally {
      setRevising(false);
    }
  }

  async function handleExportDocx() {
    setError(null);
    setExporting(true);
    try {
      const { buildRedlineDocx } = await import("@/lib/docx");
      const userName = party.side === "A" ? party.nameA : party.nameB;
      const blob = await buildRedlineDocx(segments, editStates, {
        author: userName || "Indemnification Clause Reviewer",
        title: "Indemnification Clause — Proposed Redlines",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indemnification-redlines.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const setStatus = (editId: string, status: EditStatus) =>
    setEditStates((prev) => ({
      ...prev,
      [editId]: {
        status,
        replacement: prev[editId]?.replacement ?? "",
      },
    }));

  const setReplacement = (editId: string, replacement: string) =>
    setEditStates((prev) => ({
      ...prev,
      [editId]: { status: prev[editId]?.status ?? "pending", replacement },
    }));

  const onSliderChange = (id: ComponentId, value: number) =>
    setPositions((prev) => ({ ...prev, [id]: value }));

  const partyConfigured = Boolean(party.nameA.trim() && party.nameB.trim());

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Indemnification Clause Reviewer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste a clause, pick your side, see where it sits, and generate track-changes
          redlines that move it your way.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl bg-risk-danger px-4 py-3 text-sm text-risk-dangerText">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Setup */}
        <section className="grid grid-cols-1 gap-6 rounded-card bg-white p-6 shadow-card md:grid-cols-2">
          <PartySetup party={party} onChange={setParty} />
          <BackendToggle config={backend} onChange={setBackend} />
        </section>

        {/* Clause input */}
        <section className="rounded-card bg-white p-6 shadow-card">
          <ClauseInput
            clause={clause}
            onChange={setClause}
            onReview={handleReview}
            loading={analyzing}
            disabled={!partyConfigured}
          />
          {!partyConfigured && (
            <p className="mt-2 text-xs text-amber-600">Name both parties above to begin.</p>
          )}
        </section>

        {/* Levers */}
        {analysis && (
          <section className="rounded-card bg-white p-6 shadow-card">
            {analysis.notes && (
              <p className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {analysis.notes}
              </p>
            )}
            <SliderPanel
              positions={positions}
              userIsIndemnitee={userIsIndemnitee}
              interactions={interactions}
              onChange={onSliderChange}
              onRevise={handleRevise}
              loading={revising}
              disabled={!reviewedClause}
            />
          </section>
        )}

        {/* Redlines */}
        {edits.length > 0 && (
          <section className="rounded-card bg-white p-6 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Suggested redlines</h3>
            {edits.length > placements.length && (
              <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {edits.length - placements.length} of {edits.length} suggestion
                {edits.length - placements.length === 1 ? "" : "s"} couldn&apos;t be placed in
                the clause text (the model&apos;s quoted text didn&apos;t match, or it overlapped
                another edit) and {edits.length - placements.length === 1 ? "was" : "were"} skipped.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-slate-400">Track changes</p>
                <RedlineView segments={segments} onSetStatus={setStatus} />
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-400">
                  Suggestions ({edits.length})
                </p>
                <SuggestionPanel
                  edits={edits}
                  states={editStates}
                  onSetStatus={setStatus}
                  onEditReplacement={setReplacement}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <CleanCopy text={cleanText} />
              <div>
                <button
                  type="button"
                  onClick={handleExportDocx}
                  disabled={exporting}
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-900 disabled:opacity-50"
                >
                  {exporting ? "Exporting…" : "Export track-changes .docx"}
                </button>
                <p className="mt-1 text-xs text-slate-400">
                  Opens in Word with accepted and pending edits as real tracked changes you
                  can accept or reject. Rejected edits are dropped.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

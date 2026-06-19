# PRD — Indemnification Clause Reviewer

## Vision
A web app that lets an in-house lawyer paste an indemnification clause, pick the side they
represent, and instantly see where the clause sits across the standard indemnity levers —
then generate track-changes redlines that move the clause in their favor, accepting or
rejecting each edit and exporting a clean copy.

## Milestones

### Milestone 1: Working MVP prototype — [STATUS: Done]
End-to-end review flow with LLM backend toggle.
Key requirements:
- Party setup (name A/B, assign indemnitee/indemnitor, pick side).
- 10 indemnity sliders with side-dependent green favorable end.
- Hover tooltips per lever (what / both poles / who it favors) + cross-component risk flags.
- Analyze (clause → slider positions + risk factors) and Revise (sliders → redlines).
- Track-changes redlines: accept / reject / accept-with-edits + live clean copy.
- LLM backend toggle: BYO cloud key (Anthropic / OpenAI / Gemini) or local Ollama.
- `npm install && npm run dev`, Tailwind SaaS-dashboard styling, README.

### Milestone 2: Word track-changes export — [STATUS: Done]
Export the reviewed clause as a `.docx` with real Word tracked changes.
Key requirements:
- "Export track-changes .docx" button in the redlines section.
- Accepted + pending edits become `w:ins`/`w:del` revisions; rejected edits drop to original.
- Reuses the existing redline `Segment[]` (word-level); runs client-side via `docx` + Packer.

## Current Milestone Notes
Milestone 1 is complete: production build, typecheck, and pure-logic checks pass; UI
renders and handles the no-backend error path gracefully.

End-to-end verified against local Ollama (`qwen2.5:14b`) on 2026-06-18: `/api/analyze`
read the sample clause as heavily pro-supplier (sensible narrow positions); `/api/revise`
returned 8 well-anchored edits that correctly move every lever toward the customer side.
Prompt quality is good. Minor model-quality wobbles observed (e.g. occasionally misjudges
`indemnityExcludedFromCap`, leaves slightly awkward phrasing after a deletion) — acceptable
for the MVP and not code defects.

Quality pass (2026-06-18): implemented three fixes and re-ran the 15-sample harness against
`qwen2.5:14b`. (1) Dropped/unplaceable edits are now surfaced in the UI as a banner instead of
silently vanishing. (2) De-biased the analyze risk factors — the flagship cap-swallow miss
(sample 6) is now correctly flagged (`hasSeparateLoLCap` true, `indemnityExcludedFromCap` false),
and `indemnityExcludedFromCap` false-positives dropped from 8/15 to 4/15. (3) Tightened the revise
prompt (no overlaps, whole-word `original`, `contextBefore` must precede). Direction quality stays
strong (~15/15 correct). Anchoring discipline — overlapping spans and `contextBefore` that includes
trailing text — is still violated by the 14B model fairly often; the new banner catches the
fallout. This is the main argument for running a frontier cloud model (Sonnet/Opus) for higher-stakes
use; the backend already supports it.

Milestone 2 (Word export) verified: a synthetic redline produced a valid `.docx` with real
tracked-changes markup (`w:ins`/`w:del`, `w:delText`, author attribution). Opening/rendering in
Word itself is the one check that must be done manually (no Word in this environment).

Known follow-ups / open items:
- Next.js pinned to 14.2.35; remaining `npm audit` findings need a breaking Next 16 bump.
- `qwen2.5:14b` still emits overlapping/duplicate anchors and over-long `contextBefore`; a stronger
  model (or post-processing to split/repair anchors) would raise the placement rate.
- Manual check: open an exported `.docx` in Word and confirm tracked changes render + accept/reject.

## Out of Scope
- Persistence / accounts / saved matters (no database).
- Multi-clause or full-contract review (single indemnification clause only).
- Legal advice or jurisdiction-specific validation — this is a drafting aid, not counsel.

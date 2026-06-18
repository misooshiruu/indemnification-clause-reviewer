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
- 9 indemnity sliders with side-dependent green favorable end.
- Hover tooltips per lever (what / both poles / who it favors) + cross-component risk flags.
- Analyze (clause → slider positions + risk factors) and Revise (sliders → redlines).
- Track-changes redlines: accept / reject / accept-with-edits + live clean copy.
- LLM backend toggle: BYO cloud key (Anthropic / OpenAI / Gemini) or local Ollama.
- `npm install && npm run dev`, Tailwind SaaS-dashboard styling, README.

## Current Milestone Notes
Milestone 1 is complete: production build, typecheck, and pure-logic checks pass; UI
renders and handles the no-backend error path gracefully.

End-to-end verified against local Ollama (`qwen2.5:14b`) on 2026-06-18: `/api/analyze`
read the sample clause as heavily pro-supplier (sensible narrow positions); `/api/revise`
returned 8 well-anchored edits that correctly move every lever toward the customer side.
Prompt quality is good. Minor model-quality wobbles observed (e.g. occasionally misjudges
`indemnityExcludedFromCap`, leaves slightly awkward phrasing after a deletion) — acceptable
for the MVP and not code defects.

Known follow-ups / open items:
- Next.js pinned to 14.2.35; remaining `npm audit` findings need a breaking Next 16 bump.
- Redline anchoring relies on the model returning `original` verbatim; mismatched edits are
  silently dropped — worth surfacing a "couldn't place N suggestions" note if it happens.

## Out of Scope
- Persistence / accounts / saved matters (no database).
- Multi-clause or full-contract review (single indemnification clause only).
- Legal advice or jurisdiction-specific validation — this is a drafting aid, not counsel.

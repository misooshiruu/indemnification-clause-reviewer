# Architecture

## System Overview
A single-page Next.js (App Router) web app that helps an in-house lawyer review and
rebalance an indemnification clause. The user pastes a clause, names the two parties and
picks a side, the app analyzes the clause into 9 indemnity "levers" (sliders), explains
each and flags cross-lever risks, then generates track-changes redlines that the user can
accept/reject/accept-with-edits, with a live clean copy to export. No database. LLM work
runs through server API routes that fan out to a configurable backend (BYO cloud key or
local Ollama).

## Project Structure
```
app/
  layout.tsx                 # Inter font, base background
  globals.css                # Tailwind layers + redline/range-slider styles
  page.tsx                   # dashboard; holds all client state and the review flow
  api/analyze/route.ts       # POST clause+party+backend -> positions + riskFactors
  api/revise/route.ts        # POST clause+positions+party+backend -> suggested edits
components/
  BackendToggle.tsx          # cloud(provider/key/model) vs Ollama(url/model) toggle
  PartySetup.tsx             # name A/B, assign indemnitee role, pick side
  ClauseInput.tsx            # textarea + Review button + "Load sample"
  SliderPanel.tsx            # renders the 9 ComponentSliders + Revise button
  ComponentSlider.tsx        # one lever; green-tinted favorable end; tooltip; risk dot
  Tooltip.tsx                # hover/focus popover primitive (+ InfoDot)
  InteractionBadges.tsx      # summary risk signals
  RedlineView.tsx            # inline track-changes rendering + inline accept/reject
  SuggestionPanel.tsx        # per-edit list w/ rationale + accept/reject/accept-with-edits
  CleanCopy.tsx              # live accepted-clause text + copy button
lib/
  types.ts                   # shared types
  components.ts              # the 9-lever config + favorablePole() + category chips
  interactions.ts            # cross-component risk rules (pure function)
  redline.ts                 # locate edits, build segments, derive clean copy
  sample.ts                  # demo clause
  llm/index.ts               # backend dispatch + JSON parsing/validation
  llm/prompts.ts             # analyze + revise prompt builders
  llm/{anthropic,openai,gemini,ollama}.ts  # per-provider fetch adapters
```

## Design Decisions
- **[2026-06-18] LLM backend = toggle between BYO cloud key and local Ollama.**
  **Context**: MVP needs to run without forcing a paid key, but also support higher-quality
  cloud models. Cloud provider is selectable (Anthropic / OpenAI / Gemini). A deterministic
  heuristic engine was considered and rejected in favor of real LLM analysis.
  **Consequence**: The app requires either a key or a running Ollama to do analyze/revise;
  there is no offline fallback. Error paths surface clear "configure a backend" messages.
- **[2026-06-18] Keys flow through server API routes, never stored.**
  **Context**: Avoid exposing keys in the client bundle and avoid CORS to provider APIs.
  **Consequence**: `/api/analyze` and `/api/revise` accept the backend config per-request
  and forward it; nothing is persisted or logged. Ollama is reached from the Next server,
  so Ollama mode requires running the app locally.
- **[2026-06-18] Revise returns structured find/replace edits, not a full rewrite.**
  **Context**: Each redline needs an independent accept/reject and a rationale.
  **Consequence**: Edits carry `original` + `contextBefore` for anchoring; `lib/redline.ts`
  locates them, builds word-level diffs (jsdiff), and derives the clean copy. Edits whose
  `original` is not found verbatim are dropped server-side.
- **[2026-06-18] Slider favorability flips with the represented side.**
  **Context**: The green/favorable end must reflect whose side the user is on. Mutuality is
  the special case ("more obligation on the OTHER party").
  **Consequence**: `favorablePole()` derives the green end from `indemniteePole` + whether
  the user is the indemnitee; mutuality uses `indemniteePole: "narrow"` so the standard flip
  yields the correct result.

## Infrastructure
- **Stack**: Next.js 14.2.35 (App Router), React 18, TypeScript, Tailwind CSS 3, `diff`.
- **Run**: `npm install && npm run dev` → http://localhost:3000.
- **Env**: none required. `.env.example` documents an optional `OLLAMA_URL` default; API
  keys are entered in the UI.
- **Deploy**: Vercel-ready. Cloud backends work on Vercel; Ollama mode requires local run.
- **Security note**: still pinned to Next 14.2.35; `npm audit` flags issues that only
  resolve via a breaking Next 16 upgrade — deferred for the MVP.

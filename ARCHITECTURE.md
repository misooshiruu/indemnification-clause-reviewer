# Architecture

## System Overview
A single-page Next.js (App Router) web app that helps an in-house lawyer review and
rebalance an indemnification clause. The user pastes a clause, names the two parties and
picks a side, the app analyzes the clause into 10 indemnity "levers" (sliders), explains
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
  api/models/route.ts        # POST backend -> live model ids for that provider
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
  models.ts                  # per-provider selectable model lists + defaults
  components.ts              # the 10-lever config + favorablePole() + category chips
  interactions.ts            # cross-component risk rules (pure function)
  redline.ts                 # locate edits, build segments, derive clean copy
  docx.ts                    # build a Word track-changes .docx from segments
  sample.ts                  # demo clause
  llm/index.ts               # backend dispatch + JSON parsing/validation
  llm/errors.ts              # map provider HTTP/network failures to clear messages
  llm/listModels.ts          # fetch available model ids per provider / Ollama
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

- **[2026-06-18] Word export reuses the on-screen redline segments, generated client-side.**
  **Context**: Lawyers review in Word. Rather than adopt a heavyweight doc-editor (e.g.
  safe-docx, which is MCP/stdio-first and whole-document oriented) we reuse the `Segment[]`
  the UI already builds (with word-level diff parts) and emit OOXML with the `docx` package.
  **Consequence**: `lib/docx.ts` maps plain/ins/del parts to `TextRun`/`InsertedTextRun`/
  `DeletedTextRun`; accepted + pending edits become real `w:ins`/`w:del` tracked changes,
  rejected edits collapse to original text. Runs in the browser via `Packer.toBlob` (no API
  route); `docx` is dynamically imported so it stays out of the main bundle.

- **[2026-06-18] Model picker is a per-provider dropdown; backend failures surface as
  plain-language messages.**
  **Context**: Typing a model name was error-prone, and raw provider error dumps (or a dead
  Ollama) were confusing. **Consequence**: `lib/models.ts` defines selectable models per
  provider (first = default); `BackendToggle` shows a `<select>` below the provider row and
  defaults the model on provider change. `lib/llm/errors.ts` maps HTTP status + the provider's
  own message (and network throws) to actionable text — bad key, model-not-found, rate limit,
  Ollama-not-running, model-not-pulled. Gemini returns 400 for a bad key, so the helper also
  sniffs the message body for key/auth phrasing regardless of status. Errors propagate through
  the API routes' `{error}` JSON to the existing red banner; nothing throws uncaught to the UI.
- **[2026-06-19] Model dropdown is populated live from the provider, not hardcoded.**
  **Context**: A hardcoded list went stale (e.g. `gemini-2.0-flash` was retired and 404'd).
  **Consequence**: `lib/llm/listModels.ts` + `POST /api/models` fetch the provider's own model
  list (Anthropic/OpenAI/Gemini list endpoints, or Ollama `/api/tags`) using the entered key,
  filtered to text-generation-capable models. `BackendToggle` fetches this (debounced) once a
  provider + key are present, snaps the selection to a valid model if the current one isn't
  offered, and falls back to the static `lib/models.ts` list (shown before a key is entered or
  if the fetch fails). The static list is now just an initial placeholder, not the source of truth.

- **[2026-06-19] Carve-outs promoted to a 10th lever; the two carve-out booleans removed.**
  **Context**: Whether the cap and consequential-damages waiver actually REACH the indemnity is
  the most-negotiated axis in the LoL/indemnity interplay, but it was invisible as a control —
  it lived only as the `indemnityExcludedFromCap` and `consequentialWaiverExcludesIndemnity`
  risk-factor booleans, so the user couldn't target it in a redline. It is also genuinely
  distinct from `cap` (how high the ceiling is vs. whether it applies at all). **Consequence**:
  Added a `carveouts` component (money category, `indemniteePole: "broad"`, placed after `cap`)
  whose narrow pole = indemnity fully subject to the limits, broad = indemnity carved out /
  uncapped. The two booleans were dropped from `RiskFactors`; interaction rules 1 (cap-swallow)
  and 5 (consequential-waiver conflict) now read `!isBroad(positions.carveouts)` instead, so a
  partial/silent carve-out (50) still flags. `RiskFactors` keeps only `hasSeparateLoLCap`,
  `hasConsequentialWaiver`, `inCumulativeRemediesClause`. This supersedes the carve-out handling
  in the two entries below.
- **[2026-06-19] Sliders are a 5-stop scale (0/25/50/75/100) scored by legal effect.**
  **Context**: A continuous 0-100 slider implied precision the system never used — risk rules
  only bucketed at two thresholds and revise treated it as 3 qualitative leans, so "the lever
  was a 3-state control wearing a 101-state costume." Separately, analyze was scoring textual
  strength rather than substantive balance. **Consequence**: `ComponentSlider` snaps at
  `step={25}`; `clamp()` in `lib/llm/index.ts` rounds analyze output to the nearest 25 so
  everything stays on-grid; interaction thresholds are `NARROW=25`/`BROAD=75` (50 = balanced,
  triggers no positional rule). The analyze prompt now asks for exactly one of 0/25/50/75/100
  and scores by NET LEGAL EFFECT and the parties' relative positions (carve-outs, caps,
  enforceability, custom) rather than how forcefully the text reads. The revise prompt maps the
  5 bands and treats the target value as the desired edit INTENSITY. The demo `sample.ts` was
  replaced with a realistic SaaS §10-11 clause (IP indemnity + separate cap + consequential
  waiver + §11.3 carve-outs), enriched at §10.4 (min license-efforts + wind-down) and §11.3
  (conditioned security carve-out + re-performance sole remedy for Professional Services).
- **[2026-06-19] Consequential-waiver conflict respects an indemnity carve-out.**
  **Context**: A clause whose limitation-of-liability section carves indemnification
  obligations OUT of the consequential-damages waiver (e.g. "these limitations will not
  apply to indemnification obligations") was wrongly flagged as a "conflict with
  consequential-damages waiver" — there is no conflict because the waiver doesn't reach the
  indemnity. **Consequence**: Added `consequentialWaiverExcludesIndemnity` to `RiskFactors`
  (analyze prompt detects it, mirroring `indemnityExcludedFromCap`); interaction rule 5 now
  requires `hasConsequentialWaiver && !consequentialWaiverExcludesIndemnity`. The waiver must
  actually bind the indemnity for the conflict to surface.
- **[2026-06-19] Revise is delta-driven (analyzed baseline → slider target), not absolute.**
  **Context**: Revise only received the target positions and treated each as an absolute
  pole INTENSITY ("push fully to 100"). With sliders left at their analyzed spots, it pushed
  every lever harder toward its current pole — e.g. it made an already-uncapped clause *more*
  uncapped, the wrong direction for the indemnitor whose green/favorable end is the opposite
  pole. **Consequence**: `revise()` now takes both `baseline` (the analyzed positions) and the
  `target` (slider) positions; the API route and `app/page.tsx` forward `analysis.positions`
  as the baseline. The prompt lists ONLY the levers whose target differs from the baseline and
  frames each as "currently reads X → move toward Y", forbidding edits to unchanged levers.
  `revise()` short-circuits to `{ edits: [] }` when nothing moved, and the page guards the
  Revise button with a "adjust a lever first" message instead of calling the model. Rationales
  are sanitized (`cleanRationale`) to strip leaked internal field ids and `N/100` slider scores,
  and the revise prompt now feeds the model human labels + band words only (no ids, no numbers).

## Infrastructure
- **Stack**: Next.js 14.2.35 (App Router), React 18, TypeScript, Tailwind CSS 3, `diff`.
- **Run**: `npm install && npm run dev` → http://localhost:3000.
- **Env**: none required. `.env.example` documents an optional `OLLAMA_URL` default; API
  keys are entered in the UI.
- **Deploy**: Vercel-ready. Cloud backends work on Vercel; Ollama mode requires local run.
- **Security note**: still pinned to Next 14.2.35; `npm audit` flags issues that only
  resolve via a breaking Next 16 upgrade — deferred for the MVP.

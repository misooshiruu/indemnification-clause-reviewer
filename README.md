# Indemnification Clause Reviewer

An MVP web app that helps an in-house lawyer review and rebalance an indemnification
clause. Paste a clause, name the two parties and pick your side, and the app:

1. **Analyzes** the clause into 9 standard indemnity levers, shown as sliders that run
   from *narrow / pro-provider* to *broad / pro-customer*. The favorable end is tinted
   green for the side you represent — and the green end flips when you switch sides.
2. **Explains** every lever with a hover tooltip (what it is, what each pole means, who
   it favors) and flags cross-lever risks (cap swallowing indemnity, uncapped
   consequential damages, exclusive-remedy gaps, etc.) with colored signals.
3. **Redlines** the clause toward your slider settings as track-changes edits you can
   **accept / reject / accept-with-edits** individually, with a live clean copy to export.

## Quick start

```bash
npm install && npm run dev
```

Open http://localhost:3000.

## Choosing an LLM backend

The app needs an LLM to analyze clauses and generate redlines. Pick one in the UI
(top-right card). Keys are kept in the browser and sent only with each request — they are
never stored on the server.

- **Cloud (BYO key)** — choose Anthropic, OpenAI, or Gemini, paste your API key, and
  optionally set a model (defaults: `claude-sonnet-4-6`, `gpt-4o`, `gemini-1.5-flash`).
- **Local (Ollama)** — run [Ollama](https://ollama.com) locally (`ollama serve`), pull a
  model (e.g. `ollama pull llama3.1`), then enter the model name. Default URL is
  `http://localhost:11434`.

## Try it

1. Name Party A and Party B (e.g. *Acme Corp* and *Vendor LLC*).
2. Mark which party is the indemnitee (buyer/customer) and pick your side.
3. Click **Load sample** for a one-sided supplier-favorable clause, or paste your own.
4. Click **Review clause** — the sliders populate and risk badges appear.
5. Drag sliders toward your target, then click **Revise clause**.
6. Accept/reject each redline; copy the clean result.

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS.
- No database. LLM calls go through `/api/analyze` and `/api/revise` to keep keys off the
  client bundle and avoid CORS.
- Deployable to Vercel as-is (`vercel` / connect the repo). For Ollama you must run the
  app locally so the server can reach `localhost`.

## Project layout

- `lib/components.ts` — the 10-lever config (labels, poles, tooltips, favorability).
- `lib/interactions.ts` — cross-component risk rules.
- `lib/llm/*` — backend dispatch + per-provider adapters + prompts.
- `lib/redline.ts` — locate edits, build track-changes segments, derive clean copy.
- `components/*` — UI (party setup, backend toggle, sliders, redline view, suggestions).
- `app/page.tsx` — the dashboard wiring it together.

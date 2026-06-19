# Indemnification Clause Reviewer

An MVP web app that helps an in-house lawyer review and rebalance an indemnification
clause. Paste a clause, name the two parties and pick your side, and the app:

1. **Analyzes** the clause into 10 standard indemnity levers, shown as sliders that run
   from *narrow / pro-provider* to *broad / pro-customer*. The favorable end is tinted
   green for the side you represent — and the green end flips when you switch sides.
2. **Explains** every lever with a hover tooltip (what it is, what each pole means, who
   it favors) and flags cross-lever risks (cap swallowing indemnity, uncapped
   consequential damages, exclusive-remedy gaps, etc.) with colored signals.
3. **Redlines** the clause toward your slider settings as track-changes edits you can
   **accept / reject / accept-with-edits** individually, with a live clean copy and a
   Word (`.docx`) export of the tracked changes.

## Quick start

```bash
npm install
cp .env.example .env      # then add at least one API key (see below)
npm run dev
```

Open http://localhost:3000.

## Configuring an LLM backend

The app needs an LLM to analyze clauses and generate redlines. Pick one in the UI
(Setup card, right side).

### Cloud (Anthropic / OpenAI / Gemini)

API keys are read from the **server environment**, never typed into the app or sent from
the browser. Put the key(s) for the provider you want in a `.env` (or `.env.local`) file
in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

Restart the dev server after editing `.env`. In the UI, pick the provider — it shows
**"Key loaded from .env"** when a key is present (and tells you the exact variable to add
if it's missing), then lets you choose a model. Defaults: `claude-sonnet-4-6`, `gpt-4o`,
`gemini-2.5-flash`.

> `.env` and `.env*.local` are gitignored, so your keys never get committed.

### Local (Ollama)

Run [Ollama](https://ollama.com) locally (`ollama serve`), pull a model
(e.g. `ollama pull qwen2.5:14b`), then enter the model name in the UI. Default URL is
`http://localhost:11434`. No key needed.

## Sample clauses

Ready-to-paste test clauses live in **[`samples/clauses.md`](samples/clauses.md)** — open
the file, copy the text inside any code block, and paste it into the clause box. Each
sample notes a suggested party setup and what it's good for testing (separate-cap with
carve-outs, a mutual indemnity, a broad uncapped indemnity, a terse one-liner, and a
non-indemnity negative control). The UI's **Load sample** button loads the first one.

## Try it

1. Name Party A and Party B (e.g. *Acme Corp* and *Vendor LLC*).
2. Mark which party is the indemnitee (buyer/customer) and pick your side.
3. Click **Load sample**, or copy a clause from `samples/clauses.md`, or paste your own.
4. Click **Review clause** — the sliders populate and risk badges appear.
5. Drag sliders toward your target, then click **Revise clause**.
6. Accept/reject each redline; copy the clean result or export a tracked-changes `.docx`.

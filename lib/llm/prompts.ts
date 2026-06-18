import { COMPONENTS } from "../components";
import type { ComponentConfig, PartyConfig, Positions } from "../types";

function partyDescription(p: PartyConfig): string {
  const indemniteeName = p.indemnitee === "A" ? p.nameA : p.nameB;
  const indemnitorName = p.indemnitee === "A" ? p.nameB : p.nameA;
  const userName = p.side === "A" ? p.nameA : p.nameB;
  const userRole =
    p.side === p.indemnitee ? "indemnitee (protected party)" : "indemnitor (party giving indemnity)";
  return [
    `Party A: ${p.nameA}`,
    `Party B: ${p.nameB}`,
    `Indemnitee (buyer/customer, the protected party): ${indemniteeName}`,
    `Indemnitor (supplier/service provider, gives indemnity): ${indemnitorName}`,
    `You are advising: ${userName}, who is the ${userRole}.`,
  ].join("\n");
}

function componentLegend(): string {
  return COMPONENTS.map((c: ComponentConfig) => {
    return `- ${c.id} (${c.label}): 0 = narrow pole [${c.narrowLabel}]; 100 = broad pole [${c.broadLabel}]. ${c.tooltip.what}`;
  }).join("\n");
}

export function buildAnalyzePrompt(clause: string, party: PartyConfig): string {
  return `You are an experienced contracts attorney analyzing an indemnification clause.

PARTIES
${partyDescription(party)}

TASK
Read the clause below and estimate, for each component, where the CURRENT drafting sits on a 0-100 scale, where 0 is the narrow pole and 100 is the broad pole. Use the legend.

COMPONENTS
${componentLegend()}

Also detect these risk factors. Be CONSERVATIVE: only set a factor true when the text contains explicit language supporting it. When in doubt, return false. Distinguish carefully between "the indemnity IS subject to / capped by a limit" (which is NOT a carve-out) and "the indemnity is EXCLUDED FROM / not subject to the cap" (which IS a carve-out).
- hasSeparateLoLCap: true ONLY if the text refers to a separate, general limitation-of-liability provision (e.g. "Section X (Limitation of Liability)", "aggregate liability shall not exceed...") that is distinct from the indemnity's own cap. A cap stated inside the indemnity itself does NOT count.
- indemnityExcludedFromCap: true ONLY if the text expressly carves the indemnity OUT of a cap with language like "notwithstanding the limitation of liability", "indemnification obligations shall not be subject to the cap", or an explicit exception. If the indemnity is silent, or is instead stated to BE capped/subject to a limit, return FALSE.
- hasConsequentialWaiver: true ONLY if the text actually waives or excludes consequential/indirect damages somewhere (e.g. "in no event shall either party be liable for consequential damages").
- inCumulativeRemediesClause: true ONLY if explicit cumulative-remedies language is present (e.g. "remedies shall be cumulative", "in addition to all other remedies").

CLAUSE
"""
${clause}
"""

OUTPUT
Return ONLY valid JSON, no prose, no markdown fences, exactly this shape:
{
  "positions": { ${COMPONENTS.map((c) => `"${c.id}": <0-100>`).join(", ")} },
  "riskFactors": { "hasSeparateLoLCap": <bool>, "indemnityExcludedFromCap": <bool>, "hasConsequentialWaiver": <bool>, "inCumulativeRemediesClause": <bool> },
  "notes": "<one or two sentences of context, optional>"
}`;
}

function targetSummary(positions: Positions): string {
  return COMPONENTS.map((c) => {
    const v = positions[c.id];
    const lean = v <= 35 ? `narrow (${c.narrowLabel})` : v >= 65 ? `broad (${c.broadLabel})` : "middle / balanced";
    return `- ${c.id} (${c.label}): target ${v}/100 → ${lean}`;
  }).join("\n");
}

export function buildRevisePrompt(
  clause: string,
  party: PartyConfig,
  positions: Positions,
): string {
  const userName = party.side === "A" ? party.nameA : party.nameB;
  return `You are an experienced contracts attorney redlining an indemnification clause on behalf of ${userName}.

PARTIES
${partyDescription(party)}

TARGET SETTINGS
The attorney wants the clause to move toward these positions (0 = narrow pole, 100 = broad pole):
${targetSummary(positions)}

INSTRUCTIONS
- Propose concrete edits to the clause text that move it toward the target settings, drafted to favor ${userName}.
- ONLY propose an edit where the current text actually diverges from the target. Do not restate unchanged text.
- Each edit must replace an EXACT contiguous substring that appears verbatim in the clause.
- "original" MUST be a meaningful span of at least a few words, beginning and ending on whole words. NEVER use bare punctuation (like "." or ",") or a single word as "original". The replacement must read as grammatically clean, complete text when substituted in — do not leave dangling fragments or broken sentences.
- Edits MUST NOT overlap: no two edits may cover any of the same characters. If you want to change two nearby things, either combine them into ONE edit with a single larger "original", or pick non-overlapping spans.
- "contextBefore" MUST be the text that comes IMMEDIATELY BEFORE "original" in the clause — the ~40 characters ending exactly where "original" begins. It must NOT include any text that appears after the original substring. Use "" if the substring is at the very start.
- Keep edits surgical and legally clean. Prefer minimal phrasing changes over wholesale rewrites.
- Give a one-sentence plain-English rationale for each edit, naming the component and who it helps.

CLAUSE
"""
${clause}
"""

OUTPUT
Return ONLY valid JSON, no prose, no markdown fences, exactly this shape:
{
  "edits": [
    {
      "componentId": "<one of: ${COMPONENTS.map((c) => c.id).join(", ")}>",
      "contextBefore": "<~40 chars preceding the original substring, or empty>",
      "original": "<exact substring from the clause to replace>",
      "replacement": "<the revised text>",
      "rationale": "<one sentence: what this changes and who it favors>"
    }
  ]
}`;
}

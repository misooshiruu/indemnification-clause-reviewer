import type { Category, ComponentConfig, ComponentId } from "./types";

// The 9 indemnification levers. Slider value 0 = narrow (left) pole,
// 100 = broad (right) pole. `indemniteePole` records which pole favors the
// indemnitee; the favorable/green end shown in the UI is derived from the
// party the user represents (see favorablePole / poleColors helpers below).
export const COMPONENTS: ComponentConfig[] = [
  {
    id: "mutuality",
    label: "Mutuality",
    category: "scope",
    narrowLabel: "One-way — only the indemnitor owes indemnity",
    broadLabel: "Mutual — both parties indemnify each other",
    indemniteePole: "narrow",
    relativeFavor: true,
    tooltip: {
      what: "Is indemnification one-way (only one party owes it) or reciprocal (both parties indemnify each other for their respective risks)?",
      narrow:
        "Unilateral: only the indemnitor owes indemnity. The protected party owes nothing back.",
      broad:
        "Mutual: each party indemnifies the other for its own risks. The obligations need not be equal or proportional.",
      favors:
        "Each side prefers more obligation on the OTHER party. The green end is whichever direction shifts the burden onto your counterparty.",
      interactions: [
        "Mutual indemnities are common; each side's obligation need not be symmetric — watch for lopsided carve-outs.",
      ],
    },
  },
  {
    id: "dutyToDefend",
    label: "Duty to defend",
    category: "defense",
    narrowLabel: "Indemnify only — reimburse actual losses",
    broadLabel: "Indemnify + defend — must fund and run the defense",
    indemniteePole: "broad",
    tooltip: {
      what: "Must the indemnitor actually take over and fund the defense of a lawsuit, or only reimburse losses after the fact?",
      narrow:
        "Indemnify only: the indemnitor reimburses actual losses but has no duty to step in and defend.",
      broad:
        "Indemnify + defend: the indemnitor must take over and pay for the defense. This duty is broader than indemnity and is triggered by the allegations in the complaint, not the ultimate merits — so it can arise even for meritless claims.",
      favors:
        "Broad (duty to defend) favors the indemnitee; narrow (reimburse only) favors the indemnitor.",
    },
  },
  {
    id: "nexus",
    label: "Nexus phrase",
    category: "scope",
    narrowLabel: '"solely resulting from" / "to the extent caused by"',
    broadLabel: '"arising from / related to"',
    indemniteePole: "broad",
    tooltip: {
      what: "How tightly must the harm be linked to the triggering event for indemnity to apply?",
      narrow:
        '"Solely resulting from" or "to the extent caused by" excludes anything not directly the indemnitor\'s fault and supports apportionment.',
      broad:
        '"Arising from / related to" sweeps in loosely connected losses, including matters only tangentially linked to the trigger.',
      favors:
        "Broad (loose linkage) favors the indemnitee; narrow (tight causation) favors the indemnitor.",
    },
  },
  {
    id: "coveredClaims",
    label: "Covered claims",
    category: "scope",
    narrowLabel: "Third-party claims only",
    broadLabel: "Third-party + direct claims between the parties",
    indemniteePole: "broad",
    tooltip: {
      what: "Does indemnity cover only third-party claims, or also direct claims between the two contracting parties?",
      narrow:
        "Third-party claims only (and possibly only fully adjudicated ones).",
      broad:
        "Third-party plus direct (first-party) claims. Direct-claim indemnity must be unequivocal under cases like Hooper v. AGS; it mainly adds remedies such as attorneys' fees rather than creating new liability.",
      favors:
        "Broad (includes direct claims) favors the indemnitee; narrow (third-party only) favors the indemnitor.",
    },
  },
  {
    id: "coveredDamages",
    label: "Covered damages",
    category: "money",
    narrowLabel: "Direct / actual losses only",
    broadLabel: "Includes consequential, incidental, indirect",
    indemniteePole: "broad",
    tooltip: {
      what: "What kinds of damages are recoverable under the indemnity?",
      narrow:
        "Direct/actual losses only; consequential, incidental, indirect, and punitive damages are excluded.",
      broad:
        "Includes consequential, incidental, and indirect damages (rarely punitive/exemplary), lost revenues, and diminution in value.",
      favors:
        "Broad (more damage types) favors the indemnitee; narrow (direct only) favors the indemnitor.",
      interactions: [
        "Check any consequential-damages waiver elsewhere in the contract — a broad indemnity here may directly contradict it.",
      ],
    },
  },
  {
    id: "cap",
    label: "Cap (maximum liability)",
    category: "money",
    narrowLabel: "Low / fixed cap (e.g. fees paid)",
    broadLabel: "High / no cap, with carve-outs excluded",
    indemniteePole: "broad",
    tooltip: {
      what: "Is the indemnitor's exposure under the indemnity capped, and how high?",
      narrow:
        "Low cap — e.g. fees paid or a fixed low number. Limits the indemnitor's downside.",
      broad:
        "High or no cap, with carve-outs (IP, confidentiality, environmental, willful misconduct) expressly excluded from the cap.",
      favors:
        "Broad (high/no cap) favors the indemnitee; narrow (low cap) favors the indemnitor.",
      interactions: [
        "A general limitation-of-liability cap silently swallows indemnity unless indemnity is expressly excluded from it.",
      ],
    },
  },
  {
    id: "basket",
    label: "Threshold / basket",
    category: "money",
    narrowLabel: "Deductible basket / higher threshold",
    broadLabel: 'No basket or low "tipping" / dollar-one threshold',
    indemniteePole: "broad",
    tooltip: {
      what: "Must a minimum dollar amount be reached before indemnity is owed?",
      narrow:
        "Deductible basket: only amounts above the threshold are owed, and the threshold is higher. Reduces small-claim exposure for the indemnitor.",
      broad:
        'No basket, or a low "tipping" / dollar-one threshold — once hit, the entire amount is owed from the first dollar.',
      favors:
        "Broad (no/low threshold) favors the indemnitee; narrow (deductible basket) favors the indemnitor.",
    },
  },
  {
    id: "exclusivity",
    label: "Exclusivity of remedy",
    category: "remedies",
    narrowLabel: "Sole / exclusive remedy (with carve-outs)",
    broadLabel: "Non-exclusive — other remedies stay available",
    indemniteePole: "broad",
    tooltip: {
      what: "Is indemnification the only remedy for covered claims, or can the party also pursue other remedies?",
      narrow:
        "Sole/exclusive remedy, usually with carve-outs for fraud, willful misconduct, and equitable relief.",
      broad:
        "Non-exclusive: other contract and equitable remedies remain available alongside indemnity.",
      favors:
        "Broad (non-exclusive) favors the indemnitee; narrow (exclusive) favors the indemnitor.",
      interactions: [
        "Caps and baskets are easily defeated unless indemnity is the exclusive remedy AND excluded from any cumulative-remedies clause.",
      ],
    },
  },
  {
    id: "notice",
    label: "Notice & control of defense",
    category: "defense",
    narrowLabel: "Strict notice; indemnitor controls defense",
    broadLabel: "Flexible notice; indemnitee keeps participation rights",
    indemniteePole: "broad",
    tooltip: {
      what: "How forgiving is the notice requirement, and who runs the defense and settlement?",
      narrow:
        "Strict, short notice; late notice excuses the obligation entirely; the indemnitor controls defense and settlement.",
      broad:
        "Flexible notice; late notice only excuses to the extent it actually prejudices the defense; the indemnitee keeps consent/participation rights, especially where there is a conflict of interest.",
      favors:
        "Broad (flexible notice, participation rights) favors the indemnitee; narrow (strict notice, indemnitor control) favors the indemnitor.",
    },
  },
];

export const COMPONENT_MAP: Record<ComponentId, ComponentConfig> =
  COMPONENTS.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<ComponentId, ComponentConfig>,
  );

export const CATEGORY_CHIP: Record<
  Category,
  { label: string; bg: string; text: string }
> = {
  scope: { label: "Scope", bg: "bg-chip-blue", text: "text-chip-blueText" },
  defense: {
    label: "Defense",
    bg: "bg-chip-purple",
    text: "text-chip-purpleText",
  },
  money: { label: "Money", bg: "bg-chip-teal", text: "text-chip-tealText" },
  remedies: {
    label: "Remedies",
    bg: "bg-chip-pink",
    text: "text-chip-pinkText",
  },
};

// Which pole (left=narrow "0" end, right=broad "100" end) is favorable for the
// party the user represents. `indemniteePole` is the end that favors the
// indemnitee; if the user is the indemnitor the favorable end flips.
//
// Mutuality (indemniteePole "narrow", relativeFavor) follows the same flip and
// resolves to "more obligation on the OTHER party": the indemnitee favors the
// one-way/narrow end (counterparty owes everything), the indemnitor favors the
// mutual/broad end (counterparty also owes). relativeFavor only drives tooltip
// framing, not the math.
export function favorablePole(
  c: ComponentConfig,
  userIsIndemnitee: boolean,
): "narrow" | "broad" {
  if (userIsIndemnitee) return c.indemniteePole;
  return c.indemniteePole === "broad" ? "narrow" : "broad";
}

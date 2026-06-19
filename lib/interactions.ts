import type {
  ComponentId,
  Interaction,
  Positions,
  RiskFactors,
} from "./types";

// Slider values are 0..100. Treat <=35 as the narrow end, >=65 as the broad end.
const NARROW = 35;
const BROAD = 65;

const isNarrow = (v: number) => v <= NARROW;
const isBroad = (v: number) => v >= BROAD;

// Pure function: given the current slider positions and the LLM-detected risk
// factors about the surrounding contract, surface cross-component risks.
export function computeInteractions(
  positions: Positions,
  rf: RiskFactors,
): Interaction[] {
  const out: Interaction[] = [];
  const add = (
    id: string,
    severity: Interaction["severity"],
    title: string,
    message: string,
    relatedComponentIds: ComponentId[],
  ) => out.push({ id, severity, title, message, relatedComponentIds });

  // 1. Liability-cap bypass / silent swallow.
  if (
    (isNarrow(positions.cap) || rf.hasSeparateLoLCap) &&
    !rf.indemnityExcludedFromCap
  ) {
    add(
      "cap-swallow",
      "danger",
      "Liability cap may swallow the indemnity",
      "There is a low or separate limitation-of-liability cap and the indemnity is not expressly excluded from it. A general cap silently caps indemnity recovery unless indemnity is carved out.",
      ["cap", "exclusivity"],
    );
  }

  // 2. No cap on consequential damages.
  if (
    isBroad(positions.coveredDamages) &&
    isBroad(positions.cap) &&
    !rf.hasConsequentialWaiver
  ) {
    add(
      "uncapped-consequential",
      "danger",
      "Uncapped consequential damages",
      "Consequential/indirect damages are covered, the cap is high or absent, and there is no consequential-damages waiver. The indemnitor's exposure here is effectively open-ended.",
      ["coveredDamages", "cap"],
    );
  }

  // 3. Exclusive-remedy gap — caps/baskets defeatable.
  if (isBroad(positions.exclusivity) && (isNarrow(positions.cap) || isNarrow(positions.basket))) {
    add(
      "exclusive-remedy-gap",
      "warn",
      "Exclusive-remedy gap",
      "Indemnity is non-exclusive while a low cap or deductible basket applies. A party can sidestep the cap/basket by pursuing other remedies, so the limits give less protection than they appear to.",
      ["exclusivity", "cap", "basket"],
    );
  }

  // 4. Cumulative-remedies leak.
  if (isNarrow(positions.exclusivity) && rf.inCumulativeRemediesClause) {
    add(
      "cumulative-remedies-leak",
      "warn",
      "Cumulative-remedies clause undercuts exclusivity",
      "Indemnity is drafted as the exclusive remedy, but a separate cumulative-remedies clause preserves all other remedies. Unless indemnity is also carved out of that clause, the exclusivity is undermined.",
      ["exclusivity"],
    );
  }

  // 5. Consequential-damages-waiver conflict.
  if (
    isBroad(positions.coveredDamages) &&
    rf.hasConsequentialWaiver &&
    !rf.consequentialWaiverExcludesIndemnity
  ) {
    add(
      "consequential-waiver-conflict",
      "warn",
      "Conflict with consequential-damages waiver",
      "The indemnity covers consequential/indirect damages, but the contract also waives consequential damages elsewhere. These provisions contradict each other and a court may not enforce the broader recovery.",
      ["coveredDamages"],
    );
  }

  // 6. Broad duty to defend with strict notice (informational interaction).
  if (isBroad(positions.dutyToDefend) && isNarrow(positions.notice)) {
    add(
      "defend-strict-notice",
      "info",
      "Duty to defend paired with strict notice",
      "A broad duty to defend is valuable, but strict notice terms that excuse the obligation on any late notice can quietly erase it. Confirm notice is forgiving enough to preserve the defense right.",
      ["dutyToDefend", "notice"],
    );
  }

  return out;
}

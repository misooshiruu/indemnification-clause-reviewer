// ---- Parties & side ----

export type PartyId = "A" | "B";

// The two structural roles in an indemnity. The indemnitee is typically the
// buyer/customer (the one being protected); the indemnitor is the
// supplier/service provider (the one giving protection).
export type Role = "indemnitee" | "indemnitor";

export interface PartyConfig {
  nameA: string;
  nameB: string;
  // Which party plays the indemnitee role; the other is the indemnitor.
  indemnitee: PartyId;
  // Which party the user represents.
  side: PartyId;
}

// ---- Component (slider) config ----

export type ComponentId =
  | "mutuality"
  | "dutyToDefend"
  | "nexus"
  | "coveredClaims"
  | "coveredDamages"
  | "cap"
  | "basket"
  | "exclusivity"
  | "notice";

export type Category = "scope" | "defense" | "money" | "remedies";

export interface ComponentTooltip {
  what: string;
  narrow: string; // what the narrow (left) pole means
  broad: string; // what the broad (right) pole means
  favors: string; // who each end favors / how to read it
  interactions?: string[]; // cross-component risk notes
}

export interface ComponentConfig {
  id: ComponentId;
  label: string;
  category: Category;
  narrowLabel: string;
  broadLabel: string;
  // Which pole favors the indemnitee. For all but mutuality this is "broad".
  indemniteePole: "narrow" | "broad";
  // Mutuality is special: the favorable end is "more obligation on the OTHER
  // party" relative to whichever side the user picks, not a fixed role.
  relativeFavor?: boolean;
  tooltip: ComponentTooltip;
}

// ---- LLM backend ----

export type CloudProvider = "anthropic" | "openai" | "gemini";

export interface BackendConfig {
  mode: "cloud" | "ollama";
  provider?: CloudProvider;
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
}

// ---- Analyze / revise payloads ----

export type Positions = Record<ComponentId, number>; // 0..100

export interface RiskFactors {
  hasSeparateLoLCap: boolean;
  indemnityExcludedFromCap: boolean;
  hasConsequentialWaiver: boolean;
  consequentialWaiverExcludesIndemnity: boolean;
  inCumulativeRemediesClause: boolean;
}

export interface AnalyzeResult {
  positions: Positions;
  riskFactors: RiskFactors;
  notes?: string;
}

export interface SuggestedEdit {
  id: string;
  componentId: ComponentId;
  contextBefore: string; // short snippet preceding `original`, for anchoring
  original: string; // exact substring of the clause to replace
  replacement: string;
  rationale: string;
}

export interface ReviseResult {
  edits: SuggestedEdit[];
}

// ---- Interactions engine ----

export type Severity = "info" | "warn" | "danger";

export interface Interaction {
  id: string;
  severity: Severity;
  title: string;
  message: string;
  relatedComponentIds: ComponentId[];
}

// ---- Redline UI state ----

export type EditStatus = "pending" | "accepted" | "rejected";

export interface EditState {
  status: EditStatus;
  replacement: string; // editable (accept-with-edits)
}

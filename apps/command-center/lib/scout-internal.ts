import { timingSafeEqual } from "node:crypto";
import type { ScoutScores } from "./agents/scout";

export const SCOUT_GOAL_ID = "GOAL-2026-009";
export const SCOUT_ACTIVATION_CORRELATION_ID = "CORR-AGT009-ACTIVATION-20260720";

export function isScoutInternalRequest(request: Request) {
  const expected = process.env.SCOUT_INTERNAL_KEY;
  const actual = request.headers.get("x-symbiont-internal-key");
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type EvidenceInput = {
  id: string;
  canonicalUrl: string;
  sourceTitle: string;
  sourceType: string;
  evidenceSummary: string;
  contentHash: string;
  confidence: number;
  isAmendment?: boolean;
  amendmentNumber?: string | null;
  observedAt: string;
};

export type OpportunityInput = {
  id: string;
  issuer: string;
  issuerWebsite?: string | null;
  title: string;
  solicitationNumber?: string | null;
  canonicalUrl: string;
  publicationDate?: string | null;
  deadlineAt?: string | null;
  deadlineTimezone?: string | null;
  location?: string | null;
  geographyKey: string;
  statedValue?: number | null;
  currency?: string;
  procurementType: string;
  scope: string;
  publicContact?: Record<string, string> | null;
  accessRequirements?: string | null;
  fitRationale: string;
  scores: ScoutScores;
  confidence: number;
  freshness: string;
  risks: string[];
  missingInformation: string[];
  nextAction: string;
  observedAt: string;
  sourceKind: string;
  evidence: EvidenceInput;
};

export type ScoutIngestInput = {
  action: "ingest_run";
  runId: string;
  sharedGoalId: string;
  correlationId: string;
  startedAt: string;
  completedAt: string;
  sourcesChecked: number;
  candidatesFound: number;
  opportunities: OpportunityInput[];
};

export function parseScoutIngest(value: unknown): ScoutIngestInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_SCOUT_INGEST");
  const input = value as Record<string, unknown>;
  for (const key of ["runId", "sharedGoalId", "correlationId", "startedAt", "completedAt"]) requireString(input[key], key);
  if (input.sharedGoalId !== SCOUT_GOAL_ID) throw new Error("INVALID_SHARED_GOAL");
  if (!Array.isArray(input.opportunities) || input.opportunities.length > 100) throw new Error("INVALID_OPPORTUNITIES");
  const opportunities = input.opportunities.map(parseOpportunity);
  return {
    action: "ingest_run",
    runId: String(input.runId),
    sharedGoalId: String(input.sharedGoalId),
    correlationId: String(input.correlationId),
    startedAt: isoDate(input.startedAt, "startedAt"),
    completedAt: isoDate(input.completedAt, "completedAt"),
    sourcesChecked: nonnegativeInteger(input.sourcesChecked, "sourcesChecked"),
    candidatesFound: nonnegativeInteger(input.candidatesFound, "candidatesFound"),
    opportunities,
  };
}

function parseOpportunity(value: unknown): OpportunityInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_OPPORTUNITY");
  const item = value as Record<string, unknown>;
  for (const key of ["id","issuer","title","canonicalUrl","geographyKey","procurementType","scope","fitRationale","freshness","nextAction","observedAt","sourceKind"]) requireString(item[key], key);
  if (String(item.id).startsWith("DEMO-")) throw new Error("DEMONSTRATION_WRITE_REJECTED");
  secureUrl(item.canonicalUrl, "canonicalUrl");
  if (item.issuerWebsite) secureUrl(item.issuerWebsite, "issuerWebsite");
  const confidence = boundedScore(item.confidence, "confidence");
  if (!item.scores || typeof item.scores !== "object") throw new Error("INVALID_SCORES");
  const scoreValue = item.scores as Record<string, unknown>;
  const scores: ScoutScores = {
    serviceFit: boundedScore(scoreValue.serviceFit, "serviceFit"), buyerFit: boundedScore(scoreValue.buyerFit, "buyerFit"),
    timing: boundedScore(scoreValue.timing, "timing"), value: boundedScore(scoreValue.value, "value"),
    evidence: boundedScore(scoreValue.evidence, "evidence"), access: boundedScore(scoreValue.access, "access"), recurrence: boundedScore(scoreValue.recurrence, "recurrence"),
  };
  const evidence = parseEvidence(item.evidence);
  if (evidence.canonicalUrl !== item.canonicalUrl) throw new Error("EVIDENCE_URL_MISMATCH");
  return {
    id:String(item.id), issuer:String(item.issuer), issuerWebsite:optionalString(item.issuerWebsite), title:String(item.title), solicitationNumber:optionalString(item.solicitationNumber),
    canonicalUrl:String(item.canonicalUrl), publicationDate:optionalDate(item.publicationDate), deadlineAt:optionalDate(item.deadlineAt), deadlineTimezone:optionalString(item.deadlineTimezone),
    location:optionalString(item.location), geographyKey:String(item.geographyKey), statedValue:optionalNonnegativeNumber(item.statedValue), currency:optionalString(item.currency) ?? "USD",
    procurementType:String(item.procurementType), scope:String(item.scope), publicContact:plainStringRecord(item.publicContact), accessRequirements:optionalString(item.accessRequirements),
    fitRationale:String(item.fitRationale), scores, confidence, freshness:String(item.freshness), risks:stringArray(item.risks, "risks"), missingInformation:stringArray(item.missingInformation, "missingInformation"),
    nextAction:String(item.nextAction), observedAt:isoDate(item.observedAt, "observedAt"), sourceKind:String(item.sourceKind), evidence,
  };
}

function parseEvidence(value: unknown): EvidenceInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_EVIDENCE");
  const item = value as Record<string, unknown>;
  for (const key of ["id","canonicalUrl","sourceTitle","sourceType","evidenceSummary","contentHash","observedAt"]) requireString(item[key], key);
  secureUrl(item.canonicalUrl, "evidence.canonicalUrl");
  if (!/^[a-f0-9]{64}$/i.test(String(item.contentHash))) throw new Error("INVALID_EVIDENCE_HASH");
  return { id:String(item.id), canonicalUrl:String(item.canonicalUrl), sourceTitle:String(item.sourceTitle), sourceType:String(item.sourceType), evidenceSummary:String(item.evidenceSummary), contentHash:String(item.contentHash).toLowerCase(), confidence:boundedScore(item.confidence,"evidence.confidence"), isAmendment:item.isAmendment === true, amendmentNumber:optionalString(item.amendmentNumber), observedAt:isoDate(item.observedAt,"evidence.observedAt") };
}

function requireString(value: unknown, name: string) { if (typeof value !== "string" || !value.trim() || value.length > 8000) throw new Error(`INVALID_${name.toUpperCase()}`); }
function optionalString(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function isoDate(value: unknown, name: string) { requireString(value,name); const date = new Date(String(value)); if (!Number.isFinite(date.getTime())) throw new Error(`INVALID_${name.toUpperCase()}`); return date.toISOString(); }
function optionalDate(value: unknown) { if (value == null || value === "") return null; return isoDate(value,"date"); }
function boundedScore(value: unknown, name: string) { if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) throw new Error(`INVALID_${name.toUpperCase()}`); return value; }
function nonnegativeInteger(value: unknown, name: string) { if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`INVALID_${name.toUpperCase()}`); return Number(value); }
function optionalNonnegativeNumber(value: unknown) { if (value == null) return null; if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error("INVALID_STATED_VALUE"); return value; }
function stringArray(value: unknown, name: string) { if (!Array.isArray(value) || value.some(item => typeof item !== "string")) throw new Error(`INVALID_${name.toUpperCase()}`); return value.slice(0,50) as string[]; }
function plainStringRecord(value: unknown) { if (value == null) return null; if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_PUBLIC_CONTACT"); const entries = Object.entries(value); if (entries.some(([key,item]) => !key || typeof item !== "string")) throw new Error("INVALID_PUBLIC_CONTACT"); return Object.fromEntries(entries.slice(0,20)) as Record<string,string>; }
function secureUrl(value: unknown, name: string) { requireString(value,name); const url = new URL(String(value)); if (url.protocol !== "https:") throw new Error(`INVALID_${name.toUpperCase()}`); }

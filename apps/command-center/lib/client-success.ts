export type Health = "Green" | "Amber" | "Red" | "Unknown";
export type HealthEvidence = { outcomeProgress?: number | null; adoption?: number | null; delivery?: number | null; engagement?: number | null; support?: number | null; satisfaction?: number | null; commercial?: number | null; unresolvedRisk?: number | null };

export function scoreClientHealth(evidence: HealthEvidence) {
  const entries = Object.entries(evidence).filter(([, value]) => typeof value === "number") as Array<[string, number]>;
  if (entries.length < 3 || evidence.outcomeProgress == null || evidence.adoption == null) return { health: "Unknown" as Health, score: null, explanation: "Insufficient evidence: outcome progress, adoption, and at least one additional indicator are required." };
  const score = Math.round(entries.reduce((sum, [, value]) => sum + value, 0) / entries.length);
  const health: Health = (evidence.unresolvedRisk ?? 100) < 35 || score < 45 ? "Red" : score < 72 ? "Amber" : "Green";
  return { health, score, explanation: entries.map(([key, value]) => `${key}: ${value}/100`).join(" · ") };
}

export function assertExternalCommunicationApproved(status: string) { if (status !== "Approved") throw new Error("External communication requires authorized human approval."); }
export function assertSupportedValueClaim(source?: string, clientConfirmed?: boolean) { if (!source || !clientConfirmed) throw new Error("Savings and ROI claims require a source and client confirmation."); }
export function redactClientDraft(text: string) { return text.replace(/\b(margin|legal analysis|internal risk|restricted data)\b[^.]*\.?/gi, "[internal content removed]"); }
export function routeExpansionSignal(destination: string) { if (destination !== "AGT-002") throw new Error("Commercial signals must be routed to AGT-002."); return "Routed for sales qualification; no pricing or commitment made."; }

export type ClientSuccessData = { source:"d1"|"demonstration"; database:"connected"|"connected_empty"|"unavailable"|"authorization_required"; asOf:string; activation:string; clients:Array<{id:string;name:string;projectId:string;health:Health;score:number|null;explanation:string;onboarding:number;adoption:number;outcome:number;value:string;nextReview:string;renewalDate:string;risks:number;issues:number;satisfaction:string;expansion:string;communicationStatus:string;isDemonstration:boolean}> };

const evidence = { outcomeProgress:64, adoption:58, delivery:72, engagement:80, support:60, satisfaction:75, commercial:68, unresolvedRisk:55 };
const scored = scoreClientHealth(evidence);
export const demonstrationClientSuccessData: ClientSuccessData = { source:"demonstration", database:"connected_empty", asOf:new Date().toISOString(), activation:"Clearly labeled demonstration records. Connect approved client evidence to activate live health reporting.", clients:[{ id:"CLI-DEMO-001", name:"Northstar Property Group — DEMO", projectId:"PRJ-2026-001", health:scored.health, score:scored.score, explanation:scored.explanation, onboarding:75, adoption:58, outcome:64, value:"Baseline captured · validation pending", nextReview:"2026-08-04", renewalDate:"2027-01-31", risks:1, issues:2, satisfaction:"4.2/5 · 5 responses", expansion:"Portfolio rollout · route to AGT-002", communicationStatus:"Draft · approval required", isDemonstration:true }] };

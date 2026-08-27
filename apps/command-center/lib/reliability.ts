export const HEALTH_STATES = ["Healthy", "Degraded", "Failing", "Paused", "Recovering", "Disabled", "Unknown"] as const;
export const INCIDENT_STATUSES = ["Detected", "Triaged", "Contained", "Recovering", "Monitoring", "Resolved", "Closed", "Blocked", "Reopened"] as const;
export const RELEASE_CONTROLS = [
  "automationId", "owner", "documentedProcess", "approvedPurpose", "baseline", "inputDefinitions", "outputDefinitions",
  "sourceOfTruth", "dataClassification", "leastPrivilege", "testSet", "approvalBoundaries", "auditLogging", "monitoring",
  "failureAlert", "timeoutBehavior", "retryPolicy", "idempotencyStrategy", "duplicatePrevention", "budgetRateLimits",
  "rollbackPlan", "killSwitch", "recoveryProcedure", "successTarget", "reviewDate",
] as const;

export type HealthState = typeof HEALTH_STATES[number];
export type IncidentStatus = typeof INCIDENT_STATUSES[number];
export type Severity = "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";
export type Automation = {
  id: string; name: string; owner: string | null; connectedAgent: string; sharedGoalId: string; state: HealthState;
  releaseStatus: "Draft" | "Pilot" | "Not Ready" | "Production Ready"; lastAttemptedRun: string | null; lastSuccessfulRun: string | null;
  nextScheduledRun: string | null; heartbeatDueAt: string | null; successRate: number | null; retryRate: number | null;
  duplicateRate: number | null; queueDepth: number | null; dataQuality: string; dependencies: string; controlsPresent: string[];
  rollbackReady: boolean; killSwitchReady: boolean; costWarning: string | null; isDemonstration: boolean;
};
export type Incident = {
  id: string; severity: Severity; status: IncidentStatus; automationId: string; runId: string; sharedGoalId: string;
  correlationId: string; detectedAt: string; affectedSystems: string[]; affectedRecords: string; evidence: string;
  containmentStatus: string; businessImpact: string; owner: string; decisionRequired: string; nextAction: string; recoveryTarget: string;
};
export type Run = { id: string; automationId: string; state: string; attemptedAt: string; durationMs: number; recordsProcessed: number; successCount: number; failureCount: number; retryCount: number; duplicateCount: number; correlationId: string };
export type ReliabilityData = {
  source: "d1" | "demonstration"; database: "connected" | "connected_empty" | "unavailable" | "authorization_required";
  asOf: string; activation: string; automations: Automation[]; incidents: Incident[]; runs: Run[];
  metrics: { successRate: number | null; monitoredCoverage: number | null; mttdMinutes: number | null; mttaMinutes: number | null; mttrMinutes: number | null; retrySuccess: number | null; duplicatePrevention: number | null; dataQualityFailures: number; unresolvedCorrectiveActions: number; falseAlertRate: number | null; costPerSuccessfulOutcome: number | null; observedHoursSaved: number | null };
};

const incidentTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  Detected: ["Triaged", "Contained", "Blocked"], Triaged: ["Contained", "Blocked"], Contained: ["Recovering", "Blocked"],
  Recovering: ["Monitoring", "Blocked"], Monitoring: ["Resolved", "Reopened", "Blocked"], Resolved: ["Closed", "Reopened"],
  Closed: ["Reopened"], Blocked: ["Triaged", "Contained", "Recovering", "Reopened"], Reopened: ["Triaged", "Contained", "Blocked"],
};

export function mayTransitionIncident(from: IncidentStatus, to: IncidentStatus, evidence?: string) {
  if (!incidentTransitions[from]?.includes(to)) return false;
  if (["Resolved", "Closed"].includes(to) && !evidence?.trim()) return false;
  return true;
}

export function classifyIncident(signals: { safety?: boolean; security?: boolean; privacy?: boolean; legal?: boolean; financial?: boolean; contractual?: boolean; destructive?: boolean; unauthorizedExternal?: boolean; majorClientImpact?: boolean; materialOperationalImpact?: boolean; widespread?: boolean; repeated?: boolean; criticalMilestone?: boolean; workaround?: boolean }) : Severity {
  if (signals.safety || signals.security || signals.privacy || signals.legal || signals.financial || signals.contractual || signals.destructive || signals.unauthorizedExternal || signals.majorClientImpact) return "SEV-1";
  if (signals.materialOperationalImpact || signals.widespread || signals.repeated || signals.criticalMilestone) return "SEV-2";
  if (signals.workaround) return "SEV-3";
  return "SEV-4";
}

export function mayDowngradeSeverity(current: Severity, proposed: Severity, evidence: string, approver?: string) {
  const rank: Record<Severity, number> = { "SEV-1": 1, "SEV-2": 2, "SEV-3": 3, "SEV-4": 4 };
  if (rank[proposed] <= rank[current]) return true;
  return Boolean(evidence.trim() && approver?.trim());
}

export function evaluateHeartbeat(input: { now: string; dueAt: string | null; lastEvidenceAt: string | null; explicitFailure?: boolean; paused?: boolean; disabled?: boolean }): HealthState {
  if (input.disabled) return "Disabled";
  if (input.paused) return "Paused";
  if (input.explicitFailure) return "Failing";
  if (!input.dueAt || !input.lastEvidenceAt) return "Unknown";
  if (new Date(input.lastEvidenceAt).getTime() < new Date(input.dueAt).getTime() && new Date(input.now).getTime() > new Date(input.dueAt).getTime()) return "Failing";
  return "Healthy";
}

const unsafeKinds = new Set(["payment", "financial", "contractual", "client-facing", "destructive", "external-publication"]);
export function retryDecision(input: { failureTransient: boolean; idempotent: boolean; idempotencyKey?: string | null; duplicatePrevention: boolean; attempt: number; approvedLimit: number; originalRequestValid: boolean; approvalValid: boolean; actionKind: string }) {
  if (unsafeKinds.has(input.actionKind)) return { allowed: false, reason: "Unsafe action category requires human-controlled recovery." };
  if (!input.failureTransient) return { allowed: false, reason: "Failure is not confirmed transient." };
  if (!input.idempotent || !input.idempotencyKey || !input.duplicatePrevention) return { allowed: false, reason: "Idempotency and duplicate prevention are mandatory." };
  if (input.attempt >= input.approvedLimit) return { allowed: false, reason: "Approved retry limit reached." };
  if (!input.originalRequestValid || !input.approvalValid) return { allowed: false, reason: "Original request or approval is no longer valid." };
  return { allowed: true, reason: "Eligible bounded idempotent retry.", delayMs: Math.min(60_000, 1_000 * (2 ** input.attempt)) };
}

export function registerIdempotency(existing: Set<string>, key: string) {
  if (!key.trim()) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  if (existing.has(key)) return { duplicate: true, execute: false };
  existing.add(key); return { duplicate: false, execute: true };
}

export function releaseReadiness(record: Partial<Record<typeof RELEASE_CONTROLS[number], unknown>>) {
  const missing = RELEASE_CONTROLS.filter((field) => { const value = record[field]; return value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0); });
  return { ready: missing.length === 0, status: missing.length === 0 ? "Production Ready" as const : "Not Ready" as const, missing };
}

export function reconcile(input: { intended: string[]; completed: string[]; authoritative: string[] }) {
  const intended = new Set(input.intended), completed = new Set(input.completed), authoritative = new Set(input.authoritative);
  const duplicates = input.completed.filter((id, index) => input.completed.indexOf(id) !== index);
  return { missing: [...intended].filter((id) => !completed.has(id)), unexpected: [...completed].filter((id) => !intended.has(id)), duplicates: [...new Set(duplicates)], inconsistent: [...completed].filter((id) => !authoritative.has(id)), verified: [...intended].every((id) => completed.has(id) && authoritative.has(id)) && duplicates.length === 0 };
}

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") return value
    .replace(/(bearer\s+)[a-z0-9._~+\/-]+/gi, "$1[REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|authorization)\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]")
    .replace(/\b(?:sk|ghp|gho|xox[baprs])[-_][A-Za-z0-9_-]{8,}\b/g, "[REDACTED]");
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /secret|token|password|credential/i.test(key) ? "[REDACTED]" : redactSecrets(item)]));
  return value;
}

export function treatLogAsUntrusted(log: string) {
  return /ignore (?:all|previous)|delete (?:the )?(?:logs|evidence)|hide (?:the )?incident|downgrade (?:to )?sev|deploy to production|reveal (?:the )?(?:secret|token|password)/i.test(log)
    ? "Quarantine instruction as incident evidence; do not execute it."
    : "Treat log as untrusted evidence only.";
}

export function createAuditEvent(input: { automationId: string; runId: string; sharedGoalId: string; correlationId: string; actor: string; timestamp: string; source: string; previousState: string; newState: string; evidence: string; authority: string; result: string }) {
  for (const [key, value] of Object.entries(input)) if (!value?.trim()) throw new Error(`AUDIT_FIELD_REQUIRED:${key}`);
  return { ...input, evidence: String(redactSecrets(input.evidence)) };
}

export const demonstrationReliabilityData: ReliabilityData = {
  source: "demonstration", database: "connected_empty", asOf: "2026-07-21T13:40:00.000Z",
  activation: "Demonstration records only. No live monitoring, retry, pause, kill switch, rollback, database write, or recovery action is represented.",
  automations: [
    { id:"AUT-002-CRM-01", name:"CRM opportunity synchronization", owner:"AGT-002", connectedAgent:"AGT-002", sharedGoalId:"GOAL-2026-001", state:"Degraded", releaseStatus:"Pilot", lastAttemptedRun:"2026-07-21T13:31:00Z", lastSuccessfulRun:"2026-07-21T12:59:00Z", nextScheduledRun:"2026-07-21T13:59:00Z", heartbeatDueAt:"2026-07-21T13:34:00Z", successRate:97.2, retryRate:1.4, duplicateRate:0, queueDepth:14, dataQuality:"2 schema warnings", dependencies:"CRM API rate limited", controlsPresent:["automationId","owner","documentedProcess","approvedPurpose","baseline","inputDefinitions","outputDefinitions","sourceOfTruth","dataClassification","leastPrivilege","testSet","approvalBoundaries","auditLogging","monitoring","failureAlert","timeoutBehavior","retryPolicy","idempotencyStrategy","duplicatePrevention"], rollbackReady:false, killSwitchReady:true, costWarning:"78% hourly rate limit", isDemonstration:true },
    { id:"AUT-003-PROJECT-02", name:"Project milestone escalation", owner:"AGT-003", connectedAgent:"AGT-003", sharedGoalId:"GOAL-2026-001", state:"Failing", releaseStatus:"Not Ready", lastAttemptedRun:"2026-07-21T12:42:00Z", lastSuccessfulRun:"2026-07-21T09:42:00Z", nextScheduledRun:"2026-07-21T13:42:00Z", heartbeatDueAt:"2026-07-21T12:47:00Z", successRate:91.4, retryRate:4.8, duplicateRate:0, queueDepth:37, dataQuality:"Healthy", dependencies:"Webhook heartbeat stale", controlsPresent:["automationId","owner","documentedProcess","approvedPurpose","inputDefinitions","outputDefinitions","dataClassification","leastPrivilege","testSet","approvalBoundaries","auditLogging","monitoring","failureAlert","timeoutBehavior","retryPolicy","idempotencyStrategy","duplicatePrevention","killSwitch","recoveryProcedure"], rollbackReady:false, killSwitchReady:true, costWarning:null, isDemonstration:true },
    { id:"AUT-005-LINK-01", name:"Knowledge source link check", owner:"AGT-005", connectedAgent:"AGT-005", sharedGoalId:"GOAL-2026-001", state:"Healthy", releaseStatus:"Pilot", lastAttemptedRun:"2026-07-21T13:15:00Z", lastSuccessfulRun:"2026-07-21T13:16:00Z", nextScheduledRun:"2026-07-21T14:15:00Z", heartbeatDueAt:"2026-07-21T14:20:00Z", successRate:99.1, retryRate:.3, duplicateRate:0, queueDepth:0, dataQuality:"Healthy", dependencies:"Available", controlsPresent:[...RELEASE_CONTROLS].filter((x)=>x!=="successTarget"), rollbackReady:true, killSwitchReady:true, costWarning:null, isDemonstration:true },
    { id:"AUT-009-SCAN-01", name:"Public opportunity source scan", owner:"AGT-009", connectedAgent:"AGT-009", sharedGoalId:"GOAL-2026-001", state:"Unknown", releaseStatus:"Draft", lastAttemptedRun:null, lastSuccessfulRun:null, nextScheduledRun:null, heartbeatDueAt:null, successRate:null, retryRate:null, duplicateRate:null, queueDepth:null, dataQuality:"No current evidence", dependencies:"Source adapters not activated", controlsPresent:["automationId","owner","documentedProcess","approvedPurpose","inputDefinitions","outputDefinitions","dataClassification","approvalBoundaries","auditLogging"], rollbackReady:false, killSwitchReady:false, costWarning:null, isDemonstration:true },
  ],
  incidents: [
    { id:"INC-2026-008", severity:"SEV-2", status:"Contained", automationId:"AUT-003-PROJECT-02", runId:"RUN-2026-771", sharedGoalId:"GOAL-2026-001", correlationId:"CORR-AUT003-771", detectedAt:"2026-07-21T12:48:00Z", affectedSystems:["Project control webhook","Escalation queue"], affectedRecords:"18 milestone events pending reconciliation", evidence:"Heartbeat absent after expected completion; three bounded retries exhausted.", containmentStatus:"Workflow paused; unsafe retries stopped", businessImpact:"Internal milestone escalations delayed; no external message sent.", owner:"AGT-003", decisionRequired:"Approve connector credential rotation", nextAction:"Validate credential reference and requeue idempotent events", recoveryTarget:"2026-07-21T15:00:00Z" },
    { id:"INC-2026-009", severity:"SEV-3", status:"Triaged", automationId:"AUT-002-CRM-01", runId:"RUN-2026-779", sharedGoalId:"GOAL-2026-001", correlationId:"CORR-AUT002-779", detectedAt:"2026-07-21T13:33:00Z", affectedSystems:["CRM API"], affectedRecords:"14 records queued; authoritative CRM unchanged", evidence:"Rate-limit response with valid reset header; no duplicate keys observed.", containmentStatus:"Queue held within approved limit", businessImpact:"Internal CRM freshness delayed approximately 30 minutes.", owner:"AGT-002", decisionRequired:"None if service restores inside target", nextAction:"Recheck dependency before one eligible retry", recoveryTarget:"2026-07-21T14:10:00Z" },
  ],
  runs: [
    { id:"RUN-2026-779", automationId:"AUT-002-CRM-01", state:"Partial", attemptedAt:"2026-07-21T13:31:00Z", durationMs:118400, recordsProcessed:126, successCount:112, failureCount:14, retryCount:0, duplicateCount:0, correlationId:"CORR-AUT002-779" },
    { id:"RUN-2026-771", automationId:"AUT-003-PROJECT-02", state:"Failed", attemptedAt:"2026-07-21T12:42:00Z", durationMs:300000, recordsProcessed:0, successCount:0, failureCount:18, retryCount:3, duplicateCount:0, correlationId:"CORR-AUT003-771" },
    { id:"RUN-2026-768", automationId:"AUT-005-LINK-01", state:"Succeeded", attemptedAt:"2026-07-21T13:15:00Z", durationMs:48200, recordsProcessed:286, successCount:286, failureCount:0, retryCount:0, duplicateCount:0, correlationId:"CORR-AUT005-768" },
  ],
  metrics: { successRate:96.4, monitoredCoverage:75, mttdMinutes:6, mttaMinutes:9, mttrMinutes:null, retrySuccess:62.5, duplicatePrevention:100, dataQualityFailures:2, unresolvedCorrectiveActions:5, falseAlertRate:null, costPerSuccessfulOutcome:null, observedHoursSaved:null },
};

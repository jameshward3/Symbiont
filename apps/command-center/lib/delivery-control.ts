export type Health = "Green" | "Amber" | "Red";

export type ProjectSignal = {
  scheduleVariancePercent: number | null;
  marginVariancePoints: number | null;
  missedCriticalMilestone?: boolean;
  criticalIssueCount?: number;
  materialIncident?: boolean;
  unauthorizedCommitment?: boolean;
  missingRequiredInformation?: boolean;
  blockedDependency?: boolean;
  failedQualityReview?: boolean;
  overdueClientApproval?: boolean;
};

export type DeliveryProject = {
  id: string;
  name: string;
  clientName: string;
  health: Health;
  phase: string;
  projectManager: string;
  targetCompletionDate: string;
  nextMilestone: string;
  nextMilestoneDate: string;
  milestonePerformance: number;
  scheduleVariancePercent: number;
  marginVariancePoints: number | null;
  qualityStatus: string;
  closeoutReadiness: number;
  authorizationStatus: string;
  sourceEvidence: string;
  isDemonstration: boolean;
};

export type DeliveryAction = { id: string; projectId: string; title: string; owner: string; dueDate: string; priority: string; status: string; validationCriteria: string };
export type DeliveryRisk = { id: string; projectId: string; type: "Risk" | "Issue" | "Exception"; severity: Health; statement: string; evidence: string; impact: string; owner: string; action: string; dueDate: string; escalation: string; validationCriteria: string };
export type DeliveryGate = { id: string; projectId: string; name: string; dueDate: string; owner: string; status: string; gateType: string };
export type DeliveryChange = { id: string; projectId: string; title: string; classification: string; status: string; scheduleEffectDays: number | null; approvalRequired: boolean };
export type DeliveryDecision = { id: string; projectId: string; statement: string; owner: string; requiredBy: string; status: string };
export type DeliveryHandoff = { id: string; projectId: string; from: string; to: string; objective: string; priority: string; owner: string; dueDate: string; status: string; correlationId: string; acceptanceCriteria: string };

export type DeliveryData = {
  source: "d1" | "demonstration";
  database: "connected" | "connected_empty" | "unavailable" | "authorization_required";
  asOf: string;
  activation: string;
  projects: DeliveryProject[];
  actions: DeliveryAction[];
  risks: DeliveryRisk[];
  gates: DeliveryGate[];
  changes: DeliveryChange[];
  decisions: DeliveryDecision[];
  handoffs: DeliveryHandoff[];
};

const healthRank: Record<Health, number> = { Green: 0, Amber: 1, Red: 2 };

export function calculateProjectHealth(signal: ProjectSignal): Health {
  if (
    signal.materialIncident ||
    signal.unauthorizedCommitment ||
    signal.missedCriticalMilestone ||
    Math.abs(signal.scheduleVariancePercent ?? 0) > 10 ||
    Math.abs(signal.marginVariancePoints ?? 0) > 7
  ) return "Red";

  if (
    Math.abs(signal.scheduleVariancePercent ?? 0) > 5 ||
    Math.abs(signal.marginVariancePoints ?? 0) > 3 ||
    (signal.criticalIssueCount ?? 0) > 0 ||
    signal.missingRequiredInformation ||
    signal.blockedDependency ||
    signal.failedQualityReview ||
    signal.overdueClientApproval
  ) return "Amber";

  return "Green";
}

export function isActionOverdue(action: Pick<DeliveryAction, "dueDate" | "status">, asOf: string | Date = new Date()): boolean {
  if (["Complete", "Closed", "Cancelled"].includes(action.status)) return false;
  const due = new Date(`${action.dueDate}T23:59:59.999Z`);
  const at = asOf instanceof Date ? asOf : new Date(asOf);
  return Number.isFinite(due.getTime()) && due.getTime() < at.getTime();
}

export function worstHealth(values: Health[]): Health {
  return values.reduce<Health>((worst, current) => healthRank[current] > healthRank[worst] ? current : worst, "Green");
}

export const demonstrationDeliveryData: DeliveryData = {
  source: "demonstration",
  database: "connected_empty",
  asOf: "2026-07-20T16:00:00.000Z",
  activation: "Demonstration records only. No live project record, database write, agent handoff, or automated monitoring event is represented.",
  projects: [
    { id: "PRJ-2026-014", name: "Portfolio Intelligence Foundation", clientName: "Northline Properties", health: "Amber", phase: "Delivery", projectManager: "Maya Chen", targetCompletionDate: "2026-09-18", nextMilestone: "Data access readiness", nextMilestoneDate: "2026-07-24", milestonePerformance: 82, scheduleVariancePercent: 7, marginVariancePoints: -2, qualityStatus: "Review planned", closeoutReadiness: 28, authorizationStatus: "Demonstration — assumed executed", sourceEvidence: "DEMO-AUTH-014", isDemonstration: true },
    { id: "PRJ-2026-015", name: "Reality Capture Pilot", clientName: "Civic Facilities Group", health: "Green", phase: "Setup", projectManager: "Noah Williams", targetCompletionDate: "2026-08-29", nextMilestone: "Kickoff readiness gate", nextMilestoneDate: "2026-07-28", milestonePerformance: 100, scheduleVariancePercent: 2, marginVariancePoints: 1, qualityStatus: "Criteria defined", closeoutReadiness: 18, authorizationStatus: "Demonstration — internal authorization", sourceEvidence: "DEMO-AUTH-015", isDemonstration: true },
    { id: "PRJ-2026-011", name: "Building Data Operations", clientName: "Arcway Campus", health: "Red", phase: "Recovery", projectManager: "Elena Brooks", targetCompletionDate: "2026-08-08", nextMilestone: "Integration acceptance", nextMilestoneDate: "2026-07-22", milestonePerformance: 61, scheduleVariancePercent: 14, marginVariancePoints: -8, qualityStatus: "Major defects open", closeoutReadiness: 64, authorizationStatus: "Demonstration — assumed executed", sourceEvidence: "DEMO-AUTH-011", isDemonstration: true },
  ],
  actions: [
    { id: "ACT-2026-041", projectId: "PRJ-2026-011", title: "Confirm client integration endpoint owner", owner: "Elena Brooks", dueDate: "2026-07-18", priority: "P0", status: "Open", validationCriteria: "Named client owner and confirmed test window linked" },
    { id: "ACT-2026-044", projectId: "PRJ-2026-014", title: "Resolve missing source-system access", owner: "Maya Chen", dueDate: "2026-07-19", priority: "P1", status: "Blocked", validationCriteria: "Approved credentials tested by delivery lead" },
    { id: "ACT-2026-046", projectId: "PRJ-2026-015", title: "Approve kickoff responsibility matrix", owner: "Noah Williams", dueDate: "2026-07-23", priority: "P2", status: "Open", validationCriteria: "All accountable roles acknowledged" },
  ],
  risks: [
    { id: "EXC-2026-012", projectId: "PRJ-2026-011", type: "Exception", severity: "Red", statement: "Integration acceptance milestone is forecast beyond the approved tolerance.", evidence: "Demonstration forecast: 14% schedule variance and two major QA defects.", impact: "Target completion and client confidence are materially at risk.", owner: "Elena Brooks", action: "Run recovery review and secure the missing client decision.", dueDate: "2026-07-21", escalation: "AGT-001 COO + authorized human", validationCriteria: "Rebaselined recovery option and client-decision evidence approved" },
    { id: "RSK-2026-028", projectId: "PRJ-2026-014", type: "Risk", severity: "Amber", statement: "Data access delay may consume the remaining schedule contingency.", evidence: "Demonstration access action is overdue and the readiness gate is four days away.", impact: "Model setup may start late.", owner: "Maya Chen", action: "Escalate access owner and prepare an approved fallback sequence.", dueDate: "2026-07-21", escalation: "Project owner, then AGT-001", validationCriteria: "Access verified or approved fallback activated" },
  ],
  gates: [
    { id: "MIL-2026-062", projectId: "PRJ-2026-011", name: "Integration acceptance", dueDate: "2026-07-22", owner: "Elena Brooks", status: "At risk", gateType: "Client approval" },
    { id: "MIL-2026-071", projectId: "PRJ-2026-014", name: "Data access readiness", dueDate: "2026-07-24", owner: "Maya Chen", status: "Blocked", gateType: "Delivery readiness" },
    { id: "QA-2026-033", projectId: "PRJ-2026-015", name: "Kickoff baseline review", dueDate: "2026-07-28", owner: "Noah Williams", status: "Planned", gateType: "Quality gate" },
  ],
  changes: [
    { id: "CHG-2026-009", projectId: "PRJ-2026-011", title: "Additional sensor mapping", classification: "Potential contractual change", status: "Human approval required", scheduleEffectDays: 6, approvalRequired: true },
    { id: "CHG-2026-010", projectId: "PRJ-2026-014", title: "Source naming correction", classification: "Internal correction", status: "Draft", scheduleEffectDays: 0, approvalRequired: false },
  ],
  decisions: [
    { id: "DEC-2026-019", projectId: "PRJ-2026-011", statement: "Choose the recovery sequence for integration acceptance.", owner: "Authorized executive", requiredBy: "2026-07-21", status: "Decision required" },
    { id: "DEC-2026-022", projectId: "PRJ-2026-014", statement: "Approve the controlled fallback data source if primary access remains blocked.", owner: "Project accountable owner", requiredBy: "2026-07-22", status: "Review" },
  ],
  handoffs: [
    { id: "WRK-2026-087", projectId: "PRJ-2026-011", from: "AGT-003", to: "AGT-004", objective: "Review major integration defects against acceptance criteria", priority: "P0", owner: "QA/QC owner", dueDate: "2026-07-21", status: "Draft — not sent", correlationId: "CORR-DEMO-011-QA", acceptanceCriteria: "Defects independently dispositioned with evidence" },
    { id: "WRK-2026-091", projectId: "PRJ-2026-014", from: "AGT-003", to: "AGT-006", objective: "Validate forecast margin signal after access delay", priority: "P1", owner: "Finance Operations", dueDate: "2026-07-23", status: "Draft — not sent", correlationId: "CORR-DEMO-014-FIN", acceptanceCriteria: "Forecast source and variance confirmed" },
  ],
};

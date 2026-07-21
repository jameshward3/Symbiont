import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { automationRuns, automations, incidents, reliabilityMetrics } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { safeJsonArray } from "@/lib/opportunities";
import { demonstrationReliabilityData, type HealthState, type IncidentStatus, type Severity } from "@/lib/reliability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    if (!isAuthorized(request)) return NextResponse.json({ ...demonstrationReliabilityData, database: "authorization_required", activation: "Secure authorization is required for live reliability evidence. Sanitized demonstration records are shown; no action is available." });
    const [automationRecords, incidentRecords, runRecords, metricRecords] = await Promise.all([
      db.select().from(automations).where(eq(automations.isDemonstration, false)).orderBy(automations.id).limit(250),
      db.select().from(incidents).orderBy(desc(incidents.detectedAt)).limit(100),
      db.select().from(automationRuns).orderBy(desc(automationRuns.startedAt)).limit(100),
      db.select().from(reliabilityMetrics).orderBy(desc(reliabilityMetrics.windowEnd)).limit(250),
    ]);
    if (!automationRecords.length) return NextResponse.json({ ...demonstrationReliabilityData, database: "connected_empty", activation: "D1 is connected and the AGT-008 schema is available, but no approved live automations are registered. Demonstration records remain read-only." });
    const latestMetric = (name: string) => metricRecords.find((record) => record.metricName === name)?.value ?? null;
    return NextResponse.json({
      source: "d1", database: "connected", asOf: new Date().toISOString(), activation: "Showing authenticated reliability evidence from the shared D1 data plane. Operational actions require a separate approved mutation adapter.",
      automations: automationRecords.map((record) => ({ id: record.id, name: record.name, owner: record.owner, connectedAgent: safeJsonArray(record.connectedAgentsJson)[0] ?? "Unassigned", sharedGoalId: safeJsonArray(record.sharedGoalsJson)[0] ?? "Missing", state: record.healthState as HealthState, releaseStatus: record.releaseStatus, lastAttemptedRun: null, lastSuccessfulRun: null, nextScheduledRun: null, heartbeatDueAt: null, successRate: null, retryRate: null, duplicateRate: null, queueDepth: null, dataQuality: "Awaiting current health evidence", dependencies: "See dependency register", controlsPresent: safeJsonArray(record.controlsJson), rollbackReady: Boolean(record.rollbackProcedure), killSwitchReady: Boolean(record.killSwitchReference), costWarning: null, isDemonstration: false })),
      incidents: incidentRecords.map((record) => ({ id: record.id, severity: record.severity as Severity, status: record.status as IncidentStatus, automationId: record.automationId, runId: record.runId, sharedGoalId: record.sharedGoalId, correlationId: record.correlationId, detectedAt: record.detectedAt, affectedSystems: safeJsonArray(record.affectedSystemsJson), affectedRecords: record.affectedRecordsSummary, evidence: record.evidence, containmentStatus: record.containmentStatus, businessImpact: record.businessImpact, owner: record.owner, decisionRequired: record.decisionRequired, nextAction: record.nextAction, recoveryTarget: record.recoveryTarget })),
      runs: runRecords.map((record) => ({ id: record.id, automationId: record.automationId, state: record.state, attemptedAt: record.startedAt, durationMs: record.durationMs ?? 0, recordsProcessed: record.recordsProcessed, successCount: record.successCount, failureCount: record.failureCount, retryCount: record.retryCount, duplicateCount: record.duplicateCount, correlationId: record.correlationId })),
      metrics: { successRate: latestMetric("automation_success_rate"), monitoredCoverage: latestMetric("monitored_workflow_coverage"), mttdMinutes: latestMetric("mean_time_to_detect"), mttaMinutes: latestMetric("mean_time_to_acknowledge"), mttrMinutes: latestMetric("mean_time_to_recover"), retrySuccess: latestMetric("retry_success"), duplicatePrevention: latestMetric("duplicate_prevention"), dataQualityFailures: latestMetric("data_quality_failures") ?? 0, unresolvedCorrectiveActions: latestMetric("unresolved_corrective_actions") ?? 0, falseAlertRate: latestMetric("false_alert_rate"), costPerSuccessfulOutcome: latestMetric("cost_per_successful_outcome"), observedHoursSaved: latestMetric("observed_hours_saved") },
    });
  } catch {
    return NextResponse.json({ ...demonstrationReliabilityData, database: "unavailable", activation: "The AGT-008 D1 adapter is unavailable or its migration is not yet active. Demonstration records are shown; no monitoring or action is being simulated." });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Reliability mutations require authenticated role authorization, confirmation, approval evidence where applicable, idempotency enforcement, and an audit event. This route is read-only." }, { status: 405, headers: { Allow: "GET" } });
}

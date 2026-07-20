import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { actions, agentMessages, changes, milestones, projects, projectDecisions, qualityReviews, risksAndIssues } from "@/db/schema";
import { calculateProjectHealth, demonstrationDeliveryData, type DeliveryData, type DeliveryHandoff, type Health } from "@/lib/delivery-control";
import { isAuthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ...demonstrationDeliveryData, database: "authorization_required", asOf: new Date().toISOString() });
  }

  try {
    const db = await getDb();
    const projectRows = await db.select().from(projects).where(eq(projects.isDemonstration, false)).orderBy(desc(projects.updatedAt)).limit(100);
    if (!projectRows.length) return NextResponse.json({ ...demonstrationDeliveryData, database: "connected_empty", asOf: new Date().toISOString() });

    const projectIds = new Set(projectRows.map((project) => project.id));
    const [actionRows, riskRows, milestoneRows, qualityRows, changeRows, decisionRows, messageRows] = await Promise.all([
      db.select().from(actions).orderBy(actions.dueDate),
      db.select().from(risksAndIssues).orderBy(desc(risksAndIssues.updatedAt)),
      db.select().from(milestones).orderBy(milestones.baselineDate),
      db.select().from(qualityReviews).orderBy(desc(qualityReviews.updatedAt)),
      db.select().from(changes).orderBy(desc(changes.updatedAt)),
      db.select().from(projectDecisions).orderBy(desc(projectDecisions.updatedAt)),
      db.select().from(agentMessages).orderBy(desc(agentMessages.createdAt)),
    ]);

    const scopedActions = actionRows.filter((row) => projectIds.has(row.projectId));
    const scopedRisks = riskRows.filter((row) => projectIds.has(row.projectId));
    const scopedMilestones = milestoneRows.filter((row) => projectIds.has(row.projectId));
    const scopedQuality = qualityRows.filter((row) => projectIds.has(row.projectId));

    const payload: DeliveryData = {
      source: "d1",
      database: "connected",
      asOf: new Date().toISOString(),
      activation: "Showing authorized project-control records stored in the shared D1 data plane.",
      projects: projectRows.map((project) => {
        const projectMilestones = scopedMilestones.filter((row) => row.projectId === project.id);
        const completed = projectMilestones.filter((row) => row.status === "Complete");
        const onTime = completed.filter((row) => row.completedDate && row.completedDate <= row.baselineDate).length;
        const next = projectMilestones.find((row) => row.status !== "Complete");
        const criticalIssueCount = scopedRisks.filter((row) => row.projectId === project.id && row.status !== "Closed" && row.severity === "Red").length;
        const failedQualityReview = scopedQuality.some((row) => row.projectId === project.id && (row.criticalDefects > 0 || row.majorDefects > 0) && row.status !== "Closed");
        const scheduleVariancePercent = project.baselineDurationDays && project.forecastCompletionDate && project.targetCompletionDate
          ? Math.round(((new Date(project.forecastCompletionDate).getTime() - new Date(project.targetCompletionDate).getTime()) / 86400000) / project.baselineDurationDays * 100)
          : 0;
        const computedHealth = calculateProjectHealth({ scheduleVariancePercent, marginVariancePoints: project.forecastMarginPointsVariance, criticalIssueCount, failedQualityReview });
        return {
          id: project.id, name: project.name, clientName: project.clientName, health: computedHealth,
          phase: project.status, projectManager: project.projectManager, targetCompletionDate: project.targetCompletionDate ?? "Unknown",
          nextMilestone: next?.name ?? "No open milestone", nextMilestoneDate: next?.baselineDate ?? "Unknown",
          milestonePerformance: completed.length ? Math.round(onTime / completed.length * 100) : 0,
          scheduleVariancePercent, marginVariancePoints: project.forecastMarginPointsVariance,
          qualityStatus: failedQualityReview ? "Defects open" : scopedQuality.some((row) => row.projectId === project.id) ? "Review active" : "Not recorded",
          closeoutReadiness: 0, authorizationStatus: project.authorizationStatus, sourceEvidence: project.sourceEvidence, isDemonstration: false,
        };
      }),
      actions: scopedActions.map((row) => ({ id: row.id, projectId: row.projectId, title: row.title, owner: row.accountableOwner, dueDate: row.dueDate, priority: row.priority, status: row.status, validationCriteria: row.validationCriteria })),
      risks: scopedRisks.map((row) => ({ id: row.id, projectId: row.projectId, type: row.recordType as "Risk" | "Issue" | "Exception", severity: row.severity as Health, statement: row.statement, evidence: row.evidence, impact: `${row.category} · impact ${row.impact}/5`, owner: row.accountableOwner, action: row.responseAction, dueDate: row.dueDate, escalation: row.escalationPath, validationCriteria: row.validationCriteria })),
      gates: scopedMilestones.filter((row) => row.status !== "Complete").slice(0, 12).map((row) => ({ id: row.id, projectId: row.projectId, name: row.name, dueDate: row.baselineDate, owner: row.accountableOwner, status: row.status, gateType: row.critical ? "Critical milestone" : "Milestone" })),
      changes: changeRows.filter((row) => projectIds.has(row.projectId)).map((row) => ({ id: row.id, projectId: row.projectId, title: row.title, classification: row.classification, status: row.status, scheduleEffectDays: row.scheduleEffectDays, approvalRequired: row.approvalRequired })),
      decisions: decisionRows.filter((row) => projectIds.has(row.projectId)).map((row) => ({ id: row.id, projectId: row.projectId, statement: row.statement, owner: row.decisionOwner, requiredBy: row.requiredBy ?? "Unknown", status: row.status })),
      handoffs: messageRows.filter((row) => row.messageType === "Handoff" && row.opportunityId && projectIds.has(row.opportunityId)).map((row) => {
        const body = safeObject(row.bodyJson);
        return { id: row.id, projectId: row.opportunityId!, from: row.senderAgentId, to: row.recipientAgentId ?? "Unassigned", objective: stringValue(body.objective), priority: stringValue(body.priority, "P2"), owner: stringValue(body.accountableOwner, "Unassigned"), dueDate: stringValue(body.dueDate, "Unknown"), status: row.status, correlationId: row.correlationId, acceptanceCriteria: stringValue(body.acceptanceCriteria) } satisfies DeliveryHandoff;
      }),
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ ...demonstrationDeliveryData, database: "unavailable", asOf: new Date().toISOString() });
  }
}

function safeObject(value: string): Record<string, unknown> {
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

function stringValue(value: unknown, fallback = "Not recorded") { return typeof value === "string" && value.trim() ? value : fallback; }

import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { checklistVersions, deliverables, deliverableVersions, qualityReviews, releaseGates, reviewFindings, verificationEvents } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { demonstrationQualityData, type FindingSeverity, type FindingStatus, type QualityData, type ReleaseRecommendation } from "@/lib/qaqc";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ ...demonstrationQualityData, database: "authorization_required", asOf: new Date().toISOString() });
  try {
    const db = await getDb();
    const reviewRows = await db.select().from(qualityReviews).orderBy(desc(qualityReviews.updatedAt)).limit(100);
    if (!reviewRows.length) return NextResponse.json({ ...demonstrationQualityData, database: "connected_empty", asOf: new Date().toISOString() });
    const [deliverableRows, versionRows, checklistRows, findingRows, gateRows, eventRows] = await Promise.all([
      db.select().from(deliverables), db.select().from(deliverableVersions), db.select().from(checklistVersions),
      db.select().from(reviewFindings).orderBy(desc(reviewFindings.updatedAt)), db.select().from(releaseGates).orderBy(desc(releaseGates.evaluatedAt)),
      db.select().from(verificationEvents).orderBy(desc(verificationEvents.occurredAt)).limit(50),
    ]);
    const deliverableById = new Map(deliverableRows.map((row) => [row.id, row]));
    const versionById = new Map(versionRows.map((row) => [row.id, row]));
    const checklistById = new Map(checklistRows.map((row) => [row.id, row]));
    const reviewIds = new Set(reviewRows.map((row) => row.id));
    const scopedFindings = findingRows.filter((row) => reviewIds.has(row.qualityReviewId));
    const payload: QualityData = {
      source: "d1", database: "connected", asOf: new Date().toISOString(),
      activation: "Showing authorized quality records stored in the shared D1 data plane. This read-only view does not perform reviews, mutate findings, or authorize issue.",
      reviews: reviewRows.map((row) => {
        const deliverable = deliverableById.get(row.deliverableId);
        const version = row.deliverableVersionId ? versionById.get(row.deliverableVersionId) : undefined;
        const checklist = row.checklistVersionId ? checklistById.get(row.checklistVersionId) : undefined;
        return { id: row.id, projectId: row.projectId, client: "Controlled project record", deliverableId: row.deliverableId, deliverableName: deliverable?.name ?? row.deliverableId, deliverableType: row.reviewType, version: version?.version ?? "Not recorded", candidateHash: row.candidateHash ?? version?.contentHash ?? "Not recorded", checklist: row.acceptanceChecklist, checklistVersion: checklist?.version ?? "Not recorded", reviewer: row.reviewer, author: row.author ?? version?.author ?? "Not recorded", dueDate: deliverable?.dueDate ?? "Unknown", status: row.status, coverage: row.status === "Closed" ? 100 : 0, recommendation: asRecommendation(row.releaseRecommendation ?? row.disposition), isDemonstration: false };
      }),
      findings: scopedFindings.map((row) => {
        const deliverable = deliverableById.get(row.deliverableId); const version = versionById.get(row.deliverableVersionId);
        return { id: row.id, projectId: row.projectId, deliverableId: row.deliverableId, deliverableName: deliverable?.name ?? row.deliverableId, deliverableType: "Controlled deliverable", version: version?.version ?? "Not recorded", requirement: row.requirementReference, location: row.location, description: row.description, evidence: row.verificationEvidence ?? "Evidence retained in finding record", severity: row.severity as FindingSeverity, impact: row.impact, correction: row.recommendedCorrection, owner: row.responsibleOwner, dueDate: row.dueDate ?? "Unknown", status: row.status as FindingStatus, reviewer: row.reviewer, author: version?.author ?? "Not recorded", isDemonstration: false };
      }),
      gates: gateRows.filter((row) => reviewIds.has(row.qualityReviewId)).map((row) => ({ id: row.id, projectId: row.projectId, deliverableId: row.deliverableId, version: versionById.get(row.deliverableVersionId)?.version ?? "Not recorded", recommendation: asRecommendation(row.recommendation), checklistComplete: row.checklistComplete, approvalsRecorded: row.approvalsRecorded, blockingFindings: row.blockingFindingCount, evaluatedAt: row.evaluatedAt })),
      events: eventRows.filter((row) => scopedFindings.some((finding) => finding.id === row.findingId)).map((row) => ({ id: row.id, findingId: row.findingId, actor: row.verifier, action: row.result, evidence: row.evidence, occurredAt: row.occurredAt })),
      handoffs: [],
      metrics: { firstPassYield: 0, defectDensity: 0, escapedDefects: 0, averageReviewHours: 0, reworkRate: 0, checklistCompletion: 0 },
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ ...demonstrationQualityData, database: "unavailable", asOf: new Date().toISOString() });
  }
}

function asRecommendation(value: string | null): ReleaseRecommendation {
  return ["Ready for approval", "Conditionally ready", "Rework required", "Blocked"].includes(value ?? "") ? value as ReleaseRecommendation : "Blocked";
}

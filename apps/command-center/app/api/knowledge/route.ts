import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { knowledgeAssets, knowledgeAuditEvents } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { calculateKnowledgeQuality, demonstrationKnowledgeData, verifiedKnowledgeData, type BusinessArea, type AssetType, type Classification, type LifecycleStatus } from "@/lib/knowledge";
import { safeJsonArray } from "@/lib/opportunities";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    if (!isAuthorized(request)) return NextResponse.json({ ...demonstrationKnowledgeData, database: "authorization_required", activation: "Secure access is required for live knowledge. Demonstration metadata and the sanitized legacy overview are shown; restricted records are never returned." });
    const [records, events] = await Promise.all([
      db.select().from(knowledgeAssets).where(eq(knowledgeAssets.isDemonstration, false)).orderBy(desc(knowledgeAssets.updatedAt)).limit(250),
      db.select().from(knowledgeAuditEvents).orderBy(desc(knowledgeAuditEvents.occurredAt)).limit(50),
    ]);
    if (!records.length) return NextResponse.json({ ...verifiedKnowledgeData, database: "published_snapshot", activation: "D1 is connected but contains no approved knowledge records yet. Showing the verified capability snapshot; full files remain in the permissioned local archive." });
    return NextResponse.json({
      source: "d1", database: "connected", asOf: new Date().toISOString(), activation: "Showing authorized knowledge metadata from D1. Source files remain in their canonical systems.",
      assets: records.filter((record) => record.classification !== "Restricted").map((record) => ({ id: record.id, title: record.title, description: record.description, businessArea: record.businessArea as BusinessArea, assetType: record.assetType as AssetType, owner: record.owner, author: record.author, reviewer: record.reviewer, approver: record.approver, status: record.lifecycleStatus as LifecycleStatus, classification: record.classification as Classification, version: record.currentVersion, effectiveDate: record.effectiveDate, reviewDate: record.reviewDate, sourceSystem: record.sourceSystem, canonicalLocation: record.canonicalLocation, sourceEvidence: record.sourceEvidence, contentHash: record.contentHash, relatedProject: record.relatedProjectId, relatedAgent: record.relatedAgentId, supersedes: record.supersedesAssetId, supersededBy: record.supersededByAssetId, tags: safeJsonArray(record.tagsJson), synonyms: safeJsonArray(record.synonymsJson), quality: calculateKnowledgeQuality({ ownership: record.owner ? 100 : 0, freshness: "unknown", completeness: "unknown", findability: 100, usage: "unknown", linkHealth: "unknown" }), linkStatus: "Unknown", isAuthoritative: record.isAuthoritative, isDemonstration: record.isDemonstration, updatedAt: record.updatedAt })),
      alerts: [], auditEvents: events.map((event) => ({ id: event.id, assetId: event.assetId, actorAgentId: event.actorAgentId, action: event.action, reason: event.reason, sourceEvidence: event.sourceEvidence, correlationId: event.correlationId, previousState: event.previousState, occurredAt: event.occurredAt, isDemonstration: false })),
    });
  } catch {
    return NextResponse.json({ ...verifiedKnowledgeData, database: "published_snapshot", activation: "D1 is unavailable on this host. Showing verified governed metadata; connect the local archive explicitly to open full source files without uploading them." });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Knowledge mutation requires the approved authenticated intake workflow; this endpoint is read-only." }, { status: 405, headers: { Allow: "GET" } });
}

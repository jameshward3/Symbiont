import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { monitoringQueries, opportunities } from "@/db/schema";
import { activeMonitoringQueries, safeJsonArray, verifiedOpportunitySnapshot } from "@/lib/opportunities";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const [records, queries] = await Promise.all([
      db.select().from(opportunities).where(eq(opportunities.isDemonstration, false)).orderBy(desc(opportunities.observedAt)).limit(100),
      db.select().from(monitoringQueries).where(eq(monitoringQueries.ownerAgentId, "AGT-009")).orderBy(desc(monitoringQueries.updatedAt)).limit(50),
    ]);

    if (records.length === 0) {
      return NextResponse.json({
        source: "verified_snapshot",
        database: "published_snapshot",
        asOf: new Date().toISOString(),
        opportunities: verifiedOpportunitySnapshot,
        monitoringQueries: queries.length ? queries : activeMonitoringQueries,
        activation: "Showing the last approved official-source snapshot while the connected D1 register awaits its next live record.",
      });
    }

    return NextResponse.json({
      source: "d1",
      database: "connected",
      asOf: new Date().toISOString(),
      opportunities: records.map((record) => ({
        ...record,
        risks: safeJsonArray(record.risksJson),
        missingInformation: safeJsonArray(record.missingInformationJson),
      })),
      monitoringQueries: queries,
      activation: "Showing verified records currently stored in D1.",
    });
  } catch {
    return NextResponse.json({
      source: "verified_snapshot",
      database: "published_snapshot",
      asOf: new Date().toISOString(),
      opportunities: verifiedOpportunitySnapshot,
      monitoringQueries: activeMonitoringQueries,
      activation: "Verified official-source snapshot published July 21, 2026. D1 is the live system of record on the operational command center.",
    });
  }
}

import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { monitoringQueries, opportunities } from "@/db/schema";
import { demonstrationOpportunities, demonstrationQueries, safeJsonArray } from "@/lib/opportunities";

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
        source: "demonstration",
        database: "connected_empty",
        asOf: new Date().toISOString(),
        opportunities: demonstrationOpportunities,
        monitoringQueries: queries.length ? queries : demonstrationQueries,
        activation: "D1 is available; no live Scout records have been written.",
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
      source: "demonstration",
      database: "unavailable",
      asOf: new Date().toISOString(),
      opportunities: demonstrationOpportunities,
      monitoringQueries: demonstrationQueries,
      activation: "D1 is unavailable; no scan or database write is being simulated.",
    });
  }
}

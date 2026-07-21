import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isScoutInternalRequest, parseScoutIngest, SCOUT_GOAL_ID } from "../../lib/scout-internal.ts";

test("Scout mutation boundary requires the dedicated internal secret", () => {
  const previous = process.env.SCOUT_INTERNAL_KEY;
  process.env.SCOUT_INTERNAL_KEY = "test-internal-secret";
  try {
    assert.equal(isScoutInternalRequest(new Request("https://example.test", { headers:{ "x-symbiont-internal-key":"test-internal-secret" } })), true);
    assert.equal(isScoutInternalRequest(new Request("https://example.test")), false);
    assert.equal(isScoutInternalRequest(new Request("https://example.test", { headers:{ "x-symbiont-internal-key":"wrong" } })), false);
  } finally { if (previous === undefined) delete process.env.SCOUT_INTERNAL_KEY; else process.env.SCOUT_INTERNAL_KEY = previous; }
});

test("Scout ingest rejects demonstrations and accepts a complete canonical record", () => {
  const base = {
    action:"ingest_run", runId:"RUN-AGT009-001", sharedGoalId:SCOUT_GOAL_ID, correlationId:"CORR-001", startedAt:"2026-07-20T12:00:00Z", completedAt:"2026-07-20T12:05:00Z", sourcesChecked:3, candidatesFound:1,
    opportunities:[{ id:"OPP-2026-009", issuer:"Official Issuer", title:"Reality Capture RFQ", canonicalUrl:"https://example.gov/rfq", geographyKey:"us-national", procurementType:"RFQ", scope:"Reality capture and BIM", fitRationale:"Direct fit", scores:{ serviceFit:90,buyerFit:80,timing:70,value:60,evidence:95,access:85,recurrence:70 }, confidence:90, freshness:"Observed today", risks:[], missingInformation:["Stated value"], nextAction:"AGT-002 review", observedAt:"2026-07-20T12:04:00Z", sourceKind:"Official procurement portal", evidence:{ id:"EVD-001", canonicalUrl:"https://example.gov/rfq", sourceTitle:"Official RFQ", sourceType:"Canonical solicitation", evidenceSummary:"Issuer posted the RFQ.", contentHash:"a".repeat(64), confidence:95, observedAt:"2026-07-20T12:04:00Z" } }],
  };
  const parsed = parseScoutIngest(base);
  assert.equal(parsed.opportunities[0].canonicalUrl, "https://example.gov/rfq");
  assert.throws(() => parseScoutIngest({ ...base, opportunities:[{ ...base.opportunities[0], id:"DEMO-OPP-001" }] }), /DEMONSTRATION_WRITE_REJECTED/);
  assert.throws(() => parseScoutIngest({ ...base, correlationId:"" }), /INVALID_CORRELATIONID/);
});

test("production activation migration registers NJ/NY monitoring and verified live records", async () => {
  const sql = await readFile(new URL("../../drizzle/0010_opportunity_scout_activation.sql", import.meta.url), "utf8");
  assert.match(sql, /AGT-009[^\n]+Active — governed/);
  assert.match(sql, /QRY-AGT009-NY-STATE/);
  assert.match(sql, /QRY-AGT009-NY-LOCAL/);
  assert.match(sql, /QRY-AGT009-NJ-STATE/);
  assert.match(sql, /QRY-AGT009-NJ-LOCAL/);
  assert.match(sql, /OPP-2026-RIOC-261379/);
  assert.match(sql, /OPP-2026-NJDPP-T3163/);
  assert.match(sql, /RUN-AGT009-20260721-NYNJ/);
  assert.doesNotMatch(sql, /DEMO-OPP/);
});

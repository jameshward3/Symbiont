import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { opportunityDedupeKey, scoreScoutOpportunity } from "../../lib/agents/scout.ts";

test("Scout routing enforces 70 and 50 point thresholds", () => {
  assert.equal(scoreScoutOpportunity({ serviceFit:70,buyerFit:70,timing:70,value:70,evidence:70,access:70,recurrence:70 }).route, "sales_operations");
  assert.equal(scoreScoutOpportunity({ serviceFit:50,buyerFit:50,timing:50,value:50,evidence:50,access:50,recurrence:50 }).route, "watchlist");
  assert.equal(scoreScoutOpportunity({ serviceFit:49,buyerFit:49,timing:49,value:49,evidence:49,access:49,recurrence:49 }).route, "archive");
  assert.throws(() => scoreScoutOpportunity({ serviceFit:101,buyerFit:50,timing:50,value:50,evidence:50,access:50,recurrence:50 }));
});

test("Scout deduplication normalizes titles and tracking URLs", () => {
  const common = { issuer:"Metro Authority", solicitationNumber:"RFQ-104", deadlineAt:"2026-08-18T18:00:00Z", geography:"us-ga-atlanta" };
  const first = opportunityDedupeKey({ ...common, title:"Terminal BIM — Record Model", canonicalUrl:"https://example.gov/rfq/104?utm_source=alert" });
  const second = opportunityDedupeKey({ ...common, title:"terminal bim record model", canonicalUrl:"https://example.gov/rfq/104" });
  assert.equal(first, second);
});

test("shared D1 migration defines Scout contracts and governed handoffs", async () => {
  const sql = await readFile(new URL("../../drizzle/0000_workable_praxagora.sql", import.meta.url), "utf8");
  for (const table of ["agents","shared_goals","goal_assignments","agent_messages","opportunities","opportunity_evidence","scout_runs","monitoring_queries"]) assert.match(sql, new RegExp(`CREATE TABLE .${table}.`, "i"));
  assert.match(sql, /shared_goal_id[^;]+NOT NULL/i);
  assert.match(sql, /correlation_id[^;]+NOT NULL/i);
  assert.match(sql, /opportunities_dedupe_idx/);
  assert.match(sql, /opportunity_evidence_hash_idx/);
  assert.match(sql, /sales_operations','watchlist','archive/);
});

test("Scout surface and skill label demonstrations and authority boundaries", async () => {
  const [page, skill, brief] = await Promise.all([
    readFile(new URL("../../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../../../.agents/skills/symbiont-opportunity-scout/SKILL.md", import.meta.url), "utf8"),
    readFile(new URL("../../../../.agents/skills/symbiont-opportunity-scout/assets/opportunity-brief-template.md", import.meta.url), "utf8"),
  ]);
  for (const content of [page, brief]) assert.match(content, /demonstration/i);
  assert.match(page, /Opportunity Scout/);
  assert.match(page, /No live scan, source connection, database write, or AGT-002 handoff occurred/);
  assert.match(skill, /Never contact a prospect/i);
  assert.match(skill, /shared goal ID, correlation ID/i);
  assert.match(brief, /Canonical URL/);
});

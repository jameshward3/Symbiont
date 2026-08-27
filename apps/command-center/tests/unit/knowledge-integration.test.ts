import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

test("D1 migration defines the governed knowledge system and immutable evidence fields", async () => {
  const sql = await readFile(new URL("drizzle/0003_outstanding_blur.sql", root), "utf8");
  for (const table of ["knowledge_assets", "knowledge_versions", "knowledge_relationships", "knowledge_sources", "knowledge_tags", "knowledge_synonyms", "knowledge_reviews", "knowledge_quality_scores", "knowledge_access_classifications", "knowledge_audit_events", "knowledge_conflicts", "archive_records"]) assert.match(sql, new RegExp(`CREATE TABLE .${table}.`));
  for (const field of ["actor_agent_id", "correlation_id", "previous_state", "source_evidence", "content_hash", "classification", "lifecycle_status"]) assert.match(sql, new RegExp(field));
});

test("Knowledge UI and skill expose demonstration, access, archive, and injection controls", async () => {
  const [ui, skill, access, lifecycle] = await Promise.all([
    readFile(new URL("app/knowledge-control.tsx", root), "utf8"),
    readFile(new URL("../../.agents/skills/symbiont-knowledge-steward/SKILL.md", root), "utf8"),
    readFile(new URL("../../.agents/skills/symbiont-knowledge-steward/references/access-and-security.md", root), "utf8"),
    readFile(new URL("../../.agents/skills/symbiont-knowledge-steward/references/lifecycle-and-supersession.md", root), "utf8"),
  ]);
  assert.match(ui, /DEMONSTRATION INDEX/); assert.match(ui, /Legacy Exchange/); assert.match(ui, /Human approval/);
  assert.match(ui, /Browse by need/); assert.match(ui, /Ready to use/); assert.match(ui, /Reference only/); assert.match(ui, /Governance and audit trail/);
  assert.match(ui, /Connect full-file archive/); assert.match(ui, /never uploaded/i); assert.match(ui, /Open matched opportunities/);
  assert.match(skill, /untrusted source content/i); assert.match(skill, /permanently delete/i); assert.match(skill, /Active authoritative records/i);
  assert.match(access, /prompt-injection/i); assert.match(access, /client-restricted/i); assert.match(lifecycle, /Issued versions are immutable/i);
});

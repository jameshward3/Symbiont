import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../../../supabase/migrations/202607200001_shared_agent_data_plane.sql", import.meta.url);
test("migration defines all shared tables and security controls", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  for (const table of ["organizations","profiles","agents","agent_capabilities","agent_permissions","goals","goal_members","work_items","work_item_dependencies","agent_runs","agent_messages","goal_events","decisions","artifacts","memory_entries","accounts","contacts","opportunities","sales_activities","proposal_drafts","handoffs"]) assert.match(sql, new RegExp(`create table ${table}\\b`, "i"));
  assert.match(sql, /for update skip locked/i); assert.match(sql, /unique\(organization_id, idempotency_key\)/i); assert.match(sql, /enable row level security/i); assert.match(sql, /audit history is append-only/i); assert.match(sql, /human approval required/i);
});
test("future agents use rows, not migrations", async () => { const sql = await readFile(migrationUrl, "utf8"); assert.match(sql, /unique \(organization_id, stable_id\)/i); assert.doesNotMatch(sql, /agent_003|agt_003/i); });

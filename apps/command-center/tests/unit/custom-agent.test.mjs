import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("custom agent uses current required fields and delegates to the skill", async () => {
  const text = await readFile(new URL("../../../../.codex/agents/symbiont-sales-ops.toml", import.meta.url), "utf8");
  for (const key of ["name", "description", "developer_instructions"]) assert.match(text, new RegExp(`^${key}\\s*=`, "m"));
  assert.match(text, /\$symbiont-sales-ops/); assert.match(text, /L1 Draft and Recommend/); assert.doesNotMatch(text, /OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});

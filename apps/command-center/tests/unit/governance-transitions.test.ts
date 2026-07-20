import assert from "node:assert/strict";
import test from "node:test";
import { mayTransitionGoal, validateHandoff } from "../../lib/agents/governance.ts";

test("material goal activation requires approval", () => { assert.equal(mayTransitionGoal("Proposed", "Approved", false), false); assert.equal(mayTransitionGoal("Proposed", "Approved", true), true); assert.equal(mayTransitionGoal("Active", "Complete", true), false); });
test("inter-agent handoff requires distinct agents and acceptance criteria", () => { const result = validateHandoff({ fromAgentId: "AGT-002", toAgentId: "AGT-001", objective: "Review proposal", acceptanceCriteria: ["Scope traced"], correlationId: "corr-1" }); assert.equal(result.status, "Review"); assert.throws(() => validateHandoff({ fromAgentId: "AGT-002", toAgentId: "AGT-002", objective: "Loop", acceptanceCriteria: [], correlationId: "corr-2" })); });

import assert from "node:assert/strict";
import test from "node:test";
import { scoreOpportunity } from "../../lib/agents/qualification.ts";

test("scores and recommends pursue", () => assert.deepEqual(scoreOpportunity({ strategicFit: 4, clientNeed: 4, buyerAccess: 4, valueBudget: 3.5, deliveryFeasibility: 4, timing: 3, repeatability: 5 }), { score: 79, recommendation: "Pursue" }));
test("critical gate forces decline", () => assert.equal(scoreOpportunity({ strategicFit: 5, clientNeed: 5, buyerAccess: 5, valueBudget: 5, deliveryFeasibility: 5, timing: 5, repeatability: 5 }, true).recommendation, "Decline"));
test("rejects invented factor ranges", () => assert.throws(() => scoreOpportunity({ strategicFit: 6, clientNeed: 1, buyerAccess: 1, valueBudget: 1, deliveryFeasibility: 1, timing: 1, repeatability: 1 })));

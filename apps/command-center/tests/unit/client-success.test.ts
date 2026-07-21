import assert from "node:assert/strict"; import test from "node:test";
import { assertExternalCommunicationApproved, assertSupportedValueClaim, redactClientDraft, routeExpansionSignal, scoreClientHealth } from "../../lib/client-success.ts";
test("health score is explainable",()=>{const result=scoreClientHealth({outcomeProgress:80,adoption:75,delivery:90});assert.equal(result.health,"Green");assert.match(result.explanation,/outcomeProgress: 80/)});
test("missing evidence is Unknown and never Green",()=>assert.equal(scoreClientHealth({delivery:100}).health,"Unknown"));
test("external communication requires approval",()=>assert.throws(()=>assertExternalCommunicationApproved("Draft"),/approval/));
test("unsupported ROI claims are refused",()=>assert.throws(()=>assertSupportedValueClaim("timesheet",false),/client confirmation/));
test("confidential internal material is removed",()=>assert.doesNotMatch(redactClientDraft("Update. Internal risk is margin erosion. Milestone met."),/margin erosion/i));
test("commercial handoffs route only to AGT-002",()=>{assert.throws(()=>routeExpansionSignal("AGT-013"));assert.match(routeExpansionSignal("AGT-002"),/no pricing/)});

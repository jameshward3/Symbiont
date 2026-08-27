import test from "node:test";
import assert from "node:assert/strict";
import {classifyConfidence,verifiedResearchData} from "../../lib/research.ts";
test("high confidence requires primary current corroborated evidence",()=>assert.equal(classifyConfidence({primary:true,current:true,corroborated:true,conflicts:false}),"High"));
test("published research separates historical evidence from the new 3D prerogative",()=>{assert.ok(verifiedResearchData.requests.some(item=>/Historical network/.test(item.title)));assert.ok(verifiedResearchData.requests.some(item=>/new company prerogative/.test(item.title)));});

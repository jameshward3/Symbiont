import assert from "node:assert/strict";
import test from "node:test";
import { capabilityProfiles, matchOpportunityToKnowledge } from "../../lib/capability-matching.ts";
import { verifiedKnowledgeData } from "../../lib/knowledge.ts";
import { verifiedOpportunitySnapshot } from "../../lib/opportunities.ts";

test("historical capability profiles are sanitized and do not misstate evidence counts", () => {
  assert.equal(capabilityProfiles.length, 8);
  assert.ok(capabilityProfiles.every((profile) => profile.evidenceUnit.includes("hits")));
  assert.equal(capabilityProfiles.find((profile) => profile.id === "CAP-3D")?.kind, "new_prerogative");
  assert.equal(capabilityProfiles.find((profile) => profile.id === "CAP-3D")?.evidenceCount, 0);
});

test("knowledge briefs match live scope to historical disciplines and label new prerogatives", () => {
  const communications = verifiedOpportunitySnapshot.find((item) => item.id === "OPP-2026-NYCOTI-85826P0003");
  assert.ok(communications);
  const commsBrief = matchOpportunityToKnowledge(communications);
  assert.ok(commsBrief.matches.some((match) => match.id === "CAP-NETWORK" && match.kind === "historical"));
  assert.ok(commsBrief.matches.some((match) => match.id === "CAP-CABLING" && match.kind === "historical"));
  assert.match(commsBrief.starterNarrative, /Internal|Symbiont|evidence-led/i);

  const scanning = verifiedOpportunitySnapshot.find((item) => item.id === "OPP-2026-RIOC-261379");
  assert.ok(scanning);
  const scanBrief = matchOpportunityToKnowledge(scanning);
  assert.ok(scanBrief.matches.some((match) => match.id === "CAP-3D" && match.kind === "new_prerogative"));
  assert.match(scanBrief.evidenceWarning, /full files/i);
});

test("verified capability snapshot never exposes demonstration or restricted file paths", () => {
  assert.equal(verifiedKnowledgeData.source, "verified_snapshot");
  assert.ok(verifiedKnowledgeData.assets.every((asset) => !asset.isDemonstration));
  assert.ok(verifiedKnowledgeData.assets.every((asset) => asset.classification === "Internal"));
  assert.ok(verifiedKnowledgeData.assets.every((asset) => !asset.canonicalLocation.includes("Legacy Symbiont Archive")));
});

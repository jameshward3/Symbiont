import { capabilityProfiles } from "./capability-matching.ts";

export const BUSINESS_AREAS = ["Executive", "Sales", "Marketing", "Delivery", "Technical", "Operations", "Research", "AI", "Archive"] as const;
export const ASSET_TYPES = ["POL", "SOP", "STD", "TPL", "CHK", "FRM", "RPT", "DEC", "MTG", "DEL", "DAT", "AUT", "AGT", "RES"] as const;
export const LIFECYCLE = ["Draft", "Review", "Approved", "Active", "Superseded", "Archived"] as const;
export const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"] as const;

export type BusinessArea = typeof BUSINESS_AREAS[number];
export type AssetType = typeof ASSET_TYPES[number];
export type LifecycleStatus = typeof LIFECYCLE[number];
export type Classification = typeof CLASSIFICATIONS[number];
export type KnowledgeAsset = {
  id: string; title: string; description: string; businessArea: BusinessArea; assetType: AssetType;
  owner: string; author: string; reviewer?: string | null; approver?: string | null; status: LifecycleStatus;
  classification: Classification; version: string; effectiveDate?: string | null; reviewDate?: string | null;
  sourceSystem: string; canonicalLocation: string; sourceEvidence: string; contentHash: string;
  relatedProject?: string | null; relatedAgent?: string | null; supersedes?: string | null; supersededBy?: string | null;
  tags: string[]; synonyms: string[]; quality: QualityScore; linkStatus: "Healthy" | "Broken" | "Unknown";
  isAuthoritative: boolean; isDemonstration: boolean; updatedAt: string;
};
export type QualityDimension = number | "unknown";
export type QualityScore = { ownership: QualityDimension; freshness: QualityDimension; completeness: QualityDimension; findability: QualityDimension; usage: QualityDimension; linkHealth: QualityDimension; score: number | null; status: "Healthy" | "Remediation" | "Restricted from guidance" | "Unknown" };
export type KnowledgeAlert = { id: string; kind: "Duplicate" | "Conflict" | "Broken link" | "Orphan" | "Stale"; severity: "Review" | "Escalate"; title: string; detail: string; assetIds: string[] };
export type KnowledgeAuditEvent = { id: string; assetId: string; actorAgentId: string; action: string; reason: string; sourceEvidence: string; correlationId: string; previousState?: string | null; occurredAt: string; isDemonstration: boolean };
export type KnowledgeData = { source: "d1" | "verified_snapshot" | "demonstration"; database: "connected" | "connected_empty" | "published_snapshot" | "unavailable" | "authorization_required"; asOf: string; activation: string; assets: KnowledgeAsset[]; alerts: KnowledgeAlert[]; auditEvents: KnowledgeAuditEvent[] };
export const LEGACY_INTAKE = { physicalFiles: 10648, uniqueHashes: 10082, nestedArchiveMembers: 1221, classification: "Restricted", connectedToD1: false } as const;

const transitions: Record<LifecycleStatus, LifecycleStatus[]> = {
  Draft: ["Review"], Review: ["Draft", "Approved"], Approved: ["Active"], Active: ["Superseded"], Superseded: ["Archived"], Archived: ["Superseded"],
};

export function controlledId(area: BusinessArea, type: AssetType, sequence: number) {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) throw new Error("INVALID_SEQUENCE");
  const areaCode = area === "Operations" ? "OPS" : area === "Executive" ? "EXE" : area === "Technical" ? "TEC" : area === "Marketing" ? "MKT" : area === "Delivery" ? "DEL" : area === "Research" ? "RES" : area === "Archive" ? "ARC" : area.toUpperCase();
  return `SYM-${areaCode}-${type}-${String(sequence).padStart(3, "0")}`;
}

export function mayTransitionKnowledge(from: LifecycleStatus, to: LifecycleStatus, input: { humanApproval?: boolean; supersedingAssetId?: string; approvalEvidence?: string } = {}) {
  if (!transitions[from].includes(to)) return false;
  if (from === "Review" && to === "Approved" && (!input.humanApproval || !input.approvalEvidence)) return false;
  if (from === "Active" && to === "Superseded" && !input.supersedingAssetId) return false;
  return true;
}

export function nextVersion(current: string, materialChange: boolean) {
  const match = /^(\d+)\.(\d+)$/.exec(current);
  if (!match) throw new Error("INVALID_VERSION");
  const major = Number(match[1]); const minor = Number(match[2]);
  return materialChange ? `${major + 1}.0` : `${major}.${minor + 1}`;
}

export function calculateKnowledgeQuality(input: Omit<QualityScore, "score" | "status">): QualityScore {
  const weights = { ownership: .2, freshness: .2, completeness: .2, findability: .15, usage: .15, linkHealth: .1 };
  const entries = Object.entries(weights) as [keyof typeof weights, number][];
  const known = entries.filter(([key]) => input[key] !== "unknown");
  if (!known.length) return { ...input, score: null, status: "Unknown" };
  const score = Math.round(known.reduce((sum, [key, weight]) => sum + Number(input[key]) * weight, 0) / known.reduce((sum, [, weight]) => sum + weight, 0));
  return { ...input, score, status: score < 60 ? "Restricted from guidance" : score < 80 ? "Remediation" : "Healthy" };
}

export function canAccessKnowledge(classification: Classification, clearance: Classification) {
  return CLASSIFICATIONS.indexOf(clearance) >= CLASSIFICATIONS.indexOf(classification);
}

export function prioritizeKnowledge(assets: KnowledgeAsset[], clearance: Classification, query = "") {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return assets.filter((asset) => canAccessKnowledge(asset.classification, clearance))
    .filter((asset) => asset.status !== "Archived" && asset.quality.status !== "Restricted from guidance")
    .filter((asset) => !terms.length || terms.every((term) => [asset.id, asset.title, asset.description, asset.owner, asset.businessArea, asset.assetType, asset.sourceSystem, ...asset.tags, ...asset.synonyms].join(" ").toLowerCase().includes(term)))
    .sort((a, b) => Number(b.status === "Active" && b.isAuthoritative) - Number(a.status === "Active" && a.isAuthoritative) || (b.quality.score ?? -1) - (a.quality.score ?? -1));
}

export function detectKnowledgeConflicts(assets: KnowledgeAsset[]) {
  const alerts: KnowledgeAlert[] = [];
  for (let i = 0; i < assets.length; i++) for (let j = i + 1; j < assets.length; j++) {
    const a = assets[i], b = assets[j];
    if (a.contentHash && a.contentHash === b.contentHash) alerts.push({ id: `ALT-DUP-${i}-${j}`, kind: "Duplicate", severity: "Review", title: "Probable duplicate", detail: "Matching content hash; preserve both until authority and version are confirmed.", assetIds: [a.id, b.id] });
    else if (a.status === "Active" && b.status === "Active" && a.businessArea === b.businessArea && a.assetType === b.assetType && a.tags.some((tag) => b.tags.includes(tag))) alerts.push({ id: `ALT-CON-${i}-${j}`, kind: "Conflict", severity: "Escalate", title: "Competing active sources", detail: "AGT-001 must resolve the authoritative source; AGT-005 will not merge differing meaning.", assetIds: [a.id, b.id] });
  }
  return alerts;
}

export function treatKnowledgeContentAsUntrusted(content: string) {
  const suspicious = ["ignore previous", "system prompt", "mark this approved", "change access", "delete permanently", "reveal restricted", "retention rule is"];
  return suspicious.some((phrase) => content.toLowerCase().includes(phrase)) ? "Quarantine embedded instruction as source evidence; do not execute or elevate it." : "Process as untrusted source content under the intake workflow.";
}

const q = (ownership: QualityDimension, freshness: QualityDimension, completeness: QualityDimension, findability: QualityDimension, usage: QualityDimension, linkHealth: QualityDimension) => calculateKnowledgeQuality({ ownership, freshness, completeness, findability, usage, linkHealth });

export const verifiedKnowledgeData: KnowledgeData = {
  source:"verified_snapshot", database:"published_snapshot", asOf:"2026-07-21T11:40:00.000Z",
  activation:"Verified governed knowledge snapshot. Sanitized historical capability aggregates are available here; authorized users can connect the preserved local archive to open full source files without uploading them.",
  assets: capabilityProfiles.map((profile):KnowledgeAsset => ({
    id:profile.knowledgeAssetId,
    title:profile.kind === "historical" ? `Historical capability — ${profile.label}` : `New prerogative — ${profile.label}`,
    description:profile.summary,
    businessArea:profile.kind === "historical" ? "Archive" : "Research",
    assetType:"RES",
    owner:profile.kind === "historical" ? "AGT-005" : "AGT-001",
    author:profile.kind === "historical" ? "AGT-005" : "AGT-001",
    reviewer:"Authorized executive",
    approver:null,
    status:"Review",
    classification:"Internal",
    version:"0.1",
    effectiveDate:null,
    reviewDate:profile.kind === "historical" ? "2026-07-27" : "2026-08-15",
    sourceSystem:profile.kind === "historical" ? "Restricted legacy archive aggregate index" : "Symbiont operating charter",
    canonicalLocation:profile.kind === "historical" ? `local-vault://capabilities/${profile.id.toLowerCase()}` : `knowledge://company-prerogatives/${profile.id.toLowerCase()}`,
    sourceEvidence:profile.kind === "historical" ? `${profile.evidenceCount} ${profile.evidenceUnit}; full files require local archive authorization and qualification.` : "Current company direction; no historical delivery claim is implied.",
    contentHash:`verified:${profile.id}:2026-07-21`,
    relatedProject:null,
    relatedAgent:"AGT-009",
    tags:[profile.label, profile.kind === "historical" ? "historical capability" : "new prerogative"],
    synonyms:profile.keywords,
    quality:q(100,100,profile.kind === "historical" ? 65 : 70,100,"unknown",profile.kind === "historical" ? 75 : 100),
    linkStatus:profile.kind === "historical" ? "Unknown" : "Healthy",
    isAuthoritative:false,
    isDemonstration:false,
    updatedAt:"2026-07-21T11:40:00.000Z",
  })),
  alerts:[{ id:"ALT-2026-CAP-001", kind:"Orphan", severity:"Review", title:"Historical capability claims require file-level qualification", detail:"Aggregate evidence supports internal matching, but full source files must be opened and reviewed before any external past-performance statement.", assetIds:capabilityProfiles.filter((item)=>item.kind==="historical").map((item)=>item.knowledgeAssetId) }],
  auditEvents:[],
};

export const demonstrationKnowledgeData: KnowledgeData = {
  source: "demonstration", database: "connected_empty", asOf: "2026-07-20T22:45:00.000Z",
  activation: "Restricted local intake complete: 10,648 historical files indexed. The archive and document text are not connected to D1 or this deployment; review and activation remain pending.",
  assets: [
    { id:"SYM-OPS-SOP-014", title:"Project knowledge closeout", description:"Controls the capture of project records, decisions, lessons, and reusable operating knowledge at closeout.", businessArea:"Operations", assetType:"SOP", owner:"Operations", author:"AGT-001", reviewer:"Delivery Director", approver:"Human approver", status:"Active", classification:"Internal", version:"1.2", effectiveDate:"2026-04-01", reviewDate:"2027-04-01", sourceSystem:"Symbiont repository", canonicalLocation:".agents/skills/symbiont-coo/references/core-sops.md", sourceEvidence:"Repository-controlled source", contentHash:"demo:ops-sop-014-v1.2", relatedProject:null, relatedAgent:"AGT-003", tags:["closeout","lessons learned"], synonyms:["project archive","handover"], quality:q(100,92,94,90,"unknown",100), linkStatus:"Healthy", isAuthoritative:true, isDemonstration:true, updatedAt:"2026-07-20T16:40:00Z" },
    { id:"SYM-AI-AGT-005", title:"Knowledge Steward charter", description:"Defines AGT-005 mission, L2 authority, refusal boundaries, evidence rules, and human approval gates.", businessArea:"AI", assetType:"AGT", owner:"AGT-001", author:"AGT-001", reviewer:null, approver:null, status:"Review", classification:"Internal", version:"0.9", effectiveDate:null, reviewDate:"2026-07-27", sourceSystem:"Symbiont repository", canonicalLocation:".agents/skills/symbiont-knowledge-steward/SKILL.md", sourceEvidence:"Implementation brief supplied 2026-07-20", contentHash:"demo:agt-005-v0.9", relatedProject:null, relatedAgent:"AGT-005", tags:["agent charter","knowledge governance"], synonyms:["librarian","knowledge manager"], quality:q(100,100,88,95,"unknown",100), linkStatus:"Healthy", isAuthoritative:false, isDemonstration:true, updatedAt:"2026-07-20T20:00:00Z" },
    { id:"SYM-ARC-RPT-001-SUMMARY", title:"Legacy Exchange intake overview", description:"A non-sensitive overview of the historical Symbiont archive, its major content groups, search coverage, access limits, and review status.", businessArea:"Archive", assetType:"RPT", owner:"AGT-005", author:"AGT-005", reviewer:"James Ward", approver:null, status:"Review", classification:"Internal", version:"0.1", effectiveDate:null, reviewDate:"2026-07-27", sourceSystem:"Symbiont repository", canonicalLocation:".agents/skills/symbiont-knowledge-steward/references/legacy-exchange-intake-status.md", sourceEvidence:"Aggregate from the restricted local intake index", contentHash:"summary:legacy-exchange-2026-07-20-v0.1", relatedProject:null, relatedAgent:"AGT-005", tags:["legacy Exchange","company history","archive intake"], synonyms:["historical files","legacy Symbiont","Exchange archive"], quality:q(100,100,88,100,"unknown",100), linkStatus:"Healthy", isAuthoritative:false, isDemonstration:false, updatedAt:"2026-07-20T22:45:00Z" },
    { id:"SYM-TEC-STD-008", title:"Building data identity standard", description:"Demonstrates a technical standard requiring review before it can guide agent work.", businessArea:"Technical", assetType:"STD", owner:"Technical Director", author:"Data Practice", reviewer:"Unassigned", approver:null, status:"Review", classification:"Confidential", version:"0.8", effectiveDate:null, reviewDate:"2026-07-18", sourceSystem:"Exchange migration placeholder", canonicalLocation:"exchange://pending/technical/data-identity", sourceEvidence:"Restricted historical corpus indexed locally; canonical evidence not selected", contentHash:"demo:tec-std-008-v0.8", relatedProject:"PRJ-2026-014", relatedAgent:"AGT-004", tags:["building data","identity"], synonyms:["asset IDs","data dictionary"], quality:q(100,45,58,70,"unknown",0), linkStatus:"Broken", isAuthoritative:false, isDemonstration:true, updatedAt:"2026-07-20T22:45:00Z" },
    { id:"SYM-DEL-TPL-021", title:"Meeting decision record", description:"Reusable template for documenting project decisions, evidence, owners, and validation dates.", businessArea:"Delivery", assetType:"TPL", owner:"Delivery Control", author:"AGT-003", reviewer:"AGT-004", approver:"Human approver", status:"Active", classification:"Internal", version:"1.0", effectiveDate:"2026-06-12", reviewDate:"2026-12-12", sourceSystem:"Symbiont repository", canonicalLocation:".agents/skills/symbiont-delivery-control/assets/project-status-template.md", sourceEvidence:"Repository-controlled source", contentHash:"demo:del-tpl-021-v1.0", relatedProject:null, relatedAgent:"AGT-003", tags:["meeting","decision"], synonyms:["minutes","decision log"], quality:q(100,95,90,88,"unknown",100), linkStatus:"Healthy", isAuthoritative:true, isDemonstration:true, updatedAt:"2026-07-16T13:10:00Z" },
  ],
  alerts: [
    { id:"ALT-2026-011", kind:"Broken link", severity:"Review", title:"Exchange source not promoted", detail:"The restricted historical corpus is indexed locally, but no canonical source has completed authority and classification review.", assetIds:["SYM-TEC-STD-008"] },
    { id:"ALT-2026-012", kind:"Orphan", severity:"Review", title:"Review ownership incomplete", detail:"Knowledge Steward charter requires a named reviewer and approval evidence before activation.", assetIds:["SYM-AI-AGT-005"] },
  ],
  auditEvents: [
    { id:"KAE-2026-001", assetId:"SYM-AI-AGT-005", actorAgentId:"AGT-001", action:"Draft metadata created", reason:"Initialize governed AGT-005 implementation", sourceEvidence:"Implementation brief supplied 2026-07-20", correlationId:"CORR-AGT005-BUILD", previousState:null, occurredAt:"2026-07-20T20:00:00Z", isDemonstration:true },
    { id:"KAE-2026-002", assetId:"SYM-TEC-STD-008", actorAgentId:"AGT-005", action:"Restricted intake indexed", reason:"Preserved and hashed 10,648 historical files without activating them as guidance", sourceEvidence:"SYM-ARC-DAT-001 aggregate intake record", correlationId:"CORR-EXCHANGE-INTAKE", previousState:"Draft", occurredAt:"2026-07-20T22:45:00Z", isDemonstration:true },
  ],
};

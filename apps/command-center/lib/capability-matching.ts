import type { ScoutOpportunity } from "./opportunities.ts";

export type CapabilityProfile = {
  id: string;
  label: string;
  kind: "historical" | "new_prerogative";
  evidenceCount: number;
  evidenceUnit: string;
  summary: string;
  keywords: string[];
  knowledgeAssetId: string;
};

export type CapabilityMatch = CapabilityProfile & { relevance: number; reason: string };

export type OpportunityKnowledgeBrief = {
  opportunityId: string;
  continuityScore: number;
  matches: CapabilityMatch[];
  historicalBasis: string;
  newPrerogatives: string[];
  projectBrief: string;
  starterNarrative: string;
  evidenceWarning: string;
};

// Counts are sanitized aggregate FTS hits from the preserved Restricted archive.
// They are evidence density, not project counts, past-performance claims, or proof of current qualifications.
export const capabilityProfiles: CapabilityProfile[] = [
  { id:"CAP-NETWORK", label:"Network infrastructure + LAN", kind:"historical", evidenceCount:446, evidenceUnit:"indexed text hits", summary:"Legacy evidence includes LAN architecture, network infrastructure, implementation, drawings, and project-control artifacts across public and institutional environments.", keywords:["network","lan","ethernet","wireless","infrastructure"], knowledgeAssetId:"SYM-ARC-RES-101" },
  { id:"CAP-CABLING", label:"Structured cabling + fiber", kind:"historical", evidenceCount:406, evidenceUnit:"indexed text hits", summary:"Legacy evidence includes structured cabling, copper and fiber installation, testing, change control, material tracking, and closeout support.", keywords:["cabling","cable","fiber","copper","cat6","structured"], knowledgeAssetId:"SYM-ARC-RES-102" },
  { id:"CAP-VOICE", label:"Telephone + voice systems", kind:"historical", evidenceCount:296, evidenceUnit:"indexed text hits", summary:"Legacy evidence includes telephone, voice/data, VoIP, carrier, and communications-system work and proposals.", keywords:["telephone","telephony","voice","voip","communications","unified communications"], knowledgeAssetId:"SYM-ARC-RES-103" },
  { id:"CAP-SWITCHING", label:"Switching + network equipment", kind:"historical", evidenceCount:141, evidenceUnit:"indexed text hits", summary:"Legacy evidence includes switching, network equipment, telecommunications peripherals, and implementation planning.", keywords:["switch","switching","router","network equipment","cisco"], knowledgeAssetId:"SYM-ARC-RES-104" },
  { id:"CAP-SECURITY", label:"Access control + security systems", kind:"historical", evidenceCount:87, evidenceUnit:"indexed text hits", summary:"The archive contains relevant access-control and surveillance references, but project-specific delivery evidence requires file-level review before use as past performance.", keywords:["access control","security camera","camera","surveillance","cctv","alpr","physical security"], knowledgeAssetId:"SYM-ARC-RES-105" },
  { id:"CAP-CONSULTING", label:"IT consulting + program support", kind:"historical", evidenceCount:80, evidenceUnit:"indexed text hits", summary:"Legacy evidence includes technical proposals, requirements matrices, qualifications, program management, design narratives, and implementation support.", keywords:["consulting","technical services","staff augmentation","program management","implementation services","it services"], knowledgeAssetId:"SYM-ARC-RES-106" },
  { id:"CAP-3D", label:"3D scanning + reality capture", kind:"new_prerogative", evidenceCount:0, evidenceUnit:"verified historical hits", summary:"A current Symbiont growth prerogative. It must be described as a new capability direction until approved delivery evidence exists.", keywords:["3d scanning","laser scanning","reality capture","point cloud","existing conditions","survey","uas","unmanned aircraft","digital twin","bim"], knowledgeAssetId:"SYM-RES-RES-201" },
  { id:"CAP-BUILDING-DATA", label:"Building data + AI operations", kind:"new_prerogative", evidenceCount:0, evidenceUnit:"verified historical hits", summary:"A current company prerogative connecting physical buildings, capture, BIM, digital twins, IoT, structured data, AI, and operational decisions.", keywords:["building data","digital twin","bim","iot","asset information","facilities intelligence","ai"], knowledgeAssetId:"SYM-RES-RES-202" },
];

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

export function matchOpportunityToKnowledge(opportunity: ScoutOpportunity): OpportunityKnowledgeBrief {
  const haystack = normalize([opportunity.title, opportunity.scope, opportunity.fitRationale, opportunity.procurementType].join(" "));
  const matches = capabilityProfiles.map((profile) => {
    const hits = profile.keywords.filter((keyword) => haystack.includes(normalize(keyword)));
    const relevance = Math.min(100, hits.length * 24 + (profile.kind === "historical" && hits.length ? 18 : 12));
    return { ...profile, relevance, reason: hits.length ? `Matched: ${hits.join(", ")}` : "No direct scope term matched." };
  }).filter((profile) => profile.relevance >= 30).sort((a,b) => b.relevance - a.relevance);
  const historical = matches.filter((profile) => profile.kind === "historical");
  const newPrerogatives = matches.filter((profile) => profile.kind === "new_prerogative").map((profile) => profile.label);
  const continuityScore = historical.length ? Math.round(historical.reduce((sum, item) => sum + item.relevance, 0) / historical.length) : 0;
  const historicalBasis = historical.length
    ? `Closest governed historical patterns: ${historical.map((item) => item.label).join(", ")}. These are supported by sanitized archive aggregates and require source-file review before an external past-performance claim.`
    : "No direct historical service match is verified. Treat this as new-market work and validate delivery partners, methods, and references before pursuit.";
  const projectBrief = `${opportunity.issuer} is seeking ${opportunity.title.toLowerCase()}. Symbiont's initial fit is ${opportunity.totalScore}/100 with ${opportunity.confidence}% evidence confidence. ${historicalBasis} ${newPrerogatives.length ? `The opportunity also advances ${newPrerogatives.join(" and ")}.` : ""}`.trim();
  const starterNarrative = `Symbiont would approach this work as an evidence-led infrastructure and building-intelligence engagement. The delivery concept begins with verified existing conditions and requirements, applies the relevant historical disciplines (${historical.map((item) => item.label).join(", ") || "no direct legacy precedent yet"}), and extends them through current priorities in ${newPrerogatives.join(", ") || "structured digital delivery"}. The first phase should confirm scope, access, standards, acceptance criteria, interfaces, and closeout data before pricing or external commitment.`;
  return {
    opportunityId: opportunity.id,
    continuityScore,
    matches,
    historicalBasis,
    newPrerogatives,
    projectBrief,
    starterNarrative,
    evidenceWarning:"Internal starter text only. AGT-005 must open and qualify the supporting full files, and AGT-002 must confirm current qualifications before any client-facing use.",
  };
}

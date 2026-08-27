export type Confidence = "High" | "Medium" | "Low";
export type ClaimType = "Fact" | "Inference" | "Estimate" | "Recommendation";
export type ResearchItem = {
  id:string; title:string; topic:string; owner:string; requester:string; status:string;
  confidence:Confidence; freshness:string; observedAt:string; sourceType:string;
  claimType:ClaimType; summary:string; evidence:string[]; sourceUrl?:string; isDemonstration:boolean;
};
export type ResearchData = {
  source:"verified_snapshot"|"demonstration"; asOf:string; activation:string;
  requests:ResearchItem[]; competitors:string[]; technologies:string[]; trends:string[];
};

export const verifiedResearchData:ResearchData={
  source:"verified_snapshot",asOf:"2026-07-21T16:00:00Z",
  activation:"Published internal research snapshot. Every conclusion remains a draft until its cited full source is reviewed.",
  competitors:["Building-technology integrators","Reality-capture and BIM providers","Low-voltage and physical-security contractors"],
  technologies:["Structured cabling + managed switching","Unified communications","Access control + video surveillance","3D scanning + building-data handoff"],
  trends:["Owners want one accountable technology partner","Public procurements increasingly combine infrastructure, software, and services","Portable building data creates recurring advisory opportunities"],
  requests:[
    {id:"RES-2026-021",title:"Historical network and cabling continuity",topic:"Network infrastructure",owner:"AGT-007",requester:"AGT-009",status:"Review",confidence:"High",freshness:"Current",observedAt:"2026-07-21",sourceType:"Restricted archive aggregate",claimType:"Fact",summary:"Sanitized archive evidence shows substantial continuity in LAN, structured cabling, fiber, voice, switching, and implementation work. Full-file qualification remains required before past-performance use.",evidence:["446 network/LAN indexed hits","406 structured-cabling/fiber indexed hits","296 telephone/voice indexed hits","141 switching/equipment indexed hits"],isDemonstration:false},
    {id:"RES-2026-022",title:"Physical-security adjacency",topic:"Security systems",owner:"AGT-007",requester:"AGT-001",status:"Review",confidence:"Medium",freshness:"Current",observedAt:"2026-07-21",sourceType:"Restricted archive aggregate",claimType:"Inference",summary:"Access-control and surveillance references indicate a plausible adjacent service lane; project-specific delivery evidence and current qualifications must be confirmed.",evidence:["87 combined access-control and surveillance indexed hits","AGT-014 security governance boundary"],isDemonstration:false},
    {id:"RES-2026-023",title:"3D scanning as a new company prerogative",topic:"Reality capture",owner:"AGT-007",requester:"AGT-010",status:"Draft",confidence:"High",freshness:"Current",observedAt:"2026-07-21",sourceType:"Symbiont operating charter",claimType:"Recommendation",summary:"Position reality capture, BIM, digital twins, and building-data handoff as a new strategic direction, never as historical past performance until approved project evidence exists.",evidence:["Company value chain: physical building → capture → BIM → digital twin → data → AI","No verified historical delivery claim represented"],isDemonstration:false}
  ]
};

export const demonstrationResearchData:ResearchData={...verifiedResearchData,source:"demonstration",activation:"Demo mode uses illustrative research records only. No monitoring, contact, handoff, or external action occurs.",requests:verifiedResearchData.requests.map((item,index)=>({...item,id:`DEMO-RES-${String(index+1).padStart(3,"0")}`,isDemonstration:true}))};

export function classifyConfidence(input:{primary:boolean;current:boolean;corroborated:boolean;conflicts:boolean}):Confidence {
  if(input.primary&&input.current&&input.corroborated&&!input.conflicts)return "High";
  if(input.primary||input.corroborated)return "Medium";
  return "Low";
}

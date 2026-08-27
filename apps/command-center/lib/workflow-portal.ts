import { capabilityProfiles } from "./capability-matching.ts";

export const WORKFLOW_STAGES = [
  { id:"intake", label:"Opportunity intake", agent:"AGT-009", gate:"Canonical source, deadline, buyer, scope and evidence recorded" },
  { id:"qualification", label:"Qualification", agent:"AGT-002", gate:"Fit score, client need, decision path and next action complete" },
  { id:"bid", label:"Bid / no-bid", agent:"AGT-001", gate:"Human decision, capacity, risk and commercial guardrails approved" },
  { id:"response", label:"RFP / RFQ response", agent:"AGT-002", gate:"Requirements matrix, solution, price review and release approval complete" },
  { id:"contract", label:"Agreement", agent:"AGT-001", gate:"Executed authorization, scope, terms, data rights and acceptance authority linked" },
  { id:"kickoff", label:"Project kickoff", agent:"AGT-003", gate:"Charter, baseline, owners, access, schedule, quality and security plans approved" },
  { id:"delivery", label:"Delivery", agent:"AGT-003", gate:"Milestones, actions, risks, changes and evidence are current" },
  { id:"quality", label:"QA / QC", agent:"AGT-004", gate:"Locked candidate, approved criteria, findings resolved and release recommended" },
  { id:"closeout", label:"Closeout", agent:"AGT-003", gate:"Acceptance, final issue, lessons, archive and client-success handoff complete" },
] as const;

export type WorkflowStageId = typeof WORKFLOW_STAGES[number]["id"];
export type WorkflowAttention = "Approval" | "Input needed" | "At risk" | "Working" | "Complete";
export type WorkflowStatus = "Active" | "Paused" | "Closed";
export type WorkflowActivity = {
  id:string;
  occurredAt:string;
  actor:string;
  kind:"Discovery"|"Recommendation"|"Edit"|"Approval"|"Handoff"|"Exception"|"Closeout";
  summary:string;
  detail:string;
  evidence?:string;
};

export type EstimateSource = {
  id:string;
  kind:"Historical"|"Market"|"Assumption";
  label:string;
  asOf:string;
  note:string;
  href?:string;
};
export type EstimateLine = {
  id:string;
  category:"Labor"|"Direct cost";
  description:string;
  quantity:number;
  unit:string;
  historicalRate:number|null;
  marketBaseRate:number|null;
  proposedRate:number;
  total:number;
  sourceIds:string[];
  confidence:number;
};
export type EstimateModel = {
  status:"ROM · review required"|"Approved";
  asOf:string;
  refreshDue:string;
  confidence:number;
  decision:"Bid — price review required"|"Conditional bid — validate quantities"|"No bid";
  laborBurdenPct:number;
  overheadPct:number;
  feePct:number;
  contingencyPct:number;
  lines:EstimateLine[];
  subtotal:number;
  contingency:number;
  total:number;
  sources:EstimateSource[];
};
export type RequirementStatus = "Missing source"|"Draft"|"Ready for review"|"Verified";
export type RfpRequirement = {
  id:string;
  section:string;
  requirement:string;
  response:string;
  sourceIds:string[];
  workProductIds:string[];
  owner:string;
  status:RequirementStatus;
};
export type BackgroundWorkProduct = {
  id:string;
  title:string;
  agentId:string;
  status:"Queued"|"Draft"|"Review"|"Complete";
  summary:string;
  evidence:string;
};
export type DeliveryChecklistItem = {
  id:string;
  label:string;
  owner:string;
  required:boolean;
  satisfied:boolean;
  evidence:string;
};
export type ResponsePackage = {
  requirements:RfpRequirement[];
  workProducts:BackgroundWorkProduct[];
  deliveryChecklist:DeliveryChecklistItem[];
  estimate:EstimateModel;
  draft:ResponseDraft;
};
export type PortalProject = {
  id:string; title:string; client:string; solicitation:string; stage:WorkflowStageId;
  owner:string; dueDate:string; nextAction:string; notionUrl?:string; progress:number;
  approvals:string[]; completedApprovals:string[]; attention:WorkflowAttention; status:WorkflowStatus;
  recommendation:string; rationale:string; confidence:number; source:string; sourceUpdatedAt:string;
  activities:WorkflowActivity[]; isDemonstration:boolean; responsePackage?:ResponsePackage;
};

export type WorkflowOpportunityInput = {
  id:string; title:string; client?:string; solicitation?:string; stage?:string;
  scope?:string; risks?:string[]; missingInformation?:string[]; statedValue?:number;
  nextAction?:string; dueDate?:string; recommendation?:string; confidence?:number;
  source?:string; sourceUpdatedAt?:string; canonicalUrl?:string; isDemonstration:boolean;
};

export const estimateSources:EstimateSource[] = [
  { id:"HIST-2025-DAU", kind:"Historical", label:"2025 invoice labor breakdown", asOf:"2025", note:"Restricted local archive: observed technician/help-desk invoice rates of $32.48–$39.51/hour. Validate contract context before reuse." },
  { id:"HIST-2000-TIMPO", kind:"Historical", label:"TIMPO proposal labor schedule", asOf:"2000-11-20", note:"Restricted local archive: historical proposal rates include Project Manager $109.67, Cable Installation Manager $70.75, and QA Manager $82.84. Stale context only; never escalated automatically." },
  { id:"MKT-BLS-PM", kind:"Market", label:"BLS · Project Management Specialists", asOf:"2024-05", href:"https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm", note:"Median annual wage $100,750; converted to $48.44/hour using 2,080 hours." },
  { id:"MKT-BLS-ARCH", kind:"Market", label:"BLS · Computer Network Architects", asOf:"2024-05", href:"https://www.bls.gov/ooh/computer-and-information-technology/computer-network-architects.htm", note:"Median hourly wage $62.69." },
  { id:"MKT-BLS-ADMIN", kind:"Market", label:"BLS · Network and Computer Systems Administrators", asOf:"2024-05", href:"https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm", note:"Median annual wage $96,800; converted to $46.54/hour using 2,080 hours." },
  { id:"MKT-BLS-TECH", kind:"Market", label:"BLS · Telecommunications Technicians", asOf:"2024-05", href:"https://www.bls.gov/ooh/installation-maintenance-and-repair/telecommunications-equipment-installers-and-repairers-except-line-installers.htm", note:"Median annual wage $62,630 for equipment installers/repairers; converted to $30.11/hour using 2,080 hours." },
  { id:"MKT-GSA-CALC", kind:"Market", label:"GSA CALC+ pricing intelligence", asOf:"2026-07-21", href:"https://buy.gsa.gov/pricing/calc", note:"Use current awarded ceiling-rate comparables during price review. Ceiling rates are conservative research inputs, not exact order prices." },
  { id:"ASM-LOAD", kind:"Assumption", label:"Editable labor load and fee assumptions", asOf:"2026-07-21", note:"Defaults: 35% labor burden, 25% overhead, 10% fee, and 10% estimate contingency. Finance must validate before bid approval." },
  { id:"ASM-ALLOWANCE", kind:"Assumption", label:"Equipment, travel, and materials allowance", asOf:"2026-07-21", note:"Placeholder pending RFP quantities, vendor quotes, location, and contract terms." },
];

const money = (value:number) => Math.round(value * 100) / 100;
const loadedRate = (base:number, burden:number, overhead:number, fee:number) => money(base * (1 + burden) * (1 + overhead) / (1 - fee));

export function repriceEstimate(model:EstimateModel, lines:EstimateLine[] = model.lines):EstimateModel {
  const pricedLines = lines.map(line => ({ ...line, quantity:Math.max(0, line.quantity), proposedRate:Math.max(0, line.proposedRate), total:money(Math.max(0, line.quantity) * Math.max(0, line.proposedRate)) }));
  const subtotal = money(pricedLines.reduce((sum, line) => sum + line.total, 0));
  const contingency = money(subtotal * model.contingencyPct);
  return { ...model, lines:pricedLines, subtotal, contingency, total:money(subtotal + contingency) };
}

export function estimateForOpportunity(input:{ title:string; scope?:string; statedValue?:number }):EstimateModel {
  const text = `${input.title} ${input.scope || ""}`.toLowerCase();
  const network = /network|voice|voip|telecom|switch|router|cabl|fiber|communications/.test(text);
  const capture = /scan|reality capture|point cloud|existing condition|bim|digital twin|building data/.test(text);
  const burden=.35, overhead=.25, fee=.10;
  const rate=(base:number)=>loadedRate(base,burden,overhead,fee);
  const lines:EstimateLine[] = network ? [
    { id:"EST-PM", category:"Labor", description:"Project management and client coordination", quantity:32, unit:"hours", historicalRate:109.67, marketBaseRate:48.44, proposedRate:rate(48.44), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-PM","ASM-LOAD"], confidence:72 },
    { id:"EST-ARCH", category:"Labor", description:"Network / solution architecture", quantity:48, unit:"hours", historicalRate:null, marketBaseRate:62.69, proposedRate:rate(62.69), total:0, sourceIds:["MKT-BLS-ARCH","MKT-GSA-CALC","ASM-LOAD"], confidence:70 },
    { id:"EST-ENG", category:"Labor", description:"Engineering, configuration, and documentation", quantity:96, unit:"hours", historicalRate:82.84, marketBaseRate:46.54, proposedRate:rate(46.54), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-ADMIN","MKT-GSA-CALC","ASM-LOAD"], confidence:68 },
    { id:"EST-TECH", category:"Labor", description:"Installation, testing, and field support", quantity:160, unit:"hours", historicalRate:35, marketBaseRate:30.11, proposedRate:rate(30.11), total:0, sourceIds:["HIST-2025-DAU","MKT-BLS-TECH","MKT-GSA-CALC","ASM-LOAD"], confidence:76 },
    { id:"EST-ODC", category:"Direct cost", description:"Equipment, materials, travel, and freight allowance", quantity:1, unit:"allowance", historicalRate:null, marketBaseRate:null, proposedRate:18000, total:0, sourceIds:["ASM-ALLOWANCE"], confidence:35 },
  ] : capture ? [
    { id:"EST-PM", category:"Labor", description:"Project management and client coordination", quantity:28, unit:"hours", historicalRate:109.67, marketBaseRate:48.44, proposedRate:rate(48.44), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-PM","ASM-LOAD"], confidence:65 },
    { id:"EST-ARCH", category:"Labor", description:"Capture planning and technical lead", quantity:48, unit:"hours", historicalRate:null, marketBaseRate:62.69, proposedRate:rate(62.69), total:0, sourceIds:["MKT-BLS-ARCH","MKT-GSA-CALC","ASM-LOAD"], confidence:45 },
    { id:"EST-ENG", category:"Labor", description:"Field capture, processing, and information modeling", quantity:180, unit:"hours", historicalRate:null, marketBaseRate:46.54, proposedRate:rate(46.54), total:0, sourceIds:["MKT-BLS-ADMIN","MKT-GSA-CALC","ASM-LOAD"], confidence:40 },
    { id:"EST-QA", category:"Labor", description:"QA/QC and deliverable validation", quantity:32, unit:"hours", historicalRate:82.84, marketBaseRate:46.54, proposedRate:rate(46.54), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-ADMIN","ASM-LOAD"], confidence:52 },
    { id:"EST-ODC", category:"Direct cost", description:"Equipment, travel, hosting, and field allowance", quantity:1, unit:"allowance", historicalRate:null, marketBaseRate:null, proposedRate:12500, total:0, sourceIds:["ASM-ALLOWANCE"], confidence:30 },
  ] : [
    { id:"EST-PM", category:"Labor", description:"Project management and client coordination", quantity:32, unit:"hours", historicalRate:109.67, marketBaseRate:48.44, proposedRate:rate(48.44), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-PM","ASM-LOAD"], confidence:62 },
    { id:"EST-ARCH", category:"Labor", description:"Technical lead and solution design", quantity:48, unit:"hours", historicalRate:null, marketBaseRate:62.69, proposedRate:rate(62.69), total:0, sourceIds:["MKT-BLS-ARCH","MKT-GSA-CALC","ASM-LOAD"], confidence:55 },
    { id:"EST-ENG", category:"Labor", description:"Specialist delivery and documentation", quantity:120, unit:"hours", historicalRate:null, marketBaseRate:46.54, proposedRate:rate(46.54), total:0, sourceIds:["MKT-BLS-ADMIN","MKT-GSA-CALC","ASM-LOAD"], confidence:50 },
    { id:"EST-QA", category:"Labor", description:"QA/QC and release preparation", quantity:24, unit:"hours", historicalRate:82.84, marketBaseRate:46.54, proposedRate:rate(46.54), total:0, sourceIds:["HIST-2000-TIMPO","MKT-BLS-ADMIN","ASM-LOAD"], confidence:55 },
    { id:"EST-ODC", category:"Direct cost", description:"Equipment, travel, and materials allowance", quantity:1, unit:"allowance", historicalRate:null, marketBaseRate:null, proposedRate:10000, total:0, sourceIds:["ASM-ALLOWANCE"], confidence:30 },
  ];
  const confidence = network ? 67 : capture ? 43 : 50;
  return repriceEstimate({ status:"ROM · review required", asOf:"2026-07-21", refreshDue:"2026-10-21", confidence, decision:confidence >= 60 ? "Bid — price review required" : "Conditional bid — validate quantities", laborBurdenPct:burden, overheadPct:overhead, feePct:fee, contingencyPct:.10, lines, subtotal:0, contingency:0, total:0, sources:estimateSources });
}

function matchKnowledge(title:string, scope:string) {
  const haystack=`${title} ${scope}`.toLowerCase();
  return capabilityProfiles.map(profile=>({ profile, hits:profile.keywords.filter(keyword=>haystack.includes(keyword.toLowerCase())) }))
    .filter(item=>item.hits.length).sort((a,b)=>b.hits.length-a.hits.length).slice(0,3).map(item=>item.profile);
}

export function responsePackageForOpportunity(input:WorkflowOpportunityInput):ResponsePackage {
  const estimate=estimateForOpportunity({ title:input.title, scope:input.scope, statedValue:input.statedValue });
  const matches=matchKnowledge(input.title,input.scope || "");
  const knowledgeSummary=matches.length
    ? `The governed knowledge index identifies ${matches.map(match=>match.label).join(", ")} as the closest capability patterns. File-level qualification is required before any past-performance claim.`
    : "No direct historical capability match has been verified. The response must remain capability-forward and avoid unsupported past-performance claims.";
  const responseType:"RFP"|"RFQ" = /rfq/i.test(input.solicitation || "") ? "RFQ" : "RFP";
  const draft:ResponseDraft={
    responseType, solicitation:input.solicitation || "Solicitation pending", client:input.client || "Issuer pending", title:`Response to ${input.title}`, dueDate:input.dueDate || "",
    executiveSummary:`Symbiont proposes an evidence-led, governed delivery approach for ${input.title}. This draft is built from the verified opportunity record, the requirements matrix, and controlled knowledge references; all external claims and commercial terms remain subject to human approval.`,
    understanding:input.scope || `The complete solicitation has not yet been parsed. Current understanding is limited to the verified opportunity title and pipeline evidence for ${input.title}.`,
    approach:`Begin with a requirements and amendment baseline; confirm scope, access, interfaces, acceptance criteria, and data obligations; develop the technical solution; validate pricing; complete independent QA/QC; and issue only after the delivery checklist and external-release approval are complete. ${knowledgeSummary}`,
    deliverables:"Requirements compliance matrix\nTechnical and management response\nPrice volume / estimate basis\nDelivery schedule and acceptance matrix\nFinal QA/QC release package",
    schedule:input.dueDate ? `Submission deadline: ${input.dueDate}. Detailed milestones depend on the complete RFP schedule and amendment set.` : "Submission and delivery milestones require the complete RFP schedule.",
    team:"AGT-002 Response owner · AGT-005 Knowledge evidence · AGT-007 Market research · AGT-012 Technical architecture · AGT-006 Estimate review · AGT-004 QA/QC · Human release authority",
    assumptions:"Complete solicitation and amendments will be provided\nQuantities, locations, access constraints, and acceptance criteria require validation\nMarket rates and vendor quotes will be refreshed before price approval",
    exclusions:"No unsupported past-performance claims\nNo external issue before required approvals\nNo binding price until quantities, vendor quotes, and contract terms are validated",
    pricing:`Current ROM: $${Math.round(estimate.total).toLocaleString("en-US")} based on historical labor context, BLS wage benchmarks, editable burden/overhead/fee assumptions, and provisional direct-cost allowances. Finance and executive price approval required.`, validity:"30 days after approved issue",
  };
  const knowledgeIds=matches.map(match=>match.knowledgeAssetId);
  const hasScope=Boolean(input.scope?.trim());
  const requirements:RfpRequirement[]=[
    { id:"REQ-001", section:"Solicitation control", requirement:"Complete RFP/RFQ, attachments, exhibits, and amendments are captured in the controlled source set.", response:input.canonicalUrl ? `Canonical opportunity source recorded: ${input.canonicalUrl}. Full document and amendment extraction remains required.` : "Canonical solicitation source and full document set are required.", sourceIds:input.canonicalUrl ? ["OPPORTUNITY-SOURCE"] : [], workProductIds:["WP-SOURCE"], owner:"AGT-009", status:"Missing source" },
    { id:"REQ-002", section:"Scope and technical response", requirement:input.scope || `Respond to the stated scope for ${input.title}; detailed RFP requirements have not yet been extracted.`, response:`Symbiont will baseline the requirements, map each obligation to a solution element and acceptance method, and control all changes through the response matrix. ${knowledgeSummary}`, sourceIds:knowledgeIds, workProductIds:["WP-KNOWLEDGE","WP-TECH"], owner:"AGT-012", status:hasScope ? "Ready for review" : "Draft" },
    { id:"REQ-003", section:"Management and schedule", requirement:input.dueDate ? `Submit by ${input.dueDate} and provide the management and delivery schedule required by the solicitation.` : "Confirm submission deadline, questions deadline, delivery milestones, and required schedule format.", response:"The response team will manage a controlled schedule from requirement extraction through red-team review, pricing approval, and authorized issue. Delivery milestones will be added when the RFP schedule is verified.", sourceIds:input.dueDate ? ["OPPORTUNITY-SOURCE"] : [], workProductIds:["WP-SOURCE","WP-QA"], owner:"AGT-002", status:input.dueDate ? "Ready for review" : "Missing source" },
    { id:"REQ-004", section:"Price volume", requirement:"Provide the requested pricing structure, quantities, assumptions, and commercial terms.", response:`A traceable ROM of $${Math.round(estimate.total).toLocaleString("en-US")} is available for bid/no-bid. Final pricing requires RFP quantities, current quotes, market comparable review, indirect-rate validation, and human approval.`, sourceIds:estimate.sources.map(source=>source.id), workProductIds:["WP-PRICE","WP-MARKET"], owner:"AGT-006", status:"Draft" },
    { id:"REQ-005", section:"Compliance and submission", requirement:"Satisfy every mandatory form, certification, page limit, format, signature, portal, and delivery instruction.", response:"The complete submission checklist will be populated from the controlled solicitation and independently verified against the compiled draft before external issue.", sourceIds:[], workProductIds:["WP-QA"], owner:"AGT-004", status:"Missing source" },
  ];
  const workProducts:BackgroundWorkProduct[]=[
    { id:"WP-SOURCE", title:"Solicitation source and amendment brief", agentId:"AGT-009", status:input.canonicalUrl?"Review":"Queued", summary:"Canonical source, dates, issuer, amendments, and missing-information record.", evidence:input.canonicalUrl || "Canonical source not yet linked" },
    { id:"WP-KNOWLEDGE", title:"Knowledge-grounding and claim brief", agentId:"AGT-005", status:matches.length?"Review":"Queued", summary:"Controlled capability matches and claim limitations for response drafting.", evidence:knowledgeIds.join(", ") || "No direct match verified" },
    { id:"WP-MARKET", title:"Current market benchmark review", agentId:"AGT-007", status:"Review", summary:"BLS wage benchmarks and GSA pricing-research method with dates and limitations.", evidence:"MKT-BLS-* · MKT-GSA-CALC" },
    { id:"WP-TECH", title:"Technical solution outline", agentId:"AGT-012", status:"Draft", summary:"Requirement-to-solution mapping, architecture, interfaces, risks, and acceptance methods.", evidence:"Draft generated from verified scope evidence" },
    { id:"WP-PRICE", title:"Estimate and price-basis model", agentId:"AGT-006", status:"Review", summary:"Historical context, market base rates, editable indirects, quantities, contingency, and ROM.", evidence:`ROM ${estimate.asOf} · ${estimate.confidence}% confidence` },
    { id:"WP-QA", title:"Compliance and delivery review", agentId:"AGT-004", status:"Draft", summary:"Independent requirements coverage, document checks, and external-release recommendation.", evidence:"Delivery checklist pending" },
  ];
  const deliveryChecklist:DeliveryChecklistItem[]=[
    { id:"CHK-SOURCE", label:"Complete solicitation, attachments, and amendments are controlled", owner:"AGT-009", required:true, satisfied:false, evidence:"Source package required" },
    { id:"CHK-REQ", label:"Every RFP requirement is extracted, assigned, answered, and dispositioned", owner:"AGT-002", required:true, satisfied:false, evidence:`${requirements.filter(item=>item.status==="Verified").length}/${requirements.length} verified` },
    { id:"CHK-CLAIMS", label:"Knowledge claims have file-level evidence and authorized review", owner:"AGT-005", required:true, satisfied:false, evidence:knowledgeIds.join(", ") || "Evidence required" },
    { id:"CHK-TECH", label:"Technical solution, interfaces, risks, and acceptance criteria are reviewed", owner:"AGT-012", required:true, satisfied:false, evidence:"Technical review required" },
    { id:"CHK-PRICE", label:"Quantities, current market comparables, indirects, margin, and price are approved", owner:"AGT-006", required:true, satisfied:false, evidence:`ROM only · ${estimate.confidence}% confidence` },
    { id:"CHK-QA", label:"Compiled draft passes independent compliance and document QA/QC", owner:"AGT-004", required:true, satisfied:false, evidence:"QA/QC release recommendation required" },
    { id:"CHK-RELEASE", label:"Authorized human approves the exact external-issue version", owner:"James", required:true, satisfied:false, evidence:"Non-delegable approval required" },
  ];
  return { requirements, workProducts, deliveryChecklist, estimate, draft };
}

export function portalProjectFromOpportunity(input:WorkflowOpportunityInput):PortalProject {
  const qualified = /qualified|review|response/i.test(input.stage || "");
  const stage:WorkflowStageId = qualified ? "qualification" : "intake";
  const sourceUpdatedAt = input.sourceUpdatedAt || new Date().toISOString();
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence ?? 50)));
  const nextAction = input.nextAction || (qualified ? "Confirm pursuit readiness and record the bid / no-bid decision" : "Complete and verify opportunity intake");
  const source = input.source || "Sales Operations pipeline";
  return {
    id:input.id, title:input.title, client:input.client || "", solicitation:input.solicitation || "",
    stage, owner:qualified ? "AGT-002" : "AGT-009", dueDate:input.dueDate || "", nextAction,
    progress:qualified ? 18 : 5, approvals:[qualified ? "Sales qualification acceptance" : "Source acceptance"],
    completedApprovals:[], attention:"Input needed", status:"Active",
    recommendation:input.recommendation || (qualified ? "Review the verified opportunity and complete the governed pursuit decision." : "Complete the required intake evidence before routing this opportunity."),
    rationale:qualified ? "The pipeline record was explicitly handed to the Action queue. The workflow preserves qualification and bid-decision gates before any response can be issued." : "The source record requires intake verification before it can advance to Sales Operations.",
    confidence, source, sourceUpdatedAt, isDemonstration:input.isDemonstration,
    responsePackage:responsePackageForOpportunity(input),
    activities:[{
      id:`EVT-${input.id}-HANDOFF`, occurredAt:sourceUpdatedAt, actor:"James", kind:"Handoff",
      summary:"Opportunity added to the Action queue",
      detail:`The selected ${input.isDemonstration ? "demonstration" : "pipeline"} record was accepted into the governed lead-to-closeout workflow. A draft requirements, response, and ROM package was created for review.`,
      evidence:input.canonicalUrl || `${source} record ${input.id}`,
    }],
  };
}

export function mergePortalProject(projects:PortalProject[], incoming:PortalProject):PortalProject[] {
  return projects.some(project => project.id === incoming.id) ? projects : [incoming, ...projects];
}

export function visiblePortalProjects(projects:PortalProject[], demoMode:boolean):PortalProject[] {
  return projects.filter(project => project.isDemonstration === demoMode);
}

export type PortfolioOpportunityInput = {
  id:string; title:string; client?:string; stage:string; scope?:string; amount?:number;
  dueDate?:string; nextAction?:string; recommendation?:string; confidence?:number;
  source?:string; isDemonstration:boolean;
};

export type QualifiedPursuit = {
  id:string; title:string; client:string; stage:string; owner:string; dueDate:string;
  nextAction:string; recommendation:string; confidence:number; estimate:number;
  estimateConfidence:number; bidDecision:string; source:string; inActionQueue:boolean;
  isDemonstration:boolean;
};

const qualifiedWorkflowStages = new Set<WorkflowStageId>(["qualification", "bid", "response", "contract"]);

export function qualifiedPursuitPortfolio(opportunities:PortfolioOpportunityInput[], projects:PortalProject[], demoMode:boolean):QualifiedPursuit[] {
  const pursuits = new Map<string, QualifiedPursuit>();
  for (const opportunity of opportunities) {
    if (opportunity.isDemonstration !== demoMode || !/qualified|proposal|response|bid|contract/i.test(opportunity.stage)) continue;
    const estimate = estimateForOpportunity({ title:opportunity.title, scope:opportunity.scope });
    pursuits.set(opportunity.id, {
      id:opportunity.id, title:opportunity.title, client:opportunity.client || "Client required", stage:opportunity.stage,
      owner:"AGT-002", dueDate:opportunity.dueDate || "", nextAction:opportunity.nextAction || "Complete qualification and record the bid / no-bid decision",
      recommendation:opportunity.recommendation || estimate.decision, confidence:Math.max(0,Math.min(100,Math.round(opportunity.confidence ?? 50))),
      estimate:opportunity.amount || estimate.total, estimateConfidence:estimate.confidence, bidDecision:estimate.decision,
      source:opportunity.source || "Governed Pipeline", inActionQueue:false, isDemonstration:opportunity.isDemonstration,
    });
  }
  for (const project of projects) {
    if (project.isDemonstration !== demoMode || project.status === "Closed" || !qualifiedWorkflowStages.has(project.stage)) continue;
    const estimate = project.responsePackage?.estimate || estimateForOpportunity({ title:project.title });
    pursuits.set(project.id, {
      id:project.id, title:project.title, client:project.client || "Client required", stage:WORKFLOW_STAGES.find(item=>item.id===project.stage)?.label || project.stage,
      owner:project.owner, dueDate:project.dueDate, nextAction:project.nextAction, recommendation:project.recommendation,
      confidence:project.confidence, estimate:estimate.total, estimateConfidence:estimate.confidence, bidDecision:estimate.decision,
      source:project.source, inActionQueue:true, isDemonstration:project.isDemonstration,
    });
  }
  return [...pursuits.values()].sort((left,right) => (left.dueDate || "9999").localeCompare(right.dueDate || "9999") || left.title.localeCompare(right.title));
}

export type GovernedDecisionInput = {
  id:string; projectId?:string; statement:string; owner?:string; requiredBy?:string;
  status?:string; rationale?:string; source?:string; isDemonstration?:boolean;
};

export type ActionDecision = Required<GovernedDecisionInput> & { hasAction:boolean };

export function actionDecisionRegister(projects:PortalProject[], governed:GovernedDecisionInput[], demoMode:boolean):ActionDecision[] {
  const modeProjects = visiblePortalProjects(projects, demoMode);
  const projectIds = new Set(modeProjects.map(project=>project.id));
  const decisions = new Map<string,ActionDecision>();
  for (const project of modeProjects) {
    for (const approval of project.approvals) {
      const id=`DEC-${project.id}-${approval.toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
      decisions.set(id, {
        id, projectId:project.id, statement:`Approve ${approval} for ${project.title}`,
        owner:"Authorized human", requiredBy:project.dueDate || "Unscheduled",
        status:project.completedApprovals.includes(approval)?"Approved":"Decision required",
        rationale:project.rationale, source:`${project.owner} recommendation · ${project.source}`,
        isDemonstration:project.isDemonstration, hasAction:true,
      });
    }
  }
  for (const item of governed) {
    const isDemonstration=item.isDemonstration ?? false;
    if (isDemonstration !== demoMode) continue;
    decisions.set(item.id, {
      id:item.id, projectId:item.projectId || "Company", statement:item.statement,
      owner:item.owner || "Authorized human", requiredBy:item.requiredBy || "Unscheduled",
      status:item.status || "Proposed", rationale:item.rationale || "Review the linked evidence and recommendation before approval.",
      source:item.source || "Governed decision register", isDemonstration, hasAction:Boolean(item.projectId && projectIds.has(item.projectId)),
    });
  }
  return [...decisions.values()].sort((left,right)=>{
    const leftOpen=left.status === "Approved" ? 1 : 0; const rightOpen=right.status === "Approved" ? 1 : 0;
    return leftOpen-rightOpen || left.requiredBy.localeCompare(right.requiredBy) || left.id.localeCompare(right.id);
  });
}

const demoOpportunity=(project:Omit<PortalProject,"responsePackage">,scope:string):PortalProject=>({ ...project, responsePackage:responsePackageForOpportunity({ id:project.id,title:project.title,client:project.client,solicitation:project.solicitation,stage:project.stage,scope,dueDate:project.dueDate,recommendation:project.recommendation,confidence:project.confidence,source:project.source,sourceUpdatedAt:project.sourceUpdatedAt,isDemonstration:true }) });

export const demonstrationPortalProjects:PortalProject[] = [
  demoOpportunity({id:"OPP-2026-021",title:"Existing-conditions capture pilot",client:"NY/NJ institutional owner",solicitation:"RFQ pending",stage:"qualification",owner:"AGT-002",dueDate:"2026-07-28",nextAction:"Confirm buyer, procurement route, and minimum qualifications",progress:18,approvals:["Sales qualification acceptance"],completedApprovals:[],attention:"Input needed",status:"Active",recommendation:"Continue qualification after the buyer and procurement route are verified.",rationale:"The scope aligns with the reality-capture service line, but buyer authority and the contracting path are still missing.",confidence:82,source:"Opportunity Scout · official-source review",sourceUpdatedAt:"2026-07-21T12:24:00-04:00",isDemonstration:true,activities:[{id:"EVT-021-003",occurredAt:"2026-07-21T12:24:00-04:00",actor:"AGT-009",kind:"Handoff",summary:"Opportunity routed to Sales Operations",detail:"Score exceeded the governed review threshold; AGT-002 acceptance is required.",evidence:"Canonical notice and source snapshot linked"},{id:"EVT-021-002",occurredAt:"2026-07-21T12:18:00-04:00",actor:"AGT-007",kind:"Recommendation",summary:"Capability evidence matched",detail:"Historical facilities-technology delivery evidence supports qualification; new reality-capture claims remain bounded.",evidence:"Knowledge match brief v1"},{id:"EVT-021-001",occurredAt:"2026-07-21T12:08:00-04:00",actor:"AGT-009",kind:"Discovery",summary:"Official opportunity discovered",detail:"Deadline, issuer, scope, and canonical source recorded.",evidence:"Official issuer page"}]},"Existing-conditions reality capture, field documentation, point-cloud processing, and governed digital deliverables for an institutional facility."),
  demoOpportunity({id:"OPP-2026-018",title:"Portfolio building-data foundation",client:"Demonstration client",solicitation:"RFP-DEMO-014",stage:"response",owner:"AGT-002",dueDate:"2026-08-04",nextAction:"Approve pricing assumptions and external release",progress:42,approvals:["Pricing","External release"],completedApprovals:["Pricing"],attention:"Approval",status:"Active",recommendation:"Approve the response for issue after the final compliance-matrix exception is resolved.",rationale:"The response is substantively complete and pricing has been reviewed. One external-release approval remains non-delegable.",confidence:91,source:"Sales Operations · response workspace",sourceUpdatedAt:"2026-07-21T11:42:00-04:00",isDemonstration:true,activities:[{id:"EVT-018-003",occurredAt:"2026-07-21T11:42:00-04:00",actor:"James",kind:"Approval",summary:"Pricing architecture approved",detail:"Commercial assumptions accepted for the current response version.",evidence:"Decision DEC-2026-018"},{id:"EVT-018-002",occurredAt:"2026-07-21T10:50:00-04:00",actor:"AGT-002",kind:"Recommendation",summary:"Draft response prepared",detail:"Requirements, approach, deliverables, and schedule were auto-populated for human review.",evidence:"Response draft v0.8"},{id:"EVT-018-001",occurredAt:"2026-07-20T16:30:00-04:00",actor:"AGT-001",kind:"Handoff",summary:"Bid decision approved",detail:"Pursuit authorized inside documented commercial and capacity guardrails.",evidence:"Bid decision record"}]},"Create a governed building-data foundation covering existing conditions, BIM and digital-twin readiness, asset information, integrations, delivery controls, and operations handoff."),
  {id:"PRJ-2026-014",title:"Reality-capture delivery",client:"Demonstration client",solicitation:"Executed agreement",stage:"delivery",owner:"AGT-003",dueDate:"2026-08-18",nextAction:"Resolve the field-coverage exception before QA/QC",progress:67,approvals:["Change decision"],completedApprovals:[],attention:"At risk",status:"Active",recommendation:"Hold the QA/QC handoff until the field-coverage exception is resolved or formally accepted.",rationale:"The exception may affect acceptance coverage. Advancing without disposition would move an incomplete candidate into release review.",confidence:96,source:"Delivery Control · milestone evidence",sourceUpdatedAt:"2026-07-21T13:06:00-04:00",isDemonstration:true,activities:[{id:"EVT-014-003",occurredAt:"2026-07-21T13:06:00-04:00",actor:"AGT-003",kind:"Exception",summary:"Field-coverage exception escalated",detail:"One required area lacks verified capture coverage; a change decision is required.",evidence:"Exception EXC-2026-014"},{id:"EVT-014-002",occurredAt:"2026-07-21T09:20:00-04:00",actor:"AGT-014",kind:"Recommendation",summary:"Data handling controls verified",detail:"Current working set remains inside the approved project classification and access boundary.",evidence:"Security review SEC-2026-041"},{id:"EVT-014-001",occurredAt:"2026-07-18T15:15:00-04:00",actor:"AGT-003",kind:"Handoff",summary:"Project entered delivery",detail:"Kickoff gate completed with baseline, owners, access, schedule, and quality plan linked.",evidence:"Kickoff record v1"}]},
];

const stageActions:Record<WorkflowStageId,string> = {
  intake:"Accept and send to Sales Qualification", qualification:"Submit bid / no-bid decision", bid:"Approve bid and start response",
  response:"Approve response for external issue", contract:"Convert to project and start kickoff", kickoff:"Approve kickoff and begin delivery",
  delivery:"Submit deliverable to QA/QC", quality:"Accept release and start closeout", closeout:"Approve closeout and archive",
};

export function stageActionLabel(stage:WorkflowStageId){return stageActions[stage];}

export function validateStageMove(current:WorkflowStageId,next:WorkflowStageId,gateConfirmed:boolean){
  const from=WORKFLOW_STAGES.findIndex(stage=>stage.id===current); const to=WORKFLOW_STAGES.findIndex(stage=>stage.id===next);
  if(to!==from+1) throw new Error("Projects move one governed stage at a time.");
  if(!gateConfirmed) throw new Error("Confirm the current stage gate before advancing.");
  return true;
}

export function canApproveExternalIssue(project:PortalProject) {
  if (project.stage !== "response") return true;
  const checklist=project.responsePackage?.deliveryChecklist || [];
  return checklist.length > 0 && checklist.filter(item=>item.required).every(item=>item.satisfied);
}

export function releaseBlockers(project:PortalProject) {
  if (project.stage !== "response") return [];
  return (project.responsePackage?.deliveryChecklist || []).filter(item=>item.required&&!item.satisfied).map(item=>item.label);
}

export type ResponseDraft={
  responseType:"RFP"|"RFQ"; solicitation:string; client:string; title:string; dueDate:string;
  executiveSummary:string; understanding:string; approach:string; deliverables:string;
  schedule:string; team:string; assumptions:string; exclusions:string; pricing:string; validity:string;
};

export function cleanResponseDraft(value:unknown):ResponseDraft{
  if(!value||typeof value!=="object")throw new Error("A response draft is required.");
  const v=value as Record<string,unknown>; const text=(key:string,max=12000)=>typeof v[key]==="string"?v[key].trim().slice(0,max):"";
  const responseType:"RFP"|"RFQ"=v.responseType==="RFQ"?"RFQ":"RFP";
  const draft:ResponseDraft={responseType,solicitation:text("solicitation",200),client:text("client",300),title:text("title",500),dueDate:text("dueDate",100),executiveSummary:text("executiveSummary"),understanding:text("understanding"),approach:text("approach"),deliverables:text("deliverables"),schedule:text("schedule"),team:text("team"),assumptions:text("assumptions"),exclusions:text("exclusions"),pricing:text("pricing"),validity:text("validity",500)};
  if(!draft.client||!draft.title||!draft.solicitation)throw new Error("Client, response title, and solicitation number are required.");
  return draft;
}

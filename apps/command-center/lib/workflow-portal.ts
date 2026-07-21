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
export type PortalProject = {
  id:string; title:string; client:string; solicitation:string; stage:WorkflowStageId;
  owner:string; dueDate:string; nextAction:string; notionUrl?:string; progress:number;
  approvals:string[]; completedApprovals:string[]; attention:WorkflowAttention; status:WorkflowStatus;
  recommendation:string; rationale:string; confidence:number; source:string; sourceUpdatedAt:string;
  activities:WorkflowActivity[];
};

export const demonstrationPortalProjects:PortalProject[] = [
  {id:"OPP-2026-021",title:"Existing-conditions capture pilot",client:"NY/NJ institutional owner",solicitation:"RFQ pending",stage:"qualification",owner:"AGT-002",dueDate:"2026-07-28",nextAction:"Confirm buyer, procurement route, and minimum qualifications",progress:18,approvals:["Sales qualification acceptance"],completedApprovals:[],attention:"Input needed",status:"Active",recommendation:"Continue qualification after the buyer and procurement route are verified.",rationale:"The scope aligns with the reality-capture service line, but buyer authority and the contracting path are still missing.",confidence:82,source:"Opportunity Scout · official-source review",sourceUpdatedAt:"2026-07-21T12:24:00-04:00",activities:[{id:"EVT-021-003",occurredAt:"2026-07-21T12:24:00-04:00",actor:"AGT-009",kind:"Handoff",summary:"Opportunity routed to Sales Operations",detail:"Score exceeded the governed review threshold; AGT-002 acceptance is required.",evidence:"Canonical notice and source snapshot linked"},{id:"EVT-021-002",occurredAt:"2026-07-21T12:18:00-04:00",actor:"AGT-007",kind:"Recommendation",summary:"Capability evidence matched",detail:"Historical facilities-technology delivery evidence supports qualification; new reality-capture claims remain bounded.",evidence:"Knowledge match brief v1"},{id:"EVT-021-001",occurredAt:"2026-07-21T12:08:00-04:00",actor:"AGT-009",kind:"Discovery",summary:"Official opportunity discovered",detail:"Deadline, issuer, scope, and canonical source recorded.",evidence:"Official issuer page"}]},
  {id:"OPP-2026-018",title:"Portfolio building-data foundation",client:"Demonstration client",solicitation:"RFP-DEMO-014",stage:"response",owner:"AGT-002",dueDate:"2026-08-04",nextAction:"Approve pricing assumptions and external release",progress:42,approvals:["Pricing","External release"],completedApprovals:["Pricing"],attention:"Approval",status:"Active",recommendation:"Approve the response for issue after the final compliance-matrix exception is resolved.",rationale:"The response is substantively complete and pricing has been reviewed. One external-release approval remains non-delegable.",confidence:91,source:"Sales Operations · response workspace",sourceUpdatedAt:"2026-07-21T11:42:00-04:00",activities:[{id:"EVT-018-003",occurredAt:"2026-07-21T11:42:00-04:00",actor:"James",kind:"Approval",summary:"Pricing architecture approved",detail:"Commercial assumptions accepted for the current response version.",evidence:"Decision DEC-2026-018"},{id:"EVT-018-002",occurredAt:"2026-07-21T10:50:00-04:00",actor:"AGT-002",kind:"Recommendation",summary:"Draft response prepared",detail:"Requirements, approach, deliverables, and schedule were auto-populated for human review.",evidence:"Response draft v0.8"},{id:"EVT-018-001",occurredAt:"2026-07-20T16:30:00-04:00",actor:"AGT-001",kind:"Handoff",summary:"Bid decision approved",detail:"Pursuit authorized inside documented commercial and capacity guardrails.",evidence:"Bid decision record"}]},
  {id:"PRJ-2026-014",title:"Reality-capture delivery",client:"Demonstration client",solicitation:"Executed agreement",stage:"delivery",owner:"AGT-003",dueDate:"2026-08-18",nextAction:"Resolve the field-coverage exception before QA/QC",progress:67,approvals:["Change decision"],completedApprovals:[],attention:"At risk",status:"Active",recommendation:"Hold the QA/QC handoff until the field-coverage exception is resolved or formally accepted.",rationale:"The exception may affect acceptance coverage. Advancing without disposition would move an incomplete candidate into release review.",confidence:96,source:"Delivery Control · milestone evidence",sourceUpdatedAt:"2026-07-21T13:06:00-04:00",activities:[{id:"EVT-014-003",occurredAt:"2026-07-21T13:06:00-04:00",actor:"AGT-003",kind:"Exception",summary:"Field-coverage exception escalated",detail:"One required area lacks verified capture coverage; a change decision is required.",evidence:"Exception EXC-2026-014"},{id:"EVT-014-002",occurredAt:"2026-07-21T09:20:00-04:00",actor:"AGT-014",kind:"Recommendation",summary:"Data handling controls verified",detail:"Current working set remains inside the approved project classification and access boundary.",evidence:"Security review SEC-2026-041"},{id:"EVT-014-001",occurredAt:"2026-07-18T15:15:00-04:00",actor:"AGT-003",kind:"Handoff",summary:"Project entered delivery",detail:"Kickoff gate completed with baseline, owners, access, schedule, and quality plan linked.",evidence:"Kickoff record v1"}]},
];

const stageActions:Record<WorkflowStageId,string> = {
  intake:"Accept and send to Sales Qualification",
  qualification:"Submit bid / no-bid decision",
  bid:"Approve bid and start response",
  response:"Approve response for external issue",
  contract:"Convert to project and start kickoff",
  kickoff:"Approve kickoff and begin delivery",
  delivery:"Submit deliverable to QA/QC",
  quality:"Accept release and start closeout",
  closeout:"Approve closeout and archive",
};

export function stageActionLabel(stage:WorkflowStageId){return stageActions[stage];}

export function validateStageMove(current:WorkflowStageId,next:WorkflowStageId,gateConfirmed:boolean){
  const from=WORKFLOW_STAGES.findIndex(stage=>stage.id===current); const to=WORKFLOW_STAGES.findIndex(stage=>stage.id===next);
  if(to!==from+1) throw new Error("Projects move one governed stage at a time.");
  if(!gateConfirmed) throw new Error("Confirm the current stage gate before advancing.");
  return true;
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

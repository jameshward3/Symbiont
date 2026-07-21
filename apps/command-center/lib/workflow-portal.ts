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
export type PortalProject = {
  id:string; title:string; client:string; solicitation:string; stage:WorkflowStageId;
  owner:string; dueDate:string; nextAction:string; notionUrl?:string; progress:number; approvals:string[];
};

export const demonstrationPortalProjects:PortalProject[] = [
  {id:"OPP-2026-021",title:"Existing-conditions capture pilot",client:"NY/NJ institutional owner",solicitation:"RFQ pending",stage:"qualification",owner:"AGT-002",dueDate:"2026-07-28",nextAction:"Confirm buyer and procurement route",progress:18,approvals:[]},
  {id:"OPP-2026-018",title:"Portfolio building-data foundation",client:"Demonstration client",solicitation:"RFP-DEMO-014",stage:"response",owner:"AGT-002",dueDate:"2026-08-04",nextAction:"Complete compliance matrix and price review",progress:42,approvals:["Pricing","External release"]},
  {id:"PRJ-2026-014",title:"Reality-capture delivery",client:"Demonstration client",solicitation:"Executed agreement",stage:"delivery",owner:"AGT-003",dueDate:"2026-08-18",nextAction:"Resolve field coverage exception",progress:67,approvals:["Change decision"]},
];

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

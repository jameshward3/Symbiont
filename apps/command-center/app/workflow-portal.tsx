"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  canApproveExternalIssue,
  releaseBlockers,
  repriceEstimate,
  responsePackageForOpportunity,
  stageActionLabel,
  visiblePortalProjects,
  WORKFLOW_STAGES,
  type PortalProject,
  type RequirementStatus,
  type ResponseDraft,
  type ResponsePackage,
  type WorkflowActivity,
} from "@/lib/workflow-portal";

const blank: ResponseDraft = {
  responseType: "RFP", solicitation: "", client: "", title: "", dueDate: "",
  executiveSummary: "", understanding: "", approach: "", deliverables: "",
  schedule: "", team: "", assumptions: "", exclusions: "", pricing: "", validity: "30 days",
};

type QueueFilter = "attention" | "approval" | "risk" | "all" | "closed";

const filters: Array<{ id: QueueFilter; label: string }> = [
  { id: "attention", label: "Needs attention" },
  { id: "approval", label: "My approvals" },
  { id: "risk", label: "At risk" },
  { id: "all", label: "All active" },
  { id: "closed", label: "Closed" },
];

type PackageTab = "overview"|"requirements"|"draft"|"estimate";

export function WorkflowPortal({ accessKey, demoMode, projects, setProjects, focusProjectId, onOpenWorkProduct }: { accessKey: string; demoMode:boolean; projects:PortalProject[]; setProjects:Dispatch<SetStateAction<PortalProject[]>>; focusProjectId:string|null; onOpenWorkProduct:(agentId:string)=>void }) {
  const modeProjects = useMemo(() => visiblePortalProjects(projects, demoMode), [demoMode, projects]);
  const [selectedId, setSelectedId] = useState(focusProjectId || modeProjects[0]?.id || "");
  const [draft, setDraft] = useState<ResponseDraft>(() => modeProjects.find(project=>project.id===(focusProjectId || modeProjects[0]?.id))?.responsePackage?.draft || blank);
  const [gate, setGate] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"actions" | "response">("actions");
  const [packageTab, setPackageTab] = useState<PackageTab>("overview");
  const [filter, setFilter] = useState<QueueFilter>("attention");

  const selected = useMemo(() => modeProjects.find(project => project.id === selectedId) ?? modeProjects[0] ?? null, [modeProjects, selectedId]);
  const stageIndex = selected ? WORKFLOW_STAGES.findIndex(stage => stage.id === selected.stage) : -1;
  const currentStage = stageIndex >= 0 ? WORKFLOW_STAGES[stageIndex] : null;
  const nextStage = stageIndex >= 0 ? WORKFLOW_STAGES[stageIndex + 1] : null;
  const incompleteApprovals = selected ? selected.approvals.filter(item => !selected.completedApprovals.includes(item)) : [];
  const externalIssueReady = selected ? canApproveExternalIssue(selected) : false;
  const externalIssueBlockers = selected ? releaseBlockers(selected) : [];

  const queue = useMemo(() => modeProjects.filter(project => {
    if (filter === "closed") return project.status === "Closed";
    if (project.status === "Closed") return false;
    if (filter === "approval") return project.attention === "Approval" || project.approvals.some(item => !project.completedApprovals.includes(item));
    if (filter === "risk") return project.attention === "At risk";
    if (filter === "attention") return ["Approval", "Input needed", "At risk"].includes(project.attention);
    return true;
  }), [filter, modeProjects]);

  function updateProject(patch: Partial<PortalProject>) {
    setProjects(items => items.map(item => item.id === selectedId ? { ...item, ...patch } : item));
  }

  function updateResponsePackage(update:(value:ResponsePackage)=>ResponsePackage) {
    if (!selected?.responsePackage) return;
    setProjects(items=>items.map(item=>item.id===selected.id&&item.responsePackage?{...item,responsePackage:update(item.responsePackage)}:item));
  }

  function selectProject(project:PortalProject) {
    setSelectedId(project.id); setDraft(project.responsePackage?.draft || blank); setGate(false); setNotice(""); setPackageTab("overview");
  }

  function appendActivity(activity: Omit<WorkflowActivity, "id" | "occurredAt">) {
    if (!selected) return;
    const event: WorkflowActivity = {
      ...activity,
      id: `EVT-${selected.id}-${Date.now()}`,
      occurredAt: new Date().toISOString(),
    };
    updateProject({ activities: [event, ...selected.activities] });
  }

  function toggleApproval(approval: string) {
    if (!selected) return;
    const approved = selected.completedApprovals.includes(approval);
    const completedApprovals = approved
      ? selected.completedApprovals.filter(item => item !== approval)
      : [...selected.completedApprovals, approval];
    updateProject({ completedApprovals });
  }

  function addNewProject() {
    const id = `OPP-${new Date().getFullYear()}-${String(modeProjects.length + 22).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const responsePackage=responsePackageForOpportunity({ id,title:"New opportunity",client:"",solicitation:"",stage:"intake",source:"Manual intake",sourceUpdatedAt:now,isDemonstration:demoMode });
    const project: PortalProject = {
      id, title: "New opportunity", client: "", solicitation: "", stage: "intake", owner: "AGT-009",
      dueDate: "", nextAction: "Complete and verify opportunity intake", progress: 5,
      approvals: ["Source acceptance"], completedApprovals: [], attention: "Input needed", status: "Active",
      recommendation: "Complete the required intake evidence before routing this opportunity.",
      rationale: "The workflow cannot safely score or hand off an opportunity until the source, buyer, scope, and deadline are verified.",
      confidence: 35, source: "Manual intake", sourceUpdatedAt: now, isDemonstration:demoMode, responsePackage, activities: [{
        id: `EVT-${id}-001`, occurredAt: now, actor: "James", kind: "Edit",
        summary: "Opportunity record created", detail: "Required intake fields are awaiting review.",
      }],
    };
    setProjects(items => [project, ...items]);
    setSelectedId(id);
    setDraft(responsePackage.draft);
    setFilter("all");
    setGate(false);
    setNotice("New opportunity created as a draft. Verify its source before handoff.");
  }

  function advance() {
    setNotice("");
    if (!selected || !currentStage) return setNotice("Select an Action queue record before advancing.");
    if (selected.status === "Paused") return setNotice("Resume this work item before advancing it.");
    if (incompleteApprovals.length) return setNotice(`Complete required approval: ${incompleteApprovals.join(", ")}.`);
    if (selected.stage === "response" && !externalIssueReady) return setNotice(`External issue is blocked. Complete the delivery checklist: ${externalIssueBlockers.join("; ")}.`);
    if (!gate) return setNotice("Confirm the current release gate before advancing.");

    if (!nextStage) {
      const event: WorkflowActivity = {
        id: `EVT-${selected.id}-${Date.now()}`, occurredAt: new Date().toISOString(), actor: "James", kind: "Closeout",
        summary: "Closeout approved", detail: "Acceptance, final issue, lessons, archive, and Client Success handoff were confirmed.",
        evidence: "Human release-gate confirmation",
      };
      updateProject({ status: "Closed", attention: "Complete", progress: 100, nextAction: "Closed and archived", activities: [event, ...selected.activities] });
      setGate(false);
      setNotice("Closeout completed. The record is now closed and retained in the activity history.");
      return;
    }

    const event: WorkflowActivity = {
      id: `EVT-${selected.id}-${Date.now()}`, occurredAt: new Date().toISOString(), actor: "James", kind: "Handoff",
      summary: `Handoff accepted by ${nextStage.agent}`,
      detail: `${currentStage.label} gate completed; accountability transferred to ${nextStage.label}.`,
      evidence: "Human release-gate confirmation",
    };
    const nextAttention = (["bid", "response", "contract", "quality", "closeout"] as string[]).includes(nextStage.id) ? "Approval" : "Working";
    const nextApprovals = nextStage.id === "bid" ? ["Bid / no-bid decision"] : nextStage.id === "response" ? ["Pricing", "External release"] : [];
    updateProject({
      stage: nextStage.id,
      owner: nextStage.agent,
      progress: Math.round((stageIndex + 2) / WORKFLOW_STAGES.length * 100),
      nextAction: nextStage.gate,
      attention: nextAttention,
      approvals: nextApprovals,
      completedApprovals: [],
      recommendation: `Complete the ${nextStage.label.toLowerCase()} gate and prepare the next governed handoff.`,
      rationale: `The prior gate is complete. ${nextStage.agent} now owns the next bounded work package.`,
      confidence: 100,
      source: "Governed workflow handoff",
      sourceUpdatedAt: event.occurredAt,
      activities: [event, ...selected.activities],
    });
    setGate(false);
    setNotice(`Moved to ${nextStage.label}. ${nextStage.agent} is now accountable for the next action.`);
  }

  function returnForRevision() {
    if (!selected) return;
    appendActivity({ actor: "James", kind: "Exception", summary: "Returned for revision", detail: "The current recommendation requires additional evidence or correction before approval." });
    updateProject({ attention: "Input needed" });
    setGate(false);
    setNotice("Returned for revision. The owner remains accountable until the missing evidence is resolved.");
  }

  function togglePause() {
    if (!selected) return;
    const paused = selected.status === "Paused";
    updateProject({ status: paused ? "Active" : "Paused", attention: paused ? "Working" : selected.attention });
    setNotice(paused ? "Work item resumed." : "Work item paused. No workflow handoff occurred.");
  }

  async function syncNotion() {
    if (!selected) return setNotice("Select an Action queue record before linking Notion.");
    setNotice("Syncing…");
    const response = await fetch("/api/workflow/notion", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessKey ? { "x-symbiont-access-key": accessKey } : {}) },
      body: JSON.stringify(selected),
    });
    const result = await response.json();
    if (response.ok && result.url) updateProject({ notionUrl: result.url });
    setNotice(result.message || result.error || "Notion sync finished.");
  }

  function toggleChecklist(id:string) {
    updateResponsePackage(responsePackage=>({ ...responsePackage, deliveryChecklist:responsePackage.deliveryChecklist.map(item=>item.id===id?{...item,satisfied:!item.satisfied,evidence:!item.satisfied?`Confirmed by James · ${new Date().toISOString()}`:item.evidence}:item) }));
  }

  function setRequirementStatus(id:string,status:RequirementStatus) {
    updateResponsePackage(responsePackage=>({ ...responsePackage, requirements:responsePackage.requirements.map(item=>item.id===id?{...item,status}:item) }));
  }

  function updateEstimateLine(id:string,key:"quantity"|"proposedRate",value:number) {
    if (!selected?.responsePackage) return;
    const lines=selected.responsePackage.estimate.lines.map(line=>line.id===id?{...line,[key]:Number.isFinite(value)?Math.max(0,value):0}:line);
    const estimate=repriceEstimate(selected.responsePackage.estimate,lines);
    const nextDraft={...selected.responsePackage.draft,pricing:`Current ROM: $${Math.round(estimate.total).toLocaleString("en-US")} based on traceable historical context, current market wage benchmarks, editable indirect assumptions, and provisional direct costs. Finance and executive price approval required.`};
    setDraft(nextDraft);
    updateResponsePackage(responsePackage=>({...responsePackage,estimate,draft:nextDraft}));
  }

  function updateDraft(value:ResponseDraft) {
    setDraft(value);
    updateResponsePackage(responsePackage=>({...responsePackage,draft:value}));
  }

  async function exportFile(format: "docx" | "pdf") {
    setNotice("Preparing export…");
    const response = await fetch(`/api/responses/export?format=${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessKey ? { "x-symbiont-access-key": accessKey } : {}) },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      const error = await response.json();
      return setNotice(error.error || "Export failed safely.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.solicitation || "response"}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${format.toUpperCase()} export created. External issue still requires human approval.`);
  }

  return <section className="workflow-view">
    <div className="workflow-hero"><div><p className="eyebrow">Symbiont actions</p><h2>Lead to <em>closeout.</em></h2></div><p>One approval queue moves opportunities and projects through governed agent handoffs. Background agents surface only recommendations, exceptions, and decisions that need attention.</p></div>
    <div className="workflow-tabs"><button className={tab === "actions" ? "active" : ""} onClick={() => setTab("actions")}>Action queue</button><button className={tab === "response" ? "active" : ""} onClick={() => setTab("response")}>Draft editor / export</button><span>L1 draft · material actions require human approval</span></div>
    <div className="workflow-boundary" role="note"><b>{demoMode ? "Demonstration queue" : "Session queue"}</b><span>{demoMode ? "Action queue records are controlled demonstrations. Stage changes remain browser-local." : "Only live or verified Pipeline handoffs appear here. Stage changes remain browser-local until governed workflow persistence is enabled."}</span></div>
    {notice && <div className="workflow-notice" role="status">{notice}</div>}
    {tab === "actions" ? <>
      <div className="queue-filters" aria-label="Action queue filters">{filters.map(item => <button key={item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}><span>{item.label}</span><b>{countFilter(modeProjects, item.id)}</b></button>)}</div>
      <div className="stage-rail">{WORKFLOW_STAGES.map((stage, index) => <button key={stage.id} className={stageIndex >= 0 && index < stageIndex ? "done" : index === stageIndex ? "current" : ""} title={stage.gate}><b>{String(index + 1).padStart(2, "0")}</b><span>{stage.label}</span><small>{stage.agent}</small></button>)}</div>
      <div className="workflow-grid">
        <aside className="work-list"><header><div><p className="eyebrow">Action queue</p><small>{queue.length} visible</small></div><button onClick={addNewProject}>+ New</button></header>{queue.length ? queue.map(project => <button key={project.id} className={project.id === selectedId ? "selected" : ""} onClick={() => selectProject(project)}><div className="queue-row-meta"><small>{project.id} · {WORKFLOW_STAGES.find(stage => stage.id === project.stage)?.label}</small><b className={attentionTone(project.attention)}>{project.attention}</b></div><strong>{project.title}</strong><span>{project.client || "Client required"}</span><em>{project.nextAction}</em><i style={{ width: `${project.progress}%` }} /></button>) : <div className="empty-queue"><strong>No records in this view</strong><span>{modeProjects.length ? "Choose another filter." : demoMode ? "No demonstration records are available." : "Open Pipeline, select an opportunity, and choose Start governed response."}</span></div>}</aside>
        {selected && currentStage ? <div className="action-workspace">
          <div className="work-editor">
            <header><div><p className="eyebrow">{selected.id} · {selected.owner}</p><h3>{selected.title}</h3></div><div className="work-state"><b className={attentionTone(selected.attention)}>{selected.attention}</b><span>{selected.progress}% complete</span></div></header>
            <div className="recommendation-card"><div><p className="eyebrow">Agent recommendation</p><strong>{selected.recommendation}</strong><p>{selected.rationale}</p></div><div className="confidence-score"><span>Confidence</span><b>{selected.confidence}%</b><small>{selected.owner}</small></div></div>
            <div className="source-strip"><span>Source <b>{selected.source}</b></span><span>Updated <b>{formatDateTime(selected.sourceUpdatedAt)}</b></span><span>Provenance <b>Preserved</b></span></div>
            <div className="field-grid">
              <SourcedField label="Project / opportunity title" value={selected.title} source={selected.source} confidence={selected.confidence} onChange={value => updateProject({ title: value })} />
              <SourcedField label="Client / issuer" value={selected.client} source={selected.source} confidence={selected.confidence} onChange={value => updateProject({ client: value })} />
              <SourcedField label="Solicitation / agreement" value={selected.solicitation} source={selected.source} confidence={selected.confidence} onChange={value => updateProject({ solicitation: value })} />
              <SourcedField label="Current owner" value={selected.owner} source="Workflow policy" confidence={100} onChange={value => updateProject({ owner: value })} />
              <SourcedField label="Due date" value={selected.dueDate} source={selected.source} confidence={selected.confidence} type="date" onChange={value => updateProject({ dueDate: value })} />
              <SourcedField label="Next action" value={selected.nextAction} source="Agent recommendation" confidence={selected.confidence} onChange={value => updateProject({ nextAction: value })} />
              <SourcedField label="Notion page URL" value={selected.notionUrl || ""} source="Manual / Notion sync" confidence={selected.notionUrl ? 100 : 0} onChange={value => updateProject({ notionUrl: value })} />
            </div>
            {selected.responsePackage && <ResponsePackageWorkspace responsePackage={selected.responsePackage} activeTab={packageTab} setActiveTab={setPackageTab} setRequirementStatus={setRequirementStatus} toggleChecklist={toggleChecklist} updateEstimateLine={updateEstimateLine} openWorkProduct={onOpenWorkProduct} openDraftEditor={()=>setTab("response")} />}
            <div className="approval-stack">
              <div className="gate-card"><div><p className="eyebrow">Current release gate</p><strong>{currentStage.gate}</strong><small>Evidence must be stored in an approved system of record.</small></div><label><input type="checkbox" checked={gate} onChange={event => setGate(event.target.checked)} /> I confirm this gate is satisfied</label></div>
              {selected.approvals.length > 0 && <div className="required-approvals"><header><span>Required approvals</span><b>{selected.completedApprovals.length}/{selected.approvals.length} complete</b></header>{selected.approvals.map(approval => <label key={approval}><input type="checkbox" checked={selected.completedApprovals.includes(approval)} onChange={() => toggleApproval(approval)} /><span>{approval}</span><small>Human approval</small></label>)}</div>}
            </div>
            {selected.stage === "response" && !externalIssueReady && <div className="release-blocked" role="note"><b>External issue locked</b><span>{externalIssueBlockers.length} required delivery checks remain. Complete them in Response package → Delivery checklist to unlock approval.</span></div>}
            <div className="editor-actions"><button className="quiet" onClick={togglePause}>{selected.status === "Paused" ? "Resume" : "Pause"}</button><button className="secondary" onClick={returnForRevision}>Return for revision</button><button className="secondary" onClick={syncNotion}>↗ Sync / link Notion</button>{selected.notionUrl && <a href={selected.notionUrl} target="_blank" rel="noreferrer">Open Notion</a>}<button className="primary" disabled={selected.status === "Closed" || (selected.stage === "response" && !externalIssueReady)} onClick={advance}>{selected.status === "Closed" ? "Closeout complete" : stageActionLabel(selected.stage)} →</button></div>
          </div>
          <ActivityTimeline activities={selected.activities} />
        </div> : <div className="workflow-empty"><p className="eyebrow">Governed handoff queue</p><h3>No live work has been handed over.</h3><p>Select an opportunity in Pipeline and choose <b>Start governed response</b>. The selected record will arrive here with its source, confidence, approvals, and next action preserved.</p></div>}
      </div>
    </> : <ResponseStudio draft={draft} setDraft={updateDraft} exportFile={exportFile} />}
  </section>;
}

function countFilter(projects: PortalProject[], filter: QueueFilter) {
  if (filter === "closed") return projects.filter(project => project.status === "Closed").length;
  if (filter === "approval") return projects.filter(project => project.status !== "Closed" && (project.attention === "Approval" || project.approvals.some(item => !project.completedApprovals.includes(item)))).length;
  if (filter === "risk") return projects.filter(project => project.status !== "Closed" && project.attention === "At risk").length;
  if (filter === "attention") return projects.filter(project => project.status !== "Closed" && ["Approval", "Input needed", "At risk"].includes(project.attention)).length;
  return projects.filter(project => project.status !== "Closed").length;
}

function attentionTone(attention: PortalProject["attention"]) {
  if (attention === "At risk") return "red";
  if (attention === "Approval" || attention === "Input needed") return "amber";
  if (attention === "Complete") return "green";
  return "neutral";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function SourcedField({ label, value, onChange, source, confidence, type = "text" }: { label: string; value: string; onChange: (value: string) => void; source: string; confidence: number; type?: string }) {
  return <label className="portal-field sourced-field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /><small><b>{confidence ? `${confidence}%` : "Manual"}</b>{source}</small></label>;
}

function ResponsePackageWorkspace({ responsePackage, activeTab, setActiveTab, setRequirementStatus, toggleChecklist, updateEstimateLine, openWorkProduct, openDraftEditor }:{ responsePackage:ResponsePackage; activeTab:PackageTab; setActiveTab:(value:PackageTab)=>void; setRequirementStatus:(id:string,status:RequirementStatus)=>void; toggleChecklist:(id:string)=>void; updateEstimateLine:(id:string,key:"quantity"|"proposedRate",value:number)=>void; openWorkProduct:(agentId:string)=>void; openDraftEditor:()=>void }) {
  const verified=responsePackage.requirements.filter(item=>item.status==="Verified").length;
  const checks=responsePackage.deliveryChecklist.filter(item=>item.satisfied).length;
  const requiredChecks=responsePackage.deliveryChecklist.filter(item=>item.required).length;
  const releaseReady=requiredChecks>0&&responsePackage.deliveryChecklist.filter(item=>item.required).every(item=>item.satisfied);
  return <section className="response-package">
    <header><div><p className="eyebrow">Governed response package</p><h3>Requirements → response → price → release</h3></div><span className={releaseReady?"package-ready":"package-draft"}>{releaseReady?"Release ready":"Draft / gated"}</span></header>
    <nav aria-label="Response package views">
      {([[
        "overview","Work products & gate"],["requirements","Requirements matrix"],["draft","Compiled draft"],["estimate","Estimate & bid decision"]] as Array<[PackageTab,string]>).map(([id,label])=><button type="button" key={id} className={activeTab===id?"active":""} onClick={()=>setActiveTab(id)}>{label}</button>)}
    </nav>
    {activeTab==="overview"&&<div className="package-panel">
      <div className="package-kpis"><article><span>Requirements verified</span><strong>{verified}/{responsePackage.requirements.length}</strong><small>Full RFP extraction still controls completeness</small></article><article><span>Background work products</span><strong>{responsePackage.workProducts.length}</strong><small>Each opens its accountable agent workspace</small></article><article><span>ROM estimate</span><strong>{formatMoney(responsePackage.estimate.total)}</strong><small>{responsePackage.estimate.confidence}% estimate confidence</small></article><article><span>Delivery checks</span><strong>{checks}/{requiredChecks}</strong><small>{releaseReady?"External approval unlocked":"External issue remains locked"}</small></article></div>
      <div className="package-split"><section><div className="subsection-title"><div><p className="eyebrow">Background-agent work product</p><h4>Linked evidence and recommendations</h4></div><span>{responsePackage.workProducts.filter(item=>item.status==="Complete").length} complete</span></div><div className="work-product-list">{responsePackage.workProducts.map(item=><button type="button" key={item.id} onClick={()=>openWorkProduct(item.agentId)}><span>{item.id} · {item.agentId}</span><strong>{item.title}</strong><p>{item.summary}</p><small><b>{item.status}</b>{item.evidence}</small><i>Open workspace →</i></button>)}</div></section>
      <section><div className="subsection-title"><div><p className="eyebrow">Delivery checklist</p><h4>Required before external issue</h4></div><span>{checks}/{requiredChecks}</span></div><div className="delivery-checklist">{responsePackage.deliveryChecklist.map(item=><label key={item.id} className={item.satisfied?"satisfied":""}><input type="checkbox" checked={item.satisfied} onChange={()=>toggleChecklist(item.id)} /><span><strong>{item.label}</strong><small>{item.owner} · {item.evidence}</small></span><b>{item.required?"Required":"Optional"}</b></label>)}</div></section></div>
    </div>}
    {activeTab==="requirements"&&<div className="package-panel requirements-panel"><div className="requirements-head"><span>Requirement / section</span><span>Formulated response + knowledge basis</span><span>Status</span></div>{responsePackage.requirements.map(item=><article key={item.id}><div><small>{item.id} · {item.section}</small><strong>{item.requirement}</strong><span>Owner {item.owner}</span></div><div><p>{item.response}</p><small>Sources: {item.sourceIds.join(", ")||"Source required"}</small><small>Work products: {item.workProductIds.join(", ")}</small></div><label><span className="sr-only">Status for {item.id}</span><select value={item.status} onChange={event=>setRequirementStatus(item.id,event.target.value as RequirementStatus)}><option>Missing source</option><option>Draft</option><option>Ready for review</option><option>Verified</option></select></label></article>)}</div>}
    {activeTab==="draft"&&<div className="package-panel compiled-wrap"><div className="compiled-actions"><div><p className="eyebrow">Compiled response document</p><h4>Live preview from the governed package</h4><span>Draft watermark · requirement coverage and price remain gated</span></div><button type="button" onClick={openDraftEditor}>Edit / export document →</button></div><CompiledDraft draft={responsePackage.draft} requirements={responsePackage.requirements} /></div>}
    {activeTab==="estimate"&&<div className="package-panel estimate-panel"><div className="estimate-summary"><div><p className="eyebrow">Shared RFP + pipeline ROM</p><h4>{formatMoney(responsePackage.estimate.total)}</h4><span>{responsePackage.estimate.status} · {responsePackage.estimate.decision}</span></div><div><span>Confidence</span><strong>{responsePackage.estimate.confidence}%</strong><small>Quantity and allowance validation drive the gap</small></div><div><span>Assumptions</span><strong>{Math.round(responsePackage.estimate.laborBurdenPct*100)}% / {Math.round(responsePackage.estimate.overheadPct*100)}% / {Math.round(responsePackage.estimate.feePct*100)}%</strong><small>Burden / overhead / fee</small></div><div><span>Refresh due</span><strong>{responsePackage.estimate.refreshDue}</strong><small>Market and vendor review</small></div></div><div className="estimate-table"><div className="estimate-head"><span>Line item</span><span>Historical</span><span>Market base</span><span>Quantity</span><span>Proposed</span><span>Total</span></div>{responsePackage.estimate.lines.map(line=><div className="estimate-row" key={line.id}><div><small>{line.id} · {line.category}</small><strong>{line.description}</strong><em>{line.sourceIds.join(" · ")} · {line.confidence}%</em></div><span>{line.historicalRate===null?"—":formatMoney(line.historicalRate)}</span><span>{line.marketBaseRate===null?"—":formatMoney(line.marketBaseRate)}</span><label><span className="sr-only">Quantity for {line.description}</span><input type="number" min="0" step="1" value={line.quantity} onChange={event=>updateEstimateLine(line.id,"quantity",Number(event.target.value))} /><small>{line.unit}</small></label><label><span className="sr-only">Proposed rate for {line.description}</span><input type="number" min="0" step=".01" value={line.proposedRate} onChange={event=>updateEstimateLine(line.id,"proposedRate",Number(event.target.value))} /></label><strong>{formatMoney(line.total)}</strong></div>)}<div className="estimate-total"><span>Subtotal {formatMoney(responsePackage.estimate.subtotal)}</span><span>Contingency {Math.round(responsePackage.estimate.contingencyPct*100)}% · {formatMoney(responsePackage.estimate.contingency)}</span><strong>ROM {formatMoney(responsePackage.estimate.total)}</strong></div></div><div className="estimate-sources"><p className="eyebrow">Source and assumption register</p>{responsePackage.estimate.sources.map(source=><article key={source.id}><div><span>{source.id} · {source.kind}</span><strong>{source.href?<a href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>:source.label}</strong></div><p>{source.note}</p><small>As of {source.asOf}</small></article>)}</div></div>}
  </section>;
}

function CompiledDraft({draft,requirements}:{draft:ResponseDraft;requirements:ResponsePackage["requirements"]}) {
  return <article className="compiled-document"><div className="draft-watermark">DRAFT · NOT FOR EXTERNAL ISSUE</div><header><p>{draft.responseType} RESPONSE</p><h2>{draft.title}</h2><span>{draft.client} · {draft.solicitation} · Due {draft.dueDate||"pending"}</span></header><section><h3>Executive summary</h3><p>{draft.executiveSummary}</p></section><section><h3>Understanding of requirements</h3><p>{draft.understanding}</p><table><thead><tr><th>ID</th><th>Requirement</th><th>Status</th></tr></thead><tbody>{requirements.map(item=><tr key={item.id}><td>{item.id}</td><td>{item.requirement}</td><td>{item.status}</td></tr>)}</tbody></table></section><section><h3>Technical and management approach</h3><p>{draft.approach}</p></section><div className="compiled-columns"><section><h3>Deliverables</h3><p>{draft.deliverables}</p></section><section><h3>Schedule</h3><p>{draft.schedule}</p></section></div><section><h3>Team</h3><p>{draft.team}</p></section><div className="compiled-columns"><section><h3>Assumptions</h3><p>{draft.assumptions}</p></section><section><h3>Exclusions</h3><p>{draft.exclusions}</p></section></div><section><h3>Pricing architecture</h3><p>{draft.pricing}</p><small>Offer validity: {draft.validity}</small></section></article>;
}

function formatMoney(value:number) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value); }

function ActivityTimeline({ activities }: { activities: WorkflowActivity[] }) {
  return <section className="activity-panel"><header><div><p className="eyebrow">Activity and evidence</p><h3>Governed timeline</h3></div><span>{activities.length} events</span></header><div className="activity-list">{activities.map(activity => <article key={activity.id}><i className={activity.kind === "Exception" ? "red" : activity.kind === "Approval" || activity.kind === "Closeout" ? "green" : ""} /><div><span>{formatDateTime(activity.occurredAt)} · {activity.actor} · {activity.kind}</span><strong>{activity.summary}</strong><p>{activity.detail}</p>{activity.evidence && <small>Evidence: {activity.evidence}</small>}</div></article>)}</div><details className="raw-log"><summary>View raw agent log</summary><pre>{JSON.stringify(activities, null, 2)}</pre></details></section>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="portal-field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="portal-area"><span>{label}</span><textarea value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function ResponseStudio({ draft, setDraft, exportFile }: { draft: ResponseDraft; setDraft: (value: ResponseDraft) => void; exportFile: (format: "docx" | "pdf") => void }) {
  const change = (key: keyof ResponseDraft, value: string) => setDraft({ ...draft, [key]: value });
  return <div className="response-studio"><aside><p className="eyebrow">Response controls</p><label className="portal-field"><span>Response type</span><select value={draft.responseType} onChange={event => change("responseType", event.target.value)}><option>RFP</option><option>RFQ</option></select></label><Field label="Solicitation number" value={draft.solicitation} onChange={value => change("solicitation", value)} /><Field label="Client / agency" value={draft.client} onChange={value => change("client", value)} /><Field label="Response title" value={draft.title} onChange={value => change("title", value)} /><Field label="Due date" value={draft.dueDate} type="date" onChange={value => change("dueDate", value)} /><Field label="Offer validity" value={draft.validity} onChange={value => change("validity", value)} /><div className="export-stack"><button onClick={() => exportFile("docx")}>Export Word</button><button onClick={() => exportFile("pdf")}>Export PDF</button></div><small className="approval-note">Exports are marked Draft. Pricing and external submission require authorized human approval.</small></aside><div className="response-form"><header><div><p className="eyebrow">Draft response document</p><h3>{draft.title || "Untitled response"}</h3></div><span>{draft.responseType}</span></header><Area label="Executive summary" value={draft.executiveSummary} onChange={value => change("executiveSummary", value)} placeholder="Why Symbiont, the desired client outcome, and the bounded offer…" /><Area label="Understanding of requirements" value={draft.understanding} onChange={value => change("understanding", value)} placeholder="Verified needs, constraints, acceptance criteria, and missing information…" /><Area label="Technical approach" value={draft.approach} onChange={value => change("approach", value)} placeholder="Methods, tools, controls, handoffs, and quality gates…" /><Area label="Deliverables" value={draft.deliverables} onChange={value => change("deliverables", value)} placeholder="One deliverable per line with format and acceptance basis…" /><div className="area-pair"><Area label="Schedule" value={draft.schedule} onChange={value => change("schedule", value)} placeholder="Milestones and dependencies…" /><Area label="Team" value={draft.team} onChange={value => change("team", value)} placeholder="Roles, qualifications, and responsibilities…" /></div><div className="area-pair"><Area label="Assumptions" value={draft.assumptions} onChange={value => change("assumptions", value)} placeholder="One assumption per line…" /><Area label="Exclusions" value={draft.exclusions} onChange={value => change("exclusions", value)} placeholder="Licensed, hazardous, concealed, or client-owned scope…" /></div><Area label="Pricing architecture" value={draft.pricing} onChange={value => change("pricing", value)} placeholder="Human-approved commercial structure or 'Pricing submitted separately'…" /></div></div>;
}

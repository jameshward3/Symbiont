"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  stageActionLabel,
  visiblePortalProjects,
  WORKFLOW_STAGES,
  type PortalProject,
  type ResponseDraft,
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

export function WorkflowPortal({ accessKey, demoMode, projects, setProjects, focusProjectId }: { accessKey: string; demoMode:boolean; projects:PortalProject[]; setProjects:Dispatch<SetStateAction<PortalProject[]>>; focusProjectId:string|null }) {
  const modeProjects = useMemo(() => visiblePortalProjects(projects, demoMode), [demoMode, projects]);
  const [selectedId, setSelectedId] = useState(focusProjectId || modeProjects[0]?.id || "");
  const [draft, setDraft] = useState<ResponseDraft>(blank);
  const [gate, setGate] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"actions" | "response">("actions");
  const [filter, setFilter] = useState<QueueFilter>("attention");

  const selected = useMemo(() => modeProjects.find(project => project.id === selectedId) ?? modeProjects[0] ?? null, [modeProjects, selectedId]);
  const stageIndex = selected ? WORKFLOW_STAGES.findIndex(stage => stage.id === selected.stage) : -1;
  const currentStage = stageIndex >= 0 ? WORKFLOW_STAGES[stageIndex] : null;
  const nextStage = stageIndex >= 0 ? WORKFLOW_STAGES[stageIndex + 1] : null;
  const incompleteApprovals = selected ? selected.approvals.filter(item => !selected.completedApprovals.includes(item)) : [];

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
    const project: PortalProject = {
      id, title: "New opportunity", client: "", solicitation: "", stage: "intake", owner: "AGT-009",
      dueDate: "", nextAction: "Complete and verify opportunity intake", progress: 5,
      approvals: ["Source acceptance"], completedApprovals: [], attention: "Input needed", status: "Active",
      recommendation: "Complete the required intake evidence before routing this opportunity.",
      rationale: "The workflow cannot safely score or hand off an opportunity until the source, buyer, scope, and deadline are verified.",
      confidence: 35, source: "Manual intake", sourceUpdatedAt: now, isDemonstration:demoMode, activities: [{
        id: `EVT-${id}-001`, occurredAt: now, actor: "James", kind: "Edit",
        summary: "Opportunity record created", detail: "Required intake fields are awaiting review.",
      }],
    };
    setProjects(items => [project, ...items]);
    setSelectedId(id);
    setFilter("all");
    setGate(false);
    setNotice("New opportunity created as a draft. Verify its source before handoff.");
  }

  function advance() {
    setNotice("");
    if (!selected || !currentStage) return setNotice("Select an Action queue record before advancing.");
    if (selected.status === "Paused") return setNotice("Resume this work item before advancing it.");
    if (incompleteApprovals.length) return setNotice(`Complete required approval: ${incompleteApprovals.join(", ")}.`);
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
    updateProject({
      stage: nextStage.id,
      owner: nextStage.agent,
      progress: Math.round((stageIndex + 2) / WORKFLOW_STAGES.length * 100),
      nextAction: nextStage.gate,
      attention: nextAttention,
      approvals: [],
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
    <div className="workflow-tabs"><button className={tab === "actions" ? "active" : ""} onClick={() => setTab("actions")}>Action queue</button><button className={tab === "response" ? "active" : ""} onClick={() => setTab("response")}>RFP / RFQ response studio</button><span>L1 draft · material actions require human approval</span></div>
    <div className="workflow-boundary" role="note"><b>{demoMode ? "Demonstration queue" : "Session queue"}</b><span>{demoMode ? "Action queue records are controlled demonstrations. Stage changes remain browser-local." : "Only live or verified Pipeline handoffs appear here. Stage changes remain browser-local until governed workflow persistence is enabled."}</span></div>
    {notice && <div className="workflow-notice" role="status">{notice}</div>}
    {tab === "actions" ? <>
      <div className="queue-filters" aria-label="Action queue filters">{filters.map(item => <button key={item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}><span>{item.label}</span><b>{countFilter(modeProjects, item.id)}</b></button>)}</div>
      <div className="stage-rail">{WORKFLOW_STAGES.map((stage, index) => <button key={stage.id} className={stageIndex >= 0 && index < stageIndex ? "done" : index === stageIndex ? "current" : ""} title={stage.gate}><b>{String(index + 1).padStart(2, "0")}</b><span>{stage.label}</span><small>{stage.agent}</small></button>)}</div>
      <div className="workflow-grid">
        <aside className="work-list"><header><div><p className="eyebrow">Action queue</p><small>{queue.length} visible</small></div><button onClick={addNewProject}>+ New</button></header>{queue.length ? queue.map(project => <button key={project.id} className={project.id === selectedId ? "selected" : ""} onClick={() => { setSelectedId(project.id); setGate(false); setNotice(""); }}><div className="queue-row-meta"><small>{project.id} · {WORKFLOW_STAGES.find(stage => stage.id === project.stage)?.label}</small><b className={attentionTone(project.attention)}>{project.attention}</b></div><strong>{project.title}</strong><span>{project.client || "Client required"}</span><em>{project.nextAction}</em><i style={{ width: `${project.progress}%` }} /></button>) : <div className="empty-queue"><strong>No records in this view</strong><span>{modeProjects.length ? "Choose another filter." : demoMode ? "No demonstration records are available." : "Open Pipeline, select an opportunity, and choose Start governed response."}</span></div>}</aside>
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
            <div className="approval-stack">
              <div className="gate-card"><div><p className="eyebrow">Current release gate</p><strong>{currentStage.gate}</strong><small>Evidence must be stored in an approved system of record.</small></div><label><input type="checkbox" checked={gate} onChange={event => setGate(event.target.checked)} /> I confirm this gate is satisfied</label></div>
              {selected.approvals.length > 0 && <div className="required-approvals"><header><span>Required approvals</span><b>{selected.completedApprovals.length}/{selected.approvals.length} complete</b></header>{selected.approvals.map(approval => <label key={approval}><input type="checkbox" checked={selected.completedApprovals.includes(approval)} onChange={() => toggleApproval(approval)} /><span>{approval}</span><small>Human approval</small></label>)}</div>}
            </div>
            <div className="editor-actions"><button className="quiet" onClick={togglePause}>{selected.status === "Paused" ? "Resume" : "Pause"}</button><button className="secondary" onClick={returnForRevision}>Return for revision</button><button className="secondary" onClick={syncNotion}>↗ Sync / link Notion</button>{selected.notionUrl && <a href={selected.notionUrl} target="_blank" rel="noreferrer">Open Notion</a>}<button className="primary" disabled={selected.status === "Closed"} onClick={advance}>{selected.status === "Closed" ? "Closeout complete" : stageActionLabel(selected.stage)} →</button></div>
          </div>
          <ActivityTimeline activities={selected.activities} />
        </div> : <div className="workflow-empty"><p className="eyebrow">Governed handoff queue</p><h3>No live work has been handed over.</h3><p>Select an opportunity in Pipeline and choose <b>Start governed response</b>. The selected record will arrive here with its source, confidence, approvals, and next action preserved.</p></div>}
      </div>
    </> : <ResponseStudio draft={draft} setDraft={setDraft} exportFile={exportFile} />}
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

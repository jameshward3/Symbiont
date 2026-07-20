"use client";

import { useState } from "react";
import { isActionOverdue, worstHealth, type DeliveryData } from "@/lib/delivery-control";

const DEMO_AS_OF = "2026-07-20T23:59:59.999Z";

export function DeliveryControl({ data }: { data: DeliveryData | null }) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  if (!data) return <section><DeliveryLead /><div className="delivery-loading">DELIVERY CONTROL DATA ADAPTER · CHECKING</div></section>;

  const isLive = data.source === "d1";
  const owners = [...new Set(data.projects.map((project) => project.projectManager))].sort();
  const visibleProjects = data.projects.filter((project) => (projectFilter === "all" || project.id === projectFilter) && (healthFilter === "all" || project.health === healthFilter) && (ownerFilter === "all" || project.projectManager === ownerFilter));
  const projectIds = new Set(visibleProjects.map((project) => project.id));
  const actions = data.actions.filter((action) => projectIds.has(action.projectId));
  const overdue = actions.filter((action) => isActionOverdue(action, isLive ? data.asOf : DEMO_AS_OF));
  const risks = data.risks.filter((risk) => projectIds.has(risk.projectId));
  const gates = data.gates.filter((gate) => projectIds.has(gate.projectId));
  const changes = data.changes.filter((change) => projectIds.has(change.projectId));
  const decisions = data.decisions.filter((decision) => projectIds.has(decision.projectId));
  const handoffs = data.handoffs.filter((handoff) => projectIds.has(handoff.projectId));
  const health = worstHealth(visibleProjects.map((project) => project.health));
  const onTime = visibleProjects.length ? Math.round(visibleProjects.reduce((sum, project) => sum + project.milestonePerformance, 0) / visibleProjects.length) : 0;

  return <section className="delivery-view">
    <DeliveryLead />
    <div className={`delivery-disclosure ${isLive ? "live" : "demo"}`}><div><span className={`dot ${isLive ? "green" : "amber"}`} /><b>{isLive ? "AUTHORIZED D1 RECORDS" : "DEMONSTRATION DATA"}</b></div><p>{data.activation}</p><span>AS OF {formatDateTime(data.asOf)}</span></div>
    <div className="delivery-filters" aria-label="Delivery filters">
      <label>Project<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All active projects</option>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.id} · {project.name}</option>)}</select></label>
      <label>Owner<select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">All owners</option>{owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}</select></label>
      <label>Health<select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value)}><option value="all">All health</option><option>Red</option><option>Amber</option><option>Green</option></select></label>
      <div className="filter-summary"><span>PORTFOLIO SIGNAL</span><b className={`health-text ${health.toLowerCase()}`}>{visibleProjects.length ? health : "—"}</b></div>
    </div>
    <div className="delivery-metrics">
      <DeliveryMetric label="Active projects" value={String(visibleProjects.length).padStart(2, "0")} note={`${visibleProjects.filter((project) => project.health !== "Green").length} require intervention`} />
      <DeliveryMetric label="On-time milestones" value={`${onTime}%`} note="Completed at baseline date" />
      <DeliveryMetric label="Overdue actions" value={String(overdue.length).padStart(2, "0")} note="Open beyond due date" tone={overdue.length ? "red" : "green"} />
      <DeliveryMetric label="Upcoming gates" value={String(gates.length).padStart(2, "0")} note="Milestone + quality gates" />
      <DeliveryMetric label="Open exceptions" value={String(risks.filter((risk) => risk.type === "Exception").length).padStart(2, "0")} note="Evidence-backed escalations" tone="red" />
      <DeliveryMetric label="Approval exposure" value={String(changes.filter((change) => change.approvalRequired).length + decisions.filter((decision) => decision.status !== "Approved").length).padStart(2, "0")} note="Changes + decisions" tone="amber" />
    </div>
    <div className="portfolio-panel">
      <PanelTitle kicker="Portfolio control" title="Active project health" suffix="Exceptions lead the view" />
      <div className="portfolio-head"><span>Project</span><span>Health</span><span>Milestones</span><span>Next gate</span><span>Forecast</span><span>Quality</span></div>
      {visibleProjects.map((project) => <article className="portfolio-row" key={project.id}><div><p>{project.id} · {project.phase}</p><strong>{project.name}</strong><small>{project.clientName} · {project.projectManager}</small></div><div><span className={`health-chip ${project.health.toLowerCase()}`}>{project.health}</span><small>{project.authorizationStatus}</small></div><div><strong>{project.milestonePerformance}%</strong><div className="micro-track"><i style={{ width: `${project.milestonePerformance}%` }} /></div><small>on time</small></div><div><strong>{project.nextMilestone}</strong><small>{formatDate(project.nextMilestoneDate)}</small></div><div><strong className={project.scheduleVariancePercent > 10 ? "danger-text" : ""}>{signed(project.scheduleVariancePercent)}% schedule</strong><small>{project.marginVariancePoints === null ? "Margin unknown" : `${signed(project.marginVariancePoints)} pts margin`}</small></div><div><strong>{project.qualityStatus}</strong><small>{project.closeoutReadiness}% closeout ready</small></div></article>)}
      {!visibleProjects.length && <Empty text="No projects match the selected filters." />}
    </div>
    <div className="delivery-grid">
      <div className="delivery-panel exception-panel"><PanelTitle kicker="Exceptions" title="Act before outcomes move" suffix={String(risks.length).padStart(2, "0")} />{risks.map((risk) => <article className="exception-row" key={risk.id}><div className={`severity-bar ${risk.severity.toLowerCase()}`} /><div><div className="row-meta"><span>{risk.id} · {risk.projectId}</span><b>{risk.type} · {risk.severity}</b></div><h4>{risk.statement}</h4><p><b>EVIDENCE</b> {risk.evidence}</p><div className="exception-action"><span>{risk.action}</span><small>{risk.owner} · {formatDate(risk.dueDate)}</small></div><details><summary>Impact, escalation + validation</summary><p>{risk.impact}</p><p>{risk.escalation}</p><p>{risk.validationCriteria}</p></details></div></article>)}{!risks.length && <Empty text="No open exception in this view." />}</div>
      <div className="delivery-panel"><PanelTitle kicker="Actions" title="Owners and dates" suffix={String(actions.length).padStart(2, "0")} />{actions.map((action) => { const late = isActionOverdue(action, isLive ? data.asOf : DEMO_AS_OF); return <article className="action-row" key={action.id}><div><span>{action.id} · {action.projectId}</span><b className={late ? "danger-text" : ""}>{late ? "OVERDUE" : action.status}</b></div><h4>{action.title}</h4><p>{action.owner}</p><small>{action.priority} · Due {formatDate(action.dueDate)}</small></article>})}{!actions.length && <Empty text="No open actions in this view." />}</div>
    </div>
    <div className="delivery-grid triple">
      <div className="delivery-panel"><PanelTitle kicker="Delivery gates" title="Upcoming approvals" suffix={String(gates.length).padStart(2, "0")} />{gates.map((gate) => <CompactRow key={gate.id} code={`${gate.id} · ${gate.projectId}`} title={gate.name} meta={`${gate.gateType} · ${gate.owner}`} status={`${formatDate(gate.dueDate)} · ${gate.status}`} />)}</div>
      <div className="delivery-panel"><PanelTitle kicker="Decisions + changes" title="Approval queue" suffix={String(decisions.length + changes.length).padStart(2, "0")} />{decisions.map((decision) => <CompactRow key={decision.id} code={`${decision.id} · ${decision.projectId}`} title={decision.statement} meta={decision.owner} status={`${formatDate(decision.requiredBy)} · ${decision.status}`} />)}{changes.map((change) => <CompactRow key={change.id} code={`${change.id} · ${change.projectId}`} title={change.title} meta={change.classification} status={change.status} />)}</div>
      <div className="delivery-panel handoff-panel"><PanelTitle kicker="Agent cooperation" title="Draft handoffs" suffix={String(handoffs.length).padStart(2, "0")} />{handoffs.map((handoff) => <article className="handoff-card" key={handoff.id}><div><span>{handoff.from}</span><i>→</i><span>{handoff.to}</span></div><p>{handoff.id} · {handoff.projectId} · {handoff.priority}</p><h4>{handoff.objective}</h4><small>{handoff.owner} · {formatDate(handoff.dueDate)}</small><b>{handoff.status}</b><details><summary>Control contract</summary><p>{handoff.correlationId}</p><p>{handoff.acceptanceCriteria}</p></details></article>)}{!handoffs.length && <Empty text="No project handoffs recorded." />}</div>
    </div>
    <div className="authority-strip"><div><span>AGT-003</span><strong>L1 · DRAFT AUTHORITY</strong></div><p>May prepare controls, records, reports, and handoffs. Human approval remains required for contractual, financial, client-facing, legal, safety, production, and irreversible actions.</p><b>NO SILENT COMMITMENTS</b></div>
  </section>;
}

function DeliveryLead() { return <div className="delivery-hero"><div><p className="eyebrow">AGT-003 · Delivery Control</p><h2>Protect the outcome.<br/><em>Control the evidence.</em></h2></div><p>Authorization, scope, milestones, actions, risks, quality, change, client decisions, agent handoffs, and closeout—coordinated across every active project.</p></div>; }
function DeliveryMetric({ label, value, note, tone = "neutral" }: { label: string; value: string; note: string; tone?: string }) { return <article><span>{label}</span><strong className={tone}>{value}</strong><p>{note}</p></article>; }
function PanelTitle({ kicker, title, suffix }: { kicker: string; title: string; suffix: string }) { return <div className="delivery-panel-title"><div><p>{kicker}</p><h3>{title}</h3></div><span>{suffix}</span></div>; }
function CompactRow({ code, title, meta, status }: { code: string; title: string; meta: string; status: string }) { return <article className="compact-row"><span>{code}</span><h4>{title}</h4><p>{meta}</p><b>{status}</b></article>; }
function Empty({ text }: { text: string }) { return <div className="delivery-empty">{text}</div>; }
function formatDate(value: string) { if (!value || value === "Unknown") return "Unknown"; const date = new Date(`${value}T12:00:00Z`); return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date) : value; }
function formatDateTime(value: string) { const date = new Date(value); return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date) : value; }
function signed(value: number) { return value > 0 ? `+${value}` : String(value); }

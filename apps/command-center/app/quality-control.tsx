"use client";

import { useState } from "react";
import { blockingFindings, type QualityData } from "@/lib/qaqc";

export function QualityControl({ data }: { data: QualityData | null }) {
  const [project, setProject] = useState("all");
  const [type, setType] = useState("all");
  const [reviewer, setReviewer] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [release, setRelease] = useState("all");
  if (!data) return <section className="quality-view"><QualityHero /><div className="quality-loading">QUALITY DATA ADAPTER · CHECKING</div></section>;

  const isLive = data.source === "d1";
  const projects = unique(data.reviews.map((item) => item.projectId));
  const types = unique(data.reviews.map((item) => item.deliverableType));
  const reviewers = unique(data.reviews.map((item) => item.reviewer));
  const reviews = data.reviews.filter((item) => (project === "all" || item.projectId === project) && (type === "all" || item.deliverableType === type) && (reviewer === "all" || item.reviewer === reviewer) && (release === "all" || item.recommendation === release));
  const reviewIds = new Set(reviews.map((item) => item.deliverableId));
  const findings = data.findings.filter((item) => reviewIds.has(item.deliverableId) && (severity === "all" || item.severity === severity) && (status === "all" || item.status === status));
  const blockers = blockingFindings(findings);
  const overdue = findings.filter((item) => !["Closed", "Verified", "Duplicate", "Not Reproducible"].includes(item.status) && item.dueDate < data.asOf.slice(0, 10));
  const activeGates = data.gates.filter((gate) => reviewIds.has(gate.deliverableId));

  return <section className="quality-view">
    <QualityHero />
    <div className={`quality-disclosure ${isLive ? "live" : "demo"}`}><div><span className={`dot ${isLive ? "green" : "amber"}`} /><b>{isLive ? "AUTHORIZED D1 QUALITY RECORDS" : "DEMONSTRATION DATA"}</b></div><p>{data.activation}</p><span>AS OF {dateTime(data.asOf)}</span></div>
    <div className="quality-filters" aria-label="Quality filters">
      <Filter label="Project" value={project} set={setProject} values={projects} all="All projects" />
      <Filter label="Deliverable type" value={type} set={setType} values={types} all="All types" />
      <Filter label="Reviewer" value={reviewer} set={setReviewer} values={reviewers} all="All reviewers" />
      <Filter label="Severity" value={severity} set={setSeverity} values={["Critical", "Major", "Minor", "Suggestion"]} all="All severities" />
      <Filter label="Finding status" value={status} set={setStatus} values={["Open", "Assigned", "In Correction", "Ready for Verification", "Verified", "Closed", "Reopened", "Accepted Exception", "Deferred"]} all="All states" />
      <Filter label="Release" value={release} set={setRelease} values={["Ready for approval", "Conditionally ready", "Rework required", "Blocked"]} all="All gates" />
    </div>
    <div className="quality-metrics">
      <QualityMetric label="Awaiting review" value={String(reviews.filter((item) => ["Author QA", "Planned"].includes(item.status)).length).padStart(2, "0")} note="Candidate queue" />
      <QualityMetric label="Critical open" value={String(findings.filter((item) => item.severity === "Critical" && item.status !== "Closed").length).padStart(2, "0")} note="Blocks client issue" tone="red" />
      <QualityMetric label="Major open" value={String(findings.filter((item) => item.severity === "Major" && item.status !== "Closed").length).padStart(2, "0")} note="Independent closure" tone="red" />
      <QualityMetric label="Overdue actions" value={String(overdue.length).padStart(2, "0")} note="Past due, unresolved" tone={overdue.length ? "amber" : "green"} />
      <QualityMetric label="First-pass yield" value={`${data.metrics.firstPassYield}%`} note="Demonstration baseline" />
      <QualityMetric label="Checklist coverage" value={`${data.metrics.checklistCompletion}%`} note="Completed review items" />
      <QualityMetric label="Review cycle" value={`${data.metrics.averageReviewHours}h`} note="Average duration" />
      <QualityMetric label="Escaped defects" value={String(data.metrics.escapedDefects).padStart(2, "0")} note="Post-issue reports" tone="green" />
    </div>

    <div className="quality-grid review-grid">
      <div className="quality-panel">
        <PanelTitle kicker="Review control" title="Frozen candidates" suffix={`${reviews.length} exact versions`} />
        <div className="quality-review-head"><span>Deliverable</span><span>Candidate</span><span>Independent review</span><span>Gate</span></div>
        {reviews.map((review) => <article className="quality-review-row" key={review.id}>
          <div><p>{review.id} · {review.projectId}</p><h4>{review.deliverableName}</h4><small>{review.client} · {review.deliverableType}</small></div>
          <div><b>{review.version}</b><small>{review.candidateHash}</small><small>{review.checklist} · {review.checklistVersion}</small></div>
          <div><b>{review.reviewer}</b><small>Author · {review.author}</small><div className="coverage"><i style={{ width: `${review.coverage}%` }} /></div><small>{review.coverage}% checklist coverage</small></div>
          <div><span className={`release-chip ${slug(review.recommendation)}`}>{review.recommendation}</span><small>{review.status} · due {date(review.dueDate)}</small></div>
        </article>)}
        {!reviews.length && <Empty text="No review candidates match these filters." />}
      </div>
      <aside className="quality-panel release-panel"><PanelTitle kicker="Release gate" title="Issue control" suffix={`${blockers.length} blockers`} />{activeGates.map((gate) => <article className="gate-card" key={gate.id}><div><span>{gate.id}</span><b className={slug(gate.recommendation)}>{gate.recommendation}</b></div><h4>{gate.deliverableId} · {gate.version}</h4><p>{gate.projectId}</p><dl><div><dt>Checklist</dt><dd>{gate.checklistComplete ? "Complete" : "Incomplete"}</dd></div><div><dt>Approvals</dt><dd>{gate.approvalsRecorded ? "Recorded" : "Missing"}</dd></div><div><dt>Blocking findings</dt><dd>{gate.blockingFindings}</dd></div></dl></article>)}</aside>
    </div>

    <div className="quality-grid finding-grid">
      <div className="quality-panel"><PanelTitle kicker="Defect register" title="Evidence-backed findings" suffix={`${findings.length} visible`} />{findings.map((finding) => <article className="finding-row" key={finding.id}><div className={`finding-severity ${finding.severity.toLowerCase()}`}>{finding.severity}<small>{finding.status}</small></div><div><div className="finding-meta"><span>{finding.id} · {finding.projectId} · {finding.deliverableId} · {finding.version}</span><b>{finding.requirement}</b></div><h4>{finding.description}</h4><p><b>LOCATION</b> {finding.location}</p><p><b>EVIDENCE</b> {finding.evidence}</p><div className="finding-action"><span>{finding.correction}</span><small>{finding.owner} · {date(finding.dueDate)}</small></div><details><summary>Impact + independence</summary><p>{finding.impact}</p><p>Reviewer: {finding.reviewer} · Author: {finding.author}</p></details></div></article>)}{!findings.length && <Empty text="No findings match the selected severity and status." />}</div>
      <div className="quality-panel"><PanelTitle kicker="Verification trail" title="Recent evidence" suffix={String(data.events.length).padStart(2, "0")} />{data.events.map((event) => <article className="verification-row" key={event.id}><span>{event.id} · {event.findingId}</span><h4>{event.action}</h4><p>{event.evidence}</p><small>{event.actor} · {dateTime(event.occurredAt)}</small></article>)}</div>
    </div>

    <div className="quality-handoff"><div><span>AGT-003</span><b>DELIVERY CONTROL</b></div><i>→</i><div><span>AGT-004</span><b>INDEPENDENT QA/QC</b></div><i>↗</i><div><span>AGT-001</span><b>RISK + RELEASE ESCALATION</b></div><p>{data.handoffs[0]?.correlationId ?? "No live handoff"}</p></div>
    <div className="authority-strip"><div><span>AGT-004</span><strong>L1 · DRAFT AUTHORITY</strong></div><p>May review, test, classify findings, verify corrections, and recommend release. It cannot approve its own work, waive requirements, self-close Critical or Major findings, or issue deliverables.</p><b>HUMAN ISSUE APPROVAL</b></div>
  </section>;
}

function QualityHero() { return <div className="quality-hero"><div><p className="eyebrow">AGT-004 · Quality Assurance / Quality Control</p><h2>Nothing leaves<br/><em>without evidence.</em></h2></div><p>Independent, requirement-led review of exact deliverable versions—linking every finding, correction, verification event, and release recommendation to its governing evidence.</p></div>; }
function Filter({ label, value, set, values, all }: { label: string; value: string; set: (value: string) => void; values: string[]; all: string }) { return <label>{label}<select value={value} onChange={(event) => set(event.target.value)}><option value="all">{all}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>; }
function QualityMetric({ label, value, note, tone = "neutral" }: { label: string; value: string; note: string; tone?: string }) { return <article><span>{label}</span><strong className={tone}>{value}</strong><p>{note}</p></article>; }
function PanelTitle({ kicker, title, suffix }: { kicker: string; title: string; suffix: string }) { return <div className="quality-panel-title"><div><p>{kicker}</p><h3>{title}</h3></div><span>{suffix}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="quality-empty">{text}</div>; }
function unique(values: string[]) { return [...new Set(values)].sort(); }
function slug(value: string) { return value.toLowerCase().replaceAll(" ", "-"); }
function date(value: string) { const parsed = new Date(`${value}T12:00:00Z`); return Number.isFinite(parsed.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(parsed) : value; }
function dateTime(value: string) { const parsed = new Date(value); return Number.isFinite(parsed.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(parsed) : value; }

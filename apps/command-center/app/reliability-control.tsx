"use client";

import { RELEASE_CONTROLS, type ReliabilityData } from "@/lib/reliability";

export function ReliabilityControl({ data }: { data: ReliabilityData | null }) {
  if (!data) return <section className="reliability-view"><Hero /><div className="reliability-loading">RELIABILITY EVIDENCE ADAPTER · CHECKING</div></section>;
  const isLive = data.source === "d1";
  const activeIncidents = data.incidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status));
  const missingOwners = data.automations.filter((automation) => !automation.owner).length;
  const staleHeartbeats = data.automations.filter((automation) => automation.state === "Failing" && automation.heartbeatDueAt).length;
  const missingControls = data.automations.filter((automation) => automation.controlsPresent.length < RELEASE_CONTROLS.length);
  const recovery = activeIncidents.filter((incident) => ["Contained", "Recovering", "Monitoring"].includes(incident.status)).length;
  const severityCount = (severity: string) => activeIncidents.filter((incident) => incident.severity === severity).length;

  return <section className="reliability-view">
    <Hero />
    <div className={`reliability-disclosure ${isLive ? "live" : "demo"}`}><div><i className={`dot ${isLive ? "green" : "amber"}`} /><b>{isLive ? "AUTHENTICATED D1 EVIDENCE" : "DEMONSTRATION DATA"}</b></div><p>{data.activation}</p><span>AS OF {dateTime(data.asOf)}</span></div>
    <div className="reliability-metrics">
      <Metric label="Monitored" value={String(data.automations.length).padStart(2,"0")} note="Registered workflows" />
      <Metric label="Active incidents" value={String(activeIncidents.length).padStart(2,"0")} note={`${severityCount("SEV-1")} critical · ${severityCount("SEV-2")} high`} tone={activeIncidents.length ? "red" : "green"} />
      <Metric label="Success rate" value={pct(data.metrics.successRate)} note="Measured outcomes only" />
      <Metric label="Retry rate" value={pct(rate(data.automations, "retryRate"))} note="Bounded attempts" />
      <Metric label="Duplicate rate" value={pct(rate(data.automations, "duplicateRate"))} note="Prevented effects tracked" tone="green" />
      <Metric label="Queue depth" value={String(data.automations.reduce((sum, item) => sum + (item.queueDepth ?? 0), 0))} note="Across visible workflows" />
      <Metric label="Stale heartbeat" value={String(staleHeartbeats).padStart(2,"0")} note="Incident signal" tone={staleHeartbeats ? "red" : "green"} />
      <Metric label="Recovery" value={`${recovery}/${activeIncidents.length || 0}`} note="Contained or restoring" />
    </div>

    <div className="reliability-grid primary">
      <div className="reliability-panel"><PanelTitle kicker="Automation register" title="Evidence before health" suffix={`${data.automations.length} workflows`} />
        <div className="automation-head"><span>Workflow</span><span>Health</span><span>Run evidence</span><span>Release gate</span></div>
        {data.automations.map((automation) => { const gaps = RELEASE_CONTROLS.filter((control) => !automation.controlsPresent.includes(control)); return <article className="automation-row" key={automation.id}>
          <div><p>{automation.id} · {automation.connectedAgent}</p><h4>{automation.name}</h4><small>Owner · {automation.owner ?? "MISSING"} · {automation.sharedGoalId}</small></div>
          <div><span className={`health-chip ${automation.state.toLowerCase()}`}>{automation.state}</span><small>{automation.dependencies}</small><small>{automation.dataQuality}</small></div>
          <div><b>{automation.lastSuccessfulRun ? dateTime(automation.lastSuccessfulRun) : "No success evidence"}</b><small>Attempt · {automation.lastAttemptedRun ? dateTime(automation.lastAttemptedRun) : "None"}</small><small>Queue · {automation.queueDepth ?? "Unknown"}</small></div>
          <div><span className={`release-state ${automation.releaseStatus.toLowerCase().replaceAll(" ","-")}`}>{automation.releaseStatus}</span><small>{gaps.length ? `${gaps.length} controls missing` : "25/25 controls present"}</small><small>Rollback {automation.rollbackReady ? "ready" : "missing"} · Kill switch {automation.killSwitchReady ? "ready" : "missing"}</small></div>
        </article>; })}
      </div>
      <aside className="reliability-panel severity-panel"><PanelTitle kicker="Incident load" title="Severity" suffix="No downgrades without evidence" />
        {["SEV-1","SEV-2","SEV-3","SEV-4"].map((severity) => <div className="severity-row" key={severity}><b className={severity.toLowerCase()}>{severity}</b><span>{String(severityCount(severity)).padStart(2,"0")}</span><small>{severity === "SEV-1" ? "Safety · security · financial · major client" : severity === "SEV-2" ? "Material operational or widespread" : severity === "SEV-3" ? "Limited impact with workaround" : "Minor or planned remediation"}</small></div>)}
      </aside>
    </div>

    <div className="reliability-grid secondary">
      <div className="reliability-panel"><PanelTitle kicker="Incident response" title="Contain → recover → verify" suffix={`${activeIncidents.length} active`} />{activeIncidents.map((incident) => <article className="incident-row" key={incident.id}>
        <div><span className={`incident-severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span><b>{incident.status}</b></div><div><p>{incident.id} · {incident.automationId} · {incident.runId}</p><h4>{incident.businessImpact}</h4><small>{incident.evidence}</small><dl><div><dt>Containment</dt><dd>{incident.containmentStatus}</dd></div><div><dt>Affected</dt><dd>{incident.affectedRecords}</dd></div><div><dt>Owner / target</dt><dd>{incident.owner} · {dateTime(incident.recoveryTarget)}</dd></div><div><dt>Decision</dt><dd>{incident.decisionRequired}</dd></div></dl><p className="correlation">{incident.sharedGoalId} · {incident.correlationId}</p></div>
      </article>)}</div>
      <div className="reliability-panel"><PanelTitle kicker="Recent execution" title="Run evidence" suffix={`${data.runs.length} visible`} />{data.runs.map((run) => <article className="run-row" key={run.id}><div><b>{run.id}</b><span className={`run-state ${run.state.toLowerCase()}`}>{run.state}</span></div><h4>{run.automationId}</h4><p>{run.successCount} success · {run.failureCount} failed · {run.retryCount} retries · {run.duplicateCount} duplicates</p><small>{run.recordsProcessed} records · {(run.durationMs/1000).toFixed(1)}s · {run.correlationId}</small></article>)}</div>
    </div>

    <div className="reliability-grid tertiary">
      <div className="reliability-panel"><PanelTitle kicker="Release readiness" title="Control exceptions" suffix={`${missingControls.length} not ready`} />
        <div className="exception-grid"><Exception label="Missing owners" value={missingOwners} /><Exception label="Missing controls" value={missingControls.length} /><Exception label="Data-quality failures" value={data.metrics.dataQualityFailures} /><Exception label="Corrective actions" value={data.metrics.unresolvedCorrectiveActions} /><Exception label="Cost / rate warnings" value={data.automations.filter((a)=>a.costWarning).length} /><Exception label="Stale reviews" value={data.automations.filter((a)=>a.releaseStatus!=="Production Ready").length} /></div>
      </div>
      <div className="reliability-panel action-panel"><PanelTitle kicker="L2 action boundary" title="Operational controls" suffix="Authenticated adapter required" /><p>Buttons remain intentionally unavailable in demonstration and read-only modes. No action is represented as completed.</p><div className="action-grid">{["Acknowledge alert","Assign incident","Pause workflow","Retry eligible run","Activate kill switch","Request rollback","Close incident"].map((action)=><button key={action} type="button" disabled title="Requires authenticated authorization, confirmation, and audit evidence">{action}</button>)}</div><small>Production deployment, irreversible rollback, external communication, spending, permission changes, destructive actions, and material risk acceptance always require human approval.</small></div>
    </div>

    <div className="agent-reliability"><span>AGT-001</span>{["AGT-002","AGT-003","AGT-004","AGT-005","AGT-006","AGT-007","AGT-009"].map((agent)=><b key={agent}>{agent}<i>{data.automations.filter((a)=>a.connectedAgent===agent).length} monitored</i></b>)}</div>
    <div className="authority-strip"><div><span>AGT-008</span><strong>L2 · REVERSIBLE INTERNAL RELIABILITY</strong></div><p>May inspect, record, contain, pause, quarantine, and retry only approved idempotent work within limits. It cannot hide evidence, expand authority, perform unsafe duplicate actions, deploy unapproved code, or accept material risk.</p><b>HUMAN APPROVAL GATES ENFORCED</b></div>
  </section>;
}

function Hero(){return <div className="reliability-hero"><div><p className="eyebrow">AGT-008 · Automation Reliability</p><h2>Contain failure.<br/><em>Preserve the truth.</em></h2></div><p>Repository-scoped reliability control for automations, scheduled work, pipelines, integrations, and agent workflows—built around current evidence, bounded retries, duplicate prevention, and verified recovery.</p></div>}
function Metric({label,value,note,tone="neutral"}:{label:string;value:string;note:string;tone?:string}){return <article><span>{label}</span><strong className={tone}>{value}</strong><p>{note}</p></article>}
function PanelTitle({kicker,title,suffix}:{kicker:string;title:string;suffix:string}){return <div className="reliability-panel-title"><div><p>{kicker}</p><h3>{title}</h3></div><span>{suffix}</span></div>}
function Exception({label,value}:{label:string;value:number}){return <article><span>{label}</span><strong>{String(value).padStart(2,"0")}</strong></article>}
function pct(value:number|null){return value===null?"—":`${value.toFixed(1)}%`}
function rate(items:ReliabilityData["automations"],key:"retryRate"|"duplicateRate"){const values=items.map((item)=>item[key]).filter((value):value is number=>value!==null);return values.length?values.reduce((a,b)=>a+b,0)/values.length:null}
function dateTime(value:string){const parsed=new Date(value);return Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"}).format(parsed):value}

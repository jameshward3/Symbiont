"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View = "Overview" | "Agent Network" | "Shared Goals" | "Sales Operations" | "Projects" | "Decisions" | "Systems";
type Connection = "checking" | "unavailable" | "authorization_required" | "connected" | "error";
type Agent = { stable_id: string; name: string; mission: string; authority_level: string; status: string; updated_at?: string };
type Goal = { stable_id: string; objective: string; status: string; priority: string; due_date?: string; success_metrics?: string[]; completion_evidence?: unknown };
type Opportunity = { stable_id: string; name: string; stage: string; qualification_score?: number; recommendation?: string; amount?: number; currency?: string; probability?: number; expected_close?: string; next_action?: string; next_action_date?: string; proposal_status?: string; recurring_potential?: string; required_approvals?: string[] };
type Dashboard = { source: "live"; asOf: string; agents: Agent[]; goals: Goal[]; opportunities: Opportunity[]; decisions: Array<Record<string, string>>; runs: Array<Record<string, unknown>>; handoffs: Array<Record<string, unknown>> };

const navItems: { label: View; code: string }[] = [
  { label: "Overview", code: "01" }, { label: "Agent Network", code: "02" }, { label: "Shared Goals", code: "03" },
  { label: "Sales Operations", code: "04" }, { label: "Projects", code: "05" }, { label: "Decisions", code: "06" }, { label: "Systems", code: "07" },
];

const demoAgents: Agent[] = [
  { stable_id: "AGT-001", name: "Symbiont COO", mission: "Coordinate company operations, priorities, standards, and agent work.", authority_level: "L2", status: "Ready" },
  { stable_id: "AGT-002", name: "Sales Operations", mission: "Convert qualified client needs into profitable, repeatable work.", authority_level: "L1", status: "Draft mode" },
];
const demoGoals: Goal[] = [{ stable_id: "GOAL-2026-001", objective: "Prove governed multi-agent sales-to-delivery coordination", status: "Approved", priority: "P1", success_metrics: ["One claim owner", "Human proposal approval", "Auditable handoff"] }];
const demoOpps: Opportunity[] = [
  { stable_id: "OPP-2026-001", name: "Portfolio intelligence foundation", stage: "Discovery", qualification_score: 78, recommendation: "Pursue", amount: 240000, currency: "USD", probability: 45, expected_close: "2026-09-18", next_action: "Confirm decision criteria", next_action_date: "2026-07-22", proposal_status: "Not started", recurring_potential: "High", required_approvals: [] },
  { stable_id: "OPP-2026-002", name: "Reality-capture program", stage: "Proposal", qualification_score: 64, recommendation: "Nurture", amount: 165000, currency: "USD", probability: 55, expected_close: "2026-08-28", next_action: "Resolve access assumptions", next_action_date: "2026-07-18", proposal_status: "Human review", recurring_potential: "Medium", required_approvals: ["Pricing", "External proposal"] },
  { stable_id: "OPP-2026-003", name: "Building data operations", stage: "Solution", qualification_score: 84, recommendation: "Pursue", amount: 312000, currency: "USD", probability: 60, expected_close: "2026-10-02", next_action: "Validate support cadence", next_action_date: "2026-07-25", proposal_status: "Draft", recurring_potential: "High", required_approvals: ["Scope"] },
];

export default function Home() {
  const [view, setView] = useState<View>("Overview");
  const [connection, setConnection] = useState<Connection>("checking");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [agentId, setAgentId] = useState("AGT-002");
  const [command, setCommand] = useState("");
  const [runState, setRunState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [answer, setAnswer] = useState("");

  useEffect(() => { fetch("/api/status", { cache: "no-store" }).then(r => r.json()).then(s => setConnection(s.dataPlane)).catch(() => setConnection("error")); }, []);

  async function connect(event: FormEvent) {
    event.preventDefault(); setConnection("checking");
    const response = await fetch("/api/dashboard", { headers: { "x-symbiont-access-key": accessKey }, cache: "no-store" });
    if (response.status === 401) { setConnection("authorization_required"); return; }
    if (!response.ok) { setConnection(response.status === 503 ? "unavailable" : "error"); return; }
    setDashboard(await response.json()); setConnection("connected");
  }

  async function runAgentCommand(event: FormEvent) {
    event.preventDefault(); if (!command.trim() || connection !== "connected") return;
    setRunState("running"); setAnswer("");
    const response = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json", "x-symbiont-access-key": accessKey }, body: JSON.stringify({ agentId, command }) });
    const result = await response.json();
    if (!response.ok) { setAnswer(result.error || "Agent run failed safely."); setRunState("error"); return; }
    setAnswer(result.text); setRunState("complete");
  }

  const agents = dashboard?.agents ?? demoAgents;
  const goals = dashboard?.goals ?? demoGoals;
  const opportunities = dashboard?.opportunities ?? demoOpps;
  const weighted = opportunities.reduce((sum, item) => sum + Number(item.amount || 0) * Number(item.probability || 0) / 100, 0);
  const stale = opportunities.filter(item => item.next_action_date && new Date(item.next_action_date) < new Date("2026-07-20T00:00:00")).length;
  const sourceLabel = connection === "connected" ? "Live governed data" : "Demonstration data";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><div><strong>SYMBIONT</strong><span>OPERATING SYSTEM</span></div></div>
        <nav aria-label="Primary navigation"><p className="eyebrow nav-label">Command views</p>{navItems.map(item => <button className={`nav-item ${view === item.label ? "active" : ""}`} key={item.label} onClick={() => setView(item.label)} type="button"><span className="nav-code">{item.code}</span><span>{item.label}</span></button>)}</nav>
        <div className="side-divider" />
        <div className="system-state"><p className="eyebrow">Runtime state</p><StateRow label="Shared data" state={connection === "connected" ? "Live" : connection === "checking" ? "Checking" : "Restricted"} tone={connection === "connected" ? "green" : "amber"} /><StateRow label="Agent authority" state="Governed" tone="green" /><StateRow label="External actions" state="Approval" tone="amber" /></div>
        <div className="agent-card"><div className="agent-orbit"><span>002</span></div><div><p>SALES OPERATIONS</p><strong>L1 · Draft + Recommend</strong></div><i className="pulse" /></div>
      </aside>
      <main>
        <header className="topbar"><div><p className="eyebrow">Executive command center</p><h1>{view}</h1></div><div className="top-actions"><span className={`demo-pill ${connection === "connected" ? "live-pill" : ""}`}>{sourceLabel}</span><div className="avatar">JW</div></div></header>
        <div className="view-wrap">
          <ConnectionBanner connection={connection} connect={connect} accessKey={accessKey} setAccessKey={setAccessKey} />
          {view === "Overview" && <Overview agents={agents} goals={goals} opportunities={opportunities} weighted={weighted} stale={stale} source={sourceLabel} />}
          {view === "Agent Network" && <AgentNetwork agents={agents} source={sourceLabel} />}
          {view === "Shared Goals" && <SharedGoals goals={goals} agents={agents} source={sourceLabel} />}
          {view === "Sales Operations" && <SalesOperations opportunities={opportunities} source={sourceLabel} />}
          {view === "Projects" && <UnavailableView title="Delivery projects" body="Project delivery remains under AGT-001. Connect an authorized project system before operational records are shown here." />}
          {view === "Decisions" && <DecisionsView decisions={dashboard?.decisions ?? []} source={sourceLabel} />}
          {view === "Systems" && <SystemsView connection={connection} runs={dashboard?.runs ?? []} handoffs={dashboard?.handoffs ?? []} />}
          <CommandPanel agentId={agentId} setAgentId={setAgentId} command={command} setCommand={setCommand} submit={runAgentCommand} connection={connection} runState={runState} answer={answer} />
        </div>
      </main>
    </div>
  );
}

function ConnectionBanner({ connection, connect, accessKey, setAccessKey }: { connection: Connection; connect: (e: FormEvent) => void; accessKey: string; setAccessKey: (v: string) => void }) {
  if (connection === "connected") return <div className="connection-banner connected"><span><i className="dot green" />Connected to the governed shared data plane</span><b>LIVE</b></div>;
  const copy = connection === "unavailable" ? "The shared Supabase data plane is not configured. Live CRM and agent actions are disabled." : connection === "error" ? "The shared data plane could not be reached safely." : connection === "checking" ? "Checking the governed data plane…" : "A secure session is required before live company data can be read.";
  return <div className="connection-banner"><span><i className="dot amber" />{copy}</span>{connection === "authorization_required" ? <form onSubmit={connect}><label htmlFor="access-key">Secure access key</label><input id="access-key" type="password" autoComplete="current-password" value={accessKey} onChange={e => setAccessKey(e.target.value)} /><button type="submit">Connect</button></form> : <b>{connection.toUpperCase().replace("_", " ")}</b>}</div>;
}

function Overview({ agents, goals, opportunities, weighted, stale, source }: { agents: Agent[]; goals: Goal[]; opportunities: Opportunity[]; weighted: number; stale: number; source: string }) {
  const date = useMemo(() => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()), []);
  return <><section className="brief-intro"><div><p className="date-line">{date} · {source}</p><h2>Two agents. One governed<br/><em>operating truth.</em></h2></div><div className="brief-score"><span>AGENT READINESS</span><strong>{agents.length === 2 ? "82" : "—"}</strong><small>/100</small><div className="score-track"><i style={{width: agents.length === 2 ? "82%" : "0"}} /></div><p>Production gate: shared data + model</p></div></section><section className="metric-grid"><Metric label="Registered agents" value={String(agents.length).padStart(2,"0")} note="AGT-001 + AGT-002" /><Metric label="Shared goals" value={String(goals.length).padStart(2,"0")} note="One accountable owner" /><Metric label="Weighted pipeline" value={money(weighted)} note={`${opportunities.length} opportunities`} /><Metric label="Stale actions" value={String(stale).padStart(2,"0")} note={stale ? "Requires sales review" : "Within date"} tone={stale ? "warning" : "positive"} /></section><section className="dashboard-grid"><div className="panel"><PanelTitle kicker="Agent network" title="Cooperative capacity" />{agents.map(a => <div className="network-row" key={a.stable_id}><span>{a.stable_id}</span><div><strong>{a.name}</strong><p>{a.mission}</p></div><b>{a.authority_level}</b><i>{a.status}</i></div>)}</div><div className="panel attention-panel"><PanelTitle kicker="Governance" title="Human approval remains the gate" /><div className="focus-list"><Focus n="01" text="External client communications" /><Focus n="02" text="Pricing, proposals, scope + terms" /><Focus n="03" text="Material decisions + commitments" /></div></div><div className="panel"><PanelTitle kicker="Shared goal" title={goals[0]?.stable_id || "No active goal"} /><h3 className="feature-title">{goals[0]?.objective || "Create an approved governed goal."}</h3><div className="goal-meta"><span>OWNER <b>AGT-001</b></span><span>CONTRIBUTOR <b>AGT-002</b></span><span>STATUS <b>{goals[0]?.status || "Unavailable"}</b></span></div></div><div className="panel acid-panel"><p className="eyebrow">Sales operations signal</p><h3>{stale ? `${stale} opportunity needs a dated next action.` : "Pipeline actions are current."}</h3><p>AGT-002 can qualify, draft, and hand off. A human approves every external or commercial commitment.</p></div></section></>;
}

function AgentNetwork({ agents, source }: { agents: Agent[]; source: string }) { return <section><SectionLead kicker="Cooperative intelligence" title="Agents with explicit authority." body={`${source}. New agents register against the same shared model—no agent-specific schema required.`} /><div className="agent-grid">{agents.map((a,i) => <article className="agent-profile" key={a.stable_id}><span className="large-code">0{i+1}</span><p className="eyebrow">{a.stable_id}</p><h3>{a.name}</h3><p>{a.mission}</p><dl><div><dt>Authority</dt><dd>{a.authority_level}</dd></div><div><dt>Parent</dt><dd>{a.stable_id === "AGT-002" ? "AGT-001" : "Founder"}</dd></div><div><dt>Status</dt><dd>{a.status}</dd></div><div><dt>Human owner</dt><dd>Authorized executive</dd></div><div><dt>Current goal</dt><dd>GOAL-2026-001</dd></div><div><dt>Open blockers</dt><dd>{source.startsWith("Live") ? "From live data" : "Unavailable"}</dd></div></dl></article>)}</div></section>; }

function SharedGoals({ goals, agents, source }: { goals: Goal[]; agents: Agent[]; source: string }) { return <section><SectionLead kicker="Shared outcomes" title="One owner. Many contributors." body={`${source}. Goals preserve success measures, dependencies, decisions, work evidence, and append-only events.`} />{goals.map(g => <article className="goal-card" key={g.stable_id}><div><p className="eyebrow">{g.stable_id} · {g.priority}</p><h3>{g.objective}</h3><span className="status-chip">{g.status}</span></div><div className="goal-members"><p>ACCOUNTABLE OWNER</p><strong>{agents[0]?.stable_id} · {agents[0]?.name}</strong><p>CONTRIBUTOR</p><strong>{agents[1]?.stable_id} · {agents[1]?.name}</strong></div><div><p className="eyebrow">Success evidence</p><ul>{(g.success_metrics || []).map(m => <li key={m}>{m}</li>)}</ul><p className="empty-note">Recent events and work-item evidence appear when the live data plane is connected.</p></div></article>)}</section>; }

function SalesOperations({ opportunities, source }: { opportunities: Opportunity[]; source: string }) { return <section><SectionLead kicker="AGT-002 · Sales operations" title="Qualified work, clean handoffs." body={`${source}. Values shown below are ${source.startsWith("Live") ? "authorized operational records" : "harmless demonstration records"}.`} /><div className="sales-table"><div className="sales-head"><span>Opportunity</span><span>Qualification</span><span>Commercial</span><span>Next action</span><span>Governance</span></div>{opportunities.map(o => { const weighted = Number(o.amount||0)*Number(o.probability||0)/100; const stale = Boolean(o.next_action_date && new Date(o.next_action_date)<new Date("2026-07-20")); return <article className="sales-row" key={o.stable_id}><div><p>{o.stable_id} · {o.stage}</p><strong>{o.name}</strong><small>{o.recommendation || "Not scored"}</small></div><div><b className="score-badge">{o.qualification_score ?? "—"}</b><small>/100</small></div><div><strong>{money(Number(o.amount||0))}</strong><p>{o.probability || 0}% · {money(weighted)} weighted</p><small>Close {o.expected_close || "Unknown"}</small></div><div><strong>{o.next_action || "Missing"}</strong><p className={stale ? "danger-text" : ""}>{o.next_action_date || "No date"}{stale ? " · STALE" : ""}</p></div><div><span className="status-chip">{o.proposal_status}</span><p>Recurring: {o.recurring_potential}</p><small>{o.required_approvals?.length ? `${o.required_approvals.length} approval(s)` : "No open approval"}</small></div></article>})}</div></section>; }

function DecisionsView({ decisions, source }: { decisions: Array<Record<string,string>>; source: string }) { return <section><SectionLead kicker="Decision architecture" title="Agents recommend. Humans approve." body={`${source}. Material decisions cannot reach Approved without an authorized human and timestamp.`} />{decisions.length ? decisions.map(d => <article className="decision-row-wide" key={d.stable_id}><span>{d.stable_id}</span><strong>{d.statement}</strong><b>{d.status}</b><small>{d.required_by || "No deadline"}</small></article>) : <UnavailableView title="No live decisions available" body="The system will show decision requests here after the governed database is connected. No approval has been simulated." />}</section>; }
function SystemsView({ connection, runs, handoffs }: { connection: Connection; runs: Array<Record<string,unknown>>; handoffs: Array<Record<string,unknown>> }) { return <section><SectionLead kicker="System controls" title="Authority enforced below the prompt." body="Application checks, database policies, atomic claims, leases, idempotency, audit events, and human approval gates govern execution." /><div className="control-grid"><Control name="Organization-scoped RLS" status="Implemented" /><Control name="Atomic claim + lease recovery" status="Implemented" /><Control name="Append-only goal events" status="Implemented" /><Control name="Human material-decision approval" status="Implemented" /><Control name="Shared Supabase runtime" status={connection === "connected" ? "Connected" : "Not configured"} /><Control name="OpenAI Responses runtime" status={connection === "connected" ? "Connection-dependent" : "Unavailable"} /><Control name="Recorded agent runs" status={String(runs.length)} /><Control name="Inter-agent handoffs" status={String(handoffs.length)} /></div></section>; }
function UnavailableView({ title, body }: { title: string; body: string }) { return <section className="empty-state"><span>UNAVAILABLE</span><h2>{title}</h2><p>{body}</p></section>; }

function CommandPanel({ agentId, setAgentId, command, setCommand, submit, connection, runState, answer }: { agentId:string; setAgentId:(v:string)=>void; command:string; setCommand:(v:string)=>void; submit:(e:FormEvent)=>void; connection:Connection; runState:string; answer:string }) { return <section className="command-panel"><div><p className="eyebrow">Agent command panel</p><h2>Ask the network.</h2><p>Commands run through the real server runtime. Unavailable services return an explicit error; the interface never fabricates an agent response.</p></div><form onSubmit={submit}><label htmlFor="agent-select">Agent</label><select id="agent-select" value={agentId} onChange={e=>setAgentId(e.target.value)}><option value="AGT-001">AGT-001 · COO</option><option value="AGT-002">AGT-002 · Sales Operations</option></select><label htmlFor="command">Command</label><textarea id="command" value={command} onChange={e=>setCommand(e.target.value)} placeholder="Request a discovery brief, qualification analysis, proposal draft, or shared-goal review…"/><button type="submit" disabled={connection!=="connected"||runState==="running"}>{runState==="running"?"Running…":connection==="connected"?"Run governed analysis":"Runtime unavailable"}</button></form>{answer && <div className={`runtime-answer ${runState}`}><b>{runState === "error" ? "SAFE FAILURE" : agentId}</b><p>{answer}</p></div>}</section>; }

function StateRow({label,state,tone}:{label:string;state:string;tone:string}) { return <div className="state-row"><span>{label}</span><b><i className={`dot ${tone}`}/>{state}</b></div>; }
function Metric({label,value,note,tone="neutral"}:{label:string;value:string;note:string;tone?:string}) { return <article className="metric-card"><div className="metric-top"><span>{label}</span><i>↗</i></div><strong>{value}</strong><p className={tone}>{note}</p></article>; }
function PanelTitle({kicker,title}:{kicker:string;title:string}) { return <div className="panel-header"><div><p className="eyebrow">{kicker}</p><h3>{title}</h3></div></div>; }
function Focus({n,text}:{n:string;text:string}) { return <div className="focus-row"><span className="focus-rank green">{n}</span><div><strong>{text}</strong><p>Explicit human approval required</p></div></div>; }
function SectionLead({kicker,title,body}:{kicker:string;title:string;body:string}) { return <div className="section-lead"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{body}</p></div>; }
function Control({name,status}:{name:string;status:string}) { return <article><span>{name}</span><strong>{status}</strong></article>; }
function money(value:number) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0,notation:value>=1_000_000?"compact":"standard"}).format(value); }

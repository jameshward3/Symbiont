"use client";

import { FormEvent, useMemo, useState } from "react";

type View = "Overview" | "Projects" | "Pipeline" | "Decisions" | "Systems";

const navItems: { label: View; code: string; count?: number }[] = [
  { label: "Overview", code: "01" },
  { label: "Projects", code: "02", count: 4 },
  { label: "Pipeline", code: "03", count: 7 },
  { label: "Decisions", code: "04", count: 3 },
  { label: "Systems", code: "05", count: 25 },
];

const projects = [
  { name: "Meridian Portfolio Twin", client: "Meridian Properties", phase: "Integration", progress: 68, health: "On track", tone: "green", next: "Sensor mapping review", due: "22 Jul" },
  { name: "Northline Reality Capture", client: "Northline Health", phase: "Capture", progress: 42, health: "Attention", tone: "amber", next: "Site access confirmation", due: "19 Jul" },
  { name: "Aperture BIM Standard", client: "Aperture Development", phase: "QA / QC", progress: 86, health: "On track", tone: "green", next: "Issue v1.0 package", due: "24 Jul" },
  { name: "Foundry Operations Graph", client: "Foundry Works", phase: "Discovery", progress: 18, health: "At risk", tone: "red", next: "Resolve data ownership", due: "Today" },
];

const decisions = [
  { id: "DEC-2026-014", title: "Select portfolio telemetry standard", owner: "Technical", due: "Today", status: "Approval needed" },
  { id: "DEC-2026-013", title: "Productize reality-capture onboarding", owner: "COO", due: "21 Jul", status: "Analysis" },
  { id: "DEC-2026-012", title: "Adopt project margin threshold", owner: "Founder", due: "23 Jul", status: "Proposed" },
];

const automations = [
  { id: "AUT-001", name: "Inquiry → CRM intake", state: "Ready", impact: "High" },
  { id: "AUT-002", name: "Project workspace provisioning", state: "Pilot", impact: "High" },
  { id: "AUT-003", name: "Meeting → actions + decisions", state: "Pilot", impact: "High" },
  { id: "AUT-011", name: "Executive Daily Brief", state: "Ready", impact: "High" },
];

const prompts = [
  "Prepare today’s executive brief",
  "Show portfolio risks",
  "What requires my decision?",
];

export default function Home() {
  const [view, setView] = useState<View>("Overview");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(2026, 6, 18)),
    [],
  );

  function submitCommand(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setAnswer(
      "Priority 01 · Resolve Foundry data ownership before delivery advances. Priority 02 · Confirm Northline site access today. Decision DEC-2026-014 requires approval. Estimated executive effort: 25 minutes.",
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SYMBIONT</strong>
            <span>OPERATING SYSTEM</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <p className="eyebrow nav-label">Command views</p>
          {navItems.map((item) => (
            <button
              className={`nav-item ${view === item.label ? "active" : ""}`}
              key={item.label}
              onClick={() => setView(item.label)}
              type="button"
            >
              <span className="nav-code">{item.code}</span>
              <span>{item.label}</span>
              {item.count ? <span className="nav-count">{item.count}</span> : null}
            </button>
          ))}
        </nav>

        <div className="side-divider" />

        <div className="system-state">
          <p className="eyebrow">System state</p>
          <div className="state-row"><span>Knowledge base</span><b><i className="dot green" />Active</b></div>
          <div className="state-row"><span>Project controls</span><b><i className="dot green" />Active</b></div>
          <div className="state-row"><span>Financial feed</span><b><i className="dot amber" />Demo</b></div>
        </div>

        <div className="agent-card">
          <div className="agent-orbit"><span>001</span></div>
          <div>
            <p>COO AGENT</p>
            <strong>Online</strong>
          </div>
          <i className="pulse" />
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Executive command center</p>
            <h1>{view}</h1>
          </div>
          <div className="top-actions">
            <span className="demo-pill">Demonstration data</span>
            <button className="icon-button" aria-label="Notifications" type="button">3</button>
            <div className="avatar">JW</div>
          </div>
        </header>

        {view === "Overview" ? (
          <Overview date={date} setQuery={setQuery} submitCommand={submitCommand} query={query} answer={answer} />
        ) : view === "Projects" ? (
          <ProjectsView />
        ) : view === "Pipeline" ? (
          <PipelineView />
        ) : view === "Decisions" ? (
          <DecisionsView />
        ) : (
          <SystemsView />
        )}
      </main>
    </div>
  );
}

function Overview({ date, query, setQuery, submitCommand, answer }: { date: string; query: string; setQuery: (value: string) => void; submitCommand: (event: FormEvent) => void; answer: string }) {
  return (
    <div className="view-wrap">
      <section className="brief-intro">
        <div>
          <p className="date-line">{date}</p>
          <h2>Good morning. The company is<br /><em>stable, with two exceptions.</em></h2>
        </div>
        <div className="brief-score">
          <span>OPERATING CONFIDENCE</span>
          <strong>84</strong><small>/100</small>
          <div className="score-track"><i /></div>
          <p>↑ 6 points this week</p>
        </div>
      </section>

      <section className="metric-grid" aria-label="Key performance indicators">
        <Metric label="Active projects" value="04" change="3 healthy / 1 at risk" tone="neutral" />
        <Metric label="Weighted pipeline" value="$1.84M" change="↑ 12% this month" tone="positive" />
        <Metric label="On-time milestones" value="92%" change="Target ≥ 90%" tone="positive" />
        <Metric label="Critical actions" value="03" change="2 due today" tone="warning" />
      </section>

      <section className="dashboard-grid">
        <div className="panel portfolio-panel">
          <PanelHeader kicker="Delivery control" title="Project portfolio" action="View all" />
          <div className="project-head"><span>Project</span><span>Progress</span><span>Health</span><span>Next gate</span></div>
          {projects.map((project) => <ProjectRow project={project} key={project.name} />)}
        </div>

        <div className="panel attention-panel">
          <PanelHeader kicker="Executive attention" title="Today’s focus" />
          <div className="focus-list">
            <Focus rank="01" title="Resolve Foundry data ownership" meta="Blocks discovery · Decision required" tone="red" />
            <Focus rank="02" title="Confirm Northline site access" meta="Milestone risk · Owner: Delivery" tone="amber" />
            <Focus rank="03" title="Approve telemetry standard" meta="DEC-2026-014 · Due today" tone="green" />
          </div>
          <div className="effort-card"><span>Required executive effort</span><strong>25 min</strong></div>
        </div>

        <div className="panel decisions-panel">
          <PanelHeader kicker="Governance" title="Open decisions" action="Decision log" />
          {decisions.map((decision) => (
            <div className="decision-row" key={decision.id}>
              <span className="decision-id">{decision.id}</span>
              <div><strong>{decision.title}</strong><p>{decision.owner} · Due {decision.due}</p></div>
              <span className="status-chip">{decision.status}</span>
            </div>
          ))}
        </div>

        <div className="panel agent-panel">
          <div className="agent-title"><div className="mini-mark">S</div><div><p className="eyebrow">Agent 001</p><h3>Ask the COO</h3></div></div>
          <p className="agent-copy">Turn company signals into an executive-ready decision, brief, or operating asset.</p>
          <div className="prompt-chips">
            {prompts.map((prompt) => <button onClick={() => setQuery(prompt)} type="button" key={prompt}>{prompt}</button>)}
          </div>
          <form onSubmit={submitCommand} className="command-form">
            <label htmlFor="coo-command">Command</label>
            <div><input id="coo-command" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about priorities, risk, or systems…" /><button type="submit" aria-label="Send command">↗</button></div>
          </form>
          {answer ? <div className="agent-answer"><span>COO</span><p>{answer}</p></div> : null}
        </div>
      </section>
    </div>
  );
}

function ProjectsView() {
  return <div className="view-wrap inner-view"><section className="section-lead"><p className="eyebrow">Portfolio command</p><h2>Every project.<br /><em>One operating truth.</em></h2><p>Live scope, schedule, financial, risk, and quality signals—organized around the next client outcome.</p></section><div className="project-cards">{projects.map((p, i) => <article className="project-card" key={p.name}><div className="card-number">0{i + 1}</div><span className={`health-label ${p.tone}`}>{p.health}</span><p>{p.client}</p><h3>{p.name}</h3><div className="project-meta"><span>PHASE <b>{p.phase}</b></span><span>NEXT GATE <b>{p.next}</b></span></div><div className="large-progress"><i style={{ width: `${p.progress}%` }} /><span>{p.progress}%</span></div></article>)}</div></div>;
}

function PipelineView() {
  const stages = [{ name: "Discovery", count: 3, value: "$420K", width: 54 }, { name: "Solution", count: 2, value: "$680K", width: 72 }, { name: "Proposal", count: 1, value: "$510K", width: 88 }, { name: "Negotiation", count: 1, value: "$230K", width: 42 }];
  return <div className="view-wrap inner-view"><section className="section-lead"><p className="eyebrow">Commercial intelligence</p><h2>Pipeline built around<br /><em>repeatable outcomes.</em></h2><p>Seven active opportunities. Three have recurring-revenue potential; one lacks a dated next action.</p></section><div className="pipeline-layout"><div className="panel"><PanelHeader kicker="Weighted pipeline" title="$1.84M" action="Coverage 3.2×" />{stages.map(s => <div className="stage-row" key={s.name}><span>{s.name}<small>{s.count} opportunities</small></span><div><i style={{width: `${s.width}%`}} /></div><strong>{s.value}</strong></div>)}</div><div className="panel pipeline-note"><p className="eyebrow">COO recommendation</p><h3>Move from services to configured products.</h3><p>Package the three recurring client outcomes into defined scope modules with acceptance criteria, baseline effort, and recurring operations support.</p><button type="button">Create productization brief <span>↗</span></button></div></div></div>;
}

function DecisionsView() {
  return <div className="view-wrap inner-view"><section className="section-lead"><p className="eyebrow">Decision architecture</p><h2>Clarity compounds.<br /><em>Ambiguity costs.</em></h2><p>Material decisions are recorded with evidence, authority, rationale, actions, and validation dates.</p></section><div className="decision-board"><div className="decision-column"><h3>Needs approval <span>1</span></h3>{decisions.slice(0,1).map(d => <DecisionCard key={d.id} decision={d} />)}</div><div className="decision-column"><h3>In analysis <span>1</span></h3>{decisions.slice(1,2).map(d => <DecisionCard key={d.id} decision={d} />)}</div><div className="decision-column"><h3>Proposed <span>1</span></h3>{decisions.slice(2).map(d => <DecisionCard key={d.id} decision={d} />)}</div></div></div>;
}

function SystemsView() {
  return <div className="view-wrap inner-view"><section className="section-lead"><p className="eyebrow">Digital nervous system</p><h2>Stabilize the process.<br /><em>Then automate it.</em></h2><p>Twenty-five prioritized opportunities are governed by an owner, authority boundary, baseline, tests, monitoring, and rollback.</p></section><div className="systems-grid"><div className="panel"><PanelHeader kicker="Automation wave 01" title="Control + visibility" action="8 processes" />{automations.map(a => <div className="automation-row" key={a.id}><span>{a.id}</span><strong>{a.name}</strong><i>{a.impact}</i><b className={a.state.toLowerCase()}>{a.state}</b></div>)}</div><div className="panel principles"><p className="eyebrow">Release sequence</p><ol><li><span>01</span>Eliminate</li><li><span>02</span>Simplify</li><li><span>03</span>Standardize</li><li><span>04</span>Automate</li><li><span>05</span>Measure</li></ol></div></div></div>;
}

function Metric({ label, value, change, tone }: { label: string; value: string; change: string; tone: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><i>↗</i></div><strong>{value}</strong><p className={tone}>{change}</p></article>;
}

function PanelHeader({ kicker, title, action }: { kicker: string; title: string; action?: string }) {
  return <div className="panel-header"><div><p className="eyebrow">{kicker}</p><h3>{title}</h3></div>{action ? <button type="button">{action} <span>↗</span></button> : null}</div>;
}

function ProjectRow({ project }: { project: typeof projects[number] }) {
  return <div className="project-row"><div><strong>{project.name}</strong><p>{project.client} · {project.phase}</p></div><div className="progress-cell"><div><i style={{width: `${project.progress}%`}} /></div><span>{project.progress}%</span></div><span className={`health-label ${project.tone}`}><i className={`dot ${project.tone}`} />{project.health}</span><div className="next-gate"><strong>{project.next}</strong><p>{project.due}</p></div></div>;
}

function Focus({ rank, title, meta, tone }: { rank: string; title: string; meta: string; tone: string }) {
  return <div className="focus-row"><span className={`focus-rank ${tone}`}>{rank}</span><div><strong>{title}</strong><p>{meta}</p></div><span>↗</span></div>;
}

function DecisionCard({ decision }: { decision: typeof decisions[number] }) {
  return <article className="decision-card"><span>{decision.id}</span><h3>{decision.title}</h3><p>Owner: {decision.owner}</p><div><b>{decision.status}</b><strong>Due {decision.due}</strong></div></article>;
}

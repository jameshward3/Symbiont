"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProjectsControl } from "./projects-control";
import { QualityControl } from "./quality-control";
import { KnowledgeControl } from "./knowledge-control";
import { ReliabilityControl } from "./reliability-control";
import { ClientSuccessControl } from "./client-success-control";
import { SecurityGovernanceControl } from "./security-governance-control";
import { MarketingControl } from "./marketing-control";
import { TechnicalArchitectureControl } from "./technical-architecture-control";
import { ProductControl } from "./product-control";
import { FinanceControl } from "./finance-control";
import { WorkflowPortal } from "./workflow-portal";
import { ResearchControl } from "./research-control";
import { AccountControl } from "./account-control";
import type { DeliveryData } from "@/lib/delivery-control";
import type { QualityData } from "@/lib/qaqc";
import type { KnowledgeData } from "@/lib/knowledge";
import type { ReliabilityData } from "@/lib/reliability";
import type { ClientSuccessData } from "@/lib/client-success";
import type { SecurityGovernanceData } from "@/lib/security-governance";
import type { MarketingData } from "@/lib/marketing";
import type { ArchitectureData } from "@/lib/technical-architecture";
import type { ProductPortfolioData } from "@/lib/product-architecture";
import type { FinanceData } from "@/lib/finance";
import type { ResearchData } from "@/lib/research";
import { matchOpportunityToKnowledge, type OpportunityKnowledgeBrief } from "@/lib/capability-matching";
import { demonstrationPortalProjects, estimateForOpportunity, mergePortalProject, portalProjectFromOpportunity, visiblePortalProjects, type GovernedDecisionInput, type PortfolioOpportunityInput, type PortalProject } from "@/lib/workflow-portal";

type View = "Overview" | "Action Portal" | "Agent Network" | "Shared Goals" | "Sales Operations" | "Marketing" | "Delivery Control" | "Finance" | "Product" | "Client Success" | "Quality" | "Knowledge" | "Research" | "Reliability" | "Technical Architecture" | "Security & Data" | "Opportunity Scout" | "Systems";
type Connection = "checking" | "unavailable" | "authorization_required" | "connected" | "error";
type Agent = { stable_id: string; name: string; mission: string; authority_level: string; status: string; updated_at?: string };
type Goal = { stable_id: string; objective: string; status: string; priority: string; due_date?: string; success_metrics?: string[]; completion_evidence?: unknown };
type Opportunity = { stable_id: string; name: string; stage: string; client?:string; solicitation?:string; scope?:string; risks?:string[]; missing_information?:string[]; canonical_url?:string; source?:string; source_updated_at?:string; is_demonstration?:boolean; qualification_score?: number; recommendation?: string; amount?: number; currency?: string; probability?: number; expected_close?: string; next_action?: string; next_action_date?: string; proposal_status?: string; recurring_potential?: string; required_approvals?: string[] };
type Dashboard = { source: "live"; asOf: string; agents: Agent[]; goals: Goal[]; opportunities: Opportunity[]; decisions: Array<Record<string, string>>; runs: Array<Record<string, unknown>>; handoffs: Array<Record<string, unknown>> };
type ScoutOpportunity = { id:string; issuer:string; issuerWebsite?:string|null; title:string; solicitationNumber?:string|null; canonicalUrl:string; publicationDate?:string|null; deadlineAt?:string|null; deadlineTimezone?:string|null; location?:string|null; statedValue?:number|null; procurementType:string; scope:string; accessRequirements?:string|null; fitRationale:string; totalScore:number; confidence:number; freshness:string; risks:string[]; missingInformation:string[]; nextAction:string; route:"sales_operations"|"watchlist"|"archive"; handoffStatus:string; observedAt:string; sourceKind:string; isDemonstration:boolean };
type MonitoringQuery = { id:string; name:string; queryText:string; sourceCategory:string; geography?:string|null; cadence:string; status:string; lastCheckedAt?:string|null; nextCheckAt?:string|null; robotsPolicy:string; requiresAuthentication:boolean };
type ScoutData = { source:"d1"|"verified_snapshot"|"demonstration"; database:"connected"|"connected_empty"|"published_snapshot"|"unavailable"; asOf:string; activation:string; opportunities:ScoutOpportunity[]; monitoringQueries:MonitoringQuery[] };

function opportunityFromScout(item:ScoutOpportunity):Opportunity {
  return { stable_id:item.id, name:item.title, stage:item.route === "sales_operations" ? "Qualified" : "Lead", client:item.issuer, solicitation:item.solicitationNumber || item.procurementType, scope:item.scope, risks:item.risks, missing_information:item.missingInformation, canonical_url:item.canonicalUrl, source:`Opportunity Scout · ${item.sourceKind}`, source_updated_at:item.observedAt, is_demonstration:item.isDemonstration, qualification_score:item.totalScore, recommendation:item.route === "sales_operations" ? "Review" : "Watch", amount:item.statedValue ?? undefined, currency:"USD", probability:item.route === "sales_operations" ? 35 : 15, expected_close:item.deadlineAt?.slice(0,10), next_action:item.nextAction, next_action_date:item.deadlineAt?.slice(0,10), proposal_status:item.handoffStatus, recurring_potential:"To qualify", required_approvals:["AGT-002 acceptance"] };
}

type NavItem = { view: View; label: string; code: string };
const primaryNavItems: NavItem[] = [
  { view: "Overview", label: "Overview", code: "01" },
  { view: "Action Portal", label: "Actions", code: "ACT" },
  { view: "Sales Operations", label: "Pipeline", code: "02" },
  { view: "Delivery Control", label: "Projects", code: "03" },
];
const backgroundNavGroups: Array<{ label: string; items: NavItem[] }> = [
  { label: "Discover", items: [
    { view: "Opportunity Scout", label: "Opportunity Scout", code: "09" },
    { view: "Research", label: "Research", code: "07" },
    { view: "Marketing", label: "Marketing", code: "11" },
  ] },
  { label: "Advise", items: [
    { view: "Finance", label: "Finance", code: "06" },
    { view: "Product", label: "Product", code: "10" },
    { view: "Client Success", label: "Client Success", code: "13" },
    { view: "Technical Architecture", label: "Technical Architecture", code: "12" },
  ] },
  { label: "Assure", items: [
    { view: "Quality", label: "Quality", code: "04" },
    { view: "Knowledge", label: "Knowledge", code: "05" },
    { view: "Reliability", label: "Reliability", code: "08" },
    { view: "Security & Data", label: "Security & Data", code: "14" },
  ] },
  { label: "Govern", items: [
    { view: "Agent Network", label: "Agent Network", code: "NET" },
    { view: "Shared Goals", label: "Shared Goals", code: "GOA" },
    { view: "Systems", label: "Systems & Logs", code: "SYS" },
  ] },
];
const backgroundViews = new Set<View>(backgroundNavGroups.flatMap(group => group.items.map(item => item.view)));
const allNavigationItems = [...primaryNavItems, ...backgroundNavGroups.flatMap(group => group.items)];

const publishedAgents: Agent[] = [
  { stable_id: "AGT-001", name: "Symbiont COO", mission: "Coordinate company operations, priorities, standards, and agent work.", authority_level: "L2", status: "Active" },
  { stable_id: "AGT-002", name: "Sales Operations", mission: "Convert qualified client needs into profitable, repeatable work.", authority_level: "L1", status: "Active · human approval gated" },
  { stable_id: "AGT-003", name: "Delivery Control", mission: "Coordinate project authorization, delivery health, exceptions, changes, quality gates, and closeout.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-004", name: "QA/QC", mission: "Independently validate exact deliverable versions against approved requirements and release gates.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-005", name: "Knowledge Steward", mission: "Maintain an evidence-backed, searchable, governed source of operating truth.", authority_level: "L2", status: "Active · source review" },
  { stable_id: "AGT-006", name: "Finance Operations", mission: "Transform approved accounting and operational data into reconciled visibility, forecasts, and draft financial controls.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-007", name: "Research", mission: "Turn primary sources, historical evidence, and market signals into decision-ready findings with explicit confidence.", authority_level: "L1", status: "Active · evidence review" },
  { stable_id: "AGT-008", name: "Automation Reliability", mission: "Detect automation failures, contain impact, preserve evidence, and coordinate verified recovery.", authority_level: "L2", status: "Built · monitoring pending" },
  { stable_id: "AGT-009", name: "Opportunity Scout", mission: "Discover, verify, match, and route NJ/NY public opportunities against governed historical capabilities and new company prerogatives.", authority_level: "L1", status: "Active — governed" },
  { stable_id: "AGT-010", name: "Product & Service Architecture", mission: "Convert recurring delivery knowledge into repeatable, measurable, profitable building-intelligence products.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-014", name: "Security & Data Governance", mission: "Protect Symbiont and client data while enabling authorized work through governed controls.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-013", name: "Client Success", mission: "Protect client outcomes from onboarding through value realization, renewal, and expansion routing.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-011", name: "Marketing & Content Operations", mission: "Turn approved knowledge and outcomes into evidence-backed marketing assets and qualified demand.", authority_level: "L1", status: "Built · activation pending" },
  { stable_id: "AGT-012", name: "Technical Architecture", mission: "Define interoperable, secure, scalable, and supportable building-intelligence architectures.", authority_level: "L1", status: "Built · activation pending" },
];
const publishedGoals: Goal[] = [
  { stable_id: "GOAL-2026-009", objective: "Find NJ/NY network, cabling, switching, voice, physical-security, IT consulting, and 3D-scanning work and match it to governed knowledge.", status: "Active", priority: "P1", success_metrics: ["Official canonical evidence", "Historical capability match", "Human pursuit approval", "Auditable handoff"] },
  { stable_id: "GOAL-2026-010", objective: "Develop a governed, configurable Symbiont Command Center software offering for state and local governments, starting with clerk, constituent-service, case-management, CRM, and operational-workflow needs. Evaluate Clerkos and other CRM-like systems as potential integration or migration candidates.", status: "Approved", priority: "P1", success_metrics: ["Approved public-sector workflow and problem map", "Configurable reference architecture with security, accessibility, records, retention, and data-governance requirements", "Evidence-based evaluation of Clerkos and other CRM-like systems; no compatibility, partnership, or market claim without evidence", "Human approval before outreach, pricing, pilot, credentials, data intake, or production activation"] },
];

export default function Home() {
  const [view, setView] = useState<View>("Overview");
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [connection, setConnection] = useState<Connection>("checking");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [agentId, setAgentId] = useState("AGT-002");
  const [command, setCommand] = useState("");
  const [runState, setRunState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [answer, setAnswer] = useState("");
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [qualityData, setQualityData] = useState<QualityData | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeData | null>(null);
  const [reliabilityData, setReliabilityData] = useState<ReliabilityData | null>(null);
  const [clientSuccessData, setClientSuccessData] = useState<ClientSuccessData | null>(null);
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [securityData, setSecurityData] = useState<SecurityGovernanceData | null>(null);
  const [architectureData, setArchitectureData] = useState<ArchitectureData | null>(null);
  const [productData, setProductData] = useState<ProductPortfolioData | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [workflowProjects, setWorkflowProjects] = useState<PortalProject[]>(() => demonstrationPortalProjects.map(project => ({ ...project, approvals:[...project.approvals], completedApprovals:[...project.completedApprovals], activities:project.activities.map(activity => ({ ...activity })) })));
  const [workflowFocusId, setWorkflowFocusId] = useState<string|null>(null);

  useEffect(() => { fetch("/api/status", { cache: "no-store" }).then(r => r.json()).then(s => setConnection(s.dataPlane)).catch(() => setConnection("error")); }, []);
  useEffect(() => { fetch(`/api/opportunities/${demoMode?"?demo=1":""}`, { cache: "no-store" }).then(r => r.json()).then(setScoutData).catch(() => setScoutData(null)); }, [demoMode]);
  useEffect(() => { fetch(`/api/delivery-control/${demoMode?"?demo=1":""}`, { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setDeliveryData).catch(() => setDeliveryData(null)); }, [accessKey, connection, demoMode]);
  useEffect(() => { fetch("/api/quality/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setQualityData).catch(() => setQualityData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch(`/api/knowledge/${demoMode?"?demo=1":""}`, { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setKnowledgeData).catch(() => setKnowledgeData(null)); }, [accessKey, connection, demoMode]);
  useEffect(() => { fetch(`/api/research/${demoMode?"?demo=1":""}`, { cache: "no-store" }).then(r => r.json()).then(setResearchData).catch(() => setResearchData(null)); }, [demoMode]);
  useEffect(() => { fetch("/api/reliability/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setReliabilityData).catch(() => setReliabilityData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/client-success/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setClientSuccessData).catch(() => setClientSuccessData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/marketing/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setMarketingData).catch(() => setMarketingData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/security-governance/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setSecurityData).catch(() => setSecurityData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/technical-architecture/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setArchitectureData).catch(() => setArchitectureData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/products/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setProductData).catch(() => setProductData(null)); }, [accessKey, connection]);
  useEffect(() => { fetch("/api/finance/", { headers: accessKey ? { "x-symbiont-access-key": accessKey } : {}, cache: "no-store" }).then(r => r.json()).then(setFinanceData).catch(() => setFinanceData(null)); }, [accessKey, connection]);

  async function connect(event: FormEvent) {
    event.preventDefault(); setConnection("checking");
    const response = await fetch("/api/dashboard", { headers: { "x-symbiont-access-key": accessKey }, cache: "no-store" });
    if (response.status === 401) { setConnection("authorization_required"); return; }
    if (!response.ok) { setConnection(response.status === 503 ? "unavailable" : "error"); return; }
    setDashboard(await response.json()); setConnection("connected");
  }

  async function runAgentCommand(event: FormEvent) {
    event.preventDefault(); if (!command.trim() || (!demoMode && connection !== "connected")) return;
    setRunState("running"); setAnswer("");
    if (demoMode) {
      window.setTimeout(()=>{setAnswer(demoAgentResponse(agentId,command));setRunState("complete");},250);
      return;
    }
    const response = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json", "x-symbiont-access-key": accessKey }, body: JSON.stringify({ agentId, command }) });
    const result = await response.json();
    if (!response.ok) { setAnswer(result.error || "Agent run failed safely."); setRunState("error"); return; }
    setAnswer(result.text); setRunState("complete");
  }

  function startGovernedResponse(opportunity:Opportunity) {
    const project = portalProjectFromOpportunity({
      id:opportunity.stable_id,
      title:opportunity.name,
      client:opportunity.client,
      solicitation:opportunity.solicitation,
      stage:opportunity.stage,
      scope:opportunity.scope,
      risks:opportunity.risks,
      missingInformation:opportunity.missing_information,
      statedValue:opportunity.amount,
      nextAction:opportunity.next_action,
      dueDate:opportunity.next_action_date || opportunity.expected_close,
      recommendation:opportunity.recommendation,
      confidence:opportunity.qualification_score,
      source:opportunity.source || (connection === "connected" ? "Governed Sales Operations record" : "Verified published pipeline record"),
      sourceUpdatedAt:opportunity.source_updated_at,
      canonicalUrl:opportunity.canonical_url,
      isDemonstration:opportunity.is_demonstration ?? demoMode,
    });
    setWorkflowProjects(items => mergePortalProject(items, project));
    setWorkflowFocusId(project.id);
    setView("Action Portal");
  }

  function openPursuit(id:string) {
    const action=visibleWorkflowProjects.find(project=>project.id===id);
    if (action) { setWorkflowFocusId(action.id); setView("Action Portal"); return; }
    const opportunity=opportunities.find(item=>item.stable_id===id);
    if (opportunity) startGovernedResponse(opportunity);
  }

  const agents = useMemo(() => {
    const dashboardAgents = demoMode ? [] : dashboard?.agents ?? [];
    const liveAgents = new Map(dashboardAgents.map(agent => [agent.stable_id, agent]));
    const consolidated = publishedAgents.map(agent => ({ ...agent, ...liveAgents.get(agent.stable_id) }));
    const knownIds = new Set(consolidated.map(agent => agent.stable_id));
    return consolidated.concat(dashboardAgents.filter(agent => !knownIds.has(agent.stable_id)));
  }, [dashboard,demoMode]);
  const goals = !demoMode && dashboard?.goals ? dashboard.goals : publishedGoals;
  const publishedPipeline:Opportunity[] = (scoutData?.opportunities ?? []).filter((item)=>demoMode?item.isDemonstration:!item.isDemonstration).map(opportunityFromScout);
  const opportunities = !demoMode && dashboard?.opportunities ? dashboard.opportunities : publishedPipeline;
  const visibleWorkflowProjects = visiblePortalProjects(workflowProjects, demoMode);
  const portfolioOpportunities:PortfolioOpportunityInput[] = opportunities.map(item=>({
    id:item.stable_id,title:item.name,client:item.client,stage:item.stage,scope:item.scope,amount:item.amount,
    dueDate:item.next_action_date||item.expected_close,nextAction:item.next_action,recommendation:item.recommendation,
    confidence:item.qualification_score,source:item.source,isDemonstration:item.is_demonstration??demoMode,
  }));
  const governedDecisions:GovernedDecisionInput[] = [
    ...(!demoMode?(dashboard?.decisions??[]).map(item=>({
      id:item.stable_id||`DEC-LIVE-${item.statement||"REVIEW"}`,projectId:item.project_id,statement:item.statement||"Decision review required",
      owner:item.decision_owner||item.owner,requiredBy:item.required_by,status:item.status,rationale:item.rationale,source:"Governed dashboard decision register",isDemonstration:false,
    })):[]),
    ...(deliveryData?.decisions??[]).map(item=>({id:item.id,projectId:item.projectId,statement:item.statement,owner:item.owner,requiredBy:item.requiredBy,status:item.status,rationale:"Review the linked project evidence, delivery impact, and accountable recommendation.",source:"Delivery Control decision register",isDemonstration:deliveryData?.source==="demonstration"})),
  ];
  const actionCount = visibleWorkflowProjects.filter(project => project.status !== "Closed").length;
  const weighted = opportunities.reduce((sum, item) => sum + Number(item.amount || 0) * Number(item.probability || 0) / 100, 0);
  const stale = opportunities.filter(item => item.next_action_date && new Date(item.next_action_date) < new Date("2026-07-20T00:00:00")).length;
  const sourceLabel = demoMode ? "Demonstration mode" : connection === "connected" ? "Live governed data" : "Verified published registry";
  const backgroundActive = backgroundViews.has(view);
  const viewTitle = allNavigationItems.find(item => item.view === view)?.label ?? view;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><div><strong>SYMBIONT</strong><span>OPERATING SYSTEM</span></div></div>
        <nav aria-label="Primary navigation">
          <p className="eyebrow nav-label">Operating views</p>
          {primaryNavItems.map(item => <button className={`nav-item ${view === item.view ? "active" : ""}`} key={item.view} onClick={() => setView(item.view)} type="button"><span className="nav-code">{item.code}</span><span>{item.label}</span>{item.view === "Action Portal" && <b className="nav-badge">{actionCount}</b>}</button>)}
          <button className={`nav-item nav-folder ${backgroundActive ? "active" : ""}`} aria-expanded={backgroundOpen || backgroundActive} onClick={() => setBackgroundOpen(open => !open)} type="button"><span className="nav-code">BG</span><span>Background Agents</span><b>{backgroundOpen || backgroundActive ? "−" : "+"}</b></button>
          {(backgroundOpen || backgroundActive) && <div className="background-menu">{backgroundNavGroups.map(group => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map(item => <button className={`nav-subitem ${view === item.view ? "active" : ""}`} key={item.view} onClick={() => setView(item.view)} type="button"><span>{item.code}</span>{item.label}</button>)}</div>)}</div>}
        </nav>
        <div className="side-divider" />
        <div className="system-state"><p className="eyebrow">Runtime state</p><StateRow label="Shared data" state={connection === "connected" ? "Live" : connection === "checking" ? "Checking" : "Restricted"} tone={connection === "connected" ? "green" : "amber"} /><StateRow label="Agent authority" state="Governed" tone="green" /><StateRow label="External actions" state="Approval" tone="amber" /></div>
        <div className="agent-card"><div className="agent-orbit"><span>BG</span></div><div><p>BACKGROUND AGENTS</p><strong>{agents.length} governed roles</strong></div><i className="pulse" /></div>
      </aside>
      <main>
        <header className="topbar"><div><p className="eyebrow">Executive command center</p><h1>{viewTitle}</h1></div><div className="top-actions"><label className="demo-toggle" title="Switch between live records and demo mode"><input type="checkbox" checked={demoMode} onChange={event=>{setDemoMode(event.target.checked);setWorkflowFocusId(null);setAnswer("");setRunState("idle");}}/><span>Demo mode</span><i /></label><span className={`demo-pill ${!demoMode && connection === "connected" ? "live-pill" : ""}`}>{sourceLabel}</span><AccountControl /></div></header>
        <div className="view-wrap">
          <p className="sr-only" aria-live="polite">{connection === "connected" ? "Runtime connected to the governed data plane." : "Runtime unavailable for live agent actions."}</p>
          <ConnectionBanner connection={connection} connect={connect} accessKey={accessKey} setAccessKey={setAccessKey} demoMode={demoMode} />
          {view === "Overview" && <Overview agents={agents} goals={goals} opportunities={opportunities} weighted={weighted} stale={stale} source={sourceLabel} onNavigate={setView} />}
          {view === "Action Portal" && <WorkflowPortal key={`${demoMode}-${workflowFocusId || "queue"}`} accessKey={accessKey} demoMode={demoMode} projects={workflowProjects} setProjects={setWorkflowProjects} focusProjectId={workflowFocusId} onOpenWorkProduct={(id)=>setView(agentWorkspace(id))} governedDecisions={governedDecisions} />}
          {view === "Agent Network" && <AgentNetwork agents={agents} source={sourceLabel} onNavigate={setView} />}
          {view === "Shared Goals" && <SharedGoals goals={goals} agents={agents} source={sourceLabel} />}
          {view === "Sales Operations" && <SalesOperations opportunities={opportunities} source={sourceLabel} onStartResponse={startGovernedResponse} />}
          {view === "Marketing" && <MarketingControl data={marketingData} />}
          {view === "Opportunity Scout" && <OpportunityScout data={scoutData} onNavigate={setView} onStartResponse={(item)=>startGovernedResponse(opportunityFromScout(item))} />}
          {view === "Delivery Control" && <ProjectsControl opportunities={portfolioOpportunities} workflowProjects={workflowProjects} deliveryData={deliveryData} demoMode={demoMode} onOpenPursuit={openPursuit} />}
          {view === "Finance" && <FinanceControl data={financeData} />}
          {view === "Product" && <ProductControl data={productData} />}
          {view === "Client Success" && <ClientSuccessControl data={clientSuccessData} />}
          {view === "Quality" && <QualityControl data={qualityData} />}
          {view === "Knowledge" && <KnowledgeControl data={knowledgeData} onNavigate={(next)=>setView(next)} />}
          {view === "Research" && <ResearchControl data={researchData} onNavigate={setView} />}
          {view === "Reliability" && <ReliabilityControl data={reliabilityData} />}
          {view === "Technical Architecture" && <TechnicalArchitectureControl data={architectureData} />}
          {view === "Security & Data" && <SecurityGovernanceControl data={securityData} />}
          {view === "Systems" && <SystemsView connection={connection} runs={dashboard?.runs ?? []} handoffs={dashboard?.handoffs ?? []} />}
          {(view === "Agent Network" || view === "Systems") && <CommandPanel agentId={agentId} setAgentId={setAgentId} command={command} setCommand={setCommand} submit={runAgentCommand} connection={connection} demoMode={demoMode} runState={runState} answer={answer} />}
        </div>
      </main>
    </div>
  );
}

function ConnectionBanner({ connection, connect, accessKey, setAccessKey, demoMode }: { connection: Connection; connect: (e: FormEvent) => void; accessKey: string; setAccessKey: (v: string) => void; demoMode:boolean }) {
  if (demoMode) return <div className="connection-banner demo"><span><i className="dot amber" />Demo mode is active. All records and agent responses are illustrative; no live system is read or changed.</span><b>DEMO</b></div>;
  if (connection === "connected") return <div className="connection-banner connected"><span><i className="dot green" />Connected to the governed shared data plane</span><b>LIVE</b></div>;
  const copy = connection === "unavailable" ? "The shared Supabase data plane is not configured. Live CRM and agent actions are disabled." : connection === "error" ? "The shared data plane could not be reached safely." : connection === "checking" ? "Checking the governed data plane…" : "A secure session is required before live company data can be read.";
  return <div className="connection-banner"><span><i className="dot amber" />{copy}</span>{connection === "authorization_required" ? <form onSubmit={connect}><label htmlFor="access-key">Secure access key</label><input id="access-key" type="password" autoComplete="current-password" value={accessKey} onChange={e => setAccessKey(e.target.value)} /><button type="submit">Connect</button></form> : <b>{connection.toUpperCase().replace("_", " ")}</b>}</div>;
}

function Overview({ agents, goals, opportunities, weighted, stale, source, onNavigate }: { agents: Agent[]; goals: Goal[]; opportunities: Opportunity[]; weighted: number; stale: number; source: string; onNavigate:(view:View)=>void }) {
  const date = useMemo(() => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()), []);
  return <><section className="brief-intro"><div><p className="date-line">{date} · {source}</p><h2>Governed agents. One<br/><em>operating truth.</em></h2></div><button type="button" className="brief-score" title="Open system readiness and runtime controls" onClick={()=>onNavigate("Systems")}><span>AGENT READINESS</span><strong>{agents.length === 14 ? "88" : "—"}</strong><small>/100</small><div className="score-track"><i style={{width: agents.length === 14 ? "88%" : "0"}} /></div><p>Open production controls →</p></button></section><section className="metric-grid"><Metric label="Registered agents" value={String(agents.length).padStart(2,"0")} note="Open cooperative network" detail="Inspect missions, authority, relationships, and workspaces" onOpen={()=>onNavigate("Agent Network")} /><Metric label="Shared goals" value={String(goals.length).padStart(2,"0")} note="Open accountable outcomes" detail="Inspect success measures and accountable owners" onOpen={()=>onNavigate("Shared Goals")} /><Metric label="Weighted pipeline" value={money(weighted)} note={`${opportunities.length} opportunities`} detail="Open governed sales pipeline" onOpen={()=>onNavigate("Sales Operations")} /><Metric label="Stale actions" value={String(stale).padStart(2,"0")} note={stale ? "Requires sales review" : "Within date"} detail="Open opportunity evidence and next actions" tone={stale ? "warning" : "positive"} onOpen={()=>onNavigate("Opportunity Scout")} /></section><section className="dashboard-grid"><button type="button" className="panel panel-button" title="Open the interactive 14-agent network" onClick={()=>onNavigate("Agent Network")}><PanelTitle kicker="Agent network" title="Cooperative capacity" />{agents.map(a => <div className="network-row" key={a.stable_id}><span>{a.stable_id}</span><div><strong>{a.name}</strong><p>{a.mission}</p></div><b>{a.authority_level}</b><i>{a.status}</i></div>)}</button><button type="button" className="panel attention-panel panel-button" title="Open system authority controls" onClick={()=>onNavigate("Systems")}><PanelTitle kicker="Governance" title="Human approval remains the gate" /><div className="focus-list"><Focus n="01" text="External client communications" /><Focus n="02" text="Pricing, proposals, scope + terms" /><Focus n="03" text="Material decisions + commitments" /></div></button><button type="button" className="panel panel-button" title="Open shared-goal evidence" onClick={()=>onNavigate("Shared Goals")}><PanelTitle kicker="Shared goal" title={goals[0]?.stable_id || "No active goal"} /><h3 className="feature-title">{goals[0]?.objective || "Create an approved governed goal."}</h3><div className="goal-meta"><span>OWNER <b>AGT-001</b></span><span>CONTRIBUTOR <b>AGT-002</b></span><span>STATUS <b>{goals[0]?.status || "Unavailable"}</b></span></div></button><button type="button" className="panel acid-panel panel-button" title="Open Sales Operations" onClick={()=>onNavigate("Sales Operations")}><p className="eyebrow">Sales operations signal</p><h3>{stale ? `${stale} opportunity needs a dated next action.` : "Pipeline actions are current."}</h3><p>AGT-002 can qualify, draft, and hand off. A human approves every external or commercial commitment.</p></button></section></>;
}

function AgentNetwork({ agents, source, onNavigate }: { agents: Agent[]; source: string; onNavigate:(view:View)=>void }) {
  const [activeId, setActiveId] = useState(agents[0]?.stable_id ?? "AGT-001");
  const active = agents.find(agent => agent.stable_id === activeId) ?? agents[0];
  const count = Math.max(agents.length, 1);
  const relationships = agents.flatMap((agent, index) => {
    if (agent.stable_id === "AGT-001") return [];
    const cooIndex = Math.max(0, agents.findIndex(item => item.stable_id === "AGT-001"));
    const links = [[cooIndex, index]];
    const partner = ({ "AGT-002":"AGT-009", "AGT-003":"AGT-004", "AGT-005":"AGT-011", "AGT-006":"AGT-013", "AGT-008":"AGT-012", "AGT-010":"AGT-013", "AGT-014":"AGT-008" } as Record<string,string>)[agent.stable_id];
    const partnerIndex = partner ? agents.findIndex(item => item.stable_id === partner) : -1;
    if (partnerIndex > index) links.push([index, partnerIndex]);
    return links;
  });
  const point = (index: number, radius = 42) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
  };
  const statusCounts = agents.reduce((totals, agent) => { totals[agentTone(agent.status)] += 1; return totals; }, { green:0, amber:0, red:0, gray:0 } as Record<AgentTone,number>);
  const workspace = active ? agentWorkspace(active.stable_id) : "Agent Network";

  return <section className="network-view">
    <SectionLead kicker="Cooperative intelligence" title="One network. Explicit authority." body={`${source}. Explore each agent and the governed relationships that connect discovery, sales, delivery, quality, knowledge, and operations.`} />
    <div className="network-summary" aria-label="Agent status summary">
      <span><i className="network-status green" />{statusCounts.green} active / ready</span>
      <span><i className="network-status amber" />{statusCounts.amber} review / pilot</span>
      <span><i className="network-status red" />{statusCounts.red} blocked / attention</span>
      <span><i className="network-status gray" />{statusCounts.gray} draft / unavailable</span>
    </div>
    <div className="network-stage">
      <div className="network-orbit" role="group" aria-label="Interactive agent relationship map">
        <svg className="network-links" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" className="orbit-ring" />
          {relationships.map(([from,to], index) => { const a=point(from), b=point(to); const highlighted=agents[from]?.stable_id===activeId||agents[to]?.stable_id===activeId; return <path key={`${from}-${to}-${index}`} d={`M ${a.x} ${a.y} Q 50 50 ${b.x} ${b.y}`} className={highlighted ? "active-link" : ""} />; })}
        </svg>
        {agents.map((agent,index) => { const p=point(index); const tone=agentTone(agent.status); return <button key={agent.stable_id} type="button" className={`network-node ${tone} ${agent.stable_id===activeId?"selected":""}`} style={{left:`${p.x}%`,top:`${p.y}%`}} onMouseEnter={()=>setActiveId(agent.stable_id)} onFocus={()=>setActiveId(agent.stable_id)} onClick={()=>setActiveId(agent.stable_id)} onDoubleClick={()=>onNavigate(agentWorkspace(agent.stable_id))} aria-pressed={agent.stable_id===activeId} aria-label={`${agent.stable_id}, ${agent.name}, ${agent.status}`} title={`${agent.status} · ${agent.authority_level}\n${agent.mission}\nDouble-click to open ${agentWorkspace(agent.stable_id)}`}><i /><strong>{agent.stable_id.replace("AGT-","")}</strong><span>{shortAgentName(agent.name)}</span></button>; })}
        {active && <article className="network-core" aria-live="polite">
          <p>{active.stable_id} · {active.authority_level}</p>
          <h3>{active.name}</h3>
          <span>{active.mission}</span>
          <div><b className={agentTone(active.status)}>{active.status}</b><small>{active.stable_id === "AGT-001" ? "Reports to Founder" : "Reports to AGT-001"}</small></div>
        </article>}
      </div>
      <aside className="network-inspector">
        <p className="eyebrow">Selected agent</p>
        <span className={`inspector-state ${active ? agentTone(active.status) : "gray"}`}><i />{active?.status ?? "Unavailable"}</span>
        <h3>{active?.name ?? "No agent selected"}</h3>
        <p>{active?.mission}</p>
        <dl>
          <InspectorDatum label="Agent ID" value={active?.stable_id ?? "Unavailable"} detail="Controlled identifier in the agent registry" onOpen={()=>onNavigate(workspace)} />
          <InspectorDatum label="Authority" value={active?.authority_level ?? "Unavailable"} detail="Click to open the agent workspace and its authority controls" onOpen={()=>onNavigate(workspace)} />
          <InspectorDatum label="Parent" value={active?.stable_id === "AGT-001" ? "Founder" : "AGT-001 · COO"} detail="Accountability relationship" onOpen={()=>onNavigate("Agent Network")} />
          <InspectorDatum label="Human owner" value="Authorized executive" detail="Open the centralized decision and approval register" onOpen={()=>onNavigate("Action Portal")} />
          <InspectorDatum label="Shared goal" value={active?.stable_id === "AGT-009" ? "GOAL-2026-009" : "GOAL-2026-001"} detail="Open the governed shared-goal register" onOpen={()=>onNavigate("Shared Goals")} />
          <InspectorDatum label="External action" value={active?.authority_level === "L1" ? "Human approval required" : "Governed boundary"} detail="Open system authority controls" onOpen={()=>onNavigate("Systems")} />
        </dl>
        <button type="button" className="network-open" onClick={()=>onNavigate(workspace)}>Open {workspace} →</button>
        <p className="network-help">Hover or focus for status and mission. Tap to inspect; double-click a node or use Open to enter its workspace.</p>
      </aside>
    </div>
  </section>;
}

function InspectorDatum({label,value,detail,onOpen}:{label:string;value:string;detail:string;onOpen:()=>void}) { return <div><dt>{label}</dt><dd><button type="button" title={detail} onClick={onOpen}>{value}<span>→</span></button></dd></div>; }

type AgentTone = "green" | "amber" | "red" | "gray";
function agentTone(status: string): AgentTone {
  if (/blocked|failed|error|attention/i.test(status)) return "red";
  if (/active|ready|live|approved/i.test(status)) return "green";
  if (/pilot|review|activation|required|pending/i.test(status)) return "amber";
  return "gray";
}
function shortAgentName(name: string) { return name.replace("Symbiont ","").replace(" Operations","").replace(" & Service Architecture"," Product").replace(" & Data Governance"," Security").replace("Marketing & Content","Marketing"); }
function agentWorkspace(id:string):View { return ({"AGT-001":"Overview","AGT-002":"Sales Operations","AGT-003":"Delivery Control","AGT-004":"Quality","AGT-005":"Knowledge","AGT-006":"Finance","AGT-007":"Research","AGT-008":"Reliability","AGT-009":"Opportunity Scout","AGT-010":"Product","AGT-011":"Marketing","AGT-012":"Technical Architecture","AGT-013":"Client Success","AGT-014":"Security & Data"} as Record<string,View>)[id] ?? "Agent Network"; }

function SharedGoals({ goals, agents, source }: { goals: Goal[]; agents: Agent[]; source: string }) { return <section><SectionLead kicker="Shared outcomes" title="One owner. Many contributors." body={`${source}. Goals preserve success measures, dependencies, decisions, work evidence, and append-only events.`} />{goals.map(g => <article className="goal-card" key={g.stable_id}><div><p className="eyebrow">{g.stable_id} · {g.priority}</p><h3>{g.objective}</h3><span className="status-chip">{g.status}</span></div><div className="goal-members"><p>ACCOUNTABLE OWNER</p><strong>{agents[0]?.stable_id} · {agents[0]?.name}</strong><p>CONTRIBUTOR</p><strong>{agents[1]?.stable_id} · {agents[1]?.name}</strong></div><div><p className="eyebrow">Success evidence</p><ul>{(g.success_metrics || []).map(m => <li key={m}>{m}</li>)}</ul><p className="empty-note">Recent events and work-item evidence appear when the live data plane is connected.</p></div></article>)}</section>; }

function SalesOperations({ opportunities, source, onStartResponse }: { opportunities: Opportunity[]; source: string; onStartResponse:(opportunity:Opportunity)=>void }) {
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const selected = opportunities.find(opportunity => opportunity.stable_id === selectedId) ?? null;
  const selectedEstimate = selected ? estimateForOpportunity({title:selected.name,scope:selected.scope,statedValue:selected.amount}) : null;
  const recordKind=source.startsWith("Live")?"authorized operational records":source.includes("Verified")?"verified published opportunity records":"demonstration records";
  return <section>
    <SectionLead kicker="AGT-002 · Sales operations" title="Qualified work, clean handoffs." body={`${source}. Values shown below are ${recordKind}. Select an opportunity to inspect it and start its governed response workflow.`} />
    <div className="sales-table"><div className="sales-head"><span>Opportunity</span><span>Qualification</span><span>Commercial</span><span>Next action</span><span>Governance</span></div>{opportunities.map(o => {
      const estimate=estimateForOpportunity({title:o.name,scope:o.scope,statedValue:o.amount});
      const weighted = Number(o.amount||estimate.total)*Number(o.probability||0)/100;
      const stale = Boolean(o.next_action_date && new Date(o.next_action_date)<new Date("2026-07-20"));
      return <button type="button" className={`sales-row sales-row-button ${selectedId === o.stable_id ? "selected" : ""}`} title={`Select ${o.name}`} onClick={()=>setSelectedId(o.stable_id)} key={o.stable_id}><div><p>{o.stable_id} · {o.stage}</p><strong>{o.name}</strong><small>{o.recommendation || "Not scored"}</small></div><div><b className="score-badge">{o.qualification_score ?? "—"}</b><small>/100</small></div><div><strong>{money(estimate.total)} ROM</strong><p>{o.probability || 0}% · {money(weighted)} weighted</p><small>{o.amount ? `${money(o.amount)} stated value · ` : ""}{estimate.confidence}% confidence</small></div><div><strong>{o.next_action || "Missing"}</strong><p className={stale ? "danger-text" : ""}>{o.next_action_date || "No date"}{stale ? " · STALE" : ""}</p></div><div><span className="status-chip">{estimate.decision}</span><p>{o.proposal_status}</p><small>{o.required_approvals?.length ? `${o.required_approvals.length} approval(s)` : "No open approval"}</small></div></button>;
    })}</div>
    {selected && selectedEstimate && <aside className="opportunity-brief-drawer sales-opportunity-drawer" role="dialog" aria-modal="true" aria-label={`Pipeline opportunity ${selected.name}`}><button type="button" className="drawer-close" onClick={()=>setSelectedId(null)} aria-label="Close pipeline opportunity">×</button><p className="eyebrow">Pipeline → Actions handoff</p><h3>{selected.name}</h3><p>{selected.stable_id} · {selected.stage} · {selected.client || "Client requires confirmation"}</p><div className="brief-scoreline pipeline-estimate-score"><div><span>Qualification</span><strong>{selected.qualification_score ?? "—"}</strong></div><div><span>ROM estimate</span><strong>{money(selectedEstimate.total)}</strong></div><div><span>Estimate confidence</span><strong>{selectedEstimate.confidence}%</strong></div><div><span>Bid signal</span><strong className="decision-text">{selectedEstimate.decision}</strong></div></div><section><p className="eyebrow">Estimate basis for bid / no-bid</p><p>The ROM combines restricted historical labor context, current BLS wage benchmarks, a GSA CALC+ market-review step, editable indirect assumptions, and provisional quantities. It is the same estimate package handed into Actions for the response price volume.</p><small className="drawer-estimate-note">{selectedEstimate.lines.length} lines · Market refresh due {selectedEstimate.refreshDue} · Human price approval required</small></section><section><p className="eyebrow">Next action</p><p>{selected.next_action || "Complete the governed qualification record."}</p></section><section><p className="eyebrow">Handoff behavior</p><p>This creates or selects one Action queue record with its requirements starter, knowledge-grounded response, linked background work products, compiled draft, delivery checklist, and shared estimate. It does not send, submit, or commit externally.</p></section><div className="brief-actions one-action"><button type="button" onClick={()=>onStartResponse(selected)}>Start governed response →</button></div></aside>}
  </section>;
}

function OpportunityScout({ data, onNavigate, onStartResponse }: { data: ScoutData | null; onNavigate:(view:View)=>void; onStartResponse:(opportunity:ScoutOpportunity)=>void }) {
  const [selectedBrief, setSelectedBrief] = useState<OpportunityKnowledgeBrief|null>(null);
  if (!data) return <section><SectionLead kicker="AGT-009 · Opportunity Scout" title="Evidence before pipeline." body="Loading the read-only opportunity surface. No scan, source connection, database write, or handoff is being simulated." /><div className="scout-loading">READ-ONLY DATA ADAPTER · CHECKING</div></section>;
  const isLive = data.source === "d1";
  const isVerified = isLive || data.source === "verified_snapshot";
  const visible = data.opportunities;
  const verified = isVerified ? visible.length : 0;
  const qualified = isVerified ? visible.filter(item => item.route === "sales_operations").length : 0;
  const leadTimes = visible.filter(item => item.deadlineAt).map(item => Math.ceil((new Date(item.deadlineAt!).getTime() - new Date("2026-07-20T00:00:00Z").getTime()) / 86400000)).filter(days => days >= 0);
  const medianLead = leadTimes.length ? [...leadTimes].sort((a,b)=>a-b)[Math.floor(leadTimes.length/2)] : null;
  const averageScore = visible.length ? Math.round(visible.reduce((sum,item)=>sum+item.totalScore,0)/visible.length) : 0;
  const averageConfidence = visible.length ? Math.round(visible.reduce((sum,item)=>sum+item.confidence,0)/visible.length) : 0;
  const sourceCategories = new Set(data.monitoringQueries.map(query => query.sourceCategory)).size;
  const briefOpportunity = selectedBrief ? visible.find((item)=>item.id===selectedBrief.opportunityId) : null;

  return <section className="scout-view">
    <div className="scout-hero"><div><p className="eyebrow">AGT-009 · Opportunity Scout</p><h2>Evidence before<br/><em>pipeline.</em></h2><p>Canonical-source verification, reproducible fit scoring, amendment-aware deduplication, and governed routing to AGT-002.</p></div><div className="scout-activation"><span className={`dot ${isVerified ? "green" : "amber"}`} /><div><strong>{isLive ? "Live D1 records" : isVerified ? "Verified published snapshot" : "Demonstration mode"}</strong><p>{data.activation}</p></div></div></div>
    {!isVerified && <div className="demo-disclosure"><b>DEMONSTRATION DATA</b><span>These records and monitoring queries are illustrative. No live scan, source connection, database write, or AGT-002 handoff occurred.</span></div>}
    <div className="scout-metrics">
      <Metric label="Source coverage" value={isVerified ? String(sourceCategories).padStart(2,"0") : "00"} note={`${sourceCategories} ${isVerified ? "active" : "planned demo"} categories`} />
      <Metric label="Verified opportunities" value={String(verified).padStart(2,"0")} note={isLive ? "Canonical evidence in D1" : isVerified ? "Approved official-source snapshot" : `${visible.length} demonstration records`} />
      <Metric label="Qualified handoffs" value={String(qualified).padStart(2,"0")} note={isVerified ? "Score 70+ routed" : "None sent"} />
      <Metric label="Deadline lead time" value={medianLead === null ? "—" : `${medianLead}d`} note={isVerified ? "Median verified lead" : "Demonstration median"} />
      <Metric label="Average fit" value={String(averageScore)} note="Weighted /100" />
      <Metric label="Evidence confidence" value={`${averageConfidence}%`} note={isVerified ? "Verified records" : "Demonstration scoring"} />
    </div>
    <div className="scout-layout">
      <div className="scout-opportunities"><PanelTitle kicker="Opportunity register" title="Verified, watch, archive" />{visible.map(item => { const brief=matchOpportunityToKnowledge(item); return <article className="scout-opportunity" key={item.id}>
        <div className="scout-score"><strong>{item.totalScore}</strong><span>/100</span><i className={`route-dot ${item.route}`} /></div>
        <div className="scout-main"><div className="scout-titleline"><div><p>{item.id} · {item.procurementType}{item.isDemonstration ? " · DEMO" : ""}</p><h3>{item.title}</h3><span>{item.issuer} · {item.location || "Location unknown"}</span></div><b className={`route-chip ${item.route}`}>{routeLabel(item.route)}</b></div><p className="scout-fit">{item.fitRationale}</p><div className="capability-match-row">{brief.matches.slice(0,4).map((match)=><button type="button" key={match.id} title={`${match.summary} ${match.kind === "historical" ? `${match.evidenceCount} ${match.evidenceUnit}.` : "New company prerogative."}`} onClick={()=>setSelectedBrief(brief)}><span>{match.kind === "historical" ? "HISTORY" : "NEW"}</span>{match.label}<b>{match.relevance}%</b></button>)}</div><div className="scout-facts"><button type="button" title="Open the evidence brief for deadline context" onClick={()=>setSelectedBrief(brief)}>DEADLINE <b>{formatDeadline(item.deadlineAt, item.deadlineTimezone)}</b></button><button type="button" title="Open value evidence and missing information" onClick={()=>setSelectedBrief(brief)}>VALUE <b>{item.statedValue ? money(item.statedValue) : "Not stated"}</b></button><button type="button" title="Confidence measures source reliability, not desirability" onClick={()=>setSelectedBrief(brief)}>CONFIDENCE <b>{item.confidence}%</b></button><button type="button" title={item.sourceKind} onClick={()=>setSelectedBrief(brief)}>FRESHNESS <b>{item.freshness}</b></button></div><div className="scout-risk"><button type="button" title="Open the complete risk and evidence brief" onClick={()=>setSelectedBrief(brief)}><span>RISKS</span><p>{item.risks.length ? item.risks.join(" · ") : "None recorded"}</p></button><button type="button" title="Open the missing-information and source checklist" onClick={()=>setSelectedBrief(brief)}><span>MISSING</span><p>{item.missingInformation.length ? item.missingInformation.join(" · ") : "None recorded"}</p></button></div><div className="scout-next"><span>{item.handoffStatus}</span><p>{item.nextAction}</p><div><button type="button" onClick={()=>setSelectedBrief(brief)}>Open knowledge brief →</button><a href={item.canonicalUrl} target="_blank" rel="noreferrer">Canonical source ↗</a></div></div></div>
      </article>; })}</div>
      <aside className="monitoring-panel"><PanelTitle kicker="Monitoring queries" title="Coverage plan" /><p className="monitoring-note">{isVerified ? "Active weekday monitoring uses official public sources and stops at every access or procurement boundary." : "Queries remain inactive until their sources, terms, cadence, and authenticated runtime are approved."}</p>{data.monitoringQueries.map(query => <article className="query-row" key={query.id}><div><span>{query.id}</span><b>{query.status}</b></div><h3>{query.name}</h3><p>{query.queryText}</p><dl><div><dt>Sources</dt><dd>{query.sourceCategory}</dd></div><div><dt>Cadence</dt><dd>{query.cadence}</dd></div><div><dt>Access</dt><dd>{query.requiresAuthentication ? "Authentication boundary" : "Public-source review"}</dd></div></dl></article>)}</aside>
    </div>
    {selectedBrief&&briefOpportunity&&<aside className="opportunity-brief-drawer" role="dialog" aria-modal="true" aria-label={`Opportunity brief for ${briefOpportunity.title}`}><button type="button" className="drawer-close" onClick={()=>setSelectedBrief(null)} aria-label="Close opportunity brief">×</button><p className="eyebrow">Knowledge-grounded opportunity brief</p><h3>{briefOpportunity.title}</h3><a href={briefOpportunity.canonicalUrl} target="_blank" rel="noreferrer">Open official source ↗</a><div className="brief-scoreline"><button type="button" title="Fit score from the governed opportunity record"><span>Opportunity fit</span><strong>{briefOpportunity.totalScore}</strong></button><button type="button" title="Open the historical capability evidence" onClick={()=>onNavigate("Knowledge")}><span>Historical continuity</span><strong>{selectedBrief.continuityScore}</strong></button><button type="button" title="Confidence measures source quality, not desirability"><span>Evidence confidence</span><strong>{briefOpportunity.confidence}%</strong></button></div><section><p className="eyebrow">Project brief</p><p>{selectedBrief.projectBrief}</p></section><section><p className="eyebrow">Historical matches + new prerogatives</p>{selectedBrief.matches.map((match)=><button type="button" className="brief-match" title={`${match.summary} Open the Knowledge library to inspect and connect full source files.`} onClick={()=>onNavigate("Knowledge")} key={match.id}><span>{match.kind === "historical" ? "Historical evidence" : "New prerogative"}</span><b>{match.label}</b><small>{match.kind === "historical" ? `${match.evidenceCount} ${match.evidenceUnit}` : "New company prerogative"} · {match.relevance}% relevance</small></button>)}</section><section><p className="eyebrow">Evidence-grounded starter text</p><blockquote>{selectedBrief.starterNarrative}</blockquote></section><section><p className="eyebrow">Next action</p><p>{briefOpportunity.nextAction}</p><ul>{briefOpportunity.missingInformation.map((item)=><li key={item}>{item}</li>)}</ul></section><div className="brief-actions"><button type="button" onClick={()=>onNavigate("Knowledge")}>Open full-file knowledge →</button><button type="button" onClick={()=>onStartResponse(briefOpportunity)}>Start governed response →</button></div><p className="brief-warning">{selectedBrief.evidenceWarning}</p></aside>}
    <div className="handoff-strip"><div><p className="eyebrow">Governed route</p><strong>AGT-009</strong><span>Discovery + evidence</span></div><i>→</i><div><p className="eyebrow">Acceptance gate</p><strong>AGT-002</strong><span>Qualification + pursuit</span></div><i>↗</i><div><p className="eyebrow">Escalation</p><strong>AGT-001</strong><span>Priority + authority conflicts</span></div><b>{isVerified ? `${qualified} routed` : "No live handoff"}</b></div>
  </section>;
}

function SystemsView({ connection, runs, handoffs }: { connection: Connection; runs: Array<Record<string,unknown>>; handoffs: Array<Record<string,unknown>> }) { return <section><SectionLead kicker="System controls" title="Authority enforced below the prompt." body="Application checks, database policies, atomic claims, leases, idempotency, audit events, and human approval gates govern execution." /><div className="control-grid"><Control name="Organization-scoped RLS" status="Implemented" /><Control name="Atomic claim + lease recovery" status="Implemented" /><Control name="Append-only goal events" status="Implemented" /><Control name="Human material-decision approval" status="Implemented" /><Control name="Shared Supabase runtime" status={connection === "connected" ? "Connected" : "Not configured"} /><Control name="OpenAI Responses runtime" status={connection === "connected" ? "Connection-dependent" : "Unavailable"} /><Control name="Recorded agent runs" status={String(runs.length)} /><Control name="Inter-agent handoffs" status={String(handoffs.length)} /></div></section>; }
function CommandPanel({ agentId, setAgentId, command, setCommand, submit, connection, demoMode, runState, answer }: { agentId:string; setAgentId:(v:string)=>void; command:string; setCommand:(v:string)=>void; submit:(e:FormEvent)=>void; connection:Connection; demoMode:boolean; runState:string; answer:string }) { return <section className="command-panel"><div><p className="eyebrow">14-agent command panel</p><h2>Ask the network.</h2><p>{demoMode?"Demo responses exercise each agent charter without reading or changing a live system.":"Commands run through the governed server runtime. Unavailable services fail explicitly; no response is fabricated."}</p></div><form onSubmit={submit}><label htmlFor="agent-select">Agent</label><select id="agent-select" value={agentId} onChange={e=>setAgentId(e.target.value)}>{publishedAgents.map(agent=><option value={agent.stable_id} key={agent.stable_id}>{agent.stable_id} · {agent.name}</option>)}</select><label htmlFor="command">Command</label><textarea id="command" value={command} onChange={e=>setCommand(e.target.value)} placeholder="Request a project brief, opportunity match, research finding, control review, narrative, or governed handoff…"/><button type="submit" disabled={(!demoMode&&connection!=="connected")||runState==="running"}>{runState==="running"?"Running…":demoMode?"Run demo agent":connection==="connected"?"Run governed analysis":"Runtime unavailable"}</button></form>{answer && <div className={`runtime-answer ${runState}`}><b>{runState === "error" ? "SAFE FAILURE" : `${agentId}${demoMode?" · DEMO":""}`}</b><p>{answer}</p></div>}</section>; }

function StateRow({label,state,tone}:{label:string;state:string;tone:string}) { return <div className="state-row"><span>{label}</span><b><i className={`dot ${tone}`}/>{state}</b></div>; }
function Metric({label,value,note,tone="neutral",detail,onOpen}:{label:string;value:string;note:string;tone?:string;detail?:string;onOpen?:()=>void}) { const content=<><div className="metric-top"><span>{label}</span><i>↗</i></div><strong>{value}</strong><p className={tone}>{note}</p></>; return onOpen?<button type="button" className="metric-card metric-button" title={detail} onClick={onOpen}>{content}</button>:<article className="metric-card" title={detail}>{content}</article>; }
function PanelTitle({kicker,title}:{kicker:string;title:string}) { return <div className="panel-header"><div><p className="eyebrow">{kicker}</p><h3>{title}</h3></div></div>; }
function Focus({n,text}:{n:string;text:string}) { return <div className="focus-row"><span className="focus-rank green">{n}</span><div><strong>{text}</strong><p>Explicit human approval required</p></div></div>; }
function SectionLead({kicker,title,body}:{kicker:string;title:string;body:string}) { return <div className="section-lead"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{body}</p></div>; }
function Control({name,status}:{name:string;status:string}) { return <article><span>{name}</span><strong>{status}</strong></article>; }
function money(value:number) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0,notation:value>=1_000_000?"compact":"standard"}).format(value); }
function routeLabel(route:ScoutOpportunity["route"]) { return route === "sales_operations" ? "Route to AGT-002" : route === "watchlist" ? "Watchlist" : "Archive"; }
function formatDeadline(value?:string|null, timezone?:string|null) { if (!value) return "Not stated"; try { return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short",timeZone:timezone || "UTC"}).format(new Date(value)); } catch { return value; } }
function demoAgentResponse(agentId:string,command:string) { const agent=publishedAgents.find(item=>item.stable_id===agentId); return `[DEMONSTRATION — NO LIVE ACTION] ${agent?.name??agentId} accepted the request: “${command.trim()}”\n\nDraft outcome: I would use the governed knowledge base, cite the exact historical files or label the item as a new company prerogative, separate verified facts from assumptions, and route the result to the accountable agent. No external contact, pricing, commitment, publication, database write, or file upload occurred.\n\nNext gate: connect or open the supporting full files, confirm current qualifications, and obtain authorized human approval before client-facing use.`; }

# Symbiont

Symbiont is building the operating system for buildings: connecting physical assets, reality capture, BIM, digital twins, IoT, building data, artificial intelligence, and operational decision-making.

## Current Agent Architecture

The current full-build registry contains 14 numbered agents, `AGT-001` through `AGT-014`. The governed Action Workflow coordinates their work but is an orchestration layer, not a separate `AGT-015` agent.

`AGT-001` reports to the Founder or authorized executive; every domain agent reports to `AGT-001`. L1 agents draft and recommend. L2 agents may also perform narrowly bounded, reversible internal actions. External communications, pricing, contracts, payments, production changes, material risk acceptance, and other consequential commitments remain human approval gates.

| Agent | Operating lane | Authority | Mission | Command Center surface |
|---|---|---:|---|---|
| `AGT-001` Symbiont COO | Govern | L2 | Coordinate company operations, priorities, standards, and agent work. | Overview, Agent Network, Shared Goals, Systems |
| `AGT-002` Sales Operations | Core workflow | L1 | Convert qualified client needs into profitable, repeatable work. | Pipeline |
| `AGT-003` Delivery Control | Core workflow | L1 | Coordinate project authorization, delivery health, exceptions, changes, quality gates, and closeout. | Projects, Delivery Control |
| `AGT-004` QA/QC | Assure | L1 | Independently validate exact deliverable versions against approved requirements and release gates. | Quality |
| `AGT-005` Knowledge Steward | Assure | L2 | Maintain an evidence-backed, searchable, governed source of operating truth. | Knowledge |
| `AGT-006` Finance Operations | Advise | L1 | Turn approved accounting and operating data into reconciled visibility, forecasts, and draft financial controls. | Finance |
| `AGT-007` Research | Discover | L1 | Turn primary sources, historical evidence, and market signals into decision-ready findings with explicit confidence. | Research |
| `AGT-008` Automation Reliability | Assure | L2 | Detect automation failures, contain impact, preserve evidence, and coordinate verified recovery. | Reliability |
| `AGT-009` Opportunity Scout | Discover | L1 | Discover, verify, match, and route public opportunities against governed capabilities and company priorities. | Opportunity Scout |
| `AGT-010` Product & Service Architecture | Advise | L1 | Convert recurring delivery knowledge into repeatable, measurable, profitable building-intelligence products. | Product |
| `AGT-011` Marketing & Content Operations | Discover | L1 | Turn approved knowledge and outcomes into evidence-backed marketing assets and qualified demand. | Marketing |
| `AGT-012` Technical Architecture | Advise | L1 | Define interoperable, secure, scalable, and supportable building-intelligence architectures. | Technical Architecture |
| `AGT-013` Client Success | Advise | L1 | Protect client outcomes from onboarding through value realization, renewal, and expansion routing. | Client Success |
| `AGT-014` Security & Data Governance | Assure | L1 | Protect Symbiont and client data while enabling authorized work through governed controls. | Security & Data |

### How the network operates

- The [published agent catalog](apps/command-center/app/page.tsx) is reconciled with live Supabase agent rows by stable ID so every implemented role remains visible without treating missing live data as successful execution.
- The [shared agent data plane](supabase/migrations/202607200001_shared_agent_data_plane.sql) governs organizations, agents, goals, work, runs, messages, decisions, evidence, memory, opportunities, and handoffs.
- Bounded operational modules use D1 and Drizzle; Supabase/PostgreSQL remains the organization-scoped governance plane.
- The [Action Workflow](docs/SYM-OPS-DES-003_action-workflow-interface_2026-07-21_v1.0.md) coordinates opportunity intake, qualification, response development, approvals, delivery, QA/QC, and closeout across the network.
- Human approval remains mandatory wherever work becomes external, commercial, contractual, financial, production-impacting, irreversible, or materially risky.

## Repository-Scoped Agents

Codex automatically discovers the packaged agent skills under `.agents/skills`. The Symbiont COO skill is the governing entry point for portfolio-level work.

Invoke it in Codex with:

```text
$symbiont-coo
```

Example:

```text
$symbiont-coo Review the active projects and opportunities, then produce today's Executive Daily Brief with priorities, risks, decisions, and next actions.
```

The agent includes:

- The founding COO charter
- Knowledge-base and document-control architecture
- Ten core operating procedures
- Executive dashboard specification
- Decision-log governance
- AI-agent authority and communication protocols
- Ranked automation backlog
- Ninety-day operating roadmap
- Starter project, opportunity, risk, decision, and automation registers

The COO skill is located at `.agents/skills/symbiont-coo`. Each packaged skill defines its agent's mission, operating procedure, authority boundary, escalation rules, references, and reusable templates. Project custom-agent definitions are stored under `.codex/agents` where available.

## Executive Command Center

The responsive application is located at `apps/command-center`. It provides navigable operating views for:

- Executive priorities, performance indicators, and accountable shared goals
- A governed 14-agent network with explicit missions, parents, authority, and status
- Opportunity discovery, qualification, pipeline, response, and project handoffs
- Delivery, quality, knowledge, finance, research, product, marketing, client-success, reliability, architecture, and security workspaces
- Approval-aware actions, decisions, evidence timelines, and release gates
- Explicit live, demonstration, disconnected, and authorization-required states

The production application is available at [symbiont-three.vercel.app](https://symbiont-three.vercel.app).

Microsoft Entra ID is the browser access boundary for the Command Center. See the [Microsoft Entra setup guide](docs/AZURE_ENTRA_AUTH_SETUP.md) for the required single-tenant app registration, redirect URIs, and server-side deployment variables.

The interface reads one organization-scoped Supabase/PostgreSQL data plane when securely configured and otherwise uses clearly labeled harmless demonstration records without simulating runtime success.

The primary navigation is outcome-first: Overview, Actions, Pipeline, and Projects. Discover, Advise, and Assure workspaces are consolidated beneath Background Agents. The Actions workspace monitors work from opportunity intake through closeout with stage-specific handoffs, recommendations, sourced input fields, approval gates, and an activity/evidence timeline. See the [Action Workflow Interface](docs/SYM-OPS-DES-003_action-workflow-interface_2026-07-21_v1.0.md) for the operating contract and persistence roadmap, and the [Command Center README](apps/command-center/README.md) for runtime and verification commands.

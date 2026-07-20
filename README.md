# Symbiont

Symbiont is building the operating system for buildings: connecting physical assets, reality capture, BIM, digital twins, IoT, building data, artificial intelligence, and operational decision-making.

## COO Agent

This repository includes the Symbiont COO agent as a repository-scoped Codex skill.

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

The agent is located at `.agents/skills/symbiont-coo`. Codex discovers repository-scoped skills automatically when working in this repository.

## Executive Command Center

The responsive COO front end is located at `apps/command-center`. It provides navigable operating views for:

- Executive priorities and performance indicators
- Active project health and delivery gates
- Sales pipeline and productization opportunities
- Material decisions and approval status
- Automation sequencing and system readiness
- An interactive COO command-panel prototype

The production application is available at [symbiont-three.vercel.app](https://symbiont-three.vercel.app).

The interface now includes the Agent Network, Shared Goals, Sales Operations, governed command panel, and explicit live/disconnected states. It reads one organization-scoped Supabase/PostgreSQL data plane when securely configured and otherwise uses clearly labeled harmless demonstration records without simulating runtime success.

## Sales Operations Agent

Invoke AGT-002 with `$symbiont-sales-ops`. The repository skill is located at `.agents/skills/symbiont-sales-ops`, and the matching project custom-agent definition is `.codex/agents/symbiont-sales-ops.toml`. AGT-002 operates at L1 — Draft and Recommend and requires human approval for external communications, pricing, proposals, contractual statements, and material commitments.

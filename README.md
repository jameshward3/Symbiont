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

## Knowledge Steward Agent

Invoke AGT-005 with `$symbiont-knowledge-steward`. It governs controlled knowledge metadata, lifecycle, versions, supersession, access-aware retrieval, quality, review schedules, archive history, and source-of-truth conflicts at narrowly bounded L2 authority. The Command Center includes a dedicated Knowledge view and read-only D1 adapter. Historical “Exchange” files are not connected until they are uploaded; demonstration metadata is labeled throughout.

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

The primary navigation is outcome-first: Overview, Actions, Pipeline, Projects, and Decisions. Specialist and utility workspaces are consolidated beneath Background Agents. The Actions workspace monitors work from opportunity intake through closeout with stage-specific handoffs, recommendations, sourced input fields, approval gates, and an activity/evidence timeline. See [Action Workflow Interface](docs/SYM-OPS-DES-003_action-workflow-interface_2026-07-21_v1.0.md) for the operating contract and persistence roadmap.

## Sales Operations Agent

Invoke AGT-002 with `$symbiont-sales-ops`. The repository skill is located at `.agents/skills/symbiont-sales-ops`, and the matching project custom-agent definition is `.codex/agents/symbiont-sales-ops.toml`. AGT-002 operates at L1 — Draft and Recommend and requires human approval for external communications, pricing, proposals, contractual statements, and material commitments.

## Opportunity Scout Agent

Invoke AGT-009 with `$symbiont-opportunity-scout`. The repository skill is located at `.agents/skills/symbiont-opportunity-scout`. It verifies official sources, scores and deduplicates opportunities, and prepares governed handoffs to AGT-002 at L1 authority. The Command Center includes a dedicated Opportunity Scout view and read-only D1 adapter. Demonstration records are explicitly labeled; live scanning, source schedules, agent registration, and handoff writes remain inactive until approved runtime activation.

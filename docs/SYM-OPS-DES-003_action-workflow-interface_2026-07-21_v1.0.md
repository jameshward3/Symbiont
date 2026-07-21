# Action Workflow Interface

**Document ID:** SYM-OPS-DES-003  
**Owner:** Symbiont COO / Product System Owner  
**Status:** Active  
**Version:** 1.0  
**Effective date:** 2026-07-21  
**Classification:** Internal  
**Review date:** 2026-08-21  
**Source:** `apps/command-center/app/workflow-portal.tsx`

## Decision

The Command Center is organized around operating outcomes rather than agent identities. Overview, Actions, Pipeline, Projects, and Decisions remain primary. Agent-specific and specialist workspaces are consolidated beneath **Background Agents** and grouped as Discover, Advise, Assure, and Govern.

Healthy background work remains quiet. An agent becomes visible in the primary Actions experience only when it produces a recommendation, needs input or approval, detects an exception, or creates a governed handoff.

## Controlled lifecycle

`Opportunity intake -> Qualification -> Bid / no-bid -> RFP / RFQ response -> Agreement -> Project kickoff -> Delivery -> QA / QC -> Closeout`

Each stage has one accountable agent, one release gate, and one explicit next-stage action. A positive transition requires:

1. Required human approvals completed.
2. Current release gate confirmed.
3. Evidence retained in an approved system of record.
4. Activity event recorded with actor, time, outcome, and evidence.
5. Accountability transferred to the next agent.

Return for revision and pause do not advance the lifecycle.

## Actions workspace

The Actions workspace contains:

- Filtered queues for attention, approvals, risks, active work, and closed work.
- Lifecycle rail from lead intake through closeout.
- Agent recommendation, rationale, confidence, and current owner.
- Editable auto-populated fields with source and confidence metadata.
- Required approval checklist and release-gate confirmation.
- Stage-specific action buttons that describe the actual handoff.
- Human-readable activity and evidence timeline.
- Expandable raw event log for diagnosis and audit review.
- Pause, return-for-revision, Notion linking, and controlled closeout actions.

## Authority boundaries

Agents default to draft and recommendation authority. Pricing, external response issue, agreements, client commitments, material risk acceptance, and closeout acceptance require authorized human approval. UI confirmation is not a substitute for an authoritative approval record.

## Current release boundary

This release establishes the production interface and governed interaction contract. Demonstration records are labeled and operate in client state. The next release must persist stage transitions, approvals, field provenance, and events to the governed data plane before they are treated as authoritative operating records.

## Priorities

### P0 — Authoritative persistence

- Add authenticated workflow read/write endpoints.
- Persist stage, owner, status, approvals, recommendations, provenance, and events.
- Enforce one-stage transitions and human-approval requirements server-side.
- Use idempotency keys and append-only audit events.

### P1 — Unified operating records

- Map Opportunity Scout records into intake automatically.
- Convert approved opportunities into governed project records without re-entry.
- Link delivery, QA/QC, closeout, and Client Success evidence to the same record.
- Add role-based “My actions” ownership and notification counts.

### P2 — Operational intelligence

- Add cycle-time, aging, conversion, approval-latency, and exception metrics.
- Add saved filters, search, bulk triage, and due-date escalation.
- Add accessibility and browser regression coverage for the workflow.

## Success measures

- One visible queue for all work requiring human attention.
- No opportunity or project is advanced without recorded gate evidence.
- Every handoff has one accountable owner and timestamp.
- Auto-populated values show source and confidence.
- Background-agent health remains available without dominating primary navigation.
- Lead-to-closeout cycle time and approval latency become measurable after persistence is enabled.

## Verification

Release verification requires unit tests, TypeScript, lint, Vinext production build, Vercel Next.js build, rendered HTML tests, responsive visual review, GitHub commit/PR evidence, Vercel deployment evidence, and Notion source-of-truth updates.

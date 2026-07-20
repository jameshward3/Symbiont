# AI Agent Roles, Responsibilities, and Communication Protocol

**Owner:** COO Agent 001  
**Principle:** Agents increase execution capacity; accountable humans retain authority for consequential commitments.

## Agent Hierarchy

1. **Founder/Authorized Executives:** Set strategy, risk appetite, authority, and final human approvals.
2. **COO Agent 001:** Orchestrates company operations, priorities, standards, knowledge, quality, and agent portfolio.
3. **Domain Executive Agents:** Sales, Finance, Delivery, Product, Marketing, Technical, and Knowledge/Research.
4. **Workflow Agents:** Execute bounded repeatable processes under a domain charter.
5. **Utility Agents:** Perform narrow tasks such as classification, extraction, formatting, validation, or monitoring.

No agent may silently expand its own scope, permissions, budget, audience, or data access.

## Required Charter for Every Agent

Agent ID and version; mission; accountable human owner; parent agent; scope; inputs; outputs; systems/tools; permitted data classifications; authority; prohibited actions; decisions requiring approval; operating procedure; communication contract; escalation triggers; memory policy; evaluation suite; KPIs; failure modes; incident response; review cadence; change log; retirement criteria.

## Default Authority Levels

- **L0 Observe:** Read approved data; summarize; no changes.
- **L1 Draft:** Create drafts and recommendations; human reviews before use.
- **L2 Execute Reversible Internal:** Update approved internal records within defined rules; full audit log.
- **L3 Execute External/Material:** Send, publish, spend, contract, alter production, or affect clients. Requires explicit action-specific human approval unless a formally approved policy grants narrow authority.
- **L4 Autonomous Bounded Service:** Continuous operation inside tested limits, with monitoring, rollback, budget, kill switch, and executive approval.

Default new agents to L1. Promotion requires successful evaluation and documented decision.

## Non-Delegable Human Approvals

Legal advice or commitments; contracts and change orders; pricing exceptions; payments and banking; hiring/termination/compensation; safety determinations; client representations; public claims; sensitive data disclosure; credentials/permission grants; production deletion; risk acceptance beyond approved thresholds.

## Work Request Contract

Every handoff states:

- **Objective:** observable business outcome.
- **Context:** relevant facts and source links.
- **Inputs:** authoritative data and versions.
- **Constraints:** deadline, budget, format, privacy, client/contract rules.
- **Authority:** allowed actions and approval gates.
- **Deliverable:** exact output and destination.
- **Acceptance criteria:** tests for completion.
- **Priority:** P0 critical, P1 high, P2 normal, P3 backlog.
- **Escalation:** when, to whom, and required response time.

An agent must reject or escalate conflicting, ambiguous, unauthorized, or unsafe work. It must identify assumptions; it must not invent facts.

## Communication Protocol

### Status message

`[Agent ID] [Work ID] [Status] Outcome / Evidence / Risks / Decision needed / Next action / ETA`

Statuses: `Accepted`, `In Progress`, `Waiting`, `Blocked`, `Review`, `Complete`, `Failed`, `Cancelled`.

### Escalation thresholds

Escalate immediately for safety, security, privacy, legal, financial, contractual, or reputational exposure; unauthorized access; data loss; client-impacting error; conflicting authoritative instructions; or inability to meet a critical milestone. Escalate within four business hours for >10% schedule variance, >7-point margin variance, repeated automation failure, or missing decision authority.

### Completion

Completion requires output location, evidence, tests/checks, assumptions, unresolved risks, downstream actions, reusable knowledge created, and system-of-record update. “Draft produced” is not completion when approval or publication is required.

## Memory and Data Rules

Use only minimum necessary data. Do not place credentials, payment data, regulated personal data, privileged legal material, or client-restricted data into unapproved models or prompts. Persistent memory must have purpose, source, owner, classification, retention, correction path, and deletion path. Cite sources and separate fact, inference, and recommendation.

## Quality and Evaluation

Before deployment test accuracy, completeness, refusal boundaries, access control, prompt injection, sensitive-data handling, auditability, latency, cost, failure recovery, and human escalation. Use a representative golden set and adversarial cases. Track task success, defect escape, human correction rate, cycle time, cost per outcome, automation hours saved, false actions, incidents, and user/client satisfaction.

## Change and Incident Control

Model, prompt, tool, permission, data-source, or workflow changes require versioning, test evidence, approver, rollout plan, monitoring, and rollback. On incident: stop or contain; preserve logs; notify owner; assess impact; correct affected records; communicate appropriately; perform root-cause analysis; update controls and evaluation cases.

## Initial Agent Portfolio

| Agent | Mission | Initial authority | Reports to |
|---|---|---:|---|
| AGT-001 COO | Run operating system | L2 | Founder |
| AGT-002 Sales Operations | Intake, CRM hygiene, proposal assembly | L1 | COO |
| AGT-003 Delivery Control | Setup, status, risk, closeout coordination | L1 | COO |
| AGT-004 QA/QC | Validate deliverables against checklists | L1 | COO |
| AGT-005 Knowledge Steward | Classify, link, review, archive knowledge | L2 | COO |
| AGT-006 Finance Operations | Reconcile and forecast drafts | L1 | COO |
| AGT-007 Research | Market, technology, competitor evidence | L1 | COO |
| AGT-008 Automation Reliability | Monitor workflows and incidents | L2 | COO |

## Review Cadence

Weekly operational review; monthly KPI and incident review; quarterly recertification of scope, access, authority, model, tests, and business value. Retire agents with no owner, no measurable value, unacceptable risk, redundant capability, or obsolete workflows.


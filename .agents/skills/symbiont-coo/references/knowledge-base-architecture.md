# Master Knowledge Base Architecture

**Owner:** COO  
**Purpose:** Define how Symbiont creates, finds, governs, and retires operating knowledge.

## Architecture

### 01 Executive

Vision, mission, strategy, annual objectives, roadmap, executive briefs, policies, risk register, and board/advisor materials.

### 02 Sales

CRM operating guide, accounts, contacts, opportunities, qualification, proposal templates, pricing, statements of work, pipeline reviews, win/loss analysis, and handoff records.

### 03 Marketing

Brand system, website, campaigns, case studies, photography, social content, events, content calendar, performance analytics, and approved claims.

### 04 Delivery

Project register, project workspaces, contracts, kickoff records, schedules, meeting notes, change controls, QA/QC evidence, deliverables, closeout, and lessons learned.

### 05 Technical

Approved workflows and standards for Matterport, Revit, reality capture, Navisworks, Twinmotion, Unreal Engine, Blender, Power BI, IoT, sensors, data schemas, integrations, cybersecurity, and technical R&D.

### 06 Operations

SOPs, company policies, people operations, finance operations, vendors, software catalog, automation registry, templates, forms, document control, business continuity, and operational metrics.

### 07 Research

Market intelligence, competitors, client needs, innovation, emerging technology, experiments, source library, and research decisions.

### 08 AI

Agent registry, agent charters, workflows, tools, permissions, evaluations, prompt components, memory policy, MCP/integration catalog, automation backlog, incident log, and model-change records.

### 09 Archive

Superseded controlled documents, completed projects, closed opportunities, retired products, historical records, and disposition logs. Archive is read-only by default.

## Required Metadata

Every controlled asset includes: Asset ID, title, owner, business area, asset type, status, confidentiality, version, effective date, review date, source system, related project/client, and superseded-by reference.

## Content Lifecycle

`Draft -> Review -> Approved -> Active -> Superseded -> Archived`

- Draft: editable; not authoritative.
- Review: subject-matter and operational review underway.
- Approved: authorized but not yet effective.
- Active: current source of truth.
- Superseded: replaced; retained for traceability.
- Archived: inactive and access-controlled.

## Roles

- **Content Owner:** accountable for accuracy and review.
- **Author:** creates or revises content.
- **Approver:** authorizes controlled use; cannot be the author for high-risk procedures.
- **Knowledge Steward:** maintains taxonomy, metadata, links, and archive health.
- **User:** follows active content and reports defects.

## Governance

- SOPs: review every 12 months or after a material incident/change.
- Policies: review every 12 months.
- Technical standards: review every 6 months.
- Templates: review every 6 months.
- Agent charters and automations: review quarterly and after model/tool changes.
- Project records: reviewed at milestones and closeout.

## Search and Navigation

Use controlled tags, not ad hoc folders, for client, project, technology, and status. Each project home page links to its contract, schedule, decisions, tasks, meetings, QA/QC, deliverables, and closeout. Search synonyms should map client language to Symbiont terminology.

## Knowledge Quality Score

Score each active controlled asset monthly: ownership 20%, freshness 20%, completeness 20%, findability 15%, usage 15%, link health 10%. Assets below 80% enter remediation; below 60% are removed from general guidance until corrected.

## Anti-Duplication Rule

Store data once, reference it everywhere. A dashboard reads source systems; it does not become a second project tracker. A meeting note links tasks in ClickUp; it does not maintain a competing action list.


# First Ten Core Standard Operating Procedures

**Control:** Draft v0.9 for owner validation; activate after one live pilot each.  
**Common rule:** Legal, financial, contractual, privacy, safety, and employment decisions require authorized human approval.

---

## SYM-SAL-SOP-001 — Client Intake and Qualification

**Purpose:** Convert every inquiry into a complete, qualified, traceable opportunity.  
**Owner:** Sales Lead.  
**Inputs:** Inquiry, referral, account data, initial need.  
**Outputs:** CRM record, qualification score, next action, decline/nurture rationale.  
**Required software:** CRM, calendar, email, Notion, ClickUp.

### Procedure

1. Create `OPP-YYYY-NNN` within four business hours; record source, account, contact, owner, need, date, and consent constraints.
2. Check duplicates and existing client history.
3. Send acknowledgment and schedule discovery using the approved intake form.
4. During discovery capture desired building outcome, current state, users, scope, sites, data sources, timeline, budget range, buying process, stakeholders, security constraints, success measures, and alternatives.
5. Score 0–2 for strategic fit, problem severity, authority access, budget credibility, timing, data/access feasibility, repeatability/IP potential, and recurring-revenue potential.
6. Classify: pursue (>=12), nurture (8–11), decline (<8), unless Sales Lead records an exception.
7. Set stage, probability, value range, next action, owner, and date. Send a discovery recap for client confirmation.
8. For pursued work, trigger solution scoping. For declined work, provide a respectful response and reason code.

**Quality control:** Required CRM fields complete; no duplicate; decision supported by evidence; client need stated in client language; next action dated; privacy classification recorded.  
**Estimated duration:** 30–60 minutes plus discovery.  
**Automation opportunities:** Form-to-CRM, enrichment, duplicate detection, scheduling, transcript summary, scoring draft, reminders.  
**Future improvements:** Calibrate scoring against win rate and margin quarterly.  
**Dependencies:** CRM taxonomy, privacy policy, service catalog, qualification rubric.  
**Version history:** v0.9, 2026-07-18, initial draft.

---

## SYM-SAL-SOP-002 — Proposal and Statement of Work Generation

**Purpose:** Issue accurate, persuasive, profitable proposals quickly.  
**Owner:** Opportunity Owner.  
**Inputs:** Approved qualification, discovery recap, pricing model, scope assumptions.  
**Outputs:** Approved proposal/SOW, estimate, review record, CRM update.  
**Required software:** CRM, Notion, document template, pricing tool, e-signature.

### Procedure

1. Confirm client problem, intended outcome, scope boundary, decision date, and proposal owner.
2. Select the approved product/service template; generate document ID and draft from CRM fields.
3. Define deliverables with measurable acceptance criteria, client responsibilities, schedule, dependencies, assumptions, exclusions, change process, and data/access needs.
4. Estimate labor, software, travel, subcontractors, contingency, margin, payment schedule, and recurring-revenue component.
5. Complete solution, delivery, security/data, commercial, and brand reviews. AI may draft; accountable humans validate every claim and commitment.
6. Resolve comments, approve price and terms under the authority matrix, lock issued PDF, and record version.
7. Send with a concise outcome-led message; schedule follow-up before issue.
8. Log issue time, value, stage, next action, and client response. On acceptance, trigger contract review and sales-to-delivery handoff.

**Quality control:** Client name and scope correct; totals reconcile; margin meets threshold or exception logged; acceptance criteria clear; exclusions explicit; claims evidenced; correct legal entity/template; approval recorded.  
**Estimated duration:** 2–8 hours; target under two business days.  
**Automation opportunities:** CRM merge, scope-module assembly, estimate checks, approval routing, e-signature, follow-up.  
**Future improvements:** Modular product pricing and win/loss learning.  
**Dependencies:** Intake SOP, pricing policy, authority matrix, approved terms.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-003 — Contract Review and Project Authorization

**Purpose:** Prevent delivery before obligations, economics, and risks are understood and approved.  
**Owner:** COO; authorized human signs.  
**Inputs:** Client contract/SOW, proposal, estimate, insurance/security requirements.  
**Outputs:** Executed contract, obligation register, project authorization, risk record.  
**Required software:** Contract repository, e-signature, CRM, accounting, decision log.

### Procedure

1. Save client paper as received and assign controlled ID; never overwrite it.
2. Compare contract to approved proposal: scope, deliverables, acceptance, schedule, fees, expenses, payment, IP, data rights, confidentiality, warranties, liability, termination, publicity, insurance, dispute terms, and flow-downs.
3. Record deviations and owners. Route legal questions to qualified counsel and commercial exceptions to authorized leadership.
4. Validate delivery capacity, margin, cash timing, subcontractor needs, software/data rights, and security feasibility.
5. Resolve redlines; preserve negotiation history. Confirm final document exactly matches approved form.
6. Obtain authorized signatures; store executed copy in `01_Contract` and restrict access.
7. Create obligation register with owner and due date; set invoicing schedule; change opportunity to won.
8. Issue project authorization only when execution, funding, owner, and key access conditions are confirmed.

**Quality control:** Complete execution; proposal-contract reconciliation; risks accepted by correct authority; obligations assigned; no work starts from an unsigned draft unless written executive exception.  
**Estimated duration:** 1–5 business days.  
**Automation opportunities:** Clause extraction, deviation detection, obligation reminders, metadata sync.  
**Future improvements:** Clause playbook and risk scoring.  
**Dependencies:** Authority matrix, counsel, insurance, security and pricing standards.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-004 — Sales-to-Delivery Handoff and Project Kickoff

**Purpose:** Establish a shared, executable baseline before delivery.  
**Owner:** Project Lead.  
**Inputs:** Executed agreement, proposal, discovery, estimate, obligation register.  
**Outputs:** Project charter, plan, RACI, kickoff record, baseline, risk register.  
**Required software:** ClickUp, Notion, Drive/SharePoint, calendar, finance system.

### Procedure

1. Create project ID, workspace, folder structure, task template, financial job, and project register entry.
2. Handoff meeting: salesperson explains client outcomes, promises, stakeholders, commercial assumptions, risks, and relationship history; Project Lead accepts or records gaps.
3. Translate contract into deliverables, acceptance criteria, milestones, dependencies, obligations, invoice events, and change triggers.
4. Assign RACI; validate capacity and specialist availability. Create communications plan and escalation path.
5. Establish schedule baseline, budget, margin forecast, risk/issues log, decision log links, QA plan, and data/security plan.
6. Send client kickoff agenda in advance. Conduct kickoff to confirm outcomes, scope, roles, access, schedule, meetings, approvals, deliverable format, change control, and immediate actions.
7. Publish minutes and actions within one business day; obtain confirmation of disputed assumptions.
8. Pass readiness gate: contract, owner, scope, acceptance, schedule, access plan, and first milestone all green.

**Quality control:** No undocumented promises; contract traceability; one owner per action; baseline approved; client confirmation; risks assigned.  
**Estimated duration:** 3–8 hours.  
**Automation opportunities:** Workspace provisioning, contract-to-task draft, agenda/minutes, reminders, dashboard registration.  
**Future improvements:** Product-specific kickoff templates.  
**Dependencies:** Contract SOP, project template, RACI and risk standards.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-OPS-SOP-005 — Project Document Management

**Purpose:** Make every project record controlled, findable, secure, and auditable.  
**Owner:** Project Lead.  
**Inputs:** Project files, correspondence, models, datasets, meeting and review records.  
**Outputs:** Governed project repository and transmittal history.  
**Required software:** Drive/SharePoint, Notion, GitHub for code, backup service.

### Procedure

1. Provision the standard project folders and least-privilege groups; prohibit personal storage as project record.
2. Apply the Document Control Standard to IDs, filenames, metadata, versions, and status.
3. Store source files in `02_Input` unchanged; record source, date, usage rights, and checksum for critical datasets.
4. Keep editable work in `03_Working`; coordination copies in `04_Coordination`; review evidence in `05_QAQC`.
5. Issue only approved immutable deliverables from `06_Issued`, with transmittal, recipient, version, date, and purpose.
6. Link authoritative records from project home; do not create duplicate trackers.
7. Weekly, check permissions, missing metadata, duplicate/obsolete files, broken links, storage, backup, and unresolved transmittals.
8. At closeout, reconcile deliverables, remove temporary access, apply retention, and move workspace to read-only archive.

**Quality control:** Correct folder/status; issued files immutable; access reviewed; no secrets; input lineage; approval and transmittal evidence.  
**Estimated duration:** 30 minutes setup; 15 minutes weekly.  
**Automation opportunities:** Provisioning, naming checks, metadata extraction, link/checksum validation, archive workflow.  
**Future improvements:** Common data environment and automated retention.  
**Dependencies:** Document Control Standard, security, retention, client requirements.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-006 — Meeting Management and Action Capture

**Purpose:** Turn meetings into decisions and owned actions while minimizing meeting load.  
**Owner:** Meeting Owner.  
**Inputs:** Objective, agenda, pre-read, attendees.  
**Outputs:** Decisions, tasks, risks, concise record.  
**Required software:** Calendar, conferencing, approved transcription, ClickUp, Notion.

### Procedure

1. Confirm a meeting is necessary; use async update when no discussion or decision is needed.
2. Invite only required decision-makers/contributors; state objective, decisions needed, agenda, pre-read, and preparation.
3. Assign facilitator, note owner, and timekeeper. Obtain consent before recording/transcribing.
4. Start with desired outcome; manage timeboxes; separate discussion, decision, action, parking lot, and risk.
5. For each decision, state decision, owner/approver, rationale, and consequence. For each action, assign one owner and due date.
6. End by reading back decisions, actions, unresolved items, and next checkpoint.
7. Within one business day publish a concise summary; create tasks in ClickUp and material decisions in the Decision Log.
8. At next meeting, review only exceptions and overdue commitments.

**Quality control:** Clear objective; quorum/authority; consent; decisions exact; every action has one owner/date; no competing action list.  
**Estimated duration:** 15 minutes preparation and closeout beyond meeting.  
**Automation opportunities:** Agenda, transcript summary, action/decision drafts, task creation, reminders.  
**Future improvements:** Meeting cost and effectiveness score.  
**Dependencies:** Communications protocol, Decision Log, privacy policy.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-007 — Technical Deliverable QA/QC and Issue

**Purpose:** Ensure client-issued work is accurate, complete, usable, and contract-compliant.  
**Owner:** Project Lead; independent Reviewer performs QC.  
**Inputs:** Draft deliverable, contract criteria, technical standards, source data.  
**Outputs:** Approved issued deliverable, completed checklist, review log, transmittal.  
**Required software:** Authoring tools, issue tracker, comparison/checking tools, repository.

### Procedure

1. Define acceptance criteria and review plan before production; assign reviewer independent of authoring where practical.
2. Author performs QA: completeness, calculations, coordinate systems, units, naming, links, data lineage, visuals, usability, accessibility, and contract traceability.
3. Freeze review candidate and version. Reviewer checks risk-based sample plus 100% of safety-, cost-, interface-, and client-critical items.
4. Record comments by severity: Critical, Major, Minor, Suggestion. Author resolves; reviewer verifies closure. Critical/Major items cannot be self-closed.
5. Run final release check: correct client/project, scope, file set, metadata, format, malware scan, permissions, version, and approved claims.
6. Project Lead approves issue. Create immutable issued copy and transmittal; never alter after issue.
7. Record client receipt/acceptance and defects. Correct defects through controlled new version and incident/lesson review as warranted.

**Quality control:** Acceptance criteria met; independent review; all comments disposed; evidence retained; no working file issued; transmittal reconciles.  
**Estimated duration:** 5–15% of production effort, risk-adjusted.  
**Automation opportunities:** Model/data validation, naming, clash checks, PDF compare, checklist enforcement, transmittal generation.  
**Future improvements:** Defect taxonomy and first-pass yield dashboard.  
**Dependencies:** Technical standards, contract, Document Control Standard, QA checklists.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-008 — Scope, Change, Risk, and Issue Control

**Purpose:** Protect client outcomes, schedule, margin, and trust through visible control.  
**Owner:** Project Lead.  
**Inputs:** Baseline, requests, discoveries, risks, issues.  
**Outputs:** Updated registers, approved changes, forecasts, escalations.  
**Required software:** ClickUp, CRM/project system, Decision Log, document repository.

### Procedure

1. Maintain baseline scope, assumptions, schedule, budget, and acceptance criteria.
2. Log every potential change or risk when identified; do not wait for certainty. State cause, event, effect, owner, probability/impact, and response.
3. Classify request: included clarification, defect correction, client change, external change, or internal improvement.
4. Analyze scope, deliverables, schedule, fee, margin, resources, data/security, and downstream impacts.
5. Present options and recommendation. Obtain written approval from authorized parties before changed work; record exceptions for urgent protective action.
6. Update contract/change order, baseline, tasks, forecast, invoice plan, decisions, and client communications.
7. Review high risks/issues weekly; escalate based on threshold, not optimism. Close only with evidence and residual-risk acceptance.
8. Analyze recurring causes monthly and feed improvements into SOPs/products.

**Quality control:** Unique ID; one owner; impact quantified; authority verified; no unauthorized work; registers and forecast synchronized.  
**Estimated duration:** 15 minutes logging; 1–4 hours analysis.  
**Automation opportunities:** Request intake, impact templates, threshold alerts, approval routing, forecast sync.  
**Future improvements:** Predictive risk scoring.  
**Dependencies:** Contract, baseline, authority matrix, Decision Log.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-009 — Project Status, Forecasting, and Escalation

**Purpose:** Produce a reliable weekly view of outcomes, schedule, cost, risk, and decisions.  
**Owner:** Project Lead.  
**Inputs:** Tasks, schedule, time/cost actuals, changes, risks, QA, client feedback.  
**Outputs:** Updated systems, forecast, client/internal status, escalations.  
**Required software:** ClickUp, QuickBooks, Power BI, CRM/project register.

### Procedure

1. By weekly cutoff, update actual progress, remaining effort, milestone dates, costs, invoice status, changes, risks, QA, decisions, and next actions.
2. Forecast from remaining work and constraints; do not copy the prior forecast without review.
3. Calculate project health using dashboard thresholds. Explain variance from baseline and prior forecast.
4. Validate with delivery team and finance. Resolve missing or conflicting data.
5. Publish internal status: outcome, accomplishments, next period, health, variance, risks/issues, decisions needed, changes, financial forecast, and asks.
6. Send client status at agreed cadence using contract-appropriate detail and no internal confidential data.
7. Escalate red conditions immediately with evidence, options, recommendation, owner, and required decision date.
8. Track recovery actions to closure and update the dashboard.

**Quality control:** Source data current; percent complete evidence-based; forecast complete; health rules applied consistently; bad news not delayed; client/internal versions reconciled.  
**Estimated duration:** 30–60 minutes weekly.  
**Automation opportunities:** Source refresh, variance flags, narrative draft, reminders, dashboard alerts.  
**Future improvements:** Earned-value and forecast accuracy tracking.  
**Dependencies:** Dashboard definitions, project baseline, finance close cadence.  
**Version history:** v0.9, 2026-07-18.

---

## SYM-DEL-SOP-010 — Project Closeout, Client Feedback, and Knowledge Capture

**Purpose:** Secure acceptance, collect cash, transfer value, and convert learning into reusable IP.  
**Owner:** Project Lead.  
**Inputs:** Contract, deliverables, acceptance evidence, financials, project records.  
**Outputs:** Acceptance, final invoice, archive, client feedback, lessons, reusable assets.  
**Required software:** Repository, CRM, QuickBooks, survey, Notion, ClickUp.

### Procedure

1. Review contract closeout requirements, acceptance criteria, open actions, changes, invoices, data return/destruction, training, and warranty/support commitments.
2. Reconcile and QA final deliverable set; issue index, transmittal, licenses/credentials transfer, and operating guidance.
3. Obtain documented acceptance or record open exceptions with owner/date.
4. Submit final invoice and monitor collection. Confirm subcontractor/vendor closure and margin.
5. Conduct client review: outcome achieved, satisfaction, adoption gaps, quantified value, referral/testimonial/case-study permission, and follow-on needs.
6. Conduct internal retrospective: keep/change/stop, defects, forecast accuracy, automation candidates, reusable modules, and product opportunities.
7. Assign each lesson to an SOP, template, standard, agent, automation, or product backlog; a lesson without an owner is not captured.
8. Remove temporary access, apply retention, archive read-only, close tasks, update CRM/project register, and schedule benefits review.

**Quality control:** Acceptance evidence; complete deliverables; final invoice; permissions closed; records retained; feedback logged; improvements assigned.  
**Estimated duration:** 2–6 hours.  
**Automation opportunities:** Checklist, acceptance request, survey, archive, retrospective extraction, case-study draft.  
**Future improvements:** Benefits realization at 30/90/180 days.  
**Dependencies:** Contract, QA/QC, document control, finance and retention policy.  
**Version history:** v0.9, 2026-07-18.


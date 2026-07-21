import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mission: text("mission").notNull(),
  authorityLevel: text("authority_level").notNull(),
  parentAgentId: text("parent_agent_id"),
  status: text("status").notNull().default("Draft"),
  version: text("version").notNull(),
  ...timestamps,
}, (table) => [
  check("agents_authority_check", sql`${table.authorityLevel} in ('L0','L1','L2','L3','L4')`),
  index("agents_parent_idx").on(table.parentAgentId),
]);

export const sharedGoals = sqliteTable("shared_goals", {
  id: text("id").primaryKey(),
  objective: text("objective").notNull(),
  accountableAgentId: text("accountable_agent_id").notNull().references(() => agents.id),
  priority: text("priority").notNull().default("P2"),
  status: text("status").notNull().default("Proposed"),
  dueAt: text("due_at"),
  successMeasuresJson: text("success_measures_json").notNull().default("[]"),
  ...timestamps,
}, (table) => [index("shared_goals_owner_idx").on(table.accountableAgentId)]);

export const goalAssignments = sqliteTable("goal_assignments", {
  id: text("id").primaryKey(),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  agentId: text("agent_id").notNull().references(() => agents.id),
  role: text("role").notNull(),
  status: text("status").notNull().default("Assigned"),
  acceptedAt: text("accepted_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("goal_assignments_goal_agent_idx").on(table.sharedGoalId, table.agentId),
]);

export const agentMessages = sqliteTable("agent_messages", {
  id: text("id").primaryKey(),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  senderAgentId: text("sender_agent_id").notNull().references(() => agents.id),
  recipientAgentId: text("recipient_agent_id").references(() => agents.id),
  messageType: text("message_type").notNull(),
  status: text("status").notNull(),
  subject: text("subject").notNull(),
  bodyJson: text("body_json").notNull(),
  opportunityId: text("opportunity_id"),
  idempotencyKey: text("idempotency_key").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  acceptedAt: text("accepted_at"),
}, (table) => [
  uniqueIndex("agent_messages_idempotency_idx").on(table.idempotencyKey),
  index("agent_messages_goal_corr_idx").on(table.sharedGoalId, table.correlationId),
  check("agent_messages_type_check", sql`${table.messageType} in ('Information','Request','Handoff','Review Request','Decision Request','Blocker','Completion','Incident')`),
]);

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  issuerWebsite: text("issuer_website"),
  title: text("title").notNull(),
  normalizedTitle: text("normalized_title").notNull(),
  solicitationNumber: text("solicitation_number"),
  canonicalUrl: text("canonical_url").notNull(),
  publicationDate: text("publication_date"),
  deadlineAt: text("deadline_at"),
  deadlineTimezone: text("deadline_timezone"),
  location: text("location"),
  geographyKey: text("geography_key").notNull(),
  statedValue: real("stated_value"),
  currency: text("currency").notNull().default("USD"),
  procurementType: text("procurement_type").notNull(),
  scope: text("scope").notNull(),
  publicContactJson: text("public_contact_json"),
  accessRequirements: text("access_requirements"),
  fitRationale: text("fit_rationale").notNull(),
  serviceFitScore: integer("service_fit_score").notNull(),
  buyerFitScore: integer("buyer_fit_score").notNull(),
  timingScore: integer("timing_score").notNull(),
  valueScore: integer("value_score").notNull(),
  evidenceScore: integer("evidence_score").notNull(),
  accessScore: integer("access_score").notNull(),
  recurrenceScore: integer("recurrence_score").notNull(),
  totalScore: integer("total_score").notNull(),
  confidence: integer("confidence").notNull(),
  freshness: text("freshness").notNull(),
  risksJson: text("risks_json").notNull().default("[]"),
  missingInformationJson: text("missing_information_json").notNull().default("[]"),
  nextAction: text("next_action").notNull(),
  route: text("route").notNull(),
  handoffStatus: text("handoff_status").notNull().default("Not routed"),
  observedAt: text("observed_at").notNull(),
  sourceKind: text("source_kind").notNull(),
  isDemonstration: integer("is_demonstration", { mode: "boolean" }).notNull().default(false),
  parentOpportunityId: text("parent_opportunity_id"),
  ...timestamps,
}, (table) => [
  uniqueIndex("opportunities_dedupe_idx").on(table.issuer, table.normalizedTitle, table.solicitationNumber, table.canonicalUrl, table.deadlineAt, table.geographyKey),
  index("opportunities_route_score_idx").on(table.route, table.totalScore),
  index("opportunities_deadline_idx").on(table.deadlineAt),
  check("opportunities_score_check", sql`${table.totalScore} between 0 and 100 and ${table.confidence} between 0 and 100`),
  check("opportunities_route_check", sql`${table.route} in ('sales_operations','watchlist','archive')`),
]);

export const opportunityEvidence = sqliteTable("opportunity_evidence", {
  id: text("id").primaryKey(),
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id),
  canonicalUrl: text("canonical_url").notNull(),
  sourceTitle: text("source_title").notNull(),
  sourceType: text("source_type").notNull(),
  evidenceSummary: text("evidence_summary").notNull(),
  contentHash: text("content_hash").notNull(),
  confidence: integer("confidence").notNull(),
  isAmendment: integer("is_amendment", { mode: "boolean" }).notNull().default(false),
  amendmentNumber: text("amendment_number"),
  observedAt: text("observed_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("opportunity_evidence_hash_idx").on(table.opportunityId, table.contentHash),
  index("opportunity_evidence_opportunity_idx").on(table.opportunityId),
]);

export const scoutRuns = sqliteTable("scout_runs", {
  id: text("id").primaryKey(),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  agentId: text("agent_id").notNull().references(() => agents.id),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  sourcesChecked: integer("sources_checked").notNull().default(0),
  candidatesFound: integer("candidates_found").notNull().default(0),
  verifiedCount: integer("verified_count").notNull().default(0),
  routedCount: integer("routed_count").notNull().default(0),
  errorSummary: text("error_summary"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("scout_runs_goal_corr_idx").on(table.sharedGoalId, table.correlationId)]);

export const monitoringQueries = sqliteTable("monitoring_queries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  queryText: text("query_text").notNull(),
  sourceCategory: text("source_category").notNull(),
  geography: text("geography"),
  cadence: text("cadence").notNull(),
  status: text("status").notNull().default("Draft"),
  lastCheckedAt: text("last_checked_at"),
  nextCheckAt: text("next_check_at"),
  robotsPolicy: text("robots_policy").notNull().default("Verify before access"),
  requiresAuthentication: integer("requires_authentication", { mode: "boolean" }).notNull().default(false),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id),
  ...timestamps,
}, (table) => [index("monitoring_queries_owner_status_idx").on(table.ownerAgentId, table.status)]);

const projectControlFields = {
  projectId: text("project_id").notNull(),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id),
  sourceEvidence: text("source_evidence").notNull(),
  ...timestamps,
};

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  authorizationStatus: text("authorization_status").notNull().default("Unverified"),
  authorizationReference: text("authorization_reference"),
  scopeSummary: text("scope_summary").notNull(),
  exclusionsJson: text("exclusions_json").notNull().default("[]"),
  acceptanceSummary: text("acceptance_summary"),
  commercialModel: text("commercial_model"),
  budgetAmount: real("budget_amount"),
  currency: text("currency").notNull().default("USD"),
  startDate: text("start_date"),
  targetCompletionDate: text("target_completion_date"),
  baselineDurationDays: integer("baseline_duration_days"),
  forecastCompletionDate: text("forecast_completion_date"),
  forecastMarginPointsVariance: real("forecast_margin_points_variance"),
  projectManager: text("project_manager").notNull(),
  accountableOwner: text("accountable_owner").notNull(),
  communicationCadence: text("communication_cadence"),
  dataClassification: text("data_classification").notNull().default("Internal"),
  health: text("health").notNull().default("Green"),
  status: text("status").notNull().default("Setup"),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id),
  sourceEvidence: text("source_evidence").notNull(),
  isDemonstration: integer("is_demonstration", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [
  index("projects_health_status_idx").on(table.health, table.status),
  index("projects_goal_corr_idx").on(table.sharedGoalId, table.correlationId),
  check("projects_id_check", sql`${table.id} glob 'PRJ-[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9]'`),
  check("projects_health_check", sql`${table.health} in ('Green','Amber','Red')`),
]);

export const projectStakeholders = sqliteTable("project_stakeholders", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  name: text("name").notNull(),
  organization: text("organization"),
  role: text("role").notNull(),
  responsibility: text("responsibility"),
  communicationRole: text("communication_role"),
  status: text("status").notNull().default("Active"),
}, (table) => [index("project_stakeholders_project_idx").on(table.projectId)]);

export const deliverables = sqliteTable("deliverables", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  name: text("name").notNull(),
  description: text("description").notNull(),
  acceptanceCriteria: text("acceptance_criteria").notNull(),
  accountableOwner: text("accountable_owner").notNull(),
  dueDate: text("due_date"),
  progressPercent: integer("progress_percent").notNull().default(0),
  qualityStatus: text("quality_status").notNull().default("Not started"),
  clientApprovalStatus: text("client_approval_status").notNull().default("Not requested"),
  status: text("status").notNull().default("Planned"),
}, (table) => [index("deliverables_project_status_idx").on(table.projectId, table.status)]);

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  name: text("name").notNull(),
  baselineDate: text("baseline_date").notNull(),
  forecastDate: text("forecast_date"),
  completedDate: text("completed_date"),
  acceptanceCriteria: text("acceptance_criteria").notNull(),
  accountableOwner: text("accountable_owner").notNull(),
  critical: integer("critical", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("Planned"),
}, (table) => [index("milestones_project_date_idx").on(table.projectId, table.baselineDate)]);

export const actions = sqliteTable("actions", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  title: text("title").notNull(),
  accountableOwner: text("accountable_owner").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull().default("P2"),
  blocker: text("blocker"),
  validationCriteria: text("validation_criteria").notNull(),
  completedAt: text("completed_at"),
  status: text("status").notNull().default("Open"),
}, (table) => [index("actions_project_due_idx").on(table.projectId, table.dueDate, table.status)]);

export const risksAndIssues = sqliteTable("risks_and_issues", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  recordType: text("record_type").notNull(),
  category: text("category").notNull(),
  statement: text("statement").notNull(),
  evidence: text("evidence").notNull(),
  probability: integer("probability"),
  impact: integer("impact").notNull(),
  severity: text("severity").notNull(),
  accountableOwner: text("accountable_owner").notNull(),
  responseAction: text("response_action").notNull(),
  dueDate: text("due_date").notNull(),
  escalationPath: text("escalation_path").notNull(),
  validationCriteria: text("validation_criteria").notNull(),
  status: text("status").notNull().default("Open"),
}, (table) => [
  index("risks_issues_project_severity_idx").on(table.projectId, table.severity, table.status),
  check("risks_issues_type_check", sql`${table.recordType} in ('Risk','Issue','Exception')`),
]);

export const projectDecisions = sqliteTable("decisions", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  statement: text("statement").notNull(),
  decisionOwner: text("decision_owner").notNull(),
  requiredBy: text("required_by"),
  recommendation: text("recommendation"),
  rationale: text("rationale"),
  approvalEvidence: text("approval_evidence"),
  status: text("status").notNull().default("Requested"),
}, (table) => [index("decisions_project_status_idx").on(table.projectId, table.status)]);

export const changes = sqliteTable("changes", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  title: text("title").notNull(),
  baselineReference: text("baseline_reference").notNull(),
  reason: text("reason").notNull(),
  classification: text("classification").notNull(),
  scopeEffect: text("scope_effect"),
  scheduleEffectDays: integer("schedule_effect_days"),
  effortEffectHours: real("effort_effect_hours"),
  costEffect: real("cost_effect"),
  qualityEffect: text("quality_effect"),
  deliveryEffect: text("delivery_effect"),
  approvalRequired: integer("approval_required", { mode: "boolean" }).notNull().default(true),
  approvalEvidence: text("approval_evidence"),
  accountableOwner: text("accountable_owner").notNull(),
  status: text("status").notNull().default("Draft"),
}, (table) => [index("changes_project_status_idx").on(table.projectId, table.status)]);

export const qualityReviews = sqliteTable("quality_reviews", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  reviewer: text("reviewer").notNull(),
  reviewType: text("review_type").notNull(),
  acceptanceChecklist: text("acceptance_checklist").notNull(),
  criticalDefects: integer("critical_defects").notNull().default(0),
  majorDefects: integer("major_defects").notNull().default(0),
  disposition: text("disposition"),
  reviewedAt: text("reviewed_at"),
  status: text("status").notNull().default("Planned"),
  deliverableVersionId: text("deliverable_version_id"),
  checklistVersionId: text("checklist_version_id"),
  reviewObjective: text("review_objective"),
  reviewScope: text("review_scope"),
  candidateHash: text("candidate_hash"),
  author: text("author"),
  approver: text("approver"),
  releaseRecommendation: text("release_recommendation"),
  correlationIdQuality: text("quality_correlation_id"),
}, (table) => [index("quality_reviews_project_status_idx").on(table.projectId, table.status)]);

export const statusReports = sqliteTable("status_reports", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  periodEnding: text("period_ending").notNull(),
  overallHealth: text("overall_health").notNull(),
  verifiedFactsJson: text("verified_facts_json").notNull().default("[]"),
  assumptionsJson: text("assumptions_json").notNull().default("[]"),
  forecastJson: text("forecast_json").notNull().default("[]"),
  recommendationsJson: text("recommendations_json").notNull().default("[]"),
  clientCommunicationRequired: integer("client_communication_required", { mode: "boolean" }).notNull().default(false),
  approvalStatus: text("approval_status").notNull().default("Draft"),
}, (table) => [index("status_reports_project_period_idx").on(table.projectId, table.periodEnding)]);

export const projectEvents = sqliteTable("project_events", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  actor: text("actor").notNull(),
  payloadJson: text("payload_json").notNull(),
  occurredAt: text("occurred_at").notNull(),
}, (table) => [index("project_events_project_time_idx").on(table.projectId, table.occurredAt)]);

export const evidenceLinks = sqliteTable("evidence_links", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  title: text("title").notNull(),
  uri: text("uri").notNull(),
  evidenceType: text("evidence_type").notNull(),
  classification: text("classification").notNull().default("Internal"),
  observedAt: text("observed_at").notNull(),
}, (table) => [index("evidence_links_entity_idx").on(table.projectId, table.entityType, table.entityId)]);

export const closeoutRecords = sqliteTable("closeout_records", {
  id: text("id").primaryKey(),
  ...projectControlFields,
  deliverablesComplete: integer("deliverables_complete", { mode: "boolean" }).notNull().default(false),
  acceptanceEvidenceLinked: integer("acceptance_evidence_linked", { mode: "boolean" }).notNull().default(false),
  qualityComplete: integer("quality_complete", { mode: "boolean" }).notNull().default(false),
  clientApprovalLinked: integer("client_approval_linked", { mode: "boolean" }).notNull().default(false),
  finalDocumentationComplete: integer("final_documentation_complete", { mode: "boolean" }).notNull().default(false),
  changesResolved: integer("changes_resolved", { mode: "boolean" }).notNull().default(false),
  financialCloseoutReady: integer("financial_closeout_ready", { mode: "boolean" }).notNull().default(false),
  accessHandoverComplete: integer("access_handover_complete", { mode: "boolean" }).notNull().default(false),
  lessonsLinked: integer("lessons_linked", { mode: "boolean" }).notNull().default(false),
  archiveStatus: text("archive_status").notNull().default("Not started"),
  supportTransition: text("support_transition"),
  completionEvidence: text("completion_evidence"),
  status: text("status").notNull().default("Open"),
}, (table) => [index("closeout_records_project_status_idx").on(table.projectId, table.status)]);

export const deliverableVersions = sqliteTable("deliverable_versions", {
  id: text("id").primaryKey(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  version: text("version").notNull(),
  contentHash: text("content_hash").notNull(),
  sourceInputsJson: text("source_inputs_json").notNull().default("[]"),
  author: text("author").notNull(),
  immutable: integer("immutable", { mode: "boolean" }).notNull().default(true),
  issuedAt: text("issued_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("deliverable_versions_version_idx").on(table.deliverableId, table.version),
  uniqueIndex("deliverable_versions_hash_idx").on(table.deliverableId, table.contentHash),
]);

export const acceptanceCriteria = sqliteTable("acceptance_criteria", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  requirementReference: text("requirement_reference").notNull(),
  criterion: text("criterion").notNull(),
  sourceAuthority: text("source_authority").notNull(),
  status: text("status").notNull().default("Approved"),
  ...timestamps,
}, (table) => [index("acceptance_criteria_deliverable_idx").on(table.deliverableId, table.status)]);

export const qualityPlans = sqliteTable("quality_plans", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  objective: text("objective").notNull(),
  scope: text("scope").notNull(),
  samplingMethod: text("sampling_method").notNull(),
  criticalInterfacesJson: text("critical_interfaces_json").notNull().default("[]"),
  evidenceRequirementsJson: text("evidence_requirements_json").notNull().default("[]"),
  releaseCriteriaJson: text("release_criteria_json").notNull().default("[]"),
  reviewer: text("reviewer").notNull(),
  approver: text("approver").notNull(),
  status: text("status").notNull().default("Draft"),
  ...timestamps,
}, (table) => [index("quality_plans_goal_corr_idx").on(table.sharedGoalId, table.correlationId)]);

export const qualityChecklists = sqliteTable("quality_checklists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  deliverableType: text("deliverable_type").notNull(),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id),
  status: text("status").notNull().default("Draft"),
  ...timestamps,
}, (table) => [index("quality_checklists_type_status_idx").on(table.deliverableType, table.status)]);

export const checklistVersions = sqliteTable("checklist_versions", {
  id: text("id").primaryKey(),
  checklistId: text("checklist_id").notNull().references(() => qualityChecklists.id),
  version: text("version").notNull(),
  requirementsJson: text("requirements_json").notNull(),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  supersededAt: text("superseded_at"),
  contentHash: text("content_hash").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("checklist_versions_version_idx").on(table.checklistId, table.version)]);

export const reviewFindings = sqliteTable("review_findings", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  qualityReviewId: text("quality_review_id").notNull().references(() => qualityReviews.id),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(),
  requirementReference: text("requirement_reference").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  impact: text("impact").notNull(),
  recommendedCorrection: text("recommended_correction").notNull(),
  responsibleOwner: text("responsible_owner").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("Open"),
  reviewer: text("reviewer").notNull(),
  verificationEvidence: text("verification_evidence"),
  ...timestamps,
}, (table) => [
  index("review_findings_release_idx").on(table.projectId, table.severity, table.status),
  check("review_findings_severity_check", sql`${table.severity} in ('Critical','Major','Minor','Suggestion')`),
]);

export const findingEvidence = sqliteTable("finding_evidence", {
  id: text("id").primaryKey(),
  findingId: text("finding_id").notNull().references(() => reviewFindings.id),
  evidenceType: text("evidence_type").notNull(),
  uri: text("uri"),
  contentHash: text("content_hash"),
  description: text("description").notNull(),
  classification: text("classification").notNull().default("Internal"),
  capturedBy: text("captured_by").notNull(),
  capturedAt: text("captured_at").notNull(),
}, (table) => [index("finding_evidence_finding_idx").on(table.findingId)]);

export const correctiveActions = sqliteTable("corrective_actions", {
  id: text("id").primaryKey(),
  findingId: text("finding_id").notNull().references(() => reviewFindings.id),
  owner: text("owner").notNull(),
  correction: text("correction").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("Assigned"),
  submittedEvidence: text("submitted_evidence"),
  ...timestamps,
}, (table) => [index("corrective_actions_owner_status_idx").on(table.owner, table.status)]);

export const verificationEvents = sqliteTable("verification_events", {
  id: text("id").primaryKey(),
  findingId: text("finding_id").notNull().references(() => reviewFindings.id),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  verifier: text("verifier").notNull(),
  result: text("result").notNull(),
  evidence: text("evidence").notNull(),
  regressionChecked: integer("regression_checked", { mode: "boolean" }).notNull().default(false),
  occurredAt: text("occurred_at").notNull(),
}, (table) => [index("verification_events_finding_idx").on(table.findingId, table.occurredAt)]);

export const approvalRecords = sqliteTable("approval_records", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  approvalType: text("approval_type").notNull(),
  approver: text("approver").notNull(),
  authorityReference: text("authority_reference").notNull(),
  decision: text("decision").notNull(),
  rationale: text("rationale"),
  approvedAt: text("approved_at"),
}, (table) => [index("approval_records_deliverable_idx").on(table.deliverableId, table.decision)]);

export const releaseGates = sqliteTable("release_gates", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  qualityReviewId: text("quality_review_id").notNull().references(() => qualityReviews.id),
  recommendation: text("recommendation").notNull(),
  checklistComplete: integer("checklist_complete", { mode: "boolean" }).notNull().default(false),
  approvalsRecorded: integer("approvals_recorded", { mode: "boolean" }).notNull().default(false),
  blockingFindingCount: integer("blocking_finding_count").notNull().default(0),
  residualRisk: text("residual_risk"),
  evaluatedBy: text("evaluated_by").notNull(),
  evaluatedAt: text("evaluated_at").notNull(),
}, (table) => [index("release_gates_recommendation_idx").on(table.recommendation, table.evaluatedAt)]);

export const transmittals = sqliteTable("transmittals", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  recipientsJson: text("recipients_json").notNull(),
  fileSetHash: text("file_set_hash").notNull(),
  issuedBy: text("issued_by").notNull(),
  issuedAt: text("issued_at").notNull(),
  receiptStatus: text("receipt_status").notNull().default("Pending"),
}, (table) => [index("transmittals_project_issue_idx").on(table.projectId, table.issuedAt)]);

export const escapedDefects = sqliteTable("escaped_defects", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableVersionId: text("deliverable_version_id").notNull().references(() => deliverableVersions.id),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  reportedBy: text("reported_by").notNull(),
  rootCause: text("root_cause"),
  status: text("status").notNull().default("Open"),
  reportedAt: text("reported_at").notNull(),
}, (table) => [index("escaped_defects_project_severity_idx").on(table.projectId, table.severity)]);

export const qualityIncidents = sqliteTable("quality_incidents", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  escapedDefectId: text("escaped_defect_id").references(() => escapedDefects.id),
  summary: text("summary").notNull(),
  impact: text("impact").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull().default("Open"),
  lessonsStatus: text("lessons_status").notNull().default("Not routed"),
  ...timestamps,
}, (table) => [index("quality_incidents_project_status_idx").on(table.projectId, table.status)]);

export const qualityMetrics = sqliteTable("quality_metrics", {
  id: text("id").primaryKey(),
  projectId: text("project_id"),
  deliverableType: text("deliverable_type"),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  metricName: text("metric_name").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  baselineReference: text("baseline_reference"),
  sourceEvidence: text("source_evidence").notNull(),
  calculatedAt: text("calculated_at").notNull(),
}, (table) => [index("quality_metrics_name_period_idx").on(table.metricName, table.periodEnd)]);

export const qualityEvents = sqliteTable("quality_events", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  deliverableId: text("deliverable_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  previousState: text("previous_state"),
  newState: text("new_state").notNull(),
  reason: text("reason").notNull(),
  supportingEvidence: text("supporting_evidence").notNull(),
  correlationId: text("correlation_id").notNull(),
  occurredAt: text("occurred_at").notNull(),
}, (table) => [index("quality_events_entity_time_idx").on(table.entityType, table.entityId, table.occurredAt)]);

export const knowledgeAssets = sqliteTable("knowledge_assets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  businessArea: text("business_area").notNull(),
  assetType: text("asset_type").notNull(),
  owner: text("owner").notNull(),
  author: text("author").notNull(),
  reviewer: text("reviewer"),
  approver: text("approver"),
  lifecycleStatus: text("lifecycle_status").notNull().default("Draft"),
  classification: text("classification").notNull().default("Internal"),
  currentVersion: text("current_version").notNull().default("0.1"),
  effectiveDate: text("effective_date"),
  reviewDate: text("review_date"),
  sourceSystem: text("source_system").notNull(),
  canonicalLocation: text("canonical_location").notNull(),
  sourceEvidence: text("source_evidence").notNull(),
  contentHash: text("content_hash").notNull(),
  relatedClientId: text("related_client_id"),
  relatedProjectId: text("related_project_id"),
  relatedOpportunityId: text("related_opportunity_id"),
  relatedDecisionId: text("related_decision_id"),
  relatedSharedGoalId: text("related_shared_goal_id"),
  relatedAgentId: text("related_agent_id"),
  supersedesAssetId: text("supersedes_asset_id"),
  supersededByAssetId: text("superseded_by_asset_id"),
  retentionRule: text("retention_rule"),
  tagsJson: text("tags_json").notNull().default("[]"),
  synonymsJson: text("synonyms_json").notNull().default("[]"),
  isAuthoritative: integer("is_authoritative", { mode: "boolean" }).notNull().default(false),
  isDemonstration: integer("is_demonstration", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [
  uniqueIndex("knowledge_assets_hash_version_idx").on(table.contentHash, table.currentVersion),
  index("knowledge_assets_search_idx").on(table.lifecycleStatus, table.businessArea, table.assetType),
  index("knowledge_assets_review_idx").on(table.reviewDate, table.owner),
  check("knowledge_assets_lifecycle_check", sql`${table.lifecycleStatus} in ('Draft','Review','Approved','Active','Superseded','Archived')`),
  check("knowledge_assets_classification_check", sql`${table.classification} in ('Public','Internal','Confidential','Restricted')`),
]);

export const knowledgeVersions = sqliteTable("knowledge_versions", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), version: text("version").notNull(),
  contentHash: text("content_hash").notNull(), canonicalLocation: text("canonical_location").notNull(), changeSummary: text("change_summary").notNull(),
  sourceEvidence: text("source_evidence").notNull(), immutable: integer("immutable", { mode: "boolean" }).notNull().default(false), issuedAt: text("issued_at"), ...timestamps,
}, (table) => [uniqueIndex("knowledge_versions_asset_version_idx").on(table.assetId, table.version)]);

export const knowledgeRelationships = sqliteTable("knowledge_relationships", {
  id: text("id").primaryKey(), fromAssetId: text("from_asset_id").notNull().references(() => knowledgeAssets.id), toAssetId: text("to_asset_id").notNull().references(() => knowledgeAssets.id),
  relationshipType: text("relationship_type").notNull(), reason: text("reason").notNull(), sourceEvidence: text("source_evidence").notNull(), ...timestamps,
}, (table) => [uniqueIndex("knowledge_relationship_unique_idx").on(table.fromAssetId, table.toAssetId, table.relationshipType)]);

export const knowledgeSources = sqliteTable("knowledge_sources", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), sourceSystem: text("source_system").notNull(),
  canonicalLocation: text("canonical_location").notNull(), contentHash: text("content_hash").notNull(), authorityStatus: text("authority_status").notNull(), observedAt: text("observed_at").notNull(), ...timestamps,
}, (table) => [index("knowledge_sources_asset_idx").on(table.assetId, table.authorityStatus)]);

export const knowledgeTags = sqliteTable("knowledge_tags", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), tag: text("tag").notNull(), ...timestamps,
}, (table) => [uniqueIndex("knowledge_tags_asset_tag_idx").on(table.assetId, table.tag)]);

export const knowledgeSynonyms = sqliteTable("knowledge_synonyms", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), synonym: text("synonym").notNull(), ...timestamps,
}, (table) => [uniqueIndex("knowledge_synonyms_asset_idx").on(table.assetId, table.synonym)]);

export const knowledgeReviews = sqliteTable("knowledge_reviews", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), reviewer: text("reviewer").notNull(), dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("Planned"), completionEvidence: text("completion_evidence"), nextReviewDate: text("next_review_date"), ...timestamps,
}, (table) => [index("knowledge_reviews_due_status_idx").on(table.dueDate, table.status)]);

export const knowledgeQualityScores = sqliteTable("knowledge_quality_scores", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), ownership: real("ownership"), freshness: real("freshness"), completeness: real("completeness"),
  findability: real("findability"), usage: real("usage"), linkHealth: real("link_health"), score: real("score"), status: text("status").notNull(), sourceEvidence: text("source_evidence").notNull(), calculatedAt: text("calculated_at").notNull(),
}, (table) => [index("knowledge_quality_asset_time_idx").on(table.assetId, table.calculatedAt)]);

export const knowledgeAccessClassifications = sqliteTable("knowledge_access_classifications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  rank: integer("rank").notNull(),
  permittedUse: text("permitted_use").notNull(),
  handlingRequirements: text("handling_requirements").notNull(),
  approvedBy: text("approved_by").notNull(),
  effectiveAt: text("effective_at").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("knowledge_access_name_idx").on(table.name),
  uniqueIndex("knowledge_access_rank_idx").on(table.rank),
  check("knowledge_access_rank_check", sql`${table.rank} between 0 and 3`),
]);

export const knowledgeAuditEvents = sqliteTable("knowledge_audit_events", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), actorAgentId: text("actor_agent_id").notNull().references(() => agents.id),
  action: text("action").notNull(), reason: text("reason").notNull(), sourceEvidence: text("source_evidence").notNull(), correlationId: text("correlation_id").notNull(),
  previousState: text("previous_state"), newState: text("new_state").notNull(), occurredAt: text("occurred_at").notNull(),
}, (table) => [index("knowledge_audit_asset_time_idx").on(table.assetId, table.occurredAt)]);

export const knowledgeConflicts = sqliteTable("knowledge_conflicts", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), conflictingAssetId: text("conflicting_asset_id").notNull().references(() => knowledgeAssets.id),
  conflictType: text("conflict_type").notNull(), evidence: text("evidence").notNull(), recommendation: text("recommendation"), status: text("status").notNull().default("Open"), escalatedToAgentId: text("escalated_to_agent_id"), ...timestamps,
}, (table) => [uniqueIndex("knowledge_conflicts_pair_idx").on(table.assetId, table.conflictingAssetId, table.conflictType)]);

export const archiveRecords = sqliteTable("archive_records", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull().references(() => knowledgeAssets.id), archiveReason: text("archive_reason").notNull(),
  replacementAssetId: text("replacement_asset_id").references(() => knowledgeAssets.id), approvalEvidence: text("approval_evidence").notNull(), reversible: integer("reversible", { mode: "boolean" }).notNull().default(true),
  archivedBy: text("archived_by").notNull(), correlationId: text("correlation_id").notNull(), archivedAt: text("archived_at").notNull(),
}, (table) => [uniqueIndex("archive_records_asset_idx").on(table.assetId)]);
// AGT-007 research records share a traceability contract so every output can be
// followed back to its goal, requester, source dates, confidence, and evidence.
const researchControlFields = {
  researchId: text("research_id").notNull(), sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id), correlationId: text("correlation_id").notNull(),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id), requestingAgentId: text("requesting_agent_id").notNull().references(() => agents.id), sourceId: text("source_id"),
  publicationDate: text("publication_date"), observationDate: text("observation_date").notNull(), confidence: text("confidence").notNull(), freshness: text("freshness").notNull(),
  classification: text("classification").notNull().default("Internal"), status: text("status").notNull().default("Draft"), evidenceLinksJson: text("evidence_links_json").notNull().default("[]"), ...timestamps,
};
export const researchRequests = sqliteTable("research_requests", { id:text("id").primaryKey(), ...researchControlFields, question:text("question").notNull(), decisionSupported:text("decision_supported").notNull(), audience:text("audience").notNull(), depth:text("depth").notNull(), geography:text("geography"), timeframe:text("timeframe"), constraintsJson:text("constraints_json").notNull().default("[]"), deadlineAt:text("deadline_at"), acceptanceCriteriaJson:text("acceptance_criteria_json").notNull().default("[]") }, t => [index("research_requests_status_idx").on(t.status, t.requestingAgentId)]);
export const researchProjects = sqliteTable("research_projects", { id:text("id").primaryKey(), ...researchControlFields, title:text("title").notNull(), planJson:text("plan_json").notNull(), stoppingRule:text("stopping_rule").notNull(), expectedDeliverable:text("expected_deliverable").notNull() });
export const researchQuestions = sqliteTable("research_questions", { id:text("id").primaryKey(), ...researchControlFields, projectId:text("project_id").notNull().references(() => researchProjects.id), question:text("question").notNull(), answerStatus:text("answer_status").notNull().default("Open") });
export const researchSources = sqliteTable("research_sources", { id:text("id").primaryKey(), researchId:text("research_id").notNull(), canonicalUrl:text("canonical_url").notNull(), title:text("title").notNull(), publisher:text("publisher").notNull(), author:text("author"), sourceType:text("source_type").notNull(), publicationDate:text("publication_date"), observationDate:text("observation_date").notNull(), geography:text("geography"), applicablePeriod:text("applicable_period"), authority:text("authority").notNull(), limitations:text("limitations"), contentHash:text("content_hash"), accessRestrictions:text("access_restrictions"), classification:text("classification").notNull().default("Public"), ...timestamps }, t => [uniqueIndex("research_sources_url_observed_idx").on(t.canonicalUrl,t.observationDate)]);
export const sourceObservations = sqliteTable("source_observations", { id:text("id").primaryKey(), ...researchControlFields, canonicalUrl:text("canonical_url").notNull(), observationJson:text("observation_json").notNull(), contentHash:text("content_hash") });
export const evidenceClaims = sqliteTable("evidence_claims", { id:text("id").primaryKey(), ...researchControlFields, claim:text("claim").notNull(), claimType:text("claim_type").notNull(), directness:text("directness").notNull(), corroborationJson:text("corroboration_json").notNull().default("[]"), limitations:text("limitations") }, t => [check("evidence_claims_type_check", sql`${t.claimType} in ('Fact','Inference','Estimate','Recommendation')`)]);
export const researchFindings = sqliteTable("research_findings", { id:text("id").primaryKey(), ...researchControlFields, title:text("title").notNull(), finding:text("finding").notNull(), implications:text("implications").notNull(), assumptionsJson:text("assumptions_json").notNull().default("[]"), unknownsJson:text("unknowns_json").notNull().default("[]"), supersededById:text("superseded_by_id") });
export const conflictingEvidence = sqliteTable("conflicting_evidence", { id:text("id").primaryKey(), ...researchControlFields, claimAId:text("claim_a_id").notNull().references(() => evidenceClaims.id), claimBId:text("claim_b_id").notNull().references(() => evidenceClaims.id), conflictSummary:text("conflict_summary").notNull(), resolutionStatus:text("resolution_status").notNull().default("Open") });
export const researchBriefs = sqliteTable("research_briefs", { id:text("id").primaryKey(), ...researchControlFields, title:text("title").notNull(), executiveAnswer:text("executive_answer").notNull(), keyFindingsJson:text("key_findings_json").notNull(), recommendation:text("recommendation").notNull(), nextAction:text("next_action").notNull(), version:text("version").notNull().default("0.1"), reviewDate:text("review_date") });
export const competitorProfiles = sqliteTable("competitor_profiles", { id:text("id").primaryKey(), ...researchControlFields, company:text("company").notNull(), profileJson:text("profile_json").notNull(), strategicImplications:text("strategic_implications").notNull(), lastActivityDate:text("last_activity_date") });
export const technologyProfiles = sqliteTable("technology_profiles", { id:text("id").primaryKey(), ...researchControlFields, technology:text("technology").notNull(), assessmentJson:text("assessment_json").notNull(), pilotRecommendation:text("pilot_recommendation"), exitRisksJson:text("exit_risks_json").notNull().default("[]") });
export const marketSignals = sqliteTable("market_signals", { id:text("id").primaryKey(), ...researchControlFields, signal:text("signal").notNull(), signalType:text("signal_type").notNull(), opportunityFingerprint:text("opportunity_fingerprint"), routedToAgentId:text("routed_to_agent_id"), routedAt:text("routed_at"), routeStatus:text("route_status").notNull().default("Not routed") }, t => [uniqueIndex("market_signals_fingerprint_idx").on(t.opportunityFingerprint)]);
export const experiments = sqliteTable("experiments", { id:text("id").primaryKey(), ...researchControlFields, hypothesis:text("hypothesis").notNull(), method:text("method").notNull(), successCriteria:text("success_criteria").notNull(), result:text("result") });
export const researchDecisions = sqliteTable("research_decisions", { id:text("id").primaryKey(), ...researchControlFields, decisionId:text("decision_id").notNull(), useSummary:text("use_summary").notNull(), decisionOwner:text("decision_owner").notNull() });
export const citations = sqliteTable("citations", { id:text("id").primaryKey(), ...researchControlFields, claimId:text("claim_id").notNull().references(() => evidenceClaims.id), canonicalUrl:text("canonical_url").notNull(), locator:text("locator"), quotation:text("quotation"), citationComplete:integer("citation_complete",{mode:"boolean"}).notNull().default(false) });
export const researchReviews = sqliteTable("research_reviews", { id:text("id").primaryKey(), ...researchControlFields, reviewer:text("reviewer").notNull(), reviewType:text("review_type").notNull(), outcome:text("outcome").notNull(), comments:text("comments"), reviewedAt:text("reviewed_at").notNull() });

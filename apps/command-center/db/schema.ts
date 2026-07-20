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

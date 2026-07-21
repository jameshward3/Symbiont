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

// AGT-008 extends the same D1 data plane. Evidence fields must contain redacted
// operational evidence or secret references, never credentials or raw tokens.
const reliabilityEventFields = {
  automationId: text("automation_id").notNull(), runId: text("run_id").notNull(), sharedGoalId: text("shared_goal_id").notNull(),
  correlationId: text("correlation_id").notNull(), actor: text("actor").notNull(), occurredAt: text("occurred_at").notNull(),
  source: text("source").notNull(), previousState: text("previous_state").notNull(), newState: text("new_state").notNull(),
  evidence: text("evidence").notNull(), authority: text("authority").notNull(), result: text("result").notNull(),
};

export const automations = sqliteTable("automations", {
  id: text("id").primaryKey(), name: text("name").notNull(), owner: text("owner"), businessProcess: text("business_process").notNull(),
  connectedAgentsJson: text("connected_agents_json").notNull().default("[]"), sharedGoalsJson: text("shared_goals_json").notNull().default("[]"), trigger: text("trigger").notNull(), schedule: text("schedule"),
  inputsJson: text("inputs_json").notNull(), outputsJson: text("outputs_json").notNull(), systemsJson: text("systems_json").notNull(), dataClassification: text("data_classification").notNull(),
  authorityLevel: text("authority_level").notNull(), approvalGatesJson: text("approval_gates_json").notNull(), expectedDurationMs: integer("expected_duration_ms"), expectedVolume: integer("expected_volume"),
  timeoutMs: integer("timeout_ms").notNull(), retryPolicyJson: text("retry_policy_json").notNull(), idempotencyStrategy: text("idempotency_strategy").notNull(), rollbackProcedure: text("rollback_procedure").notNull(),
  killSwitchReference: text("kill_switch_reference").notNull(), successCriteria: text("success_criteria").notNull(), healthCheckMethod: text("health_check_method").notNull(), escalationPath: text("escalation_path").notNull(),
  releaseStatus: text("release_status").notNull().default("Draft"), healthState: text("health_state").notNull().default("Unknown"), reviewDate: text("review_date").notNull(), controlsJson: text("controls_json").notNull().default("[]"),
  isDemonstration: integer("is_demonstration", { mode: "boolean" }).notNull().default(false), ...timestamps,
}, (table) => [index("automations_health_release_idx").on(table.healthState, table.releaseStatus), check("automations_health_check", sql`${table.healthState} in ('Healthy','Degraded','Failing','Paused','Recovering','Disabled','Unknown')`)]);

export const automationVersions = sqliteTable("automation_versions", {
  id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), version: text("version").notNull(), changeId: text("change_id").notNull(),
  configurationHash: text("configuration_hash").notNull(), testEvidence: text("test_evidence").notNull(), approver: text("approver"), rolloutPlan: text("rollout_plan").notNull(), monitoringPlan: text("monitoring_plan").notNull(),
  rollbackPlan: text("rollback_plan").notNull(), successCriteria: text("success_criteria").notNull(), validationWindow: text("validation_window").notNull(), result: text("result").notNull(), ...timestamps,
}, (table) => [uniqueIndex("automation_versions_unique_idx").on(table.automationId, table.version)]);

export const automationChanges = sqliteTable("automation_changes", {
  id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), reason: text("reason").notNull(), owner: text("owner").notNull(),
  riskAssessment: text("risk_assessment").notNull(), testEvidence: text("test_evidence").notNull(), approver: text("approver"), rolloutPlan: text("rollout_plan").notNull(),
  monitoringPlan: text("monitoring_plan").notNull(), rollbackPlan: text("rollback_plan").notNull(), successCriteria: text("success_criteria").notNull(), validationWindow: text("validation_window").notNull(),
  changeResult: text("change_result").notNull(), incidentRateBefore: real("incident_rate_before"), incidentRateAfter: real("incident_rate_after"), outcomeQualityBefore: real("outcome_quality_before"), outcomeQualityAfter: real("outcome_quality_after"), ...timestamps,
}, (table) => [index("automation_changes_automation_idx").on(table.automationId, table.createdAt)]);

export const automationDependencies = sqliteTable("automation_dependencies", {
  id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), dependencyName: text("dependency_name").notNull(), dependencyType: text("dependency_type").notNull(),
  owner: text("owner"), healthState: text("health_state").notNull().default("Unknown"), lastCheckedAt: text("last_checked_at"), evidence: text("evidence").notNull(), ...timestamps,
}, (table) => [index("automation_dependencies_health_idx").on(table.automationId, table.healthState)]);

export const automationRuns = sqliteTable("automation_runs", {
  id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), sharedGoalId: text("shared_goal_id").notNull(), correlationId: text("correlation_id").notNull(),
  state: text("state").notNull(), startedAt: text("started_at").notNull(), completedAt: text("completed_at"), durationMs: integer("duration_ms"), recordsProcessed: integer("records_processed").notNull().default(0),
  successCount: integer("success_count").notNull().default(0), failureCount: integer("failure_count").notNull().default(0), retryCount: integer("retry_count").notNull().default(0), duplicateCount: integer("duplicate_count").notNull().default(0),
  idempotencyKey: text("idempotency_key").notNull(), approvalReference: text("approval_reference"), evidence: text("evidence").notNull(), ...timestamps,
}, (table) => [uniqueIndex("automation_runs_idempotency_idx").on(table.automationId, table.idempotencyKey), index("automation_runs_goal_corr_idx").on(table.sharedGoalId, table.correlationId)]);

export const runSteps = sqliteTable("run_steps", { id: text("id").primaryKey(), ...reliabilityEventFields, stepName: text("step_name").notNull(), attempt: integer("attempt").notNull().default(1), durationMs: integer("duration_ms") }, (table) => [index("run_steps_run_time_idx").on(table.runId, table.occurredAt)]);
export const healthChecks = sqliteTable("health_checks", { id: text("id").primaryKey(), ...reliabilityEventFields, checkType: text("check_type").notNull(), observedValue: text("observed_value"), expectedValue: text("expected_value"), state: text("state").notNull() }, (table) => [index("health_checks_automation_time_idx").on(table.automationId, table.occurredAt)]);
export const heartbeats = sqliteTable("heartbeats", { id: text("id").primaryKey(), ...reliabilityEventFields, expectedAt: text("expected_at").notNull(), receivedAt: text("received_at"), lateByMs: integer("late_by_ms") }, (table) => [index("heartbeats_expected_idx").on(table.automationId, table.expectedAt)]);
export const alerts = sqliteTable("alerts", { id: text("id").primaryKey(), ...reliabilityEventFields, alertType: text("alert_type").notNull(), severity: text("severity").notNull(), acknowledgedBy: text("acknowledged_by"), acknowledgedAt: text("acknowledged_at") }, (table) => [index("alerts_severity_time_idx").on(table.severity, table.occurredAt)]);

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), runId: text("run_id").notNull(), sharedGoalId: text("shared_goal_id").notNull(), correlationId: text("correlation_id").notNull(),
  severity: text("severity").notNull(), status: text("status").notNull().default("Detected"), detectedAt: text("detected_at").notNull(), affectedSystemsJson: text("affected_systems_json").notNull(), affectedRecordsSummary: text("affected_records_summary").notNull(),
  evidence: text("evidence").notNull(), containmentStatus: text("containment_status").notNull(), businessImpact: text("business_impact").notNull(), owner: text("owner").notNull(), decisionRequired: text("decision_required").notNull(),
  nextAction: text("next_action").notNull(), recoveryTarget: text("recovery_target").notNull(), resolvedAt: text("resolved_at"), closedAt: text("closed_at"), ...timestamps,
}, (table) => [index("incidents_severity_status_idx").on(table.severity, table.status), index("incidents_goal_corr_idx").on(table.sharedGoalId, table.correlationId), check("incidents_severity_check", sql`${table.severity} in ('SEV-1','SEV-2','SEV-3','SEV-4')`)]);

export const incidentEvents = sqliteTable("incident_events", { id: text("id").primaryKey(), incidentId: text("incident_id").notNull().references(() => incidents.id), ...reliabilityEventFields, eventType: text("event_type").notNull() }, (table) => [index("incident_events_incident_time_idx").on(table.incidentId, table.occurredAt)]);
export const affectedRecords = sqliteTable("affected_records", { id: text("id").primaryKey(), incidentId: text("incident_id").notNull().references(() => incidents.id), ...reliabilityEventFields, recordReference: text("record_reference").notNull(), authoritativeSource: text("authoritative_source").notNull(), condition: text("condition").notNull(), materialChangeApproval: text("material_change_approval") }, (table) => [index("affected_records_incident_idx").on(table.incidentId)]);
export const recoveryActions = sqliteTable("recovery_actions", { id: text("id").primaryKey(), incidentId: text("incident_id").notNull().references(() => incidents.id), ...reliabilityEventFields, actionType: text("action_type").notNull(), reversible: integer("reversible", { mode: "boolean" }).notNull(), approvalReference: text("approval_reference"), verificationEvidence: text("verification_evidence") }, (table) => [index("recovery_actions_incident_idx").on(table.incidentId)]);
export const reliabilityCorrectiveActions = sqliteTable("reliability_corrective_actions", { id: text("id").primaryKey(), incidentId: text("incident_id").notNull().references(() => incidents.id), automationId: text("automation_id").notNull().references(() => automations.id), title: text("title").notNull(), rootCauseReference: text("root_cause_reference").notNull(), owner: text("owner").notNull(), dueDate: text("due_date").notNull(), preventionTest: text("prevention_test").notNull(), status: text("status").notNull().default("Open"), closureEvidence: text("closure_evidence"), sharedGoalId: text("shared_goal_id").notNull(), correlationId: text("correlation_id").notNull(), ...timestamps }, (table) => [index("reliability_corrective_owner_status_idx").on(table.owner, table.status)]);
export const retries = sqliteTable("retries", { id: text("id").primaryKey(), ...reliabilityEventFields, attempt: integer("attempt").notNull(), approvedLimit: integer("approved_limit").notNull(), transientFailure: integer("transient_failure", { mode: "boolean" }).notNull(), idempotent: integer("idempotent", { mode: "boolean" }).notNull(), idempotencyKey: text("idempotency_key").notNull(), backoffMs: integer("backoff_ms").notNull(), refusalReason: text("refusal_reason") }, (table) => [uniqueIndex("retries_run_attempt_idx").on(table.runId, table.attempt)]);
export const idempotencyRecords = sqliteTable("idempotency_records", { id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), idempotencyKey: text("idempotency_key").notNull(), runId: text("run_id").notNull(), correlationId: text("correlation_id").notNull(), requestHash: text("request_hash").notNull(), resultReference: text("result_reference"), state: text("state").notNull(), expiresAt: text("expires_at"), ...timestamps }, (table) => [uniqueIndex("idempotency_records_key_idx").on(table.automationId, table.idempotencyKey)]);
export const reconciliations = sqliteTable("reconciliations", { id: text("id").primaryKey(), incidentId: text("incident_id").notNull().references(() => incidents.id), ...reliabilityEventFields, intendedJson: text("intended_json").notNull(), completedJson: text("completed_json").notNull(), missingJson: text("missing_json").notNull(), duplicatedJson: text("duplicated_json").notNull(), inconsistentJson: text("inconsistent_json").notNull(), authoritativeSource: text("authoritative_source").notNull(), plan: text("plan").notNull(), verified: integer("verified", { mode: "boolean" }).notNull().default(false) }, (table) => [index("reconciliations_incident_idx").on(table.incidentId)]);
export const rollbackEvents = sqliteTable("rollback_events", { id: text("id").primaryKey(), changeId: text("change_id").notNull(), ...reliabilityEventFields, rollbackType: text("rollback_type").notNull(), irreversible: integer("irreversible", { mode: "boolean" }).notNull().default(false), approvalReference: text("approval_reference"), verificationEvidence: text("verification_evidence") }, (table) => [index("rollback_events_change_idx").on(table.changeId, table.occurredAt)]);
export const reliabilityMetrics = sqliteTable("reliability_metrics", { id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), metricName: text("metric_name").notNull(), value: real("value"), unit: text("unit").notNull(), numerator: real("numerator"), denominator: real("denominator"), evidence: text("evidence").notNull(), windowStart: text("window_start").notNull(), windowEnd: text("window_end").notNull(), calculatedAt: text("calculated_at").notNull() }, (table) => [index("reliability_metrics_name_window_idx").on(table.metricName, table.windowEnd)]);
export const monitoringPolicies = sqliteTable("monitoring_policies", { id: text("id").primaryKey(), automationId: text("automation_id").notNull().references(() => automations.id), owner: text("owner").notNull(), heartbeatIntervalMs: integer("heartbeat_interval_ms").notNull(), gracePeriodMs: integer("grace_period_ms").notNull(), durationThresholdMs: integer("duration_threshold_ms"), volumeFloor: integer("volume_floor"), volumeCeiling: integer("volume_ceiling"), errorRateThreshold: real("error_rate_threshold").notNull(), queueDepthThreshold: integer("queue_depth_threshold"), costLimit: real("cost_limit"), rateLimitThreshold: real("rate_limit_threshold"), alertRoute: text("alert_route").notNull(), reviewDate: text("review_date").notNull(), ...timestamps }, (table) => [uniqueIndex("monitoring_policies_automation_idx").on(table.automationId)]);

// AGT-006 stores operational-finance metadata only. The approved accounting
// platform remains authoritative; credentials, tax identifiers, unrestricted
// payroll, and payment credentials are prohibited from this data plane.
const financeControlFields = { period:text("period").notNull(), currency:text("currency").notNull().default("USD"), sourceSystem:text("source_system").notNull(), sourceRecord:text("source_record").notNull(), refreshedAt:text("refreshed_at").notNull(), owner:text("owner").notNull(), assumptionsJson:text("assumptions_json").notNull().default("[]"), confidence:text("confidence").notNull(), reconciliationStatus:text("reconciliation_status").notNull().default("Unreconciled"), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), isDemonstration:integer("is_demonstration",{mode:"boolean"}).notNull().default(false), ...timestamps };
export const contracts = sqliteTable("contracts",{id:text("id").primaryKey(),clientId:text("client_id").notNull(),projectId:text("project_id").notNull(),executedAt:text("executed_at"),contractValue:real("contract_value").notNull(),approvedChanges:real("approved_changes").notNull().default(0),billingScheduleJson:text("billing_schedule_json").notNull().default("[]"),legalEntity:text("legal_entity").notNull(),status:text("status").notNull(),...financeControlFields},t=>[index("contracts_project_status_idx").on(t.projectId,t.status)]);
export const financialPeriods = sqliteTable("financial_periods",{id:text("id").primaryKey(),period:text("period").notNull(),startDate:text("start_date").notNull(),endDate:text("end_date").notNull(),status:text("status").notNull().default("Open"),owner:text("owner").notNull(),closedAt:text("closed_at"),...timestamps},t=>[uniqueIndex("financial_periods_period_idx").on(t.period)]);
export const financialSources = sqliteTable("financial_sources",{id:text("id").primaryKey(),name:text("name").notNull(),sourceType:text("source_type").notNull(),authoritativeForJson:text("authoritative_for_json").notNull().default("[]"),lastRefresh:text("last_refresh"),owner:text("owner").notNull(),connectionStatus:text("connection_status").notNull().default("Not connected"),dataClassification:text("data_classification").notNull().default("Confidential"),...timestamps});
export const financialSnapshots = sqliteTable("financial_snapshots",{id:text("id").primaryKey(),metricName:text("metric_name").notNull(),definition:text("definition").notNull(),value:real("value"),unit:text("unit").notNull(),category:text("category").notNull(),calculationMethod:text("calculation_method").notNull(),authoritativeVariance:real("authoritative_variance"),...financeControlFields},t=>[index("financial_snapshots_metric_period_idx").on(t.metricName,t.period),check("financial_snapshots_category_check",sql`${t.category} in ('actual','committed','invoiced','collected','accrued','forecast','budget','estimate','assumption')`)]);
export const projectBudgets = sqliteTable("project_budgets",{id:text("id").primaryKey(),projectId:text("project_id").notNull(),contractValue:real("contract_value").notNull(),plannedLabor:real("planned_labor").notNull(),softwareCost:real("software_cost").notNull().default(0),travelCost:real("travel_cost").notNull().default(0),subcontractorCost:real("subcontractor_cost").notNull().default(0),otherDirectCost:real("other_direct_cost").notNull().default(0),baselineMargin:real("baseline_margin").notNull(),version:text("version").notNull(),...financeControlFields},t=>[uniqueIndex("project_budgets_project_version_idx").on(t.projectId,t.version)]);
export const projectActuals = sqliteTable("project_actuals",{id:text("id").primaryKey(),projectId:text("project_id").notNull(),invoicedValue:real("invoiced_value").notNull().default(0),collectedValue:real("collected_value").notNull().default(0),actualLabor:real("actual_labor").notNull().default(0),softwareCost:real("software_cost").notNull().default(0),travelCost:real("travel_cost").notNull().default(0),subcontractorCost:real("subcontractor_cost").notNull().default(0),otherDirectCost:real("other_direct_cost").notNull().default(0),...financeControlFields},t=>[index("project_actuals_project_period_idx").on(t.projectId,t.period)]);
export const forecastVersions = sqliteTable("forecast_versions",{id:text("id").primaryKey(),name:text("name").notNull(),scenario:text("scenario").notNull(),version:text("version").notNull(),priorVersionId:text("prior_version_id"),varianceExplanation:text("variance_explanation").notNull(),approvedBy:text("approved_by"),...financeControlFields},t=>[uniqueIndex("forecast_versions_name_version_idx").on(t.name,t.version)]);
export const projectForecasts = sqliteTable("project_forecasts",{id:text("id").primaryKey(),projectId:text("project_id").notNull(),forecastVersionId:text("forecast_version_id").notNull().references(()=>forecastVersions.id),remainingEffort:real("remaining_effort"),grossProfit:real("gross_profit"),grossMargin:real("gross_margin"),baselineMargin:real("baseline_margin"),marginVariance:real("margin_variance"),health:text("health").notNull(),risksJson:text("risks_json").notNull().default("[]"),...financeControlFields},t=>[index("project_forecasts_health_period_idx").on(t.health,t.period),check("project_forecasts_health_check",sql`${t.health} in ('Green','Amber','Red')`)]);
export const invoices = sqliteTable("invoices",{id:text("id").primaryKey(),projectId:text("project_id").notNull(),clientId:text("client_id").notNull(),invoiceNumber:text("invoice_number"),issueDate:text("issue_date"),dueDate:text("due_date"),amount:real("amount").notNull(),status:text("status").notNull().default("Draft"),approvalOwner:text("approval_owner").notNull(),approvalReference:text("approval_reference"),...financeControlFields},t=>[index("invoices_project_status_idx").on(t.projectId,t.status)]);
export const invoiceMilestones = sqliteTable("invoice_milestones",{id:text("id").primaryKey(),projectId:text("project_id").notNull(),contractId:text("contract_id").notNull().references(()=>contracts.id),name:text("name").notNull(),scheduledDate:text("scheduled_date"),amount:real("amount").notNull(),readinessStatus:text("readiness_status").notNull(),missingEvidenceJson:text("missing_evidence_json").notNull().default("[]"),remainingContractBalance:real("remaining_contract_balance").notNull(),approvalOwner:text("approval_owner").notNull(),...financeControlFields},t=>[index("invoice_milestones_status_date_idx").on(t.readinessStatus,t.scheduledDate)]);
export const receivables = sqliteTable("receivables",{id:text("id").primaryKey(),invoiceId:text("invoice_id").notNull().references(()=>invoices.id),clientId:text("client_id").notNull(),projectId:text("project_id").notNull(),issueDate:text("issue_date").notNull(),dueDate:text("due_date").notNull(),amount:real("amount").notNull(),amountReceived:real("amount_received").notNull().default(0),balance:real("balance").notNull(),daysOutstanding:integer("days_outstanding").notNull(),disputeStatus:text("dispute_status").notNull().default("None"),collectionOwner:text("collection_owner"),nextAction:text("next_action"),promisedPaymentDate:text("promised_payment_date"),evidence:text("evidence").notNull(),...financeControlFields},t=>[index("receivables_age_status_idx").on(t.daysOutstanding,t.disputeStatus)]);
export const paymentsMetadata = sqliteTable("payments_metadata",{id:text("id").primaryKey(),invoiceId:text("invoice_id").notNull().references(()=>invoices.id),paymentReference:text("payment_reference").notNull(),receivedDate:text("received_date").notNull(),amount:real("amount").notNull(),matchStatus:text("match_status").notNull(),evidence:text("evidence").notNull(),...financeControlFields},t=>[index("payments_invoice_match_idx").on(t.invoiceId,t.matchStatus)]);
export const expenses = sqliteTable("expenses",{id:text("id").primaryKey(),projectId:text("project_id"),vendorId:text("vendor_id"),category:text("category").notNull(),amount:real("amount").notNull(),expenseDate:text("expense_date").notNull(),approvalStatus:text("approval_status").notNull(),businessPurpose:text("business_purpose").notNull(),...financeControlFields},t=>[index("expenses_period_category_idx").on(t.period,t.category)]);
export const vendors = sqliteTable("vendors",{id:text("id").primaryKey(),name:text("name").notNull(),owner:text("owner"),businessPurpose:text("business_purpose").notNull(),status:text("status").notNull(),contractReference:text("contract_reference"),...financeControlFields});
export const subscriptions = sqliteTable("subscriptions",{id:text("id").primaryKey(),vendorId:text("vendor_id").notNull().references(()=>vendors.id),service:text("service").notNull(),annualCost:real("annual_cost").notNull(),renewalDate:text("renewal_date").notNull(),cancellationWindowDate:text("cancellation_window_date"),usageEvidence:text("usage_evidence"),approvalStatus:text("approval_status").notNull(),...financeControlFields},t=>[index("subscriptions_renewal_idx").on(t.renewalDate)]);
export const recurringRevenue = sqliteTable("recurring_revenue",{id:text("id").primaryKey(),clientId:text("client_id").notNull(),contractId:text("contract_id").notNull().references(()=>contracts.id),amount:real("amount").notNull(),cadence:text("cadence").notNull(),startDate:text("start_date").notNull(),endDate:text("end_date"),status:text("status").notNull(),...financeControlFields},t=>[index("recurring_revenue_period_status_idx").on(t.period,t.status)]);
export const cashForecasts = sqliteTable("cash_forecasts",{id:text("id").primaryKey(),forecastVersionId:text("forecast_version_id").notNull().references(()=>forecastVersions.id),scenario:text("scenario").notNull(),openingCash:real("opening_cash"),expectedCollections:real("expected_collections"),approvedOutflows:real("approved_outflows"),closingCash:real("closing_cash"),runwayMonths:real("runway_months"),knownExclusionsJson:text("known_exclusions_json").notNull().default("[]"),...financeControlFields},t=>[index("cash_forecasts_scenario_period_idx").on(t.scenario,t.period)]);
export const reconciliationItems = sqliteTable("reconciliation_items",{id:text("id").primaryKey(),recordType:text("record_type").notNull(),recordId:text("record_id").notNull(),authoritativeSource:text("authoritative_source").notNull(),authoritativeValue:real("authoritative_value"),operationalValue:real("operational_value"),variance:real("variance"),reason:text("reason").notNull(),status:text("status").notNull().default("Open"),owner:text("owner").notNull(),requiredAction:text("required_action").notNull(),...financeControlFields},t=>[index("reconciliation_items_status_idx").on(t.status,t.period)]);
export const financialExceptions = sqliteTable("financial_exceptions",{id:text("id").primaryKey(),severity:text("severity").notNull(),title:text("title").notNull(),recordType:text("record_type").notNull(),sourceRecord:text("source_record").notNull(),owner:text("owner").notNull(),requiredAction:text("required_action").notNull(),status:text("status").notNull().default("Open"),escalatedTo:text("escalated_to"),...financeControlFields},t=>[index("financial_exceptions_severity_status_idx").on(t.severity,t.status)]);
export const financialApprovals = sqliteTable("financial_approvals",{id:text("id").primaryKey(),subjectType:text("subject_type").notNull(),subjectId:text("subject_id").notNull(),requestedAction:text("requested_action").notNull(),requestedBy:text("requested_by").notNull(),approver:text("approver").notNull(),decision:text("decision"),decisionEvidence:text("decision_evidence"),decidedAt:text("decided_at"),expiresAt:text("expires_at"),...financeControlFields},t=>[index("financial_approvals_subject_idx").on(t.subjectType,t.subjectId)]);
export const financialAuditEvents = sqliteTable("financial_audit_events",{id:text("id").primaryKey(),actor:text("actor").notNull(),action:text("action").notNull(),subjectType:text("subject_type").notNull(),subjectId:text("subject_id").notNull(),authority:text("authority").notNull(),redactedEvidence:text("redacted_evidence").notNull(),result:text("result").notNull(),sharedGoalId:text("shared_goal_id").notNull(),correlationId:text("correlation_id").notNull(),occurredAt:text("occurred_at").notNull()},t=>[index("financial_audit_subject_time_idx").on(t.subjectType,t.subjectId,t.occurredAt)]);

// AGT-013 uses the same D1 data plane and links to the authoritative project schedule.
export const clients = sqliteTable("clients", { id:text("id").primaryKey(), name:text("name").notNull(), projectId:text("project_id").notNull(), opportunityId:text("opportunity_id"), sharedGoalId:text("shared_goal_id").notNull(), ownerAgentId:text("owner_agent_id").notNull().default("AGT-013"), correlationId:text("correlation_id").notNull(), dataClassification:text("data_classification").notNull().default("Confidential"), onboardingPercent:integer("onboarding_percent").notNull().default(0), adoptionPercent:integer("adoption_percent").notNull().default(0), outcomePercent:integer("outcome_percent").notNull().default(0), valueSummary:text("value_summary").notNull().default("Evidence insufficient"), nextReview:text("next_review").notNull(), renewalDate:text("renewal_date").notNull(), openRisks:integer("open_risks").notNull().default(0), openIssues:integer("open_issues").notNull().default(0), satisfactionSummary:text("satisfaction_summary").notNull().default("Unknown"), expansionSummary:text("expansion_summary").notNull().default("None recorded"), communicationStatus:text("communication_status").notNull().default("Draft · approval required"), isDemonstration:integer("is_demonstration",{mode:"boolean"}).notNull().default(false), ...timestamps }, table=>[index("clients_project_idx").on(table.projectId),index("clients_renewal_idx").on(table.renewalDate)]);
export const clientStakeholders = sqliteTable("client_stakeholders",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),name:text("name").notNull(),role:text("role").notNull(),consentStatus:text("consent_status").notNull(),communicationPreference:text("communication_preference"),...timestamps});
export const clientGoals = sqliteTable("client_goals",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),objective:text("objective").notNull(),baseline:text("baseline"),target:text("target"),measurementMethod:text("measurement_method").notNull(),owner:text("owner").notNull(),status:text("status").notNull(),evidenceId:text("evidence_id"),...timestamps});
export const successPlans = sqliteTable("success_plans",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),projectId:text("project_id").notNull(),objectivesJson:text("objectives_json").notNull(),stakeholderMapJson:text("stakeholder_map_json").notNull(),milestonesJson:text("milestones_json").notNull(),cadence:text("cadence").notNull(),dependenciesJson:text("dependencies_json").notNull(),trainingNeedsJson:text("training_needs_json").notNull(),supportNeedsJson:text("support_needs_json").notNull(),escalationPath:text("escalation_path").notNull(),status:text("status").notNull().default("Draft"),...timestamps});
export const onboardingTasks = sqliteTable("onboarding_tasks",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),projectId:text("project_id").notNull(),title:text("title").notNull(),owner:text("owner").notNull(),dueDate:text("due_date"),status:text("status").notNull(),evidenceId:text("evidence_id"),...timestamps});
export const adoptionMilestones = sqliteTable("adoption_milestones",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),indicator:text("indicator").notNull(),definition:text("definition").notNull(),source:text("source").notNull(),currentValue:real("current_value"),targetValue:real("target_value"),confidence:text("confidence").notNull(),observedAt:text("observed_at").notNull(),...timestamps});
export const valueMetrics = sqliteTable("value_metrics",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),metric:text("metric").notNull(),definition:text("definition").notNull(),source:text("source").notNull(),baseline:real("baseline"),target:real("target"),currentValue:real("current_value"),period:text("period").notNull(),confidence:text("confidence").notNull(),clientConfirmed:integer("client_confirmed",{mode:"boolean"}).notNull().default(false),limitations:text("limitations").notNull(),...timestamps});
export const clientHealthSnapshots = sqliteTable("client_health_snapshots",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),health:text("health").notNull(),score:integer("score"),evidenceJson:text("evidence_json").notNull(),explanation:text("explanation").notNull(),calculatedAt:text("calculated_at").notNull(),...timestamps},table=>[check("client_health_check",sql`${table.health} in ('Green','Amber','Red','Unknown')`)]);
export const clientFeedback = sqliteTable("client_feedback",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),source:text("source").notNull(),occurredAt:text("occurred_at").notNull(),stakeholderId:text("stakeholder_id"),consent:text("consent").notNull(),topic:text("topic").notNull(),sentiment:text("sentiment").notNull(),requestedOutcome:text("requested_outcome"),severity:text("severity").notNull(),owner:text("owner").notNull(),nextAction:text("next_action").notNull(),resolution:text("resolution"),externalUsePermission:text("external_use_permission").notNull().default("Not granted"),quotation:text("quotation"),internalSummary:text("internal_summary").notNull(),...timestamps});
export const clientCommunications = sqliteTable("client_communications",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),communicationType:text("communication_type").notNull(),audience:text("audience").notNull(),draft:text("draft").notNull(),approvalStatus:text("approval_status").notNull().default("Draft"),approvedBy:text("approved_by"),approvedAt:text("approved_at"),sentAt:text("sent_at"),correlationId:text("correlation_id").notNull(),...timestamps});
export const clientSuccessRecords = sqliteTable("client_success_records",{id:text("id").primaryKey(),clientId:text("client_id").notNull().references(()=>clients.id),recordType:text("record_type").notNull(),status:text("status").notNull(),owner:text("owner").notNull(),dueDate:text("due_date"),contentJson:text("content_json").notNull(),permissionStatus:text("permission_status").notNull(),sharedGoalId:text("shared_goal_id").notNull(),evidenceId:text("evidence_id"),correlationId:text("correlation_id").notNull(),...timestamps});
export const clientSuccessAuditEvents = sqliteTable("client_success_audit_events",{id:text("id").primaryKey(),clientId:text("client_id").notNull(),actor:text("actor").notNull(),action:text("action").notNull(),authority:text("authority").notNull(),previousState:text("previous_state"),newState:text("new_state").notNull(),evidence:text("evidence").notNull(),correlationId:text("correlation_id").notNull(),occurredAt:text("occurred_at").notNull()});

const architectureControlFields = {
  projectId: text("project_id"), productId: text("product_id"), clientId: text("client_id"),
  ownerAgentId: text("owner_agent_id").notNull().references(() => agents.id),
  sharedGoalId: text("shared_goal_id").notNull().references(() => sharedGoals.id),
  correlationId: text("correlation_id").notNull(), evidenceReference: text("evidence_reference").notNull(),
  dataClassification: text("data_classification").notNull().default("Internal"), ...timestamps,
};

export const systems = sqliteTable("systems", { id:text("id").primaryKey(), ...architectureControlFields, name:text("name").notNull(), function:text("function").notNull(), owner:text("owner").notNull(), authoritativeForJson:text("authoritative_for_json").notNull().default("[]"), lifecycleStatus:text("lifecycle_status").notNull().default("Draft"), supportStatus:text("support_status").notNull().default("Supported"), vendor:text("vendor"), securityReviewStatus:text("security_review_status").notNull().default("Not reviewed") }, t=>[index("systems_project_status_idx").on(t.projectId,t.lifecycleStatus)]);
export const applications = sqliteTable("applications", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").notNull().references(()=>systems.id), name:text("name").notNull(), purpose:text("purpose").notNull(), owner:text("owner").notNull(), version:text("version"), supportStatus:text("support_status").notNull().default("Supported") }, t=>[index("applications_system_idx").on(t.systemId)]);
export const technicalComponents = sqliteTable("technical_components", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").notNull().references(()=>systems.id), name:text("name").notNull(), componentType:text("component_type").notNull(), version:text("version"), owner:text("owner").notNull(), vendor:text("vendor"), supportEndDate:text("support_end_date"), status:text("status").notNull().default("Draft") }, t=>[index("technical_components_system_status_idx").on(t.systemId,t.status)]);
export const environments = sqliteTable("environments", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").notNull().references(()=>systems.id), name:text("name").notNull(), environmentType:text("environment_type").notNull(), region:text("region"), identityBoundary:text("identity_boundary").notNull(), backupPolicy:text("backup_policy"), recoveryObjective:text("recovery_objective"), status:text("status").notNull().default("Draft") }, t=>[index("environments_system_type_idx").on(t.systemId,t.environmentType)]);
export const dataSources = sqliteTable("data_sources", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").notNull().references(()=>systems.id), name:text("name").notNull(), sourceType:text("source_type").notNull(), authoritative:integer("authoritative",{mode:"boolean"}).notNull().default(false), owner:text("owner").notNull(), lineage:text("lineage").notNull(), retentionPolicy:text("retention_policy"), freshnessTarget:text("freshness_target"), qualityStatus:text("quality_status").notNull().default("Unknown") }, t=>[index("data_sources_system_authority_idx").on(t.systemId,t.authoritative)]);
export const dataEntities = sqliteTable("data_entities", { id:text("id").primaryKey(), ...architectureControlFields, dataSourceId:text("data_source_id").notNull().references(()=>dataSources.id), name:text("name").notNull(), entityType:text("entity_type").notNull(), canonicalIdPattern:text("canonical_id_pattern").notNull(), unitStandard:text("unit_standard"), classificationStandard:text("classification_standard"), sourceOfTruthRule:text("source_of_truth_rule").notNull() }, t=>[index("data_entities_source_idx").on(t.dataSourceId)]);
export const architectureSchemas = sqliteTable("architecture_schemas", { id:text("id").primaryKey(), ...architectureControlFields, name:text("name").notNull(), purpose:text("purpose").notNull(), format:text("format").notNull(), currentVersion:text("current_version").notNull(), compatibilityPolicy:text("compatibility_policy").notNull(), owner:text("owner").notNull(), status:text("status").notNull().default("Draft") }, t=>[uniqueIndex("architecture_schemas_name_idx").on(t.name)]);
export const schemaVersions = sqliteTable("schema_versions", { id:text("id").primaryKey(), ...architectureControlFields, schemaId:text("schema_id").notNull().references(()=>architectureSchemas.id), version:text("version").notNull(), predecessorVersionId:text("predecessor_version_id"), breaking:integer("breaking",{mode:"boolean"}).notNull().default(false), changeSummary:text("change_summary").notNull(), effectiveAt:text("effective_at"), validationStatus:text("validation_status").notNull().default("Draft") }, t=>[uniqueIndex("schema_versions_schema_version_idx").on(t.schemaId,t.version)]);
export const integrations = sqliteTable("integrations", { id:text("id").primaryKey(), ...architectureControlFields, name:text("name").notNull(), sourceSystemId:text("source_system_id").notNull().references(()=>systems.id), destinationSystemId:text("destination_system_id").notNull().references(()=>systems.id), purpose:text("purpose").notNull(), authoritativeSystemId:text("authoritative_system_id").notNull().references(()=>systems.id), transferMethod:text("transfer_method").notNull(), authenticationMethod:text("authentication_method").notNull(), secretReference:text("secret_reference"), frequency:text("frequency").notNull(), latencyTarget:text("latency_target"), retryPolicy:text("retry_policy").notNull(), idempotencyStrategy:text("idempotency_strategy").notNull(), reconciliationPlan:text("reconciliation_plan").notNull(), supportOwner:text("support_owner").notNull(), rollbackPlan:text("rollback_plan").notNull(), status:text("status").notNull().default("Draft") }, t=>[index("integrations_source_destination_idx").on(t.sourceSystemId,t.destinationSystemId)]);
export const integrationMappings = sqliteTable("integration_mappings", { id:text("id").primaryKey(), ...architectureControlFields, integrationId:text("integration_id").notNull().references(()=>integrations.id), sourceField:text("source_field").notNull(), destinationField:text("destination_field").notNull(), transformation:text("transformation"), sourceSchemaVersionId:text("source_schema_version_id").references(()=>schemaVersions.id), destinationSchemaVersionId:text("destination_schema_version_id").references(()=>schemaVersions.id), validationRule:text("validation_rule").notNull() }, t=>[index("integration_mappings_integration_idx").on(t.integrationId)]);
export const apis = sqliteTable("apis", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").notNull().references(()=>systems.id), name:text("name").notNull(), baseReference:text("base_reference").notNull(), protocol:text("protocol").notNull(), version:text("version").notNull(), authenticationMethod:text("authentication_method").notNull(), authorizationModel:text("authorization_model").notNull(), rateLimits:text("rate_limits"), owner:text("owner").notNull(), status:text("status").notNull().default("Draft") }, t=>[uniqueIndex("apis_system_name_version_idx").on(t.systemId,t.name,t.version)]);
export const technicalDependencies = sqliteTable("technical_dependencies", { id:text("id").primaryKey(), ...architectureControlFields, componentId:text("component_id").notNull().references(()=>technicalComponents.id), dependsOnComponentId:text("depends_on_component_id").references(()=>technicalComponents.id), externalDependency:text("external_dependency"), criticality:text("criticality").notNull(), healthStatus:text("health_status").notNull().default("Unknown"), failureMode:text("failure_mode").notNull(), fallbackPlan:text("fallback_plan"), owner:text("owner").notNull() }, t=>[index("technical_dependencies_component_health_idx").on(t.componentId,t.healthStatus)]);
export const architectureDiagrams = sqliteTable("architecture_diagrams", { id:text("id").primaryKey(), ...architectureControlFields, title:text("title").notNull(), diagramType:text("diagram_type").notNull(), version:text("version").notNull(), artifactReference:text("artifact_reference").notNull(), scope:text("scope").notNull(), verifiedCurrentState:integer("verified_current_state",{mode:"boolean"}).notNull().default(false), status:text("status").notNull().default("Draft") }, t=>[index("architecture_diagrams_type_status_idx").on(t.diagramType,t.status)]);
export const architectureDecisions = sqliteTable("architecture_decisions", { id:text("id").primaryKey(), ...architectureControlFields, context:text("context").notNull(), problem:text("problem").notNull(), constraintsJson:text("constraints_json").notNull().default("[]"), optionsJson:text("options_json").notNull().default("[]"), criteriaJson:text("criteria_json").notNull().default("[]"), securityImplications:text("security_implications").notNull(), costImplications:text("cost_implications").notNull(), operationalImplications:text("operational_implications").notNull(), recommendation:text("recommendation").notNull(), approver:text("approver"), decision:text("decision"), consequences:text("consequences"), validationDate:text("validation_date"), supersedesDecisionId:text("supersedes_decision_id"), status:text("status").notNull().default("Draft") }, t=>[index("architecture_decisions_status_validation_idx").on(t.status,t.validationDate)]);
export const technicalStandards = sqliteTable("technical_standards", { id:text("id").primaryKey(), ...architectureControlFields, title:text("title").notNull(), domain:text("domain").notNull(), version:text("version").notNull(), requirementsJson:text("requirements_json").notNull().default("[]"), owner:text("owner").notNull(), reviewDate:text("review_date"), supersedesStandardId:text("supersedes_standard_id"), status:text("status").notNull().default("Draft") }, t=>[check("technical_standards_status_check",sql`${t.status} in ('Draft','Review','Approved','Active','Superseded','Archived')`),index("technical_standards_domain_status_idx").on(t.domain,t.status)]);
export const technologyEvaluations = sqliteTable("technology_evaluations", { id:text("id").primaryKey(), ...architectureControlFields, technology:text("technology").notNull(), useCase:text("use_case").notNull(), criteriaScoresJson:text("criteria_scores_json").notNull(), securityAssessment:text("security_assessment").notNull(), portabilityAssessment:text("portability_assessment").notNull(), costAssessment:text("cost_assessment").notNull(), exitPath:text("exit_path").notNull(), recommendation:text("recommendation").notNull(), status:text("status").notNull().default("Draft") }, t=>[index("technology_evaluations_status_idx").on(t.status)]);
export const nonfunctionalRequirements = sqliteTable("nonfunctional_requirements", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").references(()=>systems.id), category:text("category").notNull(), requirement:text("requirement").notNull(), measure:text("measure").notNull(), target:text("target").notNull(), verificationMethod:text("verification_method").notNull(), priority:text("priority").notNull(), status:text("status").notNull().default("Draft") }, t=>[index("nfr_system_category_idx").on(t.systemId,t.category)]);
export const technicalRisks = sqliteTable("technical_risks", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").references(()=>systems.id), statement:text("statement").notNull(), probability:integer("probability").notNull(), impact:integer("impact").notNull(), severity:text("severity").notNull(), mitigation:text("mitigation").notNull(), accountableOwner:text("accountable_owner").notNull(), dueDate:text("due_date"), status:text("status").notNull().default("Open") }, t=>[index("technical_risks_severity_status_idx").on(t.severity,t.status)]);
export const technicalDebt = sqliteTable("technical_debt", { id:text("id").primaryKey(), ...architectureControlFields, systemId:text("system_id").references(()=>systems.id), title:text("title").notNull(), description:text("description").notNull(), businessImpact:text("business_impact").notNull(), remediation:text("remediation").notNull(), effortEstimate:text("effort_estimate"), accountableOwner:text("accountable_owner").notNull(), targetDate:text("target_date"), status:text("status").notNull().default("Open") }, t=>[index("technical_debt_system_status_idx").on(t.systemId,t.status)]);
export const technicalRoadmap = sqliteTable("technical_roadmap", { id:text("id").primaryKey(), ...architectureControlFields, title:text("title").notNull(), stage:text("stage").notNull(), outcome:text("outcome").notNull(), dependenciesJson:text("dependencies_json").notNull().default("[]"), accountableOwner:text("accountable_owner").notNull(), targetDate:text("target_date"), acceptanceCriteria:text("acceptance_criteria").notNull(), status:text("status").notNull().default("Planned") }, t=>[index("technical_roadmap_stage_date_idx").on(t.stage,t.targetDate)]);
export const architectureReviews = sqliteTable("architecture_reviews", { id:text("id").primaryKey(), ...architectureControlFields, subjectType:text("subject_type").notNull(), subjectId:text("subject_id").notNull(), reviewer:text("reviewer").notNull(), requirementsTraceability:text("requirements_traceability").notNull(), securityStatus:text("security_status").notNull(), findingsJson:text("findings_json").notNull().default("[]"), acceptanceCriteria:text("acceptance_criteria").notNull(), validationAgentId:text("validation_agent_id").notNull().default("AGT-004"), decisionReference:text("decision_reference"), status:text("status").notNull().default("Draft") }, t=>[index("architecture_reviews_subject_status_idx").on(t.subjectType,t.subjectId,t.status)]);

// AGT-014 stores governance metadata and redacted evidence only. Secret values,
// full payment data, and unnecessary personal data are prohibited.
const governanceRecordFields = {
  owner: text("owner").notNull(), classification: text("classification").notNull().default("Internal"),
  sharedGoalId: text("shared_goal_id").notNull(), correlationId: text("correlation_id").notNull(), reviewDate: text("review_date").notNull(),
  isDemonstration: integer("is_demonstration", { mode: "boolean" }).notNull().default(false), ...timestamps,
};
export const securitySystems = sqliteTable("security_systems", { id:text("id").primaryKey(), name:text("name").notNull(), purpose:text("purpose").notNull(), ...governanceRecordFields, steward:text("steward"), dataStoredJson:text("data_stored_json").notNull().default("[]"), usersJson:text("users_json").notNull().default("[]"), authentication:text("authentication").notNull(), authorization:text("authorization").notNull(), integrationsJson:text("integrations_json").notNull().default("[]"), vendor:text("vendor"), hosting:text("hosting"), environmentsJson:text("environments_json").notNull().default("[]"), logs:text("logs"), backup:text("backup"), recovery:text("recovery"), retention:text("retention"), incidentOwner:text("incident_owner").notNull(), contractStatus:text("contract_status"), riskLevel:text("risk_level").notNull().default("Unknown") }, t=>[index("security_systems_risk_idx").on(t.riskLevel,t.reviewDate)]);
export const dataAssets = sqliteTable("data_assets", { id:text("id").primaryKey(), name:text("name").notNull(), description:text("description").notNull(), ...governanceRecordFields, steward:text("steward"), source:text("source").notNull(), systemId:text("system_id").references(()=>securitySystems.id), purpose:text("purpose").notNull(), dataSubjectsJson:text("data_subjects_json").notNull().default("[]"), client:text("client"), projectId:text("project_id"), geography:text("geography"), accessGroupsJson:text("access_groups_json").notNull().default("[]"), integrationsJson:text("integrations_json").notNull().default("[]"), retention:text("retention"), deletionMethod:text("deletion_method"), backup:text("backup"), recovery:text("recovery"), authorizedBasisSource:text("authorized_basis_source"), risksJson:text("risks_json").notNull().default("[]") }, t=>[index("data_assets_classification_idx").on(t.classification,t.reviewDate)]);
export const dataFieldMetadata = sqliteTable("data_field_metadata", { id:text("id").primaryKey(), dataAssetId:text("data_asset_id").notNull().references(()=>dataAssets.id), name:text("name").notNull(), description:text("description"), classification:text("classification").notNull(), personalData:integer("personal_data",{mode:"boolean"}).notNull().default(false), required:integer("required",{mode:"boolean"}).notNull().default(false), source:text("source").notNull(), ...timestamps }, t=>[index("data_fields_asset_idx").on(t.dataAssetId)]);
export const classifications = sqliteTable("classifications", { id:text("id").primaryKey(), name:text("name").notNull(), definition:text("definition").notNull(), handlingRules:text("handling_rules").notNull(), rank:integer("rank").notNull(), owner:text("owner").notNull(), reviewDate:text("review_date").notNull(), ...timestamps }, t=>[uniqueIndex("classifications_name_idx").on(t.name),check("classifications_name_check",sql`${t.name} in ('Public','Internal','Confidential','Restricted')`)]);
export const dataOwners = sqliteTable("data_owners", { id:text("id").primaryKey(), subjectType:text("subject_type").notNull(), subjectId:text("subject_id").notNull(), owner:text("owner").notNull(), steward:text("steward"), approvalReference:text("approval_reference"), effectiveAt:text("effective_at").notNull(), reviewDate:text("review_date").notNull(), ...timestamps }, t=>[uniqueIndex("data_owners_subject_idx").on(t.subjectType,t.subjectId)]);
export const accessRoles = sqliteTable("access_roles", { id:text("id").primaryKey(), systemId:text("system_id").notNull().references(()=>securitySystems.id), name:text("name").notNull(), businessNeed:text("business_need").notNull(), permissionsJson:text("permissions_json").notNull().default("[]"), environment:text("environment").notNull(), classificationCeiling:text("classification_ceiling").notNull(), owner:text("owner").notNull(), recertificationDays:integer("recertification_days").notNull(), ...timestamps }, t=>[uniqueIndex("access_roles_system_name_idx").on(t.systemId,t.name)]);
export const accessReviews = sqliteTable("access_reviews", { id:text("id").primaryKey(), systemId:text("system_id").notNull().references(()=>securitySystems.id), roleId:text("role_id").references(()=>accessRoles.id), subjectReference:text("subject_reference").notNull(), businessNeed:text("business_need"), reviewer:text("reviewer").notNull(), recommendation:text("recommendation").notNull(), excessiveAccess:integer("excessive_access",{mode:"boolean"}).notNull().default(false), expiresAt:text("expires_at"), evidence:text("evidence").notNull(), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("access_reviews_due_idx").on(t.reviewDate,t.status)]);
export const accessRequestMetadata = sqliteTable("access_request_metadata", { id:text("id").primaryKey(), systemId:text("system_id").notNull().references(()=>securitySystems.id), requester:text("requester").notNull(), requestedRole:text("requested_role").notNull(), businessNeed:text("business_need").notNull(), duration:text("duration").notNull(), environment:text("environment").notNull(), approvalReference:text("approval_reference"), recommendation:text("recommendation").notNull(), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("access_requests_status_idx").on(t.status,t.reviewDate)]);
export const dataUses = sqliteTable("data_uses", { id:text("id").primaryKey(), dataAssetId:text("data_asset_id").notNull().references(()=>dataAssets.id), actorType:text("actor_type").notNull(), actorId:text("actor_id").notNull(), authorizedPurpose:text("authorized_purpose").notNull(), minimumFieldsJson:text("minimum_fields_json").notNull().default("[]"), providerTermsSource:text("provider_terms_source"), modelTrainingPolicy:text("model_training_policy"), logging:text("logging"), deletionPath:text("deletion_path"), correctionPath:text("correction_path"), humanApproval:text("human_approval"), downstreamSharingJson:text("downstream_sharing_json").notNull().default("[]"), recommendation:text("recommendation").notNull(), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("data_uses_asset_status_idx").on(t.dataAssetId,t.status)]);
export const processingActivities = sqliteTable("processing_activities", { id:text("id").primaryKey(), name:text("name").notNull(), dataAssetsJson:text("data_assets_json").notNull(), purpose:text("purpose").notNull(), dataSubjectsJson:text("data_subjects_json").notNull(), recipientsJson:text("recipients_json").notNull(), geography:text("geography"), authorizedBasisSource:text("authorized_basis_source"), retentionRuleId:text("retention_rule_id"), ...governanceRecordFields }, t=>[index("processing_activities_review_idx").on(t.reviewDate)]);
export const retentionRules = sqliteTable("retention_rules", { id:text("id").primaryKey(), name:text("name").notNull(), source:text("source").notNull(), owner:text("owner").notNull(), scope:text("scope").notNull(), period:text("period").notNull(), trigger:text("trigger").notNull(), exceptions:text("exceptions"), approvalReference:text("approval_reference").notNull(), reviewDate:text("review_date").notNull(), ...timestamps }, t=>[index("retention_rules_review_idx").on(t.reviewDate)]);
export const disposalRequests = sqliteTable("disposal_requests", { id:text("id").primaryKey(), dataAssetId:text("data_asset_id").notNull().references(()=>dataAssets.id), requestedBy:text("requested_by").notNull(), scope:text("scope").notNull(), authorityReference:text("authority_reference"), evidence:text("evidence").notNull(), recommendation:text("recommendation").notNull(), status:text("status").notNull().default("Pending approval"), ...governanceRecordFields }, t=>[index("disposal_requests_status_idx").on(t.status)]);
export const securityVendors = sqliteTable("security_vendors", { id:text("id").primaryKey(), name:text("name").notNull(), servicePurpose:text("service_purpose").notNull(), dataSharedJson:text("data_shared_json").notNull().default("[]"), hosting:text("hosting"), subprocessorsSource:text("subprocessors_source"), retention:text("retention"), deletion:text("deletion"), exportCapability:text("export_capability"), breachNotificationSource:text("breach_notification_source"), authentication:text("authentication"), apiSecurity:text("api_security"), contractStatus:text("contract_status"), exitPlan:text("exit_plan"), ...governanceRecordFields }, t=>[index("security_vendors_review_idx").on(t.reviewDate)]);
export const vendorAssessments = sqliteTable("vendor_assessments", { id:text("id").primaryKey(), vendorId:text("vendor_id").notNull().references(()=>securityVendors.id), assessor:text("assessor").notNull(), findingsJson:text("findings_json").notNull().default("[]"), evidence:text("evidence").notNull(), recommendation:text("recommendation").notNull(), approver:text("approver"), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("vendor_assessments_status_idx").on(t.status,t.reviewDate)]);
export const securityControls = sqliteTable("security_controls", { id:text("id").primaryKey(), name:text("name").notNull(), objective:text("objective").notNull(), owner:text("owner").notNull(), implementationStatus:text("implementation_status").notNull(), evidenceRequired:text("evidence_required").notNull(), reviewDate:text("review_date").notNull(), ...timestamps }, t=>[index("security_controls_status_idx").on(t.implementationStatus,t.reviewDate)]);
export const controlEvidence = sqliteTable("control_evidence", { id:text("id").primaryKey(), controlId:text("control_id").notNull().references(()=>securityControls.id), source:text("source").notNull(), redactedEvidence:text("redacted_evidence").notNull(), contentHash:text("content_hash").notNull(), observedAt:text("observed_at").notNull(), observer:text("observer").notNull(), expiresAt:text("expires_at"), ...timestamps }, t=>[index("control_evidence_control_idx").on(t.controlId,t.observedAt)]);
export const securityReviews = sqliteTable("security_reviews", { id:text("id").primaryKey(), subjectType:text("subject_type").notNull(), subjectId:text("subject_id").notNull(), scopeJson:text("scope_json").notNull(), reviewer:text("reviewer").notNull(), findingsJson:text("findings_json").notNull().default("[]"), recommendation:text("recommendation").notNull(), approver:text("approver"), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("security_reviews_status_idx").on(t.status,t.reviewDate)]);
export const securityRisks = sqliteTable("security_risks", { id:text("id").primaryKey(), asset:text("asset").notNull(), threat:text("threat").notNull(), vulnerability:text("vulnerability").notNull(), likelihood:text("likelihood").notNull(), impact:text("impact").notNull(), existingControlsJson:text("existing_controls_json").notNull().default("[]"), residualRisk:text("residual_risk").notNull(), evidence:text("evidence").notNull(), action:text("action").notNull(), dueDate:text("due_date").notNull(), approver:text("approver"), status:text("status").notNull().default("Open"), ...governanceRecordFields }, t=>[index("security_risks_status_due_idx").on(t.status,t.dueDate)]);
export const securityExceptions = sqliteTable("security_exceptions", { id:text("id").primaryKey(), policyOrControl:text("policy_or_control").notNull(), reason:text("reason").notNull(), scope:text("scope").notNull(), affectedSystemsJson:text("affected_systems_json").notNull(), affectedDataJson:text("affected_data_json").notNull(), risk:text("risk").notNull(), compensatingControlsJson:text("compensating_controls_json").notNull(), approver:text("approver"), startDate:text("start_date").notNull(), expiresAt:text("expires_at").notNull(), closureEvidence:text("closure_evidence"), status:text("status").notNull().default("Draft"), ...governanceRecordFields }, t=>[index("security_exceptions_expiry_idx").on(t.expiresAt,t.status)]);
export const securityCorrectiveActions = sqliteTable("security_corrective_actions", { id:text("id").primaryKey(), sourceType:text("source_type").notNull(), sourceId:text("source_id").notNull(), title:text("title").notNull(), owner:text("owner").notNull(), dueDate:text("due_date").notNull(), validationCriteria:text("validation_criteria").notNull(), status:text("status").notNull().default("Open"), closureEvidence:text("closure_evidence"), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), ...timestamps }, t=>[index("security_corrective_due_idx").on(t.status,t.dueDate)]);
export const securityAuditEvents = sqliteTable("security_audit_events", { id:text("id").primaryKey(), actor:text("actor").notNull(), action:text("action").notNull(), subjectType:text("subject_type").notNull(), subjectId:text("subject_id").notNull(), authority:text("authority").notNull(), classification:text("classification").notNull(), redactedEvidence:text("redacted_evidence").notNull(), result:text("result").notNull(), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), occurredAt:text("occurred_at").notNull() }, t=>[index("security_audit_subject_idx").on(t.subjectType,t.subjectId,t.occurredAt)]);

// AGT-010 Product & Service Architecture. Product records carry explicit links
// to the shared operating graph; child records inherit product + correlation context.
const productRecordFields = { productId:text("product_id").notNull(), ownerAgentId:text("owner_agent_id").notNull().default("AGT-010"), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), evidenceReference:text("evidence_reference").notNull(), isDemonstration:integer("is_demonstration",{mode:"boolean"}).notNull().default(false), ...timestamps };
export const products = sqliteTable("products", { id:text("id").primaryKey(), name:text("name").notNull(), targetClient:text("target_client").notNull(), clientProblem:text("client_problem").notNull(), intendedOutcome:text("intended_outcome").notNull(), scope:text("scope").notNull(), exclusionsJson:text("exclusions_json").notNull().default("[]"), deliverablesJson:text("deliverables_json").notNull().default("[]"), clientResponsibilitiesJson:text("client_responsibilities_json").notNull().default("[]"), requiredInputsJson:text("required_inputs_json").notNull().default("[]"), dependenciesJson:text("dependencies_json").notNull().default("[]"), deliveryMethod:text("delivery_method").notNull(), configurableOptionsJson:text("configurable_options_json").notNull().default("[]"), estimatedDuration:text("estimated_duration").notNull(), costDriversJson:text("cost_drivers_json").notNull().default("[]"), pricingInputsJson:text("pricing_inputs_json").notNull().default("[]"), qualityPlan:text("quality_plan").notNull(), securityRequirements:text("security_requirements").notNull(), supportModel:text("support_model").notNull(), recurringComponent:text("recurring_component").notNull(), successMetricsJson:text("success_metrics_json").notNull().default("[]"), lifecycleStatus:text("lifecycle_status").notNull().default("Idea"), health:text("health").notNull().default("Unknown"), currentVersion:text("current_version").notNull().default("0.1.0"), owner:text("owner").notNull(), ownerAgentId:text("owner_agent_id").notNull().default("AGT-010"), sharedGoalId:text("shared_goal_id").notNull(), projectLinksJson:text("project_links_json").notNull().default("[]"), opportunityLinksJson:text("opportunity_links_json").notNull().default("[]"), clientLinksJson:text("client_links_json").notNull().default("[]"), evidenceLinksJson:text("evidence_links_json").notNull().default("[]"), decisionLinksJson:text("decision_links_json").notNull().default("[]"), correlationId:text("correlation_id").notNull(), proposalEligible:integer("proposal_eligible",{mode:"boolean"}).notNull().default(false), recurringRevenuePotential:text("recurring_revenue_potential").notNull().default("Unknown"), grossMarginForecast:real("gross_margin_forecast"), adoptionRate:real("adoption_rate"), deliveryVariation:real("delivery_variation"), openQualityFindings:integer("open_quality_findings").notNull().default(0), unresolvedAssumptions:integer("unresolved_assumptions").notNull().default(0), feedbackSummary:text("feedback_summary").notNull().default("No validated feedback"), isDemonstration:integer("is_demonstration",{mode:"boolean"}).notNull().default(false), ...timestamps }, t=>[check("products_lifecycle_check",sql`${t.lifecycleStatus} in ('Idea','Discovery','Validation','Pilot','Active','Scaling','Sunset','Retired')`),index("products_lifecycle_health_idx").on(t.lifecycleStatus,t.health)]);
export const productVersions = sqliteTable("product_versions", { id:text("id").primaryKey(), ...productRecordFields, version:text("version").notNull(), predecessorVersionId:text("predecessor_version_id"), changeSummary:text("change_summary").notNull(), definitionJson:text("definition_json").notNull(), approvalStatus:text("approval_status").notNull().default("Draft"), approvalDecisionId:text("approval_decision_id"), proposalEligible:integer("proposal_eligible",{mode:"boolean"}).notNull().default(false), effectiveAt:text("effective_at"), supersededAt:text("superseded_at") }, t=>[uniqueIndex("product_versions_product_version_idx").on(t.productId,t.version)]);
export const productConcepts = sqliteTable("product_concepts", { id:text("id").primaryKey(), name:text("name").notNull(), clientProblemId:text("client_problem_id"), audience:text("audience").notNull(), frequency:text("frequency").notNull(), currentWorkaround:text("current_workaround").notNull(), valueHypothesis:text("value_hypothesis").notNull(), riskSummary:text("risk_summary").notNull(), strategicFit:text("strategic_fit").notNull(), qualificationScoresJson:text("qualification_scores_json").notNull(), qualificationScore:real("qualification_score").notNull(), classification:text("classification").notNull(), ownerAgentId:text("owner_agent_id").notNull().default("AGT-010"), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), evidenceReference:text("evidence_reference").notNull(), status:text("status").notNull().default("Draft"), ...timestamps }, t=>[index("product_concepts_classification_idx").on(t.classification,t.qualificationScore)]);
export const productModules = sqliteTable("product_modules", { id:text("id").primaryKey(), name:text("name").notNull(), version:text("version").notNull(), capability:text("capability").notNull(), inputsJson:text("inputs_json").notNull(), outputsJson:text("outputs_json").notNull(), interfacesJson:text("interfaces_json").notNull(), assumptionsJson:text("assumptions_json").notNull().default("[]"), exclusionsJson:text("exclusions_json").notNull().default("[]"), effortDriversJson:text("effort_drivers_json").notNull(), acceptanceCriteriaJson:text("acceptance_criteria_json").notNull(), compatibleModulesJson:text("compatible_modules_json").notNull().default("[]"), ownerAgentId:text("owner_agent_id").notNull().default("AGT-010"), status:text("status").notNull().default("Draft"), ...timestamps }, t=>[uniqueIndex("product_modules_name_version_idx").on(t.name,t.version)]);
export const moduleDependencies = sqliteTable("module_dependencies", { id:text("id").primaryKey(), moduleId:text("module_id").notNull().references(()=>productModules.id), dependsOnModuleId:text("depends_on_module_id").notNull().references(()=>productModules.id), dependencyType:text("dependency_type").notNull(), constraintSummary:text("constraint_summary").notNull(), ...timestamps }, t=>[uniqueIndex("module_dependencies_pair_idx").on(t.moduleId,t.dependsOnModuleId)]);
export const productRequirements = sqliteTable("product_requirements", { id:text("id").primaryKey(), ...productRecordFields, requirementType:text("requirement_type").notNull(), statement:text("statement").notNull(), priority:text("priority").notNull(), verificationMethod:text("verification_method").notNull(), status:text("status").notNull().default("Draft") }, t=>[index("product_requirements_product_type_idx").on(t.productId,t.requirementType)]);
export const clientProblems = sqliteTable("client_problems", { id:text("id").primaryKey(), statement:text("statement").notNull(), audience:text("audience").notNull(), severity:integer("severity").notNull(), frequency:text("frequency").notNull(), currentWorkaround:text("current_workaround").notNull(), evidenceReference:text("evidence_reference").notNull(), ownerAgentId:text("owner_agent_id").notNull().default("AGT-010"), sharedGoalId:text("shared_goal_id").notNull(), correlationId:text("correlation_id").notNull(), ...timestamps }, t=>[index("client_problems_audience_idx").on(t.audience)]);
export const useCases = sqliteTable("use_cases", { id:text("id").primaryKey(), ...productRecordFields, actor:text("actor").notNull(), trigger:text("trigger").notNull(), desiredOutcome:text("desired_outcome").notNull(), preconditionsJson:text("preconditions_json").notNull().default("[]"), flowJson:text("flow_json").notNull(), exceptionsJson:text("exceptions_json").notNull().default("[]") }, t=>[index("use_cases_product_idx").on(t.productId)]);
export const productAcceptanceCriteria = sqliteTable("product_acceptance_criteria", { id:text("id").primaryKey(), ...productRecordFields, deliverableReference:text("deliverable_reference").notNull(), criterion:text("criterion").notNull(), measure:text("measure").notNull(), threshold:text("threshold").notNull(), verificationMethod:text("verification_method").notNull(), reviewer:text("reviewer").notNull(), status:text("status").notNull().default("Draft") }, t=>[index("product_acceptance_criteria_status_idx").on(t.productId,t.status)]);
export const productExperiments = sqliteTable("product_experiments", { id:text("id").primaryKey(), ...productRecordFields, productVersionId:text("product_version_id").notNull().references(()=>productVersions.id), hypothesis:text("hypothesis").notNull(), riskiestAssumption:text("riskiest_assumption").notNull(), baseline:text("baseline").notNull(), successCriteria:text("success_criteria").notNull(), failureCriteria:text("failure_criteria").notNull(), boundedScope:text("bounded_scope").notNull(), approvalDecisionId:text("approval_decision_id"), status:text("status").notNull().default("Draft") }, t=>[index("product_experiments_product_status_idx").on(t.productId,t.status)]);
export const pilotResults = sqliteTable("pilot_results", { id:text("id").primaryKey(), experimentId:text("experiment_id").notNull().references(()=>productExperiments.id), clientOutcome:text("client_outcome").notNull(), deliveryEffort:text("delivery_effort").notNull(), defects:integer("defects").notNull().default(0), marginActual:real("margin_actual"), reusableAssetsJson:text("reusable_assets_json").notNull().default("[]"), exceptionsJson:text("exceptions_json").notNull().default("[]"), conclusion:text("conclusion").notNull(), evidenceReference:text("evidence_reference").notNull(), observedAt:text("observed_at").notNull(), ...timestamps }, t=>[index("pilot_results_experiment_idx").on(t.experimentId)]);
export const productMetrics = sqliteTable("product_metrics", { id:text("id").primaryKey(), ...productRecordFields, metricName:text("metric_name").notNull(), value:real("value"), unit:text("unit").notNull(), baseline:real("baseline"), target:real("target"), windowStart:text("window_start").notNull(), windowEnd:text("window_end").notNull(), confidence:text("confidence").notNull() }, t=>[index("product_metrics_product_window_idx").on(t.productId,t.windowEnd)]);
export const productEconomics = sqliteTable("product_economics", { id:text("id").primaryKey(), ...productRecordFields, productVersionId:text("product_version_id").notNull().references(()=>productVersions.id), deliveryCost:real("delivery_cost"), softwareCost:real("software_cost"), supportCost:real("support_cost"), implementationCost:real("implementation_cost"), contingencyCost:real("contingency_cost"), recurringRevenueContribution:real("recurring_revenue_contribution"), grossMarginForecast:real("gross_margin_forecast"), paybackMonths:real("payback_months"), capacityRequirement:text("capacity_requirement"), pricingSensitivity:text("pricing_sensitivity"), currency:text("currency").notNull().default("USD"), financeReviewStatus:text("finance_review_status").notNull().default("Required"), pricingApprovalStatus:text("pricing_approval_status").notNull().default("Not approved") }, t=>[index("product_economics_product_version_idx").on(t.productId,t.productVersionId)]);
export const productRisks = sqliteTable("product_risks", { id:text("id").primaryKey(), ...productRecordFields, category:text("category").notNull(), statement:text("statement").notNull(), probability:integer("probability").notNull(), impact:integer("impact").notNull(), response:text("response").notNull(), owner:text("owner").notNull(), status:text("status").notNull().default("Open") }, t=>[index("product_risks_product_status_idx").on(t.productId,t.status)]);
export const productDecisions = sqliteTable("product_decisions", { id:text("id").primaryKey(), ...productRecordFields, decisionType:text("decision_type").notNull(), recommendation:text("recommendation").notNull(), decision:text("decision"), approver:text("approver"), approvalEvidence:text("approval_evidence"), effectiveAt:text("effective_at"), status:text("status").notNull().default("Draft") }, t=>[index("product_decisions_product_status_idx").on(t.productId,t.status)]);
export const roadmapItems = sqliteTable("roadmap_items", { id:text("id").primaryKey(), ...productRecordFields, title:text("title").notNull(), lane:text("lane").notNull().default("Candidate"), outcome:text("outcome").notNull(), clientImpact:integer("client_impact").notNull(), revenuePotential:integer("revenue_potential").notNull(), recurringRevenue:integer("recurring_revenue").notNull(), strategicLeverage:integer("strategic_leverage").notNull(), riskReduction:integer("risk_reduction").notNull(), deliveryEffort:integer("delivery_effort").notNull(), reusableIp:integer("reusable_ip").notNull(), timeToValue:integer("time_to_value").notNull(), dependencySummary:text("dependency_summary").notNull(), targetDate:text("target_date"), acceptanceCriteria:text("acceptance_criteria").notNull(), commitmentDecisionId:text("commitment_decision_id"), status:text("status").notNull().default("Candidate") }, t=>[check("roadmap_items_lane_check",sql`${t.lane} in ('Committed','Candidate')`),index("roadmap_items_lane_date_idx").on(t.lane,t.targetDate)]);
export const productFeedback = sqliteTable("product_feedback", { id:text("id").primaryKey(), ...productRecordFields, sourceAgentId:text("source_agent_id").notNull(), sourceType:text("source_type").notNull(), summary:text("summary").notNull(), recurrenceCount:integer("recurrence_count").notNull().default(1), clientImpact:text("client_impact").notNull(), proposedImprovement:text("proposed_improvement").notNull(), status:text("status").notNull().default("New") }, t=>[index("product_feedback_product_status_idx").on(t.productId,t.status)]);
export const productKnowledgeLinks = sqliteTable("product_knowledge_links", { id:text("id").primaryKey(), ...productRecordFields, knowledgeType:text("knowledge_type").notNull(), knowledgeId:text("knowledge_id").notNull(), relationship:text("relationship").notNull(), versionReference:text("version_reference") }, t=>[index("product_knowledge_links_product_idx").on(t.productId)]);

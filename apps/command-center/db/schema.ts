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

CREATE TABLE `cash_forecasts` (
	`id` text PRIMARY KEY NOT NULL,
	`forecast_version_id` text NOT NULL,
	`scenario` text NOT NULL,
	`opening_cash` real,
	`expected_collections` real,
	`approved_outflows` real,
	`closing_cash` real,
	`runway_months` real,
	`known_exclusions_json` text DEFAULT '[]' NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`forecast_version_id`) REFERENCES `forecast_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cash_forecasts_scenario_period_idx` ON `cash_forecasts` (`scenario`,`period`);--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`project_id` text NOT NULL,
	`executed_at` text,
	`contract_value` real NOT NULL,
	`approved_changes` real DEFAULT 0 NOT NULL,
	`billing_schedule_json` text DEFAULT '[]' NOT NULL,
	`legal_entity` text NOT NULL,
	`status` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contracts_project_status_idx` ON `contracts` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`vendor_id` text,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`expense_date` text NOT NULL,
	`approval_status` text NOT NULL,
	`business_purpose` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `expenses_period_category_idx` ON `expenses` (`period`,`category`);--> statement-breakpoint
CREATE TABLE `financial_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`requested_action` text NOT NULL,
	`requested_by` text NOT NULL,
	`approver` text NOT NULL,
	`decision` text,
	`decision_evidence` text,
	`decided_at` text,
	`expires_at` text,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `financial_approvals_subject_idx` ON `financial_approvals` (`subject_type`,`subject_id`);--> statement-breakpoint
CREATE TABLE `financial_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`authority` text NOT NULL,
	`redacted_evidence` text NOT NULL,
	`result` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `financial_audit_subject_time_idx` ON `financial_audit_events` (`subject_type`,`subject_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `financial_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`owner` text NOT NULL,
	`closed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `financial_periods_period_idx` ON `financial_periods` (`period`);--> statement-breakpoint
CREATE TABLE `financial_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`source_type` text NOT NULL,
	`authoritative_for_json` text DEFAULT '[]' NOT NULL,
	`last_refresh` text,
	`owner` text NOT NULL,
	`connection_status` text DEFAULT 'Not connected' NOT NULL,
	`data_classification` text DEFAULT 'Confidential' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `forecast_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`scenario` text NOT NULL,
	`version` text NOT NULL,
	`prior_version_id` text,
	`variance_explanation` text NOT NULL,
	`approved_by` text,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forecast_versions_name_version_idx` ON `forecast_versions` (`name`,`version`);--> statement-breakpoint
CREATE TABLE `invoice_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`contract_id` text NOT NULL,
	`name` text NOT NULL,
	`scheduled_date` text,
	`amount` real NOT NULL,
	`readiness_status` text NOT NULL,
	`missing_evidence_json` text DEFAULT '[]' NOT NULL,
	`remaining_contract_balance` real NOT NULL,
	`approval_owner` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `invoice_milestones_status_date_idx` ON `invoice_milestones` (`readiness_status`,`scheduled_date`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`client_id` text NOT NULL,
	`invoice_number` text,
	`issue_date` text,
	`due_date` text,
	`amount` real NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`approval_owner` text NOT NULL,
	`approval_reference` text,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `invoices_project_status_idx` ON `invoices` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `payments_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`payment_reference` text NOT NULL,
	`received_date` text NOT NULL,
	`amount` real NOT NULL,
	`match_status` text NOT NULL,
	`evidence` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_invoice_match_idx` ON `payments_metadata` (`invoice_id`,`match_status`);--> statement-breakpoint
CREATE TABLE `project_actuals` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`invoiced_value` real DEFAULT 0 NOT NULL,
	`collected_value` real DEFAULT 0 NOT NULL,
	`actual_labor` real DEFAULT 0 NOT NULL,
	`software_cost` real DEFAULT 0 NOT NULL,
	`travel_cost` real DEFAULT 0 NOT NULL,
	`subcontractor_cost` real DEFAULT 0 NOT NULL,
	`other_direct_cost` real DEFAULT 0 NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `project_actuals_project_period_idx` ON `project_actuals` (`project_id`,`period`);--> statement-breakpoint
CREATE TABLE `project_budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`contract_value` real NOT NULL,
	`planned_labor` real NOT NULL,
	`software_cost` real DEFAULT 0 NOT NULL,
	`travel_cost` real DEFAULT 0 NOT NULL,
	`subcontractor_cost` real DEFAULT 0 NOT NULL,
	`other_direct_cost` real DEFAULT 0 NOT NULL,
	`baseline_margin` real NOT NULL,
	`version` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_budgets_project_version_idx` ON `project_budgets` (`project_id`,`version`);--> statement-breakpoint
CREATE TABLE `project_forecasts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`forecast_version_id` text NOT NULL,
	`remaining_effort` real,
	`gross_profit` real,
	`gross_margin` real,
	`baseline_margin` real,
	`margin_variance` real,
	`health` text NOT NULL,
	`risks_json` text DEFAULT '[]' NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`forecast_version_id`) REFERENCES `forecast_versions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "project_forecasts_health_check" CHECK("project_forecasts"."health" in ('Green','Amber','Red'))
);
--> statement-breakpoint
CREATE INDEX `project_forecasts_health_period_idx` ON `project_forecasts` (`health`,`period`);--> statement-breakpoint
CREATE TABLE `receivables` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`client_id` text NOT NULL,
	`project_id` text NOT NULL,
	`issue_date` text NOT NULL,
	`due_date` text NOT NULL,
	`amount` real NOT NULL,
	`amount_received` real DEFAULT 0 NOT NULL,
	`balance` real NOT NULL,
	`days_outstanding` integer NOT NULL,
	`dispute_status` text DEFAULT 'None' NOT NULL,
	`collection_owner` text,
	`next_action` text,
	`promised_payment_date` text,
	`evidence` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `receivables_age_status_idx` ON `receivables` (`days_outstanding`,`dispute_status`);--> statement-breakpoint
CREATE TABLE `reconciliation_items` (
	`id` text PRIMARY KEY NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`authoritative_source` text NOT NULL,
	`authoritative_value` real,
	`operational_value` real,
	`variance` real,
	`reason` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`owner` text NOT NULL,
	`required_action` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reconciliation_items_status_idx` ON `reconciliation_items` (`status`,`period`);--> statement-breakpoint
CREATE TABLE `recurring_revenue` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`contract_id` text NOT NULL,
	`amount` real NOT NULL,
	`cadence` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`status` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recurring_revenue_period_status_idx` ON `recurring_revenue` (`period`,`status`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`service` text NOT NULL,
	`annual_cost` real NOT NULL,
	`renewal_date` text NOT NULL,
	`cancellation_window_date` text,
	`usage_evidence` text,
	`approval_status` text NOT NULL,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subscriptions_renewal_idx` ON `subscriptions` (`renewal_date`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`business_purpose` text NOT NULL,
	`status` text NOT NULL,
	`contract_reference` text,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP INDEX `financial_exceptions_status_idx`;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `record_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `escalated_to` text;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `period` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `currency` text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `source_system` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `refreshed_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `assumptions_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `confidence` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `shared_goal_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `correlation_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_exceptions` ADD `is_demonstration` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `financial_exceptions_severity_status_idx` ON `financial_exceptions` (`severity`,`status`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_financial_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`metric_name` text NOT NULL,
	`definition` text NOT NULL,
	`value` real,
	`unit` text NOT NULL,
	`category` text NOT NULL,
	`calculation_method` text NOT NULL,
	`authoritative_variance` real,
	`period` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text DEFAULT 'Unreconciled' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "financial_snapshots_category_check" CHECK("__new_financial_snapshots"."category" in ('actual','committed','invoiced','collected','accrued','forecast','budget','estimate','assumption'))
);
--> statement-breakpoint
INSERT INTO `__new_financial_snapshots`("id", "metric_name", "definition", "value", "unit", "category", "calculation_method", "authoritative_variance", "period", "currency", "source_system", "source_record", "refreshed_at", "owner", "assumptions_json", "confidence", "reconciliation_status", "shared_goal_id", "correlation_id", "is_demonstration", "created_at", "updated_at") SELECT "id", "metric_name", "definition", "value", "unit", "category", "calculation_method", "authoritative_variance", "period", "currency", "source_system", "source_record", "refreshed_at", "owner", "assumptions_json", "confidence", "reconciliation_status", 'GOAL-2026-006', 'CORR-MIGRATED-' || "id", 1, "created_at", "updated_at" FROM `financial_snapshots`;--> statement-breakpoint
DROP TABLE `financial_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_financial_snapshots` RENAME TO `financial_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `financial_snapshots_metric_period_idx` ON `financial_snapshots` (`metric_name`,`period`);

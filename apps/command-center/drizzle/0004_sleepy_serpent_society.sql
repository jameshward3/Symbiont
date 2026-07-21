CREATE TABLE `affected_records` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`record_reference` text NOT NULL,
	`authoritative_source` text NOT NULL,
	`condition` text NOT NULL,
	`material_change_approval` text,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `affected_records_incident_idx` ON `affected_records` (`incident_id`);--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`alert_type` text NOT NULL,
	`severity` text NOT NULL,
	`acknowledged_by` text,
	`acknowledged_at` text
);
--> statement-breakpoint
CREATE INDEX `alerts_severity_time_idx` ON `alerts` (`severity`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `automation_dependencies` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`dependency_name` text NOT NULL,
	`dependency_type` text NOT NULL,
	`owner` text,
	`health_state` text DEFAULT 'Unknown' NOT NULL,
	`last_checked_at` text,
	`evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `automation_dependencies_health_idx` ON `automation_dependencies` (`automation_id`,`health_state`);--> statement-breakpoint
CREATE TABLE `automation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`state` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`duration_ms` integer,
	`records_processed` integer DEFAULT 0 NOT NULL,
	`success_count` integer DEFAULT 0 NOT NULL,
	`failure_count` integer DEFAULT 0 NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`duplicate_count` integer DEFAULT 0 NOT NULL,
	`idempotency_key` text NOT NULL,
	`approval_reference` text,
	`evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `automation_runs_idempotency_idx` ON `automation_runs` (`automation_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `automation_runs_goal_corr_idx` ON `automation_runs` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `automation_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`version` text NOT NULL,
	`change_id` text NOT NULL,
	`configuration_hash` text NOT NULL,
	`test_evidence` text NOT NULL,
	`approver` text,
	`rollout_plan` text NOT NULL,
	`monitoring_plan` text NOT NULL,
	`rollback_plan` text NOT NULL,
	`success_criteria` text NOT NULL,
	`validation_window` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `automation_versions_unique_idx` ON `automation_versions` (`automation_id`,`version`);--> statement-breakpoint
CREATE TABLE `automations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner` text,
	`business_process` text NOT NULL,
	`connected_agents_json` text DEFAULT '[]' NOT NULL,
	`shared_goals_json` text DEFAULT '[]' NOT NULL,
	`trigger` text NOT NULL,
	`schedule` text,
	`inputs_json` text NOT NULL,
	`outputs_json` text NOT NULL,
	`systems_json` text NOT NULL,
	`data_classification` text NOT NULL,
	`authority_level` text NOT NULL,
	`approval_gates_json` text NOT NULL,
	`expected_duration_ms` integer,
	`expected_volume` integer,
	`timeout_ms` integer NOT NULL,
	`retry_policy_json` text NOT NULL,
	`idempotency_strategy` text NOT NULL,
	`rollback_procedure` text NOT NULL,
	`kill_switch_reference` text NOT NULL,
	`success_criteria` text NOT NULL,
	`health_check_method` text NOT NULL,
	`escalation_path` text NOT NULL,
	`release_status` text DEFAULT 'Draft' NOT NULL,
	`health_state` text DEFAULT 'Unknown' NOT NULL,
	`review_date` text NOT NULL,
	`controls_json` text DEFAULT '[]' NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "automations_health_check" CHECK("automations"."health_state" in ('Healthy','Degraded','Failing','Paused','Recovering','Disabled','Unknown'))
);
--> statement-breakpoint
CREATE INDEX `automations_health_release_idx` ON `automations` (`health_state`,`release_status`);--> statement-breakpoint
CREATE TABLE `health_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`check_type` text NOT NULL,
	`observed_value` text,
	`expected_value` text,
	`state` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `health_checks_automation_time_idx` ON `health_checks` (`automation_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `heartbeats` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`expected_at` text NOT NULL,
	`received_at` text,
	`late_by_ms` integer
);
--> statement-breakpoint
CREATE INDEX `heartbeats_expected_idx` ON `heartbeats` (`automation_id`,`expected_at`);--> statement-breakpoint
CREATE TABLE `idempotency_records` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`run_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`result_reference` text,
	`state` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idempotency_records_key_idx` ON `idempotency_records` (`automation_id`,`idempotency_key`);--> statement-breakpoint
CREATE TABLE `incident_events` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`event_type` text NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `incident_events_incident_time_idx` ON `incident_events` (`incident_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`severity` text NOT NULL,
	`status` text DEFAULT 'Detected' NOT NULL,
	`detected_at` text NOT NULL,
	`affected_systems_json` text NOT NULL,
	`affected_records_summary` text NOT NULL,
	`evidence` text NOT NULL,
	`containment_status` text NOT NULL,
	`business_impact` text NOT NULL,
	`owner` text NOT NULL,
	`decision_required` text NOT NULL,
	`next_action` text NOT NULL,
	`recovery_target` text NOT NULL,
	`resolved_at` text,
	`closed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "incidents_severity_check" CHECK("incidents"."severity" in ('SEV-1','SEV-2','SEV-3','SEV-4'))
);
--> statement-breakpoint
CREATE INDEX `incidents_severity_status_idx` ON `incidents` (`severity`,`status`);--> statement-breakpoint
CREATE INDEX `incidents_goal_corr_idx` ON `incidents` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `monitoring_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`owner` text NOT NULL,
	`heartbeat_interval_ms` integer NOT NULL,
	`grace_period_ms` integer NOT NULL,
	`duration_threshold_ms` integer,
	`volume_floor` integer,
	`volume_ceiling` integer,
	`error_rate_threshold` real NOT NULL,
	`queue_depth_threshold` integer,
	`cost_limit` real,
	`rate_limit_threshold` real,
	`alert_route` text NOT NULL,
	`review_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monitoring_policies_automation_idx` ON `monitoring_policies` (`automation_id`);--> statement-breakpoint
CREATE TABLE `reconciliations` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`intended_json` text NOT NULL,
	`completed_json` text NOT NULL,
	`missing_json` text NOT NULL,
	`duplicated_json` text NOT NULL,
	`inconsistent_json` text NOT NULL,
	`authoritative_source` text NOT NULL,
	`plan` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reconciliations_incident_idx` ON `reconciliations` (`incident_id`);--> statement-breakpoint
CREATE TABLE `recovery_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`action_type` text NOT NULL,
	`reversible` integer NOT NULL,
	`approval_reference` text,
	`verification_evidence` text,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recovery_actions_incident_idx` ON `recovery_actions` (`incident_id`);--> statement-breakpoint
CREATE TABLE `reliability_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`metric_name` text NOT NULL,
	`value` real,
	`unit` text NOT NULL,
	`numerator` real,
	`denominator` real,
	`evidence` text NOT NULL,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`calculated_at` text NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reliability_metrics_name_window_idx` ON `reliability_metrics` (`metric_name`,`window_end`);--> statement-breakpoint
CREATE TABLE `retries` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`attempt` integer NOT NULL,
	`approved_limit` integer NOT NULL,
	`transient_failure` integer NOT NULL,
	`idempotent` integer NOT NULL,
	`idempotency_key` text NOT NULL,
	`backoff_ms` integer NOT NULL,
	`refusal_reason` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `retries_run_attempt_idx` ON `retries` (`run_id`,`attempt`);--> statement-breakpoint
CREATE TABLE `rollback_events` (
	`id` text PRIMARY KEY NOT NULL,
	`change_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`rollback_type` text NOT NULL,
	`irreversible` integer DEFAULT false NOT NULL,
	`approval_reference` text,
	`verification_evidence` text
);
--> statement-breakpoint
CREATE INDEX `rollback_events_change_idx` ON `rollback_events` (`change_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `run_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`actor` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source` text NOT NULL,
	`previous_state` text NOT NULL,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`authority` text NOT NULL,
	`result` text NOT NULL,
	`step_name` text NOT NULL,
	`attempt` integer DEFAULT 1 NOT NULL,
	`duration_ms` integer
);
--> statement-breakpoint
CREATE INDEX `run_steps_run_time_idx` ON `run_steps` (`run_id`,`occurred_at`);
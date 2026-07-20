CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`title` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`due_date` text NOT NULL,
	`priority` text DEFAULT 'P2' NOT NULL,
	`blocker` text,
	`validation_criteria` text NOT NULL,
	`completed_at` text,
	`status` text DEFAULT 'Open' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `actions_project_due_idx` ON `actions` (`project_id`,`due_date`,`status`);--> statement-breakpoint
CREATE TABLE `changes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`title` text NOT NULL,
	`baseline_reference` text NOT NULL,
	`reason` text NOT NULL,
	`classification` text NOT NULL,
	`scope_effect` text,
	`schedule_effect_days` integer,
	`effort_effect_hours` real,
	`cost_effect` real,
	`quality_effect` text,
	`delivery_effect` text,
	`approval_required` integer DEFAULT true NOT NULL,
	`approval_evidence` text,
	`accountable_owner` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `changes_project_status_idx` ON `changes` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `closeout_records` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deliverables_complete` integer DEFAULT false NOT NULL,
	`acceptance_evidence_linked` integer DEFAULT false NOT NULL,
	`quality_complete` integer DEFAULT false NOT NULL,
	`client_approval_linked` integer DEFAULT false NOT NULL,
	`final_documentation_complete` integer DEFAULT false NOT NULL,
	`changes_resolved` integer DEFAULT false NOT NULL,
	`financial_closeout_ready` integer DEFAULT false NOT NULL,
	`access_handover_complete` integer DEFAULT false NOT NULL,
	`lessons_linked` integer DEFAULT false NOT NULL,
	`archive_status` text DEFAULT 'Not started' NOT NULL,
	`support_transition` text,
	`completion_evidence` text,
	`status` text DEFAULT 'Open' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `closeout_records_project_status_idx` ON `closeout_records` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`acceptance_criteria` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`due_date` text,
	`progress_percent` integer DEFAULT 0 NOT NULL,
	`quality_status` text DEFAULT 'Not started' NOT NULL,
	`client_approval_status` text DEFAULT 'Not requested' NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `deliverables_project_status_idx` ON `deliverables` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `evidence_links` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`title` text NOT NULL,
	`uri` text NOT NULL,
	`evidence_type` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`observed_at` text NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evidence_links_entity_idx` ON `evidence_links` (`project_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`baseline_date` text NOT NULL,
	`forecast_date` text,
	`completed_date` text,
	`acceptance_criteria` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`critical` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `milestones_project_date_idx` ON `milestones` (`project_id`,`baseline_date`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`statement` text NOT NULL,
	`decision_owner` text NOT NULL,
	`required_by` text,
	`recommendation` text,
	`rationale` text,
	`approval_evidence` text,
	`status` text DEFAULT 'Requested' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `decisions_project_status_idx` ON `decisions` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `project_events` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`event_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`actor` text NOT NULL,
	`payload_json` text NOT NULL,
	`occurred_at` text NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_events_project_time_idx` ON `project_events` (`project_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `project_stakeholders` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`organization` text,
	`role` text NOT NULL,
	`responsibility` text,
	`communication_role` text,
	`status` text DEFAULT 'Active' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_stakeholders_project_idx` ON `project_stakeholders` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`client_name` text NOT NULL,
	`authorization_status` text DEFAULT 'Unverified' NOT NULL,
	`authorization_reference` text,
	`scope_summary` text NOT NULL,
	`exclusions_json` text DEFAULT '[]' NOT NULL,
	`acceptance_summary` text,
	`commercial_model` text,
	`budget_amount` real,
	`currency` text DEFAULT 'USD' NOT NULL,
	`start_date` text,
	`target_completion_date` text,
	`baseline_duration_days` integer,
	`forecast_completion_date` text,
	`forecast_margin_points_variance` real,
	`project_manager` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`communication_cadence` text,
	`data_classification` text DEFAULT 'Internal' NOT NULL,
	`health` text DEFAULT 'Green' NOT NULL,
	`status` text DEFAULT 'Setup' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "projects_id_check" CHECK("projects"."id" glob 'PRJ-[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9]'),
	CONSTRAINT "projects_health_check" CHECK("projects"."health" in ('Green','Amber','Red'))
);
--> statement-breakpoint
CREATE INDEX `projects_health_status_idx` ON `projects` (`health`,`status`);--> statement-breakpoint
CREATE INDEX `projects_goal_corr_idx` ON `projects` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `quality_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deliverable_id` text NOT NULL,
	`reviewer` text NOT NULL,
	`review_type` text NOT NULL,
	`acceptance_checklist` text NOT NULL,
	`critical_defects` integer DEFAULT 0 NOT NULL,
	`major_defects` integer DEFAULT 0 NOT NULL,
	`disposition` text,
	`reviewed_at` text,
	`status` text DEFAULT 'Planned' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quality_reviews_project_status_idx` ON `quality_reviews` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `risks_and_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`record_type` text NOT NULL,
	`category` text NOT NULL,
	`statement` text NOT NULL,
	`evidence` text NOT NULL,
	`probability` integer,
	`impact` integer NOT NULL,
	`severity` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`response_action` text NOT NULL,
	`due_date` text NOT NULL,
	`escalation_path` text NOT NULL,
	`validation_criteria` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "risks_issues_type_check" CHECK("risks_and_issues"."record_type" in ('Risk','Issue','Exception'))
);
--> statement-breakpoint
CREATE INDEX `risks_issues_project_severity_idx` ON `risks_and_issues` (`project_id`,`severity`,`status`);--> statement-breakpoint
CREATE TABLE `status_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`period_ending` text NOT NULL,
	`overall_health` text NOT NULL,
	`verified_facts_json` text DEFAULT '[]' NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`forecast_json` text DEFAULT '[]' NOT NULL,
	`recommendations_json` text DEFAULT '[]' NOT NULL,
	`client_communication_required` integer DEFAULT false NOT NULL,
	`approval_status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `status_reports_project_period_idx` ON `status_reports` (`project_id`,`period_ending`);
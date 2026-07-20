CREATE TABLE `acceptance_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`requirement_reference` text NOT NULL,
	`criterion` text NOT NULL,
	`source_authority` text NOT NULL,
	`status` text DEFAULT 'Approved' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `acceptance_criteria_deliverable_idx` ON `acceptance_criteria` (`deliverable_id`,`status`);--> statement-breakpoint
CREATE TABLE `approval_records` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`approval_type` text NOT NULL,
	`approver` text NOT NULL,
	`authority_reference` text NOT NULL,
	`decision` text NOT NULL,
	`rationale` text,
	`approved_at` text,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `approval_records_deliverable_idx` ON `approval_records` (`deliverable_id`,`decision`);--> statement-breakpoint
CREATE TABLE `checklist_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_id` text NOT NULL,
	`version` text NOT NULL,
	`requirements_json` text NOT NULL,
	`approved_by` text,
	`approved_at` text,
	`superseded_at` text,
	`content_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`checklist_id`) REFERENCES `quality_checklists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checklist_versions_version_idx` ON `checklist_versions` (`checklist_id`,`version`);--> statement-breakpoint
CREATE TABLE `corrective_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`finding_id` text NOT NULL,
	`owner` text NOT NULL,
	`correction` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'Assigned' NOT NULL,
	`submitted_evidence` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`finding_id`) REFERENCES `review_findings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `corrective_actions_owner_status_idx` ON `corrective_actions` (`owner`,`status`);--> statement-breakpoint
CREATE TABLE `deliverable_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`deliverable_id` text NOT NULL,
	`version` text NOT NULL,
	`content_hash` text NOT NULL,
	`source_inputs_json` text DEFAULT '[]' NOT NULL,
	`author` text NOT NULL,
	`immutable` integer DEFAULT true NOT NULL,
	`issued_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deliverable_versions_version_idx` ON `deliverable_versions` (`deliverable_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `deliverable_versions_hash_idx` ON `deliverable_versions` (`deliverable_id`,`content_hash`);--> statement-breakpoint
CREATE TABLE `escaped_defects` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`severity` text NOT NULL,
	`description` text NOT NULL,
	`reported_by` text NOT NULL,
	`root_cause` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`reported_at` text NOT NULL,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `escaped_defects_project_severity_idx` ON `escaped_defects` (`project_id`,`severity`);--> statement-breakpoint
CREATE TABLE `finding_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`finding_id` text NOT NULL,
	`evidence_type` text NOT NULL,
	`uri` text,
	`content_hash` text,
	`description` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`captured_by` text NOT NULL,
	`captured_at` text NOT NULL,
	FOREIGN KEY (`finding_id`) REFERENCES `review_findings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `finding_evidence_finding_idx` ON `finding_evidence` (`finding_id`);--> statement-breakpoint
CREATE TABLE `quality_checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`deliverable_type` text NOT NULL,
	`owner_agent_id` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quality_checklists_type_status_idx` ON `quality_checklists` (`deliverable_type`,`status`);--> statement-breakpoint
CREATE TABLE `quality_events` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`previous_state` text,
	`new_state` text NOT NULL,
	`reason` text NOT NULL,
	`supporting_evidence` text NOT NULL,
	`correlation_id` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quality_events_entity_time_idx` ON `quality_events` (`entity_type`,`entity_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `quality_incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`escaped_defect_id` text,
	`summary` text NOT NULL,
	`impact` text NOT NULL,
	`owner` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`lessons_status` text DEFAULT 'Not routed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`escaped_defect_id`) REFERENCES `escaped_defects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quality_incidents_project_status_idx` ON `quality_incidents` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `quality_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`deliverable_type` text,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`metric_name` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`baseline_reference` text,
	`source_evidence` text NOT NULL,
	`calculated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quality_metrics_name_period_idx` ON `quality_metrics` (`metric_name`,`period_end`);--> statement-breakpoint
CREATE TABLE `quality_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`objective` text NOT NULL,
	`scope` text NOT NULL,
	`sampling_method` text NOT NULL,
	`critical_interfaces_json` text DEFAULT '[]' NOT NULL,
	`evidence_requirements_json` text DEFAULT '[]' NOT NULL,
	`release_criteria_json` text DEFAULT '[]' NOT NULL,
	`reviewer` text NOT NULL,
	`approver` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quality_plans_goal_corr_idx` ON `quality_plans` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `release_gates` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`quality_review_id` text NOT NULL,
	`recommendation` text NOT NULL,
	`checklist_complete` integer DEFAULT false NOT NULL,
	`approvals_recorded` integer DEFAULT false NOT NULL,
	`blocking_finding_count` integer DEFAULT 0 NOT NULL,
	`residual_risk` text,
	`evaluated_by` text NOT NULL,
	`evaluated_at` text NOT NULL,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quality_review_id`) REFERENCES `quality_reviews`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `release_gates_recommendation_idx` ON `release_gates` (`recommendation`,`evaluated_at`);--> statement-breakpoint
CREATE TABLE `review_findings` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`quality_review_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`requirement_reference` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`impact` text NOT NULL,
	`recommended_correction` text NOT NULL,
	`responsible_owner` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`reviewer` text NOT NULL,
	`verification_evidence` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`deliverable_id`) REFERENCES `deliverables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quality_review_id`) REFERENCES `quality_reviews`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "review_findings_severity_check" CHECK("review_findings"."severity" in ('Critical','Major','Minor','Suggestion'))
);
--> statement-breakpoint
CREATE INDEX `review_findings_release_idx` ON `review_findings` (`project_id`,`severity`,`status`);--> statement-breakpoint
CREATE TABLE `transmittals` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`recipients_json` text NOT NULL,
	`file_set_hash` text NOT NULL,
	`issued_by` text NOT NULL,
	`issued_at` text NOT NULL,
	`receipt_status` text DEFAULT 'Pending' NOT NULL,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transmittals_project_issue_idx` ON `transmittals` (`project_id`,`issued_at`);--> statement-breakpoint
CREATE TABLE `verification_events` (
	`id` text PRIMARY KEY NOT NULL,
	`finding_id` text NOT NULL,
	`deliverable_version_id` text NOT NULL,
	`verifier` text NOT NULL,
	`result` text NOT NULL,
	`evidence` text NOT NULL,
	`regression_checked` integer DEFAULT false NOT NULL,
	`occurred_at` text NOT NULL,
	FOREIGN KEY (`finding_id`) REFERENCES `review_findings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliverable_version_id`) REFERENCES `deliverable_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `verification_events_finding_idx` ON `verification_events` (`finding_id`,`occurred_at`);--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `deliverable_version_id` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `checklist_version_id` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `review_objective` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `review_scope` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `candidate_hash` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `author` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `approver` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `release_recommendation` text;--> statement-breakpoint
ALTER TABLE `quality_reviews` ADD `quality_correlation_id` text;
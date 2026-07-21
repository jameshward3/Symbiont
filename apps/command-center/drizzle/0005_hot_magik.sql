CREATE TABLE `automation_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`automation_id` text NOT NULL,
	`reason` text NOT NULL,
	`owner` text NOT NULL,
	`risk_assessment` text NOT NULL,
	`test_evidence` text NOT NULL,
	`approver` text,
	`rollout_plan` text NOT NULL,
	`monitoring_plan` text NOT NULL,
	`rollback_plan` text NOT NULL,
	`success_criteria` text NOT NULL,
	`validation_window` text NOT NULL,
	`change_result` text NOT NULL,
	`incident_rate_before` real,
	`incident_rate_after` real,
	`outcome_quality_before` real,
	`outcome_quality_after` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `automation_changes_automation_idx` ON `automation_changes` (`automation_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reliability_corrective_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`automation_id` text NOT NULL,
	`title` text NOT NULL,
	`root_cause_reference` text NOT NULL,
	`owner` text NOT NULL,
	`due_date` text NOT NULL,
	`prevention_test` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`closure_evidence` text,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reliability_corrective_owner_status_idx` ON `reliability_corrective_actions` (`owner`,`status`);
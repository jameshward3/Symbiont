CREATE TABLE `agent_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`sender_agent_id` text NOT NULL,
	`recipient_agent_id` text,
	`message_type` text NOT NULL,
	`status` text NOT NULL,
	`subject` text NOT NULL,
	`body_json` text NOT NULL,
	`opportunity_id` text,
	`idempotency_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`accepted_at` text,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "agent_messages_type_check" CHECK("agent_messages"."message_type" in ('Information','Request','Handoff','Review Request','Decision Request','Blocker','Completion','Incident'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_messages_idempotency_idx` ON `agent_messages` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `agent_messages_goal_corr_idx` ON `agent_messages` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mission` text NOT NULL,
	`authority_level` text NOT NULL,
	`parent_agent_id` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`version` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "agents_authority_check" CHECK("agents"."authority_level" in ('L0','L1','L2','L3','L4'))
);
--> statement-breakpoint
CREATE INDEX `agents_parent_idx` ON `agents` (`parent_agent_id`);--> statement-breakpoint
CREATE TABLE `goal_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_goal_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'Assigned' NOT NULL,
	`accepted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goal_assignments_goal_agent_idx` ON `goal_assignments` (`shared_goal_id`,`agent_id`);--> statement-breakpoint
CREATE TABLE `monitoring_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`query_text` text NOT NULL,
	`source_category` text NOT NULL,
	`geography` text,
	`cadence` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`last_checked_at` text,
	`next_check_at` text,
	`robots_policy` text DEFAULT 'Verify before access' NOT NULL,
	`requires_authentication` integer DEFAULT false NOT NULL,
	`owner_agent_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `monitoring_queries_owner_status_idx` ON `monitoring_queries` (`owner_agent_id`,`status`);--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`issuer` text NOT NULL,
	`issuer_website` text,
	`title` text NOT NULL,
	`normalized_title` text NOT NULL,
	`solicitation_number` text,
	`canonical_url` text NOT NULL,
	`publication_date` text,
	`deadline_at` text,
	`deadline_timezone` text,
	`location` text,
	`geography_key` text NOT NULL,
	`stated_value` real,
	`currency` text DEFAULT 'USD' NOT NULL,
	`procurement_type` text NOT NULL,
	`scope` text NOT NULL,
	`public_contact_json` text,
	`access_requirements` text,
	`fit_rationale` text NOT NULL,
	`service_fit_score` integer NOT NULL,
	`buyer_fit_score` integer NOT NULL,
	`timing_score` integer NOT NULL,
	`value_score` integer NOT NULL,
	`evidence_score` integer NOT NULL,
	`access_score` integer NOT NULL,
	`recurrence_score` integer NOT NULL,
	`total_score` integer NOT NULL,
	`confidence` integer NOT NULL,
	`freshness` text NOT NULL,
	`risks_json` text DEFAULT '[]' NOT NULL,
	`missing_information_json` text DEFAULT '[]' NOT NULL,
	`next_action` text NOT NULL,
	`route` text NOT NULL,
	`handoff_status` text DEFAULT 'Not routed' NOT NULL,
	`observed_at` text NOT NULL,
	`source_kind` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`parent_opportunity_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "opportunities_score_check" CHECK("opportunities"."total_score" between 0 and 100 and "opportunities"."confidence" between 0 and 100),
	CONSTRAINT "opportunities_route_check" CHECK("opportunities"."route" in ('sales_operations','watchlist','archive'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunities_dedupe_idx` ON `opportunities` (`issuer`,`normalized_title`,`solicitation_number`,`canonical_url`,`deadline_at`,`geography_key`);--> statement-breakpoint
CREATE INDEX `opportunities_route_score_idx` ON `opportunities` (`route`,`total_score`);--> statement-breakpoint
CREATE INDEX `opportunities_deadline_idx` ON `opportunities` (`deadline_at`);--> statement-breakpoint
CREATE TABLE `opportunity_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text NOT NULL,
	`canonical_url` text NOT NULL,
	`source_title` text NOT NULL,
	`source_type` text NOT NULL,
	`evidence_summary` text NOT NULL,
	`content_hash` text NOT NULL,
	`confidence` integer NOT NULL,
	`is_amendment` integer DEFAULT false NOT NULL,
	`amendment_number` text,
	`observed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_evidence_hash_idx` ON `opportunity_evidence` (`opportunity_id`,`content_hash`);--> statement-breakpoint
CREATE INDEX `opportunity_evidence_opportunity_idx` ON `opportunity_evidence` (`opportunity_id`);--> statement-breakpoint
CREATE TABLE `scout_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`sources_checked` integer DEFAULT 0 NOT NULL,
	`candidates_found` integer DEFAULT 0 NOT NULL,
	`verified_count` integer DEFAULT 0 NOT NULL,
	`routed_count` integer DEFAULT 0 NOT NULL,
	`error_summary` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scout_runs_goal_corr_idx` ON `scout_runs` (`shared_goal_id`,`correlation_id`);--> statement-breakpoint
CREATE TABLE `shared_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`objective` text NOT NULL,
	`accountable_agent_id` text NOT NULL,
	`priority` text DEFAULT 'P2' NOT NULL,
	`status` text DEFAULT 'Proposed' NOT NULL,
	`due_at` text,
	`success_measures_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`accountable_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shared_goals_owner_idx` ON `shared_goals` (`accountable_agent_id`);
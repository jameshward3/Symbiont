CREATE TABLE `archive_records` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`archive_reason` text NOT NULL,
	`replacement_asset_id` text,
	`approval_evidence` text NOT NULL,
	`reversible` integer DEFAULT true NOT NULL,
	`archived_by` text NOT NULL,
	`correlation_id` text NOT NULL,
	`archived_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`replacement_asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_records_asset_idx` ON `archive_records` (`asset_id`);--> statement-breakpoint
CREATE TABLE `knowledge_access_classifications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rank` integer NOT NULL,
	`permitted_use` text NOT NULL,
	`handling_requirements` text NOT NULL,
	`approved_by` text NOT NULL,
	`effective_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "knowledge_access_rank_check" CHECK("knowledge_access_classifications"."rank" between 0 and 3)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_access_name_idx` ON `knowledge_access_classifications` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_access_rank_idx` ON `knowledge_access_classifications` (`rank`);--> statement-breakpoint
CREATE TABLE `knowledge_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`business_area` text NOT NULL,
	`asset_type` text NOT NULL,
	`owner` text NOT NULL,
	`author` text NOT NULL,
	`reviewer` text,
	`approver` text,
	`lifecycle_status` text DEFAULT 'Draft' NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`current_version` text DEFAULT '0.1' NOT NULL,
	`effective_date` text,
	`review_date` text,
	`source_system` text NOT NULL,
	`canonical_location` text NOT NULL,
	`source_evidence` text NOT NULL,
	`content_hash` text NOT NULL,
	`related_client_id` text,
	`related_project_id` text,
	`related_opportunity_id` text,
	`related_decision_id` text,
	`related_shared_goal_id` text,
	`related_agent_id` text,
	`supersedes_asset_id` text,
	`superseded_by_asset_id` text,
	`retention_rule` text,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`synonyms_json` text DEFAULT '[]' NOT NULL,
	`is_authoritative` integer DEFAULT false NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "knowledge_assets_lifecycle_check" CHECK("knowledge_assets"."lifecycle_status" in ('Draft','Review','Approved','Active','Superseded','Archived')),
	CONSTRAINT "knowledge_assets_classification_check" CHECK("knowledge_assets"."classification" in ('Public','Internal','Confidential','Restricted'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_assets_hash_version_idx` ON `knowledge_assets` (`content_hash`,`current_version`);--> statement-breakpoint
CREATE INDEX `knowledge_assets_search_idx` ON `knowledge_assets` (`lifecycle_status`,`business_area`,`asset_type`);--> statement-breakpoint
CREATE INDEX `knowledge_assets_review_idx` ON `knowledge_assets` (`review_date`,`owner`);--> statement-breakpoint
CREATE TABLE `knowledge_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`actor_agent_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`source_evidence` text NOT NULL,
	`correlation_id` text NOT NULL,
	`previous_state` text,
	`new_state` text NOT NULL,
	`occurred_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `knowledge_audit_asset_time_idx` ON `knowledge_audit_events` (`asset_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `knowledge_conflicts` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`conflicting_asset_id` text NOT NULL,
	`conflict_type` text NOT NULL,
	`evidence` text NOT NULL,
	`recommendation` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`escalated_to_agent_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conflicting_asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_conflicts_pair_idx` ON `knowledge_conflicts` (`asset_id`,`conflicting_asset_id`,`conflict_type`);--> statement-breakpoint
CREATE TABLE `knowledge_quality_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`ownership` real,
	`freshness` real,
	`completeness` real,
	`findability` real,
	`usage` real,
	`link_health` real,
	`score` real,
	`status` text NOT NULL,
	`source_evidence` text NOT NULL,
	`calculated_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `knowledge_quality_asset_time_idx` ON `knowledge_quality_scores` (`asset_id`,`calculated_at`);--> statement-breakpoint
CREATE TABLE `knowledge_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`from_asset_id` text NOT NULL,
	`to_asset_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	`reason` text NOT NULL,
	`source_evidence` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`from_asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_relationship_unique_idx` ON `knowledge_relationships` (`from_asset_id`,`to_asset_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `knowledge_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`reviewer` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL,
	`completion_evidence` text,
	`next_review_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `knowledge_reviews_due_status_idx` ON `knowledge_reviews` (`due_date`,`status`);--> statement-breakpoint
CREATE TABLE `knowledge_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`source_system` text NOT NULL,
	`canonical_location` text NOT NULL,
	`content_hash` text NOT NULL,
	`authority_status` text NOT NULL,
	`observed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `knowledge_sources_asset_idx` ON `knowledge_sources` (`asset_id`,`authority_status`);--> statement-breakpoint
CREATE TABLE `knowledge_synonyms` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`synonym` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_synonyms_asset_idx` ON `knowledge_synonyms` (`asset_id`,`synonym`);--> statement-breakpoint
CREATE TABLE `knowledge_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`tag` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_tags_asset_tag_idx` ON `knowledge_tags` (`asset_id`,`tag`);--> statement-breakpoint
CREATE TABLE `knowledge_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`version` text NOT NULL,
	`content_hash` text NOT NULL,
	`canonical_location` text NOT NULL,
	`change_summary` text NOT NULL,
	`source_evidence` text NOT NULL,
	`immutable` integer DEFAULT false NOT NULL,
	`issued_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `knowledge_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_versions_asset_version_idx` ON `knowledge_versions` (`asset_id`,`version`);
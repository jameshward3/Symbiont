PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_architecture_diagrams` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`product_id` text,
	`client_id` text,
	`owner_agent_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`data_classification` text DEFAULT 'Internal' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`title` text NOT NULL,
	`diagram_type` text NOT NULL,
	`version` text NOT NULL,
	`artifact_reference` text NOT NULL,
	`scope` text NOT NULL,
	`verified_current_state` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_architecture_diagrams`("id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "title", "diagram_type", "version", "artifact_reference", "scope", "verified_current_state", "status") SELECT "id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "title", "diagram_type", "version", "artifact_reference", "scope", "verified_current_state", "status" FROM `architecture_diagrams`;--> statement-breakpoint
DROP TABLE `architecture_diagrams`;--> statement-breakpoint
ALTER TABLE `__new_architecture_diagrams` RENAME TO `architecture_diagrams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `architecture_diagrams_type_status_idx` ON `architecture_diagrams` (`diagram_type`,`status`);--> statement-breakpoint
CREATE TABLE `__new_data_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`product_id` text,
	`client_id` text,
	`owner_agent_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`data_classification` text DEFAULT 'Internal' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`system_id` text NOT NULL,
	`name` text NOT NULL,
	`source_type` text NOT NULL,
	`authoritative` integer DEFAULT false NOT NULL,
	`owner` text NOT NULL,
	`lineage` text NOT NULL,
	`retention_policy` text,
	`freshness_target` text,
	`quality_status` text DEFAULT 'Unknown' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_data_sources`("id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "system_id", "name", "source_type", "authoritative", "owner", "lineage", "retention_policy", "freshness_target", "quality_status") SELECT "id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "system_id", "name", "source_type", "authoritative", "owner", "lineage", "retention_policy", "freshness_target", "quality_status" FROM `data_sources`;--> statement-breakpoint
DROP TABLE `data_sources`;--> statement-breakpoint
ALTER TABLE `__new_data_sources` RENAME TO `data_sources`;--> statement-breakpoint
CREATE INDEX `data_sources_system_authority_idx` ON `data_sources` (`system_id`,`authoritative`);--> statement-breakpoint
CREATE TABLE `__new_schema_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`product_id` text,
	`client_id` text,
	`owner_agent_id` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`data_classification` text DEFAULT 'Internal' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`schema_id` text NOT NULL,
	`version` text NOT NULL,
	`predecessor_version_id` text,
	`breaking` integer DEFAULT false NOT NULL,
	`change_summary` text NOT NULL,
	`effective_at` text,
	`validation_status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`schema_id`) REFERENCES `architecture_schemas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_schema_versions`("id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "schema_id", "version", "predecessor_version_id", "breaking", "change_summary", "effective_at", "validation_status") SELECT "id", "project_id", "product_id", "client_id", "owner_agent_id", "shared_goal_id", "correlation_id", "evidence_reference", "data_classification", "created_at", "updated_at", "schema_id", "version", "predecessor_version_id", "breaking", "change_summary", "effective_at", "validation_status" FROM `schema_versions`;--> statement-breakpoint
DROP TABLE `schema_versions`;--> statement-breakpoint
ALTER TABLE `__new_schema_versions` RENAME TO `schema_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `schema_versions_schema_version_idx` ON `schema_versions` (`schema_id`,`version`);
CREATE TABLE `access_request_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`system_id` text NOT NULL,
	`requester` text NOT NULL,
	`requested_role` text NOT NULL,
	`business_need` text NOT NULL,
	`duration` text NOT NULL,
	`environment` text NOT NULL,
	`approval_reference` text,
	`recommendation` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `security_systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `access_requests_status_idx` ON `access_request_metadata` (`status`,`review_date`);--> statement-breakpoint
CREATE TABLE `access_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`system_id` text NOT NULL,
	`role_id` text,
	`subject_reference` text NOT NULL,
	`business_need` text,
	`reviewer` text NOT NULL,
	`recommendation` text NOT NULL,
	`excessive_access` integer DEFAULT false NOT NULL,
	`expires_at` text,
	`evidence` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `security_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `access_roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `access_reviews_due_idx` ON `access_reviews` (`review_date`,`status`);--> statement-breakpoint
CREATE TABLE `access_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`system_id` text NOT NULL,
	`name` text NOT NULL,
	`business_need` text NOT NULL,
	`permissions_json` text DEFAULT '[]' NOT NULL,
	`environment` text NOT NULL,
	`classification_ceiling` text NOT NULL,
	`owner` text NOT NULL,
	`recertification_days` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `security_systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_roles_system_name_idx` ON `access_roles` (`system_id`,`name`);--> statement-breakpoint
CREATE TABLE `adoption_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`indicator` text NOT NULL,
	`definition` text NOT NULL,
	`source` text NOT NULL,
	`current_value` real,
	`target_value` real,
	`confidence` text NOT NULL,
	`observed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `apis` (
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
	`base_reference` text NOT NULL,
	`protocol` text NOT NULL,
	`version` text NOT NULL,
	`authentication_method` text NOT NULL,
	`authorization_model` text NOT NULL,
	`rate_limits` text,
	`owner` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apis_system_name_version_idx` ON `apis` (`system_id`,`name`,`version`);--> statement-breakpoint
CREATE TABLE `applications` (
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
	`purpose` text NOT NULL,
	`owner` text NOT NULL,
	`version` text,
	`support_status` text DEFAULT 'Supported' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `applications_system_idx` ON `applications` (`system_id`);--> statement-breakpoint
CREATE TABLE `architecture_decisions` (
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
	`context` text NOT NULL,
	`problem` text NOT NULL,
	`constraints_json` text DEFAULT '[]' NOT NULL,
	`options_json` text DEFAULT '[]' NOT NULL,
	`criteria_json` text DEFAULT '[]' NOT NULL,
	`security_implications` text NOT NULL,
	`cost_implications` text NOT NULL,
	`operational_implications` text NOT NULL,
	`recommendation` text NOT NULL,
	`approver` text,
	`decision` text,
	`consequences` text,
	`validation_date` text,
	`supersedes_decision_id` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `architecture_decisions_status_validation_idx` ON `architecture_decisions` (`status`,`validation_date`);--> statement-breakpoint
CREATE TABLE `architecture_diagrams` (
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
	`verified_current_state` text DEFAULT false NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `architecture_diagrams_type_status_idx` ON `architecture_diagrams` (`diagram_type`,`status`);--> statement-breakpoint
CREATE TABLE `architecture_reviews` (
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
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`reviewer` text NOT NULL,
	`requirements_traceability` text NOT NULL,
	`security_status` text NOT NULL,
	`findings_json` text DEFAULT '[]' NOT NULL,
	`acceptance_criteria` text NOT NULL,
	`validation_agent_id` text DEFAULT 'AGT-004' NOT NULL,
	`decision_reference` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `architecture_reviews_subject_status_idx` ON `architecture_reviews` (`subject_type`,`subject_id`,`status`);--> statement-breakpoint
CREATE TABLE `architecture_schemas` (
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
	`name` text NOT NULL,
	`purpose` text NOT NULL,
	`format` text NOT NULL,
	`current_version` text NOT NULL,
	`compatibility_policy` text NOT NULL,
	`owner` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `architecture_schemas_name_idx` ON `architecture_schemas` (`name`);--> statement-breakpoint
CREATE TABLE `classifications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`definition` text NOT NULL,
	`handling_rules` text NOT NULL,
	`rank` integer NOT NULL,
	`owner` text NOT NULL,
	`review_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "classifications_name_check" CHECK("classifications"."name" in ('Public','Internal','Confidential','Restricted'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classifications_name_idx` ON `classifications` (`name`);--> statement-breakpoint
CREATE TABLE `client_communications` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`communication_type` text NOT NULL,
	`audience` text NOT NULL,
	`draft` text NOT NULL,
	`approval_status` text DEFAULT 'Draft' NOT NULL,
	`approved_by` text,
	`approved_at` text,
	`sent_at` text,
	`correlation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`source` text NOT NULL,
	`occurred_at` text NOT NULL,
	`stakeholder_id` text,
	`consent` text NOT NULL,
	`topic` text NOT NULL,
	`sentiment` text NOT NULL,
	`requested_outcome` text,
	`severity` text NOT NULL,
	`owner` text NOT NULL,
	`next_action` text NOT NULL,
	`resolution` text,
	`external_use_permission` text DEFAULT 'Not granted' NOT NULL,
	`quotation` text,
	`internal_summary` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`objective` text NOT NULL,
	`baseline` text,
	`target` text,
	`measurement_method` text NOT NULL,
	`owner` text NOT NULL,
	`status` text NOT NULL,
	`evidence_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_health_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`health` text NOT NULL,
	`score` integer,
	`evidence_json` text NOT NULL,
	`explanation` text NOT NULL,
	`calculated_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "client_health_check" CHECK("client_health_snapshots"."health" in ('Green','Amber','Red','Unknown'))
);
--> statement-breakpoint
CREATE TABLE `client_stakeholders` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`consent_status` text NOT NULL,
	`communication_preference` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_success_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`authority` text NOT NULL,
	`previous_state` text,
	`new_state` text NOT NULL,
	`evidence` text NOT NULL,
	`correlation_id` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `client_success_records` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`record_type` text NOT NULL,
	`status` text NOT NULL,
	`owner` text NOT NULL,
	`due_date` text,
	`content_json` text NOT NULL,
	`permission_status` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`evidence_id` text,
	`correlation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`project_id` text NOT NULL,
	`opportunity_id` text,
	`shared_goal_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-013' NOT NULL,
	`correlation_id` text NOT NULL,
	`data_classification` text DEFAULT 'Confidential' NOT NULL,
	`onboarding_percent` integer DEFAULT 0 NOT NULL,
	`adoption_percent` integer DEFAULT 0 NOT NULL,
	`outcome_percent` integer DEFAULT 0 NOT NULL,
	`value_summary` text DEFAULT 'Evidence insufficient' NOT NULL,
	`next_review` text NOT NULL,
	`renewal_date` text NOT NULL,
	`open_risks` integer DEFAULT 0 NOT NULL,
	`open_issues` integer DEFAULT 0 NOT NULL,
	`satisfaction_summary` text DEFAULT 'Unknown' NOT NULL,
	`expansion_summary` text DEFAULT 'None recorded' NOT NULL,
	`communication_status` text DEFAULT 'Draft · approval required' NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `clients_project_idx` ON `clients` (`project_id`);--> statement-breakpoint
CREATE INDEX `clients_renewal_idx` ON `clients` (`renewal_date`);--> statement-breakpoint
CREATE TABLE `control_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`control_id` text NOT NULL,
	`source` text NOT NULL,
	`redacted_evidence` text NOT NULL,
	`content_hash` text NOT NULL,
	`observed_at` text NOT NULL,
	`observer` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`control_id`) REFERENCES `security_controls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `control_evidence_control_idx` ON `control_evidence` (`control_id`,`observed_at`);--> statement-breakpoint
CREATE TABLE `data_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`steward` text,
	`source` text NOT NULL,
	`system_id` text,
	`purpose` text NOT NULL,
	`data_subjects_json` text DEFAULT '[]' NOT NULL,
	`client` text,
	`project_id` text,
	`geography` text,
	`access_groups_json` text DEFAULT '[]' NOT NULL,
	`integrations_json` text DEFAULT '[]' NOT NULL,
	`retention` text,
	`deletion_method` text,
	`backup` text,
	`recovery` text,
	`authorized_basis_source` text,
	`risks_json` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `security_systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `data_assets_classification_idx` ON `data_assets` (`classification`,`review_date`);--> statement-breakpoint
CREATE TABLE `data_entities` (
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
	`data_source_id` text NOT NULL,
	`name` text NOT NULL,
	`entity_type` text NOT NULL,
	`canonical_id_pattern` text NOT NULL,
	`unit_standard` text,
	`classification_standard` text,
	`source_of_truth_rule` text NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`data_source_id`) REFERENCES `data_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `data_entities_source_idx` ON `data_entities` (`data_source_id`);--> statement-breakpoint
CREATE TABLE `data_field_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`data_asset_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`classification` text NOT NULL,
	`personal_data` integer DEFAULT false NOT NULL,
	`required` integer DEFAULT false NOT NULL,
	`source` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`data_asset_id`) REFERENCES `data_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `data_fields_asset_idx` ON `data_field_metadata` (`data_asset_id`);--> statement-breakpoint
CREATE TABLE `data_owners` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`owner` text NOT NULL,
	`steward` text,
	`approval_reference` text,
	`effective_at` text NOT NULL,
	`review_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `data_owners_subject_idx` ON `data_owners` (`subject_type`,`subject_id`);--> statement-breakpoint
CREATE TABLE `data_sources` (
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
	`authoritative` text DEFAULT false NOT NULL,
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
CREATE INDEX `data_sources_system_authority_idx` ON `data_sources` (`system_id`,`authoritative`);--> statement-breakpoint
CREATE TABLE `data_uses` (
	`id` text PRIMARY KEY NOT NULL,
	`data_asset_id` text NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text NOT NULL,
	`authorized_purpose` text NOT NULL,
	`minimum_fields_json` text DEFAULT '[]' NOT NULL,
	`provider_terms_source` text,
	`model_training_policy` text,
	`logging` text,
	`deletion_path` text,
	`correction_path` text,
	`human_approval` text,
	`downstream_sharing_json` text DEFAULT '[]' NOT NULL,
	`recommendation` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`data_asset_id`) REFERENCES `data_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `data_uses_asset_status_idx` ON `data_uses` (`data_asset_id`,`status`);--> statement-breakpoint
CREATE TABLE `disposal_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`data_asset_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`scope` text NOT NULL,
	`authority_reference` text,
	`evidence` text NOT NULL,
	`recommendation` text NOT NULL,
	`status` text DEFAULT 'Pending approval' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`data_asset_id`) REFERENCES `data_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `disposal_requests_status_idx` ON `disposal_requests` (`status`);--> statement-breakpoint
CREATE TABLE `environments` (
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
	`environment_type` text NOT NULL,
	`region` text,
	`identity_boundary` text NOT NULL,
	`backup_policy` text,
	`recovery_objective` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `environments_system_type_idx` ON `environments` (`system_id`,`environment_type`);--> statement-breakpoint
CREATE TABLE `integration_mappings` (
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
	`integration_id` text NOT NULL,
	`source_field` text NOT NULL,
	`destination_field` text NOT NULL,
	`transformation` text,
	`source_schema_version_id` text,
	`destination_schema_version_id` text,
	`validation_rule` text NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_schema_version_id`) REFERENCES `schema_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_schema_version_id`) REFERENCES `schema_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `integration_mappings_integration_idx` ON `integration_mappings` (`integration_id`);--> statement-breakpoint
CREATE TABLE `integrations` (
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
	`name` text NOT NULL,
	`source_system_id` text NOT NULL,
	`destination_system_id` text NOT NULL,
	`purpose` text NOT NULL,
	`authoritative_system_id` text NOT NULL,
	`transfer_method` text NOT NULL,
	`authentication_method` text NOT NULL,
	`secret_reference` text,
	`frequency` text NOT NULL,
	`latency_target` text,
	`retry_policy` text NOT NULL,
	`idempotency_strategy` text NOT NULL,
	`reconciliation_plan` text NOT NULL,
	`support_owner` text NOT NULL,
	`rollback_plan` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authoritative_system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `integrations_source_destination_idx` ON `integrations` (`source_system_id`,`destination_system_id`);--> statement-breakpoint
CREATE TABLE `nonfunctional_requirements` (
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
	`system_id` text,
	`category` text NOT NULL,
	`requirement` text NOT NULL,
	`measure` text NOT NULL,
	`target` text NOT NULL,
	`verification_method` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `nfr_system_category_idx` ON `nonfunctional_requirements` (`system_id`,`category`);--> statement-breakpoint
CREATE TABLE `onboarding_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`due_date` text,
	`status` text NOT NULL,
	`evidence_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `processing_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data_assets_json` text NOT NULL,
	`purpose` text NOT NULL,
	`data_subjects_json` text NOT NULL,
	`recipients_json` text NOT NULL,
	`geography` text,
	`authorized_basis_source` text,
	`retention_rule_id` text,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `processing_activities_review_idx` ON `processing_activities` (`review_date`);--> statement-breakpoint
CREATE TABLE `retention_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`source` text NOT NULL,
	`owner` text NOT NULL,
	`scope` text NOT NULL,
	`period` text NOT NULL,
	`trigger` text NOT NULL,
	`exceptions` text,
	`approval_reference` text NOT NULL,
	`review_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `retention_rules_review_idx` ON `retention_rules` (`review_date`);--> statement-breakpoint
CREATE TABLE `schema_versions` (
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
	`breaking` text DEFAULT false NOT NULL,
	`change_summary` text NOT NULL,
	`effective_at` text,
	`validation_status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`schema_id`) REFERENCES `architecture_schemas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schema_versions_schema_version_idx` ON `schema_versions` (`schema_id`,`version`);--> statement-breakpoint
CREATE TABLE `security_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`authority` text NOT NULL,
	`classification` text NOT NULL,
	`redacted_evidence` text NOT NULL,
	`result` text NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_audit_subject_idx` ON `security_audit_events` (`subject_type`,`subject_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `security_controls` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`objective` text NOT NULL,
	`owner` text NOT NULL,
	`implementation_status` text NOT NULL,
	`evidence_required` text NOT NULL,
	`review_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_controls_status_idx` ON `security_controls` (`implementation_status`,`review_date`);--> statement-breakpoint
CREATE TABLE `security_corrective_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`due_date` text NOT NULL,
	`validation_criteria` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`closure_evidence` text,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_corrective_due_idx` ON `security_corrective_actions` (`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `security_exceptions` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_or_control` text NOT NULL,
	`reason` text NOT NULL,
	`scope` text NOT NULL,
	`affected_systems_json` text NOT NULL,
	`affected_data_json` text NOT NULL,
	`risk` text NOT NULL,
	`compensating_controls_json` text NOT NULL,
	`approver` text,
	`start_date` text NOT NULL,
	`expires_at` text NOT NULL,
	`closure_evidence` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_exceptions_expiry_idx` ON `security_exceptions` (`expires_at`,`status`);--> statement-breakpoint
CREATE TABLE `security_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`scope_json` text NOT NULL,
	`reviewer` text NOT NULL,
	`findings_json` text DEFAULT '[]' NOT NULL,
	`recommendation` text NOT NULL,
	`approver` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_reviews_status_idx` ON `security_reviews` (`status`,`review_date`);--> statement-breakpoint
CREATE TABLE `security_risks` (
	`id` text PRIMARY KEY NOT NULL,
	`asset` text NOT NULL,
	`threat` text NOT NULL,
	`vulnerability` text NOT NULL,
	`likelihood` text NOT NULL,
	`impact` text NOT NULL,
	`existing_controls_json` text DEFAULT '[]' NOT NULL,
	`residual_risk` text NOT NULL,
	`evidence` text NOT NULL,
	`action` text NOT NULL,
	`due_date` text NOT NULL,
	`approver` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_risks_status_due_idx` ON `security_risks` (`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `security_systems` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`purpose` text NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`steward` text,
	`data_stored_json` text DEFAULT '[]' NOT NULL,
	`users_json` text DEFAULT '[]' NOT NULL,
	`authentication` text NOT NULL,
	`authorization` text NOT NULL,
	`integrations_json` text DEFAULT '[]' NOT NULL,
	`vendor` text,
	`hosting` text,
	`environments_json` text DEFAULT '[]' NOT NULL,
	`logs` text,
	`backup` text,
	`recovery` text,
	`retention` text,
	`incident_owner` text NOT NULL,
	`contract_status` text,
	`risk_level` text DEFAULT 'Unknown' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_systems_risk_idx` ON `security_systems` (`risk_level`,`review_date`);--> statement-breakpoint
CREATE TABLE `security_vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`service_purpose` text NOT NULL,
	`data_shared_json` text DEFAULT '[]' NOT NULL,
	`hosting` text,
	`subprocessors_source` text,
	`retention` text,
	`deletion` text,
	`export_capability` text,
	`breach_notification_source` text,
	`authentication` text,
	`api_security` text,
	`contract_status` text,
	`exit_plan` text,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_vendors_review_idx` ON `security_vendors` (`review_date`);--> statement-breakpoint
CREATE TABLE `success_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`project_id` text NOT NULL,
	`objectives_json` text NOT NULL,
	`stakeholder_map_json` text NOT NULL,
	`milestones_json` text NOT NULL,
	`cadence` text NOT NULL,
	`dependencies_json` text NOT NULL,
	`training_needs_json` text NOT NULL,
	`support_needs_json` text NOT NULL,
	`escalation_path` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `systems` (
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
	`name` text NOT NULL,
	`function` text NOT NULL,
	`owner` text NOT NULL,
	`authoritative_for_json` text DEFAULT '[]' NOT NULL,
	`lifecycle_status` text DEFAULT 'Draft' NOT NULL,
	`support_status` text DEFAULT 'Supported' NOT NULL,
	`vendor` text,
	`security_review_status` text DEFAULT 'Not reviewed' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `systems_project_status_idx` ON `systems` (`project_id`,`lifecycle_status`);--> statement-breakpoint
CREATE TABLE `technical_components` (
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
	`component_type` text NOT NULL,
	`version` text,
	`owner` text NOT NULL,
	`vendor` text,
	`support_end_date` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technical_components_system_status_idx` ON `technical_components` (`system_id`,`status`);--> statement-breakpoint
CREATE TABLE `technical_debt` (
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
	`system_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`business_impact` text NOT NULL,
	`remediation` text NOT NULL,
	`effort_estimate` text,
	`accountable_owner` text NOT NULL,
	`target_date` text,
	`status` text DEFAULT 'Open' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technical_debt_system_status_idx` ON `technical_debt` (`system_id`,`status`);--> statement-breakpoint
CREATE TABLE `technical_dependencies` (
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
	`component_id` text NOT NULL,
	`depends_on_component_id` text,
	`external_dependency` text,
	`criticality` text NOT NULL,
	`health_status` text DEFAULT 'Unknown' NOT NULL,
	`failure_mode` text NOT NULL,
	`fallback_plan` text,
	`owner` text NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`component_id`) REFERENCES `technical_components`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_component_id`) REFERENCES `technical_components`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technical_dependencies_component_health_idx` ON `technical_dependencies` (`component_id`,`health_status`);--> statement-breakpoint
CREATE TABLE `technical_risks` (
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
	`system_id` text,
	`statement` text NOT NULL,
	`probability` integer NOT NULL,
	`impact` integer NOT NULL,
	`severity` text NOT NULL,
	`mitigation` text NOT NULL,
	`accountable_owner` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'Open' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technical_risks_severity_status_idx` ON `technical_risks` (`severity`,`status`);--> statement-breakpoint
CREATE TABLE `technical_roadmap` (
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
	`stage` text NOT NULL,
	`outcome` text NOT NULL,
	`dependencies_json` text DEFAULT '[]' NOT NULL,
	`accountable_owner` text NOT NULL,
	`target_date` text,
	`acceptance_criteria` text NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technical_roadmap_stage_date_idx` ON `technical_roadmap` (`stage`,`target_date`);--> statement-breakpoint
CREATE TABLE `technical_standards` (
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
	`domain` text NOT NULL,
	`version` text NOT NULL,
	`requirements_json` text DEFAULT '[]' NOT NULL,
	`owner` text NOT NULL,
	`review_date` text,
	`supersedes_standard_id` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "technical_standards_status_check" CHECK("technical_standards"."status" in ('Draft','Review','Approved','Active','Superseded','Archived'))
);
--> statement-breakpoint
CREATE INDEX `technical_standards_domain_status_idx` ON `technical_standards` (`domain`,`status`);--> statement-breakpoint
CREATE TABLE `technology_evaluations` (
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
	`technology` text NOT NULL,
	`use_case` text NOT NULL,
	`criteria_scores_json` text NOT NULL,
	`security_assessment` text NOT NULL,
	`portability_assessment` text NOT NULL,
	`cost_assessment` text NOT NULL,
	`exit_path` text NOT NULL,
	`recommendation` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`owner_agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shared_goal_id`) REFERENCES `shared_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `technology_evaluations_status_idx` ON `technology_evaluations` (`status`);--> statement-breakpoint
CREATE TABLE `value_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`metric` text NOT NULL,
	`definition` text NOT NULL,
	`source` text NOT NULL,
	`baseline` real,
	`target` real,
	`current_value` real,
	`period` text NOT NULL,
	`confidence` text NOT NULL,
	`client_confirmed` integer DEFAULT false NOT NULL,
	`limitations` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vendor_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`assessor` text NOT NULL,
	`findings_json` text DEFAULT '[]' NOT NULL,
	`evidence` text NOT NULL,
	`recommendation` text NOT NULL,
	`approver` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`owner` text NOT NULL,
	`classification` text DEFAULT 'Internal' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`review_date` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `security_vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vendor_assessments_status_idx` ON `vendor_assessments` (`status`,`review_date`);
CREATE TABLE `client_problems` (
	`id` text PRIMARY KEY NOT NULL,
	`statement` text NOT NULL,
	`audience` text NOT NULL,
	`severity` integer NOT NULL,
	`frequency` text NOT NULL,
	`current_workaround` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `client_problems_audience_idx` ON `client_problems` (`audience`);--> statement-breakpoint
CREATE TABLE `financial_exceptions` (
	`id` text PRIMARY KEY NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`required_action` text NOT NULL,
	`source_record` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `financial_exceptions_status_idx` ON `financial_exceptions` (`status`,`severity`);--> statement-breakpoint
CREATE TABLE `financial_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`metric_name` text NOT NULL,
	`definition` text NOT NULL,
	`value` real,
	`unit` text NOT NULL,
	`period` text NOT NULL,
	`currency` text,
	`category` text NOT NULL,
	`source_system` text NOT NULL,
	`source_record` text NOT NULL,
	`refreshed_at` text NOT NULL,
	`owner` text NOT NULL,
	`calculation_method` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`confidence` text NOT NULL,
	`reconciliation_status` text NOT NULL,
	`authoritative_variance` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `financial_snapshots_metric_period_idx` ON `financial_snapshots` (`metric_name`,`period`);--> statement-breakpoint
CREATE TABLE `module_dependencies` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`depends_on_module_id` text NOT NULL,
	`dependency_type` text NOT NULL,
	`constraint_summary` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `product_modules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_module_id`) REFERENCES `product_modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_dependencies_pair_idx` ON `module_dependencies` (`module_id`,`depends_on_module_id`);--> statement-breakpoint
CREATE TABLE `pilot_results` (
	`id` text PRIMARY KEY NOT NULL,
	`experiment_id` text NOT NULL,
	`client_outcome` text NOT NULL,
	`delivery_effort` text NOT NULL,
	`defects` integer DEFAULT 0 NOT NULL,
	`margin_actual` real,
	`reusable_assets_json` text DEFAULT '[]' NOT NULL,
	`exceptions_json` text DEFAULT '[]' NOT NULL,
	`conclusion` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`observed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`experiment_id`) REFERENCES `product_experiments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pilot_results_experiment_idx` ON `pilot_results` (`experiment_id`);--> statement-breakpoint
CREATE TABLE `product_acceptance_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deliverable_reference` text NOT NULL,
	`criterion` text NOT NULL,
	`measure` text NOT NULL,
	`threshold` text NOT NULL,
	`verification_method` text NOT NULL,
	`reviewer` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_acceptance_criteria_status_idx` ON `product_acceptance_criteria` (`product_id`,`status`);--> statement-breakpoint
CREATE TABLE `product_concepts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`client_problem_id` text,
	`audience` text NOT NULL,
	`frequency` text NOT NULL,
	`current_workaround` text NOT NULL,
	`value_hypothesis` text NOT NULL,
	`risk_summary` text NOT NULL,
	`strategic_fit` text NOT NULL,
	`qualification_scores_json` text NOT NULL,
	`qualification_score` real NOT NULL,
	`classification` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_concepts_classification_idx` ON `product_concepts` (`classification`,`qualification_score`);--> statement-breakpoint
CREATE TABLE `product_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`decision_type` text NOT NULL,
	`recommendation` text NOT NULL,
	`decision` text,
	`approver` text,
	`approval_evidence` text,
	`effective_at` text,
	`status` text DEFAULT 'Draft' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_decisions_product_status_idx` ON `product_decisions` (`product_id`,`status`);--> statement-breakpoint
CREATE TABLE `product_economics` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`product_version_id` text NOT NULL,
	`delivery_cost` real,
	`software_cost` real,
	`support_cost` real,
	`implementation_cost` real,
	`contingency_cost` real,
	`recurring_revenue_contribution` real,
	`gross_margin_forecast` real,
	`payback_months` real,
	`capacity_requirement` text,
	`pricing_sensitivity` text,
	`currency` text DEFAULT 'USD' NOT NULL,
	`finance_review_status` text DEFAULT 'Required' NOT NULL,
	`pricing_approval_status` text DEFAULT 'Not approved' NOT NULL,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `product_economics_product_version_idx` ON `product_economics` (`product_id`,`product_version_id`);--> statement-breakpoint
CREATE TABLE `product_experiments` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`product_version_id` text NOT NULL,
	`hypothesis` text NOT NULL,
	`riskiest_assumption` text NOT NULL,
	`baseline` text NOT NULL,
	`success_criteria` text NOT NULL,
	`failure_criteria` text NOT NULL,
	`bounded_scope` text NOT NULL,
	`approval_decision_id` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `product_experiments_product_status_idx` ON `product_experiments` (`product_id`,`status`);--> statement-breakpoint
CREATE TABLE `product_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`source_agent_id` text NOT NULL,
	`source_type` text NOT NULL,
	`summary` text NOT NULL,
	`recurrence_count` integer DEFAULT 1 NOT NULL,
	`client_impact` text NOT NULL,
	`proposed_improvement` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_feedback_product_status_idx` ON `product_feedback` (`product_id`,`status`);--> statement-breakpoint
CREATE TABLE `product_knowledge_links` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`knowledge_type` text NOT NULL,
	`knowledge_id` text NOT NULL,
	`relationship` text NOT NULL,
	`version_reference` text
);
--> statement-breakpoint
CREATE INDEX `product_knowledge_links_product_idx` ON `product_knowledge_links` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`metric_name` text NOT NULL,
	`value` real,
	`unit` text NOT NULL,
	`baseline` real,
	`target` real,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`confidence` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_metrics_product_window_idx` ON `product_metrics` (`product_id`,`window_end`);--> statement-breakpoint
CREATE TABLE `product_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	`capability` text NOT NULL,
	`inputs_json` text NOT NULL,
	`outputs_json` text NOT NULL,
	`interfaces_json` text NOT NULL,
	`assumptions_json` text DEFAULT '[]' NOT NULL,
	`exclusions_json` text DEFAULT '[]' NOT NULL,
	`effort_drivers_json` text NOT NULL,
	`acceptance_criteria_json` text NOT NULL,
	`compatible_modules_json` text DEFAULT '[]' NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_modules_name_version_idx` ON `product_modules` (`name`,`version`);--> statement-breakpoint
CREATE TABLE `product_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`requirement_type` text NOT NULL,
	`statement` text NOT NULL,
	`priority` text NOT NULL,
	`verification_method` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_requirements_product_type_idx` ON `product_requirements` (`product_id`,`requirement_type`);--> statement-breakpoint
CREATE TABLE `product_risks` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`category` text NOT NULL,
	`statement` text NOT NULL,
	`probability` integer NOT NULL,
	`impact` integer NOT NULL,
	`response` text NOT NULL,
	`owner` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_risks_product_status_idx` ON `product_risks` (`product_id`,`status`);--> statement-breakpoint
CREATE TABLE `product_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` text NOT NULL,
	`predecessor_version_id` text,
	`change_summary` text NOT NULL,
	`definition_json` text NOT NULL,
	`approval_status` text DEFAULT 'Draft' NOT NULL,
	`approval_decision_id` text,
	`proposal_eligible` integer DEFAULT false NOT NULL,
	`effective_at` text,
	`superseded_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_versions_product_version_idx` ON `product_versions` (`product_id`,`version`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_client` text NOT NULL,
	`client_problem` text NOT NULL,
	`intended_outcome` text NOT NULL,
	`scope` text NOT NULL,
	`exclusions_json` text DEFAULT '[]' NOT NULL,
	`deliverables_json` text DEFAULT '[]' NOT NULL,
	`client_responsibilities_json` text DEFAULT '[]' NOT NULL,
	`required_inputs_json` text DEFAULT '[]' NOT NULL,
	`dependencies_json` text DEFAULT '[]' NOT NULL,
	`delivery_method` text NOT NULL,
	`configurable_options_json` text DEFAULT '[]' NOT NULL,
	`estimated_duration` text NOT NULL,
	`cost_drivers_json` text DEFAULT '[]' NOT NULL,
	`pricing_inputs_json` text DEFAULT '[]' NOT NULL,
	`quality_plan` text NOT NULL,
	`security_requirements` text NOT NULL,
	`support_model` text NOT NULL,
	`recurring_component` text NOT NULL,
	`success_metrics_json` text DEFAULT '[]' NOT NULL,
	`lifecycle_status` text DEFAULT 'Idea' NOT NULL,
	`health` text DEFAULT 'Unknown' NOT NULL,
	`current_version` text DEFAULT '0.1.0' NOT NULL,
	`owner` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`project_links_json` text DEFAULT '[]' NOT NULL,
	`opportunity_links_json` text DEFAULT '[]' NOT NULL,
	`client_links_json` text DEFAULT '[]' NOT NULL,
	`evidence_links_json` text DEFAULT '[]' NOT NULL,
	`decision_links_json` text DEFAULT '[]' NOT NULL,
	`correlation_id` text NOT NULL,
	`proposal_eligible` integer DEFAULT false NOT NULL,
	`recurring_revenue_potential` text DEFAULT 'Unknown' NOT NULL,
	`gross_margin_forecast` real,
	`adoption_rate` real,
	`delivery_variation` real,
	`open_quality_findings` integer DEFAULT 0 NOT NULL,
	`unresolved_assumptions` integer DEFAULT 0 NOT NULL,
	`feedback_summary` text DEFAULT 'No validated feedback' NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "products_lifecycle_check" CHECK("products"."lifecycle_status" in ('Idea','Discovery','Validation','Pilot','Active','Scaling','Sunset','Retired'))
);
--> statement-breakpoint
CREATE INDEX `products_lifecycle_health_idx` ON `products` (`lifecycle_status`,`health`);--> statement-breakpoint
CREATE TABLE `roadmap_items` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`title` text NOT NULL,
	`lane` text DEFAULT 'Candidate' NOT NULL,
	`outcome` text NOT NULL,
	`client_impact` integer NOT NULL,
	`revenue_potential` integer NOT NULL,
	`recurring_revenue` integer NOT NULL,
	`strategic_leverage` integer NOT NULL,
	`risk_reduction` integer NOT NULL,
	`delivery_effort` integer NOT NULL,
	`reusable_ip` integer NOT NULL,
	`time_to_value` integer NOT NULL,
	`dependency_summary` text NOT NULL,
	`target_date` text,
	`acceptance_criteria` text NOT NULL,
	`commitment_decision_id` text,
	`status` text DEFAULT 'Candidate' NOT NULL,
	CONSTRAINT "roadmap_items_lane_check" CHECK("roadmap_items"."lane" in ('Committed','Candidate'))
);
--> statement-breakpoint
CREATE INDEX `roadmap_items_lane_date_idx` ON `roadmap_items` (`lane`,`target_date`);--> statement-breakpoint
CREATE TABLE `use_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`owner_agent_id` text DEFAULT 'AGT-010' NOT NULL,
	`shared_goal_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`evidence_reference` text NOT NULL,
	`is_demonstration` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`actor` text NOT NULL,
	`trigger` text NOT NULL,
	`desired_outcome` text NOT NULL,
	`preconditions_json` text DEFAULT '[]' NOT NULL,
	`flow_json` text NOT NULL,
	`exceptions_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `use_cases_product_idx` ON `use_cases` (`product_id`);
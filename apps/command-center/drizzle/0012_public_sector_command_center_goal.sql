INSERT INTO `shared_goals` (`id`, `objective`, `accountable_agent_id`, `priority`, `status`, `due_at`, `success_measures_json`, `updated_at`) VALUES
	('GOAL-2026-010', 'Develop a governed, configurable Symbiont Command Center software offering for state and local governments, starting with clerk, constituent-service, case-management, CRM, and operational-workflow needs. Evaluate Clerkos and other CRM-like systems as potential integration or migration candidates.', 'AGT-001', 'P1', 'Approved', NULL, '["Approved public-sector workflow and problem map","Configurable reference architecture with security, accessibility, records, retention, and data-governance requirements","Evidence-based evaluation of Clerkos and other CRM-like systems; no compatibility, partnership, or market claim without evidence","Human approval before outreach, pricing, pilot, credentials, data intake, or production activation"]', '2026-08-26T00:00:00.000Z')
ON CONFLICT(`id`) DO UPDATE SET
	`objective` = excluded.`objective`,
	`accountable_agent_id` = excluded.`accountable_agent_id`,
	`priority` = excluded.`priority`,
	`status` = excluded.`status`,
	`due_at` = excluded.`due_at`,
	`success_measures_json` = excluded.`success_measures_json`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
INSERT INTO `goal_assignments` (`id`, `shared_goal_id`, `agent_id`, `role`, `status`, `accepted_at`, `updated_at`) VALUES
	('ASN-GOAL-010-001', 'GOAL-2026-010', 'AGT-001', 'Accountable Owner', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-002', 'GOAL-2026-010', 'AGT-002', 'Public-sector market and pursuit contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-003', 'GOAL-2026-010', 'AGT-003', 'Delivery workflow contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-004', 'GOAL-2026-010', 'AGT-004', 'Quality contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-005', 'GOAL-2026-010', 'AGT-005', 'Knowledge and records contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-006', 'GOAL-2026-010', 'AGT-006', 'Commercial model contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-007', 'GOAL-2026-010', 'AGT-007', 'Public-sector research contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-008', 'GOAL-2026-010', 'AGT-008', 'Reliability contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-009', 'GOAL-2026-010', 'AGT-009', 'Opportunity signal contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-010', 'GOAL-2026-010', 'AGT-010', 'Product architecture contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-011', 'GOAL-2026-010', 'AGT-011', 'Evidence-backed marketing contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-012', 'GOAL-2026-010', 'AGT-012', 'Technical architecture contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-013', 'GOAL-2026-010', 'AGT-013', 'Service outcomes contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z'),
	('ASN-GOAL-010-014', 'GOAL-2026-010', 'AGT-014', 'Security and data-governance contributor', 'Assigned', NULL, '2026-08-26T00:00:00.000Z')
ON CONFLICT(`shared_goal_id`, `agent_id`) DO UPDATE SET
	`role` = excluded.`role`,
	`status` = excluded.`status`,
	`accepted_at` = excluded.`accepted_at`,
	`updated_at` = excluded.`updated_at`;

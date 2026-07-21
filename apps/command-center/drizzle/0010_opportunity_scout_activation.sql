INSERT INTO `agents` (`id`, `name`, `mission`, `authority_level`, `parent_agent_id`, `status`, `version`, `updated_at`) VALUES
	('AGT-001', 'Executive Orchestrator', 'Own shared goals, governance, and cross-agent coordination.', 'L2', NULL, 'Active', '1.0.0', '2026-07-21T10:20:00.000Z'),
	('AGT-002', 'Sales Operations', 'Qualify governed opportunities and own pursuit decisions.', 'L1', 'AGT-001', 'Active', '1.0.0', '2026-07-21T10:20:00.000Z'),
	('AGT-009', 'Opportunity Scout', 'Discover, verify, deduplicate, score, and route official-source public opportunities in New Jersey and New York.', 'L1', 'AGT-001', 'Active — governed', '1.0.0', '2026-07-21T10:20:00.000Z')
ON CONFLICT(`id`) DO UPDATE SET
	`name` = excluded.`name`,
	`mission` = excluded.`mission`,
	`authority_level` = excluded.`authority_level`,
	`parent_agent_id` = excluded.`parent_agent_id`,
	`status` = excluded.`status`,
	`version` = excluded.`version`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
INSERT INTO `shared_goals` (`id`, `objective`, `accountable_agent_id`, `priority`, `status`, `due_at`, `success_measures_json`, `updated_at`) VALUES
	('GOAL-2026-009', 'Continuously discover and verify state and local public-sector opportunities in New Jersey and New York that fit Symbiont services, then route qualified records to Sales Operations without external contact or commitment.', 'AGT-001', 'P1', 'Active', NULL, '["Official-source coverage across NJ and NY state and local buyers","Every candidate deduplicated and evidence-backed","Scores of 70 or more routed to AGT-002 for review","Scores from 50 through 69 retained on a governed watchlist","No external contact, account creation, terms acceptance, bid submission, or commitment by AGT-009"]', '2026-07-21T10:20:00.000Z')
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
	('ASN-GOAL-009-001', 'GOAL-2026-009', 'AGT-001', 'Accountable Owner', 'Accepted', '2026-07-21T10:20:00.000Z', '2026-07-21T10:20:00.000Z'),
	('ASN-GOAL-009-002', 'GOAL-2026-009', 'AGT-002', 'Handoff Owner', 'Accepted', '2026-07-21T10:20:00.000Z', '2026-07-21T10:20:00.000Z'),
	('ASN-GOAL-009-009', 'GOAL-2026-009', 'AGT-009', 'Discovery and Evidence Owner', 'Accepted', '2026-07-21T10:20:00.000Z', '2026-07-21T10:20:00.000Z')
ON CONFLICT(`shared_goal_id`, `agent_id`) DO UPDATE SET
	`role` = excluded.`role`,
	`status` = excluded.`status`,
	`accepted_at` = excluded.`accepted_at`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
INSERT INTO `monitoring_queries` (`id`, `name`, `query_text`, `source_category`, `geography`, `cadence`, `status`, `last_checked_at`, `next_check_at`, `robots_policy`, `requires_authentication`, `owner_agent_id`, `updated_at`) VALUES
	('QRY-AGT009-NY-STATE', 'New York state opportunities', 'Official New York State procurement notices for surveying, reality capture, BIM, digital twins, GIS, drones, facilities intelligence, and technical consulting.', 'Official state procurement portals', 'New York', 'Weekdays 08:00 ET', 'Active', '2026-07-21T10:20:00.000Z', '2026-07-22T12:00:00.000Z', 'Official public sources only; respect robots and access controls', 0, 'AGT-009', '2026-07-21T10:20:00.000Z'),
	('QRY-AGT009-NY-LOCAL', 'New York local opportunities', 'Official city, county, authority, university, and public-benefit-corporation notices in New York for Symbiont-fit services.', 'Official local procurement portals', 'New York', 'Weekdays 08:00 ET', 'Active', '2026-07-21T10:20:00.000Z', '2026-07-22T12:00:00.000Z', 'Official public sources only; respect robots and access controls', 0, 'AGT-009', '2026-07-21T10:20:00.000Z'),
	('QRY-AGT009-NJ-STATE', 'New Jersey state opportunities', 'Official New Jersey State procurement notices for surveying, reality capture, BIM, digital twins, GIS, drones, facilities intelligence, and technical consulting.', 'Official state procurement portals', 'New Jersey', 'Weekdays 08:00 ET', 'Active', '2026-07-21T10:20:00.000Z', '2026-07-22T12:00:00.000Z', 'Official public sources only; respect robots and access controls', 0, 'AGT-009', '2026-07-21T10:20:00.000Z'),
	('QRY-AGT009-NJ-LOCAL', 'New Jersey local opportunities', 'Official city, county, authority, university, and school-district notices in New Jersey for Symbiont-fit services.', 'Official local procurement portals', 'New Jersey', 'Weekdays 08:00 ET', 'Active', '2026-07-21T10:20:00.000Z', '2026-07-22T12:00:00.000Z', 'Official public sources only; respect robots and access controls', 0, 'AGT-009', '2026-07-21T10:20:00.000Z')
ON CONFLICT(`id`) DO UPDATE SET
	`name` = excluded.`name`,
	`query_text` = excluded.`query_text`,
	`source_category` = excluded.`source_category`,
	`geography` = excluded.`geography`,
	`cadence` = excluded.`cadence`,
	`status` = excluded.`status`,
	`last_checked_at` = excluded.`last_checked_at`,
	`next_check_at` = excluded.`next_check_at`,
	`robots_policy` = excluded.`robots_policy`,
	`requires_authentication` = excluded.`requires_authentication`,
	`owner_agent_id` = excluded.`owner_agent_id`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
INSERT INTO `opportunities` (`id`, `issuer`, `issuer_website`, `title`, `normalized_title`, `solicitation_number`, `canonical_url`, `publication_date`, `deadline_at`, `deadline_timezone`, `location`, `geography_key`, `stated_value`, `currency`, `procurement_type`, `scope`, `public_contact_json`, `access_requirements`, `fit_rationale`, `service_fit_score`, `buyer_fit_score`, `timing_score`, `value_score`, `evidence_score`, `access_score`, `recurrence_score`, `total_score`, `confidence`, `freshness`, `risks_json`, `missing_information_json`, `next_action`, `route`, `handoff_status`, `observed_at`, `source_kind`, `is_demonstration`, `parent_opportunity_id`, `updated_at`) VALUES
	('OPP-2026-RIOC-261379', 'Roosevelt Island Operating Corporation', 'https://rioc.ny.gov/', 'Flood Risk Assessment', 'flood risk assessment', '26-1379', 'https://d3olf8azjyqv1e.cloudfront.net/media/RFP%2026-1379%20Flood%20Risk%20Assessment.pdf', '2026-07-15', '2026-08-14T15:00:00-04:00', 'America/New_York', 'Roosevelt Island, New York, NY', 'ny-local-rioc', NULL, 'USD', 'RFP', 'Flood-risk assessment with topographic, boundary, and utility survey requirements supporting resiliency planning.', '{}', 'Prime must maintain a New York office or authorization; proposal has a 30 percent M/WBE goal and professional-liability requirements.', 'Strong fit for reality capture, surveying, GIS, and existing-condition documentation as a governed subconsultant pursuit.', 82, 85, 90, 55, 98, 75, 85, 83, 94, 'Official RFP observed July 21, 2026', '["Prime qualification and insurance requirements","30 percent M/WBE participation goal","Questions due July 29, 2026 at 3:00 PM ET"]', '["Expected contract value","Prime teaming strategy","Required NY authorization confirmation"]', 'AGT-002 to review fit and decide whether to pursue as a subconsultant; no contact or commitment has been made.', 'sales_operations', 'Review — awaiting AGT-002 acceptance', '2026-07-21T10:20:00.000Z', 'Official issuer RFP', 0, NULL, '2026-07-21T10:20:00.000Z'),
	('OPP-2026-NJDPP-T3163', 'New Jersey Division of Purchase and Property', 'https://www.nj.gov/treasury/purchase/', 'Unmanned Aircraft Systems, Software and Related Services', 'unmanned aircraft systems software and related services', '26DPP01263 / T3163', 'https://www.nj.gov/treasury/purchase/specialnotices/NJDPP-26DPP01263-20260828-20260717_125804.pdf', '2026-07-17', '2026-08-28T14:00:00-04:00', 'America/New_York', 'New Jersey statewide', 'nj-state-dpp', NULL, 'USD', 'RFP amendment', 'Statewide procurement for unmanned aircraft systems, software, and related services; amendment 3 revises the quote-opening date.', '{}', 'Submission occurs through NJSTART; AGT-009 must not create accounts, authenticate, accept terms, or submit.', 'Potential fit for UAS capture and related reality-capture services, but the underlying scope and participation path require qualification.', 55, 85, 90, 50, 70, 45, 90, 69, 72, 'Official amendment observed July 21, 2026', '["Only amendment 3 was verified in this run","NJSTART access may require account and terms","Underlying scope and vendor requirements need review"]', '["Complete base RFP scope","Contract value","Vendor eligibility","Teaming route"]', 'Keep on watchlist; retrieve and verify the base solicitation through an authorized owner before any sales routing.', 'watchlist', 'Watchlist', '2026-07-21T10:20:00.000Z', 'Official state procurement amendment', 0, NULL, '2026-07-21T10:20:00.000Z')
ON CONFLICT(`id`) DO UPDATE SET
	`issuer` = excluded.`issuer`,
	`issuer_website` = excluded.`issuer_website`,
	`title` = excluded.`title`,
	`normalized_title` = excluded.`normalized_title`,
	`solicitation_number` = excluded.`solicitation_number`,
	`canonical_url` = excluded.`canonical_url`,
	`publication_date` = excluded.`publication_date`,
	`deadline_at` = excluded.`deadline_at`,
	`deadline_timezone` = excluded.`deadline_timezone`,
	`location` = excluded.`location`,
	`geography_key` = excluded.`geography_key`,
	`stated_value` = excluded.`stated_value`,
	`currency` = excluded.`currency`,
	`procurement_type` = excluded.`procurement_type`,
	`scope` = excluded.`scope`,
	`public_contact_json` = excluded.`public_contact_json`,
	`access_requirements` = excluded.`access_requirements`,
	`fit_rationale` = excluded.`fit_rationale`,
	`service_fit_score` = excluded.`service_fit_score`,
	`buyer_fit_score` = excluded.`buyer_fit_score`,
	`timing_score` = excluded.`timing_score`,
	`value_score` = excluded.`value_score`,
	`evidence_score` = excluded.`evidence_score`,
	`access_score` = excluded.`access_score`,
	`recurrence_score` = excluded.`recurrence_score`,
	`total_score` = excluded.`total_score`,
	`confidence` = excluded.`confidence`,
	`freshness` = excluded.`freshness`,
	`risks_json` = excluded.`risks_json`,
	`missing_information_json` = excluded.`missing_information_json`,
	`next_action` = excluded.`next_action`,
	`route` = excluded.`route`,
	`handoff_status` = excluded.`handoff_status`,
	`observed_at` = excluded.`observed_at`,
	`source_kind` = excluded.`source_kind`,
	`is_demonstration` = excluded.`is_demonstration`,
	`parent_opportunity_id` = excluded.`parent_opportunity_id`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
INSERT INTO `opportunity_evidence` (`id`, `opportunity_id`, `canonical_url`, `source_title`, `source_type`, `evidence_summary`, `content_hash`, `confidence`, `is_amendment`, `amendment_number`, `observed_at`) VALUES
	('EVD-RIOC-261379-20260721', 'OPP-2026-RIOC-261379', 'https://d3olf8azjyqv1e.cloudfront.net/media/RFP%2026-1379%20Flood%20Risk%20Assessment.pdf', 'RFP 26-1379 Flood Risk Assessment', 'Official issuer solicitation PDF', 'RIOC issued the RFP July 15, 2026. Questions are due July 29 at 3:00 PM ET and proposals are due August 14 at 3:00 PM ET. The scope includes topographic, boundary, and utility survey work.', '7b39cf2d39463afe4509fe7fc370442dcdcde4f994e68e3d7b72af33b55c9214', 98, 0, NULL, '2026-07-21T10:20:00.000Z'),
	('EVD-NJDPP-T3163-A3-20260721', 'OPP-2026-NJDPP-T3163', 'https://www.nj.gov/treasury/purchase/specialnotices/NJDPP-26DPP01263-20260828-20260717_125804.pdf', '26DPP01263 / T3163 Amendment 3', 'Official state procurement amendment PDF', 'New Jersey DPP amendment 3 identifies the statewide UAS, software, and related-services procurement and revises the quote opening to August 28, 2026 at 2:00 PM ET.', 'b14e3e50b0f616ef43d79a6edcb8c6e333ea6168b7f1818bbf7fde9868e2a16a', 90, 1, '3', '2026-07-21T10:20:00.000Z')
ON CONFLICT(`opportunity_id`, `content_hash`) DO NOTHING;
--> statement-breakpoint
INSERT INTO `scout_runs` (`id`, `shared_goal_id`, `correlation_id`, `agent_id`, `status`, `started_at`, `completed_at`, `sources_checked`, `candidates_found`, `verified_count`, `routed_count`, `error_summary`) VALUES
	('RUN-AGT009-20260721-NYNJ', 'GOAL-2026-009', 'CORR-AGT009-NYNJ-20260721', 'AGT-009', 'Complete', '2026-07-21T09:50:00.000Z', '2026-07-21T10:20:00.000Z', 8, 6, 2, 1, NULL)
ON CONFLICT(`id`) DO NOTHING;
--> statement-breakpoint
INSERT INTO `agent_messages` (`id`, `shared_goal_id`, `correlation_id`, `sender_agent_id`, `recipient_agent_id`, `message_type`, `status`, `subject`, `body_json`, `opportunity_id`, `idempotency_key`, `created_at`, `accepted_at`) VALUES
	('MSG-AGT009-ACTIVATION-20260721', 'GOAL-2026-009', 'CORR-AGT009-NYNJ-20260721', 'AGT-001', 'AGT-009', 'Information', 'Accepted', 'Opportunity Scout production activation', '{"instruction":"Operate the governed NJ/NY official-source monitoring program at L1 authority.","guardrails":["No external contact","No account creation or authentication","No terms acceptance","No bid submission or commitment"],"cadence":"Weekdays 08:00 ET"}', NULL, 'AGT009:ACTIVATION:2026-07-21', '2026-07-21T10:20:00.000Z', '2026-07-21T10:20:00.000Z'),
	('MSG-AGT009-RIOC-HANDOFF-20260721', 'GOAL-2026-009', 'CORR-AGT009-NYNJ-20260721', 'AGT-009', 'AGT-002', 'Handoff', 'Review', 'Review RIOC Flood Risk Assessment opportunity', '{"score":83,"confidence":94,"deadline":"2026-08-14T15:00:00-04:00","questionDeadline":"2026-07-29T15:00:00-04:00","recommendedRoute":"Subconsultant pursuit review","externalActionTaken":false}', 'OPP-2026-RIOC-261379', 'AGT009:RIOC-261379:7b39cf2d39463afe4509fe7fc370442dcdcde4f994e68e3d7b72af33b55c9214', '2026-07-21T10:20:00.000Z', NULL)
ON CONFLICT(`idempotency_key`) DO NOTHING;

begin;

with org as (select id from organizations where stable_id = 'ORG-SYMBIONT'), coo as (select id from agents where stable_id = 'AGT-001')
insert into goals(stable_id,organization_id,objective,business_rationale,owning_agent_id,priority,status,success_metrics,constraints,data_classification,approval_requirements)
select
  'GOAL-2026-010',
  org.id,
  'Develop a governed, configurable Symbiont Command Center software offering for state and local governments, starting with clerk, constituent-service, case-management, CRM, and operational-workflow needs. Evaluate Clerkos and other CRM-like systems as potential integration or migration candidates.',
  'Create a repeatable public-sector software direction while validating real operating needs and preserving security, accessibility, procurement, records, and human-approval boundaries.',
  coo.id,
  'P1',
  'Approved',
  '["Approved public-sector workflow and problem map","Configurable reference architecture with security, accessibility, records, retention, and data-governance requirements","Evidence-based evaluation of Clerkos and other CRM-like systems; no compatibility, partnership, or market claim without evidence","Human approval before outreach, pricing, pilot, credentials, data intake, or production activation"]'::jsonb,
  '["No unapproved external outreach or commitments","No unapproved access to customer, resident, or government data","No production integration, pilot, or procurement action without authorized human review"]'::jsonb,
  'Internal',
  '["Human approval required before external outreach, pricing, data access, pilot activation, production deployment, or contractual commitment"]'::jsonb
from org, coo
on conflict(stable_id) do update set
  objective = excluded.objective,
  business_rationale = excluded.business_rationale,
  owning_agent_id = excluded.owning_agent_id,
  priority = excluded.priority,
  status = excluded.status,
  success_metrics = excluded.success_metrics,
  constraints = excluded.constraints,
  approval_requirements = excluded.approval_requirements,
  updated_at = now();

insert into goal_members(goal_id,agent_id,role)
select g.id, a.id, case when a.stable_id = 'AGT-001' then 'Owner' else 'Contributor' end
from goals g
join agents a on a.stable_id between 'AGT-001' and 'AGT-014'
where g.stable_id = 'GOAL-2026-010'
on conflict(goal_id,agent_id) do update set role = excluded.role;

commit;

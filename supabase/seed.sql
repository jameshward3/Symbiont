begin;
insert into organizations(stable_id,name) values('ORG-SYMBIONT','Symbiont') on conflict(stable_id) do update set name=excluded.name;
with org as (select id from organizations where stable_id='ORG-SYMBIONT')
insert into agents(organization_id,stable_id,name,mission,authority_level,status,metadata)
select id,'AGT-001','Symbiont COO','Coordinate company operations and the agent portfolio.','L2','Active','{"seed":"demonstration"}'::jsonb from org
on conflict(organization_id,stable_id) do update set mission=excluded.mission;
with org as (select id from organizations where stable_id='ORG-SYMBIONT'), coo as (select id from agents where stable_id='AGT-001')
insert into agents(organization_id,stable_id,name,mission,parent_agent_id,authority_level,status,metadata)
select org.id,'AGT-002','Sales Operations','Convert qualified client needs into clearly defined, profitable, repeatable work.',coo.id,'L1','Active','{"seed":"demonstration"}'::jsonb from org,coo
on conflict(organization_id,stable_id) do update set parent_agent_id=excluded.parent_agent_id,mission=excluded.mission;
with org as (select id from organizations where stable_id='ORG-SYMBIONT'), coo as (select id from agents where stable_id='AGT-001')
insert into agents(organization_id,stable_id,name,mission,parent_agent_id,authority_level,status,metadata)
select org.id,v.stable_id,v.name,v.mission,coo.id,v.authority_level,'Active',jsonb_build_object('seed','fourteen-agent-registry','authority','draft-or-governed-internal')
from org,coo cross join (values
  ('AGT-003','Delivery Control','Coordinate project authorization, delivery health, exceptions, changes, quality gates, and closeout.','L1'),
  ('AGT-004','QA/QC','Validate exact deliverable versions against approved requirements and release gates.','L1'),
  ('AGT-005','Knowledge Steward','Maintain an evidence-backed, searchable, governed source of operating truth.','L2'),
  ('AGT-006','Finance Operations','Prepare reconciled visibility, forecasts, and draft financial controls.','L1'),
  ('AGT-007','Research','Turn primary sources, historical evidence, and market signals into decision-ready findings.','L1'),
  ('AGT-008','Automation Reliability','Detect automation failures, contain impact, preserve evidence, and coordinate recovery.','L2'),
  ('AGT-009','Opportunity Scout','Discover and verify priority opportunities and match them to governed knowledge.','L1'),
  ('AGT-010','Product & Service Architecture','Convert recurring delivery knowledge into repeatable building-intelligence products.','L1'),
  ('AGT-011','Marketing & Content Operations','Turn approved knowledge into evidence-backed content and qualified demand.','L1'),
  ('AGT-012','Technical Architecture','Define interoperable, secure, scalable, and supportable building-intelligence architectures.','L1'),
  ('AGT-013','Client Success','Protect client outcomes from onboarding through value realization and renewal.','L1'),
  ('AGT-014','Security & Data Governance','Protect Symbiont and client data through governed controls.','L1')
) as v(stable_id,name,mission,authority_level)
on conflict(organization_id,stable_id) do update set name=excluded.name,mission=excluded.mission,parent_agent_id=excluded.parent_agent_id,authority_level=excluded.authority_level;
with sales as (select id from agents where stable_id='AGT-002')
insert into agent_capabilities(agent_id,capability,description)
select sales.id,v.capability,v.description from sales cross join (values
  ('client_intake','Register and classify authorized inquiries'),
  ('discovery','Prepare and summarize discovery material'),
  ('qualification','Score opportunities and recommend pursue, nurture, or decline'),
  ('proposal_drafting','Draft proposals and statements of work'),
  ('pricing_review','Validate pricing inputs and surface margin exceptions'),
  ('pipeline_governance','Monitor next actions, staleness, and forecasts'),
  ('sales_delivery_handoff','Prepare governed delivery handoff packages'),
  ('decision_requests','Create material decision requests for human approval')
) as v(capability,description)
on conflict(agent_id,capability) do update set description=excluded.description,active=true;
with sales as (select id from agents where stable_id='AGT-002')
insert into agent_permissions(agent_id,resource,action,effect,conditions)
select sales.id,v.resource,v.action,v.effect,v.conditions::jsonb from sales cross join (values
  ('accounts','read','allow','{"organization_scoped":true}'),
  ('opportunities','draft','allow','{"organization_scoped":true,"version_check":true}'),
  ('proposal_drafts','create','allow','{"status":"Draft","human_approval":true}'),
  ('handoffs','create','allow','{"status":"Review"}'),
  ('external_communications','send','deny','{"human_approval":true}'),
  ('pricing','approve','deny','{"human_approval":true}'),
  ('material_decisions','approve','deny','{"human_approval":true}')
) as v(resource,action,effect,conditions)
on conflict(agent_id,resource,action) do update set effect=excluded.effect,conditions=excluded.conditions;
with org as (select id from organizations where stable_id='ORG-SYMBIONT'), coo as (select id from agents where stable_id='AGT-001')
insert into goals(stable_id,organization_id,objective,business_rationale,owning_agent_id,priority,status,success_metrics,data_classification)
select 'GOAL-2026-001',org.id,'Prove governed multi-agent sales-to-delivery coordination','Validate shared goals, claims, approvals, audit, and handoffs without real client data.',coo.id,'P1','Approved','["One claim owner","Human proposal approval","Auditable handoff"]','Internal' from org,coo
on conflict(stable_id) do nothing;
insert into goal_members(goal_id,agent_id,role)
select g.id,a.id,case when a.stable_id='AGT-001' then 'Owner' else 'Contributor' end from goals g join agents a on a.stable_id in ('AGT-001','AGT-002') where g.stable_id='GOAL-2026-001'
on conflict(goal_id,agent_id) do update set role=excluded.role;
with org as (select id from organizations where stable_id='ORG-SYMBIONT'), goal as (select id from goals where stable_id='GOAL-2026-001'), sales as (select id from agents where stable_id='AGT-002')
insert into work_items(stable_id,organization_id,goal_id,title,description,owner_agent_id,eligible_agent_ids,status,priority,acceptance_criteria,authority_level,required_approval,idempotency_key)
select 'WORK-2026-001',org.id,goal.id,'Prepare governed demonstration discovery brief','Use demonstration-only inputs to prove claim, evidence, review, and handoff controls.',sales.id,array[sales.id],'Ready','P2','["Draft separates facts, inferences, assumptions, missing evidence, recommendations, and approvals","No external communication is sent"]','L1','{"type":"Human review","required":true}','seed:WORK-2026-001' from org,goal,sales
on conflict(stable_id) do update set acceptance_criteria=excluded.acceptance_criteria,required_approval=excluded.required_approval;
commit;

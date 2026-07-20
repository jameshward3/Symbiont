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
insert into goals(stable_id,organization_id,objective,business_rationale,owning_agent_id,priority,status,success_metrics,data_classification)
select 'GOAL-2026-001',org.id,'Prove governed multi-agent sales-to-delivery coordination','Validate shared goals, claims, approvals, audit, and handoffs without real client data.',coo.id,'P1','Approved','["One claim owner","Human proposal approval","Auditable handoff"]','Internal' from org,coo
on conflict(stable_id) do nothing;
insert into goal_members(goal_id,agent_id,role)
select g.id,a.id,case when a.stable_id='AGT-001' then 'Owner' else 'Contributor' end from goals g join agents a on a.stable_id in ('AGT-001','AGT-002') where g.stable_id='GOAL-2026-001'
on conflict(goal_id,agent_id) do update set role=excluded.role;
commit;

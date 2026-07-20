begin;

create extension if not exists pgcrypto;

create table organizations (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique,
  name text not null, status text not null default 'Active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade, organization_id uuid not null references organizations(id),
  display_name text not null, role text not null default 'Member', status text not null default 'Active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table agents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), stable_id text not null,
  name text not null, mission text not null, parent_agent_id uuid references agents(id), authority_level text not null check (authority_level in ('L0','L1','L2','L3','L4')),
  status text not null default 'Active', human_owner_id uuid references profiles(id), charter_version text not null default '1.0', metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, stable_id)
);
create table agent_capabilities (
  id uuid primary key default gen_random_uuid(), agent_id uuid not null references agents(id) on delete cascade, capability text not null,
  description text, active boolean not null default true, created_at timestamptz not null default now(), unique(agent_id, capability)
);
create table agent_permissions (
  id uuid primary key default gen_random_uuid(), agent_id uuid not null references agents(id) on delete cascade, resource text not null,
  action text not null, effect text not null check(effect in ('allow','deny')), conditions jsonb not null default '{}', created_at timestamptz not null default now(), unique(agent_id, resource, action)
);
create table goals (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique, organization_id uuid not null references organizations(id), objective text not null,
  business_rationale text not null, sponsor_user_id uuid references profiles(id), owning_agent_id uuid not null references agents(id), priority text not null,
  status text not null check(status in ('Proposed','Approved','Active','Blocked','Review','Complete','Cancelled')), start_date date, due_date date,
  success_metrics jsonb not null default '[]', constraints jsonb not null default '[]', data_classification text not null default 'Internal', approval_requirements jsonb not null default '[]',
  current_version integer not null default 1, completion_evidence jsonb, retrospective jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table goal_members (
  goal_id uuid not null references goals(id) on delete cascade, agent_id uuid not null references agents(id) on delete cascade,
  role text not null check(role in ('Owner','Contributor','Reviewer','Observer')), joined_at timestamptz not null default now(), primary key(goal_id, agent_id)
);
create unique index one_goal_owner on goal_members(goal_id) where role = 'Owner';
create table work_items (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique, organization_id uuid not null references organizations(id), goal_id uuid references goals(id),
  title text not null, description text not null, owner_agent_id uuid not null references agents(id), eligible_agent_ids uuid[] not null default '{}',
  status text not null check(status in ('Ready','Claimed','In Progress','Waiting','Blocked','Review','Complete','Failed','Cancelled')), priority text not null,
  acceptance_criteria jsonb not null default '[]', due_at timestamptz, authority_level text not null, required_approval jsonb,
  idempotency_key text not null, claimed_by_agent_id uuid references agents(id), claim_timestamp timestamptz, lease_expires_at timestamptz,
  attempt_count integer not null default 0, completion_evidence jsonb, blocker_detail text, version integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id, idempotency_key)
);
create table work_item_dependencies (
  work_item_id uuid not null references work_items(id) on delete cascade, depends_on_work_item_id uuid not null references work_items(id),
  created_at timestamptz not null default now(), primary key(work_item_id, depends_on_work_item_id), check(work_item_id <> depends_on_work_item_id)
);
create table agent_runs (
  id uuid primary key default gen_random_uuid(), run_id text not null unique, organization_id uuid not null references organizations(id), agent_id uuid not null references agents(id),
  user_id uuid references profiles(id), goal_id uuid references goals(id), work_item_id uuid references work_items(id), correlation_id text not null,
  status text not null, model_provider text, model text, duration_ms integer, input_summary jsonb, output_summary jsonb, error_code text,
  started_at timestamptz not null default now(), completed_at timestamptz
);
create table agent_messages (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), message_type text not null check(message_type in ('Information','Request','Handoff','Review Request','Decision Request','Blocker','Completion','Incident')),
  sender_agent_id uuid references agents(id), recipient_agent_id uuid references agents(id), audience text, goal_id uuid references goals(id), work_item_id uuid references work_items(id),
  payload jsonb not null, status text not null default 'Open', correlation_id text not null, expires_at timestamptz, created_at timestamptz not null default now()
);
create table goal_events (
  id bigint generated always as identity primary key, organization_id uuid not null references organizations(id), goal_id uuid references goals(id), work_item_id uuid references work_items(id),
  decision_id uuid, handoff_id uuid, agent_id uuid references agents(id), user_id uuid references profiles(id), event_type text not null,
  payload jsonb not null default '{}', correlation_id text not null, created_at timestamptz not null default now()
);
create table decisions (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique, organization_id uuid not null references organizations(id), goal_id uuid references goals(id),
  statement text not null, owner_user_id uuid references profiles(id), requesting_agent_id uuid references agents(id), approver_user_id uuid references profiles(id),
  evidence jsonb not null default '[]', assumptions jsonb not null default '[]', options jsonb not null default '[]', recommendation text, rationale text, risks jsonb not null default '[]',
  status text not null check(status in ('Proposed','Review','Approved','Rejected','Superseded')), required_by date, approval_timestamp timestamptz, validation_date date,
  outcome jsonb, superseded_decision_id uuid references decisions(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table goal_events add constraint goal_events_decision_fk foreign key(decision_id) references decisions(id);
create table artifacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), goal_id uuid references goals(id), work_item_id uuid references work_items(id),
  created_by_agent_id uuid references agents(id), created_by_user_id uuid references profiles(id), artifact_type text not null, title text not null,
  content jsonb not null, classification text not null default 'Internal', version integer not null default 1, status text not null default 'Draft', source_artifact_id uuid references artifacts(id), created_at timestamptz not null default now()
);
create table memory_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), source text not null, author_agent_id uuid references agents(id), author_user_id uuid references profiles(id),
  goal_id uuid references goals(id), classification text not null, statement_type text not null check(statement_type in ('Fact','Inference','Recommendation')),
  content jsonb not null, confidence numeric(4,3), effective_date date, review_date date, retention_rule text not null, supersedes_id uuid references memory_entries(id), correction_path text not null,
  created_at timestamptz not null default now()
);
create table accounts (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique, organization_id uuid not null references organizations(id), name text not null,
  account_type text, industry text, website text, owner_user_id uuid references profiles(id), status text not null default 'Prospect', classification text not null default 'Confidential',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1
);
create table contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), account_id uuid not null references accounts(id),
  first_name text not null, last_name text not null, title text, email text, phone text, role_in_purchase text, classification text not null default 'Confidential',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1
);
create table opportunities (
  id uuid primary key default gen_random_uuid(), stable_id text not null unique, organization_id uuid not null references organizations(id), account_id uuid not null references accounts(id),
  name text not null, owner_user_id uuid references profiles(id), stage text not null, status text not null default 'Open', qualification_score integer check(qualification_score between 0 and 100),
  qualification_evidence jsonb not null default '{}', recommendation text check(recommendation in ('Pursue','Nurture','Decline') or recommendation is null), amount numeric(14,2), currency char(3) not null default 'USD',
  probability integer check(probability between 0 and 100), expected_close date, next_action text, next_action_date date, proposal_status text not null default 'Not started',
  recurring_potential text not null default 'Unknown', required_approvals jsonb not null default '[]', source_updated_at timestamptz, version integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table sales_activities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), opportunity_id uuid references opportunities(id), account_id uuid references accounts(id),
  contact_id uuid references contacts(id), activity_type text not null, occurred_at timestamptz not null, summary text not null, source text not null,
  created_by_agent_id uuid references agents(id), created_by_user_id uuid references profiles(id), created_at timestamptz not null default now()
);
create table proposal_drafts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), opportunity_id uuid not null references opportunities(id),
  created_by_agent_id uuid not null references agents(id), artifact_id uuid references artifacts(id), version integer not null default 1, status text not null default 'Draft',
  scope jsonb not null default '{}', pricing jsonb not null default '{}', margin_percent numeric(6,2), required_approvals jsonb not null default '[]', approved_by_user_id uuid references profiles(id), approved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(opportunity_id, version)
);
create table handoffs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), goal_id uuid references goals(id), opportunity_id uuid references opportunities(id),
  from_agent_id uuid not null references agents(id), to_agent_id uuid not null references agents(id), work_item_id uuid references work_items(id), status text not null default 'Review',
  payload jsonb not null, acceptance_criteria jsonb not null default '[]', accepted_by_agent_id uuid references agents(id), accepted_at timestamptz, correlation_id text not null, created_at timestamptz not null default now()
);
alter table goal_events add constraint goal_events_handoff_fk foreign key(handoff_id) references handoffs(id);

create or replace function current_org_id() returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from profiles where id = auth.uid()
$$;

create or replace function claim_work_item(p_work_item_id uuid, p_agent_id uuid, p_idempotency_key text, p_lease_seconds integer default 900)
returns work_items language plpgsql security definer set search_path = public as $$
declare claimed work_items;
begin
  if p_lease_seconds < 30 or p_lease_seconds > 3600 then raise exception 'invalid lease'; end if;
  select * into claimed from work_items where id = p_work_item_id for update skip locked;
  if not found then raise exception 'work unavailable'; end if;
  if claimed.idempotency_key <> p_idempotency_key then raise exception 'idempotency mismatch'; end if;
  if claimed.status not in ('Ready','Claimed') or (claimed.status = 'Claimed' and claimed.lease_expires_at > now()) then raise exception 'work not claimable'; end if;
  if p_agent_id <> claimed.owner_agent_id and not (p_agent_id = any(claimed.eligible_agent_ids)) then raise exception 'agent not eligible'; end if;
  update work_items set status='Claimed', claimed_by_agent_id=p_agent_id, claim_timestamp=now(), lease_expires_at=now()+make_interval(secs=>p_lease_seconds), attempt_count=attempt_count+1, version=version+1, updated_at=now()
    where id=p_work_item_id returning * into claimed;
  return claimed;
end $$;

create or replace function release_work_item(p_work_item_id uuid, p_agent_id uuid, p_status text, p_evidence jsonb default null)
returns work_items language plpgsql security definer set search_path = public as $$
declare released work_items;
begin
  if p_status not in ('Ready','Waiting','Blocked','Review','Complete','Failed') then raise exception 'invalid release status'; end if;
  update work_items set status=p_status, completion_evidence=coalesce(p_evidence, completion_evidence), claimed_by_agent_id=null, claim_timestamp=null, lease_expires_at=null, version=version+1, updated_at=now()
    where id=p_work_item_id and claimed_by_agent_id=p_agent_id returning * into released;
  if not found then raise exception 'claim not owned'; end if;
  return released;
end $$;

create or replace function prevent_material_agent_approval() returns trigger language plpgsql as $$
begin
  if new.status = 'Approved' and (new.approver_user_id is null or new.approval_timestamp is null) then raise exception 'human approval required'; end if;
  return new;
end $$;
create trigger decisions_human_approval before insert or update on decisions for each row execute function prevent_material_agent_approval();

create or replace function preserve_audit_history() returns trigger language plpgsql as $$ begin raise exception 'audit history is append-only'; end $$;
create trigger goal_events_append_only before update or delete on goal_events for each row execute function preserve_audit_history();

do $$ declare t text; begin
  foreach t in array array['organizations','profiles','agents','agent_capabilities','agent_permissions','goals','goal_members','work_items','work_item_dependencies','agent_runs','agent_messages','goal_events','decisions','artifacts','memory_entries','accounts','contacts','opportunities','sales_activities','proposal_drafts','handoffs'] loop
    execute format('alter table %I enable row level security', t);
    if t not in ('organizations','agent_capabilities','agent_permissions','goal_members','work_item_dependencies') then
      execute format('create policy org_members_select on %I for select to authenticated using (organization_id = current_org_id())', t);
    end if;
  end loop;
end $$;
create policy organization_members_select on organizations for select to authenticated using (id = current_org_id());
create policy profiles_self_select on profiles for select to authenticated using (id = auth.uid());
create policy agent_capabilities_org_select on agent_capabilities for select to authenticated using (exists(select 1 from agents a where a.id=agent_id and a.organization_id=current_org_id()));
create policy agent_permissions_org_select on agent_permissions for select to authenticated using (exists(select 1 from agents a where a.id=agent_id and a.organization_id=current_org_id()));
create policy goal_members_org_select on goal_members for select to authenticated using (exists(select 1 from goals g where g.id=goal_id and g.organization_id=current_org_id()));
create policy work_item_dependencies_org_select on work_item_dependencies for select to authenticated using (exists(select 1 from work_items w where w.id=work_item_id and w.organization_id=current_org_id()));

revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from anon;
grant execute on function claim_work_item(uuid,uuid,text,integer) to service_role;
grant execute on function release_work_item(uuid,uuid,text,jsonb) to service_role;

commit;

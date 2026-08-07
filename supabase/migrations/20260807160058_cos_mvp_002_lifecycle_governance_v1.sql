create table public.document_workflow_evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  workflow_key text not null check (workflow_key = 'COS-WF-001'),
  workflow_state text not null check (workflow_state in ('started','review_complete','approved','published','failed','cancelled')),
  initiated_by uuid not null references auth.users(id),
  completed_by uuid references auth.users(id),
  evidence_ref text not null check (length(btrim(evidence_ref)) > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((workflow_state in ('approved','published') and completed_by is not null and completed_at is not null) or workflow_state not in ('approved','published'))
);

create table public.document_approval_evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  workflow_evidence_id uuid not null references public.document_workflow_evidence(id) on delete cascade,
  approver_user_id uuid not null references auth.users(id),
  authority_scope text not null default 'documentation_publication',
  decision text not null check (decision in ('approved','rejected','abstained')),
  acceptance_statement text not null check (length(btrim(acceptance_statement)) > 0),
  candidate_content_hash text not null check (candidate_content_hash ~ '^[0-9a-f]{64}$'),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (document_version_id, workflow_evidence_id, approver_user_id, authority_scope)
);

create table public.document_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid not null references public.document_versions(id),
  from_state text not null,
  to_state text not null,
  actor_user_id uuid not null references auth.users(id),
  workflow_evidence_id uuid references public.document_workflow_evidence(id),
  approval_evidence_id uuid references public.document_approval_evidence(id),
  provenance_id uuid not null references public.document_provenance(id),
  reason text not null check (length(btrim(reason)) >= 8),
  occurred_at timestamptz not null default now()
);

create index document_workflow_evidence_document_idx on public.document_workflow_evidence (document_id, document_version_id, workflow_state);
create index document_workflow_evidence_workspace_idx on public.document_workflow_evidence (workspace_id);
create index document_workflow_evidence_initiator_idx on public.document_workflow_evidence (initiated_by);
create index document_workflow_evidence_completer_idx on public.document_workflow_evidence (completed_by);
create index document_approval_evidence_document_idx on public.document_approval_evidence (document_id, document_version_id, decision);
create index document_approval_evidence_workspace_idx on public.document_approval_evidence (workspace_id);
create index document_approval_evidence_workflow_idx on public.document_approval_evidence (workflow_evidence_id);
create index document_approval_evidence_approver_idx on public.document_approval_evidence (approver_user_id);
create index document_lifecycle_events_document_idx on public.document_lifecycle_events (document_id, occurred_at desc);
create index document_lifecycle_events_workspace_idx on public.document_lifecycle_events (workspace_id);
create index document_lifecycle_events_version_idx on public.document_lifecycle_events (document_version_id);
create index document_lifecycle_events_actor_idx on public.document_lifecycle_events (actor_user_id);
create index document_lifecycle_events_workflow_idx on public.document_lifecycle_events (workflow_evidence_id);
create index document_lifecycle_events_approval_idx on public.document_lifecycle_events (approval_evidence_id);
create index document_lifecycle_events_provenance_idx on public.document_lifecycle_events (provenance_id);

alter table public.document_workflow_evidence enable row level security;
alter table public.document_approval_evidence enable row level security;
alter table public.document_lifecycle_events enable row level security;

revoke all on table public.document_workflow_evidence, public.document_approval_evidence, public.document_lifecycle_events from anon, authenticated;
grant select, insert on table public.document_workflow_evidence, public.document_approval_evidence to authenticated;
grant select on table public.document_lifecycle_events to authenticated;
revoke update on table public.documents from authenticated;

create policy "Workspace members can read document workflow evidence" on public.document_workflow_evidence for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id=document_workflow_evidence.workspace_id and m.user_id=(select auth.uid()) and m.membership_status='active' and (m.expires_at is null or m.expires_at>now())));
create policy "Workspace owners can create document workflow evidence" on public.document_workflow_evidence for insert to authenticated
with check (initiated_by=(select auth.uid()) and exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id=document_workflow_evidence.workspace_id and m.user_id=(select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status='active' and (m.expires_at is null or m.expires_at>now())));

create policy "Workspace members can read document approval evidence" on public.document_approval_evidence for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id=document_approval_evidence.workspace_id and m.user_id=(select auth.uid()) and m.membership_status='active' and (m.expires_at is null or m.expires_at>now())));
create policy "Workspace owners can create document approval evidence" on public.document_approval_evidence for insert to authenticated
with check (approver_user_id=(select auth.uid()) and exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id=document_approval_evidence.workspace_id and m.user_id=(select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status='active' and (m.expires_at is null or m.expires_at>now())));

create policy "Workspace members can read document lifecycle events" on public.document_lifecycle_events for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id=document_lifecycle_events.workspace_id and m.user_id=(select auth.uid()) and m.membership_status='active' and (m.expires_at is null or m.expires_at>now())));

create schema if not exists creator_os_private;
revoke all on schema creator_os_private from public, anon, authenticated;

create or replace function creator_os_private.transition_document_lifecycle(
  p_document_id uuid,
  p_to_state text,
  p_actor_user_id uuid,
  p_provenance_id uuid,
  p_reason text,
  p_workflow_evidence_id uuid default null,
  p_approval_evidence_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document public.documents%rowtype;
  v_event_id uuid;
  v_allowed boolean := false;
begin
  if (select auth.uid()) is null or p_actor_user_id is distinct from (select auth.uid()) then
    raise exception 'Lifecycle actor does not match the authenticated identity' using errcode='42501';
  end if;

  select * into v_document from public.documents where id=p_document_id for update;
  if not found then raise exception 'Document not found or inaccessible' using errcode='P0002'; end if;

  if not exists (
    select 1 from public.creator_os_workspace_memberships m
    where m.workspace_id=v_document.workspace_id and m.user_id=p_actor_user_id
      and m.membership_role in ('owner','administrator') and m.membership_status='active'
      and (m.expires_at is null or m.expires_at>now())
  ) then raise exception 'Active workspace lifecycle authority is required' using errcode='42501'; end if;

  if v_document.current_version_id is null then raise exception 'Current document version is required'; end if;
  if not exists (
    select 1 from public.document_provenance p where p.id=p_provenance_id
      and p.workspace_id=v_document.workspace_id and p.document_id=v_document.id
      and p.document_version_id=v_document.current_version_id and p.trust_state='verified'
      and p.content_hash=v_document.content_hash and p.source_commit_sha=v_document.source_commit_sha
  ) then raise exception 'Verified provenance for the current version is required'; end if;

  v_allowed := case v_document.status
    when 'draft' then p_to_state in ('proposed','archived')
    when 'proposed' then p_to_state in ('draft','in_review','rejected')
    when 'in_review' then p_to_state in ('changes_requested','approved','rejected')
    when 'changes_requested' then p_to_state in ('draft','proposed')
    when 'approved' then p_to_state in ('published','superseded','archived')
    when 'published' then p_to_state in ('proposed','superseded','deprecated')
    when 'superseded' then p_to_state='archived'
    when 'deprecated' then p_to_state in ('published','retired')
    when 'retired' then p_to_state in ('archived','proposed')
    when 'archived' then p_to_state='proposed'
    when 'rejected' then p_to_state in ('draft','archived')
    when 'quarantined' then p_to_state='draft'
    else false end;
  if not v_allowed then raise exception 'Lifecycle transition from % to % is not allowed',v_document.status,p_to_state; end if;

  if p_to_state='published' then
    if p_workflow_evidence_id is null or p_approval_evidence_id is null then
      raise exception 'Publication requires workflow and approval evidence';
    end if;
    if not exists (
      select 1 from public.document_workflow_evidence w
      where w.id=p_workflow_evidence_id and w.workspace_id=v_document.workspace_id
        and w.document_id=v_document.id and w.document_version_id=v_document.current_version_id
        and w.workflow_key='COS-WF-001' and w.workflow_state='approved'
        and w.completed_by is not null and w.completed_at is not null
    ) then raise exception 'Approved COS-WF-001 workflow evidence for the current version is required'; end if;
    if not exists (
      select 1 from public.document_approval_evidence a
      where a.id=p_approval_evidence_id and a.workspace_id=v_document.workspace_id
        and a.document_id=v_document.id and a.document_version_id=v_document.current_version_id
        and a.workflow_evidence_id=p_workflow_evidence_id and a.decision='approved'
        and a.candidate_content_hash=v_document.content_hash
    ) then raise exception 'Explicit approval evidence for the current version and content hash is required'; end if;
  elsif p_workflow_evidence_id is not null and not exists (
    select 1 from public.document_workflow_evidence w where w.id=p_workflow_evidence_id
      and w.workspace_id=v_document.workspace_id and w.document_id=v_document.id
      and w.document_version_id=v_document.current_version_id
  ) then raise exception 'Workflow evidence does not match the current document version'; end if;

  update public.documents set status=p_to_state,updated_at=now() where id=v_document.id;
  update public.document_versions set lifecycle_state=p_to_state where id=v_document.current_version_id;
  insert into public.document_lifecycle_events (
    workspace_id,document_id,document_version_id,from_state,to_state,actor_user_id,
    workflow_evidence_id,approval_evidence_id,provenance_id,reason
  ) values (
    v_document.workspace_id,v_document.id,v_document.current_version_id,v_document.status,p_to_state,
    p_actor_user_id,p_workflow_evidence_id,p_approval_evidence_id,p_provenance_id,p_reason
  ) returning id into v_event_id;
  return v_event_id;
end;
$$;

revoke all on function creator_os_private.transition_document_lifecycle(uuid,text,uuid,uuid,text,uuid,uuid) from public, anon, authenticated;
grant usage on schema creator_os_private to authenticated;
grant execute on function creator_os_private.transition_document_lifecycle(uuid,text,uuid,uuid,text,uuid,uuid) to authenticated;

create or replace function public.transition_document_lifecycle(
  p_document_id uuid,
  p_to_state text,
  p_actor_user_id uuid,
  p_provenance_id uuid,
  p_reason text,
  p_workflow_evidence_id uuid default null,
  p_approval_evidence_id uuid default null
) returns uuid
language sql
security invoker
set search_path = ''
as $$
  select creator_os_private.transition_document_lifecycle(
    p_document_id,p_to_state,p_actor_user_id,p_provenance_id,p_reason,
    p_workflow_evidence_id,p_approval_evidence_id
  );
$$;

revoke all on function public.transition_document_lifecycle(uuid,text,uuid,uuid,text,uuid,uuid) from public, anon;
grant execute on function public.transition_document_lifecycle(uuid,text,uuid,uuid,text,uuid,uuid) to authenticated;

comment on table public.document_workflow_evidence is 'COS-WF-001 evidence bound to an exact document version.';
comment on table public.document_approval_evidence is 'Explicit human approval evidence bound to workflow, version, and content hash.';
comment on table public.document_lifecycle_events is 'Append-only lifecycle audit trail with actor, workflow, approval, and provenance evidence.';
comment on function public.transition_document_lifecycle(uuid,text,uuid,uuid,text,uuid,uuid) is 'RLS-authenticated lifecycle boundary; publication requires verified provenance, approved COS-WF-001 workflow, and explicit approval.';

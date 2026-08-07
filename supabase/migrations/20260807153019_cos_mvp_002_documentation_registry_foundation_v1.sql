alter table public.documents
  add column if not exists workspace_id uuid references public.creator_os_workspaces(id),
  add column if not exists summary text not null default '',
  add column if not exists owner_role text not null default 'Documentation Steward',
  add column if not exists risk_class text not null default 'moderate',
  add column if not exists canonical_path text,
  add column if not exists source_commit_sha text,
  add column if not exists content_hash text,
  add column if not exists observed_at timestamptz not null default now(),
  add column if not exists sync_status text not null default 'current';

update public.documents
set workspace_id = '00000000-0000-4000-8000-000000000001'
where workspace_id is null;

alter table public.documents
  alter column workspace_id set not null,
  alter column category set not null,
  alter column document_type set not null,
  alter column version set not null,
  alter column status set not null,
  alter column owner_role set not null,
  alter column security_level set not null,
  alter column updated_at set not null;

alter table public.documents
  add constraint documents_status_check check (status in ('draft','proposed','in_review','changes_requested','approved','published','superseded','deprecated','retired','archived','rejected','quarantined')),
  add constraint documents_risk_class_check check (risk_class in ('low','moderate','high','critical')),
  add constraint documents_security_level_check check (security_level in ('public','internal','confidential','restricted')),
  add constraint documents_sync_status_check check (sync_status in ('current','stale','partial','conflict','quarantined')),
  add constraint documents_document_id_check check (document_id ~ '^COS-DOC-[0-9]{3,}$'),
  add constraint documents_source_commit_check check (source_commit_sha is null or source_commit_sha ~ '^[0-9a-f]{40}$'),
  add constraint documents_content_hash_check check (content_hash is null or content_hash ~ '^[0-9a-f]{64}$');

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  version_label text not null check (version_label ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  lifecycle_state text not null check (lifecycle_state in ('draft','proposed','in_review','changes_requested','approved','published','superseded','deprecated','retired','archived','rejected','quarantined')),
  canonical_path text not null check (length(btrim(canonical_path)) > 0),
  source_commit_sha text not null check (source_commit_sha ~ '^[0-9a-f]{40}$'),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  parent_version_id uuid references public.document_versions(id),
  supersedes_version_id uuid references public.document_versions(id),
  change_summary text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (document_id, version_label),
  unique (document_id, source_commit_sha, content_hash),
  check (parent_version_id is null or parent_version_id <> id),
  check (supersedes_version_id is null or supersedes_version_id <> id)
);

alter table public.documents add column if not exists current_version_id uuid references public.document_versions(id);

create table public.document_ownerships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id),
  owner_role text not null check (length(btrim(owner_role)) > 0),
  authority_scope text not null default 'document',
  is_primary boolean not null default false,
  effective_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at > effective_at),
  unique (document_id, owner_user_id, owner_role, effective_at)
);

create unique index document_ownerships_one_primary_idx
  on public.document_ownerships (document_id)
  where is_primary and ended_at is null;

create table public.document_provenance (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  source_type text not null check (source_type in ('github','manual','agent','import','system')),
  source_locator text not null check (length(btrim(source_locator)) > 0),
  source_commit_sha text check (source_commit_sha is null or source_commit_sha ~ '^[0-9a-f]{40}$'),
  content_hash text check (content_hash is null or content_hash ~ '^[0-9a-f]{64}$'),
  trust_state text not null default 'verified' check (trust_state in ('unverified','verified','disputed','quarantined')),
  observed_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (document_version_id, source_type, source_locator)
);

create table public.document_system_references (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  system_registry_record_id uuid not null references public.system_registry_records(id),
  relationship_type text not null check (relationship_type in ('governs','documents','implements','depends_on','references','validates','owned_by','operated_by')),
  created_at timestamptz not null default now(),
  unique (document_id, system_registry_record_id, relationship_type)
);

create index documents_workspace_status_idx on public.documents (workspace_id, status, document_id);
create index documents_workspace_category_idx on public.documents (workspace_id, category, document_id);
create index document_versions_document_created_idx on public.document_versions (document_id, created_at desc);
create index document_ownerships_workspace_owner_idx on public.document_ownerships (workspace_id, owner_user_id, ended_at);
create index document_provenance_version_idx on public.document_provenance (document_version_id, observed_at desc);
create index document_system_references_document_idx on public.document_system_references (document_id, relationship_type);

alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_ownerships enable row level security;
alter table public.document_provenance enable row level security;
alter table public.document_system_references enable row level security;

revoke all on table public.documents, public.document_versions, public.document_ownerships, public.document_provenance, public.document_system_references from anon, authenticated;
grant select, insert, update on table public.documents to authenticated;
grant select, insert on table public.document_versions, public.document_ownerships, public.document_provenance, public.document_system_references to authenticated;

drop policy if exists "Workspace members can read documents" on public.documents;
create policy "Workspace members can read documents" on public.documents for select to authenticated
using (exists (
  select 1 from public.creator_os_workspace_memberships membership
  where membership.workspace_id = documents.workspace_id
    and membership.user_id = (select auth.uid())
    and membership.membership_status = 'active'
    and (membership.expires_at is null or membership.expires_at > now())
));

drop policy if exists "Workspace owners can create documents" on public.documents;
create policy "Workspace owners can create documents" on public.documents for insert to authenticated
with check (exists (
  select 1 from public.creator_os_workspace_memberships membership
  where membership.workspace_id = documents.workspace_id
    and membership.user_id = (select auth.uid())
    and membership.membership_role in ('owner','administrator')
    and membership.membership_status = 'active'
    and (membership.expires_at is null or membership.expires_at > now())
));

drop policy if exists "Workspace owners can update documents" on public.documents;
create policy "Workspace owners can update documents" on public.documents for update to authenticated
using (exists (
  select 1 from public.creator_os_workspace_memberships membership
  where membership.workspace_id = documents.workspace_id
    and membership.user_id = (select auth.uid())
    and membership.membership_role in ('owner','administrator')
    and membership.membership_status = 'active'
    and (membership.expires_at is null or membership.expires_at > now())
))
with check (exists (
  select 1 from public.creator_os_workspace_memberships membership
  where membership.workspace_id = documents.workspace_id
    and membership.user_id = (select auth.uid())
    and membership.membership_role in ('owner','administrator')
    and membership.membership_status = 'active'
    and (membership.expires_at is null or membership.expires_at > now())
));

create policy "Workspace members can read document versions" on public.document_versions for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_versions.workspace_id and m.user_id = (select auth.uid()) and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));
create policy "Workspace owners can create document versions" on public.document_versions for insert to authenticated
with check (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_versions.workspace_id and m.user_id = (select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));

create policy "Workspace members can read document ownership" on public.document_ownerships for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_ownerships.workspace_id and m.user_id = (select auth.uid()) and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));
create policy "Workspace owners can create document ownership" on public.document_ownerships for insert to authenticated
with check (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_ownerships.workspace_id and m.user_id = (select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));

create policy "Workspace members can read document provenance" on public.document_provenance for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_provenance.workspace_id and m.user_id = (select auth.uid()) and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));
create policy "Workspace owners can create document provenance" on public.document_provenance for insert to authenticated
with check (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_provenance.workspace_id and m.user_id = (select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));

create policy "Workspace members can read document system references" on public.document_system_references for select to authenticated
using (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_system_references.workspace_id and m.user_id = (select auth.uid()) and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));
create policy "Workspace owners can create document system references" on public.document_system_references for insert to authenticated
with check (exists (select 1 from public.creator_os_workspace_memberships m where m.workspace_id = document_system_references.workspace_id and m.user_id = (select auth.uid()) and m.membership_role in ('owner','administrator') and m.membership_status = 'active' and (m.expires_at is null or m.expires_at > now())));

create or replace function public.create_document_registry_entry(
  p_workspace_id uuid,
  p_document_id text,
  p_title text,
  p_summary text,
  p_category text,
  p_document_type text,
  p_owner_role text,
  p_lifecycle_state text,
  p_security_level text,
  p_risk_class text,
  p_version_label text,
  p_canonical_path text,
  p_source_commit_sha text,
  p_content_hash text,
  p_system_keys text[] default array[]::text[]
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_document uuid;
  v_version uuid;
begin
  insert into public.documents (
    workspace_id, document_id, title, summary, category, document_type, version, status,
    owner, owner_role, security_level, risk_class, canonical_path, source_commit_sha,
    content_hash, observed_at, sync_status, updated_at
  ) values (
    p_workspace_id, p_document_id, btrim(p_title), coalesce(p_summary, ''), p_category,
    p_document_type, p_version_label, p_lifecycle_state, p_owner_role, p_owner_role,
    p_security_level, p_risk_class, p_canonical_path, p_source_commit_sha,
    p_content_hash, now(), 'current', now()
  ) returning id into v_document;

  insert into public.document_versions (
    workspace_id, document_id, version_label, lifecycle_state, canonical_path,
    source_commit_sha, content_hash, change_summary, created_by
  ) values (
    p_workspace_id, v_document, p_version_label, p_lifecycle_state, p_canonical_path,
    p_source_commit_sha, p_content_hash, 'Initial registry version', (select auth.uid())
  ) returning id into v_version;

  insert into public.document_ownerships (
    workspace_id, document_id, owner_user_id, owner_role, authority_scope, is_primary
  ) values (p_workspace_id, v_document, (select auth.uid()), p_owner_role, 'document', true);

  insert into public.document_provenance (
    workspace_id, document_id, document_version_id, source_type, source_locator,
    source_commit_sha, content_hash, trust_state, created_by
  ) values (
    p_workspace_id, v_document, v_version, 'github', p_canonical_path,
    p_source_commit_sha, p_content_hash, 'verified', (select auth.uid())
  );

  insert into public.document_system_references (
    workspace_id, document_id, system_registry_record_id, relationship_type
  )
  select p_workspace_id, v_document, record.id, 'references'
  from public.system_registry_records record
  where record.workspace_id = p_workspace_id and record.canonical_id = any(p_system_keys)
  on conflict do nothing;

  update public.documents set current_version_id = v_version where id = v_document;
  return v_document;
end;
$$;

revoke all on function public.create_document_registry_entry(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text[]) from public, anon;
grant execute on function public.create_document_registry_entry(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text[]) to authenticated;

comment on table public.documents is 'COS-MVP-002 stable Documentation Registry identities; canonical content remains in GitHub Markdown.';
comment on table public.document_versions is 'Immutable document version and version-relationship evidence.';
comment on table public.document_ownerships is 'Time-bounded human ownership assignments for governed documents.';
comment on table public.document_provenance is 'Source and integrity evidence for document versions.';
comment on table public.document_system_references is 'Typed links from documents to authoritative System Registry records.';
comment on function public.create_document_registry_entry(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,text[]) is 'Transaction-safe, RLS-governed creation of a document identity, initial version, ownership, provenance, and registry references.';

with seed(document_uuid, version_uuid, document_key, title, summary, category, document_type, version_label, lifecycle_state, owner_role, security_level, risk_class, canonical_path, source_commit_sha, content_hash) as (
  values
    ('10000000-0000-4000-8000-000000000001'::uuid,'11000000-0000-4000-8000-000000000001'::uuid,'COS-DOC-001','Creator OS Foundry Documentation Standards','Canonical rules for naming, structuring, reviewing, versioning, and retiring Creator OS documentation.','governance','standard','1.0.0','published','Documentation Steward','internal','high','00_Governance/Documentation_Standards.md','1ff2fe92cbbcb248ccb2c23709dc8f652ed81c31','eedd8a9c0b812f03f30b7687b0bad4cdd1db3805b6a803ed4af078895174e940'),
    ('10000000-0000-4000-8000-000000000002'::uuid,'11000000-0000-4000-8000-000000000002'::uuid,'COS-DOC-002','Documentation Engine Architecture','Architecture and authority boundaries for canonical documentation and its governed control plane.','architecture','architecture','1.0.0','approved','Documentation Steward','internal','high','02_Documentation_Engine/Documentation_Engine_Architecture.md','1ff2fe92cbbcb248ccb2c23709dc8f652ed81c31','5e8c019625b59b6dbbc4ce014786187e137dc166c317ca96c269464f3b7e0862'),
    ('10000000-0000-4000-8000-000000000003'::uuid,'11000000-0000-4000-8000-000000000003'::uuid,'COS-DOC-003','COS-MVP-002 Documentation Center Product Specification','Product requirements and acceptance criteria for the Documentation Center.','application','product_specification','1.0.0','proposed','Product Owner','internal','high','07_Applications/COS-MVP-002_Documentation_Center_Product_Specification.md','1ff2fe92cbbcb248ccb2c23709dc8f652ed81c31','7cc1cb17f04a13720870a748668fb138d7f1e36eec7ff3ee87bba948b1ed3c2a')
), inserted_documents as (
  insert into public.documents (
    id, workspace_id, document_id, title, summary, category, document_type, version, status,
    owner, owner_role, security_level, risk_class, canonical_path, source_commit_sha,
    content_hash, observed_at, sync_status, updated_at
  )
  select document_uuid, '00000000-0000-4000-8000-000000000001', document_key, title, summary,
    category, document_type, version_label, lifecycle_state, owner_role, owner_role,
    security_level, risk_class, canonical_path, source_commit_sha, content_hash, now(), 'current', now()
  from seed
  on conflict (document_id) do update set
    title = excluded.title, summary = excluded.summary, category = excluded.category,
    document_type = excluded.document_type, version = excluded.version, status = excluded.status,
    owner_role = excluded.owner_role, security_level = excluded.security_level,
    risk_class = excluded.risk_class, canonical_path = excluded.canonical_path,
    source_commit_sha = excluded.source_commit_sha, content_hash = excluded.content_hash,
    observed_at = excluded.observed_at, sync_status = excluded.sync_status, updated_at = now()
  returning id, document_id
)
insert into public.document_versions (
  id, workspace_id, document_id, version_label, lifecycle_state, canonical_path,
  source_commit_sha, content_hash, change_summary
)
select seed.version_uuid, '00000000-0000-4000-8000-000000000001', documents.id,
  seed.version_label, seed.lifecycle_state, seed.canonical_path, seed.source_commit_sha,
  seed.content_hash, 'Initial COS-MVP-002 Documentation Registry seed'
from seed join public.documents documents on documents.document_id = seed.document_key
on conflict (document_id, version_label) do nothing;

update public.documents document
set current_version_id = version.id
from public.document_versions version
where version.document_id = document.id and version.version_label = document.version
  and document.document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003');

insert into public.document_ownerships (workspace_id, document_id, owner_user_id, owner_role, authority_scope, is_primary)
select document.workspace_id, document.id, membership.user_id, document.owner_role, 'document', true
from public.documents document
join lateral (
  select user_id from public.creator_os_workspace_memberships
  where workspace_id = document.workspace_id and membership_role = 'owner' and membership_status = 'active'
  order by created_at limit 1
) membership on true
where document.document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003')
on conflict do nothing;

insert into public.document_provenance (
  workspace_id, document_id, document_version_id, source_type, source_locator,
  source_commit_sha, content_hash, trust_state
)
select document.workspace_id, document.id, version.id, 'github', document.canonical_path,
  document.source_commit_sha, document.content_hash, 'verified'
from public.documents document
join public.document_versions version on version.id = document.current_version_id
where document.document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003')
on conflict do nothing;

insert into public.document_system_references (workspace_id, document_id, system_registry_record_id, relationship_type)
select document.workspace_id, document.id, registry.id,
  case when document.document_id = 'COS-DOC-003' then 'documents' else 'governs' end
from public.documents document
join public.system_registry_records registry on registry.workspace_id = document.workspace_id
where (document.document_id = 'COS-DOC-001' and registry.canonical_id = 'COS-WF-001')
   or (document.document_id = 'COS-DOC-002' and registry.canonical_id = 'COS-AI-001')
   or (document.document_id = 'COS-DOC-003' and registry.canonical_id = 'COS-MVP-001')
on conflict do nothing;

create table if not exists public.system_registry_records (
  id uuid primary key default gen_random_uuid(),
  registry_type text not null check (registry_type in ('agent','tool','workflow','application','module','integration')),
  canonical_id text not null,
  display_name text not null check (length(btrim(display_name)) > 0),
  description text not null default '',
  owner_role text not null check (length(btrim(owner_role)) > 0),
  semantic_version text not null default '1.0.0',
  lifecycle_status text not null check (lifecycle_status in ('proposed','approved','active','paused','restricted','deprecated','retired')),
  risk_class text not null check (risk_class in ('low','moderate','high','critical')),
  canonical_path text not null,
  source_commit_sha text not null check (source_commit_sha ~ '^[0-9a-f]{40}$'),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  observed_at timestamptz not null default now(),
  sync_status text not null check (sync_status in ('current','stale','partial','conflict','quarantined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registry_type, canonical_id)
);

create index if not exists system_registry_records_type_id_idx
  on public.system_registry_records (registry_type, canonical_id, id);
create index if not exists system_registry_records_lifecycle_idx
  on public.system_registry_records (lifecycle_status);
create index if not exists system_registry_records_observed_idx
  on public.system_registry_records (observed_at desc);

alter table public.system_registry_records enable row level security;

revoke all on table public.system_registry_records from anon, authenticated;
grant select on table public.system_registry_records to authenticated;

drop policy if exists "Authenticated users can read global registry baseline" on public.system_registry_records;
create policy "Authenticated users can read global registry baseline"
  on public.system_registry_records
  for select
  to authenticated
  using ((select auth.uid()) is not null);

comment on table public.system_registry_records is
  'Read-only normalized registry for COS-MVP-001; canonical authority remains in GitHub Markdown.';

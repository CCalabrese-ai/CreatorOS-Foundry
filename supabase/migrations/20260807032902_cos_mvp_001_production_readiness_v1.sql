create table if not exists public.creator_os_workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null check (length(btrim(display_name)) > 0),
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active','suspended','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_os_workspace_memberships (
  workspace_id uuid not null references public.creator_os_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null check (membership_role in ('owner','administrator','viewer')),
  membership_status text not null default 'active' check (membership_status in ('active','suspended','revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  check (expires_at is null or expires_at > created_at)
);

insert into public.creator_os_workspaces (id, slug, display_name, lifecycle_status)
values ('00000000-0000-4000-8000-000000000001', 'creator-os-foundry', 'Creator OS Foundry', 'active')
on conflict (id) do update
set slug = excluded.slug,
    display_name = excluded.display_name,
    lifecycle_status = excluded.lifecycle_status,
    updated_at = now();

alter table public.system_registry_records
  add column if not exists workspace_id uuid references public.creator_os_workspaces(id);

update public.system_registry_records
set workspace_id = '00000000-0000-4000-8000-000000000001'
where workspace_id is null;

alter table public.system_registry_records alter column workspace_id set not null;

create index if not exists system_registry_records_workspace_type_idx
  on public.system_registry_records (workspace_id, registry_type, canonical_id, id);
create index if not exists creator_os_memberships_user_status_idx
  on public.creator_os_workspace_memberships (user_id, membership_status, expires_at);

alter table public.creator_os_workspaces enable row level security;
alter table public.creator_os_workspace_memberships enable row level security;
alter table public.system_registry_records enable row level security;

revoke all on table public.creator_os_workspaces from anon, authenticated;
revoke all on table public.creator_os_workspace_memberships from anon, authenticated;
revoke all on table public.system_registry_records from anon, authenticated;
grant select on table public.creator_os_workspaces to authenticated;
grant select on table public.creator_os_workspace_memberships to authenticated;
grant select on table public.system_registry_records to authenticated;

create policy "Users can read accessible workspaces"
  on public.creator_os_workspaces for select to authenticated
  using (
    lifecycle_status = 'active'
    and exists (
      select 1 from public.creator_os_workspace_memberships membership
      where membership.workspace_id = creator_os_workspaces.id
        and membership.user_id = (select auth.uid())
        and membership.membership_status = 'active'
        and (membership.expires_at is null or membership.expires_at > now())
    )
  );

create policy "Users can read own active memberships"
  on public.creator_os_workspace_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    and membership_status = 'active'
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "Authenticated users can read global registry baseline" on public.system_registry_records;
create policy "Workspace members can read registry records"
  on public.system_registry_records for select to authenticated
  using (
    exists (
      select 1 from public.creator_os_workspace_memberships membership
      where membership.workspace_id = system_registry_records.workspace_id
        and membership.user_id = (select auth.uid())
        and membership.membership_status = 'active'
        and (membership.expires_at is null or membership.expires_at > now())
    )
  );

comment on table public.creator_os_workspaces is 'Tenant boundary for Creator OS applications and registries.';
comment on table public.creator_os_workspace_memberships is 'Server-administered workspace authorization; clients have read-only access to their own active membership.';
comment on column public.system_registry_records.workspace_id is 'Required tenant boundary enforced by row-level security.';

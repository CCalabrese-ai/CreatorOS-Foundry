insert into public.document_versions (
  id, workspace_id, document_id, version_label, lifecycle_state, canonical_path,
  source_commit_sha, content_hash, change_summary
)
select '11000000-0000-4000-8000-000000000001', document.workspace_id, document.id,
  '1.0.0', 'published', document.canonical_path, document.source_commit_sha,
  document.content_hash, 'Initial COS-MVP-002 Documentation Registry seed'
from public.documents document where document.document_id = 'COS-DOC-001'
on conflict do nothing;

insert into public.document_versions (
  id, workspace_id, document_id, version_label, lifecycle_state, canonical_path,
  source_commit_sha, content_hash, change_summary
)
select '11000000-0000-4000-8000-000000000002', document.workspace_id, document.id,
  '1.0.0', 'approved', document.canonical_path, document.source_commit_sha,
  document.content_hash, 'Initial COS-MVP-002 Documentation Registry seed'
from public.documents document where document.document_id = 'COS-DOC-002'
on conflict do nothing;

insert into public.document_versions (
  id, workspace_id, document_id, version_label, lifecycle_state, canonical_path,
  source_commit_sha, content_hash, change_summary
)
select '11000000-0000-4000-8000-000000000003', document.workspace_id, document.id,
  '1.0.0', 'proposed', document.canonical_path, document.source_commit_sha,
  document.content_hash, 'Initial COS-MVP-002 Documentation Registry seed'
from public.documents document where document.document_id = 'COS-DOC-003'
on conflict do nothing;

update public.documents document
set current_version_id = version.id, updated_at = now()
from public.document_versions version
where version.document_id = document.id and version.version_label = document.version
  and document.document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003');

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

do $$
begin
  if (select count(*) from public.documents where document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003') and current_version_id is not null) <> 3 then
    raise exception 'COS-MVP-002 seed integrity failed: current versions missing';
  end if;
  if (select count(*) from public.document_provenance provenance join public.documents document on document.id = provenance.document_id where document.document_id in ('COS-DOC-001','COS-DOC-002','COS-DOC-003')) <> 3 then
    raise exception 'COS-MVP-002 seed integrity failed: provenance missing';
  end if;
end;
$$;

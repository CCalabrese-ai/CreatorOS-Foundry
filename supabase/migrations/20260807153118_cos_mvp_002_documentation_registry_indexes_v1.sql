create index if not exists documents_current_version_idx
  on public.documents (current_version_id);
create index if not exists document_versions_workspace_idx
  on public.document_versions (workspace_id);
create index if not exists document_versions_parent_idx
  on public.document_versions (parent_version_id);
create index if not exists document_versions_supersedes_idx
  on public.document_versions (supersedes_version_id);
create index if not exists document_versions_created_by_idx
  on public.document_versions (created_by);
create index if not exists document_ownerships_owner_user_idx
  on public.document_ownerships (owner_user_id);
create index if not exists document_provenance_workspace_idx
  on public.document_provenance (workspace_id);
create index if not exists document_provenance_document_idx
  on public.document_provenance (document_id);
create index if not exists document_provenance_created_by_idx
  on public.document_provenance (created_by);
create index if not exists document_system_references_workspace_idx
  on public.document_system_references (workspace_id);
create index if not exists document_system_references_registry_idx
  on public.document_system_references (system_registry_record_id);

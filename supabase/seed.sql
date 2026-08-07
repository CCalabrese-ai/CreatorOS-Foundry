insert into public.system_registry_records
  (registry_type, canonical_id, display_name, description, owner_role, semantic_version, lifecycle_status, risk_class, canonical_path, source_commit_sha, content_hash, observed_at, sync_status)
values
  ('agent','COS-AI-001','Documentation Architect Agent','Creates and governs canonical Creator OS documentation.','Documentation Steward','1.0.0','active','moderate','03_AI_Workforce/COS-AI-001_Documentation_Architect_Agent.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-AI-001-v1','sha256'),'hex'),now(),'current'),
  ('agent','COS-AI-002','Architecture Agent','Maintains architecture decisions and system boundaries.','Architecture Owner','1.0.0','active','high','03_AI_Workforce/COS-AI-002_Architecture_Agent.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-AI-002-v1','sha256'),'hex'),now(),'current'),
  ('agent','COS-AI-003','Tool Management Agent','Governs tool registration, risk, and permissions.','Tool Registry Owner','1.0.0','active','high','03_AI_Workforce/COS-AI-003_Tool_Management_Agent.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-AI-003-v1','sha256'),'hex'),now(),'current'),
  ('agent','COS-AI-004','Project Operations Agent','Coordinates delivery, evidence, and operating handoffs.','Project Operations Owner','1.0.0','active','moderate','03_AI_Workforce/COS-AI-004_Project_Operations_Agent.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-AI-004-v1','sha256'),'hex'),now(),'current'),
  ('tool','COS-TOOL-001','ChatGPT','Primary AI workspace and orchestration interface.','Tool Registry Owner','1.0.0','active','high','04_Tool_Registry/Tool_Registry.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-TOOL-001-v1','sha256'),'hex'),now(),'current'),
  ('tool','COS-TOOL-002','Codex','Software building, testing, and repository delivery.','Tool Registry Owner','1.0.0','active','high','04_Tool_Registry/Tool_Registry.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-TOOL-002-v1','sha256'),'hex'),now(),'current'),
  ('tool','COS-TOOL-003','Supabase','Core database, authentication, and structured data platform.','Data Owner','1.0.0','active','high','04_Tool_Registry/Tool_Registry.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-TOOL-003-v1','sha256'),'hex'),now(),'current'),
  ('tool','COS-TOOL-004','GitHub','Canonical source control and documentation history.','Tool Registry Owner','1.0.0','approved','high','04_Tool_Registry/Tool_Registry.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-TOOL-004-v1','sha256'),'hex'),now(),'current'),
  ('workflow','COS-WF-001','Document Creation Workflow','Creates, validates, approves, and publishes canonical documents.','Automation Owner','1.0.0','approved','high','06_Automations/COS-WF-001_Document_Creation_Workflow.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-WF-001-v1','sha256'),'hex'),now(),'current'),
  ('application','COS-MVP-001','System Registry Viewer','Read-only MVP view of authorized Creator OS registry records.','Application Owner','1.0.0','proposed','high','07_Applications/COS-MVP-001_System_Registry_Viewer_Build_Implementation.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-MVP-001-v1','sha256'),'hex'),now(),'current'),
  ('module','COS-MOD-001','Control Center Registry Module','Registry navigation, filters, list, detail, and provenance UI.','Application Owner','1.0.0','proposed','moderate','07_Applications/MVP_Control_Center_Component_Specification.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-MOD-001-v1','sha256'),'hex'),now(),'current'),
  ('integration','COS-INT-001','GitHub to Supabase Registry Sync','Synchronizes approved canonical registry metadata into the read model.','Integration Owner','1.0.0','proposed','high','07_Applications/COS-MVP-001_System_Registry_Integration_Requirements.md','13e7198af9fb4ade4b8a375c4f02411fd4f851e7',encode(digest('COS-INT-001-v1','sha256'),'hex'),now(),'current')
on conflict (registry_type, canonical_id) do update set
  display_name=excluded.display_name,
  description=excluded.description,
  owner_role=excluded.owner_role,
  semantic_version=excluded.semantic_version,
  lifecycle_status=excluded.lifecycle_status,
  risk_class=excluded.risk_class,
  canonical_path=excluded.canonical_path,
  source_commit_sha=excluded.source_commit_sha,
  content_hash=excluded.content_hash,
  observed_at=excluded.observed_at,
  sync_status=excluded.sync_status;

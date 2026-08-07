const ALLOWED_STATUSES = new Set([
  'draft', 'proposed', 'in_review', 'changes_requested', 'approved', 'published',
  'superseded', 'deprecated', 'retired', 'archived', 'rejected', 'quarantined'
]);
const ALLOWED_CATEGORIES = new Set(['governance', 'architecture', 'application', 'database', 'automation', 'security', 'quality']);
const ALLOWED_SECURITY_LEVELS = new Set(['public', 'internal', 'confidential', 'restricted']);
const ALLOWED_RISKS = new Set(['low', 'moderate', 'high', 'critical']);
const DOCUMENT_KEY = /^COS-DOC-[0-9]{3,}$/;
const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const CONTENT_HASH = /^[0-9a-f]{64}$/;

function cleanSearch(value, limit = 80) {
  return String(value ?? '').trim().slice(0, limit).replaceAll(',', ' ').replaceAll('%', '');
}

export function normalizeDocumentFilters(filters = {}) {
  return {
    status: ALLOWED_STATUSES.has(filters.status) ? filters.status : 'all',
    category: ALLOWED_CATEGORIES.has(filters.category) ? filters.category : 'all',
    query: cleanSearch(filters.query)
  };
}

export function validateDocumentInput(input = {}) {
  const value = {
    documentId: String(input.documentId ?? '').trim().toUpperCase(),
    title: String(input.title ?? '').trim().slice(0, 160),
    summary: String(input.summary ?? '').trim().slice(0, 500),
    category: String(input.category ?? '').trim(),
    documentType: String(input.documentType ?? '').trim().slice(0, 80),
    ownerRole: String(input.ownerRole ?? '').trim().slice(0, 100),
    lifecycleState: String(input.lifecycleState ?? 'draft').trim(),
    securityLevel: String(input.securityLevel ?? 'internal').trim(),
    riskClass: String(input.riskClass ?? 'moderate').trim(),
    versionLabel: String(input.versionLabel ?? '1.0.0').trim(),
    canonicalPath: String(input.canonicalPath ?? '').trim().slice(0, 500),
    sourceCommitSha: String(input.sourceCommitSha ?? '').trim().toLowerCase(),
    contentHash: String(input.contentHash ?? '').trim().toLowerCase(),
    systemKeys: [...new Set((input.systemKeys ?? []).map(key => String(key).trim()).filter(Boolean))].slice(0, 20)
  };

  const errors = [];
  if (!DOCUMENT_KEY.test(value.documentId)) errors.push('Document ID must use COS-DOC-NNN format.');
  if (!value.title) errors.push('Title is required.');
  if (!ALLOWED_CATEGORIES.has(value.category)) errors.push('Category is not supported.');
  if (!value.documentType) errors.push('Document type is required.');
  if (!value.ownerRole) errors.push('Owner role is required.');
  if (!ALLOWED_STATUSES.has(value.lifecycleState)) errors.push('Lifecycle state is not supported.');
  if (!ALLOWED_SECURITY_LEVELS.has(value.securityLevel)) errors.push('Security level is not supported.');
  if (!ALLOWED_RISKS.has(value.riskClass)) errors.push('Risk class is not supported.');
  if (!SEMVER.test(value.versionLabel)) errors.push('Version must use semantic x.y.z format.');
  if (!value.canonicalPath.endsWith('.md') || value.canonicalPath.startsWith('/') || value.canonicalPath.includes('..')) errors.push('Canonical path must be a repository-relative Markdown path.');
  if (!COMMIT_SHA.test(value.sourceCommitSha)) errors.push('Source commit must be a 40-character lowercase Git SHA.');
  if (!CONTENT_HASH.test(value.contentHash)) errors.push('Content hash must be a 64-character lowercase SHA-256 value.');
  return { value, errors };
}

export function summarizeDocuments(records) {
  return records.reduce((summary, record) => {
    summary.total += 1;
    summary.byStatus[record.status] = (summary.byStatus[record.status] ?? 0) + 1;
    return summary;
  }, { total: 0, byStatus: {} });
}

export function deriveDocumentState({ records = [], error, configured, authenticated, workspace, loading = false }) {
  if (!configured) return { kind: 'error', message: 'Supabase is not configured for this environment.' };
  if (!authenticated) return { kind: 'signed-out', message: 'Sign in to view the Documentation Registry.' };
  if (!workspace) return { kind: 'unauthorized', message: 'No active Creator OS workspace membership is available.' };
  if (loading) return { kind: 'loading', message: 'Loading documentation registry…' };
  if (error) return { kind: 'unavailable', message: 'The Documentation Registry is temporarily unavailable.' };
  if (!records.length) return { kind: 'empty', message: 'No document records match this view.' };
  if (records.some(record => ['conflict', 'quarantined'].includes(record.sync_status))) return { kind: 'conflict', message: 'Document integrity conflicts require review. Verified records remain visible.' };
  if (records.some(record => ['stale', 'partial'].includes(record.sync_status))) return { kind: 'partial', message: 'Some document provenance is stale or incomplete.' };
  return { kind: 'success', message: `${records.length} document records loaded.` };
}

export function isRenderableDocumentState(kind) {
  return ['success', 'partial', 'conflict'].includes(kind);
}

export function createDocumentRegistryService(supabase) {
  if (!supabase) throw new TypeError('A Supabase client is required.');

  return {
    async list(filters = {}, workspaceId) {
      if (!workspaceId) throw new TypeError('An authorized workspace is required.');
      const normalized = normalizeDocumentFilters(filters);
      let request = supabase
        .from('documents')
        .select('id,workspace_id,document_id,title,summary,category,document_type,version,status,owner_role,security_level,risk_class,canonical_path,source_commit_sha,content_hash,observed_at,sync_status,current_version_id,updated_at')
        .eq('workspace_id', workspaceId)
        .order('document_id', { ascending: true })
        .limit(100);
      if (normalized.status !== 'all') request = request.eq('status', normalized.status);
      if (normalized.category !== 'all') request = request.eq('category', normalized.category);
      if (normalized.query) request = request.or(`title.ilike.%${normalized.query}%,document_id.ilike.%${normalized.query}%,summary.ilike.%${normalized.query}%`);
      const { data, error } = await request;
      if (error) throw new Error(error.message, { cause: error });
      const records = data ?? [];
      return { records, summary: summarizeDocuments(records), filters: normalized };
    },

    async detail(documentId, workspaceId) {
      if (!documentId || !workspaceId) throw new TypeError('Document and workspace identifiers are required.');
      const [versionsResult, ownershipResult, provenanceResult, relationshipsResult] = await Promise.all([
        supabase.from('document_versions').select('id,version_label,lifecycle_state,canonical_path,source_commit_sha,content_hash,parent_version_id,supersedes_version_id,change_summary,created_at').eq('workspace_id', workspaceId).eq('document_id', documentId).order('created_at', { ascending: false }),
        supabase.from('document_ownerships').select('id,owner_user_id,owner_role,authority_scope,is_primary,effective_at,ended_at').eq('workspace_id', workspaceId).eq('document_id', documentId).order('effective_at', { ascending: false }),
        supabase.from('document_provenance').select('id,document_version_id,source_type,source_locator,source_commit_sha,content_hash,trust_state,observed_at').eq('workspace_id', workspaceId).eq('document_id', documentId).order('observed_at', { ascending: false }),
        supabase.from('document_system_references').select('id,relationship_type,system_registry_records(canonical_id,display_name,registry_type,lifecycle_status)').eq('workspace_id', workspaceId).eq('document_id', documentId)
      ]);
      const failure = [versionsResult, ownershipResult, provenanceResult, relationshipsResult].find(result => result.error);
      if (failure) throw new Error(failure.error.message, { cause: failure.error });
      return {
        versions: versionsResult.data ?? [], ownerships: ownershipResult.data ?? [],
        provenance: provenanceResult.data ?? [], relationships: relationshipsResult.data ?? []
      };
    },

    async create(input, workspaceId) {
      if (!workspaceId) throw new TypeError('An authorized workspace is required.');
      const { value, errors } = validateDocumentInput(input);
      if (errors.length) throw new TypeError(errors.join(' '));
      const { data, error } = await supabase.rpc('create_document_registry_entry', {
        p_workspace_id: workspaceId, p_document_id: value.documentId, p_title: value.title,
        p_summary: value.summary, p_category: value.category, p_document_type: value.documentType,
        p_owner_role: value.ownerRole, p_lifecycle_state: value.lifecycleState,
        p_security_level: value.securityLevel, p_risk_class: value.riskClass,
        p_version_label: value.versionLabel, p_canonical_path: value.canonicalPath,
        p_source_commit_sha: value.sourceCommitSha, p_content_hash: value.contentHash,
        p_system_keys: value.systemKeys
      });
      if (error) throw new Error(error.message, { cause: error });
      return { id: data, documentId: value.documentId };
    },

    async transition({ documentId, toState, actorUserId, provenanceId, reason, workflowEvidenceId = null, approvalEvidenceId = null }, workspaceId) {
      if (!workspaceId || !documentId || !actorUserId || !provenanceId) throw new TypeError('Workspace, document, actor, and provenance are required.');
      if (!ALLOWED_STATUSES.has(toState)) throw new TypeError('Lifecycle state is not supported.');
      const normalizedReason = String(reason ?? '').trim();
      if (normalizedReason.length < 8) throw new TypeError('A lifecycle reason of at least 8 characters is required.');
      if (toState === 'published' && (!workflowEvidenceId || !approvalEvidenceId)) {
        throw new TypeError('Publication requires workflow and approval evidence.');
      }
      const { data, error } = await supabase.rpc('transition_document_lifecycle', {
        p_document_id: documentId, p_to_state: toState, p_actor_user_id: actorUserId,
        p_provenance_id: provenanceId, p_reason: normalizedReason,
        p_workflow_evidence_id: workflowEvidenceId, p_approval_evidence_id: approvalEvidenceId
      });
      if (error) throw new Error(error.message, { cause: error });
      return { eventId: data, toState };
    }
  };
}

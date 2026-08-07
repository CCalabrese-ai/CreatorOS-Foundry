const ALLOWED_TYPES = new Set(['agent', 'tool', 'workflow', 'application', 'module', 'integration']);
const ALLOWED_STATUSES = new Set(['proposed', 'approved', 'active', 'paused', 'restricted', 'deprecated', 'retired']);

export function normalizeFilters(filters = {}) {
  const type = ALLOWED_TYPES.has(filters.type) ? filters.type : 'all';
  const status = ALLOWED_STATUSES.has(filters.status) ? filters.status : 'all';
  const query = String(filters.query ?? '').trim().slice(0, 80);
  return { type, status, query };
}

export function summarize(records) {
  return records.reduce((summary, record) => {
    summary.total += 1;
    summary.byType[record.registry_type] = (summary.byType[record.registry_type] ?? 0) + 1;
    return summary;
  }, { total: 0, byType: {} });
}

export function deriveRegistryState({ records, error, configured, authenticated, workspace, now = Date.now() }) {
  if (!configured) return { kind: 'error', message: 'Supabase is not configured for this environment.' };
  if (!authenticated) return { kind: 'signed-out', message: 'Sign in to view the System Registry.' };
  if (error) return { kind: 'unavailable', message: 'The registry is temporarily unavailable. Retry the request.' };
  if (!workspace) return { kind: 'unauthorized', message: 'No active Creator OS workspace membership is available.' };
  if (!records.length) return { kind: 'empty', message: 'No registry records match this view.' };
  if (records.some(record => ['conflict', 'quarantined'].includes(record.sync_status))) {
    return { kind: 'conflict', message: 'Registry conflicts require operator review. Verified records remain visible.' };
  }
  if (records.some(record => record.sync_status === 'partial')) {
    return { kind: 'partial', message: 'Registry data is partial. Confirm provenance before acting.' };
  }
  const staleCutoff = now - (24 * 60 * 60 * 1000);
  if (records.some(record => record.sync_status === 'stale' || Date.parse(record.observed_at) < staleCutoff)) {
    return { kind: 'stale', message: 'Registry data may be stale. Refresh or verify canonical sources.' };
  }
  return { kind: 'success', message: `${records.length} registry records loaded.` };
}

export function isRenderableRegistryState(kind) {
  return ['success', 'stale', 'partial', 'conflict'].includes(kind);
}

export function createSystemRegistryService(supabase) {
  if (!supabase) throw new TypeError('A Supabase client is required.');

  return {
    async accessibleWorkspaces() {
      const { data, error } = await supabase
        .from('creator_os_workspaces')
        .select('id,slug,display_name,lifecycle_status')
        .order('display_name', { ascending: true });
      if (error) throw new Error(error.message, { cause: error });
      return data ?? [];
    },

    async list(filters = {}, workspaceId) {
      if (!workspaceId) throw new TypeError('An authorized workspace is required.');
      const normalized = normalizeFilters(filters);
      let request = supabase
        .from('system_registry_records')
        .select('id,workspace_id,registry_type,canonical_id,display_name,description,owner_role,semantic_version,lifecycle_status,risk_class,canonical_path,source_commit_sha,content_hash,observed_at,sync_status')
        .eq('workspace_id', workspaceId)
        .order('registry_type', { ascending: true })
        .order('canonical_id', { ascending: true })
        .limit(100);

      if (normalized.type !== 'all') request = request.eq('registry_type', normalized.type);
      if (normalized.status !== 'all') request = request.eq('lifecycle_status', normalized.status);
      if (normalized.query) {
        const escaped = normalized.query.replaceAll(',', ' ').replaceAll('%', '');
        request = request.or(`display_name.ilike.%${escaped}%,canonical_id.ilike.%${escaped}%`);
      }

      const { data, error } = await request;
      if (error) throw new Error(error.message, { cause: error });
      const records = data ?? [];
      return { records, summary: summarize(records), filters: normalized };
    }
  };
}

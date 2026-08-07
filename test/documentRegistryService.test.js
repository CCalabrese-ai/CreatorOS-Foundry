import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDocumentRegistryService, deriveDocumentState, isRenderableDocumentState,
  normalizeDocumentFilters, summarizeDocuments, validateDocumentInput
} from '../src/services/documentRegistryService.js';

function query(result, calls) {
  return {
    select(value) { calls.push(['select', value]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    order(column, options) { calls.push(['order', column, options]); return this; },
    limit(value) { calls.push(['limit', value]); return this; },
    or(value) { calls.push(['or', value]); return this; },
    then(resolve) { return Promise.resolve(result).then(resolve); }
  };
}

function mockSupabase(results = {}) {
  const calls = [];
  return {
    calls,
    client: {
      from(table) { calls.push(['from', table]); return query(results[table] ?? { data: [], error: null }, calls); },
      rpc(name, args) { calls.push(['rpc', name, args]); return Promise.resolve(results.rpc ?? { data: 'document-uuid', error: null }); }
    }
  };
}

const validInput = {
  documentId: 'COS-DOC-004', title: 'A governed document', summary: 'Summary', category: 'application',
  documentType: 'specification', ownerRole: 'Documentation Steward', lifecycleState: 'draft',
  securityLevel: 'internal', riskClass: 'moderate', versionLabel: '1.0.0',
  canonicalPath: '07_Applications/A_Governed_Document.md', sourceCommitSha: 'a'.repeat(40),
  contentHash: 'b'.repeat(64), systemKeys: ['COS-MVP-001', 'COS-MVP-001']
};

test('normalizes document filters and removes unsafe PostgREST filter characters', () => {
  assert.deepEqual(normalizeDocumentFilters({ status: 'secret', category: 'architecture', query: 'Docs%,other' }), {
    status: 'all', category: 'architecture', query: 'Docs other'
  });
});

test('validates a complete document intake and deduplicates system keys', () => {
  const result = validateDocumentInput(validInput);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.value.systemKeys, ['COS-MVP-001']);
});

test('rejects malformed IDs, provenance, paths, lifecycle values, and versions', () => {
  const result = validateDocumentInput({ ...validInput, documentId: 'DOC-4', canonicalPath: '../secret.txt', sourceCommitSha: 'no', contentHash: 'no', lifecycleState: 'released', versionLabel: 'v1' });
  assert.equal(result.errors.length, 6);
});

test('summarizes only the authorized records returned by the database', () => {
  assert.deepEqual(summarizeDocuments([{ status: 'draft' }, { status: 'published' }, { status: 'published' }]), {
    total: 3, byStatus: { draft: 1, published: 2 }
  });
});

test('derives truthful document registry states', () => {
  const base = { configured: true, authenticated: true, workspace: {} };
  assert.equal(deriveDocumentState({ configured: false }).kind, 'error');
  assert.equal(deriveDocumentState({ configured: true }).kind, 'signed-out');
  assert.equal(deriveDocumentState({ configured: true, authenticated: true }).kind, 'unauthorized');
  assert.equal(deriveDocumentState({ ...base, loading: true }).kind, 'loading');
  assert.equal(deriveDocumentState({ ...base, error: new Error('no') }).kind, 'unavailable');
  assert.equal(deriveDocumentState(base).kind, 'empty');
  assert.equal(deriveDocumentState({ ...base, records: [{ sync_status: 'current' }] }).kind, 'success');
  assert.equal(deriveDocumentState({ ...base, records: [{ sync_status: 'partial' }] }).kind, 'partial');
  assert.equal(deriveDocumentState({ ...base, records: [{ sync_status: 'quarantined' }] }).kind, 'conflict');
  assert.equal(isRenderableDocumentState('conflict'), true);
  assert.equal(isRenderableDocumentState('unavailable'), false);
});

test('lists documents with workspace scope, bounded filters, and bounded results', async () => {
  const mock = mockSupabase({ documents: { data: [{ status: 'published' }], error: null } });
  const result = await createDocumentRegistryService(mock.client).list({ status: 'published', category: 'governance', query: 'policy%,x' }, 'workspace-1');
  assert.equal(result.summary.total, 1);
  assert.deepEqual(mock.calls.filter(([name]) => name === 'eq'), [
    ['eq', 'workspace_id', 'workspace-1'], ['eq', 'status', 'published'], ['eq', 'category', 'governance']
  ]);
  assert.deepEqual(mock.calls.find(([name]) => name === 'limit'), ['limit', 100]);
  assert.deepEqual(mock.calls.find(([name]) => name === 'or'), ['or', 'title.ilike.%policy x%,document_id.ilike.%policy x%,summary.ilike.%policy x%']);
});

test('fails closed when list authorization context or dependency is missing', async () => {
  const success = mockSupabase();
  await assert.rejects(createDocumentRegistryService(success.client).list(), /authorized workspace/);
  const failure = mockSupabase({ documents: { data: null, error: { message: 'denied' } } });
  await assert.rejects(createDocumentRegistryService(failure.client).list({}, 'workspace-1'), /denied/);
});

test('retrieves version, ownership, provenance, and System Registry relationships', async () => {
  const mock = mockSupabase({
    document_versions: { data: [{ version_label: '1.0.0' }], error: null },
    document_ownerships: { data: [{ owner_role: 'Documentation Steward' }], error: null },
    document_provenance: { data: [{ trust_state: 'verified' }], error: null },
    document_system_references: { data: [{ relationship_type: 'governs' }], error: null }
  });
  const detail = await createDocumentRegistryService(mock.client).detail('document-1', 'workspace-1');
  assert.equal(detail.versions.length, 1);
  assert.equal(detail.ownerships.length, 1);
  assert.equal(detail.provenance.length, 1);
  assert.equal(detail.relationships.length, 1);
  assert.equal(mock.calls.filter(([name]) => name === 'from').length, 4);
});

test('creates document identity, initial version, ownership, provenance, and references through one RPC', async () => {
  const mock = mockSupabase();
  const result = await createDocumentRegistryService(mock.client).create(validInput, 'workspace-1');
  assert.deepEqual(result, { id: 'document-uuid', documentId: 'COS-DOC-004' });
  const rpc = mock.calls.find(([name]) => name === 'rpc');
  assert.equal(rpc[1], 'create_document_registry_entry');
  assert.equal(rpc[2].p_workspace_id, 'workspace-1');
  assert.deepEqual(rpc[2].p_system_keys, ['COS-MVP-001']);
});

test('does not call the database for invalid create input', async () => {
  const mock = mockSupabase();
  await assert.rejects(createDocumentRegistryService(mock.client).create({}, 'workspace-1'), /Document ID/);
  assert.equal(mock.calls.length, 0);
});

test('surfaces transactional create failures without inventing success', async () => {
  const mock = mockSupabase({ rpc: { data: null, error: { message: 'not authorized' } } });
  await assert.rejects(createDocumentRegistryService(mock.client).create(validInput, 'workspace-1'), /not authorized/);
});

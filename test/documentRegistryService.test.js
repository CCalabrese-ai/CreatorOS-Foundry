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

test('transitions a document through the governed lifecycle RPC', async () => {
  const mock = mockSupabase({ rpc: { data: 'event-uuid', error: null } });
  const result = await createDocumentRegistryService(mock.client).transition({
    documentId: 'document-uuid', toState: 'in_review', actorUserId: 'user-uuid',
    provenanceId: 'provenance-uuid', reason: 'Ready for accountable review'
  }, 'workspace-1');
  assert.deepEqual(result, { eventId: 'event-uuid', toState: 'in_review' });
  const rpc = mock.calls.find(([name]) => name === 'rpc');
  assert.equal(rpc[1], 'transition_document_lifecycle');
  assert.equal(rpc[2].p_actor_user_id, 'user-uuid');
  assert.equal(rpc[2].p_workflow_evidence_id, null);
});

test('rejects publication without explicit workflow and approval evidence before database access', async () => {
  const mock = mockSupabase();
  await assert.rejects(createDocumentRegistryService(mock.client).transition({
    documentId: 'document-uuid', toState: 'published', actorUserId: 'user-uuid',
    provenanceId: 'provenance-uuid', reason: 'Publish approved candidate'
  }, 'workspace-1'), /workflow and approval evidence/);
  assert.equal(mock.calls.length, 0);
});

test('rejects unsupported lifecycle states and insufficient audit reasons', async () => {
  const service = createDocumentRegistryService(mockSupabase().client);
  await assert.rejects(service.transition({ documentId: 'd', toState: 'released', actorUserId: 'u', provenanceId: 'p', reason: 'Valid reason' }, 'w'), /not supported/);
  await assert.rejects(service.transition({ documentId: 'd', toState: 'proposed', actorUserId: 'u', provenanceId: 'p', reason: 'short' }, 'w'), /at least 8/);
});

// Mirrors the transition graph enforced by creator_os_private.transition_document_lifecycle
// in supabase/migrations/20260807160058_cos_mvp_002_lifecycle_governance_v1.sql. Kept as an
// explicit table so drift between the database graph and this test is a visible diff, not a
// silent gap. This is a documentation and client-forwarding guard, not proof the live
// database enforces the same graph — see Phase 6.3 Validation Requirements item 2.
const LIFECYCLE_GRAPH = {
  draft: ['proposed', 'archived'],
  proposed: ['draft', 'in_review', 'rejected'],
  in_review: ['changes_requested', 'approved', 'rejected'],
  changes_requested: ['draft', 'proposed'],
  approved: ['published', 'superseded', 'archived'],
  published: ['proposed', 'superseded', 'deprecated'],
  superseded: ['archived'],
  deprecated: ['published', 'retired'],
  retired: ['archived', 'proposed'],
  archived: ['proposed'],
  rejected: ['draft', 'archived'],
  quarantined: ['draft']
};

const ALL_STATES = Object.keys(LIFECYCLE_GRAPH);

function baseTransitionInput(toState) {
  return { documentId: 'document-uuid', toState, actorUserId: 'user-uuid', provenanceId: 'provenance-uuid', reason: 'Sufficient audit reason' };
}

for (const [fromState, allowedTargets] of Object.entries(LIFECYCLE_GRAPH)) {
  for (const toState of allowedTargets) {
    test(`valid transition matrix: ${fromState} -> ${toState} is forwarded to the governed RPC`, async () => {
      const mock = mockSupabase({ rpc: { data: 'event-uuid', error: null } });
      const input = baseTransitionInput(toState);
      if (toState === 'published') { input.workflowEvidenceId = 'workflow-uuid'; input.approvalEvidenceId = 'approval-uuid'; }
      const result = await createDocumentRegistryService(mock.client).transition(input, 'workspace-1');
      assert.equal(result.toState, toState);
      assert.equal(mock.calls.find(([name]) => name === 'rpc')[1], 'transition_document_lifecycle');
    });
  }

  const disallowedTargets = ALL_STATES.filter(state => state !== fromState && !allowedTargets.includes(state));
  const sampleInvalidTarget = disallowedTargets[0];
  if (sampleInvalidTarget) {
    test(`invalid transition matrix: ${fromState} -> ${sampleInvalidTarget} is rejected by the database and surfaced, not swallowed`, async () => {
      const mock = mockSupabase({
        rpc: { data: null, error: { message: `Lifecycle transition from ${fromState} to ${sampleInvalidTarget} is not allowed` } }
      });
      const input = baseTransitionInput(sampleInvalidTarget);
      if (sampleInvalidTarget === 'published') { input.workflowEvidenceId = 'workflow-uuid'; input.approvalEvidenceId = 'approval-uuid'; }
      await assert.rejects(
        createDocumentRegistryService(mock.client).transition(input, 'workspace-1'),
        new RegExp(`Lifecycle transition from ${fromState} to ${sampleInvalidTarget} is not allowed`)
      );
    });
  }
}

test('missing evidence: rejects publication with no evidence identifiers before database access', async () => {
  const mock = mockSupabase();
  await assert.rejects(
    createDocumentRegistryService(mock.client).transition(baseTransitionInput('published'), 'workspace-1'),
    /workflow and approval evidence/
  );
  assert.equal(mock.calls.length, 0);
});

test('missing evidence: rejects publication with workflow evidence but no approval evidence', async () => {
  const mock = mockSupabase();
  const input = { ...baseTransitionInput('published'), workflowEvidenceId: 'workflow-uuid' };
  await assert.rejects(createDocumentRegistryService(mock.client).transition(input, 'workspace-1'), /workflow and approval evidence/);
  assert.equal(mock.calls.length, 0);
});

test('missing evidence: rejects publication with approval evidence but no workflow evidence', async () => {
  const mock = mockSupabase();
  const input = { ...baseTransitionInput('published'), approvalEvidenceId: 'approval-uuid' };
  await assert.rejects(createDocumentRegistryService(mock.client).transition(input, 'workspace-1'), /workflow and approval evidence/);
  assert.equal(mock.calls.length, 0);
});

test('missing evidence: surfaces database rejection when workflow evidence is not approved for the current version', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Approved COS-WF-001 workflow evidence for the current version is required' } }
  });
  const input = { ...baseTransitionInput('published'), workflowEvidenceId: 'stale-workflow-uuid', approvalEvidenceId: 'approval-uuid' };
  await assert.rejects(createDocumentRegistryService(mock.client).transition(input, 'workspace-1'), /workflow evidence for the current version is required/);
});

test('missing evidence: surfaces database rejection when approval evidence does not match the current content hash', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Explicit approval evidence for the current version and content hash is required' } }
  });
  const input = { ...baseTransitionInput('published'), workflowEvidenceId: 'workflow-uuid', approvalEvidenceId: 'stale-approval-uuid' };
  await assert.rejects(createDocumentRegistryService(mock.client).transition(input, 'workspace-1'), /approval evidence for the current version and content hash is required/);
});

test('missing evidence: surfaces database rejection when a non-publish transition references evidence from another version', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Workflow evidence does not match the current document version' } }
  });
  const input = { ...baseTransitionInput('in_review'), workflowEvidenceId: 'mismatched-workflow-uuid' };
  await assert.rejects(createDocumentRegistryService(mock.client).transition(input, 'workspace-1'), /does not match the current document version/);
});

test('unauthorized: surfaces database rejection when the caller identity does not match the authenticated actor', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Lifecycle actor does not match the authenticated identity' } }
  });
  await assert.rejects(
    createDocumentRegistryService(mock.client).transition(baseTransitionInput('proposed'), 'workspace-1'),
    /does not match the authenticated identity/
  );
});

test('unauthorized: surfaces database rejection when the actor lacks active owner or administrator authority', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Active workspace lifecycle authority is required' } }
  });
  await assert.rejects(
    createDocumentRegistryService(mock.client).transition(baseTransitionInput('proposed'), 'workspace-1'),
    /Active workspace lifecycle authority is required/
  );
});

test('unauthorized: surfaces database rejection when provenance is missing or unverified for the current version', async () => {
  const mock = mockSupabase({
    rpc: { data: null, error: { message: 'Verified provenance for the current version is required' } }
  });
  await assert.rejects(
    createDocumentRegistryService(mock.client).transition(baseTransitionInput('proposed'), 'workspace-1'),
    /Verified provenance for the current version is required/
  );
});

test('unauthorized: does not call the database when required actor, provenance, or workspace context is absent', async () => {
  const mock = mockSupabase();
  await assert.rejects(
    createDocumentRegistryService(mock.client).transition({ toState: 'proposed', reason: 'Sufficient audit reason' }, 'workspace-1'),
    /required/
  );
  assert.equal(mock.calls.length, 0);
});

// COS-MVP-002 Phase 6.3: the stale "Workspace owners can update documents" RLS policy and
// its underlying UPDATE grant on public.documents were removed in
// 20260807161500_cos_mvp_002_remove_stale_document_update_policy_v1.sql. This guard exists
// so a future change cannot reintroduce a direct document-mutation method on this service
// without a deliberate, reviewed decision -- the client surface must stay limited to read,
// create, and the governed lifecycle transition RPC.
test('exposes no direct document mutation method; lifecycle changes are only reachable through the governed transition pathway', () => {
  const service = createDocumentRegistryService(mockSupabase().client);
  assert.deepEqual(Object.keys(service).sort(), ['create', 'detail', 'list', 'transition']);
  assert.equal(typeof service.update, 'undefined');
  assert.equal(typeof service.patch, 'undefined');
  assert.equal(typeof service.setStatus, 'undefined');
});

test('read, create, and governed lifecycle transition all continue functioning independent of the removed update policy', async () => {
  const listMock = mockSupabase({ documents: { data: [{ status: 'draft' }], error: null } });
  const listResult = await createDocumentRegistryService(listMock.client).list({}, 'workspace-1');
  assert.equal(listResult.summary.total, 1);

  const createMock = mockSupabase();
  const createResult = await createDocumentRegistryService(createMock.client).create(validInput, 'workspace-1');
  assert.deepEqual(createResult, { id: 'document-uuid', documentId: 'COS-DOC-004' });

  const transitionMock = mockSupabase({ rpc: { data: 'event-uuid', error: null } });
  const transitionResult = await createDocumentRegistryService(transitionMock.client).transition(
    baseTransitionInput('proposed'), 'workspace-1'
  );
  assert.deepEqual(transitionResult, { eventId: 'event-uuid', toState: 'proposed' });
});

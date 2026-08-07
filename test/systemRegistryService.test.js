import test from 'node:test';
import assert from 'node:assert/strict';
import { createSystemRegistryService, deriveRegistryState, isRenderableRegistryState, normalizeFilters, summarize } from '../src/services/systemRegistryService.js';
import { createObservability } from '../src/services/observability.js';

function mockSupabase(result) {
  const calls = [];
  const query = {
    select(value) { calls.push(['select', value]); return this; },
    order(value, options) { calls.push(['order', value, options]); return this; },
    limit(value) { calls.push(['limit', value]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    or(value) { calls.push(['or', value]); return this; },
    then(resolve) { return Promise.resolve(result).then(resolve); }
  };
  return { client: { from(table) { calls.push(['from', table]); return query; } }, calls };
}

test('normalizes unsupported and oversized filters', () => {
  assert.deepEqual(normalizeFilters({ type: 'secret', status: 'hidden', query: 'x'.repeat(100) }), {
    type: 'all', status: 'all', query: 'x'.repeat(80)
  });
});

test('summarizes records by authorized type', () => {
  assert.deepEqual(summarize([{ registry_type: 'agent' }, { registry_type: 'tool' }, { registry_type: 'tool' }]), {
    total: 3, byType: { agent: 1, tool: 2 }
  });
});

test('derives loading outcomes without turning failures into empty success', () => {
  assert.equal(deriveRegistryState({ records: [], configured: false, authenticated: false }).kind, 'error');
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: false }).kind, 'signed-out');
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: true }).kind, 'unauthorized');
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: true, workspace: {}, error: new Error('no') }).kind, 'unavailable');
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: true, workspace: {} }).kind, 'empty');
  assert.equal(deriveRegistryState({ records: [{ id: 1, sync_status: 'current', observed_at: new Date().toISOString() }], configured: true, authenticated: true, workspace: {} }).kind, 'success');
});

test('classifies every degraded registry state without hiding verified records', () => {
  const base = { configured: true, authenticated: true, workspace: {}, now: Date.parse('2026-08-07T04:00:00Z') };
  assert.equal(deriveRegistryState({ ...base, records: [{ sync_status: 'stale', observed_at: '2026-08-07T03:00:00Z' }] }).kind, 'stale');
  assert.equal(deriveRegistryState({ ...base, records: [{ sync_status: 'partial', observed_at: '2026-08-07T03:00:00Z' }] }).kind, 'partial');
  assert.equal(deriveRegistryState({ ...base, records: [{ sync_status: 'conflict', observed_at: '2026-08-07T03:00:00Z' }] }).kind, 'conflict');
  assert.equal(deriveRegistryState({ ...base, records: [{ sync_status: 'quarantined', observed_at: '2026-08-07T03:00:00Z' }] }).kind, 'conflict');
  assert.equal(deriveRegistryState({ ...base, records: [{ sync_status: 'current', observed_at: '2026-08-05T03:00:00Z' }] }).kind, 'stale');
  assert.equal(isRenderableRegistryState('partial'), true);
  assert.equal(isRenderableRegistryState('unavailable'), false);
});

test('bounds list queries and applies only normalized filters', async () => {
  const mock = mockSupabase({ data: [{ registry_type: 'tool' }], error: null });
  const result = await createSystemRegistryService(mock.client).list({
    type: 'tool', status: 'active', query: 'GitHub%,agent'
  }, 'workspace-1');

  assert.equal(result.summary.total, 1);
  assert.deepEqual(mock.calls.filter(([name]) => name === 'eq'), [
    ['eq', 'workspace_id', 'workspace-1'],
    ['eq', 'registry_type', 'tool'],
    ['eq', 'lifecycle_status', 'active']
  ]);
  assert.deepEqual(mock.calls.find(([name]) => name === 'limit'), ['limit', 100]);
  assert.deepEqual(mock.calls.find(([name]) => name === 'or'), [
    'or', 'display_name.ilike.%GitHub agent%,canonical_id.ilike.%GitHub agent%'
  ]);
});

test('preserves verified empty results without inventing records', async () => {
  const mock = mockSupabase({ data: [], error: null });
  const result = await createSystemRegistryService(mock.client).list({ query: 'no-match' }, 'workspace-1');
  assert.deepEqual(result.records, []);
  assert.deepEqual(result.summary, { total: 0, byType: {} });
});

test('fails closed when the registry dependency returns an error', async () => {
  const mock = mockSupabase({ data: null, error: { message: 'dependency unavailable' } });
  await assert.rejects(
    createSystemRegistryService(mock.client).list({}, 'workspace-1'),
    /dependency unavailable/
  );
});

test('fails closed when no authorized workspace is supplied', async () => {
  const mock = mockSupabase({ data: [], error: null });
  await assert.rejects(createSystemRegistryService(mock.client).list(), /authorized workspace/);
});

test('loads only workspaces exposed by membership RLS', async () => {
  const mock = mockSupabase({ data: [{ id: 'workspace-1', display_name: 'Creator OS Foundry' }], error: null });
  const workspaces = await createSystemRegistryService(mock.client).accessibleWorkspaces();
  assert.equal(workspaces.length, 1);
  assert.deepEqual(mock.calls[0], ['from', 'creator_os_workspaces']);
});

test('emits allowlisted, sanitized observability events', () => {
  const entries = [];
  const telemetry = createObservability({ info: (_label, entry) => entries.push(entry) });
  const entry = telemetry.emit('registry.load.succeeded', { workspaceId: 'workspace-1', recordCount: 12, email: 'excluded@example.com' });
  assert.equal(entry.recordCount, 12);
  assert.equal('email' in entry, false);
  assert.equal(entries.length, 1);
  assert.throws(() => telemetry.emit('registry.secret.exposed'), /Unsupported/);
});

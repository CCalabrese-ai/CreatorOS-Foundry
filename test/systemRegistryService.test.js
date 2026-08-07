import test from 'node:test';
import assert from 'node:assert/strict';
import { createSystemRegistryService, deriveRegistryState, normalizeFilters, summarize } from '../src/services/systemRegistryService.js';

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
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: true, error: new Error('no') }).kind, 'error');
  assert.equal(deriveRegistryState({ records: [], configured: true, authenticated: true }).kind, 'empty');
  assert.equal(deriveRegistryState({ records: [{ id: 1 }], configured: true, authenticated: true }).kind, 'success');
});

test('bounds list queries and applies only normalized filters', async () => {
  const mock = mockSupabase({ data: [{ registry_type: 'tool' }], error: null });
  const result = await createSystemRegistryService(mock.client).list({
    type: 'tool', status: 'active', query: 'GitHub%,agent'
  });

  assert.equal(result.summary.total, 1);
  assert.deepEqual(mock.calls.filter(([name]) => name === 'eq'), [
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
  const result = await createSystemRegistryService(mock.client).list({ query: 'no-match' });
  assert.deepEqual(result.records, []);
  assert.deepEqual(result.summary, { total: 0, byType: {} });
});

test('fails closed when the registry dependency returns an error', async () => {
  const mock = mockSupabase({ data: null, error: { message: 'dependency unavailable' } });
  await assert.rejects(
    createSystemRegistryService(mock.client).list(),
    /dependency unavailable/
  );
});

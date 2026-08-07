import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveRegistryState, normalizeFilters, summarize } from '../src/services/systemRegistryService.js';

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
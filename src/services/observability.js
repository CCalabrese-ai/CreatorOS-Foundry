const ALLOWED_EVENTS = new Set([
  'registry.workspace.resolved',
  'registry.load.started',
  'registry.load.succeeded',
  'registry.load.degraded',
  'registry.load.failed',
  'documents.load.succeeded',
  'documents.load.failed',
  'documents.detail.succeeded',
  'documents.detail.failed',
  'documents.create.succeeded',
  'documents.create.failed'
]);

function sanitize(detail = {}) {
  return Object.fromEntries(Object.entries(detail).filter(([key, value]) =>
    ['workspaceId', 'recordCount', 'durationMs', 'state', 'requestId'].includes(key)
      && ['string', 'number'].includes(typeof value)
  ));
}

export function createObservability(sink = console) {
  return {
    emit(event, detail = {}) {
      if (!ALLOWED_EVENTS.has(event)) throw new TypeError('Unsupported observability event.');
      const entry = { event, timestamp: new Date().toISOString(), ...sanitize(detail) };
      const method = event.endsWith('.failed') ? 'error' : event.endsWith('.degraded') ? 'warn' : 'info';
      sink[method]?.('[CreatorOS]', entry);
      return entry;
    }
  };
}

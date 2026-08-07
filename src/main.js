import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config.js';
import { createSystemRegistryService, deriveRegistryState, isRenderableRegistryState } from './services/systemRegistryService.js';
import { createDocumentRegistryService, deriveDocumentState, isRenderableDocumentState } from './services/documentRegistryService.js';
import { createObservability } from './services/observability.js';
import './styles.css';
import './documentation.css';

const app = document.querySelector('#app');
const config = getSupabaseConfig();
const supabase = config.configured
  ? createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
const systems = supabase ? createSystemRegistryService(supabase) : null;
const documents = supabase ? createDocumentRegistryService(supabase) : null;
const telemetry = createObservability();

const state = {
  session: null, workspace: null, activeView: 'documents', loading: false, error: null,
  systems: { records: [], summary: { total: 0, byType: {} }, selected: null, filters: { type: 'all', status: 'all', query: '' } },
  documents: { records: [], summary: { total: 0, byStatus: {} }, selected: null, detail: null, detailLoading: false, detailOriginId: null, filters: { category: 'all', status: 'all', query: '' }, showCreate: false, createStatus: '' }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Unknown';
}

function optionList(options, selected) {
  return options.map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value === 'all' ? 'All' : value.replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase())}</option>`).join('');
}

function currentViewState() {
  if (state.activeView === 'documents') return deriveDocumentState({
    records: state.documents.records, error: state.error, configured: config.configured,
    authenticated: Boolean(state.session), workspace: state.workspace, loading: state.loading
  });
  return deriveRegistryState({ records: state.systems.records, error: state.error, configured: config.configured, authenticated: Boolean(state.session), workspace: state.workspace });
}

function render() {
  const viewState = currentViewState();
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="brand-mark">CO</span><span>Creator OS Foundry</span></div>
      <nav class="capability-nav" aria-label="MVP capabilities">
        <button data-view="documents" aria-current="${state.activeView === 'documents' ? 'page' : 'false'}">Documentation</button>
        <button data-view="systems" aria-current="${state.activeView === 'systems' ? 'page' : 'false'}">Systems</button>
      </nav>
      <div class="environment"><span class="status-dot"></span> Internal MVP</div>
    </header>
    <main id="registry-content">
      <section class="hero" aria-labelledby="page-title">
        <p class="eyebrow">${state.activeView === 'documents' ? 'COS-MVP-002 · DOCUMENTATION REGISTRY' : 'COS-MVP-001 · SYSTEM REGISTRY'}</p>
        <div class="hero-row"><div><h1 id="page-title">${state.activeView === 'documents' ? 'Knowledge with a chain of custody.' : 'The operating map of Creator OS.'}</h1><p>${state.activeView === 'documents' ? 'Find governed documents, lifecycle state, accountable ownership, versions, and canonical provenance.' : 'Inspect the agents, tools, workflows, and modules that make the Foundry run.'}</p></div><div>${sessionControls()}</div></div>
      </section>
      ${state.session ? (state.activeView === 'documents' ? documentRegistryView(viewState) : systemRegistryView(viewState)) : signInView(viewState)}
    </main>
    <footer><span>Creator OS Foundry</span><span>Workspace authorized · Supabase RLS protected</span></footer>`;
  bindEvents();
}

function sessionControls() {
  if (!state.session) return '<span class="session-label">Secure workspace</span>';
  return `<div class="session"><span>${escapeHtml(state.workspace?.display_name ?? 'Resolving workspace…')}</span><button class="button ghost" data-action="sign-out">Sign out</button></div>`;
}

function signInView(viewState) {
  return `<section class="auth-card" aria-labelledby="signin-title"><div><p class="eyebrow">AUTHORIZED ACCESS</p><h2 id="signin-title">Enter Creator OS</h2><p>A passwordless sign-in link will be sent to your approved email address.</p></div><form id="sign-in-form"><label for="email">Email address</label><div class="input-row"><input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><button class="button primary" type="submit">Send secure link</button></div><p class="form-status" role="status">${escapeHtml(viewState.message)}</p></form></section>`;
}

function documentRegistryView(viewState) {
  return `<section class="registry-shell">
    <aside class="summary" aria-label="Documentation summary"><p class="eyebrow">KNOWLEDGE BASE</p><strong>${state.documents.summary.total}</strong><span>authorized documents</span>${Object.entries(state.documents.summary.byStatus).map(([status,count]) => `<div class="metric"><span>${escapeHtml(status.replaceAll('_',' '))}</span><b>${count}</b></div>`).join('')}</aside>
    <section class="registry-panel" aria-labelledby="records-title">
      <div class="panel-heading"><div><p class="eyebrow">LIVE SUPABASE DATA</p><h2 id="records-title">Documentation Registry</h2></div><div class="actions"><button class="button ghost" data-action="refresh">Refresh</button><button class="button primary" data-action="show-create">New document</button></div></div>
      ${state.documents.showCreate ? createDocumentForm() : ''}
      <form id="document-filters" class="filters"><label>Category<select name="category">${optionList(['all','governance','architecture','application','database','automation','security','quality'],state.documents.filters.category)}</select></label><label>Lifecycle<select name="status">${optionList(['all','draft','proposed','in_review','approved','published','deprecated','retired','archived','quarantined'],state.documents.filters.status)}</select></label><label class="search">Search<input name="query" maxlength="80" value="${escapeHtml(state.documents.filters.query)}" placeholder="Title, summary, or document ID"></label><button class="button primary" type="submit">Apply</button></form>
      <div class="state ${viewState.kind}" role="status" aria-live="polite">${escapeHtml(viewState.message)}</div>
      ${viewState.kind === 'unavailable' ? '<button class="button primary retry" data-action="refresh">Retry</button>' : ''}
      ${isRenderableDocumentState(viewState.kind) ? documentList() : ''}
    </section>
    ${state.documents.selected ? documentDetailPanel() : ''}
  </section>`;
}

function createDocumentForm() {
  return `<form id="create-document" class="create-form" aria-labelledby="create-title"><div class="form-heading"><div><p class="eyebrow">GOVERNED INTAKE</p><h3 id="create-title">Register a document</h3></div><button class="close-inline" type="button" data-action="hide-create" aria-label="Close document form">×</button></div><div class="form-grid"><label>Document ID<input name="documentId" required pattern="COS-DOC-[0-9]{3,}" placeholder="COS-DOC-004"></label><label>Title<input name="title" required maxlength="160"></label><label>Category<select name="category">${optionList(['governance','architecture','application','database','automation','security','quality'],'application')}</select></label><label>Document type<input name="documentType" required value="specification"></label><label>Owner role<input name="ownerRole" required value="Documentation Steward"></label><label>Lifecycle<select name="lifecycleState">${optionList(['draft','proposed'],'draft')}</select></label><label>Version<input name="versionLabel" required value="1.0.0" pattern="[0-9]+\.[0-9]+\.[0-9]+"></label><label>Canonical Markdown path<input name="canonicalPath" required placeholder="07_Applications/Example.md"></label><label class="wide">Summary<textarea name="summary" maxlength="500"></textarea></label><label class="wide">Source commit SHA<input name="sourceCommitSha" required minlength="40" maxlength="40"></label><label class="wide">SHA-256 content hash<input name="contentHash" required minlength="64" maxlength="64"></label></div><input type="hidden" name="securityLevel" value="internal"><input type="hidden" name="riskClass" value="moderate"><div class="form-actions"><p role="status">${escapeHtml(state.documents.createStatus)}</p><button class="button primary" type="submit">Create draft record</button></div></form>`;
}

function documentList() {
  return `<ul class="record-list">${state.documents.records.map(record => `<li><button class="record document-record" data-document-id="${escapeHtml(record.id)}"><span class="type">${escapeHtml(record.category)}</span><span class="identity"><b>${escapeHtml(record.title)}</b><small>${escapeHtml(record.document_id)} · v${escapeHtml(record.version)}</small></span><span class="owner">${escapeHtml(record.owner_role)}</span><span class="pill ${escapeHtml(record.status)}">${escapeHtml(record.status.replaceAll('_',' '))}</span><span aria-hidden="true">→</span></button></li>`).join('')}</ul>`;
}

function documentDetailPanel() {
  const record = state.documents.selected;
  const detail = state.documents.detail;
  return `<aside class="detail" role="dialog" aria-modal="false" aria-labelledby="detail-title" aria-describedby="detail-description" tabindex="-1"><button class="close" data-action="close-detail" aria-label="Close document details">×</button><p class="eyebrow">${escapeHtml(record.category)} · ${escapeHtml(record.document_id)}</p><h2 id="detail-title">${escapeHtml(record.title)}</h2><p id="detail-description">${escapeHtml(record.summary)}</p><dl><div><dt>Lifecycle</dt><dd>${escapeHtml(record.status.replaceAll('_',' '))}</dd></div><div><dt>Owner</dt><dd>${escapeHtml(record.owner_role)}</dd></div><div><dt>Version</dt><dd>${escapeHtml(record.version)}</dd></div><div><dt>Classification</dt><dd>${escapeHtml(record.security_level)}</dd></div><div><dt>Risk</dt><dd>${escapeHtml(record.risk_class)}</dd></div><div><dt>Verified</dt><dd>${formatDate(record.observed_at)}</dd></div></dl>${state.documents.detailLoading ? '<p role="status">Loading version and provenance evidence…</p>' : detail ? detailEvidence(detail) : '<p role="alert">Detailed evidence is unavailable.</p>'}</aside>`;
}

function detailEvidence(detail) {
  const primary = detail.ownerships.find(item => item.is_primary && !item.ended_at);
  return `<section class="evidence"><h3>Governance evidence</h3><p><b>Primary ownership:</b> ${escapeHtml(primary?.owner_role ?? 'Not recorded')}</p><h3>Version lineage</h3>${detail.versions.length ? `<ol>${detail.versions.map(version => `<li><b>v${escapeHtml(version.version_label)}</b> · ${escapeHtml(version.lifecycle_state)}${version.supersedes_version_id ? ' · supersedes prior version' : ''}<small>${escapeHtml(version.source_commit_sha.slice(0,12))}</small></li>`).join('')}</ol>` : '<p>No versions recorded.</p>'}<h3>System relationships</h3>${detail.relationships.length ? `<ul>${detail.relationships.map(item => `<li>${escapeHtml(item.relationship_type)} <b>${escapeHtml(item.system_registry_records?.canonical_id)}</b> — ${escapeHtml(item.system_registry_records?.display_name)}</li>`).join('')}</ul>` : '<p>No System Registry relationships.</p>'}<div class="provenance"><p class="eyebrow">PROVENANCE</p><code>${escapeHtml(recordPath(detail))}</code>${detail.provenance.map(item => `<small>${escapeHtml(item.source_type)} · ${escapeHtml(item.trust_state)} · ${escapeHtml(item.source_commit_sha?.slice(0,12))}</small>`).join('')}</div></section>`;
}

function recordPath(detail) {
  return detail.provenance[0]?.source_locator ?? state.documents.selected?.canonical_path ?? 'No canonical path';
}

function systemRegistryView(viewState) {
  return `<section class="registry-shell"><aside class="summary" aria-label="Registry summary"><p class="eyebrow">CURRENT INVENTORY</p><strong>${state.systems.summary.total}</strong><span>authorized records</span>${Object.entries(state.systems.summary.byType).map(([type,count]) => `<div class="metric"><span>${escapeHtml(type)}</span><b>${count}</b></div>`).join('')}</aside><section class="registry-panel" aria-labelledby="records-title"><div class="panel-heading"><div><p class="eyebrow">LIVE SUPABASE DATA</p><h2 id="records-title">System Registry</h2></div><button class="button ghost" data-action="refresh">Refresh</button></div><form id="system-filters" class="filters"><label>Type<select name="type">${optionList(['all','agent','tool','workflow','application','module','integration'],state.systems.filters.type)}</select></label><label>Status<select name="status">${optionList(['all','proposed','approved','active','paused','restricted','deprecated','retired'],state.systems.filters.status)}</select></label><label class="search">Search<input name="query" maxlength="80" value="${escapeHtml(state.systems.filters.query)}" placeholder="Name or canonical ID"></label><button class="button primary" type="submit">Apply</button></form><div class="state ${viewState.kind}" role="status" aria-live="polite">${state.loading ? 'Loading registry…' : escapeHtml(viewState.message)}</div>${isRenderableRegistryState(viewState.kind) ? systemList() : ''}</section>${state.systems.selected ? systemDetail(state.systems.selected) : ''}</section>`;
}

function systemList() {
  return `<ul class="record-list">${state.systems.records.map(record => `<li><button class="record" data-system-id="${escapeHtml(record.id)}"><span class="type">${escapeHtml(record.registry_type)}</span><span class="identity"><b>${escapeHtml(record.display_name)}</b><small>${escapeHtml(record.canonical_id)}</small></span><span class="owner">${escapeHtml(record.owner_role)}</span><span class="pill ${escapeHtml(record.lifecycle_status)}">${escapeHtml(record.lifecycle_status)}</span><span aria-hidden="true">→</span></button></li>`).join('')}</ul>`;
}

function systemDetail(record) {
  return `<aside class="detail" role="dialog" aria-modal="false" aria-labelledby="detail-title" tabindex="-1"><button class="close" data-action="close-detail" aria-label="Close record details">×</button><p class="eyebrow">${escapeHtml(record.registry_type)} · ${escapeHtml(record.canonical_id)}</p><h2 id="detail-title">${escapeHtml(record.display_name)}</h2><p>${escapeHtml(record.description)}</p><dl><div><dt>Status</dt><dd>${escapeHtml(record.lifecycle_status)}</dd></div><div><dt>Owner</dt><dd>${escapeHtml(record.owner_role)}</dd></div><div><dt>Risk</dt><dd>${escapeHtml(record.risk_class)}</dd></div><div><dt>Version</dt><dd>${escapeHtml(record.semantic_version)}</dd></div></dl><div class="provenance"><code>${escapeHtml(record.canonical_path)}</code><small>Commit ${escapeHtml(record.source_commit_sha.slice(0,12))}</small><small>Hash ${escapeHtml(record.content_hash.slice(0,16))}…</small></div></aside>`;
}

async function resolveWorkspace() {
  if (!systems || !state.session) return;
  const workspaces = await systems.accessibleWorkspaces();
  state.workspace = workspaces[0] ?? null;
  telemetry.emit('registry.workspace.resolved', { workspaceId: state.workspace?.id, recordCount: workspaces.length });
}

async function initializeAuthorizedSession(session) {
  state.session = session; state.workspace = null; state.error = null; state.systems.selected = null; state.documents.selected = null; render();
  if (!session) return;
  try { await resolveWorkspace(); await loadActiveView(); } catch (error) { state.error = error; telemetry.emit('registry.load.failed', { state: 'workspace-unavailable', requestId: crypto.randomUUID() }); render(); }
}

async function loadActiveView() {
  if (!state.workspace) return render();
  state.loading = true; state.error = null; render();
  const startedAt = performance.now(); const requestId = crypto.randomUUID();
  try {
    if (state.activeView === 'documents') {
      const result = await documents.list(state.documents.filters, state.workspace.id);
      state.documents.records = result.records; state.documents.summary = result.summary;
      telemetry.emit('documents.load.succeeded', { workspaceId: state.workspace.id, recordCount: result.records.length, durationMs: Math.round(performance.now() - startedAt), requestId });
    } else {
      const result = await systems.list(state.systems.filters, state.workspace.id);
      state.systems.records = result.records; state.systems.summary = result.summary;
      telemetry.emit('registry.load.succeeded', { workspaceId: state.workspace.id, recordCount: result.records.length, durationMs: Math.round(performance.now() - startedAt), requestId });
    }
  } catch (error) { state.error = error; telemetry.emit(state.activeView === 'documents' ? 'documents.load.failed' : 'registry.load.failed', { workspaceId: state.workspace.id, durationMs: Math.round(performance.now() - startedAt), state: 'unavailable', requestId }); }
  finally { state.loading = false; render(); }
}

async function openDocument(id) {
  state.documents.detailOriginId = id;
  state.documents.selected = state.documents.records.find(record => record.id === id);
  state.documents.detail = null; state.documents.detailLoading = true; render(); document.querySelector('[data-action="close-detail"]')?.focus();
  try { state.documents.detail = await documents.detail(id, state.workspace.id); telemetry.emit('documents.detail.succeeded', { workspaceId: state.workspace.id, recordCount: state.documents.detail.versions.length }); }
  catch { telemetry.emit('documents.detail.failed', { workspaceId: state.workspace.id, state: 'unavailable' }); }
  finally { state.documents.detailLoading = false; render(); }
}

function bindEvents() {
  document.querySelector('#sign-in-form')?.addEventListener('submit', async event => { event.preventDefault(); const status = event.currentTarget.querySelector('.form-status'); if (!supabase) return; status.textContent = 'Sending secure link…'; const email = new FormData(event.currentTarget).get('email'); const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }); status.textContent = error ? 'The sign-in link could not be sent.' : 'Check your email for the secure sign-in link.'; });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.activeView = button.dataset.view; state.error = null; loadActiveView(); }));
  document.querySelector('#document-filters')?.addEventListener('submit', event => { event.preventDefault(); state.documents.filters = Object.fromEntries(new FormData(event.currentTarget)); loadActiveView(); });
  document.querySelector('#system-filters')?.addEventListener('submit', event => { event.preventDefault(); state.systems.filters = Object.fromEntries(new FormData(event.currentTarget)); loadActiveView(); });
  document.querySelectorAll('[data-document-id]').forEach(button => button.addEventListener('click', () => openDocument(button.dataset.documentId)));
  document.querySelectorAll('[data-system-id]').forEach(button => button.addEventListener('click', () => { state.systems.selected = state.systems.records.find(record => record.id === button.dataset.systemId); render(); }));
  document.querySelector('[data-action="refresh"]')?.addEventListener('click', loadActiveView);
  document.querySelector('[data-action="show-create"]')?.addEventListener('click', () => { state.documents.showCreate = true; state.documents.createStatus = ''; render(); document.querySelector('#create-document input')?.focus(); });
  document.querySelector('[data-action="hide-create"]')?.addEventListener('click', () => { state.documents.showCreate = false; render(); });
  document.querySelector('#create-document')?.addEventListener('submit', createDocument);
  document.querySelector('[data-action="close-detail"]')?.addEventListener('click', closeDetail);
  document.querySelector('[data-action="sign-out"]')?.addEventListener('click', async () => { await supabase.auth.signOut(); });
}

async function createDocument(event) {
  event.preventDefault(); const form = event.currentTarget; const input = Object.fromEntries(new FormData(form));
  state.documents.createStatus = 'Creating governed record…'; render();
  try { const result = await documents.create(input, state.workspace.id); telemetry.emit('documents.create.succeeded', { workspaceId: state.workspace.id, state: result.documentId }); state.documents.showCreate = false; state.documents.createStatus = ''; await loadActiveView(); }
  catch (error) { state.documents.createStatus = error.message; telemetry.emit('documents.create.failed', { workspaceId: state.workspace.id, state: 'validation-or-write-failed' }); render(); }
}

function closeDetail() {
  const documentOriginId = state.documents.detailOriginId;
  const systemOriginId = state.systems.selected?.id;
  state.systems.selected = null;
  state.documents.selected = null;
  state.documents.detail = null;
  state.documents.detailOriginId = null;
  render();
  if (documentOriginId) document.querySelector(`[data-document-id="${CSS.escape(documentOriginId)}"]`)?.focus();
  else if (systemOriginId) document.querySelector(`[data-system-id="${CSS.escape(systemOriginId)}"]`)?.focus();
}

document.addEventListener('keydown', event => { if (event.key === 'Escape' && (state.systems.selected || state.documents.selected)) closeDetail(); });

async function start() {
  if (supabase) { const { data } = await supabase.auth.getSession(); state.session = data.session; supabase.auth.onAuthStateChange((_event, session) => { void initializeAuthorizedSession(session); }); }
  await initializeAuthorizedSession(state.session);
}

start();

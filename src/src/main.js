import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config.js';
import { createSystemRegistryService, deriveRegistryState } from './services/systemRegistryService.js';
import './styles.css';

const app = document.querySelector('#app');
const config = getSupabaseConfig();
const supabase = config.configured
  ? createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
const registry = supabase ? createSystemRegistryService(supabase) : null;

const state = {
  session: null,
  records: [],
  summary: { total: 0, byType: {} },
  loading: false,
  error: null,
  selected: null,
  filters: { type: 'all', status: 'all', query: '' }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Unknown';
}

function render() {
  const viewState = deriveRegistryState({
    records: state.records,
    error: state.error,
    configured: config.configured,
    authenticated: Boolean(state.session)
  });

  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="brand-mark">CO</span><span>Creator OS Foundry</span></div>
      <div class="environment"><span class="status-dot"></span> MVP Preview <span>v1.0</span></div>
    </header>
    <main id="registry-content">
      <section class="hero" aria-labelledby="page-title">
        <p class="eyebrow">COS-MVP-001 · SYSTEM REGISTRY</p>
        <div class="hero-row">
          <div><h1 id="page-title">The operating map of Creator OS.</h1><p>Inspect the agents, tools, workflows, and modules that make the Foundry run.</p></div>
          <div id="session-actions">${sessionControls()}</div>
        </div>
      </section>
      ${state.session ? registryView(viewState) : signInView(viewState)}
    </main>
    <footer><span>Creator OS Foundry</span><span>Read-only registry · Supabase RLS protected</span></footer>`;

  bindEvents();
}

function sessionControls() {
  if (!state.session) return '<span class="session-label">Secure workspace</span>';
  return `<div class="session"><span>${escapeHtml(state.session.user.email)}</span><button class="button ghost" data-action="sign-out">Sign out</button></div>`;
}

function signInView(viewState) {
  return `<section class="auth-card" aria-labelledby="signin-title">
    <div><p class="eyebrow">AUTHORIZED ACCESS</p><h2 id="signin-title">Enter the registry</h2><p>A passwordless sign-in link will be sent to your approved email address.</p></div>
    <form id="sign-in-form"><label for="email">Email address</label><div class="input-row"><input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><button class="button primary" type="submit">Send secure link</button></div><p class="form-status" role="status">${escapeHtml(viewState.message)}</p></form>
  </section>`;
}

function registryView(viewState) {
  return `<section class="registry-shell">
    <aside class="summary" aria-label="Registry summary"><p class="eyebrow">CURRENT INVENTORY</p><strong>${state.summary.total}</strong><span>authorized records</span>${Object.entries(state.summary.byType).map(([type,count]) => `<div class="metric"><span>${escapeHtml(type)}</span><b>${count}</b></div>`).join('')}</aside>
    <section class="registry-panel" aria-labelledby="records-title">
      <div class="panel-heading"><div><p class="eyebrow">LIVE SUPABASE DATA</p><h2 id="records-title">Registry records</h2></div><button class="button ghost" data-action="refresh" ${state.loading ? 'disabled' : ''}>Refresh</button></div>
      <form id="filters" class="filters"><label>Type<select name="type">${filterOptions(['all','agent','tool','workflow','application','module','integration'],state.filters.type)}</select></label><label>Status<select name="status">${filterOptions(['all','proposed','approved','active','paused','restricted','deprecated','retired'],state.filters.status)}</select></label><label class="search">Search<input name="query" maxlength="80" value="${escapeHtml(state.filters.query)}" placeholder="Name or canonical ID"></label><button class="button primary" type="submit">Apply</button></form>
      <div class="state ${viewState.kind}" role="status" aria-live="polite">${state.loading ? '<span class="spinner" aria-hidden="true"></span> Loading registry…' : escapeHtml(viewState.message)}</div>
      ${viewState.kind === 'success' ? recordList() : ''}
    </section>
    ${state.selected ? detailPanel(state.selected) : ''}
  </section>`;
}

function filterOptions(options, selected) {
  return options.map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value === 'all' ? 'All' : value[0].toUpperCase()+value.slice(1)}</option>`).join('');
}

function recordList() {
  return `<ul class="record-list">${state.records.map(record => `<li><button class="record" data-id="${escapeHtml(record.id)}"><span class="type">${escapeHtml(record.registry_type)}</span><span class="identity"><b>${escapeHtml(record.display_name)}</b><small>${escapeHtml(record.canonical_id)}</small></span><span class="owner">${escapeHtml(record.owner_role)}</span><span class="pill ${escapeHtml(record.lifecycle_status)}">${escapeHtml(record.lifecycle_status)}</span><span aria-hidden="true">→</span></button></li>`).join('')}</ul>`;
}

function detailPanel(record) {
  return `<aside class="detail" aria-labelledby="detail-title"><button class="close" data-action="close-detail" aria-label="Close record details">×</button><p class="eyebrow">${escapeHtml(record.registry_type)} · ${escapeHtml(record.canonical_id)}</p><h2 id="detail-title">${escapeHtml(record.display_name)}</h2><p>${escapeHtml(record.description)}</p><dl><div><dt>Status</dt><dd>${escapeHtml(record.lifecycle_status)}</dd></div><div><dt>Owner</dt><dd>${escapeHtml(record.owner_role)}</dd></div><div><dt>Risk</dt><dd>${escapeHtml(record.risk_class)}</dd></div><div><dt>Version</dt><dd>${escapeHtml(record.semantic_version)}</dd></div><div><dt>Observed</dt><dd>${formatDate(record.observed_at)}</dd></div><div><dt>Sync</dt><dd>${escapeHtml(record.sync_status)}</dd></div></dl><div class="provenance"><p class="eyebrow">PROVENANCE</p><code>${escapeHtml(record.canonical_path)}</code><small>Commit ${escapeHtml(record.source_commit_sha.slice(0,12))}</small><small>Hash ${escapeHtml(record.content_hash.slice(0,16))}…</small></div></aside>`;
}

async function loadRegistry() {
  if (!registry || !state.session) return;
  state.loading = true; state.error = null; render();
  try {
    const result = await registry.list(state.filters);
    state.records = result.records; state.summary = result.summary;
  } catch (error) {
    state.records = []; state.summary = { total: 0, byType: {} }; state.error = error;
  } finally { state.loading = false; render(); }
}

function bindEvents() {
  document.querySelector('#sign-in-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = event.currentTarget.querySelector('.form-status');
    if (!supabase) { status.textContent = 'Supabase configuration is required.'; return; }
    status.textContent = 'Sending secure link…';
    const email = new FormData(event.currentTarget).get('email');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    status.textContent = error ? 'The sign-in link could not be sent.' : 'Check your email for the secure sign-in link.';
  });
  document.querySelector('#filters')?.addEventListener('submit', event => { event.preventDefault(); state.filters = Object.fromEntries(new FormData(event.currentTarget)); loadRegistry(); });
  document.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => { state.selected = state.records.find(record => record.id === button.dataset.id); render(); }));
  document.querySelector('[data-action="close-detail"]')?.addEventListener('click', () => { state.selected = null; render(); document.querySelector('[data-id]')?.focus(); });
  document.querySelector('[data-action="refresh"]')?.addEventListener('click', loadRegistry);
  document.querySelector('[data-action="sign-out"]')?.addEventListener('click', async () => { await supabase.auth.signOut(); state.session=null;state.records=[];state.selected=null;render(); });
}

async function start() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    state.session = data.session;
    supabase.auth.onAuthStateChange((_event, session) => { state.session = session; state.records=[];state.selected=null;render();if(session)loadRegistry(); });
  }
  render();
  if (state.session) await loadRegistry();
}

start();
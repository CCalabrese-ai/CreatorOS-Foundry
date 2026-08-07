import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, main] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8')
]);

test('provides a bypass link to the named main region', () => {
  assert.match(html, /class="skip-link" href="#registry-content"/);
  assert.match(main, /<main id="registry-content">/);
});

test('uses one page heading and named navigation and registry regions', () => {
  assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
  assert.match(main, /<nav class="capability-nav" aria-label="MVP capabilities">/);
  assert.match(main, /aria-labelledby="records-title"/);
  assert.match(main, /aria-label="Documentation summary"/);
});

test('associates filters and creation fields with visible labels', () => {
  assert.match(main, /<label>Category<select name="category">/);
  assert.match(main, /<label>Lifecycle<select name="status">/);
  assert.match(main, /<label class="search">Search<input name="query"/);
  assert.match(main, /<label>Document ID<input name="documentId"/);
  assert.match(main, /<label class="wide">Summary<textarea name="summary"/);
});

test('announces registry, detail loading, creation, and failure status', () => {
  assert.match(main, /role="status" aria-live="polite"/);
  assert.match(main, /Loading version and provenance evidence/);
  assert.match(main, /Creating governed record/);
  assert.match(main, /role="alert">Detailed evidence is unavailable/);
});

test('implements keyboard-compatible controls and explicit detail focus handling', () => {
  assert.match(main, /<button class="record document-record"/);
  assert.match(main, /document\.querySelector\('\[data-action="close-detail"\]'\)\?\.focus\(\)/);
  assert.match(main, /event\.key === 'Escape'/);
  assert.match(main, /data-action="close-detail" aria-label="Close document details"/);
  assert.match(main, /state\.documents\.detailOriginId = id/);
  assert.match(main, /data-document-id=.*CSS\.escape\(documentOriginId\)/s);
});

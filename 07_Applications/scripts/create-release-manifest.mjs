import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const releaseId = 'COS-MVP-001-v1.0.0';
const sourceInputs = [
  'index.html',
  'package.json',
  'package-lock.json',
  'src/config.js',
  'src/main.js',
  'src/services/observability.js',
  'src/services/systemRegistryService.js',
  'src/styles.css',
  'supabase/migrations/20260807032902_cos_mvp_001_production_readiness_v1.sql',
  'supabase/migrations/20260807033758_restrict_rls_auto_enable_execution_v1.sql',
  'test/systemRegistryService.test.js'
];

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function hashFile(relativePath) {
  const bytes = await readFile(path.join(root, relativePath));
  return { path: relativePath, bytes: bytes.length, sha256: digest(bytes) };
}

async function walk(directory, prefix = directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(relativePath, relativePath));
    else files.push(relativePath);
  }
  return files.sort();
}

const sourceFiles = await Promise.all(sourceInputs.map(hashFile));
const buildFiles = await Promise.all((await walk('dist')).map(hashFile));
const sourceDigest = digest(sourceFiles.map(file => `${file.path}:${file.sha256}`).join('\n'));
const buildDigest = digest(buildFiles.map(file => `${file.path}:${file.sha256}`).join('\n'));
const sourceBaseCommit = process.env.RELEASE_SOURCE_BASE
  || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();

const manifest = {
  schemaVersion: 1,
  releaseId,
  applicationId: 'COS-MVP-001',
  semanticVersion: '1.0.0',
  sourceBaseCommit,
  sourceDigest,
  buildDigest,
  migrationVersions: ['20260807032902', '20260807033758'],
  runtime: { node: '24', minimumNode: '20.19.0' },
  sourceFiles,
  buildFiles
};

await mkdir(path.join(root, '07_Applications', 'release'), { recursive: true });
await writeFile(path.join(root, '07_Applications', 'release', `${releaseId}-manifest.json`), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${releaseId} manifest created: ${buildDigest}`);

#!/usr/bin/env node
// PostToolUse: raske sjekker på filen som nettopp ble endret.
// server/: dotnet format --verify-no-changes. app/: tsc --noEmit + ESLint.
// Markerer også hvilket område som er endret, slik at Stop-hooken vet hvilke tester som skal kjøres.
// Exit 2 = feilen vises til Claude, som må rette den.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { relative, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const input = JSON.parse(readFileSync(0, 'utf8'));
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const rel = relative(root, file).split('\\').join('/');
const area = rel.startsWith('server/') ? 'server' : rel.startsWith('app/') ? 'app' : null;
if (!area) process.exit(0);

const stateDir = join(root, '.claude', '.state');
mkdirSync(stateDir, { recursive: true });
writeFileSync(join(stateDir, `endret-${area}`), new Date().toISOString());

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 120_000 });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

const failures = [];
if (area === 'server' && /\.(cs|csproj|props|editorconfig)$/.test(rel)) {
  const target = rel.replace(/^server\//, '');
  const r = run('dotnet', ['format', 'Vasko.slnx', '--verify-no-changes', '--include', target], join(root, 'server'));
  if (!r.ok) failures.push(`dotnet format --verify-no-changes feilet (kjør \`dotnet format\` i server/):\n${r.out}`);
}
if (area === 'app' && /\.(ts|tsx|js|jsx|json)$/.test(rel)) {
  const appDir = join(root, 'app');
  const tsc = run('npx', ['--no-install', 'tsc', '--noEmit'], appDir);
  if (!tsc.ok) failures.push(`tsc --noEmit feilet:\n${tsc.out}`);
  if (/\.(ts|tsx|js|jsx)$/.test(rel)) {
    const lint = run('npx', ['--no-install', 'eslint', '--max-warnings', '0', rel.replace(/^app\//, '')], appDir);
    if (!lint.ok) failures.push(`ESLint feilet:\n${lint.out}`);
  }
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n\n').slice(0, 8000)}\n`);
  process.exit(2);
}
process.exit(0);

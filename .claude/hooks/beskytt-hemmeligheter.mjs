#!/usr/bin/env node
// PreToolUse: stopper lesing/skriving av .env-filer og innhold som ligner hemmeligheter.
// Exit 2 = blokker verktøykallet; stderr vises til Claude.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

const ENV_FILE = /^\.env(\..+)?$/;
const ENV_TOKEN = /(?<![\w.])\.env(?:\.[\w.-]+)?(?![\w])/g;
const ALLOWED_ENV = new Set(['.env.example']);

const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'privat nøkkel'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS-nøkkel'],
  [/\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/, 'GitHub-token'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack-token'],
  [/\bsk-(?:ant-)?[A-Za-z0-9_-]{32,}/, 'API-nøkkel (sk-)'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API-nøkkel'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JWT'],
  [/(?:Password|Pwd)=(?!;|\s|"|$)[^;\s"']{6,}/i, 'passord i connection string'],
  [/(?:secret|password|passord|api[_-]?key|client[_-]?secret|subscription[_-]?key|token|nokkel|nøkkel)["']?\s*[:=]\s*["'][A-Za-z0-9/+_\-=]{16,}["']/i, 'hardkodet hemmelighet'],
  [/^\s*[A-Z0-9_]*(?:SECRET|PASSWORD|PASSORD|TOKEN|API_KEY|NOKKEL)[A-Z0-9_]*\s*=\s*(?!\$)\S{8,}/m, 'hemmelighet i env-format'],
];
const PLACEHOLDER = /example|eksempel|dummy|fake|falsk|placeholder|changeme|test|xxxx|<[^>]+>/i;

function block(reason) {
  process.stderr.write(
    `Blokkert av .claude/hooks/beskytt-hemmeligheter.mjs: ${reason}\n` +
      'Hemmeligheter skal ligge i miljøvariabler (lokalt .env, i prod Scaleway Secret Manager). Se docs/sikkerhet.md.\n',
  );
  process.exit(2);
}

function checkEnvPath(path) {
  if (!path) return;
  const name = basename(path);
  if (ENV_FILE.test(name) && !ALLOWED_ENV.has(name)) block(`tilgang til ${name} er ikke tillatt`);
}

function scanSecrets(text, where) {
  if (!text) return;
  for (const [pattern, label] of SECRET_PATTERNS) {
    const match = text.match(pattern);
    if (match && !PLACEHOLDER.test(match[0])) block(`${label} funnet i ${where}`);
  }
}

switch (tool) {
  case 'Read':
  case 'NotebookEdit':
    checkEnvPath(ti.file_path ?? ti.notebook_path);
    scanSecrets(ti.new_source, 'notebook');
    break;
  case 'Write':
    checkEnvPath(ti.file_path);
    scanSecrets(ti.content, ti.file_path);
    break;
  case 'Edit':
    checkEnvPath(ti.file_path);
    scanSecrets(ti.new_string, ti.file_path);
    break;
  case 'MultiEdit':
    checkEnvPath(ti.file_path);
    for (const e of ti.edits ?? []) scanSecrets(e.new_string, ti.file_path);
    break;
  case 'Bash': {
    const cmd = ti.command ?? '';
    for (const token of cmd.match(ENV_TOKEN) ?? []) {
      if (!ALLOWED_ENV.has(token)) block(`kommandoen berører ${token}`);
    }
    scanSecrets(cmd, 'Bash-kommandoen');
    break;
  }
}
process.exit(0);

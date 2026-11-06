#!/usr/bin/env node
// Stop: kjører dotnet test / Jest én gang når Claude er ferdig, kun for områder som er endret.
// Feiler testene, blokkeres stopp én gang slik at Claude retter feilen.
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const input = JSON.parse(readFileSync(0, 'utf8'));
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const stateDir = join(root, '.claude', '.state');

const suites = [
  { area: 'server', cmd: 'dotnet', args: ['test', 'Vasko.slnx', '--nologo', '-v', 'q'], cwd: join(root, 'server') },
  { area: 'app', cmd: 'npm', args: ['test', '--', '--ci', '--silent'], cwd: join(root, 'app') },
];

const failures = [];
for (const s of suites) {
  const marker = join(stateDir, `endret-${s.area}`);
  if (!existsSync(marker)) continue;
  const r = spawnSync(s.cmd, s.args, { cwd: s.cwd, encoding: 'utf8', timeout: 300_000 });
  if (r.status === 0) rmSync(marker);
  else failures.push(`${s.area}: \`${s.cmd} ${s.args.join(' ')}\` feilet:\n${`${r.stdout ?? ''}${r.stderr ?? ''}`.trim().slice(-4000)}`);
}

if (!failures.length) process.exit(0);

const reason = `Testene feiler. Rett feilene før du avslutter.\n\n${failures.join('\n\n')}`;
if (input.stop_hook_active) {
  // Har allerede blokkert én gang. Ikke gå i løkke; varsle brukeren i stedet.
  console.log(JSON.stringify({ systemMessage: `⚠️ Testene feiler fortsatt (${failures.length} område). Kjør dotnet test / npm test manuelt.` }));
} else {
  console.log(JSON.stringify({ decision: 'block', reason }));
}
process.exit(0);

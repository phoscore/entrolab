import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--working-tree')) throw new Error('Unbekannte Option');
const local = args.includes('--working-tree');
const baseline = readFileSync(new URL('../docs/v0.1-original-commit.txt', import.meta.url), 'utf8').trim();
if (!/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Invalid baseline commit');
const lines = readFileSync(new URL('../docs/v0.1-original.sha256', import.meta.url), 'utf8').trim().split('\n');
if (lines.length !== 6) throw new Error('Genau sechs Originaldateien erwartet');
for (const line of lines) {
  const match = /^([a-f0-9]{64})  ([\w./-]+)$/.exec(line);
  if (!match) throw new Error('Ungültiger Prüfsummeneintrag');
  const [, expected, path] = match;
  const data = local ? readFileSync(new URL('../' + path, import.meta.url)) : execFileSync('git', ['show', baseline + ':' + path], { cwd: root });
  const actual = createHash('sha256').update(data).digest('hex');
  if (actual !== expected) throw new Error(`Originalintegrität verletzt: ${path}`);
  console.log(`PASS ${local ? 'Arbeitskopie' : 'Original-Commit'} ${path}`);
}

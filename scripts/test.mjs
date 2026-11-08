import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checks } from '../dist/checks.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const file of ['dist/extreme-data.mjs', 'dist/extreme-render.mjs', 'dist/extreme-ui.mjs', 'tests/extreme.test.mjs', 'tests/extreme-lifecycle.test.mjs', 'tests/extreme-render.test.mjs', 'dist/physics.mjs', 'dist/app.mjs', 'dist/checks.mjs', 'dist/display.mjs', 'dist/experiments.mjs', 'dist/instruments.mjs', 'dist/prediction.mjs', 'tests/edge-regression.test.mjs', 'tests/experiments.test.mjs', 'scripts/benchmark-v0.3.mjs', 'tests/numerics.mjs', 'tests/quality.test.mjs', 'tests/kepler.test.mjs', 'tests/kepler-reference.mjs', 'tests/independent_kepler_review.mjs', 'tests/collision-review.mjs', 'tests/collision-review.test.mjs', 'scripts/review-diagnostics.mjs', 'scripts/benchmark.mjs', 'scripts/test.mjs', 'scripts/verify-original.mjs']) {
  const run = spawnSync(process.execPath, ['--check', file], { cwd: root, stdio: 'inherit' });
  if (run.error || run.status !== 0) throw run.error ?? new Error(`Syntaxprüfung fehlgeschlagen: ${file}`);
}
const results = checks();
if (!Array.isArray(results) || results.length !== 10) throw new Error('Zehn Originaltests erwartet. Bei bewusst erweiterter Suite CI-Einstieg mitprüfen.');
for (const result of results) console.log(`${result.ok === true ? 'PASS' : 'FAIL'} ${result.name}`);
if (results.some(result => result.ok !== true)) process.exitCode = 1;


const quality = spawnSync(process.execPath, ['--test', 'tests/extreme-render.test.mjs', 'tests/extreme.test.mjs', 'tests/extreme-lifecycle.test.mjs', 'tests/edge-regression.test.mjs', 'tests/experiments.test.mjs', 'tests/quality.test.mjs', 'tests/kepler.test.mjs', 'tests/collision-review.test.mjs'], { cwd: root, stdio: 'inherit' });
if (quality.error || quality.status !== 0) process.exitCode = 1;



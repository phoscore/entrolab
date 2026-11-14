import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {importNasa, readCsv} from '../cosmic-explorer/import.mjs';
import {buildSample, sampleDir, sha256, writeSample} from '../cosmic-explorer/pipeline.mjs';
import {requireData} from '../cosmic-explorer/schema.mjs';

const [command, ...args] = process.argv.slice(2);
if (command === 'build' && args.length === 1) {
  const sample = await buildSample();
  const expected = await readFile(join(sampleDir, 'manifest.json'));
  requireData(expected.equals(sample.files.get('manifest.json')), 'Sample differs from the checked-in release manifest');
  console.log(await writeSample(args[0], sample));
} else if (command === 'verify' && args.length === 0) {
  const sample = await buildSample();
  requireData((await readFile(join(sampleDir, 'manifest.json'))).equals(sample.files.get('manifest.json')), 'Sample manifest mismatch');
  console.log(JSON.stringify(sample.manifest.counts));
} else if (command === 'nasa-local' && args.length === 4) {
  const [psPath, compositePath, snapshot, output] = args;
  requireData(/^\d{4}-\d{2}-\d{2}$/.test(snapshot), 'Snapshot must be YYYY-MM-DD');
  const [ps, composite] = await Promise.all([readFile(psPath), readFile(compositePath)]);
  requireData(ps.length <= 256 * 1024 && composite.length <= 256 * 1024, 'NASA sample exceeds byte budget');
  const psRows = readCsv(ps.toString('utf8')), compositeRows = readCsv(composite.toString('utf8'));
  requireData(psRows.length > 0 && psRows.length <= 16 && compositeRows.length > 0 && compositeRows.length <= 3, 'NASA sample exceeds row budget');
  const result = importNasa(psRows, compositeRows, snapshot);
  result.inputs = [{table: 'ps', rows: psRows.length, sha256: sha256(ps)}, {table: 'pscomppars', rows: compositeRows.length, sha256: sha256(composite)}];
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, {flag: 'wx'});
  console.log(JSON.stringify({objects: result.objects.length, inputs: result.inputs, distribution: result.distribution}));
} else {
  throw new Error('Use build <output-root>, verify, or nasa-local <ps.csv> <pscomppars.csv> <YYYY-MM-DD> <new-output.json>');
}

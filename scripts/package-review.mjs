// Private downloadable source/preview; no publishing or deployment.
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('browser-results',{recursive:true});
const target=resolve('browser-results/entrolab-v085-source.zip');
execFileSync('git',['archive','--format=zip','--prefix=entrolab-v085/','--output='+target,'HEAD']);
await writeFile('browser-results/preview-instructions.txt','Private review copy. Unzip, cd entrolab-v085, then python -m http.server 8000 --bind 127.0.0.1 --directory dist. On Windows use py if needed. Open http://localhost:8000. No installation needed for the app. Historical Git checks require a full clone; no merge/deployment permission is implied.\n');
console.log('Created private source/preview archive; no deployment.');

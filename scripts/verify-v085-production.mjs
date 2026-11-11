// GET only, fixed existing production URLs; no deployment or credentials.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const base='25e72c639d66677c1629886141e3671a4c696ef6',hash=b=>createHash('sha256').update(b).digest('hex');
const entries=[];
for(const host of ['https://entrolab.pages.dev','https://cddbdb79.entrolab.pages.dev'])for(const path of ['index.html','knowledge-ui.mjs','knowledge-text.mjs','creature-ui.mjs']){
 const expected=hash(execFileSync('git',['show',base+':dist/'+path]));
 try{const r=await fetch(host+'/'+(path==='index.html'?'':path),{signal:AbortSignal.timeout(20000)});const actual=hash(Buffer.from(await r.arrayBuffer()));entries.push({host,path,status:r.status,expected,actual,matches:r.status===200&&actual===expected})}
 catch(e){entries.push({host,path,expected,error:String(e.message),matches:false})}
}
await mkdir('browser-results',{recursive:true});await writeFile('browser-results/v085-production.json',JSON.stringify({base,method:'GET only, unauthenticated existing production endpoints',entries},null,2));console.log(JSON.stringify(entries));

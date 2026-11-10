// Bounded, read-only inspection of the ALREADY EXISTING preview. Never deploys.
import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const origin='https://567f7dd7.entrolab.pages.dev';
const branchOrigin='https://feature-v0-8-learning-founda.entrolab.pages.dev';
const hash=b=>createHash('sha256').update(b).digest('hex');
const detectors=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['aws-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['api-secret',/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/]];
const matches=s=>detectors.filter(([,r])=>r.test(s)).map(([name])=>name);
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
const files=await walk('dist'),findings=[],runtime=[];
for(const path of files){
 if(/(?:^|\/)(?:\.git|\.env(?:\..*)?|AGENTS\.md|package(?:-lock)?\.json|wrangler\.[^/]+)$|\.(?:zip|bak|sql|map|tar|gz)$/i.test(path))findings.push({kind:'unexpected-published-file',path});
 if(/\.(?:mjs|js|html|css|json|svg)$/.test(path)){
  const s=await readFile(path,'utf8');for(const kind of matches(s))findings.push({kind,path});
  if(/\.(?:mjs|js)$/.test(path))runtime.push({path,networkWriteOrBackendCandidate:/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(|node:(?:http|https|fs)|createServer\s*\(/.test(s)});
 }
}
const tracked=execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{encoding:'utf8'}).trim().split('\n');
const serverEntries=tracked.filter(p=>/^(?:functions\/|(?:dist\/)?_worker\.js$|wrangler\.(?:toml|jsonc?)$)/.test(p));
if(serverEntries.length)findings.push({kind:'server-entry-needs-review',paths:serverEntries});
if(runtime.some(x=>x.networkWriteOrBackendCandidate))findings.push({kind:'runtime-network-candidate-needs-review',paths:runtime.filter(x=>x.networkWriteOrBackendCandidate).map(x=>x.path)});

async function get(url,method='GET'){
 try{const r=await fetch(url,{method,redirect:'manual',signal:AbortSignal.timeout(12000)}),b=Buffer.from(await r.arrayBuffer());return {url,method,status:r.status,type:r.headers.get('content-type'),allow:r.headers.get('allow'),location:r.headers.get('location'),bytes:b.length,sha256:hash(b),secrets:matches(b.toString('utf8')),body:b.toString('utf8')}}
 catch(e){return {url,method,error:e.message}}
}
const root=await get(origin+'/'),requests=[];
const sensitive=['/AGENTS.md','/README.md','/.git/config','/.git/HEAD','/.env','/.openai/hosting.json','/docs/Qualitaetsupdate_v0.8.md','/package-lock.json','/scripts/package-review.mjs','/backup.zip','/_worker.js','/wrangler.toml','/api','/api/deploy','/api/repository','/admin'];
const paths=[...files.map(p=>'/'+p.slice(5)),...sensitive];
// Fixed four requests at a time; no discovery, login, POST/PUT/PATCH/DELETE.
for(let i=0;i<paths.length;i+=4)for(const r of await Promise.all(paths.slice(i,i+4).map(p=>get(origin+p))))requests.push(r);
requests.push(await get(branchOrigin+'/'),await get(branchOrigin+'/knowledge-ui.mjs'),await get(origin+'/','OPTIONS'),await get(origin+'/api/deploy','OPTIONS'));
// The HTML is unchanged by this correction. Check a file that actually differs
// between reviewed and corrected source, on BOTH existing URLs, as well.
const expectedBindingSha256=hash(execFileSync('git',['show','d4b6bd1b2e6bd0e136b36a555b7df16d3cbe1d9d:dist/knowledge-ui.mjs']));
const previewIdentity=requests.filter(r=>r.url?.endsWith('/knowledge-ui.mjs')).map(r=>({url:r.url,status:r.status,sha256:r.sha256,matchesReviewed:r.status===200&&r.sha256===expectedBindingSha256}));
if(previewIdentity.length!==2||previewIdentity.some(x=>!x.matchesReviewed))findings.push({kind:'existing-preview-version-changed-needs-review',previewIdentity});
for(const r of [root,...requests]){
 if(r.secrets?.length)findings.push({kind:'remote-secret-pattern',url:r.url,detectors:r.secrets});
 if(r.method==='GET'&&sensitive.includes(r.url?.slice(origin.length))&&r.status===200&&r.sha256!==root.sha256)findings.push({kind:'unexpected-non-SPA-response',url:r.url,status:r.status,type:r.type});
 r.sameAsRoot=r.sha256===root.sha256;delete r.body;
}
const report={date:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),origin,branchOrigin,expectedBindingSha256,previewIdentity,scope:'Current local dist + read-only GET/OPTIONS of existing d4b6 preview. No mutations, auth probing or deployment. No access to provider dashboard, secrets vault, other apps or account-wide routes.',files:files.length,runtime,serverEntries,root,requests,findings,limitations:'Pattern scan is not proof that all secrets are absent. Repository/server administration and provider-side workers/routes cannot be exhaustively certified without account access. OPTIONS is informational, not proof that every write method is rejected.'};
await mkdir('browser-results',{recursive:true});await writeFile('browser-results/v08-preview-security.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({origin,rootStatus:root.status,files:files.length,requests:requests.length,findings},null,2));
if(root.status!==200||requests.some(r=>r.error)||findings.length)process.exitCode=1;

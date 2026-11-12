// GET-only evidence for the existing production domain.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const base='ec2c4f1a5957478ab255f286a0ca2a9341cabcbe';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const host='https://entrolab.pages.dev';
const entries=[];
for(const path of ['index.html','blackhole-view.mjs','physics.mjs','creature-ui.mjs']){
 const expected=hash(execFileSync('git',['show',base+':dist/'+path]));
 try{
  const response=await fetch(host+'/'+(path==='index.html'?'':path),{signal:AbortSignal.timeout(14000)});
  const actual=hash(Buffer.from(await response.arrayBuffer()));
  entries.push({path,status:response.status,expected,actual,matches:response.ok&&actual===expected});
 }catch(error){entries.push({path,expected,error:String(error.message),matches:false})}
}
await mkdir('browser-results',{recursive:true});
const report={base,host,entries};
await writeFile('browser-results/v09-production.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));

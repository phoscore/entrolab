import {routeLegacyTour} from './legacy-tour-fixture.mjs';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
export async function browserHarness(){
 const root=fileURLToPath(new URL('../dist/',import.meta.url));
 const output=fileURLToPath(new URL('../browser-results/',import.meta.url));await mkdir(output,{recursive:true});
 const errors=[],measurements=[];
 const server=createServer(async(req,res)=>{try{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/__fractional'){res.writeHead(200,{'Content-Type':'text/html'}).end('<style>body{margin:0}iframe{border:0;width:320.5px;height:900px}</style><iframe src="/"></iframe>');return}
  const path=resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
  if(!path.startsWith(resolve(root)+'/')){res.writeHead(403).end();return}
  res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(path));
 }catch{res.writeHead(404).end()}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
 async function ready(p){await p.waitForFunction(()=>window.entrolabKnowledge&&window.entrolabEntropy&&window.entrolabThermal&&window.entrolab&&document.getElementById('checkRunStatus')?.dataset.run==='1');await p.evaluate(()=>document.fonts.ready)}
 async function lab({legacyTour=false,...options}={}){
  const context=await browser.newContext({locale:'de-DE',viewport:{width:1360,height:1000},reducedMotion:'reduce',...options});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  await context.addInitScript(()=>{const original=Math.random;window.__presentationRngCalls=0;Math.random=(...a)=>{window.__presentationRngCalls++;return original(...a)}});
  if(legacyTour)await routeLegacyTour(context);
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url+(legacyTour?"/?legacyTour=1":""));await ready(p);
  if(!(await p.evaluate(()=>window.entrolab.inspect().paused)))await p.locator('#play').click();
  return {p,context};
 }
 return {browser,url,output,errors,measurements,ready,lab,async close(){await browser.close();await new Promise(done=>server.close(done))}};
}
export const physical=p=>p.evaluate(()=>{const {bodies,selected,paused,elapsed,collisions}=window.entrolab.inspect();return {gravity:{bodies,selected,paused,elapsed,collisions},entropy:window.entrolabEntropy.inspect(),thermal:window.entrolabThermal.inspect(),rng:window.__presentationRngCalls}});

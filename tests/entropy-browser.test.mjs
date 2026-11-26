import {chooseLab} from './browser-lab-navigation.mjs';
// Additional real Chromium cases; the seven v0.5 browser regressions are retained verbatim.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url)),output=fileURLToPath(new URL('../browser-results/',import.meta.url));
let server,browser,url;const errors=[],measurements=[];
before(async()=>{
 await mkdir(output,{recursive:true});server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/__fractional'){res.writeHead(200,{'Content-Type':'text/html'}).end('<style>body{margin:0}iframe{border:0;width:320.5px;height:900px}</style><iframe src="/"></iframe>');return}const path=resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));if(!path.startsWith(root)){res.writeHead(403).end();return}res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(path))}catch{res.writeHead(404).end()}});await new Promise(done=>server.listen(0,'127.0.0.1',done));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});console.log('v0.6 Chromium',browser.version());
});
after(async()=>{await writeFile(resolve(output,'v06-measurements.json'),JSON.stringify({measurements,errors},null,2));await browser?.close();if(server)await new Promise(done=>server.close(done))});
async function lab(options={}){const context=await browser.newContext({locale:'de-DE',viewport:{width:1360,height:1000},reducedMotion:'reduce',...options});await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await ready(page);return {page,context}}
async function ready(p){await p.waitForFunction(()=>window.entrolabEntropy&&window.entrolab&&document.querySelector('#checkRunStatus')?.dataset.run==='1');await p.evaluate(()=>document.fonts.ready)}
const state=p=>p.evaluate(()=>window.entrolabEntropy.inspect());
const wait=p=>p.waitForTimeout(1100); // Observe two genuine 500ms timer intervals, not a fake progress delay.
async function entropy(p){await chooseLab(p,'entropy');await p.locator('#entropyChambers').scrollIntoViewIfNeeded()}
async function k(p,value){await p.locator('#entropyK').press('Home');for(let i=0;i<value;i++)await p.locator('#entropyK').press('ArrowRight')}

test('v0.6 browser: exact entropy readouts, distinguishable microstates, bounded markers and reset',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);assert.equal((await state(p)).k,12);assert.equal(await p.locator('#entropyTotal').textContent(),'4.096');await k(p,6);assert.equal(await p.locator('#entropyOmega').textContent(),'924');assert.match(await p.locator('#entropyProbability').textContent(),/22,559/);await p.locator('.entropy-micro summary').click();const before=await state(p);await p.locator('#entropyResample').click();assert.equal((await state(p)).k,6);assert.equal(await p.locator('#entropyMicrostate').textContent().then(s=>s.split(' ').length),12);assert.equal((await state(p)).steps,before.steps);await p.locator('#entropyN').fill('32');assert.equal((await state(p)).n,32);assert.equal(await p.locator('.entropy-marker').count(),32);await p.locator('#entropyChambers').scrollIntoViewIfNeeded();const outside=await p.locator('.entropy-marker').evaluateAll(ms=>{const b=document.querySelector('#entropyChambers').getBoundingClientRect();return ms.filter(m=>{const r=m.getBoundingClientRect();return r.left<b.left||r.right>b.right||r.bottom>b.bottom||r.top<b.top}).length});assert.equal(outside,0);await p.locator('#entropyStep').click();assert.equal((await state(p)).steps,1);await p.locator('#entropyReset').click();assert.equal((await state(p)).k,32);assert.equal((await state(p)).steps,0)}finally{await context.close()}
});

test('v0.6 browser: DE/EN during playback preserves state; invalid drafts, validity and focus remain coherent',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);await p.locator('#entropyPlay').click();await p.waitForFunction(()=>window.entrolabEntropy.inspect().steps>=1);const before=await state(p);await p.locator('[data-language=en]').click();const after=await state(p);assert.equal(after.n,before.n);assert.equal(after.playing,true);assert(after.steps>=before.steps);assert.match(await p.locator('#entropyStatus').textContent(),/Mixing|Hidden/);await p.locator('#entropyPlay').click();await p.locator('#entropyN').fill('513');await p.locator('#entropyN').focus();const invalidBefore=await state(p);await p.evaluate(async()=>{const {setLanguage}=await import('/i18n.mjs');setLanguage('de')});assert.deepEqual(await state(p),invalidBefore);assert.equal(await p.locator('#entropyN').inputValue(),'513');assert.equal(await p.evaluate(()=>document.activeElement.id),'entropyN');const msg=await p.locator('#entropyN').evaluate(e=>e.validationMessage);assert.equal(msg,await p.locator('#entropyError').textContent());assert.match(msg,/ganze Zahl/);await p.locator('[data-language=en]').click();assert.match(await p.locator('#entropyN').evaluate(e=>e.validationMessage),/integer/);assert.equal(await p.evaluate(()=>document.activeElement.id),'entropyN');assert.equal(await p.title(),'Reincarnated as a Proton');await p.locator('#entropyReset').click();assert.equal(await p.locator('#entropyError').textContent(),'')}finally{await context.close()}
});

test('v0.6 browser: real tab navigation and offscreen scrolling stop entropy ticks without catch-up',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);await p.locator('#entropyPlay').click();await p.waitForFunction(()=>window.entrolabEntropy.inspect().steps>=1);await chooseLab(p,'blackhole');await p.waitForFunction(()=>!window.entrolabEntropy.inspect().scheduled);const hidden=await state(p);await wait(p);assert.deepEqual(await state(p),hidden);await entropy(p);await p.waitForFunction(()=>window.entrolabEntropy.inspect().scheduled);await p.locator('#entropy .entropy-explanations details summary').click();await p.locator('footer').scrollIntoViewIfNeeded();const chamberBounds=await p.locator('#entropyChambers').boundingBox();assert(chamberBounds.y+chamberBounds.height<=0,'the complete chamber is actually outside the viewport');await p.waitForFunction(()=>!window.entrolabEntropy.inspect().scheduled);const offscreen=await state(p);await wait(p);assert.deepEqual(await state(p),offscreen);await p.locator('#entropyChambers').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabEntropy.inspect().scheduled);assert((await state(p)).steps<=offscreen.steps+1);await p.locator('#entropyPlay').click();assert.equal((await state(p)).scheduled,false)}finally{await context.close()}
});

test('v0.6 browser: glossary context and keyboard return preserve lab state and original sandbox drafts',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);await k(p,6);const before=await state(p);const link=p.locator('#entropy [data-explain]');await link.focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'guide-entropy');await p.locator('#physicsGuide [data-i18n="Advanced · Fluktuationen"]').click();await p.locator('[data-language=en]').click();await p.locator('#guideReturn').focus();await p.keyboard.press('Enter');assert.equal(await link.evaluate(e=>e===document.activeElement),true);assert.deepEqual(await state(p),before);await chooseLab(p,'gravity');await p.locator('.edit-options summary').click();await p.locator('#velX').fill('42.7500');const model=await p.evaluate(()=>window.entrolab.inspect());await p.locator('#gravity [data-explain=guide-universe]').click();await p.keyboard.press('Escape');assert.equal(await p.locator('#velX').inputValue(),'42.7500');assert.deepEqual(await p.evaluate(()=>window.entrolab.inspect()),model);assert.equal(await p.evaluate(()=>document.activeElement.dataset.explain),'guide-universe')}finally{await context.close()}
});

test('v0.6 browser: each button press really reloads isolated checks, updates live status and preserves IDs/forecast',async()=>{
 const {page:p,context}=await lab();try{
  // Exercise the same run entry point with an actual completed forecast still present.
  await p.locator('.instrument-controls summary').click();await p.locator('#predictionOn').check();await p.waitForFunction(()=>window.entrolab.inspect().forecast);const result=await p.evaluate(async()=>{const {body}=await import('/physics.mjs');const a=body('sentinel','planet',1,0,0,0,0,'white'),before=window.entrolab.inspect();await window.entrolab.checks();const after=window.entrolab.inspect(),b=body('sentinel','planet',1,0,0,0,0,'white');return {before,after,ids:[a.id,b.id]}});assert.deepEqual(result.after,result.before);assert.equal(result.ids[1],result.ids[0]+1);
  await chooseLab(p,'science');let requests=0;await context.route('**/checks-worker.mjs',r=>{requests++;return r.continue()});const before=await p.evaluate(()=>window.entrolab.inspect());for(const run of [3,4]){await p.locator('#runTests').click();await p.waitForFunction(run=>document.getElementById('checkRunStatus').dataset.run===String(run)&&document.getElementById('checkRunStatus').getAttribute('aria-busy')==='false',run);assert.match(await p.locator('#checkRunStatus').textContent(),new RegExp('#'+run+'.*10/10'));assert.equal(await p.locator('#testResults span').count(),10);assert.equal(await p.evaluate(()=>document.activeElement.id),'runTests')}assert.equal(requests,2);assert.deepEqual(await p.evaluate(()=>window.entrolab.inspect()),before);assert.equal(await p.locator('#checkRunStatus').getAttribute('role'),'status');assert.equal(await p.locator('#checkRunStatus').getAttribute('aria-live'),'polite');await p.locator('[data-language=en]').click();assert.match(await p.locator('#checkRunStatus').textContent(),/Check run #4 complete/);assert.equal(requests,2);
 }finally{await context.close()}
});

test('v0.6 browser: blocked worker yields an honest translated failure and a real retry recovers',async()=>{
 const {page:p,context}=await lab();try{await chooseLab(p,'science');await context.route('**/checks-worker.mjs',r=>r.fulfill({contentType:'text/javascript',body:'self.onmessage=()=>self.postMessage({error:true})'}));await p.locator('#runTests').click();await p.waitForFunction(()=>document.getElementById('checkRunStatus').dataset.run==='2');assert.match(await p.locator('#checkRunStatus').textContent(),/nicht abgeschlossen/);assert.equal(await p.locator('#testResults span').count(),0);await p.locator('[data-language=en]').click();assert.match(await p.locator('#checkRunStatus').textContent(),/could not complete/);await context.unroute('**/checks-worker.mjs');await p.locator('#runTests').click();await p.waitForFunction(()=>document.getElementById('checkRunStatus').dataset.run==='3');assert.match(await p.locator('#checkRunStatus').textContent(),/10\/10 passed/)}finally{await context.close()}
});

test('v0.6 browser: 320/390/fractional viewport, DPR and max N stay bounded with readable controls',{timeout:60000},async()=>{
 for(const [width,dpr] of [[320,1],[390,2],[320.5,1.25],[1360,1]]){const {page:p,context}=await lab({viewport:{width:Number.isInteger(width)?width:500,height:900},deviceScaleFactor:dpr});try{let frame=p;if(!Number.isInteger(width)){await p.goto(url+'/__fractional');frame=await(await p.$('iframe')).contentFrame();await ready(frame);assert.equal(await p.locator('iframe').evaluate(e=>e.getBoundingClientRect().width),width)}await entropy(frame);await frame.locator('#entropyN').fill('32');await k(frame,16);const bounds=await frame.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,stage:document.getElementById('entropyChambers').getBoundingClientRect().height,buttons:[...document.querySelectorAll('.entropy-transport button')].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))}));const overflow=await frame.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1}).map(e=>({id:e.id,tag:e.tagName,class:String(e.className),right:e.getBoundingClientRect().right,text:e.textContent.slice(0,150),parent:e.parentElement.outerHTML.slice(0,500)})));assert(bounds.scroll<=bounds.width+1,JSON.stringify({bounds,overflow}));assert(bounds.buttons.every(b=>b.height>=44&&b.width>=44));assert.equal(await frame.locator('#entropyOmega').textContent(),new Intl.NumberFormat('de-DE').format(601080390));measurements.push({requestedWidth:width,dpr,...bounds});await frame.locator('#entropyChambers').scrollIntoViewIfNeeded();await p.screenshot({path:resolve(output,'entropy-'+String(width).replace('.','_')+'-dpr'+dpr+'.png')});}finally{await context.close()}}
});

test('v0.6 browser: reduced motion suppresses transitions, automatic playback starts only on request and reacts to preference changes',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);assert.equal((await state(p)).playing,false);assert.equal(await p.locator('.entropy-marker').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('#entropyPlay').click();await p.waitForFunction(()=>window.entrolabEntropy.inspect().scheduled);await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!window.entrolabEntropy.inspect().playing);assert.equal((await state(p)).scheduled,false);assert.equal((await p.evaluate(()=>window.entrolab.inspect())).paused,true);assert.deepEqual(errors,[])}finally{await context.close()}
});

test('v0.6 browser: exact title, local original SVG and actual 16/32 pixel dark/light favicon rendering',async()=>{
 const {page:p,context}=await lab();try{assert.equal(await p.title(),'Reincarnated as a Proton');const icon=await p.locator('link[rel=icon]').getAttribute('href');assert.equal(icon,'favicon.svg');const response=await p.request.get(url+'/'+icon);assert.equal(response.status(),200);assert.match(response.headers()['content-type'],/image\/svg\+xml/);
 await p.setContent('<html><body style="background:#17131e;color:#fff;font:16px system-ui;padding:30px"><h1>ENTROLAB · favicon at native CSS sizes</h1><div style="display:flex;gap:30px;align-items:center">'+[16,32].flatMap(size=>['#fff','#090810'].map(bg=>`<div style="background:${bg};padding:20px"><img src="${url}/favicon.svg" width="${size}" height="${size}"></div>`)).join('')+'</div></body></html>');await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));await p.screenshot({path:resolve(output,'favicon-16-32.png')});measurements.push({faviconSizes:[16,32],backgrounds:['light','dark'],loaded:true});
 }finally{await context.close()}
});


test('v0.6 browser: bounded N=32 rendering cost is measured, with no mutation of the gravity model',async()=>{
 const {page:p,context}=await lab();try{await entropy(p);await p.locator('#entropyN').fill('32');const before=await p.evaluate(()=>window.entrolab.inspect());const result=await p.evaluate(()=>{const samples=[];for(let i=0;i<500;i++){const start=performance.now();document.getElementById('entropyStep').click();samples.push(performance.now()-start)}samples.sort((a,b)=>a-b);return {steps:window.entrolabEntropy.inspect().steps,samples:samples.length,medianMs:samples[250],p95Ms:samples[475],maxMs:samples.at(-1),scheduled:window.entrolabEntropy.inspect().scheduled}});assert.equal(result.steps,500);assert.equal(result.scheduled,false);assert(Number.isFinite(result.p95Ms));assert.deepEqual(await p.evaluate(()=>window.entrolab.inspect()),before);measurements.push({renderCost32:result});console.log('v0.6 render-cost',JSON.stringify(result));}finally{await context.close()}
});

// Independent v0.6 review regressions; all seventeen pre-review cases remain intact.
const reviewModel=p=>p.evaluate(()=>{const {bodies,selected,paused,elapsed,collisions,view,forecast}=window.entrolab.inspect();return {physics:{bodies,selected,paused,elapsed,collisions,view,forecast},entropy:window.entrolabEntropy.inspect()}});

test('review P2 browser: context return/Escape and lab navigation preserve visible keyboard focus and physical state',async()=>{
 for(const [width,locale] of [[1360,'de-DE'],[390,'en-GB']]){
  const {page:p,context}=await lab({viewport:{width,height:1000},locale});try{
   await entropy(p);await k(p,6);const before=await reviewModel(p);
   const expectedFocus=width<=760?'labMenu':null;
   const firstId=await p.evaluate(async()=>{const {body}=await import('/physics.mjs');return body('review sentinel','planet',1,0,0,0,0,'white').id});
   for(const target of ['blackhole','extreme','gravity','entropy']){
    const origin=p.locator('.view.active [data-explain]').first();await origin.press('Enter');
    assert.equal(await p.locator('#physicsGuide').evaluate(e=>e.open),true);
    await p.locator('#guideReturn').press('Enter');assert.equal(await origin.evaluate(e=>e===document.activeElement),true);
    await origin.press('Enter');await p.keyboard.press('Escape');assert.equal(await origin.evaluate(e=>e===document.activeElement),true);
    await origin.press('Enter');await chooseLab(p,target,'Enter');
    assert.equal(await p.locator('#physicsGuide').evaluate(e=>e.open),false,'navigation closes the stale context');
    assert.equal(await p.locator('#guideReturn').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab??document.activeElement.id),expectedFocus??target);
    // A queued activation of the old, now hidden control must not restore stale focus.
    await p.locator('#guideReturn').evaluate(e=>e.click());await p.keyboard.press('Escape');
    assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab??document.activeElement.id),expectedFocus??target);
    assert.equal(await p.evaluate(()=>!!document.activeElement.getClientRects().length),true);
    if(target==='blackhole')await p.screenshot({path:resolve(output,'review-context-focus-'+width+'.png')});
   }
   if(expectedFocus)await p.locator('#labMenu').press('Enter');
   await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'matter');
   await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'explorer');
   await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'science');
   assert.deepEqual(await reviewModel(p),before);
   const lastId=await p.evaluate(async()=>{const {body}=await import('/physics.mjs');return body('review sentinel','planet',1,0,0,0,0,'white').id});assert.equal(lastId,firstId+1);
   measurements.push({review:'context-navigation',width,locale,focus:'science',modelUnchanged:true,bodyIdDelta:lastId-firstId});
  }finally{await context.close()}
 }
});

test('review P2 browser: native glossary collapse clears context; a newly opened explanation returns to its own visible origin',async()=>{
 const {page:p,context}=await lab();try{
  await entropy(p);const before=await reviewModel(p);await p.locator('#entropy [data-explain]').press('Enter');
  await p.locator('#physicsGuide > summary').press('Enter');await p.waitForFunction(()=>document.getElementById('guideReturn').hidden);
  await p.locator('#physicsGuide > summary').press('Enter');assert.equal(await p.locator('#guideReturn').isVisible(),false);
  await chooseLab(p,'blackhole');const origin=p.locator('#blackhole [data-explain=guide-horizon]');await origin.press('Enter');await p.keyboard.press('Escape');assert.equal(await origin.evaluate(e=>e===document.activeElement),true);
  await chooseLab(p,'entropy');assert.deepEqual(await reviewModel(p),before);
  measurements.push({review:'native-collapse',contextCleared:true});
 }finally{await context.close()}
});

test('review P3 browser: actual entropy exports reject sparse/non-Boolean/non-array states before RNG consumption',async()=>{
 const {page:p,context}=await lab();try{
  await entropy(p);const before=await reviewModel(p);
  const result=await p.evaluate(async()=>{
   const {validateState,macrostate,randomStep,arrangement,sampleArrangement,distribution,multiplicity}=await import('/entropy.mjs');
   const inherited=[true,false];delete inherited[0];Object.setPrototypeOf(inherited,Object.assign(Object.create(Array.prototype),{0:true}));
   const invalid=[new Array(2),[true,,false],[,false],[true,],[true,undefined],[true,0],inherited,{length:2,every:()=>true,filter:()=>[],map:()=>[]},new Uint8Array([1,0]),null,undefined,'LR',new Boolean(true)];
   // [true,] is a valid one-element array, not a hole: explicitly remove a slot instead.
   invalid[3]=[true,false];delete invalid[3][1];
   let rejected=0,rngCalls=0;const accepted=[];
   for(let i=0;i<invalid.length;i++)for(const consume of [validateState,macrostate,s=>randomStep(s,()=>{rngCalls++;return .5})]){try{consume(invalid[i]);accepted.push(i)}catch(e){if(e instanceof TypeError)rejected++;else throw e}}
   let valid=0;for(const n of [1,2,12,32])for(const k of [0,n]){const state=arrangement(n,k);validateState(state);validateState(randomStep(state,()=>.5));validateState(sampleArrangement(n,k,()=>.5));if(macrostate(state)!==k||distribution(n)[k].omega!==multiplicity(n,k))throw Error('valid boundary changed');valid++}
   return {rejected,expected:invalid.length*3,accepted,rngCalls,valid};
  });assert.equal(result.rejected,result.expected);assert.deepEqual(result.accepted,[]);assert.equal(result.rngCalls,0);assert.equal(result.valid,8);assert.deepEqual(await reviewModel(p),before);assert.deepEqual(errors,[]);measurements.push({review:'state-validation',...result});
 }finally{await context.close()}
});

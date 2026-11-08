// Real Chromium regression suite. Dev dependency only; the application stays buildless.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const output=fileURLToPath(new URL('../browser-results/',import.meta.url));
let server,browser,url;const measurements=[],errors=[];
before(async()=>{
 await mkdir(output,{recursive:true});
 server=createServer(async(req,res)=>{try{const requestURL=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(requestURL.pathname);if(pathname==='/__viewport'){const width=Number(requestURL.searchParams.get('width'));if(!Number.isFinite(width)||width<250||width>2000){res.writeHead(400).end();return}res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}).end(`<meta charset="utf-8"><style>body{margin:0}iframe{border:0;display:block;width:${width}px;height:900px}</style><iframe src="/"></iframe>`);return}const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!path.startsWith(root)){res.writeHead(403).end();return}const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.png':'image/png'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(body)}catch{res.writeHead(404).end()}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));url=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
 console.log('Chromium',browser.version());
});
after(async()=>{await writeFile(resolve(output,'measurements.json'),JSON.stringify({measurements,errors},null,2));await browser?.close();if(server)await new Promise(done=>server.close(done))});
async function lab(options={}){
 const context=await browser.newContext({locale:'de-DE',viewport:{width:1360,height:1000},reducedMotion:'reduce',...options});
 await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await ready(page);
 return {page,context};
}
async function ready(frame){await frame.waitForFunction(()=>window.entrolab&&document.getElementById('extremeRadius').textContent);await frame.evaluate(()=>document.fonts.ready)}
async function frames(frame,count){return frame.evaluate(async count=>{for(let i=0;i<count;i++)await new Promise(requestAnimationFrame)},count)}
const state=page=>page.evaluate(()=>window.entrolab.inspect());

test('browser P2: paused canvas/controls stay stable over 120 frames at narrow/fractional sizes and DPRs',{timeout:120000},async()=>{
 for(const dpr of [1,1.25,2])for(const width of [320,320.5,390.25,1360]){
  const {page,context}=await lab({viewport:{width:Number.isInteger(width)?width:500,height:900},deviceScaleFactor:dpr});
  try{let frame=page;
   if(!Number.isInteger(width)){await page.goto(`${url}/__viewport?width=${width}`);frame=await(await page.$('iframe')).contentFrame();await ready(frame)}
   // Do not wait for layout stability before measuring the very instability under review.
   await frame.locator('#universe').evaluate(el=>el.scrollIntoView({block:'center'}));await frames(frame,8);assert.equal((await state(frame)).paused,true);
   const samples=await frame.evaluate(async()=>{const result=[];for(let i=0;i<120;i++){await new Promise(requestAnimationFrame);const canvas=document.getElementById('universe'),r=canvas.getBoundingClientRect(),transport=document.querySelector('.transport').getBoundingClientRect();result.push({w:r.width,h:r.height,controls:transport.top,backingWidth:canvas.width,backingHeight:canvas.height})}return result});
   const range=key=>Math.max(...samples.map(s=>s[key]))-Math.min(...samples.map(s=>s[key]));const record={width,dpr,frames:samples.length,first:samples[0],last:samples.at(-1),heightRange:range('h'),controlsRange:range('controls')};measurements.push(record);console.log('canvas-size',JSON.stringify(record));
   assert(record.heightRange<=.1,JSON.stringify(record));assert(record.controlsRange<=.1,JSON.stringify(record));
   assert(samples.at(-1).backingWidth===Math.round(samples.at(-1).w*Math.min(dpr,2)));
  }finally{await context.close()}
 }
});

test('browser P2: drafts, focus, validity and model survive DE/EN plus subsequent paused frames',async()=>{
 const {page,context}=await lab();try{
  await page.locator('.edit-options > summary').click();const before=await state(page);
  const drafts={mass:'0.00000400',posX:'1.2500',posY:'-2.500',velX:'42.7500',velY:'-6.1250'};
  for(const [id,value] of Object.entries(drafts))await page.locator('#'+id).fill(value);
  for(const lang of ['en','de','en']){await page.locator('[data-language='+lang+']').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'velY');for(const [id,value] of Object.entries(drafts))assert.equal(await page.locator('#'+id).inputValue(),value);assert.deepEqual(await state(page),before)}
  await page.locator('#mass').fill('');await page.locator('#editForm button[type=submit]').click();assert(await page.locator('#editError').textContent());
  await page.locator('#velX').focus();await page.locator('[data-language=de]').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'velX');await page.locator('#helpToggle').focus();await frames(page,40);
  assert.equal(await page.locator('#mass').inputValue(),'');assert.equal(await page.locator('#velY').inputValue(),drafts.velY);assert.match(await page.locator('#editError').textContent(),/Endliche/);assert.equal(await page.locator('#mass').evaluate(el=>el.validity.valueMissing),true);assert.deepEqual(await state(page),before);
 }finally{await context.close()}
});

test('browser P2: fresh EN placement labels, instrument sentence and custom validity are localized',async()=>{
 const {page,context}=await lab({locale:'en-GB'});try{
  assert.equal(await page.locator('#add').textContent(),'＋ Place a body');await page.locator('.adding-options > summary').click();await page.locator('#add').click();assert.equal(await page.locator('#add').textContent(),'✕ Cancel placement');
  await page.locator('[data-language=de]').click();assert.equal(await page.locator('#add').textContent(),'✕ Platzieren abbrechen');await page.keyboard.press('Escape');await page.locator('[data-language=en]').click();assert.equal(await page.locator('#add').textContent(),'＋ Place a body');
  await page.locator('.instruments > summary').click();assert.equal(await page.locator('#selectedDistance').textContent(),'1 AU from Sun');
  await page.locator('[data-tab=blackhole]').click();await page.locator('#bhMass').fill('1e42');await page.locator('#bhSlider').focus();
  for(const lang of ['de','en','de']){await page.locator('[data-language='+lang+']').click();assert.equal(await page.locator('#bhMass').evaluate(el=>el.validationMessage),await page.locator('#bhMassError').textContent());assert.equal(await page.locator('#bhMass').inputValue(),'1e42')}
 }finally{await context.close()}
});

test('browser P2: keyboard navigation exits focus without returning to a hidden element',async()=>{
 const {page,context}=await lab();try{
  await page.locator('#gravityFocus').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#gravityFocus').getAttribute('aria-pressed'),'true');
  let reached=false;for(let i=0;i<30;i++){await page.keyboard.press('Shift+Tab');if(await page.evaluate(()=>document.activeElement.dataset.tab==='extreme')){reached=true;break}}assert(reached,'Extreme tab reached using Shift+Tab');await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.tab),'extreme');assert.equal(await page.locator('#gravityFocus').getAttribute('aria-pressed'),'false');
  await page.locator('#extremeFocus').focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'extremeFocus');
 }finally{await context.close()}
});

test('browser P3: confirming the active language persists and overrides a later browser suggestion',async()=>{
 const {page,context}=await lab();let storage;try{assert.equal(await page.evaluate(()=>localStorage.getItem('entrolab-language')),null);await page.locator('[data-language=de]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('entrolab-language')),'de');storage=await context.storageState()}finally{await context.close()}
 const next=await lab({locale:'en-GB',storageState:storage});try{assert.equal(await next.page.locator('html').getAttribute('lang'),'de')}finally{await next.context.close()}
});

test('browser: schematic pulsar notice stays visible in focus and translates without model changes',async()=>{
 const {page,context}=await lab({locale:'en-GB',viewport:{width:390,height:844}});try{
  await page.locator('[data-tab=extreme]').click();await page.locator('#extremeObject').selectOption('neutron');await page.locator('#pulsarOn').check();const radius=await page.locator('#extremeRadius').textContent();await page.locator('#extremeFocus').click();
  assert.equal(await page.locator('#pulsarVisualNote').isVisible(),true);const noticeBox=await page.locator('#pulsarVisualNote').boundingBox(),canvasBox=await page.locator('#extremeCanvas').boundingBox();assert(noticeBox.y>=canvasBox.y&&noticeBox.y+noticeBox.height<=canvasBox.y+canvasBox.height,'notice is directly inside the animation area');assert.match(await page.locator('#pulsarVisualNote').textContent(),/schematic/);assert.equal(await page.locator('#pulsarNote').isVisible(),false);await page.locator('[data-language=de]').click();assert.match(await page.locator('#pulsarVisualNote').textContent(),/schematisch/);assert.equal(await page.locator('#extremeRadius').textContent(),radius);await page.keyboard.press('Escape');await page.locator('#extremeObject').selectOption('white');assert.equal(await page.locator('#pulsarVisualNote').isVisible(),false);
 }finally{await context.close()}
});

test('browser: real media-query emulation and application scripts produce no page errors',async()=>{
 const {page,context}=await lab();try{assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);assert.equal((await state(page)).paused,true);await page.locator('[data-tab=extreme]').click();assert.equal(await page.locator('#extreme').getAttribute('data-animating'),'false');assert.deepEqual(errors,[])}finally{await context.close()}
});

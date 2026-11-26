import {chooseLab} from './browser-lab-navigation.mjs';
// Real Chromium regression suite. Dev dependency only; the application stays buildless.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const output=fileURLToPath(new URL('../browser-results/',import.meta.url));
let server,browser,url;const measurements=[],errors=[];
before(async()=>{
 await mkdir(output,{recursive:true});
 server=createServer(async(req,res)=>{try{const requestURL=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(requestURL.pathname);if(pathname==='/__viewport'){const width=Number(requestURL.searchParams.get('width'));if(!Number.isFinite(width)||width<250||width>2000){res.writeHead(400).end();return}res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}).end(`<meta charset="utf-8"><style>body{margin:0}iframe{border:0;display:block;width:${width}px;height:900px}</style><iframe src="/"></iframe>`);return}const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(relative(root,path).split(sep).includes('..')){res.writeHead(403).end();return}const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(body)}catch{res.writeHead(404).end()}});
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
  await page.locator('#velX').focus();await page.locator('[data-language=de]').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'velX');await page.locator('.brand').focus();await frames(page,40);
  assert.equal(await page.locator('#mass').inputValue(),'');assert.equal(await page.locator('#velY').inputValue(),drafts.velY);assert.match(await page.locator('#editError').textContent(),/Endliche/);assert.equal(await page.locator('#mass').evaluate(el=>el.validity.valueMissing),true);assert.deepEqual(await state(page),before);
 }finally{await context.close()}
});

test('browser P2: fresh EN placement labels, instrument sentence and custom validity are localized',async()=>{
 const {page,context}=await lab({locale:'en-GB'});try{
  assert.equal(await page.locator('#add').textContent(),'＋ Place a body');await page.locator('.adding-options > summary').click();await page.locator('#add').click();assert.equal(await page.locator('#add').textContent(),'✕ Cancel placement');
  await page.locator('[data-language=de]').click();assert.equal(await page.locator('#add').textContent(),'✕ Platzieren abbrechen');await page.keyboard.press('Escape');await page.locator('[data-language=en]').click();assert.equal(await page.locator('#add').textContent(),'＋ Place a body');
  await page.locator('.instruments > summary').click();assert.equal(await page.locator('#selectedDistance').textContent(),'1 AU from Sun');
  await chooseLab(page,'blackhole');await page.locator('#bhMass').fill('1e42');await page.locator('#bhSlider').focus();
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
  await chooseLab(page,'extreme');await page.locator('#extremeObject').selectOption('neutron');await page.locator('#pulsarOn').check();const radius=await page.locator('#extremeRadius').textContent();await page.locator('#extremeFocus').click();
  assert.equal(await page.locator('#pulsarVisualNote').isVisible(),true);const noticeBox=await page.locator('#pulsarVisualNote').boundingBox(),canvasBox=await page.locator('#extremeCanvas').boundingBox();assert(noticeBox.y>=canvasBox.y&&noticeBox.y+noticeBox.height<=canvasBox.y+canvasBox.height,'notice is directly inside the animation area');assert.match(await page.locator('#pulsarVisualNote').textContent(),/schematic/);assert.equal(await page.locator('#pulsarNote').isVisible(),false);await page.locator('[data-language=de]').click();assert.match(await page.locator('#pulsarVisualNote').textContent(),/schematisch/);assert.equal(await page.locator('#extremeRadius').textContent(),radius);await page.keyboard.press('Escape');await page.locator('#extremeObject').selectOption('white');assert.equal(await page.locator('#pulsarVisualNote').isVisible(),false);
 }finally{await context.close()}
});

test('browser: real media-query emulation and application scripts produce no page errors',async()=>{
 const {page,context}=await lab();try{assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);assert.equal((await state(page)).paused,true);await chooseLab(page,'extreme');assert.equal(await page.locator('#extreme').getAttribute('data-animating'),'false');assert.deepEqual(errors,[])}finally{await context.close()}
});

test('Gravity trail integrity at identical frame times, with real before and after Canvas screenshots',async()=>{
 const original=execFileSync('git',['show','f77f6ae06b4e4dbc3f8c953909f622f52b9cd3ee:dist/app.mjs'],{cwd:new URL('../',import.meta.url)});
 const records=[];
 const physical=s=>s.bodies.map(({trail,...body})=>body);
 for(const width of [1440,390,320]){
  let previous;
  for(const baseline of [true,false]){
   const context=await browser.newContext({locale:width===390?'en-GB':'de-DE',
    viewport:{width,height:900},reducedMotion:'reduce',deviceScaleFactor:width<500?2:1});
   try{
    await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
    if(baseline)await context.route('**/app.mjs',r=>r.fulfill({body:original,contentType:'text/javascript'}));
    await context.addInitScript(()=>{
     const raf=window.requestAnimationFrame.bind(window), cancel=window.cancelAnimationFrame.bind(window);
     let gravityFrame=null,time=1000;
     window.requestAnimationFrame=callback=>{
      if(!String(callback).includes('gravityRaf=null;loop(now)'))return raf(callback);
      gravityFrame=callback;
      return -1;
     };
     window.cancelAnimationFrame=id=>{if(id===-1)gravityFrame=null;else cancel(id);};
     window.gravityTestFrames=(count,ms)=>{
      const timings=[];
      for(let i=0;i<count;i++){
       const callback=gravityFrame;
       gravityFrame=null;
       time+=ms;
       if(!callback)continue;
       const started=performance.now();
       callback(time);
       timings.push(performance.now()-started);
      }
      return timings;
     };
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);
    await ready(page);
    const canvas=page.locator('#universe');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolab.renderInfo().scheduled);
    const result=await page.evaluate(()=>{
     const el=id=>document.getElementById(id);
     const speed=value=>{el('speed').value=value;el('speed').dispatchEvent(new Event('input'));};
     const bounds=el('universe').getBoundingClientRect();
     const {bodies:[sun],view}=window.entrolab.inspect();
     const zoom=80/view.scale;
     const anchorX=bounds.width/2+(sun.x-view.x)*view.scale*zoom/(zoom-1);
     const anchorY=bounds.height/2-(sun.y-view.y)*view.scale*zoom/(zoom-1);
     el('universe').dispatchEvent(new WheelEvent('wheel',{clientX:bounds.left+anchorX,clientY:bounds.top+anchorY,deltaY:-1000*Math.log(zoom),cancelable:true}));
     el('labels').checked=false;
     el('trails').checked=true;
     speed('1.47712');
     el('play').click();
     window.gravityTestFrames(60,1000/60);
     const normal=window.entrolab.inspect();
     speed('3');
     const timing=window.gravityTestFrames(33,1000/60);
     const fast=window.entrolab.inspect();
     speed('1.47712');
     window.gravityTestFrames(6,1000/60);
     el('play').click();
     window.gravityTestFrames(2,1000/60);
     const paused=window.entrolab.inspect();
     const idleFrames=window.gravityTestFrames(12,1000/60).length;
     return {normal,fast,paused,idleFrames,timing,drift:el('drift').textContent,status:el('status').textContent};
    });
    assert.ok(result.normal.elapsed>20&&result.fast.elapsed>500);
    assert.equal(result.paused.paused,true);
    assert.equal(result.idleFrames,0);
    if(baseline)previous=result;
    else for(const key of ['normal','fast','paused']){
     assert.equal(result[key].elapsed,previous[key].elapsed);
     assert.deepEqual(physical(result[key]),physical(previous[key]));
    }
    assert.ok(result.timing.length>=30);
    assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
    const phase=baseline?'before':'after';
    const maxSegment=[];
    for(const bodyIndex of [1,2]){
     const trail=result.fast.bodies[bodyIndex].trail;
     assert.ok(trail.length>10&&trail.length<=1025);
     const chords=trail.slice(1).map((p,i)=>p.breakBefore?0:Math.hypot(p.x-trail[i].x,p.y-trail[i].y));
     maxSegment.push(Math.max(...chords));
    }
    if(baseline)assert.ok(maxSegment.every(length=>length>.25),JSON.stringify(maxSegment));
    else assert.ok(maxSegment.every(length=>length<=.060001),JSON.stringify(maxSegment));
    const times=result.timing.sort((a,b)=>a-b);
    records.push({width,phase,elapsed:result.fast.elapsed,maxSegmentAU:maxSegment,
     stored:result.fast.bodies.map(b=>b.trail.length),frameP95Ms:times[Math.ceil(times.length*.95)-1],
     idleFrames:result.idleFrames,drift:result.drift,status:result.status});
    await canvas.screenshot({path:resolve(output,'gravity-trails-'+width+'-'+phase+'.png')});
    await page.locator('#reset').click();
    assert.equal((await state(page)).elapsed,0);
    assert.ok((await state(page)).bodies.every(b=>b.trail.length===0));
   }finally{await context.close();}
  }
 }
 await writeFile(resolve(output,'gravity-trails.json'),JSON.stringify(records,null,2)+'\n');
 console.log('GRAVITY_TRAIL '+JSON.stringify(records));
 assert.deepEqual(errors,[]);
});

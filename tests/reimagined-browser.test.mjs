import {chooseLab} from './browser-lab-navigation.mjs';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const select=(p,tab)=>chooseLab(p,tab);
const inspect=(p,name)=>p.evaluate(key=>window[key].inspect(),name);
const shot=(p,name)=>p.screenshot({path:resolve(h.output,'v09-'+name+'.png')});

test('v0.9 navigation: product title, retired tour, Matter order and cold temperature/QCD links',async()=>{
 const {p,context}=await h.lab();try{
  assert.equal(await p.title(),'Reincarnated as a Proton');
  assert.equal(await p.locator('#helpToggle,#quickStart,script[src="discovery.mjs"]').count(),0);
  assert.deepEqual(await p.locator('[data-tab]').evaluateAll(els=>els.map(e=>e.dataset.tab)),['gravity','blackhole','extreme','temperature','entropy','matter','explorer','science']);
  await p.goto(h.url+'/?v09temp=1#temperature');await h.ready(p);
  assert.equal(await p.locator('#temperature').evaluate(e=>e.classList.contains('active')),true);
  assert.equal(await p.locator('#temperature .lab-jump').count(),0);await select(p,'matter');assert.equal(await p.evaluate(()=>location.hash),'#matter');
  await p.goto(h.url+'/?v09qcd=1#model-proton');await h.ready(p);
  assert.equal(await p.locator('#matter').evaluate(e=>e.classList.contains('active')),true);
  await p.locator('#qcdFields').press('Enter');assert.match(await p.locator('.qcd-figure figcaption').textContent(),/starke Wechselwirkung/);
  await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'matter');
  await p.locator('[data-language=en]').click();assert.match(await p.locator('meta[name=description]').getAttribute('content'),/Interactive/);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 gas: 3D ratio, valid/invalid drafts, sample, resize and motion ownership',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900},reducedMotion:'no-preference',deviceScaleFactor:2});
 try{
  const before=await physical(p);await select(p,'temperature');await p.locator('#gasCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabGas?.inspect().frames>2);
  assert.equal((await inspect(p,'entrolabGas')).statistics[1].rms/(await inspect(p,'entrolabGas')).statistics[0].rms,2);
  await p.locator('#gasPause').press('Enter');const paused=await inspect(p,'entrolabGas');
  await p.waitForTimeout(240);assert.equal((await inspect(p,'entrolabGas')).frames,paused.frames);
  await p.locator('#gasA').fill('29');assert.equal((await inspect(p,'entrolabGas')).temperatures[0],150);
  await p.locator('[data-language=en]').click();assert.equal(await p.locator('#gasA').inputValue(),'29');
  assert.match(await p.locator('#gasA').evaluate(e=>e.validationMessage),/last valid/);
  await p.locator('#gasA').fill('300');await p.locator('#gasResample').press('Enter');
  assert.equal((await inspect(p,'entrolabGas')).seed,paused.seed+1);
  await p.locator('#kelvinInput').fill('1e12');assert.equal(await p.locator('#gasCopy').isDisabled(),true);
  await p.locator('#kelvinInput').fill('425');await p.locator('#gasCopy').press('Enter');
  assert.equal((await inspect(p,'entrolabGas')).temperatures[0],425);
  assert.deepEqual(await physical(p),before);
  await p.locator('#gasPause').press('Enter');await p.locator('#gasCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabGas.inspect().scheduled);
  await select(p,'matter');assert.equal((await inspect(p,'entrolabGas')).scheduled,false);
  await select(p,'temperature');await p.locator('#gasCanvas').scrollIntoViewIfNeeded();
  await p.locator('#gasPause').focus();
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!window.entrolabGas.inspect().scheduled&&document.getElementById('gasPause').disabled);
  assert.equal(await p.locator('#gasPause').isDisabled(),true);assert.equal(await p.evaluate(()=>document.activeElement.id),'gasA');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 matter: keyboard, invalid energy, stable drafts, CODATA and QCD return are independent',async()=>{
 const {p,context}=await h.lab({viewport:{width:320,height:900}});
 try{
  const before=await physical(p);await select(p,'matter');await p.locator('#photonParallel').press('Enter');
  assert.equal((await inspect(p,'entrolabMatter')).result.restEnergy,0);
  await p.locator('#photonOpposed').press('Enter');assert.match(await p.locator('#photonMass').textContent(),/^2 MeV/);
  await p.locator('#photonA').fill('0');await p.locator('[data-language=en]').click();
  assert.equal(await p.locator('#photonA').inputValue(),'0');assert.match(await p.locator('#photonA').evaluate(e=>e.validationMessage),/last valid/);
  assert.equal((await inspect(p,'entrolabMatter')).energies[0],1);
  await p.locator('#bindingBound').press('Enter');assert.match(await p.locator('#bindingEnergy').textContent(),/2.224566 MeV/);
  await select(p,'science');await p.locator('#article-index-proton').press('Enter');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'model-proton');
  await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'article-index-proton');
  assert.deepEqual(await physical(p),before);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 observation and station layouts at 320/390/1440 with private screenshots',async()=>{
 for(const width of [320,390,1440]){
  const {p,context}=await h.lab({viewport:{width,height:900}});try{
   for(const [tab,element,name] of [
    ['blackhole','.bh-illustration','black-hole'],
    ['temperature','.gas-lab','gas'],
    ['matter','.matter-station','matter']
   ]){
    await select(p,tab);await p.locator(element).first().scrollIntoViewIfNeeded();
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),tab+' '+width);
    if(tab==='blackhole'){
     await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().frames>0);
     if(width===1440){
      await p.locator('#bhView').selectOption('light');await p.locator('#bhLightImpact').selectOption('near');
      assert.match(await p.locator('#bhGeometryNote').textContent(),/Photonensphäre/);
      await p.locator('#bhIllustration').screenshot({path:resolve(h.output,'v09-black-hole-light.png')});
      await p.locator('#bhView').selectOption('environment');
     }
    }
    if(tab==='temperature'){await p.locator('#gasCanvas').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabGas.inspect().frames>0)}
    if(width!==320)await p.locator(element).first().screenshot({path:resolve(h.output,`v09-${name}-${width}.png`)});
   }
   assert.deepEqual(h.errors,[]);
  }finally{await context.close()}
 }
});

test('v0.9 Black Hole: an actual moving 2.5D scene can be sampled without touching mass',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference',viewport:{width:1360,height:900}});try{
  await select(p,'blackhole');await p.locator('#bhIllustration').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().frames>4);
  const before=await p.locator('#bhRadius,#bhTemp,#bhPower,#bhLife').allTextContents();
  for(let i=0;i<12;i++){
   const last=(await inspect(p,'entrolabBlackHoleView')).frames;
   await p.waitForFunction(n=>window.entrolabBlackHoleView.inspect().frames>=n+3,last);
   await p.locator('#bhIllustration').screenshot({path:resolve(h.output,`v09-black-hole-frame-${String(i).padStart(2,'0')}.png`)});
  }
  assert.deepEqual(await p.locator('#bhRadius,#bhTemp,#bhPower,#bhLife').allTextContents(),before);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 paused Gravity stays idle, redraws once after camera input and resumes',async()=>{
 const {p,context}=await h.lab();try{
  const state=()=>p.evaluate(()=>window.entrolab.renderInfo());
  await p.locator('#universe').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>!window.entrolab.renderInfo().scheduled);
  const base=await state();await p.waitForTimeout(170);assert.deepEqual(await state(),base);
  await p.locator('#zoomIn').click();await p.waitForFunction(n=>window.entrolab.renderInfo().frame>n,base.frame);
  const changed=await state();await p.waitForTimeout(170);assert.deepEqual(await state(),changed);
  await p.locator('#play').click();await p.waitForFunction(n=>window.entrolab.renderInfo().frame>n+2,changed.frame);
 }finally{await context.close()}
});

test('v0.9 fallback has an actual visible SVG and calculators stay available when its canvas cannot start',async()=>{
 const context=await h.browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
 try{
  await context.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(...args){return this.id==='bhIllustration'?null:original.apply(this,args)};
  });
  const p=await context.newPage();await p.goto(h.url);await h.ready(p);await select(p,'blackhole');
  await p.locator('#bhIllustration').scrollIntoViewIfNeeded();
  await p.locator('#bhStill').waitFor({state:'visible'});
  assert(await p.locator('#bhRadius').isVisible());
  assert.equal((await inspect(p,'entrolabBlackHoleView')).scheduled,false);
  await p.locator('#bhView').selectOption('light');
  assert.equal(await p.locator('#bhStill').getAttribute('data-view'),'light');
 }finally{await context.close()}
});

test('v0.9 gas lifecycle: 100 mounts release observers, pending frames and subscriptions',async()=>{
 const {p,context}=await h.lab();try{
  await select(p,'extreme');const before=await physical(p);
  const cdp=await context.newCDPSession(p);
  await cdp.send('HeapProfiler.collectGarbage');const a=await cdp.send('Memory.getDOMCounters');
  await p.evaluate(async()=>{
   const {initGasView}=await import('/gas-view.mjs');
   for(let i=0;i<100;i++){
    const controller=initGasView();if(controller!==initGasView())throw Error('Duplicate gas controller');
    controller.dispose();controller.dispose();
    if(controller.inspect().scheduled||window.entrolabTemperature.inspect().subscriptions!==1)throw Error('Gas teardown retained a callback');
    initGasView();
   }
  });
  await cdp.send('HeapProfiler.collectGarbage');const b=await cdp.send('Memory.getDOMCounters');
  assert(b.jsEventListeners<=a.jsEventListeners+2,JSON.stringify({a,b}));
  assert.equal(await p.locator('#gasCanvas').count(),1);assert.deepEqual(await physical(p),before);
 }finally{await context.close()}
});

const days = value => new Intl.NumberFormat('de-DE',{maximumSignificantDigits:5}).format(value)+' Tage';
const formValue = value => String(Number(value.toPrecision(9)));
const gravityState = p => p.evaluate(()=>window.entrolab.inspect());
const gravityRender = p => p.evaluate(()=>window.entrolab.renderInfo());
const selectedBody = ({bodies,selected}) => bodies.find(body=>body.id===selected);

async function startGravity(p){
 await p.locator('#universe').scrollIntoViewIfNeeded();
 await p.evaluate(()=>document.getElementById('play').click());
 await p.waitForFunction(()=>!window.entrolab.inspect().paused&&window.entrolab.renderInfo().scheduled);
}

async function pauseBetweenDiagnostics(p){
 return p.evaluate(()=>new Promise(resolve=>{
  const first=window.entrolab.renderInfo().frame;
  function pause(){
   const {frame}=window.entrolab.renderInfo();
   if(frame>=first+5&&frame%15>=4&&frame%15<=12){
    document.getElementById('play').click();
    resolve(frame);
   }else requestAnimationFrame(pause);
  }
  requestAnimationFrame(pause);
 }));
}

test('v0.9 audit V09-01: pause synchronizes model diagnostics and a mass edit preserves exact phase space',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await p.locator('#speed').fill('2');
  await startGravity(p);
  const stoppedAt=await pauseBetweenDiagnostics(p);
  await p.waitForFunction(()=>!window.entrolab.renderInfo().scheduled);
  const stopped=await gravityState(p);
  const before=selectedBody(stopped);
  assert(stopped.paused&&stopped.elapsed>0);
  assert(stoppedAt%15>=4&&stoppedAt%15<=12);
  assert.equal(await p.locator('#time').textContent(),days(stopped.elapsed));
  assert.equal(await p.locator('#posX').inputValue(),formValue(before.x));
  assert.equal(await p.locator('#posY').inputValue(),formValue(before.y));
  const factor=await p.evaluate(async()=>{
   const {C}=await import('/physics.mjs');
   return C.AU/C.day/1000;
  });
  assert.equal(await p.locator('#velX').inputValue(),formValue(before.vx*factor));
  assert.equal(await p.locator('#velY').inputValue(),formValue(before.vy*factor));
  await p.locator('.edit-options > summary').click();
  await p.locator('#mass').fill('0.000004');
  await p.locator('#editForm button[type=submit]').click();
  const edited=await gravityState(p);
  assert.deepEqual(selectedBody(edited),{...before,m:.000004,trail:[]});
  assert.equal(edited.elapsed,stopped.elapsed);
  await startGravity(p);
  await p.waitForFunction(elapsed=>window.entrolab.inspect().elapsed>elapsed,stopped.elapsed);
  assert.equal(selectedBody(await gravityState(p)).m,.000004);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 audit V09-01: pending fields and invalid drafts survive both manual and Reduced Motion pause',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await p.locator('.edit-options > summary').click();
  await p.locator('#velX').fill('42.7500');
  await p.locator('#mass').fill('');
  const pristine=await p.locator('#posX').inputValue();
  await startGravity(p);
  await pauseBetweenDiagnostics(p);
  assert.equal(await p.locator('#velX').inputValue(),'42.7500');
  assert.equal(await p.locator('#mass').inputValue(),'');
  const after=selectedBody(await gravityState(p));
  assert.notEqual(formValue(after.x),pristine);
  assert.equal(await p.locator('#posX').inputValue(),formValue(after.x));
  await startGravity(p);
  // Focus the draft without scrolling the stage offscreen.
  await p.locator('#velX').evaluate(e=>e.focus({preventScroll:true}));
  await p.waitForFunction(x=>window.entrolab.inspect().bodies.find(b=>b.id===x.id).x!==x.x,after);
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>window.entrolab.inspect().paused&&!window.entrolab.renderInfo().scheduled);
  const reduced=await gravityState(p);
  assert.equal(await p.locator('#time').textContent(),days(reduced.elapsed));
  assert.equal(await p.locator('#posX').inputValue(),formValue(selectedBody(reduced).x));
  assert.equal(await p.locator('#velX').inputValue(),'42.7500');
  assert.equal(await p.locator('#mass').inputValue(),'');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'velX');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 audit V09-01: paused speed label and display switches update without an idle loop',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await startGravity(p);
  await pauseBetweenDiagnostics(p);
  await p.locator('details.display-options > summary').click();
  await p.locator('#universe').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>!window.entrolab.renderInfo().scheduled);
  const canvas=()=>p.locator('#universe').evaluate(e=>e.toDataURL());
  const settled=await gravityRender(p), stopped=await gravityState(p);
  await p.locator('#speed').fill('2');
  assert.equal(await p.locator('#speedLabel').textContent(),'100 Tage/s');
  assert.deepEqual(await gravityRender(p),settled);
  for(const id of ['labels','grid','trails']){
   const before=await canvas(), {frame}=await gravityRender(p);
   // Keep the canvas in view independently of the control's location.
   await p.locator('#'+id).evaluate(e=>e.click());
   await p.waitForFunction(n=>window.entrolab.renderInfo().frame>n,frame,{timeout:2500});
   assert.notEqual(await canvas(),before,id+' should change painted pixels');
   assert.deepEqual(await gravityRender(p),{...settled,frame:frame+1});
  }
  const painted=await gravityRender(p);
  await p.waitForTimeout(250);
  assert.deepEqual(await gravityRender(p),painted);
  assert.deepEqual(await gravityState(p),stopped);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

const gasModel = ({temperatures,statistics,seed,paused,time}) => ({temperatures,statistics,seed,paused,time});
async function gasGeometry(p){
 const canvas=p.locator('#gasCanvas');
 await canvas.scrollIntoViewIfNeeded();
 await p.waitForFunction(()=>{
  const e=document.getElementById('gasCanvas'), r=e.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio,1.25);
  return window.entrolabGas.inspect().seen&&e.width===Math.round(r.width*dpr)&&e.height===Math.round(r.height*dpr);
 },null,{timeout:3000});
 const geometry=await canvas.evaluate(e=>{
  const {width,height}=e.getBoundingClientRect(), {a,d}=e.getContext('2d').getTransform();
  return {width,height,bitmap:[e.width,e.height],pixelScale:[a,d],dpr:devicePixelRatio};
 });
 const [w,h]=geometry.bitmap;
 // Mapping back from the backing store must produce one CSS pixel on both axes.
 assert(Math.abs(geometry.pixelScale[0]*geometry.width/w-1)<1e-6);
 assert(Math.abs(geometry.pixelScale[1]*geometry.height/h-1)<1e-6);
 return geometry;
}

test('v0.9 audit V09-02: hidden tab resizes desktop to 390 px and back without changing the gas model',async()=>{
 const {p,context}=await h.lab({viewport:{width:1360,height:900}});
 try{
  await select(p,'temperature');
  const desktop=await gasGeometry(p);
  await p.locator('#gasA').fill('250');
  await p.locator('#gasResample').click();
  const model=gasModel(await inspect(p,'entrolabGas'));
  const chart=await p.locator('#gasChart').innerHTML();
  const snapshot=await physical(p);
  for(const width of [390,1360]){
   await select(p,'matter');
   await p.waitForFunction(()=>!window.entrolabGas.inspect().seen);
   await p.setViewportSize({width,height:900});
   await select(p,'temperature');
   const resized=await gasGeometry(p);
   if(width===390)assert(resized.width<desktop.width/2);
   else assert.deepEqual(resized,desktop);
   assert.deepEqual(gasModel(await inspect(p,'entrolabGas')),model);
   assert.equal(await p.locator('#gasChart').innerHTML(),chart);
   const painted=await inspect(p,'entrolabGas');
   await p.waitForTimeout(220);
   assert.deepEqual(await inspect(p,'entrolabGas'),painted);
  }
  assert.deepEqual(await physical(p),snapshot);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9 audit V09-02: offscreen resize and emulated DPR changes preserve paused and active gas state',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900},reducedMotion:'no-preference'});
 try{
  await select(p,'temperature');
  const mobile=await gasGeometry(p);
  await p.waitForFunction(()=>window.entrolabGas.inspect().time>0);
  await p.locator('#gasPause').evaluate(e=>e.click());
  const snapshot=gasModel(await inspect(p,'entrolabGas'));
  const cdp=await context.newCDPSession(p);
  await p.locator('#temperature h1').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>!window.entrolabGas.inspect().seen);
  const before=await inspect(p,'entrolabGas');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1360,height:900,deviceScaleFactor:2,mobile:false});
  assert.equal((await inspect(p,'entrolabGas')).frames,before.frames);
  const desktop=await gasGeometry(p);
  assert(desktop.width>mobile.width*2);
  assert.equal(desktop.dpr,2);
  assert.deepEqual(gasModel(await inspect(p,'entrolabGas')),snapshot);
  await p.locator('#temperature h1').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>!window.entrolabGas.inspect().seen);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1360,height:900,deviceScaleFactor:1,mobile:false});
  const standard=await gasGeometry(p);
  assert.equal(standard.width,desktop.width);
  assert.notDeepEqual(standard.bitmap,desktop.bitmap);
  assert.equal(standard.dpr,1);
  // A DPR-only CDP override need not emit a real browser resize event.
  // Exercise that event path explicitly with the canvas still visible.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1360,height:900,deviceScaleFactor:2,mobile:false});
  await p.evaluate(()=>window.dispatchEvent(new Event('resize')));
  assert.deepEqual(await gasGeometry(p),desktop);
  assert.deepEqual(gasModel(await inspect(p,'entrolabGas')),snapshot);
  await p.locator('#gasPause').evaluate(e=>e.click());
  await p.waitForFunction(time=>window.entrolabGas.inspect().time>time,snapshot.time);
  const resumed=gasModel(await inspect(p,'entrolabGas'));
  assert(resumed.time>snapshot.time);
  assert.deepEqual(resumed,{...snapshot,paused:false,time:resumed.time});
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('gravity input bounds reject unresolved coordinates and Newtonian speeds on both axes',async()=>{
 for(const [field,value,pattern]of [
  ['posX','1e16',/binary64|Float64|Binär64/],
  ['posY','-1e16',/binary64|Float64|Binär64/],
  ['velX','3000',/0\.01 c/],
  ['velY','-3000',/0\.01 c/]
 ]){
  const {p,context}=await h.lab({viewport:{width:390,height:900}});
  try{
   const before=selectedBody(await gravityState(p));
   await p.locator('.edit-options > summary').click();
   await p.locator('#'+field).fill(value);
   await p.locator('#editForm button[type=submit]').click();
   assert.match(await p.locator('#editError').textContent(),pattern,field);
   assert.deepEqual(selectedBody(await gravityState(p)),before,field);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),390,field);
   assert.deepEqual(h.errors,[]);
  }finally{await context.close()}
 }
});

test('gravity placement rejects an out-of-domain world coordinate without inserting a body',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900}});
 try{
  const before=await gravityState(p);
  const view=await p.evaluate(()=>{
   const canvas=document.getElementById('universe');
   canvas.dispatchEvent(new WheelEvent('wheel',{clientX:-50000,clientY:0,deltaY:100000,cancelable:true}));
   return window.entrolab.inspect().view;
  });
  assert(Math.abs(view.x)>3.52e6,JSON.stringify(view));
  await p.locator('.adding-options > summary').click();
  await p.locator('#add').click();
  await p.locator('#universe').click();
  assert.match(await p.locator('#addError').textContent(),/3\.51844e\+6 AU/);
  assert.equal((await gravityState(p)).bodies.length,before.bodies.length);
  await p.locator('[data-language=en]').click();
  assert.match(await p.locator('#addError').textContent(),/binary64/);
  assert.equal((await gravityState(p)).bodies.length,before.bodies.length);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),390);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

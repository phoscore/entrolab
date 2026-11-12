import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { browserHarness,physical } from './v08-browser-harness.mjs';
import { extremeKinds } from '../dist/stellar-examples.mjs';
import { measurePhaseA } from './v0925-performance.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const tab=(page,name)=>page.locator(`[data-tab=${name}]`).click();
const choose=(page,kind)=>page.locator('#extremeObject').selectOption(kind);
const rendered=page=>page.locator('#extreme').getAttribute('data-rendered').then(Number);
const skyState=page=>page.evaluate(()=>{
 const style=getComputedStyle(document.getElementById('cosmicBackground'),'::before');
 return [style.animationName,style.animationPlayState];
});

test('v0.9.25: all seven object descriptions update in both languages, including special modes',async()=>{
 const {p,context}=await h.lab();
 try{
  const before=await physical(p);
  await tab(p,'extreme');
  await p.locator('.stage-explanation > summary').click();
  const desc=p.locator('#objectImageDescription');
  const expected={
   de:[/Akkretionsumgebung/,/Weißen Zwerg/,/Neutronenstern/,/Infrarotemission/,/Konvektion/,/Dipolgeometrie/,/Sternwind/],
   en:[/accretion environment/,/white dwarf/,/neutron star/,/thermal infrared/,/convection/,/dipole geometry/,/stellar wind/],
  };
  for(const lang of ['de','en','de']){
   await p.locator(`[data-language=${lang}]`).click();
   for(const [index,kind] of extremeKinds.entries()){
    await choose(p,kind);
    assert.match(await desc.textContent(),expected[lang][index]);
    assert.match(await p.locator('#extremeCanvas').getAttribute('aria-label'),lang==='de'?/^Illustrative Ansicht/:/^Illustrative view/);
    assert.equal(await p.locator('#photonRadius').isVisible(),kind==='blackhole');
    assert.equal(await p.locator('#pulsarControl').isVisible(),kind==='neutron');
    assert.equal(await p.locator('#magnetarLegend').isVisible(),kind==='magnetar');
    assert.equal(await p.locator('#objectFacts').isVisible(),index>=3);
    assert.equal(await p.locator('#objectSources a').count()>0,index>=3);
   }
  }
  await choose(p,'blackhole');
  await p.locator('#diskOn').uncheck();assert.match(await desc.textContent(),/isoliertes Schwarzes Loch/);
  await p.locator('#geometryOn').check();assert.match(await desc.textContent(),/Schwarzschild-Koordinatenschnitt/);
  await choose(p,'neutron');await p.locator('#pulsarOn').check();assert.match(await desc.textContent(),/Pulsarbeispiel/);
  await choose(p,'brown');assert.match(await desc.textContent(),/Infrarotemission/);
  assert.equal(await p.locator('#pulsarVisualNote').isVisible(),false);
  assert.deepEqual(await physical(p),before);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9.25: sorted size comparison spans seven objects and labels the two scales',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:950}});
 try{
  await tab(p,'extreme');
  const cards=p.locator('#objectComparison article');
  assert.equal(await cards.count(),7);
  const read=()=>cards.evaluateAll(els=>els.map(el=>({
   kind:el.dataset.kind,radius:Number(el.dataset.radius),percent:parseFloat(el.querySelector('.size-track span').style.width)
  })));
  const log=await read();
  assert(log.every((row,i)=>!i||row.radius>=log[i-1].radius));
  assert.equal(log[0].percent,0);
  assert.equal(log.at(-1).kind,'supergiant');assert.equal(log.at(-1).percent,100);
  assert.match(await p.locator('#comparisonNote').textContent(),/Radiusverhältnisse/);
  assert.match(await p.locator('#objectComparison [data-kind=blackhole] p').first().textContent(),/Horizont \(rₛ\)/);
  await p.locator('#comparisonMode').selectOption('linear');
  const linear=await read();
  assert(linear.every(row=>Math.abs(row.percent-100*row.radius/linear.at(-1).radius)<.0005));
  assert.equal(await p.locator('#comparisonStart').textContent(),'0 m');
  await choose(p,'wolf');
  assert.match(await p.locator('#extremeRadiusLabel').textContent(),/τ = 20/);
  assert.equal(await p.locator('#objectDensityLine').isVisible(),false);
  await choose(p,'blackhole');
  await p.locator('#extremeMass').fill('1e41');
  assert.equal((await read()).at(-1).kind,'blackhole');
  assert.equal(await p.locator('#objectComparison article[aria-current=true]').getAttribute('data-kind'),'blackhole');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9.25: each new object paints its own moving scene and respects pause, offscreen and tab lifecycle',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900},reducedMotion:'no-preference'});
 try{
  await tab(p,'extreme');
  const canvas=p.locator('#extremeCanvas'), data=()=>canvas.evaluate(e=>e.toDataURL());
  const hashes=new Set();
  for(const kind of ['brown','supergiant','magnetar','wolf']){
   await choose(p,kind);await canvas.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='true');
   const before=await data(), count=await rendered(p);
   await p.waitForFunction(n=>Number(document.getElementById('extreme').dataset.rendered)>=n+8,count);
   assert.notEqual(await data(),before,kind);
   await p.locator('#extremePlay').evaluate(e=>e.click());
   assert.equal(await p.locator('#extreme').getAttribute('data-animating'),'false');
   const still=await rendered(p);hashes.add(await data());
   await p.waitForTimeout(150);assert.equal(await rendered(p),still);
   await p.locator('#extremePlay').evaluate(e=>e.click());
  }
  assert.equal(hashes.size,4);
  for(let i=0;i<3;i++){
   await tab(p,'matter');assert.equal(await p.locator('#extreme').getAttribute('data-animating'),'false');
   await tab(p,'extreme');await canvas.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='true');
  }
  await p.locator('footer').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='false');
  const offscreen=await rendered(p);
  await p.waitForTimeout(150);assert.equal(await rendered(p),offscreen);
  await canvas.scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='true');
  await p.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await p.locator('#extreme').getAttribute('data-animating'),'false');
  const hidden=await rendered(p);
  await p.waitForTimeout(150);assert.equal(await rendered(p),hidden);
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='true');
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='false');
  assert.equal(await p.locator('#extremePlay').textContent(),'Animation starten');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9.25: atmosphere is non-interactive, pauses when hidden and follows Reduced Motion',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  const model=await physical(p);
  assert.deepEqual(await skyState(p),['cosmic-drift','running']);
  assert.equal(await p.locator('#cosmicBackground').getAttribute('aria-hidden'),'true');
  assert.equal(await p.locator('#cosmicBackground').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
  for(const destination of ['matter','science','entropy','gravity']){
   await tab(p,destination);
   assert.equal(await p.locator(`#${destination}`).evaluate(e=>e.classList.contains('active')),true);
   assert.equal(await p.locator('#cosmicBackground').count(),1);
  }
  assert.deepEqual(await physical(p),model);
  await p.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.deepEqual(await skyState(p),['cosmic-drift','paused']);
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  assert.deepEqual(await skyState(p),['cosmic-drift','running']);
  await p.emulateMedia({reducedMotion:'reduce'});
  assert.equal((await skyState(p))[0],'none');
  assert.equal((await p.locator('footer').textContent()).trim(),'No plot armor. Just physics.');
  assert.equal(await p.title(),'Reincarnated as a Proton');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('v0.9.25: no horizontal overflow at 320, 390 or desktop widths and private review captures',async()=>{
 for(const width of [320,390,1440]){
  const {p,context}=await h.lab({viewport:{width,height:950}});
  try{
   await tab(p,'extreme');
   const kind=width===1440?'supergiant':'magnetar';
   await choose(p,kind);
   await p.locator('.stage-explanation > summary').click();
   await p.locator('#extremeCanvas').scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>Number(document.getElementById('extreme').dataset.rendered)>0);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   assert.equal((await skyState(p))[0],'none');
   if(width!==320)await p.locator('.object-stage').screenshot({path:join(h.output,`v0925-${kind}-${width}.png`)});
   if(width===1440){
    await tab(p,'matter');await p.evaluate(()=>window.scrollTo(0,0));
    await p.screenshot({path:join(h.output,'v0925-atmosphere-1440.png')});
   }
  }finally{await context.close()}
 }
 assert.deepEqual(h.errors,[]);
});

test('v0.9.25: scoped v0.9 comparison measures atmosphere and canvas work',async t=>measurePhaseA(h,t));

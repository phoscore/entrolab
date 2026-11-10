import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;
before(async()=>{h=await browserHarness()});
after(async()=>{if(h){await writeFile(resolve(h.output,'v08-creature-measurements.json'),JSON.stringify({browser:h.browser.version(),measurements:h.measurements,errors:h.errors},null,2));await h.close()}});
const inspect=p=>p.evaluate(()=>window.entrolabCreature.inspect());
async function ready(p){await p.waitForFunction(()=>window.entrolabCreature)}
async function mode(p,value){const pref=p.locator('#creaturePreferences');if(!await pref.evaluate(e=>e.open))await pref.locator(':scope > summary').click();await p.locator('#creatureMode').selectOption(value);await pref.locator(':scope > summary').click()}
async function show(p,dock='.view.active .creature-dock'){await p.locator(dock).scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabCreature.inspect().visible)}
const animations=p=>p.locator('#creature').evaluate(e=>e.getAnimations({subtree:true}).length);
async function proof(p,name){await p.screenshot({path:resolve(h.output,name+'.png')})}

test('creature browser: one observer across all eight contexts preserves every model, RNG and global body IDs',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);const before=await physical(p);
  const firstId=await p.evaluate(async()=>{const {body}=await import('/physics.mjs');return body('id sentinel','planet',1e-6,0,0,0,0,'#fff').id});
  for(const [tab,expected]of [['gravity','gravity'],['blackhole','blackhole'],['extreme','objects'],['entropy','markers'],['science','science']]){
   await p.locator('[data-tab='+tab+']').click();await show(p);assert.equal((await inspect(p)).context,expected);assert.equal(await p.locator('#creature').count(),1);assert.equal(await animations(p),0);
  }
  await p.locator('[data-tab=extreme]').click();await p.locator('.thermal-lab h2').click();await show(p);assert.equal((await inspect(p)).context,'temperature');
  await p.locator('#why-objects > summary').click();await show(p);assert.equal((await inspect(p)).context,'objects');
  await p.locator('[data-tab=entropy]').click();await p.locator('[data-entropy-view=thermal]').click();await show(p);assert.equal((await inspect(p)).context,'thermal');
  await p.locator('#physicsGuide > summary').click();await show(p,'#physicsGuide .creature-dock');assert.equal((await inspect(p)).context,'guide');
  await p.locator('#physicsGuide > summary').click();await show(p);
  const nextId=await p.evaluate(async()=>{const {body}=await import('/physics.mjs');return body('id sentinel 2','planet',1e-6,0,0,0,0,'#fff').id});assert.equal(nextId,firstId+1);
  assert.deepEqual(await physical(p),before);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});
test('creature browser: still/off preferences persist, off reload avoids asset requests and blocked storage is harmless',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);const before=await physical(p);await mode(p,'still');await show(p);assert.equal(await animations(p),0);
  await mode(p,'off');assert.equal((await inspect(p)).visible,false);assert.equal(await animations(p),0);assert.equal(await p.evaluate(()=>localStorage.getItem('entrolab-creature-mode')),'off');assert.deepEqual(await physical(p),before);
  const requested=[];p.on('request',r=>{if(/creature-candidates.*webp/.test(r.url()))requested.push(r.url())});await p.reload();await h.ready(p);await ready(p);assert.equal((await inspect(p)).mode,'off');assert.deepEqual(requested,[]);
  await p.evaluate(async()=>{const {initCreature}=await import('/creature-ui.mjs');initCreature().dispose();initCreature(document,{storage:{getItem(){throw Error('storage blocked')},setItem(){throw Error('storage blocked')}}})});
  await mode(p,'still');await show(p);assert.equal((await inspect(p)).mode,'still');assert.equal(await animations(p),0);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});
test('creature browser: actual CSS reaction is bounded, suppressed offscreen/hidden/reduced motion, and never queues',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});try{
  await ready(p);await p.evaluate(async()=>{const {initCreature}=await import('/creature-ui.mjs');initCreature().dispose();window.__creatureTestClock=0;initCreature(document,{clock:()=>window.__creatureTestClock})});await show(p);
  assert.equal((await inspect(p)).reactions,1);assert(await animations(p)>0);
  const before=await physical(p);
  await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!window.entrolabCreature.inspect().visible);assert.equal(await animations(p),0);
  await show(p);assert.equal((await inspect(p)).phase,'idle');assert.equal(await animations(p),0);
  await p.locator('[data-tab=blackhole]').click();await show(p);assert.equal((await inspect(p)).reactions,1);
  await p.evaluate(()=>{window.__creatureTestClock=60000});await p.locator('[data-tab=gravity]').click();await show(p);assert.equal((await inspect(p)).reactions,2);assert(await animations(p)>0);
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!window.entrolabCreature.inspect().moving);assert.equal(await animations(p),0);
  // Actual Chromium handler with a controlled hidden flag; not an OS-background test.
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal((await inspect(p)).visible,false);
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});await show(p);assert.equal(await animations(p),0);
  assert.deepEqual(await physical(p),before);h.measurements.push({kind:'motion-lifecycle',state:await inspect(p),visibility:'controlled document.hidden; actual offscreen and media-query transitions'});
 }finally{await context.close()}
});
test('creature browser: rapid navigation and overlapping disclosures retain a single owner without focus theft',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);const before=await physical(p);
  for(let i=0;i<25;i++){const tab=['gravity','blackhole','extreme','entropy','science'][i%5];await p.locator('[data-tab='+tab+']').press('Enter');assert.equal(await p.locator('#creature').count(),1);assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),tab)}
  await p.locator('[data-tab=gravity]').click();await p.locator('#why-gravity > summary').click();await p.locator('#gravity [data-knowledge-term=orbit] > summary').click();await p.locator('#creaturePreferencesSummary').press('Enter');await p.locator('#creatureMode').focus();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'creaturePreferencesSummary');assert.equal(await p.locator('#creaturePreferences').getAttribute('open'),null);
  await p.locator('#gravityFocus').press('Enter');assert.equal((await inspect(p)).visible,false);assert.equal(await animations(p),0);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'gravityFocus');
  assert.deepEqual(await physical(p),before);assert.equal(await p.locator('#creature').count(),1);
 }finally{await context.close()}
});
test('creature browser: DE/EN and mascot settings retain raw drafts, native validation and existing editor focus',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);await mode(p,'still');await p.locator('.edit-options > summary').click();await p.locator('#velX').fill('42.7500');await p.locator('#velX').focus();const before=await physical(p);
  const validity=await p.locator('#velX').evaluate(e=>({message:e.validationMessage,valid:e.validity.valid}));await p.locator('[data-language=en]').click();assert.equal(await p.locator('#velX').inputValue(),'42.7500');assert.equal(await p.evaluate(()=>document.activeElement.id),'velX');assert.equal((await inspect(p)).visible,false);
  await p.locator('#creaturePreferencesSummary').click();assert.equal(await p.locator('label[for=creatureMode]').textContent(),'Decorative observer');assert.equal(await p.locator('#creatureMode').inputValue(),'still');await p.keyboard.press('Escape');
  await p.locator('#velX').focus();await p.locator('[data-language=de]').click();assert.equal(await p.locator('#velX').inputValue(),'42.7500');assert.deepEqual(await p.locator('#velX').evaluate(e=>({message:e.validationMessage,valid:e.validity.valid})),validity);assert.deepEqual(await physical(p),before);
  assert.deepEqual(await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]),[]);
 }finally{await context.close()}
});
test('creature browser: mobile/fractional DPR settings and image never cover controls or overflow',async()=>{
 for(const [width,dpr]of [[320,1],[390,2],[320.5,1.25]]){const {p,context}=await h.lab({viewport:{width:Math.ceil(width),height:900},deviceScaleFactor:dpr});try{
  let q=p;if(width===320.5){await p.goto(h.url+'/__fractional');q=await(await p.$('iframe')).contentFrame();await h.ready(q)}await ready(q);
  for(const tab of ['gravity','blackhole','extreme','entropy','science']){
   await q.locator('[data-tab='+tab+']').click();await show(q);
   const data=await q.evaluate(()=>{const creature=document.querySelector('#creature').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,variant:document.querySelector('#creature').dataset.variant,overlap:[...document.querySelectorAll('.view.active button,.view.active input,.view.active select,.view.active summary')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&Math.min(r.right,creature.right)-Math.max(r.left,creature.left)>1&&Math.min(r.bottom,creature.bottom)-Math.max(r.top,creature.top)>1}).map(e=>e.id||e.tagName)}});assert(data.scroll<=data.width+1,JSON.stringify(data));assert.equal(data.variant,'icon');assert.deepEqual(data.overlap,[]);h.measurements.push({kind:'mobile-layout',width,dpr,tab,...data});
  }
  await q.locator('#creaturePreferencesSummary').click();const bounds=await q.locator('.creature-preference-body').boundingBox();assert(bounds.x>=-1,JSON.stringify(bounds));assert(bounds.x+bounds.width<=Math.ceil(width)+1,JSON.stringify(bounds));assert.equal((await inspect(q)).visible,false);await q.locator('#creaturePreferencesSummary').click();
  if(width===390){await q.locator('[data-tab=entropy]').click();await show(q);await proof(p,'v08-creature-mobile')}
 }finally{await context.close()}}
});
test('creature browser: 100 mount/dispose cycles bound actual DOM/listeners and preserve models without timers',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);await show(p);const before=await physical(p),cdp=await context.newCDPSession(p);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');const initial=await cdp.send('Memory.getDOMCounters'),heapBefore=await cdp.send('Runtime.getHeapUsage');
  await p.evaluate(async()=>{const {initCreature}=await import('/creature-ui.mjs');for(let i=0;i<100;i++){const c=initCreature();if(c!==initCreature())throw Error('duplicate owner');c.dispose();c.dispose();const s=c.inspect();if(s.subscriptions||s.observers||s.timers||s.figures)throw Error('retained creature owner');initCreature()}});
  await cdp.send('HeapProfiler.collectGarbage');const final=await cdp.send('Memory.getDOMCounters'),heapAfter=await cdp.send('Runtime.getHeapUsage');assert(final.nodes<=initial.nodes+100,JSON.stringify({initial,final}));assert(final.jsEventListeners<=initial.jsEventListeners+8,JSON.stringify({initial,final}));assert.equal(await p.locator('#creature').count(),1);assert.equal(await p.locator('#creaturePreferences').count(),1);assert.deepEqual(await physical(p),before);
  h.measurements.push({kind:'creature-mount-dispose-100',initial,final,heapBefore,heapAfter,state:await inspect(p)});
 }finally{await context.close()}
});
test('creature browser: decorative semantics leave scientific content accessible; desktop reference screenshot',async()=>{
 const {p,context}=await h.lab();try{
  await ready(p);await p.locator('[data-tab=entropy]').click();await show(p);assert.equal(await p.locator('#creature').getAttribute('aria-hidden'),'true');assert.equal(await p.locator('#creature a,#creature button,#creature input,#creature [tabindex]').count(),0);assert(await p.locator('#entropyExplain').isVisible());
  await p.locator('#creaturePreferencesSummary').press('Enter');assert.equal(await p.getByRole('combobox',{name:'Dekorativer Beobachter',exact:true}).count(),1);await p.keyboard.press('Escape');await show(p);await p.locator('#creature img').evaluate(e=>e.decode());await proof(p,'v08-creature-desktop');assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

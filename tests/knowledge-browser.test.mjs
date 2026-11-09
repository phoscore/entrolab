import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;
before(async()=>{h=await browserHarness();console.log('v0.8 Chromium',h.browser.version())});
after(async()=>{if(h){await writeFile(resolve(h.output,'v08-knowledge-measurements.json'),JSON.stringify({browser:h.browser.version(),measurements:h.measurements,errors:h.errors},null,2));await h.close()}});

test('v0.8 browser: canonical glossary preserves legacy focus return and dynamic model back/Escape',async()=>{
 const {p,context}=await h.lab();try{
  await p.locator('[data-tab=entropy]').click();const before=await physical(p);
  await p.locator('#entropyExplain').press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'guide-entropy');
  await p.locator('#physicsGuide [data-i18n="Advanced · Fluktuationen"]').click();
  await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'entropyExplain');
  const help=p.locator('#particleExperiment [data-knowledge-term=multiplicity]');
  await help.locator(':scope > summary').click();await help.locator('.knowledge-advanced > summary').click();
  const link=help.locator('[data-model-link]'),origin=await link.getAttribute('id');
  await link.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'model-markers');
  await p.locator('#guideReturn').press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),origin);
  await link.click();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),origin);
  assert.deepEqual(await physical(p),before);
 }finally{await context.close()}
});

test('v0.8 browser: language changes preserve inline details, raw gravity draft, validity and model',async()=>{
 const {p,context}=await h.lab();try{
  await p.locator('.edit-options > summary').click();await p.locator('#velX').fill('42.7500');
  const help=p.locator('#gravity [data-knowledge-term=mass]');await help.locator(':scope > summary').click();
  const before=await physical(p);await p.locator('[data-language=en]').click();
  assert.equal(await help.getAttribute('open'),'');assert.equal(await p.locator('#velX').inputValue(),'42.7500');
  assert.match(await help.locator(':scope > summary').getAttribute('aria-label'),/Mass/);
  assert.deepEqual(await physical(p),before);
  await p.locator('[data-language=de]').click();assert.match(await help.locator(':scope > summary').getAttribute('aria-label'),/Masse/);
  const missing=await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]);assert.deepEqual(missing,[]);
 }finally{await context.close()}
});

test('v0.8 browser: cold science/model/term fragments and browser back/forward reach visible logical targets',async()=>{
 const {p,context}=await h.lab();try{
  for(const [hash,view,focus]of [['science','science',null],['model-thermal','science','model-thermal'],['guide-horizon','gravity','guide-horizon'],['unknown-audit-target','gravity',null]]){
   await p.goto(h.url+'/?fresh='+hash+'#'+hash);await h.ready(p);
   assert.equal(await p.locator('.view.active').getAttribute('id'),view);
   if(focus)assert.equal(await p.evaluate(()=>document.activeElement.id),focus);
   if(hash==='guide-horizon'||hash==='model-thermal'){await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),view);assert.equal(await p.locator('#physicsGuide').getAttribute('open'),null);assert.match(p.url(),new RegExp('#'+view+'$'))}
  }
  await p.goto(h.url+'/?history=1');await h.ready(p);
  const help=p.locator('#gravity [data-knowledge-term=orbit]');await help.locator(':scope > summary').click();await help.locator('.knowledge-advanced > summary').click();
  await help.locator('[data-model-link]').click();assert.match(p.url(),/#model-gravity$/);
  await p.goBack();assert.equal(await p.locator('.view.active').getAttribute('id'),'gravity');
  assert.notEqual(await p.evaluate(()=>document.activeElement.tagName),'BODY');
  await p.goForward();assert.equal(await p.locator('.view.active').getAttribute('id'),'science');assert.equal(await p.evaluate(()=>document.activeElement.id),'model-gravity');
 }finally{await context.close()}
});

test('v0.8 browser: 100 knowledge/guide mount-dispose cycles retain one owner and bounded native DOM/listeners',async()=>{
 const {p,context}=await h.lab();try{
  const before=await physical(p),cdp=await context.newCDPSession(p);
  await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');
  const countersBefore=await cdp.send('Memory.getDOMCounters'),heapBefore=await cdp.send('Runtime.getHeapUsage');
  await p.evaluate(async()=>{
   const {initKnowledge}=await import('/knowledge-ui.mjs'),{initGuide}=await import('/guide.mjs');
   for(let i=0;i<100;i++){
    const a=initKnowledge();if(a!==initKnowledge())throw Error('duplicate knowledge owner');
    a.dispose();a.dispose();if(a.inspect().subscriptions!==0)throw Error('knowledge subscription retained');
    const g=initGuide();g.dispose();g.dispose();if(g.inspect().subscriptions!==0)throw Error('guide subscription retained');
    initGuide();initKnowledge();
   }
  });
  await cdp.send('HeapProfiler.collectGarbage');const countersAfter=await cdp.send('Memory.getDOMCounters'),heapAfter=await cdp.send('Runtime.getHeapUsage');
  assert.equal(await p.locator('.knowledge-model').count(),6);assert.equal(await p.locator('.knowledge-glossary').count(),1);
  const duplicates=await p.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i)});assert.deepEqual(duplicates,[]);
  assert(countersAfter.jsEventListeners<=countersBefore.jsEventListeners+8,JSON.stringify({countersBefore,countersAfter}));
  assert(countersAfter.nodes<=countersBefore.nodes+100,JSON.stringify({countersBefore,countersAfter}));
  assert.deepEqual(await physical(p),before);
  h.measurements.push({kind:'mount-dispose-100',countersBefore,countersAfter,heapBefore,heapAfter,limit:'single bounded GC sample; not a universal leak proof'});
 }finally{await context.close()}
});

test('v0.8 browser: narrow/fractional DPR knowledge and deep links have no overflow or hidden focus',async()=>{
 for(const [width,dpr]of [[320,1],[390,2],[320.5,1.25]]){
  const {p,context}=await h.lab({viewport:{width:Number.isInteger(width)?width:500,height:900},deviceScaleFactor:dpr});try{
   let f=p;if(!Number.isInteger(width)){await p.goto(h.url+'/__fractional');f=await(await p.$('iframe')).contentFrame();await h.ready(f)}
   await f.locator('[data-tab=science]').click();await f.locator('[data-language=en]').click();
   await f.locator('#model-thermal > details > summary').click();
   const result=await f.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,focus:document.activeElement.tagName,keys:[...document.querySelectorAll('[data-i18n]')].filter(e=>e.getClientRects().length&&/^k\./.test(e.textContent)).map(e=>e.textContent)}));
   assert(result.scroll<=result.width+1,JSON.stringify(result));assert.deepEqual(result.keys,[]);assert.notEqual(result.focus,'BODY');
   h.measurements.push({kind:'knowledge-layout',requestedWidth:width,dpr,...result});
   await p.screenshot({path:resolve(h.output,'v08-science-'+width+'.png')});
  }finally{await context.close()}
 }
 assert.deepEqual(h.errors,[]);
});

test('v0.8 browser: candidate images decode at recorded sizes on 320/390px and do not change active branding',async()=>{
 for(const width of [320,390]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  assert.equal(await p.title(),'entrolab - emptiness pro max');
  await p.goto(h.url+'/asset-review.html');await p.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
  const result=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.querySelectorAll('.comparison img')].map(i=>({w:i.naturalWidth,h:i.naturalHeight}))}));
  assert.deepEqual(result.images.map(i=>i.w),[1536,512,256,128]);assert(result.scroll<=result.width+1);
  await p.screenshot({path:resolve(h.output,'v08-assets-'+width+'.png')});
 }finally{await context.close()}}
});

import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;
before(async()=>{h=await browserHarness()});
after(async()=>{if(h){await writeFile(resolve(h.output,'v08-learning-measurements.json'),JSON.stringify({measurements:h.measurements,errors:h.errors},null,2));await h.close()}});
async function particles(p){await p.locator('[data-tab=entropy]').click();await p.locator('[data-entropy-view=particles]').click();await p.waitForFunction(()=>window.entrolabLearning)}
async function heat(p){await p.locator('[data-tab=entropy]').click();await p.locator('[data-entropy-view=thermal]').click()}
test('v0.8 browser: independent N=4 example updates exact patterns without RNG/model mutations and retains keyboard focus',async()=>{
 const {p,context}=await h.lab();try{
  await particles(p);const before=await physical(p);assert.equal(await p.locator('#microstateDemo').getAttribute('open'),null);
  await p.locator('#microstateDemo > summary').press('Enter');assert.equal(await p.locator('#demoPatterns li').count(),6);assert.equal(await p.locator('#microstateDemo').getAttribute('data-omega'),'6');
  await p.locator('[data-demo-marker="0"]').press('Enter');assert.equal(await p.locator('#demoPatterns li').count(),4);assert.equal(await p.evaluate(()=>document.activeElement.dataset.demoMarker),'0');
  await p.locator('[data-demo-marker="1"]').click();assert.equal(await p.locator('#demoPatterns li').count(),1);
  await p.locator('[data-demo-marker="1"]').press('Enter');await p.locator('[data-demo-marker="0"]').press('Enter');assert.equal(await p.locator('#demoPatterns li').count(),6);
  await p.keyboard.press('Escape');assert.equal(await p.locator('#microstateDemo').getAttribute('open'),null);assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SUMMARY');assert.deepEqual(await physical(p),before);
 }finally{await context.close()}
});
test('v0.8 browser: comparison highlights existing distribution, keeps live arrow and handles N=1/12/32',async()=>{
 const {p,context}=await h.lab();try{
  await particles(p);await p.locator('#macrostateComparison > summary').click();const before=await physical(p);
  await p.locator('[data-compare=edge]').click();assert.equal(await p.locator('#macrostateComparison').getAttribute('data-selected-k'),'12');
  await p.locator('[data-compare=balanced]').click();assert.equal(await p.locator('#entropyTable [data-comparison]').getAttribute('data-k'),'6');assert.equal(await p.locator('#entropyTable [aria-current=true]').getAttribute('data-k'),'12');assert.match(await p.locator('#comparisonReadout').textContent(),/924/);assert.deepEqual(await physical(p),before);
  for(const [n,k,count]of [[1,0,'1'],[32,16,'601']]){await p.locator('#entropyN').fill(String(n));await p.waitForFunction(k=>document.querySelector('#macrostateComparison').dataset.selectedK===String(k),k);assert.equal(await p.locator('#entropyChart [data-comparison]').getAttribute('data-k'),String(k));assert((await p.locator('#comparisonReadout').textContent()).includes(count));}
  const applied=await physical(p);await p.locator('[data-compare=edge]').click();assert.deepEqual(await physical(p),applied);
 }finally{await context.close()}
});
test('v0.8 browser: signed energy/entropy balance reads actual results, ignores drafts and updates only after explicit apply',async()=>{
 const {p,context}=await h.lab();try{
  await heat(p);await p.locator('#thermalBalance > summary').click();const before=await physical(p);
  await p.locator('#thermalA').fill('400');assert.deepEqual(await physical(p),before);assert.equal(Number(await p.locator('#balanceEnergyTotal').getAttribute('data-value')),640000);
  await p.locator('#thermalApply').click();await p.locator('#thermalStep').click();
  async function check(){const s=await p.evaluate(()=>window.entrolabThermal.inspect());await p.waitForFunction(time=>Number(document.querySelector('#thermalBalance').dataset.time)===time,s.time);const rows=await p.locator('#thermalBalance [data-entropy]').evaluateAll(es=>es.map(e=>Number(e.dataset.entropy)));assert.deepEqual(rows,[s.result.sa,s.result.sb,s.result.entropy]);assert.equal(Number(await p.locator('#balanceEnergyTotal').getAttribute('data-value')),s.result.energy);assert.equal(Number(await p.locator('#balanceProduction').getAttribute('data-value')),s.result.production);return s}
  let s=await check();assert(s.result.sa<0&&s.result.sb>0);await p.locator('#thermalA').fill('290');await p.locator('#thermalB').fill('350');await p.locator('#thermalApply').click();await p.locator('#thermalStep').click();s=await check();assert(s.result.sa>0&&s.result.sb<0);
  await p.locator('[data-thermal-preset=balanced]').click();await p.locator('#thermalApply').click();s=await check();assert.equal(s.result.production,0);assert.equal(s.result.entropy,0);
  const widths=await p.locator('.learning-entropy-track > span').evaluateAll(es=>es.map(e=>e.style.width));assert.deepEqual(widths,['0%','0%','0%']);
 }finally{await context.close()}
});
test('v0.8 browser: all learning layers translate in place, preserve independent selection, applied values, raw drafts and focus',async()=>{
 const {p,context}=await h.lab();try{
  await particles(p);await p.locator('#microstateDemo > summary').click();await p.locator('[data-demo-marker="0"]').click();const presentation=await p.evaluate(()=>window.entrolabLearning.inspect()),before=await physical(p);
  await p.evaluate(async()=>{(await import('/i18n.mjs')).setLanguage('en')});assert.equal(await p.evaluate(()=>document.activeElement.dataset.demoMarker),'0');assert.deepEqual(await p.evaluate(()=>window.entrolabLearning.inspect()),presentation);assert.match(await p.locator('#demoSummary').textContent(),/Macrostate/);assert.deepEqual(await physical(p),before);
  await heat(p);await p.locator('#thermalA').fill('399.2500');const b=await physical(p);await p.locator('#thermalBalance > summary').click();await p.locator('[data-language=de]').click();assert.equal(await p.locator('#thermalA').inputValue(),'399.2500');assert.deepEqual(await physical(p),b);
  assert.deepEqual(await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]),[]);
 }finally{await context.close()}
});
test('v0.8 browser: 100 question/demo mount-dispose cycles leave bounded native DOM/listeners and zero owned timers',async()=>{
 const {p,context}=await h.lab();try{
  await particles(p);const before=await physical(p),cdp=await context.newCDPSession(p);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');const initial=await cdp.send('Memory.getDOMCounters'),heapBefore=await cdp.send('Runtime.getHeapUsage');
  await p.evaluate(async()=>{const {initExplanations}=await import('/explanations-ui.mjs'),{initEntropyLearning}=await import('/entropy-learning.mjs');for(let i=0;i<100;i++){const l=initEntropyLearning();if(l!==initEntropyLearning())throw Error('duplicate demo owner');l.dispose();l.dispose();if(l.inspect().observers!==0)throw Error('retained observer');const e=initExplanations();e.dispose();e.dispose();initExplanations();initEntropyLearning()}});
  await cdp.send('HeapProfiler.collectGarbage');const final=await cdp.send('Memory.getDOMCounters'),heapAfter=await cdp.send('Runtime.getHeapUsage');assert(final.jsEventListeners<=initial.jsEventListeners+8,JSON.stringify({initial,final}));assert(final.nodes<=initial.nodes+100,JSON.stringify({initial,final}));assert.equal(await p.locator('#microstateDemo').count(),1);assert.equal(await p.locator('.learning-question').count(),6);assert.deepEqual(await physical(p),before);h.measurements.push({kind:'learning-mount-dispose-100',initial,final,heapBefore,heapAfter});
 }finally{await context.close()}
});
test('v0.8 browser: narrow/fractional views, DE/EN and reduced motion show readable demo and signed balances without overflow',async()=>{
 for(const [width,dpr]of [[320,1],[390,2],[320.5,1.25]]){const {p,context}=await h.lab({viewport:{width:Math.ceil(width),height:900},deviceScaleFactor:dpr});try{
  let f=p;if(width===320.5){await p.goto(h.url+'/__fractional');f=await(await p.$('iframe')).contentFrame();await h.ready(f)}
  await particles(f);await f.locator('#microstateDemo > summary').click();await f.locator('#macrostateComparison > summary').click();await f.locator('[data-language=en]').click();await f.locator('[data-demo-marker="0"]').press('Enter');
  async function layout(kind){const data=await f.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,focusVisible:document.activeElement.getClientRects().length>0,animations:[...document.querySelectorAll('.learning-panel *')].filter(e=>e.getAnimations().length).length}));assert(data.scroll<=data.width+1,JSON.stringify(data));assert(data.focusVisible);assert.equal(data.animations,0);h.measurements.push({kind,width,dpr,...data})}
  await layout('demo-layout');await f.locator('#microstateDemo').screenshot({path:resolve(h.output,'v08-demo-'+width+'.png')});
  await heat(f);await f.locator('#thermalBalance > summary').click();await f.locator('#thermalStep').click();await layout('balance-layout');await f.locator('#thermalBalance').screenshot({path:resolve(h.output,'v08-balance-'+width+'.png')});
 }finally{await context.close()}}
 assert.deepEqual(h.errors,[]);
});

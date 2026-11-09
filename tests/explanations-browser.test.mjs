import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {de,en} from '../dist/i18n.mjs';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;
before(async()=>{h=await browserHarness()});
after(async()=>{if(h){await writeFile(resolve(h.output,'v08-questions-measurements.json'),JSON.stringify({measurements:h.measurements,errors:h.errors},null,2));await h.close()}});
async function select(p,id){await p.locator('[data-tab="'+({objects:'extreme',temperature:'extreme',markers:'entropy',thermal:'entropy'}[id]??id)+'"]').click();if(['markers','thermal'].includes(id))await p.locator('[data-entropy-view="'+(id==='markers'?'particles':'thermal')+'"]').click()}
test('v0.8 browser: all six questions and predictions are voluntary; check, reveal, Escape and locate preserve models/drafts',async()=>{
 const {p,context}=await h.lab();try{
  await p.waitForFunction(()=>window.entrolabExplanations);
  await p.locator('.edit-options > summary').click();await p.locator('#velX').fill('42.7500');
  assert.equal(await p.locator('.learning-question').count(),6);
  for(const id of ['gravity','blackhole','objects','temperature','markers','thermal']){
   await select(p,id);const d=p.locator('#why-'+id);assert.equal(await d.getAttribute('open'),null);
   const before=await physical(p);await d.locator(':scope > summary').press('Enter');
   const prediction=d.locator('.knowledge-advanced');assert.equal(await prediction.getAttribute('open'),null);await prediction.locator(':scope > summary').click();
   await prediction.getByRole('button',{name:'Antwort prüfen',exact:true}).click();assert(await prediction.locator('[role=status]').textContent());assert(await prediction.locator('.learning-answer').isHidden());
   await prediction.locator('input[value=b]').check();await prediction.getByRole('button',{name:'Antwort prüfen',exact:true}).click();assert(await prediction.locator('.learning-answer').isVisible());
   await prediction.locator('input[value=a]').check();assert(await prediction.locator('.learning-answer').isHidden());
   await prediction.getByRole('button',{name:de['k.question.ui.show'],exact:true}).click();assert(await prediction.locator('.learning-answer').isVisible());
   await prediction.locator('input[value=a]').focus();await p.keyboard.press('Escape');assert.equal(await prediction.getAttribute('open'),null);assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SUMMARY');
   await d.locator('[data-locate-context]').click();assert.notEqual(await p.evaluate(()=>document.activeElement.tagName),'BODY');assert.deepEqual(await physical(p),before,id);
  }
  assert.equal(await p.locator('#velX').inputValue(),'42.7500');assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});
test('v0.8 browser: language preserves quiz selection, disclosure, feedback, focused radio and drafts',async()=>{
 const {p,context}=await h.lab();try{
  await p.locator('#why-gravity > summary').click();const d=p.locator('#why-gravity');await d.locator('.knowledge-advanced > summary').click();
  await d.locator('input[value=b]').check();await d.getByRole('button',{name:'Antwort prüfen',exact:true}).click();
  await d.locator('input[value=b]').focus();const before=await physical(p);
  await p.evaluate(async()=>{(await import('/i18n.mjs')).setLanguage('en')});
  assert.equal(await p.evaluate(()=>document.activeElement.id),'why-gravity-b');assert(await d.locator('input[value=b]').isChecked());assert(await d.locator('.learning-answer').isVisible());assert.match(await d.locator('.learning-feedback').textContent(),/different/i);
  await p.evaluate(async()=>{(await import('/i18n.mjs')).setLanguage('de')});assert.match(await d.locator('.learning-feedback').textContent(),/andere/i);assert.deepEqual(await physical(p),before);
  assert.deepEqual(await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]),[]);
 }finally{await context.close()}
});
test('v0.8 browser: open questions fit 320/390px with reduced motion, labels and no hidden keyboard focus',async()=>{
 for(const width of [320,390]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  for(const id of ['gravity','blackhole','objects','temperature','markers','thermal']){await select(p,id);const d=p.locator('#why-'+id);await d.locator(':scope > summary').click();await d.locator('.knowledge-advanced > summary').click();await d.locator('input[value=a]').check();await d.locator('[data-locate-context]').click();
   const data=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,focusVisible:document.activeElement.getClientRects().length>0}));assert(data.scroll<=data.width+1,JSON.stringify({id,...data}));assert(data.focusVisible);h.measurements.push({width,context:id,...data});
  }
  await p.screenshot({path:resolve(h.output,'v08-questions-'+width+'.png')});
 }finally{await context.close()}}
});

test('v0.8 browser: inline questions preserve completed prediction and calculator values; explicit Science navigation keeps legacy cancellation',async()=>{
 const {p,context}=await h.lab();try{
  await p.locator('details:has(#predictionOn) > summary').click();await p.locator('#predictionOn').check();
  await p.waitForFunction(()=>window.entrolab.inspect().forecast?.points?.length>0);
  const before=await p.evaluate(()=>{const s=window.entrolab.inspect();return {forecast:s.forecast,generation:s.predictionGeneration}});
  const values=await p.evaluate(()=>Object.fromEntries(['bhMass','bhSlider','extremeMass','kelvinInput','celsiusInput','temperatureTransferValue'].map(id=>[id,document.getElementById(id).value])));
  await p.locator('#why-gravity > summary').click();await p.locator('#why-gravity .knowledge-advanced > summary').click();await p.locator('#why-gravity input[value=a]').check();await p.locator('#why-gravity [data-locate-context]').click();
  assert.deepEqual(await p.evaluate(()=>{const s=window.entrolab.inspect();return {forecast:s.forecast,generation:s.predictionGeneration}}),before);
  assert.deepEqual(await p.evaluate(()=>Object.fromEntries(['bhMass','bhSlider','extremeMass','kelvinInput','celsiusInput','temperatureTransferValue'].map(id=>[id,document.getElementById(id).value]))),values);
  await p.locator('#question-model-gravity').click();assert.equal(await p.locator('.view.active').getAttribute('id'),'science');assert.equal(await p.evaluate(()=>window.entrolab.inspect().forecast),null);
 }finally{await context.close()}
});

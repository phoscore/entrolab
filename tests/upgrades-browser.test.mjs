import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;before(async()=>{h=await browserHarness()});after(async()=>{if(h){await writeFile(resolve(h.output,'v085-browser.json'),JSON.stringify({measurements:h.measurements,errors:h.errors},null,2));await h.close()}});
async function begin(p,id,quick=false){await p.locator('#helpToggle').click();await p.locator('#discovery-'+(quick?'quick':'deep')).selectOption(id);await p.locator('#discoveryStart-'+(quick?'quick':'deep')).click()}
test('v085 discovery: chooser and seven skippable paths preserve physical state and RNG',async()=>{const {p,context}=await h.lab();try{
 const before=await physical(p);await p.locator('#helpToggle').click();assert(await p.locator('#discoveryChooser').isVisible());
 for(const id of ['gravity','blackhole','objects','temperature','markers','thermal','science']){
  await p.locator('#discovery-deep').selectOption(id);await p.locator('#discoveryStart-deep').click();
  for(let i=0;i<(id==='thermal'?3:2);i++)await p.locator('#discoverySkip').click();
  await p.locator('#discoveryBack').click();await p.locator('#discoveryMenu').click();
 }
 assert.deepEqual(await physical(p),before);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'helpToggle');assert.equal(await p.locator('.discovery-highlight').count(),0);
}finally{await context.close()}});
test('v085 discovery: a genuine BH change is observed; resume, language and manual skip preserve drafts',async()=>{const {p,context}=await h.lab();try{
 await begin(p,'blackhole',true);await p.locator('#discoveryLocate').click();await p.keyboard.press('Enter');await p.locator('#discoveryNext').click();assert.equal(await p.locator('#discoveryNext').isEnabled(),false);
 const before=await physical(p);await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'bhMass');await p.locator('#bhMass').fill('2e30');await p.locator('#bhMass').press('Tab');assert(await p.locator('#discoveryNext').isEnabled());
 await p.locator('#helpClose').click();await p.locator('#helpToggle').click();assert.equal(await p.locator('#quickStart').getAttribute('data-step'),'1');await p.locator('[data-language=en]').click();assert.match(await p.locator('#discoveryProgress').textContent(),/Step 2 of 3/);assert.deepEqual(await physical(p),before);
 await p.locator('#discoverySkip').click();await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'why-blackhole-summary');await p.locator('#discoveryNext').click();assert(!(await p.locator('#quickStart').isVisible()));
}finally{await context.close()}});
test('v085 discovery: 320/390px, Reduced Motion, keyboard and repeated navigation have bounded UI',async()=>{
 for(const width of [320,390]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  await begin(p,'temperature');for(let i=0;i<25;i++){await p.locator('[data-tab=extreme]').press('Enter');await p.locator('[data-tab=blackhole]').press('Enter')}
  await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'extreme');await p.keyboard.press('Enter');await p.locator('#discoverySkip').click();await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'kelvinInput');
  const r=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,highlights:document.querySelectorAll('.discovery-highlight').length,animations:document.getAnimations().filter(a=>a.playState==='running').length}));assert(r.scroll<=width+1,JSON.stringify(r));assert(r.highlights<=1);assert.equal(r.animations,0);h.measurements.push({tour:width,...r});
 }finally{await context.close()}}
});

async function bh(p){await p.locator('[data-tab=blackhole]').click();await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().frames>0)}
const metrics=p=>p.locator('#bhRadius,#bhTemp,#bhPower,#bhLife').allTextContents();
test('v085 BH: two modes and optional angle preserve all four calculator values, models and independent Extreme drafts',async()=>{const {p,context}=await h.lab();try{
 await p.locator('[data-tab=extreme]').click();await p.locator('#extremeMass').fill('4.400e30');const draft=await p.locator('#extremeMass').inputValue();await bh(p);const m=await metrics(p),before=await physical(p);
 await p.locator('.bh-illustration details > summary').click();await p.locator('#bhViewAngle').fill('60');await p.locator('#bhViewDisk').uncheck();await p.locator('#bhView').selectOption('light');assert(await p.locator('#bhViewAngle').isDisabled());assert(await p.locator('#bhViewPause').isDisabled());
 await p.locator('[data-language=en]').click();assert.match(await p.locator('.bh-illustration figcaption').textContent(),/no calculated light paths/);assert.equal(await p.locator('#bhView').inputValue(),'light');await p.locator('[data-language=de]').click();assert.deepEqual(await metrics(p),m);assert.deepEqual(await physical(p),before);
 await p.locator('[data-tab=extreme]').click();assert.equal(await p.locator('#extremeMass').inputValue(),draft);await bh(p);await p.locator('#bhMass').fill('1');await p.locator('#bhMass').press('Tab');await p.locator('#bhView').selectOption('environment');assert.match(await p.locator('#bhViewMeaning').textContent(),/winzigen Massen/);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).angle,60);
}finally{await context.close()}});
test('v085 BH: single bounded RAF pauses offscreen, hidden, tab-switched and Reduced Motion without catch-up',async()=>{const {p,context}=await h.lab({reducedMotion:'no-preference'});try{
 await bh(p);await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);await p.waitForTimeout(350);const moving=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert(moving.frames>2&&moving.paintMs>=0);
 await p.locator('#bhViewPause').click();const paused=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,paused.frames);
 await p.locator('#bhViewPause').click();await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!window.entrolabBlackHoleView.inspect().scheduled);const off=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,off.frames);
 await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});const hidden=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,hidden.frames);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
 await p.emulateMedia({reducedMotion:'reduce'});const reduced=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert.equal(reduced.scheduled,false);assert.equal(reduced.paused,true);await p.waitForTimeout(250);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,reduced.frames);
 await p.locator('[data-tab=gravity]').click();assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).scheduled,false);h.measurements.push({bhLifecycle:{moving,paused,off,hidden,reduced}});
}finally{await context.close()}});
test('v085 BH: desktop/mobile DE/EN screenshots, DPR and 120-frame height stability',async()=>{
 for(const [width,dpr]of [[1360,1],[320,1],[390,2]]){const {p,context}=await h.lab({viewport:{width,height:900},deviceScaleFactor:dpr});try{await bh(p);
  for(const [mode,lang]of [['environment','de'],['light','en']]){await p.locator('#bhView').selectOption(mode);await p.locator('[data-language='+lang+']').click();await p.locator('.bh-illustration').screenshot({path:resolve(h.output,`v085-bh-${mode}-${width}-${lang}.png`)});
   assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);
  }
  const a=await p.locator('#bhIllustration').boundingBox();await p.evaluate(()=>new Promise(r=>{let n=0;function tick(){if(++n===120)r();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));const b=await p.locator('#bhIllustration').boundingBox();assert.equal(a.height,b.height);assert.equal(a.width,b.width);const v=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert(v.backing[0]<=Math.round(b.width*1.25));assert(v.backing[1]<=Math.round(b.height*1.25));h.measurements.push({bhSize:{width,dpr,a,b,backing:v.backing}});
 }finally{await context.close()}}
});
async function temperature(p){await p.locator('[data-tab=extreme]').click();await p.locator('#materialExplorer > summary').click()}
test('v085 materials: four substances, phases, references and limits do not mutate the independent heat/marker/gravity state',async()=>{const {p,context}=await h.lab();try{
 await temperature(p);const before=await physical(p);
 for(const [id,k,phase]of [['water','293.15','liquid'],['water','273.15','melting'],['ethanol','351.5','boiling'],['aluminium','933.473','melting'],['iron','3134','boiling'],['ethanol','1e9','outside']]){await p.locator('#materialA').selectOption(id);await p.locator('#kelvinInput').fill(k);assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),phase);assert.match(await p.locator('#materialCardA').textContent(),/101325 Pa/)}
 await p.locator('#materialSecond').check();await p.locator('#materialB').selectOption('iron');await p.locator('#kelvinInput').fill('293.15');assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),'liquid');assert.equal(await p.locator('#materialCardB').getAttribute('data-phase'),'solid');
 const current=await p.locator('#materialCardA').textContent();await p.locator('#kelvinInput').fill('-1');assert.equal(await p.locator('#materialCardA').textContent(),current);assert.deepEqual(await physical(p),before);await p.locator('[data-language=en]').click();assert.match(await p.locator('#materialCardA').textContent(),/Liquid/);assert.equal(await p.locator('#kelvinInput').inputValue(),'-1');assert.equal(await p.locator('#materialA').inputValue(),'ethanol');
}finally{await context.close()}});
test('v085 comparison: zero/tiny/huge, independent B drafts, native validation and language preserve source and heat bridge',async()=>{const {p,context}=await h.lab();try{
 await p.locator('[data-tab=extreme]').click();await p.locator('#temperatureCompare > summary').click();const before=await physical(p);await p.locator('#kelvinInput').fill('1e12');await p.locator('#comparisonKelvinB').fill('5e-324');assert.match(await p.locator('#temperatureComparisonResult').textContent(),/10\^335/);assert(!/Infinity|NaN/.test(await p.locator('#temperatureComparisonResult').textContent()));
 await p.locator('#comparisonKelvinB').fill('0');assert.match(await p.locator('#temperatureComparisonResult').textContent(),/nicht definiert/);await p.locator('#comparisonKelvinB').fill('1e13');const previous=await p.evaluate(()=>window.entrolabTemperatureContext.inspect());assert.equal(previous.b,0);assert(previous.invalid);
 await p.locator('[data-language=en]').click();assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'1e13');assert.equal(await p.locator('#comparisonKelvinB').evaluate(e=>e.validationMessage),await p.locator('#temperatureComparisonError').textContent());await p.locator('#temperaturePin').click();assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'1000000000000');assert.equal(await p.locator('#kelvinInput').inputValue(),'1e12');assert(await p.locator('#thermalTransfer').isDisabled());
 await p.locator('#celsiusInput').fill('-23.15');await p.locator('#celsiusInput').press('Tab');assert(await p.locator('#thermalTransfer').isEnabled());assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'1000000000000');assert.deepEqual(await physical(p),before);
}finally{await context.close()}});
test('v085 material and comparison: 320/390px keyboard, 50 language switches and screenshots retain exact drafts',async()=>{
 for(const width of [320,390]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  await temperature(p);await p.locator('#kelvinInput').fill('293.15');await p.locator('#materialSecond').check();await p.locator('#materialA').selectOption('water');await p.locator('#materialB').selectOption('iron');const before=await physical(p);
  for(let i=0;i<50;i++)await p.evaluate(async i=>(await import('/i18n.mjs')).setLanguage(i%2?'de':'en'),i);
  assert.equal(await p.locator('#materialA').inputValue(),'water');assert.equal(await p.locator('#materialB').inputValue(),'iron');assert.deepEqual(await physical(p),before);assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);
  await p.locator('#materialA').focus();await p.keyboard.press('ArrowDown');await p.keyboard.press('Tab');assert.notEqual(await p.evaluate(()=>document.activeElement.tagName),'BODY');await p.locator('#temperatureContext').screenshot({path:resolve(h.output,`v085-materials-${width}-de.png`)});
 }finally{await context.close()}}
});
test('v085 bounded lifecycle: 100 BH/context dispose-remount cycles retain listeners, buffers and physical state',async()=>{const {p,context}=await h.lab();try{
 await bh(p);const before=await physical(p),cdp=await context.newCDPSession(p);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');const start=await cdp.send('Memory.getDOMCounters');
 await p.evaluate(async()=>{const {initBlackHoleView}=await import('/blackhole-view.mjs'),{initTemperatureContext}=await import('/temperature-context.mjs');for(let i=0;i<100;i++){initBlackHoleView().dispose();initBlackHoleView();initTemperatureContext().dispose();initTemperatureContext()} });
 await cdp.send('HeapProfiler.collectGarbage');const end=await cdp.send('Memory.getDOMCounters');assert(end.jsEventListeners<=start.jsEventListeners+2,JSON.stringify({start,end}));assert(end.nodes<=start.nodes+5,JSON.stringify({start,end}));assert.deepEqual(await physical(p),before);assert.equal(await p.evaluate(()=>window.entrolabTemperature.inspect().subscriptions),1);assert.equal(await p.locator('#bhIllustration').count(),1);h.measurements.push({lifecycle:{start,end}});
}finally{await context.close()}});

test('v085 QCD: collapsed article, deep link, DE/EN and logical return preserve model snapshots',async()=>{const {p,context}=await h.lab();try{
 const before=await physical(p);await p.locator('[data-tab=science]').click();assert.equal(await p.locator('.knowledge-article').evaluate(e=>e.open),false);await p.locator('#article-index-proton').click();assert(await p.locator('#model-proton').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'model-proton');assert.match(await p.locator('#model-proton').textContent(),/ungelöst/);await p.locator('[data-language=en]').click();assert.match(await p.locator('#model-proton').textContent(),/without additional quark fields/);assert.match(await p.locator('#model-proton').textContent(),/not a separate substance/);await p.locator('#model-proton').focus();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'article-index-proton');assert.deepEqual(await physical(p),before);
 await p.goto(h.url+'/#model-proton');await h.ready(p);assert(await p.locator('#model-proton').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'model-proton');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'science');h.measurements.push({qcdSources:await p.locator('#model-proton [data-source]').count()});
}finally{await context.close()}});
test('v085 integration: all five views and six existing questions stay narrow and retain translations, one monster and model state',async()=>{
 for(const width of [320,390,1360]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  const before=await physical(p);for(const tab of ['gravity','blackhole','extreme','entropy','science']){await p.locator('[data-tab='+tab+']').click();await p.locator('[data-language=en]').click();assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);}
  assert.equal(await p.locator('.learning-question').count(),6);assert.equal(await p.locator('#creature').count(),1);assert.deepEqual(await physical(p),before);
  const missing=await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]);assert.deepEqual(missing,[]);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}}
});

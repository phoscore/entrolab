import {chooseLab} from './browser-lab-navigation.mjs';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
let h;before(async()=>{h=await browserHarness()});after(async()=>{if(h){await writeFile(resolve(h.output,'v085-browser.json'),JSON.stringify({measurements:h.measurements,errors:h.errors},null,2));await h.close()}});
async function begin(p,id,quick=false){await p.locator('#helpToggle').click();await p.locator('#discovery-'+(quick?'quick':'deep')).selectOption(id);await p.locator('#discoveryStart-'+(quick?'quick':'deep')).click()}
test('v085 discovery: chooser and seven skippable paths preserve physical state and RNG',async()=>{const {p,context}=await h.lab({legacyTour:true});try{
 const before=await physical(p);await p.locator('#helpToggle').click();assert(await p.locator('#discoveryChooser').isVisible());
 for(const id of ['gravity','blackhole','objects','temperature','markers','thermal','science']){
  await p.locator('#discovery-deep').selectOption(id);await p.locator('#discoveryStart-deep').click();
  for(let i=0;i<(id==='thermal'?3:2);i++)await p.locator('#discoverySkip').click();
  await p.locator('#discoveryBack').click();await p.locator('#discoveryMenu').click();
 }
 assert.deepEqual(await physical(p),before);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'helpToggle');assert.equal(await p.locator('.discovery-highlight').count(),0);
}finally{await context.close()}});
test('v085 discovery: a genuine BH change is observed; resume, language and manual skip preserve drafts',async()=>{const {p,context}=await h.lab({legacyTour:true});try{
 await begin(p,'blackhole',true);await p.locator('#discoveryLocate').click();await p.keyboard.press('Enter');await p.locator('#discoveryNext').click();assert.equal(await p.locator('#discoveryNext').isEnabled(),false);
 const before=await physical(p);await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'bhMass');await p.locator('#bhMass').fill('2e30');await p.locator('#bhMass').press('Tab');assert(await p.locator('#discoveryNext').isEnabled());
 await p.locator('#helpClose').click();await p.locator('#helpToggle').click();assert.equal(await p.locator('#quickStart').getAttribute('data-step'),'1');await p.locator('[data-language=en]').click();assert.match(await p.locator('#discoveryProgress').textContent(),/Step 2 of 3/);assert.deepEqual(await physical(p),before);
 await p.locator('#discoverySkip').click();await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'why-blackhole-summary');await p.locator('#discoveryNext').click();assert(!(await p.locator('#quickStart').isVisible()));
}finally{await context.close()}});
test('v085 discovery: 320/390px, Reduced Motion, keyboard and repeated navigation have bounded UI',async()=>{
 for(const width of [320,390]){const {p,context}=await h.lab({legacyTour:true,viewport:{width,height:900}});try{
  await begin(p,'temperature');for(let i=0;i<100;i++){await chooseLab(p,'temperature','Enter');await chooseLab(p,'blackhole','Enter')}
  await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'temperature');await p.keyboard.press('Enter');await p.locator('#discoverySkip').click();await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'kelvinInput');
  const r=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,highlights:document.querySelectorAll('.discovery-highlight').length,animations:document.getAnimations().filter(a=>a.playState==='running').length}));assert(r.scroll<=width+1,JSON.stringify(r));assert(r.highlights<=1);assert.equal(r.animations,0);h.measurements.push({tour:width,...r});
 }finally{await context.close()}}
});

async function bh(p){await chooseLab(p,'blackhole');await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().frames>0)}
const metrics=p=>p.locator('#bhRadius,#bhTemp,#bhPower,#bhLife').allTextContents();
test('v085 BH: two modes and optional angle preserve all four calculator values, models and independent Extreme drafts',async()=>{const {p,context}=await h.lab();try{
 await chooseLab(p,'extreme');await p.locator('#extremeMass').fill('4.400e30');await p.locator('#extremeMass').press('Tab');const draft=await p.locator('#extremeMass').inputValue();await bh(p);const m=await metrics(p),before=await physical(p);
 await p.locator('.bh-illustration details').filter({has:p.locator('#bhView')}).locator(':scope > summary').click();await p.locator('#bhViewAngle').fill('60');await p.locator('#bhViewDisk').uncheck();await p.locator('#bhView').selectOption('light');assert(await p.locator('#bhViewAngle').isDisabled());assert(await p.locator('#bhViewPause').isDisabled());
 await p.locator('[data-language=en]').click();assert.match(await p.locator('.bh-illustration figcaption').textContent(),/no calculated light paths/);assert.equal(await p.locator('#bhView').inputValue(),'light');await p.locator('[data-language=de]').click();assert.deepEqual(await metrics(p),m);assert.deepEqual(await physical(p),before);
 await chooseLab(p,'extreme');assert.equal(await p.locator('#extremeMass').inputValue(),draft);await bh(p);await p.locator('#bhMass').fill('1');await p.locator('#bhMass').press('Tab');await p.locator('#bhView').selectOption('environment');assert.match(await p.locator('#bhViewMeaning').textContent(),/winzigen Massen/);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).angle,60);
}finally{await context.close()}});
test('v085 BH: single bounded RAF pauses offscreen, hidden, tab-switched and Reduced Motion without catch-up',async()=>{const {p,context}=await h.lab({reducedMotion:'no-preference'});try{
 await bh(p);await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);await p.waitForTimeout(350);const moving=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert(moving.frames>2&&moving.paintMs>=0);
 await p.locator('#bhViewPause').click();const paused=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,paused.frames);
 await p.locator('#bhViewPause').click();await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!window.entrolabBlackHoleView.inspect().scheduled);const off=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,off.frames);
 await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});const hidden=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,hidden.frames);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
 await p.locator('#bhViewPause').focus();await p.emulateMedia({reducedMotion:'reduce'});try{await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().reduced&&window.entrolabBlackHoleView.inspect().paused,{},{timeout:5000})}catch(error){console.log('BH_MEDIA_FAILURE',JSON.stringify(await p.evaluate(()=>({view:window.entrolabBlackHoleView.inspect(),freshMedia:matchMedia('(prefers-reduced-motion: reduce)').matches,hidden:document.hidden,errors:document.getElementById('extreme').dataset.animating}))));throw error}const reduced=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert.equal(reduced.scheduled,false);assert.equal(reduced.paused,true);assert.equal(await p.evaluate(()=>document.activeElement.id),'bhView');await p.waitForTimeout(250);assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).frames,reduced.frames);
 await chooseLab(p,'gravity');assert.equal((await p.evaluate(()=>window.entrolabBlackHoleView.inspect())).scheduled,false);h.measurements.push({bhLifecycle:{moving,paused,off,hidden,reduced}});
}finally{await context.close()}});
test('v085 BH: desktop/mobile DE/EN screenshots, DPR and 120-frame height stability',async()=>{
 for(const [width,dpr]of [[1360,1],[320,1],[390,2]]){const {p,context}=await h.lab({viewport:{width,height:900},deviceScaleFactor:dpr});try{await bh(p);
  for(const [mode,lang]of [['environment','de'],['light','en']]){await p.locator('#bhView').selectOption(mode);await p.locator('[data-language='+lang+']').click();await p.locator('.bh-illustration').screenshot({path:resolve(h.output,`v085-bh-${mode}-${width}-${lang}.png`)});await p.locator('#bhView').focus();await p.screenshot({path:resolve(h.output,`v085-bh-${mode}-${width}-${lang}-viewport.png`)});
   assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);
  }
  const a=await p.locator('#bhIllustration').boundingBox();await p.evaluate(()=>new Promise(r=>{let n=0;function tick(){if(++n===120)r();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));const b=await p.locator('#bhIllustration').boundingBox();assert.equal(a.height,b.height);assert.equal(a.width,b.width);const v=await p.evaluate(()=>window.entrolabBlackHoleView.inspect());assert(v.backing[0]<=Math.round(b.width*1.25));assert(v.backing[1]<=Math.round(b.height*1.25));h.measurements.push({bhSize:{width,dpr,a,b,backing:v.backing}});
 }finally{await context.close()}}
});
async function temperature(p){await chooseLab(p,'temperature');await p.locator('#materialExplorer > summary').click()}
test('v085 materials: four substances, phases, references and limits do not mutate the independent heat/marker/gravity state',async()=>{const {p,context}=await h.lab();try{
 await temperature(p);const before=await physical(p);
 for(const [id,k,phase]of [['water','293.15','liquid'],['water','273.15','melting'],['ethanol','351.5','boiling'],['aluminium','933.473','melting'],['iron','3134','boiling'],['ethanol','1e9','outside']]){await p.locator('#materialA').selectOption(id);await p.locator('#kelvinInput').fill(k);assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),phase);assert.match(await p.locator('#materialCardA').textContent(),/101325 Pa/)}
 await p.locator('#materialSecond').check();await p.locator('#materialB').selectOption('iron');await p.locator('#kelvinInput').fill('293.15');assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),'liquid');assert.equal(await p.locator('#materialCardB').getAttribute('data-phase'),'solid');
 const current=await p.locator('#materialCardA').textContent();await p.locator('#kelvinInput').fill('-1');assert.equal(await p.locator('#materialCardA').textContent(),current);assert.deepEqual(await physical(p),before);await p.locator('[data-language=en]').click();assert.match(await p.locator('#materialCardA').textContent(),/Liquid/);assert.equal(await p.locator('#kelvinInput').inputValue(),'-1');assert.equal(await p.locator('#materialA').inputValue(),'ethanol');
}finally{await context.close()}});
test('v085 comparison: zero/tiny/huge, independent B drafts, native validation and language preserve source and heat bridge',async()=>{const {p,context}=await h.lab();try{
 await chooseLab(p,'temperature');await p.locator('#temperatureCompare > summary').click();const before=await physical(p);await p.locator('#kelvinInput').fill('1e12');await p.locator('#kelvinInput').press('Tab');const sourceDraft=await p.locator('#kelvinInput').inputValue();await p.locator('#comparisonKelvinB').fill('5e-324');assert.match(await p.locator('#temperatureComparisonResult').textContent(),/10\^335/);assert(!/Infinity|NaN/.test(await p.locator('#temperatureComparisonResult').textContent()));
 await p.locator('#kelvinInput').fill('0');await p.locator('#comparisonKelvinB').fill('300');assert.match(await p.locator('#temperatureComparisonResult').textContent(),/^A\/B = 0;/);await p.locator('#kelvinInput').fill('1e12');await p.locator('#kelvinInput').press('Tab');await p.locator('#comparisonKelvinB').fill('0');assert.match(await p.locator('#temperatureComparisonResult').textContent(),/nicht definiert/);await p.locator('#comparisonKelvinB').fill('1e13');const previous=await p.evaluate(()=>window.entrolabTemperatureContext.inspect());assert.equal(previous.b,0);assert(previous.invalid);
 await p.locator('#comparisonKelvinB').focus();await p.locator('[data-language=en]').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'comparisonKelvinB');assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'1e13');assert.equal(await p.locator('#comparisonKelvinB').evaluate(e=>e.validationMessage),await p.locator('#temperatureComparisonError').textContent());await p.locator('#comparisonKelvinB').fill('1e-324');assert.equal((await p.evaluate(()=>window.entrolabTemperatureContext.inspect())).b,0);assert.equal((await p.evaluate(()=>window.entrolabTemperatureContext.inspect())).invalid,true);assert.match(await p.locator('#temperatureComparisonError').textContent(),/underflow/);await p.locator('#temperaturePin').click();assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'1000000000000');assert.equal(await p.locator('#kelvinInput').inputValue(),sourceDraft);assert(await p.locator('#thermalTransfer').isDisabled());
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
 await cdp.send('HeapProfiler.collectGarbage');const end=await cdp.send('Memory.getDOMCounters');assert(end.jsEventListeners<=start.jsEventListeners+2,JSON.stringify({start,end}));assert(end.nodes<=start.nodes+5,JSON.stringify({start,end}));assert.deepEqual(await physical(p),before);assert.equal(await p.evaluate(()=>window.entrolabTemperature.inspect().subscriptions),2);assert.equal(await p.locator('#bhIllustration').count(),1);h.measurements.push({lifecycle:{start,end}});
}finally{await context.close()}});

test('v085 QCD: collapsed article, deep link, DE/EN and logical return preserve model snapshots',async()=>{const {p,context}=await h.lab();try{
 const before=await physical(p);await chooseLab(p,'science');assert.equal(await p.locator('.knowledge-article').evaluate(e=>e.open),false);await p.locator('#article-index-proton').click();assert(await p.locator('#model-proton').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'model-proton');assert.match(await p.locator('#model-proton').textContent(),/ungelöst/);await p.locator('[data-language=en]').click();assert.match(await p.locator('#model-proton').textContent(),/without additional quark fields/);assert.match(await p.locator('#model-proton').textContent(),/not a separate substance/);await p.locator('#model-proton').focus();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'article-index-proton');assert.deepEqual(await physical(p),before);
 await p.goto(h.url+'/?cold-qcd=1#model-proton');await h.ready(p);assert(await p.locator('#model-proton').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'model-proton');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'matter');h.measurements.push({qcdSources:await p.locator('#model-proton [data-source]').count()});
}finally{await context.close()}});
test('v085 integration: all five views and six existing questions stay narrow and retain translations, one monster and model state',async()=>{
 for(const width of [320,390,1360]){const {p,context}=await h.lab({viewport:{width,height:900}});try{
  const before=await physical(p);for(const tab of ['gravity','blackhole','extreme','temperature','entropy','science']){await chooseLab(p,tab);await p.locator('[data-language=en]').click();assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);}
  assert.equal(await p.locator('.learning-question').count(),6);assert.equal(await p.locator('#creature').count(),1);assert.deepEqual(await physical(p),before);
  const missing=await p.evaluate(async()=>[...(await import('/i18n.mjs')).missingKeys]);assert.deepEqual(missing,[]);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}}
});

test('v085 discovery: rejected empty/negative-underflow temperature never completes a real-action step',async()=>{const {p,context}=await h.lab({legacyTour:true});try{
 await begin(p,'temperature');await p.locator('#discoveryLocate').click();await p.keyboard.press('Enter');await p.locator('#discoveryNext').click();const before=await p.evaluate(()=>window.entrolabTemperature.read());
 for(const raw of ['','-0','-1e-324','1000000000001']){await p.locator('#kelvinInput').fill(raw);assert.equal(await p.locator('#discoveryNext').isEnabled(),false,raw);assert.equal(await p.evaluate(()=>window.entrolabTemperature.read()),before)}
 await p.locator('#kelvinInput').fill('320');assert(await p.locator('#discoveryNext').isEnabled());await p.locator('#discoveryNext').click();await p.locator('#discoveryLocate').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'why-temperature-summary');
}finally{await context.close()}});
test('v085 BH keyboard: selecting a mode retains focus on the real select and translates captions',async()=>{const {p,context}=await h.lab();try{
 await bh(p);await p.locator('#bhView').press('End');assert.equal(await p.locator('#bhView').inputValue(),'light');assert.equal(await p.evaluate(()=>document.activeElement.id),'bhView');await p.locator('#bhView').press('Home');assert.equal(await p.locator('#bhView').inputValue(),'environment');assert.equal(await p.evaluate(()=>document.activeElement.id),'bhView');
}finally{await context.close()}});

test('v085 materials: displayed temperature resolves aluminium band and both water boundary sides in DE/EN',async()=>{const {p,context}=await h.lab();try{
 await temperature(p);for(const lang of ['de','en']){await p.locator('[data-language='+lang+']').click();await p.locator('#materialA').selectOption('aluminium');const texts=[];
 for(const [k,phase]of [['933.472','solid'],['933.473','melting'],['933.474','liquid']]){await p.locator('#kelvinInput').fill(k);assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),phase);const text=await p.locator('#materialCardA > .hint').first().textContent();assert(text.includes(lang==='de'?k.replace('.',','):k));texts.push(text)}assert.equal(new Set(texts).size,3);
 await p.locator('#materialA').selectOption('water');for(const [k,phase]of [['273.15','melting'],['273.201','liquid']]){await p.locator('#kelvinInput').fill(k);assert.equal(await p.locator('#materialCardA').getAttribute('data-phase'),phase)}
 }
}finally{await context.close()}});

test('v085 review screenshots: desktop material comparison and compact chooser in DE/EN',async()=>{const {p,context}=await h.lab({legacyTour:true,viewport:{width:1440,height:1000}});try{
 await temperature(p);await p.locator('#kelvinInput').fill('293.15');await p.locator('#materialSecond').check();for(const lang of ['de','en']){await p.locator('[data-language='+lang+']').click();await p.locator('#materialExplorer').screenshot({path:resolve(h.output,`v085-materials-desktop-${lang}.png`)});await p.locator('#materialA').focus();await p.keyboard.press('Shift+Tab');await p.screenshot({path:resolve(h.output,`v085-materials-viewport-${lang}.png`)});}
 await p.locator('#helpToggle').click();await p.locator('#discoveryChooser').screenshot({path:resolve(h.output,'v085-discovery-chooser-en.png')});
}finally{await context.close()}});

test('v085 audit BH: disk-off freezes frames until real visual changes and resumes exactly one animation',async()=>{
 for(const width of [1360,320,390]){
  const {p,context}=await h.lab({viewport:{width,height:900},reducedMotion:'no-preference'});try{
   const inspect=()=>p.evaluate(()=>window.entrolabBlackHoleView.inspect());
   const visible=async()=>{await p.locator('#bhIllustration').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().seen)};
   await bh(p);const values=await metrics(p),before=await physical(p);
   await p.locator('.bh-illustration details').filter({has:p.locator('#bhView')}).locator(':scope > summary').click();
   const disk=p.locator('#bhViewDisk'),angle=p.locator('#bhViewAngle');
   await disk.uncheck();await visible();const staticView=await inspect();
   assert.equal(staticView.disk,false);assert.equal(staticView.scheduled,false);
   await angle.fill('40');await visible();await p.waitForTimeout(300);
   const idle=await inspect();assert.equal(idle.frames,staticView.frames);assert.equal(idle.time,staticView.time);assert.equal(idle.angle,40);
   await p.locator('[data-language=en]').click();await visible();
   assert.equal((await inspect()).frames,idle.frames+1);
   const translated=await inspect();
   await p.setViewportSize({width:width===1360?1120:width+10,height:900});
   await visible();await p.waitForFunction(n=>window.entrolabBlackHoleView.inspect().frames>n,translated.frames);
   await disk.check();await visible();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);
   const resumed=await inspect();await p.waitForFunction(n=>window.entrolabBlackHoleView.inspect().frames>=n+4,resumed.frames);
   await p.locator('#bhViewPause').click();await disk.uncheck();await disk.check();await visible();
   const paused=await inspect();assert.equal(paused.scheduled,false);assert.equal(paused.paused,true);
   await p.locator('#bhView').selectOption('light');await visible();assert.equal((await inspect()).scheduled,false);
   await p.locator('#bhView').selectOption('environment');await p.locator('#bhViewPause').click();await visible();await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().scheduled);
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>window.entrolabBlackHoleView.inspect().paused&&!window.entrolabBlackHoleView.inspect().scheduled);
   await p.locator('[data-language=de]').click();assert.deepEqual(await metrics(p),values);assert.deepEqual(await physical(p),before);
  }finally{await context.close()}
 }
});

test('v085 audit temperature: all eight presets explain their selection in DE/EN and manual input stays generic',async()=>{
 for(const [width,lang]of [[320,'de'],[390,'en']]){
  const {p,context}=await h.lab({viewport:{width,height:900}});try{
   await chooseLab(p,'temperature');await p.locator('[data-language='+lang+']').click();
   const before=await physical(p),meaning=p.locator('#temperatureContextMeaning'),texts=new Set();
   for(const [preset,de,en]of [['0',/Absoluter Nullpunkt/,/Absolute zero/],['.001',/1 mK/,/1 mK/],['.1',/Zehntel Kelvin/,/one tenth of a kelvin/],['2.725',/Mikrowellenhintergrundstrahlung/,/microwave background/],['293.15',/20 °C/,/20 °C/],['5900',/5772 K/,/5772 K/],['1e9',/Plasma/,/plasma/],['1e12',/nur für diese Laborskala/,/lab scale only/]]){
    await p.locator('[data-kelvin="'+preset+'"]').press('Enter');const text=await meaning.textContent();
    assert.match(text,lang==='de'?de:en);texts.add(text);
   }
   assert.equal(texts.size,8);
   await p.locator('[data-kelvin="2.725"]').click();const original=await meaning.textContent();
   await p.locator('#kelvinInput').fill('-1');assert.equal(await meaning.textContent(),original);
   const other=lang==='de'?'en':'de';await p.locator('[data-language='+other+']').click();
   assert.match(await meaning.textContent(),other==='de'?/Mikrowellenhintergrundstrahlung/:/microwave background/);
   await p.locator('#kelvinInput').fill('2.725');assert.match(await meaning.textContent(),other==='de'?/Gewählter Vergleichswert/:/Selected comparison value/);
   await p.locator('[data-kelvin="5900"]').click();await p.locator('#celsiusInput').fill('20');assert.match(await meaning.textContent(),other==='de'?/Gewählter Vergleichswert/:/Selected comparison value/);
   await p.locator('[data-kelvin="5900"]').click();await p.locator('#temperatureSlider').press('ArrowLeft');assert.match(await meaning.textContent(),other==='de'?/Gewählter Vergleichswert/:/Selected comparison value/);
   assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1);assert.deepEqual(await physical(p),before);
  }finally{await context.close()}
 }
});

test('v085 audit science: keyboard expansion of a different model and a glossary link both fulfill the promised action',async()=>{
 for(const lang of ['de','en']){
  const {p,context}=await h.lab({legacyTour:true});try{
   await p.locator('[data-language='+lang+']').click();const before=await physical(p);
   await begin(p,'science');await chooseLab(p,'science','Enter');await p.locator('#discoveryNext').click();
   const next=p.locator('#discoveryNext'),chapter=p.locator('#model-blackhole .knowledge-advanced > summary');
   assert.match(await p.locator('#discoveryText').textContent(),lang==='de'?/Begriffslink/:/term link/);
   await p.locator('#discoveryLocate').click();assert.equal(await next.isEnabled(),false);
   await p.locator('#article-index-proton').press('Enter');assert.equal(await next.isEnabled(),false);await p.keyboard.press('Escape');
   await chapter.press('Enter');assert.equal(await next.isEnabled(),true);
   assert.equal(await chapter.evaluate(e=>e===document.activeElement),true);
   await p.locator('#discoveryBack').click();await next.click();assert.equal(await next.isEnabled(),false);
   await chapter.press('Enter');assert.equal(await next.isEnabled(),false);
   await chapter.press('Enter');await p.locator('#discoveryBack').click();await next.click();
   const link=p.locator('#model-blackhole .knowledge-term-links a').first(),id=await link.getAttribute('data-explain');
   assert.equal(await next.isEnabled(),false);await link.press('Enter');assert.equal(await next.isEnabled(),true);
   assert.equal(await p.evaluate(()=>document.activeElement.id),id);
   await p.keyboard.press('Escape');assert.equal(await link.evaluate(e=>e===document.activeElement),true);
   await p.locator('#discoverySkip').click();await p.locator('#helpClose').click();
   assert.equal(await p.evaluate(()=>document.activeElement.id),'helpToggle');
   assert.deepEqual(await physical(p),before);
  }finally{await context.close()}
 }
});

test('v085 audit material: identical rounded labels with different phases show a boundary note only when needed',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900}});try{
  await temperature(p);const input=p.locator('#kelvinInput'),card=p.locator('#materialCardA');
  for(const lang of ['de','en']){
   await p.locator('[data-language='+lang+']').click();
   await input.fill('273.2000000000002');const first=await card.locator('.hint').first().textContent();
   assert.equal(await card.getAttribute('data-phase'),'melting');assert.equal(await card.locator('.material-rounding').count(),0);
   await input.fill('273.2000000000003');
   assert.equal(await card.locator('.hint').first().textContent(),first);assert.equal(await card.getAttribute('data-phase'),'liquid');
   assert.match(await card.locator('.material-rounding').textContent(),lang==='de'?/vor der Anzeigerundung/:/before display rounding/);
   assert.equal(await input.inputValue(),'273.2000000000003');
   await input.fill('5e-324');assert.equal(await card.getAttribute('data-phase'),'outside');
   await input.fill('1e12');assert.equal(await card.getAttribute('data-phase'),'outside');
   assert.equal(await card.locator('.material-rounding').count(),0);
  }
 }finally{await context.close()}
});

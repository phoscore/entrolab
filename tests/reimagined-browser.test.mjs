import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const select=(p,tab)=>p.locator('[data-tab='+tab+']').click();
const inspect=(p,name)=>p.evaluate(key=>window[key].inspect(),name);
const shot=(p,name)=>p.screenshot({path:resolve(h.output,'v09-'+name+'.png')});

test('v0.9 navigation: product title, retired tour, Matter order and cold temperature/QCD links',async()=>{
 const {p,context}=await h.lab();try{
  assert.equal(await p.title(),'Reincarnated as a Proton');
  assert.equal(await p.locator('#helpToggle,#quickStart,script[src="discovery.mjs"]').count(),0);
  assert.deepEqual(await p.locator('[data-tab]').evaluateAll(els=>els.map(e=>e.dataset.tab)),['gravity','blackhole','extreme','entropy','matter','science']);
  await p.goto(h.url+'/?v09temp=1#temperature');await h.ready(p);
  assert.equal(await p.locator('#extreme').evaluate(e=>e.classList.contains('active')),true);
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
  const before=await physical(p);await select(p,'extreme');await p.locator('#gasCanvas').scrollIntoViewIfNeeded();
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
  await select(p,'extreme');await p.locator('#gasCanvas').scrollIntoViewIfNeeded();
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!window.entrolabGas.inspect().scheduled);
  assert.equal(await p.locator('#gasPause').isDisabled(),true);
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
    ['extreme','.gas-lab','gas'],
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
    if(tab==='extreme'){await p.locator('#gasCanvas').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.entrolabGas.inspect().frames>0)}
    if(width!==320)await p.locator(element).first().screenshot({path:resolve(h.output,`v09-${name}-${width}.png`)});
   }
   assert.deepEqual(h.errors,[]);
  }finally{await context.close()}
 }
});

test('v0.9 Null: one figure, independent sequences, reduced motion and sampled frames',async()=>{
 const {p,context}=await h.lab({viewport:{width:1440,height:900},reducedMotion:'no-preference'});try{
  const before=await physical(p);const caption=p.locator('#creature .creature-fiction');
  for(const [label,id] of [['observer','nullPreviewObserver'],['rift','nullPreviewRift']]){
   await p.locator('#creaturePreferencesSummary').click();await p.locator('#'+id).click();
   await p.waitForFunction(kind=>{
    const f=document.getElementById('creature');
    return f.dataset.sequence===kind&&f.getAnimations({subtree:true}).length>=4;
   },label);
   await p.locator('#creature').evaluate(e=>{for(const a of e.getAnimations({subtree:true}))a.pause()});
   for(let i=0;i<11;i++){
    await p.locator('#creature').evaluate((e,progress)=>{for(const a of e.getAnimations({subtree:true}))a.currentTime=Number(a.effect.getTiming().duration)*progress},i/11);
    await p.locator('.null-art').screenshot({path:resolve(h.output,`v09-null-${label}-${String(i).padStart(2,'0')}.png`)});
   }
   assert.equal(await p.locator('#creature').count(),1);
   assert.match(await caption.textContent(),/Null/);
  }
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>!window.entrolabCreature.inspect().moving);
  assert.equal(await p.locator('#creature').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  assert.deepEqual(await physical(p),before);assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
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

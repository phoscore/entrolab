import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {browserHarness,physical} from './v08-browser-harness.mjs';
import {chooseLab} from './browser-lab-navigation.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const shot=(locator,id)=>locator.screenshot({path:join(h.output,'polish-b-'+id+'.png')});
const size=(p,n)=>p.locator('#entropyN').fill(String(n));
const questions=(p,id)=>p.locator('#'+id+' details.polish-b-panel').filter({has:p.locator('fieldset')});
const screenshots=['gravity','blackhole','extreme','temperature','entropy','matter','explorer','science'];

test('Physics for Everyone: localized disclosures, questions and live demonstrations',{timeout:90000},async()=>{
 const {p,context}=await h.lab({viewport:{width:1440,height:1000}});
 try{
  const before=await physical(p);
  for(const id of screenshots){
   await chooseLab(p,id);
   const group=questions(p,id);
   await group.locator('summary').press('Enter');
   assert((await group.locator('fieldset').count())>=1);
   await group.locator('input').first().check();
   assert((await group.getByRole('status').first().textContent()).length>30);
   if(id==='gravity')await shot(group,'question');
  }
  assert.deepEqual(await physical(p),before);
  const models=p.locator('#science .knowledge-simple');
  assert.equal(await models.count(),6);
  const model=models.first();
  await model.locator('summary').press('Enter');
  await shot(model,'model');
  await chooseLab(p,'entropy');
  await p.locator('#entropy [data-explain]').first().press('Enter');
  const term=p.locator('#guide-entropy + dd');
  await term.locator('.knowledge-simple summary').press('Enter');
  await term.locator('.knowledge-advanced summary').first().press('Enter');
  await shot(term,'glossary');
  await p.locator('#guideReturn').press('Enter');
  await chooseLab(p,'matter');
  const field=p.locator('details.polish-b-panel').filter({has:p.locator('#fieldCharge')});
  await field.locator('summary').press('Enter');
  const arrow=field.locator('svg path').last(),positive=await arrow.getAttribute('d');
  assert(positive);
  await p.locator('#fieldCharge').fill('-2');
  assert.notEqual(await arrow.getAttribute('d'),positive);
  await shot(field,'field');
  for(const id of ['fieldX','fieldY'])await p.locator('#'+id).fill('0');
  assert.equal(await arrow.getAttribute('d'),null);
  assert.match(await field.locator('[aria-live]').textContent(),/0,2/);
  await chooseLab(p,'blackhole');
  const singular=p.locator('#blackhole details.polish-b-panel').filter({has:p.getByText('Was bedeutet eine Singularität?',{exact:true})});
  await singular.locator('summary').press('Enter');
  await shot(singular,'singularities');
  await chooseLab(p,'extreme');
  const reference=p.locator('#extreme details.polish-b-panel').filter({has:p.locator('h3')});
  await p.locator('#extremeObject').selectOption('white');
  await reference.locator('summary').press('Enter');
  assert.match(await reference.locator('h3').textContent(),/Sirius B/);
  await shot(reference,'reference');
  await chooseLab(p,'temperature');
  const gas=p.locator('#gasExperiment');
  await gas.scrollIntoViewIfNeeded();
  await shot(gas,'gas');
  assert.equal(await p.evaluate(()=>entrolabGas.inspect().scheduled),false);
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.locator('#gasPause').click();
  await p.waitForFunction(()=>entrolabGas.inspect().frames>2);
  await chooseLab(p,'gravity');
  await p.waitForFunction(()=>!entrolabGas.inspect().scheduled);
  await p.locator('[data-language=en]').click();
  assert.match(await questions(p,'gravity').locator('summary').textContent(),/predict|happen/i);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('512 markers: native layouts, measured render work, motion and lifecycle',{timeout:90000},async()=>{
 const reports=[];
 for(const width of [1440,390,320]){
  const narrow=width<760;
  const {p,context}=await h.lab({viewport:{width,height:940},hasTouch:narrow});
  try{
   await chooseLab(p,'entropy',narrow?'tap':undefined);
   const stage=p.locator('#entropyChambers');
   const cdp=await context.newCDPSession(p);
   const counters=async()=>{await cdp.send('HeapProfiler.collectGarbage');return cdp.send('Memory.getDOMCounters')};
   const initial=await counters();
   if(narrow)await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const runs=[];
   for(const n of [8,16,32,64,128,256,512]){
    await size(p,n);
    const data=await p.evaluate(async n=>{
     const {distribution}=await import('/entropy.mjs');
     const measure=async task=>{
      const samples=[];
      for(let i=0;i<16;i++){
       const start=performance.now();await task();samples.push(performance.now()-start);
      }
      return samples.sort((a,b)=>a-b)[14];
     };
     const step=document.getElementById('entropyStep');
     return {n,modelP90Ms:await measure(()=>distribution(n)),
      updateAndLayoutP90Ms:await measure(()=>{step.click();step.getBoundingClientRect()}),
      frameP90Ms:await measure(()=>{step.click();return new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))})};
    },n);
    assert.equal(await p.locator('.entropy-marker').count(),n<=32?n:0);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    runs.push(data);
    if(width===1440&&[32,256,512].includes(n))await shot(stage,String(n));
   }
   await p.locator('#entropyReset').click();
   assert.equal(await p.evaluate(()=>entrolabEntropy.inspect().k),512);
   await shot(stage,width===1440?'extreme-state':String(width));
   const extreme=await p.locator('#entropyProbability').textContent();
   assert.match(extreme,/153|152/);
   await p.locator('.entropy-micro summary').press('Enter');
   assert.equal((await p.locator('#entropyMicrostate').textContent()).trim().split(/\s+/).length,512);
   for(let i=0;i<6;i++){
    await size(p,32);
    await size(p,512);
   }
   await stage.scrollIntoViewIfNeeded();
   await p.locator('#entropyPlay').click();
   await p.waitForFunction(()=>entrolabEntropy.inspect().steps>=2);
   await chooseLab(p,'matter');
   await p.waitForFunction(()=>!entrolabEntropy.inspect().scheduled);
   const hidden=await p.evaluate(()=>entrolabEntropy.inspect().steps);
   await p.waitForTimeout(600);
   assert.equal(await p.evaluate(()=>entrolabEntropy.inspect().steps),hidden);
   await chooseLab(p,'entropy');
   await p.locator('#entropyPlay').click();
   assert.equal(await p.evaluate(()=>entrolabEntropy.inspect().scheduled),false);
   const final=await counters();
   assert(final.nodes<initial.nodes+850,JSON.stringify({initial,final}));
   reports.push({width,cpuThrottle:narrow?4:1,initial,final,runs});
  }finally{await context.close()}
 }
 await writeFile(join(h.output,'polish-b-performance.json'),JSON.stringify(reports,null,2));
 console.log('Phase B performance',JSON.stringify(reports));
});

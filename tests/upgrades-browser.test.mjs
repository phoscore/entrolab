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

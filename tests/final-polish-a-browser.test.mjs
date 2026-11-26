import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
import {chooseLab} from './browser-lab-navigation.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const labs=['gravity','blackhole','extreme','temperature','entropy','matter','explorer','science'];
const titles=['Gravity Sandbox','Singularities','Extreme Objects','Extemp-lab','Entrolab','Materie & Felder','Cosmic Explorer','Modell & Quellen'];
const shot=(p,id,width,selector)=> (selector?p.locator(selector):p).screenshot({path:join(h.output,'polish-a-'+width+'-'+id+'.png')});
const active=p=>p.locator('main .view.active').getAttribute('id');
const noOverflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);

test('polish A: eight persistent lab views and their identity fit desktop and both touch widths',async()=>{
 for(const width of [1440,390,320]){
  const narrow=width<760,{p,context}=await h.lab({viewport:{width,height:920},hasTouch:narrow});
  try{
   const menu=p.locator('#labMenu'),tabs=p.locator('#labChoices .tab');
   assert.equal(await menu.isVisible(),narrow);
   assert.equal(await tabs.count(),8);
   assert.equal(await tabs.filter({visible:true}).count(),narrow?0:8);
   const logo=await p.locator('.brand .logo').boundingBox();
   const wordmark=await p.locator('.brand-name').boundingBox();
   assert(Math.abs(logo.y+logo.height/2-wordmark.y-wordmark.height/2)<=1);
   for(const lang of ['de','en']){
    const hit=await p.locator('[data-language='+lang+']').boundingBox();
    assert(hit.width>=44&&hit.height>=44);
   }
   await shot(p,'header',width,'header');
   if(narrow){
    await menu.press('Enter');
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    assert.equal(await tabs.filter({visible:true}).count(),8);
    assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'gravity');
    await shot(p,'menu-open',width,'header');
    await p.keyboard.press('End');
    assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'science');
    await p.keyboard.press('ArrowUp');
    assert.equal(await p.evaluate(()=>document.activeElement.dataset.tab),'matter');
    await p.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'labMenu');
    await menu.tap();
    await p.locator('[data-language=en]').tap();
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    await p.locator('[data-language=de]').tap();
   }
   const snapshot=await physical(p),colours=new Set();
   for(const [i,id] of labs.entries()){
    await chooseLab(p,id,narrow?'tap':undefined);
    assert.equal(await active(p),id);
    assert.equal(await p.locator('[data-tab='+id+']').getAttribute('aria-pressed'),'true');
    assert.equal(await p.locator('main .view.active h1').textContent(),titles[i]);
    assert.equal(await p.locator('#'+id+' .lab-tagline img').getAttribute('src'),'rules-null.svg');
    colours.add(await p.locator('#'+id+' .lab-tagline').evaluate(el=>getComputedStyle(el).color));
    assert(await noOverflow(p),width+' '+id);
    if(narrow){
     assert.equal(await menu.getAttribute('aria-expanded'),'false');
     assert.equal(await p.locator('#labMenuName').textContent(),titles[i]);
     assert.equal(await p.evaluate(()=>document.activeElement.id),'labMenu');
    }
    if(width===1440||['blackhole','temperature','entropy'].includes(id)){
     await p.evaluate(()=>window.scrollTo(0,0));
     await shot(p,id,width);
    }
   }
   assert.equal(colours.size,8);
   await p.locator('[data-language=en]').click();
   assert.equal(await p.locator('main .view.active h1').textContent(),'Models & Sources');
   assert.equal(await p.locator('#labMenuName').textContent(),'Models & Sources');
   assert.equal(await p.locator('footer').textContent(),'No plot armor. Just physics?');
   assert.deepEqual(await physical(p),snapshot);
  }finally{await context.close()}
 }
 assert.deepEqual(h.errors,[]);
});

test('polish A: cold #temperature, title translations, Back/Forward and cross-lab drafts',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900}});
 try{
  await p.goto(h.url+'/#temperature');await h.ready(p);
  assert.equal(await active(p),'temperature');
  assert.equal(await p.locator('#extreme #kelvinInput').count(),0);
  await p.locator('#kelvinInput').fill('425');
  await p.locator('#temperatureCompare > summary').click();
  await p.locator('#comparisonKelvinB').fill('365');
  await chooseLab(p,'blackhole','Enter');
  assert.equal(await p.evaluate(()=>location.hash),'#blackhole');
  await p.locator('#bhMass').fill('5e20');
  await p.locator('#bhMass').press('Tab');
  await chooseLab(p,'explorer');
  await p.waitForFunction(()=>window.entrolabExplorer);
  await p.goBack();
  assert.equal(await active(p),'blackhole');
  assert.equal(Number(await p.locator('#bhMass').inputValue()),5e20);
  await p.goBack();
  assert.equal(await active(p),'temperature');
  assert.equal(await p.locator('#kelvinInput').inputValue(),'425');
  assert.equal(await p.locator('#comparisonKelvinB').inputValue(),'365');
  await p.locator('[data-language=en]').click();
  assert.equal(await p.locator('#temperature h1').textContent(),'Extemp-lab');
  assert.match(await p.locator('#temperature .lab-tagline').textContent(),/comfort zone/);
  await p.goForward();
  assert.equal(await active(p),'blackhole');
  await p.goForward();
  assert.equal(await active(p),'explorer');
  await chooseLab(p,'temperature');
  await p.locator('#thermalTransfer').click();
  assert.equal(await active(p),'entropy');
  assert.equal(await p.evaluate(()=>location.hash),'#entropy');
  assert.equal(await p.locator('#thermalA').inputValue(),'425');
  await p.goBack();
  assert.equal(await active(p),'temperature');
  assert.equal(await p.locator('#kelvinInput').inputValue(),'425');
  await p.goto(h.url);await h.ready(p);
  await chooseLab(p,'matter');
  await p.goBack();
  assert.equal(await active(p),'gravity');
 }finally{await context.close()}
});

test('polish A: illustration controls expose a compact glyph inside a 44px keyboard target',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:900},reducedMotion:'no-preference'});
 try{
  for(const [id,button,image] of [['blackhole','#bhViewPause','#bhIllustration'],['extreme','#extremePlay','#extremeCanvas']]){
   await chooseLab(p,id);
   const toggle=p.locator(button),canvas=p.locator(image);
   await canvas.scrollIntoViewIfNeeded();
   if(id==='extreme'){await p.locator('#extremeFocus').click();await p.keyboard.press('Escape');}
   await toggle.focus();
   const before=await toggle.getAttribute('data-paused');
   assert.equal(before,'false');
   const r=await toggle.boundingBox(),box=await canvas.boundingBox();
   assert(r.width>=44&&r.height>=44&&r.x>=box.x&&r.y>=box.y&&r.x+r.width<=box.x+box.width+1&&r.y+r.height<=box.y+box.height+1);
   await toggle.press('Enter');
   assert.equal(await toggle.getAttribute('data-paused'),'true');
   assert.match(await toggle.getAttribute('aria-label'),/starten/);
   await p.locator('[data-language=en]').click();
   assert.match(await toggle.getAttribute('aria-label'),/play|start/i);
   await canvas.scrollIntoViewIfNeeded();
   await shot(p,'animation-'+id,390, id==='blackhole'?'.bh-image-frame':'.object-image-frame');
   await p.locator('[data-language=de]').click();
  }
  await chooseLab(p,'blackhole');
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>document.getElementById('bhViewPause').disabled&&!window.entrolabBlackHoleView.inspect().scheduled);
  await chooseLab(p,'extreme');
  assert.equal(await p.locator('#extreme').getAttribute('data-animating'),'false');
 }finally{await context.close()}
});

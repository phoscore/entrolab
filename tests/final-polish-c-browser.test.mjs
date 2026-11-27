import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {chooseLab} from './browser-lab-navigation.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const shot=(locator,id)=>locator.screenshot({path:join(h.output,'polish-c-'+id+'.png')});
const sn=p=>p.evaluate(()=>entrolabExplorer.inspect().neighborhood);
const labs=['gravity','blackhole','extreme','temperature','entropy','matter','explorer','science'];

test('all eight headings share their order, bilingual explanations and local input conventions',{timeout:120000},async()=>{
 for(const width of [1440,390,320]){
  const {p,context}=await h.lab({viewport:{width,height:980},hasTouch:width<760});
  try{
   for(const id of labs){
    await chooseLab(p,id,width<760?'tap':undefined);
    const lab=p.locator('#'+id),heading=lab.locator('.page-heading');
    assert.deepEqual(await heading.locator(':scope > div').evaluate(el=>[...el.children].map(x=>x.tagName).filter(x=>['H1','P','DETAILS'].includes(x))),['H1','P','DETAILS','P']);
    const help=lab.locator('.lab-help');
    assert.equal(await heading.evaluate(el=>el.nextElementSibling?.classList.contains('lab-help')),true);
    await shot(heading,'header-'+id+'-'+width);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await lab.locator('.input-convention').count(),['explorer','science'].includes(id)?0:1);
    assert.equal(await lab.locator('details.learning-question, details[data-lab-question]').count(),id==='entropy'?4:2);
    await p.locator('[data-language=en]').click();
    assert.match(await help.textContent(),/What does this mean/);
    assert.match(await p.locator('.brand small').textContent(),/v0\.9\.5 RC/);
    if(width===1440&&id==='explorer'){
     await help.locator(':scope > summary').press('Enter');
     await help.locator('.knowledge-simple summary').press('Enter');
     assert.match(await help.locator('.knowledge-simple').innerText(),/streetlights/);
     await shot(help,'explorer-help');
    }else if(width===1440&&id==='matter'){
     await help.press('Enter');
     assert.equal(await p.evaluate(()=>document.activeElement.id),'guide-energy');
     await p.locator('#guide-energy + dd .knowledge-simple summary').press('Enter');
     await shot(p.locator('#guide-energy + dd'),'knowledge-help');
     await p.locator('#guideReturn').press('Enter');
     assert.equal(await help.evaluate(el=>el===document.activeElement),true);
    }
    await p.locator('[data-language=de]').click();
   }
   await chooseLab(p,'gravity');
   assert.match(await p.locator('#mass').getAttribute('aria-describedby'),/mass-format/);
   await shot(p.locator('#mass-format'),'local-input-'+width);
   await chooseLab(p,'extreme');
   assert.equal(await p.locator('#extreme .lab-jump[href="#temperature"]').count(),0);
   if(width===1440)await shot(p.locator('#extreme .page-heading'),'no-extemp-link');
  }finally{await context.close()}
 }
 assert.deepEqual(h.errors,[]);
});

test('Chromium accessibility tree gives short and exact chamber labels in both languages at both extremes',async()=>{
 const {p,context}=await h.lab({viewport:{width:390,height:950},hasTouch:true});
 try{
  await chooseLab(p,'entropy','tap');
  const cdp=await context.newCDPSession(p);
  for(const lang of ['de','en']){
   await p.locator('[data-language='+lang+']').click();
   await p.locator('button[data-marker-count="512"]').press('Enter');
   for(const [key,left,right] of [['End',512,0],['Home',0,512]]){
    await p.locator('#entropyK').press(key);
    const chamber=p.locator('#entropyChambers'),name=await chamber.getAttribute('aria-label');
    assert(name.length<90&&name.includes(String(left))&&name.includes(String(right)));
    assert.equal(await p.getByRole('img',{name,exact:true}).count(),1);
    const readTree=async()=> (await cdp.send('Accessibility.getFullAXTree')).nodes;
    const closed=await readTree();
    assert(closed.some(x=>!x.ignored&&x.role.value==='image'&&x.name.value===name));
    assert.equal(closed.some(x=>!x.ignored&&/^([LR] ){511}[LR]$/.test(x.name?.value??'')),false);
    const summary=p.locator('.entropy-micro > summary');
    await summary.press('Enter');
    assert(await p.locator('#entropyMicrostate').isVisible());
    const opened=await readTree();
    const text=Array.from({length:512},()=>left?'L':'R').join(' ');
    assert(opened.some(x=>!x.ignored&&x.name?.value===text));
    await summary.press('Enter');
   }
  }
  await shot(p.locator('#entropyChambers'),'accessible-extreme-390');
 }finally{await context.close()}
});

test('motion symbols show two distinct bars, one play triangle and a disabled mark',{timeout:90000},async()=>{
 for(const width of [1440,390,320]){
  const {p,context}=await h.lab({viewport:{width,height:920},hasTouch:width<760,reducedMotion:'no-preference'});
  try{
   for(const [lab,id,stage] of [['blackhole','bhViewPause','bhIllustration'],['extreme','extremePlay','extremeCanvas']]){
    await chooseLab(p,lab);
    await p.locator('#'+stage).scrollIntoViewIfNeeded();
    const button=p.locator('#'+id);
    const icon=()=>button.evaluate(el=>{const css=getComputedStyle(el,'::after');return {clip:css.clipPath,image:css.backgroundImage,height:css.height};});
    const size=await button.boundingBox();
    assert(size.width>=44&&size.height>=44);
    assert.equal(await button.getAttribute('data-paused'),'false');
    assert.equal((await icon()).clip,'none');
    assert.match((await icon()).image,/transparent|rgba\(0, 0, 0, 0\)/);
    if(width===1440){
     const old=await p.addStyleTag({content:'.motion-toggle[data-paused=false]::after { background:currentColor; clip-path:polygon(0 0,34% 0,34% 100%,0 100%,0 0,66% 0,100% 0,100% 100%,66% 100%) }'});
     await shot(button,'motion-before-'+lab);
     await old.evaluate(el=>el.remove());
    }
    await shot(button,'motion-running-'+lab+'-'+width);
    await button.press('Enter');
    assert.equal(await button.getAttribute('data-paused'),'true');
    assert.match((await icon()).clip,/polygon/);
    assert.equal((await icon()).image,'none');
    await shot(button,'motion-paused-'+lab+'-'+width);
    if(lab==='blackhole'){
     await p.locator('#bhView').selectOption('light');
     assert(await button.isDisabled());
     assert.equal((await icon()).height,'2px');
     await shot(button,'motion-static-'+width);
     await p.locator('#bhView').selectOption('environment');
     assert.equal(await button.getAttribute('data-paused'),'true');
    }
   }
  }finally{await context.close()}
 }
});

test('Stellar Neighborhood moves in parsecs, retains science state and cleans up inputs',{timeout:120000},async()=>{
 const reports=[];
 for(const width of [1440,390,320]){
  const {p,context}=await h.lab({viewport:{width,height:980},hasTouch:width<760});
  try{
   const cdp=await context.newCDPSession(p);
   if(width<760)await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await chooseLab(p,'explorer');
   await p.waitForFunction(()=>entrolabExplorer?.inspect().atlas.total===50635);
   if(width===1440)await shot(p.locator('#exCanvas'),'edges-all-sky');
   await p.locator('#exNeighborhoodMode').click();
   const canvas=p.locator('#snCanvas');
   await canvas.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>entrolabExplorer.inspect().neighborhood?.visible===2753);
   await shot(canvas,'stellar-orbit-'+width);
   const search=p.locator('#snSearch');
   await search.fill('35227046884571776');await search.press('Enter');
   await p.waitForFunction(()=>entrolabExplorer.inspect().neighborhood.detailState==='ready');
   const distance=await p.locator('#snDistance').textContent();
   await p.locator('#snHome').click();
   const resources=async()=>{await cdp.send('HeapProfiler.collectGarbage');return cdp.send('Memory.getDOMCounters');};
   const initial=await resources();
   const sample=async()=>p.evaluate(async()=>{
    const canvas=document.getElementById('snCanvas'),draws=[],input=[];
    for(let i=0;i<12;i++){
     const start=performance.now();
     canvas.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowLeft':'ArrowRight',bubbles:true}));
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
     const state=entrolabExplorer.inspect().neighborhood;
     draws.push(state.duration);input.push(performance.now()-start);
    }
    return {draws,input};
   });
   await canvas.scrollIntoViewIfNeeded();
   const orbit=await sample();
   const toggle=p.locator('#snFree');
   await toggle.click();
   assert.match(await p.locator('#snFreeSpeedText').textContent(),/Lj.*Sekunde/);
   const enter=await sn(p);
   assert(enter.free.position.every(Number.isFinite));
   await p.locator('#snFreeSpeed').fill('8');
   if(width===1440){
    await canvas.focus();
    await p.keyboard.down('w');
    try{
     await p.waitForFunction(()=>Math.hypot(...entrolabExplorer.inspect().neighborhood.free.position)<23);
    }finally{await p.keyboard.up('w');}
    for(const key of ['d','e']){
     const old=(await sn(p)).free.position;
     await p.keyboard.down(key);
     try{
      await p.waitForFunction(old=>entrolabExplorer.inspect().neighborhood.free.position.some((x,i)=>Math.abs(x-old[i])>.1),old);
     }finally{await p.keyboard.up(key);}
    }
   }else{
    const button=p.locator('#snFreeControls [data-free-direction=KeyW]');
    await button.scrollIntoViewIfNeeded();
    const box=await button.boundingBox(),touch={x:box.x+box.width/2,y:box.y+box.height/2};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
    try{
     await p.waitForFunction(old=>entrolabExplorer.inspect().neighborhood.free.position.some((x,i)=>Math.abs(x-old[i])>.01),enter.free.position);
    }finally{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    await shot(p.locator('#snFreeControls'),'stellar-touch-'+width);
   }
   await shot(canvas,'stellar-free-'+width);
   const beforeLook=(await sn(p)).free;
   const box=await canvas.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+40,y+23,{steps:4});await p.mouse.up();
   const looked=(await sn(p)).free;
   assert.notEqual(looked.yaw,beforeLook.yaw);
   assert.deepEqual(looked.position,beforeLook.position);
   await shot(canvas,'stellar-look-'+width);
   const free=await sample();
   assert.equal(await p.locator('#snDistance').textContent(),distance);
   assert.equal((await sn(p)).total,2753);
   assert((await sn(p)).markers<=(width<760?1050:2200));
   await canvas.focus();await p.keyboard.down('w');
   await p.locator('#snSearch').focus();
   const stopped=(await sn(p)).free.position;await p.waitForTimeout(120);
   assert.deepEqual((await sn(p)).free.position,stopped);
   await p.keyboard.up('w');
   await p.locator('#snSun').click();
   await toggle.click();
   await p.locator('#snHome').click();
   await canvas.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>entrolabExplorer.inspect().neighborhood.sunVisible);
   await shot(canvas,'stellar-sun-return-'+width);
   await toggle.evaluate(button=>{for(let i=0;i<100;i++)button.click()});
   await p.waitForFunction(()=>!entrolabExplorer.inspect().neighborhood.scheduled);
   const idle=await sn(p);
   await p.waitForTimeout(150);
   assert.equal((await sn(p)).draws,idle.draws);
   const final=await resources();
   assert(final.nodes<initial.nodes+250);
   assert(final.jsEventListeners<=initial.jsEventListeners+5);
   reports.push({width,throttle:width<760?4:1,orbit,free,initial,final,
    markerCandidates:idle.visible,drawn:idle.markers,catalogueBytes:idle.positionBytes,canvasBytes:idle.canvasBytes,cycles:100});
  }finally{await context.close()}
 }
 await writeFile(join(h.output,'polish-c-performance.json'),JSON.stringify(reports,null,2));
 assert.deepEqual(h.errors,[]);
});

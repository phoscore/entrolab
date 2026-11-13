import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {browserHarness,physical} from './v08-browser-harness.mjs';
import {measureNull} from './measure-null.mjs';
import {checkRealVisibility} from './null-real-visibility.mjs';

let h;
before(async()=>{h=await browserHarness()});
after(async()=>{await h?.close()});
const inspect=p=>p.evaluate(()=>window.entrolabCreature.inspect());
const tab=(p,id)=>p.locator('[data-tab='+id+']').click();
const art=p=>p.locator('#creature');
const frames=p=>art(p).evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.animationName));
const sky=p=>p.locator('#cosmicBackground').evaluate(e=>getComputedStyle(e,'::before').animationPlayState);

async function controlled(p,roll=.85){
 await reset(p);
 await p.evaluate(async roll=>{
  const {initCreature}=await import('/creature-ui.mjs');
  initCreature().dispose();
  const timers=new Map();
  let now=0,serial=0,rolls=[.5,roll,.5];
  window.nullAudit={
   mount(){return initCreature(document,{
    clock:()=>now,random:()=>rolls.shift()??roll,storage:null,
    schedule(fn,ms){timers.set(++serial,{fn,at:now+ms});return serial},
    cancel(id){timers.delete(id)},
   })},
   tick(){
    const [id,{fn,at}]=timers.entries().next().value;
    timers.delete(id);
    now=at;
    fn();
   },
   pending:()=>timers.size,
  };
  window.nullAudit.mount();
 },roll);
 await p.waitForFunction(()=>window.nullAudit.pending()===1,null,{timeout:3500});
}
const advance=p=>p.evaluate(()=>window.nullAudit.tick());
const reset=p=>p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});

test('Null: autonomous, finite Observer, Glitch Entrance, Curiosity and Mischief use independent joints',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  const baseline=await physical(p);
  for(const [roll,name,key] of [[.85,'observer','null-observer'],[.31,'glitch','null-assemble'],[.48,'curiosity','null-listen'],[.19,'mischief','null-catch-left']]){
   await controlled(p,roll);
   assert.equal((await inspect(p)).visible,false);
   await advance(p);
   assert.equal((await inspect(p)).sequence,name);
   const animations=await frames(p);
   for(const expected of [key,'null-breath','null-blink','null-gaze','null-tail'])assert(animations.includes(expected),expected);
   assert.equal(await p.locator('#creature:visible').count(),1);
   const matrices=await art(p).evaluate(e=>{
    const changes=[];
    for(const time of [0.34,0.53]){
     for(const a of e.getAnimations({subtree:true})){
      a.pause();
      a.currentTime=Number(a.effect.getTiming().duration)*time;
     }
     changes.push(['.null-head','.null-left-hand','.null-right-hand','.null-gaze'].map(s=>getComputedStyle(e.querySelector(s)).transform));
    }
    return changes;
   });
   assert(matrices[0].every((m,i)=>m!==matrices[1][i]),name);
   if(name==='glitch')await art(p).evaluate(e=>{
    for(const a of e.getAnimations({subtree:true})){
     a.currentTime=Number(a.effect.getTiming().duration)*(a.animationName==='null-assemble'?.31:.095);
    }
   });
   if(name==='glitch'||name==='observer'){
    await p.screenshot({path:join(h.output,'null-'+name+'-desktop.png')});
   }
   if(process.env.GITHUB_ACTIONS==='true'){
    const preview=await p.locator('.null-slot').screenshot({scale:'css'});
    console.log('Null visual '+name+' '+preview.toString('base64'));
   }
   await advance(p);
   assert.equal((await inspect(p)).visible,false);
   assert.equal((await inspect(p)).timers,1);
   assert.equal((await frames(p)).length,0);
  }
  assert.deepEqual(await physical(p),baseline);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('Null: hidden page, offscreen, editors, guide and focus cancel animation and timers',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await controlled(p);await advance(p);
  await p.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal((await inspect(p)).visible,false);
  assert.equal((await inspect(p)).timers,0);
  assert.deepEqual(await frames(p),[]);
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
  assert.equal((await inspect(p)).visible,false);
  await advance(p);
  await p.locator('footer').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===0);
  assert.equal((await inspect(p)).visible,false);
  assert.deepEqual(await frames(p),[]);
  await reset(p);
  await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===1);
  await advance(p);
  await tab(p,'extreme');
  await p.locator('#extremeMass').evaluate(e=>e.focus({preventScroll:true}));
  assert.equal((await inspect(p)).visible,false);
  assert.equal((await inspect(p)).timers,0);
  assert.equal(await p.locator('#extremeMass').evaluate(e=>document.activeElement===e),true);
  await p.locator('#extremeMass').evaluate(e=>e.blur());
  await p.locator('#physicsGuide > summary').click();
  assert.equal((await inspect(p)).visible,false);
  assert.equal((await inspect(p)).timers,0);
  await p.locator('#physicsGuide > summary').click();
  await p.locator('#extremeFocus').click();
  assert.equal((await inspect(p)).visible,false);
  assert.equal((await inspect(p)).timers,0);
  await p.keyboard.press('Escape');
  await reset(p);
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>window.entrolabCreature.inspect().sequence==='still');
  assert.deepEqual(await frames(p),[]);
  assert.equal((await inspect(p)).timers,0);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('Null: quiet general preference persists and pauses the sky in DE and EN',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await p.locator('#physicsGuide > summary').click();
  const toggle=p.locator('#decorativeMotion');
  assert.equal(await toggle.textContent(),'Dekorative Bewegung');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  assert.equal((await inspect(p)).mode,'off');
  assert.equal((await inspect(p)).timers,0);
  assert.equal(await sky(p),'paused');
  await p.locator('[data-language=en]').click();
  assert.equal(await toggle.textContent(),'Decorative motion');
  await p.reload();await h.ready(p);
  assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  assert.equal((await inspect(p)).mode,'off');
  await p.locator('#physicsGuide > summary').click();
  await toggle.click();
  assert.equal(await sky(p),'running');
  await p.locator('#physicsGuide > summary').click();
  await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===1);
  assert.equal(await p.locator('.header-tools #decorativeMotion').count(),0);
  assert.equal(await p.locator('footer').textContent(),'No plot armor. Just physics.');
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('Null: mobile and desktop art neither shifts the lab nor intersects guide text or input hints',async()=>{
 for(const width of [320,390,1440]){
  const {p,context}=await h.lab({viewport:{width,height:900},deviceScaleFactor:2,reducedMotion:'no-preference'});
  try{
   await controlled(p);
   const placement=()=>p.evaluate(()=>{
    const section=document.querySelector('.view.active').getBoundingClientRect(),slot=document.querySelector('.null-slot').getBoundingClientRect();
    const range=document.createRange();
    range.selectNodeContents(document.querySelector('#physicsGuide > summary > span:first-child'));
    const text=range.getBoundingClientRect();
    const hint=document.querySelector('.input-convention').getBoundingClientRect();
    return {section:[section.x,section.y,section.width],safe:text.right<slot.left&&slot.bottom<=hint.top,
     overflow:document.documentElement.scrollWidth>innerWidth+1,hit:!!document.elementFromPoint(slot.left+slot.width/2,slot.top+slot.height/2)?.closest('.null-slot')};
   });
   const before=await placement();
   await advance(p);
   assert.deepEqual(await placement(),before);
   assert.equal(before.safe,true,width);
   assert.equal(before.hit,false);
   assert.equal(before.overflow,false);
   assert.equal(await p.locator('.null-slot').getAttribute('aria-hidden'),'true');
   assert.equal(await art(p).locator('img').count(),0);
   if(width===390){
    await art(p).evaluate(e=>{for(const a of e.getAnimations({subtree:true})){a.pause();a.currentTime=Number(a.effect.getTiming().duration)*.45}});
    await p.screenshot({path:join(h.output,'null-observer-390.png')});
   }
  }finally{await context.close()}
 }
});

test('Null: hours of visits, repeated navigation and mount/dispose keep one owner and stable model states',async()=>{
 const {p,context}=await h.lab({reducedMotion:'no-preference'});
 try{
  await controlled(p);
  const before=await physical(p);
  const cd=await context.newCDPSession(p);
  await cd.send('HeapProfiler.collectGarbage');
  const counters=await cd.send('Memory.getDOMCounters');
  for(let i=0;i<3;i++)for(const id of ['blackhole','extreme','entropy','matter','science','gravity'])await tab(p,id);
  await reset(p);
  await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===1);
  const stats=await p.evaluate(async()=>{
   const audit=window.nullAudit,{initCreature}=await import('/creature-ui.mjs');
   let maxTimers=0,maxFigures=0;
   for(let i=0;i<500;i++){
    audit.tick();
    maxTimers=Math.max(maxTimers,audit.pending());
    maxFigures=Math.max(maxFigures,document.querySelectorAll('#creature:not([hidden])').length);
   }
   const visits=window.entrolabCreature.inspect().visits;
   for(let i=0;i<100;i++){
    initCreature().dispose();
    if(audit.pending())throw Error('timer survived dispose');
    audit.mount();
   }
   return {visits,maxTimers,maxFigures,slots:document.querySelectorAll('.null-slot').length,pending:audit.pending()};
  });
  assert.equal(stats.visits,250);
  assert.deepEqual({...stats,visits:0},{visits:0,maxTimers:1,maxFigures:1,slots:1,pending:1});
  await cd.send('HeapProfiler.collectGarbage');
  const after=await cd.send('Memory.getDOMCounters');
  assert.equal(after.documents,counters.documents);
  assert(after.jsEventListeners<=counters.jsEventListeners+5,JSON.stringify({counters,after}));
  assert(after.nodes<=counters.nodes+35,JSON.stringify({counters,after}));
  assert.deepEqual(await physical(p),before);
  assert.deepEqual(h.errors,[]);
 }finally{await context.close()}
});

test('Null: both favicon eyes remain distinct in real Chromium at 16 and 32 pixels',async()=>{
 const {p,context}=await h.lab();
 try{
  const results=await p.evaluate(async()=>{
   const icon=new Image();
   icon.src=document.querySelector('link[rel=icon]').href;
   await icon.decode();
   return [16,32].map(size=>{
    const cv=document.createElement('canvas');cv.width=cv.height=size;
    const ctx=cv.getContext('2d');ctx.drawImage(icon,0,0,size,size);
    const pixel=(x,y)=>Array.from(ctx.getImageData(x*size/16,y*size/16,1,1).data);
    const white=([r,g,b])=>r>160&&g>150&&b>145;
    const lit=(x1,x2)=>{let n=0;for(let y=4;y<=8;y++)for(let x=x1;x<=x2;x++)n+=Number(white(pixel(x,y)));return n;};
    return {size,left:lit(3,7),right:lit(8,12),url:icon.src};
   });
  });
  for(const x of results){assert(x.url.endsWith('/favicon.svg'));assert(x.left>=3&&x.right>=3,JSON.stringify(x));}
  await p.evaluate(()=>{
   const strip=document.createElement('div');
   strip.id='null-icon-review';
   strip.style.cssText='position:fixed;top:0;left:0;z-index:99999;display:flex;gap:10px;align-items:center;padding:8px;background:#171522';
   for(const size of [16,32]){
    const image=new Image(size,size);
    image.src=document.querySelector('link[rel=icon]').href;
    strip.append(image);
   }
   document.body.append(strip);
  });
  const preview=await p.locator('#null-icon-review').screenshot({scale:'css'});
  if(process.env.GITHUB_ACTIONS==='true')console.log('Null visual favicon '+preview.toString('base64'));
 }finally{await context.close()}
});

test('Null: genuine Chromium tab activation suspends the rig and resumes with a new rest',async t=>checkRealVisibility(h,t));

test('Null: comparative Chromium cost against released Phase A',async t=>measureNull(h,t));

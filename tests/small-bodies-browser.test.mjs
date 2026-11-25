import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {RELEASE,parseSmallDate} from '../dist/explorer/small-bodies-spec.mjs';

let h;
before(async()=>{h=await browserHarness();});
after(async()=>{await h?.close();});
const solar=p=>p.evaluate(()=>window.entrolabExplorer.inspect().solar);
const click=(p,id)=>p.locator(id).click();
const canvas=p=>p.locator('#solCanvas');
const shot=(p,id,selector='.ex-solar-map')=>p.locator(selector).screenshot({path:join(h.output,'beyond-the-planets-'+id+'.png')});
const reviewImages=[
  ['overview','Overview · four groups'],['main-belt','Asteroid belt'],['kuiper','Kuiper Belt and TNOs'],
  ['dwarf','Ceres'],['halley','Halley · archived orbital arc'],['return','Return to planets'],
  ['390','390 CSS px'],['320','320 CSS px'],['controls-320','320 px controls'],['inspector-320','320 px inspector'],
];
async function contactSheet(page){
  const sources=await Promise.all(reviewImages.map(async ([name,label])=>({
    label,source:'data:image/png;base64,'+
      (await readFile(join(h.output,'beyond-the-planets-'+name+'.png'))).toString('base64'),
  })));
  const encoded=await page.evaluate(async sources=>{
    const cols=2, tileWidth=330, tileHeight=200;
    const canvas=document.createElement('canvas');
    canvas.width=tileWidth*cols;
    canvas.height=tileHeight*Math.ceil(sources.length/cols);
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#0a101b';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font='13px sans-serif';
    for(const [i,{label,source}] of sources.entries()){
      const img=new Image();
      img.src=source;await img.decode();
      const scale=Math.min((tileWidth-14)/img.width,(tileHeight-28)/img.height);
      const x=i%cols*tileWidth+7, y=Math.floor(i/cols)*tileHeight;
      ctx.fillStyle='#e2eaf6';ctx.fillText(label,x,y+17);
      ctx.drawImage(img,x,y+22,img.width*scale,img.height*scale);
    }
    return canvas.toDataURL('image/jpeg',.78).split(',')[1];
  },sources);
  await writeFile(join(h.output,'beyond-the-planets-contact-sheet.jpg'),Buffer.from(encoded,'base64'));
  // Keep the visual check accessible when an Actions ZIP cannot be mounted.
  if(process.env.GITHUB_ACTIONS==='true'){
    for(let i=0;i<encoded.length;i+=1700)console.log('BEYOND_REVIEW_JPEG '+encoded.slice(i,i+1700));
  }
}


async function settle(p){
  await canvas(p).scrollIntoViewIfNeeded();
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function openSolar(p){
  await click(p,'[data-tab=explorer]');
  await click(p,'#exSolarMode');
  await settle(p);
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.length>=9);
}
async function loaded(p,group){
  await p.waitForFunction(group=>window.entrolabExplorer.inspect().solar.beyond?.loaded.includes(group),group);
}
async function select(p,id){await p.locator('#smallTarget').selectOption(id);await settle(p);}
async function setDate(p,value){
  const date=p.locator('#solDate');
  await date.fill(value);
  await date.dispatchEvent('change');
  await settle(p);
}
function restored(snapshot,initial){
  for(const key of ['view','day','space','camera','selected','reference','trails','galactic','system'])
    assert.deepEqual(snapshot[key],initial[key],key);
}

test('small-body mode, guide layers, orbital arcs, native screenshots and mobile controls',async()=>{
  for(const width of [1440,390,320]){
    const mobile=width<500;
    const {p,context}=await h.lab({viewport:{width,height:1050},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    try{
      const fetched=[];
      p.on('request',r=>{if(r.url().includes('/'+RELEASE+'/'))fetched.push(r.url());});
      await openSolar(p);
      const baseline=await solar(p);
      assert.equal(fetched.length,0);
      await click(p,'#solBeyond');
      await loaded(p,'dwarf');await settle(p);
      assert.deepEqual((await solar(p)).beyond.groups,['dwarf']);
      assert(await p.locator('#solPlay').isDisabled());
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.equal(fetched.length,1);
      if(mobile){
        await shot(p,String(width));
        if(width===320){
          await select(p,'ceres');
          await shot(p,'controls-320','#beyondControls');
          await shot(p,'inspector-320','#smallInspector');
        }
      }else{
        for(const group of ['asteroid','tno','comet']){
          await p.locator(`[data-beyond-group=${group}]`).check();
          await loaded(p,group);
        }
        await p.locator('[data-beyond-belt=asteroid]').check();
        await p.locator('[data-beyond-belt=tno]').check();
        await click(p,'#solFit');await settle(p);
        assert((await solar(p)).markers.some(m=>m.id==='sedna'));
        await shot(p,'overview');
        await shot(p,'kuiper');
        await click(p,'#smallBeltFit');await settle(p);
        assert((await solar(p)).markers.some(m=>m.id==='vesta'));
        await shot(p,'main-belt');
        await select(p,'pluto');
        assert.equal((await solar(p)).selected,'pluto');
        assert(await p.locator('#solOpenSelectedSystem').isHidden());
        await select(p,'ceres');
        assert.match(await p.locator('#smallClass').textContent(),/Zwergplanet/);
        assert.match(await p.locator('#smallDistance').textContent(),/AU/);
        await shot(p,'dwarf','#smallInspector');
        await select(p,'halley');
        await click(p,'#smallArcFit');await settle(p);await shot(p,'halley');
        await click(p,'[data-language=en]');
        assert.match(await p.locator('#smallClass').textContent(),/Comet/);
        await setDate(p,'2061-07-28');
        assert.equal((await solar(p)).day,parseSmallDate('2061-07-28'));
        assert(await p.locator('#smallPlanetWindow').isVisible());
        assert.match(await p.locator('#smallDistance').textContent(),/AU/);
        await click(p,'#solNext');
        assert.equal((await solar(p)).day,parseSmallDate('2061-07-29'));
        await select(p,'ceres');
        assert.equal(await p.locator('#smallDistance').textContent(),'—');
        assert(await p.locator('#smallFirst').isVisible());
        assert(!(await solar(p)).markers.some(m=>m.id==='ceres'));
        await click(p,'#smallFirst');await settle(p);
        assert.match(await p.locator('#smallDistance').textContent(),/AU/);
        await p.locator('[data-beyond-group=tno]').uncheck();
        assert.equal(await p.locator('#smallTarget option[value=sedna]').count(),0);
      }
      await click(p,'#solBeyond');await settle(p);
      restored(await solar(p),baseline);
      if(!mobile)await shot(p,'return');
      if(width===320)await contactSheet(p);
      assert.equal(fetched.length,mobile?1:4);
      assert(fetched.every(uri=>uri.startsWith(h.url)));
    }finally{await context.close();}
  }
  assert.deepEqual(h.errors,[]);
});

test('small-body integrity retry and repeated view lifecycle',async()=>{
  const {p,context}=await h.lab();
  try{
    let fail=true;
    await p.route(`**/${RELEASE}/dwarf.bin`,route=>fail?route.fulfill({body:'corrupt'}):route.continue());
    await openSolar(p);const initial=await solar(p);
    await click(p,'#solBeyond');
    await p.locator('#smallRetry').waitFor({state:'visible'});
    await select(p,'ceres');
    assert.equal(await p.locator('#smallDistance').textContent(),'—');
    assert(!(await solar(p)).markers.some(m=>m.id==='ceres'));
    fail=false;
    await click(p,'#smallRetry');await loaded(p,'dwarf');
    assert.match(await p.locator('#smallDistance').textContent(),/AU/);
    await click(p,'#solBeyond');
    await p.evaluate(()=>{for(let i=0;i<30;i++){
      const button=document.querySelector('#solBeyond');button.click();button.click();
    }});
    restored(await solar(p),initial);
    await click(p,'#solVoyager');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.voyager?.loaded);
    assert(await p.locator('#solBeyond').isHidden());
    await click(p,'#solVoyager');
    await click(p,'#solHeliosphere');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.heliosphere?.crossings===4);
    assert(await p.locator('#solBeyond').isHidden());
    await click(p,'#solHeliosphere');
    await click(p,'[data-system=earth]');
    assert(await p.locator('#solBeyond').isHidden());
    await click(p,'#solGlobal');
    await click(p,'[data-system=pluto]');
    assert.equal((await solar(p)).system,'pluto');
    await click(p,'#solGlobal');
    await click(p,'#solBeyond');await settle(p);
    await p.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
    const idle=(await solar(p)).draws;await p.waitForTimeout(200);
    assert.equal((await solar(p)).draws,idle);
  }finally{await context.close();}
  assert.deepEqual(h.errors,[]);
});

import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {RELEASE,END,TRACK_LIMIT} from '../dist/explorer/voyager-data.mjs';

let h;
before(async()=>{h=await browserHarness();});
after(async()=>{await h?.close();});
const solar=page=>page.evaluate(()=>window.entrolabExplorer.inspect().solar);
const press=(page,selector)=>page.locator(selector).click();
const canvas=page=>page.locator('#solCanvas');
async function enter(page){
  await press(page,'[data-tab=explorer]');
  await press(page,'#exSolarMode');
  await canvas(page).scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>window.entrolabExplorer?.inspect().solar?.markers.length>=9);
}
const ready=page=>page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.voyager?.loaded);
const quant=page=>page.locator('#voyPanel dd').allTextContents();

test('Voyager renders at 1440, 390 and 320 px with bounded model trails and camera-independent values',async()=>{
  for(const width of [1440,390,320]){
    const mobile=width<500;
    const {p,context}=await h.lab({viewport:{width,height:1000},deviceScaleFactor:mobile?2:1,hasTouch:mobile,isMobile:mobile});
    try{
      const traffic=[];
      p.on('request',request=>{if(request.url().includes('/'+RELEASE+'/'))traffic.push(request.url());});
      await enter(p);
      await press(p,'#sol3d');
      const original=await solar(p);
      assert.equal(traffic.length,0);
      if(mobile)await p.locator('#solVoyager').tap();else await press(p,'#solVoyager');
      await ready(p);
      await canvas(p).scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.some(m=>m.id==='v2'));
      const starting=await solar(p);
      assert.equal(starting.view,'3d');
      assert.equal(starting.voyager.tracks.length,2);
      assert(starting.voyager.tracks.every(count=>count>500&&count<TRACK_LIMIT));
      assert.equal(traffic.length,3);
      assert(traffic.every(url=>url.startsWith(h.url)));
      assert.match(await p.locator('#voyEpoch').textContent(),/TDB$/);
      assert((await quant(p)).every(value=>value.startsWith('≈')));
      assert.equal(await p.locator('#solPlay').isDisabled(),true);
      const readings=await quant(p);
      await canvas(p).press('ArrowRight');
      await canvas(p).press('+');
      assert.notEqual((await solar(p)).space.yaw,starting.space.yaw);
      assert.deepEqual(await quant(p),readings);
      if(width===1440){
        const manual=(await solar(p)).space;
        const beforeWidth=await canvas(p).evaluate(el=>el.width);
        await p.setViewportSize({width:1280,height:1000});
        await p.waitForFunction(width=>document.getElementById('solCanvas').width!==width,beforeWidth);
        assert.deepEqual((await solar(p)).space,manual);
        await p.setViewportSize({width,height:1000});
      }
      if(mobile){
        const session=await context.newCDPSession(p),rect=await canvas(p).boundingBox();
        const point={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,x:point.x+35}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.notEqual((await solar(p)).space.yaw,starting.space.yaw+.175);
      }
      if(width===390)await press(p,'[data-language=en]');
      await press(p,'#solFit');
      await canvas(p).scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.some(m=>m.id==='v1'));
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      await p.locator('.ex-solar-map').screenshot({path:join(h.output,`voyager-map-${width}.png`)});
      await p.locator('#voyPanel').screenshot({path:join(h.output,`voyager-mission-${width}.png`)});
      await press(p,'#solList [data-body=v2]');
      assert.equal((await solar(p)).selected,'v2');
      assert(!((await solar(p)).space.focus.every(value=>value===0)));
      await press(p,'#voyEvents [data-voy-date="1989-08-25"]');
      assert.match(await p.locator('#voyEpoch').textContent(),/^1989-08-25/);
      await press(p,'#solTrails');
      assert.deepEqual((await solar(p)).voyager.tracks,[]);
      await press(p,'#solVoyager');
      const restored=await solar(p);
      for(const key of ['view','day','space','camera','system','selected','reference','trails','galactic'])
        assert.deepEqual(restored[key],original[key],key);
    }finally{await context.close();}
  }
  assert.deepEqual(h.errors,[]);
});

test('Voyager refuses altered vectors, shows Retry, and never extrapolates',async()=>{
  const {p,context}=await h.lab({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  try{
    const data=await readFile(new URL(`../dist/explorer/data/${RELEASE}/v1.bin`,import.meta.url));
    let bad=true;
    await p.route(`**/${RELEASE}/v1.bin`,async route=>{
      if(!bad)return route.continue();
      const wrong=Buffer.from(data);
      wrong.writeDoubleLE(wrong.readDoubleLE(28)+100_000_000,28);
      return route.fulfill({body:wrong,status:200});
    });
    await enter(p);
    await press(p,'#solVoyager');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.voyager?.error);
    assert.deepEqual(await quant(p),['—','—','—','—']);
    assert.deepEqual((await solar(p)).markers,[]);
    bad=false;
    await press(p,'#voyRetry');
    await ready(p);
    await p.locator('#solDate').fill('1977-08-21');
    await p.locator('#solDate').dispatchEvent('change');
    assert.deepEqual(await quant(p),['—','—','—','—']);
    await p.locator('#solDate').fill('2050-01-01');
    await p.locator('#solDate').dispatchEvent('change');
    assert((await solar(p)).day<END);
    await p.locator('#solDate').fill('2026-11-26');
    await p.locator('#solDate').dispatchEvent('change');
    assert.equal((await solar(p)).day,END);
    assert.equal(await p.locator('#solNext').isDisabled(),true);
    assert.equal(await p.locator('#solPlay').isDisabled(),true);
    const draws=(await solar(p)).draws;
    await p.waitForTimeout(220);
    assert((await solar(p)).draws<=draws+2);
  }finally{await context.close();}
  assert.deepEqual(h.errors,[]);
});

test('Voyager hides lunar status and legacy comparison values, then restores them',async()=>{
  const {p,context}=await h.lab({viewport:{width:1440,height:1000}});
  try{
    await enter(p);
    await press(p,'#solSystems [data-system=earth]');
    await p.locator('#solDate').fill('2024-12-31');
    assert.equal(await p.locator('#solWorldState').isVisible(),true);
    await press(p,'#solVoyager');
    await ready(p);
    assert.equal(await p.locator('#solWorldState').isHidden(),true);
    assert.equal(await p.locator('#solPairSummary').isHidden(),true);
    await press(p,'#solVoyager');
    assert.equal((await solar(p)).system,'earth');
    assert.equal(await p.locator('#solWorldState').isVisible(),true);
    await press(p,'#solGlobal');
    await p.locator('#solTarget').selectOption('mars');
    assert.equal(await p.locator('#solPairSummary').isVisible(),true);
    await press(p,'#solVoyager');
    assert.equal(await p.locator('#solPairSummary').isHidden(),true);
    await press(p,'#solVoyager');
    assert.equal(await p.locator('#solPairSummary').isVisible(),true);
    await press(p,'#sol3d');
    await press(p,'#solGalactic');
    const prior=await solar(p);
    await press(p,'#solVoyager');
    assert.equal((await solar(p)).galactic,null);
    await press(p,'#solVoyager');
    const restored=await solar(p);
    for(const key of ['day','space','pose','galactic','selected','reference'])assert.deepEqual(restored[key],prior[key],key);
  }finally{await context.close();}
});

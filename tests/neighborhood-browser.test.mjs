import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {readNeighborhoodSource} from '../cosmic-explorer/neighborhood-build.mjs';
import {NEIGHBORHOOD_RELEASE} from '../dist/explorer/foundation/neighborhood-format.mjs';
import {project} from '../dist/explorer/camera.mjs';

const {rows}=await readNeighborhoodSource();
const named=rows.find(r=>r.id==='762815470562110464');
const source=named??rows[Math.floor(rows.length/3)];
const rootPath='/'+NEIGHBORHOOD_RELEASE+'/';
let harness;
test.before(async()=>{harness=await browserHarness();});
test.after(async()=>{await harness?.close();});

const state=p=>p.evaluate(()=>window.entrolabExplorer.inspect());
const traffic=p=>p.evaluate(root=>performance.getEntriesByType('resource').filter(e=>e.name.includes(root)).map(e=>({
  path:new URL(e.name).pathname.split(root)[1], bytes:e.decodedBodySize,
})),rootPath);
async function explorer(p) {
  await p.locator('[data-tab=explorer]').click();
  await p.waitForFunction(()=>window.entrolabExplorer?.inspect().atlas.total===50635);
}
async function enter(p) {
  await p.locator('#exNeighborhoodMode').click();
  await p.locator('#snCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabExplorer?.inspect().neighborhood?.visible>0);
}
async function select(p, query, id) {
  const input=p.locator('#snSearch');
  await input.fill(query);
  await input.press('Enter');
  await p.waitForFunction(id=>{
    const n=window.entrolabExplorer.inspect().neighborhood;
    return n.selected===id&&n.detailState==='ready';
  },id);
}

test('Stellar Neighborhood loads lazily, centres the Sun and opens a matching spatial object and sky direction',async()=>{
  const {p,context}=await harness.lab({viewport:{width:1440,height:1050}});
  try {
    await explorer(p);
    assert.deepEqual(await traffic(p),[]);
    await enter(p);
    const size=await p.locator('#snCanvas').boundingBox(), overview=(await state(p)).neighborhood;
    assert.deepEqual(overview.origin,[size.width/2,size.height/2]);
    assert.equal(overview.total,rows.length);
    assert.deepEqual((await traffic(p)).map(e=>e.path),['manifest.json','positions.bin']);
    assert.ok(overview.markers<=2200 && overview.visible===rows.length);
    await p.locator('#exNeighborhoodPanel').screenshot({path:join(harness.output,'neighborhood-desktop.png')});
    const point=overview.sample[0];
    await p.locator('#snCanvas').click({position:{x:point.x,y:point.y}});
    await p.waitForFunction(id=>window.entrolabExplorer.inspect().neighborhood.selected===id,point.id);
    await select(p,named?'Lalande 21185':'Gaia DR3 '+source.id,source.id);
    assert.match(await p.locator('#snInspector').innerText(),/Geschätzter Abstand zur Sonne \(3D\)/);
    assert.match(await p.locator('#snInspector').innerText(),/Posteriorintervall/);
    assert.ok((await traffic(p)).some(e=>e.path.startsWith('details/')));
    await p.locator('#snInspector summary').click();
    assert.match(await p.locator('#snInspector').innerText(),/ICRS/);
    await p.locator('#exNeighborhoodPanel').screenshot({path:join(harness.output,'neighborhood-inspector.png')});
    await p.locator('#snXZ').click();
    await p.locator('#snUnit').selectOption('ly');
    const side=(await state(p)).neighborhood;
    assert.equal(side.plane,'xz');assert.equal(side.unit,'ly');assert.equal(side.selected,source.id);
    await p.locator('#snCanvas').scrollIntoViewIfNeeded();
    const beforeDrag=side.camera;
    const area=await p.locator('#snCanvas').boundingBox();
    await p.mouse.move(area.x+area.width/2,area.y+area.height/2);
    await p.mouse.down();
    await p.mouse.move(area.x+area.width/2+48,area.y+area.height/2+26,{steps:3});
    await p.mouse.up();
    assert.notDeepEqual((await state(p)).neighborhood.camera,beforeDrag);
    await p.locator('#snCanvas').press('Escape');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'snHome');
    await p.locator('#snCanvas').press('Home');
    assert.deepEqual((await state(p)).neighborhood.camera,{x:0,y:0,zoom:0});
    await p.locator('[data-sn-sky]').click();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().mode==='sky');
    const sky=(await state(p)).camera;
    const [x,y]=project(source.ra,source.dec);
    assert.ok(Math.abs(sky.x-x)<1e-10&&Math.abs(sky.y-y)<1e-10);
    assert.equal(await p.evaluate(()=>document.activeElement.id),'exCanvas');
    await p.locator('#exSolarMode').click();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar?.active);
    assert.deepEqual(harness.errors,[]);
  } finally {await context.close();}
});

test('Corrupt catalogues and detail pages get retry states, and mode switches abort obsolete detail work',async()=>{
  const {p,context}=await harness.lab();
  try {
    let corrupt=true;
    await p.route('**/positions.bin',route=>corrupt?route.fulfill({status:200,body:'invalid'}):route.continue());
    await explorer(p);
    await p.locator('#exNeighborhoodMode').click();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood?.status==='error');
    assert.match(await p.locator('#snStatus').innerText(),/verifiziert/);
    corrupt=false;
    await p.locator('#snRetry').click();
    await p.locator('#snCanvas').scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood?.visible>0);
    let hold=false;
    await p.route('**/details/*.csv',route=>{
      if(!route.request().url().includes(rootPath))return route.continue();
      if(!hold)return route.fulfill({status:200,body:'invalid'});
    });
    const input=p.locator('#snSearch');
    await input.fill(source.id);await input.press('Enter');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood.detailState==='error');
    assert.match(await p.locator('#snInspector').innerText(),/nicht verifiziert/);
    hold=true;
    const request=p.waitForRequest(req=>req.url().includes(rootPath+'details/'));
    await p.locator('[data-sn-retry]').click();await request;
    const cancelled=p.waitForEvent('requestfailed',{predicate:req=>req.url().includes(rootPath+'details/')});
    await p.locator('#exSkyMode').click();
    await cancelled;
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood.requests===0);
    assert.equal((await state(p)).neighborhood.cacheBytes,0);
  } finally {await context.close();}
});

test('Stellar Neighborhood is usable at 320 and 390 px under Reduced Motion, with measured bounded work',async()=>{
  const metrics=[];
  for(const profile of [{width:1440,height:1050,dpr:1},{width:390,height:900,dpr:2},{width:320,height:820,dpr:2}]) {
    const mobile=profile.width<500;
    const {p,context}=await harness.lab({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.dpr,isMobile:mobile,hasTouch:mobile});
    try {
      if(mobile) {
        const session=await context.newCDPSession(p);
        await session.send('Emulation.setCPUThrottlingRate',{rate:4});
      }
      await explorer(p);
      const started=Date.now();
      await enter(p);
      const activationMs=Date.now()-started;
      const overviewBytes=(await traffic(p)).reduce((sum,e)=>sum+e.bytes,0);
      assert.ok(overviewBytes>0&&overviewBytes<1024*1024);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.ok(await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
      if(mobile)await p.locator('#exNeighborhoodPanel').screenshot({path:join(harness.output,`neighborhood-mobile-${profile.width}.png`)});
      await p.locator('[data-language=en]').click();
      assert.match(await p.locator('#snAxes').innerText(),/Galactic centre/);
      await p.locator('#snCanvas').scrollIntoViewIfNeeded();
      const times=[];
      for(let i=0;i<10;i++) {
        const prior=(await state(p)).neighborhood.draws;
        await p.locator('#snZoom').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},.3+.1*(i%6));
        await p.waitForFunction(prior=>window.entrolabExplorer.inspect().neighborhood.draws>prior,prior);
        const current=(await state(p)).neighborhood;
        assert.ok(current.markers<=(mobile?1050:2200));times.push(current.duration);
      }
      const initial=(await state(p)).neighborhood;
      await p.waitForTimeout(160);
      assert.equal((await state(p)).neighborhood.draws,initial.draws);
      assert.equal((await state(p)).neighborhood.scheduled,false);
      times.sort((a,b)=>a-b);
      metrics.push({profile,cpuThrottle:mobile?4:1,activationMs,overviewBytes,drawMsP50:times[4],drawMsP95:times[9],samples:times.length});
    } finally {await context.close();}
  }
  console.log('Stellar Neighborhood measurement '+JSON.stringify(metrics));
  await writeFile(join(harness.output,'neighborhood-performance.json'),JSON.stringify(metrics,null,2)+'\n');
});

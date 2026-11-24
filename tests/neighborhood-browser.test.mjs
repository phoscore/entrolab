import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {browserHarness} from './v08-browser-harness.mjs';
import {readNeighborhoodSource} from '../cosmic-explorer/neighborhood-build.mjs';
import {NEIGHBORHOOD_RELEASE} from '../dist/explorer/foundation/neighborhood-format.mjs';
import {project} from '../dist/explorer/camera.mjs';
import {neighborhoodHome} from '../dist/explorer/neighborhood-space.mjs';

const {rows}=await readNeighborhoodSource();
const named=rows.find(r=>r.id==='762815470562110464');
const source=named??rows[Math.floor(rows.length/3)];
const rootPath='/'+NEIGHBORHOOD_RELEASE+'/';
const baseline='a4b1ce6bd6c2655a62dffc9b5064d3b645bd1b19';
const repo=fileURLToPath(new URL('../',import.meta.url));
const baselinePaths=['dist/explorer/neighborhood-view.mjs','dist/explorer/neighborhood-paint.mjs','dist/explorer.css'];
let harness,output;
test.before(async()=>{harness=await browserHarness();output=join(harness.output,'neighborhood-3d');await mkdir(output,{recursive:true});});
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
    assert.equal(await p.locator('#snXY,#snXZ').count(),0);
    assert.match(await p.locator('#snTitle').locator('..').innerText(),/J2016\.0/);
    await p.locator('#snCanvas').click({position:{x:overview.origin[0],y:overview.origin[1]}});
    assert.equal((await state(p)).neighborhood.selected,null);
    assert.deepEqual((await state(p)).neighborhood.camera.focus,[0,0,0]);
    const point=overview.overlapSample[0];
    assert.ok(point,'catalogue has screen overlaps at the overview scale');
    await p.locator('#snCanvas').click({position:{x:point.x,y:point.y}});
    await p.waitForFunction(id=>window.entrolabExplorer.inspect().neighborhood.selected===id,point.id);
    const alternate=point.members.find(id=>id!==point.id);
    const members=await p.locator('#snList button').allTextContents();
    assert.equal(members.length,point.members.length);
    const alternateButton=p.locator('#snList button').nth(point.members.indexOf(alternate));
    await alternateButton.click();
    await p.waitForFunction(id=>window.entrolabExplorer.inspect().neighborhood.selected===id,alternate);
    await select(p,'Teegarden','35227046884571776');
    assert.match(await p.locator('#snInspector').innerText(),/M7\.0 V/);
    await select(p,named?'Lalande 21185':'Gaia DR3 '+source.id,source.id);
    assert.match(await p.locator('#snInspector').innerText(),/Geschätzter Abstand zur Sonne \(3D\)/);
    assert.match(await p.locator('#snDistance').innerText(),/≈ [\d,]+ Lj/);
    assert.ok((await traffic(p)).some(e=>e.path.startsWith('details/')));
    await p.locator('#snInspector summary').click();
    assert.match(await p.locator('#snInspector').innerText(),/ICRS/);
    assert.match(await p.locator('#snInspector').innerText(),/Posteriorintervall/);
    await p.locator('#exNeighborhoodPanel').screenshot({path:join(output,'inspector-1440.png')});
    await p.locator('#snUnit').selectOption('pc');
    const side=(await state(p)).neighborhood;
    const estimate=await p.locator('#snDistance').innerText();
    assert.equal(side.unit,'pc');assert.equal(side.selected,source.id);
    assert.ok(side.camera.focus.some(v=>v!==0));
    await p.locator('#snCanvas').scrollIntoViewIfNeeded();
    const beforeDrag=side.camera;
    const area=await p.locator('#snCanvas').boundingBox();
    await p.mouse.move(area.x+area.width/2,area.y+area.height/2);
    await p.mouse.down();
    await p.mouse.move(area.x+area.width/2+48,area.y+area.height/2+26,{steps:3});
    await p.mouse.up();
    assert.notDeepEqual((await state(p)).neighborhood.camera,beforeDrag);
    assert.equal(await p.locator('#snDistance').innerText(),estimate);
    await p.locator('#snConnection').uncheck();
    assert.equal(await p.locator('#snDistance').innerText(),estimate);
    await p.locator('#snSun').click();
    assert.deepEqual((await state(p)).neighborhood.camera.focus,[0,0,0]);
    await p.locator('#snCanvas').press('Escape');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'snHome');
    await p.locator('#snCanvas').press('Home');
    assert.deepEqual((await state(p)).neighborhood.camera,neighborhoodHome());
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
      await p.locator('[data-language=en]').click();
      await p.locator('#snCanvas').scrollIntoViewIfNeeded();
      // The camera caption is translated during the next visible canvas redraw.
      await p.waitForFunction(()=>/Camera pivot · Sun.*Looking toward/.test(document.getElementById('snAxes').innerText),null,{timeout:5000});
      const times=[];
      for(let i=0;i<20;i++) {
        const prior=(await state(p)).neighborhood.draws;
        await p.locator('#snZoom').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},.3+.1*(i%6));
        await p.waitForFunction(prior=>window.entrolabExplorer.inspect().neighborhood.draws>prior,prior);
        const current=(await state(p)).neighborhood;
        assert.ok(current.markers<=(mobile?1050:2200));times.push(current.duration);
      }
      await p.locator('#snCanvas').press('Home');
      await p.locator('#snCanvas').scrollIntoViewIfNeeded();
      if(mobile){
        const box=await p.locator('#snCanvas').boundingBox(), session=await context.newCDPSession(p);
        const pnt=(id,dx,dy)=>({id,x:box.x+box.width/2+dx,y:box.y+box.height/2+dy});
        const prior=(await state(p)).neighborhood.camera;
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pnt(0,0,0)]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pnt(0,40,22)]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.notEqual((await state(p)).neighborhood.camera.yaw,prior.yaw);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pnt(0,-22,0),pnt(1,22,0)]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pnt(0,-53,0),pnt(1,53,0)]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.ok((await state(p)).neighborhood.camera.zoom>0);
      }
      const zoom=p.locator('#snZoom');
      let detailCacheBytesAfterSelect=0;
      await zoom.focus();await zoom.press('End');
      assert.equal((await state(p)).neighborhood.camera.zoom,2.4);
      await p.locator('#snCanvas').press('+');
      assert.equal((await state(p)).neighborhood.camera.zoom,2.4);
      await p.locator('#snCanvas').press('Home');
      await p.locator('#snCanvas').press('-');
      assert.equal((await state(p)).neighborhood.camera.zoom,0);
      if(profile.width===320){
        await select(p,source.id,source.id);
        detailCacheBytesAfterSelect=(await state(p)).neighborhood.cacheBytes;
        assert.ok(detailCacheBytesAfterSelect>0&&detailCacheBytesAfterSelect<=256*1024);
        const startDistance=await p.locator('#snDistance').innerText();
        await p.evaluate(async()=>{
          for(let i=0;i<100;i++){
            document.querySelector('#snCenter').click();
            document.querySelector('#snCanvas').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
            document.querySelector('#snHome').click();
            document.querySelector('#exSkyMode').click();
            document.querySelector('#exNeighborhoodMode').click();
            await new Promise(done=>requestAnimationFrame(done));
          }
        });
        await p.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood.active);
        assert.equal((await state(p)).neighborhood.selected,source.id);
        assert.equal(await p.locator('#snDistance').innerText(),startDistance);
      }
      await p.locator('#snCanvas').scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>!window.entrolabExplorer.inspect().neighborhood.scheduled);
      const initial=(await state(p)).neighborhood;
      await p.waitForTimeout(160);
      assert.equal((await state(p)).neighborhood.draws,initial.draws);
      assert.equal((await state(p)).neighborhood.scheduled,false);
      times.sort((a,b)=>a-b);
      metrics.push({profile,cpuThrottle:mobile?4:1,activationMs,overviewBytes,drawMsP50:times[9],drawMsP95:times[18],samples:times.length,
        positionBytes:initial.positionBytes,canvasBytes:initial.canvasBytes,idleDetailCacheBytes:initial.cacheBytes,detailCacheBytesAfterSelect,
        visible:initial.visible,markers:initial.markers,overlap:initial.overlap,limited:initial.limited,modeRoundTrips:profile.width===320?100:0});
    } finally {await context.close();}
  }
  console.log('Stellar Neighborhood measurement '+JSON.stringify(metrics));
  await writeFile(join(output,'performance.json'),JSON.stringify(metrics,null,2)+'\n');
});

test('actual baseline XY/XZ and candidate camera views are captured at the same widths',async()=>{
  const before=new Map(baselinePaths.map(path=>['/'+path.slice(5),execFileSync('git',['show',`${baseline}:${path}`],{cwd:repo})]));
  for(const width of [1440,390,320])for(const previous of [true,false]){
    const mobile=width<500;
    const {p,context}=await harness.lab({viewport:{width,height:mobile?900:1050},isMobile:mobile,hasTouch:mobile});
    try {
      if(previous)await p.route('**/*',route=>{
        const path=new URL(route.request().url()).pathname,body=before.get(path);
        return body?route.fulfill({body,contentType:path.endsWith('.css')?'text/css':'text/javascript'}):route.fallback();
      });
      if(previous)await p.reload(); // The existing stylesheet was loaded before the route was registered.
      await explorer(p);await enter(p);
      const capture=async pose=>{
        await p.locator('#snCanvas').scrollIntoViewIfNeeded();
        await p.waitForFunction(()=>!window.entrolabExplorer.inspect().neighborhood.scheduled);
        await p.locator('#exNeighborhoodPanel').screenshot({path:join(output,`${previous?'before':'after'}-${pose}-${width}.png`)});
      };
      if(previous){
        await capture('xy');
        await p.locator('#snXZ').click();
        await capture('xz');
      } else {
        await capture('overview');
        await p.locator('#snCanvas').press('ArrowRight');
        await p.locator('#snCanvas').press('ArrowDown');
        await capture('orbited');
      }
    } finally {await context.close();}
  }
});

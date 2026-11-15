import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {readDesiSource} from '../cosmic-explorer/desi-build.mjs';
import {DESI_RELEASE,DESI_COUNT} from '../dist/explorer/foundation/desi-format.mjs';

const {rows}=await readDesiSource();
const sample=rows.filter(row=>row.ra>167&&row.ra<204&&row.dec>0&&row.dec<30&&row.z<.012).slice(40)
  .find(row=>Math.abs((row.ra/360*128)%1-.5)<.4 &&
    !rows.some(other=>other!==row&&Math.abs(other.ra-row.ra)<.02&&Math.abs(other.dec-row.dec)<.02));
const atlasPath=new RegExp('/'+DESI_RELEASE.replaceAll('.','\\.')+'/');
let harness;
test.before(async()=>{harness=await browserHarness();});
test.after(async()=>{await harness?.close();});

const inspect=p=>p.evaluate(()=>window.entrolabExplorer.inspect());
const ready=p=>p.waitForFunction(()=>window.entrolabExplorer?.inspect().desi.counts?.selected>0);
const network=p=>p.evaluate(path=>performance.getEntriesByType('resource').filter(e=>e.name.includes(path)).map(e=>({
  path:new URL(e.name).pathname.split(path)[1], decoded:e.decodedBodySize,
})), '/'+DESI_RELEASE+'/');
async function open(p) {
  await p.locator('[data-tab=explorer]').click();
  await p.locator('#exCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabExplorer?.inspect().atlas.total===50635);
}
async function enable(p) {
  await p.locator('#exDesiEnabled').check();
  await p.locator('#exCanvas').scrollIntoViewIfNeeded();
  await ready(p);
}
async function choose(p,row) {
  await p.locator('#exSearch').fill('DESI '+row.id);
  await p.locator(`#exDesiResults [data-desi="${row.id}"]`).press('Enter');
  await p.waitForFunction(id=>{
    const d=window.entrolabExplorer.inspect().desi;
    return d.selected===id && d.detailState==='ready';
  },row.id);
}

test('Deep Sky cold start, keyboard selection, DESI measurements, filter and First Light coexist',async()=>{
  const {p,context}=await harness.lab({viewport:{width:1440,height:1100}});
  try {
    await open(p);
    assert.deepEqual(await network(p),[]);
    await enable(p);
    assert.equal((await inspect(p)).desi.total,DESI_COUNT);
    assert.deepEqual((await network(p)).map(e=>e.path).sort(),['manifest.json','overview.bin']);
    assert.match(await p.locator('#exDesiCounts').innerText(),/32\.392/);
    assert.match(await p.locator('#exDesiSummary').innerText(),/beobachtete Felder/);
    await p.locator('#exSkyPanel').screenshot({path:join(harness.output,'deep-sky-desktop.png')});
    await choose(p,sample);
    const detail=await p.locator('#exInspector').innerText();
    assert.match(detail,/Spektralklasse GALAXY/);
    assert.match(detail,/z = 0,/);
    assert.match(detail,/keine räumliche Entfernung/);
    assert.ok((await network(p)).some(e=>e.path.startsWith('search/')));
    assert.ok((await network(p)).some(e=>e.path.startsWith('details/')));
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().desi.status==='points');
    await p.locator('#exSkyPanel').screenshot({path:join(harness.output,'deep-sky-inspector.png')});
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    await p.locator('#exZoom').evaluate(el=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().desi.counts?.selected===1);
    const box=await p.locator('#exCanvas').boundingBox();
    await p.mouse.move(box.x+box.width*.2,box.y+box.height*.42);
    await p.mouse.down();
    await p.mouse.move(box.x+box.width*.85,box.y+box.height*.42,{steps:8});
    await p.mouse.up();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().desi.counts?.selected===0);
    assert.doesNotMatch(await p.locator('#exDesiStatus').innerText(),/Rauten oder Liste wählen/);
    await p.locator('#exDesiFilter').selectOption('high');
    await p.waitForFunction(()=>!window.entrolabExplorer.inspect().desi.selected);
    await p.locator('#exDesiFilter').selectOption('all');
    const adjacent=rows.find(row=>row.id==='39627791523646374');
    await choose(p,adjacent);
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    await p.locator('#exZoom').evaluate(el=>{el.value='2.2';el.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.locator('#exSearch').fill('');
    await p.locator('#exDesiFilter').selectOption(adjacent.z<.012?'high':'low');
    await p.locator('#exDesiFilter').selectOption('all');
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    const overlap=await p.waitForFunction(id=>{
      const view=window.entrolabExplorer.inspect();
      const point=view.desi.sample.find(row=>row.id===id);
      const first=view.groups.find(group=>group.ids.some(key=>key.includes('2821794351744')));
      return point&&first&&Math.hypot(point.x-first.x,point.y-first.y)<16 ? point : false;
    },adjacent.id);
    const hit=await overlap.jsonValue();
    await p.locator('#exCanvas').click({position:{x:hit.x,y:hit.y}});
    await p.waitForFunction(id=>window.entrolabExplorer.inspect().desi.selected===id,adjacent.id);
    await p.locator('#exDesiEnabled').uncheck();
    await p.locator('#exSearch').fill('');
    await p.locator('#exList button').first().click();
    assert.equal((await inspect(p)).objectCount,22);
    await p.locator('#exCanvas').press('Escape');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'exHome');
    assert.deepEqual(harness.errors,[]);
  } finally {await context.close();}
});

test('Deep Sky invalid packages have a retry state and leaving sky aborts held data',async()=>{
  const {p,context}=await harness.lab();
  try {
    let corrupt=true;
    await p.route('**/overview.bin',async route=>{
      if (corrupt && atlasPath.test(route.request().url())) await route.fulfill({status:200,body:'invalid'});
      else await route.continue();
    });
    await open(p);
    await p.locator('#exDesiEnabled').check();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().desi.status==='error');
    assert.match(await p.locator('#exDesiStatus').innerText(),/verifiziert/);
    corrupt=false;
    await p.locator('#exDesiRetry').click();
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    await ready(p);
    const aborted=[];
    p.on('requestfailed',req=>{if (atlasPath.test(req.url())) aborted.push(req.url());});
    await p.route('**/details/*.csv.gz',route=>atlasPath.test(route.request().url())?undefined:route.continue());
    await p.locator('#exSearch').fill('DESI '+sample.id);
    const started=p.waitForRequest(req=>atlasPath.test(req.url())&&req.url().includes('/details/'));
    await p.locator(`#exDesiResults [data-desi="${sample.id}"]`).click();
    await started;
    await p.locator('#exSolarMode').click();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().desi.requests===0);
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar?.active);
    assert.ok(aborted.some(url=>url.includes('/details/')));
    assert.equal((await inspect(p)).desi.cacheBytes,0);
  } finally {await context.close();}
});

test('Deep Sky mobile reduced motion, viewport sizing and bounded real camera draws',async()=>{
  const metrics=[];
  for (const profile of [{width:1440,height:1100,deviceScaleFactor:1},{width:390,height:900,deviceScaleFactor:2},{width:320,height:820,deviceScaleFactor:2}]) {
    const mobile=profile.width<500;
    const {p,context}=await harness.lab({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.deviceScaleFactor,hasTouch:mobile,isMobile:mobile});
    try {
      if (mobile) {
        const cdp=await context.newCDPSession(p);
        await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      }
      await open(p);
      const begin=Date.now();
      await enable(p);
      const coldActivation=Date.now()-begin;
      const coldPayload=(await network(p)).reduce((sum,e)=>sum+e.decoded,0);
      assert.ok(coldPayload>0&&coldPayload<215*1024);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.ok(await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
      if (mobile) await p.locator('#exSkyPanel').screenshot({path:join(harness.output,`deep-sky-mobile-${profile.width}.png`)});
      await choose(p,sample);
      await p.locator('#exCanvas').scrollIntoViewIfNeeded();
      const draws=[];
      for (let step=0;step<10;step++) {
        const previous=(await inspect(p)).draws;
        await p.locator('#exZoom').evaluate((el,z)=>{el.value=String(z);el.dispatchEvent(new Event('input',{bubbles:true}));},1.35+(step%5)*.17);
        await p.waitForFunction(n=>window.entrolabExplorer.inspect().draws>n,previous);
        await p.waitForTimeout(75);
        const s=await inspect(p);
        assert.ok(s.desi.requests<=4 && s.desi.cacheBytes<=896*1024);
        draws.push(s.duration);
      }
      const [idleA,idleB]=await p.evaluate(async()=>{
        const n=window.entrolabExplorer.inspect().draws;
        await new Promise(r=>setTimeout(r,160));
        return [n,window.entrolabExplorer.inspect().draws];
      });
      assert.equal(idleA,idleB);
      draws.sort((a,b)=>a-b);
      metrics.push({profile,cpuEmulation:mobile?4:1,coldActivationMs:coldActivation,coldPayloadBytes:coldPayload,
        drawMsP50:draws[4],drawMsP95:draws[9],samples:draws.length});
    } finally {await context.close();}
  }
  console.log('Deep Sky measurement '+JSON.stringify(metrics));
  await writeFile(join(harness.output,'deep-sky-performance.json'),JSON.stringify(metrics,null,2)+'\n');
});

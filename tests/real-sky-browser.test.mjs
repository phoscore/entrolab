import {chooseLab} from './browser-lab-navigation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,relative,extname,sep,join} from 'node:path';
import {ATLAS_RELEASE} from '../dist/explorer/foundation/atlas-format.mjs';

const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const out=fileURLToPath(new URL('../browser-results/',import.meta.url));
const dense='4040568965770717312', sparse='251170104086974336', negative='459101393719884800', position='650159265042048';
const atlasAsset=name=>new URL(name).pathname.includes('/'+ATLAS_RELEASE+'/');
let browser,server,origin;

test.before(async()=>{
  await mkdir(out,{recursive:true});
  server=createServer(async (req,res)=>{
    try {
      const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      const file=resolve(root,'.'+(path==='/'?'/index.html':path));
      if (relative(root,file).split(sep).includes('..')) {res.writeHead(403).end();return;}
      const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
      res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(file));
    } catch {res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
});
test.after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});

async function setup(options={}) {
  const context=await browser.newContext({locale:'de-DE',viewport:{width:1440,height:1100},reducedMotion:'reduce',...options});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if (!r.url().startsWith(origin)&&!r.url().startsWith('https://fonts.')) external.push(r.url());});
  await page.goto(origin);
  await page.waitForFunction(()=>Boolean(window.entrolab));
  return {page,context,errors,external};
}
const snapshot=page=>page.evaluate(()=>window.entrolabExplorer.inspect());
const atlas=async page=>(await snapshot(page)).atlas;
const calm=page=>page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect();return !s.scheduled&&s.atlas.requests===0&&s.atlas.status!=='loading';});
async function open(page) {
  await chooseLab(page,'explorer');
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer?.inspect();return s?.atlas.status==='density'&&s.atlas.visible===50635&&s.objectCount===22&&s.groups.length>0;});
}
async function choose(page,id) {
  await page.locator('#exSearch').fill(id);
  await page.locator(`#exAtlasResults [data-gaia="${id}"]`).press('Enter');
  await page.waitForFunction(id=>{const s=window.entrolabExplorer.inspect().atlas;return s.detailState==='ready'&&s.selected===id;},id);
}
async function zoom(page,value) {
  await page.locator('#exZoom').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
}
async function resources(page) {
  return (await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>({url:e.name,decoded:e.decodedBodySize,transfer:e.transferSize})))).filter(e=>atlasAsset(e.url));
}

test('Real Sky overview, separate scope, lazy details, 64-bit search and distinct empty/filter states',async()=>{
  const {page,context,errors,external}=await setup();
  try {
    const began=Date.now();
    await open(page);
    const startupMs=Date.now()-began;
    const startup=await resources(page);
    assert.deepEqual(startup.map(e=>new URL(e.url).pathname.split('/').at(-1)).sort(),['density.bin','manifest.json']);
    assert.ok(startup.reduce((n,e)=>n+e.decoded,0)<350*1024);
    assert.match(await page.locator('#exAtlasCounts').innerText(),/50\.635 Gaia im Katalog/);
    assert.match(await page.locator('#exSkyPanel').innerText(),/Himmelsabdeckung unbekannt/);
    assert.equal((await atlas(page)).markers,0);
    await page.locator('#explorer').screenshot({path:join(out,'real-sky-desktop.png')});

    await page.locator('#exSearch').fill('Gaia DR3 13');
    await page.locator('#exAtlasResults button').first().waitFor();
    assert.ok((await page.locator('#exAtlasResults button').count())<=24);
    assert.ok((await resources(page)).every(e=>!e.url.includes('/details/')));
    await choose(page,negative);
    assert.match(await page.locator('#exInspector').innerText(),new RegExp(negative));
    await page.locator('#exInspector .ex-technical > summary').click();
    assert.match(await page.locator('#exInspector').innerText(),/-0,5032136 mas/);
    assert.match(await page.locator('#exInspector').innerText(),/J2016\.0 \(TCB\)/);
    assert.match(await page.locator('#exInspector').innerText(),/Entfernung unbekannt/);
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().atlas.status==='points'&&window.entrolabExplorer.inspect().atlas.markers>0);
    assert.equal((await resources(page)).filter(e=>e.url.includes('/details/')).length,1);
    await page.locator('#exSearch').fill('');
    await page.locator('#exAtlasResults button').first().waitFor();
    await page.locator('#explorer').screenshot({path:join(out,'real-sky-detail.png')});
    await page.locator('#exInspector').screenshot({path:join(out,'real-sky-inspector.png')});
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    const scene=await snapshot(page);
    const point=scene.atlas.sample.find(p=>p.id!==negative&&scene.groups.every(g=>Math.hypot(g.x-p.x,g.y-p.y)>24));
    assert.ok(point,'one real individual Gaia marker can be picked directly');
    await page.locator('#exCanvas').click({position:{x:point.x,y:point.y}});
    await page.waitForFunction(id=>window.entrolabExplorer.inspect().atlas.selected===id,point.id);

    await choose(page,position);
    await page.locator('#exInspector .ex-technical > summary').click();
    assert.match(await page.locator('#exInspector').innerText(),/Parallaxe\s+unbekannt/);
    await zoom(page,5);
    await page.locator('#exAtlasFilter').selectOption('parallax');
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.getElementById('exAtlasStatus').textContent.includes('aktiven Filter'));
    await page.locator('#exAtlasFilter').selectOption('all');
    await page.locator('#exHome').press('Enter');
    await zoom(page,5);
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.getElementById('exAtlasStatus').textContent.includes('kein Eintrag'));

    await page.locator('#exAtlasEnabled').uncheck();
    await calm(page);
    assert.equal((await atlas(page)).cacheBytes,0);
    assert.equal((await snapshot(page)).objectCount,22);
    await page.locator('[data-language=en]').click();
    assert.match(await page.locator('#exAtlasStatus').innerText(),/First Light stays visible/);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    await writeFile(join(out,'real-sky-startup.json'),JSON.stringify({browser:browser.version(),startupMs,startup},null,2)+'\n');
  }finally{await context.close();}
});

test('Real Sky integrity failures, delayed tile requests and mode abort keep the two catalogues independent',async()=>{
  const {page,context,errors}=await setup();
  const delayPattern='**/'+ATLAS_RELEASE+'/tiles/*.bin', densityPattern='**/'+ATLAS_RELEASE+'/density.bin';
  let release, releaseDetail=()=>{};
  const hold=new Promise(resolve=>{release=resolve;});
  try {
    await page.route(densityPattern,route=>route.fulfill({status:200,body:Buffer.alloc(196620)}));
    await chooseLab(page,'explorer');
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer?.inspect().atlas.status==='error'&&window.entrolabExplorer.inspect().objectCount===22);
    assert.match(await page.locator('#exAtlasStatus').innerText(),/nicht geladen oder verifiziert/);
    assert.equal((await atlas(page)).cacheBytes,0);
    await page.unroute(densityPattern);
    await page.locator('#exAtlasRetry').press('Enter');
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().atlas.status==='density');

    let intercepted=0, aborted=0;
    page.on('requestfailed',request=>{if (atlasAsset(request.url())&&request.url().includes('/tiles/')) aborted++;});
    await page.route(delayPattern,async route=>{intercepted++;await hold;await route.continue().catch(()=>{});});
    await zoom(page,1.7);
    await page.waitForFunction(()=>{const a=window.entrolabExplorer.inspect().atlas;return a.status==='loading'&&a.requests>0;});
    assert.match(await page.locator('#exAtlasStatus').innerText(),/noch nicht geladen/);
    assert.equal(await page.locator('#exAtlasRetry').isVisible(),false);
    await page.locator('#exSolarMode').press('Enter');
    await page.locator('#solCanvas').waitFor();
    const parked=await atlas(page);
    assert.equal(parked.requests,0);assert.equal(parked.cacheBytes,0);
    assert.equal(parked.markers,0);assert.equal(parked.active,false);
    release();
    await page.unroute(delayPattern);
    await page.locator('#exSkyMode').press('Enter');
    await page.locator('#exCanvas').scrollIntoViewIfNeeded();
    await calm(page);
    assert.ok(intercepted>0);
    assert.ok(aborted>0,'in-flight Gaia tile fetch was actually aborted');
    assert.equal((await atlas(page)).status,'points');

    const details='**/'+ATLAS_RELEASE+'/details/*.csv.gz';
    let seenDetail=0;
    const blocked=new Promise(resolve=>{releaseDetail=resolve;});
    await page.route(details,async route=>{seenDetail++;await blocked;await route.continue().catch(()=>{});});
    await page.locator('#exSearch').fill(sparse);
    await page.locator(`#exAtlasResults [data-gaia="${sparse}"]`).press('Enter');
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().atlas.detailState==='loading'&&window.entrolabExplorer.inspect().atlas.requests>0);
    await page.locator('#exSearch').fill('Bellerophon');
    await page.locator('#exList button').filter({hasText:'51 Peg b'}).press('Enter');
    releaseDetail();
    await page.unroute(details);
    await calm(page);
    assert.ok(seenDetail>0);
    assert.equal((await atlas(page)).selected,null);
    assert.match(await page.locator('#exInspector').innerText(),/51 Peg b/);
    assert.deepEqual(errors,[]);
  }finally{release();releaseDetail();await context.close();}
});

const quantile=(values,percent)=>values.slice().sort((a,b)=>a-b)[Math.ceil(values.length*percent)-1];
const stats=values=>({p50:quantile(values,.5),p95:quantile(values,.95),max:Math.max(...values)});

test('Real Sky desktop and 390/320 px Canvas evidence with at least 100 camera/lifecycle changes',async()=>{
  const report={browser:browser.version(),measurements:[]};
  for (const profile of [{width:1440,height:1100,cpu:1},{width:390,height:900,cpu:4}]) {
    const {width,height,cpu}=profile;
    const {page,context,errors}=await setup({viewport:{width,height},isMobile:cpu>1,hasTouch:cpu>1,deviceScaleFactor:cpu>1?2:1});
    try {
      const cdp=await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
      await open(page);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      // Warm both modes so the heap and DOM comparison includes the same feature graph.
      await page.locator('#exSolarMode').press('Enter');await page.locator('#solCanvas').waitFor();
      await page.locator('#exSkyMode').press('Enter');await page.locator('#exCanvas').scrollIntoViewIfNeeded();await calm(page);
      await cdp.send('HeapProfiler.collectGarbage');
      const before=await cdp.send('Runtime.getHeapUsage'), domBefore=await cdp.send('Memory.getDOMCounters');
      const runs=[];
      for (let rep=0;rep<3;rep++) {
        const id=rep%2===0?dense:sparse;
        await choose(page,id);await page.locator('#exSearch').fill('');
        await zoom(page,2.1);
        await page.locator('#exCanvas').scrollIntoViewIfNeeded();await calm(page);
        assert.equal((await atlas(page)).status,'points');
        const bounds=await page.locator('#exCanvas').boundingBox();
        assert.ok(bounds.width>200);
        const result=await page.evaluate(async()=>{
          const canvas=document.getElementById('exCanvas'), slider=document.getElementById('exZoom');
          const elapsed=[],draw=[],times=[];
          let requests=0,cache=0,changed=0;
          for (let i=0;i<20;i++) {
            const old=window.entrolabExplorer.inspect();
            const start=performance.now();
            // Alternate density and source zoom; each phase includes actual pan input.
            if (i===6||i===13) {
              slider.value=i===6?'0.55':'1.9';
              slider.dispatchEvent(new Event('input',{bubbles:true}));
            } else canvas.dispatchEvent(new KeyboardEvent('keydown',{key:i%2===0?'ArrowRight':'ArrowLeft',bubbles:true}));
            const end=await new Promise(resolve=>requestAnimationFrame(resolve));
            const state=window.entrolabExplorer.inspect();
            changed+=Number(state.camera.zoom!==old.camera.zoom||state.camera.x!==old.camera.x||state.camera.y!==old.camera.y);
            elapsed.push(Math.max(0,end-start));times.push(end);
            if (state.draws>old.draws) draw.push(state.duration);
            requests=Math.max(requests,state.atlas.requests);cache=Math.max(cache,state.atlas.cacheBytes);
          }
          return {elapsed,draw,intervals:times.slice(1).map((t,i)=>t-times[i]),requests,cache,changed};
        });
        assert.equal(result.changed,20);
        assert.ok(result.draw.length>=16);
        assert.ok(result.requests<=4&&result.cache<=1216*1024);
        runs.push({id,changes:result.changed,renderMs:stats(result.draw),inputToFrameMs:stats(result.elapsed),frameIntervalMs:stats(result.intervals),peakRequests:result.requests,peakCache:result.cache});
      }
      let lifecycle=0;
      for (let i=0;i<6;i++) {
        await chooseLab(page,'gravity');lifecycle++;
        const gone=await snapshot(page);
        assert.equal(gone.scheduled,false);
        assert.equal(gone.atlas.cacheBytes,0);assert.equal(gone.atlas.queued,0);
        await chooseLab(page,'explorer');lifecycle++;
      }
      await page.locator('#exHome').press('Enter');await page.locator('#exCanvas').scrollIntoViewIfNeeded();await calm(page);
      // Let the final visibility/resize notifications and their one-shot frames settle.
      await page.evaluate(async()=>{for (let i=0;i<3;i++) await new Promise(resolve=>requestAnimationFrame(resolve));});
      await calm(page);
      const idle=(await snapshot(page)).draws;
      await page.waitForTimeout(160);
      assert.equal((await snapshot(page)).draws,idle);
      assert.equal((await snapshot(page)).scheduled,false);
      await cdp.send('HeapProfiler.collectGarbage');
      const after=await cdp.send('Runtime.getHeapUsage'), domAfter=await cdp.send('Memory.getDOMCounters');
      const traffic=(await resources(page)).reduce((n,e)=>n+e.transfer,0);
      if (cpu>1) {
        await page.setViewportSize({width:320,height});
        await page.locator('#exCanvas').scrollIntoViewIfNeeded();await calm(page);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        const box=await page.locator('#exCanvas').boundingBox();
        const touches=span=>[-1,1].map((d,id)=>({id,x:box.x+box.width/2+span*d,y:box.y+box.height/2}));
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches(27)});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches(60)});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(()=>window.entrolabExplorer.inspect().camera.zoom>.3);
        assert.ok(Math.abs((await snapshot(page)).camera.zoom-Math.log10(60/27))<.025);
        await page.locator('#exHome').press('Enter');await page.locator('#exCanvas').scrollIntoViewIfNeeded();await calm(page);
        await page.locator('#explorer').screenshot({path:join(out,'real-sky-mobile.png')});
      }
      assert.deepEqual(errors,[]);
      report.measurements.push({width,height,cpu,runs,lifecycle,idleDrawDelta:0,decodedCacheFinal:(await atlas(page)).cacheBytes,traffic,heapUsedBytes:{before:before.usedSize,after:after.usedSize},domBefore,domAfter});
    }finally{await context.close();}
  }
  assert.equal(report.measurements.reduce((n,p)=>n+p.lifecycle+p.runs.reduce((q,r)=>q+r.changes,0),0),144);
  await writeFile(join(out,'real-sky-performance.json'),JSON.stringify(report,null,2)+'\n');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,relative,extname,sep,join} from 'node:path';
import {RELEASE,SYSTEMS} from '../dist/explorer/new-worlds-spec.mjs';
import {sampleCount} from '../dist/explorer/new-worlds-ephemeris.mjs';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const output=fileURLToPath(new URL('../browser-results/our-home-3d/',import.meta.url));
let server,url,browser;
test.before(async()=>{
  await mkdir(output,{recursive:true});
  server=createServer(async(req,res)=>{try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=resolve(dist,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
    if(relative(dist,file).split(sep).includes('..')){res.writeHead(403).end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
  }catch{res.writeHead(404).end();}});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  url=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
});
test.after(async()=>{await browser?.close();if(server)await new Promise(done=>server.close(done));});
async function open(width,reduced=true){
  const mobile=width<500;
  const context=await browser.newContext({viewport:{width,height:mobile?900:1100},isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference',locale:'de-DE'});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);await page.locator('[data-tab=explorer]').click();
  await page.locator('#exSolarMode').click();
  await page.locator('#solCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>window.entrolabExplorer?.inspect().solar?.markers.length===9);
  return {context,page,errors};
}
const state=page=>page.evaluate(()=>window.entrolabExplorer.inspect().solar);
test('W-01 rejects the shifted Earth Y values without exposing geometry and retries with verified bytes',async()=>{
  const data=new URL(`../dist/explorer/data/${RELEASE}/`,import.meta.url);
  const shifted=await readFile(new URL('earth.bin',data));
  const otherSystem=await readFile(new URL('pluto.bin',data));
  const rows=sampleCount(SYSTEMS.earth.bodies[0].hours);
  for(let offset=16;offset<8+rows*48;offset+=48){
    shifted.writeDoubleLE(shifted.readDoubleLE(offset)+100_000_000,offset);
  }
  const {page,context,errors}=await open(1440);
  const earthRequests=[],plutoRequests=[];
  try{
    page.on('request',request=>{
      if(request.url().endsWith(`/${RELEASE}/pluto.bin`))plutoRequests.push(request.url());
    });
    await page.route(`**/${RELEASE}/earth.bin`,route=>{
      earthRequests.push(route.request().url());
      const body=[shifted,otherSystem][earthRequests.length-1];
      return body ? route.fulfill({body,contentType:'application/octet-stream',headers:{'Cache-Control':'public, max-age=3600'}}) : route.continue();
    });

    await page.locator('[data-system=pluto]').click();
    await page.locator('#solDate').fill('2025-01-01');
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.length===2);
    const validPluto=await state(page);
    assert.equal(validPluto.pair.source,'horizons');

    async function verifyFailure(message, unavailable){
      await page.locator('#solWorldState').getByText(message,{exact:true}).waitFor();
      const failed=await state(page);
      assert.equal(failed.system,'earth');
      assert.equal(failed.pair,null);
      assert.deepEqual(failed.loadedWorlds,['pluto']);
      assert.deepEqual(failed.markers,[]);
      assert.equal(failed.trailPoints,0);
      assert.equal(await page.locator('#solPairValues').isHidden(),true);
      assert.equal(await page.locator('#solPairSummary').isHidden(),true);
      assert.equal(await page.locator('#solDistance').textContent(),unavailable);
      assert.equal(await page.locator('#solWorldRetry').isVisible(),true);
    }

    await page.locator('[data-system=earth]').click();
    await verifyFailure('Ephemeridendaten konnten nicht geladen oder geprüft werden. Bitte erneut versuchen.','Nicht verfügbar');
    assert.equal(earthRequests.length,1);
    await page.locator('[data-language=en]').click();
    const verifyEnglish=()=>verifyFailure('Ephemeris data could not be loaded or verified. Please try again.','Unavailable');
    await verifyEnglish();

    await page.locator('[data-system=pluto]').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.length===2);
    const returned=await state(page);
    assert.equal(returned.day,validPluto.day);
    assert.deepEqual(returned.pair,validPluto.pair);
    assert.deepEqual(returned.markers.map(m=>m.id),validPluto.markers.map(m=>m.id));
    assert.equal(plutoRequests.length,1);

    await page.locator('[data-system=earth]').click();
    await verifyEnglish();
    assert.equal(earthRequests.length,1);
    await page.locator('#solWorldRetry').click();
    await verifyEnglish();
    assert.equal(earthRequests.length,2);

    await page.locator('#solWorldRetry').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{
      const s=window.entrolabExplorer.inspect().solar;
      return s.system==='earth'&&s.markers.length===2&&s.pair?.source==='horizons';
    });
    const restored=await state(page);
    assert.deepEqual(restored.loadedWorlds,['pluto','earth']);
    assert.ok(restored.pair.distanceKm>350_000&&restored.pair.distanceKm<410_000);
    assert.equal(await page.locator('#solPairValues').isVisible(),true);
    assert.equal(await page.locator('#solWorldRetry').isHidden(),true);
    assert.equal(earthRequests.length,3);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('the three Horizons system views load on demand and remain usable at 1440, 390 and 320 px',async()=>{
  const measurements=[];
  const requests=[];
  const cases=[['earth','moon',2],['jupiter','io',5],['pluto','charon',2]];
  for(const width of [1440,390,320]){
    const {page,context,errors}=await open(width);
    requests.length=0;
    page.on('request',request=>{if(/horizons-2025-2030.*\.bin$/.test(request.url()))requests.push(request.url().split('/').at(-1));});
    try{
      const original=await state(page);
      assert.equal(original.day,2451545);
      assert.deepEqual(requests,[]);
      const earthStarted=Date.now();
      await page.locator('[data-system=earth]').click();
      assert.match(await page.locator('#solTimestamp').textContent(),/00:00 TDB$/);
      const time=(await state(page)).day;
      assert.ok(time>=2460676.5&&time<=2462502.5);
      for(const [system,selected,count] of cases){
        const started=system==='earth'?earthStarted:Date.now();
        const trigger=page.locator(`[data-system=${system}]`);
        if(system!=='earth')await trigger.click();
        await page.locator('#solCanvas').scrollIntoViewIfNeeded();
        await page.waitForFunction(([id,n])=>{
          const s=window.entrolabExplorer.inspect().solar;
          return s.system===id&&s.markers.length===n&&s.pair&&s.trailPoints>0&&!s.scheduled;
        },[system,count]);
        const solar=await state(page);
        assert.equal(solar.day,time);
        assert.equal(solar.selected,selected);
        assert.equal(solar.pair.source,'horizons');
        assert.equal(await page.locator('#solPlay').isDisabled(),true);
        assert.match(await page.locator('#solPairDistance').innerText(),/km/);
        assert.match(await page.locator('#solPairLight').innerText(),/d\/c/);
        assert.ok(solar.pair.distanceKm>10000);
        const network=await page.evaluate(id=>{
          const e=performance.getEntriesByType('resource').find(e=>e.name.endsWith(`/${id}.bin`)&&e.name.includes('horizons-2025-2030'));
          return e?{bodyBytes:e.decodedBodySize,transferMs:e.duration}:null;
        },system);
        assert.ok(network?.bodyBytes>0);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        measurements.push({width,system,readyMs:Date.now()-started,drawMs:solar.drawMs,trailPoints:solar.trailPoints,...network});
        await page.locator('#exSolarPanel').screenshot({path:join(output,`new-worlds-${system}-${width}.png`)});
      }
      assert.deepEqual(requests,['earth.bin','jupiter.bin','pluto.bin']);
      await page.locator('[data-system=jupiter]').click();
      await page.locator('#solReference').selectOption('europa');
      assert.equal((await state(page)).pair.source,'horizons');
      await page.locator('#solReference').selectOption('sun');
      assert.equal((await state(page)).pair.source,'hybrid');
      assert.match(await page.locator('#solPairEpoch').innerText(),/Hybridmodell/);
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.locator('#solCanvas').focus();
      const yaw=(await state(page)).space.yaw;
      await page.keyboard.press('ArrowLeft');
      assert.notEqual((await state(page)).space.yaw,yaw);
      if(width!==1440){
        const box=await page.locator('#solCanvas').boundingBox();
        const cdp=await context.newCDPSession(page);
        const p=(id,dx)=>({id,x:box.x+box.width/2+dx,y:box.y+box.height/2});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(0,-20),p(1,20)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p(0,-48),p(1,48)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.ok((await state(page)).space.zoom>0);
      }
      await page.locator('[data-language=en]').click();
      assert.match(await page.locator('#solPairEpoch').innerText(),/Hybrid model/);
      await page.locator('#solDate').fill('2030-01-01');
      assert.ok((await state(page)).pair);
      await page.locator('#solNext').click();
      assert.equal((await state(page)).pair,null);
      assert.match(await page.locator('#solWorldMessage').innerText(),/through 1 Jan 2030/);
      await page.locator('#solDate').fill('2026-11-17');
      const chosenDay=(await state(page)).day;
      await page.locator('#solGlobal').click();
      assert.equal((await state(page)).view,'2d');
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.some(m=>m.id==='pluto'));
      if(width===320){
        await page.evaluate(()=>{
          for(let i=0;i<100;i++){
            document.querySelector(`[data-system=${['earth','jupiter','pluto'][i%3]}]`).click();
            document.querySelector('#solTop').click();
            document.querySelector('#solGlobal').click();
          }
        });
        await page.locator('#solCanvas').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
        const idle=(await state(page)).draws;
        await page.waitForTimeout(180);
        assert.equal((await state(page)).draws,idle);
        assert.deepEqual(requests,['earth.bin','jupiter.bin','pluto.bin']);
        assert.equal((await state(page)).day,chosenDay);
      }
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  console.log('NEW_WORLDS_MEASUREMENTS '+JSON.stringify(measurements));
  await writeFile(join(output,'new-worlds-measurements.json'),JSON.stringify({browser:browser.version(),measurements,cycles:100},null,2)+'\n');
});
test('moon-system fallback is temporary and restores 2D and 3D cameras',async()=>{
  const {page,context,errors}=await open(1440);
  const canvas=page.locator('#solCanvas');
  const date=page.locator('#solDate');
  async function openSystem(id,count){
    await page.locator(`[data-system=${id}]`).click();
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForFunction(n=>window.entrolabExplorer.inspect().solar.markers.length===n,count);
    const lunar=await state(page);
    assert.equal(lunar.system,id);
    assert.equal(lunar.pose,'angle');
    assert.equal(lunar.space.zoom,0);
    assert.ok(lunar.pair);
    return lunar;
  }
  try{
    await page.clock.setFixedTime(new Date('2026-11-24T22:00:00Z'));
    await canvas.press('+');
    const original=await state(page);
    const earth=await openSystem('earth',2);
    assert.equal(await date.inputValue(),'2026-11-24');
    await page.locator('[data-system=earth]').click();
    assert.deepEqual((await state(page)).space,earth.space);
    await page.locator('#sol2d').click();
    const overview=await state(page);
    assert.equal(overview.day,original.day);
    assert.deepEqual(overview.camera,original.camera);
    assert.equal(overview.view,'2d');

    await page.locator('#sol3d').click();
    await canvas.press('ArrowLeft');
    await canvas.press('+');
    await date.fill('2040-03-01');
    const three=await state(page);
    await page.clock.setFixedTime(new Date('2035-09-15T12:00:00Z'));
    await openSystem('jupiter',5);
    assert.equal(await date.inputValue(),'2025-01-01');
    await page.locator('#solGlobal').click();
    const restored=await state(page);
    assert.equal(restored.view,'3d');
    assert.equal(restored.day,three.day);
    assert.equal(restored.pose,three.pose);
    assert.deepEqual(restored.space,three.space);

    await openSystem('pluto',2);
    await date.fill('2028-02-29');
    const chosen=await state(page);
    await page.locator('#solGlobal').click();
    assert.equal((await state(page)).day,chosen.day);
    await openSystem('earth',2);
    assert.equal((await state(page)).day,chosen.day);
    await date.fill('2024-12-31');
    assert.equal((await state(page)).pair,null);
    await page.locator('#solFirstWorldDay').click();
    assert.equal(await date.inputValue(),'2025-01-01');
    assert.ok((await state(page)).pair);
    await page.locator('#solGlobal').click();
    await date.fill('2010-04-10');
    await page.locator('#solGalactic').click();
    await canvas.press('ArrowRight');
    const flight=await state(page);
    await openSystem('jupiter',5);
    assert.equal(await date.inputValue(),'2025-01-01');
    await page.locator('#solGlobal').click();
    const resumed=await state(page);
    assert.ok(resumed.galactic);
    assert.equal(resumed.day,flight.day);
    assert.deepEqual(resumed.space,flight.space);
    await openSystem('earth',2);
    await date.fill('2040-03-01');
    await page.locator('#solGlobal').click();
    assert.equal(await date.inputValue(),'2040-03-01');
    assert.equal((await state(page)).galactic,null);
    assert.equal((await state(page)).view,'3d');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('local 3D uses the same TDB epoch, selection and 3D comparison at 1440/390/320',async()=>{
  const measurements=[];
  for(const width of [1440,390,320]){
    const {page,context,errors}=await open(width);
    try{
      await page.locator('#solTarget').selectOption('mars');
      await page.locator('#solReference').selectOption('earth');
      assert.equal(await page.locator('#sol3dControls').isHidden(),true);
      const two=await state(page);
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.locator('#explorer').screenshot({path:join(output,`2d-before-${width}.png`)});
      const started=Date.now();
      await page.locator('#sol3d').click();
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect().solar;return s.view==='3d'&&s.trailPoints>100&&!s.scheduled;});
      assert.equal(await page.locator('#sol3dControls').isVisible(),true);
      let three=await state(page);
      const readyMs=Date.now()-started;
      assert.equal(three.day,two.day);
      assert.equal(three.selected,'mars');assert.equal(three.reference,'earth');
      assert.equal(three.pair.distanceAU,two.pair.distanceAU);
      assert.equal(three.pair.speedKmS,two.pair.speedKmS);
      assert.match(await page.locator('#solPairProjectionLabel').innerText(),/nicht im Bild/);
      assert.match(await page.locator('#solScaleNote').innerText(),/Symbole vergrößert/);
      assert.equal(await page.locator('#solPlay').isDisabled(),true);
      for(const [id,view] of [['solTop','top'],['solAngle','angle'],['solSide','side']]){
        const previous=(await state(page)).draws;
        await page.locator('#'+id).click();
        assert.equal(await page.locator('#'+id).getAttribute('aria-pressed'),'true');
        await page.locator('#solCanvas').scrollIntoViewIfNeeded();
        await page.waitForFunction(before=>window.entrolabExplorer.inspect().solar.draws>before,previous);
        await page.locator('#explorer').screenshot({path:join(output,`${view}-${width}.png`)});
      }
      const shown=await state(page);
      await page.locator('#solTrails').click();
      assert.equal((await state(page)).trails,false);
      await page.locator('#solTrails').click();
      assert.equal((await state(page)).trails,true);
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.locator('#solCanvas').focus();
      await page.keyboard.press('ArrowRight');
      assert.notEqual((await state(page)).space.yaw,shown.space.yaw);
      assert.equal((await state(page)).pose,null);
      await page.keyboard.press('+');
      assert.ok((await state(page)).space.zoom>0);
      await page.locator('#solFit').click();
      three=await state(page);
      assert.equal(three.space.zoom,0);
      assert.equal(three.pose,'angle');
      assert.deepEqual(three.space.focus,[0,0,0]);
      const beforeTop=three.draws;
      await page.locator('#solTop').click();
      const canvas=page.locator('#solCanvas');
      await canvas.evaluate(element=>element.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
      await page.waitForFunction(previous=>{
        const s=window.entrolabExplorer.inspect().solar;
        return s.pose==='top'&&s.draws>previous&&!s.scheduled&&s.markers.some(m=>m.id==='neptune');
      },beforeTop);
      const point=await canvas.evaluate(async element=>{
        const [{spaceProjector},{solarState}]=await Promise.all([
          import('/explorer/solar-space.mjs'),import('/explorer/solar-model.mjs'),
        ]);
        let last = null, stable = 0;
        // Mobile screenshot capture can briefly resize the viewport. Wait for the actual painted marker and layout to agree.
        for(let frame=0;frame<90;frame++){
          await new Promise(done=>requestAnimationFrame(done));
          const rect=element.getBoundingClientRect(),s=window.entrolabExplorer.inspect().solar;
          const body=solarState(s.day).find(({body})=>body.id==='neptune');
          const expected=spaceProjector(s.space,rect.width,rect.height)(body.vector);
          const marker=s.markers.find(m=>m.id==='neptune');
          if(!expected||!marker||s.scheduled||Math.hypot(marker.x-expected.x,marker.y-expected.y)>.25){
            last=null;stable=0;continue;
          }
          const x=rect.left+marker.x,y=rect.top+marker.y;
          if(document.elementFromPoint(x,y)!==element){last=null;stable=0;continue;}
          stable=last&&Math.hypot(last.x-x,last.y-y)<.25?stable+1:1;
          last={x,y};
          if(stable===8)return last;
        }
        return null;
      });
      assert.ok(point,`Neptune must settle inside the clickable canvas at ${width} px`);
      if(width<500)await page.touchscreen.tap(point.x,point.y);
      else await page.mouse.click(point.x,point.y);
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.selected==='neptune');
      await page.locator('#solTarget').selectOption('saturn');
      await page.locator('#solJump').click();
      const focused=await state(page);
      assert.notDeepEqual(focused.space.focus,[0,0,0]);
      await page.locator('#sol2d').click();
      assert.equal(await page.locator('#sol3dControls').isHidden(),true);
      assert.equal((await state(page)).selected,'saturn');
      await page.locator('#sol3d').click();
      assert.equal((await state(page)).reference,'earth');
      assert.equal((await state(page)).day,two.day);
      await page.locator('[data-language=en]').click();
      assert.match(await page.locator('#exSolarPanel').innerText(),/rotatable camera perspective/);
      await page.locator('#solDate').fill('1800-01-01');
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.trailDay===2378496.5);
      assert.equal((await state(page)).trailPoints,8);
      await page.locator('#solDate').fill('2050-01-01');
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.trailDay===2469807.5);
      measurements.push({width,readyMs,drawMs:three.drawMs,trailPoints:three.trailPoints,
        overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
      assert.equal(measurements.at(-1).overflow,false);
      await page.waitForTimeout(140);
      const idle=(await state(page)).draws;
      await page.waitForTimeout(170);
      assert.equal((await state(page)).draws,idle);
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  console.log('3D_BROWSER_MEASUREMENTS '+JSON.stringify(measurements));
  await writeFile(join(output,'measurements.json'),JSON.stringify({head:process.env.GITHUB_SHA??'working tree',browser:browser.version(),measurements},null,2)+'\n');
});
test('touch rotation/pinch and model-time trails at 100 days per second are frame-independent',async()=>{
  const {page,context,errors}=await open(320,false);
  try{
    await page.locator('#sol3d').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.trailPoints>100);
    const start=await state(page);
    const box=await page.locator('#solCanvas').boundingBox();
    const cdp=await context.newCDPSession(page);
    const p=(id,dx,dy)=>({id,x:box.x+box.width/2+dx,y:box.y+box.height/2+dy});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(0,0,0)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p(0,35,20)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.notEqual((await state(page)).space.yaw,start.space.yaw);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(0,-30,0),p(1,30,0)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p(0,-60,0),p(1,60,0)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok((await state(page)).space.zoom>.2);
    const old=(await state(page)).day;
    await page.evaluate(()=>{document.querySelector('#solRate').value='100';document.querySelector('#solPlay').click();});
    await page.waitForFunction(old=>window.entrolabExplorer.inspect().solar.day>old+1,old);
    const playbackDrawMs=[];
    for(let i=0;i<12;i++){await page.waitForTimeout(30);playbackDrawMs.push((await state(page)).drawMs);}
    await page.evaluate(()=>document.querySelector('#solPlay').click());
    await page.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.playing);
    let s=await state(page);
    assert.ok(s.trailDay>old);
    assert.ok(s.trailPoints>100&&s.trailPoints<=776);
    await page.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
    await page.waitForTimeout(80);
    s=await state(page);
    const paused=s.draws,pausedDay=s.day;
    await page.waitForTimeout(190);
    const idleDrawDelta=(await state(page)).draws-paused;
    assert.equal(idleDrawDelta,0);
    await page.evaluate(()=>{for(let i=0;i<100;i++){document.querySelector('#sol2d').click();document.querySelector('#sol3d').click();}});
    s=await state(page);
    assert.equal(s.view,'3d');assert.equal(s.playing,false);assert.equal(s.day,pausedDay);
    console.log('3D_PLAYBACK_METRICS '+JSON.stringify({width:320,rateModelDaysPerSecond:100,trailPoints:s.trailPoints,drawMs:playbackDrawMs,p95DrawMs:[...playbackDrawMs].sort((a,b)=>a-b)[Math.ceil(playbackDrawMs.length*.95)-1],idleDrawDelta,cycles:100}));
    await writeFile(join(output,'playback-100x.json'),JSON.stringify({
      browser:browser.version(),width:320,rateModelDaysPerSecond:100,
      trailPoints:s.trailPoints,pausedDay,drawMs:playbackDrawMs,
      p95DrawMs:[...playbackDrawMs].sort((a,b)=>a-b)[Math.ceil(playbackDrawMs.length*.95)-1],
      idleDrawDelta,cycles:100,
    },null,2)+'\n');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

const getFlight = page => page.evaluate(()=>window.entrolabExplorer.inspect().solar);
async function flightReady(page) {
  await page.locator('#solCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{
    const s=window.entrolabExplorer.inspect().solar;
    return s.galactic && s.markers.length>0 && !s.scheduled;
  });
  return getFlight(page);
}

test('Galactic motion projects nine bodies at 1440/390/320 and preserves comparisons',async()=>{
  const measurements=[];
  for (const width of [1440,390,320]) {
    const {page,context,errors}=await open(width);
    const requests=[];
    page.on('request',request=>{if(/\.bin($|\?)/.test(request.url()))requests.push(request.url());});
    try {
      assert.ok(await page.locator('#solFrames').isHidden());
      await page.locator('#sol3d').click();
      await page.locator('#solTarget').selectOption('earth');
      await page.locator('#solReference').selectOption('mars');
      const original=await getFlight(page);
      const start=Date.now();
      await page.locator('#solGalactic').click();
      const first=await flightReady(page);
      const readyMs=Date.now()-start;
      assert.deepEqual(first.pair,original.pair);
      assert.equal(first.day,original.day);
      assert.equal(first.markers.length,9);
      assert.ok(first.galactic.samples>100);
      assert.equal(first.galactic.schematic,false);
      assert.equal(await page.locator('#solPlay').isDisabled(),true);
      assert.equal(await page.locator('#solOrbitPoses').isHidden(),true);
      assert.match(await page.locator('#solScene3d').innerText(),/246 km\/s/);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.equal(await page.locator('#solTarget option[value=pluto]').count(),0);
      await page.locator('#exSolarPanel').screenshot({path:join(output,`galactic-overview-${width}.png`)});

      const canvas=page.locator('#solCanvas');
      for (const [id,pose] of [['solAcross','across'],['solAlong','along'],['solFlightAngle','angle']]) {
        await page.locator('#'+id).click();
        const view=await flightReady(page);
        assert.equal(view.pose,pose);
        assert.equal(view.galactic.samples,first.galactic.samples);
        assert.deepEqual(view.pair,first.pair);
        if(width===1440) await canvas.screenshot({path:join(output,`galactic-${pose}-1440.png`)});
      }

      await canvas.focus();
      await page.keyboard.press('ArrowLeft');
      assert.notEqual((await getFlight(page)).space.yaw,first.space.yaw);
      const box=await canvas.boundingBox();
      const midX=box.x+box.width/2,midY=box.y+box.height/2;
      if(width===1440) {
        await page.mouse.move(midX,midY);
        await page.mouse.down();
        await page.mouse.move(midX+45,midY-27,{steps:5});
        await page.mouse.up();
      } else {
        const cdp=await context.newCDPSession(page);
        const p=(id,dx)=>({id,x:midX+dx,y:midY});
        const yaw=(await getFlight(page)).space.yaw;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(0,0)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p(0,30)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.notEqual((await getFlight(page)).space.yaw,yaw);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(0,-18),p(1,18)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p(0,-42),p(1,42)]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.ok((await getFlight(page)).space.zoom>0);
      }

      if(width===1440){
        await page.locator('#solFlightAngle').click();
        await page.locator('#solInner').click();
        await flightReady(page);
        await canvas.screenshot({path:join(output,'galactic-physical-inner-1440.png')});
      }
      await page.locator('#solFlightWindow').selectOption('365');
      await page.locator('#solFit').click();
      const fitted=await flightReady(page);
      assert.ok(fitted.galactic.samples<=765&&fitted.galactic.samples>first.galactic.samples);
      assert.equal(fitted.space.zoom,0);
      await page.locator('#solTrails').click();
      assert.equal((await flightReady(page)).galactic.samples,0);
      await page.locator('#solTrails').click();

      await page.locator('#solFlightScale').selectOption('schematic');
      const schematic=await flightReady(page);
      assert.equal(schematic.galactic.schematic,true);
      assert.ok(schematic.galactic.distance>fitted.galactic.distance);
      assert.deepEqual(schematic.pair,original.pair);
      assert.match(await page.locator('#solGalacticScale').innerText(),/Schematische Ansicht/);
      await page.locator('[data-language=en]').click();
      assert.match(await page.locator('#solGalacticScale').innerText(),/Schematic view/);
      assert.match(await page.locator('#solScene3d').innerText(),/Galactocentric/);
      if(width===1440) {
        await page.locator('#solInner').click();
        await flightReady(page);
        await canvas.screenshot({path:join(output,'galactic-schematic-inner-1440.png')});
      }
      await page.locator('#solFlightScale').selectOption('scale');
      await page.locator('#solHelio').click();
      assert.equal((await getFlight(page)).galactic,null);
      assert.deepEqual((await getFlight(page)).pair,original.pair);
      assert.equal(await page.locator('#solTarget option[value=pluto]').count(),1);
      assert.equal(await page.locator('#solFlightControls').isHidden(),true);
      assert.deepEqual(requests,[]);
      assert.deepEqual(errors,[]);
      measurements.push({width,readyMs,drawMs:first.drawMs,defaultSamples:first.galactic.samples,
        longestSamples:fitted.galactic.samples,canvasBytes:await canvas.evaluate(c=>c.width*c.height*4)});
    } finally {await context.close();}
  }
  console.log('GALACTIC_VIEW '+JSON.stringify(measurements));
  await writeFile(join(output,'galactic-views.json'),JSON.stringify({browser:browser.version(),measurements},null,2)+'\n');
});

function flightFrameSettled(page) {
  return page.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
}

test('Galactic time, follow, boundaries, Moon return, 100 switches and idle stay consistent',async()=>{
  const {context,page,errors}=await open(1440,false);
  try {
    await page.locator('#sol3d').click();
    const date=page.locator('#solDate');
    await date.fill('1900-03-11');
    const external=(await getFlight(page)).day;
    await page.locator('#solGalactic').click();
    assert.match(await page.locator('#solGalacticStatus').innerText(),/1. Januar 2000/);
    const startDay=(await getFlight(page)).day;
    assert.equal(startDay,2451545);
    await page.locator('#solHelio').click();
    assert.equal((await getFlight(page)).day,external);
    await page.locator('#solGalactic').click();
    await date.fill('1969-12-31');
    assert.equal((await getFlight(page)).day,startDay);
    await date.fill('1970-01-01');
    assert.ok(await page.locator('#solPrev').isDisabled());
    assert.equal((await flightReady(page)).galactic.samples,9);
    await page.locator('#solNext').click();
    assert.ok((await flightReady(page)).galactic.samples>9);
    await date.fill('2030-01-01');
    assert.ok(await page.locator('#solNext').isDisabled());
    assert.ok(await page.locator('#solPlay').isDisabled());
    await page.locator('#solPrev').click();
    await page.locator('#solRate').selectOption('100');
    await page.locator('#solPlay').click();
    await page.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.playing);
    assert.equal(await date.inputValue(),'2030-01-01');

    const metrics=[];
    for (const rate of [1,10,100]) {
      await page.locator('#solEpoch').click();
      assert.equal((await getFlight(page)).day,startDay);
      await page.locator('#solRate').selectOption(String(rate));
      if(rate===100)await page.locator('#solFlightWindow').selectOption('365');
      await page.locator('#solFollowSun').click();
      const before=await flightReady(page);
      assert.equal(before.galactic.followSun,true);
      await page.locator('#solPlay').click();
      // Exclude the cold start, then sample real playback for a full second.
      await page.waitForFunction(beforeDay=>window.entrolabExplorer.inspect().solar.day>beforeDay,before.day);
      const points=await page.evaluate(async()=>{
        const result=[];
        const start=performance.now();
        let draws=-1;
        await new Promise(resolve=>{
          function frame(time){
            const s=window.entrolabExplorer.inspect().solar;
            if(s.draws!==draws){
              result.push({day:s.day,drawMs:s.drawMs,samples:s.galactic.samples,draws:s.draws});
              draws=s.draws;
            }
            if(time-start>=1000) resolve(); else requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        });
        return result;
      });
      await page.locator('#solPlay').click();
      const result=await flightReady(page);
      const elapsedDays=result.day-before.day;
      assert.ok(elapsedDays>.9*rate&&elapsedDays<2.0*rate,`rate ${rate}: ${elapsedDays}`);
      assert.notDeepEqual(result.space.focus,before.space.focus);
      assert.ok(points.length>=10);
      const timings=points.map(p=>p.drawMs).sort((a,b)=>a-b);
      const p95=timings[Math.ceil(timings.length*.95)-1];
      assert.ok(p95<40,`p95 ${p95} ms at ${rate}`);
      metrics.push({rate,elapsedDays,frames:points.length,p95DrawMs:p95,peakSamples:Math.max(...points.map(p=>p.samples))});
      await page.locator('#solFit').click();
    }
    await date.fill('2026-11-18');
    const time=(await getFlight(page)).day;
    await page.locator('[data-system=jupiter]').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{
      const s=window.entrolabExplorer.inspect().solar;
      return s.system==='jupiter' && s.markers.length===5 && s.pair?.source==='horizons';
    });
    const local=await getFlight(page);
    assert.equal(local.day,time);
    assert.equal(local.galactic,null);
    await page.locator('#solGlobal').click();
    assert.equal((await getFlight(page)).view,'3d');
    assert.ok((await getFlight(page)).galactic);
    await page.locator('#solHelio').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await flightFrameSettled(page);
    const cdp=await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const heapBytes=async()=>{
      await cdp.send('HeapProfiler.collectGarbage');
      return (await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='JSHeapUsedSize').value;
    };
    const heapBefore=await heapBytes();
    await page.evaluate(async()=>{
      const frame=()=>new Promise(done=>requestAnimationFrame(done));
      for(let i=0;i<100;i++){
        document.querySelector('#solGalactic').click();
        document.querySelector(i%2?'#solAcross':'#solAlong').click();
        document.querySelector('#solSun').click();
        await frame();
        document.querySelector('#solHelio').click();
        await frame();
      }
    });
    assert.equal((await getFlight(page)).galactic,null);
    const heapAfter=await heapBytes();
    assert.ok(heapAfter-heapBefore<4*1024*1024);
    await page.locator('#solGalactic').click();
    const idle=await flightReady(page);
    await page.waitForTimeout(200);
    assert.equal((await getFlight(page)).draws,idle.draws);
    assert.equal((await getFlight(page)).day,time);
    assert.equal((await getFlight(page)).scheduled,false);
    assert.deepEqual(errors,[]);
    console.log('GALACTIC_CLOCK '+JSON.stringify(metrics));
    await writeFile(join(output,'galactic-clock.json'),JSON.stringify({browser:browser.version(),metrics,cycles:100,idleDraws:0,heapBefore,heapAfter},null,2)+'\n');
  } finally {await context.close();}
});

test('D-01 actual Mercury strokes stay within a CSS pixel at 100× on desktop and mobile',async()=>{
  const report=[];
  for(const width of [1440,320]){
    const {page,context,errors}=await open(width);
    try {
      await page.evaluate(()=>{
        const ctx=document.querySelector('#solCanvas').getContext('2d');
        let path=[];
        window.d01Mercury=[];
        for(const name of ['clearRect','beginPath','moveTo','lineTo','stroke']){
          const original=ctx[name];
          ctx[name]=function(...args){
            if(name==='clearRect')window.d01Mercury=[];
            if(name==='beginPath')path=[];
            if(name==='moveTo'||name==='lineTo')path.push(args);
            if(name==='stroke'&&this.strokeStyle==='#aab6d1'&&path.length===2)window.d01Mercury.push(path);
            return original.apply(this,args);
          };
        }
      });
      await page.locator('#sol3d').click();
      await page.locator('#solGalactic').click();
      await page.locator('#solEpoch').click();
      const physicalPair=await page.evaluate(()=>{
        const reference=document.querySelector('#solReference');
        reference.value='earth';
        reference.dispatchEvent(new Event('change'));
        const target=document.querySelector('#solTarget');
        target.value='mercury';
        target.dispatchEvent(new Event('change'));
        return window.entrolabExplorer.inspect().solar.pair;
      });

      for(const schematic of [false,true]){
        if(schematic)await page.locator('#solFlightScale').selectOption('schematic');
        await page.locator('#solInner').click();
        await page.locator('#solJump').click();
        await page.locator('#solAlong').click();
        await page.locator('#solZoom').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input'));});
        const before=await flightReady(page);
        assert.equal(before.space.zoom,2);
        assert.equal(before.pose,'along');
        assert.equal(before.day,2451545);
        assert.deepEqual(before.pair,physicalPair);
        const measured=await page.evaluate(async({space,galactic,day})=>{
          const {solarState}=await import('/explorer/solar-model.mjs');
          const {flightTrails,galacticPosition,sunDisplacement}=await import('/explorer/solar-galactic.mjs');
          const {spaceProjector}=await import('/explorer/solar-space.mjs');
          const {width,height}=document.querySelector('#solCanvas').getBoundingClientRect();
          const project=spaceProjector(space,width,height,galactic.distance);
          const vector=epoch=>{
            const v=galacticPosition(epoch,solarState(epoch)[1].vector),s=sunDisplacement(epoch);
            return galactic.schematic ? v.map((x,i)=>3*x-2*s[i]) : v;
          };
          const distance=({x,y},[[ax,ay],[bx,by]])=>{
            const dx=bx-ax,dy=by-ay,length2=dx*dx+dy*dy;
            const t=length2?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length2)):0;
            return Math.hypot(x-ax-dx*t,y-ay-dy*t);
          };
          const [a,b]=flightTrails(day,180)[1].samples.slice(-2);
          const baseline=project.segment(vector(a.day),vector(b.day)).map(p=>[p.x,p.y]);
          const audit=project(vector(2451544.6880322825));
          const lines=window.d01Mercury;
          let count=0,maximumCSS=0;
          for(let i=0;i<401;i++){
            const p=project(vector(a.day+(b.day-a.day)*i/400));
            if(!p||p.x<0||p.x>width||p.y<0||p.y>height)continue;
            maximumCSS=Math.max(maximumCSS,Math.min(...lines.map(l=>distance(p,l))));
            count++;
          }
          return {canvasCSS:[width,height],count,maximumCSS,baselineCSS:distance(audit,baseline),auditCSS:Math.min(...lines.map(l=>distance(audit,l)))};
        },before);
        assert.ok(measured.count>70);
        assert.ok(measured.maximumCSS<=1&&measured.auditCSS<=1,JSON.stringify(measured));
        if(width===1440&&!schematic) assert.ok(measured.baselineCSS>6&&measured.baselineCSS<6.2);
        const canvas=page.locator('#solCanvas');
        await canvas.screenshot({path:join(output,`d01-mercury-${width}-${schematic?'schematic':'physical'}.png`)});
        const p95=await canvas.evaluate(async el=>{
          const samples=[];
          for(let i=0;i<24;i++){
            el.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft'}));
            await new Promise(done=>requestAnimationFrame(done));
            samples.push(window.entrolabExplorer.inspect().solar.drawMs);
          }
          samples.sort((a,b)=>a-b);
          return samples[Math.ceil(samples.length*.95)-1];
        });
        assert.ok(p95<40,`D-01 paused camera draw p95 ${p95} ms`);
        const after=await flightReady(page);
        assert.equal(after.day,before.day);
        assert.deepEqual(after.pair,before.pair);
        await page.waitForTimeout(180);
        assert.equal((await getFlight(page)).draws,after.draws);
        report.push({width,schematic,p95DrawMs:p95,...measured});
      }
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  console.log('D01_MERCURY '+JSON.stringify(report));
  await writeFile(join(output,'d01-mercury.json'),JSON.stringify({browser:browser.version(),report},null,2)+'\n');
});

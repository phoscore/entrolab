import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,relative,extname,sep,join} from 'node:path';
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
test('the three Horizons system views load on demand and remain usable at 1440, 390 and 320 px',async()=>{
  const measurements=[];
  const requests=[];
  const cases=[['earth','moon',2],['jupiter','io',5],['pluto','charon',2]];
  for(const width of [1440,390,320]){
    const {page,context,errors}=await open(width);
    requests.length=0;
    page.on('request',request=>{if(/horizons-2025-2030.*\.bin$/.test(request.url()))requests.push(request.url().split('/').at(-1));});
    try{
      await page.locator('[data-system=earth]').click();
      assert.match(await page.locator('#solWorldMessage').innerText(),/01\.01\.2025/);
      assert.equal((await state(page)).pair,null);
      assert.deepEqual(requests,[]);
      const earthStarted=Date.now();
      await page.locator('#solFirstWorldDay').click();
      await page.locator('#solDate').fill('2026-11-17');
      const time=(await state(page)).day;
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
        assert.equal((await state(page)).day,time);
      }
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  console.log('NEW_WORLDS_MEASUREMENTS '+JSON.stringify(measurements));
  await writeFile(join(output,'new-worlds-measurements.json'),JSON.stringify({browser:browser.version(),measurements,cycles:100},null,2)+'\n');
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
      const target=(await state(page)).markers.find(m=>m.id==='neptune');
      const point=await canvas.evaluate((element,marker)=>{
        const rect=element.getBoundingClientRect();
        const x=rect.left+marker.x,y=rect.top+marker.y;
        const events=[];
        window.solarPointerTrace=events;
        for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture','click'])for(const capture of [true,false])element.addEventListener(type,event=>{
          const relative=element.getBoundingClientRect(),s=window.entrolabExplorer.inspect().solar;
          const x=event.clientX-relative.left,y=event.clientY-relative.top;
          events.push({type,capture,x,y,view:s.view,active:s.active,selected:s.selected,scheduled:s.scheduled,interacting:element.dataset.interacting,
            pageScroll:scrollY,captured:element.hasPointerCapture(event.pointerId),marker:s.markers.find(m=>m.id==='neptune')});
        },{capture,once:true});
        return {x,y,hit:document.elementFromPoint(x,y)?.id};
      },target);
      assert.equal(point.hit,'solCanvas',`Neptune must be in the clickable canvas at ${width} px: ${JSON.stringify(point)}`);
      if(width<500)await page.touchscreen.tap(point.x,point.y);
      else await page.mouse.click(point.x,point.y);
      try{
        await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.selected==='neptune',null,{timeout:1200});
      }catch{
        assert.fail(`Select Neptune on the ${width} px canvas; ${JSON.stringify({errors,point,trace:await page.evaluate(()=>window.solarPointerTrace)})}`);
      }
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

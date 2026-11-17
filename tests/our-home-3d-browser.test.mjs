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
      await page.locator('#solTop').click();
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.some(m=>m.id==='neptune'));
      const target=(await state(page)).markers.find(m=>m.id==='neptune');
      await page.locator('#solCanvas').click({position:{x:target.x,y:target.y}});
      assert.equal((await state(page)).selected,'neptune');
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
    const paused=s.draws,pausedDay=s.day;
    await page.waitForTimeout(190);
    const idleDrawDelta=(await state(page)).draws-paused;
    assert.equal(idleDrawDelta,0);
    await page.evaluate(()=>{for(let i=0;i<100;i++){document.querySelector('#sol2d').click();document.querySelector('#sol3d').click();}});
    s=await state(page);
    assert.equal(s.view,'3d');assert.equal(s.playing,false);assert.equal(s.day,pausedDay);
    await writeFile(join(output,'playback-100x.json'),JSON.stringify({
      browser:browser.version(),width:320,rateModelDaysPerSecond:100,
      trailPoints:s.trailPoints,pausedDay,drawMs:playbackDrawMs,
      p95DrawMs:[...playbackDrawMs].sort((a,b)=>a-b)[Math.ceil(playbackDrawMs.length*.95)-1],
      idleDrawDelta,cycles:100,
    },null,2)+'\n');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

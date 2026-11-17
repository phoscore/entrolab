import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, relative, extname, sep, join} from 'node:path';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const output=fileURLToPath(new URL('../browser-results/',import.meta.url));
let server,browser,url;
test.before(async()=>{
  await mkdir(output,{recursive:true});
  server=createServer(async(req,res)=>{try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
    if(relative(root,file).split(sep).includes('..')){res.writeHead(403).end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
  }catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));url=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
});
test.after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});
async function page(options={}){
  const context=await browser.newContext({viewport:{width:1440,height:1100},locale:'de-DE',reducedMotion:'reduce',...options});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(()=>window.entrolab&&window.entrolabThermal&&window.entrolabEntropy);
  if (!(await p.evaluate(()=>window.entrolab.inspect().paused))) await p.locator('#play').click();
  return {p,context,errors};
}
async function open(p){
  await p.locator('[data-tab=explorer]').click();
  await p.waitForFunction(()=>window.entrolabExplorer?.inspect().objectCount===22&&!window.entrolabExplorer.inspect().failed);
  await p.locator('#exCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().groups.length>0);
}
const inspect=p=>p.evaluate(()=>window.entrolabExplorer.inspect());
async function openSolar(p) {
  await p.locator('#exSolarMode').click();
  await p.locator('#solCanvas').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar?.markers.length>0);
}

test('Explorer browser: lazy loading, real source selection, aliases and unchanged physical state',async()=>{
  const {p,context,errors}=await page();try{
    const initially=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/explorer(?:\/|\.css$)/.test(r.name)));
    assert.equal(initially.length,0);
    const before=await p.evaluate(()=>({g:window.entrolab.inspect().bodies,t:window.entrolabThermal.inspect(),e:window.entrolabEntropy.inspect()}));
    const started=Date.now();
    await open(p);
    const coldOpenMs=Date.now()-started;
    const resources=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/explorer(?:\/|\.css$)/.test(r.name)).map(r=>({path:new URL(r.name).pathname,bytes:r.decodedBodySize})));
    assert.ok(resources.some(r=>r.path.endsWith('/objects.json')));
    await p.locator('#explorer').screenshot({path:join(output,'explorer-overview.png')});
    assert.equal(await p.locator('#exList button').count(),22);
    await p.locator('#exSearch').fill('Bellerophon');await p.waitForFunction(()=>document.querySelectorAll('#exList button').length===1);
    await p.locator('#exList button').press('Enter');
    assert.match(await p.locator('#exInspector').innerText(),/51 Peg b/);
    assert.equal(await p.locator('#exCenter').isDisabled(),true);
    await p.locator('#exSearch').fill('5853498713190525696');
    await p.locator('#exList button').filter({hasText:'5853498713190525696'}).waitFor();
    await p.locator('#exList button').click();
    assert.equal(await p.locator('#exCenter').isDisabled(),false);
    await p.locator('#exInspector .ex-technical > summary').click();
    assert.match(await p.locator('#exInspector').innerText(),/1,3019114/);
    await p.waitForFunction(()=>{
      const state=window.entrolabExplorer.inspect();
      const marker=state.groups.find(group=>group.ids.length===1&&group.ids[0]===state.selected);
      const {width,height}=document.getElementById('exCanvas').getBoundingClientRect();
      return marker&&Math.abs(marker.x-width/2)<1&&Math.abs(marker.y-height/2)<1;
    });
    const state=await inspect(p);
    await p.locator('[data-language=en]').click();assert.match(await p.locator('#exInspector').innerText(),/Distance estimates/i);
    const after=await p.evaluate(()=>({g:window.entrolab.inspect().bodies,t:window.entrolabThermal.inspect(),e:window.entrolabEntropy.inspect()}));
    assert.deepEqual(after,before);assert.deepEqual(errors,[]);
    await p.locator('#explorer').screenshot({path:join(output,'explorer-desktop.png')});
    await writeFile(join(output,'explorer-performance.json'),JSON.stringify({browser:browser.version(),coldOpenMs,resources,lastDrawMs:state.duration},null,2)+'\n');
  }finally{await context.close();}
});

test('Explorer browser: pointer anchor, keyboard, resize, idle and tab lifecycle',async()=>{
  const {p,context,errors}=await page();try{
    await open(p);const canvas=p.locator('#exCanvas');await canvas.focus();await canvas.press('+');
    assert.ok((await inspect(p)).camera.zoom>0);
    const bounds=await canvas.boundingBox();
    const x=Math.round(bounds.x+bounds.width*.62), y=Math.round(bounds.y+bounds.height*.45);
    await p.mouse.move(x,y);
    const before=await inspect(p);await p.mouse.wheel(0,-180);await p.waitForFunction(z=>window.entrolabExplorer.inspect().camera.zoom>z,before.camera.zoom);
    const after=await inspect(p);
    const anchor=await p.evaluate(async({before,after,x,y})=>{
      const {worldPoint}=await import('./explorer/camera.mjs');
      const r=document.getElementById('exCanvas').getBoundingClientRect();
      return [before,after].map(s=>worldPoint([x-r.left,y-r.top],s.camera,r.width,r.height));
    },{before,after,x,y});
    assert.ok(Math.hypot(anchor[0][0]-anchor[1][0],anchor[0][1]-anchor[1][1])<1e-5);
    await canvas.press('ArrowRight');await canvas.press('Home');assert.equal((await inspect(p)).camera.zoom,0);
    await p.waitForTimeout(150);const draws=(await inspect(p)).draws;await p.waitForTimeout(180);assert.equal((await inspect(p)).draws,draws);
    for(let i=0;i<10;i++){await p.locator('[data-tab=gravity]').click();await p.locator('[data-tab=explorer]').click();}
    await p.locator('[data-tab=gravity]').click();await p.waitForTimeout(100);
    const closed=await inspect(p);assert.equal(closed.scheduled,false);assert.equal(closed.queued,0);assert.equal(closed.requests,0);
    await open(p);
    const spot=(await inspect(p)).groups.find(group=>group.ids.length===1);
    await canvas.click({position:{x:spot.x,y:spot.y}});
    assert.equal((await inspect(p)).selected,spot.ids[0]);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('Explorer browser: mobile pinch works on first contact, with no horizontal overflow',async()=>{
  const {p,context,errors}=await page({viewport:{width:320,height:900},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  try {
    await open(p);
    const canvas=p.locator('#exCanvas');await canvas.scrollIntoViewIfNeeded();
    const {x,y,width,height}=await canvas.boundingBox();
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.ok((await p.locator('#exZoom').boundingBox()).width>180);
    const cdp=await context.newCDPSession(p);
    const touchPoints=span=>[-1,1].map((direction,id)=>({x:x+width/2+span*direction,y:y+height/2,id}));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touchPoints(30)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touchPoints(65)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().camera.zoom>.2);
    assert.ok(Math.abs((await inspect(p)).camera.zoom-Math.log10(65/30))<.02);
    assert.equal((await inspect(p)).selected,null);
    assert.deepEqual(errors,[]);
    await p.locator('#explorer').screenshot({path:join(output,'explorer-mobile.png')});
  }finally{await context.close();}
});

test('Explorer browser: failed data is distinct from an empty search and retry recovers',async()=>{
  const {p,context}=await page();try{
    await p.route('**/explorer/data/**/manifest.json',route=>route.fulfill({status:503,body:'Unavailable'}));
    await p.locator('[data-tab=explorer]').click();await p.waitForFunction(()=>window.entrolabExplorer?.inspect().failed);
    assert.equal(await p.locator('#exError').isVisible(),true);
    await p.unroute('**/explorer/data/**/manifest.json');await p.locator('#exRetry').click();await p.waitForFunction(()=>window.entrolabExplorer.inspect().objectCount===22&&!window.entrolabExplorer.inspect().failed);
    await p.locator('#exSearch').fill('nonexistent-source');await p.waitForFunction(()=>document.querySelector('#exList').textContent.includes('Kein Treffer'));
    assert.equal(await p.locator('#exError').isVisible(),false);
    assert.match(await p.locator('#explorer').innerText(),/Himmelsabdeckung unbekannt/);
    await p.locator('#exZoom').press('End');
    await p.locator('#exCanvas').scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>document.getElementById('exMapMessage').textContent.startsWith('Keine Quelle'));
  }finally{await context.close();}
});

test('Home & Systems: observer context, proven star names and pinned system membership',async()=>{
  const {p,context,errors}=await page();
  try {
    await open(p);
    assert.match(await p.locator('.ex-orientation').innerText(),/Beobachter: Sonnensystem/);
    await p.locator('.ex-orientation summary').press('Enter');
    assert.match(await p.locator('.ex-orientation').innerText(),/Jeder Punkt markiert eine Blickrichtung/);
    assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.endsWith('/solar-model.mjs'))),false);
    await p.locator('#exSearch').fill('Proxima');
    await p.locator('#exList button').filter({hasText:'Proxima Centauri'}).press('Enter');
    await p.locator('#exInspector .ex-technical > summary').click();
    assert.match(await p.locator('#exInspector').innerText(),/5853498713190525696/);
    for (const [name,planets] of [['51 Peg b',1],['TRAPPIST-1 b',7],['HR 8799 b',4]]) {
      await p.locator('#exSearch').fill(name);
      await p.locator('#exList button').filter({hasText:name}).press('Enter');
      await p.locator('.ex-system-info summary').press('Enter');
      assert.equal(await p.locator('.ex-system-info li').count(),planets);
      assert.match(await p.locator('.ex-system-info').innerText(),/Positionen unbekannt/);
      assert.match(await p.locator('.ex-system-info a').getAttribute('href'),/blob\/4a61419b92d4a57366b111b2d11d0a03eb0b5df0/);
      assert.equal(await p.locator('#exCenter').isDisabled(),true);
    }
    await p.locator('[data-language=en]').click();
    assert.match(await p.locator('.ex-orientation').innerText(),/Observer: Solar System/);
    await p.locator('.ex-system-info summary').click();
    await p.locator('#explorer').screenshot({path:join(output,'systems-catalogue.png')});
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('Home & Systems: shared camera, model date, scaled radii, playback and separate lifecycle',async()=>{
  const {p,context,errors}=await page({reducedMotion:'no-preference'});
  try {
    await open(p);
    await p.locator('#exCanvas').press('+');
    const skyCamera=(await inspect(p)).camera;
    const physical=()=>p.evaluate(()=>({b:window.entrolab.inspect().bodies,t:window.entrolabThermal.inspect(),e:window.entrolabEntropy.inspect()}));
    const before=await physical();
    await openSolar(p);
    assert.deepEqual(await p.locator('#solList button').evaluateAll(buttons=>buttons.map(button=>button.dataset.body)),
      ['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto']);
    assert.equal((await inspect(p)).solar.markers.some(m=>m.id==='pluto'),false); // J2000 is outside the new ephemeris window.
    assert.match(await p.locator('#solTimestamp').innerText(),/2000-01-01 12:00 TDB/);
    assert.match(await p.locator('#solScaleNote').innerText(),/Symbole vergrößert/);
    assert.equal((await inspect(p)).active,false);
    assert.equal((await inspect(p)).requests,0);
    await p.locator('#explorer').screenshot({path:join(output,'systems-solar-desktop.png')});

    const canvas=p.locator('#solCanvas');
    const mars=(await inspect(p)).solar.markers.find(m=>m.id==='mars');
    // Inner bodies are close in the overview. The dedicated view separates them.
    await p.locator('#solInner').click();
    await p.waitForFunction(x=>{
      const s=window.entrolabExplorer.inspect().solar;
      return s.camera.zoom===1.2&&Math.abs(s.markers.find(m=>m.id==='mars')?.x-x)>12;
    },mars.x);
    const spot=(await inspect(p)).solar.markers.find(m=>m.id==='mars');
    await canvas.click({position:{x:spot.x,y:spot.y}});
    assert.equal((await inspect(p)).solar.selected,'mars');
    await p.locator('[data-body=earth]').press('Enter');
    assert.match(await p.locator('#solEarth').innerText(),/Erd-Mond-Schwerpunkt/);
    const firstDay=(await inspect(p)).solar.day;
    await p.locator('#solNext').press('Enter');
    assert.equal((await inspect(p)).solar.day,firstDay+1);
    await p.locator('#solDate').fill('2049-12-31');
    assert.match(await p.locator('#solTimestamp').innerText(),/2049-12-31 00:00 TDB/);

    await p.locator('#solSymbols').uncheck();
    assert.match(await p.locator('#solScaleNote').innerText(),/Körperradien im selben Maßstab/);
    await p.locator('#solCenter').click();
    await p.waitForFunction(()=>{const s=window.entrolabExplorer.inspect().solar;return !s.enlarged&&s.markers.some(m=>m.id==='earth'&&m.radius<1);});
    await canvas.scrollIntoViewIfNeeded();
    await canvas.press('Home');
    await canvas.press('+');
    const rect=await canvas.boundingBox(), x=Math.round(rect.x+rect.width*.63), y=Math.round(rect.y+rect.height*.44);
    const previous=(await inspect(p)).solar.camera;
    await p.mouse.move(x,y);await p.mouse.wheel(0,-180);
    await p.waitForFunction(z=>window.entrolabExplorer.inspect().solar.camera.zoom>z,previous.zoom);
    const next=(await inspect(p)).solar.camera;
    const drift=await p.evaluate(async({x,y,previous,next})=>{
      const {worldPoint}=await import('./explorer/camera.mjs'), {SOLAR_FRAME}=await import('./explorer/solar-view.mjs');
      const r=document.getElementById('solCanvas').getBoundingClientRect();
      const [a,b]=[previous,next].map(c=>worldPoint([x-r.left,y-r.top],c,r.width,r.height,SOLAR_FRAME));
      return Math.hypot(a[0]-b[0],a[1]-b[1]);
    },{x,y,previous,next});
    assert.ok(drift<1e-5);

    await p.locator('#solEpoch').press('Enter');
    await p.locator('#solPlay').press('Enter');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.day>2451545.02);
    await p.locator('#exSkyMode').press('Enter');
    const stopped = (await inspect(p)).solar;
    assert.deepEqual((await inspect(p)).camera,skyCamera);
    assert.equal(stopped.scheduled,false);
    assert.equal(stopped.playing,false);
    assert.equal(await p.locator('#exSkyMode').evaluate(el=>document.activeElement===el),true);
    for(let i=0;i<3;i++){await p.locator('#exSolarMode').press('Enter');await p.locator('#exSkyMode').press('Enter');}
    assert.equal((await inspect(p)).solar.day,stopped.day);
    await openSolar(p);
    await p.locator('[data-tab=gravity]').click();
    assert.equal((await inspect(p)).solar.scheduled,false);
    assert.deepEqual(await physical(),before);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('Home & Systems: 320 px touch, pinch on first contact, DE/EN and reduced motion idle',async()=>{
  const {p,context,errors}=await page({viewport:{width:320,height:900},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  try {
    await open(p);await openSolar(p);
    assert.equal(await p.locator('#solPlay').isDisabled(),true);
    const canvas=p.locator('#solCanvas'), {x,y,width,height}=await canvas.boundingBox();
    const cdp=await context.newCDPSession(p);
    const points=span=>[-1,1].map((d,id)=>({id,x:x+width/2+span*d,y:y+height/2}));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(60)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.camera.zoom>.2);
    assert.ok(Math.abs((await inspect(p)).solar.camera.zoom-Math.log10(2))<.02);
    await p.locator('[data-language=en]').click();
    assert.match(await p.locator('#exSolarPanel').innerText(),/Computed model positions/);
    const beforeFit=(await inspect(p)).solar.draws;
    await p.locator('#solFit').press('Enter');
    await canvas.scrollIntoViewIfNeeded();
    await p.waitForFunction(before=>{
      const solar=window.entrolabExplorer.inspect().solar;
      return solar.camera.zoom===0 && solar.draws>before && solar.markers.length===9 && !solar.scheduled;
    },beforeFit);
    const idle=(await inspect(p)).solar;
    await p.waitForTimeout(180);
    assert.deepEqual((await inspect(p)).solar,idle);
    for (const width of [320,390]) {
      await p.setViewportSize({width,height:900});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    await p.setViewportSize({width:320,height:900});
    await p.locator('#explorer').screenshot({path:join(output,'systems-solar-mobile.png')});
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

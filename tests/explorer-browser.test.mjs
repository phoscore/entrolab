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
    assert.match(await p.locator('#exInspector').innerText(),/1,3019114/);
    await p.waitForFunction(()=>{const s=window.entrolabExplorer.inspect();return s.groups.some(g=>g.ids.length===1&&g.ids[0]===s.selected);});
    const state=await inspect(p);const marker=state.groups.find(g=>g.ids.includes(state.selected));
    const bounds=await p.locator('#exCanvas').boundingBox();assert.ok(Math.abs(marker.x-bounds.width/2)<1);
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

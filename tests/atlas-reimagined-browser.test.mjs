import {chooseLab} from './browser-lab-navigation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,relative,extname,join,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const repo=fileURLToPath(new URL('../',import.meta.url));
const out=join(repo,'browser-results/atlas-reimagined');
// PR #27's merged main is the frozen visual reference. CI checks out full history.
const baseline='eec181cec59e7219c3d8161b0b37acf4f54f9436';
const serverFor=async root=>{
  const server=createServer(async(req,res)=>{try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
    if(relative(root,file).split(sep).includes('..')){res.writeHead(403).end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
  }catch{res.writeHead(404).end();}});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(done=>server.close(done))};
};
let reference,preview,browser,temp;
test.before(async()=>{
  await mkdir(out,{recursive:true});temp=await mkdtemp(join(tmpdir(),'atlas-before-'));
  const archive=spawnSync('git',['archive',baseline,'dist'],{cwd:repo,maxBuffer:48*1024*1024});
  if(archive.status!==0)throw new Error(`Cannot archive baseline: ${archive.stderr}`);
  const untar=spawnSync('tar',['-x','-C',temp],{input:archive.stdout});
  if(untar.status!==0)throw new Error(`Cannot extract baseline: ${untar.stderr}`);
  reference=await serverFor(join(temp,'dist'));
  preview=await serverFor(join(repo,'dist'));
  browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
});
test.after(async()=>{await browser?.close();await reference?.close();await preview?.close();if(temp)await rm(temp,{recursive:true,force:true});});

async function capture(which,site,width){
  const mobile=width<500;
  const context=await browser.newContext({viewport:{width,height:mobile?900:1100},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce',locale:'de-DE'});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(site.url);
  const startupBegan=Date.now();await chooseLab(page,'explorer');
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer?.inspect();return s?.atlas.status==='density'&&s.atlas.visible===50635&&s.objectCount===22;});
  const startupMs=Date.now()-startupBegan;
  const image=async name=>page.locator('#explorer').screenshot({path:join(out,`${which}-${name}-${width}.png`)});
  await image('gaia');
  if(which==='after'&&width===1440) {
    const alpha=await page.evaluate(async()=>{
      const {densityBitmap}=await import('./explorer/atlas-paint.mjs');
      const values=new Uint32Array(128*128);values[64*128+64]=8;
      const canvas=densityBitmap({values,max:8});
      const ctx=canvas.getContext('2d');
      return [ctx.getImageData(64*3+1,(127-64)*3+1,1,1).data[3],ctx.getImageData(63*3+1,(127-64)*3+1,1,1).data[3],ctx.getImageData(64*3,(127-64)*3+1,1,1).data[3]];
    });
    assert.ok(alpha[0]>0,'a counted cell remains visible');
    assert.equal(alpha[1],0,'an empty neighbouring cell remains transparent despite smoothing');
    assert.ok(alpha[0]>alpha[2]&&alpha[2]>0,'only the occupied side of an empty boundary fades');
  }
  await page.locator('#exDesiEnabled').check();
  await page.waitForFunction(()=>window.entrolabExplorer?.inspect().desi.status==='overview');
  // The full-height screenshot can move the canvas outside the historical
  // renderer's intersection gate before the DESI response arrives.
  await page.locator('#exCanvas').evaluate(canvas=>canvas.scrollIntoView({block:'center',behavior:'instant'}));
  await page.locator('#exHome').evaluate(button=>button.click());
  try {await page.waitForFunction(()=>{const s=window.entrolabExplorer?.inspect();return s?.desi.status==='overview'&&s.desi.counts?.selected===32392;},null,{timeout:12000});}
  catch(error) {console.error('Atlas DESI state',which,width,JSON.stringify(await page.evaluate(()=>window.entrolabExplorer?.inspect())),errors);throw error;}
  await image('combined');
  const metrics={width,startupMs,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),cold:{...await page.evaluate(()=>({atlas:window.entrolabExplorer.inspect().atlas,desi:window.entrolabExplorer.inspect().desi}))}};
  assert.equal(metrics.overflow,false);
  const id='251170104086974336';
  await page.locator('#exSearch').fill(id);
  await page.locator(`#exAtlasResults [data-gaia="${id}"]`).click();
  await page.waitForFunction(id=>window.entrolabExplorer.inspect().atlas.selected===id&&window.entrolabExplorer.inspect().atlas.detailState==='ready',id);
  await page.locator('#exZoom').evaluate(el=>{el.value='2.2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect();return s.atlas.status==='points'&&s.atlas.markers>0;});
  await image('zoom');
  if(mobile){
    if(which==='after')await page.locator('#exInspector .ex-technical > summary').click();
    await image('mobile-detail');
    await page.locator('#exHome').click();
  }else{
    if(which==='after')await page.locator('#exInspector .ex-technical > summary').click();
    await image('inspector');
    await page.locator('#exNeighborhoodMode').click();
    await page.locator('#snCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect().neighborhood;return s?.status==='ready'&&s.markers>0;});
    await image('neighborhood');
    if(which==='before'){
      await page.locator('#snXZ').click();
      assert.equal((await page.evaluate(()=>window.entrolabExplorer.inspect().neighborhood)).plane,'xz');
    }else{
      const initial=await page.evaluate(()=>window.entrolabExplorer.inspect().neighborhood.camera.yaw);
      await page.locator('#snCanvas').press('ArrowRight');
      assert.notEqual(await page.evaluate(()=>window.entrolabExplorer.inspect().neighborhood.camera.yaw),initial);
    }
    await page.locator('#snUnit').selectOption('ly');
    await page.locator('#exSkyMode').click();await page.locator('#exHome').click();
    assert.equal((await page.evaluate(()=>window.entrolabExplorer.inspect())).camera.zoom,0);
    metrics.neighborhood=await page.evaluate(()=>window.entrolabExplorer.inspect().neighborhood);
  }
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect();return s.atlas.status==='density'&&s.desi.total===32392&&!s.scheduled;});
  const timings=[];
  for(let i=0;i<6;i++){
    const from=await page.evaluate(()=>window.entrolabExplorer.inspect().camera.zoom);
    const began=Date.now();
    await page.locator('#exIn').click();
    await page.waitForFunction(from=>window.entrolabExplorer.inspect().camera.zoom>from,from);
    timings.push({interactionMs:Date.now()-began,drawMs:await page.evaluate(()=>window.entrolabExplorer.inspect().duration)});
  }
  const sorted=timings.map(t=>t.interactionMs).sort((a,b)=>a-b);
  metrics.camera={p50:sorted[2],p95:sorted[5],draws:timings.map(t=>t.drawMs)};
  await page.locator('#exHome').click();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer.inspect();return s.camera.zoom===0&&s.atlas.status==='density'&&s.desi.total===32392&&!s.scheduled;});
  await page.waitForTimeout(130);
  metrics.idle=await page.evaluate(()=>({draws:window.entrolabExplorer.inspect().draws,scheduled:window.entrolabExplorer.inspect().scheduled}));
  await page.waitForTimeout(170);
  assert.equal((await page.evaluate(()=>window.entrolabExplorer.inspect().draws)),metrics.idle.draws);
  assert.deepEqual(errors,[]);
  await context.close();return metrics;
}
test('Atlas Reimagined captures actual baseline and candidate at matching viewports, data counts, interactions and idle',async()=>{
  const measurements=[];
  for(const [name,site] of [['before',reference],['after',preview]])
    for(const width of [1440,390,320]) measurements.push({revision:name,...await capture(name,site,width)});
  await writeFile(join(out,'comparison.json'),JSON.stringify({baseline,head:process.env.GITHUB_SHA??'working tree',browser:browser.version(),measurements},null,2)+'\n');
});

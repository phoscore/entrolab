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
  await page.goto(site.url);await page.locator('[data-tab=explorer]').click();
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const s=window.entrolabExplorer?.inspect();return s?.atlas.status==='density'&&s.atlas.visible===50635&&s.objectCount===22;});
  const image=async name=>page.locator('#explorer').screenshot({path:join(out,`${which}-${name}-${width}.png`)});
  await image('gaia');
  await page.locator('#exDesiEnabled').check();
  await page.waitForFunction(()=>window.entrolabExplorer?.inspect().desi.total===32392);
  await image('combined');
  const metrics={width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),cold:{...await page.evaluate(()=>({atlas:window.entrolabExplorer.inspect().atlas,desi:window.entrolabExplorer.inspect().desi}))}};
  assert.equal(metrics.overflow,false);
  if(!mobile){
    await page.locator('#exIn').click();await page.locator('#exIn').click();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().camera.zoom>=.5);
    await image('zoom');
    await page.locator('#exSearch').fill('5853498713190525696');
    await page.locator('#exList button').first().click();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().selected!==null);
    await image('inspector');
    await page.locator('#exNeighborhoodMode').click();
    await page.locator('#snCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().neighborhood?.total===2753);
    await image('neighborhood');
    await page.locator('#snXZ').click();await page.locator('#snUnit').selectOption('ly');
    assert.equal((await page.evaluate(()=>window.entrolabExplorer.inspect().neighborhood)).plane,'xz');
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

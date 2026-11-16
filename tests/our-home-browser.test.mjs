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
const output=join(repo,'browser-results/our-home');
const baseline='0c4a6f930cd42ea8c96297a4b24f95999c23bed2';
async function serve(root){
  const server=createServer(async(req,res)=>{try{
    const path=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,'.'+decodeURIComponent(path==='/'?'/index.html':path));
    if(relative(root,file).split(sep).includes('..')){res.writeHead(403).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(data);
  }catch{res.writeHead(404).end();}});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(done=>server.close(done))};
}
let before,after,browser,temp;
test.before(async()=>{
  await mkdir(output,{recursive:true});temp=await mkdtemp(join(tmpdir(),'our-home-before-'));
  const archive=spawnSync('git',['archive',baseline,'dist'],{cwd:repo,maxBuffer:48*1024*1024});
  assert.equal(archive.status,0,archive.stderr?.toString());
  const unpack=spawnSync('tar',['-x','-C',temp],{input:archive.stdout});
  assert.equal(unpack.status,0,unpack.stderr?.toString());
  before=await serve(join(temp,'dist'));after=await serve(join(repo,'dist'));
  browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
});
test.after(async()=>{await browser?.close();await before?.close();await after?.close();if(temp)await rm(temp,{force:true,recursive:true});});
async function open(site,width,reduced=true){
  const mobile=width<500;
  const context=await browser.newContext({viewport:{width,height:mobile?900:1100},isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference',locale:'de-DE'});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(site.url);
  await page.locator('[data-tab=explorer]').click();
  await page.locator('#exCanvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>window.entrolabExplorer?.inspect().atlas?.status==='density');
  return {page,context,errors};
}
const state=p=>p.evaluate(()=>window.entrolabExplorer.inspect().solar);
test('P3 screenshots compare frozen main and corrected Gaia alone and with DESI at 1440 and 320',async()=>{
  const shots=[];
  for(const [revision,site] of [['before',before],['after',after]])for(const width of [1440,320]){
    const {page,context,errors}=await open(site,width);
    try{
      for(const layer of ['gaia','gaia-desi']){
        if(layer==='gaia-desi'){
          await page.locator('#exDesiEnabled').check();
          await page.waitForFunction(()=>window.entrolabExplorer.inspect().desi?.status==='overview');
        }
        await page.locator('#exCanvas').scrollIntoViewIfNeeded();
        const path=join(output,`${revision}-${layer}-${width}.png`);
        await page.locator('#explorer').screenshot({path});shots.push(path);
      }
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
  await writeFile(join(output,'screenshots.json'),JSON.stringify({baseline,head:process.env.GITHUB_SHA??'working tree',shots},null,2)+'\n');
});
test('comparison, camera tracking, reference, time, keyboard, mobile, language and idle work',async()=>{
  for(const width of [1440,390,320]){
    const {page,context,errors}=await open(after,width);
    try{
      await page.locator('#exSolarMode').click();
      await page.locator('#solCanvas').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar?.markers.length>0);
      await page.locator('#solTarget').selectOption('mars');
      await page.locator('#solReference').selectOption('earth');
      let s=await state(page);
      assert.equal(s.selected,'mars');assert.equal(s.reference,'earth');
      assert.ok(s.pair.distanceAU>0&&s.pair.speedKmS>0);
      assert.match(await page.locator('#solPairTitle').innerText(),/Erde–Mond-Schwerpunkt/);
      assert.match(await page.locator('#solPairDistance').innerText(),/AU/);
      assert.match(await page.locator('#solPairEpoch').innerText(),/TDB/);
      await page.locator('#solJump').click();
      const centered=await state(page);
      await page.locator('#solFollow').click();
      assert.equal((await state(page)).follow,true);
      await page.locator('#solNext').click();
      s=await state(page);
      assert.notEqual(s.day,centered.day);
      assert.notDeepEqual(s.camera,centered.camera);
      await page.locator('#solFit').click();
      assert.equal((await state(page)).follow,false);
      assert.equal((await state(page)).camera.zoom,0);
      await page.locator('#solCanvas').focus();await page.keyboard.press('ArrowRight');
      assert.notEqual((await state(page)).camera.x,0);
      await page.locator('#solTarget').selectOption('earth');
      assert.equal(await page.locator('#solPairValues').isVisible(),false);
      await page.locator('#solTarget').selectOption('saturn');
      await page.locator('#explorer').screenshot({path:join(output,`after-solar-${width}.png`)});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.locator('#exSkyMode').click();await page.locator('#exSolarMode').click();
      assert.equal((await state(page)).reference,'earth');
      await page.waitForTimeout(100);
      s=await state(page);await page.waitForTimeout(120);
      assert.equal((await state(page)).draws,s.draws);
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
});
test('unreduced playback, changing rates, touch zoom and 100 mode changes retain the comparison',async()=>{
  const {page,context,errors}=await open(after,390,false);
  try{
    await page.locator('#exSolarMode').click();
    await page.locator('#solCanvas').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar?.markers.length>0);
    await page.locator('#solTarget').selectOption('jupiter');
    await page.locator('#solReference').selectOption('saturn');
    await page.locator('#solFollow').click();
    await page.locator('#solPlay').click();
    await page.waitForFunction(()=>window.entrolabExplorer.inspect().solar.day>2451545);
    await page.locator('#solRate').selectOption({index:0});
    await page.locator('#solPlay').click();
    assert.equal((await state(page)).playing,false);
    const canvas=page.locator('#solCanvas'),box=await canvas.boundingBox();
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.locator('#solIn').click();
    assert.equal((await state(page)).follow,true);
    await page.evaluate(()=>{for(let i=0;i<100;i++){
      document.querySelector('#exSkyMode').click();document.querySelector('#exSolarMode').click();
    }});
    const s=await state(page);
    assert.equal(s.selected,'jupiter');assert.equal(s.reference,'saturn');
    assert.ok(s.pair.distanceAU>0);assert.equal(s.playing,false);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

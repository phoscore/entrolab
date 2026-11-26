import {chooseLab} from './browser-lab-navigation.mjs';
import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {parseModelDate} from '../dist/explorer/solar-model.mjs';
import {RELEASE} from '../dist/explorer/voyager-data.mjs';

let h;
before(async()=>{h=await browserHarness();});
after(async()=>{await h?.close();});
const solar=p=>p.evaluate(()=>window.entrolabExplorer.inspect().solar);
const click=(p,selector)=>p.locator(selector).click();
const canvas=p=>p.locator('#solCanvas');
const screenshot=(p,name)=>p.locator('.ex-solar-map').screenshot({path:join(h.output,'heliosphere-'+name+'.png')});
const reviewImages=[
  ['overview','Overview'],['alternate','Rotated view'],['region','Heliosheath'],
  ['both-trajectories','Voyager 1 and 2'],['crossing','Voyager 2 shock crossing'],
  ['390','390 CSS px'],['320','320 CSS px'],['events','Published events'],
  ['controls-390','390 px controls'],['controls-320','320 px controls'],
];
async function contactSheet(page){
  const sources=await Promise.all(reviewImages.map(async ([name,label])=>({
    label,source:'data:image/png;base64,'+
      (await readFile(join(h.output,'heliosphere-'+name+'.png'))).toString('base64'),
  })));
  const encoded=await page.evaluate(async sources=>{
    const cols=2, tileWidth=330, tileHeight=200;
    const canvas=document.createElement('canvas');
    canvas.width=tileWidth*cols;
    canvas.height=tileHeight*Math.ceil(sources.length/cols);
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#0a101b';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font='13px sans-serif';
    for(const [i,{label,source}] of sources.entries()){
      const img=new Image();
      img.src=source;await img.decode();
      const scale=Math.min((tileWidth-14)/img.width,(tileHeight-28)/img.height);
      const x=i%cols*tileWidth+7, y=Math.floor(i/cols)*tileHeight;
      ctx.fillStyle='#e2eaf6';ctx.fillText(label,x,y+17);
      ctx.drawImage(img,x,y+22,img.width*scale,img.height*scale);
    }
    return canvas.toDataURL('image/jpeg',.78).split(',')[1];
  },sources);
  await writeFile(join(h.output,'heliosphere-contact-sheet.jpg'),Buffer.from(encoded,'base64'));
  // Keep the visual check accessible when an Actions ZIP cannot be mounted.
  if(process.env.GITHUB_ACTIONS==='true'){
    for(let i=0;i<encoded.length;i+=1700)console.log('HELIOSPHERE_REVIEW_JPEG '+encoded.slice(i,i+1700));
  }
}
const restoredKeys=['view','day','space','camera','system','selected','reference','trails','galactic'];
async function enter(p){
  await chooseLab(p,'explorer');
  await click(p,'#exSolarMode');
  await canvas(p).scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.length>=9);
}
async function settle(p){
  await canvas(p).scrollIntoViewIfNeeded();
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
}
async function open(p){
  await click(p,'#solHeliosphere');
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.heliosphere?.crossings===4);
  await settle(p);
}
function assertRestored(actual,expected){
  for(const key of restoredKeys)assert.deepEqual(actual[key],expected[key],key);
}

test('native Chromium renders a schematic heliosphere and real crossings at 1440, 390 and 320 px',async()=>{
  for(const width of [1440,390,320]){
    const mobile=width<500;
    const {p,context}=await h.lab({viewport:{width,height:1000},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    try{
      const requests=[];
      p.on('request',request=>{if(request.url().includes('/'+RELEASE+'/'))requests.push(request.url());});
      await enter(p);
      const baseline=await solar(p);
      await open(p);
      const state=await solar(p);
      assert.equal(state.view,'3d');
      assert.equal(state.heliosphere.region,'heliopause');
      assert(state.voyager.tracks.every(count=>count>500));
      await p.waitForFunction(()=>['sun','v1','v2'].every(id=>window.entrolabExplorer.inspect().solar.markers.some(m=>m.id===id)));
      assert.equal(requests.length,3);
      assert(requests.every(url=>url.startsWith(h.url)));
      assert.equal(await p.locator('#solPlay').isDisabled(),true);
      assert.match(await p.locator('#solScene3d').textContent(),/schematisches/);
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await screenshot(p,width===1440?'overview':String(width));
      if(mobile){
        await p.locator('#helioControls').screenshot({path:join(h.output,`heliosphere-controls-${width}.png`)});
      }else{
        await canvas(p).press('ArrowRight');
        await canvas(p).press('ArrowUp');
        await settle(p);
        assert.notEqual((await solar(p)).space.yaw,state.space.yaw);
        await screenshot(p,'alternate');
        const pickRegion=async region=>{
          await p.locator('#helioRegion').selectOption(region);
          await settle(p);
          return canvas(p).evaluate(el=>el.toDataURL());
        };
        assert.notEqual(await pickRegion('wind'),await pickRegion('shock'));
        assert.notEqual(await pickRegion('interstellar'),await pickRegion('heliopause'));
        assert.match(await canvas(p).getAttribute('aria-label'),/Heliosphäre/);
        await p.locator('#helioRegion').selectOption('sheath');
        await settle(p);
        assert.match(await p.locator('#helioDescription').textContent(),/Stoßfront und Heliopause/);
        await screenshot(p,'region');
        await click(p,'#solList [data-body=neptune]');
        assert.equal((await solar(p)).selected,'neptune');
        assert.match(await p.locator('#solDistance').textContent(),/AU/);
        assert(await p.locator('#solPlanetInspector').isVisible());
        await click(p,'#helioV2');
        assert.equal((await solar(p)).selected,'v2');
        assert((await p.locator('#voyPanel dd').allTextContents()).every(value=>value.startsWith('≈')));
        await click(p,'#solFit');
        await settle(p);
        await screenshot(p,'both-trajectories');
        await click(p,'#helioEvents summary');
        await click(p,'[data-crossing=v2-shock]');
        const crossing=await solar(p);
        assert.equal(crossing.day,parseModelDate('2007-08-30'));
        assert.equal(crossing.heliosphere.event,'v2-shock');
        assert.match(await p.locator('#helioPhase').textContent(),/Überquerung der Stoßfront/);
        await settle(p);
        await screenshot(p,'crossing');
        await p.locator('#helioEvents').screenshot({path:join(h.output,'heliosphere-events.png')});
        await click(p,'#solNext');
        assert.equal((await solar(p)).heliosphere.event,null);
        assert.match(await p.locator('#helioPhase').textContent(),/Überquerung der Stoßfront/);
        await click(p,'[data-language=en]');
        assert.match(await p.locator('#solScene3d').textContent(),/schematic 3D model/);
        assert.match(await p.locator('[data-crossing=v1-pause]').textContent(),/121\.6 AU/);
      }
      await click(p,'#solHeliosphere');
      assertRestored(await solar(p),baseline);
      if(width===320)await contactSheet(p);
    }finally{await context.close();}
  }
  assert.deepEqual(h.errors,[]);
});

test('Voyager and moon state restore across heliosphere mode, which redraws only on demand',async()=>{
  const {p,context}=await h.lab();
  try{
    await enter(p);
    await click(p,'#solSystems [data-system=earth]');
    const moon=await solar(p);
    await open(p);
    await click(p,'#solHeliosphere');
    assertRestored(await solar(p),moon);

    await click(p,'#solVoyager');
    await settle(p);
    await click(p,'#solList [data-body=v2]');
    const voyager=await solar(p);
    await open(p);
    await click(p,'#solHeliosphere');
    assertRestored(await solar(p),voyager);
    await click(p,'#solVoyager');
    assertRestored(await solar(p),moon);
    await click(p,'#solGlobal');
    await click(p,'#sol3d');
    await click(p,'#solGalactic');
    assert(await p.locator('#solHeliosphere').isHidden());
    assert(await p.locator('#solHeliocentricHint').isVisible());
    await click(p,'#solHelio');
    const normal=await solar(p);
    await p.evaluate(()=>{
      for(let i=0;i<30;i++){
        document.querySelector('#solHeliosphere').click();
        document.querySelector('#solHeliosphere').click();
      }
    });
    assertRestored(await solar(p),normal);
    assert.equal((await solar(p)).heliosphere,null);
    await open(p);
    await p.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
    const before=await solar(p);
    await p.waitForTimeout(200);
    assert.equal((await solar(p)).draws,before.draws);
  }finally{await context.close();}
  assert.deepEqual(h.errors,[]);
});

import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {ENCOUNTER,FORECAST} from '../dist/explorer/our-home-data.mjs';

let h;
before(async()=>{h=await browserHarness();});
after(async()=>{await h?.close();});
const get=p=>p.evaluate(()=>window.entrolabExplorer.inspect().solar);
const canvas=p=>p.locator('#solCanvas');
const click=(p,id)=>p.locator(id).click();
const shot=(p,name,selector='.ex-solar-map')=>p.locator(selector).screenshot({path:join(h.output,'our-home-final-'+name+'.png')});
const reviewImages=[
  ['orbit','Orbit camera'],['free','Free camera · translated'],['look','Independent look'],
  ['moon','Earth–Moon'],['helio','Heliosphere'],['return','Returned to orbit'],
  ['390','390 CSS px'],['320','320 CSS px'],['controls-320','320 px controls'],
  ['apophis','Apophis and Earth'],['encounter','Apophis event and distances'],
];
async function contactSheet(page){
  const sources=await Promise.all(reviewImages.map(async ([name,label])=>({
    label,source:'data:image/png;base64,'+
      (await readFile(join(h.output,'our-home-final-'+name+'.png'))).toString('base64'),
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
  await writeFile(join(h.output,'our-home-final-contact-sheet.jpg'),Buffer.from(encoded,'base64'));
  // Keep the visual check accessible when an Actions ZIP cannot be mounted.
  if(process.env.GITHUB_ACTIONS==='true'){
    for(let i=0;i<encoded.length;i+=1700)console.log('OUR_HOME_REVIEW_JPEG '+encoded.slice(i,i+1700));
  }
}



async function settle(p){
  await canvas(p).scrollIntoViewIfNeeded();
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function open(p){
  await click(p,'[data-tab=explorer]');
  await click(p,'#exSolarMode');
  await click(p,'#sol3d');
  await settle(p);
}
async function move(p,key){
  await canvas(p).focus();
  const old=(await get(p)).free.position;
  await p.keyboard.down(key);
  try{
    await p.waitForFunction(start=>Math.hypot(...window.entrolabExplorer.inspect().solar.free.position.map((x,i)=>x-start[i]))>.0000001,old);
    await p.waitForTimeout(150);
  }finally{await p.keyboard.up(key);}
  await settle(p);
  assert.notDeepEqual((await get(p)).free.position,old);
}
function pose(before,after){
  for(const key of ['day','selected','playing','trails'])assert.deepEqual(after[key],before[key],key);
}

test('native Chromium free translation and look, focus release, restored scenes and evidence',async()=>{
  const {p,context}=await h.lab({viewport:{width:1440,height:1050}});
  try{
    await open(p);
    await p.locator('#solTarget').selectOption('jupiter');
    await click(p,'#solJump');
    await settle(p);
    await shot(p,'orbit');
    const orbit=await get(p);
    await click(p,'#solFree');
    assert(await p.locator('#solPlay').isDisabled());
    await p.locator('#solFreeSpeed').fill('2');
    assert.match(await p.locator('#solFreeSpeedText').textContent(),/AU\/s/);
    await move(p,'w');await move(p,'d');await move(p,'e');
    const moved=await get(p);
    pose(orbit,moved);
    await shot(p,'free');
    const rect=await canvas(p).boundingBox();
    const point={x:rect.x+rect.width*.5,y:rect.y+rect.height*.45};
    await p.mouse.move(point.x,point.y);await p.mouse.down();
    await p.mouse.move(point.x+46,point.y+28,{steps:5});await p.mouse.up();
    await settle(p);
    const looked=await get(p);
    assert.deepEqual(looked.free.position,moved.free.position);
    assert.notEqual(looked.free.yaw,moved.free.yaw);
    await shot(p,'look');
    await p.keyboard.down('w');
    await p.locator('#solFreeSpeed').focus();
    await p.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.free.moving);
    await p.keyboard.up('w');
    await click(p,'#solFree');
    await settle(p);
    assert.equal((await get(p)).free,null);
    assert.equal((await get(p)).space.yaw,looked.free.yaw);
    await shot(p,'return');
    await click(p,'#solFree');
    const saved=(await get(p)).free;
    await click(p,'[data-system=earth]');
    await settle(p);
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.loadedWorlds.includes('earth'));
    assert.equal((await get(p)).free,null);
    await click(p,'#solFree');
    assert.match(await p.locator('#solFreeSpeedText').textContent(),/km\/s/);
    await move(p,'a');await shot(p,'moon');
    await click(p,'#solGlobal');
    assert.deepEqual((await get(p)).free,saved);
    await click(p,'#solHeliosphere');
    await settle(p);
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.heliosphere?.crossings===4);
    await click(p,'#solFree');
    await p.locator('#solFreeSpeed').fill('-1');
    await move(p,'w');await shot(p,'helio');
    await click(p,'#solHeliosphere');
    const recovered=(await get(p)).free;
    assert.deepEqual(recovered.position,saved.position);
    await click(p,'#solFree');
    await click(p,'#solGalactic');
    await click(p,'#solFree');
    await move(p,'q');
    await click(p,'#solFree');
    await click(p,'#solHelio');
    await p.evaluate(()=>{
      const mode=document.querySelector('#solFree');
      for(let i=0;i<100;i++){mode.click();mode.click();}
    });
    await settle(p);
    await p.waitForFunction(()=>!window.entrolabExplorer.inspect().solar.scheduled);
    const idle=(await get(p)).draws;
    await p.waitForTimeout(220);
    assert.equal((await get(p)).draws,idle);
    assert.equal((await get(p)).free,null);
    assert.deepEqual(h.errors,[]);
  }finally{await context.close();}
});

test('native touch look and held directions at 390 and 320 CSS pixels',async()=>{
  for(const width of [390,320]){
    const {p,context}=await h.lab({viewport:{width,height:1050},deviceScaleFactor:2,hasTouch:true,isMobile:true});
    try{
      await open(p);
      await click(p,'#solFree');
      await settle(p);
      const bounds=await canvas(p).boundingBox(), a=(await get(p)).free;
      const touch=await context.newCDPSession(p);
      const x=bounds.x+bounds.width*.5,y=bounds.y+bounds.height*.4;
      const dispatch=(type,points)=>touch.send('Input.dispatchTouchEvent',{type,touchPoints:points});
      await dispatch('touchStart',[{x,y}]);
      await dispatch('touchMove',[{x:x+35,y:y+20}]);
      await dispatch('touchEnd',[]);
      assert.notEqual((await get(p)).free.yaw,a.yaw);
      assert.deepEqual((await get(p)).free.position,a.position);
      for(const code of ['KeyW','KeyS','KeyD','KeyE']){
        const button=p.locator(`[data-free-direction=${code}]`);
        await button.scrollIntoViewIfNeeded();
        const box=await button.boundingBox();
        const last=(await get(p)).free.position;
        await dispatch('touchStart',[{x:box.x+box.width/2,y:box.y+box.height/2}]);
        try{
          await p.waitForFunction(pos=>window.entrolabExplorer.inspect().solar.free.position.some((x,i)=>x!==pos[i]),last);
        }finally{await dispatch('touchEnd',[]);}
        assert(!(await get(p)).free.moving);
      }
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await click(p,'[data-language=en]');
      assert.match(await p.locator('#solFreeSpeedText').textContent(),/AU\/s|km\/s/);
      assert.equal(await p.locator('[data-free-direction=KeyW]').textContent(),'Forward');
      await settle(p);await shot(p,String(width));
      if(width===320)await shot(p,'controls-320','#solFreeControls');
    }finally{await context.close();}
  }
  assert.deepEqual(h.errors,[]);
});

test('trajectory forecast and Apophis event are inspected and bounded independently of camera mode',async()=>{
  const {p,context}=await h.lab({viewport:{width:1440,height:1050}});
  try{
    await open(p);
    await click(p,'#solVoyager');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.voyager?.loaded);
    await click(p,'#voyForecast');
    await p.waitForFunction(()=>document.querySelector('#solDate').max==='2027-11-26');
    assert((await get(p)).day>FORECAST.start&&(await get(p)).day<=FORECAST.end);
    assert.match(await p.locator('#voyForecastStatus').textContent(),/Prognose/);
    await click(p,'#solVoyager');
    await click(p,'#solBeyond');
    await p.locator('[data-beyond-group=asteroid]').check();
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.beyond.loaded.includes('asteroid'));
    await p.locator('#smallTarget').selectOption('apophis');
    await click(p,'#apophisJump');
    await p.waitForFunction(day=>window.entrolabExplorer.inspect().solar.day===day,ENCOUNTER.event.day);
    await settle(p);
    assert((await get(p)).markers.some(m=>m.id==='earth'));
    assert((await get(p)).markers.some(m=>m.id==='apophis'));
    assert.match(await p.locator('#apophisCentre').textContent(),/38.*km/);
    assert.match(await p.locator('#apophisHeight').textContent(),/31.*km/);
    await shot(p,'apophis');
    await shot(p,'encounter','#apophisPanel');
    await contactSheet(p);
    assert.deepEqual(h.errors,[]);
  }finally{await context.close();}
});

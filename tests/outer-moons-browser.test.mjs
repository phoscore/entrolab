import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {browserHarness} from './v08-browser-harness.mjs';
import {OUTER_RELEASE,OUTER_START,OUTER_END} from '../dist/explorer/outer-moons-spec.mjs';

let h;
before(async()=>{h=await browserHarness();});
after(async()=>{await h?.close();});
const solar=p=>p.evaluate(()=>window.entrolabExplorer.inspect().solar);
const click=(p,selector)=>p.locator(selector).click();
const canvas=p=>p.locator('#solCanvas');
const screenshot=(p,name,selector='.ex-solar-map')=>p.locator(selector).screenshot({path:join(h.output,'moon-systems-'+name+'.png')});
const reviewImages=[
  ['saturn','Saturn · full system'],['saturn-inner','Saturn · Titan and Enceladus'],
  ['uranus','Uranus'],['neptune','Neptune · Triton'],['neptune-wide','Neptune · Nereid'],
  ['return','Back to Our Home'],['390','390 CSS px'],['320','320 CSS px'],
  ['inspector-320','320 px · object inspector'],
];
async function contactSheet(page){
  const sources=await Promise.all(reviewImages.map(async ([name,label])=>({
    label,source:'data:image/png;base64,'+
      (await readFile(join(h.output,'moon-systems-'+name+'.png'))).toString('base64'),
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
  await writeFile(join(h.output,'moon-systems-contact-sheet.jpg'),Buffer.from(encoded,'base64'));
  // Keep the visual check accessible when an Actions ZIP cannot be mounted.
  if(process.env.GITHUB_ACTIONS==='true'){
    for(let i=0;i<encoded.length;i+=1700)console.log('MOON_SYSTEMS_REVIEW_JPEG '+encoded.slice(i,i+1700));
  }
}

async function settle(p){
  await canvas(p).scrollIntoViewIfNeeded();
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
}
async function enter(p){
  await click(p,'[data-tab=explorer]');
  await click(p,'#exSolarMode');
  await settle(p);
  await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.markers.length>=9);
}
async function loaded(p,id,count){
  await canvas(p).scrollIntoViewIfNeeded();
  await p.waitForFunction(({id,count})=>{
    const s=window.entrolabExplorer.inspect().solar;
    return s.system===id&&s.loadedWorlds.includes(id)&&s.markers.length>=count;
  },{id,count});
}
const snapshot=(actual,expected)=>{
  for(const key of ['view','day','space','camera','system','selected','reference','trails','galactic'])
    assert.deepEqual(actual[key],expected[key],key);
};
test('outer system navigation, real positions and mobile rendering',async()=>{
  for(const width of [1440,390,320]){
    const mobile=width<500;
    const {p,context}=await h.lab({viewport:{width,height:1050},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    try{
      const requests=[];
      p.on('request',request=>{if(request.url().includes('/'+OUTER_RELEASE+'/'))requests.push(request.url());});
      await enter(p);
      await p.locator('#solTarget').selectOption('saturn');
      const start=await solar(p);
      assert.equal(requests.length,0);
      await click(p,'#solOpenSelectedSystem');
      assert(await p.locator('#solGlobal').evaluate(el=>{
        const rect=el.getBoundingClientRect();
        return el===document.activeElement&&rect.top>=0&&rect.bottom<=innerHeight;
      }));
      await loaded(p,'saturn',8);
      assert.equal((await solar(p)).view,'3d');
      assert((await solar(p)).day>=OUTER_START&&(await solar(p)).day<=OUTER_END);
      assert.match(await p.locator('#solScene3d').textContent(),/vorherige Datum/);
      assert(await p.locator('#solPlay').isDisabled());
      assert.equal(await p.locator('#solWorldState').isHidden(),true);
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(mobile){
        await screenshot(p,String(width));
        if(width===320)await screenshot(p,'inspector-320','#solPlanetInspector');
      }else{
        await screenshot(p,'saturn');
        await click(p,'#solInner');
        await settle(p);
        assert((await solar(p)).markers.some(x=>x.id==='enceladus'));
        assert((await solar(p)).markers.some(x=>x.id==='titan'));
        await screenshot(p,'saturn-inner');
        await click(p,'#solList [data-body=enceladus]');
        assert.match(await p.locator('#solWorldNote').textContent(),/Ozean/);
        assert.match(await p.locator('#solAxis').textContent(),/km/);
        const prior=(await solar(p)).space.yaw;
        await canvas(p).press('ArrowRight');
        assert.notEqual((await solar(p)).space.yaw,prior);
        await click(p,'#solSystems [data-system=uranus]');
        await loaded(p,'uranus',6);
        await screenshot(p,'uranus');
        await click(p,'#solSystems [data-system=neptune]');
        await loaded(p,'neptune',4);
        await screenshot(p,'neptune-wide');
        await click(p,'#solInner');
        await settle(p);
        assert((await solar(p)).markers.some(x=>x.id==='triton'));
        await screenshot(p,'neptune');
        await click(p,'[data-language=en]');
        assert.match(await p.locator('#solScene3d').textContent(),/ephemeris coverage/);
        assert.match(await p.locator('#solWorldNote').textContent(),/opposite/);
        assert.equal(await p.locator('#solReference option[value=sun]').count(),0);
      }
      await click(p,'#solGlobal');
      snapshot(await solar(p),start);
      await settle(p);
      if(!mobile)await screenshot(p,'return');
      if(width===320)await contactSheet(p);
      assert.equal(requests.length,mobile?1:3);
      assert(requests.every(url=>url.startsWith(h.url)));
    }finally{await context.close();}
  }
  assert.deepEqual(h.errors,[]);
});

test('outer data integrity failure, retry, bounds and mode lifecycle',async()=>{
  const {p,context}=await h.lab({viewport:{width:1440,height:1050}});
  try{
    let fail=true;
    await p.route(`**/${OUTER_RELEASE}/neptune.bin`,route=>fail?
      route.fulfill({body:'altered vectors',status:200}):route.continue());
    await enter(p);
    const baseline=await solar(p);
    await click(p,'#solSystems [data-system=neptune]');
    await p.locator('#solWorldRetry').waitFor({state:'visible'});
    await settle(p);
    assert.deepEqual((await solar(p)).markers,[]);
    fail=false;
    await click(p,'#solWorldRetry');
    await loaded(p,'neptune',4);
    const local=await solar(p);
    await click(p,'#solVoyager');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.voyager?.loaded);
    await click(p,'#solVoyager');
    snapshot(await solar(p),local);
    await click(p,'#solHeliosphere');
    await p.waitForFunction(()=>window.entrolabExplorer.inspect().solar.heliosphere?.crossings===4);
    await click(p,'#solHeliosphere');
    snapshot(await solar(p),local);
    await click(p,'#solGlobal');
    snapshot(await solar(p),baseline);
    await p.evaluate(()=>{
      for(let i=0;i<30;i++){
        document.querySelector('[data-system=neptune]').click();
        document.querySelector('#solGlobal').click();
      }
    });
    snapshot(await solar(p),baseline);
    await click(p,'#solSystems [data-system=neptune]');
    await click(p,'#solEpoch');
    assert.equal((await solar(p)).day,OUTER_START);
    assert(await p.locator('#solPrev').isDisabled());
    await settle(p);
    const drawn=(await solar(p)).draws;
    await p.waitForTimeout(200);
    assert.equal((await solar(p)).draws,drawn);
    await click(p,'#solGlobal');
    assert.equal((await solar(p)).day,OUTER_START);
  }finally{await context.close();}
  assert.deepEqual(h.errors,[]);
});

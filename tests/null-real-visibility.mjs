import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';

async function stop(child){
 if(!child||child.exitCode!==null||child.signalCode!==null)return;
 const done=once(child,'exit');
 child.kill();
 await done;
}

async function devToolsEndpoint(profile){
 // Starting a second, headed browser can take longer on the shared CI runner.
 const deadline=performance.now()+20000;
 while(performance.now()<deadline){
  try{
   const [port,path]=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split('\n');
   if(port&&path)return 'ws://127.0.0.1:'+port+path;
  }catch(error){if(error.code!=='ENOENT')throw error;}
  await sleep(100);
 }
 throw Error('Chrome did not create DevToolsActivePort');
}

export async function checkRealVisibility(h,t){
 if(process.platform!=='linux'||(!process.env.DISPLAY&&process.env.GITHUB_ACTIONS!=='true')){
  t.skip('Requires a Linux display or the CI Xvfb installation.');
  return;
 }
 const profile=await mkdtemp(join(tmpdir(),'entrolab-tab-'));
 let xvfb,chrome,browser;
 try{
  let display=process.env.DISPLAY;
  if(!display){
   xvfb=spawn('Xvfb',['-displayfd','1','-screen','0','1280x960x24'],{stdio:['ignore','pipe','inherit']});
   const result=await Promise.race([once(xvfb.stdout,'data'),once(xvfb,'exit').then(()=>[]),sleep(8000,[])]);
   assert(result[0],'Xvfb did not allocate a display');
   display=':'+String(result[0]).trim();
  }
  chrome=spawn(chromium.executablePath(),[
   '--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check',
   '--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1200,870','about:blank',
  ],{env:{...process.env,DISPLAY:display},stdio:'ignore'});
  browser=await chromium.connectOverCDP(await devToolsEndpoint(profile),{noDefaults:true,timeout:8000});
  const context=browser.contexts()[0],site=context.pages()[0];
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  await site.goto(h.url);
  await h.ready(site);
  await site.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
  const browserSession=await browser.newBrowserCDPSession(),pageSession=await context.newCDPSession(site);
  const {targetInfo}=await pageSession.send('Target.getTargetInfo');
  const {targetId:other}=await browserSession.send('Target.createTarget',{url:'about:blank',newWindow:false,background:true});
  assert(site,'Chrome should open its first page');
  const active=targetId=>browserSession.send('Target.activateTarget',{targetId});
  const win=targetId=>browserSession.send('Browser.getWindowForTarget',{targetId});
  assert.equal((await win(targetInfo.targetId)).windowId,(await win(other)).windowId);
  await active(targetInfo.targetId);
  await site.evaluate(async()=>{
   const {initCreature}=await import('/creature-ui.mjs');
   initCreature().dispose();
   let next;
   initCreature(document,{storage:null,random:()=>.85,schedule:fn=>(next=fn,1),cancel:()=>{next=null}});
   window.startNull=()=>{const fn=next;next=null;fn()};
   window.visibilityAudit=[];
   document.addEventListener('visibilitychange',event=>{
    const n=window.entrolabCreature.inspect();
    window.visibilityAudit.push([event.isTrusted,document.visibilityState,n.visible,n.timers]);
   });
  });
  await site.waitForFunction(()=>document.visibilityState==='visible'&&window.entrolabCreature.inspect().timers===1);
  await site.evaluate(()=>window.startNull());
  assert.equal(await site.evaluate(()=>window.entrolabCreature.inspect().moving),true);
  await active(other);
  await sleep(350);
  const hidden=await site.evaluate(()=>({state:document.visibilityState,...window.entrolabCreature.inspect()}));
  assert.deepEqual([hidden.state,hidden.visible,hidden.timers],['hidden',false,0]);
  await active(targetInfo.targetId);
  await site.waitForFunction(()=>document.visibilityState==='visible'&&window.entrolabCreature.inspect().timers===1);
  const events=await site.evaluate(()=>window.visibilityAudit);
  assert.deepEqual(events.slice(-2),[[true,'hidden',false,0],[true,'visible',false,1]]);
  console.log('Null native visibility '+JSON.stringify(events.slice(-2)));
 }finally{
  await browser?.close();
  await stop(chrome);
  await stop(xvfb);
  // Chrome subprocesses may still be flushing the profile after the parent exits.
  await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});
 }
}

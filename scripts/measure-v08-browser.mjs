// Reproducible comparative smoke measurement, not a device-independent FPS guarantee.
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {createServer} from 'node:http';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const base='33947cfeccd738512c83d21bab47a696ee57e923',scratch=await mkdtemp(join(tmpdir(),'entrolab-v08-perf-'));
const output=resolve('browser-results');await mkdir(output,{recursive:true});
let browser,server;
async function beginTrace(cdp){
 try{await cdp.send('Tracing.start',{transferMode:'ReturnAsStream',traceConfig:{recordMode:'recordAsMuchAsPossible',includedCategories:['devtools.timeline']}});return {available:true}}
 catch(error){return {available:false,error:String(error.message)}}
}
async function finishTrace(cdp,start){
 if(!start.available)return {status:'unavailable',error:start.error};
 let stream;
 try{
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const result=await complete;stream=result.stream;
  if(!stream)throw Error('No trace stream returned');const chunks=[];let eof=false;
  while(!eof){const chunk=await cdp.send('IO.read',{handle:stream,size:1024*1024});chunks.push(chunk.base64Encoded?Buffer.from(chunk.data,'base64'):Buffer.from(chunk.data));eof=chunk.eof}
  const trace=JSON.parse(Buffer.concat(chunks).toString('utf8')),events=trace.traceEvents??[];
  const stats={};
  for(const name of ['Paint','Layout','UpdateLayoutTree','RasterTask']){
   const values=events.filter(e=>e.name===name&&e.ph==='X'&&Number.isFinite(e.dur)&&e.dur>=0).map(e=>e.dur/1000).sort((a,b)=>a-b);
   stats[name]={count:values.length,p50:values.length?values[Math.floor(values.length*.5)]:null,p95:values.length?values[Math.floor(values.length*.95)]:null,max:values.at(-1)??null,total:values.reduce((a,b)=>a+b,0)};
  }
  return {status:result.dataLossOccurred?'incomplete':'recorded',dataLossOccurred:!!result.dataLossOccurred,traceEvents:events.length,units:'ms, duration of recorded Chromium timeline events; not GPU end-to-end frame latency',stats};
 }catch(error){return {status:'unavailable',error:String(error.message)}}
 finally{if(stream)await cdp.send('IO.close',{handle:stream})}
}

try{
 const archive=execFileSync('git',['archive',base,'dist'],{maxBuffer:20*1024*1024});execFileSync('tar',['-x','-C',scratch],{input:archive});
 const roots={baseline:join(scratch,'dist'),current:resolve('dist')};
 server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),[,variant,...parts]=u.pathname.split('/'),root=roots[variant];if(!root){res.writeHead(404).end();return}const path=resolve(root,parts.join('/')||'index.html');if(!path.startsWith(root+'/')){res.writeHead(403).end();return}res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(path))}catch{res.writeHead(404).end()}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
 const measurements=[];
 // Opposite order in the second pair reduces simple warm-up/order bias.
 for(const repetition of [1,2])for(const scene of ['gravity-paused','extreme-visible'])for(const variant of repetition===1?['baseline','current']:['current','baseline']){
  const context=await browser.newContext({viewport:{width:1360,height:1000},deviceScaleFactor:1,locale:'de-DE',reducedMotion:'no-preference'});
  try{
   await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/'+variant+'/');await page.waitForFunction(()=>window.entrolab&&window.entrolabThermal&&document.getElementById('checkRunStatus')?.dataset.run==='1');await page.evaluate(()=>document.fonts.ready);
   if(!(await page.evaluate(()=>window.entrolab.inspect().paused)))await page.locator('#play').click();
   // Normalize drawing pixels in the measurement fixture only: the native
   // responsive grid legitimately grows with its sidebar content.
   await page.addStyleTag({content:'#universe{width:704px!important;height:600px!important;min-height:600px!important;max-height:600px!important;flex:0 0 600px!important}'});
   const canvas=scene==='gravity-paused'?'#universe':'#extremeCanvas';if(scene==='extreme-visible')await page.locator('[data-tab=extreme]').click();await page.locator(canvas).evaluate(e=>e.scrollIntoView({block:'center',behavior:'auto'}));
   await page.evaluate(()=>new Promise(done=>{let n=0;function tick(){if(++n===180)done();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
   const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');
   const traceStart=await beginTrace(cdp),before=await cdp.send('Performance.getMetrics');
   const frames=await page.evaluate(()=>new Promise(done=>{const intervals=[],longTasks=[];let last,start;const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())longTasks.push(e.duration)});observer.observe({type:'longtask'});function tick(now){if(start===undefined)start=now;if(last!==undefined)intervals.push(now-last);last=now;if(now-start>=30000){observer.disconnect();intervals.sort((a,b)=>a-b);done({duration:now-start,frames:intervals.length,p50:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),longTasks})}else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
   const after=await cdp.send('Performance.getMetrics'),get=(r,k)=>r.metrics.find(m=>m.name===k)?.value;
   const cpu=Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,get(after,k)-get(before,k)]));
   const paint=await finishTrace(cdp,traceStart),rect=await page.locator(canvas).boundingBox(),dom=await cdp.send('Memory.getDOMCounters');
   measurements.push({repetition,scene,variant,frames,cpu,paint,rect,dom,errors});console.log(JSON.stringify(measurements.at(-1)));
   if(errors.length)throw Error('Page errors: '+errors.join('; '));
  }finally{await context.close()}
 }
 const report={base,current:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:browser.version(),viewport:[1360,1000],dpr:1,font:'system fallback; Google fonts blocked',drawingFixture:'Gravity704x600 CSS px on both; existing Extreme canvas unchanged; centre-aligned scroll; test-only CSS, no production sizing change',durationPerSampleSeconds:30,repetitions:2,warmupFrames:180,paintTrace:'CDP devtools.timeline on both variants; tracing adds measurement overhead; missing traces explicitly reported',scope:'same GitHub runner/browser, paused gravity and visible existing BH animation; two order-reversed pairs, not a mobile-hardware or universal 10% guarantee',measurements};
 await writeFile(join(output,'v08-performance.json'),JSON.stringify(report,null,2));
}finally{await browser?.close();if(server)await new Promise(done=>server.close(done));await rm(scratch,{recursive:true,force:true})}

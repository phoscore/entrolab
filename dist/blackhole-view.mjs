import {prepareLabCanvas} from './lab-canvas.mjs';
import {createAccretionRenderer} from './accretion-render.mjs';
import {t,language,onLanguageChange} from './i18n.mjs';
const instances=new WeakMap();

export function drawLightDiagram(canvas, impact='wide', dpr=1){
 const fit=prepareLabCanvas(canvas,dpr);
 if(!fit)return false;
 const {ctx:x,width:w,height:h}=fit,cx=w*.5,cy=h*.50,R=Math.min(w*.113,h*.151);
 x.fillStyle='#080d1a';x.fillRect(0,0,w,h);
 x.strokeStyle='#2c3854';x.lineWidth=1;
 x.beginPath();x.moveTo(10,cy);x.lineTo(w-10,cy);x.moveTo(cx,15);x.lineTo(cx,h-16);x.stroke();
 const near=impact==='near';
 for(const sign of [-1,1])for(let i=0;i<3;i++){
  const offset=R*((near?1.81:2.03)+.28*i), bend=R*(near?.70:.31)/(1+i*.48);
  const from=cy+sign*offset,to=from-sign*bend;
  x.strokeStyle=['#f2c993','#c7a8f4','#82dbe7'][i];x.lineWidth=1.7;
  x.beginPath();x.moveTo(13,from);
  x.bezierCurveTo(cx-R*1.95,from,cx+R*1.4,from-sign*bend*.13,w-15,to);
  x.lineTo(w-23,to+5);x.moveTo(w-15,to);x.lineTo(w-23,to-5);x.stroke();
 }
 x.setLineDash([4,5]);x.strokeStyle='#f2c993af';
 x.beginPath();x.arc(cx,cy,1.5*R,0,2*Math.PI);x.stroke();x.setLineDash([]);
 x.fillStyle='#010207';x.strokeStyle='#ebf0ff';x.lineWidth=1.5;
 x.beginPath();x.arc(cx,cy,R,0,2*Math.PI);x.fill();x.stroke();
 return true;
}

export function initBlackHoleView(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);const root=doc.getElementById('blackhole'),canvas=doc.getElementById('bhIllustration');if(!root||!canvas)return null;
 const $=id=>doc.getElementById(id),win=doc.defaultView,reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),cleanup=[];
 const state={disk:true,angle:22};
 const artwork=createAccretionRenderer(canvas);
 let available=true;
 let paused=reduced.matches,seen=false,raf=null,previous=null,last=0,time=0,frames=0,cost=0,disposed=false,painted;
 const listen=(el,event,fn)=>{el.addEventListener(event,fn);cleanup.push(()=>el.removeEventListener(event,fn))};
 const visible=()=>!disposed&&root.classList.contains('active')&&!doc.hidden&&seen;
 const active=()=>visible()&&available&&!paused&&!reduced.matches&&state.disk&&$('bhView').value==='environment';
 function paint(){
  if(!visible())return;
  const {width,height}=canvas.getBoundingClientRect();
  if(width<1||height<1)return;
  const view=$('bhView').value,disk=view==='environment'&&state.disk;
  const image=[view,width,height,Math.min(win.devicePixelRatio||1,1.25),language(),disk,disk&&state.angle,disk&&time,view==='light'&&$('bhLightImpact').value];
  if(painted&&image.every((value,index)=>value===painted[index]))return;
  const start=performance.now();
  const dpr=Math.min(win.devicePixelRatio||1,1.25);
  available=view==='environment'?artwork.draw(state,time,dpr):drawLightDiagram(canvas,$('bhLightImpact').value,dpr);
  $('bhStill').toggleAttribute('hidden',available);
  $('bhStill').dataset.view=view;
  $('bhStill').dataset.disk=String(disk);
  if(!available){$('bhViewPause').disabled=true;sync();return}
  painted=image;cost=performance.now()-start;frames++;
 }
 function tick(now){raf=null;
  // Reconcile before the active guard: Chromium can update matches before it
  // delivers a change event after visibility emulation/background transitions.
  if(reduced.matches){if(!paused){paused=true;labels()}return}
  if(!active())return;const elapsed=previous===null?0:Math.min(.1,(now-previous)/1000);previous=now;time+=elapsed;
  // Timestamp bins avoid dropping to ~22 fps when 33.3 ms is rounded below 1/30 s.
  const slot=Math.floor(now*30/1000);if(slot!==last){last=slot;paint()}sync()
 }
 function sync(){
  if(active()){
   if(raf===null)raf=win.requestAnimationFrame(tick);
  }else{
   if(raf!==null)win.cancelAnimationFrame(raf);
   raf=null;previous=null;
  }
 }
 function labels(){if(reduced.matches)paused=true;const env=$('bhView').value==='environment',focused=doc.activeElement,needsFocus=focused===$('bhViewPause')&&(reduced.matches||!env)||!env&&(focused===$('bhViewAngle')||focused===$('bhViewDisk'));$('bhViewAngle').disabled=!env;$('bhViewDisk').disabled=!env;$('bhViewPause').disabled=!available||reduced.matches||!env;$('bhLightOptions').hidden=env;$('bhGeometryNote').textContent=t(env?'v09.bh.shadow':'v09.bh.rings');$('bhViewPause').textContent=t(paused?'v85.bh.play':'v85.bh.pause');$('bhViewMotion').textContent=t(reduced.matches?'v85.bh.reduced':env?'v85.bh.angleNote':'v85.bh.static');$('bhViewMeaning').textContent=t(env?'v85.bh.diskNote':'v09.bh.lightNote');paint();sync();if(needsFocus&&!doc.hidden&&root.classList.contains('active'))$('bhView').focus({preventScroll:true})}
 listen($('bhView'),'change',labels);listen($('bhLightImpact'),'change',paint);listen($('bhViewDisk'),'change',()=>{state.disk=$('bhViewDisk').checked;sync();paint()});listen($('bhViewAngle'),'input',()=>{state.angle=Number($('bhViewAngle').value);$('bhAngleValue').textContent=state.angle+'°';paint()});listen($('bhViewPause'),'click',()=>{paused=!paused;labels()});
 for(const b of doc.querySelectorAll('[data-tab]'))listen(b,'click',labels);listen(doc,'visibilitychange',labels);listen(reduced,'change',()=>{if(reduced.matches)paused=true;labels()});
 const intersection=new win.IntersectionObserver(entries=>{seen=entries[0].isIntersecting;labels()});intersection.observe(canvas);
 const resize=new win.ResizeObserver(paint);resize.observe(canvas);listen(win,'resize',paint);
 const off=onLanguageChange(labels);labels();
 const controller={inspect:()=>({view:$('bhView').value,angle:state.angle,disk:state.disk,paused,reduced:reduced.matches,seen,scheduled:raf!==null,time,frames,paintMs:cost,backing:[canvas.width,canvas.height],subscriptions:disposed?0:cleanup.length+1,observers:disposed?0:2}),dispose(){if(disposed)return;disposed=true;sync();artwork.dispose();canvas.width=canvas.height=0;intersection.disconnect();resize.disconnect();for(const fn of cleanup)fn();off();instances.delete(doc)}};
 instances.set(doc,controller);return controller;
}
if(globalThis.document){initBlackHoleView();globalThis.entrolabBlackHoleView={inspect:()=>instances.get(document)?.inspect()??{scheduled:false,subscriptions:0,observers:0}}}

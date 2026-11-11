// Reuse the existing artwork kernel, never its private Extreme Objects state.
import {drawObject,fitCanvas} from './extreme-render.mjs';
import {t,language,onLanguageChange} from './i18n.mjs';
const instances=new WeakMap();
export function drawLightDiagram(canvas){
 const f=fitCanvas(canvas,'low');if(!f)return;const {ctx:x,w,h}=f,cx=w/2,cy=h/2,R=Math.min(w*.13,h*.22);
 x.fillStyle='#06070d';x.fillRect(0,0,w,h);x.lineWidth=1.4;
 // Deliberately hand-shaped Bezier curves: no geodesic solver or physical rays.
 for(const sign of [-1,1])for(let i=0;i<3;i++){
  const gap=R*(1.55+i*.36),y=cy+sign*gap;
  x.beginPath();x.moveTo(14,y);x.bezierCurveTo(cx-R*2.6,y,cx+R*1.4,cy+sign*R*1.2,w-14,cy+sign*gap*.6);x.strokeStyle=['#f1ca92','#c9b3ee','#8fd2e5'][i];x.stroke();
 }
 x.setLineDash([4,5]);x.strokeStyle='#595368';x.beginPath();x.moveTo(cx,12);x.lineTo(cx,h-12);x.stroke();x.setLineDash([]);
 x.fillStyle='#000';x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.fill();x.strokeStyle='#e7dff3';x.lineWidth=1.5;x.stroke();
 // Inward arrow, not a trajectory escaping from within the horizon.
 x.strokeStyle='#e7dff3';x.beginPath();x.moveTo(cx-R*.75,cy);x.lineTo(cx-R*.16,cy);x.lineTo(cx-R*.35,cy-R*.12);x.moveTo(cx-R*.16,cy);x.lineTo(cx-R*.35,cy+R*.12);x.stroke();
 x.fillStyle='#d7d0e3';x.font='12px system-ui';x.textAlign='center';x.fillText(t('v85.bh.horizon'),cx,cy+R+20);x.fillText(t('v85.bh.deflection'),cx,22);x.textAlign='left';
}
export function initBlackHoleView(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);const root=doc.getElementById('blackhole'),canvas=doc.getElementById('bhIllustration');if(!root||!canvas)return null;
 const $=id=>doc.getElementById(id),win=doc.defaultView,reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),cleanup=[];
 const state={kind:'blackhole',quality:'low',zoom:1,geometry:false,disk:true,angle:22};
 let paused=reduced.matches,seen=false,raf=null,previous=null,last=0,time=0,frames=0,cost=0,disposed=false,painted;
 const listen=(el,event,fn)=>{el.addEventListener(event,fn);cleanup.push(()=>el.removeEventListener(event,fn))};
 const visible=()=>!disposed&&root.classList.contains('active')&&!doc.hidden&&seen;
 const active=()=>visible()&&!paused&&!reduced.matches&&state.disk&&$('bhView').value==='environment';
 function paint(){
  if(!visible())return;
  const {width,height}=canvas.getBoundingClientRect();
  if(width<1||height<1)return;
  const view=$('bhView').value,disk=view==='environment'&&state.disk;
  const image=[view,width,height,Math.min(win.devicePixelRatio||1,1.25),language(),disk,disk&&state.angle,disk&&time];
  if(painted&&image.every((value,index)=>value===painted[index]))return;
  const start=performance.now();
  if(view==='environment')drawObject(canvas,state,time);else drawLightDiagram(canvas);
  painted=image;cost=performance.now()-start;frames++;
 }
 function tick(now){raf=null;
  // Reconcile before the active guard: Chromium can update matches before it
  // delivers a change event after visibility emulation/background transitions.
  if(reduced.matches){if(!paused){paused=true;labels()}return}
  if(!active())return;const elapsed=previous===null?0:Math.min(.1,(now-previous)/1000);previous=now;time+=elapsed;
  // Timestamp bins avoid dropping to ~22 fps when 33.3 ms is rounded below 1/30 s.
  const slot=Math.floor(now*30/1000);if(slot!==last){last=slot;paint()}raf=win.requestAnimationFrame(tick)
 }
 function sync(){
  if(active()){
   if(raf===null)raf=win.requestAnimationFrame(tick);
  }else{
   if(raf!==null)win.cancelAnimationFrame(raf);
   raf=null;previous=null;
  }
 }
 function labels(){if(reduced.matches)paused=true;const env=$('bhView').value==='environment',focused=doc.activeElement,needsFocus=focused===$('bhViewPause')&&(reduced.matches||!env)||!env&&(focused===$('bhViewAngle')||focused===$('bhViewDisk'));$('bhViewAngle').disabled=!env;$('bhViewDisk').disabled=!env;$('bhViewPause').disabled=reduced.matches||!env;$('bhViewPause').textContent=t(paused?'v85.bh.play':'v85.bh.pause');$('bhViewMotion').textContent=t(reduced.matches?'v85.bh.reduced':env?'v85.bh.angleNote':'v85.bh.static');$('bhViewMeaning').textContent=t(env?'v85.bh.diskNote':'v85.bh.lightNote');paint();sync();if(needsFocus&&!doc.hidden&&root.classList.contains('active'))$('bhView').focus({preventScroll:true})}
 listen($('bhView'),'change',labels);listen($('bhViewDisk'),'change',()=>{state.disk=$('bhViewDisk').checked;sync();paint()});listen($('bhViewAngle'),'input',()=>{state.angle=Number($('bhViewAngle').value);$('bhAngleValue').textContent=state.angle+'°';paint()});listen($('bhViewPause'),'click',()=>{paused=!paused;labels()});
 for(const b of doc.querySelectorAll('[data-tab]'))listen(b,'click',labels);listen(doc,'visibilitychange',labels);listen(reduced,'change',()=>{if(reduced.matches)paused=true;labels()});
 const intersection=new win.IntersectionObserver(entries=>{seen=entries[0].isIntersecting;labels()});intersection.observe(canvas);
 const resize=new win.ResizeObserver(paint);resize.observe(canvas);listen(win,'resize',paint);
 const off=onLanguageChange(labels);labels();
 const controller={inspect:()=>({view:$('bhView').value,angle:state.angle,disk:state.disk,paused,reduced:reduced.matches,seen,scheduled:raf!==null,time,frames,paintMs:cost,backing:[canvas.width,canvas.height],subscriptions:disposed?0:cleanup.length+1,observers:disposed?0:2}),dispose(){if(disposed)return;disposed=true;sync();intersection.disconnect();resize.disconnect();for(const fn of cleanup)fn();off();instances.delete(doc)}};
 instances.set(doc,controller);return controller;
}
if(globalThis.document){initBlackHoleView();globalThis.entrolabBlackHoleView={inspect:()=>instances.get(document)?.inspect()??{scheduled:false,subscriptions:0,observers:0}}}

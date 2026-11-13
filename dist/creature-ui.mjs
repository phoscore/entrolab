import {creaturePolicy,creatureRandom,planAppearance,restDelay,validMode} from './creature-policy.mjs';
import {creatureArt} from './creature-art.mjs';

const instances=new WeakMap();
const preferenceKey='entrolab-decorative-motion';
const oldPreferenceKey='entrolab-creature-mode';
const inactive=Object.freeze({mounted:false,subscriptions:0,observers:0,timers:0,figures:0});

export function initCreature(doc=globalThis.document,options={}){
 if(instances.has(doc))return instances.get(doc);
 const win=doc.defaultView,guide=doc.getElementById('physicsGuide');
 const anchor=guide?.querySelector(':scope > summary');
 const control=doc.getElementById('decorativeMotion');
 const label=anchor?.querySelector(':scope > span');
 if(!anchor||!control)return null;

 const {clock=()=>win.performance.now(),schedule=(fn,ms)=>win.setTimeout(fn,ms),
  cancel=id=>win.clearTimeout(id)}=options;
 const random=options.random??creatureRandom(win.crypto?.getRandomValues(new Uint32Array(1))[0]);
 const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
 const cleanup=[];
 let storage=options.storage,mode='subtle',globalOff=false,seen=false,disposed=false;
 let pending=null,visit=null,first=true,visits=0,lastContextChange=-Infinity;
 try{
  if(storage===undefined)storage=win.localStorage;
  const preference=storage?.getItem(preferenceKey);
  const legacy=storage?.getItem(oldPreferenceKey);
  if(preference==='on'||preference==='off'){
   globalOff=preference==='off';
   mode=globalOff?'off':'subtle';
  }
  else if(validMode(legacy))mode=legacy;
 }catch{}

 const slot=doc.createElement('span'),figure=doc.createElement('span');
 slot.className='null-slot';
 slot.setAttribute('aria-hidden','true');
 slot.inert=true;
 figure.id='creature';
 figure.hidden=true;
 figure.innerHTML=creatureArt;
 slot.append(figure);
 anchor.append(slot);
 const listen=(target,type,fn,settings)=>{
  target.addEventListener(type,fn,settings);
  cleanup.push(()=>target.removeEventListener(type,fn,settings));
 };
 const measure=()=>{
  const r=slot.getBoundingClientRect();
  if(label){
   const textRange=doc.createRange();
   textRange.selectNodeContents(label);
   if(textRange.getBoundingClientRect().right>=r.left)return false;
  }
  return r.width>0&&r.height>0&&r.top>=0&&r.bottom<=win.innerHeight&&r.left>=0&&r.right<=win.innerWidth;
 };
 const eligible=()=>creaturePolicy({
  mode,reduced:motion.matches,hidden:doc.hidden,seen:seen&&measure(),
  editing:!!doc.activeElement?.closest?.('input,select,textarea,[contenteditable]:not([contenteditable="false"])'),
  focus:doc.body.classList.contains('has-focus'),guide:guide.open,
 });
 function clear(){
  if(pending!==null)cancel(pending);
  pending=null;
 }
 function display(sequence){
  figure.hidden=!sequence;
  if(sequence)figure.dataset.sequence=sequence;
  else figure.removeAttribute('data-sequence');
 }
 function wait(fn,ms){
  pending=schedule(()=>{
   pending=null;
   if(!disposed)fn();
  },ms);
 }
 function next(){
  if(!eligible().moving){reconcile();return;}
  first=false;
  visit=planAppearance(random,clock()-lastContextChange<70000);
  if(!visit){reconcile();return;}
  visits++;
  figure.style.setProperty('--null-visit',visit.duration+'ms');
  display(visit.sequence);
  wait(()=>{
   visit=null;
   display(null);
   reconcile();
  },visit.duration);
 }
 function reconcile(){
  if(disposed)return;
  const policy=eligible();
  if(!policy.moving){
   clear();
   visit=null;
   display(policy.still?'still':null);
  }else if(!visit&&pending===null){
   display(null);
   wait(next,restDelay(random,first));
  }
 }
 function updatePreference(){
  control.setAttribute('aria-pressed',String(!globalOff));
  if(globalOff)doc.body.dataset.decorativeMotion='off';
  else delete doc.body.dataset.decorativeMotion;
  reconcile();
 }
 listen(control,'click',()=>{
  globalOff=!globalOff;
  mode=globalOff?'off':'subtle';
  try{storage?.setItem(preferenceKey,mode==='off'?'off':'on')}catch{}
  updatePreference();
 });
 listen(doc,'visibilitychange',reconcile);
 listen(doc,'focusin',reconcile);
 listen(doc,'focusout',()=>win.queueMicrotask(reconcile));
 listen(doc,'click',event=>{
  if(event.target.closest?.('[data-tab],[data-entropy-view],[data-explain]'))lastContextChange=clock();
 });
 listen(motion,'change',reconcile);
 listen(win,'resize',()=>{seen=measure();reconcile();});
 const stateObserver=new win.MutationObserver(()=>{
  seen=measure();
  reconcile();
 });
 stateObserver.observe(doc.body,{attributes:true,attributeFilter:['class']});
 stateObserver.observe(guide,{attributes:true,attributeFilter:['open']});
 const observer=typeof win.IntersectionObserver==='function'?new win.IntersectionObserver(entries=>{
  seen=entries.at(-1)?.isIntersecting??false;
  reconcile();
 },{threshold:[0,.98,1]}):null;
 if(observer)observer.observe(slot);
 else listen(win,'scroll',()=>{seen=measure();reconcile();},{passive:true});
 seen=measure();
 const controller={
  inspect:()=>disposed?inactive:{
   mounted:true,visible:!figure.hidden,moving:!!visit,sequence:figure.dataset.sequence??null,
   mode,visits,subscriptions:cleanup.length,observers:1+Number(!!observer),
   timers:Number(pending!==null),figures:1,
  },
  dispose(){
   if(disposed)return;
   disposed=true;
   clear();
   observer?.disconnect();
   stateObserver.disconnect();
   for(const remove of cleanup)remove();
   slot.remove();
   delete doc.body.dataset.decorativeMotion;
   instances.delete(doc);
  },
 };
 instances.set(doc,controller);
 updatePreference();
 return controller;
}

if(globalThis.document){
 initCreature();
 globalThis.entrolabCreature={inspect:()=>instances.get(globalThis.document)?.inspect()??inactive};
}

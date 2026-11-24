import {CREATURE_COOLDOWN,creaturePolicy,creatureRandom,planAppearance,restDelay,validMode} from './creature-policy.mjs';
import {creatureArt} from './creature-art.mjs';
import {headingSpace} from './creature-places.mjs';
import {t} from './i18n.mjs';

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
 const views=[...doc.querySelectorAll('.view')];
 const explorer=doc.getElementById('explorer');
 const heading=new Map([...doc.querySelectorAll('[data-null-anchor]')].map(el=>[el.dataset.nullAnchor,el]));
 if(!anchor||!control)return null;

 const {clock=()=>win.performance.now(),schedule=(fn,ms)=>win.setTimeout(fn,ms),
  cancel=id=>win.clearTimeout(id)}=options;
 const random=options.random??creatureRandom(win.crypto?.getRandomValues(new Uint32Array(1))[0]);
 const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
 const cleanup=[];
 let storage=options.storage,mode='subtle',globalOff=false,disposed=false;
 let pending=null,visit=null,first=true,visits=0,nextAllowed=0;
 let stage=null,context=null,preferLab=false,generation=0,reason=null;
 let pointer=null,committedSelect=null;
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
 const effect=doc.createElement('span');
 effect.className='null-effect';
 const effectLabel=doc.createElement('small');
 effect.append(effectLabel);
 figure.append(effect);
 slot.append(figure);
 anchor.append(slot);
 const listen=(target,type,fn,settings)=>{
  target.addEventListener(type,fn,settings);
  cleanup.push(()=>target.removeEventListener(type,fn,settings));
 };
 const viewport=()=>({left:0,top:0,right:doc.documentElement.clientWidth,bottom:win.innerHeight});
 function guideSpace(){
  const bounds=viewport();
  const rect=(slot.parentNode===anchor?slot:anchor).getBoundingClientRect();
  const box=slot.parentNode===anchor?rect:{
   left:rect.right-(bounds.right<=600?54:84),right:rect.right,
   top:rect.top-(bounds.right<=600?0:4),bottom:rect.top+(bounds.right<=600?55:72),
  };
  if(!rect.width||!rect.height||box.top<0||box.bottom>bounds.bottom||box.left<0||box.right>bounds.right)return null;
  if(label){
   const range=doc.createRange();
   range.selectNodeContents(label);
   if(range.getBoundingClientRect().right>=box.left)return null;
  }
  return {id:'guide',host:anchor,pose:'guide'};
 }
 function currentContext(){
  const view=views.find(element=>element.classList.contains('active'))?.id;
  if(view==='entropy')return view+':'+(doc.querySelector('[data-entropy-view][aria-pressed="true"]')?.dataset.entropyView??'particles');
  if(view==='explorer'){
   const selections=explorer.querySelectorAll('.ex-mode-bar [aria-pressed="true"],#solViewBar [aria-pressed="true"],#solSystems [aria-pressed="true"]');
   return view+':'+[...selections].map(button=>button.id).join(':');
  }
  return view??'';
 }
 function chooseStage(local=false){
  const area=context.split(':')[0],bounds=viewport();
  if(!local&&!preferLab&&area==='gravity'){
   const welcome=guideSpace();
   if(welcome)return welcome;
  }
  for(const id of area==='extreme'?['temperature',area]:[area]){
   const host=heading.get(id);
   const space=host&&headingSpace(doc,host,bounds,bounds.right<=600);
   if(space)return {id,host,...space};
  }
  return local?null:guideSpace();
 }
 function place(next){
  stage=next;
  if(next.host!==slot.parentNode)next.host.append(slot);
  if(next.id==='guide'){
   delete slot.dataset.place;
   delete slot.dataset.pose;
   slot.removeAttribute('style');
  }else{
   slot.dataset.place=next.id;
   slot.dataset.pose=next.pose;
   slot.style.left=next.x+'px';
   slot.style.top=next.y+'px';
   slot.style.width=next.width+'px';
   slot.style.height=next.height+'px';
  }
 }
 const policyFor=seen=>creaturePolicy({
  mode,reduced:motion.matches,hidden:doc.hidden,seen,
  editing:pointer!==null||doc.activeElement!==committedSelect&&!!doc.activeElement?.closest?.('input,select,textarea,[contenteditable]:not([contenteditable="false"])'),
  focus:doc.body.classList.contains('has-focus'),guide:guide.open,
 });
 function clear(){
  generation++;
  if(pending!==null)cancel(pending);
  pending=null;
 }
 function display(sequence){
  figure.hidden=!sequence;
  if(sequence)figure.dataset.sequence=sequence;
  else figure.removeAttribute('data-sequence');
 }
 function stop(){
  clear();
  reason=null;
  visit=null;
  display(null);
 }
 function wait(fn,ms){
  const token=++generation;
  pending=schedule(()=>{
   if(disposed||token!==generation)return;
   pending=null;
   fn();
  },ms);
 }
 function next(){
  const plannedReason=reason;
  reason=null;
  const candidate=policyFor(true).moving&&(chooseStage(!!plannedReason)||chooseStage());
  if(!candidate){reconcile();return;}
  const welcome=first&&!preferLab&&context==='gravity';
  first=false;
  const home=welcome&&candidate.id==='guide'?chooseStage(true):null;
  const plan=planAppearance(random,{reason:plannedReason,room:candidate.pose==='hero'||home?.pose==='hero'});
  if(!plan){reconcile();return;}
  const destination=home?.pose==='hero'&&['gamma','glitch'].includes(plan.sequence)?home:candidate;
  place(destination);
  const now=clock();
  visit={...plan,started:now};
  nextAllowed=now+plan.duration+CREATURE_COOLDOWN;
  visits++;
  if(plan.sequence==='gamma')effectLabel.textContent=t('v0925.nullFiction');
  figure.style.setProperty('--null-visit',plan.duration+'ms');
  display(plan.sequence);
  wait(()=>{
   visit=null;
   display(null);
   reconcile();
  },plan.duration);
 }
 function reconcile(signal=null){
  if(disposed)return;
  const current=currentContext();
  if(context!==null&&current!==context){
   stop();
   preferLab=true;
  }
  context=current;
  const available=policyFor(true);
  const stateMayShow=available.moving||available.still;
  // Keep a visit at its chosen place until that place is no longer safe.
  const local=stateMayShow&&chooseStage(true);
  const candidate=local&&(signal||reason||visit&&stage?.id===local.id)?local:stateMayShow&&chooseStage();
  if(!candidate){stop();stage=null;return;}
  if(stage?.host!==candidate.host||stage.pose!==candidate.pose)stop();
  place(candidate);
  if(available.still){
   stop();
   display('still');
   return;
  }
  if(signal&&local&&!visit&&(reason||random()<.38)){
   clear();
   reason=signal;
   wait(next,Math.max(2600+random()*1800,nextAllowed-clock()));
  }else if(!visit&&pending===null){
   display(null);
   wait(next,Math.max(restDelay(random,first),nextAllowed-clock()));
  }
 }
 function phase(){
  if(!visit)return figure.hidden?(pending!==null?'cooldown':'hidden'):'still';
  const progress=(clock()-visit.started)/visit.duration;
  if(progress<.20)return 'entering';
  if(progress>.80)return 'retreating';
  return ['observer','peek'].includes(visit.sequence)?'observing':'reacting';
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
 listen(doc,'visibilitychange',()=>{
  pointer=null;
  committedSelect=null;
  reconcile();
 });
 listen(doc,'focusin',()=>{committedSelect=null;reconcile();});
 listen(doc,'focusout',()=>win.queueMicrotask(()=>reconcile()));
 listen(doc,'pointerdown',event=>{
  if(!event.target.closest?.('.view.active :is(canvas,input,select,textarea,[contenteditable])'))return;
  committedSelect=null;
  pointer=event.pointerId;
  reconcile();
 },true);
 function finishPointer(event){
  if(pointer!==event.pointerId)return;
  pointer=null;
  reconcile();
 }
 listen(win,'pointerup',finishPointer,true);
 listen(win,'pointercancel',finishPointer,true);
 listen(win,'blur',()=>{pointer=null;committedSelect=null;reconcile();});
 listen(doc,'keydown',event=>{
  if(event.target!==committedSelect||event.key==='Tab')return;
  committedSelect=null;
  reconcile();
 });
 // The delegates only read presentation controls. Run after the lab's own handler.
 listen(doc,'click',event=>{
  const control=event.target.closest?.('button,[data-explain]');
  if(!control)return;
  let signal;
  if(control.matches('[data-tab]'))signal=control.dataset.tab;
  else if(control.matches('[data-entropy-view],#entropyPlay,#entropyReset,#thermalPlay,#thermalReset'))signal='entropy';
  else if(control.matches('.ex-mode-bar button,#snOut,#snCenter,#solViewBar button,#solSystems button')){
   signal=control.matches('#exNeighborhoodMode,#solGalactic')?'scale':'explorer';
  }else if(control.matches('[data-mass]'))signal=Number(control.dataset.mass)>=1e36?'scale':'blackhole';
  else if(control.matches('[data-kelvin]'))signal=Number(control.dataset.kelvin)>=1e9?'scale':'temperature';
  else if(control.matches('[data-explain]'))signal='science';
  if(signal)win.queueMicrotask(()=>reconcile(signal));
 });
 listen(doc,'change',event=>{
  const control=event.target;
  if(!control.matches?.('#extremeObject,#bhView,#kelvinInput,#celsiusInput,#thermalTransferTarget'))return;
  if(control.matches('select'))committedSelect=control;
  const signal=control.id==='extremeObject'?'extreme':control.id==='bhView'?'blackhole':'temperature';
  win.queueMicrotask(()=>reconcile(signal));
 });
 listen(motion,'change',()=>reconcile());
 listen(win,'resize',()=>reconcile());
 const observer=typeof win.IntersectionObserver==='function'?new win.IntersectionObserver(()=>reconcile(),
  {threshold:[0,.25,.5,.75,1]}):null;
 const resize=typeof win.ResizeObserver==='function'?new win.ResizeObserver(()=>reconcile()):null;
 function watchHeading(element){
  observer?.observe(element);
  resize?.observe(element);
  for(const child of element.children)if(child!==slot)resize?.observe(child);
 }
 const stateObserver=new win.MutationObserver(()=>{
  if(explorer){
   const mounted=explorer.querySelector('[data-null-anchor="explorer"]');
   if(mounted&&heading.get('explorer')!==mounted){
    heading.set('explorer',mounted);
    watchHeading(mounted);
    for(const button of explorer.querySelectorAll('.ex-mode-bar button')){
     stateObserver.observe(button,{attributes:true,attributeFilter:['aria-pressed']});
    }
   }
  }
  if(visit?.sequence==='gamma')effectLabel.textContent=t('v0925.nullFiction');
  reconcile();
 });
 for(const element of [doc.body,...views])stateObserver.observe(element,{attributes:true,attributeFilter:['class']});
 for(const button of doc.querySelectorAll('[data-entropy-view]'))stateObserver.observe(button,{attributes:true,attributeFilter:['aria-pressed']});
 stateObserver.observe(guide,{attributes:true,attributeFilter:['open']});
 stateObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['lang']});
 if(explorer)stateObserver.observe(explorer,{childList:true,attributes:true,attributeFilter:['class']});
 watchHeading(anchor);
 for(const element of heading.values())watchHeading(element);
 if(!observer)listen(win,'scroll',()=>reconcile(),{passive:true});
 const controller={
  inspect:()=>disposed?inactive:{
   mounted:true,visible:!figure.hidden,moving:!!visit,sequence:figure.dataset.sequence??null,
   mode,visits,place:stage?.id??null,pose:stage?.pose??null,phase:phase(),queued:reason,context,subscriptions:cleanup.length,
   observers:1+Number(!!observer)+Number(!!resize),
   timers:Number(pending!==null),figures:1,
  },
  dispose(){
   if(disposed)return;
   disposed=true;
   clear();
   observer?.disconnect();
   resize?.disconnect();
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

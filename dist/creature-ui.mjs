import {createCreatureMachine,validMode} from './creature-policy.mjs';
import {t,onLanguageChange} from './i18n.mjs';

// One movable DOM figure, event-driven reactions, no timer/RAF or model imports.
const instances=new WeakMap();
export function initCreature(doc=globalThis.document,{clock,storage}={}){
 if(instances.has(doc))return instances.get(doc);
 const win=doc.defaultView,header=doc.querySelector('.header-tools'),guide=doc.getElementById('physicsGuide');
 if(!header||!guide)return null;
 const owned=[],cleanup=[],docks=new Map(),machine=createCreatureMachine(clock);
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),small=win.matchMedia('(max-width:600px)');
 let mode='subtle',disposed=false,observed=null,observer=null,seen=false,context='gravity',initial=true;
 try{if(storage===undefined)storage=win.localStorage;const saved=storage?.getItem('entrolab-creature-mode');if(validMode(saved))mode=saved}catch{}
 const node=(tag,key,cls)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(key){e.dataset.i18n=key;e.textContent=t(key)}return e};
 const listen=(e,type,fn,options)=>{e?.addEventListener(type,fn,options);cleanup.push(()=>e?.removeEventListener(type,fn,options))};
 const preferences=node('details',null,'creature-preferences');preferences.id='creaturePreferences';
 const preferenceSummary=node('summary','k.creature.settings');preferenceSummary.id='creaturePreferencesSummary';preferences.append(preferenceSummary);
 const preferenceBody=node('div',null,'creature-preference-body'),label=node('label','k.creature.mode'),select=node('select');
 label.htmlFor='creatureMode';select.id='creatureMode';
 for(const value of ['subtle','still','off']){const option=node('option','k.creature.'+value);option.value=value;select.append(option)}select.value=mode;
 const note=node('p','k.creature.note');note.id='creaturePreferenceNote';select.setAttribute('aria-describedby',note.id);
 preferenceBody.append(label,select,note);preferences.append(preferenceBody);header.append(preferences);owned.push(preferences);

 // Safe, normal-flow spaces. Never position an image over controls or canvases.
 for(const id of ['gravity','blackhole','extreme','entropy','science']){
  const view=doc.getElementById(id),heading=view?.querySelector('.page-heading');if(!heading)continue;
  const dock=node('div',null,'creature-dock');dock.dataset.creatureDock=id;heading.after(dock);docks.set(id,dock);owned.push(dock);
 }
 const guideDock=node('div',null,'creature-dock');guideDock.dataset.creatureDock='guide';guide.querySelector(':scope > summary').after(guideDock);docks.set('guide',guideDock);owned.push(guideDock);
 const figure=node('figure',null,'creature');figure.id='creature';figure.setAttribute('aria-hidden','true');figure.inert=true;
 const image=node('img');image.alt='';image.width=128;image.height=128;image.decoding='async';image.draggable=false;
 const caption=node('figcaption'),fiction=node('span','k.creature.fiction','creature-fiction'),comment=node('span');comment.id='creatureComment';caption.append(fiction,comment);figure.append(image,caption);
 let activeDock=null;
 const editable=e=>!preferences.contains(e)&&!!e?.closest?.('input,select,textarea,[contenteditable="true"]');
 function inViewport(e){const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<win.innerHeight&&r.right>0&&r.left<win.innerWidth}
 function route(target){
  if(guide.open&&guide.getClientRects().length)return {dock:docks.get('guide'),context:'guide'};
  const active=doc.querySelector('.view.active')?.id??'gravity';
  if(active==='entropy')context=doc.getElementById('thermalExperiment').hidden?'markers':'thermal';
  else if(active==='extreme'){
   if(target?.closest?.('.thermal-lab,#thermalTransfer,#thermalTransferTarget'))context='temperature';
   else if(context!=='temperature'||target?.closest?.('[data-tab],[data-kind]'))context='objects';
  }else context=active==='science'?'science':active;
  return {dock:docks.get(active),context};
 }
 function stop(){figure.classList.remove('creature-peek','creature-react');machine.finish()}
 function render(){
  const state=machine.inspect();
  figure.hidden=!state.visible;figure.dataset.context=state.context;figure.dataset.phase=state.phase;
  if(!state.moving||state.phase==='hidden'||state.phase==='idle')figure.classList.remove('creature-peek','creature-react');
  comment.textContent=t('k.creature.comment.'+state.context);
  if(state.visible){
   const variant=small.matches?'icon':['science','guide'].includes(state.context)?'hero':'peek';
   if(figure.dataset.variant!==variant){image.src='assets/creature-candidates/'+variant+'.webp';figure.dataset.variant=variant}
  }
 }
 function reconcile(target=null,requestReaction=false){
  if(disposed)return;
  const next=route(target),focused=doc.body.classList.contains('has-focus'),enabled=mode!=='off'&&!focused;
  for(const dock of docks.values())dock.hidden=!enabled;
  if(next.dock!==activeDock){stop();activeDock=next.dock;activeDock?.append(figure);observed=null}
  if(!activeDock)return;
  if(!enabled){observer?.disconnect();observed=null;seen=false}
  else if(observed!==activeDock){observer?.disconnect();observed=activeDock;seen=inViewport(activeDock);observer?.observe(activeDock)}
  machine.synchronize({context:next.context,mode,reduced:reduced.matches,hidden:doc.hidden,seen,editing:editable(doc.activeElement)||preferences.open,focus:focused});
  if(requestReaction&&machine.react(initial)){figure.classList.remove('creature-peek','creature-react');figure.classList.add(initial?'creature-peek':'creature-react');initial=false}
  render();
 }
 if(typeof win.IntersectionObserver==='function')observer=new win.IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.target===activeDock){seen=entry.isIntersecting;reconcile(null,initial)}
 });
 else listen(win,'scroll',()=>{if(activeDock){seen=inViewport(activeDock);reconcile()}},{passive:true});
 listen(select,'change',()=>{if(!validMode(select.value))return;mode=select.value;try{storage?.setItem('entrolab-creature-mode',mode)}catch{}stop();reconcile()});
 listen(preferences,'keydown',event=>{if(event.key==='Escape'){preferences.open=false;preferenceSummary.focus();event.preventDefault();event.stopPropagation();stop();reconcile()}});
 listen(doc,'click',event=>{
  const tab=event.target.closest?.('[data-tab]');if(tab){preferences.open=false;stop()}
  const relevant=event.target.closest?.('[data-tab],[data-entropy-view],[data-kind],#helpToggle,#reset,#entropyReset,#thermalApply,#entropyStep,#thermalStep,#thermalTransfer,[data-model-link],[data-explain]');
  reconcile(event.target,!!relevant);
 });
 listen(doc,'toggle',event=>{if(event.target===preferences){stop();reconcile()}else if(event.target===guide){stop();reconcile(null,guide.open)}else if(event.target.open&&event.target.matches?.('.learning-question,.knowledge-help,.knowledge-advanced,.learning-panel'))reconcile(event.target,true)},true);
 listen(doc,'keydown',event=>{if(event.key==='Escape'){stop();reconcile()}});
 listen(doc,'focusin',()=>reconcile());
 listen(doc,'visibilitychange',()=>{stop();reconcile()});
 listen(win,'resize',()=>{if(activeDock)seen=inViewport(activeDock);reconcile()});
 listen(reduced,'change',()=>{stop();reconcile()});listen(small,'change',()=>reconcile());
 listen(figure,'animationend',()=>{stop();render()});listen(figure,'animationcancel',()=>{machine.finish();render()});
 const bodyObserver=new win.MutationObserver(()=>{stop();reconcile()});bodyObserver.observe(doc.body,{attributes:true,attributeFilter:['class']});
 const unsubscribe=onLanguageChange(()=>reconcile());
 const controller={inspect:()=>({...machine.inspect(),mounted:!disposed,subscriptions:disposed?0:cleanup.length+1,observers:disposed?0:1+(observed&&observer?1:0),timers:0,figures:disposed?0:1}),dispose(){if(disposed)return;disposed=true;stop();observer?.disconnect();bodyObserver.disconnect();unsubscribe();for(const off of cleanup)off();figure.remove();for(const e of owned)e.remove();instances.delete(doc)}};
 instances.set(doc,controller);reconcile(null,true);return controller;
}
if(globalThis.document){initCreature();globalThis.entrolabCreature={inspect:()=>instances.get(globalThis.document)?.inspect()??{mounted:false,subscriptions:0,observers:0,timers:0,figures:0}}}

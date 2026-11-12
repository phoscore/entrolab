// One help lifecycle for legacy glossary links, new model links and deep links.
// Navigation calls existing tab controls; never calls a model/Apply/Reset method.
import {t,onLanguageChange} from './i18n.mjs';
const instances=new WeakMap();
export function initGuide(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);
 const glossary=doc.getElementById('physicsGuide'),back=doc.getElementById('guideReturn');
 if(!glossary||!back)return null;
 const originalParent=back.parentNode,originalNext=back.nextSibling,win=doc.defaultView;
 const bound=new WeakSet(),cleanup=[];
 const modelDestination=target=>doc.getElementById('matter')?.contains(target)?'matter':doc.getElementById('science')?.contains(target)?'science':null;
 const modelSlot=destination=>doc.getElementById(destination==='matter'?'matterReturnSlot':'knowledgeReturnSlot');
 let origin=null,kind='term',sourceTab=null,previousHash='',routing=false,disposed=false,coldTerm=false,suspendedTerm=null;
 const listen=(target,event,fn,capture=false)=>{target?.addEventListener(event,fn,capture);cleanup.push(()=>target?.removeEventListener?.(event,fn,capture))};
 function focusVisible(target){
  if(!target?.isConnected||target.disabled||!target.getClientRects().length)return false;
  target.focus();if(doc.activeElement!==target)return false;
  target.scrollIntoView?.({block:'center'});return true;
 }
 function putBack(){if(originalParent&&back.parentNode!==originalParent){if(originalNext?.parentNode===originalParent)originalParent.insertBefore(back,originalNext);else originalParent.append(back)}}
 function label(){const key=origin&&(kind==='model'||sourceTab?.dataset.tab==='science')?'k.ui.return':'Zurück zum Labor';back.textContent=t(key)}
 function activate(tab){if(!tab||tab.classList?.contains('active'))return;routing=true;try{tab.click()}finally{routing=false}}
 function changeHash(hash,replace=false){
  if(!win?.history||win.location.hash===hash)return;
  const url=hash||win.location.pathname+win.location.search;
  win.history[replace?'replaceState':'pushState'](null,'',url);
 }
 function close(restore=true){
  if(!origin)return;
  const previous=origin,from=sourceTab,hash=previousHash,wasModel=kind==='model',wasColdTerm=coldTerm,resume=suspendedTerm;
  origin=null;sourceTab=null;coldTerm=false;suspendedTerm=null;back.hidden=true;putBack();
  if(!wasModel)glossary.open=false;
  if(restore&&wasModel)activate(from);
  if(restore&&(wasModel||wasColdTerm))changeHash(hash,true);
  if(restore&&wasModel){
   for(let p=previous.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
   // One bounded return frame for glossary → model → glossary. Direct lab
   // navigation discards it; a second Escape then returns to the lab trigger.
   if(resume){({origin,kind,sourceTab,previousHash,coldTerm}=resume);back.hidden=false}
  }
  label();
  if(restore&&!focusVisible(previous)&&!focusVisible(doc.querySelector?.('[data-tab].active')))focusVisible(doc.getElementById('mainContent'));
 }
 function open(link,mode='term'){
  const id=mode==='model'?link.dataset.modelLink:link.dataset.explain,target=doc.getElementById(id);
  if(!target)return false;
  const destination=mode==='model'?modelDestination(target):null;
  if(mode==='model'&&(!id.startsWith('model-')||!destination))return false;
  const from=doc.querySelector?.('[data-tab].active'),hash=win?.location.hash??'';
  const resume=mode==='model'&&glossary.contains(link)&&kind==='term'&&origin?{origin,kind,sourceTab,previousHash,coldTerm}:null;
  close(false);
  if(destination)activate(doc.querySelector('[data-tab="'+destination+'"]'));
  origin=link;kind=mode;sourceTab=from;previousHash=hash;suspendedTerm=resume;
  if(mode==='model'){
   modelSlot(destination)?.append(back);
   for(let p=target.parentElement;p&&p!==doc.getElementById(destination);p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
   changeHash('#'+id);
  }else glossary.open=true;
  back.hidden=false;label();focusVisible(target);return true;
 }
 // Keep existing direct bindings compatible with established controlled-DOM tests.
 // The delegated path handles later-created triggers, without rebinding the page.
 for(const link of doc.querySelectorAll('[data-explain]')){
  bound.add(link);listen(link,'click',e=>{if(open(link))e.preventDefault()});
 }
 listen(doc,'click',e=>{
  const link=e.target?.closest?.('[data-model-link],[data-explain]');
  if(!link||bound.has(link))return;
  if(open(link,link.dataset.modelLink?'model':'term'))e.preventDefault();
 });
 for(const tab of doc.querySelectorAll('[data-tab]'))listen(tab,'click',()=>{
  close(false);
  if(!routing&&win?.location.hash&&/^(#model-|#guide-|#(?:gravity|blackhole|extreme|entropy|matter|science|temperature)$)/.test(win.location.hash))changeHash('#'+tab.dataset.tab,true);
 },true);
 listen(glossary,'toggle',()=>{if(kind==='term'&&!glossary.open)close(false)});
 listen(back,'click',()=>close());
 listen(doc,'keydown',e=>{
  const container=kind==='model'?doc.getElementById(doc.querySelector('[data-tab].active')?.dataset.tab):glossary;
  if(e.key==='Escape'&&origin&&container?.contains(doc.activeElement)){e.stopImmediatePropagation();close()}
 },true);
 function resolveFragment(){
  if(!win)return false;
  if(origin&&kind==='model'&&win.location.hash===previousHash){close();return true}
  let id;try{id=decodeURIComponent(win.location.hash.slice(1))}catch{return false}
  if(!id||!/^[a-z][a-z0-9-]*$/.test(id))return false;
  const tabs=['gravity','blackhole','extreme','entropy','matter','science'];
  const target=doc.getElementById(id);
  if(tabs.includes(id)){
   close(false);activate(doc.querySelector('[data-tab="'+id+'"]'));focusVisible(doc.querySelector('[data-tab="'+id+'"]'));return true;
  }
  if(id==='temperature'&&target){close(false);activate(doc.querySelector('[data-tab="extreme"]'));return focusVisible(target)}
  if(id.startsWith('guide-')&&target&&glossary.contains(target)){
   close(false);sourceTab=doc.querySelector?.('[data-tab].active');origin=sourceTab??glossary.querySelector?.(':scope > summary');kind='term';coldTerm=true;previousHash=sourceTab?'#'+sourceTab.dataset.tab:'';glossary.open=true;back.hidden=!origin;label();focusVisible(target);return true;
  }
  const destination=target&&id.startsWith('model-')&&modelDestination(target);
  if(destination){
   for(let p=target.parentElement;p&&p!==doc.getElementById(destination);p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
   close(false);
   sourceTab=doc.querySelector('[data-tab="'+destination+'"]');activate(sourceTab);
   origin=sourceTab;kind='model';previousHash='#'+destination;modelSlot(destination)?.append(back);
   back.hidden=!origin;label();focusVisible(target);return true;
  }
  return false;
 }
 listen(win,'hashchange',resolveFragment);listen(win,'popstate',resolveFragment);
 const unsubscribe=onLanguageChange(label);
 const controller={close,open,resolveFragment,inspect:()=>({context:origin?.id??null,kind,subscriptions:disposed?0:cleanup.length+1}),dispose(){if(disposed)return;disposed=true;close(false);for(const off of cleanup)off();unsubscribe();instances.delete(doc)}};
 instances.set(doc,controller);return controller;
}
if(globalThis.document)initGuide();

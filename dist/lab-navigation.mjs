import {onLanguageChange, t} from './i18n.mjs';

const nav=document.getElementById('labNavigation');
const toggle=document.getElementById('labMenu');
const label=document.getElementById('labMenuName');
const tabs=[...nav.querySelectorAll('[data-tab]')];
const compact=matchMedia('(max-width:760px)');
let wasCompact=compact.matches,lastNavigationFocus=null;
const active=()=>tabs.find(tab=>tab.classList.contains('active'))??tabs[0];
const expanded=()=>toggle.getAttribute('aria-expanded')==='true';

function nameCurrent(){
 const id=active().dataset.tab;
 const name=t('identity.'+id);
 toggle.dataset.current=id;
 toggle.setAttribute('aria-label',t('identity.menu',{name}));
 label.textContent=name;
}
function close(restore=false){
 if(!expanded())return;
 if(restore)toggle.focus();
 toggle.setAttribute('aria-expanded','false');
}
export function openLabChoices(){
 if(!compact.matches)return;
 toggle.setAttribute('aria-expanded','true');
 active().focus();
}

toggle.addEventListener('click',()=>{if(expanded())close(true);else openLabChoices();});
nav.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&expanded()){
  event.preventDefault();
  event.stopPropagation();
  close(true);
  return;
 }
 if(!expanded())return;
 const index=tabs.indexOf(event.target);
 if(index<0)return;
 const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-2,ArrowDown:2};
 const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:index+offsets[event.key];
 if(Number.isInteger(next)){
  event.preventDefault();
  tabs[(next+tabs.length)%tabs.length].focus();
 }
});
document.addEventListener('focusin',event=>{
 lastNavigationFocus=nav.contains(event.target)?event.target:null;
});
nav.addEventListener('focusout',event=>{
 if(nav.contains(event.relatedTarget))return;
 if(compact.matches===wasCompact)lastNavigationFocus=null;
 close();
});
document.addEventListener('pointerdown',event=>{
 if(nav.contains(event.target))return;
 lastNavigationFocus=null;
 if(expanded())close(nav.contains(document.activeElement)&&!event.target.closest('a,button,input,select,textarea,[tabindex]'));
});
for(const tab of tabs)tab.addEventListener('click',()=>{
 nameCurrent();
 if(compact.matches)close(expanded());
});
compact.addEventListener('change',()=>{
 // CSS can hide the old control and release its focus before this event.
 const focused=document.activeElement;
 const previous=focused===document.body?lastNavigationFocus:focused;
 wasCompact=compact.matches;
 if(wasCompact&&tabs.includes(previous))toggle.focus();
 else if(!wasCompact&&previous===toggle)active().focus();
 close();
});
onLanguageChange(nameCurrent);
nameCurrent();

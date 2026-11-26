import {onLanguageChange, t} from './i18n.mjs';

const nav=document.getElementById('labNavigation');
const toggle=document.getElementById('labMenu');
const label=document.getElementById('labMenuName');
const tabs=[...nav.querySelectorAll('[data-tab]')];
const compact=matchMedia('(max-width:760px)');
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
nav.addEventListener('focusout',event=>{
 if(!nav.contains(event.relatedTarget))close();
});
document.addEventListener('pointerdown',event=>{
 if(expanded()&&!nav.contains(event.target)){
  close(nav.contains(document.activeElement)&&!event.target.closest('a,button,input,select,textarea,[tabindex]'));
 }
});
for(const tab of tabs)tab.addEventListener('click',()=>{
 nameCurrent();
 if(compact.matches)close(expanded());
});
compact.addEventListener('change',()=>{
 if(compact.matches&&tabs.includes(document.activeElement))toggle.focus();
 else if(!compact.matches&&document.activeElement===toggle)active().focus();
 close();
});
onLanguageChange(nameCurrent);
nameCurrent();

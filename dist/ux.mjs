import {t,language,setLanguage,onLanguageChange,localizeTree} from './i18n.mjs';
export function initUX(doc=globalThis.document){
 const $=id=>doc.getElementById(id);let focus=null,returnTo=null;
 const focusButtons=[...doc.querySelectorAll('[data-focus]')];
 function labels(){for(const b of doc.querySelectorAll('[data-language]'))b.setAttribute('aria-pressed',String(b.dataset.language===language()));for(const b of focusButtons){b.textContent=t(focus===b.dataset.focus?'Fokus verlassen':'Fokusmodus');b.setAttribute('aria-pressed',String(focus===b.dataset.focus))}}
 function exit(){if(!focus)return;doc.getElementById(focus).classList.remove('focus-view');doc.body.classList.remove('has-focus');focus=null;labels();returnTo?.focus();doc.defaultView?.dispatchEvent(new Event('resize'))}
 for(const b of focusButtons)b.addEventListener('click',()=>{if(focus===b.dataset.focus){exit();return}exit();focus=b.dataset.focus;returnTo=b;$(focus).classList.add('focus-view');doc.body.classList.add('has-focus');labels();b.focus();doc.defaultView?.dispatchEvent(new Event('resize'))});
 for(const b of doc.querySelectorAll('[data-tab]'))b.addEventListener('click',exit);
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'){exit();if(!$('quickStart').hidden){$('quickStart').hidden=true;$('helpToggle').setAttribute('aria-expanded','false');$('helpToggle').focus()}}});
 $('helpToggle').addEventListener('click',()=>{const open=$('quickStart').hidden;$('quickStart').hidden=!open;$('helpToggle').setAttribute('aria-expanded',String(open));if(open)$('helpClose').focus()});
 $('helpClose').addEventListener('click',()=>{$('quickStart').hidden=true;$('helpToggle').setAttribute('aria-expanded','false');$('helpToggle').focus()});
 for(const b of doc.querySelectorAll('[data-language]'))b.addEventListener('click',()=>setLanguage(b.dataset.language));
 const unsubscribe=onLanguageChange(labels);localizeTree(doc);labels();
 return {exit,dispose:unsubscribe,get focus(){return focus}};
}
if(globalThis.document)initUX();

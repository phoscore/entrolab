// Reuse the existing glossary. Opening help changes neither navigation nor lab state.
export function initGuide(doc=globalThis.document){
 const glossary=doc.getElementById('physicsGuide'),back=doc.getElementById('guideReturn');let origin=null;
 function close(){if(!origin)return;glossary.open=false;back.hidden=true;origin.focus();origin.scrollIntoView?.({block:'center'});origin=null}
 for(const link of doc.querySelectorAll('[data-explain]'))link.addEventListener('click',e=>{const target=doc.getElementById(link.dataset.explain);if(!target)return;e.preventDefault();origin=link;glossary.open=true;back.hidden=false;target.focus();target.scrollIntoView?.({block:'center'})});
 back.addEventListener('click',close);
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&origin&&glossary.contains(doc.activeElement)){e.stopImmediatePropagation();close()}},true);
 return {close};
}
if(globalThis.document)initGuide();

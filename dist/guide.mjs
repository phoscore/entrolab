// Reuse the existing glossary. Opening help changes neither navigation nor lab state.
export function initGuide(doc=globalThis.document){
 const glossary=doc.getElementById('physicsGuide'),back=doc.getElementById('guideReturn');let origin=null;
 function focusVisible(target){
  if(!target?.isConnected||target.disabled||!target.getClientRects().length)return false;
  target.focus();if(doc.activeElement!==target)return false;
  target.scrollIntoView?.({block:'center'});return true;
 }
 function close(restore=true){
  if(!origin)return;
  const previous=origin;origin=null;glossary.open=false;back.hidden=true;
  if(restore&&!focusVisible(previous)&&!focusVisible(doc.querySelector('[data-tab].active')))focusVisible(doc.getElementById('mainContent'));
 }
 for(const link of doc.querySelectorAll('[data-explain]'))link.addEventListener('click',e=>{const target=doc.getElementById(link.dataset.explain);if(!target)return;e.preventDefault();origin=link;glossary.open=true;back.hidden=false;target.focus();target.scrollIntoView?.({block:'center'})});
 // Clear the origin before navigation hides its view; the navigation owns focus.
 for(const tab of doc.querySelectorAll('[data-tab]'))tab.addEventListener('click',()=>close(false),true);
 // A native details collapse also ends the context, without stealing summary focus.
 glossary.addEventListener('toggle',()=>{if(!glossary.open)close(false)});
 back.addEventListener('click',()=>close());
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&origin&&glossary.contains(doc.activeElement)){e.stopImmediatePropagation();close()}},true);
 return {close};
}
if(globalThis.document)initGuide();

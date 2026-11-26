import {explanations,modelById} from './knowledge.mjs';
import {t,onLanguageChange} from './i18n.mjs';

// Presentation only: no model imports, RNG, timers or synthetic Apply actions.
const instances=new WeakMap();
export function initExplanations(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);
 const anchors={gravity:'#gravity .page-heading h1',blackhole:'#blackhole .page-heading h1',objects:'#extreme .page-heading h1',temperature:'#temperature .page-heading h1'};
 const cleanup=[],owned=[],views=[];let disposed=false;
 const node=(tag,key,cls)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(key){e.dataset.i18n=key;e.textContent=t(key)}return e};
 const listen=(e,type,fn)=>{e.addEventListener(type,fn);cleanup.push(()=>e.removeEventListener(type,fn))};
 for(const q of explanations){
  let anchor=doc.querySelector(anchors[q.id]??'#'+(q.id==='markers'?'particleExperiment':'thermalExperiment'));
  if(!anchor)continue;
  if(q.id==='thermal')anchor=anchor.querySelector(':scope > h2')??anchor;
  if(q.id==='markers'){const heading=node('h2','k.question.ui.'+q.id+'Title','learning-context-title');anchor.prepend(heading);owned.push(heading);anchor=heading}
  const details=node('details',null,'learning-question');details.id='why-'+q.id;details.dataset.context=q.id;
  const summary=node('summary',q.question);summary.id=details.id+'-summary';details.append(summary);
  const content=node('div',null,'learning-question-content');
  for(const field of ['observe','cause','use','limit']){content.append(node('h3','k.question.ui.'+field),node('p',q[field]))}
  const more=node('details',null,'knowledge-advanced');more.append(node('summary','k.question.ui.predict'));
  const fieldset=node('fieldset');fieldset.append(node('legend',q.quiz));
  const radios=[];
  for(const option of q.options){const label=node('label',null,'learning-option'),input=node('input');input.type='radio';input.name='prediction-'+q.id;input.value=option.id;input.id=details.id+'-'+option.id;label.append(input,node('span',option.label));fieldset.append(label);radios.push(input)}
  const actions=node('div',null,'learning-actions'),check=node('button','k.question.ui.check'),show=node('button','k.question.ui.show');
  check.type=show.type='button';check.className=show.className='secondary';actions.append(check,show);
  const status=node('p',null,'learning-feedback');status.id=details.id+'-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');fieldset.setAttribute('aria-describedby',status.id);
  const answer=node('div',null,'learning-answer');answer.hidden=true;answer.append(node('h4','k.question.ui.solution'),node('p',q.answer));
  more.append(fieldset,actions,status,answer);content.append(more);
  content.append(node('h3','k.question.ui.try'),node('p',q.try));
  const locate=node('button','k.question.ui.locate','secondary');locate.type='button';locate.dataset.locateContext=q.id;
  const link=node('a','k.ui.model','knowledge-model-link');link.id='question-model-'+q.id;link.href='#'+modelById[q.model].target;link.dataset.modelLink=modelById[q.model].target;
  const locateStatus=node('p');locateStatus.setAttribute('role','status');
  content.append(locate,link,locateStatus);details.append(content);if(['gravity','blackhole','objects','temperature'].includes(q.id))anchor=anchor.parentElement.querySelector('.lab-tagline')??anchor;anchor.after(details);owned.push(details);
  const state={feedback:null,unavailable:false};
  function render(){status.textContent=state.feedback?t('k.question.ui.'+state.feedback):'';locateStatus.textContent=state.unavailable?t('k.question.ui.unavailable'):''}
  listen(check,'click',()=>{const selected=radios.find(x=>x.checked);state.feedback=!selected?'choose':selected.value===q.correct?'correct':'incorrect';answer.hidden=!selected;render()});
  listen(show,'click',()=>{state.feedback=null;answer.hidden=false;render()});
  for(const radio of radios)listen(radio,'change',()=>{state.feedback=null;answer.hidden=true;render()});
  listen(locate,'click',()=>{
   const target=q.target.startsWith('[')?doc.querySelector(q.target):doc.getElementById(q.target);
   if(!target){state.unavailable=true;render();return}
   // Opening ancestor disclosures changes presentation only; never click a model control.
   for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
   if(target.getClientRects().length&&!target.disabled){target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:'auto'});state.unavailable=false}else state.unavailable=true;
   render();
  });
  listen(details,'keydown',event=>{
   if(event.key!=='Escape'||event.defaultPrevented)return;
   const inner=event.target.closest('details');
   if(inner&&details.contains(inner)&&inner.open){inner.open=false;inner.querySelector(':scope > summary')?.focus();event.preventDefault();event.stopPropagation()}
  });
  views.push({render});
 }
 const unsubscribe=onLanguageChange(()=>{for(const v of views)v.render()});
 const controller={inspect:()=>({contexts:views.length,subscriptions:disposed?0:1,timers:0,mounted:!disposed}),dispose(){if(disposed)return;disposed=true;unsubscribe();for(const off of cleanup)off();for(const e of owned)e.remove();instances.delete(doc)}};
 instances.set(doc,controller);return controller;
}
if(globalThis.document){initExplanations();globalThis.entrolabExplanations={inspect:()=>instances.get(globalThis.document)?.inspect()??{mounted:false,subscriptions:0,timers:0}}}

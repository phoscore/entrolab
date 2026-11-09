import {terms,models,sources,termById,modelById} from './knowledge.mjs';
import {t,onLanguageChange} from './i18n.mjs';
import {initGuide} from './guide.mjs';

const instances=new WeakMap();
export function initKnowledge(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);
 const glossary=doc.getElementById('physicsGuide'),science=doc.getElementById('science');
 if(!glossary||!science)return null;
 const cleanup=[],owned=[],summaries=[];let serial=0,disposed=false;
 const guide=initGuide(doc);
 const node=(tag,key,cls)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(key){e.dataset.i18n=key;e.textContent=t(key)}return e};
 const detail=(key,cls='knowledge-advanced')=>{const e=node('details',null,cls);e.append(node('summary',key));return e};
 function sourceList(ids){
  const list=node('ul',null,'knowledge-sources');
  for(const id of ids){const source=sources[id],li=node('li'),a=node('a');a.href=source.url;a.textContent=source.publisher+' · '+source.title;a.target='_blank';a.rel='noopener';a.dataset.source=id;li.append(a);
   if(source.kind==='implementation')li.append(node('small','k.ui.sourceCode'));
   list.append(li);
  }
  return list;
 }
 function modelLink(model,origin){const a=node('a','k.ui.model','knowledge-model-link');a.href='#'+modelById[model].target;a.dataset.modelLink=modelById[model].target;a.id=origin||'knowledge-link-'+(++serial);return a}
 function definition(term){
  const body=node('div',null,'knowledge-definition');body.append(node('p',term.short));
  const legacy={microstate:'Advanced · Fluktuationen',stars:'Advanced · Sternbeispiele & Pulsar',universe:'Gravitation im Lab',schwarzschild:'Advanced',hawking:'Advanced'};
  const advanced=detail(legacy[term.id]??'k.ui.advanced');advanced.append(node('p',term.long));
  if(term.equation){const formula=node('p',null,'knowledge-formula');formula.textContent=term.equation;advanced.append(formula)}
  advanced.append(node('h4','k.ui.sources'),sourceList(term.sources),modelLink(term.model));body.append(advanced);return body;
 }
 function help(id){
  const term=termById[id],e=node('details',null,'knowledge-help'),summary=node('summary');
  summary.id='knowledge-help-'+(++serial);summary.append(doc.createTextNode('ⓘ '),node('span',term.label));
  e.dataset.knowledgeTerm=id;e.append(summary,definition(term));summaries.push({summary,term});return e;
 }

 // Replace definitions in the existing glossary, retaining all legacy target IDs
 // and its original return button. Restore the original DOM on explicit disposal.
 const oldDls=[...glossary.querySelectorAll('dl')],newDl=node('dl',null,'knowledge-glossary');
 for(const term of terms){const dt=node('dt',term.label);dt.id=term.target;dt.tabIndex=-1;const dd=node('dd');dd.append(definition(term));newDl.append(dt,dd)}
 oldDls[0].before(newDl);owned.push(newDl);
 const detached=oldDls.map(e=>({e,parent:e.parentNode,next:e.nextSibling}));for(const {e}of detached)e.remove();
 cleanup.push(()=>{for(const {e,parent,next}of detached.reverse()){if(next?.parentNode===parent)parent.insertBefore(e,next);else parent.append(e)}});
 const oldSources=glossary.querySelector('.guide-sources');
 if(oldSources){const previous=[...oldSources.childNodes];oldSources.replaceChildren(node('p','k.ui.guideNote'));cleanup.push(()=>oldSources.replaceChildren(...previous))}
 const oldNote=glossary.querySelector(':scope > .hint');
 if(oldNote){const previous=[...oldNote.childNodes];oldNote.replaceChildren(node('span','k.ui.guideNote'));cleanup.push(()=>oldNote.replaceChildren(...previous))}

 // Preserve the self-check controls/constants cards; replace only the two old
 // static model articles with chapters generated from the canonical registry.
 const grid=science.querySelector('.science-grid'),originalArticles=[...grid.children].slice(0,2);
 const before=originalArticles[1].nextSibling;
 const index=node('nav',null,'knowledge-model-index');index.setAttribute('aria-label',t('k.ui.index'));
 for(const model of models){const a=node('a',model.title);a.href='#'+model.target;a.dataset.modelLink=model.target;a.id='model-index-'+model.id;index.append(a)}
 grid.before(index);owned.push(index);
 const returnSlot=node('div');returnSlot.id='knowledgeReturnSlot';index.after(returnSlot);owned.push(returnSlot);
 const note=node('p','k.ui.sourceNote','hint');returnSlot.after(note);owned.push(note);
 const chapters=[];
 for(const model of models){
  const article=node('article',null,'panel knowledge-model');article.id=model.target;article.tabIndex=-1;
  article.append(node('h2',model.title),node('p',model.overview));
  const limits=node('p',model.limits,'knowledge-limit');article.append(limits);
  const advanced=detail('k.ui.advanced');
  for(const [heading,key]of [['method',model.method],['units',model.units],['illustration',model.illustration],['misconception',model.misconception]])advanced.append(node('h3','k.ui.'+heading),node('p',key));
  advanced.append(node('h3','k.ui.formulas'));
  for(const formula of model.equations){const e=node('p',null,'knowledge-formula');e.textContent=formula;advanced.append(e)}
  const termLinks=node('div',null,'knowledge-term-links');
  for(const term of terms.filter(t=>t.model===model.id)){const a=node('a',term.label);a.href='#'+term.target;a.dataset.explain=term.target;a.id='model-term-'+model.id+'-'+term.id;termLinks.append(a)}
  advanced.append(termLinks,node('h3','k.ui.sources'),sourceList(model.sources));article.append(advanced);chapters.push(article);grid.insertBefore(article,before);owned.push(article);
 }
 for(const e of originalArticles)e.remove();
 cleanup.push(()=>{for(const e of originalArticles)grid.insertBefore(e,before)});

 const bindings=[
  ['scenarioHint','orbit'],['selectedType','mass'],['integrationStep','softening'],['systemEnergy','energy'],
  ['bhRadius','schwarzschild'],['bhTemp','hawking'],['extremeRadius','stars'],['iscoRadius','isco'],
  ['kelvinInput','kelvin'],['celsiusInput','temperature'],['entropyOmega','multiplicity'],['entropyValue','entropy'],
  ['thermalEntropy','entropy'],['thermalSigma','secondlaw'],['thermalForm','conductance'],['thermalEquilibrium','capacity']
 ];
 for(const [target,id]of bindings){const anchor=doc.getElementById(target);if(!anchor)continue;const e=help(id);anchor.after(e);owned.push(e)}
 function labels(){index.setAttribute('aria-label',t('k.ui.index'));for(const {summary,term}of summaries)summary.setAttribute('aria-label',t('k.ui.quick',{term:t(term.label)}))}
 const unsubscribe=onLanguageChange(labels);labels();guide.resolveFragment();
 const controller={
  inspect:()=>({terms:terms.length,models:chapters.length,inlineHelps:summaries.length,subscriptions:disposed?0:1,timers:0,mounted:!disposed}),
  dispose(){if(disposed)return;disposed=true;guide.close(false);unsubscribe();for(const e of owned)e.remove();for(const off of cleanup.reverse())off();instances.delete(doc)}
 };
 instances.set(doc,controller);return controller;
}
if(globalThis.document){initKnowledge();globalThis.entrolabKnowledge={inspect:()=>instances.get(globalThis.document)?.inspect()??{mounted:false,subscriptions:0,timers:0}}}

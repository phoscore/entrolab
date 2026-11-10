import {demoSummary,liveComparison,thermalBalance} from './learning-math.mjs';
import {applications,modelById,sources} from './knowledge.mjs';
import {t,locale,onLanguageChange} from './i18n.mjs';
import {scientific} from './display.mjs';

const instances=new WeakMap();
export function initEntropyLearning(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);
 const root=doc.getElementById('entropy'),particles=doc.getElementById('particleExperiment'),thermal=doc.getElementById('thermalExperiment');
 if(!root||!particles||!thermal)return null;
 const owned=[],cleanup=[];let disposed=false,choice='balanced',state=[true,true,false,false],lastThermal='';
 const node=(tag,key,cls)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(key){e.dataset.i18n=key;e.textContent=t(key)}return e};
 const detail=(key,id)=>{const e=node('details',null,'learning-panel');if(id)e.id=id;e.append(node('summary',key));return e};
 const listen=(e,type,fn)=>{e.addEventListener(type,fn);cleanup.push(()=>e.removeEventListener(type,fn))};
 const number=v=>new Intl.NumberFormat(locale(),typeof v==='bigint'?{maximumFractionDigits:0}:{maximumSignificantDigits:6}).format(v);
 const percent=v=>new Intl.NumberFormat(locale(),{style:'percent',maximumSignificantDigits:6}).format(v);
 const link=(model,label='k.ui.model')=>{const a=node('a',label,'knowledge-model-link');a.href='#'+modelById[model].target;a.dataset.modelLink=modelById[model].target;return a};

 // Independent four-marker example. It never reads or writes the live markers.
 const demo=detail('k.learning.demo.title','microstateDemo');demo.append(node('p','k.learning.demo.scope'));
 const chambers=node('div',null,'learning-demo-chambers'),left=node('div'),right=node('div');
 left.append(node('h3','k.learning.demo.left'));right.append(node('h3','k.learning.demo.right'));
 const markerButtons=[];
 for(let i=0;i<4;i++){const button=node('button',null,'learning-marker');button.type='button';button.textContent='ABCD'[i];button.dataset.demoMarker=i;listen(button,'click',()=>{state=state.map((v,j)=>j===i?!v:v);renderDemo(true)});markerButtons.push(button)}
 chambers.append(left,right);demo.append(chambers);
 const summary=node('p');summary.id='demoSummary';summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');summary.setAttribute('aria-atomic','true');
 const patternsHeading=node('h3'),patterns=node('ol',null,'learning-patterns');patterns.id='demoPatterns';
 demo.append(summary,patternsHeading,patterns,node('p','k.learning.demo.patternNote'),link('markers'));
 const question=doc.getElementById('why-markers');(question??particles.firstElementChild).after(demo);owned.push(demo);
 function renderDemo(action=false){
  const r=demoSummary(state),focused=doc.activeElement,restore=markerButtons.includes(focused);
  markerButtons.forEach((b,i)=>{const side=t('k.learning.demo.'+(state[i]?'left':'right'));b.setAttribute('aria-label',t('k.learning.demo.toggle',{marker:'ABCD'[i],side}));b.setAttribute('aria-pressed',String(state[i]));b.dataset.side=state[i]?'left':'right';(state[i]?left:right).append(b)});
  if(restore)focused.focus({preventScroll:true});
  summary.textContent=t('k.learning.demo.summary',{left:r.k,right:4-r.k,omega:number(r.omega),probability:percent(r.probability),entropy:number(r.entropy)});
  patternsHeading.textContent=t('k.learning.demo.patterns',{count:r.patterns.length});
  patterns.replaceChildren(...r.patterns.map((s,i)=>{const li=node('li');const text=s.map((v,j)=>'ABCD'[j]+': '+t('k.learning.demo.'+(v?'left':'right'))).join(' · ');li.textContent=text;li.dataset.pattern=s.map(x=>Number(x)).join('');li.setAttribute('aria-label',t('k.learning.demo.pattern',{index:i+1,pattern:text}));return li}));
  demo.dataset.k=r.k;demo.dataset.omega=r.omega.toString();
 }

 // Compare the existing finite-N probabilities. Highlighting is separate from
 // the live k, the current white arrow and table aria-current attributes.
 const compare=detail('k.learning.compare.title','macrostateComparison'),actions=node('div',null,'learning-actions');
 const comparisonButtons={};
 for(const id of ['balanced','edge']){const b=node('button','k.learning.compare.'+id,'secondary');b.type='button';b.dataset.compare=id;listen(b,'click',()=>{choice=id;renderComparison()});actions.append(b);comparisonButtons[id]=b}
 const comparisonText=node('div');comparisonText.id='comparisonReadout';
 compare.append(actions,comparisonText,node('p','k.learning.compare.note'),node('p','k.learning.compare.units'),node('p','k.learning.compare.next'),link('markers'));demo.after(compare);owned.push(compare);
 function renderComparison(){
  const r=liveComparison(Number(root.dataset.n)||12,choice);
  comparisonText.replaceChildren(...[['labelBalanced',r.balanced],['labelEdge',r.edge]].map(([label,row])=>{const p=node('p');p.textContent=t('k.learning.compare.row',{label:t('k.learning.compare.'+label),k:row.k,omega:number(row.omega),probability:percent(row.probability),entropy:number(row.entropy)});return p}));
  for(const [id,b]of Object.entries(comparisonButtons))b.setAttribute('aria-pressed',String(choice===id));
  for(const e of doc.querySelectorAll('#entropyChart [data-k], #entropyTable [data-k]')){if(compare.open&&Number(e.dataset.k)===r.selected.k)e.dataset.comparison='true';else delete e.dataset.comparison}
  compare.dataset.selectedK=r.selected.k;compare.dataset.n=r.n;
 }
 listen(compare,'toggle',renderComparison);
 const markerObserver=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='data-n'))renderComparison()});markerObserver.observe(root,{attributes:true,attributeFilter:['data-n']});

 // Applied thermal results only. No second solver, animation loop or interval.
 const balance=detail('k.learning.balance.title','thermalBalance');balance.append(node('p','k.learning.balance.scope'),node('h3','k.learning.balance.energy'));
 const energyRows=[];
 for(const body of ['A','B']){const row=node('div',null,'learning-balance-row'),label=node('p'),track=node('div',null,'learning-energy-track'),bar=node('span');track.setAttribute('aria-hidden','true');track.append(bar);row.append(label,track);balance.append(row);energyRows.push({row,label,bar,body})}
 const total=node('p');total.id='balanceEnergyTotal';balance.append(total,node('p','k.learning.balance.energyNote'),node('h3','k.learning.balance.entropy'));
 const entropyRows=[];
 for(const body of ['A','B','total']){const row=node('div',null,'learning-balance-row'),label=node('p'),track=node('div',null,'learning-entropy-track'),bar=node('span');track.setAttribute('aria-hidden','true');track.append(bar);row.append(label,track);balance.append(row);entropyRows.push({row,label,bar,body})}
 const production=node('p');production.id='balanceProduction';balance.append(production,node('p','k.learning.balance.entropyNote'),node('p','k.learning.balance.lesson'),link('thermal'));
 thermal.querySelector('.thermal-workspace').after(balance);owned.push(balance);
 function renderBalance(force=false){
  const snapshot=globalThis.entrolabThermal?.inspect();if(!snapshot)return;
  const key=JSON.stringify([snapshot.params,snapshot.time]);if(!force&&key===lastThermal)return;lastThermal=key;
  const r=thermalBalance(snapshot.params,snapshot.result);
  energyRows.forEach(({row,label,bar,body},i)=>{label.textContent=t('k.learning.balance.energyRow',{body,energy:scientific(r.energy[i]).trim(),transfer:scientific(r.transfer[i]).trim()});bar.style.width=(100*r.energy[i]/r.initialTotal)+'%';row.dataset.energy=String(r.energy[i]);row.dataset.transfer=String(r.transfer[i]);row.dataset.body=body});
  total.textContent=t('k.learning.balance.total',{total:scientific(r.total).trim(),initial:scientific(r.initialTotal).trim(),error:scientific(r.error).trim()});total.dataset.value=String(r.total);total.dataset.error=String(r.error);
  const scale=Math.max(...r.entropy.map(Math.abs));
  entropyRows.forEach(({row,label,bar,body},i)=>{const value=r.entropy[i],width=scale===0?0:50*Math.abs(value)/scale;label.textContent=t('k.learning.balance.entropyRow',{body:body==='total'?t('k.learning.balance.sum'):'ΔS_'+body,value:scientific(value).trim()});bar.style.left=(value<0?50-width:50)+'%';bar.style.width=width+'%';bar.dataset.sign=value<0?'negative':'positive';row.dataset.entropy=String(value);row.dataset.body=body});
  production.textContent=t('k.learning.balance.production',{value:scientific(r.production).trim()});production.dataset.value=String(r.production);balance.dataset.time=snapshot.time;
 }
 const thermalObserver=new MutationObserver(()=>renderBalance());thermalObserver.observe(thermal,{attributes:true,attributeFilter:['data-time','data-applied']});

 // Few optional real-world applications, generated from the same knowledge
 // registry and linked to the actual model chapter rather than a new wiki.
 const extras=detail('k.learning.extras.title','entropyApplications');
 for(const app of applications){const d=node('details',null,'knowledge-advanced');d.append(node('summary',app.title),node('p',app.text),link(app.model));const list=node('ul',null,'knowledge-sources');for(const id of app.sources){const s=sources[id],li=node('li'),a=node('a');a.textContent=s.publisher+' · '+s.title;a.href=s.url;a.target='_blank';a.rel='noopener';li.append(a);list.append(li)}d.append(list);extras.append(d)}
 balance.after(extras);owned.push(extras);
 // Conceptual, not numerical, route between the two established subviews.
 const bridge=node('p',null,'learning-concept-route'),bridgeButton=node('button','k.question.ui.thermalTitle','secondary');bridgeButton.type='button';bridge.append(bridgeButton);compare.append(bridge);owned.push(bridge);
 listen(bridgeButton,'click',()=>{const original=doc.querySelector('[data-entropy-view=thermal]');original?.click();original?.focus()});
 for(const e of [demo,compare,balance,extras])listen(e,'keydown',event=>{if(event.key!=='Escape'||event.defaultPrevented)return;const d=event.target.closest('details');if(d&&e.contains(d)&&d.open){d.open=false;d.querySelector(':scope > summary')?.focus();event.preventDefault();event.stopPropagation()}});
 const unsubscribe=onLanguageChange(()=>{renderDemo();renderComparison();renderBalance(true)});renderDemo();renderComparison();renderBalance(true);
 const controller={inspect:()=>({demo:[...state],comparison:choice,subscriptions:disposed?0:1,observers:disposed?0:2,timers:0,mounted:!disposed}),dispose(){if(disposed)return;disposed=true;unsubscribe();markerObserver.disconnect();thermalObserver.disconnect();for(const off of cleanup)off();for(const e of owned)e.remove();for(const e of doc.querySelectorAll('[data-comparison]'))delete e.dataset.comparison;instances.delete(doc)}};
 instances.set(doc,controller);return controller;
}
if(globalThis.document){initEntropyLearning();globalThis.entrolabLearning={inspect:()=>instances.get(globalThis.document)?.inspect()??{mounted:false,subscriptions:0,observers:0,timers:0}}}

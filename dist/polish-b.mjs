import {onLanguageChange,t,language,locale} from './i18n.mjs';
import {questions} from './polish-b-questions.mjs';
import {references} from './polish-b-references.mjs';
import {electricField} from './electric-field.mjs';

const $=id=>document.getElementById(id);
const node=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
const labels=[];
const localized=(tag,key)=>{const n=node(tag);labels.push(()=>{n.textContent=t(key)});return n};
function section(id,title,paragraph){
 const wrap=node('details');wrap.className='panel polish-b-panel';
 wrap.append(localized('summary',title),localized('p',paragraph));
 $(id).append(wrap);
 return wrap;
}
function link(name,href){const a=node('a',name);a.href=href;return a}
const copyIndex=()=>language()==='de'?1:2;
const questionGroups=new Map();
for(const [i,row] of questions.entries()){
 const [lab]=row;
 if(!questionGroups.has(lab)){
  const group=node('details');group.className='panel polish-b-panel';group.append(localized('summary','polishB.questions'));
  $(lab).append(group);questionGroups.set(lab,group);
 }
 const field=node('fieldset'),legend=node('legend'),feedback=node('p');
 feedback.setAttribute('role','status');field.append(legend);
 const choices=[];
 // Alternate answer order while keeping the conceptual answer stable.
 for(const index of i%2?[2,1]:[1,2]){
  const label=node('label'),input=node('input'),name=node('span');
  input.type='radio';input.name='polish-b-question-'+i;
  label.append(input,name);field.append(label);choices.push([input,index,name]);
 }
 const render=()=>{
  const words=row[copyIndex()];legend.textContent=words[0];
  for(const [,index,name] of choices)name.textContent=words[index];
  const checked=choices.find(([input])=>input.checked);
  feedback.textContent=checked?t(checked[1]===1?'polishB.correct':'polishB.tryAgain')+words[3]:'';
 };
 field.append(feedback);field.addEventListener('change',render);labels.push(render);questionGroups.get(lab).append(field);
}

section('blackhole','polishB.singTitle','polishB.sing').append(link('Einstein Online · Black holes','https://www.einstein-online.info/en/spotlight/black-holes/'));
const matter=section('matter','polishB.matterTitle','polishB.matter');
matter.append(link('CERN · The Standard Model','https://home.cern/science/physics/standard-model'));
const field=section('matter','polishB.field','polishB.fieldNote');
const controls=node('div');controls.className='field-inputs';
for(const [id,key,min,max,value] of [['fieldCharge','charge',-5,5,2],['fieldX','probeX',-2,2,1],['fieldY','probeY',-2,2,.5]]){
 const label=node('label'),input=node('input'),readout=node('output');input.id=id;input.type='range';input.step=.1;
 input.min=min;input.max=max;input.value=value;
 label.append(localized('span','polishB.'+key),input,readout);controls.append(label);
 input.addEventListener('input',paintField);
}
const ns='http://www.w3.org/2000/svg',diagram=document.createElementNS(ns,'svg');
diagram.setAttribute('viewBox','0 0 320 230');diagram.setAttribute('aria-hidden','true');
const shape=(tag,attributes)=>{const el=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);diagram.append(el);return el};
shape('path',{d:'M15 115H305M160 10V220',stroke:'#4e5968'});
shape('circle',{cx:160,cy:115,r:9,fill:'none',stroke:'#647486','stroke-dasharray':'3 2'});
diagram.style.overflow='visible';
const source=shape('text',{x:160,y:121,'text-anchor':'middle',fill:'#fff','font-size':19});
const probe=shape('circle',{r:4,fill:'#a4eee8'});
const arrow=shape('path',{fill:'none',stroke:'#a4eee8','stroke-width':2});
const value=node('p');value.setAttribute('aria-live','polite');
field.append(controls,diagram,value,link('OpenStax · Electric Field','https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field'));
function paintField(){
 const [q,x,y]=['fieldCharge','fieldX','fieldY'].map(id=>{
  const input=$(id),number=input.valueAsNumber;input.nextElementSibling.textContent=new Intl.NumberFormat(locale()).format(number);return number;
 });
 const e=electricField(q,x,y),a=160+45*x,b=115-45*y;
 source.textContent=q>0?'+':q<0?'−':'0';
 probe.setAttribute('cx',a);probe.setAttribute('cy',b);
 arrow.removeAttribute('d');
 if(e?.magnitude>0){
  const dx=e.x/e.magnitude,dy=-e.y/e.magnitude;
  const u=a+25*dx,v=b+25*dy;
  arrow.setAttribute('d',`M${a} ${b}L${u} ${v}m${-7*dx+4*dy} ${-7*dy-4*dx}L${u} ${v}l${-7*dx-4*dy} ${-7*dy+4*dx}`);
 }
 value.textContent=e?new Intl.NumberFormat(locale(),{maximumSignificantDigits:4}).format(e.magnitude)+' N/C':t('polishB.fieldNear');
}
labels.push(paintField);

const observed=section('extreme','polishB.reference','polishB.referenceNote');
const name=node('h3'),description=node('p'),sources=node('div');
observed.append(name,description,sources);
function updateReference(){
 const entry=references.get($('extremeObject').value);
 if(!entry)return;
 const [title,copy,...links]=entry;
 name.textContent=title;description.textContent=copy[language()==='de'?0:1];
 sources.replaceChildren(...links.map((url,i)=>link((language()==='de'?'Quelle ':'Source ')+(i+1),url)));
}
$('extremeObject').addEventListener('change',updateReference);
$('extreme').addEventListener('click',event=>{if(event.target.closest('[data-extreme-mass]'))updateReference()});
labels.push(updateReference);
const explorer=$('explorer'), explorerQuestions=questionGroups.get('explorer');
new MutationObserver(()=>{
 if(explorerQuestions.parentNode!==explorer)explorer.append(explorerQuestions);
}).observe(explorer,{childList:true});
const refresh=()=>labels.forEach(fn=>fn());
onLanguageChange(refresh);refresh();

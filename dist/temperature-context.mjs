import './extreme-ui.mjs';
const readTemperature=()=>globalThis.entrolabTemperature.read();
import {MATERIALS,materialPhase,compareTemperatures,scalePosition,parseComparisonTemperature} from './material-data.mjs';
import {sources} from './knowledge.mjs';
import {t,onLanguageChange,locale} from './i18n.mjs';
import {scientific,number} from './display.mjs';
import {comparisonNumber,comparisonDisplayValue} from './temperature-format.mjs';
const instances=new WeakMap();
export function initTemperatureContext(doc=globalThis.document){
 if(instances.has(doc))return instances.get(doc);const root=doc.getElementById('temperatureContext');if(!root)return null;
 const $=id=>doc.getElementById(id),cleanup=[];let b=293.15,invalid=false,disposed=false;
 const listen=(el,event,fn)=>{el.addEventListener(event,fn);cleanup.push(()=>el.removeEventListener(event,fn))};
 const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 const ns='http://www.w3.org/2000/svg',svgEl=(tag,attrs)=>{const e=doc.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e};
 const precise=(v,digits)=>new Intl.NumberFormat(locale(),{maximumFractionDigits:digits,useGrouping:false}).format(v);
 function symbols(phase){const svg=svgEl('svg',{viewBox:'0 0 240 80','aria-hidden':'true',focusable:'false'});svg.classList.add('material-symbols');
  if(phase==='outside'){const line=svgEl('path',{d:'M90 16L150 64M150 16L90 64',stroke:'#aaa2b9','stroke-width':2});svg.append(line);return svg}
  for(let i=0;i<12;i++){const vapor=phase==='vapor'||phase==='boiling',solid=phase==='solid';const x=solid?84+i%4*24:vapor?15+(i*61%210):60+(i*37%120),y=solid?16+Math.floor(i/4)*24:vapor?12+(i*23%56):15+(i*29%50);svg.append(svgEl('circle',{cx:x,cy:y,r:3.4,fill:phase==='melting'||phase==='boiling'?'#edc594':'#bca7e8'}))}return svg}
 function card(id,slot,k){const m=MATERIALS[id],phase=materialPhase(id,k);slot.dataset.phase=phase;slot.dataset.material=id;slot.replaceChildren(node('h3',t('v85.mat.'+id)+' · '+m.formula),node('p',t('v85.mat.at',{temperature:comparisonNumber(k)+' K'}),'hint'),symbols(phase),node('p',t('v85.mat.'+phase),'material-state'),node('p',t('v85.mat.points',{meltK:precise(m.melt,m.meltDigits)+' K',meltC:precise(m.melt-273.15,m.meltDigits)+' °C',boilK:precise(m.boil,m.boilDigits)+' K',boilC:precise(m.boil-273.15,m.boilDigits)+' °C'})),node('p',t('v85.mat.window',{lo:comparisonNumber(m.window[0])+' K',hi:comparisonNumber(m.window[1])+' K'}),'hint'),node('p',t('v85.mat.bands',{melt:scientific(m.meltBand,'K'),boil:scientific(m.boilBand,'K')}),'hint'));
  if(materialPhase(id,comparisonDisplayValue(k))!==phase)slot.querySelector('.material-state').after(node('p',t('v85.mat.rounding'),'hint material-rounding'));
  const refs=node('p',null,'knowledge-sources');for(const key of m.sources){const s=sources[key],a=node('a',s.publisher+' · '+s.title);a.href=s.url;a.target='_blank';a.rel='noopener';a.dataset.source=key;refs.append(a,doc.createTextNode(' '))}slot.append(refs);
 }
 function render(){if(disposed)return;const a=readTemperature(),r=compareTemperatures(a,b),preset=globalThis.entrolabTemperature.preset();$('temperatureContextValue').textContent=t('v85.temp.context',{kelvin:comparisonNumber(a)+' K',celsius:comparisonNumber(a-273.15)+' °C'});$('temperatureContextMeaning').textContent=t(preset===null?(a===0?'v85.temp.zero':'v85.temp.positive'):'v85.temp.context.'+preset);
  const ratio=!r.ratio?t('v85.temp.noRatio'):r.ratio.value!==undefined?comparisonNumber(r.ratio.value):number(r.ratio.mantissa,4)+' × 10^'+r.ratio.exponent;
  $('temperatureComparisonResult').textContent=t('v85.temp.ratio',{ratio,delta:comparisonNumber(r.delta)+' K',a:comparisonNumber(a)+' K',b:comparisonNumber(b)+' K'});$('temperatureComparisonError').textContent=invalid?t('v85.temp.invalid'):'';$('comparisonKelvinB').setCustomValidity(invalid?t('v85.temp.invalid'):'');
  const scale=$('temperatureComparisonScale');scale.replaceChildren();scale.append(svgEl('path',{d:'M20 30H380',stroke:'#776a8d','stroke-width':2}));for(const [value,label,y]of [[a,'A',18],[b,'B',57]]){const pos=scalePosition(value),x=20+pos.fraction*360;scale.append(svgEl('circle',{cx:x,cy:30,r:label==='A'?5:3,fill:label==='A'?'#c6afea':'#f1ca92'}));const text=svgEl('text',{x:Math.max(25,Math.min(370,x)),y,fill:label==='A'?'#c6afea':'#f1ca92','text-anchor':'middle'});text.textContent=label+(pos.zero?' · 0 K':pos.below?' < 10⁻³ K':'');scale.append(text)}
  card($('materialA').value,$('materialCardA'),a);$('materialCardB').hidden=!$('materialSecond').checked;$('materialBLabel').hidden=!$('materialSecond').checked;if($('materialSecond').checked)card($('materialB').value,$('materialCardB'),a);
 }
 function edit(){try{b=parseComparisonTemperature($('comparisonKelvinB').value);invalid=false}catch{invalid=true}render()}
 listen($('comparisonKelvinB'),'input',edit);listen($('comparisonKelvinB'),'change',edit);
 listen($('temperaturePin'),'click',()=>{b=readTemperature();$('comparisonKelvinB').value=String(b);invalid=false;render()});
 listen($('temperatureReferenceB'),'change',()=>{b=Number($('temperatureReferenceB').value);$('comparisonKelvinB').value=String(b);invalid=false;render()});
 for(const id of ['materialA','materialB','materialSecond'])listen($(id),'change',render);cleanup.push(globalThis.entrolabTemperature.subscribe(render));const off=onLanguageChange(render);render();
 const controller={inspect:()=>({a:readTemperature(),b,invalid,subscriptions:disposed?0:cleanup.length+1,timers:0,observers:0}),dispose(){if(disposed)return;disposed=true;for(const fn of cleanup)fn();off();instances.delete(doc)}};instances.set(doc,controller);return controller;
}
if(globalThis.document){initTemperatureContext();globalThis.entrolabTemperatureContext={inspect:()=>instances.get(document)?.inspect()??{subscriptions:0,timers:0}}}

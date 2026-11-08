import {thermalAt,validateThermal,THERMAL_DEFAULT,THERMAL_PRESETS} from './thermal-physics.mjs';
import {t,locale,onLanguageChange} from './i18n.mjs';
import {scientific} from './display.mjs';
import {thermalTransferCandidate,formatThermalTime,thermalCurveTimes} from './thermal-view.mjs';
const $=id=>document.getElementById(id),root=$('entropy'),panel=$('thermalExperiment');
const fields={a:'thermalA',b:'thermalB',ca:'thermalCA',cb:'thermalCB',g:'thermalG'};
let params={...THERMAL_DEFAULT},time=0,playing=false,seen=true,timer=null,invalid=false,dirty=false,transfer=null,applied=0,temperatureSource=null;
const fmt=(v,d=4)=>new Intl.NumberFormat(locale(),{maximumFractionDigits:d}).format(v);
const active=()=>root.classList.contains('active')&&!panel.hidden&&!document.hidden&&seen;
function flags(){panel.dataset.playing=String(playing);panel.dataset.scheduled=String(timer!==null);panel.dataset.time=String(time);panel.dataset.applied=String(applied);$('thermalStage').dataset.running=String(playing&&active())}
function schedule(){if(timer===null&&playing&&active())timer=setTimeout(()=>{timer=null;if(playing&&active()){time=Math.min(1e12,time+.2*Number($('thermalSpeed').value));if(time===1e12)playing=false;render()}schedule()},200);flags()}
function sync(){if(timer!==null){clearTimeout(timer);timer=null}schedule();status()}
function pause(){playing=false;sync()}
function fill(){for(const [key,id]of Object.entries(fields))$(id).value=params[key]}
function status(){const key=time===1e12?'Modellzeitlimit erreicht. Reset für einen neuen Start.':playing?(active()?'Aktiv · t = {time} s':'Im Hintergrund angehalten · t = {time} s'):'Pausiert · t = {time} s';$('thermalStatus').textContent=t(key,{time:formatThermalTime(time,locale())});$('thermalPlay').textContent=t(playing?'Pause':'Start');$('thermalPlay').setAttribute('aria-pressed',String(playing));flags()}
function svg(tag,attrs={},text){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e}
function chart(r){const horizon=Math.max(5*r.tau,time,1e-6),lo=Math.min(params.a,params.b)-5,hi=Math.max(params.a,params.b)+5,x=t=>54+570*t/horizon,y=v=>247-210*(v-lo)/(hi-lo);const nodes=[svg('path',{d:'M54 25V248H630',fill:'none',stroke:'#a48ab8'})];for(const key of ['ta','tb']){const points=thermalCurveTimes(r.tau,horizon).map(t=>[x(t),y(thermalAt(params,t)[key])]);nodes.push(svg('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:key==='ta'?'#d3a8ff':'#83e1db','stroke-width':3}));nodes.push(svg('circle',{cx:x(time),cy:y(r[key]),r:4,fill:key==='ta'?'#f2dfff':'#bafff7'}))}for(const v of [lo,(lo+hi)/2,hi])nodes.push(svg('text',{x:47,y:y(v)+5,'text-anchor':'end'},fmt(v,1)));for(const v of [0,horizon/2,horizon])nodes.push(svg('text',{x:x(v),y:278,'data-time':String(v),'text-anchor':v===0?'start':v===horizon?'end':'middle'},formatThermalTime(v,locale())));$('thermalChart').replaceChildren(...nodes);$('thermalChart').setAttribute('aria-label',t('Temperaturkurven A und B, Kelvin über Sekunden; aktueller Zeitpunkt {time} s.',{time:formatThermalTime(time,locale())}))}
function render(){const r=thermalAt(params,time),direction=t(r.power>0?'A → B':r.power<0?'B → A':'Kein Netto-Wärmefluss');$('thermalTA').textContent=fmt(r.ta)+' K';$('thermalTB').textContent=fmt(r.tb)+' K';$('thermalDirection').textContent=direction;$('thermalPower').textContent=scientific(r.power,'W');$('thermalStage').setAttribute('aria-label',t('A: {a} K; B: {b} K; {direction}; Nettoleistung A→B {power} W.',{a:fmt(r.ta),b:fmt(r.tb),direction,power:fmt(r.power)}));for(const [id,v]of Object.entries({thermalTime:time,thermalEntropy:r.entropy,thermalQ:r.q,thermalU:r.energy,thermalEnergyError:r.energyError,thermalSigma:r.production}))$(id).textContent=scientific(v);$('thermalIndividual').textContent=t('ΔS_A = {a} J/K · ΔS_B = {b} J/K',{a:scientific(r.sa),b:scientific(r.sb)});$('thermalEquilibrium').textContent=t('Gleichgewicht: {temp} K · Zeitkonstante τ = {tau} s',{temp:fmt(r.eq),tau:scientific(r.tau)});for(const [id,temp]of [['thermalBodyA',r.ta],['thermalBodyB',r.tb]]){const f=params.a===params.b?.5:(temp-Math.min(params.a,params.b))/Math.abs(params.a-params.b);$(id).style.backgroundColor=`rgb(${30+55*f} ${60-17*f} ${70-36*f})`;}
 if(transfer&&Number($(fields[transfer.target]).value)!==transfer.temp)transfer=null;const message=invalid?t('Endliche Werte mit Dezimalpunkt: T = 250–600 K, C = 1–10⁶ J/K, G_th = 0,001–1000 W/K. Modellzustand unverändert.'):'';$('thermalError').textContent=message;for(const id of Object.values(fields))$(id).setCustomValidity(message);$('thermalDraftNote').textContent=dirty?t('Entwurf noch nicht angewendet.'):'';$('thermalTransferNote').textContent=transfer?t('Für Körper {target}: {temp} K vorgemerkt. Erst „Übernehmen“ startet einen neuen Anfangszustand.',{target:transfer.target.toUpperCase(),temp:fmt(transfer.temp)})+(transfer.rounded?' '+t('Nur Umrechnungsrundung am Rand berücksichtigt; Quellfelder bleiben unverändert.'):''):'';chart(r);status()}
function selectView(name){const heat=name==='thermal',badge=heat?'THERMODYNAMISCHES LEHRMODELL':'DISKRETES STATISTISCHES LEHRMODELL';$('entropyModelBadge').dataset.i18n=badge;$('entropyModelBadge').textContent=t(badge);$('entropyExplain').dataset.explain=heat?'guide-thermal':'guide-entropy';$('entropyExplain').href='#'+$('entropyExplain').dataset.explain;panel.hidden=!heat;$('particleExperiment').hidden=heat;for(const b of document.querySelectorAll('[data-entropy-view]'))b.setAttribute('aria-pressed',String(b.dataset.entropyView===name));document.dispatchEvent(new Event('entropy-view-change'));sync();render()}
for(const b of document.querySelectorAll('[data-entropy-view]'))b.addEventListener('click',()=>{selectView(b.dataset.entropyView);b.focus()});
$('thermalPlay').onclick=()=>{playing=!playing;sync()};$('thermalStep').onclick=()=>{pause();time=Math.min(1e12,time+10);render();document.dispatchEvent(new Event('thermal-stepped'))};
$('thermalReset').onclick=()=>{pause();time=0;invalid=false;dirty=false;transfer=null;fill();render()};
for(const event of ['input','change'])$('thermalForm').addEventListener(event,()=>{dirty=true;transfer=null;render()});
$('thermalForm').onsubmit=e=>{e.preventDefault();const draft=Object.fromEntries(Object.entries(fields).map(([k,id])=>[k,$(id).value.trim()===''?NaN:Number($(id).value)]));try{validateThermal(draft)}catch{invalid=true;dirty=true;render();return}pause();params=draft;time=0;invalid=false;dirty=false;transfer=null;applied++;render();document.dispatchEvent(new Event('thermal-applied'))};
for(const b of document.querySelectorAll('[data-thermal-preset]'))b.addEventListener('click',()=>{const p=THERMAL_PRESETS[b.dataset.thermalPreset];for(const [k,id]of Object.entries(fields))$(id).value=p[k];dirty=true;transfer=null;render()});
function bridge(){
 const raw=$('temperatureTransferValue').value,bad=!!$('temperatureError').textContent||raw==='';
 const candidate=bad?null:thermalTransferCandidate(Number(raw),temperatureSource);
 $('thermalTransfer').disabled=!candidate;
 // The extreme-temperature input may rewrite a high-precision number on blur.
 // Rejection must remain based on the original decimal, so explain any
 // discrepancy rather than appearing to reject the rounded, displayed value.
 const sourceField=temperatureSource?.unit==='kelvin'?$('kelvinInput'):temperatureSource?.unit==='celsius'?$('celsiusInput'):null;
 const changedDisplay=!candidate&&!bad&&sourceField&&sourceField.value!==temperatureSource.value;
 const explanation=changedDisplay?' '+t('Ursprünglich eingegeben: {original} {unit}. Das Temperaturfeld zeigt nach Rundung {display} {unit}; geprüft wird die ursprüngliche Eingabe.',{original:temperatureSource.value,display:sourceField.value,unit:temperatureSource.unit==='kelvin'?'K':'°C'}):'';
 $('thermalBridgeNote').textContent=(bad?t('Korrigiere zuerst die ungültige Temperatureingabe. Der alte gültige Wert wird nicht heimlich übertragen.'):!candidate?t('Dieser Extremwert liegt außerhalb der Wärme-Modellannahmen (250–600 K). Keine Übernahme und kein Clamping.'):candidate.rounded?t('Umrechnungsrundung am Rand: Übernahme als {temp} K. Quellfelder bleiben unverändert; erst Übernehmen ändert den Modellstart.',{temp:fmt(candidate.temperature)}):t('Zulässig: aktueller Wert wird nur vorgemerkt; keine automatische Rechnung.'))+explanation;
 return candidate;
}
// Capture the actual input before the existing temperature UI formats it on blur.
// Neither source fields nor the extreme-temperature calculation are modified.
for(const id of ['kelvinInput','celsiusInput','temperatureSlider'])for(const event of ['input','change']){
 $(id).addEventListener(event,()=>{temperatureSource=id==='temperatureSlider'?null:{unit:id==='celsiusInput'?'celsius':'kelvin',value:$(id).value}},true);
 $(id).addEventListener(event,bridge);
}
for(const b of document.querySelectorAll('[data-kelvin]'))b.addEventListener('click',()=>{temperatureSource={unit:'kelvin',value:b.dataset.kelvin};bridge()});
$('thermalTransfer').onclick=()=>{const candidate=bridge();if(!candidate)return;const target=$('thermalTransferTarget').value==='b'?'b':'a',temp=candidate.temperature;pause();document.querySelector('[data-tab=entropy]').click();document.querySelector('[data-entropy-view=thermal]').click();$(fields[target]).value=String(temp);dirty=true;transfer={target,temp,rounded:candidate.rounded};render();$(fields[target]).focus()};
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',sync);document.addEventListener('visibilitychange',sync);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){pause();render()}});
if(typeof IntersectionObserver==='function')new IntersectionObserver(es=>{seen=es[0].isIntersecting;sync()}).observe($('thermalStage'));
onLanguageChange(()=>{render();bridge()});fill();render();bridge();
window.entrolabThermal={inspect:()=>structuredClone({params,time,playing,scheduled:timer!==null,result:thermalAt(params,time),applied})};

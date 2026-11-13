import {C} from './physics.mjs';
import {t,tx,locale,onLanguageChange,translateText} from './i18n.mjs';
import {length,scientific,number} from './display.mjs';
import {compactObject,kelvinToCelsius,celsiusToKelvin,logTemperature,temperatureAt,comparisonPosition} from './extreme-data.mjs';
import {extremeKinds,extremeExample,extremeExplanation,hasStellarExample} from './stellar-examples.mjs';
import {drawStellarExample} from './stellar-art.mjs';
import {drawObject,drawThermal} from './extreme-render.mjs';
const temperatureListeners=new Set();
let temperaturePreset=null;
const $=id=>document.getElementById(id),root=$('extreme');
const abstractTemperature=$('thermalCanvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state={kind:'blackhole',mass:10*C.sun,k:.1,disk:true,geometry:false,pulsar:false,angle:22,zoom:1,quality:matchMedia('(max-width:600px)').matches?'low':'high',speed:1,paused:reduced.matches};
let raf=null,previous=null,lastDraw=0,time=0,rendered=0,objectSeen=true,thermalSeen=!!abstractTemperature;
// Celsius conversion subtracts numbers near 273 K: allow their rounding error only in this UI boundary.
const sliderMinimumTolerance=2*Number.EPSILON*273.15;
const decimal=n=>n.toLocaleString(locale(),{maximumFractionDigits:3,minimumFractionDigits:3,useGrouping:false});
function comparison(){
 const objects=extremeKinds.map(kind=>extremeExample(kind,state.mass)).sort((a,b)=>a.radius-b.radius);
 const mode=$('comparisonMode').value;
 const lo=objects[0].radius,hi=objects.at(-1).radius;
 $('comparisonStart').textContent=mode==='linear'?'0 m':length(lo);
 $('comparisonEnd').textContent=length(hi);
 $('objectComparison').replaceChildren(...objects.map(b=>{
  const a=document.createElement('article');a.className='extreme-comparison-card';
  a.dataset.kind=b.kind;a.dataset.radius=String(b.radius);
  if(b.kind===state.kind)a.setAttribute('aria-current','true');
  const title=document.createElement('h3');title.textContent=t(b.name);
  const values=document.createElement('p');
  const radiusLabel=b.kind==='blackhole'?t('v0925.horizonRadius'):
   b.kind==='wolf'?t('v0925.wolf.shortRadius'):'Radius';
  values.textContent=`${scientific(b.mass/C.sun,'M☉')} · ${radiusLabel} ${length(b.radius)}`;
  const density=document.createElement('p');density.className='hint';
  density.textContent=b.kind==='wolf'?t('v0925.wolf.density'):b.density===null?
   t('Keine Materialdichte: Horizont ist keine feste Oberfläche.'):
   tx`Mittlere Dichte ≈ ${scientific(b.density,'kg/m³')} · sphärische Volumennäherung`;
  const track=document.createElement('div');track.className='size-track';track.setAttribute('aria-hidden','true');
  const bar=document.createElement('span');bar.style.width=(100*comparisonPosition(b.radius,mode,hi,lo))+'%';
  bar.style.background=b.color;track.append(bar);
  const info=document.createElement('p');info.className='hint';info.textContent=b.reference??t(b.assumption);
  a.append(title,values,track,density,info);return a;
 }));
 $('comparisonNote').textContent=mode==='linear'?
  t('Balkenlänge proportional zum Radius. Sehr kleine Balken können unsichtbar sein; Zahlen bleiben maßgeblich.'):
  t('v0925.logRadius');
}

function describeObject(b){
 const name=t(b.name);
 $('extremeCanvas').setAttribute('aria-label',t('v0925.figure',{name}));
 $('objectImageDescription').textContent=t(extremeExplanation(state));
 $('magnetarLegend').hidden=state.kind!=='magnetar';
 $('objectReference').hidden=!b.reference;
 $('objectReference').textContent=b.reference?t('v0925.example')+' · '+b.reference:'';
 const facts=[
  [b.kind==='wolf'?'v0925.wolf.temp':'v0925.temp',b.temperature,'K'],
  ['v0925.luminosity',b.luminosity,'L☉'],
  ['v0925.period',b.period,'s'],
  ['v0925.field',b.field,'T'],
  ['v0925.massLoss',b.massLoss,t('v0925.rateUnit')],
 ].filter(([,value])=>value!==undefined);
 $('objectFacts').hidden=!facts.length;
 $('objectFacts').replaceChildren(...facts.flatMap(([label,value,unit])=>{
  const dt=document.createElement('dt'),dd=document.createElement('dd');
  dt.textContent=t(label);
  dd.textContent=(label==='v0925.period'?'':'≈ ')+scientific(value,unit);
  return [dt,dd];
 }));
 const sources=b.sources??[];
 $('objectSources').hidden=!sources.length;
 $('objectSources').setAttribute('aria-label',t('v0925.objectSources'));
 $('objectSources').replaceChildren(...sources.map(([name,url])=>{
  const li=document.createElement('li'),link=document.createElement('a');
  link.href=url;link.textContent=name;li.append(link);return li;
 }));
}

function refresh(keepMass=false){
 const b=extremeExample(state.kind,state.mass);
 $('chosenMass').textContent=b.reference?t('v0925.mass',{value:scientific(b.mass/C.sun,'M☉')}):tx`Modellmasse: ${scientific(b.mass/C.sun,'M☉')}`;
 document.querySelectorAll('[data-bh-only]').forEach(el=>el.hidden=state.kind!=='blackhole');
 if(!keepMass){$('extremeMass').value=state.mass;$('massError').textContent='';}
 $('pulsarControl').hidden=state.kind!=='neutron';
 $('pulsarNote').hidden=state.kind!=='neutron'||!state.pulsar;
 $('pulsarVisualNote').hidden=state.kind!=='neutron'||!state.pulsar;
 $('pulsarOn').checked=state.pulsar;
 $('extremeMass').disabled=state.kind!=='blackhole';$('diskOn').disabled=state.kind!=='blackhole';
 $('geometryOn').disabled=state.kind!=='blackhole';$('extremeAngle').disabled=state.kind!=='blackhole'||state.geometry;
 $('objectAssumption').textContent=t(b.assumption);
 $('extremeRadiusLabel').textContent=t(b.kind==='wolf'?'v0925.radiusWR':'RADIUS / rₛ BEIM BH');
 $('extremeDiameterLabel').textContent=t(b.kind==='wolf'?'v0925.diameterWR':'DURCHMESSER / 2rₛ');
 $('extremeRadius').textContent=length(b.radius);$('extremeDiameter').textContent=length(2*b.radius);
 $('photonRadius').textContent=b.photonSphere?length(b.photonSphere):t('— (nur Schwarzschild)');
 $('iscoRadius').textContent=b.isco?length(b.isco):t('— (nur Schwarzschild)');
 $('objectDensityLine').hidden=b.kind==='wolf';
 $('extremeDensity').textContent=b.density===null?t('Keine Materialdichte'):scientific(b.density,'kg/m³')+' ≈';
 $('hawkingReadout').textContent=state.kind==='blackhole'?
  tx`Hawking-Temperatur: ${scientific(b.hawking,'K')} – theoretische Strahlungstemperatur für entfernte Beobachter, keine gewöhnliche Materialtemperatur und nicht die Temperatur der illustrierten Scheibe.`:
  b.kind==='wolf'?t('v0925.wolf.density'):t('Dichte ist M/(4πR³/3): sphärische Volumennäherung, keine lokale Dichte oder Zustandsgleichung. Leuchten ist illustrativ.');
 $('extremePlay').textContent=state.paused?t('Animation starten'):t('Animation pausieren');$('extremeQuality').value=state.quality;
 $('extremeStatus').textContent=state.geometry&&state.kind==='blackhole'?t('SCHEMATISCHE SCHWARZSCHILD-GEOMETRIE'):t('KÜNSTLERISCHE DARSTELLUNG · KEIN RAYTRACING');
 describeObject(b);comparison();paint();sync();
}
function paint(){const paintStart=performance.now();if(!root.classList.contains('active')||document.hidden||!(objectSeen||thermalSeen))return;if(objectSeen)(hasStellarExample(state.kind)?drawStellarExample:drawObject)($('extremeCanvas'),state,time);if(thermalSeen)drawThermal(abstractTemperature,state.k,time,state.quality);rendered++;root.dataset.rendered=String(rendered);root.dataset.paintMs=(performance.now()-paintStart).toFixed(3)}
function active(){return root.classList.contains('active')&&!document.hidden&&(thermalSeen||objectSeen&&(state.kind!=='blackhole'||state.disk&&!state.geometry))&&!state.paused}
function sync(){if(raf!==null){cancelAnimationFrame(raf);raf=null}previous=null;if(active())raf=requestAnimationFrame(tick);root.dataset.animating=String(active())}
function tick(now){raf=null;if(!active())return;const elapsed=previous===null?0:Math.min(.1,(now-previous)/1000);previous=now;time+=elapsed*state.speed;const interval=state.quality==='high'?1000/60:1000/30;if(now-lastDraw>=interval){lastDraw=now;paint()}raf=requestAnimationFrame(tick)}
function temperature(k,editing=null,preserveError=false,preset=null){if(!Number.isFinite(k)||k<0||k>1e12){$('temperatureError').textContent=t('Gültiger Laborbereich: 0 bis 10¹² Kelvin. Eingabe wurde nicht übernommen.');return false}if(!preserveError){$('temperatureError').textContent='';temperaturePreset=preset}state.k=k;$('temperatureTransferValue').value=String(k);if(editing!=='kelvin'&&editing!=='both')$('kelvinInput').value=k;if(editing!=='celsius'&&editing!=='both')$('celsiusInput').value=Number(kelvinToCelsius(k).toFixed(3));$('kelvinReadout').textContent=scientific(k,'K');$('celsiusReadout').textContent=decimal(kelvinToCelsius(k))+' °C';$('temperatureSlider').value=k===0?-3:Math.max(-3,Math.log10(k));$('zeroNote').textContent=k===0?t('0 K: theoretischer absoluter Nullpunkt, außerhalb der Logskala. Keine Aussage, dass Quantenbewegung aufhört.'):k<.001-sliderMinimumTolerance?t('Unterhalb des Sliderbereichs (0,001 K); direkte Eingabe bleibt gültig.'):t('Logskala 10⁻³ bis 10¹² K; Beispiele sind unterschiedliche physikalische Situationen, keine universelle Stoffskala.');paint();for(const fn of temperatureListeners)fn();return true}
$('pulsarOn').onchange=()=>{state.pulsar=$('pulsarOn').checked;refresh()};$('extremeCenter').onclick=()=>{state.zoom=1;state.angle=22;$('extremeZoom').value=1;$('extremeAngle').value=22;paint()};
$('extremeObject').onchange=()=>{state.kind=$('extremeObject').value;refresh()};
function massInput(keep=false){const m=Number($('extremeMass').value);try{compactObject('blackhole',m);state.mass=m;$('massError').textContent='';refresh(keep)}catch{$('massError').textContent=t('Masse muss endlich sein: 1 bis 10⁴¹ kg. Bisheriger Wert bleibt aktiv.')}}
$('extremeMass').oninput=()=>massInput(true);$('extremeMass').onchange=()=>massInput(false);
document.querySelectorAll('[data-extreme-mass]').forEach(b=>b.onclick=()=>{state.mass=Number(b.dataset.extremeMass)*C.sun;state.kind='blackhole';$('extremeObject').value='blackhole';$('massError').textContent='';refresh()});
$('diskOn').onchange=()=>{state.disk=$('diskOn').checked;refresh()};$('geometryOn').onchange=()=>{state.geometry=$('geometryOn').checked;refresh()};$('extremeAngle').oninput=()=>{state.angle=Number($('extremeAngle').value);paint()};$('extremeZoom').oninput=()=>{state.zoom=Number($('extremeZoom').value);paint()};$('extremeSpeed').oninput=()=>{state.speed=Number($('extremeSpeed').value)};$('extremeQuality').onchange=()=>{state.quality=$('extremeQuality').value;refresh()};$('extremePlay').onclick=()=>{state.paused=!state.paused;refresh()};$('comparisonMode').onchange=comparison;
function kelvinInputValue(){
 const raw=$('kelvinInput').value,k=Number(raw);
 // Preserve rejection of negative text even when Number() underflows to -0.
 return raw.trim()===''||Object.is(k,-0)?NaN:k;
}
$('kelvinInput').oninput=()=>{const k=kelvinInputValue();if(!Number.isFinite(k)||k<0||k>1e12){$('temperatureError').textContent=t('Gültiger Laborbereich: 0 bis 10¹² Kelvin. Eingabe wurde nicht übernommen.');return}temperature(k,'kelvin')};
$('celsiusInput').oninput=()=>{const raw=$('celsiusInput').value,c=Number(raw);$('temperatureError').textContent=raw.trim()===''||!Number.isFinite(c)||c< -273.15||c>1e12-273.15?t('Celsius muss endlich und im Laborbereich −273,15 bis 999999999726,85 °C sein.'):'';if(raw.trim()!==''&&Number.isFinite(c)&&c>=-273.15&&c<=1e12-273.15)temperature(celsiusToKelvin(c),'celsius')};
$('kelvinInput').onchange=()=>temperature(kelvinInputValue());$('celsiusInput').onchange=()=>{try{temperature(celsiusToKelvin($('celsiusInput').value.trim()===''?NaN:Number($('celsiusInput').value)))}catch{$('temperatureError').textContent=t('Celsius muss endlich und mindestens −273,15 °C sein.')}};$('temperatureSlider').oninput=()=>temperature(temperatureAt((Number($('temperatureSlider').value)+3)/15));document.querySelectorAll('[data-kelvin]').forEach(b=>b.onclick=()=>temperature(Number(b.dataset.kelvin),null,false,b.dataset.kelvin));
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{paint();sync()}));document.addEventListener('visibilitychange',()=>{paint();sync()});reduced.addEventListener('change',()=>{if(reduced.matches)state.paused=true;refresh()});window.addEventListener('resize',paint);
if(typeof IntersectionObserver==='function'){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target.id==='extremeCanvas')objectSeen=entry.isIntersecting;else thermalSeen=entry.isIntersecting}paint();sync()});observer.observe($('extremeCanvas'));if(abstractTemperature)observer.observe(abstractTemperature)}
// Initial state renders only after the lab is visible; no hidden animation loop.
temperature(state.k);refresh();

onLanguageChange(()=>{for(const id of ['massError','temperatureError'])$(id).textContent=translateText($(id).textContent);refresh(true);temperature(state.k,'both',true)});

// Read-only adapter for optional contextual comparisons; never parses rounded labels.
globalThis.entrolabTemperature={read:()=>state.k,preset:()=>temperaturePreset,subscribe(fn){temperatureListeners.add(fn);return ()=>temperatureListeners.delete(fn)},inspect:()=>({subscriptions:temperatureListeners.size})};

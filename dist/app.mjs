import {experiment,experimentInfo} from './experiments.mjs';
import {baseline as makeBaseline,diagnostics as readDiagnostics} from './instruments.mjs';
import {predict} from './prediction.mjs';
import {number,scientific,length,modelStatus} from './display.mjs';
import {C,G,EPS,blackHole,body,radius,scenario,step,safeStep,energy} from './physics.mjs';
import {createSelfChecks} from './self-checks.mjs';
import {t,tx,onLanguageChange,bodyLabel,registerBodyLabels,translateText} from './i18n.mjs';
const $=id=>document.getElementById(id),num=number,sci=scientific;
let numericalFault=false,formDirty=false;
let instrumentBase=null,lastStep=null,forecast=null,predictionGeneration=0,predictionBusy=false;
let bs=[],selected,paused=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,adding=false,newType='planet',elapsed=0,collisions=0,baseline=0,view={x:0,y:0,scale:100},last=0,accum=0,frame=0,tab='gravity',limited=false;
let gravityRaf=null,gravitySeen=true,gravityDirty=true;
const canvas=$('universe'),ctx=canvas.getContext('2d');let W=600,H=500,dpr=1;
// CSS owns the display size; integer bitmap dimensions map back to exact CSS coordinates.
function resizeCanvas(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),x=c.getContext('2d');if(r.width<=0||r.height<=0){x.setTransform(1,0,0,1,0,0);return {ctx:x,w:0,h:0}}const width=Math.max(1,Math.round(r.width*d)),height=Math.max(1,Math.round(r.height*d));if(c.width!==width)c.width=width;if(c.height!==height)c.height=height;x.setTransform(c.width/r.width,0,0,c.height/r.height,0,0);return {ctx:x,w:r.width,h:r.height}}
function fit(){if(!bs.length){view={x:0,y:0,scale:100};return}let minX=Math.min(...bs.map(b=>b.x)),maxX=Math.max(...bs.map(b=>b.x)),minY=Math.min(...bs.map(b=>b.y)),maxY=Math.max(...bs.map(b=>b.y));view.x=(minX+maxX)/2;view.y=(minY+maxY)/2;view.scale=Math.min(W/(Math.max(maxX-minX,2)*1.3),H/(Math.max(maxY-minY,2)*1.3))}
function list(){let old=selected; $('objectList').replaceChildren(...bs.map(b=>{let o=document.createElement('option');o.value=b.id;o.textContent=bodyLabel(b);return o}));selected=bs.find(b=>b.id===old)?.id??bs[0]?.id;$('objectList').value=selected??'';updateReference();cancelPrediction();fill(true);$('count').textContent=bs.length;diagnostics()}
function fill(force=false){let b=bs.find(b=>b.id===selected);$('editForm').hidden=!b;$('delete').disabled=!b;$('selectedName').textContent=b?bodyLabel(b):t('Leerer Raum');$('selectedType').textContent=b?{planet:t('PLANET'),star:t('STERN'),hole:t('SCHWARZES LOCH')}[b.type]:t('KÖRPER HINZUFÜGEN');$('selectedDot').style.color=b?.color??'#777';if(force){formDirty=false;$('editError').textContent=''}if(!b||formDirty)return;const factor=C.AU/C.day/1000;for(let [id,val] of Object.entries({mass:b.m,posX:b.x,posY:b.y,velX:b.vx*factor,velY:b.vy*factor}))$(id).value=Number(val.toPrecision(9))}
function updateReference(){const previous=Number($('referenceBody').value);const candidates=bs.filter(b=>b.id!==selected);$('referenceBody').replaceChildren(new Option(t('Keine Referenz'),''),...candidates.map(b=>new Option(bodyLabel(b),String(b.id))));const choice=candidates.find(b=>b.id===previous)??candidates.slice().sort((a,b)=>b.m-a.m)[0];$('referenceBody').value=choice?String(choice.id):''}
function cancelPrediction(){predictionGeneration++;forecast=null;predictionBusy=false;$('predictionNote').textContent=t('Keine aktuelle Vorhersage. Bei Bedarf neu berechnen.');requestGravityDraw()}
function startPrediction(){cancelPrediction();if(!$('predictionOn').checked)return;const generation=predictionGeneration,stamp=elapsed,id=selected;const job=predict(bs.map(b=>({...b,trail:[]})),id,Number($('predictionHorizon').value));predictionBusy=true;$('predictionNote').textContent=t('Berechnet separate Kopie …');function portion(){if(generation!==predictionGeneration)return;const r=job.next();if(!r.done){setTimeout(portion,0);return}predictionBusy=false;forecast={...r.value,id,stamp};renderPrediction()}setTimeout(portion,0)}
function renderPrediction(){const reasons={'complete':'Horizont erreicht','step-limit':'Schrittbudget erreicht','body-limit':'Abbruch: mehr als 12 Körper','invalid-state':'Abbruch: ungültiger Zustand','invalid-budget':'Abbruch: ungültiges Budget','collision':'Abbruch vor Kontakt/Verschmelzung','numerical-limit':'Abbruch: numerisches Limit'};$('predictionNote').textContent=tx`Stand ${num(forecast.stamp)} d · ${num(forecast.days)} d voraus · ${forecast.steps} Schritte · ${t(reasons[forecast.reason])}. Numerische Modellvorhersage bei unveränderten Anfangsbedingungen; keine laufende Aktualisierung. Chaos: starke Empfindlichkeit. Tunneling bleibt möglich.`;requestGravityDraw()}
$('referenceBody').onchange=()=>diagnostics();
$('predictionOn').onchange=()=>{$('predictionOn').checked?startPrediction():cancelPrediction()};$('predictionRefresh').onclick=startPrediction;$('predictionHorizon').onchange=()=>cancelPrediction();
function rebase(reason='Manueller Eingriff'){baseline=energy(bs);instrumentBase=makeBaseline(bs,reason);lastStep=null;bs.forEach(b=>b.trail=[]);cancelPrediction();$('baselineNote').textContent=t(reason)+t(' · Baseline neu gesetzt.')}
function load(){numericalFault=false;updatePlayback();bs=experiment($('scenario').value);registerBodyLabels(bs);selected=bs.find(b=>b.name==='Erde')?.id??bs.find(b=>b.name==='Testkörper')?.id??bs[0]?.id;elapsed=0;collisions=0;accum=0;rebase('Reset / Szenario');list();fit();$('scenarioHint').textContent=t(experimentInfo[$('scenario').value])}
$('zoomIn').onclick=()=>{view.scale=Math.min(1e9,view.scale*1.7);requestGravityDraw()};$('zoomOut').onclick=()=>{view.scale=Math.max(.01,view.scale/1.7);requestGravityDraw()};
$('scenario').onchange=load;$('reset').onclick=load;$('fit').onclick=()=>{fit();requestGravityDraw()};
$('grid').onchange=$('trails').onchange=requestGravityDraw;
function updatePlayback(){
 $('play').disabled=numericalFault;
 $('play').textContent=paused?'▶':'Ⅱ';
 $('play').setAttribute('aria-label',paused?t('Fortsetzen'):t('Pausieren'));
 $('runLabel').textContent=numericalFault?t('NUMERISCHES LIMIT'):paused?t('SIMULATION PAUSIERT'):t('SIMULATION AKTIV');
}
function stopNumerical(){
 numericalFault=true;paused=true;accum=0;lastStep=null;updatePlayback();
 $('baselineNote').textContent=t('Numerischer Fehler: Simulation angehalten, Reset erforderlich.');
 cancelPrediction();
}
$('play').onclick=()=>{if(numericalFault)return;paused=!paused;updatePlayback();syncGravity()};
$('objectList').onchange=()=>{selected=Number($('objectList').value);updateReference();cancelPrediction();fill(true);diagnostics()};
$('editForm').addEventListener('input',()=>{formDirty=true});$('editForm').addEventListener('change',()=>{formDirty=true});
$('editForm').onsubmit=e=>{e.preventDefault();formDirty=true;let b=bs.find(b=>b.id===selected);if(!b)return;let vals=['mass','posX','posY','velX','velY'].map(id=>Number($(id).value));if(['mass','posX','posY','velX','velY'].some(id=>$(id).value.trim?.()==='')||!vals.every(Number.isFinite)||vals[0]<1e-15||vals[0]>1e11){$('editError').textContent=t('Endliche Zahlen mit Dezimalpunkt eingeben; Masse zwischen 10⁻¹⁵ und 10¹¹ M☉.');return}$('editError').textContent='';[b.m,b.x,b.y,b.vx,b.vy]=vals;b.vx*=1000*C.day/C.AU;b.vy*=1000*C.day/C.AU;accum=0;rebase();fill(true);diagnostics()};
$('delete').onclick=()=>{bs=bs.filter(b=>b.id!==selected);rebase();list()};
document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{newType=b.dataset.type;document.querySelectorAll('[data-type]').forEach(x=>x.classList.toggle('chosen',x===b))});
function setAdding(x){adding=x;$('add').classList.toggle('active',x);$('add').textContent=x?t('✕ Platzieren abbrechen'):t('＋ Körper platzieren');canvas.style.cursor=x?'crosshair':'grab';requestGravityDraw()}
$('add').onclick=()=>setAdding(!adding);document.addEventListener('keydown',e=>{if(e.key==='Escape')setAdding(false)});
const toWorld=(x,y)=>({x:(x-W/2)/view.scale+view.x,y:-(y-H/2)/view.scale+view.y});
const toScreen=b=>({x:W/2+(b.x-view.x)*view.scale,y:H/2-(b.y-view.y)*view.scale});
let drag=null;
canvas.onpointerdown=e=>{const r=canvas.getBoundingClientRect();drag={sx:e.clientX-r.left,sy:e.clientY-r.top,x:e.clientX-r.left,y:e.clientY-r.top,vx:view.x,vy:view.y,adding};canvas.setPointerCapture(e.pointerId);requestGravityDraw()};
canvas.onpointermove=e=>{if(!drag)return;let r=canvas.getBoundingClientRect();drag.x=e.clientX-r.left;drag.y=e.clientY-r.top;if(!drag.adding){view.x=drag.vx-(drag.x-drag.sx)/view.scale;view.y=drag.vy+(drag.y-drag.sy)/view.scale}requestGravityDraw()};
canvas.onpointerup=e=>{if(!drag)return;let d=drag;drag=null;requestGravityDraw();if(d.adding){if(bs.length>=60){$('addHint').textContent=t('Limit: 60 Körper für flüssige Berechnungen.');return}let p=toWorld(d.sx,d.sy),v=toWorld(d.x,d.y);let b=body({planet:'Planet',star:'Stern',hole:'Schwarzes Loch'}[newType]+' '+(bs.length+1),newType,newType==='planet'?C.earth/C.sun:1,p.x,p.y,(v.x-p.x)/30,(v.y-p.y)/30,{planet:'#82d9e1',star:'#ffd19a',hole:'#b99aff'}[newType]);bs.push(b);registerBodyLabels([b]);selected=b.id;rebase();list();setAdding(false)}else if(Math.hypot(d.x-d.sx,d.y-d.sy)<5){let near=bs.map(b=>({b,d:Math.hypot(toScreen(b).x-d.x,toScreen(b).y-d.y)})).sort((a,b)=>a.d-b.d)[0];if(near?.d<22){selected=near.b.id;list()}}};canvas.onpointercancel=()=>{drag=null;requestGravityDraw()};
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=toWorld(x,y);view.scale=Math.max(.01,Math.min(1e9,view.scale*Math.exp(-e.deltaY*.001)));let q=toWorld(x,y);view.x+=p.x-q.x;view.y+=p.y-q.y;requestGravityDraw()},{passive:false});
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await canvas.parentElement.requestFullscreen()}catch{$('pointerHint').textContent=t('Vollbild wird hier nicht unterstützt.')}};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;if(tab!=='gravity')cancelPrediction();document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===tab));document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',String(t===b))});if(tab==='blackhole')drawLab();syncGravity()});
function draw(){let r=resizeCanvas(canvas);W=r.w;H=r.h;if(!W||!H)return;ctx.clearRect(0,0,W,H);ctx.fillStyle='#090a10';ctx.fillRect(0,0,W,H);for(let i=0;i<145;i++){let x=((i*1783+89)%10007)/10007*W,y=((i*3853+127)%9967)/9967*H;ctx.fillStyle=`rgba(193,185,216,${.13+(i%4)*.08})`;ctx.fillRect(x,y,i%9===0?1.5:.7,i%9===0?1.5:.7)}
if(numericalFault||![view.x,view.y,view.scale].every(Number.isFinite)||view.scale<=0)return;
let raw=100/view.scale,pow=10**Math.floor(Math.log10(raw)),spacing=[1,2,5,10].find(n=>n*pow>=raw)*pow,pix=spacing*view.scale;
if($('grid').checked){ctx.strokeStyle='#77708a12';ctx.lineWidth=1;let startX=((W/2-view.x*view.scale)%pix+pix)%pix,startY=((H/2+view.y*view.scale)%pix+pix)%pix;ctx.beginPath();for(let x=startX;x<W;x+=pix){ctx.moveTo(x,0);ctx.lineTo(x,H)}for(let y=startY;y<H;y+=pix){ctx.moveTo(0,y);ctx.lineTo(W,y)}ctx.stroke();ctx.strokeStyle='#77708a28';let o=toScreen({x:0,y:0});ctx.beginPath();ctx.moveTo(o.x-8,o.y);ctx.lineTo(o.x+8,o.y);ctx.moveTo(o.x,o.y-8);ctx.lineTo(o.x,o.y+8);ctx.stroke()}
for(let b of bs){let p=toScreen(b);if($('trails').checked&&b.trail.length>1){ctx.beginPath();b.trail.forEach((v,i)=>{let q=toScreen(v);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.strokeStyle=b.color+'65';ctx.lineWidth=.9;ctx.stroke()}let vr=b.type==='star'?8+Math.max(0,Math.log10(b.m+1))*2:b.type==='hole'?10:3.8+Math.max(0,Math.log10(b.m*C.sun/C.earth))*1.1;vr=Math.min(22,Math.max(vr,radius(b)*view.scale));if(![p.x,p.y,vr].every(Number.isFinite)||p.x< -50||p.y< -50||p.x>W+50||p.y>H+50)continue;
let glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,vr*4);glow.addColorStop(0,b.color+'35');glow.addColorStop(1,b.color+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,vr*4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,vr,0,Math.PI*2);ctx.fillStyle=b.type==='hole'?'#020206':b.color;ctx.fill();if(b.type==='hole'){ctx.strokeStyle=b.color;ctx.lineWidth=1.3;ctx.stroke()}if(b.id===selected){ctx.beginPath();ctx.arc(p.x,p.y,vr+5,0,Math.PI*2);ctx.strokeStyle=b.color+'80';ctx.lineWidth=.7;ctx.stroke()}if($('labels').checked){ctx.fillStyle=b.id===selected?'#e3d8f6':'#9993a7';ctx.font='13px system-ui';ctx.fillText(bodyLabel(b),p.x+vr+9,p.y+3)}}
if(forecast&&forecast.id===selected&&$('predictionOn').checked){ctx.beginPath();forecast.points.forEach((b,i)=>{const p=toScreen(b);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.strokeStyle='#e5b3ff';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([])}
if(drag?.adding){ctx.strokeStyle='#b89af1';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(drag.sx,drag.sy);ctx.lineTo(drag.x,drag.y);ctx.stroke();ctx.setLineDash([]);let v=Math.hypot(drag.x-drag.sx,drag.y-drag.sy)/view.scale/30*C.AU/C.day/1000;ctx.fillStyle='#ddcaff';ctx.font='13px system-ui';ctx.fillText(num(v)+' km/s',drag.x+10,drag.y-12)}$('scaleLabel').textContent=tx`┝ ${num(spacing)} AU / Raster`}
function diagnostics(updateForm=true){const q=readDiagnostics(bs,instrumentBase,selected,Number($('referenceBody').value));$('selectedSpeed').textContent=q.speedKms===null?'—':sci(q.speedKms,'km/s');$('selectedDistance').textContent=q.distanceM===null?t('— (keine Referenz)'):tx`${length(q.distanceM)} zu ${bodyLabel(bs.find(b=>b.name===q.referenceName))}`;$('systemEnergy').textContent=sci(q.energy);$('systemMomentum').textContent='('+sci(q.px)+', '+sci(q.py)+')';$('systemAngular').textContent=sci(q.l);$('momentumDrift').textContent=q.momentumDrift===null?t('— (Norm null)'):sci(q.momentumDrift);$('angularDrift').textContent=q.angularDrift===null?t('— (Norm null)'):sci(q.angularDrift);$('integrationStep').textContent=lastStep===null?'—':sci(lastStep,t('Tage'));  $('time').textContent=num(elapsed,5)+t(' Tage');$('speedLabel').textContent=num(10**Number($('speed').value))+t(' Tage/s');$('collisions').textContent=collisions;let e=energy(bs);$('drift').textContent=baseline?sci(Math.abs((e-baseline)/baseline)*100,'%'):'—';const warning=modelStatus(bs);$('modelWarning').hidden=!warning;$('modelWarning').textContent=warning;$('status').textContent=limited?t('Schrittlimit erreicht · Zeitraffer wird gebremst.'):t('Velocity Verlet · adaptiv (unverändert)');if(updateForm&&!formDirty&&!document.activeElement?.closest('#editForm'))fill()}
function loop(now){
 gravityDirty=false;
 // Keep the scheduler alive even if an unexpected rendering error escapes.
 try{
  let wall=Math.min((now-(last||now))/1000,.05);last=now;
  if(!numericalFault&&!bs.every(b=>Number.isFinite(b.m)&&b.m>0&&[b.x,b.y,b.vx,b.vy].every(Number.isFinite)))stopNumerical();
  if(!paused&&tab==='gravity'&&bs.length){
   accum=Math.min(accum+wall*10**Number($('speed').value),10**Number($('speed').value));let n=0;
   while(accum>1e-12&&n<800){
    let dt=Math.min(accum,safeStep(bs));
    if(!Number.isFinite(dt)||dt<=0||!Number.isFinite(elapsed+dt)){stopNumerical();break}
    let hit=step(bs,dt);lastStep=dt;elapsed+=dt;accum-=dt;n++;
    if(!bs.every(b=>Number.isFinite(b.m)&&b.m>0&&[b.x,b.y,b.vx,b.vy].every(Number.isFinite))){stopNumerical();break}
    if(hit){registerBodyLabels(bs);collisions+=hit;rebase('Kollision / Verschmelzung');list()}
   }
   limited=n===800;if(limited)accum=0;
   if(!numericalFault&&frame%3===0)bs.forEach(b=>{b.trail.push({x:b.x,y:b.y});if(b.trail.length>1600)b.trail.shift()});
  }
  if(tab==='gravity')draw();
  if(!numericalFault&&frame%15===0)diagnostics();
  frame++;
 }finally{scheduleGravity()}
}

let mass=C.sun,bhMassInvalid=false;
function renderBHValidity(){const message=bhMassInvalid?t('Masse zwischen 1 und 10⁴¹ kg eingeben.'):'';$('bhMass').setCustomValidity(message);$('bhMassError').textContent=message}
function setMass(m){if(!Number.isFinite(m)||m<1||m>1e41){bhMassInvalid=true;renderBHValidity();return}bhMassInvalid=false;renderBHValidity();mass=m;$('bhMass').value=m;$('bhSlider').value=Math.log10(m);drawLab()}
$('bhMass').onchange=()=>setMass(Number($('bhMass').value));$('bhMass').oninput=()=>{bhMassInvalid=false;renderBHValidity()};$('bhSlider').oninput=()=>setMass(10**Number($('bhSlider').value));document.querySelectorAll('[data-mass]').forEach(b=>b.onclick=()=>setMass(Number(b.dataset.mass)));
function drawLab(){if(tab!=='blackhole')return;let v=blackHole(mass);$('bhRadius').textContent=length(v.radius);$('bhTemp').textContent=sci(v.temperature,'K');$('bhPower').textContent=sci(v.power,'W');$('bhLife').textContent=sci(v.lifetime/C.year,t('Jahre'));$('massDescription').textContent=sci(mass/C.sun,'M☉');$('bhNote').textContent=t('Modellschätzungen: perfekter Schwarzkörper, nur Photonen, leeres Universum; keine Greybody-Faktoren, zusätzlichen Teilchenarten oder Akkretion. ')+(v.temperature<2.725?t('ⓘ Kälter als die kosmische Hintergrundstrahlung (2,725 K). Heute würde dieses Loch netto Strahlungsenergie aufnehmen. Die Lebensdauer gilt für ein leeres Universum.'):t('ⓘ Idealisierte Photonen-Schätzung im leeren Universum. Zusätzliche Teilchensorten und Greybody-Faktoren verändern Leistung und Lebensdauer. Keine Vorhersage der letzten Quantenphase.'))+(v.temperature>1e9?t(' ⚠ Heißes kleines Loch: zusätzliche Teilchenkanäle können diese Schätzungen stark verändern.'):'');
let {ctx:x,w,h}=resizeCanvas($('sizes'));x.clearRect(0,0,w,h);const items=[['Horizont rₛ',v.radius,'#b99aff'],['Erde',6.371e6,'#79d6e8'],['Sonne',6.957e8,'#d9b779']];let lo=Math.floor(Math.min(...items.map(a=>Math.log10(a[1]))))-2,hi=Math.ceil(Math.max(...items.map(a=>Math.log10(a[1]))))+2,px=n=>45+(Math.log10(n)-lo)/(hi-lo)*(w-90);x.strokeStyle='#33303d';x.beginPath();x.moveTo(45,h-32);x.lineTo(w-45,h-32);x.stroke();for(let i=0;i<=4;i++){let value=lo+(hi-lo)*i/4,xx=45+(w-90)*i/4;x.fillStyle='#777080';x.font='12px system-ui';x.textAlign='center';x.fillText('10^'+num(value)+' m',xx,h-12)}items.forEach(([name,val,color],i)=>{let xx=px(val),yy=30+i*30;x.fillStyle=color;x.beginPath();x.arc(xx,yy,5,0,2*Math.PI);x.fill();x.strokeStyle=color+'55';x.beginPath();x.moveTo(xx,yy+7);x.lineTo(xx,h-34);x.stroke();x.textAlign=xx>w*.65?'right':'left';x.font='12px system-ui';x.fillText(t(name)+' · '+length(val),xx+(xx>w*.65?-10:10),yy+3)});
let chart=resizeCanvas($('bhChart')),z=chart.ctx,cw=chart.w,ch=chart.h;z.clearRect(0,0,cw,ch);let left=38,right=cw-14,top=12,bottom=ch-29,xx=t=>left+t/41*(right-left),yy=t=>bottom-(t+40)/150*(bottom-top);z.font='12px system-ui';z.textAlign='right';for(let t=-40;t<=110;t+=30){z.strokeStyle='#25222e';z.beginPath();z.moveTo(left,yy(t));z.lineTo(right,yy(t));z.stroke();z.fillStyle='#7d748a';z.fillText(t,left-8,yy(t)+3)}z.textAlign='center';for(let t=0;t<=40;t+=5){z.fillStyle='#7d748a';z.fillText(t,xx(t),ch-9)}for(let [key,col] of [['temperature','#b99aff'],['lifetime','#79d6e8'],['radius','#d9b779']]){z.beginPath();for(let t=0;t<=41;t+=.2){let val=blackHole(10**t)[key]/(key==='lifetime'?C.year:1),y=yy(Math.log10(val));t?z.lineTo(xx(t),y):z.moveTo(xx(t),y)}z.strokeStyle=col;z.lineWidth=1.6;z.stroke();let val=v[key]/(key==='lifetime'?C.year:1);z.fillStyle=col;z.beginPath();z.arc(xx(Math.log10(mass)),yy(Math.log10(val)),4,0,2*Math.PI);z.fill()}z.strokeStyle='#d9cced66';z.setLineDash([3,4]);z.beginPath();z.moveTo(xx(Math.log10(mass)),top);z.lineTo(xx(Math.log10(mass)),bottom);z.stroke();z.setLineDash([])}
let checkResults=[];
function renderChecks(){const rs=checkResults;$('testResults').replaceChildren(...rs.map(r=>{let p=document.createElement('span');p.style.display='block';p.style.color=r.ok?'#a6d4b6':'#e490a0';p.textContent=(r.ok?'✓ ':'✕ ')+t(r.name);return p}));return rs}
let checkState={runs:0,running:false,results:[],error:false};
function renderCheckStatus(){const s=checkState,passed=s.results.filter(r=>r.ok).length,key=s.running?'Prüfung läuft …':s.error?'Prüfung #{run} konnte nicht abgeschlossen werden. Worker nicht verfügbar, blockiert oder Zeitlimit erreicht; erneut versuchen.':passed===s.results.length?'Prüfung #{run} abgeschlossen – {passed}/{total} bestanden.':'Prüfung #{run} fehlgeschlagen – {passed}/{total} bestanden.';$('checkRunStatus').textContent=t(key,{run:s.runs,passed,total:s.results.length});$('checkRunStatus').dataset.run=String(s.runs);$('checkRunStatus').setAttribute('aria-busy',String(s.running));$('runTests').disabled=s.running}
const selfChecks=createSelfChecks({onUpdate:s=>{checkState=s;checkResults=s.results;renderChecks();renderCheckStatus()}});
function runChecks(){const focused=document.activeElement===$('runTests');return selfChecks.run().then(result=>{if(focused&&document.activeElement===document.body&&tab==='science')$('runTests').focus();return result})}$('runTests').onclick=runChecks;
window.addEventListener('resize',()=>{if(tab==='blackhole')drawLab();syncGravity()});new ResizeObserver(()=>{if(tab==='blackhole')drawLab()}).observe($('bh-main')??$('blackhole'));
new ResizeObserver(requestGravityDraw).observe(canvas);
resizeCanvas(canvas);W=canvas.getBoundingClientRect().width;H=canvas.getBoundingClientRect().height;load();setAdding(false);runChecks();scheduleGravity();
function requestGravityDraw(){gravityDirty=true;scheduleGravity()}
function scheduleGravity(){if(gravityRaf===null&&tab==='gravity'&&!document.hidden&&gravitySeen&&(gravityDirty||!paused&&bs.length))gravityRaf=requestAnimationFrame(now=>{gravityRaf=null;loop(now)})}
function syncGravity(){if(gravityRaf!==null&&typeof cancelAnimationFrame==='function'){cancelAnimationFrame(gravityRaf);gravityRaf=null}last=0;requestGravityDraw()}
document.addEventListener('visibilitychange',syncGravity);
globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){paused=true;updatePlayback();syncGravity()}});
onLanguageChange(()=>{for(const id of ['objectList','referenceBody'])for(const option of $(id).options??[]){const b=bs.find(b=>b.id===Number(option.value));option.textContent=b?bodyLabel(b):t('Keine Referenz')}const b=bs.find(b=>b.id===selected);$('selectedName').textContent=b?bodyLabel(b):t('Leerer Raum');$('selectedType').textContent=b?{planet:t('PLANET'),star:t('STERN'),hole:t('SCHWARZES LOCH')}[b.type]:t('KÖRPER HINZUFÜGEN');$('scenarioHint').textContent=t(experimentInfo[$('scenario').value]);for(const id of ['predictionNote','baselineNote','addHint','pointerHint','editError'])$(id).textContent=translateText($(id).textContent);if(instrumentBase&&!numericalFault)$('baselineNote').textContent=t(instrumentBase.reason)+t(' · Baseline neu gesetzt.');if(forecast)renderPrediction();setAdding(adding);renderBHValidity();updatePlayback();diagnostics(false);drawLab();renderChecks();renderCheckStatus();requestGravityDraw()});
window.entrolab={checks:runChecks,blackHole,getBodies:()=>structuredClone(bs),renderInfo:()=>({frame,tab,scheduled:gravityRaf!==null}),inspect:()=>structuredClone({bodies:bs,selected,paused,elapsed,collisions,view,forecast,predictionGeneration})};



if(typeof IntersectionObserver==='function'){const gravityObserver=new IntersectionObserver(entries=>{gravitySeen=entries[0].isIntersecting;syncGravity()});gravityObserver.observe(canvas)}

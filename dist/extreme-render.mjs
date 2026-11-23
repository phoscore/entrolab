import {t} from './i18n.mjs';
// Procedural artwork, not GR, radiative-transfer, fluid or thermal-particle dynamics.
export function fitCanvas(canvas,quality='low'){const rect=canvas.getBoundingClientRect(),d=Math.min(globalThis.devicePixelRatio||1,quality==='high'?1.75:1.25);if(rect.width<1||rect.height<1)return null;const w=rect.width,h=rect.height;if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {ctx,w,h}}
function circle(x,cx,cy,r,color){x.fillStyle=color;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill()}
export function drawObject(canvas,s,time){const fit=fitCanvas(canvas,s.quality);if(!fit)return;const {ctx:x,w,h}=fit,cx=w*.5,cy=h*.49,R=Math.min(w*.12,h*.16)*s.zoom; x.fillStyle='#06070d';x.fillRect(0,0,w,h);
for(let i=0;i<110;i++){const sx=((i*1783+89)%10007)/10007*w,sy=((i*3853+127)%9967)/9967*h;circle(x,sx,sy,i%13===0?1.1:.55,`rgba(199,194,226,${.15+(i%4)*.1})`)}
if(!s.exhibit||s.kind!=='blackhole'||(!s.geometry&&s.disk)){
 const halo=x.createRadialGradient(cx,cy,R*.8,cx,cy,R*4.8);
 halo.addColorStop(0,s.kind==='blackhole'?'#90602f30':'#7e81d94a');halo.addColorStop(1,'#00000000');
 x.fillStyle=halo;x.fillRect(0,0,w,h);
}
if(s.kind!=='blackhole'){drawStellar(x,w,h,cx,cy,R,s,time);return}
if(s.geometry){for(const [factor,color,label] of [[3,'#9274d5','ISCO · 3 rₛ'],[1.5,'#e4bd89','Photonensphäre · 1,5 rₛ'],[1,'#e7e2f5','Horizont · rₛ']]){x.beginPath();x.arc(cx,cy,R*factor,0,7);x.setLineDash(factor===1?[]:[4,5]);x.strokeStyle=color;x.lineWidth=1.2;x.stroke();x.fillStyle=color;x.font='13px system-ui';x.fillText(t(label),Math.max(12,Math.min(cx+7,w-(x.measureText?.(t(label))?.width??t(label).length*7)-12)),Math.max(34,Math.min(h-28,factor===3?cy+R*factor-12:cy-R*factor-8)))}x.setLineDash([]);circle(x,cx,cy,R,'#000');return}
if(s.exhibit){drawAccretionExhibit(x,cx,cy,R,s,time);return}
if(s.disk){
// Rings, brightness asymmetry and the upper arc are artistic projections only.
const tilt=.24+.65*s.angle/90;
x.save();x.translate(cx,cy);x.rotate(-.12);
for(let i=45;i>=0;i--){const r=R*(1.65+i*.065);x.beginPath();x.ellipse(0,0,r,r*tilt,0,0,7);x.strokeStyle=`rgba(255,${125+Math.floor(i*1.8)},${65+Math.floor(i*2.5)},${.025+.001*(45-i)})`;x.lineWidth=R*.075;x.stroke()}
x.restore();
x.save();x.translate(cx,cy);x.rotate(-.12);const n=s.quality==='high'?210:90;for(let i=0;i<n;i++){const radius=R*(1.7+(i%17)*.12),phase=(i*2.399+time*(.2+1.7/(radius/R)))%(Math.PI*2);x.beginPath();x.ellipse(0,0,radius,radius*tilt,0,phase,phase+.12+(i%5)*.012);x.strokeStyle=i%4===0?'#ffe3b8bb':'#f5a57460';x.lineWidth=i%4===0?1.4:.7;x.stroke()}x.restore();
x.save();x.shadowColor='#ffb478';x.shadowBlur=s.quality==='high'?16:0;x.strokeStyle='#ffe0ad88';x.lineWidth=1.4;x.beginPath();x.ellipse(cx,cy,R*1.78,R*1.78*tilt,-.12,0,7);x.stroke();x.restore();
x.strokeStyle='#e8b58448';x.lineWidth=R*.065;x.beginPath();x.ellipse(cx,cy,R*1.6,R*1.5,0,Math.PI,Math.PI*2);x.stroke();
}
circle(x,cx,cy,R*1.08,'#000');
if(s.disk){x.strokeStyle='#ffe3b3cc';x.lineWidth=1.1;x.beginPath();x.arc(cx,cy,R*1.1,0,7);x.stroke();x.save();x.beginPath();x.rect(0,cy+R*.18,w,h);x.clip();for(let i=0;i<16;i++){x.beginPath();x.ellipse(cx,cy,R*(1.2+i*.14),R*(.22+i*.025),-.12,0,Math.PI);x.strokeStyle=`rgba(255,${180+i*3},${120+i*4},${.16-i*.006})`;x.lineWidth=1.5;x.stroke()}x.restore()}
x.fillStyle='#ada1b4';x.font='12px system-ui';x.textAlign='center';x.fillText(s.disk?t('Akkretionsscheibe & Silhouette · künstlerisch'):t('Isoliert ohne Scheibe · Silhouette illustrativ'),cx,h-22);x.textAlign='left';}

// An inclined disc in the comparison exhibit. Brightness and silhouette are artistic choices.
function drawAccretionExhibit(x,cx,cy,r,state,time){
 if(!state.disk){circle(x,cx,cy,r*1.09,'#000');return}
 const squash=.085+.83*Math.sin(state.angle*Math.PI/180);
 x.save();x.translate(cx,cy);x.rotate(-.18);
 const count=state.quality==='high'?40:26;
 for(const near of [false,true]){
  if(near)circle(x,0,0,r*1.09,'#000');
  for(let i=count-1;i>=0;i--){
   const p=i/(count-1),radius=r*(1.45+2.47*p);
   const veil=(1-p)**2.25*(.78+.17*Math.sin(i*2.23)+.05*Math.sin(time*.47+i*.71));
   const heat=x.createLinearGradient(-radius,0,radius,0);
   heat.addColorStop(0,`rgba(123,50,32,${veil*.34})`);
   heat.addColorStop(.43,`rgba(195,82,40,${veil*.61})`);
   heat.addColorStop(.79,`rgba(238,150,76,${veil*.93})`);
   heat.addColorStop(1,`rgba(255,${Math.round(222-82*p)},${Math.round(159-93*p)},${veil})`);
   x.strokeStyle=heat;x.lineWidth=r*(near?.10:.09);
   x.beginPath();x.ellipse(0,0,radius,radius*squash,0,near?0:Math.PI,near?Math.PI:2*Math.PI);x.stroke();
  }
 }
 x.restore();
}
export function drawThermal(canvas,k,time,quality){const f=fitCanvas(canvas,quality);if(!f)return;const {ctx:x,w,h}=f;x.fillStyle='#0b0b13';x.fillRect(0,0,w,h);const fraction=k===0?0:Math.min(1,Math.max(0,(Math.log10(k)+3)/15));const hue=240-220*fraction,amount=quality==='high'?70:38;for(let i=0;i<amount;i++){const phase=time*(.08+fraction*1.9);const px=((i*.618)%1)*w+Math.sin(phase+i)*fraction*20,py=((i*.413)%1)*h+Math.cos(phase*1.3+i)*fraction*15;circle(x,(px+w)%w,(py+h)%h,1.5+(i%3)*.7,`hsla(${hue},75%,75%,${.2+(i%5)*.13})`)}x.fillStyle='#b5a9c6';x.font='12px system-ui';x.fillText(t('ABSTRAKT · keine Teilchen- oder Quantenberechnung'),12,h-12)}
// Layered light and projected texture are artwork, not a stellar-atmosphere calculation.
function drawStellar(x,w,h,cx,cy,R,s,time){
 const white=s.kind==='white',r=R*(white?1.35:1.08),fine=s.quality==='high';
 const aura=x.createRadialGradient(cx,cy,r*.7,cx,cy,r*3.7);
 aura.addColorStop(0,white?'#e5f2ff60':'#ac8bff42');aura.addColorStop(.3,white?'#74b1ff22':'#5746b51c');aura.addColorStop(1,'#05061100');circle(x,cx,cy,r*3.7,aura);
 if(!white){
  // Schematic field-like arcs; no magnetic field solution or physical strength.
  x.save();x.translate(cx,cy);x.rotate(-.35);
  for(let j=0;j<7;j++){x.beginPath();x.ellipse(0,0,r*(1.25+j*.22),r*(.6+j*.13),.5,0,Math.PI*2);x.strokeStyle=`rgba(158,128,235,${.12-j*.012})`;x.lineWidth=j%2?1:.65;x.stroke()}
  if(s.pulsar){x.rotate(time*.35);for(const sign of [-1,1]){const cone=x.createRadialGradient(0,0,r*.15,0,0,r*4.1);cone.addColorStop(0,'#e7edff80');cone.addColorStop(.2,'#c7d2ff50');cone.addColorStop(1,'#8f7dff00');x.fillStyle=cone;x.beginPath();x.moveTo(-r*.12,sign*r*.55);x.lineTo(-r*.8,sign*r*4.1);x.quadraticCurveTo(0,sign*r*4.35,r*.8,sign*r*4.1);x.lineTo(r*.12,sign*r*.55);x.closePath();x.fill()}}
  x.restore();
 }
 const shell=x.createRadialGradient(cx,cy,r*.95,cx,cy,r*1.25);shell.addColorStop(0,white?'#eff8ff70':'#ccbaff70');shell.addColorStop(.3,white?'#7dafff20':'#9775ed30');shell.addColorStop(1,'#00000000');circle(x,cx,cy,r*1.25,shell);
 const surface=x.createRadialGradient(cx-r*.32,cy-r*.38,r*.04,cx,cy,r*1.03);
 surface.addColorStop(0,white?'#ffffff':'#f5eeff');surface.addColorStop(.44,white?'#e4f2ff':'#b7a1ee');surface.addColorStop(.8,white?'#93b9da':'#605498');surface.addColorStop(1,white?'#283c5b':'#1b203b');circle(x,cx,cy,r,surface);
 x.save();x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.clip();
 const count=fine?150:68;
 for(let i=0;i<count;i++){
  const latitude=Math.acos(1-2*(i+.5)/count),longitude=i*2.399963+time*(white?.025:.07);
  const z=Math.sin(latitude)*Math.cos(longitude);if(z<0)continue;
  const px=cx+r*Math.sin(latitude)*Math.sin(longitude),py=cy+r*Math.cos(latitude),spot=(white?.045:.035)*r*(.4+z);
  x.fillStyle=white?`rgba(255,255,255,${.035+z*.065})`:`rgba(221,214,255,${.05+z*.08})`;
  x.beginPath();x.ellipse(px,py,Math.max(.2,spot*z),spot,0,0,Math.PI*2);x.fill();
 }
 const shade=x.createRadialGradient(cx-r*.36,cy-r*.42,r*.4,cx+r*.2,cy+r*.2,r*1.4);shade.addColorStop(0,'#00000000');shade.addColorStop(.65,'#11162620');shade.addColorStop(1,'#020511a0');circle(x,cx,cy,r,shade);x.restore();
 x.strokeStyle=white?'#d8ecff75':'#c7b4ff70';x.lineWidth=.8;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();
 x.fillStyle='#c7c0da';x.font='12px system-ui';x.textAlign='center';x.fillText(t(white?'Weißer Zwerg · Oberflächenlicht illustrativ':s.pulsar?'Pulsar-Beispiel · Kegel rein schematisch':'Neutronenstern · Feldlinien illustrativ'),cx,h-22);x.textAlign='left';
}

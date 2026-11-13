// Illustration only. Positions, colours, timing and projected field strength are not observables.
import { fitCanvas } from './extreme-render.mjs';

const circle = (x,cx,cy,r) => { x.beginPath(); x.arc(cx,cy,r,0,2*Math.PI); };
const disks = {
 brown: {size:.29,core:['#df9e81','#9f544c','#401e2a','#180f1d'],halo:'#9b463233'},
 supergiant: {size:.38,core:['#fff1b2','#fbc374','#c95c3c','#642132'],halo:'#c3563038'},
 magnetar: {size:.115,core:['#f8fcff','#acd6f8','#4666aa','#151d48'],halo:'#4467ba44'},
 wolf: {size:.17,core:['#ffffff','#e5faff','#8cc5ee','#355f94'],halo:'#71bafa66'},
};
const plates=new WeakMap();
const TAU=2*Math.PI;
const fraction=value=>value-Math.floor(value);

function sphere(x,cx,cy,r,kind) {
 const light=x.createRadialGradient(cx-r*.29,cy-r*.34,r*.04,cx,cy,r*1.03);
 disks[kind].core.forEach((colour,i)=>light.addColorStop([0,.38,.81,1][i],colour));
 x.fillStyle=light;circle(x,cx,cy,r);x.fill();
}

function drawPlate(x,w,h,cx,cy,r,kind) {
 const glow=x.createRadialGradient(cx,cy,r*.55,cx,cy,r*(kind==='magnetar'?5.2:2.15));
 glow.addColorStop(0,disks[kind].halo);
 glow.addColorStop(1,'#080a1500');
 x.fillStyle='#070914';x.fillRect(0,0,w,h);
 x.fillStyle=glow;x.fillRect(0,0,w,h);
 for(let i=0;i<82;i++){
  x.fillStyle=i%13===0?'#b6c3e093':'#8f9bbb3f';
  const size=i%13===0?1.4:.85;
  x.fillRect(fraction(i*.618033+.11)*w,fraction(i*.414213+.29)*h,size,size);
 }
 if(kind!=='magnetar')sphere(x,cx,cy,r,kind);
}

function background(canvas,x,w,h,cx,cy,r,kind) {
 const key=[canvas.width,canvas.height,w,h,r,kind].join(':');
 let entry=plates.get(canvas);
 if(entry?.key!==key){
  const layer=canvas.ownerDocument.createElement('canvas');
  layer.width=canvas.width;layer.height=canvas.height;
  const plate=layer.getContext('2d');
  if(!plate){drawPlate(x,w,h,cx,cy,r,kind);return;}
  plate.setTransform(layer.width/w,0,0,layer.height/h,0,0);
  drawPlate(plate,w,h,cx,cy,r,kind);
  entry={key,layer};plates.set(canvas,entry);
 }
 x.drawImage(entry.layer,0,0,w,h);
}

function brownClouds(x,cx,cy,r,time) {
 x.save();circle(x,cx,cy,r);x.clip();
 for(let band=0;band<8;band++){
  const y=cy+r*(band-3.5)*.255, bend=Math.sin(time*.30+band*1.83);
  x.beginPath();x.moveTo(cx-r,y-r*.06);
  x.bezierCurveTo(cx-r*.3,y+r*(.18+.11*bend),cx+r*.46,y-r*.23,cx+r,y+r*bend*.12);
  x.strokeStyle=band%3===0?'#f6bd9354':'#29182966';
  x.lineWidth=r*(band%3===0?.067:.095);x.stroke();
 }
 for(let i=0;i<12;i++){
  const y=cy+r*(fraction(i*.618)-.5)*1.6, px=cx+r*(fraction(i*.382+time*.014)*2-1);
  x.fillStyle=i%2?'#e6a88749':'#34192b80';
  x.beginPath();x.ellipse(px,y,r*(.13+i%4*.041),r*.039,-.12,0,TAU);x.fill();
 }
 x.restore();
}

function convection(x,cx,cy,r,time,quality) {
 x.save();circle(x,cx,cy,r);x.clip();
 const count=quality==='high'?26:16;
 for(let i=0;i<count;i++){
  const a=i*2.399963, d=Math.sqrt((i+.4)/count)*r;
  const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d;
  const size=r*(.17+fraction(i*.414)*.18)*(1+.12*Math.sin(time*.29+i));
  const glow=x.createRadialGradient(px,py,0,px,py,size);
  glow.addColorStop(0,i%4===0?'#792537b0':'#ffefb8ac');
  glow.addColorStop(.45,i%4===0?'#9c354050':'#ff9d5166');
  glow.addColorStop(1,'#a4443300');x.fillStyle=glow;
  x.fillRect(px-size,py-size,2*size,2*size);
 }
 x.restore();
}

function magnetar(x,cx,cy,r,time,quality) {
 const phase=time*.7+.75, tilt=.55, sine=Math.sin(tilt), cosine=Math.cos(tilt);
 // Rotation axis is vertical in the projection. The dipole tilts and co-rotates.
 const mx=sine*Math.cos(phase),my=-cosine;
 const loops=quality==='high'?14:9;
 for(let i=0;i<loops;i++){
  const phi=phase+TAU*(i%7)/7, shell=r*(2.35+.19*i);
  const ux=cosine*Math.cos(phase)*Math.cos(phi)-Math.sin(phase)*Math.sin(phi);
  const uy=sine*Math.cos(phi);
  const foot=Math.asin(Math.sqrt(r/shell));
  x.beginPath();
  for(let j=0;j<=36;j++){
   const angle=foot+(Math.PI-2*foot)*j/36, distance=shell*Math.sin(angle)**2;
   const px=cx+distance*(mx*Math.cos(angle)+ux*Math.sin(angle));
   const py=cy+distance*(my*Math.cos(angle)+uy*Math.sin(angle));
   if(j===0)x.moveTo(px,py);else x.lineTo(px,py);
  }
  x.strokeStyle=i%3===0?'#9cccf387':'#7388c44f';x.lineWidth=i%3===0?1.2:.8;x.stroke();
 }
 sphere(x,cx,cy,r,'magnetar');
 // A surface patch follows the near-side projection of the rotating magnetic pole.
 const near=Math.sin(phase);
 x.fillStyle='#f2f8ffbc';
 circle(x,cx+r*mx*Math.sign(near),cy+r*my*Math.sign(near),r*(.08+.045*Math.abs(near)));
 x.fill();
 x.setLineDash([4,5]);x.strokeStyle='#adb5cda8';x.lineWidth=1;
 x.beginPath();x.moveTo(cx,cy-r*3.8);x.lineTo(cx,cy+r*3.8);x.stroke();
 x.setLineDash([]);x.strokeStyle='#acd8fa';x.lineWidth=1.25;
 x.beginPath();x.moveTo(cx-mx*r*3.1,cy-my*r*3.1);x.lineTo(cx+mx*r*3.1,cy+my*r*3.1);x.stroke();
}

function wind(x,cx,cy,r,time,quality) {
 const count=quality==='high'?65:37;
 for(let i=0;i<count;i++){
  const angle=i*2.399963, p=fraction(i*.618033+time*(.15+(i%4)*.027));
  const start=r*(1+p*3.2), end=start+r*(.18+p*.34);
  const dx=Math.cos(angle),dy=Math.sin(angle);
  x.strokeStyle=`rgba(159,210,250,${.08+.42*Math.sin(Math.PI*p)})`;
  x.lineWidth=i%6===0?1.55:.8;
  x.beginPath();x.moveTo(cx+start*dx,cy+start*dy);x.lineTo(cx+end*dx,cy+end*dy);x.stroke();
 }
}

export function drawStellarExample(canvas,state,time) {
 const fit=fitCanvas(canvas,state.quality);
 if(!fit)return;
 const {ctx:x,w,h}=fit,{kind,quality}=state;
 const cx=w/2,cy=h*.49,r=Math.min(h*disks[kind].size,w*(kind==='magnetar'?.14:.36))*state.zoom;
 x.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
 background(canvas,x,w,h,cx,cy,r,kind);
 if(kind==='brown')brownClouds(x,cx,cy,r,time);
 if(kind==='supergiant')convection(x,cx,cy,r,time,quality);
 if(kind==='magnetar')magnetar(x,cx,cy,r,time,quality);
 if(kind==='wolf')wind(x,cx,cy,r,time,quality);
}

// Illustration only. Positions, colours, timing and projected field strength are not observables.
import { fitCanvas } from './extreme-render.mjs';

const circle = (x,cx,cy,r) => { x.beginPath(); x.arc(cx,cy,r,0,2*Math.PI); };
const disks = {
 brown: {size:.32,halo:'#7736362c'},
 supergiant: {size:.40,halo:'#a82e1b42'},
 magnetar: {size:.125,core:['#edf4ff','#9aabc8','#415674','#111824'],halo:'#3f577123'},
 wolf: {size:.15,core:['#ffffff','#f3f7ff','#bbcbe1','#60758d'],halo:'#8da9cc46'},
 sun: {size:.36,halo:'#ae63242e'},
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
 x.fillStyle='#070910';x.fillRect(0,0,w,h);
 x.fillStyle=glow;x.fillRect(0,0,w,h);
 for(let i=0;i<82;i++){
  x.fillStyle=i%13===0?'#b6c3e060':'#8f9bbb30';
  const size=i%13===0?1.2:.7;
  x.fillRect(fraction(i*.618033+.11)*w,fraction(i*.414213+.29)*h,size,size);
 }
 if(kind==='wolf'){
  const haze=x.createRadialGradient(cx,cy,r*.8,cx,cy,r*3.8);
  haze.addColorStop(0,'#dfebff70');haze.addColorStop(.14,'#afc5e33b');
  haze.addColorStop(.43,'#819ec31a');haze.addColorStop(1,'#819ec300');
  x.fillStyle=haze;circle(x,cx,cy,r*3.8);x.fill();
  windFilaments(x,cx,cy,r,0,42,40,.65);
 }
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

// Periodic texture lookup in longitude, orthographic projection onto the disk.
// The texture and its display cadence illustrate structure, with no physical time scale.
const mapWidth=512,mapHeight=256;
const surfaces=new Map();
const projected=new WeakMap();
const clamp01=value=>Math.max(0,Math.min(value,1));
const mix=(a,b,f)=>a+(b-a)*f;
const smooth=f=>f*f*(3-2*f);
function hash(x,y,seed) {
 let n=Math.imul(x,0x1f1f1f1f)^Math.imul(y,0x5f356495)^Math.imul(seed,0x2c1b3c6d);
 n=Math.imul(n^(n>>>16),0x85ebca6b);
 n=Math.imul(n^(n>>>13),0xc2b2ae35);
 return ((n^(n>>>16))>>>0)/4294967296;
}

function noise(u,v,columns,rows,seed) {
 const x=u*columns,y=v*rows,i=Math.floor(x),j=Math.floor(y);
 const a=(i%columns+columns)%columns,b=(a+1)%columns;
 const f=smooth(x-i),g=smooth(y-j);
 return mix(mix(hash(a,j,seed),hash(b,j,seed),f),mix(hash(a,j+1,seed),hash(b,j+1,seed),f),g);
}

function cells(u,v,columns,rows,seed) {
 const x=u*columns,y=v*rows,i=Math.floor(x),j=Math.floor(y);
 let first=Infinity,second=Infinity,tone=0;
 for(let row=j-1;row<=j+1;row++)for(let col=i-1;col<=i+1;col++){
  const c=(col%columns+columns)%columns;
  const dx=x-col-.15-.7*hash(c,row,seed),dy=y-row-.15-.7*hash(c,row,seed+1);
  const d=dx*dx+dy*dy;
  if(d<first){second=first;first=d;tone=hash(c,row,seed+2);}
  else if(d<second)second=d;
 }
 return smooth(clamp01((second-first)*2.7))*(.55+.45*tone);
}

// An illustrative activity group. Dark umbrae sit inside lighter penumbrae.
const spots=[[.566,.59,.008,.013],[.585,.598,.006,.010],[.597,.583,.003,.005],[.337,.39,.004,.006]];
const surfaceStyles={
 sun: {dark:[120,60,24],light:[255,235,183],rotation:1.0,limb:.49,
  brightness(u,v,grain){
   const warp=noise(u,v,67,35,2)-.5;
   const granules=cells(u+warp*.004,v+(grain-.5)*.004,137,71,19);
   let intensity=.62+granules*.36+grain*.046;
   for(const [x,y,w,h] of spots){
    const d=Math.hypot((u-x)/w,(v-y)/h)+(grain-.5)*.39;
    intensity-=.31*clamp01((1.1-d)*5)+.30*clamp01((.56-d)*8);
   }
   return intensity;
  }},
 brown: {dark:[22,15,25],light:[198,126,93],rotation:3.4,limb:.32,
  brightness(u,v,grain){
   const warp=noise(u,v,8,5,4)-.5;
   const broad=noise(u+warp*.065,v,9,22,5);
   const filaments=noise(u+warp*.06,v+warp*.024,21,78,6);
   const bands=Math.sin(TAU*(v*8.5+.31*warp+.10*Math.sin(TAU*u*3)));
   return .11+.34*broad+.28*filaments+.07*bands+.07*grain;
  }},
 supergiant: {dark:[79,13,18],light:[255,189,109],rotation:.65,limb:.39,
  brightness(u,v,grain){
   const x=u+(noise(u,v,18,11,7)-.5)*.09;
   const y=v+(noise(u,v,21,12,11)-.5)*.09;
   const hot=noise(x,y,12,7,8);
   const texture=noise(x,y,41,23,10);
   const giant=cells(x,y,15,8,13);
   return clamp01(.05+.78*hot+.24*texture+.09*giant+.07*grain);
  }},
};

function surfaceMap(kind,style) {
 if(surfaces.has(kind))return surfaces.get(kind);
 const map=new Float32Array(mapWidth*mapHeight);
 for(let y=0;y<mapHeight;y++)for(let x=0;x<mapWidth;x++){
  const u=x/mapWidth,v=y/mapHeight;
  map[y*mapWidth+x]=style.brightness(u,v,noise(u,v,211,105,36));
 }
 surfaces.set(kind,map);
 return map;
}

function projectDisk(canvas,size) {
 let disk=projected.get(canvas);
 if(disk?.size===size)return disk;
 const layer=canvas.ownerDocument.createElement('canvas');
 layer.width=layer.height=size;
 const context=layer.getContext('2d'),pixels=context.createImageData(size,size);
 const samples=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const nx=(2*x+1)/size-1,ny=(2*y+1)/size-1,distance=Math.hypot(nx,ny);
  if(distance>=1)continue;
  const depth=Math.sqrt(1-distance*distance);
  const latitude=Math.acos(-ny)/Math.PI*mapHeight;
  const row=Math.min(mapHeight-2,Math.floor(latitude));
  const lon=(.5+Math.atan2(nx,depth)/TAU)*mapWidth;
  const index=4*(y*size+x);
  pixels.data[index+3]=255*clamp01((1-distance)*size/2+.25);
  samples.push(index,depth,row*mapWidth,latitude-row,lon);
 }
 disk={size,layer,context,pixels,samples:new Float32Array(samples)};
 projected.set(canvas,disk);
 return disk;
}

function drawSurface(canvas,x,cx,cy,r,kind,time,quality) {
 const style=surfaceStyles[kind],map=surfaceMap(kind,style);
 const {layer,context,pixels,samples}=projectDisk(canvas,quality==='high'?256:176);
 const offset=(time*style.rotation)%mapWidth;
 const {data}=pixels,{dark,light,limb}=style;
 const red=light[0]-dark[0],green=light[1]-dark[1],blue=light[2]-dark[2];
 const evolution=Math.sin(time*(kind==='supergiant'?.37:.20));
 for(let i=0;i<samples.length;i+=5){
  const index=samples[i],row=samples[i+2],v=samples[i+3],u=samples[i+4]+offset;
  const col=Math.floor(u)&(mapWidth-1),next=(col+1)&(mapWidth-1),f=u-Math.floor(u);
  const b=mix(mix(map[row+col],map[row+next],f),mix(map[row+col+mapWidth],map[row+next+mapWidth],f),v);
  const brightness=b+evolution*(b-.55)*.08;
  const shade=1-limb*(1-samples[i+1]);
  data[index]=(dark[0]+red*brightness)*shade;
  data[index+1]=(dark[1]+green*brightness)*shade;
  data[index+2]=(dark[2]+blue*brightness)*shade;
 }
 context.putImageData(pixels,0,0);
 x.drawImage(layer,cx-r,cy-r,2*r,2*r);
}

function magnetar(x,cx,cy,r,time,quality) {
 const phase=time*.7+.75, tilt=.55, sine=Math.sin(tilt), cosine=Math.cos(tilt);
 // Rotation axis is vertical in the projection. The dipole tilts and co-rotates.
 const mx=sine*Math.cos(phase),my=-cosine;
 const loops=quality==='high'?18:12;
 for(let i=0;i<loops;i++){
  const phi=TAU*(i%6)/6, shell=r*(2.05+Math.floor(i/6)*.8);
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
  x.strokeStyle=i<6?'#c1d3ed98':'#94aec366';x.lineWidth=i<6?1.15:.8;x.stroke();
 }
 sphere(x,cx,cy,r,'magnetar');
 // A surface patch follows the near-side projection of the rotating magnetic pole.
 const near=Math.sin(phase);
 x.fillStyle=`rgba(242,248,255,${.75*Math.abs(near)})`;
 circle(x,cx+r*mx*Math.sign(near)*.91,cy+r*my*Math.sign(near)*.91,r*(.057+.055*Math.abs(near)));
 x.fill();
 x.setLineDash([4,5]);x.strokeStyle='#adb5cd8f';x.lineWidth=1;
 x.beginPath();x.moveTo(cx,cy-r*3.8);x.lineTo(cx,cy+r*3.8);x.stroke();
 x.setLineDash([]);x.strokeStyle='#d3e4f5d8';x.lineWidth=1;
 x.beginPath();x.moveTo(cx-mx*r*3.1,cy-my*r*3.1);x.lineTo(cx+mx*r*3.1,cy+my*r*3.1);x.stroke();
}

function windFilaments(x,cx,cy,r,time,count,seed,contrast) {
 for(let i=0;i<count;i++){
  const angle=i*TAU/count+(hash(i,0,seed)-.5)*.085;
  const knot=hash(i,0,seed+1),p=fraction(knot+time*(.095+knot*.033));
  const start=r*(.76+1.85*p*p),end=start+r*(.59+1.27*p);
  const dx=Math.cos(angle),dy=Math.sin(angle);
  const ax=cx+start*dx,ay=cy+start*dy,bx=cx+end*dx,by=cy+end*dy;
  const opacity=contrast*(.07+knot*.20)*Math.sin(Math.PI*p)**1.5*(1-p*.71);
  const width=r*(.016+.046*knot)*(1+p);
  const colour=x.createLinearGradient(ax,ay,bx,by);
  colour.addColorStop(0,'#afc5e300');
  colour.addColorStop(.34,`rgba(182,206,236,${opacity})`);
  colour.addColorStop(1,'#afc5e300');
  x.fillStyle=colour;x.beginPath();x.moveTo(ax,ay);
  x.quadraticCurveTo(mix(ax,bx,.48)-dy*width,mix(ay,by,.48)+dx*width,bx,by);
  x.quadraticCurveTo(mix(ax,bx,.48)+dy*width*.55,mix(ay,by,.48)-dx*width*.55,ax,ay);
  x.fill();
 }
}

export function drawStellarExample(canvas,state,time) {
 const fit=fitCanvas(canvas,state.quality);
 if(!fit)return;
 const {ctx:x,w,h}=fit,{kind,quality}=state;
 const cx=w/2,cy=h*.49,r=Math.min(h*disks[kind].size,w*(kind==='magnetar'?.14:.36))*state.zoom;
 x.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
 background(canvas,x,w,h,cx,cy,r,kind);
 if(kind==='magnetar')magnetar(x,cx,cy,r,time,quality);
 else if(kind==='wolf'){
  windFilaments(x,cx,cy,r,time,quality==='high'?28:20,52,1);
  sphere(x,cx,cy,r,'wolf');
 }
 else drawSurface(canvas,x,cx,cy,r,kind,time,quality);
}

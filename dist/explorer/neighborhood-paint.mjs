import {cameraScale,niceStep} from './camera.mjs';
import {NEIGHBORHOOD_RADIUS,PC_TO_LY,projectNeighborhood} from './foundation/neighborhood-format.mjs';

export const NEIGHBORHOOD_FRAME=[-NEIGHBORHOOD_RADIUS,-NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_RADIUS];

export function neighborhoodRingStep(scale,unit) {
  return niceStep(35/scale*(unit==='ly'?PC_TO_LY:1));
}

export function paintNeighborhood(ctx,{width,height,camera,plane,unit,data,detail,labels}) {
  ctx.clearRect(0,0,width,height);
  const scale=cameraScale(camera,width,height,NEIGHBORHOOD_FRAME);
  const origin=[width/2-camera.x*scale,height/2-camera.y*scale];
  const [sx,sy]=origin;
  const ringStep=neighborhoodRingStep(scale,unit);
  const unitFactor=unit==='ly'?PC_TO_LY:1;
  ctx.font='11px "DM Sans",sans-serif';
  ctx.lineWidth=1;
  const nearest=Math.hypot(Math.max(0,-sx,sx-width),Math.max(0,-sy,sy-height));
  const farthest=Math.hypot(Math.max(Math.abs(sx),Math.abs(width-sx)),Math.max(Math.abs(sy),Math.abs(height-sy)));
  const pixelsPerRing=ringStep*scale/unitFactor;
  for(let ring=Math.max(1,Math.ceil(nearest/pixelsPerRing));ring<=Math.floor(farthest/pixelsPerRing);ring++) {
    const r=ring*pixelsPerRing;
    ctx.strokeStyle='rgba(137,189,190,.24)';
    ctx.beginPath();ctx.arc(sx,sy,r,0,2*Math.PI);ctx.stroke();
    const lx=sx+r*.707+4, ly=sy-r*.707-4;
    if(lx>6 && lx<width-64 && ly>15 && ly<height-8) {
      const label=labels.number(ring*ringStep)+' '+labels.unit;
      ctx.fillStyle='#b0d1cf';ctx.fillText(label,lx,ly);
    }
  }
  ctx.setLineDash([3,6]);ctx.strokeStyle='rgba(184,215,200,.42)';
  ctx.beginPath();ctx.arc(sx,sy,NEIGHBORHOOD_RADIUS*scale,0,2*Math.PI);ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle='rgba(141,185,195,.22)';
  ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(width,sy);ctx.moveTo(sx,0);ctx.lineTo(sx,height);ctx.stroke();

  const marks=[];
  let visible=0;
  if(data) {
    const grid=5, columns=Math.ceil(width/grid), budget=width<500?1050:2200;
    const slots=new Uint8Array(columns*Math.ceil(height/grid));
    ctx.fillStyle='#b0cbd1';
    const vertical=plane==='xz'?2:1;
    for(const row of data.order) {
      const x=sx+data.xyz[3*row]*scale,y=sy-data.xyz[3*row+vertical]*scale;
      if(x<0 || x>=width || y<0 || y>=height) continue;
      visible++;
      if(marks.length>=budget) continue;
      const key=Math.floor(y/grid)*columns+Math.floor(x/grid);
      if(slots[key]) continue;
      slots[key]=1;
      const r=data.magnitude[row]<10?1.65:1.15;
      ctx.fillRect(x-r,y-r,2*r,2*r);
      marks.push({row,x,y});
    }
  }

  const originInView=sx>=0 && sx<width && sy>=0 && sy<height;
  if(originInView) {
    const halo=ctx.createRadialGradient(sx,sy,2,sx,sy,34);
    halo.addColorStop(0,'#ffdda877');halo.addColorStop(1,'#ffdda800');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(sx,sy,34,0,2*Math.PI);ctx.fill();
    ctx.strokeStyle='#ffc286';ctx.fillStyle='#ffe2a5';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(sx,sy,10,0,2*Math.PI);ctx.stroke();
    ctx.beginPath();ctx.arc(sx,sy,3.7,0,2*Math.PI);ctx.fill();
    ctx.fillText(labels.sun,Math.min(width-46,Math.max(12,sx+14)),Math.max(15,Math.min(height-8,sy-10)));
  }
  if(detail) {
    const {point:[dx,dy]}=projectNeighborhood(detail.xyz,plane);
    const x=sx+dx*scale,y=sy+dy*scale;
    const near=detail.lo/detail.median,far=detail.hi/detail.median;
    ctx.strokeStyle='#f0d9a1';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(sx+dx*scale*near,sy+dy*scale*near);
    ctx.lineTo(sx+dx*scale*far,sy+dy*scale*far);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,6,0,2*Math.PI);ctx.stroke();
  }
  const bar=Math.min(width*.32,pixelsPerRing);
  const length=bar/scale*unitFactor;
  const displayed=Math.floor(length*100000+1e-7)/100000;
  const scaleX=14,scaleY=height-16;
  ctx.fillStyle='#c8dadc';ctx.strokeStyle='#c8dadc';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(scaleX,scaleY);ctx.lineTo(scaleX+displayed*scale/unitFactor,scaleY);ctx.stroke();
  ctx.fillText(labels.number(displayed)+' '+labels.unit,scaleX,scaleY-5);
  return {marks,visible,origin,scale,ringStep};
}

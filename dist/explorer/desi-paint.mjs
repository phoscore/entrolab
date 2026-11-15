import {DESI_SIDE,desiFilter} from './foundation/desi-format.mjs';

const SIDE = DESI_SIDE;
const raster = write=>{
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIDE;
  const ctx = canvas.getContext('2d'), image = ctx.createImageData(SIDE,SIDE);
  for (let y=0;y<SIDE;y++) for (let x=0;x<SIDE;x++) {
    const i = y*SIDE+x, offset = ((SIDE-1-y)*SIDE+x)*4;
    image.data.set(write(i,x,y),offset);
  }
  ctx.putImageData(image,0,0);
  return canvas;
};

export function coverageRaster(coverage) {
  return raster((i,x,y)=>{
    const samples = coverage[i];
    if (!samples) return [0,0,0,0];
    const edge = samples < 4 || x === 0 || x === SIDE-1 || y === 0 || y === SIDE-1 ||
      !coverage[i-1] || !coverage[i+1] || !coverage[i-SIDE] || !coverage[i+SIDE];
    return edge ? [208,158,111,38+13*samples] : [142,101,69,45];
  });
}

export function densityRaster({low,high},filter) {
  const counts = Uint16Array.from(low,(n,i)=>(filter==='high'?0:n)+(filter==='low'?0:high[i]));
  const max = Math.log1p(counts.reduce((largest,n)=>Math.max(largest,n),0)) || 1;
  return raster(i=>{
    if (!counts[i]) return [0,0,0,0];
    const k = Math.log1p(counts[i])/max;
    return [206+Math.round(49*k),107+Math.round(115*k),88+Math.round(65*k),Math.round(52+179*k)];
  });
}

export function viewDesiCounts({low,high,coverage},[left,bottom,right,top],filter) {
  let total=0,selected=0,covered=0;
  for (let y=Math.floor(bottom*SIDE);y<Math.ceil(top*SIDE);y++)
    for (let x=Math.floor(left*SIDE);x<Math.ceil(right*SIDE);x++) {
      const i=y*SIDE+x;
      total+=low[i]+high[i];
      selected+=(filter==='high'?0:low[i])+(filter==='low'?0:high[i]);
      covered+=coverage[i];
    }
  return {total,selected,covered};
}

function diamond(ctx,x,y,r) {
  ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();
}

export function paintDesiPoints(ctx,tiles,frame,filter) {
  const {left,top,right,bottom,width,height} = frame;
  const grid = 6, pitch = Math.ceil(width/grid);
  const slots = new Uint8Array(pitch*Math.ceil(height/grid));
  const markers = [];
  let total = 0, selected = 0;
  ctx.strokeStyle = '#ffd39e';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (const {bounds:[u,v,span],xy,rows,ids,flags} of tiles) {
    for (let i=0;i<rows.length;i++) {
      const x = left+(u+span*xy[2*i])*(right-left);
      const y = bottom-(v+span*xy[2*i+1])*(bottom-top);
      if (x<0 || x>=width || y<0 || y>=height) continue;
      total++;
      if (!desiFilter(flags[i],filter)) continue;
      selected++;
      const key = Math.floor(y/grid)*pitch+Math.floor(x/grid);
      if (slots[key]) continue;
      slots[key] = 1;
      markers.push({id:ids[i],row:rows[i],band:flags[i],x,y});
      diamond(ctx,x,y,2.5);
    }
  }
  ctx.stroke();
  return {markers,total,selected};
}

export function paintDesiSelection(ctx,detail,frame,project) {
  const [ra,dec] = project(detail.ra,detail.dec);
  const {left,top,right,bottom,width,height} = frame;
  const x = left+ra/360*(right-left), y = top+dec/180*(bottom-top);
  if (x<0 || x>=width || y<0 || y>=height) return null;
  ctx.strokeStyle = '#fff3cf';ctx.lineWidth = 1.5;
  ctx.beginPath();diamond(ctx,x,y,10);ctx.stroke();
  return {x,y,radius:10,selected:true,priority:12,label:detail.name};
}

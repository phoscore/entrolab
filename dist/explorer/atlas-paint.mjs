import {DENSITY_SIDE,MASKS,acceptsMask,maskOf} from './foundation/atlas-format.mjs';

const COLORS = ['#e7f4f2','#88dedf','#62b7cf','#537b9f'];
const SIDE = DENSITY_SIDE, STRIDE = SIDE+1;
const rectValue = (values,l,b,r,t) => values[t*STRIDE+r]-values[t*STRIDE+l]-values[b*STRIDE+r]+values[b*STRIDE+l];

// Counts are conserved at every zoom. Raster interpolation softens the display
// only; statistics remain counts of whole intersecting equal-area cells.
export function densityIndex(counts, filter) {
  const values = new Uint32Array(SIDE**2);
  const all = new Uint32Array(STRIDE**2), chosen = new Uint32Array(STRIDE**2), occupied = new Uint32Array(STRIDE**2);
  let max = 0;
  for (let y=0;y<SIDE;y++) for (let x=0;x<SIDE;x++) {
    const src=3*(y*SIDE+x), dst=(y+1)*STRIDE+x+1;
    let sum=0, selected=0;
    for (let k=0;k<MASKS.length;k++) {
      const count=counts[src+k];
      sum+=count;
      if (acceptsMask(filter,MASKS[k])) selected+=count;
    }
    values[y*SIDE+x]=selected;
    max=Math.max(max,selected);
    for (const [index,value] of [[all,sum],[chosen,selected],[occupied,Number(selected>0)]]) {
      index[dst]=value+index[dst-1]+index[dst-STRIDE]-index[dst-STRIDE-1];
    }
  }
  return {values,max,all,chosen,occupied};
}

export function densityCounts(index, [left,bottom,right,top]) {
  if (left>=right || bottom>=top) return {catalog:0,visible:0,cells:0};
  const l=Math.floor(left*SIDE), b=Math.floor(bottom*SIDE), r=Math.ceil(right*SIDE), t=Math.ceil(top*SIDE);
  return {
    catalog:rectValue(index.all,l,b,r,t),
    visible:rectValue(index.chosen,l,b,r,t),
    cells:rectValue(index.occupied,l,b,r,t),
  };
}

export function densityBitmap(index) {
  const canvas=document.createElement('canvas');
  // The source grid and every count stay untouched. A larger display raster
  // interpolates neighbouring cell intensities so the overview reads as a
  // continuous selection map instead of 128 square source symbols.
  const resolution=SIDE*3;
  canvas.width=canvas.height=resolution;
  const ctx=canvas.getContext('2d');
  if (!ctx) return null;
  const image=ctx.createImageData(resolution,resolution), pixels=image.data;
  const denom = Math.log1p(index.max)||1;
  const raw=Float32Array.from(index.values,v=>Math.log1p(v)/denom);
  const horizontal=new Float32Array(raw.length),levels=new Float32Array(raw.length);
  const weights=[1,4,6,4,1];
  for(let y=0;y<SIDE;y++)for(let x=0;x<SIDE;x++) {
    let sum=0;
    for(let k=-2;k<=2;k++)sum+=raw[y*SIDE+Math.max(0,Math.min(SIDE-1,x+k))]*weights[k+2];
    horizontal[y*SIDE+x]=sum/16;
  }
  for(let y=0;y<SIDE;y++)for(let x=0;x<SIDE;x++) {
    let sum=0;
    for(let k=-2;k<=2;k++)sum+=horizontal[Math.max(0,Math.min(SIDE-1,y+k))*SIDE+x]*weights[k+2];
    levels[y*SIDE+x]=sum/16;
  }
  for (let y=0;y<resolution;y++) for (let x=0;x<resolution;x++) {
    // An empty catalogue cell stays empty at every display resolution. This
    // also keeps the visible density and the exact-cell zoom hit consistent.
    if(!index.values[(SIDE-1-Math.floor(y/3))*SIDE+Math.floor(x/3)])continue;
    const sx=Math.max(0,Math.min(SIDE-1,(x+.5)/3-.5));
    const sy=Math.max(0,Math.min(SIDE-1,(resolution-y-.5)/3-.5));
    const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(SIDE-1,x0+1),y1=Math.min(SIDE-1,y0+1);
    const fx=sx-x0,fy=sy-y0;
    const a=levels[y0*SIDE+x0]*(1-fx)+levels[y0*SIDE+x1]*fx;
    const b=levels[y1*SIDE+x0]*(1-fx)+levels[y1*SIDE+x1]*fx;
    const level=a*(1-fy)+b*fy;
    if(level<.025)continue;
    const offset=4*(y*resolution+x);
    const highlight=Math.max(0,(level-.62)/.38);
    pixels[offset]=Math.round(47+level*73+highlight*43);
    pixels[offset+1]=Math.round(99+level*95+highlight*26);
    pixels[offset+2]=Math.round(122+level*91+highlight*18);
    pixels[offset+3]=Math.round(6+121*level);
  }
  ctx.putImageData(image,0,0);
  return canvas;
}

export function paintPoints(ctx,tiles,frame,filter,curated) {
  const {left,top,right,bottom,width,height}=frame;
  const dx=right-left,dy=bottom-top;
  const grid = 5, pitch = Math.ceil(width/grid);
  const slots = new Uint8Array(pitch*Math.ceil(height/grid));
  const candidates = [[],[],[],[]];
  let catalog=0, visible=0;
  for (const {bounds:[u,v,span],rows,ids,xy,flags} of tiles) {
    for (let i=0;i<rows.length;i++) {
      const x=left+(u+span*xy[2*i])*dx, y=bottom-(v+span*xy[2*i+1])*dy;
      if (x<0 || x>=width || y<0 || y>=height) continue;
      catalog++;
      if (!acceptsMask(filter,maskOf(flags[i]))) continue;
      visible++;
      if (!curated.has(ids[i])) candidates[flags[i]>>>8].push({id:ids[i],row:rows[i],flag:flags[i],x,y});
    }
  }
  const markers=[];
  for (const [band,points] of candidates.entries()) {
    ctx.strokeStyle=COLORS[band];ctx.lineWidth=band===0?1.25:1;
    const radius=band===0?2.3:band===1?1.85:1.45;
    ctx.beginPath();
    for (const point of points) {
      const slot=Math.floor(point.y/grid)*pitch+Math.floor(point.x/grid);
      if (slots[slot]) continue;
      slots[slot]=1;
      markers.push(point);
      ctx.moveTo(point.x+radius,point.y);
      ctx.arc(point.x,point.y,radius,0,Math.PI*2);
    }
    ctx.stroke();
  }
  return {catalog,visible,markers};
}

export function paintSelected(ctx, selection, frame, project) {
  if (!selection?.detail) return null;
  const {left,top,right,bottom,width,height}=frame;
  const [ra,y0] = project(selection.detail.ra,selection.detail.dec);
  const x=left+(ra/360)*(right-left), y=top+(y0/180)*(bottom-top);
  if (x<0||x>=width||y<0||y>=height) return null;
  ctx.strokeStyle='#c7fff0';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();
  return {x,y,radius:10,selected:true,priority:12,label:'Gaia DR3 '+selection.ref.id};
}


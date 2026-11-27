import {niceStep} from './camera.mjs';
import {spaceBasis} from './solar-space.mjs';
import {placeLabels,drawLabels} from './labels.mjs';
import {PC_TO_LY} from './foundation/neighborhood-format.mjs';
import {neighborhoodGroups,neighborhoodProjector} from './neighborhood-space.mjs';

const inView=(p,width,height)=>p!==null && p.x>=0 && p.x<width && p.y>=0 && p.y<height;

function glow(ctx,x,y,r,color) {
  const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
  gradient.addColorStop(0,color+'88');
  gradient.addColorStop(.35,color+'32');
  gradient.addColorStop(1,color+'00');
  ctx.fillStyle=gradient;
  ctx.fillRect(x-r,y-r,2*r,2*r);
}

export function paintNeighborhood(ctx,{width,height,camera,free=null,unit,data,selected,names,connection,labels}) {
  ctx.clearRect(0,0,width,height);
  const {project,distance,segment}=neighborhoodProjector(camera,width,height,free);
  const {marks,visible,overlap,limited}=neighborhoodGroups(project,width,height,data,selected,names);
  const sun=project([0,0,0]);
  const chosen=selected>=0&&data ? project(data.xyz.subarray(3*selected,3*selected+3)) : null;
  ctx.font='11px "DM Sans",sans-serif';

  const line=connection&&selected>=0&&data ? segment([0,0,0],data.xyz.subarray(3*selected,3*selected+3)) : null;
  if (line) {
    ctx.strokeStyle='#f3c98689';ctx.setLineDash([4,5]);
    ctx.beginPath();ctx.moveTo(line[0].x,line[0].y);ctx.lineTo(line[1].x,line[1].y);ctx.stroke();ctx.setLineDash([]);
    const x=(line[0].x+line[1].x)/2,y=(line[0].y+line[1].y)/2;
    if (sun && chosen && Math.hypot(sun.x-chosen.x,sun.y-chosen.y)>84 && x>50 && x<width-80 && y>60 && y<height-40) {
      ctx.fillStyle='#f5dba5';ctx.fillText(labels.connection,x+6,y-6);
    }
  }

  const placements=[];
  // Paint from far to near, with restrained depth and G-magnitude cues for the markers.
  for (const mark of marks) {
    const {row,x,y,depth}=mark;
    const luminosity=Math.max(0,Math.min(1,(14-data.magnitude[row])/9));
    const depthCue=Math.max(.55,Math.min(1.25,distance/depth));
    const name=names.get(row);
    const selectedMark=row===selected;
    const r=selectedMark?2.7:name?2.45:(.65+1.25*luminosity)*depthCue;
    if (name||selectedMark) glow(ctx,x,y,selectedMark?19:12,selectedMark?'#eec487':'#8dbce7');
    ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fillStyle=name||selectedMark?'#eff7ff':'#b9d6ed';
    ctx.globalAlpha=name||selectedMark?1:Math.min(.94,(.38+.55*luminosity)*depthCue);
    ctx.fill();ctx.globalAlpha=1;
    if (selectedMark) {
      ctx.strokeStyle='#ffda9d';ctx.beginPath();ctx.arc(x,y,8,0,2*Math.PI);ctx.stroke();
    }
    if (name||selectedMark) placements.push({x,y,radius:selectedMark?8:r+2,
      label:name??labels.selected,priority:selectedMark?2:1,selected:selectedMark});
  }
  if (inView(sun,width,height)) {
    glow(ctx,sun.x,sun.y,28,'#efb467');
    ctx.strokeStyle='#f5c789';ctx.fillStyle='#ffe9b2';
    ctx.beginPath();ctx.arc(sun.x,sun.y,7,0,2*Math.PI);ctx.stroke();
    ctx.beginPath();ctx.arc(sun.x,sun.y,3.2,0,2*Math.PI);ctx.fill();
    placements.push({x:sun.x,y:sun.y,radius:7,label:labels.sun,priority:3});
  }
  drawLabels(ctx,placeLabels(placements,s=>ctx.measureText(s).width,width,height,{top:49,bottom:height-37,limit:width<500?4:8}));

  // Small orientation glyph uses the same camera basis, centred on the camera pivot.
  const axisSize=distance*24/(height*.9);
  const centre=[40,37];
  const [right,up]=spaceBasis(free??camera);
  for (const [axis,color] of ['#efb486','#a7d0c2','#aebfeb'].entries()) {
    const point=free?null:project(camera.focus.map((v,i)=>v+(axis===i?axisSize:0)));
    const x=centre[0]+(free?24*right[axis]:point.x-width/2);
    const y=centre[1]+(free?-24*up[axis]:point.y-height/2);
    ctx.strokeStyle=ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(...centre);ctx.lineTo(x,y);ctx.stroke();
    if (Math.hypot(x-centre[0],y-centre[1])>7) ctx.fillText('XYZ'[axis],x+3,y+3);
  }

  if(!free){
    const factor=unit==='ly'?PC_TO_LY:1;
    const pixelsPerUnit=height*.9/distance/factor;
    const step=niceStep(Math.min(38,width*.07)/pixelsPerUnit);
    ctx.strokeStyle=ctx.fillStyle='#bfd4e5';
    ctx.beginPath();ctx.moveTo(16,height-15);ctx.lineTo(16+step*pixelsPerUnit,height-15);ctx.stroke();
    ctx.fillText(labels.number(step)+' '+labels.unit+' · '+labels.scale,16,height-22);
  }
  return {marks,visible,overlap,limited,origin:sun?[sun.x,sun.y]:null,inView:inView(sun,width,height)};
}

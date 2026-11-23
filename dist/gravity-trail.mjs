export const TRAIL_CAPACITY=1024;
const MAX_DAYS=8;
const MAX_ARC_AU=.06;
const MAX_ARC_PIXELS=12;
const MAX_TURN=.065;

function turn(ax,ay,bx,by){
  return Math.atan2(Math.abs(ax*by-ay*bx),ax*bx+ay*by);
}

// Only reads completed states. The pending endpoint is drawn too, so the
// line can meet the current position without storing an extra point each frame.
export class GravityTrail {
  #ring=[];
  #next=0;
  #last=null;
  #dx=0;
  #dy=0;
  #distance=0;
  #turn=0;

  #keep(point,breakBefore=false){
    const {x,y,day}=point;
    const entry=this.#ring[this.#next];
    if(entry){entry.x=x;entry.y=y;entry.day=day;entry.breakBefore=breakBefore;}
    else this.#ring.push({x,y,day,breakBefore});
    this.#next=(this.#next+1)%TRAIL_CAPACITY;
    this.#distance=this.#turn=0;
  }

  observe(body,day,scale){
    const {x,y,vx,vy}=body;
    const last=this.#last;
    if(!last){
      this.#last={x,y,day,vx,vy};
      this.#keep(this.#last,true);
      return;
    }
    const dx=x-last.x,dy=y-last.y;
    const distance=Math.hypot(dx,dy);
    const maxDistance=Math.min(MAX_ARC_AU,MAX_ARC_PIXELS/scale);
    const newest=this.#ring[(this.#next+TRAIL_CAPACITY-1)%TRAIL_CAPACITY];
    const maxStepTurn=2*MAX_TURN;
    const uncertain=day<=last.day||day-last.day>MAX_DAYS||distance>maxDistance||
      turn(last.vx,last.vy,vx,vy)>maxStepTurn;
    if(uncertain){
      if(last.day!==newest.day)this.#keep(last);
      Object.assign(last,{x,y,day,vx,vy});
      this.#keep(last,true);
      this.#dx=this.#dy=0;
      return;
    }
    // A corner belongs at the actual intermediate state, even if it was
    // still pending. Zero-length steps leave the travel direction alone.
    const angle=distance>0?turn(this.#dx,this.#dy,dx,dy):0;
    if(last.day!==newest.day&&(
      day-newest.day>MAX_DAYS||this.#distance+distance>maxDistance||this.#turn+angle>MAX_TURN
    ))this.#keep(last);
    else this.#turn+=angle;
    this.#distance+=distance;
    if(distance>0){this.#dx=dx;this.#dy=dy;}
    Object.assign(last,{x,y,day,vx,vy});
  }

  forEach(visit){
    const ring=this.#ring, size=ring.length;
    if(!size)return;
    const start=size===TRAIL_CAPACITY?this.#next:0;
    for(let i=0;i<size;i++){
      const point=ring[(start+i)%size];
      visit(point,i===0||point.breakBefore);
    }
    if(this.#last.day!==ring[(start+size-1)%size].day)visit(this.#last,false);
  }

  snapshot(){
    const result=[];
    this.forEach(({x,y,day},breakBefore)=>result.push({x,y,day,breakBefore}));
    return result;
  }
}

export function traceGravityTrail(ctx,trail,toScreen){
  if(!trail)return;
  ctx.beginPath();
  let previous;
  trail.forEach((position,breakBefore)=>{
    const p=toScreen(position);
    // A later zoom can exceed the resolution of already recorded points.
    if(breakBefore||!previous||(p.x-previous.x)**2+(p.y-previous.y)**2>24**2)ctx.moveTo(p.x,p.y);
    else ctx.lineTo(p.x,p.y);
    previous=p;
  });
  ctx.stroke();
}

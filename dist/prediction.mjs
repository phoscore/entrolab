import {step,safeStep,radius} from './physics.mjs';
export const LIMITS=Object.freeze({bodies:12,steps:1500,points:301,horizon:365});
const valid=bs=>bs.every(b=>Number.isFinite(b.m)&&b.m>0&&[b.x,b.y,b.vx,b.vy].every(Number.isFinite));
// A generator owns plain cloned bodies; no body() calls, global identity allocation or live references.
export function* predict(source,selectedId,horizon,options={}){
 const maxSteps=Math.min(LIMITS.steps,options.maxSteps??LIMITS.steps),chunk=Math.min(50,Math.max(1,options.chunk??50));
 const result={points:[],days:0,steps:0,reason:'complete',horizon};
 if(!Number.isFinite(horizon)||horizon<=0||horizon>LIMITS.horizon||!Number.isInteger(maxSteps)||maxSteps<0){result.reason='invalid-budget';return result}
 if(source.length>LIMITS.bodies){result.reason='body-limit';return result}
 if(!valid(source)||!source.some(b=>b.id===selectedId)){result.reason='invalid-state';return result}
 const bs=source.map(b=>({id:b.id,name:b.name,type:b.type,m:b.m,x:b.x,y:b.y,vx:b.vx,vy:b.vy,color:b.color,trail:[]}));
 const collision=()=>{throw new Error('prediction-contact')};
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++)if(Math.hypot(bs[i].x-bs[j].x,bs[i].y-bs[j].y)<=radius(bs[i])+radius(bs[j])){result.reason='collision';return result}
 const sample=()=>{const b=bs.find(x=>x.id===selectedId);const point={x:b.x,y:b.y,t:result.days};if(result.points.length<LIMITS.points)result.points.push(point);else result.points[result.points.length-1]=point};sample();let nextSample=horizon/300;
 while(result.days<horizon){if(result.steps>=maxSteps){result.reason='step-limit';return result}
 const dt=Math.min(safeStep(bs),horizon-result.days);if(!Number.isFinite(dt)||dt<=0||result.days+dt===result.days){result.reason='numerical-limit';return result}
 try{step(bs,dt,collision)}catch(e){if(e.message!=='prediction-contact')throw e;result.reason='collision';return result}
 result.steps++;
 if(!valid(bs)){result.reason='numerical-limit';return result}
 result.days+=dt;
 if(result.days>=nextSample||result.days>=horizon){sample();while(nextSample<=result.days)nextSample+=horizon/300}
 if(result.steps%chunk===0)yield {steps:result.steps,days:result.days};
 }
 return result;
}
export function predictSync(...args){const job=predict(...args);let r;do{r=job.next()}while(!r.done);return r.value}

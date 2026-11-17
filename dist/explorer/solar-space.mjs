import {MIN_DAY,MAX_DAY,orbitAt,eccentricAnomaly,vectorOnOrbit} from './solar-model.mjs';

export const ORBIT_POSES=Object.freeze({
  top:Object.freeze({yaw:-Math.PI/2,pitch:Math.PI/2-.001}),
  angle:Object.freeze({yaw:-.85,pitch:.55}),
  side:Object.freeze({yaw:-Math.PI/2,pitch:0}),
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function spaceCamera(pose='angle'){
  if(!Object.hasOwn(ORBIT_POSES,pose))throw new RangeError('Unknown orbit view');
  return {...ORBIT_POSES[pose],zoom:0,focus:[0,0,0]};
}
export function rotateSpace(camera,dx,dy){
  return {...camera,yaw:camera.yaw+dx*.007,
    pitch:clamp(camera.pitch+dy*.007,-Math.PI/2+.005,Math.PI/2-.005)};
}
export function zoomSpace(camera,delta){
  return {...camera,zoom:clamp(camera.zoom+delta,0,5)};
}
export function projectSpace(vector,camera,width,height){
  const {yaw,pitch,focus,zoom}=camera;
  const c=Math.cos(yaw),s=Math.sin(yaw),u=Math.cos(pitch),v=Math.sin(pitch);
  const right=[-s,c,0],up=[-v*c,-v*s,u],toward=[u*c,u*s,v];
  const d=vector.map((x,i)=>x-focus[i]);
  const distance=85/10**zoom;
  const depth=distance-d.reduce((sum,x,i)=>sum+x*toward[i],0);
  if(depth<=Math.max(.00001,distance*.025))return null;
  const focal=height*.9;
  return {x:width/2+d.reduce((sum,x,i)=>sum+x*right[i],0)*focal/depth,
    y:height/2-d.reduce((sum,x,i)=>sum+x*up[i],0)*focal/depth,
    depth,pixelsPerAU:focal/depth};
}
export function trailSamples(day,body){
  if(!Number.isFinite(day)||day<MIN_DAY||day>MAX_DAY||!body?.base)throw new RangeError('Trail epoch/body outside JPL fit');
  const orbit=orbitAt(body,day);
  const period=365.256*Math.sqrt(orbit.a**3);
  const start=Math.max(MIN_DAY,day-period*.18);
  const length=day-start;
  // At most ~1.5 degrees of mean orbital motion between samples, tightened for eccentricity.
  const segments=length===0?0:clamp(Math.ceil(360*length/period/1.5*(1+orbit.e)),24,96);
  const samples=[];
  for(let i=0;i<=segments;i++){
    const epoch=segments?start+length*i/segments:day;
    const fitted=orbitAt(body,epoch);
    samples.push({day:epoch,vector:vectorOnOrbit(fitted,eccentricAnomaly(fitted.mean,fitted.e)),
      age:segments?i/segments:1});
  }
  return {start,day,period,segments,samples};
}

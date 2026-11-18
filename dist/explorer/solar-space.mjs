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
export function spaceBasis({yaw,pitch}){
  const c=Math.cos(yaw),s=Math.sin(yaw),u=Math.cos(pitch),v=Math.sin(pitch);
  return [[-s,c,0],[-v*c,-v*s,u],[u*c,u*s,v]];
}
export function spaceProjector(camera,width,height,baseDistance=85){
  const {focus,zoom}=camera;
  const [right,up,toward]=spaceBasis(camera);
  const distance=baseDistance/10**zoom,focal=height*.9,near=distance*.025;
  function offset(vector){
    return [vector[0]-focus[0],vector[1]-focus[1],vector[2]-focus[2]];
  }
  const depthAt=([dx,dy,dz])=>distance-(dx*toward[0]+dy*toward[1]+dz*toward[2]);
  function project([dx,dy,dz],depth){
    return {x:width/2+(dx*right[0]+dy*right[1]+dz*right[2])*focal/depth,
      y:height/2-(dx*up[0]+dy*up[1]+dz*up[2])*focal/depth,
      depth,pixelsPerAU:focal/depth};
  }
  const screen=vector=>{
    const relative=offset(vector),depth=depthAt(relative);
    return depth<=near?null:project(relative,depth);
  };
  screen.segment=(from,to)=>{
    const a=offset(from),b=offset(to),depthA=depthAt(a),depthB=depthAt(b);
    if(depthA<=near&&depthB<=near)return null;
    if(depthA>near&&depthB>near)return [project(a,depthA),project(b,depthB)];
    const fraction=(near-depthA)/(depthB-depthA);
    const edge=project(a.map((value,i)=>value+(b[i]-value)*fraction),near);
    return depthA<=near?[edge,project(b,depthB)]:[project(a,depthA),edge];
  };
  return screen;
}
export const projectSpace=(vector,camera,width,height)=>spaceProjector(camera,width,height)(vector);
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

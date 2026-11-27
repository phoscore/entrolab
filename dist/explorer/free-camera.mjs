import {spaceBasis} from './solar-space.mjs';

const solarLimits=Object.freeze({position:1_000_000,nearMin:1e-10,nearMax:.001,speedMin:1e-11,speedMax:1e4});
const clamped=(value,min,max)=>Math.max(min,Math.min(max,value));
const offset=(position,direction,scale)=>position.map((v,i)=>v+direction[i]*scale);

export function orbitToFree(orbit,distance){
  const depth=distance/10**orbit.zoom;
  const position=offset(orbit.focus,spaceBasis(orbit)[2],depth);
  return {position,yaw:orbit.yaw,pitch:orbit.pitch,depth};
}

export function freeToOrbit(camera,distance,maxZoom=5){
  const zoom=clamped(Math.log10(distance/camera.depth),0,maxZoom);
  const depth=distance/10**zoom;
  const {yaw,pitch}=camera;
  return {yaw,pitch,zoom,focus:offset(camera.position,spaceBasis(camera)[2],-depth)};
}

export function aimFree(camera,dx,dy){
  if(!Number.isFinite(dx)||!Number.isFinite(dy))return camera;
  const yaw=(camera.yaw+dx*.007)%(2*Math.PI);
  const pitch=clamped(camera.pitch+dy*.007,-Math.PI/2+.001,Math.PI/2-.001);
  return {...camera,yaw,pitch};
}

export const freeNear=(camera,limits=solarLimits)=>clamped(camera.depth*.025,limits.nearMin,limits.nearMax);
export const freeSpeed=(camera,level,limits=solarLimits)=>clamped(camera.depth*.16*10**(level/2),limits.speedMin,limits.speedMax);

export function moveFree(camera,[right,up,forward],speed,seconds,limits=solarLimits){
  if(![right,up,forward,speed,seconds].every(Number.isFinite)||speed<0||seconds<=0)return camera;
  const length=Math.hypot(right,up,forward);
  if(!length)return camera;
  const [r,u,t]=spaceBasis(camera);
  const step=speed*seconds/Math.max(1,length);
  return {...camera,position:camera.position.map((v,i)=>clamped(v+step*(r[i]*right+u[i]*up-t[i]*forward),-limits.position,limits.position))};
}

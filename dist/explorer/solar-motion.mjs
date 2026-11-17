import {AU_KM,MIN_DAY,MAX_DAY,solarState} from './solar-model.mjs';

export const LIGHT_KM_S=299792.458;
export const VELOCITY_STEP_DAYS=.01;
const DAY_SECONDS=86400;

// Differentiate the existing fitted positions, without changing the JPL
// approximation or extrapolating it beyond its 1800–2050 TDB interval.
export function solarVelocities(day) {
  const middle=solarState(day),h=VELOCITY_STEP_DAYS;
  const scheme=day-MIN_DAY<h?'forward':MAX_DAY-day<h?'backward':'centered';
  const low=scheme==='backward'?solarState(day-h):scheme==='centered'?solarState(day-h):null;
  const high=scheme==='forward'?solarState(day+h):scheme==='centered'?solarState(day+h):null;
  const outer=scheme==='forward'?solarState(day+2*h):scheme==='backward'?solarState(day-2*h):null;
  return {scheme,stepDays:h,states:middle.map((entry,i)=>({
    ...entry,
    velocityAUPerDay:entry.body.id==='sun'?[0,0,0]:entry.vector.map((v,k)=>{
      if(scheme==='centered')return (high[i].vector[k]-low[i].vector[k])/(2*h);
      if(scheme==='forward')return (-3*v+4*high[i].vector[k]-outer[i].vector[k])/(2*h);
      return (3*v-4*low[i].vector[k]+outer[i].vector[k])/(2*h);
    }),
  }))};
}

export function solarComparison(day,targetId,referenceId) {
  const {states,scheme,stepDays}=solarVelocities(day);
  const target=states.find(s=>s.body.id===targetId);
  const reference=states.find(s=>s.body.id===referenceId);
  if(!target||!reference)throw new RangeError('Unknown solar comparison body');
  const separationAU=target.vector.map((v,i)=>v-reference.vector[i]);
  const distanceAU=Math.hypot(...separationAU);
  const velocityKmS=target.velocityAUPerDay.map((v,i)=>(v-reference.velocityAUPerDay[i])*AU_KM/DAY_SECONDS);
  const speedKmS=Math.hypot(...velocityKmS);
  const radialKmS=distanceAU>0?separationAU.reduce((sum,v,i)=>sum+v*velocityKmS[i],0)/distanceAU:null;
  const distanceKm=distanceAU*AU_KM;
  return {day,targetId,referenceId,scheme,stepDays,separationAU,distanceAU,distanceKm,
    projectedAU:Math.hypot(separationAU[0],separationAU[1]),
    velocityKmS,speedKmS,radialKmS,lightSeconds:distanceKm/LIGHT_KM_S};
}

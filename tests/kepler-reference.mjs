// Reference adapted from the independent review; original diagnostic remains unchanged.
// Unsoftened Newtonian relative orbit, not a second numerical Verlet solution.
import {G,C,body,step,safeStep,energy,radius} from '../dist/physics.mjs';
const m=3e-6;
export function makePair(e) {
  const v=Math.sqrt(G*(1+m)*(1-e));
  return [body('Star','star',1,-m/(1+m),0,0,-m*v/(1+m),'white'),
          body('Planet','planet',m,1/(1+m),0,0,v/(1+m),'blue')];
}
export function kepler(e,t) {
  const a=1/(1+e),mu=G*(1+m),n=Math.sqrt(mu/a**3);
  const M=(Math.PI+n*t)%(2*Math.PI);let E=M;
  for(let j=0;j<35;j++){
    const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
    E-=d;if(Math.abs(d)<1e-14)break;
    if(j===34)throw Error('Kepler solver did not converge');
  }
  return [a*(e-Math.cos(E)),-a*Math.sqrt(1-e*e)*Math.sin(E)];
}
export function evaluate(e,days,mode,h=.1) {
  const bodies=makePair(e),e0=energy(bodies);let t=0,steps=0,maxPositionErrorAU=0,maxEnergyDrift=0,finalPositionErrorAU=0,maxPhaseErrorRad=0;
  while(t<days-1e-11) {
    const dt=Math.min(days-t,mode==='fixed'?h:safeStep(bodies));
    if(step(bodies,dt))throw Error('Unexpected collision');
    t+=dt;steps++;
    const [x,y]=kepler(e,t);
    finalPositionErrorAU=Math.hypot(bodies[1].x-bodies[0].x-x,bodies[1].y-bodies[0].y-y);
    const angle=Math.atan2(bodies[1].y-bodies[0].y,bodies[1].x-bodies[0].x)-Math.atan2(y,x);
    maxPhaseErrorRad=Math.max(maxPhaseErrorRad,Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle))));
    maxPositionErrorAU=Math.max(maxPositionErrorAU,finalPositionErrorAU);
    maxEnergyDrift=Math.max(maxEnergyDrift,Math.abs((energy(bodies)-e0)/e0));
  }
  return {eccentricity:e,days,mode,steps,maxPhaseErrorRad,finalPositionErrorAU,maxPositionErrorAU,maxEnergyDrift,finalPositionErrorKM:finalPositionErrorAU*C.AU/1000};
}

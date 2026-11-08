// Independent two-body Kepler reference and collision-step probe for ENTROLAB v0.2.
// Run: node tests/independent_kepler_review.mjs
// This is diagnostic evidence, NOT a passing regression test or a CI requirement.
import {G,C,body,step,safeStep,energy,radius} from '../dist/physics.mjs';
const m=3e-6;
function makePair(e) {
  const v=Math.sqrt(G*(1+m)*(1-e));
  return [body('Star','star',1,-m/(1+m),0,0,-m*v/(1+m),'white'),
          body('Planet','planet',m,1/(1+m),0,0,v/(1+m),'blue')];
}
function kepler(e,t) {
  const a=1/(1+e),mu=G*(1+m),n=Math.sqrt(mu/a**3);
  const M=(Math.PI+n*t)%(2*Math.PI);let E=M;
  for(let j=0;j<35;j++){
    const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
    E-=d;if(Math.abs(d)<1e-14)break;
  }
  return [a*(e-Math.cos(E)),-a*Math.sqrt(1-e*e)*Math.sin(E)];
}
function evaluate(e,days,mode,h=.1) {
  const bodies=makePair(e),e0=energy(bodies);let t=0,steps=0,maxPositionErrorAU=0,maxEnergyDrift=0,finalPositionErrorAU=0;
  while(t<days-1e-11) {
    const dt=Math.min(days-t,mode==='fixed'?h:safeStep(bodies));
    if(step(bodies,dt))throw Error('Unexpected collision');
    t+=dt;steps++;
    const [x,y]=kepler(e,t);
    finalPositionErrorAU=Math.hypot(bodies[1].x-bodies[0].x-x,bodies[1].y-bodies[0].y-y);
    maxPositionErrorAU=Math.max(maxPositionErrorAU,finalPositionErrorAU);
    maxEnergyDrift=Math.max(maxEnergyDrift,Math.abs((energy(bodies)-e0)/e0));
  }
  return {eccentricity:e,days,mode,steps,finalPositionErrorAU,maxPositionErrorAU,maxEnergyDrift,finalPositionErrorKM:finalPositionErrorAU*C.AU/1000};
}
const results=[];
for(const e of [0,.5,.8])for(const mode of ['adaptive','fixed'])
  results.push(evaluate(e,e===0?3652.5:365.25,mode));
const pair=[
  body('A','planet',3e-6,-1e-4,0,.02,0,'red'),
  body('B','planet',3e-6,1e-4,0,-.02,0,'blue')
];
const collisionDistanceAU=radius(pair[0])+radius(pair[1]);
const reportedCollisionsFixed=step(pair,.02);
const adaptivePair=[
  body('A','planet',3e-6,-1e-4,0,.02,0,'red'),
  body('B','planet',3e-6,1e-4,0,-.02,0,'blue')
];
let elapsed=0,adaptiveSteps=0,reportedCollisionsAdaptive=0;
while(elapsed<.02&&adaptivePair.length>1&&adaptiveSteps<1000) {
  const dt=Math.min(safeStep(adaptivePair),.02-elapsed);
  reportedCollisionsAdaptive+=step(adaptivePair,dt);
  elapsed+=dt;adaptiveSteps++;
}
results.push({scenario:'fast head-on crossing',collisionDistanceAU,oneStepDays:.02,
  reportedCollisionsFixed,reportedCollisionsAdaptive,adaptiveSteps});
console.log(JSON.stringify(results,null,2));

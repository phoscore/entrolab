// Read-only audit witnesses, not replacement production tests or changed physics.
import {writeFile} from 'node:fs/promises';
import {C,G,EPS,blackHole,radius,acceleration,safeStep,step} from '../../../dist/physics.mjs';
import {thermalAt} from '../../../dist/thermal-physics.mjs';
import {distribution,multiplicity,arrangement,randomStep,macrostate} from '../../../dist/entropy.mjs';
const result={runtime:process.version,thermal:{samples:0,minEntropy:Infinity,maxRelativeEnergyError:0,maxReferenceTemperatureErrorK:0},blackHoles:[],markers:{}};
let seed=123456789;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
for(let i=0;i<20000;i++){
 const a=250+350*random(),b=250+350*random(),ca=10**(6*random()),cb=10**(6*random()),g=10**(-3+6*random()),tau=ca*cb/(ca+cb)/g,time=Math.min(1e12,tau*10**(-12+15*random())),p={a,b,ca,cb,g},r=thermalAt(p,time);
 const eq=(ca*a+cb*b)/(ca+cb),d=(a-b)*Math.exp(-time/tau),ra=eq+cb/(ca+cb)*d,rb=eq-ca/(ca+cb)*d;
 result.thermal.samples++;result.thermal.minEntropy=Math.min(result.thermal.minEntropy,r.entropy);result.thermal.maxRelativeEnergyError=Math.max(result.thermal.maxRelativeEnergyError,Math.abs(r.energyError)/r.initialEnergy);result.thermal.maxReferenceTemperatureErrorK=Math.max(result.thermal.maxReferenceTemperatureErrorK,Math.abs(r.ta-ra),Math.abs(r.tb-rb));
}
for(const mass of [1,1e9,C.earth,C.sun,4.3e6*C.sun,6.5e9*C.sun,1e41]){const b=blackHole(mass),d=blackHole(mass*2);result.blackHoles.push({mass,...b,finite:Object.values(b).every(Number.isFinite),powerTimesLifetimeOverMassEnergy:b.power*b.lifetime/(mass*C.c**2),doubling:{radius:d.radius/b.radius,temperature:d.temperature/b.temperature,power:d.power/b.power,lifetime:d.lifetime/b.lifetime}})}
const s=distribution(12);result.markers={centralMultiplicity:String(multiplicity(12,6)),centralProbability:s[6].probability,extremeProbability:s[12].probability,probabilitySum:s.reduce((x,r)=>x+r.probability,0),nextStepExpectedLeftFromAllLeft:12*.75,equilibriumExpectedLeft:6};
// Adaptive near-grazing contact can occur entirely between endpoints. This is a
// mathematical witness of the documented no-continuous-collision-detection limit.
const m=C.earth/C.sun,R=2*radius({type:'planet',m}),y=R*(1-1e-6);
const bodies=[{id:1,name:'a',type:'planet',m,x:-.075*R,y,vx:1,vy:0,color:'#fff',trail:[]},{id:2,name:'b',type:'planet',m,x:0,y:0,vx:0,vy:0,color:'#fff',trail:[]}];
const dt=safeStep(bodies),initial=structuredClone(bodies),a=acceleration(bodies),t=dt/2;
const mid=initial.map((b,i)=>({x:b.x+b.vx*t+.5*a[i][0]*t*t,y:b.y+b.vy*t+.5*a[i][1]*t*t}));const detected=step(bodies,dt);
result.grazingCollision={dtDays:dt,relativeSpeedKms:C.AU/C.day/1000,contactRadiusAU:R,startDistanceAU:Math.hypot(initial[0].x-initial[1].x,initial[0].y-initial[1].y),midDriftDistanceAU:Math.hypot(mid[0].x-mid[1].x,mid[0].y-mid[1].y),endDistanceAU:Math.hypot(bodies[0].x-bodies[1].x,bodies[0].y-bodies[1].y),detected,bodiesAfter:bodies.length,softeningAU:EPS};
const json=JSON.stringify(result,null,2)+'\n';if(process.argv[2])await writeFile(process.argv[2],json);else process.stdout.write(json);

// Reproducible v0.7 diagnostics. No golden-file update and no model mutation.
import {thermalAt,THERMAL_DEFAULT as d} from '../dist/thermal-physics.mjs';
const grid={states:0,maxEnergyErrorJ:0,maxRelativeEnergyError:0,minEntropyJK:Infinity,minEntropyIncrementJK:Infinity,maxOvershootK:0};
for(const a of [250,350,600])for(const b of [250,290,600])for(const ca of [1,1000,1e6])for(const cb of [1,3000,1e6])for(const g of [.001,10,1000]){
 const p={a,b,ca,cb,g},tau=1/(g*(1/ca+1/cb));let prior=0;
 for(const time of [0,1e-15,tau*.001,tau,tau*5,1e12]){
  const r=thermalAt(p,time);grid.states++;grid.maxEnergyErrorJ=Math.max(grid.maxEnergyErrorJ,Math.abs(r.energyError));grid.maxRelativeEnergyError=Math.max(grid.maxRelativeEnergyError,Math.abs(r.energyError)/r.initialEnergy);grid.minEntropyJK=Math.min(grid.minEntropyJK,r.entropy);grid.minEntropyIncrementJK=Math.min(grid.minEntropyIncrementJK,r.entropy-prior);grid.maxOvershootK=Math.max(grid.maxOvershootK,Math.min(a,b)-r.ta,r.ta-Math.max(a,b),Math.min(a,b)-r.tb,r.tb-Math.max(a,b));prior=r.entropy;
 }
}
const p={a:400,b:280,ca:500,cb:1500,g:4};let a=p.a,b=p.b;const h=.01;
const f=(x,y)=>[-p.g*(x-y)/p.ca,p.g*(x-y)/p.cb];
for(let i=0;i<10000;i++){const k1=f(a,b),k2=f(a+h*k1[0]/2,b+h*k1[1]/2),k3=f(a+h*k2[0]/2,b+h*k2[1]/2),k4=f(a+h*k3[0],b+h*k3[1]);a+=h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;b+=h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6}
const r=thermalAt(p,100);
console.log(JSON.stringify({runtime:process.version,grid,halfRelaxation:thermalAt(d,50*Math.log(2)),equilibrium:thermalAt(d,1e12),independentRK4:{parameters:p,stepS:h,steps:10000,timeS:100,ta:a,tb:b,errorAK:a-r.ta,errorBK:b-r.tb}},null,2));

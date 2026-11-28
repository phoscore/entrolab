import test from 'node:test';import assert from 'node:assert/strict';
import {thermalAt,validateThermal,transferableTemperature,THERMAL_DEFAULT as d,THERMAL_LIMITS} from '../dist/thermal-physics.mjs';
const near=(a,b,tol=2e-11)=>assert(Math.abs(a-b)<=tol,`${a} vs ${b}, tolerance ${tol}`);
const REF_SCALE=10n**100n;
function expNegativeRational(numerator,denominator){
 const n=BigInt(numerator),d=BigInt(denominator)*16n;
 let term=REF_SCALE,sum=REF_SCALE;
 for(let k=1n;k<=120n;k++){term=-(term*n)/(d*k);sum+=term}
 for(let i=0;i<4;i++)sum=sum*sum/REF_SCALE;
 return sum;
}
const fromReference=value=>Number(value)/Number(REF_SCALE);
function nearReference(actual,value){
 const expected=fromReference(value),tolerance=16*Number.EPSILON*Math.abs(expected);
 assert(Math.abs(actual-expected)<=tolerance,`${actual} vs high-precision ${expected}; tolerance ${tolerance}`);
}
test('thermal: independently calculated half-relaxation reference and equilibrium',()=>{const r=thermalAt(d,50*Math.log(2));near(r.ta,335);near(r.tb,305);near(r.q,15000);near(r.power,300);near(r.eq,320);near(r.energy,640000);near(r.entropy,1000*Math.log(335/350)+1000*Math.log(305/290),1e-12);const end=thermalAt(d,1e12);assert.equal(end.ta,320);assert.equal(end.tb,320);near(end.entropy,1000*Math.log(102400/101500),1e-12)});
test('thermal: complete bounds grid conserves energy, stays bounded and never crosses equilibrium',()=>{for(const a of [250,350,600])for(const b of [250,290,600])for(const ca of [1,1000,1e6])for(const cb of [1,3000,1e6])for(const g of [.001,10,1000]){const p={a,b,ca,cb,g};let prior=-Infinity;const tau=1/(g*(1/ca+1/cb));for(const t of [0,1e-15,tau*.001,tau,tau*5,1e12]){const r=thermalAt(p,t);assert(Number.isFinite(r.entropy));assert(r.ta>=Math.min(a,b)-1e-12&&r.ta<=Math.max(a,b)+1e-12);assert(r.tb>=Math.min(a,b)-1e-12&&r.tb<=Math.max(a,b)+1e-12);assert((r.ta-r.tb)*(a-b)>=-1e-10);assert(Math.abs(r.energyError)<=4*Number.EPSILON*r.initialEnergy);assert(r.entropy>=-1e-10);assert(r.entropy>=prior-1e-9);assert(r.production>=0);prior=r.entropy}}});
test('thermal: identical initial temperatures have exactly zero heat/entropy for all times',()=>{for(const c of [1,1000,1e6])for(const time of [0,.1,1,1e12]){const r=thermalAt({a:333,b:333,ca:c,cb:3000,g:.001},time);for(const k of ['q','power','sa','sb','entropy','production','energyError'])assert.equal(Math.abs(r[k]),0,k);assert.equal(r.ta,333);assert.equal(r.tb,333)}});
test('thermal: exchanging A/B reverses signed heat and exchanges temperatures/individual entropy',()=>{const p={a:270,b:550,ca:123,cb:54321,g:.7},q={a:p.b,b:p.a,ca:p.cb,cb:p.ca,g:p.g};for(const t of [0,.1,10,1e7]){const a=thermalAt(p,t),b=thermalAt(q,t);near(a.ta,b.tb);near(a.tb,b.ta);near(a.q,-b.q);near(a.power,-b.power);near(a.entropy,b.entropy,1e-9);near(a.sa,b.sb,1e-10);assert(a.power<=0);assert(a.q<=0)}});
test('thermal: calorimetry Q and entropy-rate derivative agree with independent balances',()=>{for(const t of [1,10,100]){const r=thermalAt(d,t),h=.001,lo=thermalAt(d,t-h),hi=thermalAt(d,t+h);near(r.q,d.ca*(d.a-r.ta),1e-10);near(r.q,d.cb*(r.tb-d.b),1e-10);near((hi.entropy-lo.entropy)/(2*h),r.production,1e-9);near((hi.q-lo.q)/(2*h),r.power,1e-6);assert(r.sa<0&&r.sb>0)}});
test('thermal: independent RK4 two-temperature reference converges to the analytical state',()=>{const p={a:400,b:280,ca:500,cb:1500,g:4};let a=p.a,b=p.b;const h=.01;const f=(x,y)=>[-p.g*(x-y)/p.ca,p.g*(x-y)/p.cb];for(let i=0;i<10000;i++){const k1=f(a,b),k2=f(a+h*k1[0]/2,b+h*k1[1]/2),k3=f(a+h*k2[0]/2,b+h*k2[1]/2),k4=f(a+h*k3[0],b+h*k3[1]);a+=h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;b+=h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6}const r=thermalAt(p,100);near(a,r.ta,2e-10);near(b,r.tb,2e-10)});
test('thermal: near-equilibrium and tiny-time entropy remains finite/nonnegative without a clamp',()=>{for(const delta of [1e-10,1e-8,.001,60])for(const t of [0,1e-15,1e-8,1,100,1e12]){const r=thermalAt({...d,a:320+delta,b:320},t);assert(r.entropy>=0);assert(Number.isFinite(r.entropy))}});
test('thermal: analytic flux and production retain high-precision values when rounded temperatures coincide',()=>{
 const p={a:400,b:400+2**-44,ca:1e6,cb:1e6,g:1000},unit=REF_SCALE/(1n<<44n);
 const mean=400n*REF_SCALE+REF_SCALE/(1n<<45n);
 for(const [time,numerator,denominator]of [[0,0,1],[300,3,5],[1234.5,2469,1000]]){
  const decay=expNegativeRational(numerator,denominator),remaining=-(unit*decay/REF_SCALE);
  const ta=mean+remaining/2n,tb=mean-remaining/2n;
  const expectedPower=1000n*remaining;
  const deltaSquared=remaining*remaining/REF_SCALE,tempProduct=ta*tb/REF_SCALE;
  const expectedProduction=1000n*deltaSquared*REF_SCALE/tempProduct;
  const result=thermalAt(p,time);
  nearReference(result.remainingDelta,remaining);
  nearReference(result.power,expectedPower);
  nearReference(result.production,expectedProduction);
  assert.equal(result.equilibrium,false);
  if(time===1234.5)assert.equal(result.ta.toFixed(2),result.tb.toFixed(2));
 }
 const exact=thermalAt({...p,b:p.a},1234.5);
 assert.equal(exact.equilibrium,true);assert.equal(exact.power,0);assert.equal(exact.production,0);
});
test('thermal: malformed/out-of-model parameters and times are rejected without changing input',()=>{for(const key of ['a','b','ca','cb','g'])for(const v of [NaN,Infinity,-Infinity,0,-1,'350',null,undefined])assert.throws(()=>thermalAt({...d,[key]:v},1));for(const a of [0,.001,249.99,600.01,1e12])assert.throws(()=>validateThermal({...d,a}));for(const t of [-1,NaN,Infinity,'1',1e13])assert.throws(()=>thermalAt(d,t));const p={...d};const s=JSON.stringify(p);thermalAt(p,10);assert.equal(JSON.stringify(p),s);assert.equal(THERMAL_LIMITS.temperature[0],250)});
test('thermal: extreme-temperature transfer is explicit and bounded, never clamped',()=>{for(const k of [250,293.15,350,600])assert.equal(transferableTemperature(k),true);for(const k of [-0,0,-1,.001,.1,2.725,249.99,600.01,1e12,Infinity,NaN,'350'])assert.equal(transferableTemperature(k),false)});

test('thermal: immutable limits and repeated dense sampling retain finite analytical readouts',()=>{assert(Object.isFrozen(THERMAL_LIMITS.temperature));for(let i=0;i<1000;i++){const p={a:250+350*i/999,b:600-350*i/999,ca:1+i,cb:1e6-i,g:.001+i};const r=thermalAt(p,i*1e6);assert(Object.entries(r).every(([key,value])=>key==='equilibrium'?typeof value==='boolean':Number.isFinite(value)));assert(r.entropy>=-1e-9)}});
test('thermal: new dynamic DE/EN messages are catalogued and prior title/favicon remain fixed',async()=>{const {readFileSync}=await import('node:fs');const {de,en}=await import('../dist/i18n.mjs');for(const file of ['thermal-ui.mjs','discovery.mjs']){const source=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');for(const [,key]of source.matchAll(/\bt\('([^'\n]+)'/g)){assert(Object.hasOwn(de,key),key);assert(Object.hasOwn(en,key),key)}}assert.equal(en['THERMODYNAMISCHES LEHRMODELL'],'THERMODYNAMIC TEACHING MODEL');const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/<title>Reincarnated as a Proton<\/title>/);assert.match(html,/href="favicon.svg"/)});

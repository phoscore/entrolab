import test from 'node:test';
import assert from 'node:assert/strict';
import {demoPatterns,demoSummary,liveComparison,thermalBalance} from '../dist/learning-math.mjs';
import {thermalAt,THERMAL_DEFAULT} from '../dist/thermal-physics.mjs';
import {applications,sources} from '../dist/knowledge.mjs';

test('v0.8 learning: enumerate all 16 distinct four-marker assignments and exact 1/4/6/4/1 counts',()=>{
 const patterns=[];
 for(let k=0;k<=4;k++){const p=demoPatterns(k);assert.equal(p.length,[1,4,6,4,1][k]);for(const state of p){assert.equal(state.filter(Boolean).length,k);patterns.push(state.map(Number).join(''))}}
 assert.equal(new Set(patterns).size,16);assert.equal(demoSummary([true,true,false,false]).omega,6n);
 assert.equal(demoSummary([true,true,false,false]).probability,.375);assert.equal(demoSummary([true,true,false,false]).entropy,Math.log(6));
});
test('v0.8 learning: independent demo copies every array and rejects sparse/non-Boolean/invalid dimensions',()=>{
 const state=[true,true,false,false],r=demoSummary(state);r.state[0]=false;r.patterns[0][0]=false;assert.deepEqual(state,[true,true,false,false]);assert.deepEqual(demoPatterns(2)[0],state);
 for(const bad of [null,{},'LLRR',new Array(4),[true,,false,false],[1,1,0,0],[true,true,false],[true,true,false,false,false]])assert.throws(()=>demoSummary(bad));
 for(const bad of [-1,5,NaN,Infinity,1.1,'2',null])assert.throws(()=>demoPatterns(bad));
});
test('v0.8 learning: N=1,12,32 comparison retains exact counts and honest small equilibrium probabilities',()=>{
 const one=liveComparison(1);assert.equal(one.balanced.omega,1n);assert.equal(one.edge.probability,.5);
 const twelve=liveComparison(12);assert.equal(twelve.balanced.omega,924n);assert.equal(twelve.balanced.probability,924/4096);assert(twelve.balanced.probability<.5);assert.equal(twelve.edge.omega,1n);
 const max=liveComparison(32,'edge');assert.equal(max.balanced.omega,601080390n);assert.equal(max.selected.k,32);assert.equal(max.selected.probability,2**-32);
 for(const n of [0,33,2.2,NaN,'12'])assert.throws(()=>liveComparison(n));assert.throws(()=>liveComparison(12,'other'));
});
test('v0.8 learning: thermal teaching projection preserves independent 350/290 K reference and signed units',()=>{
 const p={...THERMAL_DEFAULT},time=10,exactQ=30000*(1-Math.exp(-.02*time));
 const input=thermalAt(p,time),copy=structuredClone(input),r=thermalBalance(p,input);
 assert(Math.abs(r.transfer[1]-exactQ)<1e-10);assert.equal(r.transfer[0]+r.transfer[1],0);assert.equal(r.total,640000);
 assert(r.entropy[0]<0&&r.entropy[1]>0&&r.entropy[2]>0);assert(Math.abs(r.entropy[0]-1000*Math.log((350-exactQ/1000)/350))<1e-12);assert(Math.abs(r.entropy[2]-2.91900608120612)<1e-12);
 assert.deepEqual(input,copy);assert.deepEqual(p,THERMAL_DEFAULT);
});
test('v0.8 learning: reverse/equal/unequal capacities and boundary extremes use the applied analytic result unchanged',()=>{
 for(const p of [{a:290,b:350,ca:1000,cb:1000,g:10},{a:320,b:320,ca:1,cb:1e6,g:.001},{a:350,b:290,ca:1000,cb:3000,g:10},{a:250,b:600,ca:1,cb:1e6,g:1000}])for(const time of [0,1e-12,.001,10,1e12]){
  const input=thermalAt(p,time),r=thermalBalance(p,input);assert.equal(r.total,input.energy);assert.equal(r.error,input.energyError);assert.equal(r.entropy[2],input.entropy);assert.equal(r.production,input.production);assert.equal(r.transfer[1],input.q);assert(r.energy.every(x=>Number.isFinite(x)&&x>0));assert(r.entropy[2]>=0);
 }
 const equal=thermalBalance({a:320,b:320,ca:1,cb:1,g:1},thermalAt({a:320,b:320,ca:1,cb:1,g:1},10));assert(equal.entropy.every(x=>x===0));assert.equal(equal.production,0);
});
test('v0.8 learning: malformed thermal projections fail explicitly and applications have canonical sources',()=>{
 const r=thermalAt(THERMAL_DEFAULT,10);
 for(const bad of [null,{}, {...r,q:NaN},{...r,entropy:Infinity},{...r,ta:0}])assert.throws(()=>thermalBalance(THERMAL_DEFAULT,bad));
 assert.throws(()=>thermalBalance({...THERMAL_DEFAULT,a:249},r));assert.equal(applications.length,5);for(const app of applications)for(const id of app.sources)assert(sources[id],id);
});

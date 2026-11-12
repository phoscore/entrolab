import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gasSample, gasStatistics, gasHistogram, maxwellDensity, periodicPosition} from '../dist/gas-model.mjs';
import {photonSystem, deuteronBinding} from '../dist/matter-model.mjs';
import {de,en} from '../dist/i18n.mjs';

test('Maxwell density agrees with independently integrated 3D normalization and second moment',()=>{
 // Integrate in SI without using any of the implementation's normalization constants.
 const sigma=214, n=24000, h=12*sigma/n;
 let total=0, squared=0;
 for(let i=0;i<n;i++){
  const v=(i+.5)*h, density=maxwellDensity(v,sigma);
  total+=density*h;squared+=v*v*density*h;
 }
 assert(Math.abs(total-1)<1e-11);
 assert(Math.abs(squared/(3*sigma*sigma)-1)<1e-11);
 const at150=gasStatistics(150),at600=gasStatistics(600);
 assert.equal(at600.rms/at150.rms,2);assert.equal(at600.energy/at150.energy,4);
 assert(Math.abs(at600.rms-612.08)<1);
 for(const t of [-1,0,29.9,3000.1,1e12,NaN,Infinity,'300'])assert.throws(()=>gasStatistics(t));
});

test('Gas sampling is deterministic, independent and conserves counts including truncated tails',()=>{
 const a=gasSample(54315,4096),b=gasSample(54315,4096),c=gasSample(54316,4096);
 assert.deepEqual(a,b);assert.notDeepEqual(a,c);
 const radial=a.reduce((sum,p)=>sum+p.speed*p.speed,0)/a.length;
 assert(Math.abs(radial-3)<.11,radial);
 const vx=a.reduce((sum,p)=>sum+p.vx,0)/a.length;
 assert(Math.abs(vx)<.06,vx);
 for(const p of a)assert(p.speed>=Math.hypot(p.vx,p.vy));
 const histogram=gasHistogram(a,200,500,25);
 const area=histogram.density.reduce((x,y)=>x+y,0)*20;
 assert(Math.abs(area+histogram.tail/a.length-1)<1e-14);
 assert.equal(periodicPosition(-.25),.75);assert.equal(periodicPosition(4.25),.25);
});

test('Photon invariant agrees with the four-vector calculation and is stable near parallel',()=>{
 for(const [a,b] of [[1,1],[1000,.01],[.5,7.5]])for(const angle of [0,1,30,90,132,180]){
  const q=photonSystem(a,b,angle),independent=q.energy*q.energy-q.momentum.reduce((sum,p)=>sum+p*p,0);
  assert(Math.abs(q.restEnergy*q.restEnergy-independent)<1e-8);
 }
 assert.equal(photonSystem(1,1,0).restEnergy,0);
 assert.equal(photonSystem(1,1,180).restEnergy,2);
 assert.deepEqual(photonSystem(1,1,180).momentum,[0,0]);
 assert(Math.abs(photonSystem(1,1,1e-12).restEnergy/(Math.PI*1e-12/180)-1)<1e-12);
 for(const bad of [[0,1,90],[1,1,-1],[1,1,181],[NaN,1,90],[1001,1,0]])assert.throws(()=>photonSystem(...bad));
});

test('Deuteron comparison uses nuclear CODATA energies, with the independent tabular difference',()=>{
 const {free,bound,difference}=deuteronBinding();
 assert(Math.abs(free-1877.83751137)<2e-10);
 assert.equal(bound,1875.61294500);
 assert(Math.abs(difference-2.22456637)<2e-10);
});

test('Published navigation retires Discovery and places the new lab between Entropy and Science',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const tabs=[...html.matchAll(/data-tab="(\w+)"/g)].map(match=>match[1]);
 assert.deepEqual(tabs,['gravity','blackhole','extreme','entropy','matter','science']);
 assert(!/id="helpToggle"|id="quickStart"|src="discovery\.mjs"/.test(html));
 assert.match(html,/<title>Reincarnated as a Proton<\/title>/);
 assert(de['v09.gas.chart']&&en['v09.qcd.fields']);
});

test('Photon system explicitly rejects energies below its 0.01 MeV domain',()=>{
 for(const energy of [Number.MIN_VALUE,1e-200,1e-160,.009999999999999998]){
  assert.throws(()=>photonSystem(energy,1,180),RangeError);
  assert.throws(()=>photonSystem(1,energy,180),RangeError);
 }
 assert.equal(photonSystem(.01,.01,180).restEnergy,.02);
 assert.equal(photonSystem(1000,1000,180).restEnergy,2000);
 assert(Math.abs(photonSystem(.01,1000,180).restEnergy-6.324555320336759)<1e-14);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {multiplicity,distribution,arrangement,macrostate,randomStep,sampleArrangement,seededRandom,MAX_MARKERS,SWITCH_PROBABILITY} from '../dist/entropy.mjs';

test('entropy: exact references N=1,2,12 and bounded N=32',()=>{
 assert.deepEqual(distribution(1).map(r=>r.omega),[1n,1n]);assert.deepEqual(distribution(2).map(r=>r.omega),[1n,2n,1n]);
 const row=distribution(12)[6];assert.equal(row.omega,924n);assert.equal(row.total,4096n);assert.equal(row.probability,.2255859375);assert.equal(row.entropy,Math.log(924));assert.equal(multiplicity(32,16),601080390n);
});
test('entropy: exact binomial sum, symmetry, probability normalisation, finite entropy for every supported N',()=>{
 for(let n=1;n<=MAX_MARKERS;n++){const rows=distribution(n);assert.equal(rows.reduce((s,r)=>s+r.omega,0n),2n**BigInt(n));assert(Math.abs(rows.reduce((s,r)=>s+r.probability,0)-1)<2e-15);for(const r of rows){assert.equal(r.omega,rows[n-r.k].omega);assert.equal(r.probability,rows[n-r.k].probability);assert(Number.isFinite(r.entropy));assert(r.entropy>=0);assert(r.probability>0)}assert.equal(rows[0].entropy,0);assert.equal(rows[n].entropy,0)}
});
test('entropy: independent enumeration of all 4096 microstates reproduces the complete N=12 histogram',()=>{
 const counts=Array(13).fill(0n);for(let bits=0;bits<4096;bits++){let k=0;for(let i=0;i<12;i++)k+=(bits>>>i)&1;counts[k]++}assert.deepEqual(distribution(12).map(r=>r.omega),counts);
});
test('entropy: mode has maximal multiplicity but never probability one; odd N has two equal modes',()=>{
 for(let n=1;n<=32;n++){const rs=distribution(n),mode=rs[Math.floor(n/2)];assert(mode.probability<1);assert.equal(mode.omega,rs[Math.ceil(n/2)].omega);assert(rs.every(r=>r.omega<=mode.omega))}
});
test('entropy: invalid counts, states, seeds and random samples fail explicitly without overflow',()=>{
 for(const n of [0,-1,MAX_MARKERS+1,1.5,NaN,Infinity,'12',null])assert.throws(()=>distribution(n));for(const k of [-1,13,.5,NaN])assert.throws(()=>multiplicity(12,k));assert.throws(()=>randomStep([true,1]));assert.throws(()=>seededRandom(.5));
 const original=arrangement(12);for(const u of [-1,1,NaN,Infinity]){assert.throws(()=>randomStep(original,()=>u));assert.throws(()=>sampleArrangement(12,6,()=>u))}assert.deepEqual(original,arrangement(12));
});
test('entropy: injected switch source has exact threshold q=.25, preserves identity ordering and input',()=>{
 assert.equal(SWITCH_PROBABILITY,.25);const input=[true,false,true,false],values=[0,.249999,.25,.999999];const out=randomStep(input,()=>values.shift());assert.deepEqual(out,[false,true,true,false]);assert.deepEqual(input,[true,false,true,false]);assert.notEqual(out,input);
});
test('entropy: seeded multi-step trajectory is reproducible, bounded and independent of other runs',()=>{
 const evolve=seed=>{let state=arrangement(12);const rng=seededRandom(seed),trail=[];for(let i=0;i<1000;i++){state=randomStep(state,rng);trail.push(macrostate(state));assert.equal(state.length,12)}return trail};assert.deepEqual(evolve(42),evolve(42));assert.notDeepEqual(evolve(42),evolve(43));assert.deepEqual(evolve(42).slice(0,10),[8,7,6,9,10,7,5,7,5,5]);
});
test('entropy: fluctuation can reduce model entropy; the model imposes no monotonicity',()=>{
 const balanced=arrangement(12,6);let i=0;const allLeft=randomStep(balanced,()=>i++<6?.9:0);assert.equal(macrostate(allLeft),12);assert.equal(distribution(12)[12].entropy,0);assert(distribution(12)[6].entropy>0);assert.equal(macrostate(balanced),6);
});
test('entropy: exact N=2 transition matrix is stochastic and symmetric, preserving uniform equilibrium',()=>{
 const states=Array.from({length:4},(_,bits)=>Array.from({length:2},(_,i)=>Boolean((bits>>>i)&1)));
 const matrix=states.map(a=>states.map(b=>a.reduce((p,left,i)=>p*(left===b[i]?.75:.25),1)));
 for(let i=0;i<4;i++){assert.equal(matrix[i].reduce((s,p)=>s+p,0),1);assert.equal(matrix.reduce((s,row)=>s+row[i]/4,0),.25);for(let j=0;j<4;j++)assert.equal(matrix[i][j],matrix[j][i])}
 // Initially both left: first-tick P(k=2)=.75², unlike equilibrium 1/4.
 assert.equal(matrix[3][3],.5625);assert.notEqual(matrix[3][3],distribution(2)[2].probability);
});
test('entropy: same-k uniform sampler preserves count and never changes the input state convention',()=>{
 const rng=seededRandom(77);for(const n of [1,2,12,32])for(let k=0;k<=n;k++){const out=sampleArrangement(n,k,rng);assert.equal(macrostate(out),k);assert.equal(out.length,n)}
 // Enumerate all equally likely Fisher–Yates choices for N=3, k=1.
 const counts=new Map();for(let j=0;j<3;j++)for(let k=0;k<2;k++){const values=[(j+.1)/3,(k+.1)/2],s=sampleArrangement(3,1,()=>values.shift()).join(',');counts.set(s,(counts.get(s)??0)+1)}assert.equal(counts.size,3);assert([...counts.values()].every(n=>n===2));
});

test('entropy: the 512-marker tails retain exact multiplicity and positive probability',()=>{
 const rows=distribution(MAX_MARKERS);
 assert.equal(rows[0].probability,2**-512);
 assert.equal(rows[1].omega,512n);
 assert.equal(rows[256].omega,multiplicity(512,256));
});

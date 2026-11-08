import {run} from '../tests/numerics.mjs';
const results=[];
for(const [name,days] of [['binary',36525],['solar',36525],['hole',36525],['eccentric',3652.5],['triple',3652.5],['encounter',30]]) for(const mode of ['adaptive','fixed'])results.push(run(name,mode,days));
console.log(JSON.stringify({description:'Deterministic physics-only runs; fixed h=0.1 d; exact common end time; no frame accumulator',results},null,2));

import test from 'node:test';
import assert from 'node:assert/strict';
import {crossing} from './collision-review.mjs';
test('review head-on encounter: adaptive and fine fixed steps detect one merger',()=>{for(const options of [{mode:'adaptive'},{mode:'fixed',h:1e-4},{mode:'fixed',h:5e-5}]){const r=crossing(options);assert.equal(r.hits,1);assert.equal(r.remaining,1);console.log(JSON.stringify(r))}});
test('separated passing trajectories remain separate in adaptive and fine fixed probes',()=>{for(const mode of ['adaptive','fixed']){const r=crossing({mode,offset:.0003});assert.equal(r.hits,0);assert.equal(r.remaining,2)}});

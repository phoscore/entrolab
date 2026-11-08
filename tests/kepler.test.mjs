import test from 'node:test';
import assert from 'node:assert/strict';
import {G} from '../dist/physics.mjs';
import {evaluate,kepler} from './kepler-reference.mjs';
// Explicit AU/radian budgets (~20–50% headroom over reviewed baseline), not universal accuracy claims.
const budgets=[
 [0,'adaptive',3652.5,.002,.002,.002],
 [0,'fixed',3652.5,.00008,.00008,.00008],
 [.5,'adaptive',365.25,.0001,.00025,.00075],
 [.5,'fixed',365.25,.0001,.0001,.0001],
 [.8,'adaptive',365.25,.00023,.0003,.0024],
 [.8,'fixed',365.25,.0008,.0018,.0018]
];
for(const [e,mode,days,final,max,phase] of budgets)test(`analytical Kepler e=${e} ${mode}, ${days} d: relative position and wrapped phase`,()=>{const r=evaluate(e,days,mode);assert(Number.isFinite(r.maxPhaseErrorRad));assert(r.finalPositionErrorAU<final,JSON.stringify(r));assert(r.maxPositionErrorAU<max,JSON.stringify(r));assert(r.maxPhaseErrorRad<phase,JSON.stringify(r));console.log(JSON.stringify(r))});
test('analytical reference: apocentre, pericentre, period and orientation',()=>{for(const e of [0,.5,.8]){const a=1/(1+e),period=2*Math.PI*Math.sqrt(a**3/(G*(1+3e-6)));const start=kepler(e,0),half=kepler(e,period/2),full=kepler(e,period);assert(Math.hypot(start[0]-1,start[1])<1e-13);assert(Math.hypot(half[0]+a*(1-e),half[1])<1e-13);assert(Math.hypot(full[0]-1,full[1])<1e-13);assert(kepler(e,period/4)[1]>0)}});

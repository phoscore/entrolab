// Finite, distinguishable two-state markers. No positions, energies or SI time.
export const MAX_MARKERS=32;
export const SWITCH_PROBABILITY=.25;
export function validateN(n){if(!Number.isInteger(n)||n<1||n>MAX_MARKERS)throw new RangeError('N must be an integer in [1,32]');return n}
function validateK(n,k){validateN(n);if(!Number.isInteger(k)||k<0||k>n)throw new RangeError('k must be an integer in [0,N]')}
export function multiplicity(n,k){validateK(n,k);let result=1n;for(let i=1;i<=Math.min(k,n-k);i++)result=result*BigInt(n-i+1)/BigInt(i);return result}
export function distribution(n){validateN(n);const total=2n**BigInt(n);return Array.from({length:n+1},(_,k)=>{const omega=multiplicity(n,k);return {k,omega,total,probability:Number(omega)/Number(total),entropy:Math.log(Number(omega))}})}
export function arrangement(n,k=n){validateK(n,k);return Array.from({length:n},(_,i)=>i<k)}
export function validateState(state){
 if(!Array.isArray(state))throw new TypeError('State must be an array of Boolean markers');
 validateN(state.length);
 // Array#every skips holes; inherited slots do not describe an explicit marker.
 for(let i=0;i<state.length;i++)if(!Object.hasOwn(state,i)||typeof state[i]!=='boolean')throw new TypeError('Each marker must be an own Boolean value: left (true) or right (false)');
 return state;
}
export function macrostate(state){validateState(state);return state.filter(Boolean).length}
function uniform(rng){const u=rng();if(!Number.isFinite(u)||u<0||u>=1)throw new RangeError('RNG must return a finite value in [0,1)');return u}
// Per tick each marker switches independently, in either direction, with q=1/4.
// This symmetric, aperiodic chain has a uniform stationary microstate distribution.
// Its equilibrium histogram is NOT the conditional distribution of the next tick.
export function randomStep(state,rng=Math.random){validateState(state);return state.map(left=>uniform(rng)<SWITCH_PROBABILITY?!left:left)}
export function sampleArrangement(n,k,rng=Math.random){const result=arrangement(n,k);for(let i=n-1;i>0;i--){const j=Math.floor(uniform(rng)*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
// Reproducible test source, not a cryptographic generator; the UI uses Math.random.
export function seededRandom(seed){if(!Number.isInteger(seed))throw new TypeError('Integer seed required');let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/2**32}}

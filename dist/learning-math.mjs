// Pure read-only teaching projections of the existing two independent models.
import {validateState,macrostate,multiplicity,distribution,validateN} from './entropy.mjs';
import {validateThermal} from './thermal-physics.mjs';
export function demoPatterns(k){
 if(!Number.isInteger(k)||k<0||k>4)throw new RangeError('Demo k must be an integer in [0,4]');
 return Array.from({length:16},(_,mask)=>Array.from({length:4},(_,i)=>Boolean(mask&(1<<i)))).filter(state=>macrostate(state)===k);
}
export function demoSummary(state){
 validateState(state);if(state.length!==4)throw new RangeError('The independent demo requires four Boolean markers');
 const k=macrostate(state),omega=multiplicity(4,k);
 return {state:[...state],k,omega,total:16n,probability:Number(omega)/16,entropy:Math.log(Number(omega)),patterns:demoPatterns(k)};
}
export function liveComparison(n,choice='balanced'){
 validateN(n);if(!['balanced','edge'].includes(choice))throw new RangeError('Unknown comparison');
 const rows=distribution(n),balanced=rows[Math.floor(n/2)],edge=rows[n];
 return {n,balanced,edge,selected:choice==='balanced'?balanced:edge};
}
export function thermalBalance(params,result){
 validateThermal(params);
 for(const key of ['ta','tb','q','sa','sb','entropy','energy','initialEnergy','energyError','production'])if(typeof result?.[key]!=='number'||!Number.isFinite(result[key]))throw new TypeError('Finite applied thermal result required: '+key);
 if(result.ta<=0||result.tb<=0)throw new RangeError('Positive absolute temperatures required');
 return {energy:[params.ca*result.ta,params.cb*result.tb],initial:[params.ca*params.a,params.cb*params.b],transfer:[-result.q,result.q],entropy:[result.sa,result.sb,result.entropy],total:result.energy,initialTotal:result.initialEnergy,error:result.energyError,production:result.production};
}

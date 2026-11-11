// Tabulated normal-pressure references; no dynamical material or heat model.
export const REFERENCE_PRESSURE_PA=101325;
const freeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')freeze(v);return Object.freeze(o)};
export const MATERIALS=freeze({
 water:{formula:'H₂O',melt:273.15,boil:373.15,meltDigits:2,boilDigits:2,meltBand:.05,boilBand:.05,window:[250,400],sources:['phase-changes']},
 ethanol:{formula:'C₂H₅OH',melt:159,boil:351.5,meltDigits:0,boilDigits:1,meltBand:2,boilBand:.2,window:[140,375],sources:['nist-ethanol','pdg-ethanol']},
 aluminium:{formula:'Al',melt:933.473,boil:2792,meltDigits:3,boilDigits:0,meltBand:.0005,boilBand:.5,window:[273.15,2850],sources:['rsc-aluminium']},
 iron:{formula:'Fe',melt:1811,boil:3134,meltDigits:0,boilDigits:0,meltBand:.5,boilBand:.5,window:[273.15,3200],sources:['rsc-iron']}
});
export function validTemperature(k){return typeof k==='number'&&Number.isFinite(k)&&k>=0&&!Object.is(k,-0)&&k<=1e12}
export function materialPhase(id,k){
 const m=MATERIALS[id];if(!m)throw new RangeError('Unknown material');if(!validTemperature(k))throw new RangeError('Invalid temperature');
 if(k<m.window[0]||k>m.window[1])return 'outside';
 // Numerical rounding allowance is separate from the stated table/display band.
 const near=(point,band)=>Math.abs(k-point)<=band+4*Number.EPSILON*Math.max(k,point);
 if(near(m.melt,m.meltBand))return 'melting';if(near(m.boil,m.boilBand))return 'boiling';
 return k<m.melt?'solid':k<m.boil?'liquid':'vapor';
}
export function compareTemperatures(a,b){
 if(!validTemperature(a)||!validTemperature(b))throw new RangeError('Invalid temperature');
 const delta=a-b;if(b===0)return {delta,ratio:null};if(a===0)return {delta,ratio:{value:0}};
 const ratio=a/b;if(Number.isFinite(ratio)&&ratio>0)return {delta,ratio:{value:ratio}};
 const exponentReal=Math.log10(a)-Math.log10(b),exponent=Math.floor(exponentReal);
 return {delta,ratio:{mantissa:10**(exponentReal-exponent),exponent}};
}
export function scalePosition(k){if(!validTemperature(k))throw new RangeError('Invalid temperature');return k<.001?{fraction:0,below:true,zero:k===0}:{fraction:(Math.log10(k)+3)/15,below:false,zero:false}}

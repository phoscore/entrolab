// Isolated two-lump teaching model. Constant capacities J/K, conductance W/K.
export const THERMAL_LIMITS=Object.freeze({temperature:Object.freeze([250,600]),capacity:Object.freeze([1,1e6]),conductance:Object.freeze([.001,1000]),time:Object.freeze([0,1e12])});
export const THERMAL_DEFAULT=Object.freeze({a:350,b:290,ca:1000,cb:1000,g:10});
export const THERMAL_PRESETS=Object.freeze({equal:THERMAL_DEFAULT,unequal:Object.freeze({a:350,b:290,ca:1000,cb:3000,g:10}),balanced:Object.freeze({a:320,b:320,ca:1000,cb:1000,g:10})});
function bounded(x,[lo,hi]){return typeof x==='number'&&Number.isFinite(x)&&x>=lo&&x<=hi}
export const transferableTemperature=x=>bounded(x,THERMAL_LIMITS.temperature);
export function validateThermal(p){if(!p||typeof p!=='object')throw new TypeError('Thermal parameter object required');for(const [key,range]of [['a','temperature'],['b','temperature'],['ca','capacity'],['cb','capacity'],['g','conductance']])if(!bounded(p[key],THERMAL_LIMITS[range]))throw new RangeError('Invalid thermal parameter: '+key);return p}
// Accurate log(1+x)-x when the first-order terms in total entropy cancel.
function logRemainder(x){if(Math.abs(x)>=.001)return Math.log1p(x)-x;let term=-x*x/2,sum=term;for(let n=3;n<=12;n++){term*=-x*(n-1)/n;sum+=term}return sum}
export function thermalAt(p,time){
 validateThermal(p);if(!bounded(time,THERMAL_LIMITS.time))throw new RangeError('Time must be finite and in [0,1e12] seconds');
 const {a,b,ca,cb,g}=p,sum=ca+cb,effective=ca*cb/sum,delta=a-b,rate=g/effective,eq=delta===0?a:(ca*a+cb*b)/sum;
 const exponent=-rate*time,relaxation=Math.exp(exponent),fraction=-Math.expm1(exponent),q=effective*delta*fraction;
 const ta=fraction===1?eq:a-q/ca,tb=fraction===1?eq:b+q/cb;
 const remainingDelta=delta*relaxation,equilibrium=delta===0;
 const xa=-q/(ca*a),xb=q/(cb*b),sa=ca*Math.log1p(xa),sb=cb*Math.log1p(xb);
 // No positivity clamp: retain a numerically stable evaluation of the actual sum.
 const entropy=q*delta/(a*b)+ca*logRemainder(xa)+cb*logRemainder(xb);
 const energy=ca*ta+cb*tb,initialEnergy=ca*a+cb*b,power=g*remainingDelta,production=g*remainingDelta**2/(ta*tb);
 return {time,ta,tb,eq,tau:1/rate,q,power,energy,initialEnergy,energyError:energy-initialEnergy,sa,sb,entropy,production,remainingDelta,equilibrium};
}

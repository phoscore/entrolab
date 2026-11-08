// Presentation/transfer policy only. The physical model and its strict bounds stay unchanged.
import {THERMAL_LIMITS,transferableTemperature} from './thermal-physics.mjs';

// Compare decimal input text without first rounding it to binary64. This prevents an
// explicitly out-of-range value such as 249.99999999999999999 being rounded into range.
function decimalParts(text){
 const m=String(text).trim().match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:e([+-]?\d+))?$/i);
 if(!m)return null;
 const fraction=m[3]??m[4]??'',digits=((m[2]??'')+fraction).replace(/^0+/,'');
 return {sign:digits?(m[1]==='-'?-1:1):0,order:Number(m[5]??0)-fraction.length+digits.length,digits};
}
function compareDecimal(a,b){
 if(a.sign!==b.sign)return Math.sign(a.sign-b.sign);
 if(!a.sign)return 0;
 if(a.order!==b.order)return Math.sign(a.order-b.order)*a.sign;
 const n=Math.max(a.digits.length,b.digits.length),x=a.digits.padEnd(n,'0'),y=b.digits.padEnd(n,'0');
 return (x===y?0:x>y?1:-1)*a.sign;
}
function sourceInRange(source){
 if(!source||typeof source.value!=='string'||!Number.isFinite(Number(source.value)))return false;
 const bounds=source.unit==='celsius'?['-23.15','326.85']:source.unit==='kelvin'?['250','600']:null;
 const p=decimalParts(source.value);
 return !!bounds&&!!p&&compareDecimal(p,decimalParts(bounds[0]))>=0&&compareDecimal(p,decimalParts(bounds[1]))<=0;
}
export function thermalTransferCandidate(kelvin,source=null){
 if(typeof kelvin!=='number'||!Number.isFinite(kelvin))return null;
 if(source&&!sourceInRange(source))return null;
 if(transferableTemperature(kelvin))return {temperature:kelvin,rounded:false};
 // Only a verified in-range Celsius source may correct conversion roundoff.
 // Two EPSILON-scaled magnitudes cover parsing of c/273.15 and their addition.
 // The source fields are never changed; any canonical boundary draft is explained.
 if(source?.unit!=='celsius')return null;
 for(const boundary of THERMAL_LIMITS.temperature){
  const tolerance=2*Number.EPSILON*Math.max(273.15,Math.abs(Number(source.value)),boundary);
  if(Math.abs(kelvin-boundary)<=tolerance)return {temperature:boundary,rounded:true};
 }
 return null;
}

export function formatThermalTime(seconds,locale='de-DE'){
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid display time');
 const scientific=seconds!==0&&(seconds<.001||seconds>=1e6);
 return new Intl.NumberFormat(locale,{maximumSignificantDigits:4,useGrouping:false,notation:scientific?'scientific':'standard'}).format(seconds);
}

// At most 65 exact analytical sample times. Preserve the early transient when a
// long linear time axis would otherwise draw a fictitious slow first segment.
export function thermalCurveTimes(tau,horizon){
 if(!Number.isFinite(tau)||tau<=0||!Number.isFinite(horizon)||horizon<=0||horizon>THERMAL_LIMITS.time[1])throw new RangeError('Invalid curve window');
 if(horizon<=8*tau)return Array.from({length:65},(_,i)=>horizon*i/64);
 const early=8*tau,times=Array.from({length:49},(_,i)=>early*i/48);
 for(let i=1;i<16;i++)times.push(early+(horizon-early)*i/16);
 times.push(horizon);
 return [...new Set(times)];
}

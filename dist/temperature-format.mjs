import {locale} from './i18n.mjs';
// More precision than the narrowest displayed table band; no solver/input rounding.
export function comparisonNumber(value){
 if(typeof value!=='number'||!Number.isFinite(value))return '—';
 const magnitude=Math.abs(value);
 return new Intl.NumberFormat(locale(),{maximumSignificantDigits:15,useGrouping:false,notation:magnitude!==0&&(magnitude<.001||magnitude>=1e6)?'scientific':'standard'}).format(Object.is(value,-0)?0:value);
}

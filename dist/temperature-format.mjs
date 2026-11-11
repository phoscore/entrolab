import {locale} from './i18n.mjs';
function formatComparison(value,language){
 if(typeof value!=='number'||!Number.isFinite(value))return '—';
 const magnitude=Math.abs(value);
 return new Intl.NumberFormat(language,{maximumSignificantDigits:15,useGrouping:false,notation:magnitude!==0&&(magnitude<.001||magnitude>=1e6)?'scientific':'standard'}).format(Object.is(value,-0)?0:value);
}
export const comparisonNumber=value=>formatComparison(value,locale());
// Reuse the display rounding for comparison only, without parsing localized UI.
export const comparisonDisplayValue=value=>Number(formatComparison(value,'en-GB'));

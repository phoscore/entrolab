import {de,en} from './translations.mjs';
export {de,en};
const listeners=new Set();
export const missingKeys=new Set();
export function chooseLanguage(preferred,stored){return stored==='de'||stored==='en'?stored:String(preferred??'de').toLowerCase().startsWith('en')?'en':'de'}
function initial(){if(!globalThis.document)return 'de';let stored;try{stored=globalThis.localStorage?.getItem('entrolab-language')}catch{}return chooseLanguage(globalThis.navigator?.language,stored)}
let current=initial();
export const language=()=>current;
export const locale=()=>current==='de'?'de-DE':'en-GB';
export function t(key,values={}){if(!Object.hasOwn(de,key))missingKeys.add(key);const catalog=current==='en'?en:de;const text=Object.hasOwn(catalog,key)?catalog[key]:Object.hasOwn(de,key)?de[key]:key;return String(text).replace(/\{(\w+)\}/g,(all,name)=>Object.hasOwn(values,name)?String(values[name]):all)}
export function tx(parts,...values){return t(parts.reduce((s,p,i)=>s+(i?'{'+(i-1)+'}':'')+p,''),Object.fromEntries(values.map((v,i)=>[i,v])))}
export function translateText(text){if(!text)return text;const key=Object.hasOwn(de,text)?text:Object.keys(en).find(k=>en[k]===text);return key?t(key):text}
export function localizeTree(root=globalThis.document){if(!root?.querySelectorAll)return;for(const el of root.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);for(const attr of ['title','aria-label','placeholder','alt'])for(const el of root.querySelectorAll('[data-i18n-'+attr+']'))el.setAttribute(attr,t(el.getAttribute('data-i18n-'+attr)));if(root.documentElement)root.documentElement.lang=current}
export function setLanguage(next){if(next!=='de'&&next!=='en')return false;if(next===current)return true;current=next;try{globalThis.localStorage?.setItem('entrolab-language',current)}catch{}localizeTree();for(const fn of listeners)fn(current);return true}
export function onLanguageChange(fn){listeners.add(fn);return ()=>listeners.delete(fn)}
// Labels are a presentation layer. Never translate/overwrite live physics names.
const names=new WeakMap();
export function registerBodyLabels(bodies){for(const b of bodies)names.set(b,b.name)}
export function bodyLabel(b){if(!b)return '';if(names.get(b)!==b.name)return b.name;return b.name.split(' + ').map(name=>{if(Object.hasOwn(de,name))return t(name);const m=/^(Planet|Stern|Schwarzes Loch) (\d+)$/.exec(name);return m?t(m[1])+' '+m[2]:name}).join(' + ')}
localizeTree();

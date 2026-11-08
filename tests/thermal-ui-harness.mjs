// Small controlled DOM for the real thermal UI module; not a browser substitute.
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as physics from '../dist/thermal-physics.mjs';
import * as display from '../dist/display.mjs';
import * as view from '../dist/thermal-view.mjs';
import * as i18n from '../dist/i18n.mjs';
export function thermalHarness(){
 const elements=new Map(),events={},subscriptions=[],timers=new Map();let next=0;
 class Element{
  constructor(id='',tag=''){this.id=id;this.tagName=tag;this.value='';this.textContent='';this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.attributes={};this.handlers={};this.children=[];this.classes=new Set();this.classList={contains:x=>this.classes.has(x),toggle:(x,y)=>y?this.classes.add(x):this.classes.delete(x)}}
  get value(){return this._value}set value(v){this._value=String(v)}
  setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]}setCustomValidity(v){this.validationMessage=v}replaceChildren(...cs){this.children=cs}addEventListener(k,fn){(this.handlers[k]??=[]).push(fn)}focus(){doc.activeElement=this}click(){this.fire('click')}fire(k){const e={target:this,preventDefault(){}};for(const fn of this.handlers[k]??[])fn(e);this['on'+k]?.(e)}
 }
 const el=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const tabs=['entropy','extreme','blackhole'].map(name=>{const b=el('tab-'+name);b.dataset.tab=name;b.onclick=()=>el('entropy').classList.toggle('active',name==='entropy');return b});
 const views=['particles','thermal'].map(name=>{const b=el('view-'+name);b.dataset.entropyView=name;return b});
 const presets=['equal','unequal','balanced'].map(name=>{const b=el('preset-'+name);b.dataset.thermalPreset=name;return b});
 const doc={hidden:false,activeElement:null,getElementById:el,createElementNS:(ns,tag)=>new Element('',tag),addEventListener(k,fn){(events[k]??=[]).push(fn)},dispatchEvent(e){for(const fn of events[e.type]??[])fn(e)},querySelectorAll(q){return q==='[data-tab]'?tabs:q==='[data-entropy-view]'?views:q==='[data-thermal-preset]'?presets:[]},querySelector(q){return tabs.find(b=>q===`[data-tab=${b.dataset.tab}]`)??views.find(b=>q===`[data-entropy-view=${b.dataset.entropyView}]`)}};
 el('entropy').classes.add('active');el('thermalSpeed').value='10';el('temperatureTransferValue').value='.1';el('thermalTransferTarget').value='b';
 i18n.setLanguage('de');const window={};
 const scope=vm.createContext({...physics,...display,...view,...i18n,document:doc,window,structuredClone,Event,matchMedia:()=>({addEventListener(){}}),setTimeout(fn){timers.set(++next,fn);return next},clearTimeout:id=>timers.delete(id),onLanguageChange(fn){subscriptions.push(i18n.onLanguageChange(fn))}});
 const source=readFileSync(new URL('../dist/thermal-ui.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');new vm.Script(source).runInContext(scope);
 return {el,doc,timers,inspect:()=>window.entrolabThermal.inspect(),language:i18n.setLanguage,transfer(k){el('temperatureTransferValue').value=String(k);el('kelvinInput').value=String(k);el('kelvinInput').fire('change');el('thermalTransfer').click()},apply(p){for(const [key,id]of Object.entries({a:'thermalA',b:'thermalB',ca:'thermalCA',cb:'thermalCB',g:'thermalG'}))if(key in p)el(id).value=String(p[key]);el('thermalForm').fire('submit')},dispose(){subscriptions.forEach(fn=>fn());i18n.setLanguage('de')}};
}

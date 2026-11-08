import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as i18n from '../dist/i18n.mjs';
import * as physics from '../dist/physics.mjs';
import * as display from '../dist/display.mjs';
import * as data from '../dist/extreme-data.mjs';
import {experiment,experimentInfo} from '../dist/experiments.mjs';
import {baseline as makeBaseline,diagnostics as readDiagnostics} from '../dist/instruments.mjs';
import {predict} from '../dist/prediction.mjs';
import {checks} from '../dist/checks.mjs';
import {createSelfChecks} from '../dist/self-checks.mjs';
export function harness(module='app',reduce=false,startLanguage='de'){
 i18n.setLanguage(startLanguage);
 const elements=new Map(),frames=new Map(),events={},timeouts=[],subscriptions=[],labels=[],observers=[];let id=0,now=100,draws=0;
 class Element{
  constructor(name=''){this.id=name;this.value='';this.checked=false;this.disabled=false;this.hidden=false;this.textContent='';this.style={};this.dataset={};this.children=[];this.attributes={};this.handlers={};this.classes=new Set();this.classList={contains:x=>this.classes.has(x),toggle:(x,yes)=>yes?this.classes.add(x):this.classes.delete(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)}}
  replaceChildren(...a){this.children=a;this.value=a[0]?.value??''}append(...a){this.children.push(...a)}
  get options(){return this.children}getBoundingClientRect(){return {width:600,height:500,left:0,top:0}}
  getContext(){return context}addEventListener(k,f){(this.handlers[k]??=[]).push(f)}setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]??null}closest(){return null}setCustomValidity(v){this.validity=v;this.validationMessage=v}focus(){doc.activeElement=this}
  fire(k){this['on'+k]?.({preventDefault(){}});for(const f of this.handlers[k]??[])f({})}
 }
 const el=name=>{if(!elements.has(name))elements.set(name,new Element(name));return elements.get(name)};
 const tabs=['gravity','blackhole','extreme','science'].map(name=>{const e=new Element();e.dataset.tab=name;return e});
 const context=new Proxy({createRadialGradient(){draws++;return {addColorStop(){}}},fillText(text){labels.push(text)}},{get:(o,k)=>o[k]??(()=>{})});
 const doc={hidden:false,activeElement:null,getElementById:el,createElement:()=>new Element(),querySelectorAll:sel=>sel==='[data-tab]'?tabs:[],addEventListener(k,f){(events[k]??=[]).push(f)}};
 const motion={matches:reduce,addEventListener(k,f){this.change=f}};
 el('scenario').value='binary';el('speed').value='0';el('trails').checked=true;el('gravity').classes.add('active');el('comparisonMode').value='log';
 const window={addEventListener(){}};
 const scope=vm.createContext({...physics,...display,...data,...i18n,onLanguageChange(fn){subscriptions.push(i18n.onLanguageChange(fn))},experiment,experimentInfo,makeBaseline,readDiagnostics,predict,checks,createSelfChecks,window,structuredClone,performance,devicePixelRatio:1,document:doc,
  matchMedia:q=>q.includes('prefers-reduced-motion')?motion:{matches:false,addEventListener(){}},Option:class extends Element{constructor(text,value){super();this.textContent=text;this.value=value}},ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){observers.push(fn)}observe(){}},
  drawObject(){draws++},drawThermal(){draws++},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),setTimeout:f=>timeouts.push(f)});
 const source=readFileSync(new URL('../dist/'+(module==='app'?'app.mjs':'extreme-ui.mjs'),import.meta.url),'utf8').replace(/^import .*;\n/gm,'');new vm.Script(source).runInContext(scope);
 return {el,doc,frames,motion,labels,window,intersect(entries){for(const observer of observers)observer(entries)},get draws(){return draws},language:i18n.setLanguage,dispose(){subscriptions.forEach(f=>f());i18n.setLanguage('de')},
  tick(){const pending=[...frames.values()];frames.clear();for(const f of pending)f(now);now+=16},
  tab(name){for(const t of tabs)if(t.dataset.tab===name){if(module!=='app')el('extreme').classList.toggle('active',name==='extreme');t.fire('click')}},
  visibility(value){doc.hidden=value;for(const f of events.visibilitychange??[])f()},flush(){let n=0;while(timeouts.length){if(++n>500)throw Error('timeout loop');timeouts.shift()()}}};
}

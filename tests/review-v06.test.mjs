import test from 'node:test';
import assert from 'node:assert/strict';
import {validateState,macrostate,randomStep,arrangement,sampleArrangement,distribution,multiplicity,seededRandom,MAX_MARKERS} from '../dist/entropy.mjs';
import {initGuide} from '../dist/guide.mjs';

const consumers=[validateState,macrostate,randomStep];
test('review P3: every state consumer rejects leading, middle, trailing and entirely sparse arrays',()=>{
 for(const n of [1,2,12,32]){
  const empty=new Array(n),leading=Array(n).fill(true),trailing=Array(n).fill(false),middle=Array(n).fill(true);
  delete leading[0];delete trailing[n-1];delete middle[Math.floor(n/2)];
  for(const state of [empty,leading,trailing,middle])for(const consume of consumers)assert.throws(()=>consume(state),TypeError,consume.name+' / N='+n);
 }
});
test('review P3: real arrays are required; array-like objects, typed arrays and primitive values are rejected',()=>{
 const pretending={0:true,1:false,length:2,every:()=>true,filter:()=>[],map:()=>[]};
 for(const state of [undefined,null,true,false,2,1n,Symbol('state'),'LR',{},pretending,new Set([true,false]),new Map(),new Uint8Array([1,0]),new Float64Array([1,0]),new Boolean(true),Object.create(Array.prototype)])
  for(const consume of consumers)assert.throws(()=>consume(state),TypeError,consume.name);
});
test('review P3: inherited slots and overridden every cannot disguise missing or non-Boolean markers',()=>{
 const inherited=[true,false];delete inherited[0];Object.setPrototypeOf(inherited,Object.assign(Object.create(Array.prototype),{0:true}));
 const spoofed=[true,0];spoofed.every=()=>true;
 for(const state of [inherited,spoofed,[true,undefined],[true,null],[true,0],[true,'false'],[true,new Boolean(false)],[true,[]]])
  for(const consume of consumers)assert.throws(()=>consume(state),TypeError,consume.name);
});
test('review P3: invalid state is rejected before RNG consumption and without filling or changing any slot',()=>{
 for(const state of [new Array(2),[true,,false],[true,undefined],{length:2,every:()=>true}]){
  const before=Object.getOwnPropertyDescriptors(state);let calls=0;
  assert.throws(()=>randomStep(state,()=>{calls++;return .5}),TypeError);assert.equal(calls,0);assert.deepEqual(Object.getOwnPropertyDescriptors(state),before);
 }
 for(const state of [[],Array(33).fill(true)])for(const consume of consumers)assert.throws(()=>consume(state),RangeError);
});
test('review P3: all supported dense states and generated/sampled/stepped states remain valid, without input mutation',()=>{
 const rng=seededRandom(6);
 for(let n=1;n<=MAX_MARKERS;n++)for(let k=0;k<=n;k++){
  const state=arrangement(n,k),before=[...state];assert.equal(validateState(state),state);assert.equal(macrostate(state),k);
  const sampled=sampleArrangement(n,k,rng),stepped=randomStep(state,rng);
  assert.equal(validateState(sampled),sampled);assert.equal(macrostate(sampled),k);assert.equal(validateState(stepped),stepped);
  assert.equal(Object.keys(stepped).length,n);assert.equal(stepped.length,n);assert.deepEqual(state,before);
  assert.equal(distribution(n)[k].omega,multiplicity(n,macrostate(sampled)));
 }
});

// A focus-aware DOM adapter: hidden/disconnected nodes cannot receive focus.
// Capture runs before the navigation's existing activation/focus listeners.
function guideDOM(){
 const nodes=new Map(),docEvents={},tabs=[],links=[];let active='entropy';
 const doc={activeElement:null,getElementById:id=>nodes.get(id),querySelectorAll:q=>q==='[data-tab]'?tabs:q==='[data-explain]'?links:[],querySelector:q=>q==='[data-tab].active'?tabs.find(b=>b.dataset.tab===active):null,addEventListener(k,fn,capture){(docEvents[k]??=[]).push({fn,capture})}};
 class Element{
  constructor(id,{view=null,inside=false}={}){this.id=id;this.view=view;this.inside=inside;this.isConnected=true;this.hidden=false;this.disabled=false;this.dataset={};this.handlers={};nodes.set(id,this)}
  getClientRects(){return this.isConnected&&!this.hidden&&(!this.view||this.view===active)&&(!this.inside||glossary.open)?[{}]:[]}
  focus(){if(this.getClientRects().length&&!this.disabled)doc.activeElement=this}
  scrollIntoView(){this.scrolled=true}contains(node){return !!node?.inside}
  addEventListener(k,fn,capture=false){(this.handlers[k]??=[]).push({fn,capture})}
  fire(k='click'){const e={preventDefault(){},stopImmediatePropagation(){}};for(const capture of [true,false])for(const h of this.handlers[k]??[])if(Boolean(h.capture)===capture)h.fn(e)}
 }
 const body=new Element('body');doc.body=body;doc.activeElement=body;new Element('mainContent');
 const glossary=new Element('physicsGuide');glossary.open=false;const back=new Element('guideReturn',{inside:true});back.hidden=true;
 for(const view of ['entropy','blackhole','gravity','extreme']){
  const tab=new Element('tab-'+view);tab.dataset.tab=view;tabs.push(tab);tab.addEventListener('click',()=>{active=view;tab.focus()});
  const link=new Element('link-'+view,{view});link.dataset.explain='term-'+view;links.push(link);new Element('term-'+view,{inside:true});
 }
 const guide=initGuide(doc);
 return {doc,guide,glossary,back,node:id=>nodes.get(id),open(view='entropy'){nodes.get('link-'+view).fire()},nav(view){nodes.get('tab-'+view).focus();nodes.get('tab-'+view).fire()},escape(){for(const h of docEvents.keydown??[])h.fn({key:'Escape',stopImmediatePropagation(){}})}};
}
test('review P2: direct return and Escape restore the visible context origin; repeated close is inert',()=>{
 const a=guideDOM();for(const method of ['back','escape']){a.open();assert.equal(a.doc.activeElement.id,'term-entropy');method==='back'?a.back.fire():a.escape();assert.equal(a.doc.activeElement.id,'link-entropy');assert.equal(a.glossary.open,false);assert.equal(a.back.hidden,true);a.guide.close();assert.equal(a.doc.activeElement.id,'link-entropy')}
});
test('review P2: lab navigation clears the context before hiding its origin and preserves the new navigation focus',()=>{
 const a=guideDOM();for(const view of ['blackhole','gravity','extreme','entropy']){a.open(a.doc.querySelector('[data-tab].active').dataset.tab);a.nav(view);assert.equal(a.glossary.open,false);assert.equal(a.back.hidden,true);assert.equal(a.doc.activeElement.id,'tab-'+view);a.back.fire();a.escape();assert.equal(a.doc.activeElement.id,'tab-'+view)}
});
test('review P2: a hidden, disabled or removed origin falls back to the visible active tab, never BODY',()=>{
 for(const failure of ['hidden','disabled','isConnected']){const a=guideDOM();a.open();a.node('link-entropy')[failure]=failure!=='isConnected';a.back.fire();assert.equal(a.doc.activeElement.id,'tab-entropy');assert.equal(a.glossary.open,false)}
});
test('review P2: native glossary collapse invalidates its return context; Escape outside the glossary leaves focus alone',()=>{
 const a=guideDOM();a.open();a.glossary.open=false;a.glossary.fire('toggle');assert.equal(a.back.hidden,true);a.nav('blackhole');a.glossary.open=true;a.back.fire();assert.equal(a.doc.activeElement.id,'tab-blackhole');
 a.open('blackhole');a.node('tab-blackhole').focus();a.escape();assert.equal(a.doc.activeElement.id,'tab-blackhole');assert.equal(a.glossary.open,true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initEntropy} from '../dist/entropy-ui.mjs';
import {initGuide} from '../dist/guide.mjs';
import {setLanguage,de,en,missingKeys} from '../dist/i18n.mjs';
import {seededRandom} from '../dist/entropy.mjs';
function harness(){
 const elements=new Map(),timers=new Map(),events={},tabs=[];let next=0;
 class Element{
  constructor(id){this.id=id;this.isConnected=true;this.value='';this.dataset={};this.style={};this.children=[];this.attributes={};this.handlers={};this.classes=new Set();this.classList={contains:k=>this.classes.has(k),toggle:(k,yes)=>yes?this.classes.add(k):this.classes.delete(k)}}
  setAttribute(k,v){this.attributes[k]=v;if(k.startsWith('data-'))this.dataset[k.slice(5)]=v}getAttribute(k){return this.attributes[k]??null}getClientRects(){return [{}]}setCustomValidity(v){this.validationMessage=v}replaceChildren(...cs){this.children=cs}append(c){this.children.push(c)}querySelector(){return this.children.find(c=>c.attributes['data-current-marker']!==undefined)}querySelectorAll(){return this.children.filter(c=>c.dataset.k!==undefined)}addEventListener(k,fn){this.handlers[k]=fn}focus(){doc.activeElement=this}scrollIntoView(){}contains(node){return node===el('guide-entropy')}fire(k='click'){this['on'+k]?.();this.handlers[k]?.({preventDefault(){},stopImmediatePropagation(){}})}
 }
 const el=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const doc={hidden:false,getElementById:el,createElement:()=>new Element(),createElementNS:()=>new Element(),querySelectorAll:q=>q==='[data-tab]'?tabs:q==='[data-explain]'?[el('context')]:[],addEventListener(k,fn){events[k]=fn}};
 el('entropy').classes.add('active');el('entropyN').value='12';el('context').dataset.explain='guide-entropy';
 for(const name of ['entropy','gravity']){const tab=new Element(name);tab.dataset.tab=name;tabs.push(tab)}
 const clock={setTimer(fn){timers.set(++next,fn);return next},clearTimer(id){timers.delete(id)},rng:seededRandom(42)};
 const motion={addEventListener(k,fn){this.change=fn}},oldMotion=globalThis.matchMedia,oldObserver=globalThis.IntersectionObserver;let observe;
 globalThis.matchMedia=()=>motion;globalThis.IntersectionObserver=class{constructor(fn){observe=fn}observe(){}disconnect(){}};
 setLanguage('de');const ui=initEntropy(doc,clock);
 return {ui,el,doc,motion,timers,events,observe:seen=>observe([{isIntersecting:seen}]),tick(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())},tab(name){el('entropy').classList.toggle('active',name==='entropy');tabs.find(t=>t.dataset.tab===name).fire()},dispose(){ui.dispose();globalThis.matchMedia=oldMotion;globalThis.IntersectionObserver=oldObserver;setLanguage('de')}};
}
test('entropy UI: reset, manual macrostate, sample microstate and N bounds render consistent exact results',()=>{
 const a=harness();try{assert.equal(a.el('entropyTotal').textContent,'4.096');a.el('entropyK').value='6';a.el('entropyK').fire('input');assert.equal(a.el('entropyOmega').textContent,'924');assert.match(a.el('entropyProbability').textContent,/22,559/);const before=a.ui.inspect();a.el('entropyResample').fire();assert.equal(a.ui.inspect().k,6);assert.equal(a.ui.inspect().steps,before.steps);a.el('entropyN').value='32';a.el('entropyN').fire('input');assert.equal(a.ui.inspect().n,32);assert.equal(a.el('entropyMarkers').children.length,32);assert.equal(a.el('entropyTotal').textContent,'4.294.967.296');a.el('entropyStep').fire();assert.equal(a.ui.inspect().steps,1);a.el('entropyReset').fire();assert.equal(a.ui.inspect().k,32);assert.equal(a.ui.inspect().steps,0);assert.equal(a.el('entropyResample').disabled,true)}finally{a.dispose()}
});
test('entropy UI: invalid N draft and internal validation survive DE/EN without mutating state or focus',()=>{
 const a=harness();try{a.el('entropyN').value='33';a.el('entropyN').focus();a.el('entropyN').fire('input');const before=a.ui.inspect();setLanguage('en');assert.deepEqual(a.ui.inspect(),before);assert.equal(a.el('entropyN').value,'33');assert.equal(a.doc.activeElement.id,'entropyN');assert.equal(a.el('entropyN').validationMessage,a.el('entropyError').textContent);assert.match(a.el('entropyError').textContent,/integer/);assert.match(a.el('entropyChartNote').textContent,/at equilibrium/);assert.match(a.el('entropyChambers').getAttribute('aria-label'),/Left 12, right 0/);setLanguage('de');assert.match(a.el('entropyN').validationMessage,/ganze Zahl/);assert.equal(a.ui.inspect().n,12)}finally{a.dispose()}
});
test('entropy UI: live language switch preserves trajectory, running state and single scheduled timer',()=>{
 const a=harness();try{a.el('entropyPlay').fire();a.tick();const before=a.ui.inspect();setLanguage('en');assert.deepEqual(a.ui.inspect(),before);assert.equal(a.timers.size,1);assert.match(a.el('entropyStatus').textContent,/Mixing · step 1/);a.tick();assert.equal(a.ui.inspect().steps,2);a.el('entropyPlay').fire();assert.equal(a.timers.size,0)}finally{a.dispose()}
});
test('entropy UI: inactive tab, hidden document and offscreen chamber stop computation; no catch-up or stacked timers',()=>{
 const a=harness();try{assert.equal(a.timers.size,0);a.el('entropyPlay').fire();for(let i=0;i<10;i++){a.tab('gravity');assert.equal(a.timers.size,0);const before=a.ui.inspect().state;a.tick();assert.deepEqual(a.ui.inspect().state,before);a.tab('entropy');assert.equal(a.timers.size,1)}a.doc.hidden=true;a.events.visibilitychange();assert.equal(a.timers.size,0);a.doc.hidden=false;a.events.visibilitychange();assert.equal(a.timers.size,1);a.observe(false);assert.equal(a.timers.size,0);a.observe(true);assert.equal(a.timers.size,1);a.tick();assert.equal(a.ui.inspect().steps,1);a.el('entropyK').value='4';a.el('entropyK').fire('input');assert.equal(a.timers.size,0);assert.equal(a.ui.inspect().playing,false)}finally{a.dispose()}
});
test('entropy UI: reduced-motion change pauses the model; explicit playback remains opt-in',()=>{
 const a=harness();try{assert.equal(a.ui.inspect().playing,false);a.el('entropyPlay').fire();a.motion.change({matches:true});assert.equal(a.ui.inspect().playing,false);assert.equal(a.timers.size,0);a.el('entropyPlay').fire();a.tick();assert.equal(a.ui.inspect().steps,1)}finally{a.dispose()}
});
test('context guide: opens existing glossary, focuses the term and returns to origin without navigation',()=>{
 const a=harness();try{initGuide(a.doc);const before=a.ui.inspect();a.el('context').fire();assert.equal(a.el('physicsGuide').open,true);assert.equal(a.doc.activeElement.id,'guide-entropy');assert.equal(a.el('guideReturn').hidden,false);a.events.keydown({key:'Escape',stopImmediatePropagation(){}});assert.equal(a.el('physicsGuide').open,false);assert.equal(a.doc.activeElement.id,'context');assert.deepEqual(a.ui.inspect(),before)}finally{a.dispose()}
});
test('v0.6 messages: dynamic keys, attributes and placeholder interpolation cover both languages',()=>{
 for(const file of ['entropy-ui.mjs','guide.mjs']){const text=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');for(const [,key]of text.matchAll(/\bt\('([^'\n]+)'/g)){assert(Object.hasOwn(de,key),key);assert(Object.hasOwn(en,key),key)}}assert.deepEqual([...missingKeys],[]);
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/<title>entrolab - emptiness pro max<\/title>/);assert.match(html,/rel="icon"[^>]+favicon.svg/);assert.match(html,/id="checkRunStatus" role="status" aria-live="polite"/);assert.match(html,/id="entropyStatus" role="status" aria-live="polite"/);
});

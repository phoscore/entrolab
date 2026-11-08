import * as i18n from '../dist/i18n.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import * as physics from '../dist/physics.mjs';
import * as display from '../dist/display.mjs';
import {experiment,experimentInfo} from '../dist/experiments.mjs';
import {baseline as makeBaseline,diagnostics as readDiagnostics} from '../dist/instruments.mjs';
import {predict} from '../dist/prediction.mjs';
import {checks} from '../dist/checks.mjs';
import {createSelfChecks} from '../dist/self-checks.mjs';

// Execute the real app and physics with a small DOM/Canvas adapter, without browser dependencies.
// The frame queue is advanced explicitly; a lost RAF or invalid gradient fails the tests.
function app(){
 const elements=new Map(),frames=[];let gradients=0;
 const context=new Proxy({createRadialGradient(...args){assert(args.every(Number.isFinite),'non-finite Canvas gradient');gradients++;return {addColorStop(){}}}}, {get:(o,k)=>k in o?o[k]:()=>{}});
 class Element{
  constructor(){this.value='';this.checked=false;this.dataset={};this.style={};this.children=[];this.classList={toggle(){}}}
  replaceChildren(...children){this.children=children;this.value=children[0]?.value??''}
  getBoundingClientRect(){return {width:600,height:500,left:0,top:0}}
  getContext(){return context}
  addEventListener(){} setAttribute(){} closest(){return null}
 }
 const el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
 el('scenario').value='binary';el('speed').value='0';el('trails').checked=true;
 const window={addEventListener(){}};
 const scope=vm.createContext({...i18n,...physics,...display,experiment,experimentInfo,makeBaseline,readDiagnostics,predict,checks,createSelfChecks,window,structuredClone,devicePixelRatio:1,
  document:{getElementById:el,createElement:()=>new Element(),querySelectorAll:()=>[],addEventListener(){},activeElement:null},
  Option:class extends Element{constructor(text,value){super();this.textContent=text;this.value=value}},
  ResizeObserver:class{observe(){}},requestAnimationFrame:callback=>frames.push(callback),setTimeout(){}});
 const source=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 new vm.Script(source,{filename:'dist/app.mjs'}).runInContext(scope);
 let now=100;
 return {el,window,get gradients(){return gradients},tick(){assert.equal(frames.length,1,'exactly one pending frame');frames.shift()(now);now+=16},
  edit(index,x){el('objectList').value=window.entrolab.getBodies()[index].id;el('objectList').onchange();el('posX').value=x;el('editForm').onsubmit({preventDefault(){}})}};
}

test('animation: extreme coordinates stop safely and reset + play resumes without reload',()=>{
 const a=app();a.el('play').onclick(); // Pause while editing, as in the original browser reproduction.
 a.edit(0,1e308);a.edit(1,-1e308);
 a.el('play').onclick();a.tick();a.tick();
 assert.equal(a.el('runLabel').textContent,'NUMERISCHES LIMIT');
 assert.equal(a.el('play').disabled,true);
 assert.match(a.el('baselineNote').textContent,/Reset erforderlich/);
 a.tick(); // The fault must not feed NaN into Canvas or lose the frame queue.
 a.el('reset').onclick();assert.equal(a.el('play').disabled,false);
 assert.equal(a.el('runLabel').textContent,'SIMULATION PAUSIERT');
 const before=JSON.stringify(a.window.entrolab.getBodies()),draws=a.gradients;
 a.el('play').onclick();a.tick();a.tick();
 assert.equal(a.el('runLabel').textContent,'SIMULATION AKTIV');
 assert.notEqual(JSON.stringify(a.window.entrolab.getBodies()),before);
 assert(a.gradients>draws,'valid bodies are drawn again');
});

test('animation: overflowed camera fit remains render-safe and reset restores drawing',()=>{
 const a=app();a.el('play').onclick();a.edit(0,1e308);a.edit(1,1e308);a.el('fit').onclick();
 a.tick();a.el('reset').onclick();const draws=a.gradients;a.tick();assert(a.gradients>draws);
});

test('prediction: underflow horizons return numerical-limit, without hanging or input mutation',()=>{
 // A subprocess timeout also catches a regression to the original synchronous infinite loop.
 const moduleURL=new URL('../dist/prediction.mjs',import.meta.url).href;
 const run=spawnSync(process.execPath,['--input-type=module','-e',`
  import assert from 'node:assert/strict';
  import {predictSync} from ${JSON.stringify(moduleURL)};
  const source=[{id:1,type:'planet',m:1e-6,x:0,y:0,vx:0,vy:0,trail:[]}];
  const before=JSON.stringify(source);
  for(const h of [Number.MIN_VALUE,1e-323]){
   const r=predictSync(source,1,h);
   assert.equal(r.reason,'numerical-limit');assert.equal(r.steps,0);assert.equal(r.days,0);assert.equal(r.points.length,0);
  }
  for(const h of [1e-320,1e-6,10,60,180])assert.equal(predictSync(source,1,h).reason,'complete');
  assert.equal(JSON.stringify(source),before);
 `],{timeout:3000,encoding:'utf8'});
 assert.ifError(run.error);assert.equal(run.status,0,run.stderr);
});

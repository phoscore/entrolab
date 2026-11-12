import * as i18n from '../dist/i18n.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {C} from '../dist/physics.mjs';
import {length,scientific,number} from '../dist/display.mjs';
import * as data from '../dist/extreme-data.mjs';
import * as stellar from '../dist/stellar-examples.mjs';
// Actual UI source with controlled DOM/RAF; renderer stub isolates lifecycle and input handling.
function lab(reduce=false){const elements=new Map(),frames=new Map(),events={},tabs=[{},{}];let next=1,draws=0;const motion={matches:reduce,addEventListener(type,cb){this.change=cb}};
 const el=id=>{if(!elements.has(id))elements.set(id,{id,value:'',checked:false,disabled:false,textContent:'',dataset:{},style:{},children:[],classList:{active:false,contains(){return this.active}},append(...a){this.children.push(...a)},replaceChildren(...a){this.children=a},setAttribute(){},addEventListener(){}});return elements.get(id)};
 el('comparisonMode').value='log';
 const doc={hidden:false,getElementById:el,createElement:()=>({style:{},dataset:{},append(){},setAttribute(){}}),querySelectorAll:sel=>sel==='[data-tab]'?tabs.map(t=>({addEventListener(type,cb){t.click=cb}})):[],addEventListener(type,cb){events[type]=cb}};
 const context=vm.createContext({...i18n,C,length,scientific,number,...data,...stellar,performance,document:doc,window:{addEventListener(type,cb){events[type]=cb}},matchMedia:q=>q.includes('prefers-reduced-motion')?motion:{matches:false},drawObject(){draws++},drawStellarExample(){draws++},drawThermal(){draws++},requestAnimationFrame(cb){const id=next++;frames.set(id,cb);return id},cancelAnimationFrame(id){frames.delete(id)}});
 new vm.Script(readFileSync(new URL('../dist/extreme-ui.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'')).runInContext(context);
 return {el,frames,doc,motion,get draws(){return draws},tab(active){el('extreme').classList.active=active;tabs[0].click()},tick(now=100){const tasks=[...frames.values()];frames.clear();for(const f of tasks)f(now)},visibility(hidden){doc.hidden=hidden;events.visibilitychange()}}}
test('extreme UI: hidden lab has no RAF; active/pause/tab cycles retain at most one loop',()=>{const l=lab();assert.equal(l.frames.size,0);assert.equal(l.draws,0);l.tab(true);assert.equal(l.frames.size,1);l.tick();assert.equal(l.frames.size,1);assert(l.draws>0);l.el('extremePlay').onclick();assert.equal(l.frames.size,0);const count=l.draws;l.tick(200);assert.equal(l.draws,count);l.el('extremePlay').onclick();for(let i=0;i<20;i++){l.tab(false);assert.equal(l.frames.size,0);l.tab(true);assert.equal(l.frames.size,1)}l.tab(false);const stop=l.draws;l.tick(300);assert.equal(l.draws,stop)});
test('extreme UI: reduced motion starts paused; explicit play opts in; document hiding cancels RAF',()=>{const l=lab(true);l.tab(true);assert.equal(l.frames.size,0);assert.equal(l.el('extremePlay').textContent,'Animation starten');l.el('extremePlay').onclick();assert.equal(l.frames.size,1);l.visibility(true);assert.equal(l.frames.size,0);l.visibility(false);assert.equal(l.frames.size,1);l.motion.change();assert.equal(l.frames.size,0)});
test('extreme UI: cold presets/zero, malformed input and fast object changes preserve finite valid state',()=>{const l=lab();l.el('kelvinInput').value='.001';l.el('kelvinInput').onchange();assert.equal(l.el('celsiusReadout').textContent,'-273,149 °C');for(const v of ['','-1','Infinity','NaN','1e309']){l.el('kelvinInput').value=v;l.el('kelvinInput').onchange();assert.equal(l.el('celsiusReadout').textContent,'-273,149 °C');assert(l.el('temperatureError').textContent)}l.el('kelvinInput').value='0';l.el('kelvinInput').onchange();assert.match(l.el('zeroNote').textContent,/außerhalb/);assert.equal(l.el('celsiusReadout').textContent,'-273,150 °C');l.el('celsiusInput').value='-273.151';l.el('celsiusInput').onchange();assert.match(l.el('temperatureError').textContent,/mindestens/);const radius=l.el('extremeRadius').textContent;for(const v of ['Infinity','1e309','0']){l.el('extremeMass').value=v;l.el('extremeMass').onchange();assert.equal(l.el('extremeRadius').textContent,radius);assert(l.el('massError').textContent)}l.el('extremeMass').value='1e41';l.el('extremeMass').oninput();assert.equal(l.el('extremeMass').value,'1e41');assert.notEqual(l.el('extremeRadius').textContent,radius);l.el('kelvinInput').value='.1';l.el('kelvinInput').oninput();assert.equal(l.el('celsiusReadout').textContent,'-273,050 °C');for(let i=0;i<10;i++)for(const kind of ['white','neutron','blackhole']){l.el('extremeObject').value=kind;l.el('extremeObject').onchange();assert.equal(l.frames.size,0);assert(l.el('extremeRadius').textContent)}assert.equal(l.el('extremeMass').disabled,false)});

test('extreme UI: equivalent Celsius/Kelvin slider minimum has no false under-range warning',()=>{
 const l=lab();
 for(const event of ['oninput','onchange']){
  l.el('kelvinInput').value='.001';l.el('kelvinInput')[event]();
  const note=l.el('zeroNote').textContent;
  assert.match(note,/Logskala/);
  l.el('celsiusInput').value='-273.149';l.el('celsiusInput')[event]();
  assert.equal(l.el('zeroNote').textContent,note);
  // Only classify the UI boundary with tolerance; do not snap the conversion itself.
  assert.equal(Number(l.el('kelvinInput').value),data.celsiusToKelvin(-273.149));
  l.el('kelvinInput').value='.000999999';l.el('kelvinInput')[event]();
  assert.match(l.el('zeroNote').textContent,/Unterhalb/);
  l.el('kelvinInput').value='0';l.el('kelvinInput')[event]();
  assert.match(l.el('zeroNote').textContent,/absoluter Nullpunkt/);
 }
});

test('extreme UI: negative Kelvin underflow is rejected on input and change without state mutation',()=>{
 const l=lab();
 for(const event of ['oninput','onchange']){
  l.el('kelvinInput').value='.1';l.el('kelvinInput')[event]();
  const before=l.el('kelvinReadout').textContent,celsius=l.el('celsiusReadout').textContent;
  for(const raw of ['-1e-999','-1','-0']){
   l.el('kelvinInput').value=raw;l.el('kelvinInput')[event]();
   assert(l.el('temperatureError').textContent,raw);
   assert.equal(l.el('kelvinReadout').textContent,before);
   assert.equal(l.el('celsiusReadout').textContent,celsius);
  }
  for(const raw of ['0','.001','.1','1e-999','1e-300']){
   l.el('kelvinInput').value=raw;l.el('kelvinInput')[event]();
   assert.equal(l.el('temperatureError').textContent,'',raw);
   assert.equal(l.el('kelvinReadout').textContent,scientific(Number(raw),'K'));
  }
 }
});

test('extreme UI: restoring active mass clears stale error; invalid editing text remains rejected',()=>{
 const l=lab(),active=Number(l.el('extremeMass').value),radius=l.el('extremeRadius').textContent;
 l.el('extremeMass').value='1e42';l.el('extremeMass').oninput();
 assert(l.el('massError').textContent);assert.equal(l.el('extremeMass').value,'1e42');
 assert.equal(l.el('extremeRadius').textContent,radius);
 l.el('extremeMass').onchange();assert(l.el('massError').textContent);
 l.el('extremeQuality').value='low';l.el('extremeQuality').onchange();
 assert.equal(Number(l.el('extremeMass').value),active);
 assert.equal(l.el('massError').textContent,'');
 l.el('extremeMass').value='1e42';l.el('extremeMass').oninput();assert(l.el('massError').textContent);
 l.el('extremeMass').value='1e41';l.el('extremeMass').oninput();
 assert.equal(l.el('massError').textContent,'');assert.equal(l.el('extremeMass').value,'1e41');
 assert.notEqual(l.el('extremeRadius').textContent,radius);
});

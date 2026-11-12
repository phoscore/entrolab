import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {harness} from './ui-harness.mjs';
import {de,en,setLanguage} from '../dist/i18n.mjs';
import {initUX} from '../dist/ux.mjs';

test('review P2: all unsubmitted editor drafts and visible validation survive language and later frames',()=>{
 const a=harness();try{a.el('play').onclick();const before=JSON.stringify(a.window.entrolab.inspect());
 const drafts={mass:'0.00000400',posX:'1.2500',posY:'-2.500',velX:'42.7500',velY:'-6.1250'};
 for(const [id,v] of Object.entries(drafts))a.edit(id,v);
 a.doc.activeElement=a.el('en');a.language('en');for(let i=0;i<32;i++)a.tick();
 for(const [id,v] of Object.entries(drafts))assert.equal(a.el(id).value,v,id);assert.equal(JSON.stringify(a.window.entrolab.inspect()),before);
 a.edit('mass','');a.el('editForm').onsubmit({preventDefault(){}});a.language('de');for(let i=0;i<32;i++)a.tick();
 assert.equal(a.el('mass').value,'');assert.match(a.el('editError').textContent,/Endliche/);assert.equal(a.el('velX').value,drafts.velX);assert.equal(JSON.stringify(a.window.entrolab.inspect()),before);
 }finally{a.dispose()}
});
test('review P2: fresh EN initialization owns the placement label and subsequent placement states',()=>{
 const a=harness('app',false,'en');try{assert.equal(a.el('add').textContent,'＋ Place a body');a.el('add').onclick();assert.equal(a.el('add').textContent,'✕ Cancel placement');a.language('de');assert.equal(a.el('add').textContent,'✕ Platzieren abbrechen');a.el('add').onclick();a.language('en');assert.equal(a.el('add').textContent,'＋ Place a body')}finally{a.dispose()}
});
test('review P2: rendered distance sentence is localized, including its connecting word',()=>{
 const a=harness();try{a.language('en');assert.match(a.el('selectedDistance').textContent,/1 AU from Star B/);assert(!a.el('selectedDistance').textContent.includes(' zu '));a.language('de');assert.match(a.el('selectedDistance').textContent,/zu Stern B/)}finally{a.dispose()}
});
test('review P2: translated BH custom validity and visible error stay synchronized without accepting input',()=>{
 const a=harness();try{a.tab('blackhole');const radius=a.el('bhRadius').textContent;a.el('bhMass').value='1e42';a.el('bhMass').onchange();for(const language of ['en','de','en']){a.language(language);assert.equal(a.el('bhMass').validationMessage,a.el('bhMassError').textContent);assert.equal(a.el('bhMass').value,'1e42');}a.language('de');assert.equal(a.el('bhRadius').textContent,radius);a.el('bhMass').value='5.9722e24';a.el('bhMass').onchange();assert.equal(a.el('bhMass').validationMessage,'');assert.equal(a.el('bhMassError').textContent,'')}finally{a.dispose()}
});
test('review P3: explicitly choosing the already active language writes storage, without a redundant render',()=>{
 const source=readFileSync(new URL('../dist/i18n.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');const writes=[];const scope=vm.createContext({de,en,navigator:{language:'de-DE'},document:{querySelectorAll:()=>[],documentElement:{}},localStorage:{getItem(){return null},setItem(k,v){writes.push([k,v])}}});new vm.Script(source+";let calls=0;onLanguageChange(()=>calls++);setLanguage('de');if(calls!==0)throw Error('redundant callback');").runInContext(scope);assert.deepEqual(writes,[['entrolab-language','de']]);
});
test('review P2: navigation keeps the new tab focused; direct exit and Escape restore the focus button',()=>{
 const elements=new Map(),events={};const doc={activeElement:null,defaultView:{dispatchEvent(){}},addEventListener(k,f){events[k]=f},getElementById:el,querySelectorAll:q=>q==='[data-focus]'?[el('gravityFocus')]:q==='[data-tab]'?[el('extremeTab')]:[]};
 function el(id){if(!elements.has(id))elements.set(id,{id,hidden:true,dataset:id==='gravityFocus'?{focus:'gravity'}:{tab:'extreme'},classList:{add(){},remove(){}},setAttribute(){},handlers:{},addEventListener(k,f){this.handlers[k]=f},focus(){doc.activeElement=this},click(){this.handlers.click()}});return elements.get(id)}doc.body=el('body');const u=initUX(doc);try{el('gravityFocus').click();el('extremeTab').focus();el('extremeTab').click();assert.equal(doc.activeElement.id,'extremeTab');el('gravityFocus').click();u.exit();assert.equal(doc.activeElement.id,'gravityFocus');el('gravityFocus').click();events.keydown({key:'Escape'});assert.equal(doc.activeElement.id,'gravityFocus')}finally{u.dispose();setLanguage('de')}
});
test('review P2: backing-store rounding preserves the exact CSS coordinate mapping at fractional sizes/DPR',()=>{
 const source=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8').match(/^function resizeCanvas\(c\).*$/m)[0];
 for(const dpr of [1,1.25,2,3])for(const [width,height] of [[320.5,370.25],[319.75,551.5]]){let transform;const ctx={setTransform(...v){transform=v}},canvas={width:0,height:0,getContext:()=>ctx,getBoundingClientRect:()=>({width,height})};const r=vm.runInNewContext(source+';resizeCanvas(canvas)',{canvas,devicePixelRatio:dpr});assert.equal(r.w,width);assert.equal(r.h,height);assert.equal(transform[0],canvas.width/width);assert.equal(transform[3],canvas.height/height);assert(canvas.width<=Math.round(width*2))}
});

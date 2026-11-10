import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {creaturePolicy,createCreatureMachine,REACTION_COOLDOWN,CREATURE_CONTEXTS,validMode} from '../dist/creature-policy.mjs';
import {de,en} from '../dist/i18n.mjs';
test('creature: reduced motion and still retain a static observer; off/hidden/offscreen/edit/focus suppress it',()=>{
 assert.deepEqual(creaturePolicy({}),{visible:true,moving:true});
 for(const props of [{mode:'still'},{reduced:true},{mode:'still',reduced:true}])assert.deepEqual(creaturePolicy(props),{visible:true,moving:false});
 for(const props of [{mode:'off'},{hidden:true},{seen:false},{editing:true},{focus:true}])assert.deepEqual(creaturePolicy(props),{visible:false,moving:false});
});
test('creature: rapid actions and context changes cannot bypass the independent one-minute cooldown',()=>{
 let now=0;const m=createCreatureMachine(()=>now),sync=context=>m.synchronize({context,mode:'subtle'});
 sync('gravity');assert(m.react(true));assert.equal(m.inspect().phase,'peek');m.finish();
 for(let i=0;i<80;i++){now+=500;sync(CREATURE_CONTEXTS[i%CREATURE_CONTEXTS.length]);assert.equal(m.react(),false)}
 now=REACTION_COOLDOWN-1;assert.equal(m.react(),false);now++;assert(m.react());assert.equal(m.inspect().phase,'react');assert.equal(m.inspect().reactions,2);
});
test('creature: suspension cancels current work; reappearance never queues or resumes a reaction',()=>{
 let now=10;const m=createCreatureMachine(()=>now);m.synchronize({context:'thermal',mode:'subtle'});m.react();
 m.synchronize({context:'thermal',mode:'subtle',hidden:true});assert.equal(m.inspect().phase,'hidden');
 now+=5000;m.synchronize({context:'thermal',mode:'subtle'});assert.equal(m.inspect().phase,'idle');assert.equal(m.inspect().reactions,1);assert.equal(m.react(),false);
 m.synchronize({context:'thermal',mode:'off'});m.finish();assert.equal(m.inspect().phase,'hidden');
});
test('creature: quiet changes cancel motion, keep no delayed tasks, and do not mutate supplied state',()=>{
 const m=createCreatureMachine(()=>0),input={context:'markers',mode:'subtle'};m.synchronize(input);m.react();
 m.synchronize({...input,reduced:true});assert.equal(m.inspect().phase,'idle');assert.equal(m.react(),false);
 m.synchronize({...input,mode:'still'});assert.equal(m.react(),false);assert.deepEqual(input,{context:'markers',mode:'subtle'});
 const copy=m.inspect();copy.context='other';assert.equal(m.inspect().context,'markers');
});
test('creature: malformed preferences/context/time fail without silently changing policy',()=>{
 assert.equal(validMode(null),false);assert.equal(validMode('off'),true);
 for(const mode of [null,'full',0,{}])assert.throws(()=>creaturePolicy({mode}));
 const m=createCreatureMachine(()=>0),before=m.inspect();assert.throws(()=>m.synchronize({context:'vacuum',mode:'subtle'}));assert.deepEqual(m.inspect(),before);
 const bad=createCreatureMachine(()=>NaN);bad.synchronize({context:'gravity',mode:'subtle'});assert.throws(()=>bad.react());
});
test('creature: every context has DE/EN fiction text, all controls translated, and no physics or scheduling imports',()=>{
 for(const key of ['settings','mode','subtle','still','off','note','fiction',...CREATURE_CONTEXTS.map(id=>'comment.'+id)]){const id='k.creature.'+key;assert(de[id]&&en[id],id);assert.notEqual(de[id],id)}
 for(const file of ['creature-policy.mjs','creature-ui.mjs']){const source=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');assert.doesNotMatch(source,/from ['"].*(?:physics|entropy|prediction|instruments|checks)\.mjs/);assert.doesNotMatch(source,/(?:Math\.random|requestAnimationFrame|setTimeout|setInterval|\.innerHTML)\s*\(/)}
});

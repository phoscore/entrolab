import test from 'node:test';
import assert from 'node:assert/strict';
import {electricField} from '../dist/electric-field.mjs';
import {terms,models} from '../dist/knowledge.mjs';
import {polishB} from '../dist/polish-b-text.mjs';
import {references} from '../dist/polish-b-references.mjs';
import {extremeKinds} from '../dist/stellar-examples.mjs';

test('field follows inverse-square distance, charge sign and radial direction',()=>{
 const e=electricField(1,1,0);
 assert.equal(e.x,8.98755179);
 assert.equal(e.y,0);
 assert.equal(electricField(1,2,0).magnitude,e.magnitude/4);
 assert.equal(electricField(-1,1,0).x,-e.x);
 assert.equal(electricField(1,0,1).y,e.x);
 assert.equal(electricField(1,.19,0),null);
 assert.equal(electricField(0,1,0).magnitude,0);
 assert.throws(()=>electricField(NaN,0,0),RangeError);
});
test('the simple explanations and observing references cover all registry entries',()=>{
 for(const [type,list] of [['term',terms],['model',models]])for(const {id} of list){
  const copy=polishB['polishB.'+type+'.'+id];
  assert.equal(copy?.length,2,id);
  assert(copy.every(s=>s.length>40),id);
 }
 assert.deepEqual([...references.keys()],[...extremeKinds]);
});

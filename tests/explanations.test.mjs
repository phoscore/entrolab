import test from 'node:test';
import assert from 'node:assert/strict';
import {explanations,CONTEXTS,modelById,contentKeys} from '../dist/knowledge.mjs';
import {de,en} from '../dist/i18n.mjs';
import {multiplicity} from '../dist/entropy.mjs';
import {thermalAt,THERMAL_PRESETS} from '../dist/thermal-physics.mjs';
import {blackHole} from '../dist/physics.mjs';

test('v0.8 questions: exactly one closed-by-default question and explicit control per existing context',()=>{
 assert.deepEqual(explanations.map(q=>q.id),Object.keys(CONTEXTS));
 for(const q of explanations){assert.equal(q.model,CONTEXTS[q.id].model);assert(modelById[q.model]);assert(q.target);assert.equal(q.options.filter(o=>o.id===q.correct).length,1);assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);assert(Object.isFrozen(q.options));for(const key of [q.question,q.observe,q.cause,q.use,q.limit,q.quiz,q.answer,q.try,...q.options.map(o=>o.label)]){assert(contentKeys().includes(key));assert(de[key]&&en[key])}}
});
test('v0.8 questions: stated examples agree with existing independent numerical kernels',()=>{
 assert.equal(multiplicity(12,6),924n);assert.equal(multiplicity(12,12),1n);
 const equal=thermalAt(THERMAL_PRESETS.balanced,10);assert.equal(equal.power,0);assert.equal(equal.production,0);assert.equal(equal.entropy,0);
 const a=blackHole(1.98847e30),b=blackHole(3.97694e30);assert.equal(b.radius,2*a.radius);
});

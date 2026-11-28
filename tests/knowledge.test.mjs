import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {terms,models,sources,CONTEXTS,termById,modelById,contentKeys} from '../dist/knowledge.mjs';
import {knowledgeDE,knowledgeEN} from '../dist/knowledge-text.mjs';
import {de,en,setLanguage,t} from '../dist/i18n.mjs';

test('v0.8 knowledge: 29 canonical terms, six contexts and legacy deep-link targets are complete',()=>{
 assert.equal(terms.length,29);assert.equal(models.length,6);
 assert.deepEqual(Object.keys(CONTEXTS),['gravity','blackhole','objects','temperature','markers','thermal']);
 assert.equal(new Set(terms.map(x=>x.id)).size,terms.length);
 assert.equal(new Set(terms.map(x=>x.target)).size,terms.length);
 for(const id of ['guide-au','guide-horizon','guide-hawking','guide-universe','guide-stars','guide-entropy','guide-thermal'])assert(terms.some(t=>t.target===id),id);
 for(const term of terms){assert.equal(termById[term.id],term);assert(modelById[term.model]);assert(term.sources.length>=1)}
 for(const model of models){assert.equal(modelById[model.id],model);assert(model.equations.length);assert(model.sources.length)}
 assert.equal(CONTEXTS.objects.tab,CONTEXTS.temperature.tab);
});

test('v0.8 knowledge: every nested source is attributed, dated and safe; implementation is distinguished',()=>{
 for(const entry of [...terms,...models])for(const id of entry.sources){const s=sources[id];assert(s,id);assert(s.publisher&&s.title&&s.section);assert.match(s.checked,/^2026-11-09$/);assert(s.url.startsWith('https://')||s.kind==='implementation');if(s.kind==='implementation')assert(['physics.mjs','entropy.mjs','thermal-physics.mjs'].includes(s.url))}
 assert.equal(sources.nicer.kind,'research');assert.equal(sources['physics-code'].kind,'implementation');
});

test('v0.8 knowledge: all content uses the existing DE/EN catalogs with exact placeholder parity',()=>{
 assert.deepEqual(Object.keys(knowledgeDE).sort(),Object.keys(knowledgeEN).sort());
 const slots=s=>(s.match(/\{\w+\}/g)??[]).sort();
 for(const key of Object.keys(knowledgeDE)){
  assert.equal(de[key],knowledgeDE[key]);assert.equal(en[key],knowledgeEN[key]);
  assert(de[key].trim()&&en[key].trim(),key);assert.deepEqual(slots(de[key]),slots(en[key]));
  assert(!/<(?:script|img|a)\b/i.test(de[key]+en[key]));
 }
 for(const key of contentKeys()){assert(Object.hasOwn(de,key),key);setLanguage('en');assert.equal(t(key),en[key]);setLanguage('de');assert.equal(t(key),de[key])}
});

test('v0.8 knowledge: registry cannot be mutated by a UI consumer',()=>{
 assert.throws(()=>terms.push({}),TypeError);assert.throws(()=>terms[0].sources.push('bad'),TypeError);
 assert.throws(()=>sources.si.url='javascript:bad',TypeError);assert.throws(()=>CONTEXTS.thermal.tab='gravity',TypeError);
});

test('v0.8 knowledge: untouched engines and transfer policy remain pinned beside the authorized Phase B entropy change',()=>{
 const expected={
  'physics.mjs':'b361f3dd0c938c30b4090d19ae16aacce87286ca',
  'entropy.mjs':'2f126c850b22a51fcbe5a1d137ed70d0f691d480',
  'thermal-physics.mjs':'cac3cf6a83912218b0e4f6ab1b7dbacae6ef4fc6',
  'thermal-view.mjs':'e22285a703e4a00b40cab4d0707caa329ea11e1e',
  'extreme-data.mjs':'97273d2acef3983f62d8d0444e69920a2af890b4',
  'prediction.mjs':'2b68556547a3c73165dcefabcc6012be1df58478',
  'instruments.mjs':'39693ee345b18566f607378bc3193fbc0887c791',
  'experiments.mjs':'7d1cdd22b1fcd0cf53014df55dae6eae2d46580b'
 };
 for(const [file,sha]of Object.entries(expected)){const b=readFileSync(new URL('../dist/'+file,import.meta.url));const blob=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');assert.equal(blob,sha,file)}
});

test('v0.8 knowledge: formulas preserve distinct entropy units, strict heat limits and collision caveat',()=>{
 assert(terms.find(t=>t.id==='entropy').equation.includes('[J/K]'));
 assert(modelById.markers.equations.includes('S_model/k_B = ln Ω'));
 assert(modelById.thermal.equations.some(x=>x.includes('[W/K]')));
 assert.match(en[modelById.thermal.units],/250–600 K/);
 assert.match(en[modelById.gravity.limits],/miss grazing contacts/);
 assert.match(en[modelById.blackhole.limits],/quantum-gravity endpoint/);
});

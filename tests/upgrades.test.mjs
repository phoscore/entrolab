import test from 'node:test';
import assert from 'node:assert/strict';
import {pathIds,pathSteps} from '../dist/discovery-paths.mjs';
import {upgradeDE,upgradeEN} from '../dist/upgrade-text.mjs';
import {de,en} from '../dist/i18n.mjs';
import {readFileSync} from 'node:fs';
test('v0.8.5 discovery: seven bounded paths and three short routes use existing controls',()=>{
 assert.equal(pathIds.length,7);assert.equal(new Set(pathIds).size,7);
 for(const id of pathIds){const steps=pathSteps(id);assert(steps.length>=3&&steps.length<=5);for(const s of steps)assert(s.text&&(s.target||s.navigation))}
 for(const id of ['gravity','blackhole','markers'])assert.equal(pathSteps(id,true).length,3);
 assert.equal(pathSteps('thermal')[2].event,'thermal-stepped');assert.throws(()=>pathSteps('missing'),RangeError);
 const code=readFileSync(new URL('../dist/discovery.mjs',import.meta.url),'utf8');assert(!/Math\.random|setInterval|setTimeout|dispatchEvent|\.value\s*=/.test(code.replace('option.value=id','')));assert(!/\.click\(\)/.test(code.replace("$('helpClose').click()",'')));
});
test('v0.8.5 translations: every new route and dynamic message has DE/EN and exact placeholders',()=>{
 assert.deepEqual(Object.keys(upgradeDE).sort(),Object.keys(upgradeEN).sort());
 for(const [key,value]of Object.entries(upgradeDE)){assert.equal(de[key],value);assert.equal(en[key],upgradeEN[key]);assert(en[key].trim());assert.deepEqual((value.match(/\{\w+\}/g)??[]).sort(),(en[key].match(/\{\w+\}/g)??[]).sort())}
 for(const id of pathIds)for(const s of pathSteps(id))assert(de[s.text]&&en[s.text],s.text);
});

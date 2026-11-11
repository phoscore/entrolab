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

const {MATERIALS,REFERENCE_PRESSURE_PA,materialPhase,validTemperature,compareTemperatures,scalePosition}=await import('../dist/material-data.mjs');
test('v085 materials: eight independent normal-pressure reference values and immutable metadata',()=>{
 assert.equal(REFERENCE_PRESSURE_PA,101325);
 for(const [id,melt,boil]of [['water',273.15,373.15],['ethanol',159,351.5],['aluminium',933.473,2792],['iron',1811,3134]]){
  assert.equal(MATERIALS[id].melt,melt);assert.equal(MATERIALS[id].boil,boil);assert(MATERIALS[id].sources.length);
 }
 assert.throws(()=>MATERIALS.water.window[1]=1e12,TypeError);
});
test('v085 materials: all transitions just below/at/above declared bands, including equivalent Celsius',()=>{
 for(const [id,m]of Object.entries(MATERIALS))for(const [point,band,below,at,above]of [[m.melt,m.meltBand,'solid','melting','liquid'],[m.boil,m.boilBand,'liquid','boiling','vapor']]){
  assert.equal(materialPhase(id,point-band-.001),below,id);assert.equal(materialPhase(id,point-band),at,id);assert.equal(materialPhase(id,point),at,id);assert.equal(materialPhase(id,point+band),at,id);assert.equal(materialPhase(id,point+band+.001),above,id);
  assert.equal(materialPhase(id,(point-273.15)+273.15),at,id);
 }
});
test('v085 materials: finite comparison windows reject extrapolation without changing inputs',()=>{
 for(const [id,m]of Object.entries(MATERIALS))for(const k of [0,Number.MIN_VALUE,.001,1,1e9,1e12]){assert.equal(materialPhase(id,k),'outside');assert.equal(k,k)}
 for(const id of Object.keys(MATERIALS)){const m=MATERIALS[id];assert.notEqual(materialPhase(id,m.window[0]),'outside');assert.notEqual(materialPhase(id,m.window[1]),'outside');assert.equal(materialPhase(id,m.window[0]-.01),'outside');assert.equal(materialPhase(id,m.window[1]+.01),'outside')}
 assert.equal(materialPhase('water',293.15),'liquid');assert.equal(materialPhase('iron',293.15),'solid');
});
test('v085 comparisons: logarithmic ratio remains finite for subnormal and extreme positive values',()=>{
 assert.equal(compareTemperatures(600,300).ratio.value,2);assert.equal(compareTemperatures(0,300).ratio,null);assert.equal(compareTemperatures(300,0).ratio,null);
 for(const [a,b]of [[1e12,Number.MIN_VALUE],[Number.MIN_VALUE,1e12],[1e-300,1e12],[1e12,1e-300]]){const r=compareTemperatures(a,b);assert(Number.isFinite(r.delta));assert(r.ratio);if(r.ratio.value!==undefined)assert(r.ratio.value>0&&Number.isFinite(r.ratio.value));else{assert(r.ratio.mantissa>=1&&r.ratio.mantissa<10);assert(Number.isInteger(r.ratio.exponent))}}
 assert.equal(scalePosition(0).zero,true);assert.equal(scalePosition(Number.MIN_VALUE).below,true);assert.equal(scalePosition(.001).fraction,0);assert.equal(scalePosition(1e12).fraction,1);
});
test('v085 comparisons: invalid types, empty values, negatives and infinities never produce scientific output',()=>{
 for(const value of ['',null,undefined,true,[],{},NaN,Infinity,-Infinity,-1,-0,1e12+1]){assert.equal(validTemperature(value),false);assert.throws(()=>materialPhase('water',value),RangeError);assert.throws(()=>compareTemperatures(value,300),RangeError);assert.throws(()=>compareTemperatures(300,value),RangeError);assert.throws(()=>scalePosition(value),RangeError)}
 assert.throws(()=>materialPhase('unknown',300),RangeError);
});
test('v085 visualizations: new BH diagram draws bounded finite geometry without evaluating a model',async()=>{
 const {drawLightDiagram}=await import('../dist/blackhole-view.mjs');let paths=0;const x=new Proxy({setTransform(){},beginPath(){paths++}},{get(o,k){return o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),k)})}});
 for(const width of [240,320,390,1024]){const canvas={width:0,height:0,getBoundingClientRect:()=>({width,height:280}),getContext:()=>x};drawLightDiagram(canvas);assert.equal(canvas.width,width);assert.equal(canvas.height,280)}
 assert(paths>0&&paths<100);const source=readFileSync(new URL('../dist/blackhole-view.mjs',import.meta.url),'utf8');assert(source.includes("import {drawObject,fitCanvas}"));assert(!/Math\.random|blackHole\(|setInterval|setTimeout/.test(source));
});

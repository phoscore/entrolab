import test from 'node:test';
import assert from 'node:assert/strict';
import { C } from '../dist/physics.mjs';
import { compactObject, comparisonPosition } from '../dist/extreme-data.mjs';
import { extremeExample, extremeKinds, extremeExplanation } from '../dist/stellar-examples.mjs';
import { de,en } from '../dist/i18n.mjs';

const close=(actual,expected,tolerance)=>assert(Math.abs(actual-expected)<=tolerance,`${actual} vs ${expected}`);

test('Extreme examples preserve the three original models and classify magnetars as neutron stars',()=>{
 assert.equal(new Set(extremeKinds).size,7);
 for(const m of [1,C.sun,10*C.sun,1e41])for(const kind of ['blackhole','white','neutron']){
  assert.deepEqual(extremeExample(kind,m),compactObject(kind,m));
 }
 const magnetar=extremeExample('magnetar');
 assert.equal(magnetar.mass,compactObject('neutron').mass);
 assert.equal(magnetar.radius,12000);
 assert.equal(magnetar.period,8.69);
 assert.equal(magnetar.field,1.3e10);
 assert(!('temperature' in magnetar));
 assert.match(de[magnetar.name],/Neutronenstern/);
 assert.match(en[magnetar.name],/neutron star/);
 assert.throws(()=>extremeExample('constructor'),RangeError);
});

test('Stellar references use published values and clearly defined radius conventions',()=>{
 const brown=extremeExample('brown'), red=extremeExample('supergiant'), wr=extremeExample('wolf');
 close(brown.mass,5.580e28,1e25);
 assert.equal(brown.radius,71492000);
 assert.equal(brown.temperature,1280);
 close(brown.density,36456,120);
 close(brown.luminosity,2.55391e-5,1e-9);
 close(red.radius,5.315148e11,1);
 close(red.luminosity,88321,125);
 assert.equal(red.temperature,3600);
 close(wr.radius,6.296085e8,1);
 assert.equal(wr.temperature,140000);
 close(wr.massLoss,7.244e-6,1e-9);
 assert.equal(wr.density,null);
 for(const b of [brown,red,wr,extremeExample('magnetar')]){
  assert(!('horizon' in b));
  assert(!('photonSphere' in b));
  assert(b.sources.every(([,url])=>url.startsWith('https://')));
  assert(de[b.assumption]&&en[b.assumption]);
 }
});

test('Log radius comparison remains ordered across the entire black-hole mass range',()=>{
 for(const mass of [1,10*C.sun,1e41]){
  const radii=extremeKinds.map(kind=>extremeExample(kind,mass).radius).sort((a,b)=>a-b);
  const lo=radii[0],hi=radii.at(-1);
  close(comparisonPosition(Math.sqrt(lo*hi),'log',hi,lo),0.5,1e-12);
  for(const mode of ['log','linear']){
   const points=radii.map(r=>comparisonPosition(r,mode,hi,lo));
   assert(points.every((p,i)=>p>=0&&p<=1&&(i===0||p>=points[i-1])));
   assert.equal(points.at(-1),1);
   if(mode==='log')assert.equal(points[0],0);
  }
 }
 const ratio=extremeExample('supergiant').radius/extremeExample('neutron').radius;
 close(ratio,44292900,1);
});

test('Object descriptions in both languages distinguish all seven and the three special modes',()=>{
 const states=[
  ...extremeKinds.map(kind=>({kind,disk:true,geometry:false,pulsar:false})),
  {kind:'blackhole',disk:false},{kind:'blackhole',geometry:true},{kind:'neutron',pulsar:true},
 ];
 const keys=states.map(extremeExplanation);
 assert.equal(new Set(keys).size,10);
 for(const locale of [de,en])assert.equal(new Set(keys.map(key=>locale[key])).size,10);
 for(const key of keys)assert(de[key]?.length>35&&en[key]?.length>35,key);
});
